링크: https://www.campushanjang.kr/

```mermaid
  flowchart TB
      User([대학생 사용자])

      subgraph Client["🖥️Client Layer"]
          Web[Next.js 14<br/>TypeScript + Tailwind<br/>App Router]
      end

      subgraph Server["⚙️ Application Layer - Spring Boot 3"]
          API[REST API<br/>Controller / Service / Repository]
          Sched[Scheduler<br/>매일 자정 카드 갱신<br/>선택 카운트 리셋]
          Sec[Security<br/>JWT Filter + Rate Limiter<br/>AES-256 암호화]
      end

      subgraph Data["💾 Data Layer"]
          DB[(PostgreSQL 15<br/>+ Flyway Migration)]
      end

      subgraph External["🌐 External Services"]
          Kakao[Kakao OAuth 2.0]
          Firebase[Firebase Storage<br/>프로필 사진]
      end

      User -->|HTTPS| Web
      Web -->|JWT Bearer<br/>+ httpOnly Cookie| API
      Web -.->|OAuth Redirect| Kakao
      API -->|JPA / Hibernate| DB
      API -->|Admin SDK| Firebase
      API -.->|Token 교환| Kakao
      Sched --> DB

      classDef client fill:#dbeafe,stroke:#2563eb
      classDef server fill:#fef3c7,stroke:#d97706
      classDef data fill:#dcfce7,stroke:#16a34a
      classDef ext fill:#fce7f3,stroke:#db2777
      class Web client
      class API,Sched,Sec server
      class DB data
      class Kakao,Firebase ext
  ```

```mermaid
  sequenceDiagram
      autonumber
      participant U as 사용자
      participant F as Next.js
      participant B as Spring Boot
      participant K as Kakao Auth
      participant D as PostgreSQL

      U->>F: 카카오 로그인 클릭
      F->>K: 인증 페이지 리다이렉트
      U->>K: 로그인 & 동의
      K->>F: authorization code 전달 (callback)
      F->>B: POST /api/auth/kakao/callback {code}
      B->>K: access_token 요청 (with code)
      K-->>B: access_token 반환
      B->>K: 사용자 정보 조회
      K-->>B: {kakao_id, nickname, ...}
      B->>D: 유저 조회 or 신규 생성
      D-->>B: User entity
      B->>B: JWT 발급 (Access 15분 / Refresh 30일)
      B-->>F: {accessToken}<br/>Set-Cookie: refreshToken (httpOnly)
      F->>F: accessToken → localStorage<br/>Zustand store 업데이트
      F-->>U: /match 페이지로 이동
  ```

```mermaid
  flowchart TD
      Start([POST /api/match/select]) --> Auth{JWT 검증}
      Auth -->|실패| Err401[401 Unauthorized]
      Auth -->|성공| Lock[users 행<br/>비관적 락 획득<br/>SELECT FOR UPDATE]
      Lock --> Card{오늘 카드에<br/>포함된 후보?}
      Card -->|아니오| Err404[404 CANDIDATE_NOT_FOUND]
      Card -->|예| Idem{이미 선택한<br/>상대인가?}
      Idem -->|예| Return[차감 없이<br/>이전 결과 반환]
      Idem -->|아니오| Count{선택 횟수<br/>< 3?}
      Count -->|아니오| Err429[429 DAILY_LIMIT_EXCEEDED]
      Count -->|예| Inc[dailySelectCount++]
      Inc --> Score{매칭 점수<br/>≥ 0.75?}
      Score -->|예| Reveal[selections 저장<br/>type=CONTACT_REVEALED<br/>연락처 복호화 후 응답]
      Score -->|아니오| Note[selections 저장<br/>type=NOTE_SENT<br/>쪽지 유도 메시지]

      classDef ok fill:#dcfce7,stroke:#16a34a
      classDef err fill:#fee2e2,stroke:#dc2626
      classDef proc fill:#fef3c7,stroke:#d97706
      class Reveal,Note,Return ok
      class Err401,Err404,Err429 err
      class Lock,Inc,Score,Card,Idem,Count proc
  ```

```mermaid
  erDiagram
      USERS ||--o| USER_PHOTOS : "1:1"
      USERS ||--o{ USER_TRAITS : "1:N 내 특징"
      USERS ||--o{ IDEAL_TRAITS : "1:N 이상형 조건"
      USERS ||--o{ DAILY_CARDS : "1:N 오늘의 카드"
      USERS ||--o{ SELECTIONS : "1:N as selector"
      USERS ||--o{ REFRESH_TOKENS : "1:N"
      SELECTIONS ||--o| NOTES : "0:1 쪽지"

      USERS {
          UUID id PK
          string nickname
          enum gender
          date birth_date
          string contact_value_encrypted "AES-256"
          int daily_select_count "매일 자정 리셋"
      }
      DAILY_CARDS {
          UUID id PK
          UUID user_id FK
          UUID candidate_id FK
          double match_score
          date card_date
      }
      SELECTIONS {
          UUID id PK
          UUID selector_id FK
          UUID selected_id FK
          double match_score
          enum type "CONTACT_REVEALED|NOTE_SENT"
      }
      NOTES {
          UUID id PK
          UUID selection_id FK
          varchar content "max 50"
          enum status
      }
  ```

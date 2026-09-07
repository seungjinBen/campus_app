import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '캠퍼스한장 초대장';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Satori(ImageResponse)는 한글 폰트를 내장하지 않는다 — Google Fonts에서 필요한 글자만 서브셋 로드.
// css2에 &text=를 주면 해당 글자만 담긴 소형 폰트가 내려와 응답 속도·비용을 아낀다.
async function loadKoreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`
      )
    ).text();
    // woff2는 Satori 미지원 — truetype/opentype/woff만 사용
    const match = css.match(/src:\s*url\((.+?)\)\s*format\(['"]?(truetype|opentype|woff)['"]?\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { code: string } }) {
  let nickname: string | null = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/referral/preview?code=${encodeURIComponent(params.code)}`,
      { next: { revalidate: 3600 } }
    );
    const json = (await res.json()) as { data?: { nickname?: string | null } };
    nickname = json.data?.nickname ?? null;
  } catch {
    // 닉네임 조회 실패 시 기본 문구 — 이미지 생성 자체는 항상 성공시킨다
  }

  const title = nickname ? `${nickname}님의 초대장` : '캠퍼스한장 초대장';
  const subtitle = '사진 한 장으로 시작되는 설렘';
  const brand = '캠퍼스한장 · 세종대학교 축제 매칭';

  const font = await loadKoreanFont(title + subtitle + brand);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8F8FA',
          fontFamily: font ? 'NotoSansKR' : 'sans-serif',
        }}
      >
        {/* 초대 카드 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 48,
            border: '3px solid #FEF2F0',
            padding: '72px 120px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          }}
        >
          {/* 하트 배지 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 96,
              height: 96,
              borderRadius: 32,
              backgroundColor: '#FEF2F0',
              fontSize: 48,
              marginBottom: 40,
            }}
          >
            ❤️
          </div>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, color: '#111827' }}>
            {title}
          </div>
          <div style={{ display: 'flex', fontSize: 32, color: '#6B7280', marginTop: 24 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: '#F97066', fontWeight: 700, marginTop: 48 }}>
          {brand}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: 'NotoSansKR', data: font, style: 'normal' as const, weight: 700 as const }]
        : [],
    }
  );
}

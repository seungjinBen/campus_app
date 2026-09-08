'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import KakaoLoginButton from '@/components/auth/KakaoLoginButton';
import { CampusLogo } from '@/components/CampusLogo';
import HeroCardStack from '@/components/landing/HeroCardStack';
import StoryStep from '@/components/landing/StoryStep';
import MatchGauge from '@/components/landing/MatchGauge';
import MockAvatar from '@/components/landing/MockAvatar';
import { getProfileComplete } from '@/lib/api/user';
import { ChevronDown, EyeOff, Heart, Loader2, Lock, ShieldCheck } from 'lucide-react';

// 스텝 1 미니 카드 그리드 — 파스텔 톤 + 톤 매칭 아바타 실루엣
const MINI_TILES = [
  { gradient: 'from-rose-100 to-rose-50', accent: 'text-rose-300' },
  { gradient: 'from-sky-100 to-sky-50', accent: 'text-sky-300' },
  { gradient: 'from-amber-100 to-amber-50', accent: 'text-amber-300' },
  { gradient: 'from-emerald-100 to-emerald-50', accent: 'text-emerald-300' },
  { gradient: 'from-violet-100 to-violet-50', accent: 'text-violet-300' },
  { gradient: 'from-stone-100 to-stone-50', accent: 'text-stone-300' },
];

// 스토리 섹션 시작을 표시하는 악센트 바 — 번호 대신 영역 구분
function SectionBar() {
  return <div className="w-10 h-[3px] rounded-full bg-brand-rose/50 mb-3" aria-hidden="true" />;
}

export default function SplashPage() {
  const router = useRouter();
  // LCP 최적화 — 비로그인 방문자(랜딩의 주 대상)는 인증 체크를 기다리지 않고 즉시 콘텐츠를 본다.
  // 토큰이 있는 유저에게만 리다이렉트 오버레이를 띄운다 (첫 페인트가 하이드레이션에 묶이지 않도록)
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    // 초대 링크 ?ref= 캡처 — 가입(카카오 콜백) 시 백엔드에 전달 (useSearchParams 대신 window 사용 — Suspense 요구 회피)
    const refCode = new URLSearchParams(window.location.search).get('ref');
    if (refCode) localStorage.setItem('refCode', refCode);

    // 토큰은 메모리에만 있으므로(새로고침 시 소실) 로그인 힌트 플래그로 판단 —
    // 실제 인증은 아래 API 호출이 401 → refresh 쿠키로 검증한다
    const hasSession = localStorage.getItem('hasSession');
    if (!hasSession) return;
    setIsRedirecting(true);
    getProfileComplete()
      // 미완성 유저는 학생인증(1단계)부터 — 이미 인증된 경우 verify 페이지가 profile로 넘겨줌
      .then(({ complete }) => router.replace(complete ? '/match' : '/onboarding/verify'))
      .catch(() => setIsRedirecting(false));
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col bg-brand-cream">
      {/* 로그인 유저 리다이렉트 중 오버레이 */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[60] bg-brand-cream flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-rose" />
        </div>
      )}
      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto pb-36">

        {/* ── ① HERO ─────────────────────────────────── */}
        <section className="min-h-[92dvh] flex flex-col items-center justify-center px-6 pt-8 pb-6 relative">
          {/* 시즌 뱃지 */}
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-brand-rose/25 text-xs font-medium text-brand-rose bg-brand-rose-light mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-rose inline-block" />
            2026 세종대학교 가을축제
          </span>

          <div className="flex items-center gap-2 mb-8">
            <CampusLogo size={36} />
            <h1 className="text-xl font-bold text-brand-dark tracking-tight">캠퍼스한장</h1>
          </div>

          {/* 인터랙티브 카드 스택 */}
          <HeroCardStack />

          {/* 메인 카피 */}
          <div className="text-center mt-9">
            <p className="text-2xl font-bold text-brand-dark leading-snug tracking-tight">
              사진 한 장으로
              <br />
              시작되는 설렘
            </p>
            <p className="text-sm text-brand-mid mt-3 leading-relaxed">
              당신이 누군가의{' '}
              <span className="relative inline-block font-semibold text-brand-dark">
                <span className="relative z-10">이상형</span>
                <span className="absolute inset-x-0 bottom-0 h-[0.55em] bg-yellow-300/70 rounded-sm" />
              </span>
              이라면, 연락처가 바로 열려요
            </p>
          </div>

          {/* 스크롤 유도 */}
          <ChevronDown
            className="h-5 w-5 text-brand-light absolute bottom-4 animate-bounce motion-reduce:animate-none"
            aria-hidden="true"
          />
        </section>

        {/* ── ② 스텝 1: 카드 도착 ─────────────────────── */}
        <StoryStep>
          <SectionBar />
          <h2 className="text-lg font-bold text-brand-dark leading-snug">
            매일 자정, 새로운 카드
            <br />
            10장이 도착해요
          </h2>
          <div className="grid grid-cols-3 gap-2 mt-5">
            {MINI_TILES.map(({ gradient, accent }) => (
              <div
                key={gradient}
                className={`aspect-[3/4] rounded-xl bg-gradient-to-b ${gradient} flex items-center justify-center shadow-card`}
                aria-hidden="true"
              >
                <MockAvatar className={`w-12 h-12 ${accent}`} />
              </div>
            ))}
          </div>
        </StoryStep>

        {/* ── ③ 스텝 2: 희소한 선택 ───────────────────── */}
        <StoryStep>
          <SectionBar />
          <h2 className="text-lg font-bold text-brand-dark leading-snug">
            아껴 쓰는 선택이라,
            <br />한 번 한 번이 진심이에요
          </h2>
          <p className="text-sm text-brand-mid mt-2 leading-relaxed">
            무한 스와이프는 없어요. 선택 기회가 한정되어 있어
            <br />
            서로가 더 신중하고, 더 설레게 돼요.
          </p>
          <div className="mt-5 bg-white rounded-2xl border border-brand-sand shadow-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-brand-rose fill-brand-rose/20" />
              <span className="text-sm text-brand-dark font-medium">오늘의 선택</span>
            </div>
            <button
              type="button"
              tabIndex={-1}
              className="px-4 py-2 rounded-full bg-brand-dark text-white text-sm font-semibold pointer-events-none"
              aria-hidden="true"
            >
              선택 →
            </button>
          </div>
        </StoryStep>

        {/* ── ④ 스텝 3: 75% 게이지 (하이라이트) ─────────── */}
        <StoryStep>
          <SectionBar />
          <h2 className="text-lg font-bold text-brand-dark leading-snug">
            이상형 일치율 75%를 넘으면
            <br />
            연락처가 바로 열려요
          </h2>
          <p className="text-sm text-brand-mid mt-2 leading-relaxed">
            아직 부족하다면 50자 쪽지로 먼저 마음을 전해요.
          </p>
          <div className="mt-5">
            <MatchGauge />
          </div>
        </StoryStep>

        {/* ── ⑤ 스텝 4: AI 학생인증 ───────────────────── */}
        <StoryStep>
          <SectionBar />
          <h2 className="text-lg font-bold text-brand-dark leading-snug">
            AI가 학생증을 확인해요
          </h2>
          <p className="text-sm text-brand-mid mt-2 leading-relaxed">
            세종대 학생앱 화면 한 장이면 몇 초 만에 인증 끝.
            <br />
            확인된 세종대 학생만 만날 수 있어요.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {['캡처 올리기', 'AI 확인', '인증 완료'].map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-1 bg-white rounded-xl border border-brand-sand shadow-card px-2 py-3 text-center">
                  <p className="text-[11px] text-brand-dark font-medium whitespace-nowrap">{step}</p>
                </div>
                {i < 2 && <span className="text-brand-light text-xs flex-shrink-0">→</span>}
              </div>
            ))}
          </div>
        </StoryStep>

        {/* ── ⑥ 신뢰 배너 ─────────────────────────────── */}
        <StoryStep className="pb-6">
          <div className="bg-white rounded-2xl border border-brand-sand shadow-card p-5 flex flex-col gap-4">
            <p className="text-sm font-bold text-brand-dark">안심하고 써도 되는 이유</p>
            <div className="flex flex-col gap-3">
              {[
                { icon: Lock, text: '연락처는 암호화되어 저장돼요' },
                { icon: EyeOff, text: '일치율 미달이면 누구에게도 공개되지 않아요' },
                { icon: ShieldCheck, text: 'AI 학생인증으로 세종대 학생만 가입해요' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-rose/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-brand-rose" />
                  </div>
                  <p className="text-sm text-brand-mid">{text}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-brand-sand pt-3 text-center">
              <p className="text-xs text-brand-mid">
                지난 봄 시즌, <span className="font-bold text-brand-rose">226명</span>이 함께했어요
              </p>
            </div>
          </div>
        </StoryStep>
      </div>

      {/* ── ⑦ 하단 고정 CTA ──────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pt-4 pb-7 flex flex-col items-center gap-3 bg-white border-t border-brand-sand shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
        <label className="flex items-start gap-2.5 w-full max-w-xs cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 flex-shrink-0 accent-brand-rose cursor-pointer"
          />
          <span className="text-xs text-brand-mid leading-snug">
            이상형 일치 시 내 연락처가 상대방에게 공개되는 것에 동의합니다{' '}
            <span className="text-brand-rose font-medium">(필수)</span>
          </span>
        </label>
        <KakaoLoginButton disabled={!agreed} />
      </div>
    </main>
  );
}

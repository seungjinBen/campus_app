'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import KakaoLoginButton from '@/components/auth/KakaoLoginButton';
import { CampusLogo } from '@/components/CampusLogo';
import { getProfileComplete } from '@/lib/api/user';
import { Loader2, Lock } from 'lucide-react';

const faqs = [
  {
    q: '전혀 모르는 사람이 내 번호를 갖는 게 불안하지 않나요?',
    a: '연락처는 이상형 일치율 70% 이상일 때만 공개돼요. 무작위 유포는 불가능해요.',
  },
  {
    q: '축제 부스에서 번호 고르기 부끄러웠던 적 있지 않나요?',
    a: '온라인 매칭부스로 편하게, 사진으로 느낌까지 확인하세요.',
  },
  {
    q: '텍스트만으론 상대방 느낌을 알기 어렵지 않나요?',
    a: '프로필 사진 한 장으로 첫인상을 확인하고 연결돼요.',
  },
];

export default function SplashPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsChecking(false);
        return;
      }
      try {
        const { complete } = await getProfileComplete();
        router.replace(complete ? '/match' : '/onboarding/profile');
      } catch {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-cream">
        <Loader2 className="h-6 w-6 animate-spin text-brand-rose" />
      </div>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-brand-cream overflow-hidden">

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto">

      {/* 운영 대학 뱃지 — 최상단 */}
      <div className="flex items-center justify-center gap-2 px-6 pt-5 pb-3 flex-wrap">
        <span className="text-xs text-brand-mid">현재</span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-green-200 text-xs font-medium text-green-600 bg-green-50">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          건국대학교
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-200 text-xs font-medium text-red-500 bg-red-50">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
          세종대학교
        </span>
        <span className="text-xs text-brand-mid">학생 대상 운영 중</span>
      </div>

      {/* 로고 + 브랜드명 */}
      <div className="flex flex-col items-center pt-6 pb-4 px-6">
        <CampusLogo size={96} />
        <h1 className="mt-3 text-2xl font-bold text-brand-dark tracking-tight">캠퍼스한장</h1>
        <p className="text-sm text-brand-mid mt-1">대학생의 단 한 장</p>
      </div>

      {/* 메인 카피 */}
      <div className="px-6 pb-7 text-center">
        <p className="text-xl font-bold text-brand-dark leading-snug tracking-tight">
          사진 한 장, 하루{' '}
          <span className="relative inline-block">
            <span className="relative z-10">세 번</span>
            <span className="absolute inset-x-0 bottom-0.5 h-[0.65em] bg-yellow-300/70 rounded-sm -z-0" />
          </span>
          의 설렘
          <br />
          당신이 누군가의 이상형이라면,
          <br />
          바로 연결돼요
        </p>
      </div>

      {/* 구분선 */}
      <div className="mx-6 h-px bg-brand-sand mb-6" />

      {/* FAQ 카드 목록 */}
      <div className="flex-1 px-5 space-y-3 pb-6">
        {faqs.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card border border-brand-sand">
            <div className="flex items-start gap-3 px-4 py-3.5 border-b border-brand-sand">
              <span className="flex-shrink-0 w-6 h-6 rounded-md bg-brand-dark flex items-center justify-center text-white text-[11px] font-bold">
                Q
              </span>
              <p className="text-sm text-brand-mid leading-snug pt-0.5">{item.q}</p>
            </div>
            <div className="flex items-start gap-3 px-4 py-3.5">
              <span className="flex-shrink-0 w-6 h-6 rounded-md bg-brand-rose flex items-center justify-center text-white text-[11px] font-bold">
                A
              </span>
              <p className="text-sm text-brand-dark font-semibold leading-snug pt-0.5">{item.a}</p>
            </div>
          </div>
        ))}

        {/* 보안 배너 */}
        <div className="bg-brand-rose-light border border-brand-rose/15 rounded-2xl px-5 py-4 flex items-start gap-4 mt-1">
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-brand-rose/10 flex items-center justify-center mt-0.5">
            <Lock className="w-4 h-4 text-brand-rose" />
          </div>
          <div>
            <p className="text-brand-rose font-bold text-sm mb-1">연락처 무방비 유포 걱정 없어요</p>
            <p className="text-brand-mid text-xs leading-relaxed">
              이상형 일치율 70% 이상인 사람에게만 연락처가 제공돼요.<br />
              실제 테스트 결과, 70% 일치면 정말 잘 맞는 사람이에요.
            </p>
          </div>
        </div>

        {/* 실시간 가입자 알림 */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs text-green-600 font-semibold">현재 <span className="font-bold">120+</span>명 가입 중</span>
          </div>
        </div>
      </div>

      </div>{/* 스크롤 영역 끝 */}

      {/* 하단 CTA — 고정 */}
      <div className="flex-shrink-0 px-6 pt-4 pb-8 flex flex-col items-center gap-3 bg-white border-t border-brand-sand shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
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

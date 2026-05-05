'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import KakaoLoginButton from '@/components/auth/KakaoLoginButton';
import { getProfileComplete } from '@/lib/api/user';
import { Loader2 } from 'lucide-react';

export default function SplashPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-rose" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-6 py-16 bg-brand-cream">
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-32 h-32">
          <img src="/logo.svg" alt="캠퍼스한장 로고" className="w-full h-full" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">캠퍼스한장</h1>
          <p className="text-brand-mid text-base">대학생의 단 한 장</p>
        </div>
        <div className="mt-8 space-y-2 text-center text-sm text-brand-light">
          <p>사진 한 장, 하루 세 번의 설렘</p>
          <p>당신이 누군가의 이상형이라면, 바로 연결돼요</p>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-3">
        <KakaoLoginButton />
        <p className="text-xs text-brand-light text-center leading-relaxed">
          시작하면 서비스 이용약관 및 개인정보처리방침에<br />동의한 것으로 간주합니다
        </p>
        {/* 개발용 — 실서비스 전 삭제 예정 */}
        <Link href="/auth/local" className="text-xs text-brand-light underline underline-offset-2 mt-2">
          개발자 로그인
        </Link>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { kakaoCallback } from '@/lib/api/auth';
import { getProfileComplete } from '@/lib/api/user';
import { useAuthStore } from '@/lib/store/authStore';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KakaoCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken } = useAuthStore();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get('code');
    if (!code) {
      toast.error('로그인에 실패했어요');
      router.replace('/');
      return;
    }

    const handleCallback = async () => {
      try {
        const result = await kakaoCallback(code);
        if (!result.success || !result.data?.accessToken) {
          throw new Error('토큰 없음');
        }
        setAccessToken(result.data.accessToken);

        const { complete } = await getProfileComplete();
        router.replace(complete ? '/match' : '/onboarding/profile');
      } catch {
        toast.error('로그인에 실패했어요');
        router.replace('/');
      }
    };

    handleCallback();
  }, [searchParams, router, setAccessToken]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-cream">
      <Loader2 className="h-8 w-8 animate-spin text-brand-rose" />
      <p className="text-sm text-brand-mid">로그인 중이에요...</p>
    </div>
  );
}

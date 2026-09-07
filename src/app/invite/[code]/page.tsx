'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// 초대 링크 착지 페이지 — ref 코드를 저장하고 랜딩으로 보낸다.
// 가입(카카오 콜백) 시 이 코드가 백엔드로 전달되어 리퍼럴이 기록된다.
export default function InvitePage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    if (params.code) {
      localStorage.setItem('refCode', params.code);
    }
    router.replace('/');
  }, [params.code, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-brand-cream">
      <Loader2 className="h-6 w-6 animate-spin text-brand-rose" />
    </div>
  );
}

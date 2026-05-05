'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import KakaoCallbackHandler from './KakaoCallbackHandler';

export default function KakaoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-cream">
          <Loader2 className="h-8 w-8 animate-spin text-brand-rose" />
          <p className="text-sm text-brand-mid">로그인 중이에요...</p>
        </div>
      }
    >
      <KakaoCallbackHandler />
    </Suspense>
  );
}

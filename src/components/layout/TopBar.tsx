'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
}

export default function TopBar({ title, showBack = false, right }: TopBarProps) {
  const router = useRouter();

  return (
    // 흰 바 + 경계선을 두면 PC(max-w-md 잘림)에서 배경 위에 뜬 사각형처럼 보인다 —
    // 배경색에 녹이고 위계는 여백과 타이포로만 준다
    <header className="flex items-center justify-between px-4 py-4">
      <div className="w-10">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="p-1 text-brand-mid hover:text-brand-dark transition-colors"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>
      {title && (
        <h1 className="text-sm font-semibold text-brand-dark">{title}</h1>
      )}
      <div className="w-10 flex justify-end">{right}</div>
    </header>
  );
}

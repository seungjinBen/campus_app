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
    <header className="flex items-center justify-between px-4 py-3 bg-brand-cream border-b border-brand-sand/40">
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

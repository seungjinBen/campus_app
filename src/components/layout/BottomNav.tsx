'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/match', label: '매칭', icon: Heart },
  { href: '/match/received', label: '받은 연락처', icon: Inbox },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    // 랜딩 하단 CTA와 동일한 처리 — 흰 패널/경계선 대신 배경색 페이드로,
    // PC에서 max-w-md 잘린 흰 사각형 경계가 드러나지 않게 한다
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-end max-w-md mx-auto pt-8 bg-gradient-to-t from-brand-cream via-brand-cream to-brand-cream/0">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              isActive ? 'text-brand-rose' : 'text-brand-light hover:text-brand-mid'
            )}
          >
            <Icon className={cn('h-5 w-5', isActive && 'fill-brand-rose/20')} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

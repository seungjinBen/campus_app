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
    <nav className="fixed bottom-0 left-0 right-0 flex bg-white border-t border-brand-sand/40 max-w-md mx-auto">
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

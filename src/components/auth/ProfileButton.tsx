'use client';

import { useRouter } from 'next/navigation';
import { UserCircle } from 'lucide-react';

export default function ProfileButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/settings')}
      aria-label="설정"
      className="p-1 text-brand-mid hover:text-brand-dark transition-colors"
    >
      <UserCircle className="h-6 w-6" />
    </button>
  );
}

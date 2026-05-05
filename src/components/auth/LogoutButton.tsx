'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export default function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <button
      onClick={handleLogout}
      aria-label="로그아웃"
      className="p-1 text-brand-mid hover:text-brand-dark transition-colors"
    >
      <LogOut className="h-5 w-5" />
    </button>
  );
}

'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { logout } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function useAuth() {
  const router = useRouter();
  const { accessToken, isAuthenticated, isProfileComplete, setAccessToken, setProfileComplete, logout: storeLogout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // 로그아웃 API 실패해도 로컬 상태는 초기화
    } finally {
      storeLogout();
      toast.success('로그아웃했어요');
      router.push('/');
    }
  };

  return {
    accessToken,
    isAuthenticated,
    isProfileComplete,
    setAccessToken,
    setProfileComplete,
    logout: handleLogout,
  };
}

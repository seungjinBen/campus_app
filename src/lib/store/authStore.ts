import { create } from 'zustand';

const getRoleFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
};

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  role: string | null;
  isAdmin: boolean;
  setAccessToken: (token: string) => void;
  setProfileComplete: (complete: boolean) => void;
  logout: () => void;
}

// Access Token은 메모리에만 보관한다 — localStorage 저장 시 XSS 한 번에 토큰이 통째로 유출된다.
// 새로고침 후에는 axios 인터셉터가 401 → refresh 쿠키(httpOnly)로 재발급받는 흐름.
// 'hasSession'은 랜딩 리다이렉트 UX용 로그인 여부 힌트일 뿐, 비밀 값이 아니다.
export const useAuthStore = create<AuthState>((set) => {
  // 구버전이 저장한 토큰 잔재 정리 (1회성 마이그레이션)
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
  }

  return {
    accessToken: null,
    isAuthenticated: false,
    isProfileComplete: false,
    role: null,
    isAdmin: false,

    setAccessToken: (token) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hasSession', '1');
      }
      const newRole = getRoleFromToken(token);
      set({ accessToken: token, isAuthenticated: true, role: newRole, isAdmin: newRole === 'ADMIN' });
    },

    setProfileComplete: (complete) => set({ isProfileComplete: complete }),

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hasSession');
      }
      set({ accessToken: null, isAuthenticated: false, isProfileComplete: false, role: null, isAdmin: false });
    },
  };
});

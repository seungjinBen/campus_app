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

export const useAuthStore = create<AuthState>((set) => {
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const role = storedToken ? getRoleFromToken(storedToken) : null;

  return {
    accessToken: storedToken,
    isAuthenticated: !!storedToken,
    isProfileComplete: false,
    role,
    isAdmin: role === 'ADMIN',

    setAccessToken: (token) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
      }
      const newRole = getRoleFromToken(token);
      set({ accessToken: token, isAuthenticated: true, role: newRole, isAdmin: newRole === 'ADMIN' });
    },

    setProfileComplete: (complete) => set({ isProfileComplete: complete }),

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
      set({ accessToken: null, isAuthenticated: false, isProfileComplete: false, role: null, isAdmin: false });
    },
  };
});

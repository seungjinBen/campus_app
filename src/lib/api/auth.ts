import apiClient from './axios';
import { useAuthStore } from '../store/authStore';

export const getKakaoAuthUrl = (): string => {
  return `${process.env.NEXT_PUBLIC_API_URL}/api/auth/kakao`;
};

export const kakaoCallback = async (code: string, ref?: string | null, state?: string | null) => {
  const refParam = ref ? `&ref=${encodeURIComponent(ref)}` : '';
  const stateParam = state ? `&state=${encodeURIComponent(state)}` : '';
  const response = await apiClient.get(`/api/auth/kakao/callback?code=${encodeURIComponent(code)}${refParam}${stateParam}`);
  return response.data as { success: boolean; data: { accessToken: string; isNewUser: boolean; role: string } | null; error: { code: string; message: string } | null };
};

export const logout = async () => {
  await apiClient.post('/api/auth/logout');
  useAuthStore.getState().logout();
};

export const deleteAccount = async () => {
  await apiClient.delete('/api/users/me');
  useAuthStore.getState().logout();
};

export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const response = await apiClient.post('/api/auth/refresh');
  return (response.data as { data: { accessToken: string } }).data;
};

// 개발용 로컬 로그인 — 실서비스 전 삭제 예정
export const localLogin = async (email: string, password: string, refCode?: string | null) => {
  const response = await apiClient.post('/api/auth/local/login', { email, password, refCode: refCode ?? undefined });
  return response.data as {
    success: boolean;
    data: { accessToken: string; isNewUser: boolean; role: string } | null;
    error: { code: string; message: string } | null;
  };
};

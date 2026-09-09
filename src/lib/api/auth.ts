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

// 테스트 계정 로그인 — prod는 화이트리스트 이메일만 허용. 생년월일·학과는 신규 가입 시에만 사용
export const localLogin = async (
  email: string,
  password: string,
  refCode?: string | null,
  birthDate?: string | null,
  department?: string | null,
) => {
  const response = await apiClient.post('/api/auth/local/login', {
    email,
    password,
    refCode: refCode ?? undefined,
    birthDate: birthDate || undefined,
    department: department || undefined,
  });
  return response.data as {
    success: boolean;
    data: { accessToken: string; isNewUser: boolean; role: string } | null;
    error: { code: string; message: string } | null;
  };
};

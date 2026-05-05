import apiClient from './axios';

export const getKakaoAuthUrl = (): string => {
  return `${process.env.NEXT_PUBLIC_API_URL}/api/auth/kakao`;
};

export const kakaoCallback = async (code: string) => {
  const response = await apiClient.get(`/api/auth/kakao/callback?code=${code}`);
  return response.data as { success: boolean; data: { accessToken: string; isNewUser: boolean; role: string } | null; error: { code: string; message: string } | null };
};

export const logout = async () => {
  await apiClient.post('/api/auth/logout');
  localStorage.removeItem('accessToken');
};

export const deleteAccount = async () => {
  await apiClient.delete('/api/users/me');
  localStorage.removeItem('accessToken');
};

export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const response = await apiClient.post('/api/auth/refresh');
  return (response.data as { data: { accessToken: string } }).data;
};

// 개발용 로컬 로그인 — 실서비스 전 삭제 예정
export const localLogin = async (email: string, password: string) => {
  const response = await apiClient.post('/api/auth/local/login', { email, password });
  return response.data as {
    success: boolean;
    data: { accessToken: string; isNewUser: boolean; role: string } | null;
    error: { code: string; message: string } | null;
  };
};

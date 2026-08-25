import apiClient from './axios';
import { ApiResponse, TraitKey, ContactType, Gender } from '@/lib/types/api.types';
import { UserProfile, UserTrait, IdealTrait, ProfileCompleteResponse, DeptFilterMode } from '@/lib/types/user.types';

// 생년월일·대학은 학생인증에서 자동 입력 — 요청에 포함하지 않는다
export const updateProfile = async (body: {
  nickname: string;
  gender: Gender;
  contactType: ContactType;
  contactValue: string;
}) => {
  const response = await apiClient.put('/api/users/profile', body);
  return response.data as ApiResponse<null>;
};

export const getMe = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/api/users/me');
  const data = response.data as ApiResponse<UserProfile>;
  if (!data.data) throw new Error('프로필 정보를 불러올 수 없어요');
  return data.data;
};

export const updateTraits = async (traits: UserTrait[]) => {
  const response = await apiClient.put('/api/users/traits', { traits });
  return response.data as ApiResponse<null>;
};

export const updateIdeal = async (ideals: IdealTrait[]) => {
  const response = await apiClient.put('/api/users/ideal', { ideals });
  return response.data as ApiResponse<null>;
};

// 매칭 학과 필터 변경 — 오늘 카드는 유지, 다음 자정 카드부터 적용
export const updateDeptFilter = async (mode: DeptFilterMode) => {
  const response = await apiClient.patch('/api/users/dept-filter', { mode });
  return response.data as ApiResponse<null>;
};

export const getProfileComplete = async (): Promise<ProfileCompleteResponse> => {
  const response = await apiClient.get('/api/users/profile-complete');
  const data = response.data as ApiResponse<ProfileCompleteResponse>;
  if (!data.data) throw new Error('프로필 완성 상태를 불러올 수 없어요');
  return data.data;
};

export type { TraitKey };

import apiClient from './axios';
import { ApiResponse, Gender, ContactType, TraitKey } from '@/lib/types/api.types';

export interface AdminTraitEntry {
  traitKey: TraitKey;
  traitValue: string;
  isVisible: boolean;
}

export interface AdminIdealEntry {
  traitKey: TraitKey;
  traitValue: string | null;
}

export interface AdminCreateUserRequest {
  nickname: string;
  gender: Gender;
  birthDate: string;
  university?: string;
  contactType: ContactType;
  contactValue: string;
  traits: AdminTraitEntry[];
  ideals: AdminIdealEntry[];
}

export interface AdminCreateUserResponse {
  id: string;
  nickname: string;
}

export const adminCreateUser = async (body: AdminCreateUserRequest): Promise<AdminCreateUserResponse> => {
  const response = await apiClient.post('/api/admin/users', body);
  const data = response.data as ApiResponse<AdminCreateUserResponse>;
  if (!data.data) throw new Error('유저 생성에 실패했어요');
  return data.data;
};

export const adminUploadPhoto = async (userId: string, file: File): Promise<{ photoUrl: string; thumbnailUrl: string | null }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post(`/api/admin/users/${userId}/photo`, formData);
  const data = response.data as ApiResponse<{ photoUrl: string; thumbnailUrl: string | null }>;
  if (!data.data) throw new Error('사진 업로드에 실패했어요');
  return data.data;
};

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

// ── 학생인증 검수 ──────────────────────────────────────────────

export interface VerificationQueueItem {
  verificationId: string;
  userId: string;
  nickname: string | null;
  extractedUniversity: string | null;
  extractedName: string | null;
  extractedStudentNo: string | null;
  extractedDepartment: string | null;
  extractedBirthDate: string | null;
  confidenceScore: number | null;
  decisionReason: string | null;
  createdAt: string;
}

export interface VerificationStats {
  total: number;
  autoApproved: number;
  manualApproved: number;
  needsReview: number;
  retryRequested: number;
  rejected: number;
  autoApprovalRate: number;
  avgProcessingMs: number | null;
  totalLlmCalls: number;
  retrySuccessRate: number;
}

export const adminGetVerificationQueue = async (): Promise<VerificationQueueItem[]> => {
  const response = await apiClient.get('/api/admin/verification/queue');
  const data = response.data as ApiResponse<VerificationQueueItem[]>;
  return data.data ?? [];
};

export const adminReviewVerification = async (
  verificationId: string,
  action: 'APPROVE' | 'REJECT'
) => {
  const response = await apiClient.post(`/api/admin/verification/${verificationId}/review`, { action });
  return response.data as ApiResponse<null>;
};

export const adminGetVerificationStats = async (): Promise<VerificationStats> => {
  const response = await apiClient.get('/api/admin/verification/stats');
  const data = response.data as ApiResponse<VerificationStats>;
  if (!data.data) throw new Error('통계를 불러올 수 없어요');
  return data.data;
};

import apiClient from './axios';
import { ApiResponse } from '@/lib/types/api.types';

export type VerificationResultStatus =
  | 'AUTO_APPROVED'
  | 'RETRY_REQUESTED'
  | 'NEEDS_REVIEW'
  | 'REJECTED';

export interface VerificationSubmitResult {
  status: VerificationResultStatus;
  message: string;
  university: string | null;
  department: string | null;
}

export interface VerificationStatusResult {
  status: string;
  verified: boolean;
}

export const submitVerification = async (file: File): Promise<VerificationSubmitResult> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/api/verification/submit', formData, {
    timeout: 90_000, // AI 에이전트 판정 대기 — 기본 10초로는 부족
  });
  const data = response.data as ApiResponse<VerificationSubmitResult>;
  if (!data.data) throw new Error('인증 요청에 실패했어요');
  return data.data;
};

export const getVerificationStatus = async (): Promise<VerificationStatusResult> => {
  const response = await apiClient.get('/api/verification/status');
  const data = response.data as ApiResponse<VerificationStatusResult>;
  if (!data.data) throw new Error('인증 상태를 확인할 수 없어요');
  return data.data;
};

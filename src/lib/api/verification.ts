import apiClient from './axios';
import { ApiResponse } from '@/lib/types/api.types';

export type VerificationResultStatus =
  | 'AUTO_APPROVED'
  | 'RETRY_REQUESTED'
  | 'NEEDS_REVIEW'
  | 'REJECTED';

// SEJONG_QR: 세종대 모바일 앱 My QR 캡처 (5개 항목 자동 채움)
// EVERYTIME_PROFILE: 에브리타임 '내 정보' 캡처 — 안드로이드에서 QR 캡처가 안 되는 유저용 대체 경로
export type VerificationMethod = 'SEJONG_QR' | 'EVERYTIME_PROFILE';

export interface VerificationSubmitResult {
  status: VerificationResultStatus;
  message: string;
  university: string | null;
  department: string | null;
  needsSupplementaryInfo: boolean;
}

export interface VerificationStatusResult {
  status: string;
  verified: boolean;
  needsSupplementaryInfo: boolean;
}

export interface SupplementaryInfo {
  department: string;
  birthDate: string; // YYYY-MM-DD
}

export const submitVerification = async (
  file: File,
  method: VerificationMethod
): Promise<VerificationSubmitResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('method', method);
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

// 에브리타임 경로 승인 후 학과·생년월일 보충 입력
export const submitSupplementaryInfo = async (info: SupplementaryInfo): Promise<void> => {
  await apiClient.post('/api/verification/supplementary-info', info);
};

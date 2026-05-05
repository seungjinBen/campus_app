import axios from 'axios';
import { ApiResponse } from '@/lib/types/api.types';

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiResponse<never> | undefined;
    return apiError?.error?.message ?? '알 수 없는 오류가 발생했어요';
  }
  return '네트워크 오류가 발생했어요';
}

export function getApiErrorCode(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiResponse<never> | undefined;
    return apiError?.error?.code ?? null;
  }
  return null;
}

export function getApiErrorDetail(error: unknown): Record<string, unknown> | undefined {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiResponse<never> | undefined;
    return apiError?.error?.detail;
  }
  return undefined;
}

export function getApiErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}

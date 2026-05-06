import axios from 'axios';
import { ApiResponse } from '@/lib/types/api.types';

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') return '요청 시간이 초과됐어요. 네트워크 상태를 확인하고 다시 시도해 주세요';
      return '네트워크 오류가 발생했어요. 인터넷 연결을 확인해 주세요';
    }
    const apiError = error.response.data as ApiResponse<never> | undefined;
    return apiError?.error?.message ?? '알 수 없는 오류가 발생했어요';
  }
  return '알 수 없는 오류가 발생했어요';
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

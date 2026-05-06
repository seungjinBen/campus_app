import apiClient from './axios';
import { ApiResponse } from '@/lib/types/api.types';

interface PhotoUploadResult {
  photoUrl: string;
  thumbnailUrl: string | null;
}

export const getMyPhotoUrl = async (): Promise<string | null> => {
  try {
    const response = await apiClient.get('/api/photos/me');
    const data = response.data as ApiResponse<{ photoUrl: string }>;
    return data.data?.photoUrl ?? null;
  } catch {
    return null;
  }
};

export const uploadPhoto = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<PhotoUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/api/photos/upload', formData, {
    timeout: 120_000, // 모바일 느린 네트워크 대비 2분
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  const data = response.data as ApiResponse<PhotoUploadResult>;
  if (!data.data) throw new Error('사진 업로드에 실패했어요');
  return data.data;
};

export const updateThumbnail = async (thumbnailUrl: string) => {
  const response = await apiClient.patch('/api/photos/thumbnail', { thumbnailUrl });
  return response.data as ApiResponse<null>;
};

import apiClient from './axios';
import { ApiResponse } from '@/lib/types/api.types';

export interface ReferralMe {
  code: string;
  bonusActiveToday: boolean;
}

export const getMyReferral = async (): Promise<ReferralMe> => {
  const response = await apiClient.get('/api/referral/me');
  const data = response.data as ApiResponse<ReferralMe>;
  if (!data.data) throw new Error('초대 코드를 불러올 수 없어요');
  return data.data;
};

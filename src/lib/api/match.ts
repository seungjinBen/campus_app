import apiClient from './axios';
import { ApiResponse } from '@/lib/types/api.types';
import {
  DailyCardsResponse,
  SelectResult,
  ReceivedContact,
  ReceivedNote,
  NoteRespondResult,
} from '@/lib/types/match.types';

export const getMatchCards = async (): Promise<DailyCardsResponse> => {
  const response = await apiClient.get('/api/match/cards');
  const data = response.data as ApiResponse<DailyCardsResponse>;
  return data.data ?? { cards: [], remainingSelectCount: 0, dailySelectLimit: 2 };
};

export const selectCandidate = async (candidateId: string): Promise<SelectResult> => {
  const response = await apiClient.post('/api/match/select', { candidateId });
  const data = response.data as ApiResponse<SelectResult>;
  if (!data.data) throw new Error('선택에 실패했어요');
  return data.data;
};

export const sendNote = async (selectedId: string, content: string) => {
  const response = await apiClient.post('/api/match/note', { selectedId, content });
  const data = response.data as ApiResponse<null>;
  if (!data.success) throw new Error(data.error?.message ?? '쪽지 전송에 실패했어요');
  return data;
};

export const getReceivedContacts = async (): Promise<ReceivedContact[]> => {
  const response = await apiClient.get('/api/match/received/contacts');
  const data = response.data as ApiResponse<ReceivedContact[]>;
  return data.data ?? [];
};

export const getReceivedNotes = async (): Promise<ReceivedNote[]> => {
  const response = await apiClient.get('/api/match/received/notes');
  const data = response.data as ApiResponse<ReceivedNote[]>;
  return data.data ?? [];
};

export const respondToNote = async (
  noteId: string,
  action: 'ACCEPTED' | 'REJECTED'
): Promise<NoteRespondResult> => {
  const response = await apiClient.post(`/api/match/note/${noteId}/respond`, { action });
  const data = response.data as ApiResponse<NoteRespondResult>;
  if (!data.data) throw new Error('응답에 실패했어요');
  return data.data;
};

export const resetMyDailyCards = async () => {
  await apiClient.delete('/api/admin/match/cards/today');
};

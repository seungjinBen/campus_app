import { TraitKey } from './api.types';

export interface MatchCard {
  candidateId: string;
  nickname: string;
  birthYear?: string;
  photoUrl: string;
  visibleTraits: { traitKey: TraitKey; traitValue: string }[];
  matchScore: number;
  university?: string;
}

export interface DailyCardsResponse {
  cards: MatchCard[];
  remainingSelectCount: number;
  // 유저별 동적 한도 (기본 2 + 얼리버드 + 리퍼럴, 최대 4) — "N/limit" 표시용
  dailySelectLimit: number;
}

export type SelectResultType = 'CONTACT_REVEALED' | 'NOTE_REQUIRED';

export interface SelectResult {
  type: SelectResultType;
  message: string;
  selectedId: string;
  contactType?: string;
  contactValue?: string;
}

export interface ReceivedContact {
  selectorId: string;
  nickname: string;
  photoUrl: string;
  visibleTraits: { traitKey: TraitKey; traitValue: string }[];
  selectedAt: string;
}

export type NoteStatus = 'PENDING' | 'ACCEPTED';

export interface ReceivedNote {
  noteId: string;
  status: NoteStatus;
  noteContent: string;
  sentAt: string;
  respondedAt: string | null;
  selectorId: string;
  nickname: string;
  photoUrl: string;
  visibleTraits: { traitKey: TraitKey; traitValue: string }[];
  // 수락 후에만 공개 — 거절 시 연락처 비노출이 익명 보호의 의미
  selectorContactType: string | null;
  selectorContactValue: string | null;
}

export interface NoteRespondResult {
  action: 'ACCEPTED' | 'REJECTED';
  message: string;
  selectorId?: string;
  nickname?: string;
  photoUrl?: string;
  visibleTraits?: { traitKey: TraitKey; traitValue: string }[];
  selectorContactType?: string;
  selectorContactValue?: string;
}

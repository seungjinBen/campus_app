import { TraitKey } from '@/lib/types/api.types';

export const TRAIT_LABELS: Record<TraitKey, string> = {
  HEIGHT: '키',
  ANIMAL_FACE: '동물상',
  MBTI: 'MBTI',
  HOBBY: '취미',
  MAJOR: '학과',
  DRINKING: '음주',
  SMOKING: '흡연',
  AGE_PREFERENCE: '나이',
};

export const TRAIT_PLACEHOLDERS: Record<TraitKey, string> = {
  HEIGHT: '예) 178',
  ANIMAL_FACE: '',
  MBTI: '예) ENFP',
  HOBBY: '',
  MAJOR: '예) 컴퓨터공학과',
  DRINKING: '',
  SMOKING: '',
  AGE_PREFERENCE: '',
};

export const ANIMAL_FACE_OPTIONS = ['고양이상', '강아지상', '토끼상', '여우상', '곰상', '공룡상'] as const;
export type AnimalFace = typeof ANIMAL_FACE_OPTIONS[number];

export const HOBBY_OPTIONS = ['운동', '독서', '영화', '음악', '요리', '게임'] as const;
export type Hobby = typeof HOBBY_OPTIONS[number];

export const DRINKING_OPTIONS = ['가끔', '자주', '안 함'] as const;

export const SMOKING_OPTIONS = ['비흡연', '흡연'] as const;

export const AGE_PREFERENCE_OPTIONS = ['연상', '연하', '동갑'] as const;

// 이상형 MBTI 계열 선택지
export const MBTI_IDEAL_OPTIONS = [
  { code: 'E', label: 'E계열' },
  { code: 'I', label: 'I계열' },
  { code: 'T', label: 'T계열' },
  { code: 'F', label: 'F계열' },
] as const;

// 내 특징 입력 키 (AGE_PREFERENCE는 이상형 전용이라 제외)
export const ALL_TRAIT_KEYS: TraitKey[] = [
  'HEIGHT',
  'ANIMAL_FACE',
  'MBTI',
  'HOBBY',
  'MAJOR',
  'DRINKING',
  'SMOKING',
];

// 이상형 선택 키 (AGE_PREFERENCE 포함)
export const ALL_IDEAL_KEYS: TraitKey[] = [
  'AGE_PREFERENCE',
  'HEIGHT',
  'ANIMAL_FACE',
  'MBTI',
  'HOBBY',
  'MAJOR',
  'DRINKING',
  'SMOKING',
];

// 버튼 선택형 TraitKey 목록 (텍스트 입력이 아닌 항목)
export const BUTTON_SELECT_KEYS: TraitKey[] = ['ANIMAL_FACE', 'HOBBY', 'DRINKING', 'SMOKING', 'AGE_PREFERENCE'];

export function formatTraitBadge(traitKey: TraitKey, traitValue: string): string {
  switch (traitKey) {
    case 'ANIMAL_FACE':
    case 'MBTI':
    case 'MAJOR':
      return traitValue;
    case 'SMOKING':
      return traitValue === '흡연' ? '흡연자' : '비흡연자';
    default:
      return `${TRAIT_LABELS[traitKey]} ${traitValue}`;
  }
}

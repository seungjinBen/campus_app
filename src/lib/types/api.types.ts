export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    detail?: Record<string, unknown>;
  } | null;
}

export type TraitKey =
  | 'HEIGHT'
  | 'ANIMAL_FACE'
  | 'MBTI'
  | 'HOBBY'
  | 'MAJOR'
  | 'DRINKING'
  | 'SMOKING'
  | 'AGE_PREFERENCE';

export type Gender = 'MALE' | 'FEMALE';
export type ContactType = 'INSTAGRAM' | 'PHONE';

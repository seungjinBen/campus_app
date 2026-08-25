import { TraitKey, Gender, ContactType } from './api.types';

export type DeptFilterMode = 'ALL' | 'SAME_ONLY' | 'EXCLUDE_SAME';

export interface UserProfile {
  id: string;
  nickname: string;
  gender: Gender;
  birthDate: string;
  university: string | null;
  contactType: ContactType;
  contactValue: string;
  verifiedDepartment: string | null;
  deptFilterMode: DeptFilterMode;
}

export interface UserTrait {
  traitKey: TraitKey;
  traitValue: string;
  isVisible: boolean;
}

export interface IdealTrait {
  traitKey: TraitKey;
  traitValue: string | null;
}

export interface ProfileCompleteResponse {
  complete: boolean;
  missing: string[];
}

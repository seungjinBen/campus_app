import { TraitKey, Gender, ContactType } from './api.types';

export interface UserProfile {
  id: string;
  nickname: string;
  gender: Gender;
  birthDate: string;
  university: string | null;
  contactType: ContactType;
  contactValue: string;
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

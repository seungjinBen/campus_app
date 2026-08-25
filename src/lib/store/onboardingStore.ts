import { create } from 'zustand';
import { UserTrait, IdealTrait } from '@/lib/types/user.types';
import { ContactType, Gender } from '@/lib/types/api.types';

// EOT-safe draft type — all optional fields are explicitly typed as T | undefined
// 생년월일·대학은 학생인증에서 자동 입력되므로 draft에 없음
interface ProfileDraft {
  nickname?: string | undefined;
  gender?: Gender | undefined;
  contactType?: ContactType | undefined;
  contactValue?: string | undefined;
}

interface OnboardingState {
  verified: boolean;
  profileDraft: ProfileDraft | null;
  traitsDraft: UserTrait[] | null;
  idealDraft: IdealTrait[] | null;
  currentStep: 1 | 2 | 3 | 4 | 5;
  photoUploaded: boolean;
  setVerified: (verified: boolean) => void;
  setProfileDraft: (data: ProfileDraft) => void;
  setTraitsDraft: (data: UserTrait[]) => void;
  setIdealDraft: (data: IdealTrait[]) => void;
  setStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  setPhotoUploaded: (uploaded: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  verified: false,
  profileDraft: null,
  traitsDraft: null,
  idealDraft: null,
  currentStep: 1,
  photoUploaded: false,

  setVerified: (verified) => set({ verified }),
  setProfileDraft: (data) => set({ profileDraft: data }),
  setTraitsDraft: (data) => set({ traitsDraft: data }),
  setIdealDraft: (data) => set({ idealDraft: data }),
  setStep: (step) => set({ currentStep: step }),
  setPhotoUploaded: (uploaded) => set({ photoUploaded: uploaded }),

  reset: () =>
    set({
      verified: false,
      profileDraft: null,
      traitsDraft: null,
      idealDraft: null,
      currentStep: 1,
      photoUploaded: false,
    }),
}));

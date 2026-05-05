import { create } from 'zustand';
import { UserTrait, IdealTrait } from '@/lib/types/user.types';
import { ContactType, Gender } from '@/lib/types/api.types';

// EOT-safe draft type — all optional fields are explicitly typed as T | undefined
interface ProfileDraft {
  nickname?: string | undefined;
  gender?: Gender | undefined;
  birthDate?: string | undefined;
  university?: string | undefined;
  contactType?: ContactType | undefined;
  contactValue?: string | undefined;
}

interface OnboardingState {
  profileDraft: ProfileDraft | null;
  traitsDraft: UserTrait[] | null;
  idealDraft: IdealTrait[] | null;
  currentStep: 1 | 2 | 3 | 4;
  photoUploaded: boolean;
  setProfileDraft: (data: ProfileDraft) => void;
  setTraitsDraft: (data: UserTrait[]) => void;
  setIdealDraft: (data: IdealTrait[]) => void;
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setPhotoUploaded: (uploaded: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  profileDraft: null,
  traitsDraft: null,
  idealDraft: null,
  currentStep: 1,
  photoUploaded: false,

  setProfileDraft: (data) => set({ profileDraft: data }),
  setTraitsDraft: (data) => set({ traitsDraft: data }),
  setIdealDraft: (data) => set({ idealDraft: data }),
  setStep: (step) => set({ currentStep: step }),
  setPhotoUploaded: (uploaded) => set({ photoUploaded: uploaded }),

  reset: () =>
    set({
      profileDraft: null,
      traitsDraft: null,
      idealDraft: null,
      currentStep: 1,
      photoUploaded: false,
    }),
}));

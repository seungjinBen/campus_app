'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateTraits } from '@/lib/api/user';
import { useOnboardingStore } from '@/lib/store/onboardingStore';
import { handleApiError } from '@/lib/api/handleApiError';
import { TraitKey } from '@/lib/types/api.types';
import {
  ALL_TRAIT_KEYS,
  TRAIT_LABELS,
  TRAIT_PLACEHOLDERS,
  ANIMAL_FACE_OPTIONS,
  HOBBY_OPTIONS,
  DRINKING_OPTIONS,
  SMOKING_OPTIONS,
} from '@/lib/utils/traitLabel';
import StepIndicator from '@/components/onboarding/StepIndicator';
import Toggle from '@/components/ui/Toggle';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

interface TraitEntry {
  traitKey: TraitKey;
  traitValue: string;
  isVisible: boolean;
}

export default function TraitsPage() {
  const router = useRouter();
  const { setStep, setTraitsDraft, profileDraft, photoUploaded } = useOnboardingStore();
  const [traits, setTraits] = useState<Record<TraitKey, TraitEntry>>(() => {
    const initial: Partial<Record<TraitKey, TraitEntry>> = {};
    ALL_TRAIT_KEYS.forEach((key) => {
      initial[key] = { traitKey: key, traitValue: '', isVisible: true };
    });
    return initial as Record<TraitKey, TraitEntry>;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!profileDraft || !photoUploaded) {
      router.replace(photoUploaded ? '/onboarding/profile' : '/onboarding/photo');
      return;
    }
    setStep(4);
  }, [profileDraft, photoUploaded, router, setStep]);

  const updateValue = (key: TraitKey, value: string) => {
    setTraits((prev) => ({
      ...prev,
      [key]: { ...prev[key], traitValue: value, isVisible: value ? prev[key].isVisible : true },
    }));
  };

  const updateVisible = (key: TraitKey, visible: boolean) => {
    setTraits((prev) => ({
      ...prev,
      [key]: { ...prev[key], isVisible: visible },
    }));
  };

  const parseMulti = (value: string): Set<string> => {
    if (!value.trim()) return new Set();
    return new Set(value.split(',').map((s) => s.trim()).filter(Boolean));
  };

  // 동물상 다중 선택 — 최대 2개
  const toggleAnimalFace = (face: string) => {
    const current = parseMulti(traits['ANIMAL_FACE'].traitValue);
    if (current.has(face)) {
      current.delete(face);
    } else {
      if (current.size >= 2) {
        toast.error('동물상은 최대 2개까지 선택할 수 있어요');
        return;
      }
      current.add(face);
    }
    updateValue('ANIMAL_FACE', Array.from(current).join(','));
  };

  // 취미 다중 선택 — 최대 2개
  const toggleHobby = (hobby: string) => {
    const current = parseMulti(traits['HOBBY'].traitValue);
    if (current.has(hobby)) {
      current.delete(hobby);
    } else {
      if (current.size >= 2) {
        toast.error('취미는 최대 2개까지 선택할 수 있어요');
        return;
      }
      current.add(hobby);
    }
    updateValue('HOBBY', Array.from(current).join(','));
  };

  const handleSubmit = async () => {
    const filled = Object.values(traits).filter((t) => t.traitValue.trim() !== '');
    if (filled.length === 0) {
      toast.error('특징을 1개 이상 입력해 주세요');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateTraits(filled);
      setTraitsDraft(filled);
      setStep(5);
      router.push('/onboarding/ideal');
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (key: TraitKey) => {
    const entry = traits[key];

    if (key === 'ANIMAL_FACE') {
      const selected = parseMulti(entry.traitValue);
      return (
        <div className="grid grid-cols-3 gap-2">
          {ANIMAL_FACE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleAnimalFace(option)}
              className={cn(
                'py-2.5 rounded-xl border text-sm transition-all',
                selected.has(option)
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-semibold'
                  : 'border-brand-sand text-brand-mid hover:border-brand-rose/50 bg-white'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (key === 'HOBBY') {
      const selected = parseMulti(entry.traitValue);
      return (
        <div className="grid grid-cols-3 gap-2">
          {HOBBY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleHobby(option)}
              className={cn(
                'py-2.5 rounded-xl border text-sm transition-all',
                selected.has(option)
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-semibold'
                  : 'border-brand-sand text-brand-mid hover:border-brand-rose/50 bg-white'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (key === 'DRINKING') {
      return (
        <div className="flex gap-2">
          {DRINKING_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updateValue(key, option)}
              className={cn(
                'flex-1 py-2.5 rounded-xl border text-sm transition-all',
                entry.traitValue === option
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-semibold'
                  : 'border-brand-sand text-brand-mid hover:border-brand-rose/50 bg-white'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (key === 'SMOKING') {
      return (
        <div className="flex gap-2">
          {SMOKING_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updateValue(key, option)}
              className={cn(
                'flex-1 py-2.5 rounded-xl border text-sm transition-all',
                entry.traitValue === option
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-semibold'
                  : 'border-brand-sand text-brand-mid hover:border-brand-rose/50 bg-white'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    return (
      <input
        type={key === 'HEIGHT' ? 'number' : 'text'}
        placeholder={TRAIT_PLACEHOLDERS[key]}
        value={entry.traitValue}
        onChange={(e) => updateValue(key, e.target.value)}
        className="w-full rounded-xl border border-brand-sand bg-white px-4 py-3 text-sm text-brand-dark placeholder:text-brand-light outline-none transition-colors focus:border-brand-rose focus:ring-2 focus:ring-brand-rose/15"
      />
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <StepIndicator
        current={4}
        total={5}
        title="나를 표현하는 특징"
        description="카드에 표시할 항목은 공개 토글을 켜두세요"
      />

      <div className="bg-brand-warm border border-brand-sand rounded-2xl px-4 py-3 text-sm text-brand-mid leading-relaxed">
        한 번 등록한 특징은 수정할 수 없어요. 입력하신 정보는 상대방의 이상형 조건과 비교되어 매칭 점수를 계산하는 데 사용돼요.
      </div>

      <div className="flex flex-col gap-4">
        {ALL_TRAIT_KEYS.map((key) => {
          const entry = traits[key];
          const hasValue = entry.traitValue.trim() !== '';

          return (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-brand-dark">{TRAIT_LABELS[key]}</span>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs', hasValue && entry.isVisible ? 'text-brand-rose' : 'text-brand-light')}>
                    {hasValue && entry.isVisible ? '카드에 표시' : '비공개'}
                  </span>
                  <Toggle
                    checked={entry.isVisible}
                    onChange={(v) => updateVisible(key, v)}
                    disabled={!hasValue}
                  />
                </div>
              </div>

              {renderInput(key)}
            </div>
          );
        })}
      </div>

      <Button size="lg" fullWidth onClick={handleSubmit} isLoading={isSubmitting}>
        다음
      </Button>
    </div>
  );
}

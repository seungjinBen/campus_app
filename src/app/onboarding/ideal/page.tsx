'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateIdeal, updateDeptFilter } from '@/lib/api/user';
import { DeptFilterMode } from '@/lib/types/user.types';
import { useOnboardingStore } from '@/lib/store/onboardingStore';
import { handleApiError } from '@/lib/api/handleApiError';
import { TraitKey } from '@/lib/types/api.types';
import {
  ALL_IDEAL_KEYS,
  TRAIT_LABELS,
  TRAIT_PLACEHOLDERS,
  ANIMAL_FACE_OPTIONS,
  HOBBY_OPTIONS,
  DRINKING_OPTIONS,
  SMOKING_OPTIONS,
  MBTI_IDEAL_OPTIONS,
  AGE_PREFERENCE_OPTIONS,
} from '@/lib/utils/traitLabel';
import StepIndicator from '@/components/onboarding/StepIndicator';
import Button from '@/components/ui/Button';
import IconBadge from '@/components/ui/IconBadge';
import { Calendar, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

export default function IdealPage() {
  const router = useRouter();
  const { setStep, setIdealDraft, reset, traitsDraft } = useOnboardingStore();
  const [values, setValues] = useState<Record<TraitKey, string>>(() => {
    const init: Partial<Record<TraitKey, string>> = {};
    ALL_IDEAL_KEYS.forEach((k) => (init[k] = ''));
    return init as Record<TraitKey, string>;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  // 매칭 진입 직전 학과 필터 선택 — 첫 카드 생성에 즉시 반영됨
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isSavingFilter, setIsSavingFilter] = useState(false);
  const isNavigatingAway = useRef(false);

  // 매칭 서비스 오픈 일시 — TODO: 기획 확인 필요 — 가을축제 오픈일 확정 시 변경
  const MATCHING_START = new Date('2026-08-26T00:00:00');

  const FILTER_CHOICES: { mode: DeptFilterMode; label: string; desc: string }[] = [
    { mode: 'ALL', label: '학과 상관없이 전체', desc: '모든 학과의 카드를 보여드려요' },
    { mode: 'EXCLUDE_SAME', label: '같은 학과 제외', desc: '아는 사람을 피하고 싶다면 추천해요' },
  ];

  useEffect(() => {
    if (!traitsDraft && !isNavigatingAway.current) {
      router.replace('/onboarding/traits');
      return;
    }
    setStep(5);
  }, [traitsDraft, router, setStep]);

  const updateValue = (key: TraitKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  // 다중 선택 토글 — maxCount 지정 시 해당 개수까지만 선택 가능
  const toggleMulti = (key: TraitKey, option: string, maxCount = Infinity) => {
    const current = new Set(
      values[key] ? values[key].split(',').map((s) => s.trim()).filter(Boolean) : []
    );
    if (current.has(option)) {
      current.delete(option);
    } else {
      if (current.size >= maxCount) {
        toast.error('최대 2개까지 선택할 수 있어요');
        return;
      }
      current.add(option);
    }
    updateValue(key, Array.from(current).join(','));
  };

  // MBTI 계열 토글 (E/I는 상호 배타, T/F는 상호 배타)
  const toggleMbtiCategory = (code: string) => {
    const current = new Set(
      values['MBTI'] ? values['MBTI'].split(',').map((s) => s.trim()).filter(Boolean) : []
    );

    if (current.has(code)) {
      current.delete(code);
    } else {
      // E↔I, T↔F는 서로 배타 — 반대 계열 제거 후 추가
      if (code === 'E') current.delete('I');
      if (code === 'I') current.delete('E');
      if (code === 'T') current.delete('F');
      if (code === 'F') current.delete('T');
      current.add(code);
    }
    updateValue('MBTI', Array.from(current).join(','));
  };

  const getSelected = (key: TraitKey): Set<string> => {
    if (!values[key]) return new Set();
    return new Set(values[key].split(',').map((s) => s.trim()).filter(Boolean));
  };

  const handleSubmit = async () => {
    const ideals = ALL_IDEAL_KEYS.map((key) => ({
      traitKey: key,
      traitValue: values[key].trim() || null,
    }));

    setIsSubmitting(true);
    try {
      await updateIdeal(ideals);
      setIdealDraft(ideals);
      isNavigatingAway.current = true;
      reset();
      // 매칭 진입 전 학과 필터 선택 — 선택이 첫 카드 10장 생성에 바로 반영됨
      setShowFilterModal(true);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterSelect = async (mode: DeptFilterMode) => {
    if (isSavingFilter) return;
    setIsSavingFilter(true);
    try {
      await updateDeptFilter(mode);
    } catch {
      // 저장 실패 시 기본값(전체)으로 진행 — 설정에서 언제든 변경 가능
      toast('필터 저장에 실패해 전체 보기로 시작해요');
    } finally {
      setIsSavingFilter(false);
    }
    setShowFilterModal(false);
    if (new Date() < MATCHING_START) {
      setShowWaitingModal(true);
    } else {
      router.push('/match');
    }
  };

  const renderInput = (key: TraitKey) => {
    if (key === 'AGE_PREFERENCE') {
      const selected = getSelected(key);
      return (
        <div className="flex gap-2">
          {AGE_PREFERENCE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleMulti(key, option, 2)}
              className={cn(
                'flex-1 py-2.5 rounded-xl border text-sm transition-all',
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

    if (key === 'ANIMAL_FACE') {
      const selected = getSelected(key);
      return (
        <div className="grid grid-cols-3 gap-2">
          {ANIMAL_FACE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleMulti(key, option, 2)}
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

    if (key === 'MBTI') {
      const selected = getSelected(key);
      return (
        <div className="flex gap-2">
          {MBTI_IDEAL_OPTIONS.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => toggleMbtiCategory(code)}
              className={cn(
                'flex-1 py-2.5 rounded-xl border text-sm transition-all',
                selected.has(code)
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-medium'
                  : 'border-brand-sand text-brand-mid hover:border-brand-mid'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      );
    }

    if (key === 'HOBBY') {
      const selected = getSelected(key);
      return (
        <div className="grid grid-cols-3 gap-2">
          {HOBBY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleMulti(key, option, 2)}
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
              onClick={() => updateValue(key, values[key] === option ? '' : option)}
              className={cn(
                'flex-1 py-2.5 rounded-xl border text-sm transition-all',
                values[key] === option
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
              onClick={() => updateValue(key, values[key] === option ? '' : option)}
              className={cn(
                'flex-1 py-2.5 rounded-xl border text-sm transition-all',
                values[key] === option
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
        value={values[key]}
        onChange={(e) => updateValue(key, e.target.value)}
        className="w-full rounded-xl border border-brand-sand bg-white px-4 py-3 text-sm text-brand-dark placeholder:text-brand-light outline-none transition-colors focus:border-brand-rose focus:ring-2 focus:ring-brand-rose/20"
      />
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <StepIndicator
        current={5}
        total={5}
        title="어떤 분이면 좋을까요?"
      />

      <div className="bg-brand-warm border border-brand-sand rounded-2xl px-4 py-3 text-sm text-brand-mid leading-relaxed">
        한 번 등록한 이상형 조건은 수정할 수 없어요. 이 조건을 기준으로 상대방 특징과의 일치율을 계산해 매칭 상대를 보여드려요.
      </div>

      <div className="bg-brand-rose-light border border-brand-rose/15 rounded-2xl px-4 py-3 text-sm text-brand-mid leading-relaxed">
        비워두면 &apos;상관없음&apos;으로 처리해요. 완벽히 맞는 분이 없으면 1~2개만 맞아도 보여드려요.
      </div>

      <div className="flex flex-col gap-4">
        {ALL_IDEAL_KEYS.map((key) => (
          <div key={key} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-dark">
              {TRAIT_LABELS[key]}
              <span className="ml-1.5 text-xs text-brand-light font-normal">선택</span>
            </label>
            {renderInput(key)}
          </div>
        ))}
      </div>

      <Button size="lg" fullWidth onClick={handleSubmit} isLoading={isSubmitting}>
        매칭 시작하기
      </Button>

      {/* 매칭 진입 전 학과 필터 선택 모달 */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-5 shadow-modal">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <IconBadge icon={GraduationCap} />
              </div>
              <p className="font-bold text-brand-dark text-lg">어떤 분들을 보여드릴까요?</p>
              <p className="text-sm text-brand-mid mt-2 leading-relaxed">
                매칭 카드에 나올 상대의 학과 범위를 선택해 주세요
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {FILTER_CHOICES.map(({ mode, label, desc }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleFilterSelect(mode)}
                  disabled={isSavingFilter}
                  className="w-full py-3.5 px-4 rounded-2xl border border-brand-sand bg-white text-left transition-all hover:border-brand-rose hover:bg-brand-rose-light/40 disabled:opacity-50"
                >
                  <p className="text-sm font-semibold text-brand-dark">{label}</p>
                  <p className="text-xs text-brand-mid mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-brand-light text-center">설정에서 언제든 변경할 수 있어요</p>
          </div>
        </div>
      )}

      {showWaitingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-5 shadow-modal">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <IconBadge icon={Calendar} />
              </div>
              <p className="font-bold text-brand-dark text-lg">가입이 완료됐어요!</p>
              {/* TODO: 기획 확인 필요 — 가을축제 오픈일 확정 시 날짜 명시 */}
              <p className="text-sm text-brand-mid mt-3 leading-relaxed">
                매칭은 <span className="font-semibold text-brand-rose">축제 기간</span>에 공식 오픈돼요.<br />
                오픈까지 조금만 기다려 주세요!
              </p>
            </div>
            <Button size="lg" fullWidth onClick={() => router.push('/match')}>
              확인
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

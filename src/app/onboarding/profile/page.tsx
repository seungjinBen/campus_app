'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '@/lib/schemas/profile.schema';
import { updateProfile } from '@/lib/api/user';
import { useOnboardingStore } from '@/lib/store/onboardingStore';
import { handleApiError, getApiErrorCode } from '@/lib/api/handleApiError';
import StepIndicator from '@/components/onboarding/StepIndicator';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { setProfileDraft, setStep, profileDraft } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      gender: profileDraft?.gender ?? 'MALE',
      contactType: profileDraft?.contactType ?? 'INSTAGRAM',
      nickname: profileDraft?.nickname ?? '',
      birthDate: profileDraft?.birthDate ?? '',
      university: profileDraft?.university ?? '',
      contactValue: profileDraft?.contactValue ?? '',
    },
  });

  const selectedGender = watch('gender');
  const selectedContactType = watch('contactType');

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload: Parameters<typeof updateProfile>[0] = {
        nickname: data.nickname,
        gender: data.gender,
        birthDate: data.birthDate,
        contactType: data.contactType,
        contactValue: data.contactValue,
      };
      if (data.university) payload.university = data.university;

      await updateProfile(payload);

      setProfileDraft({
        nickname: data.nickname,
        gender: data.gender,
        birthDate: data.birthDate,
        contactType: data.contactType,
        contactValue: data.contactValue,
        university: data.university,
      });
      setStep(2);
      router.push('/onboarding/photo');
    } catch (err) {
      const code = getApiErrorCode(err);
      if (code === 'NICKNAME_TAKEN') {
        setError('nickname', { message: '이미 사용 중인 닉네임이에요' });
      } else {
        toast.error(handleApiError(err));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-10">
      <StepIndicator current={1} total={4} title="기본 정보를 알려주세요" />

      <Input
        label="닉네임"
        placeholder="2~20자, 특수문자 제외"
        error={errors.nickname?.message}
        {...register('nickname')}
      />

      {/* 성별 선택 */}
      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-dark">성별</label>
            <div className="flex gap-3">
              {(['MALE', 'FEMALE'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => field.onChange(g)}
                  className={cn(
                    'flex-1 py-3 rounded-xl border text-sm font-medium transition-all',
                    selectedGender === g
                      ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-semibold'
                      : 'border-brand-sand text-brand-mid hover:border-brand-rose/50 bg-white'
                  )}
                >
                  {g === 'MALE' ? '남성' : '여성'}
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
          </div>
        )}
      />

      <Input
        label="생년월일"
        placeholder="예) 20000115"
        maxLength={8}
        error={errors.birthDate?.message}
        {...register('birthDate')}
      />

      <Input
        label="대학교 (선택)"
        placeholder="예) 세종대학교"
        error={errors.university?.message}
        {...register('university')}
      />

      {/* 연락처 유형 선택 */}
      <Controller
        name="contactType"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-dark">연락처 유형</label>
            <div className="flex gap-3">
              {(['INSTAGRAM', 'PHONE'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => field.onChange(type)}
                  className={cn(
                    'flex-1 py-3 rounded-xl border text-sm font-medium transition-all',
                    selectedContactType === type
                      ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-semibold'
                      : 'border-brand-sand text-brand-mid hover:border-brand-rose/50 bg-white'
                  )}
                >
                  {type === 'INSTAGRAM' ? '인스타그램' : '전화번호'}
                </button>
              ))}
            </div>
            {errors.contactType && <p className="text-xs text-red-500">{errors.contactType.message}</p>}
          </div>
        )}
      />

      <Input
        label={selectedContactType === 'INSTAGRAM' ? '인스타그램 아이디' : '전화번호'}
        placeholder={selectedContactType === 'INSTAGRAM' ? '예) @campus_hanjang' : '예) 010-1234-5678'}
        error={errors.contactValue?.message}
        {...register('contactValue')}
      />

      <div className="rounded-2xl bg-brand-rose-light border border-brand-rose/15 px-4 py-4 flex flex-col gap-3">
        <p className="text-sm font-semibold text-brand-rose">💝 연락처 공개 원칙</p>
        <ul className="flex flex-col gap-2 text-sm text-brand-mid">
          {[
            '내가 상대를 선택했을 때, 내 특징이 상대의 이상형과 70% 이상 맞으면 → 상대 연락처를 바로 확인할 수 있어요',
            '70% 미만이면 → 50자 이내 쪽지로 먼저 마음을 전해요',
            '상대가 나를 선택하면 → 수신함에서 누가 열람했는지, 어떤 쪽지를 보냈는지 확인할 수 있어요',
            '하루 최대 3번만 선택할 수 있어요',
          ].map((text) => (
            <li key={text} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-rose flex-shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4">
        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          다음
        </Button>
      </div>
    </form>
  );
}

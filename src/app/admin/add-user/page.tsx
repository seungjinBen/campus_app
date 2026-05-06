'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { adminCreateUser, adminUploadPhoto, AdminTraitEntry, AdminIdealEntry } from '@/lib/api/admin';
import { useAuthStore } from '@/lib/store/authStore';
import { Gender, ContactType, TraitKey } from '@/lib/types/api.types';
import {
  ALL_TRAIT_KEYS,
  TRAIT_LABELS,
  TRAIT_PLACEHOLDERS,
  ANIMAL_FACE_OPTIONS,
  HOBBY_OPTIONS,
  DRINKING_OPTIONS,
  SMOKING_OPTIONS,
  MBTI_IDEAL_OPTIONS,
} from '@/lib/utils/traitLabel';
import { cn } from '@/lib/utils/cn';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import { ImagePlus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// ── 기본 정보 ──────────────────────────────────────────────────
const initialBasic = {
  nickname: '',
  gender: '' as Gender | '',
  birthDate: '',
  university: '',
  contactType: '' as ContactType | '',
  contactValue: '',
};
type BasicForm = typeof initialBasic;
type BasicErrors = Partial<Record<keyof BasicForm, string>>;

// ── 특징 초기값 ───────────────────────────────────────────────
const makeInitialTraits = (): Record<TraitKey, { value: string; isVisible: boolean }> => {
  const m: Partial<Record<TraitKey, { value: string; isVisible: boolean }>> = {};
  ALL_TRAIT_KEYS.forEach((k) => { m[k] = { value: '', isVisible: true }; });
  return m as Record<TraitKey, { value: string; isVisible: boolean }>;
};

// ── 이상형 초기값 ─────────────────────────────────────────────
const makeInitialIdeals = (): Record<TraitKey, string> => {
  const m: Partial<Record<TraitKey, string>> = {};
  ALL_TRAIT_KEYS.forEach((k) => { m[k] = ''; });
  return m as Record<TraitKey, string>;
};

// ── 다중 선택 토글 헬퍼 ──────────────────────────────────────
function toggleMultiValue(current: string, option: string): string {
  const set = new Set(current ? current.split(',').map((s) => s.trim()).filter(Boolean) : []);
  if (set.has(option)) { set.delete(option); } else { set.add(option); }
  return Array.from(set).join(',');
}
function getSet(value: string): Set<string> {
  if (!value) return new Set();
  return new Set(value.split(',').map((s) => s.trim()).filter(Boolean));
}

// ─────────────────────────────────────────────────────────────
export default function AdminAddUserPage() {
  const router = useRouter();
  const { isAdmin } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [basic, setBasic] = useState<BasicForm>(initialBasic);
  const [basicErrors, setBasicErrors] = useState<BasicErrors>({});

  // 사진
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [traits, setTraits] = useState(makeInitialTraits);
  const [ideals, setIdeals] = useState(makeInitialIdeals);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAdmin) router.replace('/match');
  }, [mounted, isAdmin, router]);

  if (!mounted || !isAdmin) return null;

  // ── 사진 핸들러 ──────────────────────────────────────────────
  const handleFileSelect = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('사진 형식을 확인해 주세요 (JPEG, PNG, WEBP)');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('5MB 이하 사진만 올릴 수 있어요');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPhotoFile(file);
    setPhotoError(null);
  };

  // ── 기본 정보 핸들러 ─────────────────────────────────────────
  const setBasicField = (field: keyof BasicForm, value: string) => {
    setBasic((prev) => ({ ...prev, [field]: value }));
    setBasicErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateBasic = (): boolean => {
    const errs: BasicErrors = {};
    if (!basic.nickname.trim()) errs.nickname = '닉네임을 입력해 주세요';
    else if (basic.nickname.length > 20) errs.nickname = '닉네임은 20자 이하로 입력해 주세요';
    if (!basic.gender) errs.gender = '성별을 선택해 주세요';
    if (!basic.birthDate) errs.birthDate = '생년월일을 입력해 주세요';
    if (!basic.contactType) errs.contactType = '연락처 유형을 선택해 주세요';
    if (!basic.contactValue.trim()) errs.contactValue = '연락처를 입력해 주세요';
    setBasicErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── 특징 핸들러 ──────────────────────────────────────────────
  const setTraitValue = (key: TraitKey, value: string) => {
    setTraits((prev) => ({ ...prev, [key]: { ...prev[key], value } }));
  };
  const setTraitVisible = (key: TraitKey, isVisible: boolean) => {
    setTraits((prev) => ({ ...prev, [key]: { ...prev[key], isVisible } }));
  };
  const toggleTraitHobby = (hobby: string) => {
    setTraitValue('HOBBY', toggleMultiValue(traits['HOBBY'].value, hobby));
  };

  // ── 이상형 핸들러 ─────────────────────────────────────────────
  const setIdealValue = (key: TraitKey, value: string) => {
    setIdeals((prev) => ({ ...prev, [key]: value }));
  };
  const toggleIdealMulti = (key: TraitKey, option: string) => {
    setIdealValue(key, toggleMultiValue(ideals[key], option));
  };
  const toggleMbtiCategory = (code: string) => {
    const current = getSet(ideals['MBTI']);
    if (current.has(code)) {
      current.delete(code);
    } else {
      if (code === 'E') current.delete('I');
      if (code === 'I') current.delete('E');
      if (code === 'T') current.delete('F');
      if (code === 'F') current.delete('T');
      current.add(code);
    }
    setIdealValue('MBTI', Array.from(current).join(','));
  };

  // ── 제출 ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isBasicValid = validateBasic();

    if (!photoFile) {
      setPhotoError('사진을 선택해 주세요');
    }

    const traitList: AdminTraitEntry[] = ALL_TRAIT_KEYS
      .filter((k) => traits[k].value.trim() !== '')
      .map((k) => ({ traitKey: k, traitValue: traits[k].value.trim(), isVisible: traits[k].isVisible }));

    if (!isBasicValid || !photoFile) {
      toast.error('기본 정보와 사진을 모두 입력해 주세요');
      return;
    }

    if (traitList.length === 0) {
      toast.error('특징을 1개 이상 입력해 주세요');
      return;
    }

    const idealList: AdminIdealEntry[] = ALL_TRAIT_KEYS
      .filter((k) => ideals[k].trim() !== '')
      .map((k) => ({ traitKey: k, traitValue: ideals[k].trim() }));

    setIsLoading(true);
    try {
      const result = await adminCreateUser({
        nickname: basic.nickname.trim(),
        gender: basic.gender as Gender,
        birthDate: basic.birthDate,
        ...(basic.university.trim() ? { university: basic.university.trim() } : {}),
        contactType: basic.contactType as ContactType,
        contactValue: basic.contactValue.trim(),
        traits: traitList,
        ideals: idealList,
      });

      await adminUploadPhoto(result.id, photoFile);

      toast.success(`${result.nickname} 님이 추가됐어요`);

      // 폼 전체 초기화
      setBasic(initialBasic);
      setBasicErrors({});
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPhotoFile(null);
      setPreviewUrl(null);
      setPhotoError(null);
      setTraits(makeInitialTraits());
      setIdeals(makeInitialIdeals());
    } catch {
      toast.error('유저 추가에 실패했어요');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 특징 입력 렌더러 ──────────────────────────────────────────
  const renderTraitInput = (key: TraitKey) => {
    const { value } = traits[key];

    if (key === 'ANIMAL_FACE') {
      return (
        <div className="grid grid-cols-3 gap-2">
          {ANIMAL_FACE_OPTIONS.map((opt) => (
            <button key={opt} type="button"
              onClick={() => setTraitValue(key, value === opt ? '' : opt)}
              className={cn('py-2.5 rounded-xl border text-sm transition-all',
                value === opt
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-medium'
                  : 'border-brand-sand text-brand-mid hover:border-brand-mid')}>
              {opt}
            </button>
          ))}
        </div>
      );
    }
    if (key === 'HOBBY') {
      const sel = getSet(value);
      return (
        <div className="grid grid-cols-3 gap-2">
          {HOBBY_OPTIONS.map((opt) => (
            <button key={opt} type="button" onClick={() => toggleTraitHobby(opt)}
              className={cn('py-2.5 rounded-xl border text-sm transition-all',
                sel.has(opt)
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-medium'
                  : 'border-brand-sand text-brand-mid hover:border-brand-mid')}>
              {opt}
            </button>
          ))}
        </div>
      );
    }
    if (key === 'DRINKING') {
      return (
        <div className="flex gap-2">
          {DRINKING_OPTIONS.map((opt) => (
            <button key={opt} type="button" onClick={() => setTraitValue(key, opt)}
              className={cn('flex-1 py-2.5 rounded-xl border text-sm transition-all',
                value === opt
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-medium'
                  : 'border-brand-sand text-brand-mid hover:border-brand-mid')}>
              {opt}
            </button>
          ))}
        </div>
      );
    }
    if (key === 'SMOKING') {
      return (
        <div className="flex gap-2">
          {SMOKING_OPTIONS.map((opt) => (
            <button key={opt} type="button" onClick={() => setTraitValue(key, opt)}
              className={cn('flex-1 py-2.5 rounded-xl border text-sm transition-all',
                value === opt
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-medium'
                  : 'border-brand-sand text-brand-mid hover:border-brand-mid')}>
              {opt}
            </button>
          ))}
        </div>
      );
    }
    return (
      <input type={key === 'HEIGHT' ? 'number' : 'text'}
        placeholder={TRAIT_PLACEHOLDERS[key]} value={value}
        onChange={(e) => setTraitValue(key, e.target.value)}
        className="w-full rounded-xl border border-brand-sand bg-white px-4 py-3 text-sm text-brand-dark placeholder:text-brand-light outline-none transition-colors focus:border-brand-rose focus:ring-2 focus:ring-brand-rose/20" />
    );
  };

  // ── 이상형 입력 렌더러 ────────────────────────────────────────
  const renderIdealInput = (key: TraitKey) => {
    const val = ideals[key];

    if (key === 'ANIMAL_FACE') {
      const sel = getSet(val);
      return (
        <div className="grid grid-cols-3 gap-2">
          {ANIMAL_FACE_OPTIONS.map((opt) => (
            <button key={opt} type="button" onClick={() => toggleIdealMulti(key, opt)}
              className={cn('py-2.5 rounded-xl border text-sm transition-all',
                sel.has(opt)
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-medium'
                  : 'border-brand-sand text-brand-mid hover:border-brand-mid')}>
              {opt}
            </button>
          ))}
        </div>
      );
    }
    if (key === 'MBTI') {
      const sel = getSet(val);
      return (
        <div className="flex gap-2">
          {MBTI_IDEAL_OPTIONS.map(({ code, label }) => (
            <button key={code} type="button" onClick={() => toggleMbtiCategory(code)}
              className={cn('flex-1 py-2.5 rounded-xl border text-sm transition-all',
                sel.has(code)
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-medium'
                  : 'border-brand-sand text-brand-mid hover:border-brand-mid')}>
              {label}
            </button>
          ))}
        </div>
      );
    }
    if (key === 'HOBBY') {
      const sel = getSet(val);
      return (
        <div className="grid grid-cols-3 gap-2">
          {HOBBY_OPTIONS.map((opt) => (
            <button key={opt} type="button" onClick={() => toggleIdealMulti(key, opt)}
              className={cn('py-2.5 rounded-xl border text-sm transition-all',
                sel.has(opt)
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-medium'
                  : 'border-brand-sand text-brand-mid hover:border-brand-mid')}>
              {opt}
            </button>
          ))}
        </div>
      );
    }
    if (key === 'DRINKING') {
      return (
        <div className="flex gap-2">
          {DRINKING_OPTIONS.map((opt) => (
            <button key={opt} type="button"
              onClick={() => setIdealValue(key, val === opt ? '' : opt)}
              className={cn('flex-1 py-2.5 rounded-xl border text-sm transition-all',
                val === opt
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-medium'
                  : 'border-brand-sand text-brand-mid hover:border-brand-mid')}>
              {opt}
            </button>
          ))}
        </div>
      );
    }
    if (key === 'SMOKING') {
      return (
        <div className="flex gap-2">
          {SMOKING_OPTIONS.map((opt) => (
            <button key={opt} type="button"
              onClick={() => setIdealValue(key, val === opt ? '' : opt)}
              className={cn('flex-1 py-2.5 rounded-xl border text-sm transition-all',
                val === opt
                  ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-medium'
                  : 'border-brand-sand text-brand-mid hover:border-brand-mid')}>
              {opt}
            </button>
          ))}
        </div>
      );
    }
    return (
      <input type={key === 'HEIGHT' ? 'number' : 'text'}
        placeholder={TRAIT_PLACEHOLDERS[key]} value={val}
        onChange={(e) => setIdealValue(key, e.target.value)}
        className="w-full rounded-xl border border-brand-sand bg-white px-4 py-3 text-sm text-brand-dark placeholder:text-brand-light outline-none transition-colors focus:border-brand-rose focus:ring-2 focus:ring-brand-rose/20" />
    );
  };

  // ── 렌더 ─────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-10">

      {/* 기본 정보 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-brand-dark">기본 정보</h2>

        <Input label="닉네임" placeholder="닉네임 (최대 20자)"
          value={basic.nickname} onChange={(e) => setBasicField('nickname', e.target.value)}
          error={basicErrors.nickname} />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-brand-dark">성별</span>
          <div className="flex gap-3">
            {(['MALE', 'FEMALE'] as const).map((g) => (
              <button key={g} type="button" onClick={() => setBasicField('gender', g)}
                className={cn('flex-1 py-3 rounded-xl border text-sm font-medium transition-colors',
                  basic.gender === g
                    ? 'border-brand-dark bg-brand-dark text-white'
                    : 'border-brand-sand text-brand-mid hover:border-brand-dark')}>
                {g === 'MALE' ? '남성' : '여성'}
              </button>
            ))}
          </div>
          {basicErrors.gender && <p className="text-xs text-red-500">{basicErrors.gender}</p>}
        </div>

        <Input label="생년월일" type="date"
          value={basic.birthDate} onChange={(e) => setBasicField('birthDate', e.target.value)}
          error={basicErrors.birthDate} />

        <Input label="학교" placeholder="학교명 (선택)"
          value={basic.university} onChange={(e) => setBasicField('university', e.target.value)} />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-brand-dark">연락처 유형</span>
          <div className="flex gap-3">
            {(['INSTAGRAM', 'PHONE'] as const).map((ct) => (
              <button key={ct} type="button" onClick={() => setBasicField('contactType', ct)}
                className={cn('flex-1 py-3 rounded-xl border text-sm font-medium transition-colors',
                  basic.contactType === ct
                    ? 'border-brand-dark bg-brand-dark text-white'
                    : 'border-brand-sand text-brand-mid hover:border-brand-dark')}>
                {ct === 'INSTAGRAM' ? '인스타그램' : '전화번호'}
              </button>
            ))}
          </div>
          {basicErrors.contactType && <p className="text-xs text-red-500">{basicErrors.contactType}</p>}
        </div>

        <Input label="연락처"
          placeholder={basic.contactType === 'INSTAGRAM' ? '@아이디' : '010-XXXX-XXXX'}
          value={basic.contactValue} onChange={(e) => setBasicField('contactValue', e.target.value)}
          error={basicErrors.contactValue} />
      </section>

      {/* 사진 */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-brand-dark">사진</h2>
          <p className="text-xs text-brand-light mt-0.5">JPEG, PNG, WEBP · 최대 10MB · 필수</p>
        </div>

        <div
          className={cn(
            'relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors',
            photoError
              ? 'border-red-400 bg-red-50'
              : 'border-brand-sand bg-brand-warm hover:border-brand-rose hover:bg-brand-rose-light/30'
          )}
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
          onDragOver={(e) => e.preventDefault()}
          role="button"
          aria-label="사진 업로드"
        >
          {previewUrl ? (
            <>
              <Image src={previewUrl} alt="미리보기" fill className="object-cover rounded-2xl" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 text-brand-dark text-xs font-medium px-3 py-2 rounded-xl shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                사진 변경
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-brand-light">
              <ImagePlus className="h-10 w-10" />
              <p className="text-sm font-medium">클릭하거나 끌어다 놓으세요</p>
            </div>
          )}
        </div>
        {photoError && <p className="text-xs text-red-500">{photoError}</p>}

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ''; }} />
      </section>

      {/* 특징 */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-brand-dark">특징</h2>
          <p className="text-xs text-brand-light mt-0.5">1개 이상 필수 · 공개 토글을 켜면 매칭 카드에 표시돼요</p>
        </div>

        {ALL_TRAIT_KEYS.map((key) => {
          const hasValue = traits[key].value.trim() !== '';
          return (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-brand-dark">{TRAIT_LABELS[key]}</span>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs', hasValue && traits[key].isVisible ? 'text-brand-rose' : 'text-brand-light')}>
                    {hasValue && traits[key].isVisible ? '카드에 표시' : '비공개'}
                  </span>
                  <Toggle checked={traits[key].isVisible}
                    onChange={(v) => setTraitVisible(key, v)}
                    disabled={!hasValue} />
                </div>
              </div>
              {renderTraitInput(key)}
            </div>
          );
        })}
      </section>

      {/* 이상형 */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-brand-dark">이상형</h2>
          <p className="text-xs text-brand-light mt-0.5">모두 선택 · 비워두면 상관없음으로 처리돼요</p>
        </div>

        {ALL_TRAIT_KEYS.map((key) => (
          <div key={key} className="flex flex-col gap-2">
            <span className="text-sm font-medium text-brand-dark">
              {TRAIT_LABELS[key]}
              <span className="ml-1.5 text-xs text-brand-light font-normal">선택</span>
            </span>
            {renderIdealInput(key)}
          </div>
        ))}
      </section>

      <Button type="submit" isLoading={isLoading} fullWidth>
        추가하기
      </Button>
    </form>
  );
}

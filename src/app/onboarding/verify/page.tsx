'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  submitVerification,
  getVerificationStatus,
  VerificationSubmitResult,
} from '@/lib/api/verification';
import { useOnboardingStore } from '@/lib/store/onboardingStore';
import { handleApiError } from '@/lib/api/handleApiError';
import StepIndicator from '@/components/onboarding/StepIndicator';
import Button from '@/components/ui/Button';
import IconBadge from '@/components/ui/IconBadge';
import { Clock, ImagePlus, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

// AI 판정 결과에 따른 화면 상태 — discriminated union으로 분기 명시
type VerifyState =
  | { type: 'checking' }
  | { type: 'idle' }
  | { type: 'analyzing' }
  | { type: 'approved'; university: string | null; department: string | null }
  | { type: 'retry'; guide: string }
  | { type: 'review' }
  | { type: 'rejected'; reason: string };

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const ANALYZING_MESSAGES = [
  '화면을 읽고 있어요...',
  '학번을 확인하고 있어요...',
  '학과 정보를 대조하고 있어요...',
];

export default function VerifyPage() {
  const router = useRouter();
  const { setStep, setVerified } = useOnboardingStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<VerifyState>({ type: 'checking' });
  const [analyzingIdx, setAnalyzingIdx] = useState(0);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    setStep(1);
    getVerificationStatus()
      .then((res) => {
        if (res.verified) {
          setVerified(true);
          router.replace('/onboarding/profile');
        } else if (res.status === 'NEEDS_REVIEW') {
          setState({ type: 'review' });
        } else {
          setState({ type: 'idle' });
        }
      })
      .catch(() => setState({ type: 'idle' }));
  }, [router, setStep, setVerified]);

  // 분석 대기 중 문구 로테이션 — 체감 대기 시간 감소
  useEffect(() => {
    if (state.type !== 'analyzing') return;
    const timer = setInterval(
      () => setAnalyzingIdx((i) => (i + 1) % ANALYZING_MESSAGES.length),
      2500
    );
    return () => clearInterval(timer);
  }, [state.type]);

  const handleFileSelect = async (file: File) => {
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('10MB 이하 이미지만 올릴 수 있어요');
      return;
    }
    setAnalyzingIdx(0);
    setState({ type: 'analyzing' });
    try {
      const result = await submitVerification(file);
      applyResult(result);
    } catch (err) {
      toast.error(handleApiError(err));
      setState({ type: 'idle' });
    }
  };

  const applyResult = (result: VerificationSubmitResult) => {
    switch (result.status) {
      case 'AUTO_APPROVED':
        setState({ type: 'approved', university: result.university, department: result.department });
        break;
      case 'RETRY_REQUESTED':
        setState({ type: 'retry', guide: result.message });
        break;
      case 'NEEDS_REVIEW':
        setState({ type: 'review' });
        break;
      case 'REJECTED':
        setState({ type: 'rejected', reason: result.message });
        break;
    }
  };

  const handleRefreshReview = async () => {
    try {
      const res = await getVerificationStatus();
      if (res.verified) {
        setVerified(true);
        toast.success('인증이 완료됐어요!');
        setStep(2);
        router.push('/onboarding/profile');
      } else if (res.status === 'REJECTED') {
        setState({ type: 'rejected', reason: '검수 결과 인증이 거절됐어요. 다시 시도해 주세요.' });
      } else {
        toast('아직 검수 중이에요. 조금만 기다려 주세요');
      }
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const handleNext = () => {
    setVerified(true);
    setStep(2);
    router.push('/onboarding/profile');
  };

  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <div className="flex flex-col gap-6 pb-10">
      <StepIndicator
        current={1}
        total={5}
        title="세종대 학생 인증"
        description={
          <>
            학생앱의 모바일 신분증(QR) 화면을 캡처해서 올려주세요.
            <br />
            AI가 바로 확인해드려요
          </>
        }
      />

      {state.type === 'checking' && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-rose" />
          <p className="text-sm text-brand-mid">인증 상태를 확인하는 중이에요...</p>
        </div>
      )}

      {(state.type === 'idle' || state.type === 'retry' || state.type === 'rejected') && (
        <>
          {state.type === 'retry' && (
            <div className="bg-brand-rose-light border border-brand-rose/15 rounded-2xl px-4 py-4 flex items-start gap-3">
              <RefreshCw className="h-4 w-4 text-brand-rose flex-shrink-0 mt-0.5" />
              {/* AI가 생성한 재촬영 가이드를 그대로 노출 */}
              <p className="text-sm text-brand-dark leading-relaxed">{state.guide}</p>
            </div>
          )}
          {state.type === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
              <p className="text-sm font-semibold text-red-600 mb-1">인증이 거절됐어요</p>
              <p className="text-sm text-brand-mid leading-relaxed">{state.reason}</p>
            </div>
          )}

          <div
            className="relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-brand-sand bg-white flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-brand-rose hover:bg-brand-rose-light/40 shadow-card"
            onClick={openFilePicker}
            role="button"
            aria-label="학생증 캡처 업로드"
          >
            <div className="flex flex-col items-center gap-3 text-brand-light px-6">
              <ImagePlus className="h-10 w-10" />
              <div className="text-center">
                <p className="text-sm font-medium">캡처 화면을 클릭해서 올려주세요</p>
                <p className="text-xs mt-1">학생앱 → 모바일 신분증 → 화면 캡처</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-warm border border-brand-sand rounded-2xl px-4 py-3 text-xs text-brand-mid leading-relaxed">
            캡처 화면의 이름·학번·학과·생년월일은 인증에만 사용되며, 매칭 화면에는 닉네임만 표시돼요.
            인증이 완료되면 생년월일과 학과 입력 단계를 건너뛸 수 있어요.
          </div>
        </>
      )}

      {state.type === 'analyzing' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-rose" />
          <p className="text-sm font-medium text-brand-dark">{ANALYZING_MESSAGES[analyzingIdx]}</p>
          <p className="text-xs text-brand-light">AI가 확인하고 있어요. 잠시만 기다려 주세요</p>
        </div>
      )}

      {state.type === 'approved' && (
        <div className="flex flex-col items-center gap-6 py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-rose-light flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-brand-rose" />
          </div>
          <div>
            <p className="text-xl font-bold text-brand-dark">학생 인증 완료!</p>
            {(state.university || state.department) && (
              <p className="text-sm text-brand-mid mt-2">
                {[state.university, state.department].filter(Boolean).join(' · ')}
              </p>
            )}
            <p className="text-xs text-brand-light mt-3">
              생년월일과 학과 정보가 자동으로 등록됐어요
            </p>
          </div>
          <Button size="lg" fullWidth onClick={handleNext}>
            다음
          </Button>
        </div>
      )}

      {state.type === 'review' && (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <IconBadge icon={Clock} />
          <div>
            <p className="text-xl font-bold text-brand-dark">검수 중이에요</p>
            <p className="text-sm text-brand-mid mt-2 leading-relaxed">
              확인이 조금 더 필요해서 검토하고 있어요.<br />
              보통 몇 시간 안에 완료돼요!
            </p>
          </div>
          <Button variant="secondary" size="lg" onClick={handleRefreshReview}>
            인증 결과 확인하기
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { uploadPhoto, updateThumbnail } from '@/lib/api/photo';
import { useOnboardingStore } from '@/lib/store/onboardingStore';
import { handleApiError } from '@/lib/api/handleApiError';
import StepIndicator from '@/components/onboarding/StepIndicator';
import Button from '@/components/ui/Button';
import { ImagePlus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function PhotoPage() {
  const router = useRouter();
  const { setStep, setPhotoUploaded, profileDraft } = useOnboardingStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // 이전 스텝 완료 여부 체크
    if (!profileDraft) {
      router.replace('/onboarding/profile');
      return;
    }
    setStep(2);
  }, [profileDraft, router, setStep]);

  const handleFileSelect = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('사진 형식을 확인해 주세요 (JPEG, PNG, WEBP)');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('5MB 이하 사진만 올릴 수 있어요');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const { photoUrl, thumbnailUrl } = await uploadPhoto(file);
      setUploadedPhotoUrl(photoUrl);
      setPhotoUploaded(true);

      // 썸네일 URL 업데이트는 30초 후 (백그라운드 처리 대기)
      if (thumbnailUrl) {
        setTimeout(() => {
          updateThumbnail(thumbnailUrl).catch(() => {
            // 썸네일 업데이트 실패는 사용자에게 표시하지 않음
          });
        }, 30000);
      }
    } catch (err) {
      toast.error(handleApiError(err));
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleNext = () => {
    if (!uploadedPhotoUrl) {
      toast.error('사진을 올려야 매칭을 시작할 수 있어요');
      return;
    }
    setStep(3);
    router.push('/onboarding/traits');
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <StepIndicator
        current={2}
        total={4}
        title="나를 표현하는 사진 한 장"
        description="얼굴뿐 아니라 패션, 취미, 반려동물 등 나를 표현하는 사진이면 뭐든 OK"
      />

      {/* 업로드 영역 */}
      <div
        className="relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-brand-sand bg-brand-warm flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-brand-rose hover:bg-brand-rose-light/30"
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        role="button"
        aria-label="사진 업로드"
      >
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt="업로드한 사진 미리보기"
              fill
              className="object-cover rounded-2xl"
            />
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 text-brand-dark text-xs font-medium px-3 py-2 rounded-xl shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                사진 변경
              </button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                <div className="bg-white rounded-xl px-4 py-3 text-sm text-brand-dark font-medium">
                  업로드 중...
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-brand-light">
            <ImagePlus className="h-10 w-10" />
            <div className="text-center">
              <p className="text-sm font-medium">사진을 끌어다 놓거나 클릭하세요</p>
              <p className="text-xs mt-1">JPEG, PNG, WEBP · 최대 5MB</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = '';
        }}
      />

      <Button size="lg" fullWidth onClick={handleNext} disabled={isUploading}>
        다음
      </Button>
    </div>
  );
}

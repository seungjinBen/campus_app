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
import { detectActualFormat, normalizeToJpeg } from '@/lib/utils/imageConvert';

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export default function PhotoPage() {
  const router = useRouter();
  const { setStep, setPhotoUploaded, profileDraft } = useOnboardingStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState('업로드 중...');

  useEffect(() => {
    // 이전 스텝 완료 여부 체크
    if (!profileDraft) {
      router.replace('/onboarding/profile');
      return;
    }
    setStep(3);
  }, [profileDraft, router, setStep]);

  const handleFileSelect = async (file: File) => {
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('10MB 이하 사진만 올릴 수 있어요');
      return;
    }

    const format = await detectActualFormat(file);
    if (!format) {
      toast.error('사진 형식을 확인해 주세요 (JPEG, PNG, WEBP)');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      let fileToUpload = file;
      if (format === 'heic') {
        setUploadLabel('아이폰 사진 변환 중...');
        try {
          fileToUpload = await normalizeToJpeg(file);
        } catch {
          toast.error('아이폰 사진 변환에 실패했어요. 사진 앱에서 JPEG로 내보낸 뒤 다시 시도해 주세요.');
          setPreviewUrl(null);
          return;
        }
      }
      setUploadLabel('업로드 중...');
      const { photoUrl, thumbnailUrl } = await uploadPhoto(fileToUpload);
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
      setUploadLabel('업로드 중...');
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
    setStep(4);
    router.push('/onboarding/traits');
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <StepIndicator
        current={3}
        total={5}
        title="나를 표현하는 사진 한 장"
        description="얼굴뿐 아니라 패션, 취미, 반려동물 등 나를 표현하는 사진이면 뭐든 OK"
      />

      {/* 업로드 영역 */}
      <div
        className="relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-brand-sand bg-white flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-brand-rose hover:bg-brand-rose-light/40 shadow-card"
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
                  {uploadLabel}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-brand-light">
            <ImagePlus className="h-10 w-10" />
            <div className="text-center">
              <p className="text-sm font-medium">사진을 끌어다 놓거나 클릭하세요</p>
              <p className="text-xs mt-1">JPEG, PNG, WEBP, HEIC · 최대 10MB</p>
            </div>
          </div>
        )}
      </div>

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

      <Button size="lg" fullWidth onClick={handleNext} disabled={isUploading}>
        다음
      </Button>
    </div>
  );
}

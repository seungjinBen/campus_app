'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TopBar from '@/components/layout/TopBar';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { uploadPhoto, updateThumbnail, getMyPhotoUrl } from '@/lib/api/photo';
import { getMe, updateDeptFilter } from '@/lib/api/user';
import { DeptFilterMode } from '@/lib/types/user.types';
import { deleteAccount } from '@/lib/api/auth';
import { handleApiError } from '@/lib/api/handleApiError';
import { cn } from '@/lib/utils/cn';
import { ImagePlus, RefreshCw, LogOut, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { detectActualFormat, normalizeToJpeg } from '@/lib/utils/imageConvert';

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const DEPT_FILTER_OPTIONS: { mode: DeptFilterMode; label: string }[] = [
  { mode: 'ALL', label: '전체' },
  { mode: 'EXCLUDE_SAME', label: '내 과 제외' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const storeLogout = useAuthStore((s) => s.logout);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState('업로드 중...');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 매칭 학과 필터 — 인증된 학과가 있을 때만 섹션 표시
  const [deptFilterMode, setDeptFilterMode] = useState<DeptFilterMode>('ALL');
  const [myDepartment, setMyDepartment] = useState<string | null>(null);
  const [isSavingFilter, setIsSavingFilter] = useState(false);

  useEffect(() => {
    getMyPhotoUrl().then((url) => {
      if (url) setCurrentPhotoUrl(url);
    });
    getMe()
      .then((profile) => {
        setDeptFilterMode(profile.deptFilterMode);
        setMyDepartment(profile.verifiedDepartment);
      })
      .catch(() => {});
  }, []);

  const handleDeptFilterChange = async (mode: DeptFilterMode) => {
    if (mode === deptFilterMode || isSavingFilter) return;
    const prev = deptFilterMode;
    setDeptFilterMode(mode); // 낙관적 업데이트
    setIsSavingFilter(true);
    try {
      await updateDeptFilter(mode);
      toast.success('내일 카드부터 적용돼요');
    } catch (err) {
      setDeptFilterMode(prev); // 실패 시 롤백
      toast.error(handleApiError(err));
    } finally {
      setIsSavingFilter(false);
    }
  };

  const displayUrl = previewUrl ?? currentPhotoUrl;

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
      setCurrentPhotoUrl(photoUrl);
      setPreviewUrl(null);
      toast.success('사진이 변경됐어요');

      // 썸네일 URL 업데이트는 30초 후 (백그라운드 처리 대기)
      if (thumbnailUrl) {
        setTimeout(() => {
          updateThumbnail(thumbnailUrl).catch(() => {});
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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      storeLogout();
      toast.success('계정이 삭제됐어요');
      router.replace('/');
    } catch (err) {
      toast.error(handleApiError(err));
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream">
      <TopBar title="설정" showBack />

      <main className="flex-1 px-4 py-6 flex flex-col gap-8 max-w-sm mx-auto w-full">

        {/* 프로필 사진 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-brand-dark">프로필 사진</h2>
          <div
            className="relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-brand-sand bg-white flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-brand-rose hover:bg-brand-rose-light/40 shadow-card"
            onClick={() => !isUploading && fileInputRef.current?.click()}
            role="button"
            aria-label="사진 변경"
          >
            {displayUrl ? (
              <>
                <Image
                  src={displayUrl}
                  alt="프로필 사진"
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
                  <p className="text-sm font-medium">클릭해서 사진을 변경하세요</p>
                  <p className="text-xs mt-1">JPEG, PNG, WEBP · 최대 10MB</p>
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
        </section>

        {/* 매칭 학과 필터 — 인증된 학과가 있을 때만 표시 */}
        {myDepartment && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-brand-dark">매칭 학과 필터</h2>
            <p className="text-xs text-brand-mid">
              내 학과: <span className="font-medium text-brand-dark">{myDepartment}</span>
            </p>
            <div className="flex gap-2">
              {DEPT_FILTER_OPTIONS.map(({ mode, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleDeptFilterChange(mode)}
                  disabled={isSavingFilter}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl border text-sm transition-all disabled:opacity-60',
                    deptFilterMode === mode
                      ? 'border-brand-rose bg-brand-rose-light text-brand-rose font-semibold'
                      : 'border-brand-sand text-brand-mid hover:border-brand-rose/50 bg-white'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-brand-light">
              변경하면 내일 자정에 갱신되는 카드부터 적용돼요
            </p>
          </section>
        )}

        {/* 계정 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-brand-dark">계정</h2>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" fullWidth onClick={logout}>
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              회원탈퇴
            </Button>
          </div>
        </section>
      </main>

      {/* 회원탈퇴 확인 바텀시트 */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-t-2xl px-5 py-6 w-full max-w-lg flex flex-col gap-5 shadow-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-semibold text-brand-dark">정말 탈퇴할까요?</h3>
              <p className="text-sm text-brand-mid leading-relaxed">
                계정을 삭제하면 프로필, 사진, 매칭 내역이 모두 사라지며 되돌릴 수 없어요.
              </p>
              <p className="text-sm text-red-400 leading-relaxed">
                탈퇴 후 24시간이 지나야 같은 계정으로 재가입할 수 있어요.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="danger"
                fullWidth
                onClick={handleDeleteAccount}
                isLoading={isDeleting}
              >
                탈퇴하기
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

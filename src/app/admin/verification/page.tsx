'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminGetVerificationQueue,
  adminGetVerificationStats,
  adminReviewVerification,
  VerificationQueueItem,
  VerificationStats,
} from '@/lib/api/admin';
import { useAuthStore } from '@/lib/store/authStore';
import { handleApiError } from '@/lib/api/handleApiError';
import Button from '@/components/ui/Button';
import IconBadge from '@/components/ui/IconBadge';
import { Check, Loader2, RefreshCw, ShieldQuestion, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminVerificationPage() {
  const router = useRouter();
  const { isAdmin } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [queue, setQueue] = useState<VerificationQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAdmin) router.replace('/match');
  }, [mounted, isAdmin, router]);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [statsData, queueData] = await Promise.all([
        adminGetVerificationStats(),
        adminGetVerificationQueue(),
      ]);
      setStats(statsData);
      setQueue(queueData);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted || !isAdmin) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isAdmin]);

  const handleReview = async (verificationId: string, action: 'APPROVE' | 'REJECT') => {
    if (reviewingId) return;
    setReviewingId(verificationId);
    try {
      await adminReviewVerification(verificationId, action);
      toast.success(action === 'APPROVE' ? '승인했어요' : '거절했어요');
      // 처리된 항목은 목록에서 제거, 통계는 재조회
      setQueue((prev) => prev.filter((item) => item.verificationId !== verificationId));
      adminGetVerificationStats().then(setStats).catch(() => {});
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setReviewingId(null);
    }
  };

  if (!mounted || !isAdmin) return null;

  return (
    <div className="flex flex-col gap-5 px-4 py-5 pb-16">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-dark">인증 검수</h2>
        <button
          onClick={loadAll}
          disabled={isLoading}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-brand-sand bg-white text-brand-mid text-xs font-medium disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          새로고침
        </button>
      </div>

      {/* 통계 요약 — 자소서 지표 4종 실시간 확인 */}
      {stats && (
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="자동 승인율" value={`${Math.round(stats.autoApprovalRate * 100)}%`} />
          <StatCard
            label="평균 처리시간"
            value={stats.avgProcessingMs != null ? `${(stats.avgProcessingMs / 1000).toFixed(1)}초` : '-'}
          />
          <StatCard label="검수 대기" value={`${stats.needsReview}건`} highlight={stats.needsReview > 0} />
          <StatCard label="재시도 성공률" value={`${Math.round(stats.retrySuccessRate * 100)}%`} />
        </div>
      )}

      {stats && (
        <p className="text-xs text-brand-light">
          전체 {stats.total}건 · 자동 {stats.autoApproved} · 수동 {stats.manualApproved} · 재촬영{' '}
          {stats.retryRequested} · 거절 {stats.rejected} · LLM 호출 {stats.totalLlmCalls}회
        </p>
      )}

      {/* 검수 큐 */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-rose" />
        </div>
      ) : queue.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <IconBadge icon={Check} />
          <p className="text-sm text-brand-mid">검수 대기 건이 없어요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {queue.map((item) => (
            <div
              key={item.verificationId}
              className="bg-white rounded-2xl shadow-card border border-brand-sand p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldQuestion className="h-4 w-4 text-brand-rose" />
                  <p className="font-semibold text-brand-dark text-sm">
                    {item.nickname ?? '(닉네임 미설정)'}
                  </p>
                </div>
                {item.confidenceScore != null && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-warm text-brand-mid font-medium">
                    신뢰도 {Math.round(item.confidenceScore * 100)}%
                  </span>
                )}
              </div>

              {/* 추출 정보 */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <InfoRow label="대학" value={item.extractedUniversity} />
                <InfoRow label="이름" value={item.extractedName} />
                <InfoRow label="학번" value={item.extractedStudentNo} />
                <InfoRow label="학과" value={item.extractedDepartment} />
                <InfoRow label="생년월일" value={item.extractedBirthDate} />
                <InfoRow label="제출" value={new Date(item.createdAt).toLocaleString('ko-KR')} />
              </div>

              {/* AI 판단 근거 */}
              {item.decisionReason && (
                <div className="bg-brand-warm rounded-xl px-3 py-2.5 text-xs text-brand-mid leading-relaxed">
                  <span className="font-semibold text-brand-dark">AI 판단: </span>
                  {item.decisionReason}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => handleReview(item.verificationId, 'APPROVE')}
                  isLoading={reviewingId === item.verificationId}
                  disabled={reviewingId !== null && reviewingId !== item.verificationId}
                >
                  <Check className="h-3.5 w-3.5" />
                  승인
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => handleReview(item.verificationId, 'REJECT')}
                  disabled={reviewingId !== null}
                >
                  <X className="h-3.5 w-3.5" />
                  거절
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={
        highlight
          ? 'bg-brand-rose-light border border-brand-rose/20 rounded-2xl px-4 py-3'
          : 'bg-white border border-brand-sand rounded-2xl px-4 py-3 shadow-card'
      }
    >
      <p className="text-xs text-brand-mid">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${highlight ? 'text-brand-rose' : 'text-brand-dark'}`}>{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <p className="text-brand-mid">
      <span className="text-brand-light text-xs mr-1.5">{label}</span>
      <span className="text-brand-dark">{value ?? '-'}</span>
    </p>
  );
}

'use client';

import { ComponentType, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminGetVerificationQueue,
  adminGetVerificationStats,
  adminGetRejectedVerifications,
  adminReviewVerification,
  RejectedVerificationItem,
  VerificationQueueItem,
  VerificationStats,
} from '@/lib/api/admin';
import { useAuthStore } from '@/lib/store/authStore';
import { handleApiError } from '@/lib/api/handleApiError';
import Button from '@/components/ui/Button';
import IconBadge from '@/components/ui/IconBadge';
import { Bot, Check, Loader2, RefreshCw, ShieldQuestion, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'queue' | 'rejected';

export default function AdminVerificationPage() {
  const router = useRouter();
  const { isAdmin } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('queue');

  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [queue, setQueue] = useState<VerificationQueueItem[]>([]);
  const [rejected, setRejected] = useState<RejectedVerificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // 거절 사유 입력 상태 — verificationId → 입력 중인 note
  const [rejectNoteMap, setRejectNoteMap] = useState<Record<string, string>>({});
  // 거절 확인 모드로 진입한 카드 ID
  const [confirmingRejectId, setConfirmingRejectId] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAdmin) router.replace('/match');
  }, [mounted, isAdmin, router]);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [statsData, queueData, rejectedData] = await Promise.all([
        adminGetVerificationStats(),
        adminGetVerificationQueue(),
        adminGetRejectedVerifications(),
      ]);
      setStats(statsData);
      setQueue(queueData);
      setRejected(rejectedData);
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
    setConfirmingRejectId(null);
    try {
      const note = rejectNoteMap[verificationId];
      await adminReviewVerification(verificationId, action, note || undefined);
      toast.success(action === 'APPROVE' ? '승인했어요' : '거절했어요');
      setQueue((prev) => prev.filter((item) => item.verificationId !== verificationId));
      setRejectNoteMap((prev) => { const next = { ...prev }; delete next[verificationId]; return next; });
      Promise.all([adminGetVerificationStats(), adminGetRejectedVerifications()])
        .then(([s, r]) => { setStats(s); setRejected(r); })
        .catch(() => {});
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

      {/* 통계 요약 */}
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

      {/* 탭 */}
      <div className="flex gap-1 bg-brand-warm rounded-2xl p-1">
        <TabButton active={tab === 'queue'} onClick={() => setTab('queue')}>
          검수 대기
          {stats && stats.needsReview > 0 && (
            <span className="ml-1.5 bg-brand-rose text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {stats.needsReview}
            </span>
          )}
        </TabButton>
        <TabButton active={tab === 'rejected'} onClick={() => setTab('rejected')}>
          거절 내역
          {stats && stats.rejected > 0 && (
            <span className="ml-1.5 bg-brand-mid text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {stats.rejected}
            </span>
          )}
        </TabButton>
      </div>

      {/* 검수 대기 탭 */}
      {tab === 'queue' && (
        isLoading ? (
          <LoadingSpinner />
        ) : queue.length === 0 ? (
          <EmptyState icon={Check} message="검수 대기 건이 없어요" />
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
                    <MethodBadge method={item.verificationMethod} />
                  </div>
                  {item.confidenceScore != null && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-warm text-brand-mid font-medium">
                      신뢰도 {Math.round(item.confidenceScore * 100)}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  <InfoRow label="대학" value={item.extractedUniversity} />
                  <InfoRow label="이름" value={item.extractedName} />
                  <InfoRow label="학번" value={item.extractedStudentNo} />
                  <InfoRow label="학과" value={item.extractedDepartment} />
                  <InfoRow label="생년월일" value={item.extractedBirthDate} />
                  <InfoRow label="제출" value={new Date(item.createdAt).toLocaleString('ko-KR')} />
                </div>

                {item.decisionReason && (
                  <div className="bg-brand-warm rounded-xl px-3 py-2.5 text-xs text-brand-mid leading-relaxed">
                    <span className="font-semibold text-brand-dark">AI 판단: </span>
                    {item.decisionReason}
                  </div>
                )}

                {/* 거절 사유 입력 — 거절 확인 모드 진입 후 표시 */}
                {confirmingRejectId === item.verificationId ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      className="w-full rounded-xl border border-brand-sand bg-brand-warm text-sm text-brand-dark placeholder:text-brand-light px-3 py-2 resize-none outline-none focus:border-brand-rose transition-colors"
                      rows={2}
                      maxLength={500}
                      placeholder="거절 사유 입력 (선택, 최대 500자)"
                      value={rejectNoteMap[item.verificationId] ?? ''}
                      onChange={(e) =>
                        setRejectNoteMap((prev) => ({ ...prev, [item.verificationId]: e.target.value }))
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={() => setConfirmingRejectId(null)}
                        disabled={reviewingId !== null}
                      >
                        취소
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleReview(item.verificationId, 'REJECT')}
                        isLoading={reviewingId === item.verificationId}
                        disabled={reviewingId !== null && reviewingId !== item.verificationId}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                        거절 확인
                      </Button>
                    </div>
                  </div>
                ) : (
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
                      onClick={() => setConfirmingRejectId(item.verificationId)}
                      disabled={reviewingId !== null}
                    >
                      <X className="h-3.5 w-3.5" />
                      거절
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* 거절 내역 탭 */}
      {tab === 'rejected' && (
        isLoading ? (
          <LoadingSpinner />
        ) : rejected.length === 0 ? (
          <EmptyState icon={Check} message="거절된 건이 없어요" />
        ) : (
          <div className="flex flex-col gap-3">
            {rejected.map((item) => (
              <div
                key={item.verificationId}
                className="bg-white rounded-2xl shadow-card border border-brand-sand p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-400" />
                    <p className="font-semibold text-brand-dark text-sm">
                      {item.nickname ?? '(닉네임 미설정)'}
                    </p>
                    <MethodBadge method={item.verificationMethod} />
                  </div>
                  <RejectedByBadge rejectedBy={item.rejectedBy} />
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  <InfoRow label="대학" value={item.extractedUniversity} />
                  <InfoRow label="이름" value={item.extractedName} />
                  <InfoRow label="학번" value={item.extractedStudentNo} />
                  {item.confidenceScore != null && (
                    <InfoRow label="신뢰도" value={`${Math.round(item.confidenceScore * 100)}%`} />
                  )}
                  <InfoRow label="제출" value={new Date(item.createdAt).toLocaleString('ko-KR')} />
                  <InfoRow label="거절" value={new Date(item.rejectedAt).toLocaleString('ko-KR')} />
                </div>

                {/* AI 판단 근거 */}
                {item.decisionReason && (
                  <div className="bg-brand-warm rounded-xl px-3 py-2.5 text-xs text-brand-mid leading-relaxed">
                    <span className="font-semibold text-brand-dark">AI 판단: </span>
                    {item.decisionReason}
                  </div>
                )}

                {/* 관리자 거절 사유 */}
                {item.adminRejectionNote && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-xs text-red-700 leading-relaxed">
                    <span className="font-semibold">관리자 사유: </span>
                    {item.adminRejectionNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center py-2 rounded-xl text-sm font-semibold transition-colors ${
        active ? 'bg-white text-brand-dark shadow-card' : 'text-brand-mid'
      }`}
    >
      {children}
    </button>
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

function MethodBadge({ method }: { method: string }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-sand/60 text-brand-mid font-medium">
      {method === 'EVERYTIME_PROFILE' ? '에브리타임' : '세종대 QR'}
    </span>
  );
}

function RejectedByBadge({ rejectedBy }: { rejectedBy: 'AI' | 'ADMIN' }) {
  return rejectedBy === 'AI' ? (
    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-brand-warm text-brand-mid font-medium">
      <Bot className="h-3 w-3" />
      AI 거절
    </span>
  ) : (
    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">
      <User className="h-3 w-3" />
      수동 거절
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-brand-rose" />
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: ComponentType<{ className?: string | undefined }>; message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <IconBadge icon={Icon} />
      <p className="text-sm text-brand-mid">{message}</p>
    </div>
  );
}

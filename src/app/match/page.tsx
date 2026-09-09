'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { selectCandidate, sendNote, resetMyDailyCards } from '@/lib/api/match';
import { getMyReferral } from '@/lib/api/referral';
import { shareInviteToKakao } from '@/lib/utils/kakaoShare';
import { useMatchCards } from '@/lib/hooks/useMatchCards';
import { handleApiError } from '@/lib/api/handleApiError';
import { useAuthStore } from '@/lib/store/authStore';
import { SelectResult } from '@/lib/types/match.types';
import MatchCardList from '@/components/match/MatchCardList';
import MatchCardSkeleton from '@/components/match/MatchCardSkeleton';
import HeartBurst from '@/components/match/HeartBurst';
import Button from '@/components/ui/Button';
import IconBadge from '@/components/ui/IconBadge';
import { Calendar, Check, Copy, Heart, Mail, Moon, Search, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MatchPage() {
  const router = useRouter();
  const { isAdmin } = useAuthStore();
  const { state, setState, loadCards } = useMatchCards();
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 선택 결과 모달
  const [selectResult, setSelectResult] = useState<SelectResult | null>(null);
  const [confirmingNickname, setConfirmingNickname] = useState<string | null>(null);
  // 쪽지 작성 모달
  const [noteContent, setNoteContent] = useState('');
  const [isSendingNote, setIsSendingNote] = useState(false);
  // 초대 링크 복사
  const [isCopyingInvite, setIsCopyingInvite] = useState(false);
  // 연락처 복사 완료 표시 — 2초 뒤 원래 상태로
  const [contactCopied, setContactCopied] = useState(false);

  const handleCopyContact = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setContactCopied(true);
      setTimeout(() => setContactCopied(false), 2000);
    } catch {
      toast.error('복사에 실패했어요. 길게 눌러 직접 복사해 주세요');
    }
  };

  const handleInvite = async () => {
    if (isCopyingInvite) return;
    setIsCopyingInvite(true);
    try {
      const { code } = await getMyReferral();
      // 카카오톡 공유 우선 — SDK 미탑재/실패 시 클립보드 복사로 폴백
      if (!shareInviteToKakao(code)) {
        await navigator.clipboard.writeText(`${window.location.origin}/invite/${code}`);
        toast.success('초대 링크를 복사했어요! 친구에게 공유해 보세요');
      }
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsCopyingInvite(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handleSelectRequest = (candidateId: string) => {
    setConfirmingId(candidateId);
    if (state.type === 'cards') {
      const card = state.cards.find(c => c.candidateId === candidateId);
      setConfirmingNickname(card?.nickname ?? null);
    }
  };

  const handleSelectConfirm = useCallback(async () => {
    if (!confirmingId) return;
    setSelectingId(confirmingId);
    setConfirmingId(null);

    try {
      const result = await selectCandidate(confirmingId);
      setSelectResult(result);

      if (result.type === 'CONTACT_REVEALED') {
        // 선택 후 남은 횟수 반영
        if (state.type === 'cards') {
          const newRemaining = Math.max(0, state.remainingSelectCount - 1);
          setState({ ...state, remainingSelectCount: newRemaining });
        }
      }
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSelectingId(null);
    }
  }, [confirmingId, state, setState]);

  const handleSendNote = async () => {
    if (!selectResult?.selectedId || !noteContent.trim()) return;
    if (noteContent.trim().length > 50) {
      toast.error('쪽지는 50자 이내로 작성해 주세요');
      return;
    }
    setIsSendingNote(true);
    try {
      await sendNote(selectResult.selectedId, noteContent.trim());
      toast.success('쪽지를 전달했어요');
      setSelectResult(null);
      setNoteContent('');
      // 선택 후 남은 횟수 반영
      if (state.type === 'cards') {
        const newRemaining = Math.max(0, state.remainingSelectCount - 1);
        setState({ ...state, remainingSelectCount: newRemaining });
      }
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsSendingNote(false);
    }
  };

  const handleAdminReset = async () => {
    setIsResetting(true);
    try {
      await resetMyDailyCards();
      await loadCards(true);
    } catch {
      toast.error('초기화에 실패했어요');
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    if (state.type === 'error') {
      const errMsg = (state as { type: 'error'; message: string }).message;
      if (errMsg.includes('프로필')) {
        toast('프로필을 먼저 완성해 주세요');
        router.replace('/onboarding/profile');
      }
    }
  }, [state, router]);

  return (
    <div className="flex flex-col gap-4">
      {mounted && isAdmin && (
        <div className="flex items-center gap-2">
          <Link href="/admin/add-user">
            <Button variant="secondary" size="sm">사람 추가</Button>
          </Link>
          <Link href="/admin/verification">
            <Button variant="secondary" size="sm">인증 검수</Button>
          </Link>
          <button
            onClick={handleAdminReset}
            disabled={isResetting}
            className="ml-auto py-1.5 px-3 rounded-xl border border-brand-sand bg-brand-warm text-brand-mid text-xs font-medium disabled:opacity-50"
          >
            {isResetting ? '초기화 중...' : '카드 초기화'}
          </button>
        </div>
      )}

      {state.type === 'loading' && (
        <>
          {/* 스피너 대신 카드 골격 — 실제 카드와 같은 높이를 미리 차지해 도착 시 화면이 밀리지 않는다 */}
          <p className="sr-only" role="status">카드를 불러오는 중이에요</p>
          <MatchCardSkeleton />
        </>
      )}

      {state.type === 'terminated' && (
        <div className="flex flex-col gap-5 py-8 px-1">
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-dark leading-snug">
              캠퍼스한장 매칭 서비스가<br />종료되었습니다.
            </p>
          </div>

          <div className="bg-brand-cream rounded-2xl p-5 text-sm text-brand-mid leading-relaxed flex flex-col gap-4">
            <p>
              5월 19일부터 22일까지, 짧은 운영 기간이었지만 220명이 넘는 분들이 함께해 주셨습니다.
            </p>
            <p>
              매칭 시스템이 시작되기도 전, 아무것도 없는 상태에서 저를 믿고 먼저 가입해주신 초기 유저분들께 특히 감사드립니다. 그 믿음이 없었다면 이 서비스는 시작조차 못했을 거예요.
            </p>
            <p>
              캠퍼스한장은 축제 매칭부스의 무작위 번호 교환이 아닌, 조금 더 자신의 이상형에 부합하는 상대를 찾을 수 있으면 좋겠다는 생각에서 시작되었습니다. 그 작은 아이디어가 220명이 넘는 분들께 닿을 수 있었다는 것, 운영자로서 정말 만족스럽고 감사한 경험이었습니다.
            </p>

            <div className="border-t border-brand-sand pt-4 flex flex-col gap-2">
              <p className="font-semibold text-brand-dark">📬 쪽지함은 5월 29일까지 유지됩니다.</p>
              <p>
                다른 분들이 보내주신 쪽지를 아직 확인하지 못하셨다면, 마지막으로 꼭 확인해보세요.<br />
                캠퍼스한장을 통해 소중한 인연이 만들어졌길 진심으로 바랍니다 🍀
              </p>
            </div>

            <div className="border-t border-brand-sand pt-4">
              <p>
                서비스를 이용하시며 느끼신 점이나 개선 의견이 있으시다면<br />
                캠퍼스한장 계정으로 쪽지 주세요.<br />
                소중한 의견을 모아 더 좋은 모습으로 돌아오겠습니다.
              </p>
            </div>

            <p className="text-center font-medium text-brand-dark">감사합니다.</p>
          </div>

          <Link href="/match/received">
            <Button variant="primary" size="lg" fullWidth>수신함 확인하기</Button>
          </Link>
        </div>
      )}

      {state.type === 'waiting' && (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <IconBadge icon={Calendar} />
          <div>
            <p className="text-xl font-bold text-brand-dark">곧 시작돼요</p>
            {/* TODO: 기획 확인 필요 — 가을축제 오픈일 확정 시 날짜 명시 */}
            <p className="text-sm text-brand-mid mt-3 leading-relaxed">
              매칭은 <span className="font-semibold text-brand-rose">축제 기간</span>에 공식 오픈돼요.<br />
              조금만 기다려 주세요!
            </p>
          </div>
          <Link href="/settings">
            <Button variant="secondary" size="lg">프로필 사진 수정하기</Button>
          </Link>
        </div>
      )}

      {state.type === 'limit_reached' && (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <IconBadge icon={Moon} />
          <div>
            <p className="text-xl font-bold text-brand-dark">오늘 선택을 모두 사용했어요</p>
            <p className="text-sm text-brand-mid mt-2 leading-relaxed">
              내일 자정에 새로운 선택 기회가 생겨요.<br />
              받은 쪽지나 연락처를 확인해 보세요!
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button variant="primary" size="lg" onClick={handleInvite} isLoading={isCopyingInvite}>
              <UserPlus className="h-4 w-4" />
              친구 초대하고 오늘 선택 +1
            </Button>
            <Link href="/match/received">
              <Button variant="secondary" size="lg">수신함 보기</Button>
            </Link>
          </div>
        </div>
      )}

      {state.type === 'empty' && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <IconBadge icon={Search} />
          <div>
            <p className="text-xl font-bold text-brand-dark">아직 등록된 분이 없어요</p>
            <p className="text-sm text-brand-mid mt-2 leading-relaxed">
              곧 더 많은 분들이 합류할 예정이에요.<br />조금만 기다려 주세요!
            </p>
          </div>
          <Button variant="secondary" onClick={() => loadCards(true)}>
            다시 확인하기
          </Button>
        </div>
      )}

      {state.type === 'cards' && (
        <>
          {/* 남은 선택 횟수 표시 */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-brand-mid">
              오늘의 카드 <span className="font-semibold text-brand-dark">{state.cards.length}장</span>
            </p>
            <p className="text-xs text-brand-mid">
              남은 선택{' '}
              <span className={`font-semibold ${state.remainingSelectCount <= 1 ? 'text-brand-rose' : 'text-brand-dark'}`}>
                {state.remainingSelectCount}/{state.dailySelectLimit}
              </span>
            </p>
          </div>

          {state.remainingSelectCount === 0 && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-brand-cream rounded-xl text-sm text-brand-mid">
              <Moon className="h-4 w-4 text-brand-mid flex-shrink-0" />
              <p>오늘 선택을 모두 사용했어요. 내일 자정에 초기화돼요.</p>
            </div>
          )}

          {/* 친구 초대 배너 — 초대한 친구가 인증까지 완료하면 당일 선택 +1 */}
          <button
            onClick={handleInvite}
            disabled={isCopyingInvite}
            className="flex items-center gap-3 px-4 py-3 bg-brand-rose-light border border-brand-rose/15 rounded-2xl text-left transition-all active:scale-[0.99] disabled:opacity-60"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-rose/10 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-4 h-4 text-brand-rose" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-dark">친구 초대하고 오늘 선택 +1</p>
              <p className="text-xs text-brand-mid mt-0.5">친구가 가입하고 학생인증까지 마치면 적용돼요</p>
            </div>
          </button>

          <MatchCardList
            cards={state.cards}
            onSelect={handleSelectRequest}
            selectingId={selectingId}
          />
        </>
      )}

      {state.type === 'error' && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-brand-mid text-sm">{(state as { type: 'error'; message: string }).message}</p>
          <Button variant="secondary" onClick={() => loadCards()}>
            다시 시도
          </Button>
        </div>
      )}

      {/* 선택 확인 모달 */}
      {confirmingId && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setConfirmingId(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-4 shadow-modal animate-sheetUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <p className="font-semibold text-brand-dark text-base">
                {confirmingNickname ? `'${confirmingNickname}'님을 선택하시겠어요?` : '이분을 선택하시겠어요?'}
              </p>
              <p className="text-sm text-brand-mid mt-2 leading-relaxed">
                이상형 일치율에 따라 연락처가 바로 공개되거나<br />쪽지를 보낼 수 있어요.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="lg" fullWidth onClick={() => setConfirmingId(null)}>
                취소
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleSelectConfirm}
                isLoading={!!selectingId}
              >
                선택하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 선택 결과 모달 — CONTACT_REVEALED. 서비스에서 가장 감정이 고조되는 순간이라
          모달 진입 → 하트 pop → 파티클 → 연락처 지연 등장의 시퀀스로 연출한다 */}
      {selectResult?.type === 'CONTACT_REVEALED' && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setSelectResult(null)}
        >
          <div
            className="relative bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-4 shadow-modal animate-sheetUp"
            onClick={(e) => e.stopPropagation()}
          >
            <HeartBurst />
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="animate-popIn [animation-delay:120ms]">
                  <IconBadge icon={Heart} />
                </div>
              </div>
              <p className="font-bold text-brand-dark text-lg whitespace-pre-line">
                {selectResult.message.replace(/\s*💘\s*/g, '\n')}
              </p>
              {selectResult.contactValue && (
                // 0.4초 지연 — 축하 문구를 먼저 읽히고 연락처를 뒤이어 공개하는 "두구두구" 간격
                <div className="mt-4 p-3 bg-brand-cream rounded-xl flex items-center gap-3 animate-riseIn [animation-delay:400ms]">
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-brand-mid mb-1">
                      {selectResult.contactType === 'INSTAGRAM' ? '인스타그램' : '카카오톡'}
                    </p>
                    <p className="font-semibold text-brand-dark text-base break-all">
                      {selectResult.contactValue}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyContact(selectResult.contactValue!)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-brand-sand text-xs font-semibold text-brand-mid transition-transform duration-200 ease-spring active:scale-90"
                    aria-label="연락처 복사"
                  >
                    {contactCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-brand-rose" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        복사
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            <Button variant="primary" size="lg" fullWidth onClick={() => setSelectResult(null)}>
              확인했어요
            </Button>
          </div>
        </div>
      )}

      {/* 쪽지 작성 모달 — NOTE_REQUIRED */}
      {selectResult?.type === 'NOTE_REQUIRED' && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4 animate-fadeIn"
          onClick={() => { setSelectResult(null); setNoteContent(''); }}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-4 shadow-modal animate-sheetUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <IconBadge icon={Mail} />
              </div>
              <p className="font-bold text-brand-dark text-base">
                {selectResult.message.replace(/\s*💌\s*/g, '')}
              </p>
            </div>
            <div>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value.slice(0, 50))}
                placeholder="50자 이내로 마음을 전해보세요"
                className="w-full h-24 px-4 py-3 text-sm border border-brand-sand rounded-xl resize-none focus:outline-none focus:border-brand-rose focus:ring-2 focus:ring-brand-rose/20 bg-brand-warm text-brand-dark placeholder:text-brand-light"
              />
              <p className="text-right text-xs text-brand-light mt-1">{noteContent.length}/50</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => { setSelectResult(null); setNoteContent(''); }}
              >
                나중에
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleSendNote}
                isLoading={isSendingNote}
                disabled={!noteContent.trim()}
              >
                보내기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

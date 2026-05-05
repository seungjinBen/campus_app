'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { selectCandidate, sendNote, resetMyDailyCards } from '@/lib/api/match';
import { useMatchCards } from '@/lib/hooks/useMatchCards';
import { handleApiError } from '@/lib/api/handleApiError';
import { useAuthStore } from '@/lib/store/authStore';
import { SelectResult } from '@/lib/types/match.types';
import MatchCardList from '@/components/match/MatchCardList';
import Button from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
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
  // 쪽지 작성 모달
  const [noteContent, setNoteContent] = useState('');
  const [isSendingNote, setIsSendingNote] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handleSelectRequest = (candidateId: string) => {
    setConfirmingId(candidateId);
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
          const newRemaining = state.remainingSelectCount - 1;
          if (newRemaining <= 0) {
            setState({ type: 'limit_reached' });
          } else {
            setState({ type: 'cards', cards: state.cards, remainingSelectCount: newRemaining });
          }
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
      toast.success('쪽지를 전달했어요 💌');
      setSelectResult(null);
      setNoteContent('');
      // 선택 후 남은 횟수 반영
      if (state.type === 'cards') {
        const newRemaining = state.remainingSelectCount - 1;
        if (newRemaining <= 0) {
          setState({ type: 'limit_reached' });
        } else {
          setState({ type: 'cards', cards: state.cards, remainingSelectCount: newRemaining });
        }
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
        toast('프로필을 먼저 완성해 주세요', { icon: '⚠️' });
        router.replace('/onboarding/profile');
      }
    }
  }, [state, router]);

  return (
    <div className="flex flex-col gap-4">
      {mounted && isAdmin && (
        <div className="flex justify-between items-center">
          <Link href="/admin/add-user">
            <Button variant="secondary" size="sm">사람 추가하기</Button>
          </Link>
          <button
            onClick={handleAdminReset}
            disabled={isResetting}
            className="py-1.5 px-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-xs font-medium disabled:opacity-50"
          >
            {isResetting ? '초기화 중...' : '🛠 카드 초기화'}
          </button>
        </div>
      )}

      {state.type === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-rose" />
          <p className="text-sm text-brand-mid">카드를 불러오는 중이에요...</p>
        </div>
      )}

      {state.type === 'waiting' && (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <div className="text-6xl">🌸</div>
          <div>
            <p className="text-xl font-bold text-brand-dark">5월 6일 자정부터 시작돼요</p>
            <p className="text-sm text-brand-mid mt-3 leading-relaxed">
              매칭 서비스는 <span className="font-semibold text-brand-rose">2026년 5월 6일 00:00</span>에<br />
              공식 오픈돼요. 조금만 기다려 주세요!
            </p>
          </div>
          <Link href="/settings">
            <Button variant="secondary" size="lg">프로필 사진 수정하기</Button>
          </Link>
        </div>
      )}

      {state.type === 'limit_reached' && (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <div className="text-5xl">🌙</div>
          <div>
            <p className="text-xl font-bold text-brand-dark">오늘 선택을 모두 사용했어요</p>
            <p className="text-sm text-brand-mid mt-2 leading-relaxed">
              내일 자정에 다시 3번의 선택 기회가 생겨요.<br />
              받은 쪽지나 연락처를 확인해 보세요!
            </p>
          </div>
          <Link href="/match/received">
            <Button variant="secondary" size="lg">수신함 보기</Button>
          </Link>
        </div>
      )}

      {state.type === 'empty' && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="text-5xl">🔍</div>
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
                {state.remainingSelectCount}/3
              </span>
            </p>
          </div>

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
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
          onClick={() => setConfirmingId(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <p className="font-semibold text-brand-dark text-base">이분을 선택하시겠어요?</p>
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

      {/* 선택 결과 모달 — CONTACT_REVEALED */}
      {selectResult?.type === 'CONTACT_REVEALED' && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
          onClick={() => setSelectResult(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">💘</div>
              <p className="font-bold text-brand-dark text-lg whitespace-pre-line">
                {selectResult.message.replace(/\s*💘\s*/g, '\n')}
              </p>
              {selectResult.contactValue && (
                <div className="mt-4 p-3 bg-brand-cream rounded-xl">
                  <p className="text-xs text-brand-mid mb-1">
                    {selectResult.contactType === 'INSTAGRAM' ? '인스타그램' : '카카오톡'}
                  </p>
                  <p className="font-semibold text-brand-dark text-base">{selectResult.contactValue}</p>
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
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
          onClick={() => { setSelectResult(null); setNoteContent(''); }}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">💌</div>
              <p className="font-bold text-brand-dark text-base">
                {selectResult.message.replace(/\s*💌\s*/g, '')}
              </p>
            </div>
            <div>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value.slice(0, 50))}
                placeholder="50자 이내로 마음을 전해보세요"
                className="w-full h-24 px-4 py-3 text-sm border border-[#E5E7EB] rounded-xl resize-none focus:outline-none focus:border-brand-rose"
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

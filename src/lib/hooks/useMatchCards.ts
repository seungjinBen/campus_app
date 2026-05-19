'use client';

import { useState, useCallback, useRef } from 'react';
import { getMatchCards } from '@/lib/api/match';
import { MatchCard } from '@/lib/types/match.types';
import { getApiErrorCode } from '@/lib/api/handleApiError';

export type MatchPageState =
  | { type: 'loading' }
  | { type: 'cards'; cards: MatchCard[]; remainingSelectCount: number }
  | { type: 'empty' }
  | { type: 'limit_reached' }
  | { type: 'waiting' }
  | { type: 'error'; message: string };

export function useMatchCards() {
  const [state, setState] = useState<MatchPageState>({ type: 'loading' });
  // StrictMode 이중 실행 방지
  const loadingRef = useRef(false);

  const loadCards = useCallback(async (force = false) => {
    if (!force && loadingRef.current) return;
    loadingRef.current = true;

    try {
      setState({ type: 'loading' });

      const { cards, remainingSelectCount } = await getMatchCards();

      if (cards.length === 0) {
        setState({ type: 'empty' });
        return;
      }

      setState({ type: 'cards', cards, remainingSelectCount });
    } catch (err: unknown) {
      const code = getApiErrorCode(err);

      if (code === 'MATCHING_NOT_AVAILABLE') {
        setState({ type: 'waiting' });
      } else if (code === 'DAILY_SELECT_LIMIT_EXCEEDED') {
        setState({ type: 'limit_reached' });
      } else if (code === 'NO_CANDIDATES') {
        setState({ type: 'empty' });
      } else if (code === 'RATE_LIMIT_EXCEEDED') {
        setState({ type: 'error', message: '잠시 후 다시 시도해 주세요' });
      } else {
        setState({ type: 'error', message: '카드를 불러올 수 없어요' });
      }
    } finally {
      loadingRef.current = false;
    }
  }, []);

  return { state, setState, loadCards };
}

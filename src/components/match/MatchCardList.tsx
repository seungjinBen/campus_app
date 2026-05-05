'use client';

import { MatchCard as MatchCardType } from '@/lib/types/match.types';
import MatchCard from './MatchCard';

interface MatchCardListProps {
  cards: MatchCardType[];
  onSelect: (candidateId: string) => void;
  selectingId: string | null;
}

export default function MatchCardList({ cards, onSelect, selectingId }: MatchCardListProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <MatchCard
          key={card.candidateId}
          card={card}
          onSelect={onSelect}
          isSelecting={selectingId === card.candidateId}
        />
      ))}
    </div>
  );
}

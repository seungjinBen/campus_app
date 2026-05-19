'use client';

import { MatchCard as MatchCardType } from '@/lib/types/match.types';
import MatchCard from './MatchCard';

interface MatchCardListProps {
  cards: MatchCardType[];
  onSelect: (candidateId: string) => void;
  selectingId: string | null;
  selectionDisabled?: boolean;
}

export default function MatchCardList({ cards, onSelect, selectingId, selectionDisabled }: MatchCardListProps) {
  return (
    <div className="flex flex-col gap-8">
      {cards.map((card, index) => (
        <MatchCard
          key={card.candidateId}
          card={card}
          index={index + 1}
          onSelect={onSelect}
          isSelecting={selectingId === card.candidateId}
          selectionDisabled={selectionDisabled ?? false}
        />
      ))}
    </div>
  );
}

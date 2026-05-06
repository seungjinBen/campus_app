'use client';

import Image from 'next/image';
import { MatchCard as MatchCardType } from '@/lib/types/match.types';
import { formatTraitBadge } from '@/lib/utils/traitLabel';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface MatchCardProps {
  card: MatchCardType;
  onSelect: (candidateId: string) => void;
  isSelecting: boolean;
}

export default function MatchCard({ card, onSelect, isSelecting }: MatchCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-sand overflow-hidden animate-fadeIn">
      {/* 사진 영역 */}
      <div className="relative w-full h-40">
        <Image
          src={card.photoUrl}
          alt={`${card.nickname}의 프로필 사진`}
          fill
          className="object-cover"
          sizes="(max-width: 448px) 50vw, 224px"
        />
      </div>

      {/* 정보 영역 */}
      <div className="px-3 py-3 flex flex-col gap-2">
        <h3 className="font-semibold text-brand-dark text-sm truncate">{card.nickname}</h3>

        {card.visibleTraits.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.visibleTraits.map(({ traitKey, traitValue }) => (
              <Badge key={traitKey} variant="rose" className="text-xs">
                {formatTraitBadge(traitKey, traitValue)}
              </Badge>
            ))}
          </div>
        )}

        <Button
          size="sm"
          fullWidth
          onClick={() => onSelect(card.candidateId)}
          isLoading={isSelecting}
        >
          선택하기
        </Button>
      </div>
    </div>
  );
}

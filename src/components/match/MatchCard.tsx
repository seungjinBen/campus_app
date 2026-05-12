'use client';

import Image from 'next/image';
import { MatchCard as MatchCardType } from '@/lib/types/match.types';
import { formatTraitBadge } from '@/lib/utils/traitLabel';
import Button from '@/components/ui/Button';

interface MatchCardProps {
  card: MatchCardType;
  onSelect: (candidateId: string) => void;
  isSelecting: boolean;
}

export default function MatchCard({ card, onSelect, isSelecting }: MatchCardProps) {
  const heightTrait = card.visibleTraits.find(t => t.traitKey === 'HEIGHT');
  const mbtiTrait = card.visibleTraits.find(t => t.traitKey === 'MBTI');
  const badgeTraits = card.visibleTraits.filter(
    t => t.traitKey !== 'HEIGHT' && t.traitKey !== 'MBTI'
  );

  const headerInfo = [
    heightTrait && `키 ${heightTrait.traitValue}`,
    mbtiTrait?.traitValue,
  ].filter(Boolean).join(' · ');

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-card border border-brand-sand animate-fadeIn">
      {/* 사진 — 전체 */}
      <div className="relative w-full aspect-[2/3]">
        <Image
          src={card.photoUrl}
          alt={`${card.nickname}의 프로필 사진`}
          fill
          className="object-cover"
          sizes="(max-width: 448px) 50vw, 224px"
        />
      </div>

      {/* 하단 정보 + 버튼 오버레이 */}
      <div className="absolute bottom-0 inset-x-0 bg-brand-cream/95 backdrop-blur-sm rounded-b-2xl px-3 pt-2.5 pb-3 flex flex-col gap-2">
        <div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <h3 className="font-bold text-brand-dark text-sm leading-tight">{card.nickname}</h3>
            {headerInfo && (
              <span className="text-xs text-brand-mid">{headerInfo}</span>
            )}
          </div>
          {badgeTraits.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {badgeTraits.slice(0, 4).map(({ traitKey, traitValue }) => (
                <span
                  key={traitKey}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-brand-sand text-brand-mid font-medium"
                >
                  {formatTraitBadge(traitKey, traitValue)}
                </span>
              ))}
            </div>
          )}
        </div>

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

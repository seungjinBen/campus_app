'use client';

import Image from 'next/image';
import { MatchCard as MatchCardType } from '@/lib/types/match.types';
import { formatTraitBadge } from '@/lib/utils/traitLabel';

interface MatchCardProps {
  card: MatchCardType;
  index: number;
  onSelect: (candidateId: string) => void;
  isSelecting: boolean;
}

export default function MatchCard({ card, index, onSelect, isSelecting }: MatchCardProps) {
  const heightTrait = card.visibleTraits.find(t => t.traitKey === 'HEIGHT');
  const mbtiTrait = card.visibleTraits.find(t => t.traitKey === 'MBTI');
  const badgeTraits = card.visibleTraits.filter(
    t => t.traitKey !== 'HEIGHT' && t.traitKey !== 'MBTI'
  );

  const infoLine = [
    heightTrait && `키 ${heightTrait.traitValue}`,
    mbtiTrait?.traitValue,
  ].filter(Boolean).join(' · ');

  const cardNo = `NO. ${String(index).padStart(2, '0')}`;
  const header = card.university ? `${cardNo} · ${card.university}` : cardNo;

  return (
    <div className="flex flex-col gap-3 animate-fadeIn">
      {/* NO. XX · 대학교 */}
      <p className="text-xs font-semibold text-brand-mid tracking-wide px-1">{header}</p>

      {/* 사진 */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-card">
        <Image
          src={card.photoUrl}
          alt={`${card.nickname}의 프로필 사진`}
          fill
          className="object-cover"
          sizes="(max-width: 448px) 100vw, 448px"
        />
      </div>

      {/* 정보 + 선택 버튼 */}
      <div className="flex items-end justify-between px-1 gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <h3 className="font-bold text-brand-dark text-xl leading-tight">{card.nickname}</h3>
          {infoLine && (
            <p className="text-sm text-brand-mid">{infoLine}</p>
          )}
          {badgeTraits.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {badgeTraits.map(({ traitKey, traitValue }) => (
                <span
                  key={traitKey}
                  className="text-xs px-2.5 py-1 rounded-full bg-white border border-brand-sand text-brand-mid font-medium"
                >
                  {formatTraitBadge(traitKey, traitValue)}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onSelect(card.candidateId)}
          disabled={isSelecting}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-brand-dark text-white text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all"
        >
          {isSelecting ? '선택 중' : '선택 →'}
        </button>
      </div>
    </div>
  );
}

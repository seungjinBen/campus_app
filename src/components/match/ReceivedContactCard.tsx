'use client';

import Image from 'next/image';
import { ReceivedContact } from '@/lib/types/match.types';
import { formatTraitBadge } from '@/lib/utils/traitLabel';
import Badge from '@/components/ui/Badge';
import { Eye } from 'lucide-react';

const BADGE_COLORS = ['rose', 'blue', 'violet', 'emerald', 'amber'] as const;

interface ReceivedContactCardProps {
  item: ReceivedContact;
}

export default function ReceivedContactCard({ item }: ReceivedContactCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-sand overflow-hidden animate-fadeIn">
      <div className="flex gap-4 p-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={item.photoUrl}
            alt={`${item.nickname}의 프로필 사진`}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-brand-dark text-sm">{item.nickname}</p>
            <span className="flex items-center gap-0.5 text-xs text-brand-rose font-medium">
              <Eye className="h-3 w-3" />
              열람
            </span>
          </div>

          {item.visibleTraits.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.visibleTraits.map(({ traitKey, traitValue }, i) => (
                <Badge key={traitKey} variant={BADGE_COLORS[i % BADGE_COLORS.length]} className="text-xs">
                  {formatTraitBadge(traitKey, traitValue)}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-xs text-brand-light mt-2">
            {new Date(item.selectedAt).toLocaleDateString('ko-KR')} 내 연락처를 확인했어요
          </p>
        </div>
      </div>
    </div>
  );
}

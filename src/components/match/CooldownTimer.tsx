'use client';

import { useCooldown } from '@/lib/hooks/useCooldown';
import { formatRemainingTime } from '@/lib/utils/format';
import { Clock } from 'lucide-react';

interface CooldownTimerProps {
  nextAvailableAt: string;
  onExpire?: () => void;
}

export default function CooldownTimer({ nextAvailableAt, onExpire }: CooldownTimerProps) {
  const { remainingSeconds, isExpired } = useCooldown(nextAvailableAt);

  if (isExpired) {
    onExpire?.();
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-rose-light flex items-center justify-center">
        <Clock className="h-7 w-7 text-brand-rose" />
      </div>
      <div>
        <p className="text-brand-dark font-semibold text-base">다음 매칭까지</p>
        <p className="text-3xl font-bold text-brand-rose mt-2 tabular-nums">
          {formatRemainingTime(remainingSeconds)}
        </p>
      </div>
      <p className="text-sm text-brand-light">쿨다운이 끝나면 자동으로 새 카드를 보여드려요</p>
    </div>
  );
}

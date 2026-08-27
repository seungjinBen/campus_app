'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useInView } from '@/lib/hooks/useInView';
import { cn } from '@/lib/utils/cn';

const TARGET_PERCENT = 75;
const DURATION_MS = 1200;

// 일치율 게이지 연출 — 뷰포트 진입 시 0→75% 카운트업, 도달 순간 연락처 카드 공개
export default function MatchGauge() {
  const { ref, inView } = useInView<HTMLDivElement>(0.5);
  const [percent, setPercent] = useState(0);
  const revealed = percent >= TARGET_PERCENT;

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPercent(TARGET_PERCENT);
      return;
    }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setPercent(Math.round(eased * TARGET_PERCENT));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <div ref={ref} className="flex flex-col gap-4">
      {/* 게이지 */}
      <div className="bg-white rounded-2xl border border-brand-sand shadow-card p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-brand-mid">이상형 일치율</span>
          <span className={cn('text-lg font-bold tabular-nums', revealed ? 'text-brand-rose' : 'text-brand-dark')}>
            {percent}%
          </span>
        </div>
        <div
          className="w-full h-2.5 bg-brand-warm rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-rose/70 to-brand-rose"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* 75% 도달 순간 연락처 카드 공개 */}
      <div
        className={cn(
          'bg-white rounded-2xl border border-brand-rose/20 shadow-card p-4 flex items-center gap-3',
          'transition-all duration-500 ease-out motion-reduce:transition-none',
          revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        )}
        aria-hidden={!revealed}
      >
        <div className="w-8 h-8 rounded-xl bg-brand-rose/10 flex items-center justify-center flex-shrink-0">
          <Heart className="w-4 h-4 text-brand-rose fill-brand-rose/30" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-brand-mid">당신이 이상형이에요! 연락처가 공개됐어요</p>
          <p className="font-semibold text-brand-dark text-sm mt-0.5">@campus_hanjang</p>
        </div>
      </div>
    </div>
  );
}

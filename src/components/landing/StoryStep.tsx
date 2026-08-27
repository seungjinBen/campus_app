'use client';

import { ReactNode } from 'react';
import { useInView } from '@/lib/hooks/useInView';
import { cn } from '@/lib/utils/cn';

// 뷰포트 진입 시 페이드+슬라이드 등장하는 스크롤 스토리 섹션 래퍼
export default function StoryStep({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, inView } = useInView<HTMLElement>(0.3);

  return (
    <section
      ref={ref}
      className={cn(
        'px-6 py-10 transition-all duration-700 ease-out motion-reduce:transition-none',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        className
      )}
    >
      {children}
    </section>
  );
}

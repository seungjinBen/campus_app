'use client';

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * OS의 "동작 줄이기" 설정 구독.
 * CSS 애니메이션은 globals.css의 전역 가드가 처리하고, 이 훅은 JS로 생성되는 연출
 * (하트 파티클 등)을 아예 만들지 않기 위해 쓴다 — WCAG 2.3.3.
 *
 * SSR에는 matchMedia가 없으므로 초기값은 false(모션 허용)로 두고 마운트 후 동기화한다.
 * 하이드레이션 불일치를 피하려면 이 값에 의존하는 연출은 마운트 이후에만 실행해야 한다.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    setPrefersReduced(mediaQuery.matches);

    const onChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return prefersReduced;
}

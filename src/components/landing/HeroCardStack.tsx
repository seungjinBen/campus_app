'use client';

import { useEffect, useRef, useState } from 'react';
import MockMatchCard from './MockMatchCard';

// 동일 색조의 은은한 파스텔 + 톤 매칭 아바타 실루엣 — 낮은 채도로 깔끔한 톤 유지
const CARDS = [
  { nickname: '단풍', birthYear: '03년생', dept: '경영학과', accent: 'text-rose-300', gradient: 'from-rose-100 to-rose-50', chip: '일치율 82%' },
  { nickname: '새벽', birthYear: '02년생', dept: '컴퓨터공학과', accent: 'text-sky-300', gradient: 'from-sky-100 to-sky-50', chip: '일치율 78%' },
  { nickname: '라떼', birthYear: '04년생', dept: '호텔관광경영학과', accent: 'text-amber-300', gradient: 'from-amber-100 to-amber-50', chip: '일치율 91%' },
  { nickname: '슬램', birthYear: '01년생', dept: '체육학과', accent: 'text-emerald-300', gradient: 'from-emerald-100 to-emerald-50', chip: '일치율 75%' },
];

const SWIPE_THRESHOLD_PX = 80;
const AUTO_SHUFFLE_MS = 5000;

/**
 * 인터랙티브 3D 카드 스택 — 라이브러리 없이 PointerEvent 직접 구현.
 * 드래그 중에는 리렌더를 우회하고 CSS 변수(--dx)를 직접 조작해 60fps 유지,
 * 종료 시점에만 React 상태(order)를 갱신한다.
 */
export default function HeroCardStack() {
  const [order, setOrder] = useState<number[]>(CARDS.map((_, i) => i));
  const topRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const animating = useRef(false);
  const startX = useRef(0);
  const dx = useRef(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const rotateOrder = () => setOrder((prev) => [...prev.slice(1), prev[0]]);

  const animateOut = (dir: 1 | -1) => {
    const el = topRef.current;
    if (!el || animating.current) return;
    animating.current = true;

    if (reducedMotion.current) {
      rotateOrder();
      animating.current = false;
      return;
    }

    el.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
    el.style.setProperty('--dx', String(dir * 420));
    el.style.opacity = '0';
    setTimeout(() => {
      // 스타일 원복 후 순서 회전 — 이 카드는 스택 맨 뒤로 이동
      el.style.transition = 'none';
      el.style.setProperty('--dx', '0');
      el.style.opacity = '1';
      rotateOrder();
      animating.current = false;
    }, 300);
  };

  // 5초 자동 셔플 — 드래그 중·탭 비활성·모션 최소화 설정이면 건너뜀
  useEffect(() => {
    const timer = setInterval(() => {
      if (dragging.current || document.hidden || reducedMotion.current) return;
      animateOut(1);
    }, AUTO_SHUFFLE_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (animating.current) return;
    dragging.current = true;
    startX.current = e.clientX;
    const el = topRef.current;
    if (el) {
      el.setPointerCapture(e.pointerId);
      el.style.transition = 'none';
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dx.current = e.clientX - startX.current;
    // 리렌더 없이 CSS 변수 직접 조작 — 보간은 컴포지터에 위임
    topRef.current?.style.setProperty('--dx', String(dx.current));
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const el = topRef.current;
    if (!el) return;
    if (Math.abs(dx.current) > SWIPE_THRESHOLD_PX) {
      animateOut(dx.current > 0 ? 1 : -1);
    } else {
      // 임계값 미만 — 스프링 복귀
      el.style.transition = 'transform 0.25s ease-out';
      el.style.setProperty('--dx', '0');
    }
    dx.current = 0;
  };

  return (
    <div className="relative w-60 h-[19rem] mx-auto" role="img" aria-label="매칭 카드 미리보기 — 드래그해서 넘겨보세요">
      {order.map((cardIdx, pos) => {
        const isTop = pos === 0;
        return (
          <div
            key={cardIdx}
            ref={isTop ? topRef : undefined}
            className="absolute inset-0 select-none"
            style={{
              zIndex: 10 - pos,
              transform: isTop
                ? 'translateX(calc(var(--dx, 0) * 1px)) rotate(calc(var(--dx, 0) * 0.05deg))'
                : `translateY(${pos * 10}px) scale(${1 - pos * 0.05})`,
              transition: isTop ? 'transform 0.3s ease-out' : 'transform 0.3s ease-out',
              touchAction: 'none',
              cursor: isTop ? 'grab' : undefined,
            }}
            onPointerDown={isTop ? onPointerDown : undefined}
            onPointerMove={isTop ? onPointerMove : undefined}
            onPointerUp={isTop ? onPointerUp : undefined}
            onPointerCancel={isTop ? onPointerUp : undefined}
          >
            <MockMatchCard {...CARDS[cardIdx]} />
          </div>
        );
      })}
    </div>
  );
}

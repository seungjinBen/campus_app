'use client';

import { useId } from 'react';

// 인스타그램 기본 프로필 느낌의 사람 실루엣 — 이모지 대신 쓰는 캠퍼스한장 기본 아바타
// 색은 부모에서 text-{tone} 클래스로 주입 (currentColor)
export default function MockAvatar({ className = '' }: { className?: string }) {
  const clipId = useId();

  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <circle cx="48" cy="48" r="48" />
        </clipPath>
      </defs>
      <circle cx="48" cy="48" r="48" fill="white" fillOpacity="0.8" />
      <g clipPath={`url(#${clipId})`}>
        <circle cx="48" cy="37" r="15" fill="currentColor" />
        <path d="M48 58 C 29 58 19 71 17 96 L 79 96 C 77 71 67 58 48 58 Z" fill="currentColor" />
      </g>
    </svg>
  );
}

'use client';

import { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

const PARTICLE_COUNT = 18;

// 파티클마다 다른 방향·거리·회전을 CSS 변수로 넘긴다 (keyframe은 하나만 유지)
interface Particle {
  dx: number;
  dy: number;
  scale: number;
  rotate: number;
  delay: number;
  size: number;
}

// 결정적 의사난수 — 렌더마다 흩어지는 모양이 달라지면 스크린샷 재현이 어렵고,
// 하이드레이션 불일치도 생긴다. 인덱스 기반으로 고정한다.
function buildParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    // 위쪽 반원으로 부채꼴 분사 (좌우 대칭, 가운데는 더 높게)
    const angle = Math.PI * (0.08 + (0.84 * i) / (PARTICLE_COUNT - 1));
    const distance = 90 + ((i * 37) % 70);
    const wobble = ((i * 53) % 40) - 20;
    return {
      dx: Math.round(Math.cos(angle) * distance + wobble),
      dy: Math.round(-Math.sin(angle) * distance - 40),
      scale: 0.7 + ((i * 17) % 60) / 100,
      rotate: ((i * 71) % 120) - 60,
      delay: ((i * 29) % 220) / 1000,
      size: 12 + ((i * 13) % 10),
    };
  });
}

/**
 * 연락처 공개 순간의 하트 분사.
 * 부모에 relative가 있어야 하며, 클릭을 막지 않도록 pointer-events-none으로 띄운다.
 */
export default function HeartBurst() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const particles = useMemo(buildParticles, []);

  // 동작 줄이기 설정 — CSS로는 막을 수 없는 연출이므로 DOM 자체를 만들지 않는다
  if (prefersReducedMotion) return null;

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-8 z-10 h-0 w-0"
      aria-hidden="true"
    >
      {particles.map((p, i) => (
        <Heart
          key={i}
          className="absolute animate-heartBurst fill-brand-rose text-brand-rose"
          style={{
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            // keyframe이 참조하는 최종 위치 — 파티클별로 다르게 준다
            ['--dx' as string]: `${p.dx}px`,
            ['--dy' as string]: `${p.dy}px`,
            ['--s' as string]: `${p.scale}`,
            ['--r' as string]: `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}

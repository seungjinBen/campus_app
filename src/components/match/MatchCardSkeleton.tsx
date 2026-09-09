// 로딩 중 카드 골격 — MatchCard와 치수를 1:1로 맞춘다.
// 스피너처럼 작은 블록을 두면 카드 도착 시 화면이 통째로 밀리므로(레이아웃 이동),
// 실제 카드와 같은 높이를 미리 차지하게 해 전환 시 점프를 없앤다.
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3">
      {/* NO. XX · 대학교 */}
      <div className="h-3 w-24 rounded bg-brand-sand/70 mx-1" />

      {/* 사진 — MatchCard와 동일한 aspect-[4/3] */}
      <div className="w-full aspect-[4/3] rounded-2xl bg-brand-sand/70" />

      {/* 정보 + 선택 버튼 */}
      <div className="flex items-end justify-between px-1 gap-4">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className="h-5 w-28 rounded bg-brand-sand/70" />
          <div className="h-4 w-36 rounded bg-brand-sand/50" />
          <div className="flex gap-1.5">
            <div className="h-6 w-16 rounded-full bg-brand-sand/50" />
            <div className="h-6 w-20 rounded-full bg-brand-sand/50" />
          </div>
        </div>
        <div className="h-10 w-20 rounded-full bg-brand-sand/70 flex-shrink-0" />
      </div>
    </div>
  );
}

interface Props {
  count?: number;
}

export default function MatchCardSkeleton({ count = 3 }: Props) {
  return (
    <div className="flex flex-col gap-8 animate-pulse" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

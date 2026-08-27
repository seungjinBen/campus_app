import MockAvatar from './MockAvatar';

// 랜딩 히어로용 목업 카드 — 실사진 대신 파스텔 톤 기본 아바타 (프라이버시·저작권 회피 + LCP 최적화)
interface MockMatchCardProps {
  nickname: string;
  birthYear: string;
  dept: string;
  accent: string;   // 아바타 실루엣 색 (text-{tone} 클래스)
  gradient: string;
  chip: string;
}

export default function MockMatchCard({ nickname, birthYear, dept, accent, gradient, chip }: MockMatchCardProps) {
  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-card bg-white flex flex-col border border-brand-sand/50">
      <div className={`flex-1 flex items-center justify-center bg-gradient-to-b ${gradient}`} aria-hidden="true">
        <MockAvatar className={`w-24 h-24 ${accent}`} />
      </div>
      <div className="px-4 py-3.5 flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-brand-dark text-base">{nickname}</span>
            <span className="text-xs text-brand-mid">{birthYear}</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-rose-light text-brand-rose font-semibold">
            {chip}
          </span>
        </div>
        <p className="text-xs text-brand-mid">{dept}</p>
      </div>
    </div>
  );
}

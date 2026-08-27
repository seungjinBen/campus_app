import { ComponentType } from 'react';

// 이모지 대신 쓰는 상태 아이콘 배지 — 랜딩 신뢰 배너에서 확립한 시각 언어를 전 화면에 통일
interface IconBadgeProps {
  // exactOptionalPropertyTypes 대응 — lucide 아이콘의 className은 string | undefined
  icon: ComponentType<{ className?: string | undefined }>;
  size?: 'sm' | 'lg';
}

export default function IconBadge({ icon: Icon, size = 'lg' }: IconBadgeProps) {
  if (size === 'sm') {
    return (
      <div className="w-8 h-8 rounded-xl bg-brand-rose/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-brand-rose" />
      </div>
    );
  }
  return (
    <div className="w-14 h-14 rounded-2xl bg-brand-rose/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-6 h-6 text-brand-rose" />
    </div>
  );
}

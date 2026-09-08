interface StepIndicatorProps {
  current: number;
  total: number;
  title: string;
  // 줄바꿈이 필요한 안내 문구를 위해 ReactNode 허용 (기존 문자열 사용처는 그대로 동작)
  description?: React.ReactNode;
}

export default function StepIndicator({ current, total, title, description }: StepIndicatorProps) {
  return (
    <div className="mb-6">
      <p className="text-xs text-brand-rose font-medium mb-1">STEP {current} / {total}</p>
      <h2 className="text-xl font-bold text-brand-dark">{title}</h2>
      {description && <p className="text-sm text-brand-mid mt-1">{description}</p>}
    </div>
  );
}

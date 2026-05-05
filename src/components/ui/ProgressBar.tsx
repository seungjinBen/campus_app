interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="w-full h-1 bg-brand-sand rounded-full overflow-hidden">
      <div
        className="h-full bg-brand-rose rounded-full transition-all duration-500"
        style={{ width: `${percent}%` }}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
      />
    </div>
  );
}

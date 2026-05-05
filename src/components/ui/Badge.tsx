import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'rose' | 'sand';
  className?: string;
}

const variantStyles = {
  default: 'bg-brand-warm text-brand-mid',
  rose: 'bg-brand-rose-light text-brand-rose',
  sand: 'bg-brand-sand text-brand-mid',
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

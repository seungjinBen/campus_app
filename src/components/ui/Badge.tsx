import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'rose' | 'sand' | 'blue' | 'violet' | 'emerald' | 'amber';
  className?: string;
}

const variantStyles = {
  default:  'bg-brand-warm text-brand-mid',
  rose:     'bg-brand-rose-light text-brand-rose',
  sand:     'bg-brand-warm text-brand-mid',
  blue:     'bg-blue-50 text-blue-500',
  violet:   'bg-violet-50 text-violet-500',
  emerald:  'bg-emerald-50 text-emerald-600',
  amber:    'bg-amber-50 text-amber-600',
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

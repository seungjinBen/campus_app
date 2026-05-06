import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'rose' | 'sand' | 'blue' | 'violet' | 'emerald' | 'amber';
  className?: string;
}

const variantStyles = {
  default:  'bg-brand-warm text-brand-mid',
  rose:     'bg-[#F3F4F6] text-[#4B5563]',
  sand:     'bg-brand-warm text-brand-mid',
  blue:     'bg-[#F3F4F6] text-[#4B5563]',
  violet:   'bg-[#F3F4F6] text-[#4B5563]',
  emerald:  'bg-[#F3F4F6] text-[#4B5563]',
  amber:    'bg-[#F3F4F6] text-[#4B5563]',
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

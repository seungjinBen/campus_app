import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-card border border-brand-sand',
        className
      )}
    >
      {children}
    </div>
  );
}

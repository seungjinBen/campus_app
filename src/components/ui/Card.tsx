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
        'bg-white rounded-2xl shadow-sm border border-[#E5E7EB]',
        className
      )}
    >
      {children}
    </div>
  );
}

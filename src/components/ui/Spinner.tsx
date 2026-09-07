import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-6', className)}>
      <Loader2 className={cn('animate-spin text-studio-accent', sizeClasses[size])} />
      {label && <p className="text-xs text-studio-muted font-medium animate-pulse">{label}</p>}
    </div>
  );
};

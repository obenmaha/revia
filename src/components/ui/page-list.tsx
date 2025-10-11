import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageListProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export function PageList({
  children,
  className,
  spacing = 'md',
}: PageListProps) {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  };

  return (
    <div className={cn('space-y-4', spacingClasses[spacing], className)}>
      {children}
    </div>
  );
}

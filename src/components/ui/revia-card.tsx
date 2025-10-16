import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface ReviaCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'stat' | 'streak' | 'session';
}

export function ReviaCard({ 
  children, 
  className, 
  variant = 'default' 
}: ReviaCardProps) {
  const baseClasses = 'revia-card bg-white rounded-lg shadow-md border border-gray-100';
  
  const variantClasses = {
    default: 'p-6',
    stat: 'p-6 text-center border-l-4 border-l-[var(--revia-secondary)]',
    streak: 'p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white',
    session: 'p-4 hover:shadow-lg transition-shadow duration-200'
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </div>
  );
}

interface ReviaCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ReviaCardHeader({ children, className }: ReviaCardHeaderProps) {
  return (
    <div className={cn('mb-4 pb-4 border-b border-gray-100', className)}>
      {children}
    </div>
  );
}

interface ReviaCardTitleProps {
  children: ReactNode;
  className?: string;
}

export function ReviaCardTitle({ children, className }: ReviaCardTitleProps) {
  return (
    <h3 className={cn(
      'font-montserrat text-lg font-bold text-[var(--revia-text)] uppercase tracking-wide',
      className
    )}>
      {children}
    </h3>
  );
}

interface ReviaCardContentProps {
  children: ReactNode;
  className?: string;
}

export function ReviaCardContent({ children, className }: ReviaCardContentProps) {
  return (
    <div className={cn('text-[var(--revia-text)]', className)}>
      {children}
    </div>
  );
}

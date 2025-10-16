import { cn } from '../../lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ReviaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ReviaButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  ...props 
}: ReviaButtonProps) {
  const baseClasses = 'revia-btn font-roboto font-medium border-0 rounded-lg cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-[var(--revia-gradient-primary)] text-white shadow-sm hover:transform hover:-translate-y-0.5 hover:shadow-md',
    secondary: 'bg-[var(--revia-secondary)] text-white shadow-sm hover:bg-[#388e3c] hover:transform hover:-translate-y-0.5 hover:shadow-md',
    outline: 'bg-transparent text-[var(--revia-primary)] border-2 border-[var(--revia-primary)] hover:bg-[var(--revia-primary)] hover:text-white',
    ghost: 'bg-transparent text-[var(--revia-primary)] hover:bg-[rgba(2,136,209,0.1)]'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

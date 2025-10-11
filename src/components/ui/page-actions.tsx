import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PageAction {
  label: string;
  onClick: () => void;
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
  disabled?: boolean;
  loading?: boolean;
}

export interface PageActionsProps {
  actions: PageAction[];
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function PageActions({
  actions,
  className,
  align = 'right',
}: PageActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2',
        alignClasses[align],
        className
      )}
    >
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'default'}
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
        >
          {action.loading && (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {action.label}
        </Button>
      ))}
    </div>
  );
}

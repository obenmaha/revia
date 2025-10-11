import * as React from 'react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

export interface PageEmptyProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function PageEmpty({
  title,
  description,
  icon,
  action,
  className,
}: PageEmptyProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] items-center justify-center',
        className
      )}
    >
      <EmptyState
        title={title}
        description={description}
        icon={icon}
        action={action}
      />
    </div>
  );
}

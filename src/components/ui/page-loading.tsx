import * as React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';

export interface PageLoadingProps {
  title?: string;
  description?: string;
  className?: string;
  showSkeleton?: boolean;
  skeletonCount?: number;
}

export function PageLoading({
  title = 'Chargement...',
  description,
  className,
  showSkeleton = false,
  skeletonCount = 3,
}: PageLoadingProps) {
  if (showSkeleton) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex min-h-[400px] items-center justify-center',
        className
      )}
    >
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

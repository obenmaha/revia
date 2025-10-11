import * as React from 'react';
import { Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface PageLegacyProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageLegacy({
  title,
  description,
  children,
  className,
}: PageLegacyProps) {
  return (
    <Alert className={cn(className)}>
      <Archive className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && (
        <AlertDescription className="mt-2">{description}</AlertDescription>
      )}
      {children && <div className="mt-4">{children}</div>}
    </Alert>
  );
}

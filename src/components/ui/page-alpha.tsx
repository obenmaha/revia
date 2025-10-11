import * as React from 'react';
import { TestTube } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface PageAlphaProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageAlpha({
  title,
  description,
  children,
  className,
}: PageAlphaProps) {
  return (
    <Alert className={cn(className)}>
      <TestTube className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && (
        <AlertDescription className="mt-2">{description}</AlertDescription>
      )}
      {children && <div className="mt-4">{children}</div>}
    </Alert>
  );
}

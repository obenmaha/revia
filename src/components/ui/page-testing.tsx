import * as React from 'react';
import { TestTube2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface PageTestingProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageTesting({
  title,
  description,
  children,
  className,
}: PageTestingProps) {
  return (
    <Alert className={cn(className)}>
      <TestTube2 className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && (
        <AlertDescription className="mt-2">{description}</AlertDescription>
      )}
      {children && <div className="mt-4">{children}</div>}
    </Alert>
  );
}

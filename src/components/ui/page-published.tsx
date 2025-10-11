import * as React from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface PagePublishedProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PagePublished({
  title,
  description,
  children,
  className,
}: PagePublishedProps) {
  return (
    <Alert className={cn(className)}>
      <Globe className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && (
        <AlertDescription className="mt-2">{description}</AlertDescription>
      )}
      {children && <div className="mt-4">{children}</div>}
    </Alert>
  );
}

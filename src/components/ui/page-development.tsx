import * as React from 'react';
import { Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface PageDevelopmentProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageDevelopment({
  title,
  description,
  children,
  className,
}: PageDevelopmentProps) {
  return (
    <Alert className={cn(className)}>
      <Code className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && (
        <AlertDescription className="mt-2">{description}</AlertDescription>
      )}
      {children && <div className="mt-4">{children}</div>}
    </Alert>
  );
}

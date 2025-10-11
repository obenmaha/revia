import * as React from 'react';
import { Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface PagePublicProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PagePublic({
  title,
  description,
  children,
  className,
}: PagePublicProps) {
  return (
    <Alert className={cn(className)}>
      <Unlock className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && (
        <AlertDescription className="mt-2">{description}</AlertDescription>
      )}
      {children && <div className="mt-4">{children}</div>}
    </Alert>
  );
}

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface PageInternalLinkProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageInternalLink({
  title,
  description,
  children,
  className,
}: PageInternalLinkProps) {
  return (
    <Alert className={cn(className)}>
      <ArrowRight className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && (
        <AlertDescription className="mt-2">{description}</AlertDescription>
      )}
      {children && <div className="mt-4">{children}</div>}
    </Alert>
  );
}

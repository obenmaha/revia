import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface PageNewProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageNew({
  title,
  description,
  children,
  className,
}: PageNewProps) {
  return (
    <Alert className={cn(className)}>
      <Sparkles className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && (
        <AlertDescription className="mt-2">{description}</AlertDescription>
      )}
      {children && <div className="mt-4">{children}</div>}
    </Alert>
  );
}

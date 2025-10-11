import * as React from 'react';
import { StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface PageNoteProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageNote({
  title,
  description,
  children,
  className,
}: PageNoteProps) {
  return (
    <Alert className={cn(className)}>
      <StickyNote className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && (
        <AlertDescription className="mt-2">{description}</AlertDescription>
      )}
      {children && <div className="mt-4">{children}</div>}
    </Alert>
  );
}

import * as React from 'react';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface PagePreviewProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PagePreview({
  title,
  description,
  children,
  className,
}: PagePreviewProps) {
  return (
    <Alert className={cn(className)}>
      <Eye className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && (
        <AlertDescription className="mt-2">{description}</AlertDescription>
      )}
      {children && <div className="mt-4">{children}</div>}
    </Alert>
  );
}

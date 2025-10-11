import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageActions, type PageAction } from '@/components/ui/page-actions';

export interface PageFormProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: PageAction[];
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

export function PageForm({
  title,
  description,
  children,
  actions,
  className,
  headerClassName,
  contentClassName,
  onSubmit,
}: PageFormProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className={cn(headerClassName)}>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn(contentClassName)}>
        <form onSubmit={onSubmit} className="space-y-6">
          {children}
          {actions && actions.length > 0 && <PageActions actions={actions} />}
        </form>
      </CardContent>
    </Card>
  );
}

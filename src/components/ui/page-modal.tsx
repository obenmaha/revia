import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PageActions, PageAction } from '@/components/ui/page-actions';

export interface PageModalProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
  actions?: PageAction[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}

export function PageModal({
  title,
  description,
  children,
  trigger,
  actions,
  open,
  onOpenChange,
  className,
  contentClassName,
  headerClassName,
}: PageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn('max-w-2xl', className)}>
        <DialogHeader className={cn(headerClassName)}>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className={cn('space-y-6', contentClassName)}>
          {children}
          {actions && actions.length > 0 && <PageActions actions={actions} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <ScrollArea className="h-[300px] px-1">{children}</ScrollArea>
        </div>
      </div>
    </div>
  );
}

export interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarContent({ children, className }: SidebarContentProps) {
  return <div className={cn('space-y-1', className)}>{children}</div>;
}

export interface SidebarItemProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarItem({
  children,
  className,
  active,
  onClick,
}: SidebarItemProps) {
  return (
    <Button
      variant={active ? 'secondary' : 'ghost'}
      className={cn('w-full justify-start', className)}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export interface SidebarTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarTrigger({ children, className }: SidebarTriggerProps) {
  return (
    <Button variant="ghost" size="icon" className={cn('h-9 w-9', className)}>
      {children}
    </Button>
  );
}

export interface SidebarSheetProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  className?: string;
}

export function SidebarSheet({
  children,
  trigger,
  className,
}: SidebarSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="left" className={cn('w-72 p-0', className)}>
        <Sidebar>{children}</Sidebar>
      </SheetContent>
    </Sheet>
  );
}

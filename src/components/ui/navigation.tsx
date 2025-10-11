import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar, SidebarContent, SidebarItem } from '@/components/ui/sidebar';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  external?: boolean;
}

export interface NavigationProps {
  items: NavigationItem[];
  className?: string;
}

export function Navigation({ items, className }: NavigationProps) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className={cn('space-y-1', className)}>
      {items.map(item => (
        <SidebarItem
          key={item.href}
          active={pathname === item.href}
          onClick={() => {
            if (item.external) {
              window.open(item.href, '_blank');
            }
          }}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.title}
        </SidebarItem>
      ))}
    </div>
  );
}

export interface MobileNavigationProps {
  items: NavigationItem[];
  trigger: React.ReactNode;
  className?: string;
}

export function MobileNavigation({
  items,
  trigger,
  className,
}: MobileNavigationProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="left" className={cn('w-72 p-0', className)}>
        <Sidebar>
          <SidebarContent>
            <Navigation items={items} />
          </SidebarContent>
        </Sidebar>
      </SheetContent>
    </Sheet>
  );
}

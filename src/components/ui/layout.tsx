import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Navigation, type NavigationItem } from '@/components/ui/navigation';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export interface LayoutProps {
  children: React.ReactNode;
  navigationItems: NavigationItem[];
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
  onSignOut?: () => void;
  className?: string;
}

export function Layout({
  children,
  navigationItems,
  user,
  onSignOut,
  className,
}: LayoutProps) {
  return (
    <div className={cn('flex h-screen bg-background', className)}>
      {/* Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block md:w-64">
        <Sidebar>
          <SidebarContent>
            <Navigation items={navigationItems} />
          </SidebarContent>
        </Sidebar>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="md:hidden">
              <span className="sr-only">Ouvrir le menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </SidebarTrigger>
            <h1 className="text-xl font-semibold">App-Kine</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user && <UserAvatar user={user} onSignOut={onSignOut} />}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}

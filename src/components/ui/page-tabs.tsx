import * as React from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface PageTab {
  value: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface PageTabsProps {
  tabs: PageTab[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  listClassName?: string;
  contentClassName?: string;
}

export function PageTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
  listClassName,
  contentClassName,
}: PageTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn(className)}
    >
      <TabsList className={cn(listClassName)}>
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(tab => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn(contentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

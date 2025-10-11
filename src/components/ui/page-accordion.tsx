import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export interface PageAccordionItem {
  value: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface PageAccordionProps {
  items: PageAccordionItem[];
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
  itemClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export function PageAccordion({
  items,
  type = 'single',
  defaultValue,
  value,
  onValueChange,
  className,
  itemClassName,
  triggerClassName,
  contentClassName,
}: PageAccordionProps) {
  return (
    <Accordion
      type={type}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn(className)}
    >
      {items.map(item => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className={cn(itemClassName)}
        >
          <AccordionTrigger
            disabled={item.disabled}
            className={cn(triggerClassName)}
          >
            {item.label}
          </AccordionTrigger>
          <AccordionContent className={cn(contentClassName)}>
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

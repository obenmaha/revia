import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

export interface PageFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: { value: string; label: string }[];
  placeholder?: string;
  value?: string | Date | undefined;
  onChange: (value: string | Date | undefined) => void;
}

export interface PageFiltersProps {
  filters: PageFilter[];
  onClear?: () => void;
  className?: string;
}

export function PageFilters({ filters, onClear, className }: PageFiltersProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-4">
        {filters.map(filter => (
          <div key={filter.key} className="min-w-[200px]">
            <label className="mb-2 block text-sm font-medium">
              {filter.label}
            </label>
            {filter.type === 'text' && (
              <Input
                placeholder={filter.placeholder}
                value={String(filter.value || '')}
                onChange={e => filter.onChange(e.target.value)}
              />
            )}
            {filter.type === 'select' && (
              <Select
                value={String(filter.value || '')}
                onValueChange={filter.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options?.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {filter.type === 'date' && (
              <DatePicker
                date={filter.value as Date | undefined}
                onDateChange={filter.onChange}
                placeholder={filter.placeholder}
              />
            )}
          </div>
        ))}
        {onClear && (
          <Button variant="outline" onClick={onClear}>
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { PageFilters, type PageFilter } from '@/components/ui/page-filters';
import { PageActions, type PageAction } from '@/components/ui/page-actions';

export interface PageTableProps<TData = unknown> {
  title: string;
  description?: string;
  data: TData[];
  columns: import('@tanstack/react-table').ColumnDef<TData, unknown>[];
  filters?: PageFilter[];
  actions?: PageAction[];
  onClearFilters?: () => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  showPagination?: boolean;
  showSearch?: boolean;
}

export function PageTable<TData = unknown>({
  title,
  description,
  data,
  columns,
  filters,
  actions,
  onClearFilters,
  className,
  headerClassName,
  contentClassName,
  searchKey,
  searchPlaceholder,
  pageSize,
  showPagination,
  showSearch,
}: PageTableProps<TData>) {
  return (
    <Card className={cn(className)}>
      <CardHeader className={cn(headerClassName)}>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn(contentClassName)}>
        <div className="space-y-4">
          {filters && filters.length > 0 && (
            <PageFilters filters={filters} onClear={onClearFilters} />
          )}
          {actions && actions.length > 0 && <PageActions actions={actions} />}
          <DataTable
            data={data}
            columns={columns}
            searchKey={searchKey}
            searchPlaceholder={searchPlaceholder}
            pageSize={pageSize}
            showPagination={showPagination}
            showSearch={showSearch}
          />
        </div>
      </CardContent>
    </Card>
  );
}

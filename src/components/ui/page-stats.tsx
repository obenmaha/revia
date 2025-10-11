import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface PageStat {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label: string;
    type: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export interface PageStatsProps {
  stats: PageStat[];
  className?: string;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function PageStats({ stats, className, columns = 4 }: PageStatsProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <Card key={index} className={cn(stat.className)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon && (
              <div className="h-4 w-4 text-muted-foreground">{stat.icon}</div>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.description && (
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            )}
            {stat.trend && (
              <div className="flex items-center pt-1">
                <Badge
                  variant={
                    stat.trend.type === 'up'
                      ? 'default'
                      : stat.trend.type === 'down'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {stat.trend.value > 0 && '+'}
                  {stat.trend.value}%
                </Badge>
                <span className="ml-2 text-xs text-muted-foreground">
                  {stat.trend.label}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

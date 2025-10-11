import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface StatusBadgeProps {
  status:
    | 'active'
    | 'inactive'
    | 'pending'
    | 'completed'
    | 'cancelled'
    | 'error';
  className?: string;
}

const statusConfig = {
  active: {
    label: 'Actif',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  inactive: {
    label: 'Inactif',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  },
  pending: {
    label: 'En attente',
    variant: 'outline' as const,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  completed: {
    label: 'Terminé',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  cancelled: {
    label: 'Annulé',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  error: {
    label: 'Erreur',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

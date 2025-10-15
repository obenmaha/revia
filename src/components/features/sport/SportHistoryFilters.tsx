import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Calendar,
  X,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HistoryFilters {
  searchQuery: string;
  type: string;
  period: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface SportHistoryFiltersProps {
  filters: HistoryFilters;
  onFiltersChange: (filters: HistoryFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Toutes les périodes' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'year', label: 'Cette année' },
  { value: 'custom', label: 'Période personnalisée' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tous les types' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'musculation', label: 'Musculation' },
  { value: 'flexibility', label: 'Flexibilité' },
  { value: 'other', label: 'Autre' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'completed', label: 'Terminées' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'draft', label: 'Brouillons' },
];

export function SportHistoryFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
}: SportHistoryFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof HistoryFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handlePeriodChange = (period: string) => {
    const now = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;

    switch (period) {
      case 'today':
        startDate = now.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        startDate = weekStart.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(now);
        monthStart.setMonth(now.getMonth() - 1);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'year':
        const yearStart = new Date(now);
        yearStart.setFullYear(now.getFullYear() - 1);
        startDate = yearStart.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'custom':
        // Les dates personnalisées sont gérées séparément
        break;
      default:
        startDate = undefined;
        endDate = undefined;
    }

    onFiltersChange({
      ...filters,
      period,
      startDate,
      endDate,
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.type !== 'all') count++;
    if (filters.period !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtres</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Réinitialiser
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Masquer' : 'Avancé'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une séance..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="pl-10"
            aria-label="Rechercher dans les séances"
          />
          {filters.searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterChange('searchQuery', '')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              aria-label="Effacer la recherche"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filtres de base */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Type de séance
            </label>
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Période
            </label>
            <Select
              value={filters.period}
              onValueChange={handlePeriodChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Statut
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtres avancés */}
        {showAdvanced && (
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Période personnalisée</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Date de début
                </label>
                <Input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  max={filters.endDate || new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  min={filters.startDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        )}

        {/* Filtres actifs */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground mb-2">
              <span>Filtres actifs :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.searchQuery && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Recherche: "{filters.searchQuery}"</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('searchQuery', '')}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.type !== 'all' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Type: {TYPE_OPTIONS.find(opt => opt.value === filters.type)?.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('type', 'all')}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.period !== 'all' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Période: {PERIOD_OPTIONS.find(opt => opt.value === filters.period)?.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePeriodChange('all')}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Statut: {STATUS_OPTIONS.find(opt => opt.value === filters.status)?.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('status', 'all')}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

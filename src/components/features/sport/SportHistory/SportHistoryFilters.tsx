// Composant de filtres pour l'historique sport - Story 1.5
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Search, Calendar } from 'lucide-react';
import type { HistoryFilters, SportSessionType, SportSessionStatus } from '@/types/sport';

interface SportHistoryFiltersProps {
  filters: HistoryFilters;
  onFiltersChange: (filters: Partial<HistoryFilters>) => void;
  isLoading?: boolean;
}

const SESSION_TYPES: { value: SportSessionType; label: string }[] = [
  { value: 'cardio', label: 'Cardio' },
  { value: 'musculation', label: 'Musculation' },
  { value: 'flexibility', label: 'Flexibilité' },
  { value: 'other', label: 'Autre' },
];

const SESSION_STATUSES: { value: SportSessionStatus; label: string }[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminée' },
];

const PAGE_SIZES = [
  { value: 10, label: '10 par page' },
  { value: 20, label: '20 par page' },
  { value: 50, label: '50 par page' },
];

export function SportHistoryFilters({
  filters,
  onFiltersChange,
  isLoading = false,
}: SportHistoryFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Partial<HistoryFilters>>({
    search: filters.search || '',
    type: filters.type,
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Appliquer les filtres avec un délai pour éviter trop de requêtes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange(localFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localFilters, onFiltersChange]);

  const handleFilterChange = (key: keyof HistoryFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      type: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.type) count++;
    if (localFilters.status) count++;
    if (localFilters.startDate) count++;
    if (localFilters.endDate) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Simple' : 'Avancé'}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtres de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="space-y-2">
            <Label htmlFor="search">Recherche</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Nom de la séance..."
                value={localFilters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Type de séance */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={localFilters.type || ''}
              onValueChange={(value) => handleFilterChange('type', value || undefined)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                {SESSION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={localFilters.status || ''}
              onValueChange={(value) => handleFilterChange('status', value || undefined)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                {SESSION_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtres avancés */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date de début */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <DatePicker
                    date={localFilters.startDate}
                    onDateChange={(date) => handleFilterChange('startDate', date)}
                    placeholder="Sélectionner une date"
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date de fin */}
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <DatePicker
                    date={localFilters.endDate}
                    onDateChange={(date) => handleFilterChange('endDate', date)}
                    placeholder="Sélectionner une date"
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Taille de page */}
            <div className="space-y-2">
              <Label htmlFor="pageSize">Éléments par page</Label>
              <Select
                value={filters.limit?.toString() || '10'}
                onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value.toString()}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {localFilters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Recherche: {localFilters.search}
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {localFilters.type && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {SESSION_TYPES.find(t => t.value === localFilters.type)?.label}
                  <button
                    onClick={() => handleFilterChange('type', undefined)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {localFilters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Statut: {SESSION_STATUSES.find(s => s.value === localFilters.status)?.label}
                  <button
                    onClick={() => handleFilterChange('status', undefined)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {localFilters.startDate && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Début: {localFilters.startDate.toLocaleDateString()}
                  <button
                    onClick={() => handleFilterChange('startDate', undefined)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {localFilters.endDate && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Fin: {localFilters.endDate.toLocaleDateString()}
                  <button
                    onClick={() => handleFilterChange('endDate', undefined)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

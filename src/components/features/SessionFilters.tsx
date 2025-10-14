// Composant de filtres pour l'historique des sessions - Story 2.5
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type {
  SessionFilters as SessionFiltersType,
  SessionType,
  SessionStatus,
} from '@/types/session';

interface SessionFiltersProps {
  filters: SessionFiltersType;
  onFiltersChange: (filters: SessionFiltersType) => void;
  onSaveFilters?: (filters: SessionFiltersType) => void;
  className?: string;
}

const SessionFilters: React.FC<SessionFiltersProps> = ({
  filters,
  onFiltersChange,
  onSaveFilters,
  className = '',
}) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<SessionFiltersType>(filters);

  // Synchroniser les filtres locaux avec les props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (
    key: keyof SessionFiltersType,
    value: unknown
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleResetFilters = () => {
    const resetFilters: SessionFiltersType = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    toast({
      title: 'Filtres réinitialisés',
      description: 'Tous les filtres ont été supprimés.',
    });
  };

  const handleSaveFilters = () => {
    onSaveFilters?.(localFilters);
    toast({
      title: 'Filtres sauvegardés',
      description: 'Vos filtres ont été sauvegardés avec succès.',
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(
      value => value !== undefined && value !== null && value !== ''
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Filtres
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-blue-600">
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-4 h-4 mr-1" />
              {isExpanded ? 'Masquer' : 'Afficher'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="space-y-6">
              {/* Recherche textuelle */}
              <div className="space-y-2">
                <Label
                  htmlFor="search"
                  className="text-sm font-medium text-gray-700"
                >
                  Recherche
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Rechercher une session..."
                    value={localFilters.search || ''}
                    onChange={e => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtres principaux */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type de session */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Type d'activité
                  </Label>
                  <Select
                    value={localFilters.type || 'all'}
                    onValueChange={value =>
                      handleFilterChange(
                        'type',
                        value === 'all' ? undefined : (value as SessionType)
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="rehabilitation">
                        Rééducation
                      </SelectItem>
                      <SelectItem value="sport">Sport</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Statut de session */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Statut
                  </Label>
                  <Select
                    value={localFilters.status || 'all'}
                    onValueChange={value =>
                      handleFilterChange(
                        'status',
                        value === 'all' ? undefined : (value as SessionStatus)
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="completed">Terminée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Période */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Période
                  </Label>
                  <Select
                    value={getPeriodValue(localFilters)}
                    onValueChange={value => handlePeriodChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les périodes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                      <SelectItem value="year">Cette année</SelectItem>
                      <SelectItem value="custom">Personnalisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filtres de date personnalisés */}
              {getPeriodValue(localFilters) === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="dateFrom"
                      className="text-sm font-medium text-gray-700"
                    >
                      Date de début
                    </Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={
                        localFilters.dateFrom
                          ? localFilters.dateFrom.toISOString().split('T')[0]
                          : ''
                      }
                      onChange={e =>
                        handleFilterChange(
                          'dateFrom',
                          e.target.value ? new Date(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="dateTo"
                      className="text-sm font-medium text-gray-700"
                    >
                      Date de fin
                    </Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={
                        localFilters.dateTo
                          ? localFilters.dateTo.toISOString().split('T')[0]
                          : ''
                      }
                      onChange={e =>
                        handleFilterChange(
                          'dateTo',
                          e.target.value ? new Date(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                </motion.div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="flex-1"
                  disabled={activeFiltersCount === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>

                {onSaveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleSaveFilters}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                )}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );

  // Fonction pour obtenir la valeur de période
  function getPeriodValue(filters: SessionFiltersType): string {
    if (!filters.dateFrom && !filters.dateTo) return 'all';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

    if (filters.dateFrom && filters.dateTo) {
      if (
        filters.dateFrom.getTime() === today.getTime() &&
        filters.dateTo.getTime() === today.getTime()
      ) {
        return 'today';
      }
      if (
        filters.dateFrom.getTime() === weekAgo.getTime() &&
        filters.dateTo.getTime() === today.getTime()
      ) {
        return 'week';
      }
      if (
        filters.dateFrom.getTime() === monthAgo.getTime() &&
        filters.dateTo.getTime() === today.getTime()
      ) {
        return 'month';
      }
      if (
        filters.dateFrom.getTime() === yearAgo.getTime() &&
        filters.dateTo.getTime() === today.getTime()
      ) {
        return 'year';
      }
      return 'custom';
    }

    return 'custom';
  }

  // Fonction pour gérer le changement de période
  function handlePeriodChange(value: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (value) {
      case 'all':
        handleFilterChange('dateFrom', undefined);
        handleFilterChange('dateTo', undefined);
        break;
      case 'today':
        handleFilterChange('dateFrom', today);
        handleFilterChange('dateTo', today);
        break;
      case 'week': {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        handleFilterChange('dateFrom', weekAgo);
        handleFilterChange('dateTo', today);
        break;
      }
      case 'month': {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        handleFilterChange('dateFrom', monthAgo);
        handleFilterChange('dateTo', today);
        break;
      }
      case 'year': {
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        handleFilterChange('dateFrom', yearAgo);
        handleFilterChange('dateTo', today);
        break;
      }
      case 'custom':
        // Garder les dates existantes ou les réinitialiser
        if (!localFilters.dateFrom && !localFilters.dateTo) {
          handleFilterChange('dateFrom', undefined);
          handleFilterChange('dateTo', undefined);
        }
        break;
    }
  }
};

export default SessionFilters;

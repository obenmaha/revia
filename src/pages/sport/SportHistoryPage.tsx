import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { SessionList } from '../../components/features/sport/SessionCard';
import {
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Download,
  Loader2,
} from 'lucide-react';
import {
  useSportHistory,
  useSportHistoryStats,
} from '../../hooks/useSportHistory';
import { useSportStats } from '../../hooks/useSportStats';
import type { HistoryFilters } from '../../hooks/useSportHistory';

export function SportHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Calculer les filtres de date basés sur la période
  const dateFilters = useMemo(() => {
    const now = new Date();
    const filters: Partial<HistoryFilters> = {};

    if (periodFilter !== 'all') {
      const startDate = new Date();
      switch (periodFilter) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      filters.startDate = startDate.toISOString().split('T')[0];
      filters.endDate = now.toISOString().split('T')[0];
    }

    return filters;
  }, [periodFilter]);

  // Construire les filtres pour les hooks
  const historyFilters: HistoryFilters = {
    ...dateFilters,
    type: typeFilter === 'all' ? undefined : (typeFilter as any),
    searchQuery: searchQuery || undefined,
    page: currentPage,
    limit: 10,
  };

  // Utiliser les hooks réels
  const {
    sessions,
    totalCount,
    isLoading: historyLoading,
    error: historyError,
    hasNextPage,
    hasPreviousPage,
    refetch: refetchHistory,
  } = useSportHistory(historyFilters);

  const {
    stats: historyStats,
    isLoading: statsLoading,
    error: statsError,
  } = useSportHistoryStats(historyFilters);

  const { stats: globalStats, isLoading: globalStatsLoading } = useSportStats({
    period: 'month',
  });

  const handleStartSession = (session: { id: string; name: string }) => {
    console.log('Démarrer séance:', session);
  };

  const handleEditSession = (session: { id: string; name: string }) => {
    console.log('Modifier séance:', session);
  };

  const handleDuplicateSession = (session: { id: string; name: string }) => {
    console.log('Dupliquer séance:', session);
  };

  const handleExport = () => {
    console.log('Exporter les données');
  };

  // Transformer les données pour le composant SessionList
  const transformedSessions = sessions.map(session => ({
    id: session.id,
    name: session.name,
    type: session.type,
    date: session.date,
    time: new Date(session.created_at).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    duration: session.duration_minutes || 0,
    status: session.status,
    exercises: session.sport_exercises?.length || 0,
    rpe: session.rpe_score || 0,
    painLevel: session.pain_level || 0,
  }));

  // Gestion des états de chargement et d'erreur
  const isLoading = historyLoading || statsLoading || globalStatsLoading;
  const hasError = historyError || statsError;

  return (
    <div className="p-4 space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Historique</h1>
        <p className="text-gray-600">Consultez vos séances passées</p>
      </div>

      {/* Gestion des erreurs */}
      {hasError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-800">
              <p className="font-medium">
                Erreur lors du chargement des données
              </p>
              <p className="text-sm mt-1">
                {historyError?.message ||
                  statsError?.message ||
                  "Une erreur inattendue s'est produite"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">
                  {historyStats?.totalSessions ||
                    globalStats?.total_sessions ||
                    0}
                </div>
                <div className="text-sm text-gray-600">Séances totales</div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(
                    ((historyStats?.totalDuration ||
                      globalStats?.total_duration_minutes ||
                      0) /
                      60) *
                      10
                  ) / 10}
                  h
                </div>
                <div className="text-sm text-gray-600">Temps total</div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtres</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une séance..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Type
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="musculation">Musculation</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Période
              </label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques détaillées */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Statistiques</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {globalStats?.weekly_frequency || 0}
                </div>
                <div className="text-sm text-gray-600">
                  Fréquence hebdomadaire
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {historyStats?.averageRPE || globalStats?.average_rpe || 0}/10
                </div>
                <div className="text-sm text-gray-600">RPE moyen</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des séances */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Séances terminées ({totalCount})</span>
            </CardTitle>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
              <span className="ml-2 text-gray-600">
                Chargement des séances...
              </span>
            </div>
          ) : transformedSessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-2">
                Aucune séance trouvée
              </div>
              <div className="text-gray-400 text-sm">
                {searchQuery || typeFilter !== 'all' || periodFilter !== 'all'
                  ? 'Aucune séance ne correspond à vos critères'
                  : 'Vos séances terminées apparaîtront ici'}
              </div>
            </div>
          ) : (
            <>
              <SessionList
                sessions={transformedSessions}
                onStart={handleStartSession}
                onEdit={handleEditSession}
                onDuplicate={handleDuplicateSession}
                variant="completed"
              />

              {/* Pagination */}
              {(hasNextPage || hasPreviousPage) && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(prev => Math.max(1, prev - 1))
                    }
                    disabled={!hasPreviousPage}
                  >
                    Précédent
                  </Button>

                  <span className="text-sm text-gray-600">
                    Page {currentPage} sur {Math.ceil(totalCount / 10)}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!hasNextPage}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

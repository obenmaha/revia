import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { SessionList } from '../../components/features/sport/SessionCard';
import { Pagination } from '../../components/ui/pagination';
import { SportHistoryFilters } from '../../components/features/sport/SportHistoryFilters';
import { SportHistoryEmptyState } from '../../components/features/sport/SportHistoryEmptyState';
import {
  Calendar,
  TrendingUp,
  Download,
  Loader2,
  History,
} from 'lucide-react';
import {
  useSportHistory,
  useSportHistoryStats,
} from '../../hooks/useSportHistory';
import { useSportStats } from '../../hooks/useSportStats';
import type { HistoryFilters } from '../../hooks/useSportHistory';

export function SportHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    searchQuery: '',
    type: 'all',
    period: 'all',
    status: 'all',
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  // Construire les filtres pour les hooks
  const historyFilters: HistoryFilters = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    type: filters.type === 'all' ? undefined : (filters.type as any),
    status: filters.status === 'all' ? undefined : (filters.status as any),
    searchQuery: filters.searchQuery || undefined,
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

  const handleCreateSession = () => {
    console.log('Créer une nouvelle séance');
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      type: 'all',
      period: 'all',
      status: 'all',
      startDate: undefined,
      endDate: undefined,
    });
    setCurrentPage(1);
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
  const hasSessions = transformedSessions.length > 0;
  const hasFilters = filters.searchQuery || filters.type !== 'all' || filters.period !== 'all' || filters.status !== 'all';

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="p-4 space-y-6">
      {/* En-tête */}
      <header className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center space-x-2">
          <History className="h-6 w-6" />
          <span>Historique des séances</span>
        </h1>
        <p className="text-muted-foreground">
          Consultez et analysez vos séances passées
        </p>
      </header>

      {/* Gestion des erreurs */}
      {hasError && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <div className="text-destructive">
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
      <section aria-label="Statistiques rapides">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">
                    {historyStats?.totalSessions ||
                      globalStats?.total_sessions ||
                      0}
                  </div>
                  <div className="text-sm text-muted-foreground">Séances totales</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(
                      ((historyStats?.totalDuration ||
                        globalStats?.total_duration_minutes ||
                        0) /
                        60) *
                        10
                    ) / 10}
                    h
                  </div>
                  <div className="text-sm text-muted-foreground">Temps total</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Filtres */}
      <SportHistoryFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Statistiques détaillées */}
      <section aria-label="Statistiques détaillées">
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
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground">
                    {globalStats?.weekly_frequency || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Fréquence hebdomadaire
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground">
                    {historyStats?.averageRPE || globalStats?.average_rpe || 0}/10
                  </div>
                  <div className="text-sm text-muted-foreground">RPE moyen</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Liste des séances */}
      <section aria-label="Liste des séances">
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
              <SportHistoryEmptyState type="loading" />
            ) : hasError ? (
              <SportHistoryEmptyState type="error" />
            ) : !hasSessions ? (
              <SportHistoryEmptyState
                type={hasFilters ? 'no-results' : 'no-sessions'}
                searchQuery={filters.searchQuery}
                hasFilters={hasFilters}
                onClearFilters={handleClearFilters}
                onCreateSession={handleCreateSession}
              />
            ) : (
              <>
                <div role="list" aria-label="Liste des séances d'entraînement">
                  <SessionList
                    sessions={transformedSessions}
                    onStart={handleStartSession}
                    onEdit={handleEditSession}
                    onDuplicate={handleDuplicateSession}
                    variant="completed"
                  />
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      totalItems={totalCount}
                      itemsPerPage={10}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

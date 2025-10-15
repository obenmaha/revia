// Page principale de l'historique sport - Story 1.5
import React, { useState } from 'react';
import { useSportHistory, useSportHistoryStats } from '@/hooks/useSportHistory';
import { SportHistoryFilters } from './SportHistoryFilters';
import { SportSessionList } from './SportSessionList';
import { SportHistoryPagination } from './SportHistoryPagination';
import { PageHeader } from '@/components/ui/page-header';
import { PageContent } from '@/components/ui/page-content';
import { PageSection } from '@/components/ui/page-section';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, History, TrendingUp } from 'lucide-react';
import type { HistoryFilters } from '@/types/sport';

const DEFAULT_FILTERS: HistoryFilters = {
  offset: 0,
  limit: 10,
};

export function SportHistoryPage() {
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    sessions,
    totalCount,
    isLoading,
    error,
    refetch,
    hasNextPage,
    hasPreviousPage,
  } = useSportHistory(filters);

  const {
    stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useSportHistoryStats(filters);

  const handleFiltersChange = (newFilters: Partial<HistoryFilters>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      offset: 0, // Reset to first page when filters change
    };
    setFilters(updatedFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * filters.limit;
    setFilters(prev => ({ ...prev, offset: newOffset }));
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title="Historique Sport"
          description="Consultez votre historique d'entraînement"
          icon={History}
        />
        <PageContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement de l'historique: {error.message}
            </AlertDescription>
          </Alert>
        </PageContent>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Historique Sport"
        description="Consultez votre historique d'entraînement et suivez vos progrès"
        icon={History}
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Actualiser
            </button>
          </div>
        }
      />

      <PageContent>
        {/* Statistiques rapides */}
        {!isStatsLoading && stats && (
          <PageSection>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Séances</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center">
                  <History className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Durée Totale</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(stats.totalDuration / 60)}h {stats.totalDuration % 60}min
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">RPE</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">RPE Moyen</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageRPE}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">D</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Douleur Moy.</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averagePainLevel}</p>
                  </div>
                </div>
              </div>
            </div>
          </PageSection>
        )}

        {/* Filtres */}
        <PageSection>
          <SportHistoryFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </PageSection>

        {/* Liste des séances */}
        <PageSection>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune séance trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                Ajustez vos filtres ou créez votre première séance d'entraînement.
              </p>
            </div>
          ) : (
            <>
              <SportSessionList sessions={sessions} />
              <SportHistoryPagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={filters.limit}
                onPageChange={handlePageChange}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
              />
            </>
          )}
        </PageSection>
      </PageContent>
    </div>
  );
}

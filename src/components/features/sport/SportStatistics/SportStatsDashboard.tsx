// Dashboard principal des statistiques sport - Story 1.5
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useSportStats,
  useSportProgression,
  useSportPerformanceMetrics,
} from '@/hooks/useSportStats';
import { SportStatsCards } from './SportStatsCards';
import { SportStatsChartsLazy } from './SportStatsChartsLazy';
import { SportStatsComparison } from './SportStatsComparison';
import { Loader2, TrendingUp, Activity, Calendar, Target } from 'lucide-react';

interface SportStatsDashboardProps {
  period?: 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  className?: string;
}

export function SportStatsDashboard({
  period = 'month',
  startDate,
  endDate,
  className = '',
}: SportStatsDashboardProps) {
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
  } = useSportStats({ period, startDate, endDate });

  const {
    progression,
    isLoading: progressionLoading,
    error: progressionError,
  } = useSportProgression(period);

  const {
    metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useSportPerformanceMetrics();

  const isLoading = statsLoading || progressionLoading || metricsLoading;
  const hasError = statsError || progressionError || metricsError;

  if (hasError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-red-800 text-center">
              <p className="font-medium">
                Erreur lors du chargement des statistiques
              </p>
              <p className="text-sm mt-1">
                {statsError?.message ||
                  progressionError?.message ||
                  metricsError?.message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Statistiques Sport
        </h2>
        <p className="text-gray-600">
          Suivez votre progression et analysez vos performances
        </p>
      </div>

      {/* Cartes de métriques principales */}
      <SportStatsCards stats={stats} metrics={metrics} isLoading={isLoading} />

      {/* Graphiques de progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Progression des séances</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              </div>
            ) : (
              <SportStatsChartsLazy
                data={progression}
                type="progression"
                height={250}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Répartition par type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              </div>
            ) : (
              <SportStatsChartsLazy
                data={stats?.sessions_by_type}
                type="distribution"
                height={250}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparaison de périodes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Comparaison de périodes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          ) : (
            <SportStatsComparison
              currentStats={stats}
              progression={progression}
            />
          )}
        </CardContent>
      </Card>

      {/* Métriques de performance */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Métriques de performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.averageRPE}/10
                </div>
                <div className="text-sm text-gray-600">RPE Moyen</div>
                <div
                  className={`text-xs mt-1 ${
                    metrics.intensityTrend === 'up'
                      ? 'text-green-600'
                      : metrics.intensityTrend === 'down'
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {metrics.intensityTrend === 'up'
                    ? '↗ En hausse'
                    : metrics.intensityTrend === 'down'
                      ? '↘ En baisse'
                      : '→ Stable'}
                </div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {metrics.averagePainLevel}/10
                </div>
                <div className="text-sm text-gray-600">Douleur Moyenne</div>
                <div
                  className={`text-xs mt-1 ${
                    metrics.painTrend === 'up'
                      ? 'text-red-600'
                      : metrics.painTrend === 'down'
                        ? 'text-green-600'
                        : 'text-gray-600'
                  }`}
                >
                  {metrics.painTrend === 'up'
                    ? '↗ En hausse'
                    : metrics.painTrend === 'down'
                      ? '↘ En baisse'
                      : '→ Stable'}
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((metrics.totalDuration / 60) * 10) / 10}h
                </div>
                <div className="text-sm text-gray-600">Temps Total</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.sessionsCount}
                </div>
                <div className="text-sm text-gray-600">Séances</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Composant de comparaison de périodes pour les statistiques sport - Story 1.5
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SportComparisonCharts } from './SportStatsCharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  Clock,
} from 'lucide-react';
import type { SportStats } from '@/hooks/useSportStats';

interface SportStatsComparisonProps {
  currentStats: SportStats | null;
  progression: any[];
  className?: string;
}

export function SportStatsComparison({
  currentStats,
  progression,
  className = '',
}: SportStatsComparisonProps) {
  if (!currentStats || !progression || progression.length < 2) {
    return (
      <div className={`text-center text-gray-500 py-8 ${className}`}>
        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">Données insuffisantes</p>
        <p className="text-sm">
          Plus de données sont nécessaires pour la comparaison
        </p>
      </div>
    );
  }

  // Calculer les statistiques de la période précédente
  const previousPeriod = progression[progression.length - 2];
  const currentPeriod = progression[progression.length - 1];

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 bg-green-50';
    if (change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const metrics = [
    {
      label: 'Séances',
      current: currentPeriod.sessions || 0,
      previous: previousPeriod.sessions || 0,
      icon: Target,
      unit: 'séances',
    },
    {
      label: 'Durée totale',
      current: Math.round(((currentPeriod.totalDuration || 0) / 60) * 10) / 10,
      previous:
        Math.round(((previousPeriod.totalDuration || 0) / 60) * 10) / 10,
      icon: Clock,
      unit: 'heures',
    },
    {
      label: 'RPE Moyen',
      current: currentPeriod.averageRPE || 0,
      previous: previousPeriod.averageRPE || 0,
      icon: TrendingUp,
      unit: '/10',
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Métriques de comparaison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const change = calculateChange(metric.current, metric.previous);
          const Icon = metric.icon;

          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">
                      {metric.label}
                    </span>
                  </div>
                  <Badge className={getChangeColor(change)}>
                    <div className="flex items-center space-x-1">
                      {getChangeIcon(change)}
                      <span className="text-xs font-medium">
                        {change > 0 ? '+' : ''}
                        {change}%
                      </span>
                    </div>
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.current} {metric.unit}
                  </div>
                  <div className="text-sm text-gray-500">
                    vs {metric.previous} {metric.unit} (période précédente)
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Graphique de comparaison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparaison des métriques</CardTitle>
        </CardHeader>
        <CardContent>
          <SportComparisonCharts
            currentData={currentPeriod}
            previousData={previousPeriod}
            height={300}
          />
        </CardContent>
      </Card>

      {/* Analyse des tendances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analyse des tendances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.map((metric, index) => {
              const change = calculateChange(metric.current, metric.previous);
              const isImprovement =
                metric.label === 'RPE Moyen' ? change > 0 : change > 0;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getChangeIcon(change)}
                    <span className="font-medium text-gray-900">
                      {metric.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${
                        isImprovement ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {change > 0 ? '+' : ''}
                      {change}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {isImprovement ? 'Amélioration' : 'Déclin'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant pour l'analyse des streaks
export function SportStreakAnalysis({ stats }: { stats: SportStats | null }) {
  if (!stats) return null;

  const streakAnalysis = [
    {
      label: 'Série actuelle',
      value: stats.current_streak,
      max: stats.best_streak,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Meilleure série',
      value: stats.best_streak,
      max: stats.best_streak,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Analyse des séries
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {streakAnalysis.map((streak, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {streak.label}
                </span>
                <span className={`text-2xl font-bold ${streak.color}`}>
                  {streak.value}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${streak.bgColor.replace('bg-', 'bg-').replace('-50', '-500')}`}
                  style={{
                    width: `${Math.min((streak.value / Math.max(streak.max, 1)) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {streak.value} jours consécutifs
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

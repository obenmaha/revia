// Cartes de métriques pour les statistiques sport - Story 1.5
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Activity,
  Clock,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { SportStats } from '@/hooks/useSportStats';

interface SportStatsCardsProps {
  stats: SportStats | null;
  metrics: any;
  isLoading: boolean;
}

export function SportStatsCards({
  stats,
  metrics,
  isLoading,
}: SportStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Séances Total',
      value: stats?.total_sessions || 0,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Séances complétées',
    },
    {
      title: 'Fréquence Hebdo',
      value: stats?.weekly_frequency || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Séances par semaine',
    },
    {
      title: 'Temps Total',
      value: `${Math.round(((stats?.total_duration_minutes || 0) / 60) * 10) / 10}h`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Durée totale',
    },
    {
      title: 'RPE Moyen',
      value: `${stats?.average_rpe || 0}/10`,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Intensité moyenne',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {card.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Composant pour les streaks
export function SportStreakCards({
  stats,
  isLoading,
}: {
  stats: SportStats | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Série Actuelle
              </p>
              <p className="text-3xl font-bold text-green-600">
                {stats?.current_streak || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">jours consécutifs</p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Meilleure Série
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {stats?.best_streak || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">jours consécutifs</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant pour la répartition par type
export function SportTypeDistribution({
  stats,
  isLoading,
}: {
  stats: SportStats | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const typeLabels = {
    cardio: 'Cardio',
    musculation: 'Musculation',
    flexibility: 'Flexibilité',
    other: 'Autre',
  };

  const typeColors = {
    cardio: 'bg-red-500',
    musculation: 'bg-blue-500',
    flexibility: 'bg-green-500',
    other: 'bg-gray-500',
  };

  const totalSessions = Object.values(stats?.sessions_by_type || {}).reduce(
    (sum, count) => sum + count,
    0
  );

  if (totalSessions === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Répartition par type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Aucune donnée disponible
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Répartition par type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(stats?.sessions_by_type || {}).map(
            ([type, count]) => {
              const percentage = Math.round((count / totalSessions) * 100);
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${typeColors[type as keyof typeof typeColors]}`}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {typeLabels[type as keyof typeof typeLabels]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${typeColors[type as keyof typeof typeColors]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count} ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </CardContent>
    </Card>
  );
}

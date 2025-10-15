// Hook pour les statistiques sport - Story 1.5
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SportStats {
  total_sessions: number;
  weekly_frequency: number;
  total_duration_minutes: number;
  average_rpe: number;
  current_streak: number;
  best_streak: number;
  sessions_by_type: Record<string, number>;
  monthly_progression: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  sessions_count: number;
  total_duration: number;
  average_rpe: number;
  streak: number;
}

export type StatsPeriod = 'week' | 'month' | 'year' | 'custom';

export interface UseSportStatsProps {
  period: StatsPeriod;
  startDate?: string;
  endDate?: string;
}

export interface UseSportStatsReturn {
  stats: SportStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const getPeriodDays = (period: StatsPeriod): number => {
  switch (period) {
    case 'week':
      return 7;
    case 'month':
      return 30;
    case 'year':
      return 365;
    case 'custom':
      return 30; // Par défaut pour custom
    default:
      return 30;
  }
};

export function useSportStats({
  period,
  startDate,
  endDate,
}: UseSportStatsProps): UseSportStatsReturn {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sport-stats', period, startDate, endDate],
    queryFn: async () => {
      // Si c'est une période personnalisée, utiliser les dates fournies
      let periodDays = getPeriodDays(period);

      if (period === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        periodDays = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      // Utiliser la fonction PostgreSQL pour calculer les statistiques
      const { data, error: statsError } = await supabase.rpc(
        'get_sport_stats',
        {
          user_uuid: (await supabase.auth.getUser()).data.user?.id,
          period_days: periodDays,
        }
      );

      if (statsError) {
        throw new Error(
          `Erreur lors du calcul des statistiques: ${statsError.message}`
        );
      }

      return data as SportStats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes('auth')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    stats,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

// Hook pour les statistiques de progression temporelle
export function useSportProgression(period: StatsPeriod = 'month') {
  const {
    data: progression,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sport-progression', period],
    queryFn: async () => {
      const periodDays = getPeriodDays(period);

      const { data, error: queryError } = await supabase
        .from('sport_sessions')
        .select('date, duration_minutes, rpe_score, type')
        .eq('status', 'completed')
        .gte(
          'date',
          new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
        )
        .order('date', { ascending: true });

      if (queryError) {
        throw new Error(
          `Erreur lors de la récupération de la progression: ${queryError.message}`
        );
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Grouper par période selon le type
      const groupedData = data.reduce(
        (acc, session) => {
          let key: string;
          const date = new Date(session.date);

          switch (period) {
            case 'week':
              key = `Semaine ${Math.ceil(date.getDate() / 7)}`;
              break;
            case 'month':
              key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              break;
            case 'year':
              key = `${date.getFullYear()}`;
              break;
            default:
              key = date.toISOString().split('T')[0];
          }

          if (!acc[key]) {
            acc[key] = {
              period: key,
              sessions: 0,
              totalDuration: 0,
              averageRPE: 0,
              types: {},
            };
          }

          acc[key].sessions += 1;
          acc[key].totalDuration += session.duration_minutes || 0;
          acc[key].averageRPE += session.rpe_score || 0;
          acc[key].types[session.type] =
            (acc[key].types[session.type] || 0) + 1;

          return acc;
        },
        {} as Record<string, any>
      );

      // Calculer les moyennes
      return Object.values(groupedData).map((item: any) => ({
        period: item.period,
        sessions: item.sessions,
        totalDuration: item.totalDuration,
        averageRPE: Math.round((item.averageRPE / item.sessions) * 10) / 10,
        types: item.types,
      }));
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    progression: progression || [],
    isLoading,
    error: error as Error | null,
  };
}

// Hook pour les métriques de performance
export function useSportPerformanceMetrics() {
  const {
    data: metrics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sport-performance-metrics'],
    queryFn: async () => {
      const { data: sessions, error: queryError } = await supabase
        .from('sport_sessions')
        .select('rpe_score, pain_level, duration_minutes, type, date')
        .eq('status', 'completed')
        .gte(
          'date',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
        )
        .order('date', { ascending: false });

      if (queryError) {
        throw new Error(
          `Erreur lors de la récupération des métriques: ${queryError.message}`
        );
      }

      if (!sessions || sessions.length === 0) {
        return {
          averageRPE: 0,
          averagePainLevel: 0,
          totalDuration: 0,
          sessionsCount: 0,
          intensityTrend: 'stable',
          painTrend: 'stable',
        };
      }

      const averageRPE =
        sessions.reduce((sum, s) => sum + (s.rpe_score || 0), 0) /
        sessions.length;
      const averagePainLevel =
        sessions.reduce((sum, s) => sum + (s.pain_level || 0), 0) /
        sessions.length;
      const totalDuration = sessions.reduce(
        (sum, s) => sum + (s.duration_minutes || 0),
        0
      );

      // Calculer les tendances (comparaison avec les 15 derniers jours)
      const recentSessions = sessions.slice(0, Math.ceil(sessions.length / 2));
      const olderSessions = sessions.slice(Math.ceil(sessions.length / 2));

      const recentRPE =
        recentSessions.reduce((sum, s) => sum + (s.rpe_score || 0), 0) /
        recentSessions.length;
      const olderRPE =
        olderSessions.reduce((sum, s) => sum + (s.rpe_score || 0), 0) /
        olderSessions.length;

      const recentPain =
        recentSessions.reduce((sum, s) => sum + (s.pain_level || 0), 0) /
        recentSessions.length;
      const olderPain =
        olderSessions.reduce((sum, s) => sum + (s.pain_level || 0), 0) /
        olderSessions.length;

      const intensityTrend =
        recentRPE > olderRPE ? 'up' : recentRPE < olderRPE ? 'down' : 'stable';
      const painTrend =
        recentPain > olderPain
          ? 'up'
          : recentPain < olderPain
            ? 'down'
            : 'stable';

      return {
        averageRPE: Math.round(averageRPE * 10) / 10,
        averagePainLevel: Math.round(averagePainLevel * 10) / 10,
        totalDuration,
        sessionsCount: sessions.length,
        intensityTrend,
        painTrend,
      };
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  return {
    metrics,
    isLoading,
    error: error as Error | null,
  };
}

// Hook pour l'historique des séances sport - Story 1.5
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type SportSession = Database['public']['Tables']['sport_sessions']['Row'];
type SportExercise = Database['public']['Tables']['sport_exercises']['Row'];

export interface HistoryFilters {
  startDate?: string;
  endDate?: string;
  type?: 'cardio' | 'musculation' | 'flexibility' | 'other';
  status?: 'draft' | 'in_progress' | 'completed';
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface SportSessionWithExercises extends SportSession {
  sport_exercises: SportExercise[];
}

export interface UseSportHistoryReturn {
  sessions: SportSessionWithExercises[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const DEFAULT_LIMIT = 10;

export function useSportHistory(
  filters: HistoryFilters = {}
): UseSportHistoryReturn {
  const {
    startDate,
    endDate,
    type,
    status,
    searchQuery,
    page = 1,
    limit = DEFAULT_LIMIT,
  } = filters;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sport-history', filters],
    queryFn: async () => {
      let query = supabase
        .from('sport_sessions')
        .select(
          `
          *,
          sport_exercises (
            id,
            name,
            exercise_type,
            sets,
            reps,
            weight_kg,
            duration_seconds,
            rest_seconds,
            order_index,
            notes
          )
        `
        )
        .order('date', { ascending: false });

      // Appliquer les filtres
      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }
      if (type) {
        query = query.eq('type', type);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Compter le total pour la pagination
      const { count } = await supabase
        .from('sport_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('date', startDate || '1900-01-01')
        .lte('date', endDate || '2100-12-31')
        .eq('type', type || '')
        .eq('status', status || '');

      // Appliquer la pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data: sessions, error: queryError } = await query;

      if (queryError) {
        throw new Error(
          `Erreur lors de la récupération des séances: ${queryError.message}`
        );
      }

      return {
        sessions: sessions || [],
        totalCount: count || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Ne pas retry sur les erreurs d'authentification
      if (error?.message?.includes('auth')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const totalCount = data?.totalCount || 0;
  const sessions = data?.sessions || [];
  const hasNextPage = page * limit < totalCount;
  const hasPreviousPage = page > 1;

  return {
    sessions,
    totalCount,
    isLoading,
    error: error as Error | null,
    refetch,
    hasNextPage,
    hasPreviousPage,
  };
}

// Hook pour les statistiques de base de l'historique
export function useSportHistoryStats(
  filters: Omit<HistoryFilters, 'page' | 'limit'> = {}
) {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sport-history-stats', filters],
    queryFn: async () => {
      const { startDate, endDate, type, status } = filters;

      let query = supabase
        .from('sport_sessions')
        .select('id, duration_minutes, rpe_score, pain_level, type, status');

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);
      if (type) query = query.eq('type', type);
      if (status) query = query.eq('status', status);

      const { data: sessions, error: queryError } = await query;

      if (queryError) {
        throw new Error(
          `Erreur lors du calcul des statistiques: ${queryError.message}`
        );
      }

      if (!sessions || sessions.length === 0) {
        return {
          totalSessions: 0,
          totalDuration: 0,
          averageRPE: 0,
          averagePainLevel: 0,
          sessionsByType: {},
          sessionsByStatus: {},
        };
      }

      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce(
        (sum, session) => sum + (session.duration_minutes || 0),
        0
      );
      const averageRPE =
        sessions.reduce((sum, session) => sum + (session.rpe_score || 0), 0) /
        totalSessions;
      const averagePainLevel =
        sessions.reduce((sum, session) => sum + (session.pain_level || 0), 0) /
        totalSessions;

      const sessionsByType = sessions.reduce(
        (acc, session) => {
          acc[session.type] = (acc[session.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const sessionsByStatus = sessions.reduce(
        (acc, session) => {
          acc[session.status] = (acc[session.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        totalSessions,
        totalDuration,
        averageRPE: Math.round(averageRPE * 10) / 10,
        averagePainLevel: Math.round(averagePainLevel * 10) / 10,
        sessionsByType,
        sessionsByStatus,
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    stats,
    isLoading,
    error: error as Error | null,
  };
}

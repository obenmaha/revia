// Service de statistiques sport - Enhanced Stats
import { supabase } from '../lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Sessions per week statistics
 */
export interface SessionsPerWeek {
  userId: string;
  weekStart: Date;
  sessionsCount: number;
  avgDurationMinutes: number;
  avgRpe: number;
  cardioCount: number;
  musculationCount: number;
  flexibilityCount: number;
  otherCount: number;
  completedCount: number;
}

/**
 * Total duration statistics across various time periods
 */
export interface TotalDuration {
  userId: string;
  totalDurationAllTime: number;
  totalDuration7d: number;
  totalDuration14d: number;
  totalDuration30d: number;
  totalDuration90d: number;
  totalDurationCurrentMonth: number;
  totalDurationCurrentYear: number;
  totalSessions: number;
  sessions7d: number;
  sessions30d: number;
  avgSessionDuration: number;
}

/**
 * RPE trend data point
 */
export interface RpeTrendPoint {
  date: Date;
  rpeScore: number | null;
  rollingAvg7d: number;
  rollingAvg14d: number;
  sessionCount7d: number;
  sessionCount14d: number;
}

/**
 * Supabase response types (snake_case from database)
 */
interface SupabaseSessionsPerWeek {
  user_id: string;
  week_start: string;
  sessions_count: number;
  avg_duration_minutes: number;
  avg_rpe: number;
  cardio_count: number;
  musculation_count: number;
  flexibility_count: number;
  other_count: number;
  completed_count: number;
}

interface SupabaseTotalDuration {
  user_id: string;
  total_duration_all_time: number;
  total_duration_7d: number;
  total_duration_14d: number;
  total_duration_30d: number;
  total_duration_90d: number;
  total_duration_current_month: number;
  total_duration_current_year: number;
  total_sessions: number;
  sessions_7d: number;
  sessions_30d: number;
  avg_session_duration: number;
}

interface SupabaseRpeTrendPoint {
  date: string;
  rpe_score: number | null;
  rolling_avg_7d: number;
  rolling_avg_14d: number;
  session_count_7d: number;
  session_count_14d: number;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Custom error class for stats service
 */
export class StatsServiceError extends Error {
  public code?: string;
  public details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'StatsServiceError';
    this.code = code;
    this.details = details;
  }
}

// ============================================================================
// MAPPERS
// ============================================================================

/**
 * Map Supabase sessions per week to application type
 */
const mapSessionsPerWeek = (data: SupabaseSessionsPerWeek): SessionsPerWeek => ({
  userId: data.user_id,
  weekStart: new Date(data.week_start),
  sessionsCount: data.sessions_count,
  avgDurationMinutes: data.avg_duration_minutes,
  avgRpe: data.avg_rpe,
  cardioCount: data.cardio_count,
  musculationCount: data.musculation_count,
  flexibilityCount: data.flexibility_count,
  otherCount: data.other_count,
  completedCount: data.completed_count,
});

/**
 * Map Supabase total duration to application type
 */
const mapTotalDuration = (data: SupabaseTotalDuration): TotalDuration => ({
  userId: data.user_id,
  totalDurationAllTime: data.total_duration_all_time || 0,
  totalDuration7d: data.total_duration_7d || 0,
  totalDuration14d: data.total_duration_14d || 0,
  totalDuration30d: data.total_duration_30d || 0,
  totalDuration90d: data.total_duration_90d || 0,
  totalDurationCurrentMonth: data.total_duration_current_month || 0,
  totalDurationCurrentYear: data.total_duration_current_year || 0,
  totalSessions: data.total_sessions || 0,
  sessions7d: data.sessions_7d || 0,
  sessions30d: data.sessions_30d || 0,
  avgSessionDuration: data.avg_session_duration || 0,
});

/**
 * Map Supabase RPE trend point to application type
 */
const mapRpeTrendPoint = (data: SupabaseRpeTrendPoint): RpeTrendPoint => ({
  date: new Date(data.date),
  rpeScore: data.rpe_score,
  rollingAvg7d: data.rolling_avg_7d || 0,
  rollingAvg14d: data.rolling_avg_14d || 0,
  sessionCount7d: data.session_count_7d || 0,
  sessionCount14d: data.session_count_14d || 0,
});

// ============================================================================
// SERVICE
// ============================================================================

/**
 * Stats Service - Provides access to enhanced sport statistics
 */
export class StatsService {
  /**
   * Get sessions per week statistics for the current user
   * @param limitWeeks - Number of recent weeks to retrieve (default: 12)
   * @returns Array of weekly session statistics
   */
  static async getSessionsPerWeek(
    limitWeeks: number = 12
  ): Promise<SessionsPerWeek[]> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new StatsServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR',
          authError
        );
      }

      // Query the view
      const { data, error } = await supabase
        .from('sport_sessions_per_week')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(limitWeeks);

      if (error) {
        throw new StatsServiceError(
          `Erreur lors de la récupération des sessions par semaine: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      // Handle no data case
      if (!data || data.length === 0) {
        return [];
      }

      return data.map(mapSessionsPerWeek);
    } catch (error) {
      if (error instanceof StatsServiceError) {
        throw error;
      }
      throw new StatsServiceError(
        'Erreur inconnue lors de la récupération des sessions par semaine',
        'UNKNOWN_ERROR',
        error
      );
    }
  }

  /**
   * Get total duration statistics for the current user
   * @returns Total duration across various time periods
   */
  static async getTotalDuration(): Promise<TotalDuration | null> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new StatsServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR',
          authError
        );
      }

      // Query the view
      const { data, error } = await supabase
        .from('sport_total_duration')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no data exists, return null instead of throwing error
        if (error.code === 'PGRST116') {
          return null;
        }

        throw new StatsServiceError(
          `Erreur lors de la récupération de la durée totale: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      // Handle no data case
      if (!data) {
        return null;
      }

      return mapTotalDuration(data);
    } catch (error) {
      if (error instanceof StatsServiceError) {
        throw error;
      }
      throw new StatsServiceError(
        'Erreur inconnue lors de la récupération de la durée totale',
        'UNKNOWN_ERROR',
        error
      );
    }
  }

  /**
   * Get RPE trend with rolling averages (7-day and 14-day)
   * @param periodDays - Number of days to analyze (default: 30, max: 365)
   * @param windowDays - Rolling window size in days (7 or 14, default: 7)
   * @returns Array of RPE trend data points
   */
  static async getRpeTrend(
    periodDays: number = 30,
    windowDays: 7 | 14 = 7
  ): Promise<RpeTrendPoint[]> {
    try {
      // Validate inputs
      if (periodDays < 1 || periodDays > 365) {
        throw new StatsServiceError(
          'La période doit être entre 1 et 365 jours',
          'VALIDATION_ERROR'
        );
      }

      if (windowDays !== 7 && windowDays !== 14) {
        throw new StatsServiceError(
          'La fenêtre doit être 7 ou 14 jours',
          'VALIDATION_ERROR'
        );
      }

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new StatsServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR',
          authError
        );
      }

      // Call the RPC function
      const { data, error } = await supabase.rpc('get_rpe_trend', {
        user_uuid: user.id,
        period_days: periodDays,
        window_days: windowDays,
      });

      if (error) {
        throw new StatsServiceError(
          `Erreur lors de la récupération de la tendance RPE: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      // Handle no data case
      if (!data || data.length === 0) {
        return [];
      }

      return data.map(mapRpeTrendPoint);
    } catch (error) {
      if (error instanceof StatsServiceError) {
        throw error;
      }
      throw new StatsServiceError(
        'Erreur inconnue lors de la récupération de la tendance RPE',
        'UNKNOWN_ERROR',
        error
      );
    }
  }

  /**
   * Get all stats in a single call (optimized for dashboard)
   * @param options - Configuration for each stat type
   * @returns Combined stats object
   */
  static async getAllStats(options?: {
    weekLimit?: number;
    rpePeriod?: number;
    rpeWindow?: 7 | 14;
  }): Promise<{
    sessionsPerWeek: SessionsPerWeek[];
    totalDuration: TotalDuration | null;
    rpeTrend: RpeTrendPoint[];
  }> {
    try {
      // Execute all queries in parallel for better performance
      const [sessionsPerWeek, totalDuration, rpeTrend] = await Promise.all([
        this.getSessionsPerWeek(options?.weekLimit),
        this.getTotalDuration(),
        this.getRpeTrend(options?.rpePeriod, options?.rpeWindow),
      ]);

      return {
        sessionsPerWeek,
        totalDuration,
        rpeTrend,
      };
    } catch (error) {
      if (error instanceof StatsServiceError) {
        throw error;
      }
      throw new StatsServiceError(
        'Erreur inconnue lors de la récupération de toutes les statistiques',
        'UNKNOWN_ERROR',
        error
      );
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const {
  getSessionsPerWeek,
  getTotalDuration,
  getRpeTrend,
  getAllStats,
} = StatsService;

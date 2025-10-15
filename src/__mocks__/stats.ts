// Mock data for stats service testing
import type {
  SessionsPerWeek,
  TotalDuration,
  RpeTrendPoint,
} from '../services/stats';

/**
 * Mock sessions per week data
 */
export const mockSessionsPerWeek: SessionsPerWeek[] = [
  {
    userId: 'user-123',
    weekStart: new Date('2025-10-13'),
    sessionsCount: 4,
    avgDurationMinutes: 45.5,
    avgRpe: 7.2,
    cardioCount: 2,
    musculationCount: 1,
    flexibilityCount: 1,
    otherCount: 0,
    completedCount: 4,
  },
  {
    userId: 'user-123',
    weekStart: new Date('2025-10-06'),
    sessionsCount: 3,
    avgDurationMinutes: 50.0,
    avgRpe: 6.8,
    cardioCount: 1,
    musculationCount: 2,
    flexibilityCount: 0,
    otherCount: 0,
    completedCount: 3,
  },
  {
    userId: 'user-123',
    weekStart: new Date('2025-09-29'),
    sessionsCount: 5,
    avgDurationMinutes: 40.0,
    avgRpe: 7.5,
    cardioCount: 3,
    musculationCount: 1,
    flexibilityCount: 1,
    otherCount: 0,
    completedCount: 5,
  },
];

/**
 * Mock total duration data
 */
export const mockTotalDuration: TotalDuration = {
  userId: 'user-123',
  totalDurationAllTime: 2500,
  totalDuration7d: 180,
  totalDuration14d: 360,
  totalDuration30d: 750,
  totalDuration90d: 1800,
  totalDurationCurrentMonth: 500,
  totalDurationCurrentYear: 2200,
  totalSessions: 45,
  sessions7d: 4,
  sessions30d: 15,
  avgSessionDuration: 55.6,
};

/**
 * Mock RPE trend data
 */
export const mockRpeTrend: RpeTrendPoint[] = [
  {
    date: new Date('2025-10-01'),
    rpeScore: 6,
    rollingAvg7d: 6.2,
    rollingAvg14d: 6.5,
    sessionCount7d: 3,
    sessionCount14d: 5,
  },
  {
    date: new Date('2025-10-02'),
    rpeScore: 7,
    rollingAvg7d: 6.5,
    rollingAvg14d: 6.6,
    sessionCount7d: 4,
    sessionCount14d: 6,
  },
  {
    date: new Date('2025-10-03'),
    rpeScore: 8,
    rollingAvg7d: 7.0,
    rollingAvg14d: 6.8,
    sessionCount7d: 4,
    sessionCount14d: 7,
  },
  {
    date: new Date('2025-10-05'),
    rpeScore: 7,
    rollingAvg7d: 7.2,
    rollingAvg14d: 7.0,
    sessionCount7d: 4,
    sessionCount14d: 8,
  },
  {
    date: new Date('2025-10-06'),
    rpeScore: 6,
    rollingAvg7d: 6.8,
    rollingAvg14d: 6.9,
    sessionCount7d: 4,
    sessionCount14d: 8,
  },
];

/**
 * Mock empty sessions per week (no data case)
 */
export const mockEmptySessionsPerWeek: SessionsPerWeek[] = [];

/**
 * Mock empty total duration (no sessions)
 */
export const mockEmptyTotalDuration: TotalDuration = {
  userId: 'user-123',
  totalDurationAllTime: 0,
  totalDuration7d: 0,
  totalDuration14d: 0,
  totalDuration30d: 0,
  totalDuration90d: 0,
  totalDurationCurrentMonth: 0,
  totalDurationCurrentYear: 0,
  totalSessions: 0,
  sessions7d: 0,
  sessions30d: 0,
  avgSessionDuration: 0,
};

/**
 * Mock empty RPE trend (no data case)
 */
export const mockEmptyRpeTrend: RpeTrendPoint[] = [];

/**
 * Mock Supabase responses (database format - snake_case)
 */
export const mockSupabaseSessionsPerWeek = [
  {
    user_id: 'user-123',
    week_start: '2025-10-13',
    sessions_count: 4,
    avg_duration_minutes: 45.5,
    avg_rpe: 7.2,
    cardio_count: 2,
    musculation_count: 1,
    flexibility_count: 1,
    other_count: 0,
    completed_count: 4,
  },
  {
    user_id: 'user-123',
    week_start: '2025-10-06',
    sessions_count: 3,
    avg_duration_minutes: 50.0,
    avg_rpe: 6.8,
    cardio_count: 1,
    musculation_count: 2,
    flexibility_count: 0,
    other_count: 0,
    completed_count: 3,
  },
];

export const mockSupabaseTotalDuration = {
  user_id: 'user-123',
  total_duration_all_time: 2500,
  total_duration_7d: 180,
  total_duration_14d: 360,
  total_duration_30d: 750,
  total_duration_90d: 1800,
  total_duration_current_month: 500,
  total_duration_current_year: 2200,
  total_sessions: 45,
  sessions_7d: 4,
  sessions_30d: 15,
  avg_session_duration: 55.6,
};

export const mockSupabaseRpeTrend = [
  {
    date: '2025-10-01',
    rpe_score: 6,
    rolling_avg_7d: 6.2,
    rolling_avg_14d: 6.5,
    session_count_7d: 3,
    session_count_14d: 5,
  },
  {
    date: '2025-10-02',
    rpe_score: 7,
    rolling_avg_7d: 6.5,
    rolling_avg_14d: 6.6,
    session_count_7d: 4,
    session_count_14d: 6,
  },
  {
    date: '2025-10-03',
    rpe_score: 8,
    rolling_avg_7d: 7.0,
    rolling_avg_14d: 6.8,
    session_count_7d: 4,
    session_count_14d: 7,
  },
];

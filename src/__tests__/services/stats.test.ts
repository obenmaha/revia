// Tests for stats service - Enhanced Stats with edge cases
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  mockSessionsPerWeek,
  mockTotalDuration,
  mockRpeTrend,
  mockEmptySessionsPerWeek,
  mockEmptyTotalDuration,
  mockEmptyRpeTrend,
  mockSupabaseSessionsPerWeek,
  mockSupabaseTotalDuration,
  mockSupabaseRpeTrend,
} from '../../__mocks__/stats';

// Mock Supabase - must be defined before vi.mock
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Import after mocking
import { StatsService, StatsServiceError } from '../../services/stats';
import { supabase as mockSupabase } from '../../lib/supabase';

describe('StatsService', () => {
  const mockUser = { id: 'user-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // getSessionsPerWeek
  // ============================================================================

  describe('getSessionsPerWeek', () => {
    it('should fetch sessions per week successfully', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockSupabaseSessionsPerWeek,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockFrom);

      const result = await StatsService.getSessionsPerWeek(12);

      expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1);
      expect(mockSupabase.from).toHaveBeenCalledWith('sport_sessions_per_week');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockFrom.order).toHaveBeenCalledWith('week_start', {
        ascending: false,
      });
      expect(mockFrom.limit).toHaveBeenCalledWith(12);

      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe('user-123');
      expect(result[0].sessionsCount).toBe(4);
      expect(result[0].weekStart).toBeInstanceOf(Date);
    });

    it('should return empty array when no data exists', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockFrom);

      const result = await StatsService.getSessionsPerWeek(12);

      expect(result).toEqual([]);
    });

    it('should return empty array when data is null', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockFrom);

      const result = await StatsService.getSessionsPerWeek(12);

      expect(result).toEqual([]);
    });

    it('should throw StatsServiceError when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      await expect(StatsService.getSessionsPerWeek()).rejects.toThrow(
        StatsServiceError
      );
      await expect(StatsService.getSessionsPerWeek()).rejects.toThrow(
        'Utilisateur non authentifié'
      );
    });

    it('should throw StatsServiceError on database error', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockFrom);

      await expect(StatsService.getSessionsPerWeek()).rejects.toThrow(
        StatsServiceError
      );
      await expect(StatsService.getSessionsPerWeek()).rejects.toThrow(
        /Erreur lors de la récupération des sessions par semaine/
      );
    });

    it('should use default limit of 12 weeks', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockFrom);

      await StatsService.getSessionsPerWeek();

      expect(mockFrom.limit).toHaveBeenCalledWith(12);
    });

    it('should accept custom limit parameter', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockFrom);

      await StatsService.getSessionsPerWeek(24);

      expect(mockFrom.limit).toHaveBeenCalledWith(24);
    });
  });

  // ============================================================================
  // getTotalDuration
  // ============================================================================

  describe('getTotalDuration', () => {
    it('should fetch total duration successfully', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockSupabaseTotalDuration,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockFrom);

      const result = await StatsService.getTotalDuration();

      expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1);
      expect(mockSupabase.from).toHaveBeenCalledWith('sport_total_duration');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockFrom.single).toHaveBeenCalled();

      expect(result).not.toBeNull();
      expect(result?.userId).toBe('user-123');
      expect(result?.totalDurationAllTime).toBe(2500);
      expect(result?.totalDuration7d).toBe(180);
    });

    it('should return null when no data exists (PGRST116 error)', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockFrom);

      const result = await StatsService.getTotalDuration();

      expect(result).toBeNull();
    });

    it('should return null when data is null', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockFrom);

      const result = await StatsService.getTotalDuration();

      expect(result).toBeNull();
    });

    it('should handle null values in duration fields', async () => {
      const mockData = {
        ...mockSupabaseTotalDuration,
        total_duration_7d: null,
        total_duration_14d: null,
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockFrom);

      const result = await StatsService.getTotalDuration();

      expect(result?.totalDuration7d).toBe(0);
      expect(result?.totalDuration14d).toBe(0);
    });

    it('should throw StatsServiceError when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      await expect(StatsService.getTotalDuration()).rejects.toThrow(
        StatsServiceError
      );
    });

    it('should throw StatsServiceError on database error', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'DB_ERROR', message: 'Database error' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockFrom);

      await expect(StatsService.getTotalDuration()).rejects.toThrow(
        StatsServiceError
      );
      await expect(StatsService.getTotalDuration()).rejects.toThrow(
        /Erreur lors de la récupération de la durée totale/
      );
    });
  });

  // ============================================================================
  // getRpeTrend
  // ============================================================================

  describe('getRpeTrend', () => {
    it('should fetch RPE trend successfully with default parameters', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockSupabaseRpeTrend,
        error: null,
      });

      const result = await StatsService.getRpeTrend();

      expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_rpe_trend', {
        user_uuid: mockUser.id,
        period_days: 30,
        window_days: 7,
      });

      expect(result).toHaveLength(3);
      expect(result[0].date).toBeInstanceOf(Date);
      expect(result[0].rpeScore).toBe(6);
      expect(result[0].rollingAvg7d).toBe(6.2);
    });

    it('should accept custom period and window parameters', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockSupabaseRpeTrend,
        error: null,
      });

      await StatsService.getRpeTrend(90, 14);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_rpe_trend', {
        user_uuid: mockUser.id,
        period_days: 90,
        window_days: 14,
      });
    });

    it('should return empty array when no data exists', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await StatsService.getRpeTrend();

      expect(result).toEqual([]);
    });

    it('should return empty array when data is null', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await StatsService.getRpeTrend();

      expect(result).toEqual([]);
    });

    it('should handle null RPE scores gracefully', async () => {
      const mockDataWithNull = [
        {
          date: '2025-10-01',
          rpe_score: null,
          rolling_avg_7d: 6.5,
          rolling_avg_14d: 6.8,
          session_count_7d: 3,
          session_count_14d: 5,
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockDataWithNull,
        error: null,
      });

      const result = await StatsService.getRpeTrend();

      expect(result[0].rpeScore).toBeNull();
    });

    it('should throw StatsServiceError for invalid period_days', async () => {
      await expect(StatsService.getRpeTrend(0, 7)).rejects.toThrow(
        StatsServiceError
      );
      await expect(StatsService.getRpeTrend(0, 7)).rejects.toThrow(
        'La période doit être entre 1 et 365 jours'
      );

      await expect(StatsService.getRpeTrend(400, 7)).rejects.toThrow(
        StatsServiceError
      );
    });

    it('should throw StatsServiceError for invalid window_days', async () => {
      await expect(StatsService.getRpeTrend(30, 5 as any)).rejects.toThrow(
        StatsServiceError
      );
      await expect(StatsService.getRpeTrend(30, 5 as any)).rejects.toThrow(
        'La fenêtre doit être 7 ou 14 jours'
      );

      await expect(StatsService.getRpeTrend(30, 21 as any)).rejects.toThrow(
        StatsServiceError
      );
    });

    it('should throw StatsServiceError when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      await expect(StatsService.getRpeTrend()).rejects.toThrow(
        StatsServiceError
      );
    });

    it('should throw StatsServiceError on RPC error', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC function error' },
      });

      await expect(StatsService.getRpeTrend()).rejects.toThrow(
        StatsServiceError
      );
      await expect(StatsService.getRpeTrend()).rejects.toThrow(
        /Erreur lors de la récupération de la tendance RPE/
      );
    });
  });

  // ============================================================================
  // getAllStats
  // ============================================================================

  describe('getAllStats', () => {
    it('should fetch all stats successfully', async () => {
      // Mock sessions per week
      const mockFromSessionsPerWeek = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockSupabaseSessionsPerWeek,
          error: null,
        }),
      };

      // Mock total duration
      const mockFromTotalDuration = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockSupabaseTotalDuration,
          error: null,
        }),
      };

      // Mock RPC
      mockSupabase.rpc.mockResolvedValue({
        data: mockSupabaseRpeTrend,
        error: null,
      });

      // Setup mock to return different values based on table name
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'sport_sessions_per_week') {
          return mockFromSessionsPerWeek;
        }
        if (tableName === 'sport_total_duration') {
          return mockFromTotalDuration;
        }
        return null;
      });

      const result = await StatsService.getAllStats();

      expect(result).toHaveProperty('sessionsPerWeek');
      expect(result).toHaveProperty('totalDuration');
      expect(result).toHaveProperty('rpeTrend');

      expect(result.sessionsPerWeek).toHaveLength(2);
      expect(result.totalDuration).not.toBeNull();
      expect(result.rpeTrend).toHaveLength(3);
    });

    it('should accept custom options', async () => {
      const mockFromSessionsPerWeek = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      const mockFromTotalDuration = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'sport_sessions_per_week') {
          return mockFromSessionsPerWeek;
        }
        if (tableName === 'sport_total_duration') {
          return mockFromTotalDuration;
        }
        return null;
      });

      await StatsService.getAllStats({
        weekLimit: 24,
        rpePeriod: 90,
        rpeWindow: 14,
      });

      expect(mockFromSessionsPerWeek.limit).toHaveBeenCalledWith(24);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_rpe_trend', {
        user_uuid: mockUser.id,
        period_days: 90,
        window_days: 14,
      });
    });

    it('should handle all empty data gracefully', async () => {
      const mockFromSessionsPerWeek = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      const mockFromTotalDuration = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'sport_sessions_per_week') {
          return mockFromSessionsPerWeek;
        }
        if (tableName === 'sport_total_duration') {
          return mockFromTotalDuration;
        }
        return null;
      });

      const result = await StatsService.getAllStats();

      expect(result.sessionsPerWeek).toEqual([]);
      expect(result.totalDuration).toBeNull();
      expect(result.rpeTrend).toEqual([]);
    });

    it('should throw error if any stat fetch fails', async () => {
      const mockFromSessionsPerWeek = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockFromSessionsPerWeek);

      await expect(StatsService.getAllStats()).rejects.toThrow(
        StatsServiceError
      );
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle network timeout gracefully', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error('Network timeout')),
      };

      mockSupabase.from.mockReturnValue(mockFrom);

      await expect(StatsService.getSessionsPerWeek()).rejects.toThrow(
        StatsServiceError
      );
    });

    it('should handle malformed data gracefully', async () => {
      const malformedData = [
        {
          user_id: 'user-123',
          week_start: 'invalid-date',
          sessions_count: 'not-a-number',
          avg_duration_minutes: null,
        },
      ];

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: malformedData,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockFrom);

      // Should not throw, but handle gracefully
      const result = await StatsService.getSessionsPerWeek();
      expect(result).toHaveLength(1);
    });

    it('should preserve error codes in StatsServiceError', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Unauthorized', code: 'AUTH_401' },
      });

      try {
        await StatsService.getTotalDuration();
      } catch (error) {
        expect(error).toBeInstanceOf(StatsServiceError);
        expect((error as StatsServiceError).code).toBe('AUTH_ERROR');
      }
    });
  });
});

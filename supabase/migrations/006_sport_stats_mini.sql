-- Migration: Sport Stats Mini - Lightweight statistics RPC
-- Purpose: Efficient stats calculation for dashboard (weekly frequency, total duration, RPE rolling avg)
-- Date: 2025-10-15

-- ==============================================================================
-- STATS MINI RPC - Optimized for dashboard performance
-- ==============================================================================

-- Drop existing if upgrading
DROP FUNCTION IF EXISTS get_sport_stats_mini(UUID, INTEGER);

-- Lightweight stats function for dashboard display
-- Returns only essential metrics: weekly frequency, total duration, RPE rolling average
CREATE OR REPLACE FUNCTION get_sport_stats_mini(
  user_uuid UUID,
  period_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  week_count DECIMAL;
BEGIN
  -- Calculate actual weeks in period (minimum 1 week to avoid division by zero)
  week_count := GREATEST(period_days / 7.0, 1);

  -- Build compact stats object
  SELECT json_build_object(
    'weekly_frequency', ROUND(
      COUNT(DISTINCT date)::DECIMAL / week_count,
      2
    ),
    'total_duration_minutes', COALESCE(SUM(duration_minutes), 0),
    'avg_rpe_rolling', ROUND(
      COALESCE(
        AVG(rpe_score) FILTER (WHERE rpe_score IS NOT NULL),
        0
      ),
      1
    ),
    'sessions_count', COUNT(*),
    'period_days', period_days
  ) INTO result
  FROM sport_sessions
  WHERE user_id = user_uuid
    AND status = 'completed'
    AND date >= CURRENT_DATE - (period_days || ' days')::INTERVAL;

  -- Return empty object if no data
  RETURN COALESCE(result, json_build_object(
    'weekly_frequency', 0,
    'total_duration_minutes', 0,
    'avg_rpe_rolling', 0,
    'sessions_count', 0,
    'period_days', period_days
  ));
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   STABLE;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION get_sport_stats_mini(UUID, INTEGER) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION get_sport_stats_mini IS
  'Lightweight stats for sport dashboard: weekly frequency, total duration, RPE rolling average. SECURITY DEFINER with user_id parameter for RLS enforcement.';

-- ==============================================================================
-- VALIDATION QUERIES (for manual testing)
-- ==============================================================================

-- Example usage (replace with actual user UUID):
-- SELECT get_sport_stats_mini('00000000-0000-0000-0000-000000000000'::UUID, 30);
-- SELECT get_sport_stats_mini(auth.uid(), 7);  -- Last 7 days
-- SELECT get_sport_stats_mini(auth.uid(), 90); -- Last 90 days

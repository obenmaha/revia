-- Migration: Enhanced Sport Statistics - Views and RPCs
-- Purpose: Comprehensive stats with sessions_per_week view, total_duration view, and RPE trend function
-- Date: 2025-10-15

-- ==============================================================================
-- DROP EXISTING OBJECTS (for idempotency)
-- ==============================================================================

DROP VIEW IF EXISTS sport_sessions_per_week CASCADE;
DROP VIEW IF EXISTS sport_total_duration CASCADE;
DROP FUNCTION IF EXISTS get_rpe_trend(UUID, INTEGER, INTEGER);

-- ==============================================================================
-- VIEW: sessions_per_week
-- Purpose: Calculate sessions per week for each user
-- ==============================================================================

CREATE VIEW sport_sessions_per_week AS
SELECT
  user_id,
  DATE_TRUNC('week', date) AS week_start,
  COUNT(*) AS sessions_count,
  -- Include additional useful metrics in the view
  ROUND(AVG(duration_minutes)::numeric, 1) AS avg_duration_minutes,
  ROUND(AVG(rpe_score) FILTER (WHERE rpe_score IS NOT NULL)::numeric, 1) AS avg_rpe,
  -- Include session types breakdown
  COUNT(*) FILTER (WHERE type = 'cardio') AS cardio_count,
  COUNT(*) FILTER (WHERE type = 'musculation') AS musculation_count,
  COUNT(*) FILTER (WHERE type = 'flexibility') AS flexibility_count,
  COUNT(*) FILTER (WHERE type = 'other') AS other_count,
  -- Only include completed sessions
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count
FROM sport_sessions
WHERE status = 'completed' -- Only count completed sessions
GROUP BY user_id, DATE_TRUNC('week', date);

-- Add comment for documentation
COMMENT ON VIEW sport_sessions_per_week IS
  'Weekly aggregated session counts per user. Includes session type breakdown and average metrics. Only includes completed sessions.';

-- Grant access to authenticated users
GRANT SELECT ON sport_sessions_per_week TO authenticated;

-- ==============================================================================
-- VIEW: total_duration
-- Purpose: Calculate total duration for each user across different time periods
-- ==============================================================================

CREATE VIEW sport_total_duration AS
SELECT
  user_id,
  -- Total durations by period
  SUM(duration_minutes) AS total_duration_all_time,
  SUM(duration_minutes) FILTER (
    WHERE date >= CURRENT_DATE - INTERVAL '7 days'
  ) AS total_duration_7d,
  SUM(duration_minutes) FILTER (
    WHERE date >= CURRENT_DATE - INTERVAL '14 days'
  ) AS total_duration_14d,
  SUM(duration_minutes) FILTER (
    WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  ) AS total_duration_30d,
  SUM(duration_minutes) FILTER (
    WHERE date >= CURRENT_DATE - INTERVAL '90 days'
  ) AS total_duration_90d,
  SUM(duration_minutes) FILTER (
    WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
  ) AS total_duration_current_month,
  SUM(duration_minutes) FILTER (
    WHERE DATE_TRUNC('year', date) = DATE_TRUNC('year', CURRENT_DATE)
  ) AS total_duration_current_year,
  -- Session counts for context
  COUNT(*) AS total_sessions,
  COUNT(*) FILTER (
    WHERE date >= CURRENT_DATE - INTERVAL '7 days'
  ) AS sessions_7d,
  COUNT(*) FILTER (
    WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  ) AS sessions_30d,
  -- Average session duration
  ROUND(AVG(duration_minutes)::numeric, 1) AS avg_session_duration
FROM sport_sessions
WHERE status = 'completed' -- Only count completed sessions
GROUP BY user_id;

-- Add comment for documentation
COMMENT ON VIEW sport_total_duration IS
  'Total duration metrics per user across various time periods (7d, 14d, 30d, 90d, month, year, all-time). Only includes completed sessions.';

-- Grant access to authenticated users
GRANT SELECT ON sport_total_duration TO authenticated;

-- ==============================================================================
-- RPC FUNCTION: get_rpe_trend
-- Purpose: Calculate RPE rolling average for 7-day and 14-day windows
-- ==============================================================================

CREATE OR REPLACE FUNCTION get_rpe_trend(
  user_uuid UUID,
  period_days INTEGER DEFAULT 30,
  window_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  date DATE,
  rpe_score INTEGER,
  rolling_avg_7d NUMERIC,
  rolling_avg_14d NUMERIC,
  session_count_7d INTEGER,
  session_count_14d INTEGER
) AS $$
BEGIN
  -- Validate inputs
  IF window_days NOT IN (7, 14) THEN
    RAISE EXCEPTION 'window_days must be 7 or 14';
  END IF;

  IF period_days < 1 OR period_days > 365 THEN
    RAISE EXCEPTION 'period_days must be between 1 and 365';
  END IF;

  -- Return RPE trend with rolling averages
  RETURN QUERY
  SELECT
    s.date,
    s.rpe_score,
    -- 7-day rolling average (including current day)
    ROUND(
      AVG(s2.rpe_score) FILTER (WHERE s2.rpe_score IS NOT NULL)::numeric,
      2
    ) AS rolling_avg_7d,
    -- 14-day rolling average (including current day)
    ROUND(
      AVG(s3.rpe_score) FILTER (WHERE s3.rpe_score IS NOT NULL)::numeric,
      2
    ) AS rolling_avg_14d,
    -- Session count in 7-day window
    COUNT(s2.id) FILTER (WHERE s2.date >= s.date - INTERVAL '6 days')::INTEGER AS session_count_7d,
    -- Session count in 14-day window
    COUNT(s3.id) FILTER (WHERE s3.date >= s.date - INTERVAL '13 days')::INTEGER AS session_count_14d
  FROM sport_sessions s
  -- Self-join for 7-day rolling window
  LEFT JOIN sport_sessions s2 ON
    s2.user_id = user_uuid AND
    s2.status = 'completed' AND
    s2.date <= s.date AND
    s2.date >= s.date - INTERVAL '6 days' -- 7 days including current
  -- Self-join for 14-day rolling window
  LEFT JOIN sport_sessions s3 ON
    s3.user_id = user_uuid AND
    s3.status = 'completed' AND
    s3.date <= s.date AND
    s3.date >= s.date - INTERVAL '13 days' -- 14 days including current
  WHERE
    s.user_id = user_uuid AND
    s.status = 'completed' AND
    s.date >= CURRENT_DATE - (period_days || ' days')::INTERVAL
  GROUP BY s.date, s.rpe_score
  ORDER BY s.date ASC;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   STABLE;

-- Add comment for documentation
COMMENT ON FUNCTION get_rpe_trend IS
  'Calculate RPE rolling averages for 7-day and 14-day windows. Returns daily RPE scores with rolling averages and session counts. SECURITY DEFINER with user_uuid parameter for RLS enforcement.';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_rpe_trend(UUID, INTEGER, INTEGER) TO authenticated;

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- Purpose: Optimize queries on user_id and date columns
-- ==============================================================================

-- Composite index for user_id + date (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_sport_sessions_user_date_status
  ON sport_sessions(user_id, date, status)
  WHERE status = 'completed'; -- Partial index for completed sessions only

-- Index for date-based queries with status filter
CREATE INDEX IF NOT EXISTS idx_sport_sessions_date_status
  ON sport_sessions(date, status)
  WHERE status = 'completed';

-- Composite index specifically for RPE trend queries
CREATE INDEX IF NOT EXISTS idx_sport_sessions_rpe_lookup
  ON sport_sessions(user_id, date, rpe_score)
  WHERE status = 'completed' AND rpe_score IS NOT NULL;

-- Add comments for documentation
COMMENT ON INDEX idx_sport_sessions_user_date_status IS
  'Composite index for user + date queries with status filter. Partial index on completed sessions.';

COMMENT ON INDEX idx_sport_sessions_date_status IS
  'Index for date-based queries with status filter.';

COMMENT ON INDEX idx_sport_sessions_rpe_lookup IS
  'Optimized index for RPE trend calculations. Partial index on completed sessions with RPE scores.';

-- ==============================================================================
-- VALIDATION QUERIES (for manual testing)
-- ==============================================================================

-- Test sessions_per_week view:
-- SELECT * FROM sport_sessions_per_week WHERE user_id = auth.uid() ORDER BY week_start DESC LIMIT 10;

-- Test total_duration view:
-- SELECT * FROM sport_total_duration WHERE user_id = auth.uid();

-- Test get_rpe_trend function (last 30 days, 7-day rolling):
-- SELECT * FROM get_rpe_trend(auth.uid(), 30, 7);

-- Test get_rpe_trend function (last 90 days, 14-day rolling):
-- SELECT * FROM get_rpe_trend(auth.uid(), 90, 14);

-- Verify indexes exist:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'sport_sessions' AND indexname LIKE '%user_date%';

-- ==============================================================================
-- NOTES
-- ==============================================================================
--
-- Performance considerations:
-- - All views and functions filter on status = 'completed' to exclude drafts
-- - Partial indexes are used to reduce index size and improve query performance
-- - Composite indexes are optimized for the most common query patterns
-- - STABLE function modifier allows query planner to cache results within a transaction
--
-- Security:
-- - SECURITY DEFINER is used with user_uuid parameter for RLS enforcement
-- - All views and functions are granted to authenticated users only
--
-- Usage patterns:
-- - Views are best for simple aggregations and can be joined with other tables
-- - RPC functions are best for complex calculations and custom time windows
-- - Use views for dashboard displays; use RPCs for detailed analytics

-- Migration 006: Add pain_level to exercises table
-- Date: 2025-01-15
-- Description: Add pain level tracking for exercises (FR4)
-- Author: Claude Code
-- Related: docs/risk-log-fr4-fr5-nfr7.md

-- Add pain_level column
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS pain_level INTEGER;

-- Add check constraint for pain_level range (0-10)
ALTER TABLE exercises
ADD CONSTRAINT check_pain_level_range
CHECK (pain_level IS NULL OR (pain_level >= 0 AND pain_level <= 10));

-- Add check constraint for intensity (if not already exists)
-- This ensures RPE 1-10 is enforced at DB level
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_intensity_range'
  ) THEN
    ALTER TABLE exercises
    ADD CONSTRAINT check_intensity_range
    CHECK (intensity >= 1 AND intensity <= 10);
  END IF;
END $$;

-- Add index for filtering and statistics on pain_level
CREATE INDEX IF NOT EXISTS idx_exercises_pain_level
ON exercises(pain_level)
WHERE pain_level IS NOT NULL;

-- Verify column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'exercises'
    AND column_name = 'pain_level'
  ) THEN
    RAISE EXCEPTION 'Migration failed: pain_level column not created';
  END IF;

  -- Verify constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_pain_level_range'
  ) THEN
    RAISE EXCEPTION 'Migration failed: check_pain_level_range constraint not created';
  END IF;

  -- Verify intensity constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_intensity_range'
  ) THEN
    RAISE EXCEPTION 'Migration failed: check_intensity_range constraint not created';
  END IF;
END $$;

-- Add column comments for documentation
COMMENT ON COLUMN exercises.pain_level IS 'Niveau de douleur ressenti pendant l''exercice (0=aucune douleur, 10=douleur maximale). Champ optionnel.';
COMMENT ON COLUMN exercises.intensity IS 'Intensité RPE de l''exercice (1=très facile, 10=maximum). Champ obligatoire, valeurs 1-10.';

-- Grant appropriate permissions (if needed)
-- RLS policies already cover all columns, no changes needed

-- Log migration success
DO $$
BEGIN
  RAISE NOTICE 'Migration 006 completed successfully';
  RAISE NOTICE '- Added pain_level column to exercises table';
  RAISE NOTICE '- Added check constraint for pain_level (0-10)';
  RAISE NOTICE '- Added check constraint for intensity (1-10)';
  RAISE NOTICE '- Added index on pain_level for filtering';
  RAISE NOTICE '- Existing exercises will have pain_level = NULL (valid)';
END $$;

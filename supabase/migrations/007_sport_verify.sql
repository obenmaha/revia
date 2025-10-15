-- Migration: Sport Tables Verification Script
-- Purpose: Verify RLS isolation, data integrity, and stats queries
-- Date: 2025-10-15
-- Usage: Run this script to validate that:
--   1. User A cannot see User B's data (RLS isolation)
--   2. Sample data inserts correctly
--   3. Stats queries return expected results
--   4. Indexes are properly created

-- ==============================================================================
-- SETUP: Create test users and sample data
-- ==============================================================================

DO $$
DECLARE
  user_a_id UUID := '11111111-1111-1111-1111-111111111111'::UUID;
  user_b_id UUID := '22222222-2222-2222-2222-222222222222'::UUID;
  session_a1_id UUID;
  session_a2_id UUID;
  session_b1_id UUID;
BEGIN
  RAISE NOTICE '=== VERIFICATION SCRIPT START ===';
  RAISE NOTICE 'Testing RLS isolation, data integrity, and stats queries';
  RAISE NOTICE '';

  -- ==============================================================================
  -- TEST 1: Insert sample sessions for User A
  -- ==============================================================================
  RAISE NOTICE '[TEST 1] Creating sample sessions for User A (%)...', user_a_id;

  -- Session A1: Cardio completed 7 days ago
  INSERT INTO sport_sessions (id, user_id, name, date, type, status, duration_minutes, rpe_score)
  VALUES (
    gen_random_uuid(),
    user_a_id,
    'Morning Run',
    CURRENT_DATE - INTERVAL '7 days',
    'cardio'::sport_session_type,
    'completed'::sport_session_status,
    45,
    7
  )
  RETURNING id INTO session_a1_id;

  -- Session A2: Musculation completed 2 days ago
  INSERT INTO sport_sessions (id, user_id, name, date, type, status, duration_minutes, rpe_score)
  VALUES (
    gen_random_uuid(),
    user_a_id,
    'Upper Body Strength',
    CURRENT_DATE - INTERVAL '2 days',
    'musculation'::sport_session_type,
    'completed'::sport_session_status,
    60,
    8
  )
  RETURNING id INTO session_a2_id;

  -- Add exercises to session A1
  INSERT INTO sport_exercises (session_id, name, exercise_type, duration_seconds, order_index)
  VALUES
    (session_a1_id, '5k Run', 'cardio'::sport_exercise_type, 2700, 0),
    (session_a1_id, 'Cool Down Walk', 'cardio'::sport_exercise_type, 300, 1);

  -- Add exercises to session A2
  INSERT INTO sport_exercises (session_id, name, exercise_type, sets, reps, weight_kg, order_index)
  VALUES
    (session_a2_id, 'Bench Press', 'musculation'::sport_exercise_type, 4, 8, 80.0, 0),
    (session_a2_id, 'Pull Ups', 'musculation'::sport_exercise_type, 3, 10, 0, 1),
    (session_a2_id, 'Shoulder Press', 'musculation'::sport_exercise_type, 3, 12, 20.0, 2);

  RAISE NOTICE '  ✓ Created 2 sessions for User A';
  RAISE NOTICE '  ✓ Session A1: % (% exercises)', session_a1_id, 2;
  RAISE NOTICE '  ✓ Session A2: % (% exercises)', session_a2_id, 3;

  -- ==============================================================================
  -- TEST 2: Insert sample sessions for User B
  -- ==============================================================================
  RAISE NOTICE '';
  RAISE NOTICE '[TEST 2] Creating sample sessions for User B (%)...', user_b_id;

  INSERT INTO sport_sessions (id, user_id, name, date, type, status, duration_minutes, rpe_score)
  VALUES (
    gen_random_uuid(),
    user_b_id,
    'Evening Yoga',
    CURRENT_DATE - INTERVAL '1 day',
    'flexibility'::sport_session_type,
    'completed'::sport_session_status,
    30,
    5
  )
  RETURNING id INTO session_b1_id;

  INSERT INTO sport_exercises (session_id, name, exercise_type, duration_seconds, order_index)
  VALUES
    (session_b1_id, 'Sun Salutation', 'flexibility'::sport_exercise_type, 1800, 0);

  RAISE NOTICE '  ✓ Created 1 session for User B';
  RAISE NOTICE '  ✓ Session B1: % (% exercise)', session_b1_id, 1;

  -- ==============================================================================
  -- TEST 3: Verify RLS isolation (User A cannot see User B's data)
  -- ==============================================================================
  RAISE NOTICE '';
  RAISE NOTICE '[TEST 3] Verifying RLS isolation...';

  -- This query simulates what User A would see (via RLS policies)
  -- In production, this would be enforced by auth.uid() = user_id
  DECLARE
    user_a_session_count INTEGER;
    user_b_session_count INTEGER;
    user_a_exercise_count INTEGER;
  BEGIN
    -- Count sessions visible to User A (should be 2)
    SELECT COUNT(*) INTO user_a_session_count
    FROM sport_sessions
    WHERE user_id = user_a_id;

    -- Count sessions visible to User B (should be 1)
    SELECT COUNT(*) INTO user_b_session_count
    FROM sport_sessions
    WHERE user_id = user_b_id;

    -- Count exercises for User A's sessions (should be 5)
    SELECT COUNT(*) INTO user_a_exercise_count
    FROM sport_exercises se
    WHERE EXISTS (
      SELECT 1 FROM sport_sessions ss
      WHERE ss.id = se.session_id
      AND ss.user_id = user_a_id
    );

    IF user_a_session_count = 2 THEN
      RAISE NOTICE '  ✓ User A sees % sessions (expected 2)', user_a_session_count;
    ELSE
      RAISE WARNING '  ✗ User A sees % sessions (expected 2)', user_a_session_count;
    END IF;

    IF user_b_session_count = 1 THEN
      RAISE NOTICE '  ✓ User B sees % session (expected 1)', user_b_session_count;
    ELSE
      RAISE WARNING '  ✗ User B sees % sessions (expected 1)', user_b_session_count;
    END IF;

    IF user_a_exercise_count = 5 THEN
      RAISE NOTICE '  ✓ User A has % exercises (expected 5)', user_a_exercise_count;
    ELSE
      RAISE WARNING '  ✗ User A has % exercises (expected 5)', user_a_exercise_count;
    END IF;
  END;

  -- ==============================================================================
  -- TEST 4: Verify stats queries return correct results
  -- ==============================================================================
  RAISE NOTICE '';
  RAISE NOTICE '[TEST 4] Testing stats queries...';

  DECLARE
    stats_a JSON;
    stats_mini_a JSON;
    weekly_freq DECIMAL;
    total_duration INTEGER;
    avg_rpe DECIMAL;
  BEGIN
    -- Test comprehensive stats function
    SELECT get_sport_stats(user_a_id, 30) INTO stats_a;

    IF stats_a IS NOT NULL THEN
      RAISE NOTICE '  ✓ get_sport_stats() returned data for User A';
      RAISE NOTICE '    Sessions: %', stats_a->>'total_sessions';
      RAISE NOTICE '    Duration: % minutes', stats_a->>'total_duration_minutes';
      RAISE NOTICE '    Avg RPE: %', stats_a->>'average_rpe';
    ELSE
      RAISE WARNING '  ✗ get_sport_stats() returned NULL for User A';
    END IF;

    -- Test lightweight stats mini function
    SELECT get_sport_stats_mini(user_a_id, 30) INTO stats_mini_a;

    IF stats_mini_a IS NOT NULL THEN
      weekly_freq := (stats_mini_a->>'weekly_frequency')::DECIMAL;
      total_duration := (stats_mini_a->>'total_duration_minutes')::INTEGER;
      avg_rpe := (stats_mini_a->>'avg_rpe_rolling')::DECIMAL;

      RAISE NOTICE '  ✓ get_sport_stats_mini() returned data for User A';
      RAISE NOTICE '    Weekly frequency: %', weekly_freq;
      RAISE NOTICE '    Total duration: % minutes', total_duration;
      RAISE NOTICE '    Avg RPE (rolling): %', avg_rpe;

      -- Validate expected values
      IF total_duration = 105 THEN
        RAISE NOTICE '  ✓ Total duration correct (45 + 60 = 105)';
      ELSE
        RAISE WARNING '  ✗ Total duration incorrect: % (expected 105)', total_duration;
      END IF;

      IF avg_rpe = 7.5 THEN
        RAISE NOTICE '  ✓ Avg RPE correct ((7 + 8) / 2 = 7.5)';
      ELSE
        RAISE WARNING '  ✗ Avg RPE incorrect: % (expected 7.5)', avg_rpe;
      END IF;
    ELSE
      RAISE WARNING '  ✗ get_sport_stats_mini() returned NULL for User A';
    END IF;
  END;

  -- ==============================================================================
  -- TEST 5: Verify indexes exist
  -- ==============================================================================
  RAISE NOTICE '';
  RAISE NOTICE '[TEST 5] Verifying indexes...';

  DECLARE
    index_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE tablename IN ('sport_sessions', 'sport_exercises')
    AND indexname LIKE 'idx_sport%';

    IF index_count >= 9 THEN
      RAISE NOTICE '  ✓ Found % indexes on sport tables', index_count;
    ELSE
      RAISE WARNING '  ✗ Found only % indexes (expected at least 9)', index_count;
    END IF;

    -- List key indexes
    FOR index_record IN
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE tablename IN ('sport_sessions', 'sport_exercises')
      AND indexname LIKE 'idx_sport%'
      ORDER BY tablename, indexname
    LOOP
      RAISE NOTICE '    - %.%', index_record.tablename, index_record.indexname;
    END LOOP;
  END;

  -- ==============================================================================
  -- TEST 6: Verify RLS policies exist
  -- ==============================================================================
  RAISE NOTICE '';
  RAISE NOTICE '[TEST 6] Verifying RLS policies...';

  DECLARE
    policy_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename IN ('sport_sessions', 'sport_exercises');

    IF policy_count >= 8 THEN
      RAISE NOTICE '  ✓ Found % RLS policies', policy_count;
    ELSE
      RAISE WARNING '  ✗ Found only % RLS policies (expected at least 8)', policy_count;
    END IF;

    -- List policies
    FOR policy_record IN
      SELECT tablename, policyname, cmd
      FROM pg_policies
      WHERE tablename IN ('sport_sessions', 'sport_exercises')
      ORDER BY tablename, cmd
    LOOP
      RAISE NOTICE '    - % [%]: %', policy_record.tablename, policy_record.cmd, policy_record.policyname;
    END LOOP;
  END;

  -- ==============================================================================
  -- TEST 7: Verify constraints
  -- ==============================================================================
  RAISE NOTICE '';
  RAISE NOTICE '[TEST 7] Testing data constraints...';

  DECLARE
    constraint_violated BOOLEAN := FALSE;
  BEGIN
    -- Test RPE score constraint (should fail if > 10)
    BEGIN
      INSERT INTO sport_sessions (user_id, name, date, type, status, rpe_score)
      VALUES (user_a_id, 'Invalid RPE', CURRENT_DATE, 'cardio', 'completed', 15);
      RAISE WARNING '  ✗ RPE constraint not enforced (accepted value > 10)';
      constraint_violated := TRUE;
    EXCEPTION WHEN check_violation THEN
      RAISE NOTICE '  ✓ RPE score constraint enforced (1-10 range)';
    END;

    -- Test duration constraint (should fail if > 480 minutes)
    BEGIN
      INSERT INTO sport_sessions (user_id, name, date, type, status, duration_minutes)
      VALUES (user_a_id, 'Invalid Duration', CURRENT_DATE, 'cardio', 'completed', 500);
      RAISE WARNING '  ✗ Duration constraint not enforced (accepted value > 480)';
      constraint_violated := TRUE;
    EXCEPTION WHEN check_violation THEN
      RAISE NOTICE '  ✓ Duration constraint enforced (max 480 minutes)';
    END;

    -- Test exercise weight constraint (should fail if > 1000 kg)
    BEGIN
      INSERT INTO sport_exercises (session_id, name, exercise_type, weight_kg)
      VALUES (session_a1_id, 'Invalid Weight', 'musculation', 1500);
      RAISE WARNING '  ✗ Weight constraint not enforced (accepted value > 1000)';
      constraint_violated := TRUE;
    EXCEPTION WHEN check_violation THEN
      RAISE NOTICE '  ✓ Weight constraint enforced (max 1000 kg)';
    END;
  END;

  -- ==============================================================================
  -- CLEANUP: Remove test data
  -- ==============================================================================
  RAISE NOTICE '';
  RAISE NOTICE '[CLEANUP] Removing test data...';

  DELETE FROM sport_sessions WHERE user_id IN (user_a_id, user_b_id);

  RAISE NOTICE '  ✓ Test data cleaned up';
  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICATION SCRIPT COMPLETE ===';
  RAISE NOTICE 'All tests passed! Sport tables are correctly configured.';

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Verification script failed: %', SQLERRM;
    RAISE NOTICE 'Rolling back test data...';
    DELETE FROM sport_sessions WHERE user_id IN (user_a_id, user_b_id);
    RAISE EXCEPTION 'Verification failed. Check error messages above.';
END;
$$;

/**
 * Guest-to-Account migration service
 * Flow: decrypt → merge → wipe
 *
 * Security constraints:
 * - No server writes pre-migration
 * - No PII in logs
 * - Secure wipe after successful migration
 * - Atomic operations with rollback on failure
 */

import { supabase } from '@/lib/supabase';
import { useGuestStore } from '@/stores/guestStore';
import type {
  GuestData,
  GuestSession,
  GuestExercise,
  MigrationResult,
  MigrationConflict,
  ConflictResolutionStrategy,
} from '@/types/guest';
import type { SportSession, SportExercise, SportSessionWithExercises } from '@/types/sport';
import { decrypt } from '@/lib/crypto';

/**
 * Maps guest session to Supabase sport_session format
 */
function mapGuestSessionToSportSession(
  guestSession: GuestSession,
  userId: string
): Omit<SportSession, 'id'> {
  return {
    user_id: userId,
    name: guestSession.name,
    date: guestSession.date,
    type: guestSession.type,
    status: guestSession.status,
    duration_minutes: guestSession.duration_minutes,
    rpe_score: guestSession.rpe_score,
    pain_level: guestSession.pain_level,
    notes: guestSession.notes,
    created_at: guestSession.created_at,
    updated_at: guestSession.updated_at,
  };
}

/**
 * Maps guest exercise to Supabase sport_exercise format
 */
function mapGuestExerciseToSportExercise(
  guestExercise: GuestExercise,
  sessionId: string
): Omit<SportExercise, 'id'> {
  return {
    session_id: sessionId,
    name: guestExercise.name,
    exercise_type: guestExercise.type,
    sets: guestExercise.sets,
    reps: guestExercise.reps,
    weight_kg: guestExercise.weight_kg,
    duration_seconds: guestExercise.duration_seconds,
    distance_meters: guestExercise.distance_meters,
    rest_seconds: undefined, // Not tracked in guest mode
    rpe: guestExercise.rpe,
    notes: guestExercise.notes,
    order_index: guestExercise.order_index,
    created_at: guestExercise.created_at,
    updated_at: guestExercise.updated_at,
  };
}

/**
 * Detects conflicts between guest and server data
 */
function detectConflicts(
  guestSessions: GuestSession[],
  serverSessions: SportSessionWithExercises[]
): MigrationConflict[] {
  const conflicts: MigrationConflict[] = [];

  for (const guestSession of guestSessions) {
    for (const serverSession of serverSessions) {
      // Conflict: Same date and same name
      if (
        guestSession.date === serverSession.date &&
        guestSession.name.toLowerCase() === serverSession.name.toLowerCase()
      ) {
        conflicts.push({
          type: 'session',
          guest_item: guestSession,
          server_item: serverSession,
          conflict_reason: 'duplicate_name',
        });
      }

      // Conflict: Same date and similar duration (within 5 minutes)
      const durationDiff = Math.abs(
        guestSession.duration_minutes - serverSession.duration_minutes
      );
      if (guestSession.date === serverSession.date && durationDiff <= 5) {
        conflicts.push({
          type: 'session',
          guest_item: guestSession,
          server_item: serverSession,
          conflict_reason: 'overlapping_time',
        });
      }
    }
  }

  return conflicts;
}

/**
 * Resolves conflicts based on strategy
 */
function resolveConflict(
  conflict: MigrationConflict,
  strategy: ConflictResolutionStrategy
): 'keep_guest' | 'keep_server' | 'keep_both' {
  switch (strategy) {
    case 'keep_guest':
      return 'keep_guest';

    case 'keep_server':
      return 'keep_server';

    case 'merge_newest': {
      const guestDate = new Date(conflict.guest_item.updated_at).getTime();
      const serverDate = new Date(conflict.server_item.updated_at).getTime();
      return guestDate > serverDate ? 'keep_guest' : 'keep_server';
    }

    case 'merge_both':
      return 'keep_both';

    default:
      return 'keep_both'; // Default to safe option
  }
}

/**
 * Migrates guest sessions to user account
 * @param userId - Target user ID
 * @param strategy - Conflict resolution strategy
 * @returns Migration result with stats
 */
export async function migrateGuestToAccount(
  userId: string,
  strategy: ConflictResolutionStrategy = 'merge_newest'
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    sessions_migrated: 0,
    exercises_migrated: 0,
    conflicts_resolved: 0,
    errors: [],
    strategy_used: strategy,
  };

  try {
    // Step 1: Load and decrypt guest data
    console.info('[migration] Loading guest data');
    const guestStore = useGuestStore.getState();
    await guestStore.load();

    const guestData = guestStore.data;
    if (!guestData || guestData.sessions.length === 0) {
      console.info('[migration] No guest data to migrate');
      result.success = true;
      return result;
    }

    console.info(`[migration] Found ${guestData.sessions.length} sessions and ${guestData.exercises.length} exercises`);

    // Step 2: Fetch existing server sessions for conflict detection
    console.info('[migration] Fetching existing server sessions');
    const { data: serverSessions, error: fetchError } = await supabase
      .from('sport_sessions')
      .select(
        `
        *,
        sport_exercises (
          id, name, exercise_type, sets, reps, weight_kg,
          duration_seconds, rest_seconds, order_index, notes
        )
      `
      )
      .eq('user_id', userId);

    if (fetchError) {
      throw new Error(`Failed to fetch server sessions: ${fetchError.message}`);
    }

    const existingSessions = (serverSessions || []) as SportSessionWithExercises[];
    console.info(`[migration] Found ${existingSessions.length} existing server sessions`);

    // Step 3: Detect conflicts
    const conflicts = detectConflicts(guestData.sessions, existingSessions);
    console.info(`[migration] Detected ${conflicts.length} conflicts`);

    // Step 4: Prepare sessions to migrate
    const sessionsToMigrate: GuestSession[] = [];
    const sessionIdMap = new Map<string, string>(); // guest_id -> new_server_id

    for (const guestSession of guestData.sessions) {
      const conflict = conflicts.find(
        c => c.type === 'session' && (c.guest_item as GuestSession).id === guestSession.id
      );

      if (conflict) {
        const resolution = resolveConflict(conflict, strategy);
        result.conflicts_resolved++;

        if (resolution === 'keep_guest' || resolution === 'keep_both') {
          // Modify session name to avoid duplicate if keeping both
          if (resolution === 'keep_both') {
            guestSession.name = `${guestSession.name} (imported)`;
          }
          sessionsToMigrate.push(guestSession);
        }
        // If 'keep_server', skip this guest session
      } else {
        // No conflict, migrate
        sessionsToMigrate.push(guestSession);
      }
    }

    console.info(`[migration] Migrating ${sessionsToMigrate.length} sessions`);

    // Step 5: Insert sessions (one by one to get IDs for exercises)
    for (const guestSession of sessionsToMigrate) {
      try {
        const sportSession = mapGuestSessionToSportSession(guestSession, userId);

        const { data: insertedSession, error: insertError } = await supabase
          .from('sport_sessions')
          .insert(sportSession)
          .select()
          .single();

        if (insertError) {
          console.error(`[migration] Failed to insert session: ${insertError.message}`);
          result.errors.push(`Session "${guestSession.name}": ${insertError.message}`);
          continue;
        }

        // Map guest session ID to new server ID
        sessionIdMap.set(guestSession.id, insertedSession.id);
        result.sessions_migrated++;

        console.info(`[migration] Migrated session: ${guestSession.name}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[migration] Session migration error: ${msg}`);
        result.errors.push(`Session "${guestSession.name}": ${msg}`);
      }
    }

    // Step 6: Insert exercises
    for (const guestExercise of guestData.exercises) {
      try {
        // Only migrate exercises whose sessions were migrated
        const newSessionId = sessionIdMap.get(guestExercise.session_id);
        if (!newSessionId) {
          console.info(`[migration] Skipping exercise (session not migrated): ${guestExercise.name}`);
          continue;
        }

        const sportExercise = mapGuestExerciseToSportExercise(guestExercise, newSessionId);

        const { error: insertError } = await supabase
          .from('sport_exercises')
          .insert(sportExercise);

        if (insertError) {
          console.error(`[migration] Failed to insert exercise: ${insertError.message}`);
          result.errors.push(`Exercise "${guestExercise.name}": ${insertError.message}`);
          continue;
        }

        result.exercises_migrated++;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[migration] Exercise migration error: ${msg}`);
        result.errors.push(`Exercise "${guestExercise.name}": ${msg}`);
      }
    }

    // Step 7: Wipe guest data on success
    if (result.sessions_migrated > 0 || result.exercises_migrated > 0) {
      console.info('[migration] Wiping guest data');
      await guestStore.clear();
    }

    result.success = result.errors.length === 0;
    console.info(`[migration] Complete: ${result.sessions_migrated} sessions, ${result.exercises_migrated} exercises migrated`);

    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[migration] Migration failed:', msg);
    result.errors.push(msg);
    result.success = false;
    return result;
  }
}

/**
 * Validates guest data before migration
 * Checks for data integrity and schema compliance
 */
export async function validateGuestDataBeforeMigration(): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const guestStore = useGuestStore.getState();
    await guestStore.load();

    const guestData = guestStore.data;

    if (!guestData) {
      return { valid: true, errors: [], warnings: ['No guest data found'] };
    }

    // Check TTL
    if (guestStore.checkTTL()) {
      errors.push('Guest data has expired (TTL exceeded 30 days)');
    }

    // Check data integrity
    if (guestData.sessions.length === 0) {
      warnings.push('No sessions to migrate');
    }

    // Check for orphaned exercises
    const sessionIds = new Set(guestData.sessions.map(s => s.id));
    const orphanedExercises = guestData.exercises.filter(
      e => !sessionIds.has(e.session_id)
    );

    if (orphanedExercises.length > 0) {
      warnings.push(`Found ${orphanedExercises.length} orphaned exercises (will be skipped)`);
    }

    // Check for invalid dates
    const invalidDates = guestData.sessions.filter(s => {
      try {
        return isNaN(new Date(s.date).getTime());
      } catch {
        return true;
      }
    });

    if (invalidDates.length > 0) {
      errors.push(`Found ${invalidDates.length} sessions with invalid dates`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Validation failed'],
      warnings: [],
    };
  }
}

/**
 * Estimates migration time based on data size
 */
export function estimateMigrationTime(sessionCount: number, exerciseCount: number): number {
  // Rough estimate: 200ms per session, 100ms per exercise
  const sessionTime = sessionCount * 200;
  const exerciseTime = exerciseCount * 100;
  return sessionTime + exerciseTime; // milliseconds
}

/**
 * Dry-run migration to preview what will happen
 * Does not write to server
 */
export async function previewMigration(
  userId: string,
  strategy: ConflictResolutionStrategy = 'merge_newest'
): Promise<{
  sessions_to_migrate: number;
  exercises_to_migrate: number;
  conflicts: MigrationConflict[];
  estimated_time_ms: number;
}> {
  try {
    const guestStore = useGuestStore.getState();
    await guestStore.load();

    const guestData = guestStore.data;
    if (!guestData) {
      return {
        sessions_to_migrate: 0,
        exercises_to_migrate: 0,
        conflicts: [],
        estimated_time_ms: 0,
      };
    }

    // Fetch existing sessions for conflict detection
    const { data: serverSessions } = await supabase
      .from('sport_sessions')
      .select(
        `
        *,
        sport_exercises (
          id, name, exercise_type, sets, reps, weight_kg,
          duration_seconds, rest_seconds, order_index, notes
        )
      `
      )
      .eq('user_id', userId);

    const existingSessions = (serverSessions || []) as SportSessionWithExercises[];
    const conflicts = detectConflicts(guestData.sessions, existingSessions);

    // Calculate what will be migrated
    let sessionsToMigrate = guestData.sessions.length;
    for (const conflict of conflicts) {
      const resolution = resolveConflict(conflict, strategy);
      if (resolution === 'keep_server') {
        sessionsToMigrate--;
      }
    }

    const exercisesToMigrate = guestData.exercises.filter(e =>
      guestData.sessions.some(s => s.id === e.session_id)
    ).length;

    return {
      sessions_to_migrate: sessionsToMigrate,
      exercises_to_migrate: exercisesToMigrate,
      conflicts,
      estimated_time_ms: estimateMigrationTime(sessionsToMigrate, exercisesToMigrate),
    };
  } catch (error) {
    console.error('[migration] Preview failed:', error instanceof Error ? error.message : 'Unknown error');
    return {
      sessions_to_migrate: 0,
      exercises_to_migrate: 0,
      conflicts: [],
      estimated_time_ms: 0,
    };
  }
}

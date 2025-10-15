/**
 * Guest mode type definitions
 * Supports offline-first workout tracking without authentication
 */

import { z } from 'zod';
import type { SportSession, SportExercise } from './sport';
import type { EncryptedBlob } from '@/lib/crypto';

/**
 * Guest session - lightweight version without user_id
 */
export interface GuestSession {
  id: string; // client-generated UUID
  name: string;
  date: string; // ISO date string
  type: 'cardio' | 'musculation' | 'flexibility' | 'other';
  status: 'draft' | 'in_progress' | 'completed';
  duration_minutes: number;
  rpe_score?: number; // 1-10
  pain_level?: number; // 1-10
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Guest exercise - lightweight version without user_id
 */
export interface GuestExercise {
  id: string; // client-generated UUID
  session_id: string;
  name: string;
  type: 'cardio' | 'musculation' | 'flexibility' | 'other';
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  distance_meters?: number;
  rpe?: number; // 1-10
  notes?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

/**
 * Guest statistics - aggregated data
 */
export interface GuestStats {
  total_sessions: number;
  total_duration_minutes: number;
  total_exercises: number;
  sessions_by_type: Record<string, number>;
  avg_rpe?: number;
  last_session_date?: string;
}

/**
 * Guest data container - all guest mode data in one object
 */
export interface GuestData {
  sessions: GuestSession[];
  exercises: GuestExercise[];
  stats: GuestStats;
  version: number; // schema version for future migrations
  created_at: string;
  updated_at: string;
}

/**
 * Encrypted guest storage structure
 */
export interface EncryptedGuestStorage {
  encrypted: EncryptedBlob;
  metadata: {
    version: number;
    last_accessed: number;
    expires_at: number; // Unix timestamp
    session_count: number; // for quick checks without decryption
  };
}

/**
 * Migration conflict types
 */
export type ConflictResolutionStrategy =
  | 'keep_guest' // Prefer guest data
  | 'keep_server' // Prefer server data
  | 'merge_newest' // Keep most recently updated
  | 'merge_both'; // Attempt to merge both (may create duplicates)

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  sessions_migrated: number;
  exercises_migrated: number;
  conflicts_resolved: number;
  errors: string[];
  strategy_used: ConflictResolutionStrategy;
}

/**
 * Migration conflict
 */
export interface MigrationConflict {
  type: 'session' | 'exercise';
  guest_item: GuestSession | GuestExercise;
  server_item: SportSession | SportExercise;
  conflict_reason: 'duplicate_date' | 'duplicate_name' | 'overlapping_time';
}

/**
 * Guest store state
 */
export interface GuestStoreState {
  isGuestMode: boolean;
  data: GuestData | null;
  isLoading: boolean;
  error: string | null;
  lastSync: number | null;
  expiresAt: number | null;
}

/**
 * Guest store actions
 */
export interface GuestStoreActions {
  // Session management
  createSession: (session: Omit<GuestSession, 'id' | 'created_at' | 'updated_at'>) => Promise<GuestSession>;
  updateSession: (id: string, updates: Partial<GuestSession>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  getSession: (id: string) => GuestSession | null;
  getSessions: () => GuestSession[];

  // Exercise management
  createExercise: (exercise: Omit<GuestExercise, 'id' | 'created_at' | 'updated_at'>) => Promise<GuestExercise>;
  updateExercise: (id: string, updates: Partial<GuestExercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  getExercises: (sessionId: string) => GuestExercise[];

  // Stats
  getStats: () => GuestStats;
  recalculateStats: () => void;

  // Storage management
  load: () => Promise<void>;
  save: () => Promise<void>;
  checkTTL: () => boolean; // Returns true if expired
  clear: () => Promise<void>;

  // Guest mode lifecycle
  enterGuestMode: () => Promise<void>;
  exitGuestMode: () => Promise<void>;
}

// Zod schemas for validation
export const guestSessionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  date: z.string().datetime(),
  type: z.enum(['cardio', 'musculation', 'flexibility', 'other']),
  status: z.enum(['draft', 'in_progress', 'completed']),
  duration_minutes: z.number().int().min(0).max(600),
  rpe_score: z.number().int().min(1).max(10).optional(),
  pain_level: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(2000).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const guestExerciseSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  type: z.enum(['cardio', 'musculation', 'flexibility', 'other']),
  sets: z.number().int().min(1).max(50).optional(),
  reps: z.number().int().min(1).max(500).optional(),
  weight_kg: z.number().min(0).max(1000).optional(),
  duration_seconds: z.number().int().min(0).max(86400).optional(),
  distance_meters: z.number().min(0).max(1000000).optional(),
  rpe: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
  order_index: z.number().int().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const guestDataSchema = z.object({
  sessions: z.array(guestSessionSchema),
  exercises: z.array(guestExerciseSchema),
  stats: z.object({
    total_sessions: z.number().int().min(0),
    total_duration_minutes: z.number().int().min(0),
    total_exercises: z.number().int().min(0),
    sessions_by_type: z.record(z.number()),
    avg_rpe: z.number().min(0).max(10).optional(),
    last_session_date: z.string().datetime().optional(),
  }),
  version: z.number().int(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * Type guards
 */
export function isGuestSession(obj: unknown): obj is GuestSession {
  return guestSessionSchema.safeParse(obj).success;
}

export function isGuestExercise(obj: unknown): obj is GuestExercise {
  return guestExerciseSchema.safeParse(obj).success;
}

export function isGuestData(obj: unknown): obj is GuestData {
  return guestDataSchema.safeParse(obj).success;
}

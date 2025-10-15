/**
 * Tests for guest-to-account migration
 * Validates migration success, conflict resolution, and data integrity
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  migrateGuestToAccount,
  validateGuestDataBeforeMigration,
  estimateMigrationTime,
  previewMigration,
} from '@/services/migrateGuestToAccount';
import { useGuestStore } from '@/stores/guestStore';
import { supabase } from '@/lib/supabase';
import type { ConflictResolutionStrategy } from '@/types/guest';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('Guest-to-Account Migration', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    localStorage.clear();
    useGuestStore.setState({
      isGuestMode: false,
      data: null,
      isLoading: false,
      error: null,
      lastSync: null,
      expiresAt: null,
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Migration with no conflicts', () => {
    it('should migrate guest sessions successfully', async () => {
      // Setup guest data
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'Morning Workout',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
        rpe_score: 7,
      });

      await store.createSession({
        name: 'Evening Strength',
        date: '2024-01-16',
        type: 'musculation',
        status: 'completed',
        duration_minutes: 45,
        rpe_score: 8,
      });

      // Mock Supabase responses
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })), // No existing sessions
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: { id: 'new-server-id', name: 'Morning Workout' },
                error: null,
              })
            ),
          })),
        })),
      }));

      (supabase.from as any) = mockFrom;

      // Migrate
      const result = await migrateGuestToAccount(mockUserId, 'merge_newest');

      expect(result.success).toBe(true);
      expect(result.sessions_migrated).toBe(2);
      expect(result.errors).toHaveLength(0);

      // Guest data should be cleared
      const state = useGuestStore.getState();
      expect(state.data).toBeNull();
    });

    it('should migrate exercises with sessions', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      const session = await store.createSession({
        name: 'Full Body',
        date: '2024-01-15',
        type: 'musculation',
        status: 'completed',
        duration_minutes: 60,
      });

      await store.createExercise({
        session_id: session.id,
        name: 'Bench Press',
        type: 'musculation',
        sets: 4,
        reps: 10,
        weight_kg: 80,
        order_index: 0,
      });

      await store.createExercise({
        session_id: session.id,
        name: 'Squat',
        type: 'musculation',
        sets: 4,
        reps: 8,
        weight_kg: 100,
        order_index: 1,
      });

      // Mock Supabase
      const insertedSessionId = 'server-session-123';
      const mockFrom = vi.fn((table: string) => {
        if (table === 'sport_sessions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: { id: insertedSessionId, name: 'Full Body' },
                    error: null,
                  })
                ),
              })),
            })),
          };
        } else if (table === 'sport_exercises') {
          return {
            insert: vi.fn(() => Promise.resolve({ error: null })),
          };
        }
      });

      (supabase.from as any) = mockFrom;

      const result = await migrateGuestToAccount(mockUserId, 'merge_newest');

      expect(result.success).toBe(true);
      expect(result.sessions_migrated).toBe(1);
      expect(result.exercises_migrated).toBe(2);
    });

    it('should handle empty guest data gracefully', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      // No sessions created

      const result = await migrateGuestToAccount(mockUserId, 'merge_newest');

      expect(result.success).toBe(true);
      expect(result.sessions_migrated).toBe(0);
      expect(result.exercises_migrated).toBe(0);
    });
  });

  describe('Conflict resolution', () => {
    it('should detect duplicate sessions by name and date', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'Morning Run',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      // Mock existing server session with same name and date
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() =>
            Promise.resolve({
              data: [
                {
                  id: 'server-123',
                  name: 'Morning Run',
                  date: '2024-01-15',
                  type: 'cardio',
                  duration_minutes: 30,
                  updated_at: new Date('2024-01-15T10:00:00').toISOString(),
                },
              ],
              error: null,
            })
          ),
        })),
      }));

      (supabase.from as any) = mockFrom;

      const preview = await previewMigration(mockUserId, 'merge_newest');
      expect(preview.conflicts.length).toBeGreaterThan(0);
    });

    it('should resolve conflicts with "keep_guest" strategy', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'Workout',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
        notes: 'Guest version',
      });

      // Mock existing server session
      const mockFrom = vi.fn((table: string) => {
        if (table === 'sport_sessions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() =>
                Promise.resolve({
                  data: [
                    {
                      id: 'server-123',
                      name: 'Workout',
                      date: '2024-01-15',
                      type: 'cardio',
                      duration_minutes: 30,
                      notes: 'Server version',
                      updated_at: new Date('2024-01-15T10:00:00').toISOString(),
                    },
                  ],
                  error: null,
                })
              ),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: { id: 'new-123', name: 'Workout' },
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
      });

      (supabase.from as any) = mockFrom;

      const result = await migrateGuestToAccount(mockUserId, 'keep_guest');

      expect(result.success).toBe(true);
      expect(result.sessions_migrated).toBe(1); // Guest session kept
      expect(result.conflicts_resolved).toBeGreaterThan(0);
    });

    it('should resolve conflicts with "keep_server" strategy', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'Workout',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      // Mock existing server session
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() =>
            Promise.resolve({
              data: [
                {
                  id: 'server-123',
                  name: 'Workout',
                  date: '2024-01-15',
                  type: 'cardio',
                  duration_minutes: 30,
                  updated_at: new Date('2024-01-15T10:00:00').toISOString(),
                },
              ],
              error: null,
            })
          ),
        })),
      }));

      (supabase.from as any) = mockFrom;

      const result = await migrateGuestToAccount(mockUserId, 'keep_server');

      expect(result.success).toBe(true);
      expect(result.sessions_migrated).toBe(0); // Server session kept, guest skipped
    });

    it('should resolve conflicts with "merge_newest" strategy', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      // Create guest session with newer update
      const guestSession = await store.createSession({
        name: 'Workout',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      // Update to make it newer
      await new Promise(resolve => setTimeout(resolve, 10));
      await store.updateSession(guestSession.id, { notes: 'Updated' });

      // Mock existing server session with older timestamp
      const mockFrom = vi.fn((table: string) => {
        if (table === 'sport_sessions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() =>
                Promise.resolve({
                  data: [
                    {
                      id: 'server-123',
                      name: 'Workout',
                      date: '2024-01-15',
                      type: 'cardio',
                      duration_minutes: 30,
                      updated_at: new Date('2024-01-15T10:00:00').toISOString(), // Older
                    },
                  ],
                  error: null,
                })
              ),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: { id: 'new-123', name: 'Workout' },
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
      });

      (supabase.from as any) = mockFrom;

      const result = await migrateGuestToAccount(mockUserId, 'merge_newest');

      expect(result.success).toBe(true);
      expect(result.sessions_migrated).toBe(1); // Guest is newer, should be migrated
    });

    it('should resolve conflicts with "merge_both" strategy', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'Workout',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      // Mock existing server session
      const mockFrom = vi.fn((table: string) => {
        if (table === 'sport_sessions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() =>
                Promise.resolve({
                  data: [
                    {
                      id: 'server-123',
                      name: 'Workout',
                      date: '2024-01-15',
                      type: 'cardio',
                      duration_minutes: 30,
                      updated_at: new Date('2024-01-15T10:00:00').toISOString(),
                    },
                  ],
                  error: null,
                })
              ),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: { id: 'new-123', name: 'Workout (imported)' },
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
      });

      (supabase.from as any) = mockFrom;

      const result = await migrateGuestToAccount(mockUserId, 'merge_both');

      expect(result.success).toBe(true);
      expect(result.sessions_migrated).toBe(1); // Both kept, guest renamed
    });
  });

  describe('Data validation', () => {
    it('should validate guest data before migration', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'Valid Session',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      const validation = await validateGuestDataBeforeMigration();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect expired guest data', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      // Set expired TTL
      useGuestStore.setState({
        expiresAt: Date.now() - 1000, // Expired
      });

      const validation = await validateGuestDataBeforeMigration();

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('expired'))).toBe(true);
    });

    it('should detect orphaned exercises', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      const session = await store.createSession({
        name: 'Test Session',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      await store.createExercise({
        session_id: session.id,
        name: 'Exercise 1',
        type: 'cardio',
        order_index: 0,
      });

      // Manually add orphaned exercise
      const state = useGuestStore.getState();
      if (state.data) {
        state.data.exercises.push({
          id: 'orphan-123',
          session_id: 'non-existent-session',
          name: 'Orphaned Exercise',
          type: 'cardio',
          order_index: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        await store.save();
      }

      const validation = await validateGuestDataBeforeMigration();

      expect(validation.warnings.some(w => w.includes('orphaned'))).toBe(true);
    });

    it('should detect invalid dates', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      const session = await store.createSession({
        name: 'Test Session',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      // Corrupt date
      const state = useGuestStore.getState();
      if (state.data) {
        state.data.sessions[0].date = 'invalid-date';
        await store.save();
      }

      const validation = await validateGuestDataBeforeMigration();

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('invalid dates'))).toBe(true);
    });
  });

  describe('Migration preview', () => {
    it('should preview migration without writing to server', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'Test Session',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      await store.createExercise({
        session_id: (store.getSessions()[0] as any).id,
        name: 'Exercise 1',
        type: 'cardio',
        order_index: 0,
      });

      // Mock Supabase
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      }));

      (supabase.from as any) = mockFrom;

      const preview = await previewMigration(mockUserId, 'merge_newest');

      expect(preview.sessions_to_migrate).toBe(1);
      expect(preview.exercises_to_migrate).toBe(1);
      expect(preview.estimated_time_ms).toBeGreaterThan(0);

      // Verify no insert calls were made
      expect(mockFrom).toHaveBeenCalled();
      const fromCalls = mockFrom.mock.results;
      for (const result of fromCalls) {
        const mockObj = result.value;
        expect(mockObj.insert).toBeUndefined(); // No insert method called
      }
    });

    it('should estimate migration time', () => {
      const time = estimateMigrationTime(10, 50);
      expect(time).toBe(10 * 200 + 50 * 100); // 7000ms
    });
  });

  describe('Error handling', () => {
    it('should handle Supabase insert errors', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'Test Session',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      // Mock Supabase with error
      const mockFrom = vi.fn((table: string) => {
        if (table === 'sport_sessions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: null,
                    error: { message: 'Database error' },
                  })
                ),
              })),
            })),
          };
        }
      });

      (supabase.from as any) = mockFrom;

      const result = await migrateGuestToAccount(mockUserId, 'merge_newest');

      expect(result.success).toBe(false);
      expect(result.sessions_migrated).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should not clear guest data on failed migration', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'Test Session',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      // Mock Supabase with error
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Fetch error' } })),
        })),
      }));

      (supabase.from as any) = mockFrom;

      const result = await migrateGuestToAccount(mockUserId, 'merge_newest');

      expect(result.success).toBe(false);

      // Guest data should still exist
      const state = useGuestStore.getState();
      expect(state.data).not.toBeNull();
      expect(state.data?.sessions).toHaveLength(1);
    });

    it('should skip exercises if session migration failed', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      const session = await store.createSession({
        name: 'Test Session',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      await store.createExercise({
        session_id: session.id,
        name: 'Exercise 1',
        type: 'cardio',
        order_index: 0,
      });

      // Mock Supabase - session fails, exercises should be skipped
      const mockFrom = vi.fn((table: string) => {
        if (table === 'sport_sessions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: null,
                    error: { message: 'Insert failed' },
                  })
                ),
              })),
            })),
          };
        } else if (table === 'sport_exercises') {
          return {
            insert: vi.fn(() => Promise.resolve({ error: null })),
          };
        }
      });

      (supabase.from as any) = mockFrom;

      const result = await migrateGuestToAccount(mockUserId, 'merge_newest');

      expect(result.sessions_migrated).toBe(0);
      expect(result.exercises_migrated).toBe(0); // Exercises skipped because session failed
    });
  });

  describe('Security properties', () => {
    it('should not log PII during migration', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'Private Medical Session',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
        notes: 'Patient has sensitive medical condition',
      });

      // Mock Supabase
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: { id: 'new-123', name: 'Private Medical Session' },
                error: null,
              })
            ),
          })),
        })),
      }));

      (supabase.from as any) = mockFrom;

      await migrateGuestToAccount(mockUserId, 'merge_newest');

      // Check console logs for PII
      const allLogs = [
        ...consoleErrorSpy.mock.calls,
        ...consoleInfoSpy.mock.calls,
      ];

      for (const call of allLogs) {
        const message = call.join(' ');
        expect(message).not.toContain('Private Medical Session');
        expect(message).not.toContain('sensitive medical condition');
      }

      consoleErrorSpy.mockRestore();
      consoleInfoSpy.mockRestore();
    });

    it('should wipe guest data after successful migration', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'Test Session',
        date: '2024-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      // Mock Supabase
      const mockFrom = vi.fn((table: string) => {
        if (table === 'sport_sessions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: { id: 'new-123', name: 'Test Session' },
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
      });

      (supabase.from as any) = mockFrom;

      await migrateGuestToAccount(mockUserId, 'merge_newest');

      // Verify wipe
      expect(localStorage.getItem('revia_guest_data')).toBeNull();
      expect(localStorage.getItem('guest_device_key')).toBeNull();

      const state = useGuestStore.getState();
      expect(state.data).toBeNull();
    });
  });
});

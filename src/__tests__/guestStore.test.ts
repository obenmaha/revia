/**
 * Tests for guest store
 * Validates TTL expiry, data persistence, and secure wipe
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGuestStore } from '@/stores/guestStore';
import type { GuestSession, GuestExercise, GuestData } from '@/types/guest';

describe('Guest Store', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store state
    useGuestStore.setState({
      isGuestMode: false,
      data: null,
      isLoading: false,
      error: null,
      lastSync: null,
      expiresAt: null,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Guest mode lifecycle', () => {
    it('should enter guest mode and create empty data', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      const state = useGuestStore.getState();
      expect(state.isGuestMode).toBe(true);
      expect(state.data).toBeDefined();
      expect(state.data?.sessions).toEqual([]);
      expect(state.data?.exercises).toEqual([]);
      expect(state.expiresAt).toBeDefined();
    });

    it('should exit guest mode', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();
      await store.exitGuestMode();

      const state = useGuestStore.getState();
      expect(state.isGuestMode).toBe(false);
    });

    it('should load existing guest data on enter', async () => {
      // First session: create data
      const store1 = useGuestStore.getState();
      await store1.enterGuestMode();
      await store1.createSession({
        name: 'Test Session',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      // Exit
      await store1.exitGuestMode();

      // Second session: should load existing data
      const store2 = useGuestStore.getState();
      await store2.enterGuestMode();

      const state = useGuestStore.getState();
      expect(state.data?.sessions).toHaveLength(1);
      expect(state.data?.sessions[0].name).toBe('Test Session');
    });

    it('should clear guest data and wipe keys', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();
      await store.createSession({
        name: 'Test Session',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      await store.clear();

      const state = useGuestStore.getState();
      expect(state.isGuestMode).toBe(false);
      expect(state.data).toBeNull();
      expect(localStorage.getItem('revia_guest_data')).toBeNull();
      expect(localStorage.getItem('guest_device_key')).toBeNull();
    });
  });

  describe('Session management', () => {
    beforeEach(async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();
    });

    it('should create a session', async () => {
      const store = useGuestStore.getState();
      const session = await store.createSession({
        name: 'Morning Workout',
        date: new Date().toISOString(),
        type: 'musculation',
        status: 'completed',
        duration_minutes: 45,
        rpe_score: 7,
        pain_level: 2,
      });

      expect(session.id).toBeDefined();
      expect(session.name).toBe('Morning Workout');
      expect(session.type).toBe('musculation');
      expect(session.created_at).toBeDefined();
      expect(session.updated_at).toBeDefined();

      const state = useGuestStore.getState();
      expect(state.data?.sessions).toHaveLength(1);
    });

    it('should update a session', async () => {
      const store = useGuestStore.getState();
      const session = await store.createSession({
        name: 'Morning Workout',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'draft',
        duration_minutes: 30,
      });

      await store.updateSession(session.id, {
        status: 'completed',
        duration_minutes: 45,
        rpe_score: 8,
      });

      const updated = store.getSession(session.id);
      expect(updated?.status).toBe('completed');
      expect(updated?.duration_minutes).toBe(45);
      expect(updated?.rpe_score).toBe(8);
    });

    it('should delete a session and its exercises', async () => {
      const store = useGuestStore.getState();
      const session = await store.createSession({
        name: 'Test Session',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      await store.createExercise({
        session_id: session.id,
        name: 'Running',
        type: 'cardio',
        duration_seconds: 1800,
        order_index: 0,
      });

      await store.deleteSession(session.id);

      const state = useGuestStore.getState();
      expect(state.data?.sessions).toHaveLength(0);
      expect(state.data?.exercises).toHaveLength(0); // Exercises deleted too
    });

    it('should get all sessions', async () => {
      const store = useGuestStore.getState();

      await store.createSession({
        name: 'Session 1',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      await store.createSession({
        name: 'Session 2',
        date: new Date().toISOString(),
        type: 'musculation',
        status: 'completed',
        duration_minutes: 45,
      });

      const sessions = store.getSessions();
      expect(sessions).toHaveLength(2);
    });

    it('should get a specific session', async () => {
      const store = useGuestStore.getState();
      const session = await store.createSession({
        name: 'Test Session',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      const retrieved = store.getSession(session.id);
      expect(retrieved).toEqual(session);
    });

    it('should return null for non-existent session', () => {
      const store = useGuestStore.getState();
      const retrieved = store.getSession('non-existent-id');
      expect(retrieved).toBeNull();
    });
  });

  describe('Exercise management', () => {
    let sessionId: string;

    beforeEach(async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      const session = await store.createSession({
        name: 'Test Session',
        date: new Date().toISOString(),
        type: 'musculation',
        status: 'in_progress',
        duration_minutes: 60,
      });
      sessionId = session.id;
    });

    it('should create an exercise', async () => {
      const store = useGuestStore.getState();
      const exercise = await store.createExercise({
        session_id: sessionId,
        name: 'Bench Press',
        type: 'musculation',
        sets: 4,
        reps: 10,
        weight_kg: 80,
        order_index: 0,
      });

      expect(exercise.id).toBeDefined();
      expect(exercise.name).toBe('Bench Press');
      expect(exercise.session_id).toBe(sessionId);

      const state = useGuestStore.getState();
      expect(state.data?.exercises).toHaveLength(1);
    });

    it('should update an exercise', async () => {
      const store = useGuestStore.getState();
      const exercise = await store.createExercise({
        session_id: sessionId,
        name: 'Squat',
        type: 'musculation',
        sets: 3,
        reps: 10,
        weight_kg: 100,
        order_index: 0,
      });

      await store.updateExercise(exercise.id, {
        sets: 4,
        reps: 12,
        weight_kg: 110,
      });

      const exercises = store.getExercises(sessionId);
      const updated = exercises[0];
      expect(updated.sets).toBe(4);
      expect(updated.reps).toBe(12);
      expect(updated.weight_kg).toBe(110);
    });

    it('should delete an exercise', async () => {
      const store = useGuestStore.getState();
      const exercise = await store.createExercise({
        session_id: sessionId,
        name: 'Deadlift',
        type: 'musculation',
        sets: 3,
        reps: 5,
        weight_kg: 140,
        order_index: 0,
      });

      await store.deleteExercise(exercise.id);

      const state = useGuestStore.getState();
      expect(state.data?.exercises).toHaveLength(0);
    });

    it('should get exercises for a session', async () => {
      const store = useGuestStore.getState();

      await store.createExercise({
        session_id: sessionId,
        name: 'Exercise 1',
        type: 'musculation',
        order_index: 0,
      });

      await store.createExercise({
        session_id: sessionId,
        name: 'Exercise 2',
        type: 'musculation',
        order_index: 1,
      });

      const exercises = store.getExercises(sessionId);
      expect(exercises).toHaveLength(2);
    });

    it('should sort exercises by order_index', async () => {
      const store = useGuestStore.getState();

      await store.createExercise({
        session_id: sessionId,
        name: 'Exercise B',
        type: 'musculation',
        order_index: 2,
      });

      await store.createExercise({
        session_id: sessionId,
        name: 'Exercise A',
        type: 'musculation',
        order_index: 1,
      });

      const exercises = store.getExercises(sessionId);
      expect(exercises[0].name).toBe('Exercise A');
      expect(exercises[1].name).toBe('Exercise B');
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();
    });

    it('should calculate total sessions', async () => {
      const store = useGuestStore.getState();

      await store.createSession({
        name: 'Session 1',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      await store.createSession({
        name: 'Session 2',
        date: new Date().toISOString(),
        type: 'musculation',
        status: 'completed',
        duration_minutes: 45,
      });

      const stats = store.getStats();
      expect(stats.total_sessions).toBe(2);
    });

    it('should calculate total duration', async () => {
      const store = useGuestStore.getState();

      await store.createSession({
        name: 'Session 1',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      await store.createSession({
        name: 'Session 2',
        date: new Date().toISOString(),
        type: 'musculation',
        status: 'completed',
        duration_minutes: 45,
      });

      const stats = store.getStats();
      expect(stats.total_duration_minutes).toBe(75);
    });

    it('should calculate sessions by type', async () => {
      const store = useGuestStore.getState();

      await store.createSession({
        name: 'Session 1',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      await store.createSession({
        name: 'Session 2',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      await store.createSession({
        name: 'Session 3',
        date: new Date().toISOString(),
        type: 'musculation',
        status: 'completed',
        duration_minutes: 45,
      });

      const stats = store.getStats();
      expect(stats.sessions_by_type['cardio']).toBe(2);
      expect(stats.sessions_by_type['musculation']).toBe(1);
    });

    it('should calculate average RPE', async () => {
      const store = useGuestStore.getState();

      await store.createSession({
        name: 'Session 1',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
        rpe_score: 6,
      });

      await store.createSession({
        name: 'Session 2',
        date: new Date().toISOString(),
        type: 'musculation',
        status: 'completed',
        duration_minutes: 45,
        rpe_score: 8,
      });

      const stats = store.getStats();
      expect(stats.avg_rpe).toBe(7); // (6 + 8) / 2
    });

    it('should track last session date', async () => {
      const store = useGuestStore.getState();

      const older = new Date('2024-01-01').toISOString();
      const newer = new Date('2024-02-01').toISOString();

      await store.createSession({
        name: 'Old Session',
        date: older,
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      await store.createSession({
        name: 'New Session',
        date: newer,
        type: 'musculation',
        status: 'completed',
        duration_minutes: 45,
      });

      const stats = store.getStats();
      expect(stats.last_session_date).toBe(newer);
    });
  });

  describe('TTL checks', () => {
    it('should check TTL expiry', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      const state = useGuestStore.getState();
      expect(state.expiresAt).toBeDefined();

      // Fresh data should not be expired
      expect(store.checkTTL()).toBe(false);
    });

    it('should detect expired data', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      // Manually set expiresAt to the past
      useGuestStore.setState({
        expiresAt: Date.now() - 1000, // 1 second ago
      });

      expect(store.checkTTL()).toBe(true);
    });

    it('should clear expired data on load', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      // Create some data
      await store.createSession({
        name: 'Test Session',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      // Manually corrupt the stored data to simulate expiry
      const stored = localStorage.getItem('revia_guest_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.encrypted.timestamp = Date.now() - 31 * 24 * 60 * 60 * 1000; // 31 days ago
        localStorage.setItem('revia_guest_data', JSON.stringify(parsed));
      }

      // Try to load - should clear expired data
      await store.load();

      const state = useGuestStore.getState();
      expect(state.data).toBeNull();
    });
  });

  describe('Data persistence', () => {
    it('should persist data across store reloads', async () => {
      // First store instance
      const store1 = useGuestStore.getState();
      await store1.enterGuestMode();

      await store1.createSession({
        name: 'Persistent Session',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      // Simulate app restart
      useGuestStore.setState({
        isGuestMode: false,
        data: null,
        isLoading: false,
        error: null,
        lastSync: null,
        expiresAt: null,
      });

      // Second store instance - load data
      const store2 = useGuestStore.getState();
      await store2.load();
      await store2.enterGuestMode();

      const state = useGuestStore.getState();
      expect(state.data?.sessions).toHaveLength(1);
      expect(state.data?.sessions[0].name).toBe('Persistent Session');
    });

    it('should encrypt data in localStorage', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'Secret Workout',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      const stored = localStorage.getItem('revia_guest_data');
      expect(stored).toBeDefined();

      // Data should not contain plaintext session name
      expect(stored).not.toContain('Secret Workout');

      // Should contain encrypted blob structure
      const parsed = JSON.parse(stored!);
      expect(parsed.encrypted).toBeDefined();
      expect(parsed.encrypted.ciphertext).toBeDefined();
      expect(parsed.encrypted.iv).toBeDefined();
      expect(parsed.encrypted.salt).toBeDefined();
    });

    it('should update lastSync on save', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      const beforeSync = Date.now();

      await store.createSession({
        name: 'Test Session',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      const state = useGuestStore.getState();
      expect(state.lastSync).toBeGreaterThanOrEqual(beforeSync);
    });
  });

  describe('Error handling', () => {
    it('should handle errors when not in guest mode', async () => {
      const store = useGuestStore.getState();
      // Don't enter guest mode

      await expect(
        store.createSession({
          name: 'Test',
          date: new Date().toISOString(),
          type: 'cardio',
          status: 'completed',
          duration_minutes: 30,
        })
      ).rejects.toThrow('Not in guest mode');
    });

    it('should handle corrupted localStorage data', async () => {
      // Set corrupted data
      localStorage.setItem('revia_guest_data', 'corrupted-data');

      const store = useGuestStore.getState();
      await store.load();

      // Should clear corrupted data and return null
      const state = useGuestStore.getState();
      expect(state.data).toBeNull();
      expect(localStorage.getItem('revia_guest_data')).toBeNull();
    });
  });

  describe('Security properties', () => {
    it('should not log PII in console', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'My Private Workout',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
        notes: 'Sensitive medical information',
      });

      // Check console logs for PII
      for (const call of consoleErrorSpy.mock.calls) {
        const message = call.join(' ');
        expect(message).not.toContain('My Private Workout');
        expect(message).not.toContain('Sensitive medical information');
      }

      consoleErrorSpy.mockRestore();
    });

    it('should overwrite data before wipe', async () => {
      const store = useGuestStore.getState();
      await store.enterGuestMode();

      await store.createSession({
        name: 'Test Session',
        date: new Date().toISOString(),
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
      });

      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      await store.clear();

      // Should overwrite with random data before deletion
      expect(setItemSpy).toHaveBeenCalledWith('revia_guest_data', expect.any(String));

      setItemSpy.mockRestore();
    });
  });
});

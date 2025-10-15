/**
 * Guest mode store with encrypted localStorage
 * Handles offline-first workout tracking without authentication
 *
 * Security:
 * - AES-GCM encryption for all data
 * - Device-bound salt
 * - 30-day TTL with automatic expiry
 * - No server writes until migration
 * - Secure wipe on expiry/migration
 */

import { create } from 'zustand';
import type {
  GuestStoreState,
  GuestStoreActions,
  GuestData,
  GuestSession,
  GuestExercise,
  GuestStats,
  EncryptedGuestStorage,
} from '@/types/guest';
import { encrypt, decrypt, isExpired, wipeEncryptionKeys, isWebCryptoSupported } from '@/lib/crypto';
import { guestDataSchema } from '@/types/guest';

const STORAGE_KEY = 'revia_guest_data';
const TTL_DAYS = 30;
const SCHEMA_VERSION = 1;

/**
 * Creates initial empty guest data
 */
function createEmptyGuestData(): GuestData {
  const now = new Date().toISOString();
  return {
    sessions: [],
    exercises: [],
    stats: {
      total_sessions: 0,
      total_duration_minutes: 0,
      total_exercises: 0,
      sessions_by_type: {},
    },
    version: SCHEMA_VERSION,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Calculates statistics from guest data
 */
function calculateStats(data: GuestData): GuestStats {
  const sessions = data.sessions;
  const exercises = data.exercises;

  const stats: GuestStats = {
    total_sessions: sessions.length,
    total_duration_minutes: sessions.reduce((sum, s) => sum + s.duration_minutes, 0),
    total_exercises: exercises.length,
    sessions_by_type: {},
  };

  // Count sessions by type
  for (const session of sessions) {
    stats.sessions_by_type[session.type] = (stats.sessions_by_type[session.type] || 0) + 1;
  }

  // Calculate average RPE
  const sessionsWithRPE = sessions.filter(s => s.rpe_score != null);
  if (sessionsWithRPE.length > 0) {
    stats.avg_rpe = sessionsWithRPE.reduce((sum, s) => sum + (s.rpe_score || 0), 0) / sessionsWithRPE.length;
  }

  // Find last session date
  if (sessions.length > 0) {
    const sortedSessions = [...sessions].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    stats.last_session_date = sortedSessions[0].date;
  }

  return stats;
}

/**
 * Loads encrypted guest data from localStorage
 */
async function loadFromStorage(): Promise<GuestData | null> {
  try {
    if (!isWebCryptoSupported()) {
      console.warn('[guestStore] WebCrypto not supported, guest mode unavailable');
      return null;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed: EncryptedGuestStorage = JSON.parse(stored);

    // Check TTL
    if (isExpired(parsed.encrypted, TTL_DAYS)) {
      console.warn('[guestStore] Guest data expired, clearing...');
      await clearStorage();
      return null;
    }

    // Decrypt
    const decrypted = await decrypt<GuestData>(parsed.encrypted);

    // Validate schema
    const validated = guestDataSchema.parse(decrypted);

    // Update metadata
    parsed.metadata.last_accessed = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

    return validated;
  } catch (error) {
    console.error('[guestStore] Failed to load guest data:', error instanceof Error ? error.message : 'Unknown error');
    // Clear corrupted data
    await clearStorage();
    return null;
  }
}

/**
 * Saves encrypted guest data to localStorage
 */
async function saveToStorage(data: GuestData): Promise<void> {
  try {
    if (!isWebCryptoSupported()) {
      throw new Error('WebCrypto not supported');
    }

    // Validate before encrypting
    guestDataSchema.parse(data);

    // Encrypt
    const encrypted = await encrypt(data);

    // Calculate expiry
    const expiresAt = Date.now() + (TTL_DAYS * 24 * 60 * 60 * 1000);

    const storage: EncryptedGuestStorage = {
      encrypted,
      metadata: {
        version: SCHEMA_VERSION,
        last_accessed: Date.now(),
        expires_at: expiresAt,
        session_count: data.sessions.length,
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('[guestStore] Failed to save guest data:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to save guest data');
  }
}

/**
 * Clears guest data and encryption keys
 */
async function clearStorage(): Promise<void> {
  try {
    // Overwrite with random data before deletion (defense in depth)
    const randomData = new Uint8Array(1024);
    crypto.getRandomValues(randomData);
    localStorage.setItem(STORAGE_KEY, btoa(String.fromCharCode(...randomData)));

    // Delete
    localStorage.removeItem(STORAGE_KEY);

    // Wipe encryption keys
    wipeEncryptionKeys();
  } catch (error) {
    console.error('[guestStore] Failed to clear storage:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Guest store implementation
 */
export const useGuestStore = create<GuestStoreState & GuestStoreActions>((set, get) => ({
  // State
  isGuestMode: false,
  data: null,
  isLoading: false,
  error: null,
  lastSync: null,
  expiresAt: null,

  // Actions

  createSession: async (sessionData) => {
    const state = get();
    if (!state.isGuestMode || !state.data) {
      throw new Error('Not in guest mode');
    }

    const now = new Date().toISOString();
    const session: GuestSession = {
      ...sessionData,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };

    const newData: GuestData = {
      ...state.data,
      sessions: [...state.data.sessions, session],
      updated_at: now,
    };

    newData.stats = calculateStats(newData);
    await saveToStorage(newData);

    set({ data: newData, lastSync: Date.now() });
    return session;
  },

  updateSession: async (id, updates) => {
    const state = get();
    if (!state.isGuestMode || !state.data) {
      throw new Error('Not in guest mode');
    }

    const now = new Date().toISOString();
    const sessions = state.data.sessions.map(s =>
      s.id === id ? { ...s, ...updates, updated_at: now } : s
    );

    const newData: GuestData = {
      ...state.data,
      sessions,
      updated_at: now,
    };

    newData.stats = calculateStats(newData);
    await saveToStorage(newData);

    set({ data: newData, lastSync: Date.now() });
  },

  deleteSession: async (id) => {
    const state = get();
    if (!state.isGuestMode || !state.data) {
      throw new Error('Not in guest mode');
    }

    const now = new Date().toISOString();
    const sessions = state.data.sessions.filter(s => s.id !== id);
    const exercises = state.data.exercises.filter(e => e.session_id !== id);

    const newData: GuestData = {
      ...state.data,
      sessions,
      exercises,
      updated_at: now,
    };

    newData.stats = calculateStats(newData);
    await saveToStorage(newData);

    set({ data: newData, lastSync: Date.now() });
  },

  getSession: (id) => {
    const state = get();
    if (!state.data) return null;
    return state.data.sessions.find(s => s.id === id) || null;
  },

  getSessions: () => {
    const state = get();
    return state.data?.sessions || [];
  },

  createExercise: async (exerciseData) => {
    const state = get();
    if (!state.isGuestMode || !state.data) {
      throw new Error('Not in guest mode');
    }

    const now = new Date().toISOString();
    const exercise: GuestExercise = {
      ...exerciseData,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };

    const newData: GuestData = {
      ...state.data,
      exercises: [...state.data.exercises, exercise],
      updated_at: now,
    };

    newData.stats = calculateStats(newData);
    await saveToStorage(newData);

    set({ data: newData, lastSync: Date.now() });
    return exercise;
  },

  updateExercise: async (id, updates) => {
    const state = get();
    if (!state.isGuestMode || !state.data) {
      throw new Error('Not in guest mode');
    }

    const now = new Date().toISOString();
    const exercises = state.data.exercises.map(e =>
      e.id === id ? { ...e, ...updates, updated_at: now } : e
    );

    const newData: GuestData = {
      ...state.data,
      exercises,
      updated_at: now,
    };

    newData.stats = calculateStats(newData);
    await saveToStorage(newData);

    set({ data: newData, lastSync: Date.now() });
  },

  deleteExercise: async (id) => {
    const state = get();
    if (!state.isGuestMode || !state.data) {
      throw new Error('Not in guest mode');
    }

    const now = new Date().toISOString();
    const exercises = state.data.exercises.filter(e => e.id !== id);

    const newData: GuestData = {
      ...state.data,
      exercises,
      updated_at: now,
    };

    newData.stats = calculateStats(newData);
    await saveToStorage(newData);

    set({ data: newData, lastSync: Date.now() });
  },

  getExercises: (sessionId) => {
    const state = get();
    if (!state.data) return [];
    return state.data.exercises
      .filter(e => e.session_id === sessionId)
      .sort((a, b) => a.order_index - b.order_index);
  },

  getStats: () => {
    const state = get();
    return state.data?.stats || {
      total_sessions: 0,
      total_duration_minutes: 0,
      total_exercises: 0,
      sessions_by_type: {},
    };
  },

  recalculateStats: () => {
    const state = get();
    if (!state.data) return;

    const stats = calculateStats(state.data);
    set({ data: { ...state.data, stats } });
  },

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await loadFromStorage();

      if (data) {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed: EncryptedGuestStorage = stored ? JSON.parse(stored) : null;

        set({
          isGuestMode: true,
          data,
          isLoading: false,
          lastSync: parsed?.metadata.last_accessed || Date.now(),
          expiresAt: parsed?.metadata.expires_at || null,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load guest data',
        isLoading: false,
      });
    }
  },

  save: async () => {
    const state = get();
    if (!state.data) return;

    try {
      await saveToStorage(state.data);
      set({ lastSync: Date.now(), error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to save guest data' });
      throw error;
    }
  },

  checkTTL: () => {
    const state = get();
    if (!state.expiresAt) return false;
    return Date.now() > state.expiresAt;
  },

  clear: async () => {
    await clearStorage();
    set({
      isGuestMode: false,
      data: null,
      error: null,
      lastSync: null,
      expiresAt: null,
    });
  },

  enterGuestMode: async () => {
    set({ isLoading: true, error: null });
    try {
      // Check if existing data
      let data = await loadFromStorage();

      if (!data) {
        // Create new guest data
        data = createEmptyGuestData();
        await saveToStorage(data);
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: EncryptedGuestStorage = stored ? JSON.parse(stored) : null;

      set({
        isGuestMode: true,
        data,
        isLoading: false,
        lastSync: Date.now(),
        expiresAt: parsed?.metadata.expires_at || Date.now() + (TTL_DAYS * 24 * 60 * 60 * 1000),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to enter guest mode',
        isLoading: false,
      });
      throw error;
    }
  },

  exitGuestMode: async () => {
    // Note: This does NOT clear data - use clear() for that
    // This just exits guest mode UI state
    set({ isGuestMode: false });
  },
}));

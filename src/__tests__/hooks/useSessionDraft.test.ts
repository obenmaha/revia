// Tests pour le hook useSessionDraft - NFR7
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useSessionDraft,
  useCleanExpiredDrafts,
} from '../../hooks/useSessionDraft';
import { CreateExerciseInput } from '../../types/exercise';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useSessionDraft - Draft Lifecycle', () => {
  const sessionId = 'test-session-123';
  const mockExercises: CreateExerciseInput[] = [
    {
      sessionId,
      name: 'Exercise 1',
      duration: 30,
      intensity: 5,
      painLevel: 2,
      exerciseType: 'cardio',
      orderIndex: 0,
    },
    {
      sessionId,
      name: 'Exercise 2',
      duration: 45,
      intensity: 7,
      painLevel: 3,
      exerciseType: 'musculation',
      weight: 50,
      sets: 3,
      reps: 10,
      orderIndex: 1,
    },
  ];

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('devrait initialiser sans brouillon', () => {
    const { result } = renderHook(() => useSessionDraft(sessionId));

    expect(result.current.draftExercises).toEqual([]);
    expect(result.current.hasDraft).toBe(false);
    expect(result.current.draftAge).toBeNull();
    expect(result.current.isExpired).toBe(false);
  });

  it('devrait sauvegarder un brouillon dans localStorage', () => {
    const { result } = renderHook(() => useSessionDraft(sessionId));

    act(() => {
      result.current.saveDraft(mockExercises);
    });

    expect(result.current.draftExercises).toEqual(mockExercises);
    expect(result.current.hasDraft).toBe(true);
    expect(result.current.draftAge).toBeLessThan(1000); // Moins d'une seconde

    // Vérifier que les données sont dans localStorage
    const stored = localStorageMock.getItem(`session_draft_${sessionId}`);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.exercises).toEqual(mockExercises);
    expect(parsed.sessionId).toBe(sessionId);
    expect(parsed.timestamp).toBeDefined();
  });

  it('devrait charger un brouillon existant depuis localStorage', () => {
    // Préparer un brouillon dans localStorage
    const draftData = {
      exercises: mockExercises,
      timestamp: Date.now(),
      sessionId,
    };
    localStorageMock.setItem(
      `session_draft_${sessionId}`,
      JSON.stringify(draftData)
    );

    const { result } = renderHook(() => useSessionDraft(sessionId));

    expect(result.current.draftExercises).toEqual(mockExercises);
    expect(result.current.hasDraft).toBe(true);
    expect(result.current.draftAge).toBeLessThan(1000);
  });

  it('devrait effacer un brouillon', () => {
    const { result } = renderHook(() => useSessionDraft(sessionId));

    // Sauvegarder un brouillon
    act(() => {
      result.current.saveDraft(mockExercises);
    });

    expect(result.current.hasDraft).toBe(true);

    // Effacer le brouillon
    act(() => {
      result.current.clearDraft();
    });

    expect(result.current.draftExercises).toEqual([]);
    expect(result.current.hasDraft).toBe(false);
    expect(result.current.draftAge).toBeNull();

    // Vérifier que localStorage est vide
    const stored = localStorageMock.getItem(`session_draft_${sessionId}`);
    expect(stored).toBeNull();
  });

  it('devrait mettre à jour un brouillon existant', () => {
    const { result } = renderHook(() => useSessionDraft(sessionId));

    // Sauvegarder un premier brouillon
    act(() => {
      result.current.saveDraft(mockExercises);
    });

    // Mettre à jour avec de nouvelles données
    const updatedExercises: CreateExerciseInput[] = [
      ...mockExercises,
      {
        sessionId,
        name: 'Exercise 3',
        duration: 20,
        intensity: 4,
        exerciseType: 'etirement',
        orderIndex: 2,
      },
    ];

    act(() => {
      result.current.saveDraft(updatedExercises);
    });

    expect(result.current.draftExercises).toEqual(updatedExercises);
    expect(result.current.draftExercises.length).toBe(3);
  });

  it('devrait gérer plusieurs sessions avec des brouillons différents', () => {
    const sessionId1 = 'session-1';
    const sessionId2 = 'session-2';

    const { result: result1 } = renderHook(() => useSessionDraft(sessionId1));
    const { result: result2 } = renderHook(() => useSessionDraft(sessionId2));

    const exercises1: CreateExerciseInput[] = [mockExercises[0]];
    const exercises2: CreateExerciseInput[] = [mockExercises[1]];

    act(() => {
      result1.current.saveDraft(exercises1);
      result2.current.saveDraft(exercises2);
    });

    expect(result1.current.draftExercises).toEqual(exercises1);
    expect(result2.current.draftExercises).toEqual(exercises2);
    expect(result1.current.draftExercises).not.toEqual(
      result2.current.draftExercises
    );
  });
});

describe('useSessionDraft - TTL 72h Expiration', () => {
  const sessionId = 'test-session-ttl';
  const TTL_72H = 72 * 60 * 60 * 1000;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('devrait détecter un brouillon non expiré (< 72h)', () => {
    const now = Date.now();
    const timestamp = now - 24 * 60 * 60 * 1000; // 24h ago

    const draftData = {
      exercises: [],
      timestamp,
      sessionId,
    };
    localStorageMock.setItem(
      `session_draft_${sessionId}`,
      JSON.stringify(draftData)
    );

    const { result } = renderHook(() => useSessionDraft(sessionId));

    expect(result.current.hasDraft).toBe(true);
    expect(result.current.isExpired).toBe(false);
    expect(result.current.draftAge).toBeGreaterThan(24 * 60 * 60 * 1000 - 1000);
    expect(result.current.draftAge).toBeLessThan(TTL_72H);
  });

  it('devrait détecter un brouillon expiré (> 72h)', () => {
    const now = Date.now();
    const timestamp = now - (73 * 60 * 60 * 1000); // 73h ago (expiré)

    const draftData = {
      exercises: [],
      timestamp,
      sessionId,
    };
    localStorageMock.setItem(
      `session_draft_${sessionId}`,
      JSON.stringify(draftData)
    );

    const { result } = renderHook(() => useSessionDraft(sessionId));

    // Le brouillon devrait être supprimé automatiquement
    expect(result.current.hasDraft).toBe(false);
    expect(result.current.draftExercises).toEqual([]);
    expect(result.current.draftAge).toBeNull();
  });

  it('devrait accepter un brouillon juste avant expiration (71h59m)', () => {
    const now = Date.now();
    const timestamp = now - (71 * 60 + 59) * 60 * 1000; // 71h59m ago

    const draftData = {
      exercises: [{
        sessionId,
        name: 'Exercise',
        duration: 30,
        intensity: 5,
        exerciseType: 'cardio' as const,
        orderIndex: 0,
      }],
      timestamp,
      sessionId,
    };
    localStorageMock.setItem(
      `session_draft_${sessionId}`,
      JSON.stringify(draftData)
    );

    const { result } = renderHook(() => useSessionDraft(sessionId));

    expect(result.current.hasDraft).toBe(true);
    expect(result.current.isExpired).toBe(false);
  });

  it('devrait rejeter un brouillon juste après expiration (72h01m)', () => {
    const now = Date.now();
    const timestamp = now - (72 * 60 + 1) * 60 * 1000; // 72h01m ago

    const draftData = {
      exercises: [{
        sessionId,
        name: 'Exercise',
        duration: 30,
        intensity: 5,
        exerciseType: 'cardio' as const,
        orderIndex: 0,
      }],
      timestamp,
      sessionId,
    };
    localStorageMock.setItem(
      `session_draft_${sessionId}`,
      JSON.stringify(draftData)
    );

    const { result } = renderHook(() => useSessionDraft(sessionId));

    expect(result.current.hasDraft).toBe(false);
    expect(result.current.draftExercises).toEqual([]);
  });

  it('devrait calculer correctement l\'âge du brouillon', () => {
    const now = Date.now();
    const timestamp = now - 48 * 60 * 60 * 1000; // 48h ago

    const draftData = {
      exercises: [],
      timestamp,
      sessionId,
    };
    localStorageMock.setItem(
      `session_draft_${sessionId}`,
      JSON.stringify(draftData)
    );

    const { result } = renderHook(() => useSessionDraft(sessionId));

    expect(result.current.draftAge).not.toBeNull();
    expect(result.current.draftAge!).toBeGreaterThan(48 * 60 * 60 * 1000 - 1000);
    expect(result.current.draftAge!).toBeLessThan(48 * 60 * 60 * 1000 + 1000);
  });
});

describe('useSessionDraft - Error Handling', () => {
  const sessionId = 'test-session-error';

  beforeEach(() => {
    localStorageMock.clear();
  });

  it('devrait gérer un JSON corrompu dans localStorage', () => {
    // Stocker un JSON invalide
    localStorageMock.setItem(`session_draft_${sessionId}`, 'invalid json{');

    const { result } = renderHook(() => useSessionDraft(sessionId));

    // Devrait initialiser avec un état vide et nettoyer le brouillon corrompu
    expect(result.current.draftExercises).toEqual([]);
    expect(result.current.hasDraft).toBe(false);

    // Le brouillon corrompu devrait être supprimé
    const stored = localStorageMock.getItem(`session_draft_${sessionId}`);
    expect(stored).toBeNull();
  });

  it('devrait gérer un brouillon avec des données manquantes', () => {
    // Brouillon incomplet (manque timestamp)
    const incompleteDraft = {
      exercises: [],
      sessionId,
      // timestamp manquant
    };
    localStorageMock.setItem(
      `session_draft_${sessionId}`,
      JSON.stringify(incompleteDraft)
    );

    const { result } = renderHook(() => useSessionDraft(sessionId));

    // Devrait initialiser avec un état vide
    expect(result.current.draftExercises).toEqual([]);
    expect(result.current.hasDraft).toBe(false);
  });

  it('devrait gérer un sessionId vide', () => {
    const { result } = renderHook(() => useSessionDraft(''));

    expect(result.current.draftExercises).toEqual([]);
    expect(result.current.hasDraft).toBe(false);
  });
});

describe('useCleanExpiredDrafts', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('devrait nettoyer tous les brouillons expirés', () => {
    const now = Date.now();
    const TTL = 72 * 60 * 60 * 1000;

    // Créer plusieurs brouillons avec différents âges
    const drafts = [
      { id: 'session-1', age: 1 * 60 * 60 * 1000, expired: false }, // 1h
      { id: 'session-2', age: 50 * 60 * 60 * 1000, expired: false }, // 50h
      { id: 'session-3', age: 73 * 60 * 60 * 1000, expired: true }, // 73h (expiré)
      { id: 'session-4', age: 100 * 60 * 60 * 1000, expired: true }, // 100h (expiré)
    ];

    drafts.forEach(draft => {
      const draftData = {
        exercises: [],
        timestamp: now - draft.age,
        sessionId: draft.id,
      };
      localStorageMock.setItem(
        `session_draft_${draft.id}`,
        JSON.stringify(draftData)
      );
    });

    // Ajouter aussi des clés non-draft pour tester le filtrage
    localStorageMock.setItem('other_key', 'some value');

    renderHook(() => useCleanExpiredDrafts());

    // Vérifier que seuls les brouillons non expirés restent
    expect(localStorageMock.getItem('session_draft_session-1')).not.toBeNull();
    expect(localStorageMock.getItem('session_draft_session-2')).not.toBeNull();
    expect(localStorageMock.getItem('session_draft_session-3')).toBeNull();
    expect(localStorageMock.getItem('session_draft_session-4')).toBeNull();

    // Les autres clés doivent rester intactes
    expect(localStorageMock.getItem('other_key')).toBe('some value');
  });

  it('devrait gérer un localStorage vide', () => {
    expect(() => {
      renderHook(() => useCleanExpiredDrafts());
    }).not.toThrow();
  });

  it('devrait gérer des brouillons avec JSON invalide', () => {
    localStorageMock.setItem('session_draft_invalid', 'invalid json');

    renderHook(() => useCleanExpiredDrafts());

    // Le brouillon invalide devrait être supprimé
    expect(localStorageMock.getItem('session_draft_invalid')).toBeNull();
  });
});

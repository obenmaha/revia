// Tests pour useValidateSession - FR5
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useValidateSession } from '../../hooks/useValidateSession';
import { ExerciseService } from '../../services/exerciseService';
import { SessionService } from '../../services/sessionService';
import { CreateExerciseInput } from '../../types/exercise';

// Mock des services
vi.mock('../../services/exerciseService');
vi.mock('../../services/sessionService');
vi.mock('../../hooks/useSessionDraft', () => ({
  useSessionDraft: () => ({
    clearDraft: vi.fn(),
  }),
}));

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
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useValidateSession - Validate and Clear Draft', () => {
  const sessionId = 'test-session-123';
  let queryClient: QueryClient;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

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
      painLevel: 0,
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
    queryClient?.clear();

    // Mock des services par défaut
    vi.mocked(ExerciseService.createExercise).mockResolvedValue({
      id: 'exercise-id',
      sessionId,
      name: 'Test',
      duration: 30,
      intensity: 5,
      exerciseType: 'cardio',
      orderIndex: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    vi.mocked(SessionService.updateSession).mockResolvedValue({} as any);
  });

  it('devrait valider une session avec exercices', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidateSession(sessionId), {
      wrapper,
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.isError).toBe(false);

    await act(async () => {
      await result.current.validateSession(sessionId, mockExercises);
    });

    // Vérifier que les exercices ont été créés
    expect(ExerciseService.createExercise).toHaveBeenCalledTimes(2);
    expect(ExerciseService.createExercise).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Exercise 1',
        intensity: 5,
        painLevel: 2,
      })
    );

    // Vérifier que la session a été mise à jour
    expect(SessionService.updateSession).toHaveBeenCalledWith(sessionId, {
      status: 'completed',
    });
  });

  it('devrait effacer le brouillon après validation réussie', async () => {
    // Créer un brouillon dans localStorage
    const draftData = {
      exercises: mockExercises,
      timestamp: Date.now(),
      sessionId,
    };
    localStorageMock.setItem(
      `session_draft_${sessionId}`,
      JSON.stringify(draftData)
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidateSession(sessionId), {
      wrapper,
    });

    await act(async () => {
      await result.current.validateSession(sessionId, mockExercises);
    });

    // Le brouillon devrait être supprimé
    await waitFor(() => {
      const stored = localStorageMock.getItem(`session_draft_${sessionId}`);
      expect(stored).toBeNull();
    });
  });

  it('devrait rejeter si sessionId manquant', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidateSession(''), { wrapper });

    await expect(
      act(async () => {
        await result.current.validateSession('', mockExercises);
      })
    ).rejects.toThrow('ID de session requis');
  });

  it('devrait rejeter si aucun exercice fourni', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidateSession(sessionId), {
      wrapper,
    });

    await expect(
      act(async () => {
        await result.current.validateSession(sessionId, []);
      })
    ).rejects.toThrow('Au moins un exercice est requis');
  });

  it('devrait valider les limites RPE (1..10)', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidateSession(sessionId), {
      wrapper,
    });

    // RPE invalide (0)
    const invalidExercises = [
      {
        ...mockExercises[0],
        intensity: 0,
      },
    ];

    await expect(
      act(async () => {
        await result.current.validateSession(sessionId, invalidExercises);
      })
    ).rejects.toThrow('Intensité RPE invalide');

    // RPE invalide (11)
    const invalidExercises2 = [
      {
        ...mockExercises[0],
        intensity: 11,
      },
    ];

    await expect(
      act(async () => {
        await result.current.validateSession(sessionId, invalidExercises2);
      })
    ).rejects.toThrow('Intensité RPE invalide');
  });

  it('devrait valider les limites painLevel (0..10)', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidateSession(sessionId), {
      wrapper,
    });

    // painLevel invalide (-1)
    const invalidExercises = [
      {
        ...mockExercises[0],
        painLevel: -1,
      },
    ];

    await expect(
      act(async () => {
        await result.current.validateSession(sessionId, invalidExercises);
      })
    ).rejects.toThrow('Niveau de douleur invalide');

    // painLevel invalide (11)
    const invalidExercises2 = [
      {
        ...mockExercises[0],
        painLevel: 11,
      },
    ];

    await expect(
      act(async () => {
        await result.current.validateSession(sessionId, invalidExercises2);
      })
    ).rejects.toThrow('Niveau de douleur invalide');
  });

  it('devrait accepter painLevel = 0 (aucune douleur)', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidateSession(sessionId), {
      wrapper,
    });

    const exercisesWithNoPain = [
      {
        ...mockExercises[0],
        painLevel: 0,
      },
    ];

    await act(async () => {
      await result.current.validateSession(sessionId, exercisesWithNoPain);
    });

    expect(ExerciseService.createExercise).toHaveBeenCalledWith(
      expect.objectContaining({
        painLevel: 0,
      })
    );
  });

  it('devrait accepter painLevel = 10 (douleur maximale)', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidateSession(sessionId), {
      wrapper,
    });

    const exercisesWithMaxPain = [
      {
        ...mockExercises[0],
        painLevel: 10,
      },
    ];

    await act(async () => {
      await result.current.validateSession(sessionId, exercisesWithMaxPain);
    });

    expect(ExerciseService.createExercise).toHaveBeenCalledWith(
      expect.objectContaining({
        painLevel: 10,
      })
    );
  });

  it('devrait accepter painLevel undefined (optionnel)', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidateSession(sessionId), {
      wrapper,
    });

    const exercisesWithoutPainLevel = [
      {
        sessionId,
        name: 'Exercise',
        duration: 30,
        intensity: 5,
        exerciseType: 'cardio' as const,
        orderIndex: 0,
      },
    ];

    await act(async () => {
      await result.current.validateSession(sessionId, exercisesWithoutPainLevel);
    });

    expect(ExerciseService.createExercise).toHaveBeenCalledWith(
      expect.objectContaining({
        painLevel: undefined,
      })
    );
  });

  it('devrait gérer les erreurs de création d\'exercice', async () => {
    vi.mocked(ExerciseService.createExercise).mockRejectedValueOnce(
      new Error('Database error')
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidateSession(sessionId), {
      wrapper,
    });

    await expect(
      act(async () => {
        await result.current.validateSession(sessionId, mockExercises);
      })
    ).rejects.toThrow();

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeTruthy();
  });

  it('devrait gérer les erreurs de mise à jour de session', async () => {
    vi.mocked(SessionService.updateSession).mockRejectedValueOnce(
      new Error('Update failed')
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidateSession(sessionId), {
      wrapper,
    });

    await expect(
      act(async () => {
        await result.current.validateSession(sessionId, mockExercises);
      })
    ).rejects.toThrow();

    expect(result.current.isError).toBe(true);
  });

  it('devrait invalider le cache après validation réussie', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidateSession(sessionId), {
      wrapper,
    });

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await result.current.validateSession(sessionId, mockExercises);
    });

    // Vérifier que le cache a été invalidé pour les bonnes clés
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['session', sessionId],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['exercises', sessionId],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['sessions'],
    });
  });

  it('devrait créer les exercices avec les bons orderIndex', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useValidateSession(sessionId), {
      wrapper,
    });

    await act(async () => {
      await result.current.validateSession(sessionId, mockExercises);
    });

    expect(ExerciseService.createExercise).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        orderIndex: 0,
      })
    );
    expect(ExerciseService.createExercise).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        orderIndex: 1,
      })
    );
  });
});

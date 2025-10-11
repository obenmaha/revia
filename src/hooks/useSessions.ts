// Hook pour la gestion des sessions - Story 2.2
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Session, CreateSessionInput, SessionFilters } from '../types/session';
import {
  SessionService,
  SessionServiceError,
} from '../services/sessionService';

// Interface pour le retour du hook
export interface UseSessionReturn {
  session: Session | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  updateSession: (updates: Partial<Session>) => Promise<void>;
  deleteSession: () => Promise<void>;
  refetch: () => void;
}

// Hook pour gérer une session spécifique
export function useSession(sessionId: string | null): UseSessionReturn {
  const queryClient = useQueryClient();

  // Query pour récupérer la session
  const {
    data: session,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => {
      if (!sessionId) return null;
      return SessionService.getSession(sessionId);
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof SessionServiceError && error.code === 'AUTH_ERROR') {
        return false; // Ne pas retry en cas d'erreur d'authentification
      }
      return failureCount < 3;
    },
  });

  // Mutation pour mettre à jour la session
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Session> }) =>
      SessionService.updateSession(id, updates),
    onSuccess: updatedSession => {
      // Mise à jour du cache
      queryClient.setQueryData(['session', sessionId], updatedSession);
      // Invalidation des listes de sessions
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: error => {
      console.error('Erreur lors de la mise à jour de la session:', error);
    },
  });

  // Mutation pour supprimer la session
  const deleteMutation = useMutation({
    mutationFn: (id: string) => SessionService.deleteSession(id),
    onSuccess: () => {
      // Suppression du cache
      queryClient.removeQueries({ queryKey: ['session', sessionId] });
      // Invalidation des listes de sessions
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: error => {
      console.error('Erreur lors de la suppression de la session:', error);
    },
  });

  // Fonction pour mettre à jour la session
  const handleUpdateSession = useCallback(
    async (updates: Partial<Session>) => {
      if (!sessionId) {
        throw new Error('ID session requis pour la mise à jour');
      }
      await updateMutation.mutateAsync({ id: sessionId, updates });
    },
    [sessionId, updateMutation]
  );

  // Fonction pour supprimer la session
  const handleDeleteSession = useCallback(async () => {
    if (!sessionId) {
      throw new Error('ID session requis pour la suppression');
    }
    await deleteMutation.mutateAsync(sessionId);
  }, [sessionId, deleteMutation]);

  return {
    session: session || null,
    isLoading:
      isLoading || updateMutation.isPending || deleteMutation.isPending,
    isError: isError || updateMutation.isError || deleteMutation.isError,
    error:
      error?.message ||
      updateMutation.error?.message ||
      deleteMutation.error?.message ||
      null,
    updateSession: handleUpdateSession,
    deleteSession: handleDeleteSession,
    refetch,
  };
}

// Hook pour gérer la liste des sessions
export function useSessions(filters?: SessionFilters) {
  const queryClient = useQueryClient();

  // Query pour récupérer toutes les sessions
  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => SessionService.getSessions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof SessionServiceError && error.code === 'AUTH_ERROR') {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Mutation pour créer une nouvelle session
  const createMutation = useMutation({
    mutationFn: (sessionData: CreateSessionInput) =>
      SessionService.createSession(sessionData),
    onSuccess: () => {
      // Invalidation de la liste des sessions
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: error => {
      console.error('Erreur lors de la création de la session:', error);
    },
  });

  // Fonction pour créer une session
  const createSession = useCallback(
    async (sessionData: CreateSessionInput) => {
      return await createMutation.mutateAsync(sessionData);
    },
    [createMutation]
  );

  return {
    sessions,
    isLoading: isLoading || createMutation.isPending,
    isError: isError || createMutation.isError,
    error: error?.message || createMutation.error?.message || null,
    createSession,
    refetch,
  };
}

// Hook pour les sessions paginées
export function useSessionsPaginated(
  page: number = 1,
  limit: number = 10,
  filters?: SessionFilters
) {
  const _queryClient = useQueryClient();

  // Query pour récupérer les sessions paginées
  const {
    data: paginatedSessions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sessions', 'paginated', page, limit, filters],
    queryFn: () => SessionService.getSessionsPaginated(page, limit, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof SessionServiceError && error.code === 'AUTH_ERROR') {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    sessions: paginatedSessions?.sessions || [],
    pagination: paginatedSessions?.pagination,
    isLoading,
    isError,
    error: error?.message || null,
    refetch,
  };
}

// Hook pour la recherche de sessions
export function useSessionSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce de la requête de recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Query pour la recherche
  const {
    data: searchResults = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['sessions', 'search', debouncedQuery],
    queryFn: () => SessionService.searchSessions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (error instanceof SessionServiceError && error.code === 'AUTH_ERROR') {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    query,
    setQuery,
    searchResults,
    isLoading,
    isError,
    error: error?.message || null,
  };
}

// Hook pour les statistiques des sessions
export function useSessionStats() {
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sessions', 'stats'],
    queryFn: () => SessionService.getSessionStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof SessionServiceError && error.code === 'AUTH_ERROR') {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    stats: stats || {
      totalSessions: 0,
      sessionsThisMonth: 0,
      sessionsThisYear: 0,
      completedSessions: 0,
      inProgressSessions: 0,
      draftSessions: 0,
      averageSessionsPerWeek: 0,
      mostCommonType: null,
    },
    isLoading,
    isError,
    error: error?.message || null,
    refetch,
  };
}

// Hook pour la sauvegarde automatique
export function useAutoSave(sessionId: string | null) {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const autoSave = useCallback(
    async (updates: Partial<CreateSessionInput>) => {
      if (!sessionId) return;

      setIsAutoSaving(true);
      try {
        await SessionService.autoSaveSession(sessionId, updates);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error);
      } finally {
        setIsAutoSaving(false);
      }
    },
    [sessionId]
  );

  return {
    autoSave,
    isAutoSaving,
    lastSaved,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsService } from '../services/sessionsService';
import { queryKeys } from '../lib/query-client';
import type { Session, SessionForm, PaginatedResponse } from '../types';

export function useSessions(
  params: {
    page?: number;
    limit?: number;
    patientId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}
) {
  const queryClient = useQueryClient();

  // Query pour la liste des séances
  const {
    data: sessionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.sessionsByPractitioner('current'),
    queryFn: () => sessionsService.getSessions(params),
    keepPreviousData: true,
  });

  // Mutation de création de séance
  const createSessionMutation = useMutation({
    mutationFn: sessionsService.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessionsByPractitioner('current'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.statsByPractitioner('current'),
      });
    },
  });

  // Mutation de mise à jour de séance
  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SessionForm> }) =>
      sessionsService.updateSession(id, data),
    onSuccess: updatedSession => {
      queryClient.setQueryData(
        queryKeys.session(updatedSession.id),
        updatedSession
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessionsByPractitioner('current'),
      });
    },
  });

  // Mutation de suppression de séance
  const deleteSessionMutation = useMutation({
    mutationFn: sessionsService.deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessionsByPractitioner('current'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.statsByPractitioner('current'),
      });
    },
  });

  // Fonctions d'action
  const createSession = async (sessionData: SessionForm) => {
    return createSessionMutation.mutateAsync(sessionData);
  };

  const updateSession = async (
    id: string,
    sessionData: Partial<SessionForm>
  ) => {
    return updateSessionMutation.mutateAsync({ id, data: sessionData });
  };

  const deleteSession = async (id: string) => {
    return deleteSessionMutation.mutateAsync(id);
  };

  return {
    // Données
    sessions: sessionsData?.data || [],
    pagination: sessionsData?.pagination,

    // État
    isLoading,
    error,

    // Actions
    createSession,
    updateSession,
    deleteSession,
    refetch,

    // États des mutations
    isCreating: createSessionMutation.isPending,
    isUpdating: updateSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,

    // Erreurs
    createError: createSessionMutation.error,
    updateError: updateSessionMutation.error,
    deleteError: deleteSessionMutation.error,
  };
}

export function useSession(id: string) {
  const queryClient = useQueryClient();

  // Query pour une séance spécifique
  const {
    data: session,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.session(id),
    queryFn: () => sessionsService.getSessionById(id),
    enabled: !!id,
  });

  // Mutation de mise à jour de séance
  const updateSessionMutation = useMutation({
    mutationFn: (data: Partial<SessionForm>) =>
      sessionsService.updateSession(id, data),
    onSuccess: updatedSession => {
      queryClient.setQueryData(queryKeys.session(id), updatedSession);
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessionsByPractitioner('current'),
      });
    },
  });

  // Fonctions d'action
  const updateSession = async (sessionData: Partial<SessionForm>) => {
    return updateSessionMutation.mutateAsync(sessionData);
  };

  return {
    // Données
    session,

    // État
    isLoading,
    error,

    // Actions
    updateSession,
    refetch,

    // États des mutations
    isUpdating: updateSessionMutation.isPending,

    // Erreurs
    updateError: updateSessionMutation.error,
  };
}

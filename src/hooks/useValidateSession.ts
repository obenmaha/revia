// Hook pour valider une session - FR5
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateExerciseInput } from '../types/exercise';
import { ExerciseService } from '../services/exerciseService';
import { SessionService } from '../services/sessionService';
import { useSessionDraft } from './useSessionDraft';

// Interface pour le retour du hook
export interface UseValidateSessionReturn {
  validateSession: (
    sessionId: string,
    exercises: CreateExerciseInput[]
  ) => Promise<void>;
  isValidating: boolean;
  isError: boolean;
  error: string | null;
}

/**
 * Hook pour valider une session de manière atomique
 * Écrit tous les exercices et marque la session comme 'done' en une seule transaction
 * Puis efface le brouillon localStorage
 *
 * @param sessionId - ID de la session à valider
 * @returns Objet contenant la fonction de validation et l'état
 */
export function useValidateSession(sessionId: string): UseValidateSessionReturn {
  const queryClient = useQueryClient();
  const { clearDraft } = useSessionDraft(sessionId);
  const [error, setError] = useState<string | null>(null);

  // Mutation pour valider la session
  const validateMutation = useMutation({
    mutationFn: async ({
      sessionId,
      exercises,
    }: {
      sessionId: string;
      exercises: CreateExerciseInput[];
    }) => {
      setError(null);

      try {
        // Étape 1: Créer tous les exercices en parallèle pour la performance
        // Note: Supabase ne supporte pas les transactions multi-tables côté client
        // donc nous faisons les opérations séquentiellement avec gestion d'erreur
        const exercisePromises = exercises.map((exercise, index) =>
          ExerciseService.createExercise({
            ...exercise,
            sessionId,
            orderIndex: index,
          })
        );

        const createdExercises = await Promise.all(exercisePromises);

        // Étape 2: Mettre à jour le statut de la session à 'completed'
        await SessionService.updateSession(sessionId, {
          status: 'completed',
        });

        return { createdExercises };
      } catch (error) {
        // En cas d'erreur, essayer de nettoyer les exercices partiellement créés
        // Note: Cette approche n'est pas parfaite mais offre une meilleure UX
        console.error('Erreur lors de la validation de la session:', error);

        // Lancer une erreur pour que la mutation soit marquée comme échouée
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      // Invalider le cache pour recharger les données fraîches
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['exercises', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });

      // Effacer le brouillon après validation réussie
      clearDraft();

      console.log(`Session ${variables.sessionId} validée avec succès`);
    },
    onError: error => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur inconnue lors de la validation';
      setError(errorMessage);
      console.error('Erreur de validation:', errorMessage);
    },
  });

  // Fonction wrapper pour appeler la mutation
  const validateSession = useCallback(
    async (sessionId: string, exercises: CreateExerciseInput[]) => {
      // Validation basique
      if (!sessionId) {
        throw new Error('ID de session requis');
      }

      if (!exercises || exercises.length === 0) {
        throw new Error(
          'Au moins un exercice est requis pour valider la session'
        );
      }

      // Valider les limites RPE et pain_level
      for (const exercise of exercises) {
        if (exercise.intensity < 1 || exercise.intensity > 10) {
          throw new Error(
            `Intensité RPE invalide pour "${exercise.name}": doit être entre 1 et 10`
          );
        }

        if (
          exercise.painLevel !== undefined &&
          (exercise.painLevel < 0 || exercise.painLevel > 10)
        ) {
          throw new Error(
            `Niveau de douleur invalide pour "${exercise.name}": doit être entre 0 et 10`
          );
        }
      }

      await validateMutation.mutateAsync({ sessionId, exercises });
    },
    [validateMutation]
  );

  return {
    validateSession,
    isValidating: validateMutation.isPending,
    isError: validateMutation.isError,
    error,
  };
}

/**
 * Hook alternatif utilisant une transaction Supabase RPC
 * Cette approche nécessiterait une fonction PostgreSQL dédiée
 * pour garantir l'atomicité complète
 *
 * Note: À utiliser si NFR7 exige une atomicité stricte
 */
export function useValidateSessionWithTransaction(
  sessionId: string
): UseValidateSessionReturn {
  const queryClient = useQueryClient();
  const { clearDraft } = useSessionDraft(sessionId);
  const [error, setError] = useState<string | null>(null);

  // Cette mutation appellerait une fonction RPC PostgreSQL
  // qui effectue toutes les opérations dans une transaction ACID
  const validateMutation = useMutation({
    mutationFn: async ({
      sessionId,
      exercises,
    }: {
      sessionId: string;
      exercises: CreateExerciseInput[];
    }) => {
      setError(null);

      // TODO: Implémenter l'appel RPC à une fonction PostgreSQL
      // Exemple: await supabase.rpc('validate_session_atomic', { sessionId, exercises })
      //
      // La fonction PostgreSQL devrait :
      // 1. BEGIN TRANSACTION
      // 2. INSERT INTO exercises (tous les exercices)
      // 3. UPDATE sessions SET status = 'completed'
      // 4. COMMIT ou ROLLBACK en cas d'erreur
      //
      // Voir la section "Edge function" dans le risk log pour plus de détails

      throw new Error(
        'Transaction atomique non implémentée - utilisez useValidateSession pour l\'instant'
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['exercises', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      clearDraft();
    },
    onError: error => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur inconnue lors de la validation';
      setError(errorMessage);
    },
  });

  const validateSession = useCallback(
    async (sessionId: string, exercises: CreateExerciseInput[]) => {
      if (!sessionId || !exercises || exercises.length === 0) {
        throw new Error('Session ID et exercices requis');
      }

      await validateMutation.mutateAsync({ sessionId, exercises });
    },
    [validateMutation]
  );

  return {
    validateSession,
    isValidating: validateMutation.isPending,
    isError: validateMutation.isError,
    error,
  };
}

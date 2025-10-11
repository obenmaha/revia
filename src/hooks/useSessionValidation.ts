// Hook pour la validation de session - Story 2.4
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useExercises, useExerciseStats } from './useExercises';
import { SessionService, SessionServiceError } from '@/services/sessionService';
import { Exercise } from '@/types/exercise';

interface UseSessionValidationProps {
  sessionId: string;
}

interface SessionValidationStats {
  totalDuration: number;
  averageIntensity: number;
  exerciseCount: number;
  totalWeight?: number;
  caloriesBurned: number;
  intensityDistribution: number[];
  completionDate: string;
}

interface UseSessionValidationReturn {
  isValidating: boolean;
  canValidate: boolean;
  validationStats: SessionValidationStats;
  validateSession: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useSessionValidation({
  sessionId,
}: UseSessionValidationProps): UseSessionValidationReturn {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isValidating, setIsValidating] = useState(false);

  const { exercises, isLoading: exercisesLoading } = useExercises(sessionId);
  const { isLoading: statsLoading } = useExerciseStats(sessionId);

  // Mutation pour valider la session
  const validationMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) {
        throw new Error('ID session requis pour la validation');
      }

      // Calculer les statistiques finales
      const finalStats = calculateValidationStats(exercises);

      // Mettre à jour le statut de la session
      const updatedSession = await SessionService.updateSession(sessionId, {
        status: 'completed',
        // Optionnel: ajouter des métadonnées de validation
        notes: `Session validée le ${new Date().toLocaleDateString('fr-FR')} - ${finalStats.exerciseCount} exercices, ${finalStats.totalDuration}min, intensité moyenne ${finalStats.averageIntensity}/10`,
      });

      return { session: updatedSession, stats: finalStats };
    },
    onSuccess: data => {
      // Invalidation des caches
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['exercises', sessionId] });
      queryClient.invalidateQueries({
        queryKey: ['exercise-stats', sessionId],
      });

      toast({
        title: '🎉 Session validée !',
        description: `Votre session a été validée avec succès. ${data.stats.exerciseCount} exercices terminés en ${data.stats.totalDuration} minutes.`,
      });
    },
    onError: error => {
      console.error('Erreur lors de la validation de la session:', error);

      let errorMessage =
        'Impossible de valider la session. Veuillez réessayer.';

      if (error instanceof SessionServiceError) {
        switch (error.code) {
          case 'AUTH_ERROR':
            errorMessage = 'Vous devez être connecté pour valider la session.';
            break;
          case 'SESSION_NOT_FOUND':
            errorMessage = 'Session non trouvée.';
            break;
          case 'UPDATE_ERROR':
            errorMessage = 'Erreur lors de la mise à jour de la session.';
            break;
          default:
            errorMessage = error.message;
        }
      }

      toast({
        title: 'Erreur de validation',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Calculer les statistiques de validation
  const calculateValidationStats = (
    exercises: Exercise[]
  ): SessionValidationStats => {
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const averageIntensity =
      exercises.length > 0
        ? exercises.reduce((sum, ex) => sum + ex.intensity * ex.duration, 0) /
          totalDuration
        : 0;
    const totalWeight = exercises.reduce(
      (sum, ex) => sum + (ex.weight || 0) * (ex.sets || 0) * (ex.reps || 0),
      0
    );
    const caloriesBurned = exercises.reduce(
      (sum, ex) => sum + ex.duration * ex.intensity * 0.1,
      0
    );
    const intensityDistribution = exercises.map(ex => ex.intensity);

    return {
      totalDuration,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      exerciseCount: exercises.length,
      totalWeight: totalWeight > 0 ? totalWeight : undefined,
      caloriesBurned: Math.round(caloriesBurned),
      intensityDistribution,
      completionDate: new Date().toISOString(),
    };
  };

  // Fonction pour valider la session
  const validateSession = useCallback(async () => {
    if (!canValidate) {
      toast({
        title: 'Impossible de valider',
        description: 'Ajoutez au moins un exercice pour valider votre session.',
        variant: 'destructive',
      });
      return;
    }

    setIsValidating(true);
    try {
      await validationMutation.mutateAsync();
    } finally {
      setIsValidating(false);
    }
  }, [canValidate, validationMutation, toast]);

  // Vérifier si la session peut être validée
  const canValidate =
    exercises.length > 0 && !isValidating && !validationMutation.isPending;

  // Statistiques de validation
  const validationStats = calculateValidationStats(exercises);

  return {
    isValidating: isValidating || validationMutation.isPending,
    canValidate,
    validationStats,
    validateSession,
    isLoading: exercisesLoading || statsLoading,
    error: validationMutation.error?.message || null,
  };
}

// Hook pour les statistiques de session en temps réel
export function useSessionStats(sessionId: string) {
  const { exercises, isLoading: exercisesLoading } = useExercises(sessionId);
  const { isLoading: statsLoading } = useExerciseStats(sessionId);

  const realTimeStats = {
    totalDuration: stats.totalDuration,
    averageIntensity: stats.averageIntensity,
    exerciseCount: stats.exerciseCount,
    totalWeight: stats.totalWeight,
    caloriesBurned: stats.caloriesBurned,
    intensityDistribution: stats.intensityDistribution,
    // Statistiques calculées en temps réel
    intensityMin:
      stats.intensityDistribution.length > 0
        ? Math.min(...stats.intensityDistribution)
        : 0,
    intensityMax:
      stats.intensityDistribution.length > 0
        ? Math.max(...stats.intensityDistribution)
        : 0,
    averageDurationPerExercise:
      stats.exerciseCount > 0
        ? Math.round(stats.totalDuration / stats.exerciseCount)
        : 0,
  };

  return {
    stats: realTimeStats,
    isLoading: exercisesLoading || statsLoading,
    exercises,
  };
}

// Hook pour la sauvegarde automatique des statistiques
export function useAutoSaveStats(sessionId: string) {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const autoSaveStats = useCallback(async () => {
    if (!sessionId) return;

    setIsAutoSaving(true);
    try {
      // Ici, on pourrait sauvegarder des statistiques intermédiaires
      // ou des métadonnées de session
      setLastSaved(new Date());
    } catch (error) {
      console.error(
        'Erreur lors de la sauvegarde automatique des statistiques:',
        error
      );
    } finally {
      setIsAutoSaving(false);
    }
  }, [sessionId]);

  return {
    autoSaveStats,
    isAutoSaving,
    lastSaved,
  };
}

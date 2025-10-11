// Hook pour la gestion des exercices - Story 2.3
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Exercise,
  CreateExerciseInput,
  UpdateExerciseInput,
  ExerciseFilters,
} from '../types/exercise';
import {
  ExerciseService,
  ExerciseServiceError,
} from '../services/exerciseService';

// Interface pour le retour du hook
export interface UseExerciseReturn {
  exercise: Exercise | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  updateExercise: (updates: Partial<Exercise>) => Promise<void>;
  deleteExercise: () => Promise<void>;
  refetch: () => void;
}

// Hook pour gérer un exercice spécifique
export function useExercise(exerciseId: string | null): UseExerciseReturn {
  const queryClient = useQueryClient();

  // Query pour récupérer l'exercice
  const {
    data: exercise,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => {
      if (!exerciseId) return null;
      return ExerciseService.getExercise(exerciseId);
    },
    enabled: !!exerciseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (
        error instanceof ExerciseServiceError &&
        error.code === 'AUTH_ERROR'
      ) {
        return false; // Ne pas retry en cas d'erreur d'authentification
      }
      return failureCount < 3;
    },
  });

  // Mutation pour mettre à jour l'exercice
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Exercise> }) =>
      ExerciseService.updateExercise(id, updates),
    onSuccess: updatedExercise => {
      // Mise à jour du cache
      queryClient.setQueryData(['exercise', exerciseId], updatedExercise);
      // Invalidation des listes d'exercices
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
    onError: error => {
      console.error("Erreur lors de la mise à jour de l'exercice:", error);
    },
  });

  // Mutation pour supprimer l'exercice
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ExerciseService.deleteExercise(id),
    onSuccess: () => {
      // Suppression du cache
      queryClient.removeQueries({ queryKey: ['exercise', exerciseId] });
      // Invalidation des listes d'exercices
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
    onError: error => {
      console.error("Erreur lors de la suppression de l'exercice:", error);
    },
  });

  // Fonction pour mettre à jour l'exercice
  const handleUpdateExercise = useCallback(
    async (updates: Partial<Exercise>) => {
      if (!exerciseId) {
        throw new Error('ID exercice requis pour la mise à jour');
      }
      await updateMutation.mutateAsync({ id: exerciseId, updates });
    },
    [exerciseId, updateMutation]
  );

  // Fonction pour supprimer l'exercice
  const handleDeleteExercise = useCallback(async () => {
    if (!exerciseId) {
      throw new Error('ID exercice requis pour la suppression');
    }
    await deleteMutation.mutateAsync(exerciseId);
  }, [exerciseId, deleteMutation]);

  return {
    exercise: exercise || null,
    isLoading:
      isLoading || updateMutation.isPending || deleteMutation.isPending,
    isError: isError || updateMutation.isError || deleteMutation.isError,
    error:
      error?.message ||
      updateMutation.error?.message ||
      deleteMutation.error?.message ||
      null,
    updateExercise: handleUpdateExercise,
    deleteExercise: handleDeleteExercise,
    refetch,
  };
}

// Hook pour gérer la liste des exercices d'une session
export function useExercises(
  sessionId: string | null,
  filters?: ExerciseFilters
) {
  const queryClient = useQueryClient();

  // Query pour récupérer tous les exercices de la session
  const {
    data: exercises = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['exercises', sessionId, filters],
    queryFn: () => {
      if (!sessionId) return [];
      return ExerciseService.getExercisesBySession(sessionId, filters);
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (
        error instanceof ExerciseServiceError &&
        error.code === 'AUTH_ERROR'
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Mutation pour créer un nouvel exercice
  const createMutation = useMutation({
    mutationFn: (exerciseData: CreateExerciseInput) =>
      ExerciseService.createExercise(exerciseData),
    onSuccess: () => {
      // Invalidation de la liste des exercices
      queryClient.invalidateQueries({ queryKey: ['exercises', sessionId] });
    },
    onError: error => {
      console.error("Erreur lors de la création de l'exercice:", error);
    },
  });

  // Mutation pour mettre à jour un exercice
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Exercise> }) =>
      ExerciseService.updateExercise(id, updates),
    onSuccess: () => {
      // Invalidation de la liste des exercices
      queryClient.invalidateQueries({ queryKey: ['exercises', sessionId] });
    },
    onError: error => {
      console.error("Erreur lors de la mise à jour de l'exercice:", error);
    },
  });

  // Mutation pour supprimer un exercice
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ExerciseService.deleteExercise(id),
    onSuccess: () => {
      // Invalidation de la liste des exercices
      queryClient.invalidateQueries({ queryKey: ['exercises', sessionId] });
    },
    onError: error => {
      console.error("Erreur lors de la suppression de l'exercice:", error);
    },
  });

  // Mutation pour réorganiser les exercices
  const reorderMutation = useMutation({
    mutationFn: (exercises: Exercise[]) => {
      if (!sessionId)
        throw new Error('ID session requis pour la réorganisation');
      return ExerciseService.reorderExercises({
        sessionId,
        exercises: exercises.map((ex, index) => ({
          id: ex.id,
          orderIndex: index,
        })),
      });
    },
    onSuccess: () => {
      // Invalidation de la liste des exercices
      queryClient.invalidateQueries({ queryKey: ['exercises', sessionId] });
    },
    onError: error => {
      console.error('Erreur lors de la réorganisation des exercices:', error);
    },
  });

  // Fonction pour créer un exercice
  const addExercise = useCallback(
    async (exerciseData: Omit<CreateExerciseInput, 'sessionId'>) => {
      if (!sessionId) {
        throw new Error('ID session requis pour créer un exercice');
      }
      return await createMutation.mutateAsync({
        ...exerciseData,
        sessionId,
        orderIndex: exercises.length, // Ajouter à la fin
      });
    },
    [sessionId, createMutation, exercises.length]
  );

  // Fonction pour mettre à jour un exercice
  const updateExercise = useCallback(
    async (id: string, updates: Partial<Exercise>) => {
      await updateMutation.mutateAsync({ id, updates });
    },
    [updateMutation]
  );

  // Fonction pour supprimer un exercice
  const deleteExercise = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  // Fonction pour réorganiser les exercices
  const reorderExercises = useCallback(
    async (newExercises: Exercise[]) => {
      await reorderMutation.mutateAsync(newExercises);
    },
    [reorderMutation]
  );

  return {
    exercises,
    isLoading:
      isLoading ||
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      reorderMutation.isPending,
    isError:
      isError ||
      createMutation.isError ||
      updateMutation.isError ||
      deleteMutation.isError ||
      reorderMutation.isError,
    error:
      error?.message ||
      createMutation.error?.message ||
      updateMutation.error?.message ||
      deleteMutation.error?.message ||
      reorderMutation.error?.message ||
      null,
    addExercise,
    updateExercise,
    deleteExercise,
    reorderExercises,
    refetch,
  };
}

// Hook pour les statistiques des exercices
export function useExerciseStats(sessionId: string | null) {
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['exercise-stats', sessionId],
    queryFn: () => {
      if (!sessionId) return null;
      return ExerciseService.getExerciseStats(sessionId);
    },
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (
        error instanceof ExerciseServiceError &&
        error.code === 'AUTH_ERROR'
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    stats: stats || {
      totalDuration: 0,
      averageIntensity: 0,
      totalWeight: undefined,
      exerciseCount: 0,
      caloriesBurned: 0,
      intensityDistribution: [],
    },
    isLoading,
    isError,
    error: error?.message || null,
    refetch,
  };
}

// Hook pour la sauvegarde automatique d'un exercice
export function useAutoSaveExercise(exerciseId: string | null) {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const autoSave = useCallback(
    async (updates: Partial<UpdateExerciseInput>) => {
      if (!exerciseId) return;

      setIsAutoSaving(true);
      try {
        await ExerciseService.autoSaveExercise(exerciseId, updates);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error);
      } finally {
        setIsAutoSaving(false);
      }
    },
    [exerciseId]
  );

  return {
    autoSave,
    isAutoSaving,
    lastSaved,
  };
}

// Hook pour le formulaire d'exercice
export function useExerciseForm(sessionId: string | null) {
  const [formData, setFormData] = useState<Partial<CreateExerciseInput>>({
    name: '',
    duration: 30,
    intensity: 5,
    exerciseType: 'cardio',
    orderIndex: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const { addExercise, isLoading } = useExercises(sessionId);

  const updateField = useCallback(
    <K extends keyof CreateExerciseInput>(
      field: K,
      value: CreateExerciseInput[K]
    ) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setIsDirty(true);

      // Nettoyer l'erreur du champ modifié
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const validateField = useCallback(
    (field: keyof CreateExerciseInput): string[] => {
      const fieldErrors: string[] = [];

      try {
        // Validation Zod pour le champ spécifique
        if (field === 'name' && formData.name) {
          if (formData.name.length < 2) {
            fieldErrors.push('Nom requis (min 2 caractères)');
          }
        }

        if (field === 'duration' && formData.duration !== undefined) {
          if (formData.duration < 1) {
            fieldErrors.push('Durée minimale 1 minute');
          } else if (formData.duration > 300) {
            fieldErrors.push('Durée maximale 300 minutes');
          }
        }

        if (field === 'intensity' && formData.intensity !== undefined) {
          if (formData.intensity < 1) {
            fieldErrors.push('Intensité minimale 1');
          } else if (formData.intensity > 10) {
            fieldErrors.push('Intensité maximale 10');
          }
        }

        if (field === 'weight' && formData.weight !== undefined) {
          if (formData.weight < 0) {
            fieldErrors.push('Poids minimum 0');
          } else if (formData.weight > 1000) {
            fieldErrors.push('Poids maximum 1000 kg');
          }
        }

        if (field === 'sets' && formData.sets !== undefined) {
          if (formData.sets < 1) {
            fieldErrors.push('Séries minimum 1');
          } else if (formData.sets > 100) {
            fieldErrors.push('Séries maximum 100');
          }
        }

        if (field === 'reps' && formData.reps !== undefined) {
          if (formData.reps < 1) {
            fieldErrors.push('Répétitions minimum 1');
          } else if (formData.reps > 1000) {
            fieldErrors.push('Répétitions maximum 1000');
          }
        }

        if (field === 'notes' && formData.notes) {
          if (formData.notes.length > 500) {
            fieldErrors.push('Notes trop longues (max 500 caractères)');
          }
        }
      } catch {
        fieldErrors.push('Erreur de validation');
      }

      return fieldErrors;
    },
    [formData]
  );

  const saveExercise = useCallback(async () => {
    if (!sessionId) {
      throw new Error('ID session requis');
    }

    // Validation complète
    const allErrors: Record<string, string> = {};
    const requiredFields: (keyof CreateExerciseInput)[] = [
      'name',
      'duration',
      'intensity',
      'exerciseType',
    ];

    for (const field of requiredFields) {
      const fieldErrors = validateField(field);
      if (fieldErrors.length > 0) {
        allErrors[field] = fieldErrors[0];
      }
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      throw new Error('Données invalides');
    }

    try {
      await addExercise(formData as CreateExerciseInput);
      setFormData({
        name: '',
        duration: 30,
        intensity: 5,
        exerciseType: 'cardio',
        orderIndex: 0,
      });
      setIsDirty(false);
      setErrors({});
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }, [sessionId, formData, addExercise, validateField]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      duration: 30,
      intensity: 5,
      exerciseType: 'cardio',
      orderIndex: 0,
    });
    setIsDirty(false);
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    isDirty,
    isLoading,
    updateField,
    validateField,
    saveExercise,
    resetForm,
  };
}

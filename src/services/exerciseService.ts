// Service de gestion des exercices - Story 2.3
import { supabase } from '../lib/supabase';
import {
  Exercise,
  CreateExerciseInput,
  UpdateExerciseInput,
  SupabaseExercise,
  mapSupabaseExerciseToExercise,
  createExerciseSchema,
  updateExerciseSchema,
  ExerciseFilters,
  ExerciseStats,
  ExerciseReorderInput,
} from '../types/exercise';

// Classe d'erreur personnalisée pour les services
export class ExerciseServiceError extends Error {
  public code?: string;
  public details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'ExerciseServiceError';
    this.code = code;
    this.details = details;
  }
}

// Service principal de gestion des exercices
export class ExerciseService {
  /**
   * Créer un nouvel exercice
   */
  static async createExercise(
    exerciseData: CreateExerciseInput
  ): Promise<Exercise> {
    try {
      // Validation des données avec Zod
      const validatedData = createExerciseSchema.parse(exerciseData);

      // Récupération de l'utilisateur actuel
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new ExerciseServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      // Vérification que la session appartient à l'utilisateur
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('id, user_id')
        .eq('id', validatedData.sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError || !session) {
        throw new ExerciseServiceError(
          'Session non trouvée ou non autorisée',
          'SESSION_NOT_FOUND'
        );
      }

      // Préparation des données pour Supabase
      const supabaseData: Partial<SupabaseExercise> = {
        session_id: validatedData.sessionId,
        name: validatedData.name,
        duration: validatedData.duration,
        intensity: validatedData.intensity,
        weight: validatedData.weight,
        sets: validatedData.sets,
        reps: validatedData.reps,
        notes: validatedData.notes,
        exercise_type: validatedData.exerciseType,
        order_index: validatedData.orderIndex,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insertion en base de données
      const { data, error } = await supabase
        .from('exercises')
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        throw new ExerciseServiceError(
          `Erreur lors de la création de l'exercice: ${error.message}`,
          'CREATE_ERROR',
          error
        );
      }

      return mapSupabaseExerciseToExercise(data as SupabaseExercise);
    } catch (error) {
      if (error instanceof ExerciseServiceError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ExerciseServiceError(
          `Erreur de validation: ${error.message}`,
          'VALIDATION_ERROR'
        );
      }
      throw new ExerciseServiceError(
        "Erreur inconnue lors de la création de l'exercice",
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Récupérer un exercice par son ID
   */
  static async getExercise(id: string): Promise<Exercise | null> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(
          `
          *,
          sessions!inner(user_id)
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Exercice non trouvé
        }
        throw new ExerciseServiceError(
          `Erreur lors de la récupération de l'exercice: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      return mapSupabaseExerciseToExercise(data as SupabaseExercise);
    } catch (error) {
      if (error instanceof ExerciseServiceError) {
        throw error;
      }
      throw new ExerciseServiceError(
        "Erreur inconnue lors de la récupération de l'exercice",
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Récupérer tous les exercices d'une session
   */
  static async getExercisesBySession(
    sessionId: string,
    filters?: ExerciseFilters
  ): Promise<Exercise[]> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new ExerciseServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      let query = supabase
        .from('exercises')
        .select(
          `
          *,
          sessions!inner(user_id)
        `
        )
        .eq('session_id', sessionId)
        .eq('sessions.user_id', user.id)
        .order('order_index', { ascending: true });

      // Application des filtres
      if (filters?.exerciseType) {
        query = query.eq('exercise_type', filters.exerciseType);
      }
      if (filters?.intensityMin) {
        query = query.gte('intensity', filters.intensityMin);
      }
      if (filters?.intensityMax) {
        query = query.lte('intensity', filters.intensityMax);
      }
      if (filters?.durationMin) {
        query = query.gte('duration', filters.durationMin);
      }
      if (filters?.durationMax) {
        query = query.lte('duration', filters.durationMax);
      }
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new ExerciseServiceError(
          `Erreur lors de la récupération des exercices: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      return data.map(mapSupabaseExerciseToExercise);
    } catch (error) {
      if (error instanceof ExerciseServiceError) {
        throw error;
      }
      throw new ExerciseServiceError(
        'Erreur inconnue lors de la récupération des exercices',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Mettre à jour un exercice
   */
  static async updateExercise(
    id: string,
    updates: Partial<UpdateExerciseInput>
  ): Promise<Exercise> {
    try {
      // Validation des données avec Zod
      updateExerciseSchema.parse({ id, ...updates });

      // Récupération de l'utilisateur actuel
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new ExerciseServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      // Préparation des données pour Supabase
      const supabaseUpdates: Partial<SupabaseExercise> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.duration !== undefined)
        supabaseUpdates.duration = updates.duration;
      if (updates.intensity !== undefined)
        supabaseUpdates.intensity = updates.intensity;
      if (updates.weight !== undefined) supabaseUpdates.weight = updates.weight;
      if (updates.sets !== undefined) supabaseUpdates.sets = updates.sets;
      if (updates.reps !== undefined) supabaseUpdates.reps = updates.reps;
      if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
      if (updates.exerciseType !== undefined)
        supabaseUpdates.exercise_type = updates.exerciseType;
      if (updates.orderIndex !== undefined)
        supabaseUpdates.order_index = updates.orderIndex;

      // Mise à jour en base de données avec vérification RLS
      const { data, error } = await supabase
        .from('exercises')
        .update(supabaseUpdates)
        .eq('id', id)
        .select(
          `
          *,
          sessions!inner(user_id)
        `
        )
        .eq('sessions.user_id', user.id)
        .single();

      if (error) {
        throw new ExerciseServiceError(
          `Erreur lors de la mise à jour de l'exercice: ${error.message}`,
          'UPDATE_ERROR',
          error
        );
      }

      return mapSupabaseExerciseToExercise(data as SupabaseExercise);
    } catch (error) {
      if (error instanceof ExerciseServiceError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ExerciseServiceError(
          `Erreur de validation: ${error.message}`,
          'VALIDATION_ERROR'
        );
      }
      throw new ExerciseServiceError(
        "Erreur inconnue lors de la mise à jour de l'exercice",
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Supprimer un exercice
   */
  static async deleteExercise(id: string): Promise<void> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new ExerciseServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)
        .select(
          `
          sessions!inner(user_id)
        `
        )
        .eq('sessions.user_id', user.id);

      if (error) {
        throw new ExerciseServiceError(
          `Erreur lors de la suppression de l'exercice: ${error.message}`,
          'DELETE_ERROR',
          error
        );
      }
    } catch (error) {
      if (error instanceof ExerciseServiceError) {
        throw error;
      }
      throw new ExerciseServiceError(
        "Erreur inconnue lors de la suppression de l'exercice",
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Réorganiser les exercices d'une session
   */
  static async reorderExercises(
    reorderData: ExerciseReorderInput
  ): Promise<void> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new ExerciseServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      // Vérification que la session appartient à l'utilisateur
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('id, user_id')
        .eq('id', reorderData.sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError || !session) {
        throw new ExerciseServiceError(
          'Session non trouvée ou non autorisée',
          'SESSION_NOT_FOUND'
        );
      }

      // Mise à jour en lot des ordres
      const updates = reorderData.exercises.map(exercise => ({
        id: exercise.id,
        order_index: exercise.orderIndex,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('exercises')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        throw new ExerciseServiceError(
          `Erreur lors de la réorganisation des exercices: ${error.message}`,
          'REORDER_ERROR',
          error
        );
      }
    } catch (error) {
      if (error instanceof ExerciseServiceError) {
        throw error;
      }
      throw new ExerciseServiceError(
        'Erreur inconnue lors de la réorganisation des exercices',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Calculer les statistiques des exercices d'une session
   */
  static async getExerciseStats(sessionId: string): Promise<ExerciseStats> {
    try {
      const exercises = await this.getExercisesBySession(sessionId);

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
      ); // Estimation simple
      const intensityDistribution = exercises.map(ex => ex.intensity);

      return {
        totalDuration,
        averageIntensity: Math.round(averageIntensity * 10) / 10,
        totalWeight: totalWeight > 0 ? totalWeight : undefined,
        exerciseCount: exercises.length,
        caloriesBurned: Math.round(caloriesBurned),
        intensityDistribution,
      };
    } catch (error) {
      if (error instanceof ExerciseServiceError) {
        throw error;
      }
      throw new ExerciseServiceError(
        'Erreur inconnue lors du calcul des statistiques',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Sauvegarde automatique (draft) d'un exercice
   */
  static async autoSaveExercise(
    id: string,
    updates: Partial<UpdateExerciseInput>
  ): Promise<void> {
    try {
      // Validation minimale pour la sauvegarde automatique
      updateExerciseSchema.partial().parse({ id, ...updates });

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new ExerciseServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      // Préparation des données pour Supabase
      const supabaseUpdates: Partial<SupabaseExercise> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.duration !== undefined)
        supabaseUpdates.duration = updates.duration;
      if (updates.intensity !== undefined)
        supabaseUpdates.intensity = updates.intensity;
      if (updates.weight !== undefined) supabaseUpdates.weight = updates.weight;
      if (updates.sets !== undefined) supabaseUpdates.sets = updates.sets;
      if (updates.reps !== undefined) supabaseUpdates.reps = updates.reps;
      if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
      if (updates.exerciseType !== undefined)
        supabaseUpdates.exercise_type = updates.exerciseType;
      if (updates.orderIndex !== undefined)
        supabaseUpdates.order_index = updates.orderIndex;

      // Mise à jour en base de données
      const { error } = await supabase
        .from('exercises')
        .update(supabaseUpdates)
        .eq('id', id)
        .select(
          `
          sessions!inner(user_id)
        `
        )
        .eq('sessions.user_id', user.id);

      if (error) {
        throw new ExerciseServiceError(
          `Erreur lors de la sauvegarde automatique: ${error.message}`,
          'AUTOSAVE_ERROR',
          error
        );
      }
    } catch (error) {
      if (error instanceof ExerciseServiceError) {
        throw error;
      }
      throw new ExerciseServiceError(
        'Erreur inconnue lors de la sauvegarde automatique',
        'UNKNOWN_ERROR'
      );
    }
  }
}

// Export des fonctions utilitaires
export const {
  createExercise,
  getExercise,
  getExercisesBySession,
  updateExercise,
  deleteExercise,
  reorderExercises,
  getExerciseStats,
  autoSaveExercise,
} = ExerciseService;

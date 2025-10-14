// Types spécialisés pour les exercices - Story 2.3
import { z } from 'zod';

// Interface principale Exercise
export interface Exercise {
  id: string;
  sessionId: string;
  name: string;
  duration: number; // en minutes
  intensity: number; // RPE 1-10
  weight?: number; // en kg
  sets?: number;
  reps?: number;
  notes?: string;
  exerciseType: ExerciseType;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

// Types d'exercices
export type ExerciseType = 'cardio' | 'musculation' | 'etirement' | 'autre';

// Interface pour la création d'exercice
export interface CreateExerciseInput {
  sessionId: string;
  name: string;
  duration: number;
  intensity: number;
  weight?: number;
  sets?: number;
  reps?: number;
  notes?: string;
  exerciseType: ExerciseType;
  orderIndex: number;
}

// Interface pour la mise à jour d'exercice
export interface UpdateExerciseInput extends Partial<CreateExerciseInput> {
  id: string;
}

// Types Supabase (snake_case)
export interface SupabaseExercise {
  id: string;
  session_id: string;
  name: string;
  duration: number;
  intensity: number;
  weight?: number;
  sets?: number;
  reps?: number;
  notes?: string;
  exercise_type: ExerciseType;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Schémas de validation Zod
export const exerciseTypeSchema = z.enum(
  ['cardio', 'musculation', 'etirement', 'autre'],
  {
    message: "Type d'exercice invalide",
  }
);

export const exerciseSchema = z.object({
  name: z.string().min(2, 'Nom requis (min 2 caractères)'),
  duration: z
    .number()
    .min(1, 'Durée minimale 1 minute')
    .max(300, 'Durée maximale 300 minutes'),
  intensity: z
    .number()
    .min(1, 'Intensité minimale 1')
    .max(10, 'Intensité maximale 10'),
  weight: z
    .number()
    .min(0, 'Poids minimum 0')
    .max(1000, 'Poids maximum 1000 kg')
    .optional(),
  sets: z
    .number()
    .min(1, 'Séries minimum 1')
    .max(100, 'Séries maximum 100')
    .optional(),
  reps: z
    .number()
    .min(1, 'Répétitions minimum 1')
    .max(1000, 'Répétitions maximum 1000')
    .optional(),
  notes: z
    .string()
    .max(500, 'Notes trop longues (max 500 caractères)')
    .optional(),
  exerciseType: exerciseTypeSchema,
  orderIndex: z.number().min(0, "Index d'ordre minimum 0"),
});

export const createExerciseSchema = exerciseSchema.extend({
  sessionId: z.string().uuid('ID session invalide'),
});

export const updateExerciseSchema = z.object({
  id: z.string().uuid('ID exercice invalide'),
  name: z.string().min(2, 'Nom requis (min 2 caractères)').optional(),
  duration: z
    .number()
    .min(1, 'Durée minimale 1 minute')
    .max(300, 'Durée maximale 300 minutes')
    .optional(),
  intensity: z
    .number()
    .min(1, 'Intensité minimale 1')
    .max(10, 'Intensité maximale 10')
    .optional(),
  weight: z
    .number()
    .min(0, 'Poids minimum 0')
    .max(1000, 'Poids maximum 1000 kg')
    .optional(),
  sets: z
    .number()
    .min(1, 'Séries minimum 1')
    .max(100, 'Séries maximum 100')
    .optional(),
  reps: z
    .number()
    .min(1, 'Répétitions minimum 1')
    .max(1000, 'Répétitions maximum 1000')
    .optional(),
  notes: z
    .string()
    .max(500, 'Notes trop longues (max 500 caractères)')
    .optional(),
  exerciseType: exerciseTypeSchema.optional(),
  orderIndex: z.number().min(0, "Index d'ordre minimum 0").optional(),
});

// Fonctions de mapping entre types Supabase et Application
export const mapSupabaseExerciseToExercise = (
  supabaseExercise: SupabaseExercise
): Exercise => ({
  id: supabaseExercise.id,
  sessionId: supabaseExercise.session_id,
  name: supabaseExercise.name,
  duration: supabaseExercise.duration,
  intensity: supabaseExercise.intensity,
  weight: supabaseExercise.weight,
  sets: supabaseExercise.sets,
  reps: supabaseExercise.reps,
  notes: supabaseExercise.notes,
  exerciseType: supabaseExercise.exercise_type,
  orderIndex: supabaseExercise.order_index,
  createdAt: new Date(supabaseExercise.created_at),
  updatedAt: new Date(supabaseExercise.updated_at),
});

export const mapExerciseToSupabaseExercise = (
  exercise: Partial<Exercise>
): Partial<SupabaseExercise> => ({
  id: exercise.id,
  session_id: exercise.sessionId,
  name: exercise.name,
  duration: exercise.duration,
  intensity: exercise.intensity,
  weight: exercise.weight,
  sets: exercise.sets,
  reps: exercise.reps,
  notes: exercise.notes,
  exercise_type: exercise.exerciseType,
  order_index: exercise.orderIndex,
  created_at: exercise.createdAt?.toISOString(),
  updated_at: exercise.updatedAt?.toISOString(),
});

// Types pour les erreurs de validation
export interface ExerciseValidationError {
  field: string;
  message: string;
}

export interface ExerciseFormError {
  field: keyof CreateExerciseInput;
  message: string;
}

// Types pour les états de chargement
export interface ExerciseFormState {
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  errors: ExerciseFormError[];
}

// Types pour les hooks
export interface UseExerciseReturn {
  exercise: Exercise | null;
  isLoading: boolean;
  error: string | null;
  updateExercise: (updates: Partial<Exercise>) => Promise<void>;
  deleteExercise: () => Promise<void>;
  refetch: () => void;
}

export interface UseExercisesReturn {
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  addExercise: (exerciseData: CreateExerciseInput) => Promise<Exercise>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  reorderExercises: (exercises: Exercise[]) => Promise<void>;
  refetch: () => void;
}

// Types pour les options de sélection
export interface ExerciseTypeOption {
  value: ExerciseType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const EXERCISE_TYPE_OPTIONS: ExerciseTypeOption[] = [
  {
    value: 'cardio',
    label: 'Cardio',
    icon: 'HeartPulse',
    color: 'text-red-500',
    description: 'Course, vélo, natation',
  },
  {
    value: 'musculation',
    label: 'Musculation',
    icon: 'Dumbbell',
    color: 'text-blue-500',
    description: 'Poids, résistance',
  },
  {
    value: 'etirement',
    label: 'Étirement',
    icon: 'Flex',
    color: 'text-green-500',
    description: 'Yoga, stretching',
  },
  {
    value: 'autre',
    label: 'Autre',
    icon: 'MoreHorizontal',
    color: 'text-gray-500',
    description: 'Activité personnalisée',
  },
];

// Types pour les statistiques d'exercices
export interface ExerciseStats {
  totalDuration: number;
  averageIntensity: number;
  totalWeight?: number;
  exerciseCount: number;
  caloriesBurned?: number;
  intensityDistribution: number[];
}

// Types pour les filtres d'exercices
export interface ExerciseFilters {
  exerciseType?: ExerciseType;
  intensityMin?: number;
  intensityMax?: number;
  durationMin?: number;
  durationMax?: number;
  search?: string;
}

// Types pour la réorganisation des exercices
export interface ExerciseReorderInput {
  sessionId: string;
  exercises: { id: string; orderIndex: number }[];
}

// Types pour les formulaires d'exercices
export interface ExerciseFormData {
  name: string;
  duration: number;
  intensity: number;
  weight?: number;
  sets?: number;
  reps?: number;
  notes?: string;
  exerciseType: ExerciseType;
}

// Types pour les composants de drag & drop
export interface DraggableExercise extends Exercise {
  isDragging?: boolean;
  isOver?: boolean;
}

// Types pour les animations
export interface ExerciseAnimationVariants {
  hidden: Record<string, unknown>;
  visible: Record<string, unknown>;
  exit: Record<string, unknown>;
}

// Types pour les validations croisées
export interface ExerciseValidationRules {
  musculation: {
    required: ('weight' | 'sets' | 'reps')[];
    optional: 'notes'[];
  };
  cardio: {
    required: ('duration' | 'intensity')[];
    optional: 'notes'[];
  };
  etirement: {
    required: ('duration' | 'intensity')[];
    optional: 'notes'[];
  };
  autre: {
    required: ('name' | 'duration' | 'intensity')[];
    optional: ('weight' | 'sets' | 'reps' | 'notes')[];
  };
}

export const EXERCISE_VALIDATION_RULES: ExerciseValidationRules = {
  musculation: {
    required: ['weight', 'sets', 'reps'],
    optional: ['notes'],
  },
  cardio: {
    required: ['duration', 'intensity'],
    optional: ['notes'],
  },
  etirement: {
    required: ['duration', 'intensity'],
    optional: ['notes'],
  },
  autre: {
    required: ['name', 'duration', 'intensity'],
    optional: ['weight', 'sets', 'reps', 'notes'],
  },
};

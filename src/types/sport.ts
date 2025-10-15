// Types spécialisés pour les données sport - Story 1.5
import { z } from 'zod';

// Types d'énumération pour les sessions sport
export type SportSessionType = 'cardio' | 'musculation' | 'flexibility' | 'other';
export type SportSessionStatus = 'draft' | 'in_progress' | 'completed';
export type SportExerciseType = 'cardio' | 'musculation' | 'flexibility' | 'other';

// Interface principale SportSession
export interface SportSession {
  id: string;
  user_id: string;
  name: string;
  date: Date;
  type: SportSessionType;
  status: SportSessionStatus;
  objectives?: string;
  notes?: string;
  rpe_score?: number; // 1-10
  pain_level?: number; // 1-10
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

// Interface pour les exercices sport
export interface SportExercise {
  id: string;
  session_id: string;
  name: string;
  exercise_type: SportExerciseType;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  order_index: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Interface pour les statistiques calculées
export interface SportStats {
  total_sessions: number;
  weekly_frequency: number;
  total_duration_minutes: number;
  average_rpe: number;
  current_streak: number;
  best_streak: number;
  sessions_by_type: Record<string, number>;
  monthly_progression: MonthlyStats[];
}

// Interface pour les statistiques mensuelles
export interface MonthlyStats {
  month: string;
  sessions_count: number;
  total_duration: number;
  average_rpe: number;
  streak: number;
}

// Types Supabase (snake_case)
export interface SupabaseSportSession {
  id: string;
  user_id: string;
  name: string;
  date: string;
  type: SportSessionType;
  status: SportSessionStatus;
  objectives?: string;
  notes?: string;
  rpe_score?: number;
  pain_level?: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseSportExercise {
  id: string;
  session_id: string;
  name: string;
  exercise_type: SportExerciseType;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  order_index: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Schémas de validation Zod
export const sportSessionTypeSchema = z.enum(
  ['cardio', 'musculation', 'flexibility', 'other'],
  {
    message: "Type de session sport invalide",
  }
);

export const sportSessionStatusSchema = z.enum(
  ['draft', 'in_progress', 'completed'],
  {
    message: "Statut de session sport invalide",
  }
);

export const sportExerciseTypeSchema = z.enum(
  ['cardio', 'musculation', 'flexibility', 'other'],
  {
    message: "Type d'exercice sport invalide",
  }
);

export const sportSessionSchema = z.object({
  name: z.string().min(3, 'Nom requis (min 3 caractères)'),
  date: z.date(),
  type: sportSessionTypeSchema,
  status: sportSessionStatusSchema,
  objectives: z.string().max(500, 'Objectifs trop longs (max 500 caractères)').optional(),
  notes: z.string().max(1000, 'Notes trop longues (max 1000 caractères)').optional(),
  rpe_score: z.number().min(1).max(10).optional(),
  pain_level: z.number().min(1).max(10).optional(),
  duration_minutes: z.number().min(1).max(480), // max 8h
});

export const sportExerciseSchema = z.object({
  name: z.string().min(2, 'Nom requis (min 2 caractères)'),
  exercise_type: sportExerciseTypeSchema,
  sets: z.number().min(0).max(100).optional(),
  reps: z.number().min(0).max(1000).optional(),
  weight_kg: z.number().min(0).max(1000).optional(),
  duration_seconds: z.number().min(0).max(3600).optional(), // max 1h
  rest_seconds: z.number().min(0).max(600).optional(), // max 10min
  order_index: z.number().min(0),
  notes: z.string().max(500, 'Notes trop longues (max 500 caractères)').optional(),
});

// Fonctions de mapping entre types Supabase et Application
export const mapSupabaseSportSessionToSportSession = (
  supabaseSession: SupabaseSportSession
): SportSession => ({
  id: supabaseSession.id,
  user_id: supabaseSession.user_id,
  name: supabaseSession.name,
  date: new Date(supabaseSession.date),
  type: supabaseSession.type,
  status: supabaseSession.status,
  objectives: supabaseSession.objectives,
  notes: supabaseSession.notes,
  rpe_score: supabaseSession.rpe_score,
  pain_level: supabaseSession.pain_level,
  duration_minutes: supabaseSession.duration_minutes,
  created_at: supabaseSession.created_at,
  updated_at: supabaseSession.updated_at,
});

export const mapSupabaseSportExerciseToSportExercise = (
  supabaseExercise: SupabaseSportExercise
): SportExercise => ({
  id: supabaseExercise.id,
  session_id: supabaseExercise.session_id,
  name: supabaseExercise.name,
  exercise_type: supabaseExercise.exercise_type,
  sets: supabaseExercise.sets,
  reps: supabaseExercise.reps,
  weight_kg: supabaseExercise.weight_kg,
  duration_seconds: supabaseExercise.duration_seconds,
  rest_seconds: supabaseExercise.rest_seconds,
  order_index: supabaseExercise.order_index,
  notes: supabaseExercise.notes,
  created_at: supabaseExercise.created_at,
  updated_at: supabaseExercise.updated_at,
});

// Types pour les filtres d'historique
export interface HistoryFilters {
  startDate?: Date;
  endDate?: Date;
  type?: SportSessionType;
  status?: SportSessionStatus;
  search?: string;
  offset: number;
  limit: number;
}

// Types pour les filtres d'export
export interface ExportFilters {
  startDate?: Date;
  endDate?: Date;
  type?: SportSessionType;
  status?: SportSessionStatus;
  includePersonalData: boolean;
  format: 'csv' | 'pdf';
}

// Types pour les hooks spécialisés
export interface UseSportHistoryReturn {
  sessions: SportSession[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseSportStatsReturn {
  stats: SportStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseSportExportReturn {
  exportCSV: (filters: ExportFilters) => Promise<void>;
  exportPDF: (filters: ExportFilters) => Promise<void>;
  isExporting: boolean;
}

// Types pour les options de sélection
export interface SportSessionTypeOption {
  value: SportSessionType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const SPORT_SESSION_TYPE_OPTIONS: SportSessionTypeOption[] = [
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
    value: 'flexibility',
    label: 'Flexibilité',
    icon: 'Flex',
    color: 'text-green-500',
    description: 'Yoga, stretching',
  },
  {
    value: 'other',
    label: 'Autre',
    icon: 'MoreHorizontal',
    color: 'text-gray-500',
    description: 'Activité personnalisée',
  },
];

// Types pour les graphiques
export interface ChartConfig {
  progression: {
    type: 'line';
    dataKey: string;
    xAxis: string;
    yAxis: string;
    color: string;
  };
  types: {
    type: 'pie';
    dataKey: string;
    nameKey: string;
    colors: string[];
  };
  rpe: {
    type: 'bar';
    dataKey: string;
    xAxis: string;
    yAxis: string;
    color: string;
  };
}

export const CHART_CONFIG: ChartConfig = {
  progression: {
    type: 'line',
    dataKey: 'sessions_count',
    xAxis: 'month',
    yAxis: 'Séances',
    color: '#2563EB',
  },
  types: {
    type: 'pie',
    dataKey: 'count',
    nameKey: 'type',
    colors: ['#2563EB', '#059669', '#7C3AED', '#F59E0B'],
  },
  rpe: {
    type: 'bar',
    dataKey: 'average_rpe',
    xAxis: 'week',
    yAxis: 'RPE Moyen',
    color: '#7C3AED',
  },
};

// Types pour les erreurs
export interface SportValidationError {
  field: string;
  message: string;
}

export interface SportFormError {
  field: keyof SportSession;
  message: string;
}

// Types pour les états de chargement
export interface SportFormState {
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  errors: SportFormError[];
}

// Types pour la pagination
export interface SportPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedSportSessions {
  sessions: SportSession[];
  pagination: SportPagination;
}

// Types pour les métriques de performance
export interface SportPerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  errorRate: number;
}

// Types pour les notifications
export interface SportNotification {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Types pour les actions utilisateur
export interface SportAction {
  type: 'create' | 'update' | 'delete' | 'export';
  target: 'session' | 'exercise' | 'stats';
  data?: any;
  timestamp: Date;
}

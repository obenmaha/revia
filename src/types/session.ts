// Types spécialisés pour les sessions - Story 2.2
import { z } from 'zod';

// Interface principale Session
export interface Session {
  id: string;
  userId: string;
  name: string;
  date: Date;
  type: SessionType;
  status: SessionStatus;
  objectives?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types d'activité
export type SessionType = 'rehabilitation' | 'sport' | 'fitness' | 'other';

// Statuts de session
export type SessionStatus = 'draft' | 'in_progress' | 'completed';

// Interface pour la création de session
export interface CreateSessionInput {
  name: string;
  date: Date;
  type: SessionType;
  objectives?: string;
  notes?: string;
}

// Interface pour la mise à jour de session
export interface UpdateSessionInput extends Partial<CreateSessionInput> {
  id: string;
  status?: SessionStatus;
}

// Types Supabase (snake_case)
export interface SupabaseSession {
  id: string;
  user_id: string;
  name: string;
  date: string;
  type: SessionType;
  status: SessionStatus;
  objectives?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Schémas de validation Zod
export const sessionTypeSchema = z.enum(
  ['rehabilitation', 'sport', 'fitness', 'other'],
  {
    errorMap: () => ({
      message: "Type d'activité invalide",
    }),
  }
);

export const sessionStatusSchema = z.enum(
  ['draft', 'in_progress', 'completed'],
  {
    errorMap: () => ({
      message: 'Statut de session invalide',
    }),
  }
);

export const sessionSchema = z.object({
  name: z.string().min(3, 'Nom requis (min 3 caractères)'),
  date: z
    .date()
    .refine(date => date > new Date(), 'Date dans le futur requise')
    .refine(
      date => date <= new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      'Date trop éloignée (max 1 an)'
    ),
  type: sessionTypeSchema,
  objectives: z
    .string()
    .max(500, 'Objectifs trop longs (max 500 caractères)')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes trop longues (max 1000 caractères)')
    .optional(),
});

export const createSessionSchema = sessionSchema;
export const updateSessionSchema = z.object({
  id: z.string().uuid('ID session invalide'),
  name: z.string().min(3, 'Nom requis (min 3 caractères)').optional(),
  date: z
    .date()
    .refine(date => date > new Date(), 'Date dans le futur requise')
    .refine(
      date => date <= new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      'Date trop éloignée (max 1 an)'
    )
    .optional(),
  type: sessionTypeSchema.optional(),
  objectives: z
    .string()
    .max(500, 'Objectifs trop longs (max 500 caractères)')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes trop longues (max 1000 caractères)')
    .optional(),
  status: sessionStatusSchema.optional(),
});

// Fonctions de mapping entre types Supabase et Application
export const mapSupabaseSessionToSession = (
  supabaseSession: SupabaseSession
): Session => ({
  id: supabaseSession.id,
  userId: supabaseSession.user_id,
  name: supabaseSession.name,
  date: new Date(supabaseSession.date),
  type: supabaseSession.type,
  status: supabaseSession.status,
  objectives: supabaseSession.objectives,
  notes: supabaseSession.notes,
  createdAt: new Date(supabaseSession.created_at),
  updatedAt: new Date(supabaseSession.updated_at),
});

export const mapSessionToSupabaseSession = (
  session: Partial<Session>
): Partial<SupabaseSession> => ({
  id: session.id,
  user_id: session.userId,
  name: session.name,
  date: session.date?.toISOString(),
  type: session.type,
  status: session.status,
  objectives: session.objectives,
  notes: session.notes,
  created_at: session.createdAt?.toISOString(),
  updated_at: session.updatedAt?.toISOString(),
});

// Types pour les erreurs de validation
export interface SessionValidationError {
  field: string;
  message: string;
}

export interface SessionFormError {
  field: keyof CreateSessionInput;
  message: string;
}

// Types pour les états de chargement
export interface SessionFormState {
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  errors: SessionFormError[];
}

// Types pour les hooks
export interface UseSessionReturn {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  updateSession: (updates: Partial<Session>) => Promise<void>;
  deleteSession: () => Promise<void>;
  refetch: () => void;
}

export interface UseSessionsReturn {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  createSession: (sessionData: CreateSessionInput) => Promise<Session>;
  refetch: () => void;
}

export interface UseSessionFormReturn {
  formData: CreateSessionInput;
  formState: SessionFormState;
  updateField: <K extends keyof CreateSessionInput>(
    field: K,
    value: CreateSessionInput[K]
  ) => void;
  validateField: (field: keyof CreateSessionInput) => SessionValidationError[];
  saveSession: () => Promise<Session>;
  resetForm: () => void;
}

// Types pour les options de sélection
export interface SessionTypeOption {
  value: SessionType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const SESSION_TYPE_OPTIONS: SessionTypeOption[] = [
  {
    value: 'rehabilitation',
    label: 'Rééducation',
    icon: 'HeartPulse',
    color: 'text-blue-500',
    description: 'Blessure, récupération, thérapie',
  },
  {
    value: 'sport',
    label: 'Sport',
    icon: 'Trophy',
    color: 'text-green-500',
    description: 'Entraînement, compétition',
  },
  {
    value: 'fitness',
    label: 'Fitness',
    icon: 'Dumbbell',
    color: 'text-orange-500',
    description: 'Musculation, cardio',
  },
  {
    value: 'other',
    label: 'Autre',
    icon: 'MoreHorizontal',
    color: 'text-gray-500',
    description: 'Activité personnalisée',
  },
];

// Types pour les statistiques de sessions
export interface SessionStats {
  totalSessions: number;
  sessionsThisMonth: number;
  sessionsThisYear: number;
  completedSessions: number;
  inProgressSessions: number;
  draftSessions: number;
  averageSessionsPerWeek: number;
  mostCommonType: SessionType | null;
}

// Types pour les filtres de sessions
export interface SessionFilters {
  type?: SessionType;
  status?: SessionStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

// Types pour la pagination des sessions
export interface SessionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedSessions {
  sessions: Session[];
  pagination: SessionPagination;
}

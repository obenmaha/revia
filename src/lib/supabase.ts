import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import type { Database } from '../types/supabase-generated';

// Types pour les données complexes
export interface Address {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface MedicalInfo {
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

export interface SessionObjectives {
  goals?: string[];
  focus?: string[];
  notes?: string;
}

export interface SessionExercises {
  name: string;
  description?: string;
  repetitions?: number;
  sets?: number;
  duration?: number;
}

export interface SessionEvaluation {
  painLevel?: number;
  mobility?: number;
  strength?: number;
  notes?: string;
  nextSteps?: string[];
}

// Types Supabase basés sur les migrations réelles
export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          date: string;
          type: 'rehabilitation' | 'sport' | 'fitness' | 'other';
          status: 'draft' | 'in_progress' | 'completed';
          objectives: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          date: string;
          type: 'rehabilitation' | 'sport' | 'fitness' | 'other';
          status?: 'draft' | 'in_progress' | 'completed';
          objectives?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          date?: string;
          type?: 'rehabilitation' | 'sport' | 'fitness' | 'other';
          status?: 'draft' | 'in_progress' | 'completed';
          objectives?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          duration: number;
          intensity: number;
          weight: number | null;
          sets: number | null;
          reps: number | null;
          notes: string | null;
          exercise_type: 'cardio' | 'musculation' | 'etirement' | 'autre';
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
          duration: number;
          intensity: number;
          weight?: number | null;
          sets?: number | null;
          reps?: number | null;
          notes?: string | null;
          exercise_type: 'cardio' | 'musculation' | 'etirement' | 'autre';
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          name?: string;
          duration?: number;
          intensity?: number;
          weight?: number | null;
          sets?: number | null;
          reps?: number | null;
          notes?: string | null;
          exercise_type?: 'cardio' | 'musculation' | 'etirement' | 'autre';
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_session_stats: {
        Args: { user_uuid: string };
        Returns: unknown;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Configuration Supabase
const supabaseUrl = env.supabase.url;
const supabaseAnonKey = env.supabase.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Variables d'environnement Supabase manquantes");
}

// Client Supabase avec types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Types utilitaires
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

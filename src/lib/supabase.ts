import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

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

// Types Supabase générés automatiquement
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: 'PRACTITIONER' | 'ADMIN';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          role?: 'PRACTITIONER' | 'ADMIN';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: 'PRACTITIONER' | 'ADMIN';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          practitioner_id: string;
          first_name: string;
          last_name: string;
          birth_date: string;
          phone?: string;
          email?: string;
          address?: Address;
          medical_info?: MedicalInfo;
          emergency_contact?: EmergencyContact;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          practitioner_id: string;
          first_name: string;
          last_name: string;
          birth_date: string;
          phone?: string;
          email?: string;
          address?: Address;
          medical_info?: MedicalInfo;
          emergency_contact?: EmergencyContact;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          practitioner_id?: string;
          first_name?: string;
          last_name?: string;
          birth_date?: string;
          phone?: string;
          email?: string;
          address?: Address;
          medical_info?: MedicalInfo;
          emergency_contact?: EmergencyContact;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          patient_id: string;
          practitioner_id: string;
          scheduled_at: string;
          duration: number;
          status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
          notes?: string;
          objectives?: SessionObjectives;
          exercises?: SessionExercises;
          evaluation?: SessionEvaluation;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          practitioner_id: string;
          scheduled_at: string;
          duration: number;
          status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
          notes?: string;
          objectives?: SessionObjectives;
          exercises?: SessionExercises;
          evaluation?: SessionEvaluation;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          practitioner_id?: string;
          scheduled_at?: string;
          duration?: number;
          status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
          notes?: string;
          objectives?: SessionObjectives;
          exercises?: SessionExercises;
          evaluation?: SessionEvaluation;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          patient_id: string;
          practitioner_id: string;
          invoice_number: string;
          amount: number;
          status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
          due_date: string;
          paid_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          practitioner_id: string;
          invoice_number: string;
          amount: number;
          status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
          due_date: string;
          paid_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          practitioner_id?: string;
          invoice_number?: string;
          amount?: number;
          status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
          due_date?: string;
          paid_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          amount: number;
          method: string;
          reference?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          amount: number;
          method: string;
          reference?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          amount?: number;
          method?: string;
          reference?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
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

/**
 * Types Supabase générés automatiquement
 *
 * IMPORTANT: Ce fichier contient des types de base.
 * Pour une génération complète, utilisez:
 *   npm run types:generate
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
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
          phone: string | null;
          email: string | null;
          address: Json | null;
          medical_info: Json | null;
          emergency_contact: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          practitioner_id: string;
          first_name: string;
          last_name: string;
          birth_date: string;
          phone?: string | null;
          email?: string | null;
          address?: Json | null;
          medical_info?: Json | null;
          emergency_contact?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          practitioner_id?: string;
          first_name?: string;
          last_name?: string;
          birth_date?: string;
          phone?: string | null;
          email?: string | null;
          address?: Json | null;
          medical_info?: Json | null;
          emergency_contact?: Json | null;
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
          notes: string | null;
          objectives: Json | null;
          exercises: Json | null;
          evaluation: Json | null;
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
          notes?: string | null;
          objectives?: Json | null;
          exercises?: Json | null;
          evaluation?: Json | null;
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
          notes?: string | null;
          objectives?: Json | null;
          exercises?: Json | null;
          evaluation?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          description: string | null;
          sets: number | null;
          reps: number | null;
          duration: number | null;
          notes: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
          description?: string | null;
          sets?: number | null;
          reps?: number | null;
          duration?: number | null;
          notes?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          name?: string;
          description?: string | null;
          sets?: number | null;
          reps?: number | null;
          duration?: number | null;
          notes?: string | null;
          order_index?: number;
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
          paid_at: string | null;
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
          paid_at?: string | null;
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
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          amount: number;
          payment_method: string;
          payment_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          amount: number;
          payment_method: string;
          payment_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          amount?: number;
          payment_method?: string;
          payment_date?: string;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          patient_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          mime_type?: string;
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
      user_role: 'PRACTITIONER' | 'ADMIN';
      session_status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
      invoice_status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
    };
  };
}

// Types de convenance
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

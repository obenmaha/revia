// Types Supabase corrigés pour App-Kine
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          patient_id: string;
          filename: string;
          file_path: string;
          file_type: string;
          file_size: number;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          filename: string;
          file_path: string;
          file_type: string;
          file_size: number;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          filename?: string;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          category?: string | null;
          created_at?: string;
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
          medical_history: Json | null;
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
          medical_history?: Json | null;
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
          medical_history?: Json | null;
          emergency_contact?: Json | null;
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
          reference: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          amount: number;
          method: string;
          reference?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          amount?: number;
          method?: string;
          reference?: string | null;
          created_at?: string;
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
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
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
          password_hash: string;
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
          password_hash?: string;
          first_name?: string;
          last_name?: string;
          role?: 'PRACTITIONER' | 'ADMIN';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profile: {
        Row: {
          id: string;
          user_id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          birth_date: string | null;
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          height_cm: number | null;
          weight_kg: number | null;
          fitness_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
          goals: Json | null;
          preferences: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          fitness_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
          goals?: Json | null;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          fitness_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
          goals?: Json | null;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          email_enabled: boolean;
          push_enabled: boolean;
          reminder_time: string;
          reminder_days: number[];
          reminder_frequency: 'daily' | 'twice_weekly' | 'weekly';
          last_reminded_at: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_enabled?: boolean;
          push_enabled?: boolean;
          reminder_time?: string;
          reminder_days?: number[];
          reminder_frequency?: 'daily' | 'twice_weekly' | 'weekly';
          last_reminded_at?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_enabled?: boolean;
          push_enabled?: boolean;
          reminder_time?: string;
          reminder_days?: number[];
          reminder_frequency?: 'daily' | 'twice_weekly' | 'weekly';
          last_reminded_at?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notification_logs: {
        Row: {
          id: string;
          user_id: string;
          type: 'email_reminder' | 'push_notification' | 'in_app';
          sent_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'email_reminder' | 'push_notification' | 'in_app';
          sent_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'email_reminder' | 'push_notification' | 'in_app';
          sent_at?: string;
          metadata?: Json;
        };
      };
      sport_sessions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          date: string;
          type: 'cardio' | 'musculation' | 'flexibility' | 'other';
          status: 'draft' | 'in_progress' | 'completed';
          objectives: string | null;
          notes: string | null;
          rpe_score: number | null;
          pain_level: number | null;
          duration_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          date: string;
          type: 'cardio' | 'musculation' | 'flexibility' | 'other';
          status?: 'draft' | 'in_progress' | 'completed';
          objectives?: string | null;
          notes?: string | null;
          rpe_score?: number | null;
          pain_level?: number | null;
          duration_minutes: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          date?: string;
          type?: 'cardio' | 'musculation' | 'flexibility' | 'other';
          status?: 'draft' | 'in_progress' | 'completed';
          objectives?: string | null;
          notes?: string | null;
          rpe_score?: number | null;
          pain_level?: number | null;
          duration_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      sport_exercises: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          exercise_type: 'cardio' | 'musculation' | 'flexibility' | 'other';
          sets: number | null;
          reps: number | null;
          weight_kg: number | null;
          duration_seconds: number | null;
          rest_seconds: number | null;
          order_index: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
          exercise_type: 'cardio' | 'musculation' | 'flexibility' | 'other';
          sets?: number | null;
          reps?: number | null;
          weight_kg?: number | null;
          duration_seconds?: number | null;
          rest_seconds?: number | null;
          order_index: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          name?: string;
          exercise_type?: 'cardio' | 'musculation' | 'flexibility' | 'other';
          sets?: number | null;
          reps?: number | null;
          weight_kg?: number | null;
          duration_seconds?: number | null;
          rest_seconds?: number | null;
          order_index?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
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
      invoice_status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
      session_status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
      user_role: 'PRACTITIONER' | 'ADMIN';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Types d'aide pour l'utilisation
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
        Database['public']['Views'])
    ? (Database['public']['Tables'] &
        Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never;

// Types d'aide pour les relations
export type Patient = Tables<'patients'>;
export type Session = Tables<'sessions'>;
export type Invoice = Tables<'invoices'>;
export type User = Tables<'users'>;
export type Document = Tables<'documents'>;
export type Payment = Tables<'payments'>;
export type UserProfile = Tables<'user_profile'>;
export type NotificationPreferences = Tables<'notification_preferences'>;
export type NotificationLog = Tables<'notification_logs'>;

export type PatientInsert = TablesInsert<'patients'>;
export type SessionInsert = TablesInsert<'sessions'>;
export type InvoiceInsert = TablesInsert<'invoices'>;
export type UserInsert = TablesInsert<'users'>;
export type DocumentInsert = TablesInsert<'documents'>;
export type PaymentInsert = TablesInsert<'payments'>;
export type UserProfileInsert = TablesInsert<'user_profile'>;
export type NotificationPreferencesInsert = TablesInsert<'notification_preferences'>;
export type NotificationLogInsert = TablesInsert<'notification_logs'>;

export type PatientUpdate = TablesUpdate<'patients'>;
export type SessionUpdate = TablesUpdate<'sessions'>;
export type InvoiceUpdate = TablesUpdate<'invoices'>;
export type UserUpdate = TablesUpdate<'users'>;
export type DocumentUpdate = TablesUpdate<'documents'>;
export type PaymentUpdate = TablesUpdate<'payments'>;
export type UserProfileUpdate = TablesUpdate<'user_profile'>;
export type NotificationPreferencesUpdate = TablesUpdate<'notification_preferences'>;
export type NotificationLogUpdate = TablesUpdate<'notification_logs'>;

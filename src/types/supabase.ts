// Types Supabase pour Sport MVP
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
      // Tables Sport MVP
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
          duration_minutes: number | null;
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
          duration_minutes?: number | null;
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
          duration_minutes?: number | null;
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
          order_index?: number;
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
      // Tables utilisateur
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: 'practitioner' | 'admin';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          role?: 'practitioner' | 'admin';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: 'practitioner' | 'admin';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Tables notifications (FR9)
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          email_enabled: boolean;
          push_enabled: boolean;
          reminder_time: string;
          reminder_days: number[];
          reminder_frequency: 'daily' | 'weekly' | 'monthly';
          last_reminded_at: string | null;
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
          reminder_frequency?: 'daily' | 'weekly' | 'monthly';
          last_reminded_at?: string | null;
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
          reminder_frequency?: 'daily' | 'weekly' | 'monthly';
          last_reminded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notification_logs: {
        Row: {
          id: string;
          user_id: string;
          type: 'email_reminder' | 'push_notification' | 'in_app';
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'email_reminder' | 'push_notification' | 'in_app';
          metadata: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'email_reminder' | 'push_notification' | 'in_app';
          metadata?: Json;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_sport_stats: {
        Args: {
          user_uuid: string;
          period_days?: number;
        };
        Returns: Json;
      };
      get_rpe_trend: {
        Args: {
          user_uuid: string;
          period_days: number;
          window_days: number;
        };
        Returns: Json;
      };
      should_send_reminder: {
        Args: {
          p_user_id: string;
        };
        Returns: boolean;
      };
      log_notification_sent: {
        Args: {
          p_user_id: string;
          p_type: string;
          p_metadata: Json;
        };
        Returns: void;
      };
    };
    Enums: {
      sport_session_type: 'cardio' | 'musculation' | 'flexibility' | 'other';
      sport_session_status: 'draft' | 'in_progress' | 'completed';
      sport_exercise_type: 'cardio' | 'musculation' | 'flexibility' | 'other';
    };
  };
};

// Types de convenance
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Types spécifiques pour les tables principales
export type User = Tables<'users'>;
export type SportSession = Tables<'sport_sessions'>;
export type SportExercise = Tables<'sport_exercises'>;
export type NotificationPreferences = Tables<'notification_preferences'>;
export type NotificationLog = Tables<'notification_logs'>;
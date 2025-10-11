import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (
    userData: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Internal
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            // Récupérer les données utilisateur complètes
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (userError) {
              set({ isLoading: false });
              return { success: false, error: userError.message };
            }

            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: 'Erreur de connexion' };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          };
        }
      },

      signUp: async (
        email: string,
        password: string,
        userData: Partial<User>
      ) => {
        set({ isLoading: true });

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            // Créer le profil utilisateur
            const { error: profileError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email!,
                first_name: userData.firstName || '',
                last_name: userData.lastName || '',
                role: 'practitioner',
                is_active: true,
              });

            if (profileError) {
              set({ isLoading: false });
              return { success: false, error: profileError.message };
            }

            set({ isLoading: false });
            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: "Erreur lors de l'inscription" };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          };
        }
      },

      signOut: async () => {
        set({ isLoading: true });

        try {
          await supabase.auth.signOut();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
          set({ isLoading: false });
        }
      },

      updateUser: async (userData: Partial<User>) => {
        const { user } = get();
        if (!user) return { success: false, error: 'Utilisateur non connecté' };

        set({ isLoading: true });

        try {
          const { error } = await supabase
            .from('users')
            .update({
              first_name: userData.firstName,
              last_name: userData.lastName,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
          }

          // Mettre à jour l'état local
          set({
            user: { ...user, ...userData },
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          };
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true });

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email);

          set({ isLoading: false });

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          };
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

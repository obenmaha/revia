import { supabase } from '../lib/supabase';
import type { User, LoginForm, RegisterForm } from '../types';
import { mapSupabaseUserToUser, mapUserToSupabaseUser } from '../types';

class AuthService {
  // Connexion avec email et mot de passe
  static async signIn(credentials: LoginForm) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      // Récupérer les données utilisateur complètes
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        throw new Error(userError.message);
      }

      return {
        user: mapSupabaseUserToUser(userData),
        session: data.session,
      };
    }

    throw new Error('Erreur de connexion');
  }

  // Inscription avec email et mot de passe
  static async signUp(userData: RegisterForm) {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      // Créer le profil utilisateur
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email!,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'PRACTITIONER' as const,
        is_active: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      if (profileError) {
        throw new Error(profileError.message);
      }

      return {
        user: data.user,
        session: data.session,
      };
    }

    throw new Error("Erreur lors de l'inscription");
  }

  // Déconnexion
  static async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  // Réinitialisation du mot de passe
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Mise à jour du profil utilisateur
  static async updateProfile(userId: string, updates: Partial<User>) {
    const supabaseUpdates = mapUserToSupabaseUser(updates);

    const { data, error } = await supabase
      .from('users')
      // @ts-expect-error - Types Supabase temporairement ignorés
      .update(supabaseUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapSupabaseUserToUser(data);
  }

  // Obtenir l'utilisateur actuel
  static async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      return null;
    }

    // Récupérer les données utilisateur complètes
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    return mapSupabaseUserToUser(userData);
  }

  // Écouter les changements d'authentification
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const user = await this.getCurrentUser();
          callback(user);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération de l'utilisateur:",
            error
          );
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
}

// Export des méthodes statiques
export const authService = {
  signIn: AuthService.signIn,
  signUp: AuthService.signUp,
  signOut: AuthService.signOut,
  resetPassword: AuthService.resetPassword,
  updateProfile: AuthService.updateProfile,
  getCurrentUser: AuthService.getCurrentUser,
  onAuthStateChange: AuthService.onAuthStateChange,
};

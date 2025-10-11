import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { queryKeys } from '../lib/query-client';
import type { LoginForm, RegisterForm, User } from '../types';
import { mapSupabaseUserToUser } from '../types';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setUser, setLoading } = useAuthStore();

  // Query pour l'utilisateur actuel
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated,
    retry: false,
  });

  // Mutation de connexion
  const loginMutation = useMutation({
    mutationFn: authService.signIn,
    onSuccess: data => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedUser = mapSupabaseUserToUser(data.user as any);
      setUser(mappedUser);
      queryClient.setQueryData(queryKeys.currentUser, mappedUser);
    },
    onError: error => {
      console.error('Erreur de connexion:', error);
    },
  });

  // Mutation d'inscription
  const registerMutation = useMutation({
    mutationFn: authService.signUp,
    onSuccess: async data => {
      if (data.user) {
        // Récupérer les données de profil depuis la table users
        const { data: profileData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileData && !error) {
          const mappedUser = mapSupabaseUserToUser(profileData);
          setUser(mappedUser);
          queryClient.setQueryData(queryKeys.currentUser, mappedUser);
        }
      }
    },
    onError: error => {
      console.error("Erreur d'inscription:", error);
    },
  });

  // Mutation de déconnexion
  const logoutMutation = useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
    },
    onError: error => {
      console.error('Erreur de déconnexion:', error);
    },
  });

  // Mutation de réinitialisation de mot de passe
  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onError: error => {
      console.error('Erreur de réinitialisation:', error);
    },
  });

  // Mutation de mise à jour du profil
  const updateProfileMutation = useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<User>;
    }) => authService.updateProfile(userId, updates),
    onSuccess: updatedUser => {
      setUser(updatedUser);
      queryClient.setQueryData(queryKeys.currentUser, updatedUser);
    },
    onError: error => {
      console.error('Erreur de mise à jour du profil:', error);
    },
  });

  // Fonctions d'action
  const login = async (credentials: LoginForm) => {
    setLoading(true);
    try {
      await loginMutation.mutateAsync(credentials);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterForm) => {
    setLoading(true);
    try {
      await registerMutation.mutateAsync(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await resetPasswordMutation.mutateAsync(email);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('Utilisateur non connecté');
    await updateProfileMutation.mutateAsync({ userId: user.id, updates });
  };

  return {
    // État
    user: currentUser || user,
    isAuthenticated,
    isLoading:
      isLoadingUser ||
      loginMutation.isPending ||
      registerMutation.isPending ||
      logoutMutation.isPending,

    // Actions
    login,
    register,
    logout,
    resetPassword,
    updateProfile,

    // États des mutations
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,

    // Erreurs
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
    resetPasswordError: resetPasswordMutation.error,
    updateProfileError: updateProfileMutation.error,
  };
}

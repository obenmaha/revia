// Hook pour la gestion du profil utilisateur - Story FR1
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/query-client';
import type { Database } from '../types/supabase';

type UserProfile = Database['public']['Tables']['user_profile']['Row'];
type UserProfileInsert = Database['public']['Tables']['user_profile']['Insert'];
type UserProfileUpdate = Database['public']['Tables']['user_profile']['Update'];

export interface UserProfileFormData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height_cm?: number;
  weight_kg?: number;
  fitness_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  goals?: {
    primary_goal?: string;
    secondary_goals?: string[];
    target_weight?: number;
    target_date?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email?: boolean;
      push?: boolean;
      reminders?: boolean;
      achievements?: boolean;
    };
    units?: {
      weight?: 'kg' | 'lbs';
      height?: 'cm' | 'ft';
      distance?: 'km' | 'miles';
    };
    privacy?: {
      profile_visibility?: 'public' | 'private' | 'friends';
      activity_sharing?: boolean;
    };
  };
}

export interface UseUserProfileReturn {
  // État
  profile: UserProfile | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;

  // Actions
  updateProfile: (data: UserProfileFormData) => Promise<void>;
  createProfile: (data: UserProfileFormData) => Promise<void>;
  deleteProfile: () => Promise<void>;

  // États des mutations
  isUpdating: boolean;
  isCreating: boolean;
  isDeleting: boolean;

  // Erreurs des mutations
  updateError: Error | null;
  createError: Error | null;
  deleteError: Error | null;

  // Refetch
  refetch: () => void;
}

export function useUserProfile(userId?: string): UseUserProfileReturn {
  const queryClient = useQueryClient();

  // Query pour récupérer le profil utilisateur
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Pas de profil trouvé, retourner null
          return null;
        }
        throw error;
      }

      return data;
    },
    enabled: !!userId,
    retry: false,
  });

  // Mutation pour créer un profil
  const createProfileMutation = useMutation({
    mutationFn: async (data: UserProfileFormData) => {
      if (!userId) throw new Error('ID utilisateur requis');

      const profileData: UserProfileInsert = {
        user_id: userId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        birth_date: data.birth_date,
        gender: data.gender,
        height_cm: data.height_cm,
        weight_kg: data.weight_kg,
        fitness_level: data.fitness_level,
        goals: data.goals || {},
        preferences: data.preferences || {},
      };

      const { data: result, error } = await supabase
        .from('user_profile')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (newProfile) => {
      queryClient.setQueryData(queryKeys.userProfile(userId), newProfile);
    },
    onError: (error) => {
      console.error('Erreur lors de la création du profil:', error);
    },
  });

  // Mutation pour mettre à jour un profil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UserProfileFormData) => {
      if (!userId) throw new Error('ID utilisateur requis');
      if (!profile) throw new Error('Profil non trouvé');

      const updateData: UserProfileUpdate = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        birth_date: data.birth_date,
        gender: data.gender,
        height_cm: data.height_cm,
        weight_kg: data.weight_kg,
        fitness_level: data.fitness_level,
        goals: data.goals,
        preferences: data.preferences,
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('user_profile')
        .update(updateData)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(queryKeys.userProfile(userId), updatedProfile);
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du profil:', error);
    },
  });

  // Mutation pour supprimer un profil
  const deleteProfileMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('ID utilisateur requis');
      if (!profile) throw new Error('Profil non trouvé');

      const { error } = await supabase
        .from('user_profile')
        .delete()
        .eq('id', profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.userProfile(userId), null);
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression du profil:', error);
    },
  });

  // Fonctions d'action
  const createProfile = async (data: UserProfileFormData) => {
    await createProfileMutation.mutateAsync(data);
  };

  const updateProfile = async (data: UserProfileFormData) => {
    if (profile) {
      await updateProfileMutation.mutateAsync(data);
    } else {
      await createProfile(data);
    }
  };

  const deleteProfile = async () => {
    await deleteProfileMutation.mutateAsync();
  };

  return {
    // État
    profile,
    isLoading,
    isError,
    error: error?.message || null,

    // Actions
    createProfile,
    updateProfile,
    deleteProfile,

    // États des mutations
    isUpdating: updateProfileMutation.isPending,
    isCreating: createProfileMutation.isPending,
    isDeleting: deleteProfileMutation.isPending,

    // Erreurs des mutations
    updateError: updateProfileMutation.error,
    createError: createProfileMutation.error,
    deleteError: deleteProfileMutation.error,

    // Refetch
    refetch,
  };
}

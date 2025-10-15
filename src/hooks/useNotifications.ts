// Hook pour la gestion des notifications - FR9
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/query-client';
import { useAppStore } from '../stores/appStore';

// Types pour les notifications
export interface NotificationPreferences {
  id?: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  reminder_time: string;
  reminder_days: number[];
  reminder_frequency: 'daily' | 'twice_weekly' | 'weekly';
  last_reminded_at?: string;
  timezone: string;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  type: 'email_reminder' | 'push_notification' | 'in_app';
  sent_at: string;
  metadata: Record<string, any>;
}

export interface UseNotificationsReturn {
  // État des préférences
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;

  // État des permissions
  permission: NotificationPermission;
  isSupported: boolean;

  // Actions
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  requestPermission: () => Promise<boolean>;
  scheduleLocalReminder: (title: string, options?: NotificationOptions) => Promise<void>;
  cancelReminder: (id: string) => void;
  cancelAllReminders: () => void;

  // États des mutations
  isUpdating: boolean;
  isRequestingPermission: boolean;

  // Erreurs des mutations
  updateError: Error | null;
  permissionError: Error | null;

  // Refetch
  refetch: () => void;
}

export function useNotifications(userId?: string): UseNotificationsReturn {
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();

  // État local pour les permissions
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<Error | null>(null);

  // Vérifier le support des notifications
  const isSupported = 'Notification' in window;

  // Query pour récupérer les préférences de notifications
  const {
    data: preferences,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.notificationPreferences(userId),
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Pas de préférences trouvées, retourner null
          return null;
        }
        throw error;
      }

      return data as NotificationPreferences;
    },
    enabled: !!userId,
    retry: false,
  });

  // Vérifier les permissions au chargement
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  // Mutation pour mettre à jour les préférences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      if (!userId) throw new Error('ID utilisateur requis');

      const updateData = {
        ...prefs,
        updated_at: new Date().toISOString(),
      };

      if (preferences) {
        // Mise à jour des préférences existantes
        const { data, error } = await supabase
          .from('notification_preferences')
          .update(updateData)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Création de nouvelles préférences
        const { data, error } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: userId,
            ...updateData,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(queryKeys.notificationPreferences(userId), updatedPreferences);
      addNotification({
        type: 'success',
        title: 'Préférences mises à jour',
        message: 'Vos préférences de notifications ont été sauvegardées.',
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      addNotification({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder vos préférences de notifications.',
      });
    },
  });

  // Fonction pour demander la permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setPermissionError(new Error('Les notifications ne sont pas supportées par ce navigateur'));
      return false;
    }

    setIsRequestingPermission(true);
    setPermissionError(null);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        addNotification({
          type: 'success',
          title: 'Notifications activées',
          message: 'Vous recevrez maintenant des rappels pour vos séances.',
        });
        return true;
      } else {
        addNotification({
          type: 'warning',
          title: 'Notifications refusées',
          message: 'Vous ne recevrez pas de rappels. Vous pouvez les activer dans les paramètres de votre navigateur.',
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setPermissionError(new Error(errorMessage));
      addNotification({
        type: 'error',
        title: 'Erreur de permission',
        message: 'Impossible de demander la permission pour les notifications.',
      });
      return false;
    } finally {
      setIsRequestingPermission(false);
    }
  }, [isSupported, addNotification]);

  // Fonction pour programmer un rappel local
  const scheduleLocalReminder = useCallback(async (
    title: string,
    options: NotificationOptions = {}
  ): Promise<void> => {
    if (!isSupported) {
      throw new Error('Les notifications ne sont pas supportées par ce navigateur');
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        throw new Error('Permission refusée pour les notifications');
      }
    }

    // Vérifier les préférences utilisateur
    if (preferences && !preferences.push_enabled) {
      throw new Error('Les notifications push sont désactivées dans vos préférences');
    }

    try {
      const notification = new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'revia-reminder',
        requireInteraction: true,
        ...options,
      });

      // Gérer la fermeture de la notification
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-fermer après 10 secondes si pas d'interaction
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Logger la notification
      if (userId) {
        await supabase.from('notification_logs').insert({
          user_id: userId,
          type: 'push_notification',
          metadata: {
            title,
            options,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }, [isSupported, permission, preferences, requestPermission, userId]);

  // Fonction pour annuler un rappel (par tag)
  const cancelReminder = useCallback((tag: string) => {
    if ('serviceWorker' in navigator && 'getRegistrations' in navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.getNotifications({ tag }).then(notifications => {
            notifications.forEach(notification => notification.close());
          });
        });
      });
    }
  }, []);

  // Fonction pour annuler tous les rappels
  const cancelAllReminders = useCallback(() => {
    if ('serviceWorker' in navigator && 'getRegistrations' in navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.getNotifications().then(notifications => {
            notifications.forEach(notification => notification.close());
          });
        });
      });
    }
  }, []);

  // Fonction pour mettre à jour les préférences
  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    await updatePreferencesMutation.mutateAsync(prefs);
  }, [updatePreferencesMutation]);

  return {
    // État des préférences
    preferences,
    isLoading,
    isError,
    error: error?.message || null,

    // État des permissions
    permission,
    isSupported,

    // Actions
    updatePreferences,
    requestPermission,
    scheduleLocalReminder,
    cancelReminder,
    cancelAllReminders,

    // États des mutations
    isUpdating: updatePreferencesMutation.isPending,
    isRequestingPermission,

    // Erreurs des mutations
    updateError: updatePreferencesMutation.error,
    permissionError,

    // Refetch
    refetch,
  };
}

// Hook utilitaire pour programmer un rappel de séance
export function useScheduleSessionReminder() {
  const { scheduleLocalReminder, preferences, permission } = useNotifications();

  const scheduleSessionReminder = useCallback(async (
    sessionName: string,
    scheduledAt: Date,
    options?: {
      minutesBefore?: number;
      customMessage?: string;
    }
  ) => {
    const { minutesBefore = 15, customMessage } = options || {};
    
    if (!preferences?.push_enabled || permission !== 'granted') {
      throw new Error('Les notifications push ne sont pas activées');
    }

    const reminderTime = new Date(scheduledAt.getTime() - minutesBefore * 60 * 1000);
    const now = new Date();

    if (reminderTime <= now) {
      throw new Error('Le rappel ne peut pas être programmé dans le passé');
    }

    const delay = reminderTime.getTime() - now.getTime();

    setTimeout(async () => {
      try {
        const message = customMessage || `Rappel: Votre séance "${sessionName}" commence dans ${minutesBefore} minutes !`;
        await scheduleLocalReminder(message, {
          body: `Préparez-vous pour votre séance de ${sessionName}`,
          tag: `session-reminder-${scheduledAt.getTime()}`,
        });
      } catch (error) {
        console.error('Erreur lors de l\'envoi du rappel:', error);
      }
    }, delay);

    return {
      reminderTime,
      delay,
      cancelled: false,
    };
  }, [scheduleLocalReminder, preferences, permission]);

  return { scheduleSessionReminder };
}

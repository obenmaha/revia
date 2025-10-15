// Service pour la gestion des notifications - FR9
import { supabase } from '../lib/supabase';
import type { NotificationPreferences, NotificationLog } from '../types/supabase';

export interface NotificationTemplate {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export interface ReminderData {
  sessionName: string;
  scheduledAt: Date;
  userName: string;
  currentStreak?: number;
  timezone?: string;
}

export class NotificationService {
  /**
   * Vérifie le support des notifications dans le navigateur
   */
  static isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Vérifie l'état actuel des permissions
   */
  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Demande la permission pour les notifications
   */
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Les notifications ne sont pas supportées par ce navigateur');
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  /**
   * Programme une notification locale
   */
  static async scheduleLocalNotification(
    template: NotificationTemplate,
    options: NotificationOptions = {}
  ): Promise<Notification> {
    if (!this.isSupported()) {
      throw new Error('Les notifications ne sont pas supportées par ce navigateur');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Permission refusée pour les notifications');
    }

    const notification = new Notification(template.title, {
      icon: template.icon || '/vite.svg',
      badge: template.badge || '/vite.svg',
      tag: template.tag || 'revia-notification',
      requireInteraction: template.requireInteraction ?? true,
      ...options,
    });

    // Auto-fermer après 10 secondes si pas d'interaction
    setTimeout(() => {
      notification.close();
    }, 10000);

    return notification;
  }

  /**
   * Programme un rappel de séance
   */
  static async scheduleSessionReminder(
    reminderData: ReminderData,
    minutesBefore: number = 15
  ): Promise<Notification> {
    const reminderTime = new Date(
      reminderData.scheduledAt.getTime() - minutesBefore * 60 * 1000
    );
    const now = new Date();

    if (reminderTime <= now) {
      throw new Error('Le rappel ne peut pas être programmé dans le passé');
    }

    const delay = reminderTime.getTime() - now.getTime();

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const template: NotificationTemplate = {
            title: `Rappel: ${reminderData.sessionName}`,
            body: `Votre séance commence dans ${minutesBefore} minutes !`,
            tag: `session-reminder-${reminderData.scheduledAt.getTime()}`,
          };

          const notification = await this.scheduleLocalNotification(template);
          resolve(notification);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }

  /**
   * Annule une notification par tag
   */
  static async cancelNotificationByTag(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'getRegistrations' in navigator.serviceWorker) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        for (const registration of registrations) {
          const notifications = await registration.getNotifications({ tag });
          notifications.forEach(notification => notification.close());
        }
      } catch (error) {
        console.error('Erreur lors de l\'annulation de la notification:', error);
      }
    }
  }

  /**
   * Annule toutes les notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    if ('serviceWorker' in navigator && 'getRegistrations' in navigator.serviceWorker) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        for (const registration of registrations) {
          const notifications = await registration.getNotifications();
          notifications.forEach(notification => notification.close());
        }
      } catch (error) {
        console.error('Erreur lors de l\'annulation des notifications:', error);
      }
    }
  }

  /**
   * Récupère les préférences de notifications d'un utilisateur
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Pas de préférences trouvées
      }
      throw error;
    }

    return data;
  }

  /**
   * Met à jour les préférences de notifications
   */
  static async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const updateData = {
      ...preferences,
      updated_at: new Date().toISOString(),
    };

    // Vérifier si des préférences existent déjà
    const existing = await this.getNotificationPreferences(userId);

    if (existing) {
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
  }

  /**
   * Enregistre un log de notification
   */
  static async logNotification(
    userId: string,
    type: 'email_reminder' | 'push_notification' | 'in_app',
    metadata: Record<string, any> = {}
  ): Promise<NotificationLog> {
    const { data, error } = await supabase
      .from('notification_logs')
      .insert({
        user_id: userId,
        type,
        metadata,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Récupère les logs de notifications d'un utilisateur
   */
  static async getNotificationLogs(
    userId: string,
    limit: number = 50
  ): Promise<NotificationLog[]> {
    const { data, error } = await supabase
      .from('notification_logs')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Vérifie si un utilisateur doit recevoir un rappel
   */
  static async shouldSendReminder(userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('should_send_reminder', {
      p_user_id: userId
    });

    if (error) throw error;
    return data;
  }

  /**
   * Récupère les utilisateurs éligibles pour les rappels
   */
  static async getUsersForReminders(): Promise<Array<{
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    reminder_time: string;
    reminder_days: number[];
    reminder_frequency: string;
    timezone: string;
    last_reminded_at: string | null;
  }>> {
    const { data, error } = await supabase.rpc('get_users_for_reminders');

    if (error) throw error;
    return data || [];
  }

  /**
   * Enregistre l'envoi d'un rappel
   */
  static async logReminderSent(
    userId: string,
    type: 'email_reminder' | 'push_notification' | 'in_app',
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const { data, error } = await supabase.rpc('log_notification_sent', {
      p_user_id: userId,
      p_type: type,
      p_metadata: metadata
    });

    if (error) throw error;
    return data;
  }

  /**
   * Génère un template de rappel personnalisé
   */
  static generateReminderTemplate(reminderData: ReminderData): NotificationTemplate {
    const templates = [
      {
        title: `🔥 ${reminderData.sessionName}`,
        body: `Préparez-vous ! Votre séance commence bientôt.`,
      },
      {
        title: `💪 Rappel d'entraînement`,
        body: `${reminderData.sessionName} - C'est parti !`,
      },
      {
        title: `⚡ ${reminderData.sessionName}`,
        body: `Il est temps de bouger ! Votre séance vous attend.`,
      },
    ];

    // Sélectionner un template aléatoire
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Personnaliser avec le streak si disponible
    if (reminderData.currentStreak && reminderData.currentStreak > 0) {
      template.body += ` Streak de ${reminderData.currentStreak} jours !`;
    }

    return {
      ...template,
      tag: `session-reminder-${reminderData.scheduledAt.getTime()}`,
      requireInteraction: true,
    };
  }

  /**
   * Vérifie la compatibilité du navigateur
   */
  static getBrowserCompatibility(): {
    webPush: boolean;
    email: boolean;
    inApp: boolean;
  } {
    return {
      webPush: this.isSupported() && Notification.permission !== 'denied',
      email: true, // Toujours disponible via Edge Functions
      inApp: true, // Toujours disponible
    };
  }
}

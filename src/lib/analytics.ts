/**
 * Analytics wrapper pour PostHog
 * 
 * Ce module fournit une interface sécurisée pour le tracking d'événements
 * avec protection par variables d'environnement et respect de la vie privée.
 * 
 * CONFORMITÉ RGPD :
 * - Aucune donnée personnelle n'est collectée sans consentement explicite
 * - Les événements sont anonymisés par défaut
 * - Possibilité de désactiver complètement via VITE_ANALYTICS_ENABLED=false
 * - Les données sont stockées conformément aux standards de sécurité PostHog
 * 
 * @author Revia Team
 * @version 1.0.0
 */

import posthog from 'posthog-js';

// Configuration PostHog
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';
const ANALYTICS_ENABLED = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
const DEBUG_ANALYTICS = import.meta.env.VITE_DEBUG_ANALYTICS === 'true';

// Types d'événements spécifiques à l'application
export interface AnalyticsEvent {
  // Événements de session
  'session_created': {
    session_type: 'cardio' | 'strength' | 'flexibility' | 'sport';
    has_duplicates: boolean;
    duplicate_type?: 'daily' | 'every-other-day' | 'weekly';
    duplicate_count?: number;
  };
  
  'session_validated': {
    session_id: string;
    exercise_count: number;
    total_duration_minutes: number;
    average_rpe: number;
    has_pain_levels: boolean;
  };
  
  // Événements d'onboarding guest
  'guest_mode_entered': {
    entry_point: 'homepage' | 'login_page' | 'direct_link';
    user_agent: string;
  };
  
  'guest_session_created': {
    session_type: 'cardio' | 'strength' | 'flexibility' | 'sport';
    is_first_session: boolean;
  };
  
  'guest_migration_started': {
    session_count: number;
    exercise_count: number;
    days_since_first_session: number;
  };
  
  'guest_migration_completed': {
    sessions_migrated: number;
    exercises_migrated: number;
    conflicts_resolved: number;
    migration_strategy: 'merge_newest' | 'keep_guest' | 'keep_server' | 'keep_both';
  };
  
  'guest_migration_failed': {
    error_type: string;
    sessions_count: number;
    exercises_count: number;
  };
  
  // Événements d'erreur
  'error_occurred': {
    error_type: 'validation' | 'network' | 'auth' | 'unknown';
    error_message: string;
    component: string;
    user_action?: string;
  };
  
  // Événements de performance
  'page_load': {
    page_name: string;
    load_time_ms: number;
    is_cached: boolean;
  };
}

// Type pour les propriétés utilisateur
export interface UserProperties {
  user_type: 'authenticated' | 'guest';
  app_mode: 'cabinet' | 'sport';
  guest_session_count?: number;
  account_created_at?: string;
  last_activity?: string;
}

// Type pour les propriétés de session
export interface SessionProperties {
  session_id: string;
  is_guest_mode: boolean;
  app_version: string;
  browser: string;
  os: string;
}

class AnalyticsService {
  private isInitialized = false;
  private isEnabled = false;

  constructor() {
    this.isEnabled = ANALYTICS_ENABLED && !!POSTHOG_KEY;
    
    if (this.isEnabled) {
      this.initialize();
    } else if (DEBUG_ANALYTICS) {
      console.log('[Analytics] Désactivé - VITE_ANALYTICS_ENABLED=false ou VITE_POSTHOG_KEY manquant');
    }
  }

  private initialize(): void {
    if (this.isInitialized) return;

    try {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only', // RGPD: profils seulement pour utilisateurs identifiés
        capture_pageview: false, // Désactiver le tracking automatique des pages
        capture_pageleave: false, // Désactiver le tracking de sortie
        disable_session_recording: true, // RGPD: pas d'enregistrement de session
        respect_dnt: true, // Respecter Do Not Track
        opt_out_capturing_by_default: true, // RGPD: opt-out par défaut
        loaded: (posthog) => {
          this.isInitialized = true;
          if (DEBUG_ANALYTICS) {
            console.log('[Analytics] PostHog initialisé avec succès');
          }
        }
      });
    } catch (error) {
      console.error('[Analytics] Erreur lors de l\'initialisation:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Vérifie si l'analytics est disponible et activé
   */
  private isAvailable(): boolean {
    return this.isEnabled && this.isInitialized && typeof posthog !== 'undefined';
  }

  /**
   * Identifie un utilisateur (authentifié uniquement)
   * @param userId - ID unique de l'utilisateur
   * @param properties - Propriétés de l'utilisateur
   */
  identify(userId: string, properties?: UserProperties): void {
    if (!this.isAvailable()) return;

    try {
      posthog.identify(userId, {
        ...properties,
        // Ajouter des métadonnées de conformité RGPD
        analytics_consent: true,
        data_retention_days: 365,
        last_updated: new Date().toISOString()
      });
      
      if (DEBUG_ANALYTICS) {
        console.log('[Analytics] Utilisateur identifié:', userId);
      }
    } catch (error) {
      console.error('[Analytics] Erreur lors de l\'identification:', error);
    }
  }

  /**
   * Envoie un événement avec des propriétés typées
   * @param eventName - Nom de l'événement
   * @param properties - Propriétés de l'événement
   * @param sessionProperties - Propriétés de session (optionnelles)
   */
  track<K extends keyof AnalyticsEvent>(
    eventName: K,
    properties: AnalyticsEvent[K],
    sessionProperties?: Partial<SessionProperties>
  ): void {
    if (!this.isAvailable()) return;

    try {
      // Anonymiser les données sensibles
      const sanitizedProperties = this.sanitizeProperties(properties);
      
      posthog.capture(eventName, {
        ...sanitizedProperties,
        ...sessionProperties,
        // Métadonnées de conformité
        timestamp: new Date().toISOString(),
        app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        environment: import.meta.env.NODE_ENV || 'development'
      });
      
      if (DEBUG_ANALYTICS) {
        console.log('[Analytics] Événement envoyé:', eventName, sanitizedProperties);
      }
    } catch (error) {
      console.error('[Analytics] Erreur lors de l\'envoi de l\'événement:', error);
    }
  }

  /**
   * Définit les propriétés de l'utilisateur actuel
   * @param properties - Propriétés à définir
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.isAvailable()) return;

    try {
      posthog.people.set(properties);
      
      if (DEBUG_ANALYTICS) {
        console.log('[Analytics] Propriétés utilisateur mises à jour:', properties);
      }
    } catch (error) {
      console.error('[Analytics] Erreur lors de la mise à jour des propriétés:', error);
    }
  }

  /**
   * Définit les propriétés de session
   * @param properties - Propriétés de session
   */
  setSessionProperties(properties: SessionProperties): void {
    if (!this.isAvailable()) return;

    try {
      posthog.register(properties);
      
      if (DEBUG_ANALYTICS) {
        console.log('[Analytics] Propriétés de session mises à jour:', properties);
      }
    } catch (error) {
      console.error('[Analytics] Erreur lors de la mise à jour des propriétés de session:', error);
    }
  }

  /**
   * Active le tracking pour l'utilisateur actuel (consentement RGPD)
   */
  enableTracking(): void {
    if (!this.isAvailable()) return;

    try {
      posthog.opt_in_capturing();
      
      if (DEBUG_ANALYTICS) {
        console.log('[Analytics] Tracking activé pour l\'utilisateur');
      }
    } catch (error) {
      console.error('[Analytics] Erreur lors de l\'activation du tracking:', error);
    }
  }

  /**
   * Désactive le tracking pour l'utilisateur actuel
   */
  disableTracking(): void {
    if (!this.isAvailable()) return;

    try {
      posthog.opt_out_capturing();
      
      if (DEBUG_ANALYTICS) {
        console.log('[Analytics] Tracking désactivé pour l\'utilisateur');
      }
    } catch (error) {
      console.error('[Analytics] Erreur lors de la désactivation du tracking:', error);
    }
  }

  /**
   * Nettoie les données sensibles avant envoi
   * @param properties - Propriétés à nettoyer
   */
  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized = { ...properties };
    
    // Supprimer les données sensibles potentielles
    const sensitiveKeys = ['email', 'phone', 'address', 'name', 'firstName', 'lastName'];
    sensitiveKeys.forEach(key => {
      if (key in sanitized) {
        delete sanitized[key];
      }
    });
    
    // Limiter la longueur des messages d'erreur
    if (sanitized.error_message && typeof sanitized.error_message === 'string') {
      sanitized.error_message = sanitized.error_message.substring(0, 200);
    }
    
    return sanitized;
  }

  /**
   * Obtient l'état actuel du service
   */
  getStatus(): {
    enabled: boolean;
    initialized: boolean;
    available: boolean;
  } {
    return {
      enabled: this.isEnabled,
      initialized: this.isInitialized,
      available: this.isAvailable()
    };
  }
}

// Instance singleton
export const analytics = new AnalyticsService();

// Export des types pour utilisation externe
export type { AnalyticsEvent, UserProperties, SessionProperties };

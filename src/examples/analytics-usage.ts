/**
 * Exemples d'utilisation du wrapper analytics PostHog
 * 
 * Ce fichier montre comment utiliser correctement le service analytics
 * dans différents contextes de l'application Revia.
 */

import { analytics } from '../lib/analytics';

// ============================================================================
// EXEMPLE 1: Initialisation et vérification du statut
// ============================================================================

export function checkAnalyticsStatus() {
  const status = analytics.getStatus();
  
  console.log('Analytics Status:', {
    enabled: status.enabled,
    initialized: status.initialized,
    available: status.available
  });
  
  if (!status.enabled) {
    console.log('Analytics désactivé - Vérifiez VITE_ANALYTICS_ENABLED=true');
    return false;
  }
  
  if (!status.available) {
    console.log('Analytics non disponible - Vérifiez VITE_POSTHOG_KEY');
    return false;
  }
  
  return true;
}

// ============================================================================
// EXEMPLE 2: Identification d'un utilisateur authentifié
// ============================================================================

export function identifyAuthenticatedUser(userId: string, userEmail: string) {
  // IMPORTANT: Ne jamais envoyer l'email directement
  // L'analytics wrapper le filtre automatiquement
  
  analytics.identify(userId, {
    user_type: 'authenticated',
    app_mode: 'sport',
    account_created_at: new Date().toISOString(),
    last_activity: new Date().toISOString()
  });
  
  // Définir des propriétés de session
  analytics.setSessionProperties({
    session_id: crypto.randomUUID(),
    is_guest_mode: false,
    app_version: '1.0.0',
    browser: navigator.userAgent.split(' ')[0],
    os: navigator.platform
  });
}

// ============================================================================
// EXEMPLE 3: Tracking d'événements de session
// ============================================================================

export function trackSessionCreated(sessionType: 'cardio' | 'strength' | 'flexibility' | 'sport', hasDuplicates: boolean) {
  analytics.track('session_created', {
    session_type: sessionType,
    has_duplicates: hasDuplicates
  });
}

export function trackSessionValidated(sessionId: string, exerciseCount: number, totalDurationMinutes: number, averageRpe: number) {
  analytics.track('session_validated', {
    session_id: sessionId,
    exercise_count: exerciseCount,
    total_duration_minutes: totalDurationMinutes,
    average_rpe: averageRpe,
    has_pain_levels: true // Exemple
  });
}

// ============================================================================
// EXEMPLE 4: Tracking d'événements guest
// ============================================================================

export function trackGuestModeEntered(entryPoint: 'homepage' | 'login_page' | 'direct_link') {
  analytics.track('guest_mode_entered', {
    entry_point: entryPoint,
    user_agent: navigator.userAgent
  });
}

export function trackGuestSessionCreated(sessionType: 'cardio' | 'strength' | 'flexibility' | 'sport', isFirstSession: boolean) {
  analytics.track('guest_session_created', {
    session_type: sessionType,
    is_first_session: isFirstSession
  });
}

export function trackGuestMigrationStarted(sessionCount: number, exerciseCount: number, daysSinceFirstSession: number) {
  analytics.track('guest_migration_started', {
    session_count: sessionCount,
    exercise_count: exerciseCount,
    days_since_first_session: daysSinceFirstSession
  });
}

export function trackGuestMigrationCompleted(sessionsMigrated: number, exercisesMigrated: number, conflictsResolved: number, strategy: string) {
  analytics.track('guest_migration_completed', {
    sessions_migrated: sessionsMigrated,
    exercises_migrated: exercisesMigrated,
    conflicts_resolved: conflictsResolved,
    migration_strategy: strategy as 'merge_newest' | 'keep_guest' | 'keep_server' | 'keep_both'
  });
}

// ============================================================================
// EXEMPLE 5: Tracking d'erreurs
// ============================================================================

export function trackError(error: Error, component: string, userAction?: string) {
  analytics.track('error_occurred', {
    error_type: 'validation', // ou 'network', 'auth', 'unknown'
    error_message: error.message,
    component: component,
    user_action: userAction
  });
}

// ============================================================================
// EXEMPLE 6: Gestion du consentement utilisateur
// ============================================================================

export function handleUserConsent(consentGiven: boolean) {
  if (consentGiven) {
    analytics.enableTracking();
    console.log('Analytics activé avec le consentement utilisateur');
  } else {
    analytics.disableTracking();
    console.log('Analytics désactivé - consentement refusé');
  }
}

// ============================================================================
// EXEMPLE 7: Tracking de performance
// ============================================================================

export function trackPageLoad(pageName: string, loadTimeMs: number, isCached: boolean = false) {
  analytics.track('page_load', {
    page_name: pageName,
    load_time_ms: loadTimeMs,
    is_cached: isCached
  });
}

// ============================================================================
// EXEMPLE 8: Utilisation dans un composant React
// ============================================================================

/*
import { useEffect } from 'react';
import { analytics } from '../lib/analytics';

export function MyComponent() {
  useEffect(() => {
    // Tracking automatique du chargement de page
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      analytics.track('page_load', {
        page_name: 'MyComponent',
        load_time_ms: Math.round(loadTime),
        is_cached: false
      });
    };
    
    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);
  
  const handleButtonClick = () => {
    // Tracking d'action utilisateur
    analytics.track('session_created', {
      session_type: 'cardio',
      has_duplicates: false
    });
  };
  
  return (
    <button onClick={handleButtonClick}>
      Créer une session
    </button>
  );
}
*/

// ============================================================================
// EXEMPLE 9: Gestion des erreurs avec try/catch
// ============================================================================

export async function safeAnalyticsTracking() {
  try {
    // Vérifier que l'analytics est disponible
    if (!analytics.getStatus().available) {
      console.warn('Analytics non disponible, événement ignoré');
      return;
    }
    
    // Envoyer l'événement
    analytics.track('session_created', {
      session_type: 'cardio',
      has_duplicates: false
    });
    
  } catch (error) {
    // L'analytics wrapper gère déjà les erreurs, mais on peut ajouter
    // une logique de fallback si nécessaire
    console.error('Erreur lors du tracking analytics:', error);
  }
}

// ============================================================================
// EXEMPLE 10: Test en mode développement
// ============================================================================

export function testAnalyticsInDevelopment() {
  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_ANALYTICS === 'true') {
    console.log('=== TEST ANALYTICS (DÉVELOPPEMENT) ===');
    
    // Test d'événement simple
    analytics.track('session_created', {
      session_type: 'cardio',
      has_duplicates: false
    });
    
    // Test d'événement avec erreur
    analytics.track('error_occurred', {
      error_type: 'test',
      error_message: 'Test error for development',
      component: 'test-component'
    });
    
    console.log('=== FIN TEST ANALYTICS ===');
  }
}

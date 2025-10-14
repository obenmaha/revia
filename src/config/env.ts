// Configuration des variables d'environnement - Stack MVP 2025
// Support pour configuration runtime (Docker) + fallback Vite
interface EnvConfig {
  app: {
    name: string;
    version: string;
    debug: boolean;
    logLevel: string;
  };
  api: {
    baseUrl: string;
    anonKey: string;
    serviceRoleKey: string;
    timeout: number;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  services: {
    email: string;
    sms: string;
  };
}

// Fonction pour obtenir la configuration runtime (Docker) ou fallback (Vite)
function getRuntimeConfig(): Partial<EnvConfig> {
  // Vérifier si on est dans un environnement Docker avec config runtime
  if (typeof window !== 'undefined' && window.__APP_CONFIG__) {
    try {
      const runtimeConfig = window.__APP_CONFIG__.get();
      if (
        runtimeConfig &&
        runtimeConfig.supabase &&
        runtimeConfig.supabase.url
      ) {
        console.log('🔧 Utilisation de la configuration runtime (Docker)');
        return {
          app: {
            name: runtimeConfig.app?.name || 'App-Kine',
            version: runtimeConfig.app?.version || '1.4.0',
            debug: runtimeConfig.app?.debug || false,
            logLevel: 'info',
          },
          supabase: {
            url: runtimeConfig.supabase.url,
            anonKey: runtimeConfig.supabase.anonKey,
            serviceRoleKey: '', // Pas de service_role côté front
          },
          api: {
            baseUrl: runtimeConfig.supabase.url,
            anonKey: runtimeConfig.supabase.anonKey,
            serviceRoleKey: '',
            timeout: runtimeConfig.api?.timeout || 10000,
          },
          services: {
            email: runtimeConfig.services?.email || '',
            sms: runtimeConfig.services?.sms || '',
          },
        };
      }
    } catch (error) {
      console.warn(
        '⚠️  Erreur lors du chargement de la config runtime:',
        error
      );
    }
  }

  // Fallback vers les variables d'environnement Vite
  console.log("🔄 Utilisation des variables d'environnement Vite");
  return {
    app: {
      name: import.meta.env.VITE_APP_NAME || 'App-Kine',
      version: import.meta.env.VITE_APP_VERSION || '1.4.0',
      debug: import.meta.env.VITE_DEBUG === 'true',
      logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
    },
    api: {
      baseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      serviceRoleKey: '', // INTERDIT côté frontend - sécurité critique
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
    },
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      serviceRoleKey: '', // INTERDIT côté frontend - sécurité critique
    },
    services: {
      email: import.meta.env.VITE_EMAIL_SERVICE_URL || '',
      sms: import.meta.env.VITE_SMS_SERVICE_URL || '',
    },
  };
}

// Charger la configuration
const runtimeConfig = getRuntimeConfig();

export const env: EnvConfig = {
  app: runtimeConfig.app!,
  api: runtimeConfig.api!,
  supabase: runtimeConfig.supabase!,
  services: runtimeConfig.services!,
};

// Fonction utilitaire pour valider les variables d'environnement
export const validateEnv = (): boolean => {
  // Vérifier que l'URL Supabase est valide
  new URL(env.supabase.url);

  // Vérifier que les clés Supabase sont présentes
  if (!env.supabase.anonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY est requis');
  }

  // SÉCURITÉ CRITIQUE: Vérifier qu'aucune clé service_role n'est exposée côté frontend
  if (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    console.error('🚨 SÉCURITÉ: SERVICE_ROLE_KEY détectée côté frontend !');
    console.error('Cette clé ne doit JAMAIS être exposée au navigateur.');
    console.error(
      'Utilisez-la uniquement dans Edge Functions ou scripts backend.'
    );
    throw new Error('SERVICE_ROLE_KEY interdite côté frontend');
  }

  // Vérifier que le timeout est un nombre positif
  if (env.api.timeout <= 0) {
    throw new Error('VITE_API_TIMEOUT doit être un nombre positif');
  }

  return true;
};

// Valider les variables d'environnement au démarrage
if (env.app.debug) {
  console.log("Configuration de l'environnement:", env);
}

try {
  validateEnv();
} catch (error) {
  console.error("Erreur de validation des variables d'environnement:", error);
  throw error;
}

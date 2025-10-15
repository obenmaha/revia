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
  
  // Valeurs par défaut pour le développement
  const defaultSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  const defaultAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
  
  return {
    app: {
      name: import.meta.env.VITE_APP_NAME || 'App-Kine',
      version: import.meta.env.VITE_APP_VERSION || '1.4.0',
      debug: import.meta.env.VITE_DEBUG === 'true',
      logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
    },
    api: {
      baseUrl: defaultSupabaseUrl,
      anonKey: defaultAnonKey,
      serviceRoleKey: '', // INTERDIT côté frontend - sécurité critique
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
    },
    supabase: {
      url: defaultSupabaseUrl,
      anonKey: defaultAnonKey,
      serviceRoleKey: '', // INTERDIT côté frontend - sécurité critique
    },
    services: {
      email: import.meta.env.VITE_EMAIL_SERVICE_URL || 'https://api.emailservice.com',
      sms: import.meta.env.VITE_SMS_SERVICE_URL || 'https://api.smsservice.com',
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
  if (!env.supabase.url || env.supabase.url === '' || env.supabase.url === 'https://placeholder.supabase.co') {
    throw new Error('VITE_SUPABASE_URL est requis et doit être une URL Supabase valide (pas de placeholder)');
  }
  
  try {
    new URL(env.supabase.url);
  } catch (error) {
    throw new Error(`VITE_SUPABASE_URL n'est pas une URL valide: ${env.supabase.url}`);
  }

  // Vérifier que les clés Supabase sont présentes
  if (!env.supabase.anonKey || env.supabase.anonKey === '' || env.supabase.anonKey === 'placeholder-key') {
    throw new Error('VITE_SUPABASE_ANON_KEY est requis et doit être une clé Supabase valide (pas de placeholder)');
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

// Mode de développement : validation plus permissive
const isDevelopment = import.meta.env.DEV || env.app.debug;

if (isDevelopment) {
  // En développement, on vérifie si les variables sont des placeholders
  const hasPlaceholderUrl = env.supabase.url === 'https://placeholder.supabase.co';
  const hasPlaceholderKey = env.supabase.anonKey === 'placeholder-key';
  
  if (hasPlaceholderUrl || hasPlaceholderKey) {
    console.warn("⚠️  Configuration Supabase avec des valeurs placeholder détectée");
    console.warn("📝 Pour une configuration complète, créez un fichier .env.local avec vos vraies clés Supabase");
    console.warn("🔗 Voir env.local.example pour un exemple de configuration");
    console.warn("🚀 L'application fonctionnera en mode développement avec des fonctionnalités limitées");
  } else {
    try {
      validateEnv();
      console.log("✅ Configuration des variables d'environnement valide");
    } catch (error) {
      console.warn("⚠️  Variables d'environnement invalides:", error);
      console.warn("📝 Vérifiez votre configuration dans .env.local");
    }
  }
} else {
  // En production, validation stricte
  try {
    validateEnv();
  } catch (error) {
    console.error("Erreur de validation des variables d'environnement:", error);
    throw error;
  }
}

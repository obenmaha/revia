// Configuration des variables d'environnement - Stack MVP 2025
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

const requiredEnvVars = [
  'VITE_APP_NAME',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

// Vérifier que les variables d'environnement requises sont définies
const missingVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName]
);

if (missingVars.length > 0) {
  console.warn(
    `Variables d'environnement manquantes: ${missingVars.join(', ')}`
  );
  // Ne pas lancer d'erreur pour le moment, utiliser des valeurs par défaut
}

export const env: EnvConfig = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'App-Kine',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    debug: import.meta.env.VITE_DEBUG === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },
  api: {
    baseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://ernzqcqoopqfqmrmcnug.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVybnpxY3Fvb3BxZnFtcm1jbnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTk0NjgsImV4cCI6MjA3NTQ3NTQ2OH0.30Z0GwF5MHBCxu6YLV7xm7ZCzYDxQ0_kpyEKgNnsTMY',
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  },
  services: {
    email: import.meta.env.VITE_EMAIL_SERVICE_URL || '',
    sms: import.meta.env.VITE_SMS_SERVICE_URL || '',
  },
};

// Fonction utilitaire pour valider les variables d'environnement
export const validateEnv = (): boolean => {
  try {
    // Vérifier que l'URL Supabase est valide
    new URL(env.supabase.url);

    // Vérifier que les clés Supabase sont présentes
    if (!env.supabase.anonKey) {
      throw new Error('VITE_SUPABASE_ANON_KEY est requis');
    }

    // Vérifier que le timeout est un nombre positif
    if (env.api.timeout <= 0) {
      throw new Error('VITE_API_TIMEOUT doit être un nombre positif');
    }

    return true;
  } catch (error) {
    console.error("Erreur de validation des variables d'environnement:", error);
    return false;
  }
};

// Valider les variables d'environnement au démarrage
if (env.app.debug) {
  console.log("Configuration de l'environnement:", env);
}

if (!validateEnv()) {
  throw new Error("Configuration des variables d'environnement invalide");
}

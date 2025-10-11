import { QueryClient } from '@tanstack/react-query';

// Configuration TanStack Query optimisée pour App-Kine
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache des données pendant 5 minutes par défaut
      staleTime: 5 * 60 * 1000,
      // Garde les données en cache pendant 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry automatique en cas d'erreur réseau
      retry: (failureCount, error) => {
        // Ne pas retry pour les erreurs 4xx (client)
        if (
          error instanceof Error &&
          'status' in error &&
          typeof error.status === 'number'
        ) {
          if (error.status >= 400 && error.status < 500) {
            return false;
          }
        }
        // Retry jusqu'à 3 fois pour les autres erreurs
        return failureCount < 3;
      },
      // Retry avec délai exponentiel
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch automatique quand la fenêtre reprend le focus
      refetchOnWindowFocus: true,
      // Refetch automatique quand la connexion réseau revient
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry les mutations en cas d'erreur réseau
      retry: (failureCount, error) => {
        // Ne pas retry pour les erreurs 4xx
        if (
          error instanceof Error &&
          'status' in error &&
          typeof error.status === 'number'
        ) {
          if (error.status >= 400 && error.status < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
  },
});

// Clés de requête standardisées
export const queryKeys = {
  // Authentification
  auth: ['auth'] as const,
  user: (id: string) => ['user', id] as const,
  currentUser: ['user', 'current'] as const,

  // Patients
  patients: ['patients'] as const,
  patient: (id: string) => ['patient', id] as const,
  patientsByPractitioner: (practitionerId: string) =>
    ['patients', 'practitioner', practitionerId] as const,

  // Séances
  sessions: ['sessions'] as const,
  session: (id: string) => ['session', id] as const,
  sessionsByPatient: (patientId: string) =>
    ['sessions', 'patient', patientId] as const,
  sessionsByPractitioner: (practitionerId: string) =>
    ['sessions', 'practitioner', practitionerId] as const,
  sessionsByDate: (date: string) => ['sessions', 'date', date] as const,

  // Factures
  invoices: ['invoices'] as const,
  invoice: (id: string) => ['invoice', id] as const,
  invoicesByPatient: (patientId: string) =>
    ['invoices', 'patient', patientId] as const,
  invoicesByPractitioner: (practitionerId: string) =>
    ['invoices', 'practitioner', practitionerId] as const,

  // Statistiques
  stats: ['stats'] as const,
  statsByPractitioner: (practitionerId: string) =>
    ['stats', 'practitioner', practitionerId] as const,
} as const;

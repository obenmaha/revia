// Service API de base - Stack MVP 2025 avec Supabase
import { supabase } from '../lib/supabase';

export class ApiError extends Error {
  public status: number;
  public response?: Response;

  constructor(message: string, status: number, response?: Response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

// Client API pour les appels backend (si nécessaire)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Ajouter le token d'authentification si disponible
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${session.access_token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      );
    }
  },

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

// Service principal utilisant Supabase
class ApiService {
  // Vérifier la connexion
  static async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      return { status: 'OK', timestamp: new Date().toISOString() };
    } catch (error) {
      throw new Error(
        `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Obtenir les statistiques générales
  static async getStats() {
    try {
      const [patientsCount, sessionsCount, invoicesCount] = await Promise.all([
        supabase.from('patients').select('count', { count: 'exact' }),
        supabase.from('sessions').select('count', { count: 'exact' }),
        supabase.from('invoices').select('count', { count: 'exact' }),
      ]);

      if (patientsCount.error) throw new Error(patientsCount.error.message);
      if (sessionsCount.error) throw new Error(sessionsCount.error.message);
      if (invoicesCount.error) throw new Error(invoicesCount.error.message);

      return {
        patients: patientsCount.count || 0,
        sessions: sessionsCount.count || 0,
        invoices: invoicesCount.count || 0,
      };
    } catch (error) {
      throw new Error(
        `Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const apiService = new ApiService();

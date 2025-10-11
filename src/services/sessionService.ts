// Service de gestion des sessions - Story 2.2
import { supabase } from '../lib/supabase';
import {
  Session,
  CreateSessionInput,
  SupabaseSession,
  mapSupabaseSessionToSession,
  createSessionSchema,
  updateSessionSchema,
  SessionFilters,
  SessionStats,
  PaginatedSessions,
  SessionStatus,
} from '../types/session';

// Classe d'erreur personnalisée pour les services
export class SessionServiceError extends Error {
  public code?: string;
  public details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'SessionServiceError';
    this.code = code;
    this.details = details;
  }
}

// Service principal de gestion des sessions
export class SessionService {
  /**
   * Créer une nouvelle session
   */
  static async createSession(
    sessionData: CreateSessionInput
  ): Promise<Session> {
    try {
      // Validation des données avec Zod
      const validatedData = createSessionSchema.parse(sessionData);

      // Récupération de l'utilisateur actuel
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new SessionServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      // Préparation des données pour Supabase
      const supabaseData: Partial<SupabaseSession> = {
        user_id: user.id,
        name: validatedData.name,
        date: validatedData.date.toISOString(),
        type: validatedData.type,
        status: 'draft',
        objectives: validatedData.objectives,
        notes: validatedData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insertion en base de données
      const { data, error } = await supabase
        .from('sessions')
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        throw new SessionServiceError(
          `Erreur lors de la création de la session: ${error.message}`,
          'CREATE_ERROR',
          error
        );
      }

      return mapSupabaseSessionToSession(data as SupabaseSession);
    } catch (error) {
      if (error instanceof SessionServiceError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new SessionServiceError(
          `Erreur de validation: ${error.message}`,
          'VALIDATION_ERROR'
        );
      }
      throw new SessionServiceError(
        'Erreur inconnue lors de la création de la session',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Récupérer une session par son ID
   */
  static async getSession(id: string): Promise<Session | null> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Session non trouvée
        }
        throw new SessionServiceError(
          `Erreur lors de la récupération de la session: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      return mapSupabaseSessionToSession(data as SupabaseSession);
    } catch (error) {
      if (error instanceof SessionServiceError) {
        throw error;
      }
      throw new SessionServiceError(
        'Erreur inconnue lors de la récupération de la session',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Récupérer toutes les sessions de l'utilisateur connecté
   */
  static async getSessions(filters?: SessionFilters): Promise<Session[]> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new SessionServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      let query = supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      // Application des filtres
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo.toISOString());
      }
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,objectives.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new SessionServiceError(
          `Erreur lors de la récupération des sessions: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      return data.map(mapSupabaseSessionToSession);
    } catch (error) {
      if (error instanceof SessionServiceError) {
        throw error;
      }
      throw new SessionServiceError(
        'Erreur inconnue lors de la récupération des sessions',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Récupérer les sessions avec pagination
   */
  static async getSessionsPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: SessionFilters
  ): Promise<PaginatedSessions> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new SessionServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      const offset = (page - 1) * limit;

      let query = supabase
        .from('sessions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      // Application des filtres
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo.toISOString());
      }
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,objectives.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
        );
      }

      const { data, error, count } = await query;

      if (error) {
        throw new SessionServiceError(
          `Erreur lors de la récupération des sessions: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      const sessions = data.map(mapSupabaseSessionToSession);
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        sessions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      if (error instanceof SessionServiceError) {
        throw error;
      }
      throw new SessionServiceError(
        'Erreur inconnue lors de la récupération des sessions',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Mettre à jour une session
   */
  static async updateSession(
    id: string,
    updates: Partial<CreateSessionInput> & { status?: string }
  ): Promise<Session> {
    try {
      // Validation des données avec Zod
      updateSessionSchema.parse({ id, ...updates });

      // Récupération de l'utilisateur actuel
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new SessionServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      // Préparation des données pour Supabase
      const supabaseUpdates: Partial<SupabaseSession> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name) supabaseUpdates.name = updates.name;
      if (updates.date) supabaseUpdates.date = updates.date.toISOString();
      if (updates.type) supabaseUpdates.type = updates.type;
      if (updates.status)
        supabaseUpdates.status = updates.status as SessionStatus;
      if (updates.objectives !== undefined)
        supabaseUpdates.objectives = updates.objectives;
      if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;

      // Mise à jour en base de données
      const { data, error } = await supabase
        .from('sessions')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', user.id) // Sécurité RLS
        .select()
        .single();

      if (error) {
        throw new SessionServiceError(
          `Erreur lors de la mise à jour de la session: ${error.message}`,
          'UPDATE_ERROR',
          error
        );
      }

      return mapSupabaseSessionToSession(data as SupabaseSession);
    } catch (error) {
      if (error instanceof SessionServiceError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new SessionServiceError(
          `Erreur de validation: ${error.message}`,
          'VALIDATION_ERROR'
        );
      }
      throw new SessionServiceError(
        'Erreur inconnue lors de la mise à jour de la session',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Supprimer une session
   */
  static async deleteSession(id: string): Promise<void> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new SessionServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Sécurité RLS

      if (error) {
        throw new SessionServiceError(
          `Erreur lors de la suppression de la session: ${error.message}`,
          'DELETE_ERROR',
          error
        );
      }
    } catch (error) {
      if (error instanceof SessionServiceError) {
        throw error;
      }
      throw new SessionServiceError(
        'Erreur inconnue lors de la suppression de la session',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Rechercher des sessions
   */
  static async searchSessions(query: string): Promise<Session[]> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new SessionServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .or(
          `name.ilike.%${query}%,objectives.ilike.%${query}%,notes.ilike.%${query}%`
        )
        .order('date', { ascending: false });

      if (error) {
        throw new SessionServiceError(
          `Erreur lors de la recherche de sessions: ${error.message}`,
          'SEARCH_ERROR',
          error
        );
      }

      return data.map(mapSupabaseSessionToSession);
    } catch (error) {
      if (error instanceof SessionServiceError) {
        throw error;
      }
      throw new SessionServiceError(
        'Erreur inconnue lors de la recherche de sessions',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Obtenir les statistiques des sessions
   */
  static async getSessionStats(): Promise<SessionStats> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new SessionServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      const { data, error } = await supabase.rpc('get_session_stats', {
        user_uuid: user.id,
      });

      if (error) {
        throw new SessionServiceError(
          `Erreur lors de la récupération des statistiques: ${error.message}`,
          'STATS_ERROR',
          error
        );
      }

      return (
        data || {
          totalSessions: 0,
          sessionsThisMonth: 0,
          sessionsThisYear: 0,
          completedSessions: 0,
          inProgressSessions: 0,
          draftSessions: 0,
          averageSessionsPerWeek: 0,
          mostCommonType: null,
        }
      );
    } catch (error) {
      if (error instanceof SessionServiceError) {
        throw error;
      }
      throw new SessionServiceError(
        'Erreur inconnue lors de la récupération des statistiques',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Sauvegarde automatique (draft) d'une session
   */
  static async autoSaveSession(
    id: string,
    updates: Partial<CreateSessionInput>
  ): Promise<void> {
    try {
      // Validation minimale pour la sauvegarde automatique
      updateSessionSchema.partial().parse({ id, ...updates });

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new SessionServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      // Préparation des données pour Supabase
      const supabaseUpdates: Partial<SupabaseSession> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name) supabaseUpdates.name = updates.name;
      if (updates.date) supabaseUpdates.date = updates.date.toISOString();
      if (updates.type) supabaseUpdates.type = updates.type;
      if (updates.objectives !== undefined)
        supabaseUpdates.objectives = updates.objectives;
      if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;

      // Mise à jour en base de données
      const { error } = await supabase
        .from('sessions')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw new SessionServiceError(
          `Erreur lors de la sauvegarde automatique: ${error.message}`,
          'AUTOSAVE_ERROR',
          error
        );
      }
    } catch (error) {
      if (error instanceof SessionServiceError) {
        throw error;
      }
      throw new SessionServiceError(
        'Erreur inconnue lors de la sauvegarde automatique',
        'UNKNOWN_ERROR'
      );
    }
  }
}

// Export des fonctions utilitaires
export const {
  createSession,
  getSession,
  getSessions,
  getSessionsPaginated,
  updateSession,
  deleteSession,
  searchSessions,
  getSessionStats,
  autoSaveSession,
} = SessionService;

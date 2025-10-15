// Service pour l'historique des séances sport - Story 1.5
import { supabase } from '@/lib/supabase';
import type { 
  SportSession, 
  SportExercise, 
  HistoryFilters, 
  SportSessionWithExercises 
} from '@/types/sport';

export class SportHistoryService {
  /**
   * Récupération de l'historique des séances avec filtres
   */
  static async getSportHistory(filters: HistoryFilters): Promise<{
    sessions: SportSessionWithExercises[];
    totalCount: number;
  }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Construction de la requête de base
    let query = supabase
      .from('sport_sessions')
      .select(
        `
        *,
        sport_exercises (
          id, name, exercise_type, sets, reps, weight_kg,
          duration_seconds, rest_seconds, order_index, notes
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    // Application des filtres
    if (filters.startDate) {
      query = query.gte('date', filters.startDate.toISOString().split('T')[0]);
    }
    if (filters.endDate) {
      query = query.lte('date', filters.endDate.toISOString().split('T')[0]);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    // Application de la pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 10;
    query = query.range(offset, offset + limit - 1);

    const { data: sessions, error, count } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération de l'historique: ${error.message}`);
    }

    return {
      sessions: (sessions as SportSessionWithExercises[]) || [],
      totalCount: count || 0,
    };
  }

  /**
   * Récupération d'une séance par ID
   */
  static async getSportSessionById(sessionId: string): Promise<SportSessionWithExercises | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { data: session, error } = await supabase
      .from('sport_sessions')
      .select(
        `
        *,
        sport_exercises (
          id, name, exercise_type, sets, reps, weight_kg,
          duration_seconds, rest_seconds, order_index, notes
        )
      `
      )
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Session non trouvée
      }
      throw new Error(`Erreur lors de la récupération de la séance: ${error.message}`);
    }

    return session as SportSessionWithExercises;
  }

  /**
   * Suppression d'une séance
   */
  static async deleteSportSession(sessionId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { error } = await supabase
      .from('sport_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Erreur lors de la suppression de la séance: ${error.message}`);
    }
  }

  /**
   * Mise à jour du statut d'une séance
   */
  static async updateSessionStatus(
    sessionId: string, 
    status: 'draft' | 'in_progress' | 'completed'
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { error } = await supabase
      .from('sport_sessions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }
  }

  /**
   * Recherche de séances par nom
   */
  static async searchSessions(
    searchQuery: string,
    limit: number = 10
  ): Promise<SportSessionWithExercises[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { data: sessions, error } = await supabase
      .from('sport_sessions')
      .select(
        `
        *,
        sport_exercises (
          id, name, exercise_type, sets, reps, weight_kg,
          duration_seconds, rest_seconds, order_index, notes
        )
      `
      )
      .eq('user_id', user.id)
      .ilike('name', `%${searchQuery}%`)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }

    return (sessions as SportSessionWithExercises[]) || [];
  }

  /**
   * Récupération des séances récentes
   */
  static async getRecentSessions(limit: number = 5): Promise<SportSessionWithExercises[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { data: sessions, error } = await supabase
      .from('sport_sessions')
      .select(
        `
        *,
        sport_exercises (
          id, name, exercise_type, sets, reps, weight_kg,
          duration_seconds, rest_seconds, order_index, notes
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erreur lors de la récupération des séances récentes: ${error.message}`);
    }

    return (sessions as SportSessionWithExercises[]) || [];
  }

  /**
   * Récupération des statistiques de base
   */
  static async getBasicStats(filters: Omit<HistoryFilters, 'offset' | 'limit'>): Promise<{
    totalSessions: number;
    totalDuration: number;
    averageRPE: number;
    averagePainLevel: number;
    sessionsByType: Record<string, number>;
    sessionsByStatus: Record<string, number>;
  }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    let query = supabase
      .from('sport_sessions')
      .select('id, duration_minutes, rpe_score, pain_level, type, status')
      .eq('user_id', user.id);

    // Application des filtres
    if (filters.startDate) {
      query = query.gte('date', filters.startDate.toISOString().split('T')[0]);
    }
    if (filters.endDate) {
      query = query.lte('date', filters.endDate.toISOString().split('T')[0]);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data: sessions, error } = await query;

    if (error) {
      throw new Error(`Erreur lors du calcul des statistiques: ${error.message}`);
    }

    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        averageRPE: 0,
        averagePainLevel: 0,
        sessionsByType: {},
        sessionsByStatus: {},
      };
    }

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce(
      (sum, session) => sum + (session.duration_minutes || 0),
      0
    );
    const averageRPE = sessions.reduce(
      (sum, session) => sum + (session.rpe_score || 0),
      0
    ) / totalSessions;
    const averagePainLevel = sessions.reduce(
      (sum, session) => sum + (session.pain_level || 0),
      0
    ) / totalSessions;

    const sessionsByType = sessions.reduce(
      (acc, session) => {
        acc[session.type] = (acc[session.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sessionsByStatus = sessions.reduce(
      (acc, session) => {
        acc[session.status] = (acc[session.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalSessions,
      totalDuration,
      averageRPE: Math.round(averageRPE * 10) / 10,
      averagePainLevel: Math.round(averagePainLevel * 10) / 10,
      sessionsByType,
      sessionsByStatus,
    };
  }
}

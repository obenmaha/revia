import { supabase } from '../lib/supabase';
import type {
  Session,
  SessionForm,
  PaginatedResponse,
  SupabaseSession,
} from '../types';
import { mapSupabaseSessionToSession } from '../types';

class SessionsService {
  // Obtenir la liste des séances avec pagination et filtres
  static async getSessions(
    params: {
      page?: number;
      limit?: number;
      patientId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    const {
      page = 1,
      limit = 10,
      patientId,
      status,
      startDate,
      endDate,
    } = params;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('sessions')
      .select(
        `
        *,
        patient:patients(
          id,
          first_name,
          last_name,
          phone
        )
      `,
        { count: 'exact' }
      )
      .order('scheduled_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Appliquer les filtres
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (startDate) {
      query = query.gte('scheduled_at', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_at', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: (data || []).map(mapSupabaseSessionToSession),
      success: true,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    } as PaginatedResponse<Session>;
  }

  // Obtenir une séance par ID
  static async getSession(id: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select(
        `
        *,
        patient:patients(
          id,
          first_name,
          last_name,
          phone,
          email
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapSupabaseSessionToSession(data);
  }

  // Créer une nouvelle séance
  static async createSession(sessionData: SessionForm) {
    // Vérifier les conflits de planning
    const { data: conflicts, error: conflictError } = await supabase
      .from('sessions')
      .select('id')
      .eq('status', 'scheduled')
      .neq('status', 'cancelled')
      .gte(
        'scheduled_at',
        new Date(
          new Date(sessionData.scheduledAt).getTime() -
            sessionData.duration * 60000
        ).toISOString()
      )
      .lte(
        'scheduled_at',
        new Date(
          new Date(sessionData.scheduledAt).getTime() +
            sessionData.duration * 60000
        ).toISOString()
      );

    if (conflictError) {
      throw new Error(conflictError.message);
    }

    if (conflicts && conflicts.length > 0) {
      throw new Error('Conflit de planning détecté');
    }

    // Récupérer l'ID du praticien actuel
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const supabaseData: Partial<SupabaseSession> = {
      patient_id: sessionData.patientId,
      practitioner_id: user.id,
      scheduled_at: sessionData.scheduledAt,
      duration: sessionData.duration,
      notes: sessionData.notes,
      objectives: sessionData.objectives || [],
      exercises: sessionData.exercises || [],
    };

    const { data, error } = await supabase
      .from('sessions')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(supabaseData as any)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapSupabaseSessionToSession(data);
  }

  // Mettre à jour une séance
  static async updateSession(id: string, sessionData: Partial<SessionForm>) {
    const updateData: Partial<SupabaseSession> = {};

    if (sessionData.patientId) updateData.patient_id = sessionData.patientId;
    if (sessionData.scheduledAt)
      updateData.scheduled_at = sessionData.scheduledAt;
    if (sessionData.duration) updateData.duration = sessionData.duration;
    if (sessionData.notes !== undefined) updateData.notes = sessionData.notes;
    if (sessionData.objectives !== undefined)
      updateData.objectives = sessionData.objectives;
    if (sessionData.exercises !== undefined)
      updateData.exercises = sessionData.exercises;

    updateData.updated_at = new Date().toISOString();

    // Vérifier les conflits si la date ou la durée change
    if (sessionData.scheduledAt || sessionData.duration) {
      const { data: conflicts, error: conflictError } = await supabase
        .from('sessions')
        .select('id')
        .eq('status', 'scheduled')
        .neq('status', 'cancelled')
        .neq('id', id)
        .gte(
          'scheduled_at',
          new Date(
            new Date(sessionData.scheduledAt || '').getTime() -
              (sessionData.duration || 0) * 60000
          ).toISOString()
        )
        .lte(
          'scheduled_at',
          new Date(
            new Date(sessionData.scheduledAt || '').getTime() +
              (sessionData.duration || 0) * 60000
          ).toISOString()
        );

      if (conflictError) {
        throw new Error(conflictError.message);
      }

      if (conflicts && conflicts.length > 0) {
        throw new Error('Conflit de planning détecté');
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('sessions')
      // @ts-expect-error - Types Supabase temporairement ignorés
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapSupabaseSessionToSession(data);
  }

  // Supprimer une séance
  static async deleteSession(id: string) {
    const { error } = await supabase.from('sessions').delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Mettre à jour le statut d'une séance
  static async updateSessionStatus(id: string, status: Session['status']) {
    const updateData: Partial<SupabaseSession> = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('sessions')
      // @ts-expect-error - Types Supabase temporairement ignorés
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapSupabaseSessionToSession(data);
  }

  // Obtenir les séances du jour
  static async getTodaySessions() {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('sessions')
      .select(
        `
        *,
        patient:patients(
          id,
          first_name,
          last_name,
          phone
        )
      `
      )
      .gte('scheduled_at', startOfDay.toISOString())
      .lt('scheduled_at', endOfDay.toISOString())
      .order('scheduled_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Obtenir les séances à venir (prochaines 7 jours)
  static async getUpcomingSessions() {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('sessions')
      .select(
        `
        *,
        patient:patients(
          id,
          first_name,
          last_name,
          phone
        )
      `
      )
      .gte('scheduled_at', now.toISOString())
      .lte('scheduled_at', nextWeek.toISOString())
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Obtenir les statistiques des séances
  static async getSessionStats() {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayStats, weekStats, monthStats] = await Promise.all([
      supabase
        .from('sessions')
        .select('id, duration, status')
        .gte('scheduled_at', startOfDay.toISOString())
        .lt(
          'scheduled_at',
          new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString()
        ),
      supabase
        .from('sessions')
        .select('id, duration, status')
        .gte('scheduled_at', startOfWeek.toISOString()),
      supabase
        .from('sessions')
        .select('id, duration, status')
        .gte('scheduled_at', startOfMonth.toISOString()),
    ]);

    if (todayStats.error) throw new Error(todayStats.error.message);
    if (weekStats.error) throw new Error(weekStats.error.message);
    if (monthStats.error) throw new Error(monthStats.error.message);

    return {
      today: {
        sessions: todayStats.data?.length || 0,
        duration:
          todayStats.data?.reduce(
            (sum, session) => sum + (session as { duration: number }).duration,
            0
          ) || 0,
      },
      week: {
        sessions: weekStats.data?.length || 0,
        duration:
          weekStats.data?.reduce(
            (sum, session) => sum + (session as { duration: number }).duration,
            0
          ) || 0,
      },
      month: {
        sessions: monthStats.data?.length || 0,
        duration:
          monthStats.data?.reduce(
            (sum, session) => sum + (session as { duration: number }).duration,
            0
          ) || 0,
      },
    };
  }
}

// Export des méthodes statiques
export const sessionsService = {
  getSessions: SessionsService.getSessions,
  getSession: SessionsService.getSession,
  createSession: SessionsService.createSession,
  updateSession: SessionsService.updateSession,
  deleteSession: SessionsService.deleteSession,
  updateSessionStatus: SessionsService.updateSessionStatus,
  getTodaySessions: SessionsService.getTodaySessions,
  getUpcomingSessions: SessionsService.getUpcomingSessions,
  getSessionStats: SessionsService.getSessionStats,
};

// Service d'export sécurisé pour les données sport - Story 1.5 (CSV Only - Sport MVP)
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';
import type { Database } from '@/types/supabase';

type SportSession = Database['public']['Tables']['sport_sessions']['Row'];
type SportExercise = Database['public']['Tables']['sport_exercises']['Row'];

export interface ExportFilters {
  format: 'csv'; // PDF removed for Sport MVP
  period: 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  sessionTypes?: string[];
  includeMetadata?: boolean;
  includeLegalNotice?: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: string | Blob;
  filename: string;
  error?: string;
}

export interface SanitizedSession {
  id: string;
  name: string;
  date: string;
  type: string;
  status: string;
  duration_minutes: number;
  rpe_score: number | null;
  pain_level: number | null;
  objectives?: string;
  notes?: string;
  exercises: SanitizedExercise[];
  created_at: string;
}

export interface SanitizedExercise {
  id: string;
  name: string;
  exercise_type: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  rest_seconds: number | null;
  order_index: number;
  notes?: string;
}

export class SportExportService {
  /**
   * Export CSV des sessions sport
   */
  static async exportCSV(filters: ExportFilters): Promise<ExportResult> {
    try {
      // Récupération des données
      const sessions = await this.getSessionsForExport(filters);

      // Validation des données
      if (!this.validateExportData(sessions)) {
        throw new Error("Données d'export invalides");
      }

      // Nettoyage des données sensibles
      const sanitizedSessions = this.sanitizeExportData(sessions);

      // Génération du CSV
      const csvData = Papa.unparse(sanitizedSessions, {
        header: true,
        delimiter: ',',
      });

      // Génération du nom de fichier
      const filename = this.generateFilename('csv', filters.period);

      return {
        success: true,
        data: csvData,
        filename,
      };
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  // PDF export removed for Sport MVP to reduce bundle size
  // Use CSV export for lightweight data export

  /**
   * Récupération des sessions pour l'export
   */
  private static async getSessionsForExport(
    filters: ExportFilters
  ): Promise<SportSession[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Calcul des dates selon la période
    const { startDate, endDate } = this.calculateDateRange(filters);

    // Construction de la requête
    let query = supabase
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
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    // Filtres supplémentaires
    if (filters.sessionTypes && filters.sessionTypes.length > 0) {
      query = query.in('type', filters.sessionTypes);
    }

    const { data: sessions, error } = await query;

    if (error) {
      throw new Error(
        `Erreur lors de la récupération des données: ${error.message}`
      );
    }

    return sessions || [];
  }

  /**
   * Validation des données d'export
   */
  static validateExportData(sessions: SportSession[]): boolean {
    if (!Array.isArray(sessions)) {
      return false;
    }

    // Vérifier que toutes les sessions ont les champs requis
    return sessions.every(
      session =>
        session.id &&
        session.name &&
        session.date &&
        session.type &&
        session.status &&
        typeof session.duration_minutes === 'number' &&
        typeof session.rpe_score === 'number' &&
        typeof session.pain_level === 'number'
    );
  }

  /**
   * Nettoyage des données sensibles pour l'export
   */
  static sanitizeExportData(sessions: SportSession[]): SanitizedSession[] {
    return sessions.map(session => ({
      id: session.id,
      name: session.name,
      date: session.date,
      type: session.type,
      status: session.status,
      duration_minutes: session.duration_minutes,
      rpe_score: session.rpe_score,
      pain_level: session.pain_level,
      objectives: session.objectives || undefined,
      notes: session.notes || undefined,
      exercises: ((session.sport_exercises as SportExercise[]) || []).map(
        exercise => ({
          id: exercise.id,
          name: exercise.name,
          exercise_type: exercise.exercise_type,
          sets: exercise.sets,
          reps: exercise.reps,
          weight_kg: exercise.weight_kg,
          duration_seconds: exercise.duration_seconds,
          rest_seconds: exercise.rest_seconds,
          order_index: exercise.order_index,
          notes: exercise.notes || undefined,
        })
      ),
      created_at: session.created_at,
    }));
  }

  /**
   * Calcul de la plage de dates selon la période
   */
  private static calculateDateRange(filters: ExportFilters): {
    startDate: string;
    endDate: string;
  } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (filters.period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        break;
      case 'year':
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
        break;
      case 'custom':
        startDate = filters.startDate
          ? new Date(filters.startDate)
          : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = filters.endDate ? new Date(filters.endDate) : now;
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  /**
   * Génération du nom de fichier
   */
  private static generateFilename(
    format: 'csv',
    period: string
  ): string {
    const date = new Date().toISOString().split('T')[0];
    const periodLabel = this.getPeriodLabel(period);
    return `sport-sessions-${periodLabel}-${date}.${format}`;
  }

  /**
   * Libellé de la période
   */
  private static getPeriodLabel(period: string): string {
    switch (period) {
      case 'week':
        return 'semaine';
      case 'month':
        return 'mois';
      case 'year':
        return 'annee';
      case 'custom':
        return 'personnalise';
      default:
        return 'mois';
    }
  }

  // PDF legal notice removed with PDF export feature
}


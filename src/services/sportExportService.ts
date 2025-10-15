// Service d'export sécurisé pour les données sport - Story 1.5
import { supabase } from '@/lib/supabase';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import type { Database } from '@/types/supabase';

type SportSession = Database['public']['Tables']['sport_sessions']['Row'];
type SportExercise = Database['public']['Tables']['sport_exercises']['Row'];

export interface ExportFilters {
  format: 'csv' | 'pdf';
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
  rpe_score: number;
  pain_level: number;
  objectives?: string;
  notes?: string;
  exercises: SanitizedExercise[];
  created_at: string;
}

export interface SanitizedExercise {
  id: string;
  name: string;
  exercise_type: string;
  sets: number;
  reps: number;
  weight_kg: number;
  duration_seconds: number;
  rest_seconds: number;
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
        encoding: 'UTF-8',
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

  /**
   * Export PDF des sessions sport
   */
  static async exportPDF(filters: ExportFilters): Promise<ExportResult> {
    try {
      // Récupération des données
      const sessions = await this.getSessionsForExport(filters);

      // Validation des données
      if (!this.validateExportData(sessions)) {
        throw new Error("Données d'export invalides");
      }

      // Nettoyage des données sensibles
      const sanitizedSessions = this.sanitizeExportData(sessions);

      // Génération du PDF
      const pdf = new jsPDF();

      // Configuration du PDF
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);

      // En-tête
      pdf.text("Rapport d'Entraînement Sport", 20, 20);
      pdf.text(`Période: ${this.getPeriodLabel(filters.period)}`, 20, 30);
      pdf.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 40);

      // Ligne de séparation
      pdf.line(20, 45, 190, 45);

      // Contenu des sessions
      let yPosition = 60;
      sanitizedSessions.forEach((session, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        // Titre de la session
        pdf.setFontSize(12);
        pdf.text(`${index + 1}. ${session.name}`, 20, yPosition);
        yPosition += 10;

        // Détails de la session
        pdf.setFontSize(10);
        pdf.text(`Date: ${session.date}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Type: ${session.type}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Durée: ${session.duration_minutes} min`, 20, yPosition);
        yPosition += 6;
        pdf.text(`RPE: ${session.rpe_score}/10`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Douleur: ${session.pain_level}/10`, 20, yPosition);
        yPosition += 6;

        // Exercices
        if (session.exercises && session.exercises.length > 0) {
          pdf.text('Exercices:', 20, yPosition);
          yPosition += 6;

          session.exercises.forEach(exercise => {
            pdf.text(
              `- ${exercise.name} (${exercise.exercise_type})`,
              25,
              yPosition
            );
            yPosition += 5;
            if (exercise.sets > 0) {
              pdf.text(
                `  ${exercise.sets} séries x ${exercise.reps} reps`,
                25,
                yPosition
              );
              yPosition += 5;
            }
            if (exercise.weight_kg > 0) {
              pdf.text(`  Poids: ${exercise.weight_kg}kg`, 25, yPosition);
              yPosition += 5;
            }
            if (exercise.duration_seconds > 0) {
              pdf.text(
                `  Durée: ${Math.round(exercise.duration_seconds / 60)}min`,
                25,
                yPosition
              );
              yPosition += 5;
            }
          });
        }

        yPosition += 10;
      });

      // Mentions légales si demandées
      if (filters.includeLegalNotice) {
        this.addLegalNotice(pdf);
      }

      // Génération du nom de fichier
      const filename = this.generateFilename('pdf', filters.period);

      return {
        success: true,
        data: pdf.output('blob'),
        filename,
      };
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

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
    format: 'csv' | 'pdf',
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

  /**
   * Ajout des mentions légales au PDF
   */
  private static addLegalNotice(pdf: jsPDF): void {
    const pageHeight = pdf.internal.pageSize.height;
    const yPosition = pageHeight - 40;

    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);

    pdf.text('Mentions légales:', 20, yPosition);
    pdf.text('- Données personnelles protégées par le RGPD', 20, yPosition + 6);
    pdf.text(
      '- Export généré le ' + new Date().toLocaleString('fr-FR'),
      20,
      yPosition + 12
    );
    pdf.text('- Usage personnel uniquement', 20, yPosition + 18);
  }
}


// Utilitaires de conformité RGPD pour les exports - Story 1.5
import type { Database } from '@/types/supabase';

type SportSession = Database['public']['Tables']['sport_sessions']['Row'];
type SportExercise = Database['public']['Tables']['sport_exercises']['Row'];

export interface GDPRComplianceConfig {
  includePersonalData: boolean;
  anonymizeData: boolean;
  includeLegalNotice: boolean;
  dataRetentionPeriod: number; // en jours
  exportPurpose: string;
  dataController: string;
  dataProcessor: string;
}

export interface SanitizedData {
  sessions: SanitizedSession[];
  metadata: ExportMetadata;
  legalNotice: string;
}

export interface SanitizedSession {
  id: string; // ID anonymisé
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
  id: string; // ID anonymisé
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

export interface ExportMetadata {
  exportDate: string;
  dataRetentionPeriod: number;
  purpose: string;
  dataController: string;
  dataProcessor: string;
  anonymized: boolean;
  version: string;
}

export class GDPRComplianceService {
  private static readonly DEFAULT_CONFIG: GDPRComplianceConfig = {
    includePersonalData: false,
    anonymizeData: true,
    includeLegalNotice: true,
    dataRetentionPeriod: 365, // 1 an
    exportPurpose: "Suivi personnel d'entraînement sportif",
    dataController: 'App-Kine',
    dataProcessor: 'Utilisateur',
  };

  /**
   * Sanitisation des données selon les règles RGPD
   */
  static sanitizeDataForExport(
    sessions: SportSession[],
    config: Partial<GDPRComplianceConfig> = {}
  ): SanitizedData {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    // Anonymisation des IDs
    const anonymizedSessions = this.anonymizeSessionIds(sessions);

    // Suppression des données sensibles
    const sanitizedSessions = anonymizedSessions.map(session =>
      this.sanitizeSession(session, finalConfig)
    );

    // Génération des métadonnées
    const metadata = this.generateExportMetadata(finalConfig);

    // Génération des mentions légales
    const legalNotice = this.generateLegalNotice(finalConfig);

    return {
      sessions: sanitizedSessions,
      metadata,
      legalNotice,
    };
  }

  /**
   * Anonymisation des IDs de session
   */
  private static anonymizeSessionIds(sessions: SportSession[]): SportSession[] {
    const idMapping = new Map<string, string>();
    let counter = 1;

    return sessions.map(session => {
      if (!idMapping.has(session.id)) {
        idMapping.set(
          session.id,
          `SESSION_${counter.toString().padStart(4, '0')}`
        );
        counter++;
      }

      const anonymizedId = idMapping.get(session.id)!;

      return {
        ...session,
        id: anonymizedId,
        user_id: 'ANONYMIZED_USER', // Toujours anonymiser l'ID utilisateur
        sport_exercises: (
          (session.sport_exercises as SportExercise[]) || []
        ).map((exercise, index) => ({
          ...exercise,
          id: `EXERCISE_${anonymizedId}_${index + 1}`,
          session_id: anonymizedId,
        })),
      };
    });
  }

  /**
   * Sanitisation d'une session individuelle
   */
  private static sanitizeSession(
    session: SportSession,
    config: GDPRComplianceConfig
  ): SanitizedSession {
    const sanitized: SanitizedSession = {
      id: session.id,
      name: this.sanitizeText(session.name),
      date: session.date,
      type: session.type,
      status: session.status,
      duration_minutes: session.duration_minutes,
      rpe_score: session.rpe_score,
      pain_level: session.pain_level,
      created_at: session.created_at,
    };

    // Ajout des champs optionnels si autorisés
    if (config.includePersonalData) {
      if (session.objectives) {
        sanitized.objectives = this.sanitizeText(session.objectives);
      }
      if (session.notes) {
        sanitized.notes = this.sanitizeText(session.notes);
      }
    }

    // Sanitisation des exercices
    sanitized.exercises = (
      (session.sport_exercises as SportExercise[]) || []
    ).map(exercise => this.sanitizeExercise(exercise, config));

    return sanitized;
  }

  /**
   * Sanitisation d'un exercice
   */
  private static sanitizeExercise(
    exercise: SportExercise,
    config: GDPRComplianceConfig
  ): SanitizedExercise {
    const sanitized: SanitizedExercise = {
      id: exercise.id,
      name: this.sanitizeText(exercise.name),
      exercise_type: exercise.exercise_type,
      sets: exercise.sets,
      reps: exercise.reps,
      weight_kg: exercise.weight_kg,
      duration_seconds: exercise.duration_seconds,
      rest_seconds: exercise.rest_seconds,
      order_index: exercise.order_index,
    };

    // Ajout des notes si autorisées
    if (config.includePersonalData && exercise.notes) {
      sanitized.notes = this.sanitizeText(exercise.notes);
    }

    return sanitized;
  }

  /**
   * Nettoyage du texte des données sensibles
   */
  private static sanitizeText(text: string): string {
    if (!text) return '';

    // Suppression des informations personnelles potentielles
    let sanitized = text
      // Suppression des emails
      .replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        '[EMAIL_REDACTED]'
      )
      // Suppression des numéros de téléphone
      .replace(/\b(?:\+33|0)[1-9](?:[0-9]{8})\b/g, '[PHONE_REDACTED]')
      // Suppression des adresses IP
      .replace(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, '[IP_REDACTED]')
      // Suppression des noms propres potentiels (mots commençant par une majuscule)
      .replace(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, '[NAME_REDACTED]')
      // Suppression des informations médicales sensibles
      .replace(
        /\b(?:diabète|hypertension|asthme|cancer|sida|vih)\b/gi,
        '[MEDICAL_REDACTED]'
      )
      // Suppression des informations financières
      .replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, '[CARD_REDACTED]')
      // Suppression des codes postaux
      .replace(/\b\d{5}\b/g, '[POSTAL_REDACTED]');

    // Limitation de la longueur
    if (sanitized.length > 500) {
      sanitized = sanitized.substring(0, 500) + '...';
    }

    return sanitized;
  }

  /**
   * Génération des métadonnées d'export
   */
  private static generateExportMetadata(
    config: GDPRComplianceConfig
  ): ExportMetadata {
    return {
      exportDate: new Date().toISOString(),
      dataRetentionPeriod: config.dataRetentionPeriod,
      purpose: config.exportPurpose,
      dataController: config.dataController,
      dataProcessor: config.dataProcessor,
      anonymized: config.anonymizeData,
      version: '1.0.0',
    };
  }

  /**
   * Génération des mentions légales RGPD
   */
  private static generateLegalNotice(config: GDPRComplianceConfig): string {
    const exportDate = new Date().toLocaleDateString('fr-FR');
    const retentionDate = new Date(
      Date.now() + config.dataRetentionPeriod * 24 * 60 * 60 * 1000
    ).toLocaleDateString('fr-FR');

    return `
MENTIONS LÉGALES - EXPORT DE DONNÉES PERSONNELLES

Date d'export: ${exportDate}
Responsable du traitement: ${config.dataController}
Sous-traitant: ${config.dataProcessor}

OBJET DU TRAITEMENT
${config.exportPurpose}

DONNÉES TRAITÉES
- Données d'entraînement sportif (sessions, exercices, métriques)
- Données de performance (RPE, durée, type d'exercice)
- Notes personnelles (si autorisées)

CONFORMITÉ RGPD
✓ Données anonymisées: ${config.anonymizeData ? 'OUI' : 'NON'}
✓ Finalité légitime: ${config.exportPurpose}
✓ Durée de conservation: ${config.dataRetentionPeriod} jours
✓ Droit à l'effacement: Les données peuvent être supprimées à tout moment
✓ Droit à la portabilité: Export réalisé conformément à l'article 20 du RGPD

CONSERVATION DES DONNÉES
Les données exportées doivent être supprimées au plus tard le ${retentionDate}.
Au-delà de cette date, les données ne doivent plus être conservées.

DROITS DE L'UTILISATEUR
- Droit d'accès (article 15 RGPD)
- Droit de rectification (article 16 RGPD)
- Droit à l'effacement (article 17 RGPD)
- Droit à la limitation du traitement (article 18 RGPD)
- Droit à la portabilité (article 20 RGPD)
- Droit d'opposition (article 21 RGPD)

CONTACT
Pour exercer vos droits ou pour toute question relative à ce traitement,
contactez: privacy@app-kine.com

VERSION: 1.0.0 - ${exportDate}
    `.trim();
  }

  /**
   * Validation de la conformité RGPD
   */
  static validateGDPRCompliance(data: SanitizedData): {
    isCompliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Vérification de l'anonymisation
    if (data.sessions.some(session => session.id.includes('user-'))) {
      violations.push('IDs utilisateur non anonymisés détectés');
    }

    // Vérification des données sensibles
    const sensitivePatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // emails
      /\b(?:\+33|0)[1-9](?:[0-9]{8})\b/, // téléphones
      /\b(?:diabète|hypertension|asthme|cancer|sida|vih)\b/i, // médical
    ];

    data.sessions.forEach(session => {
      const textToCheck = `${session.name} ${session.objectives || ''} ${session.notes || ''}`;

      sensitivePatterns.forEach(pattern => {
        if (pattern.test(textToCheck)) {
          violations.push('Données sensibles non supprimées détectées');
        }
      });
    });

    // Recommandations
    if (data.sessions.length > 1000) {
      recommendations.push(
        'Considérer la pagination pour les gros volumes de données'
      );
    }

    if (!data.legalNotice) {
      recommendations.push('Ajouter les mentions légales obligatoires');
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      recommendations,
    };
  }

  /**
   * Audit de sécurité des données exportées
   */
  static auditDataSecurity(data: SanitizedData): {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    issues: string[];
    mitigation: string[];
  } {
    const issues: string[] = [];
    const mitigation: string[] = [];

    // Vérification du volume de données
    const totalSessions = data.sessions.length;
    if (totalSessions > 10000) {
      issues.push('Volume de données élevé');
      mitigation.push('Considérer la segmentation des exports');
    }

    // Vérification des données personnelles
    const hasPersonalData = data.sessions.some(
      session => session.objectives || session.notes
    );

    if (hasPersonalData) {
      issues.push('Données personnelles présentes');
      mitigation.push("Vérifier la nécessité de ces données dans l'export");
    }

    // Détermination du niveau de risque
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (issues.length > 2) {
      riskLevel = 'HIGH';
    } else if (issues.length > 0) {
      riskLevel = 'MEDIUM';
    }

    return {
      riskLevel,
      issues,
      mitigation,
    };
  }
}


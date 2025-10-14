// Script de validation de migration des données - Story 1.5
import { supabase } from '@/lib/supabase';

interface MigrationValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    originalSessions: number;
    migratedSessions: number;
    originalExercises: number;
    migratedExercises: number;
    dataIntegrity: boolean;
  };
}

export class MigrationValidator {
  /**
   * Valider la migration complète des données
   */
  static async validateMigration(): Promise<MigrationValidationResult> {
    const result: MigrationValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      stats: {
        originalSessions: 0,
        migratedSessions: 0,
        originalExercises: 0,
        migratedExercises: 0,
        dataIntegrity: true
      }
    };

    try {
      // 1. Compter les sessions originales
      const { count: originalSessionsCount } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .in('type', ['sport', 'fitness']);

      result.stats.originalSessions = originalSessionsCount || 0;

      // 2. Compter les sessions migrées
      const { count: migratedSessionsCount } = await supabase
        .from('sport_sessions')
        .select('*', { count: 'exact', head: true });

      result.stats.migratedSessions = migratedSessionsCount || 0;

      // 3. Compter les exercices originaux
      const { count: originalExercisesCount } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true })
        .in('session_id', await this.getSportSessionIds());

      result.stats.originalExercises = originalExercisesCount || 0;

      // 4. Compter les exercices migrés
      const { count: migratedExercisesCount } = await supabase
        .from('sport_exercises')
        .select('*', { count: 'exact', head: true });

      result.stats.migratedExercises = migratedExercisesCount || 0;

      // 5. Vérifier l'intégrité des données
      const integrityCheck = await this.validateDataIntegrity();
      result.stats.dataIntegrity = integrityCheck.isValid;

      if (!integrityCheck.isValid) {
        result.errors.push(...integrityCheck.errors);
      }

      // 6. Vérifier la cohérence des migrations
      if (result.stats.originalSessions !== result.stats.migratedSessions) {
        result.warnings.push(
          `Nombre de sessions différent: ${result.stats.originalSessions} originales vs ${result.stats.migratedSessions} migrées`
        );
      }

      if (result.stats.originalExercises !== result.stats.migratedExercises) {
        result.warnings.push(
          `Nombre d'exercices différent: ${result.stats.originalExercises} originaux vs ${result.stats.migratedExercises} migrés`
        );
      }

      // 7. Vérifier les contraintes de données
      const constraintCheck = await this.validateConstraints();
      if (!constraintCheck.isValid) {
        result.errors.push(...constraintCheck.errors);
      }

      // 8. Vérifier les performances
      const performanceCheck = await this.validatePerformance();
      if (!performanceCheck.isValid) {
        result.warnings.push(...performanceCheck.warnings);
      }

      result.success = result.errors.length === 0;

    } catch (error) {
      result.success = false;
      result.errors.push(`Erreur lors de la validation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    return result;
  }

  /**
   * Valider l'intégrité des données migrées
   */
  private static async validateDataIntegrity(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Vérifier que toutes les sessions sport ont des données cohérentes
      const { data: sessions, error: sessionsError } = await supabase
        .from('sport_sessions')
        .select('id, name, date, type, status, rpe_score, pain_level, duration_minutes');

      if (sessionsError) {
        errors.push(`Erreur lors de la récupération des sessions: ${sessionsError.message}`);
        return { isValid: false, errors };
      }

      // Vérifier les contraintes de données
      sessions?.forEach(session => {
        if (!session.name || session.name.trim() === '') {
          errors.push(`Session ${session.id}: nom vide`);
        }

        if (!session.date) {
          errors.push(`Session ${session.id}: date manquante`);
        }

        if (session.rpe_score && (session.rpe_score < 1 || session.rpe_score > 10)) {
          errors.push(`Session ${session.id}: RPE invalide (${session.rpe_score})`);
        }

        if (session.pain_level && (session.pain_level < 1 || session.pain_level > 10)) {
          errors.push(`Session ${session.id}: niveau de douleur invalide (${session.pain_level})`);
        }

        if (session.duration_minutes && (session.duration_minutes <= 0 || session.duration_minutes > 480)) {
          errors.push(`Session ${session.id}: durée invalide (${session.duration_minutes} min)`);
        }
      });

      // Vérifier que tous les exercices ont des sessions parentes valides
      const { data: exercises, error: exercisesError } = await supabase
        .from('sport_exercises')
        .select('id, session_id, name, exercise_type, sets, reps, weight_kg, duration_seconds');

      if (exercisesError) {
        errors.push(`Erreur lors de la récupération des exercices: ${exercisesError.message}`);
        return { isValid: false, errors };
      }

      // Vérifier les contraintes des exercices
      exercises?.forEach(exercise => {
        if (!exercise.name || exercise.name.trim() === '') {
          errors.push(`Exercice ${exercise.id}: nom vide`);
        }

        if (!exercise.session_id) {
          errors.push(`Exercice ${exercise.id}: session_id manquant`);
        }

        if (exercise.sets && (exercise.sets < 0 || exercise.sets > 100)) {
          errors.push(`Exercice ${exercise.id}: nombre de séries invalide (${exercise.sets})`);
        }

        if (exercise.reps && (exercise.reps < 0 || exercise.reps > 1000)) {
          errors.push(`Exercice ${exercise.id}: nombre de répétitions invalide (${exercise.reps})`);
        }

        if (exercise.weight_kg && (exercise.weight_kg < 0 || exercise.weight_kg > 1000)) {
          errors.push(`Exercice ${exercise.id}: poids invalide (${exercise.weight_kg} kg)`);
        }

        if (exercise.duration_seconds && (exercise.duration_seconds < 0 || exercise.duration_seconds > 3600)) {
          errors.push(`Exercice ${exercise.id}: durée invalide (${exercise.duration_seconds} sec)`);
        }
      });

      // Vérifier que tous les exercices ont des sessions parentes existantes
      const sessionIds = new Set(sessions?.map(s => s.id) || []);
      const orphanExercises = exercises?.filter(e => !sessionIds.has(e.session_id)) || [];

      if (orphanExercises.length > 0) {
        errors.push(`${orphanExercises.length} exercices orphelins détectés`);
      }

    } catch (error) {
      errors.push(`Erreur lors de la validation de l'intégrité: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Valider les contraintes de base de données
   */
  private static async validateConstraints(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Vérifier que les types ENUM sont corrects
      const { data: invalidTypes } = await supabase
        .from('sport_sessions')
        .select('id, type')
        .not('type', 'in', ['cardio', 'musculation', 'flexibility', 'other']);

      if (invalidTypes && invalidTypes.length > 0) {
        errors.push(`Types de session invalides détectés: ${invalidTypes.map(s => s.id).join(', ')}`);
      }

      const { data: invalidStatuses } = await supabase
        .from('sport_sessions')
        .select('id, status')
        .not('status', 'in', ['draft', 'in_progress', 'completed']);

      if (invalidStatuses && invalidStatuses.length > 0) {
        errors.push(`Statuts de session invalides détectés: ${invalidStatuses.map(s => s.id).join(', ')}`);
      }

      const { data: invalidExerciseTypes } = await supabase
        .from('sport_exercises')
        .select('id, exercise_type')
        .not('exercise_type', 'in', ['cardio', 'musculation', 'flexibility', 'other']);

      if (invalidExerciseTypes && invalidExerciseTypes.length > 0) {
        errors.push(`Types d'exercice invalides détectés: ${invalidExerciseTypes.map(e => e.id).join(', ')}`);
      }

    } catch (error) {
      errors.push(`Erreur lors de la validation des contraintes: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Valider les performances des requêtes
   */
  private static async validatePerformance(): Promise<{ isValid: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    try {
      // Tester la performance des requêtes principales
      const startTime = performance.now();

      // Test de récupération des sessions
      const { error: sessionsError } = await supabase
        .from('sport_sessions')
        .select('*')
        .limit(100);

      const sessionsTime = performance.now() - startTime;

      if (sessionsTime > 1000) {
        warnings.push(`Requête des sessions lente: ${sessionsTime.toFixed(2)}ms`);
      }

      // Test de récupération des exercices
      const exerciseStartTime = performance.now();

      const { error: exercisesError } = await supabase
        .from('sport_exercises')
        .select('*')
        .limit(100);

      const exercisesTime = performance.now() - exerciseStartTime;

      if (exercisesTime > 1000) {
        warnings.push(`Requête des exercices lente: ${exercisesTime.toFixed(2)}ms`);
      }

      // Test de la fonction de statistiques
      const statsStartTime = performance.now();

      const { error: statsError } = await supabase
        .rpc('get_sport_stats', { user_uuid: '00000000-0000-0000-0000-000000000000', period_days: 30 });

      const statsTime = performance.now() - statsStartTime;

      if (statsTime > 2000) {
        warnings.push(`Fonction de statistiques lente: ${statsTime.toFixed(2)}ms`);
      }

    } catch (error) {
      warnings.push(`Erreur lors de la validation des performances: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    return { isValid: warnings.length === 0, warnings };
  }

  /**
   * Obtenir les IDs des sessions sport originales
   */
  private static async getSportSessionIds(): Promise<string[]> {
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id')
      .in('type', ['sport', 'fitness']);

    return sessions?.map(s => s.id) || [];
  }

  /**
   * Exécuter la migration des données
   */
  static async executeMigration(): Promise<{ success: boolean; message: string; migratedCount: number }> {
    try {
      // Exécuter la migration des sessions
      const { data: sessionsResult, error: sessionsError } = await supabase
        .rpc('migrate_sessions_to_sport_sessions');

      if (sessionsError) {
        throw new Error(`Erreur migration sessions: ${sessionsError.message}`);
      }

      // Exécuter la migration des exercices
      const { data: exercisesResult, error: exercisesError } = await supabase
        .rpc('migrate_exercises_to_sport_exercises');

      if (exercisesError) {
        throw new Error(`Erreur migration exercices: ${exercisesError.message}`);
      }

      const totalMigrated = (sessionsResult || 0) + (exercisesResult || 0);

      return {
        success: true,
        message: `Migration réussie: ${sessionsResult} sessions et ${exercisesResult} exercices migrés`,
        migratedCount: totalMigrated
      };

    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de la migration: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        migratedCount: 0
      };
    }
  }

  /**
   * Générer un rapport de migration
   */
  static async generateMigrationReport(): Promise<string> {
    const validation = await this.validateMigration();
    const migration = await this.executeMigration();

    const report = `
# RAPPORT DE MIGRATION - STORY 1.5

## Résumé
- **Date**: ${new Date().toLocaleString('fr-FR')}
- **Statut**: ${validation.success ? 'SUCCÈS' : 'ÉCHEC'}
- **Données migrées**: ${migration.migratedCount}

## Statistiques
- Sessions originales: ${validation.stats.originalSessions}
- Sessions migrées: ${validation.stats.migratedSessions}
- Exercices originaux: ${validation.stats.originalExercises}
- Exercices migrés: ${validation.stats.migratedExercises}
- Intégrité des données: ${validation.stats.dataIntegrity ? 'OK' : 'ERREUR'}

## Erreurs
${validation.errors.length > 0 ? validation.errors.map(e => `- ${e}`).join('\n') : 'Aucune erreur'}

## Avertissements
${validation.warnings.length > 0 ? validation.warnings.map(w => `- ${w}`).join('\n') : 'Aucun avertissement'}

## Recommandations
${validation.success ? 
  'Migration réussie. Les données sont prêtes pour la Story 1.5.' : 
  'Corriger les erreurs avant de procéder au développement.'
}
    `;

    return report;
  }
}

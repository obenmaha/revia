import { supabase } from '../lib/supabase';

// Service de test pour vérifier la connexion Supabase
export class TestService {
  // Test de connexion à Supabase
  static async testConnection() {
    try {
      const { error } = await supabase.from('users').select('count').limit(1);

      if (error) {
        throw new Error(`Erreur de connexion Supabase: ${error.message}`);
      }

      return {
        success: true,
        message: 'Connexion Supabase réussie',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Test des politiques RLS
  static async testRLS() {
    try {
      // Test de lecture des utilisateurs (doit respecter RLS)
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) {
        throw new Error(`Erreur RLS users: ${usersError.message}`);
      }

      // Test de lecture des patients (doit respecter RLS)
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*');

      if (patientsError) {
        throw new Error(`Erreur RLS patients: ${patientsError.message}`);
      }

      return {
        success: true,
        message: 'Politiques RLS fonctionnelles',
        usersCount: users?.length || 0,
        patientsCount: patients?.length || 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur RLS: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Test complet de la base de données
  static async testDatabase() {
    const results = {
      connection: await this.testConnection(),
      rls: await this.testRLS(),
    };

    const allSuccess = results.connection.success && results.rls.success;

    return {
      success: allSuccess,
      message: allSuccess
        ? 'Tous les tests sont passés'
        : 'Certains tests ont échoué',
      results,
      timestamp: new Date().toISOString(),
    };
  }
}

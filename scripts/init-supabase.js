#!/usr/bin/env node

/**
 * Script d'initialisation Supabase pour App-Kine
 * Ce script applique la migration initiale à la base de données Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Supabase
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || 'https://ernzqcqoopqfqmrmcnug.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error(
    '❌ VITE_SUPABASE_SERVICE_ROLE_KEY est requis pour exécuter les migrations'
  );
  console.log('💡 Ajoutez votre service role key dans .env.local');
  process.exit(1);
}

// Créer le client Supabase avec la service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  try {
    console.log('🚀 Initialisation de la base de données Supabase...');

    // Lire le fichier de migration
    const migrationPath = path.join(
      __dirname,
      '../supabase/migrations/001_initial_schema.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Application de la migration initiale...');

    // Exécuter la migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL,
    });

    if (error) {
      console.error("❌ Erreur lors de l'application de la migration:", error);
      process.exit(1);
    }

    console.log('✅ Migration appliquée avec succès!');
    console.log('🎉 Base de données App-Kine initialisée');

    // Vérifier que les tables ont été créées
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'users',
        'patients',
        'sessions',
        'invoices',
        'payments',
        'documents',
      ]);

    if (tablesError) {
      console.warn('⚠️ Impossible de vérifier les tables créées');
    } else {
      console.log(
        '📊 Tables créées:',
        tables.map(t => t.table_name).join(', ')
      );
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    process.exit(1);
  }
}

// Exécuter le script
runMigration();

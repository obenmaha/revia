#!/usr/bin/env node
/**
 * Script pour générer les types TypeScript depuis le schéma Supabase
 *
 * Usage:
 *   npm run types:generate
 *
 * Prérequis:
 *   - Supabase CLI installé (npx supabase)
 *   - Variables d'environnement configurées
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔧 Génération des types Supabase...\n');

// Vérifier que les migrations existent
const migrationsDir = join(rootDir, 'supabase', 'migrations');
if (!existsSync(migrationsDir)) {
  console.error('❌ Erreur: Aucun dossier de migrations trouvé');
  console.error(
    "   Créez d'abord vos migrations SQL dans supabase/migrations/"
  );
  process.exit(1);
}

// Méthode 1: Essayer avec le projet Supabase distant
console.log(
  '📡 Tentative de génération depuis le projet Supabase distant...\n'
);

try {
  // Lire les variables d'environnement
  const envPath = join(rootDir, '.env.local');
  let projectRef = null;

  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    const urlMatch = envContent.match(
      /VITE_SUPABASE_URL=https:\/\/([^.]+)\.supabase\.co/
    );
    if (urlMatch) {
      projectRef = urlMatch[1];
      console.log(`✅ Projet Supabase détecté: ${projectRef}\n`);
    }
  }

  if (projectRef) {
    console.log('🌐 Génération des types depuis le projet distant...');
    const output = join(rootDir, 'src', 'types', 'supabase-generated.ts');

    try {
      execSync(
        `npx supabase gen types typescript --project-id ${projectRef} > "${output}"`,
        {
          stdio: 'inherit',
          cwd: rootDir,
        }
      );
      console.log(`\n✅ Types générés avec succès: ${output}\n`);
      addTypeExports(output);
      process.exit(0);
    } catch (error) {
      console.warn('⚠️  Échec de la génération depuis le projet distant');
      console.warn('   Essai avec les migrations locales...\n');
    }
  }
} catch (error) {
  console.warn('⚠️  Impossible de détecter le projet Supabase distant\n');
}

// Méthode 2: Générer depuis les migrations locales
console.log('📂 Génération des types depuis les migrations locales...\n');

try {
  const output = join(rootDir, 'src', 'types', 'supabase-generated.ts');

  // Utiliser supabase db diff pour générer les types
  execSync(`npx supabase gen types typescript --local > "${output}"`, {
    stdio: 'inherit',
    cwd: rootDir,
  });

  console.log(`\n✅ Types générés avec succès: ${output}\n`);
  addTypeExports(output);
  process.exit(0);
} catch (error) {
  console.error('\n❌ Erreur lors de la génération des types');
  console.error('   Assurez-vous que Supabase CLI est installé:');
  console.error('   npm install -g supabase\n');

  // Méthode 3: Créer un fichier de types de base manuellement
  console.log("📝 Création d'un fichier de types de base...\n");
  createBasicTypes();
}

/**
 * Ajouter les exports de types utiles
 */
function addTypeExports(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');

    // Ajouter des exports de convenance
    const exports = `
// Types de convenance exportés
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Types spécifiques pour les tables principales
export type User = Tables<'users'>;
export type Patient = Tables<'patients'>;
export type Session = Tables<'sessions'>;
export type Exercise = Tables<'exercises'>;
export type Invoice = Tables<'invoices'>;
export type Payment = Tables<'payments'>;
export type Document = Tables<'documents'>;
`;

    content += exports;
    writeFileSync(filePath, content, 'utf-8');
    console.log('✅ Exports de types ajoutés\n');
  } catch (error) {
    console.warn("⚠️  Impossible d'ajouter les exports de types");
  }
}

/**
 * Créer un fichier de types de base à partir des migrations
 */
function createBasicTypes() {
  const output = join(rootDir, 'src', 'types', 'supabase-generated.ts');

  const basicTypes = `/**
 * Types Supabase générés automatiquement
 *
 * IMPORTANT: Ce fichier contient des types de base.
 * Pour une génération complète, utilisez:
 *   npm run types:generate
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'PRACTITIONER' | 'ADMIN'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          role?: 'PRACTITIONER' | 'ADMIN'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'PRACTITIONER' | 'ADMIN'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          practitioner_id: string
          first_name: string
          last_name: string
          birth_date: string
          phone: string | null
          email: string | null
          address: Json | null
          medical_info: Json | null
          emergency_contact: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          practitioner_id: string
          first_name: string
          last_name: string
          birth_date: string
          phone?: string | null
          email?: string | null
          address?: Json | null
          medical_info?: Json | null
          emergency_contact?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          practitioner_id?: string
          first_name?: string
          last_name?: string
          birth_date?: string
          phone?: string | null
          email?: string | null
          address?: Json | null
          medical_info?: Json | null
          emergency_contact?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          patient_id: string
          practitioner_id: string
          scheduled_at: string
          duration: number
          status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
          notes: string | null
          objectives: Json | null
          exercises: Json | null
          evaluation: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          practitioner_id: string
          scheduled_at: string
          duration: number
          status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
          notes?: string | null
          objectives?: Json | null
          exercises?: Json | null
          evaluation?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          practitioner_id?: string
          scheduled_at?: string
          duration?: number
          status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
          notes?: string | null
          objectives?: Json | null
          exercises?: Json | null
          evaluation?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          session_id: string
          name: string
          description: string | null
          sets: number | null
          reps: number | null
          duration: number | null
          notes: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          name: string
          description?: string | null
          sets?: number | null
          reps?: number | null
          duration?: number | null
          notes?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          name?: string
          description?: string | null
          sets?: number | null
          reps?: number | null
          duration?: number | null
          notes?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          patient_id: string
          practitioner_id: string
          invoice_number: string
          amount: number
          status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
          due_date: string
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          practitioner_id: string
          invoice_number: string
          amount: number
          status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
          due_date: string
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          practitioner_id?: string
          invoice_number?: string
          amount?: number
          status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
          due_date?: string
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          payment_method: string
          payment_date: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          payment_method: string
          payment_date: string
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          payment_method?: string
          payment_date?: string
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          patient_id: string
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'PRACTITIONER' | 'ADMIN'
      session_status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
      invoice_status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
    }
  }
}

// Types de convenance
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
`;

  writeFileSync(output, basicTypes, 'utf-8');
  console.log(`✅ Types de base créés: ${output}\n`);
  console.log(
    '⚠️  Note: Ces types sont basiques. Pour une génération complète:'
  );
  console.log('   1. Installez Supabase CLI: npm install -g supabase');
  console.log('   2. Relancez: npm run types:generate\n');
}

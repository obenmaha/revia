#!/usr/bin/env ts-node

/**
 * RLS Smoke Tests - A/B Isolation Testing
 * Verifies Row Level Security policies work correctly across all tables
 *
 * Tests that:
 * 1. User A can only see their own data
 * 2. User B can only see their own data
 * 3. User A cannot see User B's data and vice versa
 * 4. Admins can see all data (if applicable)
 *
 * Usage: npx ts-node scripts/rls-smoke.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/supabase';

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Test user credentials (should be created beforehand or use existing test users)
const TEST_USER_A = {
  email: process.env.TEST_USER_A_EMAIL || 'test-a@example.com',
  password: process.env.TEST_USER_A_PASSWORD || 'testpassword123',
};

const TEST_USER_B = {
  email: process.env.TEST_USER_B_EMAIL || 'test-b@example.com',
  password: process.env.TEST_USER_B_PASSWORD || 'testpassword123',
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

class RLSTester {
  private results: TestResult[] = [];
  private clientA!: SupabaseClient<Database>;
  private clientB!: SupabaseClient<Database>;
  private userAId!: string;
  private userBId!: string;

  constructor() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
  }

  private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
    console.log(`${icons[type]} ${message}`);
  }

  private async setupClients(): Promise<void> {
    this.log('Setting up test clients...', 'info');

    // Create clients for both users
    this.clientA = createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    this.clientB = createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    // Sign in User A
    const { data: dataA, error: errorA } = await this.clientA.auth.signInWithPassword(TEST_USER_A);
    if (errorA || !dataA.user) {
      throw new Error(`Failed to sign in User A: ${errorA?.message}`);
    }
    this.userAId = dataA.user.id;
    this.log(`User A signed in: ${this.userAId}`, 'success');

    // Sign in User B
    const { data: dataB, error: errorB } = await this.clientB.auth.signInWithPassword(TEST_USER_B);
    if (errorB || !dataB.user) {
      throw new Error(`Failed to sign in User B: ${errorB?.message}`);
    }
    this.userBId = dataB.user.id;
    this.log(`User B signed in: ${this.userBId}`, 'success');
  }

  private async cleanup(): Promise<void> {
    this.log('Cleaning up test data...', 'info');

    // Sign out both users
    await this.clientA.auth.signOut();
    await this.clientB.auth.signOut();

    this.log('Cleanup completed', 'success');
  }

  private recordResult(name: string, passed: boolean, error?: string, details?: string) {
    this.results.push({ name, passed, error, details });
    const status = passed ? 'success' : 'error';
    this.log(`${name}: ${passed ? 'PASSED' : 'FAILED'}${error ? ` - ${error}` : ''}`, status);
  }

  // Test patients table RLS
  private async testPatientsRLS(): Promise<void> {
    this.log('\n📋 Testing PATIENTS table RLS...', 'info');

    // User A creates a patient
    const { data: patientA, error: errorCreateA } = await this.clientA
      .from('patients')
      .insert({
        practitioner_id: this.userAId,
        first_name: 'Test',
        last_name: 'PatientA',
        birth_date: '1990-01-01',
        phone: '0601020304',
        address: { street: '1 Rue Test', city: 'Paris', postalCode: '75001', country: 'France' },
        emergency_contact: { name: 'Contact A', relationship: 'Family', phone: '0601020305' },
      })
      .select()
      .single();

    this.recordResult(
      'User A can create patient',
      !errorCreateA && !!patientA,
      errorCreateA?.message
    );

    // User B creates a patient
    const { data: patientB, error: errorCreateB } = await this.clientB
      .from('patients')
      .insert({
        practitioner_id: this.userBId,
        first_name: 'Test',
        last_name: 'PatientB',
        birth_date: '1992-02-02',
        phone: '0602030405',
        address: { street: '2 Rue Test', city: 'Lyon', postalCode: '69001', country: 'France' },
        emergency_contact: { name: 'Contact B', relationship: 'Friend', phone: '0602030406' },
      })
      .select()
      .single();

    this.recordResult(
      'User B can create patient',
      !errorCreateB && !!patientB,
      errorCreateB?.message
    );

    if (!patientA || !patientB) return;

    // User A tries to read their own patient
    const { data: readOwnA, error: errorReadOwnA } = await this.clientA
      .from('patients')
      .select('*')
      .eq('id', patientA.id)
      .single();

    this.recordResult(
      'User A can read own patient',
      !errorReadOwnA && !!readOwnA,
      errorReadOwnA?.message
    );

    // User A tries to read User B's patient
    const { data: readOtherA, error: errorReadOtherA } = await this.clientA
      .from('patients')
      .select('*')
      .eq('id', patientB.id)
      .maybeSingle();

    this.recordResult(
      'User A cannot read User B\'s patient',
      !readOtherA,
      readOtherA ? 'RLS violation: User A can see User B\'s data' : undefined,
      `Expected no data, got: ${readOtherA ? 'data' : 'null'}`
    );

    // User B tries to read User A's patient
    const { data: readOtherB, error: errorReadOtherB } = await this.clientB
      .from('patients')
      .select('*')
      .eq('id', patientA.id)
      .maybeSingle();

    this.recordResult(
      'User B cannot read User A\'s patient',
      !readOtherB,
      readOtherB ? 'RLS violation: User B can see User A\'s data' : undefined,
      `Expected no data, got: ${readOtherB ? 'data' : 'null'}`
    );

    // Cleanup test data
    await this.clientA.from('patients').delete().eq('id', patientA.id);
    await this.clientB.from('patients').delete().eq('id', patientB.id);
  }

  // Test sessions table RLS
  private async testSessionsRLS(): Promise<void> {
    this.log('\n📅 Testing SESSIONS table RLS...', 'info');

    // First create patients for the sessions
    const { data: patientA } = await this.clientA
      .from('patients')
      .insert({
        practitioner_id: this.userAId,
        first_name: 'Session',
        last_name: 'PatientA',
        birth_date: '1990-01-01',
        phone: '0601020304',
        address: { street: '1 Rue Test', city: 'Paris', postalCode: '75001', country: 'France' },
        emergency_contact: { name: 'Contact A', relationship: 'Family', phone: '0601020305' },
      })
      .select('id')
      .single();

    const { data: patientB } = await this.clientB
      .from('patients')
      .insert({
        practitioner_id: this.userBId,
        first_name: 'Session',
        last_name: 'PatientB',
        birth_date: '1992-02-02',
        phone: '0602030405',
        address: { street: '2 Rue Test', city: 'Lyon', postalCode: '69001', country: 'France' },
        emergency_contact: { name: 'Contact B', relationship: 'Friend', phone: '0602030406' },
      })
      .select('id')
      .single();

    if (!patientA || !patientB) {
      this.log('Failed to create test patients for sessions', 'error');
      return;
    }

    // User A creates a session
    const { data: sessionA, error: errorCreateA } = await this.clientA
      .from('sessions')
      .insert({
        patient_id: patientA.id,
        practitioner_id: this.userAId,
        scheduled_at: new Date().toISOString(),
        duration: 60,
        status: 'SCHEDULED',
      })
      .select()
      .single();

    this.recordResult(
      'User A can create session',
      !errorCreateA && !!sessionA,
      errorCreateA?.message
    );

    // User B creates a session
    const { data: sessionB, error: errorCreateB } = await this.clientB
      .from('sessions')
      .insert({
        patient_id: patientB.id,
        practitioner_id: this.userBId,
        scheduled_at: new Date().toISOString(),
        duration: 45,
        status: 'SCHEDULED',
      })
      .select()
      .single();

    this.recordResult(
      'User B can create session',
      !errorCreateB && !!sessionB,
      errorCreateB?.message
    );

    if (!sessionA || !sessionB) {
      await this.clientA.from('patients').delete().eq('id', patientA.id);
      await this.clientB.from('patients').delete().eq('id', patientB.id);
      return;
    }

    // Test isolation
    const { data: readOtherSessionA } = await this.clientA
      .from('sessions')
      .select('*')
      .eq('id', sessionB.id)
      .maybeSingle();

    this.recordResult(
      'User A cannot read User B\'s session',
      !readOtherSessionA,
      readOtherSessionA ? 'RLS violation: User A can see User B\'s session' : undefined
    );

    const { data: readOtherSessionB } = await this.clientB
      .from('sessions')
      .select('*')
      .eq('id', sessionA.id)
      .maybeSingle();

    this.recordResult(
      'User B cannot read User A\'s session',
      !readOtherSessionB,
      readOtherSessionB ? 'RLS violation: User B can see User A\'s session' : undefined
    );

    // Cleanup
    await this.clientA.from('sessions').delete().eq('id', sessionA.id);
    await this.clientB.from('sessions').delete().eq('id', sessionB.id);
    await this.clientA.from('patients').delete().eq('id', patientA.id);
    await this.clientB.from('patients').delete().eq('id', patientB.id);
  }

  // Test user_profile table RLS
  private async testUserProfileRLS(): Promise<void> {
    this.log('\n👤 Testing USER_PROFILE table RLS...', 'info');

    // User A creates/updates their profile
    const { data: profileA, error: errorA } = await this.clientA
      .from('user_profile')
      .upsert({
        user_id: this.userAId,
        first_name: 'UserA',
        last_name: 'TestA',
      })
      .select()
      .single();

    this.recordResult(
      'User A can create/update own profile',
      !errorA && !!profileA,
      errorA?.message
    );

    // User B creates/updates their profile
    const { data: profileB, error: errorB } = await this.clientB
      .from('user_profile')
      .upsert({
        user_id: this.userBId,
        first_name: 'UserB',
        last_name: 'TestB',
      })
      .select()
      .single();

    this.recordResult(
      'User B can create/update own profile',
      !errorB && !!profileB,
      errorB?.message
    );

    // User A tries to read User B's profile
    const { data: readOtherProfileA } = await this.clientA
      .from('user_profile')
      .select('*')
      .eq('user_id', this.userBId)
      .maybeSingle();

    this.recordResult(
      'User A cannot read User B\'s profile',
      !readOtherProfileA,
      readOtherProfileA ? 'RLS violation: User A can see User B\'s profile' : undefined
    );

    // Cleanup
    await this.clientA.from('user_profile').delete().eq('user_id', this.userAId);
    await this.clientB.from('user_profile').delete().eq('user_id', this.userBId);
  }

  // Test notification_preferences table RLS
  private async testNotificationPreferencesRLS(): Promise<void> {
    this.log('\n🔔 Testing NOTIFICATION_PREFERENCES table RLS...', 'info');

    // User A creates preferences
    const { data: prefsA, error: errorA } = await this.clientA
      .from('notification_preferences')
      .upsert({
        user_id: this.userAId,
        email_enabled: true,
        push_enabled: false,
        reminder_time: '09:00',
        reminder_days: [1, 3, 5],
        reminder_frequency: 'twice_weekly',
        timezone: 'Europe/Paris',
      })
      .select()
      .single();

    this.recordResult(
      'User A can create/update own preferences',
      !errorA && !!prefsA,
      errorA?.message
    );

    // User B creates preferences
    const { data: prefsB, error: errorB } = await this.clientB
      .from('notification_preferences')
      .upsert({
        user_id: this.userBId,
        email_enabled: false,
        push_enabled: true,
        reminder_time: '18:00',
        reminder_days: [2, 4],
        reminder_frequency: 'weekly',
        timezone: 'Europe/Paris',
      })
      .select()
      .single();

    this.recordResult(
      'User B can create/update own preferences',
      !errorB && !!prefsB,
      errorB?.message
    );

    // Test isolation
    const { data: readOtherPrefsA } = await this.clientA
      .from('notification_preferences')
      .select('*')
      .eq('user_id', this.userBId)
      .maybeSingle();

    this.recordResult(
      'User A cannot read User B\'s preferences',
      !readOtherPrefsA,
      readOtherPrefsA ? 'RLS violation' : undefined
    );

    // Cleanup
    await this.clientA.from('notification_preferences').delete().eq('user_id', this.userAId);
    await this.clientB.from('notification_preferences').delete().eq('user_id', this.userBId);
  }

  private printSummary(): void {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(60));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`Total tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.name}`);
          if (r.error) console.log(`    Error: ${r.error}`);
          if (r.details) console.log(`    Details: ${r.details}`);
        });
    }

    console.log('═'.repeat(60) + '\n');
  }

  async run(): Promise<boolean> {
    try {
      console.log('🚀 Starting RLS Smoke Tests\n');

      await this.setupClients();

      // Run all tests
      await this.testPatientsRLS();
      await this.testSessionsRLS();
      await this.testUserProfileRLS();
      await this.testNotificationPreferencesRLS();

      await this.cleanup();

      this.printSummary();

      const allPassed = this.results.every(r => r.passed);
      if (allPassed) {
        this.log('All RLS tests passed!', 'success');
      } else {
        this.log('Some RLS tests failed!', 'error');
      }

      return allPassed;
    } catch (error) {
      this.log(`Fatal error: ${error instanceof Error ? error.message : String(error)}`, 'error');
      return false;
    }
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new RLSTester();
  tester.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { RLSTester };

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock des variables d'environnement
const mockEnv = {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_API_TIMEOUT: '10000',
  VITE_APP_NAME: 'App-Kine',
  VITE_APP_VERSION: '1.0.0',
  VITE_DEBUG: 'true',
  VITE_LOG_LEVEL: 'debug',
};

describe('Sécurité des variables d\'environnement', () => {
  beforeEach(() => {
    // Reset des mocks
    vi.resetModules();
    
    // Mock import.meta.env
    vi.stubGlobal('import', {
      meta: {
        env: mockEnv
      }
    });
  });

  it('devrait rejeter la présence de SERVICE_ROLE_KEY côté frontend', async () => {
    // Simuler la présence d'une clé service_role (interdite)
    const envWithServiceRole = {
      ...mockEnv,
      VITE_SUPABASE_SERVICE_ROLE_KEY: 'sk_test_service_role_key'
    };

    vi.stubGlobal('import', {
      meta: {
        env: envWithServiceRole
      }
    });

    // Recharger le module pour appliquer les nouvelles variables
    const { validateEnv } = await import('../config/env');

    // La validation devrait échouer
    expect(() => validateEnv()).toThrow('SERVICE_ROLE_KEY interdite côté frontend');
  });

  it('devrait accepter une configuration valide sans SERVICE_ROLE_KEY', async () => {
    // Configuration valide sans service_role
    vi.stubGlobal('import', {
      meta: {
        env: mockEnv
      }
    });

    // Recharger le module
    const { validateEnv } = await import('../config/env');

    // La validation devrait réussir
    expect(validateEnv()).toBe(true);
  });

  it('devrait rejeter une configuration sans ANON_KEY', async () => {
    const envWithoutAnonKey = {
      ...mockEnv,
      VITE_SUPABASE_ANON_KEY: ''
    };

    vi.stubGlobal('import', {
      meta: {
        env: envWithoutAnonKey
      }
    });

    const { validateEnv } = await import('../config/env');

    expect(() => validateEnv()).toThrow('VITE_SUPABASE_ANON_KEY est requis');
  });

  it('devrait rejeter une URL Supabase invalide', async () => {
    const envWithInvalidUrl = {
      ...mockEnv,
      VITE_SUPABASE_URL: 'not-a-valid-url'
    };

    vi.stubGlobal('import', {
      meta: {
        env: envWithInvalidUrl
      }
    });

    const { validateEnv } = await import('../config/env');

    expect(() => validateEnv()).toThrow();
  });

  it('devrait rejeter un timeout API invalide', async () => {
    const envWithInvalidTimeout = {
      ...mockEnv,
      VITE_API_TIMEOUT: '-1000'
    };

    vi.stubGlobal('import', {
      meta: {
        env: envWithInvalidTimeout
      }
    });

    const { validateEnv } = await import('../config/env');

    expect(() => validateEnv()).toThrow('VITE_API_TIMEOUT doit être un nombre positif');
  });
});

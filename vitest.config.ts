import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// ESM-safe __dirname
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,

    // Timeouts stables
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,

    // Mocks propres
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,

    // Inclure tous les tests Sport MVP, exclure cabinet/clinic/pwa/export/_deprecated/old
    include: [
      'src/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/__tests__/**/*{cabinet,clinic,pwa,export,_deprecated,old}*',
      '**/playwright/**' // Séparer E2E Playwright de Vitest
    ],

    // Workers stabilisés pour MVP (1-2 workers)
    pool: 'threads',
    poolOptions: { threads: { singleThread: false, minThreads: 1, maxThreads: 2 } },

    // Charger .env.test (pas de mock hardcodé)
    env: {
      VITE_SUPABASE_URL: 'https://mock.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
      VITE_APP_NAME: 'App-Kine',
      VITE_APP_VERSION: '1.0.0',
      VITE_DEBUG: 'true',
      VITE_LOG_LEVEL: 'debug',
      VITE_API_TIMEOUT: '10000',
      NODE_ENV: 'test',
      // Mode test pour MVP
      VITE_APP_MODE: 'test',
      VITE_SPORT_MODE: 'false',
      VITE_CABINET_MODE: 'false',
      VITE_GUEST_MODE: 'true',
      VITE_ANALYTICS_ENABLED: 'false'
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/__tests__/**'
      ],
      // Seuils visés >95% sur le périmètre MVP
      thresholds: { global: { branches: 95, functions: 95, lines: 95, statements: 95 } }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/stores': resolve(__dirname, './src/stores'),
      '@/services': resolve(__dirname, './src/services'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types')
    }
  }
});

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

    // Ignorer les tests "cabinet/clinic/export/pwa" pendant le deep clean
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/__tests__/{cabinet,clinic,patients,patient,invoices,invoice,billing,practitioner,appointment,agenda,export,pwa,_deprecated,old}/**',
      '**/playwright/**' // si tu veux séparer E2E Playwright de Vitest
    ],

    // Réduire la pression CPU (Windows)
    pool: 'threads',
    poolOptions: { threads: { singleThread: false, minThreads: 1, maxThreads: 2 } },

    env: {
      VITE_SUPABASE_URL: 'https://mock.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
      VITE_APP_NAME: 'App-Kine',
      VITE_APP_VERSION: '1.0.0',
      VITE_DEBUG: 'true',
      VITE_LOG_LEVEL: 'debug',
      VITE_API_TIMEOUT: '10000',
      NODE_ENV: 'test'
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
      // Pendant le clean, tu peux baisser les seuils si besoin
      thresholds: { global: { branches: 60, functions: 60, lines: 60, statements: 60 } }
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

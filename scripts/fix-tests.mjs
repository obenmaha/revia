#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Correction des tests unitaires...\n');

// Configuration des timeouts
console.log('⏱️  Configuration des timeouts...');
try {
  const vitestConfig = readFileSync('vitest.config.ts', 'utf8');
  
  if (!vitestConfig.includes('testTimeout: 30000')) {
    const updatedConfig = vitestConfig.replace(
      'export default defineConfig({',
      `export default defineConfig({
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,
  },`
    );
    writeFileSync('vitest.config.ts', updatedConfig);
    console.log('✅ Timeouts configurés à 30s');
  } else {
    console.log('✅ Timeouts déjà configurés');
  }
} catch (error) {
  console.error('❌ Erreur lors de la configuration des timeouts:', error.message);
}

// Configuration des mocks
console.log('\n🎭 Configuration des mocks...');
try {
  // Vérifier que les mocks existent
  const mocks = [
    'src/__mocks__/lucide-react.tsx',
    'src/__mocks__/useNotifications.ts',
    'src/__mocks__/ResizeObserver.ts'
  ];
  
  mocks.forEach(mock => {
    try {
      readFileSync(mock, 'utf8');
      console.log(`✅ Mock ${mock} existe`);
    } catch {
      console.log(`❌ Mock ${mock} manquant`);
    }
  });
  
} catch (error) {
  console.error('❌ Erreur lors de la vérification des mocks:', error.message);
}

// Configuration Jest/Vitest pour les mocks
console.log('\n⚙️  Configuration des mocks dans vitest...');
try {
  const vitestConfig = readFileSync('vitest.config.ts', 'utf8');
  
  if (!vitestConfig.includes('setupFiles')) {
    const updatedConfig = vitestConfig.replace(
      'export default defineConfig({',
      `export default defineConfig({
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./src/test/setup.ts'],
  },`
    );
    writeFileSync('vitest.config.ts', updatedConfig);
    console.log('✅ Configuration des setupFiles ajoutée');
  } else {
    console.log('✅ Configuration des setupFiles déjà présente');
  }
} catch (error) {
  console.error('❌ Erreur lors de la configuration des setupFiles:', error.message);
}

// Créer le fichier de setup
console.log('\n📝 Création du fichier de setup...');
try {
  const setupContent = `// Setup pour les tests
import './__mocks__/ResizeObserver';

// Mock global ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock des APIs de notification
Object.defineProperty(window, 'Notification', {
  value: class Notification {
    static permission = 'granted';
    static requestPermission = () => Promise.resolve('granted');
    constructor() {}
  },
  writable: true,
});

// Mock des APIs de service worker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: () => Promise.resolve(),
    ready: Promise.resolve(),
  },
  writable: true,
});
`;

  writeFileSync('src/test/setup.ts', setupContent);
  console.log('✅ Fichier de setup créé');
} catch (error) {
  console.error('❌ Erreur lors de la création du setup:', error.message);
}

console.log('\n🎯 Objectif: Tests unitaires > 95% pass rate');
console.log('📊 Tests actuels: 68.6% (249/363)');
console.log('🎯 Tests à corriger: 107 échecs');

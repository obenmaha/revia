#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

console.log('✅ Validation des corrections QA NFR PASS...\n');

let allPassed = true;

// 1. Vérifier la configuration Vite
console.log('1️⃣  Vérification de la configuration Vite...');
try {
  const viteConfig = readFileSync('vite.config.ts', 'utf8');
  
  const checks = [
    { name: 'Code splitting configuré', test: viteConfig.includes('manualChunks') },
    { name: 'Chunk size warning limit', test: viteConfig.includes('chunkSizeWarningLimit') },
    { name: 'Minification activée', test: viteConfig.includes('minify: \'esbuild\'') },
  ];
  
  checks.forEach(check => {
    if (check.test) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name}`);
      allPassed = false;
    }
  });
} catch (error) {
  console.log('  ❌ Erreur lors de la lecture de vite.config.ts');
  allPassed = false;
}

// 2. Vérifier le lazy loading dans App.tsx
console.log('\n2️⃣  Vérification du lazy loading...');
try {
  const appTsx = readFileSync('src/App.tsx', 'utf8');
  
  const checks = [
    { name: 'Imports lazy', test: appTsx.includes('import { lazy }') },
    { name: 'Suspense importé', test: appTsx.includes('import { Suspense }') },
    { name: 'Pages en lazy loading', test: appTsx.includes('lazy(() => import') },
    { name: 'Suspense wrappers', test: appTsx.includes('<Suspense fallback') },
  ];
  
  checks.forEach(check => {
    if (check.test) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name}`);
      allPassed = false;
    }
  });
} catch (error) {
  console.log('  ❌ Erreur lors de la lecture de src/App.tsx');
  allPassed = false;
}

// 3. Vérifier les mocks
console.log('\n3️⃣  Vérification des mocks...');
const mocks = [
  'src/__mocks__/lucide-react.tsx',
  'src/__mocks__/useNotifications.ts',
  'src/__mocks__/ResizeObserver.ts',
];

mocks.forEach(mock => {
  if (existsSync(mock)) {
    console.log(`  ✅ ${mock}`);
  } else {
    console.log(`  ❌ ${mock} manquant`);
    allPassed = false;
  }
});

// 4. Vérifier la configuration des tests
console.log('\n4️⃣  Vérification de la configuration des tests...');
try {
  const vitestConfig = readFileSync('vitest.config.ts', 'utf8');
  
  const checks = [
    { name: 'Test timeout configuré', test: vitestConfig.includes('testTimeout: 30000') },
    { name: 'Hook timeout configuré', test: vitestConfig.includes('hookTimeout: 30000') },
    { name: 'Setup files configuré', test: vitestConfig.includes('setupFiles') },
  ];
  
  checks.forEach(check => {
    if (check.test) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name}`);
      allPassed = false;
    }
  });
} catch (error) {
  console.log('  ❌ Erreur lors de la lecture de vitest.config.ts');
  allPassed = false;
}

// 5. Vérifier la configuration Playwright
console.log('\n5️⃣  Vérification de la configuration Playwright...');
if (existsSync('playwright.config.ts')) {
  console.log('  ✅ playwright.config.ts existe');
} else {
  console.log('  ❌ playwright.config.ts manquant');
  allPassed = false;
}

// 6. Vérifier les scripts d'optimisation
console.log('\n6️⃣  Vérification des scripts d\'optimisation...');
const scripts = [
  'scripts/analyze-bundle.mjs',
  'scripts/fix-tests.mjs',
  'scripts/optimize-imports.mjs',
  'scripts/validate-fixes.mjs',
];

scripts.forEach(script => {
  if (existsSync(script)) {
    console.log(`  ✅ ${script}`);
  } else {
    console.log(`  ❌ ${script} manquant`);
    allPassed = false;
  }
});

// 7. Tester le build
console.log('\n7️⃣  Test du build...');
try {
  console.log('  🔨 Exécution du build...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('  ✅ Build réussi');
} catch (error) {
  console.log('  ❌ Build échoué');
  console.log(`  📝 Erreur: ${error.message}`);
  allPassed = false;
}

// 8. Tester les tests unitaires
console.log('\n8️⃣  Test des tests unitaires...');
try {
  console.log('  🧪 Exécution des tests...');
  const result = execSync('npm run test -- --run', { stdio: 'pipe', encoding: 'utf8' });
  
  // Analyser les résultats
  const lines = result.split('\n');
  const passLine = lines.find(line => line.includes('Tests:') || line.includes('passed'));
  
  if (passLine) {
    console.log(`  ✅ Tests exécutés: ${passLine}`);
  } else {
    console.log('  ⚠️  Résultats des tests non analysables');
  }
} catch (error) {
  console.log('  ❌ Tests échoués');
  console.log(`  📝 Erreur: ${error.message}`);
  allPassed = false;
}

// Résumé
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 TOUTES LES CORRECTIONS SONT APPLIQUÉES !');
  console.log('✅ Prêt pour la validation NFR PASS');
} else {
  console.log('❌ CERTAINES CORRECTIONS SONT MANQUANTES');
  console.log('🔧 Veuillez corriger les problèmes identifiés');
}
console.log('='.repeat(50));

// Instructions finales
console.log('\n📋 Prochaines étapes:');
console.log('1. Exécuter: npm run build');
console.log('2. Vérifier le bundle size dans dist/');
console.log('3. Exécuter: npm run test');
console.log('4. Vérifier le taux de réussite des tests');
console.log('5. Exécuter: npx playwright test');
console.log('6. Valider les tests d\'accessibilité');

console.log('\n🎯 Critères de validation:');
console.log('- Bundle principal < 300KB');
console.log('- Tests unitaires > 95% pass rate');
console.log('- Tests RLS PASS');
console.log('- Tests A11y PASS');

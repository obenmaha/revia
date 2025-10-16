#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

console.log('🔍 Analyse du bundle size...\n');

// Analyser le bundle avec rollup-plugin-visualizer
try {
  console.log('📊 Génération du rapport de bundle...');
  execSync('npx vite build --mode analyze', { stdio: 'inherit' });
  
  console.log('✅ Rapport généré dans dist/stats.html');
} catch (error) {
  console.error('❌ Erreur lors de l\'analyse:', error.message);
}

// Analyser les dépendances
console.log('\n📦 Analyse des dépendances...');

try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  console.log('\n📋 Dépendances principales:');
  Object.entries(dependencies)
    .sort(([,a], [,b]) => b.localeCompare(a))
    .slice(0, 20)
    .forEach(([name, version]) => {
      console.log(`  ${name}: ${version}`);
    });
    
  // Suggestions d'optimisation
  console.log('\n💡 Suggestions d\'optimisation:');
  console.log('  - Utiliser des imports dynamiques pour les pages');
  console.log('  - Implémenter le code splitting par routes');
  console.log('  - Optimiser les imports de lucide-react');
  console.log('  - Utiliser tree-shaking pour les librairies');
  console.log('  - Compresser les assets statiques');
  
} catch (error) {
  console.error('❌ Erreur lors de l\'analyse des dépendances:', error.message);
}

console.log('\n🎯 Objectif: Bundle principal < 300KB');
console.log('📊 Bundle actuel: 708.82KB (excéde de 136%)');
console.log('🎯 Réduction nécessaire: 408.82KB (57.6%)');

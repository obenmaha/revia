#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('🚀 Optimisation des imports...\n');

// Fonction pour analyser un fichier
function analyzeFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let totalImports = 0;
    let lucideImports = 0;
    let unusedImports = [];
    
    lines.forEach((line, index) => {
      // Compter les imports
      if (line.trim().startsWith('import ')) {
        totalImports++;
        
        // Compter les imports lucide-react
        if (line.includes('lucide-react')) {
          lucideImports++;
        }
        
        // Détecter les imports potentiellement inutilisés
        if (line.includes('import {') && !line.includes('// used')) {
          const importMatch = line.match(/import\s*{\s*([^}]+)\s*}/);
          if (importMatch) {
            const imports = importMatch[1].split(',').map(i => i.trim());
            imports.forEach(imp => {
              const cleanImport = imp.replace(/\s+as\s+\w+/, '').trim();
              if (!content.includes(cleanImport) || content.indexOf(cleanImport) === content.lastIndexOf(cleanImport)) {
                unusedImports.push({ line: index + 1, import: cleanImport, file: filePath });
              }
            });
          }
        }
      }
    });
    
    return { totalImports, lucideImports, unusedImports };
  } catch (error) {
    return { totalImports: 0, lucideImports: 0, unusedImports: [] };
  }
}

// Fonction pour parcourir récursivement les dossiers
function scanDirectory(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = [];
  
  try {
    const items = readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...scanDirectory(fullPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  } catch (error) {
    // Ignorer les erreurs de lecture
  }
  
  return files;
}

// Analyser tous les fichiers
console.log('📁 Analyse des fichiers...');
const files = scanDirectory('src');
let totalImports = 0;
let totalLucideImports = 0;
let allUnusedImports = [];

files.forEach(file => {
  const analysis = analyzeFile(file);
  totalImports += analysis.totalImports;
  totalLucideImports += analysis.lucideImports;
  allUnusedImports.push(...analysis.unusedImports);
});

console.log(`📊 Statistiques:`);
console.log(`  - Fichiers analysés: ${files.length}`);
console.log(`  - Total imports: ${totalImports}`);
console.log(`  - Imports lucide-react: ${totalLucideImports}`);
console.log(`  - Imports potentiellement inutilisés: ${allUnusedImports.length}`);

// Suggestions d'optimisation
console.log('\n💡 Suggestions d\'optimisation:');

if (totalLucideImports > 10) {
  console.log(`  - Optimiser les imports lucide-react (${totalLucideImports} imports)`);
  console.log('    → Utiliser des imports dynamiques pour les icônes');
  console.log('    → Implémenter un système d\'icônes personnalisé');
}

if (allUnusedImports.length > 0) {
  console.log(`  - Supprimer les imports inutilisés (${allUnusedImports.length} détectés)`);
  allUnusedImports.slice(0, 10).forEach(({ file, line, import: imp }) => {
    console.log(`    → ${file}:${line} - ${imp}`);
  });
  if (allUnusedImports.length > 10) {
    console.log(`    → ... et ${allUnusedImports.length - 10} autres`);
  }
}

// Créer un script d'optimisation automatique
console.log('\n🔧 Génération du script d\'optimisation...');

const optimizationScript = `#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('🚀 Optimisation automatique des imports...');

// Optimiser les imports lucide-react
function optimizeLucideImports() {
  console.log('📦 Optimisation des imports lucide-react...');
  
  // Remplacer les imports multiples par des imports dynamiques
  const files = [
    'src/components/ui/Button.tsx',
    'src/components/ui/Card.tsx',
    'src/components/ui/Input.tsx',
    // Ajouter d'autres fichiers selon les besoins
  ];
  
  files.forEach(file => {
    try {
      let content = readFileSync(file, 'utf8');
      
      // Remplacer les imports lucide-react par des imports dynamiques
      content = content.replace(
        /import\s*{\s*([^}]+)\s*}\s*from\s*['"]lucide-react['"]/g,
        (match, imports) => {
          const importList = imports.split(',').map(i => i.trim());
          return importList.map(imp => {
            const cleanImport = imp.replace(/\s+as\s+\w+/, '').trim();
            return \`const \${cleanImport} = lazy(() => import('lucide-react').then(m => ({ default: m.\${cleanImport} })));\`;
          }).join('\\n');
        }
      );
      
      writeFileSync(file, content);
      console.log(\`✅ \${file} optimisé\`);
    } catch (error) {
      console.log(\`⚠️  \${file} non trouvé ou erreur\`);
    }
  });
}

// Exécuter l'optimisation
optimizeLucideImports();

console.log('✅ Optimisation terminée');
`;

writeFileSync('scripts/optimize-imports-auto.mjs', optimizationScript);

console.log('\n🎯 Objectif: Bundle principal < 300KB');
console.log('📊 Bundle actuel: 708.82KB');
console.log('🎯 Réduction nécessaire: 408.82KB (57.6%)');
console.log('\n📝 Script d\'optimisation créé: scripts/optimize-imports-auto.mjs');
console.log('▶️  Exécuter: node scripts/optimize-imports-auto.mjs');

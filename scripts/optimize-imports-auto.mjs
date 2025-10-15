#!/usr/bin/env node

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
        /imports*{s*([^}]+)s*}s*froms*['"]lucide-react['"]/g,
        (match, imports) => {
          const importList = imports.split(',').map(i => i.trim());
          return importList.map(imp => {
            const cleanImport = imp.replace(/s+ass+w+/, '').trim();
            return `const ${cleanImport} = lazy(() => import('lucide-react').then(m => ({ default: m.${cleanImport} })));`;
          }).join('\n');
        }
      );
      
      writeFileSync(file, content);
      console.log(`✅ ${file} optimisé`);
    } catch (error) {
      console.log(`⚠️  ${file} non trouvé ou erreur`);
    }
  });
}

// Exécuter l'optimisation
optimizeLucideImports();

console.log('✅ Optimisation terminée');

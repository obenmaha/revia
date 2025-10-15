#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

// Termes interdits à rechercher
const FORBIDDEN_TERMS = ['cabinet', 'patient', 'rdv', 'facturation'];

// Extensions de fichiers à vérifier
const CHECKED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte'];

// Dossiers à ignorer
const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next'];

/**
 * Vérifie si un fichier doit être analysé
 */
function shouldCheckFile(filePath) {
  const ext = extname(filePath);
  return CHECKED_EXTENSIONS.includes(ext);
}

/**
 * Vérifie si un dossier doit être ignoré
 */
function shouldIgnoreDir(dirName) {
  return IGNORED_DIRS.includes(dirName);
}

/**
 * Recherche les termes interdits dans le contenu d'un fichier
 */
function findForbiddenTerms(content, filePath) {
  const violations = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    FORBIDDEN_TERMS.forEach(term => {
      // Recherche insensible à la casse
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      if (regex.test(line)) {
        violations.push({
          file: filePath,
          line: index + 1,
          term: term,
          content: line.trim()
        });
      }
    });
  });
  
  return violations;
}

/**
 * Parcourt récursivement un dossier pour analyser les fichiers
 */
function scanDirectory(dirPath, violations = []) {
  try {
    const items = readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!shouldIgnoreDir(item)) {
          scanDirectory(fullPath, violations);
        }
      } else if (stat.isFile() && shouldCheckFile(fullPath)) {
        try {
          const content = readFileSync(fullPath, 'utf8');
          const fileViolations = findForbiddenTerms(content, fullPath);
          violations.push(...fileViolations);
        } catch (error) {
          console.warn(`⚠️  Impossible de lire le fichier ${fullPath}: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Impossible de lire le dossier ${dirPath}: ${error.message}`);
  }
  
  return violations;
}

/**
 * Fonction principale
 */
function main() {
  console.log('🔍 Vérification de la portée du code...\n');
  
  const srcPath = join(__dirname, '..', 'src');
  const violations = scanDirectory(srcPath);
  
  if (violations.length > 0) {
    console.error('❌ Violations détectées dans le code source:\n');
    
    violations.forEach((violation, index) => {
      console.error(`${index + 1}. Fichier: ${violation.file}`);
      console.error(`   Ligne ${violation.line}: "${violation.content}"`);
      console.error(`   Terme interdit: "${violation.term}"\n`);
    });
    
    console.error(`🚫 ${violations.length} violation(s) trouvée(s).`);
    console.error('Les termes suivants sont interdits dans le code source:');
    FORBIDDEN_TERMS.forEach(term => {
      console.error(`  - ${term}`);
    });
    console.error('\nVeuillez supprimer ou remplacer ces termes avant de continuer.');
    
    process.exit(1);
  } else {
    console.log('✅ Aucune violation détectée. Le code respecte la portée définie.');
    process.exit(0);
  }
}

// Exécution du script
main();

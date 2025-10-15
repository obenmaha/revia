#!/usr/bin/env node

/**
 * Bundle Size Checker
 * Ensures the main JavaScript bundle stays under 300KB
 * Usage: node scripts/check-bundle.mjs
 */

import { statSync, readdirSync } from 'fs';
import { join } from 'path';

const MAX_BUNDLE_SIZE_KB = 300;
const MAX_BUNDLE_SIZE_BYTES = MAX_BUNDLE_SIZE_KB * 1024;

// Common build output directories to check
const POSSIBLE_DIST_DIRS = [
  'dist',
  'build',
  '.next',
  'out',
];

function findDistDir() {
  for (const dir of POSSIBLE_DIST_DIRS) {
    try {
      statSync(dir);
      return dir;
    } catch {
      continue;
    }
  }
  throw new Error(`No build directory found. Expected one of: ${POSSIBLE_DIST_DIRS.join(', ')}`);
}

function findJsBundles(dir, files = []) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        findJsBundles(fullPath, files);
      } else if (entry.isFile() && /\.(js|mjs)$/.test(entry.name) && !entry.name.includes('.map')) {
        // Skip vendor/node_modules chunks, focus on app bundles
        if (!entry.name.includes('vendor') && !entry.name.includes('node_modules')) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  return files;
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function checkBundleSize() {
  console.log('🔍 Checking bundle sizes...\n');

  try {
    const distDir = findDistDir();
    console.log(`📁 Build directory: ${distDir}\n`);

    const bundles = findJsBundles(distDir);

    if (bundles.length === 0) {
      console.warn('⚠️  No JavaScript bundles found');
      process.exit(1);
    }

    let hasFailure = false;
    let totalSize = 0;

    console.log('Bundle sizes:');
    console.log('─'.repeat(60));

    for (const bundle of bundles) {
      const stats = statSync(bundle);
      const sizeKB = stats.size / 1024;
      totalSize += stats.size;

      const status = stats.size > MAX_BUNDLE_SIZE_BYTES ? '❌' : '✅';
      const bundleName = bundle.replace(distDir + '/', '');

      console.log(`${status} ${bundleName}`);
      console.log(`   ${formatBytes(stats.size)} ${stats.size > MAX_BUNDLE_SIZE_BYTES ? `(exceeds ${MAX_BUNDLE_SIZE_KB}KB limit!)` : ''}`);

      if (stats.size > MAX_BUNDLE_SIZE_BYTES) {
        hasFailure = true;
      }
    }

    console.log('─'.repeat(60));
    console.log(`📊 Total size: ${formatBytes(totalSize)}`);
    console.log(`🎯 Limit per bundle: ${formatBytes(MAX_BUNDLE_SIZE_BYTES)}\n`);

    if (hasFailure) {
      console.error('❌ Bundle size check failed!');
      console.error(`One or more bundles exceed the ${MAX_BUNDLE_SIZE_KB}KB limit.\n`);
      console.error('Consider:');
      console.error('  • Code splitting');
      console.error('  • Lazy loading components');
      console.error('  • Tree shaking unused code');
      console.error('  • Analyzing bundle with source-map-explorer');
      process.exit(1);
    }

    console.log('✅ All bundles are within size limits!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error checking bundle size:', error.message);
    process.exit(1);
  }
}

checkBundleSize();

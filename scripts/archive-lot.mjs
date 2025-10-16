import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';

const LOT_FILE = '.reports/lot.txt';
if (!fs.existsSync(LOT_FILE)) {
  console.error('Missing .reports/lot.txt'); process.exit(1);
}
const lot = fs.readFileSync(LOT_FILE,'utf8').split('\n').filter(Boolean);
if (lot.length === 0) { console.log('Empty lot'); process.exit(0); }

const stamp = new Date().toISOString().slice(0,10);
const ARCH_ROOT = path.join('_archive', stamp);
fs.mkdirSync(ARCH_ROOT, { recursive: true });

// 1) Déplacer les fichiers en _archive/YYYY-MM-DD/ (miroir d’arborescence)
for (const f of lot) {
  const tgt = path.join(ARCH_ROOT, f);
  fs.mkdirSync(path.dirname(tgt), { recursive: true });
  if (fs.existsSync(f)) fs.renameSync(f, tgt);
}

// 2) Nettoyer les imports orphelins (ts-morph)
const proj = new Project({ tsConfigFilePath: 'tsconfig.json', skipAddingFilesFromTsConfig: false });
proj.addSourceFilesAtPaths('src/**/*.{ts,tsx}');
let removed = 0;

for (const sf of proj.getSourceFiles()) {
  const imports = sf.getImportDeclarations();
  for (const imp of imports) {
    const spec = imp.getModuleSpecifierValue();
    if (/(\/cabinet\/|\/export\/|\/pwa\/|\/old\/|\/_deprecated\/)/i.test(spec)) {
      imp.remove(); removed++; continue;
    }
    if (spec.startsWith('.')) {
      const resolved = path.resolve(path.dirname(sf.getFilePath()), spec);
      const tsLike = ['.ts','.tsx','.d.ts','/index.ts','/index.tsx']
        .map(ext => resolved.endsWith(ext) ? resolved : resolved + ext);
      const exists = tsLike.some(p => fs.existsSync(p));
      if (!exists) { imp.remove(); removed++; }
    }
  }
}

await proj.save();

// 3) README du lot
const readme = [
  `# Archive Lot – ${stamp}`,
  '',
  '## Fichiers archivés',
  ...lot.map(x => `- ${x}`),
  '',
  `**Imports retirés automatiquement**: ${removed}`,
  ''
].join('\n');

fs.writeFileSync(path.join(ARCH_ROOT, 'README.md'), readme);
console.log(`Moved ${lot.length} files → ${ARCH_ROOT}. Imports removed: ${removed}`);

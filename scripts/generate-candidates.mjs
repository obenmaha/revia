import fs from 'fs';
import path from 'path';

const ROOT = 'src';
const BACKBONE_FILE = 'docs/backbone_map.md';
const TSP_FILE = '.reports/tsprune.txt';
const KNIP_FILE = '.reports/knip.json';

const backboneMd = fs.existsSync(BACKBONE_FILE) ? fs.readFileSync(BACKBONE_FILE, 'utf8') : '';
const keep = new Set(
  [...backboneMd.matchAll(/`([^`]+?\.(?:ts|tsx|css|svg))`/g)]
    .map(m => m[1].replace(/^(\.?\/)?/, '').replace(/^src\//, ''))
);

const tsprune = fs.existsSync(TSP_FILE)
  ? new Set(fs.readFileSync(TSP_FILE, 'utf8').split('\n').filter(Boolean))
  : new Set();

let knip = {};
let knipUnused = new Set();

if (fs.existsSync(KNIP_FILE)) {
  try {
    const knipContent = fs.readFileSync(KNIP_FILE, 'utf8');
    knip = JSON.parse(knipContent);
    knipUnused = new Set(knip.files?.unused ?? []);
  } catch (error) {
    console.warn(`Warning: Could not parse ${KNIP_FILE}:`, error.message);
    knip = {};
    knipUnused = new Set();
  }
}

function walk(dir) {
  return fs.readdirSync(dir).flatMap(f => {
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) return walk(p);
    return /\.(ts|tsx|css|svg)$/.test(p) ? [p] : [];
  });
}

const files = fs.existsSync(ROOT) ? walk(ROOT) : [];
const CANDIDATE_PATTERNS = /(\/cabinet\/|\/export\/|\/pwa\/|\/old\/|\/_deprecated\/|patient|invoice|cabinet|practitioner|billing)/i;

const candidates = files.filter(abs => {
  const rel = abs.replace(/^src\//, '');
  if (keep.has(rel)) return false;
  if (/\/__tests__\//i.test(abs)) return false;
  const flagged = CANDIDATE_PATTERNS.test(abs);
  const dead = tsprune.has(abs) || knipUnused.has(abs);
  return flagged || dead;
});

fs.writeFileSync('.reports/candidates.txt', candidates.join('\n'));
console.log(`Candidates: ${candidates.length}`);

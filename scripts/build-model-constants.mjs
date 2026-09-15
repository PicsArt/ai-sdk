#!/usr/bin/env node
/**
 * Generate typed Models constants from the vendor catalog.
 *
 * Reads ALL_MODELS via tsx, converts each model id to PascalCase,
 * checks for collisions, and writes src/generated/model-constants.ts.
 *
 * Usage: node packages/ai-sdk/scripts/build-model-constants.mjs
 */
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPECS_DIR = join(__dirname, '..');
const SRC_DIR = join(SPECS_DIR, 'src');
const OUTPUT_FILE = join(SRC_DIR, 'generated', 'model-constants.ts');

// ── 1. Extract model metadata via tsx ────────────────────────────────

const extractScript = `
  import { ALL_MODELS } from './src/vendors/catalog/index.ts';
  const data = ALL_MODELS.map(m => ({
    id: m.id,
    name: m.specName ?? m.name,
    mode: m.mode,
    provider: m.provider,
    deprecated: m.deprecated ?? false,
  }));
  console.log(JSON.stringify(data));
`;

const raw = execSync(`npx tsx -e "${extractScript.replace(/"/g, '\\"')}"`, {
  cwd: SPECS_DIR,
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
});

const models = JSON.parse(raw.trim());

// ── 2. idToPascalCase ────────────────────────────────────────────────

function idToPascalCase(id) {
  return id
    .split(/[-_.]/)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

// ── 3. Check for PascalCase collisions ──────────────────────────────

/** @type {Map<string, string[]>} */
const keyToIds = new Map();
for (const m of models) {
  const key = idToPascalCase(m.id);
  if (!keyToIds.has(key)) keyToIds.set(key, []);
  keyToIds.get(key).push(m.id);
}

const collisions = [...keyToIds.entries()].filter(([, ids]) => ids.length > 1);
if (collisions.length > 0) {
  console.error('PascalCase naming collisions detected:');
  for (const [key, ids] of collisions) {
    console.error(`  ${key} ← ${ids.join(', ')}`);
  }
  process.exit(1);
}

// ── 4. Generate output ──────────────────────────────────────────────

const sorted = [...models].sort((a, b) => a.id.localeCompare(b.id));

const lines = [
  '/* AUTO-GENERATED FILE. DO NOT EDIT. */',
  '',
  '/**',
  ' * Typed Models constants and namespace.',
  ' * Regenerate with: npm run build:model-constants',
  ' */',
  '',
  '// ── Individual model constants ─────────────────────────────────────',
  '',
];

for (const m of sorted) {
  const key = idToPascalCase(m.id);
  const deprecated = m.deprecated ? `\n/** @deprecated This model is retired (deprecated). */` : '';
  lines.push(`/** ${m.name} — ${m.provider} (${m.mode}) */${deprecated}`);
  lines.push(`export const ${key} = '${m.id}' as const;`);
}

lines.push('');
lines.push('// ── Models namespace ─────────────────────────────────────────────');
lines.push('');
lines.push('export const Models = {');

// Individual model refs
for (const m of sorted) {
  const key = idToPascalCase(m.id);
  lines.push(`  ${key},`);
}

lines.push('} as const;');
lines.push('');

// ── 5. Write ────────────────────────────────────────────────────────

mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8');
console.log(`Generated ${OUTPUT_FILE} (${models.length} models)`);

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
    disabled: m.disabled ?? false,
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
  "import type { ModelDefinition, GenerationMode } from '../core/types.ts';",
  "import type { ModelParamSchema } from '../core/schema.ts';",
  "import { ALL_MODELS } from '../vendors/catalog/index.ts';",
  "import { validateModelInput } from '../core/contracts.ts';",
  "import { resolveModel } from '../core/resolve.ts';",
  "import { Model } from '../core/descriptors/model-accessor.ts';",
  '',
  '// ── Individual model constants ─────────────────────────────────────',
  '',
];

for (const m of sorted) {
  const key = idToPascalCase(m.id);
  const deprecatedReason = m.deprecated
    ? 'This model is retired (deprecated).'
    : m.disabled
      ? 'This model is currently unavailable (disabled).'
      : null;
  const deprecated = deprecatedReason ? `\n/** @deprecated ${deprecatedReason} */` : '';
  lines.push(`/** ${m.name} — ${m.provider} (${m.mode}) */${deprecated}`);
  lines.push(`export const ${key} = '${m.id}' as const;`);
}

lines.push('');
lines.push('// ── Validation result ────────────────────────────────────────────');
lines.push('');
lines.push('interface ValidationResult { valid: boolean; errors?: string[] }');
lines.push('');
lines.push('// ── Models namespace ─────────────────────────────────────────────');
lines.push('');
lines.push('interface ModelFilter { mode?: GenerationMode; provider?: string }');
lines.push('');
lines.push('export const Models = {');

// Individual model refs
for (const m of sorted) {
  const key = idToPascalCase(m.id);
  lines.push(`  ${key},`);
}

lines.push('');
lines.push('  /** @deprecated Use the `catalog` accessor (`catalog.all()` / `catalog.find({ output, provider })`) instead. */');
lines.push('  list(filter?: ModelFilter): ModelDefinition[] {');
lines.push('    if (!filter) return [...ALL_MODELS];');
lines.push('    return ALL_MODELS.filter(m => {');
lines.push('      if (filter.mode && m.mode !== filter.mode) return false;');
lines.push('      if (filter.provider && m.provider !== filter.provider) return false;');
lines.push('      return true;');
lines.push('    });');
lines.push('  },');
lines.push('');
lines.push('  /** @deprecated Use `Model(id).validate(input)` instead. */');
lines.push('  validate(model: string, input: unknown): ValidationResult {');
lines.push('    try {');
lines.push('      validateModelInput(resolveModel(model), input);');
lines.push('      return { valid: true };');
lines.push('    } catch (err: unknown) {');
lines.push('      const message = err instanceof Error ? err.message : String(err);');
lines.push('      return { valid: false, errors: [message] };');
lines.push('    }');
lines.push('  },');
lines.push('');
lines.push('  /** @deprecated Use `Model(id).params().toSchema()` instead. */');
lines.push('  toSchema(id: string): ModelParamSchema {');
lines.push('    return Model(id).params().toSchema();');
lines.push('  },');
lines.push('');
lines.push("  /** @deprecated Use `Model(id).params().file(key)` instead. */");
lines.push("  getFileParam(id: string, key: string): { required: boolean; max: number; label?: string; accept?: string } | null {");
lines.push('    const f = Model(id).params().file(key);');
lines.push('    if (!f) return null;');
lines.push('    return { required: f.required ?? false, max: f.array?.max ?? 1, label: f.label, accept: f.accept };');
lines.push('  },');
lines.push('');
lines.push('  /** @deprecated Use `Model(id).params().hasParam(key)` instead. */');
lines.push('  hasParam(id: string, key: string): boolean {');
lines.push('    return Model(id).params().hasParam(key);');
lines.push('  },');

lines.push('} as const;');
lines.push('');

// ── 5. Write ────────────────────────────────────────────────────────

mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8');
console.log(`Generated ${OUTPUT_FILE} (${models.length} models)`);

/**
 * Catalog integrity tests — offline, no API calls.
 *
 * Ported from an earlier in-house integrity suite, rewritten from vitest to this
 * repo's `node:assert` + `tsx` convention (see deprecated.test.ts). Rule numbers
 * are kept aligned with that original source for cross-repo sync.
 *
 * Rules:
 *  1. All enabled async models have estimatedTime
 *  2. Workflows are non-empty strings
 *  3. Model IDs are unique across all vendor catalogs
 *  4. paramConfig keys use known descriptor kinds
 *  5. spec-disabled / deprecated models (informational warning)
 * 10. all enabled models have a valid addedAt (YYYY-MM-DD)
 */
import assert from 'node:assert';
import { ALL_MODELS } from '../../src/vendors/catalog/index.ts';

const enabled = ALL_MODELS.filter((m) => !m.disabled && !m.deprecated);

// ── 1. all enabled async models have estimatedTime ────────────────
{
  const missing = enabled.filter((m) => !m.syncExecute && m.estimatedTime == null);
  assert.deepStrictEqual(
    missing.map((m) => m.id),
    [],
    'async models missing estimatedTime',
  );
}

// ── 2. workflows are non-empty strings ────────────────────────────
{
  const invalid: string[] = [];
  for (const m of ALL_MODELS) {
    if (!m.workflow || typeof m.workflow !== 'string' || m.workflow.trim() === '') {
      invalid.push(`${m.id}: empty or missing workflow`);
    }
    if (
      m.editWorkflow !== undefined &&
      (typeof m.editWorkflow !== 'string' || m.editWorkflow.trim() === '')
    ) {
      invalid.push(`${m.id}: empty editWorkflow`);
    }
  }
  assert.deepStrictEqual(invalid, [], 'invalid workflow strings');
}

// ── 3. model IDs are unique across all vendor catalogs ────────────
{
  const seen = new Map<string, string>();
  const dupes: string[] = [];
  for (const m of ALL_MODELS) {
    if (seen.has(m.id)) {
      dupes.push(`${m.id}: duplicate (first in ${seen.get(m.id)}, also in ${m.provider})`);
    }
    seen.set(m.id, m.provider);
  }
  assert.deepStrictEqual(dupes, [], 'duplicate model IDs');
}

// ── 4. paramConfig entries use valid descriptor kinds ─────────────
{
  const validKinds = new Set(['enum', 'catalog', 'range', 'boolean', 'text', 'file', 'object']);
  const invalid: string[] = [];
  for (const m of enabled) {
    for (const [key, entry] of Object.entries(m.paramConfig)) {
      if (!validKinds.has(entry.descriptor.kind)) {
        invalid.push(`${m.id}.${key}: unknown descriptor kind "${entry.descriptor.kind}"`);
      }
    }
  }
  assert.deepStrictEqual(invalid, [], 'invalid descriptor kinds');
}

// ── 5. spec-disabled / deprecated models (informational warning) ──
{
  const hidden = ALL_MODELS.filter((m) => m.disabled || m.deprecated);
  if (hidden.length > 0) {
    const lines = hidden.map(
      (m) => `  • ${m.provider}/${m.id} (${m.deprecated ? 'deprecated' : 'disabled'})`,
    );
    console.warn(`\n⚠ ${hidden.length} model(s) hidden in specs:\n${lines.join('\n')}`);
  }
}

// ── 10. all enabled models have a valid addedAt (YYYY-MM-DD) ───────
{
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  const issues: string[] = [];
  for (const m of enabled) {
    if (!m.addedAt) {
      issues.push(`${m.id}: missing addedAt`);
      continue;
    }
    if (!ISO_DATE.test(m.addedAt)) {
      issues.push(`${m.id}: addedAt "${m.addedAt}" is not YYYY-MM-DD`);
      continue;
    }
    const ts = Date.parse(m.addedAt);
    if (!Number.isFinite(ts)) {
      issues.push(`${m.id}: addedAt "${m.addedAt}" is not a real date`);
    }
  }
  assert.deepStrictEqual(issues, [], 'invalid addedAt values');
}

console.log(
  `catalog-integrity.test.ts: OK (${enabled.length} enabled, ` +
    `${ALL_MODELS.length - enabled.length} hidden of ${ALL_MODELS.length} total)`,
);

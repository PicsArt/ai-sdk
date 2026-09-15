import assert from 'node:assert';
import { resolveModel } from '../../src/core/resolve.ts';
import { getModelsByMode, ALL_MODELS } from '../../src/vendors/catalog/index.ts';

// ── Retired models ─────────────────────────────────────────────────
//
// `deprecated: true` is the SDK-level signal for "retired by vendor /
// superseded — will not come back". Rows stay in the catalog so workflow IDs
// and toolIds remain resolvable for historical jobs and pricing, but they are
// hidden from default discovery. (The old model-level `disabled` flag was
// removed in 6.0 — operational gating now uses `release: 'preview'`.)
//
// If any of these IDs lose `deprecated: true`, they re-enter the app's model
// lists — which is wrong: each was retired deliberately. To re-enable a
// retired model, flip the flag deliberately and update this list, not the
// other way around.
const DEPRECATED_IDS = [
  'seedance-1.5-pro', 'seedance-i2v',
  'seedream-4.0',
  'qwen',
  'qwen-image-2',
  'recraftv2', 'recraftv2_vector',
  'wan-2.6-t2v', 'wan-2.6-r2v', 'wan-2.6-image',
  'gpt-image-1',
  'kling-v2-1-image', 'kling-multi-image-v2-1',
  'ltx-pro-t2v', 'ltx-v2-fast', 'ltx-v2-retake',
  'runway-gen3a-turbo', 'runway-gen4-aleph',
  'pika-2.2', 'pika-2.2-scenes', 'pika-2.2-frames',
  'bytedance-video-upscaler',
];

// ── Deprecated IDs are marked correctly ───────────────────────────

for (const id of DEPRECATED_IDS) {
  const m = resolveModel(id);
  assert.strictEqual(m.deprecated, true, `${id}: expected deprecated: true`);
}

// ── The allowlist is exhaustive ────────────────────────────────────
//
// Derived from the catalog so the list can't silently drift: deprecating a
// model without adding it here (or vice versa) fails this test.

const catalogDeprecated = ALL_MODELS.filter((m) => m.deprecated).map((m) => m.id).sort();
assert.deepStrictEqual(
  catalogDeprecated,
  [...DEPRECATED_IDS].sort(),
  'DEPRECATED_IDS drifted from the catalog — update the list deliberately',
);

// ── getModelsByMode() (default filter) hides deprecated models ─────

const visibleIds = new Set<string>();
for (const mode of ['image', 'video', 'audio'] as const) {
  for (const m of getModelsByMode(mode)) visibleIds.add(m.id);
}
for (const id of DEPRECATED_IDS) {
  assert(!visibleIds.has(id), `getModelsByMode should hide deprecated id ${id}`);
}

// ── Rows stay resolvable ───────────────────────────────────────────
//
// Deprecated rows remain in the unfiltered catalog (ALL_MODELS) and resolve
// by id, so historical jobs keep working.

const allIds = new Set(ALL_MODELS.map((m) => m.id));
for (const id of DEPRECATED_IDS) {
  assert(allIds.has(id), `${id}: ALL_MODELS should still expose this (unfiltered by design)`);
}

console.log(`deprecated.test.ts: OK (${DEPRECATED_IDS.length} deprecated)`);

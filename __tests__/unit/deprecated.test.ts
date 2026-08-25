import assert from 'node:assert';
import { Models } from '../../src/generated/model-constants.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import { getModelsByMode } from '../../src/vendors/catalog/index.ts';

// ── Models retired via the 2026-05-08 deprecation wave ────────────
//
// These were originally flagged `disabled: true` with a "deprecated 2026-05-08"
// comment. The 2026-05-25 refactor introduced `deprecated: true` as a distinct
// SDK-level signal for "retired by vendor / superseded" so it can be
// differentiated from operational disables.
//
// If any of these IDs lose `deprecated: true`, they re-enter the app's model
// lists — which is wrong: each was retired in favour of a newer same-vendor
// sibling. To re-enable a retired model, flip the flag deliberately and update
// this list, not the other way around.
const DEPRECATED_IDS = [
  'seedance-1.5-pro', 'seedance-i2v',
  'seedream-4.0',
  'qwen',
  'recraftv2', 'recraftv2_vector',
  'wan-2.6-t2v', 'wan-2.6-r2v', 'wan-2.6-image',
  'gpt-image-1',
  'kling-v2-1-image', 'kling-multi-image-v2-1',
  'ltx-pro-t2v', 'ltx-v2-fast', 'ltx-v2-retake',
  'runway-gen3a-turbo', 'runway-gen4-aleph',
];

// IDs operationally disabled (backend not deployed, catalog mismatch, etc.).
// `disabled: true` in the catalog is the SDK-level signal for "not currently
// usable" — distinct from `deprecated: true` ("retired, will not come back").
// Both hide the model from default lists.
const DISABLED_IDS = [
  'minimax-02-hd', 'kling-elements', 'eleven-voice-remix',
];

// ── Deprecated IDs are marked correctly ───────────────────────────

for (const id of DEPRECATED_IDS) {
  const m = resolveModel(id);
  assert.strictEqual(m.deprecated, true, `${id}: expected deprecated: true`);
  assert(!m.disabled, `${id}: retired model should carry 'deprecated', not 'disabled'`);
}

// ── Disabled IDs are marked correctly ─────────────────────────────

for (const id of DISABLED_IDS) {
  const m = resolveModel(id);
  assert.strictEqual(m.disabled, true, `${id}: expected disabled: true`);
  assert(!m.deprecated, `${id}: operational disable should carry 'disabled', not 'deprecated'`);
}

// ── getModelsByMode() (default filter) excludes both ──────────────
//
// Note: Models.list() is intentionally unfiltered — the user is expected to
// filter. The catalog's getModelsByMode helper is the one that hides
// disabled/deprecated by default (with an opt-in escape hatch).

const visibleIds = new Set<string>();
for (const mode of ['image', 'video', 'audio'] as const) {
  for (const m of getModelsByMode(mode)) visibleIds.add(m.id);
}
for (const id of DEPRECATED_IDS) {
  assert(!visibleIds.has(id), `getModelsByMode should hide deprecated id ${id}`);
}
for (const id of DISABLED_IDS) {
  assert(!visibleIds.has(id), `getModelsByMode should hide disabled id ${id}`);
}

// Sanity: both kinds are still in the unfiltered catalog — Models.list()
// returns everything; consumers are expected to filter.
const allIds = new Set(Models.list().map((m: { id: string }) => m.id));
for (const id of [...DEPRECATED_IDS, ...DISABLED_IDS]) {
  assert(allIds.has(id), `${id}: Models.list() should still expose this (it's unfiltered by design)`);
}

// ── Belt-and-braces: no model is BOTH disabled and deprecated ─────

for (const m of Models.list({})) {
  if (m.disabled && m.deprecated) {
    assert.fail(`${m.id}: should not carry both 'disabled' and 'deprecated' — pick one`);
  }
}

console.log(
  `deprecated.test.ts: OK (${DEPRECATED_IDS.length} deprecated, ${DISABLED_IDS.length} disabled)`,
);

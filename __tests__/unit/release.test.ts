/**
 * Release-tag tests — offline, no API calls.
 *
 * Covers the `release` availability tier: the default visible set, opt-in
 * filtering via `release: [...]`, exposure on `model.meta()`, and the shared
 * `isVisibleForReleases` predicate (with `disabled`/`deprecated` layered on
 * top).
 */
import assert from 'node:assert';
import { catalog } from '../../src/core/descriptors/model-accessor.ts';
import {
  isVisibleForReleases,
  releaseOf,
  DEFAULT_VISIBLE_RELEASES,
} from '../../src/core/visibility.ts';
import { ALL_MODELS } from '../../src/vendors/catalog/index.ts';
import { getModel } from '../../src/core/model-registry.ts';
import type { ModelDefinition, ReleaseTag } from '../../src/core/types.ts';

const RELEASES: ReleaseTag[] = ['preview', 'production', 'general-availability'];

// ── Default visible set ───────────────────────────────────────────
assert.deepStrictEqual(
  [...DEFAULT_VISIBLE_RELEASES],
  ['production', 'general-availability'],
  'default visible releases must be production + general-availability (preview opt-in)',
);

// ── releaseOf: absent ⇒ 'production'; every value is a known tag ──
for (const m of ALL_MODELS) {
  assert(RELEASES.includes(releaseOf(m)), `${m.id}: releaseOf returned unknown tag "${releaseOf(m)}"`);
  if (m.release === undefined) {
    assert.strictEqual(releaseOf(m), 'production', `${m.id}: missing release should default to production`);
  }
}

// ── isVisibleForReleases predicate (synthetic models) ─────────────
const fake = (release?: ReleaseTag, flags: { disabled?: boolean; deprecated?: boolean } = {}): ModelDefinition =>
  ({ id: 'x', release, ...flags } as unknown as ModelDefinition);

assert(isVisibleForReleases(fake()), 'untagged (⇒production) visible by default');
assert(isVisibleForReleases(fake('production')), 'production visible by default');
assert(isVisibleForReleases(fake('general-availability')), 'general-availability visible by default');
assert(!isVisibleForReleases(fake('preview')), 'preview hidden by default');
assert(isVisibleForReleases(fake('preview'), ['preview']), 'preview visible when requested');
// disabled / deprecated are hard hides layered on top of release
assert(!isVisibleForReleases(fake('production', { disabled: true }), RELEASES), 'disabled never visible');
assert(!isVisibleForReleases(fake('preview', { disabled: true }), RELEASES), 'disabled preview never visible');
assert(!isVisibleForReleases(fake('production', { deprecated: true }), RELEASES), 'deprecated never visible');

// ── catalog.all(): default returns only production + general-availability ──
const defaultAll = catalog.all();
assert(defaultAll.length > 0, 'catalog.all() should return models');
for (const m of defaultAll) {
  assert(
    m.meta().release === 'production' || m.meta().release === 'general-availability',
    `${m.id}: default catalog.all() leaked a "${m.meta().release}" model`,
  );
}

// meta().release agrees with the underlying definition
for (const m of defaultAll) {
  assert.strictEqual(m.meta().release, releaseOf(getModel(m.id)!), `${m.id}: meta().release mismatch`);
}

// ── Opt-in filtering by release array ─────────────────────────────
const previewOnly = catalog.all({ release: ['preview'] });
for (const m of previewOnly) {
  assert.strictEqual(m.meta().release, 'preview', `${m.id}: release:['preview'] returned a non-preview model`);
}

const productionOnly = catalog.all({ release: ['production'] });
for (const m of productionOnly) {
  assert.strictEqual(m.meta().release, 'production', `${m.id}: release:['production'] returned a non-production model`);
}

// Requesting all three is a superset of the default set.
const allThree = catalog.all({ release: RELEASES });
assert(allThree.length >= defaultAll.length, 'all-releases set must be ⊇ the default set');

// find() honours the release filter the same way
const findPreview = catalog.find({ release: ['preview'] });
for (const m of findPreview) {
  assert.strictEqual(m.meta().release, 'preview', `${m.id}: find({release:['preview']}) returned a non-preview model`);
}

// ── disabled/deprecated stay hidden even when their release is requested ──
const allIds = new Set<string>(catalog.all({ release: RELEASES }).map((m) => m.id));
for (const id of ['minimax-02-hd', 'kling-elements', 'eleven-voice-remix']) {
  const m = getModel(id);
  assert(m?.disabled, `${id}: expected disabled: true (test fixture assumption)`);
  assert(!allIds.has(id), `${id}: disabled model must stay hidden even when all releases are requested`);
}

// ── preview is opt-in, not a hard hide like disabled/deprecated ──
for (const id of ['heygen-video-avatar']) {
  const m = getModel(id);
  assert.strictEqual(releaseOf(m!), 'preview', `${id}: expected release: 'preview'`);
  assert(!defaultAll.some((x) => x.id === id), `${id}: preview must stay out of the default listing`);
  assert(previewOnly.some((x) => x.id === id), `${id}: preview must be listed when preview is requested`);
  assert(allIds.has(id), `${id}: preview must be listed when every release is requested`);
}

console.log(
  `release.test.ts: OK (${defaultAll.length} default-visible, ${previewOnly.length} preview)`,
);

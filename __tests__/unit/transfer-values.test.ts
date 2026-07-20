import assert from 'node:assert/strict';
import { transferValues } from '../../src/core/descriptors/utils.ts';
import { p } from '../../src/core/descriptors/presets.ts';
import { Model } from '../../src/core/descriptors/model-accessor.ts';
import type { ModelParams } from '../../src/core/descriptors/types.ts';

// ── Helpers — build paramConfigs with known constraints ────────────────

const arrayFile = (max: number): ModelParams =>
  p.file('imageUrls', 'image', { array: { max }, label: 'imgs' });

const singleFile = (): ModelParams =>
  p.file('imageUrls', 'image', { label: 'img' });

// ── File arrays — trim to new max ──────────────────────────────────────

{
  // 4 → 1: classic repro (Flux 2 Pro → Flux 2 Max)
  const out = transferValues(arrayFile(1), { imageUrls: ['a', 'b', 'c', 'd'] });
  assert.deepEqual(out.imageUrls, ['a'], '4 imgs into max=1 → keep first');
}

{
  // 4 → 3: trim by 1
  const out = transferValues(arrayFile(3), { imageUrls: ['a', 'b', 'c', 'd'] });
  assert.deepEqual(out.imageUrls, ['a', 'b', 'c'], '4 imgs into max=3 → keep first 3');
}

{
  // Within bounds: pass through unchanged
  const out = transferValues(arrayFile(4), { imageUrls: ['a', 'b'] });
  assert.deepEqual(out.imageUrls, ['a', 'b'], 'within bounds → unchanged');
}

{
  // Empty placeholders dropped (frame-mode → image-mode case)
  const out = transferValues(arrayFile(4), { imageUrls: ['a', '', 'b', ''] });
  assert.deepEqual(out.imageUrls, ['a', 'b'], 'empty strings filtered out');
}

{
  // All-empty → field unset (defaults take over, no fake slots)
  const out = transferValues(arrayFile(4), { imageUrls: ['', ''] });
  assert.equal(out.imageUrls, undefined, 'all-empty array → unset');
}

// ── File shape coercion (single ↔ array) ───────────────────────────────

{
  // Single value into array slot → wrap in array
  const out = transferValues(arrayFile(4), { imageUrls: 'solo.png' as unknown });
  assert.deepEqual(out.imageUrls, ['solo.png'], 'single value into array → wrapped');
}

{
  // Array value into single slot → take first
  const out = transferValues(singleFile(), { imageUrls: ['first.png', 'second.png'] });
  assert.equal(out.imageUrls, 'first.png', 'array into single → first kept');
}

{
  // Single empty string into single slot → unset
  const out = transferValues(singleFile(), { imageUrls: '' });
  assert.equal(out.imageUrls, undefined, 'empty string single → unset');
}

// ── Text — truncate to maxLength ───────────────────────────────────────

{
  const params: ModelParams = p.text('caption', { maxLength: 10 });
  const out = transferValues(params, { caption: '0123456789ABCDEF' });
  assert.equal(out.caption, '0123456789', 'long text truncated to maxLength');
}

{
  const params: ModelParams = p.text('caption');
  const out = transferValues(params, { caption: 'unbounded value here' });
  assert.equal(out.caption, 'unbounded value here', 'no maxLength → unchanged');
}

// ── Existing guarantees still hold (regression) ────────────────────────

{
  // Enum drop-out: prev value not in new options → falls back to default
  const params: ModelParams = p.aspectRatio(['16:9', '1:1'], '1:1');
  const out = transferValues(params, { aspectRatio: '__not_a_real_aspect__' });
  assert.equal(out.aspectRatio, '1:1', 'invalid enum → falls back to default');
}

{
  // Enum kept when value is valid
  const params: ModelParams = p.aspectRatio(['16:9', '1:1'], '1:1');
  const out = transferValues(params, { aspectRatio: '16:9' });
  assert.equal(out.aspectRatio, '16:9', 'valid enum preserved');
}

{
  // Range: clamps above max
  const params: ModelParams = p.range('steps', 1, 50, 25);
  const out = transferValues(params, { steps: 9999 });
  assert.equal(out.steps, 50, 'over-max range clamped down');
}

{
  // Range: clamps below min
  const params: ModelParams = p.range('steps', 10, 50, 25);
  const out = transferValues(params, { steps: 0 });
  assert.equal(out.steps, 10, 'under-min range clamped up');
}

{
  // Boolean: preserved
  const params: ModelParams = p.boolean('enhance', false);
  const out = transferValues(params, { enhance: true });
  assert.equal(out.enhance, true, 'boolean preserved');
}

// ── Stale keys silently dropped ────────────────────────────────────────

{
  const params: ModelParams = p.text('caption');
  const out = transferValues(params, { caption: 'hi', removedField: 'leftover' });
  assert.equal(out.caption, 'hi', 'known field preserved');
  assert.equal(out.removedField, undefined, 'unknown field not transferred');
}

// ── Real-world catalog pair: Flux 2 Pro (4) → Flux 2 Max (1) ───────────

{
  const fromCtx = {
    prompt: 'a cinematic shot',
    imageUrls: ['ref1.png', 'ref2.png', 'ref3.png'],
    aspectRatio: '4:3',
  };
  const targetParams = Model('flux-2-max').params();
  const out = targetParams.transferValues(fromCtx);
  assert.deepEqual(
    out.imageUrls,
    ['ref1.png'],
    'real catalog: 3 refs into 1-ref model → 1 ref kept',
  );
}

console.log('✓ transfer-values.test.ts — all passed');

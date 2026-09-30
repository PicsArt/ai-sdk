/**
 * Ideogram 4.5 — offline checks of the two production models: release gating,
 * wire payloads (the vendor rejects `size` with a mask, `source` without
 * images and preset sizes with images) and the declared constraints.
 */
import assert from 'node:assert';
import { catalog } from '../../src/core/descriptors/model-accessor.ts';
import { evaluateConstraints } from '../../src/core/constraints.ts';
import { getModel } from '../../src/core/model-registry.ts';
import { prepareRequest } from '../../src/client/prepare.ts';
import type { GenerationContext } from '../../src/core/types.ts';
import '../../src/vendors/catalog/index.ts';

const GENERATE = 'ideogram-4-5';
const PRECISE_EDIT = 'ideogram-4-5-precise-edit';

const payload = (id: string, ctx: Record<string, unknown>) => {
  const model = getModel(id);
  assert.ok(model, `${id} must be registered`);
  return prepareRequest(model, ctx) as { workflow: string; payload: Record<string, any> };
};

// ── Release gating: production (out of early access) ──────────────────
for (const id of [GENERATE, PRECISE_EDIT]) {
  assert.strictEqual(getModel(id)?.release, undefined, `${id} must not carry a release tag (⇒ production)`);
  assert.ok(catalog.all().some((m) => m.id === id), `${id} must be visible in the default catalog`);
}

// ── Generate: text-to-image ───────────────────────────────────────────
{
  const { workflow, payload: body } = payload(GENERATE, { prompt: 'a cat', size: '1024x1024', count: 2 });
  assert.strictEqual(workflow, 'ideogram/v4.5/generate');
  assert.deepStrictEqual(body, { prompt: 'a cat', size: '1024x1024', quality: 'high', num_images: 2 });
}

// `source` needs images → dropped for text-to-image; a mask without images is dropped too.
assert.deepStrictEqual(
  payload(GENERATE, { prompt: 'p', size: 'source', mask: 'https://x/m.png' }).payload,
  { prompt: 'p', quality: 'high', num_images: 1 },
);

// ── Generate: edit with references (same workflow) ────────────────────
{
  const { workflow, payload: body } = payload(GENERATE, {
    prompt: 'edit image 1', imageUrls: ['https://x/a.png', 'https://x/b.png'], size: '1024x1024', magicPrompt: 'off',
  });
  assert.strictEqual(workflow, 'ideogram/v4.5/generate');
  // A preset size is not valid with images → left out (vendor picks auto).
  assert.deepStrictEqual(body, {
    prompt: 'edit image 1', images: ['https://x/a.png', 'https://x/b.png'],
    magic_prompt: 'off', quality: 'high', num_images: 1,
  });
}

assert.strictEqual(
  payload(GENERATE, { prompt: 'p', imageUrls: ['https://x/a.png'], size: 'source' }).payload.size,
  'source',
);

// ── Generate: masked edit never sends a size ──────────────────────────
assert.deepStrictEqual(
  payload(GENERATE, {
    prompt: 'p', imageUrls: ['https://x/a.png'], mask: 'https://x/m.png', size: 'source', quality: 'low', seed: 5,
  }).payload,
  { prompt: 'p', images: ['https://x/a.png'], mask: 'https://x/m.png', quality: 'low', num_images: 1, seed: 5 },
);

// ── Precise edit ──────────────────────────────────────────────────────
{
  const { workflow, payload: body } = payload(PRECISE_EDIT, {
    prompt: 'fix', startFrame: 'https://x/s.png', mask: 'https://x/m.png',
    imageUrls: ['https://x/r.png'], quality: 'very_high', count: 4,
  });
  assert.strictEqual(workflow, 'ideogram/v4.5/precise-edit');
  assert.deepStrictEqual(body, {
    image: 'https://x/s.png', prompt: 'fix', mask: 'https://x/m.png',
    reference_images: ['https://x/r.png'], quality: 'very_high', num_images: 4,
  });
}

assert.throws(() => payload(PRECISE_EDIT, { prompt: 'fix' }), /startFrame/, 'precise edit requires a source image');

// ── Masked image caps (the mask takes one of the vendor's image slots) ─
const urls = (n: number) => Array.from({ length: n }, (_, i) => `https://x/${i}.png`);
assert.throws(
  () => payload(GENERATE, { prompt: 'p', imageUrls: urls(5), mask: 'https://x/m.png' }),
  /at most 4 images/,
);
assert.strictEqual(payload(GENERATE, { prompt: 'p', imageUrls: urls(4), mask: 'https://x/m.png' }).payload.images.length, 4);
assert.strictEqual(payload(GENERATE, { prompt: 'p', imageUrls: urls(5) }).payload.images.length, 5);
assert.throws(
  () => payload(PRECISE_EDIT, { prompt: 'p', startFrame: 'https://x/s.png', imageUrls: urls(4), mask: 'https://x/m.png' }),
  /at most 3 reference images/,
);
assert.strictEqual(
  payload(PRECISE_EDIT, { prompt: 'p', startFrame: 'https://x/s.png', imageUrls: urls(3), mask: 'https://x/m.png' })
    .payload.reference_images.length,
  3,
);
assert.strictEqual(
  payload(PRECISE_EDIT, { prompt: 'p', startFrame: 'https://x/s.png', imageUrls: urls(4) }).payload.reference_images.length,
  4,
);

// ── very_high caps the output count (constraints alone are UI-only) ──
assert.throws(
  () => payload(PRECISE_EDIT, { prompt: 'p', startFrame: 'https://x/s.png', quality: 'very_high', count: 5 }),
  /at most 4 images/,
);
assert.strictEqual(
  payload(PRECISE_EDIT, { prompt: 'p', startFrame: 'https://x/s.png', quality: 'very_high', count: 4 }).payload.num_images,
  4,
);
assert.strictEqual(
  payload(PRECISE_EDIT, { prompt: 'p', startFrame: 'https://x/s.png', quality: 'high', count: 8 }).payload.num_images,
  8,
);

// ── Constraints ───────────────────────────────────────────────────────
{
  // `mask` is a model-specific file key, not a GenerationContext field.
  const restrictions = (id: string, values: Record<string, unknown>) =>
    evaluateConstraints(getModel(id)!.constraints, values as Partial<GenerationContext>);
  const allowedOf = (id: string, values: Record<string, unknown>, key: string) => {
    const r = restrictions(id, values).get(key);
    return r?.kind === 'allowed' ? r.allowed : undefined;
  };

  assert.strictEqual(restrictions(GENERATE, { imageUrls: ['a'], mask: 'm' }).get('size')?.kind, 'disabled');
  assert.deepStrictEqual(allowedOf(GENERATE, { imageUrls: ['a'] }, 'size'), ['auto', 'source']);
  assert.strictEqual(restrictions(GENERATE, {}).get('mask')?.kind, 'disabled');
  assert.ok(!allowedOf(GENERATE, {}, 'size')?.includes('source'), 'text-to-image must not offer "source"');
  assert.deepStrictEqual(allowedOf(PRECISE_EDIT, { quality: 'very_high' }, 'count'), [1, 2, 3, 4]);
}

console.log('✓ ideogram-4-5.test.ts — all passed');

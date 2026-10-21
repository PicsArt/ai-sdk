/**
 * Ideogram Vector — offline checks of the two production models: release
 * gating, routing, wire payloads (images source-first, aspect ratio passed
 * in `W:H` for the worker to convert, vendor-default quality) and vectorize.
 */
import assert from 'node:assert';
import { catalog } from '../../src/core/descriptors/model-accessor.ts';
import { getModel } from '../../src/core/model-registry.ts';
import { prepareRequest } from '../../src/client/prepare.ts';
import '../../src/vendors/catalog/index.ts';

const GENERATE = 'ideogram-vector-1';
const VECTORIZE = 'ideogram-vector-1-vectorize';

const payload = (id: string, ctx: Record<string, unknown>) => {
  const model = getModel(id);
  assert.ok(model, `${id} must be registered`);
  return prepareRequest(model, ctx) as { workflow: string; payload: Record<string, any> };
};

// ── Release gating: production ────────────────────────────────────────
for (const id of [GENERATE, VECTORIZE]) {
  assert.strictEqual(getModel(id)?.release, undefined, `${id} must not carry a release tag (⇒ production)`);
  assert.ok(catalog.all().some((m) => m.id === id), `${id} must be visible in the default catalog`);
}

// Both return SVG with no format param → Drive saves made before the job are named .svg.
for (const id of [GENERATE, VECTORIZE]) {
  assert.strictEqual(getModel(id)?.outputExtension, 'svg', `${id} must declare its svg output`);
}

// Vectorize returns in seconds → sync; generate polls the vendor → async.
assert.strictEqual(getModel(VECTORIZE)?.syncExecute, true);
assert.strictEqual(getModel(GENERATE)?.syncExecute, undefined);

// ── Generate: text-to-SVG ─────────────────────────────────────────────
{
  const { workflow, payload: body } = payload(GENERATE, {
    prompt: 'a cat logo', aspectRatio: '16:9', quality: 'high', count: 2, seed: 7,
  });
  assert.strictEqual(workflow, 'ideogram/vector/generate');
  assert.deepStrictEqual(body, {
    prompt: 'a cat logo', aspect_ratio: '16:9', quality: 'high', num_images: 2, seed: 7,
  });
}

// Omitted quality → vendor default medium; no aspect ratio / images / seed on the wire.
assert.deepStrictEqual(payload(GENERATE, { prompt: 'p' }).payload, { prompt: 'p', quality: 'medium', num_images: 1 });

// ── Generate: with reference images (same workflow) ───────────────────
{
  const { workflow, payload: body } = payload(GENERATE, {
    prompt: 'flat icon in the style of image 1', imageUrls: ['https://x/a.png', 'https://x/b.png'], aspectRatio: 'auto',
  });
  assert.strictEqual(workflow, 'ideogram/vector/generate');
  assert.deepStrictEqual(body, {
    prompt: 'flat icon in the style of image 1', images: ['https://x/a.png', 'https://x/b.png'],
    aspect_ratio: 'auto', quality: 'medium', num_images: 1,
  });
}

// ── Vectorize ─────────────────────────────────────────────────────────
{
  const { workflow, payload: body } = payload(VECTORIZE, { startFrame: 'https://x/logo.png', mode: 'simple' });
  assert.strictEqual(workflow, 'ideogram/vector/vectorize');
  assert.deepStrictEqual(body, { image: 'https://x/logo.png', mode: 'simple' });
}

assert.deepStrictEqual(payload(VECTORIZE, { startFrame: 'https://x/logo.png' }).payload, {
  image: 'https://x/logo.png', mode: 'default',
});

assert.throws(() => payload(VECTORIZE, {}), /startFrame/, 'vectorize requires a source image');

// ── Param surface ─────────────────────────────────────────────────────
{
  const quality = getModel(GENERATE)!.paramConfig.quality?.descriptor;
  assert.ok(quality?.kind === 'enum');
  assert.deepStrictEqual(quality.options.map((o) => o.id), ['low', 'medium', 'high']);

  const mode = getModel(VECTORIZE)!.paramConfig.mode?.descriptor;
  assert.ok(mode?.kind === 'enum');
  assert.deepStrictEqual(mode.options.map((o) => o.id), ['default', 'simple']);
}

console.log('✓ ideogram-vector.test.ts — all passed');

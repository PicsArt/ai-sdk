/**
 * GPT Image 2.5 — the two ways to set the output size: `aspectRatio` +
 * `resolution` (mapped onto the 16px grid per tier), or an exact `size`
 * passed through as-is. The caller picks either; a given size overrides the
 * ratio and tier, and is held to the same rules the worker and the OpenAI API
 * enforce.
 */
import assert from 'node:assert';
import { Model } from '../../src/core/descriptors/model-accessor.ts';
import { getModel } from '../../src/core/model-registry.ts';
import { prepareRequest } from '../../src/client/prepare.ts';
import { GPT_IMAGE_25_SIZES, gptImageSizeViolation } from '../../src/vendors/catalog/openai.ts';
import '../../src/vendors/catalog/index.ts';

const MODELS = ['gpt-image-2.5-flare', 'gpt-image-2.5-sunburst'];
const IMAGE = 'https://x/a.png';

const size = (id: string, ctx: Record<string, unknown>) => {
  const model = getModel(id);
  assert.ok(model, `${id} must be registered`);
  return prepareRequest(model, ctx).payload.size;
};

const rejects = (id: string, ctx: Record<string, unknown>, message: RegExp) => {
  const model = getModel(id);
  assert.ok(model, `${id} must be registered`);
  assert.throws(() => prepareRequest(model, ctx), message);
  const result = Model(id).validate(ctx);
  assert.strictEqual(result.valid, false);
  assert.match(result.errors?.[0] ?? '', message);
};

// ── Every tier entry is a size the API accepts ────────────────────────
for (const [tier, sizes] of Object.entries(GPT_IMAGE_25_SIZES)) {
  for (const [ar, wxh] of Object.entries(sizes)) {
    assert.strictEqual(gptImageSizeViolation(wxh), null, `${tier} ${ar} → ${wxh}`);
    const [w, h] = wxh.split('x').map(Number);
    assert.ok(w * h <= 3840 * 2160, `${tier} ${ar} → ${wxh} stays within the 4K pixel budget`);
    const [aw, ah] = ar.split(':').map(Number);
    assert.ok(Math.abs(w / h - aw / ah) < 0.02, `${tier} ${ar} → ${wxh} keeps the ratio`);
  }
}

// ── Custom size rules ─────────────────────────────────────────────────
assert.strictEqual(gptImageSizeViolation('3840x1280'), null);
assert.strictEqual(gptImageSizeViolation('2560x2560'), null);
assert.match(gptImageSizeViolation('large') ?? '', /WIDTHxHEIGHT/);
assert.match(gptImageSizeViolation('01024x1024') ?? '', /WIDTHxHEIGHT/);
assert.match(gptImageSizeViolation('1000x1024') ?? '', /divisible by 16/);
assert.match(gptImageSizeViolation('3200x1024') ?? '', /1:3 and 3:1/);
assert.match(gptImageSizeViolation('4096x2048') ?? '', /longest edge/);
// Total pixels: 655,360–8,294,400.
assert.strictEqual(gptImageSizeViolation('2880x2880'), null);
assert.strictEqual(gptImageSizeViolation('1024x640'), null);
assert.match(gptImageSizeViolation('3840x3840') ?? '', /total pixel count/);
assert.match(gptImageSizeViolation('512x512') ?? '', /total pixel count/);

for (const id of MODELS) {
  // ── aspectRatio + resolution ────────────────────────────────────────
  // No tier keeps the size the model always produced.
  assert.strictEqual(size(id, { prompt: 'p', aspectRatio: '16:9' }), '1824x1024');
  assert.strictEqual(size(id, { prompt: 'p', aspectRatio: '16:9', resolution: '1K' }), '1824x1024');
  assert.strictEqual(size(id, { prompt: 'p', aspectRatio: '16:9', resolution: '2K' }), '2560x1440');
  assert.strictEqual(size(id, { prompt: 'p', aspectRatio: '16:9', resolution: '4K' }), '3840x2160');
  assert.strictEqual(size(id, { prompt: 'p', aspectRatio: '1:1', resolution: '4K' }), '2880x2880');
  assert.strictEqual(size(id, { prompt: 'p', imageUrls: [IMAGE], aspectRatio: '9:16', resolution: '2K' }), '1440x2560');

  // `auto` lets the model pick, whatever the tier.
  assert.strictEqual(size(id, { prompt: 'p', aspectRatio: 'auto', resolution: '4K' }), 'auto');
  assert.strictEqual(size(id, { prompt: 'p', imageUrls: [IMAGE], aspectRatio: 'auto' }), 'auto');

  // Route defaults without a ratio: square on t2i, the source's size on edits.
  assert.strictEqual(size(id, { prompt: 'p' }), '1024x1024');
  assert.strictEqual(size(id, { prompt: 'p', imageUrls: [IMAGE] }), 'auto');
  // A tier without a ratio scales the route default: square on t2i, still the source's size on edits.
  assert.strictEqual(size(id, { prompt: 'p', resolution: '2K' }), '2048x2048');
  assert.strictEqual(size(id, { prompt: 'p', imageUrls: [IMAGE], resolution: '2K' }), 'auto');

  // ── Exact size ──────────────────────────────────────────────────────
  assert.strictEqual(size(id, { prompt: 'p', size: '2048x1152' }), '2048x1152');
  assert.strictEqual(size(id, { prompt: 'p', size: ' 3840x1280 ' }), '3840x1280');
  assert.strictEqual(size(id, { prompt: 'p', imageUrls: [IMAGE], size: '1536x2048' }), '1536x2048');
  // A blank size is no size.
  assert.strictEqual(size(id, { prompt: 'p', size: '', aspectRatio: '3:2', resolution: '2K' }), '2496x1664');
  assert.strictEqual(Model(id).validate({ prompt: 'p', size: '2048x1152' }).valid, true);

  // ── Size overrides aspectRatio / resolution ─────────────────────────
  assert.strictEqual(size(id, { prompt: 'p', size: '2048x1152', aspectRatio: '1:1' }), '2048x1152');
  assert.strictEqual(size(id, { prompt: 'p', size: '2048x1152', resolution: '4K' }), '2048x1152');
  assert.strictEqual(size(id, { prompt: 'p', size: '2048x1152', aspectRatio: 'auto', resolution: '2K' }), '2048x1152');
  assert.strictEqual(size(id, { prompt: 'p', imageUrls: [IMAGE], size: '1536x2048', aspectRatio: '16:9' }), '1536x2048');
  assert.strictEqual(Model(id).validate({ prompt: 'p', size: '2048x1152', aspectRatio: '16:9', resolution: '2K' }).valid, true);

  // ── Invalid custom sizes are refused before submit ──────────────────
  rejects(id, { prompt: 'p', size: '1000x1024' }, /"size" both dimensions must be divisible by 16/);
  rejects(id, { prompt: 'p', size: '4096x2048' }, /"size" the longest edge/);
  rejects(id, { prompt: 'p', size: '1024 x 1024' }, /"size" must be WIDTHxHEIGHT/);
  rejects(id, { prompt: 'p', size: '3840x3840' }, /"size" the total pixel count/);
  rejects(id, { prompt: 'p', size: '512x512' }, /"size" the total pixel count/);

  // ── UI: a size disables the ratio and tier; auto disables the tier ──
  {
    const accessor = Model(id).paramsFor({ size: '2048x1152' });
    assert.strictEqual(accessor.param('aspectRatio')?.disabled, true);
    assert.strictEqual(accessor.param('resolution')?.disabled, true);
  }
  {
    const accessor = Model(id).paramsFor({ aspectRatio: 'auto' });
    assert.strictEqual(accessor.param('resolution')?.disabled, true);
    assert.notStrictEqual(accessor.param('aspectRatio')?.disabled, true);
  }
  assert.notStrictEqual(Model(id).paramsFor({ aspectRatio: '16:9' }).param('resolution')?.disabled, true);
}

// gpt-image-2 is untouched: no tier, no custom size.
{
  const params = Model('gpt-image-2').params();
  assert.strictEqual(params.param('resolution'), undefined);
  assert.strictEqual(params.param('size'), undefined);
}

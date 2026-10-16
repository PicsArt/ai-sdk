/**
 * Kling 4.0 (kling-v4 / kling-v4-omni) — routing and wire payloads.
 * kling-v4 is a combined T2V/I2V entry: any frame switches to the
 * image-to-video workflow, with start / middle / end keyframes. Resolution is
 * always sent (vendor default 1080p, pricing falls back to 720p).
 */
import assert from 'node:assert';
import { getModel } from '../../src/core/model-registry.ts';
import { prepareRequest } from '../../src/client/prepare.ts';
import '../../src/vendors/catalog/index.ts';

const A = 'https://x/a.png';
const B = 'https://x/b.png';
const Z = 'https://x/z.png';
const V = 'https://x/v.mp4';

const prepare = (id: string, ctx: Record<string, unknown>) => {
  const model = getModel(id);
  assert.ok(model, `${id} must be registered`);
  return prepareRequest(model, ctx);
};

// ── kling-v4: text-to-video ─────────────────────────────────────────
{
  const { workflow, payload } = prepare('kling-v4', { prompt: 'a cat', duration: 30, aspectRatio: '21:9' });
  assert.strictEqual(workflow, 'kling-text-to-video');
  assert.deepStrictEqual(payload, {
    prompt: 'a cat', aspect_ratio: '21:9', duration: '30', model_name: 'kling-v4', resolution: '720p',
  });
}

// ── kling-v4: image-to-video with start / middle / end frames ───────
{
  const { workflow, payload } = prepare('kling-v4', {
    prompt: 'move', startFrame: A, imageUrls: [B, B], endFrame: Z, resolution: '1080p',
  });
  assert.strictEqual(workflow, 'kling-image-to-video');
  assert.deepStrictEqual(payload, {
    prompt: 'move', aspect_ratio: '16:9', duration: '5', model_name: 'kling-v4', resolution: '1080p',
    image: A, image_middle: [B, B], image_tail: Z,
  });
}

// ── kling-v4: imageUrls only — imageUrls[0] is the start frame ──────
{
  const { workflow, payload } = prepare('kling-v4', { prompt: 'move', imageUrls: [A] });
  assert.strictEqual(workflow, 'kling-image-to-video');
  assert.strictEqual(payload.image, A);
  assert.strictEqual(payload.image_middle, undefined);
}
{
  const { payload } = prepare('kling-v4', { prompt: 'move', imageUrls: [A, B, B], endFrame: Z });
  assert.strictEqual(payload.image, A);
  assert.deepStrictEqual(payload.image_middle, [B, B]);
  assert.strictEqual(payload.image_tail, Z);
}

// ── kling-v4: an end frame alone needs a start frame ────────────────
assert.throws(() => prepare('kling-v4', { prompt: 'move', endFrame: Z }), /requires a start frame/);

// ── kling-v4-omni: frames + reference images + video + elements ─────
{
  const { workflow, payload } = prepare('kling-v4-omni', {
    prompt: 'animate', startFrame: A, endFrame: Z, imageUrls: [B], videoUrl: V, referType: 'base',
    elementList: [{ element_id: '873462389237648923' }], aspectRatio: 'adaptive', duration: 12, resolution: '1080p',
  });
  assert.strictEqual(workflow, 'kling-omni-video');
  assert.deepStrictEqual(payload, {
    prompt: 'animate', model_name: 'kling-v4-omni', aspect_ratio: 'adaptive', duration: '12', resolution: '1080p',
    image_list: [{ image_url: A, type: 'first_frame' }, { image_url: Z, type: 'end_frame' }, { image_url: B }],
    video_list: [{ video_url: V, refer_type: 'base' }],
    element_list: [{ element_id: '873462389237648923' }],
  });
}

// ── kling-v4-omni: text only — no sound / mode / keep_original_sound ─
{
  const { payload } = prepare('kling-v4-omni', { prompt: 'a cat' });
  assert.deepStrictEqual(payload, {
    prompt: 'a cat', model_name: 'kling-v4-omni', aspect_ratio: '16:9', duration: '5', resolution: '720p',
  });
}

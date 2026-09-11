/**
 * HeyGen aspect_ratio — both models take HeyGen's full VideoAspectRatio enum.
 *
 * 'auto' is the reason this exists: custom photo-clone / video-clone avatars
 * must keep the user's own crop instead of being snapped to 16:9 / 9:16 and
 * coming back pillarboxed. The SDK's own contract validation used to throw on
 * it before a request was ever built, so these checks pin the enum and pin
 * that the value reaches the wire untouched.
 *
 * Enum verified against the OpenAPI schema on
 * https://developers.heygen.com/reference/create-video (VideoAspectRatio).
 */
import assert from 'node:assert';
import { prepareRequest } from '../../src/client/prepare.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import { Model } from '../../src/core/descriptors/model-accessor.ts';
import { HeygenTalkingPhoto, HeygenVideoAvatar } from '../../src/generated/model-constants.ts';
import type { GenerationContext } from '../../src/core/types.ts';

/** HeyGen's documented enum, in HeyGen's order — 16:9 first is the default. */
const HEYGEN_RATIOS = ['16:9', '9:16', '4:5', '5:4', '1:1', 'auto'];

const MODELS: { id: string; ctx: Partial<GenerationContext> }[] = [
  { id: HeygenTalkingPhoto, ctx: { prompt: 'x'.repeat(20), voiceId: 'v1', imageUrls: ['https://cdn/portrait.png'] } },
  { id: HeygenVideoAvatar, ctx: { prompt: 'x'.repeat(20), voiceId: 'v1', videoId: 'avatar_1' } },
];

for (const { id, ctx } of MODELS) {
  // ── The enum, and the default that must not move ──────────────────
  {
    const ar = Model(id).params().enum('aspectRatio');
    assert.deepStrictEqual(ar?.options.map(o => o.id), HEYGEN_RATIOS, `${id}: HeyGen's enum, in HeyGen's order`);
    assert.strictEqual(ar?.default, '16:9', `${id}: widening must not move the default`);
  }

  // ── Every value reaches the wire untouched ────────────────────────
  {
    const def = resolveModel(id);
    for (const ratio of HEYGEN_RATIOS) {
      assert.strictEqual(
        prepareRequest(def, { ...ctx, aspectRatio: ratio }).payload.aspect_ratio, ratio,
        `${id}: ${ratio} passes straight through — HeyGen resolves 'auto' server-side`,
      );
    }

    // Omitted stays off the wire, so HeyGen applies its own 16:9 default.
    assert.ok(!('aspect_ratio' in prepareRequest(def, ctx).payload), `${id}: no ratio, no key`);

    // The enum still narrows — widening is not "anything goes".
    assert.throws(
      () => prepareRequest(def, { ...ctx, aspectRatio: '21:9' }),
      /"aspectRatio" must be one of/,
      `${id}: 21:9 is not in HeyGen's enum`,
    );
  }
}

console.log('✓ heygen-aspect-ratio.test.ts — all passed');

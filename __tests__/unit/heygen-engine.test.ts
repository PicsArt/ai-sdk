/**
 * HeyGen `engine` — opt-in on the worker, so its absence is load-bearing.
 *
 * Omitted, HeyGen renders with Avatar IV, which is what every request did
 * before Avatar V existed. So the key must stay off the wire until a caller
 * picks an engine, and the picker default must not leak onto it.
 *
 * Video Avatar only: Avatar V renders stock avatars, and HeyGen refuses
 * `engine` on an image request outright ("Extra inputs are not permitted"),
 * whatever the value — so Talking Photo must not offer it.
 */
import assert from 'node:assert';
import { prepareRequest } from '../../src/client/prepare.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import { Model } from '../../src/core/descriptors/model-accessor.ts';
import { HeygenTalkingPhoto, HeygenVideoAvatar } from '../../src/generated/model-constants.ts';
import type { GenerationContext } from '../../src/core/types.ts';

const avatarCtx: Partial<GenerationContext> = { prompt: 'x'.repeat(20), voiceId: 'v1', videoId: 'avatar_1' };
const photoCtx: Partial<GenerationContext> = { prompt: 'x'.repeat(20), voiceId: 'v1', imageUrls: ['https://cdn/portrait.png'] };

/** `engine` is a per-model param, so it lives outside GenerationContext by design. */
const withEngine = (engine: string) => ({ ...avatarCtx, engine }) as Partial<GenerationContext>;

// ── The enum HeyGen accepts ─────────────────────────────────────────
{
  const engine = Model(HeygenVideoAvatar).params().enum('engine');
  assert.deepStrictEqual(engine?.options.map(o => o.id), ['avatar_iv', 'avatar_v'], 'both engines, IV first');
  assert.strictEqual(engine?.default, 'avatar_iv', 'the picker default is what the vendor renders without the field');
}

// ── A picked engine reaches the wire; an unpicked one does not ──────
{
  const def = resolveModel(HeygenVideoAvatar);
  for (const engine of ['avatar_iv', 'avatar_v']) {
    assert.strictEqual(prepareRequest(def, withEngine(engine)).payload.engine, engine, `${engine} passes through`);
  }

  // The default must not be applied for the caller — an absent engine is how
  // every shipped request keeps its current behaviour.
  assert.ok(!('engine' in prepareRequest(def, avatarCtx).payload), 'no engine picked, no engine key');

  assert.throws(
    () => prepareRequest(def, withEngine('avatar_vi')),
    /"engine" must be one of/,
    'the enum still narrows',
  );
}

// ── Talking Photo is an image request and offers no engine ──────────
{
  assert.strictEqual(Model(HeygenTalkingPhoto).params().enum('engine'), undefined, 'not offered on an image model');
  assert.ok(
    !('engine' in prepareRequest(resolveModel(HeygenTalkingPhoto), photoCtx).payload),
    'an image request must never carry an engine',
  );
}

console.log('✓ heygen-engine.test.ts — all passed');

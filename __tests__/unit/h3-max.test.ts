/**
 * MiniMax H3 Max — one catalog entry covering all three modes, which the
 * inputs pick. The SDK's job is to send what the caller filled and to keep
 * those inputs on exactly one mode, which is what these checks pin.
 */
import assert from 'node:assert';
import { prepareRequest } from '../../src/client/prepare.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import { Model } from '../../src/core/descriptors/model-accessor.ts';
import { MinimaxH3Max } from '../../src/generated/model-constants.ts';

const def = resolveModel(MinimaxH3Max);
const TASK = 'minimax/h3-max/video-generation';

// ── One workflow for every mode ────────────────────────────────────
{
  assert.strictEqual(def.workflow, TASK);
  assert.strictEqual(def.editWorkflow, undefined, 'the mode follows the inputs, so no edit workflow');

  for (const ctx of [
    { prompt: 'a fox in the snow' },
    { prompt: 'pan out', startFrame: 'https://cdn/a.png' },
    { prompt: 'Image 1 walks on', imageUrls: ['https://cdn/ref.png'] },
  ]) {
    assert.strictEqual(prepareRequest(def, ctx).workflow, TASK);
  }
}

// ── Wire shape: the union the router task accepts ──────────────────
{
  const t2v = prepareRequest(def, { prompt: 'a fox in the snow' }).payload;
  assert.deepStrictEqual(t2v, {
    prompt: 'a fox in the snow',
    prompt_expansion_mode: 'balanced',
    duration: 5,
    // Uppercase for the command's enum; paramConfig keeps the lowercase form
    // the pricing qualities use.
    resolution: '768P',
    aspect_ratio: '16:9',
    enable_safety_checker: true,
  });

  assert.strictEqual(
    prepareRequest(def, { prompt: 'sharper', resolution: '1080p' }).payload.resolution, '1080P',
    '1080p is a latent refinement of a native 768p generation',
  );

  const frames = prepareRequest(def, {
    prompt: 'morph', startFrame: 'https://cdn/a.png', endFrame: 'https://cdn/b.png',
  }).payload;
  assert.strictEqual(frames.image_url, 'https://cdn/a.png');
  assert.strictEqual(frames.end_image_url, 'https://cdn/b.png');
  assert.ok(!('aspect_ratio' in frames), 'a frame decides the ratio itself');

  // fal accepts an end frame on its own (end-only keyframe generation), so the
  // SDK must not require a start frame to send one.
  const endOnly = prepareRequest(def, { prompt: 'land here', endFrame: 'https://cdn/b.png' }).payload;
  assert.strictEqual(endOnly.end_image_url, 'https://cdn/b.png');
  assert.ok(!('image_url' in endOnly));

  // With references and no explicit ratio, the vendor default is 'adaptive'
  // (follow the references) — not the catalog's text-mode 16:9.
  assert.strictEqual(
    prepareRequest(def, { prompt: 'Image 1 walks on', imageUrls: ['https://cdn/ref.png'] })
      .payload.aspect_ratio,
    'adaptive',
  );

  const refs = prepareRequest(def, {
    prompt: 'Image 1 is the protagonist',
    imageUrls: ['https://cdn/ref.png'],
    audioUrls: ['https://cdn/ref.mp3'],
    aspectRatio: 'adaptive',
    seed: -1,
  }).payload;
  assert.deepStrictEqual(refs.reference_image_urls, ['https://cdn/ref.png']);
  assert.deepStrictEqual(refs.reference_audio_urls, ['https://cdn/ref.mp3']);
  assert.strictEqual(refs.aspect_ratio, 'adaptive');
  assert.ok(!('reference_video_urls' in refs), 'empty reference arrays stay off the wire');
  assert.ok(!('image_url' in refs), 'frames and references never travel together');
  assert.ok(!('seed' in refs), '-1 is the random-seed sentinel — dropped');
}

// ── Constraints keep the inputs on one mode ────────────────────────
{
  const withRefs = Model(MinimaxH3Max).paramsFor({ imageUrls: ['https://cdn/ref.png'] });
  assert.ok(withRefs.startFrame()?.disabled, 'references disable the start frame');
  assert.ok(withRefs.endFrame()?.disabled, 'references disable the end frame');

  const withFrame = Model(MinimaxH3Max).paramsFor({ startFrame: 'https://cdn/a.png' });
  for (const key of ['imageUrls', 'videoUrls', 'audioUrls'] as const) {
    assert.ok(withFrame.file(key)?.disabled, `a start frame disables ${key}`);
  }
  assert.ok(withFrame.aspectRatio()?.disabled, 'the image-to-video wire derives the ratio from the image');

  const endFrameOnly = Model(MinimaxH3Max).paramsFor({ endFrame: 'https://cdn/b.png' });
  assert.ok(!endFrameOnly.endFrame()?.disabled, 'an end frame alone is a valid mode');
  assert.ok(endFrameOnly.aspectRatio()?.disabled, 'it still routes to image-to-video');

  const bare = Model(MinimaxH3Max).paramsFor({ prompt: 'text only' });
  assert.ok(
    bare.aspectRatio()?.options.find(o => o.id === 'adaptive')?.disabled,
    "'adaptive' means follow the references — unavailable without them",
  );
  assert.ok(bare.file('audioUrls')?.disabled, 'audio cannot be the only reference');
}

// ── Prompt expansion follows the vendor's two documented modes ─────
{
  const modes = Model(MinimaxH3Max).params().enum('promptExpansionMode')?.options.map(o => o.id);
  assert.deepStrictEqual(modes, ['balanced', 'quality'], "the vendor dropped 'disabled'");
}

console.log('✓ h3-max.test.ts — all passed');

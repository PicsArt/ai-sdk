/**
 * Regression: every live Seedance model declares the input-media limits the
 * vendor enforces.
 *
 * All twenty shipped with an almost empty `FileDescriptor`: no duration cap on
 * any video or audio slot, nothing at all on `audioUrls`, `startFrame` or
 * `endFrame`, and no size or dimension bounds on the edit and extend routes.
 * The app measures attachments against exactly these fields at upload, so with
 * them unset the whole check was inert and the vendor was the first thing to
 * notice: 1,650 devices hit a Seedance `400` in the 30 days to 2026-09-16
 * (finding F7 on the generation-failure board).
 *
 * Numbers are the vendor's own, read off its rejection text. The one
 * deliberate departure is the per-clip duration cap: the vendor says 30.2 s
 * (2.5) and 15.2 s (2.0), but our seedance worker refuses the COMBINED length
 * of the array at a flat 30 / 15, so a client cap above that would only defer
 * the rejection.
 */
import assert from 'node:assert';
import { ALL_MODELS } from '../../src/vendors/catalog/index.ts';
import type { FileDescriptor } from '../../src/core/descriptors/types.ts';

const MIN_SIDE_PIXELS = 300;
const MAX_SIDE_PIXELS = 6_000;
const MAX_IMAGE_PIXELS = 36_000_000;
const MAX_IMAGE_BYTES = 31_457_280;
const FRAME_MIN_PIXELS = 90_000;
const VIDEO_MIN_PIXELS = 407_696;
const VIDEO_MAX_PIXELS = 8_295_044;
const MAX_VIDEO_BYTES = 209_715_200;
const MAX_AUDIO_BYTES = 15_728_640;
const MIN_MEDIA_SEC = 1.8;
const MAX_FRAME_RATE = 60;
const MIN_ASPECT_RATIO = 0.39;
const MAX_ASPECT_RATIO = 2.5;

/** 1.5 Pro and I2V are deprecated, run on older vendor models, and produced no
 *  measurement, so they are outside this rule on purpose. */
const seedanceModels = ALL_MODELS.filter(
  (m) => m.id.startsWith('seedance-2.'),
);

const fileDescriptor = (modelId: string, key: string): FileDescriptor | undefined => {
  const descriptor = ALL_MODELS.find((m) => m.id === modelId)?.paramConfig[key]?.descriptor;
  return descriptor?.kind === 'file' ? descriptor : undefined;
};

/** The per-family per-clip cap, which is the only limit that differs. */
const maxMediaSec = (modelId: string) => (modelId.startsWith('seedance-2.5') ? 30 : 15);

{
  assert.ok(seedanceModels.length >= 18, `expected the full 2.x family, got ${seedanceModels.length}`);
}

// ── Image slots: per-side floor and ceiling, area ceiling, size cap ─────
{
  for (const model of seedanceModels) {
    const descriptor = fileDescriptor(model.id, 'imageUrls');
    if (!descriptor) continue;
    assert.deepStrictEqual(
      {
        minSidePixels: descriptor.minSidePixels,
        maxSidePixels: descriptor.maxSidePixels,
        maxPixels: descriptor.maxPixels,
        minAspectRatio: descriptor.minAspectRatio,
        maxAspectRatio: descriptor.maxAspectRatio,
        maxBytes: descriptor.maxBytes,
      },
      {
        minSidePixels: MIN_SIDE_PIXELS,
        maxSidePixels: MAX_SIDE_PIXELS,
        maxPixels: MAX_IMAGE_PIXELS,
        minAspectRatio: MIN_ASPECT_RATIO,
        maxAspectRatio: MAX_ASPECT_RATIO,
        maxBytes: MAX_IMAGE_BYTES,
      },
      `${model.id}: imageUrls bounds`,
    );
  }
}

// ── Frame slots carry their OWN pixel floor, not the reference one ──────
{
  for (const model of seedanceModels) {
    for (const key of ['startFrame', 'endFrame']) {
      const descriptor = fileDescriptor(model.id, key);
      if (!descriptor) continue;
      assert.strictEqual(descriptor.minPixels, FRAME_MIN_PIXELS, `${model.id}: ${key} minPixels`);
      assert.strictEqual(descriptor.minSidePixels, MIN_SIDE_PIXELS, `${model.id}: ${key} minSidePixels`);
      assert.strictEqual(descriptor.maxSidePixels, MAX_SIDE_PIXELS, `${model.id}: ${key} maxSidePixels`);
      assert.strictEqual(descriptor.maxPixels, MAX_IMAGE_PIXELS, `${model.id}: ${key} maxPixels`);
      assert.strictEqual(descriptor.minAspectRatio, MIN_ASPECT_RATIO, `${model.id}: ${key} minAspectRatio`);
      assert.strictEqual(descriptor.maxAspectRatio, MAX_ASPECT_RATIO, `${model.id}: ${key} maxAspectRatio`);
      assert.strictEqual(descriptor.maxBytes, MAX_IMAGE_BYTES, `${model.id}: ${key} maxBytes`);
    }
  }
}

// ── Video slots, single and array, on every route ───────────────────────
{
  for (const model of seedanceModels) {
    for (const key of ['videoUrl', 'videoUrls']) {
      const descriptor = fileDescriptor(model.id, key);
      if (!descriptor) continue;
      assert.deepStrictEqual(
        {
          minPixels: descriptor.minPixels,
          maxPixels: descriptor.maxPixels,
          minSidePixels: descriptor.minSidePixels,
          maxSidePixels: descriptor.maxSidePixels,
          minAspectRatio: descriptor.minAspectRatio,
          maxAspectRatio: descriptor.maxAspectRatio,
          maxBytes: descriptor.maxBytes,
          minDurationSec: descriptor.minDurationSec,
          maxDurationSec: descriptor.maxDurationSec,
          maxFrameRate: descriptor.maxFrameRate,
        },
        {
          minPixels: VIDEO_MIN_PIXELS,
          maxPixels: VIDEO_MAX_PIXELS,
          minSidePixels: MIN_SIDE_PIXELS,
          maxSidePixels: MAX_SIDE_PIXELS,
          minAspectRatio: MIN_ASPECT_RATIO,
          maxAspectRatio: MAX_ASPECT_RATIO,
          maxBytes: MAX_VIDEO_BYTES,
          minDurationSec: MIN_MEDIA_SEC,
          maxDurationSec: maxMediaSec(model.id),
          maxFrameRate: MAX_FRAME_RATE,
        },
        `${model.id}: ${key} bounds`,
      );
    }
  }
}

// ── Audio slots, which declared nothing whatsoever before ───────────────
{
  const withAudio = seedanceModels.filter((m) => fileDescriptor(m.id, 'audioUrls'));
  assert.ok(withAudio.length >= 6, `expected the audio-capable models, got ${withAudio.length}`);

  for (const model of withAudio) {
    const descriptor = fileDescriptor(model.id, 'audioUrls')!;
    assert.deepStrictEqual(
      {
        minDurationSec: descriptor.minDurationSec,
        maxDurationSec: descriptor.maxDurationSec,
        maxBytes: descriptor.maxBytes,
      },
      {
        minDurationSec: MIN_MEDIA_SEC,
        maxDurationSec: maxMediaSec(model.id),
        maxBytes: MAX_AUDIO_BYTES,
      },
      `${model.id}: audioUrls bounds`,
    );
  }
}

/**
 * Regression: the MiniMax H3 video models declare the input-media limits the
 * vendor enforces.
 *
 * None of them declared any, so the app's upload-time check was inert and the
 * vendor was the first thing to refuse a bad file. Those refusals come back as
 * `422`, the moderation code, which kept them off the generation-failure board
 * (finding F74, 82 devices over the 30 days to 2026-09-24).
 *
 * Numbers are the vendor's own, read off its rejection text:
 *   "minimum dimensions are 256x256 pixels"
 *   "maximum dimensions are 5760x5760 pixels"
 *   "the aspect ratio of the image should be between 0.4 and 2.5"
 *   "video duration is too short. minimum is 2.0 seconds"
 *   "video duration exceeds the maximum allowed. maximum is 15.0 seconds"
 *   "file size exceeds the maximum allowed size of 52428800 bytes"
 *   "minimum is 23.899 fps, maximum is 60.1925 fps"  (declared as 60)
 *   "audio duration is too short. minimum is 2.0 seconds"
 *   minimax-h3: "audio duration …, expected [2000, 15000] ms"
 *
 * `minimax-h3-max-lip-sync` is left out on purpose: nothing measured its limits.
 */
import assert from 'node:assert';
import { ALL_MODELS } from '../../src/vendors/catalog/index.ts';
import type { FileDescriptor } from '../../src/core/descriptors/types.ts';

const IMAGE_BOUNDS = { minSidePixels: 256, maxSidePixels: 5760, minAspectRatio: 0.4, maxAspectRatio: 2.5 };
const VIDEO_BOUNDS = { minDurationSec: 2, maxDurationSec: 15, maxFrameRate: 60, maxBytes: 52_428_800 };
const AUDIO_BOUNDS = { minDurationSec: 2, maxDurationSec: 15 };

/** Which slots of which model carry which bounds. */
const EXPECTED: Record<string, Record<string, Record<string, number>>> = {
  'minimax-h3-max': {
    startFrame: IMAGE_BOUNDS, endFrame: IMAGE_BOUNDS, imageUrls: IMAGE_BOUNDS,
    videoUrls: VIDEO_BOUNDS, audioUrls: AUDIO_BOUNDS,
  },
  'minimax-h3': {
    startFrame: IMAGE_BOUNDS, endFrame: IMAGE_BOUNDS, imageUrls: IMAGE_BOUNDS,
    videoUrls: VIDEO_BOUNDS, audioUrls: AUDIO_BOUNDS,
  },
  'minimax-h3-max-turbo': { startFrame: IMAGE_BOUNDS, endFrame: IMAGE_BOUNDS },
  'minimax-h3-max-camera-controls': { startFrame: IMAGE_BOUNDS },
};

const fileDescriptor = (modelId: string, key: string): FileDescriptor | undefined => {
  const descriptor = ALL_MODELS.find((model) => model.id === modelId)?.paramConfig[key]?.descriptor;
  return descriptor?.kind === 'file' ? descriptor : undefined;
};

/** One bound field of a slot, `undefined` when the slot does not declare it. */
const boundOf = (descriptor: FileDescriptor | undefined, field: string): unknown =>
  descriptor?.[field as keyof FileDescriptor];

// ── Every listed slot exists and carries exactly the vendor's numbers ────
{
  for (const [modelId, slots] of Object.entries(EXPECTED)) {
    assert.ok(ALL_MODELS.some((model) => model.id === modelId), `${modelId} is in the catalog`);
    for (const [key, bounds] of Object.entries(slots)) {
      const descriptor = fileDescriptor(modelId, key);
      assert.ok(descriptor, `${modelId}: ${key} is a file slot`);
      const declared = Object.fromEntries(Object.keys(bounds).map((field) => [field, boundOf(descriptor, field)]));
      assert.deepStrictEqual(declared, bounds, `${modelId}: ${key} bounds`);
    }
  }
}

// ── Image bounds stay off video and audio slots, and vice versa ──────────
// A pixel floor on an audio slot, or a duration cap on an image, would refuse
// files the vendor accepts.
{
  for (const [modelId, slots] of Object.entries(EXPECTED)) {
    for (const [key, bounds] of Object.entries(slots)) {
      const descriptor = fileDescriptor(modelId, key);
      const foreign = bounds === IMAGE_BOUNDS
        ? ['minDurationSec', 'maxDurationSec', 'maxFrameRate']
        : ['minSidePixels', 'maxSidePixels', 'minAspectRatio', 'maxAspectRatio'];
      for (const field of foreign) {
        assert.strictEqual(boundOf(descriptor, field), undefined, `${modelId}: ${key} must not declare ${field}`);
      }
    }
  }
}

// ── Declaring bounds did not change the slots' shape ─────────────────────
{
  const param = (modelId: string, key: string) =>
    ALL_MODELS.find((model) => model.id === modelId)?.paramConfig[key];
  for (const modelId of ['minimax-h3-max', 'minimax-h3']) {
    assert.strictEqual(fileDescriptor(modelId, 'imageUrls')?.array?.max, 9, `${modelId}: imageUrls max`);
    assert.strictEqual(fileDescriptor(modelId, 'videoUrls')?.array?.max, 3, `${modelId}: videoUrls max`);
    assert.strictEqual(fileDescriptor(modelId, 'audioUrls')?.array?.max, 3, `${modelId}: audioUrls max`);
    assert.strictEqual(param(modelId, 'imageUrls')?.category, 'reference', `${modelId}: imageUrls category`);
    assert.strictEqual(param(modelId, 'imageUrls')?.label, 'Reference Images', `${modelId}: imageUrls label`);
    assert.strictEqual(param(modelId, 'startFrame')?.category, 'asset', `${modelId}: startFrame category`);
    assert.notStrictEqual(param(modelId, 'startFrame')?.required, true, `${modelId}: startFrame optional`);
    assert.strictEqual(param(modelId, 'endFrame')?.label, 'End Frame', `${modelId}: endFrame label`);
  }
  assert.strictEqual(param('minimax-h3-max-camera-controls', 'startFrame')?.required, true);
}

// ── Lip-sync keeps no bounds until something measures them ───────────────
{
  const portrait = fileDescriptor('minimax-h3-max-lip-sync', 'startFrame');
  assert.ok(portrait, 'minimax-h3-max-lip-sync: startFrame is a file slot');
  for (const field of Object.keys(IMAGE_BOUNDS)) {
    assert.strictEqual(boundOf(portrait, field), undefined, `minimax-h3-max-lip-sync: startFrame ${field}`);
  }
}

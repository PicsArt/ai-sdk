/**
 * Regression: the Kling file slots whose limits have a written number declare
 * them, so the app measures the attachment at upload instead of the vendor
 * refusing it after Generate (finding F55 on the generation-failure board).
 *
 * Every number is the vendor's own rejection text, or the worker DTO for the
 * motion-control workflow. Slots where the vendor rejects without printing a
 * threshold (omni and image-route images) are deliberately left bare.
 */
import assert from 'node:assert';
import { ALL_MODELS } from '../../src/vendors/catalog/index.ts';
import type { FileDescriptor } from '../../src/core/descriptors/types.ts';

const fileDescriptor = (modelId: string, key: string): FileDescriptor => {
  const descriptor = ALL_MODELS.find((m) => m.id === modelId)?.paramConfig[key]?.descriptor;
  assert.ok(descriptor?.kind === 'file', `${modelId}.${key} must be a file slot`);
  return descriptor;
};

const pick = (d: FileDescriptor, keys: readonly (keyof FileDescriptor)[]) =>
  Object.fromEntries(keys.map((k) => [k, d[k]]));

// kling-v3-omni reference video: 3-15.5 s, 700-4553 px a side.
{
  const d = fileDescriptor('kling-v3-omni', 'videoUrl');
  assert.deepStrictEqual(
    pick(d, ['minDurationSec', 'maxDurationSec', 'minSidePixels', 'maxSidePixels']),
    { minDurationSec: 3, maxDurationSec: 15.5, minSidePixels: 700, maxSidePixels: 4553 },
  );
}

// Both motion-control models: the person photo and the motion clip.
for (const id of ['kling-motion-control', 'kling-motion-control-v3']) {
  const image = fileDescriptor(id, 'imageUrls');
  assert.deepStrictEqual(
    pick(image, ['minSidePixels', 'maxSidePixels', 'minAspectRatio', 'maxAspectRatio', 'maxBytes']),
    { minSidePixels: 300, maxSidePixels: 65536, minAspectRatio: 0.4, maxAspectRatio: 2.5, maxBytes: 10 * 1024 * 1024 },
    `${id} person photo`,
  );

  const video = fileDescriptor(id, 'videoUrl');
  assert.deepStrictEqual(
    pick(video, ['minDurationSec', 'maxDurationSec', 'minSidePixels', 'maxSidePixels', 'maxBytes']),
    { minDurationSec: 3, maxDurationSec: 30, minSidePixels: 340, maxSidePixels: 3850, maxBytes: 100 * 1024 * 1024 },
    `${id} motion clip`,
  );
}

// kling-avatar speech track: at most 300 s.
{
  const d = fileDescriptor('kling-avatar', 'audioUrl');
  assert.strictEqual(d.maxDurationSec, 300);
}

// Unprinted image rules stay undeclared: a guessed bound would refuse files
// the vendor accepts.
for (const [id, key] of [['kling-v3-omni', 'imageUrls'], ['kling-3.0-image', 'imageUrls'], ['kling-o1-image', 'imageUrls']] as const) {
  const d = fileDescriptor(id, key);
  assert.strictEqual(d.minAspectRatio, undefined, `${id}.${key}`);
  assert.strictEqual(d.maxBytes, undefined, `${id}.${key}`);
}

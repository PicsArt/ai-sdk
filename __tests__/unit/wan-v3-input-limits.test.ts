/**
 * Regression: the wan 3.0 file slots declare the limits the vendor prints, so
 * the app measures an attachment at upload instead of the vendor refusing it
 * after Generate (finding F95 on the ai-toolkit generation-failure board).
 *
 * Every number is the vendor's own rejection text, 2026-09-18 to 2026-10-18.
 */
import assert from 'node:assert';
import { ALL_MODELS } from '../../src/vendors/catalog/index.ts';
import { evaluateConstraints } from '../../src/core/constraints.ts';
import type { FileDescriptor } from '../../src/core/descriptors/types.ts';

const MIB = 1024 * 1024;
const WAN_V3_IDS = ['wan-3.0-video', 'wan-3.0-video-prime'] as const;

const findModel = (modelId: string) => {
  const model = ALL_MODELS.find((candidate) => candidate.id === modelId);
  assert.ok(model, `${modelId} must exist`);
  return model;
};

const fileDescriptor = (modelId: string, key: string): FileDescriptor => {
  const descriptor = findModel(modelId).paramConfig[key]?.descriptor;
  assert.ok(descriptor?.kind === 'file', `${modelId}.${key} must be a file slot`);
  return descriptor;
};

const pick = (descriptor: FileDescriptor, keys: readonly (keyof FileDescriptor)[]) =>
  Object.fromEntries(keys.map((key) => [key, descriptor[key]]));

for (const id of WAN_V3_IDS) {
  // Images: at least 240 px on each side, at most 20 MiB.
  for (const key of ['startFrame', 'endFrame', 'imageUrls']) {
    assert.deepStrictEqual(
      pick(fileDescriptor(id, key), ['minSidePixels', 'maxBytes']),
      { minSidePixels: 240, maxBytes: 20 * MIB },
      `${id}.${key}`,
    );
  }

  // Reference videos: 1-15 s each, at most 100 MiB.
  assert.deepStrictEqual(
    pick(fileDescriptor(id, 'videoUrls'), ['minDurationSec', 'maxDurationSec', 'maxBytes']),
    { minDurationSec: 1, maxDurationSec: 15, maxBytes: 100 * MIB },
    `${id}.videoUrls`,
  );

  // Reference audios: at most 15 s each, at most 15 MiB.
  assert.deepStrictEqual(
    pick(fileDescriptor(id, 'audioUrls'), ['maxDurationSec', 'maxBytes']),
    { maxDurationSec: 15, maxBytes: 15 * MIB },
    `${id}.audioUrls`,
  );

  const { constraints } = findModel(id);

  // Input video + output duration must stay within 30 s: a video drops the 30 s option.
  const withVideo = evaluateConstraints(constraints, { prompt: 'a', videoUrls: ['https://cdn/clip.mp4'] });
  assert.deepStrictEqual(withVideo.get('duration'), {
    kind: 'allowed',
    allowed: [-1, 5, 10, 15],
    reason: 'With a reference video, the output can be at most 15 s.',
  }, `${id} duration with a video`);
  assert.strictEqual(
    evaluateConstraints(constraints, { prompt: 'a' }).get('duration'),
    undefined,
    `${id} duration without a video`,
  );

  // An end frame needs a start frame.
  assert.strictEqual(
    evaluateConstraints(constraints, { prompt: 'a' }).get('endFrame')?.kind,
    'disabled',
    `${id} endFrame without a start frame`,
  );
  assert.strictEqual(
    evaluateConstraints(constraints, { prompt: 'a', startFrame: 'https://cdn/first.png' }).get('endFrame'),
    undefined,
    `${id} endFrame with a start frame`,
  );
}

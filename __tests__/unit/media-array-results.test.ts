/**
 * fal media arrays — some models return their files as `audio[]` / `video[]`
 * instead of a single `{ url }` object (Mirelo SFX 2.0 returns one file per
 * `num_samples`, 2 by default). These checks pin that every sample becomes a
 * result item and that a single-entry array still yields its URL, while the
 * established single-object shapes keep working.
 */
import assert from 'node:assert';
import { parseResult } from '../../src/client/prepare.ts';
import { extractAllResults, extractUrl } from '../../src/core/response.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import type { WorkflowStatusResult } from '../../src/core/workflow.ts';

const completed = (result: unknown): WorkflowStatusResult<unknown> => ({
  handle: { id: 'job-1' },
  status: 'COMPLETED',
  result,
  raw: result,
} as unknown as WorkflowStatusResult<unknown>);

const wav = (n: number) => ({ url: `https://cdn/sfx-${n}.wav`, content_type: 'audio/wav' });
const mp4 = (n: number) => ({ url: `https://cdn/sfx-${n}.mp4`, content_type: 'video/mp4' });

// ── Extractors: arrays and single objects ──────────────────────────
{
  assert.strictEqual(extractUrl({ audio: [wav(1)] }), 'https://cdn/sfx-1.wav');
  assert.strictEqual(extractUrl({ video: [mp4(1), mp4(2)] }), 'https://cdn/sfx-1.mp4');
  assert.strictEqual(extractUrl({ audio: [] }), undefined);

  // Single-object shapes are unchanged.
  assert.strictEqual(extractUrl({ audio: wav(1) }), 'https://cdn/sfx-1.wav');
  assert.strictEqual(extractUrl({ video: mp4(1) }), 'https://cdn/sfx-1.mp4');

  assert.deepStrictEqual(
    extractAllResults({ audio: [wav(1), wav(2)] })?.map((i) => i.url),
    ['https://cdn/sfx-1.wav', 'https://cdn/sfx-2.wav'],
  );
  assert.strictEqual(extractAllResults({ audio: wav(1) }), undefined);
}

// ── Mirelo SFX 2.0: every sample is a result item ──────────────────
{
  for (const id of ['mirelo-sfx-2.0-text-to-audio', 'mirelo-sfx-2.0-video-to-audio'] as const) {
    const result = parseResult(completed({ audio: [wav(1), wav(2)] }), resolveModel(id), undefined);
    assert.strictEqual(result.url, 'https://cdn/sfx-1.wav', `${id}: primary url`);
    assert.deepStrictEqual(result.items.map((i) => i.url), ['https://cdn/sfx-1.wav', 'https://cdn/sfx-2.wav'], `${id}: all samples`);
    assert.strictEqual(result.generationId, 'job-1');

    const single = parseResult(completed({ audio: [wav(1)] }), resolveModel(id), undefined);
    assert.deepStrictEqual(single.items.map((i) => i.url), ['https://cdn/sfx-1.wav'], `${id}: num_samples 1`);
  }

  const v2v = parseResult(
    completed({ video: [mp4(1), mp4(2), mp4(3)] }),
    resolveModel('mirelo-sfx-2.0-video-to-video'),
    undefined,
  );
  assert.deepStrictEqual(v2v.items.map((i) => i.url), [
    'https://cdn/sfx-1.mp4',
    'https://cdn/sfx-2.mp4',
    'https://cdn/sfx-3.mp4',
  ]);
}

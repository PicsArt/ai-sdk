/**
 * The Drive prompt cap, and the fact that it stays on the Drive side.
 *
 * A model's declared `maxLength` is what its vendor accepts, so the whole
 * prompt goes through for generation. Only the copy stored beside the result
 * is cut, to keep it inside Drive's 20k attribute budget.
 *
 * The cap lives where the payload is assembled rather than in validation,
 * because two paths never reach validation: models with no `prompt` param
 * (upscalers, speech-to-speech, dubbing) and direct callers of
 * `buildGenerationAttributes`.
 */
import assert from 'node:assert';
import { buildGenerationAttributes, parseGeneration } from '../../src/client/drive.ts';
import { getModel } from '../../src/core/model-registry.ts';
import { prepareRequest } from '../../src/client/prepare.ts';
import { MAX_DRIVE_PROMPT_LENGTH } from '../../src/core/limits.ts';

// ── 1. an ordinary payload is written untouched ────────────────────────
{
  const attrs = buildGenerationAttributes({
    modelId: 'flux-2-pro',
    params: { prompt: 'a cat on mars', aspectRatio: '1:1', imageUrls: ['https://cdn.example.com/a.png'] },
  });
  const payload = JSON.parse(attrs.aiSDKPayload) as Record<string, unknown>;
  assert.strictEqual(attrs.model, 'flux-2-pro');
  assert.strictEqual(payload.prompt, 'a cat on mars');
  assert.deepStrictEqual(payload.imageUrls, ['https://cdn.example.com/a.png']);
}

// ── 2. an over-long prompt is cut, whatever the caller passes ──────────
{
  const prompt = 'a'.repeat(MAX_DRIVE_PROMPT_LENGTH * 3);
  // 'topaz-upscale-image' declares no prompt param, so nothing upstream of
  // this call would have capped it.
  const attrs = buildGenerationAttributes({ modelId: 'topaz-upscale-image', params: { prompt } });

  const generation = parseGeneration({ uid: 'file-1', attributes: attrs });
  const stored = generation.aiSDKPayload?.prompt ?? '';
  assert.strictEqual(stored.length, MAX_DRIVE_PROMPT_LENGTH, 'stored prompt is cut to the Drive cap');
  assert.ok(prompt.startsWith(stored), 'the stored prompt is a prefix of the original');
  assert.strictEqual(generation.model, 'topaz-upscale-image', 'the record stays readable');
}

// ── 3. the cap does not leak into what the vendor receives ─────────────
{
  const prompt = 'a'.repeat(30_000);
  const { payload } = prepareRequest(getModel('flux-2-pro')!, { prompt });
  assert.strictEqual(
    (payload as { prompt: string }).prompt.length,
    30_000,
    'the vendor gets the whole prompt — the Drive cap is not a request-side limit',
  );

  const attrs = buildGenerationAttributes({ modelId: 'flux-2-pro', params: { prompt } });
  assert.strictEqual(
    (JSON.parse(attrs.aiSDKPayload) as { prompt: string }).prompt.length,
    MAX_DRIVE_PROMPT_LENGTH,
    'while the stored copy of that same prompt is cut',
  );
}

console.log('drive-attributes.test.ts: OK');

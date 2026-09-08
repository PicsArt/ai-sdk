/**
 * Regression: every model whose vendor publishes a prompt length limit declares
 * it as `prompt.maxLength`, so an over-long prompt is rejected client-side
 * instead of being submitted, billed, and then refused by the vendor (the
 * failure grok-prompt-limits.test.ts was written for).
 *
 * The expected figures come from the vendor's own API reference or schema, or
 * from the pluggable worker's `@MaxLength`; see the comment next to each cap in
 * the catalog file for the source. Models whose vendor publishes no hard limit
 * (including ones with only a words-or-characters recommendation, such as
 * Seedance and Seedream) are deliberately absent here and stay uncapped.
 */
import assert from 'node:assert';
import { Model } from '../../src/core/descriptors/model-accessor.ts';
import { ALL_MODELS } from '../../src/vendors/catalog/index.ts';

const EXPECTED: Record<string, number> = {
  // OpenAI Images API: 32,000 characters for the GPT image models.
  'gpt-image-1': 32_000,
  'gpt-image-1.5': 32_000,
  'gpt-image-2': 32_000,
  // fal `sora-2` schema.
  'sora-2': 5000,
  'sora-2-pro': 5000,
  'sora-2-extend': 5000,
  // fal `ltx-2` / `ltx-2.3` schemas.
  'ltx-pro-t2v': 5000,
  'ltx-v2-fast': 5000,
  'ltx-v2-retake': 5000,
  'ltx-v2.3-pro': 5000,
  'ltx-v2.3-fast': 5000,
  'ltx-2.3-a2v': 5000,
  'ltx-v2.3-extend': 5000,
  'ltx-v2.3-retake': 5000,
  // Luma errors reference: "maximum length is 5000 characters".
  'luma-ray-2': 5000,
  'luma-ray-flash-2': 5000,
  'luma-ray-2-reframe-video': 5000,
  'luma-ray-flash-2-reframe-video': 5000,
  'luma-ray-3.2': 5000,
  'luma-ray-3.2-edit': 5000,
  'luma-ray-3.2-reframe-video': 5000,
  'luma-uni-1': 5000,
  'luma-uni-1-max': 5000,
  // pa-alibaba worker @MaxLength.
  'wan-2.6-t2v': 5000,
  'wan-2.6-r2v': 5000,
  'wan-2.6-image': 1500,
  // H3 Max schemas — a far longer prompt than MiniMax's own H3 endpoint,
  // which caps at 7,000.
  'minimax-h3-max': 50_000,
  'minimax-h3-max-turbo': 50_000,
  // fal `xai/grok-imagine-image` schema.
  'grok-imagine-image': 8000,
  'grok-imagine-image-2.0': 8000,
  'grok-imagine-image-quality': 8000,
  // ElevenLabs sound-generation reference / fal `elevenlabs/music` schema.
  'elevenlabs-sfx': 450,
  'elevenlabs-music-v2': 4100,
  // fal `lyria3` schema.
  'lyria-3-clip': 5000,
  'lyria-3-pro': 5000,
  // BytePlus OmniHuman 1.5 API.
  'bytedance-omnihuman-v1.5': 300,
  // Gemini API model card: 1,024 text tokens, ~4 chars each.
  'veo-3.1': 4000,
  'veo-3.1-fast': 4000,
  'veo-3.1-lite': 4000,
};

// ── Every listed model declares the expected cap ───────────────────────
{
  const byId = new Map(ALL_MODELS.map((m) => [m.id, m]));
  const wrong: string[] = [];
  for (const [id, expected] of Object.entries(EXPECTED)) {
    const model = byId.get(id);
    if (!model) { wrong.push(`${id}: not in catalog`); continue; }
    const d = model.paramConfig.prompt?.descriptor;
    const actual = d?.kind === 'text' ? d.maxLength : undefined;
    if (actual !== expected) wrong.push(`${id}: expected ${expected}, got ${actual}`);
  }
  assert.deepStrictEqual(wrong, [], 'prompt maxLength drift against vendor limits');
}

// ── An over-long prompt is rejected before submit ──────────────────────
{
  const result = Model('luma-ray-2').validate({
    prompt: 'x'.repeat(5001),
    aspectRatio: '16:9',
    resolution: '720p',
    duration: 5,
  });
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors?.[0]?.includes('5000'), `unexpected error: ${result.errors?.[0]}`);
}

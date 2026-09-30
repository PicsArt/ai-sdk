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
 *
 * The binding limit is the serialized attribute (F17): escaping can push an
 * 18,000-character prompt past Drive's 20,000-character value cap on its own.
 */
import assert from 'node:assert';
import { buildGenerationAttributes, parseGeneration } from '../../src/client/drive.ts';
import { getModel } from '../../src/core/model-registry.ts';
import { prepareRequest } from '../../src/client/prepare.ts';
import { MAX_DRIVE_ATTRIBUTE_LENGTH, MAX_DRIVE_PROMPT_LENGTH } from '../../src/core/limits.ts';

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

// ── 4. escape-heavy prompts fit the attribute, not just the prompt cap ─
// F17's September returns: a pretty-printed JSON prompt (every quote doubles),
// a multi-line script, and a Chinese script ruled with `====` lines. Each was
// cut to 18,000 characters and still serialized past 20,000.
{
  const shot = JSON.stringify({ title: 'kage vs sekai', camera: 'low angle, push-in', action: 'burst' }, null, 2) + ',\n';
  const cases: Record<string, string> = {
    'JSON in the prompt': shot.repeat(1_000),
    'multi-line script': 'Shot 1: "wide", slow dolly\n\n'.repeat(2_000),
    'CJK script with rules': ('第1部分｜改编边界\n\n主情绪线：外部羞辱→家庭翻车\n' + '='.repeat(8) + '\n\n').repeat(800),
  };
  const params = {
    aspectRatio: '9:16',
    duration: 15,
    imageUrls: ['https://cdn.example.com/a.png', 'https://cdn.example.com/b.png'],
    videoUrl: 'https://cdn.example.com/source.mp4',
  };
  for (const [name, prompt] of Object.entries(cases)) {
    assert.ok(
      JSON.stringify({ prompt: prompt.slice(0, MAX_DRIVE_PROMPT_LENGTH) }).length > MAX_DRIVE_ATTRIBUTE_LENGTH,
      `${name}: the fixture must overflow under the old prompt-only cap`,
    );
    const attrs = buildGenerationAttributes({ modelId: 'seedance-2.5', params: { prompt, ...params } });
    assert.ok(attrs.aiSDKPayload.length <= MAX_DRIVE_ATTRIBUTE_LENGTH, `${name}: the attribute fits the Drive cap`);
    const stored = parseGeneration({ uid: 'file-1', attributes: attrs }).aiSDKPayload!;
    assert.ok(prompt.startsWith(stored.prompt), `${name}: the stored prompt is a prefix of the original`);
    assert.ok(stored.prompt.length > 10_000, `${name}: the cut takes only what the cap needs`);
    for (const [key, value] of Object.entries(params)) {
      assert.deepStrictEqual(stored[key], value, `${name}: ${key} survives the cut`);
    }
  }
}

// ── 5. the cut never splits a surrogate pair ──────────────────────────
// A lone surrogate serializes as a six-character `\udXXX` escape, so a
// split emoji both corrupts the prompt and grows the value it was cutting.
{
  const prompt = 'a'.repeat(MAX_DRIVE_PROMPT_LENGTH - 1) + '🎬'.repeat(100);
  const attrs = buildGenerationAttributes({ modelId: 'flux-2-pro', params: { prompt } });
  assert.ok(!/\\ud[89ab]/i.test(attrs.aiSDKPayload), 'no lone high surrogate is written');
  const stored = parseGeneration({ uid: 'file-1', attributes: attrs }).aiSDKPayload!.prompt;
  assert.strictEqual(stored, 'a'.repeat(MAX_DRIVE_PROMPT_LENGTH - 1), 'the emoji that straddles the cap is dropped whole');
}

console.log('drive-attributes.test.ts: OK');

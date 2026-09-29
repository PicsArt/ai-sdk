/**
 * Eleven v4 — what each entry puts on the wire and which knobs it offers.
 *
 * The v4 engines take only stability and similarity (`GET /v1/models` reports
 * `can_use_style: false`, `can_use_speaker_boost: false`; the worker drops the
 * rest before the vendor sees them). These checks pin the SDK neither offering
 * the dead knobs on v4 nor losing them on the engines that honour them, and
 * the dialogue builder sending the vendor's `similarity` (not
 * `similarity_boost`) for both dialogue engines.
 */
import assert from 'node:assert';
import { prepareRequest } from '../../src/client/prepare.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import {
  ElevenDialogueV4,
  ElevenMultilingualV2,
  ElevenTextToDialogue,
  ElevenV3,
  ElevenV4,
  ElevenV4Turbo,
} from '../../src/generated/model-constants.ts';

const payload = (id: string, ctx: Record<string, unknown>) =>
  prepareRequest(resolveModel(id), ctx).payload;

/** The text cap a model declares — on its prompt, or on a dialogue line. */
const promptCap = (id: string) =>
  (resolveModel(id).paramConfig.prompt.descriptor as { maxLength?: number }).maxLength;
const dialogueLineCap = (id: string) =>
  (resolveModel(id).paramConfig.dialogue.descriptor as unknown as { fields: { text: { maxLength?: number } } }).fields.text.maxLength;

const VOICE = '21m00Tcm4TlvDq8ikWAM';
const STYLE_KNOBS = ['styleExaggeration', 'speed', 'useSpeakerBoost'];

// ── TTS: the v4 engines carry their own model id ──────────────────
{
  assert.deepStrictEqual(payload(ElevenV4, { prompt: '[whispering] Hello.', voiceId: VOICE }), {
    text: '[whispering] Hello.', voice_id: VOICE, model_id: 'eleven_v4',
  }, 'audio tags are plain text to the wire');

  assert.strictEqual(payload(ElevenV4Turbo, { prompt: 'Hi' }).model_id, 'eleven_v4_turbo');
  assert.strictEqual(payload(ElevenV3, { prompt: 'Hi' }).model_id, 'eleven_v3', 'v3 unchanged');

  assert.deepStrictEqual(
    payload(ElevenV4, { prompt: 'Hola.', language: 'es', stability: 0, similarityBoost: 0.9, withTimestamps: true }),
    {
      text: 'Hola.', voice_id: payload(ElevenV4, { prompt: 'x' }).voice_id, model_id: 'eleven_v4',
      language_code: 'es', with_timestamps: true,
      voice_settings: { stability: 0, similarity_boost: 0.9 },
    },
    'zero stability is a real value and travels',
  );
}

// ── TTS: knobs per engine ──────────────────────────────────────────
for (const id of [ElevenV4, ElevenV4Turbo]) {
  const keys = Object.keys(resolveModel(id).paramConfig);
  for (const knob of STYLE_KNOBS) {
    assert.ok(!keys.includes(knob), `${id}: v4 ignores ${knob}, so it is not offered`);
  }
  for (const knob of ['stability', 'similarityBoost', 'language', 'withTimestamps', 'voiceId']) {
    assert.ok(keys.includes(knob), `${id} offers ${knob}`);
  }
  assert.strictEqual(promptCap(id), 10000, `${id}: 10k cap`);
}
for (const id of [ElevenV3, ElevenMultilingualV2]) {
  const keys = Object.keys(resolveModel(id).paramConfig);
  for (const knob of STYLE_KNOBS) {
    assert.ok(keys.includes(knob), `${id} keeps ${knob}`);
  }
}

// ── Dialogue: v3 and v4 share the wire shape, differ in engine ─────
{
  const lines = [
    { voiceId: VOICE, text: '[cheerfully] Hello there.' },
    { voiceId: 'EkK5I93UQWFDigLMpZcX', text: '[tired] Long day.' },
  ];
  const conversation = lines.map((l) => ({ voice_id: l.voiceId, text: l.text }));

  assert.deepStrictEqual(payload(ElevenDialogueV4, { dialogue: lines }), {
    conversation, model_id: 'eleven_v4',
  }, 'nothing set, no settings object');

  assert.deepStrictEqual(
    payload(ElevenDialogueV4, { dialogue: lines, stability: 0.3, similarity: 0.8, language: 'en', seed: 7 }),
    { conversation, model_id: 'eleven_v4', settings: { stability: 0.3, similarity: 0.8 }, language_code: 'en', seed: 7 },
  );
  assert.deepStrictEqual(
    payload(ElevenDialogueV4, { dialogue: lines, similarity: 0 }).settings,
    { similarity: 0 },
    'similarity alone, and zero is a real value',
  );

  assert.deepStrictEqual(payload(ElevenTextToDialogue, { dialogue: lines, stability: 0 }), {
    conversation, model_id: 'eleven_v3', settings: { stability: 0 },
  }, 'the v3 dialogue keeps its engine and presets');
  assert.ok(
    !Object.keys(resolveModel(ElevenTextToDialogue).paramConfig).includes('similarity'),
    'v3 dialogue offers no similarity knob',
  );

  const v4Cfg = resolveModel(ElevenDialogueV4).paramConfig;
  assert.strictEqual(v4Cfg.stability.descriptor.kind, 'range', 'v4 reads the whole 0-1 range, not presets');
  assert.strictEqual(dialogueLineCap(ElevenDialogueV4), 10000, 'v4 dialogue: 10k cap');
  assert.strictEqual(dialogueLineCap(ElevenTextToDialogue), 5000, 'v3 dialogue: 5k cap');
}

// ── The cap is on the whole dialogue, not the line ─────────────────
// Lines that each pass the per-line maxLength can add up past the engine's
// request cap; the vendor would refuse that after billing, so the builder
// refuses it first.
{
  const line = (n: number) => ({ voiceId: VOICE, text: 'a'.repeat(n) });

  assert.throws(
    () => payload(ElevenTextToDialogue, { dialogue: [line(3000), line(3000)] }),
    /eleven-text-to-dialogue: the dialogue as a whole exceeds 5000 characters \(got 6000\)/,
    'v3: two lines under 5k that total 6k',
  );
  assert.ok(payload(ElevenDialogueV4, { dialogue: [line(3000), line(3000)] }), 'v4: the same 6k fits its 10k');
  assert.throws(
    () => payload(ElevenDialogueV4, { dialogue: [line(4000), line(4000), line(2001)] }),
    /exceeds 10000 characters \(got 10001\)/,
  );
  assert.ok(payload(ElevenDialogueV4, { dialogue: [line(5000), line(5000)] }), 'exactly the cap is allowed');
}

// ── Both dialogue engines bill under the one pricing key ───────────
for (const id of [ElevenDialogueV4, ElevenTextToDialogue]) {
  assert.strictEqual(resolveModel(id).modelId, 'eleven-text-to-dialogue', `${id}: shared pricing key`);
  assert.strictEqual(resolveModel(id).workflow, 'elevenlabs/v1/text-to-dialogue');
}

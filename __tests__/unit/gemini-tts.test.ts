/**
 * Gemini TTS (gemini/v1/audios) — what each entry puts on the wire.
 *
 * 2.5 and 3.8 take direction differently (see the worker's
 * `buildSpeechParts`): 3.8 reads `style` from `speechMetadata` and speaks a
 * direction written into the text, while 2.5 ignores `speechMetadata`. These
 * checks pin the SDK sending each generation the shape it understands.
 */
import assert from 'node:assert';
import { prepareRequest } from '../../src/client/prepare.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import {
  Gemini25FlashTts,
  Gemini25ProTts,
  Gemini38FlashLiteTts,
  Gemini38FlashTts,
} from '../../src/generated/model-constants.ts';

const payload = (id: string, ctx: Record<string, unknown>) =>
  prepareRequest(resolveModel(id), ctx).payload;

// ── 2.5: language/accent resolved into a "Say …:" text prefix ─────
{
  assert.deepStrictEqual(payload(Gemini25FlashTts, { prompt: 'Hello.' }), {
    text: 'Hello.', model: 'gemini-2.5-flash-tts', voiceName: 'Kore',
  }, 'nothing set, the text goes as typed');

  assert.deepStrictEqual(
    payload(Gemini25ProTts, { prompt: 'Hola.', language: 'Spanish', accent: 'Mexican', voiceId: 'Puck' }),
    { text: 'Say in Spanish with a Mexican accent: Hola.', model: 'gemini-2.5-pro-tts', voiceName: 'Puck' },
  );
  assert.strictEqual(payload(Gemini25FlashTts, { prompt: 'Hi', accent: 'Scottish' }).text, 'Say with a Scottish accent: Hi');
  assert.strictEqual(payload(Gemini25FlashTts, { prompt: 'Hi', language: '  ' }).text, 'Hi', 'blank is unset');

  for (const id of [Gemini25FlashTts, Gemini25ProTts]) {
    const keys = Object.keys(resolveModel(id).paramConfig);
    assert.ok(!keys.includes('style'), `${id}: 2.5 ignores speechMetadata, so no style`);
  }
}

// ── 3.8 single voice: style, with language/accent folded in ────────
{
  assert.deepStrictEqual(payload(Gemini38FlashTts, { prompt: 'Hello.', voiceId: 'Puck' }), {
    text: 'Hello.', model: 'gemini-3.8-flash-tts', voiceName: 'Puck',
  }, 'no style set, none sent');

  assert.deepStrictEqual(
    payload(Gemini38FlashTts, { prompt: 'Hola.', style: 'a whisper', language: 'Spanish', accent: 'Mexican' }),
    {
      text: 'Hola.', model: 'gemini-3.8-flash-tts', voiceName: 'Kore',
      style: 'a whisper; speak in Spanish with a Mexican accent',
    },
  );
  assert.strictEqual(payload(Gemini38FlashTts, { prompt: 'Hi', accent: 'Scottish' }).style, 'speak with a Scottish accent');

  assert.throws(
    () => payload(Gemini38FlashTts, { prompt: 'Hi', style: 'x'.repeat(490), language: 'French' }),
    /exceeds 500/,
  );
}

// ── Every entry takes prompt or parts; prompt alone is not required ─
for (const id of [Gemini25FlashTts, Gemini25ProTts, Gemini38FlashTts, Gemini38FlashLiteTts]) {
  const cfg = resolveModel(id).paramConfig;
  assert.strictEqual(cfg.prompt.required, false, `${id}: parts can stand in for prompt`);
  assert.ok(cfg.parts && cfg.multiSpeakerVoiceConfigs, `${id} takes parts and speaker configs`);
  assert.ok(resolveModel(id).features.some((f) => f.label === 'Multi-Speaker'), `${id} advertises multi-speaker`);
  assert.throws(() => payload(id, {}), /provide a prompt or parts/);
  assert.throws(() => payload(id, { prompt: '   ' }), /provide a prompt or parts/);
}

const SPEAKERS = [
  { speaker: 'Narrator', voiceName: 'Enceladus' },
  { speaker: 'Mira', voiceName: 'Leda' },
];
const SCRIPT = [
  { text: 'The storm knocked the power out.', speaker: 'Narrator', style: 'calm narration' },
  { text: '<sigh> Grandpa?', speaker: 'Mira' },
];

// ── 3.8: parts and speaker configs go through as the worker takes them ─
{
  assert.deepStrictEqual(
    payload(Gemini38FlashTts, {
      style: 'late night', language: 'English', parts: SCRIPT, multiSpeakerVoiceConfigs: SPEAKERS,
    }),
    {
      parts: [
        { text: 'The storm knocked the power out.', speaker: 'Narrator', style: 'late night; calm narration; speak in English' },
        { text: '<sigh> Grandpa?', speaker: 'Mira', style: 'late night; speak in English' },
      ],
      model: 'gemini-3.8-flash-tts',
      multiSpeakerVoiceConfigs: SPEAKERS,
    },
    'request-level style reaches every part: with parts the worker ignores the top-level one',
  );

  assert.deepStrictEqual(
    payload(Gemini38FlashTts, { prompt: 'ignored', voiceId: 'Puck', parts: [{ text: 'A', style: 'shouting' }, { text: 'B' }] }),
    { parts: [{ text: 'A', style: 'shouting' }, { text: 'B' }], model: 'gemini-3.8-flash-tts', voiceName: 'Puck' },
    'single-voice parts: a directed script, no speakers',
  );

  assert.deepStrictEqual(
    payload(Gemini38FlashTts, { prompt: 'Narrator: Hi.\nMira: Hello.', multiSpeakerVoiceConfigs: SPEAKERS }),
    { text: 'Narrator: Hi.\nMira: Hello.', model: 'gemini-3.8-flash-tts', multiSpeakerVoiceConfigs: SPEAKERS },
    'speaker configs with a labelled prompt pass through; configs replace the single voice',
  );
}

// ── 2.5: parts written into one labelled text ──────────────────────
{
  assert.deepStrictEqual(
    payload(Gemini25ProTts, { language: 'English', parts: SCRIPT.map(({ style, ...p }) => p), multiSpeakerVoiceConfigs: SPEAKERS }),
    {
      text: 'Say in English: Narrator: The storm knocked the power out.\nMira: <sigh> Grandpa?',
      model: 'gemini-2.5-pro-tts',
      multiSpeakerVoiceConfigs: SPEAKERS,
    },
  );
  assert.deepStrictEqual(
    payload(Gemini25FlashTts, { parts: [{ text: 'A' }, { text: 'B' }] }),
    { text: 'A\nB', model: 'gemini-2.5-flash-tts', voiceName: 'Kore' },
    'no speakers, no labels',
  );
}

// ── The worker's rules, enforced before any spend ──────────────────
for (const id of [Gemini25ProTts, Gemini38FlashTts]) {
  assert.throws(
    () => payload(id, { parts: [{ text: 'Hi', speaker: 'Narrator' }, { text: 'Hello' }], multiSpeakerVoiceConfigs: SPEAKERS }),
    /part 2 needs a speaker from multiSpeakerVoiceConfigs/,
  );
  assert.throws(
    () => payload(id, { parts: [{ text: 'Hi', speaker: 'Someone' }], multiSpeakerVoiceConfigs: SPEAKERS }),
    /part 1 needs a speaker/,
  );
  assert.throws(() => payload(id, { parts: [{ text: 'Hi', speaker: 'Narrator' }] }), /no multiSpeakerVoiceConfigs are set/);
  assert.throws(() => payload(id, { parts: [{ text: ' ' }] }), /part 1 has no text/);
  assert.throws(() => payload(id, { parts: [{}] }), /part 1 has no text/);
  assert.throws(
    () => payload(id, { prompt: 'Hi', multiSpeakerVoiceConfigs: [SPEAKERS[0], { ...SPEAKERS[1], speaker: 'Narrator' }] }),
    /same speaker twice/,
  );
  assert.throws(() => payload(id, { prompt: 'Hi', multiSpeakerVoiceConfigs: [{ speaker: 'A' }] }), /config 1 has no voiceName/);
  assert.throws(
    () => payload(id, { parts: [{ text: 'a'.repeat(3500) }, { text: 'b'.repeat(3500) }] }),
    /totals 7001 characters; the limit is 6000/,
    'each part is within its own cap; together they are not',
  );
}
// 2.5 counts the labels too: they are part of the one text it sends.
const labelled = [{ text: 'a'.repeat(2995), speaker: 'Narrator' }, { text: 'b'.repeat(2995), speaker: 'Mira' }];
assert.ok(payload(Gemini38FlashTts, { parts: labelled, multiSpeakerVoiceConfigs: SPEAKERS }), '5,991 spoken characters fit on 3.8');
assert.throws(() => payload(Gemini25ProTts, { parts: labelled, multiSpeakerVoiceConfigs: SPEAKERS }), /totals 6007/);

console.log('gemini-tts: ok');

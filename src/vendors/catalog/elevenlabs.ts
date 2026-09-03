/**
 * ElevenLabs — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { DEFAULT_VOICE_ID } from '../../core/voices.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

// ── Payload builders ────────────────────────────────────────────────

// `model_id` is baked into each builder at definition time (same pattern as
// flux/veo/seedream). It is NOT read off the generation context — `ctx.modelId`
// is never populated at runtime, so reading it silently dropped the field and
// made the worker fall back to its own default model (and default pricing).

/** TTS — voice_id + text + model_id (v1 Swagger schema). */
const buildElevenLabsTTSPayload =
  (modelId: string): PayloadBuilder =>
  (ctx) => ({
    text: ctx.prompt,
    voice_id: ctx.voiceId ?? DEFAULT_VOICE_ID,
    model_id: modelId,
    ...(ctx.language ? { language_code: ctx.language } : {}),
  });

/** Sound Effects — text + duration_seconds + model_id. */
const buildElevenLabsSFXPayload =
  (modelId: string): PayloadBuilder =>
  (ctx) => ({
    text: ctx.prompt,
    duration_seconds: ctx.duration ?? 5,
    model_id: modelId,
  });

/** Speech-to-Speech — audio_url + voice_id (v1 Swagger schema). */
const buildElevenLabsSTSPayload =
  (modelId: string): PayloadBuilder =>
  (ctx) => ({
    audio_url: ctx.audioUrl,
    voice_id: ctx.voiceId ?? DEFAULT_VOICE_ID,
    model_id: modelId,
    remove_background_noise: ctx.removeBackgroundNoise ?? false,
  });

/** Audio Isolation — audio_url only. */
const buildElevenLabsAudioIsolationPayload: PayloadBuilder = (ctx) => ({
  audio_url: ctx.audioUrl,
});

/** Dubbing — audio_url + source/target language. */
const buildElevenLabsDubbingPayload: PayloadBuilder = (ctx) => ({
  audio_url: ctx.audioUrl,
  source_lang: 'auto',
  target_lang: ctx.language,
});

/** Voice Remix — voice_id + description as prompt. The vendor requires one of
 *  text / auto_generate_text (400 without), and remixes ONLY voices from the
 *  caller's own workspace — premade/catalog voices are rejected, so there is
 *  deliberately no default voice here. */
const buildElevenLabsVoiceRemixPayload: PayloadBuilder = (ctx) => ({
  voice_id: ctx.voiceId,
  voice_description: ctx.prompt,
  auto_generate_text: true,
});

/** Voice Design — voice_description + model_id. */
const buildElevenLabsVoiceDesignPayload =
  (modelId: string): PayloadBuilder =>
  (ctx) => ({
    voice_description: ctx.prompt,
    auto_generate_text: true,
    model_id: modelId,
  });

/** Voice Create Previews — same shape minus model_id (not in the worker command). */
const buildElevenLabsVoicePreviewsPayload: PayloadBuilder = (ctx) => ({
  voice_description: ctx.prompt,
  auto_generate_text: true,
});

// Music payload builder lives in elevenlabs.payloads.ts (typed, ModelInput-backed).

// ── Model definitions ───────────────────────────────────────────────

/**
 * TTS param config. The prompt cap is per-model — ElevenLabs publishes a
 * different per-request character limit per voice engine
 * (https://elevenlabs.io/docs/overview/models):
 *   eleven_v3              → 5,000  (official docs; 3k confirmed generating live)
 *   eleven_multilingual_v2 → 10,000 (official docs + 10k generated live, 105s)
 * Verified against the live `elevenlabs/v1/text-to-speech` worker via
 * scripts/api-tests/audio-charlimit-boundary-probe.mjs.
 * ~1 char ≈ 70ms of speech, so the higher cap is what unlocks long-form narration.
 */
const ttsParamConfig = (promptMaxLength: number, withLanguage: boolean) => ({
  // language_code is honoured by eleven_v3 only — the vendor documents it as
  // "not supported for multilingual_v2 models" (silently ignored there).
  // No accent param anywhere: no builder ever read it.
  ...(withLanguage ? params.language(false) : {}),
  ...params.prompt({ maxLength: promptMaxLength }),
  ...params.voiceId([], DEFAULT_VOICE_ID, { catalog: { workflow: 'elevenlabs/v1/catalog/voices' } }),
});

export const { MODELS } = defineModels('elevenlabs', [
  // ── TTS ───────────────────────────────────────────────────────────
  {
    id: 'eleven-v3', name: 'Eleven v3', modelId: 'eleven_v3',
    addedAt: '2026-02-06',
    workflow: 'elevenlabs/v1/text-to-speech',
    buildPayload: buildElevenLabsTTSPayload('eleven_v3'),
    estimatedTime: 11,
    mode: 'audio', inputType: 'tts',
    badge: ['popular'] as const,
    description: 'Latest voice engine with expanded tone and pacing control.',
    features: [feat('Experimental', 'characteristic'), feat('Creative Control', 'characteristic')],
    paramConfig: ttsParamConfig(5000, true),
  },
  {
    id: 'eleven-multilingual-v2', name: 'Eleven Multilingual v2', modelId: 'eleven_multilingual_v2',
    addedAt: '2026-02-06',
    workflow: 'elevenlabs/v1/text-to-speech',
    buildPayload: buildElevenLabsTTSPayload('eleven_multilingual_v2'),
    estimatedTime: 9,
    mode: 'audio', inputType: 'tts',
    badge: ['popular', 'fast'] as const,
    description: 'Stable multilingual speech across 29+ languages with natural rhythm.',
    features: [feat('Stable', 'characteristic'), feat('Professional', 'characteristic')],
    paramConfig: ttsParamConfig(10000, false),
  },
  // ── Sound Effects ─────────────────────────────────────────────────
  {
    id: 'elevenlabs-sfx', name: 'ElevenLabs SFX v2', modelId: 'eleven_text_to_sound_v2',
    addedAt: '2026-02-06',
    workflow: 'elevenlabs/v1/sound-generation',
    buildPayload: buildElevenLabsSFXPayload('eleven_text_to_sound_v2'),
    estimatedTime: 6,
    mode: 'audio', inputType: 'sfx',
    badge: ['popular'] as const,
    description: 'Create custom sound effects from a text description — up to 30 seconds.',
    features: [feat('Sound Effects', 'characteristic')],
    paramConfig: { ...params.prompt(), ...params.durationRange(0.5, 30, 5, 0.5) },
  },
  // ── Music ─────────────────────────────────────────────────────────
  {
    id: 'elevenlabs-music-v2', name: 'ElevenLabs Music v2', modelId: 'music_v2',
    addedAt: '2026-07-02',
    workflow: 'elevenlabs/v1/music-generation',
    estimatedTime: 30,
    mode: 'audio', inputType: 'music',
    description: 'Generate music with vocals or instrumental from a text prompt.',
    features: [feat('Vocal & Instrumental', 'characteristic')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration([10, 20, 30, 60, 120, 180, 300, 600], 30),
      ...p.boolean('isInstrumental', false, 'Instrumental Only'),
    },
  },
  // ── Speech-to-Speech ──────────────────────────────────────────────
  {
    id: 'eleven-sts-v2', name: 'Eleven STS v2', modelId: 'eleven_english_sts_v2',
    addedAt: '2026-02-15',
    workflow: 'elevenlabs/v1/speech-to-speech',
    buildPayload: buildElevenLabsSTSPayload('eleven_english_sts_v2'),
    estimatedTime: 15,
    mode: 'audio', inputType: 'sts',
    description: 'Swap your voice to a different speaker while keeping timing and emotion.',
    features: [feat('Voice Changer', 'characteristic'), feat('Emotion Preserved', 'characteristic')],
    paramConfig: {
      ...params.audioInput('Speech Audio', true),
      ...params.voiceId([], DEFAULT_VOICE_ID, { catalog: { workflow: 'elevenlabs/v1/catalog/voices' } }),
      ...p.boolean('removeBackgroundNoise', false, 'Remove Background Noise'),
    },
  },
  {
    id: 'eleven-multilingual-sts-v2', name: 'Eleven Multilingual STS v2', modelId: 'eleven_multilingual_sts_v2',
    addedAt: '2026-02-15',
    workflow: 'elevenlabs/v1/speech-to-speech',
    buildPayload: buildElevenLabsSTSPayload('eleven_multilingual_sts_v2'),
    estimatedTime: 15,
    mode: 'audio', inputType: 'sts',
    description: 'Voice swap across 29 languages — preserves emotion and cadence.',
    features: [feat('Voice Changer', 'characteristic'), feat('Multilingual', 'characteristic'), feat('29 Languages', 'characteristic')],
    paramConfig: {
      ...params.audioInput('Speech Audio', true),
      ...params.voiceId([], DEFAULT_VOICE_ID, { catalog: { workflow: 'elevenlabs/v1/catalog/voices' } }),
      ...p.boolean('removeBackgroundNoise', false, 'Remove Background Noise'),
    },
  },
  // ── Audio Processing ────────────────────────────────────────────
  {
    id: 'eleven-audio-isolation', name: 'Eleven Audio Isolation',
    addedAt: '2026-03-24',
    workflow: 'elevenlabs/v1/audio-isolation',
    buildPayload: buildElevenLabsAudioIsolationPayload,
    estimatedTime: 20,
    mode: 'audio', inputType: 'sts',
    description: 'Isolate vocals and remove background noise from an audio file.',
    features: [feat('Noise Removal', 'characteristic'), feat('Vocal Isolation', 'characteristic')],
    paramConfig: { ...params.audioInput('Audio File', true) },
  },
  {
    id: 'eleven-dubbing', name: 'Eleven Dubbing',
    addedAt: '2026-03-24',
    workflow: 'elevenlabs/v1/dubbing',
    buildPayload: buildElevenLabsDubbingPayload,
    estimatedTime: 60,
    mode: 'audio', inputType: 'sts',
    description: 'Dub audio or video across languages with automatic voice matching.',
    features: [feat('Multilingual', 'characteristic'), feat('Dubbing', 'characteristic')],
    paramConfig: {
      ...params.audioInput('Source Audio', true),
      // target_lang is the vendor's only required field (ISO 639-1/639-3 code).
      language: {
        label: 'Target Language (ISO 639 code)',
        required: true,
        descriptor: { kind: 'text', placeholder: 'e.g. es, fr, de' },
      },
    },
  },
  // ── Voice Design ────────────────────────────────────────────────
  {
    id: 'eleven-voice-remix', name: 'Eleven Voice Remix',
    addedAt: '2026-03-24',
    workflow: 'elevenlabs/v1/voice-remix',
    buildPayload: buildElevenLabsVoiceRemixPayload,
    estimatedTime: 15,
    mode: 'audio', inputType: 'tts', disabled: true,
    description: 'Remix voice characteristics by describing the desired vocal style.',
    features: [feat('Voice Design', 'characteristic'), feat('Remix', 'characteristic')],
    paramConfig: {
      // Vendor: "Only your own custom voices can be remixed" — the premade
      // voices catalog cannot serve this model, so voiceId is a plain id input.
      voiceId: {
        label: 'Voice ID (a custom voice from your workspace)',
        required: true,
        descriptor: { kind: 'text', placeholder: 'Premade/catalog voices are rejected by ElevenLabs' },
      },
      ...params.prompt({ minLength: 5, maxLength: 1000 }),
    },
  },
  {
    id: 'eleven-voice-design-v3', name: 'Eleven Voice Design v3',
    addedAt: '2026-03-24',
    modelId: 'eleven_ttv_v3',
    workflow: 'elevenlabs/v1/voice-design',
    buildPayload: buildElevenLabsVoiceDesignPayload('eleven_ttv_v3'),
    estimatedTime: 15,
    mode: 'audio', inputType: 'tts',
    description: 'Design a new voice from a text description using v3 engine.',
    features: [feat('Voice Design', 'characteristic'), feat('Preview', 'characteristic')],
    paramConfig: { ...params.prompt({ minLength: 20, maxLength: 1000 }) },
  },
  {
    id: 'eleven-voice-design-v2', name: 'Eleven Voice Design Multilingual v2',
    addedAt: '2026-03-24',
    modelId: 'eleven_multilingual_ttv_v2',
    workflow: 'elevenlabs/v1/voice-design',
    buildPayload: buildElevenLabsVoiceDesignPayload('eleven_multilingual_ttv_v2'),
    estimatedTime: 15,
    mode: 'audio', inputType: 'tts',
    description: 'Design a new voice from a text description with multilingual support.',
    features: [feat('Voice Design', 'characteristic'), feat('Multilingual', 'characteristic'), feat('Preview', 'characteristic')],
    paramConfig: { ...params.prompt({ minLength: 20, maxLength: 1000 }) },
  },
  {
    id: 'eleven-voice-create', name: 'Eleven Voice Previews',
    addedAt: '2026-03-24',
    workflow: 'elevenlabs/v1/voice-create-previews',
    buildPayload: buildElevenLabsVoicePreviewsPayload,
    estimatedTime: 15,
    mode: 'audio', inputType: 'tts',
    description: 'Generate voice previews from a description to audition before committing.',
    features: [feat('Voice Design', 'characteristic'), feat('Preview', 'characteristic')],
    paramConfig: { ...params.prompt({ minLength: 20, maxLength: 1000 }) },
  },
]);

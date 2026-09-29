/**
 * ElevenLabs — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import type { CatalogSource } from '../../core/catalogs.ts';
import type { ModelParams } from '../../core/descriptors/types.ts';
import { DEFAULT_VOICE_ID } from '../../core/voices.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

/** The catalog task serving every voice picker in this file. */
const VOICE_CATALOG: CatalogSource = { workflow: 'elevenlabs/v1/catalog/voices' };

// ── Payload builders ────────────────────────────────────────────────

// `model_id` is baked into each builder at definition time (same pattern as
// flux/veo/seedream). It is NOT read off the generation context — `ctx.modelId`
// is never populated at runtime, so reading it silently dropped the field and
// made the worker fall back to its own default model (and default pricing).

/** Sound Effects — text + duration_seconds + model_id. */
const buildElevenLabsSFXPayload =
  (modelId: string): PayloadBuilder =>
  (ctx) => ({
    text: ctx.prompt,
    duration_seconds: ctx.duration ?? 5,
    model_id: modelId,
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

// The TTS, STS, dialogue and music payload builders live in
// elevenlabs.payloads.ts (typed, ModelInput-backed) — they read voice
// settings and dialogue turns, which GenerationContext does not carry.

// ── Model definitions ───────────────────────────────────────────────

/**
 * The `voice_settings` the text-to-speech and speech-to-speech commands accept.
 * Every field is default-less on purpose: unset means "use the settings the
 * voice was saved with", which is what the vendor does. Shipping defaults here
 * would silently override every voice's own tuning.
 *
 * `use_speaker_boost` is text-to-speech only — the speech-to-speech command
 * does not declare it.
 */
const stabilityAndSimilarityParams: ModelParams = {
  stability: {
    label: 'Stability',
    descriptor: { kind: 'range', min: 0, max: 1, step: 0.05 },
  },
  similarityBoost: {
    label: 'Similarity',
    descriptor: { kind: 'range', min: 0, max: 1, step: 0.05 },
  },
};

const voiceSettingsParams = (withSpeakerBoost: boolean): ModelParams => ({
  ...stabilityAndSimilarityParams,
  // `style` is taken on GenerationContext by the image models' style *name*,
  // so the vendor's 0–1 style exaggeration gets a key of its own.
  styleExaggeration: {
    label: 'Style Exaggeration',
    descriptor: { kind: 'range', min: 0, max: 1, step: 0.05 },
  },
  speed: {
    label: 'Speed',
    descriptor: { kind: 'range', min: 0.1, max: 5, step: 0.05 },
  },
  ...(withSpeakerBoost
    ? { useSpeakerBoost: { label: 'Speaker Boost', descriptor: { kind: 'boolean' as const, default: true } } }
    : {}),
});

/**
 * TTS param config. The prompt cap is per-model — ElevenLabs publishes a
 * different per-request character limit per voice engine
 * (https://elevenlabs.io/docs/overview/models):
 *   eleven_v3              → 5,000  (official docs; 3k confirmed generating live)
 *   eleven_multilingual_v2 → 10,000 (official docs + 10k generated live, 105s)
 *   eleven_v4 / v4_turbo   → 10,000 (GET /v1/models; 10k generated live on v4, 186s)
 * Verified against the live `elevenlabs/v1/text-to-speech` worker via
 * scripts/api-tests/audio-charlimit-boundary-probe.mjs.
 * ~1 char ≈ 70ms of speech, so the higher cap is what unlocks long-form narration.
 *
 * `styleControls: false` is the v4 shape: those engines take only stability and
 * similarity (the vendor reports `can_use_style: false` for them and ignores
 * `style`, `speed`, `use_speaker_boost`); delivery is directed with audio tags
 * in the text instead — `[whispering]`, `[laughing]`, `[annoyed]`, ...
 */
const ttsParamConfig = (
  promptMaxLength: number,
  opts: { language: boolean; styleControls: boolean },
) => ({
  // language_code is honoured by eleven_v3 and v4 — the vendor documents it as
  // "not supported for multilingual_v2 models" (silently ignored there).
  // No accent param anywhere: no builder ever read it.
  ...(opts.language ? params.language(false) : {}),
  ...params.prompt({ maxLength: promptMaxLength }),
  ...params.voiceId([], DEFAULT_VOICE_ID, { catalog: VOICE_CATALOG }),
  ...(opts.styleControls ? voiceSettingsParams(true) : stabilityAndSimilarityParams),
  // Timings come back beside the audio, for captions and lip sync. Off by
  // default: the vendor answers a different route that inlines the audio as
  // base64, and callers who do not need timings should not pay the decode.
  ...p.boolean('withTimestamps', false, 'Character Timings'),
});

/**
 * Dialogue lines — one entry per spoken line, in order. The vendor publishes
 * no cap on the number of lines, so none is invented here.
 *
 * `maxLength` is the engine's per-request cap, which applies to the dialogue
 * AS A WHOLE — something a per-field maxLength cannot express, but a single
 * line cannot exceed it either. Probed against the live
 * `elevenlabs/v1/text-to-dialogue` worker on v3: 10,000 characters are refused
 * with "Request text length (10000) exceeds the maximum text length of 5000
 * characters", while 2,600 generate fine. The docs' "keep it at or below
 * 2,000" is guidance, not a limit. The far end is slow — a full request on
 * v4 took 186 s live — and the worker allows 300 s for it.
 */
const dialogueLinesParam = (maxLength: number): ModelParams => ({
  dialogue: {
    label: 'Dialogue',
    required: true,
    descriptor: {
      kind: 'object',
      array: { min: 1 },
      fields: {
        // A plain id, not a catalog-bound picker: catalog loading resolves
        // top-level params only. Every ElevenLabs model shares one voices
        // task, so a caller lists them from any TTS model — e.g.
        // `ai.catalogs.voices('eleven-v4')` — and uses the ids here.
        voiceId: { label: 'Voice ID', kind: 'text', placeholder: DEFAULT_VOICE_ID },
        text: { label: 'Line', kind: 'text', maxLength },
      },
    },
  },
});

export const { MODELS } = defineModels('elevenlabs', [
  // ── TTS ───────────────────────────────────────────────────────────
  {
    id: 'eleven-v4', name: 'Eleven v4', modelId: 'eleven_v4',
    addedAt: '2026-09-29',
    workflow: 'elevenlabs/v1/text-to-speech',
    estimatedTime: 10,
    mode: 'audio', inputType: 'tts',
    badge: ['new', 'popular'] as const,
    description: 'Most expressive voice engine — audio tags direct the delivery, 90+ languages.',
    features: [feat('Audio Tags', 'characteristic'), feat('90+ Languages', 'characteristic'), feat('Creative Control', 'characteristic')],
    paramConfig: ttsParamConfig(10000, { language: true, styleControls: false }),
  },
  {
    // Same engine family tuned for latency; the vendor bills it at half the
    // per-character rate of eleven_v4.
    id: 'eleven-v4-turbo', name: 'Eleven v4 Turbo', modelId: 'eleven_v4_turbo',
    addedAt: '2026-09-29',
    workflow: 'elevenlabs/v1/text-to-speech',
    estimatedTime: 6,
    mode: 'audio', inputType: 'tts',
    badge: ['new', 'fast'] as const,
    description: 'Eleven v4 tuned for speed — the same audio tags and languages, lower latency.',
    features: [feat('Audio Tags', 'characteristic'), feat('90+ Languages', 'characteristic'), feat('Low Latency', 'characteristic')],
    paramConfig: ttsParamConfig(10000, { language: true, styleControls: false }),
  },
  {
    id: 'eleven-v3', name: 'Eleven v3', modelId: 'eleven_v3',
    addedAt: '2026-02-06',
    workflow: 'elevenlabs/v1/text-to-speech',
    estimatedTime: 11,
    mode: 'audio', inputType: 'tts',
    badge: ['popular'] as const,
    description: 'Previous-generation expressive engine with expanded tone and pacing control.',
    features: [feat('Experimental', 'characteristic'), feat('Creative Control', 'characteristic')],
    paramConfig: ttsParamConfig(5000, { language: true, styleControls: true }),
  },
  {
    id: 'eleven-multilingual-v2', name: 'Eleven Multilingual v2', modelId: 'eleven_multilingual_v2',
    addedAt: '2026-02-06',
    workflow: 'elevenlabs/v1/text-to-speech',
    estimatedTime: 9,
    mode: 'audio', inputType: 'tts',
    badge: ['popular', 'fast'] as const,
    description: 'Stable multilingual speech across 29+ languages with natural rhythm.',
    features: [feat('Stable', 'characteristic'), feat('Professional', 'characteristic')],
    paramConfig: ttsParamConfig(10000, { language: false, styleControls: true }),
  },
  // ── Dialogue ──────────────────────────────────────────────────────
  {
    // Same pricing key as the v3 dialogue below: the worker bills every
    // dialogue engine per minute under `eleven-text-to-dialogue`.
    id: 'eleven-dialogue-v4', name: 'Eleven Dialogue v4', modelId: 'eleven-text-to-dialogue',
    addedAt: '2026-09-29',
    workflow: 'elevenlabs/v1/text-to-dialogue',
    estimatedTime: 12,
    mode: 'audio', inputType: 'tts',
    badge: ['new'] as const,
    description: 'Multi-speaker conversation on the v4 engine — a voice per line, audio tags per line.',
    features: [feat('Multi-Speaker', 'characteristic'), feat('Audio Tags', 'characteristic'), feat('90+ Languages', 'characteristic')],
    paramConfig: {
      ...dialogueLinesParam(10000),
      // v4 reads the whole 0–1 range (no presets), and the dialogue endpoint
      // names its similarity knob `similarity`, not `similarity_boost`.
      // Both default-less: unset keeps the vendor's 0.5 / 0.75.
      stability: {
        label: 'Stability',
        descriptor: { kind: 'range', min: 0, max: 1, step: 0.05 },
      },
      similarity: {
        label: 'Similarity',
        descriptor: { kind: 'range', min: 0, max: 1, step: 0.05 },
      },
      ...params.language(false),
      ...params.seed(4294967295),
    },
  },
  {
    // `modelId` is the pricing-catalog key, not the vendor id: the worker
    // registers the operation as `eleven-text-to-dialogue` while the vendor
    // model behind it is plain `eleven_v3`.
    id: 'eleven-text-to-dialogue', name: 'Eleven Dialogue v3', modelId: 'eleven-text-to-dialogue',
    addedAt: '2026-09-22',
    workflow: 'elevenlabs/v1/text-to-dialogue',
    estimatedTime: 12,
    mode: 'audio', inputType: 'tts',
    description: 'Generate a multi-speaker conversation — a voice per line — in one take.',
    features: [feat('Multi-Speaker', 'characteristic'), feat('Creative Control', 'characteristic')],
    paramConfig: {
      ...dialogueLinesParam(5000),
      // The vendor takes any 0–1 double and defaults to 0.5; eleven_v3 reads the
      // three presets below, so the picker offers those instead of a slider
      // whose in-between values the engine rounds anyway.
      ...p.enum<number>('stability', [
        { id: 0, label: 'Creative' },
        { id: 0.5, label: 'Natural' },
        { id: 1, label: 'Robust' },
      ], 0.5, { label: 'Stability' }),
      ...params.language(false),
      ...params.seed(4294967295),
    },
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
    // ElevenLabs sound-generation reference: "The maximum length of the prompt is 450 characters."
    paramConfig: { ...params.prompt({ maxLength: 450 }), ...params.durationRange(0.5, 30, 5, 0.5) },
  },
  // ── Music ─────────────────────────────────────────────────────────
  {
    // `modelId` is the pricing-catalog key, not the vendor id: the vendor's bare
    // `music_v2` is not vendor-scoped, so pricing carries the `eleven_` prefix.
    // The worker still receives `model_id: 'music_v2'` from the payload builder.
    id: 'elevenlabs-music-v2', name: 'ElevenLabs Music v2', modelId: 'eleven_music_v2',
    addedAt: '2026-07-02',
    workflow: 'elevenlabs/v1/music-generation',
    estimatedTime: 30,
    mode: 'audio', inputType: 'music',
    description: 'Generate music with vocals or instrumental from a text prompt.',
    features: [feat('Vocal & Instrumental', 'characteristic')],
    paramConfig: {
      // ElevenLabs music docs state no cap; fal's `elevenlabs/music` schema declares maxLength 4100.
      ...params.prompt({ maxLength: 4100 }),
      ...params.duration([10, 20, 30, 60, 120, 180, 300, 600], 30),
      ...p.boolean('isInstrumental', false, 'Instrumental Only'),
    },
  },
  // ── Transcription ─────────────────────────────────────────────────
  {
    // `modelId` is the pricing-catalog key: the vendor id `scribe_v2` is not
    // vendor-scoped, so pricing carries the `eleven_` prefix, as music does.
    id: 'eleven-speech-to-text', name: 'Eleven Scribe v2', modelId: 'eleven_scribe_v2',
    addedAt: '2026-09-24',
    workflow: 'elevenlabs/v1/speech-to-text',
    estimatedTime: 10,
    mode: 'text', inputType: 'a2t',
    description: 'Transcribe speech from audio or video, with word timings and speaker labels.',
    features: [feat('Transcription', 'characteristic'), feat('Speaker Labels', 'characteristic')],
    paramConfig: {
      ...params.audioInput('Audio or Video', true),
      // ISO 639-1 or 639-3. Left free text: the vendor detects the language on
      // its own, and the closed list would be 99 entries of upkeep.
      language: {
        label: 'Language (ISO code, optional)',
        descriptor: { kind: 'text', placeholder: 'e.g. en, rus — omit to auto-detect' },
      },
      ...p.boolean('diarize', false, 'Label Speakers'),
      ...p.range('numSpeakers', 1, 32, 1, { step: 1, label: 'Speakers' }),
      ...p.enum('timestampsGranularity', ['word', 'character'], 'word', { label: 'Timing Detail' }),
      ...p.boolean('tagAudioEvents', false, 'Tag Audio Events'),
      ...params.seed(2147483647),
    },
  },
  // ── Video to Music ────────────────────────────────────────────────
  {
    // Same pricing model as music-generation — the same engine writes the
    // track; what separates the two is the use case, `video-to-audio`.
    id: 'eleven-video-to-music', name: 'Eleven Video to Music', modelId: 'eleven_music_v2',
    addedAt: '2026-09-24',
    workflow: 'elevenlabs/v1/video-to-music',
    estimatedTime: 25,
    mode: 'audio', inputType: 'v2a',
    description: 'Score a video with a soundtrack written to follow what happens on screen.',
    features: [feat('Video Scoring', 'characteristic'), feat('Soundtrack', 'characteristic')],
    paramConfig: {
      // The vendor takes up to ten clips, 200MB and 600 seconds in total, and
      // scores them as one timeline.
      ...params.videoInputs(10, 'Videos', true),
      ...params.prompt({ maxLength: 1000, required: false, placeholder: 'How the soundtrack should sound' }),
    },
  },
  // ── Speech-to-Speech ──────────────────────────────────────────────
  {
    id: 'eleven-sts-v2', name: 'Eleven STS v2', modelId: 'eleven_english_sts_v2',
    addedAt: '2026-02-15',
    workflow: 'elevenlabs/v1/speech-to-speech',
    estimatedTime: 15,
    mode: 'audio', inputType: 'sts',
    description: 'Swap your voice to a different speaker while keeping timing and emotion.',
    features: [feat('Voice Changer', 'characteristic'), feat('Emotion Preserved', 'characteristic')],
    paramConfig: {
      ...params.audioInput('Speech Audio', true),
      ...params.voiceId([], DEFAULT_VOICE_ID, { catalog: VOICE_CATALOG }),
      ...p.boolean('removeBackgroundNoise', false, 'Remove Background Noise'),
      ...voiceSettingsParams(false),
    },
  },
  {
    id: 'eleven-multilingual-sts-v2', name: 'Eleven Multilingual STS v2', modelId: 'eleven_multilingual_sts_v2',
    addedAt: '2026-02-15',
    workflow: 'elevenlabs/v1/speech-to-speech',
    estimatedTime: 15,
    mode: 'audio', inputType: 'sts',
    description: 'Voice swap across 29 languages — preserves emotion and cadence.',
    features: [feat('Voice Changer', 'characteristic'), feat('Multilingual', 'characteristic'), feat('29 Languages', 'characteristic')],
    paramConfig: {
      ...params.audioInput('Speech Audio', true),
      ...params.voiceId([], DEFAULT_VOICE_ID, { catalog: VOICE_CATALOG }),
      ...p.boolean('removeBackgroundNoise', false, 'Remove Background Noise'),
      ...voiceSettingsParams(false),
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
    mode: 'audio', inputType: 'tts', release: 'preview',
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
    // Pricing registers this operation as `eleven-voice-create-previews`, which
    // does not match the model id — without the hint the credits lookup misses.
    modelId: 'eleven-voice-create-previews',
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

/**
 * Seed Audio (ByteDance / BytePlus) — single source of truth.
 *
 * Text-to-speech with optional voice cloning. The backend `SeedAudioCommand`
 * accepts a `model`, a `text_prompt`, an `audio_config` (format / sample rate /
 * speech rate / loudness / pitch), a `watermark`, and a `references[]` array
 * that is EITHER up to 3 audio references (speaker id / reference audio) OR
 * exactly one image reference — the two kinds cannot be mixed (see the
 * constraints below, mirroring the worker's `IsReferencesValid`). The payload
 * builder in `seedaudio.payloads.ts` renames the unified SDK fields to the wire
 * shape and assembles the `references[]` array.
 *
 * Two variants ship. They share the same inputs, limits and knobs and differ
 * only in language coverage and timing control:
 *
 *   seed-audio-1.0              English + Chinese.
 *   seed-audio-1.0-multilingual 20 languages, plus timing control. Timing
 *                               control has no request parameter in the vendor
 *                               API reference (it is prompt-driven), so the SDK
 *                               exposes no knob for it — callers express it in
 *                               `prompt`.
 *
 * They are billed separately (the worker resolves pricing per model id).
 */
import type { Constraint, VoiceOption } from '../../core/types.ts';
import {
  SEEDAUDIO_VOICES,
  SEEDAUDIO_EN_ZH_VOICES,
  SEEDAUDIO_DEFAULT_VOICE_ID,
} from '../../core/voices.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

const REF_MUTEX_REASON = 'A named voice and audio/image references cannot be combined.';

/** Shared inputs and output knobs — identical across both variants. */
const seedAudioParams = (voices: readonly VoiceOption[]) => ({
  ...params.prompt({ maxLength: 3000 }),
  // Voice: a named BytePlus voice (default), OR clone from up to 3 reference
  // audios, OR one image reference. The three are mutually exclusive; the
  // payload builder prioritizes an uploaded reference over the named voice.
  ...params.voiceId(voices, SEEDAUDIO_DEFAULT_VOICE_ID),
  ...params.audioInputs(3, 'Reference Audios'),
  ...params.imageInput(1, 'Reference Image', false),
  // Output audio configuration (nested under `audio_config` at the wire).
  ...p.enum('format', ['wav', 'mp3', 'pcm', 'ogg_opus'], 'wav', { label: 'Format' }),
  ...p.enum('sampleRate', [8000, 16000, 24000, 32000, 44100, 48000], 44100, { label: 'Sample Rate' }),
  ...p.range('speechRate', -50, 100, 0, { label: 'Speech Rate' }),
  ...p.range('loudnessRate', -50, 100, 0, { label: 'Loudness' }),
  ...p.range('pitchRate', -12, 12, 0, { label: 'Pitch' }),
  ...p.boolean('aigcWatermark', false, 'Watermark'),
});

// Backend rejects mixing reference kinds. Trigger the mutex off the uploads
// (voiceId always has a default, so it can't be a trigger) — an uploaded
// reference greys out the voice picker and the other upload slot.
const refMutexConstraints: Constraint[] = [
  { when: { imageUrls: { exists: true } }, then: {
    voiceId: { disabled: true, reason: REF_MUTEX_REASON },
    audioUrls: { disabled: true, reason: REF_MUTEX_REASON },
  } },
  { when: { audioUrls: { exists: true } }, then: {
    voiceId: { disabled: true, reason: REF_MUTEX_REASON },
    imageUrls: { disabled: true, reason: REF_MUTEX_REASON },
  } },
];

export const { MODELS } = defineModels('seedaudio', [
  {
    id: 'seed-audio-1.0-multilingual', name: 'Seed Audio Multilingual',
    addedAt: '2026-07-28',
    workflow: 'bytedance/text-to-speech',
    estimatedTime: 15,
    mode: 'audio', inputType: 'tts',
    description: 'Synthesize natural speech in 20 languages — pick a named voice or clone one from a reference audio.',
    features: [
      feat('20 Languages', 'characteristic'),
      feat('Voice Cloning', 'characteristic'),
      feat('Reference Audio', 'audio'),
    ],
    paramConfig: seedAudioParams(SEEDAUDIO_VOICES),
    constraints: refMutexConstraints,
  },
  {
    id: 'seed-audio-1.0', name: 'Seed Audio',
    addedAt: '2026-07-27',
    workflow: 'bytedance/text-to-speech',
    estimatedTime: 15,
    mode: 'audio', inputType: 'tts',
    description: 'Synthesize natural English or Chinese speech — pick a named voice or clone one from a reference audio.',
    features: [feat('Voice Cloning', 'characteristic'), feat('Reference Audio', 'audio')],
    paramConfig: seedAudioParams(SEEDAUDIO_EN_ZH_VOICES),
    constraints: refMutexConstraints,
  },
]);

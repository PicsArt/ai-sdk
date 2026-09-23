/**
 * ElevenLabs payload builders (typed, ModelInput-backed).
 *
 * New-contract builders live here (not inline in elevenlabs.ts) so the wire
 * payload is typed against the model's generated ModelInput instead of the
 * generic GenerationContext.
 */
import type { WorkflowTypes } from '@picsart/workflows-types';

import type { ModelInput } from '../../generated/model-input-types.ts';
import { DEFAULT_VOICE_ID } from '../../core/voices.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './elevenlabs.ts';

type MusicInput = ModelInput<'elevenlabs-music-v2'>;
// eleven-v3 carries `language`, multilingual_v2 does not — the v3 shape is a
// superset, so both builders read it and the field is simply absent there.
type TTSInput = ModelInput<'eleven-v3'>;
type STSInput = ModelInput<'eleven-sts-v2'>;
type DialogueInput = ModelInput<'eleven-text-to-dialogue'>;

// TODO: annotate the return as WorkflowTypes['elevenlabs/v1/music-generation']['params']
// once the music-generation workflow ships in @picsart/workflows-types — it is not
// present as of 1.1.60. Until then the return is inferred, so backend command drift
// for music_length_seconds / force_instrumental is not compile-checked.
const buildElevenLabsMusicPayload = (input: MusicInput) => ({
  prompt: input.prompt,
  music_length_seconds: input.duration ?? 30,
  model_id: 'music_v2',
  force_instrumental: input.isInstrumental ?? false,
});

/**
 * `voice_settings` for the TTS and STS commands. Only the fields the caller set
 * are sent: an absent field means the voice keeps the settings it was saved
 * with, and a zero is a real value (0 stability is the widest emotional range),
 * so presence is tested, never truthiness.
 */
const voiceSettings = (input: {
  stability?: number;
  similarityBoost?: number;
  styleExaggeration?: number;
  speed?: number;
  useSpeakerBoost?: boolean;
}) => {
  const settings = {
    ...(input.stability != null ? { stability: input.stability } : {}),
    ...(input.similarityBoost != null ? { similarity_boost: input.similarityBoost } : {}),
    ...(input.styleExaggeration != null ? { style: input.styleExaggeration } : {}),
    ...(input.speed != null ? { speed: input.speed } : {}),
    ...(input.useSpeakerBoost != null ? { use_speaker_boost: input.useSpeakerBoost } : {}),
  };
  return Object.keys(settings).length > 0 ? { voice_settings: settings } : {};
};

/** TTS — voice_id + text + model_id (v1 Swagger schema). */
const buildElevenLabsTTSPayload =
  (modelId: string) =>
  (input: TTSInput): WorkflowTypes['elevenlabs/v1/text-to-speech']['params'] => ({
    text: input.prompt,
    voice_id: input.voiceId ?? DEFAULT_VOICE_ID,
    model_id: modelId as 'eleven_multilingual_v2' | 'eleven_v3',
    ...(input.language ? { language_code: input.language } : {}),
    ...voiceSettings(input),
  });

/** Speech-to-Speech — audio_url + voice_id (v1 Swagger schema). */
const buildElevenLabsSTSPayload =
  (modelId: string) =>
  (input: STSInput): WorkflowTypes['elevenlabs/v1/speech-to-speech']['params'] => ({
    audio_url: input.audioUrl,
    voice_id: input.voiceId ?? DEFAULT_VOICE_ID,
    model_id: modelId as 'eleven_multilingual_sts_v2' | 'eleven_english_sts_v2',
    remove_background_noise: input.removeBackgroundNoise ?? false,
    ...voiceSettings(input),
  });

/**
 * Text-to-Dialogue — one entry per spoken line, plus the dialogue-level
 * `settings` (stability only; the TTS `voice_settings` shape is rejected by
 * the vendor's dialogue endpoint).
 *
 * Every builder here returns the WORKER COMMAND, not the vendor body: the
 * turns travel as `conversation`, which is what `TextToDialogueCommand`
 * declares, and the worker renames the field to the vendor's `inputs` before
 * calling ElevenLabs. Sending `inputs` from here fails the worker's own
 * validation — `conversation` is a required field.
 *
 * TODO: annotate the return as WorkflowTypes['elevenlabs/v1/text-to-dialogue']['params']
 * once the worker's `settings` / `model_id` fields ship in @picsart/workflows-types —
 * its TextToDialogueCommand carries neither as of 1.1.144. The annotation would
 * have made the field name compile-checked, the way the TTS and STS builders
 * above already are.
 */
const buildElevenLabsDialoguePayload = (input: DialogueInput) => ({
  conversation: input.dialogue.map((line) => ({
    voice_id: line.voiceId,
    text: line.text,
  })),
  model_id: 'eleven_v3',
  ...(input.stability != null ? { settings: { stability: input.stability } } : {}),
  ...(input.language ? { language_code: input.language } : {}),
  ...(input.seed != null ? { seed: input.seed } : {}),
});

registerPayloads(MODELS, {
  'elevenlabs-music-v2': buildElevenLabsMusicPayload,
  'eleven-v3': buildElevenLabsTTSPayload('eleven_v3'),
  'eleven-multilingual-v2': buildElevenLabsTTSPayload('eleven_multilingual_v2'),
  'eleven-sts-v2': buildElevenLabsSTSPayload('eleven_english_sts_v2'),
  'eleven-multilingual-sts-v2': buildElevenLabsSTSPayload('eleven_multilingual_sts_v2'),
  'eleven-text-to-dialogue': buildElevenLabsDialoguePayload,
});

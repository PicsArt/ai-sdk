/**
 * ElevenLabs payload builders (typed, ModelInput-backed).
 *
 * New-contract builders live here (not inline in elevenlabs.ts) so the wire
 * payload is typed against the model's generated ModelInput instead of the
 * generic GenerationContext.
 */
import type { WorkflowTypes } from '@picsart/workflows-types';

import type { ModelInput } from '../../generated/model-input-types.ts';
import { ApiError } from '../../core/errors.ts';
import { DEFAULT_VOICE_ID } from '../../core/voices.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './elevenlabs.ts';

type MusicInput = ModelInput<'elevenlabs-music-v2'>;
// eleven-v3 is the superset of every TTS shape: multilingual_v2 lacks
// `language`, the v4 engines lack the style/speed/speaker-boost knobs. One
// builder reads them all; a field a model does not declare is simply absent.
type TTSInput = ModelInput<'eleven-v3'>;
type STSInput = ModelInput<'eleven-sts-v2'>;
// Likewise the v4 dialogue shape is the superset: v3's stability is the three
// presets (a subtype of number) and it has no `similarity`.
type DialogueInput = ModelInput<'eleven-dialogue-v4'>;
type TTSModelId = NonNullable<WorkflowTypes['elevenlabs/v1/text-to-speech']['params']['model_id']>;
type DialogueModelId = NonNullable<WorkflowTypes['elevenlabs/v1/text-to-dialogue']['params']['model_id']>;
type TranscribeInput = ModelInput<'eleven-speech-to-text'>;
type VideoToMusicInput = ModelInput<'eleven-video-to-music'>;

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
  (modelId: TTSModelId) =>
  (input: TTSInput): WorkflowTypes['elevenlabs/v1/text-to-speech']['params'] => ({
    text: input.prompt,
    voice_id: input.voiceId ?? DEFAULT_VOICE_ID,
    model_id: modelId,
    ...(input.language ? { language_code: input.language } : {}),
    ...(input.withTimestamps ? { with_timestamps: true } : {}),
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
 * `settings` (`stability` and `similarity`; the TTS `voice_settings` shape is
 * rejected by the vendor's dialogue endpoint). Only the knobs the caller set
 * travel, and a zero is a real value, so presence is tested, never truthiness.
 *
 * The engine's character cap applies to the dialogue AS A WHOLE, which the
 * catalog's per-line `maxLength` cannot express: several lines that each pass
 * it can still add up past the cap and be refused by the vendor after the
 * request was submitted and billed. So the total is checked here, against the
 * same figure the catalog declares per line, before anything is sent.
 *
 * Like every builder here this returns the WORKER COMMAND, not the vendor body:
 * the turns travel as `conversation`, and the worker renames the field to the
 * vendor's `inputs` on its way out. The annotation below is what keeps that
 * honest — sending `inputs` from here would not compile.
 */
const buildElevenLabsDialoguePayload =
  (catalogId: string, modelId: DialogueModelId) =>
  (input: DialogueInput): WorkflowTypes['elevenlabs/v1/text-to-dialogue']['params'] => {
    const cap = dialogueCharacterCap(catalogId);
    const total = input.dialogue.reduce((sum, line) => sum + line.text.length, 0);
    if (total > cap) {
      throw new ApiError(
        `${catalogId}: the dialogue as a whole exceeds ${cap} characters (got ${total}).`,
        { status: 400, code: 'validation_error' },
      );
    }
    const settings = {
      ...(input.stability != null ? { stability: input.stability } : {}),
      ...(input.similarity != null ? { similarity: input.similarity } : {}),
    };
    return {
      conversation: input.dialogue.map((line) => ({
        voice_id: line.voiceId,
        text: line.text,
      })),
      model_id: modelId,
      ...(Object.keys(settings).length > 0 ? { settings } : {}),
      ...(input.language ? { language_code: input.language } : {}),
      ...(input.seed != null ? { seed: input.seed } : {}),
    };
  };

/**
 * The per-line cap the catalog entry declares, reused as the whole-dialogue
 * cap so the two cannot drift apart.
 */
function dialogueCharacterCap(catalogId: string): number {
  const descriptor = MODELS.find((m) => m.id === catalogId)?.paramConfig.dialogue?.descriptor;
  const text = descriptor?.kind === 'object' ? descriptor.fields.text : undefined;
  const cap = text && 'maxLength' in text ? text.maxLength : undefined;
  if (typeof cap !== 'number') {
    throw new Error(`${catalogId}: dialogue entry declares no per-line maxLength to derive the cap from`);
  }
  return cap;
}

/** Transcription — the result is text, so there is no output format to pick. */
const buildElevenLabsTranscribePayload = (
    input: TranscribeInput,
): WorkflowTypes['elevenlabs/v1/speech-to-text']['params'] => ({
  audio_url: input.audioUrl,
  ...(input.language ? { language_code: input.language } : {}),
  ...(input.diarize ? { diarize: true } : {}),
  // Only meaningful alongside diarization, and only when the caller moved it
  // off the default of one.
  ...(input.diarize && input.numSpeakers && input.numSpeakers > 1
    ? { num_speakers: input.numSpeakers }
    : {}),
  ...(input.timestampsGranularity ? { timestamps_granularity: input.timestampsGranularity } : {}),
  ...(input.tagAudioEvents ? { tag_audio_events: true } : {}),
  ...(input.seed != null ? { seed: input.seed } : {}),
});

/** Video to Music — the clips are scored as one timeline, in the order given. */
const buildElevenLabsVideoToMusicPayload = (
    input: VideoToMusicInput,
): WorkflowTypes['elevenlabs/v1/video-to-music']['params'] => ({
  video_urls: input.videoUrls,
  ...(input.prompt ? { description: input.prompt } : {}),
});

registerPayloads(MODELS, {
  'elevenlabs-music-v2': buildElevenLabsMusicPayload,
  'eleven-v4': buildElevenLabsTTSPayload('eleven_v4'),
  'eleven-v4-turbo': buildElevenLabsTTSPayload('eleven_v4_turbo'),
  'eleven-v3': buildElevenLabsTTSPayload('eleven_v3'),
  'eleven-multilingual-v2': buildElevenLabsTTSPayload('eleven_multilingual_v2'),
  'eleven-sts-v2': buildElevenLabsSTSPayload('eleven_english_sts_v2'),
  'eleven-multilingual-sts-v2': buildElevenLabsSTSPayload('eleven_multilingual_sts_v2'),
  'eleven-text-to-dialogue': buildElevenLabsDialoguePayload('eleven-text-to-dialogue', 'eleven_v3'),
  'eleven-dialogue-v4': buildElevenLabsDialoguePayload('eleven-dialogue-v4', 'eleven_v4'),
  'eleven-speech-to-text': buildElevenLabsTranscribePayload,
  'eleven-video-to-music': buildElevenLabsVideoToMusicPayload,
});

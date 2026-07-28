/**
 * Seed Audio payload builder.
 *
 * Renames the unified SDK fields to the backend `SeedAudioCommand` wire shape,
 * nests the audio knobs under `audio_config`, and assembles the `references[]`
 * array. Reference kinds are mutually exclusive; an uploaded reference wins over
 * the named voice: image reference > reference audios > named voice (`speaker`).
 *
 * Both variants share one builder — they differ only in the `model` sent (and
 * therefore in which pricing entry the worker bills against).
 *
 * NOTE: the return type is left inferred — the `bytedance/text-to-speech`
 * workflow is not published in `@picsart/workflows-types` yet (the worker MR is
 * not merged). Annotate the return as
 * `WorkflowTypes['bytedance/text-to-speech']['params']` once it ships.
 */
import { SEEDAUDIO_DEFAULT_VOICE_ID } from '../../core/voices.ts';
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './seedaudio.ts';

type SeedAudioModelId = 'seed-audio-1.0' | 'seed-audio-1.0-multilingual';

// The two variants take the same inputs; the multilingual one just offers more
// voiceId values, so its input type is the wider of the two.
type SeedAudioInput = ModelInput<'seed-audio-1.0-multilingual'>;

type Reference =
  | { speaker: string }
  | { audio_url: string }
  | { image_url: string };

/**
 * Build the references[] array, mutually-exclusive by kind. An uploaded
 * reference takes priority over the named voice (which always has a default):
 * image reference > reference audios > named voice (`speaker`).
 */
const assembleReferences = (input: SeedAudioInput): Reference[] | undefined => {
  const imageUrl = input.imageUrls?.[0];
  if (imageUrl) {
    return [{ image_url: imageUrl }];
  }

  if (input.audioUrls?.length) {
    return input.audioUrls.map((audioUrl) => ({ audio_url: audioUrl }));
  }

  // No uploaded reference — use the named voice. Apply the catalog default
  // explicitly: prepareRequest passes only caller-supplied values to custom
  // builders, so an omitted voiceId must still resolve to the advertised
  // default rather than dropping the speaker and falling back to the vendor's.
  return [{ speaker: input.voiceId ?? SEEDAUDIO_DEFAULT_VOICE_ID }];
};

const buildSeedAudioPayload = (model: SeedAudioModelId) => (input: SeedAudioInput) => {
  const references = assembleReferences(input);
  return {
    model,
    text_prompt: input.prompt,
    // Apply the paramConfig defaults explicitly — a custom builder (unlike the
    // pass-through one) doesn't get them for free, and the advertised defaults
    // must reach the wire (e.g. sampleRate 44100, else the backend picks a
    // format-dependent default that differs from what the UI showed).
    audio_config: {
      format: input.format ?? 'wav',
      sample_rate: input.sampleRate ?? 44100,
      speech_rate: input.speechRate ?? 0,
      loudness_rate: input.loudnessRate ?? 0,
      pitch_rate: input.pitchRate ?? 0,
    },
    // Send the watermark flag explicitly (default false) rather than omitting it
    // when false, so the SDK setting is honored instead of the backend default.
    watermark: { aigc_watermark: input.aigcWatermark ?? false },
    ...(references ? { references } : {}),
  };
};

registerPayloads(MODELS, {
  'seed-audio-1.0': buildSeedAudioPayload('seed-audio-1.0'),
  'seed-audio-1.0-multilingual': buildSeedAudioPayload('seed-audio-1.0-multilingual'),
});

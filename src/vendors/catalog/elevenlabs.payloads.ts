/**
 * ElevenLabs payload builders (typed, ModelInput-backed).
 *
 * New-contract builders live here (not inline in elevenlabs.ts) so the wire
 * payload is typed against the model's generated ModelInput instead of the
 * generic GenerationContext.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './elevenlabs.ts';

type MusicInput = ModelInput<'elevenlabs-music-v2'>;

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

registerPayloads(MODELS, {
  'elevenlabs-music-v2': buildElevenLabsMusicPayload,
});

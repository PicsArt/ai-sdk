/**
 * Mirelo SFX 2.0 payload builders.
 *
 * Rename the unified SDK fields to the backend `*Input` wire shape (fal
 * snake_case) and apply the paramConfig defaults explicitly — a custom builder,
 * unlike the pass-through one, doesn't get them for free, so the advertised
 * defaults (duration, num_samples, format, preserve_speech) must reach the wire.
 *
 * Optional, no-default fields (`seed`, `text_prompt`, `negative_prompt`,
 * `bitrateKbps`) are sent only when supplied, so the vendor's own randomization /
 * VBR encoding applies otherwise.
 *
 * NOTE: the return types are left inferred — the `mirelo-ai/sfx2.0/*` workflows
 * are not published in `@picsart/workflows-types` yet (checked 1.1.171). Annotate
 * each return as `WorkflowTypes['mirelo-ai/sfx2.0/<task>']['params']` once they
 * ship upstream.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './mirelo.ts';

type TextToAudioInput = ModelInput<'mirelo-sfx-2.0-text-to-audio'>;
type VideoToAudioInput = ModelInput<'mirelo-sfx-2.0-video-to-audio'>;
type VideoToVideoInput = ModelInput<'mirelo-sfx-2.0-video-to-video'>;

const buildTextToAudioPayload = (input: TextToAudioInput) => ({
  prompt: input.prompt,
  duration: input.duration ?? 30,
  num_samples: input.count ?? 2,
  upload_audio_format: input.format ?? 'wav',
  ...(input.negativePrompt != null ? { negative_prompt: input.negativePrompt } : {}),
  ...(input.bitrateKbps != null ? { upload_audio_bitrate_kbps: input.bitrateKbps } : {}),
  ...(input.seed != null ? { seed: input.seed } : {}),
});

const buildVideoToAudioPayload = (input: VideoToAudioInput) => ({
  video_url: input.videoUrl,
  preserve_speech: input.preserveSpeech ?? true,
  duration: input.duration ?? 10,
  num_samples: input.count ?? 2,
  upload_audio_format: input.format ?? 'wav',
  ...(input.prompt != null ? { text_prompt: input.prompt } : {}),
  ...(input.negativePrompt != null ? { negative_prompt: input.negativePrompt } : {}),
  ...(input.bitrateKbps != null ? { upload_audio_bitrate_kbps: input.bitrateKbps } : {}),
  ...(input.seed != null ? { seed: input.seed } : {}),
});

const buildVideoToVideoPayload = (input: VideoToVideoInput) => ({
  video_url: input.videoUrl,
  preserve_speech: input.preserveSpeech ?? true,
  duration: input.duration ?? 10,
  num_samples: input.count ?? 2,
  ...(input.prompt != null ? { text_prompt: input.prompt } : {}),
  ...(input.negativePrompt != null ? { negative_prompt: input.negativePrompt } : {}),
  ...(input.seed != null ? { seed: input.seed } : {}),
});

registerPayloads(MODELS, {
  'mirelo-sfx-2.0-text-to-audio': buildTextToAudioPayload,
  'mirelo-sfx-2.0-video-to-audio': buildVideoToAudioPayload,
  'mirelo-sfx-2.0-video-to-video': buildVideoToVideoPayload,
});

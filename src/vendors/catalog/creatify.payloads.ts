/**
 * Creatify Boreal payload builder.
 *
 * Text-to-video with native audio: `prompt` is required; a reference image and
 * driving audio are optional. Renames the SDK's unified fields to the fal wire
 * shape (`startFrame`/`imageUrls` -> `image_url`, `audioUrl` -> `audio_url`,
 * `negativePrompt` -> `negative_prompt`, `aspectRatio` -> `aspect_ratio`).
 *
 * Aurora keeps its legacy inline builder in `creatify.ts` — untouched.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './creatify.ts';

type CreatifyBorealInput = ModelInput<'creatify-boreal'>;

const buildCreatifyBorealPayload = (input: CreatifyBorealInput) => ({
  prompt: input.prompt,
  ...(input.imageUrls?.[0] ? { image_url: input.imageUrls[0] } : {}),
  ...(input.audioUrl ? { audio_url: input.audioUrl } : {}),
  negative_prompt: input.negativePrompt ?? '',
  resolution: input.resolution ?? '720p',
  aspect_ratio: input.aspectRatio ?? 'auto',
  duration: input.duration ?? 10,
  manifest_disclosure: input.manifestDisclosure ?? false,
});

registerPayloads(MODELS, {
  'creatify-boreal': buildCreatifyBorealPayload,
});

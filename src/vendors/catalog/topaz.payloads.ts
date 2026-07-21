/**
 * Topaz upscale payload builders (image + video).
 *
 * Each is a single card: the user supplies the media input and picks a Topaz
 * `model` from the dropdown; everything else is left at the backend's per-model
 * defaults (upscale_factor, face enhancement, codec, adaptive sliders). Inputs
 * are typed against `ModelInput<'topaz-upscale-*'>` and the returns are checked
 * against the backend `ImageUpscaleRequest` / `VideoUpscaleRequest` interfaces
 * via `WorkflowTypes`.
 */
import type { WorkflowTypes } from '@picsart/workflows-types';
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './topaz.ts';

type TopazImageInput = ModelInput<'topaz-upscale-image'>;
type TopazImagePayload = WorkflowTypes['topaz/upscale/image']['params'];

const buildTopazImagePayload = (input: TopazImageInput): TopazImagePayload => ({
  image_url: input.imageUrls[0],
  model: input.model ?? 'Standard V2',
  upscale_factor: 2,
  output_format: 'png',
  face_enhancement: false,
  face_enhancement_creativity: 0,
  face_enhancement_strength: 0.8,
  subject_detection: 'All',
  crop_to_fill: false,
});

type TopazVideoInput = ModelInput<'topaz-upscale-video'>;
type TopazVideoPayload = WorkflowTypes['topaz/upscale/video']['params'];

const buildTopazVideoPayload = (input: TopazVideoInput): TopazVideoPayload => ({
  video_url: input.videoUrl,
  model: input.model ?? 'Proteus',
  upscale_factor: 2,
  H264_output: false,
});

registerPayloads(MODELS, {
  'topaz-upscale-image': buildTopazImagePayload,
  'topaz-upscale-video': buildTopazVideoPayload,
});

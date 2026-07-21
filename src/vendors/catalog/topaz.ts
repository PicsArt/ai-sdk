/**
 * Topaz — 2 models (1 image upscale, 1 video upscale).
 * https://www.topazlabs.com/
 *
 * Each is a single card whose `model` dropdown selects the Topaz engine. Only
 * the media input and the model picker are surfaced; all other knobs
 * (upscale_factor, face enhancement, codec, adaptive sliders) are left at the
 * backend's per-model defaults. Builders live in the sibling
 * `topaz.payloads.ts` (typed against `WorkflowTypes['topaz/upscale/*']`).
 */
import { p } from '../../core/descriptors/presets.ts';
import { defineModels, feat, params } from '../define.ts';

/**
 * Topaz image enhancement models, surfaced as the `model` dropdown on the single
 * `topaz-upscale-image` card. Values are the exact backend enum strings (must
 * match `ImageUpscaleRequest.model`). `Standard V2` is the default.
 */
export const TOPAZ_IMAGE_MODEL_OPTIONS = [
  'Standard V2',
  'Standard MAX',
  'Low Resolution V2',
  'High Fidelity V2',
  'CGI',
  'Text Refine',
  'Redefine',
  'Recovery',
  'Recovery V2',
  'Wonder',
  'Wonder 3',
] as const;

/**
 * Topaz video enhancement models, surfaced as the `model` dropdown on the single
 * `topaz-upscale-video` card. Values are the exact backend enum strings (must
 * match `VideoUpscaleRequest.model`). `Proteus` is the default.
 */
export const TOPAZ_VIDEO_MODEL_OPTIONS = [
  'Proteus',
  'Artemis HQ',
  'Artemis MQ',
  'Artemis LQ',
  'Nyx',
  'Nyx Fast',
  'Nyx XL',
  'Nyx HF',
  'Gaia HQ',
  'Gaia CG',
  'Gaia 2',
  'Starlight Precise 1',
  'Starlight Precise 2',
  'Starlight Precise 2.5',
  'Starlight HQ',
  'Starlight Mini',
  'Starlight Sharp',
  'Starlight Fast 1',
  'Starlight Fast 2',
] as const;

export const { MODELS } = defineModels('topaz', [
  {
    id: 'topaz-upscale-image',
    name: 'Topaz Image Upscale',
    addedAt: '2026-03-06',
    workflow: 'topaz/upscale/image',
    estimatedTime: 30,
    mode: 'image',
    inputType: 'i2i',
    description: 'Image upscaling and enhancement with Topaz AI — Standard, Hi-Fi, CGI, Recovery and Wonder models.',
    features: [feat('Upscale', 'quality'), feat('Image Required', 'input')],
    paramConfig: {
      ...params.imageInput(1, 'Image', true),
      ...p.enum('model', [...TOPAZ_IMAGE_MODEL_OPTIONS], 'Standard V2', { label: 'Model' }),
    },
  },
  {
    id: 'topaz-upscale-video',
    name: 'Topaz Video Upscale',
    addedAt: '2026-07-21',
    workflow: 'topaz/upscale/video',
    estimatedTime: 600,
    mode: 'video',
    inputType: 'v2v',
    description: 'Video upscaling and enhancement with Topaz AI — Proteus, Artemis, Nyx, Gaia and Starlight models.',
    features: [feat('Upscale', 'quality'), feat('Video Required', 'input')],
    paramConfig: {
      ...params.videoInput('Source Video', 'asset', true),
      ...p.enum('model', [...TOPAZ_VIDEO_MODEL_OPTIONS], 'Proteus', { label: 'Model' }),
    },
  },
]);

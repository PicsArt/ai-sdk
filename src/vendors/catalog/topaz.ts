/**
 * Topaz — 9 models (1 image upscale, 8 image enhance).
 * https://www.topazlabs.com/
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

const buildTopazUpscalePayload: PayloadBuilder = (ctx) => ({
  face_enhancement: false,
  face_enhancement_creativity: 0,
  face_enhancement_strength: 0.8,
  output_format: 'png',
  subject_detection: 'All',
  model: 'Standard V2',
  image_url: ctx.imageUrls?.[0] ?? '',
  upscale_factor: 2,
  crop_to_fill: false,
});

const buildTopazEnhancePayload = (model: string): PayloadBuilder => (ctx) => ({
  image_url: ctx.imageUrls?.[0] ?? '',
  upscale_factor: 1,
  output_format: 'png',
  model,
});

export const TOPAZ_ENHANCE_VARIANTS = [
  { key: 'standard-v2', label: 'Topaz Standard', model: 'Standard V2' },
  { key: 'low-res-v2', label: 'Topaz Low Res', model: 'Low Resolution V2' },
  { key: 'cgi', label: 'Topaz CGI', model: 'CGI' },
  { key: 'high-fidelity-v2', label: 'Topaz Hi-Fi', model: 'High Fidelity V2' },
  { key: 'text-refine', label: 'Topaz Text', model: 'Text Refine' },
  { key: 'redefine', label: 'Topaz Redefine', model: 'Redefine' },
  { key: 'recovery', label: 'Topaz Recovery', model: 'Recovery' },
  { key: 'recovery-v2', label: 'Topaz Recovery V2', model: 'Recovery V2' },
] as const;

export const { MODELS } = defineModels('topaz', [
  {
    id: 'topaz-upscale-image', name: 'Topaz HD Upscale',
    addedAt: '2026-03-06',
    workflow: 'topaz/upscale/image',
    buildPayload: buildTopazUpscalePayload,
    estimatedTime: 30,
    mode: 'image', inputType: 'i2i',
    description: '2x image upscale with Topaz AI.',
    features: [feat('Upscale', 'quality'), feat('Image Required', 'input')],
    paramConfig: { ...params.imageInput(1, 'Image', true) },
  },
  ...TOPAZ_ENHANCE_VARIANTS.map((v) => ({
    id: `topaz-enhance-${v.key}`,
    modelId: 'topaz-upscale-image',
    addedAt: '2026-03-06',
    name: v.label,
    workflow: 'topaz/upscale/image',
    buildPayload: buildTopazEnhancePayload(v.model),
    estimatedTime: 30,
    mode: 'image' as const,
    inputType: 'i2i' as const,
    description: `${v.model} image enhancement`,
    features: [feat('Enhancement', 'quality'), feat('Image Required', 'input')],
    paramConfig: { ...params.imageInput(1, 'Image', true) },
  })),
]);

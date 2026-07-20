/**
 * VEED — single source of truth.
 * GOTCHA: Resolution is REQUIRED — use '720p' (not 'hd').
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

/** Fabric — prompt + image_url + resolution (required). */
export const buildVeedFabricPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  image_url: ctx.imageUrls?.[0],
  resolution: ctx.resolution ?? '720p',
  ...(ctx.audioUrl ? { audio_url: ctx.audioUrl } : {}),
});

const shared = {
  buildPayload: buildVeedFabricPayload,
  mode: 'video' as const,
  inputType: 'i2v' as const,
  paramConfig: {
    ...params.prompt({ required: false }),
    ...params.resolution(['480p', '720p'], '720p'),
    ...params.imageInput(1, 'Start Image', true),
    ...params.audioInput('Audio Track', true),
  },
} as const;

export const { MODELS } = defineModels('veed', [
  {
    ...shared, id: 'veed-fabric-v1', name: 'VEED Fabric 1.0',
    addedAt: '2026-02-06',
    workflow: 'veed/fabric-1.0',
    estimatedTime: 500,
    description: 'Image-driven video with layered ambient atmosphere and optional audio.',
    features: [feat('Image Input', 'input'), feat('Audio Input', 'audio'), feat('720p', 'resolution')],
  },
  {
    ...shared, id: 'veed-fabric-v1-fast', name: 'VEED Fabric 1.0 Fast',
    addedAt: '2026-02-06',
    workflow: 'veed/fabric-1.0/fast',
    estimatedTime: 514,
    description: 'Quick ambient video from images with optional audio overlay.',
    features: [feat('Image Input', 'input'), feat('Audio Input', 'audio'), feat('720p', 'resolution'), feat('Fast', 'duration')],
  },
]);

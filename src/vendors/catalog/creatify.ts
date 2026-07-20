/**
 * Creatify — single source of truth.
 * GOTCHA: Do NOT send resolution or duration — both cause validation errors.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

export const buildCreatifyAuroraPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  url: ctx.imageUrls?.[0],
  image_url: ctx.imageUrls?.[0],
  ...(ctx.audioUrl ? { audio_url: ctx.audioUrl } : {}),
});

export const { MODELS } = defineModels('creatify', [
  {
    id: 'creatify-aurora', name: 'Creatify Aurora HD',
    addedAt: '2026-02-06',
    workflow: 'creatify/aurora', buildPayload: buildCreatifyAuroraPayload,
    estimatedTime: 169,
    mode: 'video', inputType: 'i2v',
    description: 'Product showcase from still images with gentle camera motion.',
    features: [feat('Image Input', 'input'), feat('Audio Input', 'audio')],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.imageInput(1, 'Product Image', true),
      ...params.audioInput('Audio Track', true),
    },
  },
]);

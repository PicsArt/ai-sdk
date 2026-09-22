/**
 * Creatify — single source of truth.
 * GOTCHA: Do NOT send resolution or duration — both cause validation errors.
 */
import { p } from '../../core/descriptors/presets.ts';
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
  {
    id: 'creatify-boreal', name: 'Creatify Boreal',
    addedAt: '2026-09-22',
    workflow: 'creatify/boreal',
    estimatedTime: 169,
    mode: 'video', inputType: 't2v',
    description: 'Text-to-video with synchronized native audio for product, UGC, and presenter clips.',
    features: [feat('Image Input', 'input'), feat('Audio Input', 'audio')],
    paramConfig: {
      ...params.prompt({ maxLength: 5000 }),
      ...params.imageInput(1, 'Reference Image', false, 'asset'),
      ...params.audioInput('Audio Track', false),
      ...params.negativePrompt(),
      ...params.resolution(['720p', '1080p', '2k'], '720p'),
      ...params.aspectRatio(['auto', '16:9', '9:16', '1:1', '4:3', '3:4'], 'auto'),
      ...params.durationRange(1, 20, 10),
      ...p.boolean('manifestDisclosure', false, 'AI-Generated Disclosure'),
    },
  },
]);

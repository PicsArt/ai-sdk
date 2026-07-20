/**
 * Reve — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

const REVE_AR = ['16:9', '9:16', '1:1', '4:3', '3:4', '3:2', '2:3'];

/** T2I/Edit — prompt + num_images + optional image_url + aspect_ratio.
 * NOTE: routes through the fal.ai reve wrapper (fal-ai/reve/text-to-image | /edit),
 * NOT api.reve.com — fal's schema has no `negative_prompt` (sending it 422s). */
export const buildRevePayload: PayloadBuilder = (ctx) => {
  const hasImages = ctx.imageUrls && ctx.imageUrls.length > 0;
  return {
    prompt: ctx.prompt,
    num_images: ctx.count ?? 1,
    ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
    ...(hasImages ? { image_url: ctx.imageUrls![0] } : {}),
  };
};

export const { MODELS } = defineModels('reve', [
  {
    id: 'reve', name: 'Reve',
    addedAt: '2026-02-06',
    workflow: 'reve/text-to-image', editWorkflow: 'reve/edit',
    buildPayload: buildRevePayload,
    estimatedTime: 20,
    mode: 'image', inputType: 't2i',
    description: 'Stylized 1K images with optional reference input.',
    features: [feat('Image Input', 'input'), feat('1K', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(REVE_AR),
      ...params.count(),
      ...params.imageInput(1, 'Source Image'),
    },
  },
]);

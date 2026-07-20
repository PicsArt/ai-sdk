/**
 * Videography — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

export const buildVideographyPayload: PayloadBuilder = (ctx) => ({
  imageUrl: ctx.imageUrls?.[0],
});

export const { MODELS } = defineModels('videography', [
  {
    id: 'picsart-videography', name: 'Videography',
    addedAt: '2026-02-06',
    workflow: 'videography', buildPayload: buildVideographyPayload,
    estimatedTime: 82,
    mode: 'video', inputType: 'i2v',
    description: 'Turn a still photo into polished video with automated composition.',
    features: [feat('Image Input', 'input')],
    paramConfig: { ...params.imageInput(1, 'Source Image', true) },
  },
]);

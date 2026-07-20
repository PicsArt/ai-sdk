/**
 * Hunyuan — single source of truth.
 * Backend orchestrator extractParams must include `image_size` for this to work.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

// Aspect ratio → Hunyuan image_size mapping
const HUNYUAN_SIZE_MAP: Record<string, string> = {
  '1:1': 'square_hd',
  '16:9': 'landscape_16_9',
  '9:16': 'portrait_16_9',
  '4:3': 'landscape_4_3',
  '3:4': 'portrait_4_3',
};

export const buildHunyuanT2IPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  num_images: ctx.count ?? 1,
  ...(ctx.cfgScale != null ? { guidance_scale: ctx.cfgScale } : {}),
  ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
  ...(ctx.aspectRatio && HUNYUAN_SIZE_MAP[ctx.aspectRatio]
    ? { image_size: HUNYUAN_SIZE_MAP[ctx.aspectRatio] }
    : {}),
});

export const { MODELS } = defineModels('hunyuan', [
  {
    id: 'hunyuan-v3', name: 'Hunyuan V3', modelId: 'hunyuan-v3',
    addedAt: '2026-02-06',
    workflow: 'hunyuan-image/v3/text-to-image', buildPayload: buildHunyuanT2IPayload,
    estimatedTime: 74,
    mode: 'image', inputType: 't2i',
    description: 'Infographic-friendly generation with readable text and cfg control.',
    features: [feat('1K', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(['1:1', '16:9', '9:16', '4:3', '3:4'], '16:9'),
      // Fal HunyuanImage v3 caps num_images at 4 — don't offer 6/8/10.
      ...params.count([1, 2, 4]),
      ...params.negativePrompt(),
      ...params.cfgScale(1, 20, 7.5, 0.5),
    },
  },
]);

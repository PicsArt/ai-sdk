/**
 * Seedream — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

/** Seedream v2 builder — flat `image` array format for pluggable workflow. */
function buildSeedreamV2(modelId: string): PayloadBuilder {
  return (ctx) => ({
    prompt: ctx.prompt,
    model: modelId,
    count: ctx.count ?? 1,
    ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
    ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
    ...(ctx.imageUrls?.length ? { image: ctx.imageUrls } : {}),
    ...(ctx.negativePrompt ? { modelOptions: { negative_prompt: ctx.negativePrompt } } : {}),
  });
}

export const buildSeedream40Payload: PayloadBuilder = buildSeedreamV2('seedream_4_0');
export const buildSeedream45Payload: PayloadBuilder = buildSeedreamV2('seedream_4_5');
export const buildSeedream50LitePayload: PayloadBuilder = buildSeedreamV2('seedream_5_0_lite');
export const buildSeedream50ProPayload: PayloadBuilder = buildSeedreamV2('seedream_5_0_pro');

const seedreamV2Params = {
  ...params.prompt(),
  ...params.aspectRatio(['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', '21:9'], '16:9'),
  ...params.count(),
  ...params.imageInput(2, 'Source Images'),
  ...params.negativePrompt(),
};

export const { MODELS } = defineModels('seedream', [
  {
    id: 'seedream-5.0-pro', name: 'Seedream 5.0 Pro', modelId: 'seedream_5_0_pro',
    addedAt: '2026-07-08',
    workflow: 'seedream', buildPayload: buildSeedream50ProPayload,
    estimatedTime: { '1K': 20, '2K': 35 },
    mode: 'image', inputType: 't2i',
    // Backend (pa-bytedance-pluggable-worker) gates 5.0-pro to 1K/2K — it
    // rejects 3K/4K ("not supported by model seedream_5_0_pro"). Single-image
    // only (no group/sequential), up to 10 reference images.
    description: 'Top-tier single-image generation with up to 10 reference images and 2K detail.',
    features: [feat('Multi-Image Input', 'input'), feat('2K', 'resolution')],
    // Single-image only (no sequential/batch) → no `count` param, unlike the V2 models.
    paramConfig: {
      ...params.resolution(['1K', '2K']),
      ...params.prompt(),
      ...params.aspectRatio(['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', '21:9'], '16:9'),
      ...params.imageInput(10, 'Source Images'), // Pro supports up to 10 reference images
      ...params.negativePrompt(),
    },
  },
  {
    id: 'seedream-5.0-lite', name: 'Seedream 5.0 Lite', modelId: 'seedream_5_0_lite',
    addedAt: '2026-02-24',
    workflow: 'seedream', buildPayload: buildSeedream50LitePayload,
    estimatedTime: { '2K': 22, '3K': 44 },
    mode: 'image', inputType: 't2i', badge: ['popular'],
    // Backend (pa-bytedance-pluggable-worker) gates 5.0-lite to 2K/3K — it
    // rejects 4K ("not supported by model seedream_5_0_lite") even though the
    // SeedreamResolution enum defines a 4K member. Boundary-verified 2026-05-25.
    description: 'Speedy 3K output with negative prompt and dual-image input support.',
    features: [feat('Multi-Image Input', 'input'), feat('3K', 'resolution')],
    paramConfig: {
      ...params.resolution(['2K', '3K']),
      ...seedreamV2Params,
    },
  },
  {
    id: 'seedream-4.5', name: 'Seedream 4.5', modelId: 'seedream_4_5',
    addedAt: '2026-02-14',
    workflow: 'seedream', buildPayload: buildSeedream45Payload,
    estimatedTime: { '2K': 21, '4K': 58 },
    mode: 'image', inputType: 't2i',
    description: 'Detailed 4K renders with clean in-image text and dual-image input.',
    features: [feat('Multi-Image Input', 'input'), feat('4K', 'resolution')],
    paramConfig: {
      ...params.resolution(['2K', '4K']),
      ...seedreamV2Params,
    },
  },
  {
    id: 'seedream-4.0', name: 'Seedream 4.0', modelId: 'seedream_4_0',
    addedAt: '2026-02-06',
    deprecated: true, // superseded by seedream-4.5 / seedream-5.0-lite
    workflow: 'seedream', buildPayload: buildSeedream40Payload,
    estimatedTime: { '1K': 12, '2K': 21, '4K': 58 },
    mode: 'image', inputType: 't2i',
    description: 'Reliable all-purpose generation with readable text overlay.',
    features: [feat('Multi-Image Input', 'input'), feat('4K', 'resolution')],
    paramConfig: {
      ...params.resolution(['1K', '2K', '4K']),
      ...seedreamV2Params,
    },
  },
]);

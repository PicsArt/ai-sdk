/**
 * Hailuo (MiniMax Video) — single source of truth.
 * NOTE: Provider is 'minimax' (not 'hailuo') in the backend.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

/** T2V payload — prompt + prompt_optimizer + optional duration (standard only). */
const buildT2V = (withDuration: boolean): PayloadBuilder => (ctx) => ({
  prompt: ctx.prompt,
  ...(ctx.enhancePrompt !== undefined ? { prompt_optimizer: ctx.enhancePrompt } : {}),
  ...(withDuration && ctx.duration ? { duration: String(ctx.duration) } : {}),
});

/** I2V payload — prompt + image_url + prompt_optimizer + optional duration (standard only). */
const buildI2V = (withDuration: boolean): PayloadBuilder => (ctx) => ({
  prompt: ctx.prompt,
  image_url: ctx.imageUrls?.[0],
  ...(ctx.enhancePrompt !== undefined ? { prompt_optimizer: ctx.enhancePrompt } : {}),
  ...(withDuration && ctx.duration ? { duration: String(ctx.duration) } : {}),
});

/** Shared base (mode + common params). Workflow set per-model. */
const base = {
  mode: 'video' as const,
} as const;

export const { MODELS } = defineModels('minimax', [
  {
    ...base, id: 'hailuo-2.3', name: 'Hailuo 2.3', modelId: 'hailuo-2.3',
    addedAt: '2026-02-06',
    inputType: 't2v' as const,
    workflow: 'minimax/hailuo-2.3/standard/text-to-video',
    editWorkflow: 'minimax/hailuo-2.3/standard/image-to-video',
    buildPayload: buildT2V(true),
    buildEditPayload: buildI2V(true),
    estimatedTime: 150,
    description: 'Stylized 720p animation with strong character expression and emotion.',
    features: [feat('Image Input', 'input'), feat('Start Frame', 'frame'), feat('720p', 'resolution'), feat('10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.enhancePrompt(),
      ...params.duration([6, 10]),
      ...params.imageInput(),
    },
  },
  {
    ...base, id: 'hailuo-2.3-pro', name: 'Hailuo 2.3 Pro', modelId: 'hailuo-2.3-pro',
    addedAt: '2026-02-06',
    inputType: 't2v' as const,
    workflow: 'minimax/hailuo-2.3/pro/text-to-video',
    editWorkflow: 'minimax/hailuo-2.3/pro/image-to-video',
    buildPayload: buildT2V(false),
    buildEditPayload: buildI2V(false),
    estimatedTime: 165,
    description: '1080p output focused on detailed scenes and polished short-form content.',
    features: [feat('Image Input', 'input'), feat('Start Frame', 'frame'), feat('1080p', 'resolution'), feat('6 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.enhancePrompt(),
      ...params.imageInput(),
    },
  },
  {
    ...base, id: 'hailuo-2.3-fast', name: 'Hailuo 2.3 Fast', modelId: 'hailuo-2.3-fast',
    addedAt: '2026-02-06',
    inputType: 'i2v' as const,
    workflow: 'minimax/hailuo-2.3-fast/standard/image-to-video',
    buildPayload: buildI2V(true),
    estimatedTime: 173,
    description: 'Quick 720p previews with expressive characters for rapid experimentation.',
    features: [feat('Image Input', 'input'), feat('Start Frame', 'frame'), feat('720p', 'resolution'), feat('10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.enhancePrompt(),
      ...params.duration([6, 10]),
      ...params.imageInput(1, 'Start Image', true),
    },
  },
  {
    ...base, id: 'hailuo-2.3-fast-pro', name: 'Hailuo 2.3 Fast Pro', modelId: 'hailuo-2.3-fast-pro',
    addedAt: '2026-02-06',
    inputType: 'i2v' as const,
    workflow: 'minimax/hailuo-2.3-fast/pro/image-to-video',
    buildPayload: buildI2V(false),
    estimatedTime: 162,
    description: 'Fast 1080p output for short, polished clips with varied styles.',
    features: [feat('Image Input', 'input'), feat('Start Frame', 'frame'), feat('1080p', 'resolution'), feat('6 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.enhancePrompt(),
      ...params.imageInput(1, 'Start Image', true),
    },
  },
]);

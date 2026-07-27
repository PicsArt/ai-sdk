/**
 * Qwen — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

// ── Size map (Qwen API expects WxH string, 512–2048 px) ────────────

const QWEN_SIZE_MAP: Record<string, string> = {
  '1024x1024': '1024x1024', '1024x768': '1024x768', '768x1024': '768x1024',
  '1536x1024': '1536x1024', '1024x1536': '1024x1536', '2048x2048': '2048x2048',
};

// ── Qwen v1 recommended sizes (API format uses *, we store as x) ────
const QWEN_V1_SIZES: string[] = [
  '2048x2048', '2688x1536', '1536x2688', '2368x1728', '1728x2368',
];

/** Qwen T2I/I2I — prompt + optional single image_url. */
export const buildQwenPayload: PayloadBuilder = (ctx) => {
  const hasImages = Array.isArray(ctx.imageUrls) && ctx.imageUrls.length > 0;
  return {
    prompt: ctx.prompt,
    ...(hasImages ? { image_url: ctx.imageUrls![0] } : {}),
  };
};

/** Qwen 2 T2I/I2I — prompt + image_urls array (edit expects array, not singular). */
export const buildQwen2Payload: PayloadBuilder = (ctx) => {
  const hasImages = Array.isArray(ctx.imageUrls) && ctx.imageUrls.length > 0;
  return {
    prompt: ctx.prompt,
    ...(hasImages ? { image_urls: ctx.imageUrls } : {}),
  };
};

/** Qwen Edit Plus — prompt + image_urls array (max 3) + optional size. */
export const buildQwenEditPlusPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  image_urls: ctx.imageUrls ?? [],
  ...(ctx.size && QWEN_SIZE_MAP[ctx.size] ? { size: QWEN_SIZE_MAP[ctx.size] } : {}),
});

/** Qwen v1 T2I/I2I — shared builder parameterised by model name. */
const buildQwenV1 = (model: string): PayloadBuilder => (ctx) => {
  const hasImages = Array.isArray(ctx.imageUrls) && ctx.imageUrls.length > 0;
  return {
    prompt: ctx.prompt,
    model,
    ...(hasImages ? { image_urls: ctx.imageUrls } : {}),
    ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
    size: (ctx.resolution ?? '2048x2048').replace('x', '*'),
    n: ctx.count ?? 1,
    prompt_extend: ctx.enhancePrompt ?? true,
    // Qwen 3.0 only — prompt-rewrite strategy (direct/agent); 2.x ignores it.
    ...(ctx.promptExtendMode ? { prompt_extend_mode: ctx.promptExtendMode } : {}),
    watermark: false,
    ...(ctx.seed != null ? { seed: ctx.seed } : {}),
  };
};

const qwenV1Params = {
  ...params.prompt({ maxLength: 800 }),
  ...params.negativePrompt(),
  ...params.resolution(QWEN_V1_SIZES, '2048x2048'),
  ...params.count([1, 2, 4, 6]),
  ...params.enhancePrompt(true),
  ...params.imageInput(3, 'Source Images'),
};

// Qwen 3.0 adds the prompt-rewrite mode selector on top of the v1 params.
const qwenV1Params3 = {
  ...qwenV1Params,
  ...p.enum('promptExtendMode', ['direct', 'agent'], 'direct'),
};

export const { MODELS } = defineModels('qwen', [
  {
    id: 'qwen', name: 'Qwen',
    addedAt: '2026-02-06',
    deprecated: true, // superseded by qwen-2 / qwen-2-pro / qwen-edit-plus
    workflow: 'qwen-image', editWorkflow: 'qwen-image/image-to-image',
    buildPayload: buildQwenPayload,
    estimatedTime: 12,
    mode: 'image', inputType: 't2i',
    description: 'Clean 1K images from text or an image reference.',
    features: [feat('Image Input', 'input'), feat('1K', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...params.count(),
      ...params.imageInput(1, 'Source Image'),
    },
  },
  {
    id: 'qwen-image-2', name: 'Qwen 2',
    addedAt: '2026-03-27',
    workflow: 'qwen-image-2/text-to-image', editWorkflow: 'qwen-image-2/edit',
    buildPayload: buildQwen2Payload,
    estimatedTime: 30,
    mode: 'image', inputType: 't2i',
    description: 'Next-gen image generation with improved realism and typography.',
    features: [feat('Image Input', 'input'), feat('Typography', 'characteristic'), feat('1K', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...params.count(),
      ...params.imageInput(1, 'Source Image'),
    },
  },
  {
    id: 'qwen-image-2-pro', name: 'Qwen 2 Pro',
    addedAt: '2026-03-27',
    workflow: 'qwen/v1/text-to-image',
    editWorkflow: 'qwen/v1/image-to-image',
    buildPayload: buildQwenV1('qwen-image-2.0-pro-2026-04-22'),
    estimatedTime: 60,
    mode: 'image', inputType: 't2i',
    badge: ['premium'],
    description: 'Premium Qwen 2 (2026-04-22) with highest quality output.',
    features: [
      feat('Image Input', 'input'),
      feat('Negative Prompt', 'characteristic'),
      feat('2K', 'resolution'),
    ],
    paramConfig: qwenV1Params,
  },
  {
    id: 'qwen-image-3.0', name: 'Qwen 3.0',
    addedAt: '2026-07-27',
    release: 'preview',
    workflow: 'qwen/v1/text-to-image',
    editWorkflow: 'qwen/v1/image-to-image',
    buildPayload: buildQwenV1('qwen-image-3.0'),
    estimatedTime: 90,
    mode: 'image', inputType: 't2i',
    description: 'Qwen-Image 3.0 — highest-fidelity text-to-image and image editing with a selectable prompt-rewrite mode.',
    features: [
      feat('Image Input', 'input'),
      feat('Negative Prompt', 'characteristic'),
      feat('2K', 'resolution'),
    ],
    paramConfig: qwenV1Params3,
  },
  {
    id: 'qwen-image-edit-plus', name: 'Qwen Edit Plus',
    addedAt: '2026-02-06',
    workflow: 'qwen-image-edit-plus', buildPayload: buildQwenEditPlusPayload,
    estimatedTime: 11,
    mode: 'image', inputType: 'i2i',
    description: 'Edit or transform up to 3 source images with prompt-guided changes.',
    features: [feat('Image Input', 'input')],
    paramConfig: {
      ...params.prompt(),
      // size: Qwen edit-plus API ignores size param — output is always 1024x1024
      ...params.imageInput(3, 'Source Images', true),
    },
  },
]);

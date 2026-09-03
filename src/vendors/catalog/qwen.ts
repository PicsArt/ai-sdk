/**
 * Qwen — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

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
    num_images: ctx.count ?? 1,
    ...(hasImages ? { image_urls: ctx.imageUrls } : {}),
  };
};

/** Qwen v1 T2I/I2I — shared builder parameterised by model name. */
const buildQwenV1 = (model: string): PayloadBuilder => (ctx) => {
  const hasImages = Array.isArray(ctx.imageUrls) && ctx.imageUrls.length > 0;
  // 'agent' rewrite (APE) is T2I-only for the whole 3.0 family — the vendor
  // returns 400 when it is used on image-edit requests.
  const promptExtendMode =
    ctx.promptExtendMode === 'agent' && hasImages && model.startsWith('qwen-image-3.0')
      ? undefined
      : ctx.promptExtendMode;
  const promptExtend = ctx.enhancePrompt ?? true;
  return {
    prompt: ctx.prompt,
    model,
    ...(hasImages ? { image_urls: ctx.imageUrls } : {}),
    ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
    // I2I: omit size — the vendor auto-matches the input image's aspect ratio,
    // and the SDK's ~4MP presets exceed the current I2I ceiling.
    ...(hasImages ? {} : { size: (ctx.resolution ?? '2048x2048').replace('x', '*') }),
    n: ctx.count ?? 1,
    prompt_extend: promptExtend,
    // Qwen 3.0 family only — prompt-rewrite strategy (direct/agent); 2.x ignores it.
    ...(promptExtendMode ? { prompt_extend_mode: promptExtendMode } : {}),
    // Qwen 3.0 family only — thinking mode; the vendor requires prompt_extend=true.
    ...(ctx.enableThinking != null && promptExtend ? { enable_thinking: ctx.enableThinking } : {}),
    watermark: false,
    ...(ctx.seed != null ? { seed: ctx.seed } : {}),
  };
};

const qwenV1Params = {
  ...params.prompt({ maxLength: 800 }),
  ...params.negativePrompt(undefined, 500),
  ...params.resolution(QWEN_V1_SIZES, '2048x2048'),
  ...params.count([1, 2, 4, 6]),
  ...params.enhancePrompt(true),
  ...params.imageInput(3, 'Source Images'),
  ...params.seed(),
};

// Qwen 3.0 family adds the prompt-rewrite mode selector and thinking mode
// on top of the v1 params.
const qwenV1Params3 = {
  ...qwenV1Params,
  ...p.enum('promptExtendMode', ['direct', 'agent'], 'direct'),
  ...p.boolean('enableThinking', true, 'Deep Thinking'),
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
      ...params.imageInput(1, 'Source Image'),
    },
  },
  {
    id: 'qwen-image-2', name: 'Qwen 2',
    addedAt: '2026-03-27',
    deprecated: true, // fal marks both endpoints 'no longer supported' — use qwen-image-3.0
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
    id: 'qwen-image-3.0-pro', name: 'Qwen 3.0 Pro',
    addedAt: '2026-08-31',
    workflow: 'qwen/v1/text-to-image',
    editWorkflow: 'qwen/v1/image-to-image',
    buildPayload: buildQwenV1('qwen-image-3.0-pro'),
    estimatedTime: 90,
    mode: 'image', inputType: 't2i',
    badge: ['premium'],
    description: 'Qwen-Image 3.0 Pro (GA) — flagship text-to-image and image editing with prompt-rewrite modes and thinking mode.',
    features: [
      feat('Image Input', 'input'),
      feat('Negative Prompt', 'characteristic'),
      feat('2K', 'resolution'),
    ],
    paramConfig: qwenV1Params3,
  },
]);

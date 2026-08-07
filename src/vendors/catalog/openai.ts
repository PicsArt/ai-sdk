/**
 * OpenAI — single source of truth (image).
 */
import type { Constraint, PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

// ── Payload builders ────────────────────────────────────────────────

const GPT_IMAGE_AR_TO_SIZE: Record<string, string> = {
  '1:1': '1024x1024',
  '3:2': '1536x1024',
  '2:3': '1024x1536',
  '16:9': '1536x1024',  // closest supported landscape
  '9:16': '1024x1536',  // closest supported portrait
  '4:3': '1536x1024',
  '3:4': '1024x1536',
};

// gpt-image-2 requires both dimensions divisible by 16. Keep the short side
// at 1024 and round the long side to the nearest multiple of 16.
// The wide ratios (16:9, 9:16, 4:3, 3:4) are valid for t2i only — the edit
// endpoint accepts only the first three plus a special 'auto' value.
const GPT_IMAGE_2_AR_TO_SIZE: Record<string, string> = {
  '1:1': '1024x1024',
  '3:2': '1536x1024',
  '2:3': '1024x1536',
  '16:9': '1824x1024',
  '9:16': '1024x1824',
  '4:3': '1360x1024',
  '3:4': '1024x1360',
};

/** Generate payload for openai-images-generate pluggable workflow. */
export const buildGptImage1Payload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  model: 'gpt-image-1',
  n: ctx.count ?? 1,
  size: ctx.size ?? GPT_IMAGE_AR_TO_SIZE[ctx.aspectRatio ?? ''] ?? '1024x1024',
  quality: ctx.quality ?? 'high',
  ...(ctx.background ? { background: ctx.background } : {}),
  ...(ctx.outputFormat ? { output_format: ctx.outputFormat } : {}),
});

/** Edit payload for openai-image-editing pluggable workflow. */
export const buildGptImage1EditPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  model: 'gpt-image-1',
  images: ctx.imageUrls ?? [],
  n: ctx.count ?? 1,
  size: ctx.size ?? GPT_IMAGE_AR_TO_SIZE[ctx.aspectRatio ?? ''] ?? '1024x1024',
  quality: ctx.quality ?? 'high',
  ...(ctx.background ? { background: ctx.background } : {}),
  ...(ctx.outputFormat ? { output_format: ctx.outputFormat } : {}),
});

/** Generate payload for openai-images-generate pluggable workflow. */
export const buildGptImage15Payload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  model: 'gpt-image-1.5',
  n: ctx.count ?? 1,
  size: ctx.size ?? GPT_IMAGE_AR_TO_SIZE[ctx.aspectRatio ?? ''] ?? '1024x1024',
  quality: ctx.quality ?? 'high',
  ...(ctx.background ? { background: ctx.background } : {}),
  ...(ctx.outputFormat ? { output_format: ctx.outputFormat } : {}),
});

/** Edit payload for openai-image-editing pluggable workflow. */
export const buildGptImage15EditPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  model: 'gpt-image-1.5',
  images: ctx.imageUrls ?? [],
  n: ctx.count ?? 1,
  size: ctx.size ?? GPT_IMAGE_AR_TO_SIZE[ctx.aspectRatio ?? ''] ?? '1024x1024',
  quality: ctx.quality ?? 'high',
  ...(ctx.background ? { background: ctx.background } : {}),
  ...(ctx.outputFormat ? { output_format: ctx.outputFormat } : {}),
});

/** Generate payload for openai-images-generate pluggable workflow.
 *  'auto' is rejected by the t2i endpoint — the constraint forbids picking it
 *  in t2i mode, but if a stale value sneaks through we fall back to 1024x1024. */
export const buildGptImage2Payload: PayloadBuilder = (ctx) => {
  const ar = ctx.aspectRatio ?? '';
  const mappedSize = ar === 'auto' ? undefined : GPT_IMAGE_2_AR_TO_SIZE[ar];
  return {
    prompt: ctx.prompt,
    model: 'gpt-image-2',
    n: ctx.count ?? 1,
    size: ctx.size ?? mappedSize ?? '1024x1024',
    quality: ctx.quality ?? 'high',
    ...(ctx.background ? { background: ctx.background } : {}),
    ...(ctx.outputFormat ? { output_format: ctx.outputFormat } : {}),
  };
};

/** Edit payload for openai-image-editing pluggable workflow. */
export const buildGptImage2EditPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  model: 'gpt-image-2',
  images: ctx.imageUrls ?? [],
  n: ctx.count ?? 1,
  size: ctx.aspectRatio === 'auto' ? 'auto' : GPT_IMAGE_2_AR_TO_SIZE[ctx.aspectRatio ?? ''] ?? 'auto',
  quality: ctx.quality ?? 'high',
  ...(ctx.background ? { background: ctx.background } : {}),
  ...(ctx.outputFormat ? { output_format: ctx.outputFormat } : {}),
});

/** gpt-image-2: t2i and edit endpoints accept different aspect-ratio sets. */
const gptImage2Constraints: Constraint[] = [
  {
    when: { imageUrls: { exists: true } },
    then: { aspectRatio: { allowed: ['1:1', '3:2', '2:3', 'auto'], reason: 'Image edit supports only square / 3:2 / 2:3 or auto.' } },
  },
  {
    when: { imageUrls: { exists: false } },
    then: { aspectRatio: { allowed: ['1:1', '3:2', '2:3', '16:9', '9:16', '4:3', '3:4'], reason: '"Auto" requires a source image — upload one to use it.' } },
  },
];

/** Transparent background needs an alpha-capable format — the API rejects
 *  `transparent` + `jpeg` (boundary-verified). Applies to models that expose
 *  a transparent background (gpt-image-1.5 / gpt-image-1). */
const gptImageBgConstraints: Constraint[] = [
  {
    when: { background: { is: 'transparent' } },
    then: { outputFormat: { allowed: ['png', 'webp'], reason: 'Transparent background needs PNG or WEBP — JPEG has no alpha channel.' } },
  },
];

export const { MODELS } = defineModels('openai', [
  // ── Image ─────────────────────────────────────────
  {
    id: 'gpt-image-2', name: 'GPT Image 2', modelId: 'gpt-image-2',
    addedAt: '2026-04-21',
    workflow: 'openai-images-generate', editWorkflow: 'openai-image-editing',
    buildPayload: buildGptImage2Payload, buildEditPayload: buildGptImage2EditPayload,
    estimatedTime: 50,
    mode: 'image', inputType: 't2i',
    description: 'Next-gen GPT image model with arbitrary output dimensions and multi-image input.',
    features: [feat('Multi-Image Input', 'input'), feat('High Quality', 'quality')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(['1:1', '3:2', '2:3', '16:9', '9:16', '4:3', '3:4', 'auto'], '1:1'),
      ...p.quality(['high', 'medium', 'low'], 'high'),
      // gpt-image-2 supports only an opaque background — the API rejects
      // `transparent` for this model (boundary-verified), so no selector here.
      ...p.enum('outputFormat', ['png', 'jpeg', 'webp'], 'png', { label: 'Format' }),
      ...params.count(),
      ...params.imageInput(5, 'Source Images'),
    },
    constraints: gptImage2Constraints,
  },
  {
    id: 'gpt-image-1.5', name: 'GPT Image 1.5', modelId: 'gpt-image-1.5',
    addedAt: '2026-02-06',
    workflow: 'openai-images-generate', editWorkflow: 'openai-image-editing',
    buildPayload: buildGptImage15Payload, buildEditPayload: buildGptImage15EditPayload,
    estimatedTime: 50,
    mode: 'image', inputType: 't2i',
    description: 'Strong text-in-image and infographic rendering with multi-image input.',
    features: [feat('Multi-Image Input', 'input'), feat('High Quality', 'quality')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(['1:1', '3:2', '2:3', '16:9', '9:16', '4:3', '3:4'], '1:1'),
      ...p.quality(['high', 'medium', 'low'], 'high'),
      ...p.enum('background', ['opaque', 'transparent'], 'opaque', { label: 'Background' }),
      ...p.enum('outputFormat', ['png', 'jpeg', 'webp'], 'png', { label: 'Format' }),
      ...params.count(),
      ...params.imageInput(5, 'Source Images'),
    },
    constraints: gptImageBgConstraints,
  },
  {
    id: 'gpt-image-1', name: 'GPT Image 1', modelId: 'gpt-image-1',
    addedAt: '2026-03-13',
    deprecated: true, // superseded by gpt-image-1.5 / gpt-image-2
    workflow: 'openai-images-generate', editWorkflow: 'openai-image-editing',
    buildPayload: buildGptImage1Payload, buildEditPayload: buildGptImage1EditPayload,
    estimatedTime: 40,
    mode: 'image', inputType: 't2i',
    description: 'Original GPT image model with quality-tiered generation.',
    features: [feat('Multi-Image Input', 'input')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(['1:1', '3:2', '2:3', '16:9', '9:16', '4:3', '3:4'], '1:1'),
      ...p.quality(['high', 'medium', 'low'], 'high'),
      ...p.enum('background', ['opaque', 'transparent'], 'opaque', { label: 'Background' }),
      ...p.enum('outputFormat', ['png', 'jpeg', 'webp'], 'png', { label: 'Format' }),
      ...params.count(),
      ...params.imageInput(5, 'Source Images'),
    },
    constraints: gptImageBgConstraints,
  },
]);

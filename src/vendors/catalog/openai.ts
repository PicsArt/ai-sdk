/**
 * OpenAI — single source of truth (image).
 */
import type { Constraint, InputValidator, PayloadBuilder } from '../../core/types.ts';
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
// The gpt-image-2.5 models share the same 16px grid but drop the edit-side
// restriction: their edit endpoint takes the wide sizes and 'auto' alike
// (boundary-verified), so they reuse this map on both routes.
export const GPT_IMAGE_2_AR_TO_SIZE: Record<string, string> = {
  '1:1': '1024x1024',
  '3:2': '1536x1024',
  '2:3': '1024x1536',
  '16:9': '1824x1024',
  '9:16': '1024x1824',
  '4:3': '1360x1024',
  '3:4': '1024x1360',
};

/**
 * gpt-image-2.5 output sizes by resolution tier, then aspect ratio. `1K` is
 * the 16px map above (short side 1024), so a request without a tier keeps
 * the size it always had. `2K` and `4K` are the largest exact-ratio sizes on
 * the 16px grid within a pixel budget of 2048x2048 and 3840x2160 (8,294,400 px)
 * respectively — every entry also stays inside the custom-size rules below.
 */
export const GPT_IMAGE_25_SIZES: Record<string, Record<string, string>> = {
  '1K': GPT_IMAGE_2_AR_TO_SIZE,
  '2K': {
    '1:1': '2048x2048',
    '3:2': '2496x1664',
    '2:3': '1664x2496',
    '16:9': '2560x1440',
    '9:16': '1440x2560',
    '4:3': '2304x1728',
    '3:4': '1728x2304',
  },
  '4K': {
    '1:1': '2880x2880',
    '3:2': '3504x2336',
    '2:3': '2336x3504',
    '16:9': '3840x2160',
    '9:16': '2160x3840',
    '4:3': '3264x2448',
    '3:4': '2448x3264',
  },
};

/**
 * Custom `size` rules for the GPT image models that take arbitrary
 * `WIDTHxHEIGHT` values. OpenAI reference: "Width and height must be divisible
 * by 16, with aspect ratios between 1:3 and 3:1". The longest-edge cap is not
 * in the reference but enforced by the API ("The longest edge must be less
 * than or equal to 3840"). The total pixel count must also fall within
 * 655,360–8,294,400 (OpenAI image generation guide) — 3840x2160 at most.
 */
const GPT_IMAGE_SIZE_PATTERN = /^([1-9]\d*)x([1-9]\d*)$/;
const GPT_IMAGE_SIZE_GRID = 16;
const GPT_IMAGE_MAX_ASPECT_RATIO = 3;
const GPT_IMAGE_MAX_EDGE = 3840;
const GPT_IMAGE_MIN_PIXELS = 655_360;
const GPT_IMAGE_MAX_PIXELS = 8_294_400;

/** Why `size` is not an accepted custom size, or null when it is. */
export function gptImageSizeViolation(size: string): string | null {
  const match = GPT_IMAGE_SIZE_PATTERN.exec(size);
  if (!match) return 'must be WIDTHxHEIGHT, e.g. 2048x1152';
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (width % GPT_IMAGE_SIZE_GRID !== 0 || height % GPT_IMAGE_SIZE_GRID !== 0) {
    return `both dimensions must be divisible by ${GPT_IMAGE_SIZE_GRID}`;
  }
  const ratio = width / height;
  if (ratio > GPT_IMAGE_MAX_ASPECT_RATIO || ratio < 1 / GPT_IMAGE_MAX_ASPECT_RATIO) {
    return 'the aspect ratio must be between 1:3 and 3:1';
  }
  if (Math.max(width, height) > GPT_IMAGE_MAX_EDGE) {
    return `the longest edge must be at most ${GPT_IMAGE_MAX_EDGE}`;
  }
  const pixels = width * height;
  if (pixels < GPT_IMAGE_MIN_PIXELS || pixels > GPT_IMAGE_MAX_PIXELS) {
    return `the total pixel count must be between ${GPT_IMAGE_MIN_PIXELS} and ${GPT_IMAGE_MAX_PIXELS}`;
  }
  return null;
}

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
/** OpenAI Images API reference ("Create image"): the prompt's "maximum length is
 *  32000 characters for the GPT image models". fal's gpt-image-1.5 schema
 *  mirrors the same figure. */
const GPT_IMAGE_PROMPT_MAX = 32_000;

/** gpt-image-2.5 adds two tiers on top of the low/medium/high the older
 *  gpt-image models cap at. Ordered strongest-first for the picker. */
const GPT_IMAGE_25_QUALITIES = ['max', 'xhigh', 'high', 'medium', 'low'];

/** Both 2.5 routes accept every ratio in the 16px map plus 'auto' — unlike
 *  gpt-image-2, whose edit endpoint rejects the wide ones (boundary-verified),
 *  so these entries need no aspect-ratio constraint. */
const GPT_IMAGE_25_ASPECT_RATIOS = ['1:1', '3:2', '2:3', '16:9', '9:16', '4:3', '3:4', 'auto'];

/** Resolution tiers of {@link GPT_IMAGE_25_SIZES}. */
const GPT_IMAGE_25_RESOLUTIONS = Object.keys(GPT_IMAGE_25_SIZES);

/** The images/edits endpoint takes up to 16 inputs for the GPT image models. */
const GPT_IMAGE_25_MAX_INPUT_IMAGES = 16;

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

/** A `size` sets the exact output size and overrides the ratio and tier, so the
 *  UI disables them; `auto` lets the model pick the size, tier included. */
const gptImage25SizeConstraints: Constraint[] = [
  {
    when: { size: { exists: true } },
    then: {
      aspectRatio: { disabled: true, reason: 'A custom size sets the output size.' },
      resolution: { disabled: true, reason: 'A custom size sets the output size.' },
    },
  },
  {
    when: { aspectRatio: { is: 'auto' } },
    then: { resolution: { disabled: true, reason: 'Auto lets the model pick the size.' } },
  },
];

const isGiven = (value: unknown): boolean =>
  value != null && !(typeof value === 'string' && value.trim().length === 0);

/**
 * gpt-image-2.5 takes the output size either way the caller prefers:
 * `aspectRatio` + `resolution`, or an exact `size`. A given `size` wins and the
 * other two are ignored (see `resolveSize` in openai.payloads.ts), so only its
 * format needs checking.
 */
const validateGptImage25Input: InputValidator = (input) => {
  if (!isGiven(input.size)) return;
  const violation = gptImageSizeViolation(String(input.size).trim());
  if (violation) throw new Error(`"size" ${violation}`);
};

export const { MODELS } = defineModels('openai', [
  // ── Image ─────────────────────────────────────────
  {
    id: 'gpt-image-2.5-sunburst', name: 'GPT Image 2.5 Sunburst',
    addedAt: '2026-09-09',
    workflow: 'openai-images-generate', editWorkflow: 'openai-image-editing',
    estimatedTime: 60,
    mode: 'image', inputType: 't2i',
    description: 'Most capable GPT Image tier — premium edits and campaign-grade output, with longer generation times.',
    features: [feat('Multi-Image Input', 'input'), feat('High Quality', 'quality')],
    paramConfig: {
      ...params.prompt({ maxLength: GPT_IMAGE_PROMPT_MAX }),
      ...params.aspectRatio(GPT_IMAGE_25_ASPECT_RATIOS, '1:1'),
      ...params.resolution(GPT_IMAGE_25_RESOLUTIONS, '1K'),
      ...p.text('size', { label: 'Custom Size', placeholder: 'WIDTHxHEIGHT, e.g. 2048x1152' }),
      ...p.quality(GPT_IMAGE_25_QUALITIES, 'high'),
      ...p.enum('background', ['opaque', 'transparent'], 'opaque', { label: 'Background' }),
      ...p.enum('outputFormat', ['png', 'jpeg', 'webp'], 'png', { label: 'Format' }),
      ...params.count(),
      ...params.imageInput(GPT_IMAGE_25_MAX_INPUT_IMAGES, 'Source Images'),
    },
    constraints: [...gptImageBgConstraints, ...gptImage25SizeConstraints],
    validateInput: validateGptImage25Input,
  },
  {
    id: 'gpt-image-2.5-flare', name: 'GPT Image 2.5 Flare',
    addedAt: '2026-09-09',
    workflow: 'openai-images-generate', editWorkflow: 'openai-image-editing',
    estimatedTime: 25,
    mode: 'image', inputType: 't2i',
    description: 'Fast GPT Image tier — everyday generation at roughly half the latency of GPT Image 2.',
    features: [feat('Multi-Image Input', 'input'), feat('Fast', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: GPT_IMAGE_PROMPT_MAX }),
      ...params.aspectRatio(GPT_IMAGE_25_ASPECT_RATIOS, '1:1'),
      ...params.resolution(GPT_IMAGE_25_RESOLUTIONS, '1K'),
      ...p.text('size', { label: 'Custom Size', placeholder: 'WIDTHxHEIGHT, e.g. 2048x1152' }),
      ...p.quality(GPT_IMAGE_25_QUALITIES, 'high'),
      ...p.enum('background', ['opaque', 'transparent'], 'opaque', { label: 'Background' }),
      ...p.enum('outputFormat', ['png', 'jpeg', 'webp'], 'png', { label: 'Format' }),
      ...params.count(),
      ...params.imageInput(GPT_IMAGE_25_MAX_INPUT_IMAGES, 'Source Images'),
    },
    constraints: [...gptImageBgConstraints, ...gptImage25SizeConstraints],
    validateInput: validateGptImage25Input,
  },
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
      ...params.prompt({ maxLength: GPT_IMAGE_PROMPT_MAX }),
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
      ...params.prompt({ maxLength: GPT_IMAGE_PROMPT_MAX }),
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
      ...params.prompt({ maxLength: GPT_IMAGE_PROMPT_MAX }),
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

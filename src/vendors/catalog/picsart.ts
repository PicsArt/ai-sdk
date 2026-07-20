/**
 * Picsart — single source of truth.
 */
import type { PayloadBuilder, RuntimeSchema } from '../../core/types.ts';
import { resolveImageSize } from '../../core/helpers.ts';
import { defineModels, feat, params } from '../define.ts';
import { FLUX_AR_TO_SIZE } from './flux.ts';

const MAX_WORDS = 77;
const truncateWords = (text: string) => {
  const words = text.split(/\s+/);
  return words.length <= MAX_WORDS ? text : words.slice(0, MAX_WORDS).join(' ');
};

export const buildChangeBgPayload: PayloadBuilder = (ctx) => ({
  imageUrl: ctx.imageUrls?.[0] ?? '',
  prompt: truncateWords(ctx.prompt),
  count: 1,
});

const buildRemoveBgPayload: PayloadBuilder = (ctx) => ({
  photo: ctx.imageUrls?.[0] ?? '',
  postprocess_image: true,
  model: 'model-sod-v8-2',
});

/** SOD returns { id, data: { alpha, image } } — extract the processed image URL. */
const sodOutputSchema: RuntimeSchema<unknown> = {
  parse(output: unknown) {
    const obj = output as Record<string, unknown> | undefined;
    const data = obj?.data as Record<string, unknown> | undefined;
    const url = data?.image;
    if (typeof url !== 'string') throw new Error('No image URL in remove-bg response');
    return { url };
  },
};

const buildEnhancePayload: PayloadBuilder = (ctx) => ({
  image: ctx.imageUrls?.[0] ?? '',
  upscale: { enabled: true, target_scale: 2 },
  face_enhancement: { enabled: true },
  colour_correction: { enabled: false },
  output_format: 'PNG',
});

/** Qwen Image Edit / Qwen Makeup (pcp/v*) — `image` accepts string or string[]. */
const buildPcpQwenEditPayload: PayloadBuilder = (ctx) => {
  const urls = ctx.imageUrls ?? [];
  const imagePart = urls.length > 1 ? { image: urls } : urls.length === 1 ? { image: urls[0] } : {};
  return {
    ...imagePart,
    ...(ctx.prompt ? { prompt: ctx.prompt } : {}),
    ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
  };
};

/** Qwen Angle (pcp/v1/qwen-image-edit-angle) — image edit plus caller-overridable
 *  inference steps, guidance scale, and LoRA weights. Defaults are applied server-side. */
const buildPcpQwenAnglePayload: PayloadBuilder = (ctx) => {
  const c = ctx as typeof ctx & { numInferenceSteps?: number; loraWeights?: Record<string, number> };
  return {
    ...buildPcpQwenEditPayload(ctx),
    ...(c.numInferenceSteps != null ? { num_inference_steps: c.numInferenceSteps } : {}),
    ...(ctx.cfgScale != null ? { guidance_scale: ctx.cfgScale } : {}),
    ...(c.loraWeights ? { lora_params: { lora_weights: c.loraWeights, keep_other_weights: false } } : {}),
  };
};

/** FLUX.2-klein (pcp/v1/flux-text-to-image) — prompt + optional images[] + width/height (multiples of 16). */
const buildPcpFluxKleinPayload: PayloadBuilder = (ctx) => {
  const size = resolveImageSize(ctx, FLUX_AR_TO_SIZE);
  const [w, h] = size ? size.split('x').map((n) => parseInt(n)) : [1024, 1024];
  return {
    prompt: ctx.prompt,
    width: w,
    height: h,
    ...(ctx.imageUrls?.length ? { images: ctx.imageUrls.slice(0, 3) } : {}),
  };
};

/**
 * SANA-Sprint AR→size map. 1024-anchored, all dimensions /64 and inside the
 * backend's 256..2048 range. Ratios mirror the broader `recraftAspectRatios`
 * set so users get the same options they see across other image models.
 */
const SANA_AR_TO_SIZE: Record<string, string> = {
  '1:1':  '1024x1024',
  '4:3':  '1024x768',
  '3:4':  '768x1024',
  '3:2':  '1152x768',
  '2:3':  '768x1152',
  '16:9': '1344x768',
  '9:16': '768x1344',
  '2:1':  '1408x704',
  '1:2':  '704x1408',
};

/** SANA-Sprint (pcp/v1/sana-sprint) — fast Picsart T2I; AR drives width/height. */
const buildPcpSanaSprintPayload: PayloadBuilder = (ctx) => {
  const size = resolveImageSize(ctx, SANA_AR_TO_SIZE);
  const [w, h] = size ? size.split('x').map((n) => parseInt(n)) : [1024, 1024];
  return {
    model: 'picsart-sana-sprint-v1',
    prompt: ctx.prompt,
    width: w,
    height: h,
  };
};

export const { MODELS } = defineModels('picsart', [
  {
    id: 'picsart-change-bg', name: 'Picsart Change Background',
    addedAt: '2026-02-15',
    workflow: 'v4/smart-background', syncExecute: true,
    buildPayload: buildChangeBgPayload,
    mode: 'image', inputType: 'i2i',
    description: 'Swap the background of a photo using a text prompt for the new scene.',
    features: [feat('Background Replace', 'characteristic'), feat('Image Required', 'input')],
    paramConfig: {
      ...params.imageInput(1, 'Source Image', true),
      ...params.prompt({ maxLength: 460 }),
    },
  },
  {
    id: 'picsart-sod-v8-2', name: 'Remove Background',
    addedAt: '2026-04-02',
    workflow: 'pcp/v2/sod', syncExecute: true,
    buildPayload: buildRemoveBgPayload,
    outputSchema: sodOutputSchema,
    mode: 'image', inputType: 'i2i',
    description: 'Remove the background from any image with precision, leaving a clean cutout.',
    features: [feat('Background Remove', 'characteristic'), feat('Image Required', 'input')],
    paramConfig: { ...params.imageInput(1, 'Source Image', true) },
  },
  {
    id: 'picsart-enhance', name: 'Enhance',
    addedAt: '2026-04-02',
    workflow: 'pcp/v1/enhancement',
    buildPayload: buildEnhancePayload,
    mode: 'image', inputType: 'i2i',
    estimatedTime: 6,
    description: 'AI image enhancement with upscale and face enhancement.',
    features: [feat('Enhancement', 'quality'), feat('Image Required', 'input')],
    paramConfig: { ...params.imageInput(1, 'Source Image', true) },
  },
  {
    id: 'picsart-qwen-image-edit', name: 'Picsart Image Edit',
    addedAt: '2026-04-23',
    workflow: 'pcp/v1/qwen-image-edit',
    buildPayload: buildPcpQwenEditPayload,
    estimatedTime: 20,
    mode: 'image', inputType: 'i2i',
    description: 'General-purpose image editing for swaps, fixes, style changes, and creative edits.',
    features: [feat('Image Input', 'input'), feat('Multi-Ref', 'characteristic')],
    paramConfig: {
      ...params.imageInput(3, 'Source Images', true),
      ...params.prompt(),
      ...params.negativePrompt(),
    },
  },
  {
    id: 'picsart-qwen-makeup', name: 'Picsart Makeup',
    addedAt: '2026-04-23',
    workflow: 'pcp/v2/qwen-makeup',
    buildPayload: buildPcpQwenEditPayload,
    estimatedTime: 20,
    mode: 'image', inputType: 'i2i',
    description: 'Apply virtual makeup to portraits — lipstick, eye looks, blush, and full styled looks.',
    features: [feat('Image Input', 'input'), feat('Beauty', 'characteristic')],
    paramConfig: {
      ...params.imageInput(1, 'Portrait', true),
      ...params.prompt(),
      ...params.negativePrompt(),
    },
  },
  {
    id: 'picsart-qwen-image-edit-angle', name: 'Picsart Angle Change',
    addedAt: '2026-06-30',
    workflow: 'pcp/v1/qwen-image-edit-angle',
    buildPayload: buildPcpQwenAnglePayload,
    estimatedTime: 20,
    mode: 'image', inputType: 'i2i',
    description: 'Change the camera angle / viewpoint of a subject with automatic relighting.',
    features: [feat('Image Input', 'input'), feat('Multi-Ref', 'characteristic')],
    paramConfig: {
      ...params.imageInput(3, 'Source Images', true),
      ...params.prompt({ placeholder: 'e.g. front-left quarter view elevated shot medium shot' }),
      ...params.negativePrompt(),
      numInferenceSteps: {
        label: 'Inference Steps',
        descriptor: { kind: 'range', min: 1, max: 50, step: 1, default: 16 },
      },
      ...params.cfgScale(1, 10, 4),
      loraWeights: {
        label: 'LoRA Weights',
        descriptor: {
          kind: 'object',
          fields: {
            lora_angle: { kind: 'range', min: 0, max: 1, step: 0.1, default: 1, required: false },
            lora_angle_lighting: { kind: 'range', min: 0, max: 1, step: 0.1, default: 1, required: false },
          },
        },
      },
    },
  },
  {
    id: 'picsart-flux-2-klein', name: 'Flux 2 Klein 4B',
    addedAt: '2026-04-23',
    workflow: 'pcp/v1/flux-text-to-image',
    buildPayload: buildPcpFluxKleinPayload,
    estimatedTime: 8,
    mode: 'image', inputType: 't2i',
    badge: ['fast'] as const,
    description: 'Fast Flux 2 Klein 4B — up to 3 optional reference images.',
    features: [feat('Multi-Image Input', 'input'), feat('Fast', 'characteristic')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(Object.keys(FLUX_AR_TO_SIZE), '1:1'),
      ...params.imageInput(3, 'Reference Images'),
    },
  },
  {
    id: 'picsart-sana-sprint-v1', name: 'Picsart SANA-Sprint',
    addedAt: '2026-05-19',
    workflow: 'pcp/v1/sana-sprint', syncExecute: true,
    buildPayload: buildPcpSanaSprintPayload,
    estimatedTime: 3,
    mode: 'image', inputType: 't2i',
    badge: ['new', 'fast'] as const,
    description: 'Fast text-to-image generation powered by SANA-Sprint.',
    features: [feat('Text-to-Image', 'input'), feat('Fast', 'characteristic')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(Object.keys(SANA_AR_TO_SIZE), '1:1'),
    },
  },
]);

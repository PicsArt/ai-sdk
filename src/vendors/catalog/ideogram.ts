/**
 * Ideogram — single source of truth.
 */
import type { Constraint, PayloadBuilder } from '../../core/types.ts';
import type { ModelParams } from '../../core/descriptors/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

// ── Aspect ratio mapping ─────────────────────────────────────────────
// Pluggable workflow expects NxM format (e.g. "16x9"), not N:M.
const toIdeogramAr = (ar: string) => ar.replace(':', 'x');

// ── Payload builders ────────────────────────────────────────────────

/** T2I — flat params for ideogram-v3-generate pluggable workflow. */
export const buildIdeogramGeneratePayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  num_images: ctx.count ?? 1,
  style_type: ctx.style ?? 'GENERAL',
  magic_prompt_option: 'AUTO',
  aspect_ratio: toIdeogramAr(ctx.aspectRatio ?? '16:9'),
  ...(ctx.renderingSpeed ? { rendering_speed: ctx.renderingSpeed } : {}),
  ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
});

/** I2I — flat params for ideogram-v3-remix pluggable workflow. */
export const buildIdeogramRemixPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  image: ctx.imageUrls?.[0],
  num_images: ctx.count ?? 1,
  image_weight: ctx.imageWeight ?? 50,
  style_type: ctx.style ?? 'GENERAL',
  magic_prompt: 'AUTO',
  aspect_ratio: toIdeogramAr(ctx.aspectRatio ?? '16:9'),
  ...(ctx.renderingSpeed ? { rendering_speed: ctx.renderingSpeed } : {}),
  ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
});

/** Ideogram Character — character consistency via reference image. */
export const buildIdeogramCharacterPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  num_images: ctx.count ?? 1,
  resolution: ctx.resolution ?? '1024x1024',
  style_type: ctx.style ?? 'AUTO',
  ...(ctx.renderingSpeed ? { rendering_speed: ctx.renderingSpeed } : {}),
  ...(ctx.imageUrls?.length ? { character_reference_images: [ctx.imageUrls[0]] } : {}),
});

/** T2I — flat params for the ideogram/v4/generate pluggable workflow. */
export const buildIdeogramV4GeneratePayload: PayloadBuilder = (ctx) => ({
  text_prompt: ctx.prompt,
  ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
  ...(ctx.renderingSpeed ? { rendering_speed: ctx.renderingSpeed } : {}),
  ...(ctx.enableCopyrightDetection ? { enable_copyright_detection: true } : {}),
});

/**
 * I2I — flat params for the ideogram/v4/remix pluggable workflow.
 *
 * `resolution` is deliberately never sent. Ideogram 4.0 rejects `image_weight`
 * combined with a resolution that changes the source image's aspect ratio
 * ("Supply either image_weight or a resolution that changes the aspect ratio,
 * not both"), and the builder can't know the source's aspect ratio. Since
 * `imageWeight` always carries a default from paramConfig, sending both would
 * 400 on every non-matching source. Omitting `resolution` keeps the weight
 * slider live and lets the remix follow the input image's aspect ratio, which
 * is the expected behavior for an edit flow.
 */
export const buildIdeogramV4RemixPayload: PayloadBuilder = (ctx) => ({
  text_prompt: ctx.prompt,
  image: ctx.startFrame ?? ctx.imageUrls?.[0],
  ...(ctx.imageWeight != null ? { image_weight: ctx.imageWeight } : {}),
  ...(ctx.renderingSpeed ? { rendering_speed: ctx.renderingSpeed } : {}),
  ...(ctx.enableCopyrightDetection ? { enable_copyright_detection: true } : {}),
});

/** T2I — flat params for the ideogram/p-image/generate pluggable workflow. */
export const buildIdeogramPImagePayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  resolution: ctx.resolution ?? '1024x1024',
  rendering_speed: ctx.renderingSpeed ?? 'medium',
});

// ── Ideogram 4.5 ─────────────────────────────────────────────────────
// Payload builders live in ideogram.payloads.ts.

/** Vendor upload limits shared by every 4.5 image slot: 25 MB, aspect ratio 1:6–6:1. */
const IDEOGRAM_45_IMAGE_BOUNDS = {
  maxBytes: 25 * 1024 * 1024,
  minAspectRatio: 1 / 6,
  maxAspectRatio: 6,
};

/**
 * Output aspect ratios. The worker converts ratio + resolution tier into the
 * vendor's exact size. `auto` lets the vendor pick a 2K size; `source` keeps the
 * first image's own size (needs images).
 */
const IDEOGRAM_45_ASPECT_RATIOS = [
  'auto', 'source', '1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3',
  '5:4', '4:5', '8:5', '5:8', '2:1', '1:2', '3:1', '1:3',
];

/** Mask slot: same dimensions as the source image; black is edited, white is preserved. */
const ideogram45MaskParam = p.file('mask', 'image', {
  label: 'Mask', category: 'asset', ...IDEOGRAM_45_IMAGE_BOUNDS,
});

const ideogram45MagicPromptParam: ModelParams = {
  magicPrompt: {
    label: 'Magic Prompt',
    descriptor: {
      kind: 'enum',
      valueType: 'string',
      options: [
        { id: 'auto', label: 'Auto' },
        { id: 'on', label: 'On' },
        { id: 'off', label: 'Off (verbatim)' },
      ],
      default: 'auto',
    },
  },
};

const IDEOGRAM_45_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Both 4.5 endpoints since the public launch: `very_low` (fastest, cheapest) needs source images. */
const IDEOGRAM_45_QUALITIES = ['very_low', 'low', 'medium', 'high'];

const ideogram45Constraints: Constraint[] = [
  { when: { imageUrls: { exists: false } }, then: {
    aspectRatio: {
      allowed: IDEOGRAM_45_ASPECT_RATIOS.filter((ar) => ar !== 'source'),
      reason: '"Source" keeps the size of a source image.',
    },
    mask: { disabled: true, reason: 'A mask needs a source image.' },
    quality: { allowed: ['low', 'medium', 'high'], reason: 'Very low quality needs a source image.' },
  } },
  { when: { mask: { exists: true } }, then: {
    aspectRatio: { disabled: true, reason: 'A masked edit keeps the source image size.' },
    resolution: { disabled: true, reason: 'A masked edit keeps the source image size.' },
  } },
  { when: { aspectRatio: { is: 'auto' } }, then: {
    resolution: { disabled: true, reason: 'Auto picks a 2K size.' },
  } },
  { when: { aspectRatio: { is: 'source' } }, then: {
    resolution: { disabled: true, reason: 'The output keeps the source image size.' },
  } },
];

export const { MODELS } = defineModels('ideogram', [
  {
    id: 'ideogram-4-5', name: 'Ideogram 4.5',
    addedAt: '2026-09-28',
    workflow: 'ideogram/v4.5/generate',
    estimatedTime: 30,
    mode: 'image', inputType: 't2i',
    description: 'Ideogram 4.5 — text-to-image and drift-free iterative editing with up to 4 reference images and an optional mask.',
    features: [feat('Reference Images', 'input'), feat('Masked Edit', 'input'), feat('2K', 'resolution')],
    constraints: ideogram45Constraints,
    paramConfig: {
      ...params.prompt({ maxLength: 10_000 }),
      // imageUrls[0] is the source image to edit; the rest are references ("image 2", "image 3"…).
      // With a mask the vendor allows at most 4 images.
      ...params.imageInput(5, 'Images', false, 'reference', IDEOGRAM_45_IMAGE_BOUNDS),
      ...ideogram45MaskParam,
      ...params.aspectRatio(IDEOGRAM_45_ASPECT_RATIOS, 'auto'),
      ...params.resolution(['1K', '2K'], '2K'),
      ...ideogram45MagicPromptParam,
      ...p.quality(IDEOGRAM_45_QUALITIES, 'high'),
      ...params.count(IDEOGRAM_45_COUNTS, 1),
      ...params.seed(),
      ...p.boolean('enableCopyrightDetection', false, 'Copyright Detection'),
    },
  },
  {
    id: 'ideogram-4-5-precise-edit', name: 'Ideogram 4.5 Precise Edit',
    addedAt: '2026-09-28',
    workflow: 'ideogram/v4.5/precise-edit',
    estimatedTime: 40,
    mode: 'image', inputType: 'i2i',
    description: 'Ideogram 4.5 precise edit — change one area and keep the rest of the image pixel-intact, optionally with a mask and reference images.',
    features: [feat('Precise Edit', 'input'), feat('Masked Edit', 'input'), feat('Reference Images', 'input')],
    paramConfig: {
      ...params.prompt({ maxLength: 10_000 }),
      ...params.startFrame('Source Image', true, IDEOGRAM_45_IMAGE_BOUNDS),
      ...ideogram45MaskParam,
      // With a mask the vendor allows at most 3 references.
      ...params.imageInput(4, 'Reference Images', false, 'reference', IDEOGRAM_45_IMAGE_BOUNDS),
      ...p.quality(IDEOGRAM_45_QUALITIES, 'medium'),
      ...params.count(IDEOGRAM_45_COUNTS, 1),
      ...params.seed(),
      ...p.boolean('enableCopyrightDetection', false, 'Copyright Detection'),
    },
  },
  {
    id: 'ideogram-v4', name: 'Ideogram 4.0',
    addedAt: '2026-06-03',
    workflow: 'ideogram/v4/generate', editWorkflow: 'ideogram/v4/remix',
    buildPayload: buildIdeogramV4GeneratePayload, buildEditPayload: buildIdeogramV4RemixPayload,
    estimatedTime: 20,
    mode: 'image', inputType: 't2i',
    description: "Ideogram's latest model — class-leading text rendering at up to ~3K resolution.",
    features: [feat('Text Rendering', 'style'), feat('Up to 3K', 'resolution'), feat('Image Remix', 'input')],
    paramConfig: {
      ...params.prompt(),
      ...params.resolution([
        // 2K bucket (~3–4 MP)
        '2048x2048', '1440x2880', '2880x1440', '1664x2496', '2496x1664',
        '1792x2240', '2240x1792', '1440x2560', '2560x1440', '1600x2560',
        '2560x1600', '1728x2304', '2304x1728', '1296x3168', '3168x1296',
        '1152x2944', '2944x1152', '1248x3328', '3328x1248', '1280x3072',
        '3072x1280', '1024x3072', '3072x1024',
        // 1K bucket (~1 MP)
        '1024x1024', '896x1120', '1120x896', '864x1152', '1152x864',
        '832x1248', '1248x832', '800x1280', '1280x800', '720x1280',
        '1280x720', '720x1440', '1440x720', '512x1536', '1536x512',
      ], '2048x2048'),
      ...params.renderingSpeed([
        { id: 'TURBO', label: 'Turbo' },
        { id: 'DEFAULT', label: 'Balanced' },
        { id: 'QUALITY', label: 'Quality' },
      ], 'DEFAULT'),
      ...p.boolean('enableCopyrightDetection', false, 'Copyright Detection'),
      // Remix (editWorkflow) inputs — an image switches the request to
      // ideogram/v4/remix. Weight minimum is 1; the API rejects 0.
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(1, 100, 50, 5),
    },
  },
  {
    id: 'ideogram-p-image', name: 'Ideogram P-Image',
    addedAt: '2026-07-28',
    workflow: 'ideogram/p-image/generate', buildPayload: buildIdeogramPImagePayload,
    estimatedTime: 15,
    mode: 'image', inputType: 't2i',
    description: 'Tiered Ideogram text-to-image — pick a speed/quality tier from very-low (fastest) to high (max quality).',
    features: [feat('Speed Tiers', 'style'), feat('Up to 2K', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...params.resolution([
        // 2K bucket (~3–4 MP)
        '2048x2048', '1440x2880', '2880x1440', '1664x2496', '2496x1664',
        '1792x2240', '2240x1792', '1440x2560', '2560x1440', '1600x2560',
        '2560x1600', '1728x2304', '2304x1728', '1296x3168', '3168x1296',
        '1152x2944', '2944x1152', '1248x3328', '3328x1248', '1280x3072',
        '3072x1280', '1024x3072', '3072x1024',
        // 1K bucket (~1 MP)
        '1024x1024', '896x1120', '1120x896', '864x1152', '1152x864',
        '832x1248', '1248x832', '800x1280', '1280x800', '720x1280',
        '1280x720', '720x1440', '1440x720',
      ], '1024x1024'),
      ...params.renderingSpeed([
        { id: 'very-low', label: 'Very Low' },
        { id: 'low', label: 'Low' },
        { id: 'medium', label: 'Balanced' },
        { id: 'high', label: 'Quality' },
      ], 'medium'),
    },
  },
  {
    id: 'ideogram-v3', name: 'Ideogram v3', modelId: 'ideogram_v_3',
    addedAt: '2026-02-06',
    workflow: 'ideogram-v3-generate', editWorkflow: 'ideogram-v3-remix',
    buildPayload: buildIdeogramGeneratePayload, buildEditPayload: buildIdeogramRemixPayload,
    estimatedTime: 17,
    mode: 'image', inputType: 't2i',
    description: 'Best-in-class text placement for logos, posters, and graphic design.',
    features: [feat('Multi-Image Input', 'input'), feat('Styles', 'style')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(['16:9', '9:16', '1:1', '3:4', '4:3']),
      ...params.renderingSpeed([
        { id: 'FLASH', label: 'Flash' },
        { id: 'TURBO', label: 'Turbo' },
        { id: 'DEFAULT', label: 'Balanced' },
        { id: 'QUALITY', label: 'Quality' },
      ], 'DEFAULT'),
      ...params.style([
        { id: 'GENERAL', label: 'General' },
        { id: 'REALISTIC', label: 'Realistic' },
        { id: 'DESIGN', label: 'Design' },
      ], 'GENERAL'),
      ...params.count(),
      ...params.negativePrompt(),
      ...params.imageInput(1, 'Source Image'),
      // Ideogram remix image_weight minimum is 1 (0 is rejected by the API).
      ...params.imageWeight(1, 100, 50, 5),
    },
  },
  {
    id: 'ideogram-character', name: 'Ideogram Character', modelId: 'ideogram-v3-character',
    addedAt: '2026-02-14',
    workflow: 'ideogram-v3-generate', buildPayload: buildIdeogramCharacterPayload,
    estimatedTime: 20,
    mode: 'image', inputType: 'i2i',
    description: 'Maintain a consistent character across scenes using a single reference photo.',
    features: [feat('Character Ref', 'input'), feat('Styles', 'style')],
    paramConfig: {
      ...params.prompt(),
      ...params.resolution(['1024x1024', '1344x768', '768x1344', '1152x864', '864x1152', '832x1248', '1280x800']),
      ...params.renderingSpeed([
        { id: 'TURBO', label: 'Turbo' },
        { id: 'DEFAULT', label: 'Balanced' },
        { id: 'QUALITY', label: 'Quality' },
      ], 'DEFAULT'),
      ...params.style([
        { id: 'AUTO', label: 'Auto' },
        { id: 'REALISTIC', label: 'Realistic' },
        { id: 'FICTION', label: 'Fiction' },
      ], 'AUTO'),
      ...params.count(),
      ...params.imageInput(1, 'Character Reference', true),
    },
  },
]);

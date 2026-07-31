/**
 * Ideogram — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
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

/** T2I — flat params for the ideogram/p-image/generate pluggable workflow. */
export const buildIdeogramPImagePayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  resolution: ctx.resolution ?? '1024x1024',
  rendering_speed: ctx.renderingSpeed ?? 'medium',
});

export const { MODELS } = defineModels('ideogram', [
  {
    id: 'ideogram-v4', name: 'Ideogram 4.0',
    addedAt: '2026-06-03',
    workflow: 'ideogram/v4/generate', buildPayload: buildIdeogramV4GeneratePayload,
    estimatedTime: 20,
    mode: 'image', inputType: 't2i',
    description: "Ideogram's latest model — class-leading text rendering at up to ~3K resolution.",
    features: [feat('Text Rendering', 'style'), feat('Up to 3K', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...params.resolution([
        '2048x2048', '1440x2880', '2880x1440', '1664x2496', '2496x1664',
        '1792x2240', '2240x1792', '1440x2560', '2560x1440', '1600x2560',
        '2560x1600', '1728x2304', '2304x1728', '1296x3168', '3168x1296',
        '1152x2944', '2944x1152', '1248x3328', '3328x1248', '1280x3072',
        '3072x1280',
      ], '2048x2048'),
      ...params.renderingSpeed([
        { id: 'TURBO', label: 'Turbo' },
        { id: 'DEFAULT', label: 'Balanced' },
        { id: 'QUALITY', label: 'Quality' },
      ], 'DEFAULT'),
      ...p.boolean('enableCopyrightDetection', false, 'Copyright Detection'),
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

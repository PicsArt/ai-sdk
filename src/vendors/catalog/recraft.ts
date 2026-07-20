/**
 * Recraft — single source of truth.
 *
 * Uses the `recraft/v1/images/generations` pluggable workflow (pa-recraft-pluggable-worker).
 * Payload fields go directly into RecraftImagesCommand — no modelOptions wrapper.
 *
 * Model enum values (RecraftImagesCommand.model):
 *   recraftv4_1 / recraftv4_1_pro / recraftv4_1_utility / recraftv4_1_utility_pro
 *   (vector variants of v4.1 exist in the API but are not exposed in this catalog)
 *   recraftv4 / recraftv4_vector / recraftv4_pro / recraftv4_pro_vector
 *   recraftv3 / recraftv3_vector
 *   recraftv2 / recraftv2_vector
 *
 * Size accepts both pixel sizes (1024x1024) and aspect ratios (1:1, 4:3, etc.).
 * V4 models support style via model variant selection (not a `style` field).
 * V4.1 catalog entries are raster-only (no vector style toggle).
 * V3/V2 models support style, substyle, negative_prompt.
 *
 * Image-to-image: the V3 and V4/V4.1 families accept an optional source image
 * (image_url + strength). Providing an image routes the generations workflow to
 * the vendor's imageToImage endpoint; without one it stays text-to-image.
 *
 * Docs: https://www.recraft.ai/docs
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts'; // p imported directly for presets not exposed via params.*

// ── Aspect ratios ──────────────────────────────────────────────────
// recraft-generate accepts both pixel sizes and ratios in the `size` field.
// We pass ratios directly — the API resolves optimal pixel dimensions.

// Recraft supports 14 aspect ratios (per official docs). We expose the 9 most common.
// Full set: 1:1, 2:1, 1:2, 3:2, 2:3, 4:3, 3:4, 5:4, 4:5, 6:10, 14:10, 10:14, 16:9, 9:16
const recraftAspectRatios = ['1:1', '4:3', '3:4', '3:2', '2:3', '16:9', '9:16', '2:1', '1:2'];

// ── Payload builders ────────────────────────────────────────────────

/** Resolve Recraft V4 API model from style + pro flag. */
const resolveV4Model = (style?: string, pro?: boolean): string => {
  const isVector = style === 'vector_illustration';
  if (pro) return isVector ? 'recraftv4_pro_vector' : 'recraftv4_pro';
  return isVector ? 'recraftv4_vector' : 'recraftv4';
};

/**
 * V4 payload — style/substyle/negative_prompt are NOT supported by V4 API.
 * UI "style" dropdown maps to different API models:
 *   vector_illustration → recraftv4_vector / recraftv4_pro_vector
 *   anything else       → recraftv4 / recraftv4_pro
 */
const buildRecraftV4Payload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  model: resolveV4Model(ctx.style),
  n: ctx.count ?? 1,
  ...(ctx.aspectRatio ? { size: ctx.aspectRatio } : {}),
  ...(ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0], strength: (ctx.imageWeight ?? 80) / 100 } : {}),
});

/** V4 Pro payload — same structure, but resolves to recraftv4_pro / recraftv4_pro_vector. */
const buildRecraftV4ProPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  model: resolveV4Model(ctx.style, true),
  n: ctx.count ?? 1,
  ...(ctx.aspectRatio ? { size: ctx.aspectRatio } : {}),
  ...(ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0], strength: (ctx.imageWeight ?? 80) / 100 } : {}),
});

/**
 * V3/V2 payload — supports style, substyle, negative_prompt.
 */
const buildRecraftLegacyPayload =
  (apiModel: string): PayloadBuilder =>
  (ctx) => ({
    prompt: ctx.prompt,
    model: apiModel,
    n: ctx.count ?? 1,
    ...(ctx.aspectRatio ? { size: ctx.aspectRatio } : {}),
    ...(ctx.style ? { style: ctx.style } : {}),
    ...(ctx.substyle ? { substyle: ctx.substyle } : {}),
    ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
    ...(ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0] } : {}),
    ...(ctx.imageUrls?.[0]
    ? { strength: (ctx.imageWeight ?? 80) / 100 }
    : {}),
  });

/** Recraft utility payload — image_url + optional prompt. */
const buildRecraftUtilityPayload =
  (includePrompt: boolean): PayloadBuilder =>
  (ctx) => ({
    image_url: ctx.imageUrls?.[0],
    ...(includePrompt && ctx.prompt ? { prompt: ctx.prompt } : {}),
  });

/** V4 variant payload — fixed API model string. Used for dedicated vector/pro variant models. */
const buildRecraftV4VariantPayload =
  (apiModel: string): PayloadBuilder =>
  (ctx) => ({
    prompt: ctx.prompt,
    model: apiModel,
    n: ctx.count ?? 1,
    ...(ctx.aspectRatio ? { size: ctx.aspectRatio } : {}),
    ...(ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0], strength: (ctx.imageWeight ?? 80) / 100 } : {}),
  });

/** Explore payload — lightweight text-to-image brainstorming. */
const buildRecraftExplorePayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  ...(ctx.aspectRatio ? { size: ctx.aspectRatio } : {}),
});

/** Explore Similar payload — find similar images by source_image_id + similarity score. */
const buildRecraftExploreSimilarPayload: PayloadBuilder = (ctx) => ({
  source_image_id: ctx.sourceImageId,
  similarity: ctx.similarity ?? 3,
  ...(ctx.aspectRatio ? { size: ctx.aspectRatio } : {}),
});

// ── Model definitions ───────────────────────────────────────────────

export const { MODELS } = defineModels('recraft', [
  // ── V4.1 family (raster only — vector variants exist in API but not exposed here) ─
  {
    id: 'recraftv4_1', name: 'Recraft V4.1',
    addedAt: '2026-05-18',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftV4VariantPayload('recraftv4_1'),
    estimatedTime: 17,
    mode: 'image', inputType: 't2i',
    description: 'Next-generation raster output with refined detail and 10K-character prompts.',
    features: [feat('Image Input', 'input'), feat('Text in Image', 'characteristic'), feat('10K Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 10000 }),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(0, 100, 80, 5),
    },
  },
  {
    id: 'recraftv4_1_pro', name: 'Recraft V4.1 Pro',
    addedAt: '2026-05-18',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftV4VariantPayload('recraftv4_1_pro'),
    estimatedTime: 35,
    mode: 'image', inputType: 't2i',
    badge: ['premium'] as const,
    description: 'Pro-tier V4.1 with enhanced quality and detail for premium output.',
    features: [feat('Image Input', 'input'), feat('Text in Image', 'characteristic'), feat('10K Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 10000 }),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(0, 100, 80, 5),
    },
  },
  {
    id: 'recraftv4_1_utility', name: 'Recraft V4.1 Utility',
    addedAt: '2026-05-18',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftV4VariantPayload('recraftv4_1_utility'),
    estimatedTime: 15,
    mode: 'image', inputType: 't2i',
    description: 'V4.1 tuned for utility output — icons, logos, and functional design assets.',
    features: [feat('Image Input', 'input'), feat('Utility', 'characteristic'), feat('10K Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 10000 }),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(0, 100, 80, 5),
    },
  },
  {
    id: 'recraftv4_1_utility_pro', name: 'Recraft V4.1 Utility Pro',
    addedAt: '2026-05-18',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftV4VariantPayload('recraftv4_1_utility_pro'),
    estimatedTime: 25,
    mode: 'image', inputType: 't2i',
    badge: ['premium'] as const,
    description: 'Pro-tier V4.1 utility — premium quality for icons, logos, and design assets.',
    features: [feat('Image Input', 'input'), feat('Utility', 'characteristic'), feat('10K Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 10000 }),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(0, 100, 80, 5),
    },
  },
  // ── V4.1 vector variants ─────
  {
    id: 'recraftv4_1_vector', name: 'Recraft V4.1 Vector',
    addedAt: '2026-05-18',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftV4VariantPayload('recraftv4_1_vector'),
    estimatedTime: 22,
    mode: 'image', inputType: 't2i',
    description: 'Dedicated SVG vector output using V4.1 with clean lines.',
    features: [feat('Image Input', 'input'), feat('Vector/SVG', 'characteristic'), feat('Text in Image', 'characteristic'), feat('10K Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 10000 }),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(0, 100, 80, 5),
    },
  },
  {
    id: 'recraftv4_1_pro_vector', name: 'Recraft V4.1 Pro Vector',
    addedAt: '2026-05-18',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftV4VariantPayload('recraftv4_1_pro_vector'),
    estimatedTime: 40,
    mode: 'image', inputType: 't2i',
    badge: ['premium'] as const,
    description: 'Pro-tier V4.1 SVG vector output with enhanced detail.',
    features: [feat('Image Input', 'input'), feat('Vector/SVG', 'characteristic'), feat('Text in Image', 'characteristic'), feat('10K Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 10000 }),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(0, 100, 80, 5),
    },
  },
  {
    id: 'recraftv4_1_utility_vector', name: 'Recraft V4.1 Utility Vector',
    addedAt: '2026-05-18',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftV4VariantPayload('recraftv4_1_utility_vector'),
    estimatedTime: 18,
    mode: 'image', inputType: 't2i',
    description: 'V4.1 utility tuned for SVG vector output — icons, logos, design assets.',
    features: [feat('Image Input', 'input'), feat('Vector/SVG', 'characteristic'), feat('Utility', 'characteristic'), feat('10K Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 10000 }),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(0, 100, 80, 5),
    },
  },
  {
    id: 'recraftv4_1_utility_pro_vector', name: 'Recraft V4.1 Utility Pro Vector',
    addedAt: '2026-05-18',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftV4VariantPayload('recraftv4_1_utility_pro_vector'),
    estimatedTime: 30,
    mode: 'image', inputType: 't2i',
    badge: ['premium'] as const,
    description: 'Pro-tier V4.1 utility SVG vector output for premium design assets.',
    features: [feat('Image Input', 'input'), feat('Vector/SVG', 'characteristic'), feat('Utility', 'characteristic'), feat('10K Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 10000 }),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(0, 100, 80, 5),
    },
  },
  // ── App models ────────────────────────────────────────────────────
  {
    id: 'recraftv4', name: 'Recraft V4',
    addedAt: '2026-02-18',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftV4Payload,
    estimatedTime: 17,
    mode: 'image', inputType: 't2i',
    description: 'Raster and vector output with clean text placement and 10K-character prompts.',
    features: [feat('Image Input', 'input'), feat('Vector/SVG', 'characteristic'), feat('Text in Image', 'characteristic'), feat('10K Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 10000 }),
      ...params.style([{ id: 'raster', label: 'Raster' }, { id: 'vector_illustration', label: 'Vector (SVG)' }], 'raster'),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(0, 100, 80, 5),
    },
  },
  {
    id: 'recraftv3', name: 'Recraft V3',
    addedAt: '2026-02-15',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftLegacyPayload('recraftv3'),
    estimatedTime: 12,
    mode: 'image', inputType: 't2i',
    description: 'SVG vector, illustration, and photo styles with readable in-image text.',
    features: [feat('Image Input', 'input'), feat('Styles', 'style'), feat('Vector/SVG', 'characteristic'), feat('Text in Image', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 1000 }),
      ...params.style([
        { id: 'realistic_image', label: 'Realistic' },
        { id: 'digital_illustration', label: 'Illustration' },
        { id: 'vector_illustration', label: 'Vector (SVG)' },
        { id: 'any', label: 'Any' },
      ], 'realistic_image'),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.negativePrompt(),
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(0, 100, 80, 5),
    },
  },
  {
    id: 'recraftv2', name: 'Recraft 20B',
    addedAt: '2026-02-15',
    deprecated: true, // superseded by recraftv3 / recraftv4 / recraftv4_pro
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftLegacyPayload('recraftv2'),
    estimatedTime: 7,
    mode: 'image', inputType: 't2i',
    description: '20B parameter model with icon, illustration, and vector modes.',
    features: [feat('Styles', 'style')],
    paramConfig: {
      ...params.prompt({ maxLength: 1000 }),
      ...params.style([
        { id: 'realistic_image', label: 'Realistic' },
        { id: 'digital_illustration', label: 'Illustration' },
        { id: 'vector_illustration', label: 'Vector (SVG)' },
        { id: 'icon', label: 'Icon' },
      ], 'realistic_image'),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.negativePrompt(),
    },
  },
  // ── V4 Pro / Vector / V3 Vector variants ────────────────────────
  {
    id: 'recraftv4_pro', name: 'Recraft V4 Pro',
    addedAt: '2026-02-20',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftV4ProPayload,
    estimatedTime: 35,
    mode: 'image', inputType: 't2i',
    badge: ['premium'] as const,
    description: 'Pro-quality raster and vector output with enhanced detail and 10K-character prompts.',
    features: [feat('Image Input', 'input'), feat('Vector/SVG', 'characteristic'), feat('Text in Image', 'characteristic'), feat('10K Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 10000 }),
      ...params.style([{ id: 'raster', label: 'Raster' }, { id: 'vector_illustration', label: 'Vector (SVG)' }], 'raster'),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(0, 100, 80, 5),
    },
  },
  {
    id: 'recraftv4_vector', name: 'Recraft V4 Vector',
    addedAt: '2026-02-18',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftV4VariantPayload('recraftv4_vector'),
    estimatedTime: 22,
    mode: 'image', inputType: 't2i',
    description: 'Dedicated SVG vector output with clean lines and 10K-character prompts.',
    features: [feat('Image Input', 'input'), feat('Vector/SVG', 'characteristic'), feat('Text in Image', 'characteristic'), feat('10K Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 10000 }),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(0, 100, 80, 5),
    },
  },
  {
    id: 'recraftv4_pro_vector', name: 'Recraft V4 Pro Vector',
    addedAt: '2026-02-20',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftV4VariantPayload('recraftv4_pro_vector'),
    estimatedTime: 35,
    mode: 'image', inputType: 't2i',
    badge: ['premium'] as const,
    description: 'Pro-quality SVG vector output with enhanced detail and 10K-character prompts.',
    features: [feat('Image Input', 'input'), feat('Vector/SVG', 'characteristic'), feat('Text in Image', 'characteristic'), feat('10K Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 10000 }),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, 'Source Image'),
      ...params.imageWeight(0, 100, 80, 5),
    },
  },
  {
    id: 'recraftv3_vector', name: 'Recraft V3 Vector',
    addedAt: '2026-02-18',
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftLegacyPayload('recraftv3_vector'),
    estimatedTime: 15,
    mode: 'image', inputType: 't2i',
    description: 'Dedicated SVG vector output with substyle options and negative prompts.',
    features: [feat('Vector/SVG', 'characteristic'), feat('Text in Image', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 1000 }),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.negativePrompt(),
    },
  },
  // ── V2 Vector variant ──────────────────────────────────────────────
  {
    id: 'recraftv2_vector', name: 'Recraft 20B Vector',
    addedAt: '2026-03-13',
    deprecated: true, // superseded by recraftv3_vector / recraftv4_vector
    workflow: 'recraft/v1/images/generations',
    buildPayload: buildRecraftLegacyPayload('recraftv2_vector'),
    estimatedTime: 7,
    mode: 'image', inputType: 't2i',
    description: 'Dedicated SVG vector output using the 20B parameter model.',
    features: [feat('Vector/SVG', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 1000 }),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...params.count([1, 2, 4, 6]),
      ...params.negativePrompt(),
    },
  },
  // ── Utility models ─────────────────────────────────────────────────
  {
    id: 'recraft-vectorize', name: 'Recraft Vectorize',
    addedAt: '2026-03-13',
    workflow: 'recraft/v1/images/vectorize',
    buildPayload: buildRecraftUtilityPayload(true),
    estimatedTime: 10,
    mode: 'image', inputType: 'i2i',
    description: 'Convert raster images to clean SVG vector format.',
    features: [feat('Image Input', 'input'), feat('Vector/SVG', 'characteristic')],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 1000 }),
      ...params.imageInput(1, 'Source Image', true),
    },
  },
  {
    id: 'recraft-creative-upscale', name: 'Recraft Creative Upscale',
    addedAt: '2026-03-13',
    workflow: 'recraft/v1/images/creativeUpscale',
    buildPayload: buildRecraftUtilityPayload(false),
    estimatedTime: 15,
    mode: 'image', inputType: 'i2i',
    description: 'AI-enhanced upscaling that adds creative detail to enlarged images.',
    features: [feat('Image Input', 'input'), feat('Upscale', 'characteristic')],
    paramConfig: {
      ...params.imageInput(1, 'Source Image', true),
    },
  },
  {
    id: 'recraft-crisp-upscale', name: 'Recraft Crisp Upscale',
    addedAt: '2026-03-13',
    workflow: 'recraft/v1/images/crispUpscale',
    buildPayload: buildRecraftUtilityPayload(false),
    estimatedTime: 10,
    mode: 'image', inputType: 'i2i',
    description: 'Clean upscaling that preserves sharp edges and fine detail.',
    features: [feat('Image Input', 'input'), feat('Upscale', 'characteristic')],
    paramConfig: {
      ...params.imageInput(1, 'Source Image', true),
    },
  },
  {
    id: 'recraftv3-replace-bg', name: 'Recraft Replace Background',
    addedAt: '2026-03-13',
    workflow: 'recraft/v1/images/replaceBackground',
    buildPayload: buildRecraftUtilityPayload(true),
    estimatedTime: 10,
    mode: 'image', inputType: 'i2i',
    description: 'Replace the background of an image using a text prompt.',
    features: [feat('Image Input', 'input')],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 1000 }),
      ...params.imageInput(1, 'Source Image', true),
    },
  },
  // ── Explore models ──────────────────────────────────────────────────
  {
    id: 'recraft-explore', name: 'Recraft Explore',
    addedAt: '2026-03-23',
    workflow: 'recraft/v1/images/explore',
    buildPayload: buildRecraftExplorePayload,
    estimatedTime: 15,
    mode: 'image', inputType: 't2i',
    description: 'Explore creative image ideas from a text prompt using Recraft V4.',
    features: [feat('Explore Ideas', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 1000 }),
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
    },
  },
  {
    id: 'recraft-explore-similar', name: 'Recraft Explore Similar',
    addedAt: '2026-03-23',
    workflow: 'recraft/v1/images/exploresimilar',
    buildPayload: buildRecraftExploreSimilarPayload,
    estimatedTime: 15,
    mode: 'image', inputType: 'i2i',
    description: 'Find images visually similar to a previously explored Recraft image.',
    features: [feat('Similarity Search', 'characteristic')],
    paramConfig: {
      ...params.aspectRatio(recraftAspectRatios, '1:1'),
      ...p.text('sourceImageId', { label: 'Source Image ID', required: true }),
      ...p.range('similarity', 1, 5, 3, { step: 1 }),
    },
  },
]);

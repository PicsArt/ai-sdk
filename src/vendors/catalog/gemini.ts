/**
 * Gemini — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import type { ModelParams } from '../../core/descriptors/types.ts';
import { GEMINI_DEFAULT_VOICE_ID } from '../../core/voices.ts';
import { p } from '../../core/descriptors/presets.ts';
import { defineModels, feat, params } from '../define.ts';

// ── Thinking config helper ──────────────────────────────────────────

/**
 * Build the flat `thinkingConfig` fragment for the `gemini/v2/images`
 * pluggable worker. Worker DTO (`GeminiV2ImagesCommand.thinkingConfig`)
 * lives at the root of the payload (NOT nested under `generationConfig`)
 * and expects UPPERCASE enum values (`MINIMAL` | `HIGH`). The worker
 * itself nests it under `generationConfig.thinkingConfig` before
 * forwarding to Google's REST API (see `pa-vertex-ai/.../gemini-v2-images.executor.ts`).
 *
 * The executor only forwards `thinkingConfig` to Google when:
 *  - model is `gemini-3.1-flash-image-preview` and touchpoint ≠ 'partner-meta'
 *    (defaults to MINIMAL when unset), or
 *  - the user explicitly supplies it (any other model).
 *
 * Emit nothing when the caller didn't set anything so the wire payload
 * stays byte-identical to today's behavior.
 */
function buildThinkingConfig(ctx: {
  thinkingLevel?: string;
  thinkingBudget?: number;
}): { thinkingConfig?: Record<string, unknown> } {
  const tc: Record<string, unknown> = {};
  if (ctx.thinkingLevel) tc.thinkingLevel = ctx.thinkingLevel.toUpperCase();
  if (ctx.thinkingBudget != null) tc.thinkingBudget = ctx.thinkingBudget;
  return Object.keys(tc).length ? { thinkingConfig: tc } : {};
}

// ── Payload builders ────────────────────────────────────────────────

/**
 * Gemini 3 Pro Image. When images present: remix mode.
 * aspectRatio always sent so output respects user selection even in remix mode.
 * Supports imageSize (1K/2K/4K). The API dropped `thinkingLevel` for sub-3.1
 * image models; only the numeric `thinkingBudget` passthrough remains.
 */
export const buildGemini3ProImagePayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  model: 'gemini-3-pro-image-preview',
  count: ctx.count ?? 1,
  ...(ctx.imageUrls?.length ? { imageUrls: ctx.imageUrls } : {}),
  aspectRatio: ctx.aspectRatio ?? '1:1',
  imageSize: ctx.resolution ?? '2K',
  ...buildThinkingConfig(ctx),
});

/**
 * Gemini 2.5 Flash Image. When images present: remix mode.
 * aspectRatio always sent so output respects user selection even in remix mode.
 */
export const buildGeminiFlashImagePayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  model: 'gemini-2.5-flash-image',
  count: ctx.count ?? 1,
  ...(ctx.imageUrls?.length ? { imageUrls: ctx.imageUrls } : {}),
  aspectRatio: ctx.aspectRatio ?? '16:9',
});

/**
 * Gemini 3.1 Flash Image (Preview). Same payload shape as Gemini 3 Pro Image.
 * Supports imageSize (512px/1K/2K/4K), aspectRatio, count, thinkingLevel,
 * and up to 14 reference images.
 * https://ai.google.dev/gemini-api/docs/image-generation
 */
export const buildGemini31FlashImagePayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  model: 'gemini-3.1-flash-image-preview',
  count: ctx.count ?? 1,
  ...(ctx.imageUrls?.length ? { imageUrls: ctx.imageUrls } : {}),
  aspectRatio: ctx.aspectRatio ?? '1:1',
  imageSize: ctx.resolution ?? '1K',
  ...buildThinkingConfig(ctx),
});

/**
 * Gemini 3.1 Flash Lite Image (Preview). Lightweight sibling of Gemini 3.1
 * Flash Image — same payload shape, faster/cheaper `gemini-3.1-flash-lite-image`
 * model. Supports imageSize (0.5K/1K/2K/4K), aspectRatio, count, thinkingLevel,
 * and up to 14 reference images.
 */
export const buildGemini31FlashLiteImagePayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  model: 'gemini-3.1-flash-lite-image',
  count: ctx.count ?? 1,
  ...(ctx.imageUrls?.length ? { imageUrls: ctx.imageUrls } : {}),
  aspectRatio: ctx.aspectRatio ?? '1:1',
  imageSize: ctx.resolution ?? '1K',
  ...buildThinkingConfig(ctx),
});

/**
 * Gemini TTS. Uses Gemini's native audio output (responseModalities: ["AUDIO"]).
 * Requires backend Vertex AI worker support with speechConfig.
 */
export const buildGeminiTTSPayload: PayloadBuilder = (ctx) => ({
  text: ctx.prompt,
  model: ctx.modelId ?? 'gemini-2.5-flash-tts',
  voiceName: ctx.voiceId ?? 'Kore',
});

function inferMimeType(url: string): 'image/png' | 'image/jpeg' {
  return url.match(/\.png(\?|$)/i) ? 'image/png' : 'image/jpeg';
}

/**
 * Gemini Omni Video. Assembles nested image/video objects from flat SDK fields.
 * Maps duration → durationSeconds, hardcodes model: 'gemini-omni-flash-preview'.
 */
export const buildGeminiOmniVideoPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  model: 'gemini-omni-flash-preview',
  ...(ctx.aspectRatio ? { aspectRatio: ctx.aspectRatio } : {}),
  ...(ctx.duration ? { durationSeconds: ctx.duration } : {}),
  ...(ctx.imageUrls?.[0]
    ? { image: { url: ctx.imageUrls[0], mimeType: inferMimeType(ctx.imageUrls[0]) } }
    : {}),
  ...(ctx.videoUrl ? { video: { url: ctx.videoUrl } } : {}),
});

// ── Model definitions ───────────────────────────────────────────────

const GEMINI_AR_WIDE = ['1:1', '16:9', '9:16', '3:4', '4:3', '2:3', '21:9'] as const;

/**
 * thinkingLevel param for Gemini 3.x image preview models.
 * Only Flash 3.1 honors the flag today (verified 2026-05-11): minimal=0 thought
 * tokens, high≈1380. Pro currently emits ~200 thought tokens regardless of the
 * value — preview-build behavior. Exposed for forward compatibility and for
 * the Flash variant where it makes a measurable difference.
 */
const thinkingLevelParam: ModelParams = {
  thinkingLevel: {
    label: 'Thinking',
    descriptor: {
      kind: 'enum',
      valueType: 'string',
      options: [
        { id: 'minimal', label: 'Minimal (faster)' },
        { id: 'high', label: 'High (more reasoning)' },
      ],
      default: 'minimal',
    },
  },
};

/**
 * Numeric thinking-token budget. Worker DTO accepts 128..24576 (verified by a
 * live boundary probe 2026-06-17: 32768 → "thinkingBudget must not be greater
 * than 24576"). Forwarded as `thinkingConfig.thinkingBudget` to Google's REST API.
 * Used by Gemini 3 Pro (where `thinkingLevel` was dropped) and offered
 * alongside `thinkingLevel` on Flash 3.1 for granular control.
 */
const thinkingBudgetParam: ModelParams = {
  thinkingBudget: {
    label: 'Thinking Budget',
    descriptor: { kind: 'range', min: 128, max: 24576, step: 128, default: 128 },
  },
};

export const { MODELS } = defineModels('google', [
  // ── Image ─────────────────────────────────────────────────────────
  {
    id: 'gemini-3.1-flash-image',
    addedAt: '2026-02-26',
    name: 'Nano Banana 2', specName: 'Gemini 3.1 Flash Image',
    workflow: 'gemini/v2/images',
    buildPayload: buildGemini31FlashImagePayload,
    estimatedTime: { '0.5K': 12, '1K': 22, '2K': 46, '4K': 92 },
    mode: 'image', inputType: 't2i', modelId: 'gemini-3.1-flash-image-preview',
    badge: ['hot', 'fast'] as const,
    description: 'Fast 4K generation with accurate text and search-grounded accuracy.',
    features: [feat('Multi-Image Input', 'input'), feat('4K', 'resolution'), feat('Text Rendering', 'characteristic')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(['1:1', '16:9', '9:16', '3:4', '4:3', '3:2', '2:3', '4:5', '5:4', '4:1', '1:4', '8:1', '1:8', '21:9'], '1:1'),
      ...params.resolution(['0.5K', '1K', '2K', '4K'], '1K'),
      ...params.count(),
      ...thinkingLevelParam,
      ...params.imageInput(14, 'Source Images'),
    },
  },
  {
    id: 'gemini-3.1-flash-lite-image',
    addedAt: '2026-07-01',
    name: 'Nano Banana 2 Lite', specName: 'Gemini 3.1 Flash Lite Image',
    workflow: 'gemini/v2/images',
    buildPayload: buildGemini31FlashLiteImagePayload,
    estimatedTime: 14,
    mode: 'image', inputType: 't2i', modelId: 'gemini-3.1-flash-lite-image',
    badge: ['fast'] as const,
    description: 'Lightweight Nano Banana 2 variant for faster, high-volume image generation.',
    features: [feat('Multi-Image Input', 'input'), feat('Text Rendering', 'characteristic')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(['1:1', '16:9', '9:16', '3:4', '4:3', '3:2', '2:3', '4:5', '5:4', '4:1', '1:4', '8:1', '1:8', '21:9'], '1:1'),
      ...params.count(),
      ...thinkingLevelParam,
      ...params.imageInput(14, 'Source Images'),
    },
  },
  {
    id: 'gemini-3-pro-image',
    addedAt: '2026-02-06',
    name: 'Nano Banana Pro', specName: 'Gemini 3 Pro Image',
    workflow: 'gemini/v2/images',
    buildPayload: buildGemini3ProImagePayload,
    estimatedTime: { '0.5K': 15, '1K': 30, '2K': 57, '4K': 74 },
    mode: 'image', inputType: 't2i', modelId: 'gemini-3-pro-image-preview',
    badge: ['popular', 'premium'] as const,
    description: 'Top-tier 4K images with precise multilingual text rendering.',
    features: [feat('Multi-Image Input', 'input'), feat('4K', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio([...GEMINI_AR_WIDE], '1:1'),
      ...params.resolution(['1K', '2K', '4K'], '2K'),
      ...params.count(),
      ...thinkingBudgetParam,
      ...params.imageInput(14, 'Source Images'),
    },
  },
  {
    id: 'gemini-2.5-flash-image',
    addedAt: '2026-02-06',
    name: 'Nano Banana', specName: 'Gemini 2.5 Flash Image',
    workflow: 'gemini/v2/images',
    buildPayload: buildGeminiFlashImagePayload,
    estimatedTime: 17,
    mode: 'image', inputType: 't2i', modelId: 'gemini-2.5-flash-image',
    badge: ['popular', 'fast'] as const,
    description: 'Quick, lightweight image creation for high-volume workflows.',
    features: [feat('Multi-Image Input', 'input'), feat('1K', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio([...GEMINI_AR_WIDE], '16:9'),
      ...params.count(),
      ...params.imageInput(14, 'Source Images'),
    },
  },
  // ── Audio ─────────────────────────────────────────────────────────
  {
    id: 'gemini-2.5-flash-tts', name: 'Gemini 2.5 Flash TTS',
    addedAt: '2026-02-15',
    workflow: 'gemini/v1/audios',
    buildPayload: buildGeminiTTSPayload,
    estimatedTime: 15,
    mode: 'audio', inputType: 'tts', modelId: 'gemini-2.5-flash-tts',
    description: 'Google Gemini native text-to-speech with expressive multilingual voices.',
    features: [feat('Multilingual', 'characteristic'), feat('30 Voices', 'characteristic')],
    paramConfig: {
      ...params.language(true),
      // 6,000 boundary-verified against the live gemini/v1/audios worker
      // (accepts >5,000; see scripts/api-tests/audio-charlimit-boundary-probe.mjs).
      ...params.prompt({ maxLength: 6000 }),
      ...params.voiceId([], GEMINI_DEFAULT_VOICE_ID, { catalog: { workflow: 'gemini/v1/catalog/voices' } }),
    },
  },
  {
    id: 'gemini-2.5-pro-tts', name: 'Gemini 2.5 Pro TTS',
    addedAt: '2026-03-18',
    workflow: 'gemini/v1/audios',
    buildPayload: buildGeminiTTSPayload,
    estimatedTime: 20,
    mode: 'audio', inputType: 'tts', modelId: 'gemini-2.5-pro-tts',
    badge: ['premium'] as const,
    description: 'Premium Gemini TTS with richer expressiveness and multi-speaker support.',
    features: [feat('Multilingual', 'characteristic'), feat('30 Voices', 'characteristic'), feat('Multi-Speaker', 'characteristic')],
    paramConfig: {
      ...params.language(true),
      // 6,000 boundary-verified against the live gemini/v1/audios worker
      // (accepts >5,000; see scripts/api-tests/audio-charlimit-boundary-probe.mjs).
      ...params.prompt({ maxLength: 6000 }),
      ...params.voiceId([], GEMINI_DEFAULT_VOICE_ID, { catalog: { workflow: 'gemini/v1/catalog/voices' } }),
    },
  },
  // ── Video ─────────────────────────────────────────────────────────
  {
    id: 'gemini-omni-flash-preview', name: 'Gemini Omni',
    addedAt: '2026-06-24',
    workflow: 'gemini-omni/video',
    buildPayload: buildGeminiOmniVideoPayload,
    estimatedTime: 40,
    mode: 'video', inputType: 't2v',
    description: 'Google Gemini multimodal video — text, image, or video as input.',
    features: [ feat('Source Image', 'input'), feat('Source Video', 'input'), feat('3–10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(['16:9', '9:16']),
      ...p.enum('duration', [3, 5, 6, 8, 10], 8, { label: 'Duration (seconds)' }),
      ...params.imageInput(1, 'Source Image', false, 'asset'),
      ...params.videoInput('Source Video', 'asset', false),
    },
  },
]);

/**
 * Grok — single source of truth (video + image + audio).
 *
 * Video aspect ratios: 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3
 * Image aspect ratios: 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 2:1, 1:2, 19.5:9, 9:19.5, 20:9, 9:20, auto
 * Docs: https://docs.x.ai/developers/model-capabilities/video/generation
 *       https://docs.x.ai/developers/model-capabilities/images/generation
 *       https://docs.x.ai/docs/api-reference#text-to-speech
 */
import { p } from '../../core/descriptors/presets.ts';
import type { PayloadBuilder } from '../../core/types.ts';
import { DEFAULT_GROK_VOICE_ID } from '../../core/voices.ts';
import { defineModels, feat, params } from '../define.ts';

// ── Payload builders ────────────────────────────────────────────────

/** Text-to-Video (x-ai/v1/videos/generations). */
export const buildGrokT2VPayload: PayloadBuilder = (ctx) => ({
  model: 'grok-imagine-video',
  prompt: ctx.prompt,
  duration: ctx.duration ?? 6,
  ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
  ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
  ...(ctx.imageUrls?.[0] ? { image: { url: ctx.imageUrls[0] } } : {}),
});

/** Image-to-Video (x-ai/v1/videos/generations with required image). */
export const buildGrokI2VPayload: PayloadBuilder = (ctx) => ({
  model: 'grok-imagine-video',
  prompt: ctx.prompt,
  ...(ctx.imageUrls?.[0] ? { image: { url: ctx.imageUrls[0] } } : {}),
  duration: ctx.duration ?? 6,
  ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
});

/** Grok 1.5 T2V — sends model explicitly; optional reference images for R2V. */
export const buildGrok15T2VPayload: PayloadBuilder = (ctx) => ({
  model: 'grok-imagine-video-1.5',
  prompt: ctx.prompt,
  duration: ctx.duration ?? 8,
  ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
  ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
  ...(ctx.imageUrls?.[0] ? { image: { url: ctx.imageUrls[0] } } : {}),
});

/** Grok 1.5 I2V — sends model explicitly. */
export const buildGrok15I2VPayload: PayloadBuilder = (ctx) => ({
  model: 'grok-imagine-video-1.5',
  prompt: ctx.prompt,
  ...(ctx.imageUrls?.[0] ? { image: { url: ctx.imageUrls[0] } } : {}),
  duration: ctx.duration ?? 8,
  ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
});

/** Edit Video (x-ai/v1/videos/edits — only prompt + video). */
export const buildGrokEditVideoPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  ...(ctx.videoUrl ? { video: { url: ctx.videoUrl } } : {}),
});

/** Extend Video (x-ai/v1/videos/extensions — prompt + video + duration 1-10). */
export const buildGrokExtendVideoPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  ...(ctx.videoUrl ? { video: { url: ctx.videoUrl } } : {}),
  duration: ctx.duration ?? 6,
});

/** Text-to-Image (x-ai/v1/images/generations — no image input). */
export const buildGrokImageGenPayload = (model: string): PayloadBuilder => (ctx) => ({
  model,
  prompt: ctx.prompt,
  n: ctx.count ?? 1,
  ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
  ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
});

/** Image-to-Image edit (x-ai/v1/images/edits — single `image` or multi `images[]`). */
export const buildGrokImageEditPayload = (model: string): PayloadBuilder => (ctx) => {
  const urls = ctx.imageUrls ?? [];
  const imagePart = urls.length > 1
    ? { images: urls.map((url) => ({ url })) }
    : urls.length === 1
      ? { image: { url: urls[0] } }
      : {};
  return {
    model,
    prompt: ctx.prompt,
    n: ctx.count ?? 1,
    ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
    ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
    ...imagePart,
  };
};

/** Text-to-Speech (x-ai/v1/tts — text + language + voice_id). */
export const buildGrokTTSPayload: PayloadBuilder = (ctx) => ({
  text: ctx.prompt,
  language: ctx.language ?? 'auto',
  voice_id: ctx.voiceId ?? DEFAULT_GROK_VOICE_ID,
});

/**
 * Every xAI videos endpoint (generations, edits, extensions) caps the prompt at
 * 4096, and none of the video models declared a limit — over-long prompts were
 * rejected by the vendor only after the job was submitted ("Prompt length
 * exceeds the maximum allowed length of 4096"). Verified against the live
 * backend on 2026-08-06 by boundary-probing each workflow.
 *
 * Note: xAI measures this in UTF-8 bytes, not characters, so a prompt under
 * 4096 characters can still be rejected if it contains multibyte text. This cap
 * catches the ASCII case only; the byte-size gap is tracked separately.
 */
const GROK_VIDEO_PROMPT_MAX = 4096;

const GROK_VIDEO_AR = ['16:9', '9:16', '1:1', '4:3', '3:4', '3:2', '2:3'];
const GROK_IMAGE_AR = ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '2:1', '1:2', '19.5:9', '9:19.5', '20:9', '9:20'];
const GROK_DURATIONS = [3, 5, 6, 8, 10, 12, 15];
const GROK_VIDEO_RESOLUTIONS = ['480p', '720p'];
const GROK_VIDEO_RESOLUTIONS_15 = ['480p', '720p', '1080p'];
const GROK_IMAGE_RESOLUTIONS = ['1k', '2k'];

export const { MODELS } = defineModels('grok', [
  // ── Video ─────────────────────────────────────────
  {
    id: 'grok-imagine-video', name: 'Grok Imagine 1.0',
    addedAt: '2026-02-24',
    workflow: 'x-ai/v1/videos/generations', editWorkflow: 'x-ai/v1/videos/generations',
    buildPayload: buildGrokT2VPayload, buildEditPayload: buildGrokI2VPayload,
    estimatedTime: 30,
    mode: 'video', inputType: 't2v', badge: ['fast'] as const,
    description: 'Fastest generation pipeline — 720p with audio in seconds, up to 15s.',
    features: [feat('Image Input', 'input'), feat('Start Frame', 'frame'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('15 sec', 'duration')],
    paramConfig: {
      ...params.prompt({ maxLength: GROK_VIDEO_PROMPT_MAX }),
      ...params.aspectRatio(GROK_VIDEO_AR),
      ...params.resolution(GROK_VIDEO_RESOLUTIONS, '720p'),
      ...params.duration(GROK_DURATIONS, 6),
      ...params.imageInput(),
    },
  },
  {
    id: 'grok-imagine-video-1.5', name: 'Grok Imagine 1.5',
    addedAt: '2026-06-02',
    workflow: 'x-ai/v1/videos/generations', editWorkflow: 'x-ai/v1/videos/generations',
    buildPayload: buildGrok15T2VPayload, buildEditPayload: buildGrok15I2VPayload,
    estimatedTime: 30,
    mode: 'video', inputType: 'i2v', badge: ['new'] as const,
    description: 'Next-gen Grok video — faster, higher fidelity, up to 15s with audio.',
    features: [feat('Image Input', 'input'), feat('Audio', 'audio'), feat('1080p', 'resolution'), feat('15 sec', 'duration')],
    paramConfig: {
      ...params.prompt({ maxLength: GROK_VIDEO_PROMPT_MAX }),
      ...params.aspectRatio(GROK_VIDEO_AR),
      ...params.resolution(GROK_VIDEO_RESOLUTIONS_15, '720p'),
      ...params.duration(GROK_DURATIONS, 8),
      ...params.imageInput(1, 'Input Image', true),
    },
  },
  {
    id: 'grok-edit-video', name: 'Grok Edit Video', modelId: 'grok-imagine-video',
    addedAt: '2026-02-06',
    workflow: 'x-ai/v1/videos/edits', buildPayload: buildGrokEditVideoPayload,
    estimatedTime: 9,
    mode: 'video', inputType: 'v2v',
    description: 'Restyle or remix an existing video with a new prompt direction.',
    features: [feat('Video Input', 'input'), feat('Up to 8s', 'duration')],
    paramConfig: {
      ...params.prompt({ maxLength: GROK_VIDEO_PROMPT_MAX }),
      ...params.videoInput('Source Video', 'reference', true, 8),
    },
  },
  {
    id: 'grok-extend-video', name: 'Grok Extend Video', modelId: 'grok-imagine-video',
    addedAt: '2026-04-22',
    workflow: 'x-ai/v1/videos/extensions', buildPayload: buildGrokExtendVideoPayload,
    estimatedTime: 15,
    mode: 'video', inputType: 'v2v',
    description: 'Extend an existing video forward with a new prompt — up to 10 seconds.',
    features: [feat('Video Input', 'input'), feat('Up to 10s', 'duration')],
    paramConfig: {
      ...params.prompt({ maxLength: GROK_VIDEO_PROMPT_MAX }),
      ...params.duration([3, 5, 6, 8, 10], 6),
      ...params.videoInput('Source Video'),
    },
  },
  // ── Image ─────────────────────────────────────────
  {
    id: 'grok-imagine-image', name: 'Grok Imagine',
    addedAt: '2026-02-06',
    workflow: 'x-ai/v1/images/generations', editWorkflow: 'x-ai/v1/images/edits',
    buildPayload: buildGrokImageGenPayload('grok-imagine-image'),
    buildEditPayload: buildGrokImageEditPayload('grok-imagine-image'),
    estimatedTime: 8,
    mode: 'image', inputType: 't2i', badge: ['fast'] as const,
    description: 'Rapid image creation with wide aspect-ratio selection and image input.',
    features: [feat('Image Input', 'input')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(GROK_IMAGE_AR, '1:1'),
      ...params.resolution(GROK_IMAGE_RESOLUTIONS, '1k'),
      ...params.count([1, 2, 4]),
      ...params.imageInput(1, 'Source Image'),
    },
  },
  {
    id: 'grok-imagine-image-quality', name: 'Grok Imagine Quality',
    modelId: 'grok-imagine-image-quality',
    addedAt: '2026-05-19',
    workflow: 'x-ai/v1/images/generations', editWorkflow: 'x-ai/v1/images/edits',
    buildPayload: buildGrokImageGenPayload('grok-imagine-image-quality'),
    buildEditPayload: buildGrokImageEditPayload('grok-imagine-image-quality'),
    estimatedTime: 16,
    mode: 'image', inputType: 't2i',
    description: 'Higher-fidelity Grok Imagine variant for production-grade images.',
    features: [feat('Image Input', 'input'), feat('2k', 'resolution')],
    paramConfig: {
      ...params.prompt({ maxLength: 8000 }),
      ...params.aspectRatio(GROK_IMAGE_AR, '1:1'),
      ...params.resolution(GROK_IMAGE_RESOLUTIONS, '2k'),
      ...params.count([1, 2, 4]),
      ...params.imageInput(1, 'Source Image'),
    },
  },
  {
    id: 'grok-imagine-image-2.0', name: 'Grok Imagine 2.0',
    addedAt: '2026-08-19',
    workflow: 'x-ai/v1/images/generations', editWorkflow: 'x-ai/v1/images/edits',
    estimatedTime: 16,
    mode: 'image', inputType: 't2i',
    description: 'Latest Grok Imagine generation — sharper detail with a low/medium quality tier.',
    features: [feat('Image Input', 'input'), feat('2k', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(GROK_IMAGE_AR, '1:1'),
      ...params.resolution(GROK_IMAGE_RESOLUTIONS, '1k'),
      // Vendor-side default is medium; only supported by grok-imagine-image-2.0
      // (generations only — the edits command has no quality field).
      ...p.quality(['low', 'medium'], 'medium'),
      ...params.count([1, 2, 4]),
      ...params.imageInput(1, 'Source Image'),
    },
  },
  // ── Audio ─────────────────────────────────────────
  {
    id: 'grok-tts', name: 'Grok TTS', modelId: 'grok-tts',
    addedAt: '2026-04-21',
    workflow: 'x-ai/v1/tts',
    buildPayload: buildGrokTTSPayload,
    estimatedTime: 8,
    mode: 'audio', inputType: 'tts',
    description: 'Expressive text-to-speech from xAI Grok with multilingual support.',
    features: [feat('Multilingual', 'characteristic'), feat('5 Voices', 'characteristic')],
    paramConfig: {
      ...params.language(true),
      ...params.prompt({ maxLength: 15000 }),
      ...params.voiceId([], DEFAULT_GROK_VOICE_ID, { catalog: { workflow: 'x-ai/v1/catalog/voices' } }),
    },
  },
]);

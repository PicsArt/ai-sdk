/**
 * Sora — single source of truth.
 * GOTCHA: Uses `seconds` field, NOT `duration`.
 * GOTCHA: Aspect ratio is sent as `size` (e.g. '1280x720'), NOT `aspect_ratio`.
 * NOTE: Provider in app is 'openai', but test provider is 'sora'.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

/** Map aspect-ratio + resolution → OpenAI `size` parameter.
 * Three distinct tiers per the worker's getSizeId (720p / 1024p / 1080p).
 * 1024p/1080p are sora-2-pro only (sora-2 = 720p sizes only). Previously the
 * '1080p' label wrongly emitted 1792x1024 (a 1024p size) → true 1080p now. */
const SORA_SIZE_MAP: Record<string, Record<string, string>> = {
  '720p':  { '16:9': '1280x720',  '9:16': '720x1280' },
  '1024p': { '16:9': '1792x1024', '9:16': '1024x1792' },
  '1080p': { '16:9': '1920x1080', '9:16': '1080x1920' },
};

const getSoraSize = (aspectRatio?: string, resolution?: string): string =>
  SORA_SIZE_MAP[resolution ?? '720p']?.[aspectRatio ?? '16:9'] ?? '1280x720';

/** T2V / I2V (unified) — optional input_reference_url for first-frame reference. */
export const buildSora2ProPayload: PayloadBuilder = (ctx) => ({
  model: 'sora-2-pro',
  prompt: ctx.prompt,
  seconds: ctx.duration ?? 4,
  size: getSoraSize(ctx.aspectRatio, ctx.resolution),
  ...(ctx.imageUrls?.[0] ? { input_reference_url: ctx.imageUrls[0], adjust_input_image_ratio: true } : {}),
});

export const buildSora2Payload: PayloadBuilder = (ctx) => ({
  model: 'sora-2',
  prompt: ctx.prompt,
  seconds: ctx.duration ?? 4,
  size: getSoraSize(ctx.aspectRatio),
  ...(ctx.imageUrls?.[0] ? { input_reference_url: ctx.imageUrls[0], adjust_input_image_ratio: true } : {}),
});

/**
 * Extend continues a PRIOR Sora generation by its OpenAI `video_id` (chained
 * from the source asset — like VEO extend), NOT an uploaded video.
 * Worker `openai/v1/videos/extensions` (OpenAiSoraExtensionsCommand) requires
 * `video_id` + `prompt`, optional `seconds` (default 8, max 20). It rejects
 * `model`/`size`/`video_url`.
 */
export const buildSora2ExtendPayload: PayloadBuilder = (ctx) => ({
  video_id: ctx.videoId,
  prompt: ctx.prompt,
  seconds: ctx.duration ?? 8,
});

const SORA_DURATIONS = [4, 8, 12, 16, 20];
const SORA_AR = ['16:9', '9:16'];

export const { MODELS } = defineModels('openai', [
  {
    id: 'sora-2-pro', name: 'Sora 2 Pro', modelId: 'sora-2-pro',
    addedAt: '2026-02-06',
    workflow: 'openai/v1/videos', buildPayload: buildSora2ProPayload,
    estimatedTime: { '720p': 100, '1024p': 100, '1080p': 100 }, testTimeout: 700,
    mode: 'video', inputType: 't2v', badge: ['popular', 'premium'],
    description: 'Up to 1080p with strong physical realism and optional reference image.',
    features: [feat('Image Input', 'input'), feat('Audio', 'audio'), feat('Up to 1080p', 'resolution'), feat('4–20 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(1, 'Reference Image'),
      ...params.aspectRatio(SORA_AR),
      ...params.resolution(['720p', '1024p', '1080p']),
      ...params.duration(SORA_DURATIONS, 4),
    },
  },
  {
    id: 'sora-2', name: 'Sora 2', modelId: 'sora-2',
    addedAt: '2026-02-06',
    workflow: 'openai/v1/videos', buildPayload: buildSora2Payload,
    estimatedTime: 100,
    mode: 'video', inputType: 't2v', badge: ['popular'],
    description: 'Naturalistic 720p video with lifelike motion and character detail.',
    features: [feat('Image Input', 'input'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('4–20 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(1, 'Reference Image'),
      ...params.aspectRatio(SORA_AR),
      ...params.duration(SORA_DURATIONS, 4),
    },
  },
  {
    id: 'sora-2-extend', name: 'Sora 2 Extend', modelId: 'sora-2',
    addedAt: '2026-02-10',
    workflow: 'openai/v1/videos/extensions', buildPayload: buildSora2ExtendPayload,
    estimatedTime: 17,
    mode: 'video', inputType: 'v2v',
    description: 'Seamlessly continue a previously generated Sora video with matching style and pacing.',
    features: [feat('Continue Video', 'input'), feat('4–20 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      // video_id is chained from the source Sora asset (declaring the param lets
      // the store seed ctx.videoId); no aspectRatio/size — extend keeps source geometry.
      ...params.videoId([], ''),
      ...params.duration(SORA_DURATIONS, 8),
    },
  },
]);

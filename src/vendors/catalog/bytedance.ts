/**
 * ByteDance — single source of truth.
 */
import { p } from '../../core/descriptors/presets.ts';
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

/**
 * Selectable output resolution tiers for video enhancement. Values are the exact
 * backend enum strings (`EnhanceVideoCommand.resolution`); `source` is an
 * SDK-only sentinel meaning "keep the source resolution", which the backend
 * expresses by omitting the field — see `bytedance.payloads.ts`.
 */
export const BYTEDANCE_ENHANCE_RESOLUTION_OPTIONS = [
  'source',
  '720p',
  '1080p',
  '2k',
  '4k',
  '8k',
] as const;

/**
 * Output frame rates. The backend accepts any integer in 15..120, but it prices
 * in three tiers (<=30 / <=60 / >60), so only the tier boundaries are offered —
 * an intermediate value lands in the same tier at the same price.
 */
export const BYTEDANCE_ENHANCE_FPS_OPTIONS = [30, 60, 120] as const;

/** Preset enhancement templates. Only take effect on the `standard` version. */
export const BYTEDANCE_ENHANCE_SCENE_OPTIONS = [
  'common',
  'ugc',
  'short_series',
  'aigc',
  'old_film',
] as const;

export const buildBytedanceUpscalerPayload: PayloadBuilder = (ctx) => ({
  video_url: ctx.videoUrl,
  target_resolution: '1080p',
});

export const buildBytedanceOmnihumanPayload: PayloadBuilder = (ctx) => ({
  image_url: ctx.imageUrls?.[0],
  audio_url: ctx.audioUrl,
  ...(ctx.prompt ? { prompt: ctx.prompt } : {}),
});

export const { MODELS } = defineModels('bytedance', [
  {
    id: 'bytedance-video-upscaler', name: 'ByteDance Upscaler',
    addedAt: '2026-02-06',
    workflow: 'bytedance-upscaler/upscale/video', buildPayload: buildBytedanceUpscalerPayload,
    estimatedTime: 88,
    mode: 'video', inputType: 'v2v',
    description: 'AI upscale video resolution — enhance existing footage to 1080p.',
    features: [feat('Video Input', 'input'), feat('1080p', 'resolution')],
    // Vendor rejects sources already at/above the 1080p target: "The input
    // video must have one side of length less than 1080 pixels for 1080p
    // upscale" — so the shorter side may be at most 1079.
    paramConfig: { ...params.videoInput('Video to Upscale', 'reference', true, undefined, 1079) },
  },
  {
    id: 'bytedance-omnihuman-v1.5', name: 'ByteDance OmniHuman',
    addedAt: '2026-02-06',
    workflow: 'bytedance/omnihuman/v1.5', buildPayload: buildBytedanceOmnihumanPayload,
    estimatedTime: 179,
    mode: 'video', inputType: 'i2v',
    description: 'Animate a portrait with realistic body movement driven by audio.',
    features: [feat('Image Input', 'input'), feat('Audio Input', 'audio')],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.imageInput(1, 'Portrait Image', true),
      ...params.audioInput('Audio Track', true),
    },
  },
  {
    id: 'bytedance-video-enhance', name: 'ByteDance Video Enhance',
    addedAt: '2026-07-29',
    workflow: 'bytedance/video-enhance',
    // Measured on the live API: 303s end-to-end for a 5s 720p→1080p@60fps
    // professional run. Wall time scales with source duration, so this is a
    // representative short-clip figure, not a ceiling.
    estimatedTime: 300,
    mode: 'video', inputType: 'v2v',
    // The pa-bytedance-pluggable-worker MR adding this task is still open, so
    // the workflow is not deployed. Flip this off once the worker ships.
    disabled: true,
    description: 'Denoise, color-correct and super-resolve existing footage up to 8K, with frame-rate conversion.',
    features: [feat('Video Required', 'input'), feat('Up to 8K', 'resolution'), feat('Enhance', 'quality')],
    paramConfig: {
      ...params.videoInput('Source Video', 'asset', true),
      ...p.quality(['standard', 'professional'], 'standard'),
      ...p.enum('resolution', [...BYTEDANCE_ENHANCE_RESOLUTION_OPTIONS], 'source'),
      // Always sent — the backend rejects a request it cannot price, and the
      // source frame rate is not discoverable from file metadata.
      ...p.enum('fps', [...BYTEDANCE_ENHANCE_FPS_OPTIONS], 30),
      ...p.enum('scene', [...BYTEDANCE_ENHANCE_SCENE_OPTIONS], 'common'),
      ...p.enum('bitrateLevel', ['low', 'medium', 'high'], 'medium'),
    },
    constraints: [
      {
        when: { quality: { is: 'professional' } },
        then: { scene: { disabled: true, reason: 'Scene presets only apply to the standard version' } },
      },
    ],
  },
]);

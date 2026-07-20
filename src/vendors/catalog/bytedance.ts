/**
 * ByteDance — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

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
]);

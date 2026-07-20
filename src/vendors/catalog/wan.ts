/**
 * Wan — single source of truth (video + image).
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

export const buildWanT2VPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  resolution: ctx.resolution ?? '720p',
  duration: ctx.duration ?? 5,
  ...(ctx.startFrame ? { image_url: ctx.startFrame } : {}),
  ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
  ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
});

export const buildWanI2VPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  image_url: ctx.startFrame,
  resolution: '720p',
  duration: ctx.duration ?? 5,
  ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
});

export const buildWanR2VPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  video_urls: [ctx.videoUrl],
  resolution: '720p',
  duration: ctx.duration ?? 5,
});

const buildWanImagePayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  model: 'wan-2.6',
  count: ctx.count ?? 1,
  ...(ctx.negativePrompt ? { modelOptions: { negative_prompt: ctx.negativePrompt } } : {}),
});

// ── Wan 2.7 payload builders ─────────────────────────────────────

export const buildWan27T2VPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  resolution: ctx.resolution ?? '720P',
  ratio: ctx.aspectRatio ?? '16:9',
  duration: ctx.duration ?? 5,
  prompt_extend: ctx.enhancePrompt ?? true,
  ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
  ...(ctx.audioUrl ? { audio_url: ctx.audioUrl } : {}),
  ...(ctx.seed != null ? { seed: ctx.seed } : {}),
});

export const buildWan27I2VPayload: PayloadBuilder = (ctx) => {
  // Fallback to imageUrls[0] when startFrame isn't explicitly set — mirrors
  // the seedance-2.0 pattern. Required because the default test-context
  // generator populates imageUrls (not startFrame) for i2v models.
  const firstFrameUrl = ctx.startFrame ?? ctx.imageUrls?.[0];
  const media: Array<{ type: string; url: string }> = [];
  if (firstFrameUrl) media.push({ type: 'first_frame', url: firstFrameUrl });
  if (ctx.endFrame) media.push({ type: 'last_frame', url: ctx.endFrame });
  if (ctx.audioUrl) media.push({ type: 'driving_audio', url: ctx.audioUrl });
  return {
    media,
    resolution: ctx.resolution ?? '720P',
    duration: ctx.duration ?? 5,
    prompt_extend: ctx.enhancePrompt ?? true,
    ...(ctx.prompt ? { prompt: ctx.prompt } : {}),
    ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
    ...(ctx.seed != null ? { seed: ctx.seed } : {}),
  };
};

export const buildWan27R2VPayload: PayloadBuilder = (ctx) => {
  const media: Array<{ type: string; url: string }> = [];
  if (ctx.imageUrls?.length) {
    for (const url of ctx.imageUrls) media.push({ type: 'reference_image', url });
  }
  if (ctx.videoUrl) media.push({ type: 'reference_video', url: ctx.videoUrl });
  return {
    prompt: ctx.prompt,
    media,
    resolution: ctx.resolution ?? '720P',
    ratio: ctx.aspectRatio ?? '16:9',
    duration: ctx.duration ?? 5,
    ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
    ...(ctx.seed != null ? { seed: ctx.seed } : {}),
  };
};

export const buildWan27VideoEditPayload: PayloadBuilder = (ctx) => {
  const media: Array<{ type: string; url: string }> = [];
  if (ctx.videoUrl) media.push({ type: 'video', url: ctx.videoUrl });
  if (ctx.imageUrls?.length) {
    for (const url of ctx.imageUrls.slice(0, 3)) media.push({ type: 'reference_image', url });
  }
  return {
    media,
    resolution: ctx.resolution ?? '720P',
    ...(ctx.prompt ? { prompt: ctx.prompt } : {}),
    ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
    ...(ctx.aspectRatio ? { ratio: ctx.aspectRatio } : {}),
    ...(ctx.seed != null ? { seed: ctx.seed } : {}),
  };
};

// ── Wan 2.7 shared constants ─────────────────────────────────────
const WAN27_AR = ['16:9', '9:16', '1:1', '4:3', '3:4'];
const WAN27_RES = ['720P', '1080P'];

export const { MODELS } = defineModels('wan', [
  // ── Video ─────────────────────────────────────────
  {
    id: 'wan-2.6-t2v', name: 'Wan 2.6', modelId: 'wan2.6-t2v',
    addedAt: '2026-02-06',
    deprecated: true, // superseded by wan-2.7-t2v
    workflow: 'wan/v2.6/text-to-video', editWorkflow: 'wan/v2.6/image-to-video',
    buildPayload: buildWanT2VPayload, buildEditPayload: buildWanI2VPayload,
    estimatedTime: { '480p': 40, '720p': 50, '1080p': 50 }, editEstimatedTime: 14,
    mode: 'video', inputType: 't2v',
    description: 'Painterly artistic look with audio — up to 15s at 1080p, cfg adjustable.',
    features: [feat('Image Input', 'input'), feat('Start Frame', 'frame'), feat('Audio', 'audio'), feat('1080p', 'resolution'), feat('5/10/15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration([5, 10, 15], 5),
      ...params.resolution(['480p', '720p', '1080p'], '720p'),
      ...params.aspectRatio(['16:9', '9:16', '1:1', '4:3', '3:4']),
      ...params.negativePrompt(),
      ...params.cfgScale(1, 10, 5, 0.5),
      ...params.startFrame(),
    },
  },
  {
    id: 'wan-2.6-r2v', name: 'Wan 2.6 Ref-to-Video', modelId: 'wan2.6-r2v',
    addedAt: '2026-02-06',
    deprecated: true, // superseded by wan-2.7-r2v
    workflow: 'wan/v2.6/reference-to-video', buildPayload: buildWanR2VPayload,
    estimatedTime: 26,
    mode: 'video', inputType: 'v2v',
    description: 'Regenerate video from a reference clip with new stylistic direction.',
    features: [feat('Video Input', 'input'), feat('1080p', 'resolution'), feat('5/10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration([5, 10], 5),
      ...params.resolution(['720p', '1080p'], '720p'),
      ...params.videoInput('Reference Video'),
    },
  },
  // ── Image ─────────────────────────────────────────
  {
    id: 'wan-2.6-image', name: 'Wan 2.6 Image', modelId: 'wan2.6-t2i',
    addedAt: '2026-03-01',
    workflow: 'image-gen-flow', buildPayload: buildWanImagePayload,
    mode: 'image', inputType: 't2i', deprecated: true,
    description: 'Diverse, stylized images for visual exploration and animation.',
    features: [feat('Multi-Image Input', 'input')],
    paramConfig: {
      ...params.prompt(),
      ...params.count(),
      ...params.negativePrompt(),
    },
  },
  // ── Wan 2.7 Video ───────────────────────────────────
  {
    id: 'wan-2.7-t2v', name: 'Wan 2.7', modelId: 'wan2.7-t2v',
    addedAt: '2026-03-30',
    workflow: 'wan/v2/text-to-video', editWorkflow: 'wan/v2/image-to-video',
    buildPayload: buildWan27T2VPayload, buildEditPayload: buildWan27I2VPayload,
    estimatedTime: { '720P': 120, '1080P': 120 }, editEstimatedTime: 120,
    mode: 'video', inputType: 't2v',
    badge: ['popular'],
    description: 'Wan 2.7 T2V — up to 15s at 1080p with audio input and prompt enhancement.',
    features: [feat('Image Input', 'input'), feat('Start Frame', 'frame'), feat('Audio', 'audio'), feat('1080P', 'resolution'), feat('5/10/15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration([5, 10, 15], 5),
      ...params.resolution(WAN27_RES, '720P'),
      ...params.aspectRatio(WAN27_AR),
      ...params.negativePrompt(),
      ...params.enhancePrompt(true),
      ...params.audioInput('Audio Track'),
      ...params.startFrame(),
    },
  },
  {
    id: 'wan-2.7-i2v', name: 'Wan 2.7 Image-to-Video', modelId: 'wan2.7-i2v',
    addedAt: '2026-03-30',
    workflow: 'wan/v2/image-to-video',
    buildPayload: buildWan27I2VPayload,
    estimatedTime: 120,
    mode: 'video', inputType: 'i2v',
    badge: ['popular'],
    description: 'Wan 2.7 I2V — animate images with start/end frame and optional driving audio.',
    features: [feat('Start/End Frame', 'frame'), feat('Audio', 'audio'), feat('1080P', 'resolution'), feat('5/10/15 sec', 'duration')],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.duration([5, 10, 15], 5),
      ...params.resolution(WAN27_RES, '720P'),
      ...params.negativePrompt(),
      ...params.enhancePrompt(true),
      ...params.startFrame('Start Frame', true),
      ...params.endFrame(),
      ...params.audioInput('Driving Audio'),
    },
  },
  {
    id: 'wan-2.7-r2v', name: 'Wan 2.7 Ref-to-Video', modelId: 'wan2.7-r2v',
    addedAt: '2026-03-30',
    workflow: 'wan/v2/reference-to-video',
    buildPayload: buildWan27R2VPayload,
    estimatedTime: 26,
    mode: 'video', inputType: 'v2v',
    badge: ['popular'],
    description: 'Wan 2.7 R2V — generate video from reference images/video with style direction.',
    features: [feat('Multi-Image Input', 'input'), feat('Video Input', 'input'), feat('1080P', 'resolution'), feat('5/10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration([5, 10], 5),
      ...params.resolution(WAN27_RES, '720P'),
      ...params.aspectRatio(WAN27_AR),
      ...params.negativePrompt(),
      ...params.imageInput(5, 'Reference Images', true),
      ...params.videoInput('Reference Video'),
    },
  },
  {
    id: 'wan-2.7-video-edit', name: 'Wan 2.7 Video Edit', modelId: 'wan2.7-videoedit',
    addedAt: '2026-03-30',
    workflow: 'wan/v2/video-edit',
    buildPayload: buildWan27VideoEditPayload,
    estimatedTime: 26,
    mode: 'video', inputType: 'v2v',
    badge: ['popular'],
    description: 'Wan 2.7 Video Edit — restyle or modify existing video with reference images.',
    features: [feat('Video Input', 'input'), feat('Image Input', 'input'), feat('1080P', 'resolution')],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.resolution(WAN27_RES, '720P'),
      ...params.aspectRatio(WAN27_AR),
      ...params.negativePrompt(),
      ...params.videoInput('Source Video'),
      ...params.imageInput(3, 'Reference Images'),
    },
  },
]);

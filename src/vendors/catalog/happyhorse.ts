/**
 * Happy Horse 1.0 — Alibaba ATH (single source of truth).
 *
 * Backend ETA: getVideoGenerationETA({ resolution, duration }) — shared with Wan 2.7.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

// `watermark: false` overrides Alibaba's vendor default (true), which would
// otherwise stamp "Happy Horse" in the bottom-right corner. Backend forwarding
// and Alibaba honoring confirmed via boundary probe on 2026-05-11
// (scripts/api-tests/happyhorse-boundary-probe.mjs).
export const buildHHT2VPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  resolution: ctx.resolution ?? '720P',
  ratio: ctx.aspectRatio ?? '16:9',
  duration: ctx.duration ?? 5,
  watermark: false,
  ...(ctx.seed != null ? { seed: ctx.seed } : {}),
});

export const buildHHI2VPayload: PayloadBuilder = (ctx) => {
  const firstFrameUrl = ctx.startFrame ?? ctx.imageUrls?.[0];
  const media: Array<{ type: string; url: string }> = [];
  if (firstFrameUrl) media.push({ type: 'first_frame', url: firstFrameUrl });
  return {
    media,
    resolution: ctx.resolution ?? '720P',
    duration: ctx.duration ?? 5,
    watermark: false,
    ...(ctx.prompt ? { prompt: ctx.prompt } : {}),
    ...(ctx.seed != null ? { seed: ctx.seed } : {}),
  };
};

export const buildHHR2VPayload: PayloadBuilder = (ctx) => {
  const media = (ctx.imageUrls ?? []).map((url) => ({ type: 'reference_image', url }));
  return {
    prompt: ctx.prompt,
    media,
    resolution: ctx.resolution ?? '720P',
    ratio: ctx.aspectRatio ?? '16:9',
    duration: ctx.duration ?? 5,
    watermark: false,
    ...(ctx.seed != null ? { seed: ctx.seed } : {}),
  };
};

export const buildHHVideoEditPayload: PayloadBuilder = (ctx) => {
  const media: Array<{ type: string; url: string }> = [];
  if (ctx.videoUrl) media.push({ type: 'video', url: ctx.videoUrl });
  for (const url of (ctx.imageUrls ?? []).slice(0, 5)) {
    media.push({ type: 'reference_image', url });
  }
  return {
    prompt: ctx.prompt,
    media,
    resolution: ctx.resolution ?? '720P',
    watermark: false,
    ...(ctx.audioSetting ? { audio_setting: ctx.audioSetting } : {}),
    ...(ctx.seed != null ? { seed: ctx.seed } : {}),
  };
};

// Happy Horse 1.1 — same wire shape as 1.0, no video-edit task.
// Aspect ratios, resolution tiers and duration range are identical to 1.0
// per the published v1.1 OpenAPI schema. I2V supports only `first_frame`.
export const buildHH11T2VPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  resolution: ctx.resolution ?? '720P',
  ratio: ctx.aspectRatio ?? '16:9',
  duration: ctx.duration ?? 5,
  watermark: false,
  ...(ctx.seed != null ? { seed: ctx.seed } : {}),
});

export const buildHH11I2VPayload: PayloadBuilder = (ctx) => {
  const firstFrameUrl = ctx.startFrame ?? ctx.imageUrls?.[0];
  const media: Array<{ type: string; url: string }> = [];
  if (firstFrameUrl) media.push({ type: 'first_frame', url: firstFrameUrl });
  return {
    media,
    resolution: ctx.resolution ?? '720P',
    duration: ctx.duration ?? 5,
    watermark: false,
    ...(ctx.prompt ? { prompt: ctx.prompt } : {}),
    ...(ctx.seed != null ? { seed: ctx.seed } : {}),
  };
};

export const buildHH11R2VPayload: PayloadBuilder = (ctx) => {
  const media = (ctx.imageUrls ?? []).map((url) => ({ type: 'reference_image', url }));
  return {
    prompt: ctx.prompt,
    media,
    resolution: ctx.resolution ?? '720P',
    ratio: ctx.aspectRatio ?? '16:9',
    duration: ctx.duration ?? 5,
    watermark: false,
    ...(ctx.seed != null ? { seed: ctx.seed } : {}),
  };
};

const HH_AR = ['16:9', '9:16', '1:1', '4:3', '3:4'];
const HH_RES = ['720P', '1080P'];
const HH_DURATIONS = [5, 10, 15];

export const { MODELS } = defineModels('happyhorse', [
  {
    id: 'happyhorse-1.0-t2v', name: 'Happy Horse 1.0', modelId: 'happyhorse-1.0',
    addedAt: '2026-04-23',
    workflow: 'happyhorse/v1/text-to-video',
    editWorkflow: 'happyhorse/v1/image-to-video',
    buildPayload: buildHHT2VPayload,
    buildEditPayload: buildHHI2VPayload,
    estimatedTime: 30,
    mode: 'video', inputType: 't2v',
    description: 'Happy Horse 1.0 — up to 15s at 1080P with optional first-frame guidance.',
    features: [
      feat('Start Frame', 'frame'),
      feat('1080P', 'resolution'),
      feat('5/10/15 sec', 'duration'),
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(HH_AR, '16:9'),
      ...params.resolution(HH_RES, '720P'),
      ...params.duration(HH_DURATIONS, 5),
      ...params.startFrame(),
    },
  },
  {
    id: 'happyhorse-1.0-r2v', name: 'Happy Horse 1.0 Ref-to-Video', modelId: 'happyhorse-1.0',
    addedAt: '2026-05-05',
    workflow: 'happyhorse/v1/reference-to-video',
    buildPayload: buildHHR2VPayload,
    estimatedTime: 30,
    mode: 'video', inputType: 'i2v',
    badge: ['new'] as const,
    description: 'Generate video from up to 9 reference images — refer to them in the prompt as `[Image 1]`, `[Image 2]`, … in the same order they appear in the input list.',
    features: [
      feat('Multi-Image Input', 'input'),
      feat('1080P', 'resolution'),
      feat('5/10/15 sec', 'duration'),
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(HH_AR, '16:9'),
      ...params.resolution(HH_RES, '720P'),
      ...params.duration(HH_DURATIONS, 5),
      ...params.imageInput(9, 'Reference Images', true),
    },
  },
  {
    id: 'happyhorse-1.0-video-edit', name: 'Happy Horse 1.0 Video Edit', modelId: 'happyhorse-1.0',
    addedAt: '2026-05-05',
    workflow: 'happyhorse/v1/video-edit',
    buildPayload: buildHHVideoEditPayload,
    estimatedTime: 22,
    mode: 'video', inputType: 'v2v',
    badge: ['new'] as const,
    description: 'Edit video — style transfer or object replacement, with up to 5 references.',
    features: [
      feat('Video Input', 'input'),
      feat('Image Input', 'input'),
      feat('1080P', 'resolution'),
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.resolution(HH_RES, '720P'),
      ...params.audioSetting(),
      ...params.videoInput('Source Video'),
      ...params.imageInput(5, 'Reference Images'),
    },
  },
  {
    id: 'happyhorse-1.1-t2v', name: 'Happy Horse 1.1', modelId: 'happyhorse-1.1',
    addedAt: '2026-06-22',
    workflow: 'happyhorse/v1.1/text-to-video',
    editWorkflow: 'happyhorse/v1.1/image-to-video',
    buildPayload: buildHH11T2VPayload,
    buildEditPayload: buildHH11I2VPayload,
    estimatedTime: 30,
    mode: 'video', inputType: 't2v',
    description: 'Happy Horse 1.1 — up to 15s at 1080P with optional first-frame guidance.',
    features: [
      feat('Start Frame', 'frame'),
      feat('1080P', 'resolution'),
      feat('5/10/15 sec', 'duration'),
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(HH_AR, '16:9'),
      ...params.resolution(HH_RES, '720P'),
      ...params.duration(HH_DURATIONS, 5),
      ...params.startFrame(),
    },
  },
  {
    id: 'happyhorse-1.1-r2v', name: 'Happy Horse 1.1 Ref-to-Video', modelId: 'happyhorse-1.1',
    addedAt: '2026-06-22',
    workflow: 'happyhorse/v1.1/reference-to-video',
    buildPayload: buildHH11R2VPayload,
    estimatedTime: 30,
    mode: 'video', inputType: 'i2v',
    description: 'Generate video from up to 9 reference images — refer to them in the prompt as `[Image 1]`, `[Image 2]`, … in the same order they appear in the input list.',
    features: [
      feat('Multi-Image Input', 'input'),
      feat('1080P', 'resolution'),
      feat('5/10/15 sec', 'duration'),
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(HH_AR, '16:9'),
      ...params.resolution(HH_RES, '720P'),
      ...params.duration(HH_DURATIONS, 5),
      ...params.imageInput(9, 'Reference Images', true),
    },
  },
]);

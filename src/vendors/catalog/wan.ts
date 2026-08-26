/**
 * Wan — single source of truth (video + image).
 */
import type { Constraint, PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

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

// ── Wan 3.0 constraints ──────────────────────────────────────────
// Schema: "Reference and frame types are mutually exclusive within one
// request." Start/End frame slots (first_frame/last_frame) cannot be combined
// with reference images/videos/audios — the backend rejects mixed content.
const WAN_V3_FRAME_REF_REASON = 'Start/End frames cannot be combined with reference images, videos, or audios';
const wanV3Constraints: Constraint[] = [
  // any reference input active → disable frame slots
  { when: { imageUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    endFrame:   { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
  } },
  { when: { videoUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    endFrame:   { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
  } },
  { when: { audioUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    endFrame:   { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
  } },
  // any frame slot active → disable reference inputs (mirror, blocks inverse order)
  { when: { startFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    videoUrls: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    audioUrls: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
  } },
  { when: { endFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    videoUrls: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    audioUrls: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
  } },
];

// Shared by wan-3.0-video and wan-3.0-video-prime — identical models, prime is faster.
const wanV3Features = [feat('Image Input', 'input'), feat('Video Input', 'input'), feat('Audio', 'audio'), feat('Start/End Frame', 'frame'), feat('1080P', 'resolution'), feat('Adaptive Ratio', 'resolution')];
const wanV3ParamConfig = {
  ...params.prompt(),
  ...params.duration([5, 10, 15, 30], 5),
  ...params.resolution(['480P', '720P', '1080P'], '1080P'),
  ...params.aspectRatio(['16:9', '9:16', '1:1', '4:3', '3:4', 'adaptive']),
  ...params.generateAudio(true),
  ...params.startFrame(),
  ...params.endFrame(),
  ...params.imageInput(10, 'Reference Images'),
  ...params.videoInputs(5, 'Reference Videos', false),
  ...params.audioInputs(5, 'Reference Audios'),
  ...p.boolean('enableThinking', false, 'Deep Thinking'),
  ...p.boolean('watermark', false, 'Watermark'),
  ...p.range('seed', 0, 2147483647, 0, { label: 'Seed' }),
};

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
  // ── Wan 3.0 all-in-one Video ─────────────────────────
  // wan-3.0-video and wan-3.0-video-prime share the wan/v3/video workflow and
  // the full param surface — the backend `model` enum value (hardcoded per
  // entry in wan.payloads.ts) is the only wire difference. Prime is the same
  // model, up to 7x faster.
  {
    id: 'wan-3.0-video', name: 'Wan 3.0', modelId: 'wan3.0-video',
    addedAt: '2026-08-03',
    // Single all-in-one endpoint — text, image/video/audio references, and
    // start/end frames. buildPayload registered in wan.payloads.ts.
    workflow: 'wan/v3/video',
    estimatedTime: 120,
    mode: 'video', inputType: 't2v',
    description: 'Wan 3.0 all-in-one — text, image/video/audio references, and start/end frames with adaptive ratio, intelligent duration, and audio.',
    features: [...wanV3Features],
    constraints: wanV3Constraints,
    // Generations at 1080P / long durations can outlast the global 10-min
    // polling default — widen to 5s × 360 attempts (30 min).
    pollOptions: { intervalMs: 5000, maxAttempts: 360 },
    paramConfig: { ...wanV3ParamConfig },
  },
  {
    id: 'wan-3.0-video-prime', name: 'Wan 3.0 Prime', modelId: 'wan3.0-video-prime',
    addedAt: '2026-08-26',
    workflow: 'wan/v3/video',
    estimatedTime: 30,
    mode: 'video', inputType: 't2v',
    description: 'Wan 3.0 Prime — the same all-in-one model as Wan 3.0, up to 7x faster.',
    features: [...wanV3Features],
    constraints: wanV3Constraints,
    pollOptions: { intervalMs: 5000, maxAttempts: 360 },
    paramConfig: { ...wanV3ParamConfig },
  },
]);

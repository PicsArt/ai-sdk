/**
 * Luma — single source of truth.
 * GOTCHA: duration is string with 's' suffix: "5s", "9s" (NOT "10s").
 *
 * UNI-1: combined-entry T2I (workflow) + image-edit (editWorkflow). For the
 * image-edit path, `ctx.imageUrls[0]` becomes the source image; remaining
 * `imageUrls` (when more than one) become `image_ref[]` references.
 */
import type { Constraint, PayloadBuilder } from '../../core/types.ts';
import { p } from '../../core/descriptors/presets.ts';
import { defineModels, feat, params } from '../define.ts';

/** Ray 2 T2V + I2V (unified). keyframes added when image present.
 *  UI puts first frame in imageUrls[0], last frame in imageUrls[1]. */
export const buildLumaRay2Payload: PayloadBuilder = (ctx) => {
  const keyframes: Record<string, unknown> = {};
  if (ctx.startFrame) keyframes.frame0 = { type: 'image', url: ctx.startFrame };
  if (ctx.endFrame) keyframes.frame1 = { type: 'image', url: ctx.endFrame };
  return {
    prompt: ctx.prompt,
    model: 'ray-2',
    ...(Object.keys(keyframes).length ? { keyframes } : {}),
    aspect_ratio: ctx.aspectRatio ?? '16:9',
    resolution: ctx.resolution ?? '720p',
    duration: `${ctx.duration ?? 5}s`,
  };
};

/** Flash 2 I2V — same as Ray 2 I2V but with ray-flash-2 model. */
export const buildLumaFlash2I2VPayload: PayloadBuilder = (ctx) => {
  const keyframes: Record<string, unknown> = {};
  if (ctx.startFrame) keyframes.frame0 = { type: 'image', url: ctx.startFrame };
  if (ctx.endFrame) keyframes.frame1 = { type: 'image', url: ctx.endFrame };
  return {
    prompt: ctx.prompt,
    model: 'ray-flash-2',
    ...(Object.keys(keyframes).length ? { keyframes } : {}),
    aspect_ratio: ctx.aspectRatio ?? '16:9',
    resolution: ctx.resolution ?? '720p',
    duration: `${ctx.duration ?? 5}s`,
  };
};

const WORKFLOW = 'luma-image-to-video-generation';
const REFRAME_WORKFLOW = 'luma-media-reframe';

/** Reframe video — input video is reframed to a target aspect ratio.
 *  Note: image reframe is not supported by Luma Ray models. */
const makeReframeVideoPayload = (model: 'ray-2' | 'ray-flash-2'): PayloadBuilder => (ctx) => ({
  generation_type: 'reframe_video',
  model,
  media: { url: ctx.videoUrl ?? '' },
  aspect_ratio: ctx.aspectRatio ?? '16:9',
  ...(ctx.prompt ? { prompt: ctx.prompt } : {}),
});

export const buildLumaRay2ReframeVideoPayload: PayloadBuilder = makeReframeVideoPayload('ray-2');
export const buildLumaRayFlash2ReframeVideoPayload: PayloadBuilder = makeReframeVideoPayload('ray-flash-2');

const LUMA_AR = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9', '9:21'];
const LUMA_RESOLUTIONS = ['540p', '720p', '1080p', '4k'];

const lumaParamConfig = {
  ...params.prompt(),
  ...params.aspectRatio(LUMA_AR),
  ...params.resolution(LUMA_RESOLUTIONS, '720p'),
  ...params.duration([5, 9], 5),
};

const LUMA_UNI1_AR = ['3:1', '2:1', '16:9', '3:2', '1:1', '2:3', '9:16', '1:2', '1:3'];
const LUMA_UNI1_STYLES = [
  { id: 'auto', label: 'Auto' },
  { id: 'manga', label: 'Manga' },
];

/** UNI-1 T2I — `model` selects between uni-1 / uni-1-max at the catalog level. */
const makeUni1T2IPayload = (model: 'uni-1' | 'uni-1-max'): PayloadBuilder => (ctx) => ({
  prompt: ctx.prompt,
  model,
  ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
  ...(ctx.style ? { style: ctx.style } : {}),
  ...(ctx.imageUrls?.length ? { image_ref: ctx.imageUrls.map((url) => ({ url })) } : {}),
});

/** UNI-1 image-edit — first image is the source; the rest become `image_ref[]`.
 *  Falls back to `ctx.startFrame` so prompt-bar single-image uploads route here too. */
const makeUni1I2IPayload = (model: 'uni-1' | 'uni-1-max'): PayloadBuilder => (ctx) => {
  const sourceUrl = ctx.startFrame ?? ctx.imageUrls?.[0];
  const refsBase = ctx.startFrame ? ctx.imageUrls : ctx.imageUrls?.slice(1);
  const refs = refsBase?.length ? refsBase.map((url) => ({ url })) : [];
  return {
    prompt: ctx.prompt,
    ...(sourceUrl ? { source: { url: sourceUrl } } : {}),
    model,
    ...(ctx.style ? { style: ctx.style } : {}),
    ...(refs.length ? { image_ref: refs } : {}),
  };
};

export const buildLumaUni1T2IPayload: PayloadBuilder = makeUni1T2IPayload('uni-1');
export const buildLumaUni1I2IPayload: PayloadBuilder = makeUni1I2IPayload('uni-1');
export const buildLumaUni1MaxT2IPayload: PayloadBuilder = makeUni1T2IPayload('uni-1-max');
export const buildLumaUni1MaxI2IPayload: PayloadBuilder = makeUni1I2IPayload('uni-1-max');

const lumaUni1ParamConfig = {
  ...params.prompt({ maxLength: 6000 }),
  ...params.aspectRatio(LUMA_UNI1_AR, '1:1'),
  ...params.style(LUMA_UNI1_STYLES, 'auto'),
  ...params.imageInput(9, 'Reference Images', false),
};

// ── Luma Ray 3.2 (early access) ──────────────────────────────────────
// New workflows: luma-ray32-video (t2v/i2v/interpolation/extend),
// luma-ray32-video-edit (v2v), luma-ray32-video-reframe (v2v).
// Schemas pin the model via the workflow name (no `model` field) and nest
// output knobs under `video: {...}`. Resolutions: 540p/720p/1080p (no 4K);
// duration: "5s"/"10s". Builders live in ./luma.payloads.ts.
const RAY32_AR = ['9:16', '3:4', '1:1', '4:3', '16:9', '21:9'];
const RAY32_RESOLUTIONS = ['540p', '720p', '1080p'];
const RAY32_EDIT_STRENGTHS = [
  { id: 'adhere_1', label: 'Adhere 1' },
  { id: 'adhere_2', label: 'Adhere 2' },
  { id: 'adhere_3', label: 'Adhere 3' },
  { id: 'flex_1', label: 'Flex 1' },
  { id: 'flex_2', label: 'Flex 2' },
  { id: 'flex_3', label: 'Flex 3' },
  { id: 'reimagine_1', label: 'Reimagine 1' },
  { id: 'reimagine_2', label: 'Reimagine 2' },
  { id: 'reimagine_3', label: 'Reimagine 3' },
];

/**
 * Ray 3.2 video constraints (Ray 3.2 Agents API reference, 2026-06-02):
 *  - `duration: 10s` is incompatible with anchor frames (start/end), `hdr`,
 *    `exrExport` (which forces hdr), and `loop` — all only valid at 5s.
 *  - `hdr` (and EXR, which requires hdr) is not supported at `540p`.
 * Declared in both directions so the UI greys out whichever option the user
 * sets second.
 */
const FRAMES_5S = 'Start/end frames require 5s duration';
const HDR_10S = 'HDR is not supported with 10s duration';
const EXR_10S = 'EXR export (requires HDR) is not supported with 10s duration';
const LOOP_10S = 'Looping is not supported with 10s duration';
const HDR_540P = 'HDR is not supported at 540p';
const LOOP_HDR = 'Looping is not supported with HDR (or EXR, which requires HDR)';

const ray32VideoConstraints: Constraint[] = [
  // A 10s-incompatible option pins duration to 5s.
  { when: { startFrame: { exists: true } }, then: { duration: { allowed: [5], reason: FRAMES_5S } } },
  { when: { endFrame: { exists: true } }, then: { duration: { allowed: [5], reason: FRAMES_5S } } },
  { when: { hdr: { is: true } }, then: { duration: { allowed: [5], reason: HDR_10S } } },
  { when: { exrExport: { is: true } }, then: { duration: { allowed: [5], reason: EXR_10S } } },
  { when: { loop: { is: true } }, then: { duration: { allowed: [5], reason: LOOP_10S } } },
  // Choosing 10s greys out everything it can't combine with.
  { when: { duration: { is: 10 } }, then: {
    startFrame: { disabled: true, reason: FRAMES_5S },
    endFrame: { disabled: true, reason: FRAMES_5S },
    hdr: { disabled: true, reason: HDR_10S },
    exrExport: { disabled: true, reason: EXR_10S },
    loop: { disabled: true, reason: LOOP_10S },
  } },
  // HDR (and EXR ⇒ HDR) is incompatible with 540p, both directions.
  { when: { hdr: { is: true } }, then: { resolution: { allowed: ['720p', '1080p'], reason: HDR_540P } } },
  { when: { exrExport: { is: true } }, then: { resolution: { allowed: ['720p', '1080p'], reason: HDR_540P } } },
  { when: { resolution: { is: '540p' } }, then: {
    hdr: { disabled: true, reason: HDR_540P },
    exrExport: { disabled: true, reason: HDR_540P },
  } },
  // Looping cannot combine with HDR (and EXR ⇒ HDR), both directions.
  { when: { hdr: { is: true } }, then: { loop: { disabled: true, reason: LOOP_HDR } } },
  { when: { exrExport: { is: true } }, then: { loop: { disabled: true, reason: LOOP_HDR } } },
  { when: { loop: { is: true } }, then: {
    hdr: { disabled: true, reason: LOOP_HDR },
    exrExport: { disabled: true, reason: LOOP_HDR },
  } },
];

/** Ray 3.2 edit constraints: same hdr/exr ↔ 10s and hdr ↔ 540p rules
 *  (the edit surface has no anchor frames or loop). */
const ray32EditConstraints: Constraint[] = [
  { when: { hdr: { is: true } }, then: { duration: { allowed: [5], reason: HDR_10S } } },
  { when: { exrExport: { is: true } }, then: { duration: { allowed: [5], reason: EXR_10S } } },
  { when: { duration: { is: 10 } }, then: {
    hdr: { disabled: true, reason: HDR_10S },
    exrExport: { disabled: true, reason: EXR_10S },
  } },
  { when: { hdr: { is: true } }, then: { resolution: { allowed: ['720p', '1080p'], reason: HDR_540P } } },
  { when: { exrExport: { is: true } }, then: { resolution: { allowed: ['720p', '1080p'], reason: HDR_540P } } },
  { when: { resolution: { is: '540p' } }, then: {
    hdr: { disabled: true, reason: HDR_540P },
    exrExport: { disabled: true, reason: HDR_540P },
  } },
];

export const { MODELS } = defineModels('luma', [
  {
    id: 'luma-ray-2', name: 'Luma Ray 2',
    addedAt: '2026-02-06',
    workflow: WORKFLOW, editWorkflow: WORKFLOW,
    buildPayload: buildLumaRay2Payload,
    estimatedTime: 18, editEstimatedTime: 24,
    mode: 'video', inputType: 't2v',
    description: 'Smooth video with a dreamy, polished aesthetic — up to 4K resolution.',
    features: [feat('Image Input', 'input'), feat('Start/End Frame', 'frame'), feat('Up to 4K', 'resolution'), feat('5/9 sec', 'duration')],
    paramConfig: { ...lumaParamConfig, ...params.startFrame(), ...params.endFrame() },
  },
  {
    id: 'luma-ray-flash-2', name: 'Luma Flash 2',
    addedAt: '2026-02-06',
    workflow: WORKFLOW,
    buildPayload: buildLumaFlash2I2VPayload,
    estimatedTime: 9,
    mode: 'video', inputType: 'i2v',
    description: 'Quick image-to-video with smooth, stylized motion — up to 4K.',
    features: [feat('Image Input', 'input'), feat('Start/End Frame', 'frame'), feat('Up to 4K', 'resolution'), feat('5/9 sec', 'duration')],
    paramConfig: { ...lumaParamConfig, ...params.startFrame('Start Frame', true), ...params.endFrame() },
  },
  // ── Reframe video (ray-2 + ray-flash-2; image reframe not supported) ──
  {
    id: 'luma-ray-2-reframe-video', name: 'Luma Ray 2 Reframe', modelId: 'luma-ray-2',
    addedAt: '2026-05-21',
    workflow: REFRAME_WORKFLOW,
    buildPayload: buildLumaRay2ReframeVideoPayload,
    estimatedTime: 20,
    mode: 'video', inputType: 'v2v',
    description: 'Reframe a video to a new aspect ratio using Luma Ray 2.',
    features: [feat('Video Input', 'input'), feat('Reframe', 'characteristic')],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.aspectRatio(LUMA_AR, '16:9'),
      ...params.videoInput('Source Video'),
    },
  },
  {
    id: 'luma-ray-flash-2-reframe-video', name: 'Luma Flash 2 Reframe', modelId: 'luma-ray-flash-2',
    addedAt: '2026-05-21',
    workflow: REFRAME_WORKFLOW,
    buildPayload: buildLumaRayFlash2ReframeVideoPayload,
    estimatedTime: 12,
    mode: 'video', inputType: 'v2v',
    description: 'Reframe a video to a new aspect ratio using Luma Flash 2.',
    features: [feat('Video Input', 'input'), feat('Reframe', 'characteristic')],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.aspectRatio(LUMA_AR, '16:9'),
      ...params.videoInput('Source Video'),
    },
  },
  {
    id: 'luma-uni-1', name: 'Luma UNI-1',
    addedAt: '2026-05-20',
    workflow: 'luma-uni1-text-to-image',
    editWorkflow: 'luma-uni1-image-edit',
    buildPayload: buildLumaUni1T2IPayload,
    buildEditPayload: buildLumaUni1I2IPayload,
    estimatedTime: 50,
    mode: 'image', inputType: 't2i',
    description: 'Luma UNI-1 — agentic image generation and editing with up to 9 reference images.',
    features: [feat('Multi-Image Input', 'input'), feat('Edit', 'characteristic'), feat('Styles', 'style')],
    paramConfig: lumaUni1ParamConfig,
  },
  {
    id: 'luma-uni-1-max', name: 'Luma UNI-1 Max',
    addedAt: '2026-05-20',
    workflow: 'luma-uni1-text-to-image',
    editWorkflow: 'luma-uni1-image-edit',
    buildPayload: buildLumaUni1MaxT2IPayload,
    buildEditPayload: buildLumaUni1MaxI2IPayload,
    estimatedTime: 60,
    mode: 'image', inputType: 't2i',
    description: 'Luma UNI-1 Max — higher-quality UNI-1 variant with the same multi-reference editing controls.',
    features: [feat('Multi-Image Input', 'input'), feat('Edit', 'characteristic'), feat('Styles', 'style')],
    paramConfig: lumaUni1ParamConfig,
  },
  // ── Ray 3.2 (early access) — buildPayload registered in luma.payloads.ts ──
  {
    // modelId defaults to id ('luma-ray-3.2') — matches the backend pricing key.
    id: 'luma-ray-3.2', name: 'Luma Ray 3.2',
    addedAt: '2026-06-11',
    workflow: 'luma-ray32-video',
    estimatedTime: 30,
    mode: 'video', inputType: 't2v',
    description: 'Luma Ray 3.2 — high-fidelity video generation with start/end frames, HDR, and looping (early access).',
    features: [feat('Image Input', 'input'), feat('Start/End Frame', 'frame'), feat('HDR', 'characteristic'), feat('5/10 sec', 'duration')],
    paramConfig: {
      ...params.prompt({ maxLength: 6000 }),
      ...params.aspectRatio(RAY32_AR, '16:9'),
      ...params.resolution(RAY32_RESOLUTIONS, '720p'),
      ...params.duration([5, 10], 5),
      ...params.startFrame(),
      ...params.endFrame(),
      ...p.boolean('hdr', false, 'HDR'),
      ...p.boolean('exrExport', false, 'EXR Export'),
      ...p.boolean('loop', false, 'Loop'),
    },
    constraints: ray32VideoConstraints,
  },
  {
    id: 'luma-ray-3.2-edit', name: 'Luma Ray 3.2 Edit', modelId: 'luma-ray-3.2',
    addedAt: '2026-06-11',
    workflow: 'luma-ray32-video-edit',
    estimatedTime: 30,
    mode: 'video', inputType: 'v2v',
    description: 'Edit a prior video from a prompt using Luma Ray 3.2 — preservation-vs-reimagination presets (early access).',
    features: [feat('Video Input', 'input'), feat('Edit', 'characteristic'), feat('HDR', 'characteristic'), feat('5/10 sec', 'duration')],
    paramConfig: {
      ...params.prompt({ maxLength: 6000 }),
      // Source clip capped at 30s — video_edit rejects longer at ingest (422).
      ...params.videoInput('Source Video', 'reference', true, 30),
      ...params.resolution(RAY32_RESOLUTIONS, '720p'),
      ...params.duration([5, 10], 5),
      ...p.enum('editStrength', RAY32_EDIT_STRENGTHS, 'flex_2', { label: 'Edit Strength' }),
      ...p.boolean('hdr', false, 'HDR'),
      ...p.boolean('exrExport', false, 'EXR Export'),
    },
    constraints: ray32EditConstraints,
  },
  {
    id: 'luma-ray-3.2-reframe-video', name: 'Luma Ray 3.2 Reframe', modelId: 'luma-ray-3.2',
    addedAt: '2026-06-11',
    workflow: 'luma-ray32-video-reframe',
    estimatedTime: 20,
    mode: 'video', inputType: 'v2v',
    description: 'Reframe a video to a new aspect ratio using Luma Ray 3.2 (early access).',
    features: [feat('Video Input', 'input'), feat('Reframe', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 6000 }),
      ...params.aspectRatio(RAY32_AR, '16:9'),
      // Source clip capped at 30s — video_reframe rejects longer at ingest (422).
      ...params.videoInput('Source Video', 'reference', true, 30),
      ...params.resolution(RAY32_RESOLUTIONS, '720p'),
    },
  },
]);

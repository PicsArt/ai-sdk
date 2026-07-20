/**
 * LTX — single source of truth.
 *
 * LTX 2.0 models (ltxv-2/*) — Pro/Fast/Retake.
 * LTX 2.3 models (ltx-2.3/*) — upgraded Pro/Fast + new A2V & Extend capabilities.
 *
 * GOTCHA: 2.0 Retake workflow is `ltx-2/retake-video` NOT `ltxv-2/retake-video`.
 * NOTE: Pro supports duration [6,8,10], Fast supports long videos up to 20s.
 * NOTE: Fast long videos (>10s) require 25 FPS and 1080p resolution.
 * NOTE: 2.3 adds aspect_ratio and fps params to Pro/Fast workflows.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

// ── Shared constants ─────────────────────────────────────────────────
const PRO_DURATIONS = [6, 8, 10];
const FAST_DURATIONS = [6, 8, 10, 12, 14, 16, 18, 20];
const LTX_RESOLUTIONS = ['1080p', '1440p', '2160p'] as const;
const LTX_23_AR = ['16:9', '9:16'];

// ── LTX 2.0 payload builders ────────────────────────────────────────

/** T2V — prompt + duration/resolution/audio, optional image_url for I2V switch. */
export const buildLtxT2VPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  ...(ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0] } : {}),
  ...(ctx.duration != null ? { duration: ctx.duration } : {}),
  ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
  generate_audio: ctx.generateAudio ?? true,
});

/** I2V — prompt + image_url + duration/resolution/audio. */
export const buildLtxI2VPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  image_url: ctx.imageUrls?.[0],
  ...(ctx.duration != null ? { duration: ctx.duration } : {}),
  ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
  generate_audio: ctx.generateAudio ?? true,
});

/** Fast T2V + I2V (unified) — identical to buildLtxT2VPayload. */
export const buildLtxFastPayload = buildLtxT2VPayload;

/** Retake 2.0 — prompt + video_url + duration. */
export const buildLtxRetakePayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  video_url: ctx.videoUrl,
  ...(ctx.duration != null ? { duration: ctx.duration } : {}),
});

// ── LTX 2.3 payload builders ────────────────────────────────────────

/** 2.3 T2V — adds aspect_ratio to the 2.0 T2V payload. */
export const buildLtx23T2VPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  ...(ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0] } : {}),
  ...(ctx.duration != null ? { duration: ctx.duration } : {}),
  ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
  ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
  generate_audio: ctx.generateAudio ?? true,
});

/** 2.3 I2V — adds aspect_ratio to the 2.0 I2V payload. */
export const buildLtx23I2VPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  image_url: ctx.imageUrls?.[0],
  ...(ctx.duration != null ? { duration: ctx.duration } : {}),
  ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
  ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
  generate_audio: ctx.generateAudio ?? true,
});

/** 2.3 Fast — same shape as 2.3 T2V. */
export const buildLtx23FastPayload = buildLtx23T2VPayload;

/** 2.3 Audio-to-Video — audio_url required, optional prompt/image_url/guidance_scale. */
export const buildLtx23A2VPayload: PayloadBuilder = (ctx) => ({
  audio_url: ctx.audioUrl,
  ...(ctx.prompt ? { prompt: ctx.prompt } : {}),
  ...(ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0] } : {}),
  ...(ctx.cfgScale != null ? { guidance_scale: ctx.cfgScale } : {}),
});

/** 2.3 Extend — video_url required, optional prompt/duration. Mode defaults to 'end'. */
export const buildLtx23ExtendPayload: PayloadBuilder = (ctx) => ({
  video_url: ctx.videoUrl,
  ...(ctx.prompt ? { prompt: ctx.prompt } : {}),
  ...(ctx.duration != null ? { duration: ctx.duration } : {}),
  mode: 'end',
});

/** 2.3 Retake — video_url + prompt required, duration/retake_mode. */
export const buildLtx23RetakePayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  video_url: ctx.videoUrl,
  ...(ctx.duration != null ? { duration: ctx.duration } : {}),
  retake_mode: 'replace_audio_and_video',
});

// ── Model definitions ────────────────────────────────────────────────

export const { MODELS } = defineModels('ltx', [
  // ── LTX 2.0 ──────────────────────────────────────────────────────
  {
    id: 'ltx-pro-t2v', name: 'LTX Pro', modelId: 'ltx-v2-pro',
    addedAt: '2026-02-06',
    deprecated: true, // superseded by ltx-2.3-pro-t2v
    workflow: 'ltxv-2/text-to-video', editWorkflow: 'ltxv-2/image-to-video',
    buildPayload: buildLtxT2VPayload, buildEditPayload: buildLtxI2VPayload,
    estimatedTime: 75, editEstimatedTime: 78,
    mode: 'video', inputType: 't2v',
    description: '4K output with audio — streamlined for fast, production-ready results.',
    features: [feat('Image Input', 'input'), feat('Start Frame', 'frame'), feat('Audio', 'audio'), feat('4K', 'resolution'), feat('6/8/10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(PRO_DURATIONS, 6),
      ...params.resolution([...LTX_RESOLUTIONS]),
      ...params.generateAudio(),
      ...params.imageInput(),
    },
  },
  {
    id: 'ltx-v2-fast', name: 'LTX Fast',
    addedAt: '2026-02-06',
    deprecated: true, // superseded by ltx-2.3-fast-t2v
    workflow: 'ltxv-2/text-to-video/fast', editWorkflow: 'ltxv-2/image-to-video/fast',
    buildPayload: buildLtxFastPayload, buildEditPayload: buildLtxI2VPayload,
    estimatedTime: 38, editEstimatedTime: 40,
    mode: 'video', inputType: 't2v',
    description: 'Fast with long video support — up to 20s at 1080p, ideal for drafts and extended scenes.',
    features: [feat('Image Input', 'input'), feat('Fast', 'duration'), feat('Up to 20s', 'duration'), feat('Audio', 'audio'), feat('4K', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(FAST_DURATIONS, 6),
      ...params.resolution([...LTX_RESOLUTIONS]),
      ...params.generateAudio(),
      ...params.imageInput(),
    },
  },
  {
    id: 'ltx-v2-retake', name: 'LTX Retake',
    addedAt: '2026-02-06',
    deprecated: true, // superseded by ltx-2.3-retake
    workflow: 'ltx-2/retake-video', buildPayload: buildLtxRetakePayload,
    estimatedTime: 33,
    mode: 'video', inputType: 'v2v',
    description: 'Reinterpret existing footage with a new visual direction — up to 20s segments.',
    features: [feat('Video Input', 'input'), feat('Up to 20s', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration([5, 10, 15, 20], 5),
      ...params.videoInput('Source Video'),
    },
  },

  // ── LTX 2.3 ──────────────────────────────────────────────────────
  {
    id: 'ltx-v2.3-pro', name: 'LTX 2.3 Pro',
    addedAt: '2026-03-19',
    workflow: 'ltx-2.3/text-to-video', editWorkflow: 'ltx-2.3/image-to-video',
    buildPayload: buildLtx23T2VPayload, buildEditPayload: buildLtx23I2VPayload,
    estimatedTime: 75, editEstimatedTime: 78,
    mode: 'video', inputType: 't2v',
    description: '4K output with audio and aspect ratio control — production-ready v2.3.',
    features: [feat('Image Input', 'input'), feat('Start Frame', 'frame'), feat('Audio', 'audio'), feat('4K', 'resolution'), feat('16:9 / 9:16', 'characteristic'), feat('6/8/10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(PRO_DURATIONS, 6),
      ...params.resolution([...LTX_RESOLUTIONS]),
      ...params.aspectRatio(LTX_23_AR),
      ...params.generateAudio(),
      ...params.imageInput(),
    },
  },
  {
    id: 'ltx-v2.3-fast', name: 'LTX 2.3 Fast',
    addedAt: '2026-03-19',
    workflow: 'ltx-2.3/text-to-video/fast', editWorkflow: 'ltx-2.3/image-to-video/fast',
    buildPayload: buildLtx23FastPayload, buildEditPayload: buildLtx23I2VPayload,
    estimatedTime: 38, editEstimatedTime: 40,
    mode: 'video', inputType: 't2v',
    description: 'Fast 2.3 with long video support — up to 20s at 1080p with aspect ratio control.',
    features: [feat('Image Input', 'input'), feat('Fast', 'duration'), feat('Up to 20s', 'duration'), feat('Audio', 'audio'), feat('4K', 'resolution'), feat('16:9 / 9:16', 'characteristic')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(FAST_DURATIONS, 6),
      ...params.resolution([...LTX_RESOLUTIONS]),
      ...params.aspectRatio(LTX_23_AR),
      ...params.generateAudio(),
      ...params.imageInput(),
    },
  },
  {
    id: 'ltx-2.3-a2v', name: 'LTX 2.3 Audio-to-Video', modelId: 'ltx-v2.3-pro',
    addedAt: '2026-03-19',
    workflow: 'ltx-2.3/audio-to-video', buildPayload: buildLtx23A2VPayload,
    estimatedTime: 60,
    mode: 'video', inputType: 'a2v',
    description: 'Generate video driven by an audio track — 2-20s, optional image for first frame.',
    features: [feat('Audio Input', 'audio'), feat('Image Input', 'input'), feat('2–20 sec', 'duration')],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.audioInput('Audio Track', true),
      ...params.imageInput(1, 'First Frame Image', false),
      ...params.cfgScale(1, 50, 5),
    },
  },
  {
    id: 'ltx-v2.3-extend', name: 'LTX 2.3 Extend',
    addedAt: '2026-03-19',
    workflow: 'ltx-2.3/extend-video', buildPayload: buildLtx23ExtendPayload,
    estimatedTime: 45,
    mode: 'video', inputType: 'v2v',
    description: 'Seamlessly extend an existing video forward or backward — up to 20s.',
    features: [feat('Video Input', 'input'), feat('Up to 20s', 'duration')],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.duration([5, 10, 15, 20], 5),
      ...params.videoInput('Source Video'),
    },
  },
  {
    id: 'ltx-v2.3-retake', name: 'LTX 2.3 Retake',
    addedAt: '2026-03-19',
    workflow: 'ltx-2.3/retake-video', buildPayload: buildLtx23RetakePayload,
    estimatedTime: 33,
    mode: 'video', inputType: 'v2v',
    description: 'Retake video with new direction — replace audio, video, or both.',
    features: [feat('Video Input', 'input'), feat('Up to 20s', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration([5, 10, 15, 20], 5),
      ...params.videoInput('Source Video'),
    },
  },
]);

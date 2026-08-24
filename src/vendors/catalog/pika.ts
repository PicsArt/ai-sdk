/**
 * Pika — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

// ── Aspect ratio map ────────────────────────────────────────────────
// Backend DTO expects camelCase `aspectRatio: number` (range 0.4–2.5).
// NOTE: I2V DTO does NOT support aspectRatio — omitted for editWorkflow.

const PIKA_RATIO_MAP: Record<string, number> = {
  '16:9': 1.77, '9:16': 0.56, '1:1': 1.0,
  '4:5': 0.8, '5:4': 1.25, '3:2': 1.5, '2:3': 0.67,
};

// ── Payload builders ────────────────────────────────────────────────

/** T2V + I2V (unified). image added when present. duration MUST be string. */
export const buildPikaPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  ...(ctx.imageUrls?.[0] ? { image: ctx.imageUrls[0] } : {}),
  resolution: ctx.resolution ?? '720p',
  duration: String(ctx.duration ?? 5),
  ...(!ctx.imageUrls?.[0] ? { aspectRatio: PIKA_RATIO_MAP[ctx.aspectRatio ?? '16:9'] ?? 1.77 } : {}),
});

/** Scenes. Multiple scene images, duration as string. */
export const buildPikaScenesPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  images: ctx.imageUrls ?? [],
  resolution: ctx.resolution ?? '720p',
  duration: String(ctx.duration ?? 5),
  aspectRatio: PIKA_RATIO_MAP[ctx.aspectRatio ?? '16:9'] ?? 1.77,
});

/** Frames. Start + end frame array, duration as string. Max 2 frames. */
export const buildPikaFramesPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  frames: ctx.imageUrls ?? [],
  resolution: ctx.resolution ?? '720p',
  duration: String(ctx.duration ?? 5),
  aspectRatio: PIKA_RATIO_MAP[ctx.aspectRatio ?? '16:9'] ?? 1.77,
});

const PIKA_DURATIONS = [5, 10];
const PIKA_AR = ['16:9', '9:16', '1:1', '4:5', '5:4', '3:2', '2:3'];
// NOTE: OpenAPI lists 1080p but backend returns "Something went wrong" — keep 720p default.
const PIKA_RESOLUTIONS = ['720p', '1080p'];

export const { MODELS } = defineModels('pika', [
  {
    id: 'pika-2.2', name: 'Pika',
    addedAt: '2026-02-06',
    deprecated: true,
    workflow: 'pika-text-to-video-v2-2', editWorkflow: 'pika-image-to-video-v2-2',
    buildPayload: buildPikaPayload,
    estimatedTime: 50, editEstimatedTime: 50,
    mode: 'video', inputType: 't2v',
    description: 'Expressive animation across many visual styles from text or image.',
    features: [feat('Image Input', 'input'), feat('Up to 1080p', 'resolution'), feat('5/10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(PIKA_DURATIONS, 5),
      ...params.aspectRatio(PIKA_AR),
      ...params.resolution(PIKA_RESOLUTIONS),
      ...params.imageInput(),
    },
  },
  {
    id: 'pika-2.2-scenes', name: 'Pika Scenes',
    addedAt: '2026-02-06',
    deprecated: true,
    workflow: 'pika-scenes-v2-2', buildPayload: buildPikaScenesPayload,
    estimatedTime: 55,
    mode: 'video', inputType: 'i2v',
    description: 'Blend up to 4 images into a cohesive video with smooth transitions.',
    features: [feat('Multi-Image Input', 'input'), feat('Up to 1080p', 'resolution'), feat('5/10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(PIKA_DURATIONS, 5),
      ...params.aspectRatio(PIKA_AR),
      ...params.resolution(PIKA_RESOLUTIONS),
      ...params.imageInput(4, 'Scene Images', true),
    },
  },
  {
    id: 'pika-2.2-frames', name: 'Pika Frames',
    addedAt: '2026-02-06',
    deprecated: true,
    workflow: 'pika-frames-v2-2', buildPayload: buildPikaFramesPayload,
    estimatedTime: 50,
    mode: 'video', inputType: 'i2v',
    description: 'Morph between two keyframes with controlled in-between motion.',
    features: [feat('Multi-Image Input', 'input'), feat('Up to 1080p', 'resolution'), feat('5/10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(PIKA_DURATIONS, 5),
      ...params.resolution(PIKA_RESOLUTIONS),
      // aspectRatio: vendor ignores it for Frames — output aspect depends on input frames
      ...params.imageInput(2, 'Start + End Frame', true),
    },
  },
]);

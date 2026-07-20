/**
 * PixVerse — single source of truth.
 *
 * Fixed per-version configs (v6, c1) — like Gemini/Imagen, each version is its
 * own catalog entry and the wire model is baked into the payload builder
 * (see pixverse.payloads.ts). One entry per operation:
 *   text-to-video, image-to-video, reference-to-video ("fusion").
 *
 * Limiting to v6/c1 removes all per-version parameter constraints: both support
 * inline audio, up to 7 fusion references, all aspect ratios, and 1-15s duration;
 * neither uses negative_prompt / motion_mode / water_mark.
 *
 * Vendor docs:
 *   https://docs.platform.pixverse.ai/text-to-video-generation-13016634e0
 *   https://docs.platform.pixverse.ai/image-to-video-generation-13016633e0
 *   https://docs.platform.pixverse.ai/fusionreference-to-video-generation-19884194e0
 */
import { p } from '../../core/descriptors/presets.ts';
import { defineModels, feat, params } from '../define.ts';

const PIXVERSE_QUALITIES = ['360p', '540p', '720p', '1080p'];
const PIXVERSE_ASPECT_RATIOS = ['16:9', '4:3', '1:1', '3:4', '9:16', '2:3', '3:2', '21:9'];
const PIXVERSE_DURATIONS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const MAX_REFERENCE_IMAGES = 7;

/** Params shared by every PixVerse operation. */
const baseParams = {
  ...params.prompt({ maxLength: 5000 }),
  ...p.quality(PIXVERSE_QUALITIES, '540p'),
  ...params.duration(PIXVERSE_DURATIONS, 5),
  ...params.generateAudio(false),
};

const baseFeatures = [
  feat('Audio', 'audio'),
  feat('Up to 1080p', 'resolution'),
  feat('5-15 sec', 'duration'),
];

export const { MODELS } = defineModels('pixverse', [
  // ── V6 ─────────────────────────────────────────────────────────────
  {
    id: 'pixverse-v6',
    name: 'PixVerse V6',
    addedAt: '2026-06-12',
    workflow: 'pixverse/v2/text-to-video',
    estimatedTime: 60,
    mode: 'video',
    inputType: 't2v',
    description: 'Generate video from a text prompt with PixVerse V6.',
    features: [...baseFeatures],
    paramConfig: {
      ...baseParams,
      ...params.aspectRatio(PIXVERSE_ASPECT_RATIOS, '16:9'),
    },
  },
  {
    id: 'pixverse-v6-image',
    name: 'PixVerse V6 Image',
    addedAt: '2026-06-12',
    workflow: 'pixverse/v2/image-to-video',
    estimatedTime: 60,
    mode: 'video',
    inputType: 'i2v',
    description: 'Animate a source image into video with PixVerse V6.',
    features: [feat('Image Input', 'input'), ...baseFeatures],
    paramConfig: {
      ...baseParams,
      ...params.imageInput(1, 'Source Image', true, 'asset'),
    },
  },
  {
    id: 'pixverse-v6-fusion',
    name: 'PixVerse V6 Fusion',
    addedAt: '2026-06-12',
    workflow: 'pixverse/v2/reference-to-video',
    estimatedTime: 60,
    mode: 'video',
    inputType: 'i2v',
    description: 'Fuse up to 7 reference images (subjects/backgrounds) into a new video scene with PixVerse V6.',
    features: [feat('Reference Images', 'input'), ...baseFeatures],
    paramConfig: {
      ...baseParams,
      ...params.aspectRatio(PIXVERSE_ASPECT_RATIOS, '16:9'),
      ...params.imageInput(MAX_REFERENCE_IMAGES, 'Reference Images', true, 'reference'),
    },
  },

  // ── C1 ─────────────────────────────────────────────────────────────
  {
    id: 'pixverse-c1',
    name: 'PixVerse C1',
    addedAt: '2026-06-12',
    workflow: 'pixverse/v2/text-to-video',
    estimatedTime: 60,
    mode: 'video',
    inputType: 't2v',
    description: 'Generate video from a text prompt with PixVerse C1.',
    features: [...baseFeatures],
    paramConfig: {
      ...baseParams,
      ...params.aspectRatio(PIXVERSE_ASPECT_RATIOS, '16:9'),
    },
  },
  {
    id: 'pixverse-c1-image',
    name: 'PixVerse C1 Image',
    addedAt: '2026-06-12',
    workflow: 'pixverse/v2/image-to-video',
    estimatedTime: 60,
    mode: 'video',
    inputType: 'i2v',
    description: 'Animate a source image into video with PixVerse C1.',
    features: [feat('Image Input', 'input'), ...baseFeatures],
    paramConfig: {
      ...baseParams,
      ...params.imageInput(1, 'Source Image', true, 'asset'),
    },
  },
  {
    id: 'pixverse-c1-fusion',
    name: 'PixVerse C1 Fusion',
    addedAt: '2026-06-12',
    workflow: 'pixverse/v2/reference-to-video',
    estimatedTime: 60,
    mode: 'video',
    inputType: 'i2v',
    description: 'Fuse up to 7 reference images (subjects/backgrounds) into a new video scene with PixVerse C1.',
    features: [feat('Reference Images', 'input'), ...baseFeatures],
    paramConfig: {
      ...baseParams,
      ...params.aspectRatio(PIXVERSE_ASPECT_RATIOS, '16:9'),
      ...params.imageInput(MAX_REFERENCE_IMAGES, 'Reference Images', true, 'reference'),
    },
  },
]);

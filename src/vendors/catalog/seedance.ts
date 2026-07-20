/**
 * Seedance — single source of truth.
 * GOTCHA: resolution is '720p' NOT 'p_720'.
 *
 * Worker `seedance` command dispatches operation by content roles:
 *  - text + (first_frame|last_frame|reference_image) → image-to-video.* toolId
 *  - text + reference_video                          → video-to-video.* toolId
 * That's why -video-edit entries share `workflow: 'seedance'` with the base
 * cards but differ in payload construction.
 */
import type { Constraint, PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

/** Seedance 2.0 / 2.0 Fast constraints:
 *  - audio-only content rejected by backend (need at least one image or video role)
 *  - reference images / videos / audios are mutually exclusive with start/end
 *    frame slots (backend rejects mixed first_frame + reference_* content).
 */
const SEEDANCE_FRAME_REF_REASON = 'Start/End frames cannot be combined with reference images, videos, or audios';
/** Backend rejects reference image/video content below 409,600 px (640×640):
 *  "video pixel count ... must be greater than or equal to 409600". */
const SEEDANCE_MIN_PIXELS = 409_600;
const seedance20Constraints: Constraint[] = [
  {
    when: {
      imageUrls:  { exists: false },
      videoUrls:  { exists: false },
      startFrame: { exists: false },
      endFrame:   { exists: false },
    },
    then: {
      audioUrls: {
        disabled: true,
        reason: 'Audio cannot be the only modal input — add an image or video.',
      },
    },
  },
  // refs → frames disabled
  { when: { imageUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    endFrame:   { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
  } },
  { when: { videoUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    endFrame:   { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
  } },
  { when: { audioUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    endFrame:   { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
  } },
  // frames → refs disabled (mirror, so UI blocks the inverse order too)
  { when: { startFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    videoUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    audioUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
  } },
  { when: { endFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    videoUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    audioUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
  } },
];

/** 1.5 Pro T2V — content array with optional first_frame image + text. */
export const buildSeedance15ProPayload: PayloadBuilder = (ctx) => ({
  model: 'seedance_1_5_pro',
  content: [
    ...(ctx.startFrame
      ? [{ type: 'image_url', image_url: { url: ctx.startFrame }, role: 'first_frame' }]
      : []),
    ...(ctx.endFrame
      ? [{ type: 'image_url', image_url: { url: ctx.endFrame }, role: 'last_frame' }]
      : []),
    { type: 'text', text: ctx.prompt },
  ],
  ratio: ctx.aspectRatio ?? '16:9',
  duration: ctx.duration ?? 5,
  resolution: ctx.resolution ?? '720p',
  generate_audio: ctx.generateAudio ?? false,
  ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
});

/** I2V — content array with required first_frame image + text. */
export const buildSeedanceI2VPayload: PayloadBuilder = (ctx) => ({
  model: 'seedance_1_0_pro',
  content: [
    ...(ctx.startFrame ? [{ type: 'image_url', image_url: { url: ctx.startFrame }, role: 'first_frame' }] : []),
    ...(ctx.endFrame
      ? [{ type: 'image_url', image_url: { url: ctx.endFrame }, role: 'last_frame' }]
      : []),
    { type: 'text', text: ctx.prompt },
  ],
  ratio: ctx.aspectRatio ?? '16:9',
  duration: ctx.duration ?? 5,
  resolution: ctx.resolution ?? '720p',
  ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
});

/** Seedance 2.0 / 2.0 Fast — text-to-video / image-to-video / multimodal refs.
 *  Each backend role on its own paramConfig field:
 *  - imageUrls[]  (max 9) → reference_image roles
 *  - videoUrls[]  (max 3, ≤15s total) → reference_video roles
 *  - audioUrls[]  (max 3, ≤15s total) → reference_audio roles
 *  - startFrame                       → first_frame role
 *  - endFrame                         → last_frame role
 *  T2V vs I2V is determined by the worker from content; image/video/audio
 *  reference flows all route to `image-to-video.*` toolId. Constraint:
 *  last_frame must be paired with first_frame OR a reference_image (worker
 *  rejects last_frame alone). */
export const buildSeedance20PayloadFor =
  (modelAlias: 'seedance_2_0' | 'seedance_2_0_fast' | 'seedance_2_0_mini'): PayloadBuilder =>
  (ctx) => {
    const refImages = ctx.imageUrls ?? [];
    const refVideos = ctx.videoUrls ?? [];
    const refAudios = ctx.audioUrls ?? [];

    return {
      model: modelAlias,
      content: [
        ...(ctx.startFrame
          ? [{ type: 'image_url', image_url: { url: ctx.startFrame }, role: 'first_frame' }]
          : []),
        ...refImages.map((url) => ({
          type: 'image_url',
          image_url: { url },
          role: 'reference_image',
        })),
        ...refVideos.slice(0, 3).map((url) => ({
          type: 'video_url',
          video_url: { url },
          role: 'reference_video',
        })),
        ...refAudios.slice(0, 3).map((url) => ({
          type: 'audio_url',
          audio_url: { url },
          role: 'reference_audio',
        })),
        ...(ctx.endFrame
          ? [{ type: 'image_url', image_url: { url: ctx.endFrame }, role: 'last_frame' }]
          : []),
        { type: 'text', text: ctx.prompt },
      ],
      ratio: ctx.aspectRatio ?? '16:9',
      duration: ctx.duration ?? 10,
      resolution: ctx.resolution ?? '720p',
      generate_audio: ctx.generateAudio ?? false,
      ...(ctx.returnLastFrame ? { return_last_frame: true } : {}),
    };
  };

/** Seedance 2.0 / 2.0 Fast — video edit / multimodal reference.
 *  Required: reference_video (enforced by `videoInput` paramConfig). Optional: up to 9 reference_image.
 *  Worker routes to `video-to-video.*` toolId because content includes a video_url. */
export const buildSeedance20VideoEditPayloadFor =
  (modelAlias: 'seedance_2_0' | 'seedance_2_0_fast' | 'seedance_2_0_mini'): PayloadBuilder =>
  (ctx) => ({
    model: modelAlias,
    content: [
      { type: 'text', text: ctx.prompt },
      { type: 'video_url', video_url: { url: ctx.videoUrl }, role: 'reference_video' },
      ...(ctx.imageUrls ?? []).slice(0, 9).map((url) => ({
        type: 'image_url',
        image_url: { url },
        role: 'reference_image',
      })),
    ],
    ratio: ctx.aspectRatio ?? '16:9',
    duration: ctx.duration ?? 5,
    resolution: ctx.resolution ?? '720p',
    generate_audio: ctx.generateAudio ?? false,
    ...(ctx.returnLastFrame ? { return_last_frame: true } : {}),
  });

/** Seedance 2.0 / 2.0 Fast — video extend / multi-clip stitching.
 *  Per BytePlus official tutorial (ModelArk/2291680 "Extend video"): pass 2-3
 *  `reference_video` items; prompt references them as [video 1], [video 2], …
 *  to stitch / extend forward or backward.
 *  Worker routes to `video-to-video.*` toolId (same as edit) because content
 *  includes video_url roles. Uses `videoUrls[]` instead of single `videoUrl`. */
export const buildSeedance20VideoExtendPayloadFor =
  (modelAlias: 'seedance_2_0' | 'seedance_2_0_fast' | 'seedance_2_0_mini'): PayloadBuilder =>
  (ctx) => ({
    model: modelAlias,
    content: [
      { type: 'text', text: ctx.prompt },
      ...(ctx.videoUrls ?? []).slice(0, 3).map((url) => ({
        type: 'video_url',
        video_url: { url },
        role: 'reference_video',
      })),
    ],
    ratio: ctx.aspectRatio ?? 'adaptive',
    duration: ctx.duration ?? 15,
    resolution: ctx.resolution ?? '720p',
    generate_audio: ctx.generateAudio ?? false,
  });

const SEEDANCE_AR = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9', 'adaptive'];
const SEEDANCE_V2_DURATIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export const { MODELS } = defineModels('seedance', [
  {
    id: 'seedance-2.0', name: 'Seedance 2.0', modelId: 'seedance-2.0',
    addedAt: '2026-05-27',
    workflow: 'seedance',
    buildPayload: buildSeedance20PayloadFor('seedance_2_0'),
    constraints: seedance20Constraints,
    estimatedTime: 15,
    mode: 'video', inputType: 't2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Next-gen cinematic video with optional audio and reference image. Up to 4K.',
    features: [feat('Reference Image', 'frame'), feat('Start/End Frame', 'frame'), feat('Audio', 'audio'), feat('4K', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p', '1080p', '4k'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 10),
      ...params.generateAudio(false),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, 'Reference Images', false, 'reference', SEEDANCE_MIN_PIXELS),
      ...params.videoInputs(3, 'Reference Videos', false, SEEDANCE_MIN_PIXELS),
      ...params.audioInputs(3, 'Reference Audios'),
      ...params.startFrame(),
      ...params.endFrame(),
    },
  },
  {
    id: 'seedance-2.0-fast', name: 'Seedance 2.0 Fast', modelId: 'seedance-2.0-fast',
    addedAt: '2026-05-27',
    workflow: 'seedance',
    buildPayload: buildSeedance20PayloadFor('seedance_2_0_fast'),
    constraints: seedance20Constraints,
    estimatedTime: 15,
    mode: 'video', inputType: 't2v',
    badge: ['new', 'fast', 'premium', 'hot'],
    description: 'Fast cinematic video with audio, reference images, and start/end frame control.',
    features: [feat('Reference Image', 'frame'), feat('Start/End Frame', 'frame'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 10),
      ...params.generateAudio(false),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, 'Reference Images', false, 'reference', SEEDANCE_MIN_PIXELS),
      ...params.videoInputs(3, 'Reference Videos', false, SEEDANCE_MIN_PIXELS),
      ...params.audioInputs(3, 'Reference Audios'),
      ...params.startFrame(),
      ...params.endFrame(),
    },
  },
  {
    id: 'seedance-2.0-mini', name: 'Seedance 2.0 Mini', modelId: 'seedance-2.0-mini',
    addedAt: '2026-06-25',
    workflow: 'seedance',
    buildPayload: buildSeedance20PayloadFor('seedance_2_0_mini'),
    constraints: seedance20Constraints,
    estimatedTime: 15,
    mode: 'video', inputType: 't2v',
    badge: ['new', 'fast', 'premium'],
    description: 'Lightweight cinematic video with audio, reference images, and start/end frame control.',
    features: [feat('Reference Image', 'frame'), feat('Start/End Frame', 'frame'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 10),
      ...params.generateAudio(false),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, 'Reference Images', false, 'reference', SEEDANCE_MIN_PIXELS),
      ...params.videoInputs(3, 'Reference Videos', false, SEEDANCE_MIN_PIXELS),
      ...params.audioInputs(3, 'Reference Audios'),
      ...params.startFrame(),
      ...params.endFrame(),
    },
  },
  {
    id: 'seedance-2.0-video-edit', name: 'Seedance 2.0 Video Edit', modelId: 'seedance-2.0',
    addedAt: '2026-05-27',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoEditPayloadFor('seedance_2_0'),
    estimatedTime: 77,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Edit video — replace subjects, add or remove objects, restyle scenes with reference images.',
    features: [feat('Video Input', 'input'), feat('Multi-Image Input', 'input'), feat('Audio', 'audio'), feat('4K', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p', '1080p', '4k'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 5),
      ...params.generateAudio(false),
      ...params.returnLastFrame(),
      ...params.videoInput('Source Video'),
      ...params.imageInput(9, 'Reference Images'),
    },
  },
  {
    id: 'seedance-2.0-fast-video-edit', name: 'Seedance 2.0 Fast Video Edit', modelId: 'seedance-2.0-fast',
    addedAt: '2026-05-27',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoEditPayloadFor('seedance_2_0_fast'),
    estimatedTime: 30,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'fast', 'premium', 'hot'],
    description: 'Fast video edit — modify scenes with reference images.',
    features: [feat('Video Input', 'input'), feat('Multi-Image Input', 'input'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 5),
      ...params.generateAudio(false),
      ...params.returnLastFrame(),
      ...params.videoInput('Source Video'),
      ...params.imageInput(9, 'Reference Images'),
    },
  },
  {
    id: 'seedance-2.0-mini-video-edit', name: 'Seedance 2.0 Mini Video Edit', modelId: 'seedance-2.0-mini',
    addedAt: '2026-06-25',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoEditPayloadFor('seedance_2_0_mini'),
    estimatedTime: 30,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'fast', 'premium'],
    description: 'Lightweight video edit — modify scenes with reference images.',
    features: [feat('Video Input', 'input'), feat('Multi-Image Input', 'input'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 5),
      ...params.generateAudio(false),
      ...params.returnLastFrame(),
      ...params.videoInput('Source Video'),
      ...params.imageInput(9, 'Reference Images'),
    },
  },
  {
    id: 'seedance-2.0-video-extend', name: 'Seedance 2.0 Video Extend', modelId: 'seedance-2.0',
    addedAt: '2026-05-27',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoExtendPayloadFor('seedance_2_0'),
    estimatedTime: 400,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Stitch up to 3 clips into one continuous, extended video.',
    features: [feat('Multi-Video Input', 'input'), feat('Audio', 'audio'), feat('4K', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p', '1080p', '4k'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 15),
      ...params.generateAudio(false),
      ...params.videoInputs(3, 'Source Videos', true),
    },
  },
  {
    id: 'seedance-2.0-fast-video-extend', name: 'Seedance 2.0 Fast Video Extend', modelId: 'seedance-2.0-fast',
    addedAt: '2026-05-27',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoExtendPayloadFor('seedance_2_0_fast'),
    estimatedTime: 180,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'fast', 'premium', 'hot'],
    description: 'Quickly stitch up to 3 clips into one continuous video.',
    features: [feat('Multi-Video Input', 'input'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 15),
      ...params.generateAudio(false),
      ...params.videoInputs(3, 'Source Videos', true),
    },
  },
  {
    id: 'seedance-2.0-mini-video-extend', name: 'Seedance 2.0 Mini Video Extend', modelId: 'seedance-2.0-mini',
    addedAt: '2026-06-25',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoExtendPayloadFor('seedance_2_0_mini'),
    estimatedTime: 180,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'fast', 'premium'],
    description: 'Lightweight: stitch up to 3 clips into one continuous video.',
    features: [feat('Multi-Video Input', 'input'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 15),
      ...params.generateAudio(false),
      ...params.videoInputs(3, 'Source Videos', true),
    },
  },
  {
    id: 'seedance-1.5-pro', name: 'Seedance 1.5 Pro', modelId: 'seedance-1.5-pro',
    addedAt: '2026-02-06',
    deprecated: true, // superseded by seedance-2.0 / seedance-2.0-fast
    workflow: 'seedance', buildPayload: buildSeedance15ProPayload,
    estimatedTime: 15,
    mode: 'video', inputType: 't2v',
    description: 'Built-in audio with start/end frame control and flexible 4-12s durations.',
    features: [feat('Start/End Frame', 'frame'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('12 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration([4, 5, 8, 10, 12], 5),
      ...params.generateAudio(false),
      ...params.startFrame(),
      ...params.endFrame(),
    },
  },
  {
    id: 'seedance-i2v', name: 'Seedance I2V', modelId: 'seedance-1.0-pro',
    addedAt: '2026-02-06',
    deprecated: true, // 1.0 Pro is 3 generations behind seedance-2.0
    workflow: 'seedance', buildPayload: buildSeedanceI2VPayload,
    estimatedTime: 40,
    mode: 'video', inputType: 'i2v',
    description: 'Bring a still image to life with natural motion and style transfer, up to 1080p.',
    features: [feat('Image Input', 'input'), feat('Up to 1080p', 'resolution'), feat('5/10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p', '1080p'], '720p'),
      ...params.duration([5, 10], 5),
      ...params.startFrame('First Frame', true),
    },
  },
]);

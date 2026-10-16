/**
 * Kling — single source of truth (paramConfig + metadata only).
 *
 * Payload builders live in ./payloads.ts and self-register via registerPayloads
 * (+ registerEditPayloads for combined-entry kling-v3 / kling-v2-6) at module
 * load. Shared paramConfig fragments live in ./params.ts.
 */
import { defineModels, feat, params, paramPresets } from '../../define.ts';
import {
  klingCharacterOrientation,
  klingKeepOriginalSound,
  klingOmniAdvancedParams,
  klingOmniReferType,
  klingV3AdvancedParams,
  klingV4OmniElementList,
} from './params.ts';

// ── Effect templates (kling/v1/video-effects) ───────────────────────
// The effect list lives in the `kling/v1/catalog/templates` platform task
// (derived from the worker's own effect enum, with preview media and
// `meta.imageSlots`); the `templateId` param is catalog-bound below.


// ── Durations / aspect ratios ───────────────────────────────────────

/** V3 accepts any whole second in 3-15s, so it is a range, not an option list. */
const V3_DURATION = { min: 3, max: 15 } as const;
const V26_DURATIONS = [5, 10];
/** Kling 4.0 accepts any whole second in 3-30s. */
const V4_DURATION = { min: 3, max: 30 } as const;
/** Kling 4.0 prompt cap: English-only up to 26,000 chars (non-English-only up
 *  to 11,000, mixed E/26000 + N/11000 <= 1 — the worker enforces the mix). */
const V4_PROMPT_MAX = 26000;
/** Kling 4.0 keyframes: start + middle + end frame images, at most 10 in total. */
const V4_MAX_MIDDLE_FRAMES = 8;
const KLING_IMAGE_AR = ['16:9', '9:16', '1:1', '21:9', '4:3', '3:2', '2:3', '3:4'];

// ── Input-media bounds ──────────────────────────────────────────────
// Only limits with a written number behind them: the vendor's own rejection
// text, or the worker's DTO for that workflow. Kling refuses images on the
// omni and image routes too ("image aspect ratio is invalid", "image size is
// too large") but never prints the threshold, so those slots stay bare until
// one is measured (finding F55).

/** kling-v3-omni reference clip. Vendor rejection text: "video duration can
 *  not longer than 15.5s", a 3 s floor, and width / height outside 700-4553 px. */
const KLING_V3_OMNI_REFERENCE_VIDEO_BOUNDS = {
  minDurationSec: 3,
  maxDurationSec: 15.5,
  minSidePixels: 700,
  maxSidePixels: 4553,
} as const;

/** Motion-control person photo, per pa-klingai-pluggable-worker
 *  motion-control/model/command.model.ts: max 10 MB, 300-65536 px a side,
 *  aspect ratio 1:2.5 to 2.5:1. */
const KLING_MOTION_IMAGE_BOUNDS = {
  minSidePixels: 300,
  maxSidePixels: 65536,
  minAspectRatio: 1 / 2.5,
  maxAspectRatio: 2.5,
  maxBytes: 10 * 1024 * 1024,
} as const;

/** Motion-control reference clip: 3-30 s and 340-3850 px a side are printed by
 *  the vendor, 100 MB is the worker DTO's. The vendor caps the clip at 10 s
 *  when `characterOrientation` is `image`; no descriptor field can make a
 *  bound depend on another param, so that case stays with the vendor. */
const KLING_MOTION_VIDEO_BOUNDS = {
  minDurationSec: 3,
  maxDurationSec: 30,
  minSidePixels: 340,
  maxSidePixels: 3850,
  maxBytes: 100 * 1024 * 1024,
} as const;

/** kling-avatar speech track. Vendor rejection text: longer than 300 s. */
const KLING_AVATAR_AUDIO_BOUNDS = { maxDurationSec: 300 } as const;

// ── Shared model-entry bases ────────────────────────────────────────

const klingV3ProVideoBase = {
  workflow: 'kling-text-to-video' as const,
  editWorkflow: 'kling-image-to-video' as const,
  mode: 'video' as const,
  inputType: 't2v' as const,
  features: [
    feat('Image Input', 'input'),
    feat('Start/End Frame', 'frame'),
    feat('Audio', 'audio'),
    feat('1080p', 'resolution'),
    feat('15 sec', 'duration'),
  ],
  paramConfig: {
    ...params.prompt({ maxLength: 2500 }),
    ...paramPresets.videoStartEndWithAudio(),
    // Overrides the preset's enum duration.
    ...params.durationRange(V3_DURATION.min, V3_DURATION.max, 5),
    ...klingV3AdvancedParams,
    ...params.renderingSpeed([{ id: 'std', label: 'Standard' }, { id: 'pro', label: 'Pro' }, { id: '4k', label: '4K' }], '4k'),
  },
};

// Kling V3 Turbo — shares the kling-text/image-to-video workflows with V3 but
// is a REDUCED model: it exposes a `resolution` knob (720p/1080p) and accepts
// only prompt / aspect_ratio / duration / image (I2V source). The vendor turbo
// API has no negative_prompt field — negative wording is folded into the
// prompt by the builder. The backend rejects V3-only knobs for kling-v3-turbo —
// `sound` (audio), `image_tail` (end frame), `static_mask`, and `multi_shot` /
// `shot_type` / `multi_prompt` / `voice_list` / `element_list`. Declaring those
// descriptors would leak their defaults via buildDefaultContext and break
// OPTIONS, so they are intentionally omitted (cf. the kling-video-o1 note).
const klingV3TurboVideoBase = {
  workflow: 'kling-text-to-video' as const,
  editWorkflow: 'kling-image-to-video' as const,
  mode: 'video' as const,
  inputType: 't2v' as const,
  features: [
    feat('Image Input', 'input'),
    feat('1080p', 'resolution'),
    feat('15 sec', 'duration'),
  ],
  paramConfig: {
    ...params.prompt({ maxLength: 2500 }),
    ...params.aspectRatio(['16:9', '9:16', '1:1']),
    ...params.durationRange(V3_DURATION.min, V3_DURATION.max, 5),
    ...params.negativePrompt(),
    ...params.resolution(['720p', '1080p'], '720p'),
    ...params.startFrame('Start Frame'),
  },
};

// Kling 4.0 — shares the kling-text/image-to-video workflows; the worker routes
// kling-v4 to the dedicated /…/kling-4.0 tasks API. Quality is `resolution`
// (720p/1080p), not `mode`; 3-30s; 21:9 on top of the usual ratios. I2V takes
// keyframes: the start frame, up to 8 middle frames (`imageUrls` → `image_middle`)
// and an end frame. The worker rejects sound / negative_prompt / cfg_scale /
// multi-shot / voice / element lists for kling-v4, so they are not declared.
const klingV4VideoBase = {
  workflow: 'kling-text-to-video' as const,
  editWorkflow: 'kling-image-to-video' as const,
  mode: 'video' as const,
  inputType: 't2v' as const,
  features: [
    feat('Image Input', 'input'),
    feat('Start/Middle/End Frames', 'frame'),
    feat('1080p', 'resolution'),
    feat('30 sec', 'duration'),
  ],
  paramConfig: {
    ...params.prompt({ maxLength: V4_PROMPT_MAX }),
    ...params.aspectRatio(['16:9', '9:16', '1:1', '21:9']),
    ...params.durationRange(V4_DURATION.min, V4_DURATION.max, 5),
    ...params.resolution(['720p', '1080p'], '720p'),
    ...params.startFrame('Start Frame'),
    ...params.imageInput(V4_MAX_MIDDLE_FRAMES, 'Middle Frames', false, 'asset'),
    ...params.endFrame('End Frame'),
  },
};

const klingV26VideoBase = {
  ...klingV3ProVideoBase,
  features: [
    feat('Image Input', 'input'),
    feat('Start/End Frame', 'frame'),
    feat('Audio', 'audio'),
    feat('1080p', 'resolution'),
    feat('5/10 sec', 'duration'),
  ],
  paramConfig: {
    ...params.prompt({ maxLength: 2500 }),
    ...paramPresets.videoStartEndWithAudio({
      durations: V26_DURATIONS,
      defaultDuration: 5,
    }),
  },
};

// ── Model definitions ───────────────────────────────────────────────

export const { MODELS } = defineModels('kling', [
  // ── Video: Kling V3 (consolidated: std/pro/4k via renderingSpeed) ──
  {
    ...klingV3ProVideoBase,
    id: 'kling-v3', name: 'Kling V3', modelId: 'kling-v3',
    addedAt: '2026-02-06',
    estimatedTime: 55, editEstimatedTime: 55,
    badge: ['popular', 'premium'] as const,
    description: 'Long-form video up to 15s with native audio and start/end frame control.',
    constraints: [
      // Backend: `voice_list` requires `sound=on`. Two rules because the
      // `is` operator does not match an unset value (see core/constraints.ts).
      { when: { generateAudio: { is: false } }, then: { voiceList: { disabled: true, reason: 'Voice references require generated audio.' } } },
      { when: { generateAudio: { exists: false } }, then: { voiceList: { disabled: true, reason: 'Voice references require generated audio.' } } },
      // Vendor: first/end frames are unsupported in multi-shot mode.
      { when: { multiShot: { is: true } }, then: {
        startFrame: { disabled: true, reason: 'Frames are unavailable in multi-shot mode.' },
        endFrame: { disabled: true, reason: 'Frames are unavailable in multi-shot mode.' },
      } },
    ],
  },
  // ── Video: Kling V3 Turbo (resolution-tiered T2V + I2V) ───────────
  {
    ...klingV3TurboVideoBase,
    id: 'kling-v3-turbo', name: 'Kling V3 Turbo', modelId: 'kling-v3-turbo',
    addedAt: '2026-06-18',
    estimatedTime: 55, editEstimatedTime: 55,
    badge: ['new'] as const,
    description: 'Faster V3 variant — long-form video up to 15s with native audio, start/end frame control, and 720p/1080p output.',
  },
  // ── Video: Kling 4.0 (resolution-tiered T2V + keyframe I2V) ───────
  {
    ...klingV4VideoBase,
    id: 'kling-v4', name: 'Kling 4.0', modelId: 'kling-v4',
    addedAt: '2026-10-16',
    // Observed on the vendor (2026-10-16): ~3-5 min for 5s, ~7 min for 30s.
    estimatedTime: 240, editEstimatedTime: 240,
    badge: ['new'] as const,
    description: 'Kling 4.0 — video up to 30s at 720p or 1080p, with start, middle and end keyframes.',
    constraints: [
      // Worker: image-to-video needs the start frame (`image`); middle and
      // end frames are added around it. (Raw API callers may instead pass the
      // start frame as imageUrls[0] — the builder handles that.)
      { when: { startFrame: { exists: false } }, then: {
        imageUrls: { disabled: true, reason: 'Middle frames require a start frame.' },
        endFrame: { disabled: true, reason: 'End frame requires a start frame.' },
      } },
    ],
  },
  // ── Video: Kling V2.6 (consolidated: std/pro via renderingSpeed) ──
  {
    ...klingV26VideoBase,
    id: 'kling-v2-6', name: 'Kling V2.6', modelId: 'kling-v2-6',
    addedAt: '2026-02-11',
    estimatedTime: 60,
    description: 'Mature pipeline with audio and pro-tier rendering.',
  },
  // ── Video: Kling Omni ─────────────────────────────────────────────
  {
    id: 'kling-v3-omni', name: 'Kling V3 Omni', modelId: 'kling-v3-omni',
    addedAt: '2026-02-06',
    workflow: 'kling-omni-video',
    estimatedTime: 55,
    mode: 'video', inputType: 't2v',
    description: 'Flexible generation across creative styles using V3 Omni architecture, with optional 4K output.',
    features: [feat('Image + Video Input', 'input'), feat('4K', 'resolution'), feat('15 sec', 'duration')],
    // The omni task accepts reference media on the SAME workflow (no
    // editWorkflow): `image_list` carries the optional first/end frames plus
    // plain reference images, `video_list` carries a single reference clip.
    // They are declared here as real file slots so `hasFileInput()` sees them
    // and the app renders upload targets; payloads.ts assembles the arrays.
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(['16:9', '9:16', '1:1']),
      ...params.durationRange(V3_DURATION.min, V3_DURATION.max, 5),
      // Quality tier maps straight to the wire `mode`: 720p→std, 1080p→pro, 4k→4k.
      ...params.resolution(['720p', '1080p', '4k'], '720p'),
      ...params.generateAudio(),
      ...params.startFrame('First Frame'),
      ...params.endFrame('End Frame'),
      // Vendor cap: reference images + frames + multi-image elements ≤ 7
      // (4 when a reference video is supplied).
      ...params.imageInput(7, 'Reference Images'),
      ...params.videoInput('Reference Video', 'reference', false, undefined, undefined, undefined, KLING_V3_OMNI_REFERENCE_VIDEO_BOUNDS),
      ...klingOmniReferType,
      ...klingKeepOriginalSound,
      ...klingOmniAdvancedParams,
    },
    constraints: [
      // KlingMode: `4k` is incompatible with video_list; the worker also drops
      // generated sound whenever a reference clip is supplied.
      { when: { videoUrl: { exists: true } }, then: {
        resolution: { allowed: ['720p', '1080p'], reason: '4K output is unavailable with a reference video.' },
        generateAudio: { disabled: true, reason: 'Kling disables generated sound when a reference video is supplied.' },
      } },
      // Vendor: an end frame requires a first frame.
      { when: { startFrame: { exists: false } }, then: { endFrame: { disabled: true, reason: 'End frame requires a first frame.' } } },
      // Vendor: base-video editing cannot be combined with frames or multi-shot.
      { when: { referType: { is: 'base' }, videoUrl: { exists: true } }, then: {
        startFrame: { disabled: true, reason: 'Base video editing cannot be combined with frames.' },
        endFrame: { disabled: true, reason: 'Base video editing cannot be combined with frames.' },
        multiShot: { disabled: true, reason: 'Base video editing does not support multi-shot.' },
        multiPrompt: { disabled: true, reason: 'Base video editing does not support multi-shot.' },
      } },
    ],
  },
  // ── Video: Kling 4.0 Omni (dedicated /omni-video/kling-4.0 tasks API) ──
  {
    id: 'kling-v4-omni', name: 'Kling 4.0 Omni', modelId: 'kling-v4-omni',
    addedAt: '2026-10-16',
    workflow: 'kling-omni-video',
    // Observed on the vendor (2026-10-16): ~2.5-5.5 min for 5s.
    estimatedTime: 240,
    mode: 'video', inputType: 't2v',
    badge: ['new'] as const,
    description: 'Kling 4.0 Omni — up to 30s at 720p or 1080p from text, frames, reference images, a reference or base video, and elements.',
    features: [feat('Image + Video Input', 'input'), feat('1080p', 'resolution'), feat('30 sec', 'duration')],
    // Same slot layout as kling-v3-omni (payloads.ts folds them into
    // image_list / video_list), minus what the 4.0 API dropped: no audio,
    // mode tiers, multi-shot or keep_original_sound.
    paramConfig: {
      ...params.prompt({ maxLength: V4_PROMPT_MAX }),
      ...params.aspectRatio(['16:9', '9:16', '1:1', '21:9', 'adaptive']),
      ...params.durationRange(V4_DURATION.min, V4_DURATION.max, 5),
      ...params.resolution(['720p', '1080p'], '720p'),
      ...params.startFrame('First Frame'),
      ...params.endFrame('End Frame'),
      // Vendor cap: 10 images in total — 2 frame slots + 8 reference images.
      ...params.imageInput(8, 'Reference Images'),
      ...params.videoInput('Reference Video', 'reference', false),
      ...klingOmniReferType,
      ...klingV4OmniElementList,
    },
  },
  {
    id: 'kling-video-o1', name: 'Kling Video O1', modelId: 'kling-video-o1',
    addedAt: '2026-03-11',
    workflow: 'kling-omni-video',
    estimatedTime: 55,
    mode: 'video', inputType: 't2v',
    badge: ['new'] as const,
    description: 'O1-architecture video generation with 5 or 10 second output.',
    features: [feat('1080p', 'resolution'), feat('10 sec', 'duration')],
    // O1 shares the `kling-omni-video` workflow with kling-v3-omni but the
    // backend rejects `multi_shot`, `shot_type`, `multi_prompt`, and the
    // *list / element_list payloads for non-v3-omni models. Declaring those
    // descriptors here would cause `buildDefaultContext` to leak default
    // values into every payload and break OPTIONS pre-flight. Keep the
    // surface minimal until Kling extends omni-only support to O1.
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(['16:9', '9:16', '1:1']),
      ...params.duration([5, 10], 5),
      ...params.renderingSpeed([{ id: 'std', label: 'Standard' }, { id: 'pro', label: 'Pro' }], 'std'),
      ...params.generateAudio(),
    },
  },
  // ── Video: Motion Control ─────────────────────────────────────────
  {
    id: 'kling-motion-control-v3', name: 'Kling Motion Control V3',
    addedAt: '2026-02-14',
    workflow: 'kling-motion-control',
    estimatedTime: 280,
    mode: 'video', inputType: 'i2v',
    badge: ['popular'] as const,
    description: 'Map body movement from a video clip onto a portrait photo — V3 quality.',
    features: [feat('Image + Video', 'input'), feat('Motion Transfer', 'characteristic'), feat('V3', 'resolution')],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 2500 }),
      ...params.renderingSpeed([{ id: 'std', label: 'Standard' }, { id: 'pro', label: 'Pro' }], 'std'),
      ...klingCharacterOrientation,
      ...klingKeepOriginalSound,
      ...params.imageInput(1, 'Person Photo (upper body)', true, 'reference', KLING_MOTION_IMAGE_BOUNDS),
      ...params.videoInput('Motion Reference Video', 'reference', true, undefined, undefined, undefined, KLING_MOTION_VIDEO_BOUNDS),
    },
  },
  {
    id: 'kling-motion-control', name: 'Kling Motion Control 2.6',
    addedAt: '2026-02-10',
    workflow: 'kling-motion-control',
    estimatedTime: 300,
    mode: 'video', inputType: 'i2v',
    badge: ['popular'] as const,
    description: 'Transfer body movement from a reference video onto a portrait photo.',
    features: [feat('Image + Video', 'input'), feat('Motion Transfer', 'characteristic'), feat('2.6', 'resolution')],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 2500 }),
      ...params.renderingSpeed([{ id: 'std', label: 'Standard' }, { id: 'pro', label: 'Pro' }], 'std'),
      ...klingCharacterOrientation,
      ...klingKeepOriginalSound,
      ...params.imageInput(1, 'Person Photo (upper body)', true, 'reference', KLING_MOTION_IMAGE_BOUNDS),
      ...params.videoInput('Motion Reference Video', 'reference', true, undefined, undefined, undefined, KLING_MOTION_VIDEO_BOUNDS),
    },
  },
  // ── Video: Avatar ─────────────────────────────────────────────────
  {
    id: 'kling-avatar', name: 'Kling Avatar',
    addedAt: '2026-02-10',
    workflow: 'kling-avatar',
    estimatedTime: 306,
    mode: 'video', inputType: 'i2v',
    description: 'Lip-synced talking head from a portrait and speech audio.',
    features: [feat('Image + Audio', 'input'), feat('Talking Head', 'characteristic')],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 2500 }),
      ...params.renderingSpeed([{ id: 'std', label: 'Standard' }, { id: 'pro', label: 'Pro' }], 'std'),
      ...params.imageInput(1, 'Face Portrait', true),
      // Vendor: exactly ONE of sound_file / audio_id. The UI path keeps the
      // audio file required; audio_id stays an additive alternative for raw
      // API callers. The builder never emits both keys (file wins) and the
      // worker enforces the XOR for un-typed callers.
      ...params.audioInput('Speech Audio', true, 'asset', KLING_AVATAR_AUDIO_BOUNDS),
      audioId: {
        label: 'TTS Audio ID',
        descriptor: { kind: 'text', placeholder: 'audio_id from Kling TTS API' },
      },
    },
  },
  // ── Image: Omni Image (V3 + O1) ──────────────────────────────────
  {
    id: 'kling-3.0-image', name: 'Kling 3.0 Image', modelId: 'kling-v3-omni',
    addedAt: '2026-03-01',
    workflow: 'kling/v1/images/omni-image',
    estimatedTime: 20,
    mode: 'image', inputType: 't2i',
    description: 'Cinematic visuals with up to 4K resolution and 10 reference images.',
    features: [feat('Multi-Image Input', 'input'), feat('4K', 'resolution')],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR),
      ...params.resolution(['1k', '2k', '4k'], '1k'),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.imageInput(10, 'Reference Images'),
    },
  },
  {
    id: 'kling-o1-image', name: 'Kling O1 Image', modelId: 'kling-image-o1',
    addedAt: '2026-03-01',
    workflow: 'kling/v1/images/omni-image',
    estimatedTime: 20,
    mode: 'image', inputType: 't2i',
    description: 'O1-architecture image generation with multi-reference support.',
    features: [feat('Multi-Image Input', 'input')],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR),
      ...params.resolution(['1k', '2k'], '1k'),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.imageInput(10, 'Reference Images'),
    },
  },
  // ── Image: Generations ──────────────────────────────────────────

  {
    id: 'kling-v2-1-image', name: 'Kling V2.1 Image', modelId: 'kling-v2-1',
    addedAt: '2026-03-25',
    deprecated: true, // superseded by kling-v3-omni / kling-v3-pro
    workflow: 'kling/v1/images/generations',
    estimatedTime: 15,
    mode: 'image', inputType: 't2i',
    description: 'V2.1 image generation with improved fidelity and restyle support.',
    features: [feat('Image Input', 'input'), feat('Negative Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.negativePrompt(),
      ...params.imageInput(1, 'Restyle Image'),
    },
    constraints: [
      // Vendor: negative prompts are not supported in image-to-image mode.
      { when: { imageUrls: { exists: true } }, then: { negativePrompt: { disabled: true, reason: 'Negative prompt is ignored in image-to-image mode.' } } },
    ],
  },
  // ── Image: Multi-Image-to-Image ─────────────────────────────────
  {
    id: 'kling-multi-image-v2-1', name: 'Kling Multi-Image V2.1', modelId: 'kling-v2-1-multi',
    addedAt: '2026-03-25',
    deprecated: true, // V2.1 is 2 generations behind v3
    workflow: 'kling/v1/images/multi-image-to-image',
    estimatedTime: 20,
    mode: 'image', inputType: 'i2i',
    description: 'V2.1 multi-image composition with improved subject blending.',
    features: [feat('Multi-Image Input', 'input')],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR, '16:9'),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.imageInput(4, 'Subject Images', true),
      sceneImage: {
        label: 'Scene Reference',
        category: 'reference',
        descriptor: { kind: 'file', accept: 'image' },
      },
      styleImage: {
        label: 'Style Reference',
        category: 'reference',
        descriptor: { kind: 'file', accept: 'image' },
      },
    },
  },
  // ── Elements (factory — registers reusable element_id) ───────────
  {
    id: 'kling-elements', name: 'Kling Elements',
    addedAt: '2026-05-11',
    release: 'preview', // pending backend toolId + pricing confirmation
    workflow: 'kling-elements',
    estimatedTime: 30,
    mode: 'image', inputType: 'i2i',
    description: 'Save a character or scene to reuse across Kling models.',
    features: [feat('Multi-Image / Video Reference', 'input'), feat('Element Factory', 'characteristic')],
    paramConfig: {
      elementName: {
        label: 'Element Name',
        required: true,
        descriptor: { kind: 'text', maxLength: 20 },
      },
      elementDescription: {
        label: 'Element Description',
        required: true,
        descriptor: { kind: 'text', maxLength: 100 },
      },
      referenceType: {
        label: 'Reference Type',
        required: true,
        descriptor: {
          kind: 'enum',
          valueType: 'string',
          options: [
            { id: 'image_refer', label: 'Image Reference' },
            { id: 'video_refer', label: 'Video Reference' },
          ],
          default: 'image_refer',
        },
      },
      // Vendor: image_refer requires a frontal image + 1-3 extra angles
      // (min 2 uploads total — the builder enforces the minimum).
      ...params.imageInput(4, 'Reference Images (1st = frontal, plus 1-3 angles)', false),
      ...params.videoInput('Reference Video', 'reference', false),
      elementVoiceId: {
        label: 'Voice ID (character/humanoid elements)',
        descriptor: { kind: 'text' },
      },
    },
    constraints: [
      { when: { referenceType: { is: 'video_refer' } }, then: { imageUrls: { disabled: true, reason: 'Video reference uses the reference video, not images.' } } },
      { when: { referenceType: { is: 'image_refer' } }, then: { videoUrl: { disabled: true, reason: 'Image reference uses reference images, not a video.' } } },
      { when: { referenceType: { exists: false } }, then: { videoUrl: { disabled: true, reason: 'Image reference uses reference images, not a video.' } } },
    ],
  },
  {
    id: 'kling-video-effects', name: 'Kling Video Effects',
    addedAt: '2026-05-13',
    workflow: 'kling/v1/video-effects',
    estimatedTime: 30,
    mode: 'video', inputType: 'i2v',
    badge: ['new'] as const,
    description: 'Apply curated Kling visual effects to photos — single or dual-image scenes.',
    features: [feat('Image Input', 'input'), feat('Video Effects', 'characteristic')],
    paramConfig: {
      ...params.catalog('templateId', {
        label: 'Effect',
        source: { workflow: 'kling/v1/catalog/templates' },
        default: 'korean_baseball',
      }),
      // Vendor: ≥300px per side (10MB / aspect-ratio checks stay vendor-side).
      ...params.imageInput(2, 'Effect Images', true, 'reference', { minSidePixels: 300 }),
    },
  },
  // ── Audio ─────────────────────────────────────────────────────────
  {
    id: 'kling-t2a', name: 'Kling T2A',
    addedAt: '2026-02-06',
    workflow: 'kling-text-to-audio',
    estimatedTime: 28,
    mode: 'audio', inputType: 't2a',
    description: 'Text-to-audio clips of 3–10 seconds from a prompt description.',
    features: [feat('Text-to-Audio', 'characteristic')],
    // Boundary probe (round 2, 2026-05-10) confirmed backend accepts decimal
    // duration in [3.0, 10.0]. Range descriptor (step 0.5) replaces the old
    // [5, 10] integer enum.
    paramConfig: { ...params.prompt({ maxLength: 2500 }), duration: { label: 'Duration (s)', descriptor: { kind: 'range', min: 3, max: 10, step: 0.5, default: 5 } } },
  },
  {
    id: 'kling-v2a', name: 'Kling V2A',
    addedAt: '2026-02-06',
    workflow: 'kling-video-to-audio',
    estimatedTime: 28,
    mode: 'audio', inputType: 'v2a',
    description: 'Extract or generate a matching audio track from an uploaded video.',
    features: [feat('Video Input', 'input')],
    paramConfig: {
      // Vendor: .mp4/.mov only, ≤100MB, 3.0-20.0s — duration and size are
      // enforced at upload; the 3s floor and container check stay vendor-side.
      ...params.videoInput('Source Video (3-20s, ≤100MB)', 'reference', true, 20, undefined, 100 * 1024 * 1024),
    },
  },
]);

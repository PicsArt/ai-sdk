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
  klingHumanFidelity,
  klingImageReference,
  klingKeepOriginalSound,
  klingOmniAdvancedParams,
  klingOmniReferType,
  klingV3AdvancedParams,
} from './params.ts';

// ── Effect templates (kling/v1/video-effects) ───────────────────────
// The effect list lives in the `kling/v1/catalog/templates` platform task
// (derived from the worker's own effect enum, with preview media and
// `meta.imageSlots`); the `templateId` param is catalog-bound below.

/**
 * Effect scenes that require two input images (e.g. hugs, kisses, swaps).
 * @deprecated Read `meta.imageSlots` on the `kling/v1/catalog/templates`
 * catalog items instead — this frozen copy is no longer maintained and will be
 * removed in the next major.
 */
export const KLING_DUAL_IMAGE_EFFECTS: ReadonlySet<string> = new Set([
  'pet_skateboard', 'daily_ootd', 'toss_run', 'switch_to_silk', 'studio_look',
  'french_elegance', 'finger_swipe', 'smooth_transition', 'kiss_pro', 'snow_night_kiss',
  'eternal_kiss', 'cheers_2026', 'fight_pro', 'hug_pro', 'heart_gesture_pro',
]);

// ── Durations / aspect ratios ───────────────────────────────────────

const V3_DURATIONS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const V26_DURATIONS = [5, 10];
const KLING_IMAGE_AR = ['16:9', '9:16', '1:1', '21:9', '4:3', '3:2', '2:3', '3:4'];

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
    ...paramPresets.videoStartEndWithAudio({
      durations: V3_DURATIONS,
      defaultDuration: 5,
    }),
    ...klingV3AdvancedParams,
    ...params.renderingSpeed([{ id: 'std', label: 'Standard' }, { id: 'pro', label: 'Pro' }, { id: '4k', label: '4K' }], '4k'),
  },
};

// Kling V3 Turbo — shares the kling-text/image-to-video workflows with V3 but
// is a REDUCED model: it exposes a `resolution` knob (720p/1080p) and accepts
// only prompt / negative_prompt / aspect_ratio / duration / image (I2V source) /
// static_mask. The backend rejects V3-only knobs for kling-v3-turbo — `sound`
// (audio), `image_tail` (end frame), and `multi_shot` / `shot_type` /
// `multi_prompt` / `voice_list` / `element_list`. Declaring those descriptors
// would leak their defaults via buildDefaultContext and break OPTIONS, so they
// are intentionally omitted (cf. the kling-video-o1 note above).
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
    ...params.duration(V3_DURATIONS, 5),
    ...params.negativePrompt(),
    ...params.resolution(['720p', '1080p'], '720p'),
    ...params.startFrame('Start Frame'),
    staticMask: {
      label: 'Static Mask',
      category: 'reference' as const,
      descriptor: { kind: 'file' as const, accept: 'image' as const },
    },
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
    ...params.cfgScale(0, 1, 0.5, 0.1),
    ...params.renderingSpeed([{ id: 'std', label: 'Standard' }, { id: 'pro', label: 'Pro' }], 'std'),
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
      { when: { renderingSpeed: { is: 'std' } }, then: { endFrame: { disabled: true, reason: 'End frame requires Pro or 4K mode.' } } },
      // Backend: `voice_list` requires `sound=on`. Two rules because the
      // `is` operator does not match an unset value (see core/constraints.ts).
      { when: { generateAudio: { is: false } }, then: { voiceList: { disabled: true, reason: 'Voice references require generated audio.' } } },
      { when: { generateAudio: { exists: false } }, then: { voiceList: { disabled: true, reason: 'Voice references require generated audio.' } } },
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
  // ── Video: Kling V2.6 (consolidated: std/pro via renderingSpeed) ──
  {
    ...klingV26VideoBase,
    id: 'kling-v2-6', name: 'Kling V2.6', modelId: 'kling-v2-6',
    addedAt: '2026-02-11',
    estimatedTime: 60,
    description: 'Mature pipeline with audio, adjustable cfg, and standard/pro rendering.',
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
      ...params.duration(V3_DURATIONS, 5),
      ...params.resolution(['720p', '1080p', '4k'], '720p'),
      ...params.renderingSpeed([{ id: 'std', label: 'Standard' }, { id: 'pro', label: 'Pro' }], 'std'),
      ...params.generateAudio(false),
      ...params.startFrame('First Frame'),
      ...params.endFrame('End Frame'),
      // Backend states no explicit cap for omni `image_list`; 10 mirrors the
      // omni-image contract. The worker stays the authoritative gate.
      ...params.imageInput(10, 'Reference Images'),
      ...params.videoInput('Reference Video', 'reference', false),
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
    ],
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
      ...params.resolution(['720p', '1080p'], '720p'),
      ...params.renderingSpeed([{ id: 'std', label: 'Standard' }, { id: 'pro', label: 'Pro' }], 'std'),
      ...params.generateAudio(false),
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
      ...params.resolution(['720p', '1080p'], '720p'),
      ...params.renderingSpeed([{ id: 'std', label: 'Standard' }, { id: 'pro', label: 'Pro' }], 'std'),
      ...klingCharacterOrientation,
      ...klingKeepOriginalSound,
      ...params.imageInput(1, 'Person Photo (upper body)', true),
      ...params.videoInput('Motion Reference Video'),
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
      ...params.resolution(['720p', '1080p'], '720p'),
      ...params.renderingSpeed([{ id: 'std', label: 'Standard' }, { id: 'pro', label: 'Pro' }], 'std'),
      ...klingCharacterOrientation,
      ...klingKeepOriginalSound,
      ...params.imageInput(1, 'Person Photo (upper body)', true),
      ...params.videoInput('Motion Reference Video'),
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
      // Swagger marks both sound_file and audio_id individually optional, but the
      // backend requires at least one. UI keeps sound_file required; audio_id
      // remains exposed as an additive alternative for SDK / batch users who
      // pass a TTS-generated reference instead of an uploaded file.
      ...params.audioInput('Speech Audio', true),
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
    id: 'kling-v2-new-image', name: 'Kling V2 New Image', modelId: 'kling-v2-new',
    addedAt: '2026-03-25',
    workflow: 'kling/v1/images/generations',
    estimatedTime: 15,
    mode: 'image', inputType: 't2i',
    description: 'Latest V2 image generation with optional restyle via image reference.',
    features: [feat('Image Input', 'input'), feat('Negative Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.negativePrompt(),
      ...params.imageInput(1, 'Restyle Image', true), // backend requires image despite t2i
      ...klingImageReference,
      ...params.imageWeight(0, 100, 50, 5),
      ...klingHumanFidelity,
    },
  },
  {
    id: 'kling-v2-image', name: 'Kling V2 Image', modelId: 'kling-v2',
    addedAt: '2026-03-25',
    deprecated: true, // superseded by kling-v3-omni / kling-v3-pro
    workflow: 'kling/v1/images/generations',
    estimatedTime: 15,
    mode: 'image', inputType: 't2i',
    description: 'Standard V2 image generation with optional restyle via image reference.',
    features: [feat('Image Input', 'input'), feat('Negative Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.negativePrompt(),
      ...params.imageInput(1, 'Restyle Image'),
      ...params.imageWeight(0, 100, 50, 5),
      ...klingHumanFidelity,
    },
  },
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
      ...params.imageWeight(0, 100, 50, 5),
      ...klingHumanFidelity,
    },
  },
  {
    id: 'kling-v1-5-image', name: 'Kling V1.5 Image', modelId: 'kling-v1-5',
    addedAt: '2026-03-25',
    deprecated: true, // superseded by kling-v3-omni (4 generations behind)
    workflow: 'kling/v1/images/generations',
    estimatedTime: 15,
    mode: 'image', inputType: 't2i',
    description: 'V1.5 image generation with subject and face reference support.',
    features: [feat('Image Input', 'input'), feat('Negative Prompt', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.negativePrompt(),
      ...params.imageInput(1, 'Restyle Image', true),
      ...klingImageReference,
      ...params.imageWeight(0, 100, 50, 5),
      ...klingHumanFidelity,
    },
  },
  // ── Image: Multi-Image-to-Image ─────────────────────────────────
  {
    id: 'kling-multi-image', name: 'Kling Multi-Image', modelId: 'kling-v2-multi',
    addedAt: '2026-03-25',
    deprecated: true, // V2 is 3 generations behind v3
    workflow: 'kling/v1/images/multi-image-to-image',
    estimatedTime: 20,
    mode: 'image', inputType: 'i2i',
    description: 'Compose up to 4 subject images into a new scene with optional prompt.',
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
    disabled: true, // pending backend toolId + pricing confirmation
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
      ...params.imageInput(4, 'Reference Images (1st = frontal)', false),
      ...params.videoInput('Reference Video', 'reference', false),
      elementVoiceId: {
        label: 'Voice ID (video elements only)',
        descriptor: { kind: 'text' },
      },
    },
  },
  // ── Video: Video Effects ────────────────────────────────────────────
  {
    id: 'kling-video-effects', name: 'Kling Video Effects',
    addedAt: '2026-05-13',
    workflow: 'kling/v1/video-effects',
    estimatedTime: 30,
    mode: 'video', inputType: 'i2v',
    badge: ['new'] as const,
    description: 'Apply 270+ visual effects to photos — single or dual-image scenes.',
    features: [feat('Image Input', 'input'), feat('Video Effects', 'characteristic')],
    paramConfig: {
      ...params.catalog('templateId', {
        label: 'Effect',
        source: { workflow: 'kling/v1/catalog/templates' },
        default: 'korean_baseball',
      }),
      ...params.imageInput(2, 'Effect Images', true),
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
      ...params.videoInput('Source Video'),
    },
  },
]);

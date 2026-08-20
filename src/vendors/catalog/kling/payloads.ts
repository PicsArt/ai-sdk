/**
 * Kling payload builders.
 *
 * All builders take `ModelInput<'<id>'>` typed inputs (generated from each
 * model's paramConfig) and produce the flat pluggable wire shape.
 *
 * Combined-entry V3 / V2.6: the same builder serves both T2V (primary) and
 * I2V (edit) routes — startFrame presence switches to the image-to-video
 * workflow. registerPayloads covers the primary slot; registerEditPayloads
 * covers the edit slot.
 */
import type { WorkflowTypes } from '@picsart/workflows-types';
import type { ModelInput } from '../../../generated/model-input-types.ts';
import { registerEditPayloads, registerPayloads } from '../../define.ts';
import { MODELS } from './index.ts';

// ── Per-model input aliases ─────────────────────────────────────────

type KlingV3Input = ModelInput<'kling-v3'>;
type KlingV3TurboInput = ModelInput<'kling-v3-turbo'>;
type KlingV26Input = ModelInput<'kling-v2-6'>;
type KlingOmniV3Input = ModelInput<'kling-v3-omni'>;
type KlingVideoO1Input = ModelInput<'kling-video-o1'>;
type KlingMotionControlInput = ModelInput<'kling-motion-control-v3'>;
type KlingAvatarInput = ModelInput<'kling-avatar'>;
type KlingT2AInput = ModelInput<'kling-t2a'>;
type KlingV2AInput = ModelInput<'kling-v2a'>;
type KlingOmniImageInput = ModelInput<'kling-3.0-image'>;
type KlingGenerationsWithRef = ModelInput<'kling-v2-new-image'>;
type KlingGenerationsNoRef = ModelInput<'kling-v2-image'>;
type KlingMultiImageInput = ModelInput<'kling-multi-image'>;
type KlingElementsInput = ModelInput<'kling-elements'>;
type KlingVideoEffectsInput = ModelInput<'kling-video-effects'>;

// ── Payload-shape aliases (WorkflowTypes — outbound payload contract) ──
// Combined-entry V3/V26 use the I2V payload shape (superset — every T2V
// field is also on I2V, plus image / image_tail / static_mask / element_list).

type KlingVideoPayload = WorkflowTypes['kling-image-to-video']['params'];
type KlingOmniVideoPayload = WorkflowTypes['kling-omni-video']['params'];
// Omni media-array element types, derived from the wire contract.
type KlingOmniImageRef = NonNullable<KlingOmniVideoPayload['image_list']>[number];
type KlingOmniVideoRef = NonNullable<KlingOmniVideoPayload['video_list']>[number];
type KlingMotionControlPayload = WorkflowTypes['kling-motion-control']['params'];
type KlingAvatarPayload = WorkflowTypes['kling-avatar']['params'];
type KlingT2APayload = WorkflowTypes['kling-text-to-audio']['params'];
type KlingV2APayload = WorkflowTypes['kling-video-to-audio']['params'];
type KlingOmniImagePayload = WorkflowTypes['kling/v1/images/omni-image']['params'];
type KlingGenerationsPayload = WorkflowTypes['kling/v1/images/generations']['params'];
type KlingMultiImagePayload = WorkflowTypes['kling/v1/images/multi-image-to-image']['params'];
type KlingElementsPayload = WorkflowTypes['kling-elements']['params'];
// kling/v1/video-effects — not in WorkflowTypes; builder return stays inferred.

// ── Combined T2V/I2V: kling-v3 ──────────────────────────────────────

/** Kling V3 — used for both T2V (primary) and I2V (edit) routes.
 *  - duration MUST be string.
 *  - sound 'on' only when generateAudio AND no end-frame (end-frame mode disables audio).
 *  - mode: '4k' if defaultMode='4k', else 'pro' for end-frame, else renderingSpeed ?? defaultMode.
 *  - end-frame requires renderingSpeed !== 'std'.
 *  - voice_list / element_list are mutually exclusive in I2V; voice_list wins when both set.
 *  - static_mask: I2V-only (gated on startFrame). */
export const buildKlingV3Payload =
  (defaultMode: 'pro' | 'std' | '4k' = 'std') =>
  (input: KlingV3Input): KlingVideoPayload => {
    const hasEndFrame = !!(input.startFrame && input.endFrame && input.renderingSpeed !== 'std');
    const hasSound = !!input.generateAudio && !hasEndFrame;
    const mode: 'std' | 'pro' | '4k' = defaultMode === '4k'
      ? '4k'
      : (hasEndFrame ? 'pro' : (input.renderingSpeed ?? defaultMode));
    return {
      ...(input.multiShot ? {} : { prompt: input.prompt }),
      aspect_ratio: input.aspectRatio ?? '16:9',
      // String(n) is just `string`; wire expects '3'|'5'|...|'15'. Narrowing cast.
      duration: String(input.duration ?? 5) as KlingVideoPayload['duration'],
      model_name: 'kling-v3',
      ...(input.startFrame ? { image: input.startFrame } : {}),
      ...(hasEndFrame ? { image_tail: input.endFrame } : {}),
      ...(input.negativePrompt ? { negative_prompt: input.negativePrompt } : {}),
      ...(hasSound ? { sound: 'on' } : {}),
      mode,
      ...(input.multiShot != null ? { multi_shot: input.multiShot } : {}),
      ...(input.shotType ? { shot_type: input.shotType } : {}),
      ...(input.multiPrompt ? { multi_prompt: input.multiPrompt } : {}),
      // voice_list and element_list are mutex in I2V — voice_list wins
      // when both are set (matches backend behavior, per the workflow schema).
      ...(input.voiceList ? { voice_list: input.voiceList } : {}),
      ...(input.startFrame && input.elementList && !input.voiceList
        ? { element_list: input.elementList } : {}),
      ...(input.startFrame && input.staticMask ? { static_mask: input.staticMask } : {}),
    };
  };

// ── Combined T2V/I2V: kling-v3-turbo ────────────────────────────────

/** Kling V3 Turbo — used for both T2V (primary) and I2V (edit) routes.
 *  Reduced surface vs V3: exposes `resolution` (720p/1080p) in place of the
 *  std/pro/4k `mode` tier, and the backend accepts ONLY these fields for
 *  kling-v3-turbo. It rejects `sound`, `image_tail`, and the multi_shot /
 *  shot_type / multi_prompt / voice_list / element_list family (those are
 *  kling-v3-only), so this builder never emits them.
 *  - duration MUST be string.
 *  - static_mask: I2V-only (gated on startFrame). */
export const buildKlingV3TurboPayload = (input: KlingV3TurboInput): KlingVideoPayload => ({
  prompt: input.prompt,
  aspect_ratio: input.aspectRatio ?? '16:9',
  // String(n) is just `string`; wire expects '3'|'5'|...|'15'. Narrowing cast.
  duration: String(input.duration ?? 5) as KlingVideoPayload['duration'],
  model_name: 'kling-v3-turbo',
  resolution: input.resolution ?? '720p',
  ...(input.startFrame ? { image: input.startFrame } : {}),
  ...(input.negativePrompt ? { negative_prompt: input.negativePrompt } : {}),
  ...(input.startFrame && input.staticMask ? { static_mask: input.staticMask } : {}),
});

// ── Combined T2V/I2V: kling-v2-6 ────────────────────────────────────

/** Kling V2.6 — used for both T2V and I2V.
 *  - mode hardcoded to 'pro' (backend has no pricing for 'std' on V2.6 — OPTIONS returns null credits).
 *  - cfgScale optional in [0..1].
 *  - end-frame gated on renderingSpeed !== 'std'. */
export const buildKlingV26Payload = (input: KlingV26Input): KlingVideoPayload => {
  const hasEndFrame = !!(input.startFrame && input.endFrame && input.renderingSpeed !== 'std');
  const hasSound = !!input.generateAudio && !hasEndFrame;
  return {
    prompt: input.prompt,
    aspect_ratio: input.aspectRatio ?? '16:9',
    duration: String(input.duration ?? 5) as KlingVideoPayload['duration'],
    model_name: 'kling-v2-6',
    ...(input.startFrame ? { image: input.startFrame } : {}),
    ...(hasEndFrame ? { image_tail: input.endFrame } : {}),
    ...(input.negativePrompt ? { negative_prompt: input.negativePrompt } : {}),
    ...(hasSound ? { sound: 'on' } : {}),
    mode: 'pro',
    ...(input.cfgScale !== undefined ? { cfg_scale: input.cfgScale } : {}),
  };
};

// ── Omni video ──────────────────────────────────────────────────────

const stringElementList = (list?: Array<{ element_id: string | number }>) =>
  list?.length ? { element_list: list.map(e => ({ element_id: String(e.element_id) })) } : {};

/** V3 Omni video — full surface (multi-shot, omni media lists, element refs).
 *  Media assembly: the model exposes flat file slots (startFrame / endFrame /
 *  imageUrls / videoUrl + referType / keepOriginalSound); this builder folds
 *  them into the wire `image_list` and `video_list` arrays.
 *  - aspect_ratio omitted when video_list:base or a first frame is supplied.
 *  - duration omitted for video_list:base (output duration = input duration).
 *  - mode='4k' valid only when resolution='4k' AND no reference video.
 *  - sound forced off when reference video present.
 *  - element_list requires element_id as STRING (cf. V3 T2V which accepts number). */
const buildOmniV3 = (input: KlingOmniV3Input): KlingOmniVideoPayload => {
  const imageList: KlingOmniImageRef[] = [
    ...(input.startFrame ? [{ image_url: input.startFrame, type: 'first_frame' as const }] : []),
    ...(input.endFrame ? [{ image_url: input.endFrame, type: 'end_frame' as const }] : []),
    ...(input.imageUrls ?? []).map(image_url => ({ image_url })),
  ];
  const videoList: KlingOmniVideoRef[] = input.videoUrl
    ? [{
        video_url: input.videoUrl,
        refer_type: input.referType ?? 'feature',
        keep_original_sound: input.keepOriginalSound ?? 'yes',
      }]
    : [];
  const hasBaseEdit = videoList[0]?.refer_type === 'base';
  const hasReferenceVideo = videoList.length > 0;
  const fourK = input.resolution === '4k' && !hasReferenceVideo;
  const hasSound = !!input.generateAudio && !hasReferenceVideo;
  return {
    ...(input.multiShot ? {} : { prompt: input.prompt }),
    model_name: 'kling-v3-omni',
    ...(hasBaseEdit || input.startFrame
      ? {}
      : { aspect_ratio: input.aspectRatio ?? '16:9' }),
    // String(n) is just `string`; wire expects literal union. Narrowing cast.
    ...(hasBaseEdit ? {} : { duration: String(input.duration ?? 5) as KlingOmniVideoPayload['duration'] }),
    ...(fourK ? { mode: '4k' as const } : (input.renderingSpeed ? { mode: input.renderingSpeed } : {})),
    ...(input.multiShot != null ? { multi_shot: input.multiShot } : {}),
    ...(input.shotType ? { shot_type: input.shotType } : {}),
    ...(input.multiPrompt ? { multi_prompt: input.multiPrompt } : {}),
    ...(imageList.length ? { image_list: imageList } : {}),
    ...(videoList.length ? { video_list: videoList } : {}),
    ...stringElementList(input.elementList),
    ...(hasSound ? { sound: 'on' } : {}),
  };
};

/** Video O1 — minimal omni surface. The backend rejects multi_shot / image_list /
 *  video_list / element_list for non-v3-omni models, so the O1 paramConfig
 *  intentionally omits those descriptors. Builder reads only the simple fields. */
const buildVideoO1 = (input: KlingVideoO1Input): KlingOmniVideoPayload => {
  const hasSound = !!input.generateAudio;
  return {
    prompt: input.prompt,
    model_name: 'kling-video-o1',
    aspect_ratio: input.aspectRatio ?? '16:9',
    duration: String(input.duration ?? 5) as KlingOmniVideoPayload['duration'],
    ...(input.renderingSpeed ? { mode: input.renderingSpeed } : {}),
    ...(hasSound ? { sound: 'on' } : {}),
  };
};

// ── Motion control ──────────────────────────────────────────────────

/** Motion Control — transfer body movement from a reference video onto a portrait. */
const buildMotionControl =
  (backendModelName: 'kling-v3' | 'kling-v2-6') =>
  (input: KlingMotionControlInput): KlingMotionControlPayload => ({
    prompt: input.prompt,
    // imageUrls is typed [string, ...string[]] (required tuple) — [0] is `string`.
    image_url: input.imageUrls[0],
    video_url: input.videoUrl,
    character_orientation: input.characterOrientation ?? 'video',
    mode: input.renderingSpeed ?? 'std',
    ...(input.keepOriginalSound ? { keep_original_sound: input.keepOriginalSound } : {}),
    model_name: backendModelName,
  });

// ── Avatar ──────────────────────────────────────────────────────────

/** Avatar — talking head from portrait + audio (sound_file URL or audio_id). */
export const buildKlingAvatarPayload = (input: KlingAvatarInput): KlingAvatarPayload => ({
  // imageUrls is typed [string, ...string[]] (required tuple).
  image: input.imageUrls[0],
  ...(input.audioUrl ? { sound_file: input.audioUrl } : {}),
  ...(input.audioId ? { audio_id: input.audioId } : {}),
  prompt: input.prompt,
  ...(input.renderingSpeed ? { mode: input.renderingSpeed } : {}),
});

// ── Omni image (T2I with optional multi-reference) ──────────────────

const buildOmniImage =
  (modelName: 'kling-v3-omni' | 'kling-image-o1') =>
  (input: KlingOmniImageInput): KlingOmniImagePayload => ({
    prompt: input.prompt,
    model_name: modelName,
    n: input.count ?? 1,
    ...(input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}),
    ...(input.resolution ? { resolution: input.resolution } : {}),
    ...(input.imageUrls?.length
      ? { image_list: input.imageUrls.map(url => ({ image_url: url })) }
      : {}),
  });

// ── Generations (standard T2I + optional I2I restyle) ───────────────

const buildGenerations =
  (modelName: 'kling-v2-new' | 'kling-v2' | 'kling-v2-1' | 'kling-v1-5') =>
  (input: KlingGenerationsWithRef | KlingGenerationsNoRef): KlingGenerationsPayload => {
    const imageUrls = input.imageUrls;
    const hasImage = !!imageUrls?.[0];
    const imageReference = hasImage && 'imageReference' in input
      ? (input.imageReference ?? (modelName === 'kling-v1-5' ? 'subject' : undefined))
      : undefined;
    return {
      prompt: input.prompt,
      model_name: modelName,
      n: input.count ?? 1,
      ...(input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}),
      ...(input.negativePrompt ? { negative_prompt: input.negativePrompt } : {}),
      ...(hasImage ? { image: imageUrls![0] } : {}),
      ...(imageReference ? { image_reference: imageReference } : {}),
      ...(hasImage && input.imageWeight != null
        ? { image_fidelity: input.imageWeight / 100 }
        : {}),
      ...(input.humanFidelity != null ? { human_fidelity: input.humanFidelity } : {}),
    };
  };

// ── Multi-image-to-image ────────────────────────────────────────────

const buildMultiImage =
  (modelName: 'kling-v2' | 'kling-v2-1') =>
  (input: KlingMultiImageInput): KlingMultiImagePayload => ({
    model_name: modelName,
    n: input.count ?? 1,
    ...(input.prompt ? { prompt: input.prompt } : {}),
    subject_image_list: (input.imageUrls ?? []).map(url => ({ subject_image: url })),
    ...(input.sceneImage ? { scene_image: input.sceneImage } : {}),
    ...(input.styleImage ? { style_image: input.styleImage } : {}),
    ...(input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}),
  });

// ── Elements factory ────────────────────────────────────────────────

/** Registers a reusable element (returns element_id).
 *  imageUrls[0] = frontal_image; imageUrls[1..] = refer_images (when image_refer).
 *  videoUrl = the single refer video (when video_refer). */
export const buildKlingElementsPayload = (input: KlingElementsInput): KlingElementsPayload => {
  const isVideo = input.referenceType === 'video_refer';
  return {
    element_name: input.elementName,
    element_description: input.elementDescription,
    reference_type: input.referenceType ?? 'image_refer',
    ...(isVideo
      ? (input.videoUrl
        ? { element_video_list: { refer_videos: [{ video_url: input.videoUrl }] } }
        : {})
      : (input.imageUrls?.length
        ? {
            element_image_list: {
              frontal_image: input.imageUrls[0],
              refer_images: (input.imageUrls.slice(1) ?? []).map(url => ({ image_url: url })),
            },
          }
        : {})),
    ...(input.elementVoiceId ? { element_voice_id: input.elementVoiceId } : {}),
  };
};

// ── Video effects (single or dual-image scenes) ─────────────────────

export const buildKlingVideoEffectsPayload = (input: KlingVideoEffectsInput & { style?: string }) => {
  const isDualEffect = input.imageUrls && input.imageUrls.length >= 2;
  return {
    // `style` carried the effect id before the catalog-bound `templateId` param
    // (4.1); persisted history still sends it. Alias removed in the next major.
    effect_scene: input.templateId ?? input.style,
    ...(isDualEffect
      ? { images: input.imageUrls!.slice(0, 2) }
      : input.imageUrls?.[0] ? { image: input.imageUrls[0] } : {}),
  };
};

// ── Audio ───────────────────────────────────────────────────────────

/** Text-to-Audio. duration is a NUMBER (not string — unlike video).
 *  Backend boundary range: 3.0 ≤ duration ≤ 10.0 (decimal allowed). */
export const buildKlingT2APayload = (input: KlingT2AInput): KlingT2APayload => ({
  prompt: input.prompt,
  duration: input.duration ?? 5,
});

/** Video-to-Audio. */
export const buildKlingV2APayload = (input: KlingV2AInput): KlingV2APayload => ({
  video_url: input.videoUrl,
});

// ── Registration ────────────────────────────────────────────────────

// Pre-bind combined-entry builders once (reused for primary + edit slots).
const klingV3Builder = buildKlingV3Payload('std');

registerPayloads(MODELS, {
  // Combined-entry video — primary slot
  'kling-v3': klingV3Builder,
  'kling-v3-turbo': buildKlingV3TurboPayload,
  'kling-v2-6': buildKlingV26Payload,
  // Omni video
  'kling-v3-omni': buildOmniV3,
  'kling-video-o1': buildVideoO1,
  // Motion control
  'kling-motion-control-v3': buildMotionControl('kling-v3'),
  'kling-motion-control': buildMotionControl('kling-v2-6'),
  // Avatar
  'kling-avatar': buildKlingAvatarPayload,
  // Omni image
  'kling-3.0-image': buildOmniImage('kling-v3-omni'),
  'kling-o1-image': buildOmniImage('kling-image-o1'),
  // Generations
  'kling-v2-new-image': buildGenerations('kling-v2-new'),
  'kling-v2-image': buildGenerations('kling-v2'),
  'kling-v2-1-image': buildGenerations('kling-v2-1'),
  'kling-v1-5-image': buildGenerations('kling-v1-5'),
  // Multi-image
  'kling-multi-image': buildMultiImage('kling-v2'),
  'kling-multi-image-v2-1': buildMultiImage('kling-v2-1'),
  // Elements
  'kling-elements': buildKlingElementsPayload,
  // Video effects
  'kling-video-effects': buildKlingVideoEffectsPayload,
  // Audio
  'kling-t2a': buildKlingT2APayload,
  'kling-v2a': buildKlingV2APayload,
});

// Combined-entry video — edit slot (same builder serves T2V + I2V routes).
registerEditPayloads(MODELS, {
  'kling-v3': klingV3Builder,
  'kling-v3-turbo': buildKlingV3TurboPayload,
  'kling-v2-6': buildKlingV26Payload,
});

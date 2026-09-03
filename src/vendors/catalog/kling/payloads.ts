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
import { getHydratedCatalog } from '../../../core/catalogs.ts';
import { ApiError } from '../../../core/errors.ts';
import { registerEditPayloads, registerPayloads } from '../../define.ts';
import { KLING_DUAL_IMAGE_EFFECTS, MODELS } from './index.ts';

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
type KlingV21ImageInput = ModelInput<'kling-v2-1-image'>;
type KlingMultiImageInput = ModelInput<'kling-multi-image-v2-1'>;
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

// ── Shared guards ───────────────────────────────────────────────────

/** Vendor rule for multi-shot (customize): `multi_prompt` is required with
 *  1-6 storyboards whose durations sum to the total `duration`. The worker
 *  rejects violations with a generic 400 — fail fast client-side instead. */
function assertMultiPrompt(
  multiPrompt: Array<{ index?: number; prompt?: string; duration?: string }> | undefined,
  totalDuration: number,
  model: string,
): void {
  if (!multiPrompt?.length || multiPrompt.length > 6) {
    throw new ApiError(`${model}: multi-shot mode requires 1-6 storyboard entries in multiPrompt.`, { status: 400, code: 'validation_error' });
  }
  const durations = multiPrompt.map(s => Number(s.duration));
  if (durations.some(d => !Number.isFinite(d) || d < 1 || d > totalDuration)) {
    throw new ApiError(`${model}: each storyboard duration must be between 1 and the total duration (${totalDuration}s).`, { status: 400, code: 'validation_error' });
  }
  const sum = durations.reduce((a, b) => a + b, 0);
  if (sum !== totalDuration) {
    throw new ApiError(`${model}: storyboard durations must add up to the total duration (${sum}s ≠ ${totalDuration}s).`, { status: 400, code: 'validation_error' });
  }
}

// ── Combined T2V/I2V: kling-v3 ──────────────────────────────────────

/** Kling V3 — used for both T2V (primary) and I2V (edit) routes.
 *  - duration MUST be string.
 *  - sound 'on' whenever generateAudio (v3 supports audio with end frames).
 *  - mode comes straight from renderingSpeed (v3 supports frames in std/pro/4k).
 *  - multi-shot (customize) requires a valid multiPrompt — validated up front.
 *  - voice_list: I2V-only per the vendor spec, and only with sound 'on'.
 *  - element_list: I2V-only, mutex with voice_list (voice_list wins). */
export const buildKlingV3Payload =
  (defaultMode: 'pro' | 'std' | '4k' = 'std') =>
  (input: KlingV3Input): KlingVideoPayload => {
    const hasEndFrame = !!(input.startFrame && input.endFrame);
    const hasSound = !!input.generateAudio;
    const mode: 'std' | 'pro' | '4k' = input.renderingSpeed ?? defaultMode;
    const totalDuration = input.duration ?? 5;
    if (input.multiShot && (input.shotType ?? 'customize') !== 'intelligence') {
      assertMultiPrompt(input.multiPrompt, totalDuration, 'Kling V3');
    }
    const voiceList = hasSound && input.startFrame ? input.voiceList : undefined;
    return {
      ...(input.multiShot ? {} : { prompt: input.prompt }),
      aspect_ratio: input.aspectRatio ?? '16:9',
      // String(n) is just `string`; wire expects '3'|'5'|...|'15'. Narrowing cast.
      duration: String(totalDuration) as KlingVideoPayload['duration'],
      model_name: 'kling-v3',
      ...(input.startFrame ? { image: input.startFrame } : {}),
      ...(hasEndFrame ? { image_tail: input.endFrame } : {}),
      ...(input.negativePrompt ? { negative_prompt: input.negativePrompt } : {}),
      ...(hasSound ? { sound: 'on' } : {}),
      mode,
      ...(input.multiShot != null ? { multi_shot: input.multiShot } : {}),
      ...(input.shotType ? { shot_type: input.shotType } : {}),
      ...(input.multiPrompt ? { multi_prompt: input.multiPrompt } : {}),
      // voice_list requires sound 'on' and exists only on the I2V spec;
      // element_list is I2V-only and mutex with voice_list (voice_list wins).
      ...(voiceList ? { voice_list: voiceList } : {}),
      ...(input.startFrame && input.elementList && !voiceList
        ? { element_list: input.elementList } : {}),
    };
  };

// ── Combined T2V/I2V: kling-v3-turbo ────────────────────────────────

/** Kling V3 Turbo — used for both T2V (primary) and I2V (edit) routes.
 *  Reduced surface vs V3: exposes `resolution` (720p/1080p) in place of the
 *  std/pro/4k `mode` tier, and the backend accepts ONLY these fields for
 *  kling-v3-turbo. It rejects `sound`, `image_tail`, `static_mask`, and the
 *  multi_shot / shot_type / multi_prompt / voice_list / element_list family
 *  (those are kling-v3-only), so this builder never emits them.
 *  - duration MUST be string.
 *  - The turbo API has no negative_prompt field; per the vendor docs the
 *    prompt itself carries negative wording, so negativePrompt is folded in. */
export const buildKlingV3TurboPayload = (input: KlingV3TurboInput): KlingVideoPayload => ({
  // Cap the folded string at the declared 2500-char prompt limit: the prompt
  // alone passed validation, so trimming can only ever hit the negative tail.
  prompt: input.negativePrompt
    ? `${input.prompt}. Avoid: ${input.negativePrompt}`.slice(0, 2500)
    : input.prompt,
  aspect_ratio: input.aspectRatio ?? '16:9',
  // String(n) is just `string`; wire expects '3'|'5'|...|'15'. Narrowing cast.
  duration: String(input.duration ?? 5) as KlingVideoPayload['duration'],
  model_name: 'kling-v3-turbo',
  resolution: input.resolution ?? '720p',
  ...(input.startFrame ? { image: input.startFrame } : {}),
});

// ── Combined T2V/I2V: kling-v2-6 ────────────────────────────────────

/** Kling V2.6 — used for both T2V and I2V.
 *  - mode hardcoded to 'pro' (backend has no pricing for 'std' on V2.6 — OPTIONS
 *    returns null credits), which also satisfies the vendor's frames-need-1080P rule.
 *  - end frames produce silent videos on v2-6 (vendor: '1080P silent only'),
 *    so sound is dropped when both frames are set.
 *  - cfg_scale is NOT sent: Kling documents it as unsupported on v2.x. */
export const buildKlingV26Payload = (input: KlingV26Input): KlingVideoPayload => {
  const hasEndFrame = !!(input.startFrame && input.endFrame);
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
 *  - mode maps from `resolution`: 720p→std, 1080p→pro, 4k→4k (4K only without
 *    a reference video).
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
  const hasSound = !!input.generateAudio && !hasReferenceVideo;
  // Quality tier maps straight to the wire mode; 4K is unavailable with a
  // reference video (the constraint blocks it in the UI — downgrade to pro here).
  const mode: 'std' | 'pro' | '4k' =
    input.resolution === '4k' ? (hasReferenceVideo ? 'pro' : '4k')
    : input.resolution === '1080p' ? 'pro'
    : 'std';
  const totalDuration = input.duration ?? 5;
  // Omni's shotType is locked to 'customize', so multi-shot always needs storyboards.
  if (input.multiShot && !hasBaseEdit) {
    assertMultiPrompt(input.multiPrompt, totalDuration, 'Kling V3 Omni');
  }
  return {
    ...(input.multiShot ? {} : { prompt: input.prompt }),
    model_name: 'kling-v3-omni',
    ...(hasBaseEdit || input.startFrame
      ? {}
      : { aspect_ratio: input.aspectRatio ?? '16:9' }),
    // String(n) is just `string`; wire expects literal union. Narrowing cast.
    ...(hasBaseEdit ? {} : { duration: String(totalDuration) as KlingOmniVideoPayload['duration'] }),
    mode,
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

/** Avatar — talking head from portrait + audio. Vendor rule: EXACTLY one of
 *  sound_file / audio_id — the builder never emits both (the uploaded file
 *  wins); the worker validates the XOR for un-typed callers. */
export const buildKlingAvatarPayload = (input: KlingAvatarInput): KlingAvatarPayload => ({
  // imageUrls is typed [string, ...string[]] (required tuple).
  image: input.imageUrls[0],
  ...(input.audioUrl ? { sound_file: input.audioUrl } : input.audioId ? { audio_id: input.audioId } : {}),
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

/** V2.1 generations. image_fidelity / human_fidelity are NOT sent — Kling
 *  supports them only on the retired v1.x models, and negative_prompt is
 *  ignored by the vendor in image-to-image mode (constraint surfaces that). */
const buildGenerations = (input: KlingV21ImageInput): KlingGenerationsPayload => {
  const hasImage = !!input.imageUrls?.[0];
  return {
    prompt: input.prompt,
    model_name: 'kling-v2-1',
    n: input.count ?? 1,
    ...(input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}),
    ...(input.negativePrompt && !hasImage ? { negative_prompt: input.negativePrompt } : {}),
    ...(hasImage ? { image: input.imageUrls![0] } : {}),
  };
};

const buildMultiImage =
  (input: KlingMultiImageInput): KlingMultiImagePayload => ({
    model_name: 'kling-v2-1',
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
 *  videoUrl = the single refer video (when video_refer).
 *  Vendor minimums are enforced up front: image_refer needs a frontal image
 *  PLUS 1-3 extra angles (refer_images has ArrayMinSize(1) worker-side), and
 *  video_refer needs the reference video. */
export const buildKlingElementsPayload = (input: KlingElementsInput): KlingElementsPayload => {
  const isVideo = input.referenceType === 'video_refer';
  if (isVideo && !input.videoUrl) {
    throw new ApiError('Kling Elements: video reference requires a reference video.', { status: 400, code: 'validation_error' });
  }
  if (!isVideo && (input.imageUrls?.length ?? 0) < 2) {
    throw new ApiError('Kling Elements: image reference requires at least 2 images — a frontal image plus 1-3 additional angles.', { status: 400, code: 'validation_error' });
  }
  return {
    element_name: input.elementName,
    element_description: input.elementDescription,
    reference_type: input.referenceType ?? 'image_refer',
    ...(isVideo
      ? { element_video_list: { refer_videos: [{ video_url: input.videoUrl! }] } }
      : {
          element_image_list: {
            frontal_image: input.imageUrls![0],
            refer_images: input.imageUrls!.slice(1).map(url => ({ image_url: url })),
          },
        }),
    ...(input.elementVoiceId ? { element_voice_id: input.elementVoiceId } : {}),
  };
};

// ── Video effects (single or dual-image scenes) ─────────────────────

/** The image slot count is a property of the SELECTED EFFECT, not of how many
 *  images the user happened to upload: dual-image scenes require exactly
 *  `images` (length 2), every other scene requires the single `image` field.
 *  The slot count comes from the hydrated template catalog (meta.imageSlots),
 *  falling back to the frozen KLING_DUAL_IMAGE_EFFECTS set when the catalog
 *  isn't loaded. */
export const buildKlingVideoEffectsPayload = (input: KlingVideoEffectsInput & { style?: string }) => {
  // `style` carried the effect id before the catalog-bound `templateId` param
  // (4.1); persisted history still sends it. Alias removed in the next major.
  const scene = input.templateId ?? input.style;
  const catalogItem = getHydratedCatalog({ workflow: 'kling/v1/catalog/templates' })
    ?.items.find(item => item.id === scene);
  const slots = typeof catalogItem?.meta?.imageSlots === 'number'
    ? catalogItem.meta.imageSlots
    : (scene && KLING_DUAL_IMAGE_EFFECTS.has(scene) ? 2 : 1);
  const uploaded = input.imageUrls?.length ?? 0;
  if (uploaded < slots) {
    throw new ApiError(`Kling Video Effects: the "${scene}" effect requires ${slots} image${slots > 1 ? 's' : ''} (got ${uploaded}).`, { status: 400, code: 'validation_error' });
  }
  return {
    effect_scene: scene,
    ...(slots === 2
      ? { images: input.imageUrls!.slice(0, 2) }
      : { image: input.imageUrls![0] }),
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
  'kling-v2-1-image': buildGenerations,
  // Multi-image
  'kling-multi-image-v2-1': buildMultiImage,
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

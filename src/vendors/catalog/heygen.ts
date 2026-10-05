/**
 * HeyGen — single source of truth.
 *
 * Two use cases:
 * 1. Photo Avatar (i2v) — animate a user photo into a speaking avatar
 * 2. Video Avatar (t2v) — generate video using a stock HeyGen avatar
 *
 * Both use the `heygen/v1/video/generate` pluggable workflow.
 * Avatar and voice lists are served at runtime by the platform catalog tasks
 * `heygen/v1/catalog/avatars` and `heygen/v1/catalog/voices` — load them via
 * `ai.catalogs.avatars('heygen-video-avatar')` / `ai.catalogs.voices(...)`.
 */
import type { Constraint, PayloadBuilder, VoiceOption, AvatarOption } from '../../core/types.ts';
import type { ModelParams } from '../../core/descriptors/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

// ── Payload builders ────────────────────────────────────────────────

/** Talking Photo: image_url + script + voice. */
export const buildHeyGenPhotoAvatarPayload: PayloadBuilder = (ctx) => ({
  image_url: ctx.imageUrls?.[0],
  script: ctx.prompt,
  voice_id: ctx.voiceId || undefined,
  ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
  ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
});

/** Video Avatar: avatar_id + script + voice, on the engine the caller picked. */
export const buildHeyGenVideoAvatarPayload: PayloadBuilder = (ctx) => {
  const c = ctx as typeof ctx & { engine?: string };
  return {
    avatar_id: ctx.videoId || undefined,
    script: ctx.prompt,
    voice_id: ctx.voiceId || undefined,
    ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
    ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
    ...(c.engine ? { engine: c.engine } : {}),
  };
};

// ── Shared param fragments ──────────────────────────────────────────

/**
 * HeyGen's rendering engine, opt-in on the worker.
 *
 * The default names Avatar IV because that is what HeyGen renders with when the
 * field is absent; it is a picker default only, and an unset engine still stays
 * off the wire, so shipped callers send exactly what they sent before Avatar V
 * existed. Avatar V is the newer engine — the face holds through a long script —
 * and costs the same, but it renders stock avatars only, which is why this is
 * offered on Video Avatar and not on Talking Photo: HeyGen refuses `engine` on
 * an image request outright.
 */
const engineParam: ModelParams = {
  engine: {
    label: 'Engine',
    required: false,
    descriptor: {
      kind: 'enum',
      valueType: 'string',
      options: [
        { id: 'avatar_iv', label: 'Avatar IV' },
        { id: 'avatar_v', label: 'Avatar V' },
      ],
      default: 'avatar_iv',
    },
  },
};

/** Voice options are loaded dynamically — empty array signals runtime fetch. */
const dynamicVoiceConfig = {
  ...params.voiceId([] as VoiceOption[], '', {
    required: true,
    catalog: { workflow: 'heygen/v1/catalog/voices' },
  }),
};

// ── HeyGen Video constraints ────────────────────────────────────────

const VIDEO1_MODE_EXCLUSIVE = 'A first frame and references cannot be combined — each picks a different mode.';
const VIDEO1_RATIO_FOLLOWS_FRAME = 'Aspect ratio follows the first-frame image.';
const VIDEO1_ADAPTIVE_NEEDS_REFS = 'Adaptive aspect ratio follows the references — add one to use it.';
/** Aspect ratios available without references — 'adaptive' needs them. */
const VIDEO1_RATIOS = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'] as const;

/**
 * HeyGen Video generates in one mode at a time — the backend resolves it
 * from the inputs (image → image_to_video, any reference → reference_to_video,
 * bare prompt → text_to_video) and refuses a field from another mode when it
 * carries a value. These rules keep the inputs on exactly one mode so the UI
 * greys the conflicting fields out before a request is made.
 */
const heygenVideo1Constraints: Constraint[] = [
  { when: { startFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: VIDEO1_MODE_EXCLUSIVE },
    videoUrls: { disabled: true, reason: VIDEO1_MODE_EXCLUSIVE },
    audioUrls: { disabled: true, reason: VIDEO1_MODE_EXCLUSIVE },
    // image_to_video always follows the first frame — the ratio is not a choice.
    aspectRatio: { disabled: true, reason: VIDEO1_RATIO_FOLLOWS_FRAME },
  } },
  { when: { imageUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: VIDEO1_MODE_EXCLUSIVE },
  } },
  { when: { videoUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: VIDEO1_MODE_EXCLUSIVE },
  } },
  { when: { audioUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: VIDEO1_MODE_EXCLUSIVE },
  } },
  // 'adaptive' means "follow the first reference" — no meaning without one.
  { when: { imageUrls: { exists: false }, videoUrls: { exists: false }, audioUrls: { exists: false } }, then: {
    aspectRatio: { allowed: [...VIDEO1_RATIOS], reason: VIDEO1_ADAPTIVE_NEEDS_REFS },
  } },
];

// ── Model definitions ───────────────────────────────────────────────

export const { MODELS } = defineModels('heygen', [
  // ── Photo Avatar (i2v) ────────────────────────────────────────────
  {
    id: 'heygen-talking-photo',
    modelId: 'heygen-avatar-iv',
    addedAt: '2026-03-17',
    name: 'HeyGen Talking Photo',
    workflow: 'heygen/v1/video/generate',
    buildPayload: buildHeyGenPhotoAvatarPayload,
    estimatedTime: 120,
    mode: 'video',
    inputType: 'i2v',
    description: 'Animate any photo into a speaking avatar with natural lip-sync.',
    features: [
      feat('Image Input', 'input'),
      feat('Voice Selection', 'audio'),
      feat('Lip Sync', 'characteristic'),
    ],
    paramConfig: {
      ...params.imageInput(1, 'Portrait Image', true),
      ...params.resolution(['4k', '1080p', '720p'], '720p'),
      ...params.aspectRatio(['16:9', '9:16', '4:5', '5:4', '1:1', 'auto']),
      ...dynamicVoiceConfig,
      ...params.prompt({ minLength: 20, maxLength: 5000, placeholder: 'Write the script your avatar will speak (at least 20 characters)...' }),
    },
  },
  // ── Video Avatar (t2v) ────────────────────────────────────────────
  {
    id: 'heygen-video-avatar',
    modelId: 'heygen-avatar-iv',
    addedAt: '2026-03-17',
    name: 'HeyGen Video Avatar',
    workflow: 'heygen/v1/video/generate',
    buildPayload: buildHeyGenVideoAvatarPayload,
    estimatedTime: 90,
    mode: 'video',
    inputType: 't2v',
    description: 'Generate a speaking avatar video from a stock avatar and text script.',
    features: [
      feat('Avatar Selection', 'characteristic'),
      feat('Voice Selection', 'audio'),
      feat('Lip Sync', 'characteristic'),
    ],
    paramConfig: {
      ...params.videoId([] as AvatarOption[], '', {
        required: true,
        catalog: { workflow: 'heygen/v1/catalog/avatars' },
      }),
      ...engineParam,
      ...params.resolution(['4k', '1080p', '720p'], '720p'),
      ...params.aspectRatio(['16:9', '9:16', '4:5', '5:4', '1:1', 'auto']),
      ...dynamicVoiceConfig,
      ...params.prompt({ minLength: 20, maxLength: 5000, placeholder: 'Write the script your avatar will speak (at least 20 characters)...' }),
    },
  },
  // ── HeyGen Video (t2v / i2v / r2v) ────────────────────────────────
  {
    // One entry for all three modes: the inputs pick it — a first-frame image
    // animates that image, references generate from references, a bare prompt
    // generates from text. Payload assembly lives in heygen.payloads.ts.
    id: 'heygen-video-1', name: 'HeyGen Video',
    addedAt: '2026-10-05',
    workflow: 'heygen/v1/models/video/generate',
    estimatedTime: 60,
    mode: 'video', inputType: 't2v',
    description: 'HeyGen Video — video with native audio from text, a first-frame image, or up to 12 reference images, videos and audio. Refer to references in the prompt as Picture 1, Video 1, in input order. Up to 15s at 768p.',
    features: [
      feat('Start Frame', 'frame'), feat('Multi-Image Input', 'input'),
      feat('Video Input', 'input'), feat('Audio Input', 'input'),
      feat('Audio', 'audio'), feat('5-15 sec', 'duration'),
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 32000 }),
      ...params.startFrame('Start Frame', false),
      // Reference slots, reference-to-video route. The ≤12 files combined
      // across images + videos + audios stay backend-enforced.
      ...params.imageInput(9, 'Reference Images', false, 'reference'),
      ...params.videoInputs(3, 'Reference Videos'),
      ...params.audioInputs(3, 'Reference Audios'),
      ...params.resolution(['480p', '768p'], '768p'),
      ...params.durationRange(5, 15, 5),
      // 'adaptive' means "follow the references" — constrained below.
      ...params.aspectRatio(['adaptive', '21:9', '16:9', '4:3', '1:1', '3:4', '9:16'], '16:9'),
      ...p.enum('promptEnhancement', ['turbo', 'quality', 'disabled'], 'turbo', { label: 'Prompt Enhancement' }),
      // Unsigned 32-bit per the schema; sent only when the user sets it.
      ...params.seed(4294967295),
    },
    constraints: heygenVideo1Constraints,
  },
]);

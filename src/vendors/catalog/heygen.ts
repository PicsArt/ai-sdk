/**
 * HeyGen — single source of truth.
 *
 * Two use cases:
 * 1. Photo Avatar (i2v) — animate a user photo into a speaking avatar
 * 2. Video Avatar (t2v) — generate video using a stock HeyGen avatar
 *
 * Both use the `heygen/v1/video/generate` pluggable workflow.
 * Avatar and voice lists are fetched dynamically at runtime from
 * `heygen/v1/avatars/list` and `heygen/v1/voices/list`.
 */
import type { PayloadBuilder, VoiceOption, AvatarOption } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

// ── Payload builders ────────────────────────────────────────────────

/** Talking Photo: image_url + script + voice. */
export const buildHeyGenPhotoAvatarPayload: PayloadBuilder = (ctx) => ({
  image_url: ctx.imageUrls?.[0],
  script: ctx.prompt,
  voice_id: ctx.voiceId || undefined,
  ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
  ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
});

/** Video Avatar: avatar_id + script + voice. */
export const buildHeyGenVideoAvatarPayload: PayloadBuilder = (ctx) => ({
  avatar_id: ctx.videoId || undefined,
  script: ctx.prompt,
  voice_id: ctx.voiceId || undefined,
  ...(ctx.resolution ? { resolution: ctx.resolution } : {}),
  ...(ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}),
});

// ── Shared param fragments ──────────────────────────────────────────

/** Voice options are loaded dynamically — empty array signals runtime fetch. */
const dynamicVoiceConfig = {
  ...params.voiceId([] as VoiceOption[], '', { required: true }),
};

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
      ...params.aspectRatio(['16:9', '9:16']),
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
      ...params.videoId([] as AvatarOption[], '', { required: true }),
      ...params.resolution(['4k', '1080p', '720p'], '720p'),
      ...params.aspectRatio(['16:9', '9:16']),
      ...dynamicVoiceConfig,
      ...params.prompt({ minLength: 20, maxLength: 5000, placeholder: 'Write the script your avatar will speak (at least 20 characters)...' }),
    },
  },
]);

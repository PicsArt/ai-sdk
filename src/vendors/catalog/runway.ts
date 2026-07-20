/**
 * Runway — single source of truth.
 */
import type { Constraint, PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

// ── Avatar & voice presets ──────────────────────────────────────────

const RUNWAY_AVATAR_PRESETS = [
  'Game Character', 'Music Superstar', 'Game Character Man', 'Cat Character',
  'Influencer', 'Tennis Coach', 'Human Resource', 'Fashion Designer', 'Cooking Teacher',
].map(name => ({ id: name.toLowerCase().replace(/ /g, '-'), label: name }));

const RUNWAY_VOICE_PRESETS = [
  'Victoria', 'Vincent', 'Clara', 'Drew', 'Skye', 'Max', 'Morgan', 'Felix',
  'Mia', 'Marcus', 'Summer', 'Ruby', 'Aurora', 'Jasper', 'Leo', 'Adrian',
  'Nina', 'Emma', 'Blake', 'David', 'Maya', 'Nathan', 'Sam', 'Georgia',
  'Petra', 'Adam', 'Zach', 'Violet', 'Roman', 'Luna',
].map(name => ({ id: name.toLowerCase(), name, description: '', tags: [] as string[], provider: 'runway' as const }));

// ── Ratio maps ──────────────────────────────────────────────────────

/**
 * Gen4.5 uses 720p base; Gen4 Ref uses 1080p base.
 * NOTE: OpenAPI spec lists 1104:832/960:960/832:1104 but backend rejects them
 * for T2V (body validation error). Only 1280:720 and 720:1280 confirmed working.
 */
const RUNWAY_RATIO_MAP: Record<string, string> = {
  '16:9': '1280:720',
  '9:16': '720:1280',
};

const RUNWAY_REF_RATIO_MAP: Record<string, string> = {
  '16:9': '1920:1080',
  '9:16': '1080:1920',
};

/** Gen-3 Alpha Turbo uses 768p base (NOT 720p). */
const RUNWAY_GEN3A_RATIO_MAP: Record<string, string> = {
  '16:9': '1280:768',
  '9:16': '768:1280',
};

// ── Payload builders ────────────────────────────────────────────────

/** Gen4.5 T2V + I2V (unified). promptImage added when image present. */
export const buildRunwayGen45Payload: PayloadBuilder = (ctx) => ({
  promptText: ctx.prompt,
  ...(ctx.imageUrls?.[0] ? { promptImage: [{ uri: ctx.imageUrls[0], position: 'first' }] } : {}),
  ratio: RUNWAY_RATIO_MAP[ctx.aspectRatio ?? '16:9'] ?? '1280:720',
  duration: ctx.duration ?? 5,
});

/** Aleph — video-to-video. Uses videoUri, preserves input ratio. */
export const buildRunwayAlephPayload: PayloadBuilder = (ctx) => ({
  model: 'gen4_aleph',
  promptText: ctx.prompt,
  videoUri: ctx.videoUrl,
  ratio: RUNWAY_RATIO_MAP[ctx.aspectRatio ?? '16:9'] ?? '1280:720',
});

/** Aleph 2 Alpha — V2V with optional keyframe images for guided restyling. */
export const buildRunwayAleph2AlphaPayload: PayloadBuilder = (ctx) => ({
  model: 'aleph2',
  promptText: ctx.prompt,
  videoUri: ctx.videoUrl,
  ratio: RUNWAY_RATIO_MAP[ctx.aspectRatio ?? '16:9'] ?? '1280:720',
  ...(ctx.startFrame || ctx.endFrame
    ? {
        promptImage: [
          ...(ctx.startFrame ? [{ uri: ctx.startFrame, position: 'first' as const }] : []),
          ...(ctx.endFrame ? [{ uri: ctx.endFrame, position: 'last' as const }] : []),
        ],
      }
    : {}),
});

/** Gen4 Ref — reference images. Up to 3 images, ratio 1920:1080 (NOT 1280:720). */
export const buildRunwayGen4RefPayload: PayloadBuilder = (ctx) => ({
  promptText: ctx.prompt,
  referenceImages: (ctx.imageUrls ?? []).map(url => ({ uri: url })),
  ratio: RUNWAY_REF_RATIO_MAP[ctx.aspectRatio ?? '16:9'] ?? '1920:1080',
});

/** Avatar Video — preset avatar + text or audio speech. */
const runwayAvatarVideoConstraints: Constraint[] = [
  {
    when: { audioUrl: { exists: true } },
    then: {
      voiceId: { disabled: true, reason: 'Voice comes from the attached audio file' },
      prompt:  { disabled: true, reason: 'Prompt is ignored when audio is attached' },
    },
  },
];

export const buildRunwayAvatarVideoPayload: PayloadBuilder = (ctx) => {
  const isAudioMode = !!ctx.audioUrl;
  return {
    avatarType: 'runway-preset',
    presetId: ctx.style ?? 'game-character',
    speechType: isAudioMode ? 'audio' : 'text',
    ...(isAudioMode
      ? { audio: ctx.audioUrl }
      : {
          text: ctx.prompt,
          ...(ctx.voiceId ? { voice: { type: 'preset' as const, presetId: ctx.voiceId } } : {}),
        }),
  };
};

/** Gen-3 Alpha Turbo — I2V via runway-video-generate pluggable workflow. */
export const buildRunwayGen3aTurboPayload: PayloadBuilder = (ctx) => ({
  promptText: ctx.prompt,
  model: 'gen3a_turbo',
  seed: Math.floor(Math.random() * 2_147_483_647),
  promptImage: [
    ...(ctx.startFrame ? [{ uri: ctx.startFrame, position: 'first' }] : []),
    ...(ctx.endFrame ? [{ uri: ctx.endFrame, position: 'last' }] : []),
  ],
  ratio: RUNWAY_GEN3A_RATIO_MAP[ctx.aspectRatio ?? '16:9'] ?? '1280:768',
  duration: ctx.duration ?? 5,
});

export const { MODELS } = defineModels('runway', [
  {
    id: 'runway-avatar-video', name: 'Runway Avatar',
    addedAt: '2026-04-17',
    workflow: 'runway/avatar/video',
    buildPayload: buildRunwayAvatarVideoPayload,
    constraints: runwayAvatarVideoConstraints,
    estimatedTime: 120,
    mode: 'video', inputType: 't2v',
    description: 'Generate speaking avatar videos from preset characters with natural lip-sync.',
    features: [feat('Audio Input', 'audio')],
    paramConfig: {
      ...params.style(RUNWAY_AVATAR_PRESETS, 'game-character'),
      ...params.voiceId(RUNWAY_VOICE_PRESETS, 'victoria'),
      ...params.prompt({ maxLength: 1500, placeholder: 'Write the script your avatar will speak...', required: false }),
      ...params.audioInput('Audio Track'),
    },
  },
  {
    id: 'runway-gen3a-turbo', name: 'Runway Gen-3 Alpha Turbo',
    addedAt: '2026-03-08',
    deprecated: true, // superseded by runway-gen45-t2v / runway-gen4-ref
    workflow: 'runway-video-generate',
    buildPayload: buildRunwayGen3aTurboPayload,
    estimatedTime: 20,
    mode: 'video', inputType: 'i2v',
    description: 'Fast I2V generation with start/end frame interpolation — ideal for controllable motion.',
    features: [feat('Start/End Frame', 'frame'), feat('5/10 sec', 'duration')],
    paramConfig: {
      ...params.prompt({ maxLength: 1000 }),
      ...params.duration([5, 10], 5),
      ...params.aspectRatio(['16:9', '9:16']),
      ...params.startFrame('Start Frame', true),
      ...params.endFrame(),
    },
  },
  {
    id: 'runway-gen4.5', name: 'Runway Gen 4.5',
    addedAt: '2026-02-06',
    workflow: 'runway-gen4-5-text-to-video', editWorkflow: 'runway-gen4-5-image-to-video',
    buildPayload: buildRunwayGen45Payload,
    estimatedTime: 24, editEstimatedTime: 36,
    mode: 'video', inputType: 't2v', badge: ['premium'] as const,
    description: 'Photorealistic motion at 1080p with nuanced camera and lighting.',
    features: [feat('Image Input', 'input'), feat('1080p', 'resolution'), feat('5/8/10 sec', 'duration')],
    paramConfig: {
      ...params.prompt({ maxLength: 1000 }),
      ...params.duration([5, 8, 10], 5),
      ...params.aspectRatio(['16:9', '9:16']),
      ...params.imageInput(),
    },
  },
  {
    id: 'runway-gen4-aleph', name: 'Runway Aleph',
    addedAt: '2026-02-06',
    deprecated: true, // Runway deprecates gen4_aleph on 2026-07-30; superseded by runway-aleph2
    workflow: 'runway-aleph', buildPayload: buildRunwayAlephPayload,
    estimatedTime: 135,
    mode: 'video', inputType: 'v2v',
    description: 'Transform or enhance existing video content through restyling.',
    features: [feat('Video Input', 'input')],
    paramConfig: { ...params.prompt({ maxLength: 1000 }), ...params.videoInput('Source Video', 'reference', true, 30) },
  },
  {
    id: 'runway-aleph2', name: 'Runway Aleph 2',
    addedAt: '2026-06-01',
    workflow: 'runway-aleph', buildPayload: buildRunwayAleph2AlphaPayload,
    estimatedTime: 135,
    mode: 'video', inputType: 'v2v',
    description: 'Next-gen video restyling with keyframe image guidance for precise motion and style control.',
    features: [feat('Video Input', 'input'), feat('Start/End Frame', 'frame')],
    paramConfig: {
      ...params.prompt({ maxLength: 1000 }),
      ...params.videoInput('Source Video', 'reference', true, 30),
      ...params.startFrame(),
      ...params.endFrame(),
    },
  },
  {
    id: 'runway-gen4-ref', name: 'Runway Gen4 Ref',
    addedAt: '2026-02-06',
    workflow: 'runway-gen4-image-ref', buildPayload: buildRunwayGen4RefPayload,
    estimatedTime: 6,
    mode: 'image', inputType: 'i2i',
    description: 'Generate a still image from up to 3 reference images with consistent identity.',
    features: [feat('Image Input', 'input'), feat('1080p', 'resolution')],
    paramConfig: {
      ...params.prompt({ maxLength: 1000 }),
      ...params.aspectRatio(['16:9', '9:16']),
      ...params.imageInput(3, 'Reference Images', true),
    },
  },
]);

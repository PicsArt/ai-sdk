/**
 * Hailuo (MiniMax Video) — single source of truth.
 * NOTE: Provider is 'minimax' (not 'hailuo') in the backend.
 */
import type { Constraint, PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

/** T2V payload — prompt + prompt_optimizer + optional duration (standard only). */
const buildT2V = (withDuration: boolean): PayloadBuilder => (ctx) => ({
  prompt: ctx.prompt,
  ...(ctx.enhancePrompt !== undefined ? { prompt_optimizer: ctx.enhancePrompt } : {}),
  ...(withDuration && ctx.duration ? { duration: String(ctx.duration) } : {}),
});

/** I2V payload — prompt + image_url + prompt_optimizer + optional duration (standard only). */
const buildI2V = (withDuration: boolean): PayloadBuilder => (ctx) => ({
  prompt: ctx.prompt,
  image_url: ctx.imageUrls?.[0],
  ...(ctx.enhancePrompt !== undefined ? { prompt_optimizer: ctx.enhancePrompt } : {}),
  ...(withDuration && ctx.duration ? { duration: String(ctx.duration) } : {}),
});

/**
 * MiniMax H3 (formerly Hailuo 03) — single unified `minimax/v2/video-generation` endpoint.
 * The mode is inferred from the discriminated `content[]` array roles:
 *   - one required `text` item (the prompt);
 *   - `first_frame` / `last_frame` image roles → i2v / keyframe;
 *   - `reference_image` / `reference_video` / `reference_audio` roles → multimodal v2v.
 * Frame roles and reference roles are mutually exclusive (backend-enforced).
 */
const buildMinimaxH3: PayloadBuilder = (ctx) => {
  const content: Array<Record<string, unknown>> = [{ type: 'text', text: ctx.prompt }];
  if (ctx.startFrame) content.push({ type: 'image_url', image_url: { url: ctx.startFrame }, role: 'first_frame' });
  if (ctx.endFrame) content.push({ type: 'image_url', image_url: { url: ctx.endFrame }, role: 'last_frame' });
  for (const url of ctx.imageUrls ?? []) content.push({ type: 'image_url', image_url: { url }, role: 'reference_image' });
  for (const url of ctx.videoUrls ?? []) content.push({ type: 'video_url', video_url: { url }, role: 'reference_video' });
  for (const url of ctx.audioUrls ?? []) content.push({ type: 'audio_url', audio_url: { url }, role: 'reference_audio' });
  return {
    model: 'MiniMax-H3',
    content,
    resolution: '2K',
    ...(ctx.duration ? { duration: ctx.duration } : {}),
    ...(ctx.aspectRatio ? { ratio: ctx.aspectRatio } : {}),
  };
};

// MiniMax H3 content-role rules, mirrored from the backend's
// IsValidContentCombination so the UI (and the OPTIONS matrix) never produces a
// combination the gateway rejects:
//   - first/last frame roles and reference roles are mutually exclusive;
//   - a last frame (endFrame) requires a start frame (startFrame);
//   - reference audio cannot be used alone — it needs a reference image or video.
const FRAME_REF_EXCLUSIVE = 'First/last frame and reference inputs cannot be combined.';
const LAST_NEEDS_FIRST = 'An end frame requires a start frame.';
const AUDIO_NEEDS_VISUAL = 'Reference audio needs a reference image or video.';

const minimaxH3Constraints: Constraint[] = [
  // Frame roles ⊥ reference roles (declared both ways so either input disables the other).
  { when: { startFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    videoUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    audioUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
  } },
  { when: { endFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    videoUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    audioUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
  } },
  { when: { imageUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    endFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
  } },
  { when: { videoUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    endFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
  } },
  { when: { audioUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    endFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
  } },
  // last_frame requires first_frame.
  { when: { startFrame: { exists: false } }, then: {
    endFrame: { disabled: true, reason: LAST_NEEDS_FIRST },
  } },
  // reference_audio cannot be the only reference input.
  { when: { imageUrls: { exists: false }, videoUrls: { exists: false } }, then: {
    audioUrls: { disabled: true, reason: AUDIO_NEEDS_VISUAL },
  } },
];

/** Shared base (mode + common params). Workflow set per-model. */
const base = {
  mode: 'video' as const,
} as const;

export const { MODELS } = defineModels('minimax', [
  {
    ...base, id: 'hailuo-2.3', name: 'Hailuo 2.3', modelId: 'hailuo-2.3',
    addedAt: '2026-02-06',
    inputType: 't2v' as const,
    workflow: 'minimax/hailuo-2.3/standard/text-to-video',
    editWorkflow: 'minimax/hailuo-2.3/standard/image-to-video',
    buildPayload: buildT2V(true),
    buildEditPayload: buildI2V(true),
    estimatedTime: 150,
    description: 'Stylized 720p animation with strong character expression and emotion.',
    features: [feat('Image Input', 'input'), feat('Start Frame', 'frame'), feat('720p', 'resolution'), feat('10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.enhancePrompt(),
      ...params.duration([6, 10]),
      ...params.imageInput(),
    },
  },
  {
    ...base, id: 'hailuo-2.3-pro', name: 'Hailuo 2.3 Pro', modelId: 'hailuo-2.3-pro',
    addedAt: '2026-02-06',
    inputType: 't2v' as const,
    workflow: 'minimax/hailuo-2.3/pro/text-to-video',
    editWorkflow: 'minimax/hailuo-2.3/pro/image-to-video',
    buildPayload: buildT2V(false),
    buildEditPayload: buildI2V(false),
    estimatedTime: 165,
    description: '1080p output focused on detailed scenes and polished short-form content.',
    features: [feat('Image Input', 'input'), feat('Start Frame', 'frame'), feat('1080p', 'resolution'), feat('6 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.enhancePrompt(),
      ...params.imageInput(),
    },
  },
  {
    ...base, id: 'hailuo-2.3-fast', name: 'Hailuo 2.3 Fast', modelId: 'hailuo-2.3-fast',
    addedAt: '2026-02-06',
    inputType: 'i2v' as const,
    workflow: 'minimax/hailuo-2.3-fast/standard/image-to-video',
    buildPayload: buildI2V(true),
    estimatedTime: 173,
    description: 'Quick 720p previews with expressive characters for rapid experimentation.',
    features: [feat('Image Input', 'input'), feat('Start Frame', 'frame'), feat('720p', 'resolution'), feat('10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.enhancePrompt(),
      ...params.duration([6, 10]),
      ...params.imageInput(1, 'Start Image', true),
    },
  },
  {
    ...base, id: 'hailuo-2.3-fast-pro', name: 'Hailuo 2.3 Fast Pro', modelId: 'hailuo-2.3-fast-pro',
    addedAt: '2026-02-06',
    inputType: 'i2v' as const,
    workflow: 'minimax/hailuo-2.3-fast/pro/image-to-video',
    buildPayload: buildI2V(false),
    estimatedTime: 162,
    description: 'Fast 1080p output for short, polished clips with varied styles.',
    features: [feat('Image Input', 'input'), feat('Start Frame', 'frame'), feat('1080p', 'resolution'), feat('6 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.enhancePrompt(),
      ...params.imageInput(1, 'Start Image', true),
    },
  },
  {
    ...base, id: 'minimax-h3', name: 'MiniMax H3', modelId: 'minimax-h3',
    addedAt: '2026-07-30',
    inputType: 't2v' as const,
    workflow: 'minimax/v2/video-generation',
    buildPayload: buildMinimaxH3,
    estimatedTime: 300,
    description: 'MiniMax H3 2K video from text, start/last frame, or image/video/audio references.',
    features: [
      feat('Start Frame', 'frame'), feat('End Frame', 'frame'),
      feat('Reference Video', 'input'), feat('2K', 'resolution'), feat('15 sec', 'duration'),
    ],
    paramConfig: {
      ...params.prompt(),
      ...params.startFrame(),
      ...params.endFrame(),
      ...params.imageInput(3, 'Reference Images', false),
      ...params.videoInputs(1, 'Reference Videos', false),
      ...params.audioInputs(1, 'Reference Audios', false),
      ...params.duration([5, 10, 15]),
      ...p.aspectRatio(['adaptive', '21:9', '16:9', '4:3', '1:1', '3:4', '9:16'], 'adaptive'),
    },
    constraints: minimaxH3Constraints,
  },
]);

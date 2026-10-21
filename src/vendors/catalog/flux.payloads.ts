/**
 * Flux payload builders.
 *
 * flux-3-video (`flux/v1/video`): renames SDK fields to the Flux3VideoCommand
 * wire shape. The vendor mode is derived on the backend from which input is
 * supplied (none → t2v, keyframes → i2v, startVideo → v2v).
 *
 * NOTE: `@picsart/workflows-types` (checked 1.1.95) still carries the *previous*
 * flux/v1/video shape (object `keyframes`, `grounding`, `480p`/`720p`) — the live
 * registry spec is ahead of it. Until the worker team republishes the type, the
 * builder return stays inferred; annotating it as
 * `WorkflowTypes['flux/v1/video']['params']` would type against the stale shape.
 * Follow-up: bump `@picsart/workflows-types` once republished and add the typed return.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerEditPayloads, registerPayloads } from '../define.ts';
import { MODELS } from './flux.ts';

type Flux3VideoInput = ModelInput<'flux-3-video'>;

const buildFlux3VideoPayload = (input: Flux3VideoInput) => {
  const duration = input.duration && input.duration !== 'auto'
    ? Number(input.duration)
    : 'auto';

  return {
    prompt: input.prompt,
    aspectRatio: input.aspectRatio ?? 'auto',
    resolution: input.resolution ?? 'hd',
    duration,
    generateAudio: input.generateAudio ?? true,
    safetyTolerance: input.safetyTolerance ?? 2,
    // keyframes (i2v): 1–10 images to animate.
    ...(input.imageUrls?.length ? { keyframes: input.imageUrls } : {}),
    // startVideo (v2v): continue from a clip's final frames.
    ...(input.videoUrl ? { startVideo: input.videoUrl } : {}),
    // draft: fast low-step preview.
    ...(input.draft ? { draft: input.draft } : {}),
  };
};

registerPayloads(MODELS, {
  'flux-3-video': buildFlux3VideoPayload,
});

// ── flux-3-max video (three fal endpoints, two SDK entries) ──────────────────
// The worker forwards the command straight to fal, so these emit fal's native
// snake_case fields. `flux-3-max/*` isn't in `@picsart/workflows-types` (1.1.170)
// yet — the worker branch is unmerged — so the returns stay inferred. Follow-up:
// bump the types package once published and annotate with
// `WorkflowTypes['flux-3-max/text-to-video' | 'flux-3-max/image-to-video' |
// 'flux-3-max/keyframes-to-video']['params']`.
type Flux3MaxInput = ModelInput<'flux-3-max'>;
type Flux3MaxKeyframesInput = ModelInput<'flux-3-max-keyframes'>;

// Shared tail — both entries expose the same settings via identical presets.
const flux3MaxShared = (
  i: Pick<Flux3MaxInput, 'aspectRatio' | 'resolution' | 'duration' | 'generateAudio' | 'reasoningLevel' | 'seed'>,
) => ({
  aspect_ratio: i.aspectRatio ?? '16:9',
  resolution: i.resolution ?? '720p',
  duration: Number(i.duration ?? 5),
  generate_audio: i.generateAudio ?? true,
  reasoning_level: i.reasoningLevel ?? 'high',
  // -1 is the "random seed" sentinel — omit so fal picks one.
  ...(i.seed != null && i.seed !== -1 ? { seed: i.seed } : {}),
});

// flux-3-max · text-to-video: no image input.
const buildFlux3MaxPayload = (i: Flux3MaxInput) => ({
  prompt: i.prompt,
  ...flux3MaxShared(i),
});

// flux-3-max · image-to-video (editWorkflow): a start frame is image_url, an
// optional end frame is end_image_url.
const buildFlux3MaxEditPayload = (i: Flux3MaxInput) => ({
  prompt: i.prompt,
  image_url: i.startFrame,
  ...(i.endFrame ? { end_image_url: i.endFrame } : {}),
  ...flux3MaxShared(i),
});

// flux-3-max-keyframes · keyframes-to-video: 1–10 images evenly spaced across
// the 0 … duration×24 (24 fps) timeline — first at 0, last at duration×24.
const buildFlux3MaxKeyframesPayload = (i: Flux3MaxKeyframesInput) => {
  const imgs = i.imageUrls ?? [];
  const last = Number(i.duration ?? 5) * 24;
  const keyframes = imgs.map((url, idx) => ({
    image_url: url,
    frame_index: imgs.length <= 1 ? 0 : Math.round((last * idx) / (imgs.length - 1)),
  }));
  return {
    prompt: i.prompt,
    keyframes,
    ...flux3MaxShared(i),
  };
};

registerPayloads(MODELS, {
  'flux-3-max': buildFlux3MaxPayload,
  'flux-3-max-keyframes': buildFlux3MaxKeyframesPayload,
});

registerEditPayloads(MODELS, {
  'flux-3-max': buildFlux3MaxEditPayload,
});

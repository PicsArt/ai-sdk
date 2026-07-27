/**
 * Flux payload builders.
 *
 * flux-3-video (`flux/v1/video`): assembles the keyframes / media inputs and
 * renames SDK fields to the Flux3VideoCommand wire shape.
 *
 * NOTE: `flux/v1/video` is not yet in `@picsart/workflows-types` (checked
 * 1.1.79) — the return type stays inferred. Once the worker team publishes it,
 * annotate the builder return as `WorkflowTypes['flux/v1/video']['params']` to
 * catch wire drift. Follow-up: bump `@picsart/workflows-types`.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './flux.ts';

type Flux3VideoInput = ModelInput<'flux-3-video'>;

const buildFlux3VideoPayload = (input: Flux3VideoInput) => {
  const duration = input.duration && input.duration !== 'auto'
    ? Number(input.duration)
    : 'auto';

  // keyframes: start pinned at frame 0 (i2v); end pinned at duration×24 (morph).
  // A two-image morph needs an explicit numeric duration — skip endFrame otherwise.
  const keyframes: Array<{ imageUrl: string; frameIndex: number }> = [];
  if (input.startFrame) keyframes.push({ imageUrl: input.startFrame, frameIndex: 0 });
  if (input.endFrame && typeof duration === 'number') {
    keyframes.push({ imageUrl: input.endFrame, frameIndex: duration * 24 });
  }

  return {
    prompt: input.prompt,
    model: input.model ?? 'flux-3-preview-high',
    aspectRatio: input.aspectRatio ?? 'auto',
    resolution: input.resolution ?? '720p',
    duration,
    generateAudio: input.generateAudio ?? true,
    grounding: input.grounding ?? true,
    ...(keyframes.length ? { keyframes } : {}),
    // referenceImages (ir2v) — reference images that define who/what appears.
    ...(input.imageUrls?.length ? { referenceImages: input.imageUrls } : {}),
    // startVideo (f2v) — continue from a clip's final frames.
    ...(input.videoUrl ? { startVideo: input.videoUrl } : {}),
    // referenceVideo (vr2v) — carry a clip's subjects into a brand-new video.
    ...(input.videoUrls?.length ? { referenceVideo: input.videoUrls[0] } : {}),
    // seed omitted when unset → vendor randomizes.
    ...(input.seed != null ? { seed: input.seed } : {}),
    ...(input.version ? { version: input.version } : {}),
  };
};

registerPayloads(MODELS, {
  'flux-3-video': buildFlux3VideoPayload,
});

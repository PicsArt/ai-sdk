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
import { registerPayloads } from '../define.ts';
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

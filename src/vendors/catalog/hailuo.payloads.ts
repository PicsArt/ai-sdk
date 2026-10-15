/**
 * Hailuo payload builders (Hailuo 02).
 *
 * Hailuo 02 is one task for both modes: the worker runs image-to-video when
 * `image_url` is present, text-to-video otherwise. The start frame
 * (`startFrame`, or `imageUrls[0]` for callers that send images that way)
 * goes out as `image_url`, the optional end frame as `end_image_url`;
 * resolution and duration pass through under their own names.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { ApiError } from '../../core/errors.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './hailuo.ts';

type Hailuo02Input = ModelInput<'hailuo-02'>;

// TODO: 'minimax/hailuo-02/video-generation' is not in @picsart/workflows-types
// yet (checked 1.1.170) — the return stays inferred; annotate it with
// WorkflowTypes['minimax/hailuo-02/video-generation']['params'] once published.
const buildHailuo02Payload = (input: Hailuo02Input) => {
  // `||`, not `??`: a cleared (empty) startFrame must fall back to imageUrls.
  const startFrame = input.startFrame || input.imageUrls?.[0];
  // The worker rejects end_image_url without image_url — fail fast here.
  if (input.endFrame && !startFrame) {
    throw new ApiError('Hailuo 02: an end frame requires a start frame.', { status: 400, code: 'validation_error' });
  }
  return {
    prompt: input.prompt,
    ...(input.enhancePrompt !== undefined ? { prompt_optimizer: input.enhancePrompt } : {}),
    ...(input.resolution ? { resolution: input.resolution } : {}),
    ...(input.duration ? { duration: input.duration } : {}),
    ...(startFrame ? { image_url: startFrame } : {}),
    ...(input.endFrame ? { end_image_url: input.endFrame } : {}),
  };
};

registerPayloads(MODELS, {
  'hailuo-02': buildHailuo02Payload,
});

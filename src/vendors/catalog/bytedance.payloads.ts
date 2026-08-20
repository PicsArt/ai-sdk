/**
 * ByteDance payload builders — video-enhance and OmniHuman.
 *
 * ## video-enhance
 *
 * Wraps the BytePlus MediaKit enhancement task (`bytedance/video-enhance`).
 * Three transforms are needed, so this can't be a pass-through:
 *   - `quality` → the backend's `tool_version` (which keeps the literal
 *     `professional`, not the `pro` used in the pricing key);
 *   - `bitrateLevel` → `bitrate_level`;
 *   - the `source` resolution sentinel and an inapplicable `scene` are dropped
 *     rather than sent.
 *
 * TODO: annotate the return as `WorkflowTypes['bytedance/video-enhance']['params']`
 * once the workflow ships in `@picsart/workflows-types` — it is absent as of
 * 1.1.89 because the worker MR adding the task is still open. Until then the
 * return stays inferred and drift against the backend `EnhanceVideoCommand`
 * is not compile-checked.
 */
import type { WorkflowTypes } from '@picsart/workflows-types';

import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './bytedance.ts';

type EnhanceInput = ModelInput<'bytedance-video-enhance'>;
type OmniHumanInput = ModelInput<'bytedance-omnihuman-v1.5'>;

/**
 * `seed` reached the workflow with the direct BytePlus Vision AI integration
 * (it replaced the fal.ai proxy), but `OmniHumanv15Input` still describes the
 * fal-era contract as of `@picsart/workflows-types` 1.1.111. Widen locally and
 * drop the intersection once the worker team republishes the types.
 */
type OmniHumanPayload = WorkflowTypes['bytedance/omnihuman/v1.5']['params'] & { seed?: number };

const DEFAULT_TOOL_VERSION = 'standard';

const buildBytedanceVideoEnhancePayload = (input: EnhanceInput) => {
  const toolVersion = input.quality ?? DEFAULT_TOOL_VERSION;

  return {
    video_url: input.videoUrl,
    tool_version: toolVersion,
    bitrate_level: input.bitrateLevel ?? 'medium',
    // Always sent: the backend resolves the billing tier before generating and
    // rejects the request (`billing_undetermined`) when the output frame rate is
    // unknown — it cannot read the source frame rate from file metadata.
    fps: input.fps ?? 30,
    // `source` is the SDK-only sentinel for "keep the source resolution"; the
    // backend expresses that by omitting the field. Sending an explicit tier
    // instead would silently rescale (and reprice) every request.
    ...(input.resolution && input.resolution !== 'source'
      ? { resolution: input.resolution }
      : {}),
    // The vendor ignores `scene` unless tool_version is standard, and the
    // backend validator rejects the combination outright.
    ...(input.scene && toolVersion === DEFAULT_TOOL_VERSION
      ? { scene: input.scene }
      : {}),
  };
};

/**
 * OmniHuman animates one portrait with one driving audio track. Three renames
 * plus two conditionals, so it can't be a pass-through:
 *   - `imageUrls[0]` → the single `image_url` the vendor takes;
 *   - `turboMode` → `turbo_mode` (sent only when enabled);
 *   - `seed` → dropped when it is the vendor's own `-1` ("pick a random seed"),
 *     so a default request stays byte-identical to one that omits the field.
 *
 * `mask_url` (which subject speaks in a multi-person image) is intentionally not
 * exposed: masks can only come from the vendor's subject-detection step, which
 * nothing in the stack calls yet, so there is no way for a caller to obtain one.
 */
const buildBytedanceOmniHumanPayload = (input: OmniHumanInput): OmniHumanPayload => ({
  image_url: input.imageUrls[0],
  audio_url: input.audioUrl,
  resolution: input.resolution ?? '1080p',
  ...(input.prompt ? { prompt: input.prompt } : {}),
  ...(input.turboMode ? { turbo_mode: true } : {}),
  ...(input.seed != null && input.seed !== -1 ? { seed: input.seed } : {}),
});

registerPayloads(MODELS, {
  'bytedance-video-enhance': buildBytedanceVideoEnhancePayload,
  'bytedance-omnihuman-v1.5': buildBytedanceOmniHumanPayload,
});

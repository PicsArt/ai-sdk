/**
 * ByteDance video-enhance payload builder.
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
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './bytedance.ts';

type EnhanceInput = ModelInput<'bytedance-video-enhance'>;

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

registerPayloads(MODELS, {
  'bytedance-video-enhance': buildBytedanceVideoEnhancePayload,
});

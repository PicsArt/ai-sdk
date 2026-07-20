import type { GenerationContext } from '../types.ts';
import type { DeepLinkPayloadV1 } from './types.ts';
import { getModel } from '../model-registry.ts';
import { extractDefaults } from '../descriptors/utils.ts';
import { encode } from './codec.ts';

/** Context keys that are handled as dedicated payload fields (not in `o`). */
const DEDICATED_KEYS = new Set([
  'prompt', 'negativePrompt', 'imageUrls', 'videoUrl', 'audioUrl',
  'startFrame', 'endFrame',
]);

/** Keys excluded from the `o` field (non-serializable or out of scope). */
const EXCLUDED_KEYS = new Set([
  'audioFile', 'mentionedPersonas', 'modelId',
  'exploreImageId', 'sourceImageId', 'sourceImageUrl',
  'multiPrompt', 'elementList', 'voiceList', 'dynamicMasks', 'staticMask',
  'callbackUrl', 'externalTaskId',
]);

/**
 * Serialize a model ID + context into a base64url-encoded payload string.
 * Only includes params that differ from the model's defaults.
 */
export function serializePayload(
  modelId: string,
  context: Partial<GenerationContext>,
): string {
  const payload: DeepLinkPayloadV1 = { v: 1, m: modelId };

  if (context.prompt) payload.p = context.prompt;
  if (context.negativePrompt) payload.np = context.negativePrompt;
  if (context.imageUrls?.length) payload.i = context.imageUrls;
  if (context.videoUrl) payload.vi = context.videoUrl;
  if (context.audioUrl) payload.au = context.audioUrl;
  if (context.startFrame) payload.sf = context.startFrame;
  if (context.endFrame) payload.ef = context.endFrame;

  // Compute non-default params for the `o` field
  const model = getModel(modelId);
  const defaults = model ? extractDefaults(model.paramConfig) : {};
  const overrides: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    if (DEDICATED_KEYS.has(key) || EXCLUDED_KEYS.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (key in defaults && defaults[key] === value) continue;
    overrides[key] = value;
  }

  if (Object.keys(overrides).length > 0) payload.o = overrides;

  return encode(payload);
}

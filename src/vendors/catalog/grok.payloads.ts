/**
 * Grok payload builders (new-style, `ModelInput`-typed).
 *
 * grok-imagine-image-2.0 (`x-ai/v1/images/generations` + `x-ai/v1/images/edits`):
 * renames SDK fields to the XAiImagesGenerationsCommand / XAiImagesEditsCommand
 * wire shapes. `quality` (low | medium) is generations-only — the edits command
 * has no quality field, and the edits command also dropped `aspect_ratio`, so
 * the edit builder sends neither.
 *
 * NOTE: `@picsart/workflows-types` (checked 1.1.110) still caps the x-ai image
 * `model` enum at `grok-imagine-image-quality` and has no `quality` field — the
 * live registry spec is ahead of it. Until the worker team republishes the
 * types, the builder returns stay inferred; annotating them as
 * `WorkflowTypes['x-ai/v1/images/generations']['params']` would type against
 * the stale shape. Follow-up: bump and add the typed returns once republished.
 *
 * The older Grok entries in `grok.ts` still use inline `GenerationContext`
 * builders — migrated separately, not here.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerEditPayloads, registerPayloads } from '../define.ts';
import { MODELS } from './grok.ts';

type GrokImage2Input = ModelInput<'grok-imagine-image-2.0'>;

/** Text-to-Image (x-ai/v1/images/generations). */
const buildGrokImage2Payload = (input: GrokImage2Input) => ({
  model: 'grok-imagine-image-2.0',
  prompt: input.prompt,
  n: input.count ?? 1,
  ...(input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}),
  ...(input.resolution ? { resolution: input.resolution } : {}),
  ...(input.quality ? { quality: input.quality } : {}),
});

/** Image edit (x-ai/v1/images/edits — single `image` or multi `images[]`). */
const buildGrokImage2EditPayload = (input: GrokImage2Input) => {
  const urls = input.imageUrls ?? [];
  const imagePart = urls.length > 1
    ? { images: urls.map((url) => ({ url })) }
    : urls.length === 1
      ? { image: { url: urls[0] } }
      : {};
  return {
    model: 'grok-imagine-image-2.0',
    prompt: input.prompt,
    n: input.count ?? 1,
    ...(input.resolution ? { resolution: input.resolution } : {}),
    ...imagePart,
  };
};

registerPayloads(MODELS, {
  'grok-imagine-image-2.0': buildGrokImage2Payload,
});

registerEditPayloads(MODELS, {
  'grok-imagine-image-2.0': buildGrokImage2EditPayload,
});

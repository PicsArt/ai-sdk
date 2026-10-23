/**
 * OpenAI payload builders.
 *
 * Only the GPT Image 2.5 entries live here. The older gpt-image models still
 * carry inline `GenerationContext` builders in `openai.ts`; migrating those is
 * a separate change.
 *
 * The two 2.5 tiers differ only in the `model` they pin — same workflow, same
 * paramConfig, same wire shape — so one factory serves both, per route.
 */
import type { WorkflowTypes } from '@picsart/workflows-types';
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerEditPayloads, registerPayloads } from '../define.ts';
import { GPT_IMAGE_25_SIZES, MODELS } from './openai.ts';

type GptImage25Model = 'gpt-image-2.5-flare' | 'gpt-image-2.5-sunburst';

/** Both tiers declare an identical paramConfig; the intersection is that shape. */
type GptImage25Input = ModelInput<'gpt-image-2.5-flare'> & ModelInput<'gpt-image-2.5-sunburst'>;

type GptImage25Payload = WorkflowTypes['openai-images-generate']['params'];

// The edit command is typed loosely upstream (`model: string`, `quality?: string`),
// so it takes the 2.5 values as-is.
type GptImage25EditPayload = WorkflowTypes['openai-image-editing']['params'];

/**
 * The wire `size`, in order of precedence: an exact `size` as given, which
 * overrides `aspectRatio` and `resolution`; `auto`, which
 * lets the model pick on t2i and mirrors the input's size on edits; otherwise
 * the ratio at the resolution tier (`1K` when unset), all on the 16px grid both
 * routes require. With no ratio the route's own default ratio applies.
 */
/** The size-bearing subset shared by the 2.5 and ImageGen 2.6 alpha inputs. */
type SizedImageInput = { size?: string; aspectRatio?: string; resolution?: string };

const resolveSize = (input: SizedImageInput, defaultAspectRatio: string): string => {
  if (input.size?.trim()) return input.size.trim();
  const aspectRatio = input.aspectRatio ?? defaultAspectRatio;
  if (aspectRatio === 'auto') return 'auto';
  return GPT_IMAGE_25_SIZES[input.resolution ?? '1K']?.[aspectRatio] ?? '1024x1024';
};

const generateFor = (model: GptImage25Model) =>
  (input: GptImage25Input): GptImage25Payload => ({
    prompt: input.prompt,
    model,
    n: input.count ?? 1,
    size: resolveSize(input, '1:1'),
    quality: input.quality ?? 'high',
    ...(input.background ? { background: input.background } : {}),
    ...(input.outputFormat ? { output_format: input.outputFormat } : {}),
  });

/** Edits default to `auto` — the endpoint then returns the source image's
 *  own dimensions instead of snapping it to a square. */
const editFor = (model: GptImage25Model) =>
  (input: GptImage25Input): GptImage25EditPayload => ({
    prompt: input.prompt,
    model,
    images: input.imageUrls ?? [],
    n: input.count ?? 1,
    size: resolveSize(input, 'auto'),
    quality: input.quality ?? 'high',
    ...(input.background ? { background: input.background } : {}),
    ...(input.outputFormat ? { output_format: input.outputFormat } : {}),
  });

registerPayloads(MODELS, {
  'gpt-image-2.5-flare': generateFor('gpt-image-2.5-flare'),
  'gpt-image-2.5-sunburst': generateFor('gpt-image-2.5-sunburst'),
});

registerEditPayloads(MODELS, {
  'gpt-image-2.5-flare': editFor('gpt-image-2.5-flare'),
  'gpt-image-2.5-sunburst': editFor('gpt-image-2.5-sunburst'),
});

// ── ImageGen 2.6 alpha ──────────────────────────────────────────────
// aurora-img-alpha (base) / star-swirl-alpha (smaller) share one paramConfig
// and wire shape, differing only in the pinned `model`, so one factory serves
// both per route. They reuse the 2.5 size handling (`resolveSize`) but swap
// `quality` for a `reasoning.effort` tier plus `temperature`; `quality` is
// withheld — these models ignore it and reject the xhigh/max tiers by id.
type ImageGen26AlphaModel = 'aurora-img-alpha' | 'star-swirl-alpha';

type ImageGen26AlphaInput = ModelInput<'aurora-img-alpha'> & ModelInput<'star-swirl-alpha'>;

type ReasoningEffort = NonNullable<ImageGen26AlphaInput['reasoningEffort']>;

// workflows-types@1.1.178 doesn't yet carry the ImageGen 2.6 alpha surface —
// the generate `model` enum stops at gpt-image-2.5-sunburst, and neither image
// command has `reasoning` / `temperature`. Widen locally until
// @picsart/workflows-types publishes it, then drop these in favour of the bare
// WorkflowTypes[...] shapes.
type ImageGen26AlphaGeneratePayload =
  Omit<WorkflowTypes['openai-images-generate']['params'], 'model' | 'quality'>
  & { model: ImageGen26AlphaModel; reasoning?: { effort?: ReasoningEffort }; temperature?: number };

type ImageGen26AlphaEditPayload =
  Omit<WorkflowTypes['openai-image-editing']['params'], 'model'>
  & { model: ImageGen26AlphaModel; reasoning?: { effort?: ReasoningEffort }; temperature?: number };

/** reasoning.effort and temperature, each omitted when the caller left it unset. */
const alphaPlanningControls = (input: ImageGen26AlphaInput) => ({
  ...(input.reasoningEffort ? { reasoning: { effort: input.reasoningEffort } } : {}),
  ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
});

const generateAlphaFor = (model: ImageGen26AlphaModel) =>
  (input: ImageGen26AlphaInput): ImageGen26AlphaGeneratePayload => ({
    prompt: input.prompt,
    model,
    n: input.count ?? 1,
    size: resolveSize(input, '1:1'),
    ...alphaPlanningControls(input),
    ...(input.background ? { background: input.background } : {}),
    ...(input.outputFormat ? { output_format: input.outputFormat } : {}),
  });

/** Edits default to `auto` — the endpoint then returns the source image's own
 *  dimensions instead of snapping it to a square. */
const editAlphaFor = (model: ImageGen26AlphaModel) =>
  (input: ImageGen26AlphaInput): ImageGen26AlphaEditPayload => ({
    prompt: input.prompt,
    model,
    images: input.imageUrls ?? [],
    n: input.count ?? 1,
    size: resolveSize(input, 'auto'),
    ...alphaPlanningControls(input),
    ...(input.background ? { background: input.background } : {}),
    ...(input.outputFormat ? { output_format: input.outputFormat } : {}),
  });

registerPayloads(MODELS, {
  'aurora-img-alpha': generateAlphaFor('aurora-img-alpha'),
  'star-swirl-alpha': generateAlphaFor('star-swirl-alpha'),
});

registerEditPayloads(MODELS, {
  'aurora-img-alpha': editAlphaFor('aurora-img-alpha'),
  'star-swirl-alpha': editAlphaFor('star-swirl-alpha'),
});

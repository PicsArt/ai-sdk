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
import { GPT_IMAGE_2_AR_TO_SIZE, MODELS } from './openai.ts';

type GptImage25Model = 'gpt-image-2.5-flare' | 'gpt-image-2.5-sunburst';

/** Both tiers declare an identical paramConfig; the intersection is that shape. */
type GptImage25Input = ModelInput<'gpt-image-2.5-flare'> & ModelInput<'gpt-image-2.5-sunburst'>;

type GptImage25Payload = WorkflowTypes['openai-images-generate']['params'];

// The edit command is typed loosely upstream (`model: string`, `quality?: string`),
// so it takes the 2.5 values as-is.
type GptImage25EditPayload = WorkflowTypes['openai-image-editing']['params'];

/** 'auto' lets the model pick on t2i and mirrors the input's size on edits;
 *  every other ratio maps onto the 16px grid both routes require. */
const resolveSize = (aspectRatio: string | undefined, fallback: string): string =>
  aspectRatio === 'auto' ? 'auto' : GPT_IMAGE_2_AR_TO_SIZE[aspectRatio ?? ''] ?? fallback;

const generateFor = (model: GptImage25Model) =>
  (input: GptImage25Input): GptImage25Payload => ({
    prompt: input.prompt,
    model,
    n: input.count ?? 1,
    size: resolveSize(input.aspectRatio, '1024x1024'),
    quality: input.quality ?? 'high',
    ...(input.background ? { background: input.background } : {}),
    ...(input.outputFormat ? { output_format: input.outputFormat } : {}),
  });

/** Edits default to `size: 'auto'` — the endpoint then returns the source
 *  image's own dimensions instead of snapping it to a square. */
const editFor = (model: GptImage25Model) =>
  (input: GptImage25Input): GptImage25EditPayload => ({
    prompt: input.prompt,
    model,
    images: input.imageUrls ?? [],
    n: input.count ?? 1,
    size: resolveSize(input.aspectRatio, 'auto'),
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

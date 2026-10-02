/**
 * Ideogram 4.5 payload builders.
 *
 * `ideogram/v4.5/generate` serves both text-to-image and editing: without
 * images it generates from the prompt, with images it edits `images[0]` using
 * the rest as references. `ideogram/v4.5/precise-edit` takes a single source
 * `image` plus optional `reference_images`.
 *
 * TODO: annotate the returns with WorkflowTypes['ideogram/v4.5/generate'] /
 * ['ideogram/v4.5/precise-edit']['params'] once @picsart/workflows-types
 * publishes the v4.5 tasks (absent as of 1.1.152). Until then they are inferred.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { ApiError } from '../../core/errors.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './ideogram.ts';

type Ideogram45Input = ModelInput<'ideogram-4-5'>;
type Ideogram45PreciseEditInput = ModelInput<'ideogram-4-5-precise-edit'>;

/** With a mask the vendor allows 4 images on generate (source + 3 references). */
const GENERATE_MAX_IMAGES_WITH_MASK = 4;
/** With a mask the vendor allows 3 references on precise edit (the source is separate). */
const PRECISE_EDIT_MAX_REFERENCES_WITH_MASK = 3;

/**
 * The mask takes one of the vendor's image slots, so a masked request has a
 * lower image cap than paramConfig's `array.max` (which constraints cannot
 * narrow). Reject it in the client rather than spending a request on a 400,
 * and never drop images silently.
 */
function assertMaskedImageLimit(model: string, count: number, max: number, what: string): void {
  if (count > max) throw invalid(`${model}: with a mask, use at most ${max} ${what} (got ${count}).`);
}

function invalid(message: string): ApiError {
  return new ApiError(message, { status: 400, code: 'validation_error' });
}

/**
 * Aspect ratio + resolution go to the worker, which converts them to the
 * vendor's exact size. A masked edit takes neither (the output keeps the source
 * size), `source` only applies with images, and the tier only applies to an
 * explicit ratio.
 */
function ideogram45Shape(input: Ideogram45Input, hasImages: boolean, hasMask: boolean) {
  const aspectRatio = input.aspectRatio;
  if (!aspectRatio || hasMask) return {};
  if (aspectRatio === 'source' && !hasImages) return {};
  if (aspectRatio === 'auto' || aspectRatio === 'source') return { aspect_ratio: aspectRatio };
  return { aspect_ratio: aspectRatio, ...(input.resolution ? { resolution: input.resolution } : {}) };
}

const buildIdeogram45Payload = (input: Ideogram45Input) => {
  const images = input.imageUrls?.length ? input.imageUrls : undefined;
  // A mask only applies to a source image.
  const mask = images && input.mask ? input.mask : undefined;
  if (mask) assertMaskedImageLimit('Ideogram 4.5', images!.length, GENERATE_MAX_IMAGES_WITH_MASK, 'images');
  // Also declared as a constraint, but constraints only drive the UI.
  if (input.quality === 'very_low' && !images) throw invalid('Ideogram 4.5: very_low quality needs a source image.');

  return {
    prompt: input.prompt,
    ...(images ? { images } : {}),
    ...(mask ? { mask } : {}),
    ...ideogram45Shape(input, !!images, !!mask),
    ...(input.magicPrompt ? { magic_prompt: input.magicPrompt } : {}),
    // Vendor default: medium with source images, high without.
    quality: input.quality ?? (images ? 'medium' : 'high'),
    num_images: input.count ?? 1,
    ...(input.seed != null ? { seed: input.seed } : {}),
    ...(input.enableCopyrightDetection ? { enable_copyright_detection: true } : {}),
  };
};

/** `startFrame` is the (required) source image; `imageUrls` are only references. */
const buildIdeogram45PreciseEditPayload = (input: Ideogram45PreciseEditInput) => {
  if (input.mask) {
    assertMaskedImageLimit(
      'Ideogram 4.5 Precise Edit', input.imageUrls?.length ?? 0, PRECISE_EDIT_MAX_REFERENCES_WITH_MASK, 'reference images',
    );
  }

  return {
    image: input.startFrame,
    prompt: input.prompt,
    ...(input.mask ? { mask: input.mask } : {}),
    ...(input.imageUrls?.length ? { reference_images: input.imageUrls } : {}),
    quality: input.quality ?? 'medium',
    num_images: input.count ?? 1,
    ...(input.seed != null ? { seed: input.seed } : {}),
    ...(input.enableCopyrightDetection ? { enable_copyright_detection: true } : {}),
  };
};

registerPayloads(MODELS, {
  'ideogram-4-5': buildIdeogram45Payload,
  'ideogram-4-5-precise-edit': buildIdeogram45PreciseEditPayload,
});

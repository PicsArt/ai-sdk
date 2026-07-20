/**
 * PixVerse payload builders.
 *
 * One builder per (version × operation). The wire `model` (v6 / c1) is baked in
 * per entry. Inputs are typed against the generated `ModelInput<'<id>'>` so the
 * builders stay in sync with the catalog `paramConfig` at compile time.
 *
 * v6/c1 both support inline audio, so `generate_audio_switch` is forwarded
 * whenever set — no per-version gating is needed.
 *
 * NOTE: outputs aren't checked against `WorkflowTypes['pixverse/v2/...']` because
 * the PixVerse workflows aren't yet in `@picsart/workflows-types` (published
 * separately). Switch return types to `WorkflowTypes[...]['params']` once they land.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './pixverse.ts';

type TextToVideoInput = ModelInput<'pixverse-v6'>;
type ImageToVideoInput = ModelInput<'pixverse-v6-image'>;
type FusionInput = ModelInput<'pixverse-v6-fusion'>;

type PixverseModel = 'v6' | 'c1';

/** Fields common to every PixVerse workflow body. */
const commonFields = (
  input: { prompt: string; quality?: string; duration?: number; generateAudio?: boolean },
  model: PixverseModel,
) => ({
  prompt: input.prompt,
  model,
  quality: input.quality ?? '540p',
  duration: input.duration ?? 5,
  ...(input.generateAudio != null ? { generate_audio_switch: input.generateAudio } : {}),
});

/** Text-to-video: includes aspect_ratio. */
const buildTextToVideoPayload = (model: PixverseModel) => (input: TextToVideoInput) => ({
  ...commonFields(input, model),
  aspect_ratio: input.aspectRatio ?? '16:9',
});

/** Image-to-video: single source image (first frame). No aspect_ratio (derived from image).
 *  The shared router also treats `startFrame` as an image input, so read it as a fallback. */
const buildImageToVideoPayload = (model: PixverseModel) => (input: ImageToVideoInput & { startFrame?: string }) => ({
  ...commonFields(input, model),
  image_url: input.startFrame ?? input.imageUrls?.[0],
});

/** Reference-to-video (fusion): 1-7 reference images fused into a new scene. */
const buildReferenceToVideoPayload = (model: PixverseModel) => (input: FusionInput) => ({
  ...commonFields(input, model),
  aspect_ratio: input.aspectRatio ?? '16:9',
  image_references: (input.imageUrls ?? []).map((url) => ({ url })),
});

registerPayloads(MODELS, {
  'pixverse-v6': buildTextToVideoPayload('v6'),
  'pixverse-v6-image': buildImageToVideoPayload('v6'),
  'pixverse-v6-fusion': buildReferenceToVideoPayload('v6'),
  'pixverse-c1': buildTextToVideoPayload('c1'),
  'pixverse-c1-image': buildImageToVideoPayload('c1'),
  'pixverse-c1-fusion': buildReferenceToVideoPayload('c1'),
});

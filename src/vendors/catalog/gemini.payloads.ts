/**
 * Gemini Omni 1.1 Flash (Preview) payload builder.
 *
 * Assembles the nested image/video objects of the `gemini-omni/video` worker
 * from flat SDK fields and pins `model: 'gemini-omni-1.1-flash-preview'`.
 * The worker derives the video task (text_to_video / image_to_video / extend /
 * reference_to_video) from which inputs are present, so the Command's optional
 * `task` field is never sent — an explicit task would override that derivation.
 *
 * TODO: annotate the return with WorkflowTypes['gemini-omni/video']['params']
 * once @picsart/workflows-types publishes the 1.1 additions (lastFrame,
 * referenceImages, referenceVideos, resolution — absent as of 1.1.119).
 * Until then the return is inferred.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './gemini.ts';

type OmniFlash11Input = ModelInput<'gemini-omni-1.1-flash-preview'>;

function inferMimeType(url: string): 'image/png' | 'image/jpeg' {
  return url.match(/\.png(\?|$)/i) ? 'image/png' : 'image/jpeg';
}

const toImage = (url: string) => ({ url, mimeType: inferMimeType(url) });

const buildOmniFlash11Payload = (input: OmniFlash11Input) => ({
  prompt: input.prompt,
  model: 'gemini-omni-1.1-flash-preview',
  // Materialize the catalog defaults so direct SDK calls send the advertised
  // values rather than relying on the worker/vendor defaults.
  aspectRatio: input.aspectRatio ?? '16:9',
  durationSeconds: input.duration ?? 8,
  resolution: input.resolution ?? '720p',
  ...(input.startFrame ? { image: toImage(input.startFrame) } : {}),
  ...(input.endFrame ? { lastFrame: toImage(input.endFrame) } : {}),
  ...(input.imageUrls?.length
    ? { referenceImages: input.imageUrls.map(toImage) }
    : {}),
  ...(input.videoUrl ? { video: { url: input.videoUrl } } : {}),
  ...(input.videoUrls?.length
    ? { referenceVideos: input.videoUrls.map((url) => ({ url })) }
    : {}),
});

registerPayloads(MODELS, {
  'gemini-omni-1.1-flash-preview': buildOmniFlash11Payload,
});

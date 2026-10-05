/**
 * HeyGen Video payload builder.
 *
 * One builder covers every mode the model offers — the fields the caller
 * filled decide which one runs, and the backend resolves `mode` from them
 * (image → image_to_video, any reference → reference_to_video, a bare
 * prompt → text_to_video), so `mode` itself never goes on the wire. Media
 * travels as MediaReference objects (`{ type: 'url', url }`); the builder
 * wraps the SDK's flat URL fields into them. `aspect_ratio` goes out only
 * without a first frame — image_to_video always follows that image and
 * refuses the field.
 *
 * The avatar entries (heygen-talking-photo, heygen-video-avatar) keep their
 * legacy inline builders in heygen.ts.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './heygen.ts';

type HeygenVideo1Input = ModelInput<'heygen-video-1'>;

const asMediaRef = (url: string) => ({ type: 'url' as const, url });

const buildHeygenVideo1Payload = (input: HeygenVideo1Input) => {
  const hasFrame = !!input.startFrame;
  const hasReferences = !!(input.imageUrls?.length || input.videoUrls?.length || input.audioUrls?.length);
  return {
    model: 'heygen-video-1',
    prompt: input.prompt,
    duration: input.duration ?? 5,
    resolution: input.resolution ?? '768p',
    prompt_enhancement: input.promptEnhancement ?? 'turbo',
    // With references the default is 'adaptive' (follow the first one); from
    // the prompt alone it is 16:9.
    ...(hasFrame ? {} : { aspect_ratio: input.aspectRatio ?? (hasReferences ? 'adaptive' : '16:9') }),
    ...(input.startFrame ? { image: asMediaRef(input.startFrame) } : {}),
    ...(input.imageUrls?.length ? { reference_images: input.imageUrls.map(asMediaRef) } : {}),
    ...(input.videoUrls?.length ? { reference_videos: input.videoUrls.map(asMediaRef) } : {}),
    ...(input.audioUrls?.length ? { reference_audio: input.audioUrls.map(asMediaRef) } : {}),
    ...(input.seed != null ? { seed: input.seed } : {}),
  };
};

registerPayloads(MODELS, {
  'heygen-video-1': buildHeygenVideo1Payload,
});

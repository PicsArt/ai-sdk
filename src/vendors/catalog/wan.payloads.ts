/**
 * Wan 3.0 payload builder.
 *
 * Assembles the all-in-one `media[]` discriminated array from the SDK's flat
 * asset keys and renames fields to the backend WanV3VideoCommand wire shape.
 *
 * NOTE: `wan/v3/video` is not yet published in @picsart/workflows-types
 * (installed 1.1.89) — the return is left inferred. Once the worker team ships
 * the type, annotate as `WorkflowTypes['wan/v3/video']['params']` to catch drift.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './wan.ts';

type WanV3Input = ModelInput<'wan-3.0-video'>;

type WanV3MediaItem = {
  type:
    | 'reference_image'
    | 'reference_video'
    | 'reference_audio'
    | 'first_frame'
    | 'last_frame';
  url: string;
};

const buildWanV3VideoPayload = (input: WanV3Input) => {
  // Frame mode (first/last) and reference mode (image/video/audio) are mutually
  // exclusive per request — the backend validates; the builder just forwards
  // whatever slots the caller populated.
  const media: WanV3MediaItem[] = [];
  if (input.startFrame) media.push({ type: 'first_frame', url: input.startFrame });
  if (input.endFrame) media.push({ type: 'last_frame', url: input.endFrame });
  if (input.imageUrls?.length) {
    for (const url of input.imageUrls) media.push({ type: 'reference_image', url });
  }
  if (input.videoUrls?.length) {
    for (const url of input.videoUrls) media.push({ type: 'reference_video', url });
  }
  if (input.audioUrls?.length) {
    for (const url of input.audioUrls) media.push({ type: 'reference_audio', url });
  }

  return {
    model: 'wan3.0-video',
    resolution: input.resolution ?? '1080P',
    ratio: input.aspectRatio ?? '16:9',
    duration: input.duration ?? 5,
    audio: input.generateAudio ?? true,
    enable_thinking: input.enableThinking ?? false,
    watermark: input.watermark ?? false,
    ...(input.prompt ? { prompt: input.prompt } : {}),
    ...(media.length ? { media } : {}),
    ...(input.seed != null ? { seed: input.seed } : {}),
  };
};

registerPayloads(MODELS, {
  'wan-3.0-video': buildWanV3VideoPayload,
});

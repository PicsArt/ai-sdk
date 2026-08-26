/**
 * Wan 3.0 payload builders.
 *
 * Assembles the all-in-one `media[]` discriminated array from the SDK's flat
 * asset keys and renames fields to the backend WanV3VideoCommand wire shape.
 * wan-3.0-video and wan-3.0-video-prime share the builder — the hardcoded
 * `model` wire value is the only difference.
 */
import type { WorkflowTypes } from '@picsart/workflows-types';
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './wan.ts';

// ModelInput<'wan-3.0-video-prime'> is structurally identical (shared paramConfig).
type WanV3Input = ModelInput<'wan-3.0-video'>;

type WanV3Model = 'wan3.0-video' | 'wan3.0-video-prime';

// @picsart/workflows-types 1.1.118 still types `model` as the single literal
// 'wan3.0-video'; the live schema also accepts 'wan3.0-video-prime'. Widen
// locally — drop once upstream catches up.
type WanV3Payload = Omit<WorkflowTypes['wan/v3/video']['params'], 'model'> & {
  model?: WanV3Model;
};

type WanV3MediaItem = {
  type:
    | 'reference_image'
    | 'reference_video'
    | 'reference_audio'
    | 'first_frame'
    | 'last_frame';
  url: string;
};

const makeWanV3VideoPayload = (model: WanV3Model) => (input: WanV3Input): WanV3Payload => {
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
    model,
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
  'wan-3.0-video': makeWanV3VideoPayload('wan3.0-video'),
  'wan-3.0-video-prime': makeWanV3VideoPayload('wan3.0-video-prime'),
});

/**
 * Depth Anything payload builder. Input typed against
 * `ModelInput<'depth-anything-video'>`, return checked against the backend
 * workflow params via `WorkflowTypes`.
 */
import type { WorkflowTypes } from '@picsart/workflows-types';
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './depth-anything.ts';

type DepthAnythingVideoInput = ModelInput<'depth-anything-video'>;
type DepthAnythingVideoPayload = WorkflowTypes['depth-anything-video']['params'];

const buildDepthAnythingVideoPayload = (input: DepthAnythingVideoInput): DepthAnythingVideoPayload => ({
  video_url: input.videoUrl,
  model: input.model ?? 'VDA-Large',
  colormap: input.colormap ?? 'grayscale',
  resolution: input.resolution ?? 'auto',
  side_by_side: input.sideBySide ?? false,
  // The .npz export is a second, non-media output the SDK has no slot for.
  include_raw_depths: false,
});

registerPayloads(MODELS, {
  'depth-anything-video': buildDepthAnythingVideoPayload,
});

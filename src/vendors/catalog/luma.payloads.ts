/**
 * Luma Ray 3.2 payload builders (early access).
 *
 * Transforms SDK param values into the Ray 3.2 workflow wire format. These
 * workflows nest output knobs under `video: {...}`; the model is pinned by the
 * workflow name (no `model` field). Duration is a string with an 's' suffix.
 *
 * TODO: annotate returns with WorkflowTypes['luma-ray32-video' | ...]['params']
 * once @picsart/workflows-types publishes the Ray 3.2 workflows (absent as of
 * 1.1.15). Until then the returns are inferred.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './luma.ts';

type Ray32VideoInput = ModelInput<'luma-ray-3.2'>;
type Ray32EditInput = ModelInput<'luma-ray-3.2-edit'>;
type Ray32ReframeInput = ModelInput<'luma-ray-3.2-reframe-video'>;

/** luma-ray32-video — t2v + i2v (start/end frame) + extend.
 *  hdr/exr_export drive the pricing tier (standard | hdr | hdr-exr);
 *  EXR requires HDR, so requesting EXR also forces hdr=true. */
const buildRay32VideoPayload = (input: Ray32VideoInput) => {
  const video: Record<string, unknown> = {
    resolution: input.resolution ?? '720p',
    duration: `${input.duration ?? 5}s`,
  };
  // EXR requires HDR — requesting EXR implies HDR rather than silently dropping it.
  if (input.hdr || input.exrExport) video.hdr = true;
  if (input.exrExport) video.exr_export = true;
  if (input.loop) video.loop = true;
  if (input.startFrame) video.start_frame = { url: input.startFrame };
  if (input.endFrame) video.end_frame = { url: input.endFrame };
  return {
    prompt: input.prompt,
    // Materialize the catalog default so direct SDK calls (no aspectRatio) still
    // send the advertised default rather than relying on the model to pick.
    aspect_ratio: input.aspectRatio ?? '16:9',
    video,
  };
};

/** luma-ray32-video-edit — v2v edit from a source video.
 *  `edit` is required; auto_controls=true is the recommended conditioning.
 *  hdr/exr_export drive the pricing tier (same as the main video workflow). */
const buildRay32EditPayload = (input: Ray32EditInput) => {
  const video: Record<string, unknown> = {
    resolution: input.resolution ?? '720p',
    duration: `${input.duration ?? 5}s`,
    edit: {
      auto_controls: true,
      // Materialize the catalog default (flex_2) for direct SDK calls.
      strength: input.editStrength ?? 'flex_2',
    },
  };
  // EXR requires HDR — requesting EXR implies HDR rather than silently dropping it.
  if (input.hdr || input.exrExport) video.hdr = true;
  if (input.exrExport) video.exr_export = true;
  return {
    prompt: input.prompt,
    source: { url: input.videoUrl },
    video,
  };
};

/** luma-ray32-video-reframe — reframe a source video to a new aspect ratio. */
const buildRay32ReframePayload = (input: Ray32ReframeInput) => ({
  prompt: input.prompt,
  aspect_ratio: input.aspectRatio ?? '16:9',
  source: { url: input.videoUrl },
  video: {
    resolution: input.resolution ?? '720p',
  },
});

registerPayloads(MODELS, {
  'luma-ray-3.2': buildRay32VideoPayload,
  'luma-ray-3.2-edit': buildRay32EditPayload,
  'luma-ray-3.2-reframe-video': buildRay32ReframePayload,
});

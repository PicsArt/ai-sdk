/**
 * LTX payload builders for the entries written on the current convention:
 * 2.5 Pro and Fast (each covering both routes of its combined entry —
 * `workflow` = text-to-video, `editWorkflow` = image-to-video) and the 2.3
 * Reframe and Outpaint video-to-video pair.
 *
 * The older 2.0 and 2.3 entries in `ltx.ts` still carry inline builders on
 * `GenerationContext`; everything here is typed by `ModelInput<'<id>'>` and
 * registered from this side, so `ltx.ts` keeps no import back into this
 * module.
 *
 * Pro and Fast differ only in the literal unions their wires accept (Pro caps
 * at 1080p / 10s, Fast reaches 2160p / 20s), so the four builders are
 * deliberately spelled out rather than shared through a widened helper — the
 * per-workflow return annotation is what catches upstream drift.
 */
import type { WorkflowTypes } from '@picsart/workflows-types';
import type { ModelInput } from '../../generated/model-input-types.ts';
import { ApiError } from '../../core/errors.ts';
import { registerEditPayloads, registerPayloads } from '../define.ts';
import { MODELS } from './ltx.ts';

type Ltx25ProInput = ModelInput<'ltx-v2.5-pro'>;
type Ltx25FastInput = ModelInput<'ltx-v2.5-fast'>;

type Ltx25ProT2VPayload = WorkflowTypes['lightricks/ltx-2.5/text-to-video/pro']['params'];
type Ltx25ProI2VPayload = WorkflowTypes['lightricks/ltx-2.5/image-to-video/pro']['params'];
type Ltx25FastT2VPayload = WorkflowTypes['lightricks/ltx-2.5/text-to-video/fast']['params'];
type Ltx25FastI2VPayload = WorkflowTypes['lightricks/ltx-2.5/image-to-video/fast']['params'];

/** The image route needs a first frame. `endFrame` alone also routes here (see
 *  `resolvePayloadBuild`), so reject that in the client rather than spending a
 *  request on a vendor 400. */
function requireStartFrame(input: { startFrame?: string }): string {
  if (!input.startFrame) {
    throw new ApiError('LTX 2.5: an end frame requires a start image.', {
      status: 400, code: 'validation_error',
    });
  }
  return input.startFrame;
}

// ── Pro ──────────────────────────────────────────────────────────────

const buildLtx25ProT2VPayload = (input: Ltx25ProInput): Ltx25ProT2VPayload => ({
  prompt: input.prompt,
  ...(input.duration != null ? { duration: input.duration } : {}),
  ...(input.resolution ? { resolution: input.resolution } : {}),
  ...(input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}),
  ...(input.fps != null ? { fps: input.fps } : {}),
  // `none` is the paramConfig sentinel for "leave the camera alone": the wire
  // has no such value and omitting the field is the vendor's default. Spelled
  // out per builder rather than shared, so the check narrows the literal union
  // instead of widening it to `string`. (`static` is a real, locked-off camera.)
  ...(input.cameraMotion && input.cameraMotion !== 'none' ? { camera_motion: input.cameraMotion } : {}),
  generate_audio: input.generateAudio ?? true,
});

const buildLtx25ProI2VPayload = (input: Ltx25ProInput): Ltx25ProI2VPayload => ({
  prompt: input.prompt,
  image_url: requireStartFrame(input),
  ...(input.endFrame ? { end_image_url: input.endFrame } : {}),
  ...(input.duration != null ? { duration: input.duration } : {}),
  ...(input.resolution ? { resolution: input.resolution } : {}),
  ...(input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}),
  ...(input.fps != null ? { fps: input.fps } : {}),
  // `none` is the paramConfig sentinel for "leave the camera alone": the wire
  // has no such value and omitting the field is the vendor's default. Spelled
  // out per builder rather than shared, so the check narrows the literal union
  // instead of widening it to `string`. (`static` is a real, locked-off camera.)
  ...(input.cameraMotion && input.cameraMotion !== 'none' ? { camera_motion: input.cameraMotion } : {}),
  generate_audio: input.generateAudio ?? true,
});

// ── Fast ─────────────────────────────────────────────────────────────

const buildLtx25FastT2VPayload = (input: Ltx25FastInput): Ltx25FastT2VPayload => ({
  prompt: input.prompt,
  ...(input.duration != null ? { duration: input.duration } : {}),
  ...(input.resolution ? { resolution: input.resolution } : {}),
  ...(input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}),
  ...(input.fps != null ? { fps: input.fps } : {}),
  // `none` is the paramConfig sentinel for "leave the camera alone": the wire
  // has no such value and omitting the field is the vendor's default. Spelled
  // out per builder rather than shared, so the check narrows the literal union
  // instead of widening it to `string`. (`static` is a real, locked-off camera.)
  ...(input.cameraMotion && input.cameraMotion !== 'none' ? { camera_motion: input.cameraMotion } : {}),
  generate_audio: input.generateAudio ?? true,
});

const buildLtx25FastI2VPayload = (input: Ltx25FastInput): Ltx25FastI2VPayload => ({
  prompt: input.prompt,
  image_url: requireStartFrame(input),
  ...(input.endFrame ? { end_image_url: input.endFrame } : {}),
  ...(input.duration != null ? { duration: input.duration } : {}),
  ...(input.resolution ? { resolution: input.resolution } : {}),
  ...(input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}),
  ...(input.fps != null ? { fps: input.fps } : {}),
  // `none` is the paramConfig sentinel for "leave the camera alone": the wire
  // has no such value and omitting the field is the vendor's default. Spelled
  // out per builder rather than shared, so the check narrows the literal union
  // instead of widening it to `string`. (`static` is a real, locked-off camera.)
  ...(input.cameraMotion && input.cameraMotion !== 'none' ? { camera_motion: input.cameraMotion } : {}),
  generate_audio: input.generateAudio ?? true,
});

// ── 2.3 Reframe / Outpaint ───────────────────────────────────────────
// Both workflows landed in the worker after `@picsart/workflows-types@1.1.148`,
// so there is no `WorkflowTypes[...]` entry to annotate the returns with yet and
// the wire shapes below are inferred. Bump the dependency and add
// `WorkflowTypes['ltx-2.3/reframe']['params']` and
// `WorkflowTypes['ltx-2.3-quality/outpaint']['params']` once republished.

type Ltx23ReframeInput = ModelInput<'ltx-v2.3-reframe'>;

/** Reframe takes no prompt: it re-crops the source to a new ratio and generates
 *  only the newly exposed edges. */
const buildLtx23ReframePayload = (input: Ltx23ReframeInput) => ({
  video_url: input.videoUrl,
  ...(input.resolution ? { resolution: input.resolution } : {}),
  ...(input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}),
});

type Ltx23OutpaintInput = ModelInput<'ltx-v2.3-outpaint'>;

/** The wire counts frames (num_frames, bounded 9–481 at the vendor). */
const OUTPAINT_NUM_FRAMES_MIN = 9;
const OUTPAINT_NUM_FRAMES_MAX = 481;

/** Outpaint keeps the source inside a wider canvas and generates the surround.
 *  The unified `resolution` names the canvas tier, which the wire calls
 *  `output_resolution` — the wire's own `resolution` field is a superseded
 *  exact-canvas escape hatch and is deliberately not offered. Nor is
 *  `sync_mode`: it returns the media as an inline data URI, which would bypass
 *  the worker's CDN copy.
 *
 *  The wire takes a frame count, not a duration: `num_frames` is derived from
 *  the user-facing duration and fps (num_frames = duration × fps), then clamped
 *  to the vendor's window. fps falls back to the param default (24) so the count
 *  still resolves when only a duration is given.
 *
 *  The clamp is load-bearing, not belt-and-suspenders — keep it. The per-fps
 *  duration constraints in `ltx.ts` fence both ends of the 9–481 frame window,
 *  but only in the UI: `allowed` is never enforced by `validate()`, so a
 *  programmatic caller can still pass a duration × fps that lands outside it.
 *  This clamp is the only guarantee the vendor's frame bounds actually hold. */
const buildLtx23OutpaintPayload = (input: Ltx23OutpaintInput) => {
  const fps = input.fps ?? 24;
  const numFrames = input.duration != null
    ? Math.min(
        OUTPAINT_NUM_FRAMES_MAX,
        Math.max(OUTPAINT_NUM_FRAMES_MIN, Math.round(input.duration * fps)),
      )
    : undefined;
  return {
    prompt: input.prompt,
    video_url: input.videoUrl,
    ...(input.negativePrompt ? { negative_prompt: input.negativePrompt } : {}),
    ...(input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}),
    ...(input.resolution ? { output_resolution: input.resolution } : {}),
    ...(numFrames != null ? { num_frames: numFrames } : {}),
    ...(input.fps != null ? { frames_per_second: input.fps } : {}),
    ...(input.sourceScale != null ? { source_scale: input.sourceScale } : {}),
    ...(input.videoStrength != null ? { video_strength: input.videoStrength } : {}),
    ...(input.cfgScale != null ? { guidance_scale: input.cfgScale } : {}),
    ...(input.numInferenceSteps != null ? { num_inference_steps: input.numInferenceSteps } : {}),
    ...(input.videoQuality ? { video_quality: input.videoQuality } : {}),
    ...(input.videoWriteMode ? { video_write_mode: input.videoWriteMode } : {}),
    ...(input.seed != null ? { seed: input.seed } : {}),
    enable_prompt_expansion: input.enhancePrompt ?? true,
    generate_audio: input.generateAudio ?? true,
    enable_safety_checker: input.enableSafetyChecker ?? true,
  };
};

registerPayloads(MODELS, {
  'ltx-v2.5-pro': buildLtx25ProT2VPayload,
  'ltx-v2.5-fast': buildLtx25FastT2VPayload,
  'ltx-v2.3-reframe': buildLtx23ReframePayload,
  'ltx-v2.3-outpaint': buildLtx23OutpaintPayload,
});

// Edit slot — the image route of each combined entry.
registerEditPayloads(MODELS, {
  'ltx-v2.5-pro': buildLtx25ProI2VPayload,
  'ltx-v2.5-fast': buildLtx25FastI2VPayload,
});

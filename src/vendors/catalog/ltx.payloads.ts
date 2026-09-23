/**
 * LTX 2.5 payload builders — Pro and Fast, each covering both routes of its
 * combined entry (`workflow` = text-to-video, `editWorkflow` = image-to-video).
 *
 * The 2.0 and 2.3 entries in `ltx.ts` still carry inline builders on
 * `GenerationContext`; only 2.5 lives here, on the current convention —
 * typed by `ModelInput<'<id>'>` and registered from this side so `ltx.ts`
 * keeps no import back into this module.
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

registerPayloads(MODELS, {
  'ltx-v2.5-pro': buildLtx25ProT2VPayload,
  'ltx-v2.5-fast': buildLtx25FastT2VPayload,
});

// Edit slot — the image route of each combined entry.
registerEditPayloads(MODELS, {
  'ltx-v2.5-pro': buildLtx25ProI2VPayload,
  'ltx-v2.5-fast': buildLtx25FastI2VPayload,
});

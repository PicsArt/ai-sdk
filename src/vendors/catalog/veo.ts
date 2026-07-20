/**
 * VEO — single source of truth.
 *
 * Google API ref: https://ai.google.dev/gemini-api/docs/video#reference-images
 *  - reference images: up to 3 (referenceType: 'asset'), requires duration === 8.
 *  - reference images live in `ctx.imageUrls` (unified slot); start/end frame
 *    in `ctx.startFrame` / `ctx.endFrame` (named asset slots, mutually
 *    exclusive with reference images per Google API).
 */
import type { Constraint, PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

// ── Payload builders ────────────────────────────────────────────────

function inferMimeType(url: string): string {
  return url.match(/\.png(\?|$)/i) ? 'image/png' : 'image/jpeg';
}

/**
 * Unified payload builder for all Veo variants.
 *  - `withAudio` controls whether `parameters.generateAudio` is sent
 *    (Veo / Veo Fast expose the toggle; Veo Lite has audio always-on at the API and
 *    omits the field, matching prior behavior)
 */
export const buildVeoPayload =
  (modelId: string, opts: { withAudio?: boolean } = {}): PayloadBuilder =>
  (ctx) => {
    const refImages = ctx.imageUrls ?? [];
    return {
      model: modelId,
      prompt: ctx.prompt,
      count: 1,
      ...(ctx.videoUrl
        ? { video: { url: ctx.videoUrl, mimeType: 'video/mp4' } }
        : {
            ...(ctx.startFrame ? { image: { url: ctx.startFrame, mimeType: inferMimeType(ctx.startFrame) } } : {}),
            ...(ctx.endFrame ? { lastFrame: { url: ctx.endFrame, mimeType: inferMimeType(ctx.endFrame) } } : {}),
            ...(refImages.length > 0
              ? {
                  referenceImages: refImages.slice(0, 3).map((url) => ({
                    image: { url, mimeType: inferMimeType(url) },
                    referenceType: 'asset' as const,
                  })),
                }
              : {}),
          }),
      ...(ctx.negativePrompt ? { negativePrompt: ctx.negativePrompt } : {}),
      parameters: {
        resolution: ctx.resolution ?? '720p',
        aspectRatio: ctx.aspectRatio ?? '16:9',
        durationSeconds: ctx.videoUrl ? 7 : (ctx.duration ?? 8),
        ...(opts.withAudio ? { generateAudio: ctx.generateAudio ?? true } : {}),
      },
    };
  };

const veoParamConfig = {
  ...params.prompt(),
  ...params.aspectRatio(['16:9', '9:16']),
  ...params.duration([4, 6, 8], 8),
  ...params.resolution(['720p', '1080p', '4k']),
  ...params.imageInput(3, 'Reference Images'),
  ...params.generateAudio(),
  ...params.negativePrompt(),
  ...params.startFrame(),
  ...params.endFrame(),
};

/** Veo 3.1 / Fast constraints per Google API:
 *  - reference images require 8s duration
 *  - 4K and 1080p require 8s duration
 *  - reference images and start/end frame are mutually exclusive (both directions)
 */
const FRAME_REF_REASON = 'Reference images cannot be combined with start and last frame images';
const veoConstraints: Constraint[] = [
  { when: { imageUrls: { exists: true } }, then: { duration: { allowed: [8], reason: 'Reference images require 8s duration' } } },
  { when: { resolution: { is: '4k' } }, then: { duration: { allowed: [8], reason: '4K requires 8s duration' } } },
  { when: { resolution: { is: '1080p' } }, then: { duration: { allowed: [8], reason: '1080p requires 8s duration' } } },
  { when: { startFrame: { exists: true } }, then: { imageUrls: { disabled: true, reason: FRAME_REF_REASON } } },
  { when: { endFrame: { exists: true } }, then: { imageUrls: { disabled: true, reason: FRAME_REF_REASON } } },
  { when: { imageUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: FRAME_REF_REASON },
    endFrame: { disabled: true, reason: FRAME_REF_REASON },
  } },
];

const veoLiteParamConfig = {
  ...params.prompt(),
  ...params.aspectRatio(['16:9', '9:16']),
  ...params.duration([4, 6, 8], 8),
  ...params.resolution(['720p', '1080p']),
  ...params.startFrame(),
  // endFrame intentionally omitted — Lite preview API rejects `lastFrame`.
};

/** Veo Lite constraints: 1080p supports 8-second duration only.
 *  Lite has no reference-image slot at all (Lite API doesn't accept it). */
const veoLiteConstraints: Constraint[] = [
  { when: { resolution: { is: '1080p' } }, then: { duration: { allowed: [8], reason: '1080p supports 8s only' } } },
];

export const { MODELS } = defineModels('google', [
  {
    id: 'veo-3.1', name: 'Veo 3.1', modelId: 'veo-3.1-generate-001',
    addedAt: '2026-02-06',
    workflow: 'veo-t2v', buildPayload: buildVeoPayload('veo-3.1-generate-001', { withAudio: true }),
    estimatedTime: { '720p': 40, '1080p': 80, '4k': 138 },
    mode: 'video', inputType: 't2v', badge: ['popular', 'premium'] as const,
    description: '4K video with built-in audio — voices, music, and effects match every scene.',
    features: [feat('Start/End Frame', 'frame'), feat('Reference Images', 'input'), feat('4K', 'resolution'), feat('Audio', 'audio'), feat('4/6/8 sec', 'duration')],
    paramConfig: veoParamConfig,
    constraints: veoConstraints,
  },
  {
    id: 'veo-3.1-fast', name: 'Veo 3.1 Fast', modelId: 'veo-3.1-fast-generate-001',
    addedAt: '2026-02-06',
    workflow: 'veo-t2v', buildPayload: buildVeoPayload('veo-3.1-fast-generate-001', { withAudio: true }),
    estimatedTime: { '720p': 40, '1080p': 60, '4k': 80 },
    mode: 'video', inputType: 't2v', badge: ['popular', 'fast'] as const,
    description: 'Quick 4K video with synchronized audio for rapid iteration.',
    features: [feat('Start/End Frame', 'frame'), feat('Reference Images', 'input'), feat('4K', 'resolution'), feat('Audio', 'audio'), feat('4/6/8 sec', 'duration')],
    paramConfig: veoParamConfig,
    constraints: veoConstraints,
  },
  {
    id: 'veo-3.1-lite', name: 'Veo 3.1 Lite', modelId: 'veo-3.1-lite-generate-preview',
    addedAt: '2026-04-02',
    workflow: 'veo-t2v', buildPayload: buildVeoPayload('veo-3.1-lite-generate-preview'),
    estimatedTime: { '720p': 10, '1080p': 25 },
    mode: 'video', inputType: 't2v', badge: ['fast'] as const,
    description: 'Lightweight video with built-in audio — fast and affordable, 720p/1080p',
    features: [feat('Start Frame', 'frame'), feat('Audio', 'audio'), feat('1080p', 'resolution'), feat('4/6/8 sec', 'duration')],
    paramConfig: veoLiteParamConfig,
    constraints: veoLiteConstraints,
  },
]);

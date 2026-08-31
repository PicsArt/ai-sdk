/**
 * Captions.ai (Mirage) payload builder.
 *
 * Renames the SDK's unified names to the CaptionsAiVideosCaptionsCommand wire
 * shape: `videoUrl` → `video.url`, `templateId` → `caption_template_id`.
 *
 * NOTE: `@picsart/workflows-types` does not publish `captionsai/*` yet (new
 * worker) — the return stays inferred. Follow-up: annotate it as
 * `WorkflowTypes['captionsai/v1/videos/captions']['params']` once published.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { DEFAULT_CAPTION_TEMPLATE_ID, MODELS } from './captionsai.ts';

type CaptionsInput = ModelInput<'captionsai-video-captions'>;

const buildCaptionsPayload = (input: CaptionsInput) => ({
  video: { url: input.videoUrl },
  caption_template_id: input.templateId ?? DEFAULT_CAPTION_TEMPLATE_ID,
});

registerPayloads(MODELS, {
  'captionsai-video-captions': buildCaptionsPayload,
});

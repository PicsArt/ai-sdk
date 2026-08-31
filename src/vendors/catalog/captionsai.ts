/**
 * Captions.ai (rebranded Mirage) — video captions.
 *
 * One model: `captionsai/v1/videos/captions` transcribes a vertical video and
 * burns in animated captions in the style of a caption template. The template
 * list is served by the `captionsai/v1/catalog/caption-templates` platform task
 * (static on the worker side; ~67 styles), so `templateId` is catalog-bound.
 *
 * Vendor limits (enforced client-side here and again by the worker preflight):
 * 9:16 only, MP4/MOV, up to 5 minutes and 50 MB. Priced per input minute,
 * rounded up (`modelId: 'mirage-captions'`, use case video-to-video).
 *
 * Payload transform lives in captionsai.payloads.ts and self-registers via
 * registerPayloads — no imports back into this file (ESM circular).
 *
 * Docs: https://captions.ai/help/docs/api/video-captions
 */
import { defineModels, feat, params } from '../define.ts';

/** Vendor caps on the source video. */
const CAPTIONS_MAX_DURATION_SEC = 300;
const CAPTIONS_MAX_BYTES = 50 * 1024 * 1024;

/** "Heat" — a safe, widely used default from the template gallery. */
export const DEFAULT_CAPTION_TEMPLATE_ID = 'ctpl_DxflLOnuKkb198FNdI9E';

export const { MODELS } = defineModels('captionsai', [
  {
    id: 'captionsai-video-captions', name: 'Captions', modelId: 'mirage-captions',
    addedAt: '2026-08-27',
    workflow: 'captionsai/v1/videos/captions',
    // ~26s measured for an 8s clip on the live API; scales with clip length.
    estimatedTime: 60,
    mode: 'video', inputType: 'v2v',
    // Stage-only until the worker is deployed to prod and the pricing record
    // (mirage-captions / video-to-video) exists — flip to production then.
    release: 'preview',
    description: 'Auto-transcribes a vertical video and burns in animated captions from 67 style templates — up to 5 minutes, 9:16.',
    features: [
      feat('Video Required', 'input'),
      feat('9:16', 'resolution'),
      feat('Up to 5 min', 'duration'),
      feat('67 Templates', 'style'),
    ],
    paramConfig: {
      ...params.videoInput('Source Video', 'asset', true, CAPTIONS_MAX_DURATION_SEC, undefined, CAPTIONS_MAX_BYTES),
      ...params.catalog('templateId', {
        label: 'Caption Style',
        // Not `required`: the declared default fills it, and request validation runs
        // before the payload builder — a required flag would reject the very
        // calls the default exists for (same shape as Kling's effect templateId).
        source: { workflow: 'captionsai/v1/catalog/caption-templates' },
        default: DEFAULT_CAPTION_TEMPLATE_ID,
      }),
    },
  },
]);

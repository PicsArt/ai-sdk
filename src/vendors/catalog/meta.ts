/**
 * Meta — single source of truth (image, video segmentation).
 *
 * Muse Image 1.0 (`meta/v1/images/generations` + `meta/v1/images/edits`):
 * OpenAI-images-style command — `n`, `size` ("widthxheight" free-form),
 * `output_format`, plus an agentic planner controlled by `reasoning_strength`
 * and per-tool `tool_enablement` flags (image search / web search / shell).
 * The edits command additionally requires `images[]` (≥ 1 URL, edit or
 * compose). Aspect ratios map to wire `size` in the payload builder
 * (openai.ts precedent — the backend accepts any "widthxheight" string).
 *
 * SAM 3 Video (`sam-3/video`, served by fal): segments and tracks the objects
 * named in the prompt across a clip. Only text prompts are exposed — the
 * point / box prompt lists have no param descriptor.
 */
import { p } from '../../core/descriptors/presets.ts';
import { defineModels, feat, params } from '../define.ts';

export const { MODELS } = defineModels('meta', [
  // ── Image ─────────────────────────────────────────
  {
    id: 'muse-image-1.0', name: 'Muse Image 1.0',
    addedAt: '2026-08-31',
    workflow: 'meta/v1/images/generations', editWorkflow: 'meta/v1/images/edits',
    estimatedTime: 60,
    mode: 'image', inputType: 't2i',
    description: 'Meta\'s agentic image model — plans with reasoning, web and image search before rendering.',
    features: [feat('Multi-Image Input', 'input'), feat('Web Search', 'characteristic'), feat('High Quality', 'quality')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(['1:1', '3:2', '2:3', '16:9', '9:16', '4:3', '3:4'], '1:1'),
      // Vendor-side reasoning tier for the agentic planner; vendor default high.
      ...p.enum('reasoningStrength', ['low', 'high'], 'high', { label: 'Reasoning' }),
      ...p.enum('moderation', ['auto', 'low', 'none'], 'auto', { label: 'Moderation' }),
      // Per-tool planner controls — all-true matches the vendor default
      // (omitting tool_enablement enables every tool).
      ...p.boolean('enableImageSearch', true, 'Image Search'),
      ...p.boolean('enableWebSearch', true, 'Web Search'),
      ...p.boolean('enableShell', true, 'Layout & Chart Tools'),
      ...p.enum('outputFormat', ['png', 'jpeg', 'webp'], 'png', { label: 'Format' }),
      ...params.count(),
      ...params.imageInput(5, 'Source Images'),
    },
  },
  // ── Video ─────────────────────────────────────────
  {
    // Billed per second of the source clip at one flat rate, so none of the
    // knobs below changes the price.
    id: 'sam-3-video', name: 'SAM 3 Video',
    modelId: 'fal-ai-sam-3-video',
    addedAt: '2026-10-12',
    workflow: 'sam-3/video',
    estimatedTime: 60,
    mode: 'video', inputType: 'v2v',
    description: 'Segment and track objects through a video from a text prompt — name several objects separated by commas and SAM 3 keeps each one masked across every frame.',
    features: [feat('Segmentation', 'characteristic'), feat('Object Tracking', 'characteristic'), feat('Video Input', 'input')],
    paramConfig: {
      ...params.prompt({ placeholder: 'person, cloth' }),
      ...params.videoInput('Source Video', 'asset', true),
      // Lower finds more objects but less precisely.
      ...p.range('detectionThreshold', 0, 1, 0.5, { step: 0.05, label: 'Detection Threshold' }),
      // Off returns the source frames without the mask overlay.
      ...p.boolean('applyMask', true, 'Apply Mask'),
      ...p.enum('outputFormat', ['mp4', 'webm'], 'mp4', { label: 'Format' }),
    },
  },
]);

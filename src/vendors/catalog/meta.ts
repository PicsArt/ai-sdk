/**
 * Meta — single source of truth (image).
 *
 * Muse Image 1.0 (`meta/v1/images/generations` + `meta/v1/images/edits`):
 * OpenAI-images-style command — `n`, `size` ("widthxheight" free-form),
 * `output_format`, plus an agentic planner controlled by `reasoning_strength`
 * and per-tool `tool_enablement` flags (image search / web search / shell).
 * The edits command additionally requires `images[]` (≥ 1 URL, edit or
 * compose). Aspect ratios map to wire `size` in the payload builder
 * (openai.ts precedent — the backend accepts any "widthxheight" string).
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
]);

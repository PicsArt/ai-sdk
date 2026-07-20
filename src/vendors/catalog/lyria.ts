/**
 * Lyria (Google) — single source of truth.
 * Music generation from text and image prompts using Google Lyria 3 models.
 * Supports vocal and instrumental modes, plus up to 10 mood images.
 * https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/lyria
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';

// ── Payload builders ────────────────────────────────────────────────

const imagePart = (url: string) => ({ url, mimeType: 'image/jpeg' });

/** Lyria 3 Music — prompt + optional mood images + model selection. */
const buildLyria3Payload = (apiModelId: string): PayloadBuilder => (ctx) => ({
  prompt: ctx.prompt,
  model: apiModelId,
  ...(ctx.imageUrls?.length === 1 ? { image: imagePart(ctx.imageUrls[0]) } : {}),
  ...((ctx.imageUrls?.length ?? 0) > 1 ? { images: ctx.imageUrls!.slice(0, 10).map(imagePart) } : {}),
});

// ── Model definitions ───────────────────────────────────────────────

export const { MODELS } = defineModels('google', [
  {
    id: 'lyria-3-clip',
    addedAt: '2026-03-26',
    name: 'Lyria 3 Clip',
    modelId: 'lyria-3-clip-preview',
    workflow: 'lyria/v2/music',
    buildPayload: buildLyria3Payload('lyria-3-clip-preview'),
    estimatedTime: 30,
    mode: 'audio',
    inputType: 'music',
    description: 'Fast music clips from text and image prompts using Google Lyria 3.',
    features: [feat('Image Input', 'input'), feat('Vocal & Instrumental', 'characteristic')],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(10, 'Mood Images'),
    },
  },
  {
    id: 'lyria-3-pro',
    addedAt: '2026-03-26',
    name: 'Lyria 3 Pro',
    modelId: 'lyria-3-pro-preview',
    workflow: 'lyria/v2/music',
    buildPayload: buildLyria3Payload('lyria-3-pro-preview'),
    estimatedTime: 45,
    mode: 'audio',
    inputType: 'music',
    badge: ['premium'] as const,
    description: 'Extended music generation up to 184s with vocals, powered by Google Lyria 3 Pro.',
    features: [feat('Image Input', 'input'), feat('Vocal & Instrumental', 'characteristic'), feat('Up to 184s', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(10, 'Mood Images'),
    },
  },
]);

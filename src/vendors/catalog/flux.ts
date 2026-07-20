/**
 * Flux — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { resolveImageSize } from '../../core/helpers.ts';

// ── Aspect-ratio → pixel-size map ────────────────────────────────────
// UI shows plain "W:H" ratios; Flux API requires width/height pixels.

export const FLUX_AR_TO_SIZE: Record<string, string> = {
  '1:1': '1024x1024',
  '5:3': '1280x768',
  '3:5': '768x1280',
  '4:3': '1024x768',
  '3:4': '768x1024',
};

// Aspect-ratio options derived from AR→size map.
const fluxAspectRatios = Object.keys(FLUX_AR_TO_SIZE);

// ── Payload builders ────────────────────────────────────────────────

/**
 * Flux V2 payload builder for the dedicated `flux-v2` workflow.
 * Flat top-level params — no modelOptions wrapper.
 * imageUrls is required by the API (send [] for pure T2I).
 */
const buildFluxV2Payload =
  (modelId: string): PayloadBuilder =>
  (ctx) => {
    const size = resolveImageSize(ctx, FLUX_AR_TO_SIZE);
    return {
      prompt: ctx.prompt,
      model: modelId,
      imageUrls: ctx.imageUrls ?? [],
      ...(size ? {
        width: parseInt(size.split('x')[0]),
        height: parseInt(size.split('x')[1]),
      } : {}),
      ...(ctx.guidance != null ? { guidance: ctx.guidance } : {}),
      ...(ctx.seed != null ? { seed: ctx.seed } : {}),
    };
  };

function normalizeAspectRatio(aspect?: string | null): string | null {
  if (!aspect) return null;
  const raw = String(aspect).trim();
  if (!raw) return null;
  if (raw.startsWith('ASPECT_')) {
    return raw.replace('ASPECT_', '').replace('_', ':');
  }
  return raw;
}

function inferAspectFromSize(size?: string | null): string | null {
  if (!size) return null;
  const m = String(size).match(/^(\d+)x(\d+)$/i);
  if (!m) return null;
  const w = Number(m[1]);
  const h = Number(m[2]);
  if (!w || !h) return null;
  return `${w}:${h}`;
}

/**
 * Flux Kontext payload builder for the dedicated `flux-kontext` workflow.
 * Flat top-level params — aspectRatio at top level, no modelOptions wrapper.
 * imageUrls is required by the API (send [] for pure T2I).
 */
const buildFluxKontextPayload =
  (modelId: string): PayloadBuilder =>
  (ctx) => {
    const aspectRatio = normalizeAspectRatio(ctx.aspectRatio) || inferAspectFromSize(ctx.size);
    return {
      prompt: ctx.prompt,
      model: modelId,
      imageUrls: ctx.imageUrls ?? [],
      ...(aspectRatio ? { aspectRatio } : {}),
    };
  };

// ── Shared config ───────────────────────────────────────────────────

const fluxV2Base = {
  workflow: 'flux-v2' as const,
  mode: 'image' as const,
  inputType: 't2i' as const,
};

const fluxKontextBase = {
  workflow: 'flux-kontext' as const,
  mode: 'image' as const,
  inputType: 't2i' as const,
};

// ── Model definitions ───────────────────────────────────────────────

export const { MODELS } = defineModels('flux', [
  {
    ...fluxV2Base,
    id: 'flux-2-pro', name: 'Flux 2 Pro', modelId: 'flux-2-pro',
    addedAt: '2026-02-06',
    buildPayload: buildFluxV2Payload('flux-2-pro'),
    estimatedTime: 19,
    description: 'Sharp 2K images with fine-tuned color accuracy and detail.',
    features: [feat('Multi-Image Input', 'input'), feat('2K', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(fluxAspectRatios, '4:3'),
      ...params.count(),
      ...params.imageInput(4, 'Source Images'),
    },
  },
  {
    ...fluxV2Base,
    id: 'flux-2-max', name: 'Flux 2 Max', modelId: 'flux-2-max',
    addedAt: '2026-02-06',
    buildPayload: buildFluxV2Payload('flux-2-max'),
    estimatedTime: 27,
    description: 'Maximum detail for intricate compositions and demanding scenes.',
    features: [feat('Image Input', 'input'), feat('2K', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(fluxAspectRatios, '1:1'),
      ...params.count(),
      ...params.imageInput(1, 'Source Image'),
    },
  },
  {
    ...fluxV2Base,
    id: 'flux-2-flex', name: 'Flux 2 Flex', modelId: 'flux-2-flex',
    addedAt: '2026-02-06',
    buildPayload: buildFluxV2Payload('flux-2-flex'),
    estimatedTime: 15,
    description: 'Adaptable generation across varied visual styles at 2K.',
    features: [feat('Image Input', 'input'), feat('2K', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(fluxAspectRatios, '3:4'),
      ...params.count(),
      ...params.imageInput(1, 'Source Image'),
    },
  },
  {
    ...fluxKontextBase,
    id: 'flux-kontext-max', name: 'Flux Kontext Max', modelId: 'flux-kontext-max',
    addedAt: '2026-02-06',
    buildPayload: buildFluxKontextPayload('flux-kontext-max'),
    estimatedTime: 15,
    description: 'Edit and compose from up to 4 reference images with context awareness.',
    features: [feat('Multi-Image Input', 'input')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(['1:1', '16:9', '9:16', '4:3', '3:4', '21:9', '9:21'], '1:1'),
      ...params.count(),
      ...params.imageInput(4, 'Source Images'),
    },
  },
  {
    ...fluxKontextBase,
    id: 'flux-kontext-pro', name: 'Flux Kontext Pro', modelId: 'flux-kontext-pro',
    addedAt: '2026-02-06',
    buildPayload: buildFluxKontextPayload('flux-kontext-pro'),
    estimatedTime: 15,
    badge: ['fast'] as const,
    description: 'Single-image context-aware editing and generation — fast.',
    features: [feat('Image Input', 'input')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(['1:1', '16:9', '9:16', '4:3', '3:4', '21:9', '9:21'], '1:1'),
      ...params.count(),
      ...params.imageInput(1, 'Source Image'),
    },
  },
]);

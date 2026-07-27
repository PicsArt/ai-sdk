/**
 * Flux — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';
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
  {
    // Single workflow `flux/v1/video` handles t2v plus every conditioning
    // mode (i2v via start frame, morph via start/end frame, reference images,
    // reference video, video continuation) through optional inputs — no
    // editWorkflow needed. Payload assembly lives in flux.payloads.ts.
    id: 'flux-3-video', name: 'Flux 3 Video',
    workflow: 'flux/v1/video',
    mode: 'video', inputType: 't2v',
    release: 'preview',
    addedAt: '2026-07-27',
    estimatedTime: 120,
    description: 'Text-to-video with synchronized audio, plus image and video conditioning (continuation, references, first/last frame).',
    features: [
      feat('Image & Video Input', 'input'),
      feat('Start/End Frame', 'frame'),
      feat('Audio', 'audio'),
      feat('Up to 20s', 'duration'),
      feat('720p', 'resolution'),
    ],
    paramConfig: {
      ...params.prompt(),
      // Checkpoint: `high` (default, full conditioning + draft) vs `optimized`
      // (faster, text-to-video only). Sent as the wire `model` field.
      ...p.enum('model', [
        { id: 'flux-3-preview-high', label: 'High' },
        { id: 'flux-3-preview-optimized', label: 'Optimized' },
      ], 'flux-3-preview-high', { label: 'Model' }),
      ...params.aspectRatio(['auto', '21:9', '16:9', '4:3', '1:1', '3:4', '9:16', '9:21'], 'auto'),
      ...params.resolution(['480p', '720p'], '720p'),
      // 'auto' lets the model fit length; an explicit whole number is required
      // for a two-image (start+end) morph.
      ...p.enum('duration', ['auto', '5', '10', '15', '20'], 'auto', { label: 'Duration' }),
      // startFrame → keyframe @0 (i2v); endFrame → keyframe @duration×24 (morph).
      ...params.startFrame('Start Frame'),
      ...params.endFrame('End Frame'),
      // referenceImages (ir2v): who/what appears, never shown on screen.
      ...params.imageInput(10, 'Reference Images', false, 'reference'),
      // startVideo (f2v): continue from a clip's final frames.
      ...params.videoInput('Start Video', 'asset', false, 15),
      // referenceVideo (vr2v): carry subjects into a brand-new clip.
      ...params.videoInputs(1, 'Reference Video', false),
      ...params.generateAudio(true),
      ...p.boolean('grounding', true, 'Grounding'),
      ...p.range('seed', 0, 4294967295, 0, { label: 'Seed' }),
      ...p.text('version', { label: 'Version', placeholder: 'latest' }),
    },
  },
]);

/**
 * Imagen — single source of truth.
 *
 * Model configs are pure data. Payload transforms live in imagen.payloads.ts.
 */
import { defineModels, feat, params } from '../define.ts';

const imagenParams = {
  ...params.prompt(),
  ...params.aspectRatio(['1:1', '16:9', '9:16', '3:4', '4:3'], '1:1'),
  // Vertex Imagen sampleCount is capped at 4 — don't offer 6/8/10.
  ...params.count([1, 2, 4]),
  ...params.enhancePrompt(),
  ...params.negativePrompt(),
};

export const { MODELS } = defineModels('google', [
  {
    id: 'imagen-4.0', name: 'Imagen 4.0', modelId: 'imagen-4.0-generate-001',
    addedAt: '2026-02-06',
    workflow: 'imagen',
    estimatedTime: 12,
    mode: 'image', inputType: 't2i', badge: ['fast'],
    description: 'Quick 1K images with sharp text overlay and prompt enhancement.',
    features: [feat('1K', 'resolution')],
    paramConfig: imagenParams,
  },
  {
    id: 'imagen-4.0-ultra', name: 'Imagen 4.0 Ultra', modelId: 'imagen-4.0-ultra-generate-001',
    addedAt: '2026-02-06',
    workflow: 'imagen',
    estimatedTime: 15,
    mode: 'image', inputType: 't2i', badge: ['premium'],
    description: 'Print-ready 2K output optimized for photorealistic detail.',
    features: [feat('2K', 'resolution')],
    paramConfig: imagenParams,
  },
  {
    id: 'imagen-4.0-fast', name: 'Imagen 4.0 Fast', modelId: 'imagen-4.0-fast-generate-001',
    addedAt: '2026-02-06',
    workflow: 'imagen',
    estimatedTime: 6,
    mode: 'image', inputType: 't2i',
    description: 'Fastest Imagen tier for quick drafts and rapid prompt iteration.',
    features: [feat('1K', 'resolution'), feat('Fast', 'duration')],
    paramConfig: imagenParams,
  },
]);

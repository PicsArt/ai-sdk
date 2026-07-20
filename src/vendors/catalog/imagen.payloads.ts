/**
 * Imagen payload builders.
 *
 * Transforms SDK param values into the Imagen API's expected format.
 * Return type checked against WorkflowTypes['imagen']['params'].
 */
import type { WorkflowTypes } from '@picsart/workflows-types';
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './imagen.ts';

type ImagenInput = ModelInput<'imagen-4.0'>;
type ImagenParams = WorkflowTypes['imagen']['params'];

/** Imagen T2I builder — shared by all Imagen models (only modelId differs). */
const buildImagenPayload = (modelId: ImagenParams['model']) =>
  // Partial: WorkflowTypes incorrectly marks some params as required (e.g. maskDilation, editingSteps)
  (input: ImagenInput): Partial<ImagenParams> => ({
    model: modelId,
    mode: 'imagen_generate',
    prompt: input.prompt,
    sampleCount: input.count ?? 1,
    aspectRatio: input.aspectRatio ?? '1:1',
    enhancePrompt: input.enhancePrompt !== false,
    ...(input.negativePrompt ? { negativePrompt: input.negativePrompt } : {})
  });

registerPayloads(MODELS, {
  'imagen-4.0': buildImagenPayload('imagen-4.0-generate-001'),
  'imagen-4.0-ultra': buildImagenPayload('imagen-4.0-ultra-generate-001'),
  'imagen-4.0-fast': buildImagenPayload('imagen-4.0-fast-generate-001')
});

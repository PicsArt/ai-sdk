/**
 * Meta payload builders (new-style, `ModelInput`-typed).
 *
 * muse-image-1.0 (`meta/v1/images/generations` + `meta/v1/images/edits`):
 * renames SDK fields to the MetaImagesGenerationsCommand /
 * MetaImagesEditsCommand wire shapes — `count` → `n`, `outputFormat` →
 * `output_format`, `reasoningStrength` → `reasoning_strength`, and the three
 * enable* booleans assemble into `tool_enablement`. `aspectRatio` maps to the
 * wire `size` ("widthxheight" — the backend accepts any size string).
 *
 */
import type { WorkflowTypes } from '@picsart/workflows-types';
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerEditPayloads, registerPayloads } from '../define.ts';
import { MODELS } from './meta.ts';

type MuseImageInput = ModelInput<'muse-image-1.0'>;
type MuseGenerationsPayload = WorkflowTypes['meta/v1/images/generations']['params'];
type MuseEditsPayload = WorkflowTypes['meta/v1/images/edits']['params'];

// The backend `size` is a free-form "widthxheight" *aspect-ratio hint* — the
// vendor renders at its own resolution. Keep the short side at 1024 and derive
// the long side from the ratio.
const MUSE_AR_TO_SIZE: Record<string, string> = {
  '1:1': '1024x1024',
  '3:2': '1536x1024',
  '2:3': '1024x1536',
  '16:9': '1820x1024',
  '9:16': '1024x1820',
  '4:3': '1365x1024',
  '3:4': '1024x1365',
};

const buildMuseCommonPayload = (input: MuseImageInput) => ({
  model: 'muse-image-1.0' as const,
  prompt: input.prompt,
  n: input.count ?? 1,
  size: MUSE_AR_TO_SIZE[input.aspectRatio ?? ''] ?? '1024x1024',
  ...(input.outputFormat ? { output_format: input.outputFormat } : {}),
  ...(input.reasoningStrength ? { reasoning_strength: input.reasoningStrength } : {}),
  ...(input.moderation ? { moderation: input.moderation } : {}),
  tool_enablement: {
    enable_image_search: input.enableImageSearch ?? true,
    enable_web_search: input.enableWebSearch ?? true,
    enable_shell: input.enableShell ?? true,
  },
});

/** Text-to-Image (meta/v1/images/generations). */
const buildMuseImagePayload = (input: MuseImageInput): MuseGenerationsPayload =>
  buildMuseCommonPayload(input);

/** Image edit / compose (meta/v1/images/edits — requires images[]). */
const buildMuseImageEditPayload = (input: MuseImageInput): MuseEditsPayload => ({
  ...buildMuseCommonPayload(input),
  images: input.imageUrls ?? [],
});

registerPayloads(MODELS, {
  'muse-image-1.0': buildMuseImagePayload,
});

registerEditPayloads(MODELS, {
  'muse-image-1.0': buildMuseImageEditPayload,
});

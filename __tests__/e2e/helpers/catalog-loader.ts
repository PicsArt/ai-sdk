/**
 * Catalog loader — reads from @picsart/ai-sdk and shapes models into testable
 * entries for the OPTIONS matrix harness. Single source of truth is the SDK
 * catalog itself; called with no filter it returns every enabled model.
 *
 * Ported from an earlier in-house harness; its playground-app filter
 * (`playgroundFilteredModels`) was dropped — it doesn't exist in this repo.
 */
import { ALL_MODELS, getModelsByMode, isVisibleForReleases } from '../../../src';
import type { ModelDefinition, GenerationMode, ObjectDescriptor } from '../../../src';

export interface CatalogFilter {
  vendor?: string;
  mode?: GenerationMode;
  model?: string;
  /** If true, include deprecated and preview models. Default: false. */
  includeHidden?: boolean;
  /** If true, include models in DISABLED_TEST_MODELS. Default: false. */
  includeTestDisabled?: boolean;
}

/**
 * Models explicitly excluded from the matrix. Each entry needs a reason.
 * Override per-run with `includeTestDisabled: true`.
 */
export const DISABLED_TEST_MODELS = new Set<string>([
  // All of these need an input the matrix can't synthesize, so /options rejects
  // the generated payload. They surface only on the live run, not the offline
  // required-param scan. Override per-run with `includeTestDisabled: true`.

  // Requires `sourceImageId` — a backend-issued image id from a prior result.
  'recraft-explore-similar',
  // Requires a real `voiceId`, but the param is a picker whose default is "".
  'heygen-talking-photo',
  // Same as above plus `videoId` — the avatar picker is hydrated at runtime from
  // `heygen/v1/catalog/avatars` (via ai.catalogs), so its bundled options are
  // empty and the default is "".
  'heygen-video-avatar',
  // Backend dubbing requires a target language not declared (as required) in paramConfig.
  'eleven-dubbing',
  // Require a real `template` — the picker is hydrated at runtime from
  // `picsart-flow/v1/catalog/templates` (via ai.catalogs). CMS preset ids
  // rotate, so no id is stable enough to bundle as a default ("").
  'picsart-flow',
  'picsart-flow-video',
]);

export interface CatalogEntry {
  id: string;
  name: string;
  vendor: string;
  mode: GenerationMode;
  /** Present when the model has an edit route — used to drive the edit matrix. */
  editWorkflow: string | undefined;
  /**
   * UI-facing input (paramConfig defaults merged with overrides). Passed
   * straight to `client.getCredits(id, ctx)`, which resolves the workflow,
   * runs buildPayload, and calls /options — so the harness never reimplements
   * payload building. Image inputs route the SDK to `editWorkflow` automatically.
   */
  buildContext(overrides?: Record<string, unknown>): Record<string, unknown>;
  /** Raw model definition for advanced access (matrix expansion, constraints). */
  raw: ModelDefinition;
}

/** Load catalog entries matching the filter. No filter → all enabled models. */
export function loadCatalog(filter: CatalogFilter = {}): CatalogEntry[] {
  const models: ModelDefinition[] = filter.mode ? getModelsByMode(filter.mode) : [...ALL_MODELS];

  return models
    .filter((m) => {
      if (!filter.includeHidden && !isVisibleForReleases(m)) return false;
      if (!filter.includeTestDisabled && DISABLED_TEST_MODELS.has(m.id)) return false;
      if (filter.vendor && m.provider !== filter.vendor) return false;
      if (filter.model && m.id !== filter.model) return false;
      if (!m.workflow) return false;
      return true;
    })
    .map((m) => {
      const defaultCtx = buildDefaultContext(m);
      return {
        id: m.id,
        name: m.name,
        vendor: m.provider,
        mode: m.mode,
        editWorkflow: m.editWorkflow,
        buildContext: (overrides?: Record<string, unknown>) => ({ ...defaultCtx, ...overrides }),
        raw: m,
      };
    });
}

// ── Internals ────────────────────────────────────────────────────────

/** Permanent CMS-uploaded test assets the backend can access. */
const TEST_ASSETS: Record<string, { url: string; durationSec?: number }> = {
  image: { url: 'https://cdn-cms-uploads.picsart.com/cms-uploads/61beebb2-1028-408f-970f-1e43e9ce538d.png' },
  video: { url: 'https://cdn-cms-uploads.picsart.com/cms-uploads/5aa76de2-4847-4126-9c1e-5677846fab1d.mp4', durationSec: 6 },
  audio: { url: 'https://cdn-cms-uploads.picsart.com/cms-uploads/3dbb86fc-8625-4481-a1af-6870fe678f5a.mp3', durationSec: 16 },
  media: { url: 'https://cdn-cms-uploads.picsart.com/cms-uploads/61beebb2-1028-408f-970f-1e43e9ce538d.png' },
};

/**
 * Build a GenerationContext-like object from paramConfig defaults (UI-facing,
 * pre-buildPayload). Required file params are filled with test assets; optional
 * file params are left out — the matrix expander generates with/without variants.
 */
function buildDefaultContext(model: ModelDefinition): Record<string, unknown> {
  const ctx: Record<string, unknown> = { prompt: 'A calm ocean at sunset' };

  for (const [key, entry] of Object.entries(model.paramConfig)) {
    const d = entry.descriptor;
    switch (d.kind) {
      case 'enum':
      case 'catalog':
      case 'range':
      case 'boolean':
        ctx[key] = d.default;
        break;
      case 'text':
        if (key === 'prompt') ctx[key] = 'A calm ocean at sunset';
        // Required text params need a valid sample too (e.g. eleven-dubbing's
        // target language) — otherwise contract validation rejects the default
        // context before the pricing call.
        else if (entry.required) ctx[key] = key === 'language' ? 'es' : 'sample text';
        break;
      case 'file':
        if (entry.required) {
          const asset = TEST_ASSETS[d.accept] ?? TEST_ASSETS.image;
          ctx[key] = d.array ? [asset.url] : asset.url;
        }
        break;
      case 'object':
        // A required object param (a dialogue turn, a camera keyframe) has to
        // be synthesized field by field — without it the model's builder reads
        // `.map` off undefined and the run dies before /options is ever called.
        // An array gets as many items as its `min` demands; optional params
        // stay out entirely, like files.
        if (entry.required) ctx[key] = buildObjectValue(d);
        break;
    }
  }

  return ctx;
}

/** An object param's value: a single item, or as many as the array's `min` demands. */
function buildObjectValue(d: ObjectDescriptor): unknown {
  if (!d.array) return buildObjectItem(d.fields);
  const count = Math.max(1, d.array.min ?? 1);
  return Array.from({ length: count }, () => buildObjectItem(d.fields));
}

/** One synthesized value per nested field, using the same rules as the top level. */
function buildObjectItem(fields: ObjectDescriptor['fields']): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(fields)) {
    switch (field.kind) {
      case 'text':
        // A placeholder is a real sample (a voice id, say); prose placeholders
        // never reach here, since only nested fields use this path.
        item[key] = field.placeholder ?? 'sample text';
        break;
      case 'file':
        item[key] = (TEST_ASSETS[field.accept] ?? TEST_ASSETS.image).url;
        break;
      case 'object':
        item[key] = buildObjectValue(field);
        break;
      default:
        // enum / catalog / range / boolean all carry their own default.
        if (field.default !== undefined) item[key] = field.default;
    }
  }
  return item;
}

/** Optional file params for a model — matrix uses these for with/without variants. */
export function getOptionalFileParams(
  model: ModelDefinition,
): Array<{ key: string; accept: string; isArray: boolean }> {
  const result: Array<{ key: string; accept: string; isArray: boolean }> = [];
  for (const [key, entry] of Object.entries(model.paramConfig)) {
    if (entry.descriptor.kind === 'file' && !entry.required) {
      result.push({ key, accept: entry.descriptor.accept, isArray: !!entry.descriptor.array });
    }
  }
  return result;
}

/** Test asset URL for a media type. */
export function getTestAssetUrl(accept: string): string {
  return (TEST_ASSETS[accept] ?? TEST_ASSETS.image).url;
}

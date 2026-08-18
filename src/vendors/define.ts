/**
 * Declarative model definition utility.
 *
 * `defineModels(provider, configs)` returns MODELS for the app
 * from a single source of truth per vendor.
 *
 * Param presets (`params.*`) eliminate repeated paramConfig fragments.
 */
import type {
  GenerationMode, InputType, ModelDefinition, ModelFeature, BadgeType,
  PayloadBuilder, Provider, RuntimeSchema, Constraint, ReleaseTag,
} from '../core/types.ts';
import { createModelContract } from '../core/contracts.ts';
import { providers } from '../core/providers.ts';
import { videoStartEndWithAudio } from './presets.ts';
import { p } from '../core/descriptors/presets.ts';
import { extractDefaults } from '../core/descriptors/utils.ts';
import type { ModelParams } from '../core/descriptors/types.ts';
// ── Types ────────────────────────────────────────────────────────────

/** Fields shared by every model config (app-visible or test-only). */
interface BaseModelConfig {
  id: string;
  name: string;
  provider?: Provider;
  workflow: string;
  editWorkflow?: string;
  syncExecute?: boolean;
  /** Payload builder. Optional — omit for pass-through (param values sent as-is). */
  buildPayload?: PayloadBuilder;
  buildEditPayload?: PayloadBuilder;
  outputSchema?: RuntimeSchema<unknown>;
  estimatedTime?: number | Record<string, number>;
  editEstimatedTime?: number | Record<string, number>;
  testTimeout?: number;
}

/** App-visible fields shared by enabled and disabled model configs. */
interface AppModelFields {
  /** Optional API/test name when different from display name (e.g. Gemini "Nano Banana"). */
  specName?: string;
  mode: GenerationMode;
  inputType: InputType;
  description: string;
  features: ModelFeature[];
  paramConfig: ModelParams;
  /** Declarative inter-parameter constraints. */
  constraints?: Constraint[];
  badge?: BadgeType[];
  /**
   * Release / availability tier. Absent ⇒ `'production'`. Set
   * `'preview'` for pre-release models and `'general-availability'` for
   * enterprise-ready ones. See `ModelDefinition.release`.
   */
  release?: ReleaseTag;
  /** ISO YYYY-MM-DD date the model was added. Drives the 'new' badge (3-week window). */
  addedAt?: string;
  modelId?: string;
}

/** Enabled app model — both gates false. */
interface EnabledAppModelConfig extends BaseModelConfig, AppModelFields {
  disabled?: false;
  deprecated?: false;
}

/** Operationally disabled — backend not deployed, catalog mismatch, etc. */
interface DisabledAppModelConfig extends BaseModelConfig, AppModelFields {
  disabled: true;
  deprecated?: false;
}

/** Deprecated — retired/superseded by a newer sibling; not shown to users. */
interface DeprecatedAppModelConfig extends BaseModelConfig, AppModelFields {
  disabled?: false;
  deprecated: true;
}

type AppModelConfig = EnabledAppModelConfig | DisabledAppModelConfig | DeprecatedAppModelConfig;

// ── Pass-through builder ────────────────────────────────────────────

/** Default payload builder: sends all paramConfig values as-is. */
const passthroughPayload = (paramConfig: ModelParams): PayloadBuilder =>
  (ctx) => {
    const defaults = extractDefaults(paramConfig);
    const payload: Record<string, unknown> = {};
    for (const key of Object.keys(paramConfig)) {
      const val = ctx[key as keyof typeof ctx];
      if (val != null) {
        payload[key] = val;
      } else if (key in defaults) {
        payload[key] = defaults[key];
      }
    }
    return payload;
  };

// ── defineModels ─────────────────────────────────────────────────────

export function defineModels(
  provider: Provider,
  configs: AppModelConfig[],
): { MODELS: ModelDefinition[] } {
  const MODELS: ModelDefinition[] = [];

  for (const c of configs) {
    const prov = c.provider ?? provider;

    const resolvedPayload = c.buildPayload ?? passthroughPayload(c.paramConfig);

    const meta = providers[prov] ?? { color: '#666', label: '?', name: String(prov) };
    const model: ModelDefinition = {
      id: c.id,
      name: c.name,
      providerName: meta.name,
      providerColor: meta.color,
      providerLabel: meta.label,
      provider: prov,
      workflow: c.workflow,
      buildPayload: resolvedPayload,
      mode: c.mode,
      inputType: c.inputType,
      description: c.description,
      features: c.features,
      paramConfig: c.paramConfig,
    };
    if (c.editWorkflow !== undefined) model.editWorkflow = c.editWorkflow;
    if (c.syncExecute !== undefined) model.syncExecute = c.syncExecute;
    if (c.buildEditPayload !== undefined) model.buildEditPayload = c.buildEditPayload;
    if (c.estimatedTime !== undefined) model.estimatedTime = c.estimatedTime;
    if (c.editEstimatedTime !== undefined) model.editEstimatedTime = c.editEstimatedTime;
    if (c.testTimeout !== undefined) model.testTimeout = c.testTimeout;
    if (c.badge !== undefined) model.badge = c.badge;
    if (c.addedAt !== undefined) model.addedAt = c.addedAt;
    if (c.disabled !== undefined) model.disabled = c.disabled;
    if (c.deprecated !== undefined) model.deprecated = c.deprecated;
    if (c.release !== undefined) model.release = c.release;
    if (c.modelId !== undefined) model.modelId = c.modelId;
    if (c.constraints !== undefined) model.constraints = c.constraints;

    const contract = createModelContract(model);
    model.outputSchema = c.outputSchema ?? contract.output;

    MODELS.push(model);
  }

  return { MODELS };
}

// ── Payload registration ────────────────────────────────────────────

/**
 * Payload builders keyed by model ID.
 * Accepts functions typed with generated ModelInput<Id> (narrower than GenerationContext).
 * At runtime the input is always GenerationContext — the narrow type is for authoring safety.
 */
// Builders return any object shape — including interface types from
// @picsart/workflows-types that don't carry an index signature. Downstream
// the result is JSON-serialized as-is, so the structural constraint at
// this level is just "non-primitive object".
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PayloadMap = Record<string, (input: any) => object>;

/**
 * Register payload builders from a co-located `.payloads.ts` file.
 * Overrides pass-through defaults set by defineModels.
 *
 * Usage:
 * ```ts
 * // specs/vendors/vendor.payloads.ts
 * import { registerPayloads } from './define.ts';
 * import { MODELS } from './vendor.ts';
 * registerPayloads(MODELS, { 'model-id': (input) => ({ ... }) });
 * ```
 */
export function registerPayloads(
  MODELS: ModelDefinition[],
  payloads: PayloadMap,
): void {
  for (const [id, builder] of Object.entries(payloads)) {
    const model = MODELS.find(m => m.id === id);
    if (model) model.buildPayload = builder;
  }
}

/**
 * Register edit-payload builders (`buildEditPayload`) by model id.
 *
 * Parallel to `registerPayloads`. Use for combined-entry models with
 * `editWorkflow` (T2V+I2V or T2I+I2I sharing one entry) — registers the
 * edit-route builder from the same `.payloads.ts` file, avoiding a
 * circular import between `{vendor}.ts` and `{vendor}.payloads.ts`.
 */
export function registerEditPayloads(
  MODELS: ModelDefinition[],
  payloads: PayloadMap,
): void {
  for (const [id, builder] of Object.entries(payloads)) {
    const model = MODELS.find(m => m.id === id);
    if (model) model.buildEditPayload = builder;
  }
}

// ── Param presets ────────────────────────────────────────────────────
// Delegates to p.* from descriptors/presets.ts with same call signatures.

export const params = {
  prompt: p.prompt,
  aspectRatio: p.aspectRatio,
  duration: p.duration,
  count: p.count,
  resolution: p.resolution,
  negativePrompt: p.negativePrompt,
  generateAudio: p.generateAudio,
  returnLastFrame: p.returnLastFrame,
  audioSetting: p.audioSetting,
  enhancePrompt: p.enhancePrompt,
  cfgScale: p.cfgScale,
  imageWeight: p.imageWeight,
  style: p.style,
  renderingSpeed: p.renderingSpeed,
  voiceId: p.voiceId,
  videoId: p.videoId,
  catalog: p.catalog,
  language: p.language,
  // File presets — key matches the runtime GenerationContext field name.
  // `category` defaults to the most common role for the slot (overridable per call):
  //   asset    → start/end frame, sync audio (direct inputs to the output)
  //   reference → ref images/videos/audios (guidance signals)
  imageInput: (max = 1, label = 'Start Image', required = false, category: 'asset' | 'reference' = 'reference', minPixels?: number): ModelParams =>
    p.file('imageUrls', 'image', { array: { max }, label, required, category, ...(minPixels != null ? { minPixels } : {}) }),
  /** Single source-video slot (v2v / video edit). Writes to `videoUrl`.
   *  `maxDurationSec` caps the source clip length, `maxShortSidePixels` caps
   *  the shorter side (upscaler sources) and `maxBytes` caps the file size,
   *  all enforced client-side at upload. */
  videoInput: (label = 'Source Video', category: 'asset' | 'reference' = 'reference', required = true, maxDurationSec?: number, maxShortSidePixels?: number, maxBytes?: number): ModelParams =>
    p.file('videoUrl', 'video', {
      label, required, category,
      ...(maxDurationSec != null ? { maxDurationSec } : {}),
      ...(maxShortSidePixels != null ? { maxShortSidePixels } : {}),
      ...(maxBytes != null ? { maxBytes } : {}),
    }),
  /** Single driving / sync-audio slot. Writes to `audioUrl`. */
  audioInput: (label = 'Audio Track', required = false, category: 'asset' | 'reference' = 'asset'): ModelParams =>
    p.file('audioUrl', 'audio', { label, required, category }),
  /** Array of reference videos (writes to `videoUrls`). Backend enforces
   *  per-model total-duration caps (e.g. ≤ 15s for seedance). `maxBytes` caps
   *  each individual clip's file size, enforced client-side at upload. */
  videoInputs: (max = 3, label = 'Reference Videos', required = false, minPixels?: number, maxBytes?: number): ModelParams =>
    p.file('videoUrls', 'video', {
      array: { max }, label, required, category: 'reference',
      ...(minPixels != null ? { minPixels } : {}),
      ...(maxBytes != null ? { maxBytes } : {}),
    }),
  /** Array of reference audios (writes to `audioUrls`). Backend enforces
   *  per-model total-duration caps. */
  audioInputs: (max = 3, label = 'Reference Audios', required = false): ModelParams =>
    p.file('audioUrls', 'audio', { array: { max }, label, required, category: 'reference' }),
  startFrame: (label = 'Start Frame', required = false): ModelParams =>
    p.file('startFrame', 'image', { label, required, category: 'asset' }),
  endFrame: (label = 'End Frame'): ModelParams =>
    p.file('endFrame', 'image', { label, category: 'asset' }),
};

// ── Composed param presets ────────────────────────────────────────────



export const paramPresets = {
  videoStartEndWithAudio,
};

// ── Feature shorthand ────────────────────────────────────────────────

export const feat = (label: string, variant: ModelFeature['variant']): ModelFeature =>
  ({ label, variant });

/**
 * Model accessor — single entry point for all model info.
 *
 * Usage:
 *   import { model } from '@picsart/ai-sdk';
 *   const m = model('flux-2-pro');
 *   m.id                                  // 'flux-2-pro'
 *   m.name                                // 'Flux 2 Pro'
 *   m.params().hasParam('aspectRatio')     // true
 *   m.params().getDefaults()              // { aspectRatio: '4:3', ... }
 *   m.meta().mode                          // 'image'
 *   m.meta().provider.name                 // 'Flux'
 */

import type { ModelDefinition, GenerationContext, ReleaseTag } from '../types.ts';
import { evaluateConstraints } from '../constraints.ts';
import { isVisibleForReleases, DEFAULT_VISIBLE_RELEASES } from '../visibility.ts';
import type { NormalizedRestriction } from '../constraints.ts';
import type { TypedModelId } from '../../generated/model-input-types.ts';
import type {
  ParamDescriptor,
  EntryMeta,
  EnumEntry,
  RangeEntry,
  BooleanEntry,
  TextEntry,
  FileEntry,
  FlatParamEntry,
  ModelParamsAccessor,
  ModelMeta,
  ModelDescriptor,
  ModelFilter,
  ProviderInfo,
  CreditRange,
  CreditRangeContext,
  EnumDescriptor,
  ValidationResult,
} from './types.ts';
import { extractDefaults, descriptorsToSchema, transferValues, validateAll } from './utils.ts';
import { resolveModel } from '../resolve.ts';
import { ALL_MODELS } from '../../vendors/catalog/index.ts';
import {
  configurePricing,
  loadPricing,
  isPricingLoaded,
  getCreditsForModel,
} from './pricing.ts';

// ── ModelParamsAccessor implementation ──────────────────────────────

class ModelParamsAccessorImpl implements ModelParamsAccessor {
  private readonly def: ModelDefinition;

  constructor(def: ModelDefinition) {
    this.def = def;
  }

  param(key: string): (EntryMeta & ParamDescriptor) | undefined {
    const entry = this.def.paramConfig[key];
    if (!entry) return undefined;
    const { descriptor, ...meta } = entry;
    return { ...meta, ...descriptor };
  }

  hasParam(key: string): boolean {
    return key in this.def.paramConfig;
  }

  all(): FlatParamEntry[] {
    return Object.entries(this.def.paramConfig).map(
      ([key, { descriptor, ...meta }]) => ({ key, ...meta, ...descriptor }),
    );
  }

  // Kind-narrowed accessors
  enum(key: string): EnumEntry | undefined { return this.narrow(key, 'enum'); }
  range(key: string): RangeEntry | undefined { return this.narrow(key, 'range'); }
  boolean(key: string): BooleanEntry | undefined { return this.narrow(key, 'boolean'); }
  text(key: string): TextEntry | undefined { return this.narrow(key, 'text'); }
  file(key: string): FileEntry | undefined { return this.narrow(key, 'file'); }

  // Well-known shorthands
  prompt(): TextEntry | undefined { return this.narrow('prompt', 'text'); }
  aspectRatio(): EnumEntry | undefined { return this.narrow('aspectRatio', 'enum'); }
  duration(): EnumEntry | undefined { return this.narrow('duration', 'enum'); }
  resolution(): EnumEntry | undefined { return this.narrow('resolution', 'enum'); }
  generateAudio(): BooleanEntry | undefined { return this.narrow('generateAudio', 'boolean'); }
  startFrame(): FileEntry | undefined { return this.narrow('startFrame', 'file'); }
  endFrame(): FileEntry | undefined { return this.narrow('endFrame', 'file'); }

  // Absorbed from Models namespace
  hasFileInput(): boolean {
    return Object.values(this.def.paramConfig).some(e => e.descriptor.kind === 'file');
  }

  getDefault(key: string): unknown {
    const entry = this.def.paramConfig[key];
    if (!entry) return undefined;
    const d = entry.descriptor;
    return 'default' in d ? d.default : undefined;
  }

  getDefaults(): Record<string, unknown> {
    return extractDefaults(this.def.paramConfig);
  }

  /** @deprecated Use `enum(key)` instead. */
  getEnumOptions(key: string): (string | number)[] | null {
    const entry = this.def.paramConfig[key];
    if (!entry || entry.descriptor.kind !== 'enum') return null;
    return (entry.descriptor as EnumDescriptor<string | number>).options.map(o => o.id);
  }

  toSchema() {
    return descriptorsToSchema(this.def.paramConfig);
  }

  transferValues(prev: Record<string, unknown>): Record<string, unknown> {
    return transferValues(this.def.paramConfig, prev);
  }

  private narrow<T>(key: string, kind: ParamDescriptor['kind']): T | undefined {
    const entry = this.param(key);
    if (!entry || entry.kind !== kind) return undefined;
    return entry as T;
  }
}

// ── Constrained accessor (constraint effects pre-applied) ──────────

class ConstrainedParamsAccessor implements ModelParamsAccessor {
  private readonly inner: ModelParamsAccessor;
  private readonly effects: Map<string, NormalizedRestriction>;

  constructor(inner: ModelParamsAccessor, effects: Map<string, NormalizedRestriction>) {
    this.inner = inner;
    this.effects = effects;
  }

  // ── Decorated accessors ──────────────────────────────────────────

  enum(key: string): EnumEntry | undefined { return this.applyEnum(key, this.inner.enum(key)); }
  range(key: string): RangeEntry | undefined { return this.applyEntry(key, this.inner.range(key)); }
  boolean(key: string): BooleanEntry | undefined { return this.applyEntry(key, this.inner.boolean(key)); }
  text(key: string): TextEntry | undefined { return this.applyEntry(key, this.inner.text(key)); }
  file(key: string): FileEntry | undefined { return this.applyEntry(key, this.inner.file(key)); }

  prompt(): TextEntry | undefined { return this.applyEntry('prompt', this.inner.prompt()); }
  aspectRatio(): EnumEntry | undefined { return this.applyEnum('aspectRatio', this.inner.aspectRatio()); }
  duration(): EnumEntry | undefined { return this.applyEnum('duration', this.inner.duration()); }
  resolution(): EnumEntry | undefined { return this.applyEnum('resolution', this.inner.resolution()); }
  generateAudio(): BooleanEntry | undefined { return this.applyEntry('generateAudio', this.inner.generateAudio()); }
  startFrame(): FileEntry | undefined { return this.applyEntry('startFrame', this.inner.startFrame()); }
  endFrame(): FileEntry | undefined { return this.applyEntry('endFrame', this.inner.endFrame()); }

  all(): FlatParamEntry[] {
    return this.inner.all().map(e => {
      const r = this.effects.get(e.key);
      if (!r) return e;
      if (e.kind === 'enum') return this.decorateEnumFlat(e, r);
      if (r.kind === 'disabled') return { ...e, disabled: true, disabledReason: r.reason };
      return e;
    });
  }

  // ── Pass-through delegates ───────────────────────────────────────

  param(key: string) { return this.inner.param(key); }
  hasParam(key: string) { return this.inner.hasParam(key); }
  hasFileInput() { return this.inner.hasFileInput(); }
  getDefault(key: string) { return this.inner.getDefault(key); }
  getDefaults() { return this.inner.getDefaults(); }
  getEnumOptions(key: string) { return this.inner.getEnumOptions(key); }
  toSchema() { return this.inner.toSchema(); }
  transferValues(prev: Record<string, unknown>) { return this.inner.transferValues(prev); }

  // ── Private helpers ──────────────────────────────────────────────

  private applyEntry<T extends { disabled?: boolean; disabledReason?: string }>(
    key: string, entry: T | undefined,
  ): T | undefined {
    if (!entry) return undefined;
    const r = this.effects.get(key);
    if (!r) return entry;
    if (r.kind === 'disabled') return { ...entry, disabled: true, disabledReason: r.reason };
    // kind === 'allowed' is meaningful only for enums; non-enum entries pass through.
    return entry;
  }

  private applyEnum(key: string, entry: EnumEntry | undefined): EnumEntry | undefined {
    if (!entry) return undefined;
    const r = this.effects.get(key);
    if (!r) return entry;

    if (r.kind === 'disabled') {
      const options = entry.options.map(opt => ({ ...opt, disabled: true, disabledReason: r.reason }));
      return { ...entry, options, disabled: true, disabledReason: r.reason };
    }

    const allowed = new Set(r.allowed.map(String));
    const options = entry.options.map(opt =>
      allowed.has(String(opt.id)) ? opt : { ...opt, disabled: true, disabledReason: r.reason },
    );
    return { ...entry, options };
  }

  private decorateEnumFlat(entry: FlatParamEntry, r: NormalizedRestriction): FlatParamEntry {
    if (entry.kind !== 'enum') return entry;

    if (r.kind === 'disabled') {
      const options = (entry.options as Array<{ id: string | number; label?: string }>).map(opt => ({
        ...opt,
        disabled: true,
        disabledReason: r.reason,
      }));
      return { ...entry, options, disabled: true, disabledReason: r.reason } as FlatParamEntry;
    }

    const allowed = new Set(r.allowed.map(String));
    const options = (entry.options as Array<{ id: string | number; label?: string }>).map(opt =>
      allowed.has(String(opt.id)) ? opt : { ...opt, disabled: true, disabledReason: r.reason },
    );
    return { ...entry, options } as FlatParamEntry;
  }
}

// ── ModelMeta implementation ────────────────────────────────────────

class ModelMetaImpl implements ModelMeta {
  readonly mode;
  readonly inputType;
  readonly description;
  readonly features;
  readonly badges;
  readonly provider: ProviderInfo;
  readonly release: ReleaseTag;

  constructor(def: ModelDefinition) {
    this.mode = def.mode;
    this.inputType = def.inputType;
    this.description = def.description;
    this.features = def.features;
    this.badges = def.badge ?? [];
    this.release = def.release ?? 'production';
    this.provider = {
      id: def.provider,
      name: def.providerName,
      color: def.providerColor,
      label: def.providerLabel,
    };
  }
}

// ── ModelDescriptor implementation ─────────────────────────────────

class ModelDescriptorImpl implements ModelDescriptor {
  readonly id: TypedModelId;
  readonly name: string;
  readonly api: ModelDescriptor['api'];
  private readonly def: ModelDefinition;
  private _params: ModelParamsAccessorImpl | undefined;
  private _meta: ModelMetaImpl | undefined;

  constructor(def: ModelDefinition) {
    this.id = def.id as TypedModelId;
    this.name = def.name;
    this.api = { workflow: def.workflow, editWorkflow: def.editWorkflow };
    this.def = def;
  }

  params(): ModelParamsAccessor {
    return this._params ??= new ModelParamsAccessorImpl(this.def);
  }

  paramsFor(values: Partial<GenerationContext>): ModelParamsAccessor {
    const inner = this.params();
    const effects = evaluateConstraints(this.def.constraints, values);
    if (!effects.size) return inner;
    return new ConstrainedParamsAccessor(inner, effects);
  }

  validate(input: unknown): ValidationResult {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return { valid: false, errors: [`Invalid input for model "${this.def.id}"`] };
    }
    try {
      validateAll(this.def.paramConfig, input as Record<string, unknown>);
      return { valid: true };
    } catch (err: unknown) {
      return { valid: false, errors: [err instanceof Error ? err.message : String(err)] };
    }
  }

  meta(): ModelMeta {
    return this._meta ??= new ModelMetaImpl(this.def);
  }

  getCreditsInfo(ctx?: CreditRangeContext): CreditRange | null {
    // Try modelId first (catalog's hint at the canonical/backend id), then fall back to id.
    if (this.def.modelId) {
      const byModelId = getCreditsForModel(this.def.modelId, ctx);
      if (byModelId) return byModelId;
    }
    return getCreditsForModel(this.def.id, ctx);
  }
}

// ── Model callable interface ───────────────────────────────────────

/** Look up a single model descriptor by id. */
type ModelFunction = (id: string) => ModelDescriptor;

// ── Factory ─────────────────────────────────────────────────────────

function _model(id: string): ModelDescriptor {
  return new ModelDescriptorImpl(resolveModel(id));
}

function _all(filter: { release?: readonly ReleaseTag[] } = {}): ModelDescriptor[] {
  const releases = filter.release ?? DEFAULT_VISIBLE_RELEASES;
  return ALL_MODELS
    .filter(m => isVisibleForReleases(m, releases))
    .map(m => new ModelDescriptorImpl(m));
}

function _find(filter: ModelFilter): ModelDescriptor[] {
  const releases = filter.release ?? DEFAULT_VISIBLE_RELEASES;
  return ALL_MODELS.filter(m => {
    if (!isVisibleForReleases(m, releases)) return false;
    if (filter.output && m.mode !== filter.output) return false;
    if (filter.provider && m.provider !== filter.provider) return false;
    return true;
  }).map(m => new ModelDescriptorImpl(m));
}

function _search(query: string, filter: { release?: readonly ReleaseTag[] } = {}): ModelDescriptor[] {
  const releases = filter.release ?? DEFAULT_VISIBLE_RELEASES;
  const q = query.toLowerCase();
  return ALL_MODELS.filter(m =>
    isVisibleForReleases(m, releases) && (
      m.id.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.provider.toLowerCase().includes(q)
    ),
  ).map(m => new ModelDescriptorImpl(m));
}

/** Look up a single model descriptor: `Model('flux-2-pro').params()`. */
export const Model: ModelFunction = _model;

/**
 * Model catalog + subsystem ops:
 *   catalog.all() / .find() / .search()
 *   catalog.pricing.configure(...) / .load() / .isLoaded()
 */
export const catalog = {
  all: _all,
  find: _find,
  search: _search,
  pricing: {
    configure: configurePricing,
    load: loadPricing,
    isLoaded: isPricingLoaded,
  },
};


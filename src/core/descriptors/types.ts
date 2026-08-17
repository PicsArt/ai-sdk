/**
 * Param Descriptor types — the new, open-ended parameter definition system.
 *
 * Each model defines `params: ModelParams` (a Record of ParamEntry).
 * Consumers iterate descriptors generically instead of switching on named ParamConfig fields.
 */

// ── Descriptor kinds ────────────────────────────────────────────────

export interface EnumOption<T extends string | number = string> {
  id: T;
  label?: string;
  disabled?: boolean;
  disabledReason?: string;
}

export interface EnumDescriptor<T extends string | number = string> {
  kind: 'enum';
  valueType: 'string' | 'number';
  options: Array<EnumOption<T>>;
  default: T;
}

/**
 * Free-string id served by a platform catalog task (voices/avatars). The id
 * space is open-ended — the live catalog is the source of truth — so the value
 * is validated only by type, never by membership. `source` says which task
 * serves the options; the entry's `catalogOptions` carries the seed (and,
 * after `ai.catalogs.voices/avatars`, the live list).
 */
export interface CatalogDescriptor {
  kind: 'catalog';
  /** Platform catalog task that serves this param's live options. */
  source: CatalogSource;
  default: string;
}

export interface RangeDescriptor {
  kind: 'range';
  min: number;
  max: number;
  step?: number;
  default: number;
}

export interface BooleanDescriptor {
  kind: 'boolean';
  default: boolean;
}

export interface TextDescriptor {
  kind: 'text';
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
}

export interface FileDescriptor {
  kind: 'file';
  accept: 'image' | 'video' | 'audio' | 'media';
  /** Present = array; absent = single. `min`/`max` bound the array length. */
  array?: { min?: number; max?: number };
  /**
   * Max intrinsic duration (seconds) accepted for a video/audio file. Enforced
   * client-side at upload by measuring the media before it is sent; the backend
   * worker stays the authoritative gate. Omit for no client-side cap.
   */
  maxDurationSec?: number;
  /**
   * Min intrinsic pixel count (width × height) accepted for an image/video file.
   * Enforced client-side at upload by measuring the media before it is sent; the
   * backend worker stays the authoritative gate. Omit for no client-side floor.
   */
  minPixels?: number;
  /**
   * Max intrinsic short-side length (pixels) accepted for an image/video file —
   * `min(width, height)` must not exceed this. Used by upscalers whose source
   * must stay below the target resolution. Enforced client-side at upload by
   * measuring the media before it is sent; the backend worker stays the
   * authoritative gate. Omit for no client-side ceiling.
   */
  maxShortSidePixels?: number;
  /**
   * Max file size in bytes accepted for this slot (e.g. Seedance 2.5 reference
   * videos are capped at 200 MiB by the vendor). Enforced client-side at upload
   * by measuring the file (or its `Content-Length`) before it is sent; the
   * backend worker stays the authoritative gate. Omit for no client-side cap.
   */
  maxBytes?: number;
}

export interface ObjectDescriptor {
  kind: 'object';
  /** Nested fields use the flat EntryMeta + Descriptor merge — same shape as
   *  EnumEntry / RangeEntry / etc. Authors can mark a nested field optional
   *  by setting `required: false`. Default is required. */
  fields: Record<string, EntryMeta & ParamDescriptor>;
  array?: { min?: number; max?: number };
}

export type ParamDescriptor =
  | EnumDescriptor<string>
  | EnumDescriptor<number>
  | CatalogDescriptor
  | RangeDescriptor
  | BooleanDescriptor
  | TextDescriptor
  | FileDescriptor
  | ObjectDescriptor;

export interface ParamEntry {
  label?: string;
  required?: boolean;
  /**
   * Role of a file input relative to the output. Drives prompt-area filmstrip
   * grouping: assets first, divider only when both groups are present, then
   * references. Only meaningful for `kind: 'file'` descriptors.
   *
   * - `asset`: direct input that becomes part of the output (start/end frame, sync audio)
   * - `reference`: guidance signal that influences the result (style/character/motion ref)
   */
  category?: 'asset' | 'reference';
  descriptor: ParamDescriptor;
  /** Original rich option objects (e.g. VoiceOption[], AvatarOption[]) preserved for UI catalogs. */
  catalogOptions?: readonly unknown[];
}

export type ModelParams = Record<string, ParamEntry>;

// ── Narrowed entries (flat — no .descriptor nesting) ─────────────────
// New format: descriptor fields are merged directly onto the entry.
// These are returned by ModelAccessor well-known shorthands.

export interface EntryMeta {
  label?: string;
  required?: boolean;
  category?: 'asset' | 'reference';
  catalogOptions?: readonly unknown[];
  disabled?: boolean;
  disabledReason?: string;
}

export type EnumEntry = EntryMeta & EnumDescriptor<string | number>;
export type CatalogEntry = EntryMeta & CatalogDescriptor;
export type RangeEntry = EntryMeta & RangeDescriptor;
export type BooleanEntry = EntryMeta & BooleanDescriptor;
export type TextEntry = EntryMeta & TextDescriptor;
export type FileEntry = EntryMeta & FileDescriptor;
export type ObjectEntry = EntryMeta & ObjectDescriptor;

/** Flat param entry with key — returned by ModelAccessor.params(). */
export type FlatParamEntry = EntryMeta & ParamDescriptor & { key: string };

// ── Model accessor types ────────────────────────────────────────────

import type { GenerationMode, InputType, ModelFeature, BadgeType, Provider, GenerationContext, ReleaseTag } from '../types.ts';
import type { ModelParamSchema } from '../schema.ts';
import type { CatalogSource } from '../catalogs.ts';

/** Provider metadata. */
export interface ProviderInfo {
  readonly id: Provider;
  readonly name: string;
  readonly color: string;
  readonly label: string;
}

/** Model metadata — classification, display, provider. */
export interface ModelMeta {
  readonly mode: GenerationMode;
  readonly inputType: InputType;
  readonly description: string;
  readonly features: ModelFeature[];
  readonly badges: BadgeType[];
  readonly provider: ProviderInfo;
  /** ISO YYYY-MM-DD date the model was added to the catalog, or null if unknown. */
  readonly addedAt: string | null;
  /** Release / availability tier. Absent on the definition ⇒ `'production'`. */
  readonly release: ReleaseTag;
}

/** Parameter operations — fluent access to model params, schemas, defaults. */
export interface ModelParamsAccessor {
  param(key: string): (EntryMeta & ParamDescriptor) | undefined;
  hasParam(key: string): boolean;
  all(): FlatParamEntry[];

  // Kind-narrowed accessors
  enum(key: string): EnumEntry | undefined;
  /** Catalog params (`kind: 'catalog'`) — free-string ids; options live in `catalogOptions`. */
  catalog(key: string): CatalogEntry | undefined;
  range(key: string): RangeEntry | undefined;
  boolean(key: string): BooleanEntry | undefined;
  text(key: string): TextEntry | undefined;
  file(key: string): FileEntry | undefined;

  // Well-known shorthands
  prompt(): TextEntry | undefined;
  aspectRatio(): EnumEntry | undefined;
  duration(): EnumEntry | undefined;
  resolution(): EnumEntry | undefined;
  generateAudio(): BooleanEntry | undefined;
  startFrame(): FileEntry | undefined;
  endFrame(): FileEntry | undefined;

  // Absorbed from Models namespace
  hasFileInput(): boolean;
  getDefault(key: string): unknown;
  getDefaults(): Record<string, unknown>;
  /** @deprecated Use `enum(key)` instead — returns full `EnumEntry` with `.options`, `.default`, etc. */
  getEnumOptions(key: string): (string | number)[] | null;
  toSchema(): ModelParamSchema;
  transferValues(prev: Record<string, unknown>): Record<string, unknown>;
}

import type { TypedModelId } from '../../generated/model-input-types.ts';

/** Credit range for a model — min/max credits across all pricing variants. */
export interface CreditRange {
  min: number;
  max: number;
  /** Pricing unit (e.g. 'generation', 'second', 'megapixel'). Set when all matched entries share a unit. */
  unit?: string;
  /** Per-tier breakdown behind the range — one entry per pricing row (quality /
   *  audio / token-type variant). Reflects the entries the range summarizes
   *  (all tiers, or the ctx-filtered subset). */
  tiers: CreditTier[];
}

/** Optional context to narrow the credit range by resolution / audio. */
export interface CreditRangeContext {
  resolution?: string;
  generateAudio?: boolean;
}

/** A single pricing tier for a model — one row of its rate table. */
export interface CreditTier {
  /** Credits charged per `unit`. */
  credits: number;
  /** Billing unit (e.g. 'generation', 'second', 'megapixel', 'output_text_tokens'). */
  unit: string;
  /** Quality/resolution variant this rate applies to, when priced by quality. */
  quality?: string;
  /** Whether this rate is for audio-enabled generation. */
  audio?: boolean;
  /** Use case this rate applies to (e.g. 'text-to-video'). */
  useCase?: string;
}

/** Top-level model accessor with grouped sub-accessors. */
/** Result of validating generation input against a model's params. */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface ModelDescriptor {
  readonly id: TypedModelId;
  readonly name: string;
  params(): ModelParamsAccessor;
  /** Params with constraint effects pre-applied (disabled options, hidden params). */
  paramsFor(values: Partial<GenerationContext>): ModelParamsAccessor;
  meta(): ModelMeta;
  /** Validate generation input against this model's params. Returns
   *  `{ valid: true }` or `{ valid: false, errors }` — never throws. */
  validate(input: unknown): ValidationResult;
  /** Get the credit range for this model, plus the per-tier breakdown in
   *  `.tiers`. Pass context to narrow by resolution/audio. Returns the per-unit
   *  range — callers with time-based parameters should scale by the value
   *  themselves (e.g. multiply by duration when range.unit === 'second').
   *  Returns null if pricing is not loaded or the model has no entry. */
  getCreditsInfo(ctx?: CreditRangeContext): CreditRange | null;
  /** Workflow identifiers for this model. */
  readonly api: {
    /** Primary workflow name for generation. */
    readonly workflow: string;
    /** Edit/I2V workflow name (when different from primary). */
    readonly editWorkflow: string | undefined;
  };
}


// ── Model catalog filter types ─────────────────────────────────────

/** Filter criteria for `catalog.find()`. */
export interface ModelFilter {
  output?: GenerationMode;
  provider?: string;
  /**
   * Release tiers to include. Omitted ⇒ the default visible set
   * (`['production', 'general-availability']`). List the tiers you want
   * explicitly to opt into `preview` — e.g. `['preview']` for stage-only
   * models, or all three to include everything. `disabled`/`deprecated`
   * models stay hidden regardless.
   */
  release?: ReleaseTag[];
}

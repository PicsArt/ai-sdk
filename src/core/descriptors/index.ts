// ── Types ────────────────────────────────────────────────────────────
export type {
  ParamDescriptor,
  ParamEntry,
  ModelParams,
  EnumDescriptor,
  EnumOption,
  CatalogDescriptor,
  RangeDescriptor,
  BooleanDescriptor,
  TextDescriptor,
  FileDescriptor,
  ObjectDescriptor,
  EnumEntry,
  CatalogEntry,
  RangeEntry,
  BooleanEntry,
  TextEntry,
  FileEntry,
  ObjectEntry,
  EntryMeta,
  FlatParamEntry,
  ModelDescriptor,
  ModelFilter,
  ValidationResult,
  ModelParamsAccessor,
  ModelMeta,
  ProviderInfo,
  CreditRange,
  CreditRangeContext,
} from './types.ts';

// ── Utilities ────────────────────────────────────────────────────────
export {
  extractDefaults,
  validateDescriptor,
  validateAll,
  descriptorsToSchema,
  transferValues,
} from './utils.ts';

// ── Presets ──────────────────────────────────────────────────────────
export { p } from './presets.ts';

// ── Model accessor ──────────────────────────────────────────────────
export { Model, catalog } from './model-accessor.ts';

// ── Pricing types ───────────────────────────────────────────────────
export type { PricingOptions } from './pricing.ts';

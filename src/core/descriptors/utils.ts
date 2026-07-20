/**
 * Generic utilities operating on ModelParams (the descriptor-based param system).
 *
 * These provide generic loops for default extraction, validation,
 * schema generation, and value transfer.
 */

import type {
  ModelParams,
  ParamDescriptor,
  EnumDescriptor,
} from './types.ts';
import type { ModelParamSchema } from '../schema.ts';

// ── Default extraction ──────────────────────────────────────────────

/** Extract default values from a ModelParams record. */
export function extractDefaults(params: ModelParams): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(params)) {
    const d = entry.descriptor;
    if ('default' in d) {
      defaults[key] = d.default;
    }
  }
  return defaults;
}

// ── Validation ──────────────────────────────────────────────────────

/** Validate a single value against its descriptor. Throws on invalid. */
export function validateDescriptor(
  key: string,
  d: ParamDescriptor,
  val: unknown,
  required?: boolean,
): void {
  if (val == null
    || (required && typeof val === 'string' && val.trim().length === 0)
    || (required && Array.isArray(val) && val.length === 0)) {
    if (required) {
      throw new Error(`"${key}" is required`);
    }
    if (val == null) return;
  }

  switch (d.kind) {
    case 'enum': {
      const ids = (d as EnumDescriptor<string | number>).options.map(
        (o) => o.id,
      );
      // Empty options = runtime-hydrated catalog; live catalog is the source of truth.
      if (ids.length === 0) break;
      if (!ids.includes(val as string | number)) {
        throw new Error(
          `"${key}" must be one of: ${ids.join(', ')}`,
        );
      }
      break;
    }
    case 'range':
      if (typeof val !== 'number' || Number.isNaN(val)) {
        throw new Error(`"${key}" must be a number`);
      }
      if (val < d.min || val > d.max) {
        throw new Error(
          `"${key}" must be between ${d.min} and ${d.max}`,
        );
      }
      break;
    case 'boolean':
      if (typeof val !== 'boolean') {
        throw new Error(`"${key}" must be a boolean`);
      }
      break;
    case 'text':
      if (typeof val !== 'string') {
        throw new Error(`"${key}" must be a string`);
      }
      if (d.minLength && val.trim().length < d.minLength) {
        throw new Error(
          `"${key}" must be at least ${d.minLength} characters`,
        );
      }
      if (d.maxLength && val.length > d.maxLength) {
        throw new Error(
          `"${key}" exceeds max length of ${d.maxLength}`,
        );
      }
      break;
    case 'file':
      if (d.array) {
        if (!Array.isArray(val)) throw new Error(`"${key}" must be an array of URLs`);
        if (d.array.min != null && val.length < d.array.min) {
          throw new Error(`"${key}" needs at least ${d.array.min} items`);
        }
        if (d.array.max != null && val.length > d.array.max) {
          throw new Error(`"${key}" allows at most ${d.array.max} items`);
        }
      } else {
        if (typeof val !== 'string') throw new Error(`"${key}" must be a string URL`);
      }
      break;
    case 'object': {
      if (d.array && !Array.isArray(val)) {
        throw new Error(`"${key}" must be an array`);
      }
      const items = d.array
        ? (val as Record<string, unknown>[])
        : [val as Record<string, unknown>];
      if (d.array?.min != null && items.length < d.array.min) {
        throw new Error(
          `"${key}" needs at least ${d.array.min} items`,
        );
      }
      if (d.array?.max != null && items.length > d.array.max) {
        throw new Error(
          `"${key}" allows at most ${d.array.max} items`,
        );
      }
      for (const item of items) {
        if (item == null || typeof item !== 'object' || Array.isArray(item)) {
          throw new Error(`"${key}" items must be objects`);
        }
        for (const [fk, fd] of Object.entries(d.fields)) {
          validateDescriptor(`${key}.${fk}`, fd, item[fk]);
        }
      }
      break;
    }
  }
}

/** Validate all input values against a ModelParams record. Throws on first error. */
export function validateAll(
  params: ModelParams,
  input: Record<string, unknown>,
): void {
  for (const [key, entry] of Object.entries(params)) {
    validateDescriptor(key, entry.descriptor, input[key], entry.required);
  }
}

// ── Schema export ───────────────────────────────────────────────────

/** Convert ModelParams to a JSON-serializable ModelParamSchema. */
export function descriptorsToSchema(params: ModelParams): ModelParamSchema {
  const schema: ModelParamSchema = {};

  for (const [key, entry] of Object.entries(params)) {
    const d = entry.descriptor;
    switch (d.kind) {
      case 'enum': {
        const e = d as EnumDescriptor<string | number>;
        schema[key] = {
          type: e.valueType,
          enum: e.options.map((o) => o.id),
          default: e.default,
        };
        break;
      }
      case 'range':
        schema[key] = {
          type: 'number',
          min: d.min,
          max: d.max,
          step: d.step,
          default: d.default,
        };
        break;
      case 'boolean':
        schema[key] = {
          type: 'boolean',
          default: d.default,
        };
        break;
      case 'text':
        schema[key] = {
          type: 'string',
          label: entry.label,
        };
        break;
      case 'file':
        schema[key] = {
          type: 'file',
          required: entry.required,
          label: entry.label,
          accept: d.accept,
        };
        break;
      // object descriptors are not exported to flat JSON schema
    }
  }

  return schema;
}

// ── Value transfer (model switch) ───────────────────────────────────

/**
 * Coerce a previous value to fit the new descriptor's array shape and bounds.
 * Handles single↔array shape mismatches and trims to `array.max`.
 * Returns `undefined` when nothing usable remains.
 */
function coerceArrayShape(
  prevVal: unknown,
  arrayConfig: { min?: number; max?: number } | undefined,
  isEmpty: (v: unknown) => boolean,
): unknown {
  if (arrayConfig) {
    const max = arrayConfig.max ?? Infinity;
    const arr = Array.isArray(prevVal) ? prevVal : [prevVal];
    const trimmed = arr.filter((v) => !isEmpty(v)).slice(0, max);
    return trimmed.length > 0 ? trimmed : undefined;
  }
  const single = Array.isArray(prevVal) ? prevVal[0] : prevVal;
  return isEmpty(single) ? undefined : single;
}

/**
 * Transfer values from a previous context to a new model's params.
 * Preserves values that are compatible, falls back to defaults.
 */
export function transferValues(
  newParams: ModelParams,
  prev: Record<string, unknown>,
): Record<string, unknown> {
  const ctx = extractDefaults(newParams);

  for (const [key, entry] of Object.entries(newParams)) {
    const prevVal = prev[key];
    if (prevVal == null) continue;

    const d = entry.descriptor;
    switch (d.kind) {
      case 'enum': {
        const ids = (d as EnumDescriptor<string | number>).options.map(
          (o) => o.id,
        );
        if (ids.includes(prevVal as string | number)) {
          ctx[key] = prevVal;
        }
        break;
      }
      case 'range':
        if (typeof prevVal === 'number') {
          ctx[key] = Math.min(Math.max(prevVal, d.min), d.max);
        }
        break;
      case 'boolean':
        if (typeof prevVal === 'boolean') {
          ctx[key] = prevVal;
        }
        break;
      case 'text':
        if (typeof prevVal === 'string') {
          ctx[key] = d.maxLength != null ? prevVal.slice(0, d.maxLength) : prevVal;
        }
        break;
      case 'file': {
        const next = coerceArrayShape(prevVal, d.array, (v) => v == null || v === '');
        if (next !== undefined) ctx[key] = next;
        break;
      }
      case 'object': {
        const next = coerceArrayShape(prevVal, d.array, (v) => v == null);
        if (next !== undefined) ctx[key] = next;
        break;
      }
      default:
        ctx[key] = prevVal;
    }
  }

  return ctx;
}

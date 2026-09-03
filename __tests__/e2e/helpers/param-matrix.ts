/**
 * Matrix expansion — generates test combinations from a model's paramConfig.
 *
 * Axes:
 *  1. Pricing-relevant enum/boolean/range params (duration, resolution, etc.)
 *  2. Optional file params → with/without variants. If "without" fails OPTIONS,
 *     that's a real bug (param marked optional but backend requires it).
 *
 * Ported verbatim from an earlier in-house harness (import paths adjusted).
 */
import { Model } from '../../../src/index.ts';
import type { ParamEntry } from '../../../src/index.ts';
import type { CatalogEntry } from './catalog-loader.ts';
import { getOptionalFileParams, getTestAssetUrl } from './catalog-loader.ts';

/** Axes that affect pricing (mirrored from buildPricingKey). */
const PRICING_AXES = new Set([
  'duration',
  'resolution',
  'quality',
  'size',
  'generateAudio',
  'renderingSpeed',
  'outputMegapixels',
]);

export interface MatrixCase {
  /** Human-readable label for the test name. */
  label: string;
  /** Param overrides to merge onto default context before buildPayload. */
  params: Record<string, unknown>;
}

export interface ExpandOptions {
  /**
   * 'generate' (default): optional file params expand into [with-asset, without].
   * 'edit': source-asset params (imageUrls, startFrame, videoUrl, audioUrl) are
   * always filled — you can't edit nothing. The "without" variant is dropped.
   */
  mode?: 'generate' | 'edit';
}

/** File-param keys that represent the *source* asset for edit/I2V workflows. */
const EDIT_SOURCE_KEYS = new Set(['imageUrls', 'startFrame', 'videoUrl', 'audioUrl']);

/**
 * Expand a model's paramConfig into a list of test cases — the Cartesian product
 * of pricing-relevant values and optional file params (with/without, or
 * always-with in edit mode).
 */
export function expandMatrix(entry: CatalogEntry, options: ExpandOptions = {}): MatrixCase[] {
  const editMode = options.mode === 'edit';
  const axes: Array<{ key: string; values: Array<string | number | boolean | string[] | undefined> }> = [];

  // Pricing-relevant axes
  for (const [key, paramEntry] of Object.entries(entry.raw.paramConfig)) {
    if (!PRICING_AXES.has(key)) continue;
    const values = extractValues(paramEntry);
    if (values.length > 0) axes.push({ key, values });
  }

  // Optional file param axes: [with-asset, without]. Source assets forced in edit mode.
  const optionalFiles = getOptionalFileParams(entry.raw);
  for (const { key, accept, isArray } of optionalFiles) {
    const url = getTestAssetUrl(accept);
    const value = isArray ? [url] : url;
    const forceFilled = editMode && EDIT_SOURCE_KEYS.has(key);
    axes.push({
      key,
      values: forceFilled
        ? [value]
        : ([value, undefined] as Array<string | number | boolean | string[] | undefined>),
    });
  }

  if (axes.length === 0) return [{ label: 'default', params: {} }];

  const allCases = cartesian(axes);
  // Drop combos that violate declared model constraints (e.g. audio-only modes).
  if (!entry.raw.constraints?.length) return allCases;
  return allCases.filter((c) => isValidCombo(entry, c.params));
}

/**
 * True if the combo's choices don't trip any of the model's constraint rules.
 * Uses Model(id).paramsFor(ctx) — the same path the UI takes.
 */
function isValidCombo(entry: CatalogEntry, params: Record<string, unknown>): boolean {
  const ctx = entry.buildContext(params);
  const accessor = Model(entry.id).paramsFor(ctx);
  for (const flat of accessor.all()) {
    if (flat.disabled) {
      if (params[flat.key] !== undefined) return false;
      continue;
    }
    if (flat.kind === 'enum') {
      const val = params[flat.key];
      if (val === undefined) continue;
      const opt = flat.options.find((o) => String(o.id) === String(val));
      if (opt?.disabled) return false;
    }
  }
  return true;
}

function extractValues(entry: ParamEntry): Array<string | number | boolean> {
  const d = entry.descriptor;
  switch (d.kind) {
    case 'enum':
      return d.options.map((o) => o.id);
    case 'boolean':
      return [true, false];
    case 'range':
      // default is optional (e.g. seed) — expand only the defined values.
      return [...new Set([d.min, d.default, d.max])].filter((v): v is number => v !== undefined);
    default:
      return [];
  }
}

function cartesian(
  axes: Array<{ key: string; values: Array<string | number | boolean | string[] | undefined> }>,
): MatrixCase[] {
  const results: MatrixCase[] = [];

  function recurse(index: number, current: Record<string, unknown>, parts: string[]) {
    if (index === axes.length) {
      results.push({ label: parts.join('·') || 'default', params: { ...current } });
      return;
    }
    const { key, values } = axes[index];
    for (const val of values) {
      const partLabel = val === undefined ? `no-${key}` : `${key}=${val}`;
      const next = { ...current };
      if (val !== undefined) next[key] = val;
      recurse(index + 1, next, [...parts, partLabel]);
    }
  }

  recurse(0, {}, []);
  return results;
}

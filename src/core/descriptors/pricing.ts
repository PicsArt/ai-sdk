/**
 * Pricing internals — owns the ModelPricingClient, the per-model cache, and
 * the credit-range lookup. The Model accessor delegates to the helpers below
 * so that model-accessor.ts stays focused on descriptor logic.
 *
 * Configure once via `configurePricing(client)` from the app layer (the app
 * builds the client with its authenticated fetch and base URL), then call
 * `loadPricing()` to populate the cache. After that, `getCreditsForModel(id, ctx)`
 * resolves synchronously.
 */

import {
  ModelPricingClient,
  type ModelPricing,
  type ModelPricingClientOptions,
} from '@picsart/pa-model-pricing-sdk';
import type { CreditRange, CreditRangeContext, CreditTier } from './types.ts';

/** Options for configuring the pricing source. The SDK constructs the underlying client. */
export type PricingOptions = ModelPricingClientOptions;

let _client: ModelPricingClient | null = null;
let _byModel: Map<string, ModelPricing[]> | null = null;
let _loadPromise: Promise<void> | null = null;

/** Configure the pricing source. Resets any prior cache so the next loadPricing() re-runs. */
export function configurePricing(options: PricingOptions): void {
  _client = new ModelPricingClient(options);
  _byModel = null;
  _loadPromise = null;
}

/**
 * Load pricing into an in-memory map keyed by `metadata.modelId`.
 * Idempotent on success; rejected loads clear `_loadPromise` so the next call retries.
 * Returns a rejected promise (not a sync throw) when the client is not configured.
 */
export function loadPricing(): Promise<void> {
  if (_byModel) return Promise.resolve();
  if (!_client) {
    return Promise.reject(new Error(
      'loadPricing(): not configured. Call catalog.pricing.configure({ baseUrl, fetch }) first.',
    ));
  }
  if (!_loadPromise) {
    const client = _client;
    _loadPromise = client.init().then(() => {
      const byModel = new Map<string, ModelPricing[]>();
      for (const entry of client.getModelPricing()) {
        const id = entry.metadata.modelId;
        const list = byModel.get(id);
        if (list) list.push(entry);
        else byModel.set(id, [entry]);
      }
      _byModel = byModel;
    }).catch((err) => {
      _loadPromise = null;
      throw err;
    });
  }
  return _loadPromise;
}

export function isPricingLoaded(): boolean {
  return _byModel !== null;
}

/**
 * Resolve a credit range for a model, optionally narrowed by ctx.
 * `ctx.generateAudio` maps to `metadata.audio`; `ctx.resolution` to `metadata.quality`.
 * Returns the per-unit range; callers with time-based params (e.g. duration)
 * should scale by the unit themselves.
 */
export function getCreditsForModel(
  modelId: string,
  ctx?: CreditRangeContext,
): CreditRange | null {
  if (!_byModel) return null;
  let entries = _byModel.get(modelId);
  if (!entries || entries.length === 0) return null;

  if (ctx) {
    entries = entries.filter((e) => {
      if (ctx.generateAudio !== undefined && e.metadata.audio !== ctx.generateAudio) return false;
      if (ctx.resolution !== undefined && e.metadata.quality !== ctx.resolution) return false;
      return true;
    });
    if (entries.length === 0) return null;
  }

  let min = Infinity;
  let max = -Infinity;
  let unit: string | undefined = entries[0].unit;
  for (const e of entries) {
    if (e.credits < min) min = e.credits;
    if (e.credits > max) max = e.credits;
    if (e.unit !== unit) unit = undefined;
  }
  const tiers: CreditTier[] = entries.map((e) => ({
    credits: e.credits,
    unit: e.unit,
    quality: e.metadata.quality || undefined,
    audio: e.metadata.audio,
    useCase: e.metadata.useCase,
  }));
  return unit ? { min, max, unit, tiers } : { min, max, tiers };
}

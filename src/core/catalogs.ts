/**
 * Runtime catalogs — the standard format served by the platform
 * `<vendor>/v1/catalog/<voices|avatars|…>` tasks (voices, avatars, effect
 * templates), plus the in-memory hydration registry that lets runtime-fetched
 * catalogs back the descriptor system.
 *
 * The wire types mirror the shared backend contract (`@picsart/pa-genai-common`);
 * the SDK owns its own copy so it carries no backend dependency.
 */

import type { Provider, VoiceOption, AvatarOption } from './types.ts';

// ── Wire contract ───────────────────────────────────────────────────

export interface CatalogPreview {
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
}

export interface CatalogItem {
  /** Vendor-native id, sent back verbatim on generate as the bound param's value. */
  id: string;
  name: string;
  description?: string;
  /** Facets for filtering: gender, language, age, accent, tone, … */
  tags: string[];
  preview?: CatalogPreview;
  /** Vendor extras, e.g. `defaultVoiceId` on HeyGen avatars. */
  meta?: Record<string, unknown>;
}

export interface CatalogQuery {
  /** Worker-side filter (e.g. the seed-audio model variant on bytedance). */
  modelId?: string;
  /** Opaque cursor from a previous page. */
  cursor?: string;
  /** Page size. Every catalog task accepts up to 100. */
  limit?: number;
}

export interface CatalogResult {
  items: CatalogItem[];
  /** Crawl date or curation stamp identifying the snapshot. */
  version: string;
  /** How long the caller may cache this response. */
  ttlSeconds: number;
  /** `null` when the list is complete. */
  nextCursor: string | null;
}

/** Binds a param's options to a platform catalog task. */
export interface CatalogSource {
  /** Catalog workflow name, e.g. `heygen/v1/catalog/voices`. */
  workflow: string;
  /** Worker-side filter passed on fetch. */
  modelId?: string;
}

// ── Item → UI-option adapters ───────────────────────────────────────

const metaString = (item: CatalogItem, key: string): string | undefined => {
  const v = item.meta?.[key];
  return typeof v === 'string' ? v : undefined;
};

export function toVoiceOption(item: CatalogItem, provider: Provider): VoiceOption {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    tags: item.tags,
    provider,
    previewUrl: item.preview?.audioUrl,
  };
}

export function toAvatarOption(item: CatalogItem, provider: Provider): AvatarOption {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    tags: item.tags,
    provider,
    previewImageUrl: item.preview?.imageUrl,
    previewVideoUrl: item.preview?.videoUrl,
    gender: metaString(item, 'gender'),
    defaultVoiceId: metaString(item, 'defaultVoiceId'),
  };
}

// ── Hydration registry ──────────────────────────────────────────────
// Module-level, like the pricing cache: `ai.catalogs` installs fetched
// catalogs here; descriptor accessors read synchronously. Process-global:
// clients share it, and the last install wins — two clients pointing at
// different backends (stage/prod) would overwrite each other's hydration.

export interface HydratedCatalog {
  /** Param key the catalog serves ('voiceId' | 'videoId' | 'templateId' | …). */
  paramKey: string;
  items: CatalogItem[];
  /** Enum options ready to merge into a descriptor. */
  options: Array<{ id: string; label: string }>;
  /**
   * Rich option objects for `catalogOptions`: VoiceOption[] / AvatarOption[]
   * for voiceId/videoId, raw CatalogItem[] for every other param key.
   */
  catalogOptions: readonly unknown[];
  version: string;
}

const registry = new Map<string, HydratedCatalog>();

const keyOf = (s: CatalogSource) => `${s.workflow} ${s.modelId ?? ''}`;

/**
 * Per-param-key item→option adapters. Keys without an adapter hydrate as raw
 * `CatalogItem[]` — the item itself is the generic UI option (name, tags,
 * preview, meta).
 */
const OPTION_ADAPTERS: Record<string, (item: CatalogItem, provider: Provider) => unknown> = {
  voiceId: toVoiceOption,
  videoId: toAvatarOption,
};

export function installHydratedCatalog(
  source: CatalogSource,
  paramKey: string,
  items: CatalogItem[],
  provider: Provider,
  version: string,
): void {
  const adapt = OPTION_ADAPTERS[paramKey];
  registry.set(keyOf(source), {
    paramKey,
    items,
    options: items.map((i) => ({ id: i.id, label: i.name })),
    catalogOptions: adapt ? items.map((i) => adapt(i, provider)) : items,
    version,
  });
}

export function getHydratedCatalog(source: CatalogSource): HydratedCatalog | undefined {
  return registry.get(keyOf(source));
}

/** All hydrated voices across sources — merged into `getVoiceById` lookups. */
export function getHydratedVoices(): VoiceOption[] {
  const out: VoiceOption[] = [];
  for (const c of registry.values()) {
    if (c.paramKey === 'voiceId') out.push(...(c.catalogOptions as VoiceOption[]));
  }
  return out;
}

export function clearHydratedCatalogs(): void {
  registry.clear();
}

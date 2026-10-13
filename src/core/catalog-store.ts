// ── Model catalog store ──────────────────────────────────────────────
// Owns the one dynamic catalog load per process: fetch `/v1/models-catalog`,
// deserialize, install as the active catalog. Mirrors the pricing cache's
// configure/load shape (core/descriptors/pricing.ts): module-level state,
// idempotent load with in-flight dedup, rejected loads clear the promise so
// the next call retries. Process-global like the active catalog itself —
// a second load against a different url/filters key is rejected rather than
// letting two backends fight over module state.

import type { GenerationMode, ReleaseTag } from './types.ts';
import { deserializeCatalog } from './catalog-wire.ts';
import { installCatalog } from './active-catalog.ts';
import { ApiError, codeForStatus } from './errors.ts';
import type { AuthenticatedFetch } from '../client/types.ts';

/** Catalog query filters — map 1:1 onto `/v1/models-catalog` query params. */
export interface ModelCatalogFilters {
  /** Restrict to one or more generation modes (`video`, `image`, …). */
  mode?: GenerationMode | GenerationMode[];
  /** Restrict to one or more provider ids. */
  provider?: string | string[];
  /** Release tiers to request. Server default: production + general-availability. */
  release?: ReleaseTag | ReleaseTag[];
  /** Include models flagged deprecated. */
  includeDeprecated?: boolean;
  /** Free-text search across id / name / provider. */
  search?: string;
}

/** The models-catalog endpoint, relative to the API base URL. */
const CATALOG_PATH = '/gw-v2/v1/models-catalog';

let _loadPromise: Promise<void> | null = null;
let _loaded = false;
let _key: string | null = null;

const keyOf = (apiUrl: string, filters: ModelCatalogFilters | undefined): string =>
  `${apiUrl}::${JSON.stringify(filters ?? {})}`;

function buildQuery(filters: ModelCatalogFilters | undefined): string {
  const query = new URLSearchParams();
  query.set('include', 'schema,constraints,routing');
  const join = (v: string | string[]) => (Array.isArray(v) ? v.join(',') : v);
  if (filters?.mode) query.set('mode', join(filters.mode));
  if (filters?.provider) query.set('provider', join(filters.provider));
  if (filters?.release) query.set('release', join(filters.release));
  if (filters?.includeDeprecated) query.set('includeDeprecated', 'true');
  if (filters?.search) query.set('search', filters.search);
  return query.toString();
}

async function fetchAndInstall(f: AuthenticatedFetch, apiUrl: string, filters?: ModelCatalogFilters): Promise<void> {
  const url = `${apiUrl.replace(/\/+$/, '')}${CATALOG_PATH}?${buildQuery(filters)}`;
  const res = await f(url, { method: 'GET' });
  if (!res.ok) {
    let reason: string | undefined;
    let message = `Model catalog request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as { reason?: string; message?: string };
      reason = body?.reason;
      if (body?.message) message = body.message;
    } catch {
      // non-JSON error body — keep the status message
    }
    throw new ApiError(message, { status: res.status, code: reason ?? codeForStatus(res.status) });
  }
  const models = deserializeCatalog(await res.json());
  installCatalog(models);
}

/**
 * Load the model catalog from `${apiUrl}/gw-v2/v1/models-catalog` and install
 * it as the active catalog. `f` is the client's authenticated fetch — it owns
 * the credentials (same convention as the Drive client).
 * Idempotent: repeat/concurrent calls with the same apiUrl+filters share one
 * load. A failed load clears the state so the next call retries. A call with
 * a *different* apiUrl or filters while a load is in flight or settled rejects
 * with 409 `catalog_conflict` — one catalog source per process.
 */
export function loadModelCatalog(f: AuthenticatedFetch, apiUrl: string, filters?: ModelCatalogFilters): Promise<void> {
  const key = keyOf(apiUrl, filters);
  if (_loadPromise) {
    if (_key !== key) {
      return Promise.reject(new ApiError(
        `Model catalog already ${_loaded ? 'loaded' : 'loading'} from "${_key?.split('::')[0]}" — one catalog source per process.`,
        { status: 409, code: 'catalog_conflict' },
      ));
    }
    return _loadPromise;
  }
  _key = key;
  _loadPromise = fetchAndInstall(f, apiUrl, filters).then(() => {
    _loaded = true;
  }).catch((err) => {
    _loadPromise = null;
    _key = null;
    throw err;
  });
  return _loadPromise;
}

/**
 * The in-flight or settled-success load promise, or null when no load has
 * been started (or the last one failed). Backs `ai.validate()`'s wait.
 */
export function whenModelCatalogLoaded(): Promise<void> | null {
  return _loadPromise;
}

export function isModelCatalogLoaded(): boolean {
  return _loaded;
}

/** Test-only: forget any load so the next loadModelCatalog starts fresh. */
export function __resetModelCatalogStoreForTests(): void {
  _loadPromise = null;
  _loaded = false;
  _key = null;
}

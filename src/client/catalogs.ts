/**
 * ai.catalogs — runtime access to the platform catalog tasks
 * (`<vendor>/v1/catalog/<voices|avatars|…>`) serving any catalog-bound param
 * (`kind: 'catalog'` descriptor): voices, avatars, effect templates.
 *
 * Loading is page-by-page: each call fetches ONE page (UI loads more on
 * scroll/pagination via `nextCursor`). Pages are cached per the `ttlSeconds`
 * the platform returns, concurrent fetches of the same page collapse, and
 * every fetched page is appended to the options installed on the model so
 * `Model(id).params()` (and every picker built on it) sees what has been
 * loaded so far. With `createClient({ catalogs: { preload: true } })` the
 * first page of every bound catalog loads in the background at client
 * creation.
 */

import type { SdkTransport } from '../core/workflow.ts';
import type { ModelDefinition } from '../core/types.ts';
import type { TypedModelId } from '../generated/model-input-types.ts';
import type { CatalogItem, CatalogQuery, CatalogResult, CatalogSource } from '../core/catalogs.ts';
import { installHydratedCatalog } from '../core/catalogs.ts';
import { resolveModel } from '../core/resolve.ts';
import { ALL_MODELS } from '../vendors/catalog/index.ts';

/** Model id with autocomplete that still accepts arbitrary strings. */
type ModelId = TypedModelId | (string & {});

/** One fetched page. Pass `nextCursor` back to load the next one. */
export interface CatalogPage {
  items: CatalogItem[];
  /** `null` when the list is complete. */
  nextCursor: string | null;
}

export interface CatalogPageOptions {
  /** Cursor from the previous page's `nextCursor`; omit for the first page. */
  cursor?: string;
  /** Page size, 1..100. Defaults to 100. */
  limit?: number;
  /** Drop everything cached for this catalog and refetch from the first page. */
  forceRefresh?: boolean;
  /**
   * Cancels this caller's wait only. A fetch shared with other callers keeps
   * running so its result can still be cached for them.
   */
  signal?: AbortSignal;
}

export interface CatalogsClient {
  /**
   * One page of the model's voice catalog (`voiceId` param). Fetched pages
   * accumulate into `Model(id).params().catalog('voiceId').catalogOptions`,
   * so pickers see everything loaded so far.
   */
  voices(model: ModelId, options?: CatalogPageOptions): Promise<CatalogPage>;
  /** One page of the model's avatar catalog — same semantics, for `videoId`. */
  avatars(model: ModelId, options?: CatalogPageOptions): Promise<CatalogPage>;
  /** One page of the model's effect-template catalog — same semantics, for `templateId`. */
  templates(model: ModelId, options?: CatalogPageOptions): Promise<CatalogPage>;
}

export interface CatalogsOptions {
  /**
   * Load the first page of every catalog-bound param in the background at
   * client creation, so pickers open with data before any explicit call.
   */
  preload?: boolean;
}

/** Every catalog task accepts up to 100. */
const DEFAULT_LIMIT = 100;
/** Serve-stale floor so a worker sending `ttlSeconds: 0` can't disable caching. */
const MIN_TTL_SECONDS = 60;

/** Cached pages of one catalog source, in fetch order. */
interface SourceStore {
  pages: Map<string, CatalogPage>; // key: request cursor ('' = first page)
  version: string;
  expiresAt: number;
  /** Bumped on reset — a fetch started before a reset must not write back. */
  gen: number;
}

/** Callers get copies — the cached page must survive caller mutation. */
const copyPage = (page: CatalogPage): CatalogPage => ({
  items: [...page.items],
  nextCursor: page.nextCursor,
});

const abortError = (signal: AbortSignal): unknown =>
  signal.reason ?? new DOMException('The catalog load was aborted.', 'AbortError');

/** Race a shared promise against this caller's own signal — rejects only this caller. */
function abortable<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError(signal));
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError(signal));
    signal.addEventListener('abort', onAbort, { once: true });
    const settle = () => signal.removeEventListener('abort', onAbort);
    promise.then(
      (value) => { settle(); resolve(value); },
      (err) => { settle(); reject(err); },
    );
  });
}

export function createCatalogs(transport: SdkTransport, options?: CatalogsOptions): CatalogsClient {
  const stores = new Map<string, SourceStore>();
  const inflight = new Map<string, Promise<CatalogPage>>();

  const keyOf = (s: CatalogSource) => `${s.workflow} ${s.modelId ?? ''}`;

  async function fetchPage(workflow: string, query: CatalogQuery): Promise<CatalogResult> {
    const payload: Record<string, unknown> = {};
    if (query.modelId) payload.modelId = query.modelId;
    if (query.cursor) payload.cursor = query.cursor;
    if (query.limit) payload.limit = query.limit;

    const raw = await transport.execute({ workflow, payload }) as Record<string, unknown> | null;
    const container = (raw?.response ?? raw) as Record<string, unknown> | undefined;
    if (raw?.status === 'error' || container?.status === 'FAILED') {
      const message = container?.message ?? container?.error ?? raw?.message;
      throw new Error(`${workflow} failed${message ? `: ${String(message)}` : ''}`);
    }
    const result = container?.result as CatalogResult | undefined;
    if (!result || !Array.isArray(result.items)) {
      throw new Error(`${workflow} returned no catalog result`);
    }
    return { ...result, nextCursor: result.nextCursor ?? null };
  }

  function storeFor(source: CatalogSource, forceRefresh?: boolean): SourceStore {
    const key = keyOf(source);
    let store = stores.get(key);
    if (!store) {
      store = { pages: new Map(), version: '', expiresAt: 0, gen: 0 };
      stores.set(key, store);
      return store;
    }
    // Expired or forced: drop the pages but keep the store's identity — the
    // gen bump turns any in-flight fetch from the old snapshot into a no-op.
    if (forceRefresh || (store.expiresAt !== 0 && store.expiresAt <= Date.now())) {
      store.pages.clear();
      store.version = '';
      store.expiresAt = 0;
      store.gen += 1;
    }
    return store;
  }

  /** Everything fetched so far for a source, in fetch order, deduped by id. */
  function accumulated(store: SourceStore): CatalogItem[] {
    const byId = new Map<string, CatalogItem>();
    for (const page of store.pages.values()) {
      for (const item of page.items) byId.set(item.id, item);
    }
    return [...byId.values()];
  }

  async function loadPage(
    def: ModelDefinition,
    paramKey: string,
    source: CatalogSource,
    options?: CatalogPageOptions,
  ): Promise<CatalogPage> {
    const store = storeFor(source, options?.forceRefresh);
    const cursorKey = options?.cursor ?? '';

    const cached = store.pages.get(cursorKey);
    if (cached) return abortable(Promise.resolve(copyPage(cached)), options?.signal);

    const inflightKey = `${keyOf(source)} ${cursorKey}`;
    if (!options?.forceRefresh) {
      // A forced refresh must not join a fetch that predates the reset.
      const pending = inflight.get(inflightKey);
      if (pending) return abortable(pending.then(copyPage), options?.signal);
    }

    const gen = store.gen;
    // The fetch itself is signal-less: it is shared by every caller of this
    // page, and its result feeds the cache either way.
    const run = fetchPage(source.workflow, {
      modelId: source.modelId,
      cursor: options?.cursor,
      limit: options?.limit ?? DEFAULT_LIMIT,
    })
      .then((res) => {
        const page: CatalogPage = { items: res.items, nextCursor: res.nextCursor };
        if (store.gen === gen) {
          store.pages.set(cursorKey, page);
          store.version = res.version;
          if (store.expiresAt === 0) {
            store.expiresAt = Date.now() + Math.max(MIN_TTL_SECONDS, res.ttlSeconds || 0) * 1000;
          }
          installHydratedCatalog(source, paramKey, accumulated(store), def.provider, store.version);
        }
        return page;
      })
      .finally(() => {
        if (inflight.get(inflightKey) === run) inflight.delete(inflightKey);
      });
    inflight.set(inflightKey, run);
    return abortable(run.then(copyPage), options?.signal);
  }

  function requireSource(def: ModelDefinition, key: string): CatalogSource {
    const d = def.paramConfig[key]?.descriptor;
    const source = d?.kind === 'catalog' ? d.source : undefined;
    if (!source) {
      throw new Error(`Model "${def.id}" has no runtime catalog on param "${key}" — its options are static.`);
    }
    return source;
  }

  async function loadParam(model: ModelId, key: string, options?: CatalogPageOptions): Promise<CatalogPage> {
    const def = resolveModel(model);
    return loadPage(def, key, requireSource(def, key), options);
  }

  const client: CatalogsClient = {
    voices: (model, options) => loadParam(model, 'voiceId', options),
    avatars: (model, options) => loadParam(model, 'videoId', options),
    templates: (model, options) => loadParam(model, 'templateId', options),
  };

  if (options?.preload) {
    // First page of every bound catalog, in the background. Failures are
    // silent by design: a picker opened later just triggers a normal load.
    const seen = new Set<string>();
    for (const def of ALL_MODELS) {
      for (const [key, entry] of Object.entries(def.paramConfig)) {
        const d = entry.descriptor;
        const source = d.kind === 'catalog' ? d.source : undefined;
        if (!source || seen.has(keyOf(source))) continue;
        seen.add(keyOf(source));
        void loadPage(def, key, source).catch(() => {});
      }
    }
  }

  return client;
}

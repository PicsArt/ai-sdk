/**
 * Catalog-store tests — offline, against the mock platform's
 * /v1/models-catalog route.
 *
 * The store is the one dynamic catalog load per process: query string
 * correctness (a missing `include` would silently reproduce the exact gaps
 * the worker closed), in-flight dedup, retry-after-failure, and the
 * one-source-per-process conflict.
 */
import assert from 'node:assert';
import {
  loadModelCatalog,
  whenModelCatalogLoaded,
  isModelCatalogLoaded,
  __resetModelCatalogStoreForTests,
} from '../../src/core/catalog-store.ts';
import { __resetActiveCatalogForTests } from '../../src/core/active-catalog.ts';
import { serializeCatalog } from '../../src/core/catalog-wire.ts';
import { catalog } from '../../src/core/descriptors/model-accessor.ts';
import { ApiError } from '../../src/core/errors.ts';
import { mockPlatform } from './helpers/mock-platform.ts';
import { FIXTURE_CATALOG } from './helpers/fixture-catalog.ts';

const API_URL = 'https://x.test';
const FIXTURE = serializeCatalog(FIXTURE_CATALOG);

function reset(): void {
  __resetModelCatalogStoreForTests();
  __resetActiveCatalogForTests();
}

// ── 1. query string: include block + every filter ───────────────────
{
  reset();
  const mock = mockPlatform({ modelsCatalog: () => FIXTURE });
  await loadModelCatalog(mock.fetch, API_URL, {
    mode: ['video', 'image'],
    provider: 'flux',
    release: ['production', 'general-availability'],
    includeDeprecated: true,
    search: 'flux',
  });
  assert.strictEqual(mock.calls.catalogFetches.length, 1);
  const query = new URLSearchParams(mock.calls.catalogFetches[0].search);
  assert.strictEqual(query.get('include'), 'schema,constraints,routing');
  assert.strictEqual(query.get('mode'), 'video,image');
  assert.strictEqual(query.get('provider'), 'flux');
  assert.strictEqual(query.get('release'), 'production,general-availability');
  assert.strictEqual(query.get('includeDeprecated'), 'true');
  assert.strictEqual(query.get('search'), 'flux');
  assert.strictEqual(isModelCatalogLoaded(), true);
}

// ── 2. success installs the fetched catalog ─────────────────────────
{
  reset();
  const mock = mockPlatform({ modelsCatalog: () => FIXTURE });
  await loadModelCatalog(mock.fetch, API_URL);
  assert.deepStrictEqual(
    catalog.all().map((m) => m.id).sort(),
    FIXTURE.response.models.map((m) => m.id).sort(),
  );
}

// ── 3. concurrent + repeat loads share one fetch ─────────────────────
{
  reset();
  const mock = mockPlatform({ modelsCatalog: () => FIXTURE });
  const [a, b] = [loadModelCatalog(mock.fetch, API_URL), loadModelCatalog(mock.fetch, API_URL)];
  assert.strictEqual(a, b, 'concurrent loads must share the in-flight promise');
  await Promise.all([a, b]);
  await loadModelCatalog(mock.fetch, API_URL);
  assert.strictEqual(mock.calls.catalogFetches.length, 1);
  assert.strictEqual(whenModelCatalogLoaded(), a);
}

// ── 4. different url/filters key → 409 catalog_conflict ─────────────
{
  reset();
  const mock = mockPlatform({ modelsCatalog: () => FIXTURE });
  await loadModelCatalog(mock.fetch, API_URL);
  await assert.rejects(
    loadModelCatalog(mock.fetch, API_URL, { mode: 'video' }),
    (err: unknown) =>
      err instanceof ApiError && err.status === 409 && err.code === 'catalog_conflict',
  );
  await assert.rejects(
    loadModelCatalog(mock.fetch, 'https://other.test'),
    (err: unknown) => err instanceof ApiError && err.code === 'catalog_conflict',
  );
}

// ── 5. failure rejects with the platform error, stays retryable ─────
{
  reset();
  let failures = 0;
  const failingOnce: typeof fetch = async (url, init) => {
    if (failures++ === 0) {
      return new Response(
        JSON.stringify({ status: 'error', reason: 'service_unavailable', message: 'catalog down' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      );
    }
    return mockPlatform({ modelsCatalog: () => FIXTURE }).fetch(String(url), init);
  };
  await assert.rejects(
    loadModelCatalog(failingOnce, API_URL),
    (err: unknown) =>
      err instanceof ApiError && err.status === 503 && err.code === 'service_unavailable'
      && err.message === 'catalog down',
  );
  assert.strictEqual(isModelCatalogLoaded(), false);
  assert.strictEqual(whenModelCatalogLoaded(), null, 'failed load must clear the promise');
  // Retry succeeds and installs.
  await loadModelCatalog(failingOnce, API_URL);
  assert.strictEqual(isModelCatalogLoaded(), true);
  assert.ok(catalog.all().length > 0);
}

// ── 6. malformed body → 502 invalid_response ────────────────────────
{
  reset();
  const mock = mockPlatform({ modelsCatalog: () => ({ status: 'success', response: {} }) });
  await assert.rejects(
    loadModelCatalog(mock.fetch, API_URL),
    (err: unknown) =>
      err instanceof ApiError && err.status === 502 && err.code === 'invalid_response',
  );
}

/**
 * ai.validate() — dynamic-only.
 *
 * Rejects 409 catalog_not_loaded before initModelCatalog(), waits for an
 * in-flight load, then validates against the FETCHED descriptors. Unknown
 * models reject 400 unknown_model once the catalog is loaded.
 */
import assert from 'node:assert';
import { createClient } from '../../src/client/index.ts';
import { ApiError } from '../../src/core/errors.ts';
import { serializeCatalog, type CatalogModelsResponse } from '../../src/core/catalog-wire.ts';
import { isModelCatalogLoaded } from '../../src/core/catalog-store.ts';
import { __resetActiveCatalogForTests } from '../../src/core/active-catalog.ts';
import { __resetModelCatalogStoreForTests } from '../../src/core/catalog-store.ts';
import { mockPlatform } from './helpers/mock-platform.ts';
import { FLUX } from './helpers/fixture-catalog.ts';

__resetModelCatalogStoreForTests();
__resetActiveCatalogForTests();

// A fixture catalog whose flux-2-pro has a required backend-only param, so a
// pass proves validation ran against the FETCHED descriptors.
const fixture: CatalogModelsResponse = serializeCatalog([FLUX]);
fixture.response.models[0].params!.backendOnlyParam = {
  kind: 'enum',
  valueType: 'string',
  options: [{ id: 'a' }, { id: 'b' }],
  default: 'a',
  required: true,
};

let releaseCatalog!: () => void;
const gate = new Promise<void>((resolve) => { releaseCatalog = resolve; });
const platform = mockPlatform({ modelsCatalog: () => fixture });
const gatedFetch: typeof platform.fetch = async (url, init) => {
  if (String(url).includes('/v1/models-catalog')) await gate;
  return platform.fetch(url, init);
};

const ai = createClient({ apiUrl: 'https://api.test', fetch: gatedFetch });

// ── 1. rejects before initModelCatalog ──────────────────────────────
{
  await assert.rejects(
    ai.validate('flux-2-pro', { prompt: 'x' }),
    (err: unknown) => err instanceof ApiError && err.status === 409 && err.code === 'catalog_not_loaded',
  );
}

// ── 2. validate waits for the in-flight load, then uses fetched data ─
{
  const loading = ai.initModelCatalog();
  const validating = ai.validate('flux-2-pro', { prompt: 'x' }); // missing backendOnlyParam
  let settled = false;
  void validating.then(() => { settled = true; }, () => { settled = true; });
  await new Promise((r) => setTimeout(r, 20));
  assert.strictEqual(settled, false, 'validate must wait for the catalog load');
  assert.strictEqual(isModelCatalogLoaded(), false);

  releaseCatalog();
  await loading;
  const res = await validating;
  assert.strictEqual(res.valid, false, 'fetched descriptors require backendOnlyParam');
  assert.ok(res.errors?.some((e) => e.includes('backendOnlyParam')));

  const ok = await ai.validate('flux-2-pro', { prompt: 'x', backendOnlyParam: 'a' });
  assert.strictEqual(ok.valid, true);

  // Unknown model after the load → unknown_model, not catalog_not_loaded.
  await assert.rejects(
    ai.validate('no-such-model', { prompt: 'x' }),
    (err: unknown) => err instanceof ApiError && err.code === 'unknown_model',
  );
}

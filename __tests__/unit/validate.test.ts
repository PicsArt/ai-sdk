/**
 * ai.validate() — async validation in both modes.
 *
 * Static: resolves immediately off the bundled catalog. Dynamic: waits for
 * the catalog load started by initModelCatalog(), rejects 409
 * catalog_not_loaded when it was never called, and validates against the
 * FETCHED descriptors once installed.
 *
 * Ordering note: the active catalog is process-global, so all static-mode
 * assertions run before the first dynamic client flips it to pending.
 */
import assert from 'node:assert';
import { createClient } from '../../src/client/index.ts';
import { ApiError } from '../../src/core/errors.ts';
import { serializeCatalog, type CatalogModelsResponse } from '../../src/core/catalog-wire.ts';
import { ALL_MODELS } from '../../src/vendors/catalog/index.ts';
import { isModelCatalogLoaded } from '../../src/core/catalog-store.ts';
import { mockPlatform } from './helpers/mock-platform.ts';

// ── 1. static mode — bundled catalog, immediate ─────────────────────
{
  const platform = mockPlatform();
  const ai = createClient({ apiUrl: 'https://api.test', fetch: platform.fetch });

  const ok = await ai.validate('flux-2-pro', { prompt: 'a cat' });
  assert.strictEqual(ok.valid, true);

  const bad = await ai.validate('flux-2-pro', { prompt: 'a cat', aspectRatio: 'nope' });
  assert.strictEqual(bad.valid, false);
  assert.ok(bad.errors && bad.errors.length > 0, 'invalid params should carry errors');

  await assert.rejects(
    ai.validate('no-such-model', { prompt: 'x' }),
    (err: unknown) => err instanceof ApiError && err.code === 'unknown_model',
  );

  // No network: validation is local in static mode.
  assert.strictEqual(platform.calls.submits.length, 0);
  assert.strictEqual(platform.calls.catalogFetches.length, 0);
}

// ── 2. dynamic mode — rejects before initModelCatalog ───────────────

// A fixture catalog whose flux-2-pro gained a backend-only param, so a pass
// proves validation ran against the FETCHED descriptors, not bundled ones.
const fixture: CatalogModelsResponse = serializeCatalog(
  ALL_MODELS.filter((m) => m.id === 'flux-2-pro'),
);
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

const ai = createClient({ mode: 'dynamic', apiUrl: 'https://api.test', fetch: gatedFetch });

{
  await assert.rejects(
    ai.validate('flux-2-pro', { prompt: 'x' }),
    (err: unknown) => err instanceof ApiError && err.status === 409 && err.code === 'catalog_not_loaded',
  );
}

// ── 3. validate waits for the in-flight load, then uses fetched data ─
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

/**
 * Active-catalog tests — offline, no API calls.
 *
 * The SDK is dynamic-only: the active catalog starts pending (no bundled
 * fallback), every sync read surface throws until a catalog is installed, and
 * installing one is reflected by the registry and the Model()/catalog.*
 * accessors. Reset returns to pending.
 */
import assert from 'node:assert';
import {
  installCatalog,
  peekActiveModels,
  activeModels,
  isCatalogInstalled,
  __resetActiveCatalogForTests,
} from '../../src/core/active-catalog.ts';
import { Model, catalog } from '../../src/core/descriptors/model-accessor.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import { findModel } from '../../src/core/model-registry.ts';
import { ApiError } from '../../src/core/errors.ts';
import { FIXTURE_CATALOG } from './helpers/fixture-catalog.ts';

const isNotLoaded = (err: unknown): boolean =>
  err instanceof ApiError && err.status === 409 && err.code === 'catalog_not_loaded';

// ── 1. pending by default: every sync surface throws catalog_not_loaded ─
{
  __resetActiveCatalogForTests();
  assert.strictEqual(isCatalogInstalled(), false);
  assert.strictEqual(peekActiveModels(), null);
  assert.throws(() => activeModels(), isNotLoaded);
  assert.throws(() => catalog.all(), isNotLoaded);
  assert.throws(() => Model('flux-2-pro'), isNotLoaded);
  assert.throws(() => resolveModel('flux-2-pro'), isNotLoaded);
}

// ── 2. install reflects everywhere ──────────────────────────────────
{
  installCatalog(FIXTURE_CATALOG);
  assert.strictEqual(isCatalogInstalled(), true);
  assert.strictEqual(activeModels(), FIXTURE_CATALOG);
  assert.strictEqual(peekActiveModels(), FIXTURE_CATALOG);

  const all = catalog.all();
  assert.deepStrictEqual(all.map((m) => m.id).sort(), ['claude-opus-5', 'flux-2-pro', 'kling-v3']);

  assert.strictEqual(resolveModel('flux-2-pro').name, 'Flux 2 Pro');
  assert.strictEqual(findModel('kling/v1/video')?.id, 'kling-v3');
  assert.strictEqual(findModel('Flux 2 Pro')?.id, 'flux-2-pro');

  assert.ok(Model('flux-2-pro').params().hasParam('prompt'), 'loaded param missing from accessor');
}

// ── 3. reinstalling swaps the active set ────────────────────────────
{
  installCatalog([FIXTURE_CATALOG[0]]);
  assert.deepStrictEqual(catalog.all().map((m) => m.id), ['flux-2-pro']);
  assert.strictEqual(findModel('kling-v3'), undefined);
}

// ── 4. reset returns to pending ─────────────────────────────────────
{
  __resetActiveCatalogForTests();
  assert.strictEqual(isCatalogInstalled(), false);
  assert.throws(() => activeModels(), isNotLoaded);
  assert.throws(() => resolveModel('flux-2-pro'), isNotLoaded);
}

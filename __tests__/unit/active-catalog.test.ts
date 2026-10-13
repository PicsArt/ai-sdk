/**
 * Active-catalog tests — offline, no API calls.
 *
 * Installing a catalog must be reflected by every read surface (registry,
 * Model() accessor, catalog.*, contracts), pending state must fail loudly,
 * and the bundled catalog must be restorable.
 */
import assert from 'node:assert';
import {
  installCatalog,
  markCatalogPending,
  peekActiveModels,
  activeModels,
  isCatalogInstalled,
  __resetActiveCatalogForTests,
} from '../../src/core/active-catalog.ts';
import { ALL_MODELS } from '../../src/vendors/catalog/index.ts';
import { Model, catalog } from '../../src/core/descriptors/model-accessor.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import { getModelContract } from '../../src/core/contracts.ts';
import { findModel } from '../../src/core/model-registry.ts';
import { ApiError } from '../../src/core/errors.ts';
import type { ModelDefinition } from '../../src/core/types.ts';

const FIXTURE: ModelDefinition[] = [
  {
    id: 'fixture-image',
    name: 'Fixture Image',
    provider: 'flux' as ModelDefinition['provider'],
    workflow: 'fixture/v1/image',
    providerName: 'Fixture',
    providerColor: '#123456',
    providerLabel: 'X',
    description: 'test-only image model',
    features: [],
    mode: 'image',
    inputType: 't2i',
    release: 'production',
    paramConfig: {
      prompt: { label: 'Prompt', required: true, descriptor: { kind: 'text', maxLength: 10 } },
      fixtureOnly: { descriptor: { kind: 'boolean', default: false } },
    },
  },
  {
    id: 'fixture-video',
    name: 'Fixture Video',
    provider: 'kling' as ModelDefinition['provider'],
    workflow: 'fixture/v1/video',
    providerName: 'Fixture',
    providerColor: '#123456',
    providerLabel: 'X',
    description: 'test-only video model',
    features: [],
    mode: 'video',
    inputType: 't2v',
    release: 'production',
    paramConfig: {
      prompt: { label: 'Prompt', required: true, descriptor: { kind: 'text' } },
    },
  },
];

const isNotLoaded = (err: unknown): boolean =>
  err instanceof ApiError && err.status === 409 && err.code === 'catalog_not_loaded';

// ── 1. bundled catalog is active by default ─────────────────────────
{
  assert.strictEqual(isCatalogInstalled(), true);
  assert.strictEqual(activeModels(), ALL_MODELS);
  assert.strictEqual(peekActiveModels(), ALL_MODELS);
}

// ── 2. pending: every sync surface throws catalog_not_loaded ────────
{
  markCatalogPending();
  assert.strictEqual(isCatalogInstalled(), false);
  assert.strictEqual(peekActiveModels(), null);
  assert.throws(() => activeModels(), isNotLoaded);
  assert.throws(() => catalog.all(), isNotLoaded);
  assert.throws(() => Model('flux-2-pro'), isNotLoaded);
  assert.throws(() => resolveModel('flux-2-pro'), isNotLoaded);
  assert.throws(() => getModelContract('flux-2-pro'), isNotLoaded);
}

// ── 3. install reflects everywhere, including the contract cache ────
{
  installCatalog(FIXTURE);
  assert.strictEqual(isCatalogInstalled(), true);

  const all = catalog.all();
  assert.deepStrictEqual(all.map((m) => m.id).sort(), ['fixture-image', 'fixture-video']);

  assert.strictEqual(resolveModel('fixture-image').name, 'Fixture Image');
  assert.strictEqual(findModel('fixture/v1/video')?.id, 'fixture-video');
  assert.strictEqual(findModel('Fixture Image')?.id, 'fixture-image');

  const params = Model('fixture-image').params();
  assert.ok(params.hasParam('fixtureOnly'), 'loaded param missing from accessor');

  // Contract cache rebuilt: fixture contract exists, enforces the fixture's
  // own descriptor; bundled contracts are gone.
  const contract = getModelContract('fixture-image');
  assert.ok(contract, 'contract for installed model missing');
  assert.throws(
    () => contract.input.parse({ prompt: 'longer than ten characters' }),
    (err: unknown) => err instanceof ApiError && err.code === 'validation_error',
  );
  assert.deepStrictEqual(contract.input.parse({ prompt: 'short' }), { prompt: 'short' });
  assert.strictEqual(getModelContract('flux-2-pro'), undefined);

  // markCatalogPending is a no-op once a catalog is installed.
  markCatalogPending();
  assert.strictEqual(isCatalogInstalled(), true);
}

// ── 4. reset restores the bundled catalog ───────────────────────────
{
  __resetActiveCatalogForTests();
  assert.strictEqual(activeModels(), ALL_MODELS);
  assert.ok(resolveModel('flux-2-pro'));
  assert.ok(getModelContract('flux-2-pro'));
  assert.strictEqual(getModelContract('fixture-image'), undefined);
}

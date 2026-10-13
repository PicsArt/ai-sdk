// ── Active catalog ────────────────────────────────────────────────────
// The single owner of "which model catalog is live in this process".
// Static mode: the bundled ALL_MODELS backs everything, so the SDK behaves
// exactly as it always has. Dynamic mode: createClient marks the catalog
// pending, and ai.initModelCatalog() installs the set loaded from
// models-hub. Process-global, like the pricing cache and the voice/avatar
// hydration registry: clients share it, last install wins.
//
// ALL_MODELS is read lazily (never at module evaluation) to break the
// circular import vendors/catalog → define → contracts → active-catalog,
// the same reason the contract cache in contracts.ts is lazy.

import type { ModelDefinition } from './types.ts';
import { ALL_MODELS } from '../vendors/catalog/index.ts';
import { ApiError } from './errors.ts';

/** undefined ⇒ bundled (lazy), null ⇒ dynamic-pending, array ⇒ installed. */
let _models: ModelDefinition[] | null | undefined = undefined;
let _generation = 0;

/**
 * Install a catalog as the active one. Bumps the generation counter so the
 * registry indexes and the contract cache rebuild lazily on next access.
 */
export function installCatalog(models: ModelDefinition[]): void {
  _models = models;
  _generation++;
}

/**
 * Dynamic mode, before the load: flip bundled → pending so the sync
 * accessors fail loudly instead of quietly serving stale bundled data.
 * No-op once a catalog has been installed over the bundled one.
 */
export function markCatalogPending(): void {
  if (_models === undefined) {
    _models = null;
    _generation++;
  }
}

export function isCatalogInstalled(): boolean {
  return _models !== null;
}

export function catalogGeneration(): number {
  return _generation;
}

/** The active model set. Throws while the dynamic catalog is pending. */
export function activeModels(): ModelDefinition[] {
  if (_models === null) {
    throw new ApiError(
      'Model catalog not loaded — call ai.initModelCatalog() after createClient({ mode: \'dynamic\' }).',
      { status: 409, code: 'catalog_not_loaded' },
    );
  }
  return _models ?? ALL_MODELS;
}

/** Non-throwing peek — null while pending. Backs the dynamic generate path's tolerant resolve. */
export function peekActiveModels(): ModelDefinition[] | null {
  return _models === undefined ? ALL_MODELS : _models;
}

/** Test-only: restore the bundled catalog. */
export function __resetActiveCatalogForTests(): void {
  _models = undefined;
  _generation++;
}

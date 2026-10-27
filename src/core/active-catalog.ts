// ── Active catalog ────────────────────────────────────────────────────
// The single owner of "which model catalog is live in this process".
// The SDK is dynamic-only: it ships with no bundled catalog, so the active
// set starts pending and ai.initModelCatalog() installs the set loaded from
// models-hub. Process-global, like the pricing cache and the voice/avatar
// hydration registry: clients share it, last install wins.

import type { ModelDefinition } from './types.ts';
import { ApiError } from './errors.ts';

/** null ⇒ pending (not loaded yet), array ⇒ installed. */
let _models: ModelDefinition[] | null = null;
let _generation = 0;

/**
 * Install a catalog as the active one. Bumps the generation counter so the
 * registry indexes and the pricing/hydration caches rebuild lazily on next
 * access.
 */
export function installCatalog(models: ModelDefinition[]): void {
  _models = models;
  _generation++;
}

export function isCatalogInstalled(): boolean {
  return _models !== null;
}

export function catalogGeneration(): number {
  return _generation;
}

/** The active model set. Throws until ai.initModelCatalog() has installed one. */
export function activeModels(): ModelDefinition[] {
  if (_models === null) {
    throw new ApiError(
      'Model catalog not loaded — call ai.initModelCatalog() before using the model catalog.',
      { status: 409, code: 'catalog_not_loaded' },
    );
  }
  return _models;
}

/** Non-throwing peek — null while pending. Backs the tolerant generate-path resolve. */
export function peekActiveModels(): ModelDefinition[] | null {
  return _models;
}

/** Test-only: clear the installed catalog back to pending. */
export function __resetActiveCatalogForTests(): void {
  _models = null;
  _generation++;
}

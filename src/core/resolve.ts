import type { ModelDefinition } from './types.ts';
import { findModel } from './model-registry.ts';

/** Resolve a model ID string to its ModelDefinition. Throws if not found. */
export function resolveModel(id: string): ModelDefinition {
  const found = findModel(id);
  if (!found) throw new Error(`Unknown model: "${id}"`);
  return found;
}

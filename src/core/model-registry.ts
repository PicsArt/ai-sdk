// ── Model Registry ───────────────────────────────────────────────────
// Indexes the active catalog into fast lookup Maps and provides query
// functions. Indexes are generation-cached: they build lazily off
// activeModels() and rebuild only when a new catalog is installed, so in
// static mode they are built exactly once, as before.

import type { ModelDefinition, GenerationMode } from './types.ts';
import { activeModels, catalogGeneration } from './active-catalog.ts';
import { isVisibleForReleases } from './visibility.ts';

// ── Indexes (generation-cached) ──────────────────────────────────────

interface Indexes {
  byId: Map<string, ModelDefinition>;
  byModelId: Map<string, ModelDefinition>;
  byWorkflow: Map<string, ModelDefinition>;
  byName: Map<string, ModelDefinition>;
  ambiguousNames: Set<string>;
}

let _idx: Indexes | null = null;
let _idxGen = -1;

function buildIndexes(models: ModelDefinition[]): Indexes {
  const byId = new Map(models.map((model) => [model.id, model] as const));
  const byModelId = new Map<string, ModelDefinition>();
  const byWorkflow = new Map<string, ModelDefinition>();
  const byName = new Map<string, ModelDefinition>();
  const ambiguousNames = new Set<string>();

  for (const model of models) {
    if (model.modelId && !byModelId.has(model.modelId)) {
      byModelId.set(model.modelId, model);
    }
    // A loaded catalog may omit routing, leaving workflow '' — never index it.
    if (model.workflow && !byWorkflow.has(model.workflow)) {
      byWorkflow.set(model.workflow, model);
    }
    if (model.editWorkflow && !byWorkflow.has(model.editWorkflow)) {
      byWorkflow.set(model.editWorkflow, model);
    }

    const nameKey = model.name.trim().toLowerCase();
    if (!nameKey) continue;
    if (ambiguousNames.has(nameKey)) continue;
    if (byName.has(nameKey)) {
      byName.delete(nameKey);
      ambiguousNames.add(nameKey);
      continue;
    }
    byName.set(nameKey, model);
  }

  return { byId, byModelId, byWorkflow, byName, ambiguousNames };
}

function indexes(): Indexes {
  const gen = catalogGeneration();
  if (!_idx || _idxGen !== gen) {
    _idx = buildIndexes(activeModels());
    _idxGen = gen;
  }
  return _idx;
}

// ── Query functions ──────────────────────────────────────────────────

/**
 * Look up a model by its ID or vendor modelId.
 * @deprecated Use the `Model(id)` accessor (or `catalog.find(id)`) — this
 * raw-definition lookup will be removed in the next major.
 */
export const getModel = (id: string): ModelDefinition | undefined => {
  const idx = indexes();
  return idx.byId.get(id) ?? idx.byModelId.get(id);
};

/**
 * Find a model by ID, workflow name, or display name (case-insensitive).
 * @deprecated Use `catalog.find(ref)` / `catalog.search(query)` — this
 * raw-definition lookup will be removed in the next major.
 */
export const findModel = (ref: string): ModelDefinition | undefined => {
  const key = ref.trim();
  if (!key) return undefined;
  return getModel(key)
    ?? indexes().byWorkflow.get(key)
    ?? indexes().byName.get(key.toLowerCase());
};

/** Get the first default-visible model for the given generation mode
 *  (production / general-availability — never a preview/deprecated model). */
export const getDefaultModel = (mode: GenerationMode): ModelDefinition => {
  const models = activeModels().filter((m) => m.mode === mode && isVisibleForReleases(m));
  const model = models.find((m) => isVisibleForReleases(m)) ?? models[0];
  if (!model) throw new Error(`No models available for mode "${mode}"`);
  return model;
};

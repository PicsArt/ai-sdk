// ── Model Registry ───────────────────────────────────────────────────
// Indexes ALL_MODELS into fast lookup Maps and provides query functions.

import type { ModelDefinition, GenerationMode } from './types.ts';
import { ALL_MODELS, getModelsByMode } from '../vendors/catalog/index.ts';

// ── Indexes (built once at module load) ──────────────────────────────

const MODEL_BY_ID = new Map(ALL_MODELS.map(model => [model.id, model] as const));
const MODEL_BY_MODEL_ID = new Map<string, ModelDefinition>();
const MODEL_BY_WORKFLOW = new Map<string, ModelDefinition>();
const MODEL_BY_NAME = new Map<string, ModelDefinition>();
const AMBIGUOUS_MODEL_NAMES = new Set<string>();

for (const model of ALL_MODELS) {
  if (model.modelId && !MODEL_BY_MODEL_ID.has(model.modelId)) {
    MODEL_BY_MODEL_ID.set(model.modelId, model);
  }
  if (!MODEL_BY_WORKFLOW.has(model.workflow)) {
    MODEL_BY_WORKFLOW.set(model.workflow, model);
  }
  if (model.editWorkflow && !MODEL_BY_WORKFLOW.has(model.editWorkflow)) {
    MODEL_BY_WORKFLOW.set(model.editWorkflow, model);
  }

  const nameKey = model.name.trim().toLowerCase();
  if (!nameKey) continue;
  if (AMBIGUOUS_MODEL_NAMES.has(nameKey)) continue;
  if (MODEL_BY_NAME.has(nameKey)) {
    MODEL_BY_NAME.delete(nameKey);
    AMBIGUOUS_MODEL_NAMES.add(nameKey);
    continue;
  }
  MODEL_BY_NAME.set(nameKey, model);
}

// ── Query functions ──────────────────────────────────────────────────

/** Look up a model by its ID or vendor modelId. */
export const getModel = (id: string): ModelDefinition | undefined =>
  MODEL_BY_ID.get(id) ?? MODEL_BY_MODEL_ID.get(id);

/** Find a model by ID, workflow name, or display name (case-insensitive). */
export const findModel = (ref: string): ModelDefinition | undefined => {
  const key = ref.trim();
  if (!key) return undefined;
  return getModel(key)
    ?? MODEL_BY_WORKFLOW.get(key)
    ?? MODEL_BY_NAME.get(key.toLowerCase());
};

/** Get the first enabled model for the given generation mode. */
export const getDefaultModel = (mode: GenerationMode): ModelDefinition => {
  const models = getModelsByMode(mode);
  const model = models.find((m) => !m.disabled && !m.deprecated) ?? models[0];
  if (!model) throw new Error(`No models available for mode "${mode}"`);
  return model;
};


// ── Catalog wire format ──────────────────────────────────────────────
// The shapes served by models-hub's `GET /v1/models-catalog` and the
// conversion to/from `ModelDefinition`. The wire's param schema is the
// SDK's own flat form (`EntryMeta & ParamDescriptor`, keyed by param
// name), so `deserializeCatalog` is a mechanical re-nesting under
// `.descriptor` — not an information-model translation. `serializeCatalog`
// is the inverse; it exists to build test fixtures and to prove the
// round trip loses nothing.
//
// Deserialized definitions carry no `buildPayload` / `buildEditPayload` /
// `outputSchema` — builders are code, not data. Dynamic mode never calls
// them: generation goes through the `v1/models` workflow, which runs the
// same catalog server-side.

import type {
  ModelDefinition,
  GenerationMode,
  InputType,
  ModelFeature,
  BadgeType,
  ReleaseTag,
  Constraint,
  Provider,
} from './types.ts';
import type { ModelParams, ParamDescriptor, ParamEntry } from './descriptors/types.ts';
import { ApiError } from './errors.ts';

/** Nested provider block — flattened onto `ModelDefinition.provider*`. */
export interface CatalogProvider {
  id: string;
  name: string;
  color: string;
  label: string;
}

/**
 * A param as served on the wire: the SDK's flat entry form (descriptor
 * fields merged with `label` / `required` / `category`), keyed by param
 * name instead of carrying `key`.
 */
export type CatalogParam = {
  label?: string;
  required?: boolean;
  category?: 'asset' | 'reference';
} & ParamDescriptor;

export interface CatalogModel {
  id: string;
  name: string;
  description?: string;
  mode: GenerationMode;
  inputType: InputType;
  provider: CatalogProvider;
  badges?: BadgeType[];
  features?: ModelFeature[];
  release?: ReleaseTag;
  addedAt?: string;
  estimatedTime?: number | Record<string, number>;
  deprecated?: boolean;
  /** `include=schema` */
  params?: Record<string, CatalogParam>;
  /** `include=constraints` */
  constraints?: Constraint[];
  /** `include=routing` */
  workflow?: string;
  editWorkflow?: string;
  modelId?: string;
  syncExecute?: boolean;
}

export interface CatalogModelsResponse {
  status: 'success';
  response: {
    total: number;
    models: CatalogModel[];
  };
}

/** EntryMeta keys lifted onto the ParamEntry; everything else is descriptor. */
const ENTRY_META_KEYS = ['label', 'required', 'category'] as const;

function toParamEntry(wire: CatalogParam): ParamEntry {
  const { label, required, category, ...descriptor } = wire;
  const entry: ParamEntry = { descriptor: descriptor as ParamDescriptor };
  if (label !== undefined) entry.label = label;
  if (required !== undefined) entry.required = required;
  if (category !== undefined) entry.category = category;
  return entry;
}

function toCatalogParam(entry: ParamEntry): CatalogParam {
  const wire = { ...entry.descriptor } as CatalogParam;
  for (const key of ENTRY_META_KEYS) {
    if (entry[key] !== undefined) (wire as unknown as Record<string, unknown>)[key] = entry[key];
  }
  return wire;
}

function invalidResponse(detail: string): ApiError {
  return new ApiError(`Invalid models-catalog response: ${detail}`, {
    status: 502,
    code: 'invalid_response',
  });
}

/** Convert one wire model into a `ModelDefinition` (no builders, no output schema). */
function toModelDefinition(wire: CatalogModel): ModelDefinition {
  if (!wire || typeof wire.id !== 'string' || !wire.provider) {
    throw invalidResponse('model entry is missing `id` or `provider`');
  }
  const paramConfig: ModelParams = {};
  for (const [key, param] of Object.entries(wire.params ?? {})) {
    paramConfig[key] = toParamEntry(param);
  }
  const def: ModelDefinition = {
    id: wire.id,
    name: wire.name,
    provider: wire.provider.id as Provider,
    providerName: wire.provider.name,
    providerColor: wire.provider.color,
    providerLabel: wire.provider.label,
    description: wire.description ?? '',
    features: wire.features ?? [],
    mode: wire.mode,
    inputType: wire.inputType,
    workflow: wire.workflow ?? '',
    paramConfig,
  };
  if (wire.badges !== undefined) def.badge = wire.badges;
  if (wire.release !== undefined) def.release = wire.release;
  if (wire.addedAt !== undefined) def.addedAt = wire.addedAt;
  if (wire.estimatedTime !== undefined) def.estimatedTime = wire.estimatedTime;
  if (wire.deprecated !== undefined) def.deprecated = wire.deprecated;
  if (wire.constraints !== undefined) def.constraints = wire.constraints;
  if (wire.editWorkflow !== undefined) def.editWorkflow = wire.editWorkflow;
  if (wire.modelId !== undefined) def.modelId = wire.modelId;
  if (wire.syncExecute !== undefined) def.syncExecute = wire.syncExecute;
  return def;
}

/** Unwrap and convert a `GET /v1/models-catalog` response body. */
export function deserializeCatalog(json: unknown): ModelDefinition[] {
  const body = json as CatalogModelsResponse | null;
  if (!body || body.status !== 'success' || !body.response || !Array.isArray(body.response.models)) {
    throw invalidResponse('expected `{ status: "success", response: { models: [...] } }`');
  }
  return body.response.models.map(toModelDefinition);
}

/** Inverse of {@link deserializeCatalog} — fixtures and the round-trip test. */
export function serializeCatalog(models: ModelDefinition[]): CatalogModelsResponse {
  const wireModels = models.map((def) => {
    const params: Record<string, CatalogParam> = {};
    for (const [key, entry] of Object.entries(def.paramConfig)) {
      params[key] = toCatalogParam(entry);
    }
    const wire: CatalogModel = {
      id: def.id,
      name: def.name,
      description: def.description,
      mode: def.mode,
      inputType: def.inputType,
      provider: {
        id: def.provider,
        name: def.providerName,
        color: def.providerColor,
        label: def.providerLabel,
      },
      features: def.features,
      params,
    };
    if (def.badge !== undefined) wire.badges = def.badge;
    if (def.release !== undefined) wire.release = def.release;
    if (def.addedAt !== undefined) wire.addedAt = def.addedAt;
    if (def.estimatedTime !== undefined) wire.estimatedTime = def.estimatedTime;
    if (def.deprecated !== undefined) wire.deprecated = def.deprecated;
    if (def.constraints !== undefined) wire.constraints = def.constraints;
    if (def.workflow) wire.workflow = def.workflow;
    if (def.editWorkflow !== undefined) wire.editWorkflow = def.editWorkflow;
    if (def.modelId !== undefined) wire.modelId = def.modelId;
    if (def.syncExecute !== undefined) wire.syncExecute = def.syncExecute;
    return wire;
  });
  return { status: 'success', response: { total: wireModels.length, models: wireModels } };
}

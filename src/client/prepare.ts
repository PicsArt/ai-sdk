import type { WorkflowStatusResult } from '../core/workflow.ts';
import type { GenerateResultItemMetadata } from '../core/response.ts';
import { throwIfErrorResult } from '../core/response.ts';
import { ApiError } from '../core/errors.ts';
import type { GenerateResult, GenerateResultItem, GenerateTextResult, RunResponse } from './types.ts';
import type { PayloadDriveOptions } from './drive.ts';

// ── Dynamic mode — the models-hub `v1/models` workflow ───────────────
// The SDK is dynamic-only: every generation rides one fixed pluggable
// workflow. The SDK sends `{ model, params, options }` and models-hub
// (which owns the catalog) builds the vendor payload and normalizes the
// result to `{ url?, items?, text?, model }`. No local builder, no
// envelope-walking extractors, no per-model workflow.

/** The models-hub pluggable workflow every generation request rides. */
export const MODELS_WORKFLOW = 'v1/models';

/** Platform options carried on a {@link ModelsCommand} (ModelsGenAIOptions on the backend). */
export interface ModelsGenAIOptions {
  safety_checks?: { enabled?: boolean };
  drive?: PayloadDriveOptions;
  inputs_transformation?: { downscale_oversized_images?: boolean };
}

/** The `v1/models` request body: which model, the SDK-shaped params, platform options. */
export interface ModelsCommand {
  model: string;
  params: Record<string, unknown>;
  options?: ModelsGenAIOptions;
}

/**
 * Build the `v1/models` command. Media generations pass `options` (drive +
 * inputs transformation); text and credits callers omit it, so those routes
 * send no platform options.
 */
export function buildModelsCommand(
  model: string,
  params: Record<string, unknown>,
  options?: { drive?: PayloadDriveOptions; downscaleOversizedImages?: boolean },
): ModelsCommand {
  if (!options) return { model, params };
  return {
    model,
    params,
    options: {
      inputs_transformation: {
        downscale_oversized_images: options.downscaleOversizedImages ?? false,
      },
      ...(options.drive ? { drive: options.drive } : {}),
    },
  };
}

/** The pre-normalized result `v1/models` answers with. */
interface ModelsResult {
  url?: string;
  items?: Array<{ url: string; metadata?: GenerateResultItemMetadata }>;
  text?: string;
  model?: string;
}

function asModelsResult(result: unknown): ModelsResult {
  return (result && typeof result === 'object' ? result : {}) as ModelsResult;
}

/**
 * Parse a completed `v1/models` result into a GenerateResult. The worker
 * pre-normalizes (`items[]` / `url`), and its `items[].metadata` is the
 * SDK's own `GenerateResultItemMetadata`, so metadata passes through
 * verbatim — no extraction, no promotion.
 */
export function parseDynamicResult(
  completed: WorkflowStatusResult<unknown>,
  modelRef: string,
): GenerateResult {
  throwIfErrorResult(completed.result, modelRef);
  const r = asModelsResult(completed.result);

  const items: GenerateResultItem[] = Array.isArray(r.items) && r.items.length > 0
    ? r.items.map((item) => ({
      url: item.url,
      ...(item.metadata ? { metadata: item.metadata } : {}),
    }))
    : r.url
      ? [{ url: r.url }]
      : [];
  if (!items.length || !items[0].url) {
    throw new ApiError(`${modelRef}: unexpected response — no result URL`, {
      status: 502,
      code: 'invalid_response',
    });
  }

  return {
    url: items[0].url,
    items,
    results: items,
    // Sync executions have no job id (nothing to poll) — omit rather than ''.
    ...(completed.handle.id ? { generationId: completed.handle.id } : {}),
    usage: completed.usage,
  };
}

/** Parse a completed `v1/models` result into a GenerateTextResult — `result.text`, no envelope-walking. */
export function parseDynamicTextResult(
  completed: WorkflowStatusResult<unknown>,
  modelRef: string,
): GenerateTextResult {
  throwIfErrorResult(completed.result, modelRef);
  throwIfErrorResult(completed.raw, modelRef);
  const r = asModelsResult(completed.result);
  if (typeof r.text !== 'string') {
    throw new ApiError(`${modelRef}: unexpected response — no text`, {
      status: 502,
      code: 'invalid_response',
    });
  }
  return {
    text: r.text,
    model: r.model ?? modelRef,
    raw: completed.raw ?? completed.result,
    usage: completed.usage,
  };
}

/** Parse a completed `v1/models` run into the generic `ai.run()` response. */
export function parseDynamicRunResult(
  completed: WorkflowStatusResult<unknown>,
  modelRef: string,
): RunResponse {
  throwIfErrorResult(completed.result, modelRef);
  throwIfErrorResult(completed.raw, modelRef);
  if (completed.result == null) {
    throw new ApiError(`${modelRef}: unexpected response — empty result`, {
      status: 502,
      code: 'invalid_response',
    });
  }
  return {
    result: completed.result,
    status: 'COMPLETED',
    usage: completed.usage,
    // Sync executions have no job id (nothing to poll) — omit rather than ''.
    ...(completed.handle.id ? { id: completed.handle.id } : {}),
  };
}

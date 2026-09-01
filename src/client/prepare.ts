import type { ModelDefinition, GenerationContext } from '../core/types.ts';
import type { WorkflowStatusResult } from '../core/workflow.ts';
import { getModelContract } from '../core/contracts.ts';
import { extractUrl, extractText, extractAllResults, throwIfErrorResult } from '../core/response.ts';
import { ApiError } from '../core/errors.ts';
import type { GenerateResult, GenerateResultItem, GenerateTextResult } from './types.ts';

/** Resolve whether to use the edit or generate payload builder based on context. */
function resolvePayloadBuild(model: ModelDefinition, ctx: Partial<GenerationContext>) {
  const hasImages = (Array.isArray(ctx.imageUrls) && ctx.imageUrls.length > 0) || !!ctx.startFrame || !!ctx.endFrame;
  return {
    hasImages,
    workflow: hasImages && model.editWorkflow ? model.editWorkflow : model.workflow,
    buildPayload: hasImages && model.buildEditPayload
      ? model.buildEditPayload
      : model.buildPayload ?? ((ctx: GenerationContext) => ({ prompt: ctx.prompt })),
  };
}

/**
 * Validate context against model contract, resolve workflow, build payload.
 * This is the shared preparation step for generate/submit/estimate.
 */
export function prepareRequest(model: ModelDefinition, params: Partial<GenerationContext>) {
  const ctx = { ...params } as GenerationContext;

  const contract = getModelContract(model.id);
  const validatedCtx = contract ? contract.input.parse(ctx) : ctx;

  const resolved = resolvePayloadBuild(model, validatedCtx);
  // Builders return wire-shape objects (typed against @picsart/workflows-types
  // where available). Cast to Record<string, unknown> at the boundary —
  // downstream transports JSON-serialize the payload, so the loose index
  // type is fine and lets typed builders stay typed.
  const payload = resolved.buildPayload(validatedCtx) as Record<string, unknown>;

  return { ctx, workflow: resolved.workflow, payload, contract };
}

/**
 * Throw on a terminal non-success state, carrying the platform's own status
 * and reason through when the response supplied them.
 */
function throwIfTerminalFailure(
  completed: WorkflowStatusResult<unknown>,
  model: ModelDefinition,
): void {
  if (completed.status === 'FAILED') {
    throw new ApiError(`${model.name} failed: ${completed.error ?? 'unknown error'}`, {
      status: completed.statusCode ?? 502,
      code: completed.reason ?? 'generation_failed',
    });
  }
  if (completed.status === 'CANCELED') {
    throw new ApiError(`${model.name} was canceled`, { status: 499, code: 'canceled' });
  }
}

/**
 * Parse a completed workflow result into a GenerateResult.
 * Handles error checking, output parsing, and URL extraction.
 */
export function parseResult(
  completed: WorkflowStatusResult<unknown>,
  model: ModelDefinition,
  contract: ReturnType<typeof getModelContract>,
): GenerateResult {
  throwIfTerminalFailure(completed, model);

  throwIfErrorResult(completed.result, model.name);

  const parsed = contract?.output
    ? contract.output.parse(completed.result)
    : completed.result;

  // Multi-result models (e.g. explore) — extract all items
  const multiItems = extractAllResults(parsed);
  if (multiItems?.length) {
    const results: GenerateResultItem[] = multiItems.map(item => ({
      url: item.url,
      metadata: item.exploreImageId ? { exploreImageId: item.exploreImageId } : undefined,
    }));
    return { url: results[0].url, results, model: model.id, handle: completed.handle, raw: parsed, usage: completed.usage };
  }

  // Single-result models — extract URL
  const url = extractUrl(parsed);
  if (!url) {
    throw new ApiError(`${model.name}: unexpected response — no result URL`, {
      status: 502,
      code: 'invalid_response',
    });
  }

  return { url, results: [{ url }], model: model.id, handle: completed.handle, raw: parsed, usage: completed.usage };
}

/**
 * Parse a completed workflow result into a GenerateTextResult.
 *
 * Text models span several workflows (chat-completions, claude/v1/messages,
 * gemini) whose response envelopes differ — Claude returns the message under
 * `response`, Gemini under `response.result.candidates`, OpenAI under
 * `response.result.choices`. extractText() walks those wrappers, so we extract
 * from the parsed result and fall back to the full raw envelope. The output
 * contract is skipped here (its only job is a non-null check, which would
 * throw before the raw fallback runs).
 */
export function parseTextResult(
  completed: WorkflowStatusResult<unknown>,
  model: ModelDefinition,
): GenerateTextResult {
  throwIfTerminalFailure(completed, model);

  throwIfErrorResult(completed.result, model.name);
  throwIfErrorResult(completed.raw, model.name);

  const text = extractText(completed.result) ?? extractText(completed.raw);
  if (text == null) {
    throw new ApiError(`${model.name}: unexpected response — no text`, {
      status: 502,
      code: 'invalid_response',
    });
  }

  return { text, model: model.id, handle: completed.handle, raw: completed.raw ?? completed.result, usage: completed.usage };
}

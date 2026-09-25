import type { GenerationMode, ModelDefinition } from '../core/types.ts';

import {
  type SdkTransport,
  type TransportResult,
  type WorkflowJobHandle,
  type WorkflowStatusResult,
  type WorkflowPollOptions,
} from '../core/workflow.ts';
import { getModelContract } from '../core/contracts.ts';
import { extractSyncResult, toCompletedStatus } from '../core/response.ts';
import { resolveModel } from '../core/resolve.ts';
import { ApiError } from '../core/errors.ts';

import type { ClientConfig, GenerateResult, GenerateTextResult, GenerateOptions, GenerationOptions, PayloadInputsTransformationOptions, AiClient, GenerationEvent } from './types.ts';
import type { PayloadDriveOptions } from './drive.ts';
import { buildTransport, createWorkflowsClient, maybeFetch } from './transport.ts';
import { prepareRequest, parseResult, parseTextResult } from './prepare.ts';
import { createDriveClient, buildFilename, buildGenerationAttributes, expectedOutputFormat } from './drive.ts';
import { createApis } from './apis.ts';
import { createCatalogs } from './catalogs.ts';

// ── Re-export types for the public API ──
export type { ClientConfig, AuthenticatedFetch, SdkTransport, TransportResult, TransportPollOptions, WorkflowSubmitRequest, WorkflowJobHandle, GenerateResult, GenerateResultItem, GenerateResultItemMetadata, GenerateTextResult, GenerateOptions, GenerationOptions, GenerationEvent, GenerationProgress, PayloadInputsTransformationOptions, CreditUsage, ToolUsage, AiClient, MediaModelId } from './types.ts';
export type { ApiResponse, ApiRunOptions, ApiSchemas, ApisClient } from './apis.ts';
export type { CatalogsClient, CatalogPage, CatalogPageOptions, CatalogsOptions } from './catalogs.ts';
export { GenerationEventType } from './types.ts';
export { ExecutionMode as ApiRunMode } from '@picsart/workflows-client';
export type { DriveConfig, AppType, AppIdentity } from './types.ts';
export type { DriveMediaItem, DriveFileDetails, DriveDraftInfo, ListOptions, MediaTypeFilter, SaveParams, UserReaction, GenerationFile, DriveFile, SdkPayload, DriveAttributes, DriveFolder, DriveSaveResult, PayloadDriveOptions, PayloadDriveFolderOptions, DriveClient, FilenameHints } from './drive.ts';
export { inferResourceType, buildFilename, resolveExtension, expectedOutputFormat, parseGeneration, buildGenerationAttributes } from './drive.ts';

// ── Polling defaults ──────────────────────────────────────────────────

/**
 * Mode-aware defaults for the async status loop. Video generations run long,
 * so they poll every 2s for up to an hour; image, audio and text land fast, so
 * they poll twice as often on a 20-minute deadline.
 *
 * Precedence, widest to narrowest: mode default → model `pollOptions` →
 * per-call `intervalMs` / `maxAttempts`.
 */
const MODE_POLL_DEFAULTS: Record<GenerationMode, { intervalMs: number; maxAttempts: number }> = {
  video: { intervalMs: 2000, maxAttempts: 1800 }, // 2s × 1800 = 1 hour
  image: { intervalMs: 1000, maxAttempts: 1200 }, // 1s × 1200 = 20 min
  audio: { intervalMs: 1000, maxAttempts: 1200 }, // 1s × 1200 = 20 min
  text: { intervalMs: 1000, maxAttempts: 1200 },  // 1s × 1200 = 20 min
};

/**
 * Merge mode default → model `pollOptions` → caller overrides. Spread alone
 * won't do: an override object carrying an explicit `undefined` would clobber
 * the layer beneath it, so each field is copied only when actually set.
 */
function resolvePollOptions(
  model: ModelDefinition,
  overrides?: WorkflowPollOptions,
): WorkflowPollOptions {
  const resolved: WorkflowPollOptions = { ...MODE_POLL_DEFAULTS[model.mode], ...model.pollOptions };
  if (overrides?.intervalMs !== undefined) resolved.intervalMs = overrides.intervalMs;
  if (overrides?.maxAttempts !== undefined) resolved.maxAttempts = overrides.maxAttempts;
  if (overrides?.signal !== undefined) resolved.signal = overrides.signal;
  return resolved;
}

/**
 * Create an AI SDK client.
 *
 * @example Simple — pass an authenticated fetch:
 * ```ts
 * const ai = createClient({ fetch: myAuthenticatedFetch });
 * ```
 *
 * @example With Drive — auto-save generations:
 * ```ts
 * const ai = createClient({
 *   fetch: myAuthenticatedFetch,
 *   drive: { folder: 'AI Playground' },
 * });
 * ```
 *
 * @example With your own transport — the SDK stops talking to the workflows
 * API entirely, so `apiUrl` and the auth source are the transport's business:
 * ```ts
 * const ai = createClient({ transport: myTransport });
 * ```
 */
export function createClient(config: ClientConfig) {
  // One seam carries every generation request: the built-in transport over
  // @picsart/workflows-client, or the caller's own via `config.transport`.
  // `ai.apis` and `ai.drive` are the two exceptions — both speak the workflows
  // protocol directly, so they keep the config's own authenticated fetch and
  // are unavailable when a transport is all that was supplied.
  const authedFetch = maybeFetch(config);
  const wc = config.apiUrl && authedFetch
    ? createWorkflowsClient(config.apiUrl, authedFetch)
    : null;

  /** The built-in transport — needs `apiUrl` plus one auth source. */
  function buildDefaultTransport(): SdkTransport {
    if (wc) return buildTransport(wc);
    throw new Error(config.apiUrl
      ? 'createClient config requires either `fetch` or `apiKey` (or a custom `transport`).'
      : 'createClient config requires `apiUrl` (or a custom `transport`).');
  }

  const transport: SdkTransport = config.transport ?? buildDefaultTransport();

  // Whether the async lifecycle exists at all is a property of the transport:
  // without the submit+poll pair every generation runs through execute(), and
  // submit()/result()/subscribe() reject instead of pretending.
  const supportsAsync = typeof transport.submit === 'function' && typeof transport.poll === 'function';

  // ai.apis — direct, low-level access to the Picsart model APIs (shares wc).
  const apis = createApis(wc);

  // Client-level input-transformation defaults; per-call options win.
  const inputsTransformationConfig = config.inputsTransformation;

  // ai.catalogs — voice/avatar catalogs served by the platform catalog tasks,
  // through the same transport as everything else.
  const catalogs = createCatalogs(transport, config.catalogs);

  // Drive client — only created when drive config is provided
  const driveConfig = config.drive;
  const driveApiUrl = config.apiUrl;
  if (driveConfig && !(authedFetch && driveApiUrl)) {
    throw new Error('createClient `drive` requires `apiUrl` plus `fetch` or `apiKey` — Drive is a REST surface, not served by a custom transport.');
  }
  const driveClient = driveConfig && authedFetch && driveApiUrl
    ? createDriveClient(authedFetch, driveApiUrl, driveConfig.folder)
    : null;

  /**
   * Map whatever a transport threw onto the SDK's ApiError contract. The
   * built-in transport already speaks ApiError (it maps the workflows client's
   * status/reason); a custom one may throw anything, which surfaces as a 502.
   * An abort of our own lifecycle signal becomes the documented 499/aborted,
   * while a foreign AbortError keeps its identity and is never wrapped.
   */
  function toApiError(err: unknown, signal?: AbortSignal): ApiError {
    if (err instanceof ApiError) return err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      if (signal?.aborted) {
        return new ApiError('Operation aborted', { status: 499, code: 'aborted' });
      }
      throw err;
    }
    return new ApiError(err instanceof Error ? err.message : String(err), {
      status: 502,
      code: 'generation_failed',
    });
  }

  /** The 400 an execute-only transport answers the async lifecycle with. */
  function unsupportedTransport(capability: string): ApiError {
    return new ApiError(`Transport does not support ${capability} (execute-only transport)`, {
      status: 400,
      code: 'unsupported_transport',
    });
  }

  /**
   * A transport result, in the shape the result parsers consume. Reaching here
   * means the job finished: a failed one throws out of the transport instead.
   */
  function asCompleted(handle: WorkflowJobHandle, res: TransportResult): WorkflowStatusResult<unknown> {
    return toCompletedStatus(handle, res.result, res.raw ?? res.result, res.usage);
  }

  /** Wait for a submitted job to finish. Rejects if the transport can't poll. */
  function pollJob(
    handle: WorkflowJobHandle,
    poll: WorkflowPollOptions,
    onProgress?: (progress: NonNullable<GenerationEvent & { type: 'generation.progress' }>['progress']) => void,
  ): Promise<TransportResult> {
    if (!transport.poll) return Promise.reject(unsupportedTransport('polling'));
    return transport.poll(handle, { ...poll, onProgress });
  }

  /**
   * Reject the async lifecycle on a transport that cannot serve it, naming the
   * half that is missing. A transport that can submit but not poll is refused
   * here too: submitting would bill a generation the SDK could never read back.
   */
  function assertAsyncLifecycle(): void {
    if (!transport.submit) throw unsupportedTransport('submit');
    if (!transport.poll) throw unsupportedTransport('polling');
  }

  /** Reject text models on the media lifecycle with the standard ApiError. */
  function assertMediaModel(model: ModelDefinition): void {
    if (model.mode === 'text') {
      throw new ApiError(`${model.name} is a text model — use generateText() instead.`, {
        status: 400,
        code: 'wrong_model_mode',
      });
    }
  }

  /**
   * Submit a job and return its id. Refuses to create a billable generation
   * when the caller already canceled; the signal is also forwarded so a
   * transport can abort the in-flight submit.
   */
  async function submitJob(workflow: string, payload: unknown, signal?: AbortSignal): Promise<string> {
    if (signal?.aborted) {
      throw new ApiError('Operation aborted', { status: 499, code: 'aborted' });
    }
    if (!transport.submit) throw unsupportedTransport('submit');
    const id = await transport.submit({ workflow, payload: payload as Record<string, unknown>, signal });
    if (!id) {
      throw new ApiError('No task id in response', { status: 502, code: 'invalid_response' });
    }
    return id;
  }

  /** Run a model's workflow (sync or async) and return the completed status. */
  async function executeModel(
    model: ModelDefinition,
    workflow: string,
    payload: unknown,
    options?: GenerateOptions,
  ): Promise<WorkflowStatusResult<unknown>> {
    const signal = options?.signal;
    try {
      // Sync models — and any transport without the submit+poll pair — run the
      // whole generation in a single execute() call.
      if (model.syncExecute || !supportsAsync) {
        // A transport that unwraps the platform envelope hands back the task
        // result directly; extractSyncResult stays for the raw shapes.
        const res = await transport.execute({ workflow, payload: payload as Record<string, unknown>, signal });
        return toCompletedStatus(
          { workflow, id: '' },
          extractSyncResult(res.result) ?? res.result,
          res.raw ?? res.result,
          res.usage,
        );
      }
      const id = await submitJob(workflow, payload, signal);
      const res = await pollJob({ workflow, id }, resolvePollOptions(model, options));
      return asCompleted({ workflow, id }, res);
    } catch (err) {
      throw toApiError(err, signal);
    }
  }

  /**
   * Build the drive options injected into the workflow payload. The SDK
   * assembles the generation attributes (model + aiSDKPayload, which captures all
   * input params); the backend persists them and stamps appId/appType on the
   * saved file. Callers may still override the filename or folder via `options.drive`.
   */
  function buildDrivePayloadOptions(
    model: ModelDefinition,
    params: Record<string, unknown> & { prompt: string },
    options?: GenerateOptions,
  ): PayloadDriveOptions | undefined {
    const explicit = options?.drive;
    if (!driveConfig && !explicit) return undefined;
    const attributes = buildGenerationAttributes({
      modelId: model.id,
      params,
      app: options?.app,
    });
    const folderPath = options?.folder?.name ?? driveConfig?.folder;
    return {
      // Named before the job runs, so the requested/declared format is the best hint.
      name: explicit?.name ?? buildFilename(params.prompt, model.mode, { format: expectedOutputFormat(model, params) }),
      // SDK-assembled attributes are the baseline; explicit attributes win per-key.
      attributes: { ...attributes, ...(explicit?.attributes ?? {}) },
      folder: explicit?.folder ?? (folderPath ? { path: folderPath } : undefined),
    };
  }

  /** Merge the SDK-level options (drive, inputs transformation) into the
   *  workflow payload's `options` object (GenAIOptions on the backend).
   *  Oversized-image downscaling is opt-in: per-call options win, then the
   *  client-level `inputsTransformation`, then disabled. Workers without input
   *  transformation ignore the field. Preserves any `options` already emitted
   *  by the model's payload builder. */
  function injectPayloadOptions(
    payload: unknown,
    drive: PayloadDriveOptions | undefined,
    inputsTransformation: PayloadInputsTransformationOptions | undefined,
  ): unknown {
    const record = payload as Record<string, unknown>;
    const existing = (record.options ?? {}) as Record<string, unknown>;
    return {
      ...record,
      options: {
        ...existing,
        inputs_transformation: {
          downscale_oversized_images:
            inputsTransformation?.downscaleOversizedImages
            ?? inputsTransformationConfig?.downscaleOversizedImages
            ?? false,
        },
        ...(drive ? { drive } : {}),
      },
    };
  }

  /**
   * Reconstruct the job handle for a bare generation id. The status route is
   * workflow-scoped and a model may run on either its primary or its edit
   * workflow, so when both exist one status probe on the primary route decides:
   * a 404 there means the job was submitted on the edit route.
   */
  async function resolveJobHandle(
    model: ModelDefinition,
    generationId: string,
    signal?: AbortSignal,
  ): Promise<WorkflowJobHandle> {
    const primary: WorkflowJobHandle = { workflow: model.workflow, id: generationId };
    if (!model.editWorkflow || !transport.status) return primary;
    try {
      await transport.status(primary, signal);
      return primary;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return { workflow: model.editWorkflow, id: generationId };
      }
      throw err;
    }
  }

  return {
    // ── Simple path ──────────────────────────────────────────────────

    /**
     * Generate content using a model.
     *
     * Validates input, builds the vendor payload, picks the right workflow,
     * submits the job, polls to completion, and returns the parsed result
     * (`items[]` with per-item URLs and promoted vendor metadata).
     * If drive options are provided (or DriveConfig is set), the backend
     * saves the result to Picsart Drive.
     */
    async generate(
      model: string,
      params: Record<string, unknown> & { prompt: string },
      options?: GenerateOptions,
    ): Promise<GenerateResult> {
      const resolved = resolveModel(model);
      assertMediaModel(resolved);
      const { workflow, payload, contract } = prepareRequest(resolved, params);
      const drive = buildDrivePayloadOptions(resolved, params, options);
      const finalPayload = injectPayloadOptions(payload, drive, options?.inputsTransformation);
      const completed = await executeModel(resolved, workflow, finalPayload, options);
      return parseResult(completed, resolved, contract);
    },

    /**
     * Generate text using an LLM model (Claude, Gemini, OpenAI).
     *
     * Validates input, builds the vendor payload, runs the workflow, and
     * returns the generated text plus the raw response. Single-shot only —
     * pass text and optional image/video, get text back. Text results are not
     * saved to Drive.
     */
    async generateText(
      model: string,
      params: Record<string, unknown> & { prompt: string },
      options?: GenerateOptions,
    ): Promise<GenerateTextResult> {
      const resolved = resolveModel(model);
      if (resolved.mode !== 'text') {
        throw new ApiError(`${resolved.name} is not a text model — use generate() instead.`, {
          status: 400,
          code: 'wrong_model_mode',
        });
      }
      const { workflow, payload } = prepareRequest(resolved, params);
      const completed = await executeModel(resolved, workflow, payload, options);
      return parseTextResult(completed, resolved);
    },

    /**
     * Get exact credit cost for a model with specific parameters.
     * Calls the backend /options endpoint for real-time pricing.
     * Returns null if pricing is unavailable.
     */
    async getCredits(
      model: string,
      params: Record<string, unknown> & { prompt: string },
    ): Promise<number | null> {
      if (!transport.options) return null;
      const resolved = resolveModel(model);
      const { workflow, payload } = prepareRequest(resolved, params);
      return await transport.options(workflow, payload) ?? null;
    },

    /** Build the vendor-specific payload for a model without submitting. */
    buildPayload(
      model: string,
      params: Record<string, unknown> & { prompt: string },
    ): Record<string, unknown> {
      const resolved = resolveModel(model);
      const { payload } = prepareRequest(resolved, params);
      return payload;
    },

    // ── Advanced lifecycle ────────────────────────────────────────────

    /** Submit a generation job and get its generation id back. Media models
     *  only — text models have no async lifecycle (`result()`/`subscribe()`
     *  reject them). Pass the id to `result(model, id)` / `subscribe(model, id)`. */
    async submit(
      model: string,
      params: Record<string, unknown> & { prompt: string },
      options?: GenerateOptions,
    ): Promise<string> {
      const resolved = resolveModel(model);
      assertMediaModel(resolved);
      assertAsyncLifecycle();
      const { workflow, payload } = prepareRequest(resolved, params);
      const drive = buildDrivePayloadOptions(resolved, params, options);
      const finalPayload = injectPayloadOptions(payload, drive, options?.inputsTransformation);
      try {
        return await submitJob(workflow, finalPayload, options?.signal);
      } catch (err) {
        throw toApiError(err, options?.signal);
      }
    },

    /** Poll a submitted job until it completes and return the parsed result. */
    async result(
      model: string,
      generationId: string,
      options?: GenerationOptions,
    ): Promise<GenerateResult> {
      const resolved = resolveModel(model);
      assertMediaModel(resolved);
      const contract = getModelContract(resolved.id);
      assertAsyncLifecycle();
      const handle = await resolveJobHandle(resolved, generationId, options?.signal);
      let completed: WorkflowStatusResult<unknown>;
      try {
        completed = asCompleted(handle, await pollJob(handle, resolvePollOptions(resolved, options)));
      } catch (err) {
        throw toApiError(err, options?.signal);
      }
      return parseResult(completed, resolved, contract);
    },

    /**
     * Subscribe to live updates for a submitted job. Yields one
     * {@link GenerationEvent} per poll: `generation.progress` while running,
     * then a single terminal `generation.completed` (with the parsed result)
     * or `generation.failed` (with the {@link ApiError} `result()` would have
     * thrown). Failures arrive as events, not exceptions.
     *
     * ```ts
     * const id = await ai.submit(Models.Flux2Pro, { prompt: 'a cat' });
     * for await (const e of ai.subscribe(Models.Flux2Pro, id)) {
     *   if (e.type === 'generation.progress') console.log(e.progress?.percent);
     *   if (e.type === 'generation.completed') console.log(e.result.url);
     *   if (e.type === 'generation.failed') console.error(e.error.message);
     * }
     * ```
     */
    subscribe(
      model: string,
      generationId: string,
      options?: GenerationOptions,
    ): AsyncGenerator<GenerationEvent, void, void> {
      const resolved = resolveModel(model);
      assertMediaModel(resolved);
      // A transport that cannot poll is a configuration error, not a failed
      // generation, so it throws here rather than arriving as an event.
      assertAsyncLifecycle();
      const contract = getModelContract(resolved.id);
      return (async function* (): AsyncGenerator<GenerationEvent, void, void> {
        // The contract says failures arrive as events — that includes a
        // failing edit-route probe, not just poll failures.
        let handle: WorkflowJobHandle;
        try {
          handle = await resolveJobHandle(resolved, generationId, options?.signal);
        } catch (err) {
          yield { type: 'generation.failed', error: toApiError(err, options?.signal) };
          return;
        }
        // Stop polling when the consumer stops consuming: breaking out of the
        // for-await (or calling return()) runs the finally below, which aborts
        // the in-flight poll instead of letting it hit the network until the
        // job completes. The caller's own signal feeds the same controller.
        // (AbortSignal.any needs Node 20.3+; engines allow 20.0, so combine
        // manually.)
        const poll = new AbortController();
        if (options?.signal) {
          if (options.signal.aborted) poll.abort();
          else options.signal.addEventListener('abort', () => poll.abort(), { once: true });
        }
        // Bridge the transport's onProgress callback into the generator, racing
        // it against the terminal outcome of the same poll call.
        const queue: NonNullable<GenerationEvent & { type: 'generation.progress' }>['progress'][] = [];
        // Wake-up channel that is never unarmed: `wake` always points at the
        // live waker's resolver, so a progress callback can never fire into a
        // gap. A stale wake() (waker already consumed) is a no-op; the loop
        // re-checks the queue after every await/yield, so a spurious wake just
        // loops once.
        let wake!: () => void;
        let waker = new Promise<null>((resolve) => { wake = () => resolve(null); });
        const done = pollJob(
          handle,
          { ...resolvePollOptions(resolved, options), signal: poll.signal },
          (p) => {
            queue.push(p);
            wake();
          },
        ).then(
          (res) => ({ ok: true as const, res }),
          (err) => ({ ok: false as const, err }),
        );
        try {
        for (;;) {
          while (queue.length) yield { type: 'generation.progress', progress: queue.shift() };
          const raced = await Promise.race([done, waker]);
          if (raced === null) {
            // Fresh progress arrived — re-arm before draining so a push during
            // a drain yield still lands on a live waker, then race again.
            waker = new Promise<null>((resolve) => { wake = () => resolve(null); });
            continue;
          }
          while (queue.length) yield { type: 'generation.progress', progress: queue.shift() };
          if (!raced.ok) {
            yield { type: 'generation.failed', error: toApiError(raced.err, options?.signal) };
            return;
          }
          const completed = asCompleted(handle, raced.res);
          try {
            // A FAILED task resolves with its FailedResult payload as the
            // result; parseResult converts it into the same ApiError result()
            // would have thrown.
            yield { type: 'generation.completed', result: parseResult(completed, resolved, contract) };
          } catch (err) {
            yield { type: 'generation.failed', error: toApiError(err, options?.signal) };
          }
          return;
        }
        } finally {
          // Runs on normal completion (no-op: the poll already settled) and on
          // early consumer exit (break / return()), where it cancels polling.
          poll.abort();
        }
      })();
    },

    // ── apis (direct, low-level API access) ───────────────────────────

    /** Direct, low-level access to the Picsart model APIs. See `./apis.ts`. */
    apis,

    // ── Catalogs (voices / avatars) ──────────────────────────────────

    /** Voice/avatar catalogs — fetch, ttl-cache, hydrate model params. See `./catalogs.ts`. */
    catalogs,

    // ── Drive ────────────────────────────────────────────────────────

    /** Drive operations. Only available when drive config is provided. */
    drive: driveClient ?? undefined,
  } as AiClient;
}

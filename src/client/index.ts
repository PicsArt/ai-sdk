import type { ModelDefinition } from '../core/types.ts';
import {
  createWorkflowClient,
  type WorkflowJobHandle,
  type WorkflowStatusResult,
  type WorkflowPollOptions,
  type WorkflowSubscribeOptions,
  type WorkflowRunOptions,
} from '../core/workflow.ts';
import { getModelContract } from '../core/contracts.ts';
import { extractSyncResult, toCompletedStatus } from '../core/response.ts';
import { resolveModel } from '../core/resolve.ts';

import type { ClientConfig, SdkTransport, GenerateResult, GenerateTextResult, GenerateOptions, AiClient } from './types.ts';
import type { PayloadDriveOptions } from './drive.ts';
import { buildTransport, isClientConfig, resolveFetch } from './transport.ts';
import { prepareRequest, parseResult, parseTextResult } from './prepare.ts';
import { createDriveClient, buildFilename, buildGenerationAttributes } from './drive.ts';
import { createApis } from './apis.ts';
import { createCatalogs } from './catalogs.ts';

// ── Re-export types for the public API ──
export type { ClientConfig, AuthenticatedFetch, SdkTransport, GenerateResult, GenerateResultItem, GenerateTextResult, GenerateOptions, WorkflowJobHandle, CreditUsage, ToolUsage, AiClient, MediaModelId } from './types.ts';
export type { ApiResponse, ApiRunOptions, ApiSchemas, ApisClient } from './apis.ts';
export type { CatalogsClient, CatalogPage, CatalogPageOptions, CatalogsOptions } from './catalogs.ts';
export { ExecutionMode as ApiRunMode } from '@picsart/workflows-client';
export type { DriveConfig, AppType, AppIdentity } from './types.ts';
export type { DriveMediaItem, DriveFileDetails, ListOptions, MediaTypeFilter, SaveParams, UserReaction, GenerationFile, DriveFile, SdkPayload, DriveAttributes, DriveFolder, DriveSaveResult, PayloadDriveOptions, PayloadDriveFolderOptions, DriveClient } from './drive.ts';
export { inferResourceType, buildFilename, parseGeneration, buildGenerationAttributes } from './drive.ts';

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
 */
export function createClient(config: ClientConfig | SdkTransport) {
  const isConfig = isClientConfig(config);
  const transport: SdkTransport = isConfig ? buildTransport(config) : config;
  const client = createWorkflowClient<unknown>(transport, { pollingIntervalMs: 2000 });

  // Execute-only transports (no submit) can't submit-and-poll, so every
  // generation must go through the synchronous execute path.
  const supportsSubmit = typeof transport.submit === 'function';

  // ai.apis — direct, low-level access to the Picsart model APIs.
  const apis = createApis(isConfig ? config : null);

  // ai.catalogs — voice/avatar catalogs served by the platform catalog tasks.
  const catalogs = createCatalogs(transport, isConfig ? config.catalogs : undefined);

  // Drive client — only created when drive config is provided
  const driveConfig = isConfig ? config.drive : undefined;
  const driveClient = (isConfig && driveConfig)
    ? createDriveClient(resolveFetch(config), config.apiUrl, driveConfig.folder)
    : null;

  /** Run a model's workflow (sync or async) and return the completed status. */
  async function executeModel(
    model: ModelDefinition,
    workflow: string,
    payload: unknown,
    signal?: AbortSignal,
  ): Promise<WorkflowStatusResult<unknown>> {
    if (model.syncExecute || !supportsSubmit) {
      const syncResponse = await client.run(
        { workflow, payload, signal },
        { mode: 'sync' },
      );
      return toCompletedStatus(
        syncResponse.handle,
        extractSyncResult(syncResponse.raw),
        syncResponse.raw,
        syncResponse.usage,
      );
    }
    return client.run({ workflow, payload, signal });
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
      name: explicit?.name ?? buildFilename(params.prompt, model.mode),
      // SDK-assembled attributes are the baseline; explicit attributes win per-key.
      attributes: { ...attributes, ...(explicit?.attributes ?? {}) },
      folder: explicit?.folder ?? (folderPath ? { path: folderPath } : undefined),
    };
  }

  /** Merge drive options into the workflow payload. */
  function injectDriveOptions(payload: unknown, drive: PayloadDriveOptions | undefined): unknown {
    if (!drive) return payload;
    return { ...(payload as Record<string, unknown>), options: { drive } };
  }

  return {
    // ── Simple path ──────────────────────────────────────────────────

    /**
     * Generate content using a model.
     *
     * Validates input, builds the vendor payload, picks the right workflow,
     * submits the job, polls to completion, and returns the result URL.
     * If drive options are provided (or DriveConfig is set), the backend
     * saves the result to Picsart Drive.
     */
    async generate(
      model: string,
      params: Record<string, unknown> & { prompt: string },
      options?: GenerateOptions,
    ): Promise<GenerateResult> {
      const resolved = resolveModel(model);
      if (resolved.mode === 'text') {
        throw new Error(`${resolved.name} is a text model — use generateText() instead.`);
      }
      const { workflow, payload, contract } = prepareRequest(resolved, params);
      const drive = buildDrivePayloadOptions(resolved, params, options);
      const finalPayload = injectDriveOptions(payload, drive);
      const completed = await executeModel(resolved, workflow, finalPayload, options?.signal);
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
        throw new Error(`${resolved.name} is not a text model — use generate() instead.`);
      }
      const { workflow, payload } = prepareRequest(resolved, params);
      const completed = await executeModel(resolved, workflow, payload, options?.signal);
      return parseTextResult(completed, resolved);
    },

    /** @deprecated Use `getCredits()` instead. */
    async estimate(
      model: string,
      params: Record<string, unknown> & { prompt: string },
    ): Promise<number | null> {
      if (!transport.options) return null;
      const resolved = resolveModel(model);
      const { workflow, payload } = prepareRequest(resolved, params);
      return await transport.options(workflow, payload) ?? null;
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

    /** Submit a generation job and get a handle back. */
    async submit(
      model: string,
      params: Record<string, unknown> & { prompt: string },
      options?: GenerateOptions,
    ): Promise<WorkflowJobHandle> {
      const resolved = resolveModel(model);
      const { workflow, payload } = prepareRequest(resolved, params);
      const drive = buildDrivePayloadOptions(resolved, params, options);
      const finalPayload = injectDriveOptions(payload, drive);
      return client.submit({ workflow, payload: finalPayload, signal: options?.signal });
    },

    /** Check the current status of a submitted job. */
    async status(
      handle: WorkflowJobHandle,
      signal?: AbortSignal,
    ): Promise<WorkflowStatusResult<unknown>> {
      return client.status(handle, signal);
    },

    /** Poll a submitted job until it completes and return the parsed result. */
    async result(
      handle: WorkflowJobHandle,
      model: string,
      options?: WorkflowPollOptions,
    ): Promise<GenerateResult> {
      const resolved = resolveModel(model);
      const contract = getModelContract(resolved.id);
      const completed = await client.result(handle, options);
      return parseResult(completed, resolved, contract);
    },

    /**
     * Subscribe to live status updates for a submitted job.
     *
     * ```ts
     * const handle = await ai.submit(Models.Flux2Pro, { prompt: 'a cat' });
     * for await (const update of ai.subscribe(handle)) {
     *   console.log(update.status, update.progress);
     * }
     * ```
     */
    subscribe(
      handle: WorkflowJobHandle,
      options?: WorkflowSubscribeOptions,
    ): AsyncGenerator<WorkflowStatusResult<unknown>, WorkflowStatusResult<unknown>, void> {
      return client.subscribe(handle, options);
    },

    // ── Raw workflow access ──────────────────────────────────────────

    /**
     * Run a raw workflow (not tied to a model).
     * @deprecated Use `apis.run()` instead.
     */
    async runWorkflow<TResult = unknown>(
      workflow: string,
      payload: Record<string, unknown>,
      options?: WorkflowRunOptions,
    ): Promise<TResult> {
      const done = await client.run<TResult>(
        { workflow, payload, signal: options?.signal },
        options,
      );
      if (done.status === 'FAILED' || done.status === 'CANCELED') {
        throw new Error(done.error ?? `${workflow} failed with status ${done.status}`);
      }
      if (done.result === undefined) {
        throw new Error(`${workflow} completed but returned no result`);
      }
      return done.result as TResult;
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

// ── ai.apis ───────────────────────────────────────────────────────────
// Direct, low-level access to the Picsart model APIs, backed by the official
// @picsart/workflows-client. This is the escape hatch beneath generate()/
// generateText(): run any model API by name, with typed params/result when the
// name is known to @picsart/workflows-types.

import type {
  WorkflowsClient,
  ExecutionOptions,
  WorkflowResponse,
  WorkflowTypes,
} from '@picsart/workflows-client';
import { ApiError } from '../core/errors.ts';
import { toApiError } from './workflows-error.ts';

// ── Public ai.apis types ──────────────────────────────────────────────
// Friendly public aliases over @picsart/workflows-client's vocabulary, so the
// SDK surface reads as "apis" instead of leaking "workflow" terms.

/** Result of `ai.apis.run()` — the API result plus optional credit usage. */
export type ApiResponse<R = unknown> = WorkflowResponse<R>;
/**
 * Options for `ai.apis.run()` — execution mode, polling, abort signal, progress callbacks.
 * Intentionally omits the lib's `remoteSettingName` (a no-op without remote settings),
 * `onPartialResult`, and `notificationConfig` — these aren't part of the SDK surface.
 */
export type ApiRunOptions = Omit<ExecutionOptions, 'remoteSettingName' | 'onPartialResult' | 'notificationConfig'>;
/** Registry of known API names → their params/result types (from @picsart/workflows-types). */
export type ApiSchemas = WorkflowTypes;

/**
 * The `ai.apis` surface — direct, low-level access to the Picsart model APIs.
 * Known API names (keys of {@link ApiSchemas}) get typed params + result;
 * unknown names take an open payload and return an unknown result.
 *
 * Failures arrive as {@link ApiError}, the same as the generation surface.
 */
export interface ApisClient {
  /** Run an API by name (mirrors WorkflowsClient.run()). */
  run<W extends string = string>(
    api: W,
    payload: W extends keyof ApiSchemas ? ApiSchemas[W]['params'] : Record<string, unknown>,
    options?: ApiRunOptions,
  ): Promise<ApiResponse<W extends keyof ApiSchemas ? ApiSchemas[W]['result'] : unknown>>;
}

/**
 * Build the `ai.apis` surface over the client's shared WorkflowsClient.
 *
 * `null` when the config carried no `apiUrl` + `fetch`/`apiKey` pair to build
 * one from — a client running purely on a custom transport. The surface still
 * exists so `ai.apis` is never undefined; calling it says why it can't run.
 */
export function createApis(client: WorkflowsClient | null): ApisClient {
  return {
    async run(api: string, payload: Record<string, unknown>, options?: ApiRunOptions) {
      if (!client) {
        throw new ApiError(
          '`ai.apis` requires `apiUrl` plus `fetch` or `apiKey` on createClient — the workflows APIs are not served by a custom transport.',
          { status: 400, code: 'unsupported_transport' },
        );
      }
      // Forward only the options we expose — strip the lib fields we deliberately
      // omit from ApiRunOptions, so they never reach the workflows client even
      // when passed by an untyped (JS) caller.
      const forwarded = { ...(options ?? {}) } as ExecutionOptions;
      delete forwarded.remoteSettingName;
      delete forwarded.onPartialResult;
      delete forwarded.notificationConfig;
      try {
        return await client.run(api, payload, forwarded);
      } catch (err) {
        // ApiError is the SDK's only error type — the workflows client's own
        // error never reaches a caller, here or anywhere else.
        throw toApiError(err, api);
      }
    },
    // The public conditional-typed signature lives on ApisClient; the runtime
    // impl is uniform, so we assert the shape here.
  } as ApisClient;
}

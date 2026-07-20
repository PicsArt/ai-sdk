// ── ai.apis ───────────────────────────────────────────────────────────
// Direct, low-level access to the Picsart model APIs, backed by the official
// @picsart/workflows-client. This is the escape hatch beneath generate()/
// generateText(): run any model API by name, with typed params/result when the
// name is known to @picsart/workflows-types.

import {
  WorkflowsClient,
  type ExecutionOptions,
  type WorkflowResponse,
  type WorkflowTypes,
} from '@picsart/workflows-client';

import { resolveFetch } from './transport.ts';
import type { ClientConfig } from './types.ts';

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
 * Build the `ai.apis` surface.
 *
 * Pass the resolved {@link ClientConfig}, or `null` when the SDK was created
 * from a raw `SdkTransport` (no authenticated fetch) — in that case the methods
 * throw a clear error, since there's no transport to reach the platform with.
 */
export function createApis(config: ClientConfig | null): ApisClient {
  const f = config ? resolveFetch(config) : null;
  const client = config && f
    ? new WorkflowsClient({
        baseUrl: config.apiUrl,
        fetch: (input, init) =>
          f(typeof input === 'string' ? input : input.toString(), init),
      })
    : null;

  return {
    async run(api: string, payload: Record<string, unknown>, options?: ApiRunOptions) {
      if (!client) {
        throw new Error('ai.apis requires a client created with a ClientConfig (authenticated fetch).');
      }
      // Forward only the options we expose — strip the lib fields we deliberately
      // omit from ApiRunOptions, so they never reach the workflows client even
      // when passed by an untyped (JS) caller.
      const forwarded = { ...(options ?? {}) } as ExecutionOptions;
      delete forwarded.remoteSettingName;
      delete forwarded.onPartialResult;
      delete forwarded.notificationConfig;
      return client.run(api, payload, forwarded);
    },
    // The public conditional-typed signature lives on ApisClient; the runtime
    // impl is uniform, so we assert the shape here.
  } as ApisClient;
}

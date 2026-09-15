// ── The built-in transport ────────────────────────────────────────────
// The default SdkTransport: every lifecycle request the SDK makes, served by
// @picsart/workflows-client (submit → runPolling, execute via SYNC mode, the
// single-shot result read, and the /options credit estimate). Swap the whole
// thing out with `createClient({ transport })`.

import { WorkflowsClient, ExecutionMode } from '@picsart/workflows-client';

import type {
  SdkTransport,
  TransportPollOptions,
  TransportResult,
  WorkflowJobHandle,
} from '../core/workflow.ts';
import type { AuthenticatedFetch, ClientConfig } from './types.ts';
import { ApiError } from '../core/errors.ts';
import { toApiError } from './workflows-error.ts';

/**
 * Attribution headers the gateway requires on every request. The `apiKey` fetch
 * sends these so a key alone is enough to reach the API; already-present values
 * are left alone, so a caller-supplied header still wins.
 *
 * Callers on the custom-`fetch` path own their headers entirely — they must set
 * these themselves (see `__tests__/e2e/helpers/ai-sdk-test-client.ts`).
 */
const GATEWAY_HEADERS: Record<string, string> = {
  'platform': 'api',
  'X-Touchpoint': 'sdk',
};

/**
 * The authenticated fetch the SDK uses for every request it makes itself: the
 * caller-supplied `fetch` when present, otherwise a fetch built from `apiKey`
 * that adds `Authorization: Bearer <apiKey>` plus the required gateway
 * attribution headers on top of the global `fetch`. `null` when the config
 * carries neither — legal only when a custom `transport` owns the wire.
 */
export function maybeFetch(config: ClientConfig): AuthenticatedFetch | null {
  if (config.fetch) return config.fetch;
  if (config.apiKey) {
    const token = config.apiKey.replace(/^Bearer\s+/i, '');
    return (url, init) => {
      const headers = new Headers(init?.headers);
      headers.set('Authorization', `Bearer ${token}`);
      for (const [name, value] of Object.entries(GATEWAY_HEADERS)) {
        if (!headers.has(name)) headers.set(name, value);
      }
      return globalThis.fetch(url, { ...init, headers });
    };
  }
  return null;
}

/**
 * The workflows client the built-in transport (and `ai.apis`) runs on.
 * Shared, so both speak to the platform through the same authenticated fetch.
 */
export function createWorkflowsClient(apiUrl: string, authedFetch: AuthenticatedFetch): WorkflowsClient {
  return new WorkflowsClient({
    baseUrl: apiUrl,
    // AuthenticatedFetch takes a string url; the client's fetch type accepts
    // URL/Request inputs too. Normalize without losing the Request's own url,
    // method, headers, or body (the client passes plain string urls today,
    // but the contract allows more).
    fetch: (input, init) => {
      if (input instanceof Request) {
        return authedFetch(input.url, init ?? {
          method: input.method,
          headers: input.headers,
          body: input.body,
          signal: input.signal,
        });
      }
      return authedFetch(typeof input === 'string' ? input : input.toString(), init);
    },
  });
}

/** Build the default {@link SdkTransport} over a workflows client. */
export function buildTransport(wc: WorkflowsClient): SdkTransport {
  // The client returns the platform's whole task record; the SDK takes the
  // result and the usage off it. `raw` stays the task result — it is what
  // GenerateTextResult.raw exposes, and the envelope's id/updated/status are
  // no business of a caller's.
  const asResult = (res: { result?: unknown; usage?: unknown }): TransportResult => ({
    result: res.result,
    usage: res.usage as TransportResult['usage'],
    raw: res.result,
  });

  return {
    async execute(request) {
      try {
        const res = await wc.run(request.workflow, request.payload, {
          mode: ExecutionMode.SYNC,
          abortSignal: request.signal,
        });
        return asResult(res);
      } catch (err) {
        throw toApiError(err, request.workflow);
      }
    },

    async submit(request) {
      try {
        // The signal is forwarded so the client can abort the in-flight submit
        // once it supports it (postTask ignores it today).
        const id = await wc.submit(request.workflow, request.payload, { abortSignal: request.signal });
        if (!id) {
          throw new ApiError('No task id in response', { status: 502, code: 'invalid_response' });
        }
        return id;
      } catch (err) {
        throw toApiError(err, request.workflow);
      }
    },

    async poll(handle: WorkflowJobHandle, options?: TransportPollOptions) {
      try {
        const res = await wc.runPolling(handle.workflow, handle.id, {
          pollingInterval: options?.intervalMs,
          retriesCount: options?.maxAttempts,
          abortSignal: options?.signal,
          onProgress: options?.onProgress,
        });
        // Resolving means the task succeeded: the platform answers a failed
        // task with a 4xx/5xx, which the client throws and toApiError maps.
        return asResult(res);
      } catch (err) {
        throw toApiError(err, handle.workflow, handle.id);
      }
    },

    async status(handle: WorkflowJobHandle, signal?: AbortSignal) {
      if (signal?.aborted) {
        throw new ApiError('Operation aborted', { status: 499, code: 'aborted' });
      }
      try {
        return asResult(await wc.result(handle.workflow, handle.id));
      } catch (err) {
        throw toApiError(err, handle.workflow, handle.id);
      }
    },

    async options(workflow, payload) {
      // Pricing is best-effort: getCredits() answers null rather than failing a
      // generation flow over an estimate.
      try {
        const res = await wc.options(workflow, payload);
        return typeof res?.credits === 'number' ? res.credits : null;
      } catch { return null; }
    },
  };
}

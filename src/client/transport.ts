import type { AuthenticatedFetch, ClientConfig, SdkTransport } from './types.ts';
import { ApiError, readErrorBody, reasonFrom } from '../core/errors.ts';

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
 * Resolve the authenticated fetch the SDK uses for every request: the
 * caller-supplied `fetch` when present, otherwise a fetch built from `apiKey`
 * that adds `Authorization: Bearer <apiKey>` plus the required gateway
 * attribution headers on top of the global `fetch`.
 */
export function resolveFetch(config: ClientConfig): AuthenticatedFetch {
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
  throw new Error('createClient config requires either `fetch` or `apiKey`.');
}

/** Build a full SdkTransport from an authenticated fetch function. */
export function buildTransport(config: ClientConfig): SdkTransport {
  const apiUrl = config.apiUrl;
  const f = resolveFetch(config);

  const jsonPost = async (url: string, body: unknown, signal?: AbortSignal): Promise<Response> =>
    f(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });

  return {
    async submit(request) {
      const res = await jsonPost(
        `${apiUrl}/workflows/${request.workflow}/submit`,
        { params: request.payload },
        request.signal,
      );
      // Read the body before branching on `ok`: a non-JSON error body (a gateway
      // HTML page, an empty 401) used to surface as a JSON SyntaxError that lost
      // the status entirely.
      const { text, json } = await readErrorBody(res);
      if (!res.ok) {
        const detail = json ? json.message ?? JSON.stringify(json) : text;
        throw new ApiError(`Submit failed (${res.status}): ${detail}`, {
          status: res.status,
          code: reasonFrom(json, res.status),
        });
      }
      const response = json?.response as Record<string, unknown> | undefined;
      const id = response?.id ?? json?.id;
      if (!id) {
        throw new ApiError(`No task id in response: ${json ? JSON.stringify(json) : text}`, {
          status: 502,
          code: 'invalid_response',
        });
      }
      return { workflow: request.workflow, id: String(id) };
    },

    async status(handle, signal) {
      const res = await f(`${apiUrl}/workflows/${handle.workflow}/${handle.id}/result`, { signal });
      if (!res.ok) {
        const { text, json } = await readErrorBody(res);
        // Prefer the platform's own `message` over the raw body — a task failure
        // returns `{ status: 'error', reason, message }`, and dumping the whole
        // JSON here is what a caller ends up showing a user. Falls back to the
        // raw text when the body carries no `message`.
        const detail = json ? json.message ?? text : text;
        throw new ApiError(`Status check failed (${res.status}): ${detail}`, {
          status: res.status,
          code: reasonFrom(json, res.status),
        });
      }
      return res.json();
    },

    async execute(request) {
      const res = await jsonPost(
        `${apiUrl}/workflows/${request.workflow}/execute`,
        { params: request.payload },
        request.signal,
      );
      if (!res.ok) {
        const { text, json } = await readErrorBody(res);
        // Prefer the platform's own `message` over the raw body — a task failure
        // returns `{ status: 'error', reason, message }`, and dumping the whole
        // JSON here is what a caller ends up showing a user. Falls back to the
        // raw text when the body carries no `message`.
        const detail = json ? json.message ?? text : text;
        throw new ApiError(`Execute failed (${res.status}): ${detail}`, {
          status: res.status,
          code: reasonFrom(json, res.status),
        });
      }
      return res.json();
    },

    async options(workflow, payload) {
      try {
        const res = await jsonPost(`${apiUrl}/workflows/${workflow}/options`, { params: payload });
        if (!res.ok) return null;
        const data = await res.json() as Record<string, unknown>;
        const response = data.response as Record<string, unknown> | undefined;
        const credits = response?.credits;
        return typeof credits === 'number' ? credits : null;
      } catch { return null; }
    },
  };
}

/** Type guard: is this a ClientConfig (has fetch or apiKey) or a raw SdkTransport? */
export function isClientConfig(input: ClientConfig | SdkTransport): input is ClientConfig {
  return (
    ('fetch' in input && typeof input.fetch === 'function') ||
    ('apiKey' in input && typeof input.apiKey === 'string')
  );
}

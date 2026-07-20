import type { AuthenticatedFetch, ClientConfig, SdkTransport } from './types.ts';

/**
 * Resolve the authenticated fetch the SDK uses for every request: the
 * caller-supplied `fetch` when present, otherwise a fetch built from `apiKey`
 * that adds `Authorization: Bearer <apiKey>` on top of the global `fetch`.
 */
export function resolveFetch(config: ClientConfig): AuthenticatedFetch {
  if (config.fetch) return config.fetch;
  if (config.apiKey) {
    const token = config.apiKey.replace(/^Bearer\s+/i, '');
    return (url, init) => {
      const headers = new Headers(init?.headers);
      headers.set('Authorization', `Bearer ${token}`);
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
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) {
        throw new Error(`Submit failed (${res.status}): ${(data as Record<string, unknown>).message ?? JSON.stringify(data)}`);
      }
      const response = data.response as Record<string, unknown> | undefined;
      const id = response?.id ?? data.id;
      if (!id) throw new Error(`No task id in response: ${JSON.stringify(data)}`);
      return { workflow: request.workflow, id: String(id) };
    },

    async status(handle, signal) {
      const res = await f(`${apiUrl}/workflows/${handle.workflow}/${handle.id}/result`, { signal });
      if (!res.ok) throw new Error(`Status check failed (${res.status}): ${await res.text()}`);
      return res.json();
    },

    async execute(request) {
      const res = await jsonPost(
        `${apiUrl}/workflows/${request.workflow}/execute`,
        { params: request.payload },
        request.signal,
      );
      if (!res.ok) throw new Error(`Execute failed (${res.status}): ${await res.text()}`);
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

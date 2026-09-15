/**
 * SDK client factory for the e2e — authenticates @picsart/ai-sdk with a bearer
 * token (PICSART_TOKEN) via an injected fetch.
 *
 * All HTTP goes through the SDK itself (`getCredits()` → resolveModel →
 * prepareRequest → buildPayload + workflow/editWorkflow selection → /options),
 * so the test exercises the real consumer path rather than a hand-rolled call.
 */
import { createClient, type AiClient } from '../../../src';
import { recordOptionsError, recordOptionsResponse } from './options-probe.ts';

/**
 * Default gateway — the public production gateway. Point the run at a different
 * environment with PICSART_API_URL (CI sets it; see `.env.example` for local use).
 */
const DEFAULT_API_URL = 'https://api.picsart.com';

export interface ClientConfig {
  /** Gateway base URL. Defaults to process.env.PICSART_API_URL, then the production gateway. */
  apiUrl?: string;
  /** Bearer token. Defaults to process.env.PICSART_TOKEN. */
  token?: string;
}

function makeHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'country-code': 'US',
    'platform': 'test',
    'X-Touchpoint': 'ai-sdk.e2e',
  };
}

/** Build the SDK client used by the e2e, authenticated from PICSART_TOKEN. */
export function createTestClient(config: ClientConfig = {}): AiClient {
  const token = config.token ?? process.env.PICSART_TOKEN;
  if (!token) {
    throw new Error('Missing PICSART_TOKEN env var. Set it before running the e2e.');
  }
  const apiUrl = config.apiUrl ?? process.env.PICSART_API_URL ?? DEFAULT_API_URL;
  const authHeaders = makeHeaders(token);

  return createClient({
    apiUrl,
    // Merge through Headers, not object spread: the SDK's internals pass
    // header names lowercased (they go through a Headers instance), so a
    // plain-object spread of {'Content-Type': ...} + {'content-type': ...}
    // produces DUPLICATE headers on the wire ("application/json,
    // application/json") and the gateway rejects the request. Headers#set
    // is case-insensitive; caller-provided headers win, auth defaults fill in.
    fetch: async (url, init) => {
      const headers = new Headers(init?.headers);
      for (const [name, value] of Object.entries(authHeaders)) {
        if (!headers.has(name)) headers.set(name, value);
      }
      const merged = { ...init, headers };
      const isOptions = String(url).endsWith('/options');
      if (!isOptions) return fetch(url, merged);

      try {
        const res = await fetch(url, merged);
        // clone() so reading the body here doesn't consume the stream the SDK reads.
        let body = '';
        try {
          body = (await res.clone().text()).slice(0, 300);
        } catch {
          // A body that can't be re-read is still worth reporting by status alone.
        }
        recordOptionsResponse(res.status, res.statusText, body);
        return res;
      } catch (err) {
        // transport.options swallows this into null; record it, then let it through.
        recordOptionsError(err);
        throw err;
      }
    },
  });
}

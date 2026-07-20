/**
 * SDK client factory for the e2e — authenticates @picsart/ai-sdk with a bearer
 * token (PICSART_TOKEN) via an injected fetch.
 *
 * All HTTP goes through the SDK itself (`getCredits()` → resolveModel →
 * prepareRequest → buildPayload + workflow/editWorkflow selection → /options),
 * so the test exercises the real consumer path rather than a hand-rolled call.
 */
import { createClient, type AiClient } from '../../../src';

/** Default gateway — staging. Override with PICSART_API_URL (prod: https://api.picsart.com). */
const DEFAULT_API_URL = 'https://api-stage.picsartstage2.com';

export interface ClientConfig {
  /** Gateway base URL. Defaults to process.env.PICSART_API_URL, then the staging gateway. */
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
    fetch: (url, init) =>
      fetch(url, {
        ...init,
        headers: { ...authHeaders, ...((init?.headers as Record<string, string> | undefined) ?? {}) },
      }),
  });
}

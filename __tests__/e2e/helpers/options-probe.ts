/**
 * What the last `/options` call actually answered.
 *
 * `transport.options` maps every distinct failure — a non-2xx, a thrown fetch,
 * a 2xx whose `credits` isn't a number — onto the same `null`, so `getCredits`
 * alone cannot say why pricing was unavailable. The e2e injects its own fetch,
 * so it records the real answer here and quotes it in failure messages.
 *
 * Deliberately free of SDK imports so the predicates below stay unit-testable
 * without pulling in the client (and its private-registry dependency).
 */

export interface OptionsProbe {
  /** HTTP status, or null when the fetch itself threw. */
  status: number | null;
  statusText: string;
  /** First 300 chars of the response body; '' when unreadable. */
  body: string;
  /** Set only when the fetch threw. */
  error?: string;
}

let lastOptions: OptionsProbe | undefined;

/** Record a completed `/options` response. */
export function recordOptionsResponse(status: number, statusText: string, body: string): void {
  lastOptions = { status, statusText, body: body.slice(0, 300) };
}

/** Record an `/options` fetch that threw before producing a response. */
export function recordOptionsError(err: unknown): void {
  lastOptions = { status: null, statusText: '', body: '', error: String(err) };
}

/** The probe for the most recent `/options` call, or undefined if none yet. */
export function lastOptionsResponse(): OptionsProbe | undefined {
  return lastOptions;
}

/** One-line rendering for assertion messages. */
export function describeLastOptions(): string {
  const p = lastOptions;
  if (!p) return 'no /options call recorded';
  if (p.status === null) return `fetch threw: ${p.error}`;
  return `HTTP ${p.status} ${p.statusText} — ${p.body || '<empty body>'}`;
}

/**
 * Is this worth one retry? A 429 or 5xx, and a fetch that threw, are the
 * gateway or the network having a moment. Anything else — a 4xx, or a 2xx that
 * simply carried no credits — is a real answer we must not paper over.
 */
export function isTransient(p: OptionsProbe | undefined): boolean {
  if (!p) return false;
  if (p.status === null) return true;
  return p.status === 429 || p.status >= 500;
}

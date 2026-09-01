// ── Unified SDK error ─────────────────────────────────────────────────
// Every failure thrown out of generate() / generateText() / submit() /
// result() is an ApiError carrying the same four fields, so callers can
// branch on `status`/`code` instead of pattern-matching `message`.
//
// Message strings are preserved verbatim from earlier versions, with one
// deliberate exception: the status/execute paths now surface the platform's
// own `message` instead of dumping the raw JSON error body. Existing string
// matchers keep working; the fields are the supported path forward.

/**
 * Failure codes the SDK synthesizes when the platform supplies no `reason`.
 * An API-supplied `reason` passes through unchanged, so the open `string`
 * member keeps arbitrary platform reasons assignable while preserving
 * autocomplete on the known set.
 */
export type ApiErrorCode =
  // Client-side, before any request leaves the process
  | 'unknown_model'
  | 'wrong_model_mode'
  | 'validation_error'
  | 'unsupported_transport'
  // Lifecycle
  | 'timeout'
  | 'aborted'
  | 'canceled'
  | 'generation_failed'
  | 'invalid_response'
  // Conventional slugs derived from an HTTP status when `reason` is absent
  | 'bad_request'
  | 'unauthorized'
  | 'payment_required'
  | 'forbidden'
  | 'not_found'
  | 'rate_limited'
  | 'server_error'
  | (string & {});

/** Everything but the message needed to build a {@link ApiError}. */
export interface ApiErrorInit {
  /**
   * HTTP status of the failing response. When no HTTP exchange took place the
   * SDK synthesizes the semantically matching code: 400 for input the SDK
   * itself rejects, 408 for a poll deadline, 499 for an abort or cancel, 502
   * for a response it cannot make sense of.
   */
  status: number;
  /** Platform `reason` when present, otherwise an SDK-synthesized code. */
  code: ApiErrorCode;
}

/**
 * The single error type thrown by the SDK's generation surface —
 * `generate()`, `generateText()`, `submit()`, and `result()`.
 *
 * Unrelated to the `Api*` types (`ApiResponse`, `ApiRunOptions`, …), which
 * describe the low-level `ai.apis` surface. `ai.apis.run()` throws the
 * workflows client's own errors, not this.
 *
 * ```ts
 * try {
 *   await ai.generate(Models.Flux2Pro, { prompt: 'a cat' });
 * } catch (err) {
 *   if (err instanceof ApiError) {
 *     if (err.status === 402) return topUpCredits();
 *     if (err.status === 429 || err.status >= 500) return retry();
 *     if (err.code === 'validation_error') return showFormError(err.message);
 *   }
 *   throw err;
 * }
 * ```
 *
 * Aborts raised by `fetch` itself are never wrapped — a caller checking
 * `err.name === 'AbortError'` on a `DOMException` keeps working.
 */
export class ApiError extends Error {
  /** HTTP status, or the synthesized equivalent for non-HTTP failures. */
  readonly status: number;
  /** Platform `reason`, or an SDK-synthesized code. Always equal to {@link reason}. */
  readonly code: ApiErrorCode;
  /** Alias of {@link code}, named after the platform's own error field. */
  readonly reason: ApiErrorCode;

  constructor(message: string, init: ApiErrorInit) {
    super(message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.reason = init.code;
  }
}

// ── Body parsing ──────────────────────────────────────────────────────

/** Conventional slugs for the statuses callers actually branch on. */
const CODE_BY_STATUS: Record<number, ApiErrorCode> = {
  400: 'bad_request',
  401: 'unauthorized',
  402: 'payment_required',
  403: 'forbidden',
  404: 'not_found',
  408: 'timeout',
  409: 'conflict',
  413: 'payload_too_large',
  422: 'unprocessable_entity',
  429: 'rate_limited',
  500: 'server_error',
  502: 'bad_gateway',
  503: 'service_unavailable',
  504: 'gateway_timeout',
};

/** Map an HTTP status to a code for responses that carry no `reason`. */
export function codeForStatus(status: number): ApiErrorCode {
  return CODE_BY_STATUS[status] ?? (status >= 500 ? 'server_error' : `http_${status}`);
}

/**
 * Read a `Response` body exactly once, returning the raw text alongside its
 * JSON parse when it is a JSON object. Never throws — a gateway HTML page or
 * an empty body simply comes back without `json`.
 */
export async function readErrorBody(
  res: Response,
): Promise<{ text: string; json?: Record<string, unknown> }> {
  let text = '';
  try {
    text = await res.text();
  } catch {
    return { text: '' };
  }
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { text, json: parsed as Record<string, unknown> };
    }
  } catch { /* not JSON — text only */ }
  return { text };
}

/**
 * Pull the platform's error `reason` off a parsed body
 * (`{ status: 'error', reason, message }`), falling back to the status slug.
 */
export function reasonFrom(
  json: Record<string, unknown> | undefined,
  status: number,
): ApiErrorCode {
  const raw = json?.reason ?? json?.code;
  return typeof raw === 'string' && raw.length > 0 ? raw : codeForStatus(status);
}

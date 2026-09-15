// ── @picsart/workflows-client failures → ApiError ─────────────────────
// The SDK throws exactly one error type. Every call into the workflows client
// — the built-in transport's lifecycle requests and `ai.apis.run()` alike —
// runs its failures through here, so a WorkflowsError never reaches a caller.

import { WorkflowsError } from '@picsart/workflows-client';

import { ApiError, codeForStatus } from '../core/errors.ts';

/**
 * Reasons the workflows client fills in itself when the platform supplied
 * none. The SDK's contract is a conventional slug derived from the status in
 * that case (`payment_required` for a 402), so these are treated as absent.
 */
const GENERIC_REASONS = new Set(['request_failed', 'unknown_error']);

/**
 * Whether a throw came from @picsart/workflows-client. `instanceof` first;
 * the shape check behind it covers a second copy of the class in the same
 * process (its `name` survives bundling only as a `*WorkflowsError` suffix),
 * and the SDK reads nothing but the three fields below either way.
 */
function isWorkflowsError(err: unknown): boolean {
  if (err instanceof WorkflowsError) return true;
  const e = err as { name?: string; reason?: unknown };
  return err instanceof Error && typeof e.reason === 'string' && /WorkflowsError$/.test(e.name ?? '');
}

/**
 * Map a failure out of @picsart/workflows-client onto the SDK's ApiError
 * contract. Client and server errors carry the platform's own status and
 * reason; the client's poll-budget 408 keeps the SDK's historical timeout
 * message. Aborts pass through untouched — the lifecycle turns our own signal
 * into 499/aborted and leaves a foreign AbortError its identity.
 *
 * Returns rather than throws, so callers keep their own `throw` at the call
 * site (and TypeScript keeps seeing it).
 */
export function toApiError(err: unknown, workflow: string, id?: string): unknown {
  if (err instanceof ApiError) return err;
  if (err instanceof DOMException && err.name === 'AbortError') return err;
  const e = err as { reason?: string; httpStatusCode?: number; message?: string };
  if (isWorkflowsError(err)) {
    if (e.reason === 'client_timeout') {
      return new ApiError(`Timed out waiting for workflow ${workflow}${id ? `:${id}` : ''}`, {
        status: 408,
        code: 'timeout',
      });
    }
    const status = e.httpStatusCode ?? 502;
    return new ApiError(e.message ?? 'Request failed', {
      status,
      code: e.reason && !GENERIC_REASONS.has(e.reason) ? e.reason : codeForStatus(status),
    });
  }
  return new ApiError(err instanceof Error ? err.message : String(err), {
    status: 502,
    code: 'generation_failed',
  });
}

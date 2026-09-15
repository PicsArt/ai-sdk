// ── Workflow wire types ───────────────────────────────────────────────
// Shapes of the platform task envelope plus the SDK's transport seam.
// Every byte the generation lifecycle moves goes through an SdkTransport:
// the built-in one (client/transport.ts) rides on @picsart/workflows-client,
// and `createClient({ transport })` swaps in any other implementation.

export interface WorkflowSubmitRequest<TPayload = Record<string, unknown>> {
  /** Workflow endpoint, e.g. "veo-text-to-video". */
  workflow: string;
  payload: TPayload;
  signal?: AbortSignal;
}

export interface WorkflowJobHandle {
  workflow: string;
  id: string;
}

export type WorkflowStatus =
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELED'
  | 'UNKNOWN';

export interface WorkflowProgress {
  percent?: number;
  estimatedSecondsLeft?: number;
}

/**
 * Per-tool credit usage entry inside {@link CreditUsage.details}
 * (mirrors `ToolUsage` from `pa-pluggable-api-adapter`).
 */
export interface ToolUsage {
  operationId?: string;
  toolId: string;
  price: number;
  amount: number;
  credits: number;
  failed?: boolean;
}

/**
 * Credit usage reported on a completed task, as returned by the pluggable
 * APIs platform on every task response (mirrors the adapter's public
 * `CreditUsage` from `pa-pluggable-api-adapter`).
 */
export interface CreditUsage {
  /** The tool identifier. Set to "total_credits" when subtask usage is present. */
  toolId?: string;
  /** Per-tool credit usage breakdown. */
  details?: ToolUsage[];
  /** The amount of credits charged. */
  credits: number;
  /** The remaining balance. */
  balance?: number;
}

export interface WorkflowStatusResult<TResult = unknown> {
  handle: WorkflowJobHandle;
  status: WorkflowStatus;
  result?: TResult;
  error?: string;
  /** Platform error `reason` on a failed task, when the response carried one. */
  reason?: string;
  /** Numeric status on the error payload, when the response carried one. */
  statusCode?: number;
  progress?: WorkflowProgress;
  /** Credit usage reported by the platform, when present on the response. */
  usage?: CreditUsage;
  raw: unknown;
}

export interface WorkflowPollOptions {
  intervalMs?: number;
  maxAttempts?: number;
  signal?: AbortSignal;
}

/**
 * What a transport hands back from `execute` / `poll` / `status`: the task
 * result the SDK parses, the platform's credit usage, and — when the
 * transport has an envelope distinct from the result — the raw payload
 * (text models read it as a fallback).
 */
export interface TransportResult<TResult = unknown> {
  result?: TResult;
  usage?: CreditUsage;
  /** Raw payload as the transport received it. Defaults to `result`. */
  raw?: unknown;
}

/** Poll controls plus the progress sink `ai.subscribe()` drains. */
export interface TransportPollOptions extends WorkflowPollOptions {
  onProgress?: (progress: WorkflowProgress) => void;
}

/**
 * The transport contract for talking to the generation backend — the one seam
 * every SDK request passes through. `createClient({ apiUrl, apiKey })` builds
 * the default implementation over @picsart/workflows-client;
 * `createClient({ transport })` replaces it wholesale (a different gateway, a
 * signed proxy, a test double).
 *
 * `execute` (one-shot synchronous run) is the only required method — it serves
 * `syncExecute` models and every catalog task. `submit` + `poll` are the async
 * submit-and-wait pair: when either is missing, the client routes ALL
 * generation through `execute`, and the async lifecycle (`submit()` /
 * `result()` / `subscribe()`) rejects with `unsupported_transport`. `status` is
 * a single non-blocking read, used to probe which route a bare generation id
 * was submitted on; `options` is the credit-estimation call behind
 * `getCredits()`. Omitted optional methods degrade the matching feature rather
 * than breaking the client.
 *
 * Failures should be thrown as {@link ApiError} — anything else reaches the
 * caller as a 502 `generation_failed`. An `AbortError` is never wrapped.
 */
export interface SdkTransport<TPayload = Record<string, unknown>> {
  /** One-shot synchronous run: submit and return the finished result. */
  execute(request: WorkflowSubmitRequest<TPayload>): Promise<TransportResult>;
  /** Start an async job and return its generation id. */
  submit?(request: WorkflowSubmitRequest<TPayload>): Promise<string>;
  /** Wait for a submitted job to reach a terminal state, reporting progress. */
  poll?(handle: WorkflowJobHandle, options?: TransportPollOptions): Promise<TransportResult>;
  /** Read a submitted job's current state in one request — no waiting. */
  status?(handle: WorkflowJobHandle, signal?: AbortSignal): Promise<TransportResult>;
  /** Credits this request would cost, or null when pricing is unavailable. */
  options?(workflow: string, payload: Record<string, unknown>): Promise<number | null>;
}

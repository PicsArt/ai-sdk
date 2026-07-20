// ── Workflow Client Engine ────────────────────────────────────────────
// Pure workflow polling/execution engine with no model dependencies.

// ── Types ────────────────────────────────────────────────────────────

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

export interface WorkflowStatusResult<TResult = unknown> {
  handle: WorkflowJobHandle;
  status: WorkflowStatus;
  result?: TResult;
  error?: string;
  progress?: WorkflowProgress;
  raw: unknown;
}

/**
 * The transport contract for talking to the workflows backend.
 *
 * `execute` (one-shot synchronous generation) is the only required method.
 * `submit` + `status` are the async submit-and-poll pair — optional, so an
 * execute-only transport can omit them. `options` is the SDK-level
 * credit-estimation call. When a transport omits `submit`, the client routes
 * all generation through `execute`; calling the async lifecycle methods
 * (submit/status/result/subscribe) on such a client throws.
 */
export interface SdkTransport<TPayload = Record<string, unknown>> {
  execute(request: WorkflowSubmitRequest<TPayload>): Promise<unknown>;
  submit?(request: WorkflowSubmitRequest<TPayload>): Promise<WorkflowJobHandle>;
  status?(handle: WorkflowJobHandle, signal?: AbortSignal): Promise<unknown>;
  options?(workflow: string, payload: Record<string, unknown>): Promise<number | null>;
}

export interface WorkflowPollOptions {
  intervalMs?: number;
  maxAttempts?: number;
  signal?: AbortSignal;
}

export interface WorkflowRunOptions extends WorkflowPollOptions {
  mode?: 'async' | 'sync';
}

export type WorkflowSubscribeOptions = WorkflowPollOptions;

export interface WorkflowClientOptions {
  pollingIntervalMs?: number;
  maxAttempts?: number;
  parseStatus?: <TResult = unknown>(
    handle: WorkflowJobHandle,
    raw: unknown,
  ) => WorkflowStatusResult<TResult>;
  sleep?: (ms: number) => Promise<void>;
}

// ── Helpers ──────────────────────────────────────────────────────────

const DEFAULT_POLL_INTERVAL_MS = 2000;
const DEFAULT_MAX_ATTEMPTS = 300;

const sleepDefault = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function getNested(raw: unknown, path: string[]): unknown {
  let current: unknown = raw;
  for (const key of path) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function pickFirst(raw: unknown, paths: string[][]): unknown {
  for (const path of paths) {
    const value = getNested(raw, path);
    if (value !== undefined) return value;
  }
  return undefined;
}

function normalizeStatus(status: unknown): WorkflowStatus {
  if (typeof status !== 'string') return 'UNKNOWN';
  const s = status.toUpperCase();
  if (s === 'ACCEPTED') return 'ACCEPTED';
  if (s === 'IN_PROGRESS' || s === 'PENDING' || s === 'RUNNING') return 'IN_PROGRESS';
  if (s === 'COMPLETED' || s === 'SUCCESS') return 'COMPLETED';
  if (s === 'FAILED' || s === 'ERROR') return 'FAILED';
  if (s === 'CANCELED' || s === 'CANCELLED') return 'CANCELED';
  return 'UNKNOWN';
}

/** Parse raw workflow API response into a typed status result. */
export function parseWorkflowStatus<TResult = unknown>(
  handle: WorkflowJobHandle,
  raw: unknown,
): WorkflowStatusResult<TResult> {
  const statusRaw = pickFirst(raw, [['response', 'status'], ['status']]);
  const status = normalizeStatus(statusRaw);
  const result = pickFirst(raw, [['response', 'result'], ['result']]) as TResult | undefined;
  const errorRaw = pickFirst(raw, [['response', 'error'], ['error'], ['message'], ['reason']]);
  const progressRaw = pickFirst(raw, [['response', 'progress'], ['progress']]);
  const progress = (progressRaw && typeof progressRaw === 'object')
    ? {
        percent: typeof (progressRaw as Record<string, unknown>).percent === 'number'
          ? (progressRaw as Record<string, unknown>).percent as number
          : undefined,
        estimatedSecondsLeft:
          typeof (progressRaw as Record<string, unknown>).estimatedSecondsLeft === 'number'
            ? (progressRaw as Record<string, unknown>).estimatedSecondsLeft as number
            : undefined,
      }
    : undefined;

  return {
    handle,
    status,
    result,
    error: typeof errorRaw === 'string' ? errorRaw : undefined,
    progress,
    raw,
  };
}

function isTerminal(status: WorkflowStatus): boolean {
  return status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELED';
}


// ── Client Factory ───────────────────────────────────────────────────

/** Create a workflow client that handles polling, execution, and lifecycle. */
export function createWorkflowClient<TPayload = Record<string, unknown>>(
  transport: SdkTransport<TPayload>,
  options: WorkflowClientOptions = {},
) {
  const parseStatus = options.parseStatus ?? parseWorkflowStatus;
  const sleep = options.sleep ?? sleepDefault;
  const defaultPollIntervalMs = options.pollingIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const defaultMaxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

  const submit = async (request: WorkflowSubmitRequest<TPayload>): Promise<WorkflowJobHandle> => {
    if (!transport.submit) {
      throw new Error('Transport does not support submit (execute-only transport)');
    }
    return transport.submit(request);
  };

  const status = async <TResult = unknown>(
    handle: WorkflowJobHandle,
    signal?: AbortSignal,
  ): Promise<WorkflowStatusResult<TResult>> => {
    if (!transport.status) {
      throw new Error('Transport does not support status (execute-only transport)');
    }
    const raw = await transport.status(handle, signal);
    return parseStatus<TResult>(handle, raw);
  };

  const result = async <TResult = unknown>(
    handle: WorkflowJobHandle,
    pollOptions: WorkflowPollOptions = {},
  ): Promise<WorkflowStatusResult<TResult>> => {
    const intervalMs = pollOptions.intervalMs ?? defaultPollIntervalMs;
    const maxAttempts = pollOptions.maxAttempts ?? defaultMaxAttempts;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (pollOptions.signal?.aborted) {
        throw new Error('Operation aborted');
      }
      const next = await status<TResult>(handle, pollOptions.signal);
      if (isTerminal(next.status)) return next;
      await sleep(intervalMs);
    }
    throw new Error(`Timed out waiting for workflow ${handle.workflow}:${handle.id}`);
  };

  const run = async <TResult = unknown>(
    request: WorkflowSubmitRequest<TPayload>,
    runOptions: WorkflowRunOptions = {},
  ): Promise<WorkflowStatusResult<TResult>> => {
    const runMode = runOptions.mode;

    // Execute when explicitly asked, or when the transport can't submit-and-poll
    // (an execute-only transport) and no mode was forced.
    const useExecute = runMode === 'sync' || (runMode === undefined && !transport.submit);

    if (useExecute) {
      const raw = await transport.execute(request);
      const syntheticHandle: WorkflowJobHandle = { workflow: request.workflow, id: 'sync' };
      const parsed = parseStatus<TResult>(syntheticHandle, raw);
      return parsed.status === 'UNKNOWN'
        ? { ...parsed, status: 'COMPLETED' }
        : parsed;
    }

    const handle = await submit(request);
    return result<TResult>(handle, runOptions);
  };

  const subscribe = async function* <TResult = unknown>(
    handle: WorkflowJobHandle,
    subscribeOptions: WorkflowSubscribeOptions = {},
  ): AsyncGenerator<WorkflowStatusResult<TResult>, WorkflowStatusResult<TResult>, void> {
    const intervalMs = subscribeOptions.intervalMs ?? defaultPollIntervalMs;
    const maxAttempts = subscribeOptions.maxAttempts ?? defaultMaxAttempts;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (subscribeOptions.signal?.aborted) {
        throw new Error('Operation aborted');
      }
      const next = await status<TResult>(handle, subscribeOptions.signal);
      yield next;
      if (isTerminal(next.status)) return next;
      await sleep(intervalMs);
    }
    throw new Error(`Timed out waiting for workflow ${handle.workflow}:${handle.id}`);
  };

  return { submit, status, result, run, subscribe };
}

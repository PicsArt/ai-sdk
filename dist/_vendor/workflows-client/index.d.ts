import { WorkflowTypes } from '../workflows-types/index';
export { WorkflowTypes } from '../workflows-types/index';

declare enum PicsartStatus {
    SUCCESS = "success",
    ERROR = "error"
}
type PicsartResponse = {
    status: PicsartStatus.SUCCESS;
};
declare enum WorkflowStatus {
    ACCEPTED = "ACCEPTED",
    FAILED = "FAILED",
    COMPLETED = "COMPLETED",
    IN_PROGRESS = "IN_PROGRESS"
}
interface TaskCreditUsage {
    toolId: string;
    price: number;
    amount: number;
    credits: number;
    details?: ToolUsage[];
}
interface ToolUsage {
    toolId: string;
    price: number;
    amount: number;
    credits: number;
}
type WorkflowApiResponse<R> = {
    id: string;
    status: WorkflowStatus;
    updated: string;
    result: R;
    progress?: WorkflowProgress;
    usage?: TaskCreditUsage;
    events?: WorkflowEvent[];
};
type PartialWorkflowResult<R> = {
    status: WorkflowStatus;
    result: R;
};
interface WorkflowOptions {
    monetization?: {
        toolId: string;
    };
    usageAmount?: number;
    credits?: number;
    originalCredits?: number;
}
type HistoryResponse<R> = PicsartResponse & {
    response: {
        id: string;
        created: string;
        status: WorkflowStatus;
        params: {
            prompt: string;
        };
        result: (R | null)[];
    }[];
};
type WorkflowProgress = {
    percent: number;
    estimatedSecondsLeft?: number;
};
type OnPartialResultFn = <R>(result: WorkflowApiResponse<R> | PartialWorkflowResult<R>) => Promise<void> | void;
type OnProgressFn = (progress: WorkflowProgress) => Promise<void> | void;
type OnEventFn = (event: WorkflowEvent) => Promise<void> | void;
declare enum ExecutionMode {
    ASYNC = "ASYNC",
    SYNC = "SYNC",
    STREAM = "STREAM",
    SOCKET = "SOCKET"
}
declare class ExecutionOptions {
    mode?: ExecutionMode;
    remoteSettingName?: string;
    abortSignal?: AbortSignal;
    retriesCount?: number;
    pollingInterval?: number;
    onPartialResult?: OnPartialResultFn;
    onProgress?: OnProgressFn;
    onAccepted?: (id: string) => Promise<void> | void;
    onEvent?: OnEventFn;
    notificationConfig?: INotificationContext;
    headers?: HeadersInit;
}
declare class ApiSettings {
    executionMode?: ExecutionMode;
    configId?: string;
}
declare enum EventTypes {
    COMPLETED = "task.completed",
    FAILED = "task.failed",
    PARTIAL_RESULT = "task.partial-result",
    METRICS = "task.metrics"
}
interface WorkflowEvent {
    type: string;
    id?: string;
}
interface WorkflowResponse<R> {
    result: R;
    status: WorkflowStatus;
    usage?: TaskCreditUsage;
    id?: string;
    updated?: string;
    progress?: WorkflowProgress;
    events?: WorkflowEvent[];
}
interface INotificationContext {
    projectId?: string;
    miniappPackageId?: string;
    actions?: INotificationContextAction[];
}
interface INotificationContextAction {
    deeplink: string;
    mobileDeeplink: string;
}
interface ChannelOpAck {
    accepted: string[];
    rejected: {
        channel: string;
        reason: string;
    }[];
}
interface SocketLike {
    on(event: string, handler: (payload: any) => void): unknown;
    off(event: string, handler: (payload: any) => void): unknown;
    emit(event: string, payload?: unknown, ack?: (response: ChannelOpAck) => void): unknown;
    connect(): unknown;
    disconnect(): unknown;
    readonly connected: boolean;
    readonly recovered: boolean;
    readonly active: boolean;
}
interface SocketConnectionOptions {
    url?: string;
    getToken: () => string | Promise<string>;
    path?: string;
    transports?: string[];
}
interface StreamSocketMessage {
    taskId: string;
    workflow?: string;
    type: string;
    payload: any;
}
interface SubscribeOptions {
    name: string;
    taskId?: string;
    signal?: AbortSignal;
}
declare const STREAM_EVENT_NAME = "task.stream";
declare const normalizeWorkflowName: (workflow: string) => string;
declare const taskChannel: (workflow: string, taskId: string) => string;
declare const workflowChannel: (workflow: string) => string;

type getRemoteSettingsFn = (name: string, tag?: string) => Promise<ApiSettings>;
type MappedWorkflow = keyof WorkflowTypes;
type RunParams<N> = N extends MappedWorkflow ? WorkflowTypes[N]['params'] : unknown;
type RunResult<N, R> = N extends MappedWorkflow ? WorkflowTypes[N]['result'] : R;
interface ClientOptions {
    baseUrl?: string;
    fetch?: typeof fetch;
    apiKey?: string;
    identityToken?: string;
    getRemoteSettings?: getRemoteSettingsFn;
    headers?: HeadersInit;
    socket?: SocketLike;
    socketConnection?: SocketConnectionOptions;
}
declare class WorkflowsClient {
    private readonly workflowsApiBaseUrl;
    private readonly defaultHeaders;
    private readonly clientOptions;
    private readonly sockets;
    private readonly terminalStatuses;
    constructor(options: ClientOptions);
    /**
     * Runs a workflow end-to-end and resolves with its result.
     *
     * A workflow that has an entry in `WorkflowTypes` (from `@picsart/workflows-types`) is
     * type-checked against it: `params` must match the workflow's input and the result comes back
     * typed, with no type argument to pass. Every other workflow is left unconstrained — declare
     * the result yourself with `run<MyResult>(name, params)`.
     *
     * The execution mode is taken from remote settings when available, otherwise from
     * `executionOptions.mode`, defaulting to async (submit + polling). Supported modes:
     * sync (single HTTP call), stream (SSE, requires `onEvent`), socket (result pushed
     * over the socket), and async (submit + polling).
     *
     * @typeParam R - Shape of the result, for a workflow that has no `WorkflowTypes` entry.
     * Passing it explicitly also opts a mapped workflow out of its types.
     * @param name - Workflow name.
     * @param params - Workflow input, typed per the workflow definition when there is one.
     * @param executionOptions - Mode, callbacks (`onAccepted`, `onProgress`, `onPartialResult`,
     * `onEvent`), polling tuning, headers, and abort signal.
     * @returns The workflow result and usage info.
     * @throws {WorkflowsError} On a failed request (`httpStatusCode` carries the HTTP status),
     * invalid arguments, or an unexpected failure.
     */
    run<R = unknown, N extends string = string>(name: N, params: RunParams<N>, executionOptions?: ExecutionOptions): Promise<WorkflowResponse<RunResult<N, R>>>;
    /**
     * Submits a task WITHOUT waiting for its result — the standalone counterpart of {@link run}.
     * Consume the result later with {@link runPolling} or {@link subscribe} (`{ name, taskId }`).
     *
     * Only the submission-related execution options apply here (`headers`, `notificationConfig`,
     * `remoteSettingName`); result-consumption options (mode, callbacks, polling) belong to the consumer.
     *
     * @param name - Workflow name.
     * @param params - Workflow input parameters.
     * @param executionOptions - Submission-related options only.
     * @returns The taskId of the submitted task.
     * @throws {WorkflowsError} On a failed request (`httpStatusCode` carries the HTTP status)
     * or an unexpected failure.
     */
    submit(name: string, params: unknown, executionOptions?: ExecutionOptions): Promise<string>;
    /**
     * Fetches the options a workflow offers for the given input — what the adapter resolves for THIS
     * caller (subscription tier, country, the `x-config-id` CMS card), which is why it is read at call
     * time rather than described by the workflow's types.
     *
     * @param name - Workflow name, including the version when the workflow has one (`pipelineName/v1`).
     * @param params - Workflow input to resolve the options for; defaults to `{}` for the common case
     * of asking before anything is chosen.
     * @param requestOptions - `remoteSettingName` to resolve the `x-config-id` under a name other
     * than the workflow's own.
     * @returns The options payload — the envelope's `response`, unwrapped.
     * @throws {WorkflowsError} On a failed request; `httpStatusCode` carries the HTTP status.
     */
    options(name: string, params?: unknown, requestOptions?: {
        remoteSettingName?: string;
    }): Promise<WorkflowOptions>;
    private postTask;
    /**
     * Polls an already-submitted task until it reaches a terminal status (COMPLETED/FAILED)
     * and resolves with its result. Progress and partial-result callbacks from
     * `executionOptions` are invoked on each update.
     *
     * A poll that never reaches the server (dropped wifi, DNS failure, a reset connection) does not
     * end the run — the task keeps going server-side, so polling backs off and retries, giving up
     * only once the drops outlast the retry budget. Anything the server did answer, and any abort,
     * still fails immediately.
     *
     * @typeParam R - Shape of the workflow result.
     * @param taskName - Workflow name.
     * @param taskId - Task id returned by {@link submit} (or `onAccepted`).
     * @param executionOptions - `pollingInterval` (default 300ms), `retriesCount` (default 1000),
     * callbacks and abort signal.
     * @returns The workflow result and usage info.
     * @throws {WorkflowsError} With `httpStatusCode` 408 when the retry budget is exhausted
     * before the task completes, or the connection error when the connection never came back.
     */
    runPolling<R>(taskName: string, taskId: string, executionOptions?: ExecutionOptions): Promise<WorkflowResponse<R>>;
    private connectionError;
    private isTerminal;
    /**
     * Whether a failed poll never got an answer from the server — the connection dropped, DNS failed,
     * the request was reset. Classified by what the failure is NOT, so it holds in a browser
     * (`TypeError: Failed to fetch`) and in Node (`TypeError: fetch failed`) alike: anything the
     * server answered carries an `httpStatusCode`, and an abort is the caller's own doing.
     */
    private isConnectionError;
    private pollingDelay;
    /**
     * Fetches the CURRENT state of an already-submitted task with a single request — no polling, no
     * waiting. Returns the task as it stands, so read `status` (and `progress`) to know what you got:
     * `result` may still be empty or partial while the task is not COMPLETED. Use {@link runPolling}
     * or {@link subscribe} to wait for a terminal status instead.
     *
     * @typeParam R - Shape of the workflow result.
     * @param taskName - Workflow name.
     * @param taskId - Task id returned by {@link submit} (or `onAccepted`).
     * @returns The task record as it stands at the moment of the call.
     * @throws {WorkflowsError} On a failed request (`httpStatusCode` carries the HTTP status)
     * or an unexpected failure.
     */
    result<R>(taskName: string, taskId: string): Promise<WorkflowResponse<R>>;
    /**
     * Watches already-submitted work LIVE over the socket (no re-submit), as an async iterable
     * of the raw `StreamSocketMessage` the gateway pushes — iterate with `for await` and switch
     * on `msg.type`. With a `taskId` it watches that task (ending after its COMPLETED/FAILED);
     * without it, it watches EVERY task of the workflow until stopped. A lost session throws out
     * of the loop; `break` (or an AbortSignal in options) stops watching.
     *
     * @param options - Subscription target: `name` (required), optional `taskId` and abort signal.
     * @returns Async iterable of socket messages for the subscribed workflow/task.
     * @throws {WorkflowsError} If `options.name` is missing.
     */
    subscribe(options: SubscribeOptions): AsyncIterableIterator<StreamSocketMessage>;
    /**
     * Closes the socket the client created from `socketConnection`. No-op for an injected
     * `socket` (the caller owns that one). Safe to call more than once.
     */
    disconnect(): Promise<void>;
    /**
     * Marks a task's notification as seen so it is no longer surfaced to the user.
     * Called automatically after socket-mode runs; call it manually when consuming
     * results yourself (e.g. after {@link submit} + {@link subscribe}).
     *
     * @param taskId - Task id whose notification should be dismissed.
     * @param options - Optional extra request headers.
     * @throws {WorkflowsError} On a failed request; `httpStatusCode` carries the HTTP status.
     */
    disableNotification(taskId: string, options?: {
        headers?: HeadersInit;
    }): Promise<void>;
    private executeTaskSync;
    private getResult;
    private executeTaskStream;
    /**
     * Fetches the execution history of a workflow, paginated.
     *
     * @typeParam R - Shape of each execution's result in the history entries.
     * @param taskName - Workflow name to fetch history for.
     * @param offset - Pagination offset (default 0).
     * @param limit - Page size (default 10).
     * @param isGrouped - When true, fetches the grouped history endpoint.
     * @returns The history page for the workflow.
     * @throws {WorkflowsError} On a failed request (`httpStatusCode` carries the HTTP status)
     * or an unexpected failure.
     */
    executionsHistory<R>(taskName: string, offset?: number, limit?: number, isGrouped?: boolean): Promise<HistoryResponse<R>>;
    private toSuccessResponse;
    private throwIfError;
    private getApiSettings;
    private wrapError;
    private requestHeaders;
    private buildRequestHeaders;
    private _fetch;
}

/**
 * The single error every failure in this client is reported as: a failed HTTP call, a failed
 * workflow, a lost socket, a bad argument or an unexpected local throw.
 *
 * Three fields, always: `message` (the raw text the API returned), `reason` (machine-readable
 * code) and `httpStatusCode` (absent for failures that never had one). A payload that doesn't
 * follow the backend's error format is NOT carried along — each missing field falls back to the
 * caller's value instead, so callers only ever depend on the three fields above.
 */
interface WorkflowsErrorInit {
    reason: string;
    message: string;
    httpStatusCode?: number;
}
declare class WorkflowsError extends Error {
    /** Machine-readable failure code, e.g. `invalid_request`, `client_timeout`, `unknown_error`. */
    readonly reason: string;
    /** HTTP status when the failure came with one; undefined for purely local failures. */
    readonly httpStatusCode?: number;
    constructor(init: WorkflowsErrorInit);
    /**
     * Builds an error from an already-parsed error payload — a `FailedResult` off a stream/socket
     * event, or any body with `reason` / `message` / `statusCode`. Each field falls back to
     * `fallback` individually, so a payload that carries only a message still keeps the caller's
     * reason and status.
     */
    static fromBody(body: unknown, fallback: WorkflowsErrorInit): WorkflowsError;
    /**
     * Builds an error from a non-ok `Response`. The status always comes from the response itself;
     * `reason` and `message` come from the JSON body when it has them, otherwise from `fallback`
     * (a body that isn't JSON at all is reported as such rather than throwing a parse error).
     */
    static fromResponse(response: Response, fallback?: Partial<WorkflowsErrorInit>): Promise<WorkflowsError>;
    /** Wraps an unexpected local throw (anything that isn't already a WorkflowsError). */
    static fromUnknown(error: unknown): WorkflowsError;
}

export { type ChannelOpAck, EventTypes, ExecutionMode, ExecutionOptions, STREAM_EVENT_NAME, type SocketConnectionOptions, type SocketLike, type StreamSocketMessage, type SubscribeOptions, type WorkflowEvent, type WorkflowOptions, type WorkflowProgress, type WorkflowResponse, WorkflowStatus, WorkflowsClient, WorkflowsError, type WorkflowsErrorInit, normalizeWorkflowName, taskChannel, workflowChannel };

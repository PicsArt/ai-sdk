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
declare enum ExecutionMode {
    ASYNC = "ASYNC",
    SYNC = "SYNC",
    STREAM = "STREAM"
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
    onEvent?: (event: WorkflowEvent) => Promise<void> | void;
    notificationConfig?: INotificationContext;
    headers?: HeadersInit;
}
declare class ApiSettings {
    executionMode?: ExecutionMode;
    configId?: string;
}
interface WorkflowEvent {
    type: string;
    id?: string;
}
interface WorkflowResponse<R> {
    result: R;
    usage?: TaskCreditUsage;
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

type getRemoteSettingsFn = (name: string, tag?: string) => Promise<ApiSettings>;
interface ClientOptions {
    baseUrl?: string;
    fetch?: typeof fetch;
    apiKey?: string;
    identityToken?: string;
    getRemoteSettings?: getRemoteSettingsFn;
    headers?: HeadersInit;
}
declare class WorkflowsClient {
    private readonly workflowsApiBaseUrl;
    private readonly defaultHeaders;
    private readonly options;
    private readonly terminalStatuses;
    constructor(options: ClientOptions);
    run<R>(name: string, params: unknown, executionOptions?: ExecutionOptions): Promise<WorkflowResponse<R>>;
    runTypeSafe<N extends keyof WorkflowTypes>(name: N, params: WorkflowTypes[N]['params'], executionOptions?: ExecutionOptions): Promise<WorkflowResponse<WorkflowTypes[N]['result']>>;
    private postTask;
    runPolling<R>(taskName: string, taskId: string, executionOptions?: ExecutionOptions): Promise<WorkflowResponse<R>>;
    private executeTaskSync;
    private getResult;
    private executeTaskStream;
    executionsHistory<R>(taskName: string, offset?: number, limit?: number, isGrouped?: boolean): Promise<HistoryResponse<R>>;
    private toSuccessResponse;
    private throwIfError;
    private getApiSettings;
    private wrapError;
    private buildRequestHeaders;
    private _fetch;
}

export { ExecutionMode, ExecutionOptions, type WorkflowEvent, type WorkflowProgress, type WorkflowResponse, WorkflowStatus, WorkflowsClient };

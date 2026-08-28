import type {
  WorkflowJobHandle,
  SdkTransport,
  WorkflowPollOptions,
  WorkflowSubscribeOptions,
  WorkflowStatusResult,
  WorkflowRunOptions,
  CreditUsage,
  ToolUsage,
} from '../core/workflow.ts';
import type { TypedModelId, ModelInputById, TextModelId, TextModelInputById } from '../generated/model-input-types.ts';
import type { DriveFolder, DriveSaveResult, PayloadDriveOptions, DriveClient } from './drive.ts';
import type { ApisClient } from './apis.ts';
import type { CatalogsClient, CatalogsOptions } from './catalogs.ts';

// Re-export for public API — users need these to type stored job handles + custom transports
export type { WorkflowJobHandle, SdkTransport, CreditUsage, ToolUsage };

// ── Client config ────────────────────────────────────────────────────

/** A fetch-like function that handles authentication (headers, cookies, etc.). */
export type AuthenticatedFetch = (url: string, init?: RequestInit) => Promise<Response>;

/** Drive configuration — enables auto-saving generations to Picsart Drive. */
export interface DriveConfig {
  /** Root folder name in Drive. All generations save here. */
  folder: string;
}

/**
 * Whether the embedding app is a native client or a miniapp. Set backend-side
 * during save; surfaced read-only via `getGeneration`.
 */
export type AppType = 'native' | 'miniapp';

/**
 * App identity (appId + appType).
 * TODO(backend-autosave): temporary — the backend will stamp appId/appType on
 * save. Until then apps may pass this so it's persisted client-side.
 */
export interface AppIdentity {
  id: string;
  type: AppType;
}

/**
 * Simple client config — pass the API base URL plus one auth source, and the
 * SDK handles the rest. The SDK knows the Picsart API endpoints and response
 * shapes internally.
 *
 * Provide exactly one of:
 * - `fetch` — your own authenticated fetch (you add headers/cookies), or
 * - `apiKey` — the SDK builds a fetch that sends `Authorization: Bearer <apiKey>`.
 */
export interface ClientConfig {
  /**
   * Authenticated fetch function. The SDK calls this for all HTTP requests.
   * Provide this or `apiKey`. Takes precedence over `apiKey` when both are set.
   */
  fetch?: AuthenticatedFetch;
  /**
   * Picsart API key. When `fetch` is not provided, the SDK builds an
   * authenticated fetch that sends `Authorization: Bearer <apiKey>` on every
   * request (a leading `Bearer ` is stripped if present).
   */
  apiKey?: string;
  /** API base URL (e.g. 'https://api.picsart.com'). */
  apiUrl: string;
  /** Enable Drive integration — auto-save generations to a Drive folder. */
  drive?: DriveConfig;
  /**
   * Voice/avatar catalog behavior. `{ preload: true }` loads the first page
   * of every catalog-bound param in the background at client creation.
   */
  catalogs?: CatalogsOptions;
}

// ── Result types ─────────────────────────────────────────────────────

export interface GenerateResultItem {
  url: string;
  metadata?: Record<string, unknown>;
}

export interface GenerateResult {
  /** Primary result URL (convenience shortcut for results[0].url). */
  url: string;
  /** All result items — single item for normal models, multiple for explore/multi-result models. */
  results: GenerateResultItem[];
  /** Model ID that produced this result. */
  model: string;
  /** Job handle for status tracking. */
  handle: WorkflowJobHandle;
  /** Raw parsed output for advanced consumers. */
  raw: unknown;
  /** Credit usage reported by the platform — same structure as the pluggable APIs' GenAITaskResponse. */
  usage?: CreditUsage;
  /** Present when Drive is enabled and the file was saved. */
  drive?: DriveSaveResult;
}

/** Result of a text-generation (LLM) model. */
export interface GenerateTextResult {
  /** Generated text. */
  text: string;
  /** Model ID that produced this result. */
  model: string;
  /** Job handle for status tracking. */
  handle: WorkflowJobHandle;
  /** Raw parsed output — carries vendor token usage, finish reason, thinking trace, etc. */
  raw: unknown;
  /** Credit usage reported by the platform — same structure as the pluggable APIs' GenAITaskResponse. */
  usage?: CreditUsage;
}

/** Options for individual generate() / submit() calls. */
export interface GenerateOptions {
  signal?: AbortSignal;
  /**
   * Poll interval for the async status loop, in ms. Overrides the model's
   * `pollOptions` and the mode default (video 2s; image/audio/text 1s).
   */
  intervalMs?: number;
  /**
   * Max poll attempts before the call throws a timeout. Overrides the model's
   * `pollOptions` and the mode default (video 1800 ≈ 1 hour;
   * image/audio/text 1200 ≈ 20 min).
   */
  maxAttempts?: number;
  /** Save to a specific subfolder instead of the root (legacy — used by SDK DriveConfig). */
  folder?: DriveFolder;
  /** Save result to Picsart Drive via backend. Injected into the workflow payload. */
  drive?: PayloadDriveOptions;
  /**
   * App identity stamped onto the saved generation (appId/appType).
   * TODO(backend-autosave): temporary — remove once the backend stamps these.
   */
  app?: AppIdentity;
}

// ── Type-safe client interface ──────────────────────────────────────

/** Non-text (image/video/audio) model IDs — the media generation surface. */
export type MediaModelId = Exclude<TypedModelId, TextModelId>;

/** AI SDK client with type-safe, model-aware method signatures. */
export interface AiClient {
  /** Generate content using a media model. Text/LLM models use generateText(). */
  generate<M extends MediaModelId>(model: M, params: ModelInputById[M], options?: GenerateOptions): Promise<GenerateResult>;

  /** Generate text using an LLM model. Returns the generated text plus the raw response. */
  generateText<M extends TextModelId>(model: M, params: TextModelInputById[M], options?: GenerateOptions): Promise<GenerateTextResult>;

  /** Get exact credit cost for a model with specific parameters. */
  getCredits<M extends TypedModelId>(model: M, params: ModelInputById[M]): Promise<number | null>;

  /** Submit a generation job and get a handle back. Media models only. */
  submit<M extends MediaModelId>(model: M, params: ModelInputById[M], options?: GenerateOptions): Promise<WorkflowJobHandle>;

  /** Check the current status of a submitted job. */
  status(handle: WorkflowJobHandle, signal?: AbortSignal): Promise<WorkflowStatusResult<unknown>>;

  /** Poll a submitted job until it completes and return the parsed result. Media models only. */
  result(handle: WorkflowJobHandle, model: MediaModelId, options?: WorkflowPollOptions): Promise<GenerateResult>;

  /** Subscribe to live status updates for a submitted job. */
  subscribe(handle: WorkflowJobHandle, options?: WorkflowSubscribeOptions): AsyncGenerator<WorkflowStatusResult<unknown>, WorkflowStatusResult<unknown>, void>;

  /** Build the vendor-specific payload for a model without submitting. */
  buildPayload<M extends TypedModelId>(model: M, params: ModelInputById[M]): Record<string, unknown>;

  /** @deprecated Use `apis.run()` instead. Run a raw workflow (not tied to a model). */
  runWorkflow<TResult = unknown>(workflow: string, payload: Record<string, unknown>, options?: WorkflowRunOptions): Promise<TResult>;

  /**
   * Direct, low-level access to the Picsart model APIs — run any API by name.
   * See {@link ApisClient}.
   */
  apis: ApisClient;

  /**
   * Voice/avatar catalogs served by the platform catalog tasks — fetch,
   * ttl-cache, and hydrate model params. See {@link CatalogsClient}.
   */
  catalogs: CatalogsClient;

  /** Drive operations. Only available when drive config is provided. */
  drive: DriveClient | undefined;
}

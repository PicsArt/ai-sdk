import type {
  SdkTransport,
  TransportPollOptions,
  TransportResult,
  WorkflowJobHandle,
  WorkflowProgress,
  WorkflowSubmitRequest,
  CreditUsage,
  ToolUsage,
} from '../core/workflow.ts';
import type { TypedModelId, ModelInputById, TextModelId, TextModelInputById } from '../generated/model-input-types.ts';
import type { DriveFolder, DriveSaveResult, PayloadDriveOptions, DriveClient } from './drive.ts';
import type { ApisClient } from './apis.ts';
import type { CatalogsClient, CatalogsOptions } from './catalogs.ts';

// Re-export for public API — usage typing plus the transport seam. Writing a
// transport needs the vocabulary its methods speak (`WorkflowSubmitRequest`,
// `WorkflowJobHandle`, `TransportResult`), so those come out too; the rest of
// the Workflow* wire types stay internal.
export type {
  SdkTransport,
  TransportPollOptions,
  TransportResult,
  WorkflowJobHandle,
  WorkflowSubmitRequest,
  CreditUsage,
  ToolUsage,
};

/** Worker-reported progress on a generation.progress event. */
export type GenerationProgress = WorkflowProgress;

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

/** Settings that apply whichever transport serves the client. */
interface ClientConfigBase {
  /** Enable Drive integration — auto-save generations to a Drive folder. */
  drive?: DriveConfig;
  /**
   * Input-transformation defaults applied to every generation. A per-call
   * `options.inputsTransformation` overrides this field by field.
   */
  inputsTransformation?: PayloadInputsTransformationOptions;
  /**
   * Voice/avatar catalog behavior. `{ preload: true }` loads the first page
   * of every catalog-bound param in the background at client creation.
   */
  catalogs?: CatalogsOptions;
}

/**
 * The usual config: the API base URL plus one auth source, and the SDK builds
 * its own transport over @picsart/workflows-client.
 *
 * Provide exactly one of:
 * - `fetch` — your own authenticated fetch (you add headers/cookies), or
 * - `apiKey` — the SDK builds a fetch that sends `Authorization: Bearer <apiKey>`.
 */
interface HttpClientConfig extends ClientConfigBase {
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
  transport?: undefined;
}

/**
 * Config for a caller-supplied {@link SdkTransport} — you own the wire, so
 * `apiUrl` and the auth source are yours to bake into the transport and are
 * not required here (the SDK never passes them to it).
 *
 * Two surfaces still speak the workflows protocol directly and therefore keep
 * needing `apiUrl` plus `fetch`/`apiKey` when you use them: `ai.drive`, and
 * `ai.apis`. Everything else — generate, the async lifecycle, `getCredits`,
 * `ai.catalogs` — goes through the transport.
 */
interface TransportClientConfig extends ClientConfigBase {
  /** Transport the client runs on, in place of the built-in one. */
  transport: SdkTransport;
  /** Only needed for `ai.drive` / `ai.apis`. */
  apiUrl?: string;
  /** Only needed for `ai.drive` / `ai.apis`. */
  fetch?: AuthenticatedFetch;
  /** Only needed for `ai.drive` / `ai.apis`. */
  apiKey?: string;
}

/**
 * Client config — either the built-in transport's shape or a custom
 * transport's. The two halves are deliberately unexported: they carry the same
 * fields and differ only in which are required, so `ClientConfig` is the single
 * name to annotate with.
 */
export type ClientConfig = HttpClientConfig | TransportClientConfig;

// ── Result types ─────────────────────────────────────────────────────

import type { GenerateResultItemMetadata } from '../core/response.ts';
export type { GenerateResultItemMetadata };

export interface GenerateResultItem {
  url: string;
  metadata?: GenerateResultItemMetadata;
}

/** Result of a media generation. */
export interface GenerateResult {
  /** Primary result URL (convenience shortcut for items[0].url). */
  url: string;
  /** All result items — one for normal models, multiple for explore/multi-result models. */
  items: GenerateResultItem[];
  /** @deprecated Use {@link items} — same array; removed in the next major. */
  results: GenerateResultItem[];
  /**
   * The generation id — pass to result()/subscribe() together with the model
   * id. Absent for syncExecute models: their generation completes inline in
   * one request, so there is no job to poll or recover.
   */
  generationId?: string;
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
  /** Raw parsed output — carries vendor token usage, finish reason, thinking trace, etc. */
  raw: unknown;
  /** Credit usage reported by the platform — same structure as the pluggable APIs' GenAITaskResponse. */
  usage?: CreditUsage;
}

// ── Generation events (ai.subscribe) ─────────────────────────────────

import type { ApiError } from '../core/errors.ts';

/**
 * Named constants for the {@link GenerationEvent} discriminant — sugar over
 * the string literals for consumers who prefer `GenerationEventType.Completed`
 * to `'generation.completed'`. Both compare fine: the event `type` field stays
 * a literal union, so raw strings keep working (and keep autocompleting).
 */
export const GenerationEventType = {
  Progress: 'generation.progress',
  Completed: 'generation.completed',
  Failed: 'generation.failed',
} as const;
export type GenerationEventType =
  (typeof GenerationEventType)[keyof typeof GenerationEventType];

/**
 * One `ai.subscribe()` update.
 * - `generation.progress` — a non-terminal poll; `progress` is present when
 *   the worker reports it (percent, ETA).
 * - `generation.completed` — terminal; carries the parsed
 *   {@link GenerateResult} in `result`, no follow-up `ai.result()` needed.
 * - `generation.failed` — terminal (worker FAILED or the job was canceled);
 *   carries the same {@link ApiError} that `ai.result()` would have thrown.
 */
export type GenerationEvent =
  | { type: 'generation.progress'; progress?: GenerationProgress }
  | { type: 'generation.completed'; result: GenerateResult }
  | { type: 'generation.failed'; error: ApiError };

/** Input-transformation settings injected into the workflow payload as
 *  `options.inputs_transformation` (GenAIOptions, alongside `drive`). */
export interface PayloadInputsTransformationOptions {
  /**
   * Downscale input images that exceed the vendor's download size cap
   * (e.g. ByteDance's 30 MiB) and retry the generation once, instead of
   * failing with an input-limit error. Opt-in — defaults to false, so an
   * oversized input fails fast unless you set this; workers without input
   * transformation ignore it.
   */
  downscaleOversizedImages?: boolean;
}

/** Polling controls for result()/subscribe() on an already-submitted job. */
export interface GenerationOptions {
  /** Poll interval in ms. Overrides the model's `pollOptions` and the mode default. */
  intervalMs?: number;
  /** Max poll attempts before timing out. Overrides the model's `pollOptions` and the mode default. */
  maxAttempts?: number;
  signal?: AbortSignal;
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
  /** Input-transformation settings for this call — overrides the client-level
   *  `inputsTransformation`. When neither is set, oversized-image downscaling
   *  stays off (opt-in). */
  inputsTransformation?: PayloadInputsTransformationOptions;
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

  /** Submit a generation job and get its generation id back. Media models only. */
  submit<M extends MediaModelId>(model: M, params: ModelInputById[M], options?: GenerateOptions): Promise<string>;

  /** Poll a submitted job until it completes and return the parsed result. Media models only. */
  result(model: MediaModelId, generationId: string, options?: GenerationOptions): Promise<GenerateResult>;

  /**
   * Subscribe to live updates for a submitted job. Yields one
   * {@link GenerationEvent} per poll; the terminal `generation.completed`
   * event carries the parsed result in `event.result`, and failures/cancels
   * arrive as `generation.failed` events (with the {@link ApiError}), not as
   * exceptions.
   */
  subscribe(model: MediaModelId, generationId: string, options?: GenerationOptions): AsyncGenerator<GenerationEvent, void, void>;

  /** Build the vendor-specific payload for a model without submitting. */
  buildPayload<M extends TypedModelId>(model: M, params: ModelInputById[M]): Record<string, unknown>;

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

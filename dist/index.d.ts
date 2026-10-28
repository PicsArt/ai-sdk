import { WorkflowTypes, ExecutionOptions, WorkflowResponse } from './_vendor/workflows-client/index';
export { ExecutionMode as ApiRunMode } from './_vendor/workflows-client/index';
export { JsonModelId, ModelInput, ModelInputById, TextModelId, TextModelInputById, TypedModelId } from './_vendor/model-types/index';
import { ModelPricingClientOptions } from './_vendor/pa-model-pricing-sdk/index';

interface WorkflowSubmitRequest<TPayload = Record<string, unknown>> {
    /** Workflow endpoint, e.g. "veo-text-to-video". */
    workflow: string;
    payload: TPayload;
    signal?: AbortSignal;
}
interface WorkflowJobHandle {
    workflow: string;
    id: string;
}
interface WorkflowProgress {
    percent?: number;
    estimatedSecondsLeft?: number;
}
/**
 * Per-tool credit usage entry inside {@link CreditUsage.details}
 * (mirrors `ToolUsage` from `pa-pluggable-api-adapter`).
 */
interface ToolUsage {
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
interface CreditUsage {
    /** The tool identifier. Set to "total_credits" when subtask usage is present. */
    toolId?: string;
    /** Per-tool credit usage breakdown. */
    details?: ToolUsage[];
    /** The amount of credits charged. */
    credits: number;
    /** The remaining balance. */
    balance?: number;
}
/**
 * What a model's `/options` endpoint answers for one request — its price, how
 * it was derived, and whether the caller is permitted to run it (mirrors `WorkflowOptions` from
 * `@picsart/workflows-client`).
 */
interface OptionsResult {
    /** Monetization tool the request is billed under. */
    toolId?: string;
    /** Billable quantity, in `unit`s (e.g. seconds of video, tokens). */
    usageAmount?: number;
    /** Credits the request would be charged. */
    credits: number;
    /** Credits before any discount was applied. */
    originalCredits?: number;
    /** True when `credits` is a best guess rather than the exact charge — e.g. token-priced models, billed on actual usage. */
    estimated?: boolean;
    /** What `usageAmount` counts, e.g. "second" or "token". */
    unit?: string;
    /** Rate per `unit`. */
    price?: number;
    /** False when the caller lacks a permission the request needs — see `missingPermissions`. */
    hasPermission?: boolean;
    /** Permissions the caller is missing for this request, when `hasPermission` is false. */
    missingPermissions?: string[];
}
interface WorkflowPollOptions {
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
interface TransportResult<TResult = unknown> {
    result?: TResult;
    usage?: CreditUsage;
    /** Raw payload as the transport received it. Defaults to `result`. */
    raw?: unknown;
}
/** Poll controls plus the progress sink `ai.subscribe()` drains. */
interface TransportPollOptions extends WorkflowPollOptions {
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
interface SdkTransport<TPayload = Record<string, unknown>> {
    /** One-shot synchronous run: submit and return the finished result. */
    execute(request: WorkflowSubmitRequest<TPayload>): Promise<TransportResult>;
    /** Start an async job and return its generation id. */
    submit?(request: WorkflowSubmitRequest<TPayload>): Promise<string>;
    /** Wait for a submitted job to reach a terminal state, reporting progress. */
    poll?(handle: WorkflowJobHandle, options?: TransportPollOptions): Promise<TransportResult>;
    /** Read a submitted job's current state in one request — no waiting. */
    status?(handle: WorkflowJobHandle, signal?: AbortSignal): Promise<TransportResult>;
    /**
     * Credits this request would cost, or null when pricing is unavailable.
     * Answer a bare number, or the full {@link OptionsResult} response.
     */
    options?(workflow: string, payload: Record<string, unknown>): Promise<number | OptionsResult | null>;
}

interface ParamSchema {
    type: 'string' | 'number' | 'boolean' | 'file';
    enum?: (string | number)[];
    default?: string | number | boolean;
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
    label?: string;
    accept?: string;
}
type ModelParamSchema = Record<string, ParamSchema>;

/**
 * Runtime catalogs — the standard format served by the platform
 * `<vendor>/v1/catalog/<voices|avatars|…>` tasks (voices, avatars, effect
 * templates), plus the in-memory hydration registry that lets runtime-fetched
 * catalogs back the descriptor system.
 *
 * The wire types mirror the shared backend contract (`@picsart/pa-genai-common`);
 * the SDK owns its own copy so it carries no backend dependency.
 */

interface CatalogPreview {
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
}
interface CatalogItem {
    /** Vendor-native id, sent back verbatim on generate as the bound param's value. */
    id: string;
    name: string;
    description?: string;
    /** Facets for filtering: gender, language, age, accent, tone, … */
    tags: string[];
    preview?: CatalogPreview;
    /** Vendor extras, e.g. `defaultVoiceId` on HeyGen avatars. */
    meta?: Record<string, unknown>;
}
interface CatalogQuery {
    /** Worker-side filter (e.g. the seed-audio model variant on bytedance). */
    modelId?: string;
    /** Opaque cursor from a previous page. */
    cursor?: string;
    /** Page size. Every catalog task accepts up to 100. */
    limit?: number;
}
interface CatalogResult {
    items: CatalogItem[];
    /** Crawl date or curation stamp identifying the snapshot. */
    version: string;
    /** How long the caller may cache this response. */
    ttlSeconds: number;
    /** `null` when the list is complete. */
    nextCursor: string | null;
}
/** Binds a param's options to a platform catalog task. */
interface CatalogSource {
    /** Catalog workflow name, e.g. `heygen/v1/catalog/voices`. */
    workflow: string;
    /** Worker-side filter passed on fetch. */
    modelId?: string;
}
declare function toVoiceOption(item: CatalogItem, provider: Provider): VoiceOption;
declare function toAvatarOption(item: CatalogItem, provider: Provider): AvatarOption;

/**
 * Param Descriptor types — the new, open-ended parameter definition system.
 *
 * Each model defines `params: ModelParams` (a Record of ParamEntry).
 * Consumers iterate descriptors generically instead of switching on named ParamConfig fields.
 */
interface EnumOption<T extends string | number = string> {
    id: T;
    label?: string;
    disabled?: boolean;
    disabledReason?: string;
}
interface EnumDescriptor<T extends string | number = string> {
    kind: 'enum';
    valueType: 'string' | 'number';
    options: Array<EnumOption<T>>;
    default: T;
}
/**
 * Free-string id served by a platform catalog task (voices/avatars). The id
 * space is open-ended — the live catalog is the source of truth — so the value
 * is validated only by type, never by membership. `source` says which task
 * serves the options; the entry's `catalogOptions` carries the seed (and,
 * after `ai.catalogs.voices/avatars`, the live list).
 */
interface CatalogDescriptor {
    kind: 'catalog';
    /** Platform catalog task that serves this param's live options. */
    source: CatalogSource;
    default: string;
}
interface RangeDescriptor {
    kind: 'range';
    min: number;
    max: number;
    step?: number;
    /** Optional: default-less ranges (e.g. seed) are sent only when set. */
    default?: number;
}
interface BooleanDescriptor {
    kind: 'boolean';
    default: boolean;
}
interface TextDescriptor {
    kind: 'text';
    minLength?: number;
    maxLength?: number;
    placeholder?: string;
}
interface FileDescriptor {
    kind: 'file';
    accept: 'image' | 'video' | 'audio' | 'media';
    /** Present = array; absent = single. `min`/`max` bound the array length. */
    array?: {
        min?: number;
        max?: number;
    };
    /**
     * Max intrinsic duration (seconds) accepted for a video/audio file. Enforced
     * client-side at upload by measuring the media before it is sent; the backend
     * worker stays the authoritative gate. Omit for no client-side cap.
     */
    maxDurationSec?: number;
    /**
     * Min intrinsic duration (seconds) accepted for a video/audio file. Unlike
     * every other bound here this one has no remedy: a clip that is too short
     * cannot be lengthened, so the client's only honest move is to refuse the
     * attachment and say why. Enforced client-side at upload by measuring the
     * media before it is sent; the backend worker stays the authoritative gate.
     * Omit for no client-side floor.
     */
    minDurationSec?: number;
    /**
     * Max intrinsic frame rate (fps) accepted for a video file. Enforced
     * client-side at upload by measuring the media before it is sent; the backend
     * worker stays the authoritative gate. Omit for no client-side cap.
     */
    maxFrameRate?: number;
    /**
     * Min intrinsic pixel count (width × height) accepted for an image/video file.
     * Enforced client-side at upload by measuring the media before it is sent; the
     * backend worker stays the authoritative gate. Omit for no client-side floor.
     */
    minPixels?: number;
    /**
     * Min intrinsic short-side length (pixels) accepted for an image/video file —
     * `min(width, height)` must be at least this. Most vendors specify input limits
     * per side rather than by total pixel count (e.g. Seedance reference images:
     * width and height each in [300, 6000]). Enforced client-side at upload by
     * measuring the media before it is sent; the backend worker stays the
     * authoritative gate. Omit for no client-side floor.
     */
    minSidePixels?: number;
    /**
     * Max intrinsic pixel count (width × height) accepted for an image/video
     * file. The ceiling matching `minPixels`, and a separate rule from
     * `maxSidePixels`: a 12000×2000 frame passes a 36 MP area cap and still
     * breaks a 6000 px per-side one. Enforced client-side at upload by measuring
     * the media before it is sent; the backend worker stays the authoritative
     * gate. Omit for no client-side ceiling.
     */
    maxPixels?: number;
    /**
     * Max intrinsic long-side length (pixels) accepted for an image/video file:
     * `max(width, height)` must not exceed this. The ceiling matching
     * `minSidePixels`, so the pair expresses the shape vendors usually publish
     * ("width and height must each be between 300 and 6000 px"). Distinct from
     * `maxShortSidePixels`, which bounds the OTHER side and exists for upscaler
     * sources. Enforced client-side at upload by measuring the media before it is
     * sent; the backend worker stays the authoritative gate. Omit for no
     * client-side ceiling.
     */
    maxSidePixels?: number;
    /**
     * Min intrinsic aspect ratio (width / height) accepted for an image/video
     * file. Vendors publish this as the bound a panorama or a tall crop breaks,
     * and it is not derivable from the pixel and side bounds: a 6000x1200 frame
     * satisfies a [300, 6000] per-side rule and a 36 MP area rule and is still
     * refused at 5.0. Enforced client-side at upload by measuring the media
     * before it is sent; the backend worker stays the authoritative gate. Omit
     * for no client-side floor.
     */
    minAspectRatio?: number;
    /**
     * Max intrinsic aspect ratio (width / height) accepted for an image/video
     * file. The ceiling matching `minAspectRatio`.
     */
    maxAspectRatio?: number;
    /**
     * Max intrinsic short-side length (pixels) accepted for an image/video file —
     * `min(width, height)` must not exceed this. Used by upscalers whose source
     * must stay below the target resolution. Enforced client-side at upload by
     * measuring the media before it is sent; the backend worker stays the
     * authoritative gate. Omit for no client-side ceiling.
     */
    maxShortSidePixels?: number;
    /**
     * Max file size in bytes accepted for this slot (e.g. Seedance 2.5 reference
     * videos are capped at 200 MiB by the vendor). Enforced client-side at upload
     * by measuring the file (or its `Content-Length`) before it is sent; the
     * backend worker stays the authoritative gate. Omit for no client-side cap.
     */
    maxBytes?: number;
}
/** Any value — no validation, generates as `unknown`. Only meaningful as an
 *  ObjectDescriptor's `additionalProperties` (or a nested field): it marks a
 *  pass-through slot whose shape the vendor owns. */
interface UnknownDescriptor {
    kind: 'unknown';
}
interface ObjectDescriptor {
    kind: 'object';
    /** Declared fields — flat EntryMeta + Descriptor merge, same shape as
     *  EnumEntry / RangeEntry / etc. Authors can mark a nested field optional
     *  by setting `required: false`. Default is required. */
    fields?: Record<string, EntryMeta & ParamDescriptor>;
    /**
     * JSON-Schema-style `additionalProperties`: keys beyond `fields` are
     * allowed, each value validated against this descriptor. With no `fields`
     * the object is an open-keyed dictionary (generates `Record<string, V>` —
     * e.g. question id → question object); alongside `fields` it admits
     * vendor-defined extras (generates `{ …fields } & Record<string, V>`).
     * Use `{ kind: 'unknown' }` to pass extras through unvalidated.
     * Omitted → closed shape: exactly `fields`.
     */
    additionalProperties?: ParamDescriptor;
    array?: {
        min?: number;
        max?: number;
    };
}
type ParamDescriptor = EnumDescriptor<string> | EnumDescriptor<number> | CatalogDescriptor | RangeDescriptor | BooleanDescriptor | TextDescriptor | FileDescriptor | ObjectDescriptor | UnknownDescriptor;
interface ParamEntry {
    label?: string;
    required?: boolean;
    /**
     * Role of a file input relative to the output. Drives prompt-area filmstrip
     * grouping: assets first, divider only when both groups are present, then
     * references. Only meaningful for `kind: 'file'` descriptors.
     *
     * - `asset`: direct input that becomes part of the output (start/end frame, sync audio)
     * - `reference`: guidance signal that influences the result (style/character/motion ref)
     */
    category?: 'asset' | 'reference';
    descriptor: ParamDescriptor;
    /** Original rich option objects (e.g. VoiceOption[], AvatarOption[]) preserved for UI catalogs. */
    catalogOptions?: readonly unknown[];
}
type ModelParams = Record<string, ParamEntry>;
interface EntryMeta {
    label?: string;
    required?: boolean;
    category?: 'asset' | 'reference';
    catalogOptions?: readonly unknown[];
    disabled?: boolean;
    disabledReason?: string;
    /** Why the param is required, when a constraint made it so (see `Restriction`). */
    requiredReason?: string;
}
type EnumEntry = EntryMeta & EnumDescriptor<string | number>;
type CatalogEntry = EntryMeta & CatalogDescriptor;
type RangeEntry = EntryMeta & RangeDescriptor;
type BooleanEntry = EntryMeta & BooleanDescriptor;
type TextEntry = EntryMeta & TextDescriptor;
type FileEntry = EntryMeta & FileDescriptor;
type ObjectEntry = EntryMeta & ObjectDescriptor;
type UnknownEntry = EntryMeta & UnknownDescriptor;
/** Flat param entry with key — returned by ModelAccessor.params(). */
type FlatParamEntry = EntryMeta & ParamDescriptor & {
    key: string;
};

/** Provider metadata. */
interface ProviderInfo {
    readonly id: Provider;
    readonly name: string;
    readonly color: string;
    readonly label: string;
}
/** Model metadata — classification, display, provider. */
interface ModelMeta {
    readonly mode: GenerationMode;
    readonly inputType: InputType;
    readonly description: string;
    readonly features: ModelFeature[];
    readonly badges: BadgeType[];
    readonly provider: ProviderInfo;
    /** ISO YYYY-MM-DD date the model was added to the catalog, or null if unknown. */
    readonly addedAt: string | null;
    /** Release / availability tier. Absent on the definition ⇒ `'production'`. */
    readonly release: ReleaseTag;
}
/** Parameter operations — fluent access to model params, schemas, defaults. */
interface ModelParamsAccessor {
    param(key: string): (EntryMeta & ParamDescriptor) | undefined;
    hasParam(key: string): boolean;
    all(): FlatParamEntry[];
    enum(key: string): EnumEntry | undefined;
    /** Catalog params (`kind: 'catalog'`) — free-string ids; options live in `catalogOptions`. */
    catalog(key: string): CatalogEntry | undefined;
    range(key: string): RangeEntry | undefined;
    boolean(key: string): BooleanEntry | undefined;
    text(key: string): TextEntry | undefined;
    file(key: string): FileEntry | undefined;
    prompt(): TextEntry | undefined;
    aspectRatio(): EnumEntry | undefined;
    /** Duration is an enum on models with a fixed option list and a range on
     *  models whose vendor accepts every value in a span (kling-t2a,
     *  seedance-2.5), so narrow on `.kind` before reading `.options` / `.min`. */
    duration(): EnumEntry | RangeEntry | undefined;
    resolution(): EnumEntry | undefined;
    generateAudio(): BooleanEntry | undefined;
    startFrame(): FileEntry | undefined;
    endFrame(): FileEntry | undefined;
    hasFileInput(): boolean;
    getDefault(key: string): unknown;
    getDefaults(): Record<string, unknown>;
    toSchema(): ModelParamSchema;
    transferValues(prev: Record<string, unknown>): Record<string, unknown>;
}
/** Credit range for a model — min/max credits across all pricing variants. */
interface CreditRange {
    min: number;
    max: number;
    /** Pricing unit (e.g. 'generation', 'second', 'megapixel'). Set when all matched entries share a unit. */
    unit?: string;
    /** Per-tier breakdown behind the range — one entry per pricing row (quality /
     *  audio / token-type variant). Reflects the entries the range summarizes
     *  (all tiers, or the ctx-filtered subset). */
    tiers: CreditTier[];
}
/** Optional context to narrow the credit range by resolution / audio. */
interface CreditRangeContext {
    resolution?: string;
    generateAudio?: boolean;
}
/** A single pricing tier for a model — one row of its rate table. */
interface CreditTier {
    /** Credits charged per `unit`. */
    credits: number;
    /** Billing unit (e.g. 'generation', 'second', 'megapixel', 'output_text_tokens'). */
    unit: string;
    /** Quality/resolution variant this rate applies to, when priced by quality. */
    quality?: string;
    /** Whether this rate is for audio-enabled generation. */
    audio?: boolean;
    /** Use case this rate applies to (e.g. 'text-to-video'). */
    useCase?: string;
}
/** Top-level model accessor with grouped sub-accessors. */
/** Result of validating generation input against a model's params. */
interface ValidationResult {
    valid: boolean;
    errors?: string[];
}
interface ModelDescriptor {
    readonly id: string;
    readonly name: string;
    params(): ModelParamsAccessor;
    /** Params with constraint effects pre-applied (disabled options, hidden params). */
    paramsFor(values: Partial<GenerationContext>): ModelParamsAccessor;
    meta(): ModelMeta;
    /** Validate generation input against this model's params. Returns
     *  `{ valid: true }` or `{ valid: false, errors }` — never throws. */
    validate(input: unknown): ValidationResult;
    /** Get the credit range for this model, plus the per-tier breakdown in
     *  `.tiers`. Pass context to narrow by resolution/audio. Returns the per-unit
     *  range — callers with time-based parameters should scale by the value
     *  themselves (e.g. multiply by duration when range.unit === 'second').
     *  Returns null if pricing is not loaded or the model has no entry. */
    getCreditsInfo(ctx?: CreditRangeContext): CreditRange | null;
    /** Workflow identifiers for this model. */
    readonly api: {
        /** Primary workflow name for generation. */
        readonly workflow: string;
        /** Edit/I2V workflow name (when different from primary). */
        readonly editWorkflow: string | undefined;
    };
}
/** Filter criteria for `catalog.find()`. */
interface ModelFilter {
    output?: GenerationMode;
    provider?: string;
    /**
     * Release tiers to include. Omitted ⇒ the default visible set
     * (`['production', 'general-availability']`). List the tiers you want
     * explicitly to opt into `preview` — e.g. `['preview']` for stage-only
     * models, or all three to include everything. `deprecated` models stay
     * hidden regardless.
     */
    release?: ReleaseTag[];
}

type AppProvider = 'picsart' | 'google' | 'kling' | 'grok' | 'openai' | 'flux' | 'ideogram' | 'elevenlabs' | 'minimax' | 'wan' | 'seedance' | 'ltx' | 'seedream' | 'seedaudio' | 'hunyuan' | 'pika' | 'runway' | 'luma' | 'ovi' | 'creatify' | 'veed' | 'bytedance' | 'qwen' | 'reve' | 'recraft' | 'videography' | 'topaz' | 'heygen' | 'happyhorse' | 'pixverse' | 'anthropic' | 'async' | 'captionsai' | 'meta' | 'typesafe' | 'depth-anything' | 'kimi' | 'mirelo';
/** Provider used by model definitions. */
type Provider = AppProvider;
/** App generation modes. `json` marks structured-output models (judges,
 *  evaluators, classifiers) — no media URL, no extractable text; their parsed
 *  result is returned as-is by `ai.run()`. */
type GenerationMode = 'video' | 'image' | 'audio' | 'text' | 'json';
/** App input types. */
type InputType = 't2v' | 'i2v' | 'v2v' | 'a2v' | 't2i' | 'i2i' | 't2a' | 'v2a' | 'tts' | 'sts' | 'sfx' | 'music' | 't2t' | 'i2t' | 'v2t' | 'a2t';
interface ModelFeature {
    label: string;
    variant: 'frame' | 'resolution' | 'audio' | 'duration' | 'input' | 'quality' | 'style' | 'characteristic';
}
interface VoiceOption {
    id: string;
    name: string;
    description: string;
    tags: string[];
    provider: Provider;
    previewUrl?: string;
}
interface AvatarOption {
    id: string;
    name: string;
    description: string;
    tags: string[];
    provider: Provider;
    previewImageUrl?: string;
    previewVideoUrl?: string;
    gender?: string;
    defaultVoiceId?: string;
}
interface ParamOption {
    id: string;
    label: string;
}
interface GenerationContext {
    prompt: string;
    aspectRatio?: string;
    duration?: number;
    resolution?: string;
    count?: number;
    generateAudio?: boolean;
    enhancePrompt?: boolean;
    imageUrls?: string[];
    videoUrls?: string[];
    /** Audio URL array — reference audios (max N per model, backend enforces
     *  total-duration caps). Distinct from `audioUrl` (single driving-audio). */
    audioUrls?: string[];
    startFrame?: string;
    endFrame?: string;
    videoUrl?: string;
    audioUrl?: string;
    /** TTS-generated audio id (e.g. Kling Avatar audio_id, alternative to sound_file). */
    audioId?: string;
    voiceId?: string;
    videoId?: string;
    modelId?: string;
    removeBackgroundNoise?: boolean;
    /** MiniMax Music — user lyrics, sent as the worker `lyrics` field. */
    lyricsPrompt?: string;
    lyricsOptimizer?: boolean;
    isInstrumental?: boolean;
    /** LTX 2.3 — output frame rate (24/25/48/50; >10s Fast videos require 25). */
    fps?: number;
    /** LTX 2.3 Extend — direction: 'end' extends forward, 'start' backward. */
    mode?: string;
    /** LTX 2.3 Retake — which tracks to regenerate. */
    retakeMode?: string;
    /** LTX 2.3 Retake — segment start offset in seconds. */
    startTime?: number;
    language?: string;
    accent?: string;
    style?: string;
    /**
     * Effect template id — a catalog-served content preset id (e.g. a Kling effect
     * scene from `kling/v1/catalog/templates`). Free string; the live catalog is
     * the source of truth.
     */
    templateId?: string;
    quality?: string;
    size?: string;
    negativePrompt?: string;
    cfgScale?: number;
    imageWeight?: number;
    renderingSpeed?: string;
    /** Ideogram V4 — opt into post-generation copyright detection (Hive likeness + logo checks). */
    enableCopyrightDetection?: boolean;
    mentionedPersonas?: Array<{
        id: string;
        name: string;
        imageUrl: string;
        vibeId: string;
    }>;
    outputMegapixels?: number;
    sourceImageId?: string;
    /** Display-only URL for the source image (not sent to API, used for UI preview). */
    sourceImageUrl?: string;
    similarity?: number;
    audioSetting?: 'auto' | 'origin';
    /** MiniMax Music — audio_setting knobs. */
    sampleRate?: number;
    bitrate?: number;
    format?: string;
    returnLastFrame?: boolean;
    background?: string;
    outputFormat?: string;
    colorDepth?: string;
    guidance?: number;
    seed?: number;
    substyle?: string;
    thinkingLevel?: 'minimal' | 'high';
    thinkingBudget?: number;
    /** Qwen 3.0 family — prompt-rewrite strategy (`direct`/`agent`), sent as `prompt_extend_mode`. */
    promptExtendMode?: 'direct' | 'agent';
    /** Qwen 3.0 family — thinking mode (requires prompt_extend), sent as `enable_thinking`. */
    enableThinking?: boolean;
}
/** See `ModelDefinition.validateInput`. */
type InputValidator = (input: Record<string, unknown>) => void;
type PayloadBuilder<TContext extends GenerationContext = GenerationContext> = (ctx: TContext) => object;
/** Lightweight runtime schema contract used by SDK integrations. */
interface RuntimeSchema<T = unknown> {
    parse(input: unknown): T;
}
/** Pricing unit type — determines how per-unit rate is multiplied on the client.
 *  - per_second: rate × duration (video/audio)
 *  - per_minute: rate × (duration / 60)
 *  - per_image: rate (flat per image; count multiplied separately in UI)
 *  - per_megapixel: rate × megapixels
 *  - per_character: rate × prompt length
 *  - per_1k_character: rate × (prompt length / 1000)
 *  - per_video: rate (flat per video)
 *  - per_audio: rate (flat per audio)
 */
/** Condition operator: equality or existence check. */
type ConditionOperator = {
    is: unknown;
} | {
    exists: boolean;
};
/** Condition map: each key maps to an operator. */
type ConstraintCondition = Record<string, ConditionOperator>;
/** Per-param outcome of a matching constraint rule.
 *  - `allowed`: restrict this param to a subset of values.
 *  - `disabled`: param is flagged as constrained — UI interprets per-param kind
 *    (dropdowns grey out; text inputs like `prompt` stay editable but surface
 *    the reason as an info banner).
 *  - `required`: param becomes required while the condition holds. Expresses
 *    cross-field rules a static `required` flag cannot, e.g. "a prompt or a
 *    first-frame image": `when` both are absent, `then` the prompt is required.
 *    Enforced by `validate()` and at submit, and reported by `paramsFor()` as
 *    `required: true` with `requiredReason`, so a UI gate reads it like any
 *    other required param.
 */
type Restriction = {
    allowed: unknown[];
    reason?: string;
} | {
    disabled: true;
    reason?: string;
} | {
    required: true;
    reason?: string;
};
/** Declarative rule: when condition matches, apply restrictions to params. */
interface Constraint {
    when: ConstraintCondition;
    then: Record<string, Restriction>;
}
type BadgeType = 'new' | 'popular' | 'coming-soon' | 'fast' | 'premium' | 'hot';
/**
 * Model release / availability tier. See `ModelDefinition.release`.
 * Ordered widest-exposure-last: `preview` (stage only) → `production` (our
 * apps) → `general-availability` (enterprise / external use).
 */
type ReleaseTag = 'preview' | 'production' | 'general-availability';
interface ModelDefinition {
    id: string;
    name: string;
    provider: Provider;
    workflow: string;
    editWorkflow?: string;
    syncExecute?: boolean;
    /** Provider display name (e.g. 'Flux', 'OpenAI', 'Kling'). */
    providerName: string;
    /** Provider brand color hex (e.g. '#FF6B6B'). */
    providerColor: string;
    /** Provider short label (e.g. 'F', 'O', 'K'). */
    providerLabel: string;
    description: string;
    features: ModelFeature[];
    badge?: BadgeType[];
    /** ISO YYYY-MM-DD date the model was added. The 'new' badge is derived from this — see core/badges.ts. */
    addedAt?: string;
    /**
     * Marks a model as retired — superseded by a newer model or otherwise no
     * longer offered. Will not come back. Catalog row stays so workflow IDs
     * and toolIds remain resolvable for historical jobs and pricing. Hidden
     * from default catalog lookups. (Operationally-gated models use
     * `release: 'preview'` instead.)
     */
    deprecated?: boolean;
    release?: ReleaseTag;
    mode: GenerationMode;
    inputType: InputType;
    modelId?: string;
    paramConfig: ModelParams;
    /** Declarative inter-parameter constraints (e.g. "1080p requires 8s duration"). */
    constraints?: Constraint[];
    /**
     * Model-specific input check that the declarative layer cannot express —
     * a value format, or a "this OR those, never both" rule. Runs after the
     * per-param and constraint validation, on the raw input (no defaults
     * merged), and throws an `Error` whose message names the offending param.
     */
    validateInput?: InputValidator;
    /** Payload builder. Optional — omit for pass-through (param values sent as-is). */
    buildPayload?: PayloadBuilder;
    /** I2V/edit payload builder when different from buildPayload. */
    buildEditPayload?: PayloadBuilder;
    outputSchema?: RuntimeSchema<unknown>;
    /**
     * File extension the model produces when it has no output-format param
     * (e.g. 'jpg'). Used to name a Drive save made before the job runs; without
     * it the mode default applies (png / mp4 / mp3).
     */
    outputExtension?: string;
    estimatedTime?: number | Record<string, number>;
    editEstimatedTime?: number | Record<string, number>;
    testTimeout?: number;
    /**
     * Per-model polling overrides for async jobs. Narrows or widens the mode
     * default (video 2s × 1800 ≈ 1 h; image/audio/text 1s × 1200 ≈ 20 min) for
     * models whose generations don't fit it. Explicit per-call poll options
     * still win.
     */
    pollOptions?: {
        intervalMs?: number;
        maxAttempts?: number;
    };
}

/**
 * Per-item vendor metadata promoted from the response. Every key is
 * best-effort: present when the vendor reports it, absent otherwise.
 */
interface GenerateResultItemMetadata {
    /** Explore image id (recraft explore models) — pass back as `sourceImageId`
     *  to iterate on this image. */
    exploreImageId?: string;
    /** Voice preview id (ElevenLabs voice design/remix) — pass to the vendor's
     *  create-voice-from-preview step to persist the voice. */
    generatedVoiceId?: string;
    /** URL of the generated video's last frame, when the model was asked for it
     *  (`returnLastFrame`, seedance) — the seed for frame-chaining flows. */
    lastFrameUrl?: string;
    /** The draft a Seedance 2.5 Draft generation produced — pass it back
     *  unchanged as `draftTask` to the matching `-draft-final` model to render
     *  the final 1080p video (valid 7 days). */
    draftTask?: SeedanceDraftTask;
}
/** A Seedance 2.5 draft reference, as the worker issues it. The final step
 *  needs only the draft `id`; the worker resolves the rest from it. */
interface SeedanceDraftTask {
    id: string;
}

/**
 * Drive client — manages folders and file saving in Picsart Drive.
 *
 * Uses the same authenticated fetch as the generation client.
 * Root folder is auto-created on first use and cached.
 */

type MediaTypeFilter = 'image' | 'video' | 'audio';
type UserReaction = 'like' | 'dislike';
/** A folder reference in Picsart Drive. */
interface DriveFolder {
    name: string;
    uid: string;
}
/** Drive save result, attached to GenerateResult when drive is enabled. */
interface DriveSaveResult {
    uid: string;
    folder: DriveFolder;
}
/**
 * The generation input parameters, serialized into the `aiSDKPayload` attribute.
 * Captures every value from the generation context — the named fields below are
 * common ones for convenience; the index signature carries any other input param.
 */
interface SdkPayload {
    prompt: string;
    aspectRatio?: string;
    duration?: number;
    resolution?: string;
    generateAudio?: boolean;
    imageUrls?: string[];
    videoUrls?: string[];
    audioUrls?: string[];
    startFrame?: string;
    endFrame?: string;
    videoUrl?: string;
    audioUrl?: string;
    [key: string]: unknown;
}
type DriveFile = {
    uid: string;
} & Record<string, unknown>;
interface DriveAttributes {
    model: string;
    /** JSON-encoded SdkPayload (all generation input params). */
    aiSDKPayload: string;
    appId?: string;
    appType?: AppType;
}
/** A saved Seedance 2.5 draft — pass `draftTask` unchanged as the final's
 *  `draftTask` param until `draftExpiresAt`. */
interface DriveDraftInfo {
    draftTask?: SeedanceDraftTask;
    /** ISO timestamp after which the vendor no longer renders a final from it. */
    draftExpiresAt?: string;
}
interface GenerationFile extends DriveDraftInfo {
    appId?: string;
    appType?: AppType;
    model?: string;
    aiSDKPayload?: SdkPayload;
    userReaction?: UserReaction;
}
interface DriveMediaItem {
    uid: string;
    url: string;
    name: string;
    type: MediaTypeFilter;
    previewUrl?: string;
    timestamp: number;
}
interface DriveFileDetails extends DriveMediaItem, DriveDraftInfo {
    createdAt?: string;
    model?: string;
    prompt?: string;
    service?: string;
    subType?: string;
    duration?: string;
    aspectRatio?: string;
    resolution?: string;
    quality?: string;
    userReaction?: UserReaction;
    referenceImageUrls?: string[];
    referenceVideoUrl?: string;
    referenceAudioUrl?: string;
}
interface ListOptions {
    folder?: DriveFolder;
    type?: MediaTypeFilter;
}
/** Original generation inputs, portable across clients and delayed Drive saves. */
interface GenerationProvenance {
    modelId: string;
    params: Record<string, unknown>;
    app?: AppIdentity;
}
interface SaveParams {
    url: string;
    name: string;
    resourceType: 'PHOTO' | 'VIDEO' | 'AUDIO';
    attributes?: Record<string, string>;
    /** Required to retain full provenance when saving a generated URL separately. */
    generation?: GenerationProvenance;
    previewUrl?: string;
}
/** Target folder for backend Drive save. */
interface PayloadDriveFolderOptions {
    /** Folder path — backend resolves it (e.g. 'AI Playground' or 'AI Playground/My Board'). */
    path?: string;
    /** Folder UID — overrides path when provided. */
    id?: string;
}
/** Drive save options injected into the workflow payload as `options.drive`. */
interface PayloadDriveOptions {
    /** Filename for the saved asset. */
    name: string;
    /** Generation attributes attached to the file (SDK-assembled, fixed shape). */
    attributes?: DriveAttributes;
    /** Target folder in Picsart Drive. */
    folder?: PayloadDriveFolderOptions;
    /**
     * Inputs to record as the file's provenance when they differ from the
     * submitted request, e.g. a render that sends only a reference to an earlier
     * job. Defaults to the model and params being generated. Never sent to the
     * workflow; it only shapes `attributes`.
     */
    generation?: GenerationProvenance;
}
/**
 * Drive operations surface — returned by {@link createDriveClient} and exposed
 * as `ai.drive` when Drive is configured. Manages folders, listing, saving, and
 * reactions in Picsart Drive.
 */
interface DriveClient {
    /** Ensure a folder exists (creating it if needed) and return it. */
    ensureFolder(subfolder?: string): Promise<DriveFolder | null>;
    /** List the immediate subfolders of the root folder. */
    folders(): Promise<DriveFolder[]>;
    /** List all folders recursively. */
    allFolders(): Promise<DriveFolder[]>;
    /** Find a folder by name. */
    findFolder(name: string): Promise<DriveFolder | null>;
    /** List media items in a folder. */
    list(options?: ListOptions): Promise<DriveMediaItem[]>;
    /** List media items in a folder with full generation metadata. */
    listDetailed(options?: ListOptions): Promise<DriveFileDetails[]>;
    /** Read a single generation's stored attributes. */
    getGeneration(fileUid: string): Promise<GenerationFile | null>;
    /** Save an asset to Drive. */
    save(params: SaveParams, folder?: DriveFolder): Promise<DriveSaveResult | null>;
    /** Build the save params for a generation result. */
    buildSaveParams(url: string, modelId: string, modelName: string, mode: string, promptOrParams?: string | Record<string, unknown>): SaveParams;
    /** Set a like/dislike reaction on a file. */
    addReaction(fileUid: string, reaction: UserReaction): Promise<boolean>;
    /** Clear the reaction on a file. */
    removeReaction(fileUid: string): Promise<boolean>;
}
declare function inferResourceType(mode: string): 'PHOTO' | 'VIDEO' | 'AUDIO';
/** What is known about the file being named. Every field is optional; the
 *  most reliable one present wins (see `resolveExtension`). */
interface FilenameHints {
    /** MIME type of the produced file (e.g. `image/jpeg`). */
    mimeType?: string;
    /** URL of the produced file; its path extension is used when present. */
    url?: string;
    /** Output format requested of (or declared by) the model, e.g. `jpeg`, `mov`, `ogg_opus`. */
    format?: string;
}
/**
 * Pick a file extension for a generation. Most to least reliable: the result's
 * MIME type, the result URL's path extension, the requested output format, then
 * the mode default (png / mp4 / mp3). An unknown mode resolves to '' — the
 * filename stays extension-less rather than mislabeled.
 */
declare function resolveExtension(mode: string, hints?: FilenameHints): string;
/**
 * The output format a generation will produce, known before the job runs:
 * an explicit format param, else that param's catalog default, else the
 * model's declared `outputExtension`. Undefined when nothing is known.
 */
declare function expectedOutputFormat(model: Pick<ModelDefinition, 'paramConfig' | 'outputExtension'>, params: Record<string, unknown>): string | undefined;
declare function buildFilename(prompt: string | undefined, mode: string, hints?: FilenameHints): string;
declare function buildGenerationAttributes(input: GenerationProvenance): DriveAttributes;
declare function parseGeneration(file: DriveFile | Record<string, unknown>): GenerationFile;

/** Result of `ai.apis.run()` — the API result plus optional credit usage. */
type ApiResponse<R = unknown> = WorkflowResponse<R>;
/**
 * Options for `ai.apis.run()` — execution mode, polling, abort signal, progress callbacks.
 * Intentionally omits the lib's `remoteSettingName` (a no-op without remote settings),
 * `onPartialResult`, and `notificationConfig` — these aren't part of the SDK surface.
 */
type ApiRunOptions = Omit<ExecutionOptions, 'remoteSettingName' | 'onPartialResult' | 'notificationConfig'>;
/** Registry of known API names → their params/result types (from @picsart/workflows-types). */
type ApiSchemas = WorkflowTypes;
/**
 * The `ai.apis` surface — direct, low-level access to the Picsart model APIs.
 * Known API names (keys of {@link ApiSchemas}) get typed params + result;
 * unknown names take an open payload and return an unknown result.
 *
 * Failures arrive as {@link ApiError}, the same as the generation surface.
 */
interface ApisClient {
    /** Run an API by name (mirrors WorkflowsClient.run()). */
    run<W extends string = string>(api: W, payload: W extends keyof ApiSchemas ? ApiSchemas[W]['params'] : Record<string, unknown>, options?: ApiRunOptions): Promise<ApiResponse<W extends keyof ApiSchemas ? ApiSchemas[W]['result'] : unknown>>;
}

/**
 * ai.catalogs — runtime access to the platform catalog tasks
 * (`<vendor>/v1/catalog/<voices|avatars|…>`) serving any catalog-bound param
 * (`kind: 'catalog'` descriptor): voices, avatars, effect templates.
 *
 * Loading is page-by-page: each call fetches ONE page (UI loads more on
 * scroll/pagination via `nextCursor`). Pages are cached per the `ttlSeconds`
 * the platform returns, concurrent fetches of the same page collapse, and
 * every fetched page is appended to the options installed on the model so
 * `Model(id).params()` (and every picker built on it) sees what has been
 * loaded so far. With `createClient({ catalogs: { preload: true } })` the
 * first page of every bound catalog loads in the background at client
 * creation.
 */

/** Model id — any string; concrete ids come from the loaded catalog. */
type ModelId = string;
/** One fetched page. Pass `nextCursor` back to load the next one. */
interface CatalogPage {
    items: CatalogItem[];
    /** `null` when the list is complete. */
    nextCursor: string | null;
}
interface CatalogPageOptions {
    /** Cursor from the previous page's `nextCursor`; omit for the first page. */
    cursor?: string;
    /** Page size, 1..100. Defaults to 100. */
    limit?: number;
    /** Drop everything cached for this catalog and refetch from the first page. */
    forceRefresh?: boolean;
    /**
     * Cancels this caller's wait only. A fetch shared with other callers keeps
     * running so its result can still be cached for them.
     */
    signal?: AbortSignal;
}
interface CatalogsClient {
    /**
     * One page of the model's voice catalog (`voiceId` param). Fetched pages
     * accumulate into `Model(id).params().catalog('voiceId').catalogOptions`,
     * so pickers see everything loaded so far.
     */
    voices(model: ModelId, options?: CatalogPageOptions): Promise<CatalogPage>;
    /** One page of the model's avatar catalog — same semantics, for `videoId`. */
    avatars(model: ModelId, options?: CatalogPageOptions): Promise<CatalogPage>;
    /** One page of the model's effect-template catalog — same semantics, for `templateId`. */
    templates(model: ModelId, options?: CatalogPageOptions): Promise<CatalogPage>;
}
interface CatalogsOptions {
    /**
     * Load the first page of every catalog-bound param in the background at
     * client creation, so pickers open with data before any explicit call.
     */
    preload?: boolean;
}

/**
 * Failure codes the SDK synthesizes when the platform supplies no `reason`.
 * An API-supplied `reason` passes through unchanged, so the open `string`
 * member keeps arbitrary platform reasons assignable while preserving
 * autocomplete on the known set.
 */
type ApiErrorCode = 'unknown_model' | 'wrong_model_mode' | 'validation_error' | 'unsupported_transport' | 'timeout' | 'aborted' | 'canceled' | 'generation_failed' | 'invalid_response' | 'bad_request' | 'unauthorized' | 'payment_required' | 'forbidden' | 'not_found' | 'rate_limited' | 'server_error' | (string & {});
/** Everything but the message needed to build a {@link ApiError}. */
interface ApiErrorInit {
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
 * The single error type the SDK throws — the generation surface
 * (`generate()`, `generateText()`, `submit()`, `result()`), `ai.catalogs`,
 * and `ai.apis` alike.
 *
 * Unrelated to the `Api*` types (`ApiResponse`, `ApiRunOptions`, …), which
 * describe the low-level `ai.apis` surface — though that surface throws this
 * error too. ApiError is the only error type the SDK exposes.
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
declare class ApiError extends Error {
    /** HTTP status, or the synthesized equivalent for non-HTTP failures. */
    readonly status: number;
    /** Platform `reason`, or an SDK-synthesized code. Always equal to {@link reason}. */
    readonly code: ApiErrorCode;
    /** Alias of {@link code}, named after the platform's own error field. */
    readonly reason: ApiErrorCode;
    constructor(message: string, init: ApiErrorInit);
}

/** Catalog query filters — map 1:1 onto `/v1/models-catalog` query params. */
interface ModelCatalogFilters {
    /** Restrict to one or more generation modes (`video`, `image`, …). */
    mode?: GenerationMode | GenerationMode[];
    /** Restrict to one or more provider ids. */
    provider?: string | string[];
    /** Release tiers to request. Server default: production + general-availability. */
    release?: ReleaseTag | ReleaseTag[];
    /** Include models flagged deprecated. */
    includeDeprecated?: boolean;
    /** Free-text search across id / name / provider. */
    search?: string;
}

/** Worker-reported progress on a generation.progress event. */
type GenerationProgress = WorkflowProgress;
/** A fetch-like function that handles authentication (headers, cookies, etc.). */
type AuthenticatedFetch = (url: string, init?: RequestInit) => Promise<Response>;
/** Drive configuration — enables auto-saving generations to Picsart Drive. */
interface DriveConfig {
    /** Root folder name in Drive. All generations save here. */
    folder: string;
}
/**
 * Whether the embedding app is a native client or a miniapp. Set backend-side
 * during save; surfaced read-only via `getGeneration`.
 */
type AppType = 'native' | 'miniapp';
/**
 * App identity (appId + appType).
 * TODO(backend-autosave): temporary — the backend will stamp appId/appType on
 * save. Until then apps may pass this so it's persisted client-side.
 */
interface AppIdentity {
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
type ClientConfig = HttpClientConfig | TransportClientConfig;

interface GenerateResultItem {
    url: string;
    metadata?: GenerateResultItemMetadata;
}
/** Result of a media generation. */
interface GenerateResult {
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
/**
 * Response of {@link AiClient.run} — the same shape `ai.apis.run()` answers
 * ({ result, status, usage, id }), in the SDK's own vocabulary.
 */
interface RunResponse<R = unknown> {
    /** The task result as-is, validated by the model's `outputSchema` when declared. */
    result: R;
    /** Always `COMPLETED` — failures throw {@link ApiError} instead. */
    status: 'COMPLETED';
    /** Credit usage reported by the platform — same structure as the pluggable APIs' GenAITaskResponse. */
    usage?: CreditUsage;
    /** The generation/job id — absent for syncExecute models (nothing to poll). */
    id?: string;
}
/** Result of a text-generation (LLM) model. */
interface GenerateTextResult {
    /** Generated text. */
    text: string;
    /** Model ID that produced this result. */
    model: string;
    /** Raw parsed output — carries vendor token usage, finish reason, thinking trace, etc. */
    raw: unknown;
    /** Credit usage reported by the platform — same structure as the pluggable APIs' GenAITaskResponse. */
    usage?: CreditUsage;
}

/**
 * Named constants for the {@link GenerationEvent} discriminant — sugar over
 * the string literals for consumers who prefer `GenerationEventType.Completed`
 * to `'generation.completed'`. Both compare fine: the event `type` field stays
 * a literal union, so raw strings keep working (and keep autocompleting).
 */
declare const GenerationEventType: {
    readonly Progress: "generation.progress";
    readonly Completed: "generation.completed";
    readonly Failed: "generation.failed";
};
type GenerationEventType = (typeof GenerationEventType)[keyof typeof GenerationEventType];
/**
 * One `ai.subscribe()` update.
 * - `generation.progress` — a non-terminal poll; `progress` is present when
 *   the worker reports it (percent, ETA).
 * - `generation.completed` — terminal; carries the parsed
 *   {@link GenerateResult} in `result`, no follow-up `ai.result()` needed.
 * - `generation.failed` — terminal (worker FAILED or the job was canceled);
 *   carries the same {@link ApiError} that `ai.result()` would have thrown.
 */
type GenerationEvent = {
    type: 'generation.progress';
    progress?: GenerationProgress;
} | {
    type: 'generation.completed';
    result: GenerateResult;
} | {
    type: 'generation.failed';
    error: ApiError;
};
/** Input-transformation settings injected into the workflow payload as
 *  `options.inputs_transformation` (GenAIOptions, alongside `drive`). */
interface PayloadInputsTransformationOptions {
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
interface GenerationOptions {
    /** Poll interval in ms. Overrides the model's `pollOptions` and the mode default. */
    intervalMs?: number;
    /** Max poll attempts before timing out. Overrides the model's `pollOptions` and the mode default. */
    maxAttempts?: number;
    signal?: AbortSignal;
}
/** Options for individual generate() / submit() calls. */
interface GenerateOptions {
    signal?: AbortSignal;
    /**
     * Poll interval for the async status loop, in ms. Overrides the model's
     * `pollOptions` and the mode default (video 2s; image/audio/text/json 1s).
     */
    intervalMs?: number;
    /**
     * Max poll attempts before the call throws a timeout. Overrides the model's
     * `pollOptions` and the mode default (video 1800 ≈ 1 hour;
     * image/audio/text/json 1200 ≈ 20 min).
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

/** Options for {@link AiClient.initModelCatalog}. The endpoint is always
 *  `${apiUrl}/gw-v2/v1/models-catalog` — derived from the client's `apiUrl`. */
interface InitModelCatalogOptions {
    /** Restrict what the catalog load requests — mode, provider, release, deprecated, search. */
    filtersOptions?: ModelCatalogFilters;
    /**
     * How often, in seconds, to re-pull the catalog in the background after the
     * first load so a long-lived process picks up new/changed models without
     * restarting. The timer arms only after the initial load succeeds and
     * re-fetches with the same `filtersOptions`. A refresh that fails leaves the
     * previously loaded catalog in place (the next tick retries).
     *
     * Default `-1` — no scheduled refresh (any value `<= 0` disables it).
     */
    refreshIntervalSeconds?: number;
}
/**
 * Non-text (image/video/audio) model id. Dynamic-only: ids are plain strings
 * resolved against the loaded catalog, so there is no compile-time narrowing.
 */
type MediaModelId = string;
/** AI SDK client. Model ids are strings resolved against the loaded catalog. */
interface AiClient {
    /**
     * Run any model by id and get the task result back, generically — the
     * model-id counterpart of {@link ApisClient.run}. Works on every model:
     * models-hub builds and validates the payload, executes the workflow,
     * applies the model's `outputSchema` when declared, and answers the task
     * result as-is (no media-URL/text extraction, no Drive save). The only
     * generation surface for json-mode (structured-output) models. Type the
     * result via `R` (mirrors `ai.apis.run()`): `ai.run<MyResult>(id, params)`.
     */
    run<R = unknown>(model: string, params: Record<string, unknown>, options?: GenerateOptions): Promise<RunResponse<R>>;
    /** Generate content using a media model. Text/LLM models use generateText(). */
    generate(model: string, params: Record<string, unknown> & {
        prompt: string;
    }, options?: GenerateOptions): Promise<GenerateResult>;
    /** Generate text using an LLM model. Returns the generated text plus the raw response. */
    generateText(model: string, params: Record<string, unknown> & {
        prompt: string;
    }, options?: GenerateOptions): Promise<GenerateTextResult>;
    /** Get exact credit cost for a model with specific parameters. */
    getCredits(model: string, params: Record<string, unknown> & {
        prompt: string;
    }): Promise<number | null>;
    /** What the model's /options endpoint answers for these params — credits, how they were derived, and anything else it reports. */
    options(model: string, params: Record<string, unknown> & {
        prompt: string;
    }): Promise<OptionsResult | null>;
    /** Submit a generation job and get its generation id back. Media models only. */
    submit(model: string, params: Record<string, unknown> & {
        prompt: string;
    }, options?: GenerateOptions): Promise<string>;
    /** Poll a submitted job until it completes and return the parsed result. Media models only. */
    result(model: string, generationId: string, options?: GenerationOptions): Promise<GenerateResult>;
    /**
     * Subscribe to live updates for a submitted job. Yields one
     * {@link GenerationEvent} per poll; the terminal `generation.completed`
     * event carries the parsed result in `event.result`, and failures/cancels
     * arrive as `generation.failed` events (with the {@link ApiError}), not as
     * exceptions.
     */
    subscribe(model: MediaModelId, generationId: string, options?: GenerationOptions): AsyncGenerator<GenerationEvent, void, void>;
    /**
     * Fetch the model catalog from models-hub and install it as the active
     * catalog — afterwards `Model()`, `catalog.*` and `ai.validate()` serve the
     * loaded data. The ONLY trigger for the load (`createClient` never starts
     * it). Idempotent: concurrent/repeat calls share one in-flight load; a
     * failed load may be retried. Rejects with `ApiError` 409 `catalog_conflict`
     * when a different url/filters catalog is already loaded in this process.
     */
    initModelCatalog(options?: InitModelCatalogOptions): Promise<void>;
    /**
     * Validate params against the model's descriptors without generating.
     * Awaits the catalog load started by {@link initModelCatalog} — rejects with
     * `ApiError` 409 `catalog_not_loaded` when it was never called. Unknown
     * models reject with `ApiError` 400 `unknown_model`.
     */
    validate(model: string, params: Record<string, unknown>): Promise<ValidationResult>;
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

/** Platform options carried on a {@link ModelsCommand} (ModelsGenAIOptions on the backend). */
interface ModelsGenAIOptions {
    safety_checks?: {
        enabled?: boolean;
    };
    drive?: PayloadDriveOptions;
    inputs_transformation?: {
        downscale_oversized_images?: boolean;
    };
}
/** The `v1/models` request body: which model, the SDK-shaped params, platform options. */
interface ModelsCommand {
    model: string;
    params: Record<string, unknown>;
    options?: ModelsGenAIOptions;
}

/**
 * Create an AI SDK client.
 *
 * The SDK is dynamic-only: the model catalog is loaded from models-hub via
 * {@link AiClient.initModelCatalog}, and every generation rides the one
 * `v1/models` workflow (the server resolves the model, builds the vendor
 * payload, and normalizes the result).
 *
 * @example Simple — pass an authenticated fetch:
 * ```ts
 * const ai = createClient({ fetch: myAuthenticatedFetch, apiUrl });
 * await ai.initModelCatalog();
 * ```
 *
 * @example With your own transport — the SDK stops talking to the workflows
 * API entirely, so `apiUrl` and the auth source are the transport's business:
 * ```ts
 * const ai = createClient({ transport: myTransport });
 * ```
 */
declare function createClient(config: ClientConfig): AiClient;

/**
 * Default voice ids for the catalog-bound TTS params. The voice LISTS are not
 * bundled: options come from the platform catalog tasks at runtime
 * (`ai.catalogs.voices`) — the workers cache them and answer fast.
 */

declare function getVoiceById(id: string): VoiceOption | undefined;

/** Nested provider block — flattened onto `ModelDefinition.provider*`. */
interface CatalogProvider {
    id: string;
    name: string;
    color: string;
    label: string;
}
/**
 * A param as served on the wire: the SDK's flat entry form (descriptor
 * fields merged with `label` / `required` / `category`), keyed by param
 * name instead of carrying `key`.
 */
type CatalogParam = {
    label?: string;
    required?: boolean;
    category?: 'asset' | 'reference';
} & ParamDescriptor;
interface CatalogModel {
    id: string;
    name: string;
    description?: string;
    mode: GenerationMode;
    inputType: InputType;
    provider: CatalogProvider;
    badges?: BadgeType[];
    features?: ModelFeature[];
    release?: ReleaseTag;
    addedAt?: string;
    estimatedTime?: number | Record<string, number>;
    deprecated?: boolean;
    /** `include=schema` */
    params?: Record<string, CatalogParam>;
    /** `include=constraints` */
    constraints?: Constraint[];
    /** `include=routing` */
    workflow?: string;
    editWorkflow?: string;
    modelId?: string;
    syncExecute?: boolean;
}
interface CatalogModelsResponse {
    status: 'success';
    response: {
        total: number;
        models: CatalogModel[];
    };
}

/**
 * Pricing internals — owns the ModelPricingClient, the per-model cache, and
 * the credit-range lookup. The Model accessor delegates to the helpers below
 * so that model-accessor.ts stays focused on descriptor logic.
 *
 * Configure once via `configurePricing(client)` from the app layer (the app
 * builds the client with its authenticated fetch and base URL), then call
 * `loadPricing()` to populate the cache. After that, `getCreditsForModel(id, ctx)`
 * resolves synchronously.
 */

/** Options for configuring the pricing source. The SDK constructs the underlying client. */
type PricingOptions = ModelPricingClientOptions;
/** Configure the pricing source. Resets any prior cache so the next loadPricing() re-runs. */
declare function configurePricing(options: PricingOptions): void;
/**
 * Load pricing into an in-memory map keyed by `metadata.modelId`.
 * Idempotent on success; rejected loads clear `_loadPromise` so the next call retries.
 * Returns a rejected promise (not a sync throw) when the client is not configured.
 */
declare function loadPricing(): Promise<void>;
declare function isPricingLoaded(): boolean;

/**
 * Model accessor — single entry point for all model info.
 *
 * Usage:
 *   import { model } from '@picsart/ai-sdk';
 *   const m = model('flux-2-pro');
 *   m.id                                  // 'flux-2-pro'
 *   m.name                                // 'Flux 2 Pro'
 *   m.params().hasParam('aspectRatio')     // true
 *   m.params().getDefaults()              // { aspectRatio: '4:3', ... }
 *   m.meta().mode                          // 'image'
 *   m.meta().provider.name                 // 'Flux'
 */

/** Look up a single model descriptor by id. */
type ModelFunction = (id: string) => ModelDescriptor;
declare function _all(filter?: {
    release?: readonly ReleaseTag[];
}): ModelDescriptor[];
declare function _find(filter: ModelFilter): ModelDescriptor[];
declare function _search(query: string, filter?: {
    release?: readonly ReleaseTag[];
}): ModelDescriptor[];
/** Look up a single model descriptor: `Model('flux-2-pro').params()`. */
declare const Model: ModelFunction;
/**
 * Model catalog + subsystem ops:
 *   catalog.all() / .find() / .search()
 *   catalog.pricing.configure(...) / .load() / .isLoaded()
 */
declare const catalog: {
    all: typeof _all;
    find: typeof _find;
    search: typeof _search;
    pricing: {
        configure: typeof configurePricing;
        load: typeof loadPricing;
        isLoaded: typeof isPricingLoaded;
    };
};

/** Result of decoding a deep link. */
interface DeepLinkResult {
    /** Model ID from the payload. */
    modelId: string;
    /** Partial GenerationContext reconstructed from the payload. */
    context: Partial<GenerationContext>;
    /** Whether the model ID exists in the current catalog. */
    modelKnown: boolean;
    /** Non-fatal warnings (e.g. rejected URLs, unknown model). */
    warnings: string[];
}

/**
 * Encode a model ID + context into a compressed, base64url-encoded payload string.
 * Consumers attach this to their own URL (e.g. `?aistate=${payload}`).
 */
declare function encodeDeepLinkPayload(modelId: string, context: Partial<GenerationContext>): string;
/**
 * Decode a compressed payload string back into a DeepLinkResult.
 * Returns null if decoding or validation fails.
 */
declare function decodeDeepLinkPayload(encoded: string): DeepLinkResult | null;

/**
 * Release tags shown by default in discovery. `preview` is stage-only and
 * opt-in (pass `release: ['preview', ...]`) — it is never in the default set.
 */
declare const DEFAULT_VISIBLE_RELEASES: readonly ReleaseTag[];
/** Effective release tag of a model — absent ⇒ `'production'`. */
declare const releaseOf: (m: ModelDefinition) => ReleaseTag;
/**
 * Whether `m` is visible for the requested `releases` (default: the production
 * + general-availability set).
 *
 * `deprecated` is a hard hide layered on top of `release`: a deprecated model
 * is never visible, regardless of its release tag or the requested set.
 */
declare function isVisibleForReleases(m: ModelDefinition, releases?: readonly ReleaseTag[]): boolean;

/**
 * Look up a model by its ID or vendor modelId.
 * @deprecated Use the `Model(id)` accessor (or `catalog.find(id)`) — this
 * raw-definition lookup will be removed in the next major.
 */
declare const getModel: (id: string) => ModelDefinition | undefined;
/**
 * Find a model by ID, workflow name, or display name (case-insensitive).
 * @deprecated Use `catalog.find(ref)` / `catalog.search(query)` — this
 * raw-definition lookup will be removed in the next major.
 */
declare const findModel: (ref: string) => ModelDefinition | undefined;

export { type AiClient, ApiError, type ApiErrorCode, type ApiErrorInit, type ApiResponse, type ApiRunOptions, type ApiSchemas, type ApisClient, type AppIdentity, type AppType, type AuthenticatedFetch, type AvatarOption, type BooleanDescriptor, type BooleanEntry, type CatalogDescriptor, type CatalogEntry, type CatalogItem, type CatalogModel, type CatalogModelsResponse, type CatalogPage, type CatalogPageOptions, type CatalogParam, type CatalogPreview, type CatalogProvider, type CatalogQuery, type CatalogResult, type CatalogSource, type CatalogsClient, type CatalogsOptions, type ClientConfig, type CreditRange, type CreditRangeContext, type CreditTier, type CreditUsage, DEFAULT_VISIBLE_RELEASES, type DeepLinkResult, type DriveAttributes, type DriveClient, type DriveConfig, type DriveDraftInfo, type DriveFile, type DriveFileDetails, type DriveFolder, type DriveMediaItem, type DriveSaveResult, type EntryMeta, type EnumDescriptor, type EnumEntry, type EnumOption, type FileDescriptor, type FileEntry, type FlatParamEntry, type GenerateOptions, type GenerateResult, type GenerateResultItem, type GenerateResultItemMetadata, type GenerateTextResult, type GenerationContext, type GenerationEvent, GenerationEventType, type GenerationFile, type GenerationMode, type GenerationOptions, type GenerationProgress, type GenerationProvenance, type InitModelCatalogOptions, type ListOptions, type MediaModelId, type MediaTypeFilter, Model, type ModelCatalogFilters, type ModelDefinition, type ModelDescriptor, type ModelFilter, type ModelMeta, type ModelParams, type ModelParamsAccessor, type ModelsCommand, type ModelsGenAIOptions, type ObjectDescriptor, type ObjectEntry, type OptionsResult, type ParamDescriptor, type ParamEntry, type ParamOption, type PayloadDriveFolderOptions, type PayloadDriveOptions, type PayloadInputsTransformationOptions, type PricingOptions, type ProviderInfo, type RangeDescriptor, type RangeEntry, type ReleaseTag, type RunResponse, type SaveParams, type SdkPayload, type SdkTransport, type SeedanceDraftTask, type TextDescriptor, type TextEntry, type ToolUsage, type TransportPollOptions, type TransportResult, type UnknownDescriptor, type UnknownEntry, type UserReaction, type ValidationResult, type VoiceOption, type WorkflowJobHandle, type WorkflowSubmitRequest, buildFilename, buildGenerationAttributes, catalog, createClient, decodeDeepLinkPayload, encodeDeepLinkPayload, expectedOutputFormat, findModel, getModel, getVoiceById, inferResourceType, isVisibleForReleases, parseGeneration, releaseOf, resolveExtension, toAvatarOption, toVoiceOption };

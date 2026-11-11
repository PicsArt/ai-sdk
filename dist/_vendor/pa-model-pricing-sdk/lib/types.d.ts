export declare enum UseCase {
    TextToImage = "text-to-image",
    ImageToImage = "image-to-image",
    TextToVideo = "text-to-video",
    ImageToVideo = "image-to-video",
    VideoToVideo = "video-to-video",
    VideoToImage = "video-to-image",
    TextToSpeech = "text-to-speech",
    TextToAudio = "text-to-audio",
    SpeechToText = "speech-to-text",
    ImageToAudio = "image-to-audio",
    AudioToAudio = "audio-to-audio",
    SpeechToSpeech = "speech-to-speech",
    ChatCompletions = "chat-completions",
    AudioToVideo = "audio-to-video",
    VideoToAudio = "video-to-audio",
    /** Priced per request, not per media transformation (e.g. Magic Flow webhook runs). */
    Request = "request"
}
/** Where a pricing is used: the API platform, the apps (UI), or both. */
export declare enum PricingScope {
    Api = "api",
    Apps = "apps"
}
export declare enum PricingUnit {
    Generation = "generation",
    Megapixel = "megapixel",
    Second = "second",
    ThirtySecond = "30_second",
    Minute = "minute",
    ThousandCharacters = "1k_characters",
    InputTokens = "input_tokens",
    InputTextTokens = "input_text_tokens",
    InputCachedTokens = "input_cached_tokens",
    CacheWrite5mTokens = "cache_write_5m_tokens",
    CacheWrite1hTokens = "cache_write_1h_tokens",
    InputImageTokens = "input_image_tokens",
    OutputTokens = "output_tokens",
    OutputImageTokens = "output_image_tokens",
    OutputAudioTokens = "output_audio_tokens",
    OutputTextTokens = "output_text_tokens",
    InputMegapixel = "input_megapixel",
    OutputMegapixel = "output_megapixel",
    OutputMegapixelAdditional = "output_megapixel_additional",
    ThousandOutputVideoTokens = "1k_output_video_tokens"
}
export interface ModelPricingFilters {
    vendor?: string;
    modelId?: string;
    operationId?: string;
    useCase?: UseCase;
    quality?: string;
    audio?: boolean;
    /** Only the pricings used in this scope, among those the client loaded. */
    scope?: PricingScope;
    countryCode?: string;
    /**
     * Touchpoint the price is requested from. Scopes credit overrides and,
     * together with `appId`, touchpoint-scoped user discounts (`applicableIn`).
     */
    touchpoint?: string;
    platform?: string;
    packageId?: string;
    userId?: string;
    /**
     * App id (not the bundle id) the price is requested from. App-bound user
     * discount entries (`applicableIn[].appId`) apply only with it; entries
     * without an appId apply in every app.
     */
    appId?: string;
    /**
     * Requested duration in seconds (tools priced per second, e.g. video). A
     * duration-capped user discount (`conditions.maxDurationSeconds`) applies
     * only when it is sent and within the cap.
     */
    duration?: number;
    /**
     * When true, each pricing's `credits` is replaced by its `usdPrice`
     * (items without a `usdPrice` keep their credits). Credit overrides and
     * user discounts are not applied in this mode.
     */
    useUsdPrice?: boolean;
}
export interface ModelPricingMetadata {
    vendor: string;
    model: string;
    modelId: string;
    useCase: UseCase;
    quality: string;
    audio: boolean;
}
export interface SkuEntry {
    id: string;
}
export interface VendorCostEntry {
    cost: number;
    unit: PricingUnit;
    skus: SkuEntry[];
}
export interface CreditOverride {
    countries: string[];
    touchpoints: string[];
    /** Optional: older overrides created before platform targeting have no platforms. */
    platforms?: string[];
    /** Optional: older overrides created before package targeting have no packageIds. */
    packageIds?: string[];
    credits: number;
    startDate: string;
    endDate: string;
}
export interface MinTier {
    name: string;
    accessLevel: number;
}
export interface ModelPricing {
    id: string;
    operationId: string;
    metadata: ModelPricingMetadata;
    vendorCosts: VendorCostEntry[];
    unit: PricingUnit;
    /** Credits the user pays — already discounted when a user discount applies. */
    credits: number;
    /**
     * The original (pre-discount) credits, present only when a discount was
     * applied. On the frontend the service fills both fields (userId travels via
     * the access token in headers); on the backend the SDK fills them when
     * getModelPricing is called with a userId.
     */
    originalCredits?: number;
    /**
     * Throttling and concurrency limits of the applied user discount, for the
     * caller (the service running the generations) to enforce. Present only
     * when a discount that has limits was applied, i.e. on the backend when
     * getModelPricing is called with a userId.
     */
    limits?: DiscountLimits;
    costPerUnit: number;
    /** Price in USD, when one is set. */
    usdPrice?: number;
    legacy: boolean;
    /** Where the pricing is used: the API platform, the apps, or both. Never empty. */
    scopes: PricingScope[];
    /** Minimum subscription tier required to use this model, when one is set. */
    minTier?: MinTier;
    /** Permission the user's subscription tier must grant to use this model, when one is set. */
    requiredPermission?: string;
    creditOverrides: CreditOverride[];
    created: string;
    updated: string;
}
export interface ModelPricingListResponse {
    status: string;
    response: ModelPricing[];
}
/**
 * Where a discount applies: an app (missing = any app), optionally narrowed to some touchpoints (none = all of
 * them) and/or some wallets (none = all of them).
 */
export interface ApplicableIn {
    /** App id (not the bundle id) the discount applies in; missing = any app. */
    appId?: string;
    /** Touchpoints the discount applies on; empty = all of them. */
    touchpoints: string[];
    /**
     * Wallets the discount applies to; empty or missing = all of them. Not matched when pricing (a price request
     * names no wallet): the service charging the generation applies them.
     */
    wallets?: string[];
}
/** When a request is eligible for the discount; a missing cap applies to every request. */
export interface DiscountConditions {
    /** The discount applies only to generations of at most this many seconds (tools priced per second, e.g. video). */
    maxDurationSeconds?: number;
}
/**
 * Slows down discounted generations: once a rolling window of `windowSeconds`
 * holds `n >= after` generations, the next one waits
 * `min(maxDelaySeconds, delaySeconds * growthFactor ^ (n - after))` seconds.
 * The pricing service only stores this; the service running the generations
 * counts them and enforces it.
 */
export interface DiscountThrottle {
    /** Generations at full speed before throttling starts (0 = from the first one). */
    after: number;
    /** Rolling window (seconds) the generations are counted in; missing = the lifetime of the discount. */
    windowSeconds?: number;
    /** Wait (seconds) before the generation after the `after`-th one. */
    delaySeconds: number;
    /** Each further generation waits this many times longer than the previous one; missing or 1 = flat. */
    growthFactor?: number;
    /** Cap of the wait (seconds); always set when `growthFactor` is above 1, never below `delaySeconds`. */
    maxDelaySeconds?: number;
}
/** How much discounted usage to allow; enforced by the service running the generations, not by pricing. */
export interface DiscountLimits {
    /** Discounted generations of the user running at once. */
    maxConcurrent?: number;
    throttle?: DiscountThrottle;
}
export interface UserDiscount {
    id: string;
    userId: string;
    /** The discounted tool: the `operationId` of a model pricing. */
    toolId: string;
    /** Id of the campaign this discount originates from, when it comes from one. */
    campaignId?: string;
    expirationDate: string;
    discountPercent: number;
    /** Where the discount applies; missing or empty = everywhere. */
    applicableIn?: ApplicableIn[];
    /** When a request is eligible for the discount; missing = every request. */
    conditions?: DiscountConditions;
    /** How much discounted usage to allow; missing = no limit. */
    limits?: DiscountLimits;
    created: string;
    updated: string;
}
export interface UserDiscountListResponse {
    status: string;
    response: UserDiscount[];
}
export interface ModelPricingClientOptions {
    /** Base URL of the model pricing service. */
    baseUrl: string;
    /**
     * Custom fetch implementation.
     * When provided, the client delegates all HTTP calls to this function.
     */
    fetch?: typeof fetch;
    /**
     * Extra headers to include in every request.
     */
    headers?: Record<string, string>;
    /**
     * Interval in milliseconds at which the in-memory cache is refreshed by the
     * background scheduler. The cache itself never expires; it is only replaced
     * by a successful refresh. Set 0 to disable the scheduler.
     * @default 600_000 (10 minutes)
     */
    refreshIntervalMs?: number;
    /**
     * HTTP request timeout in milliseconds.
     * @default 5_000
     */
    timeoutMs?: number;
    /**
     * Loads only the pricings used in this scope. Takes precedence over
     * `includePostCharging`. Without either, only the pricings used in the
     * apps are loaded.
     */
    scope?: PricingScope;
    /**
     * When true, and no `scope` is set, loads every pricing whatever its
     * scope — what a service that charges needs, as it resolves any tool.
     * The name dates from when API-only pricings were marked `postCharging`.
     * @default false
     */
    includePostCharging?: boolean;
}

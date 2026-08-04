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
    VideoToAudio = "video-to-audio"
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
    countryCode?: string;
    touchpoint?: string;
    platform?: string;
    packageId?: string;
    userId?: string;
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
    costPerUnit: number;
    legacy: boolean;
    /** Minimum subscription tier required to use this model, when one is set. */
    minTier?: MinTier;
    creditOverrides: CreditOverride[];
    created: string;
    updated: string;
}
export interface ModelPricingListResponse {
    status: string;
    response: ModelPricing[];
}
export interface UserDiscount {
    id: string;
    userId: string;
    modelId: string;
    expirationDate: string;
    discountPercent: number;
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
}

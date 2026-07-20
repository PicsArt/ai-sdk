export declare enum UseCase {
    TextToImage = "text-to-image",
    ImageToImage = "image-to-image",
    TextToVideo = "text-to-video",
    ImageToVideo = "image-to-video",
    VideoToVideo = "video-to-video",
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
    OutputImageTokens = "output_image_tokens",
    OutputAudioTokens = "output_audio_tokens",
    OutputTextTokens = "output_text_tokens"
}
export interface ModelPricingFilters {
    vendor?: string;
    modelId?: string;
    useCase?: UseCase;
    quality?: string;
    audio?: boolean;
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
export interface ModelPricing {
    id: string;
    operationId: string;
    metadata: ModelPricingMetadata;
    vendorCosts: VendorCostEntry[];
    unit: PricingUnit;
    credits: number;
    costPerUnit: number;
    legacy: boolean;
    created: string;
    updated: string;
}
export interface ModelPricingListResponse {
    status: string;
    response: ModelPricing[];
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

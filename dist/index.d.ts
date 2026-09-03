import { WorkflowTypes, ExecutionOptions, WorkflowResponse } from './_vendor/workflows-client/index';
export { ExecutionMode as ApiRunMode } from './_vendor/workflows-client/index';
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
type WorkflowStatus = 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELED' | 'UNKNOWN';
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
interface WorkflowStatusResult<TResult = unknown> {
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
interface SdkTransport<TPayload = Record<string, unknown>> {
    execute(request: WorkflowSubmitRequest<TPayload>): Promise<unknown>;
    submit?(request: WorkflowSubmitRequest<TPayload>): Promise<WorkflowJobHandle>;
    status?(handle: WorkflowJobHandle, signal?: AbortSignal): Promise<unknown>;
    options?(workflow: string, payload: Record<string, unknown>): Promise<number | null>;
}
interface WorkflowPollOptions {
    intervalMs?: number;
    maxAttempts?: number;
    signal?: AbortSignal;
}
interface WorkflowRunOptions extends WorkflowPollOptions {
    mode?: 'async' | 'sync';
}
type WorkflowSubscribeOptions = WorkflowPollOptions;

/**
 * Per-model compile-time input contracts generated from specs/vendors catalog.
 * Regenerate with: npm run build:model-input-types
 */
type ModelInputById = {
    "async-flash-v1": {
        prompt: string;
        voiceId?: string;
        container?: "mp3" | "wav" | "raw";
        sampleRate?: number;
        encoding?: "pcm_s16le" | "pcm_f32le";
        bitRate?: number;
    };
    "bytedance-omnihuman-v1.5": {
        prompt?: string;
        imageUrls: [string, ...string[]];
        audioUrl: string;
        resolution?: "720p" | "1080p";
        turboMode?: boolean;
        seed?: number;
    };
    "bytedance-video-enhance": {
        videoUrl: string;
        quality?: "standard" | "professional";
        resolution?: "source" | "720p" | "1080p" | "2k" | "4k" | "8k";
        fps?: 30 | 60 | 120;
        scene?: "common" | "ugc" | "short_series" | "aigc" | "old_film";
        bitrateLevel?: "low" | "medium" | "high";
    };
    "bytedance-video-upscaler": {
        videoUrl: string;
    };
    "captionsai-video-captions": {
        videoUrl: string;
        templateId?: string;
    };
    "claude-haiku-4-5": {
        prompt: string;
        imageUrls?: string[];
    };
    "claude-opus-4-8": {
        prompt: string;
        imageUrls?: string[];
    };
    "claude-sonnet-4-6": {
        prompt: string;
        imageUrls?: string[];
    };
    "creatify-aurora": {
        prompt?: string;
        imageUrls: [string, ...string[]];
        audioUrl: string;
    };
    "eleven-audio-isolation": {
        audioUrl: string;
    };
    "eleven-dubbing": {
        audioUrl: string;
        language: string;
    };
    "eleven-multilingual-sts-v2": {
        audioUrl: string;
        voiceId?: string;
        removeBackgroundNoise?: boolean;
    };
    "eleven-multilingual-v2": {
        prompt: string;
        voiceId?: string;
    };
    "eleven-sts-v2": {
        audioUrl: string;
        voiceId?: string;
        removeBackgroundNoise?: boolean;
    };
    "eleven-v3": {
        language?: string;
        prompt: string;
        voiceId?: string;
    };
    "eleven-voice-create": {
        prompt: string;
    };
    "eleven-voice-design-v2": {
        prompt: string;
    };
    "eleven-voice-design-v3": {
        prompt: string;
    };
    "eleven-voice-remix": {
        voiceId: string;
        prompt: string;
    };
    "elevenlabs-music-v2": {
        prompt: string;
        duration?: 10 | 20 | 30 | 60 | 120 | 180 | 300 | 600;
        isInstrumental?: boolean;
    };
    "elevenlabs-sfx": {
        prompt: string;
        duration?: number;
    };
    "flux-2-flex": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "9:21";
        resolution?: "1K" | "2K" | "4K";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "flux-2-max": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "9:21";
        resolution?: "1K" | "2K" | "4K";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "flux-2-pro": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "9:21";
        resolution?: "1K" | "2K" | "4K";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "flux-3-video": {
        prompt: string;
        aspectRatio?: "auto" | "21:9" | "2:1" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
        resolution?: "hd" | "fhd";
        duration?: "auto" | "5" | "10" | "15" | "20";
        imageUrls?: string[];
        videoUrl?: string;
        generateAudio?: boolean;
        safetyTolerance?: number;
        draft?: boolean;
    };
    "flux-kontext-max": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "9:21";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "flux-kontext-pro": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "9:21";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "flux-video-upscale": {
        videoUrl: string;
        upscaleFactor?: number;
        creativity?: 0 | 1;
        prompt?: string;
        safetyTolerance?: number;
    };
    "gemini-2.5-flash-image": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "3:4" | "4:3" | "2:3" | "21:9";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "gemini-2.5-flash-tts": {
        language?: string;
        accent?: string;
        prompt: string;
        voiceId?: string;
    };
    "gemini-2.5-pro-tts": {
        language?: string;
        accent?: string;
        prompt: string;
        voiceId?: string;
    };
    "gemini-3-pro": {
        prompt: string;
        imageUrls?: string[];
        videoUrl?: string;
        thinking?: "off" | "low" | "high";
    };
    "gemini-3-pro-image": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "3:4" | "4:3" | "2:3" | "21:9";
        resolution?: "1K" | "2K" | "4K";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        thinkingBudget?: number;
        imageUrls?: string[];
    };
    "gemini-3.1-flash-image": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "3:4" | "4:3" | "3:2" | "2:3" | "4:5" | "5:4" | "4:1" | "1:4" | "8:1" | "1:8" | "21:9";
        resolution?: "0.5K" | "1K" | "2K" | "4K";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        thinkingLevel?: "minimal" | "high";
        imageUrls?: string[];
    };
    "gemini-3.1-flash-lite-image": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "3:4" | "4:3" | "3:2" | "2:3" | "4:5" | "5:4" | "4:1" | "1:4" | "8:1" | "1:8" | "21:9";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        thinkingLevel?: "minimal" | "high";
        imageUrls?: string[];
    };
    "gemini-3.5-flash-lite": {
        prompt: string;
        imageUrls?: string[];
    };
    "gemini-3.6-flash": {
        prompt: string;
        imageUrls?: string[];
        thinking?: "off" | "low" | "medium" | "high";
    };
    "gemini-3.7-flash": {
        prompt: string;
        imageUrls?: string[];
        thinking?: "off" | "low" | "medium" | "high";
    };
    "gemini-omni-1.1-flash-preview": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16";
        resolution?: "360p" | "720p" | "1080p" | "4k";
        duration?: 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
        startFrame?: string;
        endFrame?: string;
        imageUrls?: string[];
        videoUrl?: string;
        videoUrls?: string[];
    };
    "gemini-omni-flash-preview": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16";
        duration?: 3 | 5 | 6 | 8 | 10;
        imageUrls?: string[];
        videoUrl?: string;
    };
    "gpt-5.5": {
        prompt: string;
        imageUrls?: string[];
        thinking?: "off" | "low" | "medium" | "high";
    };
    "gpt-image-1": {
        prompt: string;
        aspectRatio?: "1:1" | "3:2" | "2:3" | "16:9" | "9:16" | "4:3" | "3:4";
        quality?: "high" | "medium" | "low";
        background?: "opaque" | "transparent";
        outputFormat?: "png" | "jpeg" | "webp";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "gpt-image-1.5": {
        prompt: string;
        aspectRatio?: "1:1" | "3:2" | "2:3" | "16:9" | "9:16" | "4:3" | "3:4";
        quality?: "high" | "medium" | "low";
        background?: "opaque" | "transparent";
        outputFormat?: "png" | "jpeg" | "webp";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "gpt-image-2": {
        prompt: string;
        aspectRatio?: "1:1" | "3:2" | "2:3" | "16:9" | "9:16" | "4:3" | "3:4" | "auto";
        quality?: "high" | "medium" | "low";
        outputFormat?: "png" | "jpeg" | "webp";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "grok-edit-video": {
        prompt: string;
        videoUrl: string;
    };
    "grok-extend-video": {
        prompt: string;
        duration?: 3 | 5 | 6 | 8 | 10;
        videoUrl: string;
    };
    "grok-imagine-image": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3" | "2:1" | "1:2" | "19.5:9" | "9:19.5" | "20:9" | "9:20";
        resolution?: "1k" | "2k";
        count?: 1 | 2 | 4;
        imageUrls?: string[];
    };
    "grok-imagine-image-2.0": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3" | "2:1" | "1:2" | "19.5:9" | "9:19.5" | "20:9" | "9:20";
        resolution?: "1k" | "2k";
        quality?: "low" | "medium";
        count?: 1 | 2 | 4;
        imageUrls?: string[];
    };
    "grok-imagine-image-quality": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3" | "2:1" | "1:2" | "19.5:9" | "9:19.5" | "20:9" | "9:20";
        resolution?: "1k" | "2k";
        count?: 1 | 2 | 4;
        imageUrls?: string[];
    };
    "grok-imagine-video": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "3:2" | "2:3";
        resolution?: "480p" | "720p";
        duration?: 3 | 5 | 6 | 8 | 10 | 12 | 15;
        imageUrls?: string[];
    };
    "grok-imagine-video-1.5": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "3:2" | "2:3";
        resolution?: "480p" | "720p" | "1080p";
        duration?: 3 | 5 | 6 | 8 | 10 | 12 | 15;
        imageUrls?: string[];
    };
    "grok-tts": {
        language?: string;
        accent?: string;
        prompt: string;
        voiceId?: string;
    };
    "hailuo-2.3": {
        prompt: string;
        enhancePrompt?: boolean;
        duration?: 6 | 10;
        imageUrls?: string[];
    };
    "hailuo-2.3-fast": {
        prompt: string;
        enhancePrompt?: boolean;
        duration?: 6 | 10;
        imageUrls: [string, ...string[]];
    };
    "hailuo-2.3-fast-pro": {
        prompt: string;
        enhancePrompt?: boolean;
        imageUrls: [string, ...string[]];
    };
    "hailuo-2.3-pro": {
        prompt: string;
        enhancePrompt?: boolean;
        imageUrls?: string[];
    };
    "happyhorse-1.0-r2v": {
        prompt: string;
        seed?: number;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        resolution?: "720P" | "1080P";
        duration?: number;
        imageUrls: [string, ...string[]];
    };
    "happyhorse-1.0-t2v": {
        prompt: string;
        seed?: number;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        resolution?: "720P" | "1080P";
        duration?: number;
        startFrame?: string;
    };
    "happyhorse-1.0-video-edit": {
        prompt: string;
        seed?: number;
        resolution?: "720P" | "1080P";
        audioSetting?: "auto" | "origin";
        videoUrl: string;
        imageUrls?: string[];
    };
    "happyhorse-1.1-r2v": {
        prompt: string;
        seed?: number;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        resolution?: "720P" | "1080P";
        duration?: number;
        imageUrls: [string, ...string[]];
    };
    "happyhorse-1.1-t2v": {
        prompt: string;
        seed?: number;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        resolution?: "720P" | "1080P";
        duration?: number;
        startFrame?: string;
    };
    "heygen-talking-photo": {
        imageUrls: [string, ...string[]];
        resolution?: "4k" | "1080p" | "720p";
        aspectRatio?: "16:9" | "9:16";
        voiceId: string;
        prompt: string;
    };
    "heygen-video-avatar": {
        videoId: string;
        resolution?: "4k" | "1080p" | "720p";
        aspectRatio?: "16:9" | "9:16";
        voiceId: string;
        prompt: string;
    };
    "hunyuan-v3": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
        count?: 1 | 2 | 4;
        negativePrompt?: string;
        cfgScale?: number;
    };
    "ideogram-character": {
        prompt: string;
        resolution?: "1024x1024" | "1344x768" | "768x1344" | "1152x864" | "864x1152" | "832x1248" | "1280x800";
        renderingSpeed?: "TURBO" | "DEFAULT" | "QUALITY";
        style?: "AUTO" | "REALISTIC" | "FICTION";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls: [string, ...string[]];
    };
    "ideogram-p-image": {
        prompt: string;
        resolution?: "2048x2048" | "1440x2880" | "2880x1440" | "1664x2496" | "2496x1664" | "1792x2240" | "2240x1792" | "1440x2560" | "2560x1440" | "1600x2560" | "2560x1600" | "1728x2304" | "2304x1728" | "1296x3168" | "3168x1296" | "1152x2944" | "2944x1152" | "1248x3328" | "3328x1248" | "1280x3072" | "3072x1280" | "1024x3072" | "3072x1024" | "1024x1024" | "896x1120" | "1120x896" | "864x1152" | "1152x864" | "832x1248" | "1248x832" | "800x1280" | "1280x800" | "720x1280" | "1280x720" | "720x1440" | "1440x720";
        renderingSpeed?: "very-low" | "low" | "medium" | "high";
    };
    "ideogram-v3": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "3:4" | "4:3";
        renderingSpeed?: "FLASH" | "TURBO" | "DEFAULT" | "QUALITY";
        style?: "GENERAL" | "REALISTIC" | "DESIGN";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        negativePrompt?: string;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "ideogram-v4": {
        prompt: string;
        resolution?: "2048x2048" | "1440x2880" | "2880x1440" | "1664x2496" | "2496x1664" | "1792x2240" | "2240x1792" | "1440x2560" | "2560x1440" | "1600x2560" | "2560x1600" | "1728x2304" | "2304x1728" | "1296x3168" | "3168x1296" | "1152x2944" | "2944x1152" | "1248x3328" | "3328x1248" | "1280x3072" | "3072x1280";
        renderingSpeed?: "TURBO" | "DEFAULT" | "QUALITY";
        enableCopyrightDetection?: boolean;
    };
    "kling-3.0-image": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
        resolution?: "1k" | "2k" | "4k";
        count?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
        imageUrls?: string[];
    };
    "kling-avatar": {
        prompt?: string;
        renderingSpeed?: "std" | "pro";
        imageUrls: [string, ...string[]];
        audioUrl: string;
        audioId?: string;
    };
    "kling-elements": {
        elementName: string;
        elementDescription: string;
        referenceType: "image_refer" | "video_refer";
        imageUrls?: string[];
        videoUrl?: string;
        elementVoiceId?: string;
    };
    "kling-motion-control": {
        prompt?: string;
        renderingSpeed?: "std" | "pro";
        characterOrientation?: "image" | "video";
        keepOriginalSound?: "yes" | "no";
        imageUrls: [string, ...string[]];
        videoUrl: string;
    };
    "kling-motion-control-v3": {
        prompt?: string;
        renderingSpeed?: "std" | "pro";
        characterOrientation?: "image" | "video";
        keepOriginalSound?: "yes" | "no";
        imageUrls: [string, ...string[]];
        videoUrl: string;
    };
    "kling-multi-image-v2-1": {
        prompt?: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
        count?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
        imageUrls: [string, ...string[]];
        sceneImage?: string;
        styleImage?: string;
    };
    "kling-o1-image": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
        resolution?: "1k" | "2k";
        count?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
        imageUrls?: string[];
    };
    "kling-t2a": {
        prompt: string;
        duration?: number;
    };
    "kling-v2-1-image": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
        count?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
        negativePrompt?: string;
        imageUrls?: string[];
    };
    "kling-v2-6": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1";
        duration?: 5 | 10;
        startFrame?: string;
        endFrame?: string;
        negativePrompt?: string;
        generateAudio?: boolean;
    };
    "kling-v2a": {
        videoUrl: string;
    };
    "kling-v3": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1";
        duration?: 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        startFrame?: string;
        endFrame?: string;
        negativePrompt?: string;
        generateAudio?: boolean;
        multiShot?: boolean;
        shotType?: "customize" | "intelligence";
        multiPrompt?: Array<{
            index: number;
            prompt: string;
            duration: string;
        }>;
        voiceList?: Array<{
            voice_id: string;
        }>;
        elementList?: Array<{
            element_id: string;
        }>;
        renderingSpeed?: "std" | "pro" | "4k";
    };
    "kling-v3-omni": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1";
        duration?: 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        resolution?: "720p" | "1080p" | "4k";
        generateAudio?: boolean;
        startFrame?: string;
        endFrame?: string;
        imageUrls?: string[];
        videoUrl?: string;
        referType?: "feature" | "base";
        keepOriginalSound?: "yes" | "no";
        multiShot?: boolean;
        shotType?: "customize";
        multiPrompt?: Array<{
            index: number;
            prompt: string;
            duration: string;
        }>;
        elementList?: Array<{
            element_id: string;
        }>;
    };
    "kling-v3-turbo": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1";
        duration?: 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        negativePrompt?: string;
        resolution?: "720p" | "1080p";
        startFrame?: string;
    };
    "kling-video-effects": {
        templateId?: string;
        imageUrls: [string, ...string[]];
    };
    "kling-video-o1": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1";
        duration?: 5 | 10;
        renderingSpeed?: "std" | "pro";
        generateAudio?: boolean;
    };
    "ltx-2.3-a2v": {
        prompt?: string;
        audioUrl: string;
        imageUrls?: string[];
        cfgScale?: number;
    };
    "ltx-pro-t2v": {
        prompt: string;
        duration?: 6 | 8 | 10;
        resolution?: "1080p" | "1440p" | "2160p";
        generateAudio?: boolean;
        imageUrls?: string[];
    };
    "ltx-v2-fast": {
        prompt: string;
        duration?: 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20;
        resolution?: "1080p" | "1440p" | "2160p";
        generateAudio?: boolean;
        imageUrls?: string[];
    };
    "ltx-v2-retake": {
        prompt: string;
        duration?: 5 | 10 | 15 | 20;
        videoUrl: string;
    };
    "ltx-v2.3-extend": {
        prompt?: string;
        duration?: 5 | 10 | 15 | 20;
        videoUrl: string;
    };
    "ltx-v2.3-fast": {
        prompt: string;
        duration?: 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20;
        resolution?: "1080p" | "1440p" | "2160p";
        aspectRatio?: "16:9" | "9:16";
        generateAudio?: boolean;
        imageUrls?: string[];
    };
    "ltx-v2.3-pro": {
        prompt: string;
        duration?: 6 | 8 | 10;
        resolution?: "1080p" | "1440p" | "2160p";
        aspectRatio?: "16:9" | "9:16";
        generateAudio?: boolean;
        imageUrls?: string[];
    };
    "ltx-v2.3-retake": {
        prompt: string;
        duration?: 5 | 10 | 15 | 20;
        videoUrl: string;
    };
    "luma-ray-2": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "9:21";
        resolution?: "540p" | "720p" | "1080p" | "4k";
        duration?: 5 | 9;
        startFrame?: string;
        endFrame?: string;
    };
    "luma-ray-2-reframe-video": {
        prompt?: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "9:21";
        videoUrl: string;
    };
    "luma-ray-3.2": {
        prompt: string;
        aspectRatio?: "9:16" | "3:4" | "1:1" | "4:3" | "16:9" | "21:9";
        resolution?: "540p" | "720p" | "1080p";
        duration?: 5 | 10;
        startFrame?: string;
        endFrame?: string;
        hdr?: boolean;
        exrExport?: boolean;
        loop?: boolean;
    };
    "luma-ray-3.2-edit": {
        prompt: string;
        videoUrl: string;
        resolution?: "540p" | "720p" | "1080p";
        duration?: 5 | 10;
        editStrength?: "adhere_1" | "adhere_2" | "adhere_3" | "flex_1" | "flex_2" | "flex_3" | "reimagine_1" | "reimagine_2" | "reimagine_3";
        hdr?: boolean;
        exrExport?: boolean;
    };
    "luma-ray-3.2-reframe-video": {
        prompt: string;
        aspectRatio?: "9:16" | "3:4" | "1:1" | "4:3" | "16:9" | "21:9";
        videoUrl: string;
        resolution?: "540p" | "720p" | "1080p";
    };
    "luma-ray-flash-2": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "9:21";
        resolution?: "540p" | "720p" | "1080p" | "4k";
        duration?: 5 | 9;
        startFrame: string;
        endFrame?: string;
    };
    "luma-ray-flash-2-reframe-video": {
        prompt?: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "9:21";
        videoUrl: string;
    };
    "luma-uni-1": {
        prompt: string;
        aspectRatio?: "3:1" | "2:1" | "16:9" | "3:2" | "1:1" | "2:3" | "9:16" | "1:2" | "1:3";
        style?: "auto" | "manga";
        imageUrls?: string[];
    };
    "luma-uni-1-max": {
        prompt: string;
        aspectRatio?: "3:1" | "2:1" | "16:9" | "3:2" | "1:1" | "2:3" | "9:16" | "1:2" | "1:3";
        style?: "auto" | "manga";
        imageUrls?: string[];
    };
    "lyria-3-clip": {
        prompt: string;
        imageUrls?: string[];
    };
    "lyria-3-pro": {
        prompt: string;
        imageUrls?: string[];
    };
    "minimax-02-hd": {
        language?: string;
        accent?: string;
        prompt: string;
    };
    "minimax-h3": {
        prompt: string;
        startFrame?: string;
        endFrame?: string;
        imageUrls?: string[];
        videoUrls?: string[];
        audioUrls?: string[];
        duration?: 5 | 10 | 15;
        aspectRatio?: "adaptive" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    };
    "minimax-h3-max": {
        prompt: string;
        startFrame?: string;
        endFrame?: string;
        resolution?: "480p" | "768p";
        duration?: number;
        aspectRatio?: "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
        promptExpansionMode?: "disabled" | "balanced" | "quality";
        seed?: number;
        enableSafetyChecker?: boolean;
    };
    "minimax-h3-max-r2v": {
        prompt: string;
        imageUrls?: string[];
        videoUrls?: string[];
        audioUrls?: string[];
        resolution?: "480p" | "768p";
        duration?: number;
        aspectRatio?: "adaptive" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
        promptExpansionMode?: "balanced" | "quality";
        seed?: number;
        enableSafetyChecker?: boolean;
    };
    "minimax-h3-max-turbo": {
        prompt: string;
        startFrame?: string;
        endFrame?: string;
        resolution?: "480p" | "768p";
        duration?: number;
        aspectRatio?: "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
        promptExpansionMode?: "balanced" | "quality";
        seed?: number;
        enableSafetyChecker?: boolean;
    };
    "minimax-music-v2": {
        prompt: string;
        lyricsPrompt?: string;
        lyricsOptimizer?: boolean;
        isInstrumental?: boolean;
        outputFormat?: "url" | "hex";
    };
    "minimax-music-v3": {
        prompt: string;
        lyricsPrompt?: string;
        lyricsOptimizer?: boolean;
        isInstrumental?: boolean;
        sampleRate?: 16000 | 24000 | 32000 | 44100;
        bitrate?: 32000 | 64000 | 128000 | 256000;
        format?: "mp3" | "wav" | "pcm";
    };
    "muse-image-1.0": {
        prompt: string;
        aspectRatio?: "1:1" | "3:2" | "2:3" | "16:9" | "9:16" | "4:3" | "3:4";
        reasoningStrength?: "low" | "high";
        moderation?: "auto" | "low" | "none";
        enableImageSearch?: boolean;
        enableWebSearch?: boolean;
        enableShell?: boolean;
        outputFormat?: "png" | "jpeg" | "webp";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "ovi": {
        prompt: string;
        size?: "9:16" | "16:9" | "1:1" | "9:16+" | "16:9+" | "2:5" | "5:2";
        imageUrls?: string[];
    };
    "picsart-change-bg": {
        imageUrls: [string, ...string[]];
        prompt: string;
    };
    "picsart-enhance": {
        imageUrls: [string, ...string[]];
    };
    "picsart-flow": {
        templateId: string;
        imageUrls: [string, ...string[]];
    };
    "picsart-flow-video": {
        templateId: string;
        imageUrls: [string, ...string[]];
    };
    "picsart-flux-2-klein": {
        prompt: string;
        aspectRatio?: "1:1" | "5:3" | "3:5" | "4:3" | "3:4";
        imageUrls?: string[];
    };
    "picsart-hidream-t2i": {
        prompt: string;
        aspectRatio?: "1:1" | "5:3" | "3:5" | "4:3" | "3:4";
    };
    "picsart-qwen-image-edit": {
        imageUrls: [string, ...string[]];
        prompt: string;
        negativePrompt?: string;
    };
    "picsart-qwen-image-edit-angle": {
        imageUrls: [string, ...string[]];
        prompt: string;
        negativePrompt?: string;
        numInferenceSteps?: number;
        cfgScale?: number;
        loraWeights?: {
            lora_angle?: number;
            lora_angle_lighting?: number;
        };
    };
    "picsart-qwen-makeup": {
        imageUrls: [string, ...string[]];
        prompt: string;
        negativePrompt?: string;
    };
    "picsart-sana-sprint-v1": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
    };
    "picsart-sod-v8-2": {
        imageUrls: [string, ...string[]];
    };
    "picsart-videography": {
        imageUrls: [string, ...string[]];
    };
    "pika-2.2": {
        prompt: string;
        duration?: 5 | 10;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:5" | "5:4" | "3:2" | "2:3";
        resolution?: "720p" | "1080p";
        imageUrls?: string[];
    };
    "pika-2.2-frames": {
        prompt: string;
        duration?: 5 | 10;
        resolution?: "720p" | "1080p";
        imageUrls: [string, ...string[]];
    };
    "pika-2.2-scenes": {
        prompt: string;
        duration?: 5 | 10;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:5" | "5:4" | "3:2" | "2:3";
        resolution?: "720p" | "1080p";
        imageUrls: [string, ...string[]];
    };
    "pixverse-c1": {
        prompt: string;
        quality?: "360p" | "540p" | "720p" | "1080p";
        duration?: 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        aspectRatio?: "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "2:3" | "3:2" | "21:9";
    };
    "pixverse-c1-fusion": {
        prompt: string;
        quality?: "360p" | "540p" | "720p" | "1080p";
        duration?: 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        aspectRatio?: "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "2:3" | "3:2" | "21:9";
        imageUrls: [string, ...string[]];
    };
    "pixverse-c1-image": {
        prompt: string;
        quality?: "360p" | "540p" | "720p" | "1080p";
        duration?: 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        imageUrls: [string, ...string[]];
    };
    "pixverse-v6": {
        prompt: string;
        quality?: "360p" | "540p" | "720p" | "1080p";
        duration?: 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        aspectRatio?: "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "2:3" | "3:2" | "21:9";
    };
    "pixverse-v6-fusion": {
        prompt: string;
        quality?: "360p" | "540p" | "720p" | "1080p";
        duration?: 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        aspectRatio?: "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "2:3" | "3:2" | "21:9";
        imageUrls: [string, ...string[]];
    };
    "pixverse-v6-image": {
        prompt: string;
        quality?: "360p" | "540p" | "720p" | "1080p";
        duration?: 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        imageUrls: [string, ...string[]];
    };
    "qwen": {
        prompt: string;
        imageUrls?: string[];
    };
    "qwen-image-2": {
        prompt: string;
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "qwen-image-2-pro": {
        prompt: string;
        negativePrompt?: string;
        resolution?: "2048x2048" | "2688x1536" | "1536x2688" | "2368x1728" | "1728x2368";
        count?: 1 | 2 | 4 | 6;
        enhancePrompt?: boolean;
        imageUrls?: string[];
        seed?: number;
    };
    "qwen-image-3.0": {
        prompt: string;
        negativePrompt?: string;
        resolution?: "2048x2048" | "2688x1536" | "1536x2688" | "2368x1728" | "1728x2368";
        count?: 1 | 2 | 4 | 6;
        enhancePrompt?: boolean;
        imageUrls?: string[];
        seed?: number;
        promptExtendMode?: "direct" | "agent";
        enableThinking?: boolean;
    };
    "qwen-image-3.0-pro": {
        prompt: string;
        negativePrompt?: string;
        resolution?: "2048x2048" | "2688x1536" | "1536x2688" | "2368x1728" | "1728x2368";
        count?: 1 | 2 | 4 | 6;
        enhancePrompt?: boolean;
        imageUrls?: string[];
        seed?: number;
        promptExtendMode?: "direct" | "agent";
        enableThinking?: boolean;
    };
    "recraft-creative-upscale": {
        imageUrls: [string, ...string[]];
    };
    "recraft-crisp-upscale": {
        imageUrls: [string, ...string[]];
    };
    "recraft-explore": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
    };
    "recraft-explore-similar": {
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        sourceImageId: string;
        similarity?: number;
    };
    "recraft-vectorize": {
        prompt?: string;
        imageUrls: [string, ...string[]];
    };
    "recraftv2": {
        prompt: string;
        style?: "realistic_image" | "digital_illustration" | "vector_illustration" | "icon";
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        negativePrompt?: string;
    };
    "recraftv2_vector": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        negativePrompt?: string;
    };
    "recraftv3": {
        prompt: string;
        style?: "realistic_image" | "digital_illustration" | "vector_illustration" | "any";
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        negativePrompt?: string;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "recraftv3_vector": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        negativePrompt?: string;
    };
    "recraftv3-replace-bg": {
        prompt?: string;
        imageUrls: [string, ...string[]];
    };
    "recraftv4": {
        prompt: string;
        style?: "raster" | "vector_illustration";
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "recraftv4_1": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "recraftv4_1_pro": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "recraftv4_1_pro_vector": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "recraftv4_1_utility": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "recraftv4_1_utility_pro": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "recraftv4_1_utility_pro_vector": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "recraftv4_1_utility_vector": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "recraftv4_1_vector": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "recraftv4_pro": {
        prompt: string;
        style?: "raster" | "vector_illustration";
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "recraftv4_pro_vector": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "recraftv4_styles": {
        prompt: string;
        imageUrls: [string, ...string[]];
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
    };
    "recraftv4_styles_pro": {
        prompt: string;
        imageUrls: [string, ...string[]];
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
    };
    "recraftv4_styles_pro_vector": {
        prompt: string;
        imageUrls: [string, ...string[]];
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
    };
    "recraftv4_styles_vector": {
        prompt: string;
        imageUrls: [string, ...string[]];
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
    };
    "recraftv4_vector": {
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16" | "2:1" | "1:2";
        count?: 1 | 2 | 4 | 6;
        imageUrls?: string[];
        imageWeight?: number;
    };
    "reve": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "3:2" | "2:3";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "runway-aleph2": {
        prompt: string;
        videoUrl: string;
        startFrame?: string;
        endFrame?: string;
    };
    "runway-avatar-video": {
        style?: "game-character" | "music-superstar" | "game-character-man" | "cat-character" | "influencer" | "tennis-coach" | "human-resource" | "fashion-designer" | "cooking-teacher";
        voiceId?: string;
        prompt?: string;
        audioUrl?: string;
    };
    "runway-gen3a-turbo": {
        prompt: string;
        duration?: 5 | 10;
        aspectRatio?: "16:9" | "9:16";
        startFrame: string;
        endFrame?: string;
    };
    "runway-gen4-aleph": {
        prompt: string;
        videoUrl: string;
    };
    "runway-gen4-ref": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16";
        imageUrls: [string, ...string[]];
    };
    "runway-gen4.5": {
        prompt: string;
        duration?: 5 | 8 | 10;
        aspectRatio?: "16:9" | "9:16";
        imageUrls?: string[];
    };
    "seed-audio-1.0": {
        prompt: string;
        voiceId?: string;
        audioUrls?: string[];
        imageUrls?: string[];
        format?: "wav" | "mp3" | "pcm" | "ogg_opus";
        sampleRate?: 8000 | 16000 | 24000 | 32000 | 44100 | 48000;
        speechRate?: number;
        loudnessRate?: number;
        pitchRate?: number;
        aigcWatermark?: boolean;
    };
    "seed-audio-1.0-multilingual": {
        prompt: string;
        voiceId?: string;
        audioUrls?: string[];
        imageUrls?: string[];
        format?: "wav" | "mp3" | "pcm" | "ogg_opus";
        sampleRate?: 8000 | 16000 | 24000 | 32000 | 44100 | 48000;
        speechRate?: number;
        loudnessRate?: number;
        pitchRate?: number;
        aigcWatermark?: boolean;
    };
    "seedance-1.5-pro": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p";
        duration?: 4 | 5 | 8 | 10 | 12;
        generateAudio?: boolean;
        startFrame?: string;
        endFrame?: string;
    };
    "seedance-2.0": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p" | "1080p" | "4k";
        duration?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        returnLastFrame?: boolean;
        imageUrls?: string[];
        videoUrls?: string[];
        audioUrls?: string[];
        startFrame?: string;
        endFrame?: string;
    };
    "seedance-2.0-fast": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p";
        duration?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        returnLastFrame?: boolean;
        imageUrls?: string[];
        videoUrls?: string[];
        audioUrls?: string[];
        startFrame?: string;
        endFrame?: string;
    };
    "seedance-2.0-fast-video-edit": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p";
        duration?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        returnLastFrame?: boolean;
        videoUrl: string;
        imageUrls?: string[];
    };
    "seedance-2.0-fast-video-extend": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p";
        duration?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        videoUrls: [string, ...string[]];
    };
    "seedance-2.0-mini": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p";
        duration?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        returnLastFrame?: boolean;
        imageUrls?: string[];
        videoUrls?: string[];
        audioUrls?: string[];
        startFrame?: string;
        endFrame?: string;
    };
    "seedance-2.0-mini-video-edit": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p";
        duration?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        returnLastFrame?: boolean;
        videoUrl: string;
        imageUrls?: string[];
    };
    "seedance-2.0-mini-video-extend": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p";
        duration?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        videoUrls: [string, ...string[]];
    };
    "seedance-2.0-video-edit": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p" | "1080p" | "4k";
        duration?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        returnLastFrame?: boolean;
        videoUrl: string;
        imageUrls?: string[];
    };
    "seedance-2.0-video-extend": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p" | "1080p" | "4k";
        duration?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        videoUrls: [string, ...string[]];
    };
    "seedance-2.0-without-moderation": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p" | "1080p" | "4k";
        duration?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        returnLastFrame?: boolean;
        imageUrls?: string[];
        videoUrls?: string[];
        audioUrls?: string[];
        startFrame?: string;
        endFrame?: string;
    };
    "seedance-2.0-without-moderation-video-edit": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p" | "1080p" | "4k";
        duration?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        returnLastFrame?: boolean;
        videoUrl: string;
        imageUrls?: string[];
    };
    "seedance-2.0-without-moderation-video-extend": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p" | "1080p" | "4k";
        duration?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        generateAudio?: boolean;
        videoUrls: [string, ...string[]];
    };
    "seedance-2.5": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p" | "1080p";
        duration?: number;
        generateAudio?: boolean;
        returnLastFrame?: boolean;
        outputFormat?: "mp4" | "mov";
        imageUrls?: string[];
        videoUrls?: string[];
        audioUrls?: string[];
        startFrame?: string;
        endFrame?: string;
    };
    "seedance-2.5-video-edit": {
        prompt: string;
        aspectRatio?: "adaptive";
        resolution?: "480p" | "720p" | "1080p";
        generateAudio?: boolean;
        returnLastFrame?: boolean;
        outputFormat?: "mp4" | "mov";
        videoUrl: string;
        imageUrls?: string[];
    };
    "seedance-2.5-video-extend": {
        prompt: string;
        aspectRatio?: "adaptive";
        resolution?: "480p" | "720p" | "1080p";
        duration?: number;
        generateAudio?: boolean;
        outputFormat?: "mp4" | "mov";
        videoUrls: [string, ...string[]];
    };
    "seedance-i2v": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "adaptive";
        resolution?: "480p" | "720p" | "1080p";
        duration?: 5 | 10;
        startFrame: string;
    };
    "seedream-4.0": {
        resolution?: "1K" | "2K" | "4K";
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "3:2" | "2:3" | "21:9";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
        negativePrompt?: string;
    };
    "seedream-4.5": {
        resolution?: "2K" | "4K";
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "3:2" | "2:3" | "21:9";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
        negativePrompt?: string;
    };
    "seedream-4.7": {
        resolution?: "1K" | "2K" | "4K";
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "3:2" | "2:3" | "21:9";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
        negativePrompt?: string;
    };
    "seedream-5.0-lite": {
        resolution?: "2K" | "3K";
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "3:2" | "2:3" | "21:9";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
        negativePrompt?: string;
    };
    "seedream-5.0-pro": {
        resolution?: "1K" | "2K";
        prompt: string;
        aspectRatio?: "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "3:2" | "2:3" | "21:9";
        imageUrls?: string[];
        negativePrompt?: string;
    };
    "sora-2": {
        prompt: string;
        imageUrls?: string[];
        aspectRatio?: "16:9" | "9:16";
        duration?: 4 | 8 | 12 | 16 | 20;
    };
    "sora-2-extend": {
        prompt: string;
        videoId?: string;
        duration?: 4 | 8 | 12 | 16 | 20;
    };
    "sora-2-pro": {
        prompt: string;
        imageUrls?: string[];
        aspectRatio?: "16:9" | "9:16";
        resolution?: "720p" | "1024p" | "1080p";
        duration?: 4 | 8 | 12 | 16 | 20;
    };
    "topaz-upscale-image": {
        imageUrls: [string, ...string[]];
        model?: "Standard V2" | "Standard MAX" | "Low Resolution V2" | "High Fidelity V2" | "CGI" | "Text Refine" | "Redefine" | "Recovery" | "Recovery V2" | "Wonder" | "Wonder 3";
    };
    "topaz-upscale-video": {
        videoUrl: string;
        model?: "Proteus" | "Artemis HQ" | "Artemis MQ" | "Artemis LQ" | "Nyx" | "Nyx Fast" | "Nyx XL" | "Nyx HF" | "Gaia HQ" | "Gaia CG" | "Gaia 2" | "Starlight Precise 1" | "Starlight Precise 2" | "Starlight Precise 2.5" | "Starlight HQ" | "Starlight Mini" | "Starlight Sharp" | "Starlight Fast 1" | "Starlight Fast 2";
    };
    "veed-fabric-v1": {
        prompt?: string;
        resolution?: "480p" | "720p";
        imageUrls: [string, ...string[]];
        audioUrl: string;
    };
    "veed-fabric-v1-fast": {
        prompt?: string;
        resolution?: "480p" | "720p";
        imageUrls: [string, ...string[]];
        audioUrl: string;
    };
    "veo-3.1": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16";
        duration?: 4 | 6 | 8;
        resolution?: "720p" | "1080p" | "4k";
        imageUrls?: string[];
        generateAudio?: boolean;
        negativePrompt?: string;
        startFrame?: string;
        endFrame?: string;
    };
    "veo-3.1-fast": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16";
        duration?: 4 | 6 | 8;
        resolution?: "720p" | "1080p" | "4k";
        imageUrls?: string[];
        generateAudio?: boolean;
        negativePrompt?: string;
        startFrame?: string;
        endFrame?: string;
    };
    "veo-3.1-lite": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16";
        duration?: 4 | 6 | 8;
        resolution?: "720p" | "1080p";
        startFrame?: string;
    };
    "wan-2.6-image": {
        prompt: string;
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        negativePrompt?: string;
    };
    "wan-2.6-r2v": {
        prompt: string;
        duration?: 5 | 10;
        resolution?: "720p" | "1080p";
        videoUrl: string;
    };
    "wan-2.6-t2v": {
        prompt: string;
        duration?: 5 | 10 | 15;
        resolution?: "480p" | "720p" | "1080p";
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        negativePrompt?: string;
        startFrame?: string;
    };
    "wan-2.7-i2v": {
        prompt?: string;
        duration?: 5 | 10 | 15;
        resolution?: "720P" | "1080P";
        negativePrompt?: string;
        enhancePrompt?: boolean;
        startFrame: string;
        endFrame?: string;
        audioUrl?: string;
        seed?: number;
    };
    "wan-2.7-r2v": {
        prompt: string;
        duration?: 5 | 10;
        resolution?: "720P" | "1080P";
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        negativePrompt?: string;
        imageUrls: [string, ...string[]];
        videoUrl: string;
        seed?: number;
    };
    "wan-2.7-t2v": {
        prompt: string;
        duration?: 5 | 10 | 15;
        resolution?: "720P" | "1080P";
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        negativePrompt?: string;
        enhancePrompt?: boolean;
        audioUrl?: string;
        startFrame?: string;
        seed?: number;
    };
    "wan-2.7-video-edit": {
        prompt?: string;
        resolution?: "720P" | "1080P";
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        negativePrompt?: string;
        videoUrl: string;
        imageUrls?: string[];
        audioSetting?: "auto" | "origin";
        duration?: number;
        seed?: number;
    };
    "wan-3.0-video": {
        prompt?: string;
        duration?: -1 | 5 | 10 | 15 | 30;
        resolution?: "480P" | "720P" | "1080P";
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "adaptive";
        generateAudio?: boolean;
        startFrame?: string;
        endFrame?: string;
        imageUrls?: string[];
        videoUrls?: string[];
        audioUrls?: string[];
        enableThinking?: boolean;
        watermark?: boolean;
        seed?: number;
    };
    "wan-3.0-video-prime": {
        prompt?: string;
        duration?: -1 | 5 | 10 | 15 | 30;
        resolution?: "480P" | "720P" | "1080P";
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "adaptive";
        generateAudio?: boolean;
        startFrame?: string;
        endFrame?: string;
        imageUrls?: string[];
        videoUrls?: string[];
        audioUrls?: string[];
        enableThinking?: boolean;
        watermark?: boolean;
        seed?: number;
    };
};
type TypedModelId = keyof ModelInputById;
type ModelInput<M extends TypedModelId> = ModelInputById[M];
/** IDs of text-generation (LLM) models — narrows generateText(). */
type TextModelId = "claude-haiku-4-5" | "claude-opus-4-8" | "claude-sonnet-4-6" | "gemini-3-pro" | "gemini-3.5-flash-lite" | "gemini-3.6-flash" | "gemini-3.7-flash" | "gpt-5.5";
type TextModelInputById = Pick<ModelInputById, TextModelId>;

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
interface GenerationFile {
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
interface DriveFileDetails extends DriveMediaItem {
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
interface SaveParams {
    url: string;
    name: string;
    resourceType: 'PHOTO' | 'VIDEO' | 'AUDIO';
    attributes?: Record<string, string>;
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
    buildSaveParams(url: string, modelId: string, modelName: string, mode: string, prompt?: string): SaveParams;
    /** Set a like/dislike reaction on a file. */
    addReaction(fileUid: string, reaction: UserReaction): Promise<boolean>;
    /** Clear the reaction on a file. */
    removeReaction(fileUid: string): Promise<boolean>;
}
declare function inferResourceType(mode: string): 'PHOTO' | 'VIDEO' | 'AUDIO';
declare function buildFilename(prompt: string | undefined, mode: string): string;
declare function buildGenerationAttributes(input: {
    modelId: string;
    params: Record<string, unknown>;
    /** TODO(backend-autosave): temporary — remove once the backend stamps appId/appType. */
    app?: AppIdentity;
}): DriveAttributes;
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
 */
interface ApisClient {
    /** Run an API by name (mirrors WorkflowsClient.run()). */
    run<W extends string = string>(api: W, payload: W extends keyof ApiSchemas ? ApiSchemas[W]['params'] : Record<string, unknown>, options?: ApiRunOptions): Promise<ApiResponse<W extends keyof ApiSchemas ? ApiSchemas[W]['result'] : unknown>>;
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
interface ObjectDescriptor {
    kind: 'object';
    /** Nested fields use the flat EntryMeta + Descriptor merge — same shape as
     *  EnumEntry / RangeEntry / etc. Authors can mark a nested field optional
     *  by setting `required: false`. Default is required. */
    fields: Record<string, EntryMeta & ParamDescriptor>;
    array?: {
        min?: number;
        max?: number;
    };
}
type ParamDescriptor = EnumDescriptor<string> | EnumDescriptor<number> | CatalogDescriptor | RangeDescriptor | BooleanDescriptor | TextDescriptor | FileDescriptor | ObjectDescriptor;
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
}
type EnumEntry = EntryMeta & EnumDescriptor<string | number>;
type CatalogEntry = EntryMeta & CatalogDescriptor;
type RangeEntry = EntryMeta & RangeDescriptor;
type BooleanEntry = EntryMeta & BooleanDescriptor;
type TextEntry = EntryMeta & TextDescriptor;
type FileEntry = EntryMeta & FileDescriptor;
type ObjectEntry = EntryMeta & ObjectDescriptor;
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
    /** @deprecated Use `enum(key)` instead — returns full `EnumEntry` with `.options`, `.default`, etc. */
    getEnumOptions(key: string): (string | number)[] | null;
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
interface ValidationResult$1 {
    valid: boolean;
    errors?: string[];
}
interface ModelDescriptor {
    readonly id: TypedModelId;
    readonly name: string;
    params(): ModelParamsAccessor;
    /** Params with constraint effects pre-applied (disabled options, hidden params). */
    paramsFor(values: Partial<GenerationContext>): ModelParamsAccessor;
    meta(): ModelMeta;
    /** Validate generation input against this model's params. Returns
     *  `{ valid: true }` or `{ valid: false, errors }` — never throws. */
    validate(input: unknown): ValidationResult$1;
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
interface ModelFilter$1 {
    output?: GenerationMode;
    provider?: string;
    /**
     * Release tiers to include. Omitted ⇒ the default visible set
     * (`['production', 'general-availability']`). List the tiers you want
     * explicitly to opt into `preview` — e.g. `['preview']` for stage-only
     * models, or all three to include everything. `disabled`/`deprecated`
     * models stay hidden regardless.
     */
    release?: ReleaseTag[];
}

type AppProvider = 'picsart' | 'google' | 'kling' | 'grok' | 'openai' | 'flux' | 'ideogram' | 'elevenlabs' | 'minimax' | 'wan' | 'seedance' | 'ltx' | 'seedream' | 'seedaudio' | 'hunyuan' | 'pika' | 'runway' | 'luma' | 'ovi' | 'creatify' | 'veed' | 'bytedance' | 'qwen' | 'reve' | 'recraft' | 'videography' | 'topaz' | 'heygen' | 'happyhorse' | 'pixverse' | 'anthropic' | 'async' | 'captionsai' | 'meta';
/** Provider used by model definitions. */
type Provider = AppProvider;
/** App generation modes. */
type GenerationMode = 'video' | 'image' | 'audio' | 'text';
/** App input types. */
type InputType = 't2v' | 'i2v' | 'v2v' | 'a2v' | 't2i' | 'i2i' | 't2a' | 'v2a' | 'tts' | 'sts' | 'sfx' | 'music' | 't2t' | 'i2t' | 'v2t';
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
    /** MiniMax Music v2 worker field, sent as `lyrics_prompt` (min 10 chars). */
    lyricsPrompt?: string;
    lyricsOptimizer?: boolean;
    isInstrumental?: boolean;
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
    returnLastFrame?: boolean;
    background?: string;
    outputFormat?: string;
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
 */
type Restriction = {
    allowed: unknown[];
    reason?: string;
} | {
    disabled: true;
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
     * Marks a model as operationally unavailable — backend not deployed,
     * pricing unconfirmed, catalog/runtime mismatch, etc. Expected to flip
     * back on once the gate clears. Hidden from default catalog lookups.
     */
    disabled?: boolean;
    /**
     * Marks a model as retired — superseded by a newer model or otherwise no
     * longer offered. Will not come back. Catalog row stays so workflow IDs
     * and toolIds remain resolvable for historical jobs and pricing. Hidden
     * from default catalog lookups, same as `disabled`.
     */
    deprecated?: boolean;
    release?: ReleaseTag;
    mode: GenerationMode;
    inputType: InputType;
    modelId?: string;
    paramConfig: ModelParams;
    /** Declarative inter-parameter constraints (e.g. "1080p requires 8s duration"). */
    constraints?: Constraint[];
    /** Payload builder. Optional — omit for pass-through (param values sent as-is). */
    buildPayload?: PayloadBuilder;
    /** I2V/edit payload builder when different from buildPayload. */
    buildEditPayload?: PayloadBuilder;
    outputSchema?: RuntimeSchema<unknown>;
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
/** @deprecated No longer drives behavior — catalogs are addressed by param key. */
type CatalogKind = 'voices' | 'avatars';
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

/** Model id with autocomplete that still accepts arbitrary strings. */
type ModelId = TypedModelId | (string & {});
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
/**
 * Simple client config — pass the API base URL plus one auth source, and the
 * SDK handles the rest. The SDK knows the Picsart API endpoints and response
 * shapes internally.
 *
 * Provide exactly one of:
 * - `fetch` — your own authenticated fetch (you add headers/cookies), or
 * - `apiKey` — the SDK builds a fetch that sends `Authorization: Bearer <apiKey>`.
 */
interface ClientConfig {
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
interface GenerateResultItem {
    url: string;
    metadata?: Record<string, unknown>;
}
interface GenerateResult {
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
interface GenerateTextResult {
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
interface GenerateOptions {
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
/** Non-text (image/video/audio) model IDs — the media generation surface. */
type MediaModelId = Exclude<TypedModelId, TextModelId>;
/** AI SDK client with type-safe, model-aware method signatures. */
interface AiClient {
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

/**
 * Create an AI SDK client.
 *
 * @example Simple — pass an authenticated fetch:
 * ```ts
 * const ai = createClient({ fetch: myAuthenticatedFetch });
 * ```
 *
 * @example With Drive — auto-save generations:
 * ```ts
 * const ai = createClient({
 *   fetch: myAuthenticatedFetch,
 *   drive: { folder: 'AI Playground' },
 * });
 * ```
 */
declare function createClient(config: ClientConfig | SdkTransport): AiClient;

/**
 * Typed Models constants and namespace.
 * Regenerate with: npm run build:model-constants
 */

interface ValidationResult {
    valid: boolean;
    errors?: string[];
}
interface ModelFilter {
    mode?: GenerationMode;
    provider?: string;
}
declare const Models: {
    readonly AsyncFlashV1: "async-flash-v1";
    readonly BytedanceOmnihumanV15: "bytedance-omnihuman-v1.5";
    readonly BytedanceVideoEnhance: "bytedance-video-enhance";
    readonly BytedanceVideoUpscaler: "bytedance-video-upscaler";
    readonly CaptionsaiVideoCaptions: "captionsai-video-captions";
    readonly ClaudeHaiku45: "claude-haiku-4-5";
    readonly ClaudeOpus48: "claude-opus-4-8";
    readonly ClaudeSonnet46: "claude-sonnet-4-6";
    readonly CreatifyAurora: "creatify-aurora";
    readonly ElevenAudioIsolation: "eleven-audio-isolation";
    readonly ElevenDubbing: "eleven-dubbing";
    readonly ElevenMultilingualStsV2: "eleven-multilingual-sts-v2";
    readonly ElevenMultilingualV2: "eleven-multilingual-v2";
    readonly ElevenStsV2: "eleven-sts-v2";
    readonly ElevenV3: "eleven-v3";
    readonly ElevenVoiceCreate: "eleven-voice-create";
    readonly ElevenVoiceDesignV2: "eleven-voice-design-v2";
    readonly ElevenVoiceDesignV3: "eleven-voice-design-v3";
    readonly ElevenVoiceRemix: "eleven-voice-remix";
    readonly ElevenlabsMusicV2: "elevenlabs-music-v2";
    readonly ElevenlabsSfx: "elevenlabs-sfx";
    readonly Flux2Flex: "flux-2-flex";
    readonly Flux2Max: "flux-2-max";
    readonly Flux2Pro: "flux-2-pro";
    readonly Flux3Video: "flux-3-video";
    readonly FluxKontextMax: "flux-kontext-max";
    readonly FluxKontextPro: "flux-kontext-pro";
    readonly FluxVideoUpscale: "flux-video-upscale";
    readonly Gemini25FlashImage: "gemini-2.5-flash-image";
    readonly Gemini25FlashTts: "gemini-2.5-flash-tts";
    readonly Gemini25ProTts: "gemini-2.5-pro-tts";
    readonly Gemini3Pro: "gemini-3-pro";
    readonly Gemini3ProImage: "gemini-3-pro-image";
    readonly Gemini31FlashImage: "gemini-3.1-flash-image";
    readonly Gemini31FlashLiteImage: "gemini-3.1-flash-lite-image";
    readonly Gemini35FlashLite: "gemini-3.5-flash-lite";
    readonly Gemini36Flash: "gemini-3.6-flash";
    readonly Gemini37Flash: "gemini-3.7-flash";
    readonly GeminiOmni11FlashPreview: "gemini-omni-1.1-flash-preview";
    readonly GeminiOmniFlashPreview: "gemini-omni-flash-preview";
    readonly Gpt55: "gpt-5.5";
    readonly GptImage1: "gpt-image-1";
    readonly GptImage15: "gpt-image-1.5";
    readonly GptImage2: "gpt-image-2";
    readonly GrokEditVideo: "grok-edit-video";
    readonly GrokExtendVideo: "grok-extend-video";
    readonly GrokImagineImage: "grok-imagine-image";
    readonly GrokImagineImage20: "grok-imagine-image-2.0";
    readonly GrokImagineImageQuality: "grok-imagine-image-quality";
    readonly GrokImagineVideo: "grok-imagine-video";
    readonly GrokImagineVideo15: "grok-imagine-video-1.5";
    readonly GrokTts: "grok-tts";
    readonly Hailuo23: "hailuo-2.3";
    readonly Hailuo23Fast: "hailuo-2.3-fast";
    readonly Hailuo23FastPro: "hailuo-2.3-fast-pro";
    readonly Hailuo23Pro: "hailuo-2.3-pro";
    readonly Happyhorse10R2v: "happyhorse-1.0-r2v";
    readonly Happyhorse10T2v: "happyhorse-1.0-t2v";
    readonly Happyhorse10VideoEdit: "happyhorse-1.0-video-edit";
    readonly Happyhorse11R2v: "happyhorse-1.1-r2v";
    readonly Happyhorse11T2v: "happyhorse-1.1-t2v";
    readonly HeygenTalkingPhoto: "heygen-talking-photo";
    readonly HeygenVideoAvatar: "heygen-video-avatar";
    readonly HunyuanV3: "hunyuan-v3";
    readonly IdeogramCharacter: "ideogram-character";
    readonly IdeogramPImage: "ideogram-p-image";
    readonly IdeogramV3: "ideogram-v3";
    readonly IdeogramV4: "ideogram-v4";
    readonly Kling30Image: "kling-3.0-image";
    readonly KlingAvatar: "kling-avatar";
    readonly KlingElements: "kling-elements";
    readonly KlingMotionControl: "kling-motion-control";
    readonly KlingMotionControlV3: "kling-motion-control-v3";
    readonly KlingMultiImageV21: "kling-multi-image-v2-1";
    readonly KlingO1Image: "kling-o1-image";
    readonly KlingT2a: "kling-t2a";
    readonly KlingV21Image: "kling-v2-1-image";
    readonly KlingV26: "kling-v2-6";
    readonly KlingV2a: "kling-v2a";
    readonly KlingV3: "kling-v3";
    readonly KlingV3Omni: "kling-v3-omni";
    readonly KlingV3Turbo: "kling-v3-turbo";
    readonly KlingVideoEffects: "kling-video-effects";
    readonly KlingVideoO1: "kling-video-o1";
    readonly Ltx23A2v: "ltx-2.3-a2v";
    readonly LtxProT2v: "ltx-pro-t2v";
    readonly LtxV2Fast: "ltx-v2-fast";
    readonly LtxV2Retake: "ltx-v2-retake";
    readonly LtxV23Extend: "ltx-v2.3-extend";
    readonly LtxV23Fast: "ltx-v2.3-fast";
    readonly LtxV23Pro: "ltx-v2.3-pro";
    readonly LtxV23Retake: "ltx-v2.3-retake";
    readonly LumaRay2: "luma-ray-2";
    readonly LumaRay2ReframeVideo: "luma-ray-2-reframe-video";
    readonly LumaRay32: "luma-ray-3.2";
    readonly LumaRay32Edit: "luma-ray-3.2-edit";
    readonly LumaRay32ReframeVideo: "luma-ray-3.2-reframe-video";
    readonly LumaRayFlash2: "luma-ray-flash-2";
    readonly LumaRayFlash2ReframeVideo: "luma-ray-flash-2-reframe-video";
    readonly LumaUni1: "luma-uni-1";
    readonly LumaUni1Max: "luma-uni-1-max";
    readonly Lyria3Clip: "lyria-3-clip";
    readonly Lyria3Pro: "lyria-3-pro";
    readonly Minimax02Hd: "minimax-02-hd";
    readonly MinimaxH3: "minimax-h3";
    readonly MinimaxH3Max: "minimax-h3-max";
    readonly MinimaxH3MaxR2v: "minimax-h3-max-r2v";
    readonly MinimaxH3MaxTurbo: "minimax-h3-max-turbo";
    readonly MinimaxMusicV2: "minimax-music-v2";
    readonly MinimaxMusicV3: "minimax-music-v3";
    readonly MuseImage10: "muse-image-1.0";
    readonly Ovi: "ovi";
    readonly PicsartChangeBg: "picsart-change-bg";
    readonly PicsartEnhance: "picsart-enhance";
    readonly PicsartFlow: "picsart-flow";
    readonly PicsartFlowVideo: "picsart-flow-video";
    readonly PicsartFlux2Klein: "picsart-flux-2-klein";
    readonly PicsartHidreamT2i: "picsart-hidream-t2i";
    readonly PicsartQwenImageEdit: "picsart-qwen-image-edit";
    readonly PicsartQwenImageEditAngle: "picsart-qwen-image-edit-angle";
    readonly PicsartQwenMakeup: "picsart-qwen-makeup";
    readonly PicsartSanaSprintV1: "picsart-sana-sprint-v1";
    readonly PicsartSodV82: "picsart-sod-v8-2";
    readonly PicsartVideography: "picsart-videography";
    readonly Pika22: "pika-2.2";
    readonly Pika22Frames: "pika-2.2-frames";
    readonly Pika22Scenes: "pika-2.2-scenes";
    readonly PixverseC1: "pixverse-c1";
    readonly PixverseC1Fusion: "pixverse-c1-fusion";
    readonly PixverseC1Image: "pixverse-c1-image";
    readonly PixverseV6: "pixverse-v6";
    readonly PixverseV6Fusion: "pixverse-v6-fusion";
    readonly PixverseV6Image: "pixverse-v6-image";
    readonly Qwen: "qwen";
    readonly QwenImage2: "qwen-image-2";
    readonly QwenImage2Pro: "qwen-image-2-pro";
    readonly QwenImage30: "qwen-image-3.0";
    readonly QwenImage30Pro: "qwen-image-3.0-pro";
    readonly RecraftCreativeUpscale: "recraft-creative-upscale";
    readonly RecraftCrispUpscale: "recraft-crisp-upscale";
    readonly RecraftExplore: "recraft-explore";
    readonly RecraftExploreSimilar: "recraft-explore-similar";
    readonly RecraftVectorize: "recraft-vectorize";
    readonly Recraftv2: "recraftv2";
    readonly Recraftv2Vector: "recraftv2_vector";
    readonly Recraftv3: "recraftv3";
    readonly Recraftv3Vector: "recraftv3_vector";
    readonly Recraftv3ReplaceBg: "recraftv3-replace-bg";
    readonly Recraftv4: "recraftv4";
    readonly Recraftv41: "recraftv4_1";
    readonly Recraftv41Pro: "recraftv4_1_pro";
    readonly Recraftv41ProVector: "recraftv4_1_pro_vector";
    readonly Recraftv41Utility: "recraftv4_1_utility";
    readonly Recraftv41UtilityPro: "recraftv4_1_utility_pro";
    readonly Recraftv41UtilityProVector: "recraftv4_1_utility_pro_vector";
    readonly Recraftv41UtilityVector: "recraftv4_1_utility_vector";
    readonly Recraftv41Vector: "recraftv4_1_vector";
    readonly Recraftv4Pro: "recraftv4_pro";
    readonly Recraftv4ProVector: "recraftv4_pro_vector";
    readonly Recraftv4Styles: "recraftv4_styles";
    readonly Recraftv4StylesPro: "recraftv4_styles_pro";
    readonly Recraftv4StylesProVector: "recraftv4_styles_pro_vector";
    readonly Recraftv4StylesVector: "recraftv4_styles_vector";
    readonly Recraftv4Vector: "recraftv4_vector";
    readonly Reve: "reve";
    readonly RunwayAleph2: "runway-aleph2";
    readonly RunwayAvatarVideo: "runway-avatar-video";
    readonly RunwayGen3aTurbo: "runway-gen3a-turbo";
    readonly RunwayGen4Aleph: "runway-gen4-aleph";
    readonly RunwayGen4Ref: "runway-gen4-ref";
    readonly RunwayGen45: "runway-gen4.5";
    readonly SeedAudio10: "seed-audio-1.0";
    readonly SeedAudio10Multilingual: "seed-audio-1.0-multilingual";
    readonly Seedance15Pro: "seedance-1.5-pro";
    readonly Seedance20: "seedance-2.0";
    readonly Seedance20Fast: "seedance-2.0-fast";
    readonly Seedance20FastVideoEdit: "seedance-2.0-fast-video-edit";
    readonly Seedance20FastVideoExtend: "seedance-2.0-fast-video-extend";
    readonly Seedance20Mini: "seedance-2.0-mini";
    readonly Seedance20MiniVideoEdit: "seedance-2.0-mini-video-edit";
    readonly Seedance20MiniVideoExtend: "seedance-2.0-mini-video-extend";
    readonly Seedance20VideoEdit: "seedance-2.0-video-edit";
    readonly Seedance20VideoExtend: "seedance-2.0-video-extend";
    readonly Seedance20WithoutModeration: "seedance-2.0-without-moderation";
    readonly Seedance20WithoutModerationVideoEdit: "seedance-2.0-without-moderation-video-edit";
    readonly Seedance20WithoutModerationVideoExtend: "seedance-2.0-without-moderation-video-extend";
    readonly Seedance25: "seedance-2.5";
    readonly Seedance25VideoEdit: "seedance-2.5-video-edit";
    readonly Seedance25VideoExtend: "seedance-2.5-video-extend";
    readonly SeedanceI2v: "seedance-i2v";
    readonly Seedream40: "seedream-4.0";
    readonly Seedream45: "seedream-4.5";
    readonly Seedream47: "seedream-4.7";
    readonly Seedream50Lite: "seedream-5.0-lite";
    readonly Seedream50Pro: "seedream-5.0-pro";
    readonly Sora2: "sora-2";
    readonly Sora2Extend: "sora-2-extend";
    readonly Sora2Pro: "sora-2-pro";
    readonly TopazUpscaleImage: "topaz-upscale-image";
    readonly TopazUpscaleVideo: "topaz-upscale-video";
    readonly VeedFabricV1: "veed-fabric-v1";
    readonly VeedFabricV1Fast: "veed-fabric-v1-fast";
    readonly Veo31: "veo-3.1";
    readonly Veo31Fast: "veo-3.1-fast";
    readonly Veo31Lite: "veo-3.1-lite";
    readonly Wan26Image: "wan-2.6-image";
    readonly Wan26R2v: "wan-2.6-r2v";
    readonly Wan26T2v: "wan-2.6-t2v";
    readonly Wan27I2v: "wan-2.7-i2v";
    readonly Wan27R2v: "wan-2.7-r2v";
    readonly Wan27T2v: "wan-2.7-t2v";
    readonly Wan27VideoEdit: "wan-2.7-video-edit";
    readonly Wan30Video: "wan-3.0-video";
    readonly Wan30VideoPrime: "wan-3.0-video-prime";
    /** @deprecated Use the `catalog` accessor (`catalog.all()` / `catalog.find({ output, provider })`) instead. */
    readonly list: (filter?: ModelFilter) => ModelDefinition[];
    /** @deprecated Use `Model(id).validate(input)` instead. */
    readonly validate: (model: string, input: unknown) => ValidationResult;
    /** @deprecated Use `Model(id).params().toSchema()` instead. */
    readonly toSchema: (id: string) => ModelParamSchema;
    /** @deprecated Use `Model(id).params().file(key)` instead. */
    readonly getFileParam: (id: string, key: string) => {
        required: boolean;
        max: number;
        label?: string;
        accept?: string;
    } | null;
    /** @deprecated Use `Model(id).params().hasParam(key)` instead. */
    readonly hasParam: (id: string, key: string) => boolean;
};

/**
 * Default voice ids for the catalog-bound TTS params. The voice LISTS are not
 * bundled: options come from the platform catalog tasks at runtime
 * (`ai.catalogs.voices`) — the workers cache them and answer fast.
 */

declare function getVoiceById(id: string): VoiceOption | undefined;
/** @deprecated Load the model's catalog instead (`ai.catalogs.voices(modelId)`) — loaded voices are searched automatically. */
declare function getVoiceById(id: string, extra: VoiceOption[] | undefined): VoiceOption | undefined;

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
 * The single error type thrown by the SDK's generation surface —
 * `generate()`, `generateText()`, `submit()`, and `result()`.
 *
 * Unrelated to the `Api*` types (`ApiResponse`, `ApiRunOptions`, …), which
 * describe the low-level `ai.apis` surface. `ai.apis.run()` throws the
 * workflows client's own errors, not this.
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
declare function _find(filter: ModelFilter$1): ModelDescriptor[];
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

/** All models from all vendors. */
declare const ALL_MODELS: ModelDefinition[];
/**
 * Models for a generation mode. By default returns only default-visible models
 * (production / general-availability — preview, disabled and deprecated are
 * hidden). `includeDisabled = true` returns every model of the mode, bypassing
 * all gates. For release-tier filtering use `catalog.find({ output, release })`.
 */
declare const getModelsByMode: (mode: ModelDefinition["mode"], includeDisabled?: boolean) => ModelDefinition[];

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
 * `disabled` and `deprecated` are hard hides layered on top of `release`: a
 * model carrying either is never visible, regardless of its release tag or the
 * requested set. (`disabled` is being phased out in favour of
 * `release: 'preview'`, but is still honoured during the migration.)
 */
declare function isVisibleForReleases(m: ModelDefinition, releases?: readonly ReleaseTag[]): boolean;

/** Look up a model by its ID or vendor modelId. */
declare const getModel: (id: string) => ModelDefinition | undefined;
/** Find a model by ID, workflow name, or display name (case-insensitive). */
declare const findModel: (ref: string) => ModelDefinition | undefined;

/**
 * Effect scenes that require two input images (e.g. hugs, kisses, swaps).
 * @deprecated Read `meta.imageSlots` on the `kling/v1/catalog/templates`
 * catalog items instead — this frozen copy is no longer maintained and will be
 * removed in the next major.
 */
declare const KLING_DUAL_IMAGE_EFFECTS: ReadonlySet<string>;

export { ALL_MODELS, type AiClient, ApiError, type ApiErrorCode, type ApiErrorInit, type ApiResponse, type ApiRunOptions, type ApiSchemas, type ApisClient, type AppIdentity, type AppType, type AuthenticatedFetch, type AvatarOption, type BooleanDescriptor, type BooleanEntry, type CatalogDescriptor, type CatalogEntry, type CatalogItem, type CatalogKind, type CatalogPage, type CatalogPageOptions, type CatalogPreview, type CatalogQuery, type CatalogResult, type CatalogSource, type CatalogsClient, type CatalogsOptions, type ClientConfig, type CreditRange, type CreditRangeContext, type CreditTier, type CreditUsage, DEFAULT_VISIBLE_RELEASES, type DeepLinkResult, type DriveAttributes, type DriveClient, type DriveConfig, type DriveFile, type DriveFileDetails, type DriveFolder, type DriveMediaItem, type DriveSaveResult, type EntryMeta, type EnumDescriptor, type EnumEntry, type EnumOption, type FileDescriptor, type FileEntry, type FlatParamEntry, type GenerateOptions, type GenerateResult, type GenerateResultItem, type GenerateTextResult, type GenerationContext, type GenerationFile, type GenerationMode, KLING_DUAL_IMAGE_EFFECTS, type ListOptions, type MediaModelId, type MediaTypeFilter, Model, type ModelDefinition, type ModelDescriptor, type ModelFilter$1 as ModelFilter, type ModelInput, type ModelInputById, type ModelMeta, type ModelParams, type ModelParamsAccessor, Models, type ObjectDescriptor, type ObjectEntry, type ParamDescriptor, type ParamEntry, type ParamOption, type PayloadDriveFolderOptions, type PayloadDriveOptions, type PricingOptions, type ProviderInfo, type RangeDescriptor, type RangeEntry, type ReleaseTag, type SaveParams, type SdkPayload, type SdkTransport, type TextDescriptor, type TextEntry, type TextModelId, type TextModelInputById, type ToolUsage, type TypedModelId, type UserReaction, type ValidationResult$1 as ValidationResult, type VoiceOption, type WorkflowJobHandle, buildFilename, buildGenerationAttributes, catalog, createClient, decodeDeepLinkPayload, encodeDeepLinkPayload, findModel, getModel, getModelsByMode, getVoiceById, inferResourceType, isVisibleForReleases, parseGeneration, releaseOf, toAvatarOption, toVoiceOption };

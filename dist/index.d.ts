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
interface WorkflowStatusResult<TResult = unknown> {
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
        voiceId?: "cca0e076-94b9-4c6d-86b7-546168f11174" | "f493c663-b272-493e-8b78-72d2262a2a8d" | "317bf805-4b42-417b-9474-10807e2f67c9" | "3950360d-4810-4c65-a0b8-eb5b4b3b4231" | "a6268eaf-976d-4d44-871d-57e1d58002c7" | "84905ece-2420-47b5-b3d6-964e62200c73" | "a44e2f09-6897-4e1e-8573-631207c53f6d" | "8f7ad606-26df-400a-8336-e7162a977be7" | "c8dab279-6c67-468c-977d-ce4081fa3936" | "054c9aed-4786-4fa5-a317-09abd199e21f" | "ef932845-cfe9-4748-a123-454664076938" | "cfc8833a-dc45-40e9-9279-57cad23e3c09" | "5d20dd0a-a781-43ea-b06c-56892a691715" | "46ffc709-542b-409c-a8a9-aa5d3e0e1cfc" | "e5a67eaf-6e5a-4488-9fb9-4806bd7fea54" | "c01e9ac9-dc1b-4263-9b70-091f919c05f4" | "d7eb91fb-c2a7-45fd-b65a-80b8b499be7f" | "3f1e185f-6e91-4253-b94a-d8b53f6214be" | "8288f28a-a3f4-4792-a26e-d762fc2263b9" | "854eef1c-9aae-41ae-8849-2a32b9b349bb" | "a5e830d5-e543-4250-9724-a24c452fa248" | "15a92057-54a7-4bb8-979c-38f44581fb8c" | "f57e9942-4d9e-4b05-8a0c-585359eef0dd" | "965d9bd7-9e95-4cdd-a798-80a5233705bd" | "66254e55-d74a-4b23-a12a-cccdd14a25a0" | "8bab777e-1a1e-43d8-915d-eaafcb446e9d" | "2d83227c-1abf-47c0-902d-f82448bdc598" | "4a7876f0-5fb4-4ed8-a104-890bc30d9832" | "f7f4fee8-845b-49d2-be7e-6ff7c8706b55" | "b355a1d2-f989-4e62-a997-5de0bb2aa841" | "ee89b03c-5275-488a-b5d2-ca5ca364e857" | "fb9cc041-75e5-4ac5-ae7f-c763f1e54797" | "c81384a9-3dce-48d2-bb5b-b0875f2db37e" | "9e5001fa-5367-4f6d-a079-6bfc0ddbff69" | "17486b3b-2ffb-43e7-9d81-3ed3d147a497" | "44523faf-3c13-469e-961e-eb7c5496cb90" | "350bf05c-7858-49c1-859e-ef1e657d43f2" | "8788ac4f-2156-40ce-8030-7a9a0a9b9161" | "348aff4f-dff7-4871-81d5-fc31c3d90ef6" | "b976d8b2-e1f8-4c22-b6ba-87ce392f0f01" | "0aef6559-9098-4860-8224-13e038ab3aef" | "1e5d72bd-4a36-4abe-9b57-15dfc2b3841c" | "20180bd3-4f7a-4d83-9599-9a40c282ef04" | "66318ebc-62a9-437a-989a-9bd148ec829a" | "dfa6d420-4742-452f-b2fb-5d7ba0c3852e" | "9e9a769b-a283-4b03-93a5-bee4a5bd62bc" | "2808aed4-85d9-4b61-87d9-daefdaad29af" | "d8acc796-5d2c-475c-ae8e-2f1c8158490c" | "059fee9c-51a5-4db9-8c8c-1ff1ede29cf1" | "6d891f84-452e-4412-a72a-f00eea0f1fd7" | "6112718a-871e-46f6-abb3-d0cdd1f4368a" | "544ba1a4-4a04-4b93-9aaf-fadb09fed104" | "9f5d9d57-b7bb-4ee3-b627-d7402ed00d15" | "721d6b30-7601-4643-9447-6de1be2bd92e" | "f161bd60-c617-44b0-8275-7f879c96e86c" | "610df5e1-2fa1-42e8-8dcd-988d2ec2d8f3" | "3f38104f-9327-4554-873d-7f092caf1256" | "07c10ae2-0007-4551-841d-f8dcbee53433" | "5f41badd-5f53-4460-a5b2-63dda5503490" | "a8915cb1-a587-4313-841a-ddc74ff17050" | "3010fa3f-897a-41e7-a426-a06f29f61f78" | "8abd608c-b8d3-4193-8d54-9976911a337c" | "43064fb0-6723-4f2c-a311-eaf6a5d2f0e5" | "adf91049-3cab-4e62-b40c-be00fe34e0e6" | "04da033a-8919-4553-8fc5-eb6869e0c0e1" | "9f2e03d7-714d-48a5-a0e7-58c2b7efad23" | "c1820aa0-467e-4b13-8f73-418f950dba51" | "befbed31-f461-4bdc-8900-fe786fbeffc3" | "d7979182-36b7-4ae5-8284-1962050da404" | "0e8463d7-5e80-47bf-b900-3bbf4e3e564a" | "b0641d1a-e342-41d0-8a56-63781d487ca3" | "34123cc6-9377-4a13-8b4c-ed274cbe317a" | "4c71b60f-357f-4569-9867-cd1ce4ff58c8" | "d1a08ee2-2706-4743-898c-882238036c81" | "c6db469b-929f-4066-896c-165f60d09162" | "be6bbe5d-5f45-4ad8-bec9-ed6a7cdf5311" | "aa40e5b8-af38-4f88-ab43-1fd5ca9749c6" | "7cd2e6c8-a8f8-4115-a757-9397c0127e50" | "7a3ef29d-8962-4722-adfb-fda21e0d821e" | "13616e5f-6fda-4247-b548-8821cb71fb54" | "041937f9-3a23-4eef-a206-7c1656243825" | "fb8c1498-1d6b-446c-891e-163a79e6d817" | "f912f511-6b44-46dd-bd40-be3031201561" | "f5b7eb43-2365-410a-95e0-beb92768809c" | "f26d400a-a7ff-4522-b098-485b2f34b123" | "f26c8c45-049e-46c7-a6bd-b217d9255d3e" | "ec82ea24-3249-4981-a28f-65a78d2a2cd0" | "ec4f77d4-60fa-4707-a094-ad18fdfbaa97" | "e8490197-0f00-4089-8b7f-e32f331a6edf" | "e7e88155-71c0-4e51-a3b4-8022468f7eca" | "e590a00d-1925-4759-aea8-21e3beabafac" | "e4db0c1b-f72d-494c-baa8-43c44d5765b6" | "e486f733-9769-4f8a-a8e2-d39e4e3eab81" | "e0f39dc4-f691-4e78-bba5-5c636692cc04" | "e098922a-9410-4d96-8e3c-402e26f7160b" | "df05515b-b647-4b60-9387-b0642c51b235" | "dd063dd5-c566-437e-b82a-a4f98eae1f38" | "dbf08c3e-d33a-4afb-bdb3-0f024a687d19" | "db21e50c-9c85-4177-9bb2-9bf177890e44" | "d7114790-534e-4007-b80d-6d176230553c";
        container?: "mp3" | "wav" | "raw";
        sampleRate?: number;
        encoding?: "pcm_s16le" | "pcm_f32le";
        bitRate?: number;
    };
    "bytedance-omnihuman-v1.5": {
        prompt?: string;
        imageUrls: [string, ...string[]];
        audioUrl: string;
    };
    "bytedance-video-upscaler": {
        videoUrl: string;
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
        language?: string;
        accent?: string;
    };
    "eleven-multilingual-sts-v2": {
        audioUrl: string;
        voiceId?: "JBFqnCBsd6RMkjVDRZzb" | "EkK5I93UQWFDigLMpZcX" | "RILOU7YmBhvwJGDGjNmP" | "Z3R5wn05IrDiVCyEkUrK" | "NNl6r8mD7vthiJatiJt1" | "Bj9UqZbhQsanLzgalpEG" | "exsUS4vynmxd379XN4yO" | "BpjGufoPiobT79j2vtj4" | "kdmDKE6EkgrWrrykO9Qt" | "1SM7GgM6IMuvQlz2BwM3" | "ouL9IsyrSnUkCmfnD02u" | "5l5f8iK3YPeGga21rQIX" | "scOwDtmlUjD3prqpp97I" | "19STyYD15bswVz51nqLf" | "BZgkqPqms7Kj9ulSkVzn" | "wo6udizrrtpIxWGp2qJk" | "yjJ45q8TVCrtMhEKurxY" | "gU0LNdkMOQCOrPrwtbee" | "DGzg6RaUqxGRTHSBjfgF" | "x70vRnQBMBu4FAYhjJbO";
        language?: string;
        accent?: string;
        removeBackgroundNoise?: boolean;
    };
    "eleven-multilingual-v2": {
        language?: string;
        accent?: string;
        prompt: string;
        voiceId?: "JBFqnCBsd6RMkjVDRZzb" | "EkK5I93UQWFDigLMpZcX" | "RILOU7YmBhvwJGDGjNmP" | "Z3R5wn05IrDiVCyEkUrK" | "NNl6r8mD7vthiJatiJt1" | "Bj9UqZbhQsanLzgalpEG" | "exsUS4vynmxd379XN4yO" | "BpjGufoPiobT79j2vtj4" | "kdmDKE6EkgrWrrykO9Qt" | "1SM7GgM6IMuvQlz2BwM3" | "ouL9IsyrSnUkCmfnD02u" | "5l5f8iK3YPeGga21rQIX" | "scOwDtmlUjD3prqpp97I" | "19STyYD15bswVz51nqLf" | "BZgkqPqms7Kj9ulSkVzn" | "wo6udizrrtpIxWGp2qJk" | "yjJ45q8TVCrtMhEKurxY" | "gU0LNdkMOQCOrPrwtbee" | "DGzg6RaUqxGRTHSBjfgF" | "x70vRnQBMBu4FAYhjJbO";
    };
    "eleven-sts-v2": {
        audioUrl: string;
        voiceId?: "JBFqnCBsd6RMkjVDRZzb" | "EkK5I93UQWFDigLMpZcX" | "RILOU7YmBhvwJGDGjNmP" | "Z3R5wn05IrDiVCyEkUrK" | "NNl6r8mD7vthiJatiJt1" | "Bj9UqZbhQsanLzgalpEG" | "exsUS4vynmxd379XN4yO" | "BpjGufoPiobT79j2vtj4" | "kdmDKE6EkgrWrrykO9Qt" | "1SM7GgM6IMuvQlz2BwM3" | "ouL9IsyrSnUkCmfnD02u" | "5l5f8iK3YPeGga21rQIX" | "scOwDtmlUjD3prqpp97I" | "19STyYD15bswVz51nqLf" | "BZgkqPqms7Kj9ulSkVzn" | "wo6udizrrtpIxWGp2qJk" | "yjJ45q8TVCrtMhEKurxY" | "gU0LNdkMOQCOrPrwtbee" | "DGzg6RaUqxGRTHSBjfgF" | "x70vRnQBMBu4FAYhjJbO";
        removeBackgroundNoise?: boolean;
    };
    "eleven-v3": {
        language?: string;
        accent?: string;
        prompt: string;
        voiceId?: "JBFqnCBsd6RMkjVDRZzb" | "EkK5I93UQWFDigLMpZcX" | "RILOU7YmBhvwJGDGjNmP" | "Z3R5wn05IrDiVCyEkUrK" | "NNl6r8mD7vthiJatiJt1" | "Bj9UqZbhQsanLzgalpEG" | "exsUS4vynmxd379XN4yO" | "BpjGufoPiobT79j2vtj4" | "kdmDKE6EkgrWrrykO9Qt" | "1SM7GgM6IMuvQlz2BwM3" | "ouL9IsyrSnUkCmfnD02u" | "5l5f8iK3YPeGga21rQIX" | "scOwDtmlUjD3prqpp97I" | "19STyYD15bswVz51nqLf" | "BZgkqPqms7Kj9ulSkVzn" | "wo6udizrrtpIxWGp2qJk" | "yjJ45q8TVCrtMhEKurxY" | "gU0LNdkMOQCOrPrwtbee" | "DGzg6RaUqxGRTHSBjfgF" | "x70vRnQBMBu4FAYhjJbO";
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
        voiceId?: "JBFqnCBsd6RMkjVDRZzb" | "EkK5I93UQWFDigLMpZcX" | "RILOU7YmBhvwJGDGjNmP" | "Z3R5wn05IrDiVCyEkUrK" | "NNl6r8mD7vthiJatiJt1" | "Bj9UqZbhQsanLzgalpEG" | "exsUS4vynmxd379XN4yO" | "BpjGufoPiobT79j2vtj4" | "kdmDKE6EkgrWrrykO9Qt" | "1SM7GgM6IMuvQlz2BwM3" | "ouL9IsyrSnUkCmfnD02u" | "5l5f8iK3YPeGga21rQIX" | "scOwDtmlUjD3prqpp97I" | "19STyYD15bswVz51nqLf" | "BZgkqPqms7Kj9ulSkVzn" | "wo6udizrrtpIxWGp2qJk" | "yjJ45q8TVCrtMhEKurxY" | "gU0LNdkMOQCOrPrwtbee" | "DGzg6RaUqxGRTHSBjfgF" | "x70vRnQBMBu4FAYhjJbO";
        prompt: string;
    };
    "elevenlabs-music-v2": {
        prompt: string;
        duration?: 10 | 20 | 30 | 60 | 120 | 180 | 300 | 600;
        isInstrumental?: boolean;
    };
    "elevenlabs-sfx": {
        prompt: string;
        duration?: 1 | 3 | 5 | 8 | 10 | 15;
    };
    "flux-2-flex": {
        prompt: string;
        aspectRatio?: "1:1" | "5:3" | "3:5" | "4:3" | "3:4";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "flux-2-max": {
        prompt: string;
        aspectRatio?: "1:1" | "5:3" | "3:5" | "4:3" | "3:4";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "flux-2-pro": {
        prompt: string;
        aspectRatio?: "1:1" | "5:3" | "3:5" | "4:3" | "3:4";
        count?: 1 | 2 | 4 | 6 | 8 | 10;
        imageUrls?: string[];
    };
    "flux-3-video": {
        prompt: string;
        model?: "flux-3-preview-high" | "flux-3-preview-optimized";
        aspectRatio?: "auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21";
        resolution?: "480p" | "720p";
        duration?: "auto" | "5" | "10" | "15" | "20";
        startFrame?: string;
        endFrame?: string;
        imageUrls?: string[];
        videoUrl?: string;
        videoUrls?: string[];
        generateAudio?: boolean;
        grounding?: boolean;
        seed?: number;
        version?: string;
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
        voiceId?: "Aoede" | "Charon" | "Fenrir" | "Kore" | "Leda" | "Orus" | "Puck" | "Zephyr" | "Achernar" | "Achird" | "Algenib" | "Algieba" | "Alnilam" | "Autonoe" | "Despina" | "Enceladus" | "Erinome" | "Gacrux" | "Iapetus" | "Laomedeia" | "Pulcherrima" | "Rasalgethi" | "Sadachbia" | "Sadaltager" | "Schedar" | "Sulafat" | "Umbriel" | "Vindemiatrix" | "Zubenelgenubi";
    };
    "gemini-2.5-pro-tts": {
        language?: string;
        accent?: string;
        prompt: string;
        voiceId?: "Aoede" | "Charon" | "Fenrir" | "Kore" | "Leda" | "Orus" | "Puck" | "Zephyr" | "Achernar" | "Achird" | "Algenib" | "Algieba" | "Alnilam" | "Autonoe" | "Despina" | "Enceladus" | "Erinome" | "Gacrux" | "Iapetus" | "Laomedeia" | "Pulcherrima" | "Rasalgethi" | "Sadachbia" | "Sadaltager" | "Schedar" | "Sulafat" | "Umbriel" | "Vindemiatrix" | "Zubenelgenubi";
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
        imageUrls: [string, ...string[]];
    };
    "grok-tts": {
        language?: string;
        accent?: string;
        prompt: string;
        voiceId?: "eve" | "ara" | "rex" | "sal" | "leo";
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
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        resolution?: "720P" | "1080P";
        duration?: 5 | 10 | 15;
        imageUrls: [string, ...string[]];
    };
    "happyhorse-1.0-t2v": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        resolution?: "720P" | "1080P";
        duration?: 5 | 10 | 15;
        startFrame?: string;
    };
    "happyhorse-1.0-video-edit": {
        prompt: string;
        resolution?: "720P" | "1080P";
        audioSetting?: "auto" | "origin";
        videoUrl: string;
        imageUrls?: string[];
    };
    "happyhorse-1.1-r2v": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        resolution?: "720P" | "1080P";
        duration?: 5 | 10 | 15;
        imageUrls: [string, ...string[]];
    };
    "happyhorse-1.1-t2v": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        resolution?: "720P" | "1080P";
        duration?: 5 | 10 | 15;
        startFrame?: string;
    };
    "heygen-talking-photo": {
        imageUrls: [string, ...string[]];
        resolution?: "4k" | "1080p" | "720p";
        aspectRatio?: "16:9" | "9:16";
        prompt: string;
    };
    "heygen-video-avatar": {
        resolution?: "4k" | "1080p" | "720p";
        aspectRatio?: "16:9" | "9:16";
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
    "imagen-4.0": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "3:4" | "4:3";
        count?: 1 | 2 | 4;
        enhancePrompt?: boolean;
        negativePrompt?: string;
    };
    "imagen-4.0-fast": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "3:4" | "4:3";
        count?: 1 | 2 | 4;
        enhancePrompt?: boolean;
        negativePrompt?: string;
    };
    "imagen-4.0-ultra": {
        prompt: string;
        aspectRatio?: "1:1" | "16:9" | "9:16" | "3:4" | "4:3";
        count?: 1 | 2 | 4;
        enhancePrompt?: boolean;
        negativePrompt?: string;
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
        resolution?: "720p" | "1080p";
        renderingSpeed?: "std" | "pro";
        characterOrientation?: "image" | "video";
        keepOriginalSound?: "yes" | "no";
        imageUrls: [string, ...string[]];
        videoUrl: string;
    };
    "kling-motion-control-v3": {
        prompt?: string;
        resolution?: "720p" | "1080p";
        renderingSpeed?: "std" | "pro";
        characterOrientation?: "image" | "video";
        keepOriginalSound?: "yes" | "no";
        imageUrls: [string, ...string[]];
        videoUrl: string;
    };
    "kling-multi-image": {
        prompt?: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
        count?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
        imageUrls: [string, ...string[]];
        sceneImage?: string;
        styleImage?: string;
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
    "kling-v1-5-image": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
        count?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
        negativePrompt?: string;
        imageUrls: [string, ...string[]];
        imageReference?: "subject" | "face";
        imageWeight?: number;
        humanFidelity?: number;
    };
    "kling-v2-1-image": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
        count?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
        negativePrompt?: string;
        imageUrls?: string[];
        imageWeight?: number;
        humanFidelity?: number;
    };
    "kling-v2-6": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1";
        duration?: 5 | 10;
        startFrame?: string;
        endFrame?: string;
        negativePrompt?: string;
        generateAudio?: boolean;
        cfgScale?: number;
        renderingSpeed?: "std" | "pro";
    };
    "kling-v2-image": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
        count?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
        negativePrompt?: string;
        imageUrls?: string[];
        imageWeight?: number;
        humanFidelity?: number;
    };
    "kling-v2-new-image": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
        count?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
        negativePrompt?: string;
        imageUrls: [string, ...string[]];
        imageReference?: "subject" | "face";
        imageWeight?: number;
        humanFidelity?: number;
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
        staticMask?: string;
        renderingSpeed?: "std" | "pro" | "4k";
    };
    "kling-v3-omni": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1";
        duration?: 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
        resolution?: "720p" | "1080p" | "4k";
        renderingSpeed?: "std" | "pro";
        generateAudio?: boolean;
        multiShot?: boolean;
        shotType?: "customize";
        multiPrompt?: Array<{
            index: number;
            prompt: string;
            duration: string;
        }>;
        omniImageList?: Array<{
            image_url: string;
            type?: "first_frame" | "end_frame";
        }>;
        omniVideoList?: Array<{
            video_url: string;
            refer_type: "feature" | "base";
            keep_original_sound: "yes" | "no";
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
        staticMask?: string;
    };
    "kling-video-effects": {
        style?: "korean_baseball" | "pet_skateboard" | "daily_ootd" | "tiny_beast_printer" | "landmark_reveal" | "winter_charm" | "flash_ride" | "maestro_of_magic" | "magic_carpet_ride" | "good_luck_spirit" | "shooting_star" | "sparkler_wand" | "sovereign_scepter" | "dirt_rush" | "return_of_the_king" | "dance_with_dragon" | "minimalist_light" | "martial_meow" | "sassy_shake" | "knock_at_a_door_revenge" | "palm_sized_figure_pro" | "prank_box" | "perler_beads" | "spring_bloom" | "toss_run" | "switch_to_silk" | "get_rich_quick" | "make_it_rain" | "twist_shake" | "the_hip_sway" | "send_my_love" | "funky_martian" | "wealth_drive" | "the_high_kick" | "the_exercise" | "lucky_veggie" | "studio_look" | "flash_drive" | "shush_my_dreams" | "french_elegance" | "finger_swipe" | "advent_of_flora" | "smooth_transition" | "kiss_pro" | "raid_check" | "snow_night_kiss" | "eternal_kiss" | "fortune_in_motion" | "chinese_trend" | "sedan_chair_dance" | "skyfall" | "good_luck_dance" | "laicai_dance" | "yangge_dance" | "color_mixing" | "palm_sized_figure" | "lantern_festival_cuju" | "unique_firework" | "unique_spring_couplets" | "horse_mask" | "fortune_knocks_cartoon" | "tangyuan_to_animal" | "hot_feet_dance" | "swag_dance" | "pigeon_dance" | "bloodline_dance" | "chanel_dance" | "cute_dance" | "love_theme_song" | "pumpitup_dance" | "city_to_village" | "fortune_god_transform" | "new_year_feast" | "ring_in_new" | "horse_year_firework" | "pet_vlogger" | "crystal_horse" | "lateral_shift_transition" | "drunk_dance" | "drunk_dance_pet" | "daoma_dance" | "bouncy_dance" | "smooth_sailing_dance" | "new_year_greeting" | "lion_dance" | "prosperity" | "great_success" | "golden_horse_fortune" | "red_packet_box" | "lucky_horse_year" | "lucky_red_packet" | "lucky_money_come" | "lion_dance_pet" | "dumpling_making_pet" | "fish_making_pet" | "pet_red_packet" | "lantern_glow" | "expression_challenge" | "overdrive" | "heart_gesture_dance" | "poping" | "martial_arts" | "running" | "nezha" | "motorcycle_dance" | "subject_3_dance" | "ghost_step_dance" | "phantom_jewel" | "zoom_out" | "cheers_2026" | "fight_pro" | "hug_pro" | "heart_gesture_pro" | "dollar_rain_pro" | "pet_bee_pro" | "countdown_teleport" | "santa_random_surprise" | "magic_match_tree" | "bullet_time_360" | "happy_birthday" | "birthday_star" | "thumbs_up_pro" | "tiger_hug_pro" | "pet_lion_pro" | "surprise_bouquet" | "bouquet_drop" | "3d_cartoon_1_pro" | "firework_2026" | "glamour_photo_shoot" | "box_of_joy" | "first_toast_of_the_year" | "my_santa_pic" | "santa_gift" | "steampunk_christmas" | "snowglobe" | "christmas_photo_shoot" | "ornament_crash" | "santa_express" | "instant_christmas" | "particle_santa_surround" | "coronation_of_frost" | "building_sweater" | "spark_in_the_snow" | "scarlet_and_snow" | "cozy_toon_wrap" | "bullet_time_lite" | "magic_cloak" | "balloon_parade" | "jumping_ginger_joy" | "bullet_time" | "c4d_cartoon_pro" | "pure_white_wings" | "black_wings" | "golden_wing" | "pink_pink_wings" | "venomous_spider" | "throne_of_king" | "luminous_elf" | "woodland_elf" | "japanese_anime_1" | "american_comics" | "guardian_spirit" | "swish_swish" | "snowboarding" | "witch_transform" | "vampire_transform" | "pumpkin_head_transform" | "demon_transform" | "mummy_transform" | "zombie_transform" | "cute_pumpkin_transform" | "cute_ghost_transform" | "knock_knock_halloween" | "halloween_escape" | "baseball" | "inner_voice" | "a_list_look" | "memory_alive" | "trampoline" | "trampoline_night" | "pucker_up" | "guess_what" | "feed_mooncake" | "rampage_ape" | "flyer" | "dishwasher" | "pet_chinese_opera" | "magic_fireball" | "gallery_ring" | "pet_moto_rider" | "muscle_pet" | "squeeze_scream" | "pet_delivery" | "running_man" | "disappear" | "mythic_style" | "steampunk" | "3d_cartoon_2" | "eagle_snatch" | "hug_from_past" | "firework" | "media_interview" | "pet_chef" | "santa_gifts" | "santa_hug" | "heart_gesture_1" | "pet_wizard" | "smoke_smoke" | "instant_kid" | "dollar_rain" | "cry_cry" | "building_collapse" | "gun_shot" | "mushroom" | "double_gun" | "pet_warrior" | "lightning_power" | "jesus_hug" | "shark_alert" | "long_hair" | "lie_flat" | "polar_bear_hug" | "brown_bear_hug" | "jazz_jazz" | "office_escape_plow" | "fly_fly" | "watermelon_bomb" | "pet_dance" | "boss_coming" | "wool_curly" | "pet_bee" | "marry_me" | "swing_swing" | "day_to_night" | "piggy_morph" | "wig_out" | "car_explosion" | "ski_ski" | "siblings" | "construction_worker" | "let's_ride" | "snatched" | "magic_broom" | "felt_felt" | "jumpdrop" | "surfsurf" | "fairy_wing" | "angel_wing" | "dark_wing" | "skateskate" | "plushcut" | "jelly_press" | "jelly_slice" | "jelly_squish" | "jelly_jiggle" | "pixelpixel" | "yearbook" | "instant_film" | "anime_figure" | "rocketrocket" | "bloombloom" | "dizzydizzy" | "fuzzyfuzzy" | "squish" | "expansion" | "emoji" | "tennis_trend" | "whirling_beverage" | "f1_live" | "football_live" | "spielberg_transition";
        imageUrls: [string, ...string[]];
    };
    "kling-video-o1": {
        prompt: string;
        aspectRatio?: "16:9" | "9:16" | "1:1";
        duration?: 5 | 10;
        resolution?: "720p" | "1080p";
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
    "minimax-music-v2": {
        prompt: string;
        lyricsPrompt?: string;
        lyricsOptimizer?: boolean;
        isInstrumental?: boolean;
        outputFormat?: "url" | "hex";
    };
    "openai-tts-1": {
        prompt: string;
        voiceId?: "alloy" | "ash" | "ballad" | "coral" | "echo" | "fable" | "nova" | "onyx" | "sage" | "shimmer" | "verse";
    };
    "openai-tts-1-hd": {
        prompt: string;
        voiceId?: "alloy" | "ash" | "ballad" | "coral" | "echo" | "fable" | "nova" | "onyx" | "sage" | "shimmer" | "verse";
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
    "picsart-flux-2-klein": {
        prompt: string;
        aspectRatio?: "1:1" | "5:3" | "3:5" | "4:3" | "3:4";
        imageUrls?: string[];
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
        count?: 1 | 2 | 4 | 6 | 8 | 10;
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
    };
    "qwen-image-3.0": {
        prompt: string;
        negativePrompt?: string;
        resolution?: "2048x2048" | "2688x1536" | "1536x2688" | "2368x1728" | "1728x2368";
        count?: 1 | 2 | 4 | 6;
        enhancePrompt?: boolean;
        imageUrls?: string[];
        promptExtendMode?: "direct" | "agent";
    };
    "qwen-image-edit-plus": {
        prompt: string;
        imageUrls: [string, ...string[]];
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
        voiceId?: "victoria" | "vincent" | "clara" | "drew" | "skye" | "max" | "morgan" | "felix" | "mia" | "marcus" | "summer" | "ruby" | "aurora" | "jasper" | "leo" | "adrian" | "nina" | "emma" | "blake" | "david" | "maya" | "nathan" | "sam" | "georgia" | "petra" | "adam" | "zach" | "violet" | "roman" | "luna";
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
        voiceId?: "zh_female_vv_uranus_bigtts" | "zh_female_xiaohe_uranus_bigtts" | "en_female_stokie_uranus_bigtts" | "en_female_dacey_uranus_bigtts" | "en_male_tim_uranus_bigtts" | "zh_male_m191_uranus_bigtts" | "zh_male_taocheng_uranus_bigtts" | "zh_male_sophie_uranus_bigtts" | "zh_female_yingyujiaoxue_uranus_bigtts" | "zh_male_dayi_uranus_bigtts" | "zh_female_mizai_uranus_bigtts" | "zh_female_jitangnv_uranus_bigtts" | "zh_female_meilinvyou_uranus_bigtts" | "zh_female_liuchangnv_uranus_bigtts" | "zh_male_ruyayichen_uranus_bigtts" | "zh_female_cancan_uranus_bigtts" | "zh_female_tianmeixiaoyuan_uranus_bigtts" | "zh_female_tianmeitaozi_uranus_bigtts" | "zh_female_shuangkuaisisi_uranus_bigtts" | "zh_female_peiqi_uranus_bigtts" | "zh_female_xiaoxue_uranus_bigtts" | "zh_female_yuanqi_uranus_bigtts" | "zh_female_kefunvsheng_uranus_bigtts" | "zh_male_shaonianzixin_uranus_bigtts" | "zh_female_linjianvhai_uranus_bigtts" | "zh_female_kiwi_uranus_bigtts" | "zh_female_sajiaoxuemei_uranus_bigtts" | "de_male_seven_uranus_bigtts" | "jp_female_minimi_uranus_bigtts" | "fr_male_usseau_uranus_bigtts" | "es_male_felipe_uranus_bigtts" | "id_male_han_uranus_bigtts" | "pt_male_martins_uranus_bigtts" | "it_male_enzo_uranus_bigtts" | "kr_male_shane_uranus_bigtts" | "zh_male_liufei_uranus_bigtts" | "zh_female_qingxinnvsheng_uranus_bigtts" | "zh_male_sunwukong_uranus_bigtts" | "en_male_adam-imitation_uranus_bigtts" | "en_male_alberto_uranus_bigtts" | "en_male_alex_uranus_bigtts" | "en_female_allison_uranus_bigtts" | "en_female_authoritative-british_uranus_bigtts" | "en_female_authoritative-informative_uranus_bigtts" | "en_male_bill-jones_uranus_bigtts" | "en_male_bill_jones_corey_uranus_bigtts" | "en_male_brad_pitt_p1_uranus_bigtts" | "en_female_brittney_uranus_bigtts" | "en_female_brittney_pimintel_uranus_bigtts" | "en_male_bruce_uranus_bigtts" | "en_male_chandler_p1_uranus_bigtts" | "en_male_cowboy-bob_uranus_bigtts" | "en_male_cowboy_john_b_uranus_bigtts" | "en_male_david_uranus_bigtts" | "en_male_deep-voice_uranus_bigtts" | "en_male_diyuwenrounan_uranus_bigtts" | "en_male_evil-guy-oxley_uranus_bigtts" | "en_male_excited-male-voice_uranus_bigtts" | "en_male_father-christmas_uranus_bigtts" | "en_female_female_tutor_ms-jenny_uranus_bigtts" | "en_male_fernando-martinez_uranus_bigtts" | "en_male_godfather_uranus_bigtts" | "en_male_gollum_uranus_bigtts" | "en_male_hades_uranus_bigtts" | "en_female_hayley_uranus_bigtts" | "en_male_jamie_uranus_bigtts" | "en_female_jane_uranus_bigtts" | "en_female_jenny_uranus_bigtts" | "en_male_jidongchuanjiaoshi_uranus_bigtts" | "en_male_jimmy_uranus_bigtts" | "en_female_joanne_uranus_bigtts" | "en_male_joker_uranus_bigtts" | "en_male_josh_uranus_bigtts" | "en_male_josh_coery_uranus_bigtts" | "en_male_kevin_uranus_bigtts" | "en_male_knightley_uranus_bigtts" | "en_female_lana_del_rey_kelley_d_p1_uranus_bigtts" | "en_female_lana_del_rey_parky_s_p1_uranus_bigtts" | "en_male_marcus_uranus_bigtts" | "en_female_mel_uranus_bigtts" | "en_male_michael_uranus_bigtts" | "en_male_michael-mouse_uranus_bigtts" | "en_male_michael_kevin_uranus_bigtts" | "en_male_motivational-coach_uranus_bigtts" | "en_female_myra_uranus_bigtts" | "en_female_myra_cmb_uranus_bigtts" | "en_female_nadia_uranus_bigtts" | "en_female_natasha_uranus_bigtts" | "en_female_pleasant-female_uranus_bigtts" | "en_female_rachel_p1_uranus_bigtts" | "en_male_ronald_uranus_bigtts" | "en_male_russell_uranus_bigtts" | "en_female_scarlet_p1_uranus_bigtts" | "en_female_sharron_uranus_bigtts" | "en_male_simba_p1_uranus_bigtts" | "en_female_skye_uranus_bigtts" | "en_male_tom_hiddleston_p1_uranus_bigtts" | "en_male_valentino_uranus_bigtts" | "en_male_valentino_corey_uranus_bigtts" | "en_female_wenrouzhishijieshuonv_uranus_bigtts" | "en_female_xinwenjieshuonv_uranus_bigtts" | "en_male_yangguangjieshuonan_uranus_bigtts" | "en_female_zendaya_p1_uranus_bigtts" | "ja_female_bv024_uranus_bigtts" | "ja_female_bv520_uranus_bigtts" | "ja_female_bv521_uranus_bigtts" | "ja_female_bv522_uranus_bigtts" | "ja_female_bv523_uranus_bigtts" | "ja_male_bv524_uranus_bigtts" | "ja_female_minimi_uranus_bigtts" | "ja_female_shirou_uranus_bigtts" | "de_female_bv081_uranus_bigtts" | "de_male_sven_uranus_bigtts" | "es_female_bv084_uranus_bigtts" | "es_male_dani_uranus_bigtts" | "es_male_guillem_uranus_bigtts" | "es_female_ht_mx_f6_uranus_bigtts" | "mx_female_bv065_uranus_bigtts" | "mx_male_bv165dialogue_uranus_bigtts" | "mx_male_bv165narrator_uranus_bigtts" | "mx_female_bv166dialogue_uranus_bigtts" | "mx_female_bv166emotion_uranus_bigtts" | "mx_female_bv166narrator_uranus_bigtts" | "mx_male_felipe_uranus_bigtts" | "mx_male_ht_mx_m012_uranus_bigtts" | "mx_female_leslie_uranus_bigtts" | "mx_male_marcelo_uranus_bigtts" | "fr_female_fr_bv078_uranus_bigtts" | "fr_female_fr_f47_uranus_bigtts" | "fr_male_fr_m29_uranus_bigtts" | "id_male_bv160_uranus_bigtts" | "id_male_bv160dialogue_uranus_bigtts" | "id_male_bv160narration_uranus_bigtts" | "id_female_bv161_uranus_bigtts" | "id_female_bv161dialogue_uranus_bigtts" | "id_female_bv161narration_uranus_bigtts" | "id_female_bv164_uranus_bigtts" | "id_male_bv164dialogue_uranus_bigtts" | "id_male_bv164narration_uranus_bigtts" | "id_female_f20_uranus_bigtts" | "id_male_m08_uranus_bigtts" | "id_female_phulia_uranus_bigtts" | "pt_male_bv172_uranus_bigtts" | "pt_male_bv172dialogue_uranus_bigtts" | "pt_male_bv172emotion_uranus_bigtts" | "pt_male_bv172narrator_uranus_bigtts" | "pt_female_bv173_uranus_bigtts" | "pt_female_bv173dialogue_uranus_bigtts" | "pt_female_bv173emotion_uranus_bigtts" | "pt_female_bv173narrator_uranus_bigtts" | "pt_female_bv530_uranus_bigtts" | "pt_male_bv531_uranus_bigtts" | "pt_female_mari_uranus_bigtts" | "pt_male_rael_uranus_bigtts" | "ar_female_dina_uranus_bigtts" | "ar_female_fatma_uranus_bigtts" | "ar_male_youssef_uranus_bigtts" | "tl_female_annika_uranus_bigtts" | "tl_male_ed_uranus_bigtts" | "tl_female_hervie_uranus_bigtts" | "ko_male_bv545_uranus_bigtts" | "ko_female_bv546_uranus_bigtts" | "ko_male_m03_uranus_bigtts" | "ko_male_shane_uranus_bigtts" | "ms_male_ham_uranus_bigtts" | "ms_male_naim_uranus_bigtts" | "ru_female_af07_uranus_bigtts" | "ru_female_irinae_uranus_bigtts" | "ru_male_pavel_uranus_bigtts" | "ru_female_sophie_uranus_bigtts" | "ru_male_vlad_uranus_bigtts" | "th_female_bv568_angry_uranus_bigtts" | "th_female_bv568_fear_uranus_bigtts" | "th_female_bv568_happy_uranus_bigtts" | "th_female_bv568_hate_uranus_bigtts" | "th_female_bv568_neutral_uranus_bigtts" | "th_female_bv568_sad_uranus_bigtts" | "th_female_bv568_suprise_uranus_bigtts" | "vi_female_hong_uranus_bigtts" | "vi_female_ling_uranus_bigtts" | "vi_female_linh_uranus_bigtts" | "vi_female_partner_uranus_bigtts" | "vi_female_ruan_uranus_bigtts" | "vi_female_wu_uranus_bigtts" | "vi_male_wumg_uranus_bigtts";
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
        cfgScale?: number;
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
    };
    "wan-2.7-r2v": {
        prompt: string;
        duration?: 5 | 10;
        resolution?: "720P" | "1080P";
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        negativePrompt?: string;
        imageUrls: [string, ...string[]];
        videoUrl: string;
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
    };
    "wan-2.7-video-edit": {
        prompt?: string;
        resolution?: "720P" | "1080P";
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        negativePrompt?: string;
        videoUrl: string;
        imageUrls?: string[];
    };
};
type TypedModelId = keyof ModelInputById;
type ModelInput<M extends TypedModelId> = ModelInputById[M];
/** IDs of text-generation (LLM) models — narrows generateText(). */
type TextModelId = "claude-haiku-4-5" | "claude-opus-4-8" | "claude-sonnet-4-6" | "gemini-3-pro" | "gemini-3.5-flash-lite" | "gemini-3.6-flash" | "gpt-5.5";
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
    /** Raw parsed output — carries usage, finish reason, thinking trace, etc. */
    raw: unknown;
}
/** Options for individual generate() / submit() calls. */
interface GenerateOptions {
    signal?: AbortSignal;
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
interface RangeDescriptor {
    kind: 'range';
    min: number;
    max: number;
    step?: number;
    default: number;
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
     * Max intrinsic short-side length (pixels) accepted for an image/video file —
     * `min(width, height)` must not exceed this. Used by upscalers whose source
     * must stay below the target resolution. Enforced client-side at upload by
     * measuring the media before it is sent; the backend worker stays the
     * authoritative gate. Omit for no client-side ceiling.
     */
    maxShortSidePixels?: number;
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
type ParamDescriptor = EnumDescriptor<string> | EnumDescriptor<number> | RangeDescriptor | BooleanDescriptor | TextDescriptor | FileDescriptor | ObjectDescriptor;
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
    /** Release / availability tier (EAI-3). Absent on the definition ⇒ `'production'`. */
    readonly release: ReleaseTag;
}
/** Parameter operations — fluent access to model params, schemas, defaults. */
interface ModelParamsAccessor {
    param(key: string): (EntryMeta & ParamDescriptor) | undefined;
    hasParam(key: string): boolean;
    all(): FlatParamEntry[];
    enum(key: string): EnumEntry | undefined;
    range(key: string): RangeEntry | undefined;
    boolean(key: string): BooleanEntry | undefined;
    text(key: string): TextEntry | undefined;
    file(key: string): FileEntry | undefined;
    prompt(): TextEntry | undefined;
    aspectRatio(): EnumEntry | undefined;
    duration(): EnumEntry | undefined;
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
}
/** Optional context to narrow the credit range by resolution / audio. */
interface CreditRangeContext {
    resolution?: string;
    generateAudio?: boolean;
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
    /** Get the credit range for this model. Pass context to narrow by
     *  resolution/audio. Returns the per-unit range — callers with time-based
     *  parameters should scale by the value themselves (e.g. multiply by
     *  duration when range.unit === 'second'). Returns null if pricing is not loaded. */
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

type AppProvider = 'picsart' | 'google' | 'kling' | 'grok' | 'openai' | 'flux' | 'ideogram' | 'elevenlabs' | 'minimax' | 'wan' | 'seedance' | 'ltx' | 'seedream' | 'seedaudio' | 'hunyuan' | 'pika' | 'runway' | 'luma' | 'ovi' | 'creatify' | 'veed' | 'bytedance' | 'qwen' | 'reve' | 'recraft' | 'videography' | 'topaz' | 'heygen' | 'happyhorse' | 'pixverse' | 'anthropic' | 'async';
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
    /** Qwen 3.0 — prompt-rewrite strategy (`direct`/`agent`), sent as `prompt_extend_mode`. */
    promptExtendMode?: 'direct' | 'agent';
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
}

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
    readonly BytedanceVideoUpscaler: "bytedance-video-upscaler";
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
    readonly Gemini25FlashImage: "gemini-2.5-flash-image";
    readonly Gemini25FlashTts: "gemini-2.5-flash-tts";
    readonly Gemini25ProTts: "gemini-2.5-pro-tts";
    readonly Gemini3Pro: "gemini-3-pro";
    readonly Gemini3ProImage: "gemini-3-pro-image";
    readonly Gemini31FlashImage: "gemini-3.1-flash-image";
    readonly Gemini31FlashLiteImage: "gemini-3.1-flash-lite-image";
    readonly Gemini35FlashLite: "gemini-3.5-flash-lite";
    readonly Gemini36Flash: "gemini-3.6-flash";
    readonly GeminiOmniFlashPreview: "gemini-omni-flash-preview";
    readonly Gpt55: "gpt-5.5";
    readonly GptImage1: "gpt-image-1";
    readonly GptImage15: "gpt-image-1.5";
    readonly GptImage2: "gpt-image-2";
    readonly GrokEditVideo: "grok-edit-video";
    readonly GrokExtendVideo: "grok-extend-video";
    readonly GrokImagineImage: "grok-imagine-image";
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
    readonly IdeogramV3: "ideogram-v3";
    readonly IdeogramV4: "ideogram-v4";
    readonly Imagen40: "imagen-4.0";
    readonly Imagen40Fast: "imagen-4.0-fast";
    readonly Imagen40Ultra: "imagen-4.0-ultra";
    readonly Kling30Image: "kling-3.0-image";
    readonly KlingAvatar: "kling-avatar";
    readonly KlingElements: "kling-elements";
    readonly KlingMotionControl: "kling-motion-control";
    readonly KlingMotionControlV3: "kling-motion-control-v3";
    readonly KlingMultiImage: "kling-multi-image";
    readonly KlingMultiImageV21: "kling-multi-image-v2-1";
    readonly KlingO1Image: "kling-o1-image";
    readonly KlingT2a: "kling-t2a";
    readonly KlingV15Image: "kling-v1-5-image";
    readonly KlingV21Image: "kling-v2-1-image";
    readonly KlingV26: "kling-v2-6";
    readonly KlingV2Image: "kling-v2-image";
    readonly KlingV2NewImage: "kling-v2-new-image";
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
    readonly MinimaxMusicV2: "minimax-music-v2";
    readonly OpenaiTts1: "openai-tts-1";
    readonly OpenaiTts1Hd: "openai-tts-1-hd";
    readonly Ovi: "ovi";
    readonly PicsartChangeBg: "picsart-change-bg";
    readonly PicsartEnhance: "picsart-enhance";
    readonly PicsartFlux2Klein: "picsart-flux-2-klein";
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
    readonly QwenImageEditPlus: "qwen-image-edit-plus";
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
    readonly Recraftv4Vector: "recraftv4_vector";
    readonly Reve: "reve";
    readonly RunwayAleph2: "runway-aleph2";
    readonly RunwayAvatarVideo: "runway-avatar-video";
    readonly RunwayGen3aTurbo: "runway-gen3a-turbo";
    readonly RunwayGen4Aleph: "runway-gen4-aleph";
    readonly RunwayGen4Ref: "runway-gen4-ref";
    readonly RunwayGen45: "runway-gen4.5";
    readonly SeedAudio10: "seed-audio-1.0";
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
    readonly SeedanceI2v: "seedance-i2v";
    readonly Seedream40: "seedream-4.0";
    readonly Seedream45: "seedream-4.5";
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

declare function getVoiceById(id: string, extra?: VoiceOption[]): VoiceOption | undefined;

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
 * `release: 'preview'` — EAI-3 — but is still honoured during the migration.)
 */
declare function isVisibleForReleases(m: ModelDefinition, releases?: readonly ReleaseTag[]): boolean;

/** Look up a model by its ID or vendor modelId. */
declare const getModel: (id: string) => ModelDefinition | undefined;
/** Find a model by ID, workflow name, or display name (case-insensitive). */
declare const findModel: (ref: string) => ModelDefinition | undefined;

/** Effect scenes that require two input images (e.g. hugs, kisses, swaps). */
declare const KLING_DUAL_IMAGE_EFFECTS: ReadonlySet<string>;

export { ALL_MODELS, type AiClient, type ApiResponse, type ApiRunOptions, type ApiSchemas, type ApisClient, type AppIdentity, type AppType, type AuthenticatedFetch, type AvatarOption, type BooleanDescriptor, type BooleanEntry, type ClientConfig, type CreditRange, type CreditRangeContext, DEFAULT_VISIBLE_RELEASES, type DeepLinkResult, type DriveAttributes, type DriveClient, type DriveConfig, type DriveFile, type DriveFileDetails, type DriveFolder, type DriveMediaItem, type DriveSaveResult, type EntryMeta, type EnumDescriptor, type EnumEntry, type EnumOption, type FileDescriptor, type FileEntry, type FlatParamEntry, type GenerateOptions, type GenerateResult, type GenerateResultItem, type GenerateTextResult, type GenerationContext, type GenerationFile, type GenerationMode, KLING_DUAL_IMAGE_EFFECTS, type ListOptions, type MediaModelId, type MediaTypeFilter, Model, type ModelDefinition, type ModelDescriptor, type ModelFilter$1 as ModelFilter, type ModelInput, type ModelInputById, type ModelMeta, type ModelParams, type ModelParamsAccessor, Models, type ObjectDescriptor, type ObjectEntry, type ParamDescriptor, type ParamEntry, type ParamOption, type PayloadDriveFolderOptions, type PayloadDriveOptions, type PricingOptions, type ProviderInfo, type RangeDescriptor, type RangeEntry, type ReleaseTag, type SaveParams, type SdkPayload, type SdkTransport, type TextDescriptor, type TextEntry, type TextModelId, type TextModelInputById, type TypedModelId, type UserReaction, type ValidationResult$1 as ValidationResult, type VoiceOption, type WorkflowJobHandle, buildFilename, buildGenerationAttributes, catalog, createClient, decodeDeepLinkPayload, encodeDeepLinkPayload, findModel, getModel, getModelsByMode, getVoiceById, inferResourceType, isVisibleForReleases, parseGeneration, releaseOf };

interface CheckTextCommand {
    text: string;
    touchpoint?: CheckTextTouchpointEnum;
    countryCode?: CheckTextCountryCodeEnum;
    additionalInfo?: Record<string, unknown>;
}
type CheckTextTouchpointEnum = "all" | "search" | "hashtag_discovery" | "discovery" | "hashtag_page" | "photo_description" | "collection_name" | "username" | "user_display_name" | "user_about_me" | "comments" | "external_remove" | "home_recommendation" | "email" | "email_domain" | "corporate_email" | "search_suggestions" | "text_to_image";
type CheckTextCountryCodeEnum = "global" | "ax" | "ad" | "af" | "aq" | "al" | "dz" | "ao" | "ai" | "ag" | "as" | "ar" | "am" | "aw" | "au" | "at" | "az" | "bs" | "bh" | "bd" | "bb" | "by" | "be" | "bz" | "bj" | "bm" | "bt" | "bo" | "ba" | "bw" | "br" | "vg" | "bn" | "bg" | "bf" | "bi" | "bl" | "kh" | "cm" | "ca" | "cv" | "ky" | "td" | "cl" | "cn" | "co" | "cd" | "cg" | "cr" | "ci" | "hr" | "cw" | "cu" | "cy" | "cz" | "dk" | "dm" | "do" | "ec" | "eg" | "sv" | "ee" | "sz" | "et" | "fj" | "fi" | "fr" | "ga" | "gm" | "ge" | "de" | "gh" | "gr" | "gd" | "gt" | "gw" | "gy" | "ht" | "hn" | "hk" | "hu" | "is" | "in" | "id" | "ir" | "iq" | "ie" | "il" | "it" | "jm" | "jp" | "jo" | "kz" | "ke" | "kp" | "xk" | "kw" | "kg" | "la" | "lv" | "lb" | "lr" | "ly" | "li" | "lt" | "lu" | "mo" | "mg" | "mw" | "my" | "mv" | "ml" | "mt" | "mr" | "mu" | "mx" | "fm" | "md" | "mn" | "me" | "ms" | "ma" | "mz" | "mm" | "na" | "nr" | "np" | "nl" | "nz" | "ni" | "ne" | "ng" | "mk" | "no" | "om" | "pk" | "pw" | "pa" | "pg" | "py" | "pe" | "ph" | "pl" | "pt" | "qa" | "ro" | "ru" | "rw" | "st" | "sa" | "sn" | "rs" | "sc" | "sl" | "sg" | "sk" | "si" | "sb" | "za" | "kr" | "es" | "lk" | "kn" | "lc" | "vc" | "sr" | "se" | "ch" | "tw" | "tj" | "tz" | "th" | "tg" | "to" | "tt" | "tn" | "tr" | "tm" | "tc" | "ug" | "ua" | "ae" | "gb" | "us" | "uy" | "uz" | "vu" | "ve" | "vn" | "ye" | "zm" | "zw" | "re" | "bq" | "bv" | "cc" | "cf" | "ck" | "cx" | "dj" | "eh" | "er" | "fk" | "fo" | "gf" | "gg" | "gi" | "gl" | "gn" | "gp" | "gq" | "gs" | "gu" | "hm" | "im" | "io" | "je" | "ki" | "km" | "ls" | "mc" | "mf" | "mh" | "mp" | "mq" | "nc" | "nf" | "nu" | "pf" | "pm" | "pn" | "pr" | "ps" | "sd" | "sh" | "sj" | "sm" | "so" | "ss" | "sx" | "sy" | "tf" | "tk" | "tl" | "tv" | "um" | "va" | "vi" | "wf" | "ws" | "yt";
interface CheckTextResultModel {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: CheckTextResult;
}
interface CheckTextResult {
    checkStatus: CheckTextStatus;
}
type CheckTextStatus = "ok" | "restricted" | "report";

interface FileCopyCommand {
    url: string;
    destination: string;
    manipulationOptions?: ManipulationOptions;
    persist?: boolean;
}
interface ManipulationOptions {
    type?: string;
    to?: string;
    r?: string;
}
interface FileCopyResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MediaUrl;
}
interface MediaUrl {
    url: string;
    mimeType: string;
}

interface GeminiCommand$1 {
    contents: Content$2[];
    generationConfig?: GenerationConfig$2;
    model?: GeminiModel$1;
    tools?: Record<string, unknown>[];
}
interface Content$2 {
    parts: GeminiPart$2[];
    role?: string;
}
interface GeminiPart$2 {
    text?: string;
    imageUrl?: string;
    audioUrl?: string;
    type?: string;
    fileData?: GeminiPartFileData$2;
    inlineData?: PartInlineData$3;
    functionCall?: Record<string, unknown>;
    functionResponse?: Record<string, unknown>;
    thought?: boolean;
    thoughtSignature?: string;
    partMetadata?: Record<string, unknown>;
    videoMetadata?: Record<string, unknown>;
}
interface GeminiPartFileData$2 {
    mimeType?: string;
    fileUri?: string;
}
interface PartInlineData$3 {
    mimeType?: string;
    data?: string;
}
interface GenerationConfig$2 {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    candidateCount?: number;
    responseMimeType?: string;
    imageConfig?: ImageConfig$2;
    responseModalities?: ("Text" | "Image" | "Audio")[];
    thinkingConfig?: ThinkingConfig$4;
    speechConfig?: SpeechConfig$2;
}
interface ImageConfig$2 {
    aspectRatio?: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9" | "1:4" | "4:1" | "1:8" | "8:1";
    imageSize?: "0.5K" | "1K" | "2K" | "4K";
}
interface ThinkingConfig$4 {
    thinkingBudget?: number;
    includeThoughts?: boolean;
    thinkingLevel?: ThinkingLevel$4;
}
type ThinkingLevel$4 = "MINIMAL" | "LOW" | "MEDIUM" | "HIGH";
interface SpeechConfig$2 {
    voiceConfig?: VoiceConfig$2;
    multiSpeakerVoiceConfig?: MultiSpeakerVoiceConfig$2;
}
interface VoiceConfig$2 {
    prebuiltVoiceConfig: PrebuiltVoiceConfig$2;
}
interface PrebuiltVoiceConfig$2 {
    voiceName: PrebuiltVoiceName$3;
}
type PrebuiltVoiceName$3 = "Puck" | "Kore" | "Charon" | "Fenrir" | "Aoede" | "Leda" | "Zephyr" | "Orus" | "Autonoe" | "Callirhoe" | "Despina" | "Erinome" | "Gacrux" | "Laomedeia" | "Pulcherrima" | "Sulafat" | "Vindemiatrix" | "Achernar" | "Achird" | "Algenib" | "Algieba" | "Alnilam" | "Enceladus" | "Iapetus" | "Rasalgethi" | "Sadachbia" | "Sadaltager" | "Schedar" | "Umbriel" | "Zubenelgenubi";
interface MultiSpeakerVoiceConfig$2 {
    speakerVoiceConfigs: SpeakerVoiceConfig$2[];
}
interface SpeakerVoiceConfig$2 {
    speaker: string;
    voiceConfig: VoiceConfig$2;
}
type GeminiModel$1 = "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-2.5-flash-image-preview" | "gemini-2.5-flash-image" | "gemini-2.5-flash-lite-preview-06-17" | "gemini-2.0-flash" | "gemini-2.0-flash-preview-image-generation" | "gemini-2.0-flash-lite" | "gemini-1.5-flash" | "gemini-1.5-flash-8b" | "gemini-1.5-pro" | "gemini-embedding-exp" | "gemini-3-pro" | "gemini-3-pro-preview" | "gemini-3.1-pro-preview" | "gemini-3.1-flash-lite" | "gemini-3-pro-image-preview" | "gemini-3.1-flash-image-preview" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image" | "gemini-2.5-flash-tts" | "gemini-2.5-pro-tts" | "instant-ramen";
interface GeminiResult$1 {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeminiResponse$1;
}
interface GeminiResponse$1 {
    candidates: GeminiResponseCandidate$1[];
}
interface GeminiResponseCandidate$1 {
    content: GeminiResponseContent$1;
    finishReason: string;
    index: number;
}
interface GeminiResponseContent$1 {
    parts: GeminiPart$2[];
}

interface ChatCompletionsCommand$1 {
    model: "gpt-5" | "gpt-5-search-api" | "gpt-5.1" | "gpt-5.1-chat-latest" | "gpt-5.2" | "gpt-5.2-pro" | "gpt-5.3-codex" | "gpt-5.4" | "gpt-5.4-pro" | "gpt-5.4-mini" | "gpt-5.4-nano" | "gpt-5.5" | "gpt-5.5-pro" | "gpt-5.6-sol" | "gpt-5.6-terra" | "gpt-5.6-luna" | "gpt-5-pro" | "gpt-5-mini" | "gpt-5-nano" | "gpt-4o" | "gpt-4o-mini" | "gpt-4.1" | "gpt-4.1-mini" | "gpt-4.1-nano" | "gpt-4o-search-preview" | "gpt-o3" | "gpt-o3-mini" | "claude-sonnet-4-0" | "claude-opus-4-0" | "claude-3-7-sonnet-latest" | "claude-3-5-sonnet-latest" | "claude-sonnet-4-5" | "claude-sonnet-4-5-latest" | "claude-sonnet-4-6" | "claude-sonnet-5" | "claude-opus-4-8" | "claude-3-5-haiku-latest" | "claude-haiku-4-5" | "claude-fable-5" | "gemini-3-pro-preview" | "gemini-3.1-pro-preview" | "gemini-3.5-flash" | "gemini-3.1-flash-lite" | "gemini-2.0-flash-001" | "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-2.0-flash-lite";
    messages: MessageParam[];
    temperature?: number;
    max_completion_tokens?: number;
    reasoning_effort?: ReasoningEffort;
    tool_choice?: ToolChoiceParam | "none" | "auto" | "required";
    tools?: FunctionTool[];
    service_tier?: ServiceTier;
}
interface MessageParam {
    name?: string;
    role: "developer" | "system" | "user" | "assistant" | "tool";
    content: MessageContentParam[];
}
interface MessageContentParam {
    type: "text" | "image_url" | "file";
    image_url?: ImageUrlDto;
    text?: string;
    file?: FileContentDto;
}
interface ImageUrlDto {
    url: string;
}
interface FileContentDto {
    file_data?: string;
    file_id?: string;
    filename?: string;
    file_url?: string;
}
type ReasoningEffort = "low" | "medium" | "high";
interface ToolChoiceParam {
    type: string;
    function: ToolChoiceFunction;
}
interface ToolChoiceFunction {
    name: string;
}
interface FunctionTool {
    name?: string;
    description?: string;
    parameters?: Record<string, unknown>;
    strict?: boolean;
    type: string;
}
type ServiceTier = "auto" | "flex" | "priority" | "default";
interface ChatCompletionResponse {
    result: ChatCompletionResult;
}
interface ChatCompletionResult {
    id: string;
    created: number;
    model: "gpt-5" | "gpt-5-search-api" | "gpt-5.1" | "gpt-5.1-chat-latest" | "gpt-5.2" | "gpt-5.2-pro" | "gpt-5.3-codex" | "gpt-5.4" | "gpt-5.4-pro" | "gpt-5.4-mini" | "gpt-5.4-nano" | "gpt-5.5" | "gpt-5.5-pro" | "gpt-5.6-sol" | "gpt-5.6-terra" | "gpt-5.6-luna" | "gpt-5-pro" | "gpt-5-mini" | "gpt-5-nano" | "gpt-4o" | "gpt-4o-mini" | "gpt-4.1" | "gpt-4.1-mini" | "gpt-4.1-nano" | "gpt-4o-search-preview" | "gpt-o3" | "gpt-o3-mini" | "claude-sonnet-4-0" | "claude-opus-4-0" | "claude-3-7-sonnet-latest" | "claude-3-5-sonnet-latest" | "claude-sonnet-4-5" | "claude-sonnet-4-5-latest" | "claude-sonnet-4-6" | "claude-sonnet-5" | "claude-opus-4-8" | "claude-3-5-haiku-latest" | "claude-haiku-4-5" | "claude-fable-5" | "gemini-3-pro-preview" | "gemini-3.1-pro-preview" | "gemini-3.5-flash" | "gemini-3.1-flash-lite" | "gemini-2.0-flash-001" | "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-2.0-flash-lite";
    choices: Choice[];
    usage: Usage$1;
}
interface Choice {
    index: number;
    message: ChoiceMessage;
    finish_reason: "stop" | "length" | "tool_calls" | "content_filter" | "function_call";
}
interface ChoiceMessage {
    role: string;
    content: string;
    tool_calls?: ToolCall$1[];
}
interface ToolCall$1 {
    id: string;
    type: string;
    function: ToolCallFunction;
}
interface ToolCallFunction {
    name: string;
    arguments: Record<string, unknown>;
}
interface Usage$1 {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details?: PromptTokensDetails;
    completion_tokens_details?: CompletionTokensDetails;
}
interface PromptTokensDetails {
    cached_tokens?: number;
    audio_tokens?: number;
}
interface CompletionTokensDetails {
    reasoning_tokens?: number;
    audio_tokens?: number;
    accepted_prediction_tokens?: number;
    rejected_prediction_tokens?: number;
}

interface OpenAIResponsesCommand {
    model: OpenAiResponsesModels;
    input?: InputMessage[];
    tools?: (FileSearchTool | WebSearchTool | ResponsesFunctionTool | ComputerUseTool | McpTool)[];
    tool_choice?: ToolChoiceType;
    text?: Record<string, unknown>;
    instructions?: string;
    temperature?: number;
    max_tokens?: number;
}
type OpenAiResponsesModels = "gpt-5" | "gpt-5.1" | "gpt-5-codex" | "gpt-5-mini" | "gpt-5-nano" | "gpt-4o" | "gpt-4o-mini" | "gpt-4.1" | "gpt-4.1-mini" | "gpt-4.1-nano" | "gpt-4o-search-preview" | "gpt-o3" | "gpt-o3-mini";
interface InputMessage {
    role: "user" | "assistant" | "system" | "developer";
    content: string | (TextInputItem | ImageInputItem | FileInputItem)[];
}
interface TextInputItem {
    type: "input_text";
    text: string;
}
interface ImageInputItem {
    type: "input_text" | "input_image" | "input_file";
    detail?: "low" | "high" | "auto";
    image_url?: string;
    file_id?: string;
}
interface FileInputItem {
    type: "input_text" | "input_image" | "input_file";
    file_url?: string;
    file_id?: string;
    filename?: string;
}
interface FileSearchTool {
    type: "file_search";
    vector_store_ids: string[];
    filters?: Record<string, unknown>;
    max_num_results?: number;
    ranking_options?: RankingOptions;
}
interface RankingOptions {
    ranker?: "auto";
    score_threshold?: number;
}
interface WebSearchTool {
    type: "web_search_preview" | "web_search_preview_2025_03_11";
    search_context_size?: "low" | "medium" | "high";
    user_location?: UserLocation;
}
interface UserLocation {
    type: "approximate";
    city?: string;
    country?: string;
    region?: string;
    timezone?: string;
}
interface ResponsesFunctionTool {
    type: "function";
    name: string;
    parameters: Record<string, unknown>;
    strict: boolean;
    description?: string;
}
interface ComputerUseTool {
    type: "computer_use_preview";
    display_height: number;
    display_width: number;
    environment: string;
}
interface McpTool {
    server_label: string;
    server_url: string;
    type: "mcp";
    allowed_tools?: string[];
    headers?: Record<string, unknown>;
    require_approval?: "always" | "never";
    server_description?: string;
}
type ToolChoiceType = "none" | "auto" | "required";
interface OpenAIResponsesResponse {
    result: OpenAIResponsesResult;
}
interface OpenAIResponsesResult {
    id: string;
    model: string;
    output: OutputItem[];
    output_text: string;
    text: ResponseText;
}
interface OutputItem {
    type: "message";
    content: OutputItemContent[];
}
interface OutputItemContent {
    type: "refusal" | "output_text";
    text?: string;
}
interface ResponseText {
    type: "text" | "json_object";
    text?: string;
    object?: Record<string, unknown>;
}

interface OpenaiImagesGenerateCommand {
    model: "dall-e-3" | "gpt-image-1" | "gpt-image-1.5" | "gpt-image-2";
    prompt: string;
    n?: number;
    size?: string;
    quality?: "low" | "medium" | "high";
    output_format?: "png" | "webp" | "jpeg";
    output_compression?: number;
    moderation?: string;
    background?: string;
    partial_images?: number;
    options?: GenAIOptions$22;
}
interface GenAIOptions$22 {
    safety_checks?: SafetyChecksOptions$22;
    drive?: DriveOptions$22;
}
interface SafetyChecksOptions$22 {
    enabled?: boolean;
}
interface DriveOptions$22 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$22;
}
interface DriveFolderOptions$22 {
    path?: string;
    id?: string;
}
interface OpenaiImagesGenerateResponse {
    result: OpenaiImageGenerateResult;
}
interface OpenaiImageGenerateResult {
    created: string;
    data: ImageDataResponse[];
}
interface ImageDataResponse {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface ImagenCommand {
    model?: Models;
    mode?: "imagen_edit" | "imagen_generate";
    editMode?: "EDIT_MODE_INPAINT_INSERTION" | "EDIT_MODE_INPAINT_REMOVAL";
    image?: string;
    mask?: string;
    maskDilation?: number;
    editingSteps?: number;
    sampleCount?: number;
    blendingMode?: string;
    blendingFactor?: number;
    prompt?: string;
    seed?: number;
    enhancePrompt?: boolean;
    negativePrompt?: string;
    aspectRatio?: string;
    personGeneration?: string;
    options?: GenAIOptions$21;
}
type Models = "imagen-3.0-capability-001" | "imagen-3.0-capability-002" | "imagen-4.0-generate-preview-06-06" | "imagen-4.0-ultra-generate-preview-06-06" | "imagen-4.0-fast-generate-preview-06-06" | "imagen-4.0-generate-001" | "imagen-4.0-ultra-generate-001" | "imagen-4.0-fast-generate-001";
interface GenAIOptions$21 {
    safety_checks?: SafetyChecksOptions$21;
    drive?: DriveOptions$21;
}
interface SafetyChecksOptions$21 {
    enabled?: boolean;
}
interface DriveOptions$21 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$21;
}
interface DriveFolderOptions$21 {
    path?: string;
    id?: string;
}
interface ImagenResponse {
    result: Result;
}
interface Result {
    images: string[];
}

interface GeminiCommand {
    contents: Content$1[];
    generationConfig?: GenerationConfig$1;
    model?: GeminiModel;
    tools?: Record<string, unknown>[];
}
interface Content$1 {
    parts: GeminiPart$1[];
    role?: string;
}
interface GeminiPart$1 {
    text?: string;
    imageUrl?: string;
    audioUrl?: string;
    type?: string;
    fileData?: GeminiPartFileData$1;
    inlineData?: PartInlineData$2;
    functionCall?: Record<string, unknown>;
    functionResponse?: Record<string, unknown>;
    thought?: boolean;
    thoughtSignature?: string;
    partMetadata?: Record<string, unknown>;
    videoMetadata?: Record<string, unknown>;
}
interface GeminiPartFileData$1 {
    mimeType?: string;
    fileUri?: string;
}
interface PartInlineData$2 {
    mimeType?: string;
    data?: string;
}
interface GenerationConfig$1 {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    candidateCount?: number;
    responseMimeType?: string;
    imageConfig?: ImageConfig$1;
    responseModalities?: ("Text" | "Image" | "Audio")[];
    thinkingConfig?: ThinkingConfig$3;
    speechConfig?: SpeechConfig$1;
}
interface ImageConfig$1 {
    aspectRatio?: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9" | "1:4" | "4:1" | "1:8" | "8:1";
    imageSize?: "0.5K" | "1K" | "2K" | "4K";
}
interface ThinkingConfig$3 {
    thinkingBudget?: number;
    includeThoughts?: boolean;
    thinkingLevel?: ThinkingLevel$3;
}
type ThinkingLevel$3 = "MINIMAL" | "LOW" | "MEDIUM" | "HIGH";
interface SpeechConfig$1 {
    voiceConfig?: VoiceConfig$1;
    multiSpeakerVoiceConfig?: MultiSpeakerVoiceConfig$1;
}
interface VoiceConfig$1 {
    prebuiltVoiceConfig: PrebuiltVoiceConfig$1;
}
interface PrebuiltVoiceConfig$1 {
    voiceName: PrebuiltVoiceName$2;
}
type PrebuiltVoiceName$2 = "Puck" | "Kore" | "Charon" | "Fenrir" | "Aoede" | "Leda" | "Zephyr" | "Orus" | "Autonoe" | "Callirhoe" | "Despina" | "Erinome" | "Gacrux" | "Laomedeia" | "Pulcherrima" | "Sulafat" | "Vindemiatrix" | "Achernar" | "Achird" | "Algenib" | "Algieba" | "Alnilam" | "Enceladus" | "Iapetus" | "Rasalgethi" | "Sadachbia" | "Sadaltager" | "Schedar" | "Umbriel" | "Zubenelgenubi";
interface MultiSpeakerVoiceConfig$1 {
    speakerVoiceConfigs: SpeakerVoiceConfig$1[];
}
interface SpeakerVoiceConfig$1 {
    speaker: string;
    voiceConfig: VoiceConfig$1;
}
type GeminiModel = "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-2.5-flash-image-preview" | "gemini-2.5-flash-image" | "gemini-2.5-flash-lite-preview-06-17" | "gemini-2.0-flash" | "gemini-2.0-flash-preview-image-generation" | "gemini-2.0-flash-lite" | "gemini-1.5-flash" | "gemini-1.5-flash-8b" | "gemini-1.5-pro" | "gemini-embedding-exp" | "gemini-3-pro" | "gemini-3-pro-preview" | "gemini-3.1-pro-preview" | "gemini-3.1-flash-lite" | "gemini-3-pro-image-preview" | "gemini-3.1-flash-image-preview" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image" | "gemini-2.5-flash-tts" | "gemini-2.5-pro-tts" | "instant-ramen";
interface GeminiResult {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeminiResponse;
}
interface GeminiResponse {
    candidates: GeminiResponseCandidate[];
}
interface GeminiResponseCandidate {
    content: GeminiResponseContent;
    finishReason: string;
    index: number;
}
interface GeminiResponseContent {
    parts: GeminiPart$1[];
}

interface FileMetadataCommand {
    url: string;
    videoResolution?: boolean;
}
interface FileMetadataResponseModel {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: FileResult;
}
interface FileResult {
    width?: number;
    height?: number;
    mimeType?: string;
    duration?: number;
    size: number;
}

interface OpenaiTranscriptionCommand {
    fileUrl: string;
    model: OpenaiTranscriptionModels;
    language?: string;
    temperature?: number;
    response_format?: OpenaiTranscriptionResponseFormat;
}
type OpenaiTranscriptionModels = "gpt-4o-transcribe" | "gpt-4o-mini-transcribe" | "whisper-1";
type OpenaiTranscriptionResponseFormat = "text" | "srt" | "vtt" | "json" | "verbose_json" | "diarized_json";
interface OpenaiTranscriptionResponse {
    result: OpenaiTranscriptionResult;
}
interface OpenaiTranscriptionResult {
    text: string;
    usage?: Usage;
    segments?: Record<string, unknown>[];
}
interface Usage {
    type: string;
    input_tokens: number;
    input_token_details?: InputTokenDetails;
    output_tokens: number;
    total_tokens: number;
}
interface InputTokenDetails {
    text_tokens: number;
    audio_tokens: number;
}

interface GeminiImagesCommand {
    contents: Content[];
    generationConfig?: GenerationConfig;
    model?: GeminiV1ImageModel;
    count?: number;
    options?: GenAIOptions$20;
}
interface Content {
    parts: GeminiPart[];
    role?: string;
}
interface GeminiPart {
    text?: string;
    imageUrl?: string;
    audioUrl?: string;
    type?: string;
    fileData?: GeminiPartFileData;
    inlineData?: PartInlineData$1;
    functionCall?: Record<string, unknown>;
    functionResponse?: Record<string, unknown>;
    thought?: boolean;
    thoughtSignature?: string;
    partMetadata?: Record<string, unknown>;
    videoMetadata?: Record<string, unknown>;
}
interface GeminiPartFileData {
    mimeType?: string;
    fileUri?: string;
}
interface PartInlineData$1 {
    mimeType?: string;
    data?: string;
}
interface GenerationConfig {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    candidateCount?: number;
    responseMimeType?: string;
    imageConfig?: ImageConfig;
    responseModalities?: ("Text" | "Image" | "Audio")[];
    thinkingConfig?: ThinkingConfig$2;
    speechConfig?: SpeechConfig;
}
interface ImageConfig {
    aspectRatio?: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9" | "1:4" | "4:1" | "1:8" | "8:1";
    imageSize?: "0.5K" | "1K" | "2K" | "4K";
}
interface ThinkingConfig$2 {
    thinkingBudget?: number;
    includeThoughts?: boolean;
    thinkingLevel?: ThinkingLevel$2;
}
type ThinkingLevel$2 = "MINIMAL" | "LOW" | "MEDIUM" | "HIGH";
interface SpeechConfig {
    voiceConfig?: VoiceConfig;
    multiSpeakerVoiceConfig?: MultiSpeakerVoiceConfig;
}
interface VoiceConfig {
    prebuiltVoiceConfig: PrebuiltVoiceConfig;
}
interface PrebuiltVoiceConfig {
    voiceName: PrebuiltVoiceName$1;
}
type PrebuiltVoiceName$1 = "Puck" | "Kore" | "Charon" | "Fenrir" | "Aoede" | "Leda" | "Zephyr" | "Orus" | "Autonoe" | "Callirhoe" | "Despina" | "Erinome" | "Gacrux" | "Laomedeia" | "Pulcherrima" | "Sulafat" | "Vindemiatrix" | "Achernar" | "Achird" | "Algenib" | "Algieba" | "Alnilam" | "Enceladus" | "Iapetus" | "Rasalgethi" | "Sadachbia" | "Sadaltager" | "Schedar" | "Umbriel" | "Zubenelgenubi";
interface MultiSpeakerVoiceConfig {
    speakerVoiceConfigs: SpeakerVoiceConfig[];
}
interface SpeakerVoiceConfig {
    speaker: string;
    voiceConfig: VoiceConfig;
}
type GeminiV1ImageModel = "gemini-2.5-flash-image" | "gemini-3-pro-image-preview" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image" | "gemini-3.1-flash-image-preview" | "gemini-2.5-flash-image-preview" | "instant-ramen";
interface GenAIOptions$20 {
    safety_checks?: SafetyChecksOptions$20;
    drive?: DriveOptions$20;
}
interface SafetyChecksOptions$20 {
    enabled?: boolean;
}
interface DriveOptions$20 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$20;
}
interface DriveFolderOptions$20 {
    path?: string;
    id?: string;
}
interface GeminiV1ImagesResult {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeminiV1ImagesResponse$1;
}
interface GeminiV1ImagesResponse$1 {
    imageUrls: GeminiUrl$1[];
    description: string;
}
interface GeminiUrl$1 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface VirtualTryOnCommand {
    model?: string;
    source: VirtualTryOnSource;
    config?: VirtualTryOnConfig;
    options?: GenAIOptions$1$;
}
interface VirtualTryOnSource {
    personImage: string;
    productImages: string[];
}
interface VirtualTryOnConfig {
    numberOfImages?: number;
    baseSteps?: number;
    fastMode?: boolean;
    seed?: number;
    safetyFilterLevel?: "BLOCK_LOW_AND_ABOVE" | "BLOCK_MEDIUM_AND_ABOVE" | "BLOCK_ONLY_HIGH" | "BLOCK_NONE";
    personGeneration?: "DONT_ALLOW" | "ALLOW_ADULT" | "ALLOW_ALL";
    outputMimeType?: string;
    outputCompressionQuality?: number;
    enhancePrompt?: boolean;
    prompt?: string;
    personDescription?: string;
    productDescription?: string;
}
interface GenAIOptions$1$ {
    safety_checks?: SafetyChecksOptions$1$;
    drive?: DriveOptions$1$;
}
interface SafetyChecksOptions$1$ {
    enabled?: boolean;
}
interface DriveOptions$1$ {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1$;
}
interface DriveFolderOptions$1$ {
    path?: string;
    id?: string;
}
interface VirtualTryOnResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: VirtualTryOnResult;
}
interface VirtualTryOnResult {
    urls: VirtualTryOnUrl[];
}
interface VirtualTryOnUrl {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface OpenAiSoraCommand {
    prompt: string;
    input_reference_url?: string;
    adjust_input_image_ratio?: boolean;
    model?: "sora-2-pro" | "sora-2";
    seconds?: number;
    size?: "720x1280" | "1280x720" | "1024x1792" | "1792x1024" | "1080x1920" | "1920x1080";
    characters?: SoraCharacterReference$1[];
    options?: GenAIOptions$1_;
}
interface SoraCharacterReference$1 {
    id: string;
}
interface GenAIOptions$1_ {
    safety_checks?: SafetyChecksOptions$1_;
    drive?: DriveOptions$1_;
}
interface SafetyChecksOptions$1_ {
    enabled?: boolean;
}
interface DriveOptions$1_ {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1_;
}
interface DriveFolderOptions$1_ {
    path?: string;
    id?: string;
}
interface OpenaiSoraResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: OpenAiSoraResult$2;
}
interface OpenAiSoraResult$2 {
    videoUrl: string;
    videoId: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface ClaudeV1MessagesCommand {
    model: ClaudeV1Models;
    messages: ClaudeMessageParam[];
    max_tokens?: number;
    temperature?: number;
    system?: string | number | boolean | unknown[] | Record<string, unknown>;
    tools?: ClaudeToolSchema[];
    tool_choice?: ClaudeToolChoiceToolParam | "auto" | "any" | "tool";
    service_tier?: "auto" | "flex" | "priority" | "default";
    context_management?: ClaudeContextManagement;
    options?: GenAIOptions$1Z;
}
type ClaudeV1Models = "claude-opus-4-8" | "claude-sonnet-4-5" | "claude-sonnet-4-6" | "claude-sonnet-5" | "claude-3-7-sonnet" | "claude-3-5-sonnet" | "claude-3-5-haiku-latest" | "claude-haiku-4-5" | "claude-sonnet-4-0" | "claude-opus-4-0" | "claude-opus-4-5" | "claude-fable-5";
interface ClaudeMessageParam {
    role: string;
    content: ClaudeContentBlock[];
}
interface ClaudeContentBlock {
    type: ContentBlockTypes;
    text?: string;
    cache_control?: ClaudeCacheControl;
    id?: string;
    name?: string;
    input?: string | number | boolean | unknown[] | Record<string, unknown>;
    tool_use_id?: string;
    content?: ClaudeToolResultContentText[];
    thinking?: string;
    signature?: string;
    source?: ClaudeContentSource;
}
type ContentBlockTypes = "text" | "tool_use" | "tool_result" | "image" | "thinking" | "file" | "document";
interface ClaudeCacheControl {
    type: string;
    ttl?: ClaudeCacheTtl;
}
type ClaudeCacheTtl = "5m" | "1h";
interface ClaudeToolResultContentText {
    type: string;
    text: string;
}
interface ClaudeContentSource {
    type: ClaudeImageType;
    url?: string;
    data?: string;
    media_type?: string;
    file_id?: string;
}
type ClaudeImageType = "base64" | "url" | "file";
interface ClaudeToolSchema {
    name: string;
    description?: string;
    input_schema: string | number | boolean | unknown[] | Record<string, unknown>;
    type: string;
}
interface ClaudeToolChoiceToolParam {
    type: string;
    name: string;
}
interface ClaudeContextManagement {
    edits: ContextManagementEdit[];
}
interface ContextManagementEdit {
    type: string;
    trigger?: ContextCriterion;
    keep?: ContextCriterion | string;
    clear_at_least?: ContextCriterion;
    exclude_tools?: string[];
    clear_tool_inputs?: boolean;
}
interface ContextCriterion {
    type: string;
    value: number;
}
interface GenAIOptions$1Z {
    safety_checks?: SafetyChecksOptions$1Z;
    drive?: DriveOptions$1Z;
}
interface SafetyChecksOptions$1Z {
    enabled?: boolean;
}
interface DriveOptions$1Z {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1Z;
}
interface DriveFolderOptions$1Z {
    path?: string;
    id?: string;
}
type EmptyModel$2 = Record<string, never>;

interface OpenAiImageEditingCommand {
    images: string[];
    prompt: string;
    model: string;
    mask?: string;
    n?: number;
    size?: string;
    quality?: string;
    background?: string;
    input_fidelity?: string;
    output_compression?: number;
    output_format?: string;
    partial_images?: number;
    options?: GenAIOptions$1Y;
}
interface GenAIOptions$1Y {
    safety_checks?: SafetyChecksOptions$1Y;
    drive?: DriveOptions$1Y;
}
interface SafetyChecksOptions$1Y {
    enabled?: boolean;
}
interface DriveOptions$1Y {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1Y;
}
interface DriveFolderOptions$1Y {
    path?: string;
    id?: string;
}
interface OpenAiImageEditingResult {
    result: EditedImageResult;
}
interface EditedImageResult {
    urls: string[];
}

interface ImageToVideoInput$1 {
    enable_prompt_expansion?: boolean;
    duration?: "5" | "10";
    image_url: string;
    seed?: number | unknown;
    negative_prompt?: string | unknown;
    enable_safety_checker?: boolean;
    audio_url?: string | unknown;
    prompt: string;
    resolution?: "480p" | "720p" | "1080p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Wan25PreviewImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: VideoOutput$1;
}
interface VideoOutput$1 {
    video: {
        url: string;
        duration?: number | unknown;
        height?: number | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        width?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
    };
    seed: number;
    actual_prompt?: string | unknown;
}

interface TextToVideoInput$1 {
    enable_prompt_expansion?: boolean;
    duration?: "5" | "10";
    seed?: number | unknown;
    negative_prompt?: string | unknown;
    enable_safety_checker?: boolean;
    aspect_ratio?: "16:9" | "9:16" | "1:1";
    audio_url?: string | unknown;
    prompt: string;
    resolution?: "480p" | "720p" | "1080p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Wan25PreviewTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: VideoOutput;
}
interface VideoOutput {
    video: {
        url: string;
        duration?: number | unknown;
        height?: number | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        width?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
    };
    seed: number;
    actual_prompt?: string | unknown;
}

interface BaseQwenImageInput {
    num_images?: number;
    loras?: {
        path: string;
        scale?: number;
    }[];
    prompt: string;
    use_turbo?: boolean;
    num_inference_steps?: number;
    output_format?: "jpeg" | "png";
    sync_mode?: boolean;
    negative_prompt?: string;
    enable_safety_checker?: boolean;
    acceleration?: "none" | "regular" | "high";
    guidance_scale?: number;
    image_size?: {
        width?: number;
        height?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
    seed?: number | unknown;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface QwenImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenImageOutput$1;
}
interface QwenImageOutput$1 {
    prompt: string;
    seed: number;
    images: ({
        width: number;
        content_type?: string | unknown;
        url: string;
        height: number;
    })[];
    has_nsfw_concepts: boolean[];
    timings: Record<string, number>;
}

interface QwenImageI2IInput {
    image_url: string;
    use_turbo?: boolean;
    num_inference_steps?: number;
    sync_mode?: boolean;
    enable_safety_checker?: boolean;
    acceleration?: "none" | "regular" | "high";
    strength?: number;
    prompt: string;
    loras?: {
        path: string;
        scale?: number;
    }[];
    num_images?: number;
    output_format?: "jpeg" | "png";
    negative_prompt?: string;
    guidance_scale?: number;
    image_size?: {
        width?: number;
        height?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" | unknown;
    seed?: number | unknown;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface QwenImageImageToImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenImageI2IOutput;
}
interface QwenImageI2IOutput {
    prompt: string;
    seed: number;
    images: ({
        width: number;
        content_type?: string | unknown;
        url: string;
        height: number;
    })[];
    has_nsfw_concepts: boolean[];
    timings: Record<string, number>;
}

interface BaseQwenEditImagePlusInput {
    num_inference_steps?: number;
    output_format?: "jpeg" | "png";
    image_urls: string[];
    num_images?: number;
    negative_prompt?: string;
    enable_safety_checker?: boolean;
    guidance_scale?: number;
    image_size?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
    seed?: number | unknown;
    prompt: string;
    sync_mode?: boolean;
    acceleration?: "none" | "regular";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface QwenImageEditPlusResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenImageOutput;
}
interface QwenImageOutput {
    has_nsfw_concepts: boolean[];
    seed: number;
    prompt: string;
    images: ({
        height: number;
        content_type?: string | unknown;
        width: number;
        url: string;
    })[];
    timings: Record<string, number>;
}

interface HunyuanTextToImageInputV3 {
    image_size?: {
        width?: number;
        height?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
    prompt: string;
    enable_safety_checker?: boolean;
    num_inference_steps?: number;
    negative_prompt?: string;
    output_format?: "jpeg" | "png";
    sync_mode?: boolean;
    num_images?: number;
    seed?: number | unknown;
    enable_prompt_expansion?: boolean;
    guidance_scale?: number;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface HunyuanImageV3TextToImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: HunyuanTextToImageV3Output;
}
interface HunyuanTextToImageV3Output {
    seed: number;
    images: ({
        file_name?: string | unknown;
        content_type?: string | unknown;
        width?: number | unknown;
        file_size?: number | unknown;
        height?: number | unknown;
        url: string;
    })[];
}

interface ProTextToVideoHailuo02Input {
    prompt: string;
    prompt_optimizer?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface MinimaxHailuo02ProTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: TextToVideoHailuo02Output;
}
interface TextToVideoHailuo02Output {
    video: {
        url: string;
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
    };
}

interface ProImageToVideoHailuo02Input {
    prompt: string;
    image_url: string;
    end_image_url?: string | unknown;
    prompt_optimizer?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface MinimaxHailuo02ProImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ImageToVideoHailuo02Output;
}
interface ImageToVideoHailuo02Output {
    video: {
        url: string;
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
    };
}

interface LTXV20ImageToVideoRequest {
    generate_audio?: boolean;
    duration?: 6 | 8 | 10;
    fps?: 25 | 50;
    prompt: string;
    image_url: string;
    resolution?: "1080p" | "1440p" | "2160p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Ltxv2ImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXVImageToVideoResponse$1;
}
interface LTXVImageToVideoResponse$1 {
    video: {
        num_frames?: number | unknown;
        height?: number | unknown;
        file_name?: string | unknown;
        duration?: number | unknown;
        fps?: number | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        url: string;
    };
}

interface LTXV20TextToVideoRequest {
    fps?: 25 | 50;
    duration?: 6 | 8 | 10;
    prompt: string;
    generate_audio?: boolean;
    resolution?: "1080p" | "1440p" | "2160p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Ltxv2TextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXVTextToVideoResponse$1;
}
interface LTXVTextToVideoResponse$1 {
    video: {
        num_frames?: number | unknown;
        height?: number | unknown;
        file_name?: string | unknown;
        duration?: number | unknown;
        fps?: number | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        url: string;
    };
}

interface LTXV20ImageToVideoFastRequest {
    generate_audio?: boolean;
    duration?: 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20;
    fps?: 25 | 50;
    prompt: string;
    image_url: string;
    resolution?: "1080p" | "1440p" | "2160p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Ltxv2ImageToVideoFastResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXVImageToVideoResponse;
}
interface LTXVImageToVideoResponse {
    video: {
        num_frames?: number | unknown;
        height?: number | unknown;
        file_name?: string | unknown;
        duration?: number | unknown;
        fps?: number | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        url: string;
    };
}

interface LTXV20TextToVideoFastRequest {
    fps?: 25 | 50;
    duration?: 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20;
    prompt: string;
    generate_audio?: boolean;
    resolution?: "1080p" | "1440p" | "2160p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Ltxv2TextToVideoFastResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXVTextToVideoResponse;
}
interface LTXVTextToVideoResponse {
    video: {
        num_frames?: number | unknown;
        height?: number | unknown;
        file_name?: string | unknown;
        duration?: number | unknown;
        fps?: number | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        url: string;
    };
}

interface FabricOneLipsyncInput$1 {
    audio_url: string;
    image_url: string;
    resolution: "720p" | "480p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface VeedFabric10Response {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: FabricOneOutput$1;
}
interface FabricOneOutput$1 {
    video: {
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
    };
}

interface FabricOneLipsyncInput {
    audio_url: string;
    image_url: string;
    resolution: "720p" | "480p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface VeedFabric10FastResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: FabricOneOutput;
}
interface FabricOneOutput {
    video: {
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
    };
}

interface UpscaleInput {
    fidelity?: "high" | "medium";
    scale_ratio?: number | unknown;
    video_url: string;
    target_resolution?: "1080p" | "2k" | "4k";
    target_fps?: "30fps" | "60fps";
    enhancement_tier?: "fast" | "standard" | "pro";
    enhancement_preset?: "general" | "ugc" | "short_series" | "aigc" | "old_film";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface BytedanceUpscalerUpscaleVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: UpscaleOutput;
}
interface UpscaleOutput {
    duration: number;
    video: {
        file_name?: string | unknown;
        file_size?: number | unknown;
        url: string;
        content_type?: string | unknown;
    };
}

interface TextToSpeechRequestV3 {
    apply_text_normalization?: "auto" | "on" | "off";
    stability?: number;
    voice?: string;
    language_code?: string | unknown;
    timestamps?: boolean;
    text: string;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface ElevenlabsTtsElevenV3Response {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: TTSOutput;
}
interface TTSOutput {
    audio: {
        content_type?: string | unknown;
        file_size?: number | unknown;
        file_name?: string | unknown;
        url: string;
    };
    timestamps?: unknown[] | unknown;
}

interface OviT2VRequest {
    negative_prompt?: string;
    num_inference_steps?: number;
    prompt: string;
    resolution?: "512x992" | "992x512" | "960x512" | "512x960" | "720x720" | "448x1120" | "1120x448";
    seed?: number | unknown;
    audio_negative_prompt?: string;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface OviResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: OviT2VResponse;
}
interface OviT2VResponse {
    video?: {
        url: string;
        file_name?: string | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
    } | unknown;
    seed: number;
}

interface OviI2VRequest {
    image_url: string;
    negative_prompt?: string;
    prompt: string;
    num_inference_steps?: number;
    seed?: number | unknown;
    audio_negative_prompt?: string;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface OviImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: OviI2VResponse;
}
interface OviI2VResponse {
    video?: {
        url: string;
        file_name?: string | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
    } | unknown;
    seed: number;
}

interface ReveCreateInput {
    prompt: string;
    num_images?: number;
    sync_mode?: boolean;
    output_format?: "png" | "jpeg" | "webp";
    aspect_ratio?: "16:9" | "9:16" | "3:2" | "2:3" | "4:3" | "3:4" | "1:1";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface ReveTextToImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ReveCreateOutput;
}
interface ReveCreateOutput {
    images: ({
        width?: number | unknown;
        file_name?: string | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        url: string;
        height?: number | unknown;
    })[];
}

interface ReveEditInput {
    prompt: string;
    num_images?: number;
    sync_mode?: boolean;
    image_url: string;
    output_format?: "png" | "jpeg" | "webp";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface ReveEditResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ReveEditOutput;
}
interface ReveEditOutput {
    images: ({
        width?: number | unknown;
        file_name?: string | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        url: string;
        height?: number | unknown;
    })[];
}

interface MergeVideosInput {
    video_urls: string[];
    target_fps?: number | unknown;
    resolution_aspect_ratio_video_index?: number | unknown;
    resolution?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" | unknown;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface FfmpegApiMergeVideosResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MergeVideosOutput;
}
interface MergeVideosOutput {
    metadata: Record<string, unknown>;
    video: {
        url: string;
        content_type?: string | unknown;
        file_size?: number | unknown;
        file_name?: string | unknown;
    };
}

interface CombineInput {
    start_offset?: number;
    audio_url: string;
    video_url: string;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface FfmpegApiMergeAudioVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: CombineOutput;
}
interface CombineOutput {
    video: {
        url: string;
        content_type?: string | unknown;
        file_size?: number | unknown;
        file_name?: string | unknown;
    };
}

interface TextToMusic20Request {
    lyrics_prompt: string;
    prompt: string;
    audio_setting?: {
        sample_rate?: 8000 | 16000 | 22050 | 24000 | 32000 | 44100;
        format?: "mp3" | "pcm" | "flac";
        bitrate?: 32000 | 64000 | 128000 | 256000;
    };
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface MinimaxMusicV2Response {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MusicV15Output;
}
interface MusicV15Output {
    audio: {
        url: string;
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
    };
}

interface SoundEffectRequestV2 {
    duration_seconds?: number | unknown;
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "pcm_8000" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000" | "ulaw_8000" | "alaw_8000" | "opus_48000_32" | "opus_48000_64" | "opus_48000_96" | "opus_48000_128" | "opus_48000_192";
    prompt_influence?: number;
    loop?: boolean;
    text: string;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface ElevenlabsSoundEffectsV2Response {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: SoundEffectOutput;
}
interface SoundEffectOutput {
    audio: {
        content_type?: string | unknown;
        file_size?: number | unknown;
        file_name?: string | unknown;
        url: string;
    };
}

interface OmniHumanv15Input {
    image_url: string;
    turbo_mode?: boolean;
    prompt?: string | unknown;
    audio_url: string;
    resolution?: "720p" | "1080p";
    mask_url?: string | unknown;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface BytedanceOmnihumanV15Response {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: OmniHumanv15Output;
}
interface OmniHumanv15Output {
    duration: number;
    video: {
        url: string;
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
    };
}

interface LTXRetakeVideoRequest {
    duration?: number;
    retake_mode?: "replace_audio" | "replace_video" | "replace_audio_and_video";
    prompt: string;
    video_url: string;
    start_time?: number;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Ltx2RetakeVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXRetakeVideoResponse;
}
interface LTXRetakeVideoResponse {
    video: {
        fps?: number | unknown;
        num_frames?: number | unknown;
        content_type?: string | unknown;
        height?: number | unknown;
        duration?: number | unknown;
        file_name?: string | unknown;
        width?: number | unknown;
        file_size?: number | unknown;
        url: string;
    };
}

interface FrameInput {
    frame_type?: "first" | "middle" | "last";
    video_url: string;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface FfmpegApiExtractFrameResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: FrameOutput;
}
interface FrameOutput {
    images: ({
        url: string;
        width?: number | unknown;
        height?: number | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
    })[];
}

interface AuroraInputModel {
    guidance_scale?: number | unknown;
    audio_guidance_scale?: number | unknown;
    image_url: string;
    audio_url: string;
    prompt?: string | unknown;
    resolution?: "480p" | "720p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface CreatifyAuroraResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AuroraOutputModel;
}
interface AuroraOutputModel {
    video: {
        file_name?: string | unknown;
        duration?: number | unknown;
        height?: number | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        width?: number | unknown;
        content_type?: string | unknown;
        url: string;
        file_size?: number | unknown;
    };
}

interface VideoUpscaleRequest {
    target_fps?: number | unknown;
    halo?: number | unknown;
    H264_output?: boolean;
    grain?: number | unknown;
    noise?: number | unknown;
    compression?: number | unknown;
    model?: "Proteus" | "Artemis HQ" | "Artemis MQ" | "Artemis LQ" | "Nyx" | "Nyx Fast" | "Nyx XL" | "Nyx HF" | "Gaia HQ" | "Gaia CG" | "Gaia 2" | "Starlight Precise 1" | "Starlight Precise 2" | "Starlight Precise 2.5" | "Starlight HQ" | "Starlight Mini" | "Starlight Sharp" | "Starlight Fast 1" | "Starlight Fast 2";
    video_url: string;
    upscale_factor?: number;
    recover_detail?: number | unknown;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface TopazUpscaleVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: VideoUpscaleOutput;
}
interface VideoUpscaleOutput {
    video: {
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
    };
}

interface ImageUpscaleRequest {
    image_url: string;
    detail?: number | unknown;
    denoise?: number | unknown;
    face_enhancement_creativity?: number;
    strength?: number | unknown;
    output_format?: "jpeg" | "png";
    subject_detection?: "All" | "Foreground" | "Background";
    upscale_factor?: number;
    prompt?: string | unknown;
    face_enhancement_strength?: number;
    crop_to_fill?: boolean;
    sharpen?: number | unknown;
    texture?: number | unknown;
    fix_compression?: number | unknown;
    enhancement_strength?: "low" | "medium" | "high" | unknown;
    autoprompt?: boolean | unknown;
    model?: "Low Resolution V2" | "Standard V2" | "CGI" | "High Fidelity V2" | "Text Refine" | "Recovery" | "Redefine" | "Recovery V2" | "Standard MAX" | "Wonder" | "Wonder 3";
    creativity?: number | unknown;
    face_enhancement?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface TopazUpscaleImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ImageUpscaleOutput;
}
interface ImageUpscaleOutput {
    image: {
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
    };
}

interface AiWriterV1Command {
    text: string;
    tone: string;
    language?: string;
    character_limit: number;
    count?: number;
    use_case?: string;
    use_case_props?: UseCaseProps;
}
interface UseCaseProps {
    brand?: string;
}
type EmptyModel$1 = Record<string, never>;

interface ImageToVideoInput {
    prompt: string;
    image_url: string;
    duration?: "5" | "10" | "15";
    audio_url?: string | unknown;
    multi_shots?: boolean;
    enable_safety_checker?: boolean;
    seed?: number | unknown;
    resolution?: "720p" | "1080p";
    enable_prompt_expansion?: boolean;
    negative_prompt?: string | unknown;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface WanV26ImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ImageToVideoOutput;
}
interface ImageToVideoOutput {
    video: {
        file_size?: number | unknown;
        duration?: number | unknown;
        width?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        height?: number | unknown;
        url: string;
    };
    actual_prompt?: string | unknown;
    seed: number;
}

interface TextToVideoInput {
    aspect_ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    prompt: string;
    duration?: "5" | "10" | "15";
    multi_shots?: boolean;
    resolution?: "720p" | "1080p";
    seed?: number | unknown;
    enable_safety_checker?: boolean;
    negative_prompt?: string | unknown;
    enable_prompt_expansion?: boolean;
    audio_url?: string | unknown;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface WanV26TextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: TextToVideoOutput;
}
interface TextToVideoOutput {
    actual_prompt?: string | unknown;
    video: {
        file_size?: number | unknown;
        duration?: number | unknown;
        width?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        height?: number | unknown;
        url: string;
    };
    seed: number;
}

interface ReferenceToVideoInput {
    resolution?: "720p" | "1080p";
    multi_shots?: boolean;
    duration?: "5" | "10";
    enable_safety_checker?: boolean;
    negative_prompt?: string | unknown;
    seed?: number | unknown;
    prompt: string;
    aspect_ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    enable_prompt_expansion?: boolean;
    video_urls: string[];
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface WanV26ReferenceToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ReferenceToVideoOutput;
}
interface ReferenceToVideoOutput {
    video: {
        file_size?: number | unknown;
        duration?: number | unknown;
        width?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        height?: number | unknown;
        url: string;
    };
    seed: number;
    actual_prompt?: string | unknown;
}

interface SaveToDriveCommand {
    name: string;
    url: string;
    mimeType?: string;
    thumbnailUrl?: string;
    attributes?: Record<string, unknown>;
    folder?: FolderInfo;
}
interface FolderInfo {
    path?: string;
    id?: string;
    toolId?: string;
    attributes?: Record<string, unknown>;
    thumbnailUrl?: string;
}
interface SaveToDriveResponse {
    result: SaveToDriveResult;
}
interface SaveToDriveResult {
    id: string;
    sourceUrl?: string;
    thumbnail?: ThumbnailResult;
    parentFolderId: string;
}
interface ThumbnailResult {
    url: string;
    width?: number;
    height?: number;
}

interface SeedVRImageInput {
    upscale_factor?: number;
    output_format?: "png" | "jpg" | "webp";
    seed?: number | unknown;
    image_url: string;
    upscale_mode?: "target" | "factor";
    sync_mode?: boolean;
    target_resolution?: "720p" | "1080p" | "1440p" | "2160p";
    noise_scale?: number;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface SeedvrUpscaleImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: SeedVRImageOutput;
}
interface SeedVRImageOutput {
    seed: number;
    image: {
        url: string;
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        height?: number | unknown;
        width?: number | unknown;
    };
}

interface XAIImageInput {
    prompt: string;
    aspect_ratio?: "2:1" | "20:9" | "19.5:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:19.5" | "9:20" | "1:2";
    output_format?: "jpeg" | "png" | "webp";
    num_images?: number;
    sync_mode?: boolean;
    resolution?: "1k" | "2k";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface XaiGrokImagineImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAIImageOutput;
}
interface XAIImageOutput {
    revised_prompt?: string | unknown;
    images: ({
        height?: number | unknown;
        content_type?: string | unknown;
        width?: number | unknown;
        file_size?: number | unknown;
        url: string;
        file_name?: string | unknown;
    })[];
}

interface XAIImageEditInput {
    prompt: string;
    resolution?: "1k" | "2k";
    output_format?: "jpeg" | "png" | "webp";
    aspect_ratio?: "auto" | "2:1" | "20:9" | "19.5:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:19.5" | "9:20" | "1:2";
    num_images?: number;
    sync_mode?: boolean;
    image_urls?: string[];
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface XaiGrokImagineImageEditResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAIImageEditOutput;
}
interface XAIImageEditOutput {
    revised_prompt?: string | unknown;
    images: ({
        height?: number | unknown;
        content_type?: string | unknown;
        width?: number | unknown;
        file_size?: number | unknown;
        url: string;
        file_name?: string | unknown;
    })[];
}

interface XAITextToVideoInput {
    prompt: string;
    duration?: number;
    aspect_ratio?: "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16";
    resolution?: "480p" | "720p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface XaiGrokImagineVideoTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAITextToVideoOutput;
}
interface XAITextToVideoOutput {
    video: {
        width?: number | unknown;
        content_type?: string | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        height?: number | unknown;
        duration?: number | unknown;
        url: string;
        file_size?: number | unknown;
        file_name?: string | unknown;
    };
}

interface XAIImageToVideoInput {
    prompt: string;
    image_url: string;
    duration?: number;
    aspect_ratio?: "auto" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | unknown;
    resolution?: "480p" | "720p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface XaiGrokImagineVideoImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAIImageToVideoOutput;
}
interface XAIImageToVideoOutput {
    video: {
        width?: number | unknown;
        content_type?: string | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        height?: number | unknown;
        duration?: number | unknown;
        url: string;
        file_size?: number | unknown;
        file_name?: string | unknown;
    };
}

interface XAIVideoEditInput {
    prompt: string;
    video_url: string;
    resolution?: "auto" | "480p" | "720p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface XaiGrokImagineVideoEditVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAIVideoEditOutput;
}
interface XAIVideoEditOutput {
    video: {
        width?: number | unknown;
        content_type?: string | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        height?: number | unknown;
        duration?: number | unknown;
        url: string;
        file_size?: number | unknown;
        file_name?: string | unknown;
    };
}

interface TrimVideoInput {
    duration?: number | unknown;
    end_time?: number | unknown;
    video_url: string;
    start_time?: number;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface WorkflowUtilitiesTrimVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: TrimVideoOutput;
}
interface TrimVideoOutput {
    video: {
        url: string;
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
    };
    original_duration: number;
    trimmed_duration: number;
}

interface VideoModerationModel {
    video_url?: string;
    duration?: number;
    maxFrame?: number;
}
interface VideoModerationResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: VideoModerationResult;
}
interface VideoModerationResult {
    nsfw: NsfwScores;
    moderatedData: VideoFrameNsfw[];
    processTime: number;
    totalFrames: number;
    processedFrames: number;
}
interface NsfwScores {
    suggestive: number;
    pornography: number;
    violence: number;
    animated_porn: number;
}
interface VideoFrameNsfw {
    frameNumber: number;
    frameImage: string;
    nsfwScore: NsfwScores;
}

interface ImageExpansionInput {
    prompt?: string;
    original_image_location?: number[] | unknown;
    image_url: string;
    seed?: number | unknown;
    negative_prompt?: string;
    sync_mode?: boolean;
    canvas_size: number[];
    original_image_size?: number[] | unknown;
    aspect_ratio?: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | unknown;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface BriaExpandResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ImageExpansionOutput;
}
interface ImageExpansionOutput {
    image: {
        width?: number | unknown;
        file_name?: string | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        url: string;
        height?: number | unknown;
    };
    seed: number;
}

interface GeminiV2ImagesCommand {
    prompt: string;
    imageUrls?: string[];
    aspectRatio?: AspectRatio$1;
    imageSize?: ImageResolution$1;
    model: GeminiV2ImageModel;
    count?: number;
    options?: GenAIOptions$1X;
    thinkingConfig?: ThinkingConfig$1;
}
type AspectRatio$1 = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9" | "1:4" | "4:1" | "1:8" | "8:1";
type ImageResolution$1 = "0.5K" | "1K" | "2K" | "4K";
type GeminiV2ImageModel = "gemini-2.5-flash-image" | "gemini-3-pro-image-preview" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image" | "gemini-3.1-flash-image-preview" | "instant-ramen";
interface GenAIOptions$1X {
    safety_checks?: SafetyChecksOptions$1X;
    drive?: DriveOptions$1X;
}
interface SafetyChecksOptions$1X {
    enabled?: boolean;
}
interface DriveOptions$1X {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1X;
}
interface DriveFolderOptions$1X {
    path?: string;
    id?: string;
}
interface ThinkingConfig$1 {
    thinkingLevel?: ThinkingLevel$1;
    thinkingBudget?: number;
}
type ThinkingLevel$1 = "MINIMAL" | "LOW" | "MEDIUM" | "HIGH";
interface GeminiV2ImagesResult {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeminiV1ImagesResponse;
}
interface GeminiV1ImagesResponse {
    imageUrls: GeminiUrl[];
    description: string;
}
interface GeminiUrl {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface RecraftImagesCommand {
    prompt: string;
    image_url?: string;
    strength?: number;
    n?: number;
    model: "recraftv2" | "recraftv2_vector" | "recraftv3" | "recraftv3_vector" | "recraftv4" | "recraftv4_vector" | "recraftv4_pro" | "recraftv4_pro_vector" | "recraftv4_1" | "recraftv4_1_vector" | "recraftv4_1_pro" | "recraftv4_1_pro_vector" | "recraftv4_1_utility" | "recraftv4_1_utility_vector" | "recraftv4_1_utility_pro" | "recraftv4_1_utility_pro_vector";
    style?: string;
    style_id?: string;
    substyle?: string;
    negative_prompt?: string;
    size?: string;
    image_format?: "webp" | "png";
    controls?: UserControls;
    options?: GenAIOptions$1W;
}
interface UserControls {
    artistic_level?: number;
    background_color?: string;
    colors?: string[];
    no_text?: boolean;
}
interface GenAIOptions$1W {
    safety_checks?: SafetyChecksOptions$1W;
    drive?: DriveOptions$1W;
}
interface SafetyChecksOptions$1W {
    enabled?: boolean;
}
interface DriveOptions$1W {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1W;
}
interface DriveFolderOptions$1W {
    path?: string;
    id?: string;
}
interface RecraftImagesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: RecraftImagesResult;
}
interface RecraftImagesResult {
    items: RecraftImagesResultItem[];
}
interface RecraftImagesResultItem {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface RecraftReplaceBackgroundCommand {
    image_url: string;
    prompt: string;
    model?: "recraftv3" | "recraftv3_vector";
    style?: string;
    substyle?: string;
    negative_prompt?: string;
    n?: number;
    random_seed?: number;
    options?: GenAIOptions$1V;
}
interface GenAIOptions$1V {
    safety_checks?: SafetyChecksOptions$1V;
    drive?: DriveOptions$1V;
}
interface SafetyChecksOptions$1V {
    enabled?: boolean;
}
interface DriveOptions$1V {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1V;
}
interface DriveFolderOptions$1V {
    path?: string;
    id?: string;
}
interface RecraftReplaceBackgroundResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: RecraftReplaceBackgroundResult;
}
interface RecraftReplaceBackgroundResult {
    items: RecraftReplaceBackgroundResultItem[];
}
interface RecraftReplaceBackgroundResultItem {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface RecraftVectorizeCommand {
    image_url: string;
    image_format?: string;
    color_reduction?: number;
    limit_num_shapes?: number;
    max_num_shapes?: number;
    return_gradients?: boolean;
    small_shape_filter?: number;
    svg_compression?: number;
    upscale?: number;
    options?: GenAIOptions$1U;
}
interface GenAIOptions$1U {
    safety_checks?: SafetyChecksOptions$1U;
    drive?: DriveOptions$1U;
}
interface SafetyChecksOptions$1U {
    enabled?: boolean;
}
interface DriveOptions$1U {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1U;
}
interface DriveFolderOptions$1U {
    path?: string;
    id?: string;
}
interface RecraftVectorizeResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: RecraftVectorizeResult;
}
interface RecraftVectorizeResult {
    items: RecraftVectorizeResultItem[];
}
interface RecraftVectorizeResultItem {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface RecraftCrispUpscaleCommand {
    image_url: string;
    image_format?: string;
    upscale?: string;
    options?: GenAIOptions$1T;
}
interface GenAIOptions$1T {
    safety_checks?: SafetyChecksOptions$1T;
    drive?: DriveOptions$1T;
}
interface SafetyChecksOptions$1T {
    enabled?: boolean;
}
interface DriveOptions$1T {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1T;
}
interface DriveFolderOptions$1T {
    path?: string;
    id?: string;
}
interface RecraftCrispUpscaleResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: RecraftCrispUpscaleResult;
}
interface RecraftCrispUpscaleResult {
    items: RecraftCrispUpscaleResultItem[];
}
interface RecraftCrispUpscaleResultItem {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface RecraftCreativeUpscaleCommand {
    image_url: string;
    image_format?: string;
    upscale?: string;
    options?: GenAIOptions$1S;
}
interface GenAIOptions$1S {
    safety_checks?: SafetyChecksOptions$1S;
    drive?: DriveOptions$1S;
}
interface SafetyChecksOptions$1S {
    enabled?: boolean;
}
interface DriveOptions$1S {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1S;
}
interface DriveFolderOptions$1S {
    path?: string;
    id?: string;
}
interface RecraftCreativeUpscaleResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: RecraftCreativeUpscaleResult;
}
interface RecraftCreativeUpscaleResult {
    items: RecraftCreativeUpscaleResultItem[];
}
interface RecraftCreativeUpscaleResultItem {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface RecraftVariateImageCommand {
    image_url: string;
    size: string;
    image_format?: string;
    n?: number;
    random_seed?: number;
    options?: GenAIOptions$1R;
}
interface GenAIOptions$1R {
    safety_checks?: SafetyChecksOptions$1R;
    drive?: DriveOptions$1R;
}
interface SafetyChecksOptions$1R {
    enabled?: boolean;
}
interface DriveOptions$1R {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1R;
}
interface DriveFolderOptions$1R {
    path?: string;
    id?: string;
}
interface RecraftVariateImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: RecraftVariateImageResult;
}
interface RecraftVariateImageResult {
    items: RecraftVariateImageResultItem[];
}
interface RecraftVariateImageResultItem {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface KlingTextToVideoCommand {
    model_name?: KlingModels$1;
    prompt?: string;
    negative_prompt?: string;
    cfg_scale?: number;
    sound?: KlingSound$2;
    mode?: KlingMode$2;
    aspect_ratio?: KlingAspectRatio$2;
    resolution?: KlingVideoResolution$1;
    duration?: "5" | "10" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    multi_shot?: boolean;
    shot_type?: KlingShotType$1;
    multi_prompt?: MultiPromptItem$2[];
    voice_list?: VoiceItem$1[];
    options?: GenAIOptions$1Q;
}
type KlingModels$1 = "kling-v2-master" | "kling-v2-1-master" | "kling-v2-1" | "kling-v2-5-turbo" | "kling-v2-6" | "kling-v3" | "kling-v3-turbo";
type KlingSound$2 = "on" | "off";
type KlingMode$2 = "std" | "pro" | "4k";
type KlingAspectRatio$2 = "16:9" | "9:16" | "1:1";
type KlingVideoResolution$1 = "720p" | "1080p";
type KlingShotType$1 = "customize" | "intelligence";
interface MultiPromptItem$2 {
    index: number;
    prompt: string;
    duration: string;
}
interface VoiceItem$1 {
    voice_id: string;
}
interface GenAIOptions$1Q {
    safety_checks?: SafetyChecksOptions$1Q;
    drive?: DriveOptions$1Q;
}
interface SafetyChecksOptions$1Q {
    enabled?: boolean;
}
interface DriveOptions$1Q {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1Q;
}
interface DriveFolderOptions$1Q {
    path?: string;
    id?: string;
}
interface KlingTextToVideoResponse {
    result: KlingVideoResult$6;
}
interface KlingVideoResult$6 {
    url: string;
    duration: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface KlingImageToVideoCommand {
    model_name?: KlingModels;
    prompt?: string;
    negative_prompt?: string;
    cfg_scale?: number;
    sound?: KlingSound$1;
    mode?: KlingMode$1;
    aspect_ratio?: KlingAspectRatio$1;
    resolution?: KlingVideoResolution;
    duration?: "5" | "10" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    multi_shot?: boolean;
    shot_type?: KlingShotType;
    multi_prompt?: MultiPromptItem$1[];
    voice_list?: VoiceItem[];
    options?: GenAIOptions$1P;
    image?: string;
    image_tail?: string;
    element_list?: I2VElementItem[];
}
type KlingModels = "kling-v2-master" | "kling-v2-1-master" | "kling-v2-1" | "kling-v2-5-turbo" | "kling-v2-6" | "kling-v3" | "kling-v3-turbo";
type KlingSound$1 = "on" | "off";
type KlingMode$1 = "std" | "pro" | "4k";
type KlingAspectRatio$1 = "16:9" | "9:16" | "1:1";
type KlingVideoResolution = "720p" | "1080p";
type KlingShotType = "customize" | "intelligence";
interface MultiPromptItem$1 {
    index: number;
    prompt: string;
    duration: string;
}
interface VoiceItem {
    voice_id: string;
}
interface GenAIOptions$1P {
    safety_checks?: SafetyChecksOptions$1P;
    drive?: DriveOptions$1P;
}
interface SafetyChecksOptions$1P {
    enabled?: boolean;
}
interface DriveOptions$1P {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1P;
}
interface DriveFolderOptions$1P {
    path?: string;
    id?: string;
}
interface I2VElementItem {
    element_id: string;
}
interface KlingImageToVideoResponse {
    result: KlingVideoResult$5;
}
interface KlingVideoResult$5 {
    url: string;
    duration: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface KlingTextToAudioCommand {
    prompt: string;
    duration: number;
    options?: GenAIOptions$1O;
}
interface GenAIOptions$1O {
    safety_checks?: SafetyChecksOptions$1O;
    drive?: DriveOptions$1O;
}
interface SafetyChecksOptions$1O {
    enabled?: boolean;
}
interface DriveOptions$1O {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1O;
}
interface DriveFolderOptions$1O {
    path?: string;
    id?: string;
}
interface KlingTextToAudioResponse {
    result: KlingAudioResult;
}
interface KlingAudioResult {
    url_mp3: string;
    url_wav: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface KlingVideoToAudioCommand {
    video_url: string;
    options?: GenAIOptions$1N;
}
interface GenAIOptions$1N {
    safety_checks?: SafetyChecksOptions$1N;
    drive?: DriveOptions$1N;
}
interface SafetyChecksOptions$1N {
    enabled?: boolean;
}
interface DriveOptions$1N {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1N;
}
interface DriveFolderOptions$1N {
    path?: string;
    id?: string;
}
interface KlingVideoToAudioResponse {
    result: KlingVideoResult$4;
}
interface KlingVideoResult$4 {
    url: string;
    duration: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface KlingOmniVideoCommand {
    model_name?: KlingOmniModels;
    prompt?: string;
    image_list?: ReferenceImage$1[];
    element_list?: Element[];
    video_list?: ReferenceVideo[];
    sound?: KlingSound;
    mode?: KlingMode;
    aspect_ratio?: KlingAspectRatio;
    duration?: "5" | "10" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    multi_shot?: boolean;
    shot_type?: "customize";
    multi_prompt?: MultiPromptItem[];
    options?: GenAIOptions$1M;
}
type KlingOmniModels = "kling-video-o1" | "kling-v3-omni";
interface ReferenceImage$1 {
    image_url: string;
    type?: KlingOmniFrame;
}
type KlingOmniFrame = "first_frame" | "end_frame";
interface Element {
    element_id: string;
}
interface ReferenceVideo {
    video_url: string;
    refer_type: KlingOmniReferType;
    keep_original_sound: KlingKeepOriginalSound$1;
}
type KlingOmniReferType = "feature" | "base";
type KlingKeepOriginalSound$1 = "yes" | "no";
type KlingSound = "on" | "off";
type KlingMode = "std" | "pro" | "4k";
type KlingAspectRatio = "16:9" | "9:16" | "1:1";
interface MultiPromptItem {
    index: number;
    prompt: string;
    duration: string;
}
interface GenAIOptions$1M {
    safety_checks?: SafetyChecksOptions$1M;
    drive?: DriveOptions$1M;
}
interface SafetyChecksOptions$1M {
    enabled?: boolean;
}
interface DriveOptions$1M {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1M;
}
interface DriveFolderOptions$1M {
    path?: string;
    id?: string;
}
interface KlingOmniVideoResponse {
    result: KlingVideoResult$3;
}
interface KlingVideoResult$3 {
    url: string;
    duration: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface KlingAvatarCommand {
    image?: string;
    audio_id?: string;
    sound_file?: string;
    prompt?: string;
    mode?: KlingAvatarMode;
    options?: GenAIOptions$1L;
}
type KlingAvatarMode = "std" | "pro";
interface GenAIOptions$1L {
    safety_checks?: SafetyChecksOptions$1L;
    drive?: DriveOptions$1L;
}
interface SafetyChecksOptions$1L {
    enabled?: boolean;
}
interface DriveOptions$1L {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1L;
}
interface DriveFolderOptions$1L {
    path?: string;
    id?: string;
}
interface KlingAvatarResponse {
    result: KlingVideoResult$2;
}
interface KlingVideoResult$2 {
    url: string;
    duration: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface KlingMotionControlCommand {
    model_name?: "kling-v2-6" | "kling-v3";
    prompt?: string;
    image_url: string;
    video_url: string;
    character_orientation: KlingCharacterOrientation;
    keep_original_sound?: KlingKeepOriginalSound;
    mode: KlingMotionControlMode;
    options?: GenAIOptions$1K;
}
type KlingCharacterOrientation = "image" | "video";
type KlingKeepOriginalSound = "yes" | "no";
type KlingMotionControlMode = "std" | "pro";
interface GenAIOptions$1K {
    safety_checks?: SafetyChecksOptions$1K;
    drive?: DriveOptions$1K;
}
interface SafetyChecksOptions$1K {
    enabled?: boolean;
}
interface DriveOptions$1K {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1K;
}
interface DriveFolderOptions$1K {
    path?: string;
    id?: string;
}
interface KlingMotionControlResponse {
    result: KlingVideoResult$1;
}
interface KlingVideoResult$1 {
    url: string;
    duration: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface KlingElementsCommand {
    element_name: string;
    element_description: string;
    reference_type: KlingElementReferenceType;
    element_image_list?: ElementImageList;
    element_video_list?: ElementVideoList;
    element_voice_id?: string;
    tag_list?: ElementTagItem[];
    options?: GenAIOptions$1J;
}
type KlingElementReferenceType = "video_refer" | "image_refer";
interface ElementImageList {
    frontal_image: string;
    refer_images: ElementReferImage[];
}
interface ElementReferImage {
    image_url: string;
}
interface ElementVideoList {
    refer_videos: ElementReferVideo[];
}
interface ElementReferVideo {
    video_url: string;
}
interface ElementTagItem {
    tag_id: KlingElementTag;
}
type KlingElementTag = "o_101" | "o_102" | "o_103" | "o_104" | "o_105" | "o_106" | "o_107" | "o_108";
interface GenAIOptions$1J {
    safety_checks?: SafetyChecksOptions$1J;
    drive?: DriveOptions$1J;
}
interface SafetyChecksOptions$1J {
    enabled?: boolean;
}
interface DriveOptions$1J {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1J;
}
interface DriveFolderOptions$1J {
    path?: string;
    id?: string;
}
interface KlingElementsResponse {
    result: KlingElementsResult;
}
interface KlingElementsResult {
    element_id: string;
    driveFile?: Record<string, unknown>;
}

interface SoundGenerationCommand {
    text: string;
    loop?: boolean;
    duration_seconds?: number;
    prompt_influence?: number;
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    model_id?: "eleven_text_to_sound_v2";
    options?: GenAIOptions$1I;
}
interface GenAIOptions$1I {
    safety_checks?: SafetyChecksOptions$1I;
    drive?: DriveOptions$1I;
}
interface SafetyChecksOptions$1I {
    enabled?: boolean;
}
interface DriveOptions$1I {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1I;
}
interface DriveFolderOptions$1I {
    path?: string;
    id?: string;
}
interface SoundGenerationResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AudioResult$3;
}
interface AudioResult$3 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface FluxKontextCommand {
    prompt: string;
    seed?: number;
    aspectRatio?: "0:0" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21";
    outputFormat?: "jpeg" | "png";
    promptUpsampling?: boolean;
    safetyTolerance?: number;
    options?: GenAIOptions$1H;
    model: FluxKontextModel;
    imageUrls: string[];
}
interface GenAIOptions$1H {
    safety_checks?: SafetyChecksOptions$1H;
    drive?: DriveOptions$1H;
}
interface SafetyChecksOptions$1H {
    enabled?: boolean;
}
interface DriveOptions$1H {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1H;
}
interface DriveFolderOptions$1H {
    path?: string;
    id?: string;
}
type FluxKontextModel = "flux-kontext-max" | "flux-kontext-pro";
interface FluxKontextResult {
    result: GeneratedImageResult$5;
}
interface GeneratedImageResult$5 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface FluxV2Command {
    prompt: string;
    seed?: number;
    aspectRatio?: "0:0" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21";
    outputFormat?: "jpeg" | "png";
    promptUpsampling?: boolean;
    safetyTolerance?: number;
    options?: GenAIOptions$1G;
    model: FluxV2Model;
    steps?: number;
    guidance?: number;
    imageUrls: string[];
    width?: number;
    height?: number;
    resolution?: FluxResolution;
}
interface GenAIOptions$1G {
    safety_checks?: SafetyChecksOptions$1G;
    drive?: DriveOptions$1G;
}
interface SafetyChecksOptions$1G {
    enabled?: boolean;
}
interface DriveOptions$1G {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1G;
}
interface DriveFolderOptions$1G {
    path?: string;
    id?: string;
}
type FluxV2Model = "flux-2-flex" | "flux-2-pro" | "flux-2-pro-preview" | "flux-2-max";
type FluxResolution = "1K" | "2K";
interface FluxV2Result {
    result: GeneratedImageResult$4;
}
interface GeneratedImageResult$4 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface TextToSpeechCommand {
    voice_id: string;
    text: string;
    model_id?: "eleven_multilingual_v2" | "eleven_v3";
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    voice_settings?: VoiceSettings$1;
    language_code?: string;
    seed?: number;
    options?: GenAIOptions$1F;
}
interface VoiceSettings$1 {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    speed?: number;
}
interface GenAIOptions$1F {
    safety_checks?: SafetyChecksOptions$1F;
    drive?: DriveOptions$1F;
}
interface SafetyChecksOptions$1F {
    enabled?: boolean;
}
interface DriveOptions$1F {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1F;
}
interface DriveFolderOptions$1F {
    path?: string;
    id?: string;
}
interface TextToSpeechResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AudioResult$2;
}
interface AudioResult$2 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface SpeechToSpeechCommand {
    voice_id: string;
    audio_url: string;
    model_id?: "eleven_multilingual_sts_v2" | "eleven_english_sts_v2";
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    voice_settings?: VoiceSettings;
    seed?: number;
    remove_background_noise?: boolean;
    options?: GenAIOptions$1E;
}
interface VoiceSettings {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    speed?: number;
}
interface GenAIOptions$1E {
    safety_checks?: SafetyChecksOptions$1E;
    drive?: DriveOptions$1E;
}
interface SafetyChecksOptions$1E {
    enabled?: boolean;
}
interface DriveOptions$1E {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1E;
}
interface DriveFolderOptions$1E {
    path?: string;
    id?: string;
}
interface SpeechToSpeechResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AudioResult$1;
}
interface AudioResult$1 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface VoiceSearchCommand {
    search?: string;
    page_size?: number;
    next_page_token?: string;
    sort?: "created_at_unix" | "name";
    sort_direction?: "asc" | "desc";
    voice_type?: "personal" | "community" | "default" | "workspace";
    category?: "premade" | "cloned" | "generated" | "professional";
}
interface VoiceSearchResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: VoiceSearchResult;
}
interface VoiceSearchResult {
    voices: VoiceResult[];
    has_more: boolean;
    total_count: number;
    next_page_token?: string;
}
interface VoiceResult {
    voice_id: string;
    name: string;
    category?: string;
    description?: string;
    preview_url?: string;
}

interface VeoVideoGenCommand {
    prompt?: string;
    image?: VeoImage;
    lastFrame?: VeoLastFrame;
    video?: VeoVideo;
    referenceImages?: VeoReferenceImage[];
    count?: number;
    negativePrompt?: string;
    model?: "veo-2.0-generate-001" | "veo-2.0-generate-exp" | "veo-3.0-generate-001" | "veo-3.0-fast-generate-001" | "veo-3.0-generate-preview" | "veo-3.1-generate-001" | "veo-3.1-fast-generate-001" | "veo-3.1-generate-preview" | "veo-3.1-fast-generate-preview" | "veo-3.1-lite-generate-preview";
    parameters?: VeoVideoParameters;
    options?: GenAIOptions$1D;
}
interface VeoImage {
    url?: string;
    bytesBase64Encoded?: string;
    mimeType: "image/png" | "image/jpeg";
}
interface VeoLastFrame {
    bytesBase64Encoded?: string;
    url?: string;
    mimeType: "image/png" | "image/jpeg";
}
interface VeoVideo {
    bytesBase64Encoded?: string;
    url?: string;
    mimeType: "video/mp4";
}
interface VeoReferenceImage {
    image: VeoImage;
    referenceType: "style" | "asset";
}
interface VeoVideoParameters {
    aspectRatio?: "16:9" | "9:16";
    resolution?: "720p" | "1080p" | "4k";
    compressionQuality?: "optimized" | "lossless";
    personGeneration?: "dont_allow" | "allow_adult" | "allow_all";
    seed?: number;
    durationSeconds?: number;
    enhancePrompt?: boolean;
    generateAudio?: boolean;
    resizeMode?: "crop" | "pad";
}
interface GenAIOptions$1D {
    safety_checks?: SafetyChecksOptions$1D;
    drive?: DriveOptions$1D;
}
interface SafetyChecksOptions$1D {
    enabled?: boolean;
}
interface DriveOptions$1D {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1D;
}
interface DriveFolderOptions$1D {
    path?: string;
    id?: string;
}
interface VeoVideoGenResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: VeoVideoGenResult[];
}
interface VeoVideoGenResult {
    progress?: number;
    url?: string;
    gcsUri?: string;
    encoding?: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface HeygenVideoGenerateCommand {
    avatar_id?: string;
    image_url?: string;
    image_asset_id?: string;
    script?: string;
    voice_id?: string;
    audio_url?: string;
    audio_asset_id?: string;
    title?: string;
    resolution?: "1080p" | "720p" | "4k";
    aspect_ratio?: "16:9" | "9:16";
    motion_prompt?: string;
    expressiveness?: "low" | "medium" | "high";
    remove_background?: boolean;
    background?: BackgroundConfig;
    voice_settings?: VoiceSettingsConfig;
    options?: GenAIOptions$1C;
}
interface BackgroundConfig {
    type: "color" | "image";
    value?: string;
    url?: string;
    asset_id?: string;
}
interface VoiceSettingsConfig {
    speed?: number;
    pitch?: number;
    locale?: string;
}
interface GenAIOptions$1C {
    safety_checks?: SafetyChecksOptions$1C;
    drive?: DriveOptions$1C;
}
interface SafetyChecksOptions$1C {
    enabled?: boolean;
}
interface DriveOptions$1C {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1C;
}
interface DriveFolderOptions$1C {
    path?: string;
    id?: string;
}
interface HeygenVideoGenerateResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: HeygenVideoGenerateResult;
}
interface HeygenVideoGenerateResult {
    url: string;
    video_id: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

type HeygenListAvatarsCommand = Record<string, never>;
interface HeygenListAvatarsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: HeygenListAvatarsResult;
}
interface HeygenListAvatarsResult {
    avatars: Avatar[];
    talking_photos: TalkingPhoto[];
}
interface Avatar {
    avatar_id: string;
    avatar_name: string;
    gender: string;
    preview_image_url: string;
    preview_video_url: string;
    premium: boolean;
    type: string;
    tags: string[];
    default_voice_id: string;
}
interface TalkingPhoto {
    talking_photo_id: string;
    talking_photo_name: string;
    preview_image_url: string;
}

type HeygenListVoicesCommand = Record<string, never>;
interface HeygenListVoicesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: HeygenListVoicesResult;
}
interface HeygenListVoicesResult {
    voices: Voice[];
}
interface Voice {
    voice_id: string;
    language: string;
    gender: string;
    name: string;
    preview_audio: string;
    support_pause: boolean;
    emotion_support: boolean;
    support_interactive_avatar: boolean;
    support_locale: boolean;
}

interface OpenAiSoraCharactersCommand {
    video_url: string;
    name: string;
}
interface OpenAiSoraCharactersResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: OpenAiSoraCharacterResult;
}
interface OpenAiSoraCharacterResult {
    id: string;
    name: string;
}

interface OpenAiSoraExtensionsCommand {
    video_id: string;
    prompt: string;
    seconds?: number;
    options?: GenAIOptions$1B;
}
interface GenAIOptions$1B {
    safety_checks?: SafetyChecksOptions$1B;
    drive?: DriveOptions$1B;
}
interface SafetyChecksOptions$1B {
    enabled?: boolean;
}
interface DriveOptions$1B {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1B;
}
interface DriveFolderOptions$1B {
    path?: string;
    id?: string;
}
interface OpenAiSoraExtensionsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: OpenAiSoraResult$1;
}
interface OpenAiSoraResult$1 {
    videoUrl: string;
    videoId: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface OpenAiSoraEditsCommand {
    video_id: string;
    prompt: string;
    model?: "sora-2-pro" | "sora-2";
    options?: GenAIOptions$1A;
}
interface GenAIOptions$1A {
    safety_checks?: SafetyChecksOptions$1A;
    drive?: DriveOptions$1A;
}
interface SafetyChecksOptions$1A {
    enabled?: boolean;
}
interface DriveOptions$1A {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1A;
}
interface DriveFolderOptions$1A {
    path?: string;
    id?: string;
}
interface OpenAiSoraEditsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: OpenAiSoraResult;
}
interface OpenAiSoraResult {
    videoUrl: string;
    videoId: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface OpenAiSoraBatchCommand {
    requests: SoraBatchRequest[];
    options?: GenAIOptions$1z;
}
interface SoraBatchRequest {
    custom_id: string;
    prompt: string;
    model?: "sora-2-pro" | "sora-2";
    size?: "720x1280" | "1280x720" | "1024x1792" | "1792x1024" | "1080x1920" | "1920x1080";
    seconds?: number;
    input_reference_file_id?: string;
    input_reference_image_url?: string;
    characters?: SoraCharacterReference[];
}
interface SoraCharacterReference {
    id: string;
}
interface GenAIOptions$1z {
    safety_checks?: SafetyChecksOptions$1z;
    drive?: DriveOptions$1z;
}
interface SafetyChecksOptions$1z {
    enabled?: boolean;
}
interface DriveOptions$1z {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1z;
}
interface DriveFolderOptions$1z {
    path?: string;
    id?: string;
}
interface OpenAiSoraBatchResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: OpenAiSoraBatchResult;
}
interface OpenAiSoraBatchResult {
    results: SoraBatchVideoResult[];
}
interface SoraBatchVideoResult {
    custom_id: string;
    videoId?: string;
    videoUrl?: string;
    error?: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface GeminiV1AudiosCommand {
    text: string;
    model: GeminiTtsModel;
    voiceName?: PrebuiltVoiceName;
    multiSpeakerVoiceConfigs?: SpeakerVoiceConfigDto[];
    options?: GenAIOptions$1y;
}
type GeminiTtsModel = "gemini-2.5-flash-tts" | "gemini-2.5-pro-tts";
type PrebuiltVoiceName = "Puck" | "Kore" | "Charon" | "Fenrir" | "Aoede" | "Leda" | "Zephyr" | "Orus" | "Autonoe" | "Callirhoe" | "Despina" | "Erinome" | "Gacrux" | "Laomedeia" | "Pulcherrima" | "Sulafat" | "Vindemiatrix" | "Achernar" | "Achird" | "Algenib" | "Algieba" | "Alnilam" | "Enceladus" | "Iapetus" | "Rasalgethi" | "Sadachbia" | "Sadaltager" | "Schedar" | "Umbriel" | "Zubenelgenubi";
interface SpeakerVoiceConfigDto {
    speaker: string;
    voiceName: PrebuiltVoiceName;
}
interface GenAIOptions$1y {
    safety_checks?: SafetyChecksOptions$1y;
    drive?: DriveOptions$1y;
}
interface SafetyChecksOptions$1y {
    enabled?: boolean;
}
interface DriveOptions$1y {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1y;
}
interface DriveFolderOptions$1y {
    path?: string;
    id?: string;
}
interface GeminiV1AudiosResult {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeminiV1AudiosResponse;
}
interface GeminiV1AudiosResponse {
    audioUrls: GeminiAudioUrl[];
}
interface GeminiAudioUrl {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface LyriaMusicCommand {
    prompt: string;
    model?: LyriaModels;
    negativePrompt?: string;
    sampleCount?: number;
    seed?: number;
    options?: GenAIOptions$1x;
}
type LyriaModels = "lyria-002";
interface GenAIOptions$1x {
    safety_checks?: SafetyChecksOptions$1x;
    drive?: DriveOptions$1x;
}
interface SafetyChecksOptions$1x {
    enabled?: boolean;
}
interface DriveOptions$1x {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1x;
}
interface DriveFolderOptions$1x {
    path?: string;
    id?: string;
}
interface LyriaMusicResult {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LyriaMusicResponse;
}
interface LyriaMusicResponse {
    audioUrls: LyriaAudioUrl[];
}
interface LyriaAudioUrl {
    url: string;
    mimeType: string;
    driveFile?: Record<string, unknown>;
}

interface RecraftExploreCommand {
    prompt: string;
    model?: "recraftv4" | "recraftv4_vector" | "recraftv4_pro" | "recraftv4_pro_vector";
    size?: string;
    options?: GenAIOptions$1w;
}
interface GenAIOptions$1w {
    safety_checks?: SafetyChecksOptions$1w;
    drive?: DriveOptions$1w;
}
interface SafetyChecksOptions$1w {
    enabled?: boolean;
}
interface DriveOptions$1w {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1w;
}
interface DriveFolderOptions$1w {
    path?: string;
    id?: string;
}
interface RecraftExploreResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: RecraftExploreResult;
}
interface RecraftExploreResult {
    items: RecraftExploreResultItem[];
}
interface RecraftExploreResultItem {
    image_id: string;
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface RecraftExploreSimilarCommand {
    source_image_id: string;
    similarity: number;
    options?: GenAIOptions$1v;
}
interface GenAIOptions$1v {
    safety_checks?: SafetyChecksOptions$1v;
    drive?: DriveOptions$1v;
}
interface SafetyChecksOptions$1v {
    enabled?: boolean;
}
interface DriveOptions$1v {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1v;
}
interface DriveFolderOptions$1v {
    path?: string;
    id?: string;
}
interface RecraftExploreSimilarResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: RecraftExploreSimilarResult;
}
interface RecraftExploreSimilarResult {
    items: RecraftExploreSimilarResultItem[];
}
interface RecraftExploreSimilarResultItem {
    image_id: string;
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface KlingImageGenerationCommand {
    model_name?: KlingImageModels;
    prompt: string;
    negative_prompt?: string;
    image?: string;
    image_reference?: KlingImageReferenceType;
    image_fidelity?: number;
    human_fidelity?: number;
    n?: number;
    aspect_ratio?: KlingImageAspectRatio$2;
    callback_url?: string;
    options?: GenAIOptions$1u;
}
type KlingImageModels = "kling-v2" | "kling-v2-1" | "kling-v2-new" | "kling-v1-5" | "kling-v3";
type KlingImageReferenceType = "subject" | "face";
type KlingImageAspectRatio$2 = "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
interface GenAIOptions$1u {
    safety_checks?: SafetyChecksOptions$1u;
    drive?: DriveOptions$1u;
}
interface SafetyChecksOptions$1u {
    enabled?: boolean;
}
interface DriveOptions$1u {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1u;
}
interface DriveFolderOptions$1u {
    path?: string;
    id?: string;
}
interface KlingImageGenerationResponse {
    result: KlingImageResult$2;
}
interface KlingImageResult$2 {
    items: KlingImageResultItem$2[];
}
interface KlingImageResultItem$2 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface KlingOmniImageCommand {
    model_name?: KlingOmniImageModels;
    prompt: string;
    image_list?: OmniImageReference[];
    aspect_ratio?: KlingImageAspectRatio$1;
    resolution?: KlingV3OmniResolution;
    n?: number;
    options?: GenAIOptions$1t;
}
type KlingOmniImageModels = "kling-image-o1" | "kling-v3-omni";
interface OmniImageReference {
    image_url: string;
}
type KlingImageAspectRatio$1 = "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
type KlingV3OmniResolution = "1k" | "2k" | "4k";
interface GenAIOptions$1t {
    safety_checks?: SafetyChecksOptions$1t;
    drive?: DriveOptions$1t;
}
interface SafetyChecksOptions$1t {
    enabled?: boolean;
}
interface DriveOptions$1t {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1t;
}
interface DriveFolderOptions$1t {
    path?: string;
    id?: string;
}
interface KlingOmniImageResponse {
    result: KlingImageResult$1;
}
interface KlingImageResult$1 {
    items: KlingImageResultItem$1[];
}
interface KlingImageResultItem$1 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface KlingMultiImageToImageCommand {
    model_name?: "kling-v2" | "kling-v2-1";
    prompt?: string;
    subject_image_list: SubjectImage[];
    scene_image?: string;
    style_image?: string;
    n?: number;
    aspect_ratio?: KlingImageAspectRatio;
    callback_url?: string;
    options?: GenAIOptions$1s;
}
interface SubjectImage {
    subject_image: string;
}
type KlingImageAspectRatio = "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
interface GenAIOptions$1s {
    safety_checks?: SafetyChecksOptions$1s;
    drive?: DriveOptions$1s;
}
interface SafetyChecksOptions$1s {
    enabled?: boolean;
}
interface DriveOptions$1s {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1s;
}
interface DriveFolderOptions$1s {
    path?: string;
    id?: string;
}
interface KlingMultiImageToImageResponse {
    result: KlingImageResult;
}
interface KlingImageResult {
    items: KlingImageResultItem[];
}
interface KlingImageResultItem {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface WanImagesCommand {
    prompt: string;
    image_urls?: string[];
    negative_prompt?: string;
    model?: "wan2.6-t2i" | "wan2.6-image";
    size?: string;
    n?: number;
    prompt_extend?: boolean;
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$1r;
}
interface GenAIOptions$1r {
    safety_checks?: SafetyChecksOptions$1r;
    drive?: DriveOptions$1r;
}
interface SafetyChecksOptions$1r {
    enabled?: boolean;
}
interface DriveOptions$1r {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1r;
}
interface DriveFolderOptions$1r {
    path?: string;
    id?: string;
}
interface WanImagesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: WanImagesResult;
}
interface WanImagesResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface LTXV23TextToVideoRequest {
    fps?: 24 | 25 | 48 | 50;
    duration?: 6 | 8 | 10;
    generate_audio?: boolean;
    aspect_ratio?: "16:9" | "9:16";
    prompt: string;
    resolution?: "1080p" | "1440p" | "2160p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Ltx23TextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXV23TextToVideoResponse;
}
interface LTXV23TextToVideoResponse {
    video: {
        url: string;
        duration?: number | unknown;
        height?: number | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        width?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
    };
}

interface LTXV23ImageToVideoRequest {
    generate_audio?: boolean;
    duration?: 6 | 8 | 10;
    image_url: string;
    end_image_url?: string | unknown;
    fps?: 24 | 25 | 48 | 50;
    aspect_ratio?: "auto" | "16:9" | "9:16";
    prompt: string;
    resolution?: "1080p" | "1440p" | "2160p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Ltx23ImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXV23ImageToVideoResponse;
}
interface LTXV23ImageToVideoResponse {
    video: {
        url: string;
        duration?: number | unknown;
        height?: number | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        width?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
    };
}

interface LTXV23TextToVideoFastRequest {
    fps?: 24 | 25 | 48 | 50;
    duration?: 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20;
    generate_audio?: boolean;
    aspect_ratio?: "16:9" | "9:16";
    prompt: string;
    resolution?: "1080p" | "1440p" | "2160p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Ltx23TextToVideoFastResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXV23TextToVideoFastResponse;
}
interface LTXV23TextToVideoFastResponse {
    video: {
        url: string;
        duration?: number | unknown;
        height?: number | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        width?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
    };
}

interface LTXV23ImageToVideoFastRequest {
    generate_audio?: boolean;
    duration?: 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20;
    image_url: string;
    end_image_url?: string | unknown;
    fps?: 24 | 25 | 48 | 50;
    aspect_ratio?: "auto" | "16:9" | "9:16";
    prompt: string;
    resolution?: "1080p" | "1440p" | "2160p";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Ltx23ImageToVideoFastResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXV23ImageToVideoFastResponse;
}
interface LTXV23ImageToVideoFastResponse {
    video: {
        url: string;
        duration?: number | unknown;
        height?: number | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        width?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
    };
}

interface LTXV23AudioToVideoRequest {
    guidance_scale?: number | unknown;
    image_url?: string | unknown;
    audio_url: string;
    prompt?: string | unknown;
    aspect_ratio?: "auto" | "16:9" | "9:16";
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Ltx23AudioToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXV23AudioToVideoResponse;
}
interface LTXV23AudioToVideoResponse {
    video: {
        url: string;
        duration?: number | unknown;
        height?: number | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        width?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
    };
}

interface LTXV23ExtendVideoRequest {
    context?: number | unknown;
    video_url: string;
    duration?: number;
    mode?: "start" | "end";
    prompt?: string | unknown;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Ltx23ExtendVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXV23ExtendVideoResponse;
}
interface LTXV23ExtendVideoResponse {
    video: {
        url: string;
        duration?: number | unknown;
        height?: number | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        width?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
    };
}

interface LTXV23RetakeVideoRequest {
    video_url: string;
    duration?: number;
    retake_mode?: "replace_audio" | "replace_video" | "replace_audio_and_video";
    start_time?: number;
    prompt: string;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Ltx23RetakeVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXV23RetakeVideoResponse;
}
interface LTXV23RetakeVideoResponse {
    video: {
        url: string;
        duration?: number | unknown;
        height?: number | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        width?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
    };
}

interface AudioIsolationCommand {
    audio_url: string;
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    options?: GenAIOptions$1q;
}
interface GenAIOptions$1q {
    safety_checks?: SafetyChecksOptions$1q;
    drive?: DriveOptions$1q;
}
interface SafetyChecksOptions$1q {
    enabled?: boolean;
}
interface DriveOptions$1q {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1q;
}
interface DriveFolderOptions$1q {
    path?: string;
    id?: string;
}
interface AudioIsolationResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AudioIsolationResult;
}
interface AudioIsolationResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface DubbingCommand {
    audio_url: string;
    source_lang: string;
    target_lang: string;
    source_url?: string;
    num_speakers?: number;
    watermark?: boolean;
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    options?: GenAIOptions$1p;
}
interface GenAIOptions$1p {
    safety_checks?: SafetyChecksOptions$1p;
    drive?: DriveOptions$1p;
}
interface SafetyChecksOptions$1p {
    enabled?: boolean;
}
interface DriveOptions$1p {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1p;
}
interface DriveFolderOptions$1p {
    path?: string;
    id?: string;
}
interface DubbingResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: DubbingResult;
}
interface DubbingResult {
    url: string;
    dubbing_id: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface VoiceRemixCommand {
    voice_id: string;
    voice_description: string;
    text?: string;
    auto_generate_text?: boolean;
    loudness?: number;
    seed?: number;
    guidance_scale?: number;
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    options?: GenAIOptions$1o;
}
interface GenAIOptions$1o {
    safety_checks?: SafetyChecksOptions$1o;
    drive?: DriveOptions$1o;
}
interface SafetyChecksOptions$1o {
    enabled?: boolean;
}
interface DriveOptions$1o {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1o;
}
interface DriveFolderOptions$1o {
    path?: string;
    id?: string;
}
interface VoiceRemixResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: VoiceRemixResult;
}
interface VoiceRemixResult {
    previews: VoicePreview[];
    driveFile?: Record<string, unknown>;
}
interface VoicePreview {
    generated_voice_id: string;
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface TextToDialogueCommand {
    conversation: ConversationItem[];
    language_code?: string;
    seed?: number;
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    options?: GenAIOptions$1n;
}
interface ConversationItem {
    voice_id: string;
    text: string;
}
interface GenAIOptions$1n {
    safety_checks?: SafetyChecksOptions$1n;
    drive?: DriveOptions$1n;
}
interface SafetyChecksOptions$1n {
    enabled?: boolean;
}
interface DriveOptions$1n {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1n;
}
interface DriveFolderOptions$1n {
    path?: string;
    id?: string;
}
interface TextToDialogueResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: DialogueAudioResult;
}
interface DialogueAudioResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface VoiceDesignCommand {
    voice_description: string;
    model_id?: "eleven_multilingual_ttv_v2" | "eleven_ttv_v3";
    text?: string;
    auto_generate_text?: boolean;
    loudness?: number;
    quality?: number;
    seed?: number;
    guidance_scale?: number;
    should_enhance?: boolean;
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    options?: GenAIOptions$1m;
}
interface GenAIOptions$1m {
    safety_checks?: SafetyChecksOptions$1m;
    drive?: DriveOptions$1m;
}
interface SafetyChecksOptions$1m {
    enabled?: boolean;
}
interface DriveOptions$1m {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1m;
}
interface DriveFolderOptions$1m {
    path?: string;
    id?: string;
}
interface VoiceDesignResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: VoiceDesignResult;
}
interface VoiceDesignResult {
    previews: VoiceDesignPreview[];
    driveFile?: Record<string, unknown>;
}
interface VoiceDesignPreview {
    generated_voice_id: string;
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface VoiceCreatePreviewsCommand {
    voice_description: string;
    text?: string;
    auto_generate_text?: boolean;
    loudness?: number;
    quality?: number;
    seed?: number;
    guidance_scale?: number;
    should_enhance?: boolean;
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    options?: GenAIOptions$1l;
}
interface GenAIOptions$1l {
    safety_checks?: SafetyChecksOptions$1l;
    drive?: DriveOptions$1l;
}
interface SafetyChecksOptions$1l {
    enabled?: boolean;
}
interface DriveOptions$1l {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1l;
}
interface DriveFolderOptions$1l {
    path?: string;
    id?: string;
}
interface VoiceCreatePreviewsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: VoiceCreatePreviewsResult;
}
interface VoiceCreatePreviewsResult {
    previews: VoiceCreatePreviewItem[];
    driveFile?: Record<string, unknown>;
}
interface VoiceCreatePreviewItem {
    generated_voice_id: string;
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface WanImageToVideoFirstFrameCommand {
    img_url: string;
    prompt?: string;
    negative_prompt?: string;
    audio_url?: string;
    model?: "wan2.6-i2v";
    resolution?: "720P" | "1080P";
    duration?: number;
    prompt_extend?: boolean;
    shot_type?: "single" | "multi";
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$1k;
}
interface GenAIOptions$1k {
    safety_checks?: SafetyChecksOptions$1k;
    drive?: DriveOptions$1k;
}
interface SafetyChecksOptions$1k {
    enabled?: boolean;
}
interface DriveOptions$1k {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1k;
}
interface DriveFolderOptions$1k {
    path?: string;
    id?: string;
}
interface WanImageToVideoFirstFrameResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: WanImageToVideoFirstFrameResult;
}
interface WanImageToVideoFirstFrameResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface WanTextToVideoCommand {
    prompt: string;
    negative_prompt?: string;
    audio_url?: string;
    model?: "wan2.6-t2v";
    size?: string;
    duration?: number;
    prompt_extend?: boolean;
    shot_type?: "single" | "multi";
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$1j;
}
interface GenAIOptions$1j {
    safety_checks?: SafetyChecksOptions$1j;
    drive?: DriveOptions$1j;
}
interface SafetyChecksOptions$1j {
    enabled?: boolean;
}
interface DriveOptions$1j {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1j;
}
interface DriveFolderOptions$1j {
    path?: string;
    id?: string;
}
interface WanTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: WanTextToVideoResult;
}
interface WanTextToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface WanReferenceToVideoCommand {
    prompt: string;
    reference_urls: string[];
    negative_prompt?: string;
    model?: "wan2.6-r2v";
    size?: string;
    duration?: number;
    shot_type?: "single" | "multi";
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$1i;
}
interface GenAIOptions$1i {
    safety_checks?: SafetyChecksOptions$1i;
    drive?: DriveOptions$1i;
}
interface SafetyChecksOptions$1i {
    enabled?: boolean;
}
interface DriveOptions$1i {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1i;
}
interface DriveFolderOptions$1i {
    path?: string;
    id?: string;
}
interface WanReferenceToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: WanReferenceToVideoResult;
}
interface WanReferenceToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface WanImageToVideoFirstAndLastFramesCommand {
    first_frame_url: string;
    last_frame_url: string;
    prompt?: string;
    negative_prompt?: string;
    model?: "wan2.2-kf2v-flash" | "wan2.1-kf2v-plus";
    resolution?: "480P" | "720P" | "1080P";
    duration?: number;
    prompt_extend?: boolean;
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$1h;
}
interface GenAIOptions$1h {
    safety_checks?: SafetyChecksOptions$1h;
    drive?: DriveOptions$1h;
}
interface SafetyChecksOptions$1h {
    enabled?: boolean;
}
interface DriveOptions$1h {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1h;
}
interface DriveFolderOptions$1h {
    path?: string;
    id?: string;
}
interface WanImageToVideoFirstAndLastFramesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: WanImageToVideoFirstAndLastFramesResult;
}
interface WanImageToVideoFirstAndLastFramesResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface SingleImageInputModel {
    remesh_band?: number;
    shape_slat_guidance_interval_start?: number;
    tex_slat_guidance_strength?: number;
    tex_slat_guidance_rescale?: number;
    image_url: string;
    shape_slat_sampling_steps?: number;
    uv_unwrap_global_iterations?: number;
    seed?: number | unknown;
    ss_guidance_interval_start?: number;
    resolution?: 512 | 1024 | 1536;
    decimation_target?: number;
    remesh?: boolean;
    shape_slat_guidance_interval_end?: number;
    ss_sampling_steps?: number;
    uv_unwrap_angle_threshold_deg?: number;
    ss_guidance_strength?: number;
    uv_unwrap_refine_iterations?: number;
    shape_slat_guidance_strength?: number;
    uv_unwrap_smooth_strength?: number;
    ss_guidance_rescale?: number;
    shape_slat_guidance_rescale?: number;
    remesh_project?: number;
    ss_rescale_t?: number;
    ss_guidance_interval_end?: number;
    tex_slat_guidance_interval_start?: number;
    texture_size?: 1024 | 2048 | 4096;
    tex_slat_rescale_t?: number;
    tex_slat_guidance_interval_end?: number;
    shape_slat_rescale_t?: number;
    tex_slat_sampling_steps?: number;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface Trellis2Response {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ObjectOutput;
}
interface ObjectOutput {
    model_glb: {
        file_name?: string | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        url: string;
    };
}

interface Lyria3MusicCommand {
    prompt: string;
    model?: Lyria3Models;
    image?: Lyria3ImageInput;
    options?: GenAIOptions$1g;
}
type Lyria3Models = "lyria-3-clip-preview" | "lyria-3-pro-preview";
interface Lyria3ImageInput {
    mimeType?: string;
    url?: string;
    uri?: string;
    data?: string;
}
interface GenAIOptions$1g {
    safety_checks?: SafetyChecksOptions$1g;
    drive?: DriveOptions$1g;
}
interface SafetyChecksOptions$1g {
    enabled?: boolean;
}
interface DriveOptions$1g {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1g;
}
interface DriveFolderOptions$1g {
    path?: string;
    id?: string;
}
interface Lyria3MusicResult {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Lyria3MusicResponse;
}
interface Lyria3MusicResponse {
    url: string;
    mimeType: string;
    lyrics?: string;
    description?: string;
    driveFile?: Record<string, unknown>;
}

interface WanV2TextToVideoCommand {
    prompt: string;
    negative_prompt?: string;
    audio_url?: string;
    model?: "wan2.7-t2v";
    resolution?: "720P" | "1080P";
    ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    duration?: number;
    prompt_extend?: boolean;
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$1f;
}
interface GenAIOptions$1f {
    safety_checks?: SafetyChecksOptions$1f;
    drive?: DriveOptions$1f;
}
interface SafetyChecksOptions$1f {
    enabled?: boolean;
}
interface DriveOptions$1f {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1f;
}
interface DriveFolderOptions$1f {
    path?: string;
    id?: string;
}
interface WanV2TextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: WanV2TextToVideoResult;
}
interface WanV2TextToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface WanV2ImageToVideoCommand {
    prompt?: string;
    negative_prompt?: string;
    media: WanV2I2VMediaItem[];
    model?: "wan2.7-i2v";
    resolution?: "720P" | "1080P";
    duration?: number;
    prompt_extend?: boolean;
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$1e;
}
interface WanV2I2VMediaItem {
    type: "first_frame" | "last_frame" | "driving_audio" | "first_clip";
    url: string;
}
interface GenAIOptions$1e {
    safety_checks?: SafetyChecksOptions$1e;
    drive?: DriveOptions$1e;
}
interface SafetyChecksOptions$1e {
    enabled?: boolean;
}
interface DriveOptions$1e {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1e;
}
interface DriveFolderOptions$1e {
    path?: string;
    id?: string;
}
interface WanV2ImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: WanV2ImageToVideoResult;
}
interface WanV2ImageToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface WanV2ReferenceToVideoCommand {
    prompt: string;
    media: WanV2R2VMediaItem[];
    negative_prompt?: string;
    model?: "wan2.7-r2v";
    resolution?: "720P" | "1080P";
    ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    duration?: number;
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$1d;
}
interface WanV2R2VMediaItem {
    type: "reference_image" | "reference_video" | "first_frame";
    url: string;
    reference_voice?: WanV2R2VVoiceReference;
}
interface WanV2R2VVoiceReference {
    url: string;
}
interface GenAIOptions$1d {
    safety_checks?: SafetyChecksOptions$1d;
    drive?: DriveOptions$1d;
}
interface SafetyChecksOptions$1d {
    enabled?: boolean;
}
interface DriveOptions$1d {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1d;
}
interface DriveFolderOptions$1d {
    path?: string;
    id?: string;
}
interface WanV2ReferenceToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: WanV2ReferenceToVideoResult;
}
interface WanV2ReferenceToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface WanV2VideoEditCommand {
    prompt?: string;
    negative_prompt?: string;
    media: WanV2VideoEditMediaItem[];
    model?: "wan2.7-videoedit";
    resolution?: "720P" | "1080P";
    ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    duration?: number;
    audio_setting?: "auto" | "origin";
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$1c;
}
interface WanV2VideoEditMediaItem {
    type: "video" | "reference_image";
    url: string;
}
interface GenAIOptions$1c {
    safety_checks?: SafetyChecksOptions$1c;
    drive?: DriveOptions$1c;
}
interface SafetyChecksOptions$1c {
    enabled?: boolean;
}
interface DriveOptions$1c {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1c;
}
interface DriveFolderOptions$1c {
    path?: string;
    id?: string;
}
interface WanV2VideoEditResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: WanV2VideoEditResult;
}
interface WanV2VideoEditResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface QwenImage2TextToImageInput {
    enable_prompt_expansion?: boolean;
    output_format?: "jpeg" | "png" | "webp";
    num_images?: number;
    enable_safety_checker?: boolean;
    negative_prompt?: string | unknown;
    image_size?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
    sync_mode?: boolean;
    prompt: string;
    seed?: number | unknown;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface QwenImage2TextToImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenImage2TextToImageOutput;
}
interface QwenImage2TextToImageOutput {
    seed: number;
    images: ({
        file_name?: string | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        url: string;
    })[];
}

interface QwenImage2EditInput {
    enable_prompt_expansion?: boolean;
    output_format?: "jpeg" | "png" | "webp";
    image_urls: string[];
    num_images?: number;
    enable_safety_checker?: boolean;
    negative_prompt?: string | unknown;
    image_size?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" | unknown;
    sync_mode?: boolean;
    prompt: string;
    seed?: number | unknown;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface QwenImage2EditResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenImage2EditOutput;
}
interface QwenImage2EditOutput {
    seed: number;
    images: ({
        file_name?: string | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        url: string;
    })[];
}

interface QwenImage2ProTextToImageInput {
    enable_prompt_expansion?: boolean;
    output_format?: "jpeg" | "png" | "webp";
    num_images?: number;
    enable_safety_checker?: boolean;
    negative_prompt?: string | unknown;
    image_size?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
    sync_mode?: boolean;
    prompt: string;
    seed?: number | unknown;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface QwenImage2ProTextToImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenImage2ProTextToImageOutput;
}
interface QwenImage2ProTextToImageOutput {
    seed: number;
    images: ({
        file_name?: string | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        url: string;
    })[];
}

interface QwenImage2ProEditInput {
    enable_prompt_expansion?: boolean;
    output_format?: "jpeg" | "png" | "webp";
    image_urls: string[];
    num_images?: number;
    enable_safety_checker?: boolean;
    negative_prompt?: string | unknown;
    image_size?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" | unknown;
    sync_mode?: boolean;
    prompt: string;
    seed?: number | unknown;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface QwenImage2ProEditResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenImage2ProEditOutput;
}
interface QwenImage2ProEditOutput {
    seed: number;
    images: ({
        file_name?: string | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        url: string;
    })[];
}

interface FluxOutpaintingCommand {
    model?: FluxOutpaintingModel;
    prompt?: string;
    imageUrl: string;
    width: number;
    height: number;
    referenceOffsetX?: number;
    referenceOffsetY?: number;
    autoCrop?: boolean;
    mode?: "fast" | "high";
    safetyTolerance?: number;
    outputFormat?: "jpeg" | "png";
    options?: GenAIOptions$1b;
}
type FluxOutpaintingModel = "flux-tools/outpainting-v1" | "flux-tools/outpainting-v1-fast-private";
interface GenAIOptions$1b {
    safety_checks?: SafetyChecksOptions$1b;
    drive?: DriveOptions$1b;
}
interface SafetyChecksOptions$1b {
    enabled?: boolean;
}
interface DriveOptions$1b {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1b;
}
interface DriveFolderOptions$1b {
    path?: string;
    id?: string;
}
interface FluxOutpaintingResult {
    result: GeneratedImageResult$3;
}
interface GeneratedImageResult$3 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface StandardTextToVideoHailuo23Input {
    prompt: string;
    duration?: "6" | "10";
    prompt_optimizer?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface MinimaxHailuo23StandardTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: StandardTextToVideoHailuo23Output;
}
interface StandardTextToVideoHailuo23Output {
    video: {
        url: string;
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
    };
}

interface StandardImageToVideoHailuo23Input {
    prompt: string;
    image_url: string;
    duration?: "6" | "10";
    prompt_optimizer?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface MinimaxHailuo23StandardImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: StandardImageToVideoHailuo23Output;
}
interface StandardImageToVideoHailuo23Output {
    video: {
        url: string;
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
    };
}

interface ProTextToVideoHailuo23Input {
    prompt: string;
    prompt_optimizer?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface MinimaxHailuo23ProTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ProTextToVideoHailuo23Output;
}
interface ProTextToVideoHailuo23Output {
    video: {
        url: string;
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
    };
}

interface ProImageToVideoHailuo23Input {
    prompt: string;
    image_url: string;
    prompt_optimizer?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface MinimaxHailuo23ProImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ProImageToVideoHailuo23Output;
}
interface ProImageToVideoHailuo23Output {
    video: {
        url: string;
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
    };
}

interface StandardFastImageToVideoHailuo23Input {
    prompt: string;
    image_url: string;
    duration?: "6" | "10";
    prompt_optimizer?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface MinimaxHailuo23FastStandardImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: StandardFastImageToVideoHailuo23Output;
}
interface StandardFastImageToVideoHailuo23Output {
    video: {
        url: string;
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
    };
}

interface ProFastImageToVideoHailuo23Input {
    prompt: string;
    image_url: string;
    prompt_optimizer?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface MinimaxHailuo23FastProImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ProFastImageToVideoHailuo23Output;
}
interface ProFastImageToVideoHailuo23Output {
    video: {
        url: string;
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
    };
}

interface TextToImageCommand$1 {
    promptText: string;
    ratio: "1920:1080" | "1080:1920" | "1024:1024" | "1360:768" | "1080:1080" | "1168:880" | "1440:1080" | "1080:1440" | "1808:768" | "2112:912";
    referenceImages?: ReferenceImage[];
    options?: GenAIOptions$1a;
}
interface ReferenceImage {
    uri: string;
    tag?: string;
}
interface GenAIOptions$1a {
    safety_checks?: SafetyChecksOptions$1a;
    drive?: DriveOptions$1a;
}
interface SafetyChecksOptions$1a {
    enabled?: boolean;
}
interface DriveOptions$1a {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1a;
}
interface DriveFolderOptions$1a {
    path?: string;
    id?: string;
}
interface TextToImageResponse$1 {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeneratedImageResult$2;
}
interface GeneratedImageResult$2 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface CharacterPerformanceCommand {
    character: MediaReference;
    reference: VideoReference;
    ratio: "1280:720" | "720:1280" | "960:960" | "1104:832" | "832:1104" | "1584:672";
    bodyControl?: boolean;
    expressionIntensity?: number;
    seed?: number;
    contentModeration?: ContentModeration$3;
    options?: GenAIOptions$19;
}
interface MediaReference {
    type: "video" | "image";
    uri: string;
}
interface VideoReference {
    type: "video";
    uri: string;
}
interface ContentModeration$3 {
    publicFigureThreshold: "auto" | "low";
}
interface GenAIOptions$19 {
    safety_checks?: SafetyChecksOptions$19;
    drive?: DriveOptions$19;
}
interface SafetyChecksOptions$19 {
    enabled?: boolean;
}
interface DriveOptions$19 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$19;
}
interface DriveFolderOptions$19 {
    path?: string;
    id?: string;
}
interface CharacterPerformanceResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeneratedVideoResult$5;
}
interface GeneratedVideoResult$5 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface VideoToVideoCommand {
    model: "gen4_aleph" | "aleph2";
    videoUri: string;
    promptText: string;
    ratio?: "1280:720" | "720:1280" | "1104:832" | "960:960" | "832:1104" | "1584:672" | "848:480" | "640:480";
    seed?: number;
    references?: ImageReference[];
    promptImage?: PromptImage$1[];
    contentModeration?: ContentModeration$2;
    transformVideo?: ContentModeration$2;
    options?: GenAIOptions$18;
}
interface ImageReference {
    type: "image";
    uri: string;
}
interface PromptImage$1 {
    uri: string;
    position: "first" | "last" | {
        type?: "timestamp";
        timestampSeconds?: number;
    };
}
interface ContentModeration$2 {
    publicFigureThreshold: "auto" | "low";
}
interface GenAIOptions$18 {
    safety_checks?: SafetyChecksOptions$18;
    drive?: DriveOptions$18;
}
interface SafetyChecksOptions$18 {
    enabled?: boolean;
}
interface DriveOptions$18 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$18;
}
interface DriveFolderOptions$18 {
    path?: string;
    id?: string;
}
interface VideoToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeneratedVideoResult$4;
}
interface GeneratedVideoResult$4 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface ImageToVideoCommand$2 {
    promptText: string;
    ratio: "1280:720" | "720:1280" | "1104:832" | "960:960" | "832:1104";
    duration: 5 | 8 | 10;
    seed?: number;
    contentModeration?: ContentModeration$1;
    options?: GenAIOptions$17;
    promptImage: PromptImage[];
}
interface ContentModeration$1 {
    publicFigureThreshold: "auto" | "low";
}
interface GenAIOptions$17 {
    safety_checks?: SafetyChecksOptions$17;
    drive?: DriveOptions$17;
}
interface SafetyChecksOptions$17 {
    enabled?: boolean;
}
interface DriveOptions$17 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$17;
}
interface DriveFolderOptions$17 {
    path?: string;
    id?: string;
}
interface PromptImage {
    uri: string;
    position: "first";
}
interface ImageToVideoResponse$2 {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeneratedVideoResult$3;
}
interface GeneratedVideoResult$3 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface TextToVideoCommand$1 {
    promptText: string;
    ratio: "1280:720" | "720:1280" | "1104:832" | "960:960" | "832:1104";
    duration: 5 | 8 | 10;
    seed?: number;
    contentModeration?: ContentModeration;
    options?: GenAIOptions$16;
}
interface ContentModeration {
    publicFigureThreshold: "auto" | "low";
}
interface GenAIOptions$16 {
    safety_checks?: SafetyChecksOptions$16;
    drive?: DriveOptions$16;
}
interface SafetyChecksOptions$16 {
    enabled?: boolean;
}
interface DriveOptions$16 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$16;
}
interface DriveFolderOptions$16 {
    path?: string;
    id?: string;
}
interface TextToVideoResponse$1 {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeneratedVideoResult$2;
}
interface GeneratedVideoResult$2 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface ImageToVideoCommand$1 {
    prompt: string;
    aspect_ratio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "9:21";
    loop?: boolean;
    keyframes: Keyframes;
    model?: "ray-2" | "ray-flash-2";
    callback_url?: string;
    resolution?: "540p" | "720p" | "1080p" | "4k";
    duration?: "5s" | "9s";
    options?: GenAIOptions$15;
}
interface Keyframes {
    frame0?: KeyframeImage;
    frame1?: KeyframeImage;
}
interface KeyframeImage {
    type: string;
    url: string;
}
interface GenAIOptions$15 {
    safety_checks?: SafetyChecksOptions$15;
    drive?: DriveOptions$15;
}
interface SafetyChecksOptions$15 {
    enabled?: boolean;
}
interface DriveOptions$15 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$15;
}
interface DriveFolderOptions$15 {
    path?: string;
    id?: string;
}
interface ImageToVideoResponse$1 {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LumaResultPayload$3;
}
interface LumaResultPayload$3 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface MediaReframeCommand {
    generation_type: "reframe_image" | "reframe_video";
    media: Media;
    first_frame?: Media;
    model: "ray-2" | "ray-flash-2";
    prompt?: string;
    aspect_ratio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "9:21";
    grid_position_x?: number;
    grid_position_y?: number;
    x_start?: number;
    x_end?: number;
    y_start?: number;
    y_end?: number;
    format?: string;
    callback_url?: string;
    options?: GenAIOptions$14;
}
interface Media {
    url: string;
}
interface GenAIOptions$14 {
    safety_checks?: SafetyChecksOptions$14;
    drive?: DriveOptions$14;
}
interface SafetyChecksOptions$14 {
    enabled?: boolean;
}
interface DriveOptions$14 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$14;
}
interface DriveFolderOptions$14 {
    path?: string;
    id?: string;
}
interface MediaReframeResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LumaResultPayload$2;
}
interface LumaResultPayload$2 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface SeedreamCommand {
    model?: SeedreamModelAlias;
    prompt: string;
    image?: string[];
    size?: string;
    resolution?: SeedreamResolution;
    aspect_ratio?: SeedreamAspectRatio;
    sequential_image_generation?: "auto" | "disabled";
    sequential_image_generation_options?: SequentialImageGenerationOptions;
    stream?: boolean;
    output_format?: "png" | "jpeg";
    response_format?: "url" | "b64_json";
    watermark?: boolean;
    optimize_prompt_options?: OptimizePromptOptions;
    options?: GenAIOptions$13;
}
type SeedreamModelAlias = "seedream_4_0" | "seedream_4_5" | "seedream_5_0_lite" | "seedream_5_0_pro";
type SeedreamResolution = "1K" | "2K" | "3K" | "4K";
type SeedreamAspectRatio = "0:0" | "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "3:2" | "2:3" | "21:9";
interface SequentialImageGenerationOptions {
    max_images: number;
}
interface OptimizePromptOptions {
    mode: OptimizePromptMode;
    thinking?: OptimizePromptThinking;
}
type OptimizePromptMode = "standard" | "fast";
type OptimizePromptThinking = "enabled" | "disabled";
interface GenAIOptions$13 {
    safety_checks?: SafetyChecksOptions$13;
    drive?: DriveOptions$13;
}
interface SafetyChecksOptions$13 {
    enabled?: boolean;
}
interface DriveOptions$13 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$13;
}
interface DriveFolderOptions$13 {
    path?: string;
    id?: string;
}
interface SeedreamResult {
    result: GeneratedImageResult$1;
}
interface GeneratedImageResult$1 {
    urls: string[];
    b64_jsons: string[];
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface SeedanceCommand {
    model?: SeedanceModelAlias;
    content?: ContentItem[];
    resolution?: Resolution;
    ratio?: Ratio;
    duration?: unknown | -1;
    generate_audio?: boolean;
    return_last_frame?: boolean;
    watermark?: boolean;
    camerafixed?: boolean;
    options?: GenAIOptions$12;
}
type SeedanceModelAlias = "seedance_1_0_pro" | "seedance_1_0_pro_fast" | "seedance_1_5_pro" | "seedance_2_0" | "seedance_2_0_fast" | "seedance_2_0_mini";
interface ContentItem {
    type: ContentType;
    text?: string;
    image_url?: ImageUrl;
    video_url?: VideoUrl;
    audio_url?: AudioUrl;
    role?: FrameRole;
}
type ContentType = "text" | "image_url" | "video_url" | "audio_url";
interface ImageUrl {
    url: string;
}
interface VideoUrl {
    url: string;
}
interface AudioUrl {
    url: string;
}
type FrameRole = "first_frame" | "last_frame" | "reference_image" | "reference_video" | "reference_audio";
type Resolution = "480p" | "720p" | "1080p" | "4k";
type Ratio = "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "21:9" | "adaptive";
interface GenAIOptions$12 {
    safety_checks?: SafetyChecksOptions$12;
    drive?: DriveOptions$12;
}
interface SafetyChecksOptions$12 {
    enabled?: boolean;
}
interface DriveOptions$12 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$12;
}
interface DriveFolderOptions$12 {
    path?: string;
    id?: string;
}
interface SeedanceResponse {
    result: GeneratedVideoResult$1;
}
interface GeneratedVideoResult$1 {
    video_url: string;
    last_frame_url?: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface RunwayImageToVideoCommand {
    promptImage: RunwayPromptImage[];
    seed: number;
    model: "gen3a_turbo" | "gen4_turbo" | "gen4.5";
    promptText: string;
    duration?: 5 | 10;
    ratio: "1280:768" | "768:1280" | "1280:720" | "720:1280" | "1104:832" | "832:1104" | "960:960" | "1584:672";
    options?: GenAIOptions$11;
}
interface RunwayPromptImage {
    uri: string;
    position: "first" | "last";
}
interface GenAIOptions$11 {
    safety_checks?: SafetyChecksOptions$11;
    drive?: DriveOptions$11;
}
interface SafetyChecksOptions$11 {
    enabled?: boolean;
}
interface DriveOptions$11 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$11;
}
interface DriveFolderOptions$11 {
    path?: string;
    id?: string;
}
interface RunwayVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: RunwayVideoGenerateResult;
}
interface RunwayVideoGenerateResult {
    url: string;
    output: string[];
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface PikaTextToVideoCommand {
    prompt: string;
    aspectRatio?: number;
    resolution?: PikaResolution$3;
    negativePrompt?: string;
    seed?: number;
    duration?: PikaDuration$3;
    options?: GenAIOptions$10;
}
type PikaResolution$3 = "720p" | "1080p";
type PikaDuration$3 = "5" | "10";
interface GenAIOptions$10 {
    safety_checks?: SafetyChecksOptions$10;
    drive?: DriveOptions$10;
}
interface SafetyChecksOptions$10 {
    enabled?: boolean;
}
interface DriveOptions$10 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$10;
}
interface DriveFolderOptions$10 {
    path?: string;
    id?: string;
}
interface PikaTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: PikaVideoResult$3;
}
interface PikaVideoResult$3 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface PikaImageToVideoCommand {
    prompt: string;
    image: string;
    resolution?: PikaResolution$2;
    negativePrompt?: string;
    seed?: number;
    duration?: PikaDuration$2;
    options?: GenAIOptions$$;
}
type PikaResolution$2 = "720p" | "1080p";
type PikaDuration$2 = "5" | "10";
interface GenAIOptions$$ {
    safety_checks?: SafetyChecksOptions$$;
    drive?: DriveOptions$$;
}
interface SafetyChecksOptions$$ {
    enabled?: boolean;
}
interface DriveOptions$$ {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$$;
}
interface DriveFolderOptions$$ {
    path?: string;
    id?: string;
}
interface PikaImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: PikaVideoResult$2;
}
interface PikaVideoResult$2 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface PikaScenesCommand {
    prompt: string;
    images: string[];
    aspectRatio?: number;
    resolution?: PikaResolution$1;
    negativePrompt?: string;
    seed?: number;
    ingredientsMode?: PikaIngredientsMode;
    duration?: PikaDuration$1;
    options?: GenAIOptions$_;
}
type PikaResolution$1 = "720p" | "1080p";
type PikaIngredientsMode = "creative" | "precise";
type PikaDuration$1 = "5" | "10";
interface GenAIOptions$_ {
    safety_checks?: SafetyChecksOptions$_;
    drive?: DriveOptions$_;
}
interface SafetyChecksOptions$_ {
    enabled?: boolean;
}
interface DriveOptions$_ {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$_;
}
interface DriveFolderOptions$_ {
    path?: string;
    id?: string;
}
interface PikaScenesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: PikaVideoResult$1;
}
interface PikaVideoResult$1 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface PikaFramesCommand {
    prompt: string;
    frames: string[];
    aspectRatio?: number;
    resolution?: PikaResolution;
    negativePrompt?: string;
    seed?: number;
    duration?: PikaDuration;
    options?: GenAIOptions$Z;
}
type PikaResolution = "720p" | "1080p";
type PikaDuration = "5" | "10";
interface GenAIOptions$Z {
    safety_checks?: SafetyChecksOptions$Z;
    drive?: DriveOptions$Z;
}
interface SafetyChecksOptions$Z {
    enabled?: boolean;
}
interface DriveOptions$Z {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$Z;
}
interface DriveFolderOptions$Z {
    path?: string;
    id?: string;
}
interface PikaFramesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: PikaVideoResult;
}
interface PikaVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface IdeogramV3GenerateCommand {
    prompt: string;
    aspect_ratio?: string;
    magic_prompt_option?: IdeogramMagicPromptEnum;
    seed?: number;
    style_type?: IdeogramStyleTypes;
    negative_prompt?: string;
    resolution?: string;
    color_palette?: ColorPalettesWithName$2;
    storage?: StorageParam$3;
    rendering_speed?: IdeogramRenderingSpeed$2;
    num_images?: number;
    character_reference_images?: string[];
    character_reference_images_mask?: string;
    options?: GenAIOptions$Y;
}
type IdeogramMagicPromptEnum = "AUTO" | "ON" | "OFF";
type IdeogramStyleTypes = "AUTO" | "GENERAL" | "REALISTIC" | "DESIGN" | "FICTION";
interface ColorPalettesWithName$2 {
    name: string;
}
interface StorageParam$3 {
    destination: string;
}
type IdeogramRenderingSpeed$2 = "TURBO" | "DEFAULT" | "QUALITY" | "FLASH";
interface GenAIOptions$Y {
    safety_checks?: SafetyChecksOptions$Y;
    drive?: DriveOptions$Y;
}
interface SafetyChecksOptions$Y {
    enabled?: boolean;
}
interface DriveOptions$Y {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$Y;
}
interface DriveFolderOptions$Y {
    path?: string;
    id?: string;
}
interface IdeogramV3GenerateResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: IdeogramApiResponse$3;
}
interface IdeogramApiResponse$3 {
    created: number;
    data: IdeogramClientData$3[];
}
interface IdeogramClientData$3 {
    seed: number;
    prompt: string;
    resolution: string;
    url: string;
    is_image_safe: boolean;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface IdeogramV3EditCommand {
    rendering_speed?: IdeogramRenderingSpeed$1;
    image: string;
    mask: string;
    prompt: string;
    magic_prompt_option?: "AUTO" | "ON" | "OFF";
    style_type?: string;
    seed?: number;
    color_palette?: ColorPalettesWithName$1;
    num_images?: number;
    storage?: StorageParam$2;
    options?: GenAIOptions$X;
}
type IdeogramRenderingSpeed$1 = "TURBO" | "DEFAULT" | "QUALITY" | "FLASH";
interface ColorPalettesWithName$1 {
    name: string;
}
interface StorageParam$2 {
    destination: string;
}
interface GenAIOptions$X {
    safety_checks?: SafetyChecksOptions$X;
    drive?: DriveOptions$X;
}
interface SafetyChecksOptions$X {
    enabled?: boolean;
}
interface DriveOptions$X {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$X;
}
interface DriveFolderOptions$X {
    path?: string;
    id?: string;
}
interface IdeogramV3EditResponse {
    result: IdeogramApiResponse$2;
}
interface IdeogramApiResponse$2 {
    created: number;
    data: IdeogramClientData$2[];
}
interface IdeogramClientData$2 {
    seed: number;
    prompt: string;
    resolution: string;
    url: string;
    is_image_safe: boolean;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface IdeogramV3RemixCommand {
    prompt: string;
    aspect_ratio?: string;
    color_palette?: ColorPalettesWithName;
    image_weight?: number;
    negative_prompt?: string;
    resolution?: string;
    seed?: number;
    style_type?: string;
    magic_prompt?: "AUTO" | "ON" | "OFF";
    rendering_speed?: IdeogramRenderingSpeed;
    image: string;
    storage?: StorageParam$1;
    num_images?: number;
    character_reference_images?: string[];
    character_reference_images_mask?: string;
    options?: GenAIOptions$W;
}
interface ColorPalettesWithName {
    name: string;
}
type IdeogramRenderingSpeed = "TURBO" | "DEFAULT" | "QUALITY" | "FLASH";
interface StorageParam$1 {
    destination: string;
}
interface GenAIOptions$W {
    safety_checks?: SafetyChecksOptions$W;
    drive?: DriveOptions$W;
}
interface SafetyChecksOptions$W {
    enabled?: boolean;
}
interface DriveOptions$W {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$W;
}
interface DriveFolderOptions$W {
    path?: string;
    id?: string;
}
interface IdeogramV3RemixResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: IdeogramApiResponse$1;
}
interface IdeogramApiResponse$1 {
    created: number;
    data: IdeogramClientData$1[];
}
interface IdeogramClientData$1 {
    seed: number;
    prompt: string;
    resolution: string;
    url: string;
    is_image_safe: boolean;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface Seedance2T2VInput {
    prompt: string;
    end_user_id?: string | unknown;
    resolution?: "480p" | "720p" | "1080p" | "4k";
    aspect_ratio?: "auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    duration?: "auto" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    bitrate_mode?: "standard" | "high";
    generate_audio?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface BytedanceSeedance20TextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Seedance2VideoOutput$5;
}
interface Seedance2VideoOutput$5 {
    video: {
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
    };
    seed: number;
}

interface Seedance2I2VInput {
    prompt: string;
    duration?: "auto" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    image_url: string;
    aspect_ratio?: "auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    end_image_url?: string | unknown;
    end_user_id?: string | unknown;
    resolution?: "480p" | "720p" | "1080p" | "4k";
    bitrate_mode?: "standard" | "high";
    generate_audio?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface BytedanceSeedance20ImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Seedance2VideoOutput$4;
}
interface Seedance2VideoOutput$4 {
    video: {
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
    };
    seed: number;
}

interface Seedance2T2VFastInput {
    prompt: string;
    end_user_id?: string | unknown;
    resolution?: "480p" | "720p";
    aspect_ratio?: "auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    duration?: "auto" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    bitrate_mode?: "standard" | "high";
    generate_audio?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface BytedanceSeedance20FastTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Seedance2VideoOutput$3;
}
interface Seedance2VideoOutput$3 {
    video: {
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
    };
    seed: number;
}

interface Seedance2I2VFastInput {
    prompt: string;
    duration?: "auto" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    image_url: string;
    aspect_ratio?: "auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    end_image_url?: string | unknown;
    end_user_id?: string | unknown;
    resolution?: "480p" | "720p";
    bitrate_mode?: "standard" | "high";
    generate_audio?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface BytedanceSeedance20FastImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Seedance2VideoOutput$2;
}
interface Seedance2VideoOutput$2 {
    video: {
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
    };
    seed: number;
}

interface Seedance2R2VInput {
    audio_urls?: string[];
    duration?: "auto" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    image_urls?: string[];
    aspect_ratio?: "auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    video_urls?: string[];
    prompt: string;
    resolution?: "480p" | "720p" | "1080p" | "4k";
    end_user_id?: string | unknown;
    bitrate_mode?: "standard" | "high";
    generate_audio?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface BytedanceSeedance20ReferenceToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Seedance2VideoOutput$1;
}
interface Seedance2VideoOutput$1 {
    video: {
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
    };
    seed: number;
}

interface Seedance2R2VFastInput {
    audio_urls?: string[];
    duration?: "auto" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    image_urls?: string[];
    aspect_ratio?: "auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    video_urls?: string[];
    prompt: string;
    resolution?: "480p" | "720p";
    end_user_id?: string | unknown;
    bitrate_mode?: "standard" | "high";
    generate_audio?: boolean;
    options?: {
        safety_checks?: {
            enabled?: boolean;
        };
        drive?: {
            name: string;
            attributes?: Record<string, string>;
            folder?: {
                path?: string;
                id?: string;
            };
        };
    };
}
interface BytedanceSeedance20FastReferenceToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Seedance2VideoOutput;
}
interface Seedance2VideoOutput {
    video: {
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
    };
    seed: number;
}

interface ChatCompletionsCommand {
    is_preview?: boolean;
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    top_k?: number;
    min_p?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    repetition_penalty?: number;
    stop?: string | string[];
    tools?: ToolDefinition[];
    tool_choice?: Record<string, unknown>;
    options?: GenAIOptions$V;
}
interface ChatMessage {
    role: "system" | "user" | "assistant" | "tool";
    content?: Record<string, unknown>;
    tool_call_id?: string;
    tool_calls?: ToolCall[];
    name?: string;
}
interface ToolCall {
    id: string;
    type: "function";
    function: FunctionCall;
}
interface FunctionCall {
    name: string;
    arguments: string;
}
interface ToolDefinition {
    type: "function";
    function: FunctionDefinition;
}
interface FunctionDefinition {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
    strict?: boolean;
}
interface GenAIOptions$V {
    safety_checks?: SafetyChecksOptions$V;
    drive?: DriveOptions$V;
}
interface SafetyChecksOptions$V {
    enabled?: boolean;
}
interface DriveOptions$V {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$V;
}
interface DriveFolderOptions$V {
    path?: string;
    id?: string;
}
interface ChatCompletionsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ChatCompletionResultData;
}
interface ChatCompletionResultData {
    id: string;
    object: string;
    model: string;
    choices: ChatCompletionChoice[];
    usage?: ChatCompletionUsage;
}
interface ChatCompletionChoice {
    index: number;
    message: ChatResponseMessage;
    finish_reason: string;
}
interface ChatResponseMessage {
    role: string;
    content?: string;
    tool_calls?: ToolCall[];
}
interface ChatCompletionUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

interface AvatarCreateCommand {
    name: string;
    personality: string;
    referenceImage: string;
    voice: AvatarVoiceInput;
    startScript?: string;
    documentIds?: string[];
    imageProcessing?: "optimize" | "none";
    options?: GenAIOptions$U;
}
interface AvatarVoiceInput {
    type: "runway-live-preset" | "custom";
    presetId?: "victoria" | "vincent" | "clara" | "drew" | "skye" | "max" | "morgan" | "felix" | "mia" | "marcus" | "summer" | "ruby" | "aurora" | "jasper" | "leo" | "adrian" | "nina" | "emma" | "blake" | "david" | "maya" | "nathan" | "sam" | "georgia" | "petra" | "adam" | "zach" | "violet" | "roman" | "luna";
    id?: string;
}
interface GenAIOptions$U {
    safety_checks?: SafetyChecksOptions$U;
    drive?: DriveOptions$U;
}
interface SafetyChecksOptions$U {
    enabled?: boolean;
}
interface DriveOptions$U {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$U;
}
interface DriveFolderOptions$U {
    path?: string;
    id?: string;
}
interface AvatarCreateResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AvatarResult$3;
}
interface AvatarResult$3 {
    id: string;
    name: string;
    status: "PROCESSING" | "READY" | "FAILED";
    personality: string;
    referenceImageUri?: string;
    processedImageUri?: string;
    startScript?: string;
    documentIds: string[];
    voice: AvatarVoice$3;
    createdAt: string;
    updatedAt: string;
    failureReason?: string;
}
interface AvatarVoice$3 {
    type: "runway-live-preset" | "custom";
    presetId?: "victoria" | "vincent" | "clara" | "drew" | "skye" | "max" | "morgan" | "felix" | "mia" | "marcus" | "summer" | "ruby" | "aurora" | "jasper" | "leo" | "adrian" | "nina" | "emma" | "blake" | "david" | "maya" | "nathan" | "sam" | "georgia" | "petra" | "adam" | "zach" | "violet" | "roman" | "luna";
    id?: string;
    name?: string;
    description?: string;
}

type AvatarListCommand = Record<string, never>;
interface AvatarListResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AvatarListResult;
}
interface AvatarListResult {
    avatars: AvatarResult$2[];
}
interface AvatarResult$2 {
    id: string;
    name: string;
    status: "PROCESSING" | "READY" | "FAILED";
    personality: string;
    referenceImageUri?: string;
    processedImageUri?: string;
    startScript?: string;
    documentIds: string[];
    voice: AvatarVoice$2;
    createdAt: string;
    updatedAt: string;
    failureReason?: string;
}
interface AvatarVoice$2 {
    type: "runway-live-preset" | "custom";
    presetId?: "victoria" | "vincent" | "clara" | "drew" | "skye" | "max" | "morgan" | "felix" | "mia" | "marcus" | "summer" | "ruby" | "aurora" | "jasper" | "leo" | "adrian" | "nina" | "emma" | "blake" | "david" | "maya" | "nathan" | "sam" | "georgia" | "petra" | "adam" | "zach" | "violet" | "roman" | "luna";
    id?: string;
    name?: string;
    description?: string;
}

interface AvatarGetCommand {
    avatarId: string;
}
interface AvatarGetResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AvatarResult$1;
}
interface AvatarResult$1 {
    id: string;
    name: string;
    status: "PROCESSING" | "READY" | "FAILED";
    personality: string;
    referenceImageUri?: string;
    processedImageUri?: string;
    startScript?: string;
    documentIds: string[];
    voice: AvatarVoice$1;
    createdAt: string;
    updatedAt: string;
    failureReason?: string;
}
interface AvatarVoice$1 {
    type: "runway-live-preset" | "custom";
    presetId?: "victoria" | "vincent" | "clara" | "drew" | "skye" | "max" | "morgan" | "felix" | "mia" | "marcus" | "summer" | "ruby" | "aurora" | "jasper" | "leo" | "adrian" | "nina" | "emma" | "blake" | "david" | "maya" | "nathan" | "sam" | "georgia" | "petra" | "adam" | "zach" | "violet" | "roman" | "luna";
    id?: string;
    name?: string;
    description?: string;
}

interface AvatarUpdateCommand {
    avatarId: string;
    name?: string;
    personality?: string;
    referenceImage?: string;
    voice?: AvatarVoiceUpdateInput;
    startScript?: string;
    documentIds?: string[];
    imageProcessing?: "optimize" | "none";
    options?: GenAIOptions$T;
}
interface AvatarVoiceUpdateInput {
    type: "runway-live-preset" | "custom";
    presetId?: "victoria" | "vincent" | "clara" | "drew" | "skye" | "max" | "morgan" | "felix" | "mia" | "marcus" | "summer" | "ruby" | "aurora" | "jasper" | "leo" | "adrian" | "nina" | "emma" | "blake" | "david" | "maya" | "nathan" | "sam" | "georgia" | "petra" | "adam" | "zach" | "violet" | "roman" | "luna";
    id?: string;
}
interface GenAIOptions$T {
    safety_checks?: SafetyChecksOptions$T;
    drive?: DriveOptions$T;
}
interface SafetyChecksOptions$T {
    enabled?: boolean;
}
interface DriveOptions$T {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$T;
}
interface DriveFolderOptions$T {
    path?: string;
    id?: string;
}
interface AvatarUpdateResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AvatarResult;
}
interface AvatarResult {
    id: string;
    name: string;
    status: "PROCESSING" | "READY" | "FAILED";
    personality: string;
    referenceImageUri?: string;
    processedImageUri?: string;
    startScript?: string;
    documentIds: string[];
    voice: AvatarVoice;
    createdAt: string;
    updatedAt: string;
    failureReason?: string;
}
interface AvatarVoice {
    type: "runway-live-preset" | "custom";
    presetId?: "victoria" | "vincent" | "clara" | "drew" | "skye" | "max" | "morgan" | "felix" | "mia" | "marcus" | "summer" | "ruby" | "aurora" | "jasper" | "leo" | "adrian" | "nina" | "emma" | "blake" | "david" | "maya" | "nathan" | "sam" | "georgia" | "petra" | "adam" | "zach" | "violet" | "roman" | "luna";
    id?: string;
    name?: string;
    description?: string;
}

interface AvatarDeleteCommand {
    avatarId: string;
}
interface AvatarDeleteResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AvatarDeleteResult;
}
interface AvatarDeleteResult {
    deleted: boolean;
}

interface RealtimeSessionCommand {
    avatarType: "runway-preset" | "custom";
    presetId?: "music-superstar" | "cat-character" | "fashion-designer" | "cooking-teacher";
    avatarId?: string;
    personality?: string;
    startScript?: string;
    options?: GenAIOptions$S;
}
interface GenAIOptions$S {
    safety_checks?: SafetyChecksOptions$S;
    drive?: DriveOptions$S;
}
interface SafetyChecksOptions$S {
    enabled?: boolean;
}
interface DriveOptions$S {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$S;
}
interface DriveFolderOptions$S {
    path?: string;
    id?: string;
}
interface RealtimeSessionResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: RealtimeSessionCredentials;
}
interface RealtimeSessionCredentials {
    url: string;
    token: string;
    roomName: string;
}

interface AvatarVideoCommand {
    avatarType: "runway-preset" | "custom";
    presetId?: "game-character" | "music-superstar" | "game-character-man" | "cat-character" | "influencer" | "tennis-coach" | "human-resource" | "fashion-designer" | "cooking-teacher";
    avatarId?: string;
    speechType: "text" | "audio";
    text?: string;
    audio?: string;
    voice?: AvatarVideoVoiceInput;
    options?: GenAIOptions$R;
}
interface AvatarVideoVoiceInput {
    type: "preset" | "custom";
    presetId?: "victoria" | "vincent" | "clara" | "drew" | "skye" | "max" | "morgan" | "felix" | "mia" | "marcus" | "summer" | "ruby" | "aurora" | "jasper" | "leo" | "adrian" | "nina" | "emma" | "blake" | "david" | "maya" | "nathan" | "sam" | "georgia" | "petra" | "adam" | "zach" | "violet" | "roman" | "luna";
    id?: string;
}
interface GenAIOptions$R {
    safety_checks?: SafetyChecksOptions$R;
    drive?: DriveOptions$R;
}
interface SafetyChecksOptions$R {
    enabled?: boolean;
}
interface DriveOptions$R {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$R;
}
interface DriveFolderOptions$R {
    path?: string;
    id?: string;
}
interface AvatarVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeneratedVideoResult;
}
interface GeneratedVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface QwenImageEditCommand {
    image: string | string[];
    prompt?: string;
    system_prompt?: string;
    negative_prompt?: string;
    strength?: number;
    grag_scale?: number;
    drop_cond_tokens_prob?: number;
    seed?: number;
    output_format?: "JPEG" | "PNG" | "HEIC" | "WEBP";
    options?: GenAIOptions$Q;
    model?: string;
    num_inference_steps?: number;
    guidance_scale?: number;
    max_pixels?: number;
}
interface GenAIOptions$Q {
    safety_checks?: SafetyChecksOptions$Q;
    drive?: DriveOptions$Q;
}
interface SafetyChecksOptions$Q {
    enabled?: boolean;
}
interface DriveOptions$Q {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$Q;
}
interface DriveFolderOptions$Q {
    path?: string;
    id?: string;
}
interface QwenImageEditResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenImageEditResultData$2;
}
interface QwenImageEditResultData$2 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface XAiSttCommand {
    url: string;
    language?: string;
    format?: boolean;
    multichannel?: boolean;
    diarize?: boolean;
    options?: XAiSttOptions;
}
interface XAiSttOptions {
    safety_checks?: XAiSttSafetyChecksOptions;
}
interface XAiSttSafetyChecksOptions {
    enabled?: boolean;
}
interface XAiSttResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAiSttResult;
}
interface XAiSttResult {
    url: string;
    mimeType: string;
    text: string;
    language: string;
    duration: number;
    words?: XAiSttWord[];
    channels?: XAiSttChannel[];
    driveFile?: Record<string, unknown>;
}
interface XAiSttWord {
    text: string;
    start: number;
    end: number;
    speaker?: number;
}
interface XAiSttChannel {
    index: number;
    text: string;
    words?: XAiSttWord[];
}

interface XAiTtsCommand {
    text: string;
    language: string;
    voice_id?: string;
    output_format?: XAiTtsOutputFormat;
    options?: GenAIOptions$P;
}
interface XAiTtsOutputFormat {
    codec?: string;
    sample_rate?: number;
    bit_rate?: number;
}
interface GenAIOptions$P {
    safety_checks?: SafetyChecksOptions$P;
    drive?: DriveOptions$P;
}
interface SafetyChecksOptions$P {
    enabled?: boolean;
}
interface DriveOptions$P {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$P;
}
interface DriveFolderOptions$P {
    path?: string;
    id?: string;
}
interface XAiTtsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAiTtsResult;
}
interface XAiTtsResult {
    url: string;
    mimeType: string;
    driveFile?: Record<string, unknown>;
}

interface XAiImagesGenerationsCommand {
    prompt: string;
    model?: "grok-imagine-image" | "grok-imagine-image-quality";
    aspect_ratio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "2:3" | "3:2" | "9:19.5" | "19.5:9" | "9:20" | "20:9" | "1:2" | "2:1" | "auto";
    n?: number;
    resolution?: "1k" | "2k";
    options?: GenAIOptions$O;
}
interface GenAIOptions$O {
    safety_checks?: SafetyChecksOptions$O;
    drive?: DriveOptions$O;
}
interface SafetyChecksOptions$O {
    enabled?: boolean;
}
interface DriveOptions$O {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$O;
}
interface DriveFolderOptions$O {
    path?: string;
    id?: string;
}
interface XAiImagesGenerationsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAiImagesGenerationsResult;
}
interface XAiImagesGenerationsResult {
    items: XAiGeneratedImage$1[];
}
interface XAiGeneratedImage$1 {
    url: string;
    mimeType: string;
    revised_prompt?: string;
    driveFile?: Record<string, unknown>;
}

interface XAiImagesEditsCommand {
    prompt: string;
    image?: XAiImageUrl$1;
    images?: XAiImageUrl$1[];
    mask?: XAiImageUrl$1;
    model?: "grok-imagine-image" | "grok-imagine-image-quality";
    n?: number;
    resolution?: "1k" | "2k";
    options?: GenAIOptions$N;
}
interface XAiImageUrl$1 {
    url: string;
}
interface GenAIOptions$N {
    safety_checks?: SafetyChecksOptions$N;
    drive?: DriveOptions$N;
}
interface SafetyChecksOptions$N {
    enabled?: boolean;
}
interface DriveOptions$N {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$N;
}
interface DriveFolderOptions$N {
    path?: string;
    id?: string;
}
interface XAiImagesEditsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAiImagesEditsResult;
}
interface XAiImagesEditsResult {
    items: XAiGeneratedImage[];
}
interface XAiGeneratedImage {
    url: string;
    mimeType: string;
    revised_prompt?: string;
    driveFile?: Record<string, unknown>;
}

interface XAiVideosGenerationsCommand {
    model?: "grok-imagine-video" | "grok-imagine-video-1.5";
    prompt?: string;
    image?: XAiImageUrl;
    reference_images?: XAiImageUrl[];
    aspect_ratio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3";
    duration?: number;
    resolution?: "480p" | "720p" | "1080p";
    size?: "848x480" | "1696x960" | "1280x720" | "1920x1080";
    options?: GenAIOptions$M;
}
interface XAiImageUrl {
    url: string;
}
interface GenAIOptions$M {
    safety_checks?: SafetyChecksOptions$M;
    drive?: DriveOptions$M;
}
interface SafetyChecksOptions$M {
    enabled?: boolean;
}
interface DriveOptions$M {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$M;
}
interface DriveFolderOptions$M {
    path?: string;
    id?: string;
}
interface XAiVideosGenerationsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAiVideoGenerationResult$2;
}
interface XAiVideoGenerationResult$2 {
    url: string;
    mimeType: string;
    duration: number;
    driveFile?: Record<string, unknown>;
}

interface XAiVideosEditsCommand {
    prompt: string;
    video: XAiVideoUrl$1;
    options?: GenAIOptions$L;
}
interface XAiVideoUrl$1 {
    url: string;
}
interface GenAIOptions$L {
    safety_checks?: SafetyChecksOptions$L;
    drive?: DriveOptions$L;
}
interface SafetyChecksOptions$L {
    enabled?: boolean;
}
interface DriveOptions$L {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$L;
}
interface DriveFolderOptions$L {
    path?: string;
    id?: string;
}
interface XAiVideosEditsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAiVideoGenerationResult$1;
}
interface XAiVideoGenerationResult$1 {
    url: string;
    mimeType: string;
    duration: number;
    driveFile?: Record<string, unknown>;
}

interface XAiVideosExtensionsCommand {
    prompt: string;
    video: XAiVideoUrl;
    duration?: number;
    options?: GenAIOptions$K;
}
interface XAiVideoUrl {
    url: string;
}
interface GenAIOptions$K {
    safety_checks?: SafetyChecksOptions$K;
    drive?: DriveOptions$K;
}
interface SafetyChecksOptions$K {
    enabled?: boolean;
}
interface DriveOptions$K {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$K;
}
interface DriveFolderOptions$K {
    path?: string;
    id?: string;
}
interface XAiVideosExtensionsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAiVideoGenerationResult;
}
interface XAiVideoGenerationResult {
    url: string;
    mimeType: string;
    duration: number;
    driveFile?: Record<string, unknown>;
}

interface HappyhorseTextToVideoCommand {
    prompt: string;
    resolution?: "720P" | "1080P";
    ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    duration?: number;
    seed?: number;
    watermark?: boolean;
    options?: GenAIOptions$J;
}
interface GenAIOptions$J {
    safety_checks?: SafetyChecksOptions$J;
    drive?: DriveOptions$J;
}
interface SafetyChecksOptions$J {
    enabled?: boolean;
}
interface DriveOptions$J {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$J;
}
interface DriveFolderOptions$J {
    path?: string;
    id?: string;
}
interface HappyhorseTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: HappyhorseTextToVideoResult;
}
interface HappyhorseTextToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface HappyhorseImageToVideoCommand {
    media: HappyhorseI2VMediaItem[];
    prompt?: string;
    resolution?: "720P" | "1080P";
    duration?: number;
    seed?: number;
    watermark?: boolean;
    options?: GenAIOptions$I;
}
interface HappyhorseI2VMediaItem {
    type: "first_frame";
    url: string;
}
interface GenAIOptions$I {
    safety_checks?: SafetyChecksOptions$I;
    drive?: DriveOptions$I;
}
interface SafetyChecksOptions$I {
    enabled?: boolean;
}
interface DriveOptions$I {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$I;
}
interface DriveFolderOptions$I {
    path?: string;
    id?: string;
}
interface HappyhorseImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: HappyhorseImageToVideoResult;
}
interface HappyhorseImageToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface WhisperxVideoCaptionsCommand {
    url: string;
    model?: "preview-model-whisperx-large-v3" | "model-whisperx-large-v3";
    parameters?: WhisperParameters;
    alignment?: AlignmentOptions;
    diarization?: DiarizationOptions;
    output?: OutputOptions;
    options?: GenAIOptions$H;
}
interface WhisperParameters {
    language?: "en" | "es" | "fr" | "de" | "it" | "pt" | "nl" | "pl" | "ja" | "zh" | "ru";
    task?: "transcribe" | "translate";
}
interface AlignmentOptions {
    enabled?: boolean;
    return_char_alignments?: boolean;
    interpolate_method?: "nearest" | "linear" | "ignore";
}
interface DiarizationOptions {
    enabled?: boolean;
    num_speakers?: number;
    min_speakers?: number;
    max_speakers?: number;
    return_embeddings?: boolean;
    fill_nearest?: boolean;
    apply_word_speakers?: boolean;
}
interface OutputOptions {
    include_word_segments?: boolean;
    include_char_segments?: boolean;
}
interface GenAIOptions$H {
    safety_checks?: SafetyChecksOptions$H;
    drive?: DriveOptions$H;
}
interface SafetyChecksOptions$H {
    enabled?: boolean;
}
interface DriveOptions$H {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$H;
}
interface DriveFolderOptions$H {
    path?: string;
    id?: string;
}
interface WhisperxVideoCaptionsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: WhisperxVideoCaptionsResultData;
}
interface WhisperxVideoCaptionsResultData {
    language: string;
    segments?: TranscriptionSegment[];
}
interface TranscriptionSegment {
    start: number;
    end: number;
    text: string;
    speaker?: string;
    words?: WordSegment[];
    chars?: CharSegment[];
}
interface WordSegment {
    word: string;
    start?: number;
    end?: number;
    score?: number;
    speaker?: string;
}
interface CharSegment {
    char: string;
    start?: number;
    end?: number;
    score?: number;
}

interface QwenMakeupCommand {
    image: string | string[];
    prompt?: string;
    system_prompt?: string;
    negative_prompt?: string;
    strength?: number;
    grag_scale?: number;
    drop_cond_tokens_prob?: number;
    seed?: number;
    output_format?: "JPEG" | "PNG" | "HEIC" | "WEBP";
    options?: GenAIOptions$G;
    model?: "preview-model-qwent-image-edit-lightning-makeup" | "model-qwent-image-edit-lightning-makeup";
}
interface GenAIOptions$G {
    safety_checks?: SafetyChecksOptions$G;
    drive?: DriveOptions$G;
}
interface SafetyChecksOptions$G {
    enabled?: boolean;
}
interface DriveOptions$G {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$G;
}
interface DriveFolderOptions$G {
    path?: string;
    id?: string;
}
interface QwenMakeupResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenImageEditResultData$1;
}
interface QwenImageEditResultData$1 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface FluxTextToImageCommand {
    prompt: string;
    images?: string[];
    width?: number;
    height?: number;
    num_inference_steps?: number;
    seed?: number;
    model?: "preview-model-flux-2-klein-4B" | "model-flux-2-klein-4B";
    options?: GenAIOptions$F;
}
interface GenAIOptions$F {
    safety_checks?: SafetyChecksOptions$F;
    drive?: DriveOptions$F;
}
interface SafetyChecksOptions$F {
    enabled?: boolean;
}
interface DriveOptions$F {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$F;
}
interface DriveFolderOptions$F {
    path?: string;
    id?: string;
}
interface FluxTextToImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: FluxTextToImageResultData;
}
interface FluxTextToImageResultData {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface GeminiV3ImagesCommand {
    prompt: string;
    images?: GeminiImagePart[];
    aspectRatio?: AspectRatio;
    imageSize?: ImageResolution;
    model: GeminiImageModel;
    count?: number;
    options?: GenAIOptions$E;
    thinkingConfig?: ThinkingConfig;
}
interface GeminiImagePart {
    url?: string;
    inlineData?: PartInlineData;
}
interface PartInlineData {
    mimeType: string;
    data: string;
}
type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9" | "1:4" | "4:1" | "1:8" | "8:1";
type ImageResolution = "0.5K" | "1K" | "2K" | "4K";
type GeminiImageModel = "gemini-2.5-flash-image" | "gemini-3-pro-image-preview" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image" | "gemini-3.1-flash-image-preview";
interface GenAIOptions$E {
    safety_checks?: SafetyChecksOptions$E;
    drive?: DriveOptions$E;
}
interface SafetyChecksOptions$E {
    enabled?: boolean;
}
interface DriveOptions$E {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$E;
}
interface DriveFolderOptions$E {
    path?: string;
    id?: string;
}
interface ThinkingConfig {
    thinkingLevel?: ThinkingLevel;
    thinkingBudget?: number;
}
type ThinkingLevel = "MINIMAL" | "LOW" | "MEDIUM" | "HIGH";
interface GeminiV3ImagesResult {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeminiV3ImagesResponse;
}
interface GeminiV3ImagesResponse {
    items: GeminiV3ImageItem[];
    description: string;
}
interface GeminiV3ImageItem {
    data: string;
    mimeType: string;
}

interface HappyhorseReferenceToVideoCommand {
    prompt: string;
    media: HappyhorseR2VMediaItem[];
    resolution?: "720P" | "1080P";
    ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    duration?: number;
    seed?: number;
    watermark?: boolean;
    options?: GenAIOptions$D;
}
interface HappyhorseR2VMediaItem {
    type: "reference_image";
    url: string;
}
interface GenAIOptions$D {
    safety_checks?: SafetyChecksOptions$D;
    drive?: DriveOptions$D;
}
interface SafetyChecksOptions$D {
    enabled?: boolean;
}
interface DriveOptions$D {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$D;
}
interface DriveFolderOptions$D {
    path?: string;
    id?: string;
}
interface HappyhorseReferenceToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: HappyhorseReferenceToVideoResult;
}
interface HappyhorseReferenceToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface HappyhorseVideoEditCommand {
    prompt: string;
    media: HappyhorseV2VMediaItem[];
    resolution?: "720P" | "1080P";
    audio_setting?: "auto" | "origin";
    seed?: number;
    watermark?: boolean;
    options?: GenAIOptions$C;
}
interface HappyhorseV2VMediaItem {
    type: "video" | "reference_image";
    url: string;
}
interface GenAIOptions$C {
    safety_checks?: SafetyChecksOptions$C;
    drive?: DriveOptions$C;
}
interface SafetyChecksOptions$C {
    enabled?: boolean;
}
interface DriveOptions$C {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$C;
}
interface DriveFolderOptions$C {
    path?: string;
    id?: string;
}
interface HappyhorseVideoEditResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: HappyhorseVideoEditResult;
}
interface HappyhorseVideoEditResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface AiExpandCommand {
    caption?: string;
    image_url: string;
    padding: number[];
    padding_mode?: "constant" | "edge" | "reflect" | "symmetric";
    seed?: number;
    positive_prompt?: string;
    negative_prompt?: string;
    upscale_num_timesteps?: number;
    upscale_noise_level?: number;
    model?: "preview-model-simpleaiexpander-v1" | "model-simpleaiexpander-v1" | "preview-model-simpleaiexpander-v2" | "model-simpleaiexpander-v2";
    options?: GenAIOptions$B;
}
interface GenAIOptions$B {
    safety_checks?: SafetyChecksOptions$B;
    drive?: DriveOptions$B;
}
interface SafetyChecksOptions$B {
    enabled?: boolean;
}
interface DriveOptions$B {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$B;
}
interface DriveFolderOptions$B {
    path?: string;
    id?: string;
}
interface AiExpandResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AiExpandResultData;
}
interface AiExpandResultData {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface QwenTextToImageCommand {
    prompt: string;
    negative_prompt?: string;
    model?: "qwen-image-2.0-pro" | "qwen-image-2.0-pro-2026-04-22";
    size?: string;
    n?: number;
    prompt_extend?: boolean;
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$A;
}
interface GenAIOptions$A {
    safety_checks?: SafetyChecksOptions$A;
    drive?: DriveOptions$A;
}
interface SafetyChecksOptions$A {
    enabled?: boolean;
}
interface DriveOptions$A {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$A;
}
interface DriveFolderOptions$A {
    path?: string;
    id?: string;
}
interface QwenTextToImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenTextToImageResult;
}
interface QwenTextToImageResult {
    items: QwenTextToImageResultItem[];
}
interface QwenTextToImageResultItem {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface QwenImageToImageCommand {
    prompt: string;
    image_urls: string[];
    negative_prompt?: string;
    model?: "qwen-image-2.0-pro" | "qwen-image-2.0-pro-2026-04-22";
    size?: string;
    n?: number;
    prompt_extend?: boolean;
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$z;
}
interface GenAIOptions$z {
    safety_checks?: SafetyChecksOptions$z;
    drive?: DriveOptions$z;
}
interface SafetyChecksOptions$z {
    enabled?: boolean;
}
interface DriveOptions$z {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$z;
}
interface DriveFolderOptions$z {
    path?: string;
    id?: string;
}
interface QwenImageToImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenImageToImageResult;
}
interface QwenImageToImageResult {
    items: QwenImageToImageResultItem[];
}
interface QwenImageToImageResultItem {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface GenfillV6InpaintCommand {
    image: string;
    mask: string;
    quality_jpg?: number;
    model?: "model-genfillv6" | "preview-model-genfillv6";
    options?: GenAIOptions$y;
}
interface GenAIOptions$y {
    safety_checks?: SafetyChecksOptions$y;
    drive?: DriveOptions$y;
}
interface SafetyChecksOptions$y {
    enabled?: boolean;
}
interface DriveOptions$y {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$y;
}
interface DriveFolderOptions$y {
    path?: string;
    id?: string;
}
interface GenfillV6InpaintResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GenfillV6InpaintResultData;
}
interface GenfillV6InpaintResultData {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface FaceCorrectionCommand {
    image_url: string;
    types: ("blemish" | "eye-bag" | "face-smooth" | "wrinkle")[];
    restore_colors?: boolean;
    model?: "preview-model-face-correction-v1" | "model-face-correction-v1";
    options?: GenAIOptions$x;
}
interface GenAIOptions$x {
    safety_checks?: SafetyChecksOptions$x;
    drive?: DriveOptions$x;
}
interface SafetyChecksOptions$x {
    enabled?: boolean;
}
interface DriveOptions$x {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$x;
}
interface DriveFolderOptions$x {
    path?: string;
    id?: string;
}
interface FaceCorrectionResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: FaceCorrectionResultData;
}
interface FaceCorrectionResultData {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface TextToImageCommand {
    prompt: string;
    model?: "uni-1" | "uni-1-max";
    aspect_ratio?: "3:1" | "2:1" | "16:9" | "3:2" | "1:1" | "2:3" | "9:16" | "1:2" | "1:3";
    style?: "auto" | "manga";
    output_format?: "png" | "jpeg";
    image_ref?: LumaImageRef$1[];
    web_search?: boolean;
    options?: GenAIOptions$w;
}
interface LumaImageRef$1 {
    url?: string;
    data?: string;
}
interface GenAIOptions$w {
    safety_checks?: SafetyChecksOptions$w;
    drive?: DriveOptions$w;
}
interface SafetyChecksOptions$w {
    enabled?: boolean;
}
interface DriveOptions$w {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$w;
}
interface DriveFolderOptions$w {
    path?: string;
    id?: string;
}
interface TextToImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LumaResultPayload$1;
}
interface LumaResultPayload$1 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface ImageEditCommand {
    prompt: string;
    source: Source;
    model?: "uni-1" | "uni-1-max";
    style?: "auto" | "manga";
    image_ref?: LumaImageRef[];
    options?: GenAIOptions$v;
}
interface Source {
    url?: string;
    data?: string;
    media_type?: string;
}
interface LumaImageRef {
    url?: string;
    data?: string;
    media_type?: string;
}
interface GenAIOptions$v {
    safety_checks?: SafetyChecksOptions$v;
    drive?: DriveOptions$v;
}
interface SafetyChecksOptions$v {
    enabled?: boolean;
}
interface DriveOptions$v {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$v;
}
interface DriveFolderOptions$v {
    path?: string;
    id?: string;
}
interface ImageEditResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LumaResultPayload;
}
interface LumaResultPayload {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface QwenMultipatchEnhancementCommand {
    image: string;
    num_inference_steps?: number;
    target_scale?: number;
    output_format?: "JPEG" | "PNG";
    model?: "qwen-multipatch-enhancement" | "preview-qwen-multipatch-enhancement";
    options?: GenAIOptions$u;
}
interface GenAIOptions$u {
    safety_checks?: SafetyChecksOptions$u;
    drive?: DriveOptions$u;
}
interface SafetyChecksOptions$u {
    enabled?: boolean;
}
interface DriveOptions$u {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$u;
}
interface DriveFolderOptions$u {
    path?: string;
    id?: string;
}
interface QwenMultipatchEnhancementResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenMultipatchEnhancementResultData;
}
interface QwenMultipatchEnhancementResultData {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface VideoSegmentationCommand {
    video_url: string;
    references: ReferenceMask[];
    multi_objects_mode?: boolean;
    min_object_area?: number;
    segment_ref_frames?: boolean;
    output_pixel_format?: "yuv444p" | "yuv420p";
    model?: "model-video-segmentation-stcn";
    options?: GenAIOptions$t;
}
interface ReferenceMask {
    frame_index: number;
    mask_url: string;
}
interface GenAIOptions$t {
    safety_checks?: SafetyChecksOptions$t;
    drive?: DriveOptions$t;
}
interface SafetyChecksOptions$t {
    enabled?: boolean;
}
interface DriveOptions$t {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$t;
}
interface DriveFolderOptions$t {
    path?: string;
    id?: string;
}
interface VideoSegmentationResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: VideoSegmentationResultData;
}
interface VideoSegmentationResultData {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface KlingVideoEffectsCommand {
    image?: string;
    images?: string[];
    effect_scene: KlingEffectScene;
    options?: GenAIOptions$s;
}
type KlingEffectScene = "korean_baseball" | "pet_skateboard" | "daily_ootd" | "tiny_beast_printer" | "landmark_reveal" | "winter_charm" | "flash_ride" | "maestro_of_magic" | "magic_carpet_ride" | "good_luck_spirit" | "shooting_star" | "sparkler_wand" | "sovereign_scepter" | "dirt_rush" | "return_of_the_king" | "dance_with_dragon" | "minimalist_light" | "martial_meow" | "sassy_shake" | "knock_at_a_door_revenge" | "palm_sized_figure_pro" | "prank_box" | "perler_beads" | "spring_bloom" | "toss_run" | "switch_to_silk" | "get_rich_quick" | "make_it_rain" | "twist_shake" | "the_hip_sway" | "send_my_love" | "funky_martian" | "wealth_drive" | "the_high_kick" | "the_exercise" | "lucky_veggie" | "studio_look" | "flash_drive" | "shush_my_dreams" | "french_elegance" | "finger_swipe" | "advent_of_flora" | "smooth_transition" | "kiss_pro" | "raid_check" | "snow_night_kiss" | "eternal_kiss" | "fortune_in_motion" | "chinese_trend" | "sedan_chair_dance" | "skyfall" | "good_luck_dance" | "laicai_dance" | "yangge_dance" | "color_mixing" | "palm_sized_figure" | "lantern_festival_cuju" | "unique_firework" | "unique_spring_couplets" | "horse_mask" | "fortune_knocks_cartoon" | "tangyuan_to_animal" | "hot_feet_dance" | "swag_dance" | "pigeon_dance" | "bloodline_dance" | "chanel_dance" | "cute_dance" | "love_theme_song" | "pumpitup_dance" | "city_to_village" | "fortune_god_transform" | "new_year_feast" | "ring_in_new" | "horse_year_firework" | "pet_vlogger" | "crystal_horse" | "lateral_shift_transition" | "drunk_dance" | "drunk_dance_pet" | "daoma_dance" | "bouncy_dance" | "smooth_sailing_dance" | "new_year_greeting" | "lion_dance" | "prosperity" | "great_success" | "golden_horse_fortune" | "red_packet_box" | "lucky_horse_year" | "lucky_red_packet" | "lucky_money_come" | "lion_dance_pet" | "dumpling_making_pet" | "fish_making_pet" | "pet_red_packet" | "lantern_glow" | "expression_challenge" | "overdrive" | "heart_gesture_dance" | "poping" | "martial_arts" | "running" | "nezha" | "motorcycle_dance" | "subject_3_dance" | "ghost_step_dance" | "phantom_jewel" | "zoom_out" | "cheers_2026" | "fight_pro" | "hug_pro" | "heart_gesture_pro" | "dollar_rain_pro" | "pet_bee_pro" | "countdown_teleport" | "santa_random_surprise" | "magic_match_tree" | "bullet_time_360" | "happy_birthday" | "birthday_star" | "thumbs_up_pro" | "tiger_hug_pro" | "pet_lion_pro" | "surprise_bouquet" | "bouquet_drop" | "3d_cartoon_1_pro" | "firework_2026" | "glamour_photo_shoot" | "box_of_joy" | "first_toast_of_the_year" | "my_santa_pic" | "santa_gift" | "steampunk_christmas" | "snowglobe" | "christmas_photo_shoot" | "ornament_crash" | "santa_express" | "instant_christmas" | "particle_santa_surround" | "coronation_of_frost" | "building_sweater" | "spark_in_the_snow" | "scarlet_and_snow" | "cozy_toon_wrap" | "bullet_time_lite" | "magic_cloak" | "balloon_parade" | "jumping_ginger_joy" | "bullet_time" | "c4d_cartoon_pro" | "pure_white_wings" | "black_wings" | "golden_wing" | "pink_pink_wings" | "venomous_spider" | "throne_of_king" | "luminous_elf" | "woodland_elf" | "japanese_anime_1" | "american_comics" | "guardian_spirit" | "swish_swish" | "snowboarding" | "witch_transform" | "vampire_transform" | "pumpkin_head_transform" | "demon_transform" | "mummy_transform" | "zombie_transform" | "cute_pumpkin_transform" | "cute_ghost_transform" | "knock_knock_halloween" | "halloween_escape" | "baseball" | "inner_voice" | "a_list_look" | "memory_alive" | "trampoline" | "trampoline_night" | "pucker_up" | "guess_what" | "feed_mooncake" | "rampage_ape" | "flyer" | "dishwasher" | "pet_chinese_opera" | "magic_fireball" | "gallery_ring" | "pet_moto_rider" | "muscle_pet" | "squeeze_scream" | "pet_delivery" | "running_man" | "disappear" | "mythic_style" | "steampunk" | "3d_cartoon_2" | "eagle_snatch" | "hug_from_past" | "firework" | "media_interview" | "pet_chef" | "santa_gifts" | "santa_hug" | "heart_gesture_1" | "pet_wizard" | "smoke_smoke" | "instant_kid" | "dollar_rain" | "cry_cry" | "building_collapse" | "gun_shot" | "mushroom" | "double_gun" | "pet_warrior" | "lightning_power" | "jesus_hug" | "shark_alert" | "long_hair" | "lie_flat" | "polar_bear_hug" | "brown_bear_hug" | "jazz_jazz" | "office_escape_plow" | "fly_fly" | "watermelon_bomb" | "pet_dance" | "boss_coming" | "wool_curly" | "pet_bee" | "marry_me" | "swing_swing" | "day_to_night" | "piggy_morph" | "wig_out" | "car_explosion" | "ski_ski" | "siblings" | "construction_worker" | "let's_ride" | "snatched" | "magic_broom" | "felt_felt" | "jumpdrop" | "surfsurf" | "fairy_wing" | "angel_wing" | "dark_wing" | "skateskate" | "plushcut" | "jelly_press" | "jelly_slice" | "jelly_squish" | "jelly_jiggle" | "pixelpixel" | "yearbook" | "instant_film" | "anime_figure" | "rocketrocket" | "bloombloom" | "dizzydizzy" | "fuzzyfuzzy" | "squish" | "expansion" | "emoji" | "tennis_trend" | "football_live" | "f1_live" | "whirling_beverage" | "spielberg_transition";
interface GenAIOptions$s {
    safety_checks?: SafetyChecksOptions$s;
    drive?: DriveOptions$s;
}
interface SafetyChecksOptions$s {
    enabled?: boolean;
}
interface DriveOptions$s {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$s;
}
interface DriveFolderOptions$s {
    path?: string;
    id?: string;
}
interface KlingVideoEffectsResponse {
    result: KlingVideoResult;
}
interface KlingVideoResult {
    url: string;
    duration: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface SanaSprintCommand {
    prompt: string;
    model: "picsart-sana-sprint-v1" | "preview-picsart-sana-sprint-v1";
    num_inference_steps?: number;
    guidance_scale?: number;
    width?: number;
    height?: number;
    options?: GenAIOptions$r;
}
interface GenAIOptions$r {
    safety_checks?: SafetyChecksOptions$r;
    drive?: DriveOptions$r;
}
interface SafetyChecksOptions$r {
    enabled?: boolean;
}
interface DriveOptions$r {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$r;
}
interface DriveFolderOptions$r {
    path?: string;
    id?: string;
}
interface SanaSprintResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: SanaSprintResultData;
}
interface SanaSprintResultData {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface VideoInpaintingCommand {
    video_url: string;
    mask_url: string;
    preserve_format?: boolean;
    model?: "model-video-inpainting" | "preview-model-video-inpainting";
    options?: GenAIOptions$q;
}
interface GenAIOptions$q {
    safety_checks?: SafetyChecksOptions$q;
    drive?: DriveOptions$q;
}
interface SafetyChecksOptions$q {
    enabled?: boolean;
}
interface DriveOptions$q {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$q;
}
interface DriveFolderOptions$q {
    path?: string;
    id?: string;
}
interface VideoInpaintingResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: VideoInpaintingResultData;
}
interface VideoInpaintingResultData {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface IdeogramV4GenerateCommand {
    text_prompt?: string;
    json_prompt?: Record<string, unknown>;
    resolution?: string;
    rendering_speed?: IdeogramV4RenderingSpeed;
    enable_copyright_detection?: boolean;
    storage?: StorageParam;
    options?: GenAIOptions$p;
}
type IdeogramV4RenderingSpeed = "TURBO" | "DEFAULT" | "QUALITY";
interface StorageParam {
    destination: string;
}
interface GenAIOptions$p {
    safety_checks?: SafetyChecksOptions$p;
    drive?: DriveOptions$p;
}
interface SafetyChecksOptions$p {
    enabled?: boolean;
}
interface DriveOptions$p {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$p;
}
interface DriveFolderOptions$p {
    path?: string;
    id?: string;
}
interface IdeogramV4GenerateResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: IdeogramApiResponse;
}
interface IdeogramApiResponse {
    created: number;
    data: IdeogramClientData[];
}
interface IdeogramClientData {
    seed: number;
    prompt: string;
    resolution: string;
    url: string;
    is_image_safe: boolean;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface GeminiOmniVideoGenCommand {
    prompt: string;
    image?: GeminiOmniImage;
    video?: GeminiOmniVideo;
    durationSeconds?: number;
    aspectRatio?: "16:9" | "9:16";
    model?: "gemini-omni-flash-preview";
    options?: GenAIOptions$o;
}
interface GeminiOmniImage {
    url?: string;
    bytesBase64Encoded?: string;
    mimeType: "image/png" | "image/jpeg";
}
interface GeminiOmniVideo {
    url?: string;
    bytesBase64Encoded?: string;
}
interface GenAIOptions$o {
    safety_checks?: SafetyChecksOptions$o;
    drive?: DriveOptions$o;
}
interface SafetyChecksOptions$o {
    enabled?: boolean;
}
interface DriveOptions$o {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$o;
}
interface DriveFolderOptions$o {
    path?: string;
    id?: string;
}
interface GeminiOmniVideoGenResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeminiOmniVideoGenResult[];
}
interface GeminiOmniVideoGenResult {
    progress?: number;
    url?: string;
    encoding?: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface TextToVideoCommand {
    prompt: string;
    model: "v4.5" | "v5" | "v5.5" | "v5.6" | "v6" | "c1";
    quality: "360p" | "540p" | "720p" | "1080p";
    aspect_ratio: "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "2:3" | "3:2" | "21:9";
    duration: number;
    negative_prompt?: string;
    motion_mode?: "normal" | "fast";
    water_mark?: boolean;
    seed?: number;
    generate_audio_switch?: boolean;
    generate_multi_clip_switch?: boolean;
    sound_effect_switch?: boolean;
    sound_effect_content?: string;
    lip_sync_switch?: boolean;
    lip_sync_tts_content?: string;
    lip_sync_tts_speaker_id?: string;
    options?: GenAIOptions$n;
}
interface GenAIOptions$n {
    safety_checks?: SafetyChecksOptions$n;
    drive?: DriveOptions$n;
}
interface SafetyChecksOptions$n {
    enabled?: boolean;
}
interface DriveOptions$n {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$n;
}
interface DriveFolderOptions$n {
    path?: string;
    id?: string;
}
interface TextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: TextToVideoResult;
}
interface TextToVideoResult {
    url: string;
}

interface ImageToVideoCommand {
    image_url: string;
    image_urls?: string[];
    prompt: string;
    model: "v4.5" | "v5" | "v5.5" | "v5.6" | "v6" | "c1";
    quality: "360p" | "540p" | "720p" | "1080p";
    duration: number;
    template_id?: number;
    negative_prompt?: string;
    motion_mode?: "normal" | "fast";
    water_mark?: boolean;
    seed?: number;
    generate_audio_switch?: boolean;
    generate_multi_clip_switch?: boolean;
    sound_effect_switch?: boolean;
    sound_effect_content?: string;
    lip_sync_switch?: boolean;
    lip_sync_tts_content?: string;
    lip_sync_tts_speaker_id?: string;
    options?: GenAIOptions$m;
}
interface GenAIOptions$m {
    safety_checks?: SafetyChecksOptions$m;
    drive?: DriveOptions$m;
}
interface SafetyChecksOptions$m {
    enabled?: boolean;
}
interface DriveOptions$m {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$m;
}
interface DriveFolderOptions$m {
    path?: string;
    id?: string;
}
interface ImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ImageToVideoResult;
}
interface ImageToVideoResult {
    url: string;
}

interface ReferenceToVideoCommand {
    image_references: ReferenceImageItem[];
    prompt: string;
    model: "v4.5" | "v5" | "v5.5" | "v5.6" | "v6" | "c1";
    quality: "360p" | "540p" | "720p" | "1080p";
    aspect_ratio: "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "2:3" | "3:2" | "21:9";
    duration: number;
    seed?: number;
    generate_audio_switch?: boolean;
    options?: GenAIOptions$l;
}
interface ReferenceImageItem {
    url: string;
    type?: "subject" | "background";
    ref_name?: string;
}
interface GenAIOptions$l {
    safety_checks?: SafetyChecksOptions$l;
    drive?: DriveOptions$l;
}
interface SafetyChecksOptions$l {
    enabled?: boolean;
}
interface DriveOptions$l {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$l;
}
interface DriveFolderOptions$l {
    path?: string;
    id?: string;
}
interface ReferenceToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ReferenceToVideoResult;
}
interface ReferenceToVideoResult {
    url: string;
}

interface FontSimilaritySearchCommand {
    image: string;
    model?: "model-font-similarity-search";
    font_count?: number;
    max_number_of_words?: number;
    find_similar_fonts?: boolean;
    options?: GenAIOptions$k;
}
interface GenAIOptions$k {
    safety_checks?: SafetyChecksOptions$k;
    drive?: DriveOptions$k;
}
interface SafetyChecksOptions$k {
    enabled?: boolean;
}
interface DriveOptions$k {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$k;
}
interface DriveFolderOptions$k {
    path?: string;
    id?: string;
}
interface FontSimilaritySearchResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: FontSimilaritySearchResultData;
}
interface FontSimilaritySearchResultData {
    id: string;
    result: FontSimilaritySearchDetection[];
}
interface FontSimilaritySearchDetection {
    bounding_box: number[];
    similar_fonts: unknown[][];
}

interface VideoCommand {
    prompt: string;
    aspect_ratio?: "9:16" | "3:4" | "1:1" | "4:3" | "16:9" | "21:9";
    user_id?: string;
    video?: VideoGenerationOptions;
    options?: GenAIOptions$j;
}
interface VideoGenerationOptions {
    resolution?: "540p" | "720p" | "1080p";
    duration?: "5s" | "10s";
    hdr?: boolean;
    exr_export?: boolean;
    loop?: boolean;
    start_frame?: VideoImageRef$1;
    end_frame?: VideoImageRef$1;
}
interface VideoImageRef$1 {
    url?: string;
    data?: string;
    media_type?: string;
    generation_id?: string;
}
interface GenAIOptions$j {
    safety_checks?: SafetyChecksOptions$j;
    drive?: DriveOptions$j;
}
interface SafetyChecksOptions$j {
    enabled?: boolean;
}
interface DriveOptions$j {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$j;
}
interface DriveFolderOptions$j {
    path?: string;
    id?: string;
}
interface VideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LumaVideoResultPayload$2;
}
interface LumaVideoResultPayload$2 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface VideoEditCommand {
    prompt: string;
    source: VideoSource$1;
    user_id?: string;
    video: VideoEditOptions;
    options?: GenAIOptions$i;
}
interface VideoSource$1 {
    generation_id?: string;
    url?: string;
    data?: string;
    media_type?: string;
}
interface VideoEditOptions {
    resolution?: "540p" | "720p" | "1080p";
    duration?: "5s" | "10s";
    hdr?: boolean;
    exr_export?: boolean;
    start_frame?: VideoImageRef;
    edit: VideoEdit;
}
interface VideoImageRef {
    url?: string;
    data?: string;
    media_type?: string;
    generation_id?: string;
}
interface VideoEdit {
    strength?: "adhere_1" | "adhere_2" | "adhere_3" | "flex_1" | "flex_2" | "flex_3" | "reimagine_1" | "reimagine_2" | "reimagine_3";
    auto_controls?: boolean;
    controls?: VideoEditControls;
    keyframes?: VideoImageRef[];
    keyframe_indexes?: number[];
}
interface VideoEditControls {
    pose?: VideoEditControl;
    depth?: VideoEditControl;
    normals?: VideoEditControl;
    trajectory?: VideoEditControl;
    face?: VideoEditControl;
}
interface VideoEditControl {
    enabled: boolean;
    strength?: "precise" | "coarse";
    blur?: number;
    augmentation?: number;
    sparsity?: number;
}
interface GenAIOptions$i {
    safety_checks?: SafetyChecksOptions$i;
    drive?: DriveOptions$i;
}
interface SafetyChecksOptions$i {
    enabled?: boolean;
}
interface DriveOptions$i {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$i;
}
interface DriveFolderOptions$i {
    path?: string;
    id?: string;
}
interface VideoEditResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LumaVideoResultPayload$1;
}
interface LumaVideoResultPayload$1 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface VideoReframeCommand {
    prompt: string;
    aspect_ratio: "9:16" | "3:4" | "1:1" | "4:3" | "16:9" | "21:9";
    source: VideoSource;
    user_id?: string;
    video?: VideoReframeOptions;
    options?: GenAIOptions$h;
}
interface VideoSource {
    generation_id?: string;
    url?: string;
    data?: string;
    media_type?: string;
}
interface VideoReframeOptions {
    resolution?: "540p" | "720p" | "1080p";
    source_position?: VideoSourcePosition;
}
interface VideoSourcePosition {
    x_norm: number;
    y_norm: number;
    w_norm: number;
    h_norm: number;
}
interface GenAIOptions$h {
    safety_checks?: SafetyChecksOptions$h;
    drive?: DriveOptions$h;
}
interface SafetyChecksOptions$h {
    enabled?: boolean;
}
interface DriveOptions$h {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$h;
}
interface DriveFolderOptions$h {
    path?: string;
    id?: string;
}
interface VideoReframeResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LumaVideoResultPayload;
}
interface LumaVideoResultPayload {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface DiffbirEnhancementCommand {
    image: string;
    upscale?: DiffbirEnhancementUpscale;
    face_enhancement?: DiffbirEnhancementFaceEnhancement;
    colour_correction?: DiffbirEnhancementColourCorrection;
    seed?: number;
    output_format?: string;
    max_output_area_mp?: number;
    options?: GenAIOptions$g;
    model_execution_mode?: string;
}
interface DiffbirEnhancementUpscale {
    enabled?: boolean;
    node?: string;
    target_scale?: number;
    target_size?: number;
    target_height?: number;
    target_width?: number;
    units?: string;
    output_dpi?: number;
    resize_before_processing?: boolean;
    smooth_patch_average?: boolean;
    creative_num_steps?: number;
    strength?: number;
    guidance_scale?: number;
    masked_latents_scale?: number;
    creative_strength?: number;
    creative_use_gan?: boolean;
    srtv_fidelity?: number;
}
interface DiffbirEnhancementFaceEnhancement {
    enabled?: boolean;
    face_blending_cbcr?: number;
    antialias?: boolean;
    face_size_upper_threshold?: number;
    num_inference_steps?: number;
    prompt?: string;
    negative_prompt?: string;
    guidance_scale?: number;
    gfpgan_threshold?: number;
    diffbir_thresholds?: Record<string, number | string>;
}
interface DiffbirEnhancementColourCorrection {
    enabled?: boolean;
    blending?: number;
}
interface GenAIOptions$g {
    safety_checks?: SafetyChecksOptions$g;
    drive?: DriveOptions$g;
}
interface SafetyChecksOptions$g {
    enabled?: boolean;
}
interface DriveOptions$g {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$g;
}
interface DriveFolderOptions$g {
    path?: string;
    id?: string;
}
interface DiffbirEnhancementResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: DiffbirEnhancementResultData;
}
interface DiffbirEnhancementResultData {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface StableDiffusionInpaintCommand {
    image: string;
    mask?: string;
    prompt?: string;
    blip_caption?: string;
    negative_prompt?: string;
    paint_mask?: boolean;
    seed?: number;
    output_image_format?: "PNG" | "JPEG" | "WEBP";
    num_outputs?: number;
    model?: "model-stable-diffusion-inpaint-1-5-0";
    options?: GenAIOptions$f;
}
interface GenAIOptions$f {
    safety_checks?: SafetyChecksOptions$f;
    drive?: DriveOptions$f;
}
interface SafetyChecksOptions$f {
    enabled?: boolean;
}
interface DriveOptions$f {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$f;
}
interface DriveFolderOptions$f {
    path?: string;
    id?: string;
}
interface StableDiffusionInpaintResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: StableDiffusionInpaintResultData;
}
interface StableDiffusionInpaintResultData {
    items?: StableDiffusionInpaintResultItem[];
}
interface StableDiffusionInpaintResultItem {
    url: string;
    mimeType?: string;
    prompt?: string;
    driveFile?: Record<string, unknown>;
}

interface AsyncTtsCommand {
    model_id: AsyncModelId;
    transcript: string;
    voice?: AsyncVoice;
    output_format: AsyncOutputFormat;
    options?: GenAIOptions$e;
}
type AsyncModelId = "async_flash_v1.0";
interface AsyncVoice {
    mode: AsyncVoiceMode;
    id: string;
}
type AsyncVoiceMode = "id";
interface AsyncOutputFormat {
    container: AsyncVoiceContainerFormat;
    encoding?: AsyncVoiceEncodingFormat;
    sample_rate: number;
    bit_rate?: number;
}
type AsyncVoiceContainerFormat = "raw" | "mp3" | "wav";
type AsyncVoiceEncodingFormat = "pcm_f32le" | "pcm_s16le";
interface GenAIOptions$e {
    safety_checks?: SafetyChecksOptions$e;
    drive?: DriveOptions$e;
}
interface SafetyChecksOptions$e {
    enabled?: boolean;
}
interface DriveOptions$e {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$e;
}
interface DriveFolderOptions$e {
    path?: string;
    id?: string;
}
interface AsyncTtsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AsyncTtsResult;
}
interface AsyncTtsResult {
    url?: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface Happyhorse11TextToVideoCommand$1 {
    prompt: string;
    resolution?: "720P" | "1080P";
    ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    duration?: number;
    seed?: number;
    watermark?: boolean;
    options?: GenAIOptions$d;
}
interface GenAIOptions$d {
    safety_checks?: SafetyChecksOptions$d;
    drive?: DriveOptions$d;
}
interface SafetyChecksOptions$d {
    enabled?: boolean;
}
interface DriveOptions$d {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$d;
}
interface DriveFolderOptions$d {
    path?: string;
    id?: string;
}
interface Happyhorse11TextToVideoResponse$1 {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Happyhorse11TextToVideoResult$1;
}
interface Happyhorse11TextToVideoResult$1 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface Happyhorse11ImageToVideoCommand$1 {
    media: Happyhorse11I2VMediaItem$1[];
    prompt?: string;
    resolution?: "720P" | "1080P";
    duration?: number;
    seed?: number;
    watermark?: boolean;
    options?: GenAIOptions$c;
}
interface Happyhorse11I2VMediaItem$1 {
    type: "first_frame";
    url: string;
}
interface GenAIOptions$c {
    safety_checks?: SafetyChecksOptions$c;
    drive?: DriveOptions$c;
}
interface SafetyChecksOptions$c {
    enabled?: boolean;
}
interface DriveOptions$c {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$c;
}
interface DriveFolderOptions$c {
    path?: string;
    id?: string;
}
interface Happyhorse11ImageToVideoResponse$1 {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Happyhorse11ImageToVideoResult$1;
}
interface Happyhorse11ImageToVideoResult$1 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface Happyhorse11ReferenceToVideoCommand$1 {
    prompt: string;
    media: Happyhorse11R2VMediaItem$1[];
    resolution?: "720P" | "1080P";
    ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    duration?: number;
    seed?: number;
    watermark?: boolean;
    options?: GenAIOptions$b;
}
interface Happyhorse11R2VMediaItem$1 {
    type: "reference_image";
    url: string;
}
interface GenAIOptions$b {
    safety_checks?: SafetyChecksOptions$b;
    drive?: DriveOptions$b;
}
interface SafetyChecksOptions$b {
    enabled?: boolean;
}
interface DriveOptions$b {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$b;
}
interface DriveFolderOptions$b {
    path?: string;
    id?: string;
}
interface Happyhorse11ReferenceToVideoResponse$1 {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Happyhorse11ReferenceToVideoResult$1;
}
interface Happyhorse11ReferenceToVideoResult$1 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface SodV1Command {
    photo: string;
    output_width?: number;
    output_height?: number;
}
interface SodV1Response {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: SodV1ImageResponse;
}
interface SodV1ImageResponse {
    id: string;
    data: SodV1ImageData;
}
interface SodV1ImageData {
    alpha: string;
}

interface SodV2Command {
    photo: string;
    postprocess_image: boolean;
    model?: "model-sod-v8-2" | "model-sod-v10" | "model-sod-v10-1" | "model-sod-v11-0";
    options?: GenAIOptions$a;
}
interface GenAIOptions$a {
    safety_checks?: SafetyChecksOptions$a;
    drive?: DriveOptions$a;
}
interface SafetyChecksOptions$a {
    enabled?: boolean;
}
interface DriveOptions$a {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$a;
}
interface DriveFolderOptions$a {
    path?: string;
    id?: string;
}
interface SodV2Response {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: SodV2ImageResponse;
}
interface SodV2ImageResponse {
    id: string;
    data: SodV2ImageData;
    driveFile?: Record<string, unknown>;
}
interface SodV2ImageData {
    alpha: string;
    image: string;
}

interface FluxVtoCommand {
    prompt: string;
    personImageUrl: string;
    garmentImageUrl: string;
    seed?: number;
    safetyTolerance?: number;
    outputFormat?: "jpeg" | "png" | "webp";
    options?: GenAIOptions$9;
}
interface GenAIOptions$9 {
    safety_checks?: SafetyChecksOptions$9;
    drive?: DriveOptions$9;
}
interface SafetyChecksOptions$9 {
    enabled?: boolean;
}
interface DriveOptions$9 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$9;
}
interface DriveFolderOptions$9 {
    path?: string;
    id?: string;
}
interface FluxVtoResult {
    result: GeneratedImageResult;
}
interface GeneratedImageResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface Happyhorse11TextToVideoCommand {
    prompt: string;
    resolution?: "720P" | "1080P";
    ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    duration?: number;
    seed?: number;
    watermark?: boolean;
    options?: GenAIOptions$8;
}
interface GenAIOptions$8 {
    safety_checks?: SafetyChecksOptions$8;
    drive?: DriveOptions$8;
}
interface SafetyChecksOptions$8 {
    enabled?: boolean;
}
interface DriveOptions$8 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$8;
}
interface DriveFolderOptions$8 {
    path?: string;
    id?: string;
}
interface Happyhorse11TextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Happyhorse11TextToVideoResult;
}
interface Happyhorse11TextToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface Happyhorse11ImageToVideoCommand {
    media: Happyhorse11I2VMediaItem[];
    prompt?: string;
    resolution?: "720P" | "1080P";
    duration?: number;
    seed?: number;
    watermark?: boolean;
    options?: GenAIOptions$7;
}
interface Happyhorse11I2VMediaItem {
    type: "first_frame";
    url: string;
}
interface GenAIOptions$7 {
    safety_checks?: SafetyChecksOptions$7;
    drive?: DriveOptions$7;
}
interface SafetyChecksOptions$7 {
    enabled?: boolean;
}
interface DriveOptions$7 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$7;
}
interface DriveFolderOptions$7 {
    path?: string;
    id?: string;
}
interface Happyhorse11ImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Happyhorse11ImageToVideoResult;
}
interface Happyhorse11ImageToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface Happyhorse11ReferenceToVideoCommand {
    prompt: string;
    media: Happyhorse11R2VMediaItem[];
    resolution?: "720P" | "1080P";
    ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    duration?: number;
    seed?: number;
    watermark?: boolean;
    options?: GenAIOptions$6;
}
interface Happyhorse11R2VMediaItem {
    type: "reference_image";
    url: string;
}
interface GenAIOptions$6 {
    safety_checks?: SafetyChecksOptions$6;
    drive?: DriveOptions$6;
}
interface SafetyChecksOptions$6 {
    enabled?: boolean;
}
interface DriveOptions$6 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$6;
}
interface DriveFolderOptions$6 {
    path?: string;
    id?: string;
}
interface Happyhorse11ReferenceToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Happyhorse11ReferenceToVideoResult;
}
interface Happyhorse11ReferenceToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface QwenImageEditAngleCommand {
    image: string | string[];
    prompt?: string;
    system_prompt?: string;
    negative_prompt?: string;
    strength?: number;
    grag_scale?: number;
    drop_cond_tokens_prob?: number;
    seed?: number;
    output_format?: "JPEG" | "PNG" | "HEIC" | "WEBP";
    options?: GenAIOptions$5;
    model?: "preview-model-qwent-image-edit-angle" | "model-qwent-image-edit-angle";
    lora_params?: QwenAngleLoraParams;
    num_inference_steps?: number;
    guidance_scale?: number;
}
interface GenAIOptions$5 {
    safety_checks?: SafetyChecksOptions$5;
    drive?: DriveOptions$5;
}
interface SafetyChecksOptions$5 {
    enabled?: boolean;
}
interface DriveOptions$5 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$5;
}
interface DriveFolderOptions$5 {
    path?: string;
    id?: string;
}
interface QwenAngleLoraParams {
    lora_weights?: Record<string, unknown>;
    keep_other_weights?: boolean;
}
interface QwenImageEditAngleResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenImageEditResultData;
}
interface QwenImageEditResultData {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface LamaInpaintingCommand {
    image: string;
    mask: string;
    model?: "model-lama-v2" | "model-lama-v3" | "model-genfill-v7-0-0";
    quality_jpg?: number;
}
interface LamaInpaintingResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LamaInpaintingResultData;
}
interface LamaInpaintingResultData {
    url: string;
}

interface SegmentAnythingCommand {
    url: string;
    model?: string;
    input_label: number[];
    input_point?: number[][];
    automatic?: boolean;
    compatibility_mode?: boolean;
    use_m2m?: boolean;
    box_nms_thresh?: number;
    crop_n_layers?: number;
    crop_n_points_downscale_factor?: number;
    crop_nms_thresh?: number;
    crop_overlap_ratio?: number;
    mask_threshold?: number;
    min_mask_region_area?: number;
    points_per_side?: number;
    pred_iou_thresh?: number;
    stability_score_offset?: number;
    stability_score_thresh?: number;
}
interface SegmentAnythingResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: SegmentAnythingResultData;
}
interface SegmentAnythingResultData {
    url: string;
}

interface SegmentAnythingSam3Command {
    image: string;
    prompt: string;
    score_threshold?: number;
    mask_threshold?: number;
    model?: string;
}
interface SegmentAnythingSam3Response {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: SegmentAnythingSam3ResultData;
}
interface SegmentAnythingSam3ResultData {
    id: string;
    data: SegmentAnythingSam3Data;
}
interface SegmentAnythingSam3Data {
    detections: SegmentAnythingSam3Detection[];
    overlay_image: string;
}
interface SegmentAnythingSam3Detection {
    box: SegmentAnythingSam3DetectionBox;
    score: number;
}
interface SegmentAnythingSam3DetectionBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface MusicGenerationCommand {
    prompt: string;
    music_length_seconds: number;
    model_id?: "music_v1" | "music_v2";
    force_instrumental?: boolean;
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    options?: GenAIOptions$4;
}
interface GenAIOptions$4 {
    safety_checks?: SafetyChecksOptions$4;
    drive?: DriveOptions$4;
}
interface SafetyChecksOptions$4 {
    enabled?: boolean;
}
interface DriveOptions$4 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$4;
}
interface DriveFolderOptions$4 {
    path?: string;
    id?: string;
}
interface MusicGenerationResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AudioResult;
}
interface AudioResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface EffectsCommand {
    image_url: string;
    effect_name: string;
    style_image_url?: string;
    skip_upsample?: boolean;
    options?: GenAIOptions$3;
}
interface GenAIOptions$3 {
    safety_checks?: SafetyChecksOptions$3;
    drive?: DriveOptions$3;
}
interface SafetyChecksOptions$3 {
    enabled?: boolean;
}
interface DriveOptions$3 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$3;
}
interface DriveFolderOptions$3 {
    path?: string;
    id?: string;
}
interface EffectsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: EffectsResultData;
}
interface EffectsResultData {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface FluxInpainterV1Command {
    caption: string;
    image_url: string;
    masked_image_url?: string;
    count?: number;
    seed?: number;
    use_cropping?: boolean;
    model?: string;
}
type EmptyModel = Record<string, never>;

interface ImageCaptioningCommand {
    image_url: string;
    model?: "preview-picsart-image-captioning-v1" | "picsart-image-captioning-v1";
    caption_model?: "blip2" | "moondream";
    prompt?: string;
    options?: GenAIOptions$2;
}
interface GenAIOptions$2 {
    safety_checks?: SafetyChecksOptions$2;
    drive?: DriveOptions$2;
}
interface SafetyChecksOptions$2 {
    enabled?: boolean;
}
interface DriveOptions$2 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2;
}
interface DriveFolderOptions$2 {
    path?: string;
    id?: string;
}
interface ImageCaptioningResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ImageCaptioningResultData;
}
interface ImageCaptioningResultData {
    caption: string;
}

interface QwenHaircutsCommand {
    image: string | string[];
    model?: string;
    prompt?: string;
    system_prompt?: string;
    negative_prompt?: string;
    upload_to_cdn?: boolean;
    metadata?: Record<string, unknown>;
    options?: GenAIOptions$1;
}
interface GenAIOptions$1 {
    safety_checks?: SafetyChecksOptions$1;
    drive?: DriveOptions$1;
}
interface SafetyChecksOptions$1 {
    enabled?: boolean;
}
interface DriveOptions$1 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$1;
}
interface DriveFolderOptions$1 {
    path?: string;
    id?: string;
}
interface QwenHaircutsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenHaircutsResultData;
}
interface QwenHaircutsResultData {
    url: string;
    mimeType?: string;
}

interface AvatarGenerationCommand {
    profile_images: string[];
    reference_images?: string[];
    add_profile_as_reference?: boolean;
    prompt?: string;
    negative_prompt?: string;
    guidance_scale?: number;
    control_scale?: number;
    num_inference_steps?: number;
    seed?: number;
    num_output_images?: number;
    enhancements?: string;
    add_noise?: number;
    enable_rules?: boolean;
    gender?: string;
    use_orientation_correction?: boolean;
    new_profile_image?: boolean;
    max_regenerate?: number;
    skin_fix?: boolean;
    model: "v3.6.11" | "v3.6.16" | "v3.6.17";
    num_outputs?: number;
    options?: GenAIOptions;
    model_execution_mode?: string;
}
interface GenAIOptions {
    safety_checks?: SafetyChecksOptions;
    drive?: DriveOptions;
}
interface SafetyChecksOptions {
    enabled?: boolean;
}
interface DriveOptions {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions;
}
interface DriveFolderOptions {
    path?: string;
    id?: string;
}
interface AvatarGenerationResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AvatarGenerationResultData;
}
interface AvatarGenerationResultData {
    images: string[];
    tags?: string[];
}

interface WorkflowTypes {
    'check-text': {
        params: CheckTextCommand;
        result: CheckTextResultModel;
    };
    'file-copy': {
        params: FileCopyCommand;
        result: FileCopyResponse;
    };
    'gemini': {
        params: GeminiCommand$1;
        result: GeminiResult$1;
    };
    'chat-completions': {
        params: ChatCompletionsCommand$1;
        result: ChatCompletionResponse;
    };
    'openai/v1/responses': {
        params: OpenAIResponsesCommand;
        result: OpenAIResponsesResponse;
    };
    'openai-images-generate': {
        params: OpenaiImagesGenerateCommand;
        result: OpenaiImagesGenerateResponse;
    };
    'imagen': {
        params: ImagenCommand;
        result: ImagenResponse;
    };
    'polaroid/gemini': {
        params: GeminiCommand;
        result: GeminiResult;
    };
    'v1/files/metadata': {
        params: FileMetadataCommand;
        result: FileMetadataResponseModel;
    };
    'openai/v1/transcription': {
        params: OpenaiTranscriptionCommand;
        result: OpenaiTranscriptionResponse;
    };
    'gemini/v1/images': {
        params: GeminiImagesCommand;
        result: GeminiV1ImagesResult;
    };
    'vertex-ai/virtual-try-on': {
        params: VirtualTryOnCommand;
        result: VirtualTryOnResponse;
    };
    'openai/v1/videos': {
        params: OpenAiSoraCommand;
        result: OpenaiSoraResponse;
    };
    'claude/v1/messages': {
        params: ClaudeV1MessagesCommand;
        result: EmptyModel$2;
    };
    'openai-image-editing': {
        params: OpenAiImageEditingCommand;
        result: OpenAiImageEditingResult;
    };
    'wan-25-preview/image-to-video': {
        params: ImageToVideoInput$1;
        result: Wan25PreviewImageToVideoResponse;
    };
    'wan-25-preview/text-to-video': {
        params: TextToVideoInput$1;
        result: Wan25PreviewTextToVideoResponse;
    };
    'qwen-image': {
        params: BaseQwenImageInput;
        result: QwenImageResponse;
    };
    'qwen-image/image-to-image': {
        params: QwenImageI2IInput;
        result: QwenImageImageToImageResponse;
    };
    'qwen-image-edit-plus': {
        params: BaseQwenEditImagePlusInput;
        result: QwenImageEditPlusResponse;
    };
    'hunyuan-image/v3/text-to-image': {
        params: HunyuanTextToImageInputV3;
        result: HunyuanImageV3TextToImageResponse;
    };
    'minimax/hailuo-02/pro/text-to-video': {
        params: ProTextToVideoHailuo02Input;
        result: MinimaxHailuo02ProTextToVideoResponse;
    };
    'minimax/hailuo-02/pro/image-to-video': {
        params: ProImageToVideoHailuo02Input;
        result: MinimaxHailuo02ProImageToVideoResponse;
    };
    'ltxv-2/image-to-video': {
        params: LTXV20ImageToVideoRequest;
        result: Ltxv2ImageToVideoResponse;
    };
    'ltxv-2/text-to-video': {
        params: LTXV20TextToVideoRequest;
        result: Ltxv2TextToVideoResponse;
    };
    'ltxv-2/image-to-video/fast': {
        params: LTXV20ImageToVideoFastRequest;
        result: Ltxv2ImageToVideoFastResponse;
    };
    'ltxv-2/text-to-video/fast': {
        params: LTXV20TextToVideoFastRequest;
        result: Ltxv2TextToVideoFastResponse;
    };
    'veed/fabric-1.0': {
        params: FabricOneLipsyncInput$1;
        result: VeedFabric10Response;
    };
    'veed/fabric-1.0/fast': {
        params: FabricOneLipsyncInput;
        result: VeedFabric10FastResponse;
    };
    'bytedance-upscaler/upscale/video': {
        params: UpscaleInput;
        result: BytedanceUpscalerUpscaleVideoResponse;
    };
    'elevenlabs/tts/eleven-v3': {
        params: TextToSpeechRequestV3;
        result: ElevenlabsTtsElevenV3Response;
    };
    'ovi': {
        params: OviT2VRequest;
        result: OviResponse;
    };
    'ovi/image-to-video': {
        params: OviI2VRequest;
        result: OviImageToVideoResponse;
    };
    'reve/text-to-image': {
        params: ReveCreateInput;
        result: ReveTextToImageResponse;
    };
    'reve/edit': {
        params: ReveEditInput;
        result: ReveEditResponse;
    };
    'ffmpeg-api/merge-videos': {
        params: MergeVideosInput;
        result: FfmpegApiMergeVideosResponse;
    };
    'ffmpeg-api/merge-audio-video': {
        params: CombineInput;
        result: FfmpegApiMergeAudioVideoResponse;
    };
    'minimax-music/v2': {
        params: TextToMusic20Request;
        result: MinimaxMusicV2Response;
    };
    'elevenlabs/sound-effects/v2': {
        params: SoundEffectRequestV2;
        result: ElevenlabsSoundEffectsV2Response;
    };
    'bytedance/omnihuman/v1.5': {
        params: OmniHumanv15Input;
        result: BytedanceOmnihumanV15Response;
    };
    'ltx-2/retake-video': {
        params: LTXRetakeVideoRequest;
        result: Ltx2RetakeVideoResponse;
    };
    'ffmpeg-api/extract-frame': {
        params: FrameInput;
        result: FfmpegApiExtractFrameResponse;
    };
    'creatify/aurora': {
        params: AuroraInputModel;
        result: CreatifyAuroraResponse;
    };
    'topaz/upscale/video': {
        params: VideoUpscaleRequest;
        result: TopazUpscaleVideoResponse;
    };
    'topaz/upscale/image': {
        params: ImageUpscaleRequest;
        result: TopazUpscaleImageResponse;
    };
    'v1/ai-writer': {
        params: AiWriterV1Command;
        result: EmptyModel$1;
    };
    'wan/v2.6/image-to-video': {
        params: ImageToVideoInput;
        result: WanV26ImageToVideoResponse;
    };
    'wan/v2.6/text-to-video': {
        params: TextToVideoInput;
        result: WanV26TextToVideoResponse;
    };
    'wan/v2.6/reference-to-video': {
        params: ReferenceToVideoInput;
        result: WanV26ReferenceToVideoResponse;
    };
    'v1/drive/files': {
        params: SaveToDriveCommand;
        result: SaveToDriveResponse;
    };
    'seedvr/upscale/image': {
        params: SeedVRImageInput;
        result: SeedvrUpscaleImageResponse;
    };
    'xai/grok-imagine-image': {
        params: XAIImageInput;
        result: XaiGrokImagineImageResponse;
    };
    'xai/grok-imagine-image/edit': {
        params: XAIImageEditInput;
        result: XaiGrokImagineImageEditResponse;
    };
    'xai/grok-imagine-video/text-to-video': {
        params: XAITextToVideoInput;
        result: XaiGrokImagineVideoTextToVideoResponse;
    };
    'xai/grok-imagine-video/image-to-video': {
        params: XAIImageToVideoInput;
        result: XaiGrokImagineVideoImageToVideoResponse;
    };
    'xai/grok-imagine-video/edit-video': {
        params: XAIVideoEditInput;
        result: XaiGrokImagineVideoEditVideoResponse;
    };
    'workflow-utilities/trim-video': {
        params: TrimVideoInput;
        result: WorkflowUtilitiesTrimVideoResponse;
    };
    'video-moderation': {
        params: VideoModerationModel;
        result: VideoModerationResponse;
    };
    'bria/expand': {
        params: ImageExpansionInput;
        result: BriaExpandResponse;
    };
    'gemini/v2/images': {
        params: GeminiV2ImagesCommand;
        result: GeminiV2ImagesResult;
    };
    'recraft/v1/images/generations': {
        params: RecraftImagesCommand;
        result: RecraftImagesResponse;
    };
    'recraft/v1/images/replacebackground': {
        params: RecraftReplaceBackgroundCommand;
        result: RecraftReplaceBackgroundResponse;
    };
    'recraft/v1/images/vectorize': {
        params: RecraftVectorizeCommand;
        result: RecraftVectorizeResponse;
    };
    'recraft/v1/images/crispupscale': {
        params: RecraftCrispUpscaleCommand;
        result: RecraftCrispUpscaleResponse;
    };
    'recraft/v1/images/creativeupscale': {
        params: RecraftCreativeUpscaleCommand;
        result: RecraftCreativeUpscaleResponse;
    };
    'recraft/v1/images/variateimage': {
        params: RecraftVariateImageCommand;
        result: RecraftVariateImageResponse;
    };
    'kling-text-to-video': {
        params: KlingTextToVideoCommand;
        result: KlingTextToVideoResponse;
    };
    'kling-image-to-video': {
        params: KlingImageToVideoCommand;
        result: KlingImageToVideoResponse;
    };
    'kling-text-to-audio': {
        params: KlingTextToAudioCommand;
        result: KlingTextToAudioResponse;
    };
    'kling-video-to-audio': {
        params: KlingVideoToAudioCommand;
        result: KlingVideoToAudioResponse;
    };
    'kling-omni-video': {
        params: KlingOmniVideoCommand;
        result: KlingOmniVideoResponse;
    };
    'kling-avatar': {
        params: KlingAvatarCommand;
        result: KlingAvatarResponse;
    };
    'kling-motion-control': {
        params: KlingMotionControlCommand;
        result: KlingMotionControlResponse;
    };
    'kling-elements': {
        params: KlingElementsCommand;
        result: KlingElementsResponse;
    };
    'elevenlabs/v1/sound-generation': {
        params: SoundGenerationCommand;
        result: SoundGenerationResponse;
    };
    'flux-kontext': {
        params: FluxKontextCommand;
        result: FluxKontextResult;
    };
    'flux-v2': {
        params: FluxV2Command;
        result: FluxV2Result;
    };
    'elevenlabs/v1/text-to-speech': {
        params: TextToSpeechCommand;
        result: TextToSpeechResponse;
    };
    'elevenlabs/v1/speech-to-speech': {
        params: SpeechToSpeechCommand;
        result: SpeechToSpeechResponse;
    };
    'elevenlabs/v1/voice-search': {
        params: VoiceSearchCommand;
        result: VoiceSearchResponse;
    };
    'veo-t2v': {
        params: VeoVideoGenCommand;
        result: VeoVideoGenResponse;
    };
    'heygen/v1/video/generate': {
        params: HeygenVideoGenerateCommand;
        result: HeygenVideoGenerateResponse;
    };
    'heygen/v1/avatars/list': {
        params: HeygenListAvatarsCommand;
        result: HeygenListAvatarsResponse;
    };
    'heygen/v1/voices/list': {
        params: HeygenListVoicesCommand;
        result: HeygenListVoicesResponse;
    };
    'openai/v1/videos/characters': {
        params: OpenAiSoraCharactersCommand;
        result: OpenAiSoraCharactersResponse;
    };
    'openai/v1/videos/extensions': {
        params: OpenAiSoraExtensionsCommand;
        result: OpenAiSoraExtensionsResponse;
    };
    'openai/v1/videos/edits': {
        params: OpenAiSoraEditsCommand;
        result: OpenAiSoraEditsResponse;
    };
    'openai/v1/videos/batch': {
        params: OpenAiSoraBatchCommand;
        result: OpenAiSoraBatchResponse;
    };
    'gemini/v1/audios': {
        params: GeminiV1AudiosCommand;
        result: GeminiV1AudiosResult;
    };
    'lyria/v1/music': {
        params: LyriaMusicCommand;
        result: LyriaMusicResult;
    };
    'recraft/v1/images/explore': {
        params: RecraftExploreCommand;
        result: RecraftExploreResponse;
    };
    'recraft/v1/images/exploresimilar': {
        params: RecraftExploreSimilarCommand;
        result: RecraftExploreSimilarResponse;
    };
    'kling/v1/images/generations': {
        params: KlingImageGenerationCommand;
        result: KlingImageGenerationResponse;
    };
    'kling/v1/images/omni-image': {
        params: KlingOmniImageCommand;
        result: KlingOmniImageResponse;
    };
    'kling/v1/images/multi-image-to-image': {
        params: KlingMultiImageToImageCommand;
        result: KlingMultiImageToImageResponse;
    };
    'wan/v1/images': {
        params: WanImagesCommand;
        result: WanImagesResponse;
    };
    'ltx-2.3/text-to-video': {
        params: LTXV23TextToVideoRequest;
        result: Ltx23TextToVideoResponse;
    };
    'ltx-2.3/image-to-video': {
        params: LTXV23ImageToVideoRequest;
        result: Ltx23ImageToVideoResponse;
    };
    'ltx-2.3/text-to-video/fast': {
        params: LTXV23TextToVideoFastRequest;
        result: Ltx23TextToVideoFastResponse;
    };
    'ltx-2.3/image-to-video/fast': {
        params: LTXV23ImageToVideoFastRequest;
        result: Ltx23ImageToVideoFastResponse;
    };
    'ltx-2.3/audio-to-video': {
        params: LTXV23AudioToVideoRequest;
        result: Ltx23AudioToVideoResponse;
    };
    'ltx-2.3/extend-video': {
        params: LTXV23ExtendVideoRequest;
        result: Ltx23ExtendVideoResponse;
    };
    'ltx-2.3/retake-video': {
        params: LTXV23RetakeVideoRequest;
        result: Ltx23RetakeVideoResponse;
    };
    'elevenlabs/v1/audio-isolation': {
        params: AudioIsolationCommand;
        result: AudioIsolationResponse;
    };
    'elevenlabs/v1/dubbing': {
        params: DubbingCommand;
        result: DubbingResponse;
    };
    'elevenlabs/v1/voice-remix': {
        params: VoiceRemixCommand;
        result: VoiceRemixResponse;
    };
    'elevenlabs/v1/text-to-dialogue': {
        params: TextToDialogueCommand;
        result: TextToDialogueResponse;
    };
    'elevenlabs/v1/voice-design': {
        params: VoiceDesignCommand;
        result: VoiceDesignResponse;
    };
    'elevenlabs/v1/voice-create-previews': {
        params: VoiceCreatePreviewsCommand;
        result: VoiceCreatePreviewsResponse;
    };
    'wan/v1/image-to-video': {
        params: WanImageToVideoFirstFrameCommand;
        result: WanImageToVideoFirstFrameResponse;
    };
    'wan/v1/text-to-video': {
        params: WanTextToVideoCommand;
        result: WanTextToVideoResponse;
    };
    'wan/v1/reference-to-video': {
        params: WanReferenceToVideoCommand;
        result: WanReferenceToVideoResponse;
    };
    'wan/v1/keyframe-to-video': {
        params: WanImageToVideoFirstAndLastFramesCommand;
        result: WanImageToVideoFirstAndLastFramesResponse;
    };
    'trellis-2': {
        params: SingleImageInputModel;
        result: Trellis2Response;
    };
    'lyria/v2/music': {
        params: Lyria3MusicCommand;
        result: Lyria3MusicResult;
    };
    'wan/v2/text-to-video': {
        params: WanV2TextToVideoCommand;
        result: WanV2TextToVideoResponse;
    };
    'wan/v2/image-to-video': {
        params: WanV2ImageToVideoCommand;
        result: WanV2ImageToVideoResponse;
    };
    'wan/v2/reference-to-video': {
        params: WanV2ReferenceToVideoCommand;
        result: WanV2ReferenceToVideoResponse;
    };
    'wan/v2/video-edit': {
        params: WanV2VideoEditCommand;
        result: WanV2VideoEditResponse;
    };
    'qwen-image-2/text-to-image': {
        params: QwenImage2TextToImageInput;
        result: QwenImage2TextToImageResponse;
    };
    'qwen-image-2/edit': {
        params: QwenImage2EditInput;
        result: QwenImage2EditResponse;
    };
    'qwen-image-2/pro/text-to-image': {
        params: QwenImage2ProTextToImageInput;
        result: QwenImage2ProTextToImageResponse;
    };
    'qwen-image-2/pro/edit': {
        params: QwenImage2ProEditInput;
        result: QwenImage2ProEditResponse;
    };
    'flux/v1/outpainting': {
        params: FluxOutpaintingCommand;
        result: FluxOutpaintingResult;
    };
    'minimax/hailuo-2.3/standard/text-to-video': {
        params: StandardTextToVideoHailuo23Input;
        result: MinimaxHailuo23StandardTextToVideoResponse;
    };
    'minimax/hailuo-2.3/standard/image-to-video': {
        params: StandardImageToVideoHailuo23Input;
        result: MinimaxHailuo23StandardImageToVideoResponse;
    };
    'minimax/hailuo-2.3/pro/text-to-video': {
        params: ProTextToVideoHailuo23Input;
        result: MinimaxHailuo23ProTextToVideoResponse;
    };
    'minimax/hailuo-2.3/pro/image-to-video': {
        params: ProImageToVideoHailuo23Input;
        result: MinimaxHailuo23ProImageToVideoResponse;
    };
    'minimax/hailuo-2.3-fast/standard/image-to-video': {
        params: StandardFastImageToVideoHailuo23Input;
        result: MinimaxHailuo23FastStandardImageToVideoResponse;
    };
    'minimax/hailuo-2.3-fast/pro/image-to-video': {
        params: ProFastImageToVideoHailuo23Input;
        result: MinimaxHailuo23FastProImageToVideoResponse;
    };
    'runway-gen4-image-ref': {
        params: TextToImageCommand$1;
        result: TextToImageResponse$1;
    };
    'runway-act-two': {
        params: CharacterPerformanceCommand;
        result: CharacterPerformanceResponse;
    };
    'runway-aleph': {
        params: VideoToVideoCommand;
        result: VideoToVideoResponse;
    };
    'runway-gen4-5-image-to-video': {
        params: ImageToVideoCommand$2;
        result: ImageToVideoResponse$2;
    };
    'runway-gen4-5-text-to-video': {
        params: TextToVideoCommand$1;
        result: TextToVideoResponse$1;
    };
    'luma-image-to-video-generation': {
        params: ImageToVideoCommand$1;
        result: ImageToVideoResponse$1;
    };
    'luma-media-reframe': {
        params: MediaReframeCommand;
        result: MediaReframeResponse;
    };
    'seedream': {
        params: SeedreamCommand;
        result: SeedreamResult;
    };
    'seedance': {
        params: SeedanceCommand;
        result: SeedanceResponse;
    };
    'runway-video-generate': {
        params: RunwayImageToVideoCommand;
        result: RunwayVideoResponse;
    };
    'pika-text-to-video-v2-2': {
        params: PikaTextToVideoCommand;
        result: PikaTextToVideoResponse;
    };
    'pika-image-to-video-v2-2': {
        params: PikaImageToVideoCommand;
        result: PikaImageToVideoResponse;
    };
    'pika-scenes-v2-2': {
        params: PikaScenesCommand;
        result: PikaScenesResponse;
    };
    'pika-frames-v2-2': {
        params: PikaFramesCommand;
        result: PikaFramesResponse;
    };
    'ideogram-v3-generate': {
        params: IdeogramV3GenerateCommand;
        result: IdeogramV3GenerateResponse;
    };
    'ideogram-v3-edit': {
        params: IdeogramV3EditCommand;
        result: IdeogramV3EditResponse;
    };
    'ideogram-v3-remix': {
        params: IdeogramV3RemixCommand;
        result: IdeogramV3RemixResponse;
    };
    'bytedance/seedance-2.0/text-to-video': {
        params: Seedance2T2VInput;
        result: BytedanceSeedance20TextToVideoResponse;
    };
    'bytedance/seedance-2.0/image-to-video': {
        params: Seedance2I2VInput;
        result: BytedanceSeedance20ImageToVideoResponse;
    };
    'bytedance/seedance-2.0/fast/text-to-video': {
        params: Seedance2T2VFastInput;
        result: BytedanceSeedance20FastTextToVideoResponse;
    };
    'bytedance/seedance-2.0/fast/image-to-video': {
        params: Seedance2I2VFastInput;
        result: BytedanceSeedance20FastImageToVideoResponse;
    };
    'bytedance/seedance-2.0/reference-to-video': {
        params: Seedance2R2VInput;
        result: BytedanceSeedance20ReferenceToVideoResponse;
    };
    'bytedance/seedance-2.0/fast/reference-to-video': {
        params: Seedance2R2VFastInput;
        result: BytedanceSeedance20FastReferenceToVideoResponse;
    };
    'pcp/v1/chat/completions': {
        params: ChatCompletionsCommand;
        result: ChatCompletionsResponse;
    };
    'runway/avatar/create': {
        params: AvatarCreateCommand;
        result: AvatarCreateResponse;
    };
    'runway/avatar/list': {
        params: AvatarListCommand;
        result: AvatarListResponse;
    };
    'runway/avatar/get': {
        params: AvatarGetCommand;
        result: AvatarGetResponse;
    };
    'runway/avatar/update': {
        params: AvatarUpdateCommand;
        result: AvatarUpdateResponse;
    };
    'runway/avatar/delete': {
        params: AvatarDeleteCommand;
        result: AvatarDeleteResponse;
    };
    'runway/realtime-session': {
        params: RealtimeSessionCommand;
        result: RealtimeSessionResponse;
    };
    'runway/avatar/video': {
        params: AvatarVideoCommand;
        result: AvatarVideoResponse;
    };
    'pcp/v1/qwen-image-edit': {
        params: QwenImageEditCommand;
        result: QwenImageEditResponse;
    };
    'x-ai/v1/stt': {
        params: XAiSttCommand;
        result: XAiSttResponse;
    };
    'x-ai/v1/tts': {
        params: XAiTtsCommand;
        result: XAiTtsResponse;
    };
    'x-ai/v1/images/generations': {
        params: XAiImagesGenerationsCommand;
        result: XAiImagesGenerationsResponse;
    };
    'x-ai/v1/images/edits': {
        params: XAiImagesEditsCommand;
        result: XAiImagesEditsResponse;
    };
    'x-ai/v1/videos/generations': {
        params: XAiVideosGenerationsCommand;
        result: XAiVideosGenerationsResponse;
    };
    'x-ai/v1/videos/edits': {
        params: XAiVideosEditsCommand;
        result: XAiVideosEditsResponse;
    };
    'x-ai/v1/videos/extensions': {
        params: XAiVideosExtensionsCommand;
        result: XAiVideosExtensionsResponse;
    };
    'happyhorse/v1/text-to-video': {
        params: HappyhorseTextToVideoCommand;
        result: HappyhorseTextToVideoResponse;
    };
    'happyhorse/v1/image-to-video': {
        params: HappyhorseImageToVideoCommand;
        result: HappyhorseImageToVideoResponse;
    };
    'pcp/v1/whisperx-stt': {
        params: WhisperxVideoCaptionsCommand;
        result: WhisperxVideoCaptionsResponse;
    };
    'pcp/v2/qwen-makeup': {
        params: QwenMakeupCommand;
        result: QwenMakeupResponse;
    };
    'pcp/v1/flux-text-to-image': {
        params: FluxTextToImageCommand;
        result: FluxTextToImageResponse;
    };
    'gemini/v3/images': {
        params: GeminiV3ImagesCommand;
        result: GeminiV3ImagesResult;
    };
    'happyhorse/v1/reference-to-video': {
        params: HappyhorseReferenceToVideoCommand;
        result: HappyhorseReferenceToVideoResponse;
    };
    'happyhorse/v1/video-edit': {
        params: HappyhorseVideoEditCommand;
        result: HappyhorseVideoEditResponse;
    };
    'pcp/v1/ai-expand': {
        params: AiExpandCommand;
        result: AiExpandResponse;
    };
    'qwen/v1/text-to-image': {
        params: QwenTextToImageCommand;
        result: QwenTextToImageResponse;
    };
    'qwen/v1/image-to-image': {
        params: QwenImageToImageCommand;
        result: QwenImageToImageResponse;
    };
    'pcp/v1/genfillv6-inpaint': {
        params: GenfillV6InpaintCommand;
        result: GenfillV6InpaintResponse;
    };
    'pcp/v1/face-correction': {
        params: FaceCorrectionCommand;
        result: FaceCorrectionResponse;
    };
    'luma-uni1-text-to-image': {
        params: TextToImageCommand;
        result: TextToImageResponse;
    };
    'luma-uni1-image-edit': {
        params: ImageEditCommand;
        result: ImageEditResponse;
    };
    'pcp/v1/qwen-multipatch-enhancement': {
        params: QwenMultipatchEnhancementCommand;
        result: QwenMultipatchEnhancementResponse;
    };
    'pcp/v1/video-segmentation': {
        params: VideoSegmentationCommand;
        result: VideoSegmentationResponse;
    };
    'kling/v1/video-effects': {
        params: KlingVideoEffectsCommand;
        result: KlingVideoEffectsResponse;
    };
    'pcp/v1/sana-sprint': {
        params: SanaSprintCommand;
        result: SanaSprintResponse;
    };
    'pcp/v1/video-inpainting': {
        params: VideoInpaintingCommand;
        result: VideoInpaintingResponse;
    };
    'ideogram/v4/generate': {
        params: IdeogramV4GenerateCommand;
        result: IdeogramV4GenerateResponse;
    };
    'gemini-omni/video': {
        params: GeminiOmniVideoGenCommand;
        result: GeminiOmniVideoGenResponse;
    };
    'pixverse/v2/text-to-video': {
        params: TextToVideoCommand;
        result: TextToVideoResponse;
    };
    'pixverse/v2/image-to-video': {
        params: ImageToVideoCommand;
        result: ImageToVideoResponse;
    };
    'pixverse/v2/reference-to-video': {
        params: ReferenceToVideoCommand;
        result: ReferenceToVideoResponse;
    };
    'pcp/v1/font-similarity-search': {
        params: FontSimilaritySearchCommand;
        result: FontSimilaritySearchResponse;
    };
    'luma-ray32-video': {
        params: VideoCommand;
        result: VideoResponse;
    };
    'luma-ray32-video-edit': {
        params: VideoEditCommand;
        result: VideoEditResponse;
    };
    'luma-ray32-video-reframe': {
        params: VideoReframeCommand;
        result: VideoReframeResponse;
    };
    'pcp/v1/enhancement': {
        params: DiffbirEnhancementCommand;
        result: DiffbirEnhancementResponse;
    };
    'pcp/v1/stable-diffusion-inpaint': {
        params: StableDiffusionInpaintCommand;
        result: StableDiffusionInpaintResponse;
    };
    'async-ai-text-to-speech': {
        params: AsyncTtsCommand;
        result: AsyncTtsResponse;
    };
    'happyhorse/v1.5/text-to-video': {
        params: Happyhorse11TextToVideoCommand$1;
        result: Happyhorse11TextToVideoResponse$1;
    };
    'happyhorse/v1.5/image-to-video': {
        params: Happyhorse11ImageToVideoCommand$1;
        result: Happyhorse11ImageToVideoResponse$1;
    };
    'happyhorse/v1.5/reference-to-video': {
        params: Happyhorse11ReferenceToVideoCommand$1;
        result: Happyhorse11ReferenceToVideoResponse$1;
    };
    'pcp/v1/sod': {
        params: SodV1Command;
        result: SodV1Response;
    };
    'pcp/v2/sod': {
        params: SodV2Command;
        result: SodV2Response;
    };
    'flux/v1/vto': {
        params: FluxVtoCommand;
        result: FluxVtoResult;
    };
    'happyhorse/v1.1/text-to-video': {
        params: Happyhorse11TextToVideoCommand;
        result: Happyhorse11TextToVideoResponse;
    };
    'happyhorse/v1.1/image-to-video': {
        params: Happyhorse11ImageToVideoCommand;
        result: Happyhorse11ImageToVideoResponse;
    };
    'happyhorse/v1.1/reference-to-video': {
        params: Happyhorse11ReferenceToVideoCommand;
        result: Happyhorse11ReferenceToVideoResponse;
    };
    'pcp/v1/qwen-image-edit-angle': {
        params: QwenImageEditAngleCommand;
        result: QwenImageEditAngleResponse;
    };
    'pcp/v1/lama-inpainting': {
        params: LamaInpaintingCommand;
        result: LamaInpaintingResponse;
    };
    'pcp/v1/segment-anything': {
        params: SegmentAnythingCommand;
        result: SegmentAnythingResponse;
    };
    'pcp/v1/segment-anything-sam3': {
        params: SegmentAnythingSam3Command;
        result: SegmentAnythingSam3Response;
    };
    'elevenlabs/v1/music-generation': {
        params: MusicGenerationCommand;
        result: MusicGenerationResponse;
    };
    'pcp/v1/effects': {
        params: EffectsCommand;
        result: EffectsResponse;
    };
    'flux-inpainter/v1/pcp': {
        params: FluxInpainterV1Command;
        result: EmptyModel;
    };
    'pcp/v1/image-captioning': {
        params: ImageCaptioningCommand;
        result: ImageCaptioningResponse;
    };
    'pcp/v1/qwen-haircuts': {
        params: QwenHaircutsCommand;
        result: QwenHaircutsResponse;
    };
    'pcp/v1/avatar': {
        params: AvatarGenerationCommand;
        result: AvatarGenerationResponse;
    };
}

export type { WorkflowTypes };

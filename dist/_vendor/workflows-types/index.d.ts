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
    mediaProcessing?: MediaProcessing$2;
}
interface GeminiPartFileData$2 {
    mimeType?: string;
    fileUri: string;
}
interface PartInlineData$3 {
    mimeType?: string;
    data?: string;
}
type MediaProcessing$2 = "MEDIA_PROCESSING_UNSPECIFIED" | "STATIC" | "AGENTIC";
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
type PrebuiltVoiceName$3 = "Puck" | "Kore" | "Charon" | "Fenrir" | "Aoede" | "Leda" | "Zephyr" | "Orus" | "Autonoe" | "Callirrhoe" | "Despina" | "Erinome" | "Gacrux" | "Laomedeia" | "Pulcherrima" | "Sulafat" | "Vindemiatrix" | "Achernar" | "Achird" | "Algenib" | "Algieba" | "Alnilam" | "Enceladus" | "Iapetus" | "Rasalgethi" | "Sadachbia" | "Sadaltager" | "Schedar" | "Umbriel" | "Zubenelgenubi";
interface MultiSpeakerVoiceConfig$2 {
    speakerVoiceConfigs: SpeakerVoiceConfig$2[];
}
interface SpeakerVoiceConfig$2 {
    speaker: string;
    voiceConfig: VoiceConfig$2;
}
type GeminiModel$1 = "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-2.5-flash-image-preview" | "gemini-2.5-flash-image" | "gemini-2.5-flash-lite-preview-06-17" | "gemini-2.0-flash" | "gemini-2.0-flash-preview-image-generation" | "gemini-2.0-flash-lite" | "gemini-1.5-flash" | "gemini-1.5-flash-8b" | "gemini-1.5-pro" | "gemini-embedding-exp" | "gemini-3-pro" | "gemini-3-pro-preview" | "gemini-3.1-pro-preview" | "gemini-3.1-flash-lite" | "gemini-3.5-flash-lite" | "gemini-3.6-flash" | "gemini-3.7-flash" | "gemini-3.1-flash-lite-preview" | "gemini-3-pro-image" | "gemini-3-pro-image-preview" | "gemini-3.1-flash-image-preview" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image" | "gemini-2.5-flash-tts" | "gemini-2.5-pro-tts" | "instant-ramen";
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
    model: "gpt-5" | "gpt-5-search-api" | "gpt-5.1" | "gpt-5.1-chat-latest" | "gpt-5.2" | "gpt-5.2-pro" | "gpt-5.3-codex" | "gpt-5.4" | "gpt-5.4-pro" | "gpt-5.4-mini" | "gpt-5.4-nano" | "gpt-5.5" | "gpt-5.5-pro" | "gpt-5.6-sol" | "gpt-5.6-terra" | "gpt-5.6-luna" | "gpt-5-pro" | "gpt-5-mini" | "gpt-5-nano" | "gpt-4o" | "gpt-4o-mini" | "gpt-4.1" | "gpt-4.1-mini" | "gpt-4.1-nano" | "gpt-4o-search-preview" | "gpt-o3" | "gpt-o3-mini" | "claude-sonnet-4-0" | "claude-opus-4-0" | "claude-3-7-sonnet-latest" | "claude-3-5-sonnet-latest" | "claude-sonnet-4-5" | "claude-sonnet-4-5-latest" | "claude-sonnet-4-6" | "claude-sonnet-5" | "claude-opus-4-8" | "claude-3-5-haiku-latest" | "claude-haiku-4-5" | "claude-fable-5" | "gemini-3-pro-preview" | "gemini-3.1-pro-preview" | "gemini-3.8-flash" | "gemini-3.7-flash" | "gemini-3.6-flash" | "gemini-3.5-flash" | "gemini-3.5-flash-lite" | "gemini-3.1-flash-lite" | "gemini-2.0-flash-001" | "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-2.0-flash-lite";
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
    model: "gpt-5" | "gpt-5-search-api" | "gpt-5.1" | "gpt-5.1-chat-latest" | "gpt-5.2" | "gpt-5.2-pro" | "gpt-5.3-codex" | "gpt-5.4" | "gpt-5.4-pro" | "gpt-5.4-mini" | "gpt-5.4-nano" | "gpt-5.5" | "gpt-5.5-pro" | "gpt-5.6-sol" | "gpt-5.6-terra" | "gpt-5.6-luna" | "gpt-5-pro" | "gpt-5-mini" | "gpt-5-nano" | "gpt-4o" | "gpt-4o-mini" | "gpt-4.1" | "gpt-4.1-mini" | "gpt-4.1-nano" | "gpt-4o-search-preview" | "gpt-o3" | "gpt-o3-mini" | "claude-sonnet-4-0" | "claude-opus-4-0" | "claude-3-7-sonnet-latest" | "claude-3-5-sonnet-latest" | "claude-sonnet-4-5" | "claude-sonnet-4-5-latest" | "claude-sonnet-4-6" | "claude-sonnet-5" | "claude-opus-4-8" | "claude-3-5-haiku-latest" | "claude-haiku-4-5" | "claude-fable-5" | "gemini-3-pro-preview" | "gemini-3.1-pro-preview" | "gemini-3.8-flash" | "gemini-3.7-flash" | "gemini-3.6-flash" | "gemini-3.5-flash" | "gemini-3.5-flash-lite" | "gemini-3.1-flash-lite" | "gemini-2.0-flash-001" | "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-2.0-flash-lite";
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
    options?: GenAIOptions$2B;
}
interface GenAIOptions$2B {
    safety_checks?: SafetyChecksOptions$2B;
    drive?: DriveOptions$2B;
}
interface SafetyChecksOptions$2B {
    enabled?: boolean;
}
interface DriveOptions$2B {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2B;
}
interface DriveFolderOptions$2B {
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
    mediaProcessing?: MediaProcessing$1;
}
interface GeminiPartFileData$1 {
    mimeType?: string;
    fileUri: string;
}
interface PartInlineData$2 {
    mimeType?: string;
    data?: string;
}
type MediaProcessing$1 = "MEDIA_PROCESSING_UNSPECIFIED" | "STATIC" | "AGENTIC";
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
type PrebuiltVoiceName$2 = "Puck" | "Kore" | "Charon" | "Fenrir" | "Aoede" | "Leda" | "Zephyr" | "Orus" | "Autonoe" | "Callirrhoe" | "Despina" | "Erinome" | "Gacrux" | "Laomedeia" | "Pulcherrima" | "Sulafat" | "Vindemiatrix" | "Achernar" | "Achird" | "Algenib" | "Algieba" | "Alnilam" | "Enceladus" | "Iapetus" | "Rasalgethi" | "Sadachbia" | "Sadaltager" | "Schedar" | "Umbriel" | "Zubenelgenubi";
interface MultiSpeakerVoiceConfig$1 {
    speakerVoiceConfigs: SpeakerVoiceConfig$1[];
}
interface SpeakerVoiceConfig$1 {
    speaker: string;
    voiceConfig: VoiceConfig$1;
}
type GeminiModel = "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-2.5-flash-image-preview" | "gemini-2.5-flash-image" | "gemini-2.5-flash-lite-preview-06-17" | "gemini-2.0-flash" | "gemini-2.0-flash-preview-image-generation" | "gemini-2.0-flash-lite" | "gemini-1.5-flash" | "gemini-1.5-flash-8b" | "gemini-1.5-pro" | "gemini-embedding-exp" | "gemini-3-pro" | "gemini-3-pro-preview" | "gemini-3.1-pro-preview" | "gemini-3.1-flash-lite" | "gemini-3.5-flash-lite" | "gemini-3.6-flash" | "gemini-3.7-flash" | "gemini-3.1-flash-lite-preview" | "gemini-3-pro-image" | "gemini-3-pro-image-preview" | "gemini-3.1-flash-image-preview" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image" | "gemini-2.5-flash-tts" | "gemini-2.5-pro-tts" | "instant-ramen";
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
    options?: GenAIOptions$2A;
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
    mediaProcessing?: MediaProcessing;
}
interface GeminiPartFileData {
    mimeType?: string;
    fileUri: string;
}
interface PartInlineData$1 {
    mimeType?: string;
    data?: string;
}
type MediaProcessing = "MEDIA_PROCESSING_UNSPECIFIED" | "STATIC" | "AGENTIC";
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
type PrebuiltVoiceName$1 = "Puck" | "Kore" | "Charon" | "Fenrir" | "Aoede" | "Leda" | "Zephyr" | "Orus" | "Autonoe" | "Callirrhoe" | "Despina" | "Erinome" | "Gacrux" | "Laomedeia" | "Pulcherrima" | "Sulafat" | "Vindemiatrix" | "Achernar" | "Achird" | "Algenib" | "Algieba" | "Alnilam" | "Enceladus" | "Iapetus" | "Rasalgethi" | "Sadachbia" | "Sadaltager" | "Schedar" | "Umbriel" | "Zubenelgenubi";
interface MultiSpeakerVoiceConfig {
    speakerVoiceConfigs: SpeakerVoiceConfig[];
}
interface SpeakerVoiceConfig {
    speaker: string;
    voiceConfig: VoiceConfig;
}
type GeminiV1ImageModel = "gemini-2.5-flash-image" | "gemini-3-pro-image" | "gemini-3-pro-image-preview" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image" | "gemini-3.1-flash-image-preview" | "gemini-2.5-flash-image-preview" | "instant-ramen";
interface GenAIOptions$2A {
    safety_checks?: SafetyChecksOptions$2A;
    drive?: DriveOptions$2A;
}
interface SafetyChecksOptions$2A {
    enabled?: boolean;
}
interface DriveOptions$2A {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2A;
}
interface DriveFolderOptions$2A {
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
    options?: GenAIOptions$2z;
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
interface GenAIOptions$2z {
    safety_checks?: SafetyChecksOptions$2z;
    drive?: DriveOptions$2z;
}
interface SafetyChecksOptions$2z {
    enabled?: boolean;
}
interface DriveOptions$2z {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2z;
}
interface DriveFolderOptions$2z {
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
    options?: GenAIOptions$2y;
}
interface SoraCharacterReference$1 {
    id: string;
}
interface GenAIOptions$2y {
    safety_checks?: SafetyChecksOptions$2y;
    drive?: DriveOptions$2y;
}
interface SafetyChecksOptions$2y {
    enabled?: boolean;
}
interface DriveOptions$2y {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2y;
}
interface DriveFolderOptions$2y {
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
    options?: GenAIOptions$2x;
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
interface GenAIOptions$2x {
    safety_checks?: SafetyChecksOptions$2x;
    drive?: DriveOptions$2x;
}
interface SafetyChecksOptions$2x {
    enabled?: boolean;
}
interface DriveOptions$2x {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2x;
}
interface DriveFolderOptions$2x {
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
    options?: GenAIOptions$2w;
}
interface GenAIOptions$2w {
    safety_checks?: SafetyChecksOptions$2w;
    drive?: DriveOptions$2w;
}
interface SafetyChecksOptions$2w {
    enabled?: boolean;
}
interface DriveOptions$2w {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2w;
}
interface DriveFolderOptions$2w {
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
    resolution?: "480p" | "720p" | "1080p";
    image_url: string;
    duration?: "5" | "10";
    audio_url?: string | unknown;
    prompt: string;
    enable_prompt_expansion?: boolean;
    seed?: number | unknown;
    negative_prompt?: string | unknown;
    enable_safety_checker?: boolean;
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
    actual_prompt?: string | unknown;
    seed: number;
    video: {
        duration?: number | unknown;
        fps?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
        width?: number | unknown;
        num_frames?: number | unknown;
        file_size?: number | unknown;
        height?: number | unknown;
    };
}

interface TextToVideoInput {
    resolution?: "480p" | "720p" | "1080p";
    duration?: "5" | "10";
    audio_url?: string | unknown;
    prompt: string;
    seed?: number | unknown;
    enable_prompt_expansion?: boolean;
    negative_prompt?: string | unknown;
    enable_safety_checker?: boolean;
    aspect_ratio?: "16:9" | "9:16" | "1:1";
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
    actual_prompt?: string | unknown;
    seed: number;
    video: {
        duration?: number | unknown;
        fps?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
        width?: number | unknown;
        num_frames?: number | unknown;
        file_size?: number | unknown;
        height?: number | unknown;
    };
}

interface BaseQwenImageInput {
    seed?: number | unknown;
    prompt: string;
    loras?: {
        scale?: number;
        path: string;
    }[];
    num_inference_steps?: number;
    sync_mode?: boolean;
    acceleration?: "none" | "regular" | "high";
    enable_safety_checker?: boolean;
    output_format?: "jpeg" | "png";
    guidance_scale?: number;
    image_size?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
    negative_prompt?: string;
    use_turbo?: boolean;
    num_images?: number;
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
    result: QwenImageOutput;
}
interface QwenImageOutput {
    prompt: string;
    timings: Record<string, number>;
    images: ({
        content_type?: string | unknown;
        url: string;
        height: number;
        width: number;
    })[];
    has_nsfw_concepts: boolean[];
    seed: number;
}

interface QwenImageI2IInput {
    loras?: {
        scale?: number;
        path: string;
    }[];
    enable_safety_checker?: boolean;
    acceleration?: "none" | "regular" | "high";
    negative_prompt?: string;
    output_format?: "jpeg" | "png";
    guidance_scale?: number;
    image_size?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" | unknown;
    seed?: number | unknown;
    prompt: string;
    strength?: number;
    image_url: string;
    num_inference_steps?: number;
    sync_mode?: boolean;
    use_turbo?: boolean;
    num_images?: number;
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
    timings: Record<string, number>;
    images: ({
        content_type?: string | unknown;
        url: string;
        height: number;
        width: number;
    })[];
    has_nsfw_concepts: boolean[];
    seed: number;
}

interface HunyuanTextToImageInputV3 {
    seed?: number | unknown;
    sync_mode?: boolean;
    image_size?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
    enable_safety_checker?: boolean;
    num_inference_steps?: number;
    negative_prompt?: string;
    guidance_scale?: number;
    enable_prompt_expansion?: boolean;
    prompt: string;
    output_format?: "jpeg" | "png";
    num_images?: number;
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
        url: string;
        content_type?: string | unknown;
        file_name?: string | unknown;
        height?: number | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
    })[];
}

interface LTXV20ImageToVideoRequest {
    resolution?: "1080p" | "1440p" | "2160p";
    image_url: string;
    duration?: 6 | 8 | 10;
    fps?: 25 | 50;
    generate_audio?: boolean;
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
interface Ltxv2ImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXVImageToVideoResponse$1;
}
interface LTXVImageToVideoResponse$1 {
    video: {
        duration?: number | unknown;
        num_frames?: number | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
        url: string;
        width?: number | unknown;
        height?: number | unknown;
        fps?: number | unknown;
        content_type?: string | unknown;
    };
}

interface LTXV20TextToVideoRequest {
    resolution?: "1080p" | "1440p" | "2160p";
    duration?: 6 | 8 | 10;
    fps?: 25 | 50;
    generate_audio?: boolean;
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
interface Ltxv2TextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXVTextToVideoResponse$1;
}
interface LTXVTextToVideoResponse$1 {
    video: {
        duration?: number | unknown;
        num_frames?: number | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
        url: string;
        width?: number | unknown;
        height?: number | unknown;
        fps?: number | unknown;
        content_type?: string | unknown;
    };
}

interface LTXV20ImageToVideoFastRequest {
    resolution?: "1080p" | "1440p" | "2160p";
    image_url: string;
    duration?: 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20;
    fps?: 25 | 50;
    generate_audio?: boolean;
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
interface Ltxv2ImageToVideoFastResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXVImageToVideoResponse;
}
interface LTXVImageToVideoResponse {
    video: {
        duration?: number | unknown;
        num_frames?: number | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
        url: string;
        width?: number | unknown;
        height?: number | unknown;
        fps?: number | unknown;
        content_type?: string | unknown;
    };
}

interface LTXV20TextToVideoFastRequest {
    resolution?: "1080p" | "1440p" | "2160p";
    duration?: 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20;
    fps?: 25 | 50;
    generate_audio?: boolean;
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
interface Ltxv2TextToVideoFastResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXVTextToVideoResponse;
}
interface LTXVTextToVideoResponse {
    video: {
        duration?: number | unknown;
        num_frames?: number | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
        url: string;
        width?: number | unknown;
        height?: number | unknown;
        fps?: number | unknown;
        content_type?: string | unknown;
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
    enhancement_tier?: "fast" | "standard" | "pro";
    target_fps?: number;
    video_url: string;
    target_resolution?: "1080p" | "2k" | "4k" | "6k" | "8k";
    scale_ratio?: number | unknown;
    bit_depth?: 8 | 10 | 12;
    enhancement_preset?: "general" | "ugc" | "short_series" | "aigc" | "old_film";
    fidelity?: "high" | "medium";
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
        url: string;
        file_name?: string | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
    };
}

interface TextToSpeechRequestV3 {
    apply_text_normalization?: "auto" | "on" | "off";
    timestamps?: boolean;
    text: string;
    language_code?: string | unknown;
    stability?: number;
    voice?: string;
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
        url: string;
        content_type?: string | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
    };
    timestamps?: unknown[] | unknown;
}

interface OviT2VRequest {
    resolution?: "512x992" | "992x512" | "960x512" | "512x960" | "720x720" | "448x1120" | "1120x448";
    seed?: number | unknown;
    prompt: string;
    negative_prompt?: string;
    audio_negative_prompt?: string;
    num_inference_steps?: number;
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
    seed: number;
    video?: {
        url: string;
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
    } | unknown;
}

interface OviI2VRequest {
    negative_prompt?: string;
    seed?: number | unknown;
    prompt: string;
    image_url: string;
    audio_negative_prompt?: string;
    num_inference_steps?: number;
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
    seed: number;
    video?: {
        url: string;
        file_size?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
    } | unknown;
}

interface ReveCreateInput {
    num_images?: number;
    sync_mode?: boolean;
    aspect_ratio?: "16:9" | "9:16" | "3:2" | "2:3" | "4:3" | "3:4" | "1:1";
    prompt: string;
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
interface ReveTextToImageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ReveCreateOutput;
}
interface ReveCreateOutput {
    images: ({
        file_name?: string | unknown;
        content_type?: string | unknown;
        height?: number | unknown;
        url: string;
        file_size?: number | unknown;
        width?: number | unknown;
    })[];
}

interface ReveEditInput {
    num_images?: number;
    sync_mode?: boolean;
    image_url: string;
    prompt: string;
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
        file_name?: string | unknown;
        content_type?: string | unknown;
        height?: number | unknown;
        url: string;
        file_size?: number | unknown;
        width?: number | unknown;
    })[];
}

interface MergeVideosInput {
    resolution?: {
        width?: number;
        height?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" | unknown;
    resolution_aspect_ratio_video_index?: number | unknown;
    target_fps?: number | unknown;
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
interface FfmpegApiMergeVideosResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MergeVideosOutput;
}
interface MergeVideosOutput {
    metadata: Record<string, unknown>;
    video: {
        file_name?: string | unknown;
        content_type?: string | unknown;
        url: string;
        file_size?: number | unknown;
    };
}

interface CombineInput {
    start_offset?: number;
    video_url: string;
    audio_url: string;
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
        file_name?: string | unknown;
        content_type?: string | unknown;
        url: string;
        file_size?: number | unknown;
    };
}

interface SoundEffectRequestV2 {
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "pcm_8000" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000" | "ulaw_8000" | "alaw_8000" | "opus_48000_32" | "opus_48000_64" | "opus_48000_96" | "opus_48000_128" | "opus_48000_192";
    duration_seconds?: number | unknown;
    text: string;
    prompt_influence?: number;
    loop?: boolean;
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
        url: string;
        content_type?: string | unknown;
        file_name?: string | unknown;
        file_size?: number | unknown;
    };
}

interface LTXRetakeVideoRequest {
    prompt: string;
    retake_mode?: "replace_audio" | "replace_video" | "replace_audio_and_video";
    duration?: number;
    start_time?: number;
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
interface Ltx2RetakeVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: LTXRetakeVideoResponse;
}
interface LTXRetakeVideoResponse {
    video: {
        fps?: number | unknown;
        url: string;
        file_name?: string | unknown;
        duration?: number | unknown;
        height?: number | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        num_frames?: number | unknown;
    };
}

interface FrameInput {
    video_url: string;
    frame_type?: "first" | "middle" | "last";
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
        file_name?: string | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        url: string;
        width?: number | unknown;
        height?: number | unknown;
    })[];
}

interface AuroraInputModel {
    image_url: string;
    audio_url: string;
    audio_guidance_scale?: number | unknown;
    guidance_scale?: number | unknown;
    resolution?: "480p" | "720p";
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
interface CreatifyAuroraResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AuroraOutputModel;
}
interface AuroraOutputModel {
    video: {
        width?: number | unknown;
        duration?: number | unknown;
        file_size?: number | unknown;
        num_frames?: number | unknown;
        content_type?: string | unknown;
        url: string;
        fps?: number | unknown;
        height?: number | unknown;
        file_name?: string | unknown;
    };
}

interface VideoUpscaleRequest {
    noise?: number | unknown;
    target_fps?: number | unknown;
    upscale_factor?: number;
    model?: "Proteus" | "Artemis HQ" | "Artemis MQ" | "Artemis LQ" | "Gaia HQ" | "Gaia CG" | "Gaia 2" | "Nyx" | "Nyx Fast" | "Nyx XL" | "Nyx HF" | "Starlight Precise 2.5" | "Starlight HQ" | "Starlight Mini" | "Starlight Sharp" | "Starlight Fast 2" | "Starlight Precise 1" | "Starlight Precise 2" | "Starlight Fast 1";
    halo?: number | unknown;
    compression?: number | unknown;
    grain?: number | unknown;
    recover_detail?: number | unknown;
    video_url: string;
    H264_output?: boolean;
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
        url: string;
        file_size?: number | unknown;
        file_name?: string | unknown;
        content_type?: string | unknown;
    };
}

interface ImageUpscaleRequest {
    fix_compression?: number | unknown;
    detail?: number | unknown;
    output_format?: "jpeg" | "png";
    face_enhancement_creativity?: number;
    autoprompt?: boolean | unknown;
    face_enhancement?: boolean;
    denoise?: number | unknown;
    texture?: number | unknown;
    prompt?: string | unknown;
    upscale_factor?: number;
    model?: "Standard V2" | "High Fidelity V2" | "Low Resolution V2" | "CGI" | "Text Refine" | "Wonder 3" | "Wonder" | "Standard MAX" | "Redefine" | "Recovery V2" | "Recovery";
    face_enhancement_strength?: number;
    image_url: string;
    crop_to_fill?: boolean;
    enhancement_strength?: "low" | "medium" | "high" | unknown;
    sharpen?: number | unknown;
    creativity?: number | unknown;
    strength?: number | unknown;
    subject_detection?: "All" | "Foreground" | "Background";
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
        url: string;
        file_size?: number | unknown;
        file_name?: string | unknown;
        content_type?: string | unknown;
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
    enable_safety_checker?: boolean;
    image_url: string;
    enable_prompt_expansion?: boolean;
    audio_url?: string | unknown;
    seed?: number | unknown;
    duration?: "5" | "10" | "15";
    multi_shots?: boolean;
    resolution?: "720p" | "1080p";
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
    seed: number;
    actual_prompt?: string | unknown;
    video: {
        file_size?: number | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        file_name?: string | unknown;
        width?: number | unknown;
        duration?: number | unknown;
        url: string;
        height?: number | unknown;
        content_type?: string | unknown;
    };
}

interface ReferenceToVideoInput {
    multi_shots?: boolean;
    aspect_ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    prompt: string;
    duration?: "5" | "10";
    enable_safety_checker?: boolean;
    seed?: number | unknown;
    resolution?: "720p" | "1080p";
    video_urls: string[];
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
interface WanV26ReferenceToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ReferenceToVideoOutput;
}
interface ReferenceToVideoOutput {
    video: {
        file_size?: number | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        file_name?: string | unknown;
        width?: number | unknown;
        duration?: number | unknown;
        url: string;
        height?: number | unknown;
        content_type?: string | unknown;
    };
    actual_prompt?: string | unknown;
    seed: number;
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
    noise_scale?: number;
    target_resolution?: "720p" | "1080p" | "1440p" | "2160p";
    upscale_mode?: "target" | "factor";
    upscale_factor?: number;
    output_format?: "png" | "jpg" | "webp";
    image_url: string;
    seed?: number | unknown;
    sync_mode?: boolean;
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
    image: {
        height?: number | unknown;
        url: string;
        content_type?: string | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        file_name?: string | unknown;
    };
    seed: number;
}

interface XAIImageInput {
    output_format?: "jpeg" | "png" | "webp";
    num_images?: number;
    aspect_ratio?: "2:1" | "20:9" | "19.5:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:19.5" | "9:20" | "1:2";
    prompt: string;
    resolution?: "1k" | "2k";
    sync_mode?: boolean;
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
    images: ({
        content_type?: string | unknown;
        height?: number | unknown;
        width?: number | unknown;
        file_size?: number | unknown;
        file_name?: string | unknown;
        url: string;
    })[];
    revised_prompt?: string | unknown;
}

interface XAIImageEditInput {
    image_urls?: string[];
    output_format?: "jpeg" | "png" | "webp";
    num_images?: number;
    aspect_ratio?: "auto" | "2:1" | "20:9" | "19.5:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:19.5" | "9:20" | "1:2";
    prompt: string;
    resolution?: "1k" | "2k";
    sync_mode?: boolean;
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
    images: ({
        content_type?: string | unknown;
        height?: number | unknown;
        width?: number | unknown;
        file_size?: number | unknown;
        file_name?: string | unknown;
        url: string;
    })[];
    revised_prompt?: string | unknown;
}

interface XAITextToVideoInput {
    resolution?: "480p" | "720p";
    duration?: number;
    prompt: string;
    aspect_ratio?: "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16";
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
        num_frames?: number | unknown;
        fps?: number | unknown;
        file_name?: string | unknown;
        url: string;
        content_type?: string | unknown;
        height?: number | unknown;
        file_size?: number | unknown;
        duration?: number | unknown;
    };
}

interface XAIImageToVideoInput {
    image_url: string;
    resolution?: "480p" | "720p";
    duration?: number;
    prompt: string;
    aspect_ratio?: "auto" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | unknown;
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
        num_frames?: number | unknown;
        fps?: number | unknown;
        file_name?: string | unknown;
        url: string;
        content_type?: string | unknown;
        height?: number | unknown;
        file_size?: number | unknown;
        duration?: number | unknown;
    };
}

interface XAIVideoEditInput {
    resolution?: "auto" | "480p" | "720p";
    prompt: string;
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
interface XaiGrokImagineVideoEditVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAIVideoEditOutput;
}
interface XAIVideoEditOutput {
    video: {
        width?: number | unknown;
        num_frames?: number | unknown;
        fps?: number | unknown;
        file_name?: string | unknown;
        url: string;
        content_type?: string | unknown;
        height?: number | unknown;
        file_size?: number | unknown;
        duration?: number | unknown;
    };
}

interface TrimVideoInput {
    start_time?: number;
    video_url: string;
    duration?: number | unknown;
    end_time?: number | unknown;
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
    original_duration: number;
    trimmed_duration: number;
    video: {
        file_name?: string | unknown;
        content_type?: string | unknown;
        url: string;
        file_size?: number | unknown;
    };
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
    original_image_size?: number[] | unknown;
    negative_prompt?: string;
    canvas_size: number[];
    sync_mode?: boolean;
    prompt?: string;
    aspect_ratio?: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | unknown;
    original_image_location?: number[] | unknown;
    image_url: string;
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
interface BriaExpandResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ImageExpansionOutput;
}
interface ImageExpansionOutput {
    image: {
        url: string;
        width?: number | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        height?: number | unknown;
        file_name?: string | unknown;
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
    options?: GenAIOptions$2v;
    thinkingConfig?: ThinkingConfig$1;
}
type AspectRatio$1 = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9" | "1:4" | "4:1" | "1:8" | "8:1";
type ImageResolution$1 = "0.5K" | "1K" | "2K" | "4K";
type GeminiV2ImageModel = "gemini-2.5-flash-image" | "gemini-3-pro-image" | "gemini-3-pro-image-preview" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image" | "gemini-3.1-flash-image-preview" | "instant-ramen";
interface GenAIOptions$2v {
    safety_checks?: SafetyChecksOptions$2v;
    drive?: DriveOptions$2v;
}
interface SafetyChecksOptions$2v {
    enabled?: boolean;
}
interface DriveOptions$2v {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2v;
}
interface DriveFolderOptions$2v {
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
    model: "recraftv2" | "recraftv2_vector" | "recraftv3" | "recraftv3_vector" | "recraftv4" | "recraftv4_vector" | "recraftv4_pro" | "recraftv4_pro_vector" | "recraftv4_styles" | "recraftv4_styles_vector" | "recraftv4_styles_pro" | "recraftv4_styles_pro_vector" | "recraftv4_1" | "recraftv4_1_vector" | "recraftv4_1_pro" | "recraftv4_1_pro_vector" | "recraftv4_1_utility" | "recraftv4_1_utility_vector" | "recraftv4_1_utility_pro" | "recraftv4_1_utility_pro_vector";
    style?: string;
    style_id?: string;
    style_reference_urls?: string[];
    substyle?: string;
    negative_prompt?: string;
    size?: string;
    image_format?: "webp" | "png";
    controls?: UserControls;
    options?: GenAIOptions$2u;
}
interface UserControls {
    artistic_level?: number;
    background_color?: string;
    colors?: string[];
    no_text?: boolean;
}
interface GenAIOptions$2u {
    safety_checks?: SafetyChecksOptions$2u;
    drive?: DriveOptions$2u;
}
interface SafetyChecksOptions$2u {
    enabled?: boolean;
}
interface DriveOptions$2u {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2u;
}
interface DriveFolderOptions$2u {
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
    options?: GenAIOptions$2t;
}
interface GenAIOptions$2t {
    safety_checks?: SafetyChecksOptions$2t;
    drive?: DriveOptions$2t;
}
interface SafetyChecksOptions$2t {
    enabled?: boolean;
}
interface DriveOptions$2t {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2t;
}
interface DriveFolderOptions$2t {
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
    options?: GenAIOptions$2s;
}
interface GenAIOptions$2s {
    safety_checks?: SafetyChecksOptions$2s;
    drive?: DriveOptions$2s;
}
interface SafetyChecksOptions$2s {
    enabled?: boolean;
}
interface DriveOptions$2s {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2s;
}
interface DriveFolderOptions$2s {
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
    options?: GenAIOptions$2r;
}
interface GenAIOptions$2r {
    safety_checks?: SafetyChecksOptions$2r;
    drive?: DriveOptions$2r;
}
interface SafetyChecksOptions$2r {
    enabled?: boolean;
}
interface DriveOptions$2r {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2r;
}
interface DriveFolderOptions$2r {
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
    options?: GenAIOptions$2q;
}
interface GenAIOptions$2q {
    safety_checks?: SafetyChecksOptions$2q;
    drive?: DriveOptions$2q;
}
interface SafetyChecksOptions$2q {
    enabled?: boolean;
}
interface DriveOptions$2q {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2q;
}
interface DriveFolderOptions$2q {
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
    options?: GenAIOptions$2p;
}
interface GenAIOptions$2p {
    safety_checks?: SafetyChecksOptions$2p;
    drive?: DriveOptions$2p;
}
interface SafetyChecksOptions$2p {
    enabled?: boolean;
}
interface DriveOptions$2p {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2p;
}
interface DriveFolderOptions$2p {
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
    options?: GenAIOptions$2o;
}
type KlingModels$1 = "kling-v2-5-turbo" | "kling-v2-6" | "kling-v3" | "kling-v3-turbo";
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
interface GenAIOptions$2o {
    safety_checks?: SafetyChecksOptions$2o;
    drive?: DriveOptions$2o;
}
interface SafetyChecksOptions$2o {
    enabled?: boolean;
}
interface DriveOptions$2o {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2o;
}
interface DriveFolderOptions$2o {
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
    options?: GenAIOptions$2n;
    image?: string;
    image_tail?: string;
    element_list?: I2VElementItem[];
}
type KlingModels = "kling-v2-5-turbo" | "kling-v2-6" | "kling-v3" | "kling-v3-turbo";
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
interface GenAIOptions$2n {
    safety_checks?: SafetyChecksOptions$2n;
    drive?: DriveOptions$2n;
}
interface SafetyChecksOptions$2n {
    enabled?: boolean;
}
interface DriveOptions$2n {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2n;
}
interface DriveFolderOptions$2n {
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
    options?: GenAIOptions$2m;
}
interface GenAIOptions$2m {
    safety_checks?: SafetyChecksOptions$2m;
    drive?: DriveOptions$2m;
}
interface SafetyChecksOptions$2m {
    enabled?: boolean;
}
interface DriveOptions$2m {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2m;
}
interface DriveFolderOptions$2m {
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
    video_url?: string;
    video_id?: string;
    sound_effect_prompt?: string;
    bgm_prompt?: string;
    asmr_mode?: boolean;
    options?: GenAIOptions$2l;
}
interface GenAIOptions$2l {
    safety_checks?: SafetyChecksOptions$2l;
    drive?: DriveOptions$2l;
}
interface SafetyChecksOptions$2l {
    enabled?: boolean;
}
interface DriveOptions$2l {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2l;
}
interface DriveFolderOptions$2l {
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
    options?: GenAIOptions$2k;
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
    refer_type?: KlingOmniReferType;
    keep_original_sound?: KlingKeepOriginalSound$1;
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
interface GenAIOptions$2k {
    safety_checks?: SafetyChecksOptions$2k;
    drive?: DriveOptions$2k;
}
interface SafetyChecksOptions$2k {
    enabled?: boolean;
}
interface DriveOptions$2k {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2k;
}
interface DriveFolderOptions$2k {
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
    options?: GenAIOptions$2j;
}
type KlingAvatarMode = "std" | "pro";
interface GenAIOptions$2j {
    safety_checks?: SafetyChecksOptions$2j;
    drive?: DriveOptions$2j;
}
interface SafetyChecksOptions$2j {
    enabled?: boolean;
}
interface DriveOptions$2j {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2j;
}
interface DriveFolderOptions$2j {
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
    options?: GenAIOptions$2i;
}
type KlingCharacterOrientation = "image" | "video";
type KlingKeepOriginalSound = "yes" | "no";
type KlingMotionControlMode = "std" | "pro";
interface GenAIOptions$2i {
    safety_checks?: SafetyChecksOptions$2i;
    drive?: DriveOptions$2i;
}
interface SafetyChecksOptions$2i {
    enabled?: boolean;
}
interface DriveOptions$2i {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2i;
}
interface DriveFolderOptions$2i {
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
    options?: GenAIOptions$2h;
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
interface GenAIOptions$2h {
    safety_checks?: SafetyChecksOptions$2h;
    drive?: DriveOptions$2h;
}
interface SafetyChecksOptions$2h {
    enabled?: boolean;
}
interface DriveOptions$2h {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2h;
}
interface DriveFolderOptions$2h {
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
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "mp3_48000_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    model_id?: "eleven_text_to_sound_v2";
    options?: GenAIOptions$2g;
}
interface GenAIOptions$2g {
    safety_checks?: SafetyChecksOptions$2g;
    drive?: DriveOptions$2g;
}
interface SafetyChecksOptions$2g {
    enabled?: boolean;
}
interface DriveOptions$2g {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2g;
}
interface DriveFolderOptions$2g {
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
    options?: GenAIOptions$2f;
    model: FluxKontextModel$1;
    imageUrls: string[];
}
interface GenAIOptions$2f {
    safety_checks?: SafetyChecksOptions$2f;
    drive?: DriveOptions$2f;
}
interface SafetyChecksOptions$2f {
    enabled?: boolean;
}
interface DriveOptions$2f {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2f;
}
interface DriveFolderOptions$2f {
    path?: string;
    id?: string;
}
type FluxKontextModel$1 = "flux-kontext-max" | "flux-kontext-pro";
interface FluxKontextResult {
    result: GeneratedImageResult$7;
}
interface GeneratedImageResult$7 {
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
    options?: GenAIOptions$2e;
    model: FluxV2Model$1;
    steps?: number;
    guidance?: number;
    imageUrls: string[];
    width?: number;
    height?: number;
    resolution?: FluxResolution$1;
}
interface GenAIOptions$2e {
    safety_checks?: SafetyChecksOptions$2e;
    drive?: DriveOptions$2e;
}
interface SafetyChecksOptions$2e {
    enabled?: boolean;
}
interface DriveOptions$2e {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2e;
}
interface DriveFolderOptions$2e {
    path?: string;
    id?: string;
}
type FluxV2Model$1 = "flux-2-flex" | "flux-2-pro" | "flux-2-pro-preview" | "flux-2-max";
type FluxResolution$1 = "1K" | "2K" | "4K";
interface FluxV2Result {
    result: GeneratedImageResult$6;
}
interface GeneratedImageResult$6 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface TextToSpeechCommand {
    voice_id: string;
    text: string;
    model_id?: "eleven_multilingual_v2" | "eleven_v3";
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "mp3_48000_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    voice_settings?: VoiceSettings$1;
    language_code?: string;
    seed?: number;
    options?: GenAIOptions$2d;
}
interface VoiceSettings$1 {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    speed?: number;
    use_speaker_boost?: boolean;
}
interface GenAIOptions$2d {
    safety_checks?: SafetyChecksOptions$2d;
    drive?: DriveOptions$2d;
}
interface SafetyChecksOptions$2d {
    enabled?: boolean;
}
interface DriveOptions$2d {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2d;
}
interface DriveFolderOptions$2d {
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
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "mp3_48000_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    voice_settings?: VoiceSettings;
    seed?: number;
    remove_background_noise?: boolean;
    options?: GenAIOptions$2c;
}
interface VoiceSettings {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    speed?: number;
}
interface GenAIOptions$2c {
    safety_checks?: SafetyChecksOptions$2c;
    drive?: DriveOptions$2c;
}
interface SafetyChecksOptions$2c {
    enabled?: boolean;
}
interface DriveOptions$2c {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2c;
}
interface DriveFolderOptions$2c {
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
    options?: GenAIOptions$2b;
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
interface GenAIOptions$2b {
    safety_checks?: SafetyChecksOptions$2b;
    drive?: DriveOptions$2b;
}
interface SafetyChecksOptions$2b {
    enabled?: boolean;
}
interface DriveOptions$2b {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2b;
}
interface DriveFolderOptions$2b {
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
    options?: GenAIOptions$2a;
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
interface GenAIOptions$2a {
    safety_checks?: SafetyChecksOptions$2a;
    drive?: DriveOptions$2a;
}
interface SafetyChecksOptions$2a {
    enabled?: boolean;
}
interface DriveOptions$2a {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$2a;
}
interface DriveFolderOptions$2a {
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
    options?: GenAIOptions$29;
}
interface GenAIOptions$29 {
    safety_checks?: SafetyChecksOptions$29;
    drive?: DriveOptions$29;
}
interface SafetyChecksOptions$29 {
    enabled?: boolean;
}
interface DriveOptions$29 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$29;
}
interface DriveFolderOptions$29 {
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
    options?: GenAIOptions$28;
}
interface GenAIOptions$28 {
    safety_checks?: SafetyChecksOptions$28;
    drive?: DriveOptions$28;
}
interface SafetyChecksOptions$28 {
    enabled?: boolean;
}
interface DriveOptions$28 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$28;
}
interface DriveFolderOptions$28 {
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
    options?: GenAIOptions$27;
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
interface GenAIOptions$27 {
    safety_checks?: SafetyChecksOptions$27;
    drive?: DriveOptions$27;
}
interface SafetyChecksOptions$27 {
    enabled?: boolean;
}
interface DriveOptions$27 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$27;
}
interface DriveFolderOptions$27 {
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
    options?: GenAIOptions$26;
}
type GeminiTtsModel = "gemini-2.5-flash-tts" | "gemini-2.5-pro-tts";
type PrebuiltVoiceName = "Puck" | "Kore" | "Charon" | "Fenrir" | "Aoede" | "Leda" | "Zephyr" | "Orus" | "Autonoe" | "Callirrhoe" | "Despina" | "Erinome" | "Gacrux" | "Laomedeia" | "Pulcherrima" | "Sulafat" | "Vindemiatrix" | "Achernar" | "Achird" | "Algenib" | "Algieba" | "Alnilam" | "Enceladus" | "Iapetus" | "Rasalgethi" | "Sadachbia" | "Sadaltager" | "Schedar" | "Umbriel" | "Zubenelgenubi";
interface SpeakerVoiceConfigDto {
    speaker: string;
    voiceName: PrebuiltVoiceName;
}
interface GenAIOptions$26 {
    safety_checks?: SafetyChecksOptions$26;
    drive?: DriveOptions$26;
}
interface SafetyChecksOptions$26 {
    enabled?: boolean;
}
interface DriveOptions$26 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$26;
}
interface DriveFolderOptions$26 {
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
    options?: GenAIOptions$25;
}
type LyriaModels = "lyria-002";
interface GenAIOptions$25 {
    safety_checks?: SafetyChecksOptions$25;
    drive?: DriveOptions$25;
}
interface SafetyChecksOptions$25 {
    enabled?: boolean;
}
interface DriveOptions$25 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$25;
}
interface DriveFolderOptions$25 {
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
    options?: GenAIOptions$24;
}
interface GenAIOptions$24 {
    safety_checks?: SafetyChecksOptions$24;
    drive?: DriveOptions$24;
}
interface SafetyChecksOptions$24 {
    enabled?: boolean;
}
interface DriveOptions$24 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$24;
}
interface DriveFolderOptions$24 {
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
    options?: GenAIOptions$23;
}
interface GenAIOptions$23 {
    safety_checks?: SafetyChecksOptions$23;
    drive?: DriveOptions$23;
}
interface SafetyChecksOptions$23 {
    enabled?: boolean;
}
interface DriveOptions$23 {
    name: string;
    attributes?: Record<string, unknown>;
    folder?: DriveFolderOptions$23;
}
interface DriveFolderOptions$23 {
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
    n?: number;
    aspect_ratio?: KlingImageAspectRatio$2;
    callback_url?: string;
    options?: GenAIOptions$22;
}
type KlingImageModels = "kling-v2-1" | "kling-v3";
type KlingImageAspectRatio$2 = "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
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
    options?: GenAIOptions$21;
}
type KlingOmniImageModels = "kling-image-o1" | "kling-v3-omni";
interface OmniImageReference {
    image_url: string;
}
type KlingImageAspectRatio$1 = "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
type KlingV3OmniResolution = "1k" | "2k" | "4k";
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
    model_name?: "kling-v2-1";
    prompt?: string;
    subject_image_list: SubjectImage[];
    scene_image?: string;
    style_image?: string;
    n?: number;
    aspect_ratio?: KlingImageAspectRatio;
    callback_url?: string;
    options?: GenAIOptions$20;
}
interface SubjectImage {
    subject_image: string;
}
type KlingImageAspectRatio = "16:9" | "9:16" | "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "3:4";
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
    options?: GenAIOptions$1$;
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
    generate_audio?: boolean;
    resolution?: "1080p" | "1440p" | "2160p";
    fps?: 24 | 25 | 48 | 50;
    prompt: string;
    aspect_ratio?: "16:9" | "9:16";
    duration?: 6 | 8 | 10;
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
        height?: number | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        duration?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
        num_frames?: number | unknown;
        fps?: number | unknown;
    };
}

interface LTXV23ImageToVideoRequest {
    resolution?: "1080p" | "1440p" | "2160p";
    image_url: string;
    aspect_ratio?: "auto" | "16:9" | "9:16";
    end_image_url?: string | unknown;
    duration?: 6 | 8 | 10;
    generate_audio?: boolean;
    prompt: string;
    fps?: 24 | 25 | 48 | 50;
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
        height?: number | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        duration?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
        num_frames?: number | unknown;
        fps?: number | unknown;
    };
}

interface LTXV23TextToVideoFastRequest {
    generate_audio?: boolean;
    resolution?: "1080p" | "1440p" | "2160p";
    fps?: 24 | 25 | 48 | 50;
    prompt: string;
    aspect_ratio?: "16:9" | "9:16";
    duration?: 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20;
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
        height?: number | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        duration?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
        num_frames?: number | unknown;
        fps?: number | unknown;
    };
}

interface LTXV23ImageToVideoFastRequest {
    resolution?: "1080p" | "1440p" | "2160p";
    image_url: string;
    aspect_ratio?: "auto" | "16:9" | "9:16";
    end_image_url?: string | unknown;
    duration?: 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20;
    generate_audio?: boolean;
    prompt: string;
    fps?: 24 | 25 | 48 | 50;
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
        height?: number | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        duration?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
        num_frames?: number | unknown;
        fps?: number | unknown;
    };
}

interface LTXV23AudioToVideoRequest {
    audio_url: string;
    image_url?: string | unknown;
    prompt?: string | unknown;
    aspect_ratio?: "auto" | "16:9" | "9:16";
    guidance_scale?: number | unknown;
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
        height?: number | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        duration?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
        num_frames?: number | unknown;
        fps?: number | unknown;
    };
}

interface LTXV23ExtendVideoRequest {
    context?: number | unknown;
    video_url: string;
    prompt?: string | unknown;
    mode?: "start" | "end";
    duration?: number;
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
        height?: number | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        duration?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
        num_frames?: number | unknown;
        fps?: number | unknown;
    };
}

interface LTXV23RetakeVideoRequest {
    retake_mode?: "replace_audio" | "replace_video" | "replace_audio_and_video";
    start_time?: number;
    video_url: string;
    prompt: string;
    duration?: number;
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
        height?: number | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        duration?: number | unknown;
        content_type?: string | unknown;
        file_name?: string | unknown;
        url: string;
        num_frames?: number | unknown;
        fps?: number | unknown;
    };
}

interface AudioIsolationCommand {
    audio_url: string;
    options?: GenAIOptions$1_;
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
    audio_url?: string;
    source_lang?: string;
    target_lang: string;
    source_url?: string;
    num_speakers?: number;
    watermark?: boolean;
    options?: GenAIOptions$1Z;
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
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "mp3_48000_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
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
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "mp3_48000_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    options?: GenAIOptions$1X;
}
interface ConversationItem {
    voice_id: string;
    text: string;
}
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
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "mp3_48000_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
    options?: GenAIOptions$1W;
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
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "mp3_48000_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
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
    ss_guidance_rescale?: number;
    uv_unwrap_angle_threshold_deg?: number;
    image_url: string;
    tex_slat_guidance_interval_end?: number;
    ss_guidance_interval_start?: number;
    shape_slat_sampling_steps?: number;
    ss_rescale_t?: number;
    texture_size?: 1024 | 2048 | 4096;
    tex_slat_guidance_rescale?: number;
    shape_slat_guidance_interval_end?: number;
    shape_slat_guidance_interval_start?: number;
    remesh_band?: number;
    tex_slat_sampling_steps?: number;
    decimation_target?: number;
    uv_unwrap_smooth_strength?: number;
    tex_slat_guidance_strength?: number;
    ss_guidance_interval_end?: number;
    ss_sampling_steps?: number;
    ss_guidance_strength?: number;
    remesh?: boolean;
    tex_slat_rescale_t?: number;
    shape_slat_rescale_t?: number;
    uv_unwrap_refine_iterations?: number;
    shape_slat_guidance_strength?: number;
    resolution?: 512 | 1024 | 1536;
    tex_slat_guidance_interval_start?: number;
    shape_slat_guidance_rescale?: number;
    remesh_project?: number;
    uv_unwrap_global_iterations?: number;
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
interface Trellis2Response {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ObjectOutput;
}
interface ObjectOutput {
    model_glb: {
        url: string;
        file_size?: number | unknown;
        file_name?: string | unknown;
        content_type?: string | unknown;
    };
}

interface Lyria3MusicCommand {
    prompt: string;
    model?: Lyria3Models;
    image?: Lyria3ImageInput;
    options?: GenAIOptions$1Q;
}
type Lyria3Models = "lyria-3-clip-preview" | "lyria-3-pro-preview";
interface Lyria3ImageInput {
    mimeType?: string;
    url?: string;
    uri?: string;
    data?: string;
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
    options?: GenAIOptions$1P;
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
    options?: GenAIOptions$1O;
}
interface WanV2I2VMediaItem {
    type: "first_frame" | "last_frame" | "driving_audio" | "first_clip";
    url: string;
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
    prompt_extend?: boolean;
    model?: "wan2.7-r2v";
    resolution?: "720P" | "1080P";
    ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    duration?: number;
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$1N;
}
interface WanV2R2VMediaItem {
    type: "reference_image" | "reference_video" | "first_frame";
    url: string;
    reference_voice?: WanV2R2VVoiceReference;
}
interface WanV2R2VVoiceReference {
    url: string;
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
    prompt_extend?: boolean;
    media: WanV2VideoEditMediaItem[];
    model?: "wan2.7-videoedit";
    resolution?: "720P" | "1080P";
    ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    duration?: number;
    audio_setting?: "auto" | "origin";
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$1M;
}
interface WanV2VideoEditMediaItem {
    type: "video" | "reference_image";
    url: string;
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
    prompt: string;
    seed?: number | unknown;
    image_size?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
    negative_prompt?: string | unknown;
    output_format?: "jpeg" | "png" | "webp";
    num_images?: number;
    enable_safety_checker?: boolean;
    sync_mode?: boolean;
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
    images: ({
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
        url: string;
    })[];
    seed: number;
}

interface QwenImage2EditInput {
    enable_prompt_expansion?: boolean;
    prompt: string;
    seed?: number | unknown;
    image_size?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" | unknown;
    negative_prompt?: string | unknown;
    output_format?: "jpeg" | "png" | "webp";
    num_images?: number;
    enable_safety_checker?: boolean;
    image_urls: string[];
    sync_mode?: boolean;
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
    images: ({
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
        url: string;
    })[];
    seed: number;
}

interface QwenImage2ProTextToImageInput {
    enable_prompt_expansion?: boolean;
    prompt: string;
    seed?: number | unknown;
    image_size?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
    negative_prompt?: string | unknown;
    output_format?: "jpeg" | "png" | "webp";
    num_images?: number;
    enable_safety_checker?: boolean;
    sync_mode?: boolean;
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
    images: ({
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
        url: string;
    })[];
    seed: number;
}

interface QwenImage2ProEditInput {
    enable_prompt_expansion?: boolean;
    prompt: string;
    seed?: number | unknown;
    image_size?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" | unknown;
    negative_prompt?: string | unknown;
    output_format?: "jpeg" | "png" | "webp";
    num_images?: number;
    enable_safety_checker?: boolean;
    image_urls: string[];
    sync_mode?: boolean;
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
    images: ({
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
        url: string;
    })[];
    seed: number;
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
    options?: GenAIOptions$1L;
}
type FluxOutpaintingModel = "flux-tools/outpainting-v1" | "flux-tools/outpainting-v1-fast-private";
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
interface FluxOutpaintingResult {
    result: GeneratedImageResult$5;
}
interface GeneratedImageResult$5 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface TextToImageCommand$1 {
    promptText: string;
    ratio: "1920:1080" | "1080:1920" | "1024:1024" | "1360:768" | "1080:1080" | "1168:880" | "1440:1080" | "1080:1440" | "1808:768" | "2112:912";
    referenceImages?: ReferenceImage[];
    options?: GenAIOptions$1K;
}
interface ReferenceImage {
    uri: string;
    tag?: string;
}
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
interface TextToImageResponse$1 {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeneratedImageResult$4;
}
interface GeneratedImageResult$4 {
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
    options?: GenAIOptions$1J;
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
interface CharacterPerformanceResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeneratedVideoResult$7;
}
interface GeneratedVideoResult$7 {
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
    options?: GenAIOptions$1I;
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
interface VideoToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeneratedVideoResult$6;
}
interface GeneratedVideoResult$6 {
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
    options?: GenAIOptions$1H;
    promptImage: PromptImage[];
}
interface ContentModeration$1 {
    publicFigureThreshold: "auto" | "low";
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
interface PromptImage {
    uri: string;
    position: "first";
}
interface ImageToVideoResponse$2 {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeneratedVideoResult$5;
}
interface GeneratedVideoResult$5 {
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
    options?: GenAIOptions$1G;
}
interface ContentModeration {
    publicFigureThreshold: "auto" | "low";
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
interface TextToVideoResponse$1 {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeneratedVideoResult$4;
}
interface GeneratedVideoResult$4 {
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
    options?: GenAIOptions$1F;
}
interface Keyframes {
    frame0?: KeyframeImage;
    frame1?: KeyframeImage;
}
interface KeyframeImage {
    type: string;
    url: string;
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
    options?: GenAIOptions$1E;
}
interface Media {
    url: string;
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
    options?: GenAIOptions$1D;
}
type SeedreamModelAlias = "seedream_4_0" | "seedream_4_7" | "seedream_4_5" | "seedream_5_0_lite" | "seedream_5_0_pro";
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
interface SeedreamResult {
    result: GeneratedImageResult$3;
}
interface GeneratedImageResult$3 {
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
    output_format?: OutputFormat;
    duration?: unknown | -1;
    generate_audio?: boolean;
    return_last_frame?: boolean;
    watermark?: boolean;
    camerafixed?: boolean;
    options?: GenAIOptions$1C;
}
type SeedanceModelAlias = "seedance_1_0_pro" | "seedance_1_0_pro_fast" | "seedance_1_5_pro" | "seedance_2_0" | "seedance_2_0_without_moderation" | "seedance_2_0_fast" | "seedance_2_0_mini" | "seedance_2_5" | "seedance_2_5_without_moderation";
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
type OutputFormat = "mp4" | "mov";
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
interface SeedanceResponse {
    result: GeneratedVideoResult$3;
}
interface GeneratedVideoResult$3 {
    video_url: string;
    last_frame_url?: string;
    output_format?: string;
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
    options?: GenAIOptions$1B;
}
interface RunwayPromptImage {
    uri: string;
    position: "first" | "last";
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
    options?: GenAIOptions$1A;
}
type PikaResolution$3 = "720p" | "1080p";
type PikaDuration$3 = "5" | "10";
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
    options?: GenAIOptions$1z;
}
type PikaResolution$2 = "720p" | "1080p";
type PikaDuration$2 = "5" | "10";
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
    options?: GenAIOptions$1y;
}
type PikaResolution$1 = "720p" | "1080p";
type PikaIngredientsMode = "creative" | "precise";
type PikaDuration$1 = "5" | "10";
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
    options?: GenAIOptions$1x;
}
type PikaResolution = "720p" | "1080p";
type PikaDuration = "5" | "10";
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
    storage?: StorageParam$4;
    rendering_speed?: IdeogramRenderingSpeed$2;
    num_images?: number;
    character_reference_images?: string[];
    character_reference_images_mask?: string;
    options?: GenAIOptions$1w;
}
type IdeogramMagicPromptEnum = "AUTO" | "ON" | "OFF";
type IdeogramStyleTypes = "AUTO" | "GENERAL" | "REALISTIC" | "DESIGN" | "FICTION";
interface ColorPalettesWithName$2 {
    name: string;
}
interface StorageParam$4 {
    destination: string;
}
type IdeogramRenderingSpeed$2 = "TURBO" | "DEFAULT" | "QUALITY" | "FLASH";
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
interface IdeogramV3GenerateResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: IdeogramApiResponse$4;
}
interface IdeogramApiResponse$4 {
    created: number;
    data: IdeogramClientData$4[];
}
interface IdeogramClientData$4 {
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
    storage?: StorageParam$3;
    options?: GenAIOptions$1v;
}
type IdeogramRenderingSpeed$1 = "TURBO" | "DEFAULT" | "QUALITY" | "FLASH";
interface ColorPalettesWithName$1 {
    name: string;
}
interface StorageParam$3 {
    destination: string;
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
interface IdeogramV3EditResponse {
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
    storage?: StorageParam$2;
    num_images?: number;
    character_reference_images?: string[];
    character_reference_images_mask?: string;
    options?: GenAIOptions$1u;
}
interface ColorPalettesWithName {
    name: string;
}
type IdeogramRenderingSpeed = "TURBO" | "DEFAULT" | "QUALITY" | "FLASH";
interface StorageParam$2 {
    destination: string;
}
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
interface IdeogramV3RemixResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
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

interface Seedance2T2VInput {
    prompt: string;
    generate_audio?: boolean;
    duration?: "auto" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    aspect_ratio?: "auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    bitrate_mode?: "standard" | "high";
    end_user_id?: string | unknown;
    resolution?: "480p" | "720p" | "1080p" | "4k";
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
    seed: number;
    video: {
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
        url: string;
    };
}

interface Seedance2I2VInput {
    resolution?: "480p" | "720p" | "1080p" | "4k";
    prompt: string;
    bitrate_mode?: "standard" | "high";
    generate_audio?: boolean;
    duration?: "auto" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    aspect_ratio?: "auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    end_user_id?: string | unknown;
    image_url: string;
    end_image_url?: string | unknown;
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
    seed: number;
    video: {
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
        url: string;
    };
}

interface Seedance2T2VFastInput {
    prompt: string;
    generate_audio?: boolean;
    duration?: "auto" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    aspect_ratio?: "auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    bitrate_mode?: "standard" | "high";
    end_user_id?: string | unknown;
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
interface BytedanceSeedance20FastTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Seedance2VideoOutput$3;
}
interface Seedance2VideoOutput$3 {
    seed: number;
    video: {
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
        url: string;
    };
}

interface Seedance2I2VFastInput {
    resolution?: "480p" | "720p";
    prompt: string;
    bitrate_mode?: "standard" | "high";
    generate_audio?: boolean;
    duration?: "auto" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    aspect_ratio?: "auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    end_user_id?: string | unknown;
    image_url: string;
    end_image_url?: string | unknown;
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
    seed: number;
    video: {
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
        url: string;
    };
}

interface Seedance2R2VInput {
    resolution?: "480p" | "720p" | "1080p" | "4k";
    audio_urls?: string[];
    prompt: string;
    bitrate_mode?: "standard" | "high";
    video_urls?: string[];
    duration?: "auto" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    aspect_ratio?: "auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    end_user_id?: string | unknown;
    generate_audio?: boolean;
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
interface BytedanceSeedance20ReferenceToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Seedance2VideoOutput$1;
}
interface Seedance2VideoOutput$1 {
    seed: number;
    video: {
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
        url: string;
    };
}

interface Seedance2R2VFastInput {
    resolution?: "480p" | "720p";
    audio_urls?: string[];
    prompt: string;
    bitrate_mode?: "standard" | "high";
    video_urls?: string[];
    duration?: "auto" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15";
    aspect_ratio?: "auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    end_user_id?: string | unknown;
    generate_audio?: boolean;
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
interface BytedanceSeedance20FastReferenceToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: Seedance2VideoOutput;
}
interface Seedance2VideoOutput {
    seed: number;
    video: {
        file_name?: string | unknown;
        file_size?: number | unknown;
        content_type?: string | unknown;
        url: string;
    };
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
    options?: GenAIOptions$1t;
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
    options?: GenAIOptions$1s;
}
interface AvatarVoiceInput {
    type: "runway-live-preset" | "custom";
    presetId?: "victoria" | "vincent" | "clara" | "drew" | "skye" | "max" | "morgan" | "felix" | "mia" | "marcus" | "summer" | "ruby" | "aurora" | "jasper" | "leo" | "adrian" | "nina" | "emma" | "blake" | "david" | "maya" | "nathan" | "sam" | "georgia" | "petra" | "adam" | "zach" | "violet" | "roman" | "luna";
    id?: string;
}
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
    options?: GenAIOptions$1r;
}
interface AvatarVoiceUpdateInput {
    type: "runway-live-preset" | "custom";
    presetId?: "victoria" | "vincent" | "clara" | "drew" | "skye" | "max" | "morgan" | "felix" | "mia" | "marcus" | "summer" | "ruby" | "aurora" | "jasper" | "leo" | "adrian" | "nina" | "emma" | "blake" | "david" | "maya" | "nathan" | "sam" | "georgia" | "petra" | "adam" | "zach" | "violet" | "roman" | "luna";
    id?: string;
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
    options?: GenAIOptions$1p;
}
interface AvatarVideoVoiceInput {
    type: "preset" | "custom";
    presetId?: "victoria" | "vincent" | "clara" | "drew" | "skye" | "max" | "morgan" | "felix" | "mia" | "marcus" | "summer" | "ruby" | "aurora" | "jasper" | "leo" | "adrian" | "nina" | "emma" | "blake" | "david" | "maya" | "nathan" | "sam" | "georgia" | "petra" | "adam" | "zach" | "violet" | "roman" | "luna";
    id?: string;
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
interface AvatarVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeneratedVideoResult$2;
}
interface GeneratedVideoResult$2 {
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
    options?: GenAIOptions$1o;
    model?: "model-qwent-image-edit-lightning" | "preview-model-qwent-image-edit-lightning" | "model-qwent-image-edit-vton" | "preview-model-qwent-image-edit-vton";
    num_inference_steps?: number;
    guidance_scale?: number;
    max_pixels?: number;
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
    options?: GenAIOptions$1n;
}
interface XAiTtsOutputFormat {
    codec?: string;
    sample_rate?: number;
    bit_rate?: number;
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
    model?: "grok-imagine-image" | "grok-imagine-image-quality" | "grok-imagine-image-2.0";
    aspect_ratio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "2:3" | "3:2" | "9:19.5" | "19.5:9" | "9:20" | "20:9" | "1:2" | "2:1" | "auto";
    n?: number;
    resolution?: "1k" | "2k";
    quality?: "low" | "medium";
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
    model?: "grok-imagine-image" | "grok-imagine-image-quality" | "grok-imagine-image-2.0";
    n?: number;
    resolution?: "1k" | "2k";
    options?: GenAIOptions$1l;
}
interface XAiImageUrl$1 {
    url: string;
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
    options?: GenAIOptions$1k;
}
interface XAiImageUrl {
    url: string;
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
    options?: GenAIOptions$1j;
}
interface XAiVideoUrl$1 {
    url: string;
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
    options?: GenAIOptions$1i;
}
interface XAiVideoUrl {
    url: string;
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
    options?: GenAIOptions$1g;
}
interface HappyhorseI2VMediaItem {
    type: "first_frame";
    url: string;
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
    parameters?: WhisperParameters$1;
    alignment?: AlignmentOptions$1;
    diarization?: DiarizationOptions$1;
    output?: OutputOptions$1;
    options?: GenAIOptions$1f;
}
interface WhisperParameters$1 {
    language?: "en" | "es" | "fr" | "de" | "it" | "pt" | "nl" | "pl" | "ja" | "zh" | "ru";
    task?: "transcribe" | "translate";
}
interface AlignmentOptions$1 {
    enabled?: boolean;
    return_char_alignments?: boolean;
    interpolate_method?: "nearest" | "linear" | "ignore";
}
interface DiarizationOptions$1 {
    enabled?: boolean;
    num_speakers?: number;
    min_speakers?: number;
    max_speakers?: number;
    return_embeddings?: boolean;
    fill_nearest?: boolean;
    apply_word_speakers?: boolean;
}
interface OutputOptions$1 {
    include_word_segments?: boolean;
    include_char_segments?: boolean;
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
interface WhisperxVideoCaptionsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: WhisperxVideoCaptionsResultData;
}
interface WhisperxVideoCaptionsResultData {
    language: string;
    segments?: TranscriptionSegment$1[];
}
interface TranscriptionSegment$1 {
    start: number;
    end: number;
    text: string;
    speaker?: string;
    words?: WordSegment$1[];
    chars?: CharSegment$1[];
}
interface WordSegment$1 {
    word: string;
    start?: number;
    end?: number;
    score?: number;
    speaker?: string;
}
interface CharSegment$1 {
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
    options?: GenAIOptions$1e;
    model?: "preview-model-qwent-image-edit-lightning-makeup" | "model-qwent-image-edit-lightning-makeup";
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
    options?: GenAIOptions$1d;
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
    options?: GenAIOptions$1c;
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
type GeminiImageModel = "gemini-2.5-flash-image" | "gemini-3-pro-image" | "gemini-3-pro-image-preview" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image" | "gemini-3.1-flash-image-preview";
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
    options?: GenAIOptions$1b;
}
interface HappyhorseR2VMediaItem {
    type: "reference_image";
    url: string;
}
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
    options?: GenAIOptions$1a;
}
interface HappyhorseV2VMediaItem {
    type: "video" | "reference_image";
    url: string;
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
    model?: "preview-model-simpleaiexpander-v1" | "model-simpleaiexpander-v1" | "preview-model-simpleaiexpander-v2" | "model-simpleaiexpander-v2" | "preview-model-simpleaiexpander-v2-1" | "model-simpleaiexpander-v2-1" | "preview-model-simpleaiexpander-v2-2" | "model-simpleaiexpander-v2-2";
    options?: GenAIOptions$19;
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
    model?: "qwen-image-2.0-pro" | "qwen-image-2.0-pro-2026-04-22" | "qwen-image-3.0" | "qwen-image-3.0-pro";
    size?: string;
    prompt_extend_mode?: "direct" | "agent";
    n?: number;
    prompt_extend?: boolean;
    enable_thinking?: boolean;
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$18;
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
    prompt_extend_mode?: "direct" | "agent";
    negative_prompt?: string;
    model?: "qwen-image-2.0-pro" | "qwen-image-2.0-pro-2026-04-22" | "qwen-image-3.0" | "qwen-image-3.0-pro";
    size?: string;
    n?: number;
    prompt_extend?: boolean;
    enable_thinking?: boolean;
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$17;
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

interface FaceCorrectionCommand {
    image_url: string;
    types: ("blemish" | "eye-bag" | "face-smooth" | "wrinkle")[];
    restore_colors?: boolean;
    model?: "preview-model-face-correction-v1" | "model-face-correction-v1";
    options?: GenAIOptions$16;
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
    options?: GenAIOptions$15;
}
interface LumaImageRef$1 {
    url?: string;
    data?: string;
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
    options?: GenAIOptions$14;
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
    options?: GenAIOptions$13;
}
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
    options?: GenAIOptions$12;
}
interface ReferenceMask {
    frame_index: number;
    mask_url: string;
}
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
    options?: GenAIOptions$11;
}
type KlingEffectScene = "korean_baseball" | "pet_skateboard" | "daily_ootd" | "tiny_beast_printer" | "landmark_reveal" | "winter_charm" | "flash_ride" | "maestro_of_magic" | "magic_carpet_ride" | "good_luck_spirit" | "shooting_star" | "sparkler_wand" | "sovereign_scepter" | "dirt_rush" | "return_of_the_king" | "dance_with_dragon" | "minimalist_light" | "martial_meow" | "sassy_shake" | "knock_at_a_door_revenge" | "palm_sized_figure_pro" | "prank_box" | "perler_beads" | "spring_bloom" | "toss_run" | "switch_to_silk" | "get_rich_quick" | "make_it_rain" | "twist_shake" | "the_hip_sway" | "send_my_love" | "funky_martian" | "wealth_drive" | "the_high_kick" | "the_exercise" | "lucky_veggie" | "studio_look" | "flash_drive" | "shush_my_dreams" | "french_elegance" | "finger_swipe" | "advent_of_flora" | "smooth_transition" | "kiss_pro" | "raid_check" | "snow_night_kiss" | "eternal_kiss" | "fortune_in_motion" | "chinese_trend" | "sedan_chair_dance" | "skyfall" | "good_luck_dance" | "laicai_dance" | "yangge_dance" | "color_mixing" | "lantern_festival_cuju" | "unique_firework" | "unique_spring_couplets" | "horse_mask" | "fortune_knocks_cartoon" | "tangyuan_to_animal" | "hot_feet_dance" | "swag_dance" | "pigeon_dance" | "bloodline_dance" | "chanel_dance" | "cute_dance" | "love_theme_song" | "pumpitup_dance" | "city_to_village" | "fortune_god_transform" | "new_year_feast" | "ring_in_new" | "horse_year_firework" | "crystal_horse" | "drunk_dance" | "drunk_dance_pet" | "daoma_dance" | "bouncy_dance" | "smooth_sailing_dance" | "new_year_greeting" | "lion_dance" | "prosperity" | "great_success" | "golden_horse_fortune" | "red_packet_box" | "lucky_horse_year" | "lucky_red_packet" | "lucky_money_come" | "lion_dance_pet" | "dumpling_making_pet" | "fish_making_pet" | "pet_red_packet" | "lantern_glow" | "expression_challenge" | "overdrive" | "heart_gesture_dance" | "poping" | "martial_arts" | "running" | "nezha" | "motorcycle_dance" | "subject_3_dance" | "ghost_step_dance" | "phantom_jewel" | "zoom_out" | "cheers_2026" | "fight_pro" | "hug_pro" | "heart_gesture_pro" | "dollar_rain_pro" | "pet_bee_pro" | "countdown_teleport" | "santa_random_surprise" | "magic_match_tree" | "bullet_time_360" | "happy_birthday" | "birthday_star" | "thumbs_up_pro" | "tiger_hug_pro" | "pet_lion_pro" | "surprise_bouquet" | "bouquet_drop" | "firework_2026" | "glamour_photo_shoot" | "box_of_joy" | "first_toast_of_the_year" | "my_santa_pic" | "santa_gift" | "steampunk_christmas" | "snowglobe" | "christmas_photo_shoot" | "ornament_crash" | "santa_express" | "instant_christmas" | "coronation_of_frost" | "building_sweater" | "spark_in_the_snow" | "scarlet_and_snow" | "bullet_time_lite" | "jumping_ginger_joy" | "pure_white_wings" | "black_wings" | "golden_wing" | "pink_pink_wings" | "venomous_spider" | "luminous_elf" | "woodland_elf" | "swish_swish" | "snowboarding" | "witch_transform" | "vampire_transform" | "pumpkin_head_transform" | "demon_transform" | "mummy_transform" | "zombie_transform" | "cute_pumpkin_transform" | "halloween_escape" | "tennis_trend" | "football_live" | "f1_live" | "whirling_beverage" | "spielberg_transition";
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
    options?: GenAIOptions$10;
}
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
    options?: GenAIOptions$$;
}
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
    storage?: StorageParam$1;
    options?: GenAIOptions$_;
}
type IdeogramV4RenderingSpeed = "TURBO" | "DEFAULT" | "QUALITY";
interface StorageParam$1 {
    destination: string;
}
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
interface IdeogramV4GenerateResponse {
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

interface GeminiOmniVideoGenCommand {
    prompt: string;
    image?: GeminiOmniImage;
    video?: GeminiOmniVideo;
    lastFrame?: GeminiOmniImage;
    referenceImages?: GeminiOmniImage[];
    referenceVideos?: GeminiOmniVideo[];
    resolution?: "360p" | "720p" | "1080p" | "4k";
    task?: "text_to_video" | "image_to_video" | "extend" | "reference_to_video";
    durationSeconds?: number;
    aspectRatio?: "16:9" | "9:16";
    model?: "gemini-omni-flash-preview" | "gemini-omni-1.1-flash-preview";
    options?: GenAIOptions$Z;
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
    options?: GenAIOptions$Y;
}
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
interface TextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: TextToVideoResult;
}
interface TextToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
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
    options?: GenAIOptions$X;
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
interface ImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ImageToVideoResult;
}
interface ImageToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
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
    options?: GenAIOptions$W;
}
interface ReferenceImageItem {
    url: string;
    type?: "subject" | "background";
    ref_name?: string;
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
interface ReferenceToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ReferenceToVideoResult;
}
interface ReferenceToVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface FontSimilaritySearchCommand {
    image: string;
    model?: "model-font-similarity-search";
    font_count?: number;
    max_number_of_words?: number;
    find_similar_fonts?: boolean;
    options?: GenAIOptions$V;
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
    options?: GenAIOptions$U;
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
    options?: GenAIOptions$T;
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
    options?: GenAIOptions$S;
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
    options?: GenAIOptions$R;
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
    model?: "model-stable-diffusion-inpaint-1-5-0" | "model-smartbg-v5-0-1";
    options?: GenAIOptions$Q;
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
    options?: GenAIOptions$P;
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
    options?: GenAIOptions$N;
}
interface Happyhorse11I2VMediaItem$1 {
    type: "first_frame";
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
    options?: GenAIOptions$M;
}
interface Happyhorse11R2VMediaItem$1 {
    type: "reference_image";
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
    model?: "model-sod-v8-2" | "model-sod-v10" | "model-sod-v10-1" | "model-sod-v11-0" | "model-sod-v11-2";
    options?: GenAIOptions$L;
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
    options?: GenAIOptions$K;
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
interface FluxVtoResult {
    result: GeneratedImageResult$2;
}
interface GeneratedImageResult$2 {
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
    options?: GenAIOptions$I;
}
interface Happyhorse11I2VMediaItem {
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
    options?: GenAIOptions$H;
}
interface Happyhorse11R2VMediaItem {
    type: "reference_image";
    url: string;
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
    options?: GenAIOptions$G;
    model?: "preview-model-qwent-image-edit-angle" | "model-qwent-image-edit-angle";
    lora_params?: QwenAngleLoraParams;
    num_inference_steps?: number;
    guidance_scale?: number;
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
    output_format?: "mp3_22050_32" | "mp3_44100_32" | "mp3_44100_64" | "mp3_44100_96" | "mp3_44100_128" | "mp3_44100_192" | "mp3_48000_192" | "pcm_16000" | "pcm_22050" | "pcm_24000" | "pcm_44100" | "pcm_48000";
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
    options?: GenAIOptions$E;
}
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
    options?: GenAIOptions$D;
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
    metadata?: Record<string, unknown>;
    options?: GenAIOptions$C;
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
    model: "dreamshaper-sfw" | "3d-cartoon" | "yamers-anime";
    num_outputs?: number;
    options?: GenAIOptions$B;
    model_execution_mode?: string;
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
interface AvatarGenerationResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AvatarGenerationResultData;
}
interface AvatarGenerationResultData {
    images: string[];
    tags?: string[];
}

interface QwenChatCommand {
    messages: QwenChatMessage[];
    model?: "qwen3.7-plus";
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    seed?: number;
    enable_thinking?: boolean;
    options?: GenAIOptions$A;
}
interface QwenChatMessage {
    role: "system" | "user" | "assistant";
    content: string | unknown[];
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
interface QwenChatResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: QwenChatResult;
}
interface QwenChatResult {
    model: string;
    choices: QwenChatChoice[];
    usage: QwenChatUsage;
}
interface QwenChatChoice {
    index: number;
    message: QwenChatChoiceMessage;
    finish_reason?: string;
}
interface QwenChatChoiceMessage {
    role: string;
    content: string;
}
interface QwenChatUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details?: Record<string, unknown>;
}

interface Flux3VideoCommand {
    prompt: string;
    keyframes?: string[];
    startVideo?: string;
    aspectRatio?: Flux3VideoAspectRatio;
    resolution?: Flux3VideoResolution;
    duration?: number | "auto";
    generateAudio?: boolean;
    safetyTolerance?: number;
    webhookUrl?: string;
    draft?: boolean;
    options?: GenAIOptions$z;
}
type Flux3VideoAspectRatio = "auto" | "21:9" | "2:1" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
type Flux3VideoResolution = "hd" | "fhd";
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
interface Flux3VideoResult {
    result: GeneratedVideoResult$1;
}
interface GeneratedVideoResult$1 {
    url: string;
    mimeType?: string;
    duration?: number;
    seed?: number;
    draftCache?: string;
    driveFile?: Record<string, unknown>;
}

interface PapHaircutsCommand {
    image: string;
    brush?: string;
    model?: string;
    prompt?: string;
    negative_prompt?: string;
    metadata?: Record<string, unknown>;
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
interface PapHaircutsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: PapHaircutsResultData;
}
interface PapHaircutsResultData {
    url: string;
    mimeType?: string;
    maps_url?: string;
    inpainting_mask_url?: string;
    info?: Record<string, unknown>;
}

interface SeedAudioCommand {
    model?: "seed-audio-1.0" | "seed-audio-1.0-multilingual";
    text_prompt: string;
    references?: ReferenceResource[];
    audio_config?: AudioConfig;
    watermark?: Watermark;
    options?: GenAIOptions$x;
}
interface ReferenceResource {
    speaker?: string;
    audio_data?: string;
    audio_url?: string;
    image_data?: string;
    image_url?: string;
}
interface AudioConfig {
    format?: AudioFormat;
    sample_rate?: 8000 | 16000 | 24000 | 32000 | 44100 | 48000;
    speech_rate?: number;
    loudness_rate?: number;
    pitch_rate?: number;
}
type AudioFormat = "wav" | "mp3" | "pcm" | "ogg_opus";
interface Watermark {
    aigc_watermark?: boolean;
    aigc_metadata?: AigcMetadata;
}
interface AigcMetadata {
    enable?: boolean;
    content_producer?: string;
    produce_id?: string;
    content_propagator?: string;
    propagate_id?: string;
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
interface SeedAudioResponse {
    result: GeneratedAudioResult;
}
interface GeneratedAudioResult {
    url: string;
    duration: number;
    format?: string;
    driveFile?: Record<string, unknown>;
}

interface IdeogramPImageGenerateCommand {
    prompt: string;
    resolution?: "2048x2048" | "1440x2880" | "2880x1440" | "1664x2496" | "2496x1664" | "1792x2240" | "2240x1792" | "1440x2560" | "2560x1440" | "1600x2560" | "2560x1600" | "1728x2304" | "2304x1728" | "1296x3168" | "3168x1296" | "1152x2944" | "2944x1152" | "1248x3328" | "3328x1248" | "1280x3072" | "3072x1280" | "1024x3072" | "3072x1024" | "1024x1024" | "896x1120" | "1120x896" | "864x1152" | "1152x864" | "832x1248" | "1248x832" | "800x1280" | "1280x800" | "720x1280" | "1280x720" | "720x1440" | "1440x720";
    rendering_speed?: IdeogramPImageRenderingSpeed;
    storage?: StorageParam;
    options?: GenAIOptions$w;
}
type IdeogramPImageRenderingSpeed = "very-low" | "low" | "medium" | "high";
interface StorageParam {
    destination: string;
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
interface IdeogramPImageGenerateResponse {
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

interface HidreamT2ICommand {
    prompt: string;
    aspectRatio?: string;
    seed?: number;
    model?: "picsart-hidream-t2i" | "preview-picsart-hidream-t2i";
    options?: GenAIOptions$v;
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
interface HidreamT2IResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: HidreamT2IResultData;
}
interface HidreamT2IResultData {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface EnhanceVideoCommand {
    video_url: string;
    tool_version?: ToolVersion;
    scene?: Scene;
    resolution?: EnhanceResolution;
    resolution_limit?: number;
    bitrate_level?: BitrateLevel;
    fps?: number;
    options?: GenAIOptions$u;
}
type ToolVersion = "standard" | "professional";
type Scene = "common" | "ugc" | "short_series" | "aigc" | "old_film";
type EnhanceResolution = "720p" | "1080p" | "2k" | "4k" | "8k";
type BitrateLevel = "low" | "medium" | "high";
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
interface EnhanceVideoResponse {
    result: GeneratedEnhancedVideoResult;
}
interface GeneratedEnhancedVideoResult {
    url: string;
    duration: number;
    resolution?: string;
    fps?: number;
    tool_version?: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface MinimaxVideoGenerationCommand {
    model?: "MiniMax-H3";
    content: MinimaxContentItem[];
    resolution?: string;
    duration: number;
    ratio?: "adaptive" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    aigc_watermark?: boolean;
    callback_url?: string;
    options?: GenAIOptions$t;
}
interface MinimaxContentItem {
    type: "text" | "image_url" | "video_url" | "audio_url";
    text?: string;
    image_url?: MinimaxMediaUrl;
    video_url?: MinimaxMediaUrl;
    audio_url?: MinimaxMediaUrl;
    role?: "first_frame" | "last_frame" | "reference_image" | "reference_video" | "reference_audio";
}
interface MinimaxMediaUrl {
    url: string;
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
interface MinimaxVideoGenerationResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MinimaxVideoResult$8;
}
interface MinimaxVideoResult$8 {
    url: string;
    mimeType?: string;
    duration?: number;
    ratio?: string;
    driveFile?: Record<string, unknown>;
}

interface HeygenCatalogAvatarsCommand {
    cursor?: string;
    limit?: number;
}
interface HeygenCatalogAvatarsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: HeygenCatalogAvatarsResult;
}
interface HeygenCatalogAvatarsResult {
    items: CatalogAvatar[];
    version: string;
    ttlSeconds: number;
    nextCursor?: string;
}
interface CatalogAvatar {
    id: string;
    name: string;
    tags: string[];
    preview?: CatalogAvatarPreview;
    meta?: Record<string, unknown>;
}
interface CatalogAvatarPreview {
    imageUrl?: string;
    videoUrl?: string;
}

interface HeygenCatalogVoicesCommand {
    cursor?: string;
    limit?: number;
}
interface HeygenCatalogVoicesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: HeygenCatalogVoicesResult;
}
interface HeygenCatalogVoicesResult {
    items: CatalogVoice$2[];
    version: string;
    ttlSeconds: number;
    nextCursor?: string;
}
interface CatalogVoice$2 {
    id: string;
    name: string;
    tags: string[];
    preview?: CatalogPreviewModel;
    meta?: Record<string, unknown>;
}
interface CatalogPreviewModel {
    audioUrl?: string;
}

interface ImageSegmentationCommand {
    image_url: string;
    model: "picsart-multimatting-v13" | "picsart-sky-v1" | "preview-picsart-multimatting-v13" | "preview-picsart-sky-v1";
    segmentation_class?: "all" | "background" | "hair" | "skin" | "lips" | "eyes" | "clothes" | "glasses" | "teeth" | "foreground";
    options?: GenAIOptions$s;
}
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
interface ImageSegmentationResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ImageSegmentationResultData;
}
interface ImageSegmentationResultData {
    url: string;
}

interface WanV3VideoCommand {
    prompt?: string;
    media?: WanV3MediaItem[];
    model?: "wan3.0-video" | "wan3.0-video-prime";
    resolution?: "480P" | "720P" | "1080P";
    ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "adaptive";
    duration?: number;
    audio?: boolean;
    enable_thinking?: boolean;
    watermark?: boolean;
    seed?: number;
    options?: GenAIOptions$r;
}
interface WanV3MediaItem {
    type: "reference_image" | "reference_video" | "reference_audio" | "first_frame" | "last_frame" | "file" | "link";
    url: string;
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
interface WanV3VideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: WanV3VideoResult;
}
interface WanV3VideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface XAiCatalogVoicesCommand {
    cursor?: string;
    limit?: number;
}
interface XAiCatalogVoicesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: XAiCatalogVoicesResult;
}
interface XAiCatalogVoicesResult {
    items: XAiCatalogVoice[];
    version: string;
    ttlSeconds: number;
    nextCursor?: string;
}
interface XAiCatalogVoice {
    id: string;
    name: string;
    description?: string;
    tags: string[];
    preview?: XAiCatalogVoicePreview;
    meta?: Record<string, unknown>;
}
interface XAiCatalogVoicePreview {
    audioUrl?: string;
}

interface SeedAudioCatalogVoicesCommand {
    modelId?: string;
    cursor?: string;
    limit?: number;
}
interface SeedAudioCatalogVoicesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: SeedAudioCatalogVoicesResult;
}
interface SeedAudioCatalogVoicesResult {
    items: CatalogVoice$1[];
    version: string;
    ttlSeconds: number;
    nextCursor?: string;
}
interface CatalogVoice$1 {
    id: string;
    name: string;
    description?: string;
    tags: string[];
    preview?: CatalogVoicePreview$1;
    meta?: Record<string, unknown>;
}
interface CatalogVoicePreview$1 {
    audioUrl?: string;
}

interface AsyncCatalogVoicesCommand {
    cursor?: string;
    limit?: number;
}
interface AsyncCatalogVoicesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: AsyncCatalogVoicesResult;
}
interface AsyncCatalogVoicesResult {
    items: AsyncCatalogVoice[];
    version: string;
    ttlSeconds: number;
    nextCursor?: string;
}
interface AsyncCatalogVoice {
    id: string;
    name: string;
    description?: string;
    tags: string[];
    preview?: AsyncCatalogVoicePreview;
    meta?: Record<string, unknown>;
}
interface AsyncCatalogVoicePreview {
    audioUrl?: string;
}

interface GeminiCatalogVoicesCommand {
    cursor?: string;
    limit?: number;
}
interface GeminiCatalogVoicesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeminiCatalogVoicesResult;
}
interface GeminiCatalogVoicesResult {
    items: GeminiCatalogVoice[];
    version: string;
    ttlSeconds: number;
    nextCursor?: string;
}
interface GeminiCatalogVoice {
    id: string;
    name: string;
    description?: string;
    tags: string[];
    preview?: GeminiCatalogVoicePreview;
    meta?: Record<string, unknown>;
}
interface GeminiCatalogVoicePreview {
    audioUrl?: string;
}

interface CatalogVoicesCommand$1 {
    cursor?: string;
    limit?: number;
}
interface CatalogVoicesResponse$1 {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: CatalogPageResult$2;
}
interface CatalogPageResult$2 {
    items: CatalogItemResult$2[];
    version: string;
    ttlSeconds: number;
    nextCursor?: string;
}
interface CatalogItemResult$2 {
    id: string;
    name: string;
    description?: string;
    tags: string[];
    preview?: CatalogPreviewResult$2;
    meta?: Record<string, unknown>;
}
interface CatalogPreviewResult$2 {
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
}

interface CatalogAvatarsCommand {
    cursor?: string;
    limit?: number;
}
interface CatalogAvatarsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: CatalogPageResult$1;
}
interface CatalogPageResult$1 {
    items: CatalogItemResult$1[];
    version: string;
    ttlSeconds: number;
    nextCursor?: string;
}
interface CatalogItemResult$1 {
    id: string;
    name: string;
    description?: string;
    tags: string[];
    preview?: CatalogPreviewResult$1;
    meta?: Record<string, unknown>;
}
interface CatalogPreviewResult$1 {
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
}

interface CatalogVoicesCommand {
    cursor?: string;
    limit?: number;
}
interface CatalogVoicesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: CatalogVoicesResult;
}
interface CatalogVoicesResult {
    items: CatalogVoice[];
    version: string;
    ttlSeconds: number;
    nextCursor?: string;
}
interface CatalogVoice {
    id: string;
    name: string;
    description?: string;
    tags: string[];
    preview?: CatalogVoicePreview;
    meta?: Record<string, unknown>;
}
interface CatalogVoicePreview {
    audioUrl?: string;
}

interface PhotoAdjustCommand {
    operation: "auto_adjust" | "guided_upsampling";
    image: string;
    image_low_res?: string;
    image_low_res_processed?: string;
    face_enhancement?: boolean;
    face_enhancement_blending?: number;
    colour_correction?: boolean;
    colour_correction_node?: string;
    output_format?: string;
    model?: string;
    metadata?: Record<string, unknown>;
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
interface PhotoAdjustResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: PhotoAdjustResultData;
}
interface PhotoAdjustResultData {
    url: string;
    mimeType?: string;
    info?: Record<string, unknown>;
}

interface KlingCatalogTemplatesCommand {
    cursor?: string;
    limit?: number;
}
interface KlingCatalogTemplatesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: KlingTemplatesPageResult;
}
interface KlingTemplatesPageResult {
    items: KlingTemplateResult[];
    version: string;
    ttlSeconds: number;
    nextCursor?: string;
}
interface KlingTemplateResult {
    id: string;
    name: string;
    tags: string[];
    preview?: KlingTemplatePreview;
    meta: KlingTemplateMeta;
}
interface KlingTemplatePreview {
    videoUrl?: string;
    imageUrl?: string;
}
interface KlingTemplateMeta {
    imageSlots: number;
}

interface ChargeCommand {
    requests: ChargeRequestModel[];
}
interface ChargeRequestModel {
    toolId?: string;
    modelInfo?: ModelInfoModel;
    amount: number;
    emitMetric?: boolean;
}
interface ModelInfoModel {
    modelId: string;
    useCase: "text-to-image" | "image-to-image" | "text-to-video" | "image-to-video" | "video-to-video" | "video-to-image" | "text-to-speech" | "text-to-audio" | "speech-to-text" | "image-to-audio" | "audio-to-audio" | "speech-to-speech" | "chat-completions" | "audio-to-video" | "video-to-audio";
    quality?: string;
    audio?: boolean;
}
interface ChargeResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ChargeResultModel[];
}
interface ChargeResultModel {
    toolId: string;
    unit: "generation" | "megapixel" | "second" | "30_second" | "minute" | "1k_characters" | "input_tokens" | "input_text_tokens" | "input_cached_tokens" | "cache_write_5m_tokens" | "cache_write_1h_tokens" | "input_image_tokens" | "output_image_tokens" | "output_audio_tokens" | "output_text_tokens" | "input_megapixel" | "output_megapixel" | "output_megapixel_additional" | "1k_output_video_tokens";
    amount: number;
    operationId?: string;
    rawCredits: number;
    requestedCredits: number;
    credits: number;
    charged: boolean;
    partial: boolean;
}

interface Hailuo02ProTextToVideoCommand {
    prompt: string;
    prompt_optimizer?: boolean;
    callback_url?: string;
    options?: GenAIOptions$p;
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
interface Hailuo02ProTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MinimaxVideoResult$7;
}
interface MinimaxVideoResult$7 {
    url: string;
    mimeType?: string;
    duration?: number;
    ratio?: string;
    driveFile?: Record<string, unknown>;
}

interface Hailuo02ProImageToVideoCommand {
    prompt: string;
    prompt_optimizer?: boolean;
    callback_url?: string;
    options?: GenAIOptions$o;
    image_url: string;
    end_image_url?: string;
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
interface Hailuo02ProImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MinimaxVideoResult$6;
}
interface MinimaxVideoResult$6 {
    url: string;
    mimeType?: string;
    duration?: number;
    ratio?: string;
    driveFile?: Record<string, unknown>;
}

interface Hailuo23StandardTextToVideoCommand {
    prompt: string;
    prompt_optimizer?: boolean;
    callback_url?: string;
    options?: GenAIOptions$n;
    duration?: 6 | 10;
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
interface Hailuo23StandardTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MinimaxVideoResult$5;
}
interface MinimaxVideoResult$5 {
    url: string;
    mimeType?: string;
    duration?: number;
    ratio?: string;
    driveFile?: Record<string, unknown>;
}

interface Hailuo23StandardImageToVideoCommand {
    prompt: string;
    prompt_optimizer?: boolean;
    callback_url?: string;
    options?: GenAIOptions$m;
    image_url: string;
    duration?: 6 | 10;
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
interface Hailuo23StandardImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MinimaxVideoResult$4;
}
interface MinimaxVideoResult$4 {
    url: string;
    mimeType?: string;
    duration?: number;
    ratio?: string;
    driveFile?: Record<string, unknown>;
}

interface Hailuo23ProTextToVideoCommand {
    prompt: string;
    prompt_optimizer?: boolean;
    callback_url?: string;
    options?: GenAIOptions$l;
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
interface Hailuo23ProTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MinimaxVideoResult$3;
}
interface MinimaxVideoResult$3 {
    url: string;
    mimeType?: string;
    duration?: number;
    ratio?: string;
    driveFile?: Record<string, unknown>;
}

interface Hailuo23ProImageToVideoCommand {
    prompt: string;
    prompt_optimizer?: boolean;
    callback_url?: string;
    options?: GenAIOptions$k;
    image_url: string;
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
interface Hailuo23ProImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MinimaxVideoResult$2;
}
interface MinimaxVideoResult$2 {
    url: string;
    mimeType?: string;
    duration?: number;
    ratio?: string;
    driveFile?: Record<string, unknown>;
}

interface Hailuo23FastStandardImageToVideoCommand {
    prompt: string;
    prompt_optimizer?: boolean;
    callback_url?: string;
    options?: GenAIOptions$j;
    image_url: string;
    duration?: 6 | 10;
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
interface Hailuo23FastStandardImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MinimaxVideoResult$1;
}
interface MinimaxVideoResult$1 {
    url: string;
    mimeType?: string;
    duration?: number;
    ratio?: string;
    driveFile?: Record<string, unknown>;
}

interface Hailuo23FastProImageToVideoCommand {
    prompt: string;
    prompt_optimizer?: boolean;
    callback_url?: string;
    options?: GenAIOptions$i;
    image_url: string;
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
interface Hailuo23FastProImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MinimaxVideoResult;
}
interface MinimaxVideoResult {
    url: string;
    mimeType?: string;
    duration?: number;
    ratio?: string;
    driveFile?: Record<string, unknown>;
}

interface MinimaxMusicV2Command {
    prompt: string;
    lyrics?: string;
    audio_setting?: MinimaxMusicAudioSettingDto$1;
    lyrics_optimizer?: boolean;
    is_instrumental?: boolean;
    options?: GenAIOptions$h;
}
interface MinimaxMusicAudioSettingDto$1 {
    sample_rate?: 16000 | 24000 | 32000 | 44100;
    bitrate?: 32000 | 64000 | 128000 | 256000;
    format?: "mp3" | "wav" | "pcm";
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
interface MinimaxMusicV2Response {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MinimaxMusicResult$1;
}
interface MinimaxMusicResult$1 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface MinimaxMusicV3Command {
    prompt: string;
    lyrics?: string;
    audio_setting?: MinimaxMusicAudioSettingDto;
    lyrics_optimizer?: boolean;
    is_instrumental?: boolean;
    options?: GenAIOptions$g;
}
interface MinimaxMusicAudioSettingDto {
    sample_rate?: 16000 | 24000 | 32000 | 44100;
    bitrate?: 32000 | 64000 | 128000 | 256000;
    format?: "mp3" | "wav" | "pcm";
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
interface MinimaxMusicV3Response {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MinimaxMusicResult;
}
interface MinimaxMusicResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface SeedreamLayerSeparationCommand {
    image: string;
    prompt?: string;
    resolution?: SeedreamLayerSeparationResolution;
    watermark?: boolean;
    options?: GenAIOptions$f;
}
type SeedreamLayerSeparationResolution = "1K" | "2K";
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
interface SeedreamLayerSeparationResponse {
    result: SeedreamLayersResult;
}
interface SeedreamLayersResult {
    items: SeedreamLayerItem[];
}
interface SeedreamLayerItem {
    url: string;
    mimeType?: string;
    z_index: number;
    size?: string;
    bounding_box?: LayerBoundingBox;
    name?: string;
    description?: string;
    driveFile?: Record<string, unknown>;
}
interface LayerBoundingBox {
    absolute: number[];
    normalized: number[];
}

interface RecraftStylesCommand {
    style: "any" | "realistic_image" | "digital_illustration" | "vector_illustration" | "icon" | "logo_raster";
    image_urls?: string[];
    model?: "recraftv2" | "recraftv2_vector" | "recraftv3" | "recraftv3_vector" | "recraftv4" | "recraftv4_vector" | "recraftv4_pro" | "recraftv4_pro_vector" | "recraftv4_styles" | "recraftv4_styles_vector" | "recraftv4_styles_pro" | "recraftv4_styles_pro_vector" | "recraftv4_1" | "recraftv4_1_vector" | "recraftv4_1_pro" | "recraftv4_1_pro_vector" | "recraftv4_1_utility" | "recraftv4_1_utility_vector" | "recraftv4_1_utility_pro" | "recraftv4_1_utility_pro_vector";
    image_weights?: number[];
    source_styles?: string[];
    source_style_weights?: number[];
    prompt?: string;
    mix_policy?: "PaletteMatch" | "MaxWeight";
    options?: GenAIOptions$e;
}
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
interface RecraftStylesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: RecraftStyleResult;
}
interface RecraftStyleResult {
    id: string;
    style: string;
    creation_time: string;
}

interface FlowCatalogTemplatesCommand {
    modelId?: string;
    cursor?: string;
    limit?: number;
}
interface FlowCatalogTemplatesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: FlowTemplatesPageResult;
}
interface FlowTemplatesPageResult {
    items: FlowTemplateResult[];
    version: string;
    ttlSeconds: number;
    nextCursor?: string;
}
interface FlowTemplateResult {
    id: string;
    name: string;
    description?: string;
    tags: string[];
    preview?: FlowTemplatePreview;
    meta: FlowTemplateMeta;
}
interface FlowTemplatePreview {
    videoUrl?: string;
    imageUrl?: string;
}
interface FlowTemplateMeta {
    type: string;
    imageSlots: number;
    inputIds: string[];
    slug: string;
    textItems?: FlowTemplateTextItem[];
}
interface FlowTemplateTextItem {
    id: string;
    title?: string;
}

interface PicsartFlowEffectsCommand {
    template: string;
    imageUrls: string[];
    options?: GenAIOptions$d;
    moderationLevel?: "none" | "low" | "medium" | "high";
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
interface PicsartFlowEffectsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: PicsartFlowEffectsResult;
}
interface PicsartFlowEffectsResult {
    items: PicsartFlowResultItem[];
}
interface PicsartFlowResultItem {
    url: string;
    type: string;
    driveFile?: PicsartFlowDriveFile;
}
interface PicsartFlowDriveFile {
    id: string;
}

interface OmniHumanCommand {
    image_url: string;
    audio_url: string;
    prompt?: string;
    resolution?: OmniHumanResolution;
    turbo_mode?: boolean;
    mask_url?: string | string[];
    seed?: number;
    options?: GenAIOptions$c;
}
type OmniHumanResolution = "720p" | "1080p";
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
interface OmniHumanResponse {
    result: GeneratedOmniHumanVideoResult;
}
interface GeneratedOmniHumanVideoResult {
    url: string;
    video: OmniHumanVideoFile;
    duration: number;
    resolution: OmniHumanResolution;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}
interface OmniHumanVideoFile {
    url: string;
    content_type?: string;
}

interface BflFlux2Command {
    prompt: string;
    seed?: number;
    aspectRatio?: "0:0" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21";
    outputFormat?: "jpeg" | "png";
    promptUpsampling?: boolean;
    safetyTolerance?: number;
    options?: GenAIOptions$b;
    model: FluxV2Model;
    steps?: number;
    guidance?: number;
    imageUrls: string[];
    width?: number;
    height?: number;
    resolution?: FluxResolution;
    count?: number;
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
type FluxV2Model = "flux-2-flex" | "flux-2-pro" | "flux-2-pro-preview" | "flux-2-max";
type FluxResolution = "1K" | "2K" | "4K";
interface BflFlux2Result {
    result: BflFlux2ResultBody;
}
interface BflFlux2ResultBody {
    items: GeneratedImageResult$1[];
}
interface GeneratedImageResult$1 {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface BflFluxKontextCommand {
    prompt: string;
    seed?: number;
    aspectRatio?: "0:0" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21";
    outputFormat?: "jpeg" | "png";
    promptUpsampling?: boolean;
    safetyTolerance?: number;
    options?: GenAIOptions$a;
    model: FluxKontextModel;
    imageUrls?: string[];
    count?: number;
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
type FluxKontextModel = "flux-kontext-max" | "flux-kontext-pro";
interface BflFluxKontextResult {
    result: BflFluxKontextResultBody;
}
interface BflFluxKontextResultBody {
    items: GeneratedImageResult[];
}
interface GeneratedImageResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface ParakeetSliceCommand {
    url: string;
    start?: number;
    end?: number;
    model?: "preview-model-parakeet-unified-en-v1" | "model-parakeet-unified-en-v1";
}
interface ParakeetSliceResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ParakeetSliceResultData;
}
interface ParakeetSliceResultData {
    text: string;
    durationSeconds: number;
}

interface ParakeetUnifiedEnCommand {
    url: string;
    model?: "preview-model-parakeet-unified-en-v1" | "model-parakeet-unified-en-v1";
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
interface ParakeetUnifiedEnResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: ParakeetUnifiedEnResultData;
}
interface ParakeetUnifiedEnResultData {
    text: string;
    durationSeconds: number;
}

interface CreativeEnhancementCommand {
    image: string;
    model?: "picsart-creative-enhancement" | "preview-picsart-creative-enhancement";
    target_scale?: number;
    target_size?: number;
    target_height?: number;
    target_width?: number;
    seed?: number;
    creative_prompt?: string;
    creative_num_steps?: number;
    creative_strength?: number;
    creative_conditioning_strength?: number;
    creative_processing_size?: number;
    output_format?: "JPEG" | "PNG" | "HEIC" | "WEBP";
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
interface CreativeEnhancementResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: CreativeEnhancementResultData;
}
interface CreativeEnhancementResultData {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface FaceCollageCommand {
    landmarks_url?: string;
    landmarks_json?: string;
    coordinate_space?: "pixels" | "normalized";
    width: number;
    height: number;
    style: "sculpture" | "impressionism" | "neoclassicism" | "engravings" | "renaissance" | "rococo";
    region: "half_face_left" | "half_face_right" | "mouth" | "eyes" | "nose";
    template?: number;
    variant?: number;
    decoration?: number;
    model?: "preview-model-face-collage-v1" | "model-face-collage-v1";
    options?: GenAIOptions$7;
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
interface FaceCollageResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: FaceCollageResultData;
}
interface FaceCollageResultData {
    url: string;
    faceRect?: string[];
    driveFile?: Record<string, unknown>;
}

interface WhisperxSliceCommand {
    url: string;
    start?: number;
    end?: number;
    model?: "preview-model-whisperx-large-v3" | "model-whisperx-large-v3";
    parameters?: WhisperParameters;
    alignment?: AlignmentOptions;
    diarization?: DiarizationOptions;
    output?: OutputOptions;
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
interface WhisperxSliceResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: WhisperxSliceResultData;
}
interface WhisperxSliceResultData {
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

interface CaptionsAiVideosCaptionsCommand {
    video: CaptionsAiVideoUrl;
    caption_template_id: string;
    options?: GenAIOptions$6;
}
interface CaptionsAiVideoUrl {
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
interface CaptionsAiVideosCaptionsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: CaptionsAiVideoResult;
}
interface CaptionsAiVideoResult {
    url: string;
    mimeType: string;
    duration?: number;
    driveFile?: Record<string, unknown>;
}

interface CaptionsAiCatalogTemplatesCommand {
    cursor?: string;
    limit?: number;
}
interface CaptionsAiCatalogTemplatesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: CaptionsAiCatalogTemplatesResult;
}
interface CaptionsAiCatalogTemplatesResult {
    items: CaptionsAiCatalogTemplate[];
    version: string;
    ttlSeconds: number;
    nextCursor?: string;
}
interface CaptionsAiCatalogTemplate {
    id: string;
    name: string;
    tags: string[];
    preview?: CaptionsAiCatalogTemplatePreview;
}
interface CaptionsAiCatalogTemplatePreview {
    videoUrl?: string;
}

interface FluxVideoUpscaleCommand {
    videoUrl: string;
    upscaleFactor?: number;
    creativity?: number;
    prompt?: string;
    safetyTolerance?: number;
    webhookUrl?: string;
    options?: GenAIOptions$5;
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
interface FluxVideoUpscaleResult {
    result: UpscaledVideoResult;
}
interface UpscaledVideoResult {
    url: string;
    mimeType?: string;
    seed?: number;
    driveFile?: Record<string, unknown>;
}

interface VoiceCreateCommand {
    generated_voice_id: string;
    voice_name: string;
    voice_description: string;
    labels?: Record<string, string>;
    played_not_selected_voice_ids?: string[];
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
interface VoiceCreateResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: CreatedVoice$1;
}
interface CreatedVoice$1 {
    voice_id: string;
    name: string;
    description?: string;
    category?: string;
    preview_url?: string;
    labels?: Record<string, string>;
    requires_verification?: boolean;
}

interface VoiceCloneCommand {
    name: string;
    audio_urls: string[];
    description?: string;
    labels?: Record<string, string>;
    remove_background_noise?: boolean;
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
interface VoiceCloneResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: CreatedVoice;
}
interface CreatedVoice {
    voice_id: string;
    name: string;
    description?: string;
    category?: string;
    preview_url?: string;
    labels?: Record<string, string>;
    requires_verification?: boolean;
}

interface VoiceDeleteCommand {
    voice_id: string;
}
interface VoiceDeleteResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: VoiceDeleteResult;
}
interface VoiceDeleteResult {
    voice_id: string;
    category: string;
    deleted: boolean;
}

interface TurboTextToVideoHailuo03Input$1 {
    prompt_expansion_mode: string;
    resolution?: "480P" | "768P";
    enable_safety_checker?: boolean;
    seed?: number | unknown;
    duration?: number;
    prompt: string;
    sync_mode?: boolean;
    aspect_ratio?: "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
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
interface MinimaxH3MaxTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: TurboTextToVideoHailuo03Output$1;
}
interface TurboTextToVideoHailuo03Output$1 {
    timings?: Record<string, number> | unknown;
    expanded_prompt?: string | unknown;
    video: {
        file_size?: number | unknown;
        url: string;
        content_type?: string | unknown;
        file_name?: string | unknown;
    };
}

interface TurboImageToVideoHailuo03Input$1 {
    prompt_expansion_mode: string;
    resolution?: "480P" | "768P";
    enable_safety_checker?: boolean;
    seed?: number | unknown;
    end_image_url?: string | unknown;
    duration?: number;
    prompt: string;
    sync_mode?: boolean;
    image_url?: string | unknown;
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
interface MinimaxH3MaxImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: TurboImageToVideoHailuo03Output$1;
}
interface TurboImageToVideoHailuo03Output$1 {
    timings?: Record<string, number> | unknown;
    expanded_prompt?: string | unknown;
    video: {
        file_size?: number | unknown;
        url: string;
        content_type?: string | unknown;
        file_name?: string | unknown;
    };
}

interface MetaImagesGenerationsCommand {
    prompt: string;
    model?: "muse-image-1.0";
    n?: number;
    size?: string;
    output_format?: "png" | "jpeg" | "webp";
    reasoning_strength?: "low" | "high";
    moderation?: "auto" | "low" | "none";
    tool_enablement?: MetaImageToolEnablement$1;
    options?: GenAIOptions$2;
}
interface MetaImageToolEnablement$1 {
    enable_image_search?: boolean;
    enable_web_search?: boolean;
    enable_shell?: boolean;
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
interface MetaImagesGenerationsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MetaImagesGenerationsResult;
}
interface MetaImagesGenerationsResult {
    items: MetaGeneratedImage$1[];
}
interface MetaGeneratedImage$1 {
    url: string;
    mimeType: string;
    revised_prompt?: string;
}

interface MetaImagesEditsCommand {
    prompt: string;
    images: string[];
    model?: "muse-image-1.0";
    n?: number;
    size?: string;
    output_format?: "png" | "jpeg" | "webp";
    reasoning_strength?: "low" | "high";
    moderation?: "auto" | "low" | "none";
    tool_enablement?: MetaImageToolEnablement;
    options?: GenAIOptions$1;
}
interface MetaImageToolEnablement {
    enable_image_search?: boolean;
    enable_web_search?: boolean;
    enable_shell?: boolean;
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
interface MetaImagesEditsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MetaImagesEditsResult;
}
interface MetaImagesEditsResult {
    items: MetaGeneratedImage[];
}
interface MetaGeneratedImage {
    url: string;
    mimeType: string;
    revised_prompt?: string;
}

interface TurboReferenceToVideoHailuo03Input {
    reference_video_urls?: string[];
    resolution?: "480P" | "768P";
    prompt_expansion_mode: string;
    seed?: number | unknown;
    enable_safety_checker?: boolean;
    reference_audio_urls?: string[];
    duration?: number;
    prompt: string;
    sync_mode?: boolean;
    aspect_ratio?: "adaptive" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
    reference_image_urls?: string[];
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
interface MinimaxH3MaxReferenceToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: TurboReferenceToVideoHailuo03Output;
}
interface TurboReferenceToVideoHailuo03Output {
    timings?: Record<string, number> | unknown;
    expanded_prompt?: string | unknown;
    video: {
        file_size?: number | unknown;
        url: string;
        content_type?: string | unknown;
        file_name?: string | unknown;
    };
    seed: number;
}

interface VideoEffectsCommand {
    videoUri: string;
    promptText?: string;
    effect?: "spotlight" | "warm-light" | "blue-light" | "paparazzi" | "rainbow" | "backlight" | "police" | "lens-flare" | "blinds" | "high-noon" | "early-evening" | "twilight" | "night" | "midnight" | "early-morning" | "snow" | "sunny" | "rain" | "thunder" | "fog" | "wind" | "dark" | "smoke";
    options?: GenAIOptions;
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
interface VideoEffectsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: GeneratedVideoResult;
}
interface GeneratedVideoResult {
    url: string;
    mimeType?: string;
    driveFile?: Record<string, unknown>;
}

interface CatalogEffectsCommand {
    cursor?: string;
    limit?: number;
}
interface CatalogEffectsResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: CatalogPageResult;
}
interface CatalogPageResult {
    items: CatalogItemResult[];
    version: string;
    ttlSeconds: number;
    nextCursor?: string;
}
interface CatalogItemResult {
    id: string;
    name: string;
    description?: string;
    tags: string[];
    preview?: CatalogPreviewResult;
    meta?: Record<string, unknown>;
}
interface CatalogPreviewResult {
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
}

interface MultipleAnglesInput {
    guidance_scale?: number;
    lora_scale?: number;
    num_images?: number;
    additional_prompt?: string | unknown;
    zoom?: number;
    vertical_angle?: number;
    horizontal_angle?: number;
    sync_mode?: boolean;
    image_urls: string[];
    output_format?: "png" | "jpeg" | "webp";
    enable_safety_checker?: boolean;
    image_size?: {
        height?: number;
        width?: number;
    } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" | unknown;
    negative_prompt?: string;
    seed?: number | unknown;
    num_inference_steps?: number;
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
interface QwenImageEdit2511MultipleAnglesResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: MultipleAnglesOutput;
}
interface MultipleAnglesOutput {
    images: ({
        url: string;
        height?: number | unknown;
        content_type?: string | unknown;
        file_size?: number | unknown;
        width?: number | unknown;
        file_name?: string | unknown;
    })[];
    seed: number;
    prompt: string;
}

interface TurboTextToVideoHailuo03Input {
    prompt_expansion_mode: string;
    resolution?: "480P" | "768P";
    enable_safety_checker?: boolean;
    seed?: number | unknown;
    duration?: number;
    prompt: string;
    sync_mode?: boolean;
    aspect_ratio?: "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
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
interface MinimaxH3MaxTurboTextToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: TurboTextToVideoHailuo03Output;
}
interface TurboTextToVideoHailuo03Output {
    timings?: Record<string, number> | unknown;
    expanded_prompt?: string | unknown;
    video: {
        file_size?: number | unknown;
        url: string;
        content_type?: string | unknown;
        file_name?: string | unknown;
    };
}

interface TurboImageToVideoHailuo03Input {
    prompt_expansion_mode: string;
    resolution?: "480P" | "768P";
    enable_safety_checker?: boolean;
    seed?: number | unknown;
    end_image_url?: string | unknown;
    duration?: number;
    prompt: string;
    sync_mode?: boolean;
    image_url?: string | unknown;
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
interface MinimaxH3MaxTurboImageToVideoResponse {
    id: string;
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    result: TurboImageToVideoHailuo03Output;
}
interface TurboImageToVideoHailuo03Output {
    timings?: Record<string, number> | unknown;
    expanded_prompt?: string | unknown;
    video: {
        file_size?: number | unknown;
        url: string;
        content_type?: string | unknown;
        file_name?: string | unknown;
    };
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
        params: TextToVideoInput;
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
    'hunyuan-image/v3/text-to-image': {
        params: HunyuanTextToImageInputV3;
        result: HunyuanImageV3TextToImageResponse;
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
    'elevenlabs/sound-effects/v2': {
        params: SoundEffectRequestV2;
        result: ElevenlabsSoundEffectsV2Response;
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
    'qwen/v1/chat': {
        params: QwenChatCommand;
        result: QwenChatResponse;
    };
    'flux/v1/video': {
        params: Flux3VideoCommand;
        result: Flux3VideoResult;
    };
    'pcp/v1/pap-haircuts': {
        params: PapHaircutsCommand;
        result: PapHaircutsResponse;
    };
    'bytedance/text-to-speech': {
        params: SeedAudioCommand;
        result: SeedAudioResponse;
    };
    'ideogram/p-image/generate': {
        params: IdeogramPImageGenerateCommand;
        result: IdeogramPImageGenerateResponse;
    };
    'pcp/v1/hidream-t2i': {
        params: HidreamT2ICommand;
        result: HidreamT2IResponse;
    };
    'bytedance/video-enhance': {
        params: EnhanceVideoCommand;
        result: EnhanceVideoResponse;
    };
    'minimax/v2/video-generation': {
        params: MinimaxVideoGenerationCommand;
        result: MinimaxVideoGenerationResponse;
    };
    'heygen/v1/catalog/avatars': {
        params: HeygenCatalogAvatarsCommand;
        result: HeygenCatalogAvatarsResponse;
    };
    'heygen/v1/catalog/voices': {
        params: HeygenCatalogVoicesCommand;
        result: HeygenCatalogVoicesResponse;
    };
    'pcp/v1/image-segmentation': {
        params: ImageSegmentationCommand;
        result: ImageSegmentationResponse;
    };
    'wan/v3/video': {
        params: WanV3VideoCommand;
        result: WanV3VideoResponse;
    };
    'x-ai/v1/catalog/voices': {
        params: XAiCatalogVoicesCommand;
        result: XAiCatalogVoicesResponse;
    };
    'bytedance/v1/catalog/voices': {
        params: SeedAudioCatalogVoicesCommand;
        result: SeedAudioCatalogVoicesResponse;
    };
    'async-ai/v1/catalog/voices': {
        params: AsyncCatalogVoicesCommand;
        result: AsyncCatalogVoicesResponse;
    };
    'gemini/v1/catalog/voices': {
        params: GeminiCatalogVoicesCommand;
        result: GeminiCatalogVoicesResponse;
    };
    'runway/v1/catalog/voices': {
        params: CatalogVoicesCommand$1;
        result: CatalogVoicesResponse$1;
    };
    'runway/v1/catalog/avatars': {
        params: CatalogAvatarsCommand;
        result: CatalogAvatarsResponse;
    };
    'elevenlabs/v1/catalog/voices': {
        params: CatalogVoicesCommand;
        result: CatalogVoicesResponse;
    };
    'pcp/v1/photo-adjust': {
        params: PhotoAdjustCommand;
        result: PhotoAdjustResponse;
    };
    'kling/v1/catalog/templates': {
        params: KlingCatalogTemplatesCommand;
        result: KlingCatalogTemplatesResponse;
    };
    'v1/credits/charge': {
        params: ChargeCommand;
        result: ChargeResponse;
    };
    'minimax/hailuo-02/pro/text-to-video': {
        params: Hailuo02ProTextToVideoCommand;
        result: Hailuo02ProTextToVideoResponse;
    };
    'minimax/hailuo-02/pro/image-to-video': {
        params: Hailuo02ProImageToVideoCommand;
        result: Hailuo02ProImageToVideoResponse;
    };
    'minimax/hailuo-2.3/standard/text-to-video': {
        params: Hailuo23StandardTextToVideoCommand;
        result: Hailuo23StandardTextToVideoResponse;
    };
    'minimax/hailuo-2.3/standard/image-to-video': {
        params: Hailuo23StandardImageToVideoCommand;
        result: Hailuo23StandardImageToVideoResponse;
    };
    'minimax/hailuo-2.3/pro/text-to-video': {
        params: Hailuo23ProTextToVideoCommand;
        result: Hailuo23ProTextToVideoResponse;
    };
    'minimax/hailuo-2.3/pro/image-to-video': {
        params: Hailuo23ProImageToVideoCommand;
        result: Hailuo23ProImageToVideoResponse;
    };
    'minimax/hailuo-2.3-fast/standard/image-to-video': {
        params: Hailuo23FastStandardImageToVideoCommand;
        result: Hailuo23FastStandardImageToVideoResponse;
    };
    'minimax/hailuo-2.3-fast/pro/image-to-video': {
        params: Hailuo23FastProImageToVideoCommand;
        result: Hailuo23FastProImageToVideoResponse;
    };
    'minimax-music/v2': {
        params: MinimaxMusicV2Command;
        result: MinimaxMusicV2Response;
    };
    'minimax-music/v3': {
        params: MinimaxMusicV3Command;
        result: MinimaxMusicV3Response;
    };
    'bytedance/image-layer-separation': {
        params: SeedreamLayerSeparationCommand;
        result: SeedreamLayerSeparationResponse;
    };
    'recraft/v1/styles': {
        params: RecraftStylesCommand;
        result: RecraftStylesResponse;
    };
    'picsart-flow/v1/catalog/templates': {
        params: FlowCatalogTemplatesCommand;
        result: FlowCatalogTemplatesResponse;
    };
    'picsart-flow/v1/effects': {
        params: PicsartFlowEffectsCommand;
        result: PicsartFlowEffectsResponse;
    };
    'bytedance/omnihuman/v1.5': {
        params: OmniHumanCommand;
        result: OmniHumanResponse;
    };
    'bfl/v1/flux-2': {
        params: BflFlux2Command;
        result: BflFlux2Result;
    };
    'bfl/v1/flux-kontext': {
        params: BflFluxKontextCommand;
        result: BflFluxKontextResult;
    };
    'pcp/v1/parakeet-stt-slice': {
        params: ParakeetSliceCommand;
        result: ParakeetSliceResponse;
    };
    'pcp/v1/parakeet-stt': {
        params: ParakeetUnifiedEnCommand;
        result: ParakeetUnifiedEnResponse;
    };
    'pcp/v1/creative-enhancement': {
        params: CreativeEnhancementCommand;
        result: CreativeEnhancementResponse;
    };
    'pcp/v1/face-collage': {
        params: FaceCollageCommand;
        result: FaceCollageResponse;
    };
    'pcp/v1/whisperx-stt-slice': {
        params: WhisperxSliceCommand;
        result: WhisperxSliceResponse;
    };
    'captionsai/v1/videos/captions': {
        params: CaptionsAiVideosCaptionsCommand;
        result: CaptionsAiVideosCaptionsResponse;
    };
    'captionsai/v1/catalog/caption-templates': {
        params: CaptionsAiCatalogTemplatesCommand;
        result: CaptionsAiCatalogTemplatesResponse;
    };
    'flux/v1/video-upscale': {
        params: FluxVideoUpscaleCommand;
        result: FluxVideoUpscaleResult;
    };
    'elevenlabs/v1/voice-create': {
        params: VoiceCreateCommand;
        result: VoiceCreateResponse;
    };
    'elevenlabs/v1/voice-clone': {
        params: VoiceCloneCommand;
        result: VoiceCloneResponse;
    };
    'elevenlabs/v1/voice-delete': {
        params: VoiceDeleteCommand;
        result: VoiceDeleteResponse;
    };
    'minimax/h3-max/text-to-video': {
        params: TurboTextToVideoHailuo03Input$1;
        result: MinimaxH3MaxTextToVideoResponse;
    };
    'minimax/h3-max/image-to-video': {
        params: TurboImageToVideoHailuo03Input$1;
        result: MinimaxH3MaxImageToVideoResponse;
    };
    'meta/v1/images/generations': {
        params: MetaImagesGenerationsCommand;
        result: MetaImagesGenerationsResponse;
    };
    'meta/v1/images/edits': {
        params: MetaImagesEditsCommand;
        result: MetaImagesEditsResponse;
    };
    'minimax/h3-max/reference-to-video': {
        params: TurboReferenceToVideoHailuo03Input;
        result: MinimaxH3MaxReferenceToVideoResponse;
    };
    'runway/video-effects': {
        params: VideoEffectsCommand;
        result: VideoEffectsResponse;
    };
    'runway/v1/catalog/effects': {
        params: CatalogEffectsCommand;
        result: CatalogEffectsResponse;
    };
    'qwen-image-edit-2511-multiple-angles': {
        params: MultipleAnglesInput;
        result: QwenImageEdit2511MultipleAnglesResponse;
    };
    'minimax/h3-max-turbo/text-to-video': {
        params: TurboTextToVideoHailuo03Input;
        result: MinimaxH3MaxTurboTextToVideoResponse;
    };
    'minimax/h3-max-turbo/image-to-video': {
        params: TurboImageToVideoHailuo03Input;
        result: MinimaxH3MaxTurboImageToVideoResponse;
    };
}

export type { WorkflowTypes };

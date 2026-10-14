/**
 * LLM payload builders.
 *
 * Transforms each model's SDK param values into its vendor workflow's request
 * shape. Builders are typed against the generated per-model `ModelInput` (input)
 * and `@picsart/workflows-types` (output), so both sides are checked — the
 * model-specific `thinking` param is read with full type safety, and the wire
 * payload is validated against the workflow's command type.
 */
import type { WorkflowTypes } from '@picsart/workflows-types';
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './llm.ts';

type ChatParams = WorkflowTypes['chat-completions']['params'];
type ClaudeParams = WorkflowTypes['claude/v1/messages']['params'];
type GeminiParams = WorkflowTypes['gemini']['params'];

const CLAUDE_MAX_TOKENS = 8192;

function inferVideoMime(url: string): string {
  if (/\.webm(\?|$)/i.test(url)) return 'video/webm';
  if (/\.mov(\?|$)/i.test(url)) return 'video/quicktime';
  return 'video/mp4';
}

/** Gemini supports only LOW/HIGH; map medium→LOW, off→omit. */
function geminiThinkingLevel(thinking?: string): 'LOW' | 'HIGH' | undefined {
  if (thinking === 'high') return 'HIGH';
  if (thinking === 'low' || thinking === 'medium') return 'LOW';
  return undefined;
}

// ── OpenAI (chat-completions) — shared by all OpenAI text models ─────
type OpenAiInput = ModelInput<'gpt-5.5'>;

// Upstream gap: @picsart/workflows-types@1.1.150 `ChatCompletionModels` ships
// gpt-6-astra but not the gpt-6 sol/luna tiers or Kimi K3 yet. Widen
// the wire `model` locally until the published union catches up, then drop this.
type ChatModel =
  | ChatParams['model']
  | 'gpt-6-sol'
  | 'gpt-6-luna'
  | 'kimi-k3'
  | 'grok-4.7';
type ChatParamsWide = Omit<ChatParams, 'model'> & { model: ChatModel };

const buildOpenAiPayload = (modelId: ChatModel) => (input: OpenAiInput): ChatParamsWide => {
  const content: ChatParams['messages'][number]['content'] = [{ type: 'text', text: input.prompt }];
  for (const url of input.imageUrls ?? []) {
    content.push({ type: 'image_url', image_url: { url } });
  }
  return {
    model: modelId,
    messages: [{ role: 'user', content }],
    ...(input.thinking && input.thinking !== 'off' ? { reasoning_effort: input.thinking } : {}),
  };
};

// ── Claude (claude/v1/messages) — shared by all Claude text models ──
type ClaudeInput = ModelInput<'claude-opus-4-8'>;

// Upstream gap: @picsart/workflows-types@1.1.167 `ClaudeV1Models` ships
// opus/sonnet 5.5 but not claude-haiku-5-5 yet (the deployed worker's enum
// has it). Widen the wire `model` locally until the published union catches
// up, then drop this.
type ClaudeModel = ClaudeParams['model'] | 'claude-haiku-5-5';
type ClaudeParamsWide = Omit<ClaudeParams, 'model'> & { model: ClaudeModel };

const buildClaudePayload = (modelId: ClaudeModel) => (input: ClaudeInput): ClaudeParamsWide => {
  const content: ClaudeParams['messages'][number]['content'] = [{ type: 'text', text: input.prompt }];
  for (const url of input.imageUrls ?? []) {
    content.push({ type: 'image', source: { type: 'url', url } });
  }
  return {
    model: modelId,
    max_tokens: CLAUDE_MAX_TOKENS,
    messages: [{ role: 'user', content }],
  };
};

// ── Gemini (gemini) — text, image, and video input ──────────────────
type GeminiInput = ModelInput<'gemini-3-pro'>;

// Upstream gap: @picsart/workflows-types@1.1.170 `GeminiModel` ships up to
// gemini-3.8-flash but not gemini-4-argon yet (the deployed worker's enum
// has it). Widen the wire `model` locally until the published union catches
// up, then drop this.
type GeminiModel = GeminiParams['model'] | 'gemini-4-argon';
type GeminiParamsWide = Omit<GeminiParams, 'model'> & { model: GeminiModel };

const buildGeminiPayload = (modelId: GeminiModel) => (input: GeminiInput): GeminiParamsWide => {
  const parts: GeminiParams['contents'][number]['parts'] = [{ text: input.prompt }];
  for (const url of input.imageUrls ?? []) {
    // `type: 'IMAGE'` is required: the gemini worker inlines a part to base64
    // only when the part is tagged IMAGE — an untagged `{ imageUrl }` part is
    // forwarded to Google verbatim and rejected ("required oneof field 'data'").
    parts.push({ type: 'IMAGE', imageUrl: url });
  }
  if (input.videoUrl) {
    parts.push({ fileData: { mimeType: inferVideoMime(input.videoUrl), fileUri: input.videoUrl } });
  }
  const level = geminiThinkingLevel(input.thinking);
  return {
    model: modelId,
    contents: [{ role: 'user', parts }],
    ...(level ? { generationConfig: { thinkingConfig: { thinkingLevel: level } } } : {}),
  };
};

// ── MiniMax H3 Context IR (minimax/v2/h3-context-ir) ─────────────────
// Prompt enhancer: text + optional frame/reference media → enhanced prompt.
// The wire `content[]` carries a text item plus media items tagged with a
// `role`. Frame roles (first/last) and reference roles are mutually exclusive
// (enforced by the model's constraints), so both sets are assembled here and
// the UI/constraints keep only one populated.
type MinimaxH3Input = ModelInput<'minimax-h3-context-ir'>;

type MinimaxContentItem = {
  type: 'text' | 'image_url' | 'video_url' | 'audio_url';
  text?: string;
  image_url?: { url: string };
  video_url?: { url: string };
  audio_url?: { url: string };
  role?: 'first_frame' | 'last_frame' | 'reference_image' | 'reference_video' | 'reference_audio';
};

const buildMinimaxH3ContextIrPayload = (input: MinimaxH3Input) => {
  const content: MinimaxContentItem[] = [{ type: 'text', text: input.prompt }];
  if (input.startFrame) content.push({ type: 'image_url', image_url: { url: input.startFrame }, role: 'first_frame' });
  if (input.endFrame) content.push({ type: 'image_url', image_url: { url: input.endFrame }, role: 'last_frame' });
  for (const url of input.imageUrls ?? []) content.push({ type: 'image_url', image_url: { url }, role: 'reference_image' });
  for (const url of input.videoUrls ?? []) content.push({ type: 'video_url', video_url: { url }, role: 'reference_video' });
  for (const url of input.audioUrls ?? []) content.push({ type: 'audio_url', audio_url: { url }, role: 'reference_audio' });
  // `model` is a single-value identity enum (MiniMax-H3) — hardcoded, not a knob.
  // Return left inferred: `minimax/v2/h3-context-ir` isn't in the installed
  // @picsart/workflows-types@1.1.156 yet (new workflow). Annotate with
  // WorkflowTypes['minimax/v2/h3-context-ir']['params'] once it publishes.
  return {
    model: 'MiniMax-H3' as const,
    content,
    duration: input.duration ?? 5,
    ...(input.aspectRatio ? { ratio: input.aspectRatio } : {}),
  };
};

registerPayloads(MODELS, {
  'minimax-h3-context-ir': buildMinimaxH3ContextIrPayload,
  'claude-fable-5-1': buildClaudePayload('claude-fable-5-1'),
  'claude-fable-5': buildClaudePayload('claude-fable-5'),
  'claude-opus-5': buildClaudePayload('claude-opus-5'),
  'claude-opus-4-8': buildClaudePayload('claude-opus-4-8'),
  'claude-sonnet-5': buildClaudePayload('claude-sonnet-5'),
  'claude-sonnet-4-6': buildClaudePayload('claude-sonnet-4-6'),
  'claude-sonnet-4-5': buildClaudePayload('claude-sonnet-4-5'),
  'claude-haiku-5-5': buildClaudePayload('claude-haiku-5-5'),
  'claude-haiku-4-5': buildClaudePayload('claude-haiku-4-5'),
  'gpt-6-astra': buildOpenAiPayload('gpt-6-astra'),
  'gpt-6-sol': buildOpenAiPayload('gpt-6-sol'),
  'gpt-6-luna': buildOpenAiPayload('gpt-6-luna'),
  'gpt-5.6-sol': buildOpenAiPayload('gpt-5.6-sol'),
  'gpt-5.6-terra': buildOpenAiPayload('gpt-5.6-terra'),
  'gpt-5.6-luna': buildOpenAiPayload('gpt-5.6-luna'),
  'gpt-5.5': buildOpenAiPayload('gpt-5.5'),
  'gpt-5.2': buildOpenAiPayload('gpt-5.2'),
  'gpt-5.1': buildOpenAiPayload('gpt-5.1'),
  'gpt-5': buildOpenAiPayload('gpt-5'),
  'gpt-5-mini': buildOpenAiPayload('gpt-5-mini'),
  'gpt-4o': buildOpenAiPayload('gpt-4o'),
  'gpt-4o-mini': buildOpenAiPayload('gpt-4o-mini'),
  'gpt-4.1-mini': buildOpenAiPayload('gpt-4.1-mini'),
  'gpt-4.1-nano': buildOpenAiPayload('gpt-4.1-nano'),
  'gemini-4-argon': buildGeminiPayload('gemini-4-argon'),
  'gemini-3-pro': buildGeminiPayload('gemini-3-pro-preview'),
  // Flash models route through chat-completions (OpenAI-shaped), not the
  // native `gemini` workflow.
  'gemini-3.8-flash': buildOpenAiPayload('gemini-3.8-flash'),
  'gemini-3.7-flash': buildOpenAiPayload('gemini-3.7-flash'),
  'gemini-3.6-flash': buildOpenAiPayload('gemini-3.6-flash'),
  'gemini-3.5-flash-lite': buildOpenAiPayload('gemini-3.5-flash-lite'),
  'gemini-2.5-flash': buildOpenAiPayload('gemini-2.5-flash'),
  'kimi-k3': buildOpenAiPayload('kimi-k3'),
  'grok-4.7': buildOpenAiPayload('grok-4.7'),
});

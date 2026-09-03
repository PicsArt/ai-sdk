/**
 * LLM text generation — single source of truth.
 *
 * Model configs are pure data; payload transforms live in llm.payloads.ts
 * (typed against the generated per-model ModelInput). Single-shot: text +
 * optional image/video in, text out. Each vendor uses its own native workflow
 * so vendor-specific capabilities aren't lost:
 *
 *  - OpenAI  → `chat-completions`     (reasoning_effort thinking; no native alt)
 *  - Claude  → `claude/v1/messages`   (Anthropic-native; image + system; no thinking knob)
 *  - Gemini  → `gemini`               (text/image/VIDEO input; thinkingLevel)
 *
 * Each model declares its own thinking param inline (vendors differ) — there is
 * no shared `thinking` preset or GenerationContext field.
 *
 * Responses differ per worker (choices / content / candidates, with varied
 * envelopes); parseTextResult()'s extractText() walks all of them.
 */
import type { ModelDefinition } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

const ADDED = '2026-06-16';

/** Inline thinking-level enum for a model: `off` plus the given levels. */
const thinkingParam = (levels: string[]) =>
  p.enum('thinking', ['off', ...levels], 'off', { label: 'Thinking' });

// ── Model definitions ───────────────────────────────────────────────

const { MODELS: ANTHROPIC } = defineModels('anthropic', [
  {
    id: 'claude-opus-4-8', name: 'Claude Opus 4.8',
    workflow: 'claude/v1/messages', addedAt: ADDED, estimatedTime: 10,
    mode: 'text', inputType: 'i2t', badge: ['premium'],
    description: 'Anthropic’s most capable model for complex reasoning and long-form analysis.',
    features: [feat('Vision', 'input')],
    paramConfig: { ...params.prompt(), ...params.imageInput(8, 'Images') },
  },
  {
    id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6',
    workflow: 'claude/v1/messages', addedAt: ADDED, estimatedTime: 6,
    mode: 'text', inputType: 'i2t', badge: ['popular'],
    description: 'Balanced Claude model — strong reasoning at lower latency and cost.',
    features: [feat('Vision', 'input')],
    paramConfig: { ...params.prompt(), ...params.imageInput(8, 'Images') },
  },
  {
    id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5',
    workflow: 'claude/v1/messages', addedAt: ADDED, estimatedTime: 4,
    mode: 'text', inputType: 'i2t', badge: ['fast'],
    description: 'Fast, lightweight Claude model for high-volume text tasks.',
    features: [feat('Vision', 'input')],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(8, 'Images')
    },
  },
]);

const { MODELS: OPENAI_LLM } = defineModels('openai', [
  {
    id: 'gpt-5.5', name: 'GPT-5.5',
    workflow: 'chat-completions', addedAt: ADDED, estimatedTime: 8,
    mode: 'text', inputType: 'i2t', badge: ['popular'],
    description: 'OpenAI’s flagship multimodal model for general-purpose text generation.',
    features: [feat('Vision', 'input'), feat('Thinking', 'characteristic')],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(8, 'Images'),
      ...thinkingParam(['low', 'medium', 'high'])
    },
  },
]);

// Gemini 3 Pro uses the native `gemini` workflow (video input, thinkingLevel).
// The flash models route through the OpenAI-compatible `chat-completions`
// workflow (messages[]/image_url/reasoning_effort) — see buildOpenAiPayload.
const { MODELS: GEMINI_LLM } = defineModels('google', [
  {
    id: 'gemini-3-pro', name: 'Gemini 3 Pro', modelId: 'gemini-3-pro-preview',
    workflow: 'gemini', addedAt: ADDED, estimatedTime: 8,
    mode: 'text', inputType: 'v2t', badge: ['premium'],
    description: 'Google’s top Gemini model — text, image, and video reasoning.',
    features: [feat('Vision', 'input'), feat('Video Input', 'input'), feat('Thinking', 'characteristic')],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(8, 'Images'),
      ...params.videoInput('Video', 'reference', false),
      ...thinkingParam(['low', 'high']),
    },
  },
  {
    id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash',
    workflow: 'chat-completions', addedAt: '2026-09-03', estimatedTime: 5,
    mode: 'text', inputType: 'i2t', badge: ['fast'],
    description: 'Latest fast Gemini model — low-latency multimodal text generation.',
    features: [feat('Vision', 'input'), feat('Thinking', 'characteristic')],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(8, 'Images'),
      ...thinkingParam(['low', 'medium', 'high']),
    },
  },
  {
    id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash',
    workflow: 'chat-completions', addedAt: '2026-08-19', estimatedTime: 5,
    mode: 'text', inputType: 'i2t', badge: ['fast'],
    description: 'Fast Gemini model — low-latency multimodal text generation.',
    features: [feat('Vision', 'input'), feat('Thinking', 'characteristic')],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(8, 'Images'),
      ...thinkingParam(['low', 'medium', 'high']),
    },
  },
  {
    id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash',
    workflow: 'chat-completions', addedAt: '2026-07-22', estimatedTime: 5,
    mode: 'text', inputType: 'i2t', badge: ['fast'],
    description: 'Fast Gemini model — low-latency multimodal text generation.',
    features: [feat('Vision', 'input'), feat('Thinking', 'characteristic')],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(8, 'Images'),
      ...thinkingParam(['low', 'medium', 'high']),
    },
  },
  {
    id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite',
    workflow: 'chat-completions', addedAt: '2026-07-22', estimatedTime: 4,
    mode: 'text', inputType: 'i2t', badge: ['fast'],
    description: 'Lightweight Gemini model — the fastest, most cost-efficient tier.',
    features: [feat('Vision', 'input')],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(8, 'Images'),
    },
  },
]);

export const MODELS: ModelDefinition[] = [...ANTHROPIC, ...OPENAI_LLM, ...GEMINI_LLM];

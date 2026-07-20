/**
 * generateText() tests — fake transport, per-vendor payload assertions.
 *
 * Each vendor uses its own workflow/payload shape (chat-completions, claude/v1/messages,
 * gemini). The mock returns a chat-completions-style envelope; extractText() reads it
 * regardless, so we focus payload assertions per vendor.
 */
import assert from 'node:assert';
import type { WorkflowSubmitRequest } from '../../src/core/workflow.ts';
import { createClient } from '../../src/client/index.ts';

function createMockTransport() {
  return {
    lastExecute: null as { workflow: string; payload: Record<string, unknown> } | null,
    async execute(request: WorkflowSubmitRequest) {
      this.lastExecute = { workflow: request.workflow, payload: request.payload as Record<string, unknown> };
      return {
        status: 'success',
        response: {
          result: {
            id: 'cmpl-1',
            choices: [{ index: 0, message: { role: 'assistant', content: 'Hello from the model.' }, finish_reason: 'stop' }],
            usage: { prompt_tokens: 5, completion_tokens: 4, total_tokens: 9 },
          },
        },
      };
    },
  };
}

const mock = createMockTransport();
const ai = createClient(mock);

// ── Claude → claude/v1/messages: image as {type:'image', source}, max_tokens ─

const claude = await ai.generateText('claude-opus-4-8', { prompt: 'Hi', imageUrls: ['https://x/a.png'] });
assert.strictEqual(claude.text, 'Hello from the model.', 'text extracted');
assert.strictEqual(claude.model, 'claude-opus-4-8');
assert(claude.raw, 'raw present');
{
  const p = mock.lastExecute!.payload;
  assert.strictEqual(mock.lastExecute!.workflow, 'claude/v1/messages');
  assert.strictEqual(p.model, 'claude-opus-4-8');
  assert.strictEqual(typeof p.max_tokens, 'number', 'claude needs max_tokens');
  const content = (p.messages as Array<{ content: Array<Record<string, unknown>> }>)[0].content;
  assert.strictEqual(content[0].text, 'Hi');
  assert.strictEqual(content[1].type, 'image', 'claude image block type');
  assert.deepStrictEqual(content[1].source, { type: 'url', url: 'https://x/a.png' });
}

// ── OpenAI → chat-completions: reasoning_effort + image_url ──────────

await ai.generateText('gpt-5.5', { prompt: 'Solve', thinking: 'high', imageUrls: ['https://x/img.png'] });
{
  const p = mock.lastExecute!.payload;
  assert.strictEqual(mock.lastExecute!.workflow, 'chat-completions');
  assert.strictEqual(p.model, 'gpt-5.5');
  assert.strictEqual(p.reasoning_effort, 'high', 'thinking → reasoning_effort');
  const content = (p.messages as Array<{ content: Array<Record<string, unknown>> }>)[0].content;
  assert.strictEqual(content[1].type, 'image_url');
  assert.deepStrictEqual(content[1].image_url, { url: 'https://x/img.png' });
}

// ── Gemini → gemini: contents/parts, video fileData, thinkingLevel ───

await ai.generateText('gemini-3-pro', { prompt: 'Describe', thinking: 'high', videoUrl: 'https://x/v.mp4' });
{
  const p = mock.lastExecute!.payload;
  assert.strictEqual(mock.lastExecute!.workflow, 'gemini');
  assert.strictEqual(p.model, 'gemini-3-pro-preview', 'backend model id sent');
  const parts = (p.contents as Array<{ parts: Array<Record<string, unknown>> }>)[0].parts;
  assert.strictEqual(parts[0].text, 'Describe');
  assert.deepStrictEqual(parts[1].fileData, { mimeType: 'video/mp4', fileUri: 'https://x/v.mp4' }, 'video as fileData part');
  const gc = p.generationConfig as { thinkingConfig: { thinkingLevel: string } };
  assert.strictEqual(gc.thinkingConfig.thinkingLevel, 'HIGH', 'thinking high → HIGH');
}

// Gemini image parts must carry type:'IMAGE' — the worker only inlines tagged
// parts; an untagged { imageUrl } is forwarded to Google verbatim and 400s.
await ai.generateText('gemini-3-pro', { prompt: 'Describe', imageUrls: ['https://x/a.png'] });
{
  const parts = (mock.lastExecute!.payload.contents as Array<{ parts: Array<Record<string, unknown>> }>)[0].parts;
  assert.deepStrictEqual(parts[1], { type: 'IMAGE', imageUrl: 'https://x/a.png' }, 'image as typed IMAGE part');
}

// thinking 'off' omits config / reasoning_effort
await ai.generateText('gemini-3-pro', { prompt: 'Hi' });
assert.strictEqual(mock.lastExecute!.payload.generationConfig, undefined, 'no thinkingConfig when off');

// ── Cross-guards ─────────────────────────────────────────────────────

await assert.rejects(
  ai.generate('claude-opus-4-8' as never, { prompt: 'x' } as never),
  /text model/,
  'generate() should reject text models',
);
await assert.rejects(
  ai.generateText('flux-2-pro' as never, { prompt: 'x' } as never),
  /not a text model/,
  'generateText() should reject non-text models',
);

console.log('✓ generate-text.test.ts — all passed');

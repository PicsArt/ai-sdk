/**
 * generateText e2e — one real LLM call per vendor through the live backend.
 *
 * Exercises the full text path: resolveModel → prepareRequest (vendor payload
 * builder) → submit/poll → parseTextResult (extractText), one model per vendor
 * (claude/v1/messages, chat-completions, gemini) so all three response envelopes
 * are covered. ⚠ CONSUMES CREDITS.
 *
 * Requires PICSART_TOKEN. Targets staging by default (PICSART_API_URL to override).
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import type { GenerateTextResult } from '../../src/index.ts';
import { createTestClient } from './helpers/ai-sdk-test-client.ts';

let client: ReturnType<typeof createTestClient>;

before(() => {
  client = createTestClient();
});

// generateText() is typed `<M extends TextModelId>`; call through a loose
// signature for the runtime string id.
function generateText(id: string, input: Record<string, unknown>): Promise<GenerateTextResult> {
  return (
    client.generateText as unknown as (m: string, p: Record<string, unknown>) => Promise<GenerateTextResult>
  )(id, input);
}

const MODELS = ['claude-opus-4-8', 'gpt-5.5', 'gemini-3-pro', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];

for (const id of MODELS) {
  test(`${id} — basic generateText`, { timeout: 120_000 }, async () => {
    const result = await generateText(id, { prompt: 'Reply with exactly the word: pong' });

    console.log(`[${id}] -> ${JSON.stringify(result.text).slice(0, 120)}`);

    assert.equal(result.model, id, 'result.model should echo the requested model');
    assert.ok(
      typeof result.text === 'string' && result.text.trim().length > 0,
      `expected non-empty text, got: ${JSON.stringify(result.text)}`,
    );
    assert.ok(result.raw, 'expected raw response payload');
  });
}

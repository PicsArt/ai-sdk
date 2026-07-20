/**
 * extractText() unit tests — covers the LLM response shapes routed through
 * Picsart workflows (Anthropic, OpenAI, Gemini) plus nested wrappers.
 */
import assert from 'node:assert';
import { extractText } from '../../src/core/response.ts';

// Plain string
assert.strictEqual(extractText('hello'), 'hello');

// Flat text field
assert.strictEqual(extractText({ text: 'flat' }), 'flat');
assert.strictEqual(extractText({ output_text: 'resp' }), 'resp');
assert.strictEqual(extractText({ content: 'str-content' }), 'str-content');

// OpenAI / chat-completions — choices[0].message.content
assert.strictEqual(
  extractText({ choices: [{ index: 0, message: { role: 'assistant', content: 'gpt out' }, finish_reason: 'stop' }] }),
  'gpt out',
);

// OpenAI with array content parts
assert.strictEqual(
  extractText({ choices: [{ message: { content: [{ type: 'text', text: 'a' }, { type: 'text', text: 'b' }] } }] }),
  'ab',
);

// Anthropic Messages — content: [{ type: 'text', text }]
assert.strictEqual(
  extractText({ content: [{ type: 'text', text: 'claude ' }, { type: 'text', text: 'out' }] }),
  'claude out',
);

// Gemini — candidates[0].content.parts[0].text
assert.strictEqual(
  extractText({ candidates: [{ content: { parts: [{ text: 'gemini out' }] } }] }),
  'gemini out',
);

// Nested wrapper: { result: { choices: [...] } } (chat-completions ChatCompletionResult)
assert.strictEqual(
  extractText({ result: { choices: [{ message: { content: 'nested' } }] } }),
  'nested',
);

// Nested response wrapper
assert.strictEqual(
  extractText({ response: { result: { choices: [{ message: { content: 'deep' } }] } } }),
  'deep',
);

// No text → undefined
assert.strictEqual(extractText({ url: 'https://x' }), undefined);
assert.strictEqual(extractText(null), undefined);
assert.strictEqual(extractText(42), undefined);

console.log('✓ extract-text.test.ts — all passed');

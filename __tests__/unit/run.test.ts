/**
 * ai.run() tests — the generic model-id executor (the counterpart of
 * ai.apis.run()). One uniform path for every model: paramConfig validation,
 * payload build, workflow execution, outputSchema — and the task result
 * returned as-is in `{ result, status, usage, id }`, with no media-URL or
 * text extraction and no Drive/options injection.
 */
import assert from 'node:assert';
import { createClient } from '../../src/client/index.ts';
import { mockPlatform, FAST_POLL } from './helpers/mock-platform.ts';

// ── Media model — validated + built payload, raw task result back ────

const mediaPlatform = mockPlatform();
const aiMedia = createClient({ apiUrl: 'https://api.test', fetch: mediaPlatform.fetch });

const media = await aiMedia.run('flux-2-pro', { prompt: 'a cat' }, FAST_POLL);
assert.deepStrictEqual(media.result, { url: 'https://cdn.example.com/result.jpg' }, 'task result as-is, not URL-extracted');
assert.strictEqual(media.status, 'COMPLETED');
assert.strictEqual(media.id, 'task-1', 'job id surfaced');
assert.strictEqual(mediaPlatform.calls.submits.at(-1)!.workflow, 'bfl/v1/flux-2', 'model workflow resolved');
assert('prompt' in mediaPlatform.calls.submits.at(-1)!.payload, 'payload built from paramConfig');

// run() skips Drive/options injection — the payload carries no `options`,
// unlike generate() on the same client.
const driveAi = createClient({ apiUrl: 'https://api.test', fetch: mediaPlatform.fetch, drive: { folder: 'AI' } });
await driveAi.run('flux-2-pro', { prompt: 'a cat' }, FAST_POLL);
assert.strictEqual(mediaPlatform.calls.submits.at(-1)!.payload.options, undefined, 'no options injection on run()');
await driveAi.generate('flux-2-pro', { prompt: 'a cat' }, FAST_POLL);
assert(mediaPlatform.calls.submits.at(-1)!.payload.options, 'generate() still injects options');

// Input validation applies — a missing required param rejects before submit.
await assert.rejects(
  aiMedia.run('flux-2-pro', {} as never, FAST_POLL),
  /"prompt" is required/,
  'paramConfig validation enforced',
);

// ── Text model — raw vendor envelope, no extractText ─────────────────

const textPlatform = mockPlatform({
  status: () => ({
    status: 'COMPLETED',
    result: { choices: [{ index: 0, message: { role: 'assistant', content: 'Hi.' }, finish_reason: 'stop' }] },
    usage: { toolId: 'gpt-5.5', credits: 1 },
  }),
});
const aiText = createClient({ apiUrl: 'https://api.test', fetch: textPlatform.fetch });

const text = await aiText.run('gpt-5.5', { prompt: 'Hello' }, FAST_POLL);
const choices = (text.result as { choices: Array<{ message: { content: string } }> }).choices;
assert.strictEqual(choices[0].message.content, 'Hi.', 'vendor envelope returned untouched');
assert.strictEqual(text.usage!.credits, 1, 'platform usage surfaced');
assert.strictEqual(textPlatform.calls.submits.at(-1)!.workflow, 'chat-completions');

console.log('✓ run.test.ts — all passed');

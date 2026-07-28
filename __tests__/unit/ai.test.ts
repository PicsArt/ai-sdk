import assert from 'node:assert';
import type { WorkflowSubmitRequest } from '../../src/core/workflow.ts';
import { createClient, ApiRunMode } from '../../src/client/index.ts';

// ── Mock transport ───────────────────────────────────────────────────

function createMockTransport() {
  return {
    lastSubmit: null as { workflow: string; payload: unknown } | null,
    async submit(request: WorkflowSubmitRequest) {
      this.lastSubmit = { workflow: request.workflow, payload: request.payload };
      return { workflow: request.workflow, id: 'mock-123' };
    },
    async status() {
      return { status: 'COMPLETED', result: { url: 'https://cdn.example.com/result.jpg' } };
    },
    async execute(request: WorkflowSubmitRequest) {
      this.lastSubmit = { workflow: request.workflow, payload: request.payload };
      return { status: 'COMPLETED', result: { url: 'https://cdn.example.com/sync.jpg' } };
    },
    async options() { return 5; },
  };
}

// ── Create client with mock transport ────────────────────────────────

const mockTransport = createMockTransport();
const ai = createClient(mockTransport);

// ── Test: generate() with string model ID ───────────────────────────

const genResult = await ai.generate('flux-2-pro', { prompt: 'A beautiful sunset' });
assert(genResult, 'generate should return a result');
assert(typeof genResult.url === 'string', `result.url should be a string, got ${typeof genResult.url}`);
assert(typeof genResult.model === 'string', 'result.model should be a string');
assert(genResult.handle, 'result should include a handle');
assert(genResult.handle.id, 'handle should have an id');
assert(mockTransport.lastSubmit, 'transport should have been called');
assert(mockTransport.lastSubmit!.workflow, 'workflow should be set');

// ── Test: getCredits() with string model ID ─────────────────────────

const creditsResult = await ai.getCredits('flux-2-pro', { prompt: 'A cat' });
assert(typeof creditsResult === 'number', `getCredits should return a number, got ${typeof creditsResult}`);
assert.strictEqual(creditsResult, 5, 'getCredits should return 5 from mock options');

// getCredits normalizes count to 1
const creditsWithCount = await ai.getCredits('flux-2-pro', { prompt: 'A cat', count: 4 });
assert.strictEqual(creditsWithCount, 5, 'getCredits with count>1 should still return single-unit price');

// ── Test: submit() with string model ID ─────────────────────────────

const handle = await ai.submit('flux-2-pro', { prompt: 'A cat on mars' });
assert(handle, 'submit should return a handle');
assert(typeof handle.workflow === 'string', 'handle.workflow should be a string');
assert(typeof handle.id === 'string', 'handle.id should be a string');

// ── Test: status() ───────────────────────────────────────────────────

const statusResult = await ai.status(handle);
assert(statusResult, 'status should return a result');
assert.strictEqual(statusResult.status, 'COMPLETED');

// ── Test: result() with string model ID ─────────────────────────────

const resultFromHandle = await ai.result(handle, 'flux-2-pro');
assert(resultFromHandle, 'result should return a GenerateResult');
assert(typeof resultFromHandle.url === 'string', 'result.url should be a string');
assert.strictEqual(resultFromHandle.model, 'flux-2-pro');

// ── Test: unknown model throws ──────────────────────────────────────

await assert.rejects(
  ai.generate('nonexistent-model' as never, { prompt: 'test' } as never),
  /Unknown model/,
);

// ── Test: subscribe() ────────────────────────────────────────────────

// subscribe() returns an async generator — verify it's iterable
const sub = ai.subscribe(handle);
assert(sub, 'subscribe should return an async generator');
assert(typeof sub[Symbol.asyncIterator] === 'function', 'should be async iterable');

// ── Test: runWorkflow() (legacy — built-in engine, returns the unwrapped result) ──

const rawResult = await ai.runWorkflow<{ url: string }>(
  'media-platform/v1/videos/edit',
  { videoUrl: 'https://example.com/video.mp4' },
);
assert.strictEqual(rawResult.url, 'https://cdn.example.com/result.jpg', 'runWorkflow returns the unwrapped result');

// ── Test: ai.apis.run() — goes through WorkflowsClient (needs a ClientConfig) ──

const apisClient = createClient({
  apiUrl: 'https://api.test',
  fetch: async () => new Response(
    JSON.stringify({ status: 'success', response: { result: { url: 'https://cdn.example.com/apis.mp4' } } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  ),
});
const apisResult = await apisClient.apis.run(
  'media-platform/v1/videos/edit',
  { videoUrl: 'https://example.com/video.mp4' },
  { mode: ApiRunMode.SYNC },
);
assert.strictEqual((apisResult.result as { url: string }).url, 'https://cdn.example.com/apis.mp4', 'apis.run result url');

// \u2500\u2500 Test: apiKey config builds an authenticated fetch (Authorization: Bearer) \u2500\u2500

const originalFetch = globalThis.fetch;
let capturedHeaders: Headers | null = null;
globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
  capturedHeaders = new Headers(init?.headers);
  return new Response(
    JSON.stringify({ status: 'success', response: { result: { ok: true } } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}) as typeof globalThis.fetch;

try {
  // A leading "Bearer " is stripped so it isn't doubled in the header.
  const keyClient = createClient({ apiUrl: 'https://api.test', apiKey: 'Bearer secret-key' });
  await keyClient.apis.run('media-platform/v1/videos/edit', { x: 1 }, { mode: ApiRunMode.SYNC });
  const sent = capturedHeaders as Headers | null;
  assert(sent, 'apiKey fetch should have been called');
  assert.strictEqual(sent.get('Authorization'), 'Bearer secret-key', 'apiKey should send Authorization: Bearer <key>');
  // The gateway rejects requests without these, so the apiKey fetch defaults them.
  assert.strictEqual(sent.get('platform'), 'api', 'apiKey should default platform: api');
  assert.strictEqual(sent.get('X-Touchpoint'), 'sdk', 'apiKey should default X-Touchpoint: sdk');
} finally {
  globalThis.fetch = originalFetch;
}

// \u2500\u2500 Test: execute-only transport (no submit/status) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function createExecuteOnlyTransport() {
  return {
    lastExecute: null as { workflow: string } | null,
    async execute(request: WorkflowSubmitRequest) {
      this.lastExecute = { workflow: request.workflow };
      return { status: 'COMPLETED', result: { url: 'https://cdn.example.com/exec-only.jpg' } };
    },
  };
}

const execOnly = createExecuteOnlyTransport();
const aiExec = createClient(execOnly);

// generate() routes through execute even for a non-syncExecute model
const execGen = await aiExec.generate('flux-2-pro', { prompt: 'via execute only' });
assert(typeof execGen.url === 'string', 'execute-only generate should return a url');
assert(execOnly.lastExecute, 'execute-only transport.execute should have been called');

// async lifecycle methods throw a clear error on an execute-only transport
await assert.rejects(
  aiExec.submit('flux-2-pro', { prompt: 'x' }),
  /does not support submit/,
  'submit should throw on execute-only transport',
);
await assert.rejects(
  aiExec.status({ workflow: 'flux-2-pro', id: 'sync' }),
  /does not support status/,
  'status should throw on execute-only transport',
);

console.log('\u2713 ai.test.ts \u2014 all passed');

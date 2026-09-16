import assert from 'node:assert';
import { createClient, ApiRunMode, GenerationEventType } from '../../src/client/index.ts';
import { ApiError } from '../../src/core/errors.ts';
import { mockPlatform, FAST_POLL } from './helpers/mock-platform.ts';

// ── Create client against the mock platform (fetch-level seam) ────────

const platform = mockPlatform();
const ai = createClient({ apiUrl: 'https://api.test', fetch: platform.fetch });

// ── Test: generate() with string model ID ───────────────────────────

const genResult = await ai.generate('flux-2-pro', { prompt: 'A beautiful sunset' }, FAST_POLL);
assert(genResult, 'generate should return a result');
assert(genResult.items.length === 1, 'single-result model should return one item');
assert(typeof genResult.items[0].url === 'string', `items[0].url should be a string, got ${typeof genResult.items[0].url}`);
assert.strictEqual(genResult.url, genResult.items[0].url, 'result.url should shortcut items[0].url');
assert.strictEqual(genResult.results, genResult.items, 'deprecated results should alias items');
assert(typeof genResult.generationId === 'string' && genResult.generationId.length > 0, 'result should carry the generation id');
assert(platform.calls.submits.length > 0, 'the platform submit route should have been called');
assert(platform.calls.submits[0].workflow, 'workflow should be set');

// ── Test: getCredits() with string model ID ─────────────────────────

const creditsResult = await ai.getCredits('flux-2-pro', { prompt: 'A cat' });
assert(typeof creditsResult === 'number', `getCredits should return a number, got ${typeof creditsResult}`);
assert.strictEqual(creditsResult, 5, 'getCredits should return 5 from the mock options route');

// getCredits normalizes count to 1
const creditsWithCount = await ai.getCredits('flux-2-pro', { prompt: 'A cat', count: 4 });
assert.strictEqual(creditsWithCount, 5, 'getCredits with count>1 should still return single-unit price');

// ── Test: submit() with string model ID ─────────────────────────────

const generationId = await ai.submit('flux-2-pro', { prompt: 'A cat on mars' });
assert(typeof generationId === 'string' && generationId.length > 0, 'submit should return the generation id string');

// ── Test: one-shot snapshot via subscribe().next() ───────────────────

const { value: snapshot } = await ai.subscribe('flux-2-pro', generationId, FAST_POLL).next();
assert(snapshot, 'subscribe().next() should yield an event');
assert.strictEqual(snapshot!.type, 'generation.completed');
assert.strictEqual(snapshot!.type, GenerationEventType.Completed, 'const object matches the literal');

// ── Test: result() with string model ID ─────────────────────────────

const resultFromId = await ai.result('flux-2-pro', generationId, FAST_POLL);
assert(resultFromId, 'result should return a GenerateResult');
assert(typeof resultFromId.items[0].url === 'string', 'items[0].url should be a string');
assert.strictEqual(resultFromId.url, resultFromId.items[0].url, 'url should shortcut items[0].url');
assert.strictEqual(resultFromId.generationId, generationId, 'result echoes the generation id');

// ── Test: unknown model throws ──────────────────────────────────────

await assert.rejects(
  ai.generate('nonexistent-model' as never, { prompt: 'test' } as never),
  /Unknown model/,
);

// ── Test: subscribe() ────────────────────────────────────────────────

// subscribe() returns an async generator — verify it's iterable
const sub = ai.subscribe('flux-2-pro', generationId, FAST_POLL);
assert(sub, 'subscribe should return an async generator');
assert(typeof sub[Symbol.asyncIterator] === 'function', 'should be async iterable');

// The terminal generation.completed event carries the parsed GenerateResult —
// no follow-up result() call needed.
let lastEvent;
for await (const e of ai.subscribe('flux-2-pro', generationId, FAST_POLL)) lastEvent = e;
assert(lastEvent, 'subscribe should yield at least one event');
assert.strictEqual(lastEvent!.type, 'generation.completed');
if (lastEvent!.type === 'generation.completed') {
  assert.strictEqual(lastEvent!.result.items[0].url, 'https://cdn.example.com/result.jpg');
  assert.strictEqual(lastEvent!.result.url, 'https://cdn.example.com/result.jpg');
}

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

// ── Test: apiKey config builds an authenticated fetch (Authorization: Bearer) ──

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

// ── Test: syncExecute models run through the /execute route ──────────

const syncPlatform = mockPlatform({
  execute: () => ({ url: 'https://cdn.example.com/exec-only.jpg' }),
});
const aiSync = createClient({ apiUrl: 'https://api.test', fetch: syncPlatform.fetch });
const syncGen = await aiSync.generate('picsart-change-bg', {
  prompt: 'via sync execute',
  imageUrls: ['https://cdn.example.com/in.png'],
});
assert.strictEqual(syncGen.items[0].url, 'https://cdn.example.com/exec-only.jpg', 'sync generate should return the execute result url');
assert.strictEqual(syncGen.generationId, undefined, 'sync generations carry no generation id (nothing to poll)');
assert.strictEqual(syncPlatform.calls.executes.length, 1, 'the /execute route should have been called');
assert.strictEqual(syncPlatform.calls.submits.length, 0, 'sync models never touch /submit');

// ── Test: usage — platform credit usage surfaced on results ──────────

const mockUsage = {
  toolId: 'flux-2-pro',
  credits: 5,
  balance: 995,
  details: [
    { operationId: 'op-1', toolId: 'flux-2-pro', price: 0.05, amount: 1, credits: 5 },
  ],
};

const usagePlatform = mockPlatform({
  status: () => ({
    status: 'COMPLETED',
    result: { url: 'https://cdn.example.com/usage.jpg' },
    usage: mockUsage,
  }),
});
const aiUsage = createClient({ apiUrl: 'https://api.test', fetch: usagePlatform.fetch });
const usageGen = await aiUsage.generate('flux-2-pro', { prompt: 'with usage' }, FAST_POLL);
assert(usageGen.usage, 'generate should surface usage from the response');
assert.strictEqual(usageGen.usage!.credits, 5, 'credits surfaced');
assert.strictEqual(usageGen.usage!.toolId, 'flux-2-pro', 'toolId surfaced');
assert.strictEqual(usageGen.usage!.balance, 995, 'balance surfaced');
assert.strictEqual(usageGen.usage!.details!.length, 1);
assert.strictEqual(usageGen.usage!.details![0].credits, 5);
assert.strictEqual(usageGen.usage!.details![0].operationId, 'op-1');

// the terminal subscribe event carries usage inside the parsed result
const usageId = await aiUsage.submit('flux-2-pro', { prompt: 'x' });
const { value: usageSnap } = await aiUsage.subscribe('flux-2-pro', usageId, FAST_POLL).next();
const usageEvent = usageSnap!;
assert(usageEvent.type === 'generation.completed' && usageEvent.result.usage,
  'the completed event result should surface usage from the response');

// no usage on the response → field stays undefined
assert.strictEqual(genResult.usage, undefined, 'usage should be undefined when the response has none');

// ── Test: subscribe() — a FAILED task arrives as a generation.failed event ──
// The platform resolves failed tasks as HTTP 200 with the FailedResult payload
// in `result` (message/reason/statusCode) — pa-pluggable-api-adapter contract.

const failedPlatform = mockPlatform({
  status: () => ({
    status: 'FAILED',
    result: { message: 'boom', reason: 'quota_exceeded', statusCode: 429 },
  }),
});
const aiFailed = createClient({ apiUrl: 'https://api.test', fetch: failedPlatform.fetch });
const failedEvents = [];
for await (const e of aiFailed.subscribe('flux-2-pro', 't1', FAST_POLL)) failedEvents.push(e);
assert.strictEqual(failedEvents.length, 1, 'FAILED: one terminal event');
const failedEvent = failedEvents[0];
assert.strictEqual(failedEvent.type, 'generation.failed', 'FAILED: surfaced as a failed event');
if (failedEvent.type === 'generation.failed') {
  assert(failedEvent.error instanceof ApiError, 'FAILED: event carries an ApiError');
  assert(failedEvent.error.message.includes('boom'), 'FAILED: error message surfaced');
  assert.strictEqual(failedEvent.error.code, 'quota_exceeded', 'platform reason carried into the event');
  assert.strictEqual(failedEvent.error.status, 429, 'platform statusCode carried into the event');
}

// result() throws the same ApiError for the same failed task
const failedErr = await aiFailed.result('flux-2-pro', 't1', FAST_POLL).then(
  () => null,
  (err: ApiError) => err,
);
assert(failedErr instanceof ApiError, 'result() should throw an ApiError for a FAILED task');
assert.strictEqual(failedErr!.code, 'quota_exceeded');
assert.strictEqual(failedErr!.status, 429);

// ── Test: subscribe() — multi-poll sequence, result only on terminal ──

const stagedPlatform = mockPlatform({
  status: (_wf, _id, poll) => poll < 3
    ? { status: 'IN_PROGRESS', progress: { percent: poll * 40 } }
    : { status: 'COMPLETED', result: { url: 'https://cdn.example.com/done.png' } },
});
const aiStaged = createClient({ apiUrl: 'https://api.test', fetch: stagedPlatform.fetch });
const stagedEvents = [];
for await (const e of aiStaged.subscribe('kling-t2a', 's1', FAST_POLL)) {
  stagedEvents.push(e);
}
assert.strictEqual(stagedEvents.length, 3, 'two progress polls + terminal = 3 events');
assert(stagedEvents[0].type === 'generation.progress' && stagedEvents[0].progress?.percent === 40,
  'progress surfaced on intermediate events');
assert(stagedEvents[1].type === 'generation.progress' && stagedEvents[1].progress?.percent === 80);
assert.strictEqual(stagedEvents[2].type, 'generation.completed');
assert(stagedEvents[2].type === 'generation.completed'
  && stagedEvents[2].result.items[0].url === 'https://cdn.example.com/done.png');

// ── Test: breaking out of subscribe() stops the background polling ────

const breakPlatform = mockPlatform({
  status: (_wf, _id, poll) => ({ status: 'IN_PROGRESS', progress: { percent: poll } }),
});
const aiBreak = createClient({ apiUrl: 'https://api.test', fetch: breakPlatform.fetch });
for await (const e of aiBreak.subscribe('kling-t2a', 'b1', FAST_POLL)) {
  if (e.type === 'generation.progress') break; // consumer walks away mid-job
}
const pollsAtBreak = breakPlatform.calls.polls;
await new Promise((r) => setTimeout(r, 50));
assert.ok(
  breakPlatform.calls.polls - pollsAtBreak <= 1,
  `polling must stop after the consumer breaks (was ${pollsAtBreak}, now ${breakPlatform.calls.polls})`,
);

// ── Test: per-call poll overrides reach the poll loop ────────────────
// kling-t2a has no editWorkflow, so no edit-route probe skews the poll count.

const slowPlatform = mockPlatform({
  status: () => ({ status: 'IN_PROGRESS' }),
});
const aiSlow = createClient({ apiUrl: 'https://api.test', fetch: slowPlatform.fetch });
await assert.rejects(
  aiSlow.result('kling-t2a', 'p1', { intervalMs: 0, maxAttempts: 3 }),
  /Timed out/,
  'result should time out after maxAttempts',
);
assert.strictEqual(slowPlatform.calls.polls, 3, 'per-call maxAttempts should cap the poll count');

// ── Test: an aborted signal never reaches /submit (no billable job) ───

const abortPlatform = mockPlatform();
const aiAbort = createClient({ apiUrl: 'https://api.test', fetch: abortPlatform.fetch });
const preAborted = new AbortController();
preAborted.abort();
await assert.rejects(
  aiAbort.submit('flux-2-pro', { prompt: 'x' }, { signal: preAborted.signal }),
  (err: ApiError) => err.status === 499 && err.code === 'aborted',
  'submit with an aborted signal rejects 499/aborted',
);
await assert.rejects(
  aiAbort.generate('flux-2-pro', { prompt: 'x' }, { signal: preAborted.signal }),
  (err: ApiError) => err.status === 499 && err.code === 'aborted',
  'generate with an aborted signal rejects 499/aborted',
);
assert.strictEqual(abortPlatform.calls.submits.length, 0, 'no submit request leaves the process');

// ── Test: a failing edit-route probe surfaces as generation.failed ────
// kling-v3 has an editWorkflow, so subscribe() probes the primary status
// route first; a non-404 failure there must become an event, not a throw.

let probeCalls = 0;
const probeFail = mockPlatform();
const probeFetch: typeof probeFail.fetch = async (url, init) => {
  if (String(url).endsWith('/result') && ++probeCalls === 1) {
    return new Response(JSON.stringify({ status: 'error', reason: 'server_error', message: 'boom' }), { status: 500 });
  }
  return probeFail.fetch(url, init);
};
const aiProbe = createClient({ apiUrl: 'https://api.test', fetch: probeFetch });
const probeEvents = [];
for await (const e of aiProbe.subscribe('kling-v3', 'probe-1', FAST_POLL)) probeEvents.push(e);
assert.strictEqual(probeEvents.length, 1, 'probe failure: one terminal event');
assert.strictEqual(probeEvents[0].type, 'generation.failed', 'probe failure surfaces as an event');
if (probeEvents[0].type === 'generation.failed') {
  assert.strictEqual(probeEvents[0].error.status, 500, 'probe failure carries the HTTP status');
}

// ── Test: submit()/result()/subscribe() reject text models ───────────
// Text models have no async lifecycle — submit() rejects them up front so
// no id can exist that result()/subscribe() would then refuse.

await assert.rejects(
  ai.submit('claude-opus-4-8' as never, { prompt: 'x' } as never),
  /text model/,
  'submit() should reject text models',
);
await assert.rejects(
  ai.result('claude-opus-4-8' as never, '1'),
  /text model/,
  'result() should reject text models',
);
assert.throws(
  () => ai.subscribe('claude-opus-4-8' as never, '1'),
  /text model/,
  'subscribe() should reject text models',
);

// ── Test: items[].metadata — only actionable fields, nothing speculative ──

// Vendor extras (seed, safety flags, dimensions) are NOT promoted: no consumer
// acts on them, and every survivor in GenerateResultItemMetadata must be one a
// consumer feeds back into a flow.
const metaPlatform = mockPlatform({
  status: () => ({
    status: 'COMPLETED',
    result: {
      seed: 42,
      has_nsfw_concepts: [false, true],
      images: [
        { url: 'https://x/1.png', width: 1024, height: 768, content_type: 'image/png' },
        { url: 'https://x/2.png' },
      ],
    },
  }),
});
const metaGen = await createClient({ apiUrl: 'https://api.test', fetch: metaPlatform.fetch })
  .generate('flux-2-pro', { prompt: 'meta' }, FAST_POLL);
assert.strictEqual(metaGen.items.length, 2, 'images[] with 2 entries fans out to 2 items');
assert.strictEqual(metaGen.items[0].metadata, undefined, 'vendor extras are not promoted into metadata');
assert.strictEqual(metaGen.items[1].metadata, undefined);

// The seedance last frame (returnLastFrame) IS promoted — frame-chaining flows
// feed it back as the next generation's startFrame.
const lastFramePlatform = mockPlatform({
  status: () => ({
    status: 'COMPLETED',
    result: { video_url: 'https://x/v.mp4', last_frame_url: 'https://x/last.png' },
  }),
});
const lastFrameGen = await createClient({ apiUrl: 'https://api.test', fetch: lastFramePlatform.fetch })
  .generate('seedance-2.5', { prompt: 'chain me' }, FAST_POLL);
assert.strictEqual(lastFrameGen.items[0].url, 'https://x/v.mp4');
assert.deepStrictEqual(
  lastFrameGen.items[0].metadata,
  { lastFrameUrl: 'https://x/last.png' },
  'last_frame_url promoted to metadata.lastFrameUrl',
);

// ── Test: multi-image fan-out (async and sync-execute paths) ──────────

const multiPlatform = mockPlatform({
  status: () => ({
    status: 'COMPLETED',
    result: { images: [{ url: 'https://x/1.png' }, { url: 'https://x/2.png' }, { url: 'https://x/3.png' }] },
  }),
});
const fanned = await createClient({ apiUrl: 'https://api.test', fetch: multiPlatform.fetch })
  .generate('flux-2-pro', { prompt: 'fan out' }, FAST_POLL);
assert.strictEqual(fanned.items.length, 3, 'multi-image results fan out into items');
assert.deepStrictEqual(fanned.items.map(i => i.url), ['https://x/1.png', 'https://x/2.png', 'https://x/3.png']);

const syncMulti = mockPlatform({
  execute: () => ({ images: ['https://x/a.png', 'https://x/b.png'] }),
});
const fannedStrings = await createClient({ apiUrl: 'https://api.test', fetch: syncMulti.fetch })
  .generate('picsart-change-bg', { prompt: 'string urls', imageUrls: ['https://x/in.png'] });
assert.strictEqual(fannedStrings.items.length, 2, 'sync string-entry images[] fan out too');
assert.strictEqual(fannedStrings.items[1].url, 'https://x/b.png');

console.log('✓ ai.test.ts — all passed');

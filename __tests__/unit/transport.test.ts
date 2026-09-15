/**
 * The transport seam — `createClient({ transport })`.
 *
 * Covers what a custom transport is asked to do (execute / submit / poll /
 * status / options), what the client does when it can only do some of it, and
 * the config rules that change once the caller owns the wire.
 */
import assert from 'node:assert';
import { createClient } from '../../src/client/index.ts';
import { ApiError } from '../../src/core/errors.ts';
import type {
  SdkTransport,
  TransportPollOptions,
  WorkflowJobHandle,
  WorkflowSubmitRequest,
} from '../../src/core/workflow.ts';

const caught = async (fn: () => Promise<unknown>, label: string): Promise<ApiError> => {
  try {
    await fn();
  } catch (err) {
    assert(err instanceof ApiError, `${label}: expected an ApiError, got ${String(err)}`);
    return err;
  }
  throw new Error(`${label}: expected a rejection`);
};

// ── A full transport serves the whole lifecycle ──────────────────────

interface Call { method: string; workflow: string }

function recordingTransport() {
  const calls: Call[] = [];
  let polls = 0;
  const transport: SdkTransport = {
    async execute(request: WorkflowSubmitRequest) {
      calls.push({ method: 'execute', workflow: request.workflow });
      return { result: { url: 'https://cdn.test/sync.png' }, usage: { credits: 3 } };
    },
    async submit(request: WorkflowSubmitRequest) {
      calls.push({ method: 'submit', workflow: request.workflow });
      return 'job-42';
    },
    async poll(handle: WorkflowJobHandle, options?: TransportPollOptions) {
      calls.push({ method: 'poll', workflow: handle.workflow });
      polls++;
      options?.onProgress?.({ percent: 50 });
      return { result: { url: 'https://cdn.test/async.png' }, usage: { credits: 7 } };
    },
    async status(handle: WorkflowJobHandle) {
      calls.push({ method: 'status', workflow: handle.workflow });
      return { result: { status: 'IN_PROGRESS' } };
    },
    async options(workflow: string) {
      calls.push({ method: 'options', workflow });
      return 12;
    },
  };
  return { transport, calls, pollCount: () => polls };
}

{
  const { transport, calls } = recordingTransport();
  // No apiUrl, no apiKey, no fetch: the transport owns the wire.
  const ai = createClient({ transport });

  const generated = await ai.generate('flux-2-pro', { prompt: 'a cat' });
  assert.strictEqual(generated.url, 'https://cdn.test/async.png', 'generate rides submit + poll');
  assert.strictEqual(generated.generationId, 'job-42');
  assert.deepStrictEqual(generated.usage, { credits: 7 }, 'usage comes off the poll result');
  assert.deepStrictEqual(
    calls.map(c => c.method),
    ['submit', 'poll'],
    'generate uses the async pair when the transport has one',
  );

  const credits = await ai.getCredits('flux-2-pro', { prompt: 'a cat' });
  assert.strictEqual(credits, 12, 'getCredits reads the transport options() call');

  const id = await ai.submit('flux-2-pro', { prompt: 'a cat' });
  assert.strictEqual(id, 'job-42');

  const events: string[] = [];
  let percent: number | undefined;
  for await (const e of ai.subscribe('flux-2-pro', id)) {
    events.push(e.type);
    if (e.type === 'generation.progress') percent = e.progress?.percent;
  }
  assert.deepStrictEqual(events, ['generation.progress', 'generation.completed'], 'onProgress reaches subscribe');
  assert.strictEqual(percent, 50);

  const polled = await ai.result('flux-2-pro', id);
  assert.strictEqual(polled.url, 'https://cdn.test/async.png');
}

// ── syncExecute models still take execute() ──────────────────────────

{
  const { transport, calls } = recordingTransport();
  const ai = createClient({ transport });
  const sync = await ai.generate('picsart-sana-sprint-v1', { prompt: 'a cat' });
  assert.strictEqual(sync.url, 'https://cdn.test/sync.png');
  assert.strictEqual(sync.generationId, undefined, 'a sync execution has no job to poll');
  assert.deepStrictEqual(calls.map(c => c.method), ['execute']);
}

// ── An execute-only transport: generate falls back to execute ────────

{
  const executed: WorkflowSubmitRequest[] = [];
  const executeOnly: SdkTransport = {
    async execute(request) {
      executed.push(request);
      return { result: { url: 'https://cdn.test/only.png' } };
    },
  };
  const ai = createClient({ transport: executeOnly });

  const generated = await ai.generate('flux-2-pro', { prompt: 'a cat' });
  assert.strictEqual(generated.url, 'https://cdn.test/only.png', 'async models run through execute()');
  assert.strictEqual(executed.length, 1);
  assert.strictEqual(generated.generationId, undefined, 'nothing was submitted, so there is no id');

  const text = await createClient({ transport: {
    async execute() { return { result: { text: 'hello' } }; },
  } }).generateText('claude-opus-5', { prompt: 'hi' });
  assert.strictEqual(text.text, 'hello', 'generateText runs through execute() too');

  // The async lifecycle says so instead of pretending.
  const noSubmit = await caught(() => ai.submit('flux-2-pro', { prompt: 'a cat' }), 'submit');
  assert.strictEqual(noSubmit.status, 400);
  assert.strictEqual(noSubmit.code, 'unsupported_transport');
  assert.strictEqual(noSubmit.message, 'Transport does not support submit (execute-only transport)');

  const noPoll = await caught(() => ai.result('flux-2-pro', 'job-1'), 'result');
  assert.strictEqual(noPoll.code, 'unsupported_transport');

  // subscribe() rejects eagerly — a transport that cannot poll is a config
  // error, not a generation that failed.
  assert.throws(() => ai.subscribe('flux-2-pro', 'job-1'), (err: unknown) =>
    err instanceof ApiError && err.code === 'unsupported_transport');

  // Pricing is optional too: no options() means "unknown", not a failure.
  assert.strictEqual(await ai.getCredits('flux-2-pro', { prompt: 'a cat' }), null);
}

// ── A transport that can submit but not poll is refused up front ─────

{
  let submitted = 0;
  const ai = createClient({ transport: {
    async execute() { return { result: { url: 'https://cdn.test/only.png' } }; },
    async submit() { submitted++; return 'job-1'; },
  } });
  const err = await caught(() => ai.submit('flux-2-pro', { prompt: 'a cat' }), 'submit without poll');
  assert.strictEqual(err.code, 'unsupported_transport');
  assert.match(err.message, /polling/, 'the missing half is named');
  assert.strictEqual(submitted, 0, 'no billable job is created for a result nobody could read back');

  // generate() still works — it falls back to execute().
  const generated = await ai.generate('flux-2-pro', { prompt: 'a cat' });
  assert.strictEqual(generated.url, 'https://cdn.test/only.png');
}

// ── The edit-route probe rides on status() ───────────────────────────

{
  // kling-v3 has an edit workflow, so a bare id is probed on the primary route
  // first; a 404 there means the job was submitted on the edit route.
  const probed: string[] = [];
  const ai = createClient({ transport: {
    async execute() { return {}; },
    async submit() { return 'job-1'; },
    async poll(handle) {
      probed.push(`poll:${handle.workflow}`);
      return { result: { url: 'https://cdn.test/edit.mp4' } };
    },
    async status(handle) {
      probed.push(`status:${handle.workflow}`);
      throw new ApiError('not found', { status: 404, code: 'not_found' });
    },
  } });
  const res = await ai.result('kling-v3', 'job-1');
  assert.strictEqual(res.url, 'https://cdn.test/edit.mp4');
  assert.strictEqual(probed.length, 2);
  assert.match(probed[0], /^status:/);
  assert.notStrictEqual(probed[1], `poll:${probed[0].slice('status:'.length)}`, 'a 404 reroutes to the edit workflow');
}

// ── The built-in transport probes the edit route the same way ────────

{
  // Same probe, end to end on the default transport: the single-shot result
  // read 404s on the primary route, so the job is polled on the edit one.
  const paths: string[] = [];
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const ai = createClient({
    apiUrl: 'https://api.test',
    fetch: async (url) => {
      const path = new URL(url).pathname;
      paths.push(path);
      if (path.startsWith('/workflows/kling-text-to-video/')) {
        return json(404, { status: 'error', reason: 'not_found', message: 'no such task' });
      }
      return json(200, {
        status: 'success',
        response: { id: 'job-1', status: 'COMPLETED', result: { url: 'https://cdn.test/edit.mp4' } },
      });
    },
  });
  const res = await ai.result('kling-v3', 'job-1', { intervalMs: 1 });
  assert.strictEqual(res.url, 'https://cdn.test/edit.mp4');
  assert.deepStrictEqual(paths, [
    '/workflows/kling-text-to-video/job-1/result',
    '/workflows/kling-image-to-video/job-1/result',
  ]);
}

// ── Transport failures map onto the ApiError contract ────────────────

{
  const ai = createClient({ transport: {
    async execute() { throw new ApiError('blocked', { status: 422, code: 'content_moderation' }); },
    async submit() { throw new ApiError('blocked', { status: 422, code: 'content_moderation' }); },
    async poll() { return {}; },
  } });
  const err = await caught(() => ai.generate('flux-2-pro', { prompt: 'a cat' }), 'ApiError passthrough');
  assert.strictEqual(err.status, 422);
  assert.strictEqual(err.code, 'content_moderation');

  // Anything that isn't an ApiError still reaches the caller as one.
  const rough = createClient({ transport: {
    async execute() { throw new Error('socket hang up'); },
    async submit() { throw new Error('socket hang up'); },
    async poll() { return {}; },
  } });
  const wrapped = await caught(() => rough.generate('flux-2-pro', { prompt: 'a cat' }), 'unknown throw');
  assert.strictEqual(wrapped.status, 502);
  assert.strictEqual(wrapped.code, 'generation_failed');
  assert.strictEqual(wrapped.message, 'socket hang up');
}

// ── Config rules ─────────────────────────────────────────────────────

{
  // Without a transport the built-in one needs a base url and an auth source.
  assert.throws(
    () => createClient({ apiUrl: 'https://api.test' }),
    /requires either `fetch` or `apiKey`/,
  );
  // @ts-expect-error — apiUrl is required when no transport is supplied.
  assert.throws(() => createClient({ apiKey: 'k' }), /requires `apiUrl`/);

  // Drive is a REST surface of its own: a transport alone cannot serve it.
  assert.throws(
    () => createClient({ transport: { async execute() { return {}; } }, drive: { folder: 'AI' } }),
    /Drive is a REST surface/,
  );

  // `ai.apis` speaks the workflows protocol directly and says so when it has
  // no credentials to speak it with.
  const apisErr = await caught(
    () => createClient({ transport: { async execute() { return {}; } } }).apis.run('some/api', {}),
    'apis without credentials',
  );
  assert.strictEqual(apisErr.status, 400);
  assert.strictEqual(apisErr.code, 'unsupported_transport');
}

// ── Catalogs run on the client's transport ───────────────────────────

{
  const requested: string[] = [];
  const ai = createClient({ transport: {
    async execute(request) {
      requested.push(request.workflow);
      return { result: {
        items: [{ id: 'v1', name: 'Voice 1', tags: [] }],
        version: 'v',
        ttlSeconds: 60,
        nextCursor: null,
      } };
    },
  } });
  const page = await ai.catalogs.voices('heygen-video-avatar');
  assert.strictEqual(page.items.length, 1);
  assert.strictEqual(page.nextCursor, null);
  assert.deepStrictEqual(requested, ['heygen/v1/catalog/voices']);

  // A transport that throws something other than an ApiError still reaches the
  // caller as one — ApiError is the only error type the SDK exposes.
  const rough = createClient({ transport: {
    async execute() { throw new Error('gateway timeout'); },
  } });
  const roughErr = await caught(() => rough.catalogs.voices('heygen-video-avatar'), 'catalog throw');
  assert.strictEqual(roughErr.status, 502);
  assert.match(roughErr.message, /gateway timeout/);

  // A failed catalog task carries the platform's reason through.
  const failing = createClient({ transport: {
    async execute() {
      return { result: { message: 'quota exceeded', reason: 'rate_limited', statusCode: 429 } };
    },
  } });
  const catalogErr = await caught(() => failing.catalogs.voices('heygen-video-avatar'), 'catalog failure');
  assert.strictEqual(catalogErr.status, 429);
  assert.strictEqual(catalogErr.code, 'rate_limited');
  assert.match(catalogErr.message, /quota exceeded/);
}

console.log('✓ transport.test.ts — all passed');

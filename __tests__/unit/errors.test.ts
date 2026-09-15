/**
 * Unified error tests — offline, no API calls.
 *
 * Every failure out of generate/generateText/submit/result must be an
 * ApiError carrying { status, code, reason, message }, and every message
 * string must stay byte-identical to earlier versions so existing string
 * matchers keep working.
 */
import assert from 'node:assert';
import { createClient, ApiRunMode } from '../../src/client/index.ts';
import { ApiError } from '../../src/core/errors.ts';
import { mockPlatform, FAST_POLL } from './helpers/mock-platform.ts';

const API = 'https://api.example.com';

/** Capture the rejection of `fn`, asserting it is an ApiError. */
async function caught(fn: () => Promise<unknown>, label: string): Promise<ApiError> {
  try {
    await fn();
  } catch (err: unknown) {
    assert(err instanceof ApiError, `${label}: expected ApiError, got ${String(err)}`);
    assert(err instanceof Error, `${label}: must stay an Error subclass`);
    assert.strictEqual(err.name, 'ApiError', `${label}: name`);
    assert.strictEqual(err.code, err.reason, `${label}: code and reason must be equal`);
    return err;
  }
  throw new Error(`${label}: expected a rejection, got none`);
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const text = (status: number, body: string) => new Response(body, { status });

/** A client whose every request resolves to one canned response. */
const clientReturning = (res: () => Response) =>
  createClient({ apiUrl: API, fetch: async () => res() });

// ── Client-side failures — nothing leaves the process ────────────────

const offline = createClient({ apiUrl: API, fetch: async () => json(200, {}) });

const unknownModel = await caught(
  () => offline.generate('nonexistent-model' as never, { prompt: 'x' } as never),
  'unknown model',
);
assert.strictEqual(unknownModel.status, 400);
assert.strictEqual(unknownModel.code, 'unknown_model');
assert.strictEqual(unknownModel.message, 'Unknown model: "nonexistent-model"');

const textOnGenerate = await caught(
  () => offline.generate('claude-opus-4-8' as never, { prompt: 'x' } as never),
  'text model on generate()',
);
assert.strictEqual(textOnGenerate.status, 400);
assert.strictEqual(textOnGenerate.code, 'wrong_model_mode');
assert.strictEqual(
  textOnGenerate.message,
  'Claude Opus 4.8 is a text model — use generateText() instead.',
);

const mediaOnGenerateText = await caught(
  () => offline.generateText('flux-2-pro' as never, { prompt: 'x' } as never),
  'media model on generateText()',
);
assert.strictEqual(mediaOnGenerateText.status, 400);
assert.strictEqual(mediaOnGenerateText.code, 'wrong_model_mode');

const missingPrompt = await caught(
  () => offline.generate('flux-2-pro', { prompt: '' }),
  'missing prompt',
);
assert.strictEqual(missingPrompt.status, 400);
assert.strictEqual(missingPrompt.code, 'validation_error');
assert.strictEqual(missingPrompt.message, '"prompt" is required');

const badEnum = await caught(
  () => offline.generate('flux-2-pro', { prompt: 'x', aspectRatio: 'bogus' as never }),
  'bad enum',
);
assert.strictEqual(badEnum.status, 400);
assert.strictEqual(badEnum.code, 'validation_error');
assert.match(badEnum.message, /^"aspectRatio" must be one of: /);

// submit() validates through the same path
const submitValidation = await caught(
  () => offline.submit('flux-2-pro', { prompt: '' }),
  'submit validation',
);
assert.strictEqual(submitValidation.status, 400);
assert.strictEqual(submitValidation.code, 'validation_error');

// ── HTTP failures — submit path ─────────────────────────────────────

const unauthorized = await caught(
  () => clientReturning(() => json(401, { status: 'error', reason: 'unauthorized', message: 'Invalid token' }))
    .generate('flux-2-pro', { prompt: 'x' }),
  '401 submit',
);
assert.strictEqual(unauthorized.status, 401);
assert.strictEqual(unauthorized.code, 'unauthorized', 'API reason wins over the status slug');
assert.strictEqual(unauthorized.message, 'Invalid token', "the platform's own message reaches the caller");

const outOfCredits = await caught(
  () => clientReturning(() => json(402, { message: 'Not enough credits' }))
    .generate('flux-2-pro', { prompt: 'x' }),
  '402 submit',
);
assert.strictEqual(outOfCredits.status, 402);
assert.strictEqual(outOfCredits.code, 'payment_required', 'status slug fills in when reason is absent');
assert.strictEqual(outOfCredits.message, 'Not enough credits');

const rateLimited = await caught(
  () => clientReturning(() => json(429, { message: 'slow down' }))
    .generate('flux-2-pro', { prompt: 'x' }),
  '429 submit',
);
assert.strictEqual(rateLimited.status, 429);
assert.strictEqual(rateLimited.code, 'rate_limited');

// Regression: a non-JSON error body used to surface as a JSON SyntaxError that
// dropped the status entirely.
const htmlGateway = await caught(
  () => clientReturning(() => text(502, '<html>Bad Gateway</html>'))
    .generate('flux-2-pro', { prompt: 'x' }),
  '502 non-JSON submit',
);
assert.strictEqual(htmlGateway.status, 502);
assert.strictEqual(htmlGateway.code, 'bad_gateway');
// A body that isn't JSON carries no platform message, so the transport reports
// it as such; the status lives on the error's own field.
assert.match(htmlGateway.message, /Non json response/);

// A 200 with no task id is an unusable response, not a success.
const noTaskId = await caught(
  () => clientReturning(() => json(200, { response: {} })).submit('flux-2-pro', { prompt: 'x' }),
  'missing task id',
);
assert.strictEqual(noTaskId.status, 502);
assert.strictEqual(noTaskId.code, 'invalid_response');
assert.strictEqual(noTaskId.message, 'No task id in response');

// ── ai.apis — the low-level surface throws ApiError too ─────────────

// The workflows client's own error type never reaches a caller: `ai.apis.run`
// maps it exactly like the generation surface does.
const apisUnauthorized = await caught(
  () => clientReturning(() => json(401, { status: 'error', reason: 'unauthorized', message: 'Invalid token' }))
    .apis.run('media-platform/v1/videos/edit', { x: 1 }, { mode: ApiRunMode.SYNC }),
  'apis 401',
);
assert.strictEqual(apisUnauthorized.status, 401);
assert.strictEqual(apisUnauthorized.code, 'unauthorized');
assert.strictEqual(apisUnauthorized.message, 'Invalid token');

const apisOutOfCredits = await caught(
  () => clientReturning(() => json(402, { message: 'Not enough credits' }))
    .apis.run('media-platform/v1/videos/edit', { x: 1 }, { mode: ApiRunMode.SYNC }),
  'apis 402',
);
assert.strictEqual(apisOutOfCredits.status, 402);
assert.strictEqual(apisOutOfCredits.code, 'payment_required', 'status slug fills in for ai.apis as well');

// ── HTTP failures — execute path (syncExecute model) ────────────────

const executeFailed = await caught(
  () => clientReturning(() => text(500, 'boom')).generate('picsart-sana-sprint-v1', { prompt: 'x' }),
  '500 execute',
);
assert.strictEqual(executeFailed.status, 500);
assert.strictEqual(executeFailed.code, 'server_error');
assert.match(executeFailed.message, /Non json response/);

const executeReason = await caught(
  () => clientReturning(() => json(422, { status: 'error', reason: 'content_moderation', message: 'blocked' }))
    .generate('picsart-sana-sprint-v1', { prompt: 'x' }),
  '422 execute',
);
assert.strictEqual(executeReason.status, 422);
assert.strictEqual(executeReason.code, 'content_moderation');

// A real task failure — `{ status: 'error', reason, message }` — surfaces the
// platform's own message, not the raw JSON body.
const executeTaskFailure = await caught(
  () => clientReturning(() => json(422, {
    status: 'error', reason: 'content_moderation', message: 'Prompt blocked by moderation',
  })).generate('picsart-sana-sprint-v1', { prompt: 'x' }),
  'execute task failure',
);
assert.strictEqual(executeTaskFailure.status, 422);
assert.strictEqual(executeTaskFailure.code, 'content_moderation');
assert.strictEqual(executeTaskFailure.message, 'Prompt blocked by moderation');

// ── HTTP failures — status/poll path ────────────────────────────────

let call = 0;
const pollFails = createClient({
  apiUrl: API,
  fetch: async () => (++call === 1 ? json(200, { response: { id: 'task-1' } }) : text(503, 'unavailable')),
});
const statusFailed = await caught(
  () => pollFails.generate('flux-2-pro', { prompt: 'x' }),
  '503 status check',
);
assert.strictEqual(statusFailed.status, 503);
assert.strictEqual(statusFailed.code, 'service_unavailable');
assert.match(statusFailed.message, /Non json response/);

// The most common real failure: submit succeeds, then the task fails and the
// poll returns the platform error response.
let pollCall = 0;
const taskFails = createClient({
  apiUrl: API,
  fetch: async () => (++pollCall === 1
    ? json(200, { response: { id: 'task-1' } })
    : json(422, { status: 'error', reason: 'content_moderation', message: 'Prompt blocked by moderation' })),
});
const taskFailure = await caught(
  () => taskFails.generate('flux-2-pro', { prompt: 'x' }),
  'async task failure',
);
assert.strictEqual(taskFailure.status, 422);
assert.strictEqual(taskFailure.code, 'content_moderation');
assert.strictEqual(taskFailure.message, 'Prompt blocked by moderation', 'the platform message, not the raw JSON body');

// ── Lifecycle: timeout and abort ────────────────────────────────────

/** A client whose task polls always report the given status frame. */
const clientPolling = (status: () => Record<string, unknown>) =>
  createClient({
    apiUrl: API,
    fetch: mockPlatform({ status: () => status() as never }).fetch,
  });

const pending = clientPolling(() => ({ status: 'IN_PROGRESS' }));

const timedOut = await caught(
  () => pending.result('flux-2-pro', 'mock-1', { maxAttempts: 2, intervalMs: 1 }),
  'poll timeout',
);
assert.strictEqual(timedOut.status, 408, 'poll timeout mirrors the workflows-client 408 convention');
assert.strictEqual(timedOut.code, 'timeout');
assert.strictEqual(timedOut.message, 'Timed out waiting for workflow bfl/v1/flux-2:mock-1');

const controller = new AbortController();
controller.abort();
const aborted = await caught(
  () => pending.result('flux-2-pro', 'mock-1', { signal: controller.signal, intervalMs: 1 }),
  'abort',
);
assert.strictEqual(aborted.status, 499);
assert.strictEqual(aborted.code, 'aborted');
assert.strictEqual(aborted.message, 'Operation aborted');

// ── Job-level failures ──────────────────────────────────────────────

// The adapter contract (pa-pluggable-api-adapter FailedTaskResult): a FAILED
// task resolves as HTTP 200 with the FailedResult payload in `result` —
// { message, reason, statusCode }.
const failedWithReason = await caught(
  () => clientPolling(() => ({
    status: 'FAILED',
    result: { message: 'model exploded', reason: 'content_moderation', statusCode: 422 },
  })).generate('flux-2-pro', { prompt: 'x' }, FAST_POLL),
  'FAILED with reason',
);
assert.strictEqual(failedWithReason.status, 422, "the task's own statusCode wins");
assert.strictEqual(failedWithReason.code, 'content_moderation');
assert.strictEqual(failedWithReason.message, 'Flux 2 Pro failed (422): model exploded');

// A 200 whose *result* carries an error payload.
const errorPayload = await caught(
  () => clientPolling(() => ({
    status: 'COMPLETED', result: { status: 429, message: 'quota exceeded' },
  })).generate('flux-2-pro', { prompt: 'x' }, FAST_POLL),
  'error payload in result',
);
assert.strictEqual(errorPayload.status, 429);
assert.strictEqual(errorPayload.code, 'rate_limited');
assert.strictEqual(errorPayload.message, 'Flux 2 Pro failed (429): quota exceeded');

const unparseable = await caught(
  () => clientPolling(() => ({ status: 'COMPLETED', result: { foo: 1 } }))
    .generate('flux-2-pro', { prompt: 'x' }, FAST_POLL),
  'unparseable result',
);
assert.strictEqual(unparseable.status, 502);
assert.strictEqual(unparseable.code, 'invalid_response');
assert.strictEqual(unparseable.message, 'Flux 2 Pro: unexpected response — no result URL');

const noText = await caught(
  () => clientPolling(() => ({ status: 'COMPLETED', result: { foo: 1 } }))
    .generateText('claude-opus-4-8', { prompt: 'x' }, FAST_POLL),
  'unparseable text result',
);
assert.strictEqual(noText.status, 502);
assert.strictEqual(noText.code, 'invalid_response');
assert.strictEqual(noText.message, 'Claude Opus 4.8: unexpected response — no text');

// ── Aborts raised by fetch itself keep their identity ───────────────

const fetchAborts = createClient({
  apiUrl: API,
  fetch: async () => { throw new DOMException('The operation was aborted.', 'AbortError'); },
});
await assert.rejects(
  () => fetchAborts.generate('flux-2-pro', { prompt: 'x' }),
  (err: Error) => {
    assert.strictEqual(err.name, 'AbortError', 'fetch AbortError must not be wrapped');
    assert(!(err instanceof ApiError), 'fetch AbortError must not become an ApiError');
    return true;
  },
  'a fetch-level abort keeps err.name === "AbortError"',
);

console.log('✓ errors.test.ts — all passed');

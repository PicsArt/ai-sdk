/**
 * Unified error tests — offline, no API calls.
 *
 * Every failure out of generate/generateText/submit/result must be an
 * ApiError carrying { status, code, reason, message }, and every message
 * string must stay byte-identical to earlier versions so existing string
 * matchers keep working.
 */
import assert from 'node:assert';
import { createClient } from '../../src/client/index.ts';
import { ApiError } from '../../src/core/errors.ts';
import type { WorkflowSubmitRequest, WorkflowJobHandle } from '../../src/core/workflow.ts';

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
assert.strictEqual(unauthorized.message, 'Submit failed (401): Invalid token');

const outOfCredits = await caught(
  () => clientReturning(() => json(402, { message: 'Not enough credits' }))
    .generate('flux-2-pro', { prompt: 'x' }),
  '402 submit',
);
assert.strictEqual(outOfCredits.status, 402);
assert.strictEqual(outOfCredits.code, 'payment_required', 'status slug fills in when reason is absent');
assert.strictEqual(outOfCredits.message, 'Submit failed (402): Not enough credits');

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
assert.strictEqual(htmlGateway.message, 'Submit failed (502): <html>Bad Gateway</html>');

// A 200 with no task id is an unusable response, not a success.
const noTaskId = await caught(
  () => clientReturning(() => json(200, { response: {} })).submit('flux-2-pro', { prompt: 'x' }),
  'missing task id',
);
assert.strictEqual(noTaskId.status, 502);
assert.strictEqual(noTaskId.code, 'invalid_response');
assert.strictEqual(noTaskId.message, 'No task id in response: {"response":{}}');

// ── HTTP failures — execute path (syncExecute model) ────────────────

const executeFailed = await caught(
  () => clientReturning(() => text(500, 'boom')).generate('picsart-sana-sprint-v1', { prompt: 'x' }),
  '500 execute',
);
assert.strictEqual(executeFailed.status, 500);
assert.strictEqual(executeFailed.code, 'server_error');
assert.strictEqual(executeFailed.message, 'Execute failed (500): boom');

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
assert.strictEqual(
  executeTaskFailure.message,
  'Execute failed (422): Prompt blocked by moderation',
);

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
assert.strictEqual(statusFailed.message, 'Status check failed (503): unavailable');

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
assert.strictEqual(
  taskFailure.message,
  'Status check failed (422): Prompt blocked by moderation',
  'the platform message, not the raw JSON body',
);

// ── Lifecycle: timeout and abort ────────────────────────────────────

function transportWithStatus(status: () => unknown) {
  return {
    async submit(request: WorkflowSubmitRequest) {
      return { workflow: request.workflow, id: 'mock-1' };
    },
    async status() { return status(); },
    async execute() { return status(); },
  };
}

const pending = createClient(transportWithStatus(() => ({ status: 'IN_PROGRESS' })));
const handle: WorkflowJobHandle = { workflow: 'flux/v1/generate', id: 'mock-1' };

const timedOut = await caught(
  () => pending.result(handle, 'flux-2-pro', { maxAttempts: 2, intervalMs: 1 }),
  'poll timeout',
);
assert.strictEqual(timedOut.status, 408, 'poll timeout mirrors the workflows-client 408 convention');
assert.strictEqual(timedOut.code, 'timeout');
assert.strictEqual(timedOut.message, 'Timed out waiting for workflow flux/v1/generate:mock-1');

const controller = new AbortController();
controller.abort();
const aborted = await caught(
  () => pending.result(handle, 'flux-2-pro', { signal: controller.signal }),
  'abort',
);
assert.strictEqual(aborted.status, 499);
assert.strictEqual(aborted.code, 'aborted');
assert.strictEqual(aborted.message, 'Operation aborted');

// An execute-only transport still rejects the async lifecycle clearly.
const executeOnly = createClient({ async execute() { return { status: 'COMPLETED', result: { url: 'u' } }; } });
const noSubmit = await caught(() => executeOnly.submit('flux-2-pro', { prompt: 'x' }), 'no submit');
assert.strictEqual(noSubmit.status, 400);
assert.strictEqual(noSubmit.code, 'unsupported_transport');
assert.strictEqual(noSubmit.message, 'Transport does not support submit (execute-only transport)');

// ── Job-level failures ──────────────────────────────────────────────

const failedWithReason = await caught(
  () => createClient(transportWithStatus(() => ({
    status: 'FAILED', error: 'model exploded', reason: 'content_moderation', statusCode: 422,
  }))).generate('flux-2-pro', { prompt: 'x' }),
  'FAILED with reason',
);
assert.strictEqual(failedWithReason.status, 422, "the task's own statusCode wins");
assert.strictEqual(failedWithReason.code, 'content_moderation');
assert.strictEqual(failedWithReason.message, 'Flux 2 Pro failed: model exploded');

const failedBare = await caught(
  () => createClient(transportWithStatus(() => ({ status: 'FAILED' })))
    .generate('flux-2-pro', { prompt: 'x' }),
  'FAILED bare',
);
assert.strictEqual(failedBare.status, 502);
assert.strictEqual(failedBare.code, 'generation_failed');
assert.strictEqual(failedBare.message, 'Flux 2 Pro failed: unknown error');

const canceled = await caught(
  () => createClient(transportWithStatus(() => ({ status: 'CANCELED' })))
    .generate('flux-2-pro', { prompt: 'x' }),
  'CANCELED',
);
assert.strictEqual(canceled.status, 499);
assert.strictEqual(canceled.code, 'canceled');
assert.strictEqual(canceled.message, 'Flux 2 Pro was canceled');

// A nested error envelope — { response: { status:'error', reason, message } }.
// `response.message` must reach the caller rather than falling through to
// 'unknown error'.
const nestedError = await caught(
  () => createClient(transportWithStatus(() => ({
    response: { status: 'error', reason: 'content_moderation', message: 'Prompt blocked by moderation' },
  }))).generate('flux-2-pro', { prompt: 'x' }),
  'nested error envelope',
);
assert.strictEqual(nestedError.status, 502, 'no statusCode in the body, so the 502 fallback');
assert.strictEqual(nestedError.code, 'content_moderation');
assert.strictEqual(nestedError.message, 'Flux 2 Pro failed: Prompt blocked by moderation');

// A 200 whose *result* carries an error payload.
const errorPayload = await caught(
  () => createClient(transportWithStatus(() => ({
    status: 'COMPLETED', result: { status: 429, message: 'quota exceeded' },
  }))).generate('flux-2-pro', { prompt: 'x' }),
  'error payload in result',
);
assert.strictEqual(errorPayload.status, 429);
assert.strictEqual(errorPayload.code, 'rate_limited');
assert.strictEqual(errorPayload.message, 'Flux 2 Pro failed (429): quota exceeded');

const unparseable = await caught(
  () => createClient(transportWithStatus(() => ({ status: 'COMPLETED', result: { foo: 1 } })))
    .generate('flux-2-pro', { prompt: 'x' }),
  'unparseable result',
);
assert.strictEqual(unparseable.status, 502);
assert.strictEqual(unparseable.code, 'invalid_response');
assert.strictEqual(unparseable.message, 'Flux 2 Pro: unexpected response — no result URL');

const noText = await caught(
  () => createClient(transportWithStatus(() => ({ status: 'COMPLETED', result: { foo: 1 } })))
    .generateText('claude-opus-4-8', { prompt: 'x' }),
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

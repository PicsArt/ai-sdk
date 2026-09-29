/**
 * The e2e's /options probe — what gets retried, and what gets reported.
 *
 * The retry boundary is the whole point: a 429/5xx or a dropped connection is
 * noise worth one retry, while a 4xx or a 2xx carrying no credits is a real
 * answer that must still fail the run. Getting that backwards would either
 * keep the flake or hide a genuine pricing gap.
 */
import assert from 'node:assert';
import {
  describeLastOptions,
  isTransient,
  lastOptionsResponse,
  recordOptionsError,
  recordOptionsResponse,
  withOptionsProbe,
} from '../e2e/helpers/options-probe.ts';
import { createLimiter } from '../e2e/helpers/limit.ts';

// ── What earns a retry ──────────────────────────────────────────────
{
  const at = (status: number) => isTransient({ status, statusText: '', body: '' });

  assert.ok(at(429), 'rate limiting is the gateway having a moment');
  assert.ok(at(500) && at(502) && at(503) && at(504), '5xx is retryable');
  assert.ok(isTransient({ status: null, statusText: '', body: '', error: 'ECONNRESET' }),
    'a thrown fetch is retryable');

  // A real answer, however unwelcome — never retried.
  assert.ok(!at(200), '2xx with no credits is a real pricing gap, not noise');
  assert.ok(!at(400) && !at(401) && !at(404) && !at(422), '4xx is a real answer');
  assert.ok(!isTransient(undefined), 'nothing recorded means nothing to blame');

  // The worker couldn't read the source media to pick a tier — its fetch, not our request.
  const undetermined = '{"status":"error","reason":"billing_undetermined","message":"socket hang up"}';
  assert.ok(isTransient({ status: 422, statusText: '', body: undetermined }),
    '422 billing_undetermined is the worker\'s metadata fetch failing');
  assert.ok(!isTransient({ status: 400, statusText: '', body: undetermined }),
    'only as a 422 — the reason alone does not make another status retryable');
}

// ── What the failure message says ───────────────────────────────────
{
  recordOptionsResponse(502, 'Bad Gateway', 'upstream timeout');
  assert.strictEqual(describeLastOptions(), 'HTTP 502 Bad Gateway — upstream timeout');
  assert.strictEqual(lastOptionsResponse()?.status, 502);

  recordOptionsResponse(200, 'OK', '');
  assert.strictEqual(describeLastOptions(), 'HTTP 200 OK — <empty body>',
    'an empty body must still be distinguishable from an unread one');

  recordOptionsError(new Error('socket hang up'));
  assert.match(describeLastOptions(), /^fetch threw: Error: socket hang up$/);
  assert.strictEqual(lastOptionsResponse()?.status, null);

  // Bodies are capped so one bad response can't flood the job log.
  recordOptionsResponse(500, 'Internal Server Error', 'x'.repeat(1000));
  assert.strictEqual(lastOptionsResponse()?.body.length, 300);
}

// ── Concurrent combos each see their own answer ─────────────────────
// The matrix prices combos in parallel; a shared "last response" would let one
// combo retry (or report) on a neighbour's status.
{
  recordOptionsResponse(200, 'OK', 'outside');
  const tick = () => new Promise((r) => setTimeout(r, 5));
  const [a, b] = await Promise.all([
    withOptionsProbe(async () => {
      recordOptionsResponse(503, 'Service Unavailable', 'a');
      await tick();
      return lastOptionsResponse();
    }),
    withOptionsProbe(async () => {
      await tick();
      recordOptionsResponse(404, 'Not Found', 'b');
      return lastOptionsResponse();
    }),
  ]);
  assert.strictEqual(a?.status, 503, 'scope A must not see B\'s later write');
  assert.strictEqual(b?.status, 404);
  assert.strictEqual(lastOptionsResponse()?.body, 'outside', 'scopes must not leak outward');
  assert.strictEqual(await withOptionsProbe(async () => lastOptionsResponse()), undefined,
    'a fresh scope starts empty');
}

// ── The limiter caps in-flight calls and runs every one ─────────────
{
  const limit = createLimiter(3);
  let active = 0;
  let peak = 0;
  const results = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      limit(async () => {
        active++;
        peak = Math.max(peak, active);
        await new Promise((r) => setTimeout(r, 1 + (i % 3)));
        active--;
        return i;
      }),
    ),
  );
  assert.strictEqual(peak, 3, 'never more than max in flight');
  assert.deepStrictEqual(results, Array.from({ length: 20 }, (_, i) => i));

  // A rejected call frees its slot.
  const one = createLimiter(1);
  await assert.rejects(one(async () => { throw new Error('boom'); }), /boom/);
  assert.strictEqual(await one(async () => 'next'), 'next');

  assert.throws(() => createLimiter(0), /positive integer/);
}

console.log('✓ options-probe.test.ts — all passed');

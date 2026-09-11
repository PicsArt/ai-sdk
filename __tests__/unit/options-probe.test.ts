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
} from '../e2e/helpers/options-probe.ts';

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

console.log('✓ options-probe.test.ts — all passed');

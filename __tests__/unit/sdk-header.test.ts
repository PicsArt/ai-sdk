/**
 * The X-Picsart-Sdk header marks every request the SDK makes — on the `apiKey`
 * path and on the caller's own `fetch` alike.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { maybeFetch } from '../../src/client/transport.ts';
import pkg from '../../package.json' with { type: 'json' };

const SDK = `js/${pkg.version}`;

test('custom fetch: the SDK header is added, the caller\'s headers are kept', async () => {
  let seen = new Headers();
  const fetch = maybeFetch({
    apiUrl: 'https://api.test',
    fetch: async (_url, init) => {
      seen = new Headers(init?.headers);
      return new Response('{}');
    },
  })!;
  await fetch('https://api.test/x', { headers: { 'Content-Type': 'application/json' } });
  assert.equal(seen.get('x-picsart-sdk'), SDK);
  assert.equal(seen.get('content-type'), 'application/json');
  assert.equal(seen.has('authorization'), false);
  assert.equal(seen.has('x-touchpoint'), false);
});

test('apiKey fetch: the SDK header rides with the gateway headers', async (t) => {
  let seen = new Headers();
  t.mock.method(globalThis, 'fetch', async (_url: string, init?: RequestInit) => {
    seen = new Headers(init?.headers);
    return new Response('{}');
  });
  const fetch = maybeFetch({ apiUrl: 'https://api.test', apiKey: 'k' })!;
  await fetch('https://api.test/x');
  assert.equal(seen.get('x-picsart-sdk'), SDK);
  assert.equal(seen.get('authorization'), 'Bearer k');
  assert.equal(seen.get('x-touchpoint'), 'sdk');
});

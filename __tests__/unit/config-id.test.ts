/**
 * `configId` reaches the platform as the `x-config-id` header on every
 * generation route; unset, no config id is sent.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createClient } from '../../src/client/index.ts';
import type { SdkTransport } from '../../src/client/index.ts';
import { mockPlatform, FAST_POLL } from './helpers/mock-platform.ts';

/** A client over the mock platform that records the config id of each request, by route. */
function recordingClient() {
  // One result that satisfies every route's parser: a media url and a text.
  const platform = mockPlatform({
    status: () => ({ status: 'COMPLETED', result: { url: 'https://cdn.test/out.jpg', text: 'hi' } }),
  });
  const seen: Array<{ route: string; configId: string | null }> = [];
  const ai = createClient({
    apiUrl: 'https://api.test',
    fetch: async (url, init) => {
      const route = new URL(url).pathname.split('/').at(-1)!;
      // The workflows client sends an empty header when there is no config id.
      seen.push({ route, configId: new Headers(init?.headers).get('x-config-id') || null });
      return platform.fetch(url, init);
    },
  });
  const configIdOf = (route: string) => seen.filter(call => call.route === route).map(call => call.configId);
  return { ai, configIdOf };
}

test('generate(), generateText(), run() and submit() send configId as x-config-id', async () => {
  const { ai, configIdOf } = recordingClient();
  const options = { ...FAST_POLL, configId: 'my-config' };

  await ai.generate('some-model', { prompt: 'x' }, options);
  await ai.generateText('some-llm', { prompt: 'x' }, options);
  await ai.run('some-json-model', { state: 's' }, options);
  await ai.submit('some-model', { prompt: 'x' }, { configId: 'my-config' });

  assert.deepEqual(configIdOf('submit'), ['my-config', 'my-config', 'my-config', 'my-config']);
});

test('no configId: no config id is sent', async () => {
  const { ai, configIdOf } = recordingClient();

  await ai.generate('some-model', { prompt: 'x' }, FAST_POLL);

  assert.deepEqual(configIdOf('submit'), [null]);
});

test('a custom transport receives the configId on its requests', async () => {
  const requests: Array<{ call: string; configId?: string }> = [];
  const transport: SdkTransport = {
    async execute(request) {
      requests.push({ call: 'execute', configId: request.configId });
      return { result: { url: 'https://cdn.test/out.jpg' } };
    },
  };
  const ai = createClient({ transport });

  await ai.generate('some-model', { prompt: 'x' }, { configId: 'my-config' });

  assert.deepEqual(requests, [{ call: 'execute', configId: 'my-config' }]);
});

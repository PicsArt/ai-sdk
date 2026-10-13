/**
 * Dynamic mode — generation through the models-hub `v1/models` workflow.
 *
 * Covers: generate/submit/result/subscribe/getCredits firing WITHOUT
 * initModelCatalog (never waiting, no local validation, backend-only ids),
 * the ModelsCommand shape (drive + inputs transformation under the command's
 * own `options`), the pre-normalized result parse (items/url/text, metadata
 * passthrough), the constant handle (no edit-route probe), and the
 * mode-assertion behavior before/after a catalog install.
 *
 * Ordering note: the active catalog is process-global, so the static canary
 * runs before the first dynamic client flips it to pending.
 */
import assert from 'node:assert';
import { createClient, GenerationEventType, type MediaModelId } from '../../src/client/index.ts';
import type { TextModelId } from '../../src/generated/model-input-types.ts';
import { ApiError } from '../../src/core/errors.ts';
import { serializeCatalog } from '../../src/core/catalog-wire.ts';
import { ALL_MODELS } from '../../src/vendors/catalog/index.ts';
import { mockPlatform, FAST_POLL, type StatusFrame } from './helpers/mock-platform.ts';

// Dynamic mode serves models/params beyond the bundled compile-time types
// (`Models.*`, `ModelInputById`), so backend-only refs and open params need
// explicit casts — capability is live, typing lags (doc §4.2).
const asMedia = (id: string) => id as MediaModelId;
const asText = (id: string) => id as TextModelId;

// ── 0. static canary — a modeless client behaves exactly as before ──
{
  const platform = mockPlatform();
  const ai = createClient({ apiUrl: 'https://api.test', fetch: platform.fetch });
  const res = await ai.generate('flux-2-pro', { prompt: 'a cat' }, FAST_POLL);
  assert.strictEqual(typeof res.url, 'string');
  assert.notStrictEqual(platform.calls.submits[0].workflow, 'v1/models');
  await assert.rejects(
    ai.initModelCatalog(),
    (err: unknown) => err instanceof ApiError && err.status === 400 && err.code === 'invalid_mode',
  );
}

// ── Fixtures for the dynamic client ─────────────────────────────────

const RESULTS = new Map<string, StatusFrame>();
const platform = mockPlatform({
  status: (_wf, id) => RESULTS.get(id) ?? { status: 'COMPLETED', result: { url: 'https://cdn.test/out.jpg' } },
  modelsCatalog: () => serializeCatalog(
    ALL_MODELS.filter((m) => ['flux-2-pro', 'claude-opus-5', 'kling-v3'].includes(m.id)),
  ),
});
let optionsCall: { workflow: string; payload: Record<string, unknown> } | undefined;
const basePlatformFetch = platform.fetch;

const ai = createClient({
  mode: 'dynamic',
  apiUrl: 'https://api.test',
  fetch: basePlatformFetch,
  drive: { folder: 'AI Tests' },
});

// ── 1. generate fires without initModelCatalog, backend-only id ─────
{
  const res = await ai.generate(
    asMedia('backend-only-model'),
    { prompt: 'a dog', someNewParam: 42 } as never,
    FAST_POLL,
  );
  const submit = platform.calls.submits.at(-1)!;
  assert.strictEqual(submit.workflow, 'v1/models');
  assert.strictEqual(submit.payload.model, 'backend-only-model');
  assert.deepStrictEqual(submit.payload.params, { prompt: 'a dog', someNewParam: 42 });
  const options = submit.payload.options as Record<string, unknown>;
  assert.deepStrictEqual(options.inputs_transformation, { downscale_oversized_images: false });
  // Client drive config rides the command's own options.drive, not params.
  const drive = options.drive as Record<string, unknown>;
  assert.ok(drive, 'drive options missing from the command');
  assert.deepStrictEqual(drive.folder, { path: 'AI Tests' });
  // Unknown model (catalog pending) → extension-less name, never a wrong one.
  assert.match(drive.name as string, /^a-dog-\d+$/);
  assert.strictEqual(res.url, 'https://cdn.test/out.jpg');
  assert.strictEqual(res.generationId, 'task-1');
}

// ── 1b. unknown model: the caller's format param still names the file ─
{
  await ai.generate(asMedia('backend-only-model'), { prompt: 'a dog', outputFormat: 'mp4' } as never, FAST_POLL);
  const drive = (platform.calls.submits.at(-1)!.payload.options as Record<string, unknown>)
    .drive as Record<string, unknown>;
  assert.match(drive.name as string, /^a-dog-\d+\.mp4$/);
}

// ── 2. pre-normalized parse: items + metadata passthrough ───────────
{
  RESULTS.set('task-1', {
    status: 'COMPLETED',
    result: {
      items: [
        { url: 'https://cdn.test/a.jpg', metadata: { exploreImageId: 'e1' } },
        { url: 'https://cdn.test/b.jpg' },
      ],
      model: 'backend-only-model',
    },
    usage: { credits: 3 },
  });
  const res = await ai.generate(asMedia('backend-only-model'), { prompt: 'x' } as never, FAST_POLL);
  assert.strictEqual(res.items.length, 2);
  assert.strictEqual(res.url, 'https://cdn.test/a.jpg');
  assert.deepStrictEqual(res.items[0].metadata, { exploreImageId: 'e1' });
  assert.strictEqual(res.items[1].metadata, undefined);
  assert.deepStrictEqual(res.usage, { credits: 3 });
  RESULTS.delete('task-1');
}

// ── 3. missing url and items → 502 invalid_response ─────────────────
{
  RESULTS.set('task-1', { status: 'COMPLETED', result: { model: 'x' } });
  await assert.rejects(
    ai.generate(asMedia('backend-only-model'), { prompt: 'x' } as never, FAST_POLL),
    (err: unknown) => err instanceof ApiError && err.status === 502 && err.code === 'invalid_response',
  );
  RESULTS.delete('task-1');
}

// ── 4. generateText: result.text, command without options ───────────
{
  RESULTS.set('task-1', { status: 'COMPLETED', result: { text: 'hello', model: 'claude-opus-5' } });
  const res = await ai.generateText(asText('backend-only-llm'), { prompt: 'hi' } as never, FAST_POLL);
  assert.strictEqual(res.text, 'hello');
  assert.strictEqual(res.model, 'claude-opus-5');
  const submit = platform.calls.submits.at(-1)!;
  assert.strictEqual(submit.workflow, 'v1/models');
  assert.strictEqual('options' in submit.payload, false, 'text command must carry no options');
  RESULTS.delete('task-1');
}

// ── 5. no local mode assertion in dynamic mode ───────────────────────
// 'claude-opus-5' is a bundled text model, but dynamic mode does no local
// validation of any kind — it submits and lets the server answer.
{
  RESULTS.set('task-1', { status: 'COMPLETED', result: { url: 'https://cdn.test/out.jpg' } });
  await ai.generate(asMedia('claude-opus-5'), { prompt: 'x' } as never, FAST_POLL);
}

// ── 6. submit / result / subscribe on the constant handle ───────────
{
  const id = await ai.submit(asMedia('backend-only-model'), { prompt: 'x' } as never);
  assert.strictEqual(id, 'task-1');
  const pollsBefore = platform.calls.polls;
  const res = await ai.result(asMedia('backend-only-model'), id, FAST_POLL);
  assert.strictEqual(res.generationId, 'task-1');
  // One completed poll, no edit-route status probe before it.
  assert.strictEqual(platform.calls.polls, pollsBefore + 1);

  const events: string[] = [];
  for await (const e of ai.subscribe(asMedia('backend-only-model'), id, FAST_POLL)) {
    events.push(e.type);
    if (e.type === GenerationEventType.Completed) {
      assert.strictEqual(e.result.url, 'https://cdn.test/out.jpg');
    }
  }
  assert.deepStrictEqual(events, [GenerationEventType.Completed]);
}

// ── 7. getCredits prices over v1/models, no command options ─────────
{
  const aiOptions = createClient({
    mode: 'dynamic',
    apiUrl: 'https://api.test',
    fetch: async (url, init) => {
      if (String(url).includes('/options')) {
        optionsCall = {
          workflow: new URL(String(url)).pathname.replace(/^.*\/workflows\//, '').replace(/\/options$/, ''),
          payload: JSON.parse(String(init?.body)).params,
        };
      }
      return basePlatformFetch(url, init);
    },
  });
  const credits = await aiOptions.getCredits(asMedia('backend-only-model'), { prompt: 'x' } as never);
  assert.strictEqual(credits, 5);
  assert.ok(optionsCall);
  assert.strictEqual(optionsCall.workflow, 'v1/models');
  assert.strictEqual(optionsCall.payload.model, 'backend-only-model');
  assert.deepStrictEqual(optionsCall.payload.params, { prompt: 'x' });
  assert.strictEqual('options' in optionsCall.payload, false);
}

// ── 8. buildPayload is a static-mode concept ─────────────────────────
{
  assert.throws(
    () => ai.buildPayload('flux-2-pro', { prompt: 'x' }),
    (err: unknown) => err instanceof ApiError && err.code === 'unsupported_in_dynamic_mode',
  );
}

// ── 9. after initModelCatalog: generation flow is untouched by it ───
{
  await ai.initModelCatalog();
  assert.strictEqual(platform.calls.catalogFetches.length, 1);
  assert.ok(platform.calls.catalogFetches[0].search.includes('include=schema%2Cconstraints%2Crouting'));

  RESULTS.set('task-1', { status: 'COMPLETED', result: { url: 'https://cdn.test/out.jpg' } });

  // Even a locally-known text model is NOT gated — the server decides.
  await ai.generate(asMedia('claude-opus-5'), { prompt: 'x' } as never, FAST_POLL);
  assert.strictEqual(platform.calls.submits.at(-1)!.payload.model, 'claude-opus-5');

  // The caller's ref goes into the command verbatim — no local resolution,
  // models-hub resolves aliases server-side.
  await ai.generate(asMedia('Flux 2 Pro'), { prompt: 'x' } as never, FAST_POLL);
  assert.strictEqual(platform.calls.submits.at(-1)!.payload.model, 'Flux 2 Pro');

  // The naming-only peek now finds models in the loaded catalog: a video
  // model's Drive save gets the mode-correct extension, static-style.
  await ai.generate(asMedia('kling-v3'), { prompt: 'ocean waves' } as never, FAST_POLL);
  const drive = (platform.calls.submits.at(-1)!.payload.options as Record<string, unknown>)
    .drive as Record<string, unknown>;
  assert.match(drive.name as string, /^ocean-waves-\d+\.mp4$/);
}

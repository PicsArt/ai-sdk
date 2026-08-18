import assert from 'node:assert';
import type { SdkTransport, WorkflowSubmitRequest } from '../../src/core/workflow.ts';
import type { CatalogItem } from '../../src/core/catalogs.ts';
import { clearHydratedCatalogs, installHydratedCatalog, getHydratedCatalog } from '../../src/core/catalogs.ts';
import { createCatalogs } from '../../src/client/catalogs.ts';
import { Model } from '../../src/core/descriptors/model-accessor.ts';
import { p } from '../../src/core/descriptors/presets.ts';
import { validateAll, transferValues } from '../../src/core/descriptors/utils.ts';
import { getVoiceById } from '../../src/core/voices.ts';
import type { VoiceOption, AvatarOption } from '../../src/core/types.ts';

// ── Fake transport serving paginated catalog envelopes ──────────────

const voiceItems: CatalogItem[] = Array.from({ length: 150 }, (_, i) => ({
  id: `hg-voice-${i}`,
  name: `Voice ${i}`,
  tags: ['female', 'english'],
  preview: { audioUrl: `https://cdn/voice-${i}.mp3` },
  meta: { language: 'English' },
}));

const avatarItems: CatalogItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: `hg-avatar-${i}`,
  name: `Avatar ${i}`,
  tags: ['male'],
  preview: { imageUrl: `https://cdn/avatar-${i}.webp`, videoUrl: `https://cdn/avatar-${i}.mp4` },
  meta: { gender: 'male', defaultVoiceId: 'hg-voice-1' },
}));

/** Generic item pool per workflow — unknown workflows get a small stub list. */
function itemsFor(workflow: string): CatalogItem[] {
  if (workflow === 'heygen/v1/catalog/voices') return voiceItems;
  if (workflow === 'heygen/v1/catalog/avatars') return avatarItems;
  return Array.from({ length: 5 }, (_, i) => ({
    id: `${workflow}-item-${i}`, name: `Item ${i}`, tags: [],
  }));
}

let executeCalls: WorkflowSubmitRequest[] = [];
let failNextExecute: string | null = null;
let errorEnvelopeNext = false;

const fakeTransport: SdkTransport = {
  async execute(request) {
    executeCalls.push(request);
    if (failNextExecute) {
      const message = failNextExecute;
      failNextExecute = null;
      throw new Error(message);
    }
    if (errorEnvelopeNext) {
      errorEnvelopeNext = false;
      return { status: 'error', message: 'workspace quota exceeded' };
    }
    const items = itemsFor(request.workflow);
    const payload = request.payload as { cursor?: string; limit?: number };
    const limit = payload.limit ?? 100;
    const start = payload.cursor ? items.findIndex((i) => i.id === payload.cursor) + 1 : 0;
    const page = items.slice(start, start + limit);
    const nextCursor = start + limit < items.length ? page[page.length - 1].id : null;
    return {
      status: 'success',
      response: {
        id: 'task-1',
        status: 'COMPLETED',
        result: { items: page, version: '2026-08-07', ttlSeconds: 21600, nextCursor },
      },
    };
  },
};

const catalogs = createCatalogs(fakeTransport);
clearHydratedCatalogs();

// ── Page-by-page loading ─────────────────────────────────────────────

const page1 = await catalogs.voices('heygen-video-avatar');
assert.strictEqual(page1.items.length, 100, 'one call fetches ONE page');
assert.strictEqual(executeCalls.length, 1);
assert.strictEqual(page1.items[0].id, 'hg-voice-0');
assert.strictEqual(page1.nextCursor, 'hg-voice-99', 'cursor points at the next page');

const page2 = await catalogs.voices('heygen-video-avatar', { cursor: page1.nextCursor! });
assert.strictEqual(page2.items.length, 50);
assert.strictEqual(page2.nextCursor, null, 'null when the list is complete');
assert.strictEqual(executeCalls.length, 2);

// ── Page cache: repeat calls do not hit the transport ────────────────

await catalogs.voices('heygen-video-avatar');
await catalogs.voices('heygen-video-avatar', { cursor: 'hg-voice-99' });
assert.strictEqual(executeCalls.length, 2, 'both pages must serve from cache');

// ── Returned pages are copies — caller mutation can't corrupt cache ──

page1.items.length = 0;
const again = await catalogs.voices('heygen-video-avatar');
assert.strictEqual(again.items.length, 100, 'cache must survive caller mutation');

// ── Loaded pages ACCUMULATE into the model's options ─────────────────

const voiceEntry = Model('heygen-video-avatar').params().catalog('voiceId');
assert.ok(voiceEntry);
assert.strictEqual(voiceEntry.kind, 'catalog');
const accumulatedVoices = voiceEntry.catalogOptions as VoiceOption[];
assert.strictEqual(accumulatedVoices.length, 150, 'both fetched pages visible on the model');
assert.strictEqual(accumulatedVoices[0].previewUrl, 'https://cdn/voice-0.mp3');

// Avatars: one page covers the full 30-item list.
const avatarsPage = await catalogs.avatars('heygen-video-avatar');
assert.strictEqual(avatarsPage.items.length, 30);
assert.strictEqual(avatarsPage.nextCursor, null);
const videoEntry = Model('heygen-video-avatar').params().catalog('videoId');
const avatarOptions = videoEntry?.catalogOptions as AvatarOption[];
assert.strictEqual(avatarOptions.length, 30);
assert.strictEqual(avatarOptions[0].previewImageUrl, 'https://cdn/avatar-0.webp');
assert.strictEqual(avatarOptions[0].defaultVoiceId, 'hg-voice-1');
assert.strictEqual(avatarOptions[0].gender, 'male');
assert.strictEqual(avatarOptions[0].provider, 'heygen');

// Catalog params are NOT enums — enum() and getEnumOptions() don't serve them.
assert.strictEqual(Model('heygen-video-avatar').params().enum('videoId'), undefined,
  'enum() must not serve catalog params (breaking, per review)');
assert.strictEqual(Model('heygen-video-avatar').params().getEnumOptions('voiceId'), null);

// Models sharing a catalog source hydrate together.
assert.strictEqual(
  (Model('heygen-talking-photo').params().catalog('voiceId')?.catalogOptions as VoiceOption[]).length,
  150,
);

// toSchema reports catalog params as free strings.
const schema = Model('heygen-video-avatar').params().toSchema();
assert.strictEqual(schema.videoId?.type, 'string');
assert.strictEqual(schema.videoId?.enum, undefined);

// ── getVoiceById searches loaded catalogs; `extra` outranks them ─────

assert.strictEqual(getVoiceById('hg-voice-7')?.name, 'Voice 7');
assert.strictEqual(getVoiceById('not-loaded-anywhere'), undefined);
const shadow: VoiceOption = { id: 'hg-voice-7', name: 'Caller Override', description: '', tags: [], provider: 'heygen' };
assert.strictEqual(getVoiceById('hg-voice-7', [shadow])?.name, 'Caller Override');

// ── forceRefresh drops the cached pages and refetches ────────────────

executeCalls = [];
const refreshed = await catalogs.voices('heygen-video-avatar', { forceRefresh: true });
assert.strictEqual(refreshed.items.length, 100);
assert.strictEqual(executeCalls.length, 1, 'forceRefresh refetches the first page only');

// ── Concurrent requests for the same page collapse ───────────────────

executeCalls = [];
const freshCatalogs = createCatalogs(fakeTransport);
const [a, b] = await Promise.all([
  freshCatalogs.avatars('heygen-video-avatar'),
  freshCatalogs.avatars('heygen-video-avatar'),
]);
assert.strictEqual(a.items.length, 30);
assert.strictEqual(b.items.length, 30);
assert.strictEqual(executeCalls.length, 1, 'same page fetched once');

// ── Validation: catalog params are free strings ──────────────────────

const validation = Model('heygen-video-avatar').validate({
  prompt: 'A long enough script for the avatar to speak.',
  videoId: 'not-in-the-loaded-list',
  voiceId: 'also-not-in-the-list',
  resolution: '720p',
  aspectRatio: '16:9',
});
assert.strictEqual(validation.valid, true, `catalog ids must not be membership-validated: ${validation.errors}`);

const seededParams = p.voiceId(
  [{ id: 'seed-1', name: 'Seed' }],
  'seed-1',
  { catalog: { workflow: 'fake/v1/catalog/voices' } },
);
assert.strictEqual(seededParams.voiceId.descriptor.kind, 'catalog');
assert.doesNotThrow(() => validateAll(seededParams, { voiceId: 'not-in-seed' }));
assert.throws(() => validateAll(seededParams, { voiceId: 42 }), /must be a string/);
// A plain voice list without a catalog binding stays a closed enum.
assert.strictEqual(p.voiceId([{ id: 'only' }], 'only').voiceId.descriptor.kind, 'enum');
assert.throws(() => validateAll(p.voiceId([{ id: 'only' }], 'only'), { voiceId: 'other' }), /must be one of/);

// ── transferValues: catalog ids reset to the target default ──────────

const transferred = Model('heygen-video-avatar').params().transferValues({
  voiceId: 'hg-voice-3',
  videoId: 'persisted-avatar-id',
});
assert.strictEqual(transferred.voiceId, '');
assert.strictEqual(transferred.videoId, '');
const plain = transferValues(p.voiceId([{ id: 'a' }, { id: 'b' }], 'a'), { voiceId: 'b' });
assert.strictEqual(plain.voiceId, 'b');

// ── Models without a bound catalog reject loudly ─────────────────────

await assert.rejects(
  () => catalogs.voices('flux-2-pro'),
  /has no runtime catalog on param "voiceId"/,
);

// ── Error paths ──────────────────────────────────────────────────────

{
  const catalogsErr = createCatalogs(fakeTransport);
  errorEnvelopeNext = true;
  await assert.rejects(
    () => catalogsErr.voices('heygen-video-avatar'),
    /workspace quota exceeded/,
  );
  // A transport failure rejects and cleans the in-flight slot — retry works.
  failNextExecute = 'gateway timeout';
  await assert.rejects(() => catalogsErr.avatars('heygen-video-avatar'), /gateway timeout/);
  executeCalls = [];
  const retried = await catalogsErr.avatars('heygen-video-avatar');
  assert.strictEqual(retried.items.length, 30);
  assert.strictEqual(executeCalls.length, 1);
}

// ── Abort isolation: one caller's abort must not reject the others ──

{
  const catalogsAbort = createCatalogs(fakeTransport);
  const controller = new AbortController();
  const first = catalogsAbort.voices('heygen-video-avatar', { signal: controller.signal });
  const second = catalogsAbort.voices('heygen-video-avatar');
  controller.abort();
  await assert.rejects(() => first, (e: Error) => e.name === 'AbortError' || /abort/i.test(String(e)));
  const survived = await second;
  assert.strictEqual(survived.items.length, 100, 'signal-less caller must survive a peer abort');
}

// ── forceRefresh while a page fetch is in flight: stale write dropped ─

{
  const resolvers: Array<(v: unknown) => void> = [];
  const deferred: SdkTransport = {
    execute() {
      return new Promise((resolve) => { resolvers.push(resolve); });
    },
  };
  const makePage = (version: string, items: CatalogItem[]) => ({
    status: 'success',
    response: { id: 't', status: 'COMPLETED', result: { items, version, ttlSeconds: 21600, nextCursor: null } },
  });
  clearHydratedCatalogs();
  const c = createCatalogs(deferred);
  const slow = c.avatars('heygen-video-avatar');                          // gen 0
  const fast = c.avatars('heygen-video-avatar', { forceRefresh: true });  // bumps gen → 1
  resolvers[1](makePage('new', avatarItems.slice(0, 5)));
  resolvers[0](makePage('old', avatarItems.slice(0, 2)));
  const [slowPage, fastPage] = await Promise.all([slow, fast]);
  assert.strictEqual(fastPage.items.length, 5);
  assert.strictEqual(slowPage.items.length, 2, 'the caller still gets its own page back');
  assert.strictEqual(
    (Model('heygen-video-avatar').params().catalog('videoId')?.catalogOptions as AvatarOption[]).length,
    5,
    'a pre-refresh fetch must not overwrite the refreshed options',
  );
}

// ── modelId filter passes through (seedaudio → bytedance catalog) ────

{
  executeCalls = [];
  const c = createCatalogs(fakeTransport);
  await c.voices('seed-audio-1.0');
  const sent = executeCalls[0].payload as Record<string, unknown>;
  assert.strictEqual(executeCalls[0].workflow, 'bytedance/v1/catalog/voices');
  assert.strictEqual(sent.modelId, 'seed-audio-1.0');
  // The multilingual variant is a DIFFERENT cache entry (different modelId).
  await c.voices('seed-audio-1.0-multilingual');
  assert.strictEqual(executeCalls.length, 2, 'per-modelId sources are cached separately');
}

// ── ttlSeconds floor: a 0-ttl response still caches for MIN_TTL ─────

{
  const zeroTtl: SdkTransport = {
    async execute(request) {
      executeCalls.push(request);
      return {
        status: 'success',
        response: {
          id: 't',
          status: 'COMPLETED',
          result: { items: avatarItems.slice(0, 3), version: 'v', ttlSeconds: 0, nextCursor: null },
        },
      };
    },
  };
  const c = createCatalogs(zeroTtl);
  executeCalls = [];
  await c.avatars('heygen-video-avatar');
  await c.avatars('heygen-video-avatar');
  assert.strictEqual(executeCalls.length, 1, 'ttlSeconds:0 must still cache for the floor duration');
}

// ── ttl expiry resets the store and refetches ────────────────────────

{
  const c = createCatalogs(fakeTransport);
  await c.voices('heygen-video-avatar');
  const realNow = Date.now;
  try {
    Date.now = () => realNow() + 22000 * 1000; // past the 21600s ttl
    executeCalls = [];
    await c.voices('heygen-video-avatar');
    assert.strictEqual(executeCalls.length, 1, 'expired store should refetch');
  } finally {
    Date.now = realNow;
  }
}

// ── preload: first page of every bound catalog, deduped by source ────

{
  clearHydratedCatalogs();
  executeCalls = [];
  createCatalogs(fakeTransport, { preload: true });
  await new Promise((r) => setTimeout(r, 0)); // let background fetches settle
  const requested = executeCalls.map((c) => {
    const p = c.payload as { modelId?: string };
    return `${c.workflow} ${p.modelId ?? ''}`;
  });
  assert.strictEqual(new Set(requested).size, requested.length, 'one request per unique source');
  assert.ok(requested.includes('heygen/v1/catalog/voices '), 'heygen voices preloaded');
  assert.ok(requested.includes('bytedance/v1/catalog/voices seed-audio-1.0'), 'modelId variants preloaded separately');
  // Pickers see the preloaded first page with zero explicit calls.
  assert.strictEqual(
    (Model('heygen-video-avatar').params().catalog('voiceId')?.catalogOptions as VoiceOption[]).length,
    100,
  );
}

// ── templates(): third catalog accessor, same machinery ─────────────

{
  const c = createCatalogs(fakeTransport);
  // Models without a template catalog reject cleanly, naming model and param.
  await assert.rejects(
    () => c.templates('heygen-video-avatar'),
    /has no runtime catalog on param "templateId"/,
  );

  // kling-video-effects: template is catalog-bound to the platform task.
  const entry = Model('kling-video-effects').params().catalog('templateId');
  assert.ok(entry);
  assert.strictEqual(entry.kind, 'catalog');
  assert.strictEqual(entry.default, 'korean_baseball');
  assert.strictEqual(
    entry.kind === 'catalog' && entry.source.workflow,
    'kling/v1/catalog/templates',
  );
  executeCalls = [];
  const page = await c.templates('kling-video-effects');
  assert.strictEqual(executeCalls[0].workflow, 'kling/v1/catalog/templates');
  assert.strictEqual(page.items.length, 5, 'stub page from the fake transport');

  // picsart-flow models share one catalog task, split by the modelId filter —
  // per-modelId sources are separate cache entries (seedaudio precedent).
  executeCalls = [];
  await c.templates('picsart-flow');
  await c.templates('picsart-flow-video');
  assert.strictEqual(executeCalls.length, 2);
  assert.strictEqual(executeCalls[0].workflow, 'picsart-flow/v1/catalog/templates');
  assert.strictEqual((executeCalls[0].payload as { modelId?: string }).modelId, 'picsart-flow');
  assert.strictEqual((executeCalls[1].payload as { modelId?: string }).modelId, 'picsart-flow-video');
}

// ── params.catalog() builder: any key, free-string descriptor ────────

{
  const built = p.catalog('templateId', {
    label: 'Effect',
    required: true,
    source: { workflow: 'kling/v1/catalog/templates' },
    default: 'korean_baseball',
  });
  const entry = built.templateId;
  assert.strictEqual(entry.label, 'Effect');
  assert.strictEqual(entry.required, true);
  assert.strictEqual(entry.descriptor.kind, 'catalog');
  assert.strictEqual(entry.descriptor.kind === 'catalog' && entry.descriptor.default, 'korean_baseball');
  // Free string: type-checked only, never membership-validated.
  assert.doesNotThrow(() => validateAll(built, { templateId: 'anything-goes' }));
  assert.throws(() => validateAll(built, { templateId: 42 }), /must be a string/);
  // Reset-to-default on model switch, like every catalog param.
  assert.strictEqual(transferValues(built, { templateId: 'hug_pro' }).templateId, 'korean_baseball');
}

// ── Hydration for non-voice/avatar keys stores raw CatalogItems ──────

{
  clearHydratedCatalogs();
  const source = { workflow: 'kling/v1/catalog/templates' };
  const effectItems: CatalogItem[] = [
    { id: 'hug_pro', name: 'Hug Pro', tags: ['Dual Image'],
      preview: { videoUrl: 'https://cdn/hug_pro.mp4' }, meta: { imageSlots: 2 } },
  ];
  installHydratedCatalog(source, 'templateId', effectItems, 'kling', '2026-08-10');
  const hydrated = getHydratedCatalog(source);
  assert.ok(hydrated);
  assert.strictEqual(hydrated.paramKey, 'templateId');
  assert.strictEqual(hydrated.catalogOptions, effectItems,
    'no adapter for template — raw CatalogItems ARE the options');
  const raw = hydrated.catalogOptions[0] as CatalogItem;
  assert.strictEqual((raw.meta as { imageSlots?: number }).imageSlots, 2);
  // Raw items must NOT leak into voice lookups.
  assert.strictEqual(getVoiceById('hug_pro'), undefined);
}

// ── Cleanup so other test files see pristine state ───────────────────

clearHydratedCatalogs();
assert.strictEqual(
  (Model('heygen-video-avatar').params().catalog('videoId')?.catalogOptions as AvatarOption[]).length,
  0,
);

console.log('catalogs.test.ts passed');

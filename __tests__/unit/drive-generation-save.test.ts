import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createClient } from '../../src/client/index.ts';
import { createApis } from '../../src/client/apis.ts';
import { createDriveClient, parseGeneration, type PayloadDriveOptions } from '../../src/client/drive.ts';
import type { WorkflowsClient } from '@picsart/workflows-client';
import type { SdkTransport } from '../../src/core/workflow.ts';

const folder = { uid: 'folder-1', name: 'AI' };
const save = { url: 'https://cdn.test/video.mp4', name: 'video.mp4', resourceType: 'VIDEO' as const };
function captureDrive() {
  const bodies: Record<string, any>[] = [];
  const drive = createDriveClient(async (_url, init) => {
    bodies.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({ response: { uid: 'saved-1' } }));
  }, 'https://api.test', 'AI');
  const attributes = () => Object.fromEntries(bodies.at(-1)!.attributes.map((a: any) => [a.property, a.value]));
  return { drive, bodies, attributes };
}

test('explicit generation save persists all inputs and protects them from custom attributes', async () => {
  const { drive, attributes } = captureDrive();
  const params = { prompt: 'a cat', duration: 5, generateAudio: false, seed: 0, imageUrls: ['https://cdn.test/ref.png'] };
  await drive.save({ ...save, generation: { modelId: 'video-model', params },
    attributes: { model: 'wrong', aiSDKPayload: '{}', custom: 'kept' } }, folder);
  assert.equal(attributes().model, 'video-model');
  assert.equal(attributes().custom, 'kept');
  assert.deepEqual(JSON.parse(attributes().aiSDKPayload), params);
});

test('legacy save calls persist canonical metadata, generic uploads do not invent it', async () => {
  const { drive, attributes } = captureDrive();
  await drive.save({ ...save, attributes: { model: 'legacy-model', prompt: 'hello', duration: '5',
    textScript: JSON.stringify({ resolution: '720p', referenceImageUrls: ['https://cdn.test/ref.png'] }) } }, folder);
  assert.deepEqual(JSON.parse(attributes().aiSDKPayload), { prompt: 'hello', resolution: '720p', duration: 5,
    imageUrls: ['https://cdn.test/ref.png'] });
  await drive.save(save, folder);
  assert.deepEqual(attributes(), {});
});

test('save helper accepts full params and retains legacy positional prompt', () => {
  const { drive } = captureDrive();
  const full = drive.buildSaveParams(save.url, 'model', 'Model', 'video', { prompt: 'hello', duration: 5, seed: 0 });
  assert.deepEqual(JSON.parse(full.attributes!.aiSDKPayload), { prompt: 'hello', duration: 5, seed: 0 });
  const legacy = drive.buildSaveParams(save.url, 'model', 'Model', 'video', 'hello');
  assert.deepEqual(JSON.parse(legacy.attributes!.aiSDKPayload), { prompt: 'hello' });
});

test('generate and submit cannot lose provenance through custom Drive attributes', async () => {
  const payloads: any[] = [];
  const transport: SdkTransport = {
    async execute(request) { payloads.push(request.payload); return { result: { url: save.url } }; },
    async submit(request) { payloads.push(request.payload); return 'job-1'; },
    async poll() { return { result: { url: save.url } }; },
  };
  const client = createClient({ transport });
  const options = { drive: { name: 'asset.png', attributes: { model: 'wrong', aiSDKPayload: '{}', custom: 'kept' } } as PayloadDriveOptions };
  await client.generate('flux-2-pro', { prompt: 'a cat' }, options);
  await client.submit('flux-2-pro', { prompt: 'a dog' }, options);
  assert.equal(payloads.length, 2);
  for (const payload of payloads) {
    const attrs = payload.options.drive.attributes;
    assert.equal(attrs.model, 'flux-2-pro');
    assert.equal(attrs.custom, 'kept');
    assert.ok(['a cat', 'a dog'].includes(JSON.parse(attrs.aiSDKPayload).prompt));
  }
  assert.equal(options.drive.attributes!.model, 'wrong', 'caller options are not mutated');
});

test('raw APIs pass vendor payloads through unchanged, including explicit Drive options', async () => {
  const calls: unknown[] = [];
  const apis = createApis({ async run(_api: string, payload: unknown) { calls.push(payload); return { result: {} }; } } as unknown as WorkflowsClient);
  const payload = { prompt: 'a cat', image_url: 'https://cdn.test/ref.png', aspect_ratio: '16:9',
    options: { drive: { name: 'clip.mp4' } } };
  await apis.run('vendor/model/video', payload);
  assert.equal(calls[0], payload);
  assert.equal('attributes' in payload.options.drive, false);
  const supplied = { ...payload, options: { drive: { name: 'clip.mp4', attributes: { model: 'sdk-model',
    aiSDKPayload: JSON.stringify({ prompt: 'original', imageUrls: ['https://cdn.test/ref.png'], aspectRatio: '16:9' }) } } } };
  await apis.run('vendor/model/video', supplied);
  assert.equal(calls[1], supplied);
  const noDrive = { prompt: 'hello' };
  await apis.run('vendor/model/video', noDrive);
  assert.equal(calls[2], noDrive);
});

test('legacy normalization retains app identity when read back from stored attributes', async () => {
  const { drive, attributes } = captureDrive();
  await drive.save({ ...save, attributes: { model: 'legacy-model', prompt: 'hello', tool: 'ai-playground' } }, folder);
  const generation = parseGeneration({ uid: 'saved-1', attributes: attributes() });
  assert.equal(generation.appId, 'com.picsart.ai-playground');
  assert.equal(generation.appType, 'miniapp');
  await drive.save({ ...save, attributes: { model: 'legacy-model', tool: 'ai-playground', appId: 'custom', appType: 'native' } }, folder);
  assert.equal(attributes().appId, 'custom');
  assert.equal(attributes().appType, 'native');
});

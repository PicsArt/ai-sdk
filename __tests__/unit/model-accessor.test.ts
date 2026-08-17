import assert from 'node:assert';
import { Model, catalog } from '../../src/core/descriptors/model-accessor.ts';

// ── Top-level: id and name ──────────────────────────────────────────

const m = Model('flux-2-pro');
assert.strictEqual(m.id, 'flux-2-pro');
assert.strictEqual(m.name, 'Flux 2 Pro');

// ── params() — parameter accessor ──────────────────────────────────

const p = m.params();

// hasParam
assert.strictEqual(p.hasParam('aspectRatio'), true);
assert.strictEqual(p.hasParam('nonexistent'), false);

// all() returns flat param array
const all = p.all();
assert(Array.isArray(all));
assert(all.length > 0);
assert(all.some(e => e.key === 'aspectRatio'));

// enum accessor
const ar = p.enum('aspectRatio');
assert(ar, 'aspectRatio should be an enum');
assert.strictEqual(ar!.kind, 'enum');
assert(ar!.options.length > 0);

// well-known shorthands
assert(p.aspectRatio(), 'aspectRatio() shorthand should work');
// prompt() may be undefined for models where prompt is implicit (not in paramConfig)
const promptEntry = p.prompt();
// just verify it doesn't throw
assert(promptEntry === undefined || promptEntry.kind === 'text');

// hasFileInput
assert.strictEqual(p.hasFileInput(), true, 'flux-2-pro accepts image input');

// getDefault
const defAr = p.getDefault('aspectRatio');
assert(defAr != null, 'aspectRatio should have a default');

// getDefaults
const defaults = p.getDefaults();
assert(typeof defaults === 'object');
assert('aspectRatio' in defaults);

// getEnumOptions
const arOptions = p.getEnumOptions('aspectRatio');
assert(Array.isArray(arOptions));
assert(arOptions!.length > 0);

// file
const imgParam = p.file('imageUrls');
assert(imgParam, 'flux-2-pro should have imageUrls');
assert(typeof imgParam!.array?.max === 'number');

// toSchema
const schema = p.toSchema();
assert(schema && typeof schema === 'object');
assert('aspectRatio' in schema);

// transferValues
const transferred = p.transferValues({ aspectRatio: '1:1', unknownKey: 'x' });
assert(typeof transferred === 'object');

// ── meta() — model metadata ────────────────────────────────────────

const meta = m.meta();
assert.strictEqual(meta.mode, 'image');
assert.strictEqual(meta.inputType, 't2i');
assert(typeof meta.description === 'string');
assert(Array.isArray(meta.features));
assert(Array.isArray(meta.badges));

// provider sub-object
assert(meta.provider);
assert.strictEqual(meta.provider.id, 'flux');
assert.strictEqual(typeof meta.provider.name, 'string');
assert(meta.provider.name.length > 0);
assert(typeof meta.provider.color === 'string');
assert(typeof meta.provider.label === 'string');

// badges normalized to array (even if undefined on definition)
const klingMeta = Model('kling-v3').meta();
assert(Array.isArray(klingMeta.badges));

// ── Lazy instantiation — same reference ─────────────────────────────

assert.strictEqual(m.params(), m.params(), 'params() should return same instance');
assert.strictEqual(m.meta(), m.meta(), 'meta() should return same instance');

// ── api — workflow identifiers ─────────────────────────────────────

assert(typeof m.api.workflow === 'string' && m.api.workflow.length > 0, 'workflow should be a non-empty string');
assert(m.api.editWorkflow === undefined || typeof m.api.editWorkflow === 'string',
  'editWorkflow should be string or undefined');

// ── catalog.all() ────────────────────────────────────────────────────

const allModels = catalog.all();
assert(Array.isArray(allModels), 'catalog.all() should return an array');
assert(allModels.length > 0, 'catalog.all() should return at least one model');
assert(allModels.every(d => d.id && d.name), 'every descriptor should have id and name');
assert(allModels.every(d => typeof d.params === 'function' && typeof d.meta === 'function'),
  'every descriptor should have params() and meta()');

// ── catalog.find() — by output ──────────────────────────────────────

const videoModels = catalog.find({ output: 'video' });
assert(videoModels.length > 0, 'should find video models');
assert(videoModels.every(d => d.meta().mode === 'video'), 'all should be video mode');

// ── catalog.find() — by provider ────────────────────────────────────

const klingModels = catalog.find({ provider: 'kling' });
assert(klingModels.length > 0, 'should find kling models');
assert(klingModels.every(d => d.meta().provider.id === 'kling'), 'all should be kling provider');

// ── catalog.find() — combined filters ───────────────────────────────

const klingVideo = catalog.find({ provider: 'kling', output: 'video' });
assert(klingVideo.every(d => d.meta().provider.id === 'kling' && d.meta().mode === 'video'),
  'combined filter should match both criteria');

// ── catalog.search() ─────────────────────────────────────────────────

const searchResults = catalog.search('flux');
assert(searchResults.length > 0, 'should find flux models');
assert(searchResults.every(d => typeof d.params === 'function'), 'search results should be descriptors');
assert(searchResults.every(d => {
  const q = 'flux';
  return d.id.toLowerCase().includes(q) ||
    d.name.toLowerCase().includes(q) ||
    d.meta().provider.id.toLowerCase().includes(q);
}), 'search results should match query');

// ── catalog.search() — case insensitive ──────────────────────────────

const upperSearch = catalog.search('FLUX');
assert(upperSearch.length === searchResults.length, 'search should be case-insensitive');

// \u2500\u2500 Model(id).validate() \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const okValidate = Model('flux-2-pro').validate({ prompt: 'a cat' });
assert.strictEqual(okValidate.valid, true, 'valid input should pass');
assert.strictEqual(okValidate.errors, undefined, 'valid input should have no errors');

const missingPrompt = Model('flux-2-pro').validate({});
assert.strictEqual(missingPrompt.valid, false, 'missing required prompt should fail');
assert(Array.isArray(missingPrompt.errors) && missingPrompt.errors.length > 0, 'should report errors');

const notAnObject = Model('flux-2-pro').validate('nope');
assert.strictEqual(notAnObject.valid, false, 'non-object input should fail without throwing');

// \u2500\u2500 FileDescriptor.maxShortSidePixels \u2014 upscaler source ceiling \u2500\u2500\u2500\u2500\u2500
// The ByteDance 1080p upscaler rejects sources whose shorter side is \u2265 1080
// ("must have one side of length less than 1080 pixels"), so the catalog caps
// the short side at 1079 for client-side enforcement at upload.

const upscalerVideo = Model('bytedance-video-upscaler').params().file('videoUrl');
assert(upscalerVideo, 'bytedance-video-upscaler should have a videoUrl file param');
assert.strictEqual(upscalerVideo!.maxShortSidePixels, 1079, 'upscaler source short side must be capped below 1080');

// \u2500\u2500 FileDescriptor.maxBytes: vendor file-size cap \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Seedance 2.5 rejects any video file over 200 MiB ("video size (bytes) ... must
// be less than or equal to 209715200"), on every mode that posts a
// reference_video: t2v references, video edit and video extend.

for (const [modelId, key] of [
  ['seedance-2.5', 'videoUrls'],
  ['seedance-2.5-video-edit', 'videoUrl'],
  ['seedance-2.5-video-extend', 'videoUrls'],
] as const) {
  const videoSlot = Model(modelId).params().file(key);
  assert(videoSlot, `${modelId} should have a ${key} file param`);
  assert.strictEqual(videoSlot!.maxBytes, 209_715_200, `${modelId} video slot must cap files at 200 MiB`);
}

console.log('\u2713 model-accessor.test.ts \u2014 all passed');

/**
 * Model() / catalog accessor machinery — dynamic-only, against an installed
 * fixture catalog. Exercises the accessor surface (params/meta/api,
 * enum/file/range shorthands, catalog.all/find/search, validate); the bundled
 * catalog's model-specific data is no longer shipped, so this tests mechanics,
 * not vendor rows.
 */
import assert from 'node:assert';
import { Model, catalog } from '../../src/core/descriptors/model-accessor.ts';
import { p as presets } from '../../src/core/descriptors/presets.ts';
import { installCatalog } from '../../src/core/active-catalog.ts';
import type { FileDescriptor } from '../../src/core/descriptors/types.ts';
import { FLUX, CLAUDE, KLING, RICH } from './helpers/fixture-catalog.ts';

installCatalog([FLUX, CLAUDE, KLING, RICH]);

// ── Top-level: id and name ──────────────────────────────────────────

const m = Model('rich-fixture');
assert.strictEqual(m.id, 'rich-fixture');
assert.strictEqual(m.name, 'Rich Fixture');

// ── params() — parameter accessor ──────────────────────────────────

const p = m.params();

assert.strictEqual(p.hasParam('aspectRatio'), true);
assert.strictEqual(p.hasParam('nonexistent'), false);

const all = p.all();
assert(Array.isArray(all) && all.length > 0);
assert(all.some((e) => e.key === 'aspectRatio'));

// enum accessor
const ar = p.enum('aspectRatio');
assert(ar, 'aspectRatio should be an enum');
assert.strictEqual(ar!.kind, 'enum');
assert(ar!.options.length > 0);

// well-known shorthands
assert(p.aspectRatio(), 'aspectRatio() shorthand should work');
const promptEntry = p.prompt();
assert(promptEntry === undefined || promptEntry.kind === 'text');

// hasFileInput
assert.strictEqual(p.hasFileInput(), true, 'rich fixture accepts image input');

// getDefault / getDefaults
assert(p.getDefault('aspectRatio') != null, 'aspectRatio should have a default');
const defaults = p.getDefaults();
assert(typeof defaults === 'object' && 'aspectRatio' in defaults);

// range accessor
const steps = p.range('steps');
assert(steps && steps.kind === 'range', 'steps should be a range');

// file accessor + bounds threaded through
const imgParam = p.file('image');
assert(imgParam, 'rich fixture should have an image file param');
assert.strictEqual(imgParam!.maxShortSidePixels, 4096, 'file bounds must survive onto the accessor');

// toSchema
const schema = p.toSchema();
assert(schema && typeof schema === 'object' && 'aspectRatio' in schema);

// transferValues
assert(typeof p.transferValues({ aspectRatio: '1:1', unknownKey: 'x' }) === 'object');

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
assert(typeof meta.provider.name === 'string' && meta.provider.name.length > 0);
assert(typeof meta.provider.color === 'string');
assert(typeof meta.provider.label === 'string');

// badges normalized to array (even if undefined on definition)
assert(Array.isArray(Model('kling-v3').meta().badges));

// ── Lazy instantiation — same reference ─────────────────────────────

assert.strictEqual(m.params(), m.params(), 'params() should return same instance');
assert.strictEqual(m.meta(), m.meta(), 'meta() should return same instance');

// ── api — workflow identifiers ─────────────────────────────────────

assert(typeof m.api.workflow === 'string' && m.api.workflow.length > 0);
assert.strictEqual(m.api.editWorkflow, 'fixture/v1/rich-edit');

// ── catalog.all() ────────────────────────────────────────────────────

const allModels = catalog.all();
assert(Array.isArray(allModels) && allModels.length === 4);
assert(allModels.every((d) => d.id && d.name));
assert(allModels.every((d) => typeof d.params === 'function' && typeof d.meta === 'function'));

// ── catalog.find() — by output / provider / combined ────────────────

const videoModels = catalog.find({ output: 'video' });
assert(videoModels.length > 0 && videoModels.every((d) => d.meta().mode === 'video'));

const klingModels = catalog.find({ provider: 'kling' });
assert(klingModels.length > 0 && klingModels.every((d) => d.meta().provider.id === 'kling'));

const klingVideo = catalog.find({ provider: 'kling', output: 'video' });
assert(klingVideo.every((d) => d.meta().provider.id === 'kling' && d.meta().mode === 'video'));

// ── catalog.search() — case insensitive ─────────────────────────────

const searchResults = catalog.search('flux');
assert(searchResults.length > 0);
assert(searchResults.every((d) =>
  d.id.toLowerCase().includes('flux')
  || d.name.toLowerCase().includes('flux')
  || d.meta().provider.id.toLowerCase().includes('flux')));
assert.strictEqual(catalog.search('FLUX').length, searchResults.length, 'search is case-insensitive');

// ── Model(id).validate() ────────────────────────────────────────────

const okValidate = Model('flux-2-pro').validate({ prompt: 'a cat' });
assert.strictEqual(okValidate.valid, true, 'valid input should pass');
assert.strictEqual(okValidate.errors, undefined, 'valid input should have no errors');

const missingPrompt = Model('flux-2-pro').validate({});
assert.strictEqual(missingPrompt.valid, false, 'missing required prompt should fail');
assert(Array.isArray(missingPrompt.errors) && missingPrompt.errors.length > 0);

const notAnObject = Model('flux-2-pro').validate('nope');
assert.strictEqual(notAnObject.valid, false, 'non-object input should fail without throwing');

// ── p.file() threads/omits bounds ───────────────────────────────────

const sideBound = presets.file('imageUrls', 'image', { minSidePixels: 300 }).imageUrls
  .descriptor as FileDescriptor;
assert.strictEqual(sideBound.minSidePixels, 300, 'p.file should thread minSidePixels through');
assert.strictEqual(sideBound.minPixels, undefined, 'p.file should not invent a total-pixel floor');

const noBound = presets.file('imageUrls', 'image').imageUrls.descriptor as FileDescriptor;
assert.strictEqual(noBound.minSidePixels, undefined, 'p.file should omit minSidePixels when unset');

console.log('✓ model-accessor.test.ts — all passed');

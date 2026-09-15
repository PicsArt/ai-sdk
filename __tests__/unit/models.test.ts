import assert from 'node:assert';
import { Flux2Pro } from '../../src/generated/model-constants.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import { getVoiceById } from '../../src/core/voices.ts';
import { ALL_MODELS } from '../../src/vendors/catalog/index.ts';
import { catalog, Model } from '../../src/core/descriptors/model-accessor.ts';

// ── Direct model access ─────────────────────────────────────────────

assert(Flux2Pro, 'Flux2Pro should exist');
assert.strictEqual(Flux2Pro, 'flux-2-pro');

const fluxDef = resolveModel(Flux2Pro);
assert.strictEqual(fluxDef.id, 'flux-2-pro');
assert.strictEqual(fluxDef.name, 'Flux 2 Pro');
assert.strictEqual(fluxDef.mode, 'image');
assert.strictEqual(fluxDef.provider, 'flux');
assert.ok(fluxDef.paramConfig, 'paramConfig should be defined');
assert.ok(fluxDef.paramConfig.aspectRatio, 'aspectRatio should be in paramConfig');

// ── Catalog listing (replaces Models.list()) ────────────────────────

assert(Array.isArray(ALL_MODELS), 'ALL_MODELS should be an array');
assert(ALL_MODELS.length >= 50, `Expected 50+ models, got ${ALL_MODELS.length}`);

const videoModels = catalog.find({ output: 'video' });
assert(videoModels.length > 0, 'should have video models');
assert(videoModels.every((m) => m.meta().mode === 'video'));

const imageModels = catalog.find({ output: 'image' });
assert(imageModels.length > 0, 'should have image models');

// ── Model(id).validate() (replaces Models.validate()) ───────────────

const validResult = Model(Flux2Pro).validate({ prompt: 'A beautiful sunset' });
assert.strictEqual(validResult.valid, true);

const invalidResult = Model(Flux2Pro).validate({ prompt: '' });
assert.strictEqual(invalidResult.valid, false);
assert(invalidResult.errors!.length > 0);

// ── Model(id).params().toSchema() (replaces Models.toSchema()) ──────

const schema = Model(Flux2Pro).params().toSchema();
assert(schema && typeof schema === 'object');
assert('aspectRatio' in schema);

// ── Provider metadata on model ───────────────────────────────────────

assert.strictEqual(fluxDef.providerName, 'Flux');
assert.strictEqual(typeof fluxDef.providerColor, 'string');
assert(fluxDef.providerColor.startsWith('#'));
assert.strictEqual(fluxDef.providerLabel, 'F');

// ── getVoiceById() ──────────────────────────────────────────────────

// Voice lists are not bundled — getVoiceById resolves only loaded catalogs.
assert.strictEqual(getVoiceById('nonexistent'), undefined);

console.log('\u2713 models.test.ts \u2014 all passed');

import assert from 'node:assert';
import { Models, Flux2Pro } from '../../src/generated/model-constants.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import { getVoiceById } from '../../src/core/voices.ts';

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

// ── Models.list() ───────────────────────────────────────────────────

const all = Models.list();
assert(Array.isArray(all), 'list() should return an array');
assert(all.length >= 50, `Expected 50+ models, got ${all.length}`);

const videoModels = Models.list({ mode: 'video' });
assert(videoModels.length > 0, 'should have video models');
assert(videoModels.every((m: { mode: string }) => m.mode === 'video'));

const imageModels = Models.list({ mode: 'image' });
assert(imageModels.length > 0, 'should have image models');

// ── Models.validate() ───────────────────────────────────────────────

const validResult = Models.validate(Flux2Pro, { prompt: 'A beautiful sunset' });
assert.strictEqual(validResult.valid, true);

const invalidResult = Models.validate(Flux2Pro, { prompt: '' });
assert.strictEqual(invalidResult.valid, false);
assert(invalidResult.errors!.length > 0);

// ── Models.toSchema() ───────────────────────────────────────────────

const schema = Models.toSchema(Flux2Pro);
assert(schema && typeof schema === 'object');
assert('aspectRatio' in schema);

// ── Provider metadata on model ───────────────────────────────────────

assert.strictEqual(fluxDef.providerName, 'Flux');
assert.strictEqual(typeof fluxDef.providerColor, 'string');
assert(fluxDef.providerColor.startsWith('#'));
assert.strictEqual(fluxDef.providerLabel, 'F');

// ── getVoiceById() ──────────────────────────────────────────────────

const voice = getVoiceById('alloy');
assert(voice, 'should find alloy voice');
assert.strictEqual(voice!.name, 'Alloy');
assert.strictEqual(getVoiceById('nonexistent'), undefined);

console.log('\u2713 models.test.ts \u2014 all passed');

import assert from 'node:assert';
import { Models, Flux2Pro, KlingV3 } from '../../src/generated/model-constants.ts';

// ── Models.list() returns 50+ models ────────────────────────────────

const all = Models.list();
assert(Array.isArray(all), 'list() should return an array');
assert(all.length >= 50, `Expected 50+ models, got ${all.length}`);

// ── Constants are typed string model IDs ────────────────────────────

assert.strictEqual(Flux2Pro, 'flux-2-pro');
assert.strictEqual(typeof Flux2Pro, 'string');

assert.strictEqual(KlingV3, 'kling-v3');

// Namespace access returns strings too
assert.strictEqual(Models.Flux2Pro, 'flux-2-pro');
assert.strictEqual(Models.KlingV3, 'kling-v3');

// ── Models.toSchema() accepts string IDs ────────────────────────────

const schema = Models.toSchema(Flux2Pro);
assert(schema && typeof schema === 'object');
assert('aspectRatio' in schema);

// Also works with plain string
const schema2 = Models.toSchema('flux-2-pro');
assert(schema2 && typeof schema2 === 'object');

console.log('\u2713 model-constants.test.ts \u2014 all passed');

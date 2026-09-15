import assert from 'node:assert';
import { Models, Flux2Pro, KlingV3 } from '../../src/generated/model-constants.ts';
import { Model } from '../../src/core/descriptors/model-accessor.ts';

// ── The Models namespace carries every id constant ──────────────────

const idCount = Object.keys(Models).length;
assert(idCount >= 50, `Expected 50+ model-id constants, got ${idCount}`);

// ── Constants are typed string model IDs ────────────────────────────

assert.strictEqual(Flux2Pro, 'flux-2-pro');
assert.strictEqual(typeof Flux2Pro, 'string');

assert.strictEqual(KlingV3, 'kling-v3');

// Namespace access returns strings too
assert.strictEqual(Models.Flux2Pro, 'flux-2-pro');
assert.strictEqual(Models.KlingV3, 'kling-v3');

// ── Model(id).params().toSchema() accepts the constants ─────────────

const schema = Model(Flux2Pro).params().toSchema();
assert(schema && typeof schema === 'object');
assert('aspectRatio' in schema);

// Also works with plain string
const schema2 = Model('flux-2-pro').params().toSchema();
assert(schema2 && typeof schema2 === 'object');

console.log('\u2713 model-constants.test.ts \u2014 all passed');

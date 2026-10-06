/**
 * ObjectDescriptor `additionalProperties` tests — JSON-Schema semantics.
 *
 * With no `fields`, an object descriptor + additionalProperties is an
 * open-keyed dictionary (caller-chosen keys, each value validated against the
 * descriptor) — the shape typesafe-evaluate's `questions` uses. Alongside
 * `fields`, it admits vendor-defined extras; `{ kind: 'unknown' }` passes
 * them through unvalidated.
 *
 * Also pins nested-`required` behavior: a nested field is enforced only when
 * it sets `required: true` explicitly — the unset default stays lenient at
 * runtime (compile-time stays strict via the generated ModelInput).
 */
import assert from 'node:assert';
import { validateAll } from '../../src/core/descriptors/utils.ts';
import type { ModelParams } from '../../src/core/descriptors/types.ts';

const params: ModelParams = {
  questions: {
    label: 'Questions',
    required: true,
    descriptor: {
      kind: 'object',
      additionalProperties: {
        kind: 'object',
        fields: {
          type: { kind: 'enum', valueType: 'string', options: [{ id: 'noul' }, { id: 'choice' }, { id: 'score' }], default: 'noul', required: true },
          // String or structured instruction object — vendor-defined, so only
          // presence is enforced.
          instructions: { kind: 'unknown', required: true },
          reasoning: { kind: 'boolean', default: false, required: false },
        },
        additionalProperties: { kind: 'unknown' },
      },
    },
  },
};

// Valid dictionary — caller-chosen keys; optional declared field on one entry,
// undeclared extras (choice options) riding the unknown passthrough on another,
// and `instructions` as either a string or a structured object (unknown kind).
validateAll(params, {
  questions: {
    is_safe: { type: 'noul', instructions: 'Is this content safe?' },
    tone: { type: 'choice', instructions: 'Pick the tone.', reasoning: true, options: ['pos', 'neg'] },
    style: { type: 'noul', instructions: { goal: 'Check brand style', rubric: ['logo', 'colors'] } },
  },
});

// `unknown` enforces presence only — an absent required field still fails.
assert.throws(
  () => validateAll(params, { questions: { q: { type: 'noul' } } }),
  /"questions.q.instructions" is required/,
  'unknown kind still enforces required',
);

// Wrong container shapes.
assert.throws(
  () => validateAll(params, { questions: 'is it safe?' }),
  /"questions" must be an object/,
  'string rejected',
);
assert.throws(
  () => validateAll(params, { questions: [{ type: 'noul', instructions: 'x' }] }),
  /"questions" must be an object/,
  'array rejected',
);

// Dictionary values must match the additionalProperties descriptor.
assert.throws(
  () => validateAll(params, { questions: { is_safe: 'yes' } }),
  /"questions.is_safe" must be an object/,
  'non-object value rejected',
);

// Nested fields validate per entry, with the dictionary key in the error path.
assert.throws(
  () => validateAll(params, { questions: { tone: { type: 'maybe', instructions: 'x' } } }),
  /"questions.tone.type" must be one of: noul, choice, score/,
  'nested enum enforced',
);

// Required param: absent and empty dictionary both rejected; optional empty passes.
assert.throws(() => validateAll(params, {}), /"questions" is required/, 'absent rejected');
assert.throws(() => validateAll(params, { questions: {} }), /"questions" is required/, 'empty dictionary rejected');
validateAll(
  { tags: { descriptor: { kind: 'object', additionalProperties: { kind: 'text' } } } },
  { tags: {} },
);

// Typed (non-unknown) additionalProperties validate each extra value.
const typedDict: ModelParams = {
  tags: { descriptor: { kind: 'object', additionalProperties: { kind: 'text' } } },
};
validateAll(typedDict, { tags: { a: 'x', b: 'y' } });
assert.throws(
  () => validateAll(typedDict, { tags: { a: 42 } }),
  /"tags.a" must be a string/,
  'typed extras validated',
);

// Closed shape (fields, no additionalProperties) — extras still pass at
// runtime; only declared fields are checked. The generated type is what
// keeps closed shapes closed at compile time.
validateAll(
  { item: { descriptor: { kind: 'object', fields: { id: { kind: 'text', required: true } } } } },
  { item: { id: 'x', extra: 'ignored' } },
);

console.log('✓ object-additional-properties.test.ts — all passed');

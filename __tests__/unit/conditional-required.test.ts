/**
 * Conditional `required` constraints: a rule whose `when` matches makes a param
 * required. Pins the three places that must agree on it, so a UI gate that
 * reads `paramsFor()` refuses exactly what `validate()` and submit refuse:
 *   - `paramsFor(values)` reports the param as required, with the rule's reason;
 *   - `Model(id).validate()` rejects the values;
 *   - `prepareRequest` rejects them before any payload is built.
 * Cases are the "prompt or media" rules the payload builders used to be the
 * only holders of (LTX 2.3 A2V, Wan 3.0, Seedance 2.5).
 */
import assert from 'node:assert';
import { evaluateConstraints, evaluateRequirements } from '../../src/core/constraints.ts';
import { validateAll } from '../../src/core/descriptors/utils.ts';
import { Model } from '../../src/core/descriptors/model-accessor.ts';
import { prepareRequest } from '../../src/client/prepare.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import { p as presets } from '../../src/core/descriptors/presets.ts';
import type { Constraint, GenerationContext } from '../../src/core/types.ts';

type RequestParams = Parameters<typeof prepareRequest>[1];

const AUDIO = 'https://cdn/track.mp3';
const IMAGE = 'https://cdn/frame.png';
const VIDEO = 'https://cdn/ref.mp4';

// ── Evaluator ──────────────────────────────────────────────────────

const promptOrImage: Constraint[] = [
  { when: { prompt: { exists: false }, imageUrls: { exists: false } }, then: {
    prompt: { required: true, reason: 'Add a prompt or an image.' },
  } },
];

{
  const requirements = evaluateRequirements(promptOrImage, {});
  assert.deepStrictEqual([...requirements.keys()], ['prompt']);
  assert.strictEqual(requirements.get('prompt')?.reason, 'Add a prompt or an image.');
  assert.strictEqual(evaluateRequirements(promptOrImage, { imageUrls: [IMAGE] }).size, 0);
  assert.strictEqual(evaluateRequirements(promptOrImage, { prompt: 'a cat' }).size, 0);
  // An empty array counts as absent, same as the `exists` operator everywhere else.
  assert.strictEqual(evaluateRequirements(promptOrImage, { imageUrls: [] }).size, 1);
  // So does a whitespace-only prompt: it must not satisfy the rule it is
  // required by, since validateAll then counts it as absent anyway.
  assert.strictEqual(evaluateRequirements(promptOrImage, { prompt: '   ' }).size, 1);
}

// `required` stays out of the disabled/allowed merge, so it cannot mask or be
// masked by another restriction on the same key.
{
  const mixed: Constraint[] = [
    ...promptOrImage,
    { when: { prompt: { exists: false } }, then: { prompt: { disabled: true, reason: 'locked' } } },
  ];
  const effects = evaluateConstraints(mixed, {});
  assert.deepStrictEqual(effects.get('prompt'), { kind: 'disabled', reason: 'locked' });
  assert.strictEqual(evaluateRequirements(mixed, {}).get('prompt')?.reason, 'Add a prompt or an image.');
  assert.strictEqual(evaluateConstraints(promptOrImage, {}).size, 0);
}

// validateAll: static rules first, then the conditional ones, with the static
// message shape plus the reason.
{
  const params = { ...presets.prompt({ required: false }) };
  assert.throws(() => validateAll(params, {}, promptOrImage), /^Error: "prompt" is required: Add a prompt or an image\.$/);
  // A blank prompt is absent too, as it is for a statically required one.
  assert.throws(() => validateAll(params, { prompt: '   ' }, [
    { when: { imageUrls: { exists: false } }, then: { prompt: { required: true } } },
  ]), /^Error: "prompt" is required$/);
  assert.doesNotThrow(() => validateAll(params, { imageUrls: [IMAGE] }, promptOrImage));
  assert.doesNotThrow(() => validateAll(params, {}));
}

// ── Catalog rules ──────────────────────────────────────────────────

interface Case {
  id: string;
  /** Satisfies every static rule, and none of the alternatives. */
  bare: Partial<GenerationContext> & Record<string, unknown>;
  /** Each one alone satisfies the conditional rule. */
  alternatives: Array<Partial<GenerationContext> & Record<string, unknown>>;
  reason: RegExp;
}

const CASES: Case[] = [
  {
    id: 'ltx-2.3-a2v',
    bare: { audioUrl: AUDIO },
    alternatives: [{ prompt: 'a dancer' }, { imageUrls: [IMAGE] }],
    reason: /first-frame image/,
  },
  ...['wan-3.0-video', 'wan-3.0-video-prime'].map((id): Case => ({
    id,
    bare: {},
    alternatives: [
      { prompt: 'a dancer' }, { startFrame: IMAGE }, { imageUrls: [IMAGE] },
      { videoUrls: [VIDEO] }, { audioUrls: [AUDIO] },
    ],
    reason: /frame or reference/,
  })),
  ...['seedance-2.5', 'seedance-2.5-without-moderation'].map((id): Case => ({
    id,
    bare: {},
    alternatives: [
      { prompt: 'a dancer' }, { imageUrls: [IMAGE] }, { videoUrls: [VIDEO] },
      { startFrame: IMAGE },
      { draftTask: { id: 'cgt-1', video_input: false, signature: 'sig' } },
    ],
    reason: /image, video, or audio/,
  })),
];

for (const { id, bare, alternatives, reason } of CASES) {
  const model = Model(id);
  const defaults = model.params().getDefaults();
  const bareInput = { ...defaults, ...bare };

  // The static accessor is unchanged: the prompt is optional on its own.
  assert.notStrictEqual(model.params().prompt()?.required, true, `${id}: static prompt stays optional`);

  const constrainedPrompt = model.paramsFor(bareInput).prompt();
  assert.strictEqual(constrainedPrompt?.required, true, `${id}: paramsFor marks prompt required`);
  assert.match(constrainedPrompt?.requiredReason ?? '', reason, `${id}: reason names the alternative`);
  assert.strictEqual(
    model.paramsFor(bareInput).all().find((entry) => entry.key === 'prompt')?.required, true,
    `${id}: all() carries the requirement too`,
  );
  const genericPrompt = model.paramsFor(bareInput).param('prompt');
  assert.strictEqual(genericPrompt?.required, true, `${id}: param() carries the requirement too`);
  assert.strictEqual(genericPrompt?.requiredReason, constrainedPrompt?.requiredReason, `${id}: param() and prompt() agree`);

  const blankVerdict = model.validate({ ...bareInput, prompt: '  \n ' });
  assert.strictEqual(blankVerdict.valid, false, `${id}: a whitespace-only prompt does not satisfy the rule`);

  const verdict = model.validate(bareInput);
  assert.strictEqual(verdict.valid, false, `${id}: validate() rejects the bare input`);
  assert.match(verdict.errors?.[0] ?? '', /^"prompt" is required: /);

  assert.throws(
    () => prepareRequest(resolveModel(id), bareInput as RequestParams),
    (err: Error & { code?: string }) => /^"prompt" is required/.test(err.message) && err.code === 'validation_error',
    `${id}: submit refuses before building a payload`,
  );

  for (const alternative of alternatives) {
    const input = { ...bareInput, ...alternative };
    const label = `${id} + ${Object.keys(alternative).join(',')}`;
    assert.notStrictEqual(model.paramsFor(input).prompt()?.required, true, `${label}: not required`);
    assert.deepStrictEqual(model.validate(input), { valid: true }, `${label}: validates`);
  }
}

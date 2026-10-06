/**
 * typesafe-evaluate tests — the first mode:'json' model, end-to-end over the
 * fake platform through ai.run(): payload shape, structured result, output
 * schema, input validation, and the mode cross-guards.
 */
import assert from 'node:assert';
import { createClient } from '../../src/client/index.ts';
import { mockPlatform, FAST_POLL } from './helpers/mock-platform.ts';

const ANSWERS = {
  is_safe: { type: 'noul', value: true },
  tone: { type: 'score', value: 8 },
};

const platform = mockPlatform({
  status: () => ({
    status: 'COMPLETED',
    result: { model: 'jev-1.13.0', answers: ANSWERS, usage: { input_tokens: 42, output_tokens: 7 } },
    usage: { toolId: 'typesafe-evaluate', credits: 1 },
  }),
});
const ai = createClient({ apiUrl: 'https://api.test', fetch: platform.fetch });

// ── Happy path — structured input in, answers map out ────────────────

interface EvaluateResult {
  model: string;
  answers: typeof ANSWERS;
  usage: { input_tokens: number; output_tokens: number };
}

const res = await ai.run<EvaluateResult>('typesafe-evaluate', {
  state: 'The weather is lovely and everyone is having a great time.',
  questions: {
    is_safe: { type: 'noul', instructions: 'Is this content safe for all audiences?' },
    // `options` is undeclared in the descriptor — rides the `open` passthrough.
    tone: { type: 'choice', instructions: 'Pick the tone.', options: ['positive', 'neutral', 'negative'] },
  },
}, FAST_POLL);

assert.deepStrictEqual(res.result.answers, ANSWERS, 'answers map returned unmodified');
assert.strictEqual(res.result.model, 'jev-1.13.0', 'vendor model id kept in the result');
assert.strictEqual(res.status, 'COMPLETED');
assert.strictEqual(res.usage!.credits, 1, 'platform usage surfaced');

{
  const submit = platform.calls.submits.at(-1)!;
  assert.strictEqual(submit.workflow, 'typesafe/v1/systemone/evaluate');
  assert.strictEqual(submit.payload.model, 'jev-latest', 'vendor model pinned');
  assert.strictEqual(typeof submit.payload.state, 'string');
  const questions = submit.payload.questions as Record<string, Record<string, unknown>>;
  assert.deepStrictEqual(questions.tone.options, ['positive', 'neutral', 'negative'], 'open extra field reaches the wire');
}

// ── Input validation (map descriptor) ────────────────────────────────

await assert.rejects(
  ai.run('typesafe-evaluate', { state: 'x' } as never, FAST_POLL),
  /"questions" is required/,
  'questions required',
);
await assert.rejects(
  ai.run('typesafe-evaluate', {
    state: 'x',
    questions: { q1: { type: 'maybe', instructions: 'x' } },
  } as never, FAST_POLL),
  /"questions.q1.type" must be one of/,
  'question type validated per entry',
);

// ── Output schema — a result without answers is invalid_response ─────

const badPlatform = mockPlatform({
  status: () => ({ status: 'COMPLETED', result: { model: 'jev-1.13.0' } }),
});
await assert.rejects(
  createClient({ apiUrl: 'https://api.test', fetch: badPlatform.fetch })
    .run('typesafe-evaluate', {
      state: 'x',
      questions: { q: { type: 'noul', instructions: 'y' } },
    }, FAST_POLL),
  /No answers/,
  'outputSchema enforces the answers map',
);

// ── Cross-guards — json models are served by run() only ──────────────

await assert.rejects(
  ai.generate('typesafe-evaluate' as never, { prompt: 'x' } as never),
  /json model — use run\(\)/,
  'generate() rejects json models',
);
await assert.rejects(
  ai.generateText('typesafe-evaluate' as never, { prompt: 'x' } as never),
  /not a text model/,
  'generateText() rejects json models',
);
await assert.rejects(
  ai.submit('typesafe-evaluate' as never, { prompt: 'x' } as never),
  /json model — use run\(\)/,
  'submit() rejects json models',
);

console.log('✓ typesafe.test.ts — all passed');

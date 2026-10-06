/**
 * TypeSafe — single source of truth.
 *
 * Structured-output evaluation (LLM-judge): content in, typed answers out.
 * The first `mode: 'json'` model — no media URL, no extractable text; the
 * task result `{ model, answers, usage }` comes back as-is on `ai.run()`'s
 * generic RunResponse. Rejected by generate()/generateText() and the async
 * lifecycle.
 *
 * The worker (`pa-typesafe-pluggable-worker`) pins the vendor model to
 * `jev-latest`; the payload builder lives in typesafe.payloads.ts.
 */
import type { RuntimeSchema } from '../../core/types.ts';
import { defineModels, feat } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

/** Evaluate answers `{ model, answers, usage }` — require the answers map. */
const evaluateOutputSchema: RuntimeSchema<unknown> = {
  parse(output: unknown) {
    const obj = output as Record<string, unknown> | undefined;
    if (!obj || typeof obj.answers !== 'object' || obj.answers == null) {
      throw new Error('No answers in TypeSafe evaluate response');
    }
    return output;
  },
};

export const { MODELS } = defineModels('typesafe', [
  {
    id: 'typesafe-evaluate', name: 'Jev',
    workflow: 'typesafe/v1/systemone/evaluate', addedAt: '2026-10-05',
    modelId: 'jev-latest', estimatedTime: 6, badge: ['new'],
    mode: 'json', inputType: 't2t',
    outputSchema: evaluateOutputSchema,
    description: 'Evaluate content against named questions (yes/no, choice, score) and get structured answers back.',
    features: [feat('Structured Output', 'characteristic')],
    paramConfig: {
      ...p.text('state', { label: 'Content', required: true }),
      questions: {
        label: 'Questions',
        required: true,
        // Dictionary of caller-chosen question ids → question objects.
        descriptor: {
          kind: 'object',
          additionalProperties: {
            kind: 'object',
            fields: {
              type: {
                kind: 'enum', valueType: 'string', default: 'noul', required: true,
                options: [
                  { id: 'noul', label: 'Yes/No' },
                  { id: 'choice', label: 'Choice' },
                  { id: 'score', label: 'Score' },
                ],
              },
              // Plain string or a structured instruction object — the shape is
              // vendor-defined (see https://docs.typesafe.ai/api), so only
              // presence is enforced here.
              instructions: { kind: 'unknown', required: true },
            },
            // Choice options, score bounds, etc. are question-type-specific —
            // see https://docs.typesafe.ai/api; pass them through unvalidated.
            additionalProperties: { kind: 'unknown' },
          },
        },
      },
    },
  },
]);

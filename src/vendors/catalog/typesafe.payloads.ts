/**
 * TypeSafe payload builders.
 *
 * Typed against the generated per-model ModelInput on the SDK side. The wire
 * command is declared locally: @picsart/workflows-types has no typesafe entry
 * yet — drop the local type once the published package ships one (same
 * situation as the gpt-6 widening in llm.payloads.ts).
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './typesafe.ts';

/** Wire shape of `typesafe/v1/systemone/evaluate` (TypeSafeEvaluateCommand). */
interface TypeSafeEvaluateParams {
  state: string;
  model: 'jev-latest';
  questions: Record<string, Record<string, unknown>>;
}

type EvaluateInput = ModelInput<'typesafe-evaluate'>;

const buildEvaluatePayload = (input: EvaluateInput): TypeSafeEvaluateParams => ({
  state: input.state,
  model: 'jev-latest',
  questions: input.questions,
});

registerPayloads(MODELS, {
  'typesafe-evaluate': buildEvaluatePayload,
});

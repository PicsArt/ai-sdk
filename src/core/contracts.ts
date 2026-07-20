import type { GenerationContext, ModelDefinition } from './types.ts';
import { validateAll } from './descriptors/utils.ts';

interface Schema<T> {
  parse(input: unknown): T;
}

export interface ModelContract<TInput = GenerationContext, TOutput = unknown> {
  id: string;
  input: Schema<TInput>;
  output: Schema<TOutput>;
}

function requireObject(value: unknown, message: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(message);
  }
}

function buildInputSchema(model: ModelDefinition): Schema<GenerationContext> {
  return {
    parse(input: unknown): GenerationContext {
      requireObject(input, `Invalid input for model "${model.id}"`);
      validateAll(model.paramConfig, input);
      return input as unknown as GenerationContext;
    },
  };
}

function buildOutputSchema(model: ModelDefinition): Schema<unknown> {
  return {
    parse(output: unknown): unknown {
      if (output == null) {
        throw new Error(`Model "${model.id}" returned empty output`);
      }
      return output;
    },
  };
}

export function createModelContract(model: ModelDefinition): ModelContract {
  return {
    id: model.id,
    input: buildInputSchema(model),
    output: buildOutputSchema(model),
  };
}

export function validateModelInput(model: ModelDefinition, input: unknown): GenerationContext {
  return createModelContract(model).input.parse(input);
}

// ── Pre-built contracts for all models (lazy) ───────────────────────
// Lazy to break circular dependency: contracts ↔ catalog ↔ vendors → define → contracts

import { ALL_MODELS } from '../vendors/catalog/index.ts';

let _contracts: Record<string, ModelContract> | null = null;

function ensureContracts(): Record<string, ModelContract> {
  if (!_contracts) {
    _contracts = Object.fromEntries(
      ALL_MODELS.map((model) => {
        const autoContract = createModelContract(model);
        const outputSchema = model.outputSchema ?? autoContract.output;
        return [model.id, { id: model.id, input: autoContract.input, output: outputSchema }];
      }),
    );
  }
  return _contracts;
}

export function getModelContract(modelId: string): ModelContract | undefined {
  return ensureContracts()[modelId];
}

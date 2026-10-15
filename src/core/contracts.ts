import type { GenerationContext, ModelDefinition } from './types.ts';
import { validateAll } from './descriptors/utils.ts';
import { ApiError } from './errors.ts';

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
    throw new ApiError(message, { status: 400, code: 'validation_error' });
  }
}

function buildInputSchema(model: ModelDefinition): Schema<GenerationContext> {
  return {
    parse(input: unknown): GenerationContext {
      requireObject(input, `Invalid input for model "${model.id}"`);
      try {
        validateAll(model.paramConfig, input, model.constraints, model.validateInput);
      } catch (err: unknown) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(err instanceof Error ? err.message : String(err), {
          status: 400,
          code: 'validation_error',
        });
      }
      return input as unknown as GenerationContext;
    },
  };
}

function buildOutputSchema(model: ModelDefinition): Schema<unknown> {
  return {
    parse(output: unknown): unknown {
      if (output == null) {
        throw new ApiError(`Model "${model.id}" returned empty output`, {
          status: 502,
          code: 'invalid_response',
        });
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

import { activeModels, catalogGeneration } from './active-catalog.ts';

let _contracts: Record<string, ModelContract> | null = null;
let _contractsGen = -1;

function ensureContracts(): Record<string, ModelContract> {
  const gen = catalogGeneration();
  if (!_contracts || _contractsGen !== gen) {
    _contractsGen = gen;
    _contracts = Object.fromEntries(
      activeModels().map((model) => {
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

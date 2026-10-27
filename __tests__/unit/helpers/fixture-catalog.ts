/**
 * Shared fixture catalog for the dynamic-only test suite.
 *
 * The SDK ships with no bundled catalog, so tests install one. `makeModel`
 * fills the required ModelDefinition fields with harmless defaults; the
 * exported fixtures cover the ids and the descriptor variety the catalog /
 * dynamic tests exercise.
 */
import type { ModelDefinition } from '../../../src/core/types.ts';

type Over = Partial<ModelDefinition> & Pick<ModelDefinition, 'id' | 'name' | 'mode'>;

/** A valid ModelDefinition with sensible defaults; override anything via `over`. */
export function makeModel(over: Over): ModelDefinition {
  return {
    provider: 'flux' as ModelDefinition['provider'],
    providerName: 'Fixture',
    providerColor: '#123456',
    providerLabel: 'FX',
    description: 'test-only model',
    features: [],
    inputType: 't2i' as ModelDefinition['inputType'],
    release: 'production',
    workflow: `fixture/v1/${over.id}`,
    paramConfig: {
      prompt: { label: 'Prompt', required: true, descriptor: { kind: 'text' } },
    },
    ...over,
  } as ModelDefinition;
}

/** Image model, aliased by the display name `Flux 2 Pro`. */
export const FLUX = makeModel({ id: 'flux-2-pro', name: 'Flux 2 Pro', mode: 'image' });

/** Text (LLM) model on its own workflow. */
export const CLAUDE = makeModel({
  id: 'claude-opus-5', name: 'Claude Opus 5', mode: 'text',
  inputType: 't2t' as ModelDefinition['inputType'], workflow: 'claude/v1/messages',
  provider: 'anthropic' as ModelDefinition['provider'],
});

/** Video model — Drive naming should give it an `.mp4` extension. */
export const KLING = makeModel({
  id: 'kling-v3', name: 'Kling v3', mode: 'video',
  inputType: 't2v' as ModelDefinition['inputType'], workflow: 'kling/v1/video',
  provider: 'kling' as ModelDefinition['provider'],
});

/** Three default-visible image/text/video models — the common install. */
export const FIXTURE_CATALOG: ModelDefinition[] = [FLUX, CLAUDE, KLING];

/**
 * One model exercising every descriptor kind plus badges, constraints, an
 * object param with additionalProperties, and the full set of file bounds —
 * used to prove the wire codec is lossless.
 */
export const RICH = makeModel({
  id: 'rich-fixture',
  name: 'Rich Fixture',
  mode: 'image',
  editWorkflow: 'fixture/v1/rich-edit',
  modelId: 'rich-vendor-id',
  badge: ['new', 'popular'] as ModelDefinition['badge'],
  constraints: [
    { when: { resolution: '1080p' }, require: { duration: 8 } },
  ] as unknown as ModelDefinition['constraints'],
  paramConfig: {
    prompt: { label: 'Prompt', required: true, descriptor: { kind: 'text', maxLength: 2000 } },
    aspectRatio: {
      label: 'Aspect ratio',
      descriptor: { kind: 'enum', valueType: 'string', options: [{ id: '1:1' }, { id: '16:9' }], default: '1:1' },
    },
    voiceId: {
      label: 'Voice',
      descriptor: { kind: 'catalog', source: { workflow: 'fixture/v1/catalog/voices' }, default: '' },
    },
    steps: { label: 'Steps', descriptor: { kind: 'range', min: 1, max: 50, default: 20 } },
    hd: { label: 'HD', descriptor: { kind: 'boolean', default: false } },
    image: {
      label: 'Image',
      descriptor: {
        kind: 'file', accept: 'image',
        minPixels: 1024, minSidePixels: 32, maxShortSidePixels: 4096, maxDurationSec: 60, maxBytes: 30_000_000,
      },
    },
    turns: {
      label: 'Turns',
      descriptor: {
        kind: 'object',
        array: { min: 1 },
        additionalProperties: { kind: 'unknown' },
        fields: {
          voiceId: { kind: 'text', placeholder: 'v1' },
          text: { kind: 'text' },
        },
      },
    },
  },
} as Over);

/**
 * Async AI payload builders.
 *
 * Assembles the AsyncTtsCommand wire shape from flat SDK fields: hardcodes
 * model_id, renames prompt → transcript, and nests voice + output_format.
 *
 * NOTE: the 'async-ai-text-to-speech' workflow is not yet published in
 * @picsart/workflows-types (absent even in 1.1.41), so the return is left
 * inferred. Annotate with WorkflowTypes['async-ai-text-to-speech']['params']
 * once the worker team publishes it — follow-up for the workflows-types team.
 */
import type { ModelInput } from '../../generated/model-input-types.ts';
import { ASYNC_DEFAULT_VOICE_ID } from '../../core/voices.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './async-ai.ts';

type AsyncTtsInput = ModelInput<'async-flash-v1'>;

// Custom builders don't receive descriptor defaults from prepareRequest
// (the contract only validates input, it doesn't inject defaults), so the
// advertised paramConfig defaults are applied here. Applicability is
// format-specific per the OpenAPI schema: encoding is ignored for mp3,
// bit_rate is mp3-only.
const buildAsyncTtsPayload = (input: AsyncTtsInput) => {
  const container = input.container ?? 'mp3';
  return {
    model_id: 'async_flash_v1.0',
    transcript: input.prompt,
    voice: { mode: 'id', id: input.voiceId || ASYNC_DEFAULT_VOICE_ID },
    output_format: {
      container,
      sample_rate: input.sampleRate ?? 24000,
      ...(container !== 'mp3' ? { encoding: input.encoding ?? 'pcm_s16le' } : {}),
      ...(container === 'mp3' ? { bit_rate: input.bitRate ?? 192000 } : {}),
    },
  };
};

registerPayloads(MODELS, { 'async-flash-v1': buildAsyncTtsPayload });

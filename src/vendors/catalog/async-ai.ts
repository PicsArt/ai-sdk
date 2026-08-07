/**
 * Async AI — text-to-speech (Flash voice engine).
 *
 * Single source of truth for catalog metadata + paramConfig. The payload
 * transform (nested voice / output_format assembly, hardcoded model_id) lives
 * in the sibling async-ai.payloads.ts.
 */
import { ASYNC_DEFAULT_VOICE_ID } from '../../core/voices.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

export const { MODELS } = defineModels('async', [
  {
    id: 'async-flash-v1', name: 'Async Flash v1.0', modelId: 'async_flash_v1.0',
    addedAt: '2026-06-12',
    workflow: 'async-ai-text-to-speech',
    estimatedTime: 12,
    mode: 'audio', inputType: 'tts',
    description: 'Generate natural speech from text with Async AI’s Flash voice engine.',
    features: [feat('Text to Speech', 'characteristic'), feat('Fast', 'characteristic')],
    paramConfig: {
      ...params.prompt(),
      ...params.voiceId([], ASYNC_DEFAULT_VOICE_ID, { catalog: { workflow: 'async-ai/v1/catalog/voices' } }),
      ...p.enum('container', ['mp3', 'wav', 'raw'], 'mp3', { label: 'Audio Format' }),
      ...p.range('sampleRate', 8000, 48000, 24000, { label: 'Sample Rate' }),
      // encoding ignored when container is mp3
      ...p.enum('encoding', ['pcm_s16le', 'pcm_f32le'], 'pcm_s16le', { label: 'Encoding' }),
      // bitRate applies only to mp3
      ...p.range('bitRate', 32000, 320000, 192000, { label: 'Bit Rate' }),
    },
  },
]);

/**
 * MiniMax — single source of truth (audio).
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

/** TTS — text only. */
export const buildMinimaxTTSPayload: PayloadBuilder = (ctx) => ({
  text: ctx.prompt,
});

/** Music — worker requires `lyrics_prompt` even when using instrumental mode. */
export const buildMinimaxMusicPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  lyrics_prompt: ctx.lyricsPrompt ?? ctx.prompt,
  ...(ctx.lyricsOptimizer != null ? { lyrics_optimizer: ctx.lyricsOptimizer } : {}),
  ...(ctx.isInstrumental != null ? { is_instrumental: ctx.isInstrumental } : {}),
  ...(ctx.outputFormat ? { output_format: ctx.outputFormat } : { output_format: 'url' }),
});

export const { MODELS } = defineModels('minimax', [
  {
    id: 'minimax-02-hd', name: 'MiniMax 02 HD', modelId: 'minimax-02-hd',
    addedAt: '2026-02-06',
    workflow: 'minimax-tts', buildPayload: buildMinimaxTTSPayload,
    estimatedTime: 15,
    mode: 'audio', inputType: 'tts',
    disabled: true, // Backend workflow not deployed
    description: 'HD voice synthesis with rich tonal depth and consistent delivery.',
    features: [feat('Consistent', 'characteristic'), feat('Cinematic', 'characteristic')],
    paramConfig: {
      ...params.language(true),
      ...params.prompt({ maxLength: 150 }),
    },
  },
  {
    id: 'minimax-music-v2', name: 'MiniMax Music v2',
    addedAt: '2026-02-06',
    workflow: 'minimax-music/v2', buildPayload: buildMinimaxMusicPayload,
    estimatedTime: 39,
    mode: 'audio', inputType: 'music',
    description: 'Text-to-music with vocals or instrumentals from a style prompt and lyrics prompt.',
    features: [feat('Music', 'characteristic'), feat('Vocals', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 2000, placeholder: 'Describe the genre, mood, instruments, tempo, and production style...' }),
      ...p.text('lyricsPrompt', {
        maxLength: 2000,
        label: 'Lyrics Prompt',
        placeholder: 'Write lyrics, or describe the lyrical theme. Minimum 10 characters.',
      }),
      ...p.boolean('lyricsOptimizer', false, 'Lyrics Optimizer'),
      ...p.boolean('isInstrumental', false, 'Instrumental'),
      ...p.enum('outputFormat', ['url', 'hex'], 'url', { label: 'Output Format' }),
    },
  },
]);

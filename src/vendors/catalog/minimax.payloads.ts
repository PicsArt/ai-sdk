/**
 * MiniMax Music v3 payload builder.
 *
 * Renames the unified SDK fields to the backend `MinimaxMusicV3Command` wire
 * shape (`lyricsPrompt` → `lyrics`) and nests the audio knobs under
 * `audio_setting`. Unlike v2, `lyrics` is genuinely optional on the wire —
 * instrumental mode and the lyrics optimizer can both run without it.
 */
import type { WorkflowTypes } from '@picsart/workflows-types';
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './minimax.ts';

type MinimaxMusicV3Input = ModelInput<'minimax-music-v3'>;
type MinimaxMusicV3Payload = WorkflowTypes['minimax-music/v3']['params'];

const buildMinimaxMusicV3Payload = (input: MinimaxMusicV3Input): MinimaxMusicV3Payload => ({
  prompt: input.prompt,
  ...(input.lyricsPrompt ? { lyrics: input.lyricsPrompt } : {}),
  lyrics_optimizer: input.lyricsOptimizer ?? false,
  is_instrumental: input.isInstrumental ?? false,
  // Apply the paramConfig defaults explicitly — a custom builder (unlike the
  // pass-through one) doesn't get them for free, and the advertised defaults
  // must reach the wire instead of whatever the backend would pick.
  audio_setting: {
    sample_rate: input.sampleRate ?? 44100,
    bitrate: input.bitrate ?? 256000,
    format: input.format ?? 'mp3',
  },
});

registerPayloads(MODELS, {
  'minimax-music-v3': buildMinimaxMusicV3Payload,
});

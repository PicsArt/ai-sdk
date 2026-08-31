/**
 * MiniMax payload builders (Music v3, H3 Max).
 *
 * Music v3: renames the unified SDK fields to the backend `MinimaxMusicV3Command`
 * wire shape (`lyricsPrompt` → `lyrics`) and nests the audio knobs under
 * `audio_setting`. Unlike v2, `lyrics` is genuinely optional on the wire —
 * instrumental mode and the lyrics optimizer can both run without it.
 *
 * H3 Max: combined T2V/I2V entry on the fal.ai worker — one builder serves the
 * primary (T2V) and edit (I2V, switched by startFrame presence) routes. The
 * worker forwards the command to fal.ai as-is, so the wire shape is the fal
 * endpoint schema:
 *   - `aspect_ratio` exists only on the T2V endpoint (I2V follows the image);
 *   - `image_url` / `end_image_url` exist only on the I2V endpoint;
 *   - `resolution` casing is normalized by the worker (uppercased for fal,
 *     lowercased for pricing), so the SDK keeps the lowercase form;
 *   - `sync_mode` is intentionally not exposed — a base64 response would
 *     bypass the worker's fal-URL → Picsart CDN copy step.
 */
import type { WorkflowTypes } from '@picsart/workflows-types';
import type { ModelInput } from '../../generated/model-input-types.ts';
import { registerEditPayloads, registerPayloads } from '../define.ts';
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

type MinimaxH3MaxInput = ModelInput<'minimax-h3-max'>;

// `minimax/h3-max/*` is not in @picsart/workflows-types yet (worker branch
// pending) — the return stays inferred; annotate with
// WorkflowTypes['minimax/h3-max/image-to-video']['params'] once published.
const buildMinimaxH3MaxPayload = (input: MinimaxH3MaxInput) => ({
  prompt: input.prompt,
  prompt_expansion_mode: input.promptExpansionMode ?? 'balanced',
  duration: input.duration ?? 5,
  resolution: input.resolution ?? '768p',
  ...(input.startFrame
    ? {
        image_url: input.startFrame,
        ...(input.endFrame ? { end_image_url: input.endFrame } : {}),
      }
    : { aspect_ratio: input.aspectRatio ?? '16:9' }),
  // -1 is the paramConfig sentinel for "random seed" — omit it on the wire.
  ...(input.seed != null && input.seed !== -1 ? { seed: input.seed } : {}),
  enable_safety_checker: input.enableSafetyChecker ?? true,
});

registerPayloads(MODELS, {
  'minimax-music-v3': buildMinimaxMusicV3Payload,
  'minimax-h3-max': buildMinimaxH3MaxPayload,
});

// Edit slot — same builder; startFrame presence already shapes the payload.
registerEditPayloads(MODELS, {
  'minimax-h3-max': buildMinimaxH3MaxPayload,
});

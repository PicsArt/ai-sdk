/**
 * MiniMax payload builders (Music v3, H3 Max, H3 Max Ref-to-Video).
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

// Upstream cases `resolution` for the fal wire ('768P'); the worker also
// accepts the lowercase form the SDK sends (which pricing needs), so widen
// that one field. Remove once upstream carries both casings.
type FalResolutionCasing<T> = Omit<T, 'resolution'> & { resolution?: '480p' | '768p' };
// One builder serves both routes, so the return is the T2V | I2V union.
type MinimaxH3MaxPayload =
  | FalResolutionCasing<WorkflowTypes['minimax/h3-max/text-to-video']['params']>
  | FalResolutionCasing<WorkflowTypes['minimax/h3-max/image-to-video']['params']>;

const buildMinimaxH3MaxPayload = (input: MinimaxH3MaxInput): MinimaxH3MaxPayload => ({
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

type MinimaxH3MaxR2VInput = ModelInput<'minimax-h3-max-r2v'>;

// `minimax/h3-max/reference-to-video` is not in @picsart/workflows-types yet
// (t2v/i2v landed in 1.1.123, r2v pending) — the return stays inferred;
// annotate with WorkflowTypes['minimax/h3-max/reference-to-video']['params']
// (via FalResolutionCasing) once published.
const buildMinimaxH3MaxR2VPayload = (input: MinimaxH3MaxR2VInput) => ({
  prompt: input.prompt,
  prompt_expansion_mode: input.promptExpansionMode ?? 'balanced',
  duration: input.duration ?? 5,
  resolution: input.resolution ?? '768p',
  aspect_ratio: input.aspectRatio ?? 'adaptive',
  ...(input.imageUrls?.length ? { reference_image_urls: input.imageUrls } : {}),
  ...(input.videoUrls?.length ? { reference_video_urls: input.videoUrls } : {}),
  ...(input.audioUrls?.length ? { reference_audio_urls: input.audioUrls } : {}),
  // -1 is the paramConfig sentinel for "random seed" — omit it on the wire.
  ...(input.seed != null && input.seed !== -1 ? { seed: input.seed } : {}),
  enable_safety_checker: input.enableSafetyChecker ?? true,
});

registerPayloads(MODELS, {
  'minimax-music-v3': buildMinimaxMusicV3Payload,
  'minimax-h3-max': buildMinimaxH3MaxPayload,
  'minimax-h3-max-r2v': buildMinimaxH3MaxR2VPayload,
});

// Edit slot — same builder; startFrame presence already shapes the payload.
registerEditPayloads(MODELS, {
  'minimax-h3-max': buildMinimaxH3MaxPayload,
});

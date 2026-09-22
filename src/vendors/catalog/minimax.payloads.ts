/**
 * MiniMax payload builders (Music v3, H3 Max, H3 Max Turbo, H3 Max Camera
 * Controls, H3 Max Lip Sync).
 *
 * Music v3: renames the unified SDK fields to the wire shape
 * (`lyricsPrompt` → `lyrics`) and nests the audio knobs under
 * `audio_setting`. Unlike v2, `lyrics` is genuinely optional —
 * instrumental mode and the lyrics optimizer can both run without it.
 *
 * H3 Max and H3 Max Turbo: one builder each, covering every mode the model
 * offers — the fields the caller filled decide which one runs. The names are
 * the vendor's own, and the shape follows the mode:
 *   - `aspect_ratio` goes out only without a frame; with one, the output
 *     follows that image;
 *   - `image_url` / `end_image_url` animate frames, `reference_*_urls`
 *     generate from references, and the two never travel together;
 *   - a base64 response is intentionally not offered — results are delivered
 *     as URLs.
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

type MinimaxH3MaxPayload = WorkflowTypes['minimax/h3-max/video-generation']['params'];

const buildMinimaxH3MaxPayload = (input: MinimaxH3MaxInput): MinimaxH3MaxPayload => {
  const hasReferences = !!(input.imageUrls?.length || input.videoUrls?.length || input.audioUrls?.length);
  const hasFrame = !!(input.startFrame || input.endFrame);

  return {
    prompt: input.prompt,
    prompt_expansion_mode: input.promptExpansionMode ?? 'balanced',
    duration: input.duration ?? 5,
    // The vendor enum is uppercase; paramConfig keeps the lowercase form.
    resolution: (input.resolution ?? '768p').toUpperCase() as MinimaxH3MaxPayload['resolution'],
    // Frames and references pick different modes and are mutually exclusive
    // (the model's constraints keep them so), hence whichever the caller
    // filled is what goes out.
    ...(input.startFrame ? { image_url: input.startFrame } : {}),
    ...(input.endFrame ? { end_image_url: input.endFrame } : {}),
    ...(input.imageUrls?.length ? { reference_image_urls: input.imageUrls } : {}),
    ...(input.videoUrls?.length ? { reference_video_urls: input.videoUrls } : {}),
    ...(input.audioUrls?.length ? { reference_audio_urls: input.audioUrls } : {}),
    // A frame decides the ratio itself, so the field is dropped there. With
    // references the default is 'adaptive' (follow them); from the prompt
    // alone it is 16:9.
    ...(hasFrame ? {} : { aspect_ratio: input.aspectRatio ?? (hasReferences ? 'adaptive' : '16:9') }),
    // -1 is the paramConfig sentinel for "random seed" — omit it on the wire.
    ...(input.seed != null && input.seed !== -1 ? { seed: input.seed } : {}),
    enable_safety_checker: input.enableSafetyChecker ?? true,
  };
};

type MinimaxH3MaxTurboInput = ModelInput<'minimax-h3-max-turbo'>;

// TODO: the turbo workflows are not in @picsart/workflows-types yet — the
// return stays inferred; annotate it with their params union once published.
const buildMinimaxH3MaxTurboPayload = (input: MinimaxH3MaxTurboInput) => ({
  prompt: input.prompt,
  prompt_expansion_mode: input.promptExpansionMode ?? 'balanced',
  duration: input.duration ?? 5,
  resolution: input.resolution ?? '768p',
  // Either frame animates frames, and an end frame alone is valid (it
  // generates towards that keyframe). The ratio follows the frame when one is
  // supplied, so it goes out only when neither is set.
  ...(input.startFrame ? { image_url: input.startFrame } : {}),
  ...(input.endFrame ? { end_image_url: input.endFrame } : {}),
  ...(input.startFrame || input.endFrame ? {} : { aspect_ratio: input.aspectRatio ?? '16:9' }),
  // -1 is the paramConfig sentinel for "random seed" — omit it on the wire.
  ...(input.seed != null && input.seed !== -1 ? { seed: input.seed } : {}),
  enable_safety_checker: input.enableSafetyChecker ?? true,
});

type MinimaxH3MaxCameraControlsInput = ModelInput<'minimax-h3-max-camera-controls'>;

// TODO: 'minimax/h3-max/camera-controls' is not in @picsart/workflows-types
// yet (worker MR !112 unmerged) — the return stays inferred; annotate it with
// WorkflowTypes['minimax/h3-max/camera-controls']['params'] once published.
const buildMinimaxH3MaxCameraControlsPayload = (input: MinimaxH3MaxCameraControlsInput) => ({
  // Blank prompt is meaningful upstream — fal substitutes its frozen-scene
  // default — so it is omitted rather than sent empty.
  ...(input.prompt ? { prompt: input.prompt } : {}),
  image_url: input.startFrame,
  ...(input.cameraTrajectory?.length ? { camera_trajectory: input.cameraTrajectory } : {}),
  prompt_expansion_mode: input.promptExpansionMode ?? 'balanced',
  duration: input.duration ?? 5,
  // The vendor enum is uppercase; paramConfig keeps the lowercase form.
  resolution: (input.resolution ?? '480p').toUpperCase(),
  // -1 is the paramConfig sentinel for "random seed" — omit it on the wire.
  ...(input.seed != null && input.seed !== -1 ? { seed: input.seed } : {}),
  enable_safety_checker: input.enableSafetyChecker ?? true,
});

type MinimaxH3MaxLipSyncInput = ModelInput<'minimax-h3-max-lip-sync'>;

type MinimaxH3MaxLipSyncPayload = WorkflowTypes['minimax/h3-max/lip-sync/image-to-video']['params'];

const buildMinimaxH3MaxLipSyncPayload = (input: MinimaxH3MaxLipSyncInput): MinimaxH3MaxLipSyncPayload => ({
  image_url: input.startFrame,
  audio_url: input.audioUrl,
  // The vendor enum is uppercase; paramConfig keeps the lowercase form.
  resolution: (input.resolution ?? '768p').toUpperCase() as MinimaxH3MaxLipSyncPayload['resolution'],
  enable_transcription: input.enableTranscription ?? false,
  // -1 is the paramConfig sentinel for "random seed" — omit it on the wire.
  ...(input.seed != null && input.seed !== -1 ? { seed: input.seed } : {}),
  enable_safety_checker: input.enableSafetyChecker ?? true,
});

registerPayloads(MODELS, {
  'minimax-music-v3': buildMinimaxMusicV3Payload,
  'minimax-h3-max': buildMinimaxH3MaxPayload,
  'minimax-h3-max-turbo': buildMinimaxH3MaxTurboPayload,
  'minimax-h3-max-camera-controls': buildMinimaxH3MaxCameraControlsPayload,
  'minimax-h3-max-lip-sync': buildMinimaxH3MaxLipSyncPayload,
});

// Edit slot — turbo keeps a separate image-to-video workflow, and the frame
// fields already shape the payload for it.
registerEditPayloads(MODELS, {
  'minimax-h3-max-turbo': buildMinimaxH3MaxTurboPayload,
});

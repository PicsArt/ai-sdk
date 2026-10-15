/**
 * Mirelo SFX 2.0 — AI sound-effects / Foley (hosted on fal, `vendor:fal-ai`).
 * https://mirelo.ai/
 *
 * Three tasks, one per generation shape:
 *
 *   mirelo-sfx-2.0-text-to-audio   Generate SFX / soundscapes from a text prompt.
 *   mirelo-sfx-2.0-video-to-audio  Generate a video-synced soundtrack, returned
 *                                  as an audio track (video itself is the prompt).
 *   mirelo-sfx-2.0-video-to-video  Same, muxed back onto the source video.
 *
 * The backend Command schemas (`TextToAudioInput` / `VideoToAudioInput` /
 * `VideoToVideoInput`) use fal's snake_case field names. The payload builders in
 * `mirelo.payloads.ts` rename the unified SDK fields to that wire shape —
 * `prompt`→`text_prompt` (video tasks), `videoUrl`→`video_url`,
 * `negativePrompt`→`negative_prompt`, `count`→`num_samples`,
 * `format`→`upload_audio_format`, `preserveSpeech`→`preserve_speech`.
 *
 * `duration` is a continuous span (0.1/1 s .. 600 s; over 10 s is generated in
 * 10 s windows). `num_samples` is 1–4. `seed` and `bitrateKbps` are optional with
 * no default, so the vendor's own randomization / VBR encoding applies unless set
 * (the backend refuses a bitrate with a lossless `upload_audio_format`).
 */
import type { ModelParams } from '../../core/descriptors/types.ts';
import { p } from '../../core/descriptors/presets.ts';
import { defineModels, feat, params } from '../define.ts';

const FORMAT_OPTIONS = ['wav', 'mp3', 'aac', 'flac'] as const;
const SAMPLE_OPTIONS = [1, 2, 3, 4];

/** mp3/aac CBR bitrate target. Optional, no default — unset keeps the backend's
 *  VBR default; refused with a lossless format (wav/flac). */
const bitrateKbps: ModelParams = {
  bitrateKbps: {
    label: 'Audio Bitrate (kbps)',
    descriptor: { kind: 'range', min: 32, max: 320, step: 1 },
  },
};

export const { MODELS } = defineModels('mirelo', [
  {
    id: 'mirelo-sfx-2.0-text-to-audio',
    name: 'Mirelo SFX 2.0 (Text to Audio)',
    addedAt: '2026-10-15',
    workflow: 'mirelo-ai/sfx2.0/text-to-audio',
    estimatedTime: 15,
    mode: 'audio',
    inputType: 't2a',
    description: 'Generate sound effects and soundscapes from a text prompt with Mirelo SFX 2.0.',
    features: [feat('Text to Audio', 'characteristic'), feat('Sound Effects', 'audio')],
    paramConfig: {
      ...params.prompt({ maxLength: 2000 }),
      ...params.negativePrompt(undefined, 1000),
      ...params.durationRange(1, 600, 30),
      ...params.count(SAMPLE_OPTIONS, 2),
      ...p.enum('format', [...FORMAT_OPTIONS], 'wav', { label: 'Format' }),
      ...bitrateKbps,
      ...params.seed(),
    },
  },
  {
    id: 'mirelo-sfx-2.0-video-to-audio',
    name: 'Mirelo SFX 2.0 (Video to Audio)',
    addedAt: '2026-10-15',
    workflow: 'mirelo-ai/sfx2.0/video-to-audio',
    estimatedTime: 20,
    mode: 'audio',
    inputType: 'v2a',
    description: 'Generate a soundtrack synced to your video with Mirelo SFX 2.0 — returns the audio track.',
    features: [feat('Video to Audio', 'characteristic'), feat('Video Required', 'input'), feat('Sound Effects', 'audio')],
    paramConfig: {
      ...params.videoInput('Source Video', 'asset', true),
      ...params.prompt({ required: false, maxLength: 2000 }),
      ...params.negativePrompt(undefined, 1000),
      ...p.boolean('preserveSpeech', true, 'Preserve Speech'),
      ...params.durationRange(1, 600, 10),
      ...params.count(SAMPLE_OPTIONS, 2),
      ...p.enum('format', [...FORMAT_OPTIONS], 'wav', { label: 'Format' }),
      ...bitrateKbps,
      ...params.seed(),
    },
  },
  {
    id: 'mirelo-sfx-2.0-video-to-video',
    name: 'Mirelo SFX 2.0 (Video to Video)',
    addedAt: '2026-10-15',
    workflow: 'mirelo-ai/sfx2.0/video-to-video',
    estimatedTime: 30,
    mode: 'video',
    inputType: 'v2v',
    description: 'Add a synced soundtrack to your video with Mirelo SFX 2.0 — returns the video with its new audio.',
    features: [feat('Video to Video', 'characteristic'), feat('Video Required', 'input'), feat('Synced Soundtrack', 'audio')],
    paramConfig: {
      ...params.videoInput('Source Video', 'asset', true),
      ...params.prompt({ required: false, maxLength: 2000 }),
      ...params.negativePrompt(undefined, 1000),
      ...p.boolean('preserveSpeech', true, 'Preserve Speech'),
      ...params.durationRange(1, 600, 10),
      ...params.count(SAMPLE_OPTIONS, 2),
      ...params.seed(),
    },
  },
]);

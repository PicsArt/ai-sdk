/**
 * MiniMax — single source of truth (audio + fal.ai-hosted video).
 * The minimax-worker video models (Hailuo, MiniMax H3) live in hailuo.ts.
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
  {
    id: 'minimax-music-v3', name: 'MiniMax Music v3',
    addedAt: '2026-08-14',
    workflow: 'minimax-music/v3',
    estimatedTime: 40,
    mode: 'audio', inputType: 'music',
    description: 'Text-to-music with vocals or instrumentals from a style prompt and optional lyrics, with configurable audio encoding.',
    features: [feat('Music', 'characteristic'), feat('Vocals', 'characteristic')],
    paramConfig: {
      ...params.prompt({ maxLength: 2000, placeholder: 'Describe the genre, mood, instruments, tempo, and production style...' }),
      ...p.text('lyricsPrompt', {
        maxLength: 2000,
        label: 'Lyrics',
        placeholder: 'Write lyrics; \\n separates lines, [Intro]/[Verse]/[Chorus] tags supported. Optional for instrumental or optimizer-generated lyrics.',
      }),
      ...p.boolean('lyricsOptimizer', false, 'Lyrics Optimizer'),
      ...p.boolean('isInstrumental', false, 'Instrumental'),
      ...p.enum('sampleRate', [16000, 24000, 32000, 44100], 44100, { label: 'Sample Rate' }),
      ...p.enum('bitrate', [32000, 64000, 128000, 256000], 256000, { label: 'Bitrate' }),
      ...p.enum('format', ['mp3', 'wav', 'pcm'], 'mp3', { label: 'Format' }),
    },
  },
  {
    // Combined T2V/I2V — fal.ai-hosted (pa-fal-ai-pluggable-worker), unlike
    // the Hailuo/H3 entries in hailuo.ts which route through the minimax
    // worker. A start frame switches to the image-to-video edit workflow.
    id: 'minimax-h3-max', name: 'MiniMax H3 Max', modelId: 'fal-ai-h3-max',
    addedAt: '2026-08-28',
    workflow: 'minimax/h3-max/text-to-video',
    editWorkflow: 'minimax/h3-max/image-to-video',
    estimatedTime: 5,
    mode: 'video', inputType: 't2v',
    description: 'Top-tier MiniMax H3 Max video from text or a start/end frame, with prompt expansion. Up to 15s at 768p.',
    features: [
      feat('Image Input', 'input'), feat('Start/End Frame', 'frame'),
      feat('768p', 'resolution'), feat('5-15 sec', 'duration'),
    ],
    paramConfig: {
      ...params.prompt(),
      ...params.startFrame(),
      ...params.endFrame(),
      // Lowercase on purpose: the worker uppercases for the fal wire ('768P')
      // and the pricing qualities are lowercase, so this casing serves both.
      ...params.resolution(['480p', '768p'], '768p'),
      ...params.durationRange(5, 15, 5),
      ...params.aspectRatio(['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'], '16:9'),
      ...p.enum('promptExpansionMode', ['disabled', 'balanced', 'quality'], 'balanced', { label: 'Prompt Expansion' }),
      // -1 (sentinel) means "pick a random seed"; the builder drops it.
      ...p.range('seed', -1, 2147483647, -1),
      ...p.boolean('enableSafetyChecker', true, 'Safety Checker'),
    },
    constraints: [
      // The T2V wire has no end_image_url — an end frame only reaches the
      // vendor on the I2V route, which needs a start frame to trigger.
      { when: { startFrame: { exists: false } }, then: {
        endFrame: { disabled: true, reason: 'An end frame requires a start frame.' },
      } },
      // I2V derives the ratio from the input image (no aspect_ratio on that wire).
      { when: { startFrame: { exists: true } }, then: {
        aspectRatio: { disabled: true, reason: 'Aspect ratio follows the start frame image.' },
      } },
    ],
  },
  {
    // Reference-to-video sibling of minimax-h3-max (same fal.ai worker).
    // The prompt addresses references by modality and order — Image 1,
    // Video 1, Audio 1, … Reference clips are 2-15s each (≤15s combined per
    // modality) and images + videos + audios must add up to ≤12 files —
    // backend-enforced; paramConfig only carries the per-array maxima.
    id: 'minimax-h3-max-r2v', name: 'MiniMax H3 Max Ref-to-Video', modelId: 'fal-ai-h3-max',
    addedAt: '2026-09-01',
    workflow: 'minimax/h3-max/reference-to-video',
    estimatedTime: 5,
    mode: 'video', inputType: 'i2v',
    description: 'MiniMax H3 Max video from reference images, videos, and audio — refer to them in the prompt as Image 1, Video 1, Audio 1, in input order. Up to 15s at 768p.',
    features: [
      feat('Multi-Image Input', 'input'), feat('Video Input', 'input'), feat('Audio Input', 'input'),
      feat('768p', 'resolution'), feat('5-15 sec', 'duration'),
    ],
    paramConfig: {
      ...params.prompt({ placeholder: 'Image 1 is the protagonist. Keep her consistent with the reference while she walks through a sunlit garden...' }),
      ...params.imageInput(9, 'Reference Images'),
      ...params.videoInputs(3, 'Reference Videos'),
      ...params.audioInputs(3, 'Reference Audios'),
      // Lowercase on purpose — same worker normalization as minimax-h3-max.
      ...params.resolution(['480p', '768p'], '768p'),
      ...params.durationRange(5, 15, 5),
      ...params.aspectRatio(['adaptive', '21:9', '16:9', '4:3', '1:1', '3:4', '9:16'], 'adaptive'),
      // Unlike the T2V/I2V entry, this wire has no 'disabled' expansion mode.
      ...p.enum('promptExpansionMode', ['balanced', 'quality'], 'balanced', { label: 'Prompt Expansion' }),
      // -1 (sentinel) means "pick a random seed"; the builder drops it.
      ...p.range('seed', -1, 2147483647, -1),
      ...p.boolean('enableSafetyChecker', true, 'Safety Checker'),
    },
    constraints: [
      { when: { imageUrls: { exists: false }, videoUrls: { exists: false } }, then: {
        audioUrls: { disabled: true, reason: 'Audio cannot be the only reference — add an image or video.' },
      } },
    ],
  },
]);

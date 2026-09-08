/**
 * MiniMax — audio models and the H3 Max video family.
 * The Hailuo and MiniMax H3 video models live in hailuo.ts.
 */
import type { Constraint, PayloadBuilder, Restriction } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts';

/** TTS — text only. */
export const buildMinimaxTTSPayload: PayloadBuilder = (ctx) => ({
  text: ctx.prompt,
});

/** Music v2 — `lyrics` is optional: instrumental mode and the lyrics
 * optimizer both run without it. */
export const buildMinimaxMusicPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  ...(ctx.lyricsPrompt ? { lyrics: ctx.lyricsPrompt } : {}),
  ...(ctx.lyricsOptimizer != null ? { lyrics_optimizer: ctx.lyricsOptimizer } : {}),
  ...(ctx.isInstrumental != null ? { is_instrumental: ctx.isInstrumental } : {}),
  audio_setting: {
    sample_rate: ctx.sampleRate ?? 44100,
    bitrate: ctx.bitrate ?? 256000,
    format: ctx.format ?? 'mp3',
  },
});

/** H3 Max's schema caps the prompt at 50,000 — far above the 7,000 of
 *  MiniMax's own H3 endpoint (see hailuo.ts). */
const H3_MAX_PROMPT_MAX = 50000;

// ── H3 Max constraint reasons (shared across the rules below) ────────
const FRAME_REF_EXCLUSIVE = 'References and start/end frames cannot be combined.';
const AUDIO_NEEDS_VISUAL = 'Audio cannot be the only reference — add an image or video.';
const RATIO_FOLLOWS_FRAME = 'Aspect ratio follows the frame image.';
const ADAPTIVE_NEEDS_REFS = 'Adaptive aspect ratio requires reference inputs.';
/** Aspect ratios available without references — 'adaptive' needs them. */
const H3_MAX_RATIOS = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'] as const;
/** Reference inputs disable the frame slots. */
const REFERENCE_EXCLUDES_FRAMES = {
  startFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
  endFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
} as const satisfies Record<string, Restriction>;

/** Mirror rule: a frame slot disables every reference input. */
const FRAME_EXCLUDES_REFERENCES = {
  imageUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
  videoUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
  audioUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
} as const satisfies Record<string, Restriction>;

/**
 * H3 Max generates in one mode at a time, so these rules keep the inputs on
 * exactly one of them: frames and references are mutually exclusive (declared
 * both ways, so either disables the other), and 'adaptive' stays with the
 * references it follows. The vendor rejects the same combinations — surfacing
 * them here lets the UI grey the fields out before a request is made.
 */
const h3MaxConstraints: Constraint[] = [
  { when: { startFrame: { exists: true } }, then: FRAME_EXCLUDES_REFERENCES },
  { when: { endFrame: { exists: true } }, then: FRAME_EXCLUDES_REFERENCES },
  { when: { imageUrls: { exists: true } }, then: REFERENCE_EXCLUDES_FRAMES },
  { when: { videoUrls: { exists: true } }, then: REFERENCE_EXCLUDES_FRAMES },
  { when: { audioUrls: { exists: true } }, then: REFERENCE_EXCLUDES_FRAMES },
  // With a frame the output follows that image, so the ratio is not a choice.
  // An end frame alone is valid — it generates towards that keyframe.
  { when: { startFrame: { exists: true } }, then: {
    aspectRatio: { disabled: true, reason: RATIO_FOLLOWS_FRAME },
  } },
  { when: { endFrame: { exists: true } }, then: {
    aspectRatio: { disabled: true, reason: RATIO_FOLLOWS_FRAME },
  } },
  // 'adaptive' means "follow the references" — no meaning without them.
  { when: { imageUrls: { exists: false }, videoUrls: { exists: false }, audioUrls: { exists: false } }, then: {
    aspectRatio: { allowed: [...H3_MAX_RATIOS], reason: ADAPTIVE_NEEDS_REFS },
  } },
  // Audio carries no visual signal, so it cannot be the only reference.
  { when: { imageUrls: { exists: false }, videoUrls: { exists: false } }, then: {
    audioUrls: { disabled: true, reason: AUDIO_NEEDS_VISUAL },
  } },
];

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
        maxLength: 3500,
        label: 'Lyrics',
        placeholder: 'Write lyrics, or describe the lyrical theme. Optional for instrumental or optimizer-generated lyrics.',
      }),
      ...p.boolean('lyricsOptimizer', false, 'Lyrics Optimizer'),
      ...p.boolean('isInstrumental', false, 'Instrumental'),
      ...p.enum('sampleRate', [16000, 24000, 32000, 44100], 44100, { label: 'Sample Rate' }),
      ...p.enum('bitrate', [32000, 64000, 128000, 256000], 256000, { label: 'Bitrate' }),
      ...p.enum('format', ['mp3', 'wav', 'pcm'], 'mp3', { label: 'Format' }),
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
        maxLength: 3500,
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
    // One entry for all three H3 Max modes: the inputs pick it — reference
    // images, videos or audio generate from references; a start and/or end
    // frame animates those frames; neither generates from the prompt alone.
    id: 'minimax-h3-max', name: 'MiniMax H3 Max', modelId: 'fal-ai-h3-max',
    addedAt: '2026-08-28',
    workflow: 'minimax/h3-max/video-generation',
    estimatedTime: 5,
    mode: 'video', inputType: 't2v',
    description: 'Top-tier MiniMax H3 Max video from text, a start/end frame, or reference images, videos, and audio — refer to references in the prompt as Image 1, Video 1, Audio 1, in input order. Up to 15s at 1080p.',
    features: [
      feat('Start/End Frame', 'frame'), feat('Multi-Image Input', 'input'),
      feat('Video Input', 'input'), feat('Audio Input', 'input'),
      feat('1080p', 'resolution'), feat('5-15 sec', 'duration'),
    ],
    paramConfig: {
      ...params.prompt({ maxLength: H3_MAX_PROMPT_MAX }),
      ...params.startFrame(),
      ...params.endFrame(),
      // Reference slots — reference-to-video route. Clips are 2-15s each
      // (≤15s combined per modality) and images + videos + audios must add up
      // to ≤12 files — backend-enforced; only the per-array maxima live here.
      ...params.imageInput(9, 'Reference Images'),
      ...params.videoInputs(3, 'Reference Videos'),
      ...params.audioInputs(3, 'Reference Audios'),
      // 1080p is a latent refinement of a native 768p generation.
      ...params.resolution(['480p', '768p', '1080p'], '768p'),
      ...params.durationRange(5, 15, 5),
      // 'adaptive' means "follow the references" — constrained below.
      ...params.aspectRatio(['adaptive', '21:9', '16:9', '4:3', '1:1', '3:4', '9:16'], '16:9'),
      ...p.enum('promptExpansionMode', ['balanced', 'quality'], 'balanced', { label: 'Prompt Expansion' }),
      // -1 (sentinel) means "pick a random seed"; the builder drops it.
      ...p.range('seed', -1, 2147483647, -1),
      ...p.boolean('enableSafetyChecker', true, 'Safety Checker'),
    },
    constraints: h3MaxConstraints,
  },
  {
    // Turbo sibling of minimax-h3-max — same model family, tuned for speed
    // (faster-than-realtime generation), text and frames only.
    id: 'minimax-h3-max-turbo', name: 'MiniMax H3 Max Turbo', modelId: 'fal-ai-h3-max-turbo',
    addedAt: '2026-09-03',
    workflow: 'minimax/h3-max-turbo/text-to-video',
    editWorkflow: 'minimax/h3-max-turbo/image-to-video',
    estimatedTime: 5,
    mode: 'video', inputType: 't2v',
    description: 'Faster-than-realtime MiniMax H3 Max Turbo video from text or a start/end frame, with prompt expansion. Up to 15s at 1080p.',
    features: [
      feat('Fast', 'characteristic'), feat('Image Input', 'input'), feat('Start/End Frame', 'frame'),
      feat('1080p', 'resolution'), feat('5-15 sec', 'duration'),
    ],
    paramConfig: {
      ...params.prompt({ maxLength: H3_MAX_PROMPT_MAX }),
      ...params.startFrame(),
      ...params.endFrame(),
      ...params.resolution(['480p', '768p', '1080p'], '768p'),
      ...params.durationRange(5, 15, 5),
      ...params.aspectRatio(['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'], '16:9'),
      ...p.enum('promptExpansionMode', ['balanced', 'quality'], 'balanced', { label: 'Prompt Expansion' }),
      // -1 (sentinel) means "pick a random seed"; the builder drops it.
      ...p.range('seed', -1, 2147483647, -1),
      ...p.boolean('enableSafetyChecker', true, 'Safety Checker'),
    },
    constraints: [
      // Either frame routes to image-to-video, which derives the ratio from
      // the image it was given (no aspect_ratio on that wire). An end frame
      // alone is valid — fal documents it as end-only keyframe generation.
      { when: { startFrame: { exists: true } }, then: {
        aspectRatio: { disabled: true, reason: 'Aspect ratio follows the frame image.' },
      } },
      { when: { endFrame: { exists: true } }, then: {
        aspectRatio: { disabled: true, reason: 'Aspect ratio follows the frame image.' },
      } },
    ],
  },
]);

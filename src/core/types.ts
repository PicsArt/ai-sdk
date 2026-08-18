type AppProvider =
  | 'picsart'
  | 'google'
  | 'kling'
  | 'grok'
  | 'openai'
  | 'flux'
  | 'ideogram'
  | 'elevenlabs'
  | 'minimax'
  | 'wan'
  | 'seedance'
  | 'ltx'
  | 'seedream'
  | 'seedaudio'
  | 'hunyuan'
  | 'pika'
  | 'runway'
  | 'luma'
  | 'ovi'
  | 'creatify'
  | 'veed'
  | 'bytedance'
  | 'qwen'
  | 'reve'
  | 'recraft'
  | 'videography'
  | 'topaz'
  | 'heygen'
  | 'happyhorse'
  | 'pixverse'
  | 'anthropic'
  | 'async'


/** Provider used by model definitions. */
export type Provider = AppProvider;

/** App generation modes. */
export type GenerationMode = 'video' | 'image' | 'audio' | 'text';


/** App input types. */
export type InputType =
  | 't2v'
  | 'i2v'
  | 'v2v'
  | 'a2v'
  | 't2i'
  | 'i2i'
  | 't2a'
  | 'v2a'
  | 'tts'
  | 'sts'
  | 'sfx'
  | 'music'
  | 't2t'
  | 'i2t'
  | 'v2t';


export interface ModelFeature {
  label: string;
  variant:
    | 'frame'
    | 'resolution'
    | 'audio'
    | 'duration'
    | 'input'
    | 'quality'
    | 'style'
    | 'characteristic';
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  tags: string[];
  provider: Provider;
  previewUrl?: string;
}

export interface AvatarOption {
  id: string;
  name: string;
  description: string;
  tags: string[];
  provider: Provider;
  previewImageUrl?: string;
  previewVideoUrl?: string;
  gender?: string;
  defaultVoiceId?: string;
}

export interface ParamOption {
  id: string;
  label: string;
}

export interface GenerationContext {
  prompt: string;
  aspectRatio?: string;
  duration?: number;
  resolution?: string;
  count?: number;
  generateAudio?: boolean;
  enhancePrompt?: boolean;
  imageUrls?: string[];
  videoUrls?: string[];
  /** Audio URL array — reference audios (max N per model, backend enforces
   *  total-duration caps). Distinct from `audioUrl` (single driving-audio). */
  audioUrls?: string[];
  startFrame?: string;
  endFrame?: string;
  videoUrl?: string;
  audioUrl?: string;
  /** TTS-generated audio id (e.g. Kling Avatar audio_id, alternative to sound_file). */
  audioId?: string;
  voiceId?: string;
  videoId?: string;
  modelId?: string;
  removeBackgroundNoise?: boolean;
  /** MiniMax Music v2 worker field, sent as `lyrics_prompt` (min 10 chars). */
  lyricsPrompt?: string;
  lyricsOptimizer?: boolean;
  isInstrumental?: boolean;
  language?: string;
  accent?: string;
  style?: string;
  /** Recraft V4 Styles — style-reference image URLs (max 5, t2i only).
   *  Required: the V4 Styles API rejects requests without a style. */
  styleReferenceUrls?: string[];
  quality?: string;
  size?: string;
  negativePrompt?: string;
  cfgScale?: number;
  imageWeight?: number;
  renderingSpeed?: string;
  /** Ideogram V4 — opt into post-generation copyright detection (Hive likeness + logo checks). */
  enableCopyrightDetection?: boolean;
  // Persona mentions
  mentionedPersonas?: Array<{ id: string; name: string; imageUrl: string; vibeId: string }>;
  // Topaz — output megapixels (input width×height × upscale_factor² / 1e6)
  outputMegapixels?: number;
  // Recraft Explore Similar
  sourceImageId?: string;
  /** Display-only URL for the source image (not sent to API, used for UI preview). */
  sourceImageUrl?: string;
  similarity?: number;

  // ── SDK-only fields (slated for removal) ─────────────────────────────────
  // The fields below have no UI or CLI consumer — they're read only by vendor
  // payload builders in `specs/src/vendors/catalog/*`. They will be migrated
  // off `GenerationContext` and read via per-model `ModelInput<'<id>'>` (the
  // generated input type derived from each model's paramConfig).
  audioSetting?: 'auto' | 'origin';
  returnLastFrame?: boolean;
  background?: string;
  outputFormat?: string;
  guidance?: number;
  seed?: number;
  substyle?: string;
  thinkingLevel?: 'minimal' | 'high';
  thinkingBudget?: number;
  /** Qwen 3.0 — prompt-rewrite strategy (`direct`/`agent`), sent as `prompt_extend_mode`. */
  promptExtendMode?: 'direct' | 'agent';
}

export type PayloadBuilder<TContext extends GenerationContext = GenerationContext> =
  (ctx: TContext) => object;

/** Lightweight runtime schema contract used by SDK integrations. */
export interface RuntimeSchema<T = unknown> {
  parse(input: unknown): T;
}

/** Pricing unit type — determines how per-unit rate is multiplied on the client.
 *  - per_second: rate × duration (video/audio)
 *  - per_minute: rate × (duration / 60)
 *  - per_image: rate (flat per image; count multiplied separately in UI)
 *  - per_megapixel: rate × megapixels
 *  - per_character: rate × prompt length
 *  - per_1k_character: rate × (prompt length / 1000)
 *  - per_video: rate (flat per video)
 *  - per_audio: rate (flat per audio)
 */

// ── Declarative param constraints ──────────────────────────────────

/** Condition operator: equality or existence check. */
export type ConditionOperator = { is: unknown } | { exists: boolean };

/** Condition map: each key maps to an operator. */
export type ConstraintCondition = Record<string, ConditionOperator>;

/** Per-param outcome of a matching constraint rule.
 *  - `allowed`: restrict this param to a subset of values.
 *  - `disabled`: param is flagged as constrained — UI interprets per-param kind
 *    (dropdowns grey out; text inputs like `prompt` stay editable but surface
 *    the reason as an info banner).
 */
export type Restriction =
  | { allowed: unknown[]; reason?: string }
  | { disabled: true; reason?: string };

/** Declarative rule: when condition matches, apply restrictions to params. */
export interface Constraint {
  when: ConstraintCondition;
  then: Record<string, Restriction>;
}

export type BadgeType = 'new' | 'popular' | 'coming-soon' | 'fast' | 'premium' | 'hot';

/**
 * Model release / availability tier. See `ModelDefinition.release`.
 * Ordered widest-exposure-last: `preview` (stage only) → `production` (our
 * apps) → `general-availability` (enterprise / external use).
 */
export type ReleaseTag = 'preview' | 'production' | 'general-availability';

export interface ModelDefinition {
  id: string;
  name: string;
  provider: Provider;
  workflow: string;
  editWorkflow?: string;
  syncExecute?: boolean;
  /** Provider display name (e.g. 'Flux', 'OpenAI', 'Kling'). */
  providerName: string;
  /** Provider brand color hex (e.g. '#FF6B6B'). */
  providerColor: string;
  /** Provider short label (e.g. 'F', 'O', 'K'). */
  providerLabel: string;
  description: string;
  features: ModelFeature[];
  badge?: BadgeType[];
  /** ISO YYYY-MM-DD date the model was added. The 'new' badge is derived from this — see core/badges.ts. */
  addedAt?: string;
  /**
   * Marks a model as operationally unavailable — backend not deployed,
   * pricing unconfirmed, catalog/runtime mismatch, etc. Expected to flip
   * back on once the gate clears. Hidden from default catalog lookups.
   */
  disabled?: boolean;
  /**
   * Marks a model as retired — superseded by a newer model or otherwise no
   * longer offered. Will not come back. Catalog row stays so workflow IDs
   * and toolIds remain resolvable for historical jobs and pricing. Hidden
   * from default catalog lookups, same as `disabled`.
   */
  deprecated?: boolean;
  release?: ReleaseTag;
  mode: GenerationMode;
  inputType: InputType;
  modelId?: string;
  paramConfig: import('./descriptors/types.ts').ModelParams;
  /** Declarative inter-parameter constraints (e.g. "1080p requires 8s duration"). */
  constraints?: Constraint[];
  /** Payload builder. Optional — omit for pass-through (param values sent as-is). */
  buildPayload?: PayloadBuilder;
  /** I2V/edit payload builder when different from buildPayload. */
  buildEditPayload?: PayloadBuilder;
  outputSchema?: RuntimeSchema<unknown>;
  estimatedTime?: number | Record<string, number>;
  editEstimatedTime?: number | Record<string, number>;
  testTimeout?: number;
}

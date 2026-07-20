import type { GenerationContext } from '../types.ts';

/** Wire format for deep link payloads (v1). */
export interface DeepLinkPayloadV1 {
  v: 1;
  /** Model ID. */
  m: string;
  /** Prompt. */
  p?: string;
  /** Negative prompt. */
  np?: string;
  /** Non-default model params. */
  o?: Record<string, unknown>;
  /** Input image URLs. */
  i?: string[];
  /** Video input URL. */
  vi?: string;
  /** Audio input URL. */
  au?: string;
  /** Start frame URL. */
  sf?: string;
  /** End frame URL. */
  ef?: string;
}

/** Result of decoding a deep link. */
export interface DeepLinkResult {
  /** Model ID from the payload. */
  modelId: string;
  /** Partial GenerationContext reconstructed from the payload. */
  context: Partial<GenerationContext>;
  /** Whether the model ID exists in the current catalog. */
  modelKnown: boolean;
  /** Non-fatal warnings (e.g. rejected URLs, unknown model). */
  warnings: string[];
}
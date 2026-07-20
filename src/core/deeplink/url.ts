import type { GenerationContext } from '../types.ts';
import type { DeepLinkResult } from './types.ts';
import { serializePayload } from './serialize.ts';
import { deserializePayload } from './deserialize.ts';

/**
 * Encode a model ID + context into a compressed, base64url-encoded payload string.
 * Consumers attach this to their own URL (e.g. `?aistate=${payload}`).
 */
export function encodeDeepLinkPayload(
  modelId: string,
  context: Partial<GenerationContext>,
): string {
  return serializePayload(modelId, context);
}

/**
 * Decode a compressed payload string back into a DeepLinkResult.
 * Returns null if decoding or validation fails.
 */
export function decodeDeepLinkPayload(encoded: string): DeepLinkResult | null {
  return deserializePayload(encoded);
}

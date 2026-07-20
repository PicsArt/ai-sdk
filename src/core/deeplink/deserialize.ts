import type { GenerationContext } from '../types.ts';
import type { DeepLinkPayloadV1, DeepLinkResult } from './types.ts';
import { getModel } from '../model-registry.ts';
import { transferValues } from '../descriptors/utils.ts';
import { decode } from './codec.ts';
import { sanitizePrompt, isAllowedUrl } from './sanitize.ts';

function isValidPayload(data: unknown): data is DeepLinkPayloadV1 {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return obj.v === 1 && typeof obj.m === 'string' && obj.m.length > 0;
}

function filterUrls(urls: unknown[], warnings: string[]): string[] {
  const result: string[] = [];
  for (const url of urls) {
    if (typeof url !== 'string') continue;
    if (isAllowedUrl(url)) {
      result.push(url);
    } else {
      warnings.push(`Rejected URL: ${url}`);
    }
  }
  return result;
}

/**
 * Decode an encoded payload string into a DeepLinkResult.
 * Returns null if decoding or validation fails.
 */
export function deserializePayload(encoded: string): DeepLinkResult | null {
  let data: unknown;
  try {
    data = decode(encoded);
  } catch {
    return null;
  }

  if (!isValidPayload(data)) return null;

  const warnings: string[] = [];
  const context: Partial<GenerationContext> = {};
  const model = getModel(data.m);
  const modelKnown = !!model;

  if (!modelKnown) {
    warnings.push(`Unknown model: ${data.m}`);
  }

  // Restore prompt
  if (data.p) context.prompt = sanitizePrompt(data.p);
  if (data.np) context.negativePrompt = sanitizePrompt(data.np);

  // Restore media URLs (validated)
  if (data.i?.length) {
    const validImages = filterUrls(data.i, warnings);
    if (validImages.length) context.imageUrls = validImages;
  }
  if (data.vi) {
    if (isAllowedUrl(data.vi)) {
      context.videoUrl = data.vi;
    } else {
      warnings.push(`Rejected video URL: ${data.vi}`);
    }
  }
  if (data.au) {
    if (isAllowedUrl(data.au)) {
      context.audioUrl = data.au;
    } else {
      warnings.push(`Rejected audio URL: ${data.au}`);
    }
  }
  if (data.sf) {
    if (isAllowedUrl(data.sf)) {
      context.startFrame = data.sf;
    } else {
      warnings.push(`Rejected start frame URL: ${data.sf}`);
    }
  }
  if (data.ef) {
    if (isAllowedUrl(data.ef)) {
      context.endFrame = data.ef;
    } else {
      warnings.push(`Rejected end frame URL: ${data.ef}`);
    }
  }

  // Restore model params — validate through transferValues if model is known
  if (data.o && typeof data.o === 'object') {
    if (model) {
      const validated = transferValues(model.paramConfig, data.o);
      Object.assign(context, validated);
    } else {
      // Unknown model — pass through params as-is
      Object.assign(context, data.o);
    }
  }

  return { modelId: data.m, context, modelKnown, warnings };
}

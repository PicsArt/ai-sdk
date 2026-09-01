import type { WorkflowJobHandle, WorkflowStatusResult, CreditUsage } from './workflow.ts';
import { ApiError, codeForStatus } from './errors.ts';

export function throwIfErrorResult(result: unknown, modelName: string): void {
  if (!result || typeof result !== 'object' || Array.isArray(result)) return;
  const obj = result as Record<string, unknown>;
  const status = obj.status ?? obj.statusCode;
  const message = obj.message ?? obj.error ?? obj.reason;
  const isError =
    (typeof status === 'number' && status >= 400) ||
    (status === 'error' || status === 'FAILED');

  if (isError) {
    const code = typeof status === 'number' ? ` (${status})` : '';
    const detail = message ? String(message) : 'unknown error';
    // A 200 carrying an error payload: trust its own status when numeric,
    // otherwise call it a bad gateway response.
    const httpStatus = typeof status === 'number' ? status : 502;
    const reason = obj.reason;
    throw new ApiError(`${modelName} failed${code}: ${detail}`, {
      status: httpStatus,
      code: typeof reason === 'string' && reason.length > 0 ? reason : codeForStatus(httpStatus),
    });
  }
}

export function extractSyncResult(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const data = raw as Record<string, unknown>;
  const syncResult = (data.response as Record<string, unknown> | undefined)?.result ?? data.result;
  const sr = syncResult as Record<string, unknown> | undefined;
  const imgs = sr && Array.isArray(sr.images) ? sr.images : null;
  return imgs?.length ? imgs[0] : syncResult;
}

export const extractUrl = (result: unknown): string | undefined => {
  if (Array.isArray(result)) return extractUrl(result[0]);

  if (result && typeof result === 'object') {
    const obj = result as Record<string, unknown>;
    if (typeof obj.url === 'string') return obj.url;
    if (typeof obj.videoUrl === 'string') return obj.videoUrl;
    if (typeof obj.video_url === 'string') return obj.video_url;
    if (obj.video && typeof obj.video === 'object') {
      const v = obj.video as Record<string, unknown>;
      if (typeof v.url === 'string') return v.url;
    }
    if (obj.audio && typeof obj.audio === 'object') {
      const a = obj.audio as Record<string, unknown>;
      if (typeof a.url === 'string') return a.url;
    }
    if (obj.assets && typeof obj.assets === 'object') {
      const a = obj.assets as Record<string, unknown>;
      if (typeof a.video === 'string') return a.video;
      if (typeof a.image === 'string') return a.image;
    }
    if (typeof obj.image === 'string') return obj.image;
    if (obj.image && typeof obj.image === 'object') {
      const i = obj.image as Record<string, unknown>;
      if (typeof i.url === 'string') return i.url;
    }
    if (typeof obj.image_url === 'string') return obj.image_url;
    if (typeof obj.imageUrl === 'string') return obj.imageUrl;
    if (typeof obj.audio_url === 'string') return obj.audio_url;
    if (Array.isArray(obj.audioUrls) && obj.audioUrls.length > 0) {
      const au = obj.audioUrls[0] as Record<string, unknown>;
      if (typeof au === 'string') return au;
      if (au && typeof au === 'object' && typeof au.url === 'string') return au.url;
    }
    if (typeof obj.url_mp3 === 'string') return obj.url_mp3;
    if (Array.isArray(obj.imageUrls) && obj.imageUrls.length > 0) {
      const img = obj.imageUrls[0] as Record<string, unknown>;
      if (typeof img === 'string') return img;
      if (img && typeof img === 'object' && typeof img.url === 'string') return img.url;
    }
    if (Array.isArray(obj.images) && obj.images.length > 0) {
      const img = obj.images[0] as Record<string, unknown>;
      if (typeof img === 'string') return img;
      if (img && typeof img === 'object' && typeof img.url === 'string') return img.url;
    }
    if (Array.isArray(obj.urls) && obj.urls.length > 0 && typeof obj.urls[0] === 'string') return obj.urls[0];
    if (Array.isArray(obj.candidates)) {
      for (const c of obj.candidates as Record<string, unknown>[]) {
        const content = c?.content as Record<string, unknown> | undefined;
        const parts = content?.parts as Record<string, unknown>[] | undefined;
        if (Array.isArray(parts)) {
          for (const p of parts) {
            if (typeof p.imageUrl === 'string') return p.imageUrl;
          }
        }
      }
    }
    if (Array.isArray(obj.data) && obj.data.length > 0) {
      const d = obj.data[0] as Record<string, unknown>;
      if (typeof d === 'string') return d;
      if (d && typeof d === 'object' && typeof d.url === 'string') return d.url;
    }
    if (Array.isArray(obj.items) && obj.items.length > 0) {
      const item = obj.items[0] as Record<string, unknown>;
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && typeof item.url === 'string') return item.url;
    }
    if (Array.isArray(obj.previews) && obj.previews.length > 0) {
      const p = obj.previews[0] as Record<string, unknown>;
      if (typeof p === 'string') return p;
      if (p && typeof p === 'object' && typeof p.url === 'string') return p.url;
    }
    if (obj.result && typeof obj.result === 'object') return extractUrl(obj.result);
    if (obj.url && typeof obj.url === 'object') return extractUrl(obj.url);
  }

  if (typeof result === 'string') return result;
  return undefined;
};

/**
 * Extract generated text from an LLM workflow response.
 * Mirrors extractUrl's resilient shape-hunting across the common provider
 * response shapes routed through Picsart workflows (Anthropic, OpenAI, Gemini)
 * plus the nested `response.result` / `result` wrappers.
 */
export const extractText = (result: unknown): string | undefined => {
  if (typeof result === 'string') return result;
  if (Array.isArray(result)) return extractText(result[0]);
  if (!result || typeof result !== 'object') return undefined;

  const obj = result as Record<string, unknown>;

  // Flat fields
  if (typeof obj.text === 'string') return obj.text;
  if (typeof obj.output_text === 'string') return obj.output_text;
  if (typeof obj.outputText === 'string') return obj.outputText;
  if (typeof obj.content === 'string') return obj.content;
  if (typeof obj.message === 'string') return obj.message;

  // Anthropic Messages — content: [{ type: 'text', text }]
  if (Array.isArray(obj.content)) {
    const parts = obj.content as Record<string, unknown>[];
    const texts = parts
      .map((p) => (p && typeof p === 'object' && typeof p.text === 'string' ? p.text : null))
      .filter((t): t is string => t != null);
    if (texts.length) return texts.join('');
  }

  // OpenAI Chat — choices: [{ message: { content } }] (content may be string or array)
  if (Array.isArray(obj.choices) && obj.choices.length > 0) {
    const choice = obj.choices[0] as Record<string, unknown>;
    const message = choice?.message as Record<string, unknown> | undefined;
    if (message) {
      if (typeof message.content === 'string') return message.content;
      if (Array.isArray(message.content)) {
        const texts = (message.content as Record<string, unknown>[])
          .map((p) => (typeof p?.text === 'string' ? p.text : null))
          .filter((t): t is string => t != null);
        if (texts.length) return texts.join('');
      }
    }
    if (typeof choice?.text === 'string') return choice.text;
  }

  // Gemini — candidates: [{ content: { parts: [{ text }] } }].
  // Skip `thought: true` parts (reasoning summaries) — keep only answer text.
  if (Array.isArray(obj.candidates) && obj.candidates.length > 0) {
    for (const c of obj.candidates as Record<string, unknown>[]) {
      const content = c?.content as Record<string, unknown> | undefined;
      const parts = content?.parts as Record<string, unknown>[] | undefined;
      if (Array.isArray(parts)) {
        const texts = parts
          .filter((p) => p && p.thought !== true)
          .map((p) => (typeof p?.text === 'string' ? p.text : null))
          .filter((t): t is string => t != null);
        if (texts.length) return texts.join('');
      }
    }
  }

  // Nested wrappers
  if (obj.response && typeof obj.response === 'object') {
    const nested = extractText(obj.response);
    if (nested != null) return nested;
  }
  if (obj.result && typeof obj.result === 'object') {
    const nested = extractText(obj.result);
    if (nested != null) return nested;
  }

  return undefined;
};

// ── Multi-result extraction (explore endpoints) ─────────────────────

export interface MultiResultItem {
  url: string;
  exploreImageId?: string;
}

/**
 * Extract all result items from a multi-result API response.
 * Returns undefined if the response doesn't contain multiple items.
 * Supports responses with `items: [{ url, image_id }, ...]` format.
 */
export const extractAllResults = (result: unknown): MultiResultItem[] | undefined => {
  if (!result || typeof result !== 'object') return undefined;
  const obj = result as Record<string, unknown>;
  if (Array.isArray(obj.items) && obj.items.length > 1) {
    const items: MultiResultItem[] = [];
    for (const item of obj.items) {
      if (item && typeof item === 'object') {
        const it = item as Record<string, unknown>;
        const url = typeof it.url === 'string' ? it.url : undefined;
        if (url) {
          items.push({
            url,
            exploreImageId: typeof it.image_id === 'string' ? it.image_id : undefined,
          });
        }
      }
    }
    if (items.length > 0) return items;
  }
  return undefined;
};

export function toCompletedStatus(
  handle: WorkflowJobHandle,
  result: unknown,
  raw: unknown,
  usage?: CreditUsage,
): WorkflowStatusResult<unknown> {
  return {
    handle,
    status: 'COMPLETED',
    result,
    raw,
    usage,
  };
}

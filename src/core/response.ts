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
  // Unwrap the envelope only — multi-image results (`images[]`) are fanned out
  // into result items downstream (extractAllResults), not truncated to [0].
  return (data.response as Record<string, unknown> | undefined)?.result ?? data.result;
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

// ── Multi-result extraction (explore endpoints, multi-image batches) ─

export interface MultiResultItem {
  url: string;
  /** The vendor's per-item object, kept for metadata extraction. */
  source?: Record<string, unknown>;
}

/** Result-array keys the multi-result fan-out (and per-item metadata) knows. */
const RESULT_ARRAY_KEYS = ['items', 'images', 'imageUrls', 'urls', 'data', 'previews'] as const;

/**
 * Extract all result items from a multi-result API response.
 * Returns undefined if the response doesn't contain multiple items.
 * Supports the result-array shapes extractUrl already knows:
 * `items[]` (explore), `images[]` (fal-style), `imageUrls[]` (gemini),
 * `urls: string[]` (seedream) and `data[]` (OpenAI-style) — entries are
 * URL strings or objects carrying a string `url`.
 */
export const extractAllResults = (result: unknown): MultiResultItem[] | undefined => {
  if (!result || typeof result !== 'object') return undefined;
  const obj = result as Record<string, unknown>;
  let arr: unknown[] | undefined;
  for (const key of RESULT_ARRAY_KEYS) {
    const candidate = obj[key];
    if (Array.isArray(candidate) && candidate.length > 1) { arr = candidate; break; }
  }
  if (!arr) return undefined;

  const items: MultiResultItem[] = [];
  for (const entry of arr) {
    if (typeof entry === 'string') {
      items.push({ url: entry });
      continue;
    }
    if (entry && typeof entry === 'object') {
      const it = entry as Record<string, unknown>;
      if (typeof it.url === 'string') items.push({ url: it.url, source: it });
    }
  }
  return items.length > 0 ? items : undefined;
};

// ── Per-item vendor metadata ─────────────────────────────────────────

/**
 * Per-item vendor metadata promoted from the response. Every key is
 * best-effort: present when the vendor reports it, absent otherwise.
 */
export interface GenerateResultItemMetadata {
  /** Explore image id (recraft explore models) — pass back as `sourceImageId`
   *  to iterate on this image. */
  exploreImageId?: string;
  /** Voice preview id (ElevenLabs voice design/remix) — pass to the vendor's
   *  create-voice-from-preview step to persist the voice. */
  generatedVoiceId?: string;
  /** URL of the generated video's last frame, when the model was asked for it
   *  (`returnLastFrame`, seedance) — the seed for frame-chaining flows. */
  lastFrameUrl?: string;
  /** The draft a Seedance 2.5 Draft generation produced — pass it back
   *  unchanged as `draftTask` to the matching `-draft-final` model to render
   *  the final 1080p video (valid 7 days). Wire field names on purpose: the
   *  worker signs it, so any change is rejected. */
  draftTask?: SeedanceDraftTask;
}

/** A Seedance 2.5 draft reference, as the worker issues it. */
export interface SeedanceDraftTask {
  id: string;
  video_input: boolean;
  signature: string;
}

const isSeedanceDraftTask = (value: unknown): value is SeedanceDraftTask => {
  const v = value as Partial<SeedanceDraftTask> | null;
  return !!v && typeof v === 'object'
    && typeof v.id === 'string'
    && typeof v.video_input === 'boolean'
    && typeof v.signature === 'string';
};

/**
 * Build the promoted metadata for one result item — only fields a consumer
 * acts on, nothing speculative. `item` is the vendor's per-item object (an
 * `images[]` / `items[]` entry, or the whole result for single-result models);
 * `parsed` is the full contract-parsed result (carries response-level keys
 * like `last_frame_url`). `provider` gates vendor-specific promotions:
 * `image_id` means "explore image" only on recraft, `generated_voice_id` only
 * on elevenlabs, `draft_task` only on seedance — an unrelated vendor echoing
 * those key names must not leak into the typed metadata.
 */
export function buildItemMetadata(
  parsed: unknown,
  item: unknown,
  _index: number,
  provider?: string,
): GenerateResultItemMetadata | undefined {
  const meta: GenerateResultItemMetadata = {};
  const top = (parsed && typeof parsed === 'object') ? parsed as Record<string, unknown> : undefined;
  const it = (item && typeof item === 'object' && !Array.isArray(item)) ? item as Record<string, unknown> : undefined;

  if (provider === 'recraft' && typeof it?.image_id === 'string') meta.exploreImageId = it.image_id;
  if (provider === 'elevenlabs' && typeof it?.generated_voice_id === 'string') meta.generatedVoiceId = it.generated_voice_id;
  // The last frame rides the response next to the video url (seedance
  // `returnLastFrame`); item-level wins if a vendor ever nests it per item.
  const lastFrame = it?.last_frame_url ?? top?.last_frame_url;
  if (typeof lastFrame === 'string') meta.lastFrameUrl = lastFrame;
  // Seedance 2.5 Draft: the reference rides the response next to the video url.
  const draftTask = top?.draft_task;
  if (provider === 'seedance' && isSeedanceDraftTask(draftTask)) {
    meta.draftTask = { id: draftTask.id, video_input: draftTask.video_input, signature: draftTask.signature };
  }

  return Object.keys(meta).length > 0 ? meta : undefined;
}

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

/**
 * Gemini payload builders: Gemini Omni 1.1 Flash (Preview) and the TTS family.
 *
 * ── Omni ──
 *
 * Assembles the nested image/video objects of the `gemini-omni/video` worker
 * from flat SDK fields and pins `model: 'gemini-omni-1.1-flash-preview'`.
 * The worker derives the video task (text_to_video / image_to_video / extend /
 * reference_to_video) from which inputs are present, so the Command's optional
 * `task` field is never sent — an explicit task would override that derivation.
 *
 * TODO: annotate the return with WorkflowTypes['gemini-omni/video']['params']
 * once @picsart/workflows-types publishes the 1.1 additions (lastFrame,
 * referenceImages, referenceVideos, resolution — absent as of 1.1.119).
 * Until then the return is inferred.
 */
import type { WorkflowTypes } from '@picsart/workflows-types';

import type { ModelInput } from '../../generated/model-input-types.ts';
import { ApiError } from '../../core/errors.ts';
import { GEMINI_DEFAULT_VOICE_ID } from '../../core/voices.ts';
import { registerPayloads } from '../define.ts';
import { MODELS } from './gemini.ts';

type OmniFlash11Input = ModelInput<'gemini-omni-1.1-flash-preview'>;

function inferMimeType(url: string): 'image/png' | 'image/jpeg' {
  return url.match(/\.png(\?|$)/i) ? 'image/png' : 'image/jpeg';
}

const toImage = (url: string) => ({ url, mimeType: inferMimeType(url) });

const buildOmniFlash11Payload = (input: OmniFlash11Input) => ({
  prompt: input.prompt,
  model: 'gemini-omni-1.1-flash-preview',
  // Materialize the catalog defaults so direct SDK calls send the advertised
  // values rather than relying on the worker/vendor defaults.
  aspectRatio: input.aspectRatio ?? '16:9',
  durationSeconds: input.duration ?? 8,
  resolution: input.resolution ?? '720p',
  ...(input.startFrame ? { image: toImage(input.startFrame) } : {}),
  ...(input.endFrame ? { lastFrame: toImage(input.endFrame) } : {}),
  ...(input.imageUrls?.length
    ? { referenceImages: input.imageUrls.map(toImage) }
    : {}),
  ...(input.videoUrl ? { video: { url: input.videoUrl } } : {}),
  ...(input.videoUrls?.length
    ? { referenceVideos: input.videoUrls.map((url) => ({ url })) }
    : {}),
});

// ── TTS (gemini/v1/audios) ──────────────────────────────────────────

type Tts25Input = ModelInput<'gemini-2.5-flash-tts'>;
type Tts38Input = ModelInput<'gemini-3.8-flash-tts'>;

type GeminiTtsModel = WorkflowTypes['gemini/v1/audios']['params']['model'];

/**
 * The worker command. TODO: replace with WorkflowTypes['gemini/v1/audios']['params']
 * once @picsart/workflows-types publishes `style`, `parts` and the optional
 * `text` (absent as of 1.1.152, while the live worker takes them). Until then
 * only `model` is compile-checked against the published contract.
 */
interface GeminiTtsCommand {
  model: GeminiTtsModel;
  text?: string;
  style?: string;
  parts?: Array<{ text: string; speaker?: string; style?: string }>;
  voiceName?: string;
  multiSpeakerVoiceConfigs?: Array<{ speaker: string; voiceName: string }>;
}

type Part = { text: string; speaker?: string; style?: string };
type SpeakerConfig = { speaker: string; voiceName: string };

/** Worker cap on `style` / `speechMetadata.style`. */
const STYLE_MAX = 500;
/**
 * Cap on everything one request speaks. The worker bounds each part (6,000)
 * but not their sum, and 2.5 gets its parts as one `text`, which the worker
 * does not bound at all. 6,000 is the `prompt` cap these entries carry, the
 * one figure verified against the live worker.
 */
const TEXT_MAX = 6000;

const invalid = (message: string) =>
  new ApiError(message, { status: 400, code: 'validation_error' });

const blank = (value: string | undefined) => !value?.trim();

/**
 * Checks shared by both generations, mirroring the worker's `buildSpeechParts`
 * so a bad request is refused before any spend: a prompt or parts, no empty
 * part, speaker names that match a speaker config and only when configs exist.
 * Returns the parts to speak (none for a plain prompt) and the speaker names.
 */
function checkInput(input: {
  prompt?: string;
  parts?: Part[];
  multiSpeakerVoiceConfigs?: SpeakerConfig[];
}): { parts?: Part[]; speakers: string[] } {
  const configs = input.multiSpeakerVoiceConfigs ?? [];
  for (const [i, config] of configs.entries()) {
    if (blank(config.speaker)) throw invalid(`Gemini TTS: speaker config ${i + 1} has no speaker.`);
    if (blank(config.voiceName)) throw invalid(`Gemini TTS: speaker config ${i + 1} has no voiceName.`);
  }
  const speakers = configs.map((config) => config.speaker);
  if (new Set(speakers).size !== speakers.length) {
    throw invalid('Gemini TTS: multiSpeakerVoiceConfigs names the same speaker twice.');
  }

  const parts = input.parts?.length ? input.parts : undefined;
  if (!parts) {
    if (blank(input.prompt)) throw invalid('Gemini TTS: provide a prompt or parts.');
    return { speakers };
  }
  for (const [i, part] of parts.entries()) {
    if (blank(part.text)) throw invalid(`Gemini TTS: part ${i + 1} has no text.`);
    if (speakers.length && (!part.speaker || !speakers.includes(part.speaker))) {
      throw invalid(
        `Gemini TTS: part ${i + 1} needs a speaker from multiSpeakerVoiceConfigs (${speakers.join(', ')}).`,
      );
    }
    if (!speakers.length && part.speaker) {
      throw invalid(`Gemini TTS: part ${i + 1} names a speaker but no multiSpeakerVoiceConfigs are set.`);
    }
  }
  return { parts, speakers };
}

function assertLength(spoken: string): void {
  if (spoken.length > TEXT_MAX) {
    throw invalid(`Gemini TTS: the text totals ${spoken.length} characters; the limit is ${TEXT_MAX}.`);
  }
}

/** The voice fields: speaker configs replace the single voice. */
const voiceFields = (input: { voiceId?: string; multiSpeakerVoiceConfigs?: SpeakerConfig[] }) =>
  input.multiSpeakerVoiceConfigs?.length
    ? { multiSpeakerVoiceConfigs: input.multiSpeakerVoiceConfigs }
    : { voiceName: input.voiceId ?? GEMINI_DEFAULT_VOICE_ID };

/**
 * 3.8 delivery direction. `language` / `accent` have no field of their own on
 * the worker, so they travel inside the style, which 3.8 reads as direction and
 * never speaks.
 */
function composeStyle(input: {
  styles: Array<string | undefined>;
  language?: string;
  accent?: string;
}): string | undefined {
  const language = input.language?.trim();
  const accent = input.accent?.trim();
  const voice = language || accent
    ? `speak${language ? ` in ${language}` : ''}${accent ? ` with a ${accent} accent` : ''}`
    : undefined;
  const composed = [...input.styles.map((style) => style?.trim()), voice]
    .filter(Boolean)
    .join('; ') || undefined;
  if (composed && composed.length > STYLE_MAX) {
    throw invalid(`Gemini TTS: style with language/accent exceeds ${STYLE_MAX} characters.`);
  }
  return composed;
}

/**
 * 2.5 has no direction field: it reads delivery from a natural-language
 * prefix ahead of the text ("Say in Spanish with a Mexican accent: …"), the
 * form Google documents for the 2.5 TTS models. The prefix is part of the
 * text, so the worker moderates and prices it with the rest.
 */
function directionPrefix(input: { language?: string; accent?: string }): string {
  const language = input.language?.trim();
  const accent = input.accent?.trim();
  if (!language && !accent) return '';
  return `Say${language ? ` in ${language}` : ''}${accent ? ` with a ${accent} accent` : ''}: `;
}

/**
 * 2.5 ignores `speechMetadata`, so `parts` never reach it as parts: they are
 * written into one text, each line labelled with its speaker when there are
 * speaker configs ("Narrator: …"), which is how 2.5 tells the voices apart.
 * `language` / `accent` go in front as a "Say …:" prefix.
 */
const buildTts25Payload = (model: GeminiTtsModel) => (input: Tts25Input): GeminiTtsCommand => {
  const { parts, speakers } = checkInput(input);
  const body = parts
    ? parts.map((part) => (speakers.length ? `${part.speaker}: ${part.text}` : part.text)).join('\n')
    : input.prompt!;
  const text = `${directionPrefix(input)}${body}`;
  assertLength(text);
  return { text, model, ...voiceFields(input) };
};

/**
 * 3.8 takes the worker shapes as they are. With `parts` the worker ignores the
 * top-level `text` and `style`, so the request-level style and `language` /
 * `accent` are written onto every part, ahead of the part's own style.
 */
const buildTts38Payload = (model: GeminiTtsModel) => (input: Tts38Input): GeminiTtsCommand => {
  const { parts } = checkInput(input);
  const direction = { language: input.language, accent: input.accent };
  if (!parts) {
    assertLength(input.prompt!);
    const style = composeStyle({ styles: [input.style], ...direction });
    return { text: input.prompt, model, ...voiceFields(input), ...(style ? { style } : {}) };
  }
  // Counted the way the worker prices and moderates: the parts' text joined.
  assertLength(parts.map((part) => part.text).join('\n'));
  return {
    parts: parts.map((part) => {
      const style = composeStyle({ styles: [input.style, part.style], ...direction });
      return {
        text: part.text,
        ...(part.speaker ? { speaker: part.speaker } : {}),
        ...(style ? { style } : {}),
      };
    }),
    model,
    ...voiceFields(input),
  };
};

registerPayloads(MODELS, {
  'gemini-omni-1.1-flash-preview': buildOmniFlash11Payload,
  'gemini-2.5-flash-tts': buildTts25Payload('gemini-2.5-flash-tts'),
  'gemini-2.5-pro-tts': buildTts25Payload('gemini-2.5-pro-tts'),
  'gemini-3.8-flash-tts': buildTts38Payload('gemini-3.8-flash-tts'),
  'gemini-3.8-flash-lite-tts': buildTts38Payload('gemini-3.8-flash-lite-tts'),
});

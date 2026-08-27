import type { ModelDefinition } from '../../core/types.ts';
import { isVisibleForReleases } from '../../core/visibility.ts';

import { MODELS as klingMODELS } from './kling/index.ts';
import './kling/payloads.ts'; // registers payload builders after model definitions
import { MODELS as ltxMODELS } from './ltx.ts';
import { MODELS as creatifyMODELS } from './creatify.ts';
import { MODELS as veedMODELS } from './veed.ts';
import { MODELS as oviMODELS } from './ovi.ts';
import { MODELS as bytedanceMODELS } from './bytedance.ts';
import './bytedance.payloads.ts'; // registers the video-enhance payload builder after model definitions
import { MODELS as videographyMODELS } from './videography.ts';
import { MODELS as hunyuanMODELS } from './hunyuan.ts';
import { MODELS as hailuoMODELS } from './hailuo.ts';
import { MODELS as wanMODELS } from './wan.ts';
import './wan.payloads.ts'; // registers the Wan 3.0 payload builder after model definitions
import { MODELS as lumaMODELS } from './luma.ts';
import './luma.payloads.ts'; // registers Ray 3.2 payload builders after model definitions
import { MODELS as seedanceMODELS } from './seedance.ts';
import { MODELS as soraMODELS } from './sora.ts';
import { MODELS as seedreamMODELS } from './seedream.ts';
import { MODELS as seedaudioMODELS } from './seedaudio.ts';
import './seedaudio.payloads.ts'; // registers the Seed Audio payload builder after model definitions
import { MODELS as reveMODELS } from './reve.ts';
import { MODELS as grokMODELS } from './grok.ts';
import './grok.payloads.ts'; // registers the Grok Imagine 2.0 payload builders after model definitions
import { MODELS as pikaMODELS } from './pika.ts';
import { MODELS as veoMODELS } from './veo.ts';
import { MODELS as runwayMODELS } from './runway.ts';
import { MODELS as fluxMODELS } from './flux.ts';
import './flux.payloads.ts'; // registers flux-3-video payload builder after model definitions
import { MODELS as geminiMODELS } from './gemini.ts';
import './gemini.payloads.ts'; // registers the Gemini Omni 1.1 payload builder after model definitions
import { MODELS as openaiMODELS } from './openai.ts';
import { MODELS as elevenlabsMODELS } from './elevenlabs.ts';
import './elevenlabs.payloads.ts'; // registers Music payload builder after model definitions
import { MODELS as heygenMODELS } from './heygen.ts';
import { MODELS as minimaxMODELS } from './minimax.ts';
import './minimax.payloads.ts'; // registers the Music v3 payload builder after model definitions
import { MODELS as ideogramMODELS } from './ideogram.ts';
import { MODELS as qwenMODELS } from './qwen.ts';
import { MODELS as recraftMODELS } from './recraft.ts';
import { MODELS as topazMODELS } from './topaz.ts';
import './topaz.payloads.ts'; // registers Topaz image + video upscale payload builders after model definitions
import { MODELS as picsartMODELS } from './picsart.ts';
import { MODELS as lyriaMODELS } from './lyria.ts';
import { MODELS as happyhorseMODELS } from './happyhorse.ts';
import { MODELS as pixverseMODELS } from './pixverse.ts';
import './pixverse.payloads.ts'; // registers payload builders after model definitions
import { MODELS as asyncAiMODELS } from './async-ai.ts';
import './async-ai.payloads.ts'; // registers payload builders after model definitions
import { MODELS as llmMODELS } from './llm.ts';
import './llm.payloads.ts'; // registers LLM payload builders after model definitions

/** All models from all vendors. */
export const ALL_MODELS: ModelDefinition[] = [
  ...klingMODELS,
  ...ltxMODELS,
  ...creatifyMODELS,
  ...veedMODELS,
  ...oviMODELS,
  ...bytedanceMODELS,
  ...videographyMODELS,
  ...hunyuanMODELS,
  ...hailuoMODELS,
  ...wanMODELS,
  ...lumaMODELS,
  ...seedanceMODELS,
  ...soraMODELS,
  ...seedreamMODELS,
  ...seedaudioMODELS,
  ...reveMODELS,
  ...grokMODELS,
  ...pikaMODELS,
  ...veoMODELS,
  ...runwayMODELS,
  ...fluxMODELS,
  ...geminiMODELS,
  ...openaiMODELS,
  ...elevenlabsMODELS,
  ...heygenMODELS,
  ...minimaxMODELS,
  ...ideogramMODELS,
  ...lyriaMODELS,
  ...qwenMODELS,
  ...recraftMODELS,
  ...topazMODELS,
  ...picsartMODELS,
  ...happyhorseMODELS,
  ...pixverseMODELS,
  ...asyncAiMODELS,
  ...llmMODELS,
];

/**
 * Models for a generation mode. By default returns only default-visible models
 * (production / general-availability — preview, disabled and deprecated are
 * hidden). `includeDisabled = true` returns every model of the mode, bypassing
 * all gates. For release-tier filtering use `catalog.find({ output, release })`.
 */
export const getModelsByMode = (mode: ModelDefinition['mode'], includeDisabled = false): ModelDefinition[] =>
  ALL_MODELS.filter((m) => m.mode === mode && (includeDisabled || isVisibleForReleases(m)));

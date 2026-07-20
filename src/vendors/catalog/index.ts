import type { ModelDefinition } from '../../core/types.ts';

import { MODELS as klingMODELS } from './kling/index.ts';
import './kling/payloads.ts'; // registers payload builders after model definitions
import { MODELS as ltxMODELS } from './ltx.ts';
import { MODELS as creatifyMODELS } from './creatify.ts';
import { MODELS as veedMODELS } from './veed.ts';
import { MODELS as oviMODELS } from './ovi.ts';
import { MODELS as bytedanceMODELS } from './bytedance.ts';
import { MODELS as videographyMODELS } from './videography.ts';
import { MODELS as hunyuanMODELS } from './hunyuan.ts';
import { MODELS as hailuoMODELS } from './hailuo.ts';
import { MODELS as wanMODELS } from './wan.ts';
import { MODELS as lumaMODELS } from './luma.ts';
import './luma.payloads.ts'; // registers Ray 3.2 payload builders after model definitions
import { MODELS as seedanceMODELS } from './seedance.ts';
import { MODELS as soraMODELS } from './sora.ts';
import { MODELS as seedreamMODELS } from './seedream.ts';
import { MODELS as reveMODELS } from './reve.ts';
import { MODELS as grokMODELS } from './grok.ts';
import { MODELS as pikaMODELS } from './pika.ts';
import { MODELS as veoMODELS } from './veo.ts';
import { MODELS as runwayMODELS } from './runway.ts';
import { MODELS as fluxMODELS } from './flux.ts';
import { MODELS as geminiMODELS } from './gemini.ts';
import { MODELS as openaiMODELS } from './openai.ts';
import { MODELS as elevenlabsMODELS } from './elevenlabs.ts';
import './elevenlabs.payloads.ts'; // registers Music payload builder after model definitions
import { MODELS as heygenMODELS } from './heygen.ts';
import { MODELS as minimaxMODELS } from './minimax.ts';
import { MODELS as ideogramMODELS } from './ideogram.ts';
import { MODELS as imagenMODELS } from './imagen.ts';
import './imagen.payloads.ts'; // registers payload builders after model definitions
import { MODELS as qwenMODELS } from './qwen.ts';
import { MODELS as recraftMODELS } from './recraft.ts';
import { MODELS as topazMODELS } from './topaz.ts';
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
  ...imagenMODELS,
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

export const getModelsByMode = (mode: ModelDefinition['mode'], includeDisabled = false): ModelDefinition[] =>
  ALL_MODELS.filter((m) => m.mode === mode && (includeDisabled || (!m.disabled && !m.deprecated)));

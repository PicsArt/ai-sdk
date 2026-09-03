/* AUTO-GENERATED FILE. DO NOT EDIT. */

/**
 * Typed Models constants and namespace.
 * Regenerate with: npm run build:model-constants
 */
import type { ModelDefinition, GenerationMode } from '../core/types.ts';
import type { ModelParamSchema } from '../core/schema.ts';
import { ALL_MODELS } from '../vendors/catalog/index.ts';
import { validateModelInput } from '../core/contracts.ts';
import { resolveModel } from '../core/resolve.ts';
import { Model } from '../core/descriptors/model-accessor.ts';

// ── Individual model constants ─────────────────────────────────────

/** Async Flash v1.0 — async (audio) */
export const AsyncFlashV1 = 'async-flash-v1' as const;
/** ByteDance OmniHuman — bytedance (video) */
export const BytedanceOmnihumanV15 = 'bytedance-omnihuman-v1.5' as const;
/** ByteDance Video Enhance — bytedance (video) */
export const BytedanceVideoEnhance = 'bytedance-video-enhance' as const;
/** ByteDance Upscaler — bytedance (video) */
/** @deprecated This model is retired (deprecated). */
export const BytedanceVideoUpscaler = 'bytedance-video-upscaler' as const;
/** Captions — captionsai (video) */
export const CaptionsaiVideoCaptions = 'captionsai-video-captions' as const;
/** Claude Haiku 4.5 — anthropic (text) */
export const ClaudeHaiku45 = 'claude-haiku-4-5' as const;
/** Claude Opus 4.8 — anthropic (text) */
export const ClaudeOpus48 = 'claude-opus-4-8' as const;
/** Claude Sonnet 4.6 — anthropic (text) */
export const ClaudeSonnet46 = 'claude-sonnet-4-6' as const;
/** Creatify Aurora HD — creatify (video) */
export const CreatifyAurora = 'creatify-aurora' as const;
/** Eleven Audio Isolation — elevenlabs (audio) */
export const ElevenAudioIsolation = 'eleven-audio-isolation' as const;
/** Eleven Dubbing — elevenlabs (audio) */
export const ElevenDubbing = 'eleven-dubbing' as const;
/** Eleven Multilingual STS v2 — elevenlabs (audio) */
export const ElevenMultilingualStsV2 = 'eleven-multilingual-sts-v2' as const;
/** Eleven Multilingual v2 — elevenlabs (audio) */
export const ElevenMultilingualV2 = 'eleven-multilingual-v2' as const;
/** Eleven STS v2 — elevenlabs (audio) */
export const ElevenStsV2 = 'eleven-sts-v2' as const;
/** Eleven v3 — elevenlabs (audio) */
export const ElevenV3 = 'eleven-v3' as const;
/** Eleven Voice Previews — elevenlabs (audio) */
export const ElevenVoiceCreate = 'eleven-voice-create' as const;
/** Eleven Voice Design Multilingual v2 — elevenlabs (audio) */
export const ElevenVoiceDesignV2 = 'eleven-voice-design-v2' as const;
/** Eleven Voice Design v3 — elevenlabs (audio) */
export const ElevenVoiceDesignV3 = 'eleven-voice-design-v3' as const;
/** Eleven Voice Remix — elevenlabs (audio) */
/** @deprecated This model is currently unavailable (disabled). */
export const ElevenVoiceRemix = 'eleven-voice-remix' as const;
/** ElevenLabs Music v2 — elevenlabs (audio) */
export const ElevenlabsMusicV2 = 'elevenlabs-music-v2' as const;
/** ElevenLabs SFX v2 — elevenlabs (audio) */
export const ElevenlabsSfx = 'elevenlabs-sfx' as const;
/** Flux 2 Flex — flux (image) */
export const Flux2Flex = 'flux-2-flex' as const;
/** Flux 2 Max — flux (image) */
export const Flux2Max = 'flux-2-max' as const;
/** Flux 2 Pro — flux (image) */
export const Flux2Pro = 'flux-2-pro' as const;
/** Flux 3 Video — flux (video) */
export const Flux3Video = 'flux-3-video' as const;
/** Flux Kontext Max — flux (image) */
export const FluxKontextMax = 'flux-kontext-max' as const;
/** Flux Kontext Pro — flux (image) */
export const FluxKontextPro = 'flux-kontext-pro' as const;
/** Flux Video Upscale — flux (video) */
export const FluxVideoUpscale = 'flux-video-upscale' as const;
/** Nano Banana — google (image) */
export const Gemini25FlashImage = 'gemini-2.5-flash-image' as const;
/** Gemini 2.5 Flash TTS — google (audio) */
export const Gemini25FlashTts = 'gemini-2.5-flash-tts' as const;
/** Gemini 2.5 Pro TTS — google (audio) */
export const Gemini25ProTts = 'gemini-2.5-pro-tts' as const;
/** Gemini 3 Pro — google (text) */
export const Gemini3Pro = 'gemini-3-pro' as const;
/** Nano Banana Pro — google (image) */
export const Gemini3ProImage = 'gemini-3-pro-image' as const;
/** Nano Banana 2 — google (image) */
export const Gemini31FlashImage = 'gemini-3.1-flash-image' as const;
/** Nano Banana 2 Lite — google (image) */
export const Gemini31FlashLiteImage = 'gemini-3.1-flash-lite-image' as const;
/** Gemini 3.5 Flash Lite — google (text) */
export const Gemini35FlashLite = 'gemini-3.5-flash-lite' as const;
/** Gemini 3.6 Flash — google (text) */
export const Gemini36Flash = 'gemini-3.6-flash' as const;
/** Gemini 3.7 Flash — google (text) */
export const Gemini37Flash = 'gemini-3.7-flash' as const;
/** Gemini Omni 1.1 Flash — google (video) */
export const GeminiOmni11FlashPreview = 'gemini-omni-1.1-flash-preview' as const;
/** Gemini Omni — google (video) */
export const GeminiOmniFlashPreview = 'gemini-omni-flash-preview' as const;
/** GPT-5.5 — openai (text) */
export const Gpt55 = 'gpt-5.5' as const;
/** GPT Image 1 — openai (image) */
/** @deprecated This model is retired (deprecated). */
export const GptImage1 = 'gpt-image-1' as const;
/** GPT Image 1.5 — openai (image) */
export const GptImage15 = 'gpt-image-1.5' as const;
/** GPT Image 2 — openai (image) */
export const GptImage2 = 'gpt-image-2' as const;
/** Grok Edit Video — grok (video) */
export const GrokEditVideo = 'grok-edit-video' as const;
/** Grok Extend Video — grok (video) */
export const GrokExtendVideo = 'grok-extend-video' as const;
/** Grok Imagine — grok (image) */
export const GrokImagineImage = 'grok-imagine-image' as const;
/** Grok Imagine 2.0 — grok (image) */
export const GrokImagineImage20 = 'grok-imagine-image-2.0' as const;
/** Grok Imagine Quality — grok (image) */
export const GrokImagineImageQuality = 'grok-imagine-image-quality' as const;
/** Grok Imagine 1.0 — grok (video) */
export const GrokImagineVideo = 'grok-imagine-video' as const;
/** Grok Imagine 1.5 — grok (video) */
export const GrokImagineVideo15 = 'grok-imagine-video-1.5' as const;
/** Grok TTS — grok (audio) */
export const GrokTts = 'grok-tts' as const;
/** Hailuo 2.3 — minimax (video) */
export const Hailuo23 = 'hailuo-2.3' as const;
/** Hailuo 2.3 Fast — minimax (video) */
export const Hailuo23Fast = 'hailuo-2.3-fast' as const;
/** Hailuo 2.3 Fast Pro — minimax (video) */
export const Hailuo23FastPro = 'hailuo-2.3-fast-pro' as const;
/** Hailuo 2.3 Pro — minimax (video) */
export const Hailuo23Pro = 'hailuo-2.3-pro' as const;
/** Happy Horse 1.0 Ref-to-Video — happyhorse (video) */
export const Happyhorse10R2v = 'happyhorse-1.0-r2v' as const;
/** Happy Horse 1.0 — happyhorse (video) */
export const Happyhorse10T2v = 'happyhorse-1.0-t2v' as const;
/** Happy Horse 1.0 Video Edit — happyhorse (video) */
export const Happyhorse10VideoEdit = 'happyhorse-1.0-video-edit' as const;
/** Happy Horse 1.1 Ref-to-Video — happyhorse (video) */
export const Happyhorse11R2v = 'happyhorse-1.1-r2v' as const;
/** Happy Horse 1.1 — happyhorse (video) */
export const Happyhorse11T2v = 'happyhorse-1.1-t2v' as const;
/** HeyGen Talking Photo — heygen (video) */
export const HeygenTalkingPhoto = 'heygen-talking-photo' as const;
/** HeyGen Video Avatar — heygen (video) */
export const HeygenVideoAvatar = 'heygen-video-avatar' as const;
/** Hunyuan V3 — hunyuan (image) */
export const HunyuanV3 = 'hunyuan-v3' as const;
/** Ideogram Character — ideogram (image) */
export const IdeogramCharacter = 'ideogram-character' as const;
/** Ideogram P-Image — ideogram (image) */
export const IdeogramPImage = 'ideogram-p-image' as const;
/** Ideogram v3 — ideogram (image) */
export const IdeogramV3 = 'ideogram-v3' as const;
/** Ideogram 4.0 — ideogram (image) */
export const IdeogramV4 = 'ideogram-v4' as const;
/** Kling 3.0 Image — kling (image) */
export const Kling30Image = 'kling-3.0-image' as const;
/** Kling Avatar — kling (video) */
export const KlingAvatar = 'kling-avatar' as const;
/** Kling Elements — kling (image) */
/** @deprecated This model is currently unavailable (disabled). */
export const KlingElements = 'kling-elements' as const;
/** Kling Motion Control 2.6 — kling (video) */
export const KlingMotionControl = 'kling-motion-control' as const;
/** Kling Motion Control V3 — kling (video) */
export const KlingMotionControlV3 = 'kling-motion-control-v3' as const;
/** Kling Multi-Image V2.1 — kling (image) */
/** @deprecated This model is retired (deprecated). */
export const KlingMultiImageV21 = 'kling-multi-image-v2-1' as const;
/** Kling O1 Image — kling (image) */
export const KlingO1Image = 'kling-o1-image' as const;
/** Kling T2A — kling (audio) */
export const KlingT2a = 'kling-t2a' as const;
/** Kling V2.1 Image — kling (image) */
/** @deprecated This model is retired (deprecated). */
export const KlingV21Image = 'kling-v2-1-image' as const;
/** Kling V2.6 — kling (video) */
export const KlingV26 = 'kling-v2-6' as const;
/** Kling V2A — kling (audio) */
export const KlingV2a = 'kling-v2a' as const;
/** Kling V3 — kling (video) */
export const KlingV3 = 'kling-v3' as const;
/** Kling V3 Omni — kling (video) */
export const KlingV3Omni = 'kling-v3-omni' as const;
/** Kling V3 Turbo — kling (video) */
export const KlingV3Turbo = 'kling-v3-turbo' as const;
/** Kling Video Effects — kling (video) */
export const KlingVideoEffects = 'kling-video-effects' as const;
/** Kling Video O1 — kling (video) */
export const KlingVideoO1 = 'kling-video-o1' as const;
/** LTX 2.3 Audio-to-Video — ltx (video) */
export const Ltx23A2v = 'ltx-2.3-a2v' as const;
/** LTX Pro — ltx (video) */
/** @deprecated This model is retired (deprecated). */
export const LtxProT2v = 'ltx-pro-t2v' as const;
/** LTX Fast — ltx (video) */
/** @deprecated This model is retired (deprecated). */
export const LtxV2Fast = 'ltx-v2-fast' as const;
/** LTX Retake — ltx (video) */
/** @deprecated This model is retired (deprecated). */
export const LtxV2Retake = 'ltx-v2-retake' as const;
/** LTX 2.3 Extend — ltx (video) */
export const LtxV23Extend = 'ltx-v2.3-extend' as const;
/** LTX 2.3 Fast — ltx (video) */
export const LtxV23Fast = 'ltx-v2.3-fast' as const;
/** LTX 2.3 Pro — ltx (video) */
export const LtxV23Pro = 'ltx-v2.3-pro' as const;
/** LTX 2.3 Retake — ltx (video) */
export const LtxV23Retake = 'ltx-v2.3-retake' as const;
/** Luma Ray 2 — luma (video) */
export const LumaRay2 = 'luma-ray-2' as const;
/** Luma Ray 2 Reframe — luma (video) */
export const LumaRay2ReframeVideo = 'luma-ray-2-reframe-video' as const;
/** Luma Ray 3.2 — luma (video) */
export const LumaRay32 = 'luma-ray-3.2' as const;
/** Luma Ray 3.2 Edit — luma (video) */
export const LumaRay32Edit = 'luma-ray-3.2-edit' as const;
/** Luma Ray 3.2 Reframe — luma (video) */
export const LumaRay32ReframeVideo = 'luma-ray-3.2-reframe-video' as const;
/** Luma Flash 2 — luma (video) */
export const LumaRayFlash2 = 'luma-ray-flash-2' as const;
/** Luma Flash 2 Reframe — luma (video) */
export const LumaRayFlash2ReframeVideo = 'luma-ray-flash-2-reframe-video' as const;
/** Luma UNI-1 — luma (image) */
export const LumaUni1 = 'luma-uni-1' as const;
/** Luma UNI-1 Max — luma (image) */
export const LumaUni1Max = 'luma-uni-1-max' as const;
/** Lyria 3 Clip — google (audio) */
export const Lyria3Clip = 'lyria-3-clip' as const;
/** Lyria 3 Pro — google (audio) */
export const Lyria3Pro = 'lyria-3-pro' as const;
/** MiniMax 02 HD — minimax (audio) */
/** @deprecated This model is currently unavailable (disabled). */
export const Minimax02Hd = 'minimax-02-hd' as const;
/** MiniMax H3 — minimax (video) */
export const MinimaxH3 = 'minimax-h3' as const;
/** MiniMax H3 Max — minimax (video) */
export const MinimaxH3Max = 'minimax-h3-max' as const;
/** MiniMax H3 Max Ref-to-Video — minimax (video) */
export const MinimaxH3MaxR2v = 'minimax-h3-max-r2v' as const;
/** MiniMax H3 Max Turbo — minimax (video) */
export const MinimaxH3MaxTurbo = 'minimax-h3-max-turbo' as const;
/** MiniMax Music v2 — minimax (audio) */
export const MinimaxMusicV2 = 'minimax-music-v2' as const;
/** MiniMax Music v3 — minimax (audio) */
export const MinimaxMusicV3 = 'minimax-music-v3' as const;
/** Muse Image 1.0 — meta (image) */
export const MuseImage10 = 'muse-image-1.0' as const;
/** OVI — ovi (video) */
export const Ovi = 'ovi' as const;
/** Picsart Change Background — picsart (image) */
export const PicsartChangeBg = 'picsart-change-bg' as const;
/** Enhance — picsart (image) */
export const PicsartEnhance = 'picsart-enhance' as const;
/** Picsart Effects — picsart (image) */
export const PicsartFlow = 'picsart-flow' as const;
/** Picsart Effects Video — picsart (video) */
export const PicsartFlowVideo = 'picsart-flow-video' as const;
/** Flux 2 Klein 4B — picsart (image) */
export const PicsartFlux2Klein = 'picsart-flux-2-klein' as const;
/** Picsart HiDream T2I — picsart (image) */
export const PicsartHidreamT2i = 'picsart-hidream-t2i' as const;
/** Picsart Image Edit — picsart (image) */
export const PicsartQwenImageEdit = 'picsart-qwen-image-edit' as const;
/** Picsart Angle Change — picsart (image) */
export const PicsartQwenImageEditAngle = 'picsart-qwen-image-edit-angle' as const;
/** Picsart Makeup — picsart (image) */
export const PicsartQwenMakeup = 'picsart-qwen-makeup' as const;
/** Picsart SANA-Sprint — picsart (image) */
export const PicsartSanaSprintV1 = 'picsart-sana-sprint-v1' as const;
/** Remove Background — picsart (image) */
export const PicsartSodV82 = 'picsart-sod-v8-2' as const;
/** Videography — videography (video) */
export const PicsartVideography = 'picsart-videography' as const;
/** Pika — pika (video) */
/** @deprecated This model is retired (deprecated). */
export const Pika22 = 'pika-2.2' as const;
/** Pika Frames — pika (video) */
/** @deprecated This model is retired (deprecated). */
export const Pika22Frames = 'pika-2.2-frames' as const;
/** Pika Scenes — pika (video) */
/** @deprecated This model is retired (deprecated). */
export const Pika22Scenes = 'pika-2.2-scenes' as const;
/** PixVerse C1 — pixverse (video) */
export const PixverseC1 = 'pixverse-c1' as const;
/** PixVerse C1 Fusion — pixverse (video) */
export const PixverseC1Fusion = 'pixverse-c1-fusion' as const;
/** PixVerse C1 Image — pixverse (video) */
export const PixverseC1Image = 'pixverse-c1-image' as const;
/** PixVerse V6 — pixverse (video) */
export const PixverseV6 = 'pixverse-v6' as const;
/** PixVerse V6 Fusion — pixverse (video) */
export const PixverseV6Fusion = 'pixverse-v6-fusion' as const;
/** PixVerse V6 Image — pixverse (video) */
export const PixverseV6Image = 'pixverse-v6-image' as const;
/** Qwen — qwen (image) */
/** @deprecated This model is retired (deprecated). */
export const Qwen = 'qwen' as const;
/** Qwen 2 — qwen (image) */
/** @deprecated This model is retired (deprecated). */
export const QwenImage2 = 'qwen-image-2' as const;
/** Qwen 2 Pro — qwen (image) */
export const QwenImage2Pro = 'qwen-image-2-pro' as const;
/** Qwen 3.0 — qwen (image) */
export const QwenImage30 = 'qwen-image-3.0' as const;
/** Qwen 3.0 Pro — qwen (image) */
export const QwenImage30Pro = 'qwen-image-3.0-pro' as const;
/** Recraft Creative Upscale — recraft (image) */
export const RecraftCreativeUpscale = 'recraft-creative-upscale' as const;
/** Recraft Crisp Upscale — recraft (image) */
export const RecraftCrispUpscale = 'recraft-crisp-upscale' as const;
/** Recraft Explore — recraft (image) */
export const RecraftExplore = 'recraft-explore' as const;
/** Recraft Explore Similar — recraft (image) */
export const RecraftExploreSimilar = 'recraft-explore-similar' as const;
/** Recraft Vectorize — recraft (image) */
export const RecraftVectorize = 'recraft-vectorize' as const;
/** Recraft 20B — recraft (image) */
/** @deprecated This model is retired (deprecated). */
export const Recraftv2 = 'recraftv2' as const;
/** Recraft 20B Vector — recraft (image) */
/** @deprecated This model is retired (deprecated). */
export const Recraftv2Vector = 'recraftv2_vector' as const;
/** Recraft V3 — recraft (image) */
export const Recraftv3 = 'recraftv3' as const;
/** Recraft V3 Vector — recraft (image) */
export const Recraftv3Vector = 'recraftv3_vector' as const;
/** Recraft Replace Background — recraft (image) */
export const Recraftv3ReplaceBg = 'recraftv3-replace-bg' as const;
/** Recraft V4 — recraft (image) */
export const Recraftv4 = 'recraftv4' as const;
/** Recraft V4.1 — recraft (image) */
export const Recraftv41 = 'recraftv4_1' as const;
/** Recraft V4.1 Pro — recraft (image) */
export const Recraftv41Pro = 'recraftv4_1_pro' as const;
/** Recraft V4.1 Pro Vector — recraft (image) */
export const Recraftv41ProVector = 'recraftv4_1_pro_vector' as const;
/** Recraft V4.1 Utility — recraft (image) */
export const Recraftv41Utility = 'recraftv4_1_utility' as const;
/** Recraft V4.1 Utility Pro — recraft (image) */
export const Recraftv41UtilityPro = 'recraftv4_1_utility_pro' as const;
/** Recraft V4.1 Utility Pro Vector — recraft (image) */
export const Recraftv41UtilityProVector = 'recraftv4_1_utility_pro_vector' as const;
/** Recraft V4.1 Utility Vector — recraft (image) */
export const Recraftv41UtilityVector = 'recraftv4_1_utility_vector' as const;
/** Recraft V4.1 Vector — recraft (image) */
export const Recraftv41Vector = 'recraftv4_1_vector' as const;
/** Recraft V4 Pro — recraft (image) */
export const Recraftv4Pro = 'recraftv4_pro' as const;
/** Recraft V4 Pro Vector — recraft (image) */
export const Recraftv4ProVector = 'recraftv4_pro_vector' as const;
/** Recraft V4 Styles — recraft (image) */
export const Recraftv4Styles = 'recraftv4_styles' as const;
/** Recraft V4 Styles Pro — recraft (image) */
export const Recraftv4StylesPro = 'recraftv4_styles_pro' as const;
/** Recraft V4 Styles Pro Vector — recraft (image) */
export const Recraftv4StylesProVector = 'recraftv4_styles_pro_vector' as const;
/** Recraft V4 Styles Vector — recraft (image) */
export const Recraftv4StylesVector = 'recraftv4_styles_vector' as const;
/** Recraft V4 Vector — recraft (image) */
export const Recraftv4Vector = 'recraftv4_vector' as const;
/** Reve — reve (image) */
export const Reve = 'reve' as const;
/** Runway Aleph 2 — runway (video) */
export const RunwayAleph2 = 'runway-aleph2' as const;
/** Runway Avatar — runway (video) */
export const RunwayAvatarVideo = 'runway-avatar-video' as const;
/** Runway Gen-3 Alpha Turbo — runway (video) */
/** @deprecated This model is retired (deprecated). */
export const RunwayGen3aTurbo = 'runway-gen3a-turbo' as const;
/** Runway Aleph — runway (video) */
/** @deprecated This model is retired (deprecated). */
export const RunwayGen4Aleph = 'runway-gen4-aleph' as const;
/** Runway Gen4 Ref — runway (image) */
export const RunwayGen4Ref = 'runway-gen4-ref' as const;
/** Runway Gen 4.5 — runway (video) */
export const RunwayGen45 = 'runway-gen4.5' as const;
/** Seed Audio — seedaudio (audio) */
export const SeedAudio10 = 'seed-audio-1.0' as const;
/** Seed Audio Multilingual — seedaudio (audio) */
export const SeedAudio10Multilingual = 'seed-audio-1.0-multilingual' as const;
/** Seedance 1.5 Pro — seedance (video) */
/** @deprecated This model is retired (deprecated). */
export const Seedance15Pro = 'seedance-1.5-pro' as const;
/** Seedance 2.0 — seedance (video) */
export const Seedance20 = 'seedance-2.0' as const;
/** Seedance 2.0 Fast — seedance (video) */
export const Seedance20Fast = 'seedance-2.0-fast' as const;
/** Seedance 2.0 Fast Video Edit — seedance (video) */
export const Seedance20FastVideoEdit = 'seedance-2.0-fast-video-edit' as const;
/** Seedance 2.0 Fast Video Extend — seedance (video) */
export const Seedance20FastVideoExtend = 'seedance-2.0-fast-video-extend' as const;
/** Seedance 2.0 Mini — seedance (video) */
export const Seedance20Mini = 'seedance-2.0-mini' as const;
/** Seedance 2.0 Mini Video Edit — seedance (video) */
export const Seedance20MiniVideoEdit = 'seedance-2.0-mini-video-edit' as const;
/** Seedance 2.0 Mini Video Extend — seedance (video) */
export const Seedance20MiniVideoExtend = 'seedance-2.0-mini-video-extend' as const;
/** Seedance 2.0 Video Edit — seedance (video) */
export const Seedance20VideoEdit = 'seedance-2.0-video-edit' as const;
/** Seedance 2.0 Video Extend — seedance (video) */
export const Seedance20VideoExtend = 'seedance-2.0-video-extend' as const;
/** Seedance 2.0 Without Moderation — seedance (video) */
export const Seedance20WithoutModeration = 'seedance-2.0-without-moderation' as const;
/** Seedance 2.0 Without Moderation Video Edit — seedance (video) */
export const Seedance20WithoutModerationVideoEdit = 'seedance-2.0-without-moderation-video-edit' as const;
/** Seedance 2.0 Without Moderation Video Extend — seedance (video) */
export const Seedance20WithoutModerationVideoExtend = 'seedance-2.0-without-moderation-video-extend' as const;
/** Seedance 2.5 — seedance (video) */
export const Seedance25 = 'seedance-2.5' as const;
/** Seedance 2.5 Video Edit — seedance (video) */
export const Seedance25VideoEdit = 'seedance-2.5-video-edit' as const;
/** Seedance 2.5 Video Extend — seedance (video) */
export const Seedance25VideoExtend = 'seedance-2.5-video-extend' as const;
/** Seedance I2V — seedance (video) */
/** @deprecated This model is retired (deprecated). */
export const SeedanceI2v = 'seedance-i2v' as const;
/** Seedream 4.0 — seedream (image) */
/** @deprecated This model is retired (deprecated). */
export const Seedream40 = 'seedream-4.0' as const;
/** Seedream 4.5 — seedream (image) */
export const Seedream45 = 'seedream-4.5' as const;
/** Seedream 4.7 — seedream (image) */
export const Seedream47 = 'seedream-4.7' as const;
/** Seedream 5.0 Lite — seedream (image) */
export const Seedream50Lite = 'seedream-5.0-lite' as const;
/** Seedream 5.0 Pro — seedream (image) */
export const Seedream50Pro = 'seedream-5.0-pro' as const;
/** Sora 2 — openai (video) */
export const Sora2 = 'sora-2' as const;
/** Sora 2 Extend — openai (video) */
export const Sora2Extend = 'sora-2-extend' as const;
/** Sora 2 Pro — openai (video) */
export const Sora2Pro = 'sora-2-pro' as const;
/** Topaz Image Upscale — topaz (image) */
export const TopazUpscaleImage = 'topaz-upscale-image' as const;
/** Topaz Video Upscale — topaz (video) */
export const TopazUpscaleVideo = 'topaz-upscale-video' as const;
/** VEED Fabric 1.0 — veed (video) */
export const VeedFabricV1 = 'veed-fabric-v1' as const;
/** VEED Fabric 1.0 Fast — veed (video) */
export const VeedFabricV1Fast = 'veed-fabric-v1-fast' as const;
/** Veo 3.1 — google (video) */
export const Veo31 = 'veo-3.1' as const;
/** Veo 3.1 Fast — google (video) */
export const Veo31Fast = 'veo-3.1-fast' as const;
/** Veo 3.1 Lite — google (video) */
export const Veo31Lite = 'veo-3.1-lite' as const;
/** Wan 2.6 Image — wan (image) */
/** @deprecated This model is retired (deprecated). */
export const Wan26Image = 'wan-2.6-image' as const;
/** Wan 2.6 Ref-to-Video — wan (video) */
/** @deprecated This model is retired (deprecated). */
export const Wan26R2v = 'wan-2.6-r2v' as const;
/** Wan 2.6 — wan (video) */
/** @deprecated This model is retired (deprecated). */
export const Wan26T2v = 'wan-2.6-t2v' as const;
/** Wan 2.7 Image-to-Video — wan (video) */
export const Wan27I2v = 'wan-2.7-i2v' as const;
/** Wan 2.7 Ref-to-Video — wan (video) */
export const Wan27R2v = 'wan-2.7-r2v' as const;
/** Wan 2.7 — wan (video) */
export const Wan27T2v = 'wan-2.7-t2v' as const;
/** Wan 2.7 Video Edit — wan (video) */
export const Wan27VideoEdit = 'wan-2.7-video-edit' as const;
/** Wan 3.0 — wan (video) */
export const Wan30Video = 'wan-3.0-video' as const;
/** Wan 3.0 Prime — wan (video) */
export const Wan30VideoPrime = 'wan-3.0-video-prime' as const;

// ── Validation result ────────────────────────────────────────────

interface ValidationResult { valid: boolean; errors?: string[] }

// ── Models namespace ─────────────────────────────────────────────

interface ModelFilter { mode?: GenerationMode; provider?: string }

export const Models = {
  AsyncFlashV1,
  BytedanceOmnihumanV15,
  BytedanceVideoEnhance,
  BytedanceVideoUpscaler,
  CaptionsaiVideoCaptions,
  ClaudeHaiku45,
  ClaudeOpus48,
  ClaudeSonnet46,
  CreatifyAurora,
  ElevenAudioIsolation,
  ElevenDubbing,
  ElevenMultilingualStsV2,
  ElevenMultilingualV2,
  ElevenStsV2,
  ElevenV3,
  ElevenVoiceCreate,
  ElevenVoiceDesignV2,
  ElevenVoiceDesignV3,
  ElevenVoiceRemix,
  ElevenlabsMusicV2,
  ElevenlabsSfx,
  Flux2Flex,
  Flux2Max,
  Flux2Pro,
  Flux3Video,
  FluxKontextMax,
  FluxKontextPro,
  FluxVideoUpscale,
  Gemini25FlashImage,
  Gemini25FlashTts,
  Gemini25ProTts,
  Gemini3Pro,
  Gemini3ProImage,
  Gemini31FlashImage,
  Gemini31FlashLiteImage,
  Gemini35FlashLite,
  Gemini36Flash,
  Gemini37Flash,
  GeminiOmni11FlashPreview,
  GeminiOmniFlashPreview,
  Gpt55,
  GptImage1,
  GptImage15,
  GptImage2,
  GrokEditVideo,
  GrokExtendVideo,
  GrokImagineImage,
  GrokImagineImage20,
  GrokImagineImageQuality,
  GrokImagineVideo,
  GrokImagineVideo15,
  GrokTts,
  Hailuo23,
  Hailuo23Fast,
  Hailuo23FastPro,
  Hailuo23Pro,
  Happyhorse10R2v,
  Happyhorse10T2v,
  Happyhorse10VideoEdit,
  Happyhorse11R2v,
  Happyhorse11T2v,
  HeygenTalkingPhoto,
  HeygenVideoAvatar,
  HunyuanV3,
  IdeogramCharacter,
  IdeogramPImage,
  IdeogramV3,
  IdeogramV4,
  Kling30Image,
  KlingAvatar,
  KlingElements,
  KlingMotionControl,
  KlingMotionControlV3,
  KlingMultiImageV21,
  KlingO1Image,
  KlingT2a,
  KlingV21Image,
  KlingV26,
  KlingV2a,
  KlingV3,
  KlingV3Omni,
  KlingV3Turbo,
  KlingVideoEffects,
  KlingVideoO1,
  Ltx23A2v,
  LtxProT2v,
  LtxV2Fast,
  LtxV2Retake,
  LtxV23Extend,
  LtxV23Fast,
  LtxV23Pro,
  LtxV23Retake,
  LumaRay2,
  LumaRay2ReframeVideo,
  LumaRay32,
  LumaRay32Edit,
  LumaRay32ReframeVideo,
  LumaRayFlash2,
  LumaRayFlash2ReframeVideo,
  LumaUni1,
  LumaUni1Max,
  Lyria3Clip,
  Lyria3Pro,
  Minimax02Hd,
  MinimaxH3,
  MinimaxH3Max,
  MinimaxH3MaxR2v,
  MinimaxH3MaxTurbo,
  MinimaxMusicV2,
  MinimaxMusicV3,
  MuseImage10,
  Ovi,
  PicsartChangeBg,
  PicsartEnhance,
  PicsartFlow,
  PicsartFlowVideo,
  PicsartFlux2Klein,
  PicsartHidreamT2i,
  PicsartQwenImageEdit,
  PicsartQwenImageEditAngle,
  PicsartQwenMakeup,
  PicsartSanaSprintV1,
  PicsartSodV82,
  PicsartVideography,
  Pika22,
  Pika22Frames,
  Pika22Scenes,
  PixverseC1,
  PixverseC1Fusion,
  PixverseC1Image,
  PixverseV6,
  PixverseV6Fusion,
  PixverseV6Image,
  Qwen,
  QwenImage2,
  QwenImage2Pro,
  QwenImage30,
  QwenImage30Pro,
  RecraftCreativeUpscale,
  RecraftCrispUpscale,
  RecraftExplore,
  RecraftExploreSimilar,
  RecraftVectorize,
  Recraftv2,
  Recraftv2Vector,
  Recraftv3,
  Recraftv3Vector,
  Recraftv3ReplaceBg,
  Recraftv4,
  Recraftv41,
  Recraftv41Pro,
  Recraftv41ProVector,
  Recraftv41Utility,
  Recraftv41UtilityPro,
  Recraftv41UtilityProVector,
  Recraftv41UtilityVector,
  Recraftv41Vector,
  Recraftv4Pro,
  Recraftv4ProVector,
  Recraftv4Styles,
  Recraftv4StylesPro,
  Recraftv4StylesProVector,
  Recraftv4StylesVector,
  Recraftv4Vector,
  Reve,
  RunwayAleph2,
  RunwayAvatarVideo,
  RunwayGen3aTurbo,
  RunwayGen4Aleph,
  RunwayGen4Ref,
  RunwayGen45,
  SeedAudio10,
  SeedAudio10Multilingual,
  Seedance15Pro,
  Seedance20,
  Seedance20Fast,
  Seedance20FastVideoEdit,
  Seedance20FastVideoExtend,
  Seedance20Mini,
  Seedance20MiniVideoEdit,
  Seedance20MiniVideoExtend,
  Seedance20VideoEdit,
  Seedance20VideoExtend,
  Seedance20WithoutModeration,
  Seedance20WithoutModerationVideoEdit,
  Seedance20WithoutModerationVideoExtend,
  Seedance25,
  Seedance25VideoEdit,
  Seedance25VideoExtend,
  SeedanceI2v,
  Seedream40,
  Seedream45,
  Seedream47,
  Seedream50Lite,
  Seedream50Pro,
  Sora2,
  Sora2Extend,
  Sora2Pro,
  TopazUpscaleImage,
  TopazUpscaleVideo,
  VeedFabricV1,
  VeedFabricV1Fast,
  Veo31,
  Veo31Fast,
  Veo31Lite,
  Wan26Image,
  Wan26R2v,
  Wan26T2v,
  Wan27I2v,
  Wan27R2v,
  Wan27T2v,
  Wan27VideoEdit,
  Wan30Video,
  Wan30VideoPrime,

  /** @deprecated Use the `catalog` accessor (`catalog.all()` / `catalog.find({ output, provider })`) instead. */
  list(filter?: ModelFilter): ModelDefinition[] {
    if (!filter) return [...ALL_MODELS];
    return ALL_MODELS.filter(m => {
      if (filter.mode && m.mode !== filter.mode) return false;
      if (filter.provider && m.provider !== filter.provider) return false;
      return true;
    });
  },

  /** @deprecated Use `Model(id).validate(input)` instead. */
  validate(model: string, input: unknown): ValidationResult {
    try {
      validateModelInput(resolveModel(model), input);
      return { valid: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { valid: false, errors: [message] };
    }
  },

  /** @deprecated Use `Model(id).params().toSchema()` instead. */
  toSchema(id: string): ModelParamSchema {
    return Model(id).params().toSchema();
  },

  /** @deprecated Use `Model(id).params().file(key)` instead. */
  getFileParam(id: string, key: string): { required: boolean; max: number; label?: string; accept?: string } | null {
    const f = Model(id).params().file(key);
    if (!f) return null;
    return { required: f.required ?? false, max: f.array?.max ?? 1, label: f.label, accept: f.accept };
  },

  /** @deprecated Use `Model(id).params().hasParam(key)` instead. */
  hasParam(id: string, key: string): boolean {
    return Model(id).params().hasParam(key);
  },
} as const;

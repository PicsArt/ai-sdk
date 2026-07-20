import type { ModelInputById, NoExtraKeys } from '../../src/generated/model-input-types.ts';
import type { AiClient } from '../../src/client/types.ts';
import { Models } from '../../src/generated/model-constants.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const accept = <T>(_value: T): void => {};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const acceptExact = <Shape, T extends Shape>(_value: NoExtraKeys<Shape, T>): void => {};

type KlingInput = ModelInputById['kling-v3'];
accept<KlingInput>({
  prompt: 'Cinematic city scene',
  aspectRatio: '16:9',
  duration: 5,
  renderingSpeed: 'pro',
});

accept<KlingInput>({
  prompt: 'Cinematic city scene',
  // @ts-expect-error invalid aspect ratio for kling-v3
  aspectRatio: '21:9',
});

accept<KlingInput>({
  prompt: 'Cinematic city scene',
  // @ts-expect-error invalid duration for kling-v3 (valid range is 3–15)
  duration: 20,
});

type PicsartChangeBgInput = ModelInputById['picsart-change-bg'];
accept<PicsartChangeBgInput>({
  prompt: 'Replace background',
  imageUrls: ['https://example.com/source.png'],
});

// @ts-expect-error imageUrls are required for picsart-change-bg
accept<PicsartChangeBgInput>({
  prompt: 'Replace background',
});

type ElevenStsInput = ModelInputById['eleven-sts-v2'];
accept<ElevenStsInput>({
  audioUrl: 'https://example.com/voice.mp3',
});

// @ts-expect-error required audio input missing for eleven-sts-v2
accept<ElevenStsInput>({});

acceptExact<KlingInput, KlingInput>({
  prompt: 'Cinematic city scene',
  aspectRatio: '1:1',
  duration: 10,
  renderingSpeed: 'std',
});

acceptExact<KlingInput, KlingInput & { unsupportedParam: number }>({
  prompt: 'Cinematic city scene',
  aspectRatio: '1:1',
  duration: 10,
  // @ts-expect-error extra key is not allowed by NoExtraKeys
  unsupportedParam: 42,
});

// ── AiClient type-safe generate overloads ───────────────────────────

declare const ai: AiClient;

// ✓ Type-safe via string literal
ai.generate('kling-v3', { prompt: 'test', duration: 5 });

// @ts-expect-error — duration 20 is invalid for kling-v3 (valid range is 3–15)
ai.generate('kling-v3', { prompt: 'test', duration: 20 });

// ✓ Type-safe via Models constant (typed string literal)
ai.generate(Models.Flux2Pro, { prompt: 'test', aspectRatio: '1:1' });

// @ts-expect-error — invalid aspect ratio for flux-2-pro
ai.generate(Models.Flux2Pro, { prompt: 'test', aspectRatio: '21:9' });

// ✓ getCredits and submit also type-safe
ai.getCredits('flux-2-pro', { prompt: 'test', count: 2 });

// @ts-expect-error — count 3 is invalid for flux-2-pro
ai.getCredits('flux-2-pro', { prompt: 'test', count: 3 });

ai.submit(Models.KlingV3, { prompt: 'test', duration: 5 });

// @ts-expect-error — duration 20 is invalid for kling-v3 (valid range is 3–15)
ai.submit(Models.KlingV3, { prompt: 'test', duration: 20 });

/**
 * Default voice ids for the catalog-bound TTS params. The voice LISTS are not
 * bundled: options come from the platform catalog tasks at runtime
 * (`ai.catalogs.voices`) — the workers cache them and answer fast.
 */
import type { VoiceOption } from './types.ts';
import { getHydratedVoices } from './catalogs.ts';

export const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // ElevenLabs "George"
export const GEMINI_DEFAULT_VOICE_ID = 'Kore';
export const DEFAULT_GROK_VOICE_ID = 'eve';
export const ASYNC_DEFAULT_VOICE_ID = 'cca0e076-b350-4966-b570-4c2fca50b525'; // "Jennie"
export const SEEDAUDIO_DEFAULT_VOICE_ID = 'en_male_tim_uranus_bigtts';

export function getVoiceById(id: string): VoiceOption | undefined;
/** @deprecated Load the model's catalog instead (`ai.catalogs.voices(modelId)`) — loaded voices are searched automatically. */
export function getVoiceById(id: string, extra: VoiceOption[] | undefined): VoiceOption | undefined;
export function getVoiceById(id: string, extra?: VoiceOption[]): VoiceOption | undefined {
  return [...(extra ?? []), ...getHydratedVoices()].find((v) => v.id === id);
}

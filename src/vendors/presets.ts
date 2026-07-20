import { p } from '../core/descriptors/presets.ts';
import type { ModelParams } from '../core/descriptors/types.ts';

export interface VideoStartEndOptions {
  aspectRatios?: string[];
  durations?: number[];
  defaultDuration?: number;
  includeNegativePrompt?: boolean;
  includeGenerateAudio?: boolean;
  includeEndFrame?: boolean;
}

/**
 * Shared T2V/I2V param composition used by multiple video vendors.
 * Keeps repeated spread patterns centralized and type-checked.
 */
export const videoStartEndWithAudio = ({
  aspectRatios = ['16:9', '9:16', '1:1'],
  durations = [5, 10],
  defaultDuration,
  includeNegativePrompt = true,
  includeGenerateAudio = true,
  includeEndFrame = true,
}: VideoStartEndOptions = {}): ModelParams => ({
  ...p.aspectRatio(aspectRatios),
  ...p.duration(durations, defaultDuration),
  ...p.file('startFrame', 'image', { label: 'Start Frame', required: false }),
  ...(includeEndFrame ? p.file('endFrame', 'image', { label: 'End Frame' }) : {}),
  ...(includeNegativePrompt ? p.negativePrompt() : {}),
  ...(includeGenerateAudio ? p.generateAudio() : {}),
});

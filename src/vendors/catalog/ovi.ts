/**
 * OVI — single source of truth.
 */
import type { PayloadBuilder } from '../../core/types.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts'; // p imported directly for presets not exposed via params.*

// Map user-friendly aspect ratios → API pixel resolutions.
const OVI_RESOLUTION_MAP: Record<string, string> = {
  '9:16': '512x992', '16:9': '992x512',
  '1:1': '720x720',
  '9:16+': '512x960', '16:9+': '960x512',
  '2:5': '448x1120', '5:2': '1120x448',
};

/** T2V + I2V (unified). image_url + resolution added when present. */
export const buildOviPayload: PayloadBuilder = (ctx) => ({
  prompt: ctx.prompt,
  ...(ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0] } : {}),
  ...(ctx.size ? { resolution: OVI_RESOLUTION_MAP[ctx.size] ?? ctx.size } : {}),
});

export const { MODELS } = defineModels('ovi', [
  {
    id: 'ovi', name: 'OVI',
    addedAt: '2026-02-06',
    workflow: 'ovi', editWorkflow: 'ovi/image-to-video',
    buildPayload: buildOviPayload,
    estimatedTime: 251, editEstimatedTime: 286,
    mode: 'video', inputType: 't2v',
    description: 'Straightforward text/image-to-video at 720p with broad style coverage.',
    features: [feat('Image Input', 'input'), feat('720p', 'resolution')],
    paramConfig: {
      ...params.prompt(),
      ...p.size(['9:16', '16:9', '1:1', '9:16+', '16:9+', '2:5', '5:2'], '16:9'),
      ...params.imageInput(),
    },
  },
]);

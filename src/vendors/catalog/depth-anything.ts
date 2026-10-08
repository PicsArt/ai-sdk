/**
 * Depth Anything — 1 model (video depth estimation).
 * https://github.com/DepthAnything/Video-Depth-Anything
 *
 * A source clip in, a depth-map video out (same length). Builder lives in the
 * sibling `depth-anything.payloads.ts` (typed against
 * `WorkflowTypes['depth-anything-video']`).
 */
import { p } from '../../core/descriptors/presets.ts';
import { defineModels, feat, params } from '../define.ts';

export const { MODELS } = defineModels('depth-anything', [
  {
    // Billed per second of the source clip at one flat rate, so none of the
    // knobs below changes the price. `max_frames` / `output_fps` are left to
    // the vendor defaults on purpose: a frame cap would shorten the processed
    // clip while billing still counts the whole source.
    id: 'depth-anything-video', name: 'Video Depth Anything',
    modelId: 'fal-ai-depth-anything-video',
    addedAt: '2026-10-08',
    workflow: 'depth-anything-video',
    estimatedTime: 60,
    mode: 'video', inputType: 'v2v',
    description: 'Estimate temporally consistent depth for every frame of a video and render it as a depth-map video — grayscale or a color map, optionally side by side with the source.',
    features: [
      feat('Depth Map', 'characteristic'), feat('Video Input', 'input'),
      feat('1080p', 'resolution'),
    ],
    paramConfig: {
      ...params.videoInput('Source Video', 'asset', true),
      // Small is fastest, Large is the most accurate.
      ...p.enum('model', ['VDA-Small', 'VDA-Base', 'VDA-Large'], 'VDA-Large', { label: 'Model Size' }),
      ...p.enum('colormap', ['grayscale', 'turbo', 'inferno', 'magma', 'viridis'], 'grayscale', { label: 'Color Map' }),
      // 'auto' keeps the source resolution, capped at 1080p.
      ...params.resolution(['auto', '360p', '480p', '720p', '1080p'], 'auto'),
      ...p.boolean('sideBySide', false, 'Side by Side'),
    },
  },
]);

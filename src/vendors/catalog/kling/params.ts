/**
 * Kling-specific paramConfig fragments.
 *
 * Previously exposed as preset helpers in core/descriptors/presets.ts even
 * though only Kling models used them. Moved here so vendor-specific shapes
 * live next to the vendor catalog file. Each export is a pre-built
 * ModelParams fragment — spread directly into a model's paramConfig.
 */
import type { ModelParams } from '../../../core/descriptors';

/** Face-similarity strength — Kling V2.1 image generations. */
export const klingHumanFidelity: ModelParams = {
  humanFidelity: {
    label: 'Face Fidelity',
    descriptor: { kind: 'range', min: 0, max: 1, step: 0.05, default: 0.45 },
  },
};

/** Character orientation — Kling Motion Control. 'image' caps ref video at 10s,
 *  'video' caps at 30s. */
export const klingCharacterOrientation: ModelParams = {
  characterOrientation: {
    label: 'Character Orientation',
    descriptor: {
      kind: 'enum',
      valueType: 'string',
      options: [
        { id: 'image', label: 'Match Image (≤10s ref video)' },
        { id: 'video', label: 'Match Video (≤30s ref video)' },
      ],
      default: 'video',
    },
  },
};

/** Keep original audio toggle — Kling Motion Control / Omni video_list. */
export const klingKeepOriginalSound: ModelParams = {
  keepOriginalSound: {
    label: 'Keep Original Sound',
    descriptor: {
      kind: 'enum',
      valueType: 'string',
      options: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }],
      default: 'yes',
    },
  },
};

/** Reference-video mode — Kling Omni `video_list[0].refer_type`.
 *  'feature' uses the clip as a style/character reference; 'base' edits the
 *  clip itself (output duration follows the input, so `duration` is dropped). */
export const klingOmniReferType: ModelParams = {
  referType: {
    label: 'Reference Video Mode',
    descriptor: {
      kind: 'enum',
      valueType: 'string',
      options: [
        { id: 'feature', label: 'Feature Reference' },
        { id: 'base', label: 'Base Edit' },
      ],
      default: 'feature',
    },
  },
};

/** V3 advanced params (KlingTextToVideoCommand + KlingImageToVideoCommand).
 *  Some are I2V-only (elementList, staticMask) — the builder gates those
 *  on startFrame. */
export const klingV3AdvancedParams: ModelParams = {
  multiShot: {
    label: 'Multi-Shot Mode',
    descriptor: { kind: 'boolean', default: false },
  },
  shotType: {
    label: 'Shot Segmentation',
    descriptor: {
      kind: 'enum',
      valueType: 'string',
      options: [
        { id: 'customize', label: 'Customize' },
        { id: 'intelligence', label: 'AI Auto' },
      ],
      default: 'customize',
    },
  },
  multiPrompt: {
    label: 'Multi-Shot Prompts',
    descriptor: {
      kind: 'object',
      array: { max: 6 },
      fields: {
        // index/prompt/duration stay required — upstream MultiPromptItem
        // marks all three required. SDK descriptor default for `index` is
        // informational only until upstream relaxes the wire contract.
        index: { kind: 'range', min: 0, max: 5, default: 0 },
        prompt: { kind: 'text', maxLength: 512 },
        duration: { kind: 'text' },
      },
    },
  },
  voiceList: {
    label: 'Voice References',
    descriptor: {
      kind: 'object',
      array: { max: 2 },
      fields: {
        voice_id: { kind: 'text' },
      },
    },
  },
  elementList: {
    label: 'Element References',
    descriptor: {
      kind: 'object',
      array: { max: 3 },
      fields: {
        element_id: { kind: 'text' },
      },
    },
  },
  staticMask: {
    label: 'Static Mask',
    category: 'reference',
    descriptor: { kind: 'file', accept: 'image' },
  },
};

/** Omni video advanced params (KlingOmniVideoCommand).
 *  Differences vs V3 T2V/I2V: shotType locked to 'customize' and element_list
 *  is always allowed (not gated on startFrame). The omni media inputs are NOT
 *  here — `image_list` / `video_list` are declared on the model entry as real
 *  file slots (startFrame / endFrame / imageUrls / videoUrl) and assembled by
 *  the payload builder. */
export const klingOmniAdvancedParams: ModelParams = {
  multiShot: {
    label: 'Multi-Shot Mode',
    descriptor: { kind: 'boolean', default: false },
  },
  shotType: {
    label: 'Shot Segmentation',
    descriptor: {
      kind: 'enum',
      valueType: 'string',
      options: [{ id: 'customize', label: 'Customize' }],
      default: 'customize',
    },
  },
  multiPrompt: {
    label: 'Multi-Shot Prompts',
    descriptor: {
      kind: 'object',
      array: { max: 6 },
      fields: {
        // index/prompt/duration stay required — upstream MultiPromptItem
        // marks all three required. SDK descriptor default for `index` is
        // informational only until upstream relaxes the wire contract.
        index: { kind: 'range', min: 0, max: 5, default: 0 },
        prompt: { kind: 'text', maxLength: 512 },
        duration: { kind: 'text' },
      },
    },
  },
  elementList: {
    label: 'Element References',
    descriptor: {
      kind: 'object',
      array: { max: 3 },
      fields: {
        element_id: { kind: 'text' },
      },
    },
  },
};

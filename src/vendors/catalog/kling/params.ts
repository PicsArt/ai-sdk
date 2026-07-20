/**
 * Kling-specific paramConfig fragments.
 *
 * Previously exposed as preset helpers in core/descriptors/presets.ts even
 * though only Kling models used them. Moved here so vendor-specific shapes
 * live next to the vendor catalog file. Each export is a pre-built
 * ModelParams fragment — spread directly into a model's paramConfig.
 */
import type { ModelParams } from '../../../core/descriptors';

/** Kling image_reference toggle (subject vs face) — V1.5 / V2-new generations. */
export const klingImageReference: ModelParams = {
  imageReference: {
    label: 'Reference Mode',
    descriptor: {
      kind: 'enum',
      valueType: 'string',
      options: [
        { id: 'subject', label: 'Subject' },
        { id: 'face', label: 'Face' },
      ],
      default: 'subject',
    },
  },
};

/** Face-similarity strength — Kling V1.5 / V2 image generations. */
export const klingHumanFidelity: ModelParams = {
  humanFidelity: {
    label: 'Face Fidelity',
    descriptor: { kind: 'range', min: 0, max: 1, step: 0.05, default: 0.45 },
  },
};

/** Sound-effect prompt — Kling V2A (≤200 chars). */
export const klingSoundEffectPrompt: ModelParams = {
  soundEffectPrompt: {
    label: 'Sound Effect Prompt',
    descriptor: { kind: 'text', maxLength: 200, placeholder: 'e.g. rain on metal roof' },
  },
};

/** Background-music prompt — Kling V2A (≤200 chars). */
export const klingBgmPrompt: ModelParams = {
  bgmPrompt: {
    label: 'Background Music',
    descriptor: { kind: 'text', maxLength: 200, placeholder: 'e.g. calm piano' },
  },
};

/** ASMR mode — Kling V2A (enhances detailed sound effects). */
export const klingAsmrMode: ModelParams = {
  asmrMode: {
    label: 'ASMR Mode',
    descriptor: { kind: 'boolean', default: false },
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
 *  Differences vs V3 T2V/I2V: image_list / video_list shape, shotType locked
 *  to 'customize', element_list always allowed (not gated on startFrame). */
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
  omniImageList: {
    label: 'Reference Images',
    descriptor: {
      kind: 'object',
      array: { max: 10 },
      fields: {
        image_url: { kind: 'text' },
        type: {
          kind: 'enum',
          required: false,
          valueType: 'string',
          options: [
            { id: 'first_frame', label: 'First Frame' },
            { id: 'end_frame', label: 'End Frame' },
          ],
          default: 'first_frame',
        },
      },
    },
  },
  omniVideoList: {
    label: 'Reference Video',
    descriptor: {
      kind: 'object',
      array: { max: 1 },
      fields: {
        video_url: { kind: 'text' },
        // refer_type / keep_original_sound stay required — upstream
        // ReferenceVideo marks both required. Descriptor defaults are
        // informational only until upstream relaxes the wire contract.
        refer_type: {
          kind: 'enum',
          valueType: 'string',
          options: [
            { id: 'feature', label: 'Feature Reference' },
            { id: 'base', label: 'Base Edit' },
          ],
          default: 'feature',
        },
        keep_original_sound: {
          kind: 'enum',
          valueType: 'string',
          options: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }],
          default: 'yes',
        },
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

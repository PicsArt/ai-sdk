/**
 * Preset factories for common param descriptors.
 *
 * Each returns a ModelParams fragment (single key) designed to be spread:
 *   { ...p.aspectRatio(['16:9', '9:16']), ...p.duration([5, 10]) }
 */

import type { EnumDescriptor, EnumOption, ModelParams } from './types.ts';
import type { CatalogSource } from '../catalogs.ts';

export const p = {
  aspectRatio(
    opts: string[] = ['16:9', '9:16', '1:1'],
    def?: string,
  ): ModelParams {
    return {
      aspectRatio: {
        descriptor: {
          kind: 'enum',
          valueType: 'string',
          options: opts.map((id) => ({ id })),
          default: def ?? opts[0],
        },
      },
    };
  },

  duration(opts: number[], def?: number): ModelParams {
    return {
      duration: {
        descriptor: {
          kind: 'enum',
          valueType: 'number',
          options: opts.map((id) => ({ id })),
          default: def ?? opts[0],
        },
      },
    };
  },

  /** Continuous duration (seconds) — for models whose vendor accepts every
   *  value in a span instead of a fixed option list. Reach for this only when
   *  the span holds more than 10 possible values; 10 or fewer stays an enum
   *  (`duration`), which shows the exact options instead of a slider. */
  durationRange(
    min: number,
    max: number,
    def: number,
    step = 1,
  ): ModelParams {
    return {
      duration: {
        descriptor: { kind: 'range', min, max, step, default: def },
      },
    };
  },

  resolution(opts: string[], def?: string): ModelParams {
    return {
      resolution: {
        descriptor: {
          kind: 'enum',
          valueType: 'string',
          options: opts.map((id) => ({ id })),
          default: def ?? opts[0],
        },
      },
    };
  },

  count(opts: number[] = [1, 2, 4, 6, 8, 10], def?: number): ModelParams {
    return {
      count: {
        descriptor: {
          kind: 'enum',
          valueType: 'number',
          options: opts.map((id) => ({ id })),
          default: def ?? opts[0],
        },
      },
    };
  },

  quality(opts: string[], def?: string): ModelParams {
    return {
      quality: {
        descriptor: {
          kind: 'enum',
          valueType: 'string',
          options: opts.map((id) => ({ id })),
          default: def ?? opts[0],
        },
      },
    };
  },

  size(opts: string[], def?: string): ModelParams {
    return {
      size: {
        descriptor: {
          kind: 'enum',
          valueType: 'string',
          options: opts.map((id) => ({ id })),
          default: def ?? opts[0],
        },
      },
    };
  },

  style(
    opts: Array<{ id: string; label: string }>,
    def?: string,
  ): ModelParams {
    return {
      style: {
        descriptor: {
          kind: 'enum',
          valueType: 'string',
          options: opts,
          default: def ?? opts[0].id,
        },
      },
    };
  },

  renderingSpeed(
    opts: Array<{ id: string; label: string }>,
    def?: string,
  ): ModelParams {
    return {
      renderingSpeed: {
        descriptor: {
          kind: 'enum',
          valueType: 'string',
          options: opts,
          default: def ?? opts[0].id,
        },
      },
    };
  },

  generateAudio(def = true): ModelParams {
    return {
      generateAudio: {
        descriptor: { kind: 'boolean', default: def },
      },
    };
  },

  returnLastFrame(def = false): ModelParams {
    return {
      returnLastFrame: {
        label: 'Capture Last Frame',
        descriptor: { kind: 'boolean', default: def },
      },
    };
  },

  /** HappyHorse video-edit `audio_setting`: 'auto' lets the model decide,
   *  'origin' preserves the source video's audio. Vendor default: 'auto'. */
  audioSetting(opts: Array<'auto' | 'origin'> = ['auto', 'origin'], def: 'auto' | 'origin' = 'auto'): ModelParams {
    return {
      audioSetting: {
        label: 'Audio',
        descriptor: {
          kind: 'enum',
          valueType: 'string',
          options: opts.map((id) => ({ id })),
          default: def,
        },
      },
    };
  },

  enhancePrompt(def = true): ModelParams {
    return {
      enhancePrompt: {
        descriptor: { kind: 'boolean', default: def },
      },
    };
  },

  prompt(opts?: { minLength?: number; maxLength?: number; placeholder?: string; required?: boolean }): ModelParams {
    return {
      prompt: {
        label: 'Prompt',
        required: opts?.required ?? true,
        descriptor: { kind: 'text', minLength: opts?.minLength, maxLength: opts?.maxLength, placeholder: opts?.placeholder },
      },
    };
  },

  negativePrompt(placeholder?: string): ModelParams {
    return {
      negativePrompt: {
        label: 'Negative Prompt',
        descriptor: {
          kind: 'text',
          placeholder: placeholder,
        },
      },
    };
  },

  cfgScale(
    min: number,
    max: number,
    def: number,
    step?: number,
  ): ModelParams {
    return {
      cfgScale: {
        label: 'CFG Scale',
        descriptor: { kind: 'range', min, max, step, default: def },
      },
    };
  },

  imageWeight(
    min: number,
    max: number,
    def: number,
    step?: number,
  ): ModelParams {
    return {
      imageWeight: {
        label: 'Image Weight',
        descriptor: { kind: 'range', min, max, step, default: def },
      },
    };
  },

  // ── Generic factories (take key as first arg) ───────────────────

  file(
    key: string,
    accept: 'image' | 'video' | 'audio' | 'media',
    opts?: {
      label?: string;
      required?: boolean;
      array?: { min?: number; max?: number };
      /** Asset = part of the output, reference = guidance signal. Drives filmstrip UI grouping. */
      category?: 'asset' | 'reference';
      /** Client-side max duration (seconds) for a video/audio slot. */
      maxDurationSec?: number;
      /** Client-side min pixel count (width × height) for an image/video slot. */
      minPixels?: number;
      /** Client-side min short-side length (pixels) for an image/video slot. */
      minSidePixels?: number;
      /** Client-side max short-side length (pixels) for an image/video slot. */
      maxShortSidePixels?: number;
      /** Client-side max file size (bytes) for this slot. */
      maxBytes?: number;
    },
  ): ModelParams {
    return {
      [key]: {
        label: opts?.label,
        required: opts?.required,
        ...(opts?.category ? { category: opts.category } : {}),
        descriptor: {
          kind: 'file',
          accept,
          ...(opts?.array ? { array: opts.array } : {}),
          ...(opts?.maxDurationSec != null ? { maxDurationSec: opts.maxDurationSec } : {}),
          ...(opts?.minPixels != null ? { minPixels: opts.minPixels } : {}),
          ...(opts?.minSidePixels != null ? { minSidePixels: opts.minSidePixels } : {}),
          ...(opts?.maxShortSidePixels != null ? { maxShortSidePixels: opts.maxShortSidePixels } : {}),
          ...(opts?.maxBytes != null ? { maxBytes: opts.maxBytes } : {}),
        },
      },
    };
  },

  boolean(key: string, def: boolean, label?: string): ModelParams {
    return {
      [key]: {
        label,
        descriptor: { kind: 'boolean', default: def },
      },
    };
  },

  /** Generic enum select. Options are bare ids (`['png', 'jpeg']`) or
   *  `{ id, label }` pairs when the UI label differs from the wire value.
   *  `valueType` is inferred from the first option (string vs number). */
  enum<T extends string | number = string>(
    key: string,
    options: Array<T | { id: T; label?: string }>,
    def?: T,
    opts?: { label?: string },
  ): ModelParams {
    const normalized: Array<EnumOption<T>> = options.map((opt) =>
      typeof opt === 'object' ? opt : { id: opt },
    );
    const descriptor: EnumDescriptor<T> = {
      kind: 'enum',
      valueType: typeof normalized[0].id === 'number' ? 'number' : 'string',
      options: normalized,
      default: def ?? normalized[0].id,
    };
    return {
      [key]: {
        label: opts?.label,
        // T resolves to a single string|number at each call site; the cast lets
        // the one generic factory satisfy the EnumDescriptor<string>|<number> union.
        descriptor: descriptor as EnumDescriptor<string> | EnumDescriptor<number>,
      },
    };
  },

  range(
    key: string,
    min: number,
    max: number,
    def: number,
    opts?: { step?: number; label?: string },
  ): ModelParams {
    return {
      [key]: {
        label: opts?.label,
        descriptor: {
          kind: 'range',
          min,
          max,
          step: opts?.step,
          default: def,
        },
      },
    };
  },

  text(
    key: string,
    opts?: { maxLength?: number; placeholder?: string; label?: string; required?: boolean },
  ): ModelParams {
    return {
      [key]: {
        label: opts?.label,
        required: opts?.required,
        descriptor: {
          kind: 'text',
          maxLength: opts?.maxLength,
          placeholder: opts?.placeholder,
        },
      },
    };
  },

  /**
   * Any param whose options are served by a platform catalog task (effect
   * templates, and anything the voiceId/videoId presets don't cover). The
   * value is a free-string id — the live catalog is the source of truth.
   */
  catalog(
    key: string,
    cfg: { source: CatalogSource; default: string; label?: string; required?: boolean },
  ): ModelParams {
    return {
      [key]: {
        label: cfg.label,
        required: cfg.required,
        descriptor: { kind: 'catalog', source: cfg.source, default: cfg.default },
      },
    };
  },

  voiceId(
    options: ReadonlyArray<{ id: string; name?: string }>,
    def: string,
    opts?: { required?: boolean; catalog?: CatalogSource },
  ): ModelParams {
    return {
      voiceId: {
        label: 'Voice',
        required: opts?.required,
        catalogOptions: options,
        // Catalog-bound ids are free strings (the live catalog is the source
        // of truth); only unbound voice lists stay closed enums.
        descriptor: opts?.catalog
          ? { kind: 'catalog', source: opts.catalog, default: def }
          : {
              kind: 'enum',
              valueType: 'string',
              options: options.map((o) => ({ id: o.id, label: o.name ?? o.id })),
              default: def,
            },
      },
    };
  },

  videoId(
    options: Array<{ id: string; name?: string }>,
    def: string,
    opts?: { required?: boolean; catalog?: CatalogSource },
  ): ModelParams {
    return {
      videoId: {
        label: 'Avatar',
        required: opts?.required,
        catalogOptions: options,
        descriptor: opts?.catalog
          ? { kind: 'catalog', source: opts.catalog, default: def }
          : {
              kind: 'enum',
              valueType: 'string',
              options: options.map((o) => ({ id: o.id, label: o.name ?? o.id })),
              default: def,
            },
      },
    };
  },

  language(hasAccent: boolean): ModelParams {
    return {
      language: {
        label: 'Language',
        descriptor: { kind: 'text' },
      },
      ...(hasAccent
        ? {
            accent: {
              label: 'Accent',
              descriptor: { kind: 'text' },
            },
          }
        : {}),
    };
  },
};

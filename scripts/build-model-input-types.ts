#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALL_MODELS } from '@picsart/ai-sdk';

import type { ModelDefinition } from '@picsart/ai-sdk';
import type { EnumDescriptor, FileDescriptor, ObjectDescriptor, ParamDescriptor } from '@picsart/ai-sdk';

const PKG_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_FILE = resolve(PKG_DIR, 'src/generated/model-input-types.ts');

function uniq<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

function stringUnion(values: readonly string[]): string {
  const normalized = uniq(values);
  return normalized.map(v => JSON.stringify(v)).join(' | ');
}

function numberUnion(values: readonly number[]): string {
  const normalized = uniq(values);
  return normalized.map(v => String(v)).join(' | ');
}

/** Recursively derive the TS type string for any ParamDescriptor.
 *
 *  Used both at the top level (per paramConfig entry) and for nested
 *  ObjectDescriptor fields. Returns the base type without the `key?:`
 *  prefix — the caller decides optionality and key syntax.
 *
 *  Nested ObjectDescriptor fields default to required; authors mark a
 *  nested field optional by setting `required: false` on it (the same
 *  EntryMeta mechanism used at the top level). */
function typeFromDescriptor(d: ParamDescriptor): string {
  switch (d.kind) {
    case 'enum': {
      const e = d as EnumDescriptor<string | number>;
      if (e.options.length === 0) return 'never';
      return e.valueType === 'number'
        ? numberUnion(e.options.map(o => o.id as number))
        : stringUnion(e.options.map(o => String(o.id)));
    }
    case 'range':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'text':
      return 'string';
    case 'file': {
      const fd = d as FileDescriptor;
      return fd.array != null ? 'string[]' : 'string';
    }
    case 'object': {
      const od = d as ObjectDescriptor;
      const inner = Object.entries(od.fields)
        .map(([k, fd]) => {
          const req = (fd as { required?: boolean }).required ?? true;
          return `${k}${req ? '' : '?'}: ${typeFromDescriptor(fd)}`;
        })
        .join('; ');
      const objType = `{ ${inner} }`;
      return od.array != null ? `Array<${objType}>` : objType;
    }
  }
}

function buildTypeFields(model: ModelDefinition): string[] {
  const params = model.paramConfig;
  const fields: string[] = [];

  for (const [key, entry] of Object.entries(params)) {
    const d = entry.descriptor;
    const req = entry.required ?? false;
    const opt = req ? '' : '?';

    // Top-level special cases that don't apply to nested descriptors:
    // 1. `language` / `accent` enums are surfaced as plain string (open-ended
    //    user input, not constrained to the option list).
    if (d.kind === 'enum' && (key === 'language' || key === 'accent')) {
      fields.push(`${key}${opt}: string;`);
      continue;
    }
    // 2. Required file array uses a non-empty tuple at the top level so a
    //    missing first entry is a compile error.
    if (d.kind === 'file' && (d as FileDescriptor).array != null && req) {
      fields.push(`${key}${opt}: [string, ...string[]];`);
      continue;
    }
    // 3. Empty enum → the option list is hydrated at runtime from the vendor
    //    catalog, so the value is an open-ended id. Typing it as `string` keeps
    //    the field callable; skipping it made a required param impossible to
    //    pass — `heygen-video-avatar` lost the `videoId` it exists for.
    if (d.kind === 'enum' && (d as EnumDescriptor<string | number>).options.length === 0) {
      fields.push(`${key}${opt}: string;`);
      continue;
    }

    fields.push(`${key}${opt}: ${typeFromDescriptor(d)};`);
  }

  return fields;
}

function buildTypeEntry(model: ModelDefinition): string {
  return `{ ${buildTypeFields(model).join(' ')} }`;
}

function buildFileContent(models: ModelDefinition[]): string {
  const sorted = [...models].sort((a, b) => a.id.localeCompare(b.id));
  const lines: string[] = [
    '/* AUTO-GENERATED FILE. DO NOT EDIT. */',
    '',
    '/**',
    ' * Per-model compile-time input contracts generated from specs/vendors catalog.',
    ' * Regenerate with: npm run build:model-input-types',
    ' */',
    'export type ModelInputById = {',
  ];

  for (const model of sorted) {
    lines.push(`  ${JSON.stringify(model.id)}: ${buildTypeEntry(model)};`);
  }

  lines.push('};');
  lines.push('');
  lines.push('export type TypedModelId = keyof ModelInputById;');
  lines.push('export type ModelInput<M extends TypedModelId> = ModelInputById[M];');
  lines.push('');

  // Text (LLM) models — subset used by generateText().
  const textIds = sorted.filter(m => m.mode === 'text').map(m => m.id);
  lines.push('/** IDs of text-generation (LLM) models — narrows generateText(). */');
  lines.push(`export type TextModelId = ${textIds.length ? stringUnion(textIds) : 'never'};`);
  lines.push('export type TextModelInputById = Pick<ModelInputById, TextModelId>;');
  lines.push('');
  lines.push('/** Ensure caller does not pass keys unsupported by the target model input shape. */');
  lines.push('export type NoExtraKeys<Shape, T extends Shape> = T & Record<Exclude<keyof T, keyof Shape>, never>;');
  lines.push('');
  return lines.join('\n');
}

mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
writeFileSync(OUTPUT_FILE, buildFileContent(ALL_MODELS), 'utf8');
console.log(`Generated ${OUTPUT_FILE}`);

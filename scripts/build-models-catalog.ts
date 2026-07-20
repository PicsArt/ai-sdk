#!/usr/bin/env node
/**
 * Build the public models-catalog JSON snapshot from @picsart/ai-sdk.
 *
 * What this produces:
 *   `packages/ai-sdk/src/generated/catalog.json` — every user-visible model with its
 *   id, provider, description, params, credit range. Committed to git
 *   alongside `model-input-types.ts` / `model-constants.ts`. Ships in the
 *   published `@picsart/ai-sdk` package via the `files: ["src/"]` glob.
 *
 * Why generated-and-committed (not generated at deploy time):
 *   - Diff-able across releases — PRs that change vendor specs show the
 *     resulting catalog change in the same MR.
 *   - Faster CI — the Publish Models Catalog job just uploads a file
 *     instead of running an install + script.
 *   - Ships in the SDK — consumers can `import catalog from
 *     '@picsart/ai-sdk/src/generated/catalog.json' assert { type: 'json' }`
 *     without an HTTP fetch.
 *   - Deterministic — same SDK source produces byte-identical JSON, so
 *     `verify:models-catalog` can fail the pre-commit if regeneration was
 *     skipped (mirrors the `verify:model-input-types` pattern).
 *
 * Filtered out vs. SDK fidelity:
 *   - `disabled` models             — operationally unavailable (backend not
 *     deployed, catalog mismatch, etc.). External integrators would hit the
 *     same failures.
 *   - `deprecated` models           — retired by the vendor or superseded; we
 *     keep the row in the SDK so historical jobs / pricing resolve, but
 *     external integrators should never see retired models in the public catalog.
 *   - `'coming-soon'` badged models — unannounced launches; don't leak.
 *   - `modelId`, `workflow`         — internal wire identifiers; auth-required
 *     to use, free recon for outsiders.
 *
 * Internal services that need the unfiltered catalog should consume the SDK
 * directly (`import { Models, Model } from '@picsart/ai-sdk'`).
 *
 * Usage:
 *   npm run build:models-catalog        # the canonical entry point
 *   tsx scripts/build-models-catalog.ts
 */
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Models,
  Model,
  type ModelDefinition,
  type FlatParamEntry,
} from '@picsart/ai-sdk';

const PKG_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_PATH = resolve(PKG_DIR, 'src/generated/catalog.json');
const PKG_JSON = resolve(PKG_DIR, 'package.json');
const NEW_BADGE_DAYS = 21;

function isNewModel(m: ModelDefinition, now = Date.now()): boolean {
  if (!m.addedAt) return false;
  const t = Date.parse(m.addedAt);
  return Number.isFinite(t) && now - t < NEW_BADGE_DAYS * 86_400_000;
}

function effectiveBadges(m: ModelDefinition): string[] {
  const stored = (m.badge ?? []).filter((b) => b !== 'new');
  return isNewModel(m) ? ['new', ...stored] : stored;
}

function isPubliclyVisible(m: ModelDefinition): boolean {
  if (m.disabled) return false;
  if (m.deprecated) return false;
  if (effectiveBadges(m).includes('coming-soon')) return false;
  return true;
}

function serializeParam(p: FlatParamEntry) {
  const base = {
    key: p.key,
    label: p.label ?? null,
    kind: p.kind,
    required: Boolean(p.required),
    category: p.category ?? null,
    default: 'default' in p ? p.default : null,
  };
  switch (p.kind) {
    case 'enum':
      return { ...base, options: p.options };
    case 'range':
      return { ...base, min: p.min, max: p.max, step: p.step ?? null };
    case 'text':
      return {
        ...base,
        minLength: p.minLength ?? null,
        maxLength: p.maxLength ?? null,
        placeholder: p.placeholder ?? null,
      };
    case 'file':
      return { ...base, accept: p.accept, array: p.array ?? null, maxDurationSec: p.maxDurationSec ?? null, minPixels: p.minPixels ?? null, maxShortSidePixels: p.maxShortSidePixels ?? null };
    case 'object':
      return { ...base, fields: Object.keys(p.fields) };
    default:
      return base;
  }
}

async function readSdkVersion(): Promise<string | null> {
  try {
    const pkg = JSON.parse(await readFile(PKG_JSON, 'utf8'));
    return pkg.version ?? null;
  } catch {
    return null;
  }
}

// `effectiveBadges` calls `isNewModel`, which calls `Date.now()`. For the
// committed JSON we need badges to be deterministic — a model that's "new"
// today must not flicker off the badge list tomorrow and cause a diff. So
// for the file we emit only the *stored* badges (excluding the derived
// 'new'). Consumers that want the 21-day-window badge can compute it from
// the bundled `addedAt`.
function storedBadgesOnly(m: ModelDefinition): string[] {
  return (m.badge ?? []).filter((b) => b !== 'new');
}

const sdkVersion = await readSdkVersion();
const allModels = Models.list();
const visibleModels = allModels.filter(isPubliclyVisible);

const snapshot = {
  sdkVersion,
  total: visibleModels.length,
  models: visibleModels.map((m) => {
    const params = Model(m.id).params().all();
    const credits = Model(m.id).getCreditsInfo();
    return {
      id: m.id,
      name: m.name,
      mode: m.mode,
      inputType: m.inputType,
      provider: {
        id: m.provider,
        name: m.providerName,
        color: m.providerColor,
        label: m.providerLabel,
      },
      description: m.description,
      features: m.features,
      badges: storedBadgesOnly(m),
      addedAt: m.addedAt ?? null,
      creditRange: credits,
      estimatedTime: m.estimatedTime ?? null,
      params: params.map(serializeParam),
    };
  }),
};

await mkdir(dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, JSON.stringify(snapshot, null, 2) + '\n');

const hidden = allModels.length - visibleModels.length;
console.error(
  `Wrote ${OUT_PATH} — ${snapshot.total} models published, ` +
    `${hidden} hidden (disabled / coming-soon), sdk ${sdkVersion ?? 'unknown'}`,
);

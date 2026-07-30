// ── Model visibility ─────────────────────────────────────────────────
// Single source of truth for "is this model shown by default". Replaces the
// `!m.disabled && !m.deprecated` predicate that used to be duplicated across
// the catalog accessor, the model registry, by-mode listing, and the public
// catalog generator.

import type { ModelDefinition, ReleaseTag } from './types.ts';

/**
 * Release tags shown by default in discovery. `preview` is stage-only and
 * opt-in (pass `release: ['preview', ...]`) — it is never in the default set.
 */
export const DEFAULT_VISIBLE_RELEASES: readonly ReleaseTag[] = ['production', 'general-availability'];

/** Effective release tag of a model — absent ⇒ `'production'`. */
export const releaseOf = (m: ModelDefinition): ReleaseTag => m.release ?? 'production';

/**
 * Whether `m` is visible for the requested `releases` (default: the production
 * + general-availability set).
 *
 * `disabled` and `deprecated` are hard hides layered on top of `release`: a
 * model carrying either is never visible, regardless of its release tag or the
 * requested set. (`disabled` is being phased out in favour of
 * `release: 'preview'`, but is still honoured during the migration.)
 */
export function isVisibleForReleases(
  m: ModelDefinition,
  releases: readonly ReleaseTag[] = DEFAULT_VISIBLE_RELEASES,
): boolean {
  if (m.disabled || m.deprecated) return false;
  return releases.includes(releaseOf(m));
}

#!/usr/bin/env node
/**
 * Publish a PRERELEASE build of dist/ from a merge-request pipeline, so a
 * branch can be tested by consumers without merging.
 *
 * Differences from publish.mjs (the release path):
 *   - The version is derived, not manual: `<base>-alpha.<MR_IID>.<PIPELINE_IID>`
 *     (unique per pipeline, valid semver, never collides with a release).
 *   - Publishes ONLY to this project's GitLab registry — never to public npm.
 *   - Publishes under the `alpha` dist-tag, so `latest` keeps pointing at the
 *     real release.
 *   - No git tag, no GitLab Release.
 *
 * Consume it with the usual @picsart group registry auth:
 *   npm i @picsart/ai-sdk@<printed version>   # exact build
 *   npm i @picsart/ai-sdk@alpha               # most recent alpha
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(PKG_DIR, 'dist');
const distPkgPath = join(DIST, 'package.json');

const {
  CI_API_V4_URL,
  CI_PROJECT_ID,
  CI_MERGE_REQUEST_IID,
  CI_PIPELINE_IID,
  CI_COMMIT_SHORT_SHA,
} = process.env;

const registry =
  CI_API_V4_URL && CI_PROJECT_ID
    ? `${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/npm/`
    : null;
if (!registry) {
  console.error('publish-alpha: GitLab CI env (CI_API_V4_URL/CI_PROJECT_ID) not set.');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(distPkgPath, 'utf8'));
const source = CI_MERGE_REQUEST_IID ? `mr${CI_MERGE_REQUEST_IID}` : (CI_COMMIT_SHORT_SHA ?? 'local');
const build = CI_PIPELINE_IID ?? Date.now();
const version = `${pkg.version}-alpha.${source}.${build}`;

writeFileSync(distPkgPath, JSON.stringify({ ...pkg, version }, null, 2) + '\n');

console.log(`Publishing ${pkg.name}@${version} → ${registry} (dist-tag: alpha)`);
// Scoped packages resolve their publish target from the SCOPE registry; override
// it on the CLI so we hit THIS project's registry, not the read-only group endpoint.
execFileSync(
  'npm',
  ['publish', DIST, '--tag', 'alpha', `--@picsart:registry=${registry}`, '--registry', registry],
  { stdio: 'inherit' },
);

console.log('');
console.log('Install this build:');
console.log(`  npm i ${pkg.name}@${version}`);
console.log(`  npm i ${pkg.name}@alpha   # most recent alpha`);

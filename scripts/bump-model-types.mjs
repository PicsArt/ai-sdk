#!/usr/bin/env node
/**
 * Open (or refresh) an MR that bumps @picsart/model-types and the SDK's minor
 * version. Runs from the downstream pipeline that pa-models-hub-pluggable-worker
 * triggers after publishing a new @picsart/model-types (its `trigger-sdk-update`
 * job), with MODEL_TYPES_TAG set to the worker's release tag (`vX.Y.Z`).
 *
 * The worker triggers on EVERY release tag — a worker release often ships no
 * catalog change — so this script decides whether there is anything to release:
 *   1. the published @picsart/model-types@X.Y.Z must exist (the worker's publish
 *      job is allow_failure, so the trigger can fire after a failed publish);
 *   2. its index.d.ts is compared with the one installed from the lockfile —
 *      identical types ⇒ nothing to do, exit 0, no MR;
 *   3. otherwise: bump the dependency to ^X.Y.Z and the SDK by one minor (new or
 *      changed model contracts are a feature for SDK users), typecheck + unit
 *      test, commit on `bot/model-types-bump` and push it with push options that
 *      open an MR against main set to merge when its pipeline succeeds;
 *   4. set that MR's approval rules to 0 required approvals, so it merges with
 *      no human in the loop (the project's rules are unchanged elsewhere).
 *
 * Never pushes to main: the merged MR is what triggers the regular publish job.
 * One rolling branch — a newer types release force-pushes over a still-open bump
 * MR (rebuilt from the current main), so at most one bot MR is ever open.
 *
 * Auth: SDK_BOT_TOKEN — a project access token (Developer, `api` +
 * `write_repository`), masked + protected CI/CD variable. CI_JOB_TOKEN can
 * neither push branches nor edit MR approval rules.
 *
 * Usage (CI): node packages/ai-sdk/scripts/bump-model-types.mjs   (checks out main and runs `npm ci` itself)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = join(PKG_DIR, '..', '..');
const TYPES_PKG = '@picsart/model-types';
const SDK_WORKSPACE = '@picsart/ai-sdk';
const BRANCH = 'bot/model-types-bump';

const {
  MODEL_TYPES_TAG,
  SDK_BOT_TOKEN,
  CI_SERVER_HOST,
  CI_PROJECT_PATH,
  CI_API_V4_URL,
  CI_PROJECT_ID,
  CI_DEFAULT_BRANCH = 'main',
} = process.env;

function fail(message) {
  console.error(`bump-model-types: ${message}`);
  process.exit(1);
}

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit', ...opts });
const read = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'inherit'], ...opts }).toString().trim();

/** Compare two plain `X.Y.Z` versions (a leading `^`/`~` is ignored): <0, 0, >0. */
function compareVersions(a, b) {
  const parse = (v) => v.replace(/^[\^~]/, '').split('.').map(Number);
  const [pa, pb] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

/** Skip unless `version` is newer than `pinned` — never downgrade, never redo a bump. */
function skipUnlessNewer(pinned, where) {
  if (pinned && compareVersions(pinned, version) >= 0) {
    console.log(`${where} already pins ${TYPES_PKG} ${pinned} (>= ${version}) — nothing to do.`);
    process.exit(0);
  }
}

const version = MODEL_TYPES_TAG?.replace(/^v/, '');
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  fail(`MODEL_TYPES_TAG must be a vX.Y.Z release tag, got "${MODEL_TYPES_TAG ?? ''}".`);
}
if (!SDK_BOT_TOKEN || !CI_SERVER_HOST || !CI_PROJECT_PATH || !CI_API_V4_URL || !CI_PROJECT_ID) {
  fail('SDK_BOT_TOKEN and GitLab CI env (CI_SERVER_HOST/CI_PROJECT_PATH/CI_API_V4_URL/CI_PROJECT_ID) must be set.');
}

// ── 1. The version must actually be published ────────────────────────
try {
  read('npm', ['view', `${TYPES_PKG}@${version}`, 'version']);
} catch {
  fail(`${TYPES_PKG}@${version} is not in the registry — did the worker's publish-model-types job fail?`);
}

// ── 2. Compare the published types with the installed ones ───────────
// Work from the CURRENT main, not the pipeline's commit: a retried older
// pipeline would otherwise compare against (and branch off) a main that newer
// bumps have since moved past. Install from that main's lockfile here rather
// than in before_script, so the installed types are the ones main pins now.
run('git', ['fetch', '--depth', '1', 'origin', CI_DEFAULT_BRANCH]);
run('git', ['checkout', '-B', BRANCH, 'FETCH_HEAD']);
run('npm', ['ci']);

// The package's `exports` only expose ".", so read the file by path; npm
// hoists it to the root node_modules, the workspace copy is the fallback.
const installedTypes = [
  join(ROOT, 'node_modules', TYPES_PKG, 'dist', 'index.d.ts'),
  join(PKG_DIR, 'node_modules', TYPES_PKG, 'dist', 'index.d.ts'),
].find((p) => existsSync(p));
if (!installedTypes) {
  fail(`${TYPES_PKG} is not installed — run \`npm ci\` first.`);
}

// Releases can be processed out of order (a retried or slow older run), so
// compare versions before content: an older release must never replace newer
// types — neither the ones main pins nor the ones an open bump MR carries.
// The job's resource_group serializes runs, so nothing moves the bot branch
// between this check and the push below.
const installedVersion = JSON.parse(readFileSync(join(dirname(installedTypes), '..', 'package.json'), 'utf8')).version;
skipUnlessNewer(installedVersion, CI_DEFAULT_BRANCH);
// Only a confirmed-absent bot branch (`ls-remote --exit-code` → 2) skips this
// check; any other git failure fails the job rather than risk a force-push
// over a newer bump it could not read.
let botBranchExists;
try {
  read('git', ['ls-remote', '--exit-code', '--heads', 'origin', `refs/heads/${BRANCH}`]);
  botBranchExists = true;
} catch (err) {
  if (err?.status !== 2) fail(`could not query ${BRANCH} on origin — ${err.message}`);
  botBranchExists = false;
}
if (botBranchExists) {
  read('git', ['fetch', '--depth', '1', 'origin', BRANCH]);
  const botPkg = JSON.parse(read('git', ['show', 'FETCH_HEAD:packages/ai-sdk/package.json']));
  skipUnlessNewer(botPkg.dependencies?.[TYPES_PKG], `The open ${BRANCH} MR`);
}

const packDir = mkdtempSync(join(tmpdir(), 'model-types-'));
const tarball = read('npm', ['pack', `${TYPES_PKG}@${version}`, '--pack-destination', packDir, '--silent']);
run('tar', ['-xzf', join(packDir, tarball), '-C', packDir]);
const publishedTypes = join(packDir, 'package', 'dist', 'index.d.ts');

if (readFileSync(publishedTypes, 'utf8') === readFileSync(installedTypes, 'utf8')) {
  console.log(`${TYPES_PKG}@${version} carries the same types the SDK already pins — nothing to release.`);
  process.exit(0);
}

// ── 3. Bump, verify, push the MR branch ──────────────────────────────
run('npm', ['install', `${TYPES_PKG}@^${version}`, '-w', SDK_WORKSPACE]);
// Bump the minor by hand: `npm version -w` crashes in this workspace while
// rewriting the lockfile (npm 10: "Cannot read properties of null (reading
// 'edgesOut')"). `--package-lock-only` then syncs the lockfile's copy of the
// version without touching node_modules.
const sdkPkgPath = join(PKG_DIR, 'package.json');
const sdkPkg = JSON.parse(readFileSync(sdkPkgPath, 'utf8'));
const [major, minor] = sdkPkg.version.split('.').map(Number);
const sdkVersion = `${major}.${minor + 1}.0`;
writeFileSync(sdkPkgPath, JSON.stringify({ ...sdkPkg, version: sdkVersion }, null, 2) + '\n');
run('npm', ['install', '--package-lock-only']);

// Gate the MR on the cheap checks; the MR pipeline still runs the full
// test:sdk (live e2e + bundle) before the merge.
run('npm', ['run', 'typecheck']);
run('npm', ['run', 'test:sdk']);

const title = `chore(sdk): bump ${TYPES_PKG} to ^${version} — ${sdkVersion}`;
run('git', ['config', 'user.name', 'pa-gen-ai-sdk bot']);
run('git', ['config', 'user.email', 'noreply@picsart.com']);
run('git', ['add', 'packages/ai-sdk/package.json', 'package-lock.json']);
run('git', ['commit', '-m', title, '-m', `Triggered by pa-models-hub-pluggable-worker ${MODEL_TYPES_TAG}.`]);

// Push with the bot token; GitLab masks it in the job log. An MR that already
// exists for the branch is updated rather than duplicated.
const remote = `https://oauth2:${SDK_BOT_TOKEN}@${CI_SERVER_HOST}/${CI_PROJECT_PATH}.git`;
run('git', [
  'push', '--force', remote, `HEAD:refs/heads/${BRANCH}`,
  '-o', 'merge_request.create',
  '-o', `merge_request.target=${CI_DEFAULT_BRANCH}`,
  '-o', `merge_request.title=${title}`,
  '-o', 'merge_request.merge_when_pipeline_succeeds',
  '-o', 'merge_request.remove_source_branch',
]);

console.log(`Pushed ${BRANCH}: ${title}`);

// ── 4. Waive the approval requirement on the bot MR only ─────────────
// Same approach as pa-workflows-api-client's generate:types: set every approval
// rule of THIS MR to 0 required approvals (deleting them re-surfaces the
// project rule). The project's rules stay untouched for every other MR, and the
// auto-merge set by the push above merges it once the pipeline passes. Needs
// the `api` scope on SDK_BOT_TOKEN and "Prevent editing approval rules in merge
// requests" off in the project's approval settings.
async function gitlab(path, init = {}) {
  const method = init.method ?? 'GET';
  const res = await fetch(`${CI_API_V4_URL}/projects/${CI_PROJECT_ID}${path}`, {
    ...init,
    headers: { 'PRIVATE-TOKEN': SDK_BOT_TOKEN, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    fail(`GitLab API ${method} ${path} → ${res.status} ${await res.text()} — the bump MR is open but still needs an approval.`);
  }
  return res.json();
}

// The push option creates the MR during the push; poll briefly in case the API
// does not list it yet.
let mr;
for (let attempt = 0; attempt < 6 && !mr; attempt++) {
  if (attempt) await new Promise((resolve) => setTimeout(resolve, 5000));
  const query = new URLSearchParams({ state: 'opened', source_branch: BRANCH, target_branch: CI_DEFAULT_BRANCH });
  [mr] = await gitlab(`/merge_requests?${query}`);
}
if (!mr) {
  fail(`no open MR found for ${BRANCH} after the push.`);
}

for (const rule of await gitlab(`/merge_requests/${mr.iid}/approval_rules`)) {
  if (rule.approvals_required === 0) continue;
  await gitlab(`/merge_requests/${mr.iid}/approval_rules/${rule.id}`, {
    method: 'PUT',
    body: JSON.stringify({ approvals_required: 0 }),
  });
  console.log(`!${mr.iid}: approval rule "${rule.name}" set to 0 required approvals.`);
}

console.log(`!${mr.iid} merges automatically once its pipeline passes: ${mr.web_url}`);

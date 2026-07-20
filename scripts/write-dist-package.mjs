#!/usr/bin/env node
/**
 * Write a publish-ready dist/package.json.
 *
 * tsup emits the JS/d.ts into dist/, but the source package.json points at
 * `./src/index.ts` (for workspace/dev consumption) and lists `./dist/...`
 * paths. When the package is published with the package root AT dist/, those
 * paths and the source-file `exports` are wrong. This script produces a
 * dist/package.json whose fields are correct for publishing from inside dist/.
 *
 * Run as the last step of build:sdk. Version is taken as-is from the source
 * package.json (manual versioning); publish.mjs publishes this dist/ to the
 * registries.
 *
 * Usage: node scripts/write-dist-package.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcPkg = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
const distPkgPath = join(PKG_DIR, 'dist', 'package.json');

const pkg = { ...srcPkg };

// Not relevant to consumers / not valid when publishing from dist/.
delete pkg.files;
delete pkg.devDependencies;
delete pkg.scripts;

// PUBLIC build only (SDK_BUNDLE=1): these are bundled INTO dist/ by tsup (see
// tsup.config.ts `noExternal`), so they must NOT remain in `dependencies` or a
// public `npm install` would fail resolving them from npmjs. The GitLab/internal
// build keeps them as normal deps (resolved from the GitLab registry).
if (process.env.SDK_BUNDLE && pkg.dependencies) {
  const BUNDLED_DEPS = [
    '@picsart/pa-model-pricing-sdk',
    '@picsart/workflows-client',
    '@picsart/workflows-types',
  ];
  for (const dep of BUNDLED_DEPS) delete pkg.dependencies[dep];
}

// Paths are relative to the package root, which IS dist/ at publish time.
const stripDist = (p) => (typeof p === 'string' ? p.replace(/^\.\/dist\//, './') : p);
pkg.main = stripDist(pkg.main);
pkg.module = stripDist(pkg.module);
pkg.types = stripDist(pkg.types);

// Source-file exports (e.g. "./src/index.ts") don't exist in the tarball —
// point the public entry at the built JS + types instead.
const builtMain = pkg.main || './index.js';
const builtTypes = pkg.types || './index.d.ts';
pkg.exports = { '.': { types: builtTypes, import: builtMain } };

// Scoped package must be published with public access. The target registry is
// chosen per-publish by publish.mjs (via --@picsart:registry), not pinned here.
pkg.publishConfig = { access: 'public' };

writeFileSync(distPkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Wrote ${distPkgPath} (${pkg.name})`);

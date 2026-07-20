#!/usr/bin/env node
/**
 * Make dist/index.d.ts self-contained.
 *
 * tsup bundles the private @picsart/* deps into the JS (tsup.config.ts
 * `noExternal`), but rollup-plugin-dts (`dts.resolve`) does NOT inline their
 * TYPES — the emitted dist/index.d.ts keeps `import ... from '@picsart/...'`
 * lines. Those packages are private (GitLab-only), so a public TypeScript
 * consumer would hit "Cannot find module '@picsart/...'".
 *
 * This step copies each referenced package's .d.ts tree into dist/_vendor/<pkg>/
 * and rewrites every `@picsart/<pkg>` specifier (in index.d.ts and, transitively,
 * in the vendored files) to a relative path. Result: the published types have
 * zero external @picsart references.
 *
 * Runs after `tsup`, before write-dist-package.mjs. Idempotent-ish: it rebuilds
 * _vendor from scratch each run (dist is cleaned by tsup anyway).
 *
 * Only active for the PUBLIC build (SDK_BUNDLE=1). The GitLab/internal build
 * keeps @picsart/* as external deps, so its .d.ts should keep those imports.
 *
 * Usage: SDK_BUNDLE=1 node scripts/inline-dist-types.mjs
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(PKG_DIR, 'dist');
const VENDOR = join(DIST, '_vendor');

// Always start clean — tsup's `clean` doesn't remove this post-build dir, so a
// stale _vendor from a previous (public) build could otherwise leak into the
// internal build's dist/ and get published/mirrored.
rmSync(VENDOR, { recursive: true, force: true });

// Public build only — the GitLab/internal build keeps @picsart/* external.
if (!process.env.SDK_BUNDLE) {
  console.log('SDK_BUNDLE not set — leaving @picsart/* type imports external (internal build).');
  process.exit(0);
}

const require = createRequire(join(PKG_DIR, 'package.json'));

const SPEC_RE = /(['"])@picsart\/([^'"/]+)\1/g;

// The package's own unscoped name — it appears in JSDoc usage examples
// (e.g. `import { model } from '@picsart/ai-sdk'`) and must never be vendored
// or rewritten, or we'd recursively copy dist into itself and mangle the docs.
const SELF = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8')).name.replace(/^@picsart\//, '');

/** Find a package's root dir by resolving its entry and walking up to package.json.
 *  (require.resolve of `<pkg>/package.json` is blocked by strict "exports" maps.) */
function findPkgRoot(pkg) {
  let dir = dirname(require.resolve(`@picsart/${pkg}`));
  for (;;) {
    const pj = join(dir, 'package.json');
    if (existsSync(pj)) {
      const parsed = JSON.parse(readFileSync(pj, 'utf8'));
      if (parsed.name === `@picsart/${pkg}`) return { pkgRoot: dir, pkgJson: parsed };
    }
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`Could not locate package root for @picsart/${pkg}`);
    dir = parent;
  }
}

/** Resolve a private package's types dir + entry basename. */
function resolveTypes(pkg) {
  const { pkgRoot, pkgJson } = findPkgRoot(pkg);
  const typesRel = pkgJson.types || pkgJson.typings;
  if (!typesRel) throw new Error(`@picsart/${pkg} has no "types" entry — cannot vendor its declarations.`);
  const typesFile = join(pkgRoot, typesRel);
  return { typesDir: dirname(typesFile), entry: basename(typesFile, '.d.ts') };
}

/** Copy every *.d.ts under `srcDir` into `destDir`, preserving structure. */
function copyDeclarations(srcDir, destDir) {
  for (const name of readdirSync(srcDir, { withFileTypes: true })) {
    if (name.name === '_vendor' || name.name === 'node_modules') continue; // never nest our own output
    const src = join(srcDir, name.name);
    const dest = join(destDir, name.name);
    if (name.isDirectory()) copyDeclarations(src, dest);
    else if (name.name.endsWith('.d.ts')) {
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(src, dest);
    }
  }
}

/** List referenced @picsart/* package names in a file's text (excluding self). */
function referencedPkgs(text) {
  const out = new Set();
  for (const m of text.matchAll(SPEC_RE)) if (m[2] !== SELF) out.add(m[2]);
  return out;
}

const indexDts = join(DIST, 'index.d.ts');
if (!existsSync(indexDts)) {
  console.error('dist/index.d.ts not found — run tsup first.');
  process.exit(1);
}

// 1. Transitive closure of referenced @picsart packages, starting from index.d.ts.
const vendored = new Map(); // pkg -> { entry }
const queue = [...referencedPkgs(readFileSync(indexDts, 'utf8'))];
while (queue.length) {
  const pkg = queue.shift();
  if (vendored.has(pkg)) continue;
  const { typesDir, entry } = resolveTypes(pkg);
  const destDir = join(VENDOR, pkg);
  copyDeclarations(typesDir, destDir);
  vendored.set(pkg, { entry });
  // Follow references inside the freshly-vendored tree.
  const entryFile = join(destDir, `${entry}.d.ts`);
  for (const dep of referencedPkgs(existsSync(entryFile) ? readFileSync(entryFile, 'utf8') : '')) {
    if (!vendored.has(dep)) queue.push(dep);
  }
}

if (vendored.size === 0) {
  console.log('No @picsart/* type references in dist/index.d.ts — nothing to inline.');
  process.exit(0);
}

// 2. Rewrite specifiers. `fromFile` -> path of the file being rewritten so we can
//    compute a correct relative specifier to dist/_vendor/<pkg>/<entry>.
function rewrite(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const next = text.replace(SPEC_RE, (whole, quote, pkg) => {
    const meta = vendored.get(pkg);
    if (!meta) return whole; // not one we vendored — leave as-is
    const target = join(VENDOR, pkg, meta.entry);
    let rel = relative(dirname(filePath), target).replace(/\\/g, '/');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return `${quote}${rel}${quote}`;
  });
  if (next !== text) writeFileSync(filePath, next);
}

rewrite(indexDts);
for (const pkg of vendored.keys()) {
  const dir = join(VENDOR, pkg);
  const walk = (d) => {
    for (const name of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, name.name);
      if (name.isDirectory()) walk(p);
      else if (name.name.endsWith('.d.ts')) rewrite(p);
    }
  };
  walk(dir);
}

console.log(`Inlined types for: ${[...vendored.keys()].map((p) => `@picsart/${p}`).join(', ')} → dist/_vendor/`);

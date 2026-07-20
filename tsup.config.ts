import { defineConfig } from 'tsup';

const nodeBuiltins = [
  'node:fs', 'node:path', 'node:os', 'node:http', 'node:https',
  'node:crypto', 'node:url', 'node:child_process', 'node:net',
  'node:readline', 'node:stream', 'node:process', 'node:events',
  'node:util', 'node:buffer', 'node:tty',
];

// The private @picsart/* deps to inline when producing the PUBLIC build.
const privateDeps = [
  '@picsart/pa-model-pricing-sdk',
  '@picsart/workflows-client',
  '@picsart/workflows-types',
];

// Two build modes (see .gitlab-ci.yml):
//   SDK_BUNDLE unset  → GitLab/internal build: keep @picsart/* as EXTERNAL deps
//                       (internal consumers resolve them from the GitLab registry).
//   SDK_BUNDLE=1      → public npm build: inline the private deps so the tarball
//                       is self-contained (only `fflate` remains a dependency).
//                       inline-dist-types.mjs + write-dist-package.mjs also key
//                       off this flag.
const bundlePrivateDeps = !!process.env.SDK_BUNDLE;

export default defineConfig([
  // SDK (library entry point with type declarations)
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    // When bundling, tsup's dts.resolve can't inline these scoped, partly
    // multi-file @picsart/* declarations, so the emitted .d.ts still imports
    // from them. scripts/inline-dist-types.mjs vendors them into dist/_vendor/
    // and rewrites the imports to relative paths (public build only).
    dts: true,
    clean: true,
    outDir: 'dist',
    splitting: true,
    treeshake: true,
    target: 'es2022',
    external: [...nodeBuiltins],
    noExternal: bundlePrivateDeps ? privateDeps : [],
  },
]);

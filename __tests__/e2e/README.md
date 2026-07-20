# e2e — live SDK tests

Two live suites (`__tests__/e2e/*.e2e.ts`), run via `npm run test:e2e`:

- **`get-credits.e2e.ts`** — pricing pre-flight for **every model in the catalog** via
  `client.getCredits(id, ctx)`. No generation, no credits consumed.
- **`generate.e2e.ts`** — one real end-to-end generation via `client.generate()`
  (submit → poll → parsed output), using `picsart-remove-bg`.
  ⚠ **consumes credits** on the authenticated account.

## OPTIONS matrix (`get-credits.e2e.ts`)

Pre-flights every model through the SDK's own `client.getCredits(id, ctx)` — the
real consumer path: `resolveModel → prepareRequest (buildPayload +
workflow/editWorkflow selection) → /options`. It replaces the 28 per-vendor
options test files from ai-toolkit — `loadCatalog()` with no filter already
returns the whole catalog, and `node:test` groups output per model id, so new
vendors/models need **no** test changes.

Both suites are **live**, kept separate from the unit suite:

- The unit runner (`test:unit` → `test:sdk`) globs `__tests__/unit/*.test.ts`.
  These are `__tests__/e2e/*.e2e.ts`, run via their own `test:e2e` script.
- **CI runs them** as a dedicated step in the `test` job (`npm run test:e2e`). That
  step needs a `PICSART_TOKEN` CI/CD variable; it targets staging by default
  (`PICSART_API_URL` to override).
- They are also type-checked by CI — they live under the package `tsconfig`
  (`include: ["./**/*.ts"]`), so a type error here fails CI.
- They **require** `PICSART_TOKEN` — the run **fails** without it (never silently
  skipped).

## What it checks

For each `(model × pricing-relevant param combo)`, and again for every model with
an `editWorkflow`:

1. `getCredits` prices the request — the SDK validates the input, builds the
   payload, resolves the workflow (image inputs → `editWorkflow` automatically),
   and calls `/options`.
2. credits `> 0` (pricing wired; `>= 0` for free tools).

We intentionally **don't** cross-check pricing against `/shop/subscription/features`:
the gateway derives `credits` from that same data, so a credits-vs-shop mismatch
isn't a reachable failure mode. The matrix still varies the pricing-relevant params
so every tier's `/options` path is exercised.

`/options` is pre-flight only — **no generation runs and no credits are consumed.**

## Generate smoke (`generate.e2e.ts`)

One real generation through `client.generate()` — asserts the result echoes the
model id, has at least one result item, and returns an `http(s)` output URL. This
exercises the full submit → poll → parse path the SDK exposes to consumers.

The model is `TEST_MODEL_ID`, **defaulting to `picsart-remove-bg`**; the input is
built from that model's paramConfig defaults (so any `TEST_MODEL_ID` works, e.g.
`TEST_MODEL_ID=flux-2-pro npm run test:e2e`).

⚠ **It consumes credits** on the authenticated account (one generation per run).
Because it is matched by the `*.e2e.ts` glob, `npm run test:e2e` (and the CI step)
runs it alongside the OPTIONS matrix.

## Running it

Auth is a ready bearer token (the harness does not log in). Provide it either via
a `.env.local` file at the repo root (auto-loaded) or an exported env var:

```bash
# preferred: copy the template and fill in PICSART_TOKEN
cp .env.example .env.local
$EDITOR .env.local                # PICSART_TOKEN=...  (plain KEY=VALUE, no `export`)

npm run test:e2e                                          # staging gateway (default), whole catalog
PICSART_API_URL=https://api.picsart.com npm run test:e2e  # prod gateway

# scope to a single model (loads only that model from the catalog):
TEST_MODEL_ID=flux-2-pro npm run test:e2e

# or skip the file and export directly:
PICSART_TOKEN=... npm run test:e2e
```

`TEST_MODEL_ID` runs the matrix for just that model id (unset → the whole
catalog). If the id matches no enabled model, the run fails rather than passing
with zero tests.

`.env.local` is auto-loaded by the script (`node --env-file-if-exists=../../.env.local`)
and is gitignored. It must be plain `KEY=VALUE` (Node's `--env-file` does not
understand a leading `export`). `PICSART_TOKEN` is required — without it the run
fails (non-zero exit), it does not skip.

## Notes

- **Zero-credit tools:** providers in `ZERO_CREDIT_PROVIDERS` (currently
  `picsart`) and ids in `ZERO_CREDIT_MODEL_IDS` are asserted `>= 0`; everything
  else must be `> 0`. This replaces ai-toolkit's divergent `picsart.options.test.ts`
  without a per-vendor file. If a `freeTier`/zero-credit flag is ever added to the
  model metadata, drive the assertion off that instead.
- **Excluding a model:** add its id to `DISABLED_TEST_MODELS` in `helpers/catalog-loader.ts`
  with a reason.
- Failure modes: a 404 from `/options` → the pluggable worker isn't deployed on
  that stage. `getCredits returned null` / `credits should be > 0` → the
  pricing-service entry for that `modelId` is missing — a backend/pricing-team task.
  A validation throw from `getCredits` means the model's `paramConfig`/payload
  builder produced input the contract rejects — a real SDK bug worth fixing.

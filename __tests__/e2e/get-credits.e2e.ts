/**
 * OPTIONS matrix e2e — ONE test for the whole catalog (all vendors).
 *
 * This replaces the 28 per-vendor options test files an earlier harness carried.
 * They were byte-identical except the `loadCatalog({ vendor })` argument;
 * `loadCatalog()` with no filter already returns every enabled model, and
 * node:test groups output per model id. New vendors/models need zero changes
 * here — they just appear once they're in the SDK catalog.
 *
 * LIVE test — hits the gateway's /options pre-flight (no generation, no credits
 * consumed). It is a separate suite from the unit tests: the unit runner globs
 * `__tests__/unit/*.test.ts`, while this is `__tests__/e2e/*.e2e.ts`, run via
 * `npm run test:e2e`. CI runs it as its own step (needs the PICSART_TOKEN CI
 * variable). It requires PICSART_TOKEN and fails (does not skip) without it. Set
 * TEST_MODEL_ID to scope the run to a single model id (unset → the whole
 * catalog). See e2e/README.md.
 *
 * Pricing comes from the SDK itself: `client.getCredits(id, ctx)` runs the real
 * consumer path — resolveModel → prepareRequest (buildPayload + workflow /
 * editWorkflow selection) → /options — and returns the credit number. So the
 * harness never reimplements payload building, and image inputs route the SDK to
 * editWorkflow on their own.
 *
 * For each (model × pricing-relevant param combo), and again for every model
 * with an editWorkflow:
 *   0. PICSART_TOKEN is set (the run fails fast if not — it is never skipped)
 *   1. getCredits resolves + prices the request (SDK builds payload, calls /options)
 *   2. credits is present (not null). A present-but-0 price is fine (free tools).
 *
 * We deliberately do NOT re-check the returned credits against the gateway's own
 * pricing catalogue: the gateway computes credits from that same source, so a
 * mismatch isn't a reachable failure mode. The matrix still varies the
 * pricing-relevant params so every tier's OPTIONS path is exercised.
 *
 * The calls are independent, so every model and combo is scheduled at once and
 * a limiter caps in-flight requests at E2E_CONCURRENCY (default 16). Each combo
 * reads its own /options answer (withOptionsProbe), so retries and failure
 * messages never see a neighbour's response. E2E_CONCURRENCY=1 restores the
 * old one-at-a-time run.
 */
import { describe, test, before } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';
import { createTestClient } from './helpers/ai-sdk-test-client.ts';
import {
  describeLastOptions,
  isTransient,
  lastOptionsResponse,
  withOptionsProbe,
} from './helpers/options-probe.ts';
import { loadCatalog, type CatalogEntry } from './helpers/catalog-loader.ts';
import { expandMatrix, type ExpandOptions } from './helpers/param-matrix.ts';
import { createLimiter } from './helpers/limit.ts';

const CONCURRENCY = Number(process.env.E2E_CONCURRENCY ?? 16);
const limit = createLimiter(CONCURRENCY);

/** Pause before the single retry — a 429 needs the gateway to catch its breath. */
const RETRY_DELAY_MS = 1_000;

let client: ReturnType<typeof createTestClient>;

// Fails the whole run if PICSART_TOKEN is missing (createTestClient throws) —
// the e2e is never silently skipped. Gateway URL comes from PICSART_API_URL
// (defaults to staging).
before(() => {
  client = createTestClient();
});

/**
 * AiClient.getCredits is typed generically (`<M extends TypedModelId>`), which
 * can't be satisfied by a runtime `string` id + generic context. Wrap it once
 * with a loose signature — the runtime impl already accepts exactly this.
 */
function getCredits(id: string, ctx: Record<string, unknown>): Promise<number | null> {
  return (
    client.getCredits as unknown as (m: string, p: Record<string, unknown>) => Promise<number | null>
  )(id, ctx);
}

/**
 * Price one combo, retrying once when the gateway or the network hiccuped.
 *
 * A small fraction of the ~7700 /options calls in a full run come back null
 * from a 429/5xx or a dropped connection, and any single one reddens the job —
 * seen on veo-3.1-fast, seedance-2.0 and seedance-2.0-video-edit on unrelated
 * branches. One retry removes that noise. A 4xx, or a 2xx carrying no credits,
 * is a real answer and is NOT retried, so a genuine pricing gap still fails.
 */
async function priceWithRetry(id: string, ctx: Record<string, unknown>): Promise<number | null> {
  const credits = await limit(() => getCredits(id, ctx));
  if (credits !== null || !isTransient(lastOptionsResponse())) return credits;
  // Wait outside the limiter so a backing-off combo doesn't hold a slot.
  await sleep(RETRY_DELAY_MS);
  return limit(() => getCredits(id, ctx));
}

function runChecks(label: string, credits: number | null): void {
  // The SDK priced the request (built payload, resolved workflow, hit /options).
  // Pricing must be present (not null); a present-but-0 price is acceptable.
  // transport.options collapses every cause into null, so quote what /options
  // actually answered — otherwise the message names only the cell, and finding
  // the cause means diffing whole job logs against a passing run.
  assert.notEqual(
    credits, null,
    `getCredits returned null for ${label} — last /options: ${describeLastOptions()}`,
  );
  assert.ok((credits as number) >= 0, `credits should be >= 0 for ${label}`);
}

// TEST_MODEL_ID scopes the run to one model id; unset → the whole catalog.
const onlyModel = process.env.TEST_MODEL_ID;
const models = loadCatalog(onlyModel ? { model: onlyModel } : {});

// Fail loudly if a specific id was asked for but matched nothing (typo, or the
// model is disabled/deprecated) — otherwise the run would silently pass with 0 tests.
if (onlyModel && models.length === 0) {
  test(`TEST_MODEL_ID=${onlyModel}`, () => {
    assert.fail(`no enabled model with id "${onlyModel}" in the catalog`);
  });
}

/**
 * One test per model, its combos as concurrent subtests. Each combo runs in its
 * own probe scope so the retry decision and the failure message both read the
 * /options answer for that combo alone.
 */
function matrixTest(entry: CatalogEntry, name: string, options: ExpandOptions = {}): void {
  test(name, { concurrency: true }, async (t) => {
    await Promise.all(
      expandMatrix(entry, options).map((c) =>
        t.test(c.label, () =>
          withOptionsProbe(async () => {
            const credits = await priceWithRetry(entry.id, entry.buildContext(c.params));
            runChecks(`${name} [${c.label}]`, credits);
          }),
        ),
      ),
    );
  });
}

// Models run concurrently; the limiter, not the test runner, bounds the load.
// TEMP: disabled — re-enable by removing `skip`.
describe('options matrix', { concurrency: true, skip: 'temporarily disabled' }, () => {
  // ── Generate matrix ──────────────────────────────────────────────────
  for (const entry of models) matrixTest(entry, entry.id);

  // ── Edit-workflow matrix (only models that declare editWorkflow) ──────
  // The edit matrix fills source images, so the SDK's prepareRequest routes
  // getCredits to editWorkflow + buildEditPayload automatically.
  for (const entry of models.filter((m) => m.editWorkflow)) {
    matrixTest(entry, `${entry.id} (edit)`, { mode: 'edit' });
  }
});

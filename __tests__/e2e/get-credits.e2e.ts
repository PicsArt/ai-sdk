/**
 * OPTIONS matrix e2e — ONE test for the whole catalog (all vendors).
 *
 * This replaces ai-toolkit's 28 per-vendor options test files. They were
 * byte-identical except the `loadCatalog({ vendor })` argument; `loadCatalog()`
 * with no filter already returns every enabled model, and node:test groups
 * output per model id. New vendors/models need zero changes here — they just
 * appear once they're in the SDK catalog.
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
 * We deliberately do NOT re-check pricing against /shop/subscription/features:
 * the gateway computes credits from that same source, so a credits-vs-shop
 * mismatch isn't a reachable failure mode. The matrix still varies the
 * pricing-relevant params so every tier's OPTIONS path is exercised.
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { createTestClient } from './helpers/ai-sdk-test-client.ts';
import { loadCatalog } from './helpers/catalog-loader.ts';
import { expandMatrix } from './helpers/param-matrix.ts';

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

function runChecks(label: string, credits: number | null): void {
  // The SDK priced the request (built payload, resolved workflow, hit /options).
  // Pricing must be present (not null); a present-but-0 price is acceptable.
  assert.notEqual(credits, null, `getCredits returned null for ${label}`);
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

// ── Generate matrix ──────────────────────────────────────────────────
for (const entry of models) {
  test(entry.id, async (t) => {
    for (const c of expandMatrix(entry)) {
      await t.test(c.label, async () => {
        const credits = await getCredits(entry.id, entry.buildContext(c.params));
        runChecks(`${entry.id} [${c.label}]`, credits);
      });
    }
  });
}

// ── Edit-workflow matrix (only models that declare editWorkflow) ──────
// The edit matrix fills source images, so the SDK's prepareRequest routes
// getCredits to editWorkflow + buildEditPayload automatically.
for (const entry of models.filter((m) => m.editWorkflow)) {
  test(`${entry.id} (edit)`, async (t) => {
    for (const c of expandMatrix(entry, { mode: 'edit' })) {
      await t.test(c.label, async () => {
        const credits = await getCredits(entry.id, entry.buildContext(c.params));
        runChecks(`${entry.id} (edit) [${c.label}]`, credits);
      });
    }
  });
}

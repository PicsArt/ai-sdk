/**
 * Generate e2e — one real end-to-end SDK generation.
 *
 * Unlike get-credits.e2e.ts (pricing pre-flight only), this submits a real job via
 * `client.generate()` and waits for the result — exercising the full SDK path:
 * resolveModel → prepareRequest → submit → poll → parse output.
 *
 * Model is TEST_MODEL_ID, defaulting to `picsart-sod-v8-2` (fast, single
 * required input). The input is built from the model's paramConfig defaults
 * (catalog-loader), so any TEST_MODEL_ID works. ⚠ THIS CONSUMES CREDITS on the
 * authenticated account.
 *
 * Requires PICSART_TOKEN — fails (does not skip) without it. Targets staging by
 * default (PICSART_API_URL to override). Part of the e2e suite (`npm run test:e2e`),
 * not the unit suite. See e2e/README.md.
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import type { GenerateResult } from '../../src/index.ts';
import { createTestClient } from './helpers/ai-sdk-test-client.ts';
import { loadCatalog } from './helpers/catalog-loader.ts';

const MODEL_ID = process.env.TEST_MODEL_ID ?? 'picsart-sod-v8-2';

let client: ReturnType<typeof createTestClient>;

// Fails the run if PICSART_TOKEN is missing (createTestClient throws).
before(() => {
  client = createTestClient();
});

// generate() is typed generically (`<M extends TypedModelId>`); a runtime string
// id + generic input can't satisfy it, so call through a loose signature.
function generate(id: string, input: Record<string, unknown>): Promise<GenerateResult> {
  return (
    client.generate as unknown as (m: string, p: Record<string, unknown>) => Promise<GenerateResult>
  )(id, input);
}

// Generous timeout — TEST_MODEL_ID may point at a slower (e.g. video) model.
test(`${MODEL_ID} — basic generate`, { timeout: 300_000 }, async () => {
  const entry = loadCatalog({ model: MODEL_ID })[0];
  assert.ok(entry, `no enabled model with id "${MODEL_ID}" in the catalog`);

  const result = await generate(MODEL_ID, entry.buildContext());

  console.log(`Generated ${result.url} for ${MODEL_ID}`);

  assert.equal(result.model, MODEL_ID, 'result.model should echo the requested model');
  assert.ok(result.results.length >= 1, 'expected at least one result item');
  assert.ok(
    typeof result.url === 'string' && /^https?:\/\//.test(result.url),
    `expected an http(s) output URL, got: ${JSON.stringify(result.url)}`,
  );
});

/**
 * Catalog wire round-trip tests — offline, no API calls.
 *
 * `serializeCatalog` → `deserializeCatalog` must lose nothing except the fields
 * that cannot ride the wire (functions, output schemas, test/poll tuning). This
 * conversion is where a silent information loss would hide, so it is asserted
 * field-for-field over a fixture exercising every descriptor kind, badges,
 * constraints, an object param, and the full set of file bounds.
 */
import assert from 'node:assert';
import { deserializeCatalog, serializeCatalog } from '../../src/core/catalog-wire.ts';
import type { ModelDefinition } from '../../src/core/types.ts';
import { ApiError } from '../../src/core/errors.ts';
import { FIXTURE_CATALOG, RICH } from './helpers/fixture-catalog.ts';

const MODELS: ModelDefinition[] = [...FIXTURE_CATALOG, RICH];

/** Fields that legitimately do not survive serialization. */
const UNSERIALIZABLE: readonly (keyof ModelDefinition)[] = [
  'buildPayload',
  'buildEditPayload',
  'outputSchema',
  'outputExtension',
  'testTimeout',
  'pollOptions',
  'editEstimatedTime',
];

function serializableView(def: ModelDefinition): Record<string, unknown> {
  const view: Record<string, unknown> = { ...def };
  for (const key of UNSERIALIZABLE) delete view[key];
  // Seeded catalogOptions are hydrated at runtime, never served on the wire.
  view.paramConfig = Object.fromEntries(
    Object.entries(def.paramConfig).map(([key, entry]) => {
      const { catalogOptions: _dropped, ...rest } = entry;
      return [key, rest];
    }),
  );
  // JSON-normalize: entries may carry explicitly-undefined props,
  // indistinguishable from absent on the wire.
  return JSON.parse(JSON.stringify(view));
}

// ── 1. round-trip every fixture model ────────────────────────────────
{
  const roundTripped = deserializeCatalog(serializeCatalog(MODELS));
  assert.strictEqual(roundTripped.length, MODELS.length);
  for (let i = 0; i < MODELS.length; i++) {
    assert.deepStrictEqual(
      serializableView(roundTripped[i]),
      serializableView(MODELS[i]),
      `round-trip mismatch for ${MODELS[i].id}`,
    );
  }
}

// ── 2. provider block flattens back onto provider* fields ───────────
{
  const wire = serializeCatalog([RICH]);
  const model = wire.response.models[0];
  assert.strictEqual(model.provider.id, RICH.provider);
  assert.strictEqual(model.provider.name, RICH.providerName);
  assert.strictEqual(model.provider.color, RICH.providerColor);
  assert.strictEqual(model.provider.label, RICH.providerLabel);
  const [back] = deserializeCatalog(wire);
  assert.strictEqual(back.provider, RICH.provider);
  assert.strictEqual(back.providerName, RICH.providerName);
}

// ── 3. badges ⇄ badge ────────────────────────────────────────────────
{
  const wire = serializeCatalog([RICH]);
  assert.deepStrictEqual(wire.response.models[0].badges, RICH.badge);
  const [back] = deserializeCatalog(wire);
  assert.deepStrictEqual(back.badge, RICH.badge);
}

// ── 4. every descriptor kind is represented and survives ────────────
{
  const kinds = new Set<string>();
  for (const entry of Object.values(RICH.paramConfig)) kinds.add(entry.descriptor.kind);
  for (const kind of ['enum', 'catalog', 'range', 'boolean', 'text', 'file', 'object']) {
    assert.ok(kinds.has(kind), `fixture lost coverage of descriptor kind "${kind}"`);
  }
}

// ── 5. object params keep flat fields + additionalProperties ────────
{
  const [back] = deserializeCatalog(serializeCatalog([RICH]));
  const { catalogOptions: _dropped, ...expected } = RICH.paramConfig.turns;
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(back.paramConfig.turns)),
    JSON.parse(JSON.stringify(expected)),
  );
}

// ── 6. file bounds all round-trip ────────────────────────────────────
{
  const [back] = deserializeCatalog(serializeCatalog([RICH]));
  const d = back.paramConfig.image.descriptor as unknown as Record<string, unknown>;
  for (const bound of ['minPixels', 'minSidePixels', 'maxShortSidePixels', 'maxDurationSec', 'maxBytes'] as const) {
    assert.deepStrictEqual(
      d[bound],
      (RICH.paramConfig.image.descriptor as unknown as Record<string, unknown>)[bound],
      `file bound ${bound} lost`,
    );
  }
}

// ── 7. constraints pass through verbatim ─────────────────────────────
{
  const [back] = deserializeCatalog(serializeCatalog([RICH]));
  assert.deepStrictEqual(back.constraints, RICH.constraints);
}

// ── 8. routing-less wire model gets workflow '' ──────────────────────
{
  const wire = serializeCatalog([RICH]);
  delete wire.response.models[0].workflow;
  delete wire.response.models[0].editWorkflow;
  delete wire.response.models[0].modelId;
  const [back] = deserializeCatalog(wire);
  assert.strictEqual(back.workflow, '');
  assert.strictEqual(back.editWorkflow, undefined);
}

// ── 9. malformed envelope → ApiError 502 invalid_response ───────────
{
  for (const bad of [null, {}, { status: 'error' }, { status: 'success', response: {} }]) {
    assert.throws(
      () => deserializeCatalog(bad),
      (err: unknown) =>
        err instanceof ApiError && err.status === 502 && err.code === 'invalid_response',
      `expected 502 invalid_response for ${JSON.stringify(bad)}`,
    );
  }
}

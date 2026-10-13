/**
 * Catalog wire round-trip tests — offline, no API calls.
 *
 * `serializeCatalog` → `deserializeCatalog` over every bundled model must
 * lose nothing except the fields that cannot ride the wire (functions,
 * output schemas, test/poll tuning). This conversion is where a silent
 * information loss would hide, so it is asserted field-for-field.
 */
import assert from 'node:assert';
import { ALL_MODELS } from '../../src/vendors/catalog/index.ts';
import { deserializeCatalog, serializeCatalog } from '../../src/core/catalog-wire.ts';
import type { ModelDefinition } from '../../src/core/types.ts';
import { ApiError } from '../../src/core/errors.ts';

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
  // JSON-normalize: some bundled entries carry explicitly-undefined props
  // (e.g. `required: undefined`), indistinguishable from absent on the wire.
  return JSON.parse(JSON.stringify(view));
}

// ── 1. round-trip every bundled model ────────────────────────────────
{
  const roundTripped = deserializeCatalog(serializeCatalog(ALL_MODELS));
  assert.strictEqual(roundTripped.length, ALL_MODELS.length);
  for (let i = 0; i < ALL_MODELS.length; i++) {
    assert.deepStrictEqual(
      serializableView(roundTripped[i]),
      serializableView(ALL_MODELS[i]),
      `round-trip mismatch for ${ALL_MODELS[i].id}`,
    );
  }
}

// ── 2. provider block flattens back onto provider* fields ───────────
{
  const wire = serializeCatalog([ALL_MODELS[0]]);
  const model = wire.response.models[0];
  assert.strictEqual(model.provider.id, ALL_MODELS[0].provider);
  assert.strictEqual(model.provider.name, ALL_MODELS[0].providerName);
  assert.strictEqual(model.provider.color, ALL_MODELS[0].providerColor);
  assert.strictEqual(model.provider.label, ALL_MODELS[0].providerLabel);
  const [back] = deserializeCatalog(wire);
  assert.strictEqual(back.provider, ALL_MODELS[0].provider);
  assert.strictEqual(back.providerName, ALL_MODELS[0].providerName);
}

// ── 3. badges ⇄ badge ────────────────────────────────────────────────
{
  const badged = ALL_MODELS.find((m) => m.badge?.length);
  assert.ok(badged, 'expected at least one badged model in the bundled catalog');
  const wire = serializeCatalog([badged]);
  assert.deepStrictEqual(wire.response.models[0].badges, badged.badge);
  const [back] = deserializeCatalog(wire);
  assert.deepStrictEqual(back.badge, badged.badge);
}

// ── 4. every descriptor kind is represented and survives ────────────
{
  const kinds = new Set<string>();
  for (const model of ALL_MODELS) {
    for (const entry of Object.values(model.paramConfig)) kinds.add(entry.descriptor.kind);
  }
  for (const kind of ['enum', 'catalog', 'range', 'boolean', 'text', 'file', 'object']) {
    assert.ok(kinds.has(kind), `bundled catalog lost coverage of descriptor kind "${kind}"`);
  }
}

// ── 5. object params keep flat fields + additionalProperties ────────
{
  const withObject = ALL_MODELS.find((m) =>
    Object.values(m.paramConfig).some((e) => e.descriptor.kind === 'object'),
  );
  assert.ok(withObject, 'expected a model with an object param');
  const [back] = deserializeCatalog(serializeCatalog([withObject]));
  const key = Object.entries(withObject.paramConfig).find(
    ([, e]) => e.descriptor.kind === 'object',
  )![0];
  assert.deepStrictEqual(back.paramConfig[key], stripCatalogOptions(withObject.paramConfig[key]));
}

function stripCatalogOptions(entry: (typeof ALL_MODELS)[number]['paramConfig'][string]) {
  const { catalogOptions: _dropped, ...rest } = entry;
  return rest;
}

// ── 6. file bounds all round-trip ────────────────────────────────────
{
  const BOUNDS = ['minPixels', 'minSidePixels', 'maxShortSidePixels', 'maxDurationSec', 'maxBytes'] as const;
  for (const bound of BOUNDS) {
    const model = ALL_MODELS.find((m) =>
      Object.values(m.paramConfig).some(
        (e) => e.descriptor.kind === 'file' && bound in e.descriptor,
      ),
    );
    assert.ok(model, `no bundled model exercises file bound "${bound}"`);
    const [back] = deserializeCatalog(serializeCatalog([model]));
    const [key, entry] = Object.entries(model.paramConfig).find(
      ([, e]) => e.descriptor.kind === 'file' && bound in e.descriptor,
    )!;
    assert.deepStrictEqual(
      (back.paramConfig[key].descriptor as unknown as Record<string, unknown>)[bound],
      (entry.descriptor as unknown as Record<string, unknown>)[bound],
      `file bound ${bound} lost on ${model.id}.${key}`,
    );
  }
}

// ── 7. constraints pass through verbatim ─────────────────────────────
{
  const constrained = ALL_MODELS.find((m) => m.constraints?.length);
  assert.ok(constrained, 'expected a model with constraints');
  const [back] = deserializeCatalog(serializeCatalog([constrained]));
  assert.deepStrictEqual(back.constraints, constrained.constraints);
}

// ── 8. routing-less wire model gets workflow '' ──────────────────────
{
  const wire = serializeCatalog([ALL_MODELS[0]]);
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

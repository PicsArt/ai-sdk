/**
 * Picsart Remove Background (pcp/v2/sod) — the task picks the SOD build from
 * its config card, so the payload names no model.
 */
import assert from 'node:assert';
import { resolveModel } from '../../src/core/resolve.ts';
import { PicsartSodV82 } from '../../src/generated/model-constants.ts';

const def = resolveModel(PicsartSodV82);

assert.strictEqual(def.workflow, 'pcp/v2/sod');

const payload = def.buildPayload!({ prompt: '', imageUrls: ['https://cdn/in.png'] }) as Record<string, unknown>;
assert.deepStrictEqual(payload, { photo: 'https://cdn/in.png', postprocess_image: true });
assert.ok(!('model' in payload), 'v8.2 is the default config card; no model is sent');

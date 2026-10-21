/**
 * Seedance 2.5 base entries with an explicit `omniReferenceTaskType`. `edit`
 * and `extend` are the same vendor modes the -video-edit / -video-extend
 * entries build, and carry the same rules: both require an adaptive ratio,
 * and an edit's length follows its source (`duration: -1`). The vendor
 * refuses anything else only after the task was created — a prod app sent
 * `edit` with the clip's length and every generation failed at /result with
 * bytedance_invalid_parameter. These checks pin the lock on the wire and in
 * the constrained params a UI reads.
 */
import assert from 'node:assert';
import { prepareRequest } from '../../src/client/prepare.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import { Model } from '../../src/core/descriptors/model-accessor.ts';

const BASE_ENTRIES = ['seedance-2.5', 'seedance-2.5-without-moderation'] as const;

type RequestParams = Parameters<typeof prepareRequest>[1];
const request = (id: string, extra: Record<string, unknown>) =>
  prepareRequest(resolveModel(id), {
    prompt: 'swap the jacket for the one in the reference image',
    imageUrls: ['https://cdn/ref.png'],
    videoUrls: ['https://cdn/in.mp4'],
    aspectRatio: '9:16',
    duration: 7,
    ...extra,
  } as RequestParams).payload;

/** The picker's values for one task type. Built outside the call so the extra
 *  key passes: GenerationContext predates per-model inputs. */
const valuesFor = (omniReferenceTaskType: string) => {
  const values = { prompt: 'p', omniReferenceTaskType };
  return values;
};

const enabledIds = (options: ReadonlyArray<{ id: unknown; disabled?: boolean }> | undefined) =>
  (options ?? []).filter((o) => !o.disabled).map((o) => o.id);

for (const id of BASE_ENTRIES) {
  // ── Wire: edit sends what the -video-edit entry hardcodes ────────
  {
    const payload = request(id, { omniReferenceTaskType: 'edit' });
    assert.strictEqual(payload.ratio, 'adaptive', `${id}: edit forces adaptive`);
    assert.strictEqual(payload.duration, -1, `${id}: edit's length follows its source`);
    assert.strictEqual(payload.omni_reference_task_type, 'edit', `${id}: task type still sent`);
  }

  // ── Wire: extend locks the ratio and keeps the caller's duration ─
  {
    const payload = request(id, { omniReferenceTaskType: 'extend' });
    assert.strictEqual(payload.ratio, 'adaptive', `${id}: extend forces adaptive`);
    assert.strictEqual(payload.duration, 7, `${id}: extend duration is the caller's`);
  }

  // ── Wire: every other task type is unchanged ────────────────────
  for (const taskType of ['reference', 'auto', undefined]) {
    const payload = request(id, { omniReferenceTaskType: taskType });
    assert.strictEqual(payload.ratio, '9:16', `${id}/${taskType}: caller's ratio`);
    assert.strictEqual(payload.duration, 7, `${id}/${taskType}: caller's duration`);
  }

  // ── Constrained params: what a picker may offer ─────────────────
  {
    const edit = Model(id).paramsFor(valuesFor('edit'));
    assert.deepStrictEqual(enabledIds(edit.aspectRatio()?.options), ['adaptive'], `${id}: edit ratio`);
    const duration = edit.duration();
    assert.ok(duration && duration.kind === 'enum', `${id}: duration stays an enum`);
    assert.deepStrictEqual(enabledIds(duration.options), [-1], `${id}: edit duration`);

    const extend = Model(id).paramsFor(valuesFor('extend'));
    assert.deepStrictEqual(enabledIds(extend.aspectRatio()?.options), ['adaptive'], `${id}: extend ratio`);
    const extendDuration = extend.duration();
    assert.ok(extendDuration && extendDuration.kind === 'enum');
    assert.ok(enabledIds(extendDuration.options).length > 1, `${id}: extend duration stays a choice`);

    const reference = Model(id).paramsFor(valuesFor('reference'));
    assert.ok(enabledIds(reference.aspectRatio()?.options).length > 1, `${id}: reference ratio is free`);
  }
}

console.log('✓ seedance-task-type.test.ts — all passed');

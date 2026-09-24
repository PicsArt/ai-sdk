/**
 * Seedance 2.5 Draft mode — `draft` (every 2.5 entry) renders a 480p preview
 * whose result carries a signed `draftTask`, and `draftTask` (the base 2.5
 * entries) renders the final 1080p video from it. These checks pin the wire
 * shape of both steps, that the draft reference round-trips unchanged, and
 * that nothing a caller sends is silently dropped: what a step cannot take
 * goes on the wire for the vendor to refuse (the worker
 * passes it through).
 */
import assert from 'node:assert';
import { parseResult, prepareRequest } from '../../src/client/prepare.ts';
import { resolveModel } from '../../src/core/resolve.ts';
import { Model } from '../../src/core/descriptors/model-accessor.ts';
import type { WorkflowStatusResult } from '../../src/core/workflow.ts';

const DRAFT_TASK = { id: 'cgt-20260923200602-t2ift', video_input: true, signature: 'sig-abc' };

const SEEDANCE_25_ENTRIES = [
  { id: 'seedance-2.5', alias: 'seedance_2_5' },
  { id: 'seedance-2.5-without-moderation', alias: 'seedance_2_5_without_moderation' },
  { id: 'seedance-2.5-video-edit', alias: 'seedance_2_5' },
  { id: 'seedance-2.5-without-moderation-video-edit', alias: 'seedance_2_5_without_moderation' },
  { id: 'seedance-2.5-video-extend', alias: 'seedance_2_5' },
  { id: 'seedance-2.5-without-moderation-video-extend', alias: 'seedance_2_5_without_moderation' },
] as const;

/** Each entry's own required inputs, so a request validates. */
const baseInput = (id: string): Record<string, unknown> => {
  if (id.endsWith('-video-edit')) return { prompt: 'make it watercolor', videoUrl: 'https://cdn/in.mp4' };
  if (id.endsWith('-video-extend')) return { prompt: 'keep going', videoUrls: ['https://cdn/in.mp4'] };
  return { prompt: 'a red fox trotting through snow' };
};

/** prepareRequest takes the loose GenerationContext, which predates per-model
 *  inputs and has no draft params; the model's own ModelInput has them. */
type RequestParams = Parameters<typeof prepareRequest>[1];
const request = (id: string, extra: Record<string, unknown> = {}) =>
  prepareRequest(resolveModel(id), { ...baseInput(id), ...extra } as RequestParams).payload;

const completed = (result: unknown): WorkflowStatusResult<unknown> => ({
  handle: { id: 'job-1' },
  status: 'COMPLETED',
  result,
  raw: result,
} as unknown as WorkflowStatusResult<unknown>);

// ── Regular requests are unchanged: no draft on the wire ───────────
{
  for (const { id } of SEEDANCE_25_ENTRIES) {
    const payload = request(id);
    assert.strictEqual(payload.draft, undefined, `${id}: no draft by default`);
    assert.strictEqual(payload.resolution, '1080p', `${id}: default resolution`);
    assert.strictEqual(request(id, { draft: false }).draft, undefined, `${id}: draft: false sends nothing`);
  }
}

// ── Step 1: the same request, as a 480p draft ──────────────────────
{
  for (const { id, alias } of SEEDANCE_25_ENTRIES) {
    const regular = request(id);
    const draft = request(id, { draft: true });

    assert.strictEqual(draft.draft, true, `${id}: draft`);
    assert.strictEqual(draft.resolution, '480p', `${id}: drafts render at 480p`);
    assert.strictEqual(draft.model, alias);
    // Everything else is the regular request.
    assert.deepStrictEqual({ ...draft, draft: undefined, resolution: undefined },
      { ...regular, draft: undefined, resolution: undefined }, `${id}: same request otherwise`);

    // The caller's own resolution is sent as-is, not overridden — the worker
    // refuses a draft at anything but 480p (the vendor, via the worker).
    assert.strictEqual(request(id, { draft: true, resolution: '1080p' }).resolution, '1080p', `${id}: not overridden`);
  }
}

// ── Step 2 (base entries): a clean final is only the reference ─────
const BASE_ENTRIES = SEEDANCE_25_ENTRIES.slice(0, 2);
{
  for (const { id, alias } of BASE_ENTRIES) {
    // The prompt is optional on the base entries, so a clean final validates.
    assert.strictEqual(resolveModel(id).paramConfig.prompt?.required, false, `${id}: prompt optional`);

    const clean = prepareRequest(resolveModel(id), { draftTask: DRAFT_TASK } as RequestParams).payload;
    assert.deepStrictEqual(clean, {
      model: alias,
      content: [{ type: 'draft_task', draft_task: DRAFT_TASK }],
      resolution: '1080p',
      output_format: 'mp4',
    }, `${id}: final wire shape`);

    const final = (extra: Record<string, unknown>) =>
      prepareRequest(resolveModel(id), { draftTask: DRAFT_TASK, ...extra } as RequestParams).payload;

    assert.strictEqual(final({ colorDepth: '8bit' }).output_format, 'mp4_8bit', `${id}: 8-bit final`);
    assert.strictEqual(final({ returnLastFrame: true }).return_last_frame, true, `${id}: last frame`);
    assert.strictEqual(final({ outputFormat: 'mov', colorDepth: '8bit' }).output_format, 'mov');

    // Nothing the caller sends is silently dropped: whatever the final
    // reuses from its draft goes on the wire, and the vendor refuses it.
    const noisy = final({
      prompt: 'a red fox',
      imageUrls: ['https://cdn/ref.png'],
      aspectRatio: '9:16',
      duration: 12,
      generateAudio: false,
      resolution: '480p',
      draft: true,
    });
    assert.deepStrictEqual(noisy.content, [
      { type: 'draft_task', draft_task: DRAFT_TASK },
      { type: 'image_url', image_url: { url: 'https://cdn/ref.png' }, role: 'reference_image' },
      { type: 'text', text: 'a red fox' },
    ], `${id}: prompt and media forwarded`);
    assert.strictEqual(noisy.ratio, '9:16');
    assert.strictEqual(noisy.duration, 12);
    assert.strictEqual(noisy.generate_audio, false);
    assert.strictEqual(noisy.resolution, '480p');
    assert.strictEqual(noisy.draft, true);
  }

  // draftTask is declared on the base entries only; a draft made on edit or
  // extend finalizes there (same alias). Passed anyway, it is not swallowed.
  for (const { id } of SEEDANCE_25_ENTRIES.slice(2)) {
    assert.strictEqual(resolveModel(id).paramConfig.draftTask, undefined, `${id}: no draftTask param`);
    const content = request(id, { draftTask: DRAFT_TASK }).content as Array<{ type: string }>;
    assert.strictEqual(content[0].type, 'draft_task', `${id}: forwarded, for the vendor to refuse`);
  }
}

// ── A regular request without a prompt sends no empty text item ────
{
  const imageOnly = prepareRequest(resolveModel('seedance-2.5'), { imageUrls: ['https://cdn/ref.png'] } as RequestParams).payload;
  assert.deepStrictEqual(imageOnly.content, [
    { type: 'image_url', image_url: { url: 'https://cdn/ref.png' }, role: 'reference_image' },
  ]);
}

// ── UI constraints pin each step and disable what a final reuses ──
{
  const model = Model('seedance-2.5');
  const selectable = (entry: ReturnType<ReturnType<typeof model.paramsFor>['resolution']>) =>
    entry?.options.filter((o) => !o.disabled).map((o) => String(o.id));

  assert.deepStrictEqual(selectable(model.paramsFor({}).resolution()), ['480p', '720p', '1080p']);
  assert.deepStrictEqual(selectable(model.paramsFor({ draft: true } as never).resolution()), ['480p']);

  const finalParams = model.paramsFor({ draftTask: DRAFT_TASK } as never);
  assert.deepStrictEqual(selectable(finalParams.resolution()), ['1080p']);
  assert.strictEqual(finalParams.boolean('draft')?.disabled, true);
  assert.strictEqual(finalParams.prompt()?.disabled, true);
  assert.strictEqual(finalParams.aspectRatio()?.disabled, true);
  assert.strictEqual(finalParams.generateAudio()?.disabled, true);
  assert.strictEqual(finalParams.startFrame()?.disabled, true);

  // Edit and extend have the draft toggle, not the final.
  assert.deepStrictEqual(selectable(Model('seedance-2.5-video-edit').paramsFor({ draft: true } as never).resolution()), ['480p']);
}

// ── The draft result exposes the reference, seedance only ──────────
{
  const def = resolveModel('seedance-2.5');
  const result = parseResult(completed({
    video_url: 'https://cdn/draft.mp4',
    draft_task: DRAFT_TASK,
  }), def, undefined);

  assert.strictEqual(result.url, 'https://cdn/draft.mp4');
  assert.deepStrictEqual(result.items[0].metadata?.draftTask, DRAFT_TASK);

  // A regular result carries none.
  assert.strictEqual(
    parseResult(completed({ video_url: 'https://cdn/v.mp4' }), def, undefined).items[0].metadata?.draftTask,
    undefined,
  );

  // A malformed reference is not promoted — passing it on would only be rejected.
  const malformed = parseResult(completed({
    video_url: 'https://cdn/draft.mp4',
    draft_task: { id: 'cgt-1', video_input: 'yes' },
  }), def, undefined);
  assert.strictEqual(malformed.items[0].metadata?.draftTask, undefined);

  // Another vendor echoing the key name does not leak into the typed metadata.
  const other = parseResult(completed({
    video_url: 'https://cdn/other.mp4',
    draft_task: DRAFT_TASK,
  }), resolveModel('flux-3-video'), undefined);
  assert.strictEqual(other.items[0].metadata?.draftTask, undefined);
}

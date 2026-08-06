/**
 * Regression: every Grok video model declares the xAI 4096 prompt cap.
 *
 * All four video models shipped with no prompt limit at all, so an over-long
 * prompt was accepted client-side, submitted, billed, and only then rejected by
 * the vendor with "Prompt length exceeds the maximum allowed length of 4096".
 */
import assert from 'node:assert';
import { Model } from '../../src/core/descriptors/model-accessor.ts';
import { ALL_MODELS } from '../../src/vendors/catalog/index.ts';

const XAI_VIDEO_PROMPT_MAX = 4096;

const videoWorkflows = [
  'x-ai/v1/videos/generations',
  'x-ai/v1/videos/edits',
  'x-ai/v1/videos/extensions',
];

const grokVideoModels = ALL_MODELS.filter(
  (m) => videoWorkflows.includes(m.workflow) && !m.disabled && !m.deprecated,
);

// ── Every Grok video model declares the cap ────────────────────────────
{
  assert.ok(grokVideoModels.length >= 4, 'expected at least 4 Grok video models');

  const undeclared = grokVideoModels.filter((m) => {
    const descriptor = m.paramConfig.prompt?.descriptor;
    return descriptor?.kind !== 'text' || descriptor.maxLength !== XAI_VIDEO_PROMPT_MAX;
  });

  assert.deepStrictEqual(
    undeclared.map((m) => m.id),
    [],
    `Grok video models missing prompt maxLength ${XAI_VIDEO_PROMPT_MAX}`,
  );
}

// ── An over-long prompt is rejected before submit ──────────────────────
// Asserted on the prompt error specifically: some of these models also require
// an image or video input, so a prompt-only input is invalid either way.
{
  const tooLong = 'a'.repeat(XAI_VIDEO_PROMPT_MAX + 1);
  const atLimit = 'a'.repeat(XAI_VIDEO_PROMPT_MAX);
  const isPromptLengthError = (errors: string[] | undefined) =>
    (errors ?? []).some((e) => e.includes('prompt') && e.includes('max length'));

  for (const model of grokVideoModels) {
    assert.ok(
      isPromptLengthError(Model(model.id).validate({ prompt: tooLong }).errors),
      `${model.id}: prompt over ${XAI_VIDEO_PROMPT_MAX} should report a max length error`,
    );
    assert.ok(
      !isPromptLengthError(Model(model.id).validate({ prompt: atLimit }).errors),
      `${model.id}: prompt at exactly ${XAI_VIDEO_PROMPT_MAX} should not report a max length error`,
    );
  }
}

/**
 * Captions.ai (Mirage) catalog entry — offline checks of the wire mapping and
 * the catalog-bound template param.
 */
import assert from 'node:assert';
import { resolveModel } from '../../src/core/resolve.ts';
import { Model } from '../../src/core/descriptors/model-accessor.ts';
import { CaptionsaiVideoCaptions } from '../../src/generated/model-constants.ts';
import { DEFAULT_CAPTION_TEMPLATE_ID } from '../../src/vendors/catalog/captionsai.ts';

const def = resolveModel(CaptionsaiVideoCaptions);

assert.strictEqual(def.provider, 'captionsai');
assert.strictEqual(def.mode, 'video');
assert.strictEqual(def.inputType, 'v2v');
assert.strictEqual(def.modelId, 'mirage-captions', 'pricing key is the vendor model, not the catalog id');
assert.strictEqual(def.workflow, 'captionsai/v1/videos/captions');
assert.strictEqual(def.release, 'preview', 'stage-only until the worker + pricing are live in prod');

// ── paramConfig: required source video with the vendor caps, catalog-bound template ──
const params = Model(CaptionsaiVideoCaptions).params();
const video = params.file('videoUrl');
assert.ok(video?.required, 'source video is required');
assert.strictEqual(video?.maxDurationSec, 300);
assert.strictEqual(video?.maxBytes, 50 * 1024 * 1024);

const template = params.catalog('templateId');
assert.ok(template, 'templateId is a catalog param');
assert.strictEqual(template?.source.workflow, 'captionsai/v1/catalog/caption-templates');
assert.strictEqual(template?.default, DEFAULT_CAPTION_TEMPLATE_ID);
assert.ok(!template?.required, 'templateId is optional on input — the default fills it');
assert.ok(!params.hasParam('prompt'), 'the command has no prompt — none is surfaced');

// ── wire shape: unified names → CaptionsAiVideosCaptionsCommand ──
const payload = def.buildPayload!({
  prompt: '',
  videoUrl: 'https://cdn/in.mp4',
  templateId: 'ctpl_yvE0ZnYzEj6ClCD2ee1f',
}) as Record<string, unknown>;
assert.deepStrictEqual(payload, {
  video: { url: 'https://cdn/in.mp4' },
  caption_template_id: 'ctpl_yvE0ZnYzEj6ClCD2ee1f',
});
assert.ok(!('options' in payload) && !('templateId' in payload) && !('videoUrl' in payload), 'no SDK-only keys leak to the wire');

// Defaults fill the template when the caller omits it.
const defaulted = def.buildPayload!({ prompt: '', videoUrl: 'https://cdn/in.mp4' }) as Record<string, unknown>;
assert.strictEqual(defaulted.caption_template_id, DEFAULT_CAPTION_TEMPLATE_ID);

// Validation: missing source video is rejected; omitting templateId is fine (default applies).
assert.strictEqual(Model(CaptionsaiVideoCaptions).validate({ templateId: 'x' }).valid, false);
assert.strictEqual(Model(CaptionsaiVideoCaptions).validate({ videoUrl: 'https://cdn/in.mp4' }).valid, true);
assert.strictEqual(
  Model(CaptionsaiVideoCaptions).validate({ videoUrl: 'https://cdn/in.mp4', templateId: 'ctpl_x' }).valid,
  true,
);

console.log('✓ captionsai.test.ts — all passed');

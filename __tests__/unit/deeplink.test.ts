import assert from 'node:assert';
import { encodeDeepLinkPayload, decodeDeepLinkPayload } from '../../src/core/deeplink/index.ts';
import { sanitizePrompt, isAllowedUrl } from '../../src/core/deeplink/sanitize.ts';

const CDN = 'https://cdn-cms-uploads.picsart.com/cms-uploads';

// ── 1. sanitizePrompt ───────────────────────────────────────────────

assert.strictEqual(sanitizePrompt('Normal prompt'), 'Normal prompt');
assert.strictEqual(sanitizePrompt('Hello <script>alert("xss")</script> world'), 'Hello alert("xss") world');
assert.strictEqual(sanitizePrompt('<b>bold</b> text'), 'bold text');
assert.strictEqual(sanitizePrompt('<div class="x">content</div>'), 'content');
assert.strictEqual(sanitizePrompt('javascript:void(0)'), 'void(0)');
assert.strictEqual(sanitizePrompt('onclick=steal()'), 'steal()');

// ── 2. isAllowedUrl ─────────────────────────────────────────────────

// Accepts CDN domains over HTTPS
assert.strictEqual(isAllowedUrl('https://cdn.picsart.com/image.jpg'), true);
assert.strictEqual(isAllowedUrl('https://images.picsart.com/photo.png'), true);
assert.strictEqual(isAllowedUrl('https://cdn-picsart.com/asset.webp'), true);
assert.strictEqual(isAllowedUrl('https://static.pastatic.com/file.jpg'), true);
assert.strictEqual(isAllowedUrl(`${CDN}/abc123.png`), true);

// Rejects non-HTTPS and dangerous protocols
assert.strictEqual(isAllowedUrl('http://cdn.picsart.com/image.jpg'), false);
assert.strictEqual(isAllowedUrl('data:image/png;base64,abc'), false);
assert.strictEqual(isAllowedUrl('blob:http://example.com/uuid'), false);
assert.strictEqual(isAllowedUrl('javascript:alert(1)'), false);
assert.strictEqual(isAllowedUrl('file:///etc/passwd'), false);
assert.strictEqual(isAllowedUrl('https://evil.com/image.jpg'), false);
assert.strictEqual(isAllowedUrl('not a url'), false);

// ── 3. encodeDeepLinkPayload + decodeDeepLinkPayload ────────────────

// Basic prompt round-trip
{
  const encoded = encodeDeepLinkPayload('gemini-3-pro-image', { prompt: 'A sunset over mountains' });
  assert(typeof encoded === 'string' && encoded.length > 0);
  const result = decodeDeepLinkPayload(encoded);
  assert(result);
  assert.strictEqual(result.modelId, 'gemini-3-pro-image');
  assert.strictEqual(result.context.prompt, 'A sunset over mountains');
  assert.strictEqual(result.modelKnown, true);
  assert.strictEqual(result.warnings.length, 0);
}

// negativePrompt preserved
{
  const result = decodeDeepLinkPayload(encodeDeepLinkPayload('gemini-3-pro-image', {
    prompt: 'test', negativePrompt: 'blurry, low quality',
  }));
  assert(result);
  assert.strictEqual(result.context.negativePrompt, 'blurry, low quality');
}

// imageUrls preserved (CDN URLs)
{
  const urls = [`${CDN}/img1.jpg`, `${CDN}/img2.png`];
  const result = decodeDeepLinkPayload(encodeDeepLinkPayload('gemini-3-pro-image', {
    prompt: 'edit', imageUrls: urls,
  }));
  assert(result);
  assert.deepStrictEqual(result.context.imageUrls, urls);
}

// videoUrl preserved
{
  const videoUrl = `${CDN}/video.mp4`;
  const result = decodeDeepLinkPayload(encodeDeepLinkPayload('kling-v3-pro', {
    prompt: 'edit video', videoUrl,
  }));
  assert(result);
  assert.strictEqual(result.context.videoUrl, videoUrl);
}

// audioUrl preserved
{
  const audioUrl = `${CDN}/audio.mp3`;
  const result = decodeDeepLinkPayload(encodeDeepLinkPayload('kling-avatar', {
    prompt: 'avatar', audioUrl,
  }));
  assert(result);
  assert.strictEqual(result.context.audioUrl, audioUrl);
}

// Non-default params preserved (aspectRatio, duration)
{
  const result = decodeDeepLinkPayload(encodeDeepLinkPayload('veo-3.1', {
    prompt: 'test', aspectRatio: '9:16',
  }));
  assert(result);
  assert.strictEqual(result.context.aspectRatio, '9:16');
}

{
  const result = decodeDeepLinkPayload(encodeDeepLinkPayload('kling-v3-pro', {
    prompt: 'test', duration: 10,
  }));
  assert(result);
  assert.strictEqual(result.context.duration, 10);
}

// Empty context → minimal payload
{
  const result = decodeDeepLinkPayload(encodeDeepLinkPayload('gemini-3-pro-image', {}));
  assert(result);
  assert.strictEqual(result.modelId, 'gemini-3-pro-image');
  assert.strictEqual(result.context.prompt, undefined);
  assert.strictEqual(result.modelKnown, true);
}

// Unknown model → modelKnown: false, warning, params pass-through
{
  const result = decodeDeepLinkPayload(encodeDeepLinkPayload('nonexistent-model-xyz', {
    prompt: 'test', aspectRatio: '4:3',
  }));
  assert(result);
  assert.strictEqual(result.modelId, 'nonexistent-model-xyz');
  assert.strictEqual(result.modelKnown, false);
  assert(result.warnings.some(w => w.includes('Unknown model')));
  assert.strictEqual(result.context.prompt, 'test');
  assert.strictEqual(result.context.aspectRatio, '4:3');
}

// Mixed valid/invalid imageUrls → only CDN URLs survive
{
  const result = decodeDeepLinkPayload(encodeDeepLinkPayload('gemini-3-pro-image', {
    prompt: 'test',
    imageUrls: [`${CDN}/good.jpg`, 'data:image/png;base64,evil', 'https://evil.com/bad.jpg', `${CDN}/also-good.png`],
  }));
  assert(result);
  assert.deepStrictEqual(result.context.imageUrls, [`${CDN}/good.jpg`, `${CDN}/also-good.png`]);
  assert(result.warnings.length >= 2);
}

// Invalid encoded string → null
assert.strictEqual(decodeDeepLinkPayload('!!!invalid!!!'), null);
assert.strictEqual(decodeDeepLinkPayload(''), null);

console.log('\u2713 deeplink.test.ts \u2014 all passed');

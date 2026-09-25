/**
 * Drive filename extension — offline, no API calls.
 *
 * A saved generation's name must carry the extension of the file the model
 * actually produced (a JPEG saved as `.png` confuses Drive and downstream
 * tools). Pins the hint priority (MIME → URL → requested format → mode
 * default), both naming paths (`drive.buildSaveParams` after the job, and the
 * payload `options.drive.name` before it), and the catalog's declared formats.
 */
import assert from 'node:assert';
import {
  buildFilename,
  createDriveClient,
  expectedOutputFormat,
  resolveExtension,
  type PayloadDriveOptions,
} from '../../src/client/drive.ts';
import { createClient } from '../../src/client/index.ts';
import { getModel } from '../../src/core/model-registry.ts';
import type { SdkTransport, WorkflowSubmitRequest } from '../../src/core/workflow.ts';

const ext = (name: string): string => name.slice(name.lastIndexOf('.') + 1);

// ── Mode defaults (no hints) are unchanged ────────────────────────
assert.strictEqual(resolveExtension('image'), 'png');
assert.strictEqual(resolveExtension('video'), 'mp4');
assert.strictEqual(resolveExtension('audio'), 'mp3');
assert.strictEqual(ext(buildFilename('a cat', 'image')), 'png');
assert.strictEqual(ext(buildFilename(undefined, 'video')), 'mp4');

// ── MIME type wins ────────────────────────────────────────────────
const MIME_CASES: Array<[string, string, string]> = [
  ['image', 'image/jpeg', 'jpg'],
  ['image', 'image/webp', 'webp'],
  ['image', 'IMAGE/JPEG; charset=binary', 'jpg'],
  ['video', 'video/quicktime', 'mov'],
  ['video', 'video/webm', 'webm'],
  ['audio', 'audio/x-wav', 'wav'],
  ['audio', 'audio/mpeg', 'mp3'],
];
for (const [mode, mimeType, expected] of MIME_CASES) {
  assert.strictEqual(resolveExtension(mode, { mimeType }), expected, `${mimeType} → ${expected}`);
}
assert.strictEqual(
  resolveExtension('image', { mimeType: 'image/jpeg', url: 'https://cdn.test/x.png', format: 'webp' }),
  'jpg',
  'MIME type outranks URL and format',
);
assert.strictEqual(
  resolveExtension('image', { mimeType: 'application/octet-stream', url: 'https://cdn.test/x.webp' }),
  'webp',
  'unknown MIME type falls through to the URL',
);

// ── URL path extension (query/fragment stripped) ──────────────────
assert.strictEqual(
  resolveExtension('image', { url: 'https://cdn.picsart.test/b0f5897a-1c2d.jpg?sig=abc&exp=1' }),
  'jpg',
);
assert.strictEqual(resolveExtension('image', { url: 'https://cdn.test/out.JPEG#frag' }), 'jpg');
assert.strictEqual(resolveExtension('video', { url: 'https://cdn.test/a/b/clip.mov' }), 'mov');
assert.strictEqual(
  resolveExtension('image', { url: 'https://cdn.test/files/abc123', format: 'webp' }),
  'webp',
  'extensionless URL falls through to the format',
);
assert.strictEqual(
  resolveExtension('image', { url: 'https://cdn.test/v1.2/abc' }),
  'png',
  'a dot in a directory is not an extension',
);
assert.strictEqual(resolveExtension('image', { url: 'not a url/pic.webp?x=1' }), 'webp', 'unparseable URL still read');

// ── Requested format (vendor spellings normalized) ────────────────
const FORMAT_CASES: Array<[string, string, string]> = [
  ['image', 'jpeg', 'jpg'],
  ['image', 'PNG', 'png'],
  ['image', 'webp', 'webp'],
  ['video', 'mov', 'mov'],
  ['video', 'mp4_8bit', 'mp4'],
  ['audio', 'wav', 'wav'],
  ['audio', 'ogg_opus', 'ogg'],
];
for (const [mode, format, expected] of FORMAT_CASES) {
  assert.strictEqual(resolveExtension(mode, { format }), expected, `format ${format} → ${expected}`);
}
assert.strictEqual(resolveExtension('image', { format: '../etc' }), 'png', 'junk format ignored');

// ── expectedOutputFormat: explicit param → param default → model declaration ─
const gptImage = getModel('gpt-image-2');
assert(gptImage, 'gpt-image-2 is in the catalog');
assert.strictEqual(expectedOutputFormat(gptImage, { prompt: 'x', outputFormat: 'jpeg' }), 'jpeg');
assert.strictEqual(expectedOutputFormat(gptImage, { prompt: 'x' }), 'png', 'catalog default used when unset');
assert.strictEqual(
  expectedOutputFormat({ paramConfig: {} }, { prompt: 'x', output_format: 'webp' }),
  'webp',
  'snake_case wire name honored',
);
assert.strictEqual(expectedOutputFormat({ paramConfig: {} }, { prompt: 'x' }), undefined);
assert.strictEqual(expectedOutputFormat({ paramConfig: {}, outputExtension: 'jpg' }, { prompt: 'x' }), 'jpg');

const sana = getModel('picsart-sana-sprint-v1');
assert(sana, 'picsart-sana-sprint-v1 is in the catalog');
assert.strictEqual(sana.outputExtension, 'jpg', 'SANA-Sprint declares its JPEG output');

// ── drive.buildSaveParams names the file after the result URL ─────
const drive = createDriveClient((async () => new Response('{}')) as never, 'https://api.test', 'AI');
const saved = drive.buildSaveParams(
  'https://cdn.test/b0f5897a-1c2d.jpg',
  'picsart-sana-sprint-v1',
  'Picsart SANA-Sprint',
  'image',
  'A red paper boat on a calm blue lake at sunrise',
);
assert.match(saved.name, /^a-red-paper-boat-on-a-calm-blue-lake-at-sunrise-\d{6}\.jpg$/);
assert.strictEqual(saved.resourceType, 'PHOTO');

// ── Payload options.drive.name (named before the job runs) ────────
function capturingTransport() {
  const payloads: Record<string, unknown>[] = [];
  const transport: SdkTransport = {
    async execute(request: WorkflowSubmitRequest) {
      payloads.push(request.payload as Record<string, unknown>);
      return { result: { url: 'https://cdn.test/out.bin' } };
    },
  };
  return { transport, payloads };
}
const driveName = (payload: Record<string, unknown> | undefined): string =>
  ((payload?.options as Record<string, unknown>)?.drive as PayloadDriveOptions).name;
const perCallDrive = { drive: { folder: { path: 'AI' } } as unknown as PayloadDriveOptions };

{
  const { transport, payloads } = capturingTransport();
  const ai = createClient({ transport });
  await ai.generate('picsart-sana-sprint-v1', { prompt: 'a red paper boat' }, perCallDrive);
  assert.strictEqual(ext(driveName(payloads[0])), 'jpg', 'SANA-Sprint saves as .jpg');
}
{
  const { transport, payloads } = capturingTransport();
  const ai = createClient({ transport });
  await ai.generate('gpt-image-2', { prompt: 'a cat', outputFormat: 'webp' }, perCallDrive);
  assert.strictEqual(ext(driveName(payloads[0])), 'webp', 'requested outputFormat names the file');
}
{
  const { transport, payloads } = capturingTransport();
  const ai = createClient({ transport });
  await ai.generate('flux-2-pro', { prompt: 'a cat' }, perCallDrive);
  assert.strictEqual(ext(driveName(payloads[0])), 'png', 'no format known keeps the mode default');
}
{
  const { transport, payloads } = capturingTransport();
  const ai = createClient({ transport });
  await ai.generate(
    'picsart-sana-sprint-v1',
    { prompt: 'x' },
    { drive: { name: 'keep-me.png' } as PayloadDriveOptions },
  );
  assert.strictEqual(driveName(payloads[0]), 'keep-me.png', 'an explicit name is never rewritten');
}

console.log('drive-filename.test.ts: OK');

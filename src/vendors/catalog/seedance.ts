/**
 * Seedance — single source of truth.
 * GOTCHA: resolution is '720p' NOT 'p_720'.
 *
 * Worker `seedance` command dispatches operation by content roles:
 *  - text + (first_frame|last_frame|reference_image) → image-to-video.* toolId
 *  - text + reference_video                          → video-to-video.* toolId
 * That's why -video-edit entries share `workflow: 'seedance'` with the base
 * cards but differ in payload construction.
 */
import type { Constraint, GenerationContext, PayloadBuilder } from '../../core/types.ts';
import type { SeedanceDraftTask } from '../../core/response.ts';
import type { AudioBounds, ImageBounds, VideoBounds } from '../define.ts';
import { defineModels, feat, params } from '../define.ts';
import { p } from '../../core/descriptors/presets.ts'; // p for output_format enum, not exposed via params.*

/** Seedance 2.0 / 2.0 Fast constraints:
 *  - audio-only content rejected by backend (need at least one image or video role)
 *  - reference images / videos / audios are mutually exclusive with start/end
 *    frame slots (backend rejects mixed first_frame + reference_* content).
 */
const SEEDANCE_FRAME_REF_REASON = 'Start/End frames cannot be combined with reference images, videos, or audios';
/** Vendor floor on each side of a reference image or video: width and height
 *  must each land in [300, 6000] px. From ModelArk "Create a video generation
 *  task", content.image_url.url → "Requirements for uploading a single image";
 *  applies to every Seedance model. The matching ceiling is 6000 px per side. */
const SEEDANCE_MIN_SIDE_PIXELS = 300;
const SEEDANCE_MAX_SIDE_PIXELS = 6_000;
/** Aspect-ratio window (width / height) for every image and video input: the
 *  third half of the same vendor rule, and not implied by the side and pixel
 *  bounds above, since a 6000x1200 frame satisfies both and is still refused.
 *
 *  The floor is declared at 0.39 rather than 0.40 because the vendor moved it.
 *  Both figures appear in its rejection text: "expected the aspect ratio to be
 *  between 0.40 and 2.50" ran daily to 2026-09-14 and then stopped, while the
 *  0.39 wording started on 09-09 and is the whole of 09-15 and 09-16. 0.39 is
 *  also the looser of the two, so declaring it cannot refuse a file the vendor
 *  would have taken. */
const SEEDANCE_MIN_ASPECT_RATIO = 0.39;
const SEEDANCE_MAX_ASPECT_RATIO = 2.5;
/** Vendor ceiling on an input IMAGE's total pixel count: "image exceeds the
 *  maximum allowed total pixels ... maximum allowed: 36000000". Images have no
 *  pixel FLOOR stated as an area, only the per-side one above. */
const SEEDANCE_MAX_IMAGE_PIXELS = 36_000_000;
/** Vendor floor on a reference VIDEO's total pixel count: width × height must
 *  land in [614×664 = 407,696 , 3326×2494 = 8,295,044]. Videos only. This is
 *  the rule behind "video pixel count ... must be greater than or equal to
 *  407696", and it was previously (and wrongly) applied to image slots too. */
const SEEDANCE_VIDEO_MIN_PIXELS = 407_696;
const SEEDANCE_VIDEO_MAX_PIXELS = 8_295_044;
/** Shortest single reference clip the vendor accepts, video or audio: "the
 *  parameter video duration (seconds) ... must be greater than or equal to
 *  1.8". The one bound with no remedy: a clip cannot be made longer. */
const SEEDANCE_MIN_MEDIA_SEC = 1.8;
/** Vendor caps a reference video at 60 fps: "the parameter video frame rate
 *  ... must be less than or equal to 60". */
const SEEDANCE_MAX_FRAME_RATE = 60;
/** Vendor caps each video file at 200 MiB: "the parameter video size (bytes)
 *  specified in the request must be less than or equal to 209715200 for model
 *  dreamina-seedance-2-5 in r2v". Observed on the 2.5 reference-video path; the
 *  2.5 edit / extend modes post the same `reference_video` role to the same
 *  vendor model, so the cap is declared for all three. */
const SEEDANCE_MAX_VIDEO_BYTES = 209_715_200;
/** Vendor floor on a START or END frame's total pixel count, and a different
 *  rule from the reference-image floor above: "the parameter image pixel count
 *  ... must be greater than or equal to 90000 for model dreamina-seedance-2-5"
 *  in `i2v` and `flf2v`, the two task types a frame produces. */
const SEEDANCE_FRAME_MIN_PIXELS = 90_000;
/** Vendor caps each input image at 30 MiB: "the request failed because the size
 *  of the input image (<n> MiB) exceeds the limit (30 MiB)". */
const SEEDANCE_MAX_IMAGE_BYTES = 31_457_280;
/** Vendor caps each reference audio at 15 MiB: "the parameter audio size
 *  (bytes) specified in the request must be less than or equal to 15728640". */
const SEEDANCE_MAX_AUDIO_BYTES = 15_728_640;
/** Longest single reference video or audio clip, per family. The vendor's own
 *  figure is 30.2 s / 15.2 s ("the parameter video duration (seconds) ... must
 *  be less than or equal to 30.2 for model dreamina-seedance-2-5 in r2v"), but
 *  our own seedance worker already refuses the COMBINED length of the array at
 *  a flat 30 / 15 s. Declaring the vendor's 30.2 would wave a 30.1 s clip past
 *  the client only for the worker to reject it, so declare the number both
 *  gates agree on. */
const SEEDANCE_25_MAX_MEDIA_SEC = 30;
const SEEDANCE_20_MAX_MEDIA_SEC = 15;

/** Upload-time bounds per slot kind. Every number is the vendor's own, read off
 *  its `400` text; see the constants above for the quoted rule each comes from.
 *  Declaring them is what turns an oversized attachment into a trim/crop prompt
 *  in the composer instead of a vendor rejection after the user pressed
 *  Generate (finding F7 on the generation-failure board: 712 devices in 30 days
 *  hit a rule the client could already have enforced). */
const SEEDANCE_IMAGE_BOUNDS: ImageBounds = {
  minAspectRatio: SEEDANCE_MIN_ASPECT_RATIO,
  maxAspectRatio: SEEDANCE_MAX_ASPECT_RATIO,
  minSidePixels: SEEDANCE_MIN_SIDE_PIXELS,
  maxSidePixels: SEEDANCE_MAX_SIDE_PIXELS,
  maxPixels: SEEDANCE_MAX_IMAGE_PIXELS,
  maxBytes: SEEDANCE_MAX_IMAGE_BYTES,
};
const SEEDANCE_FRAME_BOUNDS: ImageBounds = {
  minAspectRatio: SEEDANCE_MIN_ASPECT_RATIO,
  maxAspectRatio: SEEDANCE_MAX_ASPECT_RATIO,
  minPixels: SEEDANCE_FRAME_MIN_PIXELS,
  maxPixels: SEEDANCE_MAX_IMAGE_PIXELS,
  minSidePixels: SEEDANCE_MIN_SIDE_PIXELS,
  maxSidePixels: SEEDANCE_MAX_SIDE_PIXELS,
  maxBytes: SEEDANCE_MAX_IMAGE_BYTES,
};
const SEEDANCE_25_VIDEO_BOUNDS: VideoBounds = {
  minAspectRatio: SEEDANCE_MIN_ASPECT_RATIO,
  maxAspectRatio: SEEDANCE_MAX_ASPECT_RATIO,
  minPixels: SEEDANCE_VIDEO_MIN_PIXELS,
  maxPixels: SEEDANCE_VIDEO_MAX_PIXELS,
  minSidePixels: SEEDANCE_MIN_SIDE_PIXELS,
  maxSidePixels: SEEDANCE_MAX_SIDE_PIXELS,
  maxBytes: SEEDANCE_MAX_VIDEO_BYTES,
  minDurationSec: SEEDANCE_MIN_MEDIA_SEC,
  maxDurationSec: SEEDANCE_25_MAX_MEDIA_SEC,
  maxFrameRate: SEEDANCE_MAX_FRAME_RATE,
};
const SEEDANCE_20_VIDEO_BOUNDS: VideoBounds = {
  minAspectRatio: SEEDANCE_MIN_ASPECT_RATIO,
  maxAspectRatio: SEEDANCE_MAX_ASPECT_RATIO,
  minPixels: SEEDANCE_VIDEO_MIN_PIXELS,
  maxPixels: SEEDANCE_VIDEO_MAX_PIXELS,
  minSidePixels: SEEDANCE_MIN_SIDE_PIXELS,
  maxSidePixels: SEEDANCE_MAX_SIDE_PIXELS,
  maxBytes: SEEDANCE_MAX_VIDEO_BYTES,
  minDurationSec: SEEDANCE_MIN_MEDIA_SEC,
  maxDurationSec: SEEDANCE_20_MAX_MEDIA_SEC,
  maxFrameRate: SEEDANCE_MAX_FRAME_RATE,
};
const SEEDANCE_25_AUDIO_BOUNDS: AudioBounds = {
  minDurationSec: SEEDANCE_MIN_MEDIA_SEC,
  maxDurationSec: SEEDANCE_25_MAX_MEDIA_SEC,
  maxBytes: SEEDANCE_MAX_AUDIO_BYTES,
};
const SEEDANCE_20_AUDIO_BOUNDS: AudioBounds = {
  minDurationSec: SEEDANCE_MIN_MEDIA_SEC,
  maxDurationSec: SEEDANCE_20_MAX_MEDIA_SEC,
  maxBytes: SEEDANCE_MAX_AUDIO_BYTES,
};
const seedance20Constraints: Constraint[] = [
  {
    when: {
      imageUrls:  { exists: false },
      videoUrls:  { exists: false },
      startFrame: { exists: false },
      endFrame:   { exists: false },
    },
    then: {
      audioUrls: {
        disabled: true,
        reason: 'Audio cannot be the only modal input — add an image or video.',
      },
    },
  },
  // refs → frames disabled
  { when: { imageUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    endFrame:   { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
  } },
  { when: { videoUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    endFrame:   { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
  } },
  { when: { audioUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    endFrame:   { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
  } },
  // frames → refs disabled (mirror, so UI blocks the inverse order too)
  { when: { startFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    videoUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    audioUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
  } },
  { when: { endFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    videoUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    audioUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
  } },
];

/** 1.5 Pro T2V — content array with optional first_frame image + text. */
export const buildSeedance15ProPayload: PayloadBuilder = (ctx) => ({
  model: 'seedance_1_5_pro',
  content: [
    ...(ctx.startFrame
      ? [{ type: 'image_url', image_url: { url: ctx.startFrame }, role: 'first_frame' }]
      : []),
    ...(ctx.endFrame
      ? [{ type: 'image_url', image_url: { url: ctx.endFrame }, role: 'last_frame' }]
      : []),
    { type: 'text', text: ctx.prompt },
  ],
  ratio: ctx.aspectRatio ?? '16:9',
  duration: ctx.duration ?? 5,
  resolution: ctx.resolution ?? '720p',
  generate_audio: ctx.generateAudio ?? false,
  ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
});

/** I2V — content array with required first_frame image + text. */
export const buildSeedanceI2VPayload: PayloadBuilder = (ctx) => ({
  model: 'seedance_1_0_pro',
  content: [
    ...(ctx.startFrame ? [{ type: 'image_url', image_url: { url: ctx.startFrame }, role: 'first_frame' }] : []),
    ...(ctx.endFrame
      ? [{ type: 'image_url', image_url: { url: ctx.endFrame }, role: 'last_frame' }]
      : []),
    { type: 'text', text: ctx.prompt },
  ],
  ratio: ctx.aspectRatio ?? '16:9',
  duration: ctx.duration ?? 5,
  resolution: ctx.resolution ?? '720p',
  ...(ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}),
});

/** Worker aliases sharing the Seedance 2.0 request shape.
 *  `seedance_2_0_without_moderation` is the same model as `seedance_2_0` on a
 *  vendor endpoint with moderation disabled — full capability parity, bills
 *  under the `seedance-2.0` pricing key. */
type Seedance20Alias =
  | 'seedance_2_0'
  | 'seedance_2_0_without_moderation'
  | 'seedance_2_0_fast'
  | 'seedance_2_0_mini';

/** Seedance 2.0 / 2.0 Fast — text-to-video / image-to-video / multimodal refs.
 *  Each backend role on its own paramConfig field:
 *  - imageUrls[]  (max 9) → reference_image roles
 *  - videoUrls[]  (max 3, ≤15s total) → reference_video roles
 *  - audioUrls[]  (max 3, ≤15s total) → reference_audio roles
 *  - startFrame                       → first_frame role
 *  - endFrame                         → last_frame role
 *  T2V vs I2V is determined by the worker from content; image/video/audio
 *  reference flows all route to `image-to-video.*` toolId. Constraint:
 *  last_frame must be paired with first_frame OR a reference_image (worker
 *  rejects last_frame alone). */
export const buildSeedance20PayloadFor =
  (modelAlias: Seedance20Alias): PayloadBuilder =>
  (ctx) => {
    const refImages = ctx.imageUrls ?? [];
    const refVideos = ctx.videoUrls ?? [];
    const refAudios = ctx.audioUrls ?? [];

    return {
      model: modelAlias,
      content: [
        ...(ctx.startFrame
          ? [{ type: 'image_url', image_url: { url: ctx.startFrame }, role: 'first_frame' }]
          : []),
        ...refImages.map((url) => ({
          type: 'image_url',
          image_url: { url },
          role: 'reference_image',
        })),
        ...refVideos.slice(0, 3).map((url) => ({
          type: 'video_url',
          video_url: { url },
          role: 'reference_video',
        })),
        ...refAudios.slice(0, 3).map((url) => ({
          type: 'audio_url',
          audio_url: { url },
          role: 'reference_audio',
        })),
        ...(ctx.endFrame
          ? [{ type: 'image_url', image_url: { url: ctx.endFrame }, role: 'last_frame' }]
          : []),
        { type: 'text', text: ctx.prompt },
      ],
      ratio: ctx.aspectRatio ?? '16:9',
      duration: ctx.duration ?? 10,
      resolution: ctx.resolution ?? '720p',
      generate_audio: ctx.generateAudio ?? true,
      ...(ctx.returnLastFrame ? { return_last_frame: true } : {}),
    };
  };

/** Seedance 2.0 / 2.0 Fast — video edit / multimodal reference.
 *  Required: reference_video (enforced by `videoInput` paramConfig). Optional: up to 9 reference_image.
 *  Worker routes to `video-to-video.*` toolId because content includes a video_url. */
export const buildSeedance20VideoEditPayloadFor =
  (modelAlias: Seedance20Alias): PayloadBuilder =>
  (ctx) => ({
    model: modelAlias,
    content: [
      { type: 'text', text: ctx.prompt },
      { type: 'video_url', video_url: { url: ctx.videoUrl }, role: 'reference_video' },
      ...(ctx.imageUrls ?? []).slice(0, 9).map((url) => ({
        type: 'image_url',
        image_url: { url },
        role: 'reference_image',
      })),
    ],
    ratio: ctx.aspectRatio ?? '16:9',
    duration: ctx.duration ?? 5,
    resolution: ctx.resolution ?? '720p',
    generate_audio: ctx.generateAudio ?? true,
    ...(ctx.returnLastFrame ? { return_last_frame: true } : {}),
  });

/** Seedance 2.0 / 2.0 Fast — video extend / multi-clip stitching.
 *  Per BytePlus official tutorial (ModelArk/2291680 "Extend video"): pass 2-3
 *  `reference_video` items; prompt references them as [video 1], [video 2], …
 *  to stitch / extend forward or backward.
 *  Worker routes to `video-to-video.*` toolId (same as edit) because content
 *  includes video_url roles. Uses `videoUrls[]` instead of single `videoUrl`. */
export const buildSeedance20VideoExtendPayloadFor =
  (modelAlias: Seedance20Alias): PayloadBuilder =>
  (ctx) => ({
    model: modelAlias,
    content: [
      { type: 'text', text: ctx.prompt },
      ...(ctx.videoUrls ?? []).slice(0, 3).map((url) => ({
        type: 'video_url',
        video_url: { url },
        role: 'reference_video',
      })),
    ],
    ratio: ctx.aspectRatio ?? 'adaptive',
    duration: ctx.duration ?? 15,
    resolution: ctx.resolution ?? '720p',
    generate_audio: ctx.generateAudio ?? true,
  });

/** Color depth is a choice in exactly one case: 1080p in the mp4 container —
 *  the only output the vendor renders as 10-bit H.265/HEVC, which the worker can
 *  re-encode to 8-bit H.264. 480p and 720p already arrive 8-bit and mov has no
 *  8-bit variant, so the param is constrained away there instead of being
 *  offered as a no-op. `when` supports equality only, hence one rule per lower
 *  resolution. */
const SEEDANCE_25_DEPTH_RESOLUTION_REASON =
  'Color depth applies to 1080p only — 480p and 720p are always 8-bit.';
const SEEDANCE_25_DEPTH_CONTAINER_REASON = 'Color depth applies to the mp4 container only.';
const seedance25ColorDepthConstraints: Constraint[] = [
  ...['480p', '720p'].map((resolution) => ({
    when: { resolution: { is: resolution } },
    then: { colorDepth: { disabled: true as const, reason: SEEDANCE_25_DEPTH_RESOLUTION_REASON } },
  })),
  {
    when: { outputFormat: { is: 'mov' } },
    then: { colorDepth: { disabled: true, reason: SEEDANCE_25_DEPTH_CONTAINER_REASON } },
  },
];

/** Seedance 2.5 — same v2 request shape as 2.0, with three differences:
 *  - audio-only input IS allowed (2.5 lifts the "need an image or video" rule),
 *    so we reuse the 2.0 constraints minus the leading audio-only block.
 *  - wider content limits (30 images / 10 videos / 10 audios).
 *  - new `output_format` (mp4/mov/mp4_8bit) parameter, sent on every 2.5 flow;
 *    the catalog splits it into `outputFormat` + `colorDepth`.
 *  Resolution goes up to 1080p (no 4k).
 *  The trailing rule enforces last_frame pairing: the vendor rejects a
 *  last_frame supplied on its own, and refs are already mutually exclusive
 *  with endFrame above, so endFrame is only valid alongside a startFrame. */
const SEEDANCE_25_FRAME_ADAPTIVE_REASON =
  'First/Last Frame mode requires an adaptive aspect ratio — the vendor rejects any fixed ratio.';
const seedance25Constraints: Constraint[] = [
  ...seedance20Constraints.slice(1),
  {
    when: { startFrame: { exists: false } },
    then: {
      endFrame: {
        disabled: true,
        reason: 'End frame needs a start frame — a last frame on its own is rejected.',
      },
    },
  },
  // First/Last Frame mode: aspect ratio is locked to 'adaptive' (vendor errors
  // on any fixed ratio when a first_frame/last_frame is supplied).
  {
    when: { startFrame: { exists: true } },
    then: { aspectRatio: { allowed: ['adaptive'], reason: SEEDANCE_25_FRAME_ADAPTIVE_REASON } },
  },
  {
    when: { endFrame: { exists: true } },
    then: { aspectRatio: { allowed: ['adaptive'], reason: SEEDANCE_25_FRAME_ADAPTIVE_REASON } },
  },
  ...seedance25ColorDepthConstraints,
];

/** Worker aliases sharing the Seedance 2.5 request shape.
 *  `seedance_2_5_without_moderation` is the same model as `seedance_2_5` on a
 *  vendor endpoint with moderation disabled — full capability parity, bills
 *  under the `seedance-2.5` pricing key. */
type Seedance25Alias = 'seedance_2_5' | 'seedance_2_5_without_moderation';

/** The worker takes container and color depth in one field: 'mp4_8bit' is its
 *  8-bit re-encode of the mp4, so the depth only applies to mp4. Below 1080p the
 *  worker accepts 'mp4_8bit' and skips the re-encode (that output is already
 *  8-bit), so no resolution check is needed here. */
const seedance25OutputFormat = (ctx: GenerationContext): string => {
  if (ctx.outputFormat === 'mov') return 'mov';
  return ctx.colorDepth === '8bit' ? 'mp4_8bit' : 'mp4';
};

/** Seedance 2.5 Draft mode:
 *  - `draft: true` (every 2.5 entry) renders a cheap 480p preview of the same
 *    request (scene structure, shots, motion); its result carries
 *    `metadata.draftTask`.
 *  - `draftTask` (the base `seedance-2.5` / `-without-moderation` entries) —
 *    that object, passed back unchanged within 7 days — renders the final
 *    1080p video from the draft instead of a new generation.
 *  The final reuses the draft's prompt, inputs, ratio, duration and audio.
 *  Whatever of those the caller still sends is passed through as-is, not
 *  dropped: the worker hands it to the vendor, which refuses it (400), so the
 *  caller never believes it took effect. Nothing is defaulted in, so a clean
 *  final passes. The worker signs the reference to the user and model alias
 *  that made it — a draft made on any
 *  2.5 entry finalizes on the base entry of the same alias — and bills both
 *  steps under its own `seedance-2.5-draft` pricing key. */
type Seedance25DraftModeContext = GenerationContext & {
  draft?: boolean;
  draftTask?: SeedanceDraftTask;
};

/** The vendor renders a draft at 480p only, and its final at 1080p only — an
 *  omitted resolution is rejected too (its own default is 720p). */
const SEEDANCE_25_DRAFT_RESOLUTION = '480p';
const SEEDANCE_25_DRAFT_FINAL_RESOLUTION = '1080p';

const withSeedance25DraftMode =
  (modelAlias: Seedance25Alias, build: PayloadBuilder): PayloadBuilder =>
  (ctx) => {
    const { draft, draftTask } = ctx as Seedance25DraftModeContext;
    if (draftTask) {
      // The content the regular builder would assemble from what the caller
      // sent (prompt, media) — empty for a clean final. It carries no
      // defaults; the top-level fields below are only the caller's own.
      const sentContent = (build(ctx) as { content?: unknown[] }).content ?? [];
      return {
        model: modelAlias,
        content: [{ type: 'draft_task', draft_task: draftTask }, ...sentContent],
        resolution: ctx.resolution ?? SEEDANCE_25_DRAFT_FINAL_RESOLUTION,
        output_format: seedance25OutputFormat(ctx),
        ...(ctx.returnLastFrame ? { return_last_frame: true } : {}),
        ...(ctx.aspectRatio !== undefined ? { ratio: ctx.aspectRatio } : {}),
        ...(ctx.duration !== undefined ? { duration: ctx.duration } : {}),
        ...(ctx.generateAudio !== undefined ? { generate_audio: ctx.generateAudio } : {}),
        ...(draft !== undefined ? { draft } : {}),
      };
    }
    const payload = build(ctx);
    // A draft renders at 480p only. The caller's own resolution, if any, is
    // sent as-is (the vendor refuses a wrong one); only the regular
    // builder's default is replaced.
    return draft
      ? { ...payload, draft: true, resolution: ctx.resolution ?? SEEDANCE_25_DRAFT_RESOLUTION }
      : payload;
  };

const SEEDANCE_25_DRAFT_RESOLUTION_REASON = 'Draft previews render at 480p only.';
const SEEDANCE_25_DRAFT_FINAL_RESOLUTION_REASON = 'The final video from a draft renders at 1080p only.';

const SEEDANCE_25_DRAFT_REUSED_REASON = 'A final from a draft reuses the draft\'s settings.';

/** UI side of the draft step: it renders at 480p only. */
const seedance25DraftConstraints: Constraint[] = [
  {
    when: { draft: { is: true } },
    then: { resolution: { allowed: [SEEDANCE_25_DRAFT_RESOLUTION], reason: SEEDANCE_25_DRAFT_RESOLUTION_REASON } },
  },
];

/** UI side of the final step (base entries): 1080p only, and every param the
 *  final reuses from its draft is disabled — the vendor refuses a final that
 *  sends one. */
const seedance25DraftFinalConstraints: Constraint[] = [
  ...seedance25DraftConstraints,
  {
    when: { draftTask: { exists: true } },
    then: {
      resolution: { allowed: [SEEDANCE_25_DRAFT_FINAL_RESOLUTION], reason: SEEDANCE_25_DRAFT_FINAL_RESOLUTION_REASON },
      draft: { disabled: true, reason: 'A final video is rendered from a draft, not as one.' },
      ...Object.fromEntries(['prompt', 'imageUrls', 'videoUrls', 'audioUrls', 'startFrame', 'endFrame',
        'aspectRatio', 'duration', 'generateAudio'].map((key) => [
        key, { disabled: true as const, reason: SEEDANCE_25_DRAFT_REUSED_REASON },
      ])),
    },
  },
];

/** Seedance 2.5 — text-to-video / image-to-video / multimodal refs.
 *  Mirrors buildSeedance20PayloadFor but lifts the reference caps to 30/10/10
 *  and always sends `output_format`. */
export const buildSeedance25PayloadFor =
  (modelAlias: Seedance25Alias): PayloadBuilder =>
  withSeedance25DraftMode(modelAlias, (ctx) => {
    const refImages = ctx.imageUrls ?? [];
    const refVideos = ctx.videoUrls ?? [];
    const refAudios = ctx.audioUrls ?? [];
    // First/Last Frame mode: the vendor rejects any non-adaptive ratio, so force
    // 'adaptive' whenever a start/end frame is present (T2V and reference modes
    // keep the user-selected ratio). Mirrors the seedance25Constraints lock.
    const usesFrame = Boolean(ctx.startFrame || ctx.endFrame);

    return {
      model: modelAlias,
      content: [
        ...(ctx.startFrame
          ? [{ type: 'image_url', image_url: { url: ctx.startFrame }, role: 'first_frame' }]
          : []),
        ...refImages.slice(0, 30).map((url) => ({
          type: 'image_url',
          image_url: { url },
          role: 'reference_image',
        })),
        ...refVideos.slice(0, 10).map((url) => ({
          type: 'video_url',
          video_url: { url },
          role: 'reference_video',
        })),
        ...refAudios.slice(0, 10).map((url) => ({
          type: 'audio_url',
          audio_url: { url },
          role: 'reference_audio',
        })),
        ...(ctx.endFrame
          ? [{ type: 'image_url', image_url: { url: ctx.endFrame }, role: 'last_frame' }]
          : []),
        // The prompt is optional on 2.5 (media-only input is valid); an empty
        // text item is not sent.
        ...(ctx.prompt?.trim() ? [{ type: 'text', text: ctx.prompt }] : []),
      ],
      ratio: usesFrame ? 'adaptive' : (ctx.aspectRatio ?? '16:9'),
      duration: ctx.duration ?? 5,
      resolution: ctx.resolution ?? '1080p',
      generate_audio: ctx.generateAudio ?? true,
      output_format: seedance25OutputFormat(ctx),
      ...(ctx.returnLastFrame ? { return_last_frame: true } : {}),
    };
  });

/** Seedance 2.5 — video edit (Editing mode). Required reference_video + up to
 *  30 reference images. Worker routes to `video-to-video.*` toolId.
 *  Vendor rule: the user may specify NEITHER duration NOR aspect ratio — the
 *  internal Editing mode requires `duration: -1` (output matches the source
 *  clip) and `ratio: 'adaptive'`. Any other value triggers a mode-mismatch
 *  error, so both are hardcoded here rather than read from ctx. */
export const buildSeedance25VideoEditPayloadFor =
  (modelAlias: Seedance25Alias): PayloadBuilder =>
  withSeedance25DraftMode(modelAlias, (ctx) => ({
    model: modelAlias,
    content: [
      { type: 'text', text: ctx.prompt },
      { type: 'video_url', video_url: { url: ctx.videoUrl }, role: 'reference_video' },
      ...(ctx.imageUrls ?? []).slice(0, 30).map((url) => ({
        type: 'image_url',
        image_url: { url },
        role: 'reference_image',
      })),
    ],
    ratio: 'adaptive',
    duration: -1,
    resolution: ctx.resolution ?? '1080p',
    generate_audio: ctx.generateAudio ?? true,
    output_format: seedance25OutputFormat(ctx),
    ...(ctx.returnLastFrame ? { return_last_frame: true } : {}),
  }));

/** Seedance 2.5 — video extend / multi-clip stitching (up to 10 reference videos).
 *  Worker routes to `video-to-video.*` toolId (content includes video_url roles).
 *  Vendor rule (Extension mode): duration is user-selectable, but aspect ratio
 *  MUST be 'adaptive' — a fixed ratio triggers a mode-mismatch error, so it is
 *  hardcoded here. */
export const buildSeedance25VideoExtendPayloadFor =
  (modelAlias: Seedance25Alias): PayloadBuilder =>
  withSeedance25DraftMode(modelAlias, (ctx) => ({
    model: modelAlias,
    content: [
      { type: 'text', text: ctx.prompt },
      ...(ctx.videoUrls ?? []).slice(0, 10).map((url) => ({
        type: 'video_url',
        video_url: { url },
        role: 'reference_video',
      })),
    ],
    ratio: 'adaptive',
    duration: ctx.duration ?? 15,
    resolution: ctx.resolution ?? '1080p',
    generate_audio: ctx.generateAudio ?? true,
    output_format: seedance25OutputFormat(ctx),
  }));

const SEEDANCE_AR = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9', 'adaptive'];
const SEEDANCE_25_FORMATS = ['mp4', 'mov'];
/** Output color depth. '10bit' is what the vendor renders at 1080p; '8bit' asks
 *  the worker to re-encode it to H.264 8-bit, which browsers and editors can
 *  actually decode. Selectable only where it means something — see
 *  seedance25ColorDepthConstraints. */
const SEEDANCE_25_COLOR_DEPTHS = ['10bit', '8bit'];
const SEEDANCE_V2_DURATIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
/** 2.5 accepts any whole second in 4-30s, so it is a range, not an option
 *  list — an enum would hide the values in between. */
const SEEDANCE_25_DURATION = { min: 4, max: 30 } as const;

/** Draft mode step 1, on every 2.5 entry (see withSeedance25DraftMode). */
const seedance25DraftParam = p.boolean('draft', false, 'Draft');

/** Draft mode step 2, on the base 2.5 entries. Wire field names on purpose:
 *  it is the object the draft's result returned (`metadata.draftTask`),
 *  signed by the worker, and must travel back unchanged. */
const seedance25DraftTaskParam = {
  draftTask: {
    label: 'Draft',
    required: false,
    descriptor: {
      kind: 'object' as const,
      fields: {
        id: { kind: 'text' as const },
        video_input: { kind: 'boolean' as const, default: false },
        signature: { kind: 'text' as const },
      },
    },
  },
};

export const { MODELS } = defineModels('seedance', [
  {
    id: 'seedance-2.5', name: 'Seedance 2.5', modelId: 'seedance-2.5',
    addedAt: '2026-08-06',
    workflow: 'seedance',
    buildPayload: buildSeedance25PayloadFor('seedance_2_5'),
    constraints: [...seedance25Constraints, ...seedance25DraftFinalConstraints],
    estimatedTime: 20,
    mode: 'video', inputType: 't2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Latest cinematic video with audio, multi-reference input, and mp4/mov output in 10- or 8-bit. Up to 30s.',
    features: [feat('Reference Image', 'frame'), feat('Start/End Frame', 'frame'), feat('Audio', 'audio'), feat('1080p', 'resolution'), feat('4-30 sec', 'duration')],
    paramConfig: {
      // Optional on 2.5 (media-only input is valid) — and a final from a
      // draft must not carry one (the vendor refuses it).
      ...params.prompt({ required: false }),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p', '1080p'], '1080p'),
      ...params.durationRange(SEEDANCE_25_DURATION.min, SEEDANCE_25_DURATION.max, 5),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      ...p.enum('outputFormat', SEEDANCE_25_FORMATS, 'mp4', { label: 'Format' }),
      ...p.enum('colorDepth', SEEDANCE_25_COLOR_DEPTHS, '10bit', { label: 'Color Depth' }),
      ...seedance25DraftParam,
      ...seedance25DraftTaskParam,
      // 2.5 lifts the reference caps to 30 images / 10 videos / 10 audios.
      ...params.imageInput(30, 'Reference Images', false, 'reference', SEEDANCE_IMAGE_BOUNDS),
      ...params.videoInputs(10, 'Reference Videos', false, SEEDANCE_25_VIDEO_BOUNDS),
      ...params.audioInputs(10, 'Reference Audios', false, SEEDANCE_25_AUDIO_BOUNDS),
      ...params.startFrame('Start Frame', false, SEEDANCE_FRAME_BOUNDS),
      ...params.endFrame('End Frame', SEEDANCE_FRAME_BOUNDS),
    },
  },
  {
    // Same model as seedance-2.5 on a vendor endpoint with moderation
    // disabled — full capability parity, bills under the seedance-2.5
    // pricing key (hence the shared modelId).
    id: 'seedance-2.5-without-moderation', name: 'Seedance 2.5 Without Moderation', modelId: 'seedance-2.5',
    addedAt: '2026-09-09',
    release: 'preview',
    workflow: 'seedance',
    buildPayload: buildSeedance25PayloadFor('seedance_2_5_without_moderation'),
    constraints: [...seedance25Constraints, ...seedance25DraftFinalConstraints],
    estimatedTime: 20,
    mode: 'video', inputType: 't2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Seedance 2.5 with vendor moderation disabled — cinematic video with audio, multi-reference input, and mp4/mov output in 10- or 8-bit. Up to 30s.',
    features: [feat('Reference Image', 'frame'), feat('Start/End Frame', 'frame'), feat('Audio', 'audio'), feat('1080p', 'resolution'), feat('4-30 sec', 'duration')],
    paramConfig: {
      // Optional on 2.5 (media-only input is valid) — and a final from a
      // draft must not carry one (the vendor refuses it).
      ...params.prompt({ required: false }),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p', '1080p'], '1080p'),
      ...params.durationRange(SEEDANCE_25_DURATION.min, SEEDANCE_25_DURATION.max, 5),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      ...p.enum('outputFormat', SEEDANCE_25_FORMATS, 'mp4', { label: 'Format' }),
      ...p.enum('colorDepth', SEEDANCE_25_COLOR_DEPTHS, '10bit', { label: 'Color Depth' }),
      ...seedance25DraftParam,
      ...seedance25DraftTaskParam,
      // 2.5 lifts the reference caps to 30 images / 10 videos / 10 audios.
      ...params.imageInput(30, 'Reference Images', false, 'reference', SEEDANCE_IMAGE_BOUNDS),
      ...params.videoInputs(10, 'Reference Videos', false, SEEDANCE_25_VIDEO_BOUNDS),
      ...params.audioInputs(10, 'Reference Audios', false, SEEDANCE_25_AUDIO_BOUNDS),
      ...params.startFrame('Start Frame', false, SEEDANCE_FRAME_BOUNDS),
      ...params.endFrame('End Frame', SEEDANCE_FRAME_BOUNDS),
    },
  },
  {
    id: 'seedance-2.5-video-edit', name: 'Seedance 2.5 Video Edit', modelId: 'seedance-2.5',
    addedAt: '2026-08-06',
    workflow: 'seedance',
    buildPayload: buildSeedance25VideoEditPayloadFor('seedance_2_5'),
    constraints: [...seedance25ColorDepthConstraints, ...seedance25DraftConstraints],
    estimatedTime: 60,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Edit video — replace subjects, add or remove objects, restyle scenes with reference images.',
    features: [feat('Video Input', 'input'), feat('Multi-Image Input', 'input'), feat('Audio', 'audio'), feat('1080p', 'resolution'), feat('Source length', 'duration')],
    paramConfig: {
      ...params.prompt(),
      // Editing mode: aspect ratio is fixed to 'adaptive' and duration is
      // source-driven ('-1'), so neither is user-selectable (vendor rule).
      ...params.aspectRatio(['adaptive']),
      ...params.resolution(['480p', '720p', '1080p'], '1080p'),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      ...p.enum('outputFormat', SEEDANCE_25_FORMATS, 'mp4', { label: 'Format' }),
      ...p.enum('colorDepth', SEEDANCE_25_COLOR_DEPTHS, '10bit', { label: 'Color Depth' }),
      ...seedance25DraftParam,
      // Every limit rides in `bounds`; the positional maxDuration / maxShortSide
      // / maxBytes args predate it and are skipped rather than duplicated.
      ...params.videoInput('Source Video', 'reference', true, undefined, undefined, undefined, SEEDANCE_25_VIDEO_BOUNDS),
      ...params.imageInput(30, 'Reference Images', false, 'reference', SEEDANCE_IMAGE_BOUNDS),
    },
  },
  {
    id: 'seedance-2.5-without-moderation-video-edit', name: 'Seedance 2.5 Without Moderation Video Edit', modelId: 'seedance-2.5',
    addedAt: '2026-09-09',
    release: 'preview',
    workflow: 'seedance',
    buildPayload: buildSeedance25VideoEditPayloadFor('seedance_2_5_without_moderation'),
    constraints: [...seedance25ColorDepthConstraints, ...seedance25DraftConstraints],
    estimatedTime: 60,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Moderation-free video edit — replace subjects, add or remove objects, restyle scenes with reference images.',
    features: [feat('Video Input', 'input'), feat('Multi-Image Input', 'input'), feat('Audio', 'audio'), feat('1080p', 'resolution'), feat('Source length', 'duration')],
    paramConfig: {
      ...params.prompt(),
      // Editing mode: aspect ratio is fixed to 'adaptive' and duration is
      // source-driven ('-1'), so neither is user-selectable (vendor rule).
      ...params.aspectRatio(['adaptive']),
      ...params.resolution(['480p', '720p', '1080p'], '1080p'),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      ...p.enum('outputFormat', SEEDANCE_25_FORMATS, 'mp4', { label: 'Format' }),
      ...p.enum('colorDepth', SEEDANCE_25_COLOR_DEPTHS, '10bit', { label: 'Color Depth' }),
      ...seedance25DraftParam,
      // Every limit rides in `bounds`; the positional maxDuration / maxShortSide
      // / maxBytes args predate it and are skipped rather than duplicated.
      ...params.videoInput('Source Video', 'reference', true, undefined, undefined, undefined, SEEDANCE_25_VIDEO_BOUNDS),
      ...params.imageInput(30, 'Reference Images', false, 'reference', SEEDANCE_IMAGE_BOUNDS),
    },
  },
  {
    id: 'seedance-2.5-video-extend', name: 'Seedance 2.5 Video Extend', modelId: 'seedance-2.5',
    addedAt: '2026-08-06',
    workflow: 'seedance',
    buildPayload: buildSeedance25VideoExtendPayloadFor('seedance_2_5'),
    constraints: [...seedance25ColorDepthConstraints, ...seedance25DraftConstraints],
    estimatedTime: 200,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Stitch up to 10 clips into one continuous, extended video.',
    features: [feat('Multi-Video Input', 'input'), feat('Audio', 'audio'), feat('1080p', 'resolution'), feat('4-30 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      // Extension mode: aspect ratio is locked to 'adaptive' (vendor rule);
      // duration stays user-selectable.
      ...params.aspectRatio(['adaptive']),
      ...params.resolution(['480p', '720p', '1080p'], '1080p'),
      ...params.durationRange(SEEDANCE_25_DURATION.min, SEEDANCE_25_DURATION.max, 15),
      ...params.generateAudio(),
      ...p.enum('outputFormat', SEEDANCE_25_FORMATS, 'mp4', { label: 'Format' }),
      ...p.enum('colorDepth', SEEDANCE_25_COLOR_DEPTHS, '10bit', { label: 'Color Depth' }),
      ...seedance25DraftParam,
      ...params.videoInputs(10, 'Source Videos', true, SEEDANCE_25_VIDEO_BOUNDS),
    },
  },
  {
    id: 'seedance-2.5-without-moderation-video-extend', name: 'Seedance 2.5 Without Moderation Video Extend', modelId: 'seedance-2.5',
    addedAt: '2026-09-09',
    release: 'preview',
    workflow: 'seedance',
    buildPayload: buildSeedance25VideoExtendPayloadFor('seedance_2_5_without_moderation'),
    constraints: [...seedance25ColorDepthConstraints, ...seedance25DraftConstraints],
    estimatedTime: 200,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Moderation-free: stitch up to 10 clips into one continuous, extended video.',
    features: [feat('Multi-Video Input', 'input'), feat('Audio', 'audio'), feat('1080p', 'resolution'), feat('4-30 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      // Extension mode: aspect ratio is locked to 'adaptive' (vendor rule);
      // duration stays user-selectable.
      ...params.aspectRatio(['adaptive']),
      ...params.resolution(['480p', '720p', '1080p'], '1080p'),
      ...params.durationRange(SEEDANCE_25_DURATION.min, SEEDANCE_25_DURATION.max, 15),
      ...params.generateAudio(),
      ...p.enum('outputFormat', SEEDANCE_25_FORMATS, 'mp4', { label: 'Format' }),
      ...p.enum('colorDepth', SEEDANCE_25_COLOR_DEPTHS, '10bit', { label: 'Color Depth' }),
      ...seedance25DraftParam,
      ...params.videoInputs(10, 'Source Videos', true, SEEDANCE_25_VIDEO_BOUNDS),
    },
  },
  {
    id: 'seedance-2.0', name: 'Seedance 2.0', modelId: 'seedance-2.0',
    addedAt: '2026-05-27',
    workflow: 'seedance',
    buildPayload: buildSeedance20PayloadFor('seedance_2_0'),
    constraints: seedance20Constraints,
    estimatedTime: 15,
    mode: 'video', inputType: 't2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Next-gen cinematic video with optional audio and reference image. Up to 4K.',
    features: [feat('Reference Image', 'frame'), feat('Start/End Frame', 'frame'), feat('Audio', 'audio'), feat('4K', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p', '1080p', '4k'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 10),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, 'Reference Images', false, 'reference', SEEDANCE_IMAGE_BOUNDS),
      ...params.videoInputs(3, 'Reference Videos', false, SEEDANCE_20_VIDEO_BOUNDS),
      ...params.audioInputs(3, 'Reference Audios', false, SEEDANCE_20_AUDIO_BOUNDS),
      ...params.startFrame('Start Frame', false, SEEDANCE_FRAME_BOUNDS),
      ...params.endFrame('End Frame', SEEDANCE_FRAME_BOUNDS),
    },
  },
  {
    // Same model as seedance-2.0 on a vendor endpoint with moderation
    // disabled — full capability parity, bills under the seedance-2.0
    // pricing key (hence the shared modelId).
    id: 'seedance-2.0-without-moderation', name: 'Seedance 2.0 Without Moderation', modelId: 'seedance-2.0',
    addedAt: '2026-08-17',
    release: 'preview',
    workflow: 'seedance',
    buildPayload: buildSeedance20PayloadFor('seedance_2_0_without_moderation'),
    constraints: seedance20Constraints,
    estimatedTime: 15,
    mode: 'video', inputType: 't2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Seedance 2.0 with vendor moderation disabled — cinematic video with optional audio and reference image. Up to 4K.',
    features: [feat('Reference Image', 'frame'), feat('Start/End Frame', 'frame'), feat('Audio', 'audio'), feat('4K', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p', '1080p', '4k'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 10),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, 'Reference Images', false, 'reference', SEEDANCE_IMAGE_BOUNDS),
      ...params.videoInputs(3, 'Reference Videos', false, SEEDANCE_20_VIDEO_BOUNDS),
      ...params.audioInputs(3, 'Reference Audios', false, SEEDANCE_20_AUDIO_BOUNDS),
      ...params.startFrame('Start Frame', false, SEEDANCE_FRAME_BOUNDS),
      ...params.endFrame('End Frame', SEEDANCE_FRAME_BOUNDS),
    },
  },
  {
    id: 'seedance-2.0-fast', name: 'Seedance 2.0 Fast', modelId: 'seedance-2.0-fast',
    addedAt: '2026-05-27',
    workflow: 'seedance',
    buildPayload: buildSeedance20PayloadFor('seedance_2_0_fast'),
    constraints: seedance20Constraints,
    estimatedTime: 15,
    mode: 'video', inputType: 't2v',
    badge: ['new', 'fast', 'premium', 'hot'],
    description: 'Fast cinematic video with audio, reference images, and start/end frame control.',
    features: [feat('Reference Image', 'frame'), feat('Start/End Frame', 'frame'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 10),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, 'Reference Images', false, 'reference', SEEDANCE_IMAGE_BOUNDS),
      ...params.videoInputs(3, 'Reference Videos', false, SEEDANCE_20_VIDEO_BOUNDS),
      ...params.audioInputs(3, 'Reference Audios', false, SEEDANCE_20_AUDIO_BOUNDS),
      ...params.startFrame('Start Frame', false, SEEDANCE_FRAME_BOUNDS),
      ...params.endFrame('End Frame', SEEDANCE_FRAME_BOUNDS),
    },
  },
  {
    id: 'seedance-2.0-mini', name: 'Seedance 2.0 Mini', modelId: 'seedance-2.0-mini',
    addedAt: '2026-06-25',
    workflow: 'seedance',
    buildPayload: buildSeedance20PayloadFor('seedance_2_0_mini'),
    constraints: seedance20Constraints,
    estimatedTime: 15,
    mode: 'video', inputType: 't2v',
    badge: ['new', 'fast', 'premium'],
    description: 'Lightweight cinematic video with audio, reference images, and start/end frame control.',
    features: [feat('Reference Image', 'frame'), feat('Start/End Frame', 'frame'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 10),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, 'Reference Images', false, 'reference', SEEDANCE_IMAGE_BOUNDS),
      ...params.videoInputs(3, 'Reference Videos', false, SEEDANCE_20_VIDEO_BOUNDS),
      ...params.audioInputs(3, 'Reference Audios', false, SEEDANCE_20_AUDIO_BOUNDS),
      ...params.startFrame('Start Frame', false, SEEDANCE_FRAME_BOUNDS),
      ...params.endFrame('End Frame', SEEDANCE_FRAME_BOUNDS),
    },
  },
  {
    id: 'seedance-2.0-video-edit', name: 'Seedance 2.0 Video Edit', modelId: 'seedance-2.0',
    addedAt: '2026-05-27',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoEditPayloadFor('seedance_2_0'),
    estimatedTime: 77,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Edit video — replace subjects, add or remove objects, restyle scenes with reference images.',
    features: [feat('Video Input', 'input'), feat('Multi-Image Input', 'input'), feat('Audio', 'audio'), feat('4K', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p', '1080p', '4k'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 5),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      // Every limit rides in `bounds`; the positional maxDuration / maxShortSide
      // / maxBytes args predate it and are skipped rather than duplicated.
      ...params.videoInput('Source Video', 'reference', true, undefined, undefined, undefined, SEEDANCE_20_VIDEO_BOUNDS),
      ...params.imageInput(9, 'Reference Images', false, 'reference', SEEDANCE_IMAGE_BOUNDS),
    },
  },
  {
    id: 'seedance-2.0-without-moderation-video-edit', name: 'Seedance 2.0 Without Moderation Video Edit', modelId: 'seedance-2.0',
    addedAt: '2026-08-17',
    release: 'preview',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoEditPayloadFor('seedance_2_0_without_moderation'),
    estimatedTime: 77,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Moderation-free video edit — replace subjects, add or remove objects, restyle scenes with reference images.',
    features: [feat('Video Input', 'input'), feat('Multi-Image Input', 'input'), feat('Audio', 'audio'), feat('4K', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p', '1080p', '4k'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 5),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      // Every limit rides in `bounds`; the positional maxDuration / maxShortSide
      // / maxBytes args predate it and are skipped rather than duplicated.
      ...params.videoInput('Source Video', 'reference', true, undefined, undefined, undefined, SEEDANCE_20_VIDEO_BOUNDS),
      ...params.imageInput(9, 'Reference Images', false, 'reference', SEEDANCE_IMAGE_BOUNDS),
    },
  },
  {
    id: 'seedance-2.0-fast-video-edit', name: 'Seedance 2.0 Fast Video Edit', modelId: 'seedance-2.0-fast',
    addedAt: '2026-05-27',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoEditPayloadFor('seedance_2_0_fast'),
    estimatedTime: 30,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'fast', 'premium', 'hot'],
    description: 'Fast video edit — modify scenes with reference images.',
    features: [feat('Video Input', 'input'), feat('Multi-Image Input', 'input'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 5),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      // Every limit rides in `bounds`; the positional maxDuration / maxShortSide
      // / maxBytes args predate it and are skipped rather than duplicated.
      ...params.videoInput('Source Video', 'reference', true, undefined, undefined, undefined, SEEDANCE_20_VIDEO_BOUNDS),
      ...params.imageInput(9, 'Reference Images', false, 'reference', SEEDANCE_IMAGE_BOUNDS),
    },
  },
  {
    id: 'seedance-2.0-mini-video-edit', name: 'Seedance 2.0 Mini Video Edit', modelId: 'seedance-2.0-mini',
    addedAt: '2026-06-25',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoEditPayloadFor('seedance_2_0_mini'),
    estimatedTime: 30,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'fast', 'premium'],
    description: 'Lightweight video edit — modify scenes with reference images.',
    features: [feat('Video Input', 'input'), feat('Multi-Image Input', 'input'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 5),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      // Every limit rides in `bounds`; the positional maxDuration / maxShortSide
      // / maxBytes args predate it and are skipped rather than duplicated.
      ...params.videoInput('Source Video', 'reference', true, undefined, undefined, undefined, SEEDANCE_20_VIDEO_BOUNDS),
      ...params.imageInput(9, 'Reference Images', false, 'reference', SEEDANCE_IMAGE_BOUNDS),
    },
  },
  {
    id: 'seedance-2.0-video-extend', name: 'Seedance 2.0 Video Extend', modelId: 'seedance-2.0',
    addedAt: '2026-05-27',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoExtendPayloadFor('seedance_2_0'),
    estimatedTime: 400,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Stitch up to 3 clips into one continuous, extended video.',
    features: [feat('Multi-Video Input', 'input'), feat('Audio', 'audio'), feat('4K', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p', '1080p', '4k'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 15),
      ...params.generateAudio(),
      ...params.videoInputs(3, 'Source Videos', true, SEEDANCE_20_VIDEO_BOUNDS),
    },
  },
  {
    id: 'seedance-2.0-without-moderation-video-extend', name: 'Seedance 2.0 Without Moderation Video Extend', modelId: 'seedance-2.0',
    addedAt: '2026-08-17',
    release: 'preview',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoExtendPayloadFor('seedance_2_0_without_moderation'),
    estimatedTime: 400,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'premium', 'hot'],
    description: 'Moderation-free: stitch up to 3 clips into one continuous, extended video.',
    features: [feat('Multi-Video Input', 'input'), feat('Audio', 'audio'), feat('4K', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p', '1080p', '4k'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 15),
      ...params.generateAudio(),
      ...params.videoInputs(3, 'Source Videos', true, SEEDANCE_20_VIDEO_BOUNDS),
    },
  },
  {
    id: 'seedance-2.0-fast-video-extend', name: 'Seedance 2.0 Fast Video Extend', modelId: 'seedance-2.0-fast',
    addedAt: '2026-05-27',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoExtendPayloadFor('seedance_2_0_fast'),
    estimatedTime: 180,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'fast', 'premium', 'hot'],
    description: 'Quickly stitch up to 3 clips into one continuous video.',
    features: [feat('Multi-Video Input', 'input'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 15),
      ...params.generateAudio(),
      ...params.videoInputs(3, 'Source Videos', true, SEEDANCE_20_VIDEO_BOUNDS),
    },
  },
  {
    id: 'seedance-2.0-mini-video-extend', name: 'Seedance 2.0 Mini Video Extend', modelId: 'seedance-2.0-mini',
    addedAt: '2026-06-25',
    workflow: 'seedance',
    buildPayload: buildSeedance20VideoExtendPayloadFor('seedance_2_0_mini'),
    estimatedTime: 180,
    mode: 'video', inputType: 'v2v',
    badge: ['new', 'fast', 'premium'],
    description: 'Lightweight: stitch up to 3 clips into one continuous video.',
    features: [feat('Multi-Video Input', 'input'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('4-15 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration(SEEDANCE_V2_DURATIONS, 15),
      ...params.generateAudio(),
      ...params.videoInputs(3, 'Source Videos', true, SEEDANCE_20_VIDEO_BOUNDS),
    },
  },
  {
    id: 'seedance-1.5-pro', name: 'Seedance 1.5 Pro', modelId: 'seedance-1.5-pro',
    addedAt: '2026-02-06',
    deprecated: true, // superseded by seedance-2.0 / seedance-2.0-fast
    workflow: 'seedance', buildPayload: buildSeedance15ProPayload,
    estimatedTime: 15,
    mode: 'video', inputType: 't2v',
    description: 'Built-in audio with start/end frame control and flexible 4-12s durations.',
    features: [feat('Start/End Frame', 'frame'), feat('Audio', 'audio'), feat('720p', 'resolution'), feat('12 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p'], '720p'),
      ...params.duration([4, 5, 8, 10, 12], 5),
      ...params.generateAudio(false),
      ...params.startFrame(),
      ...params.endFrame(),
    },
  },
  {
    id: 'seedance-i2v', name: 'Seedance I2V', modelId: 'seedance-1.0-pro',
    addedAt: '2026-02-06',
    deprecated: true, // 1.0 Pro is 3 generations behind seedance-2.0
    workflow: 'seedance', buildPayload: buildSeedanceI2VPayload,
    estimatedTime: 40,
    mode: 'video', inputType: 'i2v',
    description: 'Bring a still image to life with natural motion and style transfer, up to 1080p.',
    features: [feat('Image Input', 'input'), feat('Up to 1080p', 'resolution'), feat('5/10 sec', 'duration')],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(['480p', '720p', '1080p'], '720p'),
      ...params.duration([5, 10], 5),
      ...params.startFrame('First Frame', true),
    },
  },
]);

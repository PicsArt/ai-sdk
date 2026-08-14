/**
 * Drive client — manages folders and file saving in Picsart Drive.
 *
 * Uses the same authenticated fetch as the generation client.
 * Root folder is auto-created on first use and cached.
 */
import type { AuthenticatedFetch, AppType, AppIdentity } from './types.ts';
import { MAX_DRIVE_PROMPT_LENGTH } from '../core/limits.ts';

// ── Types ────────────────────────────────────────────────────────────

export type MediaTypeFilter = 'image' | 'video' | 'audio';

export type UserReaction = 'like' | 'dislike';

const USER_REACTION_ATTR = 'userReaction';

/** A folder reference in Picsart Drive. */
export interface DriveFolder {
  name: string;
  uid: string;
}

/** Drive save result, attached to GenerateResult when drive is enabled. */
export interface DriveSaveResult {
  uid: string;
  folder: DriveFolder;
}

/**
 * The generation input parameters, serialized into the `aiSDKPayload` attribute.
 * Captures every value from the generation context — the named fields below are
 * common ones for convenience; the index signature carries any other input param.
 */
export interface SdkPayload {
  prompt: string;
  aspectRatio?: string;
  duration?: number;
  resolution?: string;
  generateAudio?: boolean;
  imageUrls?: string[];
  videoUrls?: string[];
  audioUrls?: string[];
  startFrame?: string;
  endFrame?: string;
  videoUrl?: string;
  audioUrl?: string;
  [key: string]: unknown;
}

export type DriveFile = { uid: string } & Record<string, unknown>;

export interface DriveAttributes {
  model: string;
  /** JSON-encoded SdkPayload (all generation input params). */
  aiSDKPayload: string;
  // TODO(backend-autosave): stamped client-side until the backend sets these on
  // save. Remove appId/appType here once the backend autosave lands.
  appId?: string;
  appType?: AppType;
}

export interface GenerationFile {
  appId?: string;
  appType?: AppType;
  model?: string;
  aiSDKPayload?: SdkPayload;
  userReaction?: UserReaction;
}

export interface DriveMediaItem {
  uid: string;
  url: string;
  name: string;
  type: MediaTypeFilter;
  previewUrl?: string;
  timestamp: number;
}

export interface DriveFileDetails extends DriveMediaItem {
  createdAt?: string;
  model?: string;
  prompt?: string;
  service?: string;
  subType?: string;
  duration?: string;
  aspectRatio?: string;
  resolution?: string;
  quality?: string;
  userReaction?: UserReaction;
  referenceImageUrls?: string[];
  referenceVideoUrl?: string;
  referenceAudioUrl?: string;
}

export interface ListOptions {
  folder?: DriveFolder;
  type?: MediaTypeFilter;
}

export interface SaveParams {
  url: string;
  name: string;
  resourceType: 'PHOTO' | 'VIDEO' | 'AUDIO';
  attributes?: Record<string, string>;
  previewUrl?: string;
}

// ── Payload drive options (backend-side save) ───────────────────────

/** Target folder for backend Drive save. */
export interface PayloadDriveFolderOptions {
  /** Folder path — backend resolves it (e.g. 'AI Playground' or 'AI Playground/My Board'). */
  path?: string;
  /** Folder UID — overrides path when provided. */
  id?: string;
}

/** Drive save options injected into the workflow payload as `options.drive`. */
export interface PayloadDriveOptions {
  /** Filename for the saved asset. */
  name: string;
  /** Generation attributes attached to the file (SDK-assembled, fixed shape). */
  attributes?: DriveAttributes;
  /** Target folder in Picsart Drive. */
  folder?: PayloadDriveFolderOptions;
}

/**
 * Drive operations surface — returned by {@link createDriveClient} and exposed
 * as `ai.drive` when Drive is configured. Manages folders, listing, saving, and
 * reactions in Picsart Drive.
 */
export interface DriveClient {
  /** Ensure a folder exists (creating it if needed) and return it. */
  ensureFolder(subfolder?: string): Promise<DriveFolder | null>;
  /** List the immediate subfolders of the root folder. */
  folders(): Promise<DriveFolder[]>;
  /** List all folders recursively. */
  allFolders(): Promise<DriveFolder[]>;
  /** Find a folder by name. */
  findFolder(name: string): Promise<DriveFolder | null>;
  /** List media items in a folder. */
  list(options?: ListOptions): Promise<DriveMediaItem[]>;
  /** List media items in a folder with full generation metadata. */
  listDetailed(options?: ListOptions): Promise<DriveFileDetails[]>;
  /** Read a single generation's stored attributes. */
  getGeneration(fileUid: string): Promise<GenerationFile | null>;
  /** Save an asset to Drive. */
  save(params: SaveParams, folder?: DriveFolder): Promise<DriveSaveResult | null>;
  /** Build the save params for a generation result. */
  buildSaveParams(url: string, modelId: string, modelName: string, mode: string, prompt?: string): SaveParams;
  /** Set a like/dislike reaction on a file. */
  addReaction(fileUid: string, reaction: UserReaction): Promise<boolean>;
  /** Clear the reaction on a file. */
  removeReaction(fileUid: string): Promise<boolean>;
}

// ── Helpers ──────────────────────────────────────────────────────────

export function inferResourceType(mode: string): 'PHOTO' | 'VIDEO' | 'AUDIO' {
  if (mode === 'video') return 'VIDEO';
  if (mode === 'audio') return 'AUDIO';
  return 'PHOTO';
}

export function buildFilename(prompt: string | undefined, mode: string): string {
  const shortId = String(Date.now()).slice(-6);
  const ext = mode === 'video' ? 'mp4' : mode === 'audio' ? 'mp3' : 'png';
  if (!prompt) return `ai-generation-${shortId}.${ext}`;
  const slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return `${slug}-${shortId}.${ext}`;
}

function inferMediaType(file: Record<string, unknown>): MediaTypeFilter {
  const name = String(file.name || '');
  if (/\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(name)) return 'audio';
  if (/\.(mp4|webm|mov|avi|mkv|m4v|wmv)$/i.test(name)) return 'video';

  const contentType = (file.contentType as Record<string, unknown> | undefined)
    ?? (file.content as Record<string, unknown> | undefined);
  const resourceType = String(contentType?.resourceType || '').toUpperCase();
  if (resourceType === 'VIDEO') return 'video';
  if (resourceType === 'AUDIO') return 'audio';
  return 'image';
}

function contentResourceTypes(type?: MediaTypeFilter): string {
  if (type === 'image') return 'PHOTO';
  if (type === 'video') return 'VIDEO';
  if (type === 'audio') return 'AUDIO';
  return 'PHOTO,VIDEO,AUDIO';
}

function normalizeUrl(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  return raw.trim() || undefined;
}

function parseAttributes(raw: unknown): Record<string, string> {
  const map: Record<string, string> = {};
  if (!raw || typeof raw !== 'object') return map;
  if (Array.isArray(raw)) {
    for (const a of raw as { property: string; value: string }[]) {
      map[a.property] = String(a.value);
    }
  } else {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      map[k] = String(v);
    }
  }
  return map;
}

function parseReaction(value: string | undefined): UserReaction | undefined {
  return value === 'like' || value === 'dislike' ? value : undefined;
}

function parseJsonAttr(raw: string | undefined): Record<string, unknown> | undefined {
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : undefined;
  } catch { return undefined; }
}

// ── Generation attributes (assembled by the SDK, persisted by the backend) ──

const asString = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v : undefined;

const asStringArray = (v: unknown): string[] | undefined =>
  Array.isArray(v) && v.length && v.every(x => typeof x === 'string') ? (v as string[]) : undefined;

/**
 * Map a generation context onto the SDK payload — captures every defined input
 * param (skipping null/undefined/empty), so nothing is dropped.
 *
 * The prompt is capped at `MAX_DRIVE_PROMPT_LENGTH` here rather than upstream:
 * this is the one place every Drive write goes through, including the models
 * that declare no `prompt` param and direct `buildGenerationAttributes`
 * callers, neither of which is clamped by param validation.
 */
export function toSdkPayload(params: Record<string, unknown>): SdkPayload {
  const p: SdkPayload = { prompt: String(params.prompt ?? '').slice(0, MAX_DRIVE_PROMPT_LENGTH) };
  for (const [key, value] of Object.entries(params)) {
    if (key === 'prompt') continue;
    if (value === undefined || value === null || value === '') continue;
    p[key] = value;
  }
  return p;
}

export function buildGenerationAttributes(input: {
  modelId: string;
  params: Record<string, unknown>;
  /** TODO(backend-autosave): temporary — remove once the backend stamps appId/appType. */
  app?: AppIdentity;
}): DriveAttributes {
  const attrs: DriveAttributes = {
    model: input.modelId,
    aiSDKPayload: JSON.stringify(toSdkPayload(input.params)),
  };
  // TODO(backend-autosave): drop this block once the backend stamps appId/appType.
  if (input.app) {
    attrs.appId = input.app.id;
    attrs.appType = input.app.type;
  }
  return attrs;
}

function toMediaItem(file: Record<string, unknown>): DriveMediaItem | null {
  const url = normalizeUrl(file.sourceUrl);
  if (!url || String(file.name || '').startsWith('__')) return null;
  const preview = file.preview as Record<string, unknown> | undefined;
  return {
    uid: String(file.uid ?? ''),
    url,
    name: String(file.name || ''),
    type: inferMediaType(file),
    previewUrl: normalizeUrl(preview?.url),
    timestamp: Number(file.updatedAt ?? file.createdAt ?? 0),
  };
}

function toDetailedItem(file: Record<string, unknown>): DriveFileDetails | null {
  const base = toMediaItem(file);
  if (!base) return null;
  const attrs = parseAttributes(file.attributes);
  let extras: Record<string, unknown> = {};
  if (attrs.textScript) {
    try { extras = JSON.parse(attrs.textScript); } catch { /* ok */ }
  }
  return {
    ...base,
    createdAt: file.createdAt as string | undefined,
    model: attrs.model,
    prompt: attrs.prompt || undefined,
    service: attrs.service,
    subType: attrs.subType,
    duration: attrs.duration,
    userReaction: parseReaction(attrs[USER_REACTION_ATTR]),
    referenceImageUrls: extras.referenceImageUrls as string[] | undefined,
    referenceVideoUrl: extras.referenceVideoUrl as string | undefined,
    referenceAudioUrl: extras.referenceAudioUrl as string | undefined,
    aspectRatio: extras.aspectRatio as string | undefined,
    resolution: extras.resolution as string | undefined,
    quality: extras.quality as string | undefined,
  };
}

/**
 * Maps the retired `tool` attribute (legacy app identity) to the current
 * `appId`/`appType`. Older files were tagged with `tool` instead of the
 * backend-stamped app identity.
 */
const LEGACY_TOOL_APP: Record<string, { appId: string; appType: AppType }> = {
  'ai-playground': { appId: 'com.picsart.ai-playground', appType: 'miniapp' },
};

/**
 * Adapter for legacy Drive files written before the `aiSDKPayload` schema. Older
 * files stored flat attributes (`model`, `prompt`, `service`, `subType`,
 * `duration`) plus a `textScript` JSON blob; this folds all of them into
 * `aiSDKPayload` so old files read the same as new ones. `appId`/`appType` are
 * recovered from the legacy `tool` attribute via LEGACY_TOOL_APP.
 */
function adaptLegacyGeneration(attrs: Record<string, string>): GenerationFile {
  let extras: Record<string, unknown> = {};
  if (attrs.textScript) { try { extras = JSON.parse(attrs.textScript); } catch { /* ok */ } }

  const aiSDKPayload: SdkPayload = { prompt: attrs.prompt || '' };
  const aspectRatio = asString(extras.aspectRatio); if (aspectRatio) aiSDKPayload.aspectRatio = aspectRatio;
  const resolution = asString(extras.resolution); if (resolution) aiSDKPayload.resolution = resolution;
  const duration = extras.duration ?? attrs.duration;
  if (duration != null && duration !== '') aiSDKPayload.duration = Number(duration);
  const imageUrls = asStringArray(extras.referenceImageUrls); if (imageUrls) aiSDKPayload.imageUrls = imageUrls;
  const videoUrl = asString(extras.referenceVideoUrl); if (videoUrl) aiSDKPayload.videoUrl = videoUrl;
  const audioUrl = asString(extras.referenceAudioUrl); if (audioUrl) aiSDKPayload.audioUrl = audioUrl;
  const startFrame = asString(extras.startFrame); if (startFrame) aiSDKPayload.startFrame = startFrame;
  const endFrame = asString(extras.endFrame); if (endFrame) aiSDKPayload.endFrame = endFrame;
  // Fold the former app-specific fields into the payload too. (service/subType
  // are intentionally NOT folded — provider/inputType derive from the model id.)
  const quality = asString(extras.quality); if (quality) aiSDKPayload.quality = quality;
  const style = asString(extras.style); if (style) aiSDKPayload.style = style;
  const iterateModel = asString(extras.iterateModel); if (iterateModel) aiSDKPayload.iterateModel = iterateModel;
  const exploreImageId = asString(extras.exploreImageId); if (exploreImageId) aiSDKPayload.exploreImageId = exploreImageId;

  const app = attrs.tool ? LEGACY_TOOL_APP[attrs.tool] : undefined;

  return {
    appId: app?.appId,
    appType: app?.appType,
    model: attrs.model || undefined,
    aiSDKPayload,
    userReaction: parseReaction(attrs[USER_REACTION_ATTR]),
  };
}

export function parseGeneration(file: DriveFile | Record<string, unknown>): GenerationFile {
  const attrs = parseAttributes((file as Record<string, unknown>).attributes);
  // Legacy files have no aiSDKPayload — run them through the adapter.
  if (!attrs.aiSDKPayload) {
    return adaptLegacyGeneration(attrs);
  }
  return {
    appId: attrs.appId || undefined,
    appType: attrs.appType === 'native' || attrs.appType === 'miniapp' ? attrs.appType : undefined,
    model: attrs.model || undefined,
    aiSDKPayload: parseJsonAttr(attrs.aiSDKPayload) as SdkPayload | undefined,
    userReaction: parseReaction(attrs[USER_REACTION_ATTR]),
  };
}

// ── Drive client factory ─────────────────────────────────────────────

export function createDriveClient(f: AuthenticatedFetch, apiUrl: string, rootFolderName: string): DriveClient {
  let cachedRootUid: string | null = null;
  let rootPromise: Promise<string | null> | null = null;

  const jsonPost = async (path: string, body: unknown): Promise<Response> =>
    f(`${apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  const jsonGet = async (path: string): Promise<Response> =>
    f(`${apiUrl}${path}`);

  // ── Folder resolution ────────────────────────────────────────────

  async function findFolderByPath(name: string): Promise<string | null> {
    try {
      const res = await jsonGet(`/cloud-storage/v1/me/files-by-path?path=${encodeURIComponent(name)}`);
      if (!res.ok) return null;
      const data = await res.json() as Record<string, unknown>;
      if (data.status !== 'success') return null;
      const response = data.response;
      const file = Array.isArray(response) ? response[0] : response;
      return (file as Record<string, unknown>)?.uid as string ?? null;
    } catch { return null; }
  }

  async function findFolderInList(name: string, parentUid?: string): Promise<string | null> {
    try {
      const params = parentUid
        ? `parentFolderUid=${parentUid}&fileTypes=FOLDER&limit=100`
        : `fileTypes=FOLDER&limit=100`;
      const res = await jsonGet(`/cloud-storage/v1/me/files?${params}`);
      if (!res.ok) return null;
      const data = await res.json() as Record<string, unknown>;
      const response = data.response;
      const files = (Array.isArray(response) ? response : []) as Record<string, unknown>[];
      const match = files.find(f => String(f.name || '').toLowerCase() === name.toLowerCase());
      return match?.uid as string ?? null;
    } catch { return null; }
  }

  async function createFolder(name: string, parentUid?: string): Promise<string | null> {
    try {
      const body: Record<string, string> = { name };
      if (parentUid) body.parentFolderUid = parentUid;
      const res = await jsonPost('/cloud-storage/v1/me/folders', body);
      if (!res.ok) return null;
      const data = await res.json() as Record<string, unknown>;
      const response = data.response as Record<string, unknown> | undefined;
      return response?.uid as string ?? null;
    } catch { return null; }
  }

  async function resolveRootFolder(): Promise<string | null> {
    // Step 1: find by path
    const byPath = await findFolderByPath(rootFolderName);
    if (byPath) return byPath;

    // Step 2: find in root listing
    const inList = await findFolderInList(rootFolderName);
    if (inList) return inList;

    // Step 3: double-check before creating (prevent race-condition duplicates)
    const recheck = await findFolderByPath(rootFolderName);
    if (recheck) return recheck;

    // Step 4: create it
    return createFolder(rootFolderName);
  }

  async function ensureRootFolder(): Promise<string | null> {
    if (cachedRootUid) return cachedRootUid;
    if (!rootPromise) {
      rootPromise = resolveRootFolder().then(uid => {
        cachedRootUid = uid;
        rootPromise = null;
        return uid;
      }).catch(err => {
        // Keep failed promise cached for 10s to prevent retry flooding
        setTimeout(() => { rootPromise = null; }, 10_000);
        throw err;
      });
    }
    return rootPromise;
  }

  // ── Shared internal helpers ──────────────────────────────────────

  async function fetchFolders(parentUid?: string): Promise<DriveFolder[]> {
    try {
      const params = parentUid
        ? `parentFolderUid=${parentUid}&fileTypes=FOLDER&limit=100`
        : `fileTypes=FOLDER&limit=100`;
      const res = await jsonGet(`/cloud-storage/v1/me/files?${params}`);
      if (!res.ok) return [];
      const data = await res.json() as Record<string, unknown>;
      const files = (Array.isArray(data.response) ? data.response : []) as Record<string, unknown>[];
      return files
        .filter(f => f.uid && f.name)
        .map(f => ({ name: String(f.name), uid: String(f.uid) }));
    } catch { return []; }
  }

  async function fetchMedia(opts: {
    folderUid?: string;
    type?: MediaTypeFilter;
  }): Promise<Record<string, unknown>[]> {
    try {
      const endpoint = opts.folderUid
        ? '/cloud-storage/v1/me/files'
        : '/cloud-storage/v1/me/flattened-files';
      const params = [
        opts.folderUid ? `parentFolderUid=${opts.folderUid}` : '',
        'limit=100',
        'sortType=UPDATED',
        'sortOrder=DESC',
        'fileTypes=FILE',
        `contentResourceTypes=${contentResourceTypes(opts.type)}`,
      ].filter(Boolean).join('&');
      const res = await jsonGet(`${endpoint}?${params}`);
      if (!res.ok) return [];
      const data = await res.json() as Record<string, unknown>;
      return (Array.isArray(data.response) ? data.response : []) as Record<string, unknown>[];
    } catch { return []; }
  }

  async function fetchFileByUid(fileUid: string): Promise<Record<string, unknown> | null> {
    try {
      const res = await jsonGet(`/drive/v1/files/${fileUid}`);
      if (!res.ok) return null;
      const data = await res.json() as Record<string, unknown>;
      const file = data.response;
      return file && typeof file === 'object' && !Array.isArray(file)
        ? file as Record<string, unknown>
        : null;
    } catch { return null; }
  }

  /** Set (or clear, when null) the user's reaction on a Drive file. */
  async function setReaction(fileUid: string, reaction: UserReaction | null): Promise<boolean> {
    try {
      const res = await f(`${apiUrl}/drive/v1/files/${fileUid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attributes: { [USER_REACTION_ATTR]: reaction } }),
      });
      return res.ok;
    } catch { return false; }
  }

  // ── Public API ───────────────────────────────────────────────────

  return {
    /**
     * Ensure a subfolder exists inside the root folder.
     * Creates both root and subfolder if needed. Returns the folder reference.
     * Call with no argument to just ensure the root folder exists.
     */
    async ensureFolder(subfolder?: string): Promise<DriveFolder | null> {
      const rootUid = await ensureRootFolder();
      if (!rootUid) return null;

      if (!subfolder) {
        return { name: rootFolderName, uid: rootUid };
      }

      // Find or create the subfolder
      const existingUid = await findFolderInList(subfolder, rootUid);
      if (existingUid) return { name: subfolder, uid: existingUid };

      const newUid = await createFolder(subfolder, rootUid);
      if (!newUid) return null;
      return { name: subfolder, uid: newUid };
    },

    /** List subfolders inside the root folder (boards). */
    async folders(): Promise<DriveFolder[]> {
      const rootUid = await ensureRootFolder();
      if (!rootUid) return [];
      return fetchFolders(rootUid);
    },

    /** List top-level Drive folders + root subfolders, deduplicated. */
    async allFolders(): Promise<DriveFolder[]> {
      const rootUid = await ensureRootFolder();
      const [rootLevel, subfolders] = await Promise.all([
        fetchFolders(),
        rootUid ? fetchFolders(rootUid) : Promise.resolve([]),
      ]);
      const seen = new Set<string>();
      const merged: DriveFolder[] = [];
      for (const folder of [...rootLevel, ...subfolders]) {
        if (seen.has(folder.uid)) continue;
        seen.add(folder.uid);
        merged.push(folder);
      }
      return merged;
    },

    /** Find a folder by name (case-insensitive) across root and subfolders. */
    async findFolder(name: string): Promise<DriveFolder | null> {
      if (name.toLowerCase() === rootFolderName.toLowerCase()) {
        const uid = await ensureRootFolder();
        return uid ? { name: rootFolderName, uid } : null;
      }
      const rootUid = await ensureRootFolder();
      const [rootLevel, subfolders] = await Promise.all([
        fetchFolders(),
        rootUid ? fetchFolders(rootUid) : Promise.resolve([]),
      ]);
      const lowerName = name.toLowerCase();
      return [...rootLevel, ...subfolders].find(f => f.name.toLowerCase() === lowerName) ?? null;
    },

    /**
     * List media items. When no folder is given, lists across all folders (flattened).
     * Optionally filter by media type (sent to backend, not client-side).
     */
    async list(options?: ListOptions): Promise<DriveMediaItem[]> {
      const folderUid = options?.folder?.uid ?? undefined;
      const files = await fetchMedia({ folderUid, type: options?.type });
      const items: DriveMediaItem[] = [];
      for (const file of files) {
        const item = toMediaItem(file);
        if (item) items.push(item);
      }
      return items;
    },

    /**
     * List media items with full generation metadata (model, prompt, params, etc.).
     * Same options as list() — folder and type filter.
     */
    async listDetailed(options?: ListOptions): Promise<DriveFileDetails[]> {
      const folderUid = options?.folder?.uid ?? undefined;
      const files = await fetchMedia({ folderUid, type: options?.type });
      const items: DriveFileDetails[] = [];
      for (const file of files) {
        const item = toDetailedItem(file);
        if (item) items.push(item);
      }
      return items;
    },

    async getGeneration(fileUid: string): Promise<GenerationFile | null> {
      const file = await fetchFileByUid(fileUid);
      return file ? parseGeneration(file) : null;
    },

    /** Save a file to Drive. Returns save result or null on failure. */
    async save(params: SaveParams, folder?: DriveFolder): Promise<DriveSaveResult | null> {
      const targetUid = folder?.uid ?? await ensureRootFolder();
      if (!targetUid) return null;
      const targetFolder = folder ?? { name: rootFolderName, uid: targetUid };

      const body = {
        name: params.name,
        sourceUrl: params.url,
        parentFolderUid: targetUid,
        content: {
          type: 'STANDALONE',
          resourceType: params.resourceType,
          sourcePlatform: 'WEB',
        },
        preview: {
          url: params.previewUrl || params.url,
          width: 1024,
          height: 1024,
        },
        attributes: Object.entries(params.attributes ?? {}).map(([property, value]) => ({
          property,
          value,
        })),
      };

      try {
        let res = await jsonPost('/cloud-storage/v1/me/files', body);

        // Retry with safe name if restricted keywords
        if (res.status === 400) {
          const text = await res.text();
          if (text.includes('restricted_keywords')) {
            const ext = params.name.split('.').pop() || 'png';
            body.name = `ai-generation-${Date.now()}.${ext}`;
            res = await jsonPost('/cloud-storage/v1/me/files', body);
          } else {
            return null;
          }
        }

        if (!res.ok) return null;
        const data = await res.json() as Record<string, unknown>;
        const file = data.response as Record<string, unknown> | undefined;
        const uid = file?.uid as string | undefined;
        if (!uid) return null;

        return { uid, folder: targetFolder };
      } catch { return null; }
    },

    /** Build standard save params from a generation result. */
    buildSaveParams(url: string, modelId: string, modelName: string, mode: string, prompt?: string): SaveParams {
      return {
        url,
        name: buildFilename(prompt, mode),
        resourceType: inferResourceType(mode),
        attributes: {
          tool: 'ai-sdk',
          model: modelId,
          prompt: prompt || '',
          service: modelName,
        },
      };
    },

    async addReaction(fileUid: string, reaction: UserReaction): Promise<boolean> {
      return setReaction(fileUid, reaction);
    },

    async removeReaction(fileUid: string): Promise<boolean> {
      return setReaction(fileUid, null);
    },
  };
}

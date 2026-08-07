export { createClient } from './client/index.ts';
export { inferResourceType, buildFilename, parseGeneration, buildGenerationAttributes } from './client/index.ts';
export { ApiRunMode } from './client/index.ts';
/** @deprecated Use `Model` accessor instead — `Model(id).params()` replaces `Models.hasParam()` / `Models.getFileParam()` etc. */
export { Models } from './generated/model-constants.ts';
export { getVoiceById } from './core/voices.ts';

export type {
  GenerateResult,
  GenerateResultItem,
  GenerateTextResult,
  GenerateOptions,
  ClientConfig,
  AuthenticatedFetch,
  SdkTransport,
  WorkflowJobHandle,
  DriveConfig,
  DriveClient,
  DriveFolder,
  DriveSaveResult,
  AppType,
  AppIdentity,
  PayloadDriveOptions,
  PayloadDriveFolderOptions,
  DriveMediaItem,
  DriveFileDetails,
  ListOptions,
  MediaTypeFilter,
  SaveParams,
  UserReaction,
  GenerationFile,
  DriveFile,
  SdkPayload,
  DriveAttributes,
  AiClient,
  ApiResponse,
  ApiRunOptions,
  ApiSchemas,
  ApisClient,
} from './client/index.ts';
export type {
  ModelDefinition,
  GenerationContext,
  GenerationMode,
  ReleaseTag,
  VoiceOption,
  AvatarOption,
  ParamOption,
} from './core/types.ts';

// ── Voice/avatar catalogs (platform catalog tasks) ──────────────────
export type {
  CatalogItem,
  CatalogPreview,
  CatalogQuery,
  CatalogResult,
  CatalogKind,
  CatalogSource,
} from './core/catalogs.ts';
export { toVoiceOption, toAvatarOption } from './core/catalogs.ts';
export type { CatalogsClient, CatalogPage, CatalogPageOptions, CatalogsOptions } from './client/index.ts';
export type { TypedModelId, ModelInput, ModelInputById, TextModelId, TextModelInputById } from './generated/model-input-types.ts';
export type { MediaModelId } from './client/index.ts';


// ── Param Descriptor Types (internal utilities accessed via Models.*) ─

export type {
  ParamDescriptor,
  ParamEntry,
  ModelParams,
  EnumDescriptor,
  EnumOption,
  CatalogDescriptor,
  RangeDescriptor,
  BooleanDescriptor,
  TextDescriptor,
  FileDescriptor,
  ObjectDescriptor,
  EnumEntry,
  CatalogEntry,
  RangeEntry,
  BooleanEntry,
  TextEntry,
  FileEntry,
  ObjectEntry,
  EntryMeta,
  FlatParamEntry,
  ModelDescriptor,
  ModelFilter,
  ValidationResult,
  ModelParamsAccessor,
  ModelMeta,
  ProviderInfo,
  CreditRange,
  CreditRangeContext,
  PricingOptions,
} from './core/descriptors/index.ts';

// ── Model accessor ──────────────────────────────────────────────────
export { Model, catalog } from './core/descriptors/index.ts';

// ── Deep linking ────────────────────────────────────────────────────
export type { DeepLinkResult } from './core/deeplink/index.ts';
export { encodeDeepLinkPayload, decodeDeepLinkPayload } from './core/deeplink/index.ts';

export { ALL_MODELS, getModelsByMode } from './vendors/catalog/index.ts';
export { isVisibleForReleases, releaseOf, DEFAULT_VISIBLE_RELEASES } from './core/visibility.ts';
export { getModel, findModel } from './core/model-registry.ts';
export { KLING_DUAL_IMAGE_EFFECTS } from './vendors/catalog/kling/index.ts';

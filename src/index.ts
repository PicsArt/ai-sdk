export { createClient, GenerationEventType } from './client/index.ts';
export { inferResourceType, buildFilename, resolveExtension, expectedOutputFormat, parseGeneration, buildGenerationAttributes } from './client/index.ts';
export { ApiRunMode } from './client/index.ts';
export { getVoiceById } from './core/voices.ts';

// ── Errors ──────────────────────────────────────────────────────────
// Every failure the SDK throws is an ApiError carrying
// { status, code, reason, message } — the generation surface, the async
// lifecycle, `ai.catalogs` and the low-level `ai.apis` alike. Neither the
// workflows client's error type nor a custom transport's reaches a caller.
export { ApiError } from './core/errors.ts';
export type { ApiErrorCode, ApiErrorInit } from './core/errors.ts';
export type { SeedanceDraftTask } from './core/response.ts';

// ── Catalog loading ─────────────────────────────────────────────────
// The SDK is dynamic-only: `ai.initModelCatalog()` loads the model catalog
// from models-hub and every generation rides the `v1/models` workflow.
export type { InitModelCatalogOptions } from './client/types.ts';
export type { ModelCatalogFilters } from './core/catalog-store.ts';
export type { CatalogModel, CatalogParam, CatalogProvider, CatalogModelsResponse } from './core/catalog-wire.ts';
export type { ModelsCommand, ModelsGenAIOptions } from './client/prepare.ts';

export type {
  GenerateResult,
  GenerateResultItem,
  GenerateResultItemMetadata,
  GenerateTextResult,
  RunResponse,
  GenerateOptions,
  GenerationEvent,
  GenerationOptions,
  ClientConfig,
  AuthenticatedFetch,
  SdkTransport,
  TransportResult,
  TransportPollOptions,
  WorkflowSubmitRequest,
  WorkflowJobHandle,
  GenerationProgress,
  CreditUsage,
  OptionsResult,
  ToolUsage,
  DriveConfig,
  DriveClient,
  DriveFolder,
  DriveSaveResult,
  AppType,
  AppIdentity,
  PayloadDriveOptions,
  PayloadDriveFolderOptions,
  PayloadInputsTransformationOptions,
  DriveMediaItem,
  DriveFileDetails,
  DriveDraftInfo,
  ListOptions,
  MediaTypeFilter,
  SaveParams,
  GenerationProvenance,
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
  CatalogSource,
} from './core/catalogs.ts';
export { toVoiceOption, toAvatarOption } from './core/catalogs.ts';
export type { CatalogsClient, CatalogPage, CatalogPageOptions, CatalogsOptions } from './client/index.ts';
export type { MediaModelId } from './client/index.ts';

// Typed per-model input contracts. The SDK no longer generates these — they are
// owned by models-hub (the catalog's source of truth) and re-exported here so
// SDK users keep the typed-input surface (`ModelInput<'flux-2-pro'>`, …) they
// had before, with no duplicated/bundled copy.
export type {
  ModelInputById,
  ModelInput,
  TypedModelId,
  TextModelId,
  TextModelInputById,
  JsonModelId,
} from '@picsart/model-types';


// ── Param Descriptor Types (surfaced via the Model()/catalog accessors) ─

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
  UnknownDescriptor,
  EnumEntry,
  CatalogEntry,
  RangeEntry,
  BooleanEntry,
  TextEntry,
  FileEntry,
  ObjectEntry,
  UnknownEntry,
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
  CreditTier,
  PricingOptions,
} from './core/descriptors/index.ts';

// ── Model accessor ──────────────────────────────────────────────────
export { Model, catalog } from './core/descriptors/index.ts';

// ── Deep linking ────────────────────────────────────────────────────
export type { DeepLinkResult } from './core/deeplink/index.ts';
export { encodeDeepLinkPayload, decodeDeepLinkPayload } from './core/deeplink/index.ts';

export { isVisibleForReleases, releaseOf, DEFAULT_VISIBLE_RELEASES } from './core/visibility.ts';
export { getModel, findModel } from './core/model-registry.ts';

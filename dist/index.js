import { __commonJS, __toESM } from './chunk-4VNS5WPM.js';
import { deflateSync, inflateSync } from 'fflate';

// ../../node_modules/@picsart/pa-model-pricing-sdk/build/lib/errors/ModelPricingClientError.js
var require_ModelPricingClientError = __commonJS({
  "../../node_modules/@picsart/pa-model-pricing-sdk/build/lib/errors/ModelPricingClientError.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModelPricingClientError = void 0;
    var ModelPricingClientError = class extends Error {
      constructor(action, status, responseBody) {
        const body = responseBody;
        super(`ModelPricingClientError: [${status}] ${action} failed: ${(body === null || body === void 0 ? void 0 : body.reason) || ""} - ${(body === null || body === void 0 ? void 0 : body.message) || ""}`);
        this.name = this.constructor.name;
        this.status = status;
        this.details = responseBody;
      }
    };
    exports.ModelPricingClientError = ModelPricingClientError;
  }
});

// ../../node_modules/@picsart/pa-model-pricing-sdk/build/lib/errors/ModelPricingServerError.js
var require_ModelPricingServerError = __commonJS({
  "../../node_modules/@picsart/pa-model-pricing-sdk/build/lib/errors/ModelPricingServerError.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModelPricingServerError = void 0;
    var ModelPricingServerError = class extends Error {
      constructor(message) {
        super(`ModelPricingServerError: ${message}`);
        this.name = this.constructor.name;
      }
    };
    exports.ModelPricingServerError = ModelPricingServerError;
  }
});

// ../../node_modules/@picsart/pa-model-pricing-sdk/build/lib/errors/ModelPricingUnknownError.js
var require_ModelPricingUnknownError = __commonJS({
  "../../node_modules/@picsart/pa-model-pricing-sdk/build/lib/errors/ModelPricingUnknownError.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModelPricingUnknownError = void 0;
    var ModelPricingUnknownError = class extends Error {
      constructor(message) {
        super(`ModelPricingUnknownError: ${message}`);
        this.name = this.constructor.name;
      }
    };
    exports.ModelPricingUnknownError = ModelPricingUnknownError;
  }
});

// ../../node_modules/@picsart/pa-model-pricing-sdk/build/lib/ModelPricingClient.js
var require_ModelPricingClient = __commonJS({
  "../../node_modules/@picsart/pa-model-pricing-sdk/build/lib/ModelPricingClient.js"(exports) {
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModelPricingClient = void 0;
    var ModelPricingClientError_1 = require_ModelPricingClientError();
    var ModelPricingServerError_1 = require_ModelPricingServerError();
    var ModelPricingUnknownError_1 = require_ModelPricingUnknownError();
    var DEFAULT_REFRESH_INTERVAL_MS = 6e5;
    var USER_DISCOUNTS_REFRESH_INTERVAL_MS = 3e4;
    var DEFAULT_TIMEOUT_MS = 5e3;
    var ModelPricingClient2 = class {
      constructor(options) {
        var _a;
        this.pricing = null;
        this.userDiscounts = null;
        this.refreshTimer = null;
        this.userDiscountsRefreshTimer = null;
        this.defaultHeaders = {
          Accept: "application/json"
        };
        this.options = options;
        this.options.timeoutMs = (_a = options.timeoutMs) !== null && _a !== void 0 ? _a : DEFAULT_TIMEOUT_MS;
        this.modelPricingApiBaseUrl = options.baseUrl.replace(/\/+$/, "");
      }
      /**
       * Loads pricing data and starts the periodic refresh scheduler.
       * Must be called and awaited before getModelPricing.
       */
      init() {
        return __awaiter(this, void 0, void 0, function* () {
          var _a;
          yield this.loadAll();
          const refreshIntervalMs = (_a = this.options.refreshIntervalMs) !== null && _a !== void 0 ? _a : DEFAULT_REFRESH_INTERVAL_MS;
          if (refreshIntervalMs > 0 && this.refreshTimer == null) {
            this.refreshTimer = setInterval(() => {
              this.loadPricing().catch(() => {
              });
            }, refreshIntervalMs);
            if (typeof this.refreshTimer.unref === "function") {
              this.refreshTimer.unref();
            }
          }
          if (this.userDiscountsRefreshTimer == null) {
            this.userDiscountsRefreshTimer = setInterval(() => {
              this.loadUserDiscounts().catch(() => {
              });
            }, USER_DISCOUNTS_REFRESH_INTERVAL_MS);
            if (typeof this.userDiscountsRefreshTimer.unref === "function") {
              this.userDiscountsRefreshTimer.unref();
            }
          }
        });
      }
      /**
       * Stops the periodic refresh scheduler.
       */
      stop() {
        if (this.refreshTimer != null) {
          clearInterval(this.refreshTimer);
          this.refreshTimer = null;
        }
        if (this.userDiscountsRefreshTimer != null) {
          clearInterval(this.userDiscountsRefreshTimer);
          this.userDiscountsRefreshTimer = null;
        }
      }
      /**
       * Returns model pricings matching the given filters from the in-memory cache.
       * Throws if pricing has not been loaded yet — call and await init() first.
       */
      getModelPricing(filters = {}) {
        var _a, _b, _c, _d, _e;
        if (this.pricing == null) {
          throw new Error("ModelPricingClient: pricing not loaded. Call and await init() before getModelPricing().");
        }
        const filtered = this.applyFilters(this.pricing, filters);
        const countryCode = ((_a = filters.countryCode) === null || _a === void 0 ? void 0 : _a.trim()) || void 0;
        const touchpoint = ((_b = filters.touchpoint) === null || _b === void 0 ? void 0 : _b.trim()) || void 0;
        const platform = ((_c = filters.platform) === null || _c === void 0 ? void 0 : _c.trim()) || void 0;
        const packageId = ((_d = filters.packageId) === null || _d === void 0 ? void 0 : _d.trim()) || void 0;
        const withOverrides = this.applyCreditOverrides(filtered, countryCode, touchpoint, platform, packageId);
        return this.applyUserDiscounts(withOverrides, ((_e = filters.userId) === null || _e === void 0 ? void 0 : _e.trim()) || void 0);
      }
      loadAll() {
        return __awaiter(this, void 0, void 0, function* () {
          yield Promise.all([this.loadPricing(), this.loadUserDiscounts()]);
        });
      }
      loadPricing() {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const url = `${this.modelPricingApiBaseUrl}/pricing-management/model-pricing`;
            const response = yield this._fetch(url, {
              method: "GET",
              signal: AbortSignal.timeout(this.options.timeoutMs)
            });
            const data = yield this.toSuccessResponse(response, "getModelPricing");
            this.pricing = data.response;
          } catch (error) {
            throw this.wrapError("getModelPricing", error);
          }
        });
      }
      loadUserDiscounts() {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const url = `${this.modelPricingApiBaseUrl}/pricing-management/user-discounts/public`;
            const response = yield this._fetch(url, {
              method: "GET",
              signal: AbortSignal.timeout(this.options.timeoutMs)
            });
            const data = yield this.toSuccessResponse(response, "getUserDiscounts");
            this.userDiscounts = this.indexUserDiscounts(data.response);
          } catch (error) {
            console.error(`ModelPricingClient: failed to load user discounts - ${error.message}`);
            if (this.userDiscounts == null) {
              this.userDiscounts = /* @__PURE__ */ new Map();
            }
          }
        });
      }
      indexUserDiscounts(discounts) {
        const index = /* @__PURE__ */ new Map();
        for (const discount of discounts) {
          let byModel = index.get(discount.userId);
          if (byModel == null) {
            byModel = /* @__PURE__ */ new Map();
            index.set(discount.userId, byModel);
          }
          const list = byModel.get(discount.modelId);
          if (list == null)
            byModel.set(discount.modelId, [discount]);
          else
            list.push(discount);
        }
        return index;
      }
      applyUserDiscounts(items, userId) {
        var _a;
        if (userId == null)
          return items;
        const byModel = (_a = this.userDiscounts) === null || _a === void 0 ? void 0 : _a.get(userId);
        if (byModel == null || byModel.size === 0)
          return items;
        const now = Date.now();
        return items.map((item) => {
          const discounts = byModel.get(item.metadata.modelId);
          if (discounts == null || discounts.length === 0)
            return item;
          let bestPercent = 0;
          for (const discount of discounts) {
            const expiresAt = Date.parse(discount.expirationDate);
            const active = Number.isNaN(expiresAt) || expiresAt >= now;
            if (active && discount.discountPercent > bestPercent) {
              bestPercent = discount.discountPercent;
            }
          }
          if (bestPercent <= 0)
            return item;
          const pct = Math.min(bestPercent, 100);
          const discounted = Math.round(item.credits * (1 - pct / 100));
          return Object.assign(Object.assign({}, item), { credits: discounted, originalCredits: item.credits });
        });
      }
      applyFilters(items, filters) {
        return items.filter((item) => {
          if (filters.vendor != null && item.metadata.vendor !== filters.vendor)
            return false;
          if (filters.modelId != null && item.metadata.modelId !== filters.modelId)
            return false;
          if (filters.operationId != null && item.operationId !== filters.operationId)
            return false;
          if (filters.useCase != null && item.metadata.useCase !== filters.useCase)
            return false;
          if (filters.quality != null && item.metadata.quality !== filters.quality)
            return false;
          if (filters.audio != null && item.metadata.audio !== filters.audio)
            return false;
          return true;
        });
      }
      applyCreditOverrides(items, countryCode, touchpoint, platform, packageId) {
        if (countryCode == null && touchpoint == null && platform == null && packageId == null)
          return items;
        console.log(`Applying credit overrides for countryCode: ${countryCode}, touchpoint: ${touchpoint}, platform: ${platform} and packageId: ${packageId}`);
        return items.map((item) => {
          var _a, _b, _c;
          if (!((_a = item.creditOverrides) === null || _a === void 0 ? void 0 : _a.length))
            return item;
          let matchedCredits;
          for (const co of item.creditOverrides) {
            const countryMatch = co.countries.length === 0 || countryCode != null && co.countries.some((c) => c.toLowerCase() === countryCode.toLowerCase());
            const touchpointMatch = co.touchpoints.length === 0 || touchpoint != null && co.touchpoints.some((t) => t.toLowerCase() === touchpoint.toLowerCase());
            const platforms = (_b = co.platforms) !== null && _b !== void 0 ? _b : [];
            const platformMatch = platforms.length === 0 || platform != null && platforms.some((p2) => p2.toLowerCase() === platform.toLowerCase());
            const packageIds = (_c = co.packageIds) !== null && _c !== void 0 ? _c : [];
            const packageMatch = packageIds.length === 0 || packageId != null && packageIds.some((p2) => p2.toLowerCase() === packageId.toLowerCase());
            if (countryMatch && touchpointMatch && platformMatch && packageMatch) {
              matchedCredits = co.credits;
            }
          }
          if (matchedCredits == null)
            return item;
          return Object.assign(Object.assign({}, item), { credits: matchedCredits });
        });
      }
      toSuccessResponse(response, actionName) {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.throwIfError(response, actionName);
          return yield response.json();
        });
      }
      throwIfError(response, actionName) {
        return __awaiter(this, void 0, void 0, function* () {
          if (response.status >= 500) {
            let message;
            try {
              const errorResponse = yield response.json();
              message = errorResponse.message || errorResponse.reason || "Unknown error";
            } catch (_a) {
              message = "Non json response was returned from server";
            }
            throw new ModelPricingServerError_1.ModelPricingServerError(`[${response.status}] - ${actionName} failed with message: ${message}.`);
          }
          if (!response.ok) {
            throw new ModelPricingClientError_1.ModelPricingClientError(actionName, response.status, yield response.json());
          }
        });
      }
      wrapError(actionName, error) {
        if (error instanceof ModelPricingClientError_1.ModelPricingClientError || error instanceof ModelPricingServerError_1.ModelPricingServerError || error instanceof DOMException) {
          return error;
        }
        return new ModelPricingUnknownError_1.ModelPricingUnknownError(`modelPricing.${actionName} failed - ${error.message}`);
      }
      buildRequestHeaders(initHeaders) {
        const headers = new Headers(initHeaders);
        const optionHeaders = new Headers(Object.assign(Object.assign({}, this.defaultHeaders), this.options.headers));
        for (const [key, value] of optionHeaders.entries()) {
          if (!headers.has(key)) {
            headers.set(key, value);
          }
        }
        return headers;
      }
      _fetch(input, init) {
        return __awaiter(this, void 0, void 0, function* () {
          const headers = this.buildRequestHeaders(init === null || init === void 0 ? void 0 : init.headers);
          const requestInit = Object.assign(Object.assign({}, init), { headers });
          if (this.options.fetch) {
            return this.options.fetch(input, Object.assign(Object.assign({}, requestInit), { headers: Object.fromEntries(headers.entries()) }));
          }
          return fetch(input, requestInit);
        });
      }
    };
    exports.ModelPricingClient = ModelPricingClient2;
  }
});

// ../../node_modules/@picsart/pa-model-pricing-sdk/build/lib/types.js
var require_types = __commonJS({
  "../../node_modules/@picsart/pa-model-pricing-sdk/build/lib/types.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PricingUnit = exports.UseCase = void 0;
    var UseCase;
    (function(UseCase2) {
      UseCase2["TextToImage"] = "text-to-image";
      UseCase2["ImageToImage"] = "image-to-image";
      UseCase2["TextToVideo"] = "text-to-video";
      UseCase2["ImageToVideo"] = "image-to-video";
      UseCase2["VideoToVideo"] = "video-to-video";
      UseCase2["VideoToImage"] = "video-to-image";
      UseCase2["TextToSpeech"] = "text-to-speech";
      UseCase2["TextToAudio"] = "text-to-audio";
      UseCase2["SpeechToText"] = "speech-to-text";
      UseCase2["ImageToAudio"] = "image-to-audio";
      UseCase2["AudioToAudio"] = "audio-to-audio";
      UseCase2["SpeechToSpeech"] = "speech-to-speech";
      UseCase2["ChatCompletions"] = "chat-completions";
      UseCase2["AudioToVideo"] = "audio-to-video";
      UseCase2["VideoToAudio"] = "video-to-audio";
    })(UseCase || (exports.UseCase = UseCase = {}));
    var PricingUnit;
    (function(PricingUnit2) {
      PricingUnit2["Generation"] = "generation";
      PricingUnit2["Megapixel"] = "megapixel";
      PricingUnit2["Second"] = "second";
      PricingUnit2["ThirtySecond"] = "30_second";
      PricingUnit2["Minute"] = "minute";
      PricingUnit2["ThousandCharacters"] = "1k_characters";
      PricingUnit2["InputTokens"] = "input_tokens";
      PricingUnit2["InputTextTokens"] = "input_text_tokens";
      PricingUnit2["InputCachedTokens"] = "input_cached_tokens";
      PricingUnit2["CacheWrite5mTokens"] = "cache_write_5m_tokens";
      PricingUnit2["CacheWrite1hTokens"] = "cache_write_1h_tokens";
      PricingUnit2["InputImageTokens"] = "input_image_tokens";
      PricingUnit2["OutputImageTokens"] = "output_image_tokens";
      PricingUnit2["OutputAudioTokens"] = "output_audio_tokens";
      PricingUnit2["OutputTextTokens"] = "output_text_tokens";
      PricingUnit2["InputMegapixel"] = "input_megapixel";
      PricingUnit2["OutputMegapixel"] = "output_megapixel";
      PricingUnit2["OutputMegapixelAdditional"] = "output_megapixel_additional";
      PricingUnit2["ThousandOutputVideoTokens"] = "1k_output_video_tokens";
    })(PricingUnit || (exports.PricingUnit = PricingUnit = {}));
  }
});

// ../../node_modules/@picsart/pa-model-pricing-sdk/build/index.js
var require_build = __commonJS({
  "../../node_modules/@picsart/pa-model-pricing-sdk/build/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PricingUnit = exports.UseCase = exports.ModelPricingUnknownError = exports.ModelPricingServerError = exports.ModelPricingClientError = exports.ModelPricingClient = void 0;
    var ModelPricingClient_1 = require_ModelPricingClient();
    Object.defineProperty(exports, "ModelPricingClient", { enumerable: true, get: function() {
      return ModelPricingClient_1.ModelPricingClient;
    } });
    var ModelPricingClientError_1 = require_ModelPricingClientError();
    Object.defineProperty(exports, "ModelPricingClientError", { enumerable: true, get: function() {
      return ModelPricingClientError_1.ModelPricingClientError;
    } });
    var ModelPricingServerError_1 = require_ModelPricingServerError();
    Object.defineProperty(exports, "ModelPricingServerError", { enumerable: true, get: function() {
      return ModelPricingServerError_1.ModelPricingServerError;
    } });
    var ModelPricingUnknownError_1 = require_ModelPricingUnknownError();
    Object.defineProperty(exports, "ModelPricingUnknownError", { enumerable: true, get: function() {
      return ModelPricingUnknownError_1.ModelPricingUnknownError;
    } });
    var types_1 = require_types();
    Object.defineProperty(exports, "UseCase", { enumerable: true, get: function() {
      return types_1.UseCase;
    } });
    Object.defineProperty(exports, "PricingUnit", { enumerable: true, get: function() {
      return types_1.PricingUnit;
    } });
  }
});

// src/core/errors.ts
var ApiError = class extends Error {
  /** HTTP status, or the synthesized equivalent for non-HTTP failures. */
  status;
  /** Platform `reason`, or an SDK-synthesized code. Always equal to {@link reason}. */
  code;
  /** Alias of {@link code}, named after the platform's own error field. */
  reason;
  constructor(message, init) {
    super(message);
    this.name = "ApiError";
    this.status = init.status;
    this.code = init.code;
    this.reason = init.code;
  }
};
var CODE_BY_STATUS = {
  400: "bad_request",
  401: "unauthorized",
  402: "payment_required",
  403: "forbidden",
  404: "not_found",
  408: "timeout",
  409: "conflict",
  413: "payload_too_large",
  422: "unprocessable_entity",
  429: "rate_limited",
  500: "server_error",
  502: "bad_gateway",
  503: "service_unavailable",
  504: "gateway_timeout"
};
function codeForStatus(status) {
  return CODE_BY_STATUS[status] ?? (status >= 500 ? "server_error" : `http_${status}`);
}

// src/core/response.ts
function throwIfErrorResult(result, modelName) {
  if (!result || typeof result !== "object" || Array.isArray(result)) return;
  const obj = result;
  const status = obj.status ?? obj.statusCode;
  const message = obj.message ?? obj.error ?? obj.reason;
  const isError = typeof status === "number" && status >= 400 || (status === "error" || status === "FAILED");
  if (isError) {
    const code = typeof status === "number" ? ` (${status})` : "";
    const detail = message ? String(message) : "unknown error";
    const httpStatus = typeof status === "number" ? status : 502;
    const reason = obj.reason;
    throw new ApiError(`${modelName} failed${code}: ${detail}`, {
      status: httpStatus,
      code: typeof reason === "string" && reason.length > 0 ? reason : codeForStatus(httpStatus)
    });
  }
}
var isSeedanceDraftTask = (value) => {
  const v = value;
  return !!v && typeof v === "object" && typeof v.id === "string";
};
function toCompletedStatus(handle, result, raw, usage) {
  return {
    handle,
    status: "COMPLETED",
    result,
    raw,
    usage
  };
}

// src/core/active-catalog.ts
var _models = null;
var _generation = 0;
function installCatalog(models) {
  _models = models;
  _generation++;
}
function catalogGeneration() {
  return _generation;
}
function activeModels() {
  if (_models === null) {
    throw new ApiError(
      "Model catalog not loaded \u2014 call ai.initModelCatalog() before using the model catalog.",
      { status: 409, code: "catalog_not_loaded" }
    );
  }
  return _models;
}
function peekActiveModels() {
  return _models;
}

// src/core/visibility.ts
var DEFAULT_VISIBLE_RELEASES = ["production", "general-availability"];
var releaseOf = (m) => m.release ?? "production";
function isVisibleForReleases(m, releases = DEFAULT_VISIBLE_RELEASES) {
  if (m.deprecated) return false;
  return releases.includes(releaseOf(m));
}

// src/core/model-registry.ts
var _idx = null;
var _idxGen = -1;
function buildIndexes(models) {
  const byId = new Map(models.map((model) => [model.id, model]));
  const byModelId = /* @__PURE__ */ new Map();
  const byWorkflow = /* @__PURE__ */ new Map();
  const byName = /* @__PURE__ */ new Map();
  const ambiguousNames = /* @__PURE__ */ new Set();
  for (const model of models) {
    if (model.modelId && !byModelId.has(model.modelId)) {
      byModelId.set(model.modelId, model);
    }
    if (model.workflow && !byWorkflow.has(model.workflow)) {
      byWorkflow.set(model.workflow, model);
    }
    if (model.editWorkflow && !byWorkflow.has(model.editWorkflow)) {
      byWorkflow.set(model.editWorkflow, model);
    }
    const nameKey = model.name.trim().toLowerCase();
    if (!nameKey) continue;
    if (ambiguousNames.has(nameKey)) continue;
    if (byName.has(nameKey)) {
      byName.delete(nameKey);
      ambiguousNames.add(nameKey);
      continue;
    }
    byName.set(nameKey, model);
  }
  return { byId, byModelId, byWorkflow, byName, ambiguousNames };
}
function indexes() {
  const gen = catalogGeneration();
  if (!_idx || _idxGen !== gen) {
    _idx = buildIndexes(activeModels());
    _idxGen = gen;
  }
  return _idx;
}
var getModel = (id) => {
  const idx = indexes();
  return idx.byId.get(id) ?? idx.byModelId.get(id);
};
var findModel = (ref) => {
  const key = ref.trim();
  if (!key) return void 0;
  return getModel(key) ?? indexes().byWorkflow.get(key) ?? indexes().byName.get(key.toLowerCase());
};

// src/core/catalog-wire.ts
function toParamEntry(wire) {
  const { label, required, category, ...descriptor } = wire;
  const entry = { descriptor };
  if (label !== void 0) entry.label = label;
  if (required !== void 0) entry.required = required;
  if (category !== void 0) entry.category = category;
  return entry;
}
function invalidResponse(detail) {
  return new ApiError(`Invalid models-catalog response: ${detail}`, {
    status: 502,
    code: "invalid_response"
  });
}
function toModelDefinition(wire) {
  if (!wire || typeof wire.id !== "string" || !wire.provider) {
    throw invalidResponse("model entry is missing `id` or `provider`");
  }
  const paramConfig = {};
  for (const [key, param] of Object.entries(wire.params ?? {})) {
    paramConfig[key] = toParamEntry(param);
  }
  const def = {
    id: wire.id,
    name: wire.name,
    provider: wire.provider.id,
    providerName: wire.provider.name,
    providerColor: wire.provider.color,
    providerLabel: wire.provider.label,
    description: wire.description ?? "",
    features: wire.features ?? [],
    mode: wire.mode,
    inputType: wire.inputType,
    workflow: wire.workflow ?? "",
    paramConfig
  };
  if (wire.badges !== void 0) def.badge = wire.badges;
  if (wire.release !== void 0) def.release = wire.release;
  if (wire.addedAt !== void 0) def.addedAt = wire.addedAt;
  if (wire.estimatedTime !== void 0) def.estimatedTime = wire.estimatedTime;
  if (wire.deprecated !== void 0) def.deprecated = wire.deprecated;
  if (wire.constraints !== void 0) def.constraints = wire.constraints;
  if (wire.editWorkflow !== void 0) def.editWorkflow = wire.editWorkflow;
  if (wire.modelId !== void 0) def.modelId = wire.modelId;
  if (wire.syncExecute !== void 0) def.syncExecute = wire.syncExecute;
  return def;
}
function deserializeCatalog(json) {
  const body = json;
  if (!body || body.status !== "success" || !body.response || !Array.isArray(body.response.models)) {
    throw invalidResponse('expected `{ status: "success", response: { models: [...] } }`');
  }
  return body.response.models.map(toModelDefinition);
}

// src/core/catalog-store.ts
var CATALOG_PATH = "/gw-v2/v1/models-catalog";
var _loadPromise = null;
var _loaded = false;
var _key = null;
var keyOf = (apiUrl, filters) => `${apiUrl}::${JSON.stringify(filters ?? {})}`;
function buildQuery(filters) {
  const query = new URLSearchParams();
  query.set("include", "schema,constraints,routing");
  const join = (v) => Array.isArray(v) ? v.join(",") : v;
  if (filters?.mode) query.set("mode", join(filters.mode));
  if (filters?.provider) query.set("provider", join(filters.provider));
  if (filters?.release) query.set("release", join(filters.release));
  if (filters?.includeDeprecated) query.set("includeDeprecated", "true");
  if (filters?.search) query.set("search", filters.search);
  return query.toString();
}
async function fetchAndInstall(f, apiUrl, filters) {
  const url = `${apiUrl.replace(/\/+$/, "")}${CATALOG_PATH}?${buildQuery(filters)}`;
  const res = await f(url, { method: "GET" });
  if (!res.ok) {
    let reason;
    let message = `Model catalog request failed with status ${res.status}`;
    try {
      const body = await res.json();
      reason = body?.reason;
      if (body?.message) message = body.message;
    } catch {
    }
    throw new ApiError(message, { status: res.status, code: reason ?? codeForStatus(res.status) });
  }
  const models = deserializeCatalog(await res.json());
  installCatalog(models);
}
function loadModelCatalog(f, apiUrl, filters) {
  const key = keyOf(apiUrl, filters);
  if (_loadPromise) {
    if (_key !== key) {
      return Promise.reject(new ApiError(
        `Model catalog already ${_loaded ? "loaded" : "loading"} from "${_key?.split("::")[0]}" \u2014 one catalog source per process.`,
        { status: 409, code: "catalog_conflict" }
      ));
    }
    return _loadPromise;
  }
  _key = key;
  _loadPromise = fetchAndInstall(f, apiUrl, filters).then(() => {
    _loaded = true;
  }).catch((err) => {
    _loadPromise = null;
    _key = null;
    throw err;
  });
  return _loadPromise;
}
function whenModelCatalogLoaded() {
  return _loadPromise;
}

// src/core/constraints.ts
function normalize(r) {
  if ("required" in r) return null;
  if ("disabled" in r) return { kind: "disabled", reason: r.reason };
  return { kind: "allowed", allowed: r.allowed, reason: r.reason };
}
function matchOperator(op, actual) {
  if ("exists" in op) {
    const has = actual != null && (!Array.isArray(actual) || actual.length > 0) && (typeof actual !== "string" || actual.trim().length > 0);
    return op.exists ? has : !has;
  }
  if ("is" in op) return actual === op.is;
  return false;
}
function matchCondition(when, values) {
  return Object.entries(when).every(
    ([key, op]) => matchOperator(op, values[key])
  );
}
function merge(prev, next) {
  if (!prev) return next;
  if (prev.kind === "disabled" || next.kind === "disabled") {
    return { kind: "disabled", reason: next.kind === "disabled" ? next.reason : prev.kind === "disabled" ? prev.reason : void 0 };
  }
  const allowed = new Set(next.allowed.map(String));
  return {
    kind: "allowed",
    allowed: prev.allowed.filter((o) => allowed.has(String(o))),
    reason: next.reason ?? prev.reason
  };
}
function evaluateConstraints(constraints, values) {
  const effects = /* @__PURE__ */ new Map();
  if (!constraints?.length) return effects;
  for (const rule of constraints) {
    if (!matchCondition(rule.when, values)) continue;
    for (const [key, restriction] of Object.entries(rule.then)) {
      const normalized = normalize(restriction);
      if (normalized) effects.set(key, merge(effects.get(key), normalized));
    }
  }
  return effects;
}
function evaluateRequirements(constraints, values) {
  const requirements = /* @__PURE__ */ new Map();
  if (!constraints?.length) return requirements;
  for (const rule of constraints) {
    if (!matchCondition(rule.when, values)) continue;
    for (const [key, restriction] of Object.entries(rule.then)) {
      if ("required" in restriction && !requirements.has(key)) {
        requirements.set(key, { reason: restriction.reason });
      }
    }
  }
  return requirements;
}

// src/core/descriptors/utils.ts
function extractDefaults(params) {
  const defaults = {};
  for (const [key, entry] of Object.entries(params)) {
    const d = entry.descriptor;
    if ("default" in d) {
      defaults[key] = d.default;
    }
  }
  return defaults;
}
function validateDescriptor(key, d, val, required) {
  if (val == null || required && typeof val === "string" && val.trim().length === 0 || required && Array.isArray(val) && val.length === 0) {
    if (required) {
      throw new Error(`"${key}" is required`);
    }
    if (val == null) return;
  }
  switch (d.kind) {
    case "enum": {
      const ids = d.options.map(
        (o) => o.id
      );
      if (!ids.includes(val)) {
        throw new Error(
          `"${key}" must be one of: ${ids.join(", ")}`
        );
      }
      break;
    }
    case "catalog":
      if (typeof val !== "string") {
        throw new Error(`"${key}" must be a string`);
      }
      break;
    case "range":
      if (typeof val !== "number" || Number.isNaN(val)) {
        throw new Error(`"${key}" must be a number`);
      }
      if (val < d.min || val > d.max) {
        throw new Error(
          `"${key}" must be between ${d.min} and ${d.max}`
        );
      }
      break;
    case "boolean":
      if (typeof val !== "boolean") {
        throw new Error(`"${key}" must be a boolean`);
      }
      break;
    case "text":
      if (typeof val !== "string") {
        throw new Error(`"${key}" must be a string`);
      }
      if (d.minLength && val.trim().length < d.minLength) {
        throw new Error(
          `"${key}" must be at least ${d.minLength} characters`
        );
      }
      if (d.maxLength && val.length > d.maxLength) {
        throw new Error(
          `"${key}" exceeds max length of ${d.maxLength}`
        );
      }
      break;
    case "file":
      if (d.array) {
        if (!Array.isArray(val)) throw new Error(`"${key}" must be an array of URLs`);
        if (d.array.min != null && val.length < d.array.min) {
          throw new Error(`"${key}" needs at least ${d.array.min} items`);
        }
        if (d.array.max != null && val.length > d.array.max) {
          throw new Error(`"${key}" allows at most ${d.array.max} items`);
        }
      } else {
        if (typeof val !== "string") throw new Error(`"${key}" must be a string URL`);
      }
      break;
    case "object": {
      if (d.array && !Array.isArray(val)) {
        throw new Error(`"${key}" must be an array`);
      }
      const items = d.array ? val : [val];
      if (d.array?.min != null && items.length < d.array.min) {
        throw new Error(
          `"${key}" needs at least ${d.array.min} items`
        );
      }
      if (d.array?.max != null && items.length > d.array.max) {
        throw new Error(
          `"${key}" allows at most ${d.array.max} items`
        );
      }
      const declared = d.fields ?? {};
      for (const item of items) {
        if (item == null || typeof item !== "object" || Array.isArray(item)) {
          throw new Error(d.array ? `"${key}" items must be objects` : `"${key}" must be an object`);
        }
        if (required && !d.array && d.additionalProperties && Object.keys(declared).length === 0 && Object.keys(item).length === 0) {
          throw new Error(`"${key}" is required`);
        }
        for (const [fk, fd] of Object.entries(declared)) {
          validateDescriptor(`${key}.${fk}`, fd, item[fk], fd.required);
        }
        if (d.additionalProperties) {
          for (const [ek, ev] of Object.entries(item)) {
            if (ek in declared) continue;
            validateDescriptor(`${key}.${ek}`, d.additionalProperties, ev, true);
          }
        }
      }
      break;
    }
  }
}
function isAbsent(val) {
  return val == null || typeof val === "string" && val.trim().length === 0 || Array.isArray(val) && val.length === 0;
}
function validateAll(params, input, constraints, validateInput) {
  for (const [key, entry] of Object.entries(params)) {
    validateDescriptor(key, entry.descriptor, input[key], entry.required);
  }
  for (const [key, requirement] of evaluateRequirements(constraints, input)) {
    if (isAbsent(input[key])) {
      throw new Error(requirement.reason ? `"${key}" is required: ${requirement.reason}` : `"${key}" is required`);
    }
  }
  validateInput?.(input);
}
function descriptorsToSchema(params) {
  const schema = {};
  for (const [key, entry] of Object.entries(params)) {
    const d = entry.descriptor;
    switch (d.kind) {
      case "enum": {
        const e = d;
        schema[key] = {
          type: e.valueType,
          enum: e.options.map((o) => o.id),
          default: e.default
        };
        break;
      }
      case "range":
        schema[key] = {
          type: "number",
          min: d.min,
          max: d.max,
          step: d.step,
          default: d.default
        };
        break;
      case "boolean":
        schema[key] = {
          type: "boolean",
          default: d.default
        };
        break;
      case "text":
        schema[key] = {
          type: "string",
          label: entry.label
        };
        break;
      case "catalog":
        schema[key] = {
          type: "string",
          default: d.default,
          label: entry.label
        };
        break;
      case "file":
        schema[key] = {
          type: "file",
          required: entry.required,
          label: entry.label,
          accept: d.accept
        };
        break;
    }
  }
  return schema;
}
function coerceArrayShape(prevVal, arrayConfig, isEmpty) {
  if (arrayConfig) {
    const max = arrayConfig.max ?? Infinity;
    const arr = Array.isArray(prevVal) ? prevVal : [prevVal];
    const trimmed = arr.filter((v) => !isEmpty(v)).slice(0, max);
    return trimmed.length > 0 ? trimmed : void 0;
  }
  const single = Array.isArray(prevVal) ? prevVal[0] : prevVal;
  return isEmpty(single) ? void 0 : single;
}
function transferValues(newParams, prev) {
  const ctx = extractDefaults(newParams);
  for (const [key, entry] of Object.entries(newParams)) {
    const prevVal = prev[key];
    if (prevVal == null) continue;
    const d = entry.descriptor;
    switch (d.kind) {
      case "enum": {
        const ids = d.options.map(
          (o) => o.id
        );
        if (ids.includes(prevVal)) {
          ctx[key] = prevVal;
        }
        break;
      }
      case "catalog":
        break;
      case "range":
        if (typeof prevVal === "number") {
          ctx[key] = Math.min(Math.max(prevVal, d.min), d.max);
        }
        break;
      case "boolean":
        if (typeof prevVal === "boolean") {
          ctx[key] = prevVal;
        }
        break;
      case "text":
        if (typeof prevVal === "string") {
          ctx[key] = d.maxLength != null ? prevVal.slice(0, d.maxLength) : prevVal;
        }
        break;
      case "file": {
        const next = coerceArrayShape(prevVal, d.array, (v) => v == null || v === "");
        if (next !== void 0) ctx[key] = next;
        break;
      }
      case "object": {
        const next = coerceArrayShape(prevVal, d.array, (v) => v == null);
        if (next !== void 0) ctx[key] = next;
        break;
      }
      default:
        ctx[key] = prevVal;
    }
  }
  return ctx;
}

// src/core/catalogs.ts
var metaString = (item, key) => {
  const v = item.meta?.[key];
  return typeof v === "string" ? v : void 0;
};
function toVoiceOption(item, provider) {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    tags: item.tags,
    provider,
    previewUrl: item.preview?.audioUrl
  };
}
function toAvatarOption(item, provider) {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    tags: item.tags,
    provider,
    previewImageUrl: item.preview?.imageUrl,
    previewVideoUrl: item.preview?.videoUrl,
    gender: metaString(item, "gender"),
    defaultVoiceId: metaString(item, "defaultVoiceId")
  };
}
var registry = /* @__PURE__ */ new Map();
var keyOf2 = (s) => `${s.workflow} ${s.modelId ?? ""}`;
var OPTION_ADAPTERS = {
  voiceId: toVoiceOption,
  videoId: toAvatarOption
};
function installHydratedCatalog(source, paramKey, items, provider, version) {
  const adapt = OPTION_ADAPTERS[paramKey];
  registry.set(keyOf2(source), {
    paramKey,
    items,
    options: items.map((i) => ({ id: i.id, label: i.name })),
    catalogOptions: adapt ? items.map((i) => adapt(i, provider)) : items,
    version
  });
}
function getHydratedCatalog(source) {
  return registry.get(keyOf2(source));
}
function getHydratedVoices() {
  const out = [];
  for (const c of registry.values()) {
    if (c.paramKey === "voiceId") out.push(...c.catalogOptions);
  }
  return out;
}

// src/core/resolve.ts
function resolveModel(id) {
  const found = findModel(id);
  if (!found) {
    throw new ApiError(`Unknown model: "${id}"`, { status: 400, code: "unknown_model" });
  }
  return found;
}

// src/core/descriptors/pricing.ts
var import_pa_model_pricing_sdk = __toESM(require_build(), 1);
var _client = null;
var _byModel = null;
var _loadPromise2 = null;
function configurePricing(options) {
  _client = new import_pa_model_pricing_sdk.ModelPricingClient(options);
  _byModel = null;
  _loadPromise2 = null;
}
function loadPricing() {
  if (_byModel) return Promise.resolve();
  if (!_client) {
    return Promise.reject(new Error(
      "loadPricing(): not configured. Call catalog.pricing.configure({ baseUrl, fetch }) first."
    ));
  }
  if (!_loadPromise2) {
    const client = _client;
    _loadPromise2 = client.init().then(() => {
      const byModel = /* @__PURE__ */ new Map();
      for (const entry of client.getModelPricing()) {
        const id = entry.metadata.modelId;
        const list = byModel.get(id);
        if (list) list.push(entry);
        else byModel.set(id, [entry]);
      }
      _byModel = byModel;
    }).catch((err) => {
      _loadPromise2 = null;
      throw err;
    });
  }
  return _loadPromise2;
}
function isPricingLoaded() {
  return _byModel !== null;
}
function getCreditsForModel(modelId, ctx) {
  if (!_byModel) return null;
  let entries = _byModel.get(modelId);
  if (!entries || entries.length === 0) return null;
  if (ctx) {
    entries = entries.filter((e) => {
      if (ctx.generateAudio !== void 0 && e.metadata.audio !== ctx.generateAudio) return false;
      if (ctx.resolution !== void 0 && e.metadata.quality !== ctx.resolution) return false;
      return true;
    });
    if (entries.length === 0) return null;
  }
  let min = Infinity;
  let max = -Infinity;
  let unit = entries[0].unit;
  for (const e of entries) {
    if (e.credits < min) min = e.credits;
    if (e.credits > max) max = e.credits;
    if (e.unit !== unit) unit = void 0;
  }
  const tiers = entries.map((e) => ({
    credits: e.credits,
    unit: e.unit,
    quality: e.metadata.quality || void 0,
    audio: e.metadata.audio,
    useCase: e.metadata.useCase
  }));
  return unit ? { min, max, unit, tiers } : { min, max, tiers };
}

// src/core/descriptors/model-accessor.ts
function withHydration(entry, flat) {
  if (entry.descriptor.kind !== "catalog") return flat;
  const hydrated = getHydratedCatalog(entry.descriptor.source);
  if (!hydrated) return flat;
  return { ...flat, catalogOptions: hydrated.catalogOptions };
}
var ModelParamsAccessorImpl = class {
  def;
  constructor(def) {
    this.def = def;
  }
  param(key) {
    const entry = this.def.paramConfig[key];
    if (!entry) return void 0;
    const { descriptor, ...meta } = entry;
    return withHydration(entry, { ...meta, ...descriptor });
  }
  hasParam(key) {
    return key in this.def.paramConfig;
  }
  all() {
    return Object.entries(this.def.paramConfig).map(
      ([key, entry]) => {
        const { descriptor, ...meta } = entry;
        return withHydration(entry, { key, ...meta, ...descriptor });
      }
    );
  }
  // Kind-narrowed accessors
  enum(key) {
    return this.narrow(key, "enum");
  }
  catalog(key) {
    return this.narrow(key, "catalog");
  }
  range(key) {
    return this.narrow(key, "range");
  }
  boolean(key) {
    return this.narrow(key, "boolean");
  }
  text(key) {
    return this.narrow(key, "text");
  }
  file(key) {
    return this.narrow(key, "file");
  }
  // Well-known shorthands
  prompt() {
    return this.narrow("prompt", "text");
  }
  aspectRatio() {
    return this.narrow("aspectRatio", "enum");
  }
  /** Enum on fixed-option models, range where the vendor accepts every value
   *  in a span — callers narrow on `.kind`. */
  duration() {
    const entry = this.param("duration");
    if (!entry || entry.kind !== "enum" && entry.kind !== "range") return void 0;
    return entry;
  }
  resolution() {
    return this.narrow("resolution", "enum");
  }
  generateAudio() {
    return this.narrow("generateAudio", "boolean");
  }
  startFrame() {
    return this.narrow("startFrame", "file");
  }
  endFrame() {
    return this.narrow("endFrame", "file");
  }
  // Absorbed from Models namespace
  hasFileInput() {
    return Object.values(this.def.paramConfig).some((e) => e.descriptor.kind === "file");
  }
  getDefault(key) {
    const entry = this.def.paramConfig[key];
    if (!entry) return void 0;
    const d = entry.descriptor;
    return "default" in d ? d.default : void 0;
  }
  getDefaults() {
    return extractDefaults(this.def.paramConfig);
  }
  toSchema() {
    return descriptorsToSchema(this.def.paramConfig);
  }
  transferValues(prev) {
    return transferValues(this.def.paramConfig, prev);
  }
  narrow(key, kind) {
    const entry = this.param(key);
    if (!entry || entry.kind !== kind) return void 0;
    return entry;
  }
};
var ConstrainedParamsAccessor = class {
  inner;
  effects;
  requirements;
  constructor(inner, effects, requirements = /* @__PURE__ */ new Map()) {
    this.inner = inner;
    this.effects = effects;
    this.requirements = requirements;
  }
  // ── Decorated accessors ──────────────────────────────────────────
  enum(key) {
    return this.require(key, this.applyEnum(key, this.inner.enum(key)));
  }
  catalog(key) {
    return this.require(key, this.applyEntry(key, this.inner.catalog(key)));
  }
  range(key) {
    return this.require(key, this.applyEntry(key, this.inner.range(key)));
  }
  boolean(key) {
    return this.require(key, this.applyEntry(key, this.inner.boolean(key)));
  }
  text(key) {
    return this.require(key, this.applyEntry(key, this.inner.text(key)));
  }
  file(key) {
    return this.require(key, this.applyEntry(key, this.inner.file(key)));
  }
  prompt() {
    return this.require("prompt", this.applyEntry("prompt", this.inner.prompt()));
  }
  aspectRatio() {
    return this.require("aspectRatio", this.applyEnum("aspectRatio", this.inner.aspectRatio()));
  }
  duration() {
    const entry = this.inner.duration();
    return this.require("duration", entry?.kind === "enum" ? this.applyEnum("duration", entry) : this.applyEntry("duration", entry));
  }
  resolution() {
    return this.require("resolution", this.applyEnum("resolution", this.inner.resolution()));
  }
  generateAudio() {
    return this.require("generateAudio", this.applyEntry("generateAudio", this.inner.generateAudio()));
  }
  startFrame() {
    return this.require("startFrame", this.applyEntry("startFrame", this.inner.startFrame()));
  }
  endFrame() {
    return this.require("endFrame", this.applyEntry("endFrame", this.inner.endFrame()));
  }
  all() {
    return this.inner.all().map((e) => this.decorateFlat(e.key, e));
  }
  /** Generic lookup, decorated exactly as `all()` decorates the same key, so a
   *  caller that reads params by key sees the same restrictions and
   *  requirements as one that iterates them. */
  param(key) {
    const entry = this.inner.param(key);
    return entry && this.decorateFlat(key, entry);
  }
  // ── Pass-through delegates ───────────────────────────────────────
  hasParam(key) {
    return this.inner.hasParam(key);
  }
  hasFileInput() {
    return this.inner.hasFileInput();
  }
  getDefault(key) {
    return this.inner.getDefault(key);
  }
  getDefaults() {
    return this.inner.getDefaults();
  }
  toSchema() {
    return this.inner.toSchema();
  }
  transferValues(prev) {
    return this.inner.transferValues(prev);
  }
  // ── Private helpers ──────────────────────────────────────────────
  decorateFlat(key, entry) {
    const r = this.effects.get(key);
    let decorated = entry;
    if (r && entry.kind === "enum") decorated = this.decorateEnumFlat(entry, r);
    else if (r?.kind === "disabled") decorated = { ...entry, disabled: true, disabledReason: r.reason };
    return this.require(key, decorated);
  }
  /** Mark the entry required when a matching `required` restriction names it. */
  require(key, entry) {
    if (!entry) return void 0;
    const requirement = this.requirements.get(key);
    if (!requirement) return entry;
    return { ...entry, required: true, requiredReason: requirement.reason };
  }
  applyEntry(key, entry) {
    if (!entry) return void 0;
    const r = this.effects.get(key);
    if (!r) return entry;
    if (r.kind === "disabled") return { ...entry, disabled: true, disabledReason: r.reason };
    return entry;
  }
  applyEnum(key, entry) {
    if (!entry) return void 0;
    const r = this.effects.get(key);
    if (!r) return entry;
    if (r.kind === "disabled") {
      const options2 = entry.options.map((opt) => ({ ...opt, disabled: true, disabledReason: r.reason }));
      return { ...entry, options: options2, disabled: true, disabledReason: r.reason };
    }
    const allowed = new Set(r.allowed.map(String));
    const options = entry.options.map(
      (opt) => allowed.has(String(opt.id)) ? opt : { ...opt, disabled: true, disabledReason: r.reason }
    );
    return { ...entry, options };
  }
  decorateEnumFlat(entry, r) {
    if (entry.kind !== "enum") return entry;
    if (r.kind === "disabled") {
      const options2 = entry.options.map((opt) => ({
        ...opt,
        disabled: true,
        disabledReason: r.reason
      }));
      return { ...entry, options: options2, disabled: true, disabledReason: r.reason };
    }
    const allowed = new Set(r.allowed.map(String));
    const options = entry.options.map(
      (opt) => allowed.has(String(opt.id)) ? opt : { ...opt, disabled: true, disabledReason: r.reason }
    );
    return { ...entry, options };
  }
};
var ModelMetaImpl = class {
  mode;
  inputType;
  description;
  features;
  badges;
  provider;
  addedAt;
  release;
  constructor(def) {
    this.mode = def.mode;
    this.inputType = def.inputType;
    this.description = def.description;
    this.features = def.features;
    this.badges = def.badge ?? [];
    this.release = def.release ?? "production";
    this.provider = {
      id: def.provider,
      name: def.providerName,
      color: def.providerColor,
      label: def.providerLabel
    };
    this.addedAt = def.addedAt ?? null;
  }
};
var ModelDescriptorImpl = class {
  id;
  name;
  api;
  def;
  _params;
  _meta;
  constructor(def) {
    this.id = def.id;
    this.name = def.name;
    this.api = { workflow: def.workflow, editWorkflow: def.editWorkflow };
    this.def = def;
  }
  params() {
    return this._params ??= new ModelParamsAccessorImpl(this.def);
  }
  paramsFor(values) {
    const inner = this.params();
    const effects = evaluateConstraints(this.def.constraints, values);
    const requirements = evaluateRequirements(this.def.constraints, values);
    if (!effects.size && !requirements.size) return inner;
    return new ConstrainedParamsAccessor(inner, effects, requirements);
  }
  validate(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return { valid: false, errors: [`Invalid input for model "${this.def.id}"`] };
    }
    try {
      validateAll(this.def.paramConfig, input, this.def.constraints, this.def.validateInput);
      return { valid: true };
    } catch (err) {
      return { valid: false, errors: [err instanceof Error ? err.message : String(err)] };
    }
  }
  meta() {
    return this._meta ??= new ModelMetaImpl(this.def);
  }
  getCreditsInfo(ctx) {
    if (this.def.modelId) {
      const byModelId = getCreditsForModel(this.def.modelId, ctx);
      if (byModelId) return byModelId;
    }
    return getCreditsForModel(this.def.id, ctx);
  }
};
function _model(id) {
  return new ModelDescriptorImpl(resolveModel(id));
}
function _all(filter = {}) {
  const releases = filter.release ?? DEFAULT_VISIBLE_RELEASES;
  return activeModels().filter((m) => isVisibleForReleases(m, releases)).map((m) => new ModelDescriptorImpl(m));
}
function _find(filter) {
  const releases = filter.release ?? DEFAULT_VISIBLE_RELEASES;
  return activeModels().filter((m) => {
    if (!isVisibleForReleases(m, releases)) return false;
    if (filter.output && m.mode !== filter.output) return false;
    if (filter.provider && m.provider !== filter.provider) return false;
    return true;
  }).map((m) => new ModelDescriptorImpl(m));
}
function _search(query, filter = {}) {
  const releases = filter.release ?? DEFAULT_VISIBLE_RELEASES;
  const q = query.toLowerCase();
  return activeModels().filter(
    (m) => isVisibleForReleases(m, releases) && (m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q))
  ).map((m) => new ModelDescriptorImpl(m));
}
var Model = _model;
var catalog = {
  all: _all,
  find: _find,
  search: _search,
  pricing: {
    configure: configurePricing,
    load: loadPricing,
    isLoaded: isPricingLoaded
  }
};

// ../../node_modules/@picsart/workflows-client/dist/index.mjs
var logger_default = {
  error: (...args) => {
    console.error(...args);
  },
  warn: (...args) => {
    console.debug(...args);
  },
  info: (...args) => {
    console.info(...args);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (...args) => {
    console.debug(...args);
  }
};
var ExecutionMode = /* @__PURE__ */ ((ExecutionMode2) => {
  ExecutionMode2["ASYNC"] = "ASYNC";
  ExecutionMode2["SYNC"] = "SYNC";
  ExecutionMode2["STREAM"] = "STREAM";
  ExecutionMode2["SOCKET"] = "SOCKET";
  return ExecutionMode2;
})(ExecutionMode || {});
var STREAM_EVENT_NAME = "task.stream";
var normalizeWorkflowName = (workflow) => (workflow || "").replace(/-/g, "_").toLowerCase();
var taskChannel = (workflow, taskId) => `workflows:${normalizeWorkflowName(workflow)}:${taskId}`;
var workflowChannel = (workflow) => `workflows:${normalizeWorkflowName(workflow)}:all`;
var DEFAULT_REASON = "unknown_error";
var DEFAULT_MESSAGE = "Unknown error";
var NON_JSON_BODY_MESSAGE = "Non json response was returned from server";
var asRecord = (value) => value && typeof value === "object" ? value : void 0;
var asText = (value) => typeof value === "string" && value.length > 0 ? value : void 0;
var asStatusCode = (value) => typeof value === "number" && Number.isFinite(value) ? value : void 0;
var WorkflowsError = class _WorkflowsError extends Error {
  constructor(init) {
    super(init.message);
    this.name = this.constructor.name;
    this.reason = init.reason;
    this.httpStatusCode = init.httpStatusCode;
  }
  /**
   * Builds an error from an already-parsed error payload — a `FailedResult` off a stream/socket
   * event, or any body with `reason` / `message` / `statusCode`. Each field falls back to
   * `fallback` individually, so a payload that carries only a message still keeps the caller's
   * reason and status.
   */
  static fromBody(body, fallback) {
    const parsed = asRecord(body);
    return new _WorkflowsError({
      reason: asText(parsed?.reason) || fallback.reason,
      message: asText(parsed?.message) || fallback.message,
      httpStatusCode: asStatusCode(parsed?.statusCode) ?? fallback.httpStatusCode
    });
  }
  /**
   * Builds an error from a non-ok `Response`. The status always comes from the response itself;
   * `reason` and `message` come from the JSON body when it has them, otherwise from `fallback`
   * (a body that isn't JSON at all is reported as such rather than throwing a parse error).
   */
  static async fromResponse(response, fallback) {
    let body;
    try {
      body = await response.json();
    } catch {
      body = void 0;
    }
    const parsed = asRecord(body);
    return new _WorkflowsError({
      reason: asText(parsed?.reason) || fallback?.reason || DEFAULT_REASON,
      message: asText(parsed?.message) || fallback?.message || (parsed ? DEFAULT_MESSAGE : NON_JSON_BODY_MESSAGE),
      httpStatusCode: response.status
    });
  }
  /** Wraps an unexpected local throw (anything that isn't already a WorkflowsError). */
  static fromUnknown(error) {
    return new _WorkflowsError({
      reason: DEFAULT_REASON,
      message: (error instanceof Error ? error.message : asText(error)) || DEFAULT_MESSAGE
    });
  }
};
var WorkflowResultUpdateAware = class {
  constructor(onProgressFn, onPartialResultFn, onEventFn) {
    this.onProgressFn = onProgressFn;
    this.onPartialResultFn = onPartialResultFn;
    this.onEventFn = onEventFn;
  }
  async onUpdate(response) {
    if (!response.updated) return;
    await this.deliverEvents(response);
    if (response.status !== "IN_PROGRESS") return;
    const newUpdated = new Date(response.updated);
    if (newUpdated?.getTime() !== this.updated?.getTime()) {
      this.updated = newUpdated;
      await this.onPartialResultFn?.(response);
      if (response.progress) {
        await this.onProgressFn?.(response.progress);
      }
    }
  }
  async deliverEvents(response) {
    if (!response.events?.length || !this.onEventFn) return;
    let startIdx = 0;
    if (this._lastEventId) {
      const lastSeenIdx = response.events.findIndex((e) => e.id === this._lastEventId);
      if (lastSeenIdx !== -1) {
        startIdx = lastSeenIdx + 1;
      }
    }
    const newEvents = response.events.slice(startIdx);
    for (const event of newEvents) {
      await this.onEventFn(event);
    }
    if (newEvents.length > 0) {
      this._lastEventId = newEvents[newEvents.length - 1].id;
    }
  }
};
var bearer = (token) => token.startsWith("Bearer ") ? token : `Bearer ${token}`;
var WorkflowsSocket = class {
  constructor(config) {
    this.config = config;
    this.ownsSocket = false;
    this.channelRefs = /* @__PURE__ */ new WeakMap();
  }
  // Watch already-submitted work live, as an async iterable of the raw StreamSocketMessage the gateway
  // pushes. Iterate with `for await` and switch on `msg.type` (EventTypes.* or an `event.<custom>`
  // string), reading `msg.payload`. With a taskId, watch that one task and end after its COMPLETED /
  // FAILED; without, watch every task of the workflow until stopped. A lost socket session (or the
  // passed AbortSignal) is THROWN out of the loop; `break` also stops watching — the `finally` tears
  // everything down.
  async *subscribe(options) {
    if (!this.config.socket && !this.config.socketConnection) {
      throw new WorkflowsError({
        httpStatusCode: 400,
        reason: "invalid_state",
        message: "subscribe() requires either `socket` or `socketConnection` on the client."
      });
    }
    if (options.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const channel = options.taskId ? taskChannel(options.name, options.taskId) : workflowChannel(options.name);
    this.assertValidChannel(channel);
    const socket = await this.resolveSocket();
    if (!socket) return;
    if (options.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const workflow = normalizeWorkflowName(options.name);
    const queue = [];
    let wake;
    const push = (item) => {
      queue.push(item);
      const w = wake;
      wake = void 0;
      w?.();
    };
    const handler = (message) => {
      if (!message) return;
      const mine = options.taskId ? message.taskId === options.taskId : message.workflow === workflow;
      if (mine) push({ msg: message });
    };
    socket.on(STREAM_EVENT_NAME, handler);
    const streamEnded = (detail) => push({ error: new WorkflowsError({
      httpStatusCode: 503,
      reason: "socket_connection_lost",
      message: `Lost the socket connection (${detail}); the event stream ended.`
    }) });
    const detachReconnect = this.onSessionLost(socket, () => streamEnded("the session could not be recovered on reconnect"));
    const detachAbandoned = this.onConnectAbandoned(socket, (err) => streamEnded(
      `socket.io stopped reconnecting after "${err instanceof Error ? err.message : String(err)}"`
    ));
    const detachDisconnect = this.onDisconnected(socket, (reason) => streamEnded(`"${reason}"`));
    const onAbort = () => push({ error: new DOMException("Aborted", "AbortError") });
    options.signal?.addEventListener("abort", onAbort);
    this.joinChannel(socket, channel);
    try {
      while (true) {
        while (queue.length) {
          const item = queue.shift();
          if ("error" in item) throw item.error;
          yield item.msg;
          if (options.taskId && (item.msg.type === "task.completed" || item.msg.type === "task.failed")) return;
        }
        await new Promise((resolve) => {
          wake = resolve;
        });
      }
    } finally {
      options.signal?.removeEventListener("abort", onAbort);
      this.leaveChannel(socket, channel);
      socket.off(STREAM_EVENT_NAME, handler);
      detachReconnect();
      detachAbandoned();
      detachDisconnect();
    }
  }
  // Opens the socket (create + connect for socketConnection; return an injected one). Idempotent —
  // resolveSocket memoizes, so repeated calls reuse the same connection.
  connect() {
    return this.resolveSocket();
  }
  // Disconnects the socket ONLY if this class created it (socketConnection); an injected socket is
  // left for the caller to manage. Safe to call more than once.
  async disconnect() {
    if (!this.ownsSocket || !this.socketPromise) return;
    const socket = await this.socketPromise.catch(() => void 0);
    socket?.disconnect();
    this.socketPromise = void 0;
    this.ownsSocket = false;
  }
  // Backs run({ mode: ExecutionMode.SOCKET }). Joins the workflow channel and starts listening BEFORE
  // submitting, so no early event is missed — the per-task channel can't be joined until submit mints
  // the taskId. Events seen before we know our taskId are buffered, then matched once we have it (the
  // workflow room carries sibling tasks, so the taskId filter is load-bearing).
  // `markSeen` is fired with the taskId the moment a terminal (COMPLETED/FAILED) event is received — the
  // socket-mode equivalent of the polling client fetching /result, which is what disabled the task's
  // pending notification server-side. Fired for both terminal outcomes (matching the old poll, which
  // disabled on COMPLETED and FAILED alike) and ONLY on a real terminal event — never on a lost session,
  // abort, or connect error, so an unconsumed result still triggers the async fallback notification.
  // It's best-effort: runTask fires it without awaiting and swallows any rejection, since a failed disable
  // only costs a redundant fallback notification and must never fail the run.
  async runTask(workflowName, submit, executionOptions, markSeen) {
    const signal = executionOptions?.abortSignal;
    await this.ensureSocketReady(workflowName, signal);
    const { onProgress, onPartialResult, onEvent } = executionOptions ?? {};
    const ac = new AbortController();
    const forwardAbort = () => ac.abort();
    signal?.addEventListener("abort", forwardAbort);
    const iter = this.subscribe({ name: workflowName, signal: ac.signal })[Symbol.asyncIterator]();
    const firstPull = iter.next();
    firstPull.catch(() => {
    });
    try {
      const taskId = await submit();
      for (let pull = firstPull; ; pull = iter.next()) {
        const { value: message, done } = await pull;
        if (done) break;
        if (message.taskId !== taskId) continue;
        switch (message.type) {
          case "task.completed":
            void Promise.resolve(markSeen?.(taskId)).catch(() => void 0);
            return {
              result: message.payload?.result,
              usage: message.payload?.usage,
              status: "COMPLETED"
              /* COMPLETED */
              // a FAILED message throws below instead
            };
          case "task.failed":
            void Promise.resolve(markSeen?.(taskId)).catch(() => void 0);
            throw this.failureError(message.payload?.result ?? message.payload);
          case "task.metrics":
            await onProgress?.(message.payload);
            break;
          case "task.partial-result":
            await onPartialResult?.({ status: "IN_PROGRESS", result: message.payload });
            break;
          default:
            if (message.type.startsWith("event.")) {
              await onEvent?.({ ...message.payload, type: message.type.replace(/^event\./, "") });
            }
        }
      }
      throw new WorkflowsError({
        httpStatusCode: 500,
        reason: "socket_stream_ended",
        message: "Socket stream ended before the task completed."
      });
    } finally {
      signal?.removeEventListener("abort", forwardAbort);
      ac.abort();
      await iter.return?.();
    }
  }
  // Pre-submit gate for runTask: validate the channel and get the socket connected before any work is
  // submitted. The socket itself isn't returned — subscribe() re-resolves it — this only proves it's
  // reachable and honors an abort that fired before (or during) connecting, since addEventListener('abort')
  // never fires for an already-aborted signal.
  async ensureSocketReady(workflowName, signal) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const channel = workflowChannel(workflowName);
    this.assertValidChannel(channel);
    const socket = await this.resolveSocket();
    if (!socket) {
      throw new WorkflowsError({
        httpStatusCode: 400,
        reason: "invalid_state",
        message: "ExecutionMode.SOCKET requires either `socket` or `socketConnection` on the client."
      });
    }
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  }
  // Fails a run/subscription when a reconnect couldn't be recovered. The gateway has Connection State
  // Recovery: a reconnect within its window restores our room and replays missed events, so there's
  // nothing to do; past the window `recovered` is false and the stream is gone — and we don't refetch
  // from the DB. We only wire this after the socket is connected, so any 'connect' here is a reconnect.
  // Returns a function to detach the listener on teardown.
  onSessionLost(socket, onLost) {
    const listener = () => {
      if (!socket.recovered) onLost();
    };
    socket.on("connect", listener);
    return () => socket.off("connect", listener);
  }
  // The other half of onSessionLost, for the case it can't see: a connect attempt that FAILS rather than
  // succeeding — typically a reconnect whose handshake the gateway rejects (an expired token). No
  // 'connect' event ever fires then, so onSessionLost stays silent and the watcher parks forever on a
  // socket that will never deliver again. `socket.active` says whether socket.io intends to keep trying:
  // still true while it retries a transient transport failure (a blip Connection State Recovery papers
  // over — ignore it, or we'd fail runs that were about to resume), false once it has given up. Only
  // that second case is terminal, and it covers BOTH a server-side rejection (never retried) and
  // reconnectionAttempts running out, which is why the caller reports the error rather than a cause.
  // Returns a detach function.
  onConnectAbandoned(socket, onAbandoned) {
    const listener = (err) => {
      if (socket.active === false) onAbandoned(err);
    };
    socket.on("connect_error", listener);
    return () => socket.off("connect_error", listener);
  }
  // The third and last way this socket can go quiet for good: it disconnects and nothing is coming back
  // — `client.disconnect()` called while a watch is live ('io client disconnect'), or the gateway closing
  // us out ('io server disconnect'). Neither produces a 'connect' or a 'connect_error', so without this
  // the watcher parks forever on a socket that is simply gone. `active` splits the cases here too, as
  // socket.io documents: still true for a transport close or ping timeout, which it retries and CSR
  // papers over; false once the connection was closed for good. Returns a detach function.
  onDisconnected(socket, onGone) {
    const listener = (reason) => {
      if (socket.active === false) onGone(reason);
    };
    socket.on("disconnect", listener);
    return () => socket.off("disconnect", listener);
  }
  resolveSocket() {
    if (this.socketPromise) return this.socketPromise;
    const { socket, socketConnection } = this.config;
    if (!socket && !socketConnection) return Promise.resolve(void 0);
    const promise = (async () => {
      const resolved = socket ?? await this.createSocket(socketConnection);
      this.ownsSocket = !socket;
      try {
        await this.whenConnected(resolved);
      } catch (err) {
        if (!socket) {
          resolved.disconnect();
          this.ownsSocket = false;
        }
        throw err;
      }
      return resolved;
    })();
    promise.catch(() => {
      if (this.socketPromise === promise) this.socketPromise = void 0;
    });
    this.socketPromise = promise;
    return promise;
  }
  // Resolves once the socket's transport is up; rejects if the connection fails (so callers surface an
  // error instead of hanging). connect() is idempotent, so driving it is safe whether the socket is
  // already connecting (autoConnect) or was created with autoConnect:false.
  whenConnected(socket) {
    if (socket.connected) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        socket.off("connect", onConnect);
        socket.off("connect_error", onError);
      };
      const onConnect = () => {
        cleanup();
        resolve();
      };
      const onError = (err) => {
        cleanup();
        reject(err instanceof Error ? err : new Error(`socket connection failed: ${String(err)}`));
      };
      socket.on("connect", onConnect);
      socket.on("connect_error", onError);
      socket.connect();
    });
  }
  // socket.io-client is an optional peer dependency, imported on demand so non-socket consumers
  // never load it (and SSR never connects).
  async createSocket(conn) {
    let io;
    try {
      ({ io } = await import('./esm-debug-3SQICTIF.js'));
    } catch {
      throw new WorkflowsError({
        httpStatusCode: 400,
        reason: "invalid_state",
        message: 'socketConnection requires the optional peer dependency "socket.io-client" to be installed.'
      });
    }
    return io(conn.url, {
      path: conn.path ?? "/socket-gateway",
      transports: conn.transports ?? ["websocket"],
      auth: this.buildAuth(conn)
    });
  }
  // The handshake auth payload, in socket.io's FUNCTION form — socket.io re-invokes it per (re)connect
  // attempt (Socket#onopen), which is the whole point: a plain object would be snapshotted once and
  // replayed on every reconnect, so it would go stale along with the token it captured.
  buildAuth(conn) {
    const { getToken } = conn;
    return (cb) => {
      void Promise.resolve().then(getToken).then((fresh) => cb({ token: bearer(fresh) })).catch((err) => {
        logger_default.error("workflows.socket - socketConnection.getToken failed; the handshake will be refused", err);
        cb({ token: "" });
      });
    };
  }
  // The gateway only accepts channels shaped `workflows:SEG:SEG` (SEG = letters, digits, _, - or /). We build
  // the channel from `name`/`taskId`, so validate it here to fail fast on a bad name instead of
  // silently never joining a room. Task names are slash-delimited paths (e.g. /v1/videos/text-to-video),
  // so `/` is allowed. (A channel that passes this but the gateway still refuses is left to hang — expected.)
  assertValidChannel(channel) {
    if (!/^workflows:[a-zA-Z0-9_/-]+:[a-zA-Z0-9_/-]+$/.test(channel)) {
      throw new WorkflowsError({
        httpStatusCode: 400,
        reason: "invalid_channel",
        message: `Invalid channel "${channel}" \u2014 name and taskId may only contain letters, digits, "_", "-" or "/".`
      });
    }
  }
  // Room membership. Every joiner emits its OWN `subscribe` (idempotent at the gateway); the ref-count
  // is used solely to emit `unsubscribe` ONCE, when the last watcher leaves, so one watcher's teardown
  // never drops a room a sibling still needs. Fire-and-forget: we validate the channel locally, so
  // there's no ack to act on.
  joinChannel(socket, channel) {
    let refs = this.channelRefs.get(socket);
    if (!refs) {
      refs = /* @__PURE__ */ new Map();
      this.channelRefs.set(socket, refs);
    }
    refs.set(channel, (refs.get(channel) ?? 0) + 1);
    socket.emit("subscribe", { channels: [channel] });
  }
  leaveChannel(socket, channel) {
    const refs = this.channelRefs.get(socket);
    if (!refs) return;
    const count = (refs.get(channel) ?? 0) - 1;
    if (count <= 0) {
      refs.delete(channel);
      socket.emit("unsubscribe", { channels: [channel] });
    } else {
      refs.set(channel, count);
    }
  }
  // The Error a task failure maps to: the gateway's own reason/message/statusCode when it sent them,
  // otherwise a generic 500 failure.
  failureError(failure) {
    return WorkflowsError.fromBody(failure, {
      httpStatusCode: 500,
      reason: "workflow_failed",
      message: "Workflow failed"
    });
  }
};
async function* decodeSSE(stream) {
  for await (const chunk of readSSE(stream)) {
    const lines = chunk.split("\n");
    const sseData = {};
    for (const line of lines) {
      if (line.startsWith("data:")) {
        const data = line.replace(/^data:\s*/, "");
        if (data === "[DONE]") {
          return;
        }
        try {
          sseData.data = JSON.parse(data);
        } catch (err) {
          logger_default.warn(
            `Failed to parse data JSON from OpenAI event stream: - ${data}, err=${JSON.stringify(err)}`
          );
        }
      }
    }
    yield sseData;
  }
}
async function* readSSE(stream) {
  const reader = stream.getReader();
  let buffer = new Uint8Array();
  const decoder = new TextDecoder("utf-8");
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const tmp = new Uint8Array(buffer.length + value.length);
      tmp.set(buffer);
      tmp.set(value, buffer.length);
      buffer = tmp;
      let index;
      while ((index = findDoubleNewlineIndex(buffer)) !== -1) {
        const slice = buffer.subarray(0, index);
        yield decoder.decode(slice);
        buffer = buffer.subarray(index);
      }
    }
    if (buffer.length > 0) {
      yield decoder.decode(buffer);
    }
  } finally {
    reader.releaseLock();
  }
}
function findDoubleNewlineIndex(buffer) {
  const newline = 10;
  const carriage = 13;
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === newline && buffer[i + 1] === newline) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === carriage) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) {
      return i + 4;
    }
  }
  return -1;
}
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var DEFAULT_POLLING_INTERVAL = 300;
var DEFAULT_RETRIES_COUNT = 1e3;
var NETWORK_RETRIES_COUNT = 10;
var MAX_POLLING_BACKOFF = 5e3;
var WorkflowsClient = class {
  constructor(options) {
    this.defaultHeaders = {
      Accept: "application/json",
      "Content-Type": "application/json"
    };
    this.terminalStatuses = [
      "COMPLETED",
      "FAILED"
      /* FAILED */
    ];
    this.clientOptions = options || {};
    this.clientOptions.baseUrl = this.clientOptions.baseUrl || "https://api.picsart.com/";
    if (!this.clientOptions.baseUrl.endsWith("/")) this.clientOptions.baseUrl += "/";
    if (this.clientOptions.apiKey) {
      this.clientOptions.apiKey = this.clientOptions.apiKey.replace("Bearer ", "");
    }
    if (this.clientOptions.identityToken) {
      this.clientOptions.identityToken = this.clientOptions.identityToken.replace("Bearer ", "");
    }
    this.workflowsApiBaseUrl = `${this.clientOptions.baseUrl}workflows`;
    this.sockets = new WorkflowsSocket({
      socket: this.clientOptions.socket,
      socketConnection: this.clientOptions.socketConnection && {
        ...this.clientOptions.socketConnection,
        url: this.clientOptions.socketConnection.url || this.clientOptions.baseUrl
      }
    });
    if (this.clientOptions.socket || this.clientOptions.socketConnection) {
      void Promise.resolve().then(() => this.sockets.connect()).catch(() => void 0);
    }
  }
  /**
   * Runs a workflow end-to-end and resolves with its result.
   *
   * A workflow that has an entry in `WorkflowTypes` (from `@picsart/workflows-types`) is
   * type-checked against it: `params` must match the workflow's input and the result comes back
   * typed, with no type argument to pass. Every other workflow is left unconstrained — declare
   * the result yourself with `run<MyResult>(name, params)`.
   *
   * The execution mode is taken from remote settings when available, otherwise from
   * `executionOptions.mode`, defaulting to async (submit + polling). Supported modes:
   * sync (single HTTP call), stream (SSE, requires `onEvent`), socket (result pushed
   * over the socket), and async (submit + polling).
   *
   * @typeParam R - Shape of the result, for a workflow that has no `WorkflowTypes` entry.
   * Passing it explicitly also opts a mapped workflow out of its types.
   * @param name - Workflow name.
   * @param params - Workflow input, typed per the workflow definition when there is one.
   * @param executionOptions - Mode, callbacks (`onAccepted`, `onProgress`, `onPartialResult`,
   * `onEvent`), polling tuning, headers, and abort signal.
   * @returns The workflow result and usage info.
   * @throws {WorkflowsError} On a failed request (`httpStatusCode` carries the HTTP status),
   * invalid arguments, or an unexpected failure.
   */
  async run(name, params, executionOptions) {
    try {
      const remoteSettings = await this.getApiSettings(
        name,
        executionOptions?.remoteSettingName
      );
      const executionMode = remoteSettings.executionMode || executionOptions?.mode || "ASYNC";
      if (executionMode === "SYNC") {
        return this.executeTaskSync(name, params, executionOptions);
      }
      if (executionMode === "STREAM") {
        return this.executeTaskStream(name, params, executionOptions);
      }
      if (executionMode === "SOCKET") {
        const submit = async () => {
          try {
            const id = await this.postTask(name, params, executionOptions);
            await executionOptions?.onAccepted?.(id);
            return id;
          } catch (err) {
            throw this.wrapError(name, err);
          }
        };
        return this.sockets.runTask(
          name,
          submit,
          executionOptions,
          (taskId2) => this.disableNotification(taskId2, { headers: executionOptions?.headers })
        );
      }
      const taskId = await this.postTask(name, params, executionOptions);
      await executionOptions?.onAccepted?.(taskId);
      return this.runPolling(name, taskId, executionOptions);
    } catch (err) {
      throw this.wrapError(name, err);
    }
  }
  /**
   * Submits a task WITHOUT waiting for its result — the standalone counterpart of {@link run}.
   * Consume the result later with {@link runPolling} or {@link subscribe} (`{ name, taskId }`).
   *
   * Only the submission-related execution options apply here (`headers`, `notificationConfig`,
   * `remoteSettingName`); result-consumption options (mode, callbacks, polling) belong to the consumer.
   *
   * @param name - Workflow name.
   * @param params - Workflow input parameters.
   * @param executionOptions - Submission-related options only.
   * @returns The taskId of the submitted task.
   * @throws {WorkflowsError} On a failed request (`httpStatusCode` carries the HTTP status)
   * or an unexpected failure.
   */
  async submit(name, params, executionOptions) {
    try {
      return await this.postTask(name, params, executionOptions);
    } catch (err) {
      throw this.wrapError(name, err);
    }
  }
  /**
   * Fetches the options a workflow offers for the given input — what the adapter resolves for THIS
   * caller (subscription tier, country, the `x-config-id` CMS card), which is why it is read at call
   * time rather than described by the workflow's types.
   *
   * @param name - Workflow name, including the version when the workflow has one (`pipelineName/v1`).
   * @param params - Workflow input to resolve the options for; defaults to `{}` for the common case
   * of asking before anything is chosen.
   * @param requestOptions - `remoteSettingName` to resolve the `x-config-id` under a name other
   * than the workflow's own.
   * @returns The options payload — the envelope's `response`, unwrapped.
   * @throws {WorkflowsError} On a failed request; `httpStatusCode` carries the HTTP status.
   */
  async options(name, params = {}, requestOptions) {
    try {
      const remoteSettings = await this.getApiSettings(name, requestOptions?.remoteSettingName);
      const response = await this._fetch(`${this.workflowsApiBaseUrl}/${name}/options`, {
        method: "POST",
        headers: this.requestHeaders(remoteSettings.configId),
        body: JSON.stringify({ params })
      });
      const json = await this.toSuccessResponse(response);
      return json.response;
    } catch (err) {
      throw this.wrapError(name, err);
    }
  }
  async postTask(taskName, command, executionOptions) {
    const remoteSettings = await this.getApiSettings(taskName, executionOptions?.remoteSettingName);
    const response = await this._fetch(`${this.workflowsApiBaseUrl}/${taskName}/submit`, {
      method: "POST",
      headers: this.requestHeaders(remoteSettings.configId, executionOptions?.headers),
      body: JSON.stringify({
        params: command,
        notification: executionOptions?.notificationConfig
      })
    });
    const json = await this.toSuccessResponse(response);
    return json.response.id;
  }
  /**
   * Polls an already-submitted task until it reaches a terminal status (COMPLETED/FAILED)
   * and resolves with its result. Progress and partial-result callbacks from
   * `executionOptions` are invoked on each update.
   *
   * A poll that never reaches the server (dropped wifi, DNS failure, a reset connection) does not
   * end the run — the task keeps going server-side, so polling backs off and retries, giving up
   * only once the drops outlast the retry budget. Anything the server did answer, and any abort,
   * still fails immediately.
   *
   * @typeParam R - Shape of the workflow result.
   * @param taskName - Workflow name.
   * @param taskId - Task id returned by {@link submit} (or `onAccepted`).
   * @param executionOptions - `pollingInterval` (default 300ms), `retriesCount` (default 1000),
   * callbacks and abort signal.
   * @returns The workflow result and usage info.
   * @throws {WorkflowsError} With `httpStatusCode` 408 when the retry budget is exhausted
   * before the task completes, or the connection error when the connection never came back.
   */
  async runPolling(taskName, taskId, executionOptions) {
    const pollingInterval = executionOptions?.pollingInterval || DEFAULT_POLLING_INTERVAL;
    let retriesCounter = executionOptions?.retriesCount || DEFAULT_RETRIES_COUNT;
    let pollingResponse;
    let networkFailures = 0;
    let lastNetworkError;
    const progressAware = new WorkflowResultUpdateAware(
      executionOptions?.onProgress,
      executionOptions?.onPartialResult,
      executionOptions?.onEvent
    );
    do {
      if (executionOptions?.abortSignal?.aborted) throw new DOMException("Aborted", "AbortError");
      await sleep(this.pollingDelay(pollingInterval, networkFailures));
      retriesCounter--;
      try {
        pollingResponse = await this.getResult(taskName, taskId);
        networkFailures = 0;
        lastNetworkError = void 0;
      } catch (err) {
        if (!this.isConnectionError(err)) throw err;
        if (++networkFailures > NETWORK_RETRIES_COUNT) throw this.connectionError(err);
        lastNetworkError = err;
        logger_default.warn(
          `workflows.runPolling - poll ${networkFailures}/${NETWORK_RETRIES_COUNT} of ${taskName}/${taskId} did not reach the server, retrying`,
          err
        );
        continue;
      }
      await progressAware.onUpdate(pollingResponse.response);
    } while (retriesCounter > 0 && !this.isTerminal(pollingResponse));
    if (lastNetworkError) throw this.connectionError(lastNetworkError);
    if (!this.isTerminal(pollingResponse) || !pollingResponse?.response.result) {
      throw new WorkflowsError({
        httpStatusCode: 408,
        reason: "client_timeout",
        message: "Polling timeout reached. Consider increasing polling interval or retries count from execution options."
      });
    }
    return pollingResponse.response;
  }
  // Raw transport rejections (a TypeError from fetch) become the client's own error on the way out,
  // keeping what fetch said but labelling it for callers. No httpStatusCode: the server never answered.
  connectionError(error) {
    return new WorkflowsError({
      reason: "connection_error",
      message: error?.message || "The request did not reach the server"
    });
  }
  isTerminal(response) {
    return !!response && this.terminalStatuses.includes(response.response.status);
  }
  /**
   * Whether a failed poll never got an answer from the server — the connection dropped, DNS failed,
   * the request was reset. Classified by what the failure is NOT, so it holds in a browser
   * (`TypeError: Failed to fetch`) and in Node (`TypeError: fetch failed`) alike: anything the
   * server answered carries an `httpStatusCode`, and an abort is the caller's own doing.
   */
  isConnectionError(error) {
    const name = error?.name;
    if (name === "AbortError" || name === "TimeoutError") return false;
    if (error instanceof WorkflowsError) return error.httpStatusCode === void 0;
    return true;
  }
  // Back off while the connection is down instead of hammering a dead radio — never below the
  // caller's own interval, never above MAX_POLLING_BACKOFF.
  pollingDelay(interval, consecutiveFailures) {
    if (consecutiveFailures === 0) return interval;
    return Math.min(interval * 2 ** consecutiveFailures, Math.max(interval, MAX_POLLING_BACKOFF));
  }
  /**
   * Fetches the CURRENT state of an already-submitted task with a single request — no polling, no
   * waiting. Returns the task as it stands, so read `status` (and `progress`) to know what you got:
   * `result` may still be empty or partial while the task is not COMPLETED. Use {@link runPolling}
   * or {@link subscribe} to wait for a terminal status instead.
   *
   * @typeParam R - Shape of the workflow result.
   * @param taskName - Workflow name.
   * @param taskId - Task id returned by {@link submit} (or `onAccepted`).
   * @returns The task record as it stands at the moment of the call.
   * @throws {WorkflowsError} On a failed request (`httpStatusCode` carries the HTTP status)
   * or an unexpected failure.
   */
  async result(taskName, taskId) {
    try {
      const response = await this.getResult(taskName, taskId);
      return response.response;
    } catch (err) {
      throw this.wrapError(taskName, err);
    }
  }
  /**
   * Watches already-submitted work LIVE over the socket (no re-submit), as an async iterable
   * of the raw `StreamSocketMessage` the gateway pushes — iterate with `for await` and switch
   * on `msg.type`. With a `taskId` it watches that task (ending after its COMPLETED/FAILED);
   * without it, it watches EVERY task of the workflow until stopped. A lost session throws out
   * of the loop; `break` (or an AbortSignal in options) stops watching.
   *
   * @param options - Subscription target: `name` (required), optional `taskId` and abort signal.
   * @returns Async iterable of socket messages for the subscribed workflow/task.
   * @throws {WorkflowsError} If `options.name` is missing.
   */
  subscribe(options) {
    if (!options.name) {
      throw new WorkflowsError({
        httpStatusCode: 400,
        reason: "INVALID_ARGUMENTS",
        message: "subscribe() requires `name`."
      });
    }
    return this.sockets.subscribe(options);
  }
  /**
   * Closes the socket the client created from `socketConnection`. No-op for an injected
   * `socket` (the caller owns that one). Safe to call more than once.
   */
  async disconnect() {
    return this.sockets.disconnect();
  }
  /**
   * Marks a task's notification as seen so it is no longer surfaced to the user.
   * Called automatically after socket-mode runs; call it manually when consuming
   * results yourself (e.g. after {@link submit} + {@link subscribe}).
   *
   * @param taskId - Task id whose notification should be dismissed.
   * @param options - Optional extra request headers.
   * @throws {WorkflowsError} On a failed request; `httpStatusCode` carries the HTTP status.
   */
  async disableNotification(taskId, options) {
    try {
      const url = `${this.clientOptions.baseUrl}workflow-notifications/${taskId}/seen-status`;
      const response = await this._fetch(url, { method: "PATCH", headers: options?.headers });
      await this.throwIfError(response);
    } catch (err) {
      throw this.wrapError("disableNotification", err);
    }
  }
  async executeTaskSync(taskName, command, executionOptions) {
    const remoteSettings = await this.getApiSettings(taskName, executionOptions?.remoteSettingName);
    const response = await this._fetch(
      `${this.workflowsApiBaseUrl}/${taskName}/execute`,
      {
        signal: executionOptions?.abortSignal,
        method: "POST",
        headers: this.requestHeaders(remoteSettings.configId, executionOptions?.headers),
        body: JSON.stringify({ params: command })
      }
    );
    const successResponse = await this.toSuccessResponse(response);
    return successResponse.response;
  }
  async getResult(taskName, taskId) {
    const response = await this._fetch(`${this.workflowsApiBaseUrl}/${taskName}/${taskId}/result`, {
      method: "GET"
    });
    return this.toSuccessResponse(response);
  }
  async executeTaskStream(taskName, command, executionOptions) {
    const remoteSettings = await this.getApiSettings(taskName, executionOptions?.remoteSettingName);
    const onEvent = executionOptions?.onEvent;
    if (!onEvent) {
      throw new WorkflowsError({
        httpStatusCode: 400,
        reason: "INVALID_ARGUMENTS",
        message: "onEvent is required for streaming"
      });
    }
    const streamHeaders = this.requestHeaders(remoteSettings.configId, executionOptions?.headers);
    streamHeaders.set("Accept", "text/event-stream");
    const response = await this._fetch(`${this.workflowsApiBaseUrl}/${taskName}/stream`, {
      signal: executionOptions?.abortSignal,
      method: "POST",
      headers: streamHeaders,
      body: JSON.stringify({ params: command })
    });
    await this.throwIfError(response);
    if (!response.body) {
      throw new WorkflowsError({
        httpStatusCode: 500,
        reason: "invalid_response",
        message: "No response body"
      });
    }
    let completedEvent = {};
    for await (const event of decodeSSE(response.body)) {
      if (executionOptions?.abortSignal?.aborted) break;
      const data = event.data;
      if (data.type.startsWith("event.")) {
        await onEvent({
          ...data,
          type: data.type.replace(/^event\.\s*/, "")
        });
      }
      if (data.type === "task.partial-result") {
        await executionOptions.onPartialResult?.({
          status: "IN_PROGRESS",
          result: data.result
        });
      }
      if (data.type === "task.failed") {
        throw WorkflowsError.fromBody(data.result, {
          httpStatusCode: 500,
          reason: "workflow_failed",
          message: "Workflow failed"
        });
      }
      if (data.type === "task.completed") {
        completedEvent = data;
      }
    }
    return {
      result: completedEvent.result,
      usage: completedEvent.usage,
      status: "COMPLETED"
      /* COMPLETED */
      // the loop only leaves the FAILED branch by throwing
    };
  }
  /**
   * Fetches the execution history of a workflow, paginated.
   *
   * @typeParam R - Shape of each execution's result in the history entries.
   * @param taskName - Workflow name to fetch history for.
   * @param offset - Pagination offset (default 0).
   * @param limit - Page size (default 10).
   * @param isGrouped - When true, fetches the grouped history endpoint.
   * @returns The history page for the workflow.
   * @throws {WorkflowsError} On a failed request (`httpStatusCode` carries the HTTP status)
   * or an unexpected failure.
   */
  async executionsHistory(taskName, offset = 0, limit = 10, isGrouped = false) {
    try {
      const grouped = isGrouped ? "/grouped" : "";
      const url = `${this.clientOptions.baseUrl}workflows-history${grouped}?name=${taskName}&limit=${limit}&offset=${offset}`;
      const res = await this._fetch(url);
      return this.toSuccessResponse(res);
    } catch (err) {
      throw this.wrapError("requestHistory", err);
    }
  }
  async toSuccessResponse(response) {
    await this.throwIfError(response);
    const body = await response.text();
    try {
      return JSON.parse(body);
    } catch {
      throw new WorkflowsError({
        httpStatusCode: response.status,
        reason: "invalid_response",
        message: "Non json response was returned from server"
      });
    }
  }
  async throwIfError(response) {
    if (response.ok) return;
    throw await WorkflowsError.fromResponse(response, { reason: "request_failed" });
  }
  async getApiSettings(name, remoteSettingName) {
    if (!this.clientOptions.getRemoteSettings) return {};
    const settingName = remoteSettingName || `${name.replace(/-/g, "_").toLowerCase()}_api`;
    try {
      const apiSetting = await this.clientOptions.getRemoteSettings(
        settingName,
        "miniapp"
      );
      return {
        configId: apiSetting?.configId || "",
        executionMode: apiSetting?.executionMode
      };
    } catch (err) {
      logger_default.error(
        `workflows.getConfigId - failed when fetching remoteSettings: settingName=${settingName}`,
        err
      );
      return {};
    }
  }
  wrapError(actionName, error) {
    if (error instanceof WorkflowsError || error instanceof DOMException) {
      return error;
    }
    logger_default.error(`WorkflowsError - ${actionName} failed`, error);
    return WorkflowsError.fromUnknown(error);
  }
  // Per-call headers plus the resolved config id, with the call's own value winning — again via
  // Headers, so every HeadersInit shape survives.
  requestHeaders(configId, headers) {
    const merged = new Headers(headers);
    if (!merged.has("x-config-id")) merged.set("x-config-id", configId || "");
    return merged;
  }
  buildRequestHeaders(initHeaders) {
    const headers = new Headers(initHeaders);
    const optionHeaders = new Headers(this.defaultHeaders);
    for (const [key, value] of new Headers(this.clientOptions.headers).entries()) {
      optionHeaders.set(key, value);
    }
    for (const [key, value] of optionHeaders.entries()) {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    }
    if (this.clientOptions.apiKey) {
      headers.set("Authorization", `Bearer ${this.clientOptions.apiKey}`);
    }
    if (this.clientOptions.identityToken) {
      headers.set("x-app-authorization", `Bearer ${this.clientOptions.identityToken}`);
    }
    return headers;
  }
  async _fetch(input, init) {
    const headers = this.buildRequestHeaders(init?.headers);
    const requestInit = {
      ...init,
      headers
    };
    if (this.clientOptions.fetch) {
      return this.clientOptions.fetch(input, {
        ...requestInit,
        // return headers as a plain object for easier handling in custom fetch
        headers: Object.fromEntries(headers.entries())
      });
    }
    if (!headers.has("Authorization") && !headers.has("x-app-authorization")) {
      throw new WorkflowsError({
        httpStatusCode: 400,
        reason: "invalid_state",
        message: "apiKey is not provided"
      });
    }
    return fetch(input, requestInit);
  }
};
var WorkflowsClient_default = WorkflowsClient;

// src/client/workflows-error.ts
var GENERIC_REASONS = /* @__PURE__ */ new Set(["request_failed", "unknown_error"]);
function isWorkflowsError(err) {
  if (err instanceof WorkflowsError) return true;
  const e = err;
  return err instanceof Error && typeof e.reason === "string" && /WorkflowsError$/.test(e.name ?? "");
}
function toApiError(err, workflow, id) {
  if (err instanceof ApiError) return err;
  if (err instanceof DOMException && err.name === "AbortError") return err;
  const e = err;
  if (isWorkflowsError(err)) {
    if (e.reason === "client_timeout") {
      return new ApiError(`Timed out waiting for workflow ${workflow}${id ? `:${id}` : ""}`, {
        status: 408,
        code: "timeout"
      });
    }
    const status = e.httpStatusCode ?? 502;
    return new ApiError(e.message ?? "Request failed", {
      status,
      code: e.reason && !GENERIC_REASONS.has(e.reason) ? e.reason : codeForStatus(status)
    });
  }
  return new ApiError(err instanceof Error ? err.message : String(err), {
    status: 502,
    code: "generation_failed"
  });
}

// src/client/transport.ts
var GATEWAY_HEADERS = {
  "platform": "api",
  "X-Touchpoint": "sdk"
};
function maybeFetch(config) {
  if (config.fetch) return config.fetch;
  if (config.apiKey) {
    const token = config.apiKey.replace(/^Bearer\s+/i, "");
    return (url, init) => {
      const headers = new Headers(init?.headers);
      headers.set("Authorization", `Bearer ${token}`);
      for (const [name, value] of Object.entries(GATEWAY_HEADERS)) {
        if (!headers.has(name)) headers.set(name, value);
      }
      return globalThis.fetch(url, { ...init, headers });
    };
  }
  return null;
}
function createWorkflowsClient(apiUrl, authedFetch) {
  return new WorkflowsClient_default({
    baseUrl: apiUrl,
    // AuthenticatedFetch takes a string url; the client's fetch type accepts
    // URL/Request inputs too. Normalize without losing the Request's own url,
    // method, headers, or body (the client passes plain string urls today,
    // but the contract allows more).
    fetch: (input, init) => {
      if (input instanceof Request) {
        return authedFetch(input.url, init ?? {
          method: input.method,
          headers: input.headers,
          body: input.body,
          signal: input.signal
        });
      }
      return authedFetch(typeof input === "string" ? input : input.toString(), init);
    }
  });
}
function buildTransport(wc) {
  const asResult = (res) => ({
    result: res.result,
    usage: res.usage,
    raw: res.result
  });
  return {
    async execute(request) {
      try {
        const res = await wc.run(request.workflow, request.payload, {
          mode: ExecutionMode.SYNC,
          abortSignal: request.signal
        });
        return asResult(res);
      } catch (err) {
        throw toApiError(err, request.workflow);
      }
    },
    async submit(request) {
      try {
        const id = await wc.submit(request.workflow, request.payload, { abortSignal: request.signal });
        if (!id) {
          throw new ApiError("No task id in response", { status: 502, code: "invalid_response" });
        }
        return id;
      } catch (err) {
        throw toApiError(err, request.workflow);
      }
    },
    async poll(handle, options) {
      try {
        const res = await wc.runPolling(handle.workflow, handle.id, {
          pollingInterval: options?.intervalMs,
          retriesCount: options?.maxAttempts,
          abortSignal: options?.signal,
          onProgress: options?.onProgress
        });
        return asResult(res);
      } catch (err) {
        throw toApiError(err, handle.workflow, handle.id);
      }
    },
    async status(handle, signal) {
      if (signal?.aborted) {
        throw new ApiError("Operation aborted", { status: 499, code: "aborted" });
      }
      try {
        return asResult(await wc.result(handle.workflow, handle.id));
      } catch (err) {
        throw toApiError(err, handle.workflow, handle.id);
      }
    },
    async options(workflow, payload) {
      try {
        const res = await wc.options(workflow, payload);
        if (typeof res?.credits !== "number") return null;
        return { ...res, credits: res.credits };
      } catch {
        return null;
      }
    }
  };
}

// src/client/prepare.ts
var MODELS_WORKFLOW = "v1/models";
function buildModelsCommand(model, params, options) {
  if (!options) return { model, params };
  return {
    model,
    params,
    options: {
      inputs_transformation: {
        downscale_oversized_images: options.downscaleOversizedImages ?? false
      },
      ...options.drive ? { drive: options.drive } : {}
    }
  };
}
function asModelsResult(result) {
  return result && typeof result === "object" ? result : {};
}
function parseDynamicResult(completed, modelRef) {
  throwIfErrorResult(completed.result, modelRef);
  const r = asModelsResult(completed.result);
  const items = Array.isArray(r.items) && r.items.length > 0 ? r.items.map((item) => ({
    url: item.url,
    ...item.metadata ? { metadata: item.metadata } : {}
  })) : r.url ? [{ url: r.url }] : [];
  if (!items.length || !items[0].url) {
    throw new ApiError(`${modelRef}: unexpected response \u2014 no result URL`, {
      status: 502,
      code: "invalid_response"
    });
  }
  return {
    url: items[0].url,
    items,
    results: items,
    // Sync executions have no job id (nothing to poll) — omit rather than ''.
    ...completed.handle.id ? { generationId: completed.handle.id } : {},
    usage: completed.usage
  };
}
function parseDynamicTextResult(completed, modelRef) {
  throwIfErrorResult(completed.result, modelRef);
  throwIfErrorResult(completed.raw, modelRef);
  const r = asModelsResult(completed.result);
  if (typeof r.text !== "string") {
    throw new ApiError(`${modelRef}: unexpected response \u2014 no text`, {
      status: 502,
      code: "invalid_response"
    });
  }
  return {
    text: r.text,
    model: r.model ?? modelRef,
    raw: completed.raw ?? completed.result,
    usage: completed.usage
  };
}
function parseDynamicRunResult(completed, modelRef) {
  throwIfErrorResult(completed.result, modelRef);
  throwIfErrorResult(completed.raw, modelRef);
  if (completed.result == null) {
    throw new ApiError(`${modelRef}: unexpected response \u2014 empty result`, {
      status: 502,
      code: "invalid_response"
    });
  }
  return {
    result: completed.result,
    status: "COMPLETED",
    usage: completed.usage,
    // Sync executions have no job id (nothing to poll) — omit rather than ''.
    ...completed.handle.id ? { id: completed.handle.id } : {}
  };
}

// src/core/limits.ts
var MAX_DRIVE_PROMPT_LENGTH = 18e3;
var MAX_DRIVE_ATTRIBUTE_LENGTH = 2e4;

// src/client/drive.ts
var USER_REACTION_ATTR = "userReaction";
var DRAFT_TASK_ATTR = "seedance~draftTask";
var DRAFT_EXPIRES_AT_ATTR = "seedance~draftExpiresAt";
function inferResourceType(mode) {
  if (mode === "video") return "VIDEO";
  if (mode === "audio") return "AUDIO";
  return "PHOTO";
}
var MIME_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
  "video/x-msvideo": "avi",
  "video/x-m4v": "m4v",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
  "audio/vnd.wave": "wav",
  "audio/ogg": "ogg",
  "audio/opus": "ogg",
  "audio/aac": "aac",
  "audio/flac": "flac",
  "audio/x-flac": "flac",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/webm": "webm"
};
var EXTENSION_ALIASES = {
  jpeg: "jpg",
  jpe: "jpg",
  tif: "tiff",
  mpeg4: "mp4",
  quicktime: "mov"
};
function normalizeExtension(raw) {
  if (!raw) return void 0;
  const ext = raw.trim().toLowerCase().replace(/^\./, "").split("_")[0];
  if (!/^[a-z0-9]{2,5}$/.test(ext)) return void 0;
  return EXTENSION_ALIASES[ext] ?? ext;
}
function extensionFromMime(mimeType) {
  if (!mimeType) return void 0;
  const base = mimeType.split(";")[0].trim().toLowerCase();
  return MIME_EXTENSIONS[base];
}
function extensionFromUrl(url) {
  if (!url) return void 0;
  let path;
  try {
    path = new URL(url).pathname;
  } catch {
    path = url.split(/[?#]/)[0];
  }
  const match = /\.([A-Za-z0-9]{2,5})$/.exec(path.split("/").pop() ?? "");
  return normalizeExtension(match?.[1]);
}
function defaultExtension(mode) {
  switch (mode) {
    case "video":
      return "mp4";
    case "audio":
      return "mp3";
    case "image":
      return "png";
    // Mode genuinely unknown (dynamic mode, model not in the local catalog):
    // no extension beats a wrong one — media would be misidentified by it.
    default:
      return "";
  }
}
function resolveExtension(mode, hints = {}) {
  return extensionFromMime(hints.mimeType) ?? extensionFromUrl(hints.url) ?? normalizeExtension(hints.format) ?? defaultExtension(mode);
}
var FORMAT_PARAM_KEYS = ["outputFormat", "output_format", "format"];
function expectedOutputFormat(model, params) {
  for (const key of FORMAT_PARAM_KEYS) {
    const value = params[key];
    if (typeof value === "string" && value) return value;
  }
  for (const key of FORMAT_PARAM_KEYS) {
    const fallback = model.paramConfig?.[key]?.descriptor?.default;
    if (typeof fallback === "string" && fallback) return fallback;
  }
  return model.outputExtension;
}
function buildFilename(prompt, mode, hints) {
  const shortId = String(Date.now()).slice(-6);
  const ext = resolveExtension(mode, hints);
  const suffix = ext ? `.${ext}` : "";
  if (!prompt) return `ai-generation-${shortId}${suffix}`;
  const slug = prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
  return `${slug}-${shortId}${suffix}`;
}
function inferMediaType(file) {
  const name = String(file.name || "");
  if (/\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(name)) return "audio";
  if (/\.(mp4|webm|mov|avi|mkv|m4v|wmv)$/i.test(name)) return "video";
  const contentType = file.contentType ?? file.content;
  const resourceType = String(contentType?.resourceType || "").toUpperCase();
  if (resourceType === "VIDEO") return "video";
  if (resourceType === "AUDIO") return "audio";
  return "image";
}
function contentResourceTypes(type) {
  if (type === "image") return "PHOTO";
  if (type === "video") return "VIDEO";
  if (type === "audio") return "AUDIO";
  return "PHOTO,VIDEO,AUDIO";
}
function normalizeUrl(raw) {
  if (typeof raw !== "string") return void 0;
  return raw.trim() || void 0;
}
function parseAttributes(raw) {
  const map = {};
  if (!raw || typeof raw !== "object") return map;
  if (Array.isArray(raw)) {
    for (const a of raw) {
      map[a.property] = String(a.value);
    }
  } else {
    for (const [k, v] of Object.entries(raw)) {
      map[k] = String(v);
    }
  }
  return map;
}
function parseDraftInfo(attrs) {
  const draftTask = parseJsonAttr(attrs[DRAFT_TASK_ATTR]);
  if (!isSeedanceDraftTask(draftTask)) return {};
  return {
    draftTask: { id: draftTask.id },
    ...attrs[DRAFT_EXPIRES_AT_ATTR] ? { draftExpiresAt: attrs[DRAFT_EXPIRES_AT_ATTR] } : {}
  };
}
function parseReaction(value) {
  return value === "like" || value === "dislike" ? value : void 0;
}
function parseJsonAttr(raw) {
  if (!raw) return void 0;
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
  } catch {
    return void 0;
  }
}
var asString = (v) => typeof v === "string" && v.trim() ? v : void 0;
var asStringArray = (v) => Array.isArray(v) && v.length && v.every((x) => typeof x === "string") ? v : void 0;
function toSdkPayload(params) {
  const p2 = { prompt: cutPrompt(String(params.prompt ?? ""), MAX_DRIVE_PROMPT_LENGTH) };
  for (const [key, value] of Object.entries(params)) {
    if (key === "prompt") continue;
    if (value === void 0 || value === null || value === "") continue;
    p2[key] = value;
  }
  return p2;
}
function cutPrompt(prompt, max) {
  if (prompt.length <= max) return prompt;
  const code = prompt.charCodeAt(max - 1);
  return prompt.slice(0, code >= 55296 && code <= 56319 ? max - 1 : max);
}
function serializeSdkPayload(params) {
  const payload = toSdkPayload(params);
  let prompt = payload.prompt;
  for (; ; ) {
    const serialized = JSON.stringify({ ...payload, prompt });
    const excess = serialized.length - MAX_DRIVE_ATTRIBUTE_LENGTH;
    if (excess <= 0 || prompt.length === 0) return serialized;
    prompt = cutPrompt(prompt, Math.max(0, prompt.length - excess));
  }
}
function buildGenerationAttributes(input) {
  const attrs = {
    model: input.modelId,
    aiSDKPayload: serializeSdkPayload(input.params)
  };
  if (input.app) {
    attrs.appId = input.app.id;
    attrs.appType = input.app.type;
  }
  return attrs;
}
function attributesForSave(params) {
  const attributes = { ...params.attributes };
  if (params.generation) {
    return { ...attributes, ...buildGenerationAttributes(params.generation) };
  }
  if (asString(attributes.model)) {
    const legacy = adaptLegacyGeneration(attributes);
    const canonical = parseJsonAttr(attributes.aiSDKPayload);
    const payload = canonical && typeof canonical.prompt === "string" ? canonical : legacy.aiSDKPayload ?? {};
    return {
      ...legacy.appId ? { appId: legacy.appId, appType: legacy.appType } : {},
      ...attributes,
      ...buildGenerationAttributes({ modelId: attributes.model, params: payload })
    };
  }
  return attributes;
}
function toMediaItem(file) {
  const url = normalizeUrl(file.sourceUrl);
  if (!url || String(file.name || "").startsWith("__")) return null;
  const preview = file.preview;
  return {
    uid: String(file.uid ?? ""),
    url,
    name: String(file.name || ""),
    type: inferMediaType(file),
    previewUrl: normalizeUrl(preview?.url),
    timestamp: Number(file.updatedAt ?? file.createdAt ?? 0)
  };
}
function toDetailedItem(file) {
  const base = toMediaItem(file);
  if (!base) return null;
  const attrs = parseAttributes(file.attributes);
  let extras = {};
  if (attrs.textScript) {
    try {
      extras = JSON.parse(attrs.textScript);
    } catch {
    }
  }
  return {
    ...base,
    createdAt: file.createdAt,
    model: attrs.model,
    prompt: attrs.prompt || void 0,
    service: attrs.service,
    subType: attrs.subType,
    duration: attrs.duration,
    userReaction: parseReaction(attrs[USER_REACTION_ATTR]),
    referenceImageUrls: extras.referenceImageUrls,
    referenceVideoUrl: extras.referenceVideoUrl,
    referenceAudioUrl: extras.referenceAudioUrl,
    aspectRatio: extras.aspectRatio,
    resolution: extras.resolution,
    quality: extras.quality,
    ...parseDraftInfo(attrs)
  };
}
var LEGACY_TOOL_APP = {
  "ai-playground": { appId: "com.picsart.ai-playground", appType: "miniapp" }
};
function adaptLegacyGeneration(attrs) {
  let extras = {};
  if (attrs.textScript) {
    try {
      extras = JSON.parse(attrs.textScript);
    } catch {
    }
  }
  const aiSDKPayload = { prompt: attrs.prompt || "" };
  const aspectRatio = asString(extras.aspectRatio);
  if (aspectRatio) aiSDKPayload.aspectRatio = aspectRatio;
  const resolution = asString(extras.resolution);
  if (resolution) aiSDKPayload.resolution = resolution;
  const duration = extras.duration ?? attrs.duration;
  if (duration != null && duration !== "") aiSDKPayload.duration = Number(duration);
  const imageUrls = asStringArray(extras.referenceImageUrls);
  if (imageUrls) aiSDKPayload.imageUrls = imageUrls;
  const videoUrl = asString(extras.referenceVideoUrl);
  if (videoUrl) aiSDKPayload.videoUrl = videoUrl;
  const audioUrl = asString(extras.referenceAudioUrl);
  if (audioUrl) aiSDKPayload.audioUrl = audioUrl;
  const startFrame = asString(extras.startFrame);
  if (startFrame) aiSDKPayload.startFrame = startFrame;
  const endFrame = asString(extras.endFrame);
  if (endFrame) aiSDKPayload.endFrame = endFrame;
  const quality = asString(extras.quality);
  if (quality) aiSDKPayload.quality = quality;
  const style = asString(extras.style);
  if (style) aiSDKPayload.style = style;
  const iterateModel = asString(extras.iterateModel);
  if (iterateModel) aiSDKPayload.iterateModel = iterateModel;
  const exploreImageId = asString(extras.exploreImageId);
  if (exploreImageId) aiSDKPayload.exploreImageId = exploreImageId;
  const app = attrs.tool ? LEGACY_TOOL_APP[attrs.tool] : void 0;
  return {
    appId: app?.appId,
    appType: app?.appType,
    model: attrs.model || void 0,
    aiSDKPayload,
    userReaction: parseReaction(attrs[USER_REACTION_ATTR]),
    ...parseDraftInfo(attrs)
  };
}
function parseGeneration(file) {
  const attrs = parseAttributes(file.attributes);
  if (!attrs.aiSDKPayload) {
    return adaptLegacyGeneration(attrs);
  }
  return {
    appId: attrs.appId || void 0,
    appType: attrs.appType === "native" || attrs.appType === "miniapp" ? attrs.appType : void 0,
    model: attrs.model || void 0,
    aiSDKPayload: parseJsonAttr(attrs.aiSDKPayload),
    userReaction: parseReaction(attrs[USER_REACTION_ATTR]),
    ...parseDraftInfo(attrs)
  };
}
function createDriveClient(f, apiUrl, rootFolderName) {
  let cachedRootUid = null;
  let rootPromise = null;
  const jsonPost = async (path, body) => f(`${apiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const jsonGet = async (path) => f(`${apiUrl}${path}`);
  async function findFolderByPath(name) {
    try {
      const res = await jsonGet(`/cloud-storage/v1/me/files-by-path?path=${encodeURIComponent(name)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.status !== "success") return null;
      const response = data.response;
      const file = Array.isArray(response) ? response[0] : response;
      return file?.uid ?? null;
    } catch {
      return null;
    }
  }
  async function findFolderInList(name, parentUid) {
    try {
      const params = parentUid ? `parentFolderUid=${parentUid}&fileTypes=FOLDER&limit=100` : `fileTypes=FOLDER&limit=100`;
      const res = await jsonGet(`/cloud-storage/v1/me/files?${params}`);
      if (!res.ok) return null;
      const data = await res.json();
      const response = data.response;
      const files = Array.isArray(response) ? response : [];
      const match = files.find((f2) => String(f2.name || "").toLowerCase() === name.toLowerCase());
      return match?.uid ?? null;
    } catch {
      return null;
    }
  }
  async function createFolder(name, parentUid) {
    try {
      const body = { name };
      if (parentUid) body.parentFolderUid = parentUid;
      const res = await jsonPost("/cloud-storage/v1/me/folders", body);
      if (!res.ok) return null;
      const data = await res.json();
      const response = data.response;
      return response?.uid ?? null;
    } catch {
      return null;
    }
  }
  async function resolveRootFolder() {
    const byPath = await findFolderByPath(rootFolderName);
    if (byPath) return byPath;
    const inList = await findFolderInList(rootFolderName);
    if (inList) return inList;
    const recheck = await findFolderByPath(rootFolderName);
    if (recheck) return recheck;
    return createFolder(rootFolderName);
  }
  async function ensureRootFolder() {
    if (cachedRootUid) return cachedRootUid;
    if (!rootPromise) {
      rootPromise = resolveRootFolder().then((uid) => {
        cachedRootUid = uid;
        rootPromise = null;
        return uid;
      }).catch((err) => {
        setTimeout(() => {
          rootPromise = null;
        }, 1e4);
        throw err;
      });
    }
    return rootPromise;
  }
  async function fetchFolders(parentUid) {
    try {
      const params = parentUid ? `parentFolderUid=${parentUid}&fileTypes=FOLDER&limit=100` : `fileTypes=FOLDER&limit=100`;
      const res = await jsonGet(`/cloud-storage/v1/me/files?${params}`);
      if (!res.ok) return [];
      const data = await res.json();
      const files = Array.isArray(data.response) ? data.response : [];
      return files.filter((f2) => f2.uid && f2.name).map((f2) => ({ name: String(f2.name), uid: String(f2.uid) }));
    } catch {
      return [];
    }
  }
  async function fetchMedia(opts) {
    try {
      const endpoint = opts.folderUid ? "/cloud-storage/v1/me/files" : "/cloud-storage/v1/me/flattened-files";
      const params = [
        opts.folderUid ? `parentFolderUid=${opts.folderUid}` : "",
        "limit=100",
        "sortType=UPDATED",
        "sortOrder=DESC",
        "fileTypes=FILE",
        `contentResourceTypes=${contentResourceTypes(opts.type)}`
      ].filter(Boolean).join("&");
      const res = await jsonGet(`${endpoint}?${params}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.response) ? data.response : [];
    } catch {
      return [];
    }
  }
  async function fetchFileByUid(fileUid) {
    try {
      const res = await jsonGet(`/drive/v1/files/${fileUid}`);
      if (!res.ok) return null;
      const data = await res.json();
      const file = data.response;
      return file && typeof file === "object" && !Array.isArray(file) ? file : null;
    } catch {
      return null;
    }
  }
  async function setReaction(fileUid, reaction) {
    try {
      const res = await f(`${apiUrl}/drive/v1/files/${fileUid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attributes: { [USER_REACTION_ATTR]: reaction } })
      });
      return res.ok;
    } catch {
      return false;
    }
  }
  return {
    /**
     * Ensure a subfolder exists inside the root folder.
     * Creates both root and subfolder if needed. Returns the folder reference.
     * Call with no argument to just ensure the root folder exists.
     */
    async ensureFolder(subfolder) {
      const rootUid = await ensureRootFolder();
      if (!rootUid) return null;
      if (!subfolder) {
        return { name: rootFolderName, uid: rootUid };
      }
      const existingUid = await findFolderInList(subfolder, rootUid);
      if (existingUid) return { name: subfolder, uid: existingUid };
      const newUid = await createFolder(subfolder, rootUid);
      if (!newUid) return null;
      return { name: subfolder, uid: newUid };
    },
    /** List subfolders inside the root folder (boards). */
    async folders() {
      const rootUid = await ensureRootFolder();
      if (!rootUid) return [];
      return fetchFolders(rootUid);
    },
    /** List top-level Drive folders + root subfolders, deduplicated. */
    async allFolders() {
      const rootUid = await ensureRootFolder();
      const [rootLevel, subfolders] = await Promise.all([
        fetchFolders(),
        rootUid ? fetchFolders(rootUid) : Promise.resolve([])
      ]);
      const seen = /* @__PURE__ */ new Set();
      const merged = [];
      for (const folder of [...rootLevel, ...subfolders]) {
        if (seen.has(folder.uid)) continue;
        seen.add(folder.uid);
        merged.push(folder);
      }
      return merged;
    },
    /** Find a folder by name (case-insensitive) across root and subfolders. */
    async findFolder(name) {
      if (name.toLowerCase() === rootFolderName.toLowerCase()) {
        const uid = await ensureRootFolder();
        return uid ? { name: rootFolderName, uid } : null;
      }
      const rootUid = await ensureRootFolder();
      const [rootLevel, subfolders] = await Promise.all([
        fetchFolders(),
        rootUid ? fetchFolders(rootUid) : Promise.resolve([])
      ]);
      const lowerName = name.toLowerCase();
      return [...rootLevel, ...subfolders].find((f2) => f2.name.toLowerCase() === lowerName) ?? null;
    },
    /**
     * List media items. When no folder is given, lists across all folders (flattened).
     * Optionally filter by media type (sent to backend, not client-side).
     */
    async list(options) {
      const folderUid = options?.folder?.uid ?? void 0;
      const files = await fetchMedia({ folderUid, type: options?.type });
      const items = [];
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
    async listDetailed(options) {
      const folderUid = options?.folder?.uid ?? void 0;
      const files = await fetchMedia({ folderUid, type: options?.type });
      const items = [];
      for (const file of files) {
        const item = toDetailedItem(file);
        if (item) items.push(item);
      }
      return items;
    },
    async getGeneration(fileUid) {
      const file = await fetchFileByUid(fileUid);
      return file ? parseGeneration(file) : null;
    },
    /** Save a file to Drive. Returns save result or null on failure. */
    async save(params, folder) {
      const targetUid = folder?.uid ?? await ensureRootFolder();
      if (!targetUid) return null;
      const targetFolder = folder ?? { name: rootFolderName, uid: targetUid };
      const body = {
        name: params.name,
        sourceUrl: params.url,
        parentFolderUid: targetUid,
        content: {
          type: "STANDALONE",
          resourceType: params.resourceType,
          sourcePlatform: "WEB"
        },
        preview: {
          url: params.previewUrl || params.url,
          width: 1024,
          height: 1024
        },
        attributes: Object.entries(attributesForSave(params)).map(([property, value]) => ({
          property,
          value
        }))
      };
      try {
        let res = await jsonPost("/cloud-storage/v1/me/files", body);
        if (res.status === 400) {
          const text = await res.text();
          if (text.includes("restricted_keywords")) {
            const ext = params.name.split(".").pop() || "png";
            body.name = `ai-generation-${Date.now()}.${ext}`;
            res = await jsonPost("/cloud-storage/v1/me/files", body);
          } else {
            return null;
          }
        }
        if (!res.ok) return null;
        const data = await res.json();
        const file = data.response;
        const uid = file?.uid;
        if (!uid) return null;
        return { uid, folder: targetFolder };
      } catch {
        return null;
      }
    },
    /** Build standard save params from a generation result. */
    buildSaveParams(url, modelId, modelName, mode, promptOrParams) {
      const params = typeof promptOrParams === "string" ? { prompt: promptOrParams } : promptOrParams ?? {};
      const prompt = String(params.prompt ?? "");
      return {
        url,
        name: buildFilename(prompt, mode, { url }),
        resourceType: inferResourceType(mode),
        attributes: {
          tool: "ai-sdk",
          ...buildGenerationAttributes({ modelId, params }),
          prompt,
          service: modelName
        }
      };
    },
    async addReaction(fileUid, reaction) {
      return setReaction(fileUid, reaction);
    },
    async removeReaction(fileUid) {
      return setReaction(fileUid, null);
    }
  };
}

// src/client/apis.ts
function createApis(client) {
  return {
    async run(api, payload, options) {
      if (!client) {
        throw new ApiError(
          "`ai.apis` requires `apiUrl` plus `fetch` or `apiKey` on createClient \u2014 the workflows APIs are not served by a custom transport.",
          { status: 400, code: "unsupported_transport" }
        );
      }
      const forwarded = { ...options ?? {} };
      delete forwarded.remoteSettingName;
      delete forwarded.onPartialResult;
      delete forwarded.notificationConfig;
      try {
        return await client.run(api, payload, forwarded);
      } catch (err) {
        throw toApiError(err, api);
      }
    }
    // The public conditional-typed signature lives on ApisClient; the runtime
    // impl is uniform, so we assert the shape here.
  };
}

// src/client/catalogs.ts
var DEFAULT_LIMIT = 100;
var MIN_TTL_SECONDS = 60;
var copyPage = (page) => ({
  items: [...page.items],
  nextCursor: page.nextCursor
});
var abortError = (signal) => signal.reason ?? new DOMException("The catalog load was aborted.", "AbortError");
function abortable(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError(signal));
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(abortError(signal));
    signal.addEventListener("abort", onAbort, { once: true });
    const settle = () => signal.removeEventListener("abort", onAbort);
    promise.then(
      (value) => {
        settle();
        resolve(value);
      },
      (err) => {
        settle();
        reject(err);
      }
    );
  });
}
function createCatalogs(transport, options) {
  const stores = /* @__PURE__ */ new Map();
  const inflight = /* @__PURE__ */ new Map();
  const keyOf3 = (s) => `${s.workflow} ${s.modelId ?? ""}`;
  async function fetchPage(workflow, query) {
    const payload = {};
    if (query.modelId) payload.modelId = query.modelId;
    if (query.cursor) payload.cursor = query.cursor;
    if (query.limit) payload.limit = query.limit;
    let res;
    try {
      res = await transport.execute({ workflow, payload });
    } catch (err) {
      if (err instanceof ApiError || err instanceof DOMException && err.name === "AbortError") throw err;
      throw new ApiError(`${workflow} failed: ${err instanceof Error ? err.message : String(err)}`, {
        status: 502,
        code: "bad_gateway"
      });
    }
    const body = res.result ?? res.raw;
    const container = body?.response ?? body;
    const result = container?.result ?? container;
    throwIfErrorResult(result, workflow);
    if (!result || !Array.isArray(result.items)) {
      throw new ApiError(`${workflow} returned no catalog result`, {
        status: 502,
        code: "invalid_response"
      });
    }
    return { ...result, nextCursor: result.nextCursor ?? null };
  }
  function storeFor(source, forceRefresh) {
    const key = keyOf3(source);
    let store = stores.get(key);
    if (!store) {
      store = { pages: /* @__PURE__ */ new Map(), version: "", expiresAt: 0, gen: 0 };
      stores.set(key, store);
      return store;
    }
    if (forceRefresh || store.expiresAt !== 0 && store.expiresAt <= Date.now()) {
      store.pages.clear();
      store.version = "";
      store.expiresAt = 0;
      store.gen += 1;
    }
    return store;
  }
  function accumulated(store) {
    const byId = /* @__PURE__ */ new Map();
    for (const page of store.pages.values()) {
      for (const item of page.items) byId.set(item.id, item);
    }
    return [...byId.values()];
  }
  async function loadPage(def, paramKey, source, options2) {
    const store = storeFor(source, options2?.forceRefresh);
    const cursorKey = options2?.cursor ?? "";
    const cached = store.pages.get(cursorKey);
    if (cached) return abortable(Promise.resolve(copyPage(cached)), options2?.signal);
    const inflightKey = `${keyOf3(source)} ${cursorKey}`;
    if (!options2?.forceRefresh) {
      const pending = inflight.get(inflightKey);
      if (pending) return abortable(pending.then(copyPage), options2?.signal);
    }
    const gen = store.gen;
    const run = fetchPage(source.workflow, {
      modelId: source.modelId,
      cursor: options2?.cursor,
      limit: options2?.limit ?? DEFAULT_LIMIT
    }).then((res) => {
      const page = { items: res.items, nextCursor: res.nextCursor };
      if (store.gen === gen) {
        store.pages.set(cursorKey, page);
        store.version = res.version;
        if (store.expiresAt === 0) {
          store.expiresAt = Date.now() + Math.max(MIN_TTL_SECONDS, res.ttlSeconds || 0) * 1e3;
        }
        installHydratedCatalog(source, paramKey, accumulated(store), def.provider, store.version);
      }
      return page;
    }).finally(() => {
      if (inflight.get(inflightKey) === run) inflight.delete(inflightKey);
    });
    inflight.set(inflightKey, run);
    return abortable(run.then(copyPage), options2?.signal);
  }
  function requireSource(def, key) {
    const d = def.paramConfig[key]?.descriptor;
    const source = d?.kind === "catalog" ? d.source : void 0;
    if (!source) {
      throw new Error(`Model "${def.id}" has no runtime catalog on param "${key}" \u2014 its options are static.`);
    }
    return source;
  }
  async function loadParam(model, key, options2) {
    const def = resolveModel(model);
    return loadPage(def, key, requireSource(def, key), options2);
  }
  const client = {
    voices: (model, options2) => loadParam(model, "voiceId", options2),
    avatars: (model, options2) => loadParam(model, "videoId", options2),
    templates: (model, options2) => loadParam(model, "templateId", options2)
  };
  if (options?.preload) {
    const seen = /* @__PURE__ */ new Set();
    for (const def of peekActiveModels() ?? []) {
      for (const [key, entry] of Object.entries(def.paramConfig)) {
        const d = entry.descriptor;
        const source = d.kind === "catalog" ? d.source : void 0;
        if (!source || seen.has(keyOf3(source))) continue;
        seen.add(keyOf3(source));
        void loadPage(def, key, source).catch(() => {
        });
      }
    }
  }
  return client;
}

// src/client/types.ts
var GenerationEventType = {
  Progress: "generation.progress",
  Completed: "generation.completed",
  Failed: "generation.failed"
};

// src/client/index.ts
var MODE_POLL_DEFAULTS = {
  video: { intervalMs: 2e3, maxAttempts: 1800 }};
function createClient(config) {
  const authedFetch = maybeFetch(config);
  const wc = config.apiUrl && authedFetch ? createWorkflowsClient(config.apiUrl, authedFetch) : null;
  function buildDefaultTransport() {
    if (wc) return buildTransport(wc);
    throw new Error(config.apiUrl ? "createClient config requires either `fetch` or `apiKey` (or a custom `transport`)." : "createClient config requires `apiUrl` (or a custom `transport`).");
  }
  const transport = config.transport ?? buildDefaultTransport();
  const supportsAsync = typeof transport.submit === "function" && typeof transport.poll === "function";
  const apis = createApis(wc);
  const inputsTransformationConfig = config.inputsTransformation;
  const catalogs = createCatalogs(transport, config.catalogs);
  const driveConfig = config.drive;
  const driveApiUrl = config.apiUrl;
  if (driveConfig && !(authedFetch && driveApiUrl)) {
    throw new Error("createClient `drive` requires `apiUrl` plus `fetch` or `apiKey` \u2014 Drive is a REST surface, not served by a custom transport.");
  }
  const driveClient = driveConfig && authedFetch && driveApiUrl ? createDriveClient(authedFetch, driveApiUrl, driveConfig.folder) : null;
  function toApiError2(err, signal) {
    if (err instanceof ApiError) return err;
    if (err instanceof DOMException && err.name === "AbortError") {
      if (signal?.aborted) {
        return new ApiError("Operation aborted", { status: 499, code: "aborted" });
      }
      throw err;
    }
    return new ApiError(err instanceof Error ? err.message : String(err), {
      status: 502,
      code: "generation_failed"
    });
  }
  function unsupportedTransport(capability) {
    return new ApiError(`Transport does not support ${capability} (execute-only transport)`, {
      status: 400,
      code: "unsupported_transport"
    });
  }
  function asCompleted(handle, res) {
    return toCompletedStatus(handle, res.result, res.raw ?? res.result, res.usage);
  }
  function pollJob(handle, poll, onProgress) {
    if (!transport.poll) return Promise.reject(unsupportedTransport("polling"));
    return transport.poll(handle, { ...poll, onProgress });
  }
  function assertAsyncLifecycle() {
    if (!transport.submit) throw unsupportedTransport("submit");
    if (!transport.poll) throw unsupportedTransport("polling");
  }
  async function submitJob(workflow, payload, signal) {
    if (signal?.aborted) {
      throw new ApiError("Operation aborted", { status: 499, code: "aborted" });
    }
    if (!transport.submit) throw unsupportedTransport("submit");
    const id = await transport.submit({ workflow, payload, signal });
    if (!id) {
      throw new ApiError("No task id in response", { status: 502, code: "invalid_response" });
    }
    return id;
  }
  function buildDrivePayloadOptions(model, params, options) {
    const explicit = options?.drive;
    if (!driveConfig && !explicit) return void 0;
    const generation = explicit?.generation;
    const attributes = buildGenerationAttributes(generation ? { ...generation, app: generation.app ?? options?.app } : { modelId: model.id, params, app: options?.app });
    const folderPath = options?.folder?.name ?? driveConfig?.folder;
    return {
      // Named before the job runs, so the requested/declared format is the best hint.
      name: explicit?.name ?? buildFilename(params.prompt, model.mode, { format: expectedOutputFormat(model, params) }),
      // Generation provenance is authoritative; custom attributes cannot replace it.
      attributes: { ...explicit?.attributes ?? {}, ...attributes },
      folder: explicit?.folder ?? (folderPath ? { path: folderPath } : void 0)
    };
  }
  async function askOptionsRoute(workflow, payload) {
    const res = await transport.options(workflow, payload);
    if (typeof res === "number") return { credits: res };
    return res && typeof res.credits === "number" ? res : null;
  }
  async function fetchOptions(model, params) {
    if (!transport.options) return null;
    const command = buildModelsCommand(model, params);
    return askOptionsRoute(MODELS_WORKFLOW, command);
  }
  function pollOptionsFor(overrides) {
    const resolved = { ...MODE_POLL_DEFAULTS.video };
    if (overrides?.intervalMs !== void 0) resolved.intervalMs = overrides.intervalMs;
    if (overrides?.maxAttempts !== void 0) resolved.maxAttempts = overrides.maxAttempts;
    if (overrides?.signal !== void 0) resolved.signal = overrides.signal;
    return resolved;
  }
  async function executeDynamic(command, options) {
    const signal = options?.signal;
    const payload = command;
    try {
      if (!supportsAsync) {
        const res2 = await transport.execute({ workflow: MODELS_WORKFLOW, payload, signal });
        return toCompletedStatus({ workflow: MODELS_WORKFLOW, id: "" }, res2.result, res2.raw ?? res2.result, res2.usage);
      }
      const id = await submitJob(MODELS_WORKFLOW, payload, signal);
      const res = await pollJob({ workflow: MODELS_WORKFLOW, id }, pollOptionsFor(options));
      return asCompleted({ workflow: MODELS_WORKFLOW, id }, res);
    } catch (err) {
      throw toApiError2(err, signal);
    }
  }
  function buildDynamicDriveOptions(modelRef, params, options) {
    const def = peekActiveModels() !== null ? findModel(modelRef) : void 0;
    if (def) return buildDrivePayloadOptions(def, params, options);
    const explicit = options?.drive;
    if (!driveConfig && !explicit) return void 0;
    const generation = explicit?.generation;
    const attributes = buildGenerationAttributes(generation ? { ...generation, app: generation.app ?? options?.app } : { modelId: modelRef, params, app: options?.app });
    const folderPath = options?.folder?.name ?? driveConfig?.folder;
    return {
      name: explicit?.name ?? buildFilename(params.prompt, "unknown", {
        format: expectedOutputFormat({ paramConfig: {} }, params)
      }),
      attributes: { ...explicit?.attributes ?? {}, ...attributes },
      folder: explicit?.folder ?? (folderPath ? { path: folderPath } : void 0)
    };
  }
  function resolveDownscale(options) {
    return options?.inputsTransformation?.downscaleOversizedImages ?? inputsTransformationConfig?.downscaleOversizedImages ?? false;
  }
  function subscribeGenerator(resolveHandle, pollOptions, parse, options) {
    return (async function* () {
      let handle;
      try {
        handle = await resolveHandle();
      } catch (err) {
        yield { type: "generation.failed", error: toApiError2(err, options?.signal) };
        return;
      }
      const poll = new AbortController();
      if (options?.signal) {
        if (options.signal.aborted) poll.abort();
        else options.signal.addEventListener("abort", () => poll.abort(), { once: true });
      }
      const queue = [];
      let wake;
      let waker = new Promise((resolve) => {
        wake = () => resolve(null);
      });
      const done = pollJob(
        handle,
        { ...pollOptions, signal: poll.signal },
        (p2) => {
          queue.push(p2);
          wake();
        }
      ).then(
        (res) => ({ ok: true, res }),
        (err) => ({ ok: false, err })
      );
      try {
        for (; ; ) {
          while (queue.length) yield { type: "generation.progress", progress: queue.shift() };
          const raced = await Promise.race([done, waker]);
          if (raced === null) {
            waker = new Promise((resolve) => {
              wake = () => resolve(null);
            });
            continue;
          }
          while (queue.length) yield { type: "generation.progress", progress: queue.shift() };
          if (!raced.ok) {
            yield { type: "generation.failed", error: toApiError2(raced.err, options?.signal) };
            return;
          }
          const completed = asCompleted(handle, raced.res);
          try {
            yield { type: "generation.completed", result: parse(completed) };
          } catch (err) {
            yield { type: "generation.failed", error: toApiError2(err, options?.signal) };
          }
          return;
        }
      } finally {
        poll.abort();
      }
    })();
  }
  return {
    // ── Simple path ──────────────────────────────────────────────────
    /**
     * Run any model by id and get the task result back, generically — the
     * model-id counterpart of `ai.apis.run()`. models-hub builds and validates
     * the payload, executes the workflow (sync or async), applies the model's
     * `outputSchema` when declared, and returns the task result as-is — no
     * media-URL or text extraction, no Drive save, no options injection. The
     * only generation surface for json-mode (structured-output) models.
     */
    async run(model, params, options) {
      const completed = await executeDynamic(buildModelsCommand(model, params), options);
      return parseDynamicRunResult(completed, model);
    },
    /**
     * Generate content using a model.
     *
     * Sends the model ref and params to the `v1/models` workflow, polls to
     * completion, and returns the parsed result (`items[]` with per-item URLs
     * and vendor metadata). If drive options are provided (or DriveConfig is
     * set), the backend saves the result to Picsart Drive.
     */
    async generate(model, params, options) {
      const drive = buildDynamicDriveOptions(model, params, options);
      const command = buildModelsCommand(model, params, {
        drive,
        downscaleOversizedImages: resolveDownscale(options)
      });
      const completed = await executeDynamic(command, options);
      return parseDynamicResult(completed, model);
    },
    /**
     * Generate text using an LLM model (Claude, Gemini, OpenAI).
     *
     * Single-shot only — pass text and optional image/video, get text back.
     * Text results are not saved to Drive.
     */
    async generateText(model, params, options) {
      const completed = await executeDynamic(buildModelsCommand(model, params), options);
      return parseDynamicTextResult(completed, model);
    },
    /**
     * Get exact credit cost for a model with specific parameters.
     * Calls the backend /options endpoint for real-time pricing.
     * Returns null if pricing is unavailable.
     */
    async getCredits(model, params) {
      return (await fetchOptions(model, params))?.credits ?? null;
    },
    /**
     * Same /options call as getCredits(), returning the whole response:
     * credits plus billable amount, unit, rate, whether they are estimated, and
     * whether the caller has the permissions the request needs.
     */
    async options(model, params) {
      return fetchOptions(model, params);
    },
    // ── Advanced lifecycle ────────────────────────────────────────────
    /** Submit a generation job and get its generation id back. Media models
     *  only — text models have no async lifecycle (`result()`/`subscribe()`
     *  reject them). Pass the id to `result(model, id)` / `subscribe(model, id)`. */
    async submit(model, params, options) {
      assertAsyncLifecycle();
      const drive = buildDynamicDriveOptions(model, params, options);
      const command = buildModelsCommand(model, params, {
        drive,
        downscaleOversizedImages: resolveDownscale(options)
      });
      try {
        return await submitJob(MODELS_WORKFLOW, command, options?.signal);
      } catch (err) {
        throw toApiError2(err, options?.signal);
      }
    },
    /** Poll a submitted job until it completes and return the parsed result. */
    async result(model, generationId, options) {
      assertAsyncLifecycle();
      const handle = { workflow: MODELS_WORKFLOW, id: generationId };
      let completed;
      try {
        completed = asCompleted(handle, await pollJob(handle, pollOptionsFor(options)));
      } catch (err) {
        throw toApiError2(err, options?.signal);
      }
      return parseDynamicResult(completed, model);
    },
    /**
     * Subscribe to live updates for a submitted job. Yields one
     * {@link GenerationEvent} per poll: `generation.progress` while running,
     * then a single terminal `generation.completed` (with the parsed result)
     * or `generation.failed` (with the {@link ApiError} `result()` would have
     * thrown). Failures arrive as events, not exceptions.
     *
     * ```ts
     * const id = await ai.submit('flux-2-pro', { prompt: 'a cat' });
     * for await (const e of ai.subscribe('flux-2-pro', id)) {
     *   if (e.type === 'generation.progress') console.log(e.progress?.percent);
     *   if (e.type === 'generation.completed') console.log(e.result.url);
     *   if (e.type === 'generation.failed') console.error(e.error.message);
     * }
     * ```
     */
    subscribe(model, generationId, options) {
      assertAsyncLifecycle();
      return subscribeGenerator(
        // The workflow is always v1/models — no edit-route probe needed.
        async () => ({ workflow: MODELS_WORKFLOW, id: generationId }),
        pollOptionsFor(options),
        (completed) => parseDynamicResult(completed, model),
        options
      );
    },
    // ── Dynamic catalog ──────────────────────────────────────────────
    /**
     * Fetch the model catalog from models-hub and install it as the active
     * catalog. The only trigger for the load — createClient never starts it.
     * Idempotent; a failed load may be retried.
     */
    async initModelCatalog(initOptions) {
      if (!config.apiUrl || !authedFetch) {
        throw new ApiError("initModelCatalog() requires `apiUrl` plus `fetch` or `apiKey` \u2014 the catalog is a REST surface, not served by a custom transport.", {
          status: 400,
          code: "validation_error"
        });
      }
      return loadModelCatalog(authedFetch, config.apiUrl, initOptions?.filtersOptions);
    },
    /**
     * Validate params against the model's descriptors without generating.
     * Awaits the catalog load started by initModelCatalog().
     */
    async validate(model, params) {
      const loading = whenModelCatalogLoaded();
      if (!loading) {
        throw new ApiError("Model catalog not loaded \u2014 call ai.initModelCatalog() before ai.validate().", {
          status: 409,
          code: "catalog_not_loaded"
        });
      }
      await loading;
      return Model(model).validate(params);
    },
    // ── apis (direct, low-level API access) ───────────────────────────
    /** Direct, low-level access to the Picsart model APIs. See `./apis.ts`. */
    apis,
    // ── Catalogs (voices / avatars) ──────────────────────────────────
    /** Voice/avatar catalogs — fetch, ttl-cache, hydrate model params. See `./catalogs.ts`. */
    catalogs,
    // ── Drive ────────────────────────────────────────────────────────
    /** Drive operations. Only available when drive config is provided. */
    drive: driveClient ?? void 0
  };
}

// src/core/voices.ts
function getVoiceById(id) {
  return getHydratedVoices().find((v) => v.id === id);
}
function toBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function encode(data) {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  const compressed = deflateSync(bytes);
  return toBase64Url(compressed);
}
function decode(encoded) {
  const compressed = fromBase64Url(encoded);
  const bytes = inflateSync(compressed);
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

// src/core/deeplink/serialize.ts
var DEDICATED_KEYS = /* @__PURE__ */ new Set([
  "prompt",
  "negativePrompt",
  "imageUrls",
  "videoUrl",
  "audioUrl",
  "startFrame",
  "endFrame"
]);
var EXCLUDED_KEYS = /* @__PURE__ */ new Set([
  "audioFile",
  "mentionedPersonas",
  "modelId",
  "exploreImageId",
  "sourceImageId",
  "sourceImageUrl",
  "multiPrompt",
  "elementList",
  "voiceList",
  "dynamicMasks",
  "staticMask",
  "callbackUrl",
  "externalTaskId"
]);
function serializePayload(modelId, context) {
  const payload = { v: 1, m: modelId };
  if (context.prompt) payload.p = context.prompt;
  if (context.negativePrompt) payload.np = context.negativePrompt;
  if (context.imageUrls?.length) payload.i = context.imageUrls;
  if (context.videoUrl) payload.vi = context.videoUrl;
  if (context.audioUrl) payload.au = context.audioUrl;
  if (context.startFrame) payload.sf = context.startFrame;
  if (context.endFrame) payload.ef = context.endFrame;
  const model = getModel(modelId);
  const defaults = model ? extractDefaults(model.paramConfig) : {};
  const overrides = {};
  for (const [key, value] of Object.entries(context)) {
    if (DEDICATED_KEYS.has(key) || EXCLUDED_KEYS.has(key)) continue;
    if (value === void 0 || value === null) continue;
    if (key in defaults && defaults[key] === value) continue;
    overrides[key] = value;
  }
  if (Object.keys(overrides).length > 0) payload.o = overrides;
  return encode(payload);
}

// src/core/deeplink/sanitize.ts
var ALLOWED_URL_PATTERNS = [
  /^https:\/\/([a-z0-9-]+\.)*picsart\.com(\/|$)/i,
  /^https:\/\/([a-z0-9-]+\.)*pastatic\.com(\/|$)/i,
  /^https:\/\/([a-z0-9-]+\.)*cdn-picsart\.com(\/|$)/i
];
function isAllowedUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
  } catch {
    return false;
  }
  return ALLOWED_URL_PATTERNS.some((re) => re.test(url));
}
function sanitizePrompt(text) {
  return text.replace(/<\/?[^>]+(>|$)/g, "").replace(/javascript\s*:/gi, "").replace(/on\w+\s*=/gi, "");
}

// src/core/deeplink/deserialize.ts
function isValidPayload(data) {
  if (typeof data !== "object" || data === null) return false;
  const obj = data;
  return obj.v === 1 && typeof obj.m === "string" && obj.m.length > 0;
}
function filterUrls(urls, warnings) {
  const result = [];
  for (const url of urls) {
    if (typeof url !== "string") continue;
    if (isAllowedUrl(url)) {
      result.push(url);
    } else {
      warnings.push(`Rejected URL: ${url}`);
    }
  }
  return result;
}
function deserializePayload(encoded) {
  let data;
  try {
    data = decode(encoded);
  } catch {
    return null;
  }
  if (!isValidPayload(data)) return null;
  const warnings = [];
  const context = {};
  const model = getModel(data.m);
  const modelKnown = !!model;
  if (!modelKnown) {
    warnings.push(`Unknown model: ${data.m}`);
  }
  if (data.p) context.prompt = sanitizePrompt(data.p);
  if (data.np) context.negativePrompt = sanitizePrompt(data.np);
  if (data.i?.length) {
    const validImages = filterUrls(data.i, warnings);
    if (validImages.length) context.imageUrls = validImages;
  }
  if (data.vi) {
    if (isAllowedUrl(data.vi)) {
      context.videoUrl = data.vi;
    } else {
      warnings.push(`Rejected video URL: ${data.vi}`);
    }
  }
  if (data.au) {
    if (isAllowedUrl(data.au)) {
      context.audioUrl = data.au;
    } else {
      warnings.push(`Rejected audio URL: ${data.au}`);
    }
  }
  if (data.sf) {
    if (isAllowedUrl(data.sf)) {
      context.startFrame = data.sf;
    } else {
      warnings.push(`Rejected start frame URL: ${data.sf}`);
    }
  }
  if (data.ef) {
    if (isAllowedUrl(data.ef)) {
      context.endFrame = data.ef;
    } else {
      warnings.push(`Rejected end frame URL: ${data.ef}`);
    }
  }
  if (data.o && typeof data.o === "object") {
    if (model) {
      const validated = transferValues(model.paramConfig, data.o);
      Object.assign(context, validated);
    } else {
      Object.assign(context, data.o);
    }
  }
  return { modelId: data.m, context, modelKnown, warnings };
}

// src/core/deeplink/url.ts
function encodeDeepLinkPayload(modelId, context) {
  return serializePayload(modelId, context);
}
function decodeDeepLinkPayload(encoded) {
  return deserializePayload(encoded);
}

export { ApiError, ExecutionMode as ApiRunMode, DEFAULT_VISIBLE_RELEASES, GenerationEventType, Model, buildFilename, buildGenerationAttributes, catalog, createClient, decodeDeepLinkPayload, encodeDeepLinkPayload, expectedOutputFormat, findModel, getModel, getVoiceById, inferResourceType, isVisibleForReleases, parseGeneration, releaseOf, resolveExtension, toAvatarOption, toVoiceOption };

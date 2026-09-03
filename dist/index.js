import { deflateSync, inflateSync } from 'fflate';

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp(target, "default", { value: mod, enumerable: true }) ,
  mod
));

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
async function readErrorBody(res) {
  let text = "";
  try {
    text = await res.text();
  } catch {
    return { text: "" };
  }
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return { text, json: parsed };
    }
  } catch {
  }
  return { text };
}
function reasonFrom(json, status) {
  const raw = json?.reason ?? json?.code;
  return typeof raw === "string" && raw.length > 0 ? raw : codeForStatus(status);
}

// src/core/workflow.ts
var DEFAULT_POLL_INTERVAL_MS = 2e3;
var DEFAULT_MAX_ATTEMPTS = 300;
var sleepDefault = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function getNested(raw, path) {
  let current = raw;
  for (const key of path) {
    if (!current || typeof current !== "object") return void 0;
    current = current[key];
  }
  return current;
}
function pickFirst(raw, paths) {
  for (const path of paths) {
    const value = getNested(raw, path);
    if (value !== void 0) return value;
  }
  return void 0;
}
function normalizeStatus(status) {
  if (typeof status !== "string") return "UNKNOWN";
  const s = status.toUpperCase();
  if (s === "ACCEPTED") return "ACCEPTED";
  if (s === "IN_PROGRESS" || s === "PENDING" || s === "RUNNING") return "IN_PROGRESS";
  if (s === "COMPLETED" || s === "SUCCESS") return "COMPLETED";
  if (s === "FAILED" || s === "ERROR") return "FAILED";
  if (s === "CANCELED" || s === "CANCELLED") return "CANCELED";
  return "UNKNOWN";
}
function parseWorkflowStatus(handle, raw) {
  const statusRaw = pickFirst(raw, [["response", "status"], ["status"]]);
  const status = normalizeStatus(statusRaw);
  const result = pickFirst(raw, [["response", "result"], ["result"]]);
  const usageRaw = pickFirst(raw, [["response", "usage"], ["usage"]]);
  const usage = usageRaw && typeof usageRaw === "object" && (typeof usageRaw.credits === "number" || Array.isArray(usageRaw.details)) ? usageRaw : void 0;
  const errorRaw = pickFirst(raw, [["response", "error"], ["response", "message"], ["error"], ["message"], ["reason"]]);
  const reasonRaw = pickFirst(raw, [["response", "reason"], ["reason"]]);
  const statusCodeRaw = pickFirst(raw, [["response", "statusCode"], ["statusCode"]]);
  const progressRaw = pickFirst(raw, [["response", "progress"], ["progress"]]);
  const progress = progressRaw && typeof progressRaw === "object" ? {
    percent: typeof progressRaw.percent === "number" ? progressRaw.percent : void 0,
    estimatedSecondsLeft: typeof progressRaw.estimatedSecondsLeft === "number" ? progressRaw.estimatedSecondsLeft : void 0
  } : void 0;
  return {
    handle,
    status,
    result,
    error: typeof errorRaw === "string" ? errorRaw : void 0,
    reason: typeof reasonRaw === "string" ? reasonRaw : void 0,
    statusCode: typeof statusCodeRaw === "number" ? statusCodeRaw : void 0,
    progress,
    usage,
    raw
  };
}
function isTerminal(status) {
  return status === "COMPLETED" || status === "FAILED" || status === "CANCELED";
}
function createWorkflowClient(transport, options = {}) {
  const parseStatus = options.parseStatus ?? parseWorkflowStatus;
  const sleep2 = options.sleep ?? sleepDefault;
  const defaultPollIntervalMs = options.pollingIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const defaultMaxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const submit = async (request) => {
    if (!transport.submit) {
      throw new ApiError("Transport does not support submit (execute-only transport)", {
        status: 400,
        code: "unsupported_transport"
      });
    }
    return transport.submit(request);
  };
  const status = async (handle, signal) => {
    if (!transport.status) {
      throw new ApiError("Transport does not support status (execute-only transport)", {
        status: 400,
        code: "unsupported_transport"
      });
    }
    const raw = await transport.status(handle, signal);
    return parseStatus(handle, raw);
  };
  const result = async (handle, pollOptions = {}) => {
    const intervalMs = pollOptions.intervalMs ?? defaultPollIntervalMs;
    const maxAttempts = pollOptions.maxAttempts ?? defaultMaxAttempts;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (pollOptions.signal?.aborted) {
        throw new ApiError("Operation aborted", { status: 499, code: "aborted" });
      }
      const next = await status(handle, pollOptions.signal);
      if (isTerminal(next.status)) return next;
      await sleep2(intervalMs);
    }
    throw new ApiError(
      `Timed out waiting for workflow ${handle.workflow}:${handle.id}`,
      { status: 408, code: "timeout" }
    );
  };
  const run = async (request, runOptions = {}) => {
    const runMode = runOptions.mode;
    const useExecute = runMode === "sync" || runMode === void 0 && !transport.submit;
    if (useExecute) {
      const raw = await transport.execute(request);
      const syntheticHandle = { workflow: request.workflow, id: "sync" };
      const parsed = parseStatus(syntheticHandle, raw);
      return parsed.status === "UNKNOWN" ? { ...parsed, status: "COMPLETED" } : parsed;
    }
    const handle = await submit(request);
    return result(handle, runOptions);
  };
  const subscribe = async function* (handle, subscribeOptions = {}) {
    const intervalMs = subscribeOptions.intervalMs ?? defaultPollIntervalMs;
    const maxAttempts = subscribeOptions.maxAttempts ?? defaultMaxAttempts;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (subscribeOptions.signal?.aborted) {
        throw new ApiError("Operation aborted", { status: 499, code: "aborted" });
      }
      const next = await status(handle, subscribeOptions.signal);
      yield next;
      if (isTerminal(next.status)) return next;
      await sleep2(intervalMs);
    }
    throw new ApiError(
      `Timed out waiting for workflow ${handle.workflow}:${handle.id}`,
      { status: 408, code: "timeout" }
    );
  };
  return { submit, status, result, run, subscribe };
}

// src/core/descriptors/utils.ts
function extractDefaults(params2) {
  const defaults = {};
  for (const [key, entry] of Object.entries(params2)) {
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
      for (const item of items) {
        if (item == null || typeof item !== "object" || Array.isArray(item)) {
          throw new Error(`"${key}" items must be objects`);
        }
        for (const [fk, fd] of Object.entries(d.fields)) {
          validateDescriptor(`${key}.${fk}`, fd, item[fk]);
        }
      }
      break;
    }
  }
}
function validateAll(params2, input) {
  for (const [key, entry] of Object.entries(params2)) {
    validateDescriptor(key, entry.descriptor, input[key], entry.required);
  }
}
function descriptorsToSchema(params2) {
  const schema = {};
  for (const [key, entry] of Object.entries(params2)) {
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

// src/core/visibility.ts
var DEFAULT_VISIBLE_RELEASES = ["production", "general-availability"];
var releaseOf = (m) => m.release ?? "production";
function isVisibleForReleases(m, releases = DEFAULT_VISIBLE_RELEASES) {
  if (m.disabled || m.deprecated) return false;
  return releases.includes(releaseOf(m));
}

// src/core/providers.ts
var providers = {
  picsart: { color: "#FF3399", label: "PA", name: "Picsart" },
  google: { color: "#4285F4", label: "G", name: "Google" },
  kling: { color: "#8B5CF6", label: "K", name: "Kling" },
  grok: { color: "#1DA1F2", label: "X", name: "Grok" },
  openai: { color: "#10B981", label: "O", name: "OpenAI" },
  flux: { color: "#FF6B6B", label: "F", name: "Flux" },
  ideogram: { color: "#06B6D4", label: "I", name: "Ideogram" },
  elevenlabs: { color: "#2D6B4F", label: "XI", name: "ElevenLabs" },
  minimax: { color: "#FF7B54", label: "M", name: "MiniMax" },
  wan: { color: "#00BCD4", label: "W", name: "Wan" },
  seedance: { color: "#EC4899", label: "SD", name: "Seedance" },
  ltx: { color: "#6366F1", label: "LT", name: "LTX" },
  seedream: { color: "#14B8A6", label: "SR", name: "Seedream" },
  seedaudio: { color: "#7C3AED", label: "SA", name: "Seed Audio" },
  hunyuan: { color: "#F59E0B", label: "HY", name: "Hunyuan" },
  pika: { color: "#FF6B9D", label: "PK", name: "Pika" },
  runway: { color: "#00D4AA", label: "RW", name: "Runway" },
  luma: { color: "#FFB800", label: "LU", name: "Luma" },
  ovi: { color: "#9333EA", label: "OV", name: "OVI" },
  creatify: { color: "#FF3D00", label: "CR", name: "Creatify" },
  veed: { color: "#5B21B6", label: "VD", name: "VEED" },
  bytedance: { color: "#00F5D4", label: "BD", name: "ByteDance" },
  qwen: { color: "#1E40AF", label: "QW", name: "Qwen" },
  reve: { color: "#E11D48", label: "RV", name: "Reve" },
  recraft: { color: "#3B82F6", label: "RF", name: "Recraft" },
  videography: { color: "#78716C", label: "VG", name: "Videography" },
  topaz: { color: "#14B8A6", label: "TZ", name: "Topaz" },
  heygen: { color: "#5B4EFF", label: "HG", name: "HeyGen" },
  happyhorse: { color: "#FF6A00", label: "HH", name: "Happy Horse" },
  pixverse: { color: "#7C3AED", label: "PV", name: "PixVerse" },
  anthropic: { color: "#D97757", label: "CL", name: "Anthropic" },
  async: { color: "#5E5CE6", label: "AA", name: "Async AI" },
  captionsai: { color: "#1D1F20", label: "MR", name: "Mirage" },
  meta: { color: "#0081FB", label: "MT", name: "Meta" }
};

// src/core/descriptors/presets.ts
var p = {
  aspectRatio(opts = ["16:9", "9:16", "1:1"], def) {
    return {
      aspectRatio: {
        descriptor: {
          kind: "enum",
          valueType: "string",
          options: opts.map((id) => ({ id })),
          default: def ?? opts[0]
        }
      }
    };
  },
  duration(opts, def) {
    return {
      duration: {
        descriptor: {
          kind: "enum",
          valueType: "number",
          options: opts.map((id) => ({ id })),
          default: def ?? opts[0]
        }
      }
    };
  },
  /** Continuous duration (seconds) — for models whose vendor accepts every
   *  value in a span instead of a fixed option list. Reach for this only when
   *  the span holds more than 10 possible values; 10 or fewer stays an enum
   *  (`duration`), which shows the exact options instead of a slider. */
  durationRange(min, max, def, step = 1) {
    return {
      duration: {
        descriptor: { kind: "range", min, max, step, default: def }
      }
    };
  },
  resolution(opts, def) {
    return {
      resolution: {
        descriptor: {
          kind: "enum",
          valueType: "string",
          options: opts.map((id) => ({ id })),
          default: def ?? opts[0]
        }
      }
    };
  },
  count(opts = [1, 2, 4, 6, 8, 10], def) {
    return {
      count: {
        descriptor: {
          kind: "enum",
          valueType: "number",
          options: opts.map((id) => ({ id })),
          default: def ?? opts[0]
        }
      }
    };
  },
  quality(opts, def) {
    return {
      quality: {
        descriptor: {
          kind: "enum",
          valueType: "string",
          options: opts.map((id) => ({ id })),
          default: def ?? opts[0]
        }
      }
    };
  },
  size(opts, def) {
    return {
      size: {
        descriptor: {
          kind: "enum",
          valueType: "string",
          options: opts.map((id) => ({ id })),
          default: def ?? opts[0]
        }
      }
    };
  },
  style(opts, def) {
    return {
      style: {
        descriptor: {
          kind: "enum",
          valueType: "string",
          options: opts,
          default: def ?? opts[0].id
        }
      }
    };
  },
  renderingSpeed(opts, def) {
    return {
      renderingSpeed: {
        descriptor: {
          kind: "enum",
          valueType: "string",
          options: opts,
          default: def ?? opts[0].id
        }
      }
    };
  },
  generateAudio(def = true) {
    return {
      generateAudio: {
        descriptor: { kind: "boolean", default: def }
      }
    };
  },
  returnLastFrame(def = false) {
    return {
      returnLastFrame: {
        label: "Capture Last Frame",
        descriptor: { kind: "boolean", default: def }
      }
    };
  },
  /** HappyHorse video-edit `audio_setting`: 'auto' lets the model decide,
   *  'origin' preserves the source video's audio. Vendor default: 'auto'. */
  audioSetting(opts = ["auto", "origin"], def = "auto") {
    return {
      audioSetting: {
        label: "Audio",
        descriptor: {
          kind: "enum",
          valueType: "string",
          options: opts.map((id) => ({ id })),
          default: def
        }
      }
    };
  },
  enhancePrompt(def = true) {
    return {
      enhancePrompt: {
        descriptor: { kind: "boolean", default: def }
      }
    };
  },
  prompt(opts) {
    return {
      prompt: {
        label: "Prompt",
        required: opts?.required ?? true,
        descriptor: { kind: "text", minLength: opts?.minLength, maxLength: opts?.maxLength, placeholder: opts?.placeholder }
      }
    };
  },
  negativePrompt(placeholder, maxLength) {
    return {
      negativePrompt: {
        label: "Negative Prompt",
        descriptor: {
          kind: "text",
          placeholder,
          maxLength
        }
      }
    };
  },
  /** Generation seed — optional, no default: sent only when the user sets it,
   *  so the vendor's own randomization applies otherwise. */
  seed(max = 2147483647) {
    return {
      seed: {
        label: "Seed",
        descriptor: { kind: "range", min: 0, max, step: 1 }
      }
    };
  },
  cfgScale(min, max, def, step) {
    return {
      cfgScale: {
        label: "CFG Scale",
        descriptor: { kind: "range", min, max, step, default: def }
      }
    };
  },
  imageWeight(min, max, def, step) {
    return {
      imageWeight: {
        label: "Image Weight",
        descriptor: { kind: "range", min, max, step, default: def }
      }
    };
  },
  // ── Generic factories (take key as first arg) ───────────────────
  file(key, accept, opts) {
    return {
      [key]: {
        label: opts?.label,
        required: opts?.required,
        ...opts?.category ? { category: opts.category } : {},
        descriptor: {
          kind: "file",
          accept,
          ...opts?.array ? { array: opts.array } : {},
          ...opts?.maxDurationSec != null ? { maxDurationSec: opts.maxDurationSec } : {},
          ...opts?.minPixels != null ? { minPixels: opts.minPixels } : {},
          ...opts?.minSidePixels != null ? { minSidePixels: opts.minSidePixels } : {},
          ...opts?.maxShortSidePixels != null ? { maxShortSidePixels: opts.maxShortSidePixels } : {},
          ...opts?.maxBytes != null ? { maxBytes: opts.maxBytes } : {}
        }
      }
    };
  },
  boolean(key, def, label) {
    return {
      [key]: {
        label,
        descriptor: { kind: "boolean", default: def }
      }
    };
  },
  /** Generic enum select. Options are bare ids (`['png', 'jpeg']`) or
   *  `{ id, label }` pairs when the UI label differs from the wire value.
   *  `valueType` is inferred from the first option (string vs number). */
  enum(key, options, def, opts) {
    const normalized = options.map(
      (opt) => typeof opt === "object" ? opt : { id: opt }
    );
    const descriptor = {
      kind: "enum",
      valueType: typeof normalized[0].id === "number" ? "number" : "string",
      options: normalized,
      default: def ?? normalized[0].id
    };
    return {
      [key]: {
        label: opts?.label,
        // T resolves to a single string|number at each call site; the cast lets
        // the one generic factory satisfy the EnumDescriptor<string>|<number> union.
        descriptor
      }
    };
  },
  range(key, min, max, def, opts) {
    return {
      [key]: {
        label: opts?.label,
        descriptor: {
          kind: "range",
          min,
          max,
          step: opts?.step,
          default: def
        }
      }
    };
  },
  text(key, opts) {
    return {
      [key]: {
        label: opts?.label,
        required: opts?.required,
        descriptor: {
          kind: "text",
          maxLength: opts?.maxLength,
          placeholder: opts?.placeholder
        }
      }
    };
  },
  /**
   * Any param whose options are served by a platform catalog task (effect
   * templates, and anything the voiceId/videoId presets don't cover). The
   * value is a free-string id — the live catalog is the source of truth.
   */
  catalog(key, cfg) {
    return {
      [key]: {
        label: cfg.label,
        required: cfg.required,
        descriptor: { kind: "catalog", source: cfg.source, default: cfg.default }
      }
    };
  },
  voiceId(options, def, opts) {
    return {
      voiceId: {
        label: "Voice",
        required: opts?.required,
        catalogOptions: options,
        // Catalog-bound ids are free strings (the live catalog is the source
        // of truth); only unbound voice lists stay closed enums.
        descriptor: opts?.catalog ? { kind: "catalog", source: opts.catalog, default: def } : {
          kind: "enum",
          valueType: "string",
          options: options.map((o) => ({ id: o.id, label: o.name ?? o.id })),
          default: def
        }
      }
    };
  },
  videoId(options, def, opts) {
    return {
      videoId: {
        label: "Avatar",
        required: opts?.required,
        catalogOptions: options,
        descriptor: opts?.catalog ? { kind: "catalog", source: opts.catalog, default: def } : {
          kind: "enum",
          valueType: "string",
          options: options.map((o) => ({ id: o.id, label: o.name ?? o.id })),
          default: def
        }
      }
    };
  },
  language(hasAccent) {
    return {
      language: {
        label: "Language",
        descriptor: { kind: "text" }
      },
      ...hasAccent ? {
        accent: {
          label: "Accent",
          descriptor: { kind: "text" }
        }
      } : {}
    };
  }
};

// src/vendors/presets.ts
var videoStartEndWithAudio = ({
  aspectRatios = ["16:9", "9:16", "1:1"],
  durations = [5, 10],
  defaultDuration,
  includeNegativePrompt = true,
  includeGenerateAudio = true,
  includeEndFrame = true
} = {}) => ({
  ...p.aspectRatio(aspectRatios),
  ...p.duration(durations, defaultDuration),
  ...p.file("startFrame", "image", { label: "Start Frame", required: false }),
  ...includeEndFrame ? p.file("endFrame", "image", { label: "End Frame" }) : {},
  ...includeNegativePrompt ? p.negativePrompt() : {},
  ...includeGenerateAudio ? p.generateAudio() : {}
});

// src/vendors/define.ts
var passthroughPayload = (paramConfig) => (ctx) => {
  const defaults = extractDefaults(paramConfig);
  const payload = {};
  for (const key of Object.keys(paramConfig)) {
    const val = ctx[key];
    if (val != null) {
      payload[key] = val;
    } else if (key in defaults) {
      payload[key] = defaults[key];
    }
  }
  return payload;
};
function defineModels(provider, configs) {
  const MODELS39 = [];
  for (const c of configs) {
    const prov = c.provider ?? provider;
    const resolvedPayload = c.buildPayload ?? passthroughPayload(c.paramConfig);
    const meta = providers[prov] ?? { color: "#666", label: "?", name: String(prov) };
    const model = {
      id: c.id,
      name: c.name,
      providerName: meta.name,
      providerColor: meta.color,
      providerLabel: meta.label,
      provider: prov,
      workflow: c.workflow,
      buildPayload: resolvedPayload,
      mode: c.mode,
      inputType: c.inputType,
      description: c.description,
      features: c.features,
      paramConfig: c.paramConfig
    };
    if (c.editWorkflow !== void 0) model.editWorkflow = c.editWorkflow;
    if (c.syncExecute !== void 0) model.syncExecute = c.syncExecute;
    if (c.buildEditPayload !== void 0) model.buildEditPayload = c.buildEditPayload;
    if (c.estimatedTime !== void 0) model.estimatedTime = c.estimatedTime;
    if (c.editEstimatedTime !== void 0) model.editEstimatedTime = c.editEstimatedTime;
    if (c.testTimeout !== void 0) model.testTimeout = c.testTimeout;
    if (c.pollOptions !== void 0) model.pollOptions = c.pollOptions;
    if (c.badge !== void 0) model.badge = c.badge;
    if (c.addedAt !== void 0) model.addedAt = c.addedAt;
    if (c.disabled !== void 0) model.disabled = c.disabled;
    if (c.deprecated !== void 0) model.deprecated = c.deprecated;
    if (c.release !== void 0) model.release = c.release;
    if (c.modelId !== void 0) model.modelId = c.modelId;
    if (c.constraints !== void 0) model.constraints = c.constraints;
    const contract = createModelContract(model);
    model.outputSchema = c.outputSchema ?? contract.output;
    MODELS39.push(model);
  }
  return { MODELS: MODELS39 };
}
function registerPayloads(MODELS39, payloads) {
  for (const [id, builder] of Object.entries(payloads)) {
    const model = MODELS39.find((m) => m.id === id);
    if (model) model.buildPayload = builder;
  }
}
function registerEditPayloads(MODELS39, payloads) {
  for (const [id, builder] of Object.entries(payloads)) {
    const model = MODELS39.find((m) => m.id === id);
    if (model) model.buildEditPayload = builder;
  }
}
var params = {
  prompt: p.prompt,
  aspectRatio: p.aspectRatio,
  duration: p.duration,
  durationRange: p.durationRange,
  count: p.count,
  resolution: p.resolution,
  negativePrompt: p.negativePrompt,
  seed: p.seed,
  generateAudio: p.generateAudio,
  returnLastFrame: p.returnLastFrame,
  audioSetting: p.audioSetting,
  enhancePrompt: p.enhancePrompt,
  cfgScale: p.cfgScale,
  imageWeight: p.imageWeight,
  style: p.style,
  renderingSpeed: p.renderingSpeed,
  voiceId: p.voiceId,
  videoId: p.videoId,
  catalog: p.catalog,
  language: p.language,
  // File presets — key matches the runtime GenerationContext field name.
  // `category` defaults to the most common role for the slot (overridable per call):
  //   asset    → start/end frame, sync audio (direct inputs to the output)
  //   reference → ref images/videos/audios (guidance signals)
  /** Array of image inputs (writes to `imageUrls`). `bounds` carries the
   *  client-side dimension floors enforced at upload: `minPixels` for a vendor
   *  rule stated as a total pixel count, `minSidePixels` for one stated per
   *  side (width and height each), which is what most vendors publish. */
  imageInput: (max = 1, label = "Start Image", required = false, category = "reference", bounds) => p.file("imageUrls", "image", {
    array: { max },
    label,
    required,
    category,
    ...bounds?.minPixels != null ? { minPixels: bounds.minPixels } : {},
    ...bounds?.minSidePixels != null ? { minSidePixels: bounds.minSidePixels } : {}
  }),
  /** Single source-video slot (v2v / video edit). Writes to `videoUrl`.
   *  `maxDurationSec` caps the source clip length, `maxShortSidePixels` caps
   *  the shorter side (upscaler sources) and `maxBytes` caps the file size,
   *  all enforced client-side at upload. */
  videoInput: (label = "Source Video", category = "reference", required = true, maxDurationSec, maxShortSidePixels, maxBytes) => p.file("videoUrl", "video", {
    label,
    required,
    category,
    ...maxDurationSec != null ? { maxDurationSec } : {},
    ...maxShortSidePixels != null ? { maxShortSidePixels } : {},
    ...maxBytes != null ? { maxBytes } : {}
  }),
  /** Single driving / sync-audio slot. Writes to `audioUrl`. */
  audioInput: (label = "Audio Track", required = false, category = "asset") => p.file("audioUrl", "audio", { label, required, category }),
  /** Array of reference videos (writes to `videoUrls`). Backend enforces
   *  per-model total-duration caps (e.g. ≤ 15s for seedance). `bounds` carries
   *  the client-side checks run at upload: `minPixels` for a total-pixel floor,
   *  `minSidePixels` for a per-side one, `maxBytes` for each clip's file size. */
  videoInputs: (max = 3, label = "Reference Videos", required = false, bounds) => p.file("videoUrls", "video", {
    array: { max },
    label,
    required,
    category: "reference",
    ...bounds?.minPixels != null ? { minPixels: bounds.minPixels } : {},
    ...bounds?.minSidePixels != null ? { minSidePixels: bounds.minSidePixels } : {},
    ...bounds?.maxBytes != null ? { maxBytes: bounds.maxBytes } : {}
  }),
  /** Array of reference audios (writes to `audioUrls`). Backend enforces
   *  per-model total-duration caps. */
  audioInputs: (max = 3, label = "Reference Audios", required = false) => p.file("audioUrls", "audio", { array: { max }, label, required, category: "reference" }),
  startFrame: (label = "Start Frame", required = false) => p.file("startFrame", "image", { label, required, category: "asset" }),
  endFrame: (label = "End Frame") => p.file("endFrame", "image", { label, category: "asset" })
};
var paramPresets = {
  videoStartEndWithAudio
};
var feat = (label, variant) => ({ label, variant });

// src/vendors/catalog/kling/params.ts
var klingCharacterOrientation = {
  characterOrientation: {
    label: "Character Orientation",
    descriptor: {
      kind: "enum",
      valueType: "string",
      options: [
        { id: "image", label: "Match Image (\u226410s ref video)" },
        { id: "video", label: "Match Video (\u226430s ref video)" }
      ],
      default: "video"
    }
  }
};
var klingKeepOriginalSound = {
  keepOriginalSound: {
    label: "Keep Original Sound",
    descriptor: {
      kind: "enum",
      valueType: "string",
      options: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }],
      default: "yes"
    }
  }
};
var klingOmniReferType = {
  referType: {
    label: "Reference Video Mode",
    descriptor: {
      kind: "enum",
      valueType: "string",
      options: [
        { id: "feature", label: "Feature Reference" },
        { id: "base", label: "Base Edit" }
      ],
      default: "feature"
    }
  }
};
var klingV3AdvancedParams = {
  multiShot: {
    label: "Multi-Shot Mode",
    descriptor: { kind: "boolean", default: false }
  },
  shotType: {
    label: "Shot Segmentation",
    descriptor: {
      kind: "enum",
      valueType: "string",
      options: [
        { id: "customize", label: "Customize" },
        { id: "intelligence", label: "AI Auto" }
      ],
      default: "customize"
    }
  },
  multiPrompt: {
    label: "Multi-Shot Prompts",
    descriptor: {
      kind: "object",
      array: { max: 6 },
      fields: {
        // index/prompt/duration stay required — upstream MultiPromptItem
        // marks all three required. SDK descriptor default for `index` is
        // informational only until upstream relaxes the wire contract.
        index: { kind: "range", min: 0, max: 5, default: 0 },
        prompt: { kind: "text", maxLength: 512 },
        duration: { kind: "text" }
      }
    }
  },
  voiceList: {
    label: "Voice References",
    descriptor: {
      kind: "object",
      array: { max: 2 },
      fields: {
        voice_id: { kind: "text" }
      }
    }
  },
  elementList: {
    label: "Element References",
    descriptor: {
      kind: "object",
      array: { max: 3 },
      fields: {
        element_id: { kind: "text" }
      }
    }
  }
};
var klingOmniAdvancedParams = {
  multiShot: {
    label: "Multi-Shot Mode",
    descriptor: { kind: "boolean", default: false }
  },
  shotType: {
    label: "Shot Segmentation",
    descriptor: {
      kind: "enum",
      valueType: "string",
      options: [{ id: "customize", label: "Customize" }],
      default: "customize"
    }
  },
  multiPrompt: {
    label: "Multi-Shot Prompts",
    descriptor: {
      kind: "object",
      array: { max: 6 },
      fields: {
        // index/prompt/duration stay required — upstream MultiPromptItem
        // marks all three required. SDK descriptor default for `index` is
        // informational only until upstream relaxes the wire contract.
        index: { kind: "range", min: 0, max: 5, default: 0 },
        prompt: { kind: "text", maxLength: 512 },
        duration: { kind: "text" }
      }
    }
  },
  elementList: {
    label: "Element References",
    descriptor: {
      kind: "object",
      array: { max: 3 },
      fields: {
        element_id: { kind: "text" }
      }
    }
  }
};

// src/vendors/catalog/kling/index.ts
var KLING_DUAL_IMAGE_EFFECTS = /* @__PURE__ */ new Set([
  "pet_skateboard",
  "daily_ootd",
  "toss_run",
  "switch_to_silk",
  "studio_look",
  "french_elegance",
  "finger_swipe",
  "smooth_transition",
  "kiss_pro",
  "snow_night_kiss",
  "eternal_kiss",
  "cheers_2026",
  "fight_pro",
  "hug_pro",
  "heart_gesture_pro"
]);
var V3_DURATIONS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
var V26_DURATIONS = [5, 10];
var KLING_IMAGE_AR = ["16:9", "9:16", "1:1", "21:9", "4:3", "3:2", "2:3", "3:4"];
var klingV3ProVideoBase = {
  workflow: "kling-text-to-video",
  editWorkflow: "kling-image-to-video",
  mode: "video",
  inputType: "t2v",
  features: [
    feat("Image Input", "input"),
    feat("Start/End Frame", "frame"),
    feat("Audio", "audio"),
    feat("1080p", "resolution"),
    feat("15 sec", "duration")
  ],
  paramConfig: {
    ...params.prompt({ maxLength: 2500 }),
    ...paramPresets.videoStartEndWithAudio({
      durations: V3_DURATIONS,
      defaultDuration: 5
    }),
    ...klingV3AdvancedParams,
    ...params.renderingSpeed([{ id: "std", label: "Standard" }, { id: "pro", label: "Pro" }, { id: "4k", label: "4K" }], "4k")
  }
};
var klingV3TurboVideoBase = {
  workflow: "kling-text-to-video",
  editWorkflow: "kling-image-to-video",
  mode: "video",
  inputType: "t2v",
  features: [
    feat("Image Input", "input"),
    feat("1080p", "resolution"),
    feat("15 sec", "duration")
  ],
  paramConfig: {
    ...params.prompt({ maxLength: 2500 }),
    ...params.aspectRatio(["16:9", "9:16", "1:1"]),
    ...params.duration(V3_DURATIONS, 5),
    ...params.negativePrompt(),
    ...params.resolution(["720p", "1080p"], "720p"),
    ...params.startFrame("Start Frame")
  }
};
var klingV26VideoBase = {
  ...klingV3ProVideoBase,
  features: [
    feat("Image Input", "input"),
    feat("Start/End Frame", "frame"),
    feat("Audio", "audio"),
    feat("1080p", "resolution"),
    feat("5/10 sec", "duration")
  ],
  paramConfig: {
    ...params.prompt({ maxLength: 2500 }),
    ...paramPresets.videoStartEndWithAudio({
      durations: V26_DURATIONS,
      defaultDuration: 5
    })
  }
};
var { MODELS } = defineModels("kling", [
  // ── Video: Kling V3 (consolidated: std/pro/4k via renderingSpeed) ──
  {
    ...klingV3ProVideoBase,
    id: "kling-v3",
    name: "Kling V3",
    modelId: "kling-v3",
    addedAt: "2026-02-06",
    estimatedTime: 55,
    editEstimatedTime: 55,
    badge: ["popular", "premium"],
    description: "Long-form video up to 15s with native audio and start/end frame control.",
    constraints: [
      // Backend: `voice_list` requires `sound=on`. Two rules because the
      // `is` operator does not match an unset value (see core/constraints.ts).
      { when: { generateAudio: { is: false } }, then: { voiceList: { disabled: true, reason: "Voice references require generated audio." } } },
      { when: { generateAudio: { exists: false } }, then: { voiceList: { disabled: true, reason: "Voice references require generated audio." } } },
      // Vendor: first/end frames are unsupported in multi-shot mode.
      { when: { multiShot: { is: true } }, then: {
        startFrame: { disabled: true, reason: "Frames are unavailable in multi-shot mode." },
        endFrame: { disabled: true, reason: "Frames are unavailable in multi-shot mode." }
      } }
    ]
  },
  // ── Video: Kling V3 Turbo (resolution-tiered T2V + I2V) ───────────
  {
    ...klingV3TurboVideoBase,
    id: "kling-v3-turbo",
    name: "Kling V3 Turbo",
    modelId: "kling-v3-turbo",
    addedAt: "2026-06-18",
    estimatedTime: 55,
    editEstimatedTime: 55,
    badge: ["new"],
    description: "Faster V3 variant \u2014 long-form video up to 15s with native audio, start/end frame control, and 720p/1080p output."
  },
  // ── Video: Kling V2.6 (consolidated: std/pro via renderingSpeed) ──
  {
    ...klingV26VideoBase,
    id: "kling-v2-6",
    name: "Kling V2.6",
    modelId: "kling-v2-6",
    addedAt: "2026-02-11",
    estimatedTime: 60,
    description: "Mature pipeline with audio and pro-tier rendering."
  },
  // ── Video: Kling Omni ─────────────────────────────────────────────
  {
    id: "kling-v3-omni",
    name: "Kling V3 Omni",
    modelId: "kling-v3-omni",
    addedAt: "2026-02-06",
    workflow: "kling-omni-video",
    estimatedTime: 55,
    mode: "video",
    inputType: "t2v",
    description: "Flexible generation across creative styles using V3 Omni architecture, with optional 4K output.",
    features: [feat("Image + Video Input", "input"), feat("4K", "resolution"), feat("15 sec", "duration")],
    // The omni task accepts reference media on the SAME workflow (no
    // editWorkflow): `image_list` carries the optional first/end frames plus
    // plain reference images, `video_list` carries a single reference clip.
    // They are declared here as real file slots so `hasFileInput()` sees them
    // and the app renders upload targets; payloads.ts assembles the arrays.
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(["16:9", "9:16", "1:1"]),
      ...params.duration(V3_DURATIONS, 5),
      // Quality tier maps straight to the wire `mode`: 720p→std, 1080p→pro, 4k→4k.
      ...params.resolution(["720p", "1080p", "4k"], "720p"),
      ...params.generateAudio(false),
      ...params.startFrame("First Frame"),
      ...params.endFrame("End Frame"),
      // Vendor cap: reference images + frames + multi-image elements ≤ 7
      // (4 when a reference video is supplied).
      ...params.imageInput(7, "Reference Images"),
      ...params.videoInput("Reference Video", "reference", false),
      ...klingOmniReferType,
      ...klingKeepOriginalSound,
      ...klingOmniAdvancedParams
    },
    constraints: [
      // KlingMode: `4k` is incompatible with video_list; the worker also drops
      // generated sound whenever a reference clip is supplied.
      { when: { videoUrl: { exists: true } }, then: {
        resolution: { allowed: ["720p", "1080p"], reason: "4K output is unavailable with a reference video." },
        generateAudio: { disabled: true, reason: "Kling disables generated sound when a reference video is supplied." }
      } },
      // Vendor: an end frame requires a first frame.
      { when: { startFrame: { exists: false } }, then: { endFrame: { disabled: true, reason: "End frame requires a first frame." } } },
      // Vendor: base-video editing cannot be combined with frames or multi-shot.
      { when: { referType: { is: "base" }, videoUrl: { exists: true } }, then: {
        startFrame: { disabled: true, reason: "Base video editing cannot be combined with frames." },
        endFrame: { disabled: true, reason: "Base video editing cannot be combined with frames." },
        multiShot: { disabled: true, reason: "Base video editing does not support multi-shot." },
        multiPrompt: { disabled: true, reason: "Base video editing does not support multi-shot." }
      } }
    ]
  },
  {
    id: "kling-video-o1",
    name: "Kling Video O1",
    modelId: "kling-video-o1",
    addedAt: "2026-03-11",
    workflow: "kling-omni-video",
    estimatedTime: 55,
    mode: "video",
    inputType: "t2v",
    badge: ["new"],
    description: "O1-architecture video generation with 5 or 10 second output.",
    features: [feat("1080p", "resolution"), feat("10 sec", "duration")],
    // O1 shares the `kling-omni-video` workflow with kling-v3-omni but the
    // backend rejects `multi_shot`, `shot_type`, `multi_prompt`, and the
    // *list / element_list payloads for non-v3-omni models. Declaring those
    // descriptors here would cause `buildDefaultContext` to leak default
    // values into every payload and break OPTIONS pre-flight. Keep the
    // surface minimal until Kling extends omni-only support to O1.
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(["16:9", "9:16", "1:1"]),
      ...params.duration([5, 10], 5),
      ...params.renderingSpeed([{ id: "std", label: "Standard" }, { id: "pro", label: "Pro" }], "std"),
      ...params.generateAudio(false)
    }
  },
  // ── Video: Motion Control ─────────────────────────────────────────
  {
    id: "kling-motion-control-v3",
    name: "Kling Motion Control V3",
    addedAt: "2026-02-14",
    workflow: "kling-motion-control",
    estimatedTime: 280,
    mode: "video",
    inputType: "i2v",
    badge: ["popular"],
    description: "Map body movement from a video clip onto a portrait photo \u2014 V3 quality.",
    features: [feat("Image + Video", "input"), feat("Motion Transfer", "characteristic"), feat("V3", "resolution")],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 2500 }),
      ...params.renderingSpeed([{ id: "std", label: "Standard" }, { id: "pro", label: "Pro" }], "std"),
      ...klingCharacterOrientation,
      ...klingKeepOriginalSound,
      ...params.imageInput(1, "Person Photo (upper body)", true),
      ...params.videoInput("Motion Reference Video")
    }
  },
  {
    id: "kling-motion-control",
    name: "Kling Motion Control 2.6",
    addedAt: "2026-02-10",
    workflow: "kling-motion-control",
    estimatedTime: 300,
    mode: "video",
    inputType: "i2v",
    badge: ["popular"],
    description: "Transfer body movement from a reference video onto a portrait photo.",
    features: [feat("Image + Video", "input"), feat("Motion Transfer", "characteristic"), feat("2.6", "resolution")],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 2500 }),
      ...params.renderingSpeed([{ id: "std", label: "Standard" }, { id: "pro", label: "Pro" }], "std"),
      ...klingCharacterOrientation,
      ...klingKeepOriginalSound,
      ...params.imageInput(1, "Person Photo (upper body)", true),
      ...params.videoInput("Motion Reference Video")
    }
  },
  // ── Video: Avatar ─────────────────────────────────────────────────
  {
    id: "kling-avatar",
    name: "Kling Avatar",
    addedAt: "2026-02-10",
    workflow: "kling-avatar",
    estimatedTime: 306,
    mode: "video",
    inputType: "i2v",
    description: "Lip-synced talking head from a portrait and speech audio.",
    features: [feat("Image + Audio", "input"), feat("Talking Head", "characteristic")],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 2500 }),
      ...params.renderingSpeed([{ id: "std", label: "Standard" }, { id: "pro", label: "Pro" }], "std"),
      ...params.imageInput(1, "Face Portrait", true),
      // Vendor: exactly ONE of sound_file / audio_id. The UI path keeps the
      // audio file required; audio_id stays an additive alternative for raw
      // API callers. The builder never emits both keys (file wins) and the
      // worker enforces the XOR for un-typed callers.
      ...params.audioInput("Speech Audio", true),
      audioId: {
        label: "TTS Audio ID",
        descriptor: { kind: "text", placeholder: "audio_id from Kling TTS API" }
      }
    }
  },
  // ── Image: Omni Image (V3 + O1) ──────────────────────────────────
  {
    id: "kling-3.0-image",
    name: "Kling 3.0 Image",
    modelId: "kling-v3-omni",
    addedAt: "2026-03-01",
    workflow: "kling/v1/images/omni-image",
    estimatedTime: 20,
    mode: "image",
    inputType: "t2i",
    description: "Cinematic visuals with up to 4K resolution and 10 reference images.",
    features: [feat("Multi-Image Input", "input"), feat("4K", "resolution")],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR),
      ...params.resolution(["1k", "2k", "4k"], "1k"),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.imageInput(10, "Reference Images")
    }
  },
  {
    id: "kling-o1-image",
    name: "Kling O1 Image",
    modelId: "kling-image-o1",
    addedAt: "2026-03-01",
    workflow: "kling/v1/images/omni-image",
    estimatedTime: 20,
    mode: "image",
    inputType: "t2i",
    description: "O1-architecture image generation with multi-reference support.",
    features: [feat("Multi-Image Input", "input")],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR),
      ...params.resolution(["1k", "2k"], "1k"),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.imageInput(10, "Reference Images")
    }
  },
  // ── Image: Generations ──────────────────────────────────────────
  {
    id: "kling-v2-1-image",
    name: "Kling V2.1 Image",
    modelId: "kling-v2-1",
    addedAt: "2026-03-25",
    deprecated: true,
    // superseded by kling-v3-omni / kling-v3-pro
    workflow: "kling/v1/images/generations",
    estimatedTime: 15,
    mode: "image",
    inputType: "t2i",
    description: "V2.1 image generation with improved fidelity and restyle support.",
    features: [feat("Image Input", "input"), feat("Negative Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.negativePrompt(),
      ...params.imageInput(1, "Restyle Image")
    },
    constraints: [
      // Vendor: negative prompts are not supported in image-to-image mode.
      { when: { imageUrls: { exists: true } }, then: { negativePrompt: { disabled: true, reason: "Negative prompt is ignored in image-to-image mode." } } }
    ]
  },
  // ── Image: Multi-Image-to-Image ─────────────────────────────────
  {
    id: "kling-multi-image-v2-1",
    name: "Kling Multi-Image V2.1",
    modelId: "kling-v2-1-multi",
    addedAt: "2026-03-25",
    deprecated: true,
    // V2.1 is 2 generations behind v3
    workflow: "kling/v1/images/multi-image-to-image",
    estimatedTime: 20,
    mode: "image",
    inputType: "i2i",
    description: "V2.1 multi-image composition with improved subject blending.",
    features: [feat("Multi-Image Input", "input")],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR, "16:9"),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.imageInput(4, "Subject Images", true),
      sceneImage: {
        label: "Scene Reference",
        category: "reference",
        descriptor: { kind: "file", accept: "image" }
      },
      styleImage: {
        label: "Style Reference",
        category: "reference",
        descriptor: { kind: "file", accept: "image" }
      }
    }
  },
  // ── Elements (factory — registers reusable element_id) ───────────
  {
    id: "kling-elements",
    name: "Kling Elements",
    addedAt: "2026-05-11",
    disabled: true,
    // pending backend toolId + pricing confirmation
    workflow: "kling-elements",
    estimatedTime: 30,
    mode: "image",
    inputType: "i2i",
    description: "Save a character or scene to reuse across Kling models.",
    features: [feat("Multi-Image / Video Reference", "input"), feat("Element Factory", "characteristic")],
    paramConfig: {
      elementName: {
        label: "Element Name",
        required: true,
        descriptor: { kind: "text", maxLength: 20 }
      },
      elementDescription: {
        label: "Element Description",
        required: true,
        descriptor: { kind: "text", maxLength: 100 }
      },
      referenceType: {
        label: "Reference Type",
        required: true,
        descriptor: {
          kind: "enum",
          valueType: "string",
          options: [
            { id: "image_refer", label: "Image Reference" },
            { id: "video_refer", label: "Video Reference" }
          ],
          default: "image_refer"
        }
      },
      // Vendor: image_refer requires a frontal image + 1-3 extra angles
      // (min 2 uploads total — the builder enforces the minimum).
      ...params.imageInput(4, "Reference Images (1st = frontal, plus 1-3 angles)", false),
      ...params.videoInput("Reference Video", "reference", false),
      elementVoiceId: {
        label: "Voice ID (character/humanoid elements)",
        descriptor: { kind: "text" }
      }
    },
    constraints: [
      { when: { referenceType: { is: "video_refer" } }, then: { imageUrls: { disabled: true, reason: "Video reference uses the reference video, not images." } } },
      { when: { referenceType: { is: "image_refer" } }, then: { videoUrl: { disabled: true, reason: "Image reference uses reference images, not a video." } } },
      { when: { referenceType: { exists: false } }, then: { videoUrl: { disabled: true, reason: "Image reference uses reference images, not a video." } } }
    ]
  },
  {
    id: "kling-video-effects",
    name: "Kling Video Effects",
    addedAt: "2026-05-13",
    workflow: "kling/v1/video-effects",
    estimatedTime: 30,
    mode: "video",
    inputType: "i2v",
    badge: ["new"],
    description: "Apply curated Kling visual effects to photos \u2014 single or dual-image scenes.",
    features: [feat("Image Input", "input"), feat("Video Effects", "characteristic")],
    paramConfig: {
      ...params.catalog("templateId", {
        label: "Effect",
        source: { workflow: "kling/v1/catalog/templates" },
        default: "korean_baseball"
      }),
      // Vendor: ≥300px per side (10MB / aspect-ratio checks stay vendor-side).
      ...params.imageInput(2, "Effect Images", true, "reference", { minSidePixels: 300 })
    }
  },
  // ── Audio ─────────────────────────────────────────────────────────
  {
    id: "kling-t2a",
    name: "Kling T2A",
    addedAt: "2026-02-06",
    workflow: "kling-text-to-audio",
    estimatedTime: 28,
    mode: "audio",
    inputType: "t2a",
    description: "Text-to-audio clips of 3\u201310 seconds from a prompt description.",
    features: [feat("Text-to-Audio", "characteristic")],
    // Boundary probe (round 2, 2026-05-10) confirmed backend accepts decimal
    // duration in [3.0, 10.0]. Range descriptor (step 0.5) replaces the old
    // [5, 10] integer enum.
    paramConfig: { ...params.prompt({ maxLength: 2500 }), duration: { label: "Duration (s)", descriptor: { kind: "range", min: 3, max: 10, step: 0.5, default: 5 } } }
  },
  {
    id: "kling-v2a",
    name: "Kling V2A",
    addedAt: "2026-02-06",
    workflow: "kling-video-to-audio",
    estimatedTime: 28,
    mode: "audio",
    inputType: "v2a",
    description: "Extract or generate a matching audio track from an uploaded video.",
    features: [feat("Video Input", "input")],
    paramConfig: {
      // Vendor: .mp4/.mov only, ≤100MB, 3.0-20.0s — duration and size are
      // enforced at upload; the 3s floor and container check stay vendor-side.
      ...params.videoInput("Source Video (3-20s, \u2264100MB)", "reference", true, 20, void 0, 100 * 1024 * 1024)
    }
  }
]);

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
var keyOf = (s) => `${s.workflow} ${s.modelId ?? ""}`;
var OPTION_ADAPTERS = {
  voiceId: toVoiceOption,
  videoId: toAvatarOption
};
function installHydratedCatalog(source, paramKey, items, provider, version) {
  const adapt = OPTION_ADAPTERS[paramKey];
  registry.set(keyOf(source), {
    paramKey,
    items,
    options: items.map((i) => ({ id: i.id, label: i.name })),
    catalogOptions: adapt ? items.map((i) => adapt(i, provider)) : items,
    version
  });
}
function getHydratedCatalog(source) {
  return registry.get(keyOf(source));
}
function getHydratedVoices() {
  const out = [];
  for (const c of registry.values()) {
    if (c.paramKey === "voiceId") out.push(...c.catalogOptions);
  }
  return out;
}

// src/vendors/catalog/kling/payloads.ts
function assertMultiPrompt(multiPrompt, totalDuration, model) {
  if (!multiPrompt?.length || multiPrompt.length > 6) {
    throw new ApiError(`${model}: multi-shot mode requires 1-6 storyboard entries in multiPrompt.`, { status: 400, code: "validation_error" });
  }
  const durations = multiPrompt.map((s) => Number(s.duration));
  if (durations.some((d) => !Number.isFinite(d) || d < 1 || d > totalDuration)) {
    throw new ApiError(`${model}: each storyboard duration must be between 1 and the total duration (${totalDuration}s).`, { status: 400, code: "validation_error" });
  }
  const sum = durations.reduce((a, b) => a + b, 0);
  if (sum !== totalDuration) {
    throw new ApiError(`${model}: storyboard durations must add up to the total duration (${sum}s \u2260 ${totalDuration}s).`, { status: 400, code: "validation_error" });
  }
}
var buildKlingV3Payload = (defaultMode = "std") => (input) => {
  const hasEndFrame = !!(input.startFrame && input.endFrame);
  const hasSound = !!input.generateAudio;
  const mode = input.renderingSpeed ?? defaultMode;
  const totalDuration = input.duration ?? 5;
  if (input.multiShot && (input.shotType ?? "customize") !== "intelligence") {
    assertMultiPrompt(input.multiPrompt, totalDuration, "Kling V3");
  }
  const voiceList = hasSound && input.startFrame ? input.voiceList : void 0;
  return {
    ...input.multiShot ? {} : { prompt: input.prompt },
    aspect_ratio: input.aspectRatio ?? "16:9",
    // String(n) is just `string`; wire expects '3'|'5'|...|'15'. Narrowing cast.
    duration: String(totalDuration),
    model_name: "kling-v3",
    ...input.startFrame ? { image: input.startFrame } : {},
    ...hasEndFrame ? { image_tail: input.endFrame } : {},
    ...input.negativePrompt ? { negative_prompt: input.negativePrompt } : {},
    ...hasSound ? { sound: "on" } : {},
    mode,
    ...input.multiShot != null ? { multi_shot: input.multiShot } : {},
    ...input.shotType ? { shot_type: input.shotType } : {},
    ...input.multiPrompt ? { multi_prompt: input.multiPrompt } : {},
    // voice_list requires sound 'on' and exists only on the I2V spec;
    // element_list is I2V-only and mutex with voice_list (voice_list wins).
    ...voiceList ? { voice_list: voiceList } : {},
    ...input.startFrame && input.elementList && !voiceList ? { element_list: input.elementList } : {}
  };
};
var buildKlingV3TurboPayload = (input) => ({
  // Cap the folded string at the declared 2500-char prompt limit: the prompt
  // alone passed validation, so trimming can only ever hit the negative tail.
  prompt: input.negativePrompt ? `${input.prompt}. Avoid: ${input.negativePrompt}`.slice(0, 2500) : input.prompt,
  aspect_ratio: input.aspectRatio ?? "16:9",
  // String(n) is just `string`; wire expects '3'|'5'|...|'15'. Narrowing cast.
  duration: String(input.duration ?? 5),
  model_name: "kling-v3-turbo",
  resolution: input.resolution ?? "720p",
  ...input.startFrame ? { image: input.startFrame } : {}
});
var buildKlingV26Payload = (input) => {
  const hasEndFrame = !!(input.startFrame && input.endFrame);
  const hasSound = !!input.generateAudio && !hasEndFrame;
  return {
    prompt: input.prompt,
    aspect_ratio: input.aspectRatio ?? "16:9",
    duration: String(input.duration ?? 5),
    model_name: "kling-v2-6",
    ...input.startFrame ? { image: input.startFrame } : {},
    ...hasEndFrame ? { image_tail: input.endFrame } : {},
    ...input.negativePrompt ? { negative_prompt: input.negativePrompt } : {},
    ...hasSound ? { sound: "on" } : {},
    mode: "pro"
  };
};
var stringElementList = (list) => list?.length ? { element_list: list.map((e) => ({ element_id: String(e.element_id) })) } : {};
var buildOmniV3 = (input) => {
  const imageList = [
    ...input.startFrame ? [{ image_url: input.startFrame, type: "first_frame" }] : [],
    ...input.endFrame ? [{ image_url: input.endFrame, type: "end_frame" }] : [],
    ...(input.imageUrls ?? []).map((image_url) => ({ image_url }))
  ];
  const videoList = input.videoUrl ? [{
    video_url: input.videoUrl,
    refer_type: input.referType ?? "feature",
    keep_original_sound: input.keepOriginalSound ?? "yes"
  }] : [];
  const hasBaseEdit = videoList[0]?.refer_type === "base";
  const hasReferenceVideo = videoList.length > 0;
  const hasSound = !!input.generateAudio && !hasReferenceVideo;
  const mode = input.resolution === "4k" ? hasReferenceVideo ? "pro" : "4k" : input.resolution === "1080p" ? "pro" : "std";
  const totalDuration = input.duration ?? 5;
  if (input.multiShot && !hasBaseEdit) {
    assertMultiPrompt(input.multiPrompt, totalDuration, "Kling V3 Omni");
  }
  return {
    ...input.multiShot ? {} : { prompt: input.prompt },
    model_name: "kling-v3-omni",
    ...hasBaseEdit || input.startFrame ? {} : { aspect_ratio: input.aspectRatio ?? "16:9" },
    // String(n) is just `string`; wire expects literal union. Narrowing cast.
    ...hasBaseEdit ? {} : { duration: String(totalDuration) },
    mode,
    ...input.multiShot != null ? { multi_shot: input.multiShot } : {},
    ...input.shotType ? { shot_type: input.shotType } : {},
    ...input.multiPrompt ? { multi_prompt: input.multiPrompt } : {},
    ...imageList.length ? { image_list: imageList } : {},
    ...videoList.length ? { video_list: videoList } : {},
    ...stringElementList(input.elementList),
    ...hasSound ? { sound: "on" } : {}
  };
};
var buildVideoO1 = (input) => {
  const hasSound = !!input.generateAudio;
  return {
    prompt: input.prompt,
    model_name: "kling-video-o1",
    aspect_ratio: input.aspectRatio ?? "16:9",
    duration: String(input.duration ?? 5),
    ...input.renderingSpeed ? { mode: input.renderingSpeed } : {},
    ...hasSound ? { sound: "on" } : {}
  };
};
var buildMotionControl = (backendModelName) => (input) => ({
  prompt: input.prompt,
  // imageUrls is typed [string, ...string[]] (required tuple) — [0] is `string`.
  image_url: input.imageUrls[0],
  video_url: input.videoUrl,
  character_orientation: input.characterOrientation ?? "video",
  mode: input.renderingSpeed ?? "std",
  ...input.keepOriginalSound ? { keep_original_sound: input.keepOriginalSound } : {},
  model_name: backendModelName
});
var buildKlingAvatarPayload = (input) => ({
  // imageUrls is typed [string, ...string[]] (required tuple).
  image: input.imageUrls[0],
  ...input.audioUrl ? { sound_file: input.audioUrl } : input.audioId ? { audio_id: input.audioId } : {},
  prompt: input.prompt,
  ...input.renderingSpeed ? { mode: input.renderingSpeed } : {}
});
var buildOmniImage = (modelName) => (input) => ({
  prompt: input.prompt,
  model_name: modelName,
  n: input.count ?? 1,
  ...input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {},
  ...input.resolution ? { resolution: input.resolution } : {},
  ...input.imageUrls?.length ? { image_list: input.imageUrls.map((url) => ({ image_url: url })) } : {}
});
var buildGenerations = (input) => {
  const hasImage = !!input.imageUrls?.[0];
  return {
    prompt: input.prompt,
    model_name: "kling-v2-1",
    n: input.count ?? 1,
    ...input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {},
    ...input.negativePrompt && !hasImage ? { negative_prompt: input.negativePrompt } : {},
    ...hasImage ? { image: input.imageUrls[0] } : {}
  };
};
var buildMultiImage = (input) => ({
  model_name: "kling-v2-1",
  n: input.count ?? 1,
  ...input.prompt ? { prompt: input.prompt } : {},
  subject_image_list: (input.imageUrls ?? []).map((url) => ({ subject_image: url })),
  ...input.sceneImage ? { scene_image: input.sceneImage } : {},
  ...input.styleImage ? { style_image: input.styleImage } : {},
  ...input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}
});
var buildKlingElementsPayload = (input) => {
  const isVideo = input.referenceType === "video_refer";
  if (isVideo && !input.videoUrl) {
    throw new ApiError("Kling Elements: video reference requires a reference video.", { status: 400, code: "validation_error" });
  }
  if (!isVideo && (input.imageUrls?.length ?? 0) < 2) {
    throw new ApiError("Kling Elements: image reference requires at least 2 images \u2014 a frontal image plus 1-3 additional angles.", { status: 400, code: "validation_error" });
  }
  return {
    element_name: input.elementName,
    element_description: input.elementDescription,
    reference_type: input.referenceType ?? "image_refer",
    ...isVideo ? { element_video_list: { refer_videos: [{ video_url: input.videoUrl }] } } : {
      element_image_list: {
        frontal_image: input.imageUrls[0],
        refer_images: input.imageUrls.slice(1).map((url) => ({ image_url: url }))
      }
    },
    ...input.elementVoiceId ? { element_voice_id: input.elementVoiceId } : {}
  };
};
var buildKlingVideoEffectsPayload = (input) => {
  const scene = input.templateId ?? input.style;
  const catalogItem = getHydratedCatalog({ workflow: "kling/v1/catalog/templates" })?.items.find((item) => item.id === scene);
  const slots = typeof catalogItem?.meta?.imageSlots === "number" ? catalogItem.meta.imageSlots : scene && KLING_DUAL_IMAGE_EFFECTS.has(scene) ? 2 : 1;
  const uploaded = input.imageUrls?.length ?? 0;
  if (uploaded < slots) {
    throw new ApiError(`Kling Video Effects: the "${scene}" effect requires ${slots} image${slots > 1 ? "s" : ""} (got ${uploaded}).`, { status: 400, code: "validation_error" });
  }
  return {
    effect_scene: scene,
    ...slots === 2 ? { images: input.imageUrls.slice(0, 2) } : { image: input.imageUrls[0] }
  };
};
var buildKlingT2APayload = (input) => ({
  prompt: input.prompt,
  duration: input.duration ?? 5
});
var buildKlingV2APayload = (input) => ({
  video_url: input.videoUrl
});
var klingV3Builder = buildKlingV3Payload("std");
registerPayloads(MODELS, {
  // Combined-entry video — primary slot
  "kling-v3": klingV3Builder,
  "kling-v3-turbo": buildKlingV3TurboPayload,
  "kling-v2-6": buildKlingV26Payload,
  // Omni video
  "kling-v3-omni": buildOmniV3,
  "kling-video-o1": buildVideoO1,
  // Motion control
  "kling-motion-control-v3": buildMotionControl("kling-v3"),
  "kling-motion-control": buildMotionControl("kling-v2-6"),
  // Avatar
  "kling-avatar": buildKlingAvatarPayload,
  // Omni image
  "kling-3.0-image": buildOmniImage("kling-v3-omni"),
  "kling-o1-image": buildOmniImage("kling-image-o1"),
  // Generations
  "kling-v2-1-image": buildGenerations,
  // Multi-image
  "kling-multi-image-v2-1": buildMultiImage,
  // Elements
  "kling-elements": buildKlingElementsPayload,
  // Video effects
  "kling-video-effects": buildKlingVideoEffectsPayload,
  // Audio
  "kling-t2a": buildKlingT2APayload,
  "kling-v2a": buildKlingV2APayload
});
registerEditPayloads(MODELS, {
  "kling-v3": klingV3Builder,
  "kling-v3-turbo": buildKlingV3TurboPayload,
  "kling-v2-6": buildKlingV26Payload
});

// src/vendors/catalog/ltx.ts
var PRO_DURATIONS = [6, 8, 10];
var FAST_DURATIONS = [6, 8, 10, 12, 14, 16, 18, 20];
var LTX_RESOLUTIONS = ["1080p", "1440p", "2160p"];
var LTX_23_AR = ["16:9", "9:16"];
var buildLtxT2VPayload = (ctx) => ({
  prompt: ctx.prompt,
  ...ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0] } : {},
  ...ctx.duration != null ? { duration: ctx.duration } : {},
  ...ctx.resolution ? { resolution: ctx.resolution } : {},
  generate_audio: ctx.generateAudio ?? true
});
var buildLtxI2VPayload = (ctx) => ({
  prompt: ctx.prompt,
  image_url: ctx.imageUrls?.[0],
  ...ctx.duration != null ? { duration: ctx.duration } : {},
  ...ctx.resolution ? { resolution: ctx.resolution } : {},
  generate_audio: ctx.generateAudio ?? true
});
var buildLtxFastPayload = buildLtxT2VPayload;
var buildLtxRetakePayload = (ctx) => ({
  prompt: ctx.prompt,
  video_url: ctx.videoUrl,
  ...ctx.duration != null ? { duration: ctx.duration } : {}
});
var buildLtx23T2VPayload = (ctx) => ({
  prompt: ctx.prompt,
  ...ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0] } : {},
  ...ctx.duration != null ? { duration: ctx.duration } : {},
  ...ctx.resolution ? { resolution: ctx.resolution } : {},
  ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {},
  generate_audio: ctx.generateAudio ?? true
});
var buildLtx23I2VPayload = (ctx) => ({
  prompt: ctx.prompt,
  image_url: ctx.imageUrls?.[0],
  ...ctx.duration != null ? { duration: ctx.duration } : {},
  ...ctx.resolution ? { resolution: ctx.resolution } : {},
  ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {},
  generate_audio: ctx.generateAudio ?? true
});
var buildLtx23FastPayload = buildLtx23T2VPayload;
var buildLtx23A2VPayload = (ctx) => ({
  audio_url: ctx.audioUrl,
  ...ctx.prompt ? { prompt: ctx.prompt } : {},
  ...ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0] } : {},
  ...ctx.cfgScale != null ? { guidance_scale: ctx.cfgScale } : {}
});
var buildLtx23ExtendPayload = (ctx) => ({
  video_url: ctx.videoUrl,
  ...ctx.prompt ? { prompt: ctx.prompt } : {},
  ...ctx.duration != null ? { duration: ctx.duration } : {},
  mode: "end"
});
var buildLtx23RetakePayload = (ctx) => ({
  prompt: ctx.prompt,
  video_url: ctx.videoUrl,
  ...ctx.duration != null ? { duration: ctx.duration } : {},
  retake_mode: "replace_audio_and_video"
});
var { MODELS: MODELS2 } = defineModels("ltx", [
  // ── LTX 2.0 ──────────────────────────────────────────────────────
  {
    id: "ltx-pro-t2v",
    name: "LTX Pro",
    modelId: "ltx-v2-pro",
    addedAt: "2026-02-06",
    deprecated: true,
    // superseded by ltx-2.3-pro-t2v
    workflow: "ltxv-2/text-to-video",
    editWorkflow: "ltxv-2/image-to-video",
    buildPayload: buildLtxT2VPayload,
    buildEditPayload: buildLtxI2VPayload,
    estimatedTime: 75,
    editEstimatedTime: 78,
    mode: "video",
    inputType: "t2v",
    description: "4K output with audio \u2014 streamlined for fast, production-ready results.",
    features: [feat("Image Input", "input"), feat("Start Frame", "frame"), feat("Audio", "audio"), feat("4K", "resolution"), feat("6/8/10 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(PRO_DURATIONS, 6),
      ...params.resolution([...LTX_RESOLUTIONS]),
      ...params.generateAudio(),
      ...params.imageInput()
    }
  },
  {
    id: "ltx-v2-fast",
    name: "LTX Fast",
    addedAt: "2026-02-06",
    deprecated: true,
    // superseded by ltx-2.3-fast-t2v
    workflow: "ltxv-2/text-to-video/fast",
    editWorkflow: "ltxv-2/image-to-video/fast",
    buildPayload: buildLtxFastPayload,
    buildEditPayload: buildLtxI2VPayload,
    estimatedTime: 38,
    editEstimatedTime: 40,
    mode: "video",
    inputType: "t2v",
    description: "Fast with long video support \u2014 up to 20s at 1080p, ideal for drafts and extended scenes.",
    features: [feat("Image Input", "input"), feat("Fast", "duration"), feat("Up to 20s", "duration"), feat("Audio", "audio"), feat("4K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(FAST_DURATIONS, 6),
      ...params.resolution([...LTX_RESOLUTIONS]),
      ...params.generateAudio(),
      ...params.imageInput()
    }
  },
  {
    id: "ltx-v2-retake",
    name: "LTX Retake",
    addedAt: "2026-02-06",
    deprecated: true,
    // superseded by ltx-2.3-retake
    workflow: "ltx-2/retake-video",
    buildPayload: buildLtxRetakePayload,
    estimatedTime: 33,
    mode: "video",
    inputType: "v2v",
    description: "Reinterpret existing footage with a new visual direction \u2014 up to 20s segments.",
    features: [feat("Video Input", "input"), feat("Up to 20s", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.duration([5, 10, 15, 20], 5),
      ...params.videoInput("Source Video")
    }
  },
  // ── LTX 2.3 ──────────────────────────────────────────────────────
  {
    id: "ltx-v2.3-pro",
    name: "LTX 2.3 Pro",
    addedAt: "2026-03-19",
    workflow: "ltx-2.3/text-to-video",
    editWorkflow: "ltx-2.3/image-to-video",
    buildPayload: buildLtx23T2VPayload,
    buildEditPayload: buildLtx23I2VPayload,
    estimatedTime: 75,
    editEstimatedTime: 78,
    mode: "video",
    inputType: "t2v",
    description: "4K output with audio and aspect ratio control \u2014 production-ready v2.3.",
    features: [feat("Image Input", "input"), feat("Start Frame", "frame"), feat("Audio", "audio"), feat("4K", "resolution"), feat("16:9 / 9:16", "characteristic"), feat("6/8/10 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(PRO_DURATIONS, 6),
      ...params.resolution([...LTX_RESOLUTIONS]),
      ...params.aspectRatio(LTX_23_AR),
      ...params.generateAudio(),
      ...params.imageInput()
    }
  },
  {
    id: "ltx-v2.3-fast",
    name: "LTX 2.3 Fast",
    addedAt: "2026-03-19",
    workflow: "ltx-2.3/text-to-video/fast",
    editWorkflow: "ltx-2.3/image-to-video/fast",
    buildPayload: buildLtx23FastPayload,
    buildEditPayload: buildLtx23I2VPayload,
    estimatedTime: 38,
    editEstimatedTime: 40,
    mode: "video",
    inputType: "t2v",
    description: "Fast 2.3 with long video support \u2014 up to 20s at 1080p with aspect ratio control.",
    features: [feat("Image Input", "input"), feat("Fast", "duration"), feat("Up to 20s", "duration"), feat("Audio", "audio"), feat("4K", "resolution"), feat("16:9 / 9:16", "characteristic")],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(FAST_DURATIONS, 6),
      ...params.resolution([...LTX_RESOLUTIONS]),
      ...params.aspectRatio(LTX_23_AR),
      ...params.generateAudio(),
      ...params.imageInput()
    }
  },
  {
    id: "ltx-2.3-a2v",
    name: "LTX 2.3 Audio-to-Video",
    modelId: "ltx-v2.3-pro",
    addedAt: "2026-03-19",
    workflow: "ltx-2.3/audio-to-video",
    buildPayload: buildLtx23A2VPayload,
    estimatedTime: 60,
    mode: "video",
    inputType: "a2v",
    description: "Generate video driven by an audio track \u2014 2-20s, optional image for first frame.",
    features: [feat("Audio Input", "audio"), feat("Image Input", "input"), feat("2\u201320 sec", "duration")],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.audioInput("Audio Track", true),
      ...params.imageInput(1, "First Frame Image", false),
      ...params.cfgScale(1, 50, 5)
    }
  },
  {
    id: "ltx-v2.3-extend",
    name: "LTX 2.3 Extend",
    addedAt: "2026-03-19",
    workflow: "ltx-2.3/extend-video",
    buildPayload: buildLtx23ExtendPayload,
    estimatedTime: 45,
    mode: "video",
    inputType: "v2v",
    description: "Seamlessly extend an existing video forward or backward \u2014 up to 20s.",
    features: [feat("Video Input", "input"), feat("Up to 20s", "duration")],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.duration([5, 10, 15, 20], 5),
      ...params.videoInput("Source Video")
    }
  },
  {
    id: "ltx-v2.3-retake",
    name: "LTX 2.3 Retake",
    addedAt: "2026-03-19",
    workflow: "ltx-2.3/retake-video",
    buildPayload: buildLtx23RetakePayload,
    estimatedTime: 33,
    mode: "video",
    inputType: "v2v",
    description: "Retake video with new direction \u2014 replace audio, video, or both.",
    features: [feat("Video Input", "input"), feat("Up to 20s", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.duration([5, 10, 15, 20], 5),
      ...params.videoInput("Source Video")
    }
  }
]);

// src/vendors/catalog/creatify.ts
var buildCreatifyAuroraPayload = (ctx) => ({
  prompt: ctx.prompt,
  url: ctx.imageUrls?.[0],
  image_url: ctx.imageUrls?.[0],
  ...ctx.audioUrl ? { audio_url: ctx.audioUrl } : {}
});
var { MODELS: MODELS3 } = defineModels("creatify", [
  {
    id: "creatify-aurora",
    name: "Creatify Aurora HD",
    addedAt: "2026-02-06",
    workflow: "creatify/aurora",
    buildPayload: buildCreatifyAuroraPayload,
    estimatedTime: 169,
    mode: "video",
    inputType: "i2v",
    description: "Product showcase from still images with gentle camera motion.",
    features: [feat("Image Input", "input"), feat("Audio Input", "audio")],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.imageInput(1, "Product Image", true),
      ...params.audioInput("Audio Track", true)
    }
  }
]);

// src/vendors/catalog/veed.ts
var buildVeedFabricPayload = (ctx) => ({
  prompt: ctx.prompt,
  image_url: ctx.imageUrls?.[0],
  resolution: ctx.resolution ?? "720p",
  ...ctx.audioUrl ? { audio_url: ctx.audioUrl } : {}
});
var shared = {
  buildPayload: buildVeedFabricPayload,
  mode: "video",
  inputType: "i2v",
  paramConfig: {
    ...params.prompt({ required: false }),
    ...params.resolution(["480p", "720p"], "720p"),
    ...params.imageInput(1, "Start Image", true),
    ...params.audioInput("Audio Track", true)
  }
};
var { MODELS: MODELS4 } = defineModels("veed", [
  {
    ...shared,
    id: "veed-fabric-v1",
    name: "VEED Fabric 1.0",
    addedAt: "2026-02-06",
    workflow: "veed/fabric-1.0",
    estimatedTime: 500,
    description: "Image-driven video with layered ambient atmosphere and optional audio.",
    features: [feat("Image Input", "input"), feat("Audio Input", "audio"), feat("720p", "resolution")]
  },
  {
    ...shared,
    id: "veed-fabric-v1-fast",
    name: "VEED Fabric 1.0 Fast",
    addedAt: "2026-02-06",
    workflow: "veed/fabric-1.0/fast",
    estimatedTime: 514,
    description: "Quick ambient video from images with optional audio overlay.",
    features: [feat("Image Input", "input"), feat("Audio Input", "audio"), feat("720p", "resolution"), feat("Fast", "duration")]
  }
]);

// src/vendors/catalog/ovi.ts
var OVI_RESOLUTION_MAP = {
  "9:16": "512x992",
  "16:9": "992x512",
  "1:1": "720x720",
  "9:16+": "512x960",
  "16:9+": "960x512",
  "2:5": "448x1120",
  "5:2": "1120x448"
};
var buildOviPayload = (ctx) => ({
  prompt: ctx.prompt,
  ...ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0] } : {},
  ...ctx.size ? { resolution: OVI_RESOLUTION_MAP[ctx.size] ?? ctx.size } : {}
});
var { MODELS: MODELS5 } = defineModels("ovi", [
  {
    id: "ovi",
    name: "OVI",
    addedAt: "2026-02-06",
    workflow: "ovi",
    editWorkflow: "ovi/image-to-video",
    buildPayload: buildOviPayload,
    estimatedTime: 251,
    editEstimatedTime: 286,
    mode: "video",
    inputType: "t2v",
    description: "Straightforward text/image-to-video at 720p with broad style coverage.",
    features: [feat("Image Input", "input"), feat("720p", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...p.size(["9:16", "16:9", "1:1", "9:16+", "16:9+", "2:5", "5:2"], "16:9"),
      ...params.imageInput()
    }
  }
]);

// src/vendors/catalog/bytedance.ts
var BYTEDANCE_ENHANCE_RESOLUTION_OPTIONS = [
  "source",
  "720p",
  "1080p",
  "2k",
  "4k",
  "8k"
];
var BYTEDANCE_OMNIHUMAN_RESOLUTION_OPTIONS = ["720p", "1080p"];
var BYTEDANCE_ENHANCE_FPS_OPTIONS = [30, 60, 120];
var BYTEDANCE_ENHANCE_SCENE_OPTIONS = [
  "common",
  "ugc",
  "short_series",
  "aigc",
  "old_film"
];
var buildBytedanceUpscalerPayload = (ctx) => ({
  video_url: ctx.videoUrl,
  target_resolution: "1080p"
});
var { MODELS: MODELS6 } = defineModels("bytedance", [
  {
    id: "bytedance-video-upscaler",
    name: "ByteDance Upscaler",
    addedAt: "2026-02-06",
    workflow: "bytedance-upscaler/upscale/video",
    buildPayload: buildBytedanceUpscalerPayload,
    estimatedTime: 88,
    mode: "video",
    inputType: "v2v",
    deprecated: true,
    description: "AI upscale video resolution \u2014 enhance existing footage to 1080p.",
    features: [feat("Video Input", "input"), feat("1080p", "resolution")],
    // Vendor rejects sources already at/above the 1080p target: "The input
    // video must have one side of length less than 1080 pixels for 1080p
    // upscale" — so the shorter side may be at most 1079.
    paramConfig: { ...params.videoInput("Video to Upscale", "reference", true, void 0, 1079) }
  },
  {
    id: "bytedance-omnihuman-v1.5",
    name: "ByteDance OmniHuman",
    addedAt: "2026-02-06",
    workflow: "bytedance/omnihuman/v1.5",
    // Pricing key of the direct BytePlus Vision AI integration that now serves
    // this workflow (it replaced the fal.ai proxy). The catalog `id` keeps its
    // `v1.5` spelling for stability, so the backend key has to be spelled out.
    // Priced per second of output video, narrowed by `resolution`.
    modelId: "bytedance-omnihuman-1.5",
    // The vendor quotes a real-time factor of 23 (720p) / 27 (1080p), so wall
    // time is driven by the driving audio's length: ~230s for a 10s clip at
    // 720p. Measured 92-131s for a 1.84s clip — mostly queue and fixed
    // overhead. This is a representative mid-length figure, not a ceiling.
    estimatedTime: 250,
    mode: "video",
    inputType: "i2v",
    description: "Animate a portrait with realistic body movement driven by audio.",
    features: [
      feat("Image Input", "input"),
      feat("Audio Input", "audio"),
      feat("1080p", "resolution")
    ],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.imageInput(1, "Portrait Image", true),
      ...params.audioInput("Audio Track", true),
      ...params.resolution([...BYTEDANCE_OMNIHUMAN_RESOLUTION_OPTIONS], "1080p"),
      ...p.boolean("turboMode", false, "Turbo Mode"),
      // -1 (the vendor default) means "pick a random seed"; any positive value
      // reproduces the same result for identical inputs.
      ...p.range("seed", -1, 2147483647, -1)
    }
  },
  {
    id: "bytedance-video-enhance",
    name: "ByteDance Video Enhance",
    addedAt: "2026-07-29",
    workflow: "bytedance/video-enhance",
    // Measured on the live API: 303s end-to-end for a 5s 720p→1080p@60fps
    // professional run. Wall time scales with source duration, so this is a
    // representative short-clip figure, not a ceiling.
    estimatedTime: 300,
    mode: "video",
    inputType: "v2v",
    description: "Denoise, color-correct and super-resolve existing footage up to 8K, with frame-rate conversion.",
    features: [feat("Video Required", "input"), feat("Up to 8K", "resolution"), feat("Enhance", "quality")],
    paramConfig: {
      ...params.videoInput("Source Video", "asset", true),
      ...p.quality(["standard", "professional"], "standard"),
      ...p.enum("resolution", [...BYTEDANCE_ENHANCE_RESOLUTION_OPTIONS], "source"),
      // Always sent — the backend rejects a request it cannot price, and the
      // source frame rate is not discoverable from file metadata.
      ...p.enum("fps", [...BYTEDANCE_ENHANCE_FPS_OPTIONS], 30),
      ...p.enum("scene", [...BYTEDANCE_ENHANCE_SCENE_OPTIONS], "common"),
      ...p.enum("bitrateLevel", ["low", "medium", "high"], "medium")
    },
    constraints: [
      {
        when: { quality: { is: "professional" } },
        then: { scene: { disabled: true, reason: "Scene presets only apply to the standard version" } }
      }
    ]
  }
]);

// src/vendors/catalog/bytedance.payloads.ts
var DEFAULT_TOOL_VERSION = "standard";
var buildBytedanceVideoEnhancePayload = (input) => {
  const toolVersion = input.quality ?? DEFAULT_TOOL_VERSION;
  return {
    video_url: input.videoUrl,
    tool_version: toolVersion,
    bitrate_level: input.bitrateLevel ?? "medium",
    // Always sent: the backend resolves the billing tier before generating and
    // rejects the request (`billing_undetermined`) when the output frame rate is
    // unknown — it cannot read the source frame rate from file metadata.
    fps: input.fps ?? 30,
    // `source` is the SDK-only sentinel for "keep the source resolution"; the
    // backend expresses that by omitting the field. Sending an explicit tier
    // instead would silently rescale (and reprice) every request.
    ...input.resolution && input.resolution !== "source" ? { resolution: input.resolution } : {},
    // The vendor ignores `scene` unless tool_version is standard, and the
    // backend validator rejects the combination outright.
    ...input.scene && toolVersion === DEFAULT_TOOL_VERSION ? { scene: input.scene } : {}
  };
};
var buildBytedanceOmniHumanPayload = (input) => ({
  image_url: input.imageUrls[0],
  audio_url: input.audioUrl,
  resolution: input.resolution ?? "1080p",
  ...input.prompt ? { prompt: input.prompt } : {},
  ...input.turboMode ? { turbo_mode: true } : {},
  ...input.seed != null && input.seed !== -1 ? { seed: input.seed } : {}
});
registerPayloads(MODELS6, {
  "bytedance-video-enhance": buildBytedanceVideoEnhancePayload,
  "bytedance-omnihuman-v1.5": buildBytedanceOmniHumanPayload
});

// src/vendors/catalog/videography.ts
var buildVideographyPayload = (ctx) => ({
  imageUrl: ctx.imageUrls?.[0]
});
var { MODELS: MODELS7 } = defineModels("videography", [
  {
    id: "picsart-videography",
    name: "Videography",
    addedAt: "2026-02-06",
    workflow: "videography",
    buildPayload: buildVideographyPayload,
    estimatedTime: 82,
    mode: "video",
    inputType: "i2v",
    description: "Turn a still photo into polished video with automated composition.",
    features: [feat("Image Input", "input")],
    paramConfig: { ...params.imageInput(1, "Source Image", true) }
  }
]);

// src/vendors/catalog/hunyuan.ts
var HUNYUAN_SIZE_MAP = {
  "1:1": "square_hd",
  "16:9": "landscape_16_9",
  "9:16": "portrait_16_9",
  "4:3": "landscape_4_3",
  "3:4": "portrait_4_3"
};
var buildHunyuanT2IPayload = (ctx) => ({
  prompt: ctx.prompt,
  num_images: ctx.count ?? 1,
  ...ctx.cfgScale != null ? { guidance_scale: ctx.cfgScale } : {},
  ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {},
  ...ctx.aspectRatio && HUNYUAN_SIZE_MAP[ctx.aspectRatio] ? { image_size: HUNYUAN_SIZE_MAP[ctx.aspectRatio] } : {}
});
var { MODELS: MODELS8 } = defineModels("hunyuan", [
  {
    id: "hunyuan-v3",
    name: "Hunyuan V3",
    modelId: "hunyuan-v3",
    addedAt: "2026-02-06",
    workflow: "hunyuan-image/v3/text-to-image",
    buildPayload: buildHunyuanT2IPayload,
    estimatedTime: 74,
    mode: "image",
    inputType: "t2i",
    description: "Infographic-friendly generation with readable text and cfg control.",
    features: [feat("1K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(["1:1", "16:9", "9:16", "4:3", "3:4"], "16:9"),
      // Fal HunyuanImage v3 caps num_images at 4 — don't offer 6/8/10.
      ...params.count([1, 2, 4]),
      ...params.negativePrompt(),
      ...params.cfgScale(1, 20, 7.5, 0.5)
    }
  }
]);

// src/vendors/catalog/hailuo.ts
var buildT2V = (withDuration) => (ctx) => ({
  prompt: ctx.prompt,
  ...ctx.enhancePrompt !== void 0 ? { prompt_optimizer: ctx.enhancePrompt } : {},
  ...withDuration && ctx.duration ? { duration: String(ctx.duration) } : {}
});
var buildI2V = (withDuration) => (ctx) => ({
  prompt: ctx.prompt,
  image_url: ctx.imageUrls?.[0],
  ...ctx.enhancePrompt !== void 0 ? { prompt_optimizer: ctx.enhancePrompt } : {},
  ...withDuration && ctx.duration ? { duration: String(ctx.duration) } : {}
});
var buildMinimaxH3 = (ctx) => {
  const content = [{ type: "text", text: ctx.prompt }];
  if (ctx.startFrame) content.push({ type: "image_url", image_url: { url: ctx.startFrame }, role: "first_frame" });
  if (ctx.endFrame) content.push({ type: "image_url", image_url: { url: ctx.endFrame }, role: "last_frame" });
  for (const url of ctx.imageUrls ?? []) content.push({ type: "image_url", image_url: { url }, role: "reference_image" });
  for (const url of ctx.videoUrls ?? []) content.push({ type: "video_url", video_url: { url }, role: "reference_video" });
  for (const url of ctx.audioUrls ?? []) content.push({ type: "audio_url", audio_url: { url }, role: "reference_audio" });
  return {
    model: "MiniMax-H3",
    content,
    resolution: "2K",
    ...ctx.duration ? { duration: ctx.duration } : {},
    ...ctx.aspectRatio ? { ratio: ctx.aspectRatio } : {}
  };
};
var FRAME_REF_EXCLUSIVE = "First/last frame and reference inputs cannot be combined.";
var LAST_NEEDS_FIRST = "An end frame requires a start frame.";
var AUDIO_NEEDS_VISUAL = "Reference audio needs a reference image or video.";
var minimaxH3Constraints = [
  // Frame roles ⊥ reference roles (declared both ways so either input disables the other).
  { when: { startFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    videoUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    audioUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE }
  } },
  { when: { endFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    videoUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    audioUrls: { disabled: true, reason: FRAME_REF_EXCLUSIVE }
  } },
  { when: { imageUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    endFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE }
  } },
  { when: { videoUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    endFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE }
  } },
  { when: { audioUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE },
    endFrame: { disabled: true, reason: FRAME_REF_EXCLUSIVE }
  } },
  // last_frame requires first_frame.
  { when: { startFrame: { exists: false } }, then: {
    endFrame: { disabled: true, reason: LAST_NEEDS_FIRST }
  } },
  // reference_audio cannot be the only reference input.
  { when: { imageUrls: { exists: false }, videoUrls: { exists: false } }, then: {
    audioUrls: { disabled: true, reason: AUDIO_NEEDS_VISUAL }
  } }
];
var base = {
  mode: "video"
};
var { MODELS: MODELS9 } = defineModels("minimax", [
  {
    ...base,
    id: "hailuo-2.3",
    name: "Hailuo 2.3",
    modelId: "hailuo-2.3",
    addedAt: "2026-02-06",
    inputType: "t2v",
    workflow: "minimax/hailuo-2.3/standard/text-to-video",
    editWorkflow: "minimax/hailuo-2.3/standard/image-to-video",
    buildPayload: buildT2V(true),
    buildEditPayload: buildI2V(true),
    estimatedTime: 150,
    description: "Stylized 720p animation with strong character expression and emotion.",
    features: [feat("Image Input", "input"), feat("Start Frame", "frame"), feat("720p", "resolution"), feat("10 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.enhancePrompt(),
      ...params.duration([6, 10]),
      ...params.imageInput()
    }
  },
  {
    ...base,
    id: "hailuo-2.3-pro",
    name: "Hailuo 2.3 Pro",
    modelId: "hailuo-2.3-pro",
    addedAt: "2026-02-06",
    inputType: "t2v",
    workflow: "minimax/hailuo-2.3/pro/text-to-video",
    editWorkflow: "minimax/hailuo-2.3/pro/image-to-video",
    buildPayload: buildT2V(false),
    buildEditPayload: buildI2V(false),
    estimatedTime: 165,
    description: "1080p output focused on detailed scenes and polished short-form content.",
    features: [feat("Image Input", "input"), feat("Start Frame", "frame"), feat("1080p", "resolution"), feat("6 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.enhancePrompt(),
      ...params.imageInput()
    }
  },
  {
    ...base,
    id: "hailuo-2.3-fast",
    name: "Hailuo 2.3 Fast",
    modelId: "hailuo-2.3-fast",
    addedAt: "2026-02-06",
    inputType: "i2v",
    workflow: "minimax/hailuo-2.3-fast/standard/image-to-video",
    buildPayload: buildI2V(true),
    estimatedTime: 173,
    description: "Quick 720p previews with expressive characters for rapid experimentation.",
    features: [feat("Image Input", "input"), feat("Start Frame", "frame"), feat("720p", "resolution"), feat("10 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.enhancePrompt(),
      ...params.duration([6, 10]),
      ...params.imageInput(1, "Start Image", true)
    }
  },
  {
    ...base,
    id: "hailuo-2.3-fast-pro",
    name: "Hailuo 2.3 Fast Pro",
    modelId: "hailuo-2.3-fast-pro",
    addedAt: "2026-02-06",
    inputType: "i2v",
    workflow: "minimax/hailuo-2.3-fast/pro/image-to-video",
    buildPayload: buildI2V(false),
    estimatedTime: 162,
    description: "Fast 1080p output for short, polished clips with varied styles.",
    features: [feat("Image Input", "input"), feat("Start Frame", "frame"), feat("1080p", "resolution"), feat("6 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.enhancePrompt(),
      ...params.imageInput(1, "Start Image", true)
    }
  },
  {
    ...base,
    id: "minimax-h3",
    name: "MiniMax H3",
    modelId: "minimax-h3",
    addedAt: "2026-07-30",
    inputType: "t2v",
    workflow: "minimax/v2/video-generation",
    buildPayload: buildMinimaxH3,
    estimatedTime: 300,
    description: "MiniMax H3 2K video from text, start/last frame, or image/video/audio references.",
    features: [
      feat("Start Frame", "frame"),
      feat("End Frame", "frame"),
      feat("Reference Video", "input"),
      feat("2K", "resolution"),
      feat("15 sec", "duration")
    ],
    paramConfig: {
      ...params.prompt(),
      ...params.startFrame(),
      ...params.endFrame(),
      ...params.imageInput(3, "Reference Images", false),
      ...params.videoInputs(1, "Reference Videos", false),
      ...params.audioInputs(1, "Reference Audios", false),
      ...params.duration([5, 10, 15]),
      ...p.aspectRatio(["adaptive", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], "adaptive")
    },
    constraints: minimaxH3Constraints
  }
]);

// src/vendors/catalog/wan.ts
var buildWanT2VPayload = (ctx) => ({
  prompt: ctx.prompt,
  resolution: ctx.resolution ?? "720p",
  duration: ctx.duration ?? 5,
  ...ctx.startFrame ? { image_url: ctx.startFrame } : {},
  ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {},
  ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}
});
var buildWanI2VPayload = (ctx) => ({
  prompt: ctx.prompt,
  image_url: ctx.startFrame,
  resolution: ctx.resolution === "1080p" ? "1080p" : "720p",
  duration: String(ctx.duration ?? 5),
  ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}
});
var buildWanR2VPayload = (ctx) => ({
  prompt: ctx.prompt,
  video_urls: [ctx.videoUrl],
  resolution: ctx.resolution === "1080p" ? "1080p" : "720p",
  duration: String(ctx.duration ?? 5)
});
var buildWanImagePayload = (ctx) => ({
  prompt: ctx.prompt,
  model: "wan-2.6",
  count: ctx.count ?? 1,
  ...ctx.negativePrompt ? { modelOptions: { negative_prompt: ctx.negativePrompt } } : {}
});
var buildWan27T2VPayload = (ctx) => ({
  prompt: ctx.prompt,
  resolution: ctx.resolution ?? "720P",
  ratio: ctx.aspectRatio ?? "16:9",
  duration: ctx.duration ?? 5,
  prompt_extend: ctx.enhancePrompt ?? true,
  ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {},
  ...ctx.audioUrl ? { audio_url: ctx.audioUrl } : {},
  ...ctx.seed != null ? { seed: ctx.seed } : {}
});
var buildWan27I2VPayload = (ctx) => {
  const firstFrameUrl = ctx.startFrame ?? ctx.imageUrls?.[0];
  const media = [];
  if (firstFrameUrl) media.push({ type: "first_frame", url: firstFrameUrl });
  if (ctx.endFrame) media.push({ type: "last_frame", url: ctx.endFrame });
  if (ctx.audioUrl) media.push({ type: "driving_audio", url: ctx.audioUrl });
  return {
    media,
    resolution: ctx.resolution ?? "720P",
    duration: ctx.duration ?? 5,
    prompt_extend: ctx.enhancePrompt ?? true,
    ...ctx.prompt ? { prompt: ctx.prompt } : {},
    ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {},
    ...ctx.seed != null ? { seed: ctx.seed } : {}
  };
};
var buildWan27R2VPayload = (ctx) => {
  const media = [];
  if (ctx.imageUrls?.length) {
    for (const url of ctx.imageUrls) media.push({ type: "reference_image", url });
  }
  if (ctx.videoUrl) media.push({ type: "reference_video", url: ctx.videoUrl });
  if (media.length > 5) {
    throw new ApiError("Wan 2.7 R2V accepts at most 5 reference items (images + video combined).", {
      status: 400,
      code: "validation_error"
    });
  }
  return {
    prompt: ctx.prompt,
    media,
    resolution: ctx.resolution ?? "720P",
    ratio: ctx.aspectRatio ?? "16:9",
    duration: ctx.duration ?? 5,
    ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {},
    ...ctx.seed != null ? { seed: ctx.seed } : {}
  };
};
var buildWan27VideoEditPayload = (ctx) => {
  const media = [];
  if (ctx.videoUrl) media.push({ type: "video", url: ctx.videoUrl });
  if (ctx.imageUrls?.length) {
    for (const url of ctx.imageUrls.slice(0, 4)) media.push({ type: "reference_image", url });
  }
  return {
    media,
    resolution: ctx.resolution ?? "720P",
    ...ctx.prompt ? { prompt: ctx.prompt } : {},
    ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {},
    ...ctx.aspectRatio ? { ratio: ctx.aspectRatio } : {},
    // duration is truncation-only: unset (vendor default 0) keeps the input length.
    ...ctx.duration ? { duration: ctx.duration } : {},
    ...ctx.audioSetting ? { audio_setting: ctx.audioSetting } : {},
    ...ctx.seed != null ? { seed: ctx.seed } : {}
  };
};
var WAN27_AR = ["16:9", "9:16", "1:1", "4:3", "3:4"];
var WAN27_RES = ["720P", "1080P"];
var WAN_V3_FRAME_REF_REASON = "Start/End frames cannot be combined with reference images, videos, or audios";
var wanV3Constraints = [
  // any reference input active → disable frame slots
  { when: { imageUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    endFrame: { disabled: true, reason: WAN_V3_FRAME_REF_REASON }
  } },
  { when: { videoUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    endFrame: { disabled: true, reason: WAN_V3_FRAME_REF_REASON }
  } },
  { when: { audioUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    endFrame: { disabled: true, reason: WAN_V3_FRAME_REF_REASON }
  } },
  // any frame slot active → disable reference inputs (mirror, blocks inverse order)
  { when: { startFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    videoUrls: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    audioUrls: { disabled: true, reason: WAN_V3_FRAME_REF_REASON }
  } },
  { when: { endFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    videoUrls: { disabled: true, reason: WAN_V3_FRAME_REF_REASON },
    audioUrls: { disabled: true, reason: WAN_V3_FRAME_REF_REASON }
  } }
];
var wanV3Features = [feat("Image Input", "input"), feat("Video Input", "input"), feat("Audio", "audio"), feat("Start/End Frame", "frame"), feat("1080P", "resolution"), feat("Adaptive Ratio", "resolution")];
var wanV3ParamConfig = {
  // Vendor: 'either prompt or media' — the builder enforces the cross-field rule.
  ...params.prompt({ required: false, maxLength: 5e3 }),
  // Vendor: integer 2-30, or -1 = Smart duration mode (model picks the length).
  duration: {
    label: "Duration (s)",
    descriptor: {
      kind: "enum",
      valueType: "number",
      options: [{ id: -1, label: "Auto" }, { id: 5 }, { id: 10 }, { id: 15 }, { id: 30 }],
      default: 5
    }
  },
  ...params.resolution(["480P", "720P", "1080P"], "1080P"),
  // Vendor default is 'adaptive' (model chooses from intent and input media).
  ...params.aspectRatio(["16:9", "9:16", "1:1", "4:3", "3:4", "adaptive"], "adaptive"),
  ...params.generateAudio(true),
  ...params.startFrame(),
  ...params.endFrame(),
  ...params.imageInput(10, "Reference Images"),
  ...params.videoInputs(5, "Reference Videos", false),
  ...params.audioInputs(5, "Reference Audios"),
  ...p.boolean("enableThinking", false, "Deep Thinking"),
  ...p.boolean("watermark", false, "Watermark"),
  // No default: a materialized seed would pin every generation to one value.
  ...params.seed()
};
var { MODELS: MODELS10 } = defineModels("wan", [
  // ── Video ─────────────────────────────────────────
  {
    id: "wan-2.6-t2v",
    name: "Wan 2.6",
    modelId: "wan2.6-t2v",
    addedAt: "2026-02-06",
    deprecated: true,
    // superseded by wan-2.7-t2v
    workflow: "wan/v2.6/text-to-video",
    editWorkflow: "wan/v2.6/image-to-video",
    buildPayload: buildWanT2VPayload,
    buildEditPayload: buildWanI2VPayload,
    estimatedTime: { "480p": 40, "720p": 50, "1080p": 50 },
    editEstimatedTime: 14,
    mode: "video",
    inputType: "t2v",
    description: "Painterly artistic look with audio \u2014 up to 15s at 1080p.",
    features: [feat("Image Input", "input"), feat("Start Frame", "frame"), feat("Audio", "audio"), feat("1080p", "resolution"), feat("5/10/15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.duration([5, 10, 15], 5),
      ...params.resolution(["480p", "720p", "1080p"], "720p"),
      ...params.aspectRatio(["16:9", "9:16", "1:1", "4:3", "3:4"]),
      ...params.negativePrompt(),
      ...params.startFrame()
    }
  },
  {
    id: "wan-2.6-r2v",
    name: "Wan 2.6 Ref-to-Video",
    modelId: "wan2.6-r2v",
    addedAt: "2026-02-06",
    deprecated: true,
    // superseded by wan-2.7-r2v
    workflow: "wan/v2.6/reference-to-video",
    buildPayload: buildWanR2VPayload,
    estimatedTime: 26,
    mode: "video",
    inputType: "v2v",
    description: "Regenerate video from a reference clip with new stylistic direction.",
    features: [feat("Video Input", "input"), feat("1080p", "resolution"), feat("5/10 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.duration([5, 10], 5),
      ...params.resolution(["720p", "1080p"], "720p"),
      ...params.videoInput("Reference Video")
    }
  },
  // ── Image ─────────────────────────────────────────
  {
    id: "wan-2.6-image",
    name: "Wan 2.6 Image",
    modelId: "wan2.6-t2i",
    addedAt: "2026-03-01",
    workflow: "image-gen-flow",
    buildPayload: buildWanImagePayload,
    mode: "image",
    inputType: "t2i",
    deprecated: true,
    description: "Diverse, stylized images for visual exploration and animation.",
    features: [feat("Multi-Image Input", "input")],
    paramConfig: {
      ...params.prompt(),
      ...params.count(),
      ...params.negativePrompt()
    }
  },
  // ── Wan 2.7 Video ───────────────────────────────────
  {
    id: "wan-2.7-t2v",
    name: "Wan 2.7",
    modelId: "wan2.7-t2v",
    addedAt: "2026-03-30",
    workflow: "wan/v2/text-to-video",
    editWorkflow: "wan/v2/image-to-video",
    buildPayload: buildWan27T2VPayload,
    buildEditPayload: buildWan27I2VPayload,
    estimatedTime: { "720P": 120, "1080P": 120 },
    editEstimatedTime: 120,
    mode: "video",
    inputType: "t2v",
    badge: ["popular"],
    description: "Wan 2.7 T2V \u2014 up to 15s at 1080p with audio input and prompt enhancement.",
    features: [feat("Image Input", "input"), feat("Start Frame", "frame"), feat("Audio", "audio"), feat("1080P", "resolution"), feat("5/10/15 sec", "duration")],
    paramConfig: {
      ...params.prompt({ maxLength: 5e3 }),
      ...params.duration([5, 10, 15], 5),
      ...params.resolution(WAN27_RES, "720P"),
      ...params.aspectRatio(WAN27_AR),
      ...params.negativePrompt(void 0, 500),
      ...params.enhancePrompt(true),
      ...params.audioInput("Audio Track"),
      ...params.startFrame(),
      ...params.seed()
    }
  },
  {
    id: "wan-2.7-i2v",
    name: "Wan 2.7 Image-to-Video",
    modelId: "wan2.7-i2v",
    addedAt: "2026-03-30",
    workflow: "wan/v2/image-to-video",
    buildPayload: buildWan27I2VPayload,
    estimatedTime: 120,
    mode: "video",
    inputType: "i2v",
    badge: ["popular"],
    description: "Wan 2.7 I2V \u2014 animate images with start/end frame and optional driving audio.",
    features: [feat("Start/End Frame", "frame"), feat("Audio", "audio"), feat("1080P", "resolution"), feat("5/10/15 sec", "duration")],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 5e3 }),
      ...params.duration([5, 10, 15], 5),
      ...params.resolution(WAN27_RES, "720P"),
      ...params.negativePrompt(void 0, 500),
      ...params.enhancePrompt(true),
      ...params.startFrame("Start Frame", true),
      ...params.endFrame(),
      ...params.audioInput("Driving Audio"),
      ...params.seed()
    }
  },
  {
    id: "wan-2.7-r2v",
    name: "Wan 2.7 Ref-to-Video",
    modelId: "wan2.7-r2v",
    addedAt: "2026-03-30",
    workflow: "wan/v2/reference-to-video",
    buildPayload: buildWan27R2VPayload,
    estimatedTime: 26,
    mode: "video",
    inputType: "v2v",
    badge: ["popular"],
    description: "Wan 2.7 R2V \u2014 generate video from reference images/video with style direction.",
    features: [feat("Multi-Image Input", "input"), feat("Video Input", "input"), feat("1080P", "resolution"), feat("5/10 sec", "duration")],
    paramConfig: {
      ...params.prompt({ maxLength: 5e3 }),
      ...params.duration([5, 10], 5),
      ...params.resolution(WAN27_RES, "720P"),
      ...params.aspectRatio(WAN27_AR),
      ...params.negativePrompt(void 0, 500),
      // Vendor: reference images + reference video combined ≤ 5 (the builder
      // fails fast when a video pushes the total over the cap).
      ...params.imageInput(5, "Reference Images", true),
      ...params.videoInput("Reference Video"),
      ...params.seed()
    }
  },
  {
    id: "wan-2.7-video-edit",
    name: "Wan 2.7 Video Edit",
    modelId: "wan2.7-videoedit",
    addedAt: "2026-03-30",
    workflow: "wan/v2/video-edit",
    buildPayload: buildWan27VideoEditPayload,
    estimatedTime: 26,
    mode: "video",
    inputType: "v2v",
    badge: ["popular"],
    description: "Wan 2.7 Video Edit \u2014 restyle or modify existing video with reference images.",
    features: [feat("Video Input", "input"), feat("Image Input", "input"), feat("1080P", "resolution")],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 5e3 }),
      ...params.resolution(WAN27_RES, "720P"),
      ...params.aspectRatio(WAN27_AR),
      ...params.negativePrompt(void 0, 500),
      ...params.videoInput("Source Video"),
      // Vendor: 1 video + up to 4 reference images.
      ...params.imageInput(4, "Reference Images"),
      ...params.audioSetting(),
      // Optional truncation: unset keeps the input video's length (vendor
      // default 0); set 2-10 to cut the output.
      duration: {
        label: "Output Duration (s)",
        descriptor: { kind: "range", min: 2, max: 10, step: 1 }
      },
      ...params.seed()
    }
  },
  // ── Wan 3.0 all-in-one Video ─────────────────────────
  // wan-3.0-video and wan-3.0-video-prime share the wan/v3/video workflow and
  // the full param surface — the backend `model` enum value (hardcoded per
  // entry in wan.payloads.ts) is the only wire difference. Prime is the same
  // model, up to 7x faster.
  {
    id: "wan-3.0-video",
    name: "Wan 3.0",
    modelId: "wan3.0-video",
    addedAt: "2026-08-03",
    // Single all-in-one endpoint — text, image/video/audio references, and
    // start/end frames. buildPayload registered in wan.payloads.ts.
    workflow: "wan/v3/video",
    estimatedTime: 120,
    mode: "video",
    inputType: "t2v",
    description: "Wan 3.0 all-in-one \u2014 text, image/video/audio references, and start/end frames with adaptive ratio, intelligent duration, and audio.",
    features: [...wanV3Features],
    constraints: wanV3Constraints,
    paramConfig: { ...wanV3ParamConfig }
  },
  {
    id: "wan-3.0-video-prime",
    name: "Wan 3.0 Prime",
    modelId: "wan3.0-video-prime",
    addedAt: "2026-08-26",
    workflow: "wan/v3/video",
    estimatedTime: 30,
    mode: "video",
    inputType: "t2v",
    description: "Wan 3.0 Prime \u2014 the same all-in-one model as Wan 3.0, up to 7x faster.",
    features: [...wanV3Features],
    constraints: wanV3Constraints,
    paramConfig: { ...wanV3ParamConfig }
  }
]);

// src/vendors/catalog/wan.payloads.ts
var makeWanV3VideoPayload = (model) => (input) => {
  const media = [];
  if (input.startFrame) media.push({ type: "first_frame", url: input.startFrame });
  if (input.endFrame) media.push({ type: "last_frame", url: input.endFrame });
  if (input.imageUrls?.length) {
    for (const url of input.imageUrls) media.push({ type: "reference_image", url });
  }
  if (input.videoUrls?.length) {
    for (const url of input.videoUrls) media.push({ type: "reference_video", url });
  }
  if (input.audioUrls?.length) {
    for (const url of input.audioUrls) media.push({ type: "reference_audio", url });
  }
  if (!input.prompt && media.length === 0) {
    throw new ApiError("Wan 3.0: provide a prompt or at least one media input (frames or references).", {
      status: 400,
      code: "validation_error"
    });
  }
  return {
    model,
    resolution: input.resolution ?? "1080P",
    // Vendor default: adaptive — the model picks the ratio from intent/media.
    ratio: input.aspectRatio ?? "adaptive",
    duration: input.duration ?? 5,
    audio: input.generateAudio ?? true,
    enable_thinking: input.enableThinking ?? false,
    watermark: input.watermark ?? false,
    ...input.prompt ? { prompt: input.prompt } : {},
    ...media.length ? { media } : {},
    ...input.seed != null ? { seed: input.seed } : {}
  };
};
registerPayloads(MODELS10, {
  "wan-3.0-video": makeWanV3VideoPayload("wan3.0-video"),
  "wan-3.0-video-prime": makeWanV3VideoPayload("wan3.0-video-prime")
});

// src/vendors/catalog/luma.ts
var buildLumaRay2Payload = (ctx) => {
  const keyframes = {};
  if (ctx.startFrame) keyframes.frame0 = { type: "image", url: ctx.startFrame };
  if (ctx.endFrame) keyframes.frame1 = { type: "image", url: ctx.endFrame };
  return {
    prompt: ctx.prompt,
    model: "ray-2",
    ...Object.keys(keyframes).length ? { keyframes } : {},
    aspect_ratio: ctx.aspectRatio ?? "16:9",
    resolution: ctx.resolution ?? "720p",
    duration: `${ctx.duration ?? 5}s`
  };
};
var buildLumaFlash2I2VPayload = (ctx) => {
  const keyframes = {};
  if (ctx.startFrame) keyframes.frame0 = { type: "image", url: ctx.startFrame };
  if (ctx.endFrame) keyframes.frame1 = { type: "image", url: ctx.endFrame };
  return {
    prompt: ctx.prompt,
    model: "ray-flash-2",
    ...Object.keys(keyframes).length ? { keyframes } : {},
    aspect_ratio: ctx.aspectRatio ?? "16:9",
    resolution: ctx.resolution ?? "720p",
    duration: `${ctx.duration ?? 5}s`
  };
};
var WORKFLOW = "luma-image-to-video-generation";
var REFRAME_WORKFLOW = "luma-media-reframe";
var makeReframeVideoPayload = (model) => (ctx) => ({
  generation_type: "reframe_video",
  model,
  media: { url: ctx.videoUrl ?? "" },
  aspect_ratio: ctx.aspectRatio ?? "16:9",
  ...ctx.prompt ? { prompt: ctx.prompt } : {}
});
var buildLumaRay2ReframeVideoPayload = makeReframeVideoPayload("ray-2");
var buildLumaRayFlash2ReframeVideoPayload = makeReframeVideoPayload("ray-flash-2");
var LUMA_AR = ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9", "9:21"];
var LUMA_RESOLUTIONS = ["540p", "720p", "1080p", "4k"];
var lumaParamConfig = {
  ...params.prompt(),
  ...params.aspectRatio(LUMA_AR),
  ...params.resolution(LUMA_RESOLUTIONS, "720p"),
  ...params.duration([5, 9], 5)
};
var LUMA_UNI1_AR = ["3:1", "2:1", "16:9", "3:2", "1:1", "2:3", "9:16", "1:2", "1:3"];
var LUMA_UNI1_STYLES = [
  { id: "auto", label: "Auto" },
  { id: "manga", label: "Manga" }
];
var makeUni1T2IPayload = (model) => (ctx) => ({
  prompt: ctx.prompt,
  model,
  ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {},
  ...ctx.style ? { style: ctx.style } : {},
  ...ctx.imageUrls?.length ? { image_ref: ctx.imageUrls.map((url) => ({ url })) } : {}
});
var makeUni1I2IPayload = (model) => (ctx) => {
  const sourceUrl = ctx.startFrame ?? ctx.imageUrls?.[0];
  const refsBase = ctx.startFrame ? ctx.imageUrls : ctx.imageUrls?.slice(1);
  const refs = refsBase?.length ? refsBase.map((url) => ({ url })) : [];
  return {
    prompt: ctx.prompt,
    ...sourceUrl ? { source: { url: sourceUrl } } : {},
    model,
    ...ctx.style ? { style: ctx.style } : {},
    ...refs.length ? { image_ref: refs } : {}
  };
};
var buildLumaUni1T2IPayload = makeUni1T2IPayload("uni-1");
var buildLumaUni1I2IPayload = makeUni1I2IPayload("uni-1");
var buildLumaUni1MaxT2IPayload = makeUni1T2IPayload("uni-1-max");
var buildLumaUni1MaxI2IPayload = makeUni1I2IPayload("uni-1-max");
var lumaUni1ParamConfig = {
  ...params.prompt({ maxLength: 6e3 }),
  ...params.aspectRatio(LUMA_UNI1_AR, "1:1"),
  ...params.style(LUMA_UNI1_STYLES, "auto"),
  ...params.imageInput(9, "Reference Images", false)
};
var RAY32_AR = ["9:16", "3:4", "1:1", "4:3", "16:9", "21:9"];
var RAY32_RESOLUTIONS = ["540p", "720p", "1080p"];
var RAY32_EDIT_STRENGTHS = [
  { id: "adhere_1", label: "Adhere 1" },
  { id: "adhere_2", label: "Adhere 2" },
  { id: "adhere_3", label: "Adhere 3" },
  { id: "flex_1", label: "Flex 1" },
  { id: "flex_2", label: "Flex 2" },
  { id: "flex_3", label: "Flex 3" },
  { id: "reimagine_1", label: "Reimagine 1" },
  { id: "reimagine_2", label: "Reimagine 2" },
  { id: "reimagine_3", label: "Reimagine 3" }
];
var FRAMES_5S = "Start/end frames require 5s duration";
var HDR_10S = "HDR is not supported with 10s duration";
var EXR_10S = "EXR export (requires HDR) is not supported with 10s duration";
var LOOP_10S = "Looping is not supported with 10s duration";
var HDR_540P = "HDR is not supported at 540p";
var LOOP_HDR = "Looping is not supported with HDR (or EXR, which requires HDR)";
var ray32VideoConstraints = [
  // A 10s-incompatible option pins duration to 5s.
  { when: { startFrame: { exists: true } }, then: { duration: { allowed: [5], reason: FRAMES_5S } } },
  { when: { endFrame: { exists: true } }, then: { duration: { allowed: [5], reason: FRAMES_5S } } },
  { when: { hdr: { is: true } }, then: { duration: { allowed: [5], reason: HDR_10S } } },
  { when: { exrExport: { is: true } }, then: { duration: { allowed: [5], reason: EXR_10S } } },
  { when: { loop: { is: true } }, then: { duration: { allowed: [5], reason: LOOP_10S } } },
  // Choosing 10s greys out everything it can't combine with.
  { when: { duration: { is: 10 } }, then: {
    startFrame: { disabled: true, reason: FRAMES_5S },
    endFrame: { disabled: true, reason: FRAMES_5S },
    hdr: { disabled: true, reason: HDR_10S },
    exrExport: { disabled: true, reason: EXR_10S },
    loop: { disabled: true, reason: LOOP_10S }
  } },
  // HDR (and EXR ⇒ HDR) is incompatible with 540p, both directions.
  { when: { hdr: { is: true } }, then: { resolution: { allowed: ["720p", "1080p"], reason: HDR_540P } } },
  { when: { exrExport: { is: true } }, then: { resolution: { allowed: ["720p", "1080p"], reason: HDR_540P } } },
  { when: { resolution: { is: "540p" } }, then: {
    hdr: { disabled: true, reason: HDR_540P },
    exrExport: { disabled: true, reason: HDR_540P }
  } },
  // Looping cannot combine with HDR (and EXR ⇒ HDR), both directions.
  { when: { hdr: { is: true } }, then: { loop: { disabled: true, reason: LOOP_HDR } } },
  { when: { exrExport: { is: true } }, then: { loop: { disabled: true, reason: LOOP_HDR } } },
  { when: { loop: { is: true } }, then: {
    hdr: { disabled: true, reason: LOOP_HDR },
    exrExport: { disabled: true, reason: LOOP_HDR }
  } }
];
var ray32EditConstraints = [
  { when: { hdr: { is: true } }, then: { duration: { allowed: [5], reason: HDR_10S } } },
  { when: { exrExport: { is: true } }, then: { duration: { allowed: [5], reason: EXR_10S } } },
  { when: { duration: { is: 10 } }, then: {
    hdr: { disabled: true, reason: HDR_10S },
    exrExport: { disabled: true, reason: EXR_10S }
  } },
  { when: { hdr: { is: true } }, then: { resolution: { allowed: ["720p", "1080p"], reason: HDR_540P } } },
  { when: { exrExport: { is: true } }, then: { resolution: { allowed: ["720p", "1080p"], reason: HDR_540P } } },
  { when: { resolution: { is: "540p" } }, then: {
    hdr: { disabled: true, reason: HDR_540P },
    exrExport: { disabled: true, reason: HDR_540P }
  } }
];
var { MODELS: MODELS11 } = defineModels("luma", [
  {
    id: "luma-ray-2",
    name: "Luma Ray 2",
    addedAt: "2026-02-06",
    workflow: WORKFLOW,
    editWorkflow: WORKFLOW,
    buildPayload: buildLumaRay2Payload,
    estimatedTime: 18,
    editEstimatedTime: 24,
    mode: "video",
    inputType: "t2v",
    description: "Smooth video with a dreamy, polished aesthetic \u2014 up to 4K resolution.",
    features: [feat("Image Input", "input"), feat("Start/End Frame", "frame"), feat("Up to 4K", "resolution"), feat("5/9 sec", "duration")],
    paramConfig: { ...lumaParamConfig, ...params.startFrame(), ...params.endFrame() }
  },
  {
    id: "luma-ray-flash-2",
    name: "Luma Flash 2",
    addedAt: "2026-02-06",
    workflow: WORKFLOW,
    buildPayload: buildLumaFlash2I2VPayload,
    estimatedTime: 9,
    mode: "video",
    inputType: "i2v",
    description: "Quick image-to-video with smooth, stylized motion \u2014 up to 4K.",
    features: [feat("Image Input", "input"), feat("Start/End Frame", "frame"), feat("Up to 4K", "resolution"), feat("5/9 sec", "duration")],
    paramConfig: { ...lumaParamConfig, ...params.startFrame("Start Frame", true), ...params.endFrame() }
  },
  // ── Reframe video (ray-2 + ray-flash-2; image reframe not supported) ──
  {
    id: "luma-ray-2-reframe-video",
    name: "Luma Ray 2 Reframe",
    modelId: "luma-ray-2",
    addedAt: "2026-05-21",
    workflow: REFRAME_WORKFLOW,
    buildPayload: buildLumaRay2ReframeVideoPayload,
    estimatedTime: 20,
    mode: "video",
    inputType: "v2v",
    description: "Reframe a video to a new aspect ratio using Luma Ray 2.",
    features: [feat("Video Input", "input"), feat("Reframe", "characteristic")],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.aspectRatio(LUMA_AR, "16:9"),
      ...params.videoInput("Source Video")
    }
  },
  {
    id: "luma-ray-flash-2-reframe-video",
    name: "Luma Flash 2 Reframe",
    modelId: "luma-ray-flash-2",
    addedAt: "2026-05-21",
    workflow: REFRAME_WORKFLOW,
    buildPayload: buildLumaRayFlash2ReframeVideoPayload,
    estimatedTime: 12,
    mode: "video",
    inputType: "v2v",
    description: "Reframe a video to a new aspect ratio using Luma Flash 2.",
    features: [feat("Video Input", "input"), feat("Reframe", "characteristic")],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.aspectRatio(LUMA_AR, "16:9"),
      ...params.videoInput("Source Video")
    }
  },
  {
    id: "luma-uni-1",
    name: "Luma UNI-1",
    addedAt: "2026-05-20",
    workflow: "luma-uni1-text-to-image",
    editWorkflow: "luma-uni1-image-edit",
    buildPayload: buildLumaUni1T2IPayload,
    buildEditPayload: buildLumaUni1I2IPayload,
    estimatedTime: 50,
    mode: "image",
    inputType: "t2i",
    description: "Luma UNI-1 \u2014 agentic image generation and editing with up to 9 reference images.",
    features: [feat("Multi-Image Input", "input"), feat("Edit", "characteristic"), feat("Styles", "style")],
    paramConfig: lumaUni1ParamConfig
  },
  {
    id: "luma-uni-1-max",
    name: "Luma UNI-1 Max",
    addedAt: "2026-05-20",
    workflow: "luma-uni1-text-to-image",
    editWorkflow: "luma-uni1-image-edit",
    buildPayload: buildLumaUni1MaxT2IPayload,
    buildEditPayload: buildLumaUni1MaxI2IPayload,
    estimatedTime: 60,
    mode: "image",
    inputType: "t2i",
    description: "Luma UNI-1 Max \u2014 higher-quality UNI-1 variant with the same multi-reference editing controls.",
    features: [feat("Multi-Image Input", "input"), feat("Edit", "characteristic"), feat("Styles", "style")],
    paramConfig: lumaUni1ParamConfig
  },
  // ── Ray 3.2 (early access) — buildPayload registered in luma.payloads.ts ──
  {
    // modelId defaults to id ('luma-ray-3.2') — matches the backend pricing key.
    id: "luma-ray-3.2",
    name: "Luma Ray 3.2",
    addedAt: "2026-06-11",
    workflow: "luma-ray32-video",
    estimatedTime: 30,
    mode: "video",
    inputType: "t2v",
    description: "Luma Ray 3.2 \u2014 high-fidelity video generation with start/end frames, HDR, and looping (early access).",
    features: [feat("Image Input", "input"), feat("Start/End Frame", "frame"), feat("HDR", "characteristic"), feat("5/10 sec", "duration")],
    paramConfig: {
      ...params.prompt({ maxLength: 6e3 }),
      ...params.aspectRatio(RAY32_AR, "16:9"),
      ...params.resolution(RAY32_RESOLUTIONS, "720p"),
      ...params.duration([5, 10], 5),
      ...params.startFrame(),
      ...params.endFrame(),
      ...p.boolean("hdr", false, "HDR"),
      ...p.boolean("exrExport", false, "EXR Export"),
      ...p.boolean("loop", false, "Loop")
    },
    constraints: ray32VideoConstraints
  },
  {
    id: "luma-ray-3.2-edit",
    name: "Luma Ray 3.2 Edit",
    modelId: "luma-ray-3.2",
    addedAt: "2026-06-11",
    workflow: "luma-ray32-video-edit",
    estimatedTime: 30,
    mode: "video",
    inputType: "v2v",
    description: "Edit a prior video from a prompt using Luma Ray 3.2 \u2014 preservation-vs-reimagination presets (early access).",
    features: [feat("Video Input", "input"), feat("Edit", "characteristic"), feat("HDR", "characteristic"), feat("5/10 sec", "duration")],
    paramConfig: {
      ...params.prompt({ maxLength: 6e3 }),
      // Source clip capped at 30s — video_edit rejects longer at ingest (422).
      ...params.videoInput("Source Video", "reference", true, 30),
      ...params.resolution(RAY32_RESOLUTIONS, "720p"),
      ...params.duration([5, 10], 5),
      ...p.enum("editStrength", RAY32_EDIT_STRENGTHS, "flex_2", { label: "Edit Strength" }),
      ...p.boolean("hdr", false, "HDR"),
      ...p.boolean("exrExport", false, "EXR Export")
    },
    constraints: ray32EditConstraints
  },
  {
    id: "luma-ray-3.2-reframe-video",
    name: "Luma Ray 3.2 Reframe",
    modelId: "luma-ray-3.2",
    addedAt: "2026-06-11",
    workflow: "luma-ray32-video-reframe",
    estimatedTime: 20,
    mode: "video",
    inputType: "v2v",
    description: "Reframe a video to a new aspect ratio using Luma Ray 3.2 (early access).",
    features: [feat("Video Input", "input"), feat("Reframe", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 6e3 }),
      ...params.aspectRatio(RAY32_AR, "16:9"),
      // Source clip capped at 30s — video_reframe rejects longer at ingest (422).
      ...params.videoInput("Source Video", "reference", true, 30),
      ...params.resolution(RAY32_RESOLUTIONS, "720p")
    }
  }
]);

// src/vendors/catalog/luma.payloads.ts
var buildRay32VideoPayload = (input) => {
  const video = {
    resolution: input.resolution ?? "720p",
    duration: `${input.duration ?? 5}s`
  };
  if (input.hdr || input.exrExport) video.hdr = true;
  if (input.exrExport) video.exr_export = true;
  if (input.loop) video.loop = true;
  if (input.startFrame) video.start_frame = { url: input.startFrame };
  if (input.endFrame) video.end_frame = { url: input.endFrame };
  return {
    prompt: input.prompt,
    // Materialize the catalog default so direct SDK calls (no aspectRatio) still
    // send the advertised default rather than relying on the model to pick.
    aspect_ratio: input.aspectRatio ?? "16:9",
    video
  };
};
var buildRay32EditPayload = (input) => {
  const video = {
    resolution: input.resolution ?? "720p",
    duration: `${input.duration ?? 5}s`,
    edit: {
      auto_controls: true,
      // Materialize the catalog default (flex_2) for direct SDK calls.
      strength: input.editStrength ?? "flex_2"
    }
  };
  if (input.hdr || input.exrExport) video.hdr = true;
  if (input.exrExport) video.exr_export = true;
  return {
    prompt: input.prompt,
    source: { url: input.videoUrl },
    video
  };
};
var buildRay32ReframePayload = (input) => ({
  prompt: input.prompt,
  aspect_ratio: input.aspectRatio ?? "16:9",
  source: { url: input.videoUrl },
  video: {
    resolution: input.resolution ?? "720p"
  }
});
registerPayloads(MODELS11, {
  "luma-ray-3.2": buildRay32VideoPayload,
  "luma-ray-3.2-edit": buildRay32EditPayload,
  "luma-ray-3.2-reframe-video": buildRay32ReframePayload
});

// src/vendors/catalog/seedance.ts
var SEEDANCE_FRAME_REF_REASON = "Start/End frames cannot be combined with reference images, videos, or audios";
var SEEDANCE_MIN_SIDE_PIXELS = 300;
var SEEDANCE_VIDEO_MIN_PIXELS = 407696;
var SEEDANCE_25_MAX_VIDEO_BYTES = 209715200;
var seedance20Constraints = [
  {
    when: {
      imageUrls: { exists: false },
      videoUrls: { exists: false },
      startFrame: { exists: false },
      endFrame: { exists: false }
    },
    then: {
      audioUrls: {
        disabled: true,
        reason: "Audio cannot be the only modal input \u2014 add an image or video."
      }
    }
  },
  // refs → frames disabled
  { when: { imageUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    endFrame: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON }
  } },
  { when: { videoUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    endFrame: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON }
  } },
  { when: { audioUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    endFrame: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON }
  } },
  // frames → refs disabled (mirror, so UI blocks the inverse order too)
  { when: { startFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    videoUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    audioUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON }
  } },
  { when: { endFrame: { exists: true } }, then: {
    imageUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    videoUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON },
    audioUrls: { disabled: true, reason: SEEDANCE_FRAME_REF_REASON }
  } }
];
var buildSeedance15ProPayload = (ctx) => ({
  model: "seedance_1_5_pro",
  content: [
    ...ctx.startFrame ? [{ type: "image_url", image_url: { url: ctx.startFrame }, role: "first_frame" }] : [],
    ...ctx.endFrame ? [{ type: "image_url", image_url: { url: ctx.endFrame }, role: "last_frame" }] : [],
    { type: "text", text: ctx.prompt }
  ],
  ratio: ctx.aspectRatio ?? "16:9",
  duration: ctx.duration ?? 5,
  resolution: ctx.resolution ?? "720p",
  generate_audio: ctx.generateAudio ?? false,
  ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}
});
var buildSeedanceI2VPayload = (ctx) => ({
  model: "seedance_1_0_pro",
  content: [
    ...ctx.startFrame ? [{ type: "image_url", image_url: { url: ctx.startFrame }, role: "first_frame" }] : [],
    ...ctx.endFrame ? [{ type: "image_url", image_url: { url: ctx.endFrame }, role: "last_frame" }] : [],
    { type: "text", text: ctx.prompt }
  ],
  ratio: ctx.aspectRatio ?? "16:9",
  duration: ctx.duration ?? 5,
  resolution: ctx.resolution ?? "720p",
  ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}
});
var buildSeedance20PayloadFor = (modelAlias) => (ctx) => {
  const refImages = ctx.imageUrls ?? [];
  const refVideos = ctx.videoUrls ?? [];
  const refAudios = ctx.audioUrls ?? [];
  return {
    model: modelAlias,
    content: [
      ...ctx.startFrame ? [{ type: "image_url", image_url: { url: ctx.startFrame }, role: "first_frame" }] : [],
      ...refImages.map((url) => ({
        type: "image_url",
        image_url: { url },
        role: "reference_image"
      })),
      ...refVideos.slice(0, 3).map((url) => ({
        type: "video_url",
        video_url: { url },
        role: "reference_video"
      })),
      ...refAudios.slice(0, 3).map((url) => ({
        type: "audio_url",
        audio_url: { url },
        role: "reference_audio"
      })),
      ...ctx.endFrame ? [{ type: "image_url", image_url: { url: ctx.endFrame }, role: "last_frame" }] : [],
      { type: "text", text: ctx.prompt }
    ],
    ratio: ctx.aspectRatio ?? "16:9",
    duration: ctx.duration ?? 10,
    resolution: ctx.resolution ?? "720p",
    generate_audio: ctx.generateAudio ?? true,
    ...ctx.returnLastFrame ? { return_last_frame: true } : {}
  };
};
var buildSeedance20VideoEditPayloadFor = (modelAlias) => (ctx) => ({
  model: modelAlias,
  content: [
    { type: "text", text: ctx.prompt },
    { type: "video_url", video_url: { url: ctx.videoUrl }, role: "reference_video" },
    ...(ctx.imageUrls ?? []).slice(0, 9).map((url) => ({
      type: "image_url",
      image_url: { url },
      role: "reference_image"
    }))
  ],
  ratio: ctx.aspectRatio ?? "16:9",
  duration: ctx.duration ?? 5,
  resolution: ctx.resolution ?? "720p",
  generate_audio: ctx.generateAudio ?? true,
  ...ctx.returnLastFrame ? { return_last_frame: true } : {}
});
var buildSeedance20VideoExtendPayloadFor = (modelAlias) => (ctx) => ({
  model: modelAlias,
  content: [
    { type: "text", text: ctx.prompt },
    ...(ctx.videoUrls ?? []).slice(0, 3).map((url) => ({
      type: "video_url",
      video_url: { url },
      role: "reference_video"
    }))
  ],
  ratio: ctx.aspectRatio ?? "adaptive",
  duration: ctx.duration ?? 15,
  resolution: ctx.resolution ?? "720p",
  generate_audio: ctx.generateAudio ?? true
});
var SEEDANCE_25_FRAME_ADAPTIVE_REASON = "First/Last Frame mode requires an adaptive aspect ratio \u2014 the vendor rejects any fixed ratio.";
var seedance25Constraints = [
  ...seedance20Constraints.slice(1),
  {
    when: { startFrame: { exists: false } },
    then: {
      endFrame: {
        disabled: true,
        reason: "End frame needs a start frame \u2014 a last frame on its own is rejected."
      }
    }
  },
  // First/Last Frame mode: aspect ratio is locked to 'adaptive' (vendor errors
  // on any fixed ratio when a first_frame/last_frame is supplied).
  {
    when: { startFrame: { exists: true } },
    then: { aspectRatio: { allowed: ["adaptive"], reason: SEEDANCE_25_FRAME_ADAPTIVE_REASON } }
  },
  {
    when: { endFrame: { exists: true } },
    then: { aspectRatio: { allowed: ["adaptive"], reason: SEEDANCE_25_FRAME_ADAPTIVE_REASON } }
  }
];
var buildSeedance25Payload = (ctx) => {
  const refImages = ctx.imageUrls ?? [];
  const refVideos = ctx.videoUrls ?? [];
  const refAudios = ctx.audioUrls ?? [];
  const usesFrame = Boolean(ctx.startFrame || ctx.endFrame);
  return {
    model: "seedance_2_5",
    content: [
      ...ctx.startFrame ? [{ type: "image_url", image_url: { url: ctx.startFrame }, role: "first_frame" }] : [],
      ...refImages.slice(0, 30).map((url) => ({
        type: "image_url",
        image_url: { url },
        role: "reference_image"
      })),
      ...refVideos.slice(0, 10).map((url) => ({
        type: "video_url",
        video_url: { url },
        role: "reference_video"
      })),
      ...refAudios.slice(0, 10).map((url) => ({
        type: "audio_url",
        audio_url: { url },
        role: "reference_audio"
      })),
      ...ctx.endFrame ? [{ type: "image_url", image_url: { url: ctx.endFrame }, role: "last_frame" }] : [],
      { type: "text", text: ctx.prompt }
    ],
    ratio: usesFrame ? "adaptive" : ctx.aspectRatio ?? "16:9",
    duration: ctx.duration ?? 5,
    resolution: ctx.resolution ?? "1080p",
    generate_audio: ctx.generateAudio ?? true,
    output_format: ctx.outputFormat ?? "mp4",
    ...ctx.returnLastFrame ? { return_last_frame: true } : {}
  };
};
var buildSeedance25VideoEditPayload = (ctx) => ({
  model: "seedance_2_5",
  content: [
    { type: "text", text: ctx.prompt },
    { type: "video_url", video_url: { url: ctx.videoUrl }, role: "reference_video" },
    ...(ctx.imageUrls ?? []).slice(0, 30).map((url) => ({
      type: "image_url",
      image_url: { url },
      role: "reference_image"
    }))
  ],
  ratio: "adaptive",
  duration: -1,
  resolution: ctx.resolution ?? "1080p",
  generate_audio: ctx.generateAudio ?? true,
  output_format: ctx.outputFormat ?? "mp4",
  ...ctx.returnLastFrame ? { return_last_frame: true } : {}
});
var buildSeedance25VideoExtendPayload = (ctx) => ({
  model: "seedance_2_5",
  content: [
    { type: "text", text: ctx.prompt },
    ...(ctx.videoUrls ?? []).slice(0, 10).map((url) => ({
      type: "video_url",
      video_url: { url },
      role: "reference_video"
    }))
  ],
  ratio: "adaptive",
  duration: ctx.duration ?? 15,
  resolution: ctx.resolution ?? "1080p",
  generate_audio: ctx.generateAudio ?? true,
  output_format: ctx.outputFormat ?? "mp4"
});
var SEEDANCE_AR = ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9", "adaptive"];
var SEEDANCE_V2_DURATIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
var SEEDANCE_25_DURATION = { min: 4, max: 30 };
var { MODELS: MODELS12 } = defineModels("seedance", [
  {
    id: "seedance-2.5",
    name: "Seedance 2.5",
    modelId: "seedance-2.5",
    addedAt: "2026-08-06",
    workflow: "seedance",
    buildPayload: buildSeedance25Payload,
    constraints: seedance25Constraints,
    estimatedTime: 20,
    mode: "video",
    inputType: "t2v",
    badge: ["new", "premium", "hot"],
    description: "Latest cinematic video with audio, multi-reference input, and mp4/mov output. Up to 30s.",
    features: [feat("Reference Image", "frame"), feat("Start/End Frame", "frame"), feat("Audio", "audio"), feat("1080p", "resolution"), feat("4-30 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p", "1080p"], "1080p"),
      ...params.durationRange(SEEDANCE_25_DURATION.min, SEEDANCE_25_DURATION.max, 5),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      ...p.enum("outputFormat", ["mp4", "mov"], "mp4", { label: "Format" }),
      // 2.5 lifts the reference caps to 30 images / 10 videos / 10 audios.
      ...params.imageInput(30, "Reference Images", false, "reference", { minSidePixels: SEEDANCE_MIN_SIDE_PIXELS }),
      ...params.videoInputs(10, "Reference Videos", false, {
        minPixels: SEEDANCE_VIDEO_MIN_PIXELS,
        minSidePixels: SEEDANCE_MIN_SIDE_PIXELS,
        maxBytes: SEEDANCE_25_MAX_VIDEO_BYTES
      }),
      ...params.audioInputs(10, "Reference Audios"),
      ...params.startFrame(),
      ...params.endFrame()
    }
  },
  {
    id: "seedance-2.5-video-edit",
    name: "Seedance 2.5 Video Edit",
    modelId: "seedance-2.5",
    addedAt: "2026-08-06",
    workflow: "seedance",
    buildPayload: buildSeedance25VideoEditPayload,
    estimatedTime: 60,
    mode: "video",
    inputType: "v2v",
    badge: ["new", "premium", "hot"],
    description: "Edit video \u2014 replace subjects, add or remove objects, restyle scenes with reference images.",
    features: [feat("Video Input", "input"), feat("Multi-Image Input", "input"), feat("Audio", "audio"), feat("1080p", "resolution"), feat("Source length", "duration")],
    paramConfig: {
      ...params.prompt(),
      // Editing mode: aspect ratio is fixed to 'adaptive' and duration is
      // source-driven ('-1'), so neither is user-selectable (vendor rule).
      ...params.aspectRatio(["adaptive"]),
      ...params.resolution(["480p", "720p", "1080p"], "1080p"),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      ...p.enum("outputFormat", ["mp4", "mov"], "mp4", { label: "Format" }),
      ...params.videoInput("Source Video", "reference", true, void 0, void 0, SEEDANCE_25_MAX_VIDEO_BYTES),
      ...params.imageInput(30, "Reference Images")
    }
  },
  {
    id: "seedance-2.5-video-extend",
    name: "Seedance 2.5 Video Extend",
    modelId: "seedance-2.5",
    addedAt: "2026-08-06",
    workflow: "seedance",
    buildPayload: buildSeedance25VideoExtendPayload,
    estimatedTime: 200,
    mode: "video",
    inputType: "v2v",
    badge: ["new", "premium", "hot"],
    description: "Stitch up to 10 clips into one continuous, extended video.",
    features: [feat("Multi-Video Input", "input"), feat("Audio", "audio"), feat("1080p", "resolution"), feat("4-30 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      // Extension mode: aspect ratio is locked to 'adaptive' (vendor rule);
      // duration stays user-selectable.
      ...params.aspectRatio(["adaptive"]),
      ...params.resolution(["480p", "720p", "1080p"], "1080p"),
      ...params.durationRange(SEEDANCE_25_DURATION.min, SEEDANCE_25_DURATION.max, 15),
      ...params.generateAudio(),
      ...p.enum("outputFormat", ["mp4", "mov"], "mp4", { label: "Format" }),
      ...params.videoInputs(10, "Source Videos", true, { maxBytes: SEEDANCE_25_MAX_VIDEO_BYTES })
    }
  },
  {
    id: "seedance-2.0",
    name: "Seedance 2.0",
    modelId: "seedance-2.0",
    addedAt: "2026-05-27",
    workflow: "seedance",
    buildPayload: buildSeedance20PayloadFor("seedance_2_0"),
    constraints: seedance20Constraints,
    estimatedTime: 15,
    mode: "video",
    inputType: "t2v",
    badge: ["new", "premium", "hot"],
    description: "Next-gen cinematic video with optional audio and reference image. Up to 4K.",
    features: [feat("Reference Image", "frame"), feat("Start/End Frame", "frame"), feat("Audio", "audio"), feat("4K", "resolution"), feat("4-15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p", "1080p", "4k"], "720p"),
      ...params.duration(SEEDANCE_V2_DURATIONS, 10),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, "Reference Images", false, "reference", { minSidePixels: SEEDANCE_MIN_SIDE_PIXELS }),
      ...params.videoInputs(3, "Reference Videos", false, {
        minPixels: SEEDANCE_VIDEO_MIN_PIXELS,
        minSidePixels: SEEDANCE_MIN_SIDE_PIXELS
      }),
      ...params.audioInputs(3, "Reference Audios"),
      ...params.startFrame(),
      ...params.endFrame()
    }
  },
  {
    // Same model as seedance-2.0 on a vendor endpoint with moderation
    // disabled — full capability parity, bills under the seedance-2.0
    // pricing key (hence the shared modelId).
    id: "seedance-2.0-without-moderation",
    name: "Seedance 2.0 Without Moderation",
    modelId: "seedance-2.0",
    addedAt: "2026-08-17",
    release: "preview",
    workflow: "seedance",
    buildPayload: buildSeedance20PayloadFor("seedance_2_0_without_moderation"),
    constraints: seedance20Constraints,
    estimatedTime: 15,
    mode: "video",
    inputType: "t2v",
    badge: ["new", "premium", "hot"],
    description: "Seedance 2.0 with vendor moderation disabled \u2014 cinematic video with optional audio and reference image. Up to 4K.",
    features: [feat("Reference Image", "frame"), feat("Start/End Frame", "frame"), feat("Audio", "audio"), feat("4K", "resolution"), feat("4-15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p", "1080p", "4k"], "720p"),
      ...params.duration(SEEDANCE_V2_DURATIONS, 10),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, "Reference Images", false, "reference", { minSidePixels: SEEDANCE_MIN_SIDE_PIXELS }),
      ...params.videoInputs(3, "Reference Videos", false, {
        minPixels: SEEDANCE_VIDEO_MIN_PIXELS,
        minSidePixels: SEEDANCE_MIN_SIDE_PIXELS
      }),
      ...params.audioInputs(3, "Reference Audios"),
      ...params.startFrame(),
      ...params.endFrame()
    }
  },
  {
    id: "seedance-2.0-fast",
    name: "Seedance 2.0 Fast",
    modelId: "seedance-2.0-fast",
    addedAt: "2026-05-27",
    workflow: "seedance",
    buildPayload: buildSeedance20PayloadFor("seedance_2_0_fast"),
    constraints: seedance20Constraints,
    estimatedTime: 15,
    mode: "video",
    inputType: "t2v",
    badge: ["new", "fast", "premium", "hot"],
    description: "Fast cinematic video with audio, reference images, and start/end frame control.",
    features: [feat("Reference Image", "frame"), feat("Start/End Frame", "frame"), feat("Audio", "audio"), feat("720p", "resolution"), feat("4-15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p"], "720p"),
      ...params.duration(SEEDANCE_V2_DURATIONS, 10),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, "Reference Images", false, "reference", { minSidePixels: SEEDANCE_MIN_SIDE_PIXELS }),
      ...params.videoInputs(3, "Reference Videos", false, {
        minPixels: SEEDANCE_VIDEO_MIN_PIXELS,
        minSidePixels: SEEDANCE_MIN_SIDE_PIXELS
      }),
      ...params.audioInputs(3, "Reference Audios"),
      ...params.startFrame(),
      ...params.endFrame()
    }
  },
  {
    id: "seedance-2.0-mini",
    name: "Seedance 2.0 Mini",
    modelId: "seedance-2.0-mini",
    addedAt: "2026-06-25",
    workflow: "seedance",
    buildPayload: buildSeedance20PayloadFor("seedance_2_0_mini"),
    constraints: seedance20Constraints,
    estimatedTime: 15,
    mode: "video",
    inputType: "t2v",
    badge: ["new", "fast", "premium"],
    description: "Lightweight cinematic video with audio, reference images, and start/end frame control.",
    features: [feat("Reference Image", "frame"), feat("Start/End Frame", "frame"), feat("Audio", "audio"), feat("720p", "resolution"), feat("4-15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p"], "720p"),
      ...params.duration(SEEDANCE_V2_DURATIONS, 10),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, "Reference Images", false, "reference", { minSidePixels: SEEDANCE_MIN_SIDE_PIXELS }),
      ...params.videoInputs(3, "Reference Videos", false, {
        minPixels: SEEDANCE_VIDEO_MIN_PIXELS,
        minSidePixels: SEEDANCE_MIN_SIDE_PIXELS
      }),
      ...params.audioInputs(3, "Reference Audios"),
      ...params.startFrame(),
      ...params.endFrame()
    }
  },
  {
    id: "seedance-2.0-video-edit",
    name: "Seedance 2.0 Video Edit",
    modelId: "seedance-2.0",
    addedAt: "2026-05-27",
    workflow: "seedance",
    buildPayload: buildSeedance20VideoEditPayloadFor("seedance_2_0"),
    estimatedTime: 77,
    mode: "video",
    inputType: "v2v",
    badge: ["new", "premium", "hot"],
    description: "Edit video \u2014 replace subjects, add or remove objects, restyle scenes with reference images.",
    features: [feat("Video Input", "input"), feat("Multi-Image Input", "input"), feat("Audio", "audio"), feat("4K", "resolution"), feat("4-15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p", "1080p", "4k"], "720p"),
      ...params.duration(SEEDANCE_V2_DURATIONS, 5),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      ...params.videoInput("Source Video"),
      ...params.imageInput(9, "Reference Images")
    }
  },
  {
    id: "seedance-2.0-without-moderation-video-edit",
    name: "Seedance 2.0 Without Moderation Video Edit",
    modelId: "seedance-2.0",
    addedAt: "2026-08-17",
    release: "preview",
    workflow: "seedance",
    buildPayload: buildSeedance20VideoEditPayloadFor("seedance_2_0_without_moderation"),
    estimatedTime: 77,
    mode: "video",
    inputType: "v2v",
    badge: ["new", "premium", "hot"],
    description: "Moderation-free video edit \u2014 replace subjects, add or remove objects, restyle scenes with reference images.",
    features: [feat("Video Input", "input"), feat("Multi-Image Input", "input"), feat("Audio", "audio"), feat("4K", "resolution"), feat("4-15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p", "1080p", "4k"], "720p"),
      ...params.duration(SEEDANCE_V2_DURATIONS, 5),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      ...params.videoInput("Source Video"),
      ...params.imageInput(9, "Reference Images")
    }
  },
  {
    id: "seedance-2.0-fast-video-edit",
    name: "Seedance 2.0 Fast Video Edit",
    modelId: "seedance-2.0-fast",
    addedAt: "2026-05-27",
    workflow: "seedance",
    buildPayload: buildSeedance20VideoEditPayloadFor("seedance_2_0_fast"),
    estimatedTime: 30,
    mode: "video",
    inputType: "v2v",
    badge: ["new", "fast", "premium", "hot"],
    description: "Fast video edit \u2014 modify scenes with reference images.",
    features: [feat("Video Input", "input"), feat("Multi-Image Input", "input"), feat("Audio", "audio"), feat("720p", "resolution"), feat("4-15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p"], "720p"),
      ...params.duration(SEEDANCE_V2_DURATIONS, 5),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      ...params.videoInput("Source Video"),
      ...params.imageInput(9, "Reference Images")
    }
  },
  {
    id: "seedance-2.0-mini-video-edit",
    name: "Seedance 2.0 Mini Video Edit",
    modelId: "seedance-2.0-mini",
    addedAt: "2026-06-25",
    workflow: "seedance",
    buildPayload: buildSeedance20VideoEditPayloadFor("seedance_2_0_mini"),
    estimatedTime: 30,
    mode: "video",
    inputType: "v2v",
    badge: ["new", "fast", "premium"],
    description: "Lightweight video edit \u2014 modify scenes with reference images.",
    features: [feat("Video Input", "input"), feat("Multi-Image Input", "input"), feat("Audio", "audio"), feat("720p", "resolution"), feat("4-15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p"], "720p"),
      ...params.duration(SEEDANCE_V2_DURATIONS, 5),
      ...params.generateAudio(),
      ...params.returnLastFrame(),
      ...params.videoInput("Source Video"),
      ...params.imageInput(9, "Reference Images")
    }
  },
  {
    id: "seedance-2.0-video-extend",
    name: "Seedance 2.0 Video Extend",
    modelId: "seedance-2.0",
    addedAt: "2026-05-27",
    workflow: "seedance",
    buildPayload: buildSeedance20VideoExtendPayloadFor("seedance_2_0"),
    estimatedTime: 400,
    mode: "video",
    inputType: "v2v",
    badge: ["new", "premium", "hot"],
    description: "Stitch up to 3 clips into one continuous, extended video.",
    features: [feat("Multi-Video Input", "input"), feat("Audio", "audio"), feat("4K", "resolution"), feat("4-15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p", "1080p", "4k"], "720p"),
      ...params.duration(SEEDANCE_V2_DURATIONS, 15),
      ...params.generateAudio(),
      ...params.videoInputs(3, "Source Videos", true)
    }
  },
  {
    id: "seedance-2.0-without-moderation-video-extend",
    name: "Seedance 2.0 Without Moderation Video Extend",
    modelId: "seedance-2.0",
    addedAt: "2026-08-17",
    release: "preview",
    workflow: "seedance",
    buildPayload: buildSeedance20VideoExtendPayloadFor("seedance_2_0_without_moderation"),
    estimatedTime: 400,
    mode: "video",
    inputType: "v2v",
    badge: ["new", "premium", "hot"],
    description: "Moderation-free: stitch up to 3 clips into one continuous, extended video.",
    features: [feat("Multi-Video Input", "input"), feat("Audio", "audio"), feat("4K", "resolution"), feat("4-15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p", "1080p", "4k"], "720p"),
      ...params.duration(SEEDANCE_V2_DURATIONS, 15),
      ...params.generateAudio(),
      ...params.videoInputs(3, "Source Videos", true)
    }
  },
  {
    id: "seedance-2.0-fast-video-extend",
    name: "Seedance 2.0 Fast Video Extend",
    modelId: "seedance-2.0-fast",
    addedAt: "2026-05-27",
    workflow: "seedance",
    buildPayload: buildSeedance20VideoExtendPayloadFor("seedance_2_0_fast"),
    estimatedTime: 180,
    mode: "video",
    inputType: "v2v",
    badge: ["new", "fast", "premium", "hot"],
    description: "Quickly stitch up to 3 clips into one continuous video.",
    features: [feat("Multi-Video Input", "input"), feat("Audio", "audio"), feat("720p", "resolution"), feat("4-15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p"], "720p"),
      ...params.duration(SEEDANCE_V2_DURATIONS, 15),
      ...params.generateAudio(),
      ...params.videoInputs(3, "Source Videos", true)
    }
  },
  {
    id: "seedance-2.0-mini-video-extend",
    name: "Seedance 2.0 Mini Video Extend",
    modelId: "seedance-2.0-mini",
    addedAt: "2026-06-25",
    workflow: "seedance",
    buildPayload: buildSeedance20VideoExtendPayloadFor("seedance_2_0_mini"),
    estimatedTime: 180,
    mode: "video",
    inputType: "v2v",
    badge: ["new", "fast", "premium"],
    description: "Lightweight: stitch up to 3 clips into one continuous video.",
    features: [feat("Multi-Video Input", "input"), feat("Audio", "audio"), feat("720p", "resolution"), feat("4-15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p"], "720p"),
      ...params.duration(SEEDANCE_V2_DURATIONS, 15),
      ...params.generateAudio(),
      ...params.videoInputs(3, "Source Videos", true)
    }
  },
  {
    id: "seedance-1.5-pro",
    name: "Seedance 1.5 Pro",
    modelId: "seedance-1.5-pro",
    addedAt: "2026-02-06",
    deprecated: true,
    // superseded by seedance-2.0 / seedance-2.0-fast
    workflow: "seedance",
    buildPayload: buildSeedance15ProPayload,
    estimatedTime: 15,
    mode: "video",
    inputType: "t2v",
    description: "Built-in audio with start/end frame control and flexible 4-12s durations.",
    features: [feat("Start/End Frame", "frame"), feat("Audio", "audio"), feat("720p", "resolution"), feat("12 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p"], "720p"),
      ...params.duration([4, 5, 8, 10, 12], 5),
      ...params.generateAudio(false),
      ...params.startFrame(),
      ...params.endFrame()
    }
  },
  {
    id: "seedance-i2v",
    name: "Seedance I2V",
    modelId: "seedance-1.0-pro",
    addedAt: "2026-02-06",
    deprecated: true,
    // 1.0 Pro is 3 generations behind seedance-2.0
    workflow: "seedance",
    buildPayload: buildSeedanceI2VPayload,
    estimatedTime: 40,
    mode: "video",
    inputType: "i2v",
    description: "Bring a still image to life with natural motion and style transfer, up to 1080p.",
    features: [feat("Image Input", "input"), feat("Up to 1080p", "resolution"), feat("5/10 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(SEEDANCE_AR),
      ...params.resolution(["480p", "720p", "1080p"], "720p"),
      ...params.duration([5, 10], 5),
      ...params.startFrame("First Frame", true)
    }
  }
]);

// src/vendors/catalog/sora.ts
var SORA_SIZE_MAP = {
  "720p": { "16:9": "1280x720", "9:16": "720x1280" },
  "1024p": { "16:9": "1792x1024", "9:16": "1024x1792" },
  "1080p": { "16:9": "1920x1080", "9:16": "1080x1920" }
};
var getSoraSize = (aspectRatio, resolution) => SORA_SIZE_MAP[resolution ?? "720p"]?.[aspectRatio ?? "16:9"] ?? "1280x720";
var buildSora2ProPayload = (ctx) => ({
  model: "sora-2-pro",
  prompt: ctx.prompt,
  seconds: ctx.duration ?? 4,
  size: getSoraSize(ctx.aspectRatio, ctx.resolution),
  ...ctx.imageUrls?.[0] ? { input_reference_url: ctx.imageUrls[0], adjust_input_image_ratio: true } : {}
});
var buildSora2Payload = (ctx) => ({
  model: "sora-2",
  prompt: ctx.prompt,
  seconds: ctx.duration ?? 4,
  size: getSoraSize(ctx.aspectRatio),
  ...ctx.imageUrls?.[0] ? { input_reference_url: ctx.imageUrls[0], adjust_input_image_ratio: true } : {}
});
var buildSora2ExtendPayload = (ctx) => ({
  video_id: ctx.videoId,
  prompt: ctx.prompt,
  seconds: ctx.duration ?? 8
});
var SORA_DURATIONS = [4, 8, 12, 16, 20];
var SORA_AR = ["16:9", "9:16"];
var { MODELS: MODELS13 } = defineModels("openai", [
  {
    id: "sora-2-pro",
    name: "Sora 2 Pro",
    modelId: "sora-2-pro",
    addedAt: "2026-02-06",
    workflow: "openai/v1/videos",
    buildPayload: buildSora2ProPayload,
    estimatedTime: { "720p": 100, "1024p": 100, "1080p": 100 },
    testTimeout: 700,
    mode: "video",
    inputType: "t2v",
    badge: ["popular", "premium"],
    description: "Up to 1080p with strong physical realism and optional reference image.",
    features: [feat("Image Input", "input"), feat("Audio", "audio"), feat("Up to 1080p", "resolution"), feat("4\u201320 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(1, "Reference Image"),
      ...params.aspectRatio(SORA_AR),
      ...params.resolution(["720p", "1024p", "1080p"]),
      ...params.duration(SORA_DURATIONS, 4)
    }
  },
  {
    id: "sora-2",
    name: "Sora 2",
    modelId: "sora-2",
    addedAt: "2026-02-06",
    workflow: "openai/v1/videos",
    buildPayload: buildSora2Payload,
    estimatedTime: 100,
    mode: "video",
    inputType: "t2v",
    badge: ["popular"],
    description: "Naturalistic 720p video with lifelike motion and character detail.",
    features: [feat("Image Input", "input"), feat("Audio", "audio"), feat("720p", "resolution"), feat("4\u201320 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(1, "Reference Image"),
      ...params.aspectRatio(SORA_AR),
      ...params.duration(SORA_DURATIONS, 4)
    }
  },
  {
    id: "sora-2-extend",
    name: "Sora 2 Extend",
    modelId: "sora-2",
    addedAt: "2026-02-10",
    workflow: "openai/v1/videos/extensions",
    buildPayload: buildSora2ExtendPayload,
    estimatedTime: 17,
    mode: "video",
    inputType: "v2v",
    description: "Seamlessly continue a previously generated Sora video with matching style and pacing.",
    features: [feat("Continue Video", "input"), feat("4\u201320 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      // video_id is chained from the source Sora asset (declaring the param lets
      // the store seed ctx.videoId); no aspectRatio/size — extend keeps source geometry.
      ...params.videoId([], ""),
      ...params.duration(SORA_DURATIONS, 8)
    }
  }
]);

// src/vendors/catalog/seedream.ts
function buildSeedreamV2(modelId) {
  return (ctx) => ({
    prompt: ctx.prompt,
    model: modelId,
    count: ctx.count ?? 1,
    ...ctx.resolution ? { resolution: ctx.resolution } : {},
    ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {},
    ...ctx.imageUrls?.length ? { image: ctx.imageUrls } : {},
    ...ctx.negativePrompt ? { modelOptions: { negative_prompt: ctx.negativePrompt } } : {}
  });
}
var buildSeedream40Payload = buildSeedreamV2("seedream_4_0");
var buildSeedream45Payload = buildSeedreamV2("seedream_4_5");
var buildSeedream47Payload = buildSeedreamV2("seedream_4_7");
var buildSeedream50LitePayload = buildSeedreamV2("seedream_5_0_lite");
var buildSeedream50ProPayload = buildSeedreamV2("seedream_5_0_pro");
var seedreamV2Params = {
  ...params.prompt(),
  ...params.aspectRatio(["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "21:9"], "16:9"),
  ...params.count(),
  ...params.imageInput(2, "Source Images"),
  ...params.negativePrompt()
};
var { MODELS: MODELS14 } = defineModels("seedream", [
  {
    id: "seedream-5.0-pro",
    name: "Seedream 5.0 Pro",
    modelId: "seedream_5_0_pro",
    addedAt: "2026-07-08",
    workflow: "seedream",
    buildPayload: buildSeedream50ProPayload,
    estimatedTime: { "1K": 20, "2K": 35 },
    mode: "image",
    inputType: "t2i",
    // The backend gates 5.0-pro to 1K/2K — it rejects 3K/4K ("not supported by
    // model seedream_5_0_pro"). Single-image only (no group/sequential), up to
    // 10 reference images.
    description: "Top-tier single-image generation with up to 10 reference images and 2K detail.",
    features: [feat("Multi-Image Input", "input"), feat("2K", "resolution")],
    // Single-image only (no sequential/batch) → no `count` param, unlike the V2 models.
    paramConfig: {
      ...params.resolution(["1K", "2K"]),
      ...params.prompt(),
      ...params.aspectRatio(["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "21:9"], "16:9"),
      ...params.imageInput(10, "Source Images"),
      // Pro supports up to 10 reference images
      ...params.negativePrompt()
    }
  },
  {
    id: "seedream-5.0-lite",
    name: "Seedream 5.0 Lite",
    modelId: "seedream_5_0_lite",
    addedAt: "2026-02-24",
    workflow: "seedream",
    buildPayload: buildSeedream50LitePayload,
    estimatedTime: { "2K": 22, "3K": 44 },
    mode: "image",
    inputType: "t2i",
    badge: ["popular"],
    // The backend gates 5.0-lite to 2K/3K — it rejects 4K ("not supported by
    // model seedream_5_0_lite") even though the SeedreamResolution enum defines
    // a 4K member. Boundary-verified 2026-05-25.
    description: "Speedy 3K output with negative prompt and dual-image input support.",
    features: [feat("Multi-Image Input", "input"), feat("3K", "resolution")],
    paramConfig: {
      ...params.resolution(["2K", "3K"]),
      ...seedreamV2Params
    }
  },
  {
    id: "seedream-4.7",
    name: "Seedream 4.7",
    modelId: "seedream_4_7",
    addedAt: "2026-08-06",
    workflow: "seedream",
    buildPayload: buildSeedream47Payload,
    estimatedTime: { "1K": 12, "2K": 21, "4K": 58 },
    mode: "image",
    inputType: "t2i",
    description: "Reliable all-purpose generation with readable text overlay.",
    features: [feat("Multi-Image Input", "input"), feat("4K", "resolution")],
    paramConfig: {
      ...params.resolution(["1K", "2K", "4K"]),
      ...seedreamV2Params
    }
  },
  {
    id: "seedream-4.5",
    name: "Seedream 4.5",
    modelId: "seedream_4_5",
    addedAt: "2026-02-14",
    workflow: "seedream",
    buildPayload: buildSeedream45Payload,
    estimatedTime: { "2K": 21, "4K": 58 },
    mode: "image",
    inputType: "t2i",
    description: "Detailed 4K renders with clean in-image text and dual-image input.",
    features: [feat("Multi-Image Input", "input"), feat("4K", "resolution")],
    paramConfig: {
      ...params.resolution(["2K", "4K"]),
      ...seedreamV2Params
    }
  },
  {
    id: "seedream-4.0",
    name: "Seedream 4.0",
    modelId: "seedream_4_0",
    addedAt: "2026-02-06",
    deprecated: true,
    // superseded by seedream-4.5 / seedream-5.0-lite
    workflow: "seedream",
    buildPayload: buildSeedream40Payload,
    estimatedTime: { "1K": 12, "2K": 21, "4K": 58 },
    mode: "image",
    inputType: "t2i",
    description: "Reliable all-purpose generation with readable text overlay.",
    features: [feat("Multi-Image Input", "input"), feat("4K", "resolution")],
    paramConfig: {
      ...params.resolution(["1K", "2K", "4K"]),
      ...seedreamV2Params
    }
  }
]);

// src/core/voices.ts
var DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
var GEMINI_DEFAULT_VOICE_ID = "Kore";
var DEFAULT_GROK_VOICE_ID = "eve";
var ASYNC_DEFAULT_VOICE_ID = "cca0e076-b350-4966-b570-4c2fca50b525";
var SEEDAUDIO_DEFAULT_VOICE_ID = "en_male_tim_uranus_bigtts";
function getVoiceById(id, extra) {
  return [...extra ?? [], ...getHydratedVoices()].find((v) => v.id === id);
}

// src/vendors/catalog/seedaudio.ts
var REF_MUTEX_REASON = "A named voice and audio/image references cannot be combined.";
var seedAudioParams = (catalogModelId) => ({
  ...params.prompt({ maxLength: 3e3 }),
  // Voice: a named BytePlus voice (default), OR clone from up to 3 reference
  // audios, OR one image reference. The three are mutually exclusive; the
  // payload builder prioritizes an uploaded reference over the named voice.
  ...params.voiceId(
    [],
    SEEDAUDIO_DEFAULT_VOICE_ID,
    { catalog: { workflow: "bytedance/v1/catalog/voices", modelId: catalogModelId } }
  ),
  ...params.audioInputs(3, "Reference Audios"),
  ...params.imageInput(1, "Reference Image", false),
  // Output audio configuration (nested under `audio_config` at the wire).
  ...p.enum("format", ["wav", "mp3", "pcm", "ogg_opus"], "wav", { label: "Format" }),
  ...p.enum("sampleRate", [8e3, 16e3, 24e3, 32e3, 44100, 48e3], 44100, { label: "Sample Rate" }),
  ...p.range("speechRate", -50, 100, 0, { label: "Speech Rate" }),
  ...p.range("loudnessRate", -50, 100, 0, { label: "Loudness" }),
  ...p.range("pitchRate", -12, 12, 0, { label: "Pitch" }),
  ...p.boolean("aigcWatermark", false, "Watermark")
});
var refMutexConstraints = [
  { when: { imageUrls: { exists: true } }, then: {
    voiceId: { disabled: true, reason: REF_MUTEX_REASON },
    audioUrls: { disabled: true, reason: REF_MUTEX_REASON }
  } },
  { when: { audioUrls: { exists: true } }, then: {
    voiceId: { disabled: true, reason: REF_MUTEX_REASON },
    imageUrls: { disabled: true, reason: REF_MUTEX_REASON }
  } }
];
var { MODELS: MODELS15 } = defineModels("seedaudio", [
  {
    id: "seed-audio-1.0-multilingual",
    name: "Seed Audio Multilingual",
    addedAt: "2026-07-28",
    workflow: "bytedance/text-to-speech",
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    description: "Synthesize natural speech in 20 languages \u2014 pick a named voice or clone one from a reference audio.",
    features: [
      feat("20 Languages", "characteristic"),
      feat("Voice Cloning", "characteristic"),
      feat("Reference Audio", "audio")
    ],
    paramConfig: seedAudioParams("seed-audio-1.0-multilingual"),
    constraints: refMutexConstraints
  },
  {
    id: "seed-audio-1.0",
    name: "Seed Audio",
    addedAt: "2026-07-27",
    workflow: "bytedance/text-to-speech",
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    description: "Synthesize natural English or Chinese speech \u2014 pick a named voice or clone one from a reference audio.",
    features: [feat("Voice Cloning", "characteristic"), feat("Reference Audio", "audio")],
    paramConfig: seedAudioParams("seed-audio-1.0"),
    constraints: refMutexConstraints
  }
]);

// src/vendors/catalog/seedaudio.payloads.ts
var assembleReferences = (input) => {
  const imageUrl = input.imageUrls?.[0];
  if (imageUrl) {
    return [{ image_url: imageUrl }];
  }
  if (input.audioUrls?.length) {
    return input.audioUrls.map((audioUrl) => ({ audio_url: audioUrl }));
  }
  return [{ speaker: input.voiceId ?? SEEDAUDIO_DEFAULT_VOICE_ID }];
};
var buildSeedAudioPayload = (model) => (input) => {
  const references = assembleReferences(input);
  return {
    model,
    text_prompt: input.prompt,
    // Apply the paramConfig defaults explicitly — a custom builder (unlike the
    // pass-through one) doesn't get them for free, and the advertised defaults
    // must reach the wire (e.g. sampleRate 44100, else the backend picks a
    // format-dependent default that differs from what the UI showed).
    audio_config: {
      format: input.format ?? "wav",
      sample_rate: input.sampleRate ?? 44100,
      speech_rate: input.speechRate ?? 0,
      loudness_rate: input.loudnessRate ?? 0,
      pitch_rate: input.pitchRate ?? 0
    },
    // Send the watermark flag explicitly (default false) rather than omitting it
    // when false, so the SDK setting is honored instead of the backend default.
    watermark: { aigc_watermark: input.aigcWatermark ?? false },
    ...references ? { references } : {}
  };
};
registerPayloads(MODELS15, {
  "seed-audio-1.0": buildSeedAudioPayload("seed-audio-1.0"),
  "seed-audio-1.0-multilingual": buildSeedAudioPayload("seed-audio-1.0-multilingual")
});

// src/vendors/catalog/reve.ts
var REVE_AR = ["16:9", "9:16", "1:1", "4:3", "3:4", "3:2", "2:3"];
var buildRevePayload = (ctx) => {
  const hasImages = ctx.imageUrls && ctx.imageUrls.length > 0;
  return {
    prompt: ctx.prompt,
    num_images: ctx.count ?? 1,
    ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {},
    ...hasImages ? { image_url: ctx.imageUrls[0] } : {}
  };
};
var { MODELS: MODELS16 } = defineModels("reve", [
  {
    id: "reve",
    name: "Reve",
    addedAt: "2026-02-06",
    workflow: "reve/text-to-image",
    editWorkflow: "reve/edit",
    buildPayload: buildRevePayload,
    estimatedTime: 20,
    mode: "image",
    inputType: "t2i",
    description: "Stylized 1K images with optional reference input.",
    features: [feat("Image Input", "input"), feat("1K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(REVE_AR),
      ...params.count(),
      ...params.imageInput(1, "Source Image")
    }
  }
]);

// src/vendors/catalog/grok.ts
var buildGrokT2VPayload = (ctx) => ({
  model: "grok-imagine-video",
  prompt: ctx.prompt,
  duration: ctx.duration ?? 6,
  ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {},
  ...ctx.resolution ? { resolution: ctx.resolution } : {},
  ...ctx.imageUrls?.[0] ? { image: { url: ctx.imageUrls[0] } } : {}
});
var buildGrokI2VPayload = (ctx) => ({
  model: "grok-imagine-video",
  prompt: ctx.prompt,
  ...ctx.imageUrls?.[0] ? { image: { url: ctx.imageUrls[0] } } : {},
  duration: ctx.duration ?? 6,
  ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}
});
var buildGrok15T2VPayload = (ctx) => ({
  model: "grok-imagine-video-1.5",
  prompt: ctx.prompt,
  duration: ctx.duration ?? 8,
  ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {},
  ...ctx.resolution ? { resolution: ctx.resolution } : {},
  ...ctx.imageUrls?.[0] ? { image: { url: ctx.imageUrls[0] } } : {}
});
var buildGrok15I2VPayload = (ctx) => ({
  model: "grok-imagine-video-1.5",
  prompt: ctx.prompt,
  ...ctx.imageUrls?.[0] ? { image: { url: ctx.imageUrls[0] } } : {},
  duration: ctx.duration ?? 8,
  ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}
});
var buildGrokEditVideoPayload = (ctx) => ({
  prompt: ctx.prompt,
  ...ctx.videoUrl ? { video: { url: ctx.videoUrl } } : {}
});
var buildGrokExtendVideoPayload = (ctx) => ({
  prompt: ctx.prompt,
  ...ctx.videoUrl ? { video: { url: ctx.videoUrl } } : {},
  duration: ctx.duration ?? 6
});
var buildGrokImageGenPayload = (model) => (ctx) => ({
  model,
  prompt: ctx.prompt,
  n: ctx.count ?? 1,
  ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {},
  ...ctx.resolution ? { resolution: ctx.resolution } : {}
});
var buildGrokImageEditPayload = (model) => (ctx) => {
  const urls = ctx.imageUrls ?? [];
  const imagePart2 = urls.length > 1 ? { images: urls.map((url) => ({ url })) } : urls.length === 1 ? { image: { url: urls[0] } } : {};
  return {
    model,
    prompt: ctx.prompt,
    n: ctx.count ?? 1,
    ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {},
    ...ctx.resolution ? { resolution: ctx.resolution } : {},
    ...imagePart2
  };
};
var buildGrokTTSPayload = (ctx) => ({
  text: ctx.prompt,
  language: ctx.language ?? "auto",
  voice_id: ctx.voiceId ?? DEFAULT_GROK_VOICE_ID
});
var GROK_VIDEO_PROMPT_MAX = 4096;
var GROK_VIDEO_AR = ["16:9", "9:16", "1:1", "4:3", "3:4", "3:2", "2:3"];
var GROK_IMAGE_AR = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "2:1", "1:2", "19.5:9", "9:19.5", "20:9", "9:20"];
var GROK_DURATIONS = [3, 5, 6, 8, 10, 12, 15];
var GROK_VIDEO_RESOLUTIONS = ["480p", "720p"];
var GROK_VIDEO_RESOLUTIONS_15 = ["480p", "720p", "1080p"];
var GROK_IMAGE_RESOLUTIONS = ["1k", "2k"];
var { MODELS: MODELS17 } = defineModels("grok", [
  // ── Video ─────────────────────────────────────────
  {
    id: "grok-imagine-video",
    name: "Grok Imagine 1.0",
    addedAt: "2026-02-24",
    workflow: "x-ai/v1/videos/generations",
    editWorkflow: "x-ai/v1/videos/generations",
    buildPayload: buildGrokT2VPayload,
    buildEditPayload: buildGrokI2VPayload,
    estimatedTime: 30,
    mode: "video",
    inputType: "t2v",
    badge: ["fast"],
    description: "Fastest generation pipeline \u2014 720p with audio in seconds, up to 15s.",
    features: [feat("Image Input", "input"), feat("Start Frame", "frame"), feat("Audio", "audio"), feat("720p", "resolution"), feat("15 sec", "duration")],
    paramConfig: {
      ...params.prompt({ maxLength: GROK_VIDEO_PROMPT_MAX }),
      ...params.aspectRatio(GROK_VIDEO_AR),
      ...params.resolution(GROK_VIDEO_RESOLUTIONS, "720p"),
      ...params.duration(GROK_DURATIONS, 6),
      ...params.imageInput()
    }
  },
  {
    id: "grok-imagine-video-1.5",
    name: "Grok Imagine 1.5",
    addedAt: "2026-06-02",
    workflow: "x-ai/v1/videos/generations",
    editWorkflow: "x-ai/v1/videos/generations",
    buildPayload: buildGrok15T2VPayload,
    buildEditPayload: buildGrok15I2VPayload,
    estimatedTime: 30,
    mode: "video",
    inputType: "t2v",
    badge: ["new"],
    description: "Next-gen Grok video \u2014 faster, higher fidelity, up to 15s with audio.",
    features: [feat("Image Input", "input"), feat("Audio", "audio"), feat("1080p", "resolution"), feat("15 sec", "duration")],
    paramConfig: {
      ...params.prompt({ maxLength: GROK_VIDEO_PROMPT_MAX }),
      ...params.aspectRatio(GROK_VIDEO_AR),
      ...params.resolution(GROK_VIDEO_RESOLUTIONS_15, "720p"),
      ...params.duration(GROK_DURATIONS, 8),
      ...params.imageInput(1, "Input Image", false)
    }
  },
  {
    id: "grok-edit-video",
    name: "Grok Edit Video",
    modelId: "grok-imagine-video",
    addedAt: "2026-02-06",
    workflow: "x-ai/v1/videos/edits",
    buildPayload: buildGrokEditVideoPayload,
    estimatedTime: 9,
    mode: "video",
    inputType: "v2v",
    description: "Restyle or remix an existing video with a new prompt direction.",
    features: [feat("Video Input", "input"), feat("Up to 8s", "duration")],
    paramConfig: {
      ...params.prompt({ maxLength: GROK_VIDEO_PROMPT_MAX }),
      ...params.videoInput("Source Video", "reference", true, 8)
    }
  },
  {
    id: "grok-extend-video",
    name: "Grok Extend Video",
    modelId: "grok-imagine-video",
    addedAt: "2026-04-22",
    workflow: "x-ai/v1/videos/extensions",
    buildPayload: buildGrokExtendVideoPayload,
    estimatedTime: 15,
    mode: "video",
    inputType: "v2v",
    description: "Extend an existing video forward with a new prompt \u2014 up to 10 seconds.",
    features: [feat("Video Input", "input"), feat("Up to 10s", "duration")],
    paramConfig: {
      ...params.prompt({ maxLength: GROK_VIDEO_PROMPT_MAX }),
      ...params.duration([3, 5, 6, 8, 10], 6),
      ...params.videoInput("Source Video")
    }
  },
  // ── Image ─────────────────────────────────────────
  {
    id: "grok-imagine-image",
    name: "Grok Imagine",
    addedAt: "2026-02-06",
    workflow: "x-ai/v1/images/generations",
    editWorkflow: "x-ai/v1/images/edits",
    buildPayload: buildGrokImageGenPayload("grok-imagine-image"),
    buildEditPayload: buildGrokImageEditPayload("grok-imagine-image"),
    estimatedTime: 8,
    mode: "image",
    inputType: "t2i",
    badge: ["fast"],
    description: "Rapid image creation with wide aspect-ratio selection and image input.",
    features: [feat("Image Input", "input")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(GROK_IMAGE_AR, "1:1"),
      ...params.resolution(GROK_IMAGE_RESOLUTIONS, "1k"),
      ...params.count([1, 2, 4]),
      ...params.imageInput(1, "Source Image")
    }
  },
  {
    id: "grok-imagine-image-quality",
    name: "Grok Imagine Quality",
    modelId: "grok-imagine-image-quality",
    addedAt: "2026-05-19",
    workflow: "x-ai/v1/images/generations",
    editWorkflow: "x-ai/v1/images/edits",
    buildPayload: buildGrokImageGenPayload("grok-imagine-image-quality"),
    buildEditPayload: buildGrokImageEditPayload("grok-imagine-image-quality"),
    estimatedTime: 16,
    mode: "image",
    inputType: "t2i",
    description: "Higher-fidelity Grok Imagine variant for production-grade images.",
    features: [feat("Image Input", "input"), feat("2k", "resolution")],
    paramConfig: {
      ...params.prompt({ maxLength: 8e3 }),
      ...params.aspectRatio(GROK_IMAGE_AR, "1:1"),
      ...params.resolution(GROK_IMAGE_RESOLUTIONS, "2k"),
      ...params.count([1, 2, 4]),
      ...params.imageInput(1, "Source Image")
    }
  },
  {
    id: "grok-imagine-image-2.0",
    name: "Grok Imagine 2.0",
    addedAt: "2026-08-19",
    workflow: "x-ai/v1/images/generations",
    editWorkflow: "x-ai/v1/images/edits",
    estimatedTime: 16,
    mode: "image",
    inputType: "t2i",
    description: "Latest Grok Imagine generation \u2014 sharper detail with a low/medium quality tier.",
    features: [feat("Image Input", "input"), feat("2k", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(GROK_IMAGE_AR, "1:1"),
      ...params.resolution(GROK_IMAGE_RESOLUTIONS, "1k"),
      // Vendor-side default is medium; only supported by grok-imagine-image-2.0
      // (generations only — the edits command has no quality field).
      ...p.quality(["low", "medium"], "medium"),
      ...params.count([1, 2, 4]),
      ...params.imageInput(1, "Source Image")
    }
  },
  // ── Audio ─────────────────────────────────────────
  {
    id: "grok-tts",
    name: "Grok TTS",
    modelId: "grok-tts",
    addedAt: "2026-04-21",
    workflow: "x-ai/v1/tts",
    buildPayload: buildGrokTTSPayload,
    estimatedTime: 8,
    mode: "audio",
    inputType: "tts",
    description: "Expressive text-to-speech from xAI Grok with multilingual support.",
    features: [feat("Multilingual", "characteristic"), feat("5 Voices", "characteristic")],
    paramConfig: {
      ...params.language(true),
      ...params.prompt({ maxLength: 15e3 }),
      ...params.voiceId([], DEFAULT_GROK_VOICE_ID, { catalog: { workflow: "x-ai/v1/catalog/voices" } })
    }
  }
]);

// src/vendors/catalog/grok.payloads.ts
var buildGrokImage2Payload = (input) => ({
  model: "grok-imagine-image-2.0",
  prompt: input.prompt,
  n: input.count ?? 1,
  ...input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {},
  ...input.resolution ? { resolution: input.resolution } : {},
  ...input.quality ? { quality: input.quality } : {}
});
var buildGrokImage2EditPayload = (input) => {
  const urls = input.imageUrls ?? [];
  const imagePart2 = urls.length > 1 ? { images: urls.map((url) => ({ url })) } : urls.length === 1 ? { image: { url: urls[0] } } : {};
  return {
    model: "grok-imagine-image-2.0",
    prompt: input.prompt,
    n: input.count ?? 1,
    ...input.resolution ? { resolution: input.resolution } : {},
    ...imagePart2
  };
};
registerPayloads(MODELS17, {
  "grok-imagine-image-2.0": buildGrokImage2Payload
});
registerEditPayloads(MODELS17, {
  "grok-imagine-image-2.0": buildGrokImage2EditPayload
});

// src/vendors/catalog/pika.ts
var PIKA_RATIO_MAP = {
  "16:9": 1.77,
  "9:16": 0.56,
  "1:1": 1,
  "4:5": 0.8,
  "5:4": 1.25,
  "3:2": 1.5,
  "2:3": 0.67
};
var buildPikaPayload = (ctx) => ({
  prompt: ctx.prompt,
  ...ctx.imageUrls?.[0] ? { image: ctx.imageUrls[0] } : {},
  resolution: ctx.resolution ?? "720p",
  duration: String(ctx.duration ?? 5),
  ...!ctx.imageUrls?.[0] ? { aspectRatio: PIKA_RATIO_MAP[ctx.aspectRatio ?? "16:9"] ?? 1.77 } : {}
});
var buildPikaScenesPayload = (ctx) => ({
  prompt: ctx.prompt,
  images: ctx.imageUrls ?? [],
  resolution: ctx.resolution ?? "720p",
  duration: String(ctx.duration ?? 5),
  aspectRatio: PIKA_RATIO_MAP[ctx.aspectRatio ?? "16:9"] ?? 1.77
});
var buildPikaFramesPayload = (ctx) => ({
  prompt: ctx.prompt,
  frames: ctx.imageUrls ?? [],
  resolution: ctx.resolution ?? "720p",
  duration: String(ctx.duration ?? 5),
  aspectRatio: PIKA_RATIO_MAP[ctx.aspectRatio ?? "16:9"] ?? 1.77
});
var PIKA_DURATIONS = [5, 10];
var PIKA_AR = ["16:9", "9:16", "1:1", "4:5", "5:4", "3:2", "2:3"];
var PIKA_RESOLUTIONS = ["720p", "1080p"];
var { MODELS: MODELS18 } = defineModels("pika", [
  {
    id: "pika-2.2",
    name: "Pika",
    addedAt: "2026-02-06",
    deprecated: true,
    workflow: "pika-text-to-video-v2-2",
    editWorkflow: "pika-image-to-video-v2-2",
    buildPayload: buildPikaPayload,
    estimatedTime: 50,
    editEstimatedTime: 50,
    mode: "video",
    inputType: "t2v",
    description: "Expressive animation across many visual styles from text or image.",
    features: [feat("Image Input", "input"), feat("Up to 1080p", "resolution"), feat("5/10 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(PIKA_DURATIONS, 5),
      ...params.aspectRatio(PIKA_AR),
      ...params.resolution(PIKA_RESOLUTIONS),
      ...params.imageInput()
    }
  },
  {
    id: "pika-2.2-scenes",
    name: "Pika Scenes",
    addedAt: "2026-02-06",
    deprecated: true,
    workflow: "pika-scenes-v2-2",
    buildPayload: buildPikaScenesPayload,
    estimatedTime: 55,
    mode: "video",
    inputType: "i2v",
    description: "Blend up to 4 images into a cohesive video with smooth transitions.",
    features: [feat("Multi-Image Input", "input"), feat("Up to 1080p", "resolution"), feat("5/10 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(PIKA_DURATIONS, 5),
      ...params.aspectRatio(PIKA_AR),
      ...params.resolution(PIKA_RESOLUTIONS),
      ...params.imageInput(4, "Scene Images", true)
    }
  },
  {
    id: "pika-2.2-frames",
    name: "Pika Frames",
    addedAt: "2026-02-06",
    deprecated: true,
    workflow: "pika-frames-v2-2",
    buildPayload: buildPikaFramesPayload,
    estimatedTime: 50,
    mode: "video",
    inputType: "i2v",
    description: "Morph between two keyframes with controlled in-between motion.",
    features: [feat("Multi-Image Input", "input"), feat("Up to 1080p", "resolution"), feat("5/10 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.duration(PIKA_DURATIONS, 5),
      ...params.resolution(PIKA_RESOLUTIONS),
      // aspectRatio: vendor ignores it for Frames — output aspect depends on input frames
      ...params.imageInput(2, "Start + End Frame", true)
    }
  }
]);

// src/vendors/catalog/veo.ts
function inferMimeType(url) {
  return url.match(/\.png(\?|$)/i) ? "image/png" : "image/jpeg";
}
var buildVeoPayload = (modelId, opts = {}) => (ctx) => {
  const refImages = ctx.imageUrls ?? [];
  return {
    model: modelId,
    prompt: ctx.prompt,
    count: 1,
    ...ctx.videoUrl ? { video: { url: ctx.videoUrl, mimeType: "video/mp4" } } : {
      ...ctx.startFrame ? { image: { url: ctx.startFrame, mimeType: inferMimeType(ctx.startFrame) } } : {},
      ...ctx.endFrame ? { lastFrame: { url: ctx.endFrame, mimeType: inferMimeType(ctx.endFrame) } } : {},
      ...refImages.length > 0 ? {
        referenceImages: refImages.slice(0, 3).map((url) => ({
          image: { url, mimeType: inferMimeType(url) },
          referenceType: "asset"
        }))
      } : {}
    },
    ...ctx.negativePrompt ? { negativePrompt: ctx.negativePrompt } : {},
    parameters: {
      resolution: ctx.resolution ?? "720p",
      aspectRatio: ctx.aspectRatio ?? "16:9",
      durationSeconds: ctx.videoUrl ? 7 : ctx.duration ?? 8,
      ...opts.withAudio ? { generateAudio: ctx.generateAudio ?? true } : {}
    }
  };
};
var veoParamConfig = {
  ...params.prompt(),
  ...params.aspectRatio(["16:9", "9:16"]),
  ...params.duration([4, 6, 8], 8),
  ...params.resolution(["720p", "1080p", "4k"]),
  ...params.imageInput(3, "Reference Images"),
  ...params.generateAudio(),
  ...params.negativePrompt(),
  ...params.startFrame(),
  ...params.endFrame()
};
var FRAME_REF_REASON = "Reference images cannot be combined with start and last frame images";
var veoConstraints = [
  { when: { imageUrls: { exists: true } }, then: { duration: { allowed: [8], reason: "Reference images require 8s duration" } } },
  { when: { resolution: { is: "4k" } }, then: { duration: { allowed: [8], reason: "4K requires 8s duration" } } },
  { when: { resolution: { is: "1080p" } }, then: { duration: { allowed: [8], reason: "1080p requires 8s duration" } } },
  { when: { startFrame: { exists: true } }, then: { imageUrls: { disabled: true, reason: FRAME_REF_REASON } } },
  { when: { endFrame: { exists: true } }, then: { imageUrls: { disabled: true, reason: FRAME_REF_REASON } } },
  { when: { imageUrls: { exists: true } }, then: {
    startFrame: { disabled: true, reason: FRAME_REF_REASON },
    endFrame: { disabled: true, reason: FRAME_REF_REASON }
  } }
];
var veoLiteParamConfig = {
  ...params.prompt(),
  ...params.aspectRatio(["16:9", "9:16"]),
  ...params.duration([4, 6, 8], 8),
  ...params.resolution(["720p", "1080p"]),
  ...params.startFrame()
  // endFrame intentionally omitted — Lite preview API rejects `lastFrame`.
};
var veoLiteConstraints = [
  { when: { resolution: { is: "1080p" } }, then: { duration: { allowed: [8], reason: "1080p supports 8s only" } } }
];
var { MODELS: MODELS19 } = defineModels("google", [
  {
    id: "veo-3.1",
    name: "Veo 3.1",
    modelId: "veo-3.1-generate-001",
    addedAt: "2026-02-06",
    workflow: "veo-t2v",
    buildPayload: buildVeoPayload("veo-3.1-generate-001", { withAudio: true }),
    estimatedTime: { "720p": 40, "1080p": 80, "4k": 138 },
    mode: "video",
    inputType: "t2v",
    badge: ["popular", "premium"],
    description: "4K video with built-in audio \u2014 voices, music, and effects match every scene.",
    features: [feat("Start/End Frame", "frame"), feat("Reference Images", "input"), feat("4K", "resolution"), feat("Audio", "audio"), feat("4/6/8 sec", "duration")],
    paramConfig: veoParamConfig,
    constraints: veoConstraints
  },
  {
    id: "veo-3.1-fast",
    name: "Veo 3.1 Fast",
    modelId: "veo-3.1-fast-generate-001",
    addedAt: "2026-02-06",
    workflow: "veo-t2v",
    buildPayload: buildVeoPayload("veo-3.1-fast-generate-001", { withAudio: true }),
    estimatedTime: { "720p": 40, "1080p": 60, "4k": 80 },
    mode: "video",
    inputType: "t2v",
    badge: ["popular", "fast"],
    description: "Quick 4K video with synchronized audio for rapid iteration.",
    features: [feat("Start/End Frame", "frame"), feat("Reference Images", "input"), feat("4K", "resolution"), feat("Audio", "audio"), feat("4/6/8 sec", "duration")],
    paramConfig: veoParamConfig,
    constraints: veoConstraints
  },
  {
    id: "veo-3.1-lite",
    name: "Veo 3.1 Lite",
    modelId: "veo-3.1-lite-generate-preview",
    addedAt: "2026-04-02",
    workflow: "veo-t2v",
    buildPayload: buildVeoPayload("veo-3.1-lite-generate-preview"),
    estimatedTime: { "720p": 10, "1080p": 25 },
    mode: "video",
    inputType: "t2v",
    badge: ["fast"],
    description: "Lightweight video with built-in audio \u2014 fast and affordable, 720p/1080p",
    features: [feat("Start Frame", "frame"), feat("Audio", "audio"), feat("1080p", "resolution"), feat("4/6/8 sec", "duration")],
    paramConfig: veoLiteParamConfig,
    constraints: veoLiteConstraints
  }
]);

// src/vendors/catalog/runway.ts
var RUNWAY_AVATAR_PRESETS = [
  "Game Character",
  "Music Superstar",
  "Game Character Man",
  "Cat Character",
  "Influencer",
  "Tennis Coach",
  "Human Resource",
  "Fashion Designer",
  "Cooking Teacher"
].map((name) => ({ id: name.toLowerCase().replace(/ /g, "-"), label: name }));
var RUNWAY_RATIO_MAP = {
  "16:9": "1280:720",
  "9:16": "720:1280"
};
var RUNWAY_REF_RATIO_MAP = {
  "16:9": "1920:1080",
  "9:16": "1080:1920"
};
var RUNWAY_GEN3A_RATIO_MAP = {
  "16:9": "1280:768",
  "9:16": "768:1280"
};
var buildRunwayGen45Payload = (ctx) => ({
  promptText: ctx.prompt,
  ...ctx.imageUrls?.[0] ? { promptImage: [{ uri: ctx.imageUrls[0], position: "first" }] } : {},
  ratio: RUNWAY_RATIO_MAP[ctx.aspectRatio ?? "16:9"] ?? "1280:720",
  duration: ctx.duration ?? 5
});
var buildRunwayAlephPayload = (ctx) => ({
  model: "gen4_aleph",
  promptText: ctx.prompt,
  videoUri: ctx.videoUrl,
  ratio: RUNWAY_RATIO_MAP[ctx.aspectRatio ?? "16:9"] ?? "1280:720"
});
var buildRunwayAleph2AlphaPayload = (ctx) => ({
  model: "aleph2",
  promptText: ctx.prompt,
  videoUri: ctx.videoUrl,
  ratio: RUNWAY_RATIO_MAP[ctx.aspectRatio ?? "16:9"] ?? "1280:720",
  ...ctx.startFrame || ctx.endFrame ? {
    promptImage: [
      ...ctx.startFrame ? [{ uri: ctx.startFrame, position: "first" }] : [],
      ...ctx.endFrame ? [{ uri: ctx.endFrame, position: "last" }] : []
    ]
  } : {}
});
var buildRunwayGen4RefPayload = (ctx) => ({
  promptText: ctx.prompt,
  referenceImages: (ctx.imageUrls ?? []).map((url) => ({ uri: url })),
  ratio: RUNWAY_REF_RATIO_MAP[ctx.aspectRatio ?? "16:9"] ?? "1920:1080"
});
var runwayAvatarVideoConstraints = [
  {
    when: { audioUrl: { exists: true } },
    then: {
      voiceId: { disabled: true, reason: "Voice comes from the attached audio file" },
      prompt: { disabled: true, reason: "Prompt is ignored when audio is attached" }
    }
  }
];
var buildRunwayAvatarVideoPayload = (ctx) => {
  const isAudioMode = !!ctx.audioUrl;
  return {
    avatarType: "runway-preset",
    presetId: ctx.style ?? "game-character",
    speechType: isAudioMode ? "audio" : "text",
    ...isAudioMode ? { audio: ctx.audioUrl } : {
      text: ctx.prompt,
      ...ctx.voiceId ? { voice: { type: "preset", presetId: ctx.voiceId } } : {}
    }
  };
};
var buildRunwayGen3aTurboPayload = (ctx) => ({
  promptText: ctx.prompt,
  model: "gen3a_turbo",
  seed: Math.floor(Math.random() * 2147483647),
  promptImage: [
    ...ctx.startFrame ? [{ uri: ctx.startFrame, position: "first" }] : [],
    ...ctx.endFrame ? [{ uri: ctx.endFrame, position: "last" }] : []
  ],
  ratio: RUNWAY_GEN3A_RATIO_MAP[ctx.aspectRatio ?? "16:9"] ?? "1280:768",
  duration: ctx.duration ?? 5
});
var { MODELS: MODELS20 } = defineModels("runway", [
  {
    id: "runway-avatar-video",
    name: "Runway Avatar",
    addedAt: "2026-04-17",
    workflow: "runway/avatar/video",
    buildPayload: buildRunwayAvatarVideoPayload,
    constraints: runwayAvatarVideoConstraints,
    estimatedTime: 120,
    mode: "video",
    inputType: "t2v",
    description: "Generate speaking avatar videos from preset characters with natural lip-sync.",
    features: [feat("Audio Input", "audio")],
    paramConfig: {
      ...params.style(RUNWAY_AVATAR_PRESETS, "game-character"),
      ...params.voiceId([], "victoria", { catalog: { workflow: "runway/v1/catalog/voices" } }),
      ...params.prompt({ maxLength: 1500, placeholder: "Write the script your avatar will speak...", required: false }),
      ...params.audioInput("Audio Track")
    }
  },
  {
    id: "runway-gen3a-turbo",
    name: "Runway Gen-3 Alpha Turbo",
    addedAt: "2026-03-08",
    deprecated: true,
    // superseded by runway-gen45-t2v / runway-gen4-ref
    workflow: "runway-video-generate",
    buildPayload: buildRunwayGen3aTurboPayload,
    estimatedTime: 20,
    mode: "video",
    inputType: "i2v",
    description: "Fast I2V generation with start/end frame interpolation \u2014 ideal for controllable motion.",
    features: [feat("Start/End Frame", "frame"), feat("5/10 sec", "duration")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e3 }),
      ...params.duration([5, 10], 5),
      ...params.aspectRatio(["16:9", "9:16"]),
      ...params.startFrame("Start Frame", true),
      ...params.endFrame()
    }
  },
  {
    id: "runway-gen4.5",
    name: "Runway Gen 4.5",
    addedAt: "2026-02-06",
    workflow: "runway-gen4-5-text-to-video",
    editWorkflow: "runway-gen4-5-image-to-video",
    buildPayload: buildRunwayGen45Payload,
    estimatedTime: 24,
    editEstimatedTime: 36,
    mode: "video",
    inputType: "t2v",
    badge: ["premium"],
    description: "Photorealistic motion at 1080p with nuanced camera and lighting.",
    features: [feat("Image Input", "input"), feat("1080p", "resolution"), feat("5/8/10 sec", "duration")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e3 }),
      ...params.duration([5, 8, 10], 5),
      ...params.aspectRatio(["16:9", "9:16"]),
      ...params.imageInput()
    }
  },
  {
    id: "runway-gen4-aleph",
    name: "Runway Aleph",
    addedAt: "2026-02-06",
    deprecated: true,
    // Runway deprecates gen4_aleph on 2026-07-30; superseded by runway-aleph2
    workflow: "runway-aleph",
    buildPayload: buildRunwayAlephPayload,
    estimatedTime: 135,
    mode: "video",
    inputType: "v2v",
    description: "Transform or enhance existing video content through restyling.",
    features: [feat("Video Input", "input")],
    paramConfig: { ...params.prompt({ maxLength: 1e3 }), ...params.videoInput("Source Video", "reference", true, 30) }
  },
  {
    id: "runway-aleph2",
    name: "Runway Aleph 2",
    addedAt: "2026-06-01",
    workflow: "runway-aleph",
    buildPayload: buildRunwayAleph2AlphaPayload,
    estimatedTime: 135,
    mode: "video",
    inputType: "v2v",
    description: "Next-gen video restyling with keyframe image guidance for precise motion and style control.",
    features: [feat("Video Input", "input"), feat("Start/End Frame", "frame")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e3 }),
      ...params.videoInput("Source Video", "reference", true, 30),
      ...params.startFrame(),
      ...params.endFrame()
    }
  },
  {
    id: "runway-gen4-ref",
    name: "Runway Gen4 Ref",
    addedAt: "2026-02-06",
    workflow: "runway-gen4-image-ref",
    buildPayload: buildRunwayGen4RefPayload,
    estimatedTime: 6,
    mode: "image",
    inputType: "i2i",
    description: "Generate a still image from up to 3 reference images with consistent identity.",
    features: [feat("Image Input", "input"), feat("1080p", "resolution")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e3 }),
      ...params.aspectRatio(["16:9", "9:16"]),
      ...params.imageInput(3, "Reference Images", true)
    }
  }
]);

// src/vendors/catalog/flux.ts
var FLUX_AR_TO_SIZE = {
  "1:1": "1024x1024",
  "5:3": "1280x768",
  "3:5": "768x1280",
  "4:3": "1024x768",
  "3:4": "768x1024"
};
var fluxAspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"];
var fluxResolutions = ["1K", "2K", "4K"];
var buildFluxV2Payload = (modelId) => (ctx) => ({
  prompt: ctx.prompt,
  model: modelId,
  count: ctx.count ?? 1,
  imageUrls: ctx.imageUrls ?? [],
  resolution: ctx.resolution ?? "1K",
  aspectRatio: ctx.aspectRatio ?? "1:1",
  ...ctx.guidance != null ? { guidance: ctx.guidance } : {},
  ...ctx.seed != null ? { seed: ctx.seed } : {}
});
function normalizeAspectRatio(aspect) {
  if (!aspect) return null;
  const raw = String(aspect).trim();
  if (!raw) return null;
  if (raw.startsWith("ASPECT_")) {
    return raw.replace("ASPECT_", "").replace("_", ":");
  }
  return raw;
}
function inferAspectFromSize(size) {
  if (!size) return null;
  const m = String(size).match(/^(\d+)x(\d+)$/i);
  if (!m) return null;
  const w = Number(m[1]);
  const h = Number(m[2]);
  if (!w || !h) return null;
  return `${w}:${h}`;
}
var buildFluxKontextPayload = (modelId) => (ctx) => {
  const aspectRatio = normalizeAspectRatio(ctx.aspectRatio) || inferAspectFromSize(ctx.size);
  return {
    prompt: ctx.prompt,
    model: modelId,
    count: ctx.count ?? 1,
    imageUrls: ctx.imageUrls ?? [],
    ...aspectRatio ? { aspectRatio } : {}
  };
};
var fluxV2Base = {
  workflow: "bfl/v1/flux-2",
  mode: "image",
  inputType: "t2i"
};
var fluxKontextBase = {
  workflow: "bfl/v1/flux-kontext",
  mode: "image",
  inputType: "t2i"
};
var flux3VideoConstraints = [
  { when: { draft: { is: true } }, then: {
    resolution: { allowed: ["hd"], reason: "Draft mode only supports HD resolution." }
  } }
];
var { MODELS: MODELS21 } = defineModels("flux", [
  {
    ...fluxV2Base,
    id: "flux-2-pro",
    name: "Flux 2 Pro",
    modelId: "flux-2-pro",
    addedAt: "2026-02-06",
    buildPayload: buildFluxV2Payload("flux-2-pro"),
    estimatedTime: 19,
    description: "Sharp images up to 4K with fine-tuned color accuracy and detail.",
    features: [feat("Multi-Image Input", "input"), feat("4K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(fluxAspectRatios, "4:3"),
      ...params.resolution(fluxResolutions, "1K"),
      ...params.count(),
      ...params.imageInput(4, "Source Images")
    }
  },
  {
    ...fluxV2Base,
    id: "flux-2-max",
    name: "Flux 2 Max",
    modelId: "flux-2-max",
    addedAt: "2026-02-06",
    buildPayload: buildFluxV2Payload("flux-2-max"),
    estimatedTime: 27,
    description: "Maximum detail for intricate compositions and demanding scenes.",
    features: [feat("Image Input", "input"), feat("4K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(fluxAspectRatios, "1:1"),
      ...params.resolution(fluxResolutions, "1K"),
      ...params.count(),
      ...params.imageInput(1, "Source Image")
    }
  },
  {
    ...fluxV2Base,
    id: "flux-2-flex",
    name: "Flux 2 Flex",
    modelId: "flux-2-flex",
    addedAt: "2026-02-06",
    buildPayload: buildFluxV2Payload("flux-2-flex"),
    estimatedTime: 15,
    description: "Adaptable generation across varied visual styles up to 4K.",
    features: [feat("Image Input", "input"), feat("4K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(fluxAspectRatios, "3:4"),
      ...params.resolution(fluxResolutions, "1K"),
      ...params.count(),
      ...params.imageInput(1, "Source Image")
    }
  },
  {
    ...fluxKontextBase,
    id: "flux-kontext-max",
    name: "Flux Kontext Max",
    modelId: "flux-kontext-max",
    addedAt: "2026-02-06",
    buildPayload: buildFluxKontextPayload("flux-kontext-max"),
    estimatedTime: 15,
    description: "Edit and compose from up to 4 reference images with context awareness.",
    features: [feat("Multi-Image Input", "input")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"], "1:1"),
      ...params.count(),
      ...params.imageInput(4, "Source Images")
    }
  },
  {
    ...fluxKontextBase,
    id: "flux-kontext-pro",
    name: "Flux Kontext Pro",
    modelId: "flux-kontext-pro",
    addedAt: "2026-02-06",
    buildPayload: buildFluxKontextPayload("flux-kontext-pro"),
    estimatedTime: 15,
    badge: ["fast"],
    description: "Single-image context-aware editing and generation \u2014 fast.",
    features: [feat("Image Input", "input")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"], "1:1"),
      ...params.count(),
      ...params.imageInput(1, "Source Image")
    }
  },
  {
    // Single workflow `flux/v1/video` derives its mode from the input it's
    // given: none → t2v, keyframe images → i2v, a start video → v2v. No
    // editWorkflow needed. Payload assembly lives in flux.payloads.ts.
    id: "flux-3-video",
    name: "Flux 3 Video",
    workflow: "flux/v1/video",
    mode: "video",
    inputType: "t2v",
    addedAt: "2026-07-27",
    estimatedTime: 120,
    constraints: flux3VideoConstraints,
    description: "Text-to-video with synchronized audio, plus image-to-video (animate up to 10 images) and video continuation.",
    features: [
      feat("Image & Video Input", "input"),
      feat("Audio", "audio"),
      feat("Up to 20s", "duration"),
      feat("1080p", "resolution")
    ],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(["auto", "21:9", "2:1", "16:9", "4:3", "1:1", "3:4", "9:16"], "auto"),
      ...params.resolution(["hd", "fhd"], "hd"),
      // 'auto' lets the model fit length; or a whole number of seconds (5–20).
      ...p.enum("duration", ["auto", "5", "10", "15", "20"], "auto", { label: "Duration" }),
      // keyframes (i2v): 1–10 images to animate. Providing these selects i2v mode.
      ...params.imageInput(10, "Images", false, "asset"),
      // startVideo (v2v): continue from a clip's final frames.
      ...params.videoInput("Start Video", "asset", false, 15),
      ...params.generateAudio(true),
      // Moderation level: 0 (strict) … 4 (permissive).
      ...p.range("safetyTolerance", 0, 4, 2, { label: "Safety Tolerance" }),
      // draft: fast low-step preview.
      ...p.boolean("draft", false, "Draft")
    }
  },
  {
    // Pure pass-through: the worker Command takes the SDK's own field names
    // (videoUrl, upscaleFactor, creativity, prompt, safetyTolerance) — no
    // payload builder needed. webhookUrl is polling plumbing, not surfaced
    // (same as flux-3-video).
    id: "flux-video-upscale",
    name: "Flux Video Upscale",
    workflow: "flux/v1/video-upscale",
    mode: "video",
    inputType: "v2v",
    addedAt: "2026-08-28",
    estimatedTime: 180,
    description: "Upscale videos toward 4K (1.5x\u20133x) in precise (source-faithful) or creative (detail-enhancing) mode. Source clips up to 20 seconds and 2K.",
    features: [
      feat("Upscale", "quality"),
      feat("Video Required", "input"),
      feat("Up to 4K", "resolution")
    ],
    paramConfig: {
      // Vendor source caps: 20s, 50 MB, 2560x1440 (2K).
      ...params.videoInput("Source Video", "asset", true, 20, 1440, 50 * 1024 * 1024),
      ...p.range("upscaleFactor", 1.5, 3, 2, { step: 0.5, label: "Upscale Factor" }),
      // Vendor switch: 0 preserves the source precisely; 1 (default) allows
      // creative detail enhancement and is the more expensive pricing tier.
      ...p.enum("creativity", [{ id: 0, label: "Precise" }, { id: 1, label: "Creative" }], 1, { label: "Creativity" }),
      ...params.prompt({ required: false }),
      // Moderation level: 0 (strict) … 4 (permissive).
      ...p.range("safetyTolerance", 0, 4, 2, { label: "Safety Tolerance" })
    }
  }
]);

// src/vendors/catalog/flux.payloads.ts
var buildFlux3VideoPayload = (input) => {
  const duration = input.duration && input.duration !== "auto" ? Number(input.duration) : "auto";
  return {
    prompt: input.prompt,
    aspectRatio: input.aspectRatio ?? "auto",
    resolution: input.resolution ?? "hd",
    duration,
    generateAudio: input.generateAudio ?? true,
    safetyTolerance: input.safetyTolerance ?? 2,
    // keyframes (i2v): 1–10 images to animate.
    ...input.imageUrls?.length ? { keyframes: input.imageUrls } : {},
    // startVideo (v2v): continue from a clip's final frames.
    ...input.videoUrl ? { startVideo: input.videoUrl } : {},
    // draft: fast low-step preview.
    ...input.draft ? { draft: input.draft } : {}
  };
};
registerPayloads(MODELS21, {
  "flux-3-video": buildFlux3VideoPayload
});

// src/vendors/catalog/gemini.ts
function buildThinkingConfig(ctx) {
  const tc = {};
  if (ctx.thinkingLevel) tc.thinkingLevel = ctx.thinkingLevel.toUpperCase();
  if (ctx.thinkingBudget != null) tc.thinkingBudget = ctx.thinkingBudget;
  return Object.keys(tc).length ? { thinkingConfig: tc } : {};
}
var buildGemini3ProImagePayload = (ctx) => ({
  prompt: ctx.prompt,
  model: "gemini-3-pro-image-preview",
  count: ctx.count ?? 1,
  ...ctx.imageUrls?.length ? { imageUrls: ctx.imageUrls } : {},
  aspectRatio: ctx.aspectRatio ?? "1:1",
  imageSize: ctx.resolution ?? "2K",
  ...buildThinkingConfig(ctx)
});
var buildGeminiFlashImagePayload = (ctx) => ({
  prompt: ctx.prompt,
  model: "gemini-2.5-flash-image",
  count: ctx.count ?? 1,
  ...ctx.imageUrls?.length ? { imageUrls: ctx.imageUrls } : {},
  aspectRatio: ctx.aspectRatio ?? "16:9"
});
var buildGemini31FlashImagePayload = (ctx) => ({
  prompt: ctx.prompt,
  model: "gemini-3.1-flash-image-preview",
  count: ctx.count ?? 1,
  ...ctx.imageUrls?.length ? { imageUrls: ctx.imageUrls } : {},
  aspectRatio: ctx.aspectRatio ?? "1:1",
  imageSize: ctx.resolution ?? "1K",
  ...buildThinkingConfig(ctx)
});
var buildGemini31FlashLiteImagePayload = (ctx) => ({
  prompt: ctx.prompt,
  model: "gemini-3.1-flash-lite-image",
  count: ctx.count ?? 1,
  ...ctx.imageUrls?.length ? { imageUrls: ctx.imageUrls } : {},
  aspectRatio: ctx.aspectRatio ?? "1:1",
  imageSize: ctx.resolution ?? "1K",
  ...buildThinkingConfig(ctx)
});
var buildGeminiTTSPayload = (ctx) => ({
  text: ctx.prompt,
  model: ctx.modelId ?? "gemini-2.5-flash-tts",
  voiceName: ctx.voiceId ?? "Kore"
});
function inferMimeType2(url) {
  return url.match(/\.png(\?|$)/i) ? "image/png" : "image/jpeg";
}
var buildGeminiOmniVideoPayload = (ctx) => ({
  prompt: ctx.prompt,
  model: "gemini-omni-flash-preview",
  ...ctx.aspectRatio ? { aspectRatio: ctx.aspectRatio } : {},
  ...ctx.duration ? { durationSeconds: ctx.duration } : {},
  ...ctx.imageUrls?.[0] ? { image: { url: ctx.imageUrls[0], mimeType: inferMimeType2(ctx.imageUrls[0]) } } : {},
  ...ctx.videoUrl ? { video: { url: ctx.videoUrl } } : {}
});
var GEMINI_AR_WIDE = ["1:1", "16:9", "9:16", "3:4", "4:3", "2:3", "21:9"];
var thinkingLevelParam = {
  thinkingLevel: {
    label: "Thinking",
    descriptor: {
      kind: "enum",
      valueType: "string",
      options: [
        { id: "minimal", label: "Minimal (faster)" },
        { id: "high", label: "High (more reasoning)" }
      ],
      default: "minimal"
    }
  }
};
var thinkingBudgetParam = {
  thinkingBudget: {
    label: "Thinking Budget",
    descriptor: { kind: "range", min: 128, max: 24576, step: 128, default: 128 }
  }
};
var { MODELS: MODELS22 } = defineModels("google", [
  // ── Image ─────────────────────────────────────────────────────────
  {
    id: "gemini-3.1-flash-image",
    addedAt: "2026-02-26",
    name: "Nano Banana 2",
    specName: "Gemini 3.1 Flash Image",
    workflow: "gemini/v2/images",
    buildPayload: buildGemini31FlashImagePayload,
    estimatedTime: { "0.5K": 12, "1K": 22, "2K": 46, "4K": 92 },
    mode: "image",
    inputType: "t2i",
    modelId: "gemini-3.1-flash-image-preview",
    badge: ["hot", "fast"],
    description: "Fast 4K generation with accurate text and search-grounded accuracy.",
    features: [feat("Multi-Image Input", "input"), feat("4K", "resolution"), feat("Text Rendering", "characteristic")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(["1:1", "16:9", "9:16", "3:4", "4:3", "3:2", "2:3", "4:5", "5:4", "4:1", "1:4", "8:1", "1:8", "21:9"], "1:1"),
      ...params.resolution(["0.5K", "1K", "2K", "4K"], "1K"),
      ...params.count(),
      ...thinkingLevelParam,
      ...params.imageInput(14, "Source Images")
    }
  },
  {
    id: "gemini-3.1-flash-lite-image",
    addedAt: "2026-07-01",
    name: "Nano Banana 2 Lite",
    specName: "Gemini 3.1 Flash Lite Image",
    workflow: "gemini/v2/images",
    buildPayload: buildGemini31FlashLiteImagePayload,
    estimatedTime: 14,
    mode: "image",
    inputType: "t2i",
    modelId: "gemini-3.1-flash-lite-image",
    badge: ["fast"],
    description: "Lightweight Nano Banana 2 variant for faster, high-volume image generation.",
    features: [feat("Multi-Image Input", "input"), feat("Text Rendering", "characteristic")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(["1:1", "16:9", "9:16", "3:4", "4:3", "3:2", "2:3", "4:5", "5:4", "4:1", "1:4", "8:1", "1:8", "21:9"], "1:1"),
      ...params.count(),
      ...thinkingLevelParam,
      ...params.imageInput(14, "Source Images")
    }
  },
  {
    id: "gemini-3-pro-image",
    addedAt: "2026-02-06",
    name: "Nano Banana Pro",
    specName: "Gemini 3 Pro Image",
    workflow: "gemini/v2/images",
    buildPayload: buildGemini3ProImagePayload,
    estimatedTime: { "0.5K": 15, "1K": 30, "2K": 57, "4K": 74 },
    mode: "image",
    inputType: "t2i",
    modelId: "gemini-3-pro-image-preview",
    badge: ["popular", "premium"],
    description: "Top-tier 4K images with precise multilingual text rendering.",
    features: [feat("Multi-Image Input", "input"), feat("4K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio([...GEMINI_AR_WIDE], "1:1"),
      ...params.resolution(["1K", "2K", "4K"], "2K"),
      ...params.count(),
      ...thinkingBudgetParam,
      ...params.imageInput(14, "Source Images")
    }
  },
  {
    id: "gemini-2.5-flash-image",
    addedAt: "2026-02-06",
    name: "Nano Banana",
    specName: "Gemini 2.5 Flash Image",
    workflow: "gemini/v2/images",
    buildPayload: buildGeminiFlashImagePayload,
    estimatedTime: 17,
    mode: "image",
    inputType: "t2i",
    modelId: "gemini-2.5-flash-image",
    badge: ["popular", "fast"],
    description: "Quick, lightweight image creation for high-volume workflows.",
    features: [feat("Multi-Image Input", "input"), feat("1K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio([...GEMINI_AR_WIDE], "16:9"),
      ...params.count(),
      ...params.imageInput(14, "Source Images")
    }
  },
  // ── Audio ─────────────────────────────────────────────────────────
  {
    id: "gemini-2.5-flash-tts",
    name: "Gemini 2.5 Flash TTS",
    addedAt: "2026-02-15",
    workflow: "gemini/v1/audios",
    buildPayload: buildGeminiTTSPayload,
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    modelId: "gemini-2.5-flash-tts",
    description: "Google Gemini native text-to-speech with expressive multilingual voices.",
    features: [feat("Multilingual", "characteristic"), feat("30 Voices", "characteristic")],
    paramConfig: {
      ...params.language(true),
      // 6,000 boundary-verified against the live gemini/v1/audios worker
      // (accepts >5,000; see scripts/api-tests/audio-charlimit-boundary-probe.mjs).
      ...params.prompt({ maxLength: 6e3 }),
      ...params.voiceId([], GEMINI_DEFAULT_VOICE_ID, { catalog: { workflow: "gemini/v1/catalog/voices" } })
    }
  },
  {
    id: "gemini-2.5-pro-tts",
    name: "Gemini 2.5 Pro TTS",
    addedAt: "2026-03-18",
    workflow: "gemini/v1/audios",
    buildPayload: buildGeminiTTSPayload,
    estimatedTime: 20,
    mode: "audio",
    inputType: "tts",
    modelId: "gemini-2.5-pro-tts",
    badge: ["premium"],
    description: "Premium Gemini TTS with richer expressiveness and multi-speaker support.",
    features: [feat("Multilingual", "characteristic"), feat("30 Voices", "characteristic"), feat("Multi-Speaker", "characteristic")],
    paramConfig: {
      ...params.language(true),
      // 6,000 boundary-verified against the live gemini/v1/audios worker
      // (accepts >5,000; see scripts/api-tests/audio-charlimit-boundary-probe.mjs).
      ...params.prompt({ maxLength: 6e3 }),
      ...params.voiceId([], GEMINI_DEFAULT_VOICE_ID, { catalog: { workflow: "gemini/v1/catalog/voices" } })
    }
  },
  // ── Video ─────────────────────────────────────────────────────────
  {
    id: "gemini-omni-flash-preview",
    name: "Gemini Omni",
    addedAt: "2026-06-24",
    workflow: "gemini-omni/video",
    buildPayload: buildGeminiOmniVideoPayload,
    estimatedTime: 40,
    mode: "video",
    inputType: "t2v",
    description: "Google Gemini multimodal video \u2014 text, image, or video as input.",
    features: [feat("Source Image", "input"), feat("Source Video", "input"), feat("3\u201310 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(["16:9", "9:16"]),
      ...p.enum("duration", [3, 5, 6, 8, 10], 8, { label: "Duration (seconds)" }),
      ...params.imageInput(1, "Source Image", false, "asset"),
      ...params.videoInput("Source Video", "asset", false)
    }
  },
  {
    id: "gemini-omni-1.1-flash-preview",
    name: "Gemini Omni 1.1 Flash",
    specName: "Gemini Omni 1.1 Flash Preview",
    addedAt: "2026-08-27",
    workflow: "gemini-omni/video",
    estimatedTime: { "360p": 30, "720p": 40, "1080p": 60, "4k": 90 },
    mode: "video",
    inputType: "t2v",
    description: "Gemini Omni with frame interpolation, video extension, reference-guided generation, and up to 4K output.",
    features: [feat("Start/End Frame", "input"), feat("Reference Images & Videos", "input"), feat("Video Extension", "input"), feat("4K", "resolution"), feat("3\u201310 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(["16:9", "9:16"], "16:9"),
      ...params.resolution(["360p", "720p", "1080p", "4k"], "720p"),
      ...params.duration([3, 4, 5, 6, 7, 8, 9, 10], 8),
      ...params.startFrame("Start Frame"),
      ...params.endFrame("End Frame"),
      ...params.imageInput(5, "Reference Images", false, "reference"),
      // Extension source: the worker extends the clip by up to 10s; input must be under 30s.
      ...params.videoInput("Source Video", "asset", false, 30),
      ...params.videoInputs(3, "Reference Videos")
    }
  }
]);

// src/vendors/catalog/gemini.payloads.ts
function inferMimeType3(url) {
  return url.match(/\.png(\?|$)/i) ? "image/png" : "image/jpeg";
}
var toImage = (url) => ({ url, mimeType: inferMimeType3(url) });
var buildOmniFlash11Payload = (input) => ({
  prompt: input.prompt,
  model: "gemini-omni-1.1-flash-preview",
  // Materialize the catalog defaults so direct SDK calls send the advertised
  // values rather than relying on the worker/vendor defaults.
  aspectRatio: input.aspectRatio ?? "16:9",
  durationSeconds: input.duration ?? 8,
  resolution: input.resolution ?? "720p",
  ...input.startFrame ? { image: toImage(input.startFrame) } : {},
  ...input.endFrame ? { lastFrame: toImage(input.endFrame) } : {},
  ...input.imageUrls?.length ? { referenceImages: input.imageUrls.map(toImage) } : {},
  ...input.videoUrl ? { video: { url: input.videoUrl } } : {},
  ...input.videoUrls?.length ? { referenceVideos: input.videoUrls.map((url) => ({ url })) } : {}
});
registerPayloads(MODELS22, {
  "gemini-omni-1.1-flash-preview": buildOmniFlash11Payload
});

// src/vendors/catalog/openai.ts
var GPT_IMAGE_AR_TO_SIZE = {
  "1:1": "1024x1024",
  "3:2": "1536x1024",
  "2:3": "1024x1536",
  "16:9": "1536x1024",
  // closest supported landscape
  "9:16": "1024x1536",
  // closest supported portrait
  "4:3": "1536x1024",
  "3:4": "1024x1536"
};
var GPT_IMAGE_2_AR_TO_SIZE = {
  "1:1": "1024x1024",
  "3:2": "1536x1024",
  "2:3": "1024x1536",
  "16:9": "1824x1024",
  "9:16": "1024x1824",
  "4:3": "1360x1024",
  "3:4": "1024x1360"
};
var buildGptImage1Payload = (ctx) => ({
  prompt: ctx.prompt,
  model: "gpt-image-1",
  n: ctx.count ?? 1,
  size: ctx.size ?? GPT_IMAGE_AR_TO_SIZE[ctx.aspectRatio ?? ""] ?? "1024x1024",
  quality: ctx.quality ?? "high",
  ...ctx.background ? { background: ctx.background } : {},
  ...ctx.outputFormat ? { output_format: ctx.outputFormat } : {}
});
var buildGptImage1EditPayload = (ctx) => ({
  prompt: ctx.prompt,
  model: "gpt-image-1",
  images: ctx.imageUrls ?? [],
  n: ctx.count ?? 1,
  size: ctx.size ?? GPT_IMAGE_AR_TO_SIZE[ctx.aspectRatio ?? ""] ?? "1024x1024",
  quality: ctx.quality ?? "high",
  ...ctx.background ? { background: ctx.background } : {},
  ...ctx.outputFormat ? { output_format: ctx.outputFormat } : {}
});
var buildGptImage15Payload = (ctx) => ({
  prompt: ctx.prompt,
  model: "gpt-image-1.5",
  n: ctx.count ?? 1,
  size: ctx.size ?? GPT_IMAGE_AR_TO_SIZE[ctx.aspectRatio ?? ""] ?? "1024x1024",
  quality: ctx.quality ?? "high",
  ...ctx.background ? { background: ctx.background } : {},
  ...ctx.outputFormat ? { output_format: ctx.outputFormat } : {}
});
var buildGptImage15EditPayload = (ctx) => ({
  prompt: ctx.prompt,
  model: "gpt-image-1.5",
  images: ctx.imageUrls ?? [],
  n: ctx.count ?? 1,
  size: ctx.size ?? GPT_IMAGE_AR_TO_SIZE[ctx.aspectRatio ?? ""] ?? "1024x1024",
  quality: ctx.quality ?? "high",
  ...ctx.background ? { background: ctx.background } : {},
  ...ctx.outputFormat ? { output_format: ctx.outputFormat } : {}
});
var buildGptImage2Payload = (ctx) => {
  const ar = ctx.aspectRatio ?? "";
  const mappedSize = ar === "auto" ? void 0 : GPT_IMAGE_2_AR_TO_SIZE[ar];
  return {
    prompt: ctx.prompt,
    model: "gpt-image-2",
    n: ctx.count ?? 1,
    size: ctx.size ?? mappedSize ?? "1024x1024",
    quality: ctx.quality ?? "high",
    ...ctx.background ? { background: ctx.background } : {},
    ...ctx.outputFormat ? { output_format: ctx.outputFormat } : {}
  };
};
var buildGptImage2EditPayload = (ctx) => ({
  prompt: ctx.prompt,
  model: "gpt-image-2",
  images: ctx.imageUrls ?? [],
  n: ctx.count ?? 1,
  size: ctx.aspectRatio === "auto" ? "auto" : GPT_IMAGE_2_AR_TO_SIZE[ctx.aspectRatio ?? ""] ?? "auto",
  quality: ctx.quality ?? "high",
  ...ctx.background ? { background: ctx.background } : {},
  ...ctx.outputFormat ? { output_format: ctx.outputFormat } : {}
});
var gptImage2Constraints = [
  {
    when: { imageUrls: { exists: true } },
    then: { aspectRatio: { allowed: ["1:1", "3:2", "2:3", "auto"], reason: "Image edit supports only square / 3:2 / 2:3 or auto." } }
  },
  {
    when: { imageUrls: { exists: false } },
    then: { aspectRatio: { allowed: ["1:1", "3:2", "2:3", "16:9", "9:16", "4:3", "3:4"], reason: '"Auto" requires a source image \u2014 upload one to use it.' } }
  }
];
var gptImageBgConstraints = [
  {
    when: { background: { is: "transparent" } },
    then: { outputFormat: { allowed: ["png", "webp"], reason: "Transparent background needs PNG or WEBP \u2014 JPEG has no alpha channel." } }
  }
];
var { MODELS: MODELS23 } = defineModels("openai", [
  // ── Image ─────────────────────────────────────────
  {
    id: "gpt-image-2",
    name: "GPT Image 2",
    modelId: "gpt-image-2",
    addedAt: "2026-04-21",
    workflow: "openai-images-generate",
    editWorkflow: "openai-image-editing",
    buildPayload: buildGptImage2Payload,
    buildEditPayload: buildGptImage2EditPayload,
    estimatedTime: 50,
    mode: "image",
    inputType: "t2i",
    description: "Next-gen GPT image model with arbitrary output dimensions and multi-image input.",
    features: [feat("Multi-Image Input", "input"), feat("High Quality", "quality")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(["1:1", "3:2", "2:3", "16:9", "9:16", "4:3", "3:4", "auto"], "1:1"),
      ...p.quality(["high", "medium", "low"], "high"),
      // gpt-image-2 supports only an opaque background — the API rejects
      // `transparent` for this model (boundary-verified), so no selector here.
      ...p.enum("outputFormat", ["png", "jpeg", "webp"], "png", { label: "Format" }),
      ...params.count(),
      ...params.imageInput(5, "Source Images")
    },
    constraints: gptImage2Constraints
  },
  {
    id: "gpt-image-1.5",
    name: "GPT Image 1.5",
    modelId: "gpt-image-1.5",
    addedAt: "2026-02-06",
    workflow: "openai-images-generate",
    editWorkflow: "openai-image-editing",
    buildPayload: buildGptImage15Payload,
    buildEditPayload: buildGptImage15EditPayload,
    estimatedTime: 50,
    mode: "image",
    inputType: "t2i",
    description: "Strong text-in-image and infographic rendering with multi-image input.",
    features: [feat("Multi-Image Input", "input"), feat("High Quality", "quality")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(["1:1", "3:2", "2:3", "16:9", "9:16", "4:3", "3:4"], "1:1"),
      ...p.quality(["high", "medium", "low"], "high"),
      ...p.enum("background", ["opaque", "transparent"], "opaque", { label: "Background" }),
      ...p.enum("outputFormat", ["png", "jpeg", "webp"], "png", { label: "Format" }),
      ...params.count(),
      ...params.imageInput(5, "Source Images")
    },
    constraints: gptImageBgConstraints
  },
  {
    id: "gpt-image-1",
    name: "GPT Image 1",
    modelId: "gpt-image-1",
    addedAt: "2026-03-13",
    deprecated: true,
    // superseded by gpt-image-1.5 / gpt-image-2
    workflow: "openai-images-generate",
    editWorkflow: "openai-image-editing",
    buildPayload: buildGptImage1Payload,
    buildEditPayload: buildGptImage1EditPayload,
    estimatedTime: 40,
    mode: "image",
    inputType: "t2i",
    description: "Original GPT image model with quality-tiered generation.",
    features: [feat("Multi-Image Input", "input")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(["1:1", "3:2", "2:3", "16:9", "9:16", "4:3", "3:4"], "1:1"),
      ...p.quality(["high", "medium", "low"], "high"),
      ...p.enum("background", ["opaque", "transparent"], "opaque", { label: "Background" }),
      ...p.enum("outputFormat", ["png", "jpeg", "webp"], "png", { label: "Format" }),
      ...params.count(),
      ...params.imageInput(5, "Source Images")
    },
    constraints: gptImageBgConstraints
  }
]);

// src/vendors/catalog/elevenlabs.ts
var buildElevenLabsTTSPayload = (modelId) => (ctx) => ({
  text: ctx.prompt,
  voice_id: ctx.voiceId ?? DEFAULT_VOICE_ID,
  model_id: modelId,
  ...ctx.language ? { language_code: ctx.language } : {}
});
var buildElevenLabsSFXPayload = (modelId) => (ctx) => ({
  text: ctx.prompt,
  duration_seconds: ctx.duration ?? 5,
  model_id: modelId
});
var buildElevenLabsSTSPayload = (modelId) => (ctx) => ({
  audio_url: ctx.audioUrl,
  voice_id: ctx.voiceId ?? DEFAULT_VOICE_ID,
  model_id: modelId,
  remove_background_noise: ctx.removeBackgroundNoise ?? false
});
var buildElevenLabsAudioIsolationPayload = (ctx) => ({
  audio_url: ctx.audioUrl
});
var buildElevenLabsDubbingPayload = (ctx) => ({
  audio_url: ctx.audioUrl,
  source_lang: "auto",
  target_lang: ctx.language
});
var buildElevenLabsVoiceRemixPayload = (ctx) => ({
  voice_id: ctx.voiceId,
  voice_description: ctx.prompt,
  auto_generate_text: true
});
var buildElevenLabsVoiceDesignPayload = (modelId) => (ctx) => ({
  voice_description: ctx.prompt,
  auto_generate_text: true,
  model_id: modelId
});
var buildElevenLabsVoicePreviewsPayload = (ctx) => ({
  voice_description: ctx.prompt,
  auto_generate_text: true
});
var ttsParamConfig = (promptMaxLength, withLanguage) => ({
  // language_code is honoured by eleven_v3 only — the vendor documents it as
  // "not supported for multilingual_v2 models" (silently ignored there).
  // No accent param anywhere: no builder ever read it.
  ...withLanguage ? params.language(false) : {},
  ...params.prompt({ maxLength: promptMaxLength }),
  ...params.voiceId([], DEFAULT_VOICE_ID, { catalog: { workflow: "elevenlabs/v1/catalog/voices" } })
});
var { MODELS: MODELS24 } = defineModels("elevenlabs", [
  // ── TTS ───────────────────────────────────────────────────────────
  {
    id: "eleven-v3",
    name: "Eleven v3",
    modelId: "eleven_v3",
    addedAt: "2026-02-06",
    workflow: "elevenlabs/v1/text-to-speech",
    buildPayload: buildElevenLabsTTSPayload("eleven_v3"),
    estimatedTime: 11,
    mode: "audio",
    inputType: "tts",
    badge: ["popular"],
    description: "Latest voice engine with expanded tone and pacing control.",
    features: [feat("Experimental", "characteristic"), feat("Creative Control", "characteristic")],
    paramConfig: ttsParamConfig(5e3, true)
  },
  {
    id: "eleven-multilingual-v2",
    name: "Eleven Multilingual v2",
    modelId: "eleven_multilingual_v2",
    addedAt: "2026-02-06",
    workflow: "elevenlabs/v1/text-to-speech",
    buildPayload: buildElevenLabsTTSPayload("eleven_multilingual_v2"),
    estimatedTime: 9,
    mode: "audio",
    inputType: "tts",
    badge: ["popular", "fast"],
    description: "Stable multilingual speech across 29+ languages with natural rhythm.",
    features: [feat("Stable", "characteristic"), feat("Professional", "characteristic")],
    paramConfig: ttsParamConfig(1e4, false)
  },
  // ── Sound Effects ─────────────────────────────────────────────────
  {
    id: "elevenlabs-sfx",
    name: "ElevenLabs SFX v2",
    modelId: "eleven_text_to_sound_v2",
    addedAt: "2026-02-06",
    workflow: "elevenlabs/v1/sound-generation",
    buildPayload: buildElevenLabsSFXPayload("eleven_text_to_sound_v2"),
    estimatedTime: 6,
    mode: "audio",
    inputType: "sfx",
    badge: ["popular"],
    description: "Create custom sound effects from a text description \u2014 up to 30 seconds.",
    features: [feat("Sound Effects", "characteristic")],
    paramConfig: { ...params.prompt(), ...params.durationRange(0.5, 30, 5, 0.5) }
  },
  // ── Music ─────────────────────────────────────────────────────────
  {
    id: "elevenlabs-music-v2",
    name: "ElevenLabs Music v2",
    modelId: "music_v2",
    addedAt: "2026-07-02",
    workflow: "elevenlabs/v1/music-generation",
    estimatedTime: 30,
    mode: "audio",
    inputType: "music",
    description: "Generate music with vocals or instrumental from a text prompt.",
    features: [feat("Vocal & Instrumental", "characteristic")],
    paramConfig: {
      ...params.prompt(),
      ...params.duration([10, 20, 30, 60, 120, 180, 300, 600], 30),
      ...p.boolean("isInstrumental", false, "Instrumental Only")
    }
  },
  // ── Speech-to-Speech ──────────────────────────────────────────────
  {
    id: "eleven-sts-v2",
    name: "Eleven STS v2",
    modelId: "eleven_english_sts_v2",
    addedAt: "2026-02-15",
    workflow: "elevenlabs/v1/speech-to-speech",
    buildPayload: buildElevenLabsSTSPayload("eleven_english_sts_v2"),
    estimatedTime: 15,
    mode: "audio",
    inputType: "sts",
    description: "Swap your voice to a different speaker while keeping timing and emotion.",
    features: [feat("Voice Changer", "characteristic"), feat("Emotion Preserved", "characteristic")],
    paramConfig: {
      ...params.audioInput("Speech Audio", true),
      ...params.voiceId([], DEFAULT_VOICE_ID, { catalog: { workflow: "elevenlabs/v1/catalog/voices" } }),
      ...p.boolean("removeBackgroundNoise", false, "Remove Background Noise")
    }
  },
  {
    id: "eleven-multilingual-sts-v2",
    name: "Eleven Multilingual STS v2",
    modelId: "eleven_multilingual_sts_v2",
    addedAt: "2026-02-15",
    workflow: "elevenlabs/v1/speech-to-speech",
    buildPayload: buildElevenLabsSTSPayload("eleven_multilingual_sts_v2"),
    estimatedTime: 15,
    mode: "audio",
    inputType: "sts",
    description: "Voice swap across 29 languages \u2014 preserves emotion and cadence.",
    features: [feat("Voice Changer", "characteristic"), feat("Multilingual", "characteristic"), feat("29 Languages", "characteristic")],
    paramConfig: {
      ...params.audioInput("Speech Audio", true),
      ...params.voiceId([], DEFAULT_VOICE_ID, { catalog: { workflow: "elevenlabs/v1/catalog/voices" } }),
      ...p.boolean("removeBackgroundNoise", false, "Remove Background Noise")
    }
  },
  // ── Audio Processing ────────────────────────────────────────────
  {
    id: "eleven-audio-isolation",
    name: "Eleven Audio Isolation",
    addedAt: "2026-03-24",
    workflow: "elevenlabs/v1/audio-isolation",
    buildPayload: buildElevenLabsAudioIsolationPayload,
    estimatedTime: 20,
    mode: "audio",
    inputType: "sts",
    description: "Isolate vocals and remove background noise from an audio file.",
    features: [feat("Noise Removal", "characteristic"), feat("Vocal Isolation", "characteristic")],
    paramConfig: { ...params.audioInput("Audio File", true) }
  },
  {
    id: "eleven-dubbing",
    name: "Eleven Dubbing",
    addedAt: "2026-03-24",
    workflow: "elevenlabs/v1/dubbing",
    buildPayload: buildElevenLabsDubbingPayload,
    estimatedTime: 60,
    mode: "audio",
    inputType: "sts",
    description: "Dub audio or video across languages with automatic voice matching.",
    features: [feat("Multilingual", "characteristic"), feat("Dubbing", "characteristic")],
    paramConfig: {
      ...params.audioInput("Source Audio", true),
      // target_lang is the vendor's only required field (ISO 639-1/639-3 code).
      language: {
        label: "Target Language (ISO 639 code)",
        required: true,
        descriptor: { kind: "text", placeholder: "e.g. es, fr, de" }
      }
    }
  },
  // ── Voice Design ────────────────────────────────────────────────
  {
    id: "eleven-voice-remix",
    name: "Eleven Voice Remix",
    addedAt: "2026-03-24",
    workflow: "elevenlabs/v1/voice-remix",
    buildPayload: buildElevenLabsVoiceRemixPayload,
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    disabled: true,
    description: "Remix voice characteristics by describing the desired vocal style.",
    features: [feat("Voice Design", "characteristic"), feat("Remix", "characteristic")],
    paramConfig: {
      // Vendor: "Only your own custom voices can be remixed" — the premade
      // voices catalog cannot serve this model, so voiceId is a plain id input.
      voiceId: {
        label: "Voice ID (a custom voice from your workspace)",
        required: true,
        descriptor: { kind: "text", placeholder: "Premade/catalog voices are rejected by ElevenLabs" }
      },
      ...params.prompt({ minLength: 5, maxLength: 1e3 })
    }
  },
  {
    id: "eleven-voice-design-v3",
    name: "Eleven Voice Design v3",
    addedAt: "2026-03-24",
    modelId: "eleven_ttv_v3",
    workflow: "elevenlabs/v1/voice-design",
    buildPayload: buildElevenLabsVoiceDesignPayload("eleven_ttv_v3"),
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    description: "Design a new voice from a text description using v3 engine.",
    features: [feat("Voice Design", "characteristic"), feat("Preview", "characteristic")],
    paramConfig: { ...params.prompt({ minLength: 20, maxLength: 1e3 }) }
  },
  {
    id: "eleven-voice-design-v2",
    name: "Eleven Voice Design Multilingual v2",
    addedAt: "2026-03-24",
    modelId: "eleven_multilingual_ttv_v2",
    workflow: "elevenlabs/v1/voice-design",
    buildPayload: buildElevenLabsVoiceDesignPayload("eleven_multilingual_ttv_v2"),
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    description: "Design a new voice from a text description with multilingual support.",
    features: [feat("Voice Design", "characteristic"), feat("Multilingual", "characteristic"), feat("Preview", "characteristic")],
    paramConfig: { ...params.prompt({ minLength: 20, maxLength: 1e3 }) }
  },
  {
    id: "eleven-voice-create",
    name: "Eleven Voice Previews",
    addedAt: "2026-03-24",
    workflow: "elevenlabs/v1/voice-create-previews",
    buildPayload: buildElevenLabsVoicePreviewsPayload,
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    description: "Generate voice previews from a description to audition before committing.",
    features: [feat("Voice Design", "characteristic"), feat("Preview", "characteristic")],
    paramConfig: { ...params.prompt({ minLength: 20, maxLength: 1e3 }) }
  }
]);

// src/vendors/catalog/elevenlabs.payloads.ts
var buildElevenLabsMusicPayload = (input) => ({
  prompt: input.prompt,
  music_length_seconds: input.duration ?? 30,
  model_id: "music_v2",
  force_instrumental: input.isInstrumental ?? false
});
registerPayloads(MODELS24, {
  "elevenlabs-music-v2": buildElevenLabsMusicPayload
});

// src/vendors/catalog/heygen.ts
var buildHeyGenPhotoAvatarPayload = (ctx) => ({
  image_url: ctx.imageUrls?.[0],
  script: ctx.prompt,
  voice_id: ctx.voiceId || void 0,
  ...ctx.resolution ? { resolution: ctx.resolution } : {},
  ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}
});
var buildHeyGenVideoAvatarPayload = (ctx) => ({
  avatar_id: ctx.videoId || void 0,
  script: ctx.prompt,
  voice_id: ctx.voiceId || void 0,
  ...ctx.resolution ? { resolution: ctx.resolution } : {},
  ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}
});
var dynamicVoiceConfig = {
  ...params.voiceId([], "", {
    required: true,
    catalog: { workflow: "heygen/v1/catalog/voices" }
  })
};
var { MODELS: MODELS25 } = defineModels("heygen", [
  // ── Photo Avatar (i2v) ────────────────────────────────────────────
  {
    id: "heygen-talking-photo",
    modelId: "heygen-avatar-iv",
    addedAt: "2026-03-17",
    name: "HeyGen Talking Photo",
    workflow: "heygen/v1/video/generate",
    buildPayload: buildHeyGenPhotoAvatarPayload,
    estimatedTime: 120,
    mode: "video",
    inputType: "i2v",
    description: "Animate any photo into a speaking avatar with natural lip-sync.",
    features: [
      feat("Image Input", "input"),
      feat("Voice Selection", "audio"),
      feat("Lip Sync", "characteristic")
    ],
    paramConfig: {
      ...params.imageInput(1, "Portrait Image", true),
      ...params.resolution(["4k", "1080p", "720p"], "720p"),
      ...params.aspectRatio(["16:9", "9:16"]),
      ...dynamicVoiceConfig,
      ...params.prompt({ minLength: 20, maxLength: 5e3, placeholder: "Write the script your avatar will speak (at least 20 characters)..." })
    }
  },
  // ── Video Avatar (t2v) ────────────────────────────────────────────
  {
    id: "heygen-video-avatar",
    modelId: "heygen-avatar-iv",
    addedAt: "2026-03-17",
    name: "HeyGen Video Avatar",
    workflow: "heygen/v1/video/generate",
    buildPayload: buildHeyGenVideoAvatarPayload,
    estimatedTime: 90,
    mode: "video",
    inputType: "t2v",
    description: "Generate a speaking avatar video from a stock avatar and text script.",
    features: [
      feat("Avatar Selection", "characteristic"),
      feat("Voice Selection", "audio"),
      feat("Lip Sync", "characteristic")
    ],
    paramConfig: {
      ...params.videoId([], "", {
        required: true,
        catalog: { workflow: "heygen/v1/catalog/avatars" }
      }),
      ...params.resolution(["4k", "1080p", "720p"], "720p"),
      ...params.aspectRatio(["16:9", "9:16"]),
      ...dynamicVoiceConfig,
      ...params.prompt({ minLength: 20, maxLength: 5e3, placeholder: "Write the script your avatar will speak (at least 20 characters)..." })
    }
  }
]);

// src/vendors/catalog/minimax.ts
var buildMinimaxTTSPayload = (ctx) => ({
  text: ctx.prompt
});
var buildMinimaxMusicPayload = (ctx) => ({
  prompt: ctx.prompt,
  lyrics_prompt: ctx.lyricsPrompt ?? ctx.prompt,
  ...ctx.lyricsOptimizer != null ? { lyrics_optimizer: ctx.lyricsOptimizer } : {},
  ...ctx.isInstrumental != null ? { is_instrumental: ctx.isInstrumental } : {},
  ...ctx.outputFormat ? { output_format: ctx.outputFormat } : { output_format: "url" }
});
var { MODELS: MODELS26 } = defineModels("minimax", [
  {
    id: "minimax-02-hd",
    name: "MiniMax 02 HD",
    modelId: "minimax-02-hd",
    addedAt: "2026-02-06",
    workflow: "minimax-tts",
    buildPayload: buildMinimaxTTSPayload,
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    disabled: true,
    // Backend workflow not deployed
    description: "HD voice synthesis with rich tonal depth and consistent delivery.",
    features: [feat("Consistent", "characteristic"), feat("Cinematic", "characteristic")],
    paramConfig: {
      ...params.language(true),
      ...params.prompt({ maxLength: 150 })
    }
  },
  {
    id: "minimax-music-v2",
    name: "MiniMax Music v2",
    addedAt: "2026-02-06",
    workflow: "minimax-music/v2",
    buildPayload: buildMinimaxMusicPayload,
    estimatedTime: 39,
    mode: "audio",
    inputType: "music",
    description: "Text-to-music with vocals or instrumentals from a style prompt and lyrics prompt.",
    features: [feat("Music", "characteristic"), feat("Vocals", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 2e3, placeholder: "Describe the genre, mood, instruments, tempo, and production style..." }),
      ...p.text("lyricsPrompt", {
        maxLength: 2e3,
        label: "Lyrics Prompt",
        placeholder: "Write lyrics, or describe the lyrical theme. Minimum 10 characters."
      }),
      ...p.boolean("lyricsOptimizer", false, "Lyrics Optimizer"),
      ...p.boolean("isInstrumental", false, "Instrumental"),
      ...p.enum("outputFormat", ["url", "hex"], "url", { label: "Output Format" })
    }
  },
  {
    id: "minimax-music-v3",
    name: "MiniMax Music v3",
    addedAt: "2026-08-14",
    workflow: "minimax-music/v3",
    estimatedTime: 40,
    mode: "audio",
    inputType: "music",
    description: "Text-to-music with vocals or instrumentals from a style prompt and optional lyrics, with configurable audio encoding.",
    features: [feat("Music", "characteristic"), feat("Vocals", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 2e3, placeholder: "Describe the genre, mood, instruments, tempo, and production style..." }),
      ...p.text("lyricsPrompt", {
        maxLength: 2e3,
        label: "Lyrics",
        placeholder: "Write lyrics; \\n separates lines, [Intro]/[Verse]/[Chorus] tags supported. Optional for instrumental or optimizer-generated lyrics."
      }),
      ...p.boolean("lyricsOptimizer", false, "Lyrics Optimizer"),
      ...p.boolean("isInstrumental", false, "Instrumental"),
      ...p.enum("sampleRate", [16e3, 24e3, 32e3, 44100], 44100, { label: "Sample Rate" }),
      ...p.enum("bitrate", [32e3, 64e3, 128e3, 256e3], 256e3, { label: "Bitrate" }),
      ...p.enum("format", ["mp3", "wav", "pcm"], "mp3", { label: "Format" })
    }
  },
  {
    // Combined T2V/I2V — fal.ai-hosted (pa-fal-ai-pluggable-worker), unlike
    // the Hailuo/H3 entries in hailuo.ts which route through the minimax
    // worker. A start frame switches to the image-to-video edit workflow.
    id: "minimax-h3-max",
    name: "MiniMax H3 Max",
    modelId: "fal-ai-h3-max",
    addedAt: "2026-08-28",
    workflow: "minimax/h3-max/text-to-video",
    editWorkflow: "minimax/h3-max/image-to-video",
    estimatedTime: 5,
    mode: "video",
    inputType: "t2v",
    description: "Top-tier MiniMax H3 Max video from text or a start/end frame, with prompt expansion. Up to 15s at 768p.",
    features: [
      feat("Image Input", "input"),
      feat("Start/End Frame", "frame"),
      feat("768p", "resolution"),
      feat("5-15 sec", "duration")
    ],
    paramConfig: {
      ...params.prompt(),
      ...params.startFrame(),
      ...params.endFrame(),
      // Lowercase on purpose: the worker uppercases for the fal wire ('768P')
      // and the pricing qualities are lowercase, so this casing serves both.
      ...params.resolution(["480p", "768p"], "768p"),
      ...params.durationRange(5, 15, 5),
      ...params.aspectRatio(["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], "16:9"),
      ...p.enum("promptExpansionMode", ["disabled", "balanced", "quality"], "balanced", { label: "Prompt Expansion" }),
      // -1 (sentinel) means "pick a random seed"; the builder drops it.
      ...p.range("seed", -1, 2147483647, -1),
      ...p.boolean("enableSafetyChecker", true, "Safety Checker")
    },
    constraints: [
      // The T2V wire has no end_image_url — an end frame only reaches the
      // vendor on the I2V route, which needs a start frame to trigger.
      { when: { startFrame: { exists: false } }, then: {
        endFrame: { disabled: true, reason: "An end frame requires a start frame." }
      } },
      // I2V derives the ratio from the input image (no aspect_ratio on that wire).
      { when: { startFrame: { exists: true } }, then: {
        aspectRatio: { disabled: true, reason: "Aspect ratio follows the start frame image." }
      } }
    ]
  },
  {
    // Turbo sibling of minimax-h3-max — same fal.ai worker, same wire shape,
    // tuned for speed (faster-than-realtime generation). The only schema
    // difference: prompt expansion has no 'disabled' mode on this endpoint.
    id: "minimax-h3-max-turbo",
    name: "MiniMax H3 Max Turbo",
    modelId: "fal-ai-h3-max-turbo",
    addedAt: "2026-09-03",
    workflow: "minimax/h3-max-turbo/text-to-video",
    editWorkflow: "minimax/h3-max-turbo/image-to-video",
    estimatedTime: 5,
    mode: "video",
    inputType: "t2v",
    description: "Faster-than-realtime MiniMax H3 Max Turbo video from text or a start/end frame, with prompt expansion. Up to 15s at 768p.",
    features: [
      feat("Fast", "characteristic"),
      feat("Image Input", "input"),
      feat("Start/End Frame", "frame"),
      feat("768p", "resolution"),
      feat("5-15 sec", "duration")
    ],
    paramConfig: {
      ...params.prompt(),
      ...params.startFrame(),
      ...params.endFrame(),
      // Lowercase on purpose: the worker uppercases for the fal wire ('768P')
      // and the pricing qualities are lowercase, so this casing serves both.
      ...params.resolution(["480p", "768p"], "768p"),
      ...params.durationRange(5, 15, 5),
      ...params.aspectRatio(["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], "16:9"),
      // Unlike minimax-h3-max, the turbo wire has no 'disabled' expansion mode.
      ...p.enum("promptExpansionMode", ["balanced", "quality"], "balanced", { label: "Prompt Expansion" }),
      // -1 (sentinel) means "pick a random seed"; the builder drops it.
      ...p.range("seed", -1, 2147483647, -1),
      ...p.boolean("enableSafetyChecker", true, "Safety Checker")
    },
    constraints: [
      // The T2V wire has no end_image_url — an end frame only reaches the
      // vendor on the I2V route, which needs a start frame to trigger.
      { when: { startFrame: { exists: false } }, then: {
        endFrame: { disabled: true, reason: "An end frame requires a start frame." }
      } },
      // I2V derives the ratio from the input image (no aspect_ratio on that wire).
      { when: { startFrame: { exists: true } }, then: {
        aspectRatio: { disabled: true, reason: "Aspect ratio follows the start frame image." }
      } }
    ]
  },
  {
    // Reference-to-video sibling of minimax-h3-max (same fal.ai worker).
    // The prompt addresses references by modality and order — Image 1,
    // Video 1, Audio 1, … Reference clips are 2-15s each (≤15s combined per
    // modality) and images + videos + audios must add up to ≤12 files —
    // backend-enforced; paramConfig only carries the per-array maxima.
    id: "minimax-h3-max-r2v",
    name: "MiniMax H3 Max Ref-to-Video",
    modelId: "fal-ai-h3-max",
    addedAt: "2026-09-01",
    workflow: "minimax/h3-max/reference-to-video",
    estimatedTime: 5,
    mode: "video",
    inputType: "i2v",
    description: "MiniMax H3 Max video from reference images, videos, and audio \u2014 refer to them in the prompt as Image 1, Video 1, Audio 1, in input order. Up to 15s at 768p.",
    features: [
      feat("Multi-Image Input", "input"),
      feat("Video Input", "input"),
      feat("Audio Input", "input"),
      feat("768p", "resolution"),
      feat("5-15 sec", "duration")
    ],
    paramConfig: {
      ...params.prompt({ placeholder: "Image 1 is the protagonist. Keep her consistent with the reference while she walks through a sunlit garden..." }),
      ...params.imageInput(9, "Reference Images"),
      ...params.videoInputs(3, "Reference Videos"),
      ...params.audioInputs(3, "Reference Audios"),
      // Lowercase on purpose — same worker normalization as minimax-h3-max.
      ...params.resolution(["480p", "768p"], "768p"),
      ...params.durationRange(5, 15, 5),
      ...params.aspectRatio(["adaptive", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], "adaptive"),
      // Unlike the T2V/I2V entry, this wire has no 'disabled' expansion mode.
      ...p.enum("promptExpansionMode", ["balanced", "quality"], "balanced", { label: "Prompt Expansion" }),
      // -1 (sentinel) means "pick a random seed"; the builder drops it.
      ...p.range("seed", -1, 2147483647, -1),
      ...p.boolean("enableSafetyChecker", true, "Safety Checker")
    },
    constraints: [
      { when: { imageUrls: { exists: false }, videoUrls: { exists: false } }, then: {
        audioUrls: { disabled: true, reason: "Audio cannot be the only reference \u2014 add an image or video." }
      } }
    ]
  }
]);

// src/vendors/catalog/minimax.payloads.ts
var buildMinimaxMusicV3Payload = (input) => ({
  prompt: input.prompt,
  ...input.lyricsPrompt ? { lyrics: input.lyricsPrompt } : {},
  lyrics_optimizer: input.lyricsOptimizer ?? false,
  is_instrumental: input.isInstrumental ?? false,
  // Apply the paramConfig defaults explicitly — a custom builder (unlike the
  // pass-through one) doesn't get them for free, and the advertised defaults
  // must reach the wire instead of whatever the backend would pick.
  audio_setting: {
    sample_rate: input.sampleRate ?? 44100,
    bitrate: input.bitrate ?? 256e3,
    format: input.format ?? "mp3"
  }
});
var buildMinimaxH3MaxPayload = (input) => ({
  prompt: input.prompt,
  prompt_expansion_mode: input.promptExpansionMode ?? "balanced",
  duration: input.duration ?? 5,
  resolution: input.resolution ?? "768p",
  ...input.startFrame ? {
    image_url: input.startFrame,
    ...input.endFrame ? { end_image_url: input.endFrame } : {}
  } : { aspect_ratio: input.aspectRatio ?? "16:9" },
  // -1 is the paramConfig sentinel for "random seed" — omit it on the wire.
  ...input.seed != null && input.seed !== -1 ? { seed: input.seed } : {},
  enable_safety_checker: input.enableSafetyChecker ?? true
});
var buildMinimaxH3MaxTurboPayload = (input) => ({
  prompt: input.prompt,
  prompt_expansion_mode: input.promptExpansionMode ?? "balanced",
  duration: input.duration ?? 5,
  resolution: input.resolution ?? "768p",
  ...input.startFrame ? {
    image_url: input.startFrame,
    ...input.endFrame ? { end_image_url: input.endFrame } : {}
  } : { aspect_ratio: input.aspectRatio ?? "16:9" },
  // -1 is the paramConfig sentinel for "random seed" — omit it on the wire.
  ...input.seed != null && input.seed !== -1 ? { seed: input.seed } : {},
  enable_safety_checker: input.enableSafetyChecker ?? true
});
var buildMinimaxH3MaxR2VPayload = (input) => ({
  prompt: input.prompt,
  prompt_expansion_mode: input.promptExpansionMode ?? "balanced",
  duration: input.duration ?? 5,
  resolution: input.resolution ?? "768p",
  aspect_ratio: input.aspectRatio ?? "adaptive",
  ...input.imageUrls?.length ? { reference_image_urls: input.imageUrls } : {},
  ...input.videoUrls?.length ? { reference_video_urls: input.videoUrls } : {},
  ...input.audioUrls?.length ? { reference_audio_urls: input.audioUrls } : {},
  // -1 is the paramConfig sentinel for "random seed" — omit it on the wire.
  ...input.seed != null && input.seed !== -1 ? { seed: input.seed } : {},
  enable_safety_checker: input.enableSafetyChecker ?? true
});
registerPayloads(MODELS26, {
  "minimax-music-v3": buildMinimaxMusicV3Payload,
  "minimax-h3-max": buildMinimaxH3MaxPayload,
  "minimax-h3-max-turbo": buildMinimaxH3MaxTurboPayload,
  "minimax-h3-max-r2v": buildMinimaxH3MaxR2VPayload
});
registerEditPayloads(MODELS26, {
  "minimax-h3-max": buildMinimaxH3MaxPayload,
  "minimax-h3-max-turbo": buildMinimaxH3MaxTurboPayload
});

// src/vendors/catalog/ideogram.ts
var toIdeogramAr = (ar) => ar.replace(":", "x");
var buildIdeogramGeneratePayload = (ctx) => ({
  prompt: ctx.prompt,
  num_images: ctx.count ?? 1,
  style_type: ctx.style ?? "GENERAL",
  magic_prompt_option: "AUTO",
  aspect_ratio: toIdeogramAr(ctx.aspectRatio ?? "16:9"),
  ...ctx.renderingSpeed ? { rendering_speed: ctx.renderingSpeed } : {},
  ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}
});
var buildIdeogramRemixPayload = (ctx) => ({
  prompt: ctx.prompt,
  image: ctx.imageUrls?.[0],
  num_images: ctx.count ?? 1,
  image_weight: ctx.imageWeight ?? 50,
  style_type: ctx.style ?? "GENERAL",
  magic_prompt: "AUTO",
  aspect_ratio: toIdeogramAr(ctx.aspectRatio ?? "16:9"),
  ...ctx.renderingSpeed ? { rendering_speed: ctx.renderingSpeed } : {},
  ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}
});
var buildIdeogramCharacterPayload = (ctx) => ({
  prompt: ctx.prompt,
  num_images: ctx.count ?? 1,
  resolution: ctx.resolution ?? "1024x1024",
  style_type: ctx.style ?? "AUTO",
  ...ctx.renderingSpeed ? { rendering_speed: ctx.renderingSpeed } : {},
  ...ctx.imageUrls?.length ? { character_reference_images: [ctx.imageUrls[0]] } : {}
});
var buildIdeogramV4GeneratePayload = (ctx) => ({
  text_prompt: ctx.prompt,
  ...ctx.resolution ? { resolution: ctx.resolution } : {},
  ...ctx.renderingSpeed ? { rendering_speed: ctx.renderingSpeed } : {},
  ...ctx.enableCopyrightDetection ? { enable_copyright_detection: true } : {}
});
var buildIdeogramPImagePayload = (ctx) => ({
  prompt: ctx.prompt,
  resolution: ctx.resolution ?? "1024x1024",
  rendering_speed: ctx.renderingSpeed ?? "medium"
});
var { MODELS: MODELS27 } = defineModels("ideogram", [
  {
    id: "ideogram-v4",
    name: "Ideogram 4.0",
    addedAt: "2026-06-03",
    workflow: "ideogram/v4/generate",
    buildPayload: buildIdeogramV4GeneratePayload,
    estimatedTime: 20,
    mode: "image",
    inputType: "t2i",
    description: "Ideogram's latest model \u2014 class-leading text rendering at up to ~3K resolution.",
    features: [feat("Text Rendering", "style"), feat("Up to 3K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.resolution([
        "2048x2048",
        "1440x2880",
        "2880x1440",
        "1664x2496",
        "2496x1664",
        "1792x2240",
        "2240x1792",
        "1440x2560",
        "2560x1440",
        "1600x2560",
        "2560x1600",
        "1728x2304",
        "2304x1728",
        "1296x3168",
        "3168x1296",
        "1152x2944",
        "2944x1152",
        "1248x3328",
        "3328x1248",
        "1280x3072",
        "3072x1280"
      ], "2048x2048"),
      ...params.renderingSpeed([
        { id: "TURBO", label: "Turbo" },
        { id: "DEFAULT", label: "Balanced" },
        { id: "QUALITY", label: "Quality" }
      ], "DEFAULT"),
      ...p.boolean("enableCopyrightDetection", false, "Copyright Detection")
    }
  },
  {
    id: "ideogram-p-image",
    name: "Ideogram P-Image",
    addedAt: "2026-07-28",
    workflow: "ideogram/p-image/generate",
    buildPayload: buildIdeogramPImagePayload,
    estimatedTime: 15,
    mode: "image",
    inputType: "t2i",
    description: "Tiered Ideogram text-to-image \u2014 pick a speed/quality tier from very-low (fastest) to high (max quality).",
    features: [feat("Speed Tiers", "style"), feat("Up to 2K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.resolution([
        // 2K bucket (~3–4 MP)
        "2048x2048",
        "1440x2880",
        "2880x1440",
        "1664x2496",
        "2496x1664",
        "1792x2240",
        "2240x1792",
        "1440x2560",
        "2560x1440",
        "1600x2560",
        "2560x1600",
        "1728x2304",
        "2304x1728",
        "1296x3168",
        "3168x1296",
        "1152x2944",
        "2944x1152",
        "1248x3328",
        "3328x1248",
        "1280x3072",
        "3072x1280",
        "1024x3072",
        "3072x1024",
        // 1K bucket (~1 MP)
        "1024x1024",
        "896x1120",
        "1120x896",
        "864x1152",
        "1152x864",
        "832x1248",
        "1248x832",
        "800x1280",
        "1280x800",
        "720x1280",
        "1280x720",
        "720x1440",
        "1440x720"
      ], "1024x1024"),
      ...params.renderingSpeed([
        { id: "very-low", label: "Very Low" },
        { id: "low", label: "Low" },
        { id: "medium", label: "Balanced" },
        { id: "high", label: "Quality" }
      ], "medium")
    }
  },
  {
    id: "ideogram-v3",
    name: "Ideogram v3",
    modelId: "ideogram_v_3",
    addedAt: "2026-02-06",
    workflow: "ideogram-v3-generate",
    editWorkflow: "ideogram-v3-remix",
    buildPayload: buildIdeogramGeneratePayload,
    buildEditPayload: buildIdeogramRemixPayload,
    estimatedTime: 17,
    mode: "image",
    inputType: "t2i",
    description: "Best-in-class text placement for logos, posters, and graphic design.",
    features: [feat("Multi-Image Input", "input"), feat("Styles", "style")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(["16:9", "9:16", "1:1", "3:4", "4:3"]),
      ...params.renderingSpeed([
        { id: "FLASH", label: "Flash" },
        { id: "TURBO", label: "Turbo" },
        { id: "DEFAULT", label: "Balanced" },
        { id: "QUALITY", label: "Quality" }
      ], "DEFAULT"),
      ...params.style([
        { id: "GENERAL", label: "General" },
        { id: "REALISTIC", label: "Realistic" },
        { id: "DESIGN", label: "Design" }
      ], "GENERAL"),
      ...params.count(),
      ...params.negativePrompt(),
      ...params.imageInput(1, "Source Image"),
      // Ideogram remix image_weight minimum is 1 (0 is rejected by the API).
      ...params.imageWeight(1, 100, 50, 5)
    }
  },
  {
    id: "ideogram-character",
    name: "Ideogram Character",
    modelId: "ideogram-v3-character",
    addedAt: "2026-02-14",
    workflow: "ideogram-v3-generate",
    buildPayload: buildIdeogramCharacterPayload,
    estimatedTime: 20,
    mode: "image",
    inputType: "i2i",
    description: "Maintain a consistent character across scenes using a single reference photo.",
    features: [feat("Character Ref", "input"), feat("Styles", "style")],
    paramConfig: {
      ...params.prompt(),
      ...params.resolution(["1024x1024", "1344x768", "768x1344", "1152x864", "864x1152", "832x1248", "1280x800"]),
      ...params.renderingSpeed([
        { id: "TURBO", label: "Turbo" },
        { id: "DEFAULT", label: "Balanced" },
        { id: "QUALITY", label: "Quality" }
      ], "DEFAULT"),
      ...params.style([
        { id: "AUTO", label: "Auto" },
        { id: "REALISTIC", label: "Realistic" },
        { id: "FICTION", label: "Fiction" }
      ], "AUTO"),
      ...params.count(),
      ...params.imageInput(1, "Character Reference", true)
    }
  }
]);

// src/vendors/catalog/qwen.ts
var QWEN_V1_SIZES = [
  "2048x2048",
  "2688x1536",
  "1536x2688",
  "2368x1728",
  "1728x2368"
];
var buildQwenPayload = (ctx) => {
  const hasImages = Array.isArray(ctx.imageUrls) && ctx.imageUrls.length > 0;
  return {
    prompt: ctx.prompt,
    ...hasImages ? { image_url: ctx.imageUrls[0] } : {}
  };
};
var buildQwen2Payload = (ctx) => {
  const hasImages = Array.isArray(ctx.imageUrls) && ctx.imageUrls.length > 0;
  return {
    prompt: ctx.prompt,
    num_images: ctx.count ?? 1,
    ...hasImages ? { image_urls: ctx.imageUrls } : {}
  };
};
var buildQwenV1 = (model) => (ctx) => {
  const hasImages = Array.isArray(ctx.imageUrls) && ctx.imageUrls.length > 0;
  const promptExtendMode = ctx.promptExtendMode === "agent" && hasImages && model.startsWith("qwen-image-3.0") ? void 0 : ctx.promptExtendMode;
  const promptExtend = ctx.enhancePrompt ?? true;
  return {
    prompt: ctx.prompt,
    model,
    ...hasImages ? { image_urls: ctx.imageUrls } : {},
    ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {},
    // I2I: omit size — the vendor auto-matches the input image's aspect ratio,
    // and the SDK's ~4MP presets exceed the current I2I ceiling.
    ...hasImages ? {} : { size: (ctx.resolution ?? "2048x2048").replace("x", "*") },
    n: ctx.count ?? 1,
    prompt_extend: promptExtend,
    // Qwen 3.0 family only — prompt-rewrite strategy (direct/agent); 2.x ignores it.
    ...promptExtendMode ? { prompt_extend_mode: promptExtendMode } : {},
    // Qwen 3.0 family only — thinking mode; the vendor requires prompt_extend=true.
    ...ctx.enableThinking != null && promptExtend ? { enable_thinking: ctx.enableThinking } : {},
    watermark: false,
    ...ctx.seed != null ? { seed: ctx.seed } : {}
  };
};
var qwenV1Params = {
  ...params.prompt({ maxLength: 800 }),
  ...params.negativePrompt(void 0, 500),
  ...params.resolution(QWEN_V1_SIZES, "2048x2048"),
  ...params.count([1, 2, 4, 6]),
  ...params.enhancePrompt(true),
  ...params.imageInput(3, "Source Images"),
  ...params.seed()
};
var qwenV1Params3 = {
  ...qwenV1Params,
  ...p.enum("promptExtendMode", ["direct", "agent"], "direct"),
  ...p.boolean("enableThinking", true, "Deep Thinking")
};
var { MODELS: MODELS28 } = defineModels("qwen", [
  {
    id: "qwen",
    name: "Qwen",
    addedAt: "2026-02-06",
    deprecated: true,
    // superseded by qwen-2 / qwen-2-pro / qwen-edit-plus
    workflow: "qwen-image",
    editWorkflow: "qwen-image/image-to-image",
    buildPayload: buildQwenPayload,
    estimatedTime: 12,
    mode: "image",
    inputType: "t2i",
    description: "Clean 1K images from text or an image reference.",
    features: [feat("Image Input", "input"), feat("1K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(1, "Source Image")
    }
  },
  {
    id: "qwen-image-2",
    name: "Qwen 2",
    addedAt: "2026-03-27",
    deprecated: true,
    // fal marks both endpoints 'no longer supported' — use qwen-image-3.0
    workflow: "qwen-image-2/text-to-image",
    editWorkflow: "qwen-image-2/edit",
    buildPayload: buildQwen2Payload,
    estimatedTime: 30,
    mode: "image",
    inputType: "t2i",
    description: "Next-gen image generation with improved realism and typography.",
    features: [feat("Image Input", "input"), feat("Typography", "characteristic"), feat("1K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.count(),
      ...params.imageInput(1, "Source Image")
    }
  },
  {
    id: "qwen-image-2-pro",
    name: "Qwen 2 Pro",
    addedAt: "2026-03-27",
    workflow: "qwen/v1/text-to-image",
    editWorkflow: "qwen/v1/image-to-image",
    buildPayload: buildQwenV1("qwen-image-2.0-pro-2026-04-22"),
    estimatedTime: 60,
    mode: "image",
    inputType: "t2i",
    badge: ["premium"],
    description: "Premium Qwen 2 (2026-04-22) with highest quality output.",
    features: [
      feat("Image Input", "input"),
      feat("Negative Prompt", "characteristic"),
      feat("2K", "resolution")
    ],
    paramConfig: qwenV1Params
  },
  {
    id: "qwen-image-3.0",
    name: "Qwen 3.0",
    addedAt: "2026-07-27",
    release: "preview",
    workflow: "qwen/v1/text-to-image",
    editWorkflow: "qwen/v1/image-to-image",
    buildPayload: buildQwenV1("qwen-image-3.0"),
    estimatedTime: 90,
    mode: "image",
    inputType: "t2i",
    description: "Qwen-Image 3.0 \u2014 highest-fidelity text-to-image and image editing with a selectable prompt-rewrite mode.",
    features: [
      feat("Image Input", "input"),
      feat("Negative Prompt", "characteristic"),
      feat("2K", "resolution")
    ],
    paramConfig: qwenV1Params3
  },
  {
    id: "qwen-image-3.0-pro",
    name: "Qwen 3.0 Pro",
    addedAt: "2026-08-31",
    workflow: "qwen/v1/text-to-image",
    editWorkflow: "qwen/v1/image-to-image",
    buildPayload: buildQwenV1("qwen-image-3.0-pro"),
    estimatedTime: 90,
    mode: "image",
    inputType: "t2i",
    badge: ["premium"],
    description: "Qwen-Image 3.0 Pro (GA) \u2014 flagship text-to-image and image editing with prompt-rewrite modes and thinking mode.",
    features: [
      feat("Image Input", "input"),
      feat("Negative Prompt", "characteristic"),
      feat("2K", "resolution")
    ],
    paramConfig: qwenV1Params3
  }
]);

// src/vendors/catalog/recraft.ts
var recraftAspectRatios = ["1:1", "4:3", "3:4", "3:2", "2:3", "16:9", "9:16", "2:1", "1:2"];
var resolveV4Model = (style, pro) => {
  const isVector = style === "vector_illustration";
  if (pro) return isVector ? "recraftv4_pro_vector" : "recraftv4_pro";
  return isVector ? "recraftv4_vector" : "recraftv4";
};
var buildRecraftV4Payload = (ctx) => ({
  prompt: ctx.prompt,
  model: resolveV4Model(ctx.style),
  n: ctx.count ?? 1,
  ...ctx.aspectRatio ? { size: ctx.aspectRatio } : {},
  ...ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0], strength: (ctx.imageWeight ?? 80) / 100 } : {}
});
var buildRecraftV4ProPayload = (ctx) => ({
  prompt: ctx.prompt,
  model: resolveV4Model(ctx.style, true),
  n: ctx.count ?? 1,
  ...ctx.aspectRatio ? { size: ctx.aspectRatio } : {},
  ...ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0], strength: (ctx.imageWeight ?? 80) / 100 } : {}
});
var buildRecraftLegacyPayload = (apiModel) => (ctx) => ({
  prompt: ctx.prompt,
  model: apiModel,
  n: ctx.count ?? 1,
  ...ctx.aspectRatio ? { size: ctx.aspectRatio } : {},
  ...ctx.style ? { style: ctx.style } : {},
  ...ctx.substyle ? { substyle: ctx.substyle } : {},
  ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {},
  ...ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0] } : {},
  ...ctx.imageUrls?.[0] ? { strength: (ctx.imageWeight ?? 80) / 100 } : {}
});
var buildRecraftUtilityPayload = (includePrompt) => (ctx) => ({
  image_url: ctx.imageUrls?.[0],
  ...includePrompt && ctx.prompt ? { prompt: ctx.prompt } : {}
});
var buildRecraftV4StylesPayload = (apiModel) => (ctx) => {
  if (!ctx.imageUrls?.length) {
    throw new Error("V4 Styles models require style-reference images");
  }
  return {
    prompt: ctx.prompt,
    model: apiModel,
    n: ctx.count ?? 1,
    ...ctx.aspectRatio ? { size: ctx.aspectRatio } : {},
    style_reference_urls: ctx.imageUrls
  };
};
var buildRecraftV4VariantPayload = (apiModel) => (ctx) => ({
  prompt: ctx.prompt,
  model: apiModel,
  n: ctx.count ?? 1,
  ...ctx.aspectRatio ? { size: ctx.aspectRatio } : {},
  ...ctx.imageUrls?.[0] ? { image_url: ctx.imageUrls[0], strength: (ctx.imageWeight ?? 80) / 100 } : {}
});
var buildRecraftExplorePayload = (ctx) => ({
  prompt: ctx.prompt,
  ...ctx.aspectRatio ? { size: ctx.aspectRatio } : {}
});
var buildRecraftExploreSimilarPayload = (ctx) => ({
  source_image_id: ctx.sourceImageId,
  similarity: ctx.similarity ?? 3,
  ...ctx.aspectRatio ? { size: ctx.aspectRatio } : {}
});
var v4StylesParams = p.file("imageUrls", "image", {
  label: "Style References",
  required: true,
  array: { min: 1, max: 5 },
  category: "reference",
  maxBytes: 10 * 1024 * 1024
});
var { MODELS: MODELS29 } = defineModels("recraft", [
  // ── V4.1 family (raster only — vector variants exist in API but not exposed here) ─
  {
    id: "recraftv4_1",
    name: "Recraft V4.1",
    addedAt: "2026-05-18",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4VariantPayload("recraftv4_1"),
    estimatedTime: 17,
    mode: "image",
    inputType: "t2i",
    description: "Next-generation raster output with refined detail and 10K-character prompts.",
    features: [feat("Image Input", "input"), feat("Text in Image", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, "Source Image"),
      ...params.imageWeight(0, 100, 80, 5)
    }
  },
  {
    id: "recraftv4_1_pro",
    name: "Recraft V4.1 Pro",
    addedAt: "2026-05-18",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4VariantPayload("recraftv4_1_pro"),
    estimatedTime: 35,
    mode: "image",
    inputType: "t2i",
    badge: ["premium"],
    description: "Pro-tier V4.1 with enhanced quality and detail for premium output.",
    features: [feat("Image Input", "input"), feat("Text in Image", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, "Source Image"),
      ...params.imageWeight(0, 100, 80, 5)
    }
  },
  {
    id: "recraftv4_1_utility",
    name: "Recraft V4.1 Utility",
    addedAt: "2026-05-18",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4VariantPayload("recraftv4_1_utility"),
    estimatedTime: 15,
    mode: "image",
    inputType: "t2i",
    description: "V4.1 tuned for utility output \u2014 icons, logos, and functional design assets.",
    features: [feat("Image Input", "input"), feat("Utility", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, "Source Image"),
      ...params.imageWeight(0, 100, 80, 5)
    }
  },
  {
    id: "recraftv4_1_utility_pro",
    name: "Recraft V4.1 Utility Pro",
    addedAt: "2026-05-18",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4VariantPayload("recraftv4_1_utility_pro"),
    estimatedTime: 25,
    mode: "image",
    inputType: "t2i",
    badge: ["premium"],
    description: "Pro-tier V4.1 utility \u2014 premium quality for icons, logos, and design assets.",
    features: [feat("Image Input", "input"), feat("Utility", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, "Source Image"),
      ...params.imageWeight(0, 100, 80, 5)
    }
  },
  // ── V4.1 vector variants ─────
  {
    id: "recraftv4_1_vector",
    name: "Recraft V4.1 Vector",
    addedAt: "2026-05-18",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4VariantPayload("recraftv4_1_vector"),
    estimatedTime: 22,
    mode: "image",
    inputType: "t2i",
    description: "Dedicated SVG vector output using V4.1 with clean lines.",
    features: [feat("Image Input", "input"), feat("Vector/SVG", "characteristic"), feat("Text in Image", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, "Source Image"),
      ...params.imageWeight(0, 100, 80, 5)
    }
  },
  {
    id: "recraftv4_1_pro_vector",
    name: "Recraft V4.1 Pro Vector",
    addedAt: "2026-05-18",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4VariantPayload("recraftv4_1_pro_vector"),
    estimatedTime: 40,
    mode: "image",
    inputType: "t2i",
    badge: ["premium"],
    description: "Pro-tier V4.1 SVG vector output with enhanced detail.",
    features: [feat("Image Input", "input"), feat("Vector/SVG", "characteristic"), feat("Text in Image", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, "Source Image"),
      ...params.imageWeight(0, 100, 80, 5)
    }
  },
  {
    id: "recraftv4_1_utility_vector",
    name: "Recraft V4.1 Utility Vector",
    addedAt: "2026-05-18",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4VariantPayload("recraftv4_1_utility_vector"),
    estimatedTime: 18,
    mode: "image",
    inputType: "t2i",
    description: "V4.1 utility tuned for SVG vector output \u2014 icons, logos, design assets.",
    features: [feat("Image Input", "input"), feat("Vector/SVG", "characteristic"), feat("Utility", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, "Source Image"),
      ...params.imageWeight(0, 100, 80, 5)
    }
  },
  {
    id: "recraftv4_1_utility_pro_vector",
    name: "Recraft V4.1 Utility Pro Vector",
    addedAt: "2026-05-18",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4VariantPayload("recraftv4_1_utility_pro_vector"),
    estimatedTime: 30,
    mode: "image",
    inputType: "t2i",
    badge: ["premium"],
    description: "Pro-tier V4.1 utility SVG vector output for premium design assets.",
    features: [feat("Image Input", "input"), feat("Vector/SVG", "characteristic"), feat("Utility", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, "Source Image"),
      ...params.imageWeight(0, 100, 80, 5)
    }
  },
  // ── App models ────────────────────────────────────────────────────
  {
    id: "recraftv4",
    name: "Recraft V4",
    addedAt: "2026-02-18",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4Payload,
    estimatedTime: 17,
    mode: "image",
    inputType: "t2i",
    description: "Raster and vector output with clean text placement and 10K-character prompts.",
    features: [feat("Image Input", "input"), feat("Vector/SVG", "characteristic"), feat("Text in Image", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...params.style([{ id: "raster", label: "Raster" }, { id: "vector_illustration", label: "Vector (SVG)" }], "raster"),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, "Source Image"),
      ...params.imageWeight(0, 100, 80, 5)
    }
  },
  {
    id: "recraftv3",
    name: "Recraft V3",
    addedAt: "2026-02-15",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftLegacyPayload("recraftv3"),
    estimatedTime: 12,
    mode: "image",
    inputType: "t2i",
    description: "SVG vector, illustration, and photo styles with readable in-image text.",
    features: [feat("Image Input", "input"), feat("Styles", "style"), feat("Vector/SVG", "characteristic"), feat("Text in Image", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e3 }),
      ...params.style([
        { id: "realistic_image", label: "Realistic" },
        { id: "digital_illustration", label: "Illustration" },
        { id: "vector_illustration", label: "Vector (SVG)" },
        { id: "any", label: "Any" }
      ], "realistic_image"),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.negativePrompt(),
      ...params.imageInput(1, "Source Image"),
      ...params.imageWeight(0, 100, 80, 5)
    }
  },
  {
    id: "recraftv2",
    name: "Recraft 20B",
    addedAt: "2026-02-15",
    deprecated: true,
    // superseded by recraftv3 / recraftv4 / recraftv4_pro
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftLegacyPayload("recraftv2"),
    estimatedTime: 7,
    mode: "image",
    inputType: "t2i",
    description: "20B parameter model with icon, illustration, and vector modes.",
    features: [feat("Styles", "style")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e3 }),
      ...params.style([
        { id: "realistic_image", label: "Realistic" },
        { id: "digital_illustration", label: "Illustration" },
        { id: "vector_illustration", label: "Vector (SVG)" },
        { id: "icon", label: "Icon" }
      ], "realistic_image"),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.negativePrompt()
    }
  },
  // ── V4 Pro / Vector / V3 Vector variants ────────────────────────
  {
    id: "recraftv4_pro",
    name: "Recraft V4 Pro",
    addedAt: "2026-02-20",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4ProPayload,
    estimatedTime: 35,
    mode: "image",
    inputType: "t2i",
    badge: ["premium"],
    description: "Pro-quality raster and vector output with enhanced detail and 10K-character prompts.",
    features: [feat("Image Input", "input"), feat("Vector/SVG", "characteristic"), feat("Text in Image", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...params.style([{ id: "raster", label: "Raster" }, { id: "vector_illustration", label: "Vector (SVG)" }], "raster"),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, "Source Image"),
      ...params.imageWeight(0, 100, 80, 5)
    }
  },
  {
    id: "recraftv4_vector",
    name: "Recraft V4 Vector",
    addedAt: "2026-02-18",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4VariantPayload("recraftv4_vector"),
    estimatedTime: 22,
    mode: "image",
    inputType: "t2i",
    description: "Dedicated SVG vector output with clean lines and 10K-character prompts.",
    features: [feat("Image Input", "input"), feat("Vector/SVG", "characteristic"), feat("Text in Image", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, "Source Image"),
      ...params.imageWeight(0, 100, 80, 5)
    }
  },
  {
    id: "recraftv4_pro_vector",
    name: "Recraft V4 Pro Vector",
    addedAt: "2026-02-20",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4VariantPayload("recraftv4_pro_vector"),
    estimatedTime: 35,
    mode: "image",
    inputType: "t2i",
    badge: ["premium"],
    description: "Pro-quality SVG vector output with enhanced detail and 10K-character prompts.",
    features: [feat("Image Input", "input"), feat("Vector/SVG", "characteristic"), feat("Text in Image", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.imageInput(1, "Source Image"),
      ...params.imageWeight(0, 100, 80, 5)
    }
  },
  // ── V4 Styles family — style-driven via style_id / style_reference_urls ─
  {
    id: "recraftv4_styles",
    name: "Recraft V4 Styles",
    addedAt: "2026-08-14",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4StylesPayload("recraftv4_styles"),
    estimatedTime: 17,
    mode: "image",
    inputType: "t2i",
    description: "Style-focused raster output with 10K-character prompts.",
    features: [feat("Style References", "style"), feat("Text in Image", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...v4StylesParams,
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6])
    }
  },
  {
    id: "recraftv4_styles_vector",
    name: "Recraft V4 Styles Vector",
    addedAt: "2026-08-14",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4StylesPayload("recraftv4_styles_vector"),
    estimatedTime: 22,
    mode: "image",
    inputType: "t2i",
    description: "Style-focused SVG vector output with 10K-character prompts.",
    features: [feat("Style References", "style"), feat("Vector/SVG", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...v4StylesParams,
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6])
    }
  },
  {
    id: "recraftv4_styles_pro",
    name: "Recraft V4 Styles Pro",
    addedAt: "2026-08-14",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4StylesPayload("recraftv4_styles_pro"),
    estimatedTime: 35,
    mode: "image",
    inputType: "t2i",
    badge: ["premium"],
    description: "Pro-quality style-focused raster output with enhanced detail and 10K-character prompts.",
    features: [feat("Style References", "style"), feat("Text in Image", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...v4StylesParams,
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6])
    }
  },
  {
    id: "recraftv4_styles_pro_vector",
    name: "Recraft V4 Styles Pro Vector",
    addedAt: "2026-08-14",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftV4StylesPayload("recraftv4_styles_pro_vector"),
    estimatedTime: 35,
    mode: "image",
    inputType: "t2i",
    badge: ["premium"],
    description: "Pro-quality style-focused SVG vector output with enhanced detail and 10K-character prompts.",
    features: [feat("Style References", "style"), feat("Vector/SVG", "characteristic"), feat("10K Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e4 }),
      ...v4StylesParams,
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6])
    }
  },
  {
    id: "recraftv3_vector",
    name: "Recraft V3 Vector",
    addedAt: "2026-02-18",
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftLegacyPayload("recraftv3_vector"),
    estimatedTime: 15,
    mode: "image",
    inputType: "t2i",
    description: "Dedicated SVG vector output with substyle options and negative prompts.",
    features: [feat("Vector/SVG", "characteristic"), feat("Text in Image", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e3 }),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.negativePrompt()
    }
  },
  // ── V2 Vector variant ──────────────────────────────────────────────
  {
    id: "recraftv2_vector",
    name: "Recraft 20B Vector",
    addedAt: "2026-03-13",
    deprecated: true,
    // superseded by recraftv3_vector / recraftv4_vector
    workflow: "recraft/v1/images/generations",
    buildPayload: buildRecraftLegacyPayload("recraftv2_vector"),
    estimatedTime: 7,
    mode: "image",
    inputType: "t2i",
    description: "Dedicated SVG vector output using the 20B parameter model.",
    features: [feat("Vector/SVG", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e3 }),
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...params.count([1, 2, 4, 6]),
      ...params.negativePrompt()
    }
  },
  // ── Utility models ─────────────────────────────────────────────────
  {
    id: "recraft-vectorize",
    name: "Recraft Vectorize",
    addedAt: "2026-03-13",
    workflow: "recraft/v1/images/vectorize",
    buildPayload: buildRecraftUtilityPayload(true),
    estimatedTime: 10,
    mode: "image",
    inputType: "i2i",
    description: "Convert raster images to clean SVG vector format.",
    features: [feat("Image Input", "input"), feat("Vector/SVG", "characteristic")],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 1e3 }),
      ...params.imageInput(1, "Source Image", true)
    }
  },
  {
    id: "recraft-creative-upscale",
    name: "Recraft Creative Upscale",
    addedAt: "2026-03-13",
    workflow: "recraft/v1/images/creativeUpscale",
    buildPayload: buildRecraftUtilityPayload(false),
    estimatedTime: 15,
    mode: "image",
    inputType: "i2i",
    description: "AI-enhanced upscaling that adds creative detail to enlarged images.",
    features: [feat("Image Input", "input"), feat("Upscale", "characteristic")],
    paramConfig: {
      ...params.imageInput(1, "Source Image", true)
    }
  },
  {
    id: "recraft-crisp-upscale",
    name: "Recraft Crisp Upscale",
    addedAt: "2026-03-13",
    workflow: "recraft/v1/images/crispUpscale",
    buildPayload: buildRecraftUtilityPayload(false),
    estimatedTime: 10,
    mode: "image",
    inputType: "i2i",
    description: "Clean upscaling that preserves sharp edges and fine detail.",
    features: [feat("Image Input", "input"), feat("Upscale", "characteristic")],
    paramConfig: {
      ...params.imageInput(1, "Source Image", true)
    }
  },
  {
    id: "recraftv3-replace-bg",
    name: "Recraft Replace Background",
    addedAt: "2026-03-13",
    workflow: "recraft/v1/images/replaceBackground",
    buildPayload: buildRecraftUtilityPayload(true),
    estimatedTime: 10,
    mode: "image",
    inputType: "i2i",
    description: "Replace the background of an image using a text prompt.",
    features: [feat("Image Input", "input")],
    paramConfig: {
      ...params.prompt({ required: false, maxLength: 1e3 }),
      ...params.imageInput(1, "Source Image", true)
    }
  },
  // ── Explore models ──────────────────────────────────────────────────
  {
    id: "recraft-explore",
    name: "Recraft Explore",
    addedAt: "2026-03-23",
    workflow: "recraft/v1/images/explore",
    buildPayload: buildRecraftExplorePayload,
    estimatedTime: 15,
    mode: "image",
    inputType: "t2i",
    description: "Explore creative image ideas from a text prompt using Recraft V4.",
    features: [feat("Explore Ideas", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 1e3 }),
      ...params.aspectRatio(recraftAspectRatios, "1:1")
    }
  },
  {
    id: "recraft-explore-similar",
    name: "Recraft Explore Similar",
    addedAt: "2026-03-23",
    workflow: "recraft/v1/images/exploresimilar",
    buildPayload: buildRecraftExploreSimilarPayload,
    estimatedTime: 15,
    mode: "image",
    inputType: "i2i",
    description: "Find images visually similar to a previously explored Recraft image.",
    features: [feat("Similarity Search", "characteristic")],
    paramConfig: {
      ...params.aspectRatio(recraftAspectRatios, "1:1"),
      ...p.text("sourceImageId", { label: "Source Image ID", required: true }),
      ...p.range("similarity", 1, 5, 3, { step: 1 })
    }
  }
]);

// src/vendors/catalog/topaz.ts
var TOPAZ_IMAGE_MODEL_OPTIONS = [
  "Standard V2",
  "Standard MAX",
  "Low Resolution V2",
  "High Fidelity V2",
  "CGI",
  "Text Refine",
  "Redefine",
  "Recovery",
  "Recovery V2",
  "Wonder",
  "Wonder 3"
];
var TOPAZ_VIDEO_MODEL_OPTIONS = [
  "Proteus",
  "Artemis HQ",
  "Artemis MQ",
  "Artemis LQ",
  "Nyx",
  "Nyx Fast",
  "Nyx XL",
  "Nyx HF",
  "Gaia HQ",
  "Gaia CG",
  "Gaia 2",
  "Starlight Precise 1",
  "Starlight Precise 2",
  "Starlight Precise 2.5",
  "Starlight HQ",
  "Starlight Mini",
  "Starlight Sharp",
  "Starlight Fast 1",
  "Starlight Fast 2"
];
var { MODELS: MODELS30 } = defineModels("topaz", [
  {
    id: "topaz-upscale-image",
    name: "Topaz Image Upscale",
    addedAt: "2026-03-06",
    workflow: "topaz/upscale/image",
    estimatedTime: 30,
    mode: "image",
    inputType: "i2i",
    description: "Image upscaling and enhancement with Topaz AI \u2014 Standard, Hi-Fi, CGI, Recovery and Wonder models.",
    features: [feat("Upscale", "quality"), feat("Image Required", "input")],
    paramConfig: {
      ...params.imageInput(1, "Image", true),
      ...p.enum("model", [...TOPAZ_IMAGE_MODEL_OPTIONS], "Standard V2", { label: "Model" })
    }
  },
  {
    id: "topaz-upscale-video",
    name: "Topaz Video Upscale",
    addedAt: "2026-07-21",
    workflow: "topaz/upscale/video",
    estimatedTime: 600,
    mode: "video",
    inputType: "v2v",
    description: "Video upscaling and enhancement with Topaz AI \u2014 Proteus, Artemis, Nyx, Gaia and Starlight models.",
    features: [feat("Upscale", "quality"), feat("Video Required", "input")],
    paramConfig: {
      ...params.videoInput("Source Video", "asset", true),
      ...p.enum("model", [...TOPAZ_VIDEO_MODEL_OPTIONS], "Proteus", { label: "Model" })
    }
  }
]);

// src/vendors/catalog/topaz.payloads.ts
var buildTopazImagePayload = (input) => ({
  image_url: input.imageUrls[0],
  model: input.model ?? "Standard V2",
  upscale_factor: 2,
  output_format: "png",
  face_enhancement: false,
  face_enhancement_creativity: 0,
  face_enhancement_strength: 0.8,
  subject_detection: "All",
  crop_to_fill: false
});
var buildTopazVideoPayload = (input) => ({
  video_url: input.videoUrl,
  model: input.model ?? "Proteus",
  upscale_factor: 2,
  H264_output: false
});
registerPayloads(MODELS30, {
  "topaz-upscale-image": buildTopazImagePayload,
  "topaz-upscale-video": buildTopazVideoPayload
});

// src/core/helpers.ts
var resolveImageSize = (ctx, arMap) => ctx.aspectRatio && arMap[ctx.aspectRatio] || ctx.size;

// src/vendors/catalog/picsart.ts
var MAX_WORDS = 77;
var truncateWords = (text) => {
  const words = text.split(/\s+/);
  return words.length <= MAX_WORDS ? text : words.slice(0, MAX_WORDS).join(" ");
};
var buildChangeBgPayload = (ctx) => ({
  imageUrl: ctx.imageUrls?.[0] ?? "",
  prompt: truncateWords(ctx.prompt),
  count: 1
});
var buildRemoveBgPayload = (ctx) => ({
  photo: ctx.imageUrls?.[0] ?? "",
  postprocess_image: true,
  model: "model-sod-v8-2"
});
var sodOutputSchema = {
  parse(output) {
    const obj = output;
    const data = obj?.data;
    const url = data?.image;
    if (typeof url !== "string") throw new Error("No image URL in remove-bg response");
    return { url };
  }
};
var buildEnhancePayload = (ctx) => ({
  image: ctx.imageUrls?.[0] ?? "",
  upscale: { enabled: true, target_scale: 2 },
  face_enhancement: { enabled: true },
  colour_correction: { enabled: false },
  output_format: "PNG"
});
var buildPcpQwenEditPayload = (ctx) => {
  const urls = ctx.imageUrls ?? [];
  const imagePart2 = urls.length > 1 ? { image: urls } : urls.length === 1 ? { image: urls[0] } : {};
  return {
    ...imagePart2,
    ...ctx.prompt ? { prompt: ctx.prompt } : {},
    ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {}
  };
};
var buildPcpQwenAnglePayload = (ctx) => {
  const c = ctx;
  return {
    ...buildPcpQwenEditPayload(ctx),
    ...c.numInferenceSteps != null ? { num_inference_steps: c.numInferenceSteps } : {},
    ...ctx.cfgScale != null ? { guidance_scale: ctx.cfgScale } : {},
    ...c.loraWeights ? { lora_params: { lora_weights: c.loraWeights, keep_other_weights: false } } : {}
  };
};
var buildPcpFluxKleinPayload = (ctx) => {
  const size = resolveImageSize(ctx, FLUX_AR_TO_SIZE);
  const [w, h] = size ? size.split("x").map((n) => parseInt(n)) : [1024, 1024];
  return {
    prompt: ctx.prompt,
    width: w,
    height: h,
    ...ctx.imageUrls?.length ? { images: ctx.imageUrls.slice(0, 3) } : {}
  };
};
var SANA_AR_TO_SIZE = {
  "1:1": "1024x1024",
  "4:3": "1024x768",
  "3:4": "768x1024",
  "3:2": "1152x768",
  "2:3": "768x1152",
  "16:9": "1344x768",
  "9:16": "768x1344",
  "2:1": "1408x704",
  "1:2": "704x1408"
};
var buildFlowEffectsPayload = (ctx) => ({
  // Wire field stays `template` — the deployed adapter's command contract.
  template: ctx.templateId ?? "",
  imageUrls: ctx.imageUrls ?? []
});
var buildPcpSanaSprintPayload = (ctx) => {
  const size = resolveImageSize(ctx, SANA_AR_TO_SIZE);
  const [w, h] = size ? size.split("x").map((n) => parseInt(n)) : [1024, 1024];
  return {
    model: "picsart-sana-sprint-v1",
    prompt: ctx.prompt,
    width: w,
    height: h
  };
};
var { MODELS: MODELS31 } = defineModels("picsart", [
  {
    id: "picsart-change-bg",
    name: "Picsart Change Background",
    addedAt: "2026-02-15",
    workflow: "v4/smart-background",
    syncExecute: true,
    buildPayload: buildChangeBgPayload,
    mode: "image",
    inputType: "i2i",
    description: "Swap the background of a photo using a text prompt for the new scene.",
    features: [feat("Background Replace", "characteristic"), feat("Image Required", "input")],
    paramConfig: {
      ...params.imageInput(1, "Source Image", true),
      ...params.prompt({ maxLength: 460 })
    }
  },
  {
    id: "picsart-sod-v8-2",
    name: "Remove Background",
    addedAt: "2026-04-02",
    workflow: "pcp/v2/sod",
    syncExecute: true,
    buildPayload: buildRemoveBgPayload,
    outputSchema: sodOutputSchema,
    mode: "image",
    inputType: "i2i",
    description: "Remove the background from any image with precision, leaving a clean cutout.",
    features: [feat("Background Remove", "characteristic"), feat("Image Required", "input")],
    paramConfig: { ...params.imageInput(1, "Source Image", true) }
  },
  {
    id: "picsart-enhance",
    name: "Enhance",
    addedAt: "2026-04-02",
    workflow: "pcp/v1/enhancement",
    buildPayload: buildEnhancePayload,
    mode: "image",
    inputType: "i2i",
    estimatedTime: 6,
    description: "AI image enhancement with upscale and face enhancement.",
    features: [feat("Enhancement", "quality"), feat("Image Required", "input")],
    paramConfig: { ...params.imageInput(1, "Source Image", true) }
  },
  {
    id: "picsart-qwen-image-edit",
    name: "Picsart Image Edit",
    addedAt: "2026-04-23",
    workflow: "pcp/v1/qwen-image-edit",
    buildPayload: buildPcpQwenEditPayload,
    estimatedTime: 20,
    mode: "image",
    inputType: "i2i",
    description: "General-purpose image editing for swaps, fixes, style changes, and creative edits.",
    features: [feat("Image Input", "input"), feat("Multi-Ref", "characteristic")],
    paramConfig: {
      ...params.imageInput(3, "Source Images", true),
      ...params.prompt(),
      ...params.negativePrompt()
    }
  },
  {
    id: "picsart-qwen-makeup",
    name: "Picsart Makeup",
    addedAt: "2026-04-23",
    workflow: "pcp/v2/qwen-makeup",
    buildPayload: buildPcpQwenEditPayload,
    estimatedTime: 20,
    mode: "image",
    inputType: "i2i",
    description: "Apply virtual makeup to portraits \u2014 lipstick, eye looks, blush, and full styled looks.",
    features: [feat("Image Input", "input"), feat("Beauty", "characteristic")],
    paramConfig: {
      ...params.imageInput(1, "Portrait", true),
      ...params.prompt(),
      ...params.negativePrompt()
    }
  },
  {
    id: "picsart-qwen-image-edit-angle",
    name: "Picsart Angle Change",
    addedAt: "2026-06-30",
    workflow: "pcp/v1/qwen-image-edit-angle",
    buildPayload: buildPcpQwenAnglePayload,
    estimatedTime: 20,
    mode: "image",
    inputType: "i2i",
    description: "Change the camera angle / viewpoint of a subject with automatic relighting.",
    features: [feat("Image Input", "input"), feat("Multi-Ref", "characteristic")],
    paramConfig: {
      ...params.imageInput(3, "Source Images", true),
      ...params.prompt({ placeholder: "e.g. front-left quarter view elevated shot medium shot" }),
      ...params.negativePrompt(),
      numInferenceSteps: {
        label: "Inference Steps",
        descriptor: { kind: "range", min: 1, max: 50, step: 1, default: 16 }
      },
      ...params.cfgScale(1, 10, 4),
      loraWeights: {
        label: "LoRA Weights",
        descriptor: {
          kind: "object",
          fields: {
            lora_angle: { kind: "range", min: 0, max: 1, step: 0.1, default: 1, required: false },
            lora_angle_lighting: { kind: "range", min: 0, max: 1, step: 0.1, default: 1, required: false }
          }
        }
      }
    }
  },
  {
    id: "picsart-flux-2-klein",
    name: "Flux 2 Klein 4B",
    addedAt: "2026-04-23",
    workflow: "pcp/v1/flux-text-to-image",
    buildPayload: buildPcpFluxKleinPayload,
    estimatedTime: 8,
    mode: "image",
    inputType: "t2i",
    badge: ["fast"],
    description: "Fast Flux 2 Klein 4B \u2014 up to 3 optional reference images.",
    features: [feat("Multi-Image Input", "input"), feat("Fast", "characteristic")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(Object.keys(FLUX_AR_TO_SIZE), "1:1"),
      ...params.imageInput(3, "Reference Images")
    }
  },
  {
    id: "picsart-sana-sprint-v1",
    name: "Picsart SANA-Sprint",
    addedAt: "2026-05-19",
    workflow: "pcp/v1/sana-sprint",
    syncExecute: true,
    buildPayload: buildPcpSanaSprintPayload,
    estimatedTime: 3,
    mode: "image",
    inputType: "t2i",
    badge: ["new", "fast"],
    description: "Fast text-to-image generation powered by SANA-Sprint.",
    features: [feat("Text-to-Image", "input"), feat("Fast", "characteristic")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(Object.keys(SANA_AR_TO_SIZE), "1:1")
    }
  },
  {
    id: "picsart-flow",
    name: "Picsart Effects",
    addedAt: "2026-08-14",
    workflow: "picsart-flow/v1/effects",
    buildPayload: buildFlowEffectsPayload,
    estimatedTime: 35,
    mode: "image",
    inputType: "i2i",
    badge: ["new"],
    description: "Apply curated Picsart effect presets to a photo \u2014 multi-step Magic Flow pipelines, one tap.",
    features: [feat("Effect Presets", "characteristic"), feat("Image Required", "input")],
    paramConfig: {
      ...params.catalog("templateId", {
        label: "Effect Preset",
        required: true,
        source: { workflow: "picsart-flow/v1/catalog/templates", modelId: "picsart-flow" },
        default: ""
      }),
      // Slot count per template rides the catalog item's meta.imageSlots.
      ...params.imageInput(3, "Your Photo", true, "asset")
    }
  },
  {
    id: "picsart-flow-video",
    name: "Picsart Effects Video",
    addedAt: "2026-08-14",
    workflow: "picsart-flow/v1/effects",
    buildPayload: buildFlowEffectsPayload,
    estimatedTime: 150,
    mode: "video",
    inputType: "i2v",
    badge: ["new"],
    description: "Animate a photo with curated Picsart video presets \u2014 multi-step Magic Flow pipelines, one tap.",
    features: [feat("Effect Presets", "characteristic"), feat("Image Required", "input")],
    paramConfig: {
      ...params.catalog("templateId", {
        label: "Effect Preset",
        required: true,
        source: { workflow: "picsart-flow/v1/catalog/templates", modelId: "picsart-flow-video" },
        default: ""
      }),
      ...params.imageInput(3, "Your Photo", true, "asset")
    }
  },
  {
    id: "picsart-hidream-t2i",
    name: "Picsart HiDream T2I",
    addedAt: "2026-07-29",
    workflow: "pcp/v1/hidream-t2i",
    estimatedTime: 7,
    // measured on the backend service; p95 ~6.5s
    mode: "image",
    inputType: "t2i",
    release: "preview",
    description: "Fast text-to-image generation powered by HiDream-Image-O1",
    features: [feat("Text-to-Image", "input")],
    paramConfig: {
      ...params.prompt(),
      // The worker accepts any "W:H"; this list mirrors what Flux 2 Pro exposes.
      // Deliberately not derived from FLUX_AR_TO_SIZE: HiDream passes the ratio
      // straight through to the task, so its options must not drift with changes
      // to Flux's ratio-to-size map.
      ...params.aspectRatio(["1:1", "5:3", "3:5", "4:3", "3:4"], "1:1")
    }
  }
]);

// src/vendors/catalog/lyria.ts
var imagePart = (url) => ({ url, mimeType: "image/jpeg" });
var buildLyria3Payload = (apiModelId) => (ctx) => ({
  prompt: ctx.prompt,
  model: apiModelId,
  ...ctx.imageUrls?.length === 1 ? { image: imagePart(ctx.imageUrls[0]) } : {},
  ...(ctx.imageUrls?.length ?? 0) > 1 ? { images: ctx.imageUrls.slice(0, 10).map(imagePart) } : {}
});
var { MODELS: MODELS32 } = defineModels("google", [
  {
    id: "lyria-3-clip",
    addedAt: "2026-03-26",
    name: "Lyria 3 Clip",
    modelId: "lyria-3-clip-preview",
    workflow: "lyria/v2/music",
    buildPayload: buildLyria3Payload("lyria-3-clip-preview"),
    estimatedTime: 30,
    mode: "audio",
    inputType: "music",
    description: "Fast music clips from text and image prompts using Google Lyria 3.",
    features: [feat("Image Input", "input"), feat("Vocal & Instrumental", "characteristic")],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(10, "Mood Images")
    }
  },
  {
    id: "lyria-3-pro",
    addedAt: "2026-03-26",
    name: "Lyria 3 Pro",
    modelId: "lyria-3-pro-preview",
    workflow: "lyria/v2/music",
    buildPayload: buildLyria3Payload("lyria-3-pro-preview"),
    estimatedTime: 45,
    mode: "audio",
    inputType: "music",
    badge: ["premium"],
    description: "Extended music generation up to 184s with vocals, powered by Google Lyria 3 Pro.",
    features: [feat("Image Input", "input"), feat("Vocal & Instrumental", "characteristic"), feat("Up to 184s", "duration")],
    paramConfig: {
      ...params.prompt({ placeholder: "Generate voiceover, music and sound effects" }),
      ...params.imageInput(10, "Mood Images")
    }
  }
]);

// src/vendors/catalog/happyhorse.ts
var buildHHT2VPayload = (ctx) => ({
  prompt: ctx.prompt,
  resolution: ctx.resolution ?? "720P",
  ratio: ctx.aspectRatio ?? "16:9",
  duration: ctx.duration ?? 5,
  watermark: false,
  ...ctx.seed != null ? { seed: ctx.seed } : {}
});
var buildHHI2VPayload = (ctx) => {
  const firstFrameUrl = ctx.startFrame ?? ctx.imageUrls?.[0];
  const media = [];
  if (firstFrameUrl) media.push({ type: "first_frame", url: firstFrameUrl });
  return {
    media,
    resolution: ctx.resolution ?? "720P",
    duration: ctx.duration ?? 5,
    watermark: false,
    ...ctx.prompt ? { prompt: ctx.prompt } : {},
    ...ctx.seed != null ? { seed: ctx.seed } : {}
  };
};
var buildHHR2VPayload = (ctx) => {
  const media = (ctx.imageUrls ?? []).map((url) => ({ type: "reference_image", url }));
  return {
    prompt: ctx.prompt,
    media,
    resolution: ctx.resolution ?? "720P",
    ratio: ctx.aspectRatio ?? "16:9",
    duration: ctx.duration ?? 5,
    watermark: false,
    ...ctx.seed != null ? { seed: ctx.seed } : {}
  };
};
var buildHHVideoEditPayload = (ctx) => {
  const media = [];
  if (ctx.videoUrl) media.push({ type: "video", url: ctx.videoUrl });
  for (const url of (ctx.imageUrls ?? []).slice(0, 5)) {
    media.push({ type: "reference_image", url });
  }
  return {
    prompt: ctx.prompt,
    media,
    resolution: ctx.resolution ?? "720P",
    watermark: false,
    ...ctx.audioSetting ? { audio_setting: ctx.audioSetting } : {},
    ...ctx.seed != null ? { seed: ctx.seed } : {}
  };
};
var buildHH11T2VPayload = (ctx) => ({
  prompt: ctx.prompt,
  resolution: ctx.resolution ?? "720P",
  ratio: ctx.aspectRatio ?? "16:9",
  duration: ctx.duration ?? 5,
  watermark: false,
  ...ctx.seed != null ? { seed: ctx.seed } : {}
});
var buildHH11I2VPayload = (ctx) => {
  const firstFrameUrl = ctx.startFrame ?? ctx.imageUrls?.[0];
  const media = [];
  if (firstFrameUrl) media.push({ type: "first_frame", url: firstFrameUrl });
  return {
    media,
    resolution: ctx.resolution ?? "720P",
    duration: ctx.duration ?? 5,
    watermark: false,
    ...ctx.prompt ? { prompt: ctx.prompt } : {},
    ...ctx.seed != null ? { seed: ctx.seed } : {}
  };
};
var buildHH11R2VPayload = (ctx) => {
  const media = (ctx.imageUrls ?? []).map((url) => ({ type: "reference_image", url }));
  return {
    prompt: ctx.prompt,
    media,
    resolution: ctx.resolution ?? "720P",
    ratio: ctx.aspectRatio ?? "16:9",
    duration: ctx.duration ?? 5,
    watermark: false,
    ...ctx.seed != null ? { seed: ctx.seed } : {}
  };
};
var HH_AR = ["16:9", "9:16", "1:1", "4:3", "3:4"];
var HH_RES = ["720P", "1080P"];
var { MODELS: MODELS33 } = defineModels("happyhorse", [
  {
    id: "happyhorse-1.0-t2v",
    name: "Happy Horse 1.0",
    modelId: "happyhorse-1.0",
    addedAt: "2026-04-23",
    workflow: "happyhorse/v1/text-to-video",
    editWorkflow: "happyhorse/v1/image-to-video",
    buildPayload: buildHHT2VPayload,
    buildEditPayload: buildHHI2VPayload,
    estimatedTime: 30,
    mode: "video",
    inputType: "t2v",
    description: "Happy Horse 1.0 \u2014 up to 15s at 1080P with optional first-frame guidance.",
    features: [
      feat("Start Frame", "frame"),
      feat("1080P", "resolution"),
      feat("3-15 sec", "duration")
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.seed(),
      ...params.aspectRatio(HH_AR, "16:9"),
      ...params.resolution(HH_RES, "720P"),
      // Vendor/worker accept any integer 3-15 (docs: default 5).
      ...params.durationRange(3, 15, 5),
      ...params.startFrame()
    }
  },
  {
    id: "happyhorse-1.0-r2v",
    name: "Happy Horse 1.0 Ref-to-Video",
    modelId: "happyhorse-1.0",
    addedAt: "2026-05-05",
    workflow: "happyhorse/v1/reference-to-video",
    buildPayload: buildHHR2VPayload,
    estimatedTime: 30,
    mode: "video",
    inputType: "i2v",
    badge: ["new"],
    description: "Generate video from up to 9 reference images \u2014 refer to them in the prompt as `[Image 1]`, `[Image 2]`, \u2026 in the same order they appear in the input list.",
    features: [
      feat("Multi-Image Input", "input"),
      feat("1080P", "resolution"),
      feat("3-15 sec", "duration")
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.seed(),
      ...params.aspectRatio(HH_AR, "16:9"),
      ...params.resolution(HH_RES, "720P"),
      // Vendor/worker accept any integer 3-15 (docs: default 5).
      ...params.durationRange(3, 15, 5),
      ...params.imageInput(9, "Reference Images", true)
    }
  },
  {
    id: "happyhorse-1.0-video-edit",
    name: "Happy Horse 1.0 Video Edit",
    modelId: "happyhorse-1.0",
    addedAt: "2026-05-05",
    workflow: "happyhorse/v1/video-edit",
    buildPayload: buildHHVideoEditPayload,
    estimatedTime: 22,
    mode: "video",
    inputType: "v2v",
    badge: ["new"],
    description: "Edit video \u2014 style transfer or object replacement, with up to 5 references.",
    features: [
      feat("Video Input", "input"),
      feat("Image Input", "input"),
      feat("1080P", "resolution")
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.seed(),
      ...params.resolution(HH_RES, "720P"),
      ...params.audioSetting(),
      ...params.videoInput("Source Video"),
      ...params.imageInput(5, "Reference Images")
    }
  },
  {
    id: "happyhorse-1.1-t2v",
    name: "Happy Horse 1.1",
    modelId: "happyhorse-1.1",
    addedAt: "2026-06-22",
    workflow: "happyhorse/v1.1/text-to-video",
    editWorkflow: "happyhorse/v1.1/image-to-video",
    buildPayload: buildHH11T2VPayload,
    buildEditPayload: buildHH11I2VPayload,
    estimatedTime: 30,
    mode: "video",
    inputType: "t2v",
    description: "Happy Horse 1.1 \u2014 up to 15s at 1080P with optional first-frame guidance.",
    features: [
      feat("Start Frame", "frame"),
      feat("1080P", "resolution"),
      feat("3-15 sec", "duration")
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.seed(),
      ...params.aspectRatio(HH_AR, "16:9"),
      ...params.resolution(HH_RES, "720P"),
      // Vendor/worker accept any integer 3-15 (docs: default 5).
      ...params.durationRange(3, 15, 5),
      ...params.startFrame()
    }
  },
  {
    id: "happyhorse-1.1-r2v",
    name: "Happy Horse 1.1 Ref-to-Video",
    modelId: "happyhorse-1.1",
    addedAt: "2026-06-22",
    workflow: "happyhorse/v1.1/reference-to-video",
    buildPayload: buildHH11R2VPayload,
    estimatedTime: 30,
    mode: "video",
    inputType: "i2v",
    description: "Generate video from up to 9 reference images \u2014 refer to them in the prompt as `[Image 1]`, `[Image 2]`, \u2026 in the same order they appear in the input list.",
    features: [
      feat("Multi-Image Input", "input"),
      feat("1080P", "resolution"),
      feat("3-15 sec", "duration")
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.seed(),
      ...params.aspectRatio(HH_AR, "16:9"),
      ...params.resolution(HH_RES, "720P"),
      // Vendor/worker accept any integer 3-15 (docs: default 5).
      ...params.durationRange(3, 15, 5),
      ...params.imageInput(9, "Reference Images", true)
    }
  }
]);

// src/vendors/catalog/pixverse.ts
var PIXVERSE_QUALITIES = ["360p", "540p", "720p", "1080p"];
var PIXVERSE_ASPECT_RATIOS = ["16:9", "4:3", "1:1", "3:4", "9:16", "2:3", "3:2", "21:9"];
var PIXVERSE_DURATIONS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
var MAX_REFERENCE_IMAGES = 7;
var baseParams = {
  ...params.prompt({ maxLength: 5e3 }),
  ...p.quality(PIXVERSE_QUALITIES, "540p"),
  ...params.duration(PIXVERSE_DURATIONS, 5),
  ...params.generateAudio(false)
};
var baseFeatures = [
  feat("Audio", "audio"),
  feat("Up to 1080p", "resolution"),
  feat("5-15 sec", "duration")
];
var { MODELS: MODELS34 } = defineModels("pixverse", [
  // ── V6 ─────────────────────────────────────────────────────────────
  {
    id: "pixverse-v6",
    name: "PixVerse V6",
    addedAt: "2026-06-12",
    workflow: "pixverse/v2/text-to-video",
    estimatedTime: 60,
    mode: "video",
    inputType: "t2v",
    description: "Generate video from a text prompt with PixVerse V6.",
    features: [...baseFeatures],
    paramConfig: {
      ...baseParams,
      ...params.aspectRatio(PIXVERSE_ASPECT_RATIOS, "16:9")
    }
  },
  {
    id: "pixverse-v6-image",
    name: "PixVerse V6 Image",
    addedAt: "2026-06-12",
    workflow: "pixverse/v2/image-to-video",
    estimatedTime: 60,
    mode: "video",
    inputType: "i2v",
    description: "Animate a source image into video with PixVerse V6.",
    features: [feat("Image Input", "input"), ...baseFeatures],
    paramConfig: {
      ...baseParams,
      ...params.imageInput(1, "Source Image", true, "asset")
    }
  },
  {
    id: "pixverse-v6-fusion",
    name: "PixVerse V6 Fusion",
    addedAt: "2026-06-12",
    workflow: "pixverse/v2/reference-to-video",
    estimatedTime: 60,
    mode: "video",
    inputType: "i2v",
    description: "Fuse up to 7 reference images (subjects/backgrounds) into a new video scene with PixVerse V6.",
    features: [feat("Reference Images", "input"), ...baseFeatures],
    paramConfig: {
      ...baseParams,
      ...params.aspectRatio(PIXVERSE_ASPECT_RATIOS, "16:9"),
      ...params.imageInput(MAX_REFERENCE_IMAGES, "Reference Images", true, "reference")
    }
  },
  // ── C1 ─────────────────────────────────────────────────────────────
  {
    id: "pixverse-c1",
    name: "PixVerse C1",
    addedAt: "2026-06-12",
    workflow: "pixverse/v2/text-to-video",
    estimatedTime: 60,
    mode: "video",
    inputType: "t2v",
    description: "Generate video from a text prompt with PixVerse C1.",
    features: [...baseFeatures],
    paramConfig: {
      ...baseParams,
      ...params.aspectRatio(PIXVERSE_ASPECT_RATIOS, "16:9")
    }
  },
  {
    id: "pixverse-c1-image",
    name: "PixVerse C1 Image",
    addedAt: "2026-06-12",
    workflow: "pixverse/v2/image-to-video",
    estimatedTime: 60,
    mode: "video",
    inputType: "i2v",
    description: "Animate a source image into video with PixVerse C1.",
    features: [feat("Image Input", "input"), ...baseFeatures],
    paramConfig: {
      ...baseParams,
      ...params.imageInput(1, "Source Image", true, "asset")
    }
  },
  {
    id: "pixverse-c1-fusion",
    name: "PixVerse C1 Fusion",
    addedAt: "2026-06-12",
    workflow: "pixverse/v2/reference-to-video",
    estimatedTime: 60,
    mode: "video",
    inputType: "i2v",
    description: "Fuse up to 7 reference images (subjects/backgrounds) into a new video scene with PixVerse C1.",
    features: [feat("Reference Images", "input"), ...baseFeatures],
    paramConfig: {
      ...baseParams,
      ...params.aspectRatio(PIXVERSE_ASPECT_RATIOS, "16:9"),
      ...params.imageInput(MAX_REFERENCE_IMAGES, "Reference Images", true, "reference")
    }
  }
]);

// src/vendors/catalog/pixverse.payloads.ts
var commonFields = (input, model) => ({
  prompt: input.prompt,
  model,
  quality: input.quality ?? "540p",
  duration: input.duration ?? 5,
  ...input.generateAudio != null ? { generate_audio_switch: input.generateAudio } : {}
});
var buildTextToVideoPayload = (model) => (input) => ({
  ...commonFields(input, model),
  aspect_ratio: input.aspectRatio ?? "16:9"
});
var buildImageToVideoPayload = (model) => (input) => ({
  ...commonFields(input, model),
  image_url: input.startFrame ?? input.imageUrls?.[0]
});
var buildReferenceToVideoPayload = (model) => (input) => ({
  ...commonFields(input, model),
  aspect_ratio: input.aspectRatio ?? "16:9",
  image_references: (input.imageUrls ?? []).map((url) => ({ url }))
});
registerPayloads(MODELS34, {
  "pixverse-v6": buildTextToVideoPayload("v6"),
  "pixverse-v6-image": buildImageToVideoPayload("v6"),
  "pixverse-v6-fusion": buildReferenceToVideoPayload("v6"),
  "pixverse-c1": buildTextToVideoPayload("c1"),
  "pixverse-c1-image": buildImageToVideoPayload("c1"),
  "pixverse-c1-fusion": buildReferenceToVideoPayload("c1")
});

// src/vendors/catalog/async-ai.ts
var { MODELS: MODELS35 } = defineModels("async", [
  {
    id: "async-flash-v1",
    name: "Async Flash v1.0",
    modelId: "async_flash_v1.0",
    addedAt: "2026-06-12",
    workflow: "async-ai-text-to-speech",
    estimatedTime: 12,
    mode: "audio",
    inputType: "tts",
    description: "Generate natural speech from text with Async AI\u2019s Flash voice engine.",
    features: [feat("Text to Speech", "characteristic"), feat("Fast", "characteristic")],
    paramConfig: {
      ...params.prompt(),
      ...params.voiceId([], ASYNC_DEFAULT_VOICE_ID, { catalog: { workflow: "async-ai/v1/catalog/voices" } }),
      ...p.enum("container", ["mp3", "wav", "raw"], "mp3", { label: "Audio Format" }),
      ...p.range("sampleRate", 8e3, 48e3, 24e3, { label: "Sample Rate" }),
      // encoding ignored when container is mp3
      ...p.enum("encoding", ["pcm_s16le", "pcm_f32le"], "pcm_s16le", { label: "Encoding" }),
      // bitRate applies only to mp3
      ...p.range("bitRate", 32e3, 32e4, 192e3, { label: "Bit Rate" })
    }
  }
]);

// src/vendors/catalog/async-ai.payloads.ts
var buildAsyncTtsPayload = (input) => {
  const container = input.container ?? "mp3";
  return {
    model_id: "async_flash_v1.0",
    transcript: input.prompt,
    voice: { mode: "id", id: input.voiceId || ASYNC_DEFAULT_VOICE_ID },
    output_format: {
      container,
      sample_rate: input.sampleRate ?? 24e3,
      ...container !== "mp3" ? { encoding: input.encoding ?? "pcm_s16le" } : {},
      ...container === "mp3" ? { bit_rate: input.bitRate ?? 192e3 } : {}
    }
  };
};
registerPayloads(MODELS35, { "async-flash-v1": buildAsyncTtsPayload });

// src/vendors/catalog/llm.ts
var ADDED = "2026-06-16";
var thinkingParam = (levels) => p.enum("thinking", ["off", ...levels], "off", { label: "Thinking" });
var { MODELS: ANTHROPIC } = defineModels("anthropic", [
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    workflow: "claude/v1/messages",
    addedAt: ADDED,
    estimatedTime: 10,
    mode: "text",
    inputType: "i2t",
    badge: ["premium"],
    description: "Anthropic\u2019s most capable model for complex reasoning and long-form analysis.",
    features: [feat("Vision", "input")],
    paramConfig: { ...params.prompt(), ...params.imageInput(8, "Images") }
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    workflow: "claude/v1/messages",
    addedAt: ADDED,
    estimatedTime: 6,
    mode: "text",
    inputType: "i2t",
    badge: ["popular"],
    description: "Balanced Claude model \u2014 strong reasoning at lower latency and cost.",
    features: [feat("Vision", "input")],
    paramConfig: { ...params.prompt(), ...params.imageInput(8, "Images") }
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    workflow: "claude/v1/messages",
    addedAt: ADDED,
    estimatedTime: 4,
    mode: "text",
    inputType: "i2t",
    badge: ["fast"],
    description: "Fast, lightweight Claude model for high-volume text tasks.",
    features: [feat("Vision", "input")],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(8, "Images")
    }
  }
]);
var { MODELS: OPENAI_LLM } = defineModels("openai", [
  {
    id: "gpt-5.5",
    name: "GPT-5.5",
    workflow: "chat-completions",
    addedAt: ADDED,
    estimatedTime: 8,
    mode: "text",
    inputType: "i2t",
    badge: ["popular"],
    description: "OpenAI\u2019s flagship multimodal model for general-purpose text generation.",
    features: [feat("Vision", "input"), feat("Thinking", "characteristic")],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(8, "Images"),
      ...thinkingParam(["low", "medium", "high"])
    }
  }
]);
var { MODELS: GEMINI_LLM } = defineModels("google", [
  {
    id: "gemini-3-pro",
    name: "Gemini 3 Pro",
    modelId: "gemini-3-pro-preview",
    workflow: "gemini",
    addedAt: ADDED,
    estimatedTime: 8,
    mode: "text",
    inputType: "v2t",
    badge: ["premium"],
    description: "Google\u2019s top Gemini model \u2014 text, image, and video reasoning.",
    features: [feat("Vision", "input"), feat("Video Input", "input"), feat("Thinking", "characteristic")],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(8, "Images"),
      ...params.videoInput("Video", "reference", false),
      ...thinkingParam(["low", "high"])
    }
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    workflow: "chat-completions",
    addedAt: "2026-08-19",
    estimatedTime: 5,
    mode: "text",
    inputType: "i2t",
    badge: ["fast"],
    description: "Latest fast Gemini model \u2014 low-latency multimodal text generation.",
    features: [feat("Vision", "input"), feat("Thinking", "characteristic")],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(8, "Images"),
      ...thinkingParam(["low", "medium", "high"])
    }
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    workflow: "chat-completions",
    addedAt: "2026-07-22",
    estimatedTime: 5,
    mode: "text",
    inputType: "i2t",
    badge: ["fast"],
    description: "Fast Gemini model \u2014 low-latency multimodal text generation.",
    features: [feat("Vision", "input"), feat("Thinking", "characteristic")],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(8, "Images"),
      ...thinkingParam(["low", "medium", "high"])
    }
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    workflow: "chat-completions",
    addedAt: "2026-07-22",
    estimatedTime: 4,
    mode: "text",
    inputType: "i2t",
    badge: ["fast"],
    description: "Lightweight Gemini model \u2014 the fastest, most cost-efficient tier.",
    features: [feat("Vision", "input")],
    paramConfig: {
      ...params.prompt(),
      ...params.imageInput(8, "Images")
    }
  }
]);
var MODELS36 = [...ANTHROPIC, ...OPENAI_LLM, ...GEMINI_LLM];

// src/vendors/catalog/llm.payloads.ts
var CLAUDE_MAX_TOKENS = 8192;
function inferVideoMime(url) {
  if (/\.webm(\?|$)/i.test(url)) return "video/webm";
  if (/\.mov(\?|$)/i.test(url)) return "video/quicktime";
  return "video/mp4";
}
function geminiThinkingLevel(thinking) {
  if (thinking === "high") return "HIGH";
  if (thinking === "low" || thinking === "medium") return "LOW";
  return void 0;
}
var buildOpenAiPayload = (modelId) => (input) => {
  const content = [{ type: "text", text: input.prompt }];
  for (const url of input.imageUrls ?? []) {
    content.push({ type: "image_url", image_url: { url } });
  }
  return {
    model: modelId,
    messages: [{ role: "user", content }],
    ...input.thinking && input.thinking !== "off" ? { reasoning_effort: input.thinking } : {}
  };
};
var buildClaudePayload = (modelId) => (input) => {
  const content = [{ type: "text", text: input.prompt }];
  for (const url of input.imageUrls ?? []) {
    content.push({ type: "image", source: { type: "url", url } });
  }
  return {
    model: modelId,
    max_tokens: CLAUDE_MAX_TOKENS,
    messages: [{ role: "user", content }]
  };
};
var buildGeminiPayload = (modelId) => (input) => {
  const parts = [{ text: input.prompt }];
  for (const url of input.imageUrls ?? []) {
    parts.push({ type: "IMAGE", imageUrl: url });
  }
  if (input.videoUrl) {
    parts.push({ fileData: { mimeType: inferVideoMime(input.videoUrl), fileUri: input.videoUrl } });
  }
  const level = geminiThinkingLevel(input.thinking);
  return {
    model: modelId,
    contents: [{ role: "user", parts }],
    ...level ? { generationConfig: { thinkingConfig: { thinkingLevel: level } } } : {}
  };
};
registerPayloads(MODELS36, {
  "claude-opus-4-8": buildClaudePayload("claude-opus-4-8"),
  "claude-sonnet-4-6": buildClaudePayload("claude-sonnet-4-6"),
  "claude-haiku-4-5": buildClaudePayload("claude-haiku-4-5"),
  "gpt-5.5": buildOpenAiPayload("gpt-5.5"),
  "gemini-3-pro": buildGeminiPayload("gemini-3-pro-preview"),
  // Flash models route through chat-completions (OpenAI-shaped), not the
  // native `gemini` workflow. flash-lite has no thinking param → reasoning_effort omitted.
  "gemini-3.7-flash": buildOpenAiPayload("gemini-3.7-flash"),
  "gemini-3.6-flash": buildOpenAiPayload("gemini-3.6-flash"),
  "gemini-3.5-flash-lite": buildOpenAiPayload("gemini-3.5-flash-lite")
});

// src/vendors/catalog/captionsai.ts
var CAPTIONS_MAX_DURATION_SEC = 300;
var CAPTIONS_MAX_BYTES = 50 * 1024 * 1024;
var DEFAULT_CAPTION_TEMPLATE_ID = "ctpl_DxflLOnuKkb198FNdI9E";
var { MODELS: MODELS37 } = defineModels("captionsai", [
  {
    id: "captionsai-video-captions",
    name: "Captions",
    modelId: "mirage-captions",
    addedAt: "2026-08-27",
    workflow: "captionsai/v1/videos/captions",
    // ~26s measured for an 8s clip on the live API; scales with clip length.
    estimatedTime: 60,
    mode: "video",
    inputType: "v2v",
    // Stage-only until the worker is deployed to prod and the pricing record
    // (mirage-captions / video-to-video) exists — flip to production then.
    release: "preview",
    description: "Auto-transcribes a vertical video and burns in animated captions from 67 style templates \u2014 up to 5 minutes, 9:16.",
    features: [
      feat("Video Required", "input"),
      feat("9:16", "resolution"),
      feat("Up to 5 min", "duration"),
      feat("67 Templates", "style")
    ],
    paramConfig: {
      ...params.videoInput("Source Video", "asset", true, CAPTIONS_MAX_DURATION_SEC, void 0, CAPTIONS_MAX_BYTES),
      ...params.catalog("templateId", {
        label: "Caption Style",
        // Not `required`: the declared default fills it, and request validation runs
        // before the payload builder — a required flag would reject the very
        // calls the default exists for (same shape as Kling's effect templateId).
        source: { workflow: "captionsai/v1/catalog/caption-templates" },
        default: DEFAULT_CAPTION_TEMPLATE_ID
      })
    }
  }
]);

// src/vendors/catalog/captionsai.payloads.ts
var buildCaptionsPayload = (input) => ({
  video: { url: input.videoUrl },
  caption_template_id: input.templateId ?? DEFAULT_CAPTION_TEMPLATE_ID
});
registerPayloads(MODELS37, {
  "captionsai-video-captions": buildCaptionsPayload
});

// src/vendors/catalog/meta.ts
var { MODELS: MODELS38 } = defineModels("meta", [
  // ── Image ─────────────────────────────────────────
  {
    id: "muse-image-1.0",
    name: "Muse Image 1.0",
    addedAt: "2026-08-31",
    workflow: "meta/v1/images/generations",
    editWorkflow: "meta/v1/images/edits",
    estimatedTime: 60,
    mode: "image",
    inputType: "t2i",
    description: "Meta's agentic image model \u2014 plans with reasoning, web and image search before rendering.",
    features: [feat("Multi-Image Input", "input"), feat("Web Search", "characteristic"), feat("High Quality", "quality")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(["1:1", "3:2", "2:3", "16:9", "9:16", "4:3", "3:4"], "1:1"),
      // Vendor-side reasoning tier for the agentic planner; vendor default high.
      ...p.enum("reasoningStrength", ["low", "high"], "high", { label: "Reasoning" }),
      ...p.enum("moderation", ["auto", "low", "none"], "auto", { label: "Moderation" }),
      // Per-tool planner controls — all-true matches the vendor default
      // (omitting tool_enablement enables every tool).
      ...p.boolean("enableImageSearch", true, "Image Search"),
      ...p.boolean("enableWebSearch", true, "Web Search"),
      ...p.boolean("enableShell", true, "Layout & Chart Tools"),
      ...p.enum("outputFormat", ["png", "jpeg", "webp"], "png", { label: "Format" }),
      ...params.count(),
      ...params.imageInput(5, "Source Images")
    }
  }
]);

// src/vendors/catalog/meta.payloads.ts
var MUSE_AR_TO_SIZE = {
  "1:1": "1024x1024",
  "3:2": "1536x1024",
  "2:3": "1024x1536",
  "16:9": "1820x1024",
  "9:16": "1024x1820",
  "4:3": "1365x1024",
  "3:4": "1024x1365"
};
var buildMuseCommonPayload = (input) => ({
  model: "muse-image-1.0",
  prompt: input.prompt,
  n: input.count ?? 1,
  size: MUSE_AR_TO_SIZE[input.aspectRatio ?? ""] ?? "1024x1024",
  ...input.outputFormat ? { output_format: input.outputFormat } : {},
  ...input.reasoningStrength ? { reasoning_strength: input.reasoningStrength } : {},
  ...input.moderation ? { moderation: input.moderation } : {},
  tool_enablement: {
    enable_image_search: input.enableImageSearch ?? true,
    enable_web_search: input.enableWebSearch ?? true,
    enable_shell: input.enableShell ?? true
  }
});
var buildMuseImagePayload = (input) => buildMuseCommonPayload(input);
var buildMuseImageEditPayload = (input) => ({
  ...buildMuseCommonPayload(input),
  images: input.imageUrls ?? []
});
registerPayloads(MODELS38, {
  "muse-image-1.0": buildMuseImagePayload
});
registerEditPayloads(MODELS38, {
  "muse-image-1.0": buildMuseImageEditPayload
});

// src/vendors/catalog/index.ts
var ALL_MODELS = [
  ...MODELS,
  ...MODELS2,
  ...MODELS3,
  ...MODELS4,
  ...MODELS5,
  ...MODELS6,
  ...MODELS7,
  ...MODELS8,
  ...MODELS9,
  ...MODELS10,
  ...MODELS11,
  ...MODELS12,
  ...MODELS13,
  ...MODELS14,
  ...MODELS15,
  ...MODELS16,
  ...MODELS17,
  ...MODELS18,
  ...MODELS19,
  ...MODELS20,
  ...MODELS21,
  ...MODELS22,
  ...MODELS23,
  ...MODELS24,
  ...MODELS25,
  ...MODELS26,
  ...MODELS27,
  ...MODELS32,
  ...MODELS28,
  ...MODELS29,
  ...MODELS30,
  ...MODELS31,
  ...MODELS33,
  ...MODELS34,
  ...MODELS35,
  ...MODELS36,
  ...MODELS37,
  ...MODELS38
];
var getModelsByMode = (mode, includeDisabled = false) => ALL_MODELS.filter((m) => m.mode === mode && (includeDisabled || isVisibleForReleases(m)));

// src/core/contracts.ts
function requireObject(value, message) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(message, { status: 400, code: "validation_error" });
  }
}
function buildInputSchema(model) {
  return {
    parse(input) {
      requireObject(input, `Invalid input for model "${model.id}"`);
      try {
        validateAll(model.paramConfig, input);
      } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(err instanceof Error ? err.message : String(err), {
          status: 400,
          code: "validation_error"
        });
      }
      return input;
    }
  };
}
function buildOutputSchema(model) {
  return {
    parse(output) {
      if (output == null) {
        throw new ApiError(`Model "${model.id}" returned empty output`, {
          status: 502,
          code: "invalid_response"
        });
      }
      return output;
    }
  };
}
function createModelContract(model) {
  return {
    id: model.id,
    input: buildInputSchema(model),
    output: buildOutputSchema(model)
  };
}
function validateModelInput(model, input) {
  return createModelContract(model).input.parse(input);
}
var _contracts = null;
function ensureContracts() {
  if (!_contracts) {
    _contracts = Object.fromEntries(
      ALL_MODELS.map((model) => {
        const autoContract = createModelContract(model);
        const outputSchema = model.outputSchema ?? autoContract.output;
        return [model.id, { id: model.id, input: autoContract.input, output: outputSchema }];
      })
    );
  }
  return _contracts;
}
function getModelContract(modelId) {
  return ensureContracts()[modelId];
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
function extractSyncResult(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const data = raw;
  const syncResult = data.response?.result ?? data.result;
  const sr = syncResult;
  const imgs = sr && Array.isArray(sr.images) ? sr.images : null;
  return imgs?.length ? imgs[0] : syncResult;
}
var extractUrl = (result) => {
  if (Array.isArray(result)) return extractUrl(result[0]);
  if (result && typeof result === "object") {
    const obj = result;
    if (typeof obj.url === "string") return obj.url;
    if (typeof obj.videoUrl === "string") return obj.videoUrl;
    if (typeof obj.video_url === "string") return obj.video_url;
    if (obj.video && typeof obj.video === "object") {
      const v = obj.video;
      if (typeof v.url === "string") return v.url;
    }
    if (obj.audio && typeof obj.audio === "object") {
      const a = obj.audio;
      if (typeof a.url === "string") return a.url;
    }
    if (obj.assets && typeof obj.assets === "object") {
      const a = obj.assets;
      if (typeof a.video === "string") return a.video;
      if (typeof a.image === "string") return a.image;
    }
    if (typeof obj.image === "string") return obj.image;
    if (obj.image && typeof obj.image === "object") {
      const i = obj.image;
      if (typeof i.url === "string") return i.url;
    }
    if (typeof obj.image_url === "string") return obj.image_url;
    if (typeof obj.imageUrl === "string") return obj.imageUrl;
    if (typeof obj.audio_url === "string") return obj.audio_url;
    if (Array.isArray(obj.audioUrls) && obj.audioUrls.length > 0) {
      const au = obj.audioUrls[0];
      if (typeof au === "string") return au;
      if (au && typeof au === "object" && typeof au.url === "string") return au.url;
    }
    if (typeof obj.url_mp3 === "string") return obj.url_mp3;
    if (Array.isArray(obj.imageUrls) && obj.imageUrls.length > 0) {
      const img = obj.imageUrls[0];
      if (typeof img === "string") return img;
      if (img && typeof img === "object" && typeof img.url === "string") return img.url;
    }
    if (Array.isArray(obj.images) && obj.images.length > 0) {
      const img = obj.images[0];
      if (typeof img === "string") return img;
      if (img && typeof img === "object" && typeof img.url === "string") return img.url;
    }
    if (Array.isArray(obj.urls) && obj.urls.length > 0 && typeof obj.urls[0] === "string") return obj.urls[0];
    if (Array.isArray(obj.candidates)) {
      for (const c of obj.candidates) {
        const content = c?.content;
        const parts = content?.parts;
        if (Array.isArray(parts)) {
          for (const p2 of parts) {
            if (typeof p2.imageUrl === "string") return p2.imageUrl;
          }
        }
      }
    }
    if (Array.isArray(obj.data) && obj.data.length > 0) {
      const d = obj.data[0];
      if (typeof d === "string") return d;
      if (d && typeof d === "object" && typeof d.url === "string") return d.url;
    }
    if (Array.isArray(obj.items) && obj.items.length > 0) {
      const item = obj.items[0];
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && typeof item.url === "string") return item.url;
    }
    if (Array.isArray(obj.previews) && obj.previews.length > 0) {
      const p2 = obj.previews[0];
      if (typeof p2 === "string") return p2;
      if (p2 && typeof p2 === "object" && typeof p2.url === "string") return p2.url;
    }
    if (obj.result && typeof obj.result === "object") return extractUrl(obj.result);
    if (obj.url && typeof obj.url === "object") return extractUrl(obj.url);
  }
  if (typeof result === "string") return result;
  return void 0;
};
var extractText = (result) => {
  if (typeof result === "string") return result;
  if (Array.isArray(result)) return extractText(result[0]);
  if (!result || typeof result !== "object") return void 0;
  const obj = result;
  if (typeof obj.text === "string") return obj.text;
  if (typeof obj.output_text === "string") return obj.output_text;
  if (typeof obj.outputText === "string") return obj.outputText;
  if (typeof obj.content === "string") return obj.content;
  if (typeof obj.message === "string") return obj.message;
  if (Array.isArray(obj.content)) {
    const parts = obj.content;
    const texts = parts.map((p2) => p2 && typeof p2 === "object" && typeof p2.text === "string" ? p2.text : null).filter((t) => t != null);
    if (texts.length) return texts.join("");
  }
  if (Array.isArray(obj.choices) && obj.choices.length > 0) {
    const choice = obj.choices[0];
    const message = choice?.message;
    if (message) {
      if (typeof message.content === "string") return message.content;
      if (Array.isArray(message.content)) {
        const texts = message.content.map((p2) => typeof p2?.text === "string" ? p2.text : null).filter((t) => t != null);
        if (texts.length) return texts.join("");
      }
    }
    if (typeof choice?.text === "string") return choice.text;
  }
  if (Array.isArray(obj.candidates) && obj.candidates.length > 0) {
    for (const c of obj.candidates) {
      const content = c?.content;
      const parts = content?.parts;
      if (Array.isArray(parts)) {
        const texts = parts.filter((p2) => p2 && p2.thought !== true).map((p2) => typeof p2?.text === "string" ? p2.text : null).filter((t) => t != null);
        if (texts.length) return texts.join("");
      }
    }
  }
  if (obj.response && typeof obj.response === "object") {
    const nested = extractText(obj.response);
    if (nested != null) return nested;
  }
  if (obj.result && typeof obj.result === "object") {
    const nested = extractText(obj.result);
    if (nested != null) return nested;
  }
  return void 0;
};
var extractAllResults = (result) => {
  if (!result || typeof result !== "object") return void 0;
  const obj = result;
  if (Array.isArray(obj.items) && obj.items.length > 1) {
    const items = [];
    for (const item of obj.items) {
      if (item && typeof item === "object") {
        const it = item;
        const url = typeof it.url === "string" ? it.url : void 0;
        if (url) {
          items.push({
            url,
            exploreImageId: typeof it.image_id === "string" ? it.image_id : void 0
          });
        }
      }
    }
    if (items.length > 0) return items;
  }
  return void 0;
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

// src/core/model-registry.ts
var MODEL_BY_ID = new Map(ALL_MODELS.map((model) => [model.id, model]));
var MODEL_BY_MODEL_ID = /* @__PURE__ */ new Map();
var MODEL_BY_WORKFLOW = /* @__PURE__ */ new Map();
var MODEL_BY_NAME = /* @__PURE__ */ new Map();
var AMBIGUOUS_MODEL_NAMES = /* @__PURE__ */ new Set();
for (const model of ALL_MODELS) {
  if (model.modelId && !MODEL_BY_MODEL_ID.has(model.modelId)) {
    MODEL_BY_MODEL_ID.set(model.modelId, model);
  }
  if (!MODEL_BY_WORKFLOW.has(model.workflow)) {
    MODEL_BY_WORKFLOW.set(model.workflow, model);
  }
  if (model.editWorkflow && !MODEL_BY_WORKFLOW.has(model.editWorkflow)) {
    MODEL_BY_WORKFLOW.set(model.editWorkflow, model);
  }
  const nameKey = model.name.trim().toLowerCase();
  if (!nameKey) continue;
  if (AMBIGUOUS_MODEL_NAMES.has(nameKey)) continue;
  if (MODEL_BY_NAME.has(nameKey)) {
    MODEL_BY_NAME.delete(nameKey);
    AMBIGUOUS_MODEL_NAMES.add(nameKey);
    continue;
  }
  MODEL_BY_NAME.set(nameKey, model);
}
var getModel = (id) => MODEL_BY_ID.get(id) ?? MODEL_BY_MODEL_ID.get(id);
var findModel = (ref) => {
  const key = ref.trim();
  if (!key) return void 0;
  return getModel(key) ?? MODEL_BY_WORKFLOW.get(key) ?? MODEL_BY_NAME.get(key.toLowerCase());
};

// src/core/resolve.ts
function resolveModel(id) {
  const found = findModel(id);
  if (!found) {
    throw new ApiError(`Unknown model: "${id}"`, { status: 400, code: "unknown_model" });
  }
  return found;
}

// src/client/transport.ts
var GATEWAY_HEADERS = {
  "platform": "api",
  "X-Touchpoint": "sdk"
};
function resolveFetch(config) {
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
  throw new Error("createClient config requires either `fetch` or `apiKey`.");
}
function buildTransport(config) {
  const apiUrl = config.apiUrl;
  const f = resolveFetch(config);
  const jsonPost = async (url, body, signal) => f(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal
  });
  return {
    async submit(request) {
      const res = await jsonPost(
        `${apiUrl}/workflows/${request.workflow}/submit`,
        { params: request.payload },
        request.signal
      );
      const { text, json } = await readErrorBody(res);
      if (!res.ok) {
        const detail = json ? json.message ?? JSON.stringify(json) : text;
        throw new ApiError(`Submit failed (${res.status}): ${detail}`, {
          status: res.status,
          code: reasonFrom(json, res.status)
        });
      }
      const response = json?.response;
      const id = response?.id ?? json?.id;
      if (!id) {
        throw new ApiError(`No task id in response: ${json ? JSON.stringify(json) : text}`, {
          status: 502,
          code: "invalid_response"
        });
      }
      return { workflow: request.workflow, id: String(id) };
    },
    async status(handle, signal) {
      const res = await f(`${apiUrl}/workflows/${handle.workflow}/${handle.id}/result`, { signal });
      if (!res.ok) {
        const { text, json } = await readErrorBody(res);
        const detail = json ? json.message ?? text : text;
        throw new ApiError(`Status check failed (${res.status}): ${detail}`, {
          status: res.status,
          code: reasonFrom(json, res.status)
        });
      }
      return res.json();
    },
    async execute(request) {
      const res = await jsonPost(
        `${apiUrl}/workflows/${request.workflow}/execute`,
        { params: request.payload },
        request.signal
      );
      if (!res.ok) {
        const { text, json } = await readErrorBody(res);
        const detail = json ? json.message ?? text : text;
        throw new ApiError(`Execute failed (${res.status}): ${detail}`, {
          status: res.status,
          code: reasonFrom(json, res.status)
        });
      }
      return res.json();
    },
    async options(workflow, payload) {
      try {
        const res = await jsonPost(`${apiUrl}/workflows/${workflow}/options`, { params: payload });
        if (!res.ok) return null;
        const data = await res.json();
        const response = data.response;
        const credits = response?.credits;
        return typeof credits === "number" ? credits : null;
      } catch {
        return null;
      }
    }
  };
}
function isClientConfig(input) {
  return "fetch" in input && typeof input.fetch === "function" || "apiKey" in input && typeof input.apiKey === "string";
}

// src/client/prepare.ts
function resolvePayloadBuild(model, ctx) {
  const hasImages = Array.isArray(ctx.imageUrls) && ctx.imageUrls.length > 0 || !!ctx.startFrame || !!ctx.endFrame;
  return {
    hasImages,
    workflow: hasImages && model.editWorkflow ? model.editWorkflow : model.workflow,
    buildPayload: hasImages && model.buildEditPayload ? model.buildEditPayload : model.buildPayload ?? ((ctx2) => ({ prompt: ctx2.prompt }))
  };
}
function prepareRequest(model, params2) {
  const ctx = { ...params2 };
  const contract = getModelContract(model.id);
  const validatedCtx = contract ? contract.input.parse(ctx) : ctx;
  const resolved = resolvePayloadBuild(model, validatedCtx);
  const payload = resolved.buildPayload(validatedCtx);
  return { ctx, workflow: resolved.workflow, payload, contract };
}
function throwIfTerminalFailure(completed, model) {
  if (completed.status === "FAILED") {
    throw new ApiError(`${model.name} failed: ${completed.error ?? "unknown error"}`, {
      status: completed.statusCode ?? 502,
      code: completed.reason ?? "generation_failed"
    });
  }
  if (completed.status === "CANCELED") {
    throw new ApiError(`${model.name} was canceled`, { status: 499, code: "canceled" });
  }
}
function parseResult(completed, model, contract) {
  throwIfTerminalFailure(completed, model);
  throwIfErrorResult(completed.result, model.name);
  const parsed = contract?.output ? contract.output.parse(completed.result) : completed.result;
  const multiItems = extractAllResults(parsed);
  if (multiItems?.length) {
    const results = multiItems.map((item) => ({
      url: item.url,
      metadata: item.exploreImageId ? { exploreImageId: item.exploreImageId } : void 0
    }));
    return { url: results[0].url, results, model: model.id, handle: completed.handle, raw: parsed, usage: completed.usage };
  }
  const url = extractUrl(parsed);
  if (!url) {
    throw new ApiError(`${model.name}: unexpected response \u2014 no result URL`, {
      status: 502,
      code: "invalid_response"
    });
  }
  return { url, results: [{ url }], model: model.id, handle: completed.handle, raw: parsed, usage: completed.usage };
}
function parseTextResult(completed, model) {
  throwIfTerminalFailure(completed, model);
  throwIfErrorResult(completed.result, model.name);
  throwIfErrorResult(completed.raw, model.name);
  const text = extractText(completed.result) ?? extractText(completed.raw);
  if (text == null) {
    throw new ApiError(`${model.name}: unexpected response \u2014 no text`, {
      status: 502,
      code: "invalid_response"
    });
  }
  return { text, model: model.id, handle: completed.handle, raw: completed.raw ?? completed.result, usage: completed.usage };
}

// src/core/limits.ts
var MAX_DRIVE_PROMPT_LENGTH = 18e3;

// src/client/drive.ts
var USER_REACTION_ATTR = "userReaction";
function inferResourceType(mode) {
  if (mode === "video") return "VIDEO";
  if (mode === "audio") return "AUDIO";
  return "PHOTO";
}
function buildFilename(prompt, mode) {
  const shortId = String(Date.now()).slice(-6);
  const ext = mode === "video" ? "mp4" : mode === "audio" ? "mp3" : "png";
  if (!prompt) return `ai-generation-${shortId}.${ext}`;
  const slug = prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
  return `${slug}-${shortId}.${ext}`;
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
function toSdkPayload(params2) {
  const p2 = { prompt: String(params2.prompt ?? "").slice(0, MAX_DRIVE_PROMPT_LENGTH) };
  for (const [key, value] of Object.entries(params2)) {
    if (key === "prompt") continue;
    if (value === void 0 || value === null || value === "") continue;
    p2[key] = value;
  }
  return p2;
}
function buildGenerationAttributes(input) {
  const attrs = {
    model: input.modelId,
    aiSDKPayload: JSON.stringify(toSdkPayload(input.params))
  };
  if (input.app) {
    attrs.appId = input.app.id;
    attrs.appType = input.app.type;
  }
  return attrs;
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
  const base2 = toMediaItem(file);
  if (!base2) return null;
  const attrs = parseAttributes(file.attributes);
  let extras = {};
  if (attrs.textScript) {
    try {
      extras = JSON.parse(attrs.textScript);
    } catch {
    }
  }
  return {
    ...base2,
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
    quality: extras.quality
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
    userReaction: parseReaction(attrs[USER_REACTION_ATTR])
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
    userReaction: parseReaction(attrs[USER_REACTION_ATTR])
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
      const params2 = parentUid ? `parentFolderUid=${parentUid}&fileTypes=FOLDER&limit=100` : `fileTypes=FOLDER&limit=100`;
      const res = await jsonGet(`/cloud-storage/v1/me/files?${params2}`);
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
      const params2 = parentUid ? `parentFolderUid=${parentUid}&fileTypes=FOLDER&limit=100` : `fileTypes=FOLDER&limit=100`;
      const res = await jsonGet(`/cloud-storage/v1/me/files?${params2}`);
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
      const params2 = [
        opts.folderUid ? `parentFolderUid=${opts.folderUid}` : "",
        "limit=100",
        "sortType=UPDATED",
        "sortOrder=DESC",
        "fileTypes=FILE",
        `contentResourceTypes=${contentResourceTypes(opts.type)}`
      ].filter(Boolean).join("&");
      const res = await jsonGet(`${endpoint}?${params2}`);
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
    async save(params2, folder) {
      const targetUid = folder?.uid ?? await ensureRootFolder();
      if (!targetUid) return null;
      const targetFolder = folder ?? { name: rootFolderName, uid: targetUid };
      const body = {
        name: params2.name,
        sourceUrl: params2.url,
        parentFolderUid: targetUid,
        content: {
          type: "STANDALONE",
          resourceType: params2.resourceType,
          sourcePlatform: "WEB"
        },
        preview: {
          url: params2.previewUrl || params2.url,
          width: 1024,
          height: 1024
        },
        attributes: Object.entries(params2.attributes ?? {}).map(([property, value]) => ({
          property,
          value
        }))
      };
      try {
        let res = await jsonPost("/cloud-storage/v1/me/files", body);
        if (res.status === 400) {
          const text = await res.text();
          if (text.includes("restricted_keywords")) {
            const ext = params2.name.split(".").pop() || "png";
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
    buildSaveParams(url, modelId, modelName, mode, prompt) {
      return {
        url,
        name: buildFilename(prompt, mode),
        resourceType: inferResourceType(mode),
        attributes: {
          tool: "ai-sdk",
          model: modelId,
          prompt: prompt || "",
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
  return ExecutionMode2;
})(ExecutionMode || {});
var WorkflowsServerError = class extends Error {
  constructor(message) {
    super(`WorkflowsServerError: ${message}`);
    this.name = this.constructor.name;
  }
};
var WorkflowsClientError = class extends Error {
  constructor(action, status, responseBody) {
    super(
      `WorkflowsClientError: [${status}] ${action} failed: ${responseBody.reason} - ${responseBody.message}`
    );
    this.name = this.constructor.name;
    this.status = status;
    this.details = responseBody;
  }
};
var WorkflowsUnknownError = class extends Error {
  constructor(message) {
    super(`WorkflowsUnknownError: ${message}`);
    this.name = this.constructor.name;
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
    this.options = options || {};
    this.options.baseUrl = this.options.baseUrl || "https://api.picsart.com/";
    if (!this.options.baseUrl.endsWith("/")) this.options.baseUrl += "/";
    if (this.options.apiKey) {
      this.options.apiKey = this.options.apiKey.replace("Bearer ", "");
    }
    if (this.options.identityToken) {
      this.options.identityToken = this.options.identityToken.replace("Bearer ", "");
    }
    this.workflowsApiBaseUrl = `${this.options.baseUrl}workflows`;
  }
  async run(name, params2, executionOptions) {
    try {
      const remoteSettings = await this.getApiSettings(
        name,
        executionOptions?.remoteSettingName
      );
      const executionMode = remoteSettings.executionMode || executionOptions?.mode || "ASYNC";
      if (executionMode === "SYNC") {
        return this.executeTaskSync(name, params2, executionOptions);
      }
      if (executionMode === "STREAM") {
        return this.executeTaskStream(name, params2, executionOptions);
      }
      const taskId = await this.postTask(name, params2, executionOptions);
      await executionOptions?.onAccepted?.(taskId);
      return this.runPolling(name, taskId, executionOptions);
    } catch (err) {
      throw this.wrapError(name, err);
    }
  }
  async runTypeSafe(name, params2, executionOptions) {
    return this.run(name, params2, executionOptions);
  }
  async postTask(taskName, command, executionOptions) {
    const remoteSettings = await this.getApiSettings(taskName, executionOptions?.remoteSettingName);
    const response = await this._fetch(`${this.workflowsApiBaseUrl}/${taskName}/submit`, {
      method: "POST",
      headers: {
        "x-config-id": remoteSettings.configId || "",
        ...executionOptions?.headers
      },
      body: JSON.stringify({
        params: command,
        notification: executionOptions?.notificationConfig
      })
    });
    const json = await this.toSuccessResponse(response, taskName);
    return json.response.id;
  }
  async runPolling(taskName, taskId, executionOptions) {
    let retriesCounter = executionOptions?.retriesCount || DEFAULT_RETRIES_COUNT;
    let pollingResponse;
    const progressAware = new WorkflowResultUpdateAware(
      executionOptions?.onProgress,
      executionOptions?.onPartialResult,
      executionOptions?.onEvent
    );
    do {
      await sleep(executionOptions?.pollingInterval || DEFAULT_POLLING_INTERVAL);
      pollingResponse = await this.getResult(taskName, taskId, executionOptions?.abortSignal, executionOptions?.headers);
      await progressAware.onUpdate(pollingResponse.response);
      retriesCounter--;
    } while (retriesCounter > 0 && !this.terminalStatuses.includes(pollingResponse.response.status));
    if (!this.terminalStatuses.includes(pollingResponse.response.status) || !pollingResponse.response.result) {
      throw new WorkflowsClientError(taskName, 408, {
        status: "error",
        reason: "client_timeout",
        message: "Polling timeout reached. Consider increasing polling interval or retries count from execution options. "
      });
    }
    return {
      result: pollingResponse.response.result,
      usage: pollingResponse.response.usage
    };
  }
  async executeTaskSync(taskName, command, executionOptions) {
    const remoteSettings = await this.getApiSettings(taskName, executionOptions?.remoteSettingName);
    const response = await this._fetch(
      `${this.workflowsApiBaseUrl}/${taskName}/execute`,
      {
        signal: executionOptions?.abortSignal,
        method: "POST",
        headers: {
          "x-config-id": remoteSettings.configId || "",
          ...executionOptions?.headers
        },
        body: JSON.stringify({ params: command })
      }
    );
    const successResponse = await this.toSuccessResponse(
      response,
      taskName
    );
    return {
      result: successResponse.response.result,
      usage: successResponse.response.usage
    };
  }
  async getResult(taskName, taskId, abortSignal, headers) {
    const response = await this._fetch(
      `${this.workflowsApiBaseUrl}/${taskName}/${taskId}/result`,
      {
        method: "GET",
        headers: {
          ...headers
        },
        signal: abortSignal
      }
    );
    return this.toSuccessResponse(response, taskName);
  }
  async executeTaskStream(taskName, command, executionOptions) {
    const remoteSettings = await this.getApiSettings(taskName, executionOptions?.remoteSettingName);
    const onEvent = executionOptions?.onEvent;
    const actionName = `Executing ${taskName} task in stream mode`;
    if (!onEvent) {
      throw new WorkflowsClientError(actionName, 400, {
        message: "onEvent is required for streaming",
        status: "error",
        reason: "INVALID_ARGUMENTS"
      });
    }
    const response = await this._fetch(`${this.workflowsApiBaseUrl}/${taskName}/stream`, {
      signal: executionOptions?.abortSignal,
      method: "POST",
      headers: {
        "x-config-id": remoteSettings.configId || "",
        ...executionOptions?.headers,
        Accept: "text/event-stream"
      },
      body: JSON.stringify({ params: command })
    });
    await this.throwIfError(response, actionName);
    if (!response.body) throw new WorkflowsServerError("No response body");
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
        const failedResult = data.result;
        const statusCode = failedResult.statusCode;
        if (statusCode >= 500) {
          throw new WorkflowsServerError(`[${statusCode}] - ${actionName} failed with message ${failedResult.message}.`);
        }
        if (statusCode >= 400) {
          throw new WorkflowsClientError(actionName, statusCode, failedResult);
        }
        throw new WorkflowsUnknownError(failedResult.message || failedResult.reason);
      }
      if (data.type === "task.completed") {
        completedEvent = data;
      }
    }
    return {
      result: completedEvent.result,
      usage: completedEvent.usage
    };
  }
  async executionsHistory(taskName, offset = 0, limit = 10, isGrouped = false) {
    try {
      const grouped = isGrouped ? "/grouped" : "";
      const url = `${this.options.baseUrl}workflows-history${grouped}?name=${taskName}&limit=${limit}&offset=${offset}`;
      const res = await this._fetch(url);
      return this.toSuccessResponse(res, "requestHistory");
    } catch (err) {
      throw this.wrapError("requestHistory", err);
    }
  }
  async toSuccessResponse(response, actionName) {
    await this.throwIfError(response, actionName);
    return await response.json();
  }
  async throwIfError(response, actionName) {
    if (response.status >= 500) {
      let message;
      try {
        const errorResponse = await response.json();
        message = errorResponse.message || errorResponse.reason || "Unknown error";
      } catch (err) {
        message = "Non json response was returned from server";
      }
      throw new WorkflowsServerError(`[${response.status}] - ${actionName} failed with message: ${message}.`);
    }
    if (!response.ok) {
      throw new WorkflowsClientError(actionName, response.status, await response.json());
    }
  }
  async getApiSettings(name, remoteSettingName) {
    if (!this.options.getRemoteSettings) return {};
    const settingName = remoteSettingName || `${name.replace(/-/g, "_").toLowerCase()}_api`;
    try {
      const apiSetting = await this.options.getRemoteSettings(
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
    if (error instanceof WorkflowsClientError || error instanceof WorkflowsServerError || error instanceof DOMException) {
      return error;
    }
    logger_default.error(`PluggableAPIUnknownError - ${actionName} failed`, error);
    return new WorkflowsUnknownError(
      `workflows.${actionName} failed - ${error.message}`
    );
  }
  buildRequestHeaders(initHeaders) {
    const headers = new Headers(initHeaders);
    const optionHeaders = new Headers({
      ...this.defaultHeaders,
      ...this.options.headers
    });
    for (const [key, value] of optionHeaders.entries()) {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    }
    if (this.options.apiKey) {
      headers.set("Authorization", `Bearer ${this.options.apiKey}`);
    }
    if (this.options.identityToken) {
      headers.set("x-app-authorization", `Bearer ${this.options.identityToken}`);
    }
    return headers;
  }
  async _fetch(input, init) {
    const headers = this.buildRequestHeaders(init?.headers);
    const requestInit = {
      ...init,
      headers
    };
    if (this.options.fetch) {
      return this.options.fetch(input, {
        ...requestInit,
        // return headers as a plain object for easier handling in custom fetch
        headers: Object.fromEntries(headers.entries())
      });
    }
    if (!headers.has("Authorization") && !headers.has("x-app-authorization")) {
      throw new Error("apiKey is not provided");
    }
    return fetch(input, requestInit);
  }
};
var WorkflowsClient_default = WorkflowsClient;

// src/client/apis.ts
function createApis(config) {
  const f = config ? resolveFetch(config) : null;
  const client = config && f ? new WorkflowsClient_default({
    baseUrl: config.apiUrl,
    fetch: (input, init) => f(typeof input === "string" ? input : input.toString(), init)
  }) : null;
  return {
    async run(api, payload, options) {
      if (!client) {
        throw new Error("ai.apis requires a client created with a ClientConfig (authenticated fetch).");
      }
      const forwarded = { ...options ?? {} };
      delete forwarded.remoteSettingName;
      delete forwarded.onPartialResult;
      delete forwarded.notificationConfig;
      return client.run(api, payload, forwarded);
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
  const keyOf2 = (s) => `${s.workflow} ${s.modelId ?? ""}`;
  async function fetchPage(workflow, query) {
    const payload = {};
    if (query.modelId) payload.modelId = query.modelId;
    if (query.cursor) payload.cursor = query.cursor;
    if (query.limit) payload.limit = query.limit;
    const raw = await transport.execute({ workflow, payload });
    const container = raw?.response ?? raw;
    if (raw?.status === "error" || container?.status === "FAILED") {
      const message = container?.message ?? container?.error ?? raw?.message;
      throw new Error(`${workflow} failed${message ? `: ${String(message)}` : ""}`);
    }
    const result = container?.result;
    if (!result || !Array.isArray(result.items)) {
      throw new Error(`${workflow} returned no catalog result`);
    }
    return { ...result, nextCursor: result.nextCursor ?? null };
  }
  function storeFor(source, forceRefresh) {
    const key = keyOf2(source);
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
    const inflightKey = `${keyOf2(source)} ${cursorKey}`;
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
    for (const def of ALL_MODELS) {
      for (const [key, entry] of Object.entries(def.paramConfig)) {
        const d = entry.descriptor;
        const source = d.kind === "catalog" ? d.source : void 0;
        if (!source || seen.has(keyOf2(source))) continue;
        seen.add(keyOf2(source));
        void loadPage(def, key, source).catch(() => {
        });
      }
    }
  }
  return client;
}

// src/client/index.ts
var MODE_POLL_DEFAULTS = {
  video: { intervalMs: 2e3, maxAttempts: 1800 },
  // 2s × 1800 = 1 hour
  image: { intervalMs: 1e3, maxAttempts: 1200 },
  // 1s × 1200 = 20 min
  audio: { intervalMs: 1e3, maxAttempts: 1200 },
  // 1s × 1200 = 20 min
  text: { intervalMs: 1e3, maxAttempts: 1200 }
  // 1s × 1200 = 20 min
};
function resolvePollOptions(model, overrides) {
  const resolved = { ...MODE_POLL_DEFAULTS[model.mode], ...model.pollOptions };
  if (overrides?.intervalMs !== void 0) resolved.intervalMs = overrides.intervalMs;
  if (overrides?.maxAttempts !== void 0) resolved.maxAttempts = overrides.maxAttempts;
  if (overrides?.signal !== void 0) resolved.signal = overrides.signal;
  return resolved;
}
function createClient(config) {
  const isConfig = isClientConfig(config);
  const transport = isConfig ? buildTransport(config) : config;
  const client = createWorkflowClient(transport, { pollingIntervalMs: 2e3 });
  const supportsSubmit = typeof transport.submit === "function";
  const apis = createApis(isConfig ? config : null);
  const catalogs = createCatalogs(transport, isConfig ? config.catalogs : void 0);
  const driveConfig = isConfig ? config.drive : void 0;
  const driveClient = isConfig && driveConfig ? createDriveClient(resolveFetch(config), config.apiUrl, driveConfig.folder) : null;
  async function executeModel(model, workflow, payload, options) {
    const signal = options?.signal;
    if (model.syncExecute || !supportsSubmit) {
      const syncResponse = await client.run(
        { workflow, payload, signal },
        { mode: "sync" }
      );
      return toCompletedStatus(
        syncResponse.handle,
        extractSyncResult(syncResponse.raw),
        syncResponse.raw,
        syncResponse.usage
      );
    }
    return client.run({ workflow, payload, signal }, resolvePollOptions(model, options));
  }
  function buildDrivePayloadOptions(model, params2, options) {
    const explicit = options?.drive;
    if (!driveConfig && !explicit) return void 0;
    const attributes = buildGenerationAttributes({
      modelId: model.id,
      params: params2,
      app: options?.app
    });
    const folderPath = options?.folder?.name ?? driveConfig?.folder;
    return {
      name: explicit?.name ?? buildFilename(params2.prompt, model.mode),
      // SDK-assembled attributes are the baseline; explicit attributes win per-key.
      attributes: { ...attributes, ...explicit?.attributes ?? {} },
      folder: explicit?.folder ?? (folderPath ? { path: folderPath } : void 0)
    };
  }
  function injectDriveOptions(payload, drive) {
    if (!drive) return payload;
    return { ...payload, options: { drive } };
  }
  return {
    // ── Simple path ──────────────────────────────────────────────────
    /**
     * Generate content using a model.
     *
     * Validates input, builds the vendor payload, picks the right workflow,
     * submits the job, polls to completion, and returns the result URL.
     * If drive options are provided (or DriveConfig is set), the backend
     * saves the result to Picsart Drive.
     */
    async generate(model, params2, options) {
      const resolved = resolveModel(model);
      if (resolved.mode === "text") {
        throw new ApiError(`${resolved.name} is a text model \u2014 use generateText() instead.`, {
          status: 400,
          code: "wrong_model_mode"
        });
      }
      const { workflow, payload, contract } = prepareRequest(resolved, params2);
      const drive = buildDrivePayloadOptions(resolved, params2, options);
      const finalPayload = injectDriveOptions(payload, drive);
      const completed = await executeModel(resolved, workflow, finalPayload, options);
      return parseResult(completed, resolved, contract);
    },
    /**
     * Generate text using an LLM model (Claude, Gemini, OpenAI).
     *
     * Validates input, builds the vendor payload, runs the workflow, and
     * returns the generated text plus the raw response. Single-shot only —
     * pass text and optional image/video, get text back. Text results are not
     * saved to Drive.
     */
    async generateText(model, params2, options) {
      const resolved = resolveModel(model);
      if (resolved.mode !== "text") {
        throw new ApiError(`${resolved.name} is not a text model \u2014 use generate() instead.`, {
          status: 400,
          code: "wrong_model_mode"
        });
      }
      const { workflow, payload } = prepareRequest(resolved, params2);
      const completed = await executeModel(resolved, workflow, payload, options);
      return parseTextResult(completed, resolved);
    },
    /** @deprecated Use `getCredits()` instead. */
    async estimate(model, params2) {
      if (!transport.options) return null;
      const resolved = resolveModel(model);
      const { workflow, payload } = prepareRequest(resolved, params2);
      return await transport.options(workflow, payload) ?? null;
    },
    /**
     * Get exact credit cost for a model with specific parameters.
     * Calls the backend /options endpoint for real-time pricing.
     * Returns null if pricing is unavailable.
     */
    async getCredits(model, params2) {
      if (!transport.options) return null;
      const resolved = resolveModel(model);
      const { workflow, payload } = prepareRequest(resolved, params2);
      return await transport.options(workflow, payload) ?? null;
    },
    /** Build the vendor-specific payload for a model without submitting. */
    buildPayload(model, params2) {
      const resolved = resolveModel(model);
      const { payload } = prepareRequest(resolved, params2);
      return payload;
    },
    // ── Advanced lifecycle ────────────────────────────────────────────
    /** Submit a generation job and get a handle back. */
    async submit(model, params2, options) {
      const resolved = resolveModel(model);
      const { workflow, payload } = prepareRequest(resolved, params2);
      const drive = buildDrivePayloadOptions(resolved, params2, options);
      const finalPayload = injectDriveOptions(payload, drive);
      return client.submit({ workflow, payload: finalPayload, signal: options?.signal });
    },
    /** Check the current status of a submitted job. */
    async status(handle, signal) {
      return client.status(handle, signal);
    },
    /** Poll a submitted job until it completes and return the parsed result. */
    async result(handle, model, options) {
      const resolved = resolveModel(model);
      const contract = getModelContract(resolved.id);
      const completed = await client.result(handle, resolvePollOptions(resolved, options));
      return parseResult(completed, resolved, contract);
    },
    /**
     * Subscribe to live status updates for a submitted job.
     *
     * ```ts
     * const handle = await ai.submit(Models.Flux2Pro, { prompt: 'a cat' });
     * for await (const update of ai.subscribe(handle)) {
     *   console.log(update.status, update.progress);
     * }
     * ```
     */
    subscribe(handle, options) {
      return client.subscribe(handle, options);
    },
    // ── Raw workflow access ──────────────────────────────────────────
    /**
     * Run a raw workflow (not tied to a model).
     * @deprecated Use `apis.run()` instead.
     */
    async runWorkflow(workflow, payload, options) {
      const done = await client.run(
        { workflow, payload, signal: options?.signal },
        options
      );
      if (done.status === "FAILED" || done.status === "CANCELED") {
        throw new ApiError(done.error ?? `${workflow} failed with status ${done.status}`, {
          status: done.statusCode ?? (done.status === "CANCELED" ? 499 : 502),
          code: done.reason ?? (done.status === "CANCELED" ? "canceled" : "generation_failed")
        });
      }
      if (done.result === void 0) {
        throw new ApiError(`${workflow} completed but returned no result`, {
          status: 502,
          code: "invalid_response"
        });
      }
      return done.result;
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

// src/core/constraints.ts
function normalize(r) {
  if ("disabled" in r) return { kind: "disabled", reason: r.reason };
  return { kind: "allowed", allowed: r.allowed, reason: r.reason };
}
function matchOperator(op, actual) {
  if ("exists" in op) {
    const has = actual != null && (!Array.isArray(actual) || actual.length > 0) && (typeof actual !== "string" || actual.length > 0);
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
      effects.set(key, merge(effects.get(key), normalize(restriction)));
    }
  }
  return effects;
}

// src/core/descriptors/pricing.ts
var import_pa_model_pricing_sdk = __toESM(require_build());
var _client = null;
var _byModel = null;
var _loadPromise = null;
function configurePricing(options) {
  _client = new import_pa_model_pricing_sdk.ModelPricingClient(options);
  _byModel = null;
  _loadPromise = null;
}
function loadPricing() {
  if (_byModel) return Promise.resolve();
  if (!_client) {
    return Promise.reject(new Error(
      "loadPricing(): not configured. Call catalog.pricing.configure({ baseUrl, fetch }) first."
    ));
  }
  if (!_loadPromise) {
    const client = _client;
    _loadPromise = client.init().then(() => {
      const byModel = /* @__PURE__ */ new Map();
      for (const entry of client.getModelPricing()) {
        const id = entry.metadata.modelId;
        const list = byModel.get(id);
        if (list) list.push(entry);
        else byModel.set(id, [entry]);
      }
      _byModel = byModel;
    }).catch((err) => {
      _loadPromise = null;
      throw err;
    });
  }
  return _loadPromise;
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
  /** @deprecated Use `enum(key)` instead. */
  getEnumOptions(key) {
    const entry = this.def.paramConfig[key];
    if (!entry || entry.descriptor.kind !== "enum") return null;
    return entry.descriptor.options.map((o) => o.id);
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
  constructor(inner, effects) {
    this.inner = inner;
    this.effects = effects;
  }
  // ── Decorated accessors ──────────────────────────────────────────
  enum(key) {
    return this.applyEnum(key, this.inner.enum(key));
  }
  catalog(key) {
    return this.applyEntry(key, this.inner.catalog(key));
  }
  range(key) {
    return this.applyEntry(key, this.inner.range(key));
  }
  boolean(key) {
    return this.applyEntry(key, this.inner.boolean(key));
  }
  text(key) {
    return this.applyEntry(key, this.inner.text(key));
  }
  file(key) {
    return this.applyEntry(key, this.inner.file(key));
  }
  prompt() {
    return this.applyEntry("prompt", this.inner.prompt());
  }
  aspectRatio() {
    return this.applyEnum("aspectRatio", this.inner.aspectRatio());
  }
  duration() {
    const entry = this.inner.duration();
    return entry?.kind === "enum" ? this.applyEnum("duration", entry) : this.applyEntry("duration", entry);
  }
  resolution() {
    return this.applyEnum("resolution", this.inner.resolution());
  }
  generateAudio() {
    return this.applyEntry("generateAudio", this.inner.generateAudio());
  }
  startFrame() {
    return this.applyEntry("startFrame", this.inner.startFrame());
  }
  endFrame() {
    return this.applyEntry("endFrame", this.inner.endFrame());
  }
  all() {
    return this.inner.all().map((e) => {
      const r = this.effects.get(e.key);
      if (!r) return e;
      if (e.kind === "enum") return this.decorateEnumFlat(e, r);
      if (r.kind === "disabled") return { ...e, disabled: true, disabledReason: r.reason };
      return e;
    });
  }
  // ── Pass-through delegates ───────────────────────────────────────
  param(key) {
    return this.inner.param(key);
  }
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
  getEnumOptions(key) {
    return this.inner.getEnumOptions(key);
  }
  toSchema() {
    return this.inner.toSchema();
  }
  transferValues(prev) {
    return this.inner.transferValues(prev);
  }
  // ── Private helpers ──────────────────────────────────────────────
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
    if (!effects.size) return inner;
    return new ConstrainedParamsAccessor(inner, effects);
  }
  validate(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return { valid: false, errors: [`Invalid input for model "${this.def.id}"`] };
    }
    try {
      validateAll(this.def.paramConfig, input);
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
  return ALL_MODELS.filter((m) => isVisibleForReleases(m, releases)).map((m) => new ModelDescriptorImpl(m));
}
function _find(filter) {
  const releases = filter.release ?? DEFAULT_VISIBLE_RELEASES;
  return ALL_MODELS.filter((m) => {
    if (!isVisibleForReleases(m, releases)) return false;
    if (filter.output && m.mode !== filter.output) return false;
    if (filter.provider && m.provider !== filter.provider) return false;
    return true;
  }).map((m) => new ModelDescriptorImpl(m));
}
function _search(query, filter = {}) {
  const releases = filter.release ?? DEFAULT_VISIBLE_RELEASES;
  const q = query.toLowerCase();
  return ALL_MODELS.filter(
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

// src/generated/model-constants.ts
var AsyncFlashV1 = "async-flash-v1";
var BytedanceOmnihumanV15 = "bytedance-omnihuman-v1.5";
var BytedanceVideoEnhance = "bytedance-video-enhance";
var BytedanceVideoUpscaler = "bytedance-video-upscaler";
var CaptionsaiVideoCaptions = "captionsai-video-captions";
var ClaudeHaiku45 = "claude-haiku-4-5";
var ClaudeOpus48 = "claude-opus-4-8";
var ClaudeSonnet46 = "claude-sonnet-4-6";
var CreatifyAurora = "creatify-aurora";
var ElevenAudioIsolation = "eleven-audio-isolation";
var ElevenDubbing = "eleven-dubbing";
var ElevenMultilingualStsV2 = "eleven-multilingual-sts-v2";
var ElevenMultilingualV2 = "eleven-multilingual-v2";
var ElevenStsV2 = "eleven-sts-v2";
var ElevenV3 = "eleven-v3";
var ElevenVoiceCreate = "eleven-voice-create";
var ElevenVoiceDesignV2 = "eleven-voice-design-v2";
var ElevenVoiceDesignV3 = "eleven-voice-design-v3";
var ElevenVoiceRemix = "eleven-voice-remix";
var ElevenlabsMusicV2 = "elevenlabs-music-v2";
var ElevenlabsSfx = "elevenlabs-sfx";
var Flux2Flex = "flux-2-flex";
var Flux2Max = "flux-2-max";
var Flux2Pro = "flux-2-pro";
var Flux3Video = "flux-3-video";
var FluxKontextMax = "flux-kontext-max";
var FluxKontextPro = "flux-kontext-pro";
var FluxVideoUpscale = "flux-video-upscale";
var Gemini25FlashImage = "gemini-2.5-flash-image";
var Gemini25FlashTts = "gemini-2.5-flash-tts";
var Gemini25ProTts = "gemini-2.5-pro-tts";
var Gemini3Pro = "gemini-3-pro";
var Gemini3ProImage = "gemini-3-pro-image";
var Gemini31FlashImage = "gemini-3.1-flash-image";
var Gemini31FlashLiteImage = "gemini-3.1-flash-lite-image";
var Gemini35FlashLite = "gemini-3.5-flash-lite";
var Gemini36Flash = "gemini-3.6-flash";
var Gemini37Flash = "gemini-3.7-flash";
var GeminiOmni11FlashPreview = "gemini-omni-1.1-flash-preview";
var GeminiOmniFlashPreview = "gemini-omni-flash-preview";
var Gpt55 = "gpt-5.5";
var GptImage1 = "gpt-image-1";
var GptImage15 = "gpt-image-1.5";
var GptImage2 = "gpt-image-2";
var GrokEditVideo = "grok-edit-video";
var GrokExtendVideo = "grok-extend-video";
var GrokImagineImage = "grok-imagine-image";
var GrokImagineImage20 = "grok-imagine-image-2.0";
var GrokImagineImageQuality = "grok-imagine-image-quality";
var GrokImagineVideo = "grok-imagine-video";
var GrokImagineVideo15 = "grok-imagine-video-1.5";
var GrokTts = "grok-tts";
var Hailuo23 = "hailuo-2.3";
var Hailuo23Fast = "hailuo-2.3-fast";
var Hailuo23FastPro = "hailuo-2.3-fast-pro";
var Hailuo23Pro = "hailuo-2.3-pro";
var Happyhorse10R2v = "happyhorse-1.0-r2v";
var Happyhorse10T2v = "happyhorse-1.0-t2v";
var Happyhorse10VideoEdit = "happyhorse-1.0-video-edit";
var Happyhorse11R2v = "happyhorse-1.1-r2v";
var Happyhorse11T2v = "happyhorse-1.1-t2v";
var HeygenTalkingPhoto = "heygen-talking-photo";
var HeygenVideoAvatar = "heygen-video-avatar";
var HunyuanV3 = "hunyuan-v3";
var IdeogramCharacter = "ideogram-character";
var IdeogramPImage = "ideogram-p-image";
var IdeogramV3 = "ideogram-v3";
var IdeogramV4 = "ideogram-v4";
var Kling30Image = "kling-3.0-image";
var KlingAvatar = "kling-avatar";
var KlingElements = "kling-elements";
var KlingMotionControl = "kling-motion-control";
var KlingMotionControlV3 = "kling-motion-control-v3";
var KlingMultiImageV21 = "kling-multi-image-v2-1";
var KlingO1Image = "kling-o1-image";
var KlingT2a = "kling-t2a";
var KlingV21Image = "kling-v2-1-image";
var KlingV26 = "kling-v2-6";
var KlingV2a = "kling-v2a";
var KlingV3 = "kling-v3";
var KlingV3Omni = "kling-v3-omni";
var KlingV3Turbo = "kling-v3-turbo";
var KlingVideoEffects = "kling-video-effects";
var KlingVideoO1 = "kling-video-o1";
var Ltx23A2v = "ltx-2.3-a2v";
var LtxProT2v = "ltx-pro-t2v";
var LtxV2Fast = "ltx-v2-fast";
var LtxV2Retake = "ltx-v2-retake";
var LtxV23Extend = "ltx-v2.3-extend";
var LtxV23Fast = "ltx-v2.3-fast";
var LtxV23Pro = "ltx-v2.3-pro";
var LtxV23Retake = "ltx-v2.3-retake";
var LumaRay2 = "luma-ray-2";
var LumaRay2ReframeVideo = "luma-ray-2-reframe-video";
var LumaRay32 = "luma-ray-3.2";
var LumaRay32Edit = "luma-ray-3.2-edit";
var LumaRay32ReframeVideo = "luma-ray-3.2-reframe-video";
var LumaRayFlash2 = "luma-ray-flash-2";
var LumaRayFlash2ReframeVideo = "luma-ray-flash-2-reframe-video";
var LumaUni1 = "luma-uni-1";
var LumaUni1Max = "luma-uni-1-max";
var Lyria3Clip = "lyria-3-clip";
var Lyria3Pro = "lyria-3-pro";
var Minimax02Hd = "minimax-02-hd";
var MinimaxH3 = "minimax-h3";
var MinimaxH3Max = "minimax-h3-max";
var MinimaxH3MaxR2v = "minimax-h3-max-r2v";
var MinimaxH3MaxTurbo = "minimax-h3-max-turbo";
var MinimaxMusicV2 = "minimax-music-v2";
var MinimaxMusicV3 = "minimax-music-v3";
var MuseImage10 = "muse-image-1.0";
var Ovi = "ovi";
var PicsartChangeBg = "picsart-change-bg";
var PicsartEnhance = "picsart-enhance";
var PicsartFlow = "picsart-flow";
var PicsartFlowVideo = "picsart-flow-video";
var PicsartFlux2Klein = "picsart-flux-2-klein";
var PicsartHidreamT2i = "picsart-hidream-t2i";
var PicsartQwenImageEdit = "picsart-qwen-image-edit";
var PicsartQwenImageEditAngle = "picsart-qwen-image-edit-angle";
var PicsartQwenMakeup = "picsart-qwen-makeup";
var PicsartSanaSprintV1 = "picsart-sana-sprint-v1";
var PicsartSodV82 = "picsart-sod-v8-2";
var PicsartVideography = "picsart-videography";
var Pika22 = "pika-2.2";
var Pika22Frames = "pika-2.2-frames";
var Pika22Scenes = "pika-2.2-scenes";
var PixverseC1 = "pixverse-c1";
var PixverseC1Fusion = "pixverse-c1-fusion";
var PixverseC1Image = "pixverse-c1-image";
var PixverseV6 = "pixverse-v6";
var PixverseV6Fusion = "pixverse-v6-fusion";
var PixverseV6Image = "pixverse-v6-image";
var Qwen = "qwen";
var QwenImage2 = "qwen-image-2";
var QwenImage2Pro = "qwen-image-2-pro";
var QwenImage30 = "qwen-image-3.0";
var QwenImage30Pro = "qwen-image-3.0-pro";
var RecraftCreativeUpscale = "recraft-creative-upscale";
var RecraftCrispUpscale = "recraft-crisp-upscale";
var RecraftExplore = "recraft-explore";
var RecraftExploreSimilar = "recraft-explore-similar";
var RecraftVectorize = "recraft-vectorize";
var Recraftv2 = "recraftv2";
var Recraftv2Vector = "recraftv2_vector";
var Recraftv3 = "recraftv3";
var Recraftv3Vector = "recraftv3_vector";
var Recraftv3ReplaceBg = "recraftv3-replace-bg";
var Recraftv4 = "recraftv4";
var Recraftv41 = "recraftv4_1";
var Recraftv41Pro = "recraftv4_1_pro";
var Recraftv41ProVector = "recraftv4_1_pro_vector";
var Recraftv41Utility = "recraftv4_1_utility";
var Recraftv41UtilityPro = "recraftv4_1_utility_pro";
var Recraftv41UtilityProVector = "recraftv4_1_utility_pro_vector";
var Recraftv41UtilityVector = "recraftv4_1_utility_vector";
var Recraftv41Vector = "recraftv4_1_vector";
var Recraftv4Pro = "recraftv4_pro";
var Recraftv4ProVector = "recraftv4_pro_vector";
var Recraftv4Styles = "recraftv4_styles";
var Recraftv4StylesPro = "recraftv4_styles_pro";
var Recraftv4StylesProVector = "recraftv4_styles_pro_vector";
var Recraftv4StylesVector = "recraftv4_styles_vector";
var Recraftv4Vector = "recraftv4_vector";
var Reve = "reve";
var RunwayAleph2 = "runway-aleph2";
var RunwayAvatarVideo = "runway-avatar-video";
var RunwayGen3aTurbo = "runway-gen3a-turbo";
var RunwayGen4Aleph = "runway-gen4-aleph";
var RunwayGen4Ref = "runway-gen4-ref";
var RunwayGen45 = "runway-gen4.5";
var SeedAudio10 = "seed-audio-1.0";
var SeedAudio10Multilingual = "seed-audio-1.0-multilingual";
var Seedance15Pro = "seedance-1.5-pro";
var Seedance20 = "seedance-2.0";
var Seedance20Fast = "seedance-2.0-fast";
var Seedance20FastVideoEdit = "seedance-2.0-fast-video-edit";
var Seedance20FastVideoExtend = "seedance-2.0-fast-video-extend";
var Seedance20Mini = "seedance-2.0-mini";
var Seedance20MiniVideoEdit = "seedance-2.0-mini-video-edit";
var Seedance20MiniVideoExtend = "seedance-2.0-mini-video-extend";
var Seedance20VideoEdit = "seedance-2.0-video-edit";
var Seedance20VideoExtend = "seedance-2.0-video-extend";
var Seedance20WithoutModeration = "seedance-2.0-without-moderation";
var Seedance20WithoutModerationVideoEdit = "seedance-2.0-without-moderation-video-edit";
var Seedance20WithoutModerationVideoExtend = "seedance-2.0-without-moderation-video-extend";
var Seedance25 = "seedance-2.5";
var Seedance25VideoEdit = "seedance-2.5-video-edit";
var Seedance25VideoExtend = "seedance-2.5-video-extend";
var SeedanceI2v = "seedance-i2v";
var Seedream40 = "seedream-4.0";
var Seedream45 = "seedream-4.5";
var Seedream47 = "seedream-4.7";
var Seedream50Lite = "seedream-5.0-lite";
var Seedream50Pro = "seedream-5.0-pro";
var Sora2 = "sora-2";
var Sora2Extend = "sora-2-extend";
var Sora2Pro = "sora-2-pro";
var TopazUpscaleImage = "topaz-upscale-image";
var TopazUpscaleVideo = "topaz-upscale-video";
var VeedFabricV1 = "veed-fabric-v1";
var VeedFabricV1Fast = "veed-fabric-v1-fast";
var Veo31 = "veo-3.1";
var Veo31Fast = "veo-3.1-fast";
var Veo31Lite = "veo-3.1-lite";
var Wan26Image = "wan-2.6-image";
var Wan26R2v = "wan-2.6-r2v";
var Wan26T2v = "wan-2.6-t2v";
var Wan27I2v = "wan-2.7-i2v";
var Wan27R2v = "wan-2.7-r2v";
var Wan27T2v = "wan-2.7-t2v";
var Wan27VideoEdit = "wan-2.7-video-edit";
var Wan30Video = "wan-3.0-video";
var Wan30VideoPrime = "wan-3.0-video-prime";
var Models = {
  AsyncFlashV1,
  BytedanceOmnihumanV15,
  BytedanceVideoEnhance,
  BytedanceVideoUpscaler,
  CaptionsaiVideoCaptions,
  ClaudeHaiku45,
  ClaudeOpus48,
  ClaudeSonnet46,
  CreatifyAurora,
  ElevenAudioIsolation,
  ElevenDubbing,
  ElevenMultilingualStsV2,
  ElevenMultilingualV2,
  ElevenStsV2,
  ElevenV3,
  ElevenVoiceCreate,
  ElevenVoiceDesignV2,
  ElevenVoiceDesignV3,
  ElevenVoiceRemix,
  ElevenlabsMusicV2,
  ElevenlabsSfx,
  Flux2Flex,
  Flux2Max,
  Flux2Pro,
  Flux3Video,
  FluxKontextMax,
  FluxKontextPro,
  FluxVideoUpscale,
  Gemini25FlashImage,
  Gemini25FlashTts,
  Gemini25ProTts,
  Gemini3Pro,
  Gemini3ProImage,
  Gemini31FlashImage,
  Gemini31FlashLiteImage,
  Gemini35FlashLite,
  Gemini36Flash,
  Gemini37Flash,
  GeminiOmni11FlashPreview,
  GeminiOmniFlashPreview,
  Gpt55,
  GptImage1,
  GptImage15,
  GptImage2,
  GrokEditVideo,
  GrokExtendVideo,
  GrokImagineImage,
  GrokImagineImage20,
  GrokImagineImageQuality,
  GrokImagineVideo,
  GrokImagineVideo15,
  GrokTts,
  Hailuo23,
  Hailuo23Fast,
  Hailuo23FastPro,
  Hailuo23Pro,
  Happyhorse10R2v,
  Happyhorse10T2v,
  Happyhorse10VideoEdit,
  Happyhorse11R2v,
  Happyhorse11T2v,
  HeygenTalkingPhoto,
  HeygenVideoAvatar,
  HunyuanV3,
  IdeogramCharacter,
  IdeogramPImage,
  IdeogramV3,
  IdeogramV4,
  Kling30Image,
  KlingAvatar,
  KlingElements,
  KlingMotionControl,
  KlingMotionControlV3,
  KlingMultiImageV21,
  KlingO1Image,
  KlingT2a,
  KlingV21Image,
  KlingV26,
  KlingV2a,
  KlingV3,
  KlingV3Omni,
  KlingV3Turbo,
  KlingVideoEffects,
  KlingVideoO1,
  Ltx23A2v,
  LtxProT2v,
  LtxV2Fast,
  LtxV2Retake,
  LtxV23Extend,
  LtxV23Fast,
  LtxV23Pro,
  LtxV23Retake,
  LumaRay2,
  LumaRay2ReframeVideo,
  LumaRay32,
  LumaRay32Edit,
  LumaRay32ReframeVideo,
  LumaRayFlash2,
  LumaRayFlash2ReframeVideo,
  LumaUni1,
  LumaUni1Max,
  Lyria3Clip,
  Lyria3Pro,
  Minimax02Hd,
  MinimaxH3,
  MinimaxH3Max,
  MinimaxH3MaxR2v,
  MinimaxH3MaxTurbo,
  MinimaxMusicV2,
  MinimaxMusicV3,
  MuseImage10,
  Ovi,
  PicsartChangeBg,
  PicsartEnhance,
  PicsartFlow,
  PicsartFlowVideo,
  PicsartFlux2Klein,
  PicsartHidreamT2i,
  PicsartQwenImageEdit,
  PicsartQwenImageEditAngle,
  PicsartQwenMakeup,
  PicsartSanaSprintV1,
  PicsartSodV82,
  PicsartVideography,
  Pika22,
  Pika22Frames,
  Pika22Scenes,
  PixverseC1,
  PixverseC1Fusion,
  PixverseC1Image,
  PixverseV6,
  PixverseV6Fusion,
  PixverseV6Image,
  Qwen,
  QwenImage2,
  QwenImage2Pro,
  QwenImage30,
  QwenImage30Pro,
  RecraftCreativeUpscale,
  RecraftCrispUpscale,
  RecraftExplore,
  RecraftExploreSimilar,
  RecraftVectorize,
  Recraftv2,
  Recraftv2Vector,
  Recraftv3,
  Recraftv3Vector,
  Recraftv3ReplaceBg,
  Recraftv4,
  Recraftv41,
  Recraftv41Pro,
  Recraftv41ProVector,
  Recraftv41Utility,
  Recraftv41UtilityPro,
  Recraftv41UtilityProVector,
  Recraftv41UtilityVector,
  Recraftv41Vector,
  Recraftv4Pro,
  Recraftv4ProVector,
  Recraftv4Styles,
  Recraftv4StylesPro,
  Recraftv4StylesProVector,
  Recraftv4StylesVector,
  Recraftv4Vector,
  Reve,
  RunwayAleph2,
  RunwayAvatarVideo,
  RunwayGen3aTurbo,
  RunwayGen4Aleph,
  RunwayGen4Ref,
  RunwayGen45,
  SeedAudio10,
  SeedAudio10Multilingual,
  Seedance15Pro,
  Seedance20,
  Seedance20Fast,
  Seedance20FastVideoEdit,
  Seedance20FastVideoExtend,
  Seedance20Mini,
  Seedance20MiniVideoEdit,
  Seedance20MiniVideoExtend,
  Seedance20VideoEdit,
  Seedance20VideoExtend,
  Seedance20WithoutModeration,
  Seedance20WithoutModerationVideoEdit,
  Seedance20WithoutModerationVideoExtend,
  Seedance25,
  Seedance25VideoEdit,
  Seedance25VideoExtend,
  SeedanceI2v,
  Seedream40,
  Seedream45,
  Seedream47,
  Seedream50Lite,
  Seedream50Pro,
  Sora2,
  Sora2Extend,
  Sora2Pro,
  TopazUpscaleImage,
  TopazUpscaleVideo,
  VeedFabricV1,
  VeedFabricV1Fast,
  Veo31,
  Veo31Fast,
  Veo31Lite,
  Wan26Image,
  Wan26R2v,
  Wan26T2v,
  Wan27I2v,
  Wan27R2v,
  Wan27T2v,
  Wan27VideoEdit,
  Wan30Video,
  Wan30VideoPrime,
  /** @deprecated Use the `catalog` accessor (`catalog.all()` / `catalog.find({ output, provider })`) instead. */
  list(filter) {
    if (!filter) return [...ALL_MODELS];
    return ALL_MODELS.filter((m) => {
      if (filter.mode && m.mode !== filter.mode) return false;
      if (filter.provider && m.provider !== filter.provider) return false;
      return true;
    });
  },
  /** @deprecated Use `Model(id).validate(input)` instead. */
  validate(model, input) {
    try {
      validateModelInput(resolveModel(model), input);
      return { valid: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { valid: false, errors: [message] };
    }
  },
  /** @deprecated Use `Model(id).params().toSchema()` instead. */
  toSchema(id) {
    return Model(id).params().toSchema();
  },
  /** @deprecated Use `Model(id).params().file(key)` instead. */
  getFileParam(id, key) {
    const f = Model(id).params().file(key);
    if (!f) return null;
    return { required: f.required ?? false, max: f.array?.max ?? 1, label: f.label, accept: f.accept };
  },
  /** @deprecated Use `Model(id).params().hasParam(key)` instead. */
  hasParam(id, key) {
    return Model(id).params().hasParam(key);
  }
};
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

export { ALL_MODELS, ApiError, ExecutionMode as ApiRunMode, DEFAULT_VISIBLE_RELEASES, KLING_DUAL_IMAGE_EFFECTS, Model, Models, buildFilename, buildGenerationAttributes, catalog, createClient, decodeDeepLinkPayload, encodeDeepLinkPayload, findModel, getModel, getModelsByMode, getVoiceById, inferResourceType, isVisibleForReleases, parseGeneration, releaseOf, toAvatarOption, toVoiceOption };

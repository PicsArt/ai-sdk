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
    var DEFAULT_TIMEOUT_MS = 5e3;
    var ModelPricingClient2 = class {
      constructor(options) {
        var _a;
        this.pricing = null;
        this.refreshTimer = null;
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
              this.loadAll().catch(() => {
              });
            }, refreshIntervalMs);
            if (typeof this.refreshTimer.unref === "function") {
              this.refreshTimer.unref();
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
      }
      /**
       * Returns model pricings matching the given filters from the in-memory cache.
       * Throws if pricing has not been loaded yet — call and await init() first.
       */
      getModelPricing(filters = {}) {
        if (this.pricing == null) {
          throw new Error("ModelPricingClient: pricing not loaded. Call and await init() before getModelPricing().");
        }
        return this.applyFilters(this.pricing, filters);
      }
      loadAll() {
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
      applyFilters(items, filters) {
        return items.filter((item) => {
          if (filters.vendor != null && item.metadata.vendor !== filters.vendor)
            return false;
          if (filters.modelId != null && item.metadata.modelId !== filters.modelId)
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
      PricingUnit2["OutputImageTokens"] = "output_image_tokens";
      PricingUnit2["OutputAudioTokens"] = "output_audio_tokens";
      PricingUnit2["OutputTextTokens"] = "output_text_tokens";
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
  const errorRaw = pickFirst(raw, [["response", "error"], ["error"], ["message"], ["reason"]]);
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
    progress,
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
      throw new Error("Transport does not support submit (execute-only transport)");
    }
    return transport.submit(request);
  };
  const status = async (handle, signal) => {
    if (!transport.status) {
      throw new Error("Transport does not support status (execute-only transport)");
    }
    const raw = await transport.status(handle, signal);
    return parseStatus(handle, raw);
  };
  const result = async (handle, pollOptions = {}) => {
    const intervalMs = pollOptions.intervalMs ?? defaultPollIntervalMs;
    const maxAttempts = pollOptions.maxAttempts ?? defaultMaxAttempts;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (pollOptions.signal?.aborted) {
        throw new Error("Operation aborted");
      }
      const next = await status(handle, pollOptions.signal);
      if (isTerminal(next.status)) return next;
      await sleep2(intervalMs);
    }
    throw new Error(`Timed out waiting for workflow ${handle.workflow}:${handle.id}`);
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
        throw new Error("Operation aborted");
      }
      const next = await status(handle, subscribeOptions.signal);
      yield next;
      if (isTerminal(next.status)) return next;
      await sleep2(intervalMs);
    }
    throw new Error(`Timed out waiting for workflow ${handle.workflow}:${handle.id}`);
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
      if (ids.length === 0) break;
      if (!ids.includes(val)) {
        throw new Error(
          `"${key}" must be one of: ${ids.join(", ")}`
        );
      }
      break;
    }
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
  async: { color: "#5E5CE6", label: "AA", name: "Async AI" }
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
  negativePrompt(placeholder) {
    return {
      negativePrompt: {
        label: "Negative Prompt",
        descriptor: {
          kind: "text",
          placeholder
        }
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
          ...opts?.maxShortSidePixels != null ? { maxShortSidePixels: opts.maxShortSidePixels } : {}
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
  voiceId(options, def, opts) {
    return {
      voiceId: {
        label: "Voice",
        required: opts?.required,
        catalogOptions: options,
        descriptor: {
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
        descriptor: {
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
  const MODELS38 = [];
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
    if (c.badge !== void 0) model.badge = c.badge;
    if (c.addedAt !== void 0) model.addedAt = c.addedAt;
    if (c.disabled !== void 0) model.disabled = c.disabled;
    if (c.deprecated !== void 0) model.deprecated = c.deprecated;
    if (c.release !== void 0) model.release = c.release;
    if (c.modelId !== void 0) model.modelId = c.modelId;
    if (c.constraints !== void 0) model.constraints = c.constraints;
    const contract = createModelContract(model);
    model.outputSchema = c.outputSchema ?? contract.output;
    MODELS38.push(model);
  }
  return { MODELS: MODELS38 };
}
function registerPayloads(MODELS38, payloads) {
  for (const [id, builder] of Object.entries(payloads)) {
    const model = MODELS38.find((m) => m.id === id);
    if (model) model.buildPayload = builder;
  }
}
function registerEditPayloads(MODELS38, payloads) {
  for (const [id, builder] of Object.entries(payloads)) {
    const model = MODELS38.find((m) => m.id === id);
    if (model) model.buildEditPayload = builder;
  }
}
var params = {
  prompt: p.prompt,
  aspectRatio: p.aspectRatio,
  duration: p.duration,
  count: p.count,
  resolution: p.resolution,
  negativePrompt: p.negativePrompt,
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
  language: p.language,
  // File presets — key matches the runtime GenerationContext field name.
  // `category` defaults to the most common role for the slot (overridable per call):
  //   asset    → start/end frame, sync audio (direct inputs to the output)
  //   reference → ref images/videos/audios (guidance signals)
  imageInput: (max = 1, label = "Start Image", required = false, category = "reference", minPixels) => p.file("imageUrls", "image", { array: { max }, label, required, category, ...minPixels != null ? { minPixels } : {} }),
  /** Single source-video slot (v2v / video edit). Writes to `videoUrl`.
   *  `maxDurationSec` caps the source clip length and `maxShortSidePixels` caps
   *  the shorter side (upscaler sources), both enforced client-side at upload. */
  videoInput: (label = "Source Video", category = "reference", required = true, maxDurationSec, maxShortSidePixels) => p.file("videoUrl", "video", {
    label,
    required,
    category,
    ...maxDurationSec != null ? { maxDurationSec } : {},
    ...maxShortSidePixels != null ? { maxShortSidePixels } : {}
  }),
  /** Single driving / sync-audio slot. Writes to `audioUrl`. */
  audioInput: (label = "Audio Track", required = false, category = "asset") => p.file("audioUrl", "audio", { label, required, category }),
  /** Array of reference videos (writes to `videoUrls`). Backend enforces
   *  per-model total-duration caps (e.g. ≤ 15s for seedance). */
  videoInputs: (max = 3, label = "Reference Videos", required = false, minPixels) => p.file("videoUrls", "video", { array: { max }, label, required, category: "reference", ...minPixels != null ? { minPixels } : {} }),
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
var klingImageReference = {
  imageReference: {
    label: "Reference Mode",
    descriptor: {
      kind: "enum",
      valueType: "string",
      options: [
        { id: "subject", label: "Subject" },
        { id: "face", label: "Face" }
      ],
      default: "subject"
    }
  }
};
var klingHumanFidelity = {
  humanFidelity: {
    label: "Face Fidelity",
    descriptor: { kind: "range", min: 0, max: 1, step: 0.05, default: 0.45 }
  }
};
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
  },
  staticMask: {
    label: "Static Mask",
    category: "reference",
    descriptor: { kind: "file", accept: "image" }
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
  omniImageList: {
    label: "Reference Images",
    descriptor: {
      kind: "object",
      array: { max: 10 },
      fields: {
        image_url: { kind: "text" },
        type: {
          kind: "enum",
          required: false,
          valueType: "string",
          options: [
            { id: "first_frame", label: "First Frame" },
            { id: "end_frame", label: "End Frame" }
          ],
          default: "first_frame"
        }
      }
    }
  },
  omniVideoList: {
    label: "Reference Video",
    descriptor: {
      kind: "object",
      array: { max: 1 },
      fields: {
        video_url: { kind: "text" },
        // refer_type / keep_original_sound stay required — upstream
        // ReferenceVideo marks both required. Descriptor defaults are
        // informational only until upstream relaxes the wire contract.
        refer_type: {
          kind: "enum",
          valueType: "string",
          options: [
            { id: "feature", label: "Feature Reference" },
            { id: "base", label: "Base Edit" }
          ],
          default: "feature"
        },
        keep_original_sound: {
          kind: "enum",
          valueType: "string",
          options: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }],
          default: "yes"
        }
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
var KLING_EFFECT_SCENES = [
  "korean_baseball",
  "pet_skateboard",
  "daily_ootd",
  "tiny_beast_printer",
  "landmark_reveal",
  "winter_charm",
  "flash_ride",
  "maestro_of_magic",
  "magic_carpet_ride",
  "good_luck_spirit",
  "shooting_star",
  "sparkler_wand",
  "sovereign_scepter",
  "dirt_rush",
  "return_of_the_king",
  "dance_with_dragon",
  "minimalist_light",
  "martial_meow",
  "sassy_shake",
  "knock_at_a_door_revenge",
  "palm_sized_figure_pro",
  "prank_box",
  "perler_beads",
  "spring_bloom",
  "toss_run",
  "switch_to_silk",
  "get_rich_quick",
  "make_it_rain",
  "twist_shake",
  "the_hip_sway",
  "send_my_love",
  "funky_martian",
  "wealth_drive",
  "the_high_kick",
  "the_exercise",
  "lucky_veggie",
  "studio_look",
  "flash_drive",
  "shush_my_dreams",
  "french_elegance",
  "finger_swipe",
  "advent_of_flora",
  "smooth_transition",
  "kiss_pro",
  "raid_check",
  "snow_night_kiss",
  "eternal_kiss",
  "fortune_in_motion",
  "chinese_trend",
  "sedan_chair_dance",
  "skyfall",
  "good_luck_dance",
  "laicai_dance",
  "yangge_dance",
  "color_mixing",
  "palm_sized_figure",
  "lantern_festival_cuju",
  "unique_firework",
  "unique_spring_couplets",
  "horse_mask",
  "fortune_knocks_cartoon",
  "tangyuan_to_animal",
  "hot_feet_dance",
  "swag_dance",
  "pigeon_dance",
  "bloodline_dance",
  "chanel_dance",
  "cute_dance",
  "love_theme_song",
  "pumpitup_dance",
  "city_to_village",
  "fortune_god_transform",
  "new_year_feast",
  "ring_in_new",
  "horse_year_firework",
  "pet_vlogger",
  "crystal_horse",
  "lateral_shift_transition",
  "drunk_dance",
  "drunk_dance_pet",
  "daoma_dance",
  "bouncy_dance",
  "smooth_sailing_dance",
  "new_year_greeting",
  "lion_dance",
  "prosperity",
  "great_success",
  "golden_horse_fortune",
  "red_packet_box",
  "lucky_horse_year",
  "lucky_red_packet",
  "lucky_money_come",
  "lion_dance_pet",
  "dumpling_making_pet",
  "fish_making_pet",
  "pet_red_packet",
  "lantern_glow",
  "expression_challenge",
  "overdrive",
  "heart_gesture_dance",
  "poping",
  "martial_arts",
  "running",
  "nezha",
  "motorcycle_dance",
  "subject_3_dance",
  "ghost_step_dance",
  "phantom_jewel",
  "zoom_out",
  "cheers_2026",
  "fight_pro",
  "hug_pro",
  "heart_gesture_pro",
  "dollar_rain_pro",
  "pet_bee_pro",
  "countdown_teleport",
  "santa_random_surprise",
  "magic_match_tree",
  "bullet_time_360",
  "happy_birthday",
  "birthday_star",
  "thumbs_up_pro",
  "tiger_hug_pro",
  "pet_lion_pro",
  "surprise_bouquet",
  "bouquet_drop",
  "3d_cartoon_1_pro",
  "firework_2026",
  "glamour_photo_shoot",
  "box_of_joy",
  "first_toast_of_the_year",
  "my_santa_pic",
  "santa_gift",
  "steampunk_christmas",
  "snowglobe",
  "christmas_photo_shoot",
  "ornament_crash",
  "santa_express",
  "instant_christmas",
  "particle_santa_surround",
  "coronation_of_frost",
  "building_sweater",
  "spark_in_the_snow",
  "scarlet_and_snow",
  "cozy_toon_wrap",
  "bullet_time_lite",
  "magic_cloak",
  "balloon_parade",
  "jumping_ginger_joy",
  "bullet_time",
  "c4d_cartoon_pro",
  "pure_white_wings",
  "black_wings",
  "golden_wing",
  "pink_pink_wings",
  "venomous_spider",
  "throne_of_king",
  "luminous_elf",
  "woodland_elf",
  "japanese_anime_1",
  "american_comics",
  "guardian_spirit",
  "swish_swish",
  "snowboarding",
  "witch_transform",
  "vampire_transform",
  "pumpkin_head_transform",
  "demon_transform",
  "mummy_transform",
  "zombie_transform",
  "cute_pumpkin_transform",
  "cute_ghost_transform",
  "knock_knock_halloween",
  "halloween_escape",
  "baseball",
  "inner_voice",
  "a_list_look",
  "memory_alive",
  "trampoline",
  "trampoline_night",
  "pucker_up",
  "guess_what",
  "feed_mooncake",
  "rampage_ape",
  "flyer",
  "dishwasher",
  "pet_chinese_opera",
  "magic_fireball",
  "gallery_ring",
  "pet_moto_rider",
  "muscle_pet",
  "squeeze_scream",
  "pet_delivery",
  "running_man",
  "disappear",
  "mythic_style",
  "steampunk",
  "3d_cartoon_2",
  "eagle_snatch",
  "hug_from_past",
  "firework",
  "media_interview",
  "pet_chef",
  "santa_gifts",
  "santa_hug",
  "heart_gesture_1",
  "pet_wizard",
  "smoke_smoke",
  "instant_kid",
  "dollar_rain",
  "cry_cry",
  "building_collapse",
  "gun_shot",
  "mushroom",
  "double_gun",
  "pet_warrior",
  "lightning_power",
  "jesus_hug",
  "shark_alert",
  "long_hair",
  "lie_flat",
  "polar_bear_hug",
  "brown_bear_hug",
  "jazz_jazz",
  "office_escape_plow",
  "fly_fly",
  "watermelon_bomb",
  "pet_dance",
  "boss_coming",
  "wool_curly",
  "pet_bee",
  "marry_me",
  "swing_swing",
  "day_to_night",
  "piggy_morph",
  "wig_out",
  "car_explosion",
  "ski_ski",
  "siblings",
  "construction_worker",
  "let's_ride",
  "snatched",
  "magic_broom",
  "felt_felt",
  "jumpdrop",
  "surfsurf",
  "fairy_wing",
  "angel_wing",
  "dark_wing",
  "skateskate",
  "plushcut",
  "jelly_press",
  "jelly_slice",
  "jelly_squish",
  "jelly_jiggle",
  "pixelpixel",
  "yearbook",
  "instant_film",
  "anime_figure",
  "rocketrocket",
  "bloombloom",
  "dizzydizzy",
  "fuzzyfuzzy",
  "squish",
  "expansion",
  "emoji",
  "tennis_trend",
  "whirling_beverage",
  "f1_live",
  "football_live",
  "spielberg_transition"
];
var effectSceneStyles = KLING_EFFECT_SCENES.map((id) => ({
  id,
  label: id.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
}));
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
    ...params.startFrame("Start Frame"),
    staticMask: {
      label: "Static Mask",
      category: "reference",
      descriptor: { kind: "file", accept: "image" }
    }
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
    }),
    ...params.cfgScale(0, 1, 0.5, 0.1),
    ...params.renderingSpeed([{ id: "std", label: "Standard" }, { id: "pro", label: "Pro" }], "std")
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
      { when: { renderingSpeed: { is: "std" } }, then: { endFrame: { disabled: true, reason: "End frame requires Pro or 4K mode." } } }
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
    description: "Mature pipeline with audio, adjustable cfg, and standard/pro rendering."
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
    features: [feat("4K", "resolution"), feat("15 sec", "duration")],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(["16:9", "9:16", "1:1"]),
      ...params.duration(V3_DURATIONS, 5),
      ...params.resolution(["720p", "1080p", "4k"], "720p"),
      ...params.renderingSpeed([{ id: "std", label: "Standard" }, { id: "pro", label: "Pro" }], "std"),
      ...params.generateAudio(false),
      ...klingOmniAdvancedParams
    }
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
      ...params.resolution(["720p", "1080p"], "720p"),
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
      ...params.resolution(["720p", "1080p"], "720p"),
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
      ...params.resolution(["720p", "1080p"], "720p"),
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
      // Swagger marks both sound_file and audio_id individually optional, but the
      // backend requires at least one. UI keeps sound_file required; audio_id
      // remains exposed as an additive alternative for SDK / batch users who
      // pass a TTS-generated reference instead of an uploaded file.
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
    id: "kling-v2-new-image",
    name: "Kling V2 New Image",
    modelId: "kling-v2-new",
    addedAt: "2026-03-25",
    workflow: "kling/v1/images/generations",
    estimatedTime: 15,
    mode: "image",
    inputType: "t2i",
    description: "Latest V2 image generation with optional restyle via image reference.",
    features: [feat("Image Input", "input"), feat("Negative Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.negativePrompt(),
      ...params.imageInput(1, "Restyle Image", true),
      // backend requires image despite t2i
      ...klingImageReference,
      ...params.imageWeight(0, 100, 50, 5),
      ...klingHumanFidelity
    }
  },
  {
    id: "kling-v2-image",
    name: "Kling V2 Image",
    modelId: "kling-v2",
    addedAt: "2026-03-25",
    deprecated: true,
    // superseded by kling-v3-omni / kling-v3-pro
    workflow: "kling/v1/images/generations",
    estimatedTime: 15,
    mode: "image",
    inputType: "t2i",
    description: "Standard V2 image generation with optional restyle via image reference.",
    features: [feat("Image Input", "input"), feat("Negative Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.negativePrompt(),
      ...params.imageInput(1, "Restyle Image"),
      ...params.imageWeight(0, 100, 50, 5),
      ...klingHumanFidelity
    }
  },
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
      ...params.imageInput(1, "Restyle Image"),
      ...params.imageWeight(0, 100, 50, 5),
      ...klingHumanFidelity
    }
  },
  {
    id: "kling-v1-5-image",
    name: "Kling V1.5 Image",
    modelId: "kling-v1-5",
    addedAt: "2026-03-25",
    deprecated: true,
    // superseded by kling-v3-omni (4 generations behind)
    workflow: "kling/v1/images/generations",
    estimatedTime: 15,
    mode: "image",
    inputType: "t2i",
    description: "V1.5 image generation with subject and face reference support.",
    features: [feat("Image Input", "input"), feat("Negative Prompt", "characteristic")],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(KLING_IMAGE_AR),
      ...params.count([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ...params.negativePrompt(),
      ...params.imageInput(1, "Restyle Image", true),
      ...klingImageReference,
      ...params.imageWeight(0, 100, 50, 5),
      ...klingHumanFidelity
    }
  },
  // ── Image: Multi-Image-to-Image ─────────────────────────────────
  {
    id: "kling-multi-image",
    name: "Kling Multi-Image",
    modelId: "kling-v2-multi",
    addedAt: "2026-03-25",
    deprecated: true,
    // V2 is 3 generations behind v3
    workflow: "kling/v1/images/multi-image-to-image",
    estimatedTime: 20,
    mode: "image",
    inputType: "i2i",
    description: "Compose up to 4 subject images into a new scene with optional prompt.",
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
      ...params.imageInput(4, "Reference Images (1st = frontal)", false),
      ...params.videoInput("Reference Video", "reference", false),
      elementVoiceId: {
        label: "Voice ID (video elements only)",
        descriptor: { kind: "text" }
      }
    }
  },
  // ── Video: Video Effects ────────────────────────────────────────────
  {
    id: "kling-video-effects",
    name: "Kling Video Effects",
    addedAt: "2026-05-13",
    workflow: "kling/v1/video-effects",
    estimatedTime: 30,
    mode: "video",
    inputType: "i2v",
    badge: ["new"],
    description: "Apply 260+ visual effects to photos \u2014 single or dual-image scenes.",
    features: [feat("Image Input", "input"), feat("Video Effects", "characteristic")],
    paramConfig: {
      ...params.style(effectSceneStyles, effectSceneStyles[0].id),
      ...params.imageInput(2, "Effect Images", true)
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
      ...params.videoInput("Source Video")
    }
  }
]);

// src/vendors/catalog/kling/payloads.ts
var buildKlingV3Payload = (defaultMode = "std") => (input) => {
  const hasEndFrame = !!(input.startFrame && input.endFrame && input.renderingSpeed !== "std");
  const hasSound = !!input.generateAudio && !hasEndFrame;
  const mode = defaultMode === "4k" ? "4k" : hasEndFrame ? "pro" : input.renderingSpeed ?? defaultMode;
  return {
    ...input.multiShot ? {} : { prompt: input.prompt },
    aspect_ratio: input.aspectRatio ?? "16:9",
    // String(n) is just `string`; wire expects '3'|'5'|...|'15'. Narrowing cast.
    duration: String(input.duration ?? 5),
    model_name: "kling-v3",
    ...input.startFrame ? { image: input.startFrame } : {},
    ...hasEndFrame ? { image_tail: input.endFrame } : {},
    ...input.negativePrompt ? { negative_prompt: input.negativePrompt } : {},
    ...hasSound ? { sound: "on" } : {},
    // WorkflowTypes 1.0.5 still types mode as std/pro, but the backend accepts
    // the catalog's 4k mode for Kling V3.
    mode,
    ...input.multiShot != null ? { multi_shot: input.multiShot } : {},
    ...input.shotType ? { shot_type: input.shotType } : {},
    ...input.multiPrompt ? { multi_prompt: input.multiPrompt } : {},
    // voice_list and element_list are mutex in I2V — voice_list wins
    // when both are set (matches backend behavior, per the workflow schema).
    ...input.voiceList ? { voice_list: input.voiceList } : {},
    ...input.startFrame && input.elementList && !input.voiceList ? { element_list: input.elementList } : {},
    ...input.startFrame && input.staticMask ? { static_mask: input.staticMask } : {}
  };
};
var buildKlingV3TurboPayload = (input) => ({
  prompt: input.prompt,
  aspect_ratio: input.aspectRatio ?? "16:9",
  // String(n) is just `string`; wire expects '3'|'5'|...|'15'. Narrowing cast.
  duration: String(input.duration ?? 5),
  model_name: "kling-v3-turbo",
  resolution: input.resolution ?? "720p",
  ...input.startFrame ? { image: input.startFrame } : {},
  ...input.negativePrompt ? { negative_prompt: input.negativePrompt } : {},
  ...input.startFrame && input.staticMask ? { static_mask: input.staticMask } : {}
});
var buildKlingV26Payload = (input) => {
  const hasEndFrame = !!(input.startFrame && input.endFrame && input.renderingSpeed !== "std");
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
    mode: "pro",
    ...input.cfgScale !== void 0 ? { cfg_scale: input.cfgScale } : {}
  };
};
var stringElementList = (list) => list?.length ? { element_list: list.map((e) => ({ element_id: String(e.element_id) })) } : {};
var buildOmniV3 = (input) => {
  const hasBaseEdit = input.omniVideoList?.some((v) => v.refer_type === "base");
  const hasReferenceVideo = !!input.omniVideoList?.length;
  const fourK = input.resolution === "4k" && !hasReferenceVideo;
  const hasSound = !!input.generateAudio && !hasReferenceVideo;
  return {
    ...input.multiShot ? {} : { prompt: input.prompt },
    model_name: "kling-v3-omni",
    ...hasBaseEdit || input.omniImageList?.[0]?.type === "first_frame" ? {} : { aspect_ratio: input.aspectRatio ?? "16:9" },
    // String(n) is just `string`; wire expects literal union. Narrowing cast.
    ...hasBaseEdit ? {} : { duration: String(input.duration ?? 5) },
    ...fourK ? { mode: "4k" } : input.renderingSpeed ? { mode: input.renderingSpeed } : {},
    ...input.multiShot != null ? { multi_shot: input.multiShot } : {},
    ...input.shotType ? { shot_type: input.shotType } : {},
    ...input.multiPrompt ? { multi_prompt: input.multiPrompt } : {},
    ...input.omniImageList?.length ? { image_list: input.omniImageList } : {},
    ...input.omniVideoList?.length ? { video_list: input.omniVideoList } : {},
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
  ...input.audioUrl ? { sound_file: input.audioUrl } : {},
  ...input.audioId ? { audio_id: input.audioId } : {},
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
var buildGenerations = (modelName) => (input) => {
  const imageUrls = input.imageUrls;
  const hasImage = !!imageUrls?.[0];
  const imageReference = hasImage && "imageReference" in input ? input.imageReference ?? (modelName === "kling-v1-5" ? "subject" : void 0) : void 0;
  return {
    prompt: input.prompt,
    model_name: modelName,
    n: input.count ?? 1,
    ...input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {},
    ...input.negativePrompt ? { negative_prompt: input.negativePrompt } : {},
    ...hasImage ? { image: imageUrls[0] } : {},
    ...imageReference ? { image_reference: imageReference } : {},
    ...hasImage && input.imageWeight != null ? { image_fidelity: input.imageWeight / 100 } : {},
    ...input.humanFidelity != null ? { human_fidelity: input.humanFidelity } : {}
  };
};
var buildMultiImage = (modelName) => (input) => ({
  model_name: modelName,
  n: input.count ?? 1,
  ...input.prompt ? { prompt: input.prompt } : {},
  subject_image_list: (input.imageUrls ?? []).map((url) => ({ subject_image: url })),
  ...input.sceneImage ? { scene_image: input.sceneImage } : {},
  ...input.styleImage ? { style_image: input.styleImage } : {},
  ...input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}
});
var buildKlingElementsPayload = (input) => {
  const isVideo = input.referenceType === "video_refer";
  return {
    element_name: input.elementName,
    element_description: input.elementDescription,
    reference_type: input.referenceType ?? "image_refer",
    ...isVideo ? input.videoUrl ? { element_video_list: { refer_videos: [{ video_url: input.videoUrl }] } } : {} : input.imageUrls?.length ? {
      element_image_list: {
        frontal_image: input.imageUrls[0],
        refer_images: (input.imageUrls.slice(1) ?? []).map((url) => ({ image_url: url }))
      }
    } : {},
    ...input.elementVoiceId ? { element_voice_id: input.elementVoiceId } : {}
  };
};
var buildKlingVideoEffectsPayload = (input) => {
  const isDualEffect = input.imageUrls && input.imageUrls.length >= 2;
  return {
    effect_scene: input.style,
    ...isDualEffect ? { images: input.imageUrls.slice(0, 2) } : input.imageUrls?.[0] ? { image: input.imageUrls[0] } : {}
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
  "kling-v2-new-image": buildGenerations("kling-v2-new"),
  "kling-v2-image": buildGenerations("kling-v2"),
  "kling-v2-1-image": buildGenerations("kling-v2-1"),
  "kling-v1-5-image": buildGenerations("kling-v1-5"),
  // Multi-image
  "kling-multi-image": buildMultiImage("kling-v2"),
  "kling-multi-image-v2-1": buildMultiImage("kling-v2-1"),
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
var buildBytedanceUpscalerPayload = (ctx) => ({
  video_url: ctx.videoUrl,
  target_resolution: "1080p"
});
var buildBytedanceOmnihumanPayload = (ctx) => ({
  image_url: ctx.imageUrls?.[0],
  audio_url: ctx.audioUrl,
  ...ctx.prompt ? { prompt: ctx.prompt } : {}
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
    buildPayload: buildBytedanceOmnihumanPayload,
    estimatedTime: 179,
    mode: "video",
    inputType: "i2v",
    description: "Animate a portrait with realistic body movement driven by audio.",
    features: [feat("Image Input", "input"), feat("Audio Input", "audio")],
    paramConfig: {
      ...params.prompt({ required: false }),
      ...params.imageInput(1, "Portrait Image", true),
      ...params.audioInput("Audio Track", true)
    }
  }
]);

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
  resolution: "720p",
  duration: ctx.duration ?? 5,
  ...ctx.aspectRatio ? { aspect_ratio: ctx.aspectRatio } : {}
});
var buildWanR2VPayload = (ctx) => ({
  prompt: ctx.prompt,
  video_urls: [ctx.videoUrl],
  resolution: "720p",
  duration: ctx.duration ?? 5
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
    for (const url of ctx.imageUrls.slice(0, 3)) media.push({ type: "reference_image", url });
  }
  return {
    media,
    resolution: ctx.resolution ?? "720P",
    ...ctx.prompt ? { prompt: ctx.prompt } : {},
    ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {},
    ...ctx.aspectRatio ? { ratio: ctx.aspectRatio } : {},
    ...ctx.seed != null ? { seed: ctx.seed } : {}
  };
};
var WAN27_AR = ["16:9", "9:16", "1:1", "4:3", "3:4"];
var WAN27_RES = ["720P", "1080P"];
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
    description: "Painterly artistic look with audio \u2014 up to 15s at 1080p, cfg adjustable.",
    features: [feat("Image Input", "input"), feat("Start Frame", "frame"), feat("Audio", "audio"), feat("1080p", "resolution"), feat("5/10/15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.duration([5, 10, 15], 5),
      ...params.resolution(["480p", "720p", "1080p"], "720p"),
      ...params.aspectRatio(["16:9", "9:16", "1:1", "4:3", "3:4"]),
      ...params.negativePrompt(),
      ...params.cfgScale(1, 10, 5, 0.5),
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
      ...params.prompt(),
      ...params.duration([5, 10, 15], 5),
      ...params.resolution(WAN27_RES, "720P"),
      ...params.aspectRatio(WAN27_AR),
      ...params.negativePrompt(),
      ...params.enhancePrompt(true),
      ...params.audioInput("Audio Track"),
      ...params.startFrame()
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
      ...params.prompt({ required: false }),
      ...params.duration([5, 10, 15], 5),
      ...params.resolution(WAN27_RES, "720P"),
      ...params.negativePrompt(),
      ...params.enhancePrompt(true),
      ...params.startFrame("Start Frame", true),
      ...params.endFrame(),
      ...params.audioInput("Driving Audio")
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
      ...params.prompt(),
      ...params.duration([5, 10], 5),
      ...params.resolution(WAN27_RES, "720P"),
      ...params.aspectRatio(WAN27_AR),
      ...params.negativePrompt(),
      ...params.imageInput(5, "Reference Images", true),
      ...params.videoInput("Reference Video")
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
      ...params.prompt({ required: false }),
      ...params.resolution(WAN27_RES, "720P"),
      ...params.aspectRatio(WAN27_AR),
      ...params.negativePrompt(),
      ...params.videoInput("Source Video"),
      ...params.imageInput(3, "Reference Images")
    }
  }
]);

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
    // modelId defaults to id ('luma-ray-3.2') — matches the pricing-service key.
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
var SEEDANCE_MIN_PIXELS = 409600;
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
    generate_audio: ctx.generateAudio ?? false,
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
  generate_audio: ctx.generateAudio ?? false,
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
  generate_audio: ctx.generateAudio ?? false
});
var SEEDANCE_AR = ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9", "adaptive"];
var SEEDANCE_V2_DURATIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
var { MODELS: MODELS12 } = defineModels("seedance", [
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
      ...params.generateAudio(false),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, "Reference Images", false, "reference", SEEDANCE_MIN_PIXELS),
      ...params.videoInputs(3, "Reference Videos", false, SEEDANCE_MIN_PIXELS),
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
      ...params.generateAudio(false),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, "Reference Images", false, "reference", SEEDANCE_MIN_PIXELS),
      ...params.videoInputs(3, "Reference Videos", false, SEEDANCE_MIN_PIXELS),
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
      ...params.generateAudio(false),
      ...params.returnLastFrame(),
      // Reference roles map directly to backend `reference_*` content entries.
      // start/end frame stay on their own named slots.
      ...params.imageInput(9, "Reference Images", false, "reference", SEEDANCE_MIN_PIXELS),
      ...params.videoInputs(3, "Reference Videos", false, SEEDANCE_MIN_PIXELS),
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
      ...params.generateAudio(false),
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
      ...params.generateAudio(false),
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
      ...params.generateAudio(false),
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
      ...params.generateAudio(false),
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
      ...params.generateAudio(false),
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
      ...params.generateAudio(false),
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
    // Backend (pa-bytedance-pluggable-worker) gates 5.0-pro to 1K/2K — it
    // rejects 3K/4K ("not supported by model seedream_5_0_pro"). Single-image
    // only (no group/sequential), up to 10 reference images.
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
    // Backend (pa-bytedance-pluggable-worker) gates 5.0-lite to 2K/3K — it
    // rejects 4K ("not supported by model seedream_5_0_lite") even though the
    // SeedreamResolution enum defines a 4K member. Boundary-verified 2026-05-25.
    description: "Speedy 3K output with negative prompt and dual-image input support.",
    features: [feat("Multi-Image Input", "input"), feat("3K", "resolution")],
    paramConfig: {
      ...params.resolution(["2K", "3K"]),
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
var ELEVENLABS_VOICES = [
  {
    id: "JBFqnCBsd6RMkjVDRZzb",
    name: "George",
    description: "Narrate with a warm, resonant British tone.",
    tags: ["Male", "Storytelling", "Podcast", "Middle-aged"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/1b2102d1-90d6-4347-b4a7-1560825f3879.mp3"
  },
  {
    id: "EkK5I93UQWFDigLMpZcX",
    name: "James",
    description: "Command attention with a deep, husky American delivery.",
    tags: ["Male", "Storytelling", "Commercials", "Middle-aged"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/32bcc811-08a4-41be-86ee-1d8615f65995.mp3"
  },
  {
    id: "RILOU7YmBhvwJGDGjNmP",
    name: "Jane",
    description: "Present with polished, professional precision.",
    tags: ["Female", "Business", "Tutorials", "Middle-aged"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/9c0e054b-9c18-41cf-827a-7d9d89ae9116.mp3"
  },
  {
    id: "Z3R5wn05IrDiVCyEkUrK",
    name: "Arabella",
    description: "Captivate with a mysterious, emotive allure.",
    tags: ["Female", "Storytelling", "Entertainment", "Young"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/09073341-7d91-45bb-a68d-87330e3dc6e4.mp3"
  },
  {
    id: "NNl6r8mD7vthiJatiJt1",
    name: "Bradford",
    description: "Tell stories with expressive British eloquence.",
    tags: ["Male", "Storytelling", "Entertainment", "Middle-aged"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/d3c9792a-aafc-4ee0-ade6-c15422d29ef4.mp3"
  },
  {
    id: "Bj9UqZbhQsanLzgalpEG",
    name: "Austin",
    description: "Deliver with a deep, gravelly Texas charm.",
    tags: ["Male", "Entertainment", "Podcast", "Middle-aged"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/a66f1db1-f743-42d9-91bb-507e753218f6.mp3"
  },
  {
    id: "exsUS4vynmxd379XN4yO",
    name: "Blondie",
    description: "Chat with a warm, natural British warmth.",
    tags: ["Female", "Social", "Podcast", "Young"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/36920cd4-8e4a-42ea-8514-968a3b19a33d.mp3"
  },
  {
    id: "BpjGufoPiobT79j2vtj4",
    name: "Priyanka",
    description: "Engage with a velvety, laid-back ease.",
    tags: ["Female", "Storytelling", "Health & Wellness", "Young"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/1d8f393a-a138-4887-8721-0101f93beb0c.mp3"
  },
  {
    id: "kdmDKE6EkgrWrrykO9Qt",
    name: "Alexandra",
    description: "Connect with youthful, authentic energy.",
    tags: ["Female", "Social", "Tutorials", "Young"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/c363b71b-f449-4fe5-be46-84ff4f97f0bb.mp3"
  },
  {
    id: "1SM7GgM6IMuvQlz2BwM3",
    name: "Mark",
    description: "Speak with casual, conversational ease.",
    tags: ["Male", "Social", "Gaming", "Young"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/41aab958-b231-4ad7-a7ac-58433738f938.mp3"
  },
  {
    id: "ouL9IsyrSnUkCmfnD02u",
    name: "Grimblewood",
    description: "Enchant with a raspy, whimsical gnome character.",
    tags: ["Male", "Entertainment", "Gaming", "Senior"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/68062c53-78f3-427d-ac46-53c55ae8828d.mp3"
  },
  {
    id: "5l5f8iK3YPeGga21rQIX",
    name: "Adeline",
    description: "Narrate with a soft, conversational femininity.",
    tags: ["Female", "Storytelling", "Tutorials", "Young"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/7abfb281-9dfe-4998-8ecf-44aa5e6524f1.mp3"
  },
  {
    id: "scOwDtmlUjD3prqpp97I",
    name: "Sam",
    description: "Guide with a warm, clear American clarity.",
    tags: ["Male", "Business", "Tutorials", "Middle-aged"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/c8c50145-e42a-4826-8cae-ab72c3cc6533.mp3"
  },
  {
    id: "19STyYD15bswVz51nqLf",
    name: "Samara",
    description: "Impress with elegant, relaxed British poise.",
    tags: ["Female", "Business", "Commercials", "Middle-aged"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/6744f189-598c-4074-9f03-8e754c571c0a.mp3"
  },
  {
    id: "BZgkqPqms7Kj9ulSkVzn",
    name: "Eve",
    description: "Brighten with energetic, happy enthusiasm.",
    tags: ["Female", "Social", "Commercials", "Young"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/e1b3cd46-fcf2-4be9-904f-90df58002e22.mp3"
  },
  {
    id: "wo6udizrrtpIxWGp2qJk",
    name: "Northern Terry",
    description: "Entertain with an eccentric North English flair.",
    tags: ["Male", "Entertainment", "Gaming", "Middle-aged"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/7eaeb45c-6b0a-4d6c-8bcc-0f3499a21e34.mp3"
  },
  {
    id: "yjJ45q8TVCrtMhEKurxY",
    name: "Dr. Von Fusion",
    description: "Energize with quirky, mad-scientist charisma.",
    tags: ["Male", "Entertainment", "Gaming", "Middle-aged"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/f3be17ad-371e-4a37-93f9-a8507fceef91.mp3"
  },
  {
    id: "gU0LNdkMOQCOrPrwtbee",
    name: "Football Announcer",
    description: "Electrify with fast-paced sports commentary.",
    tags: ["Male", "Entertainment", "Commercials", "Middle-aged"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/a17128f1-c2b5-4587-800b-1240ddec56d4.mp3"
  },
  {
    id: "DGzg6RaUqxGRTHSBjfgF",
    name: "Drill Sergeant",
    description: "Command with harsh, barking authority.",
    tags: ["Male", "Entertainment", "Gaming", "Middle-aged"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/85cb2745-ac21-4a9e-ac89-bd54fceae951.mp3"
  },
  {
    id: "x70vRnQBMBu4FAYhjJbO",
    name: "Nathan Fence",
    description: "Broadcast with dynamic, seasoned radio presence.",
    tags: ["Male", "Podcast", "Commercials", "Middle-aged"],
    provider: "elevenlabs",
    previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/a933802c-285e-4c2f-9aba-389ea0fbb0e6.mp3"
  }
];
function getVoiceById(id, extra) {
  return [...ELEVENLABS_VOICES, ...OPENAI_VOICES, ...GEMINI_VOICES, ...GROK_VOICES, ...SEEDAUDIO_VOICES, ...extra ?? []].find((v) => v.id === id);
}
var OPENAI_DEFAULT_VOICE_ID = "alloy";
var OPENAI_VOICES = [
  { id: "alloy", name: "Alloy", description: "Versatile and balanced neutral tone.", tags: ["Neutral", "Versatile", "Young"], provider: "openai" },
  { id: "ash", name: "Ash", description: "Warm and conversational delivery.", tags: ["Male", "Conversational", "Warm"], provider: "openai" },
  { id: "ballad", name: "Ballad", description: "Soft and melodic storytelling voice.", tags: ["Male", "Storytelling", "Soft"], provider: "openai" },
  { id: "coral", name: "Coral", description: "Clear, engaging and approachable.", tags: ["Female", "Engaging", "Clear"], provider: "openai" },
  { id: "echo", name: "Echo", description: "Deep and resonant masculine tone.", tags: ["Male", "Deep", "Resonant"], provider: "openai" },
  { id: "fable", name: "Fable", description: "Expressive British-accented storyteller.", tags: ["Male", "Storytelling", "British"], provider: "openai" },
  { id: "nova", name: "Nova", description: "Bright, energetic and youthful.", tags: ["Female", "Energetic", "Young"], provider: "openai" },
  { id: "onyx", name: "Onyx", description: "Deep and authoritative presence.", tags: ["Male", "Authoritative", "Deep"], provider: "openai" },
  { id: "sage", name: "Sage", description: "Calm and wise, measured delivery.", tags: ["Female", "Calm", "Professional"], provider: "openai" },
  { id: "shimmer", name: "Shimmer", description: "Light, pleasant and uplifting.", tags: ["Female", "Pleasant", "Uplifting"], provider: "openai" },
  { id: "verse", name: "Verse", description: "Dynamic and versatile performer.", tags: ["Male", "Dynamic", "Versatile"], provider: "openai" }
];
var GEMINI_DEFAULT_VOICE_ID = "Kore";
var GEMINI_VOICES = [
  { id: "Aoede", name: "Aoede", description: "Bright and clear with musical quality.", tags: ["Female", "Bright", "Musical"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/9af546bd-8150-4c00-ac89-31b66344714c.wav" },
  { id: "Charon", name: "Charon", description: "Deep and authoritative guide.", tags: ["Male", "Deep", "Authoritative"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/9245d89b-0a89-40f2-966c-65e5f77ad842.wav" },
  { id: "Fenrir", name: "Fenrir", description: "Strong and bold with natural power.", tags: ["Male", "Bold", "Strong"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/259161fd-0265-4167-a02d-dc359aaf4009.wav" },
  { id: "Kore", name: "Kore", description: "Warm and natural everyday voice.", tags: ["Female", "Warm", "Natural"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/888028e9-23b7-4283-a08a-603f440b15b2.wav" },
  { id: "Leda", name: "Leda", description: "Gentle and soothing feminine tone.", tags: ["Female", "Gentle", "Soothing"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/9781ba18-8051-4ba5-abfb-76ada84c05c0.wav" },
  { id: "Orus", name: "Orus", description: "Rich baritone with professional presence.", tags: ["Male", "Professional", "Rich"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/501d2f54-afd9-4107-b99a-407216934290.wav" },
  { id: "Puck", name: "Puck", description: "Playful and energetic with character.", tags: ["Male", "Playful", "Energetic"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/cf8b7a53-c40f-40cd-aa3e-7ce9c8e812ba.wav" },
  { id: "Zephyr", name: "Zephyr", description: "Light and breezy, conversational style.", tags: ["Female", "Conversational", "Light"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/90de2d08-c3d8-4e8e-b657-bb133ac1b627.wav" },
  // Extended voices from Vertex AI
  { id: "Achernar", name: "Achernar", description: "Crisp and commanding stellar voice.", tags: ["Male", "Commanding", "Crisp"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/90b17881-6583-47dd-b4d1-a9ec2f2a5a7a.wav" },
  { id: "Achird", name: "Achird", description: "Steady and dependable narrator.", tags: ["Male", "Steady", "Dependable"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/2a3c3e8e-bb04-43c9-b6d2-5b82e7b981f4.wav" },
  { id: "Algenib", name: "Algenib", description: "Warm and articulate storyteller.", tags: ["Male", "Warm", "Articulate"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/c29be725-f696-4558-ac8a-d6a2d2bcfcda.wav" },
  { id: "Algieba", name: "Algieba", description: "Smooth and engaging presenter.", tags: ["Male", "Smooth", "Engaging"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/86556cca-3de8-4cb3-bd89-f5ff6766d190.wav" },
  { id: "Alnilam", name: "Alnilam", description: "Bold and resonant with clarity.", tags: ["Male", "Bold", "Resonant"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/8cb284a8-c52b-4e93-9a89-961c36ad1fb5.wav" },
  { id: "Autonoe", name: "Autonoe", description: "Elegant and poised feminine voice.", tags: ["Female", "Elegant", "Poised"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/c0a6d1a8-8b3d-411d-98fe-2dac5494cea5.wav" },
  // Callirhoe is listed in Google's voice whitelist but their TTS endpoint
  // deterministically rejects it with INVALID_ARGUMENT — removed until fixed upstream.
  { id: "Despina", name: "Despina", description: "Lively and vibrant with charm.", tags: ["Female", "Lively", "Vibrant"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/c5e7f47f-dc98-44b6-87a5-78588b35b022.wav" },
  { id: "Enceladus", name: "Enceladus", description: "Deep and immersive narrator.", tags: ["Male", "Deep", "Immersive"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/84a9a79e-9018-4d79-8d49-b73e05681fdc.wav" },
  { id: "Erinome", name: "Erinome", description: "Soft and thoughtful delivery.", tags: ["Female", "Soft", "Thoughtful"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/96ac54b0-50d3-4389-a52b-07e7300c9adc.wav" },
  { id: "Gacrux", name: "Gacrux", description: "Precise and professional tone.", tags: ["Male", "Precise", "Professional"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/2a179060-3eac-42c2-b239-93aecb6523bf.wav" },
  { id: "Iapetus", name: "Iapetus", description: "Grand and dramatic presence.", tags: ["Male", "Grand", "Dramatic"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/f43642c0-b686-41ad-9e81-5895037b21a8.wav" },
  { id: "Laomedeia", name: "Laomedeia", description: "Calm and reassuring guide.", tags: ["Female", "Calm", "Reassuring"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/e89fa9fd-41cd-49a4-9200-c4628b532b89.mp3" },
  { id: "Pulcherrima", name: "Pulcherrima", description: "Beautiful and radiant voice.", tags: ["Female", "Beautiful", "Radiant"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/14625d6e-5873-4850-9e60-e25fa1acf0de.wav" },
  { id: "Rasalgethi", name: "Rasalgethi", description: "Warm and friendly conversationalist.", tags: ["Male", "Warm", "Friendly"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/566c22cc-8085-4d66-a04f-eacda73a6228.wav" },
  { id: "Sadachbia", name: "Sadachbia", description: "Cheerful and upbeat delivery.", tags: ["Male", "Cheerful", "Upbeat"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/72233441-d05c-469a-a390-595e5c8cf21d.wav" },
  { id: "Sadaltager", name: "Sadaltager", description: "Confident and balanced narrator.", tags: ["Male", "Confident", "Balanced"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/afa6e7c7-f44e-4732-93d0-f2a6f7a34a81.wav" },
  { id: "Schedar", name: "Schedar", description: "Regal and distinguished tone.", tags: ["Male", "Regal", "Distinguished"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/9dbaff8e-ed36-4ddb-a61f-bc52296112b2.wav" },
  { id: "Sulafat", name: "Sulafat", description: "Bright and optimistic energy.", tags: ["Female", "Bright", "Optimistic"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/df1ff576-904b-49ca-b9d3-949947ca1d89.wav" },
  { id: "Umbriel", name: "Umbriel", description: "Mysterious and intriguing voice.", tags: ["Male", "Mysterious", "Intriguing"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/f3b94e1c-9c1c-42d1-9ef7-6b5455df9f01.wav" },
  { id: "Vindemiatrix", name: "Vindemiatrix", description: "Graceful and refined feminine tone.", tags: ["Female", "Graceful", "Refined"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/3bb0c1fb-1710-4a78-a16d-dd0553d8fa8e.wav" },
  { id: "Zubenelgenubi", name: "Zubenelgenubi", description: "Unique and distinctive character voice.", tags: ["Male", "Unique", "Distinctive"], provider: "google", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/dad7c645-0946-4dcc-90be-d5fa46fbc03f.wav" }
];
var DEFAULT_GROK_VOICE_ID = "eve";
var GROK_VOICES = [
  { id: "eve", name: "Eve", description: "Warm and balanced everyday voice.", tags: ["Female", "Warm", "Balanced"], provider: "grok", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/4c668ccd-9644-43f9-8df1-a07354a04817.mp3" },
  { id: "ara", name: "Ara", description: "Clear and expressive narrator.", tags: ["Female", "Clear", "Expressive"], provider: "grok", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/76e3125c-d58e-4578-b410-c1c5b18f3fdf.mp3" },
  { id: "rex", name: "Rex", description: "Bold and assertive with strong presence.", tags: ["Male", "Bold", "Assertive"], provider: "grok", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/abb44e3c-0a1c-4aae-9414-76152a9f1e66.mp3" },
  { id: "sal", name: "Sal", description: "Smooth and measured conversational tone.", tags: ["Neutral", "Smooth", "Conversational"], provider: "grok", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/9ee27062-dabc-4460-ae2a-fd877f4c9005.mp3" },
  { id: "leo", name: "Leo", description: "Confident and resonant masculine voice.", tags: ["Male", "Confident", "Resonant"], provider: "grok", previewUrl: "https://cdn-cms-uploads.picsart.com/cms-uploads/be019e3e-b935-42ab-8685-f321a94d42f7.mp3" }
];
var ASYNC_DEFAULT_VOICE_ID = "cca0e076-94b9-4c6d-86b7-546168f11174";
var ASYNC_VOICES = [
  { id: "cca0e076-94b9-4c6d-86b7-546168f11174", name: "Jennie", description: "A clear and professional female voice with a composed and authoritative tone. She speaks with precise articulation and a steady pace, making complex information easy to understand. Ideal for corporate presentations, educational content, business narration, or explainer videos.", tags: ["Female", "British (UK)", "Conversational AI", "IVR", "Informative/Educational", "Commercial/Advertisement"], provider: "async" },
  { id: "f493c663-b272-493e-8b78-72d2262a2a8d", name: "Stella", description: "Warm, lively female voice with a naturally conversational tone. Sweet and expressive delivery that feels effortless and human, with soft emotional nuance, playful energy, and fluid pacing.", tags: ["Female", "Conversational AI", "Storytelling"], provider: "async" },
  { id: "317bf805-4b42-417b-9474-10807e2f67c9", name: "Max", description: "This is a confident male voice with a clear, smooth, and slightly formal delivery. The tone is informative and reassuring, making it suitable for educational content, corporate presentations, or sophisticated commercial advertisements that aim to build trust and convey expertise.", tags: ["Male", "British (UK)", "Informative/Educational", "Commercial/Advertisement"], provider: "async" },
  { id: "3950360d-4810-4c65-a0b8-eb5b4b3b4231", name: "Hayes", description: "Male voice with a clear, articulate, and steady vocal quality. He speaks with a calm, professional, and informative tone, carrying a neutral North American accent. This voice is ideal for corporate narration, educational content, documentaries, or any material requiring precise and authoritative delivery.", tags: ["Male", "American (US)", "Informative/Educational", "Audiobook", "Podcast"], provider: "async" },
  { id: "a6268eaf-976d-4d44-871d-57e1d58002c7", name: "Elara", description: "This female voice features a clear, bright, and warm vocal quality. She delivers content with a friendly, conversational tone and clear articulation. Ideal for corporate storytelling, informative content, or friendly commercial narrations.", tags: ["Female", "American (US)", "Informative/Educational", "Storytelling", "Commercial/Advertisement"], provider: "async" },
  { id: "84905ece-2420-47b5-b3d6-964e62200c73", name: "Cleo", description: "Warm female voice with a gentle, inviting tone, delivering narration in a smooth, steady pace. This voice is perfect for audiobooks, children's stories, or any content requiring a comforting and engaging storytelling style.", tags: ["Female", "British (UK)", "Audiobook", "Storytelling"], provider: "async" },
  { id: "a44e2f09-6897-4e1e-8573-631207c53f6d", name: "Fisher", description: "This is a warm and clear male voice with a calm, conversational tone. It's well-suited for educational content, corporate presentations, and audiobooks that require an engaging yet authoritative delivery. The speaker's steady pace and balanced intonation make it easy to follow and absorb information.", tags: ["Male", "American (US)", "Informative/Educational", "Audiobook"], provider: "async" },
  { id: "8f7ad606-26df-400a-8336-e7162a977be7", name: "Corin", description: "Professional male voice with a warm vocal quality and an authoritative yet friendly tone. This voice is ideal for corporate presentations, informative content, or commercials that require a trustworthy and engaging delivery.", tags: ["Male", "American (US)", "Informative/Educational", "Commercial/Advertisement", "Conversational AI", "Storytelling"], provider: "async" },
  { id: "c8dab279-6c67-468c-977d-ce4081fa3936", name: "Thaddeus", description: "Clear, well-articulated male voice with a calm and informative tone. The intonation is precise and even, making it ideal for educational content, corporate presentations, or conversational AI that requires a professional and steady delivery.", tags: ["Male", "American (US)", "Informative/Educational", "Conversational AI"], provider: "async" },
  { id: "054c9aed-4786-4fa5-a317-09abd199e21f", name: "Lucina", description: "Clear and smooth female voice with excellent articulation and a calm, engaging tone. Her British accent and steady pace make her ideal for storytelling, audiobooks, and informative narration.", tags: ["Female", "British (UK)", "Audiobook", "Informative/Educational", "Storytelling"], provider: "async" },
  { id: "ef932845-cfe9-4748-a123-454664076938", name: "Acadia", description: "Clear and authoritative female voice with a smooth, energetic delivery. She speaks with a commanding yet reassuring tone, emphasizing key phrases effectively. This voice is ideal for corporate narration, motivational content, or informative commercials that require clear communication and impact.", tags: ["Female", "American (US)", "Commercial/Advertisement", "Informative/Educational", "Motivational"], provider: "async" },
  { id: "cfc8833a-dc45-40e9-9279-57cad23e3c09", name: "Huxley", description: "Clear, well-articulated male voice with a calm and authoritative tone, delivering information with precision. This professional voice is ideal for corporate presentations, educational content, or informative narrations that require a steady and confident delivery.", tags: ["Male", "American (US)", "Informative/Educational", "Commercial/Advertisement", "Audiobook"], provider: "async" },
  { id: "5d20dd0a-a781-43ea-b06c-56892a691715", name: "Winslet", description: "Clear and articulate female voice with a smooth, bright quality. The delivery is calm, professional, and gently encouraging, maintaining a steady, even pace. This voice is well-suited for corporate presentations, educational content, narration, or conversational AI where a composed and clear presence is desired.", tags: ["Female", "British (UK)", "Informative/Educational", "Conversational AI", "Storytelling", "Commercial/Advertisement"], provider: "async" },
  { id: "46ffc709-542b-409c-a8a9-aa5d3e0e1cfc", name: "Jethro", description: "Well-articulated male voice with a clear, authoritative, and steady tone, demonstrating precise pronunciation. This voice is ideal for informative and educational content, corporate presentations, or any narration requiring clarity and a composed delivery.", tags: ["Male", "American (US)", "Informative/Educational", "Narration", "Podcast"], provider: "async" },
  { id: "e5a67eaf-6e5a-4488-9fb9-4806bd7fea54", name: "Elio", description: "This is a confident male voice with a clear, bright tone and an energetic delivery. It's ideal for commercials, advertisements, and informative content where an authoritative yet engaging presence is desired to capture attention.", tags: ["Male", "American (US)", "Commercial/Advertisement", "Informative/Educational"], provider: "async" },
  { id: "c01e9ac9-dc1b-4263-9b70-091f919c05f4", name: "Rupert", description: "Clear and resonant male voice with an articulate British accent. The tone is authoritative and informative, delivered with precision and a measured pace. Ideal for corporate narration, educational content, documentaries, or impactful presentations.", tags: ["Male", "British (UK)", "Informative/Educational", "Storytelling", "Audiobook", "Commercial/Advertisement"], provider: "async" },
  { id: "d7eb91fb-c2a7-45fd-b65a-80b8b499be7f", name: "Eira", description: "Clear and bright female voice with a friendly, conversational tone. Her speech is articulate and has a pleasant, informative cadence, making it easy to follow. This voice is ideal for IVR systems, conversational AI, or customer service applications, as well as commercials requiring a clear and engaging delivery.", tags: ["Female", "American (US)", "Conversational AI", "IVR", "Commercial/Advertisement", "Informative/Educational"], provider: "async" },
  { id: "3f1e185f-6e91-4253-b94a-d8b53f6214be", name: "Nyra", description: "Crisp and highly articulate, this female voice delivers information with bright precision. Her neutral American accent and energetic pacing make complex concepts feel approachable and easy to follow. She shines in financial explainers, e-learning modules, and any content requiring unwavering clarity and engagement.", tags: ["Female", "American (US)", "Informative/Educational", "Commercial/Advertisement", "Podcast"], provider: "async" },
  { id: "8288f28a-a3f4-4792-a26e-d762fc2263b9", name: "Arian", description: "A voice of thoughtful authority, this male speaker brings clarity to complex subjects with a mid-range warmth that feels both knowledgeable and approachable. His articulate, measured delivery is like a guiding hand through new information, perfect for someone explaining big ideas. This voice excels in educational narration, science documentaries, and explainer videos that need a trusted guide.", tags: ["Male", "American (US)", "Informative/Educational", "Audiobook", "Podcast", "Storytelling"], provider: "async" },
  { id: "854eef1c-9aae-41ae-8849-2a32b9b349bb", name: "Lily", description: "Unveiling facts with crisp precision, this female voice carries a bright, almost clinical clarity. Her Standard British delivery is meticulously articulated, making complex information feel effortlessly digestible. She excels in educational narration, corporate explainers, and any scenario requiring a trustworthy, authoritative, yet engaging guide.", tags: ["Female", "British (UK)", "Informative/Educational", "Podcast", "Conversational AI"], provider: "async" },
  { id: "a5e830d5-e543-4250-9724-a24c452fa248", name: "Pierce", description: "Delivering with dynamic energy, this resonant male voice carries a powerful, almost theatrical presence that grabs attention. His crisp articulation and rhythmic emphasis imbue each statement with a sense of urgency, akin to a major announcement. This commanding style is tailor-made for high-impact commercials, movie trailers, and promotional content designed for immediate impact.", tags: ["Male", "American (US)", "Commercial/Advertisement", "Movie trailer", "Motivational"], provider: "async" },
  { id: "15a92057-54a7-4bb8-979c-38f44581fb8c", name: "Kaela", description: "With a crisp, bright clarity that cuts through like morning light, this voice delivers information with an engaging, nimble precision. She sounds like a knowledgeable friend guiding you through a process, infusing every word with persuasive energy. This energetic yet clear style shines in explainer videos, product demonstrations, and engaging e-learning modules.", tags: ["Female", "American (US)", "Informative/Educational", "Commercial/Advertisement", "Conversational AI"], provider: "async" },
  { id: "f57e9942-4d9e-4b05-8a0c-585359eef0dd", name: "Elowen", description: "Her voice rings with a bright, articulate clarity, delivering each word with a helpful and assured tone. It carries the approachable warmth of a trusted advisor, blending professional precision with an inviting, conversational flow. She brings life to IVR systems, customer support, and informative e-learning modules where trustworthiness and ease of understanding are paramount.", tags: ["Female", "American (US)", "Conversational AI", "IVR", "Informative/Educational"], provider: "async" },
  { id: "965d9bd7-9e95-4cdd-a798-80a5233705bd", name: "Freya", description: "Sparkling with clarity and a confident British lilt, this female voice delivers information with approachable authority. Her precise articulation and bright, engaging tone make complex topics easy to digest, like a trusted guide leading the way. This voice shines in corporate presentations, e-learning, and explainer videos.", tags: ["Female", "British (UK)", "Informative/Educational", "Storytelling"], provider: "async" },
  { id: "66254e55-d74a-4b23-a12a-cccdd14a25a0", name: "Lenny", description: "Projecting an air of measured authority, this male voice articulates with crisp, British precision, maintaining a consistent, informative tone. Each word is delivered with the clarity of a well-rehearsed lecture, ensuring understanding without losing pace. This voice is built for corporate training, detailed explainers, and any scenario where precise, factual delivery is paramount.", tags: ["Male", "British (UK)", "Informative/Educational"], provider: "async" },
  { id: "8bab777e-1a1e-43d8-915d-eaafcb446e9d", name: "Alessa", description: "Like a seasoned presenter, this female voice maintains an unflappable composure, delivering information with a smooth, unwavering clarity. Her even-keeled tone and neutral American accent exude absolute reliability, making her built for corporate explainers, detailed technical presentations, and dependable IVR systems.", tags: ["Female", "American (US)", "Informative/Educational", "IVR", "Conversational AI"], provider: "async" },
  { id: "2d83227c-1abf-47c0-902d-f82448bdc598", name: "Pandora", description: "This female voice resonates with an impressive clarity, her bright and steady tone delivering every word with unwavering precision. Her General American English is impeccably enunciated, bringing to mind a highly capable instructor. She's built for e-learning modules, corporate training, and technical narrations where absolute accuracy and authority are essential.", tags: ["Female", "American (US)", "Informative/Educational", "Storytelling"], provider: "async" },
  { id: "4a7876f0-5fb4-4ed8-a104-890bc30d9832", name: "Fia", description: "Whispering secrets and weaving tales, this female voice carries a delicate, breathy quality that instantly evokes mystery. Her delivery is hushed and reflective, building a quiet suspense that beckons listeners closer. She shines in dark fantasy audiobooks, narrative podcasts with an eerie twist, and introspective storytelling.", tags: ["Female", "American (US)", "Audiobook", "Storytelling", "Podcast"], provider: "async" },
  { id: "f7f4fee8-845b-49d2-be7e-6ff7c8706b55", name: "Abbott", description: "Gravitas pours from this male voice, delivered with a resonant British clarity that lends authority to every word. There's a measured, almost theatrical precision to his intonation, evoking a sense of profound discovery or serious exposition. This voice brings an impactful presence to documentaries, scientific narration, and high-stakes corporate messaging.", tags: ["Male", "British (UK)", "Informative/Educational", "Storytelling", "Audiobook"], provider: "async" },
  { id: "b355a1d2-f989-4e62-a997-5de0bb2aa841", name: "Kael", description: "This male voice delivers complex information with surgical precision and unwavering clarity. His neutral American accent and slightly accelerated, yet perfectly articulated pace makes it feel like an authoritative lecture, ensuring every technical detail is heard. Such a precise, knowledge-driven delivery shines in scientific explainers, e-learning modules, and corporate training scenarios.", tags: ["Male", "American (US)", "Informative/Educational"], provider: "async" },
  { id: "ee89b03c-5275-488a-b5d2-ca5ca364e857", name: "Orla", description: "Radiant and articulate, this female voice carries a bright, confident tone with a precise British accent. She delivers information with an engaging crispness, like a polished keynote speaker, bringing clarity and authority to corporate presentations, detailed explainers, and brand narratives.", tags: ["Female", "British (UK)", "Informative/Educational", "Commercial/Advertisement", "Podcast"], provider: "async" },
  { id: "fb9cc041-75e5-4ac5-ae7f-c763f1e54797", name: "Sable", description: "Hear a voice with the dependable clarity of a seasoned guide, each word precisely delivered yet flowing with an approachable warmth. He conveys information with an earnest, engaging rhythm, making him a compelling presence in nature documentaries, property showcases, and any narrative that benefits from a reassuring, knowledgeable delivery.", tags: ["Male", "American (US)", "Informative/Educational", "Storytelling", "Commercial/Advertisement"], provider: "async" },
  { id: "c81384a9-3dce-48d2-bb5b-b0875f2db37e", name: "Marnie", description: "Radiating with bright energy and a crisp British delivery, this female voice engages listeners with a confident, conversational flow. Her articulate and upbeat style brings life to product showcases and contemporary brand advertisements, particularly those requiring a relatable, persuasive touch.", tags: ["Female", "British (UK)", "Commercial/Advertisement", "Informative/Educational"], provider: "async" },
  { id: "9e5001fa-5367-4f6d-a079-6bfc0ddbff69", name: "Sera", description: "Bright, almost crystalline clarity defines this voice, articulating every word with the welcoming precision of an advanced digital interface. She guides listeners through tasks and information with an unwavering, upbeat consistency. This presence shines in sophisticated IVR, user onboarding, or conversational AI, where a reassuringly efficient presence is key.", tags: ["Female", "American (US)", "IVR", "Conversational AI", "Informative/Educational"], provider: "async" },
  { id: "17486b3b-2ffb-43e7-9d81-3ed3d147a497", name: "Virel", description: "With an unwavering precision, this voice delivers each word with crisp clarity and an authoritative, yet controlled, power. She commands attention like a seasoned leader; a delivery built for high-stakes corporate communications, technical explainers, and critical defense briefings.", tags: ["Female", "American (US)", "Informative/Educational", "IVR", "Conversational AI"], provider: "async" },
  { id: "44523faf-3c13-469e-961e-eb7c5496cb90", name: "Liora", description: "This voice feels like a well-organized thought, delivering information with an articulate, almost crisp precision. Her tone is clear and consistently steady, making complex instructions sound effortlessly manageable. It's a voice perfectly built for guiding users through processes, making it a standout for IVR systems, e-learning modules, and product tutorials.", tags: ["Female", "American (US)", "IVR", "Informative/Educational", "Conversational AI"], provider: "async" },
  { id: "350bf05c-7858-49c1-859e-ef1e657d43f2", name: "Riven", description: "Bright, articulate British accent defines this male voice, carrying a tone that's both warmly informative and efficiently engaging. His delivery feels like a trusted guide, calmly navigating listeners through information with a subtle, reassuring cadence. This makes him an excellent fit for IVR systems, e-learning content, and customer service platforms that prioritize clarity and approachability.", tags: ["Male", "British (UK)", "IVR", "Informative/Educational", "Conversational AI"], provider: "async" },
  { id: "8788ac4f-2156-40ce-8030-7a9a0a9b9161", name: "Elys", description: "Her voice has the crystalline clarity of a well-presented solution, with a bright, articulate delivery that feels both professional and approachable. There's an understated energy in her precise yet flowing speech, as if she's confidently simplifying complex information for you. She brings life to corporate explainers, e-learning modules, and any narrative requiring a trustworthy, engaging guide.", tags: ["Female", "American (US)", "Informative/Educational", "Commercial/Advertisement", "Conversational AI"], provider: "async" },
  { id: "348aff4f-dff7-4871-81d5-fc31c3d90ef6", name: "Dreena", description: "Her voice cuts through with a crisp, no-nonsense clarity, commanding attention with its precise articulation. She speaks with the firm confidence of an expert, making complex instructions sound effortlessly simple. This voice brings life to product demonstrations, corporate training, and persuasive marketing content.", tags: ["Female", "American (US)", "Commercial/Advertisement", "Informative/Educational"], provider: "async" },
  { id: "b976d8b2-e1f8-4c22-b6ba-87ce392f0f01", name: "Rhea", description: "Brimming with the bright, crisp energy of a fresh morning, this voice articulates information with an upbeat, professional cadence. Every word lands with precise clarity, carrying an unflagging helpfulness that feels both organized and inviting. It\u2019s built for IVR systems, instructional narrations, and any setting requiring direct, confident communication.", tags: ["Female", "American (US)", "IVR", "Informative/Educational", "Commercial/Advertisement"], provider: "async" },
  { id: "0aef6559-9098-4860-8224-13e038ab3aef", name: "Vela", description: "Sparkling clarity defines this voice, delivering information with an engaging, rapid-fire precision. There's an energetic, yet reassuring presence that guides listeners through details with unwavering confidence and a forward-moving pace. This vocal character is built for IVR systems, fast-paced explainers, and any scenario demanding clear, efficient, and engaging instruction.", tags: ["Female", "American (US)", "IVR", "Informative/Educational", "Conversational AI"], provider: "async" },
  { id: "1e5d72bd-4a36-4abe-9b57-15dfc2b3841c", name: "Nymera", description: "Her voice has an invigorating snap, cutting through with bright clarity and an articulate, confident pace. She speaks with a persuasive energy, each word landing with an almost motivational zeal. This delivery brings life to fast-paced commercials, energetic product explainers, and engaging marketing campaigns.", tags: ["Female", "American (US)", "Commercial/Advertisement", "Informative/Educational", "Motivational"], provider: "async" },
  { id: "20180bd3-4f7a-4d83-9599-9a40c282ef04", name: "Isolde", description: "Like a well-lit path on a clear day, this voice navigates information with bright articulation and a reassuring cadence. There\u2019s a pleasant, efficient energy to her delivery, instantly conveying competence and approachability. She shines in customer service AI, IVR prompts, and straightforward e-learning.", tags: ["Female", "American (US)", "Conversational AI", "Informative/Educational", "IVR"], provider: "async" },
  { id: "66318ebc-62a9-437a-989a-9bd148ec829a", name: "Lirien", description: "This voice feels like a helpful virtual assistant: bright, articulate, and always a step ahead. Her tone is clear and consistently encouraging, with a friendly yet informative lilt that makes complex instructions easy to follow. She is designed for interactive guides, conversational AI, and e-learning platforms where clarity and approachability are paramount.", tags: ["Female", "American (US)", "Conversational AI", "Informative/Educational"], provider: "async" },
  { id: "dfa6d420-4742-452f-b2fb-5d7ba0c3852e", name: "Zella", description: "With a bright, no-nonsense delivery, this voice cuts through like a clear morning announcement, making complex information instantly digestible. Her crisp articulation and confident, slightly rapid pace bring a decisive authority to corporate presentations, explainer videos, or any content requiring precise, unyielding clarity.", tags: ["Female", "American (US)", "Informative/Educational", "Commercial/Advertisement", "Newscasting"], provider: "async" },
  { id: "9e9a769b-a283-4b03-93a5-bee4a5bd62bc", name: "Avenna", description: "Her voice carries a polished, articulate clarity, like a trusted guide leading you through intricate details. This speaker's precise British delivery, with its measured pace and confident intonation, projects an assured authority that feels both approachable and highly informed. She excels in corporate training, complex explainers, and any scenario where clear, convincing exposition is paramount.", tags: ["Female", "British (UK)", "Informative/Educational", "Commercial/Advertisement"], provider: "async" },
  { id: "2808aed4-85d9-4b61-87d9-daefdaad29af", name: "Mirelle", description: "A voice like a refreshing glass of water: crisp, clear, and utterly revitalizing. She offers a naturally upbeat and helpful tone, with a slight, friendly lilt that makes every instruction feel like a pleasant conversation. This vibrant delivery shines in conversational AI, IVR systems, and interactive e-learning.", tags: ["Female", "American (US)", "Conversational AI", "IVR", "Informative/Educational"], provider: "async" },
  { id: "d8acc796-5d2c-475c-ae8e-2f1c8158490c", name: "Calia", description: "Articulate British female voice that projects authority with a polished, measured tone. Her delivery maintains a professional distance, yet carries a subtle underlying warmth, making complex information accessible. She's built for corporate explainers, medical narrations, and educational content where clarity and gravitas are paramount.", tags: ["Female", "British (UK)", "Informative/Educational", "Newscasting"], provider: "async" },
  { id: "059fee9c-51a5-4db9-8c8c-1ff1ede29cf1", name: "Lunea", description: "A British voice that resonates with unwavering professionalism, her delivery is both clear and deeply reassuring. She speaks with a composed precision, making complex information feel effortlessly digestible. This vocal presence is built for corporate explainers, high-stakes informational audio, and sophisticated IVR systems.", tags: ["Female", "British (UK)", "Informative/Educational", "Storytelling"], provider: "async" },
  { id: "6d891f84-452e-4412-a72a-f00eea0f1fd7", name: "Lucan", description: "With a confident, up-tempo delivery, this male voice cuts through the noise like a well-oiled presentation. He articulates complex information with energetic precision, making it immediately digestible and persuasive. This commanding vocal presence shines in product demonstrations, corporate training, and fast-paced advertisements for innovative solutions.", tags: ["Male", "American (US)", "Commercial/Advertisement", "Informative/Educational"], provider: "async" },
  { id: "6112718a-871e-46f6-abb3-d0cdd1f4368a", name: "Tarian", description: "With a sparkling clarity and an effortlessly articulate delivery, this voice possesses a guiding, upbeat energy that makes complex information feel easily digestible. He speaks with the approachable confidence of a favorite teacher, shining in educational content, how-to videos, and engaging explainer narrations.", tags: ["Male", "American (US)", "Informative/Educational", "Podcast", "Conversational AI"], provider: "async" },
  { id: "544ba1a4-4a04-4b93-9aaf-fadb09fed104", name: "Arlo", description: "Crisp and unwavering, this male voice delivers each phrase with the cool precision of a finely tuned machine. It guides listeners through information with unshakeable, programmed clarity, at home in complex IVR systems, technical support prompts, or any application requiring absolute instructional directness.", tags: ["Male", "American (US)", "IVR", "Informative/Educational"], provider: "async" },
  { id: "9f5d9d57-b7bb-4ee3-b627-d7402ed00d15", name: "Jovan", description: "This voice bounces with a bright, friendly energy, like a morning radio show host sharing interesting tidbits. His delivery is consistently clear and engaging, marked by an upbeat intonation that makes even simple information feel lively. He brings a welcoming, enthusiastic presence to narrative podcasts, short-form explainers, and conversational AI interfaces.", tags: ["Male", "American (US)", "Podcast", "Storytelling", "Informative/Educational", "Conversational AI"], provider: "async" },
  { id: "721d6b30-7601-4643-9447-6de1be2bd92e", name: "Neron", description: "A voice that projects confident ease, cutting through the noise with approachable clarity and a natural, engaging rhythm. He carries an articulate authority, yet remains conversational and relatable, like a trusted professional sharing insights. This voice shines in corporate explainers, impactful commercials, and any project needing a persuasive, yet genuine delivery.", tags: ["Male", "American (US)", "Commercial/Advertisement", "Informative/Educational", "Conversational AI"], provider: "async" },
  { id: "f161bd60-c617-44b0-8275-7f879c96e86c", name: "Ziven", description: "Unpacking information with a precise, yet friendly earnestness, this voice possesses a clear, resonant quality that cuts through distractions. He speaks with an understated authority, making even technical details sound relatable and important. It shines in product demonstrations, e-learning courses, and persuasive marketing content that seeks to build genuine consumer trust.", tags: ["Male", "American (US)", "Informative/Educational", "Commercial/Advertisement", "Podcast"], provider: "async" },
  { id: "610df5e1-2fa1-42e8-8dcd-988d2ec2d8f3", name: "Dax", description: "This voice carries a polished, business-like resonance, delivering information with crisp clarity and a confident, forward-driving energy. There\u2019s an undeniable competence in his delivery, making complex topics feel accessible and important; it shines in corporate presentations, informative explainers, and any scenario demanding a direct, authoritative presence.", tags: ["Male", "American (US)", "Informative/Educational", "Commercial/Advertisement", "Podcast"], provider: "async" },
  { id: "3f38104f-9327-4554-873d-7f092caf1256", name: "Orien", description: "A voice built for clarity, this male speaker delivers information with crisp precision and a direct, confident cadence. He sounds like a seasoned guide navigating complex data, making him a natural fit for technical explainers, corporate training, and informative AI interactions.", tags: ["Male", "American (US)", "Informative/Educational", "Conversational AI", "Podcast"], provider: "async" },
  { id: "07c10ae2-0007-4551-841d-f8dcbee53433", name: "Lior", description: "This voice cuts through the noise with a crisp, assertive clarity, driving information forward with energetic confidence. He sounds like a seasoned presenter equally at home narrating an action-packed game trailer or explaining complex concepts with compelling conviction. Its dynamic delivery brings life to commercials, corporate presentations, and fast-paced e-learning modules.", tags: ["Male", "American (US)", "Commercial/Advertisement", "Informative/Educational", "Motivational"], provider: "async" },
  { id: "5f41badd-5f53-4460-a5b2-63dda5503490", name: "Eryx", description: "An effortlessly clean voice with an upbeat, articulate delivery that commands attention without being forceful. He has a precise rhythm and consistent energy, making complex information sound clear and engaging. This voice is built for fast-paced commercials, product explainers, and corporate presentations that need to captivate.", tags: ["Male", "American (US)", "Commercial/Advertisement", "Informative/Educational"], provider: "async" },
  { id: "a8915cb1-a587-4313-841a-ddc74ff17050", name: "Tyren", description: "There's an unyielding clarity to this voice, a focused energy in its mid-range delivery that makes complex information feel effortlessly digestible. He moves through sentences with the brisk, confident pace of a well-prepared keynote speaker. This direct, articulate style shines in corporate explainers, tech demos, and any informative content demanding precision and professionalism.", tags: ["Male", "American (US)", "Informative/Educational", "Commercial/Advertisement", "Conversational AI"], provider: "async" },
  { id: "3010fa3f-897a-41e7-a426-a06f29f61f78", name: "Nox", description: "This voice delivers information with a crisp, energetic forward momentum, each word articulated clearly and precisely. He possesses a confident, almost assertive tone, like a thought leader presenting new ideas, making him compelling for tech explainers, business presentations, or any content requiring a dynamic, authoritative delivery.", tags: ["Male", "American (US)", "Informative/Educational", "Commercial/Advertisement", "Podcast"], provider: "async" },
  { id: "8abd608c-b8d3-4193-8d54-9976911a337c", name: "Elric", description: "There's an inviting warmth in this male voice, with a grounded clarity that speaks to genuine experience. His delivery feels like a trusted friend sharing insights, marked by an articulate, unforced rhythm. This voice shines in narrative podcasts, thoughtful documentaries, and any conversational AI needing a touch of human relatability.", tags: ["Male", "American (US)", "Podcast", "Storytelling", "Informative/Educational", "Conversational AI", "Commercial/Advertisement"], provider: "async" },
  { id: "43064fb0-6723-4f2c-a311-eaf6a5d2f0e5", name: "Varian", description: "This voice resonates with a profound, almost professorial authority, each word delivered with the steady weight of considered knowledge. He possesses an unhurried cadence that guides listeners through intricate details, like an expert lecturer unveiling a hidden truth. It brings an undeniable gravitas to long-form documentaries, complex educational modules, and high-stakes corporate narration.", tags: ["Male", "American (US)", "Informative/Educational", "Storytelling", "Commercial/Advertisement", "Audiobook"], provider: "async" },
  { id: "adf91049-3cab-4e62-b40c-be00fe34e0e6", name: "Zoran", description: "With a bright, forward projection, this voice commands attention through its impeccable clarity and precise articulation, effortlessly conveying complex information or dramatic narrative. There's a dynamic energy that feels both assured and engaging, like a seasoned presenter guiding you through important concepts. It finds a natural home in corporate training, high-energy commercials, and detailed explainer videos.", tags: ["Male", "American (US)", "Commercial/Advertisement", "Informative/Educational", "Podcast"], provider: "async" },
  { id: "04da033a-8919-4553-8fc5-eb6869e0c0e1", name: "Miro", description: "With a textured resonance that suggests both wisdom and approachability, this voice delivers each phrase with earnest conviction. He sounds like a grounded mentor, guiding listeners through complex information with steady assurance. This vocal character shines in public service announcements, documentary narration, and corporate explainers demanding unwavering credibility.", tags: ["Male", "American (US)", "Informative/Educational", "Commercial/Advertisement", "Storytelling"], provider: "async" },
  { id: "9f2e03d7-714d-48a5-a0e7-58c2b7efad23", name: "Dalen", description: "This voice possesses a grounded, articulate clarity, delivering each phrase with a steady, reassuring conviction. He speaks with the approachable authority of an experienced guide, making complex information digestible and trustworthy, particularly compelling for informative explainers, corporate training, and persuasive presentations.", tags: ["Male", "American (US)", "Informative/Educational", "Commercial/Advertisement", "Motivational"], provider: "async" },
  { id: "c1820aa0-467e-4b13-8f73-418f950dba51", name: "Ronix", description: "With a voice like polished oak, this male speaker presents information with unwavering clarity and an assured, steady rhythm. He sounds like a seasoned guide, meticulously leading listeners through complex topics without a hint of rush. This voice brings life to nature documentaries, educational modules, and serious corporate narrations.", tags: ["Male", "American (US)", "Informative/Educational", "Storytelling", "Podcast", "Audiobook"], provider: "async" },
  { id: "befbed31-f461-4bdc-8900-fe786fbeffc3", name: "Jarek", description: "With the steady composure of a seasoned chronicler, this male voice delivers information with crisp, unhurried articulation and an inherently factual tone. Each word is placed with purpose, creating a credible and consistent sound that cuts through noise. He brings history, scientific explanations, and detailed reports to life in documentaries, e-learning platforms, and corporate informational videos.", tags: ["Male", "American (US)", "Informative/Educational", "Storytelling", "Podcast", "Audiobook"], provider: "async" },
  { id: "d7979182-36b7-4ae5-8284-1962050da404", name: "Nyxie", description: "With the polished precision of a BBC newsreader, this British female voice articulates every word with clear, confident authority, hinting at deep subject matter expertise. Her measured cadence and informative tone shine in educational modules, medical explainers, and any scenario demanding factual accuracy and a reassuring presence.", tags: ["Female", "British (UK)", "Informative/Educational", "Audiobook", "Podcast"], provider: "async" },
  { id: "0e8463d7-5e80-47bf-b900-3bbf4e3e564a", name: "Soren", description: "Warm, friendly, and naturally conversational, it delivers messages with a relaxed charm that never sounds forced or overly polished. Its smooth, engaging tone is perfect for commercials, brand campaigns, product promotions, and everyday customer communication, creating an authentic connection that feels both trustworthy and relatable.", tags: ["Male", "American (US)", "Commercial/Advertisement"], provider: "async" },
  { id: "b0641d1a-e342-41d0-8a56-63781d487ca3", name: "Viona", description: "A luminous female voice delivers information with unshakeable clarity and a steady, reassuring cadence. Her standard American English articulation is crisp, making complex topics easy to follow, and a subtle warmth in her tone fosters trust without being overly intimate. This voice shines in e-learning modules, explainer videos, and any content where confident, reliable instruction is paramount.", tags: ["Female", "American (US)", "Informative/Educational", "Podcast"], provider: "async" },
  { id: "34123cc6-9377-4a13-8b4c-ed274cbe317a", name: "Selene", description: "Crisp and helpful, this female voice carries a bright, inviting cadence with a subtle upward inflection that makes every interaction feel like a friendly chat. Her precise articulation and clear, confident delivery are tailor-made for conversational AI, IVR systems, and helpful customer service prompts.", tags: ["Female", "American (US)", "Conversational AI", "IVR"], provider: "async" },
  { id: "4c71b60f-357f-4569-9867-cd1ce4ff58c8", name: "Rachiel", description: "With a voice like finely-tuned crystal, this speaker offers crisp British articulation that cuts through with intelligent clarity. Her delivery balances authority with an engaging precision, making complex information feel effortlessly digestible. She shines in corporate explainers, analytical podcasts, and educational content where impactful communication is key.", tags: ["Female", "British (UK)", "Informative/Educational", "Podcast", "Commercial/Advertisement"], provider: "async" },
  { id: "d1a08ee2-2706-4743-898c-882238036c81", name: "Corbin", description: "Well-articulated male voice with a clear and factual tone, emphasizing key words for impact. Ideal for documentaries, presentations, and educational content that requires precision and authority.", tags: ["Male", "British (UK)", "Informative/Educational"], provider: "async" },
  { id: "c6db469b-929f-4066-896c-165f60d09162", name: "Abigail", description: "Calm and informative female voice with a smooth, steady pace, ideal for commercials or advertisements that deliver content in a subtle, non-pushy manner while still engaging the audience with clarity.", tags: ["Female", "American (US)", "Commercial/Advertisement", "Informative/Educational", "Conversational AI"], provider: "async" },
  { id: "be6bbe5d-5f45-4ad8-bec9-ed6a7cdf5311", name: "Faith", description: "Calm, neutral-tone female voice that is soothing and professional. This voice is well-suited for corporate presentations, meditation guides, or customer service applications, where a balanced and composed tone is necessary to ensure clear communication while keeping the listener at ease.", tags: ["Female", "American (US)", "Commercial/Advertisement"], provider: "async" },
  { id: "aa40e5b8-af38-4f88-ab43-1fd5ca9749c6", name: "Kimberly", description: "Versatile and engaging female voice, ideal for commercials. Her tone can be both energetic and calming, making her perfect for a range of advertisements, from product promotions to brand messaging, ensuring the message is clear and impactful.", tags: ["Female", "American (US)", "Commercial/Advertisement"], provider: "async" },
  { id: "7cd2e6c8-a8f8-4115-a757-9397c0127e50", name: "Dave", description: "Steady, professional male voice with a composed, confident tone. Clear, reliable, and well-balanced, it delivers information with precision and calm authority. Perfect for corporate narration, educational content, audiobooks, or formal presentations.", tags: ["Male", "Informative/Educational", "IVR"], provider: "async" },
  { id: "7a3ef29d-8962-4722-adfb-fda21e0d821e", name: "Grace", description: "Upbeat female Australian voice with an inviting delivery and positive energy, perfect for friendly and informative presentations, commercials, and promotional content.", tags: ["Female", "Australian (AU)", "Strong Accents", "Informative/Educational", "Commercial/Advertisement"], provider: "async" },
  { id: "13616e5f-6fda-4247-b548-8821cb71fb54", name: "Alden", description: "Male voice with an intense, commanding tone of authority, perfect for character and movie trailer narration. His strong presence and powerful delivery create a sense of urgency and dominance, making him ideal for roles that require confidence and intensity.", tags: ["Male", "British (UK)", "Character", "Movie trailer"], provider: "async" },
  { id: "041937f9-3a23-4eef-a206-7c1656243825", name: "Renly", description: "Deep, ominous male voice that commands attention and instills caution. Perfect for warnings, alerts, suspenseful narrations, videogames and authoritative ai announcements.", tags: ["Male", "American (US)", "Character"], provider: "async" },
  { id: "fb8c1498-1d6b-446c-891e-163a79e6d817", name: "Violet", description: "Calm and neutral female voice with a moderate pace, providing information in a clear and approachable manner. This voice is well-suited for tutorials, explainer videos, or customer service applications, where a reassuring, steady tone is needed to convey information effectively without overwhelming the listener.", tags: ["Female", "British (UK)", "Informative/Educational", "Newscasting", "Conversational AI"], provider: "async" },
  { id: "f912f511-6b44-46dd-bd40-be3031201561", name: "Joel", description: "British male voice with an informative, educational style, delivering content in a balanced, professional, and direct manner. Perfect for e-learning courses, corporate training, instructional videos, and educational presentations, offering clear, authoritative communication that engages the audience while maintaining a focus on the message.", tags: ["Male", "British (UK)", "Informative/Educational"], provider: "async" },
  { id: "f5b7eb43-2365-410a-95e0-beb92768809c", name: "Xavier", description: "Calm, measured voice with a smooth and steady delivery. Ideal for narrations, guided tutorials, and professional presentations where clarity, composure, and a polished tone create an engaging and easy-to-follow listening experience.", tags: ["Male", "American (US)", "Informative/Educational", "Conversational AI"], provider: "async" },
  { id: "f26d400a-a7ff-4522-b098-485b2f34b123", name: "Esmeralda", description: "Female voice with robotic enunciation and artificial pauses, delivering information in a precise and structured manner. Ideal for IVR systems, AI assistants, or automated announcements where clarity and consistency are essential.", tags: ["Female", "British (UK)", "IVR", "Informative/Educational"], provider: "async" },
  { id: "f26c8c45-049e-46c7-a6bd-b217d9255d3e", name: "Koharu", description: "Gentle, sweet Japanese female voice with a reflective and mindful tone. Calm, empathetic, and soothing, it conveys warmth and understanding with every word. Perfect for storytelling, audiobooks, or thoughtful narration, it creates a serene, engaging, and emotionally resonant listening experience.", tags: ["Female", "Storytelling", "Audiobook"], provider: "async" },
  { id: "ec82ea24-3249-4981-a28f-65a78d2a2cd0", name: "Robert", description: "An engaging, informative, and friendly voice, ideal for nature documentaries. This voice blends warmth with clarity, delivering facts in an accessible and captivating way. Perfect for guiding audiences through the wonders of the natural world with a balance of knowledge and storytelling.", tags: ["Male", "British (UK)", "Informative/Educational", "Conversational AI"], provider: "async" },
  { id: "ec4f77d4-60fa-4707-a094-ad18fdfbaa97", name: "Lila", description: "British female voice with a commercial and newscasting style, delivering content in a calm tone with light intonation and conversational pacing. Ideal for news reports, corporate videos, and product promotions, offering a professional yet approachable sound that engages the audience while maintaining a smooth, natural flow.", tags: ["Female", "British (UK)", "Newscasting", "Commercial/Advertisement"], provider: "async" },
  { id: "e8490197-0f00-4089-8b7f-e32f331a6edf", name: "Brooks", description: "Male voice that is deep and imposing, with a serious tone that instills intensity for storytelling. His strong, commanding presence enhances the narrative, creating a powerful atmosphere that draws listeners in and adds weight to the unfolding story.", tags: ["Male", "American (US)", "Storytelling"], provider: "async" },
  { id: "e7e88155-71c0-4e51-a3b4-8022468f7eca", name: "Dacian", description: "Calm, measured Romanian male voice with a steady, clear, and professional tone. Articulate, approachable, and reliable, he delivers information or educational content effectively. Warm, composed, and engaging, his voice ensures clarity and understanding while maintaining a trustworthy and focused presence.", tags: ["Male", "Informative/Educational"], provider: "async" },
  { id: "e590a00d-1925-4759-aea8-21e3beabafac", name: "Lennox", description: "Male voice with a calm tone, ideal for storytelling and audiobooks. His steady, soothing delivery creates a relaxing listening experience, allowing the story to unfold naturally and keeping the listener engaged with a tranquil, clear narration.", tags: ["Male", "American (US)", "Audiobook", "Storytelling"], provider: "async" },
  { id: "e4db0c1b-f72d-494c-baa8-43c44d5765b6", name: "Vanessa", description: "Female voice with a British accent, delivering a character-driven style with a slightly pretentious yet curious tone. Perfect for animated characters, audiobooks, or video games where a refined, inquisitive, and somewhat haughty personality adds charm and depth. Ideal for roles that require a mix of sophistication, wit, and playful intrigue.", tags: ["Female", "British (UK)", "Character"], provider: "async" },
  { id: "e486f733-9769-4f8a-a8e2-d39e4e3eab81", name: "Simon", description: "Balanced male voice with a professional tone, delivering information with clarity and confidence. Ideal for corporate narrations, e-learning, and business presentations where a polished and engaging delivery enhances credibility and listener engagement.", tags: ["Male", "American (US)", "Informative/Educational"], provider: "async" },
  { id: "e0f39dc4-f691-4e78-bba5-5c636692cc04", name: "Nyomi", description: "Female voice with an informative, clinical tone, which can be used for newscasting and informative content. This voice delivers facts with clarity and precision, maintaining a professional and authoritative presence. Suitable for news reports, documentaries, and educational material that require a composed and objective delivery.", tags: ["Female", "British (UK)", "Newscasting", "Informative/Educational", "Conversational AI"], provider: "async" },
  { id: "e098922a-9410-4d96-8e3c-402e26f7160b", name: "Jack", description: "Male voice featuring a strong Australian accent, exuding authority and professionalism. It's perfect for situations that require a confident, informative tone, such as corporate presentations, training modules, or educational content. Its clear, commanding delivery makes it ideal for high-impact commercials, product demos, or any content where trust and expertise are essential.", tags: ["Male", "Australian (AU)", "Informative/Educational"], provider: "async" },
  { id: "df05515b-b647-4b60-9387-b0642c51b235", name: "Penelope", description: "Neutral, even-toned voice with plain speech, delivering information in a straightforward and unobtrusive manner. Ideal for instructional content, automated responses, or professional settings where clarity and consistency are key without adding emotional emphasis.", tags: ["Female", "American (US)", "Informative/Educational"], provider: "async" },
  { id: "dd063dd5-c566-437e-b82a-a4f98eae1f38", name: "Hinano", description: "Soft, polite, and balanced Japanese female voice with clear articulation and natural warmth. Calm and professional, it suits both audiobooks and IVR systems, offering a reassuring, pleasant tone that feels approachable yet precise \u2014 ideal for guiding, narrating, or gently engaging the listener.", tags: ["Female", "IVR", "Audiobook"], provider: "async" },
  { id: "dbf08c3e-d33a-4afb-bdb3-0f024a687d19", name: "Brayden", description: "Rich, flamboyant male voice with a pretentious tone, spoken with an air of superiority, similar to Donald Trump's voice. The delivery is dramatic and exaggerated, with carefully placed emphasis that adds flair and arrogance.", tags: ["Male", "American (US)", "Character", "Impersonation"], provider: "async" },
  { id: "db21e50c-9c85-4177-9bb2-9bf177890e44", name: "Abel", description: "Male voice with an authoritative tone, calm delivery, and clear articulation, perfect for informative and educational content. His subtle emphasis on key points enhances understanding, creating a focused and engaging experience for the listener while maintaining a professional presence.", tags: ["Male", "American (US)", "Informative/Educational"], provider: "async" },
  { id: "d7114790-534e-4007-b80d-6d176230553c", name: "Nellie", description: "Bold British-accented female voice with a slightly sharp, newscasting style. This voice delivers with clarity and confidence, ideal for news, reports, and formal announcements, ensuring a strong, professional presence while maintaining a sharp and impactful delivery.", tags: ["Female", "British (UK)", "Newscasting", "Informative/Educational"], provider: "async" }
];
var SEEDAUDIO_DEFAULT_VOICE_ID = "en_male_tim_uranus_bigtts";
var SEEDAUDIO_VOICES = [
  { id: "zh_female_vv_uranus_bigtts", name: "Vivi", description: "A youthful and vibrant female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_xiaohe_uranus_bigtts", name: "Mindy", description: "A gentle, soft-spoken, and slightly mature female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "en_female_stokie_uranus_bigtts", name: "Stokie", description: "A trendy, casual, and expressive young female voice.", tags: ["Female", "English"], provider: "seedaudio" },
  { id: "en_female_dacey_uranus_bigtts", name: "Dacey", description: "A warm, empathetic, and highly engaging female voice.", tags: ["Female", "English"], provider: "seedaudio" },
  { id: "en_male_tim_uranus_bigtts", name: "Tim", description: "A clear, versatile, and friendly mid-range male voice.", tags: ["Male", "English"], provider: "seedaudio" },
  { id: "zh_male_m191_uranus_bigtts", name: "Kian", description: "A steady, clear, and versatile mid-range male voice.", tags: ["Male", "Multilingual"], provider: "seedaudio" },
  { id: "zh_male_taocheng_uranus_bigtts", name: "Cedric", description: "A dynamic, spirited, and energetic young male voice.", tags: ["Male", "Multilingual"], provider: "seedaudio" },
  { id: "zh_male_sophie_uranus_bigtts", name: "Sophie", description: "A smooth, modern, and soft-spoken young voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_yingyujiaoxue_uranus_bigtts", name: "Jean", description: "A clear, authoritative yet encouraging female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_male_dayi_uranus_bigtts", name: "Magnus", description: "A mature, resonant, and slightly dramatic male voice.", tags: ["Male", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_mizai_uranus_bigtts", name: "Mabel", description: "A youthful, playful voice with a kid vibe.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_jitangnv_uranus_bigtts", name: "Nadia", description: "A mature, soothing, and deeply emotional female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_meilinvyou_uranus_bigtts", name: "Opal", description: "A sweet, intimate, and affectionate young female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_liuchangnv_uranus_bigtts", name: "Pearl", description: "A clear, steady, and highly articulate female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_male_ruyayichen_uranus_bigtts", name: "Quentin", description: "A refined, gentle, and elegant young male voice.", tags: ["Male", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_cancan_uranus_bigtts", name: "Corinne", description: "A young, vivid and energetic female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_tianmeixiaoyuan_uranus_bigtts", name: "Esther", description: "A fresh, innocent, and youthful female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_tianmeitaozi_uranus_bigtts", name: "Freya", description: "A soft, bright, and incredibly sweet young female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_shuangkuaisisi_uranus_bigtts", name: "Gigi", description: "A crisp, fast-paced, and confident young female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_peiqi_uranus_bigtts", name: "Holly", description: "A childlike, innocent little girl's voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_xiaoxue_uranus_bigtts", name: "Lyla", description: "A pure, steady, and crystal-clear young female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_yuanqi_uranus_bigtts", name: "Daisy", description: "An energetic, cheerful, and optimistic young female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_kefunvsheng_uranus_bigtts", name: "Tracy", description: "A polished, professional, and courteous female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_male_shaonianzixin_uranus_bigtts", name: "Jess", description: "A bright, confident, and energetic teenage male voice.", tags: ["Male", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_linjianvhai_uranus_bigtts", name: "Pinky", description: "A warm, friendly, and approachable young female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_kiwi_uranus_bigtts", name: "Sweety", description: "A bright, cheerful, and modern young female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "zh_female_sajiaoxuemei_uranus_bigtts", name: "Sandy", description: "A very young, sweet, and playful female voice.", tags: ["Female", "Multilingual"], provider: "seedaudio" },
  { id: "de_male_seven_uranus_bigtts", name: "Sven", description: "A steady, clear, and confident male voice.", tags: ["Male", "German"], provider: "seedaudio" },
  { id: "jp_female_minimi_uranus_bigtts", name: "Minimi", description: "A high-pitched, sweet, 'kawaii' young female voice.", tags: ["Female", "Japanese"], provider: "seedaudio" },
  { id: "fr_male_usseau_uranus_bigtts", name: "Usseau", description: "A sophisticated, crisp, and articulate male voice.", tags: ["Male", "French"], provider: "seedaudio" },
  { id: "es_male_felipe_uranus_bigtts", name: "Felipe", description: "An energetic, upbeat, and charismatic young male voice.", tags: ["Male", "Spanish (MX)"], provider: "seedaudio" },
  { id: "id_male_han_uranus_bigtts", name: "Han", description: "A modern, smooth, and friendly young adult male voice.", tags: ["Male", "Indonesian"], provider: "seedaudio" },
  { id: "pt_male_martins_uranus_bigtts", name: "Martins", description: "A charismatic, warm, and expressive male voice.", tags: ["Male", "Portuguese (BR)"], provider: "seedaudio" },
  { id: "it_male_enzo_uranus_bigtts", name: "Enzo", description: "An authentic, charismatic, and warm Italian male voice.", tags: ["Male", "Italian"], provider: "seedaudio" },
  { id: "kr_male_shane_uranus_bigtts", name: "Jihoon", description: "A polished, modern, and smooth Korean male voice.", tags: ["Male", "Korean"], provider: "seedaudio" },
  { id: "zh_male_liufei_uranus_bigtts", name: "Felix", description: "A clear and energetic voice.", tags: ["Male", "Chinese"], provider: "seedaudio" },
  { id: "zh_female_qingxinnvsheng_uranus_bigtts", name: "Celeste", description: "A fresh and clear female voice.", tags: ["Female", "Chinese"], provider: "seedaudio" },
  { id: "zh_male_sunwukong_uranus_bigtts", name: "Monkey King", description: "A Monkey King character voice.", tags: ["Male", "Chinese", "Character"], provider: "seedaudio" },
  { id: "en_male_adam-imitation_uranus_bigtts", name: "Rowan", description: "An easygoing, natural young man with a cool, aloof edge.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_male_alberto_uranus_bigtts", name: "Alberto", description: "A gentle, approachable man with a low, soothing tone.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_male_alex_uranus_bigtts", name: "Alex", description: "An objective, composed young man with a warm, clear voice.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_female_allison_uranus_bigtts", name: "Allison", description: "An upbeat, enthusiastic college-aged woman, full of energy.", tags: ["Female", "English (US)", "Dubbing"], provider: "seedaudio" },
  { id: "en_female_authoritative-british_uranus_bigtts", name: "Charlotte", description: "A bright, crisp older sister with tension and drive.", tags: ["Female", "English (US)", "Education"], provider: "seedaudio" },
  { id: "en_female_authoritative-informative_uranus_bigtts", name: "Margaret", description: "A gentle, sincere big sister with a soft, unhurried tone.", tags: ["Female", "English (US)"], provider: "seedaudio" },
  { id: "en_male_bill-jones_uranus_bigtts", name: "Jones", description: "A humorous uncle with a thick Southern American accent.", tags: ["Male", "English (US)", "Entertainment"], provider: "seedaudio" },
  { id: "en_male_bill_jones_corey_uranus_bigtts", name: "Bill", description: "A steady, self-assured male professional with composure.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_male_brad_pitt_p1_uranus_bigtts", name: "Brad Pitt", description: "A laid-back man with a low, husky, relaxed voice.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_female_brittney_uranus_bigtts", name: "Brittney", description: "A warm, intelligent older sister with a tender heart.", tags: ["Female", "English (US)"], provider: "seedaudio" },
  { id: "en_female_brittney_pimintel_uranus_bigtts", name: "Zoe", description: "A bright, spirited young girl bursting with energy.", tags: ["Female", "English (US)", "Audiobook"], provider: "seedaudio" },
  { id: "en_male_bruce_uranus_bigtts", name: "Adrian", description: "A composed, level-headed gentleman with rational restraint.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_male_chandler_p1_uranus_bigtts", name: "Leo", description: "A theatrical man with dramatic intonation and expressiveness.", tags: ["Male", "English (US)", "Entertainment"], provider: "seedaudio" },
  { id: "en_male_cowboy-bob_uranus_bigtts", name: "Bob", description: "A mature man with a deep, resonant, slightly raspy voice.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_male_cowboy_john_b_uranus_bigtts", name: "John", description: "An energetic, flamboyant uncle with a Southern accent.", tags: ["Male", "English (US)", "Entertainment"], provider: "seedaudio" },
  { id: "en_male_david_uranus_bigtts", name: "David", description: "A middle-aged man with a deep, weighty, unhurried voice.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_male_deep-voice_uranus_bigtts", name: "Orion", description: "A solid, textured voice with a slow pace and drama.", tags: ["Male", "English (US)", "Entertainment"], provider: "seedaudio" },
  { id: "en_male_diyuwenrounan_uranus_bigtts", name: "Julian", description: "A refined, gentle, sincere man with an easygoing manner.", tags: ["Male", "English (US)", "Audiobook"], provider: "seedaudio" },
  { id: "en_male_evil-guy-oxley_uranus_bigtts", name: "Harrison", description: "A rigorous, professional heavyweight with commanding presence.", tags: ["Male", "English (US)", "Dubbing"], provider: "seedaudio" },
  { id: "en_male_excited-male-voice_uranus_bigtts", name: "Jasper", description: "A passionate young male voice with sweeping intonation.", tags: ["Male", "English (US)", "Entertainment"], provider: "seedaudio" },
  { id: "en_male_father-christmas_uranus_bigtts", name: "Alfred", description: "An elder with a deep, resonant voice and clear articulation.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_female_female_tutor_ms-jenny_uranus_bigtts", name: "Holly", description: "An enthusiastic, energetic female host with a vivid style.", tags: ["Female", "English (US)", "Education"], provider: "seedaudio" },
  { id: "en_male_fernando-martinez_uranus_bigtts", name: "Felix", description: "A cheerful, lively male voice, contagious in emotion.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_male_godfather_uranus_bigtts", name: "Godfather", description: "A mature man with sincere emotion and a gentle, unhurried tone.", tags: ["Male", "English (US)", "Audiobook"], provider: "seedaudio" },
  { id: "en_male_gollum_uranus_bigtts", name: "Gollum", description: "A wacky, over-the-top voice skilled at playful characters.", tags: ["Male", "English (US)", "RolePlay"], provider: "seedaudio" },
  { id: "en_male_hades_uranus_bigtts", name: "Beau", description: "A free-spirited mature man with a relaxed, easygoing tone.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_female_hayley_uranus_bigtts", name: "Hayley", description: "A lively female voice with strong emotional tension.", tags: ["Female", "English (US)", "Education"], provider: "seedaudio" },
  { id: "en_male_jamie_uranus_bigtts", name: "Jamie", description: "A hearty, sincere, witty male voice full of energy.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_female_jane_uranus_bigtts", name: "Jane", description: "An energetic young girl with vivid, expressive emotion.", tags: ["Female", "English (US)", "Dubbing"], provider: "seedaudio" },
  { id: "en_female_jenny_uranus_bigtts", name: "Jenny", description: "A cheerful, warm, and talkative personality.", tags: ["Female", "English (US)"], provider: "seedaudio" },
  { id: "en_male_jidongchuanjiaoshi_uranus_bigtts", name: "Blaze", description: "An immersive, passionate performance with fervent intonation.", tags: ["Male", "English (US)", "Entertainment"], provider: "seedaudio" },
  { id: "en_male_jimmy_uranus_bigtts", name: "Jimmy", description: "A sunny young man, vivid and engaging at sharing stories.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_female_joanne_uranus_bigtts", name: "Joanne", description: "A crisp, lively young female voice with a relaxed feel.", tags: ["Female", "English (US)"], provider: "seedaudio" },
  { id: "en_male_joker_uranus_bigtts", name: "Joker", description: "A middle-aged voice with a slow pace and warm, magnetic tone.", tags: ["Male", "English (US)", "Entertainment"], provider: "seedaudio" },
  { id: "en_male_josh_uranus_bigtts", name: "Josh", description: "A clear, bright, cheerful, energetic young man.", tags: ["Male", "English (US)", "Dubbing"], provider: "seedaudio" },
  { id: "en_male_josh_coery_uranus_bigtts", name: "Josiah", description: "A businesslike young man with a deep, dignified voice.", tags: ["Male", "English (US)", "Education"], provider: "seedaudio" },
  { id: "en_male_kevin_uranus_bigtts", name: "Kevin", description: "A warm, magnetic middle-aged voice with fluent delivery.", tags: ["Male", "English (US)", "Education"], provider: "seedaudio" },
  { id: "en_male_knightley_uranus_bigtts", name: "Knightley", description: "A deep, magnetic middle-aged male voice with a steady manner.", tags: ["Male", "English (US)", "Audiobook"], provider: "seedaudio" },
  { id: "en_female_lana_del_rey_kelley_d_p1_uranus_bigtts", name: "Lynn", description: "A soft, slightly husky young female voice.", tags: ["Female", "English (US)", "RolePlay"], provider: "seedaudio" },
  { id: "en_female_lana_del_rey_parky_s_p1_uranus_bigtts", name: "Ivy", description: "A gentle, soft female voice with a warm, natural tone.", tags: ["Female", "English (US)", "CustomerService"], provider: "seedaudio" },
  { id: "en_male_marcus_uranus_bigtts", name: "Marcus", description: "A mellow, deep mature male voice skilled at storytelling.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_female_mel_uranus_bigtts", name: "Mel", description: "A lively, dynamic female voice with vivid ups and downs.", tags: ["Female", "English (US)", "Education"], provider: "seedaudio" },
  { id: "en_male_michael_uranus_bigtts", name: "Hank", description: "A laid-back man with a deep, magnetic, easygoing voice.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_male_michael-mouse_uranus_bigtts", name: "Chip", description: "A cartoonish, high-pitched, exaggerated comical voice.", tags: ["Male", "English (US)", "Entertainment"], provider: "seedaudio" },
  { id: "en_male_michael_kevin_uranus_bigtts", name: "Michael Kevin", description: "A professional narrator\u2014gentle, bright, and persuasive.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_male_motivational-coach_uranus_bigtts", name: "Rory", description: "An energetic college-aged man, full of emotion and dynamic.", tags: ["Male", "English (US)", "Entertainment"], provider: "seedaudio" },
  { id: "en_female_myra_uranus_bigtts", name: "Myra", description: "A sweet, lively young-girl voice that tells stories gently.", tags: ["Female", "English (US)", "Education"], provider: "seedaudio" },
  { id: "en_female_myra_cmb_uranus_bigtts", name: "Sunny", description: "A crisp, lively young female voice full of enthusiasm.", tags: ["Female", "English (US)", "Education"], provider: "seedaudio" },
  { id: "en_female_nadia_uranus_bigtts", name: "Blair", description: "A clean, clear young female voice with a gentle way of speaking.", tags: ["Female", "English (US)"], provider: "seedaudio" },
  { id: "en_female_natasha_uranus_bigtts", name: "Natasha", description: "A bright, vivid, warm and approachable conversational voice.", tags: ["Female", "English (US)"], provider: "seedaudio" },
  { id: "en_female_pleasant-female_uranus_bigtts", name: "Elaine", description: "A gentle, lovely young lady with heartfelt warmth.", tags: ["Female", "English (US)", "Audiobook"], provider: "seedaudio" },
  { id: "en_female_rachel_p1_uranus_bigtts", name: "Rachel", description: "A bright, clear young female voice with strong dramatic flair.", tags: ["Female", "English (US)", "Entertainment"], provider: "seedaudio" },
  { id: "en_male_ronald_uranus_bigtts", name: "Ronald", description: "A British gentleman with a deep, resonant, dignified voice.", tags: ["Male", "English (US)", "Audiobook"], provider: "seedaudio" },
  { id: "en_male_russell_uranus_bigtts", name: "Russell", description: "A warm, bright, sincere American boyfriend voice.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_female_scarlet_p1_uranus_bigtts", name: "Scarlet", description: "A gentle, deeply affectionate older sister.", tags: ["Female", "English (US)", "CustomerService"], provider: "seedaudio" },
  { id: "en_female_sharron_uranus_bigtts", name: "Sharron", description: "A young lady with a soft, slightly husky, easygoing voice.", tags: ["Female", "English (US)", "Entertainment"], provider: "seedaudio" },
  { id: "en_male_simba_p1_uranus_bigtts", name: "Simba", description: "A bright yet husky young male voice with strong expressiveness.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_female_skye_uranus_bigtts", name: "Skye", description: "A clear, candid older sister who speaks from the heart.", tags: ["Female", "English (US)"], provider: "seedaudio" },
  { id: "en_male_tom_hiddleston_p1_uranus_bigtts", name: "Tom", description: "A deep, reserved uncle with a narrative reciting style.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_male_valentino_uranus_bigtts", name: "Valentino", description: "A sunny, cheerful young man full of warmth and energy.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_male_valentino_corey_uranus_bigtts", name: "Clark", description: "A mature, dignified uncle with a steady narration style.", tags: ["Male", "English (US)", "Dubbing"], provider: "seedaudio" },
  { id: "en_female_wenrouzhishijieshuonv_uranus_bigtts", name: "Megan", description: "A gentle, fun older sister sharing knowledge in a relaxed way.", tags: ["Female", "English (US)", "CustomerService"], provider: "seedaudio" },
  { id: "en_female_xinwenjieshuonv_uranus_bigtts", name: "Kayla", description: "An enthusiastic, outgoing female student full of expressiveness.", tags: ["Female", "English (US)", "RolePlay"], provider: "seedaudio" },
  { id: "en_male_yangguangjieshuonan_uranus_bigtts", name: "Dylan", description: "A witty, humorous uncle with a vivid narrative style.", tags: ["Male", "English (US)"], provider: "seedaudio" },
  { id: "en_female_zendaya_p1_uranus_bigtts", name: "Zendaya", description: "An easygoing, approachable older sister full of energy.", tags: ["Female", "English (US)", "Education"], provider: "seedaudio" },
  { id: "ja_female_bv024_uranus_bigtts", name: "Bonnie", description: "A gentle, soft, warm female college student.", tags: ["Female", "Japanese"], provider: "seedaudio" },
  { id: "ja_female_bv520_uranus_bigtts", name: "Poppy", description: "An energetic young woman with an anime-dubbing style.", tags: ["Female", "Japanese", "Dubbing"], provider: "seedaudio" },
  { id: "ja_female_bv521_uranus_bigtts", name: "Aoi", description: "A sweet, lively young woman with strong performance appeal.", tags: ["Female", "Japanese", "Entertainment"], provider: "seedaudio" },
  { id: "ja_female_bv522_uranus_bigtts", name: "Hana", description: "A professional, dignified young woman with a broadcast tone.", tags: ["Female", "Japanese"], provider: "seedaudio" },
  { id: "ja_female_bv523_uranus_bigtts", name: "Lily", description: "An innocent, carefree little girl full of childlike charm.", tags: ["Female", "Japanese", "Entertainment"], provider: "seedaudio" },
  { id: "ja_male_bv524_uranus_bigtts", name: "Ken", description: "A capable, professional young man with a calm, restrained tone.", tags: ["Male", "Japanese"], provider: "seedaudio" },
  { id: "ja_female_minimi_uranus_bigtts", name: "Minimi", description: "A vibrant, hearty young woman with an outgoing personality.", tags: ["Female", "Japanese"], provider: "seedaudio" },
  { id: "ja_female_shirou_uranus_bigtts", name: "Shirou", description: "A spirited, straightforward young woman with anime style.", tags: ["Female", "Japanese", "Dubbing"], provider: "seedaudio" },
  { id: "de_female_bv081_uranus_bigtts", name: "Stella", description: "An objective, composed, and professional young female voice.", tags: ["Female", "German", "Education"], provider: "seedaudio" },
  { id: "de_male_sven_uranus_bigtts", name: "Sven", description: "A middle-aged man with a deep, magnetic, slightly raspy voice.", tags: ["Male", "German"], provider: "seedaudio" },
  { id: "es_female_bv084_uranus_bigtts", name: "Gracie", description: "A rational, capable woman with clear, organized narration.", tags: ["Female", "Spanish"], provider: "seedaudio" },
  { id: "es_male_dani_uranus_bigtts", name: "Dani", description: "An enthusiastic, talkative uncle with a charming style.", tags: ["Male", "Spanish", "Audiobook"], provider: "seedaudio" },
  { id: "es_male_guillem_uranus_bigtts", name: "Guillem", description: "An easygoing, cheerful, approachable young man.", tags: ["Male", "Spanish", "Audiobook"], provider: "seedaudio" },
  { id: "es_female_ht_mx_f6_uranus_bigtts", name: "Marisol", description: "A lively, enthusiastic girl-next-door full of energy.", tags: ["Female", "Spanish"], provider: "seedaudio" },
  { id: "mx_female_bv065_uranus_bigtts", name: "Irene", description: "A calm, objective, efficient, well-organized young woman.", tags: ["Female", "Spanish (MX)", "Education"], provider: "seedaudio" },
  { id: "mx_male_bv165dialogue_uranus_bigtts", name: "Diego", description: "A charming young man with a magnetic, vivid dialogue style.", tags: ["Male", "Spanish (MX)", "Audiobook"], provider: "seedaudio" },
  { id: "mx_male_bv165narrator_uranus_bigtts", name: "Marcos", description: "A steady, mature man with a deep, magnetic, professional tone.", tags: ["Male", "Spanish (MX)", "Audiobook"], provider: "seedaudio" },
  { id: "mx_female_bv166dialogue_uranus_bigtts", name: "Lucy", description: "A playful, cheerful, lovely young woman with vivid emotion.", tags: ["Female", "Spanish (MX)"], provider: "seedaudio" },
  { id: "mx_female_bv166emotion_uranus_bigtts", name: "Rosa", description: "A young woman with intense emotion and dramatic tension.", tags: ["Female", "Spanish (MX)"], provider: "seedaudio" },
  { id: "mx_female_bv166narrator_uranus_bigtts", name: "Freya", description: "A distinctive young woman skilled at vivid storytelling.", tags: ["Female", "Spanish (MX)", "Audiobook"], provider: "seedaudio" },
  { id: "mx_male_felipe_uranus_bigtts", name: "Felipe", description: "An enthusiastic, sharp-witted young man building suspense.", tags: ["Male", "Spanish (MX)"], provider: "seedaudio" },
  { id: "mx_male_ht_mx_m012_uranus_bigtts", name: "Derek", description: "An objective, restrained young man with a professional style.", tags: ["Male", "Spanish (MX)", "Education"], provider: "seedaudio" },
  { id: "mx_female_leslie_uranus_bigtts", name: "Leslie", description: "An approachable, gentle young woman with a soft pace.", tags: ["Female", "Spanish (MX)"], provider: "seedaudio" },
  { id: "mx_male_marcelo_uranus_bigtts", name: "Marcelo", description: "A gentle, refined, steady, dignified young man.", tags: ["Male", "Spanish (MX)"], provider: "seedaudio" },
  { id: "fr_female_fr_bv078_uranus_bigtts", name: "Simone", description: "A steady, professional, even-tempered auntie.", tags: ["Female", "French", "Dubbing"], provider: "seedaudio" },
  { id: "fr_female_fr_f47_uranus_bigtts", name: "Camille", description: "A professional, capable older sister with a calm style.", tags: ["Female", "French", "CustomerService"], provider: "seedaudio" },
  { id: "fr_male_fr_m29_uranus_bigtts", name: "Maurice", description: "A mature, steady uncle with a resonant, dignified voice.", tags: ["Male", "French", "Dubbing"], provider: "seedaudio" },
  { id: "id_male_bv160_uranus_bigtts", name: "Rocco", description: "An impassioned young man with intensely dramatic delivery.", tags: ["Male", "Indonesian"], provider: "seedaudio" },
  { id: "id_male_bv160dialogue_uranus_bigtts", name: "Jude", description: "A young man with a dramatic, emotional performance style.", tags: ["Male", "Indonesian"], provider: "seedaudio" },
  { id: "id_male_bv160narration_uranus_bigtts", name: "Hugo", description: "A rational, steady young man skilled at narrative storytelling.", tags: ["Male", "Indonesian", "Audiobook"], provider: "seedaudio" },
  { id: "id_female_bv161_uranus_bigtts", name: "Clara", description: "A gentle, even-tempered young woman with a bright, soft voice.", tags: ["Female", "Indonesian"], provider: "seedaudio" },
  { id: "id_female_bv161dialogue_uranus_bigtts", name: "Sylvia", description: "A young woman with shifting emotions and film-dialogue atmosphere.", tags: ["Female", "Indonesian"], provider: "seedaudio" },
  { id: "id_female_bv161narration_uranus_bigtts", name: "Celeste", description: "A sweet, lively female lead with emotionally rich narration.", tags: ["Female", "Indonesian"], provider: "seedaudio" },
  { id: "id_female_bv164_uranus_bigtts", name: "Crew", description: "A blend of diverse voices for vivid multi-person dialogue.", tags: ["Female", "Indonesian"], provider: "seedaudio" },
  { id: "id_male_bv164dialogue_uranus_bigtts", name: "Elian", description: "A gentle, refined young man with a dramatic performance style.", tags: ["Male", "Indonesian", "Dubbing"], provider: "seedaudio" },
  { id: "id_male_bv164narration_uranus_bigtts", name: "Ronan", description: "A professional, steady, calm mature uncle.", tags: ["Male", "Indonesian", "Audiobook"], provider: "seedaudio" },
  { id: "id_female_f20_uranus_bigtts", name: "Chloe", description: "An energetic, lively young woman with an elegant air.", tags: ["Female", "Indonesian", "Dubbing"], provider: "seedaudio" },
  { id: "id_male_m08_uranus_bigtts", name: "Kyle", description: "A rational, steady young man with a professional narration style.", tags: ["Male", "Indonesian"], provider: "seedaudio" },
  { id: "id_female_phulia_uranus_bigtts", name: "Phulia", description: "A lively, cheerful young woman full of emotion and tension.", tags: ["Female", "Indonesian"], provider: "seedaudio" },
  { id: "pt_male_bv172_uranus_bigtts", name: "Sam", description: "A two-person dialogue with contrasting fast and slow pacing.", tags: ["Male", "Portuguese (BR)"], provider: "seedaudio" },
  { id: "pt_male_bv172dialogue_uranus_bigtts", name: "Walter", description: "A resonant, husky middle-aged uncle with a film-dialogue feel.", tags: ["Male", "Portuguese (BR)", "Dubbing"], provider: "seedaudio" },
  { id: "pt_male_bv172emotion_uranus_bigtts", name: "Vincent", description: "A middle-aged voice with intense emotion and dramatic flair.", tags: ["Male", "Portuguese (BR)", "Education"], provider: "seedaudio" },
  { id: "pt_male_bv172narrator_uranus_bigtts", name: "Miles", description: "A rational, calm, rigorous, professional male narrator.", tags: ["Male", "Portuguese (BR)", "Audiobook"], provider: "seedaudio" },
  { id: "pt_female_bv173_uranus_bigtts", name: "Diana", description: "A professional, composed, sharp, capable female narrator.", tags: ["Female", "Portuguese (BR)"], provider: "seedaudio" },
  { id: "pt_female_bv173dialogue_uranus_bigtts", name: "Elena", description: "An elegant, mature idol-drama female lead.", tags: ["Female", "Portuguese (BR)"], provider: "seedaudio" },
  { id: "pt_female_bv173emotion_uranus_bigtts", name: "Lola", description: "An enthusiastic performer full of emotion and expressive tension.", tags: ["Female", "Portuguese (BR)"], provider: "seedaudio" },
  { id: "pt_female_bv173narrator_uranus_bigtts", name: "Emma", description: "A sharp, capable, calm, commanding female narrator.", tags: ["Female", "Portuguese (BR)", "Dubbing"], provider: "seedaudio" },
  { id: "pt_female_bv530_uranus_bigtts", name: "Sofia", description: "A gentle, soft, approachable, lively young woman.", tags: ["Female", "Portuguese (BR)"], provider: "seedaudio" },
  { id: "pt_male_bv531_uranus_bigtts", name: "Arthur", description: "A rational, objective, steady, dependable middle-aged voice.", tags: ["Male", "Portuguese (BR)"], provider: "seedaudio" },
  { id: "pt_female_mari_uranus_bigtts", name: "Mari", description: "A cheerful young woman with a hearty, gracious manner.", tags: ["Female", "Portuguese (BR)", "Education"], provider: "seedaudio" },
  { id: "pt_male_rael_uranus_bigtts", name: "Rael", description: "A fresh, crisp, energetic, sunny young man.", tags: ["Male", "Portuguese (BR)"], provider: "seedaudio" },
  { id: "ar_female_dina_uranus_bigtts", name: "Dina", description: "A warm, lively Egyptian woman versed in local culture.", tags: ["Female", "Arabic"], provider: "seedaudio" },
  { id: "ar_female_fatma_uranus_bigtts", name: "Fatma", description: "A young woman with a gentle, tender voice for soft monologues.", tags: ["Female", "Arabic", "Entertainment"], provider: "seedaudio" },
  { id: "ar_male_youssef_uranus_bigtts", name: "Youssef", description: "A calm, easygoing middle-aged man with a conversational manner.", tags: ["Male", "Arabic"], provider: "seedaudio" },
  { id: "tl_female_annika_uranus_bigtts", name: "Annika", description: "An approachable young woman with an everyday-conversation quality.", tags: ["Female", "Filipino"], provider: "seedaudio" },
  { id: "tl_male_ed_uranus_bigtts", name: "Ed", description: "An approachable, easygoing middle-aged male voice.", tags: ["Male", "Filipino"], provider: "seedaudio" },
  { id: "tl_female_hervie_uranus_bigtts", name: "Hervie", description: "A professional, confident, engaging entertainment-news anchor.", tags: ["Female", "Filipino", "Audiobook"], provider: "seedaudio" },
  { id: "ko_male_bv545_uranus_bigtts", name: "Jay", description: "A hearty young man with a true-to-life performance style.", tags: ["Male", "Korean"], provider: "seedaudio" },
  { id: "ko_female_bv546_uranus_bigtts", name: "Momo", description: "A candid, lively young woman with an anime-drama style.", tags: ["Female", "Korean", "Dubbing"], provider: "seedaudio" },
  { id: "ko_male_m03_uranus_bigtts", name: "Minho", description: "A standard, professional Korean narrator with a magnetic voice.", tags: ["Male", "Korean"], provider: "seedaudio" },
  { id: "ko_male_shane_uranus_bigtts", name: "Shane", description: "A steady, refined, persuasive middle-aged uncle.", tags: ["Male", "Korean"], provider: "seedaudio" },
  { id: "ms_male_ham_uranus_bigtts", name: "Ham", description: "A steady, easygoing uncle skilled at analysis and explanation.", tags: ["Male", "Malay"], provider: "seedaudio" },
  { id: "ms_male_naim_uranus_bigtts", name: "Naim", description: "A gentle, refined, calm, dependable middle-aged uncle.", tags: ["Male", "Malay"], provider: "seedaudio" },
  { id: "ru_female_af07_uranus_bigtts", name: "Amelia", description: "A gentle, approachable, understanding, graceful young woman.", tags: ["Female", "Russian", "Audiobook"], provider: "seedaudio" },
  { id: "ru_female_irinae_uranus_bigtts", name: "Irinae", description: "An enthusiastic young woman with rich, expressive emotion.", tags: ["Female", "Russian", "Audiobook"], provider: "seedaudio" },
  { id: "ru_male_pavel_uranus_bigtts", name: "Pavel", description: "A middle-aged voice with a natural, comfortable narrative tone.", tags: ["Male", "Russian"], provider: "seedaudio" },
  { id: "ru_female_sophie_uranus_bigtts", name: "Ksenia", description: "A young female voice full of energy and warmth.", tags: ["Female", "Russian"], provider: "seedaudio" },
  { id: "ru_male_vlad_uranus_bigtts", name: "Silas", description: "A soft-spoken, gentle, calm, even-tempered young man.", tags: ["Male", "Russian", "Entertainment"], provider: "seedaudio" },
  { id: "th_female_bv568_angry_uranus_bigtts", name: "Valeria", description: "A domineering female lead with highly expressive emotion.", tags: ["Female", "Thai", "Education"], provider: "seedaudio" },
  { id: "th_female_bv568_fear_uranus_bigtts", name: "Iris", description: "An anxious, fearful, emotionally fragile young woman.", tags: ["Female", "Thai", "Audiobook"], provider: "seedaudio" },
  { id: "th_female_bv568_happy_uranus_bigtts", name: "Zara", description: "A young woman full of emotion with dramatic/animation dubbing.", tags: ["Female", "Thai"], provider: "seedaudio" },
  { id: "th_female_bv568_hate_uranus_bigtts", name: "Valentina", description: "A female lead with strong dramatic tension and expressive emotion.", tags: ["Female", "Thai"], provider: "seedaudio" },
  { id: "th_female_bv568_neutral_uranus_bigtts", name: "Mildred", description: "A calm, even-tempered young woman with balanced, neutral emotion.", tags: ["Female", "Thai"], provider: "seedaudio" },
  { id: "th_female_bv568_sad_uranus_bigtts", name: "Lydia", description: "A gentle, melancholic young woman with a strong narrative sense.", tags: ["Female", "Thai", "Dubbing"], provider: "seedaudio" },
  { id: "th_female_bv568_suprise_uranus_bigtts", name: "Phoebe", description: "A lively, vivid-minded young woman with a playful air.", tags: ["Female", "Thai", "Audiobook"], provider: "seedaudio" },
  { id: "vi_female_hong_uranus_bigtts", name: "Hong", description: "A straightforward young woman with frank emotional expression.", tags: ["Female", "Vietnamese"], provider: "seedaudio" },
  { id: "vi_female_ling_uranus_bigtts", name: "Ling", description: "A tender, kind, earnest, dependable young woman.", tags: ["Female", "Vietnamese"], provider: "seedaudio" },
  { id: "vi_female_linh_uranus_bigtts", name: "Linh", description: "A straightforward, candid young woman, crisp and decisive.", tags: ["Female", "Vietnamese", "Dubbing"], provider: "seedaudio" },
  { id: "vi_female_partner_uranus_bigtts", name: "Partner", description: "A young woman with intense, full emotion and youthful vitality.", tags: ["Female", "Vietnamese", "Dubbing"], provider: "seedaudio" },
  { id: "vi_female_ruan_uranus_bigtts", name: "Ruan", description: "A steady, clear-minded, dignified, poised young woman.", tags: ["Female", "Vietnamese"], provider: "seedaudio" },
  { id: "vi_female_wu_uranus_bigtts", name: "Wu", description: "A straightforward, outgoing young woman with a rational mindset.", tags: ["Female", "Vietnamese"], provider: "seedaudio" },
  { id: "vi_male_wumg_uranus_bigtts", name: "Wumg", description: "A modest, patient, rigorous, meticulous young man.", tags: ["Male", "Vietnamese"], provider: "seedaudio" }
];

// src/vendors/catalog/seedaudio.ts
var REF_MUTEX_REASON = "A named voice and audio/image references cannot be combined.";
var { MODELS: MODELS15 } = defineModels("seedaudio", [
  {
    id: "seed-audio-1.0",
    name: "Seed Audio",
    addedAt: "2026-07-27",
    workflow: "bytedance/text-to-speech",
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    description: "Synthesize natural speech from text \u2014 pick a named voice or clone one from a reference audio.",
    features: [feat("Voice Cloning", "characteristic"), feat("Reference Audio", "audio")],
    paramConfig: {
      ...params.prompt({ maxLength: 3e3 }),
      // Voice: a named BytePlus voice (default), OR clone from up to 3 reference
      // audios, OR one image reference. The three are mutually exclusive; the
      // payload builder prioritizes an uploaded reference over the named voice.
      ...params.voiceId(SEEDAUDIO_VOICES, SEEDAUDIO_DEFAULT_VOICE_ID),
      ...params.audioInputs(3, "Reference Audios"),
      ...params.imageInput(1, "Reference Image", false),
      // Output audio configuration (nested under `audio_config` at the wire).
      ...p.enum("format", ["wav", "mp3", "pcm", "ogg_opus"], "wav", { label: "Format" }),
      ...p.enum("sampleRate", [8e3, 16e3, 24e3, 32e3, 44100, 48e3], 44100, { label: "Sample Rate" }),
      ...p.range("speechRate", -50, 100, 0, { label: "Speech Rate" }),
      ...p.range("loudnessRate", -50, 100, 0, { label: "Loudness" }),
      ...p.range("pitchRate", -12, 12, 0, { label: "Pitch" }),
      ...p.boolean("aigcWatermark", false, "Watermark")
    },
    // Backend rejects mixing reference kinds. Trigger the mutex off the uploads
    // (voiceId always has a default, so it can't be a trigger) — an uploaded
    // reference greys out the voice picker and the other upload slot.
    constraints: [
      { when: { imageUrls: { exists: true } }, then: {
        voiceId: { disabled: true, reason: REF_MUTEX_REASON },
        audioUrls: { disabled: true, reason: REF_MUTEX_REASON }
      } },
      { when: { audioUrls: { exists: true } }, then: {
        voiceId: { disabled: true, reason: REF_MUTEX_REASON },
        imageUrls: { disabled: true, reason: REF_MUTEX_REASON }
      } }
    ]
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
var buildSeedAudioPayload = (input) => {
  const references = assembleReferences(input);
  return {
    model: "seed-audio-1.0",
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
  "seed-audio-1.0": buildSeedAudioPayload
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
      ...params.prompt(),
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
    inputType: "i2v",
    badge: ["new"],
    description: "Next-gen Grok video \u2014 faster, higher fidelity, up to 15s with audio.",
    features: [feat("Image Input", "input"), feat("Audio", "audio"), feat("1080p", "resolution"), feat("15 sec", "duration")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(GROK_VIDEO_AR),
      ...params.resolution(GROK_VIDEO_RESOLUTIONS_15, "720p"),
      ...params.duration(GROK_DURATIONS, 8),
      ...params.imageInput(1, "Input Image", true)
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
      ...params.prompt(),
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
      ...params.prompt(),
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
      ...params.voiceId(GROK_VOICES, DEFAULT_GROK_VOICE_ID)
    }
  }
]);

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
var RUNWAY_VOICE_PRESETS = [
  "Victoria",
  "Vincent",
  "Clara",
  "Drew",
  "Skye",
  "Max",
  "Morgan",
  "Felix",
  "Mia",
  "Marcus",
  "Summer",
  "Ruby",
  "Aurora",
  "Jasper",
  "Leo",
  "Adrian",
  "Nina",
  "Emma",
  "Blake",
  "David",
  "Maya",
  "Nathan",
  "Sam",
  "Georgia",
  "Petra",
  "Adam",
  "Zach",
  "Violet",
  "Roman",
  "Luna"
].map((name) => ({ id: name.toLowerCase(), name, description: "", tags: [], provider: "runway" }));
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
      ...params.voiceId(RUNWAY_VOICE_PRESETS, "victoria"),
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

// src/core/helpers.ts
var resolveImageSize = (ctx, arMap) => ctx.aspectRatio && arMap[ctx.aspectRatio] || ctx.size;

// src/vendors/catalog/flux.ts
var FLUX_AR_TO_SIZE = {
  "1:1": "1024x1024",
  "5:3": "1280x768",
  "3:5": "768x1280",
  "4:3": "1024x768",
  "3:4": "768x1024"
};
var fluxAspectRatios = Object.keys(FLUX_AR_TO_SIZE);
var buildFluxV2Payload = (modelId) => (ctx) => {
  const size = resolveImageSize(ctx, FLUX_AR_TO_SIZE);
  return {
    prompt: ctx.prompt,
    model: modelId,
    imageUrls: ctx.imageUrls ?? [],
    ...size ? {
      width: parseInt(size.split("x")[0]),
      height: parseInt(size.split("x")[1])
    } : {},
    ...ctx.guidance != null ? { guidance: ctx.guidance } : {},
    ...ctx.seed != null ? { seed: ctx.seed } : {}
  };
};
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
    imageUrls: ctx.imageUrls ?? [],
    ...aspectRatio ? { aspectRatio } : {}
  };
};
var fluxV2Base = {
  workflow: "flux-v2",
  mode: "image",
  inputType: "t2i"
};
var fluxKontextBase = {
  workflow: "flux-kontext",
  mode: "image",
  inputType: "t2i"
};
var { MODELS: MODELS21 } = defineModels("flux", [
  {
    ...fluxV2Base,
    id: "flux-2-pro",
    name: "Flux 2 Pro",
    modelId: "flux-2-pro",
    addedAt: "2026-02-06",
    buildPayload: buildFluxV2Payload("flux-2-pro"),
    estimatedTime: 19,
    description: "Sharp 2K images with fine-tuned color accuracy and detail.",
    features: [feat("Multi-Image Input", "input"), feat("2K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(fluxAspectRatios, "4:3"),
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
    features: [feat("Image Input", "input"), feat("2K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(fluxAspectRatios, "1:1"),
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
    description: "Adaptable generation across varied visual styles at 2K.",
    features: [feat("Image Input", "input"), feat("2K", "resolution")],
    paramConfig: {
      ...params.prompt(),
      ...params.aspectRatio(fluxAspectRatios, "3:4"),
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
    // Single workflow `flux/v1/video` handles t2v plus every conditioning
    // mode (i2v via start frame, morph via start/end frame, reference images,
    // reference video, video continuation) through optional inputs — no
    // editWorkflow needed. Payload assembly lives in flux.payloads.ts.
    id: "flux-3-video",
    name: "Flux 3 Video",
    workflow: "flux/v1/video",
    mode: "video",
    inputType: "t2v",
    release: "preview",
    addedAt: "2026-07-27",
    estimatedTime: 120,
    description: "Text-to-video with synchronized audio, plus image and video conditioning (continuation, references, first/last frame).",
    features: [
      feat("Image & Video Input", "input"),
      feat("Start/End Frame", "frame"),
      feat("Audio", "audio"),
      feat("Up to 20s", "duration"),
      feat("720p", "resolution")
    ],
    paramConfig: {
      ...params.prompt(),
      // Checkpoint: `high` (default, full conditioning + draft) vs `optimized`
      // (faster, text-to-video only). Sent as the wire `model` field.
      ...p.enum("model", [
        { id: "flux-3-preview-high", label: "High" },
        { id: "flux-3-preview-optimized", label: "Optimized" }
      ], "flux-3-preview-high", { label: "Model" }),
      ...params.aspectRatio(["auto", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16", "9:21"], "auto"),
      ...params.resolution(["480p", "720p"], "720p"),
      // 'auto' lets the model fit length; an explicit whole number is required
      // for a two-image (start+end) morph.
      ...p.enum("duration", ["auto", "5", "10", "15", "20"], "auto", { label: "Duration" }),
      // startFrame → keyframe @0 (i2v); endFrame → keyframe @duration×24 (morph).
      ...params.startFrame("Start Frame"),
      ...params.endFrame("End Frame"),
      // referenceImages (ir2v): who/what appears, never shown on screen.
      ...params.imageInput(10, "Reference Images", false, "reference"),
      // startVideo (f2v): continue from a clip's final frames.
      ...params.videoInput("Start Video", "asset", false, 15),
      // referenceVideo (vr2v): carry subjects into a brand-new clip.
      ...params.videoInputs(1, "Reference Video", false),
      ...params.generateAudio(true),
      ...p.boolean("grounding", true, "Grounding"),
      ...p.range("seed", 0, 4294967295, 0, { label: "Seed" }),
      ...p.text("version", { label: "Version", placeholder: "latest" })
    }
  }
]);

// src/vendors/catalog/flux.payloads.ts
var buildFlux3VideoPayload = (input) => {
  const duration = input.duration && input.duration !== "auto" ? Number(input.duration) : "auto";
  const keyframes = [];
  if (input.startFrame) keyframes.push({ imageUrl: input.startFrame, frameIndex: 0 });
  if (input.endFrame && typeof duration === "number") {
    keyframes.push({ imageUrl: input.endFrame, frameIndex: duration * 24 });
  }
  return {
    prompt: input.prompt,
    model: input.model ?? "flux-3-preview-high",
    aspectRatio: input.aspectRatio ?? "auto",
    resolution: input.resolution ?? "720p",
    duration,
    generateAudio: input.generateAudio ?? true,
    grounding: input.grounding ?? true,
    ...keyframes.length ? { keyframes } : {},
    // referenceImages (ir2v) — reference images that define who/what appears.
    ...input.imageUrls?.length ? { referenceImages: input.imageUrls } : {},
    // startVideo (f2v) — continue from a clip's final frames.
    ...input.videoUrl ? { startVideo: input.videoUrl } : {},
    // referenceVideo (vr2v) — carry a clip's subjects into a brand-new video.
    ...input.videoUrls?.length ? { referenceVideo: input.videoUrls[0] } : {},
    // seed omitted when unset → vendor randomizes.
    ...input.seed != null ? { seed: input.seed } : {},
    ...input.version ? { version: input.version } : {}
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
      ...params.voiceId(GEMINI_VOICES, GEMINI_DEFAULT_VOICE_ID)
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
      ...params.voiceId(GEMINI_VOICES, GEMINI_DEFAULT_VOICE_ID)
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
  }
]);

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
var buildOpenAITTSPayload = (ctx) => ({
  prompt: ctx.prompt,
  voice: ctx.voiceId ?? "alloy"
});
var ttsParamConfig = {
  ...params.prompt({ maxLength: 4096 }),
  ...params.voiceId(OPENAI_VOICES, OPENAI_DEFAULT_VOICE_ID)
};
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
  },
  // ── Audio ──────────────────────────────────────────
  {
    id: "openai-tts-1",
    name: "OpenAI TTS-1",
    modelId: "tts-1",
    addedAt: "2026-02-15",
    workflow: "openai/tts/v1",
    buildPayload: (ctx) => ({ ...buildOpenAITTSPayload(ctx), model: "tts-1" }),
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    deprecated: true,
    description: "Fast and affordable text-to-speech with natural voice output.",
    features: [feat("Fast", "characteristic"), feat("11 Voices", "characteristic")],
    paramConfig: ttsParamConfig
  },
  {
    id: "openai-tts-1-hd",
    name: "OpenAI TTS-1 HD",
    modelId: "tts-1-hd",
    addedAt: "2026-02-15",
    workflow: "openai/tts/v1",
    buildPayload: (ctx) => ({ ...buildOpenAITTSPayload(ctx), model: "tts-1-hd" }),
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    deprecated: true,
    description: "High-definition text-to-speech with richer, more natural audio quality.",
    features: [feat("HD Quality", "quality"), feat("11 Voices", "characteristic")],
    paramConfig: ttsParamConfig
  }
]);

// src/vendors/catalog/elevenlabs.ts
var buildElevenLabsTTSPayload = (ctx) => ({
  text: ctx.prompt,
  voice_id: ctx.voiceId ?? DEFAULT_VOICE_ID,
  model_id: ctx.modelId,
  ...ctx.language ? { language_code: ctx.language } : {}
});
var buildElevenLabsSFXPayload = (ctx) => ({
  text: ctx.prompt,
  duration_seconds: ctx.duration ?? 5
});
var buildElevenLabsSTSPayload = (ctx) => ({
  audio_url: ctx.audioUrl,
  voice_id: ctx.voiceId ?? DEFAULT_VOICE_ID,
  model_id: ctx.modelId,
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
  voice_id: ctx.voiceId ?? DEFAULT_VOICE_ID,
  voice_description: ctx.prompt
});
var buildElevenLabsVoiceDesignPayload = (ctx) => ({
  voice_description: ctx.prompt,
  auto_generate_text: true,
  ...ctx.modelId ? { model_id: ctx.modelId } : {}
});
var ttsParamConfig2 = (promptMaxLength) => ({
  ...params.language(true),
  ...params.prompt({ maxLength: promptMaxLength }),
  ...params.voiceId(ELEVENLABS_VOICES, DEFAULT_VOICE_ID)
});
var { MODELS: MODELS24 } = defineModels("elevenlabs", [
  // ── TTS ───────────────────────────────────────────────────────────
  {
    id: "eleven-v3",
    name: "Eleven v3",
    modelId: "eleven_v3",
    addedAt: "2026-02-06",
    workflow: "elevenlabs/v1/text-to-speech",
    buildPayload: buildElevenLabsTTSPayload,
    estimatedTime: 11,
    mode: "audio",
    inputType: "tts",
    badge: ["popular"],
    description: "Latest voice engine with expanded tone and pacing control.",
    features: [feat("Experimental", "characteristic"), feat("Creative Control", "characteristic")],
    paramConfig: ttsParamConfig2(5e3)
  },
  {
    id: "eleven-multilingual-v2",
    name: "Eleven Multilingual v2",
    modelId: "eleven_multilingual_v2",
    addedAt: "2026-02-06",
    workflow: "elevenlabs/v1/text-to-speech",
    buildPayload: buildElevenLabsTTSPayload,
    estimatedTime: 9,
    mode: "audio",
    inputType: "tts",
    badge: ["popular", "fast"],
    description: "Stable multilingual speech across 29+ languages with natural rhythm.",
    features: [feat("Stable", "characteristic"), feat("Professional", "characteristic")],
    paramConfig: ttsParamConfig2(1e4)
  },
  // ── Sound Effects ─────────────────────────────────────────────────
  {
    id: "elevenlabs-sfx",
    name: "ElevenLabs SFX v2",
    modelId: "eleven_text_to_sound_v2",
    addedAt: "2026-02-06",
    workflow: "elevenlabs/v1/sound-generation",
    buildPayload: buildElevenLabsSFXPayload,
    estimatedTime: 6,
    mode: "audio",
    inputType: "sfx",
    badge: ["popular"],
    description: "Create custom sound effects from a text description \u2014 up to 15 seconds.",
    features: [feat("Sound Effects", "characteristic")],
    paramConfig: { ...params.prompt(), ...params.duration([1, 3, 5, 8, 10, 15], 5) }
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
    buildPayload: buildElevenLabsSTSPayload,
    estimatedTime: 15,
    mode: "audio",
    inputType: "sts",
    description: "Swap your voice to a different speaker while keeping timing and emotion.",
    features: [feat("Voice Changer", "characteristic"), feat("Emotion Preserved", "characteristic")],
    paramConfig: {
      ...params.audioInput("Speech Audio", true),
      ...params.voiceId(ELEVENLABS_VOICES, DEFAULT_VOICE_ID),
      ...p.boolean("removeBackgroundNoise", false, "Remove Background Noise")
    }
  },
  {
    id: "eleven-multilingual-sts-v2",
    name: "Eleven Multilingual STS v2",
    modelId: "eleven_multilingual_sts_v2",
    addedAt: "2026-02-15",
    workflow: "elevenlabs/v1/speech-to-speech",
    buildPayload: buildElevenLabsSTSPayload,
    estimatedTime: 15,
    mode: "audio",
    inputType: "sts",
    description: "Voice swap across 29 languages \u2014 preserves emotion and cadence.",
    features: [feat("Voice Changer", "characteristic"), feat("Multilingual", "characteristic"), feat("29 Languages", "characteristic")],
    paramConfig: {
      ...params.audioInput("Speech Audio", true),
      ...params.voiceId(ELEVENLABS_VOICES, DEFAULT_VOICE_ID),
      ...params.language(true),
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
      ...params.language(true)
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
      ...params.voiceId(ELEVENLABS_VOICES, DEFAULT_VOICE_ID),
      ...params.prompt({ maxLength: 1e3 })
    }
  },
  {
    id: "eleven-voice-design-v3",
    name: "Eleven Voice Design v3",
    addedAt: "2026-03-24",
    modelId: "eleven_ttv_v3",
    workflow: "elevenlabs/v1/voice-design",
    buildPayload: buildElevenLabsVoiceDesignPayload,
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    description: "Design a new voice from a text description using v3 engine.",
    features: [feat("Voice Design", "characteristic"), feat("Preview", "characteristic")],
    paramConfig: { ...params.prompt({ maxLength: 1e3 }) }
  },
  {
    id: "eleven-voice-design-v2",
    name: "Eleven Voice Design Multilingual v2",
    addedAt: "2026-03-24",
    modelId: "eleven_multilingual_ttv_v2",
    workflow: "elevenlabs/v1/voice-design",
    buildPayload: buildElevenLabsVoiceDesignPayload,
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    description: "Design a new voice from a text description with multilingual support.",
    features: [feat("Voice Design", "characteristic"), feat("Multilingual", "characteristic"), feat("Preview", "characteristic")],
    paramConfig: { ...params.prompt({ maxLength: 1e3 }) }
  },
  {
    id: "eleven-voice-create",
    name: "Eleven Voice Previews",
    addedAt: "2026-03-24",
    workflow: "elevenlabs/v1/voice-create-previews",
    buildPayload: buildElevenLabsVoiceDesignPayload,
    estimatedTime: 15,
    mode: "audio",
    inputType: "tts",
    description: "Generate voice previews from a description to audition before committing.",
    features: [feat("Voice Design", "characteristic"), feat("Preview", "characteristic")],
    paramConfig: { ...params.prompt({ maxLength: 1e3 }) }
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
  ...params.voiceId([], "", { required: true })
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
    // disabled 2026-05-08: backend/catalog mismatch.
    //   heygen/v1/video/generate uses Avatar IV mode but heygen/v1/avatars/list
    //   returns 1287 Avatar III avatars (all preview URLs are /avatar/v3/), so
    //   every avatar from the list is rejected with "This video avatar does not
    //   support Avatar IV video generation". Talking Photo (i2v) path is
    //   unaffected. Re-enable once backend exposes an Avatar IV catalog OR
    //   downgrades the worker to Avatar III mode.
    disabled: true,
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
      ...params.videoId([], "", { required: true }),
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
  }
]);

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

// src/vendors/catalog/imagen.ts
var imagenParams = {
  ...params.prompt(),
  ...params.aspectRatio(["1:1", "16:9", "9:16", "3:4", "4:3"], "1:1"),
  // Vertex Imagen sampleCount is capped at 4 — don't offer 6/8/10.
  ...params.count([1, 2, 4]),
  ...params.enhancePrompt(),
  ...params.negativePrompt()
};
var { MODELS: MODELS28 } = defineModels("google", [
  {
    id: "imagen-4.0",
    name: "Imagen 4.0",
    modelId: "imagen-4.0-generate-001",
    addedAt: "2026-02-06",
    workflow: "imagen",
    estimatedTime: 12,
    mode: "image",
    inputType: "t2i",
    badge: ["fast"],
    description: "Quick 1K images with sharp text overlay and prompt enhancement.",
    features: [feat("1K", "resolution")],
    paramConfig: imagenParams
  },
  {
    id: "imagen-4.0-ultra",
    name: "Imagen 4.0 Ultra",
    modelId: "imagen-4.0-ultra-generate-001",
    addedAt: "2026-02-06",
    workflow: "imagen",
    estimatedTime: 15,
    mode: "image",
    inputType: "t2i",
    badge: ["premium"],
    description: "Print-ready 2K output optimized for photorealistic detail.",
    features: [feat("2K", "resolution")],
    paramConfig: imagenParams
  },
  {
    id: "imagen-4.0-fast",
    name: "Imagen 4.0 Fast",
    modelId: "imagen-4.0-fast-generate-001",
    addedAt: "2026-02-06",
    workflow: "imagen",
    estimatedTime: 6,
    mode: "image",
    inputType: "t2i",
    description: "Fastest Imagen tier for quick drafts and rapid prompt iteration.",
    features: [feat("1K", "resolution"), feat("Fast", "duration")],
    paramConfig: imagenParams
  }
]);

// src/vendors/catalog/imagen.payloads.ts
var buildImagenPayload = (modelId) => (
  // Partial: WorkflowTypes incorrectly marks some params as required (e.g. maskDilation, editingSteps)
  (input) => ({
    model: modelId,
    mode: "imagen_generate",
    prompt: input.prompt,
    sampleCount: input.count ?? 1,
    aspectRatio: input.aspectRatio ?? "1:1",
    enhancePrompt: input.enhancePrompt !== false,
    ...input.negativePrompt ? { negativePrompt: input.negativePrompt } : {}
  })
);
registerPayloads(MODELS28, {
  "imagen-4.0": buildImagenPayload("imagen-4.0-generate-001"),
  "imagen-4.0-ultra": buildImagenPayload("imagen-4.0-ultra-generate-001"),
  "imagen-4.0-fast": buildImagenPayload("imagen-4.0-fast-generate-001")
});

// src/vendors/catalog/qwen.ts
var QWEN_SIZE_MAP = {
  "1024x1024": "1024x1024",
  "1024x768": "1024x768",
  "768x1024": "768x1024",
  "1536x1024": "1536x1024",
  "1024x1536": "1024x1536",
  "2048x2048": "2048x2048"
};
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
    ...hasImages ? { image_urls: ctx.imageUrls } : {}
  };
};
var buildQwenEditPlusPayload = (ctx) => ({
  prompt: ctx.prompt,
  image_urls: ctx.imageUrls ?? [],
  ...ctx.size && QWEN_SIZE_MAP[ctx.size] ? { size: QWEN_SIZE_MAP[ctx.size] } : {}
});
var buildQwenV1 = (model) => (ctx) => {
  const hasImages = Array.isArray(ctx.imageUrls) && ctx.imageUrls.length > 0;
  return {
    prompt: ctx.prompt,
    model,
    ...hasImages ? { image_urls: ctx.imageUrls } : {},
    ...ctx.negativePrompt ? { negative_prompt: ctx.negativePrompt } : {},
    size: (ctx.resolution ?? "2048x2048").replace("x", "*"),
    n: ctx.count ?? 1,
    prompt_extend: ctx.enhancePrompt ?? true,
    // Qwen 3.0 only — prompt-rewrite strategy (direct/agent); 2.x ignores it.
    ...ctx.promptExtendMode ? { prompt_extend_mode: ctx.promptExtendMode } : {},
    watermark: false,
    ...ctx.seed != null ? { seed: ctx.seed } : {}
  };
};
var qwenV1Params = {
  ...params.prompt({ maxLength: 800 }),
  ...params.negativePrompt(),
  ...params.resolution(QWEN_V1_SIZES, "2048x2048"),
  ...params.count([1, 2, 4, 6]),
  ...params.enhancePrompt(true),
  ...params.imageInput(3, "Source Images")
};
var qwenV1Params3 = {
  ...qwenV1Params,
  ...p.enum("promptExtendMode", ["direct", "agent"], "direct")
};
var { MODELS: MODELS29 } = defineModels("qwen", [
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
      ...params.count(),
      ...params.imageInput(1, "Source Image")
    }
  },
  {
    id: "qwen-image-2",
    name: "Qwen 2",
    addedAt: "2026-03-27",
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
    id: "qwen-image-edit-plus",
    name: "Qwen Edit Plus",
    addedAt: "2026-02-06",
    workflow: "qwen-image-edit-plus",
    buildPayload: buildQwenEditPlusPayload,
    estimatedTime: 11,
    mode: "image",
    inputType: "i2i",
    description: "Edit or transform up to 3 source images with prompt-guided changes.",
    features: [feat("Image Input", "input")],
    paramConfig: {
      ...params.prompt(),
      // size: Qwen edit-plus API ignores size param — output is always 1024x1024
      ...params.imageInput(3, "Source Images", true)
    }
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
var { MODELS: MODELS30 } = defineModels("recraft", [
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
var { MODELS: MODELS31 } = defineModels("topaz", [
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
registerPayloads(MODELS31, {
  "topaz-upscale-image": buildTopazImagePayload,
  "topaz-upscale-video": buildTopazVideoPayload
});

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
var { MODELS: MODELS32 } = defineModels("picsart", [
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
var { MODELS: MODELS33 } = defineModels("google", [
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
      ...params.prompt(),
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
var HH_DURATIONS = [5, 10, 15];
var { MODELS: MODELS34 } = defineModels("happyhorse", [
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
      feat("5/10/15 sec", "duration")
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(HH_AR, "16:9"),
      ...params.resolution(HH_RES, "720P"),
      ...params.duration(HH_DURATIONS, 5),
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
      feat("5/10/15 sec", "duration")
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(HH_AR, "16:9"),
      ...params.resolution(HH_RES, "720P"),
      ...params.duration(HH_DURATIONS, 5),
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
      feat("5/10/15 sec", "duration")
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(HH_AR, "16:9"),
      ...params.resolution(HH_RES, "720P"),
      ...params.duration(HH_DURATIONS, 5),
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
      feat("5/10/15 sec", "duration")
    ],
    paramConfig: {
      ...params.prompt({ maxLength: 2500 }),
      ...params.aspectRatio(HH_AR, "16:9"),
      ...params.resolution(HH_RES, "720P"),
      ...params.duration(HH_DURATIONS, 5),
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
var { MODELS: MODELS35 } = defineModels("pixverse", [
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
registerPayloads(MODELS35, {
  "pixverse-v6": buildTextToVideoPayload("v6"),
  "pixverse-v6-image": buildImageToVideoPayload("v6"),
  "pixverse-v6-fusion": buildReferenceToVideoPayload("v6"),
  "pixverse-c1": buildTextToVideoPayload("c1"),
  "pixverse-c1-image": buildImageToVideoPayload("c1"),
  "pixverse-c1-fusion": buildReferenceToVideoPayload("c1")
});

// src/vendors/catalog/async-ai.ts
var { MODELS: MODELS36 } = defineModels("async", [
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
      ...params.voiceId(ASYNC_VOICES, ASYNC_DEFAULT_VOICE_ID),
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
registerPayloads(MODELS36, { "async-flash-v1": buildAsyncTtsPayload });

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
var MODELS37 = [...ANTHROPIC, ...OPENAI_LLM, ...GEMINI_LLM];

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
registerPayloads(MODELS37, {
  "claude-opus-4-8": buildClaudePayload("claude-opus-4-8"),
  "claude-sonnet-4-6": buildClaudePayload("claude-sonnet-4-6"),
  "claude-haiku-4-5": buildClaudePayload("claude-haiku-4-5"),
  "gpt-5.5": buildOpenAiPayload("gpt-5.5"),
  "gemini-3-pro": buildGeminiPayload("gemini-3-pro-preview"),
  // Flash models route through chat-completions (OpenAI-shaped), not the
  // native `gemini` workflow. flash-lite has no thinking param → reasoning_effort omitted.
  "gemini-3.6-flash": buildOpenAiPayload("gemini-3.6-flash"),
  "gemini-3.5-flash-lite": buildOpenAiPayload("gemini-3.5-flash-lite")
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
  ...MODELS28,
  ...MODELS33,
  ...MODELS29,
  ...MODELS30,
  ...MODELS31,
  ...MODELS32,
  ...MODELS34,
  ...MODELS35,
  ...MODELS36,
  ...MODELS37
];
var getModelsByMode = (mode, includeDisabled = false) => ALL_MODELS.filter((m) => m.mode === mode && (includeDisabled || isVisibleForReleases(m)));

// src/core/contracts.ts
function requireObject(value, message) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(message);
  }
}
function buildInputSchema(model) {
  return {
    parse(input) {
      requireObject(input, `Invalid input for model "${model.id}"`);
      validateAll(model.paramConfig, input);
      return input;
    }
  };
}
function buildOutputSchema(model) {
  return {
    parse(output) {
      if (output == null) {
        throw new Error(`Model "${model.id}" returned empty output`);
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
    throw new Error(`${modelName} failed${code}: ${detail}`);
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
function toCompletedStatus(handle, result, raw) {
  return {
    handle,
    status: "COMPLETED",
    result,
    raw
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
  if (!found) throw new Error(`Unknown model: "${id}"`);
  return found;
}

// src/client/transport.ts
function resolveFetch(config) {
  if (config.fetch) return config.fetch;
  if (config.apiKey) {
    const token = config.apiKey.replace(/^Bearer\s+/i, "");
    return (url, init) => {
      const headers = new Headers(init?.headers);
      headers.set("Authorization", `Bearer ${token}`);
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
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Submit failed (${res.status}): ${data.message ?? JSON.stringify(data)}`);
      }
      const response = data.response;
      const id = response?.id ?? data.id;
      if (!id) throw new Error(`No task id in response: ${JSON.stringify(data)}`);
      return { workflow: request.workflow, id: String(id) };
    },
    async status(handle, signal) {
      const res = await f(`${apiUrl}/workflows/${handle.workflow}/${handle.id}/result`, { signal });
      if (!res.ok) throw new Error(`Status check failed (${res.status}): ${await res.text()}`);
      return res.json();
    },
    async execute(request) {
      const res = await jsonPost(
        `${apiUrl}/workflows/${request.workflow}/execute`,
        { params: request.payload },
        request.signal
      );
      if (!res.ok) throw new Error(`Execute failed (${res.status}): ${await res.text()}`);
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
function parseResult(completed, model, contract) {
  if (completed.status === "FAILED") {
    throw new Error(`${model.name} failed: ${completed.error ?? "unknown error"}`);
  }
  if (completed.status === "CANCELED") {
    throw new Error(`${model.name} was canceled`);
  }
  throwIfErrorResult(completed.result, model.name);
  const parsed = contract?.output ? contract.output.parse(completed.result) : completed.result;
  const multiItems = extractAllResults(parsed);
  if (multiItems?.length) {
    const results = multiItems.map((item) => ({
      url: item.url,
      metadata: item.exploreImageId ? { exploreImageId: item.exploreImageId } : void 0
    }));
    return { url: results[0].url, results, model: model.id, handle: completed.handle, raw: parsed };
  }
  const url = extractUrl(parsed);
  if (!url) {
    throw new Error(`${model.name}: unexpected response \u2014 no result URL`);
  }
  return { url, results: [{ url }], model: model.id, handle: completed.handle, raw: parsed };
}
function parseTextResult(completed, model) {
  if (completed.status === "FAILED") {
    throw new Error(`${model.name} failed: ${completed.error ?? "unknown error"}`);
  }
  if (completed.status === "CANCELED") {
    throw new Error(`${model.name} was canceled`);
  }
  throwIfErrorResult(completed.result, model.name);
  throwIfErrorResult(completed.raw, model.name);
  const text = extractText(completed.result) ?? extractText(completed.raw);
  if (text == null) {
    throw new Error(`${model.name}: unexpected response \u2014 no text`);
  }
  return { text, model: model.id, handle: completed.handle, raw: completed.raw ?? completed.result };
}

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
  const p2 = { prompt: String(params2.prompt ?? "") };
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

// src/client/index.ts
function createClient(config) {
  const isConfig = isClientConfig(config);
  const transport = isConfig ? buildTransport(config) : config;
  const client = createWorkflowClient(transport, { pollingIntervalMs: 2e3 });
  const supportsSubmit = typeof transport.submit === "function";
  const apis = createApis(isConfig ? config : null);
  const driveConfig = isConfig ? config.drive : void 0;
  const driveClient = isConfig && driveConfig ? createDriveClient(resolveFetch(config), config.apiUrl, driveConfig.folder) : null;
  async function executeModel(model, workflow, payload, signal) {
    if (model.syncExecute || !supportsSubmit) {
      const syncResponse = await client.run(
        { workflow, payload, signal },
        { mode: "sync" }
      );
      return toCompletedStatus(
        syncResponse.handle,
        extractSyncResult(syncResponse.raw),
        syncResponse.raw
      );
    }
    return client.run({ workflow, payload, signal });
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
        throw new Error(`${resolved.name} is a text model \u2014 use generateText() instead.`);
      }
      const { workflow, payload, contract } = prepareRequest(resolved, params2);
      const drive = buildDrivePayloadOptions(resolved, params2, options);
      const finalPayload = injectDriveOptions(payload, drive);
      const completed = await executeModel(resolved, workflow, finalPayload, options?.signal);
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
        throw new Error(`${resolved.name} is not a text model \u2014 use generate() instead.`);
      }
      const { workflow, payload } = prepareRequest(resolved, params2);
      const completed = await executeModel(resolved, workflow, payload, options?.signal);
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
      const completed = await client.result(handle, options);
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
        throw new Error(done.error ?? `${workflow} failed with status ${done.status}`);
      }
      if (done.result === void 0) {
        throw new Error(`${workflow} completed but returned no result`);
      }
      return done.result;
    },
    // ── apis (direct, low-level API access) ───────────────────────────
    /** Direct, low-level access to the Picsart model APIs. See `./apis.ts`. */
    apis,
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
  return unit ? { min, max, unit } : { min, max };
}

// src/core/descriptors/model-accessor.ts
var ModelParamsAccessorImpl = class {
  def;
  constructor(def) {
    this.def = def;
  }
  param(key) {
    const entry = this.def.paramConfig[key];
    if (!entry) return void 0;
    const { descriptor, ...meta } = entry;
    return { ...meta, ...descriptor };
  }
  hasParam(key) {
    return key in this.def.paramConfig;
  }
  all() {
    return Object.entries(this.def.paramConfig).map(
      ([key, { descriptor, ...meta }]) => ({ key, ...meta, ...descriptor })
    );
  }
  // Kind-narrowed accessors
  enum(key) {
    return this.narrow(key, "enum");
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
  duration() {
    return this.narrow("duration", "enum");
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
    return this.applyEnum("duration", this.inner.duration());
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
var BytedanceVideoUpscaler = "bytedance-video-upscaler";
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
var Gemini25FlashImage = "gemini-2.5-flash-image";
var Gemini25FlashTts = "gemini-2.5-flash-tts";
var Gemini25ProTts = "gemini-2.5-pro-tts";
var Gemini3Pro = "gemini-3-pro";
var Gemini3ProImage = "gemini-3-pro-image";
var Gemini31FlashImage = "gemini-3.1-flash-image";
var Gemini31FlashLiteImage = "gemini-3.1-flash-lite-image";
var Gemini35FlashLite = "gemini-3.5-flash-lite";
var Gemini36Flash = "gemini-3.6-flash";
var GeminiOmniFlashPreview = "gemini-omni-flash-preview";
var Gpt55 = "gpt-5.5";
var GptImage1 = "gpt-image-1";
var GptImage15 = "gpt-image-1.5";
var GptImage2 = "gpt-image-2";
var GrokEditVideo = "grok-edit-video";
var GrokExtendVideo = "grok-extend-video";
var GrokImagineImage = "grok-imagine-image";
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
var IdeogramV3 = "ideogram-v3";
var IdeogramV4 = "ideogram-v4";
var Imagen40 = "imagen-4.0";
var Imagen40Fast = "imagen-4.0-fast";
var Imagen40Ultra = "imagen-4.0-ultra";
var Kling30Image = "kling-3.0-image";
var KlingAvatar = "kling-avatar";
var KlingElements = "kling-elements";
var KlingMotionControl = "kling-motion-control";
var KlingMotionControlV3 = "kling-motion-control-v3";
var KlingMultiImage = "kling-multi-image";
var KlingMultiImageV21 = "kling-multi-image-v2-1";
var KlingO1Image = "kling-o1-image";
var KlingT2a = "kling-t2a";
var KlingV15Image = "kling-v1-5-image";
var KlingV21Image = "kling-v2-1-image";
var KlingV26 = "kling-v2-6";
var KlingV2Image = "kling-v2-image";
var KlingV2NewImage = "kling-v2-new-image";
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
var MinimaxMusicV2 = "minimax-music-v2";
var OpenaiTts1 = "openai-tts-1";
var OpenaiTts1Hd = "openai-tts-1-hd";
var Ovi = "ovi";
var PicsartChangeBg = "picsart-change-bg";
var PicsartEnhance = "picsart-enhance";
var PicsartFlux2Klein = "picsart-flux-2-klein";
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
var QwenImageEditPlus = "qwen-image-edit-plus";
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
var Recraftv4Vector = "recraftv4_vector";
var Reve = "reve";
var RunwayAleph2 = "runway-aleph2";
var RunwayAvatarVideo = "runway-avatar-video";
var RunwayGen3aTurbo = "runway-gen3a-turbo";
var RunwayGen4Aleph = "runway-gen4-aleph";
var RunwayGen4Ref = "runway-gen4-ref";
var RunwayGen45 = "runway-gen4.5";
var SeedAudio10 = "seed-audio-1.0";
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
var SeedanceI2v = "seedance-i2v";
var Seedream40 = "seedream-4.0";
var Seedream45 = "seedream-4.5";
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
var Models = {
  AsyncFlashV1,
  BytedanceOmnihumanV15,
  BytedanceVideoUpscaler,
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
  Gemini25FlashImage,
  Gemini25FlashTts,
  Gemini25ProTts,
  Gemini3Pro,
  Gemini3ProImage,
  Gemini31FlashImage,
  Gemini31FlashLiteImage,
  Gemini35FlashLite,
  Gemini36Flash,
  GeminiOmniFlashPreview,
  Gpt55,
  GptImage1,
  GptImage15,
  GptImage2,
  GrokEditVideo,
  GrokExtendVideo,
  GrokImagineImage,
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
  IdeogramV3,
  IdeogramV4,
  Imagen40,
  Imagen40Fast,
  Imagen40Ultra,
  Kling30Image,
  KlingAvatar,
  KlingElements,
  KlingMotionControl,
  KlingMotionControlV3,
  KlingMultiImage,
  KlingMultiImageV21,
  KlingO1Image,
  KlingT2a,
  KlingV15Image,
  KlingV21Image,
  KlingV26,
  KlingV2Image,
  KlingV2NewImage,
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
  MinimaxMusicV2,
  OpenaiTts1,
  OpenaiTts1Hd,
  Ovi,
  PicsartChangeBg,
  PicsartEnhance,
  PicsartFlux2Klein,
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
  QwenImageEditPlus,
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
  Recraftv4Vector,
  Reve,
  RunwayAleph2,
  RunwayAvatarVideo,
  RunwayGen3aTurbo,
  RunwayGen4Aleph,
  RunwayGen4Ref,
  RunwayGen45,
  SeedAudio10,
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
  SeedanceI2v,
  Seedream40,
  Seedream45,
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

export { ALL_MODELS, ExecutionMode as ApiRunMode, DEFAULT_VISIBLE_RELEASES, KLING_DUAL_IMAGE_EFFECTS, Model, Models, buildFilename, buildGenerationAttributes, catalog, createClient, decodeDeepLinkPayload, encodeDeepLinkPayload, findModel, getModel, getModelsByMode, getVoiceById, inferResourceType, isVisibleForReleases, parseGeneration, releaseOf };

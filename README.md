# @picsart/ai-sdk

Generate images, video, audio, and text with 100+ AI models.

## Documentation

Full guides, the model catalog, and the API reference live on the Picsart API Platform:

- [Documentation](https://picsart.com/api-platform/docs) -- overview and guides
- [Quickstart](https://picsart.com/api-platform/docs/quickstart) -- install, authenticate, first generation
- [SDK guide](https://picsart.com/api-platform/docs/sdk) -- client setup, `generate`/`generateText`, Drive, lifecycle
- [Authentication](https://picsart.com/api-platform/docs/authentication) -- create an API key
- [Model catalog](https://picsart.com/api-platform/models) -- browse every supported model
- [API reference](https://picsart.com/api-platform/docs/api-reference)

Repository: [github.com/PicsArt/ai-sdk](https://github.com/PicsArt/ai-sdk)

## Quick Start

```bash
npm install @picsart/ai-sdk
```

```typescript
import { createClient, Model, catalog } from '@picsart/ai-sdk'

// Create a client — pass your Picsart API key
const ai = createClient({
  apiKey: process.env.PICSART_API_KEY,
  apiUrl: 'https://api.picsart.com',
})

// Generate — model ids are plain strings, resolved server-side.
// Generation works immediately; no catalog load required.
const result = await ai.generate('flux-2-pro', { prompt: 'a cat on mars' })
console.log(result.url)

// The local catalog accessors (Model / catalog / ai.validate) read a catalog
// loaded from models-hub. Load it once, then use them:
await ai.initModelCatalog()

// Browse models — the `catalog` accessor
catalog.all()                              // every model
catalog.find({ output: 'video' })          // video models only
catalog.search('kling')                    // search by name/id/provider

// Model metadata & params — the `Model` accessor
Model('flux-2-pro').name                    // 'Flux 2 Pro'
Model('flux-2-pro').meta()                  // mode, provider, badges, …
Model('flux-2-pro').params()                // accepted parameters
Model('flux-2-pro').params().toSchema()     // param schema

// Validate input (never throws) → { valid, errors? }
Model('flux-2-pro').validate({ prompt: 'a cat' })
```

> **Dynamic-only (v7).** The SDK no longer bundles a model catalog or builds
> vendor payloads locally. Every generation rides the models-hub `v1/models`
> workflow (the server resolves the model, builds the payload, and normalizes
> the result). Model ids are plain strings. The catalog accessors
> (`Model()`, `catalog.*`, `ai.validate()`) require `await ai.initModelCatalog()`
> first — until then they throw `ApiError` 409 `catalog_not_loaded`.
> `generate()`/`generateText()`/`run()`/`submit()` never wait on it.

## Authentication

Pass `apiKey` and the SDK sends `Authorization: Bearer <apiKey>` on every request
(a leading `Bearer ` is stripped if present). Create a key from the
[Authentication guide](https://picsart.com/api-platform/docs/authentication).

```typescript
const ai = createClient({
  apiKey: process.env.PICSART_API_KEY,
  apiUrl: 'https://api.picsart.com',
})
```

Keep the key server-side — anything shipped to a browser is public.

Apps that already handle auth themselves (session cookies, token refresh, a
backend proxy) can pass their own `fetch` instead. It takes precedence over
`apiKey` when both are set:

```typescript
const ai = createClient({
  fetch: myAuthenticatedFetch,
  apiUrl: 'https://api.picsart.com',
})
```

`createClient` throws if neither `apiKey` nor `fetch` is provided.

## Custom Transport

`fetch` swaps out how a request is authenticated; `transport` swaps out the
requests themselves. Pass one and the SDK stops talking to the workflows API
altogether — every generation, poll, catalog load and credit estimate goes
through your implementation instead:

```typescript
const ai = createClient({ transport: myTransport })
```

`apiUrl` and the auth source are yours to bake into the transport, so neither is
required alongside it. Two surfaces still speak the workflows protocol directly
and keep needing `apiUrl` plus `fetch`/`apiKey` if you use them: `ai.drive` and
`ai.apis`.

| Method | Required | Serves |
|--------|----------|--------|
| `execute(request)` | yes | `syncExecute` models, catalog tasks, and every generation when `submit`/`poll` are absent |
| `submit(request)` | no | `generate()`, `submit()` — returns the generation id |
| `poll(handle, options)` | no | `generate()`, `result()`, `subscribe()` — resolves when the job is terminal, calls `options.onProgress` on the way |
| `status(handle, signal?)` | no | the edit-route probe behind `result(model, id)` on models that have one |
| `options(workflow, payload)` | no | `getCredits()` / `options()` — returns credits, an `OptionsResult`, or null |

Leave `submit`/`poll` out and the client runs **every** generation through
`execute()`; the async lifecycle (`submit()` / `result()` / `subscribe()`) then
rejects with a 400 `unsupported_transport` rather than pretending. Leave
`options` out and `getCredits()` / `options()` answer null.

```typescript
import type { SdkTransport } from '@picsart/ai-sdk'

const myTransport: SdkTransport = {
  async execute({ workflow, payload, signal }) {
    const res = await callMyGateway(workflow, payload, signal)
    return { result: res.output, usage: res.usage }
  },
  async submit({ workflow, payload }) {
    return (await startMyJob(workflow, payload)).id
  },
  async poll(handle, options) {
    const res = await waitForMyJob(handle.id, options)
    return { result: res.output, usage: res.usage }
  },
}
```

Throw `ApiError` for failures — anything else reaches the caller as a 502
`generation_failed`. A failed job may also resolve with the platform's
`{ message, reason, statusCode }` payload as its `result`; the SDK turns that
into the matching `ApiError` itself.

## Drive Integration

Auto-save generations to Picsart Drive:

```typescript
const ai = createClient({
  apiKey: process.env.PICSART_API_KEY,
  apiUrl: 'https://api.picsart.com',
  drive: { folder: 'AI Playground' },
})

// Generates and auto-saves to the root folder
const result = await ai.generate('flux-2-pro', { prompt: 'a cat' })
// result.drive = { uid: '...', folder: { name: 'AI Playground', uid: '...' } }

// Save to a subfolder
const board = await ai.drive.ensureFolder('Cats')
const result = await ai.generate('flux-2-pro', { prompt: 'a cat' }, { folder: board })

// Browse Drive
const folders = await ai.drive.folders()
const items = await ai.drive.list()
```

Generated Drive assets carry `model` and JSON `aiSDKPayload` automatically. Both
`generate()` and `submit()` record the original SDK inputs; custom Drive attributes
cannot replace that provenance. These are requested inputs, not a claim that every
provider default or rewritten prompt has been recovered. The stored prompt is capped
at 18,000 characters without changing the prompt sent to generation.

`apis.run()` remains a direct vendor API pass-through. It does not apply the client’s
Drive configuration or derive SDK metadata, even when a vendor payload explicitly
requests Drive saving. Vendor-shaped inputs must never be stored as `aiSDKPayload`;
that attribute is reserved for original SDK-shaped inputs.

For a separate or delayed save, pass the original generation context:

```typescript
await ai.drive.save({
  url: generatedUrl,
  name: 'clip.mp4',
  resourceType: 'VIDEO',
  generation: { modelId, params: originalGenerationParams },
})
// The existing helper also accepts a full params object instead of just a prompt:
const saveParams = ai.drive.buildSaveParams(generatedUrl, modelId, modelName, 'video', originalGenerationParams)
```

When the request you submit is not the record you want kept (a render that sends
only a reference to an earlier job, say), pass the inputs to record as
`drive.generation`. Custom `attributes` still cannot replace them:

```typescript
await ai.submit(modelId, finalRequest, {
  drive: { name: 'final.mp4', generation: { modelId, params: originalGenerationParams } },
})
```

Legacy `model`/`prompt`/`textScript` saves are normalized at write time. URL-only
uploads remain ordinary uploads: without generation context the SDK cannot infer
model, prompt or settings. Existing Drive files are not backfilled. The backend preserves SDK-supplied metadata; it cannot reconstruct SDK input
names or catalog model IDs from an arbitrary vendor request.

## Text Generation (LLMs)

Claude, GPT, Gemini, Kimi, Grok and MiniMax text models are called with `generateText()`. Single-shot:
pass a prompt and optional image(s)/video, get text back. They surface in the catalog
as `mode: 'text'`. Each vendor uses its own native workflow, so capabilities aren't lost
— Gemini accepts video input, Claude uses the Anthropic-native messages API.

```typescript
import { createClient } from '@picsart/ai-sdk'

const ai = createClient({ apiKey: process.env.PICSART_API_KEY, apiUrl: 'https://api.picsart.com' })

// Text in, text out
const { text } = await ai.generateText('claude-opus-5', { prompt: 'Explain RAG in one line.' })
console.log(text)

// Optional vision input + reasoning level (OpenAI / Gemini)
const res = await ai.generateText('gpt-5-5', {
  prompt: 'What is in this image?',
  imageUrls: ['https://cdn.example.com/photo.jpg'],
  thinking: 'high',            // 'off' | 'low' | 'medium' | 'high'
})
console.log(res.text)
console.log(res.raw)            // full backend response — usage, finish_reason, etc.

// Gemini accepts video input
await ai.generateText('gemini-3-pro', {
  prompt: 'Summarize this clip',
  videoUrl: 'https://cdn.example.com/clip.mp4',
})

// Browse text models
catalog.find({ output: 'text' })
```

> Thinking level maps per vendor: OpenAI, Kimi, Grok and MiniMax M3.1 Flash → `reasoning_effort`, Gemini →
> `thinkingConfig.thinkingLevel` (LOW/HIGH). Kimi K3, Grok 4.7 and MiniMax M3.1 Flash
> always reason, so they have no `off`. MiniMax M3 reasons adaptively and has no
> thinking knob. Claude’s `claude/v1/messages`
> workflow exposes no thinking knob, so Claude models omit `thinking`.

Use `generateText()` for text models and `generate()` for media models. In
dynamic mode ids are plain strings with no compile-time narrowing — the server
validates the model/mode and answers a 400 `wrong_model_mode` if you call the
wrong method for a model.

## Generic Execution — ai.run()

`run()` executes any model by id and answers the task result generically — the
model-id counterpart of `ai.apis.run()` (which is keyed by API name). It works
on every model and runs one uniform path: paramConfig validation, vendor payload
build, workflow execution (sync or async), and the model's `outputSchema` when
one is declared. The result comes back as-is in `{ result, status, usage, id }` —
no media-URL or text extraction, no Drive save. Use `generate()`/`generateText()`
when you want the parsed media/text surfaces; use `run()` when you want the raw
task result — and for `mode: 'json'` models, `run()` is the only surface:
structured-output models (judges, evaluators, classifiers) are rejected by
`generate()`, `generateText()`, and the async lifecycle.

The first json model is `typesafe-evaluate` — LLM-judge evaluation of any
content against named questions. Type the result via the `R` generic, same as
`ai.apis.run()`:

```typescript
interface EvaluateResult { model: string; answers: Record<string, unknown>; usage: unknown }

const { result } = await ai.run<EvaluateResult>('typesafe-evaluate', {
  state: 'The weather is lovely and everyone is having a great time.',
  questions: {
    is_safe: { type: 'noul', instructions: 'Is this content safe for all audiences?' },
    tone: { type: 'choice', instructions: 'Pick the tone.', options: ['positive', 'neutral', 'negative'] },
  },
})
// result: { model: 'jev-1.13.0', answers: { is_safe: …, tone: … }, usage: { input_tokens, output_tokens } }
```

Question ids are caller-chosen; each question is `noul` (yes/no), `choice`, or
`score`, with type-specific extras (`options`, bounds — see the
[TypeSafe docs](https://docs.typesafe.ai/api)) passed through as-is.

## Voice, Avatar & Template Catalogs

Models with catalog-backed params (voices, avatars, effect / caption templates) serve their option lists
from platform catalog tasks (`<vendor>/v1/catalog/<voices|avatars|templates|…>`) — nothing
is bundled; the workers cache the lists and answer fast. Fetch them via
`ai.catalogs`:

```typescript
// One page at a time — load more on scroll/pagination via nextCursor
const page = await ai.catalogs.voices('heygen-video-avatar')
// page: { items: CatalogItem[], nextCursor: string | null }
const more = await ai.catalogs.voices('heygen-video-avatar', { cursor: page.nextCursor! })

// Optional: preload the first page of every bound catalog at client creation
const ai = createClient({ apiKey, catalogs: { preload: true } })

// Fetched pages accumulate into the model's options, so existing accessors
// (and every picker built on them) see everything loaded so far:
Model('heygen-video-avatar').params().catalog('videoId')?.catalogOptions
```

`CatalogItem` is the standard shape across all vendors:
`{ id, name, description?, tags, preview? { imageUrl | videoUrl | audioUrl }, meta? }` —
`id` is sent back verbatim on generate as the bound param's value. Validation
never requires hydration: catalog-bound params accept any id and the platform
validates for real.

## Advanced Lifecycle

For progress tracking and job recovery:

```typescript
// Submit without waiting — returns the generation id (a string)
const generationId = await ai.submit('kling-v3', { prompt: 'a sunset' })

// Subscribe to updates — the terminal generation.completed event carries the
// parsed result, so no follow-up result() call is needed
for await (const e of ai.subscribe('kling-v3', generationId)) {
  if (e.type === 'generation.progress') console.log(e.progress?.percent)
  if (e.type === 'generation.completed') console.log(e.result.url)
  if (e.type === 'generation.failed') console.error(e.error.message)
}

// Or just wait for the parsed result (throws on failure/cancel)
const result = await ai.result('kling-v3', generationId, { intervalMs: 2000 })

// One-shot snapshot of a stored id (e.g. after a page reload)
const { value: snapshot } = await ai.subscribe('kling-v3', generationId).next()
```

Generation ids are plain strings — store them and recover jobs later with
`result(model, id)` or `subscribe(model, id)`.

## Error Handling

Every failure thrown by `generate()`, `generateText()`, `submit()`, and `result()`
is an `ApiError` with the same four fields, so you can branch on the error
instead of pattern-matching its message:

```typescript
import { createClient, ApiError } from '@picsart/ai-sdk'

try {
  const result = await ai.generate('flux-2-pro', { prompt: 'a cat on mars' })
} catch (err) {
  if (err instanceof ApiError) {
    err.status   // 402            — HTTP status, or its synthesized equivalent
    err.code     // 'payment_required' — platform `reason`, else an SDK code
    err.reason   // same value as `code`, named after the platform's own field
    err.message  // 'Submit failed (402): Not enough credits'

    if (err.status === 402) return topUpCredits()
    if (err.status === 429 || err.status >= 500) return retry()
    if (err.code === 'validation_error') return showFormError(err.message)
  }
  throw err
}
```

`code` carries the platform's `reason` verbatim whenever the API supplies one
(`content_moderation`, `unauthorized`, …). When it doesn't, the SDK fills in a
conventional slug for the status — `payment_required` for 402, `rate_limited`
for 429, and so on.

Failures that never reach the network get the status they semantically deserve,
so one retry predicate covers every case:

| Failure | `status` | `code` |
|---------|----------|--------|
| Unknown model id | 400 | `unknown_model` |
| `generate()` on a text model (or the reverse) | 400 | `wrong_model_mode` |
| Parameter validation | 400 | `validation_error` |
| Async lifecycle on an execute-only transport | 400 | `unsupported_transport` |
| HTTP error from the API | the response's status | platform `reason`, else the status slug |
| Poll deadline exceeded | 408 | `timeout` |
| Aborted via `options.signal`, or a canceled job | 499 | `aborted` / `canceled` |
| Job finished `FAILED` | the task's `statusCode`, else 502 | platform `reason`, else `generation_failed` |
| Response the SDK can't parse | 502 | `invalid_response` |

Aborts raised by `fetch` itself are deliberately **not** wrapped, so
`err.name === 'AbortError'` keeps working on the `DOMException`.

`message` is human-readable and may change between versions — branch on `status`
and `code`, not on the message text.

`ApiError` is the only error type the SDK throws: `ai.apis` and `ai.catalogs`
report failures the same way, and a custom transport's own error is mapped too
(a 502 `generation_failed` when it isn't already an `ApiError`).

## Public API

Key exports (see `src/index.ts` for the full list):

| Export | Type | Description |
|--------|------|-------------|
| `createClient` | function | Create an AI client from an API key (or a custom authenticated fetch) |
| `Model`, `catalog` | function / object | Model metadata, params, validation, discovery (after `initModelCatalog()`) |
| `GenerateResult` | type | `{ url, items: [{ url, metadata? }], generationId, usage?, drive? }` |
| `GenerationEvent` | type | One `ai.subscribe()` update — `generation.progress` / `.completed` / `.failed` |
| `GenerationEventType` | const | Named event-type constants (`GenerationEventType.Completed` === `'generation.completed'`) |
| `ClientConfig` | type | `{ apiKey?, fetch?, apiUrl, drive?, transport? }` — one of `apiKey` / `fetch` required unless `transport` is set |
| `AuthenticatedFetch` | type | `(url, init?) => Promise<Response>` — for the custom-`fetch` path |
| `SdkTransport` | type | The transport contract — see [Custom Transport](#custom-transport) |
| `GenerationOptions` | type | Poll controls for `result()`/`subscribe()` — `{ intervalMs?, maxAttempts?, signal? }` |
| `ApiError` | class | Unified error: `{ status, code, reason, message }` — see [Error Handling](#error-handling) |

## Package Structure

```
packages/ai-sdk/
  package.json
  tsconfig.json
  tsup.config.ts
  src/
    index.ts                    # Public API entry
    client/
      types.ts                  # ClientConfig, GenerateResult, DriveConfig
      transport.ts              # Default SdkTransport, over @picsart/workflows-client
      prepare.ts                # Build the v1/models command + parse its result
      drive.ts                  # Drive folder management + file saving
      index.ts                  # createClient() factory (dynamic-only)
    core/
      types.ts                  # ModelDefinition, ParamConfig, GenerationContext
      workflow.ts               # Task envelope types + the SdkTransport contract
      active-catalog.ts         # The process-global catalog installed by initModelCatalog()
      catalog-store.ts          # Loads the catalog from models-hub (/v1/models-catalog)
      catalog-wire.ts           # Wire ⇄ ModelDefinition (de)serialization
      schema.ts                 # ParamConfig → JSON Schema
      response.ts               # Vendor-agnostic result extraction
      model-registry.ts         # Model lookup indexes over the active catalog
      providers.ts              # Provider colors, labels, names
      voices.ts                 # Voice catalogs (ElevenLabs, OpenAI, Gemini)
      descriptors/              # Model()/catalog accessors, param descriptors, pricing
  __tests__/                    # SDK tests
  scripts/                      # Build scripts
```

## The Model Catalog

The SDK is **dynamic-only**: it ships with no bundled catalog and builds no
vendor payloads locally. Model definitions (parameter schemas, payload shapes,
and which workflow serves each model) live in **models-hub**, and every
generation rides its `v1/models` workflow — the server resolves the model,
builds the vendor payload, and normalizes the result.

- **Add or change a model** in the models-hub service
  ([`pa-models-hub-pluggable-worker`](https://gitlab.com/picsart/backend/Editor/external-ai-integrations/pa-models-hub-pluggable-worker));
  it takes effect without an SDK release.
- **Load the catalog** into the SDK with `await ai.initModelCatalog()` — it
  fetches `/v1/models-catalog` from models-hub and installs it as the active
  catalog, so `Model()`, `catalog.*` and `ai.validate()` serve the loaded data.
  Generation (`generate`/`generateText`/`run`/`submit`) does **not** require it.

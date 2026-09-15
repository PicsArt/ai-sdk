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
import { createClient, Models, Model, catalog } from '@picsart/ai-sdk'

// Create a client — pass your Picsart API key
const ai = createClient({
  apiKey: process.env.PICSART_API_KEY,
  apiUrl: 'https://api.picsart.com',
})

// Generate (Models.* are typed model-id constants)
const result = await ai.generate(Models.Flux2Pro, { prompt: 'a cat on mars' })
console.log(result.url)

// Browse models — the `catalog` accessor
catalog.all()                              // every model
catalog.find({ output: 'video' })          // video models only
catalog.search('kling')                    // search by name/id/provider

// Model metadata & params — the `Model` accessor
Model(Models.Flux2Pro).name                // 'Flux 2 Pro'
Model(Models.Flux2Pro).meta()              // mode, provider, badges, …
Model(Models.Flux2Pro).params()            // accepted parameters
Model(Models.Flux2Pro).params().toSchema() // param schema

// Validate input (never throws) → { valid, errors? }
Model(Models.Flux2Pro).validate({ prompt: 'a cat' })
```

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
| `options(workflow, payload)` | no | `getCredits()` — returns credits, or null |

Leave `submit`/`poll` out and the client runs **every** generation through
`execute()`; the async lifecycle (`submit()` / `result()` / `subscribe()`) then
rejects with a 400 `unsupported_transport` rather than pretending. Leave
`options` out and `getCredits()` answers null.

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
const result = await ai.generate(Models.Flux2Pro, { prompt: 'a cat' })
// result.drive = { uid: '...', folder: { name: 'AI Playground', uid: '...' } }

// Save to a subfolder
const board = await ai.drive.ensureFolder('Cats')
const result = await ai.generate(Models.Flux2Pro, { prompt: 'a cat' }, { folder: board })

// Browse Drive
const folders = await ai.drive.folders()
const items = await ai.drive.list()
```

## Text Generation (LLMs)

Claude, GPT, and Gemini text models are called with `generateText()`. Single-shot:
pass a prompt and optional image(s)/video, get text back. They surface in the catalog
as `mode: 'text'`. Each vendor uses its own native workflow, so capabilities aren't lost
— Gemini accepts video input, Claude uses the Anthropic-native messages API.

```typescript
import { createClient, Models } from '@picsart/ai-sdk'

const ai = createClient({ apiKey: process.env.PICSART_API_KEY, apiUrl: 'https://api.picsart.com' })

// Text in, text out
const { text } = await ai.generateText(Models.ClaudeOpus48, { prompt: 'Explain RAG in one line.' })
console.log(text)

// Optional vision input + reasoning level (OpenAI / Gemini)
const res = await ai.generateText(Models.Gpt55, {
  prompt: 'What is in this image?',
  imageUrls: ['https://cdn.example.com/photo.jpg'],
  thinking: 'high',            // 'off' | 'low' | 'medium' | 'high'
})
console.log(res.text)
console.log(res.raw)            // full backend response — usage, finish_reason, etc.

// Gemini accepts video input
await ai.generateText(Models.Gemini3Pro, {
  prompt: 'Summarize this clip',
  videoUrl: 'https://cdn.example.com/clip.mp4',
})

// Browse text models
catalog.find({ output: 'text' })
```

> Thinking level maps per vendor: OpenAI → `reasoning_effort`, Gemini →
> `thinkingConfig.thinkingLevel` (LOW/HIGH). Claude’s `claude/v1/messages`
> workflow exposes no thinking knob, so Claude models omit `thinking`.

`generateText()` is type-narrowed to text models (`TextModelId`); calling it with an
image/video model throws, and `generate()` throws on a text model — use the matching
method for each.

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
const generationId = await ai.submit(Models.KlingV3, { prompt: 'a sunset' })

// Subscribe to updates — the terminal generation.completed event carries the
// parsed result, so no follow-up result() call is needed
for await (const e of ai.subscribe(Models.KlingV3, generationId)) {
  if (e.type === 'generation.progress') console.log(e.progress?.percent)
  if (e.type === 'generation.completed') console.log(e.result.url)
  if (e.type === 'generation.failed') console.error(e.error.message)
}

// Or just wait for the parsed result (throws on failure/cancel)
const result = await ai.result(Models.KlingV3, generationId, { intervalMs: 2000 })

// One-shot snapshot of a stored id (e.g. after a page reload)
const { value: snapshot } = await ai.subscribe(Models.KlingV3, generationId).next()
```

Generation ids are plain strings — store them and recover jobs later with
`result(model, id)` or `subscribe(model, id)`.

## Error Handling

Every failure thrown by `generate()`, `generateText()`, `submit()`, and `result()`
is an `ApiError` with the same four fields, so you can branch on the error
instead of pattern-matching its message:

```typescript
import { createClient, Models, ApiError } from '@picsart/ai-sdk'

try {
  const result = await ai.generate(Models.Flux2Pro, { prompt: 'a cat on mars' })
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
| `Models` | object | Typed model-id constants (`Models.Flux2Pro` → `'flux-2-pro'`) |
| `Model`, `catalog` | function / object | Model metadata, params, validation, discovery |
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
      prepare.ts                # Validate input, build payload, parse result
      drive.ts                  # Drive folder management + file saving
      index.ts                  # createClient() factory
    core/
      types.ts                  # ModelDefinition, ParamConfig, GenerationContext
      workflow.ts               # Task envelope types + the SdkTransport contract
      contracts.ts              # Runtime input validation
      schema.ts                 # ParamConfig → JSON Schema
      response.ts               # Vendor-agnostic result extraction
      pricing.ts                # ToolId resolution
      model-registry.ts         # Model lookup indexes
      providers.ts              # Provider colors, labels, names
      voices.ts                 # Voice catalogs (ElevenLabs, OpenAI, Gemini)
      helpers.ts                # Vendor utilities
    generated/
      model-constants.ts        # AUTO-GENERATED: Models object + id constants
      model-input-types.ts      # AUTO-GENERATED: per-model TypeScript input types
    vendors/
      define.ts                 # defineModels() framework + params.* helpers
      presets.ts                # Reusable paramConfig factories
      catalog/
        index.ts                # Aggregation: ALL_MODELS, VENDOR_CATALOGS
        kling.ts                # One file per vendor (31 total)
        flux.ts
        ...
  __tests__/                    # SDK tests
  scripts/                      # Build scripts
```

## Adding a New Model

### Standard flow (pass-through payload)

When the backend accepts param values as-is (no field renaming needed):

1. Add config in `src/vendors/catalog/{vendor}.ts` via `defineModels()`:
   - `buildPayload` is **optional** — omit it and param values pass through as-is
2. Run `npm run build:model-constants` to regenerate constants
3. Run `npm run build:model-input-types` to regenerate TypeScript types
4. Model automatically appears in `catalog.all()` and as the `Models.NewModel` id constant

### With payload transforms

When the vendor API uses different field names or value formats:

1. Define the model config as above (no `buildPayload`)
2. Run `npm run build:model-input-types` — generates typed input for your model
3. Create `src/vendors/catalog/{vendor}.payloads.ts`:
   ```ts
   import type { ModelInput } from '../../generated/model-input-types.ts';
   import { registerPayloads } from '../define.ts';
   import { SPECS, MODELS } from './{vendor}.ts';

   registerPayloads({ SPECS, MODELS }, {
     'model-id': (input: ModelInput<'model-id'>) => ({
       prompt: input.prompt,
       aspect_ratio: input.aspectRatio,  // rename for vendor API
     }),
   });
   ```
4. Import the `.payloads.ts` file in `src/vendors/catalog/index.ts` (after the vendor import)

See `src/vendors/catalog/luma.ts` + `src/vendors/catalog/luma.payloads.ts` for a working example.

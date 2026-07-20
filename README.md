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

// Create a client — pass your authenticated fetch
const ai = createClient({
  fetch: myAuthenticatedFetch,
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

## Drive Integration

Auto-save generations to Picsart Drive:

```typescript
const ai = createClient({
  fetch: myAuthenticatedFetch,
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

const ai = createClient({ fetch: myAuthenticatedFetch, apiUrl: 'https://api.picsart.com' })

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

## Advanced Lifecycle

For progress tracking, cancellation, and job recovery:

```typescript
// Submit without waiting
const handle = await ai.submit(Models.KlingV3Pro, { prompt: 'a sunset' })

// Subscribe to status updates
for await (const update of ai.subscribe(handle)) {
  console.log(update.status, update.progress?.percent)
}

// Or poll manually
const status = await ai.status(handle)
```

## Public API

The SDK exports 7 symbols:

| Export | Type | Description |
|--------|------|-------------|
| `createClient` | function | Create an AI client from authenticated fetch |
| `Models` | object | Model catalog: 108 models + list/search/validate/toSchema |
| `GenerateResult` | type | `{ url, model, handle, drive? }` |
| `ClientConfig` | type | `{ fetch, apiUrl, drive? }` |
| `AuthenticatedFetch` | type | `(url, init?) => Promise<Response>` |
| `SdkTransport` | type | Advanced: custom transport interface |
| `WorkflowJobHandle` | type | Job handle for submit/status/cancel |

## Package Structure

```
packages/ai-sdk/
  package.json
  tsconfig.json
  tsup.config.ts
  src/
    index.ts                    # Public API entry (7 exports)
    client/
      types.ts                  # ClientConfig, GenerateResult, DriveConfig
      transport.ts              # Authenticated fetch → SdkTransport
      prepare.ts                # Validate input, build payload, parse result
      drive.ts                  # Drive folder management + file saving
      index.ts                  # createClient() factory
    core/
      types.ts                  # ModelDefinition, ParamConfig, GenerationContext
      workflow.ts               # Generic polling/execution engine
      contracts.ts              # Runtime input validation
      schema.ts                 # ParamConfig → JSON Schema
      response.ts               # Vendor-agnostic result extraction
      pricing.ts                # ToolId resolution
      model-registry.ts         # Model lookup indexes
      providers.ts              # Provider colors, labels, names
      voices.ts                 # Voice catalogs (ElevenLabs, OpenAI, Gemini)
      helpers.ts                # Vendor utilities
    generated/
      model-constants.ts        # AUTO-GENERATED: Models object + 108 constants
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

See `src/vendors/catalog/imagen.ts` + `src/vendors/catalog/imagen.payloads.ts` for a working example.

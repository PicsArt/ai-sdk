/**
 * Max prompt length persisted in the Drive `aiSDKPayload` attribute.
 *
 * A Drive-side cap only — it never touches what is sent for generation. A
 * model that declares a `maxLength` is quoting what its vendor accepts, and
 * the whole prompt goes through to the vendor; this constant governs the
 * copy we store next to the result. It is a first cut only: the budget that
 * binds is `MAX_DRIVE_ATTRIBUTE_LENGTH`, measured on the serialized payload.
 *
 * Applied where the payload is assembled, so it holds on every path into
 * Drive — including the models that declare no `prompt` param at all
 * (upscalers, speech-to-speech, dubbing) and direct callers of
 * `buildGenerationAttributes`.
 */
export const MAX_DRIVE_PROMPT_LENGTH = 18_000;

/**
 * Cloud storage's cap on a single attribute value: a file create is refused
 * outright ("'attributes' attribute value must not exceed 20000 characters")
 * when `aiSDKPayload` is longer. It counts characters, not bytes: saved
 * payloads of up to 52k UTF-8 bytes exist, none above 20,000 characters.
 *
 * Measured on the JSON string, not the prompt. Escaping makes the two differ:
 * every newline, quote and backslash in the prompt serializes to two
 * characters, so an 18,000-character script can serialize past 20,000 on its
 * own (F17: JSON-in-prompt and multi-line scripts, 2026-09-13 to 09-29).
 */
export const MAX_DRIVE_ATTRIBUTE_LENGTH = 20_000;

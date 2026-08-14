/**
 * Max prompt length persisted in the Drive `aiSDKPayload` attribute.
 *
 * A Drive-side cap only — it never touches what is sent for generation. A
 * model that declares a `maxLength` is quoting what its vendor accepts, and
 * the whole prompt goes through to the vendor; this constant governs the
 * copy we store next to the result, whose attribute budget is 20k (the
 * remaining ~2k covers the other attributes and the rest of the payload).
 *
 * Applied where the payload is assembled, so it holds on every path into
 * Drive — including the models that declare no `prompt` param at all
 * (upscalers, speech-to-speech, dubbing) and direct callers of
 * `buildGenerationAttributes`.
 */
export const MAX_DRIVE_PROMPT_LENGTH = 18_000;

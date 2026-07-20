# Contributing to @picsart/ai-sdk

Thanks for your interest in `@picsart/ai-sdk`!

## How this repository works

This GitHub repository is a **published mirror** of Picsart's internal source of
truth. Each release is pushed here as a snapshot, and the package is published to
[npm](https://www.npmjs.com/package/@picsart/ai-sdk) from here with
[provenance](https://docs.npmjs.com/generating-provenance-statements).

Because development happens in Picsart's internal monorepo, **pull requests
opened here are not merged directly** — they're triaged and, when accepted,
re-applied internally and land in a subsequent release. That's normal; your
contribution is still credited.

## Reporting bugs & requesting features

Please [open an issue](https://github.com/PicsArt/ai-sdk/issues) with:

- the SDK version (`npm ls @picsart/ai-sdk`),
- a minimal reproduction,
- what you expected vs. what happened.

## Proposing changes

Small, focused PRs (typo fixes, docs, obvious bug fixes) are welcome and make the
internal re-apply easy. For anything larger, open an issue first so we can agree
on the approach before you invest time.

## Development

```bash
npm install
npm run typecheck
npm run test:unit
npm run bundle
```

Note that the end-to-end tests (`npm run test:e2e`) call Picsart's API gateway
and require credentials that are not part of this public mirror.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](./LICENSE).

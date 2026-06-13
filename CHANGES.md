# Changelog

## v2026.6.1

- fix: `types` now resolve correctly — declarations emit to `dist/lib.d.ts` instead of `dist/src/lib.d.ts`
- chore: stop shipping demo/test declarations and `favicon.ico` in the published package

## v2026.6.0

Warning: contains BREAKING CHANGES.

- feat: added step, defaultValue, and formatValue options
- feat: exported ControlKnobOptions type
- refactor: improved keyboard and ARIA support
- refactor: modernized dragging with Pointer Events
- refactor updated value text positioning/styling options
- chore: bumped deps

## 0.1.0 (2022-07-10)

- Fix: prevent page scrolling on mousewheel (thanks to @suterma for the contribution) (#10)
- Tooling: migrated package management to pnpm
- Tooling: migrated e2e tests to Playwright

## 0.0.1 (2022-02-27)

- Initial version

## Context

The repo is an Expo (SDK 57) / React Native 0.86 app in TypeScript (~115 `.ts`/`.tsx` files). There is no test framework: `package.json` has no `test` script and no testing devDependencies. The only test is `tests/demandas-disponiveis.test.cjs`, which hand-transpiles `services/demandaService.ts` via the `typescript` API and runs it in a `vm` sandbox with stubbed `require`/`fetch` — a workaround that doesn't scale and doesn't count toward coverage tooling.

Core logic lives in `services/` (fetch, token storage, CRUD clients), `utils/`, `constants/`, `hooks/`, and `contexts/`. Screens under `app/` are mostly routing/navigation wrappers.

## Goals / Non-Goals

**Goals:**
- One standard command (`npm test`) running unit tests with a mainstream, Expo-compatible framework.
- Coverage reporting with an enforced **80%** threshold (lines, statements, functions, branches).
- Tests for pure/business logic (`utils`, `constants`, `services`, `hooks`) with external boundaries mocked.
- Migrate the existing ad-hoc `.cjs` test into the framework.

**Non-Goals:**
- E2E / component snapshot testing (Detox, Maestro, RNTL screens) — out of scope for this change.
- 100% coverage; only the 80% gate.
- CI pipeline wiring (follow-up; local gate must pass first).
- Production code refactors beyond minimal testability seams if strictly required.

## Decisions

**1. Jest with `jest-expo` preset (vs Vitest, vs bare Jest + RN preset)**
- `jest-expo` is the Expo-recommended preset: it maps platform file extensions (`.ios.ts`, `.web.ts`), stubs native modules, and handles Expo imports out of the box — required since services import `expo-secure-store`, `expo-crypto`, etc.
- Vitest is faster but has weaker RN/Expo mocking ergonomics and no official Expo preset.
- Rationale: lowest configuration cost, best ecosystem fit for SDK 57.

**2. Babel transform via `babel-preset-expo` (vs ts-jest)**
- Matches how Metro already builds the app, so tests exercise the same transform pipeline. ts-jest would diverge from production transforms and slows runs with a second TS compile.
- TypeScript checking still happens through `tsc --noEmit` / `expo lint`, not the test run.

**3. Coverage scope via explicit `collectCoverageFrom`**
- Include: `utils/**`, `constants/**`, `services/**`, `hooks/**`, `contexts/**`, `components/**` (production `.ts`/`.tsx`, excluding `.web`/`.ios` variants and `*.d.ts`).
- Exclude: `app/**` route screens, `scripts/**`, config files. This makes the 80% threshold meaningful instead of being dominated by navigation shells that can't be unit-tested cheaply.
- `coverageThreshold.global = { lines: 80, statements: 80, functions: 80, branches: 80 }`.

**4. Test location: keep top-level `tests/` directory**
- Existing convention; tests named `<module>.test.ts`. Avoids polluting `src` with test files and keeps `collectCoverageFrom` globs simple.

**5. Mocking strategy**
- `fetch`: replace `global.fetch` with `jest.fn()` per test (services call `fetch` directly).
- `@react-native-async-storage/async-storage`: official in-repo mock (`/jest/mock`).
- `expo-secure-store`, `expo-crypto`: `jest.mock` with plain JS stubs.
- `@react-native-google-signin`, Firebase messaging: `jest.mock` module-level; never touch native code.
- Tokens/time: fake timers or injectable `Date.now()` mocks for `token-storage` expiry logic.

**6. Migrate `tests/demandas-disponiveis.test.cjs`**
- Rewrite assertions using Jest + the shared `fetch` mock helper; delete the transpile/`vm` hack. Coverage tooling then sees `demandaService.ts` as real covered code.

**Shared helper**: `tests/helpers/mock-fetch.ts` (and `mock-token.ts`) so each service test doesn't re-implement stubbing.

## Risks / Trade-offs

- [Expo preset drift on SDK upgrades] → Pin `jest-expo` to the SDK-matching version; upgrade in lockstep with `expo`.
- [Native modules crash under Jest] → `jest-expo` handles most; otherwise add targeted `jest.mock` in `jest.setup.ts`.
- [80% gate unreachable if scope too wide] → Scope globs to testable modules (Decision 3); measure baseline early and adjust test order, not the threshold.
- [Babel vs TS type errors missed in tests] → Keep `tsc`/lint as the type gate; tests don't replace it.
- [Mock drift from real API behavior] → Keep mocks minimal (status codes, JSON bodies); integration/E2E is explicitly out of scope.

## Migration Plan

1. Add devDeps + config; verify `npm test` runs a smoke test green.
2. Add coverage config; run coverage to capture baseline percentage.
3. Add tests module-by-module (`utils` → `constants` → `services` → `hooks`) until thresholds pass.
4. Port and delete the legacy `.cjs` test.
5. Rollback = revert the branch; no production behavior changes, so no data/deploy risk.

## Open Questions

- None blocking. Optional follow-up: wire `npm run test:coverage` into CI.

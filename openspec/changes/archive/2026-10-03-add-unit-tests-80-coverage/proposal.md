## Why

The project has ~115 TypeScript source files but no test framework, no `test` script, and only one ad-hoc `node --test` file that transpiles a service at runtime. Refactors (like the ongoing design-system work) and API/service changes ship without automated verification, making regressions likely and coverage unknown.

## What Changes

- Install and configure a unit test framework (Jest + ts-jest or Jest with babel-jest, Expo-compatible preset) with coverage reporting.
- Add a `test` script (`npm test`) and a `test:coverage` script (`npm run test:coverage`) to `package.json`.
- Configure coverage thresholds enforced at **80%** for lines, statements, functions, and branches across production source files.
- Write unit tests for pure logic first: `utils/`, `constants/`, `services/` (fetch/token/storage logic), and `hooks/`, using mocks for `fetch`, AsyncStorage, and Expo modules.
- Port the existing ad-hoc `tests/demandas-disponiveis.test.cjs` into the new framework (removing the transpile/vm hack).
- Exclude non-unit-testable files (route screens, platform variants, config) from coverage collection via explicit `collectCoverageFrom` globs so the threshold reflects meaningful code.

## Capabilities

### New Capabilities
- `unit-testing`: Test framework setup, test execution commands, mock conventions, and the enforced 80% coverage threshold for the codebase.

### Modified Capabilities

(none - no existing spec-level behavior changes)

## Impact

- **Dependencies (dev)**: adds Jest, ts-jest/babel-jest, `@types/jest` (or vitest equivalents), and an Expo/RN test preset.
- **Files**: `package.json` (scripts + devDeps), new `jest.config.*`/`jest.setup.*`, new test files under `tests/` (or `__tests__/`), removal/replacement of `tests/demandas-disponiveis.test.cjs`.
- **CI**: coverage gate can be enforced later in CI via `npm run test:coverage`.
- **No production code changes** required, except minimal testability seams if any service hard-codes unmockable globals (avoided where possible).

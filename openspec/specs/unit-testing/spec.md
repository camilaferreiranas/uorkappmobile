# Capability: unit-testing

## Purpose

Configured, offline-capable unit testing for core app logic with enforced 80% coverage across the production source scope. TBD details as the project evolves.

## Requirements

### Requirement: Test framework configured and runnable
The project SHALL provide a unit test framework configured for Expo/React Native, runnable via `npm test`, executing all test files matching the project's test glob without requiring network access or a device/emulator.

#### Scenario: Running the test suite
- **WHEN** a developer runs `npm test`
- **THEN** Jest discovers and runs all unit test files under `tests/` and reports pass/fail without errors in configuration or module resolution

#### Scenario: TypeScript and platform modules resolve
- **WHEN** a test imports a TypeScript module that uses Expo or React Native platform-specific imports
- **THEN** the module resolves and executes using the Expo-compatible Jest preset and Babel transform, matching production build behavior

### Requirement: Coverage reporting with enforced 80% threshold
The project SHALL provide a `npm run test:coverage` command that produces a coverage report and SHALL enforce a minimum threshold of 80% for lines, statements, functions, and branches across the configured production source scope; the command MUST exit non-zero when any metric falls below 80%.

#### Scenario: Coverage meets the threshold
- **WHEN** `npm run test:coverage` is executed and all metrics in scope are at or above 80%
- **THEN** the command exits successfully with a coverage report showing each metric at or above 80%

#### Scenario: Coverage falls below the threshold
- **WHEN** `npm run test:coverage` is executed and any metric in scope is below 80%
- **THEN** the command exits with a non-zero status identifying the failing metric

#### Scenario: Coverage scope excludes non-unit-testable files
- **WHEN** the coverage report is generated
- **THEN** route screens under `app/`, scripts, and configuration files are excluded from the coverage scope, while `utils/`, `constants/`, `services/`, `hooks/`, `contexts/`, and `components/` production files are included

### Requirement: Unit tests cover core logic
The project SHALL contain unit tests for the core business logic — at minimum `utils/`, `constants/`, `services/`, and `hooks/` modules — asserting behavior for success paths, error/failure paths, and edge cases, with external boundaries (network, secure storage, async storage, native SDKs) mocked so tests run offline.

#### Scenario: Service success path is verified
- **WHEN** a service function performs a successful request
- **THEN** a test asserts the returned data and the request made (URL, method, headers/body as applicable) using a mocked `fetch`

#### Scenario: Service failure path is verified
- **WHEN** a service function receives a non-2xx status, invalid JSON, or a network error
- **THEN** a test asserts the documented error behavior (thrown error or returned error shape)

#### Scenario: Tests run offline
- **WHEN** the test suite runs with no network available
- **THEN** all tests pass because external dependencies are mocked

### Requirement: Legacy ad-hoc test migrated
The legacy `tests/demandas-disponiveis.test.cjs` test SHALL be rewritten as a framework-native test with equivalent assertions, and the hand-transpilation/`vm`-sandbox workaround SHALL be removed.

#### Scenario: Equivalent coverage after migration
- **WHEN** the migrated test runs under the new framework
- **THEN** it asserts the same `demandaService` behaviors as the legacy test and `demandaService.ts` is counted in the coverage report

#### Scenario: Legacy workaround removed
- **WHEN** the migration is complete
- **THEN** `tests/demandas-disponiveis.test.cjs` no longer exists and no test uses runtime TS transpilation or `vm` sandboxes

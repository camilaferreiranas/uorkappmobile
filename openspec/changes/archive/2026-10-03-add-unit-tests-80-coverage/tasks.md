## 1. Framework setup

- [x] 1.1 Install devDependencies: `jest`, `jest-expo`, `babel-jest`, `@babel/core`, `@types/jest` (versions matching Expo SDK 57)
- [x] 1.2 Create `jest.config.js` with `preset: 'jest-expo'`, `testMatch` for `tests/**/*.test.ts`, `collectCoverageFrom` globs (utils/constants/services/hooks/contexts/components, excluding `.web`/`.ios` variants, `app/`, `scripts/`), and global `coverageThreshold` at 80% for lines/statements/functions/branches
- [x] 1.3 Create `jest.setup.ts` registering global mocks (AsyncStorage official mock, expo-secure-store, expo-crypto, Google Sign-In, Firebase messaging) and a `fetch` stub default
- [x] 1.4 Add `"test": "jest"` and `"test:coverage": "jest --coverage"` scripts to `package.json`
- [x] 1.5 Add a smoke test (`tests/smoke.test.ts`) and verify `npm test` passes

## 2. Shared test helpers

- [x] 2.1 Create `tests/helpers/mock-fetch.ts` to stub `global.fetch`, record calls, and return status/body fixtures
- [x] 2.2 Create `tests/helpers/mock-token.ts` for token-storage fixtures (valid/expired/missing token)
- [x] 2.3 Verify helpers compile under the Jest/Babel pipeline (no TS runtime transpile)

## 3. Unit tests — utils and constants

- [x] 3.1 Tests for `utils/get-initials.ts` (edge cases: empty, unicode, whitespace)
- [x] 3.2 Tests for `utils/validar-telefone.ts` (valid/invalid formats, boundaries)
- [x] 3.3 Tests for `constants/theme.ts` and `constants/env.ts` (exported shapes, env gating)

## 4. Unit tests — services

- [x] 4.1 Tests for `services/token-storage.ts` (store/read/refresh/expiry logic, secure-store failures)
- [x] 4.2 Tests for `services/request.ts` and `services/api.ts` (headers, auth injection, error handling)
- [x] 4.3 Tests for `services/demandaService.ts` (success, non-2xx, invalid JSON, network error)
- [x] 4.4 Tests for `services/propostaService.ts` and `services/prestadorService.ts`
- [x] 4.5 Tests for `services/userService.ts`, `services/categoriaService.ts`, `services/locationService.ts`
- [x] 4.6 Tests for `services/storageService.ts` and `services/notificacaoService.ts`

## 5. Unit tests — hooks and contexts

- [x] 5.1 Tests for `hooks/use-demandas-disponiveis.ts` (loading/success/error states, refetch)
- [x] 5.2 Tests for `hooks/useGoogleAuth.ts` / `useGoogleLogin.ts` with mocked Google SDK (skip `.web` variants)
- [x] 5.3 Tests for `contexts/auth-context.tsx` provider logic with mocked services

## 6. Legacy test migration

- [x] 6.1 Rewrite `tests/demandas-disponiveis.test.cjs` assertions as `tests/demanda-service.test.ts` using shared fetch mock helper
- [x] 6.2 Delete `tests/demandas-disponiveis.test.cjs` and remove the transpile/`vm` workaround

## 7. Coverage gate and verification

- [x] 7.1 Run `npm run test:coverage` and record baseline percentages per metric
- [x] 7.2 Add/extend tests until lines, statements, functions, and branches are all ≥ 80% within configured scope
- [x] 7.3 Verify non-zero exit when threshold is deliberately missed (sanity check of `coverageThreshold`)
- [x] 7.4 Run `npm run lint` and `npx tsc --noEmit` to confirm no regressions
- [x] 7.5 Update `.gitignore` for `coverage/` output

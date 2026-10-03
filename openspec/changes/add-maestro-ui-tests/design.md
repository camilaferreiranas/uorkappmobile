## Context

The app is a React Native + Expo SDK 57 project using Expo Router (file-based navigation), TypeScript, and Jest for unit tests (`tests/`, 80% coverage threshold). There is no e2e/UI test tooling: no Detox/Appium/Maestro, no `.maestro/` directory, no `e2e` npm script, and no CI workflows. The UI currently has zero `testID` props (46 `accessibilityLabel`s exist). Native `android/`/`ios/` folders are gitignored and generated on demand via `expo prebuild`/`expo run:*` (app id `br.com.uork`). Only one active spec exists (`user-session`), and unit-test/design-system changes follow the same OpenSpec spec-driven pattern.

## Goals / Non-Goals

**Goals:**
- Establish Maestro as the UI/e2e test framework with a `.maestro/` flows directory and npm scripts to run it locally.
- Define a stable selector convention (`testID`) and apply it to critical screens.
- Ship an initial flow suite covering: app launch, login (success + failure), and a core browse/view journey.
- Make runs repeatable via documented test data (test account) and app build steps.

**Non-Goals:**
- CI integration (no CI exists yet; this change prepares for it but does not add workflows).
- Full regression coverage of all 35 screens — only critical journeys initially.
- Visual/snapshot testing, performance testing, or device-farm execution.
- Modifying any app behavior or `user-session` requirements.

## Decisions

**1. Maestro over Detox/Appium**
- Alternatives: Detox (compile-time sync, requires native project wiring), Appium (heavier, client-server, slower setup).
- Maestro chosen: YAML flows, no app code instrumentation, works with Expo dev/preview builds, resilient auto-waiting, single CLI install. Fits a team that wants fast e2e onboarding without maintaining native test drivers.

**2. Selector strategy: `testID` primary, text as fallback**
- Maestro selects via `id:` (maps to native `testID`) — stable across copy edits and locales.
- `accessibilityLabel` reused where it already matches intent; new `testID`s added only to screens in scope (login, signup, home/tabs, publish-demand, search, profile).
- Alternatives: text-only selectors (brittle to copy changes), accessibility IDs everywhere (overloads a11y). Convention: snake_case testIDs, e.g. `id: login-email-input`.

**3. Flow organization: `.maestro/` with subfolders + tags**
```
.maestro/
  config.yaml            # tags, env defaults
  smoke/launch.yaml
  auth/login-success.yaml
  auth/login-failure.yaml
  demands/view-demand-list.yaml
```
- Flows tagged `smoke` vs `regression` so `maestro test .maestro --tags smoke` gives a fast suite.

**4. App delivery for tests: local dev build, not Expo Go**
- Maestro drives a real installed app. Use `npx expo run:android` / `run:ios` to generate native folders and install the binary (app id `br.com.uork`). Expo Go is rejected because e2e flows need stable deep links and full native plugin behavior.
- npm scripts wrap the common paths: `e2e` (run suite against connected device/emulator), `e2e:android`, `e2e:ios`.

**5. Test data: dedicated seeded test account via env**
- Flows depend on a known account (credentials via `MAESTRO_*` env vars or a gitignored `.env.e2e`), avoiding writes to real user data. Backend availability is assumed; flows fail fast with clear errors when unreachable.
- State-mutating actions (publish demand) deferred to later flows; initial suite prefers read-only journeys where possible.

**6. Jest and Maestro coexist**
- Separate runners: `npm test` (unit) vs `npm run e2e` (UI). No overlap in directories (`tests/` vs `.maestro/`), so no config conflicts.

## Risks / Trade-offs

- [Missing `testID`s make flows brittle initially] → Add testIDs screen-by-screen as flows are written; convention documented in the spec.
- [Flows depend on live backend + seeded account] → Document required env/test data; keep smoke suite read-only; clear failure messages.
- [Native builds may fail without `google-services.json` / `GoogleService-Info.plist`] → Document required config files in setup steps; Firebase flows not part of initial suite.
- [No CI yet → tests only run when someone runs them locally] → Non-goal; npm scripts and tag structure are CI-ready for a follow-up change.
- [Animation/timing flakiness] → Maestro auto-waits; use `extendedWaitUntil` on slow screens; tag slow flows `regression`.
- [Generated native folders not committed] → Flows must not assume checked-out `android/`/`ios/`; build step documented per run.

## Migration Plan

1. Add tooling/scripts and `.maestro/` scaffold (no app code changes) — safe, additive.
2. Add `testID`s incrementally alongside each flow — additive, no behavior change.
3. Run full smoke suite locally before marking change complete.

Rollback: delete `.maestro/`, revert `package.json` scripts and `testID` additions; no runtime impact.

## Open Questions

- Which backend environment should e2e target (staging vs production-like)? Pending env availability.
- Should the seeded test account be created via a seed script or manually maintained? (Decide during implementation.)
- Firebase config files: will contributors get them for local native builds, or should Firebase plugins be disabled in a test build profile?

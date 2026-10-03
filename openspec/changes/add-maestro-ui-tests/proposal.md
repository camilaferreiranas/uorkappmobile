## Why

The app only has Jest unit tests; no automated verification exists for critical user journeys (login, signup, publishing a demand, browsing/searching). Regressions in navigation, forms, and auth flows can ship unnoticed. Adding Maestro UI tests gives fast, YAML-based end-to-end coverage that runs on emulators/simulators and can later plug into CI.

## What Changes

- Add a Maestro e2e test setup: `.maestro/` flows directory, npm scripts (`e2e`, `e2e:android`, `e2e:ios`), and documented execution steps.
- Introduce stable selectors by adding `testID` props (and consistent `accessibilityLabel`s where needed) to key screens: login, signup, home/tabs, publish-demand, search, profile.
- Create initial Maestro flows for critical journeys: app launch/splash, authentication (login success/failure), and a core professional flow (browse/view demands).
- Add seed/test-data guidance so flows are repeatable (test accounts, API environment).
- Document how to run tests locally (build app via `expo run:android` / `expo run:ios`, then `maestro test`).

## Capabilities

### New Capabilities
- `ui-testing`: Maestro-based end-to-end UI test capability — flow organization, selector conventions (`testID` strategy), npm scripts for running suites, and required test data for deterministic runs.

### Modified Capabilities
<!-- No existing spec requirements change; user-session behavior is untouched. -->

## Impact

- **Code**: `testID` additions across `app/` screens (login, signup, home, publish-demand, search, profile) and some `components/` — non-breaking, no behavior change.
- **New files**: `.maestro/` directory with flows, `docs`/README section for running e2e, npm scripts in `package.json`.
- **Dependencies**: Maestro CLI (external machine-level install, not an npm dep); no new runtime app dependencies.
- **Native builds**: requires generated `android/`/`ios/` folders (`npx expo run:android|ios`); app id `br.com.uork`.
- **Existing tests**: Jest unit suite unaffected.

## 1. Setup & Tooling

- [x] 1.1 Add npm scripts to `package.json`: `e2e`, `e2e:android`, `e2e:ios` invoking the Maestro CLI
- [x] 1.2 Create `.maestro/config.yaml` with default tags/settings (smoke/regression conventions)
- [x] 1.3 Document local setup in README (Maestro CLI install, `npx expo run:android|ios` build, app id `br.com.uork`, env vars for test credentials)

## 2. Selectors (testIDs)

- [x] 2.1 Add `testID`s to login screen (email input, password input, submit button, error message)
- [x] 2.2 Add `testID`s to signup screen (inputs, submit button)
- [x] 2.3 Add `testID`s to tab layout / home screen (tab bar items, key home elements)
- [x] 2.4 Add `testID`s to publish-demand screen (form inputs, submit button)
- [x] 2.5 Add `testID`s to search screen (search input, results list)
- [x] 2.6 Add `testID`s to profile screen (key elements)
- [x] 2.7 Verify snake_case convention (`<screen>-<element>-<kind>`) across all added testIDs

## 3. Maestro Flows

- [x] 3.1 Create `.maestro/smoke/launch.yaml` — app launches and root/main screen renders (tag: `smoke`)
- [x] 3.2 Create `.maestro/auth/login-success.yaml` — valid credentials redirect to home (tags: `smoke`, `auth`)
- [x] 3.3 Create `.maestro/auth/login-failure.yaml` — invalid credentials stay on login with error shown (tags: `regression`, `auth`)
- [x] 3.4 Create `.maestro/demands/view-demand-list.yaml` — authenticated user opens demands view, sees list or empty state (tags: `regression`, `demands`)
- [x] 3.5 Wire test credentials via environment variables/gitignored `.env.e2e` (no hardcoded secrets in YAML)

## 4. Validation

- [ ] 4.1 Build and install the app (`npx expo run:android` or `run:ios`) on emulator/simulator
- [ ] 4.2 Run `maestro test .maestro --tags smoke` and confirm all smoke flows pass
- [ ] 4.3 Run `npm run e2e` and confirm full suite passes with non-zero exit on failure
- [x] 4.4 Run `npm test` to confirm Jest unit suite is unaffected
- [x] 4.5 Run `npm run lint` to confirm no lint regressions from testID additions

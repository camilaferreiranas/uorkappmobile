## ADDED Requirements

### Requirement: Maestro UI test suite structure
The repository SHALL contain a `.maestro/` directory holding Maestro flow YAML files organized by journey (e.g., `smoke/`, `auth/`, `demands/`), with a `config.yaml` defining default tags/settings.

#### Scenario: Flows live in the standard location
- **WHEN** a developer clones the repository and inspects the root
- **THEN** a `.maestro/` directory exists containing `config.yaml` and at least one flow file per critical journey category (`smoke/`, `auth/`, `demands/`)

#### Scenario: Flows are tagged by execution tier
- **WHEN** flows declare tags in their metadata
- **THEN** the launch/smoke flows are tagged `smoke` and longer journeys are tagged `regression`, so `maestro test .maestro --include-tags=smoke` runs only the fast suite

### Requirement: Stable selectors for critical screens
All screens in UI test scope (login, signup, home/tabs, publish-demand, search, profile) SHALL expose `testID` props on their interactive elements (inputs, buttons, key lists), following a snake_case naming convention (e.g., `login-email-input`, `login-submit-button`).

#### Scenario: Login screen is selectable by testID
- **WHEN** the login screen renders
- **THEN** the email input, password input, and submit button each have a `testID` that Maestro can target with `id:` selectors

#### Scenario: testID naming is consistent
- **WHEN** a new `testID` is added to a screen in scope
- **THEN** it follows the `<screen>-<element>-<kind>` snake_case convention (e.g., `signup-submit-button`)

### Requirement: Suite execution via npm scripts
`package.json` SHALL provide npm scripts to run the Maestro suite against a connected device/emulator, including a generic `e2e` script plus platform-specific entry points.

#### Scenario: Running the full suite
- **WHEN** a developer runs `npm run e2e` with a device/emulator connected and the app installed
- **THEN** all flows under `.maestro/` execute and the command exits non-zero if any flow fails

#### Scenario: Platform-specific runs
- **WHEN** a developer runs `npm run e2e:android` (or `e2e:ios`)
- **THEN** the suite executes against the app installed on the Android (or iOS) target

### Requirement: Documented local setup and test data
The repository documentation SHALL describe how to build/install the app for e2e (`npx expo run:android|ios`, app id `br.com.uork`) and which test account/environment variables flows depend on.

#### Scenario: Setup steps are documented
- **WHEN** a developer reads the e2e section of the documentation
- **THEN** it lists the commands to generate/install the native build, the required Maestro CLI installation, and the test credentials/env vars needed by flows

#### Scenario: Test credentials are not committed
- **WHEN** test account credentials are referenced by flows
- **THEN** they are read from environment variables or a gitignored file, never hardcoded in committed YAML

### Requirement: Critical journey coverage
The initial suite SHALL cover: app launch reaching the initial screen, successful login redirecting to home, failed login displaying an error, and a read-only journey that opens the demand list/details.

#### Scenario: Launch flow
- **WHEN** the smoke launch flow runs on a fresh app start
- **THEN** it verifies the root screen loads and navigation to the main authenticated (or login) screen succeeds

#### Scenario: Successful login flow
- **WHEN** the login-success flow runs with valid test credentials
- **THEN** submitting the form navigates the user to the home screen

#### Scenario: Failed login flow
- **WHEN** the login-failure flow runs with invalid credentials
- **THEN** the app remains on the login screen and displays an error message

#### Scenario: Demand browsing flow
- **WHEN** the demand list flow runs for an authenticated test account
- **THEN** the user can navigate to the demands view and at least one demand entry (or empty state) is displayed

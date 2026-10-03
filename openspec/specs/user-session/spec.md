# Capability: user-session

## Purpose

Resilient mobile session handling — login/logout/restore that tolerates transient profile failures and auto-establishes a session on signup. TBD details as the product evolves.

## Requirements

### Requirement: Login succeeds even if profile loading fails
The system SHALL establish a session (save the access token) before attempting to load the user profile. If profile loading then fails, the login MUST still complete with `user` set to null rather than throwing an error.

#### Scenario: Profile endpoint returns error during login
- **WHEN** a user logs in and `POST /login` succeeds but `GET /usuario/perfil` fails
- **THEN** the token is saved, the login call resolves without error, and `user` is null

#### Scenario: Full successful login with profile
- **WHEN** a user logs in and both the token request and profile request succeed
- **THEN** the token is saved, `user` is set to the loaded profile, and login resolves without error

### Requirement: Session survives profile load failure on app restart
The system SHALL preserve a valid stored token when `restoreSession` fails to load the profile; only an expired or missing token MUST clear the session.

#### Scenario: Valid token but profile load fails on startup
- **WHEN** the app restarts with a valid token and the profile request fails
- **THEN** the token remains stored and the app is treated as logged in (retrying the profile later)

#### Scenario: Valid profile load on startup
- **WHEN** the app restarts with a valid token and the profile request succeeds
- **THEN** `user` is set from the profile and the session is restored

### Requirement: Auto-session after successful signup
The system SHALL establish a session automatically after a user registers with email/password, so the new account is authenticated without a manual second login.

#### Scenario: Signup succeeds
- **WHEN** a user completes the signup form and the registration API succeeds
- **THEN** the app performs the login flow with the newly registered credentials and navigates to the authenticated area
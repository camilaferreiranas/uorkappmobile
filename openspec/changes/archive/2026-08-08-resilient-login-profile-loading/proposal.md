## Why

The mobile app currently treats a profile-fetch failure as a login failure: `AuthContext.login()` chains `saveToken` → `getUserProfile`, and if the profile request errors — as it does today for freshly registered accounts (backend NPE, fixed separately) — the whole login throws and the user is blocked, even though credentials are valid. Additionally, signup never establishes a session, so a brand-new account has no token stored and must be signed in again manually.

## What Changes

- Make login resilient: `AuthContext.login` and `loginWithGoogle` store the token first, then attempt to load the profile, and **do not fail** the login when profile-loading fails — the session is kept, `user` stays `null`, and the app can retry the profile later.
- Make `restoreSession` tolerant: on app start, a profile-load error must not wipe a valid token; the session survives and profile loads are retried.
- **(small) after successful signup, auto-login**: `SignupScreen.handleSignup` calls the auth `login` flow with the just-registered credentials so the new account is immediately authenticated, instead of navigating to `/home` with no session.
- No API contract changes; only client-side error handling and session flow.

## Capabilities

### New Capabilities
- `user-session`: Resilient mobile session handling — login/logout/restore that tolerates transient profile failures and auto-establishes a session on signup.

### Modified Capabilities
<!-- No existing specs in this repo; all listed above are new. -->

## Impact

- Mobile code: `contexts/auth-context.tsx` (`login`, `loginWithGoogle`, `restoreSession`), `app/signup/index.tsx` (`handleSignup`).
- Behavior: login never hard-fails on profile load error; signup now logs the user in automatically.
- Dependency: relies on the backend change `fix-user-profile-endereco-null` to make profile loads succeed for fresh accounts going forward.
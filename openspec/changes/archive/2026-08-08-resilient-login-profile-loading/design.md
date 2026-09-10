## Context

`contexts/auth-context.tsx` wraps the whole authentication state of the app. Its `login`/`loginWithGoogle` methods call `loadProfile`, which saves the token then loads the user profile; a profile failure propagates up and fails login. `restoreSession` clears the token on any error. `SignupScreen` saves nothing and navigates to `/home` directly, so a new account has no session. The bug in the backend (fixed in change `fix-user-profile-endereco-null`) was making profile loads fail for new accounts; this change makes the client resilient regardless.

## Goals / Non-Goals

**Goals:**
- Token is saved before profile loading in login paths.
- Profile-load failures never fail login or wipe a valid session.
- Signup auto-establishes a session.

**Non-Goals:**
- Changing the API contract or token storage format.
- Adding retry/backoff or automatic profile recovery UI.
- Changing the backend (handled separately).

## Decisions

**D1 — Reorder work inside `login`/`loginWithGoogle`.**
Split the current `loadProfile` into two steps: (1) `await saveToken(...)`, (2) `try { user = await getUserProfile(...) } catch { user = null }`. Login resolves after (1), the profile being best effort. This is a local behavior change only.
- Alternative: keep login strict and only fix the backend. Rejected: leaves the app fragile to any transient profile failure.

**D2 — Separate "authenticated" state from profile loading in `restoreSession`.**
Check token validity first and set the session as active even if the profile request throws; only clear the token when the stored one is missing/expired. `user` becomes a separate concern that the UI can react to (e.g., show "Visitante" until loaded).

**D3 — Reuse auth context for signup.**
`SignupScreen.handleSignup` should, after the registration API succeeds, call `login(email, senha)` from `useAuth()` (which now stores the token) and then navigate to `/home`. This both fixes the current no-session state and reuses the one source of truth for sessions.
- Alternative: have the backend return a token with user creation — rejected: that's a backend contract change and is out of scope; the /login endpoint already exists for this.

## Risks / Trade-offs

- [Login may succeed but user stays null, showing "visitante" UI] → deterministic; the screens already handle `user == null` gracefully (`perfil` shows "Visitante", `home` falls back to AsyncStorage name).
- [Feels like the login "succeeded" when profile broke] → this is intentional resilience; the data surfaces when the backend recovers, and the backend fix removes the lasting root cause.
- [Signup auto-login fetches profile right after backend fix] → once backend null-safety ships, this path succeeds; until then it degrades to token-only which is exactly what the change intends.

## Migration Plan

Deploy backend change `fix-user-profile-endereco-null` and mobile change together. The mobile change is safe standalone: it only changes error semantics on the client. Rollback: revert `auth-context.tsx` and `signup/index.tsx`; no data migration.
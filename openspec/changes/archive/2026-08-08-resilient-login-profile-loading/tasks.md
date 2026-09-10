## 1. Resilient login and session restore

- [x] 1.1 Refactor `loadProfile` in `auth-context.tsx` so `saveToken` runs first and is awaited before any profile fetch
- [x] 1.2 In `login`, await `saveToken` and then attempt `getUserProfile` in a try/catch that sets `user` to the profile or null, resolving the login in both cases
- [x] 1.3 Apply the same tolerant pattern to `loginWithGoogle`
- [x] 1.4 Update `restoreSession` so a profile-fetch error leaves the valid token stored and sets `user` to null instead of clearing the session; clear the token only when it is missing or expired

## 2. Auto-session after signup

- [x] 2.1 In `app/signup/index.tsx`, wire `useAuth()` and call `login(email, senha)` after `createUser` succeeds
- [x] 2.2 Handle failures: on login error after successful registration, still navigate to the authenticated area with the saved token or surface the message if the token could not be stored — login now only throws on token-storage failure; that error surfaces via the existing submitError path
- [x] 2.3 Remove the now-redundant `router.replace("/home")`-only path so the signup always funnels through the auth flow

## 3. Verification

- [ ] 3.1 Register a new account and confirm it lands in the authenticated area without a manual second login — requires live app + backend on LAN
- [ ] 3.2 Simulate a profile-load failure (e.g., temporarily break `getUserProfile`) and confirm login still succeeds with `user` null — requires live app on LAN
- [ ] 3.3 On app restart with a valid token, confirm the session is preserved even when the profile request fails — requires live app on LAN
- [x] 3.4 Run `npm run lint` and typecheck (`tsc --noEmit`) passing
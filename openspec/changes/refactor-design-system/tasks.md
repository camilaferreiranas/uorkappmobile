## 1. Token foundation

- [x] 1.1 Rewrite `constants/theme.ts`: `Colors` values updated to `design.md` §3 (primary `#2563EB`, ink `#0F172A`, background `#F1F5F9`, primaryLight, textSecondary, border, success, warning, error, accent), keeping existing token names where a direct mapping exists.
- [x] 1.2 Add `Spacing` export matching `design.md` §5 (4/8/12/16/20/24/32/40/48/64/80).
- [x] 1.3 Add `Radius` export matching `design.md` §6 (`sm: 8`, `md: 12`, `lg: 16`).
- [x] 1.4 Add `Typography` export (weights/sizes/line-heights) matching `design.md` §4's Display/H1/H2/H3/Body/Small/Button/Price scale.
- [x] 1.5 Update `Colors.light`/`Colors.dark` tint/icon values for consistency with the new primary (no expansion of dark-mode coverage).
- [x] 1.6 Add a shared `getStatusColor(status)` helper (in `constants/theme.ts` or a new small util) mapping request/proposal states to `{ color, background }` using the semantic tokens.

## 2. Shared UI primitives (`components/ui/`)

- [x] 2.1 `button.tsx`: implement primary/secondary/ghost/destructive variants per `design.md` §7; verify ~44px min touch target.
- [x] 2.2 `card.tsx`: radius `md`, white/surface background, `border` token, 16–24px padding per `design.md` §6/§9.
- [x] 2.3 `input.tsx`: label/input/helper structure, 44–48px height, visible focus state per `design.md` §8.
- [x] 2.4 `service-card.tsx`: apply card rules + `design.md` §9 visual hierarchy (name → price → rating → provider → metadata → description).
- [x] 2.5 `professional-card.tsx`, `demand-card.tsx`, `metric-card.tsx`, `review-card.tsx`, `category-card.tsx`: replace hardcoded hex/px with tokens.
- [x] 2.6 `select.tsx`, `pill-group.tsx`, `star-rating.tsx`: replace hardcoded hex/px with tokens; pill-group used for filter chips per `design.md` §11.
- [x] 2.7 `section-header.tsx`, `auth-header.tsx`, `profile-screen-header.tsx`, `profile-avatar.tsx`, `screen-container.tsx`, `professional-nav-bar.tsx`, `success-message.tsx`: replace hardcoded hex/px with tokens.
- [x] 2.8 `components/themed-text.tsx` and `hooks/use-theme-color.ts`: verify against new `Colors`/`Typography` tokens.

## 3. Screen sweep — auth & entry

- [x] 3.1 `app/index.tsx`, `app/_layout.tsx`: token sweep.
- [x] 3.2 `app/login/index.tsx`, `app/signup/index.tsx`: token sweep.
- [x] 3.3 `app/forgot-password/index.tsx`, `app/reset-password/index.tsx`: token sweep.
- [ ] 3.4 Manually verify auth flow in the running app (login, signup, forgot/reset password) after this group.

## 4. Screen sweep — tabs & discovery

- [x] 4.1 `app/(tabs)/_layout.tsx`, `app/(tabs)/home/index.tsx`, `app/(tabs)/explore/index.tsx`, `app/(tabs)/publicar/index.tsx`, `app/(tabs)/perfil/index.tsx`: token sweep.
- [x] 4.2 `app/search/index.tsx`, `app/category-providers/index.tsx`, `app/nearby-professionals.tsx`, `app/address.tsx`: token sweep.
- [ ] 4.3 Manually verify home, tab navigation, search, and category/nearby-professionals screens after this group.

## 5. Screen sweep — demand & proposal flows

- [x] 5.1 `app/publish-demand/index.tsx`, `app/my-demands/index.tsx`, `app/demand-details/index.tsx`, `app/available-demand-details/index.tsx`: token sweep; apply `getStatusColor` to any status pill.
- [x] 5.2 `app/demand-candidates/index.tsx`, `app/send-proposal/index.tsx`, `app/my-proposals/index.tsx`: token sweep; apply `getStatusColor` to any status pill.
- [x] 5.3 `app/client-history.tsx`, `app/client-notifications.tsx`: token sweep; apply `getStatusColor` where relevant.
- [ ] 5.4 Manually verify demand creation, my-demands list, demand details, candidates, send-proposal, and my-proposals screens, checking status colors match across customer views.

## 6. Screen sweep — provider flows

- [x] 6.1 `app/professional-home/index.tsx`, `app/professional-registration/index.tsx`: token sweep.
- [x] 6.2 `app/professional-demands/index.tsx`, `app/professional-notifications.tsx`, `app/professional-report/index.tsx`: token sweep; apply `getStatusColor` to any status pill.
- [x] 6.3 `app/professional-profile/index.tsx`: token sweep against `design.md` §10 provider profile layout.
- [ ] 6.4 Manually verify provider home, registration, demands/notifications, report, and profile screens, checking the same status renders identically to its customer-side counterpart.

## 7. Screen sweep — profile & misc

- [x] 7.1 `app/profile/index.tsx`, `app/edit-profile/index.tsx`: token sweep.
- [x] 7.2 `app/review/index.tsx`, `app/modal/index.tsx`: token sweep.
- [ ] 7.3 Manually verify profile view/edit and review screens.

## 8. Final verification

- [x] 8.1 Grep `app/` and `components/` for remaining raw hex literals (`#[0-9A-Fa-f]{6}`) outside `constants/theme.ts`; resolve or consciously justify any that remain.
- [x] 8.2 Run lint (`expo lint`) and confirm no new errors.
- [ ] 8.3 Full manual pass through customer journey (discover → trust → compare → request → track) and provider journey (profile → publish → receive → respond) in the running app, confirming visual consistency and no regressions.
- [x] 8.4 Confirm no accessibility regressions: focus states visible, status never conveyed by color alone, touch targets ~44px.

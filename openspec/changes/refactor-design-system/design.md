## Context

The app (`uorkappmobile`, Expo/React Native 0.81 + expo-router, no Tailwind/NativeWind) currently themes itself from `constants/theme.ts` (`Colors`, `Fonts`), which is orange-based (`primary: #E75A2B`) and only covers a handful of tokens (no spacing/radius/typography scale). 44 files already import `constants/theme`; beyond that, screens and `components/ui/*` hardcode roughly 30+ distinct hex values directly in `StyleSheet.create` calls (some, like `#0D3D8B`, appear 70+ times — evidence of copy-pasted styles rather than shared tokens).

`/design.md` at the repo root is the newly-written source of truth for visual identity: blue primary (`#2563EB`), a defined color/spacing/radius/typography system, button/card/input specs, and explicit component-architecture rules ("check for an existing component before creating one," "never hardcode a value when a token exists"). This change brings the codebase in line with that document.

## Goals / Non-Goals

**Goals:**
- One token module (`constants/theme.ts`, extended) that mirrors `design.md`'s color, spacing, radius, and typography tables exactly, importable from anywhere in the app.
- Every shared component in `components/ui/` consumes tokens instead of local hex/px literals.
- Screens under `app/**` that currently hardcode colors are swept to use tokens.
- Button, card, and input components match the variants/structure documented in `design.md` §7–9.
- Status/semantic colors (success/warning/error/accent) used for request and proposal states match `design.md` §14 and are always paired with text/icon, never color alone.
- Visual behavior otherwise unchanged: same screens, same navigation, same data flow.

**Non-Goals:**
- No new screens, no navigation changes, no business-logic changes.
- No adoption of Tailwind/NativeWind — `design.md`'s Tailwind-mapping note doesn't apply here; tokens are plain TS constants consumed via `StyleSheet.create`.
- No dark-mode redesign. `Colors.light`/`Colors.dark` stay as a light/dark scaffold but are not a focus — the app is not currently dark-mode-driven in its screens (only used by a few themed primitives). We will update their values to stay consistent with the new primary, but a full dark-mode pass is out of scope.
- Not pursuing pixel-perfect matching of every existing spacing value to the 4px scale in one pass where it would risk layout breakage — the priority is color/token correctness first, spacing snapping second (flagged per-component in tasks, not a blanket relayout).

## Decisions

**1. Extend `constants/theme.ts` rather than create a parallel tokens file.**
44 files already import `Colors`/`Fonts` from here; keeping one file avoids a second source of truth and a confusing migration where some code reads old tokens and some reads new ones. We add `Spacing`, `Radius`, and `Typography` exports alongside the rewritten `Colors`, keyed to match `design.md` §26's CSS custom properties one-for-one (e.g. `Spacing.space4 = 16`, `Radius.md = 12`).
*Alternative considered*: a new `constants/tokens.ts` + re-export shim. Rejected — adds indirection with no benefit since we're doing a full sweep of importers anyway.

**2. Keep token *names* stable where possible, change *values*.**
Where an existing token name maps cleanly to a `design.md` concept (`Colors.primary`, `Colors.background`, `Colors.error`), keep the name and swap the value. Add new names only for concepts that don't exist yet (`Colors.ink`, `Colors.primaryLight`, `Colors.success`, `Colors.warning`, `Colors.accent`, `Colors.border`, `Colors.textSecondary`). This minimizes the diff in consuming files (call sites don't need to rename, just pick up the new value) while still being a **BREAKING** value change as noted in the proposal.
*Alternative considered*: renaming everything to match `design.md` token names 1:1 (`Colors.ink` replacing `Colors.text`, etc.) for perfect doc parity. Rejected for this pass — bigger diff, more merge risk, same visual outcome. Can be a fast-follow if desired.

**3. Fix values first, then sweep hardcoded hex per-component.**
Order of work (reflected in tasks.md): (a) rewrite `constants/theme.ts` with full token set, (b) update shared `components/ui/*` primitives, (c) sweep `app/**` screens file-by-file. Shared components first because screens compose them — fixing `Button`/`Card`/`Input` once fixes their usage everywhere, then the remaining screen-level hardcoded values (status pills, custom headers, etc.) are a smaller, bounded list per screen.

**4. Status colors: introduce a small status→token map, not per-screen literals.**
`my-demands`, `my-proposals`, `demand-candidates`, `professional-demands`, and notification screens each render request/proposal state pills (e.g. "Aguardando resposta", "Concluído", "Cancelado"). Rather than hardcoding color per screen, add a single mapping (e.g. `getStatusColor(status): { color, background }` in a shared util or in `constants/theme.ts`) built from `Colors.success/warning/error`, so all screens render the same state the same color. This directly serves `design.md` §12's "each state must have a clear visual and textual explanation" and the customer/provider parity rule.

**5. No automated codemod — manual, file-by-file sweep.**
The hex values aren't uniformly named or aliased (many are one-off near-duplicates, e.g. `#8A8A8A` vs `#85858F` vs `#777780` — likely accidental drift, not intentional distinct tokens), so a regex replace risks mis-mapping visually-similar-but-different grays. Each file's hardcoded colors will be reviewed and mapped to the nearest correct token by hand.

## Risks / Trade-offs

- **[Risk] Broad mechanical change across ~25 screens + 22 shared components risks visual regressions (misaligned spacing, wrong contrast, broken status colors) that only show up at runtime.** → Mitigation: work shared components first (fixes propagate), then do a manual pass through each screen in the running app (`run` skill / Expo) after its file is touched, checking the golden path for that screen before moving on.
- **[Risk] Primary color change (orange → blue) is highly visible and could clash with existing brand assets (app icon, splash screen, store screenshots) that are out of scope for this change.** → Mitigation: scope is explicitly limited to in-app UI code; `app.json`/`assets/images` (icons, splash) are not touched unless the user asks separately. Flag this to the user as a follow-up decision, not a blocker.
- **[Risk] Some "duplicate" near-gray hex values may actually be intentional (e.g. disabled vs. secondary text) and collapsing them to one token could lose a real distinction.** → Mitigation: when a hex value's usage is ambiguous, default to preserving the visual intent by picking the closest matching token rather than force-merging, and note any judgment calls in the PR/commit description.
- **[Trade-off] Spacing/radius are not being force-snapped to the token scale everywhere in this pass (see Non-Goals).** → Accepted: prioritizes color-system correctness (the most visible drift from `design.md`) over a full relayout; spacing cleanup can follow once colors are stable and screens have been visually re-verified.

## Migration Plan

1. Rewrite `constants/theme.ts` (Colors + new Spacing/Radius/Typography exports). This alone is a no-op for anything not yet reading the new exports, but immediately changes every screen's rendered color since `Colors.primary` etc. change value.
2. Update `components/ui/*` primitives to use new tokens/variants.
3. Sweep `app/**` screens, one route directory at a time (group by area: auth screens, home/tabs, demand flows, proposal flows, profile), replacing hardcoded hex with tokens and verifying in the running app after each group.
4. Add the status→color mapping and apply it to the 4-5 screens showing request/proposal state.
5. No feature flag / rollback mechanism needed — this is a single-branch visual change; rollback is `git revert` if needed since there's no data migration involved.

## Open Questions

- Should `Colors.light`/`Colors.dark` (used by `hooks/use-theme-color.ts` and a couple of themed primitives) be fully reconciled with the new palette, or left mostly as-is since the app doesn't appear to expose a dark-mode toggle today? Current plan: update their values for consistency but don't expand dark-mode coverage (see Non-Goals) — revisit if the user wants full dark mode support.
- Should app icon/splash (`app.json`, `assets/images`) be updated to match the new blue identity in a follow-up change? Not addressed here.

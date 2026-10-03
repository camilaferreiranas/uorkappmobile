## Why

The app currently styles screens with an ad-hoc orange palette (`constants/theme.ts`) plus dozens of one-off hex colors hardcoded across `app/` and `components/ui/` (over 30 distinct hardcoded hex values, some repeated 70+ times). This has drifted from `design.md`, the newly-authored source of truth for Uork's visual identity, which specifies a blue-based palette (`#2563EB` primary), a 4px spacing scale, a defined radius/typography/shadow system, and explicit rules against arbitrary values. Aligning the app to `design.md` now — before more screens are built on the old palette — prevents further drift and gives every future screen a consistent token system to build from.

## What Changes

- Replace `constants/theme.ts` color values with the `design.md` token set (primary, ink, background, semantic colors, borders) and add the missing token categories it defines: spacing scale, radius scale, and typography scale. **BREAKING**: `Colors.primary` and related token values change from orange (`#E75A2B`) to blue (`#2563EB`); any code reading old token names/values must be updated.
- Introduce a single typed tokens module (spacing, radius, font sizes/weights) that mirrors `design.md` §5, §6, §26, replacing scattered magic numbers in `StyleSheet.create` calls.
- Update shared UI primitives in `components/ui/` (`button.tsx`, `card.tsx`, `input.tsx`, `service-card.tsx`, `professional-card.tsx`, `demand-card.tsx`, `select.tsx`, `pill-group.tsx`, `star-rating.tsx`, `category-card.tsx`, `metric-card.tsx`, `review-card.tsx`, `section-header.tsx`, `auth-header.tsx`, `profile-avatar.tsx`, `profile-screen-header.tsx`, `screen-container.tsx`, `professional-nav-bar.tsx`, `success-message.tsx`) to consume the new tokens instead of local hardcoded hex/px values, and to match `design.md`'s button variants (primary/secondary/ghost/destructive), card radius/border/padding rules, and input structure (label/input/helper).
- Sweep `app/**` screens for hardcoded hex colors and replace them with token references, so customer and provider flows share one visual language (`design.md` §27 component architecture, §12/§13 parity rule).
- Bring semantic status colors (success/warning/error/accent) used for request/proposal states (`my-demands`, `my-proposals`, `demand-candidates`, `professional-demands`, notifications) in line with `design.md` §14, always paired with text/iconography, never color alone.
- Verify typography usage against Inter + the documented weight/size scale (`themed-text.tsx` and screen-level text styles) and correct any inconsistent styles between customer and provider screens.
- No changes to navigation structure, data flow, or business logic — this is a visual/styling refactor only.

## Capabilities

### New Capabilities
- `design-system`: the token infrastructure (colors, spacing, radius, typography) defined in `design.md` and its enforcement across shared UI components — what tokens exist, what values they hold, and the rule that components/screens must consume them instead of hardcoded values.

### Modified Capabilities
- (none — no existing `openspec/specs/` capability covers UI/visual styling; `user-session` is unaffected)

## Impact

- **Code**: `constants/theme.ts` (rewritten), all 22 files under `components/ui/`, `components/themed-text.tsx`, `hooks/use-theme-color.ts`, and ~25 screens under `app/**` that currently hardcode colors or import `constants/theme`.
- **Visual/UX**: every screen's color palette shifts from orange-based to blue-based; spacing/radius may shift slightly to snap to the 4px/token scale. No changes to screen flow, navigation, or copy.
- **Risk**: broad, mechanical, high-file-count change with visual regression risk; needs a manual pass through each major screen (home, search, demand flows, profile, proposals) after the token swap to confirm nothing looks broken.
- **No backend/API impact.**

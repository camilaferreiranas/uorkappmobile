## ADDED Requirements

### Requirement: Design tokens are the single source of truth for visual values
`constants/theme.ts` SHALL export a complete token set — colors, spacing, radius, and typography — whose values match `design.md` (color tables in §3, spacing scale in §5, radius scale in §6, typography scale in §4). Application code SHALL NOT hardcode a color, spacing, or radius value where an equivalent token exists.

#### Scenario: Primary action color matches design.md
- **WHEN** any UI element uses the app's primary action color (main CTA, active states, links)
- **THEN** it SHALL render using the `primary` token with value `#2563EB`

#### Scenario: Shared component consumes tokens
- **WHEN** a component under `components/ui/` needs a color, spacing, or radius value
- **THEN** it SHALL reference the corresponding export from `constants/theme.ts` rather than a hardcoded literal

#### Scenario: New screen code is added after this change
- **WHEN** a developer adds a new screen or component after this change lands
- **THEN** available tokens SHALL cover the common cases (surface, background, text, border, spacing scale, radius scale) so no new hardcoded value is needed for standard UI

### Requirement: Button variants match design.md
The `Button` component SHALL support primary, secondary, ghost, and destructive variants with the colors and structure defined in `design.md` §7, and SHALL enforce a minimum touch target of approximately 44px.

#### Scenario: Primary button rendered
- **WHEN** `Button` is used with `variant="primary"`
- **THEN** it SHALL render with `background: primary token` and `color: white token`

#### Scenario: Destructive button rendered
- **WHEN** `Button` is used with `variant="destructive"`
- **THEN** it SHALL render using the `error` token and SHALL only be used for irreversible/destructive actions

### Requirement: Cards follow the documented card system
Card-style components (`Card`, `ServiceCard`, `ProfessionalCard`, `DemandCard`, `MetricCard`, `ReviewCard`) SHALL use `radius.md` (12px), `white`/`surface` background, `border` token color, and padding within the 16–24px range defined in `design.md` §6/§9.

#### Scenario: Service card rendered
- **WHEN** a service or professional card is rendered in a list
- **THEN** its corner radius SHALL be the `radius.md` token value and its border color SHALL be the `border` token value

### Requirement: Request/proposal status is communicated with color and text together
Screens displaying request or proposal state (`my-demands`, `my-proposals`, `demand-candidates`, `professional-demands`, notification screens) SHALL map each state to a semantic token (`success`, `warning`, `error`, or neutral) via a single shared mapping, and SHALL always pair the color with a visible text label or icon — never color alone.

#### Scenario: Completed request displayed
- **WHEN** a request/proposal has state "Concluído"
- **THEN** its status indicator SHALL use the `success` token color and SHALL display the text label "Concluído" alongside the color

#### Scenario: Cancelled request displayed
- **WHEN** a request/proposal has state "Cancelado"
- **THEN** its status indicator SHALL use the `error` token color and SHALL display the text label "Cancelado" alongside the color

#### Scenario: Same state on customer and provider screens
- **WHEN** the same logical status (e.g. "Aguardando resposta") is shown on both a customer-facing screen and a provider-facing screen
- **THEN** both SHALL use the same token/color and the same status→color mapping function, not independently hardcoded values

### Requirement: Customer and provider flows share one visual language
Shared UI primitives and token usage SHALL be identical between customer-facing screens (`app/(tabs)/*`, `my-demands`, `search`, etc.) and provider-facing screens (`professional-home`, `professional-demands`, `professional-profile`, etc.) per `design.md` §27.

#### Scenario: Equivalent component used on both sides
- **WHEN** both a customer screen and a provider screen need a list card, button, or status pill
- **THEN** they SHALL use the same shared component from `components/ui/` with the same token values, rather than a screen-specific duplicate

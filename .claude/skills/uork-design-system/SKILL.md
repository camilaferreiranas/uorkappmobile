Design or implement Uork marketplace screens, components, and visual assets using its trusted, approachable blue identity across web, React Native, and Flutter. Use whenever the user is building, reviewing, or discussing Uork UI — marketplace home, service detail, provider opportunity screens, booking flows, cards, buttons, color tokens, or any other Uork-branded interface or asset, for either the customer or provider side. Also use when auditing existing Uork screens for brand, accessibility, or information-disclosure issues. Do not use for unrelated brands or generic design-system work with no connection to Uork.

Uork Design System

Uork is a marketplace connecting customers who need tasks done with providers who do them. The brand identity is trusted and approachable, built around blue as the primary color. This skill governs how that identity shows up in real screens — home, service detail, provider opportunities — across web, React Native, and Flutter.

Core principle

Colors and components carry meaning, not just decoration. Blue signals brand and primary action; red, amber, and green signal error, warning, and success states. When a color or component state is chosen to "look nice" rather than to communicate something real, it erodes the vocabulary the whole product relies on — users stop trusting that blue means "the button that matters" or that red means "something's wrong." Preserve semantic color roles and component states in every screen; never assign them decoratively.

Practically, this means: hex values live only in the token/theme layer, never hardcoded in components, and every interactive element exposes the right states (default, pressed, focus, disabled, loading, error, success) rather than just looking good in its default state.

Color tokens

These are Uork's actual brand values. Reference them by token name in code and design files — never by hex directly in a component.

Primary

Token	Hex	Role
brand.primary (Azul Uork)	
#2563EB	Security, trust, technology. The default for primary actions and brand moments.
brand.dark (Azul Escuro)	
#0F172A	Professionalism and credibility. Headline text, emphasis elements.
surface.white (Branco)	
#FFFFFF	Cleanliness, simplicity, keeps focus on content.

Support

Token	Hex	Role
brand.tint (Azul Claro)	
#DBEAFE	Backgrounds, sections, secondary elements — never for primary CTAs.
surface.neutral (Cinza)	
#F1F5F9	Neutral backgrounds and content dividers.
text.secondary (Cinza Escuro)	
#475569	Secondary text and icons — not for primary body text.

Semantic (status, feedback, actions — never decorative)

Token	Hex	Role
status.success (Sucesso)	
#16A34A	Confirmations, completed signups, finished actions.
status.warning (Atenção)	
#F59E0B	Warnings and important notices.
status.error (Erro)	
#EF4444	Errors, alerts, destructive actions.
accent.highlight (Destaque)	
#8B5CF6	Special elements, promotions, differentiators — used sparingly, not as a second primary color.

Gradient (optional, decorative only) brand.gradient: #2563EB → #06B6D4, left to right. Reserved for banner details and highlight moments — brings a sense of modernity and motion. This is the one sanctioned gradient; it is not a substitute for brand.primary on headers, cards, or buttons (see anti-patterns below).

Brand voice for copy in empty states, onboarding, and CTAs stays short and concrete, in the spirit of "Simples. Confiável. Feito para você." — plain language over clever language.

Screen patterns

These are the three canonical flows. Use them as the layout skeleton, then adapt content to the specific screen being built.

Marketplace home

Structure: Top bar → task search → quick category chips → nearby/featured provider cards → recent request CTA → bottom navigation

The first viewport must make search or another useful next action obvious — someone landing here should immediately see how to find or continue a task, not have to scroll to find the point of the page.

Service detail

Structure: Back + share → service/provider summary → trust evidence → scope and pricing → availability → reviews → sticky commitment CTA

Price and the commitment action need to stay visible near each other — a user should never have to scroll away from the price to find the button that acts on it. Reviews are supporting evidence for the decision; let them enrich the page, but don't let them push core booking information (price, scope, availability) out of easy reach.

Provider opportunity

Structure: Urgency/status → request summary → customer/location/timing → earnings and fee clarity → accept/decline → message

Give the recommended response (usually accept) the primary action treatment. Decline is secondary or tucked into overflow — unless the situation genuinely makes cancellation just as likely a next step as accepting, in which case treat them as equally weighted.

Layout and spacing
16px page gutters
24–32px between major sections
12–16px between related elements within a section

Keep this rhythm consistent — it's what makes a screen feel like part of the same product rather than a one-off layout.

Anti-patterns

These are specific ways the core principle gets violated in practice. Watch for them in both new design and review of existing screens.

The brand.gradient (or a plain blue gradient) on every header, card, and button. It's reserved for banner details and highlight moments — stamp it everywhere and it stops meaning "something special" and starts diluting brand.primary as the signal for the primary action.
White text on brand.tint (#DBEAFE), status.warning (#F59E0B), or the cyan end of brand.gradient (#06B6D4) without checking contrast. These backgrounds are light or mid-toned enough that white text can silently fail accessibility — verify against AA before shipping, or use brand.dark/text.secondary instead.
Hiding price qualifiers, fees, cancellation terms, or verification status in tooltips. These are decision-critical facts, not supplementary detail — they belong in the visible layout.
Every card elevated, interactive, and CTA-heavy. Reserve elevation and heavy CTAs for the things that actually need emphasis; otherwise the page has no hierarchy.
10–12px text for required information, legal consent, or error recovery. If it's information someone must read or act on, it needs to be legible at a normal glance, not squinted at.
status.error (#EF4444), status.warning (#F59E0B), or status.success (#16A34A) used decoratively. These colors are load-bearing for meaning — don't spend them on styling choices unrelated to status. The same caution applies to accent.highlight (
#8B5CF6): it's for genuinely special or promotional elements, not a second brand color to reach for when something needs to pop.
Disabled controls with no explanation. A greyed-out button tells someone that they can't act, not why or what would unlock it. Always pair disabled state with the reason and the path to resolve it.
Auto-playing animation, icon-only buttons with ambiguous meaning, or long unbroken form sequences. Each of these either distracts, obscures function, or fatigues the user — break them up or add clarity instead.
Delivery checklist

Before treating a design or implementation as done, verify:

Semantic tokens are used consistently; hex values are confined to the token/theme layer.
The primary task and CTA are obvious on a narrow mobile screen.
Interactive elements meet the 44px touch target and expose default, pressed, focus, disabled, loading, error, and success behavior where relevant.
Text and UI contrast satisfy AA in both supported themes.
Customer and provider views each expose the correct information, commitment, and next state for their role — these are different audiences with different needs from the same underlying data.
Empty, loading, error, offline, and success states all have useful copy and a clear recovery path — not just a generic message.
Icons, status colors, and labels remain understandable without relying on color perception or motion (i.e., pair color with an icon or label, don't let color carry meaning alone).
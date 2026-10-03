# Uork — Design System & Visual Identity

> **Official frontend visual source of truth.**  
> Uork is a **B2C two-sided services marketplace**, connecting
> **customers** with **service providers**.

## 1. Product principles

Uork must feel:

- Simple
- Human
- Trustworthy
- Accessible
- Modern
- Fast to understand

It must **not** feel like enterprise software, an internal admin system,
a banking interface, or a developer tool.

### Core journeys

Customer:

``` text
Discover → Trust → Compare → Request → Track
```

Provider:

``` text
Create profile → Publish services → Receive requests → Respond → Build reputation
```

### Golden rule

> Every screen should help the user **discover, trust, compare, decide,
> or act** quickly and without unnecessary complexity.

------------------------------------------------------------------------

# 2. Brand identity

## Personality

- **Simple:** clear hierarchy, short labels, generous whitespace.
- **Human:** natural language, real people, approachable interactions.
- **Trustworthy:** transparent information, ratings, profiles and
  predictable states.
- **Accessible:** easy to understand for both customers and providers.
- **Modern:** clean cards, strong typography, subtle visual details.

Avoid:

- Excessive gradients.
- Glassmorphism.
- Heavy shadows.
- Dense enterprise dashboards.
- Technical jargon.
- Decorative elements without UX purpose.

------------------------------------------------------------------------

# 3. Color system

## Primary

| Token     | Hex       | Usage                                     |
|-----------|-----------|-------------------------------------------|
| `primary` | `#2563EB` | Primary CTA, links, search, active states |
| `ink`     | `#0F172A` | Headings, navigation, primary text        |
| `white`   | `#FFFFFF` | Cards, surfaces and clean backgrounds     |

## Supporting

| Token           | Hex       | Usage                              |
|-----------------|-----------|------------------------------------|
| `primaryLight`  | `#DBEAFE` | Selected filters, soft backgrounds |
| `background`    | `#F1F5F9` | Page backgrounds                   |
| `textSecondary` | `#475569` | Secondary text, metadata, icons    |
| `border`        | `#E2E8F0` | Borders and dividers               |

## Semantic

| Token     | Hex       | Usage                                      |
|-----------|-----------|--------------------------------------------|
| `success` | `#16A34A` | Completed actions, confirmed requests      |
| `warning` | `#F59E0B` | Pending actions and warnings               |
| `error`   | `#EF4444` | Errors, cancellations, destructive actions |
| `accent`  | `#8B5CF6` | Promotions and special highlights          |

Optional gradient:

``` text
#2563EB → #06B6D4
```

Use only for hero sections, promotional banners or special highlights.

### Color rules

- Never invent arbitrary brand colors.
- Never use color as the only indicator of status.
- Use `#0F172A` for primary text.
- Use `#475569` for secondary text.
- Use `#2563EB` for the main action.
- Prefer white cards with subtle borders over visually heavy containers.

------------------------------------------------------------------------

# 4. Typography

Use **Inter**.

Recommended fallback:

``` css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

| Element |  Weight |    Size | Line-height |
|---------|--------:|--------:|------------:|
| Display |     700 | 36–48px |         1.1 |
| H1      |     700 | 32–40px |        1.15 |
| H2      |     600 | 24–32px |         1.2 |
| H3      |     600 | 18–22px |         1.3 |
| Body    |     400 | 15–16px |         1.5 |
| Small   | 400/500 | 12–14px |         1.4 |
| Button  |     600 | 14–15px |         1.2 |
| Price   |     700 | 20–28px |         1.2 |

Rules:

- Use at most three font weights on one screen.
- Avoid long ALL CAPS text.
- Do not use typography inconsistently between customer and provider
  flows.

------------------------------------------------------------------------

# 5. Spacing and layout

Use a 4px-based spacing scale:

``` text
4  8  12  16  20  24  32  40  48  64  80
```

Prefer 16–24px for normal component spacing.

### Layout

Desktop:

``` text
max-width: 1200–1280px
```

Mobile:

``` text
horizontal padding: 16–20px
```

Design mobile-first.

Never rely on hover-only interactions.

------------------------------------------------------------------------

# 6. Radius, borders and shadows

``` text
radius-sm = 8px
radius-md = 12px
radius-lg = 16px
```

Recommended:

| Component | Radius |
|-----------|-------:|
| Input     | 8–10px |
| Button    | 8–10px |
| Badge     |  999px |
| Card      |   12px |
| Modal     |   16px |

Default border:

``` text
#E2E8F0
```

Use shadows sparingly. Prefer border + spacing + contrast over heavy
shadows.

------------------------------------------------------------------------

# 7. Buttons

### Primary

``` text
background: #2563EB
color: #FFFFFF
```

Use for the main action.

Examples:

- `Solicitar serviço`
- `Continuar`
- `Criar serviço`
- `Salvar`
- `Começar`

### Secondary

``` text
background: #FFFFFF
border: #E2E8F0
color: #0F172A
```

### Ghost

``` text
background: transparent
color: #475569
hover: #F1F5F9
```

### Destructive

``` text
#EF4444
```

Only for irreversible/destructive actions.

### Button rules

- Use action verbs.
- Keep labels short.
- Avoid `OK`.
- Avoid multiple competing primary CTAs.
- Minimum touch target: approximately 44px.

------------------------------------------------------------------------

# 8. Inputs

Recommended height:

``` text
44–48px
```

Structure:

``` text
Label
Input
Helper/error message
```

Rules:

- Labels must exist independently of placeholders.
- Focus must be visually obvious.
- Errors must explain what the user should do.
- Do not use icons merely as decoration.

------------------------------------------------------------------------

# 9. Service card

The service card is a core Uork component.

Recommended hierarchy:

``` text
[Image / Provider avatar]

Service name
Provider name
★★★★★ 4.9 (124)
Location / service area

Short description

A partir de R$ XX

[ Ver serviço ]
```

Prioritize visually:

1.  Service name
2.  Price
3.  Rating
4.  Provider
5.  Metadata
6.  Description

Card rules:

- Radius: 12px.
- Background: `#FFFFFF`.
- Border: `#E2E8F0`.
- Padding: 16–24px.
- Consistent image ratio.
- Keep cards scannable on mobile.

------------------------------------------------------------------------

# 10. Provider profile

Recommended:

``` text
Provider photo
Provider name
Primary category
Rating + review count
Location

About

Services
Portfolio
Reviews

[ Solicitar serviço ]
```

Trust information must be easy to find without overwhelming the user.

Never create fake verification or reputation claims.

------------------------------------------------------------------------

# 11. Search and discovery

Primary search copy:

> **O que você precisa?**

Examples:

- Eletricista
- Fotógrafo
- Professor de inglês
- Designer
- Limpeza
- Manutenção

Search should be visually prominent.

Possible filters:

- Categoria
- Localização
- Preço
- Avaliação
- Disponibilidade

Selected filters should be represented as chips.

Discovery flow:

``` text
Need
→ Category
→ Location
→ Results
→ Compare
→ Profile
→ Request
```

Do not force registration before exploration unless technically
necessary.

------------------------------------------------------------------------

# 12. Customer experience

The customer experience should prioritize:

- Search
- Categories
- Location
- Service cards
- Provider profiles
- Ratings
- Prices
- Request status

Recommended request states:

``` text
Solicitação enviada
Aguardando resposta
Em negociação
Agendado
Concluído
Cancelado
```

Each state must have a clear visual and textual explanation.

------------------------------------------------------------------------

# 13. Provider experience

Provider onboarding should be lightweight:

``` text
Criar conta
→ Perfil
→ Categoria
→ Área de atendimento
→ Serviço
→ Preço
→ Publicar
```

Provider dashboard should prioritize:

- New requests
- Active requests
- Upcoming services
- Profile completion
- Reviews
- Service management

Do not turn the provider experience into an enterprise-style admin
dashboard.

------------------------------------------------------------------------

# 14. Status and semantic colors

### Success

`#16A34A`

Examples:

- Solicitação enviada
- Serviço concluído
- Pagamento confirmado

### Warning

`#F59E0B`

Examples:

- Aguardando resposta
- Perfil incompleto
- Informação pendente

### Error

`#EF4444`

Examples:

- Falha
- Cancelamento
- Exclusão

### Accent

`#8B5CF6`

Examples:

- Promoções
- Destaques
- Special features

Always combine semantic color with text/iconography.

------------------------------------------------------------------------

# 15. Empty states

Every asynchronous/content-driven screen should have a designed empty
state.

Customer:

> **Ainda não encontramos serviços nessa região.**  
> Tente outra categoria ou localização.

CTA:

``` text
Alterar busca
```

Provider:

> **Você ainda não publicou nenhum serviço.**  
> Cadastre seu primeiro serviço para começar a receber oportunidades.

CTA:

``` text
Criar serviço
```

An empty state must explain:

1.  What is empty.
2.  Why it may be empty.
3.  What the user can do next.

------------------------------------------------------------------------

# 16. Loading states

Prefer skeletons for content-heavy interfaces.

Examples:

``` text
Loading card → Skeleton card
Loading profile → Skeleton profile
Submitting → Button "Enviando..."
```

Do not replace the entire application with a generic spinner when only
one component is loading.

Prevent duplicate submissions while an action is processing.

------------------------------------------------------------------------

# 17. Error messages

Errors must be short, human and actionable.

Bad:

> Erro 500.

Bad:

> Ocorreu um erro inesperado.

Good:

> Não conseguimos carregar os serviços agora. Tente novamente.

Form:

> Informe um e-mail válido.

Network:

> Parece que você está sem conexão. Verifique sua internet e tente
> novamente.

Never blame the user.

------------------------------------------------------------------------

# 18. Tone of voice

Uork communicates like a helpful person.

### Prefer

- Short sentences.
- Active voice.
- Familiar words.
- Direct instructions.
- Natural Portuguese.

### Avoid

- Corporate jargon.
- Technical language.
- Artificial enthusiasm.
- Excessive exclamation marks.
- Long explanations.

Examples:

Prefer:

> `O que você precisa?`

instead of:

> `Selecione a categoria do serviço desejado.`

Prefer:

> `Solicitar serviço`

instead of:

> `Enviar nova solicitação de contratação.`

Prefer:

> `Encontre o profissional que você precisa.`

instead of:

> `Encontre prestadores qualificados para atender às suas necessidades.`

------------------------------------------------------------------------

# 19. Trust and reputation

Trust is a core part of the marketplace UI.

Use real, objective signals:

- Ratings
- Number of reviews
- Profile completeness
- Provider photo
- Service description
- Price
- Service area
- Portfolio
- Real verification status

Do not invent:

- Verification badges
- Fake review counts
- Fake recommendations
- Unsupported claims

The interface should communicate trust through information, not
manipulation.

------------------------------------------------------------------------

# 20. Images and photography

Uork connects real people, so imagery should feel human.

Prefer:

- Real provider photos.
- Natural expressions.
- Real service examples.
- Consistent crops.
- Good-quality images.

Avoid:

- Generic corporate stock photos.
- Overly staged business imagery.
- Inconsistent image dimensions.
- Low-quality images without a fallback.

Provider avatars must have consistent dimensions.

------------------------------------------------------------------------

# 21. Icons

Recommended library:

``` text
Lucide
```

Rules:

- Use one icon family.
- Default: 18–20px.
- Contextual: 20–24px.
- Use icons with labels when meaning may be ambiguous.
- Do not use emojis as UI icons.
- Do not mix filled and outlined systems without a deliberate rule.

------------------------------------------------------------------------

# 22. Navigation

Customer:

``` text
Início
Buscar
Solicitações
Mensagens
Perfil
```

Provider:

``` text
Início
Solicitações
Serviços
Mensagens
Perfil
```

These are examples, not mandatory information architecture. Preserve the
product’s actual navigation structure when it already exists.

Navigation should prioritize the user’s most frequent tasks.

------------------------------------------------------------------------

# 23. Responsive behavior

### Desktop

Use:

- Multi-column service grids.
- Sidebar filters when useful.
- Larger hero sections.
- More visible metadata.

### Tablet

Reduce:

- Number of columns.
- Navigation density.
- Horizontal spacing.

### Mobile

Prioritize:

- Search
- Categories
- Service cards
- Primary CTA
- Bottom navigation when appropriate

Never allow secondary information to overpower the primary action.

------------------------------------------------------------------------

# 24. Motion

Animations should improve feedback or perceived performance.

Recommended:

``` text
150–250ms
```

Good uses:

- Hover transitions.
- Focus transitions.
- Modal entrance.
- Toast entrance.
- Skeleton loading.
- State changes.

Avoid:

- Excessive bouncing.
- Large parallax.
- Long transitions.
- Decorative animations everywhere.

Respect `prefers-reduced-motion`.

------------------------------------------------------------------------

# 25. Accessibility

The UI must:

- Use semantic HTML.
- Maintain sufficient contrast.
- Have visible keyboard focus.
- Have accessible labels.
- Provide meaningful alt text.
- Support keyboard navigation.
- Never rely on color alone.
- Use touch targets around 44px or larger.
- Remain usable with browser zoom.

Accessibility is part of the design system, not an optional feature.

------------------------------------------------------------------------

# 26. Design tokens

Use these tokens as the source of truth:

``` css
:root {
  --color-primary: #2563EB;
  --color-primary-light: #DBEAFE;

  --color-ink: #0F172A;
  --color-text-secondary: #475569;

  --color-surface: #FFFFFF;
  --color-background: #F1F5F9;

  --color-success: #16A34A;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-accent: #8B5CF6;

  --color-border: #E2E8F0;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
}
```

If Tailwind is used, map these values into the Tailwind theme rather
than repeatedly hardcoding values.

------------------------------------------------------------------------

# 27. Component architecture

Before creating a new component:

1.  Check whether an existing component already solves the problem.
2.  Reuse existing tokens.
3.  Preserve existing interaction patterns.
4.  Add a variant only when it is a real recurring use case.
5.  Avoid one-off styling.
6.  Keep component APIs simple.
7.  Keep customer and provider interfaces visually consistent.

Prefer:

``` tsx
<Button variant="primary">
  Solicitar serviço
</Button>
```

Avoid creating:

``` tsx
<BlueButton />
<PrimaryBlueButton />
<MarketplaceCTAButton />
```

when an existing Button component can handle the use case.

------------------------------------------------------------------------

# 28. Cursor implementation rules

When generating or modifying frontend code:

## Always

- Read and follow this `design.md`.
- Reuse existing components before creating new ones.
- Reuse design tokens.
- Use Inter.
- Use the Uork color palette.
- Follow the 4px spacing scale.
- Follow the radius system.
- Design mobile-first.
- Include loading, empty and error states for asynchronous content.
- Preserve accessibility.
- Keep customer and provider experiences visually consistent.
- Keep UI copy in Portuguese unless a feature explicitly requires
  another language.
- Prefer simple, functional UI over decorative UI.

## Never

- Invent new brand colors without explicit approval.
- Add random gradients.
- Add arbitrary spacing values when a token exists.
- Add arbitrary border-radius values.
- Use excessive shadows.
- Use emojis as interface icons.
- Build dense enterprise-style dashboards.
- Create visual complexity just to make a screen look “premium”.
- Communicate state using color alone.
- Create fake trust/verification/reputation claims.
- Replace existing components with one-off custom components without a
  strong reason.

------------------------------------------------------------------------

# 29. UI decision hierarchy

When deciding how to implement a new UI:

``` text
1. User task
2. Accessibility
3. Existing component
4. Existing design token
5. Existing visual pattern
6. New component variant
7. New component
8. Decorative styling
```

Always start from the user’s task, not decoration.

------------------------------------------------------------------------

# 30. Final direction

Uork should feel like:

> **Um lugar onde pessoas encontram pessoas para resolver necessidades
> reais.**

Visual language:

``` text
Blue
+
White space
+
Human photography
+
Clear typography
+
Simple cards
+
Trust signals
+
Direct language
```

The product should feel like a **trusted services marketplace**, not an
enterprise software product.

## Final rule

> **If a visual element does not help the user discover, trust, compare,
> decide, or act, question whether it needs to exist.**

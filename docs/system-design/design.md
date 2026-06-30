# Alliance Research Indicators — System Design (UI/UX Blueprint)

> The visual & interaction blueprint. Companion to [`../prd.md`](../prd.md) (what & why) and [`../detailed-design/detailed-design.md`](../detailed-design/detailed-design.md) (how the code is wired).
>
> When adding a new screen, **read this document first**. Every new screen must fit the patterns below or explicitly document a deviation in §12 Design Decisions.

---

## 1. Product Experience Principles

These are the principles new screens are evaluated against in review. They derive from the personas in [`../prd.md`](../prd.md) §3.

1. **Form clarity over visual flourish.** This product is a data-entry application for research metadata. Every screen optimizes for *legibility, scannability, and confidence that the data is correct* — not for aesthetic novelty.
2. **The taxonomy is the truth.** Controlled-list inputs (CLARISA) are the default; free text is the exception and must be justified. UI must make it *easier* to pick the canonical value than to type a custom one.
3. **Status always visible.** A user must always be able to answer: "Where is this result in its lifecycle? Am I allowed to edit it? Did my last save succeed?"
4. **Predictable navigation.** Every authenticated screen lives inside the platform shell (navbar + sidebar). The result detail screen is the only place with a second-level sidebar (tab navigation).
5. **Respect role.** Hide actions the current role cannot perform — never disable them silently. Show the user *why* something is read-only when relevant.
6. **Forgiving by default.** Long forms must autosave or surface "unsaved changes" warnings. Destructive actions (delete result, remove evidence) require confirmation.
7. **Federated, not duplicated.** When the user is about to create something that already exists across platforms (STAR / TIP / PRMS / AICCRA), the UI offers to *link*, not duplicate.
8. **Accessible to keyboard-and-screen-reader users.** WCAG 2.1 AA is the floor (§10), not the ceiling.

---

## 2. Information Architecture

Top-level information hierarchy of the authenticated experience:

```
Platform Shell (navbar + sidebar)
├── Home                              — landing dashboard for the logged-in user
├── Indicators
│   ├── About Indicators              — educational overview
│   └── Indicator detail (/:id)       — metadata + examples for one indicator
├── Results
│   ├── Results Center                — center-scoped overview & quick filters
│   ├── Search a Result               — federated full-text search across platforms
│   ├── Load Result                   — create-new flow
│   └── Result Detail (/:id)          — tabbed metadata editor
│       ├── General Information
│       ├── Links to Result
│       ├── Alliance Alignment
│       ├── Partners
│       ├── Evidence
│       ├── OICR Details
│       ├── IP Rights
│       ├── Capacity Sharing
│       ├── Policy Change
│       ├── Innovation Details
│       └── Geographic Scope
├── Projects
│   ├── My Projects                   — portfolio
│   └── Project Detail (/:id)         — project metadata + linked results
├── Dashboard                         — charts & aggregates
├── Notifications                     — real-time feed
├── Profile                           — account settings, theme
├── About                             — app/version info
└── Administration
    └── Center Admin
        ├── Bulk Upload (capacity sharing)
        └── SDG Management
```

Outside the shell:

```
Public / Unauthenticated
├── Landing                           — marketing surface for anonymous users
├── Login                             — Cognito entry
├── Auth                              — Cognito callback / token exchange
├── Room (/:id)                       — real-time collaboration deep link
├── Fields                            — dynamic form-field configurator
├── Cache-test                        — internal/dev utility
└── OICR Download                     — public template download
```

---

## 3. Primary User Flows

Each flow is described as a sequence of screen transitions. These are the **golden paths** new work must not regress.

### 3.1 Create a Result (Researcher)
1. Home → "Load Result" CTA → `load-results`.
2. Pick indicator type → indicator → result name.
3. **Duplicate check** runs (409 if collision); if collision, offer to link to existing result instead.
4. On success → redirect to `result/:id/general-information`.
5. User fills tabs left-to-right; sidebar shows per-tab completion checks (green tick / orange warning).
6. User submits → status transitions; toast confirms; result appears in MEL queue.

### 3.2 Find & Link an Existing Result (Cross-Platform Consumer)
1. `search-a-result` → enter free-text / filters → federated results from STAR / TIP / PRMS / AICCRA.
2. Click row → `result/:id` (own platform) or external deep link (other platform).
3. From a result detail, "Links to result" tab → search & link counterparts on other platforms.

### 3.3 Bulk Upload Capacity Sharing (Center Admin)
1. Administration → Center Admin → Bulk Upload.
2. Download template → fill offline → upload.
3. Server validates row-by-row → results returned with per-row status; user fixes & re-uploads errored rows.

### 3.4 Review & Validate (MEL Regional Expert)
1. Notifications / Results Center → open submitted result.
2. Review tabs in order; leave structured feedback; accept or return.
3. Reporter receives notification (real-time + Notifications page).

### 3.5 Switch Theme
1. Navbar / profile → toggle dark mode.
2. `DarkModeService` flips signal → `.dark-mode` class on body → PrimeNG Aura swaps token set → CSS variables swap.
3. Choice persists (cache service / localStorage).

---

## 4. Screen Inventory

| # | Screen | Route | Shell | Notes |
|---|--------|-------|-------|-------|
| 1 | Landing | `/` (anon) | No | Public, marketing |
| 2 | Login | `/login` | No | Cognito |
| 3 | Auth callback | `/auth` | No | Token exchange |
| 4 | Home | `/home` | Yes | Dashboard + quick actions |
| 5 | About Indicators | `/about-indicators` | Yes | Educational |
| 6 | Indicator Detail | `/indicator/:id` | Yes | One of 5 indicator types |
| 7 | Results Center | `/results-center` | Yes | Hub & quick filters |
| 8 | Search a Result | `/search-a-result` | Yes | Federated search |
| 9 | Load Result | `/load-results` | Yes | Create-new wizard |
| 10 | Result Detail | `/result/:id/...` | Yes (+ second-level sidebar) | 11 sub-tabs |
| 11 | My Projects | `/projects` | Yes | Portfolio |
| 12 | Project Detail | `/project-detail/:id` | Yes | Project metadata + results |
| 13 | Dashboard | `/dashboard` | Yes | Chart.js visualizations |
| 14 | Notifications | `/notifications` | Yes | Real-time feed |
| 15 | Profile | `/profile` | Yes | User settings & theme |
| 16 | About | `/about` | Yes | App info |
| 17 | Bulk Upload | `/administration/center-admin/bulk-upload` | Yes (center-admin only) | Capacity sharing |
| 18 | SDG Management | `/administration/center-admin/sdg-management` | Yes (center-admin only) | Center SDG alignment |
| 19 | Portfolio Management | `/administration/center-admin/portfolio-management` | Yes (center-admin only) | Strategy portfolio administration |
| 20 | Room | `/room/:id` | No | Real-time collab |
| 21 | OICR Download | `/oicr/download` | No | Public download |
| 22 | Fields | `/fields` | No | Dynamic form config |
| 23 | Cache-test | `/cache-test` | No | Dev tool |
| 24 | STAR Report Viewer | `/reports/result/:id?version=N` | No (auth required) | Loading surface + embedded STAR PDF |

---

## 5. Navigation Model

- **Primary navigation**: persistent top **navbar** (`alliance-navbar`) — branding, user menu, dark-mode toggle, notifications icon.
- **Secondary navigation**: persistent left **sidebar** (`alliance-sidebar`) — Home / Results / Projects / Dashboard / Administration sections.
- **Tertiary navigation**: inside Result Detail, a **second-level sidebar** (`result-sidebar`) lists the 11 tabs with completion indicators.
- **Contextual navigation**: `section-header` shows page title, breadcrumb-like back behavior, and per-section action buttons (`filters-action-buttons`, `search-export-controls`).
- **Back behavior**: every screen except `home` and `projects` (configured via `hideBackButton: true`) supports `back` via the section header.
- **Deep links**: every result tab is independently routable (`/result/:id/<tab>?version=N`) — sharing a URL preserves tab and version context.
- **Auth-guarded**: All shell routes pass `rolesGuard`; admin routes additionally pass `centerAdminGuard`.

---

## 6. Layout Patterns

| Pattern | When to use | Anchored to |
|---------|-------------|-------------|
| **Shell + content** | All authenticated screens | `platform.component`, navbar + sidebar |
| **Tabbed detail** | Long structured records (Result Detail) | `result-sidebar` + outlet |
| **List + filter + export** | Search / Results Center / Projects | `results-table`, `filters-action-buttons`, `search-export-controls` |
| **Card grid** | Indicator catalog, dashboard widgets | section-level layout |
| **Two-column form** | Result metadata tabs | Label column + control column, full-width on `md:` breakpoint |
| **Modal-driven action** | Confirmation, link result, evidence upload | `all-modals` host + `modal` wrapper |
| **Real-time banner** | System alerts (`alert-tag`, `global-alert`, `global-toast`) | Top of shell, dismissible |

Spacing, sizing, and breakpoints use the `rs-*` utility class system (see [`../../research-indicators/README.md`](../../research-indicators/README.md) — colors & responsive sizing) so layouts respond consistently to the `md:` breakpoint (landscape orientation, height ≤ 768px).

---

## 7. Design Tokens

Tokens live in `src/styles/colors.scss`, `src/styles/font.scss`, `src/app/theme/roartheme.ts`, and are surfaced as CSS custom properties under `:root`. **Do not hard-code hex values in new components.**

### 7.1 Color tokens (light mode source values)

| Family | Token range | Use |
|--------|-------------|-----|
| Light blue | `--ac-light-blue-100` … `--ac-light-blue-500` | Informational accents, links |
| Primary blue | `--ac-primary-blue-100` … `--ac-primary-blue-700` | Brand, navbar, primary CTAs |
| Green | `--ac-green-100` … `--ac-green-700` | Indicators 1–3 (capacity sharing, innovation dev, policy change types A) |
| Orange | `--ac-orange-1` | Indicators 4–5 |
| Grey | `--ac-grey-100` … `--ac-grey-900` | Neutrals, borders, body text |
| Red | `--ac-red-1` | Errors, destructive actions |
| White | `--ac-white-1`, `--ac-white-2` | Surfaces |
| Background | `--ac-background` | Page background (flips in dark mode) |
| Pool Funding | `--ac-pool-funding-fg`, `--ac-pool-funding-border` | Bilateral module "Pool Funding" tag (see [`../specs/archive/2026-05-26-bilateral-module--tag-visibility/`](../specs/archive/2026-05-26-bilateral-module--tag-visibility/)) |

Dark mode overrides the same token names under `:root[data-theme="dark"]`. PrimeNG Aura preset (`roartheme.ts`) flips via the `.dark-mode` body class.

### 7.2 Utility classes (do not invent parallels)

- `.abc-<color>` — background color (e.g., `.abc-primary-blue-500`)
- `.atc-<color>` — text color (e.g., `.atc-light-blue-300`)
- `.fs-[n]` / `.md:fs-[n]` — font size (n = 1–30 px)
- `.rs-size-[n]`, `.rs-w-[n]`, `.rs-h-[n]` — width/height (0–500 px)
- `.rs-gap-[n]`, `.rs-gap-x-[n]`, `.rs-gap-y-[n]` — flex/grid gaps
- `.rs-m-[n]`, `.rs-mx-[n]`, `.rs-my-[n]`, `.rs-mt-[n]`, `.rs-mr-[n]`, `.rs-mb-[n]`, `.rs-ml-[n]`
- `.rs-p-[n]`, `.rs-px-[n]`, `.rs-py-[n]`, `.rs-pt-[n]`, `.rs-pr-[n]`, `.rs-pb-[n]`, `.rs-pl-[n]`
- `.rs-hide`, `.md-rs-hide`

`.md:` variants apply to the landscape ≤ 768 px height breakpoint and use `!important` to override base rules. See [`../../research-indicators/README.md`](../../research-indicators/README.md) for full reference.

### 7.3 Typography

- Font scale defined in `src/styles/font.scss`.
- Base size respects browser defaults (rem-based); per-element overrides via `.fs-[n]` utilities.
- Heading hierarchy used by `section-header` and `form-header` shared components.

### 7.4 Form fields

- Custom form-field styles in `src/styles/custom-fields.scss`.
- PrimeNG inputs are wrapped/restyled through `src/styles/custom-prime-force-styles.scss`. New form patterns should use the wrapped versions, not raw PrimeNG defaults.

#### 7.4.1 Canonical form-label classes (binding contract)

Form labels MUST use the canonical SCSS classes from [`src/styles/custom-fields.scss`](../../research-indicators/src/styles/custom-fields.scss). Tailwind utility classes (`text-sm`, `font-medium`, body color defaults) are NOT a substitute — they render in body grey/black instead of the brand blue used across every other tab.

| Element | Class | Resolved style |
| --- | --- | --- |
| Field label / question text (`<label>` or `<p>` used as a `radiogroup`'s `aria-labelledby`) | `.label` | `#153c71` (= `--ac-primary-blue-400`), Space Grotesk, 14px, 450 weight |
| Description / helper text below a label | `.description` | `#777c83` (= `--ac-grey-700`), Barlow, 14.5px, 400 weight |
| Per-option text in radio / checkbox groups | `.option-label` | `#4c5158` (= `--ac-grey-800`), Barlow, 14px, 400 weight |
| Section heading inside a form card | `.section-title` | `#a2a9af` (= `--ac-grey-500`), Space Grotesk, 14px, 450 weight, uppercase, `margin-bottom: 20px` |
| Required marker | `<span class="text-red-500">*</span>` next to the label text (NOT `atc-red-1`, which is a heavier color) | Tailwind red — same shade the shared `app-radio-button` uses |

**Why this is enforced**: The visual audit on `pool-funding-alignment` (2026-05-24) found question text rendering in body grey instead of primary-blue-400 because the template used `text-sm font-medium` instead of `.label`. The result was a tab that looked visibly "off" next to General Information / Alliance Alignment / IP Rights. The shared `app-radio-button` and `app-input` components apply `.label` / `.option-label` internally; bare `<p-radioButton>` / `<label>` usage must replicate them.

**Reach for the shared `app-radio-button` component first** when a 2+ option radio group is needed. Only drop down to raw `<p-radioButton>` when the shared component's contract (a `service`-driven options list) doesn't fit the use case (e.g., a hard-coded Yes/No pair tied to a discriminated-union field).

---

## 8. Component Inventory

All shared, reusable components live under `src/app/shared/`. Reach for them before building new ones.

### 8.1 Shell & navigation
- `alliance-navbar`, `alliance-sidebar`, `section-header`, `result-sidebar`, `section-sidebar`, `form-header`, `navigation-buttons`

### 8.2 Data display
- `results-table`, `project-results-table`, `project-item`, `partner-selected-item`, `notification-item`, `custom-tag`, `custom-progress-bar`, `metadata-panel`, `alert-tag`

### 8.3 Forms & input
- `dropdowns`, `dropdown`, `custom-fields`, `search-export-controls`, `shared-result-form`

### 8.4 Modals & overlays
- `all-modals` (host), `modal` (wrapper). All new dialogs route through these — never instantiate ad-hoc overlays.

### 8.5 System feedback
- `global-alert`, `global-toast`, `alert-tag` — for user-facing system state.

### 8.6 OICR-specific
- `download-oicr-template`, `oicr-header`, `oicr-workflow-status`

### 8.7 Utilities
- `copy-token`, `filters-action-buttons`

> **Rule**: A new screen that introduces a "card" or "table" or "modal" pattern not covered by the inventory above must either (a) extend the shared component or (b) document the new component in §12 Design Decisions and add it to this inventory in the same change.

---

## 9. Responsive Behavior

- **Primary form factor**: desktop browser, 1280–1920 px wide.
- **Supported**: laptop landscape ≥ 1024 px wide, height ≥ 768 px.
- **Constrained**: landscape with height ≤ 768 px (the `md:` utility breakpoint). Layouts compress vertically; some chrome may hide via `.md-rs-hide`.
- **Mobile portrait**: not a primary target (see [`../prd.md`](../prd.md) OQ-6). Layouts should not crash but are not pixel-tuned.
- **Density**: prefer compact PrimeNG tables on small viewports; use `.rs-*` utilities to scale spacing predictably.

---

## 10. Accessibility Expectations

WCAG 2.1 AA is the floor for every changed screen (PRD constraint C-4).

- **Keyboard**: every interactive control reachable via Tab; visible focus ring; no keyboard trap.
- **Labels**: all inputs have `<label>` or `aria-label`. Icon-only buttons have `aria-label`.
- **Color contrast**: token combinations chosen so text on background ≥ 4.5:1 (body) / ≥ 3:1 (large text & UI icons). Dark-mode pairings verified separately.
- **Status communicated non-visually**: success/error/warning conveyed by icon + text, not color alone (`custom-tag`, `alert-tag`).
- **Motion**: avoid auto-playing motion; respect `prefers-reduced-motion`.
- **Live regions**: real-time alerts (`global-alert`, `global-toast`) use ARIA live regions appropriately.
- **PrimeNG + Angular CDK** are leveraged for focus management & overlays; do not bypass them.

---

## 11. Dark Mode Behavior

- **Toggle**: `DarkModeService` (signal-based). Persisted in user cache / localStorage.
- **Mechanism**: adds `.dark-mode` class to `<body>`; PrimeNG Aura preset (`roartheme.ts`) detects via `darkModeSelector`; CSS variable set on `:root[data-theme="dark"]` swaps.
- **Author rule**: components must use token utilities (`.abc-*`, `.atc-*`) or CSS variables — **never** hard-coded hex — so dark mode "just works."
- **Per-screen requirement**: dark + light parity is **not codified as a hard product constraint** today (see [`../prd.md`](../prd.md) OQ-3). However, breaking dark mode on a screen that previously supported it is a regression.

---

## 12. Design Decisions (Decision Record)

Append new decisions here; do not silently change established patterns. Each entry: short title, date, decision, rationale.

- **2026-05-13 — Lock UI stack at PrimeNG 19 + Aura preset.** No mixing of other component libraries. *Rationale*: prevent design drift; Aura preset already overridden for brand.
- **2026-05-13 — Controlled-list inputs only for CLARISA-managed fields.** *Rationale*: PRD C-3. Free text for CLARISA fields is a defect.
- **2026-05-13 — Result Detail is the only tertiary-navigation surface.** *Rationale*: avoid navigation depth elsewhere; tabbed editors are a metadata-record pattern, not a general one.
- **2026-05-13 — All overlays route through `all-modals` + `modal`.** *Rationale*: consistent escape-key, focus-trap, and dismiss behavior.
- **2026-05-13 — Spacing/sizing via `rs-*` utilities, not inline styles.** *Rationale*: responsive breakpoint already encoded; ad-hoc CSS drifts.
- **2026-05-20 — Bilateral / Pool Funding tag visibility shipped.** New tokens `--ac-pool-funding-fg` / `--ac-pool-funding-border` registered in `STATUS_COLOR_MAP` under key `'pool-funding'`; surfaces on `my-projects` (table column + sidebar filter + card view) and `project-detail` (clickable badge for Center Admins). New admin page `/administration/center-admin/agresso-pool-funding-tag` for manual tag override. Spec: [`../specs/archive/2026-05-26-bilateral-module--tag-visibility/`](../specs/archive/2026-05-26-bilateral-module--tag-visibility/). *Rationale*: bilateral module phase 1 — make Pool Funding contracts visible and Center-Admin-overridable before the alignment-section work lands.
- **2026-05-23 — Bilateral / Pool Funding Alignment section shipped (12th result tab, conditionally rendered).** New `STATUS_COLOR_MAP` entry `'pf-synced'` reusing `--ac-grey-700` (no new tokens) for the synced/read-only badge; sidebar entry positioned between "Alliance alignment" and "Partners" and hidden when `eligible !== true` (signal-driven via `BilateralService.currentAlignment`). Real-time reconcile via the new Socket.IO event `result.pool-funding-alignment.changed` with a dirty-state guard (info toast on conflict). AR.3 holds: alignment is NOT in the submission validator (`pool_funding_alignment` intentionally absent from the `GreenChecks` interface; regression test in `submission.service.spec.ts`). Spec: [`../specs/archive/2026-05-26-bilateral-module--alignment-section/`](../specs/archive/2026-05-26-bilateral-module--alignment-section/). *Rationale*: bilateral module phase 2 — let editors record Pool Funding contribution + lever selection per result with cross-tab real-time coherence.
- **2026-05-24 — Pool Funding Alignment remediated to match the Figma mockups + canonical layout / typography.** Seven visual / copy / placement defects were fixed (RR-A..F + G + I in [`../specs/archive/2026-06-10-bilateral-module--indicator-mapping/design.md`](../specs/archive/2026-06-10-bilateral-module--indicator-mapping/design.md) §4.7), plus a parent-page-load fix (sidebar tab wouldn't appear because `BilateralService.currentAlignment` was only loaded when navigating into the tab — chicken-and-egg), a URL pattern fix (bilateral routes are URI-versioned: `v1/results/<digits>/pool-funding-alignment`; the FE must strip `STAR-` from route params before calling), defensive injection of `WebsocketService` / `ClarityService` (the app does NOT register `SocketIoModule.forRoot(...)` in production providers — until backend/infra adds it, the alignment tab degrades gracefully), and a layout pass aligning the tab with the shell pattern (`.app-page-wrapper`, `.section-title`, single `<app-navigation-buttons>` footer instead of a duplicated Save). *Rationale*: trust the Figma mockups under [`../specs/archive/2026-06-17-bilateral-module/figma-mockups/`](../specs/archive/2026-06-17-bilateral-module/figma-mockups/) as the canonical UX source; reuse the canonical layout primitives (§6 Layout Patterns, §7.4 Form fields) instead of bespoke Tailwind classes — see §7.4.1 for the form-label class binding contract added in the same change.
- **2026-05-27 — Bilateral / Pool Funding indicator-mapping spec locked on the backend's result-scoped HLOs+indicators endpoint** (T-15.12 / commit `907993e7` on `AC-1594-bilateral-module-v2`). *Spec-level decision; UI not yet shipped (gated by OQ-IM-1).* The FE will consume `GET /api/v1/results/:resultCode/pool-funding-alignment/hlos-indicators`, which returns the SP → AOW → outcome/output → indicator tree pre-grouped via `pairs[]`, sourced **live** from CLARISA + PRMS through a 5-min backend cache. AOW is **not** a first-class ARI entity — it's a CLARISA level-2 taxonomy entry (`prefix=AOW`, parent SP) read transitively from each result's `bilateral_project_mapping`; 1:1 cardinality indicator → AOW. The earlier-planned catalog-wide `GET .../indicators` + client-side AOW regrouping is withdrawn (`IndicatorGroupResponse` / `AreaOfWorkGroup` types never enter the codebase). The HLO modal handles three `aow_status` values: `unmapped` (operator-prerequisite block), `no_aow_mappings` (flat-per-SP default per new REQ-BIL-IM-19), `has_aow` (canonical tree). *Rationale*: backend already exposes the data shape the mockups need; no value in asking for a parallel catalog endpoint. **Trade-off**: the FE mirrors the raw PRMS shape (`PrmsTocIndicator`) and derives per-row enrichment (`is_quantitative`, `disabled_reason`) client-side until backend mirrors the safe-bundle fields onto that DTO. Spec: [`../specs/archive/2026-06-10-bilateral-module--indicator-mapping/`](../specs/archive/2026-06-10-bilateral-module--indicator-mapping/); audit: [`../specs/archive/2026-06-10-bilateral-module--indicator-mapping/open-questions-for-ba.md` §8](../specs/archive/2026-06-10-bilateral-module--indicator-mapping/open-questions-for-ba.md#8-toc-backend-audit--2026-05-27-received). *This entry is unusual in that it predates the shipped UI — recorded now because the backend half already shipped and the contract is locked.*

---

## 13. Open Gaps & Open Questions

- **OG-1**: A formal **design system audit** has not been done against PRMS / STAR siblings. Token names diverge across CGIAR products.
- **OG-2**: **Dark-mode parity** is incomplete on some legacy PrimeNG overrides; not all custom-prime-force-styles.scss rules account for both modes.
- **OG-3**: **Mobile portrait** layouts are undefined ([`../prd.md`](../prd.md) OQ-6).
- **OG-4**: There is no published **icon system** spec — primeicons is used but with no rules for when icons are mandatory vs decorative.
- **OG-5**: The **landing page** is the only public surface and has no dedicated visual identity guidelines.
- **OG-6**: **Empty / error / loading** state patterns are not unified across tables and dashboards.
- **OG-7**: **Localization / i18n** is not yet a constitutional concern; `@angular/build:extract-i18n` exists in `angular.json` but no flows use it.

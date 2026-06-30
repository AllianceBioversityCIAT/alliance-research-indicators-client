# Alliance Research Indicators — Product Requirements Document

> Living document. Update whenever scope, personas, success metrics, or non-goals change. Do not let it drift behind the implementation.

---

## 1. Overview & Purpose

**Alliance Research Indicators** is the web client used by the Alliance of Bioversity International and CIAT (and the broader CGIAR ecosystem) to **report, search, validate, and analyze research results** mapped to a standardized indicator framework. It is the user-facing layer of a multi-platform results federation that includes **STAR, TIP, PRMS, and AICCRA**.

The application's purpose is to let researchers, monitoring & evaluation (MEL) specialists, and center administrators **capture structured evidence of research outcomes** — capacity sharing events, innovation development, policy changes, OICRs (Outcome Impact Case Reports), and related artifacts — using consistent controlled vocabularies (CLARISA institutions, countries, SDGs, levers, impact areas) so that results are **comparable across platforms and reportable to funders and global frameworks**.

This PRD is the canonical "why" of the product. Technical detail belongs in [`detailed-design/detailed-design.md`](./detailed-design/detailed-design.md); UX system rules belong in [`system-design/design.md`](./system-design/design.md).

---

## 2. Problem Statement

Research results inside the Alliance and CGIAR are produced across many platforms, projects, and centers, but historically:

- **Reporting was fragmented.** Each platform stored results in incompatible structures, making cross-platform aggregation expensive and error-prone.
- **Controlled vocabularies drifted.** Institution names, country codes, SDGs, and lever taxonomies were re-entered manually, producing inconsistent reporting to funders and global frameworks.
- **Evidence was scattered.** Files, OICR narratives, partner lists, and policy/innovation metadata lived in spreadsheets, emails, and ad-hoc tools.
- **Auditability was weak.** Centers had limited visibility into who reported what, when, and whether a result had been validated or submitted.

The product solves this by providing **one structured, role-aware, federation-aware interface** to capture, link, search, and analyze results — backed by canonical CLARISA controlled lists and a versioned result lifecycle.

---

## 3. Target Personas

The product is optimized around four primary personas. All four are first-class — UX choices should not regress any of them.

### 3.1 Researcher / Result Reporter
- **Role**: Project staff or scientist responsible for capturing a research result.
- **Primary job-to-be-done**: Create a result, fill the tabbed metadata (general information, partners, evidence, OICR details, IP rights, capacity sharing, policy change, innovation details, geographic scope) accurately, attach evidence, and submit for review.
- **Pain points it must remove**: Re-entering institution / country data, losing form state between tabs, unclear required fields, unclear submission status.

### 3.2 Center Admin
- **Role**: Institutional administrator for a CGIAR center / Alliance unit.
- **Primary job-to-be-done**: Bulk-upload capacity-sharing events, manage center-level SDG alignment, oversee the results produced by their center, and unblock reporters.
- **Pain points it must remove**: No bulk path for high-volume capacity sharing data; no center-scoped overview of in-flight results.

### 3.3 MEL Regional Expert
- **Role**: Monitoring, Evaluation & Learning specialist with regional scope.
- **Primary job-to-be-done**: Review, edit, and validate any result in their scope, ensure quality and alignment, and surface aggregate trends.
- **Pain points it must remove**: Inability to edit results owned by others; lack of trustworthy aggregate views.

### 3.4 Cross-Platform Consumer (STAR / TIP / PRMS / AICCRA)
- **Role**: Anyone — funder reporting analyst, leadership, partner researcher — who needs to **find** results that already exist across federated platforms.
- **Primary job-to-be-done**: Search and dashboard a unified view of results, follow links to results in other platforms, export structured metadata for downstream analysis.
- **Pain points it must remove**: Re-creating results that already exist elsewhere (causing 409-conflict duplication); fragmented dashboards.

> Supporting personas exist (System Admin, anonymous landing-page visitor, IT operator) but are not the focus of product decisions.

---

## 4. Goals & Success Metrics

### 4.1 Product Goals (the "what we want to be true")

1. **One canonical result record.** A research result is captured once, with complete structured metadata, and linkable to its counterparts across STAR / TIP / PRMS / AICCRA.
2. **Trust the taxonomy.** Every controlled-vocabulary field (institutions, geography, SDGs, levers, impact areas) is sourced from CLARISA — not free text.
3. **Role-correct access.** Researchers see and edit their own; Center Admins see their center; MEL Regional Experts see their region; cross-platform consumers see public/federated views — without surprises.
4. **Reportable in minutes, not days.** Aggregate dashboards and structured exports replace ad-hoc spreadsheet work.
5. **Evidence is permanent and findable.** Attached files (PDFs, images, datasets) are stored via the file-manager service and survive result revisions.

### 4.2 Success Metrics (KPIs)

> These KPIs are the testable bar. Concrete numeric targets are **open questions** below — they need product-owner sign-off before they become commitments.

| # | KPI | Why it matters |
|---|-----|----------------|
| M1 | Time-to-submit a complete result (median, by indicator) | Reporting friction is the #1 user complaint |
| M2 | % of results submitted with **zero free-text overrides** of CLARISA-controlled fields | Measures taxonomy adoption |
| M3 | % of results that **link to a cross-platform counterpart** when one exists | Measures federation correctness |
| M4 | Number of 409 duplicate-result conflicts per month | Should trend toward zero as search/linking improves |
| M5 | Active monthly users by persona (Researcher / Center Admin / MEL / Consumer) | Coverage of the four target personas |
| M6 | % of bulk-upload jobs (capacity sharing) that complete without manual fixup | Center Admin productivity |
| M7 | Lighthouse / Web Vitals scores on Home, Results Center, Dashboard | UX quality floor |
| M8 | WCAG 2.1 AA conformance on changed screens (per release) | Accessibility floor |

---

## 5. Scope

### 5.1 In Scope

- Authenticated, role-aware web client built on **Angular 19 + PrimeNG 19**.
- Result lifecycle: **create, edit, version, submit, search, link, export**.
- Result metadata tabs: general information, links to result, alliance alignment, partners, evidence, OICR details, IP rights, capacity sharing, policy change, innovation details, geographic scope.
- Indicator catalog browser and "About Indicators" educational surface.
- Results Center hub, dashboard / charts, and full-text search.
- Project portfolio view ("My Projects") and project detail with linked results.
- Center Admin tools: capacity-sharing bulk upload, SDG management, portfolio management.
- Real-time presence / notifications / alerts via WebSocket.
- Multi-platform federation: cross-platform result linking and duplicate detection (409 handling).
- Excel export (ExcelJS), PDF preview (pdfjs-dist), OICR download workflows.
- Light & dark theming via PrimeNG Aura preset and CSS-variable token system.
- Analytics: Hotjar, Microsoft Clarity, Google Analytics, BugHerd feedback.

### 5.2 Out of Scope (Non-Goals)

- **Backend ownership.** The NestJS-style APIs (`mainApiUrl`, `textMiningUrl`, `fileManagerUrl`) and CLARISA are external systems. This repo consumes them; it does not define their data model.
- **Identity provider alternatives.** Auth stays on **AWS Cognito + JWT**. No SAML, no enterprise SSO branching in this client.
- **Framework migration.** No React / Vue / Svelte rewrite. The stack is locked at Angular 19 + PrimeNG 19 for the foreseeable horizon of this document.
- **Parallel taxonomies.** Institutions, countries, regions, SDGs, levers, impact areas — none are re-implemented locally. They come from CLARISA.
- **Standalone mobile app.** The web client must be responsive (and is tuned for landscape/height ≤768px) but no native iOS/Android shell is in scope.
- **Cross-platform write federation.** This client does not write results back into STAR / TIP / PRMS / AICCRA — it only **links** to them.
- **Custom AuthZ engine.** Authorization is role-based and enforced by the backend; the client mirrors but does not replace those checks.

---

## 6. User Stories

Stories are grouped by persona. They are intentionally outcome-shaped, not implementation-shaped.

### Researcher / Result Reporter

- **R-1**: As a researcher, I can **create a new result** for an indicator and have the system pre-populate my center, contact info, and known project links so I don't re-type them.
- **R-2**: As a researcher, I can **save partial progress** on any tab and return later without losing data.
- **R-3**: As a researcher, I can **attach evidence files** (PDFs, images, datasets) to a result, with progress feedback and a permanent reference URL.
- **R-4**: As a researcher, I am **warned before creating a duplicate** of a result that already exists in another platform (or in this one), and I can choose to link instead.
- **R-5**: As a researcher, I can **submit a result for MEL review** and see its status (draft / submitted / accepted / returned) at a glance.
- **R-6**: As a researcher, I can **search by free text, indicator, year, country, partner, or project** and find my own and the Alliance's prior work.

### Center Admin

- **CA-1**: As a Center Admin, I can **bulk-upload capacity-sharing events** for my center from a structured template and see per-row validation errors.
- **CA-2**: As a Center Admin, I can **see the in-flight results** owned by my center and the bottlenecks in their lifecycle.
- **CA-3**: As a Center Admin, I can **manage SDG alignment** for my center so reporting rolls up correctly.

### MEL Regional Expert

- **MEL-1**: As a MEL Regional Expert, I can **edit any result in my scope**, leave structured feedback, and accept or return it.
- **MEL-2**: As a MEL Regional Expert, I can **view aggregate dashboards** filtered by region, indicator, and year.
- **MEL-3**: As a MEL Regional Expert, I can **export structured metadata** of selected results to Excel for offline analysis.

### Cross-Platform Consumer

- **CP-1**: As a cross-platform consumer, I can **search across STAR / TIP / PRMS / AICCRA** and see results from all of them in one list.
- **CP-2**: As a cross-platform consumer, I can **follow a deep link** to a result and see its full metadata, evidence, partners, and cross-platform counterparts.
- **CP-3**: As a cross-platform consumer, I can **download an OICR template / report** when needed.

### System-wide

- **S-1**: As any user, I can **switch between light and dark mode** and have the choice persist.
- **S-2**: As any user, I receive **real-time notifications and alerts** without refreshing the page.
- **S-3**: As any user, the app **respects my role** — I never see actions I'm not allowed to perform.

---

## 7. Acceptance Criteria

The following are the **always-on** acceptance bars. Per-feature ACs live in module specs under `docs/specs/<domain>/`.

1. **Auth correctness.** Unauthenticated users only see `landing`, `login`, `auth`. JWT-protected routes are gated by `rolesGuard`. Center-admin routes are gated by `centerAdminGuard`. Expiring tokens are proactively refreshed before request dispatch.
2. **Role correctness.** Edit/destroy actions are hidden when the backend would reject them. Center Admin and MEL Regional Expert see scopes consistent with their `role_id` (1, 9, 10) and `sec_role_id` / `focus_id` where applicable.
3. **Controlled-list integrity.** No screen allows free-text entry for a field that maps to a CLARISA list (institutions, countries, regions, subnational, SDGs, levers, languages, delivery modalities, session types).
4. **Result lifecycle integrity.** A submitted result cannot be silently overwritten. Version transitions are persisted and visible.
5. **Duplicate detection.** Creating a result that collides with an existing record (same platform_code + official_code) surfaces a 409 conflict and links to the existing result instead of producing a duplicate.
6. **Evidence durability.** Files uploaded via the file-manager service have a stable URL and survive result edits.
7. **Real-time integrity.** WebSocket disconnects degrade gracefully; the UI never blocks on a missing socket.
8. **Theming.** Both light and dark theme render every screen without unreadable contrast or broken layout. Users can toggle and the choice persists.
9. **Accessibility floor.** Every changed screen meets **WCAG 2.1 AA**: keyboard reachable controls, visible focus, labels on inputs, sufficient color contrast, accessible names for icon-only buttons.
10. **Performance floor.** Production bundle stays within the budgets declared in `angular.json` (initial ≤ 3 MB, component styles ≤ 8 kB). New lazy routes do not push initial bundle past the warning threshold (2 MB).
11. **Testing floor.** Unit tests via Jest meet or exceed the project's coverage thresholds (statements 40%, branches 20%, lines 45%, functions 30%) and do not regress on changed files.

---

## 8. Assumptions, Dependencies, & Constraints

### 8.1 Assumptions

- **A-1**: CLARISA controlled lists are authoritative and reasonably stable. Lists are cached client-side (via `control-list-cache.service.ts`, `dropdowns-cache.service.ts`).
- **A-2**: The backend exposes a consistent `MainResponse<T>` envelope (`successfulRequest`, `status`, `data`, `errorDetail`).
- **A-3**: Users have modern evergreen browsers (Chromium, Firefox, Safari current — Angular 19 baseline).
- **A-4**: Federation partners (STAR / TIP / PRMS / AICCRA) provide deep-link-able result URLs that this client can reach.

### 8.2 Dependencies

- **D-1**: **CLARISA** — institutions, countries, regions, subnational, SDGs, levers, impact areas.
- **D-2**: **Main API** (NestJS-style REST) at `environment.mainApiUrl`.
- **D-3**: **Text-mining microservice** at `environment.textMiningUrl` — used by intelligence/auto-fill flows.
- **D-4**: **File-manager microservice** at `environment.fileManagerUrl` — evidence uploads.
- **D-5**: **AWS Cognito** for authentication.
- **D-6**: **WebSocket gateway** (ngx-socket-io target) for live presence, notifications, alerts, room collaboration.
- **D-7**: **Analytics / feedback SaaS** — Hotjar, Microsoft Clarity, Google Analytics, BugHerd.
- **D-8**: **CI/CD** — GitHub Actions workflows (`jenkins-trigger.yml`, `sonarcloud-analysis.yml`, `unit-tests.yml`); deployment images via Docker + Nginx.

### 8.3 Constraints (Hard Rules)

- **C-1**: Stack is **Angular 19 + PrimeNG 19**. No framework migration.
- **C-2**: Auth is **AWS Cognito + JWT**. No alternative IdPs.
- **C-3**: Controlled vocabularies come from **CLARISA**. No parallel taxonomies.
- **C-4**: Accessibility minimum is **WCAG 2.1 AA**.
- **C-5**: Bundles must respect the budgets in `angular.json`.
- **C-6**: New features must be **lazy-loaded standalone components** (the established routing model). No NgModules.

---

## 9. Open Questions

These items intentionally remain unresolved. They block specific commitments and should be triaged with the product owner.

- **OQ-1**: What are the **numeric targets** for the KPIs in §4.2 (e.g., target median time-to-submit, target free-text-override rate)?
- **OQ-2**: What is the **canonical role list** beyond Admin (1), Center Admin (9), MEL Regional Expert (10)? Are there others (e.g., reviewer, project manager) we should formalize?
- **OQ-3**: Is **light + dark theme parity** a hard requirement for every new screen, or "nice to have"? (Not codified as a hard constraint in this baseline — confirm.)
- **OQ-4**: What is the **data-retention policy** for results submitted from decommissioned platforms (e.g., if AICCRA winds down)?
- **OQ-5**: Should **cross-platform write federation** ever come into scope? Currently out of scope (§5.2).
- **OQ-6**: What is the **mobile / tablet** support matrix? The CSS includes a `md:` breakpoint tuned to landscape & height ≤ 768px — is that the official target?
- **OQ-7**: Are there **compliance constraints** (GDPR, funder data-handling) that should be reflected explicitly in the constitution?
- **OQ-8**: What is the **expected SLO** (uptime, p95 latency) for the backend services this client depends on?

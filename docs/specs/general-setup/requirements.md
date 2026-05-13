# SDD Requirements Template

> Methodology template used by `/sdd-specify`. Every module-level spec under `docs/specs/<domain>/<feature>/requirements.md` must follow this structure.
>
> **Not a feature spec itself.** This file defines the *format* for future requirement documents.

---

## How to use this template

1. Pick the domain folder under `docs/specs/` that matches your work. The taxonomy is **by domain module**, mirroring the page modules described in [`../../detailed-design/detailed-design.md`](../../detailed-design/detailed-design.md) §2. Established folders:
   - `docs/specs/results/`
   - `docs/specs/indicators/`
   - `docs/specs/projects/`
   - `docs/specs/dashboard/`
   - `docs/specs/notifications/`
   - `docs/specs/administration/`
   - `docs/specs/auth/`
   - `docs/specs/shared/` (cross-cutting changes to shared components / services)
   - `docs/specs/platform/` (shell / navigation)
2. Inside that folder, create a slug folder for the feature/spec (kebab-case): e.g. `docs/specs/results/bulk-evidence-upload/`.
3. Inside that slug folder, create:
   - `requirements.md` (this template)
   - `design.md` (see `./design.md`)
   - `task.md` (see `./task.md`)
4. Cross-link the spec from [`../../prd.md`](../../prd.md) if it changes scope, personas, or KPIs.

---

## Requirement-numbering convention

- Top-level requirements use the format `REQ-<DOMAIN>-<NN>`, e.g. `REQ-RESULTS-01`.
- `<DOMAIN>` is a 3–8 letter uppercase abbreviation of the domain folder (e.g. `RESULTS`, `IND`, `PROJ`, `DASH`, `NOTIF`, `ADMIN`, `AUTH`, `SHARED`, `PLAT`).
- Sub-requirements use a dot: `REQ-RESULTS-01.1`, `REQ-RESULTS-01.2`.
- Never re-number once published — requirements may be marked deprecated but their IDs are immutable.
- Cross-spec dependencies cite the full ID (`REQ-RESULTS-01` in another spec is unambiguous).

---

## Writing standards

- **One requirement = one testable statement.** "The system shall …" or "The user can …".
- **Outcome, not implementation.** "User can attach a PDF up to 50 MB" — not "We use FormData with multipart/form-data".
- **Acceptance criteria are mandatory** for every requirement. ACs are *testable* — written so a reviewer can decide pass/fail without ambiguity.
- **Reference the PRD.** Each requirement traces back to a persona (PRD §3) and at least one goal (PRD §4).
- **Reference constraints.** If a requirement is shaped by a PRD constraint (C-1 through C-6), call it out.
- **Open questions, not silent guesses.** If something is unknown, log it under §10 Open Questions.

Anti-patterns:

- "Make it fast" — not testable. Quantify (p95 latency, frames per second).
- "Make it intuitive" — not testable. Tie to a measurable UX outcome.
- Mixing solution detail into requirements (belongs in `design.md`).

---

## Template structure

> Copy the structure below into your `requirements.md`. Remove this preamble.

---

### 1. Summary

One paragraph. What problem does this spec solve, for whom, and what outcome will be true when it ships.

### 2. Motivation & PRD Linkage

- **Persona(s)**: list from [`../../prd.md`](../../prd.md) §3 (Researcher / Center Admin / MEL Regional Expert / Cross-Platform Consumer).
- **PRD goal(s) addressed**: cite IDs from PRD §4.1.
- **KPIs moved**: cite IDs from PRD §4.2.
- **User stories addressed**: cite IDs from PRD §6 (e.g., R-3, MEL-1).
- **Non-goals from PRD §5.2 invoked**: any non-goals this spec must avoid violating.

### 3. Scope

#### In scope
- Bulleted list of what *is* included.

#### Out of scope
- Bulleted list of what is *explicitly* excluded (so reviewers and future readers do not assume otherwise).

### 4. Functional Requirements

- **REQ-<DOMAIN>-01** — *Short title.*
  - Statement: "The system shall …" / "The user can …".
  - **Persona(s)**: …
  - **Acceptance criteria**:
    - AC-01.1 — …
    - AC-01.2 — …
  - **Notes**: any clarifications (NOT implementation detail).

- **REQ-<DOMAIN>-02** — *Short title.*
  - …

### 5. Non-Functional Requirements

Each NFR follows the same pattern as functional ones but should have a measurable threshold.

- **REQ-<DOMAIN>-NF-01** — Performance: e.g., "Initial render of the screen completes in ≤ 1.5 s on a mid-range laptop (Lighthouse mobile profile)."
- **REQ-<DOMAIN>-NF-02** — Accessibility: "Screen meets WCAG 2.1 AA on changed surfaces (PRD C-4)."
- **REQ-<DOMAIN>-NF-03** — Bundle budget: "Net JS added to the initial chunk ≤ 50 KB gzipped (respects `angular.json` budgets, PRD C-5)."
- **REQ-<DOMAIN>-NF-04** — Theming: dark + light parity for new screens unless an exemption is recorded.
- **REQ-<DOMAIN>-NF-05** — i18n / locale (if applicable): all user-facing strings extractable.

### 6. Data Inputs & Outputs

- **Inputs**: REST endpoints, query/path params, request bodies (cite `ApiService` methods).
- **Outputs**: response shapes (cite `interfaces/`).
- **Persisted state**: any client-side cache / signals introduced (cite `shared/services/cache.service.ts` or equivalent).

### 7. Controlled Vocabularies

If the spec touches institutions, countries, regions, subnational, SDGs, levers, impact areas, languages, delivery modalities, session types — confirm here that the source is **CLARISA** (PRD C-3). If a parallel taxonomy is unavoidable, escalate to the open-questions section.

### 8. Role & Permission Matrix

| Action | Researcher | Center Admin | MEL Regional Expert | Cross-Platform Consumer | Anonymous |
|--------|------------|--------------|---------------------|-------------------------|-----------|
| (e.g., create a result) | ✅ | ✅ | ✅ | ❌ | ❌ |
| … | | | | | |

Mirror server-side enforcement; do not invent client-only rules.

### 9. Telemetry & Observability

- What events fire (Hotjar / Clarity / GA / BugHerd)?
- What error states surface (toast, alert, inline)?

### 10. Assumptions & Open Questions

- A-1: …
- OQ-1: …

### 11. References

- [`../../prd.md`](../../prd.md) §X
- [`../../system-design/design.md`](../../system-design/design.md) §X
- [`../../detailed-design/detailed-design.md`](../../detailed-design/detailed-design.md) §X
- Any related specs (`docs/specs/<domain>/<sibling>/requirements.md`).

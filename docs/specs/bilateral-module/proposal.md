# Proposal — Bilateral Module (STAR Frontend)

> Umbrella proposal for building the bilateral / Pool Funding Alignment module in the STAR client (`research-indicators/`). Created by `/sdd-propose`. Approved scope from this doc is split into three feature folders, each of which becomes a separate `/sdd-specify` run.

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec path | `docs/specs/bilateral-module/` |
| Proposal path | `docs/specs/bilateral-module/proposal.md` |
| Author | STAR (`AC-1594-bilateral-module`) |
| Status | DRAFT — awaiting approval |
| Created | 2026-05-19 |
| Domain | Cross-cutting (touches `results/`, `projects/`, `administration/`) |
| Constitutional anchors | [`docs/prd.md`](../../prd.md) · [`docs/system-design/design.md`](../../system-design/design.md) · [`docs/detailed-design/detailed-design.md`](../../detailed-design/detailed-design.md) · root [`CLAUDE.md`](../../../CLAUDE.md) |
| Context corners (inputs) | [`figma-mockups/`](./figma-mockups/) · [`jira-us/`](./jira-us/) · [`prms-context/`](./prms-context/) · [`ari-backend-context/`](./ari-backend-context/) |
| Backend handoff snapshot | [`ari-backend-context/frontend-handoff.md`](./ari-backend-context/frontend-handoff.md) @ ARI `7cb00e07` |

---

## 2. Intent

Let a Principal Investigator working on a **W3/Bilateral-funded result** confirm whether that result contributes to **CGIAR Pool Funding** (Science Programs / Accelerators), and — when it does — map the result to specific **Theory of Change indicators**, mirroring what the ARI backend already exposes as `/api/v1/results/:resultCode/pool-funding-alignment`. The module is built end-to-end against the **LIVE** backend surface (Phase 1 + Phase 2); the **PENDING** Phase-3 surfaces (PRMS push, W3 sync, SP ToC sync) are explicitly deferred.

The product question this answers, paraphrased from PARI-194 / AC-1385: *"how do we link bilateral results to CGIAR Pool Funding so contributions are traceable and auditable?"*

---

## 3. Problem / current behavior

Today, in this STAR client:

- A result detail page (`/result/:id`) has **11 tabs** and **none of them** capture Pool Funding alignment.
- The results-center, search-a-result, projects, and project-detail surfaces do **not** distinguish bilateral-tagged results from the rest. There is no AGRESSO Pool Funding column, badge, filter chip, or Excel column.
- The center-admin area (`administration/center-admin/`) does **not** expose a manual override for the AGRESSO Pool Funding tag.
- The Cognito-backed `RolesService` knows about CONTRIBUTOR / CENTER_ADMIN / SYSTEM_ADMIN, but no surface today blends "role" with "ownership of this result" — bilateral mutations require both.
- The `websocket.service.ts` is wired for presence/notifications but does not subscribe to `result.pool-funding-alignment.changed`.

Backend side, the LIVE endpoints already exist (`GET/PATCH /pool-funding-alignment`, indicators panel, contribution POST/PATCH/DELETE per indicator type, AGRESSO tag PATCH/GET — see [`ari-backend-context/frontend-handoff.md` §4](./ari-backend-context/frontend-handoff.md#4-api-surface-phase-1--phase-2--live-today)). They sit unused by this client.

The gap: no UI consumes the live API.

---

## 4. Proposed outcome

When this work ships (LIVE-scope only), the following will be true:

- **AGRESSO Pool Funding tag is visible everywhere a contract / project is listed.** Results-center, search-a-result, my-projects, project-detail, and any contract-aware Excel export all show an `is_pool_funding_contributor` column / badge and offer a "Pool Funding only" filter chip.
- **Center Admins can override the AGRESSO tag manually** from a center-admin surface, with the server enforcing "must be bilateral".
- **A new "Pool Funding Alignment" tab appears on the result detail page** — but *only* when the result is eligible (`eligible=true` from the GET). When ineligible, the tab is hidden entirely (not greyed out).
- **PIs (Creator / PI / contact), Center Admins, and System Admins can edit** the alignment: pick `has_contribution`, select one or more Science Program / Accelerator levers, optionally justify. Edits succeed regardless of `result_status`.
- **After PRMS sync, the section becomes fully read-only.** A "synced — read only" badge replaces the edit CTA. Mutations are blocked at the UI before they would 409 at the server.
- **For each selected lever**, an indicators panel renders the ToC indicators with stale-badge handling. Today the panel renders the "ToC catalog not yet synced" empty state (until backend T-31 lands).
- **Per indicator, a type-specific contribution form** captures the right shape — `capacity_sharing`, `knowledge_product`, `policy_change`, `innovation_development`, or `NOOP` — preserving the D12 deliberate typos verbatim.
- **Other tabs editing the same result reconcile in real time** via `result.pool-funding-alignment.changed`.
- **The alignment is optional for result submission** (AR.3) — submission validators are not blocked by an empty alignment.

Out of scope (deferred until backend ships):
- Push to PRMS UI surfaces (US5 / `R-BIL-040..045`).
- W3 Registry sync UI (US6 / `R-BIL-050..053`).
- SP ToC sync UI (US7 / `R-BIL-060..063`).
- The `innovation_use` indicator type (D5=C) and Innovation Package (D13) — no backend handler exists.

---

## 5. Scope

### In scope (this proposal → three feature folders)

1. **`bilateral-module/tag-visibility/`** — AGRESSO Pool Funding tag on lists + center-admin override (US1 / `R-BIL-001..003`).
2. **`bilateral-module/alignment-section/`** — new result-detail tab, GET/PATCH alignment, conditional render, read-only-after-sync, Socket.IO reconcile (US2 / `R-BIL-010..016`).
3. **`bilateral-module/indicator-mapping/`** — indicators panel + per-`indicator_type` contribution forms with stale handling (US3 + US4 / `R-BIL-020..035`).

### Out of scope

- **PRMS push surfaces** (US5) — `R-BIL-040..045`. Backend tasks T-25..T-28 not started.
- **W3 Registry sync surfaces** (US6) — `R-BIL-050..053`. Backend tasks T-22/T-29/T-30 blocked.
- **SP ToC sync surfaces** (US7) — `R-BIL-060..063`. Backend tasks T-31/T-32 pending.
- **`innovation_use`** indicator type — deferred per D5=C; no backend handler exists.
- **Innovation Package** (PRMS result type 10) — deferred per D13.
- **i18n** — root [`CLAUDE.md`] says i18n is not wired; copy is English-only for now, tracked as Q-BIL-i18n in §11.
- **NgRx** — explicitly excluded by PRD §C-6 and detailed-design §6.2; state lives in signals.

---

## 6. Non-goals

- We will **not** introduce a new auth flow. Bilateral surfaces ride the existing Cognito JWT + `jWtInterceptor`.
- We will **not** add a client-side feature-flag system. Backend env vars (`ARI_BILATERAL_*`) gate the API; when the module is off, every endpoint returns 404 and the UI degrades to the standard 404/empty-state path.
- We will **not** invent a parallel taxonomy for Science Programs / levers / indicators (per PRD C-3 — CLARISA / backend is authoritative).
- We will **not** "fix" the deliberate D12 typos (`has_unkown_using`, `readinness_level_id`, British `licence`). Matching the backend exactly is the contract.
- We will **not** block result submission on an empty alignment (per AR.3 / `R-BIL-016`).
- We will **not** parse raw `T` from HTTP — every call goes through `ApiService` and handles `MainResponse<T>` (per detailed-design §4).

---

## 7. Affected users, systems, and specs

### Users / personas (per PRD §3)

- **Researcher (PI / Contributor)** — primary author of alignment + contributions.
- **Center Admin** — owns the AGRESSO tag override; bypasses ownership; can edit any result's alignment.
- **System Admin** — full access.
- **MEL Regional Expert** — read-only on bilateral surfaces today.
- **Cross-Platform Consumer** — sees the AGRESSO column in exports / search.

### STAR areas touched

| Area | Path | Change |
| --- | --- | --- |
| Result detail | `src/app/pages/platform/pages/result/` + child route in `app.routes.ts` | New `pool-funding-alignment` child route (12th tab) — conditionally rendered |
| Results-center | `src/app/pages/platform/pages/results-center/` | New column + filter chip |
| Search-a-result | `src/app/pages/platform/pages/search-a-result/` | Same column + filter chip |
| My-projects | `src/app/pages/platform/pages/my-projects/` | Column on contract list |
| Project-detail | `src/app/pages/platform/pages/project-detail/` | Badge in contract header |
| Center-admin | `src/app/pages/platform/pages/administration/center-admin/` | New `agresso-pool-funding-tag/` page (PATCH manual override) |
| Shared services | `src/app/shared/services/` | New `bilateral.service.ts` delegating to `ApiService` |
| Shared interfaces | `src/app/shared/interfaces/` | New `pool-funding-alignment.interface.ts` family (D12 typos verbatim) |
| Shared sockets | `src/app/shared/sockets/websocket.service.ts` | Subscribe to `result.pool-funding-alignment.changed` |
| Shared guards | `src/app/shared/guards/` | Possibly extend `rolesGuard` to handle role-or-ownership semantics; or do it in-component |
| Modal host | `src/app/shared/components/all-modals/` | New HLO selection / lever picker modal |

### Specs / docs touched

- **Creates**: `docs/specs/bilateral-module/{tag-visibility,alignment-section,indicator-mapping}/{requirements,design,task}.md` (nine files, via three `/sdd-specify` runs).
- **Updates**: [`docs/system-design/design.md`](../../system-design/design.md) §12 (design decisions log — record the conditional-tab pattern, stale badge token, sync-read-only badge); [`docs/detailed-design/detailed-design.md`](../../detailed-design/detailed-design.md) §2 (add bilateral-module row), §4 (new endpoints), §6 (`BilateralService`), §9 (new socket event).
- **No change**: PRD scope (the personas, KPIs, and constraints already cover this work).

### External dependencies

- **ARI backend `AC-1594-bilateral-module`** — LIVE endpoints in §4 of the handoff. The proposal assumes this branch is the integration target until it merges to `staging` / `main`.
- **Figma mockups** — visual reference in [`figma-mockups/`](./figma-mockups/); empty-state for "ToC not synced" is a known gap (Q-BIL-empty-state).
- **CLARISA** — already wired in this client for institutions, countries, SDGs, levers (per C-3). No new CLARISA work needed for bilateral.

---

## 8. Requirement delta preview

> Lightweight preview only. Final IDs and acceptance criteria are produced by `/sdd-specify` against the templates in [`../general-setup/`](../general-setup/). Domain abbreviation: `BIL`.

### ADDED requirements

- **REQ-BIL-01** — *Result lists surface the AGRESSO Pool Funding tag.* Results-center, search-a-result, my-projects, project-detail surface `is_pool_funding_contributor` as a column / badge with a filter chip.
- **REQ-BIL-02** — *Center Admin can override the AGRESSO Pool Funding tag.* New center-admin surface that calls `PATCH /agresso/contracts/:code/pool-funding-tag`.
- **REQ-BIL-03** — *Pool Funding Alignment tab is conditionally rendered.* The tab is hidden when `eligible=false`. When `is_read_only=true`, the section renders read-only with a "synced — read only" badge.
- **REQ-BIL-04** — *PI / owner / Center Admin / System Admin can edit alignment.* Toggle `has_contribution`, multi-select levers, optionally justify. Edits succeed regardless of `result_status` (AR.1).
- **REQ-BIL-05** — *Indicators panel renders per selected lever* with search + `indicator-type` filter, stale badge per `R-BIL-035`, and explicit empty-state when the ToC catalog is unsynced.
- **REQ-BIL-06** — *Per-indicator contribution form is polymorphic by `indicator_type`* — `capacity_sharing`, `knowledge_product`, `policy_change`, `innovation_development`, `NOOP`. Field shapes preserve D12 typos verbatim.
- **REQ-BIL-07** — *Real-time reconcile on alignment change.* Subscribe to `result.pool-funding-alignment.changed`; when a sibling tab edits, the current tab refreshes its read model.
- **REQ-BIL-08** — *Module degrades gracefully when backend flags are off.* When `ARI_BILATERAL_MODULE_ENABLED=false`, the tab vanishes and list columns hide via 404 detection on the GET.

### MODIFIED requirements

- **MOD-RESULT-DETAIL-TABS** — result-detail child route set gains a 12th, conditionally-rendered tab. Sidebar / tab navigation must accept a dynamic "render only if eligible" signal.
- **MOD-RESULT-SUBMISSION** — submission validators must explicitly tolerate empty Pool Funding Alignment (AR.3). No change to `PATCH /results/:id/submit` itself.

### REMOVED requirements

- None.

---

## 9. Approach options

### Option A — One-shot module (single feature folder, single /sdd-specify)

Treat `bilateral-module/` itself as the feature folder. One `requirements.md` covering US1 + US2 + US3 + US4. One `design.md`, one `task.md`.

**Pros**: simplest folder layout; everything in one place. Mirrors how the backend organized its own `bilateral-module/` spec.

**Cons**: violates the SDD template's "one folder per feature/spec" rule; the single `requirements.md` would balloon to 30+ REQs; `task.md` becomes a multi-month plan with no natural review checkpoint.

### Option B — Three feature folders, sequenced (RECOMMENDED) ✅

Split into three sub-folders that each map cleanly to a user-story group, a backend phase row, and an obvious slicing point:

```
docs/specs/bilateral-module/
├── proposal.md (this file)
├── figma-mockups/         (context corner)
├── jira-us/               (context corner)
├── prms-context/          (context corner)
├── ari-backend-context/   (context corner)
├── tag-visibility/        ← /sdd-specify #1 (US1 — small, ships value, validates list integrations)
│   ├── requirements.md
│   ├── design.md
│   └── task.md
├── alignment-section/     ← /sdd-specify #2 (US2 — validates the new tab + read-only states + socket)
│   ├── requirements.md
│   ├── design.md
│   └── task.md
└── indicator-mapping/     ← /sdd-specify #3 (US3 + US4 — the heaviest piece, 5 per-type forms)
    ├── requirements.md
    ├── design.md
    └── task.md
```

**Pros**: matches the SDD template; each folder is independently reviewable, mergeable, and demo-able; tag-visibility ships in days, derisks list patterns and CLARISA conflicts early; alignment-section validates the new tab + socket pattern before the heavy form work lands; indicator-mapping inherits a proven service shape from the prior two.

**Cons**: three review cycles, three `/sdd-specify` runs, three task files. More ceremony.

### Option C — Split by domain folder (per the canonical SDD taxonomy)

Distribute the work into the existing domain folders that the SDD template enumerates:
- `docs/specs/results/pool-funding-alignment/` (US2 + US3 + US4)
- `docs/specs/results/agresso-tag-column/` (US1, results-side)
- `docs/specs/projects/agresso-tag-column/` (US1, projects-side)
- `docs/specs/administration/agresso-pool-funding-override/` (US1, admin-side)

**Pros**: orthodox use of the SDD taxonomy ("by domain module").

**Cons**: shatters the four context corners we just built — they sit at `bilateral-module/` and don't belong under `results/` or `projects/` alone. The bilateral module is cross-cutting by nature; pretending otherwise costs traceability.

---

## 10. Recommended approach

**Option B**, sequenced **tag-visibility → alignment-section → indicator-mapping**.

Reasoning:
- The four context corners are already at `bilateral-module/` — the umbrella domain naming is sunk cost in the user's favor.
- Tag-visibility is small and ships visible value to results-center / project-detail users on day one, with low integration risk. It also forces us to confirm the AGRESSO column / filter pattern early before the heavier work depends on it.
- Alignment-section is the *integration shape proof*: new conditional tab + read-only sync state + `result.pool-funding-alignment.changed` socket. Once this lands, the indicator-mapping work just re-uses the same `BilateralService`, the same conditional-render pattern, the same socket plumbing.
- Indicator-mapping is the heaviest: five per-type polymorphic forms, stale-badge handling, search/filter, modal lever-picker. Doing it last means it inherits a tested service + state pattern instead of inventing one.

**Cross-cutting decisions to lock now** (so each sub-spec can lean on them without re-deciding):

| Decision | Recommendation | Why |
| --- | --- | --- |
| Route placement | 12th child of `/result/:id/` — `/result/:id/pool-funding-alignment` | Matches the existing 11-tab pattern. Backend resource is `/api/v1/results/:resultCode/pool-funding-alignment` — symmetry helps. |
| Tab visibility mechanism | Hide via signal-driven nav (eligibility resolved by the result-detail resolver + `BilateralEligibilitySignal`) | A guard that redirects is jarring; an always-visible greyed tab confuses PIs. Hidden-when-ineligible is the same pattern the OICR tab uses today. |
| Service layout | `src/app/shared/services/bilateral.service.ts` delegating to `ApiService` | Per child-CLAUDE.md "A reusable service / API method → `app/shared/services/`". |
| State | Signals (`signal`, `computed`) for alignment, indicators, contribution map. RxJS only for HTTP + socket streams. | Per detailed-design §6 — no NgRx. |
| Interfaces | New `pool-funding-alignment.interface.ts` family, with D12 typos verbatim + an inline `// D12: deliberate typo — see proposal §6` comment at each field | Prevents future "fix the typo" PRs. |
| Socket | Extend existing `shared/sockets/websocket.service.ts`; no new client lib | Backend uses Socket.IO; STAR already has socket plumbing. Confirm the transport in alignment-section design (Q-BIL-socket). |
| 403 UX | Hide edit CTA when local role + ownership disqualify. Don't try to distinguish "wrong role" from "not your result" — both come back as the same `403 description` from the server | Matches backend reality; reduces noise. |
| Stale badge | New `is-stale` token; PrimeNG `Tag` severity `warning` as fallback if no new token is approved | Resolves Q-BIL-stale-badge during alignment-section design. |
| Read-only badge | Reuse existing "synced" affordance (TBD: confirm whether a token exists today) | Coordinate in alignment-section design (Q-BIL-readonly-badge). |
| Feature flags | None on the client. React to 404 from the backend | Backend env vars are authoritative; client should not duplicate state that can drift. |

---

## 11. Risks, dependencies, and open questions

### Risks

- **R1 — Empty indicator catalog default.** Until backend T-31 ships SP ToC sync, every `IndicatorGroupResponse.indicators` array comes back empty. The Figma mockups assume populated data — the "ToC not synced" empty state needs a design before indicator-mapping `/sdd-specify`.
- **R2 — D12 typo erosion.** Future contributors will instinctively "fix" `has_unkown_using` and `readinness_level_id`. Mitigation: inline code comment + ADR row in `design.md` for `indicator-mapping/`.
- **R3 — Conditional tab is a new pattern.** Today's 11 tabs are always visible. Adding a hidden-when-ineligible tab needs the result-detail nav to accept dynamic visibility. Mitigation: validate the pattern during alignment-section design; if it requires non-trivial shell changes, raise to `docs/system-design/design.md` §12 in the same PR.
- **R4 — Socket transport mismatch.** Backend uses Socket.IO; STAR's `websocket.service.ts` may use raw WebSockets. If they're incompatible, we either upgrade the socket layer or do without real-time reconcile in v1. Mitigation: confirm in alignment-section design (Q-BIL-socket).
- **R5 — Bundle budget (C-5).** Five per-type contribution forms could exceed component-style budgets if all eager-bundled. Mitigation: dynamically lazy-load the form for the active indicator type.
- **R6 — Role-or-ownership UI logic.** The `rolesGuard` today is role-only. Ownership lives in result metadata. Putting "PI/owner/contact" logic in the component is fine for v1 but needs a clean place to grow. Mitigation: encapsulate in a `BilateralPermissionsService` and revisit in the alignment-section design.

### Dependencies

- **D1** — ARI backend branch `AC-1594-bilateral-module` (or its merged-to-`staging` successor) must be reachable from `environment.dev.ts`'s `mainApiUrl`.
- **D2** — Figma mockups under [`figma-mockups/`](./figma-mockups/) for default / SP-dropdown / HLO modal / synchronized / no-branch / empty-internal-node states.
- **D3** — Jira ACs under [`jira-us/`](./jira-us/) — `AC-1438`, `AC-1439`, `AC-1440`, `AC-1594`. (`AC-1441`/`AC-1593`/`AC-1595` are deferred per §5 out-of-scope.)

### Open questions (carry forward into the appropriate sub-spec)

- **Q-BIL-socket** — Is `websocket.service.ts` Socket.IO-compatible, or do we need a small adapter? *(Resolve in `alignment-section/design.md`.)*
- **Q-BIL-empty-state** — What does the "ToC not synced" empty state look like? Existing mockups assume populated data. *(Resolve before `indicator-mapping/` `/sdd-specify` — needs a Figma node.)*
- **Q-BIL-stale-badge** — Do we add a dedicated `is-stale` token to `roartheme.ts` or reuse PrimeNG `Tag` severity? *(Resolve in `alignment-section/design.md`.)*
- **Q-BIL-readonly-badge** — Is there an existing "synced" badge token? If not, do we add one or reuse PrimeNG `Tag` severity? *(Resolve in `alignment-section/design.md`.)*
- **Q-BIL-i18n** — STAR has no i18n today (root [`CLAUDE.md`]). Confirm copy stays English-only for now; raise as a separate concern outside this proposal.
- **Q-BIL-tab-visibility** — Confirm the result-detail nav (sidebar/tabs component) can accept a dynamic visibility signal without shell-wide refactor. *(Spike in `alignment-section/design.md`.)*
- **Q-BIL-403-ux** — Is the existing "you can't edit this" affordance reusable, or do we need a new one for the alignment-section? *(Resolve in `alignment-section/design.md`.)*

---

## 12. Success criteria

This work is "done" when, against the LIVE backend on `staging`:

- **List surfaces** — A PI / Center Admin can see and filter Pool Funding contracts from results-center, search-a-result, my-projects, and project-detail. Backend-served column data matches what they see. (US1)
- **Center-admin override** — A Center Admin can flip the AGRESSO Pool Funding tag for a bilateral contract; non-bilateral contracts are rejected by the server and the UI surfaces the validation error inline. (US1 / `R-BIL-002`)
- **Alignment edit** — A PI on an eligible result can set `has_contribution`, pick at least one lever, and save; the PATCH succeeds; the section reflects the new state; another tab on the same result reconciles via socket within 2 s. (US2 / `R-BIL-010..014`)
- **PRMS sync read-only** — When `is_synced_to_prms=true`, every input is disabled, a "synced — read only" badge appears, and any attempt to mutate (e.g., via stale tab) shows a clear 409 error toast. (US2 / `R-BIL-015`, AR.2)
- **Status-independence** — Editing succeeds with the result in `DRAFT`, `EDITING`, or any other non-`SYNCED` status (AR.1). Submission CTAs are not blocked by an empty alignment (AR.3).
- **Indicators panel** — For each selected lever, the panel renders the empty state today and (once T-31 lands server-side) renders the ToC indicators with correct `is_active` / `is_stale` / `is_mapped` flags. (US3 / `R-BIL-020..022`)
- **Per-type contributions** — For an indicator of each supported type (`capacity_sharing`, `knowledge_product`, `policy_change`, `innovation_development`, `NOOP`), a PI can save a contribution and re-edit / delete it. The body shape matches the backend, deliberate typos included. (US4 / `R-BIL-030..035`)
- **Auth boundaries** — `MEL_REGIONAL_EXPERT` and `TECHNICAL_SUPPORT` see read-only surfaces; `CONTRIBUTOR` outside ownership sees no edit CTA; `CENTER_ADMIN` / `SYSTEM_ADMIN` see full edit. (`R-BIL-013`)
- **Hard rules** — C-1 (Angular 19 + PrimeNG 19), C-2 (Cognito JWT), C-3 (CLARISA), C-4 (WCAG 2.1 AA on every changed screen), C-5 (bundle budgets respected), C-6 (lazy-loaded standalone components) all honored.

When the deferred Phase-3 endpoints ship server-side, a follow-up proposal (or a fresh `/sdd-propose` on this same domain folder) picks them up.

---

## 13. Next step

If this proposal is approved as-is:

```text
/sdd-specify bilateral-module/tag-visibility
```

Then, in sequence after tag-visibility ships:

```text
/sdd-specify bilateral-module/alignment-section
/sdd-specify bilateral-module/indicator-mapping
```

If the recommended approach needs revision (e.g., user wants Option A or C, or wants to start with `alignment-section` instead of `tag-visibility`), update §10 and §13 here before invoking `/sdd-specify`.

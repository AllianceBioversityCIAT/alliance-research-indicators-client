# Requirements — Center Admin: Bilateral Project Mapping

> SDD requirements for `docs/specs/bilateral-module/center-admin-project-mapping/`. Depth: **Standard**.
> Derived from the approved [`proposal.md`](./proposal.md). Domain abbreviation: **BIL** · feature code **CAM** (Center Admin Mapping).

---

## 1. Summary

Center Admins today manage **bilateral project mappings** (an AGRESSO bilateral contract ↔ a CLARISA project) only through a **separate React SSR admin page** (`/admin/bilateral-project-mappings`) hosted inside the NestJS backend, disjoint from the STAR client's admin experience. This spec adds a **native "Bilateral Mapping" page inside the STAR client's Center Admin area** that lists, searches, creates, edits, and deactivates these mappings by consuming the **already-implemented** backend REST API. When it ships, Center Admins manage bilateral mappings in one consistent surface alongside Bulk upload, AGRESSO Pool Funding Tag, and SDG Management, and the React SSR page is deprecated.

The backend (`alliance-research-indicators-main`) is **consume-only** for this spec: no new server behavior is required.

---

## 2. Motivation & PRD Linkage

- **Persona(s):** Center Admin (primary), System Admin (superset access).
- **PRD goal(s) addressed:** administrative data-stewardship of bilateral/Pool-Funding linkage (the mapping that lets a bilateral contract resolve to a CLARISA project and its Science Programs).
- **User stories addressed:** continuation of the bilateral-module admin arc (AGRESSO Pool Funding Tag override is the sibling surface); this page owns the contract→project mapping itself.
- **Non-goals invoked:** no changes to ToC / Pool Funding Alignment (indicator contribution) behavior; the backend remains authoritative (client mirrors UX only).

---

## 3. Scope

### In scope
- New Center Admin menu entry + route + page in the STAR client (`alliance-research-indicators-client`).
- List mappings with pagination, free-text search, and filters (`is_active`, `source`).
- Create a mapping via AGRESSO-contract and CLARISA-project pickers (+ optional notes).
- Edit an existing mapping (re-point CLARISA project / edit notes).
- Deactivate (soft-delete) a mapping.
- Surface the one-active-mapping-per-agreement rule (HTTP 409) as an actionable error.
- Client-side role gate reusing `centerAdminGuard`.
- Backend **verification only**: confirm envelope/auth/CORS/picker payload parity.

### Out of scope
- Any new backend feature work (endpoints, fields, validation, migrations).
- AI suggestion / auto-mapping generation (`AI_SUGGESTED` / `AI_AUTO` rows are displayed/edited, not produced here).
- Bulk import of mappings.
- Hard delete / physical removal of mappings.
- Removal of the React SSR page `/admin/bilateral-project-mappings` (deferred cleanup, tracked in `tasks.md` §9).
- Changes to ToC / Pool Funding Alignment or the AGRESSO Pool Funding Tag pages.

---

## 4. Functional Requirements

- **REQ-BIL-CAM-01** — *Center Admin navigation entry.*
  - Statement: The system SHALL expose a "Bilateral Mapping" entry in the Center Admin navigation group, visible only to users who pass the center-admin access check.
  - **Persona(s):** Center Admin, System Admin.
  - **Acceptance criteria:**
    - AC-01.1 — GIVEN a signed-in Center Admin, WHEN they open the administration sidebar, THEN a "Bilateral Mapping" item appears under the "Center admin" group, alongside Bulk upload / SDG Management.
    - AC-01.2 — GIVEN a user who is not a Center/System Admin, WHEN they view the sidebar, THEN the "Bilateral Mapping" item is not rendered.
    - AC-01.3 — WHEN the item is activated, THEN the app navigates to `/administration/center-admin/bilateral-mapping`.

- **REQ-BIL-CAM-02** — *Route protection.*
  - Statement: The system SHALL restrict the Bilateral Mapping route to center-admin-eligible users, redirecting others.
  - **Persona(s):** Center Admin, System Admin.
  - **Acceptance criteria:**
    - AC-02.1 — GIVEN a non-eligible user navigates directly to `/administration/center-admin/bilateral-mapping`, WHEN the route is matched, THEN `centerAdminGuard` blocks it and redirects to `/home`.
    - AC-02.2 — GIVEN an eligible user, WHEN they navigate to the route, THEN the page loads (lazy `loadComponent`).
  - **Notes:** Client gate mirrors server enforcement (`RolesGuard` + `CENTER_ADMIN`/`SYSTEM_ADMIN`); the server remains authoritative.

- **REQ-BIL-CAM-03** — *List existing mappings.*
  - Statement: The user can view a paginated list of bilateral project mappings.
  - **Persona(s):** Center Admin, System Admin.
  - **Acceptance criteria:**
    - AC-03.1 — WHEN the page loads, THEN it requests page 1 and renders rows showing: AGRESSO agreement id, CLARISA project (short name + id), source, confidence (shown only when source ≠ MANUAL), active state, and last-updated.
    - AC-03.2 — GIVEN more results than one page, WHEN the user changes page, THEN the corresponding page is fetched and rendered, and total/page/limit are reflected in the paginator.
    - AC-03.3 — GIVEN the list request fails, THEN a non-blocking error state is shown with a retry affordance and no stale rows are presented as current.
    - AC-03.4 — GIVEN zero mappings match, THEN an explicit empty state is shown.

- **REQ-BIL-CAM-04** — *Search and filter.*
  - Statement: The user can narrow the list by free-text search and by `is_active` and `source`.
  - **Persona(s):** Center Admin, System Admin.
  - **Acceptance criteria:**
    - AC-04.1 — WHEN the user enters a search term, THEN the list requests results filtered by substring match on agreement id OR CLARISA project short name, resetting to page 1.
    - AC-04.2 — WHEN the user sets the active filter (active / inactive / all), THEN the list reflects only matching rows.
    - AC-04.3 — WHEN the user sets the source filter (MANUAL / AI_SUGGESTED / AI_AUTO / all), THEN the list reflects only matching rows.
    - AC-04.4 — WHEN filters/search are combined, THEN all are applied together (AND semantics) and page resets to 1.

- **REQ-BIL-CAM-05** — *Create a mapping.*
  - Statement: The user can create a new mapping by selecting an AGRESSO bilateral contract and a CLARISA project, with optional notes.
  - **Persona(s):** Center Admin, System Admin.
  - **Acceptance criteria:**
    - AC-05.1 — GIVEN the create form, WHEN the user opens the AGRESSO contract picker, THEN it lists selectable bilateral contracts (agreement id + description).
    - AC-05.2 — WHEN the user opens the CLARISA project picker, THEN it lists selectable bilateral projects (short name + id), and — when available — a Science-Program allocation preview for the highlighted project.
    - AC-05.3 — GIVEN both an AGRESSO contract and a CLARISA project are selected, THEN the Save action is enabled; otherwise it is disabled.
    - AC-05.4 — WHEN the user saves, THEN a create request is sent with `{ agresso_agreement_id, clarisa_project_id, notes? }`, `source` defaults to `MANUAL`, and on success the new row appears in the list and a success toast is shown.
    - AC-05.5 — WHEN saving (POST create) fails with **409** (an active mapping already exists for that agreement), THEN an actionable inline/toast error explains the conflict using the message from the response **`errorDetail.errors`** field (e.g. "Active mapping already exists for this contract") — NOT `description` (which is `"ConflictException"`) — and no duplicate row is added. *(Backend-confirmed 2026-07-01: 409 fires only on POST.)*
    - AC-05.6 — WHEN saving fails with a 400 validation error, THEN the server's message is surfaced to the user.

- **REQ-BIL-CAM-06** — *Edit a mapping.*
  - Statement: The user can edit an existing mapping's CLARISA project and/or notes.
  - **Persona(s):** Center Admin, System Admin.
  - **Acceptance criteria:**
    - AC-06.1 — GIVEN a listed mapping, WHEN the user opens edit, THEN the current values are pre-filled.
    - AC-06.2 — WHEN the user saves a change, THEN a PATCH request updates only the changed fields and the list row reflects the new values on success.
    - AC-06.3 — WHEN an edit (PATCH) produces a **400** validation error, THEN the server's message is surfaced (same as AC-05.6). *(PATCH does NOT return 409 — the agreement is immutable on update, so no active-mapping conflict is possible; backend-confirmed 2026-07-01.)*
    - AC-06.4 — WHEN nothing changed, THEN Save is disabled (no no-op request).

- **REQ-BIL-CAM-07** — *Deactivate a mapping.*
  - Statement: The user can soft-deactivate a mapping.
  - **Persona(s):** Center Admin, System Admin.
  - **Acceptance criteria:**
    - AC-07.1 — GIVEN an active mapping, WHEN the user deactivates it and confirms, THEN a `PATCH :id/deactivate` request is sent and on success the row shows inactive state.
    - AC-07.2 — The deactivate action requires an explicit confirmation step before firing.
    - AC-07.3 — Deactivation is idempotent from the user's perspective: deactivating an already-inactive mapping does not error the UI.

---

## 5. Non-Functional Requirements

- **REQ-BIL-CAM-NF-01** — Performance: initial render of the list page (excluding network) completes in ≤ 1.5 s on a mid-range laptop; the page issues at most one list request on first load (pickers load lazily on demand).
- **REQ-BIL-CAM-NF-02** — Accessibility: the page meets WCAG 2.1 AA on all new surfaces (keyboard-navigable table, pickers, and dialogs; labelled controls; visible focus).
- **REQ-BIL-CAM-NF-03** — Bundle budget: the lazy route chunk respects `angular.json` budgets; net JS added to the initial chunk is ~0 (feature is lazy-loaded).
- **REQ-BIL-CAM-NF-04** — Theming: light + dark parity for all new surfaces using existing tokens/utility classes.
- **REQ-BIL-CAM-NF-05** — i18n readiness: all user-facing strings are literals in the template/component (consistent with sibling admin pages), not derived from data, so they remain extractable.
- **REQ-BIL-CAM-NF-06** — Resilience: a failed picker or list request never leaves the page in a blocking/spinner-forever state; every async path resolves to success, empty, or error.

---

## 6. Data Inputs & Outputs

**Inputs (REST — already implemented in `alliance-research-indicators-main`, consumed via `ApiService` → `ToPromiseService` against `environment.mainApiUrl`):**

| Purpose | Method | Path (relative to `/api/`) | Notes |
| --- | --- | --- | --- |
| List | GET | `bilateral-project-mappings` | query: `page`, `limit`, `search`, `is_active`, `source` |
| Get one | GET | `bilateral-project-mappings/:id` | |
| Create | POST | `bilateral-project-mappings` | body `{ agresso_agreement_id, clarisa_project_id, notes? }` |
| Update | PATCH | `bilateral-project-mappings/:id` | partial `{ clarisa_project_id?, notes? }` |
| Deactivate | PATCH | `bilateral-project-mappings/:id/deactivate` | soft-delete |
| AGRESSO picker | GET | `agresso/contracts/find-contracts?pool-funding-contributor=true` (candidate — see OQ-1) | reuses existing `GET_FindContracts` |
| CLARISA project picker | GET | `tools/clarisa/projects/bilateral` (candidate — see OQ-1) | new binding |

**Outputs (response shapes → new `interfaces/bilateral/…`):**
- List → `MainResponse<{ items: BilateralProjectMapping[]; meta: { total; page; limit; totalPages } }>`.
- Single / create / update → `MainResponse<BilateralProjectMapping>`.
- `BilateralProjectMapping`: `{ id, agresso_agreement_id, clarisa_project_id, clarisa_project_short_name?, source: 'MANUAL'|'AI_SUGGESTED'|'AI_AUTO', confidence_score?, notes?, is_active, created_at, updated_at, created_by?, updated_by? }`.

**Persisted state:** component-local signals only; no new `localStorage` and no new `cache.service` entries.

---

## 7. Controlled Vocabularies

- CLARISA projects and Science Programs are sourced from CLARISA via backend endpoints (PRD C-3) — the client never maintains a parallel taxonomy.
- `source` is a fixed backend enum (`MANUAL` / `AI_SUGGESTED` / `AI_AUTO`); the client mirrors it verbatim and does not invent values.

---

## 8. Role & Permission Matrix

| Action | Researcher | Center Admin | System Admin | MEL Regional Expert | Anonymous |
|--------|-----------|--------------|--------------|---------------------|-----------|
| See Bilateral Mapping menu / open page | ❌ | ✅ | ✅ | ❌ | ❌ |
| List / search mappings | ❌ | ✅ | ✅ | ❌ | ❌ |
| Create / edit / deactivate mapping | ❌ | ✅ | ✅ | ❌ | ❌ |

Client checks mirror server enforcement (`RolesGuard` + `@Roles(CENTER_ADMIN, SYSTEM_ADMIN)`); no client-only rules are invented.

---

## 9. Telemetry & Observability

- Fire Clarity events for the material mutations, consistent with the sibling page (`bilateral.tag.override.saved`): e.g. `bilateral.mapping.created`, `bilateral.mapping.updated`, `bilateral.mapping.deactivated` (payload: mapping id / agreement id / project id).
- Error states surface via toast (success/failure) + inline messages for 400/409 (matching `agresso-pool-funding-tag` conventions).

---

## 10. Assumptions & Open Questions

- **A-1:** The backend list endpoint returns `{ items, meta }` inside the standard `MainResponse<T>` envelope; the client unwraps `data` as elsewhere.
- **A-2:** `centerAdminGuard` role logic (role 1, or role 9 with `focus_id===1 && sec_role_id===9`) matches the API's CENTER_ADMIN/SYSTEM_ADMIN acceptance for these endpoints.
- **A-3:** Create defaults `source` to `MANUAL` server-side; the client does not send `source`, `confidence_score`, or audit fields on create.
- **OQ-1 — RESOLVED (2026-07-01, backend team + source).** Picker paths confirmed: AGRESSO via existing `GET_FindContracts({'pool-funding-contributor':true})`; CLARISA `tools/clarisa/projects/bilateral` (under `RolesGuard`+CENTER_ADMIN/SYSTEM_ADMIN, runtime 200). Mapping CRUD list returns `{items,meta}`. **409 fires only on POST**; readable message in `errorDetail.errors`, `description`=`"ConflictException"`.
- **OQ-2 — RESOLVED.** Edit is `clarisa_project_id`/`notes` only; `agresso_agreement_id` is immutable server-side. Re-point = deactivate + create new mapping.
- **OQ-3:** Reactivating a deactivated mapping — assumed NOT required in v1 (out of scope). *(Still to confirm; low risk.)*
- **OQ-DEPLOY:** Backend endpoints live on `alliance-research-indicators-main` branch `AC-1594-bilateral-module-v2` (unmerged, 79 commits ahead of `main`). Confirm with devops which branch the **testing** env tracks before end-to-end sign-off. FE dev/tests proceed against fixtures/local meanwhile.
- **OQ-4:** Timing/owner for retiring the React SSR page (deferred; not blocking).
- **OQ-POOL — CROSS-REPO BACKEND FOLLOW-UP (product intent clarified 2026-07-01, HIGH priority).** **Product intent:** creating a bilateral project mapping SHOULD cause the mapped project to show the "Contributing to Pool Funding" tag in the Projects table — *that is the point of the mapping.* **Current reality (verified in backend source):** the two are **decoupled** — the Projects tag is driven ONLY by the stored column `agresso_contracts.is_pool_funding_contributor` (set exclusively via the separate "AGRESSO Pool Funding Tag" page / `setPoolFundingTag()`); nothing in `find-contracts`/results derives it from `bilateral_project_mapping`. So a project with an active mapping (e.g. D504) but no manual tag shows NO badge. **This gap is OUT OF SCOPE for this FE spec** (consume-only backend, admin CRUD only) and must be resolved in `alliance-research-indicators-main`. Two candidate backend approaches — (i) creating/activating a mapping auto-sets `is_pool_funding_contributor=true` on the contract (and deactivating the last active mapping reverts it); or (ii) the Projects/find-contracts + results read queries derive the badge from `is_pool_funding_contributor OR (an active bilateral mapping exists)`. **PO must also resolve** how this interacts with the existing manual tag override (can an admin untag a mapped contract?). Owner: backend session (`AC-1594-bilateral-module-v2`).
- **A-4 (note, out of scope):** The Angular `isBilateral()` used by the sibling `agresso-pool-funding-tag` page needs a separate fix (accept `'BLR'`/`'BILATERAL'` mirroring backend; read `errors` for conflict text). Tracked outside this spec/checkout; this feature's AGRESSO picker uses the pre-filtered `find-contracts?pool-funding-contributor=true` endpoint and does not depend on `isBilateral()`.

---

## 11. References

- [`proposal.md`](./proposal.md)
- [`../../../prd.md`](../../../prd.md)
- [`../../../system-design/design.md`](../../../system-design/design.md)
- [`../../../detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md)
- Sibling surface: `research-indicators/src/app/pages/platform/pages/administration/center-admin/agresso-pool-funding-tag/` and `.../sdg-management/`.
- Backend reference impl: `alliance-research-indicators-main/server/researchindicators/src/domain/entities/bilateral-project-mapping/` + `.../src/admin/client/pages/BilateralProjectMappings.tsx`.

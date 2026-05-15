# PRMS Bilateral Module — Frontend Context for STAR

> **Audience**: STAR product, design, and engineering preparing to implement a bilateral module in this client.
> **Source**: replication-grade docs at `/Users/jcadavid/Desktop/DEV/Desarrollos/onecgiar_pr/docs/bilateral-module` (README, frontend, integration-contracts, replication-checklist, backend), dated 2026-05-12, captured from the live PRMS production implementation.
> **Status**: Product-Owner synthesis. Not a spec. Inputs to the eventual SDD spec at [`docs/specs/bilateral-module/{requirements,design,task}.md`](../../general-setup/).

---

## 1. Purpose & how to read this doc

This file is the **PRMS-context** corner of the three-input briefing for the bilateral module:

```
docs/specs/bilateral-module/
├── figma-mockups/       — visual reference (TBD)
├── jira-us/             — user-story reference (TBD)
└── prms-context/        — this doc: what PRMS already built, and how STAR can reuse it
    └── frontend-context.md
```

Read this **before** authoring `requirements.md`, `design.md`, or `task.md` for the bilateral module. It is a synthesis, not a spec — every section ends with a short *STAR fit note* that classifies the item as **direct reuse**, **adaptation needed**, or **open question**. Those notes are the seam between this briefing and the canonical SDD docs.

The briefing is intentionally scoped to **frontend characteristics + the API endpoints the frontend actually calls**. Backend ingestion design, payload-level field detail, and downstream export contracts are PRMS-owned and remain in the PRMS repo. Where backend behavior shapes the UX, it appears here as a rule for the frontend to enforce or surface.

---

## 2. The PRMS bilateral module in one page

**Mission**: let CGIAR Centers submit W3 / Bilateral-funded results into PRMS through an external channel, and let Science Program / Accelerator leads review those results before they become accepted program results.

**Two halves, one product**:

1. **Headless ingestion** — external systems POST structured payloads to `/api/bilateral/create`. The PRMS backend validates CLARISA codes, creates external users on the fly, writes a Result plus all common associations in a transaction, and delegates type-specific fields to per-type handlers.
2. **Program review workspace** — a Science Program / Accelerator lead opens `/result-framework-reporting/entity-details/:entityId/results-review`, scans bilateral results pending review by center, edits ToC and data-standard fields where needed, and **approves or rejects with justification**.

**Result types** the bilateral module accepts (`result_type_id`):

| ID | API string | Display |
|---:|---|---|
| 1 | `policy_change` | Policy change |
| 2 | `innovation_use` | Innovation use |
| 5 | `capacity_sharing` | Capacity sharing for development |
| 6 | `knowledge_product` | Knowledge product (KP) |
| 7 | `innovation_development` | Innovation development |

KP is special: title, description, geography and evidence are populated from CGSpace / MQAP metadata via the `handle`, not trusted from the submitted payload.

**Lifecycle** (`status_id`):

```
External POST  ─►  5 Pending Review  ─►  6 Approved  (decision = APPROVE, justification = "Approved")
                                     └►  7 Rejected  (decision = REJECT, justification REQUIRED)
```

Every decision and meaningful review update is written to **review history** (audit table) with a justification string.

*STAR fit note*: Conceptually a clean fit — STAR already models results with `status_id`, version history, and a tabbed metadata editor. The bilateral module is most naturally framed as a **second creation path** (external/system-driven) plus a **review surface** for `status_id = 5`. The five result types overlap heavily with STAR's existing result-detail tabs (capacity-sharing, innovation-details, policy-change, OICR/KP).

---

## 3. Frontend stack parity

PRMS and STAR share the same frontend stack at near-identical versions:

| Dimension | PRMS | STAR | Implication |
|---|---|---|---|
| Framework | Angular **19.2.14** | Angular **19.1.6** | Direct pattern reuse, no migration |
| UI library | PrimeNG **19.1.3** | PrimeNG **19.0.6** | Same component vocabulary (drawer, table, multiselect, dialog, chips, skeleton) |
| State | Angular signals + RxJS | Angular signals + RxJS, no NgRx | Identical mental model |
| Components | Custom + PrimeNG | Custom + PrimeNG (Aura preset, `roartheme.ts`) | Same wrapping pattern; different tokens |
| Auth header | Custom `auth: <JWT>` | `Authorization: Bearer` via `jwt.interceptor.ts` | **Adaptation** — STAR will not adopt the custom header |
| Forms | Custom `pr-*` wrapped inputs | Custom wrapped inputs via `custom-fields.scss` + `custom-prime-force-styles.scss` | Conceptual reuse; rename |
| Path aliases | `@modules/*`, etc. | `@platform/*`, `@shared/*`, `@services/*`, `@interfaces/*`, `@interceptors/*`, `@guards/*`, `@sockets/*`, `@utils/*` (see [`research-indicators/src/CLAUDE.md`](../../../../research-indicators/src/CLAUDE.md)) | Adopt STAR aliases |

*STAR fit note*: This is the single biggest reason this briefing is high-value. Pattern reuse is at the framework, component, and state-management level — there is **no rewrite tax** on the UI patterns. The work is taxonomy mapping (PRMS components → STAR shared inventory), auth model alignment, and design-token translation.

---

## 4. Information architecture in PRMS

PRMS exposes the bilateral surface inside its broader Result Framework Reporting module:

```
/result-framework-reporting/home
/result-framework-reporting/entity-details/:entityId                           ← Science Program dashboard
/result-framework-reporting/entity-details/:entityId/results-review            ← bilateral review workspace (focal screen)
/result-framework-reporting/entity-details/:entityId/aow                       ← Area of Work nav
/result-framework-reporting/entity-details/:entityId/aow/:aowId                ← AoW detail
```

Query-param contract on the review workspace:

- `?center=<centerCode>` — selects one center in the sidebar.
- `?search=<text>` — hydrates the table search input (URL-synced with replace-state).
- Deep links into result detail include `?phase=<versionId>` to preserve phase context.

Hidden by config: a special program `SGP-02` (also referred to as `SGP02` in places) opts out of the AoW navigation. PRMS docs flag this as a code-smell to centralize.

*STAR fit note*: STAR's authenticated routes live under the `platform` shell ([`research-indicators/src/app/app.routes.ts`](../../../../research-indicators/src/app/app.routes.ts)). The bilateral review workspace is most naturally landed under either `administration/bilateral-review` (mirroring `administration/center-admin/*` admin tooling) or as a dedicated top-level `results-review` route. **OQ-1**: confirm placement with the product owner before the SDD spec lands. Either route must apply `rolesGuard` and a new role-aware guard (see §10).

---

## 5. Primary UI surface — the Review Workspace

The workspace is a three-zone shell:

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Breadcrumb                                                                │
├──────────────┬────────────────────────────────────────────────────────────┤
│              │  Filters: search • filter drawer • active chips            │
│              ├────────────────────────────────────────────────────────────┤
│  Centers     │  Grouped table by bilateral project                        │
│  sidebar     │  ─ project N ───────────────────────────────────────────── │
│  (badges)    │   row • row • row  [Review result] / [See result]          │
│              │  ─ project M ───────────────────────────────────────────── │
│              │   row • row                                                │
│              ├────────────────────────────────────────────────────────────┤
│              │  Review drawer (side panel, modal)                         │
└──────────────┴────────────────────────────────────────────────────────────┘
```

### 5.1 Center sidebar (`indicators-sidebar/` in PRMS)

- Loads CLARISA centers via `CentersService`.
- Includes an "All Centers" row with the total pending count.
- Shows per-center pending badge for `status_id == 5`.
- Hides centers with no result rows once the data loads.
- Keyboard accessible: `role="button"`, `tabindex="0"`, Enter and Space.
- **Hard rule**: pending counts must come from a separate "all results" source, **not** the currently filtered table — otherwise selecting one center makes badges for every other center collapse to zero.

*STAR fit note*: STAR already ships [`alliance-sidebar`](../../../../research-indicators/src/app/shared/components/alliance-sidebar) as the persistent left nav. The bilateral review needs a **second-level sidebar** — comparable to the result-detail tab sidebar (`result-sidebar`) — listing centers with badges. Reuse the `result-sidebar` pattern; do not invent a new sidebar component. The "separate count source" rule maps to a dedicated signal in the bilateral service (see §7).

### 5.2 Filter bar (`results-review-filters/` in PRMS)

- Text **search** matches `result_code`, `result_title`, `indicator_category`, `toc_title`, `indicator`. URL-synced with replace-state (not push-state on each keystroke).
- **Three multiselect filters**, memory-only (not URL-synced): indicator category, status, lead center.
- Filter options are **derived from the current table rows**, not from a global catalog.
- The filter drawer uses **Apply / Cancel** semantics — Cancel restores the temporary selections from service state.
- Active filters appear as **chips** above the table.

*STAR fit note*: STAR already has [`filters-action-buttons`](../../../../research-indicators/src/app/shared/components/filters-action-buttons) and [`search-export-controls`](../../../../research-indicators/src/app/shared/components/search-export-controls); both are reusable here. If "shareable filtered views" become a STAR requirement (not yet in the PRD), promote all three multiselect filters to URL-synced query params — PRMS explicitly flags that as a future improvement.

### 5.3 Grouped review table (`results-review-table/` in PRMS)

- Loads from `GET /api/results/by-program-and-centers?programId=<id>&centerIds=<csv>`. Re-fetched whenever the center selection changes.
- Rows are **grouped by bilateral project**, with collapsible groups.
- Row shape (TypeScript-style):

```ts
interface GroupedResult {
  project_id: string;
  project_name: string;
  results: ResultToReview[];
}

interface ResultToReview {
  id: string;
  project_id: string;
  project_name: string;
  result_code: string;
  result_title: string;
  indicator_category: string;
  status_name: string;
  status_id?: string | number;   // coerce to number at the API boundary
  acronym: string;
  toc_title: string;
  indicator: string;
  submission_date: string;
  lead_center?: string;
  initiative_role_name?: string; // "Contributor" gets a badge
}
```

- Action button rules:
  - `status_id == 5` AND the user can review → `Review result` (opens drawer).
  - Otherwise → `See result` (read-only).
- After approve/reject, the workspace **refetches the current table selection** AND **refetches all pending counts** for the sidebar badges.

*STAR fit note*: STAR ships [`results-table`](../../../../research-indicators/src/app/shared/components/results-table) and [`project-results-table`](../../../../research-indicators/src/app/shared/components/project-results-table). The bilateral table is closest to `project-results-table` (project-grouped). Reuse the wrapper, add bilateral-specific columns. **Coerce `status_id` to number at the API boundary** (see §11) so the button rule has no runtime ambiguity.

---

## 6. The Review Drawer — the core of the rebuild

PRMS calls this out explicitly: *the review drawer is the core of the frontend rebuild*. Everything else is plumbing.

### 6.1 Responsibilities

- Load one result detail by ID.
- Normalize backend detail into UI-friendly arrays / objects.
- Render: common read-only header, inline title edit, ToC mapping, geography, centers, projects, initiatives (with primary/accepted/pending buckets), institutions, evidence links, **type-specific panel**, approve/reject buttons.
- Track unsaved ToC changes and unsaved data-standard changes (dirty flags).
- Save ToC edits and data-standard edits **with required justification**.
- Edit title inline.
- Approve (decision `APPROVE`, justification `"Approved"`) or Reject (decision `REJECT`, justification required from user).

### 6.2 Load sequence

```
drawer.open(resultId)
  └─ load CLARISA projects
     └─ wait for institutions catalog (with timeout fallback)
        └─ GET /api/results/bilateral/<resultId>
           └─ set current result in global data control
              └─ load initiatives without this result
                 └─ normalize centers, projects, initiatives, institutions, type response, ToC metadata
                    └─ capture data-standard JSON snapshot for dirty diff
```

### 6.3 Type-specific panels

The drawer routes to one of five components by `result_type_id`:

| ID | Type | PRMS component | STAR placement |
|---:|---|---|---|
| 1 | Policy change | `policy-change-content` | New component under bilateral module |
| 2 | Innovation use | `innovation-use-content` | New component |
| 5 | Capacity sharing | `cap-sharing-content` | New; STAR already has a `capacity-sharing` result tab — reuse fields conceptually |
| 6 | Knowledge product | `kp-content` | New; OICR-adjacent |
| 7 | Innovation development | `inno-dev-content` | New; STAR already has an `innovation-details` result tab — reuse fields conceptually |

The GET response wraps `resultTypeResponse` as a **single-item array**. Normalize to one object at the API boundary so the UI does not pepper itself with `resultTypeResponse[0]`.

### 6.4 Data-standard save body (sent on save with justification)

```ts
{
  commonFields: { id, result_description, result_type_id },
  geographicScope: {
    has_countries, has_regions,
    regions: [{ id }],
    countries: [{ id, sub_national: [...] }],
    geo_scope_id,
    extra_geo_scope_id,
    extra_regions: [{ id }],
    extra_countries: [{ id, sub_national: [...] }],
    has_extra_countries, has_extra_regions, has_extra_geo_scope
  },
  contributingCenters: [{ code, acronym, institution_id, result_id,
                          is_leading_result, selected, new, is_active }],
  contributingProjects: [{ project_id }],
  contributingInitiatives: {
    accepted_contributing_initiatives: [{ id, share_result_request_id, is_active }],
    pending_contributing_initiatives:  [{ id }]
  },
  contributingInstitutions: [{ id, institutions_id, institution_roles_id,
                               is_active, result_id }],
  evidence: [{ id, link, is_sharepoint }],
  resultTypeResponse: { /* one of the five type shapes */ },
  updateExplanation: "required justification string"
}
```

**Quirks to preserve**:

- First selected center becomes **lead by array position** (`is_leading_result = 1` at index 0). PRMS flags this as fragile if the UI ever allows reordering — STAR should consider an explicit `is_leading_result` field on each row.
- **Empty arrays = clear; omitted arrays = leave unchanged.**
- `evidence.is_sharepoint` defaults to `0` at save time.
- `contributingProjects` has inconsistent shapes in PRMS source; normalize to `{ project_id }` in STAR.

### 6.5 ToC editing

The drawer embeds **`app-cp-multiple-wps`**, the same ToC tree used elsewhere in PRMS Result Detail. It needs:

- Initiative object (`planned_result`, `initiative_id`, `result_toc_results`).
- Initiative id, result level id.
- Flags: `isIpsr=false`, `isContributor=false` for primary editable tree; `isContributor=true` and `editable=false` for contributor display trees.
- `forceP25=true`, `isUnplanned=!planned_result`, `showMultipleWPsContent=tocConsumed`.

The tree reads the current result from a global data control, calls ToC endpoints for levels 1/2/3 per initiative, and mutates the initiative object in place.

*STAR fit note*: **OQ-2** — the ToC tree is the single highest-risk dependency. STAR currently has no equivalent ToC widget. Three paths:
1. **Port** `app-cp-multiple-wps` as a shared component (highest fidelity, highest cost).
2. **Rebuild** a STAR-native ToC widget tied to STAR's `alliance-alignment` tab data.
3. **Defer** — ship the drawer in read-only ToC mode (PRMS's "minimal viable rebuild" path) and unblock approve/reject by accepting results whose ToC is already complete from ingestion.

PRMS's replication checklist explicitly endorses path 3 for a two-week proof of concept.

### 6.6 Drawer host

PRMS uses PrimeNG `p-drawer` directly.

*STAR fit note*: STAR's convention is that **every overlay routes through [`all-modals`](../../../../research-indicators/src/app/shared/components/all-modals) + [`modal`](../../../../research-indicators/src/app/shared/components/modal)** — see [`docs/system-design/design.md`](../../../system-design/design.md) §8.4 and §12. The review drawer must be hosted through this wrapper, not as a raw `p-drawer`. This also gives STAR consistent focus-trap and escape-key behavior for free.

---

## 7. State model

PRMS uses a singleton service, `BilateralResultsService`, with signals:

| Signal | Meaning |
|---|---|
| `entityId` | Science Program official code from the route. |
| `centers` | CLARISA centers for the sidebar. |
| `currentCenterSelected` | Array of selected center codes. Null = all centers. |
| `searchText` | URL-synced with `?search=`. |
| `selectedIndicatorCategories`, `selectedStatus`, `selectedLeadCenters` | Memory-only filter selections. |
| `tableData` | Grouped table rows. |
| `tableResults` | Flat rows for filter-option derivation. |
| `allResultsForCounts` | **Full center result set** used for sidebar badges. |
| `pendingCountByAcronym` | Computed: count of `status_id == 5` rows by lead center acronym. |
| `showReviewDrawer`, `currentResultToReview` | Drawer state. |

**Replication-critical rule** (from PRMS docs verbatim):

> Sidebar counts must not depend on the current table filter, otherwise selecting one center makes counts for the other centers disappear.

This forces **two parallel data sources** in the service: filtered table data, and a separate `allResultsForCounts` snapshot.

*STAR fit note*: STAR's idiom for cross-cutting state is signals via [`shared/services/cache.service.ts`](../../../../research-indicators/src/app/shared/services/cache) and module-specific services. The bilateral state can live in a new `bilateral-review.service.ts` (path TBD by the SDD spec). The "separate counts source" rule is non-negotiable — replicate it.

Also: PRMS toggles a **global `RolesService.readOnly`** flag while the drawer is open and editable, then restores it on close. PRMS itself flags this as fragile coupling. STAR must use **explicit `editable`/`readOnly` props on embedded widgets**, not a global mutation. STAR's existing [`roles.service.ts`](../../../../research-indicators/src/app/shared/services/cache/roles.service.ts) provides role checks; do not introduce mutable global "read-only" state.

---

## 8. User flows

### 8.1 Golden path — approve

1. Science Program lead navigates to the review workspace.
2. (Optional) selects a center from the sidebar; default is "All Centers".
3. (Optional) types in search or opens filter drawer.
4. Clicks **Review result** on a pending row.
5. Drawer opens, loads detail, hydrates CLARISA catalogs and ToC tree.
6. (Optional) edits ToC → saves with **required justification**.
7. (Optional) edits data standards (centers, projects, geography, evidence, type-specific) → saves with **required justification**.
8. Verifies ToC is complete and no unsaved dirty flags.
9. Clicks **Approve** → confirmation → backend transitions `status_id` to 6, writes review history.
10. Drawer closes. Table refetches; sidebar pending counts refetch.

### 8.2 Edge — reject with justification

1. Reviewer clicks **Reject**.
2. **`save-changes-justification-dialog`** opens — justification text is required.
3. Submit → backend transitions `status_id` to 7, writes review history with justification.
4. Table and counts refresh.

### 8.3 Edge — incomplete ToC

- Approve button stays **disabled** while ToC is incomplete OR while any dirty flag (ToC or data-standard) is set.
- The reviewer must complete the ToC tree and save before approval becomes possible.

### 8.4 Edge — drawer close while dirty

- Closing the drawer must restore any global state PRMS flipped (read-only, body scroll) and not block on dirty flags (PRMS does not prompt before close today).

*STAR fit note*: These flows map cleanly onto STAR's golden-path discipline in [`docs/system-design/design.md`](../../../system-design/design.md) §3. STAR should add a **dirty-flag guard with confirmation** when closing the drawer — PRMS does not, and it is a UX gap worth fixing on the way over.

---

## 9. Validation & business rules surfaced to the FE

| Rule | Where enforced | Surface to the user |
|---|---|---|
| Title is unique within phase for non-KP results | Backend on ingestion + inline title edit | Show inline error on conflict |
| Lead center = array position 0 | Frontend (fragile; flagged) | Make explicit in STAR via `is_leading_result` field |
| ToC must be complete to approve | Frontend (button disabled) | Disabled state + tooltip explaining why |
| Justification required to save ToC edits | Frontend dialog before PATCH | `save-changes-justification-dialog` |
| Justification required to save data-standard edits | Frontend dialog before PATCH | Same dialog |
| Justification required to reject | Frontend dialog; backend rejects empty justification | Required textarea |
| Only `status_id == 5` is reviewable | Frontend button gating + backend transition validation | Row-level button selection |
| User must be admin OR have the Science Program in `myInitiativesList` to review | Frontend + backend authorization | Row buttons + drawer editability |
| KP title/description/geography/evidence sourced from CGSpace/MQAP, not payload | Backend special-case for `result_type_id = 6` | KP panel shows handle-derived fields as read-only metadata |
| `status_id` is sometimes string, sometimes number | API boundary | **Coerce to number** in the STAR API layer |
| Geography validation: Regional → regions[], National/Sub-national → countries[], Sub-national → subnational[] | Backend on save | Frontend disables save until valid |

*STAR fit note*: Frontend mirrors these; the backend stays authoritative. Reactive forms are the right pattern (consistent with STAR's convention — see [`research-indicators/src/CLAUDE.md`](../../../../research-indicators/src/CLAUDE.md)). PRD constraint **C-3** (CLARISA controlled vocabularies) is reinforced by every controlled-list field above.

---

## 10. Permissions & visibility

### 10.1 PRMS role model in this module

| Role | Can review |
|---|---|
| Admin / PMU | Any bilateral result. |
| Science Program / Accelerator lead | Only results whose primary initiative is in their `myInitiativesList`. |
| Anyone else | Read-only — sees `See result` button, never `Review result`. |

### 10.2 STAR role taxonomy

STAR's PRD (§3, §8.3) defines four personas and three explicit `role_id` values:

| STAR role | `role_id` | PRMS role this most resembles |
|---|---:|---|
| Admin | 1 | Admin / PMU |
| Center Admin | 9 | (no direct equivalent — closer to "submitter for one center") |
| MEL Regional Expert | 10 | **Science Program lead** (most natural mapping) |

*STAR fit note*: **OQ-3** — the mapping above is the working hypothesis, but it needs product-owner confirmation before the SDD spec lands. Specifically:
- Are "Science Program / Accelerator lead" scopes (by initiative) equivalent to STAR's MEL Regional Expert scope (by region)?
- Does Center Admin gain any review rights in STAR's version, or is it strictly Admin + MEL?
- Is there a new STAR role required (e.g., "Bilateral Reviewer") that we should propose?

Both STAR's [`rolesGuard`](../../../../research-indicators/src/app/shared/guards/roles.guard.ts) and a new module-specific guard (or expanded `center-admin.guard.ts` pattern) will enforce route-level access. The backend remains authoritative; frontend role checks exist **for UX only** (per [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §8.2).

---

## 11. Loading, empty, error & dirty states

| State | Trigger | Pattern in PRMS | STAR equivalent |
|---|---|---|---|
| Loading | Drawer open, before detail GET resolves | PrimeNG `p-skeleton` panels | Same — PrimeNG skeleton, themed via STAR `--ac-*` tokens |
| Loading (institutions catalog) | First-time drawer open | Wait with **timeout fallback** | Match — never block drawer indefinitely on a catalog fetch |
| Empty (no rows) | Filter / center selection produces zero rows | Empty-state message | Use STAR convention (TBD; see system-design OG-6) |
| Error (detail load fails) | 4xx / 5xx on detail GET | Toast + drawer cannot render | Route through [`http-error.interceptor.ts`](../../../../research-indicators/src/app/shared/interceptors/http-error.interceptor.ts) and [`actions.service.ts`](../../../../research-indicators/src/app/shared/services/actions.service.ts); surface via [`global-toast`](../../../../research-indicators/src/app/shared/components/global-toast) / [`global-alert`](../../../../research-indicators/src/app/shared/components/global-alert) |
| Dirty (ToC) | User changes ToC tree | Boolean flipped; reset after reload or save | Same |
| Dirty (data standards) | Any normalized field diverges from snapshot | `JSON.stringify` diff vs snapshot | Prefer **per-field dirty flags** or structural diff — PRMS itself flags the JSON-string approach as a smell |
| Disabled (Approve) | ToC incomplete OR any dirty flag set | Button disabled + tooltip | Match; ensure tooltip is keyboard-reachable (WCAG 2.1 AA, PRD C-4) |
| Read-only | User cannot review this result | `See result` button instead of `Review result`; drawer in read-only mode | Use **explicit prop**, never a global mutation (§7) |

*STAR fit note*: All of this lifts cleanly onto STAR's existing toast/alert/skeleton system. The two PRMS smells worth fixing on the way over: global readOnly mutation (§7) and JSON-snapshot dirty diff (above).

---

## 12. API endpoints the frontend consumes

The list below is the **frontend-facing surface**. The headless ingestion endpoint (`POST /api/bilateral/create`) is **not consumed by this UI** — it is the external-systems API and is out of scope for the FE rebuild.

| # | Verb | Path | Purpose | Auth |
|---:|---|---|---|---|
| 1 | GET | `/api/results-framework-reporting/clarisa-global-units?programId=<id>` | Science Program details for entity-details page | `auth: <JWT>` |
| 2 | GET | `/api/results/by-program-and-centers?programId=<id>&centerIds=<csv>` | Grouped bilateral review table | `auth: <JWT>` |
| 3 | GET | `/api/results/pending-review?programId=<id>` | Pending review count (entity-details banner) | `auth: <JWT>` |
| 4 | GET | `/api/results/bilateral/<resultId>` | Review drawer detail | `auth: <JWT>` |
| 5 | PATCH | `/api/results/bilateral/<resultId>/title` | Inline title edit | `auth: <JWT>` |
| 6 | PATCH | `/api/results/bilateral/review-update/toc-metadata/<resultId>` | Save ToC edits with justification | `auth: <JWT>` |
| 7 | PATCH | `/api/results/bilateral/review-update/data-standard/<resultId>` | Save data-standard edits with justification | `auth: <JWT>` |
| 8 | PATCH | `/api/results/bilateral/<resultId>/review-decision` | Approve or reject | `auth: <JWT>` |
| 9 | GET | `/api/results-framework-reporting/bilateral-projects?tocResultId=<id>` | Bilateral project options for the drawer | `auth: <JWT>` |
| 10 | GET | CLARISA institutions catalog (timeout fallback) | Institutions catalog for drawer | `auth: <JWT>` |
| 11 | GET | ToC levels endpoints (per initiative) | ToC tree levels 1/2/3 | `auth: <JWT>` |

### 12.1 Key response shapes

**Endpoint 2 (table)** — see §5.3.

**Endpoint 4 (detail)** — shape is:

```json
{
  "commonFields": { "id": 0, "result_code": "...", "result_title": "...",
                    "result_description": "...", "result_type_id": 0 },
  "tocMetadata": { },
  "geographicScope": { },
  "contributingCenters": [ ],
  "contributingProjects": [ ],
  "contributingInitiatives": [ ] | {
      "contributing_and_primary_initiative": [],
      "accepted_contributing_initiatives": [],
      "pending_contributing_initiatives": []
  },
  "contributingInstitutions": [ ],
  "evidence": [ ],
  "resultTypeResponse": [ /* single-item array */ ],
  "contributors_result_toc_result": [ ]
}
```

`contributingInitiatives` is **either** a legacy array **or** the three-bucket object. The frontend must support both shapes until the backend converges.

**Endpoint 6 (ToC update)**:

```json
{ "tocMetadata": { /* planned_result, initiative_id, result_toc_results[] */ },
  "updateExplanation": "required justification" }
```

**Endpoint 7 (data-standard update)** — see §6.4.

**Endpoint 8 (review decision)**:

```json
{ "decision": "APPROVE", "justification": "Approved" }
{ "decision": "REJECT",  "justification": "<required user text>" }
```

### 12.2 PRMS response envelope

```json
{ "response": { /* T */ }, "statusCode": 200, "message": "...",
  "timestamp": "...", "path": "/api/..." }
```

*STAR fit note*: STAR wraps every backend response as `MainResponse<T>` with `{ successfulRequest, status, data, errorDetail }` (see [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §4.2). **OQ-4**: confirm with the STAR backend team whether the bilateral endpoints (a) are owned by PRMS and proxied, (b) are reimplemented in the STAR backend with the `MainResponse<T>` envelope, or (c) some hybrid. The answer drives whether STAR needs a per-bilateral envelope adapter or can call `ApiService` directly.

*STAR fit note (auth)*: PRMS uses a custom `auth: <JWT>` header; STAR uses `Authorization: Bearer` via [`jwt.interceptor.ts`](../../../../research-indicators/src/app/shared/interceptors/jwt.interceptor.ts). STAR will not adopt the custom header — see §16.

---

## 13. Federation & external data sources

The bilateral module is a federation node, not a standalone island.

| Source | What it provides | STAR equivalent |
|---|---|---|
| **CLARISA** | Initiatives, centers, institutions, countries, regions, subnational, policy types/stages, innovation typology, innovation readiness levels | Already integrated — see [`get-clarisa-institutions-type.service.ts`](../../../../research-indicators/src/app/shared/services/get-clarisa-institutions-type.service.ts), [`get-clarisa-institutions-subtypes.service.ts`](../../../../research-indicators/src/app/shared/services/get-clarisa-institutions-subtypes.service.ts), [`get-subnational-by-iso-alpha.service.ts`](../../../../research-indicators/src/app/shared/services/get-subnational-by-iso-alpha.service.ts), [`control-list-cache.service.ts`](../../../../research-indicators/src/app/shared/services/control-list-cache.service.ts), [`dropdowns-cache.service.ts`](../../../../research-indicators/src/app/shared/services/cache/dropdowns-cache.service.ts) |
| **ToC service** | ToC results, indicators, levels 1/2/3, targets | None today (see §6.5 OQ-2) |
| **CGSpace / MQAP** | KP metadata via handle (title, description, year, peer-review flag, etc.) | None today; called out only at ingestion time, so probably out of scope for STAR's review surface unless STAR also ingests |
| **Bilateral project endpoints** | W3 / Bilateral project options for the drawer | None today |

*STAR fit note*: Reuse STAR's existing CLARISA cache services. **Do not** build parallel lookups — PRD constraint **C-3** forbids parallel taxonomies. New service work is limited to ToC (if §6.5 path 1 or 2 is chosen) and bilateral projects.

---

## 14. Theming, accessibility, i18n

### 14.1 Theming

PRMS uses its own design tokens (`--pr-color-*`). The PRMS frontend doc explicitly warns:

> *In a different design system, create a token map first. Missing tokens can produce unreadable white-on-white states.*

STAR's tokens are entirely separate — `--ac-light-blue-*`, `--ac-primary-blue-*`, `--ac-green-*`, `--ac-orange-1`, etc. (see [`docs/system-design/design.md`](../../../system-design/design.md) §7 and [`research-indicators/README.md`](../../../../research-indicators/README.md)). Components built for the bilateral module **must** use STAR tokens and the utility classes (`.abc-*`, `.atc-*`, `.rs-*`, `.fs-*`). **No hex literals.**

### 14.2 Accessibility

PRMS docs do not call out a WCAG conformance level. STAR's PRD constraint **C-4** mandates **WCAG 2.1 AA** on every changed screen. Bilateral screens inherit this. Specifically: the center sidebar's `role="button"` + Enter/Space pattern is good; the drawer must trap focus, restore body scroll on close, and provide a visible focus ring on all interactive controls.

### 14.3 Internationalization

PRMS is English-only and does not document i18n for this module. STAR has no i18n flow today either — `@angular/build:extract-i18n` is wired in `angular.json` but no surface uses it (called out as a gap in [`docs/system-design/design.md`](../../../system-design/design.md) OG-7). The bilateral module should **not** introduce a parallel i18n mechanism — file any i18n requirement as a STAR-level open question.

### 14.4 Dark mode

PRMS docs do not address dark mode. STAR supports light + dark globally via PrimeNG Aura preset and CSS-variable swaps (see [`docs/system-design/design.md`](../../../system-design/design.md) §11). Dark-mode parity is **not** codified as a hard per-screen requirement today (PRD OQ-3), but the bilateral screens should at least not break dark mode that already works elsewhere.

*STAR fit note*: Token translation is mechanical; do it in one pass. Accessibility is a hard floor.

---

## 15. Risks & anti-patterns (distilled from PRMS replication checklist)

| # | Risk | STAR mitigation |
|---:|---|---|
| R1 | ToC tree (`app-cp-multiple-wps`) is the highest-risk dependency | Choose one of the three §6.5 paths early; do not start drawer work without a decision |
| R2 | Sidebar pending counts wrongly derived from filtered table | Maintain a separate `allResultsForCounts` signal — PRMS's exact rule |
| R3 | Global read-only state mutation (PRMS pattern) leaks across pages | Use **explicit** `editable` / `readOnly` props on embedded widgets; do not mutate `roles.service` |
| R4 | `status_id` type drift (string vs number) | Coerce at the API boundary — never rely on `==` |
| R5 | First-position lead center is fragile if UI ever allows reorder | Promote to an explicit `is_leading_result` field on each row |
| R6 | KP results treated as normal payloads | Render KP panel acknowledging CGSpace/MQAP-sourced fields as read-only metadata |
| R7 | JSON-snapshot dirty diff is brittle | Use per-field dirty flags or structural diff |
| R8 | Approve enables despite incomplete ToC | Hard gate: button disabled unless ToC complete AND all dirty flags clear |
| R9 | Phase query param dropped on deep links into result detail | Always include `?phase=<versionId>` on outbound links |
| R10 | Frontend-only role check is the sole authorization layer | Backend remains authoritative; frontend role checks are UX-only — restate explicitly in §10 |
| R11 | Public ingestion unprotected | **N/A for STAR's review surface** but see §16 — STAR's stack forbids public ingestion |

### Anti-patterns the PRMS docs explicitly call out

- Do not collapse ingestion and review APIs into one endpoint.
- Do not directly update `status_id` outside the review-decision service.
- Do not hard-delete associations that should be soft-deleted.
- Do not log headers, JWTs, or payload secrets.
- Do not rename backend-compatible typos (`has_unkown_using`, `readinness_level_id`, `non_pooled_projetct_budget_id`) without a versioned contract.
- Do not let frontend role checks be the sole authorization layer.
- Do not ship missing design tokens that make the UI unreadable.

---

## 16. Auth & ingestion boundary — important divergence

This is the single most important architectural difference STAR must address before the SDD spec is written.

**PRMS posture**: `/api/bilateral/*` (the **ingestion** path) is **excluded from JWT middleware and throttling**. PRMS relies on perimeter protection (API Gateway, IP allowlists, API keys) for ingestion security. Review endpoints under `/api/results/bilateral/*` *are* authenticated, but with a custom `auth: <JWT>` header rather than `Authorization: Bearer`.

**STAR constraints** (PRD §8.3):
- **C-2**: Auth is **AWS Cognito + JWT**. No alternative IdPs.
- **C-6**: New features are lazy-loaded standalone components — implies the FE is the surface, not a public ingestion endpoint.

**Implication**:
1. STAR's bilateral module is **review-only by default**. There is no headless `POST /api/bilateral/create` exposed to external systems on STAR's perimeter.
2. If bilateral ingestion is needed at all, it must be either:
   - (a) Owned by PRMS and STAR consumes via cross-platform federation (read/link, consistent with PRD non-goal §5.2 "no cross-platform write federation"), or
   - (b) A separate, **authenticated** path on STAR's backend with Cognito-issued service credentials — never JWT-excluded.
3. STAR's `jwt.interceptor.ts` uses `Authorization: Bearer`. The bilateral endpoints, if implemented in STAR's backend, must accept this header — the PRMS `auth: <JWT>` custom header is **not** adopted.

*STAR fit note*: **OQ-5** — confirm with product + backend leads: is bilateral ingestion in scope for STAR at all, or only the **review surface** for results ingested by PRMS / federated via deep link? The SDD spec cannot proceed without this answer.

---

## 17. Open questions / dependencies

The numbered questions surfaced through the sections above. Restated for handoff:

- **OQ-1** (§4): Route placement in STAR — `administration/bilateral-review`, `results-review`, or a new top-level path?
- **OQ-2** (§6.5): ToC tree treatment — port `app-cp-multiple-wps`, rebuild a STAR-native widget, or defer with a read-only ToC display?
- **OQ-3** (§10): Role mapping — does Science Program lead map cleanly onto MEL Regional Expert? Does Center Admin get review rights? Is a new "Bilateral Reviewer" role needed?
- **OQ-4** (§12): Backend contract ownership — PRMS-proxied, STAR-reimplemented with `MainResponse<T>`, or hybrid? Drives the API layer's adapter footprint.
- **OQ-5** (§16): Is bilateral ingestion in scope for STAR at all, or review-only?
- **OQ-6** (§14): Light + dark theme parity — required for new bilateral screens, or follow PRD OQ-3's "not codified yet" posture?
- **OQ-7** (§13): If a STAR-native ToC widget is built, who owns the ToC backend contract?
- **OQ-8** (general): Does STAR need a `bilateral_projects` cache equivalent, or is that data exposed via existing STAR endpoints?
- **OQ-9** (general): Federation linking — should STAR's results table show / link to PRMS-resident bilateral results, or only STAR-resident ones?

---

## 18. How this doc feeds the SDD spec

This briefing is **not** a spec. The canonical SDD documents for the bilateral module will live at:

- `docs/specs/bilateral-module/requirements.md`  ← from [`docs/specs/general-setup/requirements.md`](../../general-setup/requirements.md)
- `docs/specs/bilateral-module/design.md`        ← from [`docs/specs/general-setup/design.md`](../../general-setup/design.md)
- `docs/specs/bilateral-module/task.md`          ← from [`docs/specs/general-setup/task.md`](../../general-setup/task.md)

Recommended authoring order, once `figma-mockups/` and `jira-us/` are also populated:

1. Resolve **OQ-1**, **OQ-2**, **OQ-3**, **OQ-4**, **OQ-5** with the product owner. These shape scope.
2. Draft `requirements.md` — pull personas, KPIs, user stories, and acceptance criteria. Cross-link this doc, the figma-mockups corner, and the jira-us corner from §11 References.
3. Draft `design.md` — use this doc's §5–§13 as the seed; resolve every "TBD" and "OQ" to a concrete decision.
4. Draft `task.md` — graph the work. Start with the **minimal viable rebuild** order from the PRMS checklist:
   1. Review-only drawer with read-only ToC display.
   2. Approve / reject with justification.
   3. Inline title edit.
   4. Data-standard editing.
   5. Full ToC editing (only if OQ-2 path 1 or 2 was chosen).
   6. Per-type panels.

Future authors of `figma-mockups/` and `jira-us/` siblings: cross-link **back** to the section numbers in this file so the triangle closes. Conventions for those siblings will be set when their first files land.

---

## References

- PRMS source docs (read-only, external repo):
  - `/Users/jcadavid/Desktop/DEV/Desarrollos/onecgiar_pr/docs/bilateral-module/README.md`
  - `/Users/jcadavid/Desktop/DEV/Desarrollos/onecgiar_pr/docs/bilateral-module/frontend.md`
  - `/Users/jcadavid/Desktop/DEV/Desarrollos/onecgiar_pr/docs/bilateral-module/integration-contracts.md`
  - `/Users/jcadavid/Desktop/DEV/Desarrollos/onecgiar_pr/docs/bilateral-module/replication-checklist.md`
  - `/Users/jcadavid/Desktop/DEV/Desarrollos/onecgiar_pr/docs/bilateral-module/backend.md`
- STAR constitutional baseline:
  - [`docs/prd.md`](../../../prd.md) — personas §3, KPIs §4.2, constraints §8.3 (C-2, C-3, C-4 cited above)
  - [`docs/system-design/design.md`](../../../system-design/design.md) — flows §3, navigation §5, layouts §6, tokens §7, components §8, dark mode §11
  - [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) — modules §2, API contracts §4, state §6, security §8, errors §9, testing §10
  - [`docs/specs/general-setup/requirements.md`](../../general-setup/requirements.md), [`design.md`](../../general-setup/design.md), [`task.md`](../../general-setup/task.md)
  - [`research-indicators/src/CLAUDE.md`](../../../../research-indicators/src/CLAUDE.md) — folder layout, path aliases, conventions
  - [`research-indicators/src/app/app.routes.ts`](../../../../research-indicators/src/app/app.routes.ts) — live routing tree
- Sibling corners (TBD):
  - [`../figma-mockups/`](../figma-mockups/)
  - [`../jira-us/`](../jira-us/)

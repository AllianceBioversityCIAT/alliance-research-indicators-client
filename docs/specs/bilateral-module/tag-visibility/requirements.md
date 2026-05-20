# Requirements — Bilateral Module / Tag Visibility

> Feature folder under [`../`](../) ([`bilateral-module/`](../proposal.md)). Scoped to **US1 (AC-1438)** — surface the AGRESSO Pool Funding tag in the STAR client and give Center Admins a manual override. Follows the template at [`../../general-setup/requirements.md`](../../general-setup/requirements.md).

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/tag-visibility/` |
| Proposal | [`../proposal.md`](../proposal.md) — approved 2026-05-19 |
| Status | DRAFT — Phase 1 (`/sdd-specify`) |
| Domain abbreviation | `BIL-TV` |
| Backend handoff | [`../ari-backend-context/frontend-handoff.md` §4.1](../ari-backend-context/frontend-handoff.md#41-agresso-pool-funding-tag-us1) |
| Jira | [`../jira-us/AC-1438-us1-tag-bilateral-projects.md`](../jira-us/AC-1438-us1-tag-bilateral-projects.md) |
| Constitutional anchors | [`docs/prd.md`](../../../prd.md) §3–§5, §8.3 (C-1..C-6) · [`docs/system-design/design.md`](../../../system-design/design.md) §7–§8 · [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §2, §4 |

---

## 2. Executive summary

Today the STAR client cannot distinguish bilateral / Pool-Funding-tagged contracts from the rest of the portfolio. A Principal Investigator viewing **My Projects**, a Center Admin scanning **Project Detail**, and a cross-platform consumer exporting the contract list all see contracts with no Pool Funding signal. The ARI backend now exposes (a) an `is_pool_funding_contributor: boolean` field on every contract row in `GET /api/v1/agresso/contracts` and the projects-with-indicators sibling endpoint, and (b) a `PATCH /api/v1/agresso/contracts/:code/pool-funding-tag` manual override (Center Admin / System Admin only, server-enforces "must be bilateral").

This spec makes that signal visible across the contract-listing surfaces and gives Center Admins the override page. The goal is one PR-sized vertical slice of value — the smallest first step in the bilateral module — that derisks the list-extension pattern before the heavier alignment-section work lands.

---

## 3. Glossary

- **AGRESSO** — CGIAR's contract / financial system. Source of contract metadata that flows into STAR via the backend.
- **Pool Funding** — CGIAR Science Program / Accelerator funding. A contract is a "Pool Funding contributor" when it has been tagged as contributing to Pool Funding outcomes.
- **`is_pool_funding_contributor`** — the boolean field on each contract that drives this feature's visibility logic. Authored upstream (W3 Registry today, manual override otherwise).
- **Bilateral contract** — a contract whose funding modality is bilateral. Only bilateral contracts can carry the Pool Funding tag (server-enforced — non-bilateral PATCH returns 400).
- **Manual override** — the Center Admin / System Admin path to flip the tag without waiting for an upstream sync (W3 sync is a Phase-3 surface, not in this spec — see [`../proposal.md` §5 out-of-scope](../proposal.md#5-scope)).

---

## 4. System context & scope

### 4.1 In scope

- **REQ-BIL-TV-01..04** — Surface the AGRESSO Pool Funding tag on the four contract-listing UI surfaces:
  - `my-projects` (contract list table + card view)
  - `project-detail` (contract header)
  - `results-center` (each row's source contract — see OQ-TV-1)
  - `search-a-result` (each row's source contract — see OQ-TV-1)
- **REQ-BIL-TV-05** — Filter chip ("Pool Funding only") on `my-projects`. Result-list filter chips conditional on OQ-TV-1.
- **REQ-BIL-TV-06** — Excel / CSV exports that today emit a contract row include the new column.
- **REQ-BIL-TV-07** — New center-admin page that lets Center Admins / System Admins toggle the tag on a contract by code.
- **REQ-BIL-TV-08** — Server-side rejection of non-bilateral contracts is surfaced inline with the offending field (no silent failure, no full-page error).

### 4.2 Out of scope

- The Pool Funding Alignment section on the result detail page (US2 — see [`../alignment-section/`](../alignment-section/) — future `/sdd-specify`).
- The indicators panel and per-type contribution forms (US3 + US4 — see [`../indicator-mapping/`](../indicator-mapping/)).
- Pushing tagged results to PRMS (US5), W3 Registry sync (US6), SP ToC sync (US7) — backend PENDING.
- Editing CLARISA institutions / lever metadata. The tag is a property of the contract, not the controlled vocabulary.
- Bulk-tag CSV upload. The override is **per contract** in v1; bulk operations are a follow-up.

### 4.3 Architectural fit

- **Stack**: Angular 19 + PrimeNG 19 (PRD C-1). Lazy standalone components (C-6).
- **Auth**: Existing Cognito JWT + `jWtInterceptor` (C-2). New page guarded by the existing `centerAdminGuard` from `@guards/center-admin.guard`.
- **Controlled vocabularies**: CLARISA remains authoritative (C-3). No new taxonomies introduced.
- **API**: extends `ApiService` with two new methods. No new microservice. All responses flow through `MainResponse<T>` per [`detailed-design.md` §4.2](../../../detailed-design/detailed-design.md).
- **State**: existing `MyProjectsService` signal-based pattern is extended for the filter chip. No NgRx.

---

## 5. Stakeholders / personas

> PRD §3.

| Persona | Interest | Role here |
| --- | --- | --- |
| **Researcher (PI / Contributor)** | See whether their project carries the Pool Funding tag at a glance. | Read-only consumer of the tag on `my-projects` and `project-detail`. |
| **Center Admin** | Reconcile the AGRESSO tag manually when the W3 sync is unavailable or wrong. | Mutator of the tag via the new center-admin page (REQ-BIL-TV-07). |
| **System Admin** | Same as Center Admin; bypass ownership. | Mutator with broader scope. |
| **MEL Regional Expert** | Validate Pool Funding coverage across centers. | Read-only consumer; uses the filter chip and export. |
| **Cross-Platform Consumer** | Aggregate Pool Funding contracts in downstream tools. | Read-only via Excel/CSV export (REQ-BIL-TV-06). |

---

## 6. Functional requirements

### REQ-BIL-TV-01 — *My Projects shows the AGRESSO Pool Funding tag*

- **Statement**: The user can see, for every contract row in `my-projects`, whether it is tagged as a Pool Funding contributor.
- **Persona(s)**: Researcher, Center Admin, MEL Regional Expert.
- **PRD goal(s)**: G-1 (traceability of bilateral contributions), G-3 (consistent UX across surfaces).
- **Acceptance criteria**:
  - AC-01.1 — A new "Pool Funding" column appears in the `my-projects` table view between the existing **Lever** column and **Status** column.
  - AC-01.2 — The column renders the existing `CustomTagComponent` with text "Pool Funding" when `is_pool_funding_contributor === true`; the cell is empty when `false`.
  - AC-01.3 — In card view (toggled via `toggleCardView()`), the same tag appears beside the lever badge on each `ProjectItemComponent`.
  - AC-01.4 — Column is sortable: clicking the header sorts contracts so Pool Funding contracts surface first (or last, on second click).
  - AC-01.5 — When the API response omits the field entirely (legacy / pre-deploy backend), the cell renders empty without console errors and without breaking the table.
- **Notes**: The tag value is read from the existing `FindContracts` row (no new endpoint call). Backend extends `GET_FindContracts` per the handoff.

### REQ-BIL-TV-02 — *Project Detail shows the AGRESSO Pool Funding tag*

- **Statement**: The user can see the Pool Funding tag in the header of `project-detail`.
- **Persona(s)**: Researcher, Center Admin.
- **PRD goal(s)**: G-1, G-3.
- **Acceptance criteria**:
  - AC-02.1 — A "Pool Funding" badge (same `CustomTagComponent` instance as AC-01.2) renders in the contract header next to the contract code when `is_pool_funding_contributor === true`.
  - AC-02.2 — When `false`, no badge renders (no "Not Pool Funding" empty-state badge — silence is the signal).
  - AC-02.3 — When the user has Center Admin permission, the badge is clickable and routes to `/administration/center-admin/agresso-pool-funding-tag?contract-code=<code>` pre-populated. Non-Center Admins see a non-clickable badge.

### REQ-BIL-TV-03 — *Results Center reflects the source contract's Pool Funding tag*

- **Statement**: The user can see, for every result row in `results-center`, whether its source contract carries the Pool Funding tag.
- **Persona(s)**: Researcher, Center Admin, MEL Regional Expert.
- **Acceptance criteria**:
  - AC-03.1 — A new "Pool Funding" column appears in the `results-center` table, hidden by default and toggleable via the existing column-configuration sidebar (consistent with how other optional columns work today).
  - AC-03.2 — When visible, the column renders the same `CustomTagComponent` "Pool Funding" tag as AC-01.2 for results whose source contract is tagged.
  - AC-03.3 — When a result has no associated contract (legacy / partner-only results), the cell renders empty without error.
- **Notes**: Conditional on OQ-TV-1 — the results-center API response must surface `is_pool_funding_contributor` (or an equivalent) at the result row level. If the backend cannot enrich, this requirement defers to a follow-up and is dropped from this spec (Center Admins still get coverage via REQ-BIL-TV-01 / -02 / -07).

### REQ-BIL-TV-04 — *Search-a-Result reflects the source contract's Pool Funding tag*

- **Statement**: Same as REQ-BIL-TV-03 but for the `search-a-result` page.
- **Acceptance criteria**:
  - AC-04.1 — Same column / tag / empty-state behavior as AC-03.1..03.3.
- **Notes**: Same conditional on OQ-TV-1 as REQ-BIL-TV-03.

### REQ-BIL-TV-05 — *Filter by Pool Funding tag*

- **Statement**: The user can filter contract / result listings to show only Pool Funding contributors.
- **Persona(s)**: Researcher (typical), MEL Regional Expert (cross-center analysis).
- **Acceptance criteria**:
  - AC-05.1 — In the `my-projects` filter sidebar, a new "Pool Funding only" boolean filter (toggle / checkbox) is added between **Lever** and **Status**.
  - AC-05.2 — When enabled and applied, the request to `GET /api/v1/agresso/contracts` includes `pool-funding-contributor=true`; results-list contracts include only Pool Funding contributors.
  - AC-05.3 — When applied, an active-filter chip "POOL FUNDING ONLY" appears in the active-filters strip with the standard "X" remove affordance (mirrors `getActiveFilters` in `MyProjectsService`).
  - AC-05.4 — `MyProjectsService.resetFilters()` and `clearAllFilters()` clear this filter as well.
  - AC-05.5 — Filter state persists across page reload via the same `sessionStorage` mechanism used by other my-projects filters.
  - AC-05.6 — `results-center` / `search-a-result` filter chips are added only if OQ-TV-1 resolves to "result-list endpoints enrich on the same flag"; otherwise deferred.

### REQ-BIL-TV-06 — *Excel / CSV exports include the Pool Funding column*

- **Statement**: Every export surface that today emits a contract row includes the Pool Funding tag as a new column.
- **Persona(s)**: Cross-Platform Consumer, MEL Regional Expert.
- **Acceptance criteria**:
  - AC-06.1 — `my-projects` Excel export (existing menu action) includes a "Pool Funding" column with values `"Yes"` / `""` (empty string for false / unknown).
  - AC-06.2 — Column header is "Pool Funding" exactly (matching the table column header for searchability).
  - AC-06.3 — Column is positioned after "Lever" and before "Status" in the exported file, matching the table column order.
  - AC-06.4 — Results-center export inherits the column only if AC-03.1 is delivered.

### REQ-BIL-TV-07 — *Center Admin can manually override the Pool Funding tag*

- **Statement**: A Center Admin or System Admin can flip the AGRESSO Pool Funding tag on a contract via a dedicated admin page.
- **Persona(s)**: Center Admin, System Admin.
- **Acceptance criteria**:
  - AC-07.1 — A new lazy route `/administration/center-admin/agresso-pool-funding-tag` exists, guarded by `centerAdminGuard`. Non-Center Admins are redirected to `/home` (matches existing center-admin pages).
  - AC-07.2 — The page accepts an optional query param `?contract-code=<code>` and pre-fills the input.
  - AC-07.3 — The user enters a contract code (free text input wrapped via the existing custom-fields styles), clicks **Look up** to fetch the contract metadata.
  - AC-07.4 — On successful lookup, the current value of `is_pool_funding_contributor` is shown, alongside a toggle to set the new value and an optional justification text area.
  - AC-07.5 — On **Save**, the client calls `PATCH /api/v1/agresso/contracts/:code/pool-funding-tag` with body `{ is_pool_funding_contributor: <new value> }`.
  - AC-07.6 — On 200, the page shows a success toast via `ActionsService.showToast({ severity: 'success', ... })` and resets the form (or keeps the contract loaded for further edits — UX decides; document in design.md).
  - AC-07.7 — The page is registered in the existing center-admin navigation surface alongside `capacity-bulk-upload` and `sdg-management`.
- **Notes**: This is the only mutation surface in this spec. All other requirements are read-only.

### REQ-BIL-TV-08 — *Non-bilateral PATCH is surfaced inline*

- **Statement**: When the server rejects a PATCH because the contract is not bilateral, the user sees a field-level error, not a toast or a generic 500.
- **Persona(s)**: Center Admin, System Admin.
- **Acceptance criteria**:
  - AC-08.1 — On 400 response with `description` mentioning "bilateral" (or `errors[].field === 'contract_code'`), the error is rendered inline below the contract-code input.
  - AC-08.2 — Error copy is "This contract is not bilateral. Only bilateral contracts can carry the Pool Funding tag." (final copy may be revised by design — track as OQ-TV-2).
  - AC-08.3 — The toast layer is suppressed for this specific error (avoid double-surfacing). The global `httpErrorInterceptor` does not duplicate the inline message.
  - AC-08.4 — Other 4xx (e.g., 401 / 403) follow the existing global behavior — no special handling here.

---

## 7. Non-functional requirements

- **REQ-BIL-TV-NF-01 — Performance.** Adding the Pool Funding column does not increase initial render of `my-projects` by more than 50 ms (measured against a 100-row fixture, average of 3 runs in Chrome DevTools Performance).
- **REQ-BIL-TV-NF-02 — Accessibility (C-4).** All new surfaces meet WCAG 2.1 AA: the tag is announced by screen readers ("Pool Funding, tag"), the filter checkbox has an associated label, the center-admin form has visible focus rings, the inline error from AC-08.1 is announced via `aria-live="polite"`.
- **REQ-BIL-TV-NF-03 — Bundle budget (C-5).** Net JS added to the initial chunk ≤ 15 KB gzipped. The center-admin page lazy-loads, so it contributes 0 KB to the initial chunk.
- **REQ-BIL-TV-NF-04 — Theming.** All new surfaces honor dark + light mode via the existing `--ac-*` tokens. No hex literals introduced.
- **REQ-BIL-TV-NF-05 — i18n.** Strings are English-only. The new strings are extractable (no template interpolation of variables into displayed copy) so a future i18n pass can lift them.
- **REQ-BIL-TV-NF-06 — Coverage.** Unit-test coverage on changed files: services ≥ 80%, components ≥ 60%. Project-wide coverage floors from [`jest.config.ts`](../../../../research-indicators/jest.config.ts) (statements 40% / branches 20% / lines 45% / functions 30%) must not regress.

---

## 8. Data inputs & outputs

### 8.1 Inputs (REST)

| Endpoint | Service method | Used by | Notes |
| --- | --- | --- | --- |
| `GET /api/v1/agresso/contracts` (existing, extended) | `ApiService.GET_FindContracts(params)` | `MyProjectsService.main()` | Response rows now include `is_pool_funding_contributor: boolean`. New optional query param `pool-funding-contributor=true|false`. |
| `GET /api/v1/agresso/contracts/:code` (existing) | `ApiService.GET_ContractByCode(code)` *(new method — confirm or extend in design)* | Center-admin page lookup | Returns single contract incl. `is_pool_funding_contributor`. |
| `PATCH /api/v1/agresso/contracts/:code/pool-funding-tag` (new) | `BilateralService.patchPoolFundingTag(code, value)` (new) | Center-admin page save | Body: `{ is_pool_funding_contributor: boolean }`. |
| `GET /api/v1/results` family (existing, possibly extended — see OQ-TV-1) | `ApiService.GET_FindResults(params)` etc. | `results-center`, `search-a-result` | Conditional enrichment with `is_pool_funding_contributor` per row. |

### 8.2 Outputs (UI)

- New table column on `my-projects` / `results-center` / `search-a-result`.
- New badge on `project-detail` header.
- New filter chip / sidebar entry on `my-projects`.
- New admin page under `/administration/center-admin/agresso-pool-funding-tag`.
- Extended Excel/CSV exports.

### 8.3 Persisted state

- The "Pool Funding only" filter state is added to the existing `MyProjectsFilters` class and persisted via the existing `sessionStorage`-backed `MyProjectsService.activateStatePersistence()` flow. No new persistence mechanism.

---

## 9. Controlled vocabularies

PRD C-3 confirmation: this spec touches **no controlled vocabulary**. The Pool Funding tag is a boolean property of a contract, not a CLARISA list. Contracts, institutions, levers, etc. all continue to come from CLARISA — unchanged.

---

## 10. Role & permission matrix

> Mirrors server enforcement; do not invent client-only rules. See [`../ari-backend-context/frontend-handoff.md` §2](../ari-backend-context/frontend-handoff.md#2-auth-roles--ownership).

| Action | Researcher (CONTRIBUTOR) | Center Admin | MEL Regional Expert | System Admin | Cross-Platform Consumer | Anonymous |
|--------|--------------------------|--------------|---------------------|--------------|-------------------------|-----------|
| View Pool Funding column in `my-projects` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Pool Funding badge in `project-detail` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Pool Funding column in `results-center` / `search-a-result` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Use "Pool Funding only" filter | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Export Excel/CSV with Pool Funding column | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Access `/administration/center-admin/agresso-pool-funding-tag` | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `PATCH /pool-funding-tag` | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |

Guard composition:
- All read surfaces rely on the existing platform `rolesGuard` (logged-in).
- The center-admin page uses `canMatch: [centerAdminGuard]` from `@guards/center-admin.guard`. `SYSTEM_ADMIN` is already covered by `canAccessCenterAdmin()` (verify in design.md against `RolesService`).

---

## 11. Telemetry & observability

- **Hotjar / Clarity / GA**: a new event `bilateral.tag.override.saved` fires on successful PATCH from the center-admin page. Naming follows the existing `*.service.ts` convention (verify exact pattern in design.md against `tracking-tools.service.ts` and `google-analytics.service.ts`).
- **BugHerd**: no new triggers.
- **Error surfaces**:
  - Inline form error for 400 (AC-08.1).
  - Standard toast for unexpected 5xx via the existing `httpErrorInterceptor`.
  - No new console logging beyond the existing `ApiService` error logger.

---

## 12. Assumptions & open questions

### Assumptions

- **A-1** — `ApiService.GET_FindContracts` will receive `is_pool_funding_contributor` on every contract row once the backend feature flag `ARI_BILATERAL_MODULE_ENABLED=true` is on for the environment. When the flag is off, the field is absent and we render an empty cell silently.
- **A-2** — The existing `ProjectItemComponent` accepts an optional prop / signal to render an additional badge slot, or can be extended without breaking other consumers. *(Design.md verifies.)*
- **A-3** — The existing `results-center.service.ts` returns rows in a shape that can be extended with `is_pool_funding_contributor` without breaking the table sort utils (`result-table-sort.util.ts`).
- **A-4** — `RolesService.canAccessCenterAdmin()` returns true for both `CENTER_ADMIN` and `SYSTEM_ADMIN`. *(Design.md verifies; if not, the guard composition is adjusted there.)*

### Open questions

- **OQ-TV-1 — Result-list enrichment.** Does `GET_FindResults` / `results-center.service.ts` already surface the source contract's `is_pool_funding_contributor`? If yes, REQ-BIL-TV-03 / -04 are confirmed in-scope. If no, they defer to a follow-up spec **once backend enrichment lands**. *(Resolved in `design.md` §2 after confirming with the backend team or reading the response fixtures under `server/researchindicators/test/`.)*
- **OQ-TV-2 — Inline error copy.** AC-08.2 final copy: "This contract is not bilateral. Only bilateral contracts can carry the Pool Funding tag." Confirm with design / PO. *(Resolved in `design.md` §4.5 or by 2026-05-23.)*
- **OQ-TV-3 — Bulk override.** Is a CSV bulk-override path needed in v1? Per `../proposal.md §5`, deferred. If Center Admins push back, escalate as a new feature folder. *(Owned by PO.)*
- **OQ-TV-4 — Card-view affordance.** REQ-BIL-TV-01 AC-01.3 says the tag appears beside the lever badge in card view. Confirm placement with design — Figma `figma-mockups/_assets/` does not yet have a card-view variant for the Pool Funding tag. *(Resolved in `design.md` §4.2.)*

---

## 13. References

- PRD: [`docs/prd.md`](../../../prd.md) §3 (personas), §4 (goals/KPIs), §8.3 (constraints C-1..C-6).
- System Design: [`docs/system-design/design.md`](../../../system-design/design.md) §7 (tokens), §8 (shared components), §12 (decisions log).
- Detailed Design: [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §2 (modules), §4 (API surface), §6 (state).
- Sibling specs: [`../alignment-section/`](../alignment-section/) (US2, pending), [`../indicator-mapping/`](../indicator-mapping/) (US3+US4, pending).
- Context corners: [`../figma-mockups/`](../figma-mockups/), [`../jira-us/AC-1438-us1-tag-bilateral-projects.md`](../jira-us/AC-1438-us1-tag-bilateral-projects.md), [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md), [`../ari-backend-context/frontend-handoff.md`](../ari-backend-context/frontend-handoff.md).
- Backend integration: [`../ari-backend-context/frontend-handoff.md` §4.1](../ari-backend-context/frontend-handoff.md#41-agresso-pool-funding-tag-us1).

---

## 14. Requirement ID index

| ID | Title | Persona(s) | Type |
| --- | --- | --- | --- |
| REQ-BIL-TV-01 | My Projects shows the AGRESSO Pool Funding tag | Researcher, Center Admin, MEL | Functional |
| REQ-BIL-TV-02 | Project Detail shows the AGRESSO Pool Funding tag | Researcher, Center Admin | Functional |
| REQ-BIL-TV-03 | Results Center reflects the source contract's Pool Funding tag | Researcher, Center Admin, MEL | Functional (conditional on OQ-TV-1) |
| REQ-BIL-TV-04 | Search-a-Result reflects the source contract's Pool Funding tag | Researcher, Center Admin, MEL | Functional (conditional on OQ-TV-1) |
| REQ-BIL-TV-05 | Filter by Pool Funding tag | Researcher, MEL | Functional |
| REQ-BIL-TV-06 | Excel / CSV exports include the Pool Funding column | Cross-Platform Consumer, MEL | Functional |
| REQ-BIL-TV-07 | Center Admin can manually override the Pool Funding tag | Center Admin, System Admin | Functional |
| REQ-BIL-TV-08 | Non-bilateral PATCH is surfaced inline | Center Admin, System Admin | Functional |
| REQ-BIL-TV-NF-01 | Performance — render not slower by > 50 ms | All | Non-functional |
| REQ-BIL-TV-NF-02 | Accessibility WCAG 2.1 AA (C-4) | All | Non-functional |
| REQ-BIL-TV-NF-03 | Bundle budget ≤ 15 KB gz to initial chunk (C-5) | All | Non-functional |
| REQ-BIL-TV-NF-04 | Dark + light theming parity | All | Non-functional |
| REQ-BIL-TV-NF-05 | i18n — strings extractable | All | Non-functional |
| REQ-BIL-TV-NF-06 | Test coverage — services ≥ 80% / components ≥ 60% | All | Non-functional |

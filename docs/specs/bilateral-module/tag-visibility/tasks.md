# Tasks — Bilateral Module / Tag Visibility

> Execution units for [`./requirements.md`](./requirements.md) and [`./design.md`](./design.md). Follows the template at [`../../general-setup/task.md`](../../general-setup/task.md). Consumed by `/sdd-execute`.

---

## 1. Goal

When this task list completes: every contract surface in the STAR client distinguishes Pool Funding contributors at a glance (column on `my-projects`, badge on `project-detail`), the user can filter by Pool Funding only, the Excel export inherits the new column, and Center Admins / System Admins can manually override the AGRESSO Pool Funding tag from a dedicated lazy-loaded admin page — all gated by the existing `centerAdminGuard`, all flowing through `ApiService`, with no NgModule, no new persistence, and no parallel taxonomy.

---

## 2. Pre-flight checklist

- [x] [`./requirements.md`](./requirements.md) and [`./design.md`](./design.md) exist and are reviewed (approved 2026-05-19).
- [x] PRD personas (PRD §3) and constraints C-1..C-6 (PRD §8.3) are still current.
- [x] No conflicting in-flight spec under `docs/specs/bilateral-module/` — sibling [`alignment-section/`](../alignment-section/) and [`indicator-mapping/`](../indicator-mapping/) folders are not yet specified.
- [x] Path aliases (`@platform`, `@services`, `@interfaces`, `@guards`) already declared in [`tsconfig.json`](../../../../research-indicators/tsconfig.json) and [`jest.config.ts`](../../../../research-indicators/jest.config.ts).
- [ ] ARI backend reachable from `environment.dev.ts`'s `mainApiUrl` with `ARI_BILATERAL_MODULE_ENABLED=true` (verify before T-BIL-TV-09 smoke).
- [ ] Backend `GET /api/v1/agresso/contracts/:code` endpoint exists *(R-3 from `design.md` §13 — verify in T-BIL-TV-01)*.

---

## 3. Dependency graph

```
T-BIL-TV-01 (interfaces + ApiService methods, no deps)
    └─▶ T-BIL-TV-02 (BilateralService)
            └─▶ T-BIL-TV-09 (override page + route)
                    ├─▶ T-BIL-TV-11 (telemetry)
                    └─▶ T-BIL-TV-12 (docs update)
T-BIL-TV-03 (visual tokens, no deps)
    ├─▶ T-BIL-TV-05 (my-projects column)
    ├─▶ T-BIL-TV-06 (card-view badge)
    └─▶ T-BIL-TV-07 (project-detail header badge)
T-BIL-TV-04 (MyProjectsService filter, no deps)
    └─▶ T-BIL-TV-05 (column + filter UI)
            └─▶ T-BIL-TV-10 (Excel export — conditional)
T-BIL-TV-08 (interceptor audit, no deps)
    └─▶ T-BIL-TV-09 (override page)
```

No cycles. Parallel-safe groups (after T-BIL-TV-01..04 land):
- **Group A**: T-BIL-TV-05, T-BIL-TV-06, T-BIL-TV-07 (independent list-surface edits, share only the tokens from T-BIL-TV-03).
- **Group B**: T-BIL-TV-08 (interceptor audit — pure investigation, no shared touches).
- **Group C** (after Group A + B): T-BIL-TV-09 (override page), T-BIL-TV-10 (export).

---

## 4. Tasks

---

### T-BIL-TV-01 — Add bilateral interfaces + extend `ApiService`

- **Status**: `completed` (2026-05-20)
- **Size**: S
- **Depends on**: none
- **Discharges ACs**: enables AC-01.5, AC-07.5, AC-08.x (typing only — actual surfaces in later tasks).
- **Touches**:
  - `src/app/shared/interfaces/find-contracts.interface.ts` *(extend)*
  - `src/app/shared/interfaces/bilateral/agresso-contract.interface.ts` *(new)*
  - `src/app/shared/services/api.service.ts` *(add two methods + extend filter type)*
- **Summary**: Add the typing scaffolding that every later task depends on. Extends `FindContracts` with optional `is_pool_funding_contributor: boolean`. Creates a new `interfaces/bilateral/` folder with `AgressoContract`, `PoolFundingTagPatchBody`, `PoolFundingTagPatchResponse`. Adds `GET_AgressoContract` and `PATCH_PoolFundingTag` to `ApiService` (alongside the existing AGRESSO contract methods around line 622). Extends the inline `GET_FindContracts` filter type with `'pool-funding-contributor'?: boolean`.
- **Implementation notes**:
  - Per [`./design.md` §3.1](./design.md#31-apiservice-additions-drop-next-to-the-existing-agresso-block-in-apiservicets) — copy the two arrow-function method bodies verbatim, mind `useResultInterceptor: true` on the PATCH (revisit in T-BIL-TV-08).
  - **Verify R-3 from [`./design.md` §13](./design.md#13-risks--mitigations)**: confirm `GET /api/v1/agresso/contracts/:code` exists. Open Swagger UI per [`../ari-backend-context/frontend-handoff.md` §10](../ari-backend-context/frontend-handoff.md#10-local-development-tips). If absent, fall back to `GET_FindContracts({ 'contract-code': code })` and document the deviation in [`./design.md` §11](./design.md#11-design-decisions-decision-record).
  - Use `encodeURIComponent(code)` in both URL templates.
  - `is_bilateral` on `AgressoContract` is required — confirm the backend GET returns it. If not, derive from `funding_type` per local convention and note in §11.
- **Tests to add/update**:
  - `api.service.spec.ts` — add cases for `GET_AgressoContract` (URL encoding of special chars) and `PATCH_PoolFundingTag` (body shape, `useResultInterceptor` flag set).
- **Done when**:
  - All listed file touches compiled with `strictTemplates` and `noPropertyAccessFromIndexSignature` clean.
  - `npm run lint` clean for changed files.
  - `npm run test -- api.service` passes; new cases assert on `MainResponse<T>` envelope.
- **Relevant skills**: `angular-developer`, `api-design-principles`.

---

### T-BIL-TV-02 — Create `BilateralService` with signals + happy-path/error-path tests

- **Status**: `completed` (2026-05-20)
- **Size**: S
- **Depends on**: T-BIL-TV-01.
- **Discharges ACs**: enables AC-07.3, AC-07.5, AC-07.6, AC-08.1, AC-08.3.
- **Touches**:
  - `src/app/shared/services/bilateral.service.ts` *(new)*
  - `src/app/shared/services/bilateral.service.spec.ts` *(new)*
- **Summary**: Stand up the domain facade that the rest of bilateral-module (this spec + the two siblings) will share. Singleton via `providedIn: 'root'`. Exposes `currentContract`, `loadingContract`, `savingTag` signals and `getContract(code)` / `patchTag(code, value)` methods. The `patchTag` return shape distinguishes 200 from 400-with-bilateral so the calling component can choose toast vs. inline error without duplication.
- **Implementation notes**:
  - Implementation body lives at [`./design.md` §4.4.1](./design.md#441-new--bilateralservice) — keep the shape verbatim.
  - `getContract` returns `null` on `!successfulRequest` (covers 404 cleanly).
  - `patchTag` MUST NOT call `actions.showToast` on the 400-bilateral path — the override page owns that decision. The service stays passive about UX.
  - When `patchTag` returns `{ ok: true }`, update `currentContract` with the new value optimistically (the response confirms it, but the update happens before that — small race acceptable, never wrong).
- **Tests to add/update**:
  - `bilateral.service.spec.ts` — 6 cases:
    1. `getContract` happy path — sets `currentContract`, flips `loadingContract` true→false.
    2. `getContract` 404 — returns `null`, leaves `currentContract` unchanged… wait, sets to `null`.
    3. `patchTag` 200 — returns `{ ok: true, data }`, updates `currentContract.is_pool_funding_contributor`.
    4. `patchTag` 400 with "bilateral" — returns `{ ok: false, status: 400, description }`, does NOT toast.
    5. `patchTag` 5xx — returns `{ ok: false, status: 500 }`, lets the global interceptor handle toast.
    6. `loadingContract` and `savingTag` correctly toggle even on rejection.
- **Done when**:
  - Coverage on `bilateral.service.ts` ≥ 90% statements (small surface — easy).
  - `npm run test` green.
- **Relevant skills**: `angular-developer`, `error-handling-patterns`.

---

### T-BIL-TV-03 — Pool Funding visual tokens + `STATUS_COLOR_MAP` entry

- **Status**: `completed` (2026-05-20)
- **Size**: S
- **Depends on**: none
- **Discharges ACs**: enables AC-01.2, AC-02.1, AC-03.2 (visual layer for all tag renderings); REQ-BIL-TV-NF-04.
- **Touches**:
  - `src/styles/colors.scss` *(add 6 CSS variables — 3 light + 3 dark)*
  - `src/app/shared/constants/status-colors.ts` *(add `'pool-funding'` entry)*
  - `research-indicators/README.md` *(token reference table — append)*
  - `docs/system-design/design.md` §7 *(token list — append in §12 design-decisions log)*
- **Summary**: Add the three tokens (`--ac-pool-funding-fg`, `--ac-pool-funding-bg`, `--ac-pool-funding-border`) for light and dark themes, register them in `STATUS_COLOR_MAP` under key `'pool-funding'`, and update both the per-repo `README.md` token reference and the global system-design tokens list. Working colors per [`./design.md` §4.6](./design.md#46-theming).
- **Implementation notes**:
  - **No hex literals in component code** — per [`research-indicators/src/CLAUDE.md`](../../../../research-indicators/src/CLAUDE.md).
  - Validate contrast against `--ac-pool-funding-bg` hits WCAG 2.1 AA (≥ 4.5:1 for normal text, ≥ 3:1 for the tag border/icon).
  - If contrast fails in dark mode, raise the FG luminance — keep BG / border intact.
  - Working palette is provisional (R-1) — flag for design QA before merge.
- **Tests to add/update**:
  - No unit test (pure SCSS / constants). Snapshot test on `CustomTagComponent` rendering with `statusId="pool-funding"` is welcome but not required.
  - Manual contrast check noted in PR description.
- **Done when**:
  - `npm run s-lint` (SCSS) clean.
  - Token names match `--ac-*` convention (no `--bilateral-*` or other ad-hoc namespaces).
  - System-design §7 + README updated in the same PR.
- **Relevant skills**: `tailwind-design-system` (token thinking), `ui-ux-pro-max`.

---

### T-BIL-TV-04 — Extend `MyProjectsService` with `poolFundingOnly` filter

- **Status**: `completed` (2026-05-20)
- **Size**: S
- **Depends on**: T-BIL-TV-01 (FindContracts extension is used by the sort key).
- **Discharges ACs**: AC-05.2, AC-05.3, AC-05.4, AC-05.5; foundation for AC-01.4.
- **Touches**:
  - `src/app/shared/services/my-projects.service.ts`
  - `src/app/shared/services/my-projects.service.spec.ts`
- **Summary**: Add `poolFundingOnly: boolean` to `MyProjectsFilters`. Thread it through `applyFilters()` (adds `pool-funding-contributor=true` to the request when set), `getActiveFilters()` (appends a chip), `removeFilter()` (handles "POOL FUNDING" label), `countFiltersSelected()`, `resetFilters()`, `hasFilters()`, and `restorePersistedState()`. Extend `mapTableFieldToApiField` (called from `my-projects.component.ts`) with the new sort key.
- **Implementation notes**:
  - Sort mapping: `is_pool_funding_contributor → 'pool-funding-contributor'`.
  - Persistence — already covered by the existing `sessionStorage` round-trip because `MyProjectsFilters` is serialized whole. Verify nothing strips the field.
  - The chip label is `'POOL FUNDING'` and value `'Only Pool Funding'`. The `removeFilter` mapping table needs the new entry.
  - Set the filter `false` when the user clicks the chip's X (no per-value removal needed — boolean).
- **Tests to add/update**:
  - `my-projects.service.spec.ts` — extend existing suite:
    1. `applyFilters` with `poolFundingOnly=true` → request params include `'pool-funding-contributor': true`.
    2. `applyFilters` with `poolFundingOnly=false` → request params do NOT include the key.
    3. `getActiveFilters` returns one chip when enabled.
    4. `removeFilter('POOL FUNDING')` resets to `false`.
    5. `resetFilters` clears `poolFundingOnly`.
    6. Round-trip through `restorePersistedState` preserves the flag.
- **Done when**:
  - Existing my-projects tests still pass (no regression).
  - Coverage on changed lines ≥ 80%.
- **Relevant skills**: `angular-developer`.

---

### T-BIL-TV-05 — Pool Funding column + filter sidebar entry in `MyProjectsComponent`

- **Status**: `completed` (2026-05-20)
- **Size**: M
- **Depends on**: T-BIL-TV-03, T-BIL-TV-04.
- **Discharges ACs**: AC-01.1, AC-01.2, AC-01.4, AC-01.5, AC-05.1, AC-05.6.
- **Touches**:
  - `src/app/pages/platform/pages/my-projects/my-projects.component.html`
  - `src/app/pages/platform/pages/my-projects/my-projects.component.ts`
  - `src/app/pages/platform/pages/my-projects/my-projects.component.scss` *(if sizing tweaks needed)*
  - `src/app/pages/platform/pages/my-projects/my-projects.component.spec.ts`
- **Summary**: Insert a "Pool Funding" `<p-column>` in the table between the Lever and Status columns. Bind the cell to `<app-custom-tag statusId="pool-funding" statusName="Pool Funding" tiny="true">` when `project.is_pool_funding_contributor === true`; empty cell otherwise. Make the column sortable via `mapTableFieldToApiField` from T-BIL-TV-04. Add a "Pool Funding only" toggle/checkbox to the existing filter sidebar between Lever and Status sections (the sidebar is rendered via `SectionSidebarComponent` — confirm slot mechanism during implementation).
- **Implementation notes**:
  - Column header text: `"Pool Funding"` exactly (matches Excel export header in T-BIL-TV-10).
  - When `is_pool_funding_contributor` is `undefined` (backend flag off), render empty without `?.` chain spamming console warnings.
  - Sidebar checkbox: PrimeNG `p-checkbox` wrapped in the existing custom-fields styling. Two-way bind to `myProjectsService.tableFilters().poolFundingOnly` via a getter/setter (mirror how other boolean filters are handled — verify pattern during impl).
  - Apply Filters button stays the same — `applyFilters()` in the service picks up the new boolean.
- **Tests to add/update**:
  - `my-projects.component.spec.ts`:
    1. With a fixture row `{is_pool_funding_contributor: true}` → the row contains a `.p-tag` (or `[data-testid="pool-funding-tag"]` if we add one).
    2. With `false`/`undefined` → no `.p-tag` in that column.
    3. Sidebar checkbox click sets the filter signal.
    4. Sort by Pool Funding column triggers `mapTableFieldToApiField → 'pool-funding-contributor'`.
- **Done when**:
  - Visual smoke matches Figma (or, lacking the exact Figma node, matches the agreed working palette).
  - Render-time delta ≤ 50 ms vs. baseline on a 100-row local fixture (REQ-BIL-TV-NF-01) — record measurement in PR description.
  - No regression in existing column resize / sort tests.
- **Relevant skills**: `angular-developer`, `ui-ux-pro-max`, `frontend-design`.

---

### T-BIL-TV-06 — Card-view Pool Funding badge in `ProjectItemComponent`

- **Status**: `completed` (2026-05-20)
- **Size**: S
- **Depends on**: T-BIL-TV-03.
- **Discharges ACs**: AC-01.3.
- **Touches**:
  - `src/app/shared/components/project-item/project-item.component.ts` *(add `@Input() isPoolFunding?: boolean`)*
  - `src/app/shared/components/project-item/project-item.component.html` *(conditional `<app-custom-tag>` after lever badge)*
  - `src/app/shared/components/project-item/project-item.component.scss` *(spacing — `rs-gap-2`)*
  - `src/app/shared/components/project-item/project-item.component.spec.ts`
  - `src/app/pages/platform/pages/my-projects/my-projects.component.html` *(pass `[isPoolFunding]="project.is_pool_funding_contributor"`)*
- **Summary**: Extend the shared `ProjectItemComponent` with an optional input that renders a second small `<app-custom-tag>` next to the lever badge. Pass-through from the my-projects card-view template using the new `FindContracts.is_pool_funding_contributor` field.
- **Implementation notes**:
  - Default `false` — existing consumers of `ProjectItemComponent` (search for usages in the codebase as the first impl step) keep their current rendering.
  - The new badge uses `tiny="true"` so card layout doesn't reflow.
  - **OQ-TV-4 placement** — to the right of the lever badge, gap `rs-gap-2`. Recheck against Figma if a card-view variant is added later.
- **Tests to add/update**:
  - `project-item.component.spec.ts`:
    1. Default `isPoolFunding=false` — no Pool Funding tag rendered.
    2. `isPoolFunding=true` — tag rendered with correct text.
    3. Other inputs unaffected (regression on existing snapshots).
- **Done when**:
  - All other consumers of `ProjectItemComponent` still render the same (visual smoke pass in any other surface that uses it).
  - Card width unchanged at `cache.hasSmallScreen()` paths.
- **Relevant skills**: `angular-developer`, `ui-ux-pro-max`.

---

### T-BIL-TV-07 — Project Detail header badge (clickable for Center Admins)

- **Status**: `completed` (2026-05-20)
- **Size**: S
- **Depends on**: T-BIL-TV-03.
- **Discharges ACs**: AC-02.1, AC-02.2, AC-02.3.
- **Touches**:
  - `src/app/pages/platform/pages/project-detail/project-detail.component.html`
  - `src/app/pages/platform/pages/project-detail/project-detail.component.ts` *(inject `RolesService` if not already — confirm during impl)*
  - `src/app/pages/platform/pages/project-detail/project-detail.component.spec.ts`
- **Summary**: Render the Pool Funding badge in the contract header alongside the contract code when `is_pool_funding_contributor === true`. For Center Admins / System Admins (`rolesService.canAccessCenterAdmin()`), wrap the badge in `<a [routerLink]>` to `/administration/center-admin/agresso-pool-funding-tag` with `?contract-code=<code>` for pre-fill. For others, render a static badge.
- **Implementation notes**:
  - Silence is the signal — when `false`, no "Not Pool Funding" badge (AC-02.2).
  - Use `<app-custom-tag statusId="pool-funding" ...>` for parity with the my-projects column.
  - The `routerLink` payload uses Angular `[queryParams]="{ 'contract-code': agreement_id }"` rather than string concatenation.
- **Tests to add/update**:
  - `project-detail.component.spec.ts`:
    1. Renders badge when `is_pool_funding_contributor=true`.
    2. Does not render badge when `false` or `undefined`.
    3. When `canAccessCenterAdmin()` returns true → badge wrapped in `<a>`. When false → plain badge.
- **Done when**:
  - Manual smoke: Center Admin click → lands on override page with input pre-filled.
- **Relevant skills**: `angular-developer`, `ui-ux-pro-max`.

---

### T-BIL-TV-08 — Audit `result.interceptor` for 400 toast suppression

- **Status**: `completed` (2026-05-20)
- **Size**: S
- **Depends on**: none (pure investigation; ideally before T-BIL-TV-09).
- **Discharges ACs**: AC-08.3 (defensive — the audit confirms the global layer doesn't double-surface).
- **Touches**:
  - `src/app/shared/interceptors/result.interceptor.ts` *(read; possibly tweak)*
  - `src/app/shared/interceptors/http-error.interceptor.ts` *(read only)*
  - `docs/specs/bilateral-module/tag-visibility/design.md` *(record findings in §11)*
- **Summary**: Walk both interceptors and confirm: (a) `httpErrorInterceptor` does not toast on 400; (b) `result.interceptor` does not toast on 400-with-`useResultInterceptor:true` (or, if it does, propose either flipping the PATCH to `useResultInterceptor:false` or short-circuiting per-endpoint). Record the answer as a new entry in [`./design.md` §11](./design.md#11-design-decisions-decision-record).
- **Implementation notes**:
  - This is a 1-hour audit, not a refactor. Three possible outcomes:
    1. Neither interceptor toasts on 400 → no code change; design.md gets a "verified" decision row.
    2. `result.interceptor` toasts on 400 → flip the PATCH options to `useResultInterceptor: false` in T-BIL-TV-01 (revisit) and document.
    3. `httpErrorInterceptor` toasts on 400 generically → introduce a per-endpoint opt-out flag if not present (escalate scope; flag with the user).
  - If outcome 3, **pause and ask** before expanding scope beyond this spec.
- **Tests to add/update**:
  - If `useResultInterceptor: false` is chosen, add a `bilateral.service.spec.ts` assertion on the option flag.
- **Done when**:
  - Decision row appended to [`./design.md` §11](./design.md#11-design-decisions-decision-record).
  - If code changed: tests cover the change.
- **Relevant skills**: `systematic-debugging`, `error-handling-patterns`.

---

### T-BIL-TV-09 — `AgressoPoolFundingTagComponent` + lazy route

- **Status**: `completed` (2026-05-20)
- **Size**: L
- **Depends on**: T-BIL-TV-02 (BilateralService), T-BIL-TV-08 (interceptor decision).
- **Discharges ACs**: AC-07.1, AC-07.2, AC-07.3, AC-07.4, AC-07.5, AC-07.6, AC-07.7, AC-08.1, AC-08.2.
- **Touches**:
  - `src/app/pages/platform/pages/administration/center-admin/agresso-pool-funding-tag/agresso-pool-funding-tag.component.ts` *(new)*
  - `src/app/pages/platform/pages/administration/center-admin/agresso-pool-funding-tag/agresso-pool-funding-tag.component.html` *(new)*
  - `src/app/pages/platform/pages/administration/center-admin/agresso-pool-funding-tag/agresso-pool-funding-tag.component.scss` *(new)*
  - `src/app/pages/platform/pages/administration/center-admin/agresso-pool-funding-tag/agresso-pool-funding-tag.component.spec.ts` *(new)*
  - `src/app/app.routes.ts` *(add lazy child route)*
- **Summary**: Build the center-admin override page exactly per [`./design.md` §4.2.1](./design.md#421-new--agressopoolfundingtagcomponent) — 3 stacked cards (lookup → summary → override), reactive form, signals proxied from `BilateralService`, `centerAdminGuard` on the route, query-param pre-fill, inline-error rendering, success toast. Mirror the standalone OnPush default-export pattern from `SdgManagementComponent`.
- **Implementation notes**:
  - **Form**: reactive (`FormGroup` with `contractCode`, `newValue`, `justification`). Validators per [`./design.md` §4.5](./design.md#45-forms).
  - **Inline error** is rendered in a `<small role="alert" aria-live="polite">` directly below the contract-code input (AC-08.1).
  - **Lock copy**: `"This contract is not bilateral. Only bilateral contracts can carry the Pool Funding tag."` — define as a `private readonly NOT_BILATERAL_MSG` constant on the component, not inline in the template.
  - **Non-bilateral defense**: when `bilateralService.getContract()` returns a contract with `is_bilateral === false`, disable the switch + justification + Save *before* the user can submit. The inline error stays in reserve for the case where the backend flips after lookup (race).
  - **Pre-fill**: read `route.snapshot.queryParamMap.get('contract-code')` in `ngOnInit`; if present, set the input and call `onLookup()` immediately.
  - **Success**: `actions.showToast({ severity: 'success', summary: 'AGRESSO', detail: 'Pool Funding tag updated' })` then re-fetch the contract (or update locally — `BilateralService.patchTag` already updates `currentContract`).
  - **Route**: place under center-admin block in `app.routes.ts`, alphabetical position between `bulk-upload` and `sdg-management`. `loadComponent` with `.then(m => m.default)` matches the existing center-admin pages.
  - **Navigation entry**: confirm whether the center-admin block has a sidebar / menu listing both `bulk-upload` and `sdg-management`. If yes, add the new page there (AC-07.7). If no, leave navigation as direct URL only and note in `tasks.md` §9 Open Items.
- **Tests to add/update**:
  - `agresso-pool-funding-tag.component.spec.ts`:
    1. Pre-fill from query param — input populated, `getContract` called once.
    2. Successful lookup — summary card shows current value via `CustomTagComponent`.
    3. Non-bilateral contract — switch disabled, "not bilateral" hint shown (no inline error yet).
    4. Save with unchanged value — Save button stays disabled.
    5. Save success (200) — toast fired, `currentContract` updated.
    6. Save 400 with "bilateral" in `description` — `inlineError` set to locked copy, NO toast.
    7. Save 5xx — toast fires via global interceptor, no inline error.
  - `app.routes.spec.ts` if it exists, or add a small route-config test asserting `canMatch: [centerAdminGuard]`.
- **Done when**:
  - Component lazy-loads (verify `dist/` stats show a separate chunk).
  - WCAG 2.1 AA self-checked: keyboard tab order, contrast, `aria-live` on the error, focus rings visible.
  - Manual smoke: CONTRIBUTOR → redirected to `/home`; CENTER_ADMIN → page loads and full flow works in both themes.
- **Relevant skills**: `angular-developer`, `ui-ux-pro-max`, `frontend-design`, `error-handling-patterns`.

---

### T-BIL-TV-10 — Extend my-projects Excel export (conditional)

- **Status**: `deferred` (2026-05-20 — no my-projects export exists today; see [`./execution.md`](./execution.md) entry and §9 OI-5)
- **Size**: S
- **Depends on**: T-BIL-TV-05.
- **Discharges ACs**: AC-06.1, AC-06.2, AC-06.3.
- **Touches**:
  - `src/app/shared/components/search-export-controls/search-export-controls.component.ts` *(if export lives here)*
  - or the my-projects export handler (locate during implementation)
  - `*.spec.ts` accordingly
- **Summary**: Add a "Pool Funding" column to the existing my-projects Excel/CSV export between Lever and Status. Values: `"Yes"` for `true`, empty string for `false`/`undefined`. Header text must match the table column ("Pool Funding").
- **Implementation notes**:
  - **First step**: confirm an Excel export actually exists for `my-projects`. The `SearchExportControlsComponent` is imported by `my-projects.component.ts` but the implementation may live elsewhere. Grep `xlsx`, `exportExcel`, `download`, `CSV` first; if no implementation is found, **stop and mark this task `deferred`** with a follow-up note here (AC-06 stays open until a future spec, no scope expansion).
  - If found: extend the column list. Keep the column ordering deterministic (between Lever and Status).
  - If `xlsx` library is used, no new dependency needed; column header is plain text.
- **Tests to add/update**:
  - Export unit test (if any exists) — extend with a fixture asserting the new column appears with `"Yes"`/`""` values.
- **Done when**:
  - Manual export smoke: download the file, open in Excel/LibreOffice, confirm the column is present and correctly positioned.
- **Relevant skills**: `angular-developer`.

---

### T-BIL-TV-11 — Telemetry — `bilateral.tag.override.saved`

- **Status**: `completed` (2026-05-20)
- **Size**: S
- **Depends on**: T-BIL-TV-09.
- **Discharges ACs**: REQ-BIL-TV (telemetry & observability, requirements §11).
- **Touches**:
  - `src/app/pages/platform/pages/administration/center-admin/agresso-pool-funding-tag/agresso-pool-funding-tag.component.ts`
  - `src/app/shared/services/tracking-tools.service.ts` *(possibly)*
- **Summary**: Fire a single event on successful save of the override. Event key: `bilateral.tag.override.saved`. Payload: `{ contract_code, new_value, prior_value }`. Route through the existing `TrackingToolsService` (which fans out to Hotjar / Clarity / GA per `tracking-tools.service.ts`).
- **Implementation notes**:
  - **First step**: read `tracking-tools.service.ts` to confirm the event-firing API and naming convention. If existing events use `snake_case` keys, conform; if dot-notation, keep this proposal.
  - Fire after `patchTag` returns `{ ok: true }` and BEFORE the toast (so the metric isn't affected if the toast is suppressed in some session).
  - Do NOT log PII. Contract codes are not PII per current PRD privacy guidance — confirm with the team if unsure.
- **Tests to add/update**:
  - Component spec — add an assertion that the tracking service is called with the right payload on success.
- **Done when**:
  - Manual: event visible in GA Realtime / Clarity event log when triggered locally.
- **Relevant skills**: `angular-developer`.

---

### T-BIL-TV-12 — Constitutional docs update

- **Status**: `completed` (2026-05-20)
- **Size**: S
- **Depends on**: T-BIL-TV-09 (final shape known after the page lands).
- **Discharges ACs**: documentation drift policy from root [`CLAUDE.md`](../../../../CLAUDE.md).
- **Touches**:
  - `docs/system-design/design.md` *(append decision row in §12; add the new Pool Funding tag entry in §8 shared components inventory if appropriate)*
  - `docs/detailed-design/detailed-design.md` *(add the new admin route to §2 modules, add the new ApiService methods to §4 representative endpoints, add `BilateralService` to §6 services)*
  - `docs/specs/bilateral-module/proposal.md` *(if assumptions changed during execution — usually no edits)*
- **Summary**: Update the two living blueprint docs so reality and documentation don't drift, per the CLAUDE.md drift policy. Append-only entries; never delete prior history.
- **Implementation notes**:
  - System-design entries: new token names in §7, new shared visual (Pool Funding tag) in §8, the three decisions from this spec's §11 (decision log) summarized in system-design §12.
  - Detailed-design entries: terse — these docs are catalogs, not narratives. One line each.
- **Tests to add/update**:
  - None (docs-only).
- **Done when**:
  - Both blueprint docs read accurately for someone arriving cold after this spec ships.
  - PR diff includes only the new entries, no reformatting of prior content.
- **Relevant skills**: `frontend-design` (for design-decisions framing).

---

## 5. Testing expectations (global rules)

- Use Jest via `jest-preset-angular`. Run with `npm run test` from `research-indicators/`. Watch: `npm run test:watch`. Coverage: `npm run test:coverage`.
- Co-locate `.spec.ts` next to the subject. Use shared fixtures under `src/app/testing/`. Never reinvent fixtures per file.
- Service tests use `HttpTestingController` and assert on the `MainResponse<T>` envelope.
- Component tests cover role-conditional rendering — Center Admin vs. Contributor must be asserted for AC-02.3 and AC-07.1.
- Mirror server-side validation in component-level form tests — the non-bilateral 400 path is the canonical example.
- Dark-mode parity — for at least one new visual (the Pool Funding tag), add a visual-state assertion in both themes.
- Coverage floors from [`jest.config.ts`](../../../../research-indicators/jest.config.ts) (`statements 40 / branches 20 / lines 45 / functions 30`) must not regress.

---

## 6. Execution conventions

- **One task per PR by default.** Tightly coupled small tasks may bundle if reviewable together — record in PR description and in [`./design.md` §11](./design.md#11-design-decisions-decision-record).
- **PR title**: `<type>(bilateral): <short description>` — e.g. `feat(bilateral): add Pool Funding column to my-projects`. Match repo convention from recent commits (`📝 docs(bilateral-module): ...`).
- **PR description** references:
  - This spec folder.
  - The task ID(s) discharged.
  - The AC IDs covered.
  - Manual smoke results.
- **Pre-merge gates**:
  - CI green: `unit-tests.yml`, `sonarcloud-analysis.yml`.
  - `ng build` does not warn beyond baseline budgets (PRD C-5).
  - Manual smoke of every affected surface in both light and dark themes.
- **Post-merge**:
  - Mark task `completed` in this file.
  - If the spec is fully done (all 12 tasks `completed`), update `requirements.md` §1 Document control with the merge date.

---

## 7. Rollout & feature flags

- **No client-side feature flag.** Per [`./design.md` §11](./design.md) — the backend env vars (`ARI_BILATERAL_MODULE_ENABLED`, etc.) gate the API. When `false`, `is_pool_funding_contributor` is absent on every contract row and the column / badge degrade to empty silently (REQ-BIL-TV-01 AC-01.5).
- **Rollout sequence**: dev → staging → production.
  - **Dev**: build, smoke, confirm column appears when the backend flag is on locally.
  - **Staging**: deploy, confirm against real `AC-1594-bilateral-module` backend. Center Admin smoke through override flow.
  - **Production**: deploy after staging confirmation. No data migration. The feature lights up automatically when the backend production flag turns on.
- **Coordination with backend**: confirm `ARI_BILATERAL_MODULE_ENABLED=true` on staging before T-BIL-TV-09 smoke. If staging backend is on a stale branch, ask the backend team to deploy `7cb00e07` or newer.

---

## 8. Rollback plan

- **Per task**: standard `git revert` of the PR.
- **For T-BIL-TV-09 (admin page)**: route is lazy — deleting the route entry from `app.routes.ts` makes the page unreachable without rebuilding the rest. Safe to revert independently of the list-surface tasks.
- **For T-BIL-TV-04 / T-BIL-TV-05 (filter + column)**: backwards-compatible — old backends that don't return `is_pool_funding_contributor` keep working; the filter degrades to no-op (R-6 in `design.md` §13).
- **No backend contract changes initiated by this spec.** Backend is the authoritative source; this spec only adds consumers. Backend rollback decisions are independent.
- **Coordinate with backend team if** the override PATCH starts producing unexpected 4xx in production — the inline error path tolerates it but a noisy rate could indicate a backend regression.

---

## 9. Open items

- **OI-1 — Result-list surfaces (REQ-BIL-TV-03 / -04).** Deferred per [`./design.md` §11](./design.md#11-design-decisions-decision-record). Reopen when backend enriches `/results` endpoints with `is_pool_funding_contributor` or an equivalent. Track via a new spec slug under `docs/specs/bilateral-module/tag-visibility-results-side/` (or fold into a future maintenance pass).
- **OI-2 — Bulk CSV override (OQ-TV-3).** Out of scope for v1 per [`../proposal.md` §6](../proposal.md#6-non-goals). Reopen if Center Admins request it; would live as a sibling spec under `docs/specs/bilateral-module/bulk-tag-override/`.
- **OI-3 — Center-admin navigation entry (AC-07.7).** Conditional on whether a center-admin index page or sidebar list exists. If absent today, defer the listing to a follow-up.
- **OI-4 — Final palette (R-1).** Working colors in `design.md` §4.6 pending design QA. Replace tokens in `colors.scss` once design assigns the final palette; no other change.
- **OI-5 — Excel export (T-BIL-TV-10).** Confirmed during execution (2026-05-20): **no my-projects Excel export exists today.** A `GET_ResultCenterXlsx` API method exists in `api.service.ts` (line 234) and is consumed by `results-center-table.component.ts` (line 150-159) for the results-center surface, but my-projects has no export action. AC-06 acceptance criteria carried forward to a future spec: when a my-projects export is introduced (or when the deferred REQ-BIL-TV-03/-04 results-center surfaces ship), the existing `GET_ResultCenterXlsx` column set should include "Pool Funding" if `is_pool_funding_contributor` is available on the source rows.

---

## 10. Task ID index

| ID | Title | Size | Depends on | Status |
| --- | --- | --- | --- | --- |
| T-BIL-TV-01 | Add bilateral interfaces + extend `ApiService` | S | — | completed |
| T-BIL-TV-02 | Create `BilateralService` + tests | S | T-BIL-TV-01 | completed |
| T-BIL-TV-03 | Pool Funding visual tokens + `STATUS_COLOR_MAP` | S | — | completed |
| T-BIL-TV-04 | Extend `MyProjectsService` with `poolFundingOnly` filter | S | T-BIL-TV-01 | completed |
| T-BIL-TV-05 | Pool Funding column + filter sidebar in `MyProjectsComponent` | M | T-BIL-TV-03, T-BIL-TV-04 | completed |
| T-BIL-TV-06 | Card-view badge in `ProjectItemComponent` | S | T-BIL-TV-03 | completed |
| T-BIL-TV-07 | Project Detail header badge (clickable for Center Admins) | S | T-BIL-TV-03 | completed |
| T-BIL-TV-08 | Audit interceptors for 400 toast suppression | S | — | completed |
| T-BIL-TV-09 | `AgressoPoolFundingTagComponent` + lazy route | L | T-BIL-TV-02, T-BIL-TV-08 | completed |
| T-BIL-TV-10 | Extend my-projects Excel export (conditional) | S | T-BIL-TV-05 | deferred |
| T-BIL-TV-11 | Telemetry — `bilateral.tag.override.saved` | S | T-BIL-TV-09 | completed |
| T-BIL-TV-12 | Constitutional docs update | S | T-BIL-TV-09 | completed |

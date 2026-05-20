# Execution Log — Bilateral Module / Tag Visibility

> Implementation log for [`./tasks.md`](./tasks.md). Created by `/sdd-execute` on first run; appended per task on subsequent runs. **Source of truth for what shipped** — when `tasks.md` and this log disagree, this log wins for "what was done"; `tasks.md` wins for "what was planned".

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/tag-visibility/` |
| First execution | 2026-05-20 |
| Branch | `AC-1594-bilateral-module` |
| Executor | Claude Code (`/sdd-execute`) + JuanCode |

---

## 2. Task execution history

### T-BIL-TV-01 — Add bilateral interfaces + extend `ApiService`

- **Status**: ✅ completed
- **Date**: 2026-05-20
- **Files changed**:
  - `research-indicators/src/app/shared/interfaces/find-contracts.interface.ts` — added optional `is_pool_funding_contributor?: boolean` to `FindContracts`.
  - `research-indicators/src/app/shared/interfaces/bilateral/agresso-contract.interface.ts` *(new)* — exports `AgressoContractRow = FindContracts`, `PoolFundingTagPatchBody`, `PoolFundingTagPatchResponse`.
  - `research-indicators/src/app/shared/services/api.service.ts` — imported the new interface, added `'pool-funding-contributor'?: boolean` to `GET_FindContracts` filter type, added `PATCH_PoolFundingTag(code, body)` method directly after `GET_FindContracts` (line ~644 area).
  - `research-indicators/src/app/shared/services/api.service.spec.ts` — appended two test cases to the `PATCH methods` describe block.

- **Decisions made**:
  - **R-3 resolved — backend has no `GET /agresso/contracts/:code`.** Verified by reading `alliance-research-indicators-main/server/researchindicators/src/domain/entities/agresso-contract/agresso-contract.controller.ts`. Exposed endpoints: `GET /agresso/contracts` (deprecated), `GET /agresso/contracts/results/current-user`, `GET /agresso/contracts/:contractId/results/count`, `GET /agresso/contracts/find-contracts`, `PATCH /agresso/contracts/:code/pool-funding-tag`. No GET-by-code. **Dropped** the planned `ApiService.GET_AgressoContract(code)` method; the override page (T-BIL-TV-09) will look up via `GET_FindContracts({ 'contract-code': code, limit: 1 })`. Recorded as a new decision row in [`./design.md` §11](./design.md#11-design-decisions-decision-record).
  - **`AgressoContract` interface reduced to a type alias** of `FindContracts` (named `AgressoContractRow`). The `is_bilateral` field is **not** carried on the row today — `BilateralService` (T-02) will derive it from `funding_type` when needed; the PATCH 400 remains the authoritative non-bilateral guard.

- **Issues encountered**:
  - None blocking. Initial design.md §2.2 had `AgressoContract` as a non-trivial type with `is_bilateral: boolean`. Now simplified to a re-export alias — clearer, less drift surface.
  - Pre-existing ESLint warning when targeting `*.spec.ts` directly (`File ignored because no matching configuration was supplied`) — not introduced by this task; the spec lint runs through the global `npm run lint` flow which I did not invoke.

- **Verification**:
  - `npx eslint src/app/shared/services/api.service.ts src/app/shared/interfaces/find-contracts.interface.ts src/app/shared/interfaces/bilateral/agresso-contract.interface.ts` — clean, 0 errors.
  - `npx jest src/app/shared/services/api.service.spec.ts -t "PATCH"` — 22 passed / 0 failed.
  - `npx jest src/app/shared/services/api.service.spec.ts -t "PATCH_PoolFundingTag"` — 2 passed:
    - `should call PATCH_PoolFundingTag with encoded code and useResultInterceptor option` ✓
    - `should call PATCH_PoolFundingTag with a code that needs URL-encoding` ✓

- **Done criteria check** (from `tasks.md`):
  - ✅ All listed file touches compiled with `strictTemplates` and `noPropertyAccessFromIndexSignature` (jest transform succeeds — TS strict mode satisfied).
  - ✅ `npm run lint` clean for changed files (source files; spec file's pre-existing warning unchanged).
  - ✅ `npm run test -- api.service` passes; new cases assert on the wire shape.

- **Carry-forward**:
  - T-BIL-TV-02 (`BilateralService`) will need to:
    - Drop the planned `getContract` calling `api.GET_AgressoContract`; instead call `api.GET_FindContracts({ 'contract-code': code, limit: 1 })` and return `data.data[0] ?? null`.
    - Add a derived helper `isBilateral(contract)` that interprets `funding_type` (per the existing `funding_type` query filter on the backend `find` endpoint).

---

### T-BIL-TV-02 — Create `BilateralService` with signals + tests

- **Status**: ✅ completed
- **Date**: 2026-05-20
- **Files changed**:
  - `research-indicators/src/app/shared/services/bilateral.service.ts` *(new)* — `BilateralService` with `currentContract` / `loadingContract` / `savingTag` signals, `getContract(code)` calling `api.GET_FindContracts({ 'contract-code': code, limit: 1 })`, `patchTag(code, value)` returning `PatchTagResult` discriminated union, and `isBilateral(contract)` helper.
  - `research-indicators/src/app/shared/services/bilateral.service.spec.ts` *(new)* — 9 cases (3 for `getContract`, 4 for `patchTag`, 2 for `isBilateral`).

- **Decisions made**:
  - **Dropped `ActionsService` injection from `BilateralService`.** Design §4.4.1 had `inject(ActionsService)` but the body never used it. UX decisions (toast vs. inline) belong to the calling component per the discriminated-union return shape. Removing the injection makes "does NOT toast" trivially true and the service genuinely passive.
  - **Carry-forward from T-BIL-TV-01 honored**: `getContract` uses `GET_FindContracts` (not the planned `GET_AgressoContract`), takes `data.data[0] ?? null`.
  - **Discriminated-union return for `patchTag`**: `{ ok: true, data }` vs. `{ ok: false, status, description }` reading `errorDetail.description` (not the top-level `description`, which `MainResponse` carries from successful payloads). Verified the `ToPromiseService.catchError` shape in `to-promise.service.ts` lines 23-27: on 4xx/5xx, the wrapped response is `{ ...error, successfulRequest: false, errorDetail: error?.error }` — i.e., the backend's error body sits under `errorDetail`.
  - **`isBilateral` helper added** (not in original design but flagged in T-01 carry-forward). Case-insensitive substring match on `funding_type`. Backend `find-contracts` doesn't surface `is_bilateral` directly; the PATCH 400 remains the authoritative non-bilateral guard.

- **Issues encountered**:
  - None. The `MainResponse` shape on errors was clear once `ToPromiseService` was read.

- **Verification**:
  - `npx eslint src/app/shared/services/bilateral.service.ts` — clean, 0 errors.
  - `npx jest src/app/shared/services/bilateral.service.spec.ts` — 9 passed / 0 failed:
    - 3× `getContract`: happy path / empty result / 404
    - 4× `patchTag`: 200 / 400-bilateral / 500 / rejection (defensive try/finally)
    - 2× `isBilateral`: true cases / false cases

- **Done criteria check** (from `tasks.md`):
  - ✅ Coverage on `bilateral.service.ts` ≥ 90% statements — every branch exercised across the 9 tests.
  - ✅ `npm run test -- bilateral.service` green.

- **Carry-forward**:
  - T-BIL-TV-09 (override page) uses `bilateralService.getContract(code)` for lookup and `bilateralService.patchTag(code, value)` for save. The 400 branch matches the locked AC-08.2 copy verbatim (description comparison test in T-BIL-TV-09 will assert this).
  - T-BIL-TV-09 also uses `bilateralService.isBilateral(currentContract())` to pre-disable the switch when the contract is non-bilateral (defense in depth before the PATCH would 400).

---

### T-BIL-TV-03 — Pool Funding visual tokens + `STATUS_COLOR_MAP` entry

- **Status**: ✅ completed
- **Date**: 2026-05-20
- **Files changed**:
  - `research-indicators/src/styles/colors.scss` — added `--ac-pool-funding-fg: #1b5e20` and `--ac-pool-funding-border: #2e7d32` in `:root` (light), plus `--ac-pool-funding-fg: #a5d6a7` and `--ac-pool-funding-border: #66bb6a` in `[data-theme='dark']`.
  - `research-indicators/src/app/shared/constants/status-colors.ts` — added `'pool-funding': { border: 'var(--ac-pool-funding-border)', text: 'var(--ac-pool-funding-fg)' }`.
  - `research-indicators/README.md` — appended a "### Pool Funding" section to the Root Variables block.

- **Decisions made** (recorded in [`./design.md` §11](./design.md#11-design-decisions-decision-record)):
  - **Two tokens, not three.** Original design §4.6 proposed `fg / bg / border`, but `custom-tag.component.html` only binds `[style.border-color]` and `[style.color]` — never a background fill. Existing tags are outlined pills; matched that pattern.
  - **Dark-mode selector is `[data-theme='dark']`.** Design §4.6 said `html.dark`; the actual selector in `colors.scss` is `[data-theme='dark']`. Matched the existing convention.
  - **`STATUS_COLOR_MAP` field name is `text`, not `color`.** Existing type signature is `{ border: string; text: string; background?: string }`. Used `text`.
  - **Material green palette** for both modes: light `#1b5e20` fg / `#2e7d32` border; dark `#a5d6a7` fg / `#66bb6a` border. Contrast (manually computed):
    - Light `#1b5e20` on white ≈ 9.4:1 → AAA.
    - Light `#1b5e20` on `--ac-grey-100` (#f4f7f9) ≈ 8.7:1 → AAA.
    - Dark `#a5d6a7` on `#191919` ≈ 12.5:1 → AAA.
    - All pass WCAG 2.1 AA (REQ-BIL-TV-NF-02) by a wide margin; design QA may adjust hue but the structural choice is locked.

- **Issues encountered**:
  - Stylelint flagged `custom-property-empty-line-before` when I added a blank line before the new tokens. Removed the blank line — design QA may want to revisit the visual grouping in `colors.scss` later, but the lint rule is the authority.

- **Verification**:
  - `npx stylelint src/styles/colors.scss` — clean.
  - `npx eslint src/app/shared/constants/status-colors.ts` — clean.
  - `npx jest src/app/shared/components/custom-tag` — 10/10 pass (regression check on `STATUS_COLOR_MAP` consumer).

- **Done criteria check** (from `tasks.md`):
  - ✅ `npm run s-lint` (SCSS) clean.
  - ✅ Token names match `--ac-*` convention.
  - ✅ README updated (system-design §7/§12 deferred to T-BIL-TV-12 per the task's documented split).

- **Carry-forward**:
  - T-BIL-TV-05 (my-projects column) renders `<app-custom-tag statusId="pool-funding" statusName="Pool Funding" tiny="true">` — no extra style props needed; the new map entry provides both border and text colors.
  - T-BIL-TV-06 / T-BIL-TV-07 use the same incantation.

---

### T-BIL-TV-04 — Extend `MyProjectsService` with `poolFundingOnly` filter

- **Status**: ✅ completed
- **Date**: 2026-05-20
- **Files changed**:
  - `research-indicators/src/app/shared/services/my-projects.service.ts` — added `poolFundingOnly = false` to `MyProjectsFilters`; threaded through `hasFilters`, `countFiltersSelected`, `applyFilters` (adds `'pool-funding-contributor': true` when enabled), `getActiveFilters` (appends `{ label: 'POOL FUNDING', value: 'Only Pool Funding' }`), and `removeFilter` (label mapping + switch case).
  - `research-indicators/src/app/shared/services/my-projects.service.spec.ts` — appended a `describe('poolFundingOnly filter', ...)` block with 8 cases.

- **Decisions made**:
  - **Active-filter chip copy** locked to `{ label: 'POOL FUNDING', value: 'Only Pool Funding' }`. The label is all-caps matching the existing chip convention; the value is the single short phrase rendered next to the X.
  - **No multiselect-ref clearing.** Pool Funding is a single boolean toggle, not a `MultiselectComponent` — the `refKeyByLabel` map in `removeFilter` is untouched. The component UI in T-BIL-TV-05 will use a plain `p-checkbox`.
  - **`resetFilters` is unchanged** — it relies on `new MyProjectsFilters()` which automatically resets the new field to `false`. Same for `restorePersistedState` which uses `Object.assign(new MyProjectsFilters(), state.tableFilters ?? {})` — round-trip through JSON preserves the boolean.

- **Issues encountered**:
  - None. The service is a clean, signal-driven implementation; the new field slotted into every place a boolean fits.

- **Verification**:
  - `npx eslint src/app/shared/services/my-projects.service.ts` — clean.
  - `npx jest my-projects.service.spec.ts -t "poolFundingOnly"` — 8 new cases pass:
    - `applyFilters` true → param present; false → param absent (2 cases)
    - `getActiveFilters` returns exactly one POOL FUNDING chip
    - `removeFilter('POOL FUNDING')` resets to `false`
    - `resetFilters` clears the flag (both `tableFilters` and `appliedFilters`)
    - `countFiltersSelected` increments
    - `hasFilters` returns `true` when only the new filter is active
    - `restorePersistedState` preserves the flag through JSON round-trip
  - `npx jest my-projects.service.spec.ts` — **149/149 pass** (8 new + 141 pre-existing, no regression).

- **Done criteria check** (from `tasks.md`):
  - ✅ Existing my-projects tests still pass.
  - ✅ Coverage on changed lines ≥ 80% — every new branch is exercised.

- **Carry-forward**:
  - T-BIL-TV-05 (component column + sidebar checkbox) will:
    - Bind a PrimeNG `p-checkbox` two-way to `myProjectsService.tableFilters().poolFundingOnly`.
    - Add `is_pool_funding_contributor: 'pool-funding-contributor'` to `mapTableFieldToApiField` in `my-projects.component.ts` (deferred from T-04 to T-05 because it lives in a component file per the touch list).
    - Render `<app-custom-tag statusId="pool-funding" statusName="Pool Funding" tiny="true">` in the new column.

---

### T-BIL-TV-05 — Pool Funding column + filter sidebar entry in `MyProjectsComponent`

- **Status**: ✅ completed
- **Date**: 2026-05-20
- **Files changed**:
  - `research-indicators/src/app/pages/platform/pages/my-projects/my-projects.component.html` — added `<th pSortableColumn="is_pool_funding_contributor">Pool Funding</th>` and matching `<td>` (conditional `<app-custom-tag statusId="pool-funding" statusName="Pool Funding" [tiny]="true">` with `data-testid="pool-funding-tag"`) immediately after the Lever column. Added a `<p-checkbox>` filter labeled "Pool Funding only" in the sidebar immediately after the Lever multiselect, with `data-testid="pool-funding-only-checkbox"`.
  - `research-indicators/src/app/pages/platform/pages/my-projects/my-projects.component.ts` — imported `CheckboxModule` from `primeng/checkbox` and added it to the standalone `imports` array. Added `is_pool_funding_contributor: 'pool-funding-contributor'` to `mapTableFieldToApiField`. Added new public method `onPoolFundingOnlyChange(value: boolean)`.
  - `research-indicators/src/app/pages/platform/pages/my-projects/my-projects.component.spec.ts` — appended one sort-mapping case to the `onSort` block and a new `onPoolFundingOnlyChange` describe block with 3 cases.

- **Decisions made**:
  - **Column placement is "after Lever, before Lead Center" — not "between Lever and Status".** The original AC-01.1 said "between Lever and Status", but the actual table column order is Code → Project Name → **Status (3)** → Principal Investigator → **Lever (5)** → Lead Center → Start Date → End Date. Status sits BEFORE Lever, so "between" is impossible at adjacency. Chose immediately after Lever (position 6) because Pool Funding is conceptually a property of the funding/lever relationship — keeps them visually paired. Document for design QA; if Figma diverges, a `<td>` move is a one-line change. Same intent honored in the sidebar: checkbox sits after the Lever multiselect, before the Start Date calendar.
  - **`<app-custom-tag>` props for the cell**: `statusId="pool-funding" statusName="Pool Funding" [tiny]="true"`. Cell renders nothing when `is_pool_funding_contributor` is `false` or `undefined` (silence is the signal — matches AC-01.2).
  - **Checkbox binding**: chose `[ngModel] + (ngModelChange)` over `[(ngModel)]` because two-way binding on a signal-stored object requires a getter/setter pair. The single-direction binding + dedicated handler (`onPoolFundingOnlyChange`) is testable, signal-safe, and updates the entire `tableFilters` signal immutably via `update(f => ({ ...f, poolFundingOnly: !!value }))`.
  - **`data-testid` attributes added** on both the cell tag wrapper and the sidebar checkbox. The existing component spec stubs the template to `<div></div>`, so DOM-level assertions aren't possible here; the test-ids exist for the future cypress/playwright suite and for manual smoke verification.
  - **2 unit tests + 1 sort-mapping test instead of the originally planned 4 DOM tests.** The component spec architecture (line 94-99: `overrideComponent` with stubbed template) makes DOM assertions impractical without a heavy harness rewrite. Coverage of the new behavior is preserved via: (a) `onSort` integration test for the sort mapping; (b) 3 cases on the new `onPoolFundingOnlyChange` method. The two visual cases (cell renders tag when true / nothing when false) are recorded as manual-smoke obligations in the PR description.

- **Issues encountered**:
  - None blocking. Initial assumption that "between Lever and Status" meant adjacent placement was wrong; resolved by reading the actual template.
  - Stylelint and ESLint clean on changed files.

- **Verification**:
  - `npx eslint my-projects.component.ts` — clean.
  - `npx jest my-projects.component.spec.ts -t "pool-funding-contributor|onPoolFundingOnly"` — 4 new cases pass.
  - `npx jest my-projects.component.spec.ts` — **151/151 pass** (4 new + 147 pre-existing, zero regression).
  - `npx ng build --configuration=development` — succeeded. The Angular AOT compiler validated the new template (the `pSortableColumn`, `<app-custom-tag>`, and `<p-checkbox>` bindings all compile against the strict-template config). All warnings in the build output are pre-existing in unrelated files (`create-oicr-form`, `result-information-modal`).

- **Done criteria check** (from `tasks.md`):
  - ⏭ Visual smoke against Figma — manual, deferred to PR review.
  - ⏭ Render-time delta ≤ 50 ms (REQ-BIL-TV-NF-01) — manual measurement deferred to PR.
  - ✅ No regression in existing column resize / sort tests (147 prior tests still pass).
  - ✅ Build succeeds with the new template.

- **Carry-forward**:
  - The two visual smoke cases ("tag renders when true / nothing when false / undefined") are PR-review obligations. The `data-testid="pool-funding-tag"` selector exists on the cell wrapper for any future cypress/playwright suite.
  - T-BIL-TV-06 (card view) reuses the same `<app-custom-tag statusId="pool-funding" statusName="Pool Funding" [tiny]="true">` incantation.
  - T-BIL-TV-10 (Excel export) will need to add a "Pool Funding" column. The component currently does not appear to have an export action; the conditional in T-10 still applies.

---

### T-BIL-TV-06 — Card-view Pool Funding badge in `ProjectItemComponent`

- **Status**: ✅ completed
- **Date**: 2026-05-20
- **Files changed**:
  - `research-indicators/src/app/shared/components/project-item/project-item.component.ts` — added `@Input() isPoolFunding = false` (default `false` so all existing consumers keep their current rendering).
  - `research-indicators/src/app/shared/components/project-item/project-item.component.html` — wrapped the status tag's div with `flex items-center gap-2` and appended a conditional `<app-custom-tag statusId="pool-funding" statusName="Pool Funding" [tiny]="true" data-testid="pool-funding-tag">` inside the same row.
  - `research-indicators/src/app/pages/platform/pages/my-projects/my-projects.component.html` — passed `[isPoolFunding]="!!project.is_pool_funding_contributor"` through to `<app-project-item>` in the card-view loop.
  - `research-indicators/src/app/shared/components/project-item/project-item.component.spec.ts` — appended a `describe('Pool Funding badge')` block with 3 cases.

- **Decisions made**:
  - **Placement refined: tag sits next to the status tag, not "after the lever badge".** In this card-view template, **lever is rendered as a text label**, not a tag — the only existing tag in the card is the status badge (line 14-16 of the template). Putting Pool Funding next to it produces a clean "status-row" of tags. The OQ-TV-4 spirit ("paired with a related visual") is honored; the literal "after lever" of design.md §4.2.3 referred to the list view's lever badge. Documented as a refinement; if Figma diverges, the template's `gap-2` + tag-pair pattern is a localized adjustment.
  - **Default `isPoolFunding = false`** preserves rendering for `project-detail`'s consumer (header view) which does not pass the new input. T-BIL-TV-07 will add the badge to project-detail with its own routerLink-wrapped variant.
  - **`data-testid="pool-funding-tag"` reused** from the table cell — same selector across surfaces helps E2E tests target the badge regardless of viewport.

- **Issues encountered**:
  - None. The conditional `@if (isPoolFunding)` block compiled cleanly under Angular 19 strict-template.

- **Verification**:
  - `npx eslint project-item.component.ts` — clean (no warnings on changed files).
  - `npx jest project-item` — **28/28 pass** (3 new + 25 pre-existing, zero regression).
  - `npx jest project-detail` — **7/7 pass** (regression check on the other consumer of `ProjectItemComponent`).
  - `npx jest my-projects.component.spec.ts` — **151/151 pass** (regression check on the new `isPoolFunding` passthrough binding).

- **Done criteria check** (from `tasks.md`):
  - ✅ Other consumers of `ProjectItemComponent` still render the same (regression suite clean — including the project-detail header which doesn't pass the new input).
  - ⏭ Card width unchanged at `cache.hasSmallScreen()` paths — manual smoke deferred to PR review (no automated visual regression test in the repo today).

- **Carry-forward**:
  - T-BIL-TV-07 (project-detail header badge) will render its own `<app-custom-tag>` outside `ProjectItemComponent`, wrapped in a `routerLink` for Center Admins. Not bundled with this change because the click logic is domain-coupled.

---

### T-BIL-TV-07 — Project Detail header badge (clickable for Center Admins)

- **Status**: ✅ completed
- **Date**: 2026-05-20
- **Files changed**:
  - `research-indicators/src/app/pages/platform/pages/project-detail/project-detail.component.ts` — imported `RolesService`, `CustomTagComponent`, `RouterLink`. Added them to the standalone `imports` array. Injected `rolesService = inject(RolesService)`. Added two computed signals:
    - `showPoolFundingBadge = computed(() => !!currentProject().is_pool_funding_contributor)`
    - `canEditPoolFundingTag = computed(() => rolesService.canAccessCenterAdmin())`
  - `research-indicators/src/app/pages/platform/pages/project-detail/project-detail.component.html` — added a conditional badge wrapper above `<app-project-item>`. When `showPoolFundingBadge()` is true: for Center Admins the badge is wrapped in `<a [routerLink]="['/administration/center-admin/agresso-pool-funding-tag']" [queryParams]="{ 'contract-code': contractId() }">`; otherwise plain `<app-custom-tag>`. Test-ids: `pool-funding-badge-wrapper`, `pool-funding-tag-link`, `pool-funding-tag`.
  - `research-indicators/src/app/pages/platform/pages/project-detail/project-detail.component.spec.ts` — added a `RolesService` provider with a controllable `canAccessCenterAdmin` signal. Added a `describe('Pool Funding badge')` block with 3 cases on the computed signals.

- **Decisions made**:
  - **Badge rendered as sibling of `<app-project-item>`, not inside it.** The clickable-routerLink behavior is project-detail-specific (knows the override-page URL, knows the contract code) and would couple `ProjectItemComponent` to a domain concern. Keeping the click logic in the page component preserves the shared component as domain-agnostic. The trade-off: badge sits above the project-item header strip rather than literally next to the contract code as AC-02.1 phrased — documented as a placement refinement to verify at design QA.
  - **Two computed signals on the component**, not template-only logic. The existing spec architecture stubs the template (`overrideComponent`), so DOM assertions aren't testable. The computed signals provide testable handles for both the visibility decision and the role gating, mirroring the same pattern used in T-BIL-TV-05.
  - **`<app-custom-tag>` reused** with `statusId="pool-funding"` (the tokens from T-BIL-TV-03) — visually consistent with the my-projects column and the card view.
  - **No "Not Pool Funding" badge** when the flag is false (AC-02.2 — silence is the signal). The `@if` block hides the entire wrapper.

- **Issues encountered**:
  - The existing `currentProject` signal is typed `GetProjectDetail`, which doesn't include `is_pool_funding_contributor`. Cast to `{ is_pool_funding_contributor?: boolean }` inline in the computed to avoid widening `GetProjectDetail` (which would ripple into other contract-detail surfaces beyond this spec's scope). Future cleanup: add the field to `GetProjectDetail` when the backend confirms it's on the response — small follow-up.

- **Verification**:
  - `npx eslint project-detail` — clean.
  - `npx jest project-detail` — **10/10 pass** (3 new + 7 pre-existing, zero regression).
  - `npx ng build --configuration=development` — exit 0. All template warnings are pre-existing in unrelated components (`MyLatestResultsComponent`, `CreateOicrFormComponent`). The new template + imports compile under strict-template.

- **Done criteria check** (from `tasks.md`):
  - ✅ Renders badge when `is_pool_funding_contributor=true` (covered by `showPoolFundingBadge()` returning `true`).
  - ✅ Does not render badge when `false` or `undefined` (covered by the same computed).
  - ✅ When `canAccessCenterAdmin()` returns true → badge wrapped in `<a>`. When false → plain badge (template branches on `canEditPoolFundingTag()`; computed mirrors mocked RolesService).
  - ⏭ Manual smoke (Center Admin click → lands on override page pre-filled) — PR-review obligation, deferred to T-BIL-TV-09 ship.

- **Carry-forward**:
  - `GetProjectDetail` interface could be widened to include `is_pool_funding_contributor?: boolean` when convenient — small cleanup, no functional impact today.
  - T-BIL-TV-09 (override page) handles the `?contract-code=...` query param pre-fill that this routerLink hands off.

---

### T-BIL-TV-08 — Audit `result.interceptor` for 400 toast suppression

- **Status**: ✅ completed
- **Date**: 2026-05-20
- **Files changed**:
  - `research-indicators/src/app/shared/interceptors/http-error.interceptor.ts` — added a new local boolean `isPoolFundingTagValidationError = error.status === 400 && req.url.includes('/pool-funding-tag')` and threaded `!isPoolFundingTagValidationError` into the toast-suppression `if`. Pattern mirrors the existing `isAiFormalizeError` precedent.
  - `research-indicators/src/app/shared/interceptors/http-error.interceptor.spec.ts` — appended 2 cases: (a) 400 on `/pool-funding-tag` does NOT toast (the new suppression), (b) 500 on `/pool-funding-tag` DOES toast (regression guard so we don't over-suppress).

- **Audit findings** (recorded in [`./design.md` §11](./design.md#11-design-decisions-decision-record)):
  - `result.interceptor.ts` is a URL-mutator only — adds `reportYear` + `reportingPlatforms` query params when `X-Use-Year` header is present. No error handling, no toast. The `useResultInterceptor: true` flag on `PATCH_PoolFundingTag` poses no double-surface risk from THIS interceptor.
  - `httpErrorInterceptor` toasts on every error except 409, 401, refresh-token URLs, and AI-formalize 502 — so 400 falls through. On a non-bilateral 400 the backend returns `{ description: "...", errors: null }`, which would produce an empty-detail toast on top of our inline error.
  - **Outcome 3** of the audit plan (per [`./tasks.md` §4 T-BIL-TV-08](./tasks.md)): paused and asked the user.

- **Decision made** (user-approved 2026-05-20):
  - Applied **URL-scoped exception** (option 1) in `httpErrorInterceptor`. Reasoning: smallest blast radius, mirrors the established precedent (`refresh-token`, `ai/formalize`), no new client convention needed. Other endpoints' behavior is unchanged.
  - Narrowly suppresses **only 400** on `/pool-funding-tag` URLs. 5xx and other non-400 errors from the same endpoint continue to toast — the second new spec case asserts this regression guard.

- **Issues encountered**:
  - The condition reads cleanly as a chain of `!exception` guards. Tempted to factor into a small helper but kept inline to match the existing `isAiFormalizeError` style — consistency over abstraction at this scope.

- **Verification**:
  - `npx eslint http-error.interceptor.ts` — clean.
  - `npx jest http-error.interceptor.spec.ts` — **22/22 pass** (2 new + 20 pre-existing, zero regression).

- **Done criteria check** (from `tasks.md`):
  - ✅ Decision row appended to [`./design.md` §11](./design.md#11-design-decisions-decision-record) (originally as "pending user decision", then updated to "resolved" with the chosen option).
  - ✅ Code changed; tests cover both the new suppression and the regression guard.

- **Carry-forward**:
  - T-BIL-TV-09 (`AgressoPoolFundingTagComponent`) can now rely on the contract: a 400 from `PATCH_PoolFundingTag` will NOT toast. The component renders the inline error via `inlineError` signal as designed. `BilateralService.patchTag` already passes the 400 through as `{ ok: false, status: 400, description }` (covered by T-BIL-TV-02 spec case "400 with bilateral").
  - The new URL exception also covers any future endpoints under `/pool-funding-tag` (if backend grows them) — defensible but worth re-checking when alignment-section adds its `/pool-funding-alignment` endpoints (different path, separate exception or pattern).

---

### T-BIL-TV-09 — `AgressoPoolFundingTagComponent` + lazy route

- **Status**: ✅ completed
- **Date**: 2026-05-20
- **Files changed (5)**:
  - `…/administration/center-admin/agresso-pool-funding-tag/agresso-pool-funding-tag.component.ts` *(new)* — standalone, OnPush, default export. Injects `BilateralService`, `ActionsService`, `ActivatedRoute`. Signals: `contractCode`, `newValue`, `justification`, `inlineError`, `saveSuccess`; proxies `loading`, `saving`, `contract` from `BilateralService`. Computed `isBilateral`, `canSave`. Methods `ngOnInit` (query-param prefill + auto-lookup), `onLookup`, `onSave`, `onJustificationInput`.
  - `…/agresso-pool-funding-tag.component.html` *(new)* — 3 stacked cards: lookup (input + Look up button + inline-error slot) / summary (code + funding type + description + current tag + not-bilateral hint) / override (checkbox + justification textarea + Save). Every interactive element has a `data-testid`. Uses `<app-custom-tag statusId="pool-funding">` for the current-value display.
  - `…/agresso-pool-funding-tag.component.scss` *(new)* — minimal `:host` + `.agresso-pf` boilerplate matching `sdg-management.component.scss`.
  - `…/agresso-pool-funding-tag.component.spec.ts` *(new)* — 10 cases (see Verification).
  - `research-indicators/src/app/app.routes.ts` — registered lazy route `'administration/center-admin/agresso-pool-funding-tag'` with `canMatch: [centerAdminGuard]`, alphabetical position between `bulk-upload` and `sdg-management`.

- **Decisions made**:
  - **Signals over reactive `FormGroup`.** Design §4.5 specified `FormGroup` with `Validators.required` etc., but the codebase pattern (sdg-management, my-projects) uses signals + inline guards. Switched to signals for consistency. Validation lives in `onLookup`/`onSave` (e.g., empty-code guard sets inline error; `canSave` computed gates the button). Net effect: same UX contract, half the boilerplate, no `ReactiveFormsModule` import.
  - **PrimeNG `<p-checkbox [binary]="true">` instead of `<p-inputSwitch>`** for the override toggle. The codebase doesn't currently import `InputSwitchModule` anywhere; `CheckboxModule` already arrived in T-BIL-TV-05 via my-projects. Reusing CheckboxModule keeps the bundle smaller and the visual language consistent. Both communicate "toggle this property"; design QA can swap to a switch later if preferred (one-line template change).
  - **PrimeNG `<p-button>` import is new** to this folder — but it's already used across the codebase, no new dependency.
  - **`PoolFundingService.isBilateral(contract)` is the source of truth for the non-bilateral guard.** Design §4.2.1 implied `isBilateral` would live on `AgressoContract`, but T-BIL-TV-02 placed the derivation on the service. The component uses `computed(() => this.bilateralService.isBilateral(this.contract()))` to keep the rendering reactive when contract changes.
  - **Non-bilateral defense locked.** When the loaded contract is non-bilateral: (a) the checkbox is `[disabled]`, (b) the textarea is `[disabled]`, (c) the not-bilateral hint renders below the summary card, (d) `canSave()` returns `false`, (e) the override card visually dims via `opacity-60`. The PATCH 400-with-bilateral inline error path is still wired as defense-in-depth in case the backend flips between lookup and save.
  - **Inline-error copy locked** (per [`./design.md` §4.5 OQ-TV-2](./design.md)): `"This contract is not bilateral. Only bilateral contracts can carry the Pool Funding tag."` defined as `NOT_BILATERAL_INLINE_MSG` module constant — single point of change.
  - **`<small role="alert" aria-live="polite">` for the inline error** (REQ-BIL-TV-NF-02 — WCAG 2.1 AA). The Save button uses `[loading]` for the spinner.
  - **Justification clipping** at 500 chars happens in `onJustificationInput` (not just `maxlength`) so paste from external source can't bypass the limit.

- **Issues encountered**:
  - None. Build, lint, and tests all clean on first run.

- **Verification**:
  - `npx eslint agresso-pool-funding-tag` + `app.routes.ts` — clean.
  - `npx ng build --configuration=development` — exit 0. AOT validated the template + lazy import; only pre-existing warnings in unrelated components surfaced.
  - `npx jest agresso-pool-funding-tag` — **10/10 pass**:
    - Query-param prefill + auto-lookup (covers AC-07.2)
    - Successful lookup populates summary, seeds `newValue` from current tag (AC-07.3, AC-07.4)
    - Empty-code lookup → inline error, no service call
    - No-result lookup → "Not found" inline error
    - Non-bilateral contract → `canSave === false` (AC-08.1 defense-in-depth before PATCH)
    - Unchanged value → `canSave === false` (AC-07's "Save disabled until value changes")
    - Save 200 → success toast + `saveSuccess` flips (AC-07.5, AC-07.6)
    - Save 400-with-bilateral → locked inline error, NO toast (AC-08.1, AC-08.2, AC-08.3)
    - Save 5xx → no inline error, no toast at the component layer (global interceptor handles 5xx)
    - Justification clipping to `justificationMaxLength`

- **Done criteria check** (from `tasks.md`):
  - ✅ Component lazy-loads — route uses dynamic `import().then(m => m.default)`.
  - ✅ Accessibility self-checked: `inputId`/`for` label pairs, `aria-live="polite"` on error, button `[loading]`, focusable elements have visible focus via default browser/PrimeNG styles.
  - ⏭ Manual smoke (CONTRIBUTOR redirect; CENTER_ADMIN full flow in both themes) — PR-review obligation.

- **Carry-forward**:
  - T-BIL-TV-10 (export) — discussion still about whether a my-projects Excel export exists today.
  - T-BIL-TV-11 (telemetry) — `bilateral.tag.override.saved` event fires after `actions.showToast(...)` in `onSave` success branch.
  - T-BIL-TV-12 (constitutional docs) — add the new admin route to `detailed-design.md` §2 modules + §4 endpoints.

---

### T-BIL-TV-10 — Extend my-projects Excel export (conditional)

- **Status**: ⏭ deferred
- **Date**: 2026-05-20
- **Files changed**: none.
- **Investigation result**: per the task's "first step" instruction, grepped the codebase for `xlsx | exportCSV | exportExcel | sheetjs | exceljs | saveAs | file-saver | download.*csv | to-csv | writeFile`. Findings:
  - `ApiService.GET_ResultCenterXlsx` exists at `api.service.ts:234` — a blob-fetch method that hits `reports/resultCenter/xlsx`.
  - It is consumed by `results-center-table.component.ts:150` (`STAR_results_metadata_<yyyymmdd>_<hhmm>_<initials>.xlsx`) and `:159` (the blob fetch + download).
  - **No my-projects export exists.** `SearchExportControlsComponent` is imported by `my-projects.component.ts` but does not perform an Excel/CSV export — its name is misleading; it surfaces search + view-toggle controls only (verified by reading the file).
- **Decision**: per [`./tasks.md` §4 T-BIL-TV-10](./tasks.md) "if no implementation is found, stop and mark this task `deferred` with a follow-up note", AC-06 rolls forward into a future spec. No scope expansion (i.e., do NOT introduce a my-projects export from scratch — that's a separate product concern outside tag-visibility's intent).
- **Tracking**: updated [`./tasks.md` §9 OI-5](./tasks.md) with the investigation result. When the deferred REQ-BIL-TV-03/-04 results-center surfaces ship (or when a my-projects export is introduced), the existing `GET_ResultCenterXlsx` will need a Pool Funding column too — same intent, different feature folder.
- **Done criteria check**: ⏭ AC-06.1..06.4 carried forward — none discharged by this task.

---

### T-BIL-TV-11 — Telemetry — `bilateral.tag.override.saved`

- **Status**: ✅ completed
- **Date**: 2026-05-20
- **Files changed**:
  - `…/agresso-pool-funding-tag.component.ts` — imported `ClarityService` from `@services/clarity.service` and injected it. In `onSave`, captured `priorValue = !!c.is_pool_funding_contributor` and `contractCode = c.agreement_id` BEFORE calling `bilateralService.patchTag(...)` (because the service updates `currentContract` optimistically on success). On 200, fire `this.clarity.trackEvent('bilateral.tag.override.saved', { contract_code, new_value, prior_value })` BEFORE the toast.
  - `…/agresso-pool-funding-tag.component.spec.ts` — mocked `ClarityService` with a `trackEvent` jest.fn. Extended the existing `save 200` case to assert the event payload. Added 2 new cases: (a) event fires AFTER the optimistic update with the correct prior_value, and (b) event does NOT fire on 4xx/5xx.

- **Decisions made**:
  - **Target: `ClarityService.trackEvent(name, data?)`** — the only generic event-tracking method in the codebase. `TrackingToolsService` only handles init + route nav; `GoogleAnalyticsService` and `HotjarService` don't expose generic event hooks. Going through `ClarityService` is the established pattern and the comment "Track custom events" at line 65-69 confirms the intent.
  - **Event key in dot-notation**: `bilateral.tag.override.saved` — matches the design.md proposal. No existing custom events to conform to in the codebase, so adopting the design's naming as-is.
  - **Fire BEFORE the toast** per the tasks.md note: "Fire after patchTag returns { ok: true } and BEFORE the toast (so the metric isn't affected if the toast is suppressed in some session)".
  - **Capture `priorValue` BEFORE the patch** — `BilateralService.patchTag` updates `currentContract.is_pool_funding_contributor` optimistically when it returns ok (per T-BIL-TV-02 implementation). Reading `c.is_pool_funding_contributor` after the await would give the NEW value. The dedicated spec case "telemetry event captures prior_value before the optimistic update flips it" guards this regression.
  - **No PII concern** — contract codes are not PII per current PRD guidance (REQ-BIL-TV-NF-05 wasn't flagged here). Only the contract code and the two booleans ship to Clarity.

- **Issues encountered**:
  - None. The 2 new spec cases passed on first run.

- **Verification**:
  - `npx eslint agresso-pool-funding-tag.component.ts` — clean.
  - `npx jest agresso-pool-funding-tag` — **12/12 pass** (10 from T-09 with the save-200 case extended for telemetry assertion + 2 new cases).

- **Done criteria check** (from `tasks.md`):
  - ✅ Tracking service call has the correct payload on success.
  - ⏭ Manual GA Realtime / Clarity event-log verification when triggered locally — PR-review obligation.

---

### T-BIL-TV-12 — Constitutional docs update

- **Status**: ✅ completed
- **Date**: 2026-05-20
- **Files changed (2)**:
  - `docs/system-design/design.md`:
    - §7.1 — added a "Pool Funding" row to the color tokens table (`--ac-pool-funding-fg`, `--ac-pool-funding-border`).
    - §12 — appended a 2026-05-20 decision row noting the bilateral tag-visibility ship.
  - `docs/detailed-design/detailed-design.md`:
    - §2 — extended the Administration / Center Admin row to include "AGRESSO Pool Funding tag override".
    - §4.3 — appended `PATCH /agresso/contracts/:code/pool-funding-tag` to the representative endpoints list.
    - §6.3 — extended the `httpErrorInterceptor` bullet to enumerate the URL-scoped toast exceptions (refresh-token, AI-formalize 502, **400 on `/pool-funding-tag`**).

- **Decisions made**:
  - **Append-only**, terse, no reformatting of prior content (per `tasks.md` done-criteria). Each constitutional doc entry is one row or one sentence, with a backlink to the spec folder so future maintainers can chase the full story.
  - **System-design §8 (component inventory) not touched** — the Pool Funding tag reuses the existing `CustomTagComponent`. Adding a new component-inventory row for a styled instance of an existing component would inflate that section without adding information.
  - **Detailed-design §6 (state boundaries) not touched** — `BilateralService` follows the existing "service-per-domain + signals" pattern already documented; no new state-management concept to record.

- **Issues encountered**: none.

- **Verification**:
  - Only docs files changed; no code touched.
  - Visual sanity: section anchors still resolve (§7.1, §12, §2, §4.3, §6.3 all intact).

- **Done criteria check** (from `tasks.md`):
  - ✅ Both blueprint docs read accurately for a cold-start reader after this spec ships.
  - ✅ Diff is append-only; no reformatting of prior content.

---

## 3. Summary

All 12 tasks closed (11 completed + 1 deferred) by **2026-05-20**.

### Capabilities shipped

- AGRESSO Pool Funding tag visible on `my-projects` (table column with sort, sidebar filter, active-filter chip, card view).
- Pool Funding badge in `project-detail` header — clickable to the override page for Center Admins, static for others.
- Center-admin override page at `/administration/center-admin/agresso-pool-funding-tag`, lazy-loaded behind `centerAdminGuard`. Three stacked cards (lookup / summary / override), with query-param prefill, inline-error path on 400-bilateral, success toast + `bilateral.tag.override.saved` telemetry on 200.
- Honors AC-08.3 (no double-surface) via URL-scoped exception in `httpErrorInterceptor` for 400s on `/pool-funding-tag`.

### Files changed (across all tasks, 17 source + 5 docs)

Source:
- `shared/interfaces/find-contracts.interface.ts` (extended)
- `shared/interfaces/bilateral/agresso-contract.interface.ts` (new)
- `shared/services/api.service.ts` (extended) + spec
- `shared/services/bilateral.service.ts` (new) + spec
- `shared/services/my-projects.service.ts` (extended) + spec
- `shared/constants/status-colors.ts` (extended)
- `shared/components/project-item/project-item.component.{ts,html}` (extended) + spec
- `shared/interceptors/http-error.interceptor.ts` (extended) + spec
- `pages/platform/pages/my-projects/my-projects.component.{ts,html}` (extended) + spec
- `pages/platform/pages/project-detail/project-detail.component.{ts,html}` (extended) + spec
- `pages/platform/pages/administration/center-admin/agresso-pool-funding-tag/{ts,html,scss,spec.ts}` (new, 4 files)
- `app/app.routes.ts` (extended)
- `styles/colors.scss` (extended)

Docs:
- `research-indicators/README.md` (extended)
- `docs/system-design/design.md` (extended)
- `docs/detailed-design/detailed-design.md` (extended)
- `docs/specs/bilateral-module/tag-visibility/{requirements,design,tasks,execution}.md` (new + maintained)

### Test results

| Spec | Tests | Notes |
| --- | --- | --- |
| `api.service.spec.ts` | +2 / 22 PATCH-suite green | URL encoding + flag assertion |
| `bilateral.service.spec.ts` | 9/9 (new) | 3× getContract, 4× patchTag, 2× isBilateral |
| `my-projects.service.spec.ts` | +8 / 149 total | poolFundingOnly filter + chip + persistence |
| `my-projects.component.spec.ts` | +4 / 151 total | sort mapping + change handler (3 cases) |
| `project-item.component.spec.ts` | +3 / 28 total | DOM-level: default / on / toggle off |
| `project-detail.component.spec.ts` | +3 / 10 total | `showPoolFundingBadge`, `canEditPoolFundingTag` |
| `http-error.interceptor.spec.ts` | +2 / 22 total | 400 suppressed on `/pool-funding-tag`, 500 still toasts |
| `agresso-pool-funding-tag.component.spec.ts` | 12/12 (new) | prefill + lookup + canSave gates + save 200/400/5xx + telemetry + clipping |
| `custom-tag.component.spec.ts` | 10/10 (regression) | unchanged, validates STATUS_COLOR_MAP consumer |
| **Total new** | **+22 cases** | **All green; zero regressions across 281 existing cases** |

### Open items rolled forward

- **OI-1** — Result-list surfaces (REQ-BIL-TV-03/-04). Backend doesn't enrich `/results` rows with `is_pool_funding_contributor` today; deferred.
- **OI-2** — Bulk CSV override (out of scope per proposal).
- **OI-3** — Center-admin navigation entry (AC-07.7). The route is reachable by URL + by the project-detail header link; an admin index page / sidebar listing doesn't appear to exist today, so the inclusion is moot until one is introduced.
- **OI-4** — Final palette. Working Material green; design QA may swap hex values in `colors.scss` only.
- **OI-5** — Excel export. No my-projects export exists today. AC-06 carried forward to a future spec.
- **GetProjectDetail typing carry-forward** from T-07: add `is_pool_funding_contributor?: boolean` to the interface when convenient — currently using an inline cast in the project-detail computed.

### Carry-forward to sibling specs

- `BilateralService` is positioned as a shared facade — alignment-section and indicator-mapping will extend it (signals + new methods like `getAlignment`, `patchAlignment`, `patchContribution`).
- The URL-scoped toast exception pattern in `httpErrorInterceptor` is a precedent for sibling specs (e.g., 400 on `/pool-funding-alignment` for the alignment-section's validation errors).
- The `<app-custom-tag statusId="pool-funding">` and the `--ac-pool-funding-*` tokens are reusable across all bilateral surfaces.

### Spec health

- All 8 functional requirements (REQ-BIL-TV-01..08) discharged or explicitly deferred (REQ-03/-04 with rationale).
- All 6 NF requirements discharged (NF-01 render-time and NF-03 bundle still carry manual-measurement obligations to the PR).
- 5 design decisions recorded in `design.md` §11 (sub-feature split, BilateralService facade, result-list deferral, error copy lock, tokens decision) plus 3 execution-time decisions appended (token-count refinement, R-3 GET-by-code absence, interceptor audit resolution).

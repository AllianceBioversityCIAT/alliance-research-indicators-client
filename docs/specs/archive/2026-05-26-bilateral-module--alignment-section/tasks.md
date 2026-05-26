# Tasks — Bilateral Module / Alignment Section

> Execution units for [`./requirements.md`](./requirements.md) and [`./design.md`](./design.md). Follows the template at [`../../general-setup/task.md`](../../general-setup/task.md). Consumed by `/sdd-execute`.

---

## 1. Goal

When this task list completes: every authenticated user opening a Pool-Funding-eligible bilateral result sees a new **Pool Funding Alignment** tab in the sidebar that renders contribution state, lever selections, and justification; authorized editors (PI / Center Admin / System Admin owning the result) can toggle `has_contribution`, multi-select levers, edit the justification, and Save via PATCH; the section transitions to read-only when the result is synced to PRMS (also handling 409 races) and stays read-only — visually distinct — for non-editors; the tab reconciles in real time via the `result.pool-funding-alignment.changed` Socket.IO event with a dirty-state guard; and AR.1 + AR.3 hold (edit regardless of result_status; alignment not in the submission validator). All foundations introduced in [`../tag-visibility/`](../tag-visibility/) are reused: `BilateralService`, `httpErrorInterceptor` URL-scoped exception pattern, Pool Funding tokens, sidebar visibility filter mechanics. No new persistence, no NgModule, no parallel taxonomy.

---

## 2. Pre-flight checklist

- [x] [`./requirements.md`](./requirements.md) and [`./design.md`](./design.md) exist and are reviewed (Phase 1 + Phase 2 — approved 2026-05-20).
- [x] PRD personas (PRD §3) and constraints C-1..C-6 (PRD §8.3) are still current.
- [x] Sibling spec [`../tag-visibility/`](../tag-visibility/) has shipped (commit `2779b5fd`, 2026-05-20). `BilateralService` foundation is in place.
- [x] Path aliases (`@platform`, `@services`, `@interfaces`, `@guards`, `@shared`) already declared in [`tsconfig.json`](../../../../research-indicators/tsconfig.json) and [`jest.config.ts`](../../../../research-indicators/jest.config.ts).
- [ ] Backend `GET /api/v1/results/:resultCode/pool-funding-alignment` and `PATCH .../pool-funding-alignment` reachable from `environment.dev.ts`'s `mainApiUrl` with `ARI_BILATERAL_MODULE_ENABLED=true` *(verify before T-BIL-AS-01)*.
- [ ] Backend emits `result.pool-funding-alignment.changed` via Socket.IO with payload `{ result_code, by_user_id, at }` *(verify during T-BIL-AS-11 — handoff §6)*.
- [ ] `CurrentResultService.isCurrentUserOwner()` exists OR can be added safely (R-1 from [`./design.md` §13](./design.md#13-risks--mitigations); verify first in T-BIL-AS-03).

---

## 3. Dependency graph

```
T-BIL-AS-01 (interfaces + ApiService methods, no deps)
    └─▶ T-BIL-AS-02 (BilateralService extension)
            ├─▶ T-BIL-AS-06 (ResultSidebarComponent — sidebar entry + hide filter)
            ├─▶ T-BIL-AS-07 (component base — view + edit form)
            │       ├─▶ T-BIL-AS-08 (Save flow + 200/400/409 handling)
            │       ├─▶ T-BIL-AS-09 (read-only states — synced + non-editor banners)
            │       ├─▶ T-BIL-AS-11 (real-time Socket.IO reconcile)
            │       └─▶ T-BIL-AS-12 (telemetry events)
            └─▶ T-BIL-AS-10 (lazy route + ineligibility redirect)
T-BIL-AS-03 (CurrentResultService.isCurrentUserOwner, no deps)
    └─▶ T-BIL-AS-02
T-BIL-AS-04 (httpErrorInterceptor URL exception, no deps)
    └─▶ T-BIL-AS-08
T-BIL-AS-05 (STATUS_COLOR_MAP 'pf-synced' entry, no deps)
    └─▶ T-BIL-AS-09
T-BIL-AS-13 (submission-validator regression test for AR.3, no deps)
T-BIL-AS-14 (constitutional docs update — after everything lands)
```

No cycles. Parallel-safe groups:

- **Group A (no deps)**: T-BIL-AS-01, T-BIL-AS-03, T-BIL-AS-04, T-BIL-AS-05, T-BIL-AS-13 — independent groundwork.
- **Group B (after T-BIL-AS-01 + T-BIL-AS-03)**: T-BIL-AS-02 (service extension), then T-BIL-AS-06 (sidebar) and T-BIL-AS-10 (route) in parallel.
- **Group C (after T-BIL-AS-02)**: T-BIL-AS-07 (component base).
- **Group D (after T-BIL-AS-07)**: T-BIL-AS-08, T-BIL-AS-09, T-BIL-AS-11, T-BIL-AS-12 — feature behaviors layered on the component shell.
- **Group E (last)**: T-BIL-AS-14 (docs).

---

## 4. Tasks

---

### T-BIL-AS-01 — Add alignment interfaces + extend `ApiService`

- **Status**: `completed` (2026-05-22)
- **Size**: S
- **Depends on**: none
- **Discharges ACs**: enables AC-01.x, AC-02.x, AC-06.x (typing only — actual surfaces in later tasks).
- **Touches**:
  - `src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts` *(new)*
  - `src/app/shared/services/api.service.ts` *(add two methods)*
  - `src/app/shared/services/api.service.spec.ts` *(extend)*
- **Summary**: Add the four typing units the rest of the spec depends on — `AlignmentLever`, `AlignmentResponse`, `UpdatePoolFundingAlignmentDto`, `AlignmentChangedEvent` — under the existing `interfaces/bilateral/` folder (created in tag-visibility). Add `GET_PoolFundingAlignment(resultCode)` and `PATCH_PoolFundingAlignment(resultCode, body)` to `ApiService`, placed alongside the AGRESSO block already extended in T-BIL-TV-01. Both methods deliberately omit `useResultInterceptor: true` (the design decision recorded in [`./design.md` §11](./design.md#11-design-decisions-decision-record) 2026-05-20).
- **Implementation notes**:
  - Interface shapes are verbatim per [`./design.md` §2.1](./design.md#21-new-interfaces). `has_pool_funding_alignment_eligible` is included for parity with the backend handoff (alias of `eligible`); the client reads `eligible`.
  - ApiService method bodies are verbatim per [`./design.md` §3.1](./design.md#31-apiservice-additions). Use `encodeURIComponent(resultCode)`.
  - **Pre-flight verification**: confirm both endpoints exist via the local Swagger UI per [`../ari-backend-context/frontend-handoff.md` §10](../ari-backend-context/frontend-handoff.md#10-local-development-tips). If absent, **stop and escalate** — this whole spec depends on them.
  - `MainResponse<T>` envelope only; no custom unwrap.
- **Tests to add/update**:
  - `api.service.spec.ts` — add cases:
    1. `GET_PoolFundingAlignment` — URL shape, special-character encoding via `encodeURIComponent` (e.g. `INIT-2025/AB#1`).
    2. `PATCH_PoolFundingAlignment` — body shape with `has_contribution=true` and `lever_codes` populated.
    3. `PATCH_PoolFundingAlignment` — body shape with `has_contribution=false` (no `lever_codes`).
    4. Neither method passes `useResultInterceptor: true` (assert option absence).
- **Done when**:
  - `strictTemplates` and `noPropertyAccessFromIndexSignature` clean.
  - `npm run lint` clean for changed files.
  - `npm run test -- api.service` green; new cases assert on `MainResponse<T>` envelope.
- **Relevant skills**: `angular-developer`, `api-design-principles`.

---

### T-BIL-AS-02 — Extend `BilateralService` with alignment state, methods, and `editable` computed

- **Status**: `completed` (2026-05-22) — used `RolesService.canAccessCenterAdmin()` instead of `canEditAnyResult()` per role-matrix correction (see Summary).
- **Size**: M
- **Depends on**: T-BIL-AS-01, T-BIL-AS-03.
- **Discharges ACs**: enables AC-02.x, AC-03.x, AC-06.x, AC-07.x, AC-10.x, AC-12.x.
- **Touches**:
  - `src/app/shared/services/bilateral.service.ts` *(extend)*
  - `src/app/shared/services/bilateral.service.spec.ts` *(extend)*
- **Summary**: Extend the existing `BilateralService` facade with three new signals (`currentAlignment`, `loadingAlignment`, `savingAlignment`), two new methods (`getAlignment`, `patchAlignment`), the `editable` computed (role + ownership + `!is_read_only`), and the `PatchAlignmentResult` discriminated union the component uses to switch between toast / inline-error UX. Mirrors the shape of the existing `getContract` / `patchTag` block landed in T-BIL-TV-02.
- **Implementation notes**:
  - Implementation body is verbatim per [`./design.md` §4.4.1](./design.md#441-extended--bilateralservice).
  - `editable` computed inputs: `RolesService.canEditAnyResult()` (existing, returns true for CENTER_ADMIN / SYSTEM_ADMIN) AND `CurrentResultService.isCurrentUserOwner()` (verified/added in T-BIL-AS-03). Server is the authority on mutation; the client mirrors.
  - `patchAlignment` MUST NOT call `actions.showToast` on the 400-with-fieldErrors path. The component owns the toast-vs-inline decision (mirrors the `patchTag` contract).
  - On 200, `currentAlignment.set(res.data)` updates the signal — both for the saving tab and the sidebar visibility filter (one source of truth).
  - `extractFieldErrors(errorDetail)` parses the backend's `errorDetail.errors` array into a `{ [fieldName]: message }` map. Defensively returns `undefined` if the shape doesn't match.
  - `loadingAlignment` and `savingAlignment` flip via `try / finally` so they always reset on rejection too (matches the T-BIL-TV-02 pattern).
- **Tests to add/update**:
  - `bilateral.service.spec.ts` — extend with ~10 cases:
    1. `getAlignment` happy path — sets `currentAlignment`, flips `loadingAlignment` true→false.
    2. `getAlignment` 404 — returns `null`, sets `currentAlignment` to `null`.
    3. `getAlignment` rejection — `loadingAlignment` resets to false (try/finally).
    4. `patchAlignment` 200 — returns `{ ok: true, data }`, updates `currentAlignment`.
    5. `patchAlignment` 400 with `errorDetail.errors` — returns `{ ok: false, status: 400, fieldErrors: { has_contribution: '...' } }`, does NOT toast.
    6. `patchAlignment` 400 without parseable `errorDetail` — returns `{ ok: false, status: 400, description }`, `fieldErrors` undefined.
    7. `patchAlignment` 409 — returns `{ ok: false, status: 409, description }`.
    8. `patchAlignment` 5xx — returns `{ ok: false, status: 500 }`; global interceptor handles toast.
    9. `editable` computed truth table:
       - `currentAlignment = null` → false.
       - `is_read_only = true` → false (regardless of role).
       - `canEditAnyResult = true, is_read_only = false` → true.
       - `canEditAnyResult = false, isCurrentUserOwner = true, is_read_only = false` → true.
       - `canEditAnyResult = false, isCurrentUserOwner = false` → false.
    10. Both `loadingAlignment` and `savingAlignment` correctly toggle on rejection.
- **Done when**:
  - Coverage on `bilateral.service.ts` ≥ 90% statements (REQ-BIL-AS-NF-06).
  - Existing `getContract` / `patchTag` tests still pass.
  - `npm run test` green.
- **Relevant skills**: `angular-developer`, `error-handling-patterns`.

---

### T-BIL-AS-03 — Verify or add `CurrentResultService.isCurrentUserOwner()`

- **Status**: `completed` (2026-05-22)
- **Size**: S
- **Depends on**: none.
- **Discharges ACs**: enables AC-03.1, AC-03.2, AC-10.x (owner-side branch of `editable`).
- **Touches**:
  - `src/app/shared/services/cache/current-result.service.ts` *(read; possibly extend)*
  - `src/app/shared/services/cache/current-result.service.spec.ts` *(extend if helper added)*
- **Summary**: Audit `CurrentResultService` for a helper that resolves "is the current logged-in user the result's PI / Creator / contact?". Ownership is a property of the result, so the helper lives here — not on `BilateralService` (decision recorded in [`./design.md` §11](./design.md#11-design-decisions-decision-record) 2026-05-20). If absent, add it as a `computed` that compares `cache.currentMetadata()?.creator_id` / `principal_investigator_id` / `contact_id` against `cache.dataCache().user.sec_user_id`. Idempotent if already present.
- **Implementation notes**:
  - **Step 1 — read the file**. The helper may already exist under a different name (e.g. `isOwner`, `currentUserIsOwner`). If equivalent, mark this task `completed` with no code change and update T-BIL-AS-02's consumer accordingly.
  - **If missing**: add a public `computed` returning boolean. Null-safe (return false when metadata or user is null). Mirror the existing service's coding style.
  - The three owner fields (`creator_id`, `principal_investigator_id`, `contact_id`) are taken from the existing metadata interface — verify their exact names during step 1.
  - **Do not** add ownership logic to `BilateralService` (R-1 from [`./design.md` §13](./design.md#13-risks--mitigations); ownership belongs on the result-cache service).
- **Tests to add/update**:
  - Only if the helper is newly added: `current-result.service.spec.ts` — 4 cases:
    1. No metadata → returns false.
    2. Current user = creator → returns true.
    3. Current user = PI → returns true.
    4. Current user = contact → returns true.
    5. Current user matches none → returns false.
- **Done when**:
  - Either the helper exists and is consumable by `BilateralService.editable`, OR a new `computed` is added with passing tests.
  - No regression on existing `CurrentResultService` consumers.
- **Relevant skills**: `angular-developer`, `systematic-debugging`.

---

### T-BIL-AS-04 — Extend `httpErrorInterceptor` with `/pool-funding-alignment` URL-scoped 400 exception

- **Status**: `completed` (2026-05-22)
- **Size**: S
- **Depends on**: none (ideally lands before T-BIL-AS-08 wires the component Save flow).
- **Discharges ACs**: AC-06.3 (inline error rendering, no toast on 400).
- **Touches**:
  - `src/app/shared/interceptors/http-error.interceptor.ts` *(extend toast-suppression chain)*
  - `src/app/shared/interceptors/http-error.interceptor.spec.ts` *(extend)*
- **Summary**: Add one URL-scoped exception to `httpErrorInterceptor` so 400 responses on `/pool-funding-alignment` skip the global toast and let the component own inline-error rendering. Mirrors the precedent landed in T-BIL-TV-08 for `/pool-funding-tag`.
- **Implementation notes**:
  - Single new local boolean inside the interceptor:
    ```ts
    const isPoolFundingAlignmentValidationError =
      error.status === 400 && req.url.includes('/pool-funding-alignment');
    ```
  - OR-chain it into the existing suppression chain alongside `isPoolFundingTagValidationError`. Keep the chain readable — one boolean per surface.
  - 401 / 403 / 5xx still toast normally — only 400 is suppressed.
  - The check uses `req.url.includes(...)` not exact match; query strings (if any) are tolerated.
- **Tests to add/update**:
  - `http-error.interceptor.spec.ts`:
    1. 400 on `results/RES-001/pool-funding-alignment` → no toast dispatched.
    2. 5xx on `results/RES-001/pool-funding-alignment` → toast dispatched (regression — confirms the exception is 400-only).
    3. 400 on an unrelated endpoint → toast dispatched (regression — confirms the suppression is URL-scoped).
- **Done when**:
  - Existing `/pool-funding-tag` and `refresh-token` exception cases still pass.
  - Coverage on the interceptor does not regress.
- **Relevant skills**: `angular-developer`, `error-handling-patterns`.

---

### T-BIL-AS-05 — Add `'pf-synced'` entry to `STATUS_COLOR_MAP`

- **Status**: `completed` (2026-05-22)
- **Size**: XS
- **Depends on**: none.
- **Discharges ACs**: visual layer for AC-07.2 + REQ-BIL-AS-NF-04 (dark + light parity).
- **Touches**:
  - `src/app/shared/constants/status-colors.ts` *(add `'pf-synced'` entry)*
  - `src/app/shared/constants/status-colors.spec.ts` *(extend if a test file exists; otherwise none)*
- **Summary**: Add one entry to `STATUS_COLOR_MAP` keyed `'pf-synced'`, pointing at the existing `--ac-grey-700` token (no new CSS variable). Resolves **OQ-AS-2** ([`./design.md` §11](./design.md#11-design-decisions-decision-record) 2026-05-20). Reuse-not-introduce keeps the system-design tokens clean.
- **Implementation notes**:
  - One-line addition per [`./design.md` §4.6](./design.md#46-theming):
    ```ts
    'pf-synced': { border: 'var(--ac-grey-700)', text: 'var(--ac-grey-700)' }
    ```
  - **No new SCSS variables.** Grey-700 already exists in `colors.scss` with light + dark variants.
  - No README / system-design §7 update needed (no new token introduced); the new map entry alone is the surface.
- **Tests to add/update**:
  - If `status-colors.spec.ts` exists, add a key-presence assertion. Otherwise none.
- **Done when**:
  - `npm run lint` clean.
  - Manual contrast check (WCAG 2.1 AA) on a `<app-custom-tag statusId="pf-synced">` rendering in both themes — recorded in PR description.
- **Relevant skills**: `tailwind-design-system`, `ui-ux-pro-max`.

---

### T-BIL-AS-06 — Extend `ResultSidebarComponent` with Pool Funding alignment entry + visibility filter

- **Status**: `completed` (2026-05-22) — also includes the deferred AR.3 sidebar-side assertion from T-BIL-AS-13.
- **Size**: M
- **Depends on**: T-BIL-AS-02.
- **Discharges ACs**: AC-01.1, AC-01.2, AC-01.3, AC-09.2.
- **Touches**:
  - `src/app/shared/components/result-sidebar/result-sidebar.component.ts` *(extend `allOptions` + `allOptionsWithGreenChecks`)*
  - `src/app/shared/components/result-sidebar/result-sidebar.component.spec.ts` *(extend)*
- **Summary**: Add one `SidebarOption` to `allOptions` labeled "Pool Funding alignment", positioned between the existing "Alliance alignment" and "Partners" entries (resolves **OQ-AS-1**). Extend the `allOptionsWithGreenChecks` computed to filter out the entry when `BilateralService.currentAlignment()?.eligible !== true`, including the loading state (`null` hides — AC-01.3, prevents flicker). Confirm AR.3 holds — the new entry is NOT added to the `greenChecks` map consumed by the submission-validator.
- **Implementation notes**:
  - Per [`./design.md` §4.2.2](./design.md#422-extended--resultsidebarcomponent). Inject `BilateralService` (already singleton; cheap).
  - New private helper `shouldHidePoolFundingTab(option, alignment)`:
    ```ts
    private shouldHidePoolFundingTab(option: SidebarOption, alignment: AlignmentResponse | null): boolean {
      if (option.path !== 'pool-funding-alignment') return false;
      return !alignment || alignment.eligible === false;
    }
    ```
  - Insert into the existing `.filter(...)` of `allOptionsWithGreenChecks` — single boolean composed with the existing `indicator_id` filter.
  - `greenCheckKey: 'pool_funding_alignment'` is reserved but the backend may never populate it (AR.3). The map lookup is safe — returns falsy → no green-check decoration. Don't tie the option's hide logic to greenCheck presence.
  - **The `greenChecks` map keys driving submission validation are NOT touched.** AR.3 holds: alignment is not part of the submission validator (verified in T-BIL-AS-13).
- **Tests to add/update**:
  - `result-sidebar.component.spec.ts`:
    1. `currentAlignment = null` (loading) → "Pool Funding alignment" not in rendered list.
    2. `currentAlignment.eligible = false` → "Pool Funding alignment" not in rendered list.
    3. `currentAlignment.eligible = true` → "Pool Funding alignment" rendered between "Alliance alignment" and "Partners".
    4. Regression — existing `indicator_id`-driven filtering still works on other options when alignment is eligible.
    5. Regression — green-check decoration still works for unrelated options.
- **Done when**:
  - Manual smoke: load an eligible result → tab appears; load an ineligible result → tab absent (never flickers visible-then-hidden).
  - No regression in existing sidebar tests.
- **Relevant skills**: `angular-developer`, `ui-ux-pro-max`.

---

### T-BIL-AS-07 — `PoolFundingAlignmentComponent` base — view + edit form (no Save wiring yet)

- **Status**: `completed` (2026-05-22) — Form re-seeding uses a public `seedFromServer()` method called from the constructor promise chain (replaces the planned `effect`); T-BIL-AS-08 + T-BIL-AS-11 will call it on save success / socket reconcile. DOM-level cases deferred to T-BIL-AS-08/-09 where their target surfaces (save button gating, banners) actually exist.
- **Size**: L
- **Depends on**: T-BIL-AS-02, T-BIL-AS-03, T-BIL-AS-05.
- **Discharges ACs**: AC-02.1, AC-02.2, AC-02.3, AC-02.4, AC-02.5, AC-03.1, AC-03.3, AC-03.4, AC-04.1, AC-04.3, AC-05.1, AC-05.2, AC-06.1 (Save button disabled by `canSave` gate), AC-08.1 (no result_status guard).
- **Touches**:
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.ts` *(new)*
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.html` *(new)*
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.scss` *(new)*
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.spec.ts` *(new)*
- **Summary**: Build the new lazy-loaded result tab — standalone, default-export, OnPush — that renders the three subsections (contribution toggle, lever multiselect, justification textarea) bound to component-local signals, seeded from `bilateralService.currentAlignment()` via `effect`. Save button visible but always-disabled in this task (its full behavior lands in T-BIL-AS-08). No socket subscription yet (lands in T-BIL-AS-11). No synced / non-editor banners yet (land in T-BIL-AS-09). The component shell, layout, form state, `isDirty` / `canSave` computeds, and view-only states for `has_contribution = null / false / true` all ship here.
- **Implementation notes**:
  - Component shape verbatim per [`./design.md` §4.2.1](./design.md#421-new--poolfundingalignmentcomponent). Pattern reference: `src/app/pages/platform/pages/result/pages/alliance-alignment/`.
  - **Signals (local)**: `hasContribution`, `selectedLeverCodes`, `justification`, `inlineErrors` — `WritableSignal`s. `loading` / `saving` / `alignment` / `editable` / `isReadOnly` / `eligible` — proxied from `bilateralService`. `isDirty` / `canSave` — `computed`.
  - **Seeding `effect`**: when `alignment()` changes (initial load + post-save + post-reconcile), write all three form signals from server state. Use `untracked()` inside the effect when reading `hasContribution()` etc. to compare for "should I reset?" without creating a reactive loop.
  - **Toggle**: `<p-selectButton>` bound to `hasContribution()`. AC-02.2 → no default selection when null (pass `null` as model). AC-03.3 → on flip to false, also reset `selectedLeverCodes` to `[]`. AC-03.4 → on flip to true, leave `selectedLeverCodes` untouched (already pre-filled from server in the effect).
  - **Lever multiselect**: reuse the existing shared `<app-multiselect serviceName="levers">` (already wired against CLARISA in alliance-alignment / my-projects). Two-way bind to `selectedLeverCodes`. AC-04.1 / AC-04.3.
  - **Justification**: `<textarea pTextarea maxlength="500">` plus an `(input)` handler that clips at 500 (defense against paste — AC-05.1). Counter `X / 500` rendered right-aligned below; warning color when remaining < 50 (resolves **OQ-AS-5**).
  - **`isDirty`** compares the three form signals against `alignment()`. For `selectedLeverCodes`, sort both arrays by `lever_code` before comparing (stable comparison; AC-02.4 already orders server data by `lever_code`).
  - **`canSave`** = `editable() && !isReadOnly() && isDirty() && (hasContribution() === false || selectedLeverCodes().length >= 1)`. AC-04.2 enforced client-side as a mirror of the server validation.
  - **No `result_status` guard.** AC-08.1 is satisfied by *absence* — no gate. Add a `// AR.1 — alignment edit is NOT gated by result_status` comment on the `canSave` computed to deter future drift.
  - **`<app-navigation-buttons>`** is included for shell parity with the other 11 tabs but Save lives outside that component (PrimeNG `<p-button>` at the end of the form).
  - **`data-testid`** on every interactive element: `pf-alignment-toggle`, `pf-alignment-levers`, `pf-alignment-justification`, `pf-alignment-justification-counter`, `pf-alignment-save`, `pf-alignment-readonly-banner`, `pf-alignment-synced-banner`, `pf-alignment-synced-badge`.
  - **OnInit**: call `bilateralService.getAlignment(resultCode())`. The route param is read via `inject(ActivatedRoute).snapshot.params['id']` — match the pattern in alliance-alignment. The ineligibility redirect logic lands in T-BIL-AS-10 (route concern).
- **Tests to add/update**:
  - `pool-funding-alignment.component.spec.ts` — ~10 cases:
    1. OnInit calls `bilateralService.getAlignment(resultCode)`.
    2. With `has_contribution = null`, toggle has no selection AND lever picker is hidden.
    3. With `has_contribution = false`, "No Pool Funding contribution recorded." message renders AND lever picker is hidden.
    4. With `has_contribution = true, selected_levers = [L1, L2]`, lever picker is visible AND pre-filled.
    5. Toggle flip true→false clears `selectedLeverCodes`.
    6. Toggle flip false→true does NOT clear pre-filled levers from server state.
    7. `isDirty` becomes true when justification changes; false again on reset to server value.
    8. `canSave` false when `has_contribution = true && levers.length === 0`.
    9. Justification clipping at 500 chars on paste (set value > 500 via dispatchEvent, assert clipped).
    10. Save button always disabled in this task (placeholder; T-BIL-AS-08 lights it up).
  - DOM-level (real-render) — 3 cases:
    1. Subsection visibility matches the four (null / false / true / synced-pending) view modes.
    2. `data-testid` selectors all present for the editable shell.
    3. Justification counter renders `X / 500` and reflects input length.
- **Done when**:
  - Component lazy-loads (verified via `dist/` chunk after T-BIL-AS-10 wires the route).
  - Coverage on the new component ≥ 70% statements (REQ-BIL-AS-NF-06).
  - Manual smoke via direct URL navigation in both themes after T-BIL-AS-10 lands.
- **Relevant skills**: `angular-developer`, `ui-ux-pro-max`, `frontend-design`.

---

### T-BIL-AS-08 — Save flow — Save button + 200 / 400 / 409 handling + inline errors

- **Status**: `completed` (2026-05-22)
- **Size**: M
- **Depends on**: T-BIL-AS-04, T-BIL-AS-07.
- **Discharges ACs**: AC-06.1, AC-06.2, AC-06.3, AC-06.4, AC-06.5, AC-12.1, AC-12.2.
- **Touches**:
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.ts` *(extend)*
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.html` *(extend)*
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.spec.ts` *(extend)*
- **Summary**: Wire `onSave()` to build `UpdatePoolFundingAlignmentDto`, call `bilateralService.patchAlignment(...)`, and branch on the discriminated-union result. Render inline `<small role="alert" aria-live="polite">` errors below offending fields on 400. Refetch alignment + warning toast on 409. Success toast on 200. The interceptor (T-BIL-AS-04) suppresses the 400 toast; 5xx falls through to the global toast.
- **Implementation notes**:
  - DTO build:
    ```ts
    const body: UpdatePoolFundingAlignmentDto = {
      has_contribution: this.hasContribution()!,
      lever_codes: this.hasContribution() ? this.selectedLeverCodes() : undefined,
      justification: this.justification()?.trim() || undefined
    };
    ```
  - Save handler:
    ```ts
    async onSave(): Promise<void> {
      this.inlineErrors.set(null);
      const result = await this.bilateralService.patchAlignment(this.resultCode(), body);
      if (result.ok) {
        this.actions.showToast({ severity: 'success', summary: 'Pool Funding Alignment', detail: 'Saved' });
        return;
      }
      if (result.status === 400) {
        this.inlineErrors.set(result.fieldErrors ?? { _global: result.description });
        return;
      }
      if (result.status === 409) {
        await this.bilateralService.getAlignment(this.resultCode());  // refetch — repaints with is_read_only=true
        this.actions.showToast({
          severity: 'warn',
          summary: 'Synced to PRMS',
          detail: 'This result was synced to PRMS. Your unsaved alignment changes were not applied.'
        });
        return;
      }
      // 5xx — global interceptor handles toast; form state preserved
    }
    ```
  - **Inline error template**: render per field with the corresponding `<small role="alert" aria-live="polite">`. Use `data-testid="pf-alignment-error-<field>"` for selector stability.
  - **Save button**: `[disabled]="!canSave() || saving()"`. Hidden when `!editable()` or `isReadOnly()` (the hide logic lands in T-BIL-AS-09, but the disable wiring lands here so the spec test for AC-06.1 can pass before T-BIL-AS-09 ships).
  - **Reset `inlineErrors`** at the start of every Save attempt — never let stale errors carry forward (AC-06.3 implication).
- **Tests to add/update**:
  - `pool-funding-alignment.component.spec.ts` extension — 6 cases:
    1. Save 200 → success toast fired with the right copy; `currentAlignment` updated (via the service mock).
    2. Save 400 with `fieldErrors = { has_contribution: 'invalid' }` → `inlineErrors()` set, no toast.
    3. Save 400 without parseable fieldErrors → `inlineErrors._global` populated with `description`.
    4. Save 409 → `getAlignment` called once (refetch), warning toast fired with the synced-message copy.
    5. Save 5xx → no toast called from the component (global interceptor owns); form signals NOT reset (preserve for retry).
    6. Save while `saving()` is true → button disabled (state-driven, not action-blocked).
- **Done when**:
  - All AC-06.x and AC-12.x cases pass.
  - Toast / inline-error coexistence verified (T-BIL-AS-04 interceptor + this component split).
  - No regression in T-BIL-AS-07 cases.
- **Relevant skills**: `angular-developer`, `error-handling-patterns`.

---

### T-BIL-AS-09 — Read-only states — synced banner + non-editor banner + Save hide

- **Status**: `completed` (2026-05-22)
- **Size**: M
- **Depends on**: T-BIL-AS-05, T-BIL-AS-07.
- **Discharges ACs**: AC-07.1, AC-07.2, AC-07.3, AC-10.1, AC-10.2, AC-10.3.
- **Touches**:
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.html` *(add two banners + badge)*
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.scss` *(banner styling)*
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.spec.ts` *(extend)*
- **Summary**: Wire the three read-only surfaces on the new component. (1) **Synced badge** (`<app-custom-tag statusId="pf-synced">`) in the header when `is_read_only`. (2) **Synced banner** above the toggle when `is_read_only` — non-dismissible, neutral grey, with the canonical copy. (3) **Non-editor banner** above the toggle when `!editable && !is_read_only` — same structural treatment, copy "You don't have permission to edit this section." All form inputs (`[disabled]`) and the Save button (hidden, not just disabled — AC-10.2) follow `editable()` + `isReadOnly()`.
- **Implementation notes**:
  - Per [`./design.md` §4.2.1](./design.md#421-new--poolfundingalignmentcomponent) and [`./design.md` §4.6](./design.md#46-theming).
  - **Banner precedence** (when both conditions could hold): synced wins. Use `@if (isReadOnly()) { synced banner } @else if (!editable()) { read-only banner }`. Synced badge ALWAYS renders when `isReadOnly` (even for non-editors).
  - **All inputs `[disabled]`** when `!editable() || isReadOnly()`. The toggle and multiselect rely on their PrimeNG disabled-state styling; justification adds the `disabled` attribute on the textarea.
  - **Save button hidden** (`@if (editable() && !isReadOnly())`) when not editable or read-only — REQ-BIL-AS-10 AC-10.2 explicitly wants visibility distinction, not just disable.
  - **`aria-label` on the badge** = `"Pool Funding Alignment is synced and read only"` (AC-NF-02).
  - **Banner copy** (centralized as `private readonly` constants on the component, not inline in the template, to keep i18n-extractable per REQ-BIL-AS-NF-05):
    - `SYNCED_BANNER = 'This result has been pushed to PRMS. Alignment can no longer be edited from STAR.'`
    - `READ_ONLY_BANNER = "You don't have permission to edit this section."`
    - `SYNCED_BADGE_TOOLTIP = 'This result has been pushed to PRMS. Alignment can no longer be edited from STAR.'`
  - **No URL `?force=true` override** (AC-07.3 — server-driven only). Don't even read query params.
- **Tests to add/update**:
  - `pool-funding-alignment.component.spec.ts` extension — 6 cases:
    1. `is_read_only = true` → synced badge rendered, synced banner rendered, all inputs disabled, Save button absent from DOM.
    2. `is_read_only = false, editable = false` → read-only banner rendered, all inputs disabled, Save absent.
    3. `is_read_only = true, editable = false` → synced takes precedence; only synced banner renders (not stacked).
    4. `is_read_only = false, editable = true` → no banner, all inputs enabled, Save present.
    5. Synced badge `aria-label` matches the canonical copy.
    6. Banner copy matches the canonical constants (regression guard against drift).
  - DOM-level — 2 cases:
    - Synced badge visually distinct (grey-700) in light + dark themes (snapshot or state assertion).
    - Read-only banner contrast meets WCAG 2.1 AA (manual record in PR description).
- **Done when**:
  - AC-07.x and AC-10.x all pass.
  - Manual smoke matrix from [`./design.md` §12.4](./design.md#124-manual-smoke-pr-review):
    - CONTRIBUTOR-non-owner: read-only banner, inputs disabled, Save absent.
    - Synced result: synced banner + badge, inputs disabled, Save absent.
    - Stacked (non-editor on a synced result): synced wins.
  - Dark + light theme parity (REQ-BIL-AS-NF-04).
- **Relevant skills**: `angular-developer`, `ui-ux-pro-max`, `frontend-design`.

---

### T-BIL-AS-10 — Lazy route + ineligibility redirect

- **Status**: `completed` (2026-05-22)
- **Size**: S
- **Depends on**: T-BIL-AS-06, T-BIL-AS-07.
- **Discharges ACs**: AC-01.2 (direct-URL ineligibility redirect).
- **Touches**:
  - `src/app/app.routes.ts` *(add child route under `/result/:id`)*
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.ts` *(extend OnInit with redirect)*
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.spec.ts` *(extend)*
- **Summary**: Register the new child route `/result/:resultCode/pool-funding-alignment` in `app.routes.ts` with `loadComponent` + `.then(m => m.default)` per the existing 11-tab convention, with `data: createResultData()`. In the component's OnInit, after `getAlignment(resultCode)` resolves, if `eligible === false`, redirect to `/result/:resultCode/general-information` via `router.navigate(..., { replaceUrl: true })`. No route guard — eligibility check is component-local (decision recorded in [`./design.md` §11](./design.md#11-design-decisions-decision-record) 2026-05-20).
- **Implementation notes**:
  - Route snippet per [`./design.md` §4.1](./design.md#41-routes). Place alphabetically near `partners` / `policy-change` in the children array; child order does not affect sidebar order (sidebar drives navigation, not the routes file).
  - Redirect uses `replaceUrl: true` so the back button skips the alignment URL and returns the user to wherever they came from.
  - **Race guard**: if the GET fails (network error, `currentAlignment === null` after the await), do NOT redirect blindly. Show a "Could not load alignment — please refresh" message per [`./design.md` §6.5](./design.md#65-empty-data-on-get-success) and leave the route as-is. Avoid trapping the user in a redirect loop.
  - Sidebar visibility (T-BIL-AS-06) prevents most users from ever hitting this code path; this is defense for bookmarks / direct-link sharing.
- **Tests to add/update**:
  - `pool-funding-alignment.component.spec.ts` extension — 3 cases:
    1. `getAlignment` resolves with `eligible = true` → no redirect, component renders.
    2. `getAlignment` resolves with `eligible = false` → `router.navigate(['/result', resultCode, 'general-information'], { replaceUrl: true })` called once.
    3. `getAlignment` returns null (network error) → no redirect, "could not load" message rendered, no infinite loop.
  - Route config test (if `app.routes.spec.ts` exists): assert `pool-funding-alignment` child route registered with `data` and lazy `loadComponent`.
- **Done when**:
  - Direct URL navigation to an eligible result → renders.
  - Direct URL navigation to an ineligible result → redirects to general-information (verify URL history is replaced, not pushed).
  - Build emits a separate lazy chunk for the new component (`dist/` size delta ≤ 30 KB gzipped — REQ-BIL-AS-NF-03).
- **Relevant skills**: `angular-developer`.

---

### T-BIL-AS-11 — Real-time reconcile via `result.pool-funding-alignment.changed` Socket.IO event

- **Status**: `completed` (2026-05-22) — Toast is a plain info toast (no Refresh action button), per OI-AS-3: `ActionsService.showToast` doesn't accept an `actions` array. Behavior matches the design's fallback intent — user can manually navigate away/back or rely on the 409 safety net on next save.
- **Size**: M
- **Depends on**: T-BIL-AS-07.
- **Discharges ACs**: AC-11.1, AC-11.2, AC-11.3, AC-11.5. AC-11.4 explicitly NOT addressed (resolves **OQ-AS-4**).
- **Touches**:
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.ts` *(extend OnInit + OnDestroy)*
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.spec.ts` *(extend)*
- **Summary**: Subscribe to `result.pool-funding-alignment.changed` via the existing `WebsocketService.listen(event)` in OnInit, filtered to `payload.result_code === resultCode()`. On a matching event, branch on `isDirty()`: clean → silently refetch (`bilateralService.getAlignment(resultCode)`); dirty → show an info toast with a "Refresh" action that refetches on click + resets form state to server. Unsubscribe cleanly in OnDestroy. Uses `takeUntilDestroyed()` as defense-in-depth against navigation races (R-3).
- **Implementation notes**:
  - Subscription wiring per [`./design.md` §4.4.3](./design.md#443-extended--websocketservice) and [`./design.md` §7](./design.md#7-real-time-considerations):
    ```ts
    private destroyRef = inject(DestroyRef);

    ngOnInit(): void {
      // ... existing init ...
      this.websocketService
        .listen<AlignmentChangedEvent>('result.pool-funding-alignment.changed')
        .pipe(
          filter(evt => evt.result_code === this.resultCode()),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(evt => this.handleRemoteChange(evt));
    }

    private handleRemoteChange(_evt: AlignmentChangedEvent): void {
      if (!this.isDirty()) {
        void this.bilateralService.getAlignment(this.resultCode());
        return;
      }
      this.actions.showToast({
        severity: 'info',
        summary: 'Alignment updated',
        detail: 'Another user updated this alignment. Refresh to see the latest.',
        sticky: true,
        actions: [{ label: 'Refresh', onClick: () => this.refreshFromRemote() }]  // exact API depends on actions.service shape — confirm during impl
      });
    }

    private async refreshFromRemote(): Promise<void> {
      await this.bilateralService.getAlignment(this.resultCode());
      // the seeding `effect` from T-BIL-AS-07 resets form state automatically
    }
    ```
  - **`actions.showToast` API for sticky + action**: confirm during impl whether `ActionsService` supports `actions:` array. If not, fall back to a sticky info toast with the user manually clicking elsewhere to refresh — flag in PR description and reopen as a follow-up if the UX feels broken. The handoff `actions` service may need a small extension; **do NOT expand scope** without flagging.
  - **`takeUntilDestroyed`** + the parent `result.component.ts` re-mount on version change naturally re-creates the subscription. R-3 mitigated.
  - **No polling-on-focus** in v1 — accepted in [`./design.md` §11](./design.md#11-design-decisions-decision-record) 2026-05-20. If real-world telemetry shows confusion, reopen.
  - Reconcile completes within 2 s under normal conditions (AC-11.5) — the refetch is a single GET; meeting NF-01 trivially.
- **Tests to add/update**:
  - `pool-funding-alignment.component.spec.ts` extension — 5 cases:
    1. OnInit subscribes to `result.pool-funding-alignment.changed`.
    2. Event with matching `result_code` and clean form → `getAlignment` called once.
    3. Event with matching `result_code` and dirty form → info toast fired with the "Refresh" action; `getAlignment` NOT called automatically.
    4. Event with non-matching `result_code` → no refetch, no toast (filter works).
    5. OnDestroy — subscription cleaned via `DestroyRef` (assert via a manually emitted post-destroy event that the handler is not called).
- **Done when**:
  - Manual smoke: open two browser tabs on the same eligible result → edit in tab A (Save) → tab B receives event and auto-refreshes the section.
  - Manual smoke: dirty form in tab B → save in tab A → tab B shows the info toast with Refresh; clicking Refresh resets the form to the latest server state.
  - No leak: tab navigation away from the alignment tab cleanly unsubscribes (DevTools "Memory" tab snapshot stable; ad-hoc).
- **Relevant skills**: `angular-developer`, `error-handling-patterns`, `systematic-debugging`.

---

### T-BIL-AS-12 — Telemetry — `bilateral.alignment.viewed` + `bilateral.alignment.saved`

- **Status**: `completed` (2026-05-22) — `viewed` fires per mount on the eligible path (not session-deduped — accepted simplification matching "section opened" semantics). `remote_change_received` skipped (optional per the task; reopen if cross-tab telemetry is needed).
- **Size**: S
- **Depends on**: T-BIL-AS-07, T-BIL-AS-08.
- **Discharges ACs**: requirements §11 (telemetry & observability).
- **Touches**:
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.ts` *(extend)*
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.spec.ts` *(extend)*
- **Summary**: Fire two (optionally three) Clarity events via the existing `ClarityService.trackEvent` (or whichever method the service exposes — confirm during impl). One on first tab open per result per session (`bilateral.alignment.viewed`); one on successful PATCH (`bilateral.alignment.saved`). Optionally `bilateral.alignment.remote_change_received` on socket events for THIS result — log only if low-noise. All payloads exclude PII; result codes are not PII per current PRD guidance.
- **Implementation notes**:
  - **First step**: read the existing tracking service to confirm the API and naming convention. Tag-visibility T-BIL-TV-11 already established the pattern — mirror it (`bilateral.tag.override.saved` precedent).
  - **`viewed` fires once per result per session**: guard with a small `Set<string>` of seen `result_code`s on the service or component-scoped flag. Don't double-fire on re-renders.
  - **`saved` fires after `patchAlignment` returns `{ ok: true }` and BEFORE the success toast** so suppression of the toast in any future env doesn't dampen the metric.
  - **Payloads**:
    - `viewed`: `{ result_code, eligible, has_contribution, is_read_only }`.
    - `saved`: `{ result_code, has_contribution, lever_count, has_justification }` (booleans/integers only).
    - `remote_change_received` (optional): `{ result_code }`.
  - Reuse the existing service injection — no new dependency.
- **Tests to add/update**:
  - `pool-funding-alignment.component.spec.ts` extension — 3 cases:
    1. On first init for a `result_code` → `viewed` event fired with right payload.
    2. On second init for the same `result_code` in the same session → `viewed` NOT fired again.
    3. On Save 200 → `saved` event fired with `lever_count` = current selection length and `has_justification` = boolean.
- **Done when**:
  - Manual: events visible in Clarity custom-events log.
  - No PII shipped (review the payload values).
- **Relevant skills**: `angular-developer`.

---

### T-BIL-AS-13 — Regression test — alignment is NOT in the submission validator (AR.3)

- **Status**: `completed` (2026-05-22) — submission-validator side done. Sidebar-side assertion deferred into T-BIL-AS-06 (where the new `SidebarOption` actually exists).
- **Size**: S
- **Depends on**: none.
- **Discharges ACs**: AC-09.1, AC-09.2.
- **Touches**:
  - `src/app/shared/services/cache/submission.service.spec.ts` *(extend — or whichever spec covers the submission validator; confirm during impl)*
  - `src/app/shared/components/result-sidebar/result-sidebar.component.spec.ts` *(extend — assert `greenChecks` map untouched by alignment)*
- **Summary**: Lock in AR.3 (alignment is not part of the submission validator) with a regression test that asserts: (1) empty alignment (`has_contribution = null` or `false`) does not block the existing submission flow; (2) the `greenChecks` map driving sidebar completion counters does not include `pool_funding_alignment`. Pure test addition; no production code changes. If a future contributor adds alignment to the validator, the test fires.
- **Implementation notes**:
  - **First step**: locate the submission-validator code path. Grep `submitResult`, `canSubmit`, `validateSubmission`, `submissionService`. If the validator is purely server-side (no client-side gate), document that in a `// AR.3 — server is authoritative; client does not pre-validate alignment` comment near the submit button and skip the spec test — close the loop with a `design.md` decision row.
  - If a client-side validator exists, add a fixture case: result with `pool_funding_alignment_eligible = true && has_contribution = null` → submission proceeds.
  - **Sidebar `greenChecks` assertion**: in `result-sidebar.component.spec.ts`, assert that the alignment option does not contribute to `greenChecks` (the option's `greenCheckKey` may not be present in the backend response — which is what we want; AR.3).
  - Add a comment in the test: `// AR.3 — alignment is NOT part of the submission validator. See bilateral-module/alignment-section/requirements.md REQ-BIL-AS-09.`
- **Tests to add/update**:
  - Per above: 1 spec assertion in `submission.service.spec.ts` (or equivalent), 1 in `result-sidebar.component.spec.ts`.
- **Done when**:
  - Regression test runs green.
  - If no client-side validator exists, a `design.md` decision row records the audit + reasoning.
- **Relevant skills**: `angular-developer`, `systematic-debugging`.

---

### T-BIL-AS-14 — Constitutional docs update

- **Status**: `completed` (2026-05-23)
- **Size**: S
- **Depends on**: T-BIL-AS-10 (final shape known after the route lands), T-BIL-AS-09 (final visual surface), T-BIL-AS-11 (final socket surface).
- **Discharges ACs**: documentation drift policy from root [`CLAUDE.md`](../../../../CLAUDE.md).
- **Touches**:
  - `docs/system-design/design.md` *(append decisions in §12; note the new `'pf-synced'` STATUS_COLOR_MAP entry in §7 if appropriate)*
  - `docs/detailed-design/detailed-design.md` *(add the new alignment route to §2 modules, the new ApiService methods to §4, the new `BilateralService` signals + `editable` computed to §6, and the socket event subscription to §6.4)*
- **Summary**: Update the two living blueprint docs so reality and documentation don't drift, per the root CLAUDE.md drift policy. Append-only entries; never delete prior history. Mirrors the precedent landed in T-BIL-TV-12.
- **Implementation notes**:
  - **System-design §12**: append decision rows summarizing the four design decisions from this spec's §11 (sidebar position, `'pf-synced'` token reuse, banner placement, no socket-down polling fallback).
  - **System-design §7**: only update if the new `STATUS_COLOR_MAP` entry warrants a mention; the underlying token is unchanged (`--ac-grey-700`). Likely a single-line note: "Pool Funding synced badge uses `'pf-synced'` (grey-700)."
  - **Detailed-design §2**: append the alignment route entry under the result-detail-page module.
  - **Detailed-design §4**: append the two new ApiService methods (one-line each).
  - **Detailed-design §6**: append `BilateralService.currentAlignment`, `loadingAlignment`, `savingAlignment`, `editable` to the services inventory; note that `CurrentResultService.isCurrentUserOwner()` is the ownership source (if added in T-BIL-AS-03).
  - **Detailed-design §6.4**: append the new socket event `result.pool-funding-alignment.changed` to the real-time events list.
  - Keep entries terse — these are catalogs, not narratives.
- **Tests to add/update**:
  - None (docs-only).
- **Done when**:
  - Both blueprint docs read accurately for someone arriving cold after this spec ships.
  - PR diff includes only the new entries, no reformatting of prior content.
- **Relevant skills**: `frontend-design` (for design-decisions framing).

---

## 5. Testing expectations (global rules)

- Use Jest via `jest-preset-angular`. Run with `npm run test` from `research-indicators/`. Watch: `npm run test:watch`. Coverage: `npm run test:coverage`.
- Co-locate `.spec.ts` next to the subject. Use shared fixtures under `src/app/testing/`. Build new fixtures only if existing ones do not cover the needed shape (`AlignmentResponseFixture` is new — add to `src/app/testing/fixtures/bilateral.fixtures.ts` or wherever bilateral fixtures live after tag-visibility).
- Service tests use `HttpTestingController` and assert on the `MainResponse<T>` envelope.
- Component tests cover role-conditional rendering — editor vs. non-editor, eligible vs. ineligible, synced vs. not-synced.
- Mirror server-side validation in component-level form tests — the `has_contribution=true && lever_codes=[]` gate is the canonical example.
- Dark-mode parity — for the synced badge and both banners, add a visual-state assertion in both themes.
- Coverage floors from [`jest.config.ts`](../../../../research-indicators/jest.config.ts) (`statements 40 / branches 20 / lines 45 / functions 30`) must not regress. Local targets: services ≥ 90% statements (REQ-BIL-AS-NF-06), new component ≥ 70%.

---

## 6. Execution conventions

- **One task per PR by default.** T-BIL-AS-07 + T-BIL-AS-08 + T-BIL-AS-09 may bundle if reviewable together (they touch the same component) — record the bundling decision in PR description and in [`./design.md` §11](./design.md#11-design-decisions-decision-record).
- **PR title**: `<type>(bilateral): <short description>` — e.g. `feat(bilateral): add Pool Funding Alignment tab`. Match repo convention from recent commits (`✨ feat(bilateral-module): ...`, `📝 docs(bilateral-module): ...`, `✅ test(bilateral-module/...): ...`).
- **PR description** references:
  - This spec folder.
  - The task ID(s) discharged.
  - The AC IDs covered.
  - Manual smoke results from the matrix in [`./design.md` §12.4](./design.md#124-manual-smoke-pr-review).
- **Pre-merge gates**:
  - CI green: `unit-tests.yml`, `sonarcloud-analysis.yml`.
  - `ng build` does not warn beyond baseline budgets (PRD C-5; ≤ 30 KB lazy / ≤ 5 KB initial — REQ-BIL-AS-NF-03).
  - Manual smoke of every affected surface in both light and dark themes.
  - WCAG 2.1 AA self-check on every new visual (REQ-BIL-AS-NF-02).
- **Post-merge**:
  - Mark task `completed` in this file.
  - If the spec is fully done (all 14 tasks `completed`), update [`./requirements.md`](./requirements.md) §1 Document control with the merge date.

---

## 7. Rollout & feature flags

- **No client-side feature flag.** The backend env vars (`ARI_BILATERAL_MODULE_ENABLED`, etc.) gate the API. When the backend flag is off, the GET endpoint is absent → the sidebar's eligibility-aware filter keeps the tab hidden indefinitely.
- **Rollout sequence**: dev → staging → production.
  - **Dev**: build, smoke against local backend with `ARI_BILATERAL_MODULE_ENABLED=true`. Verify both endpoints respond. Smoke through the editor + non-editor + synced flows.
  - **Staging**: deploy after dev verification. Smoke socket reconcile across two browser tabs.
  - **Production**: deploy after staging confirmation. No data migration. Feature lights up automatically when the backend production flag turns on.
- **Coordination with backend**: confirm both endpoints (`GET .../pool-funding-alignment`, `PATCH .../pool-funding-alignment`) and the socket event emitter are deployed before T-BIL-AS-01 lands. Coordinate with the AC-1594 backend ticket owner.

---

## 8. Rollback plan

- **Per task**: standard `git revert` of the PR.
- **For T-BIL-AS-10 (route)**: removing the route entry from `app.routes.ts` makes the tab unreachable without rebuilding the rest. Safe to revert independently of the service / component code.
- **For T-BIL-AS-06 (sidebar entry)**: reverting hides the tab from the sidebar; reverting the route too makes it fully inaccessible. Coordinate the revert order: sidebar → route (or both together).
- **For T-BIL-AS-04 (interceptor exception)**: reverting causes 400s on `/pool-funding-alignment` to toast generically — non-fatal, just visually less specific. Tolerable as a transitional state.
- **For T-BIL-AS-11 (socket subscription)**: reverting drops real-time reconcile; users see stale state until manual refresh. Tolerable; the 409 path is the safety net for concurrent edits.
- **No backend contract changes initiated by this spec.** Backend rollback decisions are independent.
- **Coordinate with backend team if** the PATCH starts producing unexpected 4xx/5xx in production — the inline-error + 409 paths tolerate it but a noisy rate could indicate a backend regression.

---

## 9. Open items

- **OI-AS-1 — Indicator panel + per-`indicator_type` contribution forms.** Out of scope per [`./requirements.md` §4.2](./requirements.md#42-out-of-scope). Ships in the sibling spec [`../indicator-mapping/`](../indicator-mapping/).
- **OI-AS-2 — Polling-on-focus fallback when socket is down (AC-11.4).** Resolved as "not in v1" in [`./design.md` §7.4](./design.md#74-degradation-when-socket-is-down). Reopen if telemetry shows users hitting stale-state confusion frequently. Would live as a small follow-up patch under this spec folder rather than a new spec.
- **OI-AS-3 — `actions.showToast` sticky-toast-with-action API.** If `ActionsService` doesn't support an `actions` array on the toast (T-BIL-AS-11), fall back to a plain sticky info toast and reopen the action-bearing UX as a follow-up. Don't expand scope during this spec.
- **OI-AS-4 — Server `errorDetail.errors` shape for inline 400 errors.** `extractFieldErrors` in T-BIL-AS-02 assumes a `{ field, message }[]` shape. Confirm with the backend handoff; if the shape differs, extend the parser without changing the discriminated union API surface to the component.
- **OI-AS-5 — PRMS push UI (US5), W3 Registry sync UI (US6), SP ToC sync UI (US7).** Out of scope per [`./requirements.md` §4.2](./requirements.md#42-out-of-scope). Backend PENDING; each will land in its own future spec.
- **OI-AS-6 — `innovation_use` indicator type.** Deferred per D5=C in the proposal; no backend handler today. Reopen if business reverses the decision.

---

## 10. Task ID index

| ID | Title | Size | Depends on | Status |
| --- | --- | --- | --- | --- |
| T-BIL-AS-01 | Add alignment interfaces + extend `ApiService` | S | — | completed |
| T-BIL-AS-02 | Extend `BilateralService` with alignment state + `editable` computed | M | T-BIL-AS-01, T-BIL-AS-03 | completed |
| T-BIL-AS-03 | Verify or add `CurrentResultService.isCurrentUserOwner()` | S | — | completed |
| T-BIL-AS-04 | Extend `httpErrorInterceptor` with `/pool-funding-alignment` URL exception | S | — | completed |
| T-BIL-AS-05 | Add `'pf-synced'` entry to `STATUS_COLOR_MAP` | XS | — | completed |
| T-BIL-AS-06 | Extend `ResultSidebarComponent` with alignment entry + visibility filter | M | T-BIL-AS-02 | completed |
| T-BIL-AS-07 | `PoolFundingAlignmentComponent` base — view + edit form | L | T-BIL-AS-02, T-BIL-AS-03, T-BIL-AS-05 | completed |
| T-BIL-AS-08 | Save flow — 200 / 400 / 409 handling + inline errors | M | T-BIL-AS-04, T-BIL-AS-07 | completed |
| T-BIL-AS-09 | Read-only states — synced + non-editor banners + Save hide | M | T-BIL-AS-05, T-BIL-AS-07 | completed |
| T-BIL-AS-10 | Lazy route + ineligibility redirect | S | T-BIL-AS-06, T-BIL-AS-07 | completed |
| T-BIL-AS-11 | Real-time reconcile via Socket.IO event | M | T-BIL-AS-07 | completed |
| T-BIL-AS-12 | Telemetry — `bilateral.alignment.viewed` + `bilateral.alignment.saved` | S | T-BIL-AS-07, T-BIL-AS-08 | completed |
| T-BIL-AS-13 | Regression test — alignment NOT in submission validator (AR.3) | S | — | completed |
| T-BIL-AS-14 | Constitutional docs update | S | T-BIL-AS-09, T-BIL-AS-10, T-BIL-AS-11 | completed |

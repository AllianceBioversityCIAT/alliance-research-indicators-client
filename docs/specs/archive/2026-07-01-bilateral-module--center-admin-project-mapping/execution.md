# Execution Log — Center Admin: Bilateral Project Mapping

> Canonical audit trail of the JCSPECS Leader → Implementer → Reviewer loop for `docs/specs/bilateral-module/center-admin-project-mapping/`. Appended per loop iteration.

## 1. Document Control

| Field | Value |
| --- | --- |
| Spec path | `bilateral-module/center-admin-project-mapping` |
| Branch | `AC-1594-bilateral-module` |
| Backend contract source | `alliance-research-indicators-main` @ `AC-1594-bilateral-module-v2` (verified from source + runtime, 2026-07-01) |
| Started | 2026-07-01 |

---

## 2. Task Execution History

### T-BIL-CAM-01 — Add interfaces + `ApiService` methods — ✅ PASS (attempt 1)

- **Date:** 2026-07-01
- **Attempts:** 1
- **Requirements covered (enabling):** AC-03.1, AC-04.1, AC-05.4, AC-06.2, AC-07.1
- **Pre-work (Leader):** Resolved OQ-1 by reading the backend module source (`bilateral-project-mapping` controller + DTOs, `clarisa-projects` controller, `main.routes.ts`) — confirmed CRUD base `bilateral-project-mappings`, list `{items,meta}` envelope, CLARISA picker `tools/clarisa/projects/bilateral`, AGRESSO picker via existing `GET_FindContracts`. Backend team later confirmed at runtime (409 message in `errorDetail.errors`, POST-only; CLARISA under CENTER_ADMIN/SYSTEM_ADMIN guard). Spec docs updated with these findings.

**Attempt 1**
- **Implementer** (general-purpose):
  - Files changed:
    - NEW `research-indicators/src/app/shared/interfaces/bilateral/bilateral-project-mapping.interface.ts` (8 types)
    - EDIT `research-indicators/src/app/shared/services/api.service.ts` (+6 methods, +1 import block, `@sdd-spec` comment)
  - Verification: `npm run lint` → "All files pass linting."; `npm run build` → exit 0 (bundle complete ~9.8s). Pre-existing unrelated `CreateOicrFormComponent` template warning noted, non-fatal.
  - Notes: OQ-1 paths pre-confirmed by Leader; kept `clarisa_project_short_name?` on Create/Update bodies (whitelisted server-side — safe superset of design §2 sketch).
- **Reviewer** (read-only, retry after first reviewer agent died without a verdict):
  - **STATUS: PASS.** Six methods + interfaces match the authoritative contract exactly — correct relative paths (incl. `tools/` CLARISA prefix, no `/api`/`v1`), correct query serialization with empty-param omission, `MainResponse<T>` typing, `forbidNonWhitelisted`-safe bodies (`UpdateBilateralMappingBody` excludes `agresso_agreement_id`), full idiom parity with `PATCH_PoolFundingTag`. Purely additive, path-alias-based, `npm run lint` re-run clean. Non-blocking note: inline param map instead of the find-contracts-specific `buildFindContractsParams` helper (correct).
- **Decisions:** none beyond the pre-confirmed contract; `clarisa_project_short_name?` retained on bodies as a whitelisted superset.
- **Final verification:** `npm run lint` clean (Implementer + Reviewer re-run); `npm run build` exit 0.
- **Outcome:** PASS on attempt 1 → task `[x]`.

---

### T-BIL-CAM-02 — `BilateralMappingService` (data access + result objects) — ✅ PASS (attempt 1)

- **Date:** 2026-07-01
- **Attempts:** 1
- **Requirements covered:** AC-03.3, AC-05.5, AC-05.6, AC-06.3, AC-07.3, REQ-BIL-CAM-NF-06

**Attempt 1**
- **Implementer** (general-purpose):
  - Files (both NEW): `research-indicators/src/app/shared/services/bilateral-mapping.service.ts`, `.../bilateral-mapping.service.spec.ts` (15 tests).
  - Service: `@Injectable({providedIn:'root'})`, injects `ApiService`; `list`/`get` → data|null; `create`/`update`/`deactivate` → `MappingMutationResult<T>` union; `loadAgressoOptions` (maps `GET_FindContracts({'pool-funding-contributor':true})`, drops missing `agreement_id`, `[]` on failure); `loadClarisaProjectOptions` (`[]` on failure). Private `extractApiError` = `errorDetail.errors → description → ''`.
  - Verification: `npm run test -- bilateral-mapping.service` → 15/15 passed; `npm run lint` clean.
  - Notes: mocked `ApiService` via `{provide:ApiService,useValue:mockApi}` (no HttpTestingController — service delegates to ApiService). 409 message read from `errorDetail.errors`.
- **Reviewer** (read-only): **STATUS: PASS.** `extractApiError` resolves `errorDetail.errors → description → ''`, never the `ConflictException` class name; spec asserts the 409 errors-not-exception-name guard + all read/mutation/picker branches; no T-01 files/interfaces/tsconfig touched; re-ran `npm run test -- bilateral-mapping.service` green (15/15).
- **Outcome:** PASS on attempt 1 → task `[x]`.

---

### T-BIL-CAM-03 — List page (table, search, filters, pagination) — ✅ PASS (attempt 1)

- **Date:** 2026-07-01
- **Attempts:** 1
- **Requirements covered:** AC-03.1..03.4, AC-04.1..04.4, NF-01, NF-02, NF-04, NF-06

**Attempt 1**
- **Implementer** (frontend-developer):
  - Files (NEW): `.../administration/center-admin/bilateral-mapping/bilateral-mapping.component.{ts,html,scss,spec.ts}` (component 159 LOC, spec 19 tests).
  - Standalone `default export` `OnPush` `app-bilateral-mapping`; consumes `BilateralMappingService.list()`; signals for rows/meta/loading/loadError/search/activeFilter/sourceFilter/page/limit(20). `p-table` + `p-paginator` (server-side, 0→1-based conversion) + `pInputText` search (RxJS `debounceTime(300)`, `takeUntil(destroy$)`) + two `p-select` filters. Confidence column via `showConfidence()` = `source !== 'MANUAL'`. loading/error(+Retry, `role="alert"`)/empty/table states.
  - Colors fully tokenized (`var(--ac-*)`, `atc-*`/`abc-*`) — zero hex; `SelectModule` per repo standard; `DecimalPipe`+`DatePipe` imported.
  - Verification: `npm run test -- bilateral-mapping.component` → 19/19; `npm run lint` clean; new SCSS stylelint-clean (the ~350 `s-lint` errors are pre-existing, unrelated files).
- **Reviewer** (read-only): **STATUS: PASS.** All ACs discharged; confidence-hidden-for-MANUAL correct; `meta`-driven server pagination with 0→1 conversion; `role="alert"` + Retry; explicit empty state; zero hex / no `isDarkMode` (tokens verified defined); debounce cleaned on destroy; 19/19 reproduced; no route/sidebar/T-01–02 changes.
- **Outcome:** PASS on attempt 1 → task `[x]`.

---

### T-BIL-CAM-04 — Route + sidebar entry + guard — ✅ PASS (attempt 1)

- **Date:** 2026-07-01
- **Attempts:** 1
- **Requirements covered:** AC-01.1, AC-01.2, AC-01.3, AC-02.1, AC-02.2

**Attempt 1**
- **Implementer** (general-purpose):
  - Files: `app.routes.ts` (+ lazy route `administration/center-admin/bilateral-mapping`, `canMatch:[centerAdminGuard]`, `data.title`), `alliance-sidebar.component.ts` (+ `Bilateral Mapping` child in the `center-admin` group, `{label,link,icon:'pi-sitemap',iconSize:'13px'}`), `alliance-sidebar.component.spec.ts` (+2 tests: present-for-admin, hidden-for-non-admin).
  - Verification: `npm run lint` clean; `npm run test -- alliance-sidebar` 26/26; `npm run build` OK (component emitted as lazy chunk).
- **Reviewer** (read-only): **STATUS: PASS.** Route + sidebar faithfully mirror the `sdg-management` idiom; target default-export component exists; block gated by `canAccessCenterAdmin()` (no leakage); minimal self-contained diff; spec (26 passed) verifies admin visibility + non-admin hiding.
- **Outcome:** PASS on attempt 1 → task `[x]`.

---

### T-BIL-CAM-05 — Create/edit dialog with AGRESSO + CLARISA pickers — ✅ PASS (attempt 1)

- **Date:** 2026-07-01
- **Attempts:** 1 (first Reviewer agent died on a transient API ECONNRESET before emitting a verdict; a second Reviewer completed the audit — implementation itself was never reworked)
- **Requirements covered:** AC-05.1..05.6, AC-06.1..06.4

**Attempt 1**
- **Implementer** (frontend-developer):
  - Files (all MODIFIED, extending T-03): `bilateral-mapping.component.{ts,html,scss,spec.ts}` (component 373 LOC, html 395, spec 45 tests).
  - "New mapping" button + per-row Edit → `p-dialog`. Create: lazy `p-select` pickers (AGRESSO `{agreement_id,description}`, CLARISA `{id,short_name,science_programs}`) + read-only SP allocation preview + notes (500-cap); Save enabled only when both pickers set. Edit: pre-filled, AGRESSO read-only field, Save enabled only when dirty (snapshot compare), sends only changed fields. Success → `showToast` + list reload + Clarity `bilateral.mapping.created`/`.updated`. 409/400 → inline `role="alert"` from `result.message` (never the exception name); 409 keeps dialog open, no duplicate.
  - Colors tokenized (error affordance: `atc-red-1` text + `pi-exclamation-triangle` + `--ac-red-1` border; `--ac-grey-*` surfaces). Zero hex.
  - Verification: `npm run test -- bilateral-mapping.component` 45/45; `npm run lint` clean; scss stylelint clean.
- **Reviewer** (read-only, 2nd agent): **STATUS: PASS.** All create/edit ACs discharged; `result.message` errors-first (never `ConflictException`); zero hex + valid red-token error affordance; `NO_ERRORS_SCHEMA` does NOT hollow the T-03 DOM assertions (real native-element queries still pass); T-03 behavior/scope preserved; 45/45 + clean lint reproduced. Minor non-blocking: (a) whitespace-only notes edit can send a no-op `notes`; (b) update `trackEvent` omits `agresso_agreement_id` (telemetry payload is guidance). Neither warrants rework.
- **Outcome:** PASS → task `[x]`.

---

### T-BIL-CAM-06 — Deactivate with confirmation — ✅ PASS (attempt 1)

- **Date:** 2026-07-01
- **Attempts:** 1
- **Requirements covered:** AC-07.1, AC-07.2, AC-07.3

**Attempt 1**
- **Implementer** (frontend-developer):
  - Files (MODIFIED): `bilateral-mapping.component.{ts,html,spec.ts}` (+52/+16/+184; no scss change). 54 tests total (45 prior + 9 new).
  - Per-row Deactivate button (`@if (row.is_active)`, `aria-label`, `p-button-danger`/`pi-ban`). `requestDeactivate` → `ActionsService.showGlobalAlert({severity:'confirm', confirmCallback:{event}})` (D-6a, no p-confirmdialog); request fires only in the confirm callback. `confirmDeactivate` → `service.deactivate(id)`; `ok:true` → in-place `rows.update` sets `is_active=false` + success toast + Clarity `bilateral.mapping.deactivated`; `ok:false` → error toast with `result.message`, no throw.
  - Verification: `npm run test -- bilateral-mapping.component` 54/54; `npm run lint` clean.
- **Reviewer** (read-only): **STATUS: PASS.** Confirm-before-request verified (deactivate not called until callback runs; cancel no-ops); telemetry payload matches; button hidden for inactive rows; graceful error path; no hex / a11y label present; T-03/T-05 preserved; re-verified 54/54 + clean lint. `as unknown as string` telemetry casts cosmetic (consistent with T-05).
- **Outcome:** PASS on attempt 1 → task `[x]`.

---

### T-BIL-CAM-07 — Test hardening (test-only) — ✅ PASS (attempt 1)

- **Date:** 2026-07-01
- **Attempts:** 1
- **Requirements covered:** consolidation of AC-03..07 verification; AC-04.4 gap (AND-composition); coverage-floor guard

**Attempt 1**
- **Implementer** (general-purpose):
  - Files: NEW `research-indicators/src/app/testing/bilateral-project-mapping.fixture.ts` (`mockBilateralMapping`, `mockBilateralMappingListPage`, `mockClarisaBilateralProjectOption`); MODIFIED `bilateral-mapping.component.spec.ts` (+1 AC-04.4 AND-composition test using the fixture → 55 tests). No production code touched. Left the 15 service / 54 component existing tests as-is (avoid churn per task).
  - Full suite: `Tests: 1 failed, 5742 passed, 5743 total` — the 1 failure is a PRE-EXISTING, unrelated `multiselect.component.spec.ts` test (last touched in `e9d75b3d`, pre-session; our 6 commits never touched multiselect — Leader-verified via `git log d8f10092~1..HEAD -- .../multiselect/` = empty). Coverage: statements 99.11% / branches 97.95% / lines 99.42% / functions 98.61% — all floors (40/20/45/30) met with headroom. `npm run lint` clean.
- **Reviewer** (read-only): **STATUS: PASS.** Only test/fixture/docs changed; fixture correctly typed (`confidence_score:null`, sound `totalPages` math); AC-04.4 gap test substantive (single `list()` call `toEqual` `{page,limit,search,is_active(bool),source}`, cross-checked vs `load()`); feature specs green (component 55, service 15); multiselect failure pre-existing/out-of-scope; floors accepted.
- **Outcome:** PASS on attempt 1 → task `[x]`.
- **Known pre-existing issue (out of scope):** `multiselect.component.spec.ts` › "should handle setValue with new options" fails on this branch independent of this feature — recommend tracking separately.

---

### T-BIL-CAM-08 — Docs sync (page map + decisions) — ✅ DONE (Leader, docs-only)

- **Date:** 2026-07-01
- Done directly by the Leader (documentation, no production code; task lists no reviewable code).
- Changes: added the Bilateral Mapping page to `docs/detailed-design/detailed-design.md` §2 page map; finalized OQ-1/OQ-2 as resolved; recorded **OQ-POOL** (product-intent gap) in `requirements.md` and **R-7** in `design.md`; live-verified in testing env (page renders, list + create/deactivate working — user screenshots).
- **Outcome:** DONE → task `[x]`.

---

### T-BIL-CAM-09 — Default Status filter to "Active" (UX follow-up) — ✅ PASS (attempt 1)

- **Date:** 2026-07-01 · **Attempts:** 1 · Added post-close per user request (question 1 UX).
- **Implementer:** single production line `bilateral-mapping.component.ts:89` `signal<ActiveFilter>('all')`→`('active')` + 1 new test (initial `activeFilter()==='active'` and first `list()` carries `is_active:true`). `npm run test -- bilateral-mapping.component` 56/56; `npm run lint` clean.
- **Reviewer:** **STATUS: PASS.** Only the default value changed; new test substantive; no pre-existing assertion broken/weakened (filter tests `mockClear()` then set explicitly); 56/56 green; no token/tsconfig/alias violations.
- **Outcome:** PASS → `[x]`. The operational list now hides accumulated inactive/historical rows by default; All/Inactive remain selectable for audit.

---

### BUGFIX (post-archive, 2026-07-01) — AGRESSO picker showed only pool-funding contracts

- **Reported:** the "New Bilateral Mapping" AGRESSO Contract picker returned only a couple of contracts (the pool-funding-tagged ones: A511/D335/D527), not the mappable set.
- **Root cause:** `BilateralMappingService.loadAgressoOptions` filtered `GET_FindContracts({ 'pool-funding-contributor': true })` — this restricts to contracts ALREADY tagged as pool-funding, which is backwards (mapping is what should *make* a project pool-funding). Design error inherited from the React SSR reference page's `?pool-funding-contributor=true`.
- **Fix (PO decision: show bilateral contracts):** changed the filter to `{ 'exclude-pooled-funding': true }` → the picker now lists all BILATERAL (non-pooled) contracts as mapping candidates. Updated the two service-spec assertions. `bilateral-mapping.service.spec.ts` 15/15; `npm run lint` clean.
- **Note:** the picker still loads once on dialog open + client-side `p-select` filter (consistent with the CLARISA picker). If the bilateral contract count grows large, a follow-up could switch to server-side search-as-you-type (wire `p-select (onFilter)` → `loadAgressoOptions(term)`). Not needed now.

### BUGFIX #2 (post-archive, 2026-07-01) — picker perf: lazy server-side search

- **Reported:** clicking the AGRESSO picker took long to open, **blocked the screen**, and showed a double scrollbar — because BUGFIX #1 made it load ALL bilateral contracts at once (up to backend default limit 10,000) into a `p-select` that renders every option node client-side.
- **Fix (both pickers):** `loadAgressoOptions(search?, limit=50)` now uses the broad `query` param (LIKE over agreement_id + description + project_lead_description) + a `limit=50` cap. The component drives a debounced (`debounceTime(300)`+`distinctUntilChanged`, cleaned via `destroy$`) filter stream off the `p-select (onFilter)` event → `loadAgressoOptions(term)`; empty term reloads the initial 50. Per-picker `agressoOptionsLoading`/`clarisaOptionsLoading` signals; template `[scrollHeight]="'240px'"` (kills double scroll), `[loading]`, `[resetFilterOnHide]="true"`, truncated single-line labels with `title`. Same lazy pattern applied to the CLARISA picker (`GET_ClarisaBilateralProjects(search)` already supports it).
- **Verification:** `npm run test -- bilateral-mapping.component bilateral-mapping.service` 77/77; `npm run lint` clean; scss stylelint clean. **Reviewer PASS.**
- **Known minor (non-blocking):** with `[filter]="true"` + server `(onFilter)`, PrimeNG also client-filters by `filterBy` (agreement_id,description) — a term that only matched `project_lead_description` server-side could be hidden client-side (rare). If it ever matters, switch the AGRESSO picker to `p-autocomplete` (purpose-built for remote search, no client-filter conflict).

---

## 3. Summary — SPEC COMPLETE (9/9)

All eight tasks complete. The **Center Admin → Bilateral Mapping** feature ships an Angular native admin CRUD (list/search/filter/paginate + create/edit/deactivate) over the already-built `/api/bilateral-project-mappings` backend, gated to center/system admins, replacing the React SSR admin page. Live-verified in the testing environment (2026-07-01).

- **Tests:** service 15 + component 55 + sidebar role-gate + shared fixture; full suite 5742 passing (1 pre-existing unrelated `multiselect` failure, out of scope); coverage floors held (~99/98/99/98 vs 40/20/45/30).
- **Contract:** verified against backend source + runtime (`AC-1594-bilateral-module-v2`); 409 (POST-only) message read from `errorDetail.errors`; agreement immutable on edit.
- **Commits:** `d8f10092` (T-01) · `e81a3dcb` (T-02) · `edc4bf59` (T-03) · `2309d468` (T-04) · `3ab5a03f` (T-05) · `fee08362` (T-06) · `d6780323` (T-07) · this docs-sync commit (T-08).

### Open follow-ups (NOT part of this FE spec)
1. **OQ-POOL (HIGH, backend):** product intent is that a bilateral mapping should make the project show the "Contributing to Pool Funding" tag; today the tag (`agresso_contracts.is_pool_funding_contributor`) is decoupled from `bilateral_project_mapping`. Requires a backend change in `alliance-research-indicators-main` (auto-set flag on mapping create/deactivate, or derive the badge from an active mapping) + PO decision on interaction with the manual tag override. See requirements OQ-POOL / design R-7.
2. **OQ-DEPLOY:** confirm which branch the testing env tracks (endpoints live on `AC-1594-bilateral-module-v2`, not `main`).
3. **OQ-4:** retire the React SSR admin page `/admin/bilateral-project-mappings` after the Angular page is validated.
4. ~~**Optional FE UX:** default the Status filter to "Active"~~ — DONE in T-BIL-CAM-09.
6. **OQ-POOL brief for backend:** written to [`backend-handoff-oq-pool.md`](./backend-handoff-oq-pool.md) — hand to the backend session.
5. **Pre-existing (unrelated):** `multiselect.component.spec.ts` › "should handle setValue with new options" fails on this branch independent of this feature — track separately.

Ready for `/sdd-archive` once the branch PR is opened.

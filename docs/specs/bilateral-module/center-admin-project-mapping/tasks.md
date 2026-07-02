# Tasks — Center Admin: Bilateral Project Mapping

> Execution plan for `docs/specs/bilateral-module/center-admin-project-mapping/`. Pairs with [`requirements.md`](./requirements.md) and [`design.md`](./design.md). Domain **BIL** · feature **CAM**. Consumed by `/sdd-execute`.

---

## 1. Goal

Ship a native STAR-client **Center Admin → Bilateral Mapping** page that lists, searches/filters, creates, edits, and deactivates bilateral project mappings against the already-implemented backend, gated to center admins — replacing the React SSR admin page as the operator surface.

---

## 2. Pre-flight checklist

- [x] `requirements.md` and `design.md` exist and are reviewed.
- [ ] PRD personas/goals/constraints cited are still current.
- [ ] No conflicting in-flight spec under `docs/specs/bilateral-module/` (ToC/alignment specs are archived).
- [ ] Path alias `@platform/*` resolves the new page path in `tsconfig.json` / `jest.config.ts` (reuse existing alias; no new alias expected).
- [ ] **OQ-1 resolved** — live-verify the two picker endpoints + the list `{items,meta}` envelope against running backend Swagger (done in T-BIL-CAM-01).

---

## 3. Dependency graph

```
T-BIL-CAM-01 (verify contract + interfaces + ApiService methods, no deps)
    └─▶ T-BIL-CAM-02 (BilateralMappingService)
            ├─▶ T-BIL-CAM-03 (list page: table/search/filter/paginate)
            │        └─▶ T-BIL-CAM-05 (create/edit dialog + pickers)
            │                 └─▶ T-BIL-CAM-06 (deactivate + confirm)
            └─▶ T-BIL-CAM-04 (route + sidebar entry + guard)
T-BIL-CAM-07 (tests: service + component + role-gate)  ── depends on 02–06
T-BIL-CAM-08 (docs: detailed-design page-map + telemetry note, no code deps)
```

---

## 4. Tasks

---

### T-BIL-CAM-01 — Verify contract, add interfaces + `ApiService` methods

- **Status**: `completed`
- **Depends on**: none
- **Discharges ACs**: (enabling) AC-03.1, AC-04.1, AC-05.4, AC-06.2, AC-07.1
- **Touches**:
  - `research-indicators/src/app/shared/interfaces/bilateral/bilateral-project-mapping.interface.ts` (new)
  - `research-indicators/src/app/shared/services/api.service.ts`
- **Summary**: Confirm the live wire contract (OQ-1), then add the typed interfaces (design §2) and the `ApiService` methods: `GET_BilateralProjectMappings`, `GET_BilateralProjectMapping`, `POST_BilateralProjectMapping`, `PATCH_BilateralProjectMapping`, `PATCH_BilateralProjectMappingDeactivate`, `GET_ClarisaBilateralProjects` (reuse `GET_FindContracts` for AGRESSO).
- **Implementation notes**:
  - Verify against running backend Swagger: list envelope `{items,meta}` inside `MainResponse`; picker paths (`tools/clarisa/projects/bilateral`; AGRESSO via existing `GET_FindContracts({'pool-funding-contributor':true})`). Record findings in design §11 / requirements OQ-1.
  - URLs are relative to `mainApiUrl` (`/api/`) — no `v1` prefix for the mapping endpoints. Mutations pass `{ useResultInterceptor: true }` (see `PATCH_PoolFundingTag`, `api.service.ts:699`).
  - Serialize the list query omitting empty params (mirror `buildFindContractsParams`).
- **Tests to add/update**:
  - Unit: `api.service.spec.ts` (or the mapping service spec in T-07) — assert correct URL + params for each method.
- **Done when**:
  - Interfaces + methods compile; OQ-1 resolved and noted; `npm run lint` clean for changed files.
- **Relevant skills**: `angular-developer`, `api-design-principles`.

---

### T-BIL-CAM-02 — `BilateralMappingService` (data access + result objects)

- **Status**: `completed`
- **Depends on**: T-BIL-CAM-01
- **Discharges ACs**: AC-03.3, AC-05.5, AC-05.6, AC-06.3, AC-07.3, REQ-BIL-CAM-NF-06
- **Touches**:
  - `research-indicators/src/app/shared/services/bilateral-mapping.service.ts` (new)
- **Summary**: Thin service wrapping the `ApiService` methods: `list(query)`, `get(id)`, `create(body)`, `update(id,body)`, `deactivate(id)`, `loadAgressoOptions()`, `loadClarisaProjectOptions()`. Mutations return `{ ok, status, description, data? }` so the component branches on 400/409 declaratively (design §4.4, mirrors `BilateralService.patchTag`).
- **Implementation notes**:
  - Unwrap `MainResponse.data`; normalize the list `{items,meta}` in one place.
  - Never throw to the component on expected 400/409; translate to the result object. Generic 5xx/network → `{ ok:false }` with a safe description.
- **Tests to add/update**:
  - Unit: `bilateral-mapping.service.spec.ts` — `HttpTestingController` happy path for each method + **409** and **400** branches.
- **Done when**:
  - ACs pass in unit tests; lint clean; coverage not regressed.
- **Relevant skills**: `angular-developer`, `error-handling-patterns`.

---

### T-BIL-CAM-03 — List page: table, search, filters, pagination

- **Status**: `completed`
- **Depends on**: T-BIL-CAM-02
- **Discharges ACs**: AC-03.1, AC-03.2, AC-03.3, AC-03.4, AC-04.1, AC-04.2, AC-04.3, AC-04.4, REQ-BIL-CAM-NF-01, NF-04, NF-06
- **Touches**:
  - `research-indicators/src/app/pages/platform/pages/administration/center-admin/bilateral-mapping/bilateral-mapping.component.ts` (new)
  - `.../bilateral-mapping.component.html` · `.../bilateral-mapping.component.scss` (new)
- **Summary**: Standalone `OnPush` page (`default export`) with signal state, PrimeNG table + paginator, a debounced search box, and `is_active` / `source` filters. Renders columns per AC-03.1 (confidence only when source ≠ MANUAL), plus loading/empty/error states.
- **Implementation notes**:
  - Model after `sdg-management.component.ts` (signals + `load()` lifecycle) and its template's `@if (loading()) / @else if (error) / @else if (empty) / @else` structure.
  - Search/filter changes reset `page` to 1 (AC-04.4). Use PrimeNG `TableModule` + `PaginatorModule`, `InputTextModule`; status/source as `p-tag`/`CustomTagComponent`.
  - Theming via `--ac-*` tokens; verify dark parity.
- **Tests to add/update**:
  - Component: rows/empty/error render; search + each filter trigger a page-1 request with the right query.
- **Done when**:
  - Listed ACs pass; lint clean; dark/light parity verified; test suite green.
- **Relevant skills**: `angular-developer`, `ui-ux-pro-max`.

---

### T-BIL-CAM-04 — Route + sidebar entry + guard

- **Status**: `pending`
- **Depends on**: T-BIL-CAM-02 (page can be a stub until T-03 lands; wire route after component file exists)
- **Discharges ACs**: AC-01.1, AC-01.2, AC-01.3, AC-02.1, AC-02.2
- **Touches**:
  - `research-indicators/src/app/app.routes.ts` (center-admin block, ~lines 252–281)
  - `research-indicators/src/app/shared/components/alliance-sidebar/alliance-sidebar.component.ts` (`administrationGroups()` center-admin children, ~line 64)
- **Summary**: Add the lazy route with `canMatch:[centerAdminGuard]` and `data.title='Bilateral Mapping'`, and a new child entry in the center-admin nav group (label "Bilateral Mapping", icon e.g. `pi-link`/`pi-sitemap`).
- **Implementation notes**:
  - Follow the exact `loadComponent` idiom used for `sdg-management` (design §4.1).
  - Menu entry sits inside the existing `if (rolesService.canAccessCenterAdmin())` block so non-admins never see it (AC-01.2).
- **Tests to add/update**:
  - If a routes/sidebar spec exists, assert the guard on the path and role-conditional menu rendering; else cover role-gate in T-07 component test.
- **Done when**:
  - Eligible user reaches the page; non-eligible is redirected to `/home`; menu item hidden for non-admins; lint clean.
- **Relevant skills**: `angular-developer`.

---

### T-BIL-CAM-05 — Create/edit dialog with AGRESSO + CLARISA pickers

- **Status**: `pending`
- **Depends on**: T-BIL-CAM-03
- **Discharges ACs**: AC-05.1, AC-05.2, AC-05.3, AC-05.4, AC-05.5, AC-05.6, AC-06.1, AC-06.2, AC-06.4
- **Touches**:
  - `.../bilateral-mapping/bilateral-mapping.component.ts` / `.html`
  - (optional) `.../bilateral-mapping/bilateral-mapping-form.component.ts` if the template grows
- **Summary**: PrimeNG `Dialog` for create + edit. Two pickers (AGRESSO contract, CLARISA project with SP-allocation preview) + notes. Create sends `{agresso_agreement_id, clarisa_project_id, notes?}` (source defaults MANUAL server-side); edit PATCHes only changed fields. Save disabled until valid (create) / dirty (edit); success → toast + list refresh; 409 → conflict message; 400 → surface `description`.
- **Implementation notes**:
  - Load picker options lazily when the dialog opens (design §8). AGRESSO options from `GET_FindContracts({'pool-funding-contributor':true})`; CLARISA options from `GET_ClarisaBilateralProjects()`.
  - Prefer wrapped custom-field select where it fits; raw `p-autocomplete`/`p-select` allowed (D-8a). Notes length cap (mirror 500-char pattern).
  - Fire Clarity `bilateral.mapping.created` / `.updated` on success.
- **Tests to add/update**:
  - Component: Save disabled until both pickers set (create) / until dirty (edit); success refresh; **409** create surfaces conflict; 400 surfaces server description.
- **Done when**:
  - Listed ACs pass; lint clean; dark/light parity; suite green.
- **Relevant skills**: `angular-developer`, `ui-ux-pro-max`.

---

### T-BIL-CAM-06 — Deactivate with confirmation

- **Status**: `pending`
- **Depends on**: T-BIL-CAM-05
- **Discharges ACs**: AC-07.1, AC-07.2, AC-07.3
- **Touches**:
  - `.../bilateral-mapping/bilateral-mapping.component.ts` / `.html`
- **Summary**: Row-level Deactivate action that confirms via `ActionsService.showGlobalAlert` (confirm/cancel callbacks — D-6a), fires `PATCH :id/deactivate`, updates the row to inactive on success, fires Clarity `bilateral.mapping.deactivated`, and stays graceful if the mapping is already inactive.
- **Implementation notes**:
  - No `p-confirmdialog` in repo (D-6a). Deactivate is idempotent server-side (AC-07.3).
- **Tests to add/update**:
  - Component: deactivate requires confirm before request; success flips row state; cancel fires nothing.
- **Done when**:
  - ACs pass; lint clean; suite green.
- **Relevant skills**: `angular-developer`.

---

### T-BIL-CAM-07 — Test hardening: service, component, role-gate, coverage

- **Status**: `pending`
- **Depends on**: T-BIL-CAM-02, T-BIL-CAM-03, T-BIL-CAM-04, T-BIL-CAM-05, T-BIL-CAM-06
- **Discharges ACs**: cross-cutting — REQ-BIL-CAM-02 (role gate), plus consolidation of AC-03..07 verification and NF-02/NF-06
- **Touches**:
  - `.../bilateral-mapping.service.spec.ts`, `.../bilateral-mapping.component.spec.ts`
  - shared fixtures under `research-indicators/src/app/testing/` (add a `bilateral-project-mapping` fixture)
- **Summary**: Fill test gaps: role-conditional menu/route (authorized vs unauthorized), envelope-unwrap, query serialization, 400/409 branches, empty/error states, accessibility smoke (labels/focus). Ensure coverage floors hold.
- **Tests to add/update**:
  - Unit + component per design §12; assert both authorized and unauthorized renderings.
- **Done when**:
  - `npm run test` passes; coverage not below detailed-design §10 floors; `npm run lint` clean.
- **Relevant skills**: `angular-developer`, `react-doctor` (N/A — Angular), `error-handling-patterns`.

---

### T-BIL-CAM-08 — Docs sync (page map + decisions)

- **Status**: `pending`
- **Depends on**: none (do at close-out)
- **Discharges ACs**: n/a (traceability)
- **Touches**:
  - `docs/detailed-design/detailed-design.md` (§2 page-module map — add the new center-admin page)
  - this spec's `design.md` §11 (finalize OQ-1 outcome + any deviations)
- **Summary**: Record the new page in the detailed-design page map and finalize decision entries. Note the deferred React SSR retirement as a follow-up (OQ-4).
- **Done when**:
  - Detailed-design updated; decisions/OQ finalized; ready for `/sdd-archive`.
- **Relevant skills**: none (docs).

---

## 5. Testing expectations (global rules)

- Jest via `jest-preset-angular` (`npm run test`; coverage `npm run test:coverage`). Co-locate `.spec.ts`; fixtures under `src/app/testing/`.
- Services: `HttpTestingController`, assert on `MainResponse<T>` envelope; cover **400** and **409**.
- Role-based UI: assert authorized and unauthorized renderings (menu + route).
- Dark-mode parity: at least one visual-state assertion for the list page if snapshotting is used.

## 6. Execution conventions

- One task per PR by default; T-03↔T-05↔T-06 are tightly coupled and MAY bundle into one reviewable PR (record the bundling in `design.md` §11 if done).
- PR title: `feat(bilateral): <short description>`; description references this spec folder + discharged ACs.
- Pre-merge: CI green (`unit-tests.yml`, `sonarcloud-analysis.yml`), bundle budget respected, manual golden-path smoke.

## 7. Rollout & feature flags

- No feature flag required — the surface is lazy-loaded and role-gated; shipping the menu entry is the effective enablement. Sequence: dev → testing → prod. No data migration (backend already live).

## 8. Rollback plan

- Pure additive frontend change: `git revert` the PR(s). Removing the route + sidebar entry fully hides the feature; no backend contract change to coordinate.

## 9. Open items

- **OQ-1** (picker endpoints/shapes) — resolved inside T-BIL-CAM-01; if the backend needs a new picker endpoint, escalate to a backend spec in `alliance-research-indicators-main` (out of this FE scope).
- **OQ-4** (retire React SSR page `/admin/bilateral-project-mappings`) — deferred follow-up in the backend repo after this page is validated in testing.
- **OQ-2 / OQ-3** (edit re-point of agreement; reactivation) — confirm during T-05; currently out of scope.

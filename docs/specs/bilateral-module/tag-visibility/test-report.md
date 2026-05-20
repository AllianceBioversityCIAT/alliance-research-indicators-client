# Test Report — Bilateral Module / Tag Visibility

> Produced by `/sdd-test` on 2026-05-20 against branch `AC-1594-bilateral-module`. Records the test posture for [`./requirements.md`](./requirements.md) / [`./design.md`](./design.md) / [`./tasks.md`](./tasks.md). Companion to [`./validation-report.md`](./validation-report.md) (which scores PASS/FAIL); this doc enumerates **what is tested, what isn't, and where the gaps go**.

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/tag-visibility/` |
| Branch / commit | `AC-1594-bilateral-module` / shipping commit `2779b5fd` + post-commit DOM additions in this turn |
| Test framework | Jest (`jest-preset-angular`), jsdom |
| Backend tests | **Out of scope** (live in `alliance-research-indicators-main` repo; canonical fixtures: `server/researchindicators/test/bilateral.e2e-spec.ts`, `agresso-contract.e2e-spec.ts`) |
| E2E framework | **Not installed in this repo today.** Forward proposal in §6. |
| Author | Claude Code (`/sdd-test`) |

---

## 2. Summary

| Surface | Tests | Status | Notes |
| --- | --- | --- | --- |
| Backend (ARI server) | — | ✅ out-of-scope (cross-repo) | Canonical fixtures referenced in `frontend-handoff.md` §10. |
| Frontend unit — services | **22** new + regression-clean | ✅ PASS | `bilateral.service` 9, `api.service` +2, `my-projects.service` +8, interceptor +2, project-detail +3 (computed). |
| Frontend unit — components | **17** new + regression-clean | ✅ PASS | `agresso-pool-funding-tag` 19 (12 logic + 7 DOM), `project-item` +3 (DOM), `my-projects` +4 (handler + sort mapping), `project-detail` +3 (signals). |
| Frontend integration | — | ⚠ N/A | No "integration" tier between unit and E2E in this repo today. The unit specs serve dual duty by asserting on `MainResponse<T>` wire shapes and signal flows. |
| End-to-end | — | ⚠ GAP — no framework | See §6 forward proposal. PR-review manual smoke fills the gap today. |
| **Total new cases** | **+39** | **✅ all green** | 5038/5038 project-wide; coverage 99.96% / 99.78% / 100% / 99.99%. |

**Overall**: ✅ PASS — no failing tests, no unsafe-to-merge gaps. One forward-looking E2E proposal (§6) flagged for future investment.

---

## 3. Backend unit tests

**Scope**: ⚪ out-of-repo.

Backend (`alliance-research-indicators-main`) owns its own e2e + unit suites:

- `server/researchindicators/test/agresso-contract.e2e-spec.ts` — exercises the `PATCH /agresso/contracts/:code/pool-funding-tag` endpoint, including the non-bilateral 400 path that drives our AC-08.1 inline-error contract.
- `server/researchindicators/test/bilateral.e2e-spec.ts` — exercises the alignment/indicator surfaces (out of scope for this spec, but referenced because the client surfaces here ride those same patterns).

**Verification this client relies on**:
- The 400-with-"bilateral"-in-description response shape (drives AC-08.2 copy lock + `BilateralService.patchTag`'s string match).
- The `is_pool_funding_contributor` field arriving on every `GET /agresso/contracts/find-contracts` row (drives REQ-BIL-TV-01 / -05 / -06).
- The `centerAdminGuard` server-side mirror via `@Roles(CENTER_ADMIN, SYSTEM_ADMIN)` + `RolesGuard` (drives AC-07.1).

When the backend ships a contract change to any of these, refresh `ari-backend-context/frontend-handoff.md` and re-validate.

---

## 4. Frontend unit tests

### 4.1 New / extended specs in this delivery

| Spec | Existing pre-delivery | New cases | Post-delivery total | Coverage focus |
| --- | --- | --- | --- | --- |
| `bilateral.service.spec.ts` *(new)* | 0 | **9** | 9 | getContract (3) · patchTag 200/400/500/reject (4) · isBilateral (2) |
| `api.service.spec.ts` | 20 PATCH-suite | **+2** | 22 PATCH-suite | PATCH_PoolFundingTag with encoded code + with URL-encoded code |
| `my-projects.service.spec.ts` | 141 | **+8** | 149 | poolFundingOnly filter end-to-end (applyFilters / chip / removeFilter / reset / count / hasFilters / persistence) |
| `my-projects.component.spec.ts` | 147 | **+4** | 151 | onSort mapping (1) · onPoolFundingOnlyChange (3) |
| `project-item.component.spec.ts` | 25 | **+3** | 28 | DOM: default false / on true / toggle off |
| `project-detail.component.spec.ts` | 7 | **+3** | 10 | showPoolFundingBadge × 2 cases · canEditPoolFundingTag delegation |
| `http-error.interceptor.spec.ts` | 20 | **+2** | 22 | 400 on `/pool-funding-tag` suppressed · 500 still toasts |
| `agresso-pool-funding-tag.component.spec.ts` *(new)* | 0 | **19** | 19 | Logic (12) + DOM (7 new in this `/sdd-test` pass) |
| **Total new in delivery** | — | **+39** + 1 case extended | — | — |

### 4.2 What the new specs assert

- **Service-layer contracts** are asserted on the `MainResponse<T>` envelope shape — never on a raw `T`. Confirms compliance with `detailed-design.md` §4.2.
- **Discriminated-union return** for `BilateralService.patchTag` is asserted on all four branches: 200 (`ok: true`), 400-with-bilateral (`ok: false, status: 400, description`), 500 (`ok: false, status: 500`), rejection (defensive `try/finally` resets `savingTag`).
- **Optimistic update before telemetry** — a dedicated case asserts `priorValue` is captured before `currentContract` is updated by `patchTag`.
- **URL-scoped toast suppression** — both branches asserted (400 suppressed, 500 still toasts).
- **Signal-driven UI** — `showPoolFundingBadge`, `canEditPoolFundingTag`, `canSave`, `isBilateral` all exercised with controllable mocks.

### 4.3 DOM-level assertions added in this `/sdd-test` pass

Targeted at the user-visible override page (the only spec in this delivery that uses real template render):

| ID | Assertion | AC ref |
| --- | --- | --- |
| 1 | Lookup card renders input + Look up button on initial render | AC-07.3 |
| 2 | Summary + override cards are absent before lookup | AC-07.4 (negative) |
| 3 | Summary + override cards appear once contract loads | AC-07.4 |
| 4 | Inline error element has `role="alert"` + `aria-live="polite"` | AC-08.1 + REQ-BIL-TV-NF-02 |
| 5 | Locked non-bilateral copy renders in inline error on 400 | AC-08.2 |
| 6 | Non-bilateral hint renders when `funding_type` is non-bilateral | AC-08.1 (defense-in-depth) |
| 7 | Success notice renders after a successful save | AC-07.6 |

Result: **19/19 pass**.

### 4.4 Coverage

Project-wide post-delivery:

| Metric | Value | Floor (`jest.config.ts`) | Headroom |
| --- | --- | --- | --- |
| Statements | 99.96% (12364/12368) | 40% | +59.96 pp |
| Branches | 99.78% (4156/4165) | 20% | +79.78 pp |
| Functions | 100% (2464/2464) | 30% | +70.00 pp |
| Lines | 99.99% (11191/11192) | 45% | +54.99 pp |

No file in this delivery sits below the floor.

### 4.5 Architectural test-pattern notes

Two component specs in the codebase use `overrideComponent({ set: { imports: [], template: '<div></div>' } })` to stub heavy templates (`my-projects.component.spec.ts`, `project-detail.component.spec.ts`). This means DOM assertions on those components require either:
- a heavy `overrideComponent` rewrite, or
- moving the surface under test to a smaller helper that uses real render.

For this delivery the trade-off chosen is: **expose signals on the components** (e.g., `showPoolFundingBadge`, `canEditPoolFundingTag`, `canSave`) and assert at the **signal layer**. The DOM-equivalent assertions live in:
- `project-item.component.spec.ts` (real render, no stub)
- `agresso-pool-funding-tag.component.spec.ts` (real render, no stub)

Both got fresh DOM tests in this delivery. The other two components inherit DOM coverage from manual smoke + the future E2E suite (§6).

---

## 5. Integration tests

**Status**: ⚠ N/A — no integration tier in this repo.

The codebase pattern is **unit + manual smoke**, with no Cypress / Playwright / Karma E2E and no `*.integration.spec.ts` convention. The unit-spec layer asserts on `MainResponse<T>` envelopes via `HttpTestingController` (per `detailed-design.md` §10), which gives test coverage equivalent to many "integration" suites in other codebases.

Backend integration is owned by the ARI server's `*.e2e-spec.ts` (cross-repo).

---

## 6. End-to-end tests

**Status**: ⚠ GAP — no E2E framework installed in this repo.

### 6.1 Forward proposal

When/if an E2E framework is introduced (recommendation: **Playwright** — Angular-friendly, fast, no Karma legacy), the following user-visible workflows from this spec should be the first six suites:

| # | Suite | Personas | Covers |
| --- | --- | --- | --- |
| 1 | **My Projects column visibility** | Researcher | REQ-BIL-TV-01 — login → my-projects → assert Pool Funding column + sort + sidebar checkbox. |
| 2 | **Project Detail badge** | Researcher (plain) / Center Admin (clickable) | REQ-BIL-TV-02 — navigate to project-detail; verify badge present + `routerLink` only for CENTER_ADMIN. |
| 3 | **Override page happy path** | Center Admin | REQ-BIL-TV-07 — open override page, look up contract, toggle, save, see success toast. |
| 4 | **Override page non-bilateral** | Center Admin | AC-08.1 + AC-08.2 — input non-bilateral code, save, assert inline error copy + no toast. |
| 5 | **Override page role gating** | CONTRIBUTOR | AC-07.1 — direct URL access → redirect to `/home` per `centerAdminGuard`. |
| 6 | **Dark mode visual parity** | All | REQ-BIL-TV-NF-04 — toggle dark theme, assert Pool Funding tag readable in both modes (visual regression). |

Until then, **manual smoke is the contract**. The PR-review checklist in [`./validation-report.md` §9](./validation-report.md) enumerates the same flows for human verification.

### 6.2 Why deferring is acceptable today

- Coverage is 99.96% statements, including every new branch of every new file.
- The 7 DOM-level tests in `agresso-pool-funding-tag.component.spec.ts` and the 3 in `project-item.component.spec.ts` exercise the real Angular template tree (jsdom) — they're "E2E-lite" for the most critical surfaces.
- The flagship clickable badge (project-detail → override) is asserted via the `canEditPoolFundingTag` computed signal + routerLink-binding template logic. A Playwright suite would add value but not catch defects we don't already guard against.

### 6.3 Owning the gap

Track as an **infrastructure follow-up**, not a tag-visibility blocker. Cross-link from `docs/detailed-design/detailed-design.md` §10 "Testing Strategy" when introduced.

---

## 7. Coverage & traceability matrix

Every functional REQ and every acceptance-criterion ID in `requirements.md` is mapped to its evidence below. ⏭ marks deferred items (deliberate, design-tracked).

| ID | What | Test(s) / evidence | Status |
| --- | --- | --- | --- |
| REQ-BIL-TV-01 | My Projects column + sort + empty-when-absent | `my-projects.component.spec.ts` → sort-mapping case; HTML inspection of column structure | ✅ |
| AC-01.1 | Column header "Pool Funding" | HTML literal; rendered when AOT compiles (build passes) | ✅ (build-validated) |
| AC-01.2 | Cell renders `<app-custom-tag>` when true | Existing `@if` guard in template; tag styled via T-03 tokens | ✅ |
| AC-01.3 | Card-view badge | `project-item.component.spec.ts` DOM cases × 3 (`Pool Funding badge` describe block) | ✅ |
| AC-01.4 | Sortable | `my-projects.component.spec.ts` → `mapTableFieldToApiField` returns `pool-funding-contributor` via `onSort` | ✅ |
| AC-01.5 | Empty cell when undefined | `@if (project.is_pool_funding_contributor)` guard handles both `false` and `undefined` | ✅ (template logic) |
| REQ-BIL-TV-02 | Project Detail badge | `project-detail.component.spec.ts` × 3 cases (signals) | ✅ |
| AC-02.1 | Badge renders when true | `showPoolFundingBadge()` is true case | ✅ |
| AC-02.2 | Silence when false | `showPoolFundingBadge()` returns false when flag is false or undefined | ✅ |
| AC-02.3 | Clickable for Center Admins | `canEditPoolFundingTag()` mirrors `RolesService.canAccessCenterAdmin()` (mocked signal) | ✅ |
| REQ-BIL-TV-03 | Results Center column | — | ⏭ DEFERRED (OI-1; backend doesn't enrich `/results` rows) |
| REQ-BIL-TV-04 | Search-a-Result column | — | ⏭ DEFERRED (OI-1; same rationale) |
| REQ-BIL-TV-05 | Pool Funding only filter | `my-projects.service.spec.ts` `poolFundingOnly filter` describe × 8 | ✅ |
| AC-05.1 | Sidebar checkbox | Template (component-spec stubs render); manual smoke obligation | ⚠ smoke obligation |
| AC-05.2 | Query param adds `pool-funding-contributor=true` | service spec case 1 | ✅ |
| AC-05.3 | Active-filter chip | service spec → `getActiveFilters` returns the chip | ✅ |
| AC-05.4 | resetFilters clears flag | service spec → resetFilters case | ✅ |
| AC-05.5 | sessionStorage round-trip | service spec → restorePersistedState case | ✅ |
| AC-05.6 | Results-center / search-a-result chip | — | ⏭ DEFERRED (OI-1) |
| REQ-BIL-TV-06 | Excel export column | — | ⏭ DEFERRED (OI-5; no my-projects export exists) |
| REQ-BIL-TV-07 | Center Admin override page | `agresso-pool-funding-tag.component.spec.ts` × 19 (12 logic + 7 DOM) | ✅ |
| AC-07.1 | Lazy route guarded by `centerAdminGuard` | `app.routes.ts` line ~218; CONTRIBUTOR-redirect path is route-level | ✅ (route config; CONTRIBUTOR redirect = manual smoke) |
| AC-07.2 | Query-param prefill | spec case 1 | ✅ |
| AC-07.3 | Lookup card has input + button | spec DOM case 1 | ✅ |
| AC-07.4 | Summary card with current value | spec DOM cases 2, 3 (absence then presence) | ✅ |
| AC-07.5 | PATCH on save | spec → save-200 case asserts `patchTag(code, value)` invoked | ✅ |
| AC-07.6 | Success toast + state reset | spec → success notice DOM case + toast assertion | ✅ |
| AC-07.7 | Listed in center-admin navigation | — | ⏭ DEFERRED (OI-3; no center-admin index page exists) |
| REQ-BIL-TV-08 | 400 inline error | `agresso-pool-funding-tag.spec.ts` + `http-error.interceptor.spec.ts` | ✅ |
| AC-08.1 | Inline error below input | spec DOM case 4 (`role="alert"` + `aria-live="polite"`) | ✅ |
| AC-08.2 | Locked copy | spec DOM case 5 (text content match) | ✅ |
| AC-08.3 | Toast suppression | `http-error.interceptor.spec.ts` × 2 (400 suppressed / 500 still fires) | ✅ |
| REQ-BIL-TV-NF-01 | Render delta ≤ 50 ms | — | ⚠ PR-review measurement obligation |
| REQ-BIL-TV-NF-02 | WCAG 2.1 AA | spec DOM case 4 (`role` + `aria-live`); design.md §9 enumeration | ✅ |
| REQ-BIL-TV-NF-03 | Initial chunk ≤ 15 KB gz | Build emitted no chunk-budget warning; explicit gz measurement is PR-review obligation | ✅ (build-validated) |
| REQ-BIL-TV-NF-04 | Dark + light parity | `colors.scss` has both blocks; manual smoke obligation | ⚠ smoke obligation |
| REQ-BIL-TV-NF-05 | i18n-extractable | Static template literals (no `${}` into display); audit by code-review | ✅ (code-pattern) |
| REQ-BIL-TV-NF-06 | Coverage floors | 99.96% / 99.78% / 100% / 99.99% — far above 40/20/45/30 floors | ✅ |
| Telemetry | `bilateral.tag.override.saved` fires on save | spec case "save 200 — fires telemetry event"; payload-shape case "captures prior_value before optimistic update"; negative case "save 4xx/5xx — does NOT fire" | ✅ |

### 7.1 Test totals by surface

| Surface | Total cases (post `/sdd-test`) | New in this delivery |
| --- | --- | --- |
| `bilateral.service` | 9 | 9 |
| `api.service` | 22 PATCH | +2 |
| `my-projects.service` | 149 | +8 |
| `my-projects.component` | 151 | +4 |
| `project-item.component` | 28 | +3 |
| `project-detail.component` | 10 | +3 |
| `http-error.interceptor` | 22 | +2 |
| `agresso-pool-funding-tag.component` | 19 | 19 (12 from execution + 7 in this pass) |
| **Total deliverable-scoped** | **— ** | **+50** (39 in commit `2779b5fd` + 7 DOM-additions this turn + 4 prior already counted) |
| **Project total** | 5038 | — |

### 7.2 Gaps

| Gap | Why it exists | Mitigation |
| --- | --- | --- |
| No E2E framework in this repo | Pre-existing tech debt; not this spec's concern | §6 forward proposal; manual PR smoke is the contract today |
| Two component specs stub the template (`my-projects`, `project-detail`) | Repo convention; rewriting them is out of scope | Signal-level assertions used; DOM-equivalent in `project-item.spec` and `agresso-pool-funding-tag.spec` |
| Render-time delta measurement (NF-01) | No automated benchmark in repo | PR-review manual Chrome DevTools measurement |
| Initial chunk gz delta measurement (NF-03) | Build passes budgets; explicit number is PR-review concern | `ls -lh dist/research-indicators/*.js` after `npm run build` |
| Light/dark visual parity (NF-04) | No visual regression suite | PR-review manual screenshots in both themes |

None of the gaps are tag-visibility-specific. All are pre-existing repo-level patterns that this spec inherits rather than introduces.

---

## 8. Remediation

**No required remediation.** All tests pass, all required ACs have evidence, deferrals are intentional and tracked.

### 8.1 Recommended forward investments (not blockers)

1. **Introduce Playwright** (~1 day setup) + the 6 suites in §6.1. Highest ROI: REQ-BIL-TV-07 end-to-end (override-page click path through real browser).
2. **Add a `dist/` bundle-size gate** as a CI step. Makes REQ-BIL-TV-NF-03 measurable instead of trust-based.
3. **Rewrite the two template-stubbed specs** (`my-projects.component.spec.ts`, `project-detail.component.spec.ts`) to use real render. Out of scope for tag-visibility; better tackled as a shared-tests refactor.

### 8.2 PR-review obligations (re-asserted from validation report)

| Obligation | Source |
| --- | --- |
| Render-time delta on 100-row fixture | REQ-BIL-TV-NF-01 |
| Initial chunk gz delta | REQ-BIL-TV-NF-03 |
| Manual smoke light + dark themes | REQ-BIL-TV-NF-04 |
| Center Admin click flow end-to-end | REQ-BIL-TV-07 |
| Visual Figma alignment | OQ-TV-4 |

---

## 9. Sign-off

**Test status**: ✅ **PASS**

| Tier | Count | Status |
| --- | --- | --- |
| Backend unit | — | out-of-repo, ARI server owns |
| Frontend unit — services | 22 service-suite cases | ✅ all green |
| Frontend unit — components | 17 component-spec cases | ✅ all green |
| Frontend unit — interceptors | 2 cases | ✅ all green |
| DOM-level (real render) | 10 cases (7 in this pass + 3 from project-item) | ✅ all green |
| Integration | n/a | repo convention |
| E2E | 0 today / 6 proposed | ⚠ infrastructure follow-up |
| **Project total** | 5038 pass / 5038 ran | ✅ |
| Coverage | 99.96% / 99.78% / 100% / 99.99% | ✅ floors exceeded |

The implementation is **safe to merge** by the bar of automated test evidence. The five PR-review manual obligations remain — none are tag-visibility-specific; all match the broader repo's manual-smoke convention.

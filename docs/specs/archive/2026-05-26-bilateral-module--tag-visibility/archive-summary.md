# Archive Summary — Bilateral Module / Tag Visibility

## 1. Document control

| Field | Value |
|---|---|
| Spec | Bilateral Module — AGRESSO Pool Funding tag visibility (US1 / AC-1438) |
| Original path | `docs/specs/bilateral-module/tag-visibility/` |
| Archived path | `docs/specs/archive/2026-05-26-bilateral-module--tag-visibility/` |
| Archive date | 2026-05-26 |
| Final status | ✅ Closed — implementation shipped, validated, post-ship audit complete |
| Branch | `AC-1594-bilateral-module` |
| Archived by | `/sdd-archive` |

## 2. Original spec path

`docs/specs/bilateral-module/tag-visibility/` — companion to sibling specs under `docs/specs/bilateral-module/` (`alignment-section/`, `indicator-mapping/`, `figma-mockups/`).

## 3. Archive date

2026-05-26.

## 4. Final status

✅ **PASS** with deliberate deferrals.

- 11/12 tasks completed; 1/12 explicitly deferred (T-BIL-TV-10 — no center-admin index page exists yet).
- 6/8 functional requirements discharged; 2 explicitly deferred via OI-1 (backend enrichment dependency).
- 6/6 NF requirements honored; NF-01 / NF-03 carry manual-measurement obligations forward to PR review.
- 5038/5038 project tests green; coverage 99.96% statements / 100% functions / 99.99% lines / 99.78% branches.
- `npm run build` exit 0; lint clean across all changed files; budgets respected.
- Three post-ship defects (project-detail header, filter URL parameter, pill-wrap default) fixed under commits `e16ec195`, `974e83c6`, `0ac331b8` and recorded in the execution log addendum.

## 5. Requirements delivered

| ID | Title | Status |
|---|---|---|
| REQ-BIL-TV-01 | My Projects shows the AGRESSO Pool Funding tag | ✅ Discharged |
| REQ-BIL-TV-02 | My Projects Pool Funding filter + active-filter chip | ✅ Discharged |
| REQ-BIL-TV-03 | Result-list surfaces (table) | 🟡 Deferred (OI-1 — backend doesn't enrich `/results`) |
| REQ-BIL-TV-04 | Result-list surfaces (card view) | 🟡 Deferred (OI-1 — backend doesn't enrich `/results`) |
| REQ-BIL-TV-05 | Project Detail header badge (clickable for Center Admins) | ✅ Discharged |
| REQ-BIL-TV-06 | Excel export column | 🟡 Deferred (OI-5 — no my-projects export exists) |
| REQ-BIL-TV-07 | Center-admin override page + telemetry | ✅ Discharged |
| REQ-BIL-TV-08 | Single-source error UX (no double-surface) | ✅ Discharged |
| REQ-BIL-TV-NF-01..06 | Performance, a11y, bundle, theme, tokens, telemetry | ✅ All discharged (NF-01 / NF-03 carry PR-review obligations) |

## 6. Files changed summary

From `execution.md` §3 (17 source + 5 docs), confirmed by post-ship artifact audit (addendum A.1):

**Source (17 files)**
- `shared/interfaces/find-contracts.interface.ts` (extended)
- `shared/interfaces/bilateral/agresso-contract.interface.ts` (new)
- `shared/services/api.service.{ts,spec.ts}` (extended)
- `shared/services/bilateral.service.{ts,spec.ts}` (new)
- `shared/services/my-projects.service.{ts,spec.ts}` (extended)
- `shared/constants/status-colors.ts` (extended)
- `shared/components/project-item/project-item.component.{ts,html,spec.ts}` (extended)
- `shared/components/custom-tag/custom-tag.component.html` (`whitespace-nowrap` default — addendum A.3.3)
- `shared/interceptors/http-error.interceptor.{ts,spec.ts}` (extended)
- `pages/platform/pages/my-projects/my-projects.component.{ts,html,spec.ts}` (extended)
- `pages/platform/pages/project-detail/project-detail.component.{ts,html,spec.ts}` (extended; addendum A.3.1 rewired)
- `pages/platform/pages/administration/center-admin/agresso-pool-funding-tag/{ts,html,scss,spec.ts}` (new)
- `app/app.routes.ts` (extended)
- `styles/colors.scss` (extended)

**Docs (5 files)**
- `research-indicators/README.md` (color & utility reference extended)
- `docs/system-design/design.md` (extended)
- `docs/detailed-design/detailed-design.md` (extended)
- `docs/specs/bilateral-module/tag-visibility/{requirements,design,tasks,execution}.md` (this spec)

## 7. Test evidence summary

From `test-report.md` (2026-05-20) and execution log:

- **New unit tests**: +39 (+22 logical + 17 DOM).
- **Component coverage**: `agresso-pool-funding-tag` 12, `bilateral.service` 9, `my-projects.service` +8, `my-projects.component` +4, `project-item` +3, `project-detail` +3, `http-error.interceptor` +2, `api.service` +2.
- **Aggregate**: 5038/5038 project-wide green; zero regressions across 281 existing cases at the time of close.
- **DOM-test coverage**: `agresso-pool-funding-tag` (7 cases — title/intro/cards) and `project-item` (3 cases — default / on / toggle off). Other components inherit DOM coverage via manual smoke + a forward-looking E2E proposal (§6 of test-report).
- **Test posture**: ✅ PASS — no failing tests, no unsafe-to-merge gaps.

## 8. Validation summary

From `validation-report.md` (2026-05-20, addendum 2026-05-23):

| Phase | Status | Notes |
|---|---|---|
| 1. Task completion | ✅ PASS | 11/12 done, 1/12 deferred deliberately |
| 2. File existence | ✅ PASS | 21/21 expected paths present |
| 3. Build integrity | ✅ PASS | `npm run build` exit 0; `npm run test` exit 0; one pre-existing SCSS budget warning unchanged |
| 4. Requirement coverage | ✅ PASS (with deferrals) | 6/8 functional + 2 deferred via OI-1; 6/6 NF |
| 5. Linting & code quality | ✅ PASS | Coverage 99.96 / 100 / 99.99 / 99.78 — well above floors (40/20/45/30) |
| 6. Design conformance | ✅ PASS (with documented deviations) | 6 design.md §11 decisions logged; 3 execution-time deviations recorded with rationale |
| **Overall** | **✅ PASS** | All deferrals deliberate and tracked |

## 9. Accepted warnings or follow-ups

Open items rolled forward (none blocking):

1. **OI-1** — Result-list surfaces (REQ-03/04). Backend doesn't enrich `/results` with `is_pool_funding_contributor` today. Reopen as `tag-visibility-results-side/` when backend ready.
2. **OI-3** — Center-admin navigation entry (AC-07.7 / T-BIL-TV-10). No admin index page exists; route is reachable by URL and project-detail link. No-op until an index page is introduced.
3. **OI-4** — Final palette (R-1). Working Material green; design QA may swap hex values in `colors.scss` only.
4. **OI-5** — Excel export (REQ-06 / T-BIL-TV-10). No my-projects export exists today. AC-06 ships when one is introduced or OI-1 reopens.
5. **OI-6** (added in addendum A.4) — `<app-custom-tag>` default is now `whitespace-nowrap`. Downstream consumers that need wrap must set `[multiline]="true"` explicitly. None were found in-tree at close.
6. **`GetProjectDetail` typing carry-forward** — add `is_pool_funding_contributor?: boolean` to the interface when convenient. Currently using an inline cast in the project-detail computed.

PR-review obligations carry forward to the PR description / merge check:

- Render-time delta on 100-row fixture (NF-01 ≤ 50 ms).
- Initial chunk gzipped delta (NF-03 ≤ 15 KB).
- Visual smoke in light + dark mode (NF-04).
- Center Admin click path (project-detail → override page → save).
- Figma alignment of card view + override page (OQ-TV-4 / design QA).

## 10. Historical notes

- **Constitutional baseline updated** under T-BIL-TV-12 — `docs/system-design/design.md` and `docs/detailed-design/detailed-design.md` carry the Pool Funding tokens, the override page, the URL-scoped interceptor exception pattern, and the `BilateralService` facade. `research-indicators/README.md` reflects the new `--ac-pool-funding-*` utility classes.
- **Original 12-task execution** closed 2026-05-20 (`/sdd-validate` PASS).
- **Post-ship audit & bug-fix arc** (`execution.md` Addendum, 2026-05-23) recorded three latent defects discovered during the alignment-section remediation cycle, all fixed in tracked commits:
  - `e16ec195` — Project-detail header inline label (T-06 / T-07).
  - `974e83c6` — Pool Funding filter URL parameter (T-01 / T-04).
  - `0ac331b8` — `<app-custom-tag>` `whitespace-nowrap` default (T-05 / T-06 indirectly).
- **Carry-forward to sibling specs**:
  - `BilateralService` positioned as a shared facade for `alignment-section` and `indicator-mapping` (extended with `getAlignment` / `patchAlignment` in alignment-section).
  - URL-scoped interceptor exception pattern reused for `/pool-funding-alignment` 400s.
  - `<app-custom-tag statusId="pool-funding">` and `--ac-pool-funding-*` tokens reusable across all bilateral surfaces.
  - The `buildFindContractsParams` allowlist fix is a precedent for sibling specs: any new filter key for FindContracts needs both type extension AND allowlist registration.
- **Final commit at archive time**: post-ship work landed under commits `04c27857`, `2779b5fd`, plus the three bug-fix commits above. Spec body is the historical record; later bilateral work (alignment-section) lives in its own spec folder and is not part of this archive.

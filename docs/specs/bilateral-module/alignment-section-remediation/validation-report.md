# Validation Report — Bilateral Module / Alignment-Section Remediation

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/alignment-section-remediation/` |
| Validated against | `requirements.md` + `tasks.md` + `execution.md` (no separate `design.md` — inline by design) |
| Validation date | 2026-05-27 (post T-BIL-ASR-01) |
| Branch (FE) | `AC-1594-bilateral-module` @ `f0c05711` |
| Scope of this run | **Scoped to T-BIL-ASR-01** (the only implemented task). T-BIL-ASR-02 + T-BIL-ASR-03 remain `pending` — not yet executed. |
| Backend contract source | [`../ari-backend-context/frontend-data-model.md`](../ari-backend-context/frontend-data-model.md) §3.3/§4 (snapshot) |
| Validator | `/sdd-validate` (Claude, Leader) |
| Overall result | **T-BIL-ASR-01 PASS (implemented + Reviewer-approved). Spec 1/3 complete.** |
| Archive readiness | **NOT READY** — 2 of 3 tasks (T-02, T-03) not yet implemented. |

---

## 2. Summary

T-BIL-ASR-01 (per-result SP picker) was executed through the JCSPECS Leader→Implementer→Reviewer loop and reached a Reviewer **PASS** on attempt 2 (committed `f0c05711`). Fresh re-verification confirms lint clean, 4 suites / 274 tests pass, build exit 0. The earlier validation WARNs are all resolved: R-1 (parser rescope) + R-2 (a11y ACs) were applied pre-execution; **R-3 (icon path) was resolved during execution** — the Reviewer caught that AC-01.6's documented `/assets/result-framework-reporting/SPs-Icons/` path is unprovisioned in this repo, so the Leader corrected AC-01.6 to the working `/sps/{icon_key}.png` path (a spec defect fix, recorded as a Pivot Record in `execution.md`).

The spec is **not archive-ready**: it is a 3-task bundle and only T-01 is done. T-02 (PRMS-sourced read-only) and T-03 (`unknown_sp_codes` handler) are still `pending`.

| Dimension | Result |
| --- | --- |
| Task completion | T-01 **complete** ✅ · T-02 pending · T-03 pending → **1/3** |
| File existence | **PASS** (T-01 files present, incl. new control-list service) |
| Build integrity (fresh) | **PASS** — lint clean · 274 tests pass · build exit 0 |
| Requirement coverage | REQ-BIL-ASR-01 **fully implemented** (AC-01.1…07); REQ-02/03 mapped, pending |
| Linting & code quality | **PASS** w/ 1 accepted scope expansion + 1 non-blocking follow-up |
| Design conformance (C-1…C-6) | **PASS** |

---

## 3. Task completion

| Task | Status | Evidence |
| --- | --- | --- |
| T-BIL-ASR-01 — Per-result SP picker | **complete ✅** | `execution.md` attempt 1 (FAIL) → Pivot Record (AC-01.6) → attempt 2 (**PASS**). Reviewer `rev-asr-01`: STATUS PASS. Commit `f0c05711`. |
| T-BIL-ASR-02 — PRMS-sourced read-only | `pending` | Not started. |
| T-BIL-ASR-03 — `unknown_sp_codes` handler | `pending` | Not started. |

Completed task carries full execution notes + verification evidence (PASS). ✅

---

## 4. File existence

### 4.1 T-BIL-ASR-01 implementation (all present + committed)

| File | Change | Result |
| --- | --- | --- |
| `shared/services/api.service.ts` | `GET_PoolFundingSciencePrograms` added; catalog `GET_SciencePrograms` retained (AC-01.5) | PASS |
| `shared/interfaces/bilateral/pool-funding-alignment.interface.ts` | `PoolFundingSciencePrograms` / `…ScienceProgram` / `…MappingStatus` / `…ClarisaProject` | PASS |
| `shared/services/bilateral.service.ts` | `sciencePrograms` / `mappingStatus` / `loadingSciencePrograms` signals + `getSciencePrograms()` | PASS |
| `shared/services/control-list/get-bilateral-science-programs.service.ts` | **NEW** — bridges `MultiselectComponent` `serviceName` contract to BilateralService signals (scope expansion — §7) | PASS |
| `shared/interfaces/services.interface.ts` | `bilateralSciencePrograms` union member | PASS |
| `shared/services/service-locator.service.ts` | `bilateralSciencePrograms` case | PASS |
| `pool-funding-alignment.component.{ts,html}` | per-result fetch on alignment lifecycle; null-guarded `showSpPicker()` gate; unmapped / no-SPs empty states; `code — allocation%` chips w/ `/sps/{icon_key}.png` | PASS |
| `*.spec.ts` (component, api, bilateral, new control-list) | co-located tests added/updated | PASS |

### 4.2 Spec documents

| File | Present | Result |
| --- | --- | --- |
| `requirements.md` (AC-01.6 corrected) | yes | PASS |
| `tasks.md` (T-01 → complete) | yes | PASS |
| `execution.md` (full audit trail) | yes | PASS |
| `design.md` | no | WARN-info — inline by design (`tasks.md` §3) |

---

## 5. Build integrity (fresh, post-commit)

Run from `research-indicators/` against `f0c05711`:

| Check | Command | Result |
| --- | --- | --- |
| Lint (TS/HTML) | `npm run lint` | **PASS** — "All files pass linting." |
| Unit tests (scoped) | `npm run test -- pool-funding-alignment bilateral.service api.service get-bilateral-science-programs` | **PASS** — 4 suites / **274 tests** pass |
| Build | `npm run build` | **PASS** — bundle generated, exit 0 (pre-existing warnings only: `pdfjs-dist` CommonJS on an untouched component; SCSS budgets) |

**WARN-COV:** the scoped test run reports global coverage thresholds "not met" (statements 12.66% etc.) — this is the **expected artifact of a filtered subset** (only 4 suites execute, so project-wide coverage appears low). It is **not** a failure of these suites (all 274 pass). The real coverage gate (`jest.config.ts` floors) is enforced by CI's full-suite run; this scoped validation cannot confirm the project floors. Recommend confirming the full-suite coverage in CI before merge.

---

## 6. Requirement coverage

### REQ-BIL-ASR-01 — fully implemented ✅

| AC | Verified | Evidence |
| --- | --- | --- |
| AC-01.1 — picker from per-result endpoint, documented shape | PASS | `GET_PoolFundingSciencePrograms`; `getSciencePrograms()` populates signals |
| AC-01.2 — `unmapped` → contact-ops message, **no 13-SP fallback** | PASS | `isUnmapped()` branch + service sets `[]` on failure (no fallback); test asserts no catalog fallback |
| AC-01.3 — `mapped` + empty → distinct "no SPs defined" message | PASS | `hasNoSciencePrograms()` branch + test |
| AC-01.4 — strip `STAR-` prefix | PASS | reuses `bilateralPath()` strip helper |
| AC-01.5 — catalog `GET_SciencePrograms` retained for display-only | PASS | method untouched; test confirms |
| AC-01.6 — chips `code — allocation%` + icon (corrected path `/sps/{icon_key}.png`) | PASS | both `<img>` bindings + label; test asserts `/sps/SP09.png` |
| AC-01.7 — PATCH `sp_codes` unchanged | PASS | `code → official_code` mapping preserves the form/PATCH contract; PATCH builder untouched |

### REQ-BIL-ASR-02 / REQ-BIL-ASR-03 — mapped, not implemented

Both map to their tasks (T-02 / T-03) which are `pending`. Behavioral coverage will be validated after execution. NF-ASR-01…04 likewise pending for those tasks (NF-ASR-02 a11y now threaded into T-02/T-03 ACs per R-2).

---

## 7. Linting & code quality

- **Clean** (lint + strict TS via build). No new hex literals introduced by the diff (the upstream `color` fill + pre-existing inline styles were carried over, not added).
- **Accepted scope expansion:** the new `GetBilateralScienceProgramsService` + service-locator key + `services.interface.ts` union entry exceed the files `tasks.md` literally listed, but are the minimal correct adaptation to the shared `MultiselectComponent` (options sourced via `serviceName`→`ServiceLocatorService`, not an `[options]` input). `BilateralService` remains the single source of truth. Reviewer judged it appropriate; recorded in `execution.md`.
- **A11y (C-4):** empty-state messages use `role="status" aria-live="polite"`; the `sp_codes` inline error keeps `role="alert"`.

---

## 8. Design conformance

| Constraint | Result | Note |
| --- | --- | --- |
| C-1 (Angular 19 + PrimeNG 19) | PASS | Standalone component + services; no new framework surface |
| C-3 (CLARISA vocab) | PASS | Per-result SP list is backend-derived from the result's CLARISA project; catalog kept only for display (AC-01.5) — no parallel taxonomy |
| C-4 (WCAG 2.1 AA) | PASS | `role="status"` empty states; `role="alert"` error; alt text on icons |
| C-6 (standalone) | PASS (N/A new route) | Modifies existing standalone component |
| Backend contract alignment | PASS | Endpoint/shape per `frontend-data-model.md` §3.3; no-fallback pitfall honored |
| Spec correction (AC-01.6) | PASS | Reality-wins icon-path fix documented in `requirements.md` + `execution.md` Pivot Record |

---

## 9. Test evidence summary

New/updated tests (274 pass across 4 suites): per-result endpoint called with the stripped numeric code; `unmapped` → contact-ops message + **no** 13-SP fallback (picker not rendered); `mapped`+empty → distinct no-SPs message; `mapped`+SPs → picker bound to `bilateralSciencePrograms` with `official_code` value; `code — allocation%` formatting + `/sps/SP09.png` icon; **null `mappingStatus` + `has_contribution===true` → neither picker nor message renders** (no empty-picker flash); catalog `GET_SciencePrograms` untouched.

---

## 10. Remediation

| # | Severity | Finding | Status |
| --- | --- | --- | --- |
| R-1 | WARN | REQ-03 parser under-scope (`unknown_sp_codes` array vs string-only `extractFieldErrors`) | **RESOLVED** pre-exec (spec rescoped) — to be exercised by T-03 |
| R-2 | WARN | NF-ASR-02 a11y not in T-02/T-03 ACs | **RESOLVED** pre-exec (a11y `Done when` added) |
| R-3 | WARN | AC-01.6 icon path unverified | **RESOLVED** during exec — AC-01.6 corrected to `/sps/{icon_key}.png`; code + tests match |
| R-5 | INFO | Pre-existing `selectedItemsSurfaceColor="#FFFFFF"` hex literal (Issue 4) | Open — non-blocking follow-up; token-map when `MultiselectComponent` API allows |
| R-6 | INFO | Live-shape verification of the per-result SP endpoint on `AC-1594-bilateral-module-v2` | Open — pre-merge step (Leader could not reach the live backend) |
| R-7 | INFO | Full-suite coverage floors not confirmable from the scoped run (WARN-COV) | Open — confirm in CI before merge |

No FAIL findings. No unresolved WARN for T-01.

---

## 11. Archive readiness recommendation

**NOT READY for `/sdd-archive`.** T-BIL-ASR-01 is complete and validated, but the spec is a 3-task bundle (one PR per `tasks.md` §4) and **T-BIL-ASR-02 + T-BIL-ASR-03 are not implemented**.

**Recommended path:**

1. Continue `/sdd-execute docs/specs/bilateral-module/alignment-section-remediation` → next eligible task **T-BIL-ASR-02** (PRMS-sourced read-only), then **T-BIL-ASR-03** (`unknown_sp_codes`; R-1 scope applies).
2. Re-run `/sdd-validate` once all three are done (full-suite coverage + behavioral checks for T-02/T-03).
3. Resolve R-6 (live-shape verification) + R-7 (CI coverage) before merging the bundled PR; R-5 may ship as a follow-up.
4. When all tasks `[x]`, no FAIL, WARNs accepted → `/sdd-archive`.

This arc remains **independent of OQ-IM-1** and can ship while that PO decision is pending.

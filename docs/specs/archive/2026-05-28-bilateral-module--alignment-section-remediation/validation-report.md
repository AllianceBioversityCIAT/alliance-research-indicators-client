# Validation Report — Bilateral Module / Alignment-Section Remediation

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/alignment-section-remediation/` |
| Validated against | `requirements.md` + `tasks.md` + `execution.md` (design inline in `tasks.md`) |
| Validation date | 2026-05-28 (final, full bundle) |
| Branch (FE) | `AC-1594-bilateral-module` @ `1ff8f25b` |
| Scope of this run | **Full bundle — all 3 tasks complete.** |
| Commits | T-01 `f0c05711` · T-02 `194d7e02` · T-03 `1ff8f25b` |
| Backend contract source | [`../ari-backend-context/frontend-data-model.md`](../ari-backend-context/frontend-data-model.md) §3.3/§4 (snapshot) |
| Validator | `/sdd-validate` (Claude, Leader) |
| Overall result | **PASS — all 3 tasks implemented + Reviewer-approved; full suite green.** |
| Archive readiness | **READY** (one pre-merge follow-up: R-6 live-shape verify — see §11). |

---

## 2. Summary

All three remediation tasks were executed through the JCSPECS Leader→Implementer→Reviewer loop and reached Reviewer **PASS**:

- **T-BIL-ASR-01** (per-result SP picker) — PASS attempt 2 (attempt 1 caught an icon-path regression → AC-01.6 corrected).
- **T-BIL-ASR-02** (PRMS-sourced read-only differentiation) — PASS attempt 1.
- **T-BIL-ASR-03** (`unknown_sp_codes` 400 handler) — PASS attempt 1.

Final full-suite verification (whole project, not scoped): **260 suites / 5219 tests pass**, coverage **99.77% stmts · 99.47% branches · 99.68% funcs · 99.85% lines** (far above the `jest.config.ts` floors of 40/20/45/30), `npm run lint` clean, `npm run build` exit 0. No cross-consumer regression from the `service-locator` / `services.interface` additions.

All prior validation WARNs are resolved (R-1, R-2 pre-exec; **R-3** via the AC-01.6 icon-path correction during exec; **R-7** via the full-suite coverage run here). Remaining items are non-blocking follow-ups (§10).

| Dimension | Result |
| --- | --- |
| Task completion | **3/3 complete** ✅ |
| File existence | **PASS** |
| Build integrity (full) | **PASS** — 5219 tests · 99%+ coverage · lint clean · build exit 0 |
| Requirement coverage | **REQ-01/02/03 all implemented** (every AC) + NF-ASR-01…04 |
| Linting & code quality | **PASS** (1 accepted scope expansion; 2 pre-existing non-blocking notes) |
| Design conformance (C-1…C-6) | **PASS** |

---

## 3. Task completion

| Task | Status | Attempts | Evidence |
| --- | --- | --- | --- |
| T-BIL-ASR-01 — Per-result SP picker | complete ✅ | 2 (FAIL→PASS) | `execution.md` §2; commit `f0c05711` |
| T-BIL-ASR-02 — PRMS-sourced read-only | complete ✅ | 1 (PASS) | `execution.md` §2; commit `194d7e02` |
| T-BIL-ASR-03 — `unknown_sp_codes` handler | complete ✅ | 1 (PASS) | `execution.md` §2; commit `1ff8f25b` |

Every completed task carries execution notes + Reviewer PASS + verification evidence. ✅

---

## 4. File existence

| File | Role | Result |
| --- | --- | --- |
| `shared/services/api.service.ts` | `GET_PoolFundingSciencePrograms` (catalog `GET_SciencePrograms` retained) | PASS |
| `shared/services/bilateral.service.ts` | SP signals + `getSciencePrograms()`; `extractUnknownSpCodes` (separate from unchanged `extractFieldErrors`); `unknownSpCodes` on `PatchAlignmentResult` | PASS |
| `shared/services/control-list/get-bilateral-science-programs.service.ts` | NEW — multiselect `serviceName` bridge (scope expansion, §7) | PASS |
| `shared/interfaces/bilateral/pool-funding-alignment.interface.ts` | per-result SP types | PASS |
| `shared/interfaces/services.interface.ts` · `service-locator.service.ts` | `bilateralSciencePrograms` registration | PASS |
| `pool-funding-alignment.component.{ts,html,scss}` | picker source + empty states; `readOnlyCause` badge/banner; `unknown_sp_codes` inline error + chip highlight | PASS |
| `*.spec.ts` (component, api, bilateral, control-list) | co-located tests | PASS |
| spec docs (`requirements.md`, `tasks.md`, `execution.md`, this report) | present + current | PASS |

`design.md` intentionally absent (inline per `tasks.md` §3) — WARN-info, accepted.

---

## 5. Build integrity (final, full bundle @ `1ff8f25b`)

| Check | Command (cwd `research-indicators/`) | Result |
| --- | --- | --- |
| Full unit tests + coverage | `npm run test` | **PASS** — 260 suites / **5219 tests**; coverage 99.77/99.47/99.68/99.85% (» floors 40/20/45/30) |
| Lint (TS/HTML) | `npm run lint` | **PASS** — "All files pass linting." |
| Build | `npm run build` | **PASS** — bundle generated, exit 0 (pre-existing warnings only: `pdfjs-dist` CommonJS on an untouched component; SCSS budgets) |

**R-7 RESOLVED:** the full-suite run confirms the project coverage floors are met (in fact ~99%+) and that no other suite regressed.
**SCSS lint note:** project-wide `npm run s-lint` reports 358 **pre-existing** failures; the new `.pf-sp-chip-rejected` rule adds **zero** new violations (Reviewer-confirmed). Pre-existing, out of scope.

---

## 6. Requirement coverage

### REQ-BIL-ASR-01 — implemented ✅
AC-01.1 per-result endpoint · AC-01.2 unmapped → contact-ops, no 13-SP fallback · AC-01.3 mapped-empty distinct message · AC-01.4 `STAR-` strip reused · AC-01.5 catalog retained · AC-01.6 chips `code — allocation%` + `/sps/{icon_key}.png` icon (corrected path) · AC-01.7 PATCH `sp_codes` unchanged. All covered by tests.

### REQ-BIL-ASR-02 — implemented ✅
AC-02.1 synced unchanged · AC-02.2 NEW "Owned by PRMS" badge+banner for `is_read_only && !is_synced_to_prms` · AC-02.3 permission unchanged · AC-02.4 PRMS-sourced 409 → refetch → prms-sourced banner · AC-02.5 inputs disabled identically across causes. `readOnlyCause` four-state derivation + DOM matrix tested.

### REQ-BIL-ASR-03 — implemented ✅
AC-03.1 `unknown_sp_codes` → inline `sp_codes` error, no toast · AC-03.2 rejected chips highlighted · AC-03.3 message names the codes (exact copy) · AC-03.4 selection change clears error + highlight. Tolerant parser + no-regression on the existing fieldErrors path, both tested.

### Non-functional
NF-ASR-01 (no new backend dep) ✅ · NF-ASR-02 (a11y: `role="status"` banners, `role="alert"` errors, badge `aria-label` parity) ✅ · NF-ASR-03 (no coverage regression — 99%+) ✅ · NF-ASR-04 (dark/light token parity, no hex) ✅.

---

## 7. Linting & code quality

- **Clean** (lint + strict TS via build). No new hex literals introduced (the PRMS badge reuses the `pf-synced` token; the chip-reject style uses `var(--ac-red-1)`).
- **Accepted scope expansion (T-01):** the `GetBilateralScienceProgramsService` + service-locator key + `services.interface.ts` entry exceed the files `tasks.md` literally listed, but are the minimal correct adaptation to the shared `MultiselectComponent` (`serviceName`→`ServiceLocatorService`, no `[options]` input). `BilateralService` stays the single source of truth. Reviewer-approved; recorded in `execution.md`.
- **Parser discipline (T-03):** `extractFieldErrors` left byte-for-byte unchanged; `extractUnknownSpCodes` is a separate, envelope-tolerant extractor. No regression on the existing 400 path (combined + non-unknown tests).

---

## 8. Design conformance

| Constraint | Result | Note |
| --- | --- | --- |
| C-1 (Angular 19 + PrimeNG 19) | PASS | Standalone component + services; signals; no new framework surface |
| C-3 (CLARISA vocab) | PASS | Per-result SP list backend-derived from CLARISA; catalog kept display-only — no parallel taxonomy |
| C-4 (WCAG 2.1 AA) | PASS | `role="status"` banners, `role="alert"` SP error, badge `aria-label`, icon alt text |
| C-5 (bundle budgets) | PASS | Build exit 0; only pre-existing SCSS-budget warnings on untouched components |
| C-6 (standalone) | PASS (N/A new route) | Modifies existing standalone component |
| Backend contract alignment | PASS | Endpoints/shape/read-only union/400 envelope per `frontend-data-model.md`; no-fallback pitfall honored |
| Spec correction (AC-01.6) | PASS | Icon-path reality-fix documented (Pivot Record, `execution.md`) |

---

## 9. Test evidence summary

New/updated tests across the bundle (all green within the 5219-test full run): per-result SP fetch with stripped numeric code; unmapped/no-SPs/empty-states + no-catalog-fallback; null-`mappingStatus` no-flash; `code — allocation%` + `/sps/` icon; `readOnlyCause` four-state matrix + AC-02.1…05 DOM + PRMS-sourced 409 refetch + non-PRMS 409 regression; `unknown_sp_codes` (array) → inline error + chip highlight, message copy, clear-on-change, no-regression on string-valued field errors, combined string+array case.

---

## 10. Remediation

| # | Severity | Finding | Status |
| --- | --- | --- | --- |
| R-1 | WARN | REQ-03 parser under-scope (`unknown_sp_codes` array vs string-only parser) | **RESOLVED** — separate `extractUnknownSpCodes`; tested |
| R-2 | WARN | NF-ASR-02 a11y not in T-02/T-03 ACs | **RESOLVED** — a11y delivered + tested |
| R-3 | WARN | AC-01.6 icon path unverified | **RESOLVED** — corrected to `/sps/{icon_key}.png`; code + tests match |
| R-7 | INFO | Full-suite coverage floors not confirmable from scoped runs | **RESOLVED** — full suite 99%+ this run |
| R-5 | INFO | Pre-existing `selectedItemsSurfaceColor="#FFFFFF"` hex literal | Open — non-blocking follow-up (token-map later) |
| R-6 | INFO | Live-shape verification on `AC-1594-bilateral-module-v2` (per-result SP envelope + `unknown_sp_codes` 400 shape: stringified-JSON vs object) | Open — **pre-merge step** (Leader cannot reach live backend; implementation tolerates both shapes) |
| R-8 | INFO | `ErrorResponse.errors` typed `string` while live envelope may be an object | Open — optional type-honesty follow-up if R-6 confirms object shape |
| R-9 | INFO | Backend doc cites `/assets/result-framework-reporting/SPs-Icons/`; STAR uses `/sps/` | Open — cross-repo coordination; revisit AC-01.6 if assets are provisioned |

**No FAIL findings. No unresolved WARN.** R-5/R-6/R-8/R-9 are INFO follow-ups, none blocking archive.

---

## 11. Archive readiness recommendation

**READY for `/sdd-archive`.** All three tasks are `complete`, every Reviewer verdict is PASS, all WARNs are resolved, the full suite passes with 99%+ coverage, and implementation drift (the AC-01.6 icon-path correction) is reflected in the spec + `execution.md`.

**Before/at PR merge (carry into the PR, not blockers for archiving the spec):**

1. **R-6 (live-shape verify)** — confirm the per-result SP endpoint envelope + the `unknown_sp_codes` 400 shape against a running `AC-1594-bilateral-module-v2` (the parser already tolerates both stringified-JSON and object forms). Best done from your backend session.
2. **Bundle the three commits into one PR** per `tasks.md` §4. Suggested title: `fix(bilateral-module/alignment-section): consume per-result SP picker + PRMS-sourced read-only + unknown_sp_codes validation`.
3. R-5 (`#FFFFFF`), R-8 (type honesty), R-9 (icon assets) — optional follow-ups.

To archive the spec now:

```text
/sdd-archive bilateral-module/alignment-section-remediation
```

This arc remains **independent of OQ-IM-1** and can ship while that PO decision is pending.

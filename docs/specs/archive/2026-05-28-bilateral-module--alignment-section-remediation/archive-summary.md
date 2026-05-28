# Archive Summary — Bilateral Module / Alignment-Section Remediation

## 1. Document control

| Field | Value |
| --- | --- |
| Spec name | Bilateral Module / Alignment-Section Remediation (`BIL-ASR`) |
| Branch | `AC-1594-bilateral-module` |
| Commits | `f0c05711` (T-01) · `194d7e02` (T-02) · `1ff8f25b` (T-03) · validation `59485a2d` |
| Triad | `.agents/` Leader→Implementer→Reviewer (scaffolded `14925dbf`) |
| Final validation | `validation-report.md` — **PASS, archive-ready** |

## 2. Original spec path

`docs/specs/bilateral-module/alignment-section-remediation/`

## 3. Archive date

2026-05-28

## 4. Final status

**COMPLETE — all 3 tasks PASS, full suite green (260 suites / 5219 tests, 99%+ coverage), lint clean, build exit 0.** No unresolved FAIL. No unresolved WARN. Non-blocking INFO follow-ups carried to the PR (see §9).

## 5. Requirements delivered

- **REQ-BIL-ASR-01** — Per-result SP picker (AC-01.1…07): picker sources the per-result endpoint scoped to the result's mapped CLARISA project (replaces the catalog-wide 13-SP call), with `unmapped` / mapped-empty empty states (no catalog fallback) and `code — allocation%` chips.
- **REQ-BIL-ASR-02** — PRMS-sourced read-only differentiation (AC-02.1…05): distinct "Owned by PRMS" badge + banner for `is_read_only && !is_synced_to_prms`, separate from synced + permission causes; inputs disabled identically; PRMS-sourced 409 resolves to the right banner after refetch.
- **REQ-BIL-ASR-03** — `unknown_sp_codes` 400 handler (AC-03.1…04): inline picker error naming the rejected codes + chip highlight, cleared on selection change; tolerant parser separate from the unchanged `extractFieldErrors`.
- **NF-ASR-01…04** — no new backend dep; WCAG 2.1 AA (roles/aria); no coverage regression (99%+); dark/light token parity (no hex).

## 6. Files changed summary (from `execution.md`)

- `shared/services/api.service.ts` — `GET_PoolFundingSciencePrograms` (catalog `GET_SciencePrograms` retained).
- `shared/services/bilateral.service.ts` — SP signals + `getSciencePrograms()`; `extractUnknownSpCodes` (separate from byte-for-byte-unchanged `extractFieldErrors`); `unknownSpCodes` on `PatchAlignmentResult`.
- `shared/services/control-list/get-bilateral-science-programs.service.ts` — **NEW** multiselect `serviceName` bridge.
- `shared/interfaces/bilateral/pool-funding-alignment.interface.ts` — per-result SP types.
- `shared/interfaces/services.interface.ts` + `shared/services/service-locator.service.ts` — `bilateralSciencePrograms` registration.
- `pages/.../pool-funding-alignment/pool-funding-alignment.component.{ts,html,scss}` — picker source + empty states; `readOnlyCause` badge/banner; `unknown_sp_codes` inline error + chip highlight.
- Co-located `*.spec.ts` for all of the above.

## 7. Test evidence summary

Final full-suite run (2026-05-28, `1ff8f25b`): **260 suites / 5219 tests pass**; coverage 99.77% stmts · 99.47% branches · 99.68% funcs · 99.85% lines (» `jest.config.ts` floors 40/20/45/30). Per-task scoped runs: T-01 274 / T-02 93 / T-03 105 tests. New tests cover every AC (per-result fetch + empty states + no-fallback + null-flash; `readOnlyCause` matrix + 409 paths; `unknown_sp_codes` array → inline error + chip highlight + clear-on-change + no-regression). `npm run lint` clean; `npm run build` exit 0.

## 8. Validation summary

`validation-report.md` (2026-05-28): overall **PASS**, archive **READY**. All 3 tasks complete with Reviewer PASS; build integrity green; REQ + AC coverage complete; design conformance C-1/C-3/C-4/C-5/C-6 PASS. No FAIL. WARNs R-1/R-2/R-3/R-7 all RESOLVED.

## 9. Accepted warnings or follow-ups

- **R-6 (pre-merge):** confirm the live response shapes on `AC-1594-bilateral-module-v2` (per-result SP envelope + `unknown_sp_codes` 400 shape: stringified-JSON vs object). Implementation tolerates both. Best done from the backend session.
- **R-5:** pre-existing `selectedItemsSurfaceColor="#FFFFFF"` hex literal — token-map later (not introduced by this work).
- **R-8:** optionally widen `ErrorResponse.errors` (`string` → `string | Record<string, unknown>`) if R-6 confirms the object shape.
- **R-9:** backend doc cites `/assets/result-framework-reporting/SPs-Icons/`; STAR uses the provisioned `/sps/` path. Revisit AC-01.6 if those assets are ever provisioned (cross-repo coordination).
- **SCSS:** project-wide `s-lint` has 358 pre-existing failures; this work added zero new violations.
- **PR:** bundle the three commits into one PR per `tasks.md` §4 (not yet opened at archive time).

## 10. Historical notes

- This arc remediated the **already-shipped** Pool Funding Alignment section ([archived parent](../2026-05-26-bilateral-module--alignment-section/)) to consume backend contracts landed on `AC-1594-bilateral-module-v2` (T-15.11 per-result SP picker, R-BIL-070 PATCH validation, R-BIL-071 read-only union). It is **independent of OQ-IM-1** (the PO-blocked indicator-mapping contribution write flow) and shipped in parallel.
- **Spec defect caught during execution:** T-01 attempt 1 followed AC-01.6's documented icon path `/assets/result-framework-reporting/SPs-Icons/{icon_key}.png`, which is unprovisioned in this repo → would have 404'd every SP icon. The Leader corrected AC-01.6 to the working `/sps/{icon_key}.png` path (Pivot Record in `execution.md`; resolved validation R-3) and the Implementer reworked to PASS on attempt 2.
- **Validation-driven pre-exec corrections:** the initial `/sdd-validate` rescoped REQ-03 (R-1 — the existing `extractFieldErrors` couldn't capture an array-valued field) and threaded NF-ASR-02 a11y into T-02/T-03 ACs (R-2) before execution began.
- The `.agents/` triad was scaffolded via `/sdd-constitution` (Active SDD safe-update) at the start of execution — the baseline already existed; only the triad personas were missing.

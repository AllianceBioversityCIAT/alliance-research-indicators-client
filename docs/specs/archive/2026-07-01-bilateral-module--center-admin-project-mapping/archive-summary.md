# Archive Summary — Center Admin: Bilateral Project Mapping

## 1. Document Control

| Field | Value |
| --- | --- |
| Spec | Center Admin → Bilateral Mapping (AGRESSO↔CLARISA project mapping CRUD) |
| Original spec path | `docs/specs/bilateral-module/center-admin-project-mapping/` |
| Archive path | `docs/specs/archive/2026-07-01-bilateral-module--center-admin-project-mapping/` |
| Branch | `AC-1594-bilateral-module` (unpushed; PR deferred by user) |
| Method | JCSPECS Leader→Implementer→Reviewer triad via `/sdd-execute` |
| Final status | ✅ COMPLETE (9/9 tasks, all Reviewer PASS attempt 1) |

## 2. Original Spec Path

`docs/specs/bilateral-module/center-admin-project-mapping/` (proposal → requirements → design → tasks → execution).

## 3. Archive Date

2026-07-01.

## 4. Final Status

All 9 tasks `[x]` completed and committed; feature live-verified in the testing environment (list + create + deactivate rendering against the real backend). Backend was **consume-only** (already implemented on `AC-1594-bilateral-module-v2`).

## 5. Requirements Delivered

- **REQ-BIL-CAM-01/02** — Center Admin nav entry + `centerAdminGuard`-protected lazy route `administration/center-admin/bilateral-mapping` (T-04).
- **REQ-BIL-CAM-03** — Paginated list (agreement, CLARISA project, source, confidence-when-not-MANUAL, status, last-updated) with loading/error(+retry)/empty states (T-03).
- **REQ-BIL-CAM-04** — Debounced search + `is_active`/`source` filters, AND-composed into one server query; page resets to 1 (T-03, gap test T-07).
- **REQ-BIL-CAM-05** — Create dialog with AGRESSO + CLARISA pickers (SP allocation preview) + notes; 409 (POST-only) surfaced from `errorDetail.errors`; 400 surfaced (T-05).
- **REQ-BIL-CAM-06** — Edit (agreement immutable, only changed fields) (T-05).
- **REQ-BIL-CAM-07** — Deactivate with `showGlobalAlert` confirmation, in-place row update, idempotent, telemetry (T-06).
- **NFRs** — lazy-loaded, tokenized colors (zero hex, light/dark parity), WCAG affordances (`role="alert"`, aria-labels), coverage floors held.
- **UX follow-up** — Status filter defaults to "Active" (T-09).

## 6. Files Changed Summary (from execution.md)

**Production (new):**
- `research-indicators/src/app/shared/interfaces/bilateral/bilateral-project-mapping.interface.ts`
- `research-indicators/src/app/shared/services/bilateral-mapping.service.ts` (+ spec)
- `research-indicators/src/app/pages/platform/pages/administration/center-admin/bilateral-mapping/bilateral-mapping.component.{ts,html,scss}` (+ spec)
- `research-indicators/src/app/testing/bilateral-project-mapping.fixture.ts`

**Production (edited):**
- `research-indicators/src/app/shared/services/api.service.ts` (+6 methods)
- `research-indicators/src/app/app.routes.ts` (+route)
- `research-indicators/src/app/shared/components/alliance-sidebar/alliance-sidebar.component.ts` (+menu child, + spec)
- `docs/detailed-design/detailed-design.md` (§2 page map)

**Commits:** `d8f10092` (T-01) · `e81a3dcb` (T-02) · `edc4bf59` (T-03) · `2309d468` (T-04) · `3ab5a03f` (T-05) · `fee08362` (T-06) · `d6780323` (T-07) · `842f75b1` (T-08) · `e8ee29cf` (T-09 + OQ-POOL brief).

## 7. Test Evidence Summary

- Tests were embedded per task (no separate `/sdd-test` run — **absence of `test-report.md` explicitly accepted**; evidence is in `execution.md` per-attempt).
- `bilateral-mapping.service.spec.ts` 15 tests; `bilateral-mapping.component.spec.ts` 56 tests; `alliance-sidebar.component.spec.ts` role-gate (present-for-admin + hidden-for-non-admin); shared fixture.
- Full suite: **5742 passing** (1 pre-existing, unrelated `multiselect.component.spec.ts` failure — see §9). Coverage floors held (~99% stmts / 98% branches / 99% lines / 98% funcs vs 40/20/45/30).
- Contract verified against backend source + runtime (409 POST-only, message in `errorDetail.errors`; agreement immutable on edit).

## 8. Validation Summary

- No separate `/sdd-validate` run — **absence of `validation-report.md` explicitly accepted**. Validation was performed via (a) per-task Reviewer PASS verdicts (independent read-only audits, all attempt-1 PASS), and (b) live verification in the testing environment (user-confirmed screenshots: page renders, list/create/deactivate working).
- No unresolved FAIL findings.

## 9. Accepted Warnings Or Follow-Ups

1. **OQ-POOL (HIGH, backend — out of scope):** product intent is that a bilateral mapping should make the project show the "Contributing to Pool Funding" tag; today the tag (`agresso_contracts.is_pool_funding_contributor`) is decoupled from `bilateral_project_mapping`. Brief handed off in [`backend-handoff-oq-pool.md`](./backend-handoff-oq-pool.md). Owner: backend session (`AC-1594-bilateral-module-v2`).
2. **OQ-DEPLOY:** confirm with devops which branch the testing env tracks (endpoints live on `AC-1594-bilateral-module-v2`, not `main`).
3. **OQ-4:** retire the React SSR admin page `/admin/bilateral-project-mappings` after the Angular page is validated (backend repo).
4. **Pre-existing, unrelated:** `multiselect.component.spec.ts` › "should handle setValue with new options" fails on this branch independent of this feature (last touched in `e9d75b3d`, pre-session) — track separately.
5. **PR deferred:** user will open the branch PR later.

## 10. Historical Notes

- Investigation reframed the request: the backend CRUD + picker endpoints were **already built**, so scope was FE-only consume (user-confirmed), with the Angular page replacing the React SSR reference page.
- Backend confirmations (2026-07-01) corrected the 409 contract mid-execution (message in `errorDetail.errors`, POST-only) — spec updated before the affected tasks ran; no rework needed.
- One Reviewer agent died on a transient API `ECONNRESET` (T-05) before emitting a verdict; a second Reviewer completed the audit — implementation was never reworked.
- Design decisions carried over from prior bilateral work: D-6a (confirmation via `showGlobalAlert`, no `p-confirmdialog`), D-8a (raw PrimeNG selects acceptable). New: read `errorDetail.errors` first for user-facing API errors.

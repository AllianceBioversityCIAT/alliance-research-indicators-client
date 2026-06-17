# Archive Summary — Bilateral Module / ToC Mapping v2

## 1. Document control

| Field | Value |
| --- | --- |
| Original spec path | `docs/specs/bilateral-module/toc-mapping-v2/` |
| Archive date | 2026-06-17 |
| Archived by | `/sdd-archive` |
| Final status | **Complete with one accepted follow-up** — T-BIL-TM2-01…05 + 07 done (Reviewer PASS each); **T-06 (live sign-off) deferred** as an accepted post-archive follow-up |
| Module | bilateral-module — Pool Funding Alignment tab |
| Branch | `AC-1594-bilateral-module` |
| Supersedes | the archived `indicator-mapping` + `hlo-grouped-mapping` specs (AOW-pair modal model) |
| Follow-up UX fix | the archived [`toc-mapping-save-gating-ux`](../2026-06-17-bilateral-module--toc-mapping-save-gating-ux/) (reveal-on-Yes + required-answer) |

## 2. Original spec path

`docs/specs/bilateral-module/toc-mapping-v2/` — the lambda-toc level-based ToC catalog read + inline per-SP alignment write that replaced the retired (SP, AOW)-pair modal flow.

## 3. Archive date

2026-06-17.

## 4. Final status

**Complete with one accepted follow-up.** The full client implementation arc shipped and the wire contract was verified against the running backend; only the live golden-path sign-off against the *deployed testing env* remains (T-06), which is gated on the backend session's deploy and is explicitly accepted here as a post-archive follow-up.

| Task | Status |
| --- | --- |
| T-BIL-TM2-01 wire DTOs + fixtures | ✅ |
| T-BIL-TM2-02 BilateralService / ApiService refit | ✅ |
| T-BIL-TM2-03 `SpTocAlignmentBlockComponent` | ✅ |
| T-BIL-TM2-04 page rework (blocks, drafts, save, gates) | ✅ |
| T-BIL-TM2-05 retire the modal flow | ✅ |
| T-BIL-TM2-06 LIVE-VERIFY on testing env | `[~]` **deferred** (accepted follow-up — see §9) |
| T-BIL-TM2-07 archive superseded specs + docs sync | ✅ |

## 5. Requirements delivered

R-BIL-090…098 (less the cutover/cleanup that lived backend-side) + NFR-BIL-090…092: level-based catalog read (frozen FE envelope), server-owned `result_type`→`allowed_levels` rule consumption, per-SP independent ToC alignment write, version gate (2026), snapshot read-back, modal retirement, docs sync. Backend counterpart (T-01…T-08) shipped on `AC-1594-bilateral-module-v2`.

## 6. Files changed summary

Per `execution.md`: new `SpTocAlignmentBlockComponent`; reworked `pool-funding-alignment.component.*`; `BilateralService`/`ApiService` catalog + draft seams; v2 wire types + `toc-catalog.fixture.ts`; deletion of the HLO modal / action-card / modal-era types (T-05); `detailed-design.md` + `figma-mockups` docs sync (T-07). Client-only; the backend contract is owned by the other repo.

## 7. Test evidence summary

No standalone `test-report.md` — **absence accepted** (evidence in `execution.md`): full suite green throughout (5316 → 5363 tests across the arc), page + service specs cover the read reshape, per-SP independence, save/pre-fill, version gate, 400/409 routing, stale snapshots; coverage floors held; lint + AOT tsc clean.

## 8. Validation summary

No standalone `validation-report.md` — **absence accepted**: executed via the JCSPECS Implementer→Reviewer triad with a Reviewer PASS per task (independent lint/tsc/test re-runs + spec-conformance audit). Additionally, a static cross-repo contract check (2026-06-10) confirmed the catalog read + PATCH write match the backend's served Swagger; the read-back was reconciled to the backend's flat shape (D-10). No unresolved FAIL findings.

## 9. Accepted warnings or follow-ups

- **T-BIL-TM2-06 (deferred, accepted):** the live §12 golden-path against the **deployed testing env** (CapSharing single-level, Policy two-level, two-SP independence 10/25, non-2026 lock, PRMS-synced read-only) is not yet run end-to-end on testing. Local verification against a running backend (:3001) passed (contract match + SP cascade from real lambda-toc data, 2026-06-17); the remaining step is gated on the backend deploy to testing. Re-verify there before/at production rollout.
- **Catalog-503 robustness gap (open, recommended):** a top-level `hlos-indicators` cold-cache 503 leaves `allowed_levels` unknown, so the ToC section + its block-level retry silently vanish (no page-level catalog-error banner). Small page-level error+retry recommended.
- Design pivots recorded in `design.md` §11: D-8a (raw PrimeNG cascade selects), D-6a (`showGlobalAlert` destructive-confirm), D-10 (flat read-back). The follow-up `toc-mapping-save-gating-ux` later refined OQ-UX-3 (per-SP ToC answer is required before save).

## 10. Historical notes

- Replaced the (SP, AOW)-pair modal model (archived `indicator-mapping` / `hlo-grouped-mapping`) with the lambda-toc level-based catalog + inline per-SP cascade. Two-session workflow: this FE spec + a backend `toc-mapping-v2` spec on `alliance-research-indicators-main`.
- Post-archive UI polish (committed on the branch, outside the formal task set): SP-picker chip allocation/icon resolution, short contribution input, dropdown-panel overflow containment, and the required per-SP-answer save gate (the `toc-mapping-save-gating-ux` follow-up spec, archived separately).

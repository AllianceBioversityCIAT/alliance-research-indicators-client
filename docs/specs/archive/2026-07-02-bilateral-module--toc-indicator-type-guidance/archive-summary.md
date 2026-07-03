# Archive Summary — ToC Mapping: Indicator-Type Guidance

## 1. Document Control

| Field | Value |
| --- | --- |
| Original spec path | `docs/specs/bilateral-module/toc-indicator-type-guidance/` |
| Archive path | `docs/specs/archive/2026-07-02-bilateral-module--toc-indicator-type-guidance/` |
| Archive date | 2026-07-02 |
| Branch | `AC-1594-bilateral-module` (unpushed at archive time) |
| Final status | ✅ COMPLETE — all 6 tasks Reviewer-PASS on attempt 1; manual golden path signed off by the user 2026-07-02 |
| Parent spec | `docs/specs/archive/2026-06-17-bilateral-module--toc-mapping-v2/` (this spec resolved its OQ-1/OQ-2/A-4/D-5) |

## 2. What Shipped

"Guide, don't block" indicator-type guidance in the Pool Funding Alignment ToC cascade, FE-only, zero contract changes. A pure classification util (`type-match` / `wildcard` / `other` / `unclassified` from `result_type` × `type_value`) drives: grouped indicator dropdown ("Recommended for \<type\>" / "Other indicators") with type badges, HLO compatibility tags (exact-match only, D-ITG-4), a no-match guidance notice with ≤5 clickable compatible-HLO suggestions, a non-blocking cross-type warning (also on saved-alignment re-open), and neutral degradation for unmatrixed result types (`oicr`/`unknown`) or unusable upstream typing. AI was assessed and deliberately deferred to an evidence-gated Phase 2 (see proposal §4).

## 3. Requirements Delivered

- REQ-BIL-ITG-01 (AC-01.1..4) — classification matrix + total function (T-01).
- REQ-BIL-ITG-02 (AC-02.1..5) — grouped/badged dropdown, flat fallback, filter across groups (T-03).
- REQ-BIL-ITG-03 (AC-03.1..4) — cross-type warning, non-blocking, stale-safe (T-04).
- REQ-BIL-ITG-04 (AC-04.1..5) — HLO tags + no-match notice + suggestion navigation (T-05).
- REQ-BIL-ITG-05 (AC-05.1..3) — neutral degradation (T-01/T-03).
- REQ-BIL-ITG-06 (AC-06.1..3) — zero regression: payload proven unchanged by test, one sanctioned literal-shape assertion update, passive guidance under lock (T-03..06).
- NF-01..05 — perf (<5 ms avg classification, zero new HTTP), a11y (status roles, text-not-color, keyboard), bundle (+1.43 kB gzip ≤ 5 KB), theming (token-only, dark parity), copy colocated.

## 4. Files Changed Summary (from `execution.md`)

- **New**: `pool-funding-alignment/utils/indicator-type-guidance.util.ts` + `.spec.ts`.
- **Modified**: `sp-toc-alignment-block.component.{ts,html,scss,spec.ts}` (guidance computeds + UI), `pool-funding-alignment.component.{ts,html,spec.ts}` (`resultType` wiring + payload test), `testing/toc-catalog.fixture.ts` (append-only classification states), `interfaces/bilateral/pool-funding-alignment.interface.ts` (comments only).
- **Commits**: `5b1f5dd0` (docs) · `d04802f9` (T-01) · `e49371aa` (T-02) · `b0a3497f` (T-03) · `65d74ee3` (T-04) · `ccb147b6` (T-05) · `84bd442d` (T-06 sweep) · `dc541a03` (close-out).

## 5. Test & Validation Evidence

No separate `test-report.md`/`validation-report.md` — **absence accepted**; evidence is recorded per-task in `execution.md` (the established pattern of the bilateral-module spec family):

- Full suite at close: 5926 passed / 1 failed — the failure is the **pre-existing, unrelated** `multiselect.component.spec.ts:426` (reproduced on clean HEAD twice via stash control).
- Coverage: 99.14% statements / 97.78% branches / 98.62% functions / 99.44% lines (floors 40/20/45/30).
- Bundle: pool-funding-alignment lazy chunk 10.75 → 12.18 kB gzip (+1.43 kB ≤ 5 kB); build warnings byte-identical to baseline.
- Every task independently re-verified by the Reviewer agent (tests re-run, lint, stylelint, copy byte-compared vs design).
- Manual golden path (mixed HLO, incompatible HLO + suggestion click, cross-type save round-trip, locked view, overlay wrapping, dark/light) — **user sign-off 2026-07-02**.

## 6. Accepted Warnings / Follow-Ups

1. **OQ-1** — BA sign-off on the exact matrix strings (esp. "Number of Policy (Policy Change)"); overruling is a one-line matrix edit + fixture update.
2. **OQ-2** — verify production-lambda `type_value` completeness before release (test lambda has ~1/3 untyped at OUTCOME/EOI; neutral degradation covers behavior either way).
3. **Phase 2 (AI suggestion)** — separate proposal, gated on observed cross-type mapping frequency (measured by joining saved `indicator_id` to catalog types — reporting-side, proposal OQ-A).
4. Pre-existing branch issues NOT from this spec: `multiselect.component.spec.ts:426` failure; 350 repo-wide s-lint errors in untouched files.
5. Cosmetic: the util spec contains one intentional NUL character (totality-test input) so git binary-diffs that file.

## 7. Historical Notes

- Data analysis (2026-07-02, test lambda, 8 SPs) that shaped the design: a hard type filter would empty 95% of HLOs for Capacity Sharing in SP01/SP04 — hence "guide, don't block".
- R-2 (PrimeNG group+filter risk) resolved: native PrimeNG 19 grouped-select filtering works; no custom filter fallback needed.
- Warning color: `--ac-orange-1` on border+icon only; amber body text would fail WCAG AA contrast.
- Backend rule source referenced (read-only): `alliance-research-indicators-main` → `bilateral/utils/toc-level-rules.util.ts` — only `capacity_sharing`/`innovation_dev` (OUTPUT) and `policy_change` (OUTCOME/EOI) reach the cascade today.

# Archive Summary — Bilateral Module / Indicator Mapping

## 1. Document control

| Field | Value |
| --- | --- |
| Original spec path | `docs/specs/bilateral-module/indicator-mapping/` |
| Archive date | 2026-06-10 |
| Archived by | T-BIL-TM2-07 (toc-mapping-v2) |
| Final status | **Superseded** — replaced by [`../../bilateral-module/toc-mapping-v2/`](../../bilateral-module/toc-mapping-v2/) |
| Jira | AC-1439 (US3 ToC indicators) · AC-1440 (US4 map results→indicators) |

## 2. Original spec path

`docs/specs/bilateral-module/indicator-mapping/` (US3/US4 — the modal-tree HLO/indicator contribution flow over PRMS `(SP, AOW)` pairs).

## 3. Archive date

2026-06-10.

## 4. Final status

**Superseded by `toc-mapping-v2`.** Per the toc-mapping-v2 proposal §7–§8, this spec's core UX premise (modal tree picker over SP→AOW pairs, multi-indicator checkbox selection, HLO cards with a polymorphic reason dropdown) and its data contract (the AOW-pair `hlos-indicators` envelope: `pairs[]` / `aow_status` / `no_aow_mappings`) were both invalidated by the lambda-toc pivot:

- The new model browses by **level** (`OUTPUT`/`OUTCOME`/`EOI`) per Science Program, not by `(SP, AOW)` pair.
- Mapping is an **inline per-SP cascade** (Level → HLO → Indicator → quantitative contribution vs the 2026 target), replacing the modal entirely.
- The gating question **OQ-IM-1** (the 5-type polymorphic contribution body, R-BIL-031) is **moot** — the new flow has no reason field and no polymorphism.

The read-side code that *did* ship under this spec (the HLO selection modal, the bilateral-action-card, the modal-context service, and the `BilateralHlosIndicatorsResponse`/`IndicatorRow`/`HloMapping` type family) was **deleted** in `toc-mapping-v2` task **T-BIL-TM2-05** (commit `fd41fee7`).

## 5. Requirements delivered

Partial — read-side only, then held at the OQ-IM-1 gate; the write-side was never built.

- **Shipped (read-side / scaffolding):** T-BIL-IM-RR-01 (alignment-section mockup remediation, via the `alignment-section/` sibling), T-BIL-IM-02 (`'hloSelection'` modal key + `HloSelectionModalContextService`), T-BIL-IM-03 (`BilateralActionCardComponent`), T-BIL-IM-04 read-slice (`BilateralHlosIndicatorsResponse` family + `GET_PoolFundingHlosIndicators`), T-BIL-IM-05 (`HloSelectionModalComponent`), T-BIL-IM-06 (disabled-row primitive), T-BIL-IM-07 (seed-on-open + Cancel-confirm), T-BIL-IM-14 (AR.3 decoupling regression), T-BIL-IM-16 (`no_aow_mappings` default). Committed to `AC-1594-bilateral-module` (`112dc10a` → `e373f8d9`).
- **Never built (write-side, gated on OQ-IM-1):** T-BIL-IM-01 full slice, T-BIL-IM-08 (HLO card header/target/reason), T-BIL-IM-09 (quantitative contribution row), T-BIL-IM-10 (HLO-card render loop), T-BIL-IM-11 (diff-and-batch save).

## 6. Files changed summary

Per `execution.md`: read-side modal/action-card/context-service + the `BilateralHlosIndicatorsResponse`/`IndicatorRow`/`HloMapping` type family + `bilateral.fixtures.ts` + `GET_PoolFundingHlosIndicators`. **All of this shipped code was subsequently removed by toc-mapping-v2 T-BIL-TM2-05** (`fd41fee7`) — see that spec's `execution.md`.

## 7. Test evidence summary

Shipped tasks were green at archive time of the read-side arc: 67/67 across the 3 affected spec files; modal/action-card/context-service suites passing (per `validation-report.md` and `execution.md`). Those specs were deleted with their subjects in T-BIL-TM2-05.

## 8. Validation summary

`validation-report.md` (2026-05-26): **12 PASS / 3 WARN / 0 FAIL**. The 4 shipped tasks validated clean; the remaining 12 tasks were "cannot be validated — not started", explicitly blocked on the gating Open Questions (the *intended* state). No unresolved FAIL findings.

## 9. Accepted warnings or follow-ups

The 3 WARNs (gating-OQ surface area, full-suite coverage proof, deferred constitutional-doc updates) are **moot** under supersession — the gated work was never built and the pivot replaced the contract. OQ-IM-1 / OQ-IM-4 / OQ-IM-10 are retired with this spec. No follow-ups carry forward except those already absorbed into `toc-mapping-v2`.

## 10. Historical notes

- The PRMS-team clarification (2026-05-28) that mapping is **indicator-level only** (HLO is a read-only grouping) carried forward into `toc-mapping-v2`.
- Salvage list lives in `toc-mapping-v2/proposal.md` §10.
- Same disposition applied in the backend repo (`alliance-research-indicators-main`) per the two-repo workflow; the backend `toc-mapping-v2` spec replaced the AOW-pair read.
- `open-questions-for-ba.md` (the OQ-IM-1 PO escalation + the 2026-05-27 ToC backend audit) is retained here for the full decision trail.

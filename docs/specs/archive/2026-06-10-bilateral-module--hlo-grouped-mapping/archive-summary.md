# Archive Summary — Bilateral Module / HLO-Grouped Mapping

## 1. Document control

| Field | Value |
| --- | --- |
| Original spec path | `docs/specs/bilateral-module/hlo-grouped-mapping/` |
| Archive date | 2026-06-10 |
| Archived by | T-BIL-TM2-07 (toc-mapping-v2) |
| Final status | **Superseded — never implemented** — replaced by [`../../bilateral-module/toc-mapping-v2/`](../../bilateral-module/toc-mapping-v2/) |

## 2. Original spec path

`docs/specs/bilateral-module/hlo-grouped-mapping/` (REQ-BIL-HGM-* — a **FE-only** refinement of the indicator-mapping modal: group indicators under collapsible HLO section headers + an Outcome/Output badge + label polish).

## 3. Archive date

2026-06-10.

## 4. Final status

**Superseded — designed but never implemented.** This spec refined the display of the HLO **selection modal**, which `toc-mapping-v2` deletes outright (the inline per-SP cascade replaces the modal flow). Zero code shipped under this spec; the modal it refined was removed in toc-mapping-v2 T-BIL-TM2-05. Per the toc-mapping-v2 proposal §8: *"FE-only refinement of the modal being deleted; zero code shipped. Archive as designed-but-superseded."*

## 5. Requirements delivered

None — all tasks (`tasks.md` §4) were `pending` at archive time. The HLO-grouped display, Outcome/Output badge, and label polish were specced but never coded.

## 6. Files changed summary

None. No implementation commits exist for this spec.

## 7. Test evidence summary

N/A — no code, no tests authored.

## 8. Validation summary

N/A — no `validation-report.md`; never reached validation (no implementation).

## 9. Accepted warnings or follow-ups

The non-gating open questions (OQ-HGM-1 AOW name, OQ-HGM-2 indicator Code field, OQ-HGM-3 Outcome/Output UX, OQ-HGM-5 label) are retired with this spec. Any still-relevant display intent (Outcome/Output distinction, AOW-prefixed labels) was re-expressed in `toc-mapping-v2` against the new level-based catalog — e.g. the AOW-prefixed HLO labels (AC-05.4) and the level labels (§4.7).

## 10. Historical notes

- Built on the (now-deleted) read-side modal of `indicator-mapping/` (see that spec's archive summary).
- Revised 2026-05-28 to indicator-only after the PRMS-team clarification that there is no HLO-level mapping; that principle carried forward into `toc-mapping-v2`.

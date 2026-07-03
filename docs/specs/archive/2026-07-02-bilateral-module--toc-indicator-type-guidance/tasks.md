# Tasks — ToC Mapping: Indicator-Type Guidance

> Spec: `docs/specs/bilateral-module/toc-indicator-type-guidance/` · Pairs with [`./requirements.md`](./requirements.md) + [`./design.md`](./design.md) · Executed by `/sdd-execute`.

---

## 1. Goal

Ship the deterministic indicator-type guidance (grouped/badged indicator dropdown, HLO hints, no-match guidance, cross-type warning, neutral degradation) inside the Pool Funding Alignment cascade, FE-only, with zero contract or save-behavior changes.

## 2. Pre-flight checklist

- [x] `requirements.md` and `design.md` exist and are approved (2026-07-02).
- [x] PRD constraints cited (C-1, C-4, C-5, C-6) still current.
- [ ] No conflicting in-flight spec under `docs/specs/bilateral-module/` (toc-mapping-v2 is archived; center-admin-project-mapping is archived).
- [ ] Branch: continue on `AC-1594-bilateral-module` or cut a child branch per repo habit.

## 3. Dependency graph

```
T-BIL-ITG-01 (pure util + spec, no deps)
T-BIL-ITG-02 (fixture extension, no deps)
    01 ─┬─▶ T-BIL-ITG-03 (grouped/badged dropdown + resultType wiring)
    02 ─┘        ├─▶ T-BIL-ITG-04 (cross-type warning)
                 └─▶ T-BIL-ITG-05 (HLO hints + no-match notice)
                         └─▶ T-BIL-ITG-06 (regression/a11y/dark sweep + manual golden path)
                 (04 also feeds 06)
```

## 4. Tasks

---

#### T-BIL-ITG-01 — *Classification util: matrix, labels, `classifyIndicator()`*

- **Status**: `completed` ✅ (2026-07-02, Reviewer PASS attempt 1 — see `execution.md`)
- **Depends on**: none
- **Discharges ACs**: AC-01.1, AC-01.2, AC-01.3, AC-01.4, AC-05.3
- **Touches**:
  - `research-indicators/src/app/pages/platform/pages/result/pages/pool-funding-alignment/utils/indicator-type-guidance.util.ts` (new)
  - `…/utils/indicator-type-guidance.util.spec.ts` (new)
- **Summary**: Pure constants (`TOC_TYPE_MATRIX`, `RESULT_TYPE_LABELS`, `TYPE_BADGE_LABELS`) and total function `classifyIndicator(resultType, typeValue)` per design §2; no Angular imports.
- **Implementation notes**: exact-string match after `trim()` (case-sensitive, D-ITG-6); `custom` ⇒ `'wildcard'` for any matrixed result type; null/`_n_*`/unknown strings ⇒ `'unclassified'`; unmatrixed `resultType` ⇒ always `'unclassified'`.
- **Tests to add/update**: util spec — full matrix table (5 result types × {exact match, cased variant, custom, other-canonical, null, empty, `_n_*`, arbitrary string}), `oicr`/`unknown`/null result type, never-throws property.
- **Done when**: all listed ACs pass in the spec; `npm run lint` clean; `npm run test` green.

---

#### T-BIL-ITG-02 — *Fixture: full classification coverage*

- **Status**: `completed` ✅ (2026-07-02, Reviewer PASS attempt 1 — see `execution.md`)
- **Depends on**: none
- **Discharges ACs**: (enabler for AC-02.*, AC-03.*, AC-04.*)
- **Touches**: `research-indicators/src/app/testing/toc-catalog.fixture.ts`
- **Summary**: Add indicators typed `Number of people trained (capacity sharing for development)`, one `null` `type_value`, and one `_n_*`-prefixed value, distributed so at least one HLO is mixed, one has zero type-matches, and one level has zero type-matches anywhere.
- **Implementation notes**: extend, don't reshape — existing consumers assert on current entries; append new HLOs/indicators with distinct ids.
- **Tests to add/update**: none (fixture); existing suites must stay green.
- **Done when**: `npm run test` green with no modifications to unrelated assertions.

---

#### T-BIL-ITG-03 — *Grouped + badged indicator dropdown, `resultType` wiring*

- **Status**: `completed` ✅ (2026-07-02, Reviewer PASS attempt 1 — see `execution.md`)
- **Depends on**: T-BIL-ITG-01, T-BIL-ITG-02
- **Discharges ACs**: AC-02.1, AC-02.2, AC-02.3, AC-02.4, AC-02.5, AC-05.1, AC-05.2
- **Touches**:
  - `…/components/sp-toc-alignment-block/sp-toc-alignment-block.component.ts` (+`resultType` input, `guidanceEnabled`, `classifiedIndicators`, `indicatorGroupsEnabled`, `indicatorSelectOptions`, copy constants)
  - `…/sp-toc-alignment-block.component.html` (`[group]`, group/item templates, badge chip)
  - `…/sp-toc-alignment-block.component.scss` (`__type-badge` chip, tokens, dark parity)
  - `…/pool-funding-alignment.component.ts` (`resultType` computed) + `.html` (`[resultType]` binding)
  - `research-indicators/src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts` (comment updates only: `type_value` / `result_type` now consumed by this spec)
- **Summary**: Design §4.2 items 3 + page wiring: grouped options (recommended = type-match then wildcard; other = other + unclassified), flat fallback when no recommended, badges from `TYPE_BADGE_LABELS`.
- **Implementation notes**: verify PrimeNG group+filter interplay (design R-2) — if the native filter mishandles group headers, add a filter callback here; keep option-count parity (AC-02.5).
- **Tests to add/update**: `sp-toc-alignment-block.component.spec.ts` — grouped render, flat fallback, badge presence/absence, search across groups, parity count, full suppression for `resultType` ∈ {`oicr`, `unknown`, null}.
- **Done when**: listed ACs pass; existing block/page suites green (AC-06.2 scoped changes only); lint clean; manual check of overlay width/wrapping with badges.

---

#### T-BIL-ITG-04 — *Cross-type selection warning*

- **Status**: `completed` ✅ (2026-07-02, Reviewer PASS attempt 1 — see `execution.md`)
- **Depends on**: T-BIL-ITG-03
- **Discharges ACs**: AC-03.1, AC-03.2, AC-03.3, AC-03.4
- **Touches**: block `.ts` (`selectedIndicatorClassification`, `CROSS_TYPE_WARNING`), `.html` (notice under indicator select), `.scss` (`__notice--warning`)
- **Summary**: Non-blocking inline warning when the selected indicator classifies `'other'`; derived from draft + catalog so saved cross-type alignments warn on re-open with no draft mutation.
- **Implementation notes**: `role="status"` + `aria-live="polite"`; icon + text (color never sole signal); no interaction with save gating or the contribution panel reveal.
- **Tests to add/update**: block spec — warning on select, absent for type-match/wildcard/unclassified, present on pre-populated cross-type draft, absent when saved indicator unresolvable in catalog, contribution panel + emit unaffected.
- **Done when**: listed ACs pass; lint + tests green.

---

#### T-BIL-ITG-05 — *HLO hints + no-match guidance notice*

- **Status**: `completed` ✅ (2026-07-02, Reviewer PASS attempt 1 — see `execution.md`)
- **Depends on**: T-BIL-ITG-03
- **Discharges ACs**: AC-04.1, AC-04.2, AC-04.3, AC-04.4, AC-04.5
- **Touches**: block `.ts` (`hasTypeMatch` on `HloSelectOption`, `compatibleHloSuggestions`, `showNoTypeMatchNotice`, copy constants), `.html` (HLO item tag, notice between HLO and indicator fields), `.scss` (`__type-tag`)
- **Summary**: Design §4.2 items 1–2: per-HLO tag (exact type-match only, D-ITG-4), notice listing ≤5 compatible same-SP-same-level HLOs as buttons routed through `onHloChange`, anywhere-empty variant per AC-04.4.
- **Implementation notes**: suggestion buttons disabled when `disabled()` (AC-06.3); notice disappears when selected HLO gains a type-match; `role="status"`.
- **Tests to add/update**: block spec — tag presence (match) / absence (wildcard-only), notice + suggestions list + cap of 5, suggestion click emits HLO change with downstream reset, anywhere-empty copy, notice hidden while no HLO selected and when guidance disabled.
- **Done when**: listed ACs pass; lint + tests green.

---

#### T-BIL-ITG-06 — *Regression, a11y, theming sweep + manual golden path*

- **Status**: `completed` ✅ (2026-07-02 — automatable sweep Reviewer PASS attempt 1 + manual live golden path signed off by the user same day; see `execution.md`)
- **Depends on**: T-BIL-ITG-04, T-BIL-ITG-05
- **Discharges ACs**: AC-06.1, AC-06.2, AC-06.3, REQ-BIL-ITG-NF-01..05
- **Touches**: (verification-first; small fixes land where found)
- **Summary**: Prove no behavioral regression and NFR conformance, then run the manual golden path on a live build.
- **Implementation notes / checklist**:
  - PATCH payload unchanged — assert emitted `SpAlignmentDraft`/write DTO shape in page spec (AC-06.1).
  - Read-only / `version_locked` / `disabled` renders guidance passively (AC-06.3).
  - Keyboard pass: group nav in the select overlay, focus visible on suggestion buttons; screen-reader labels announced (NF-02).
  - Dark/light parity of badge/tag/warning styles (NF-04).
  - Perf sanity: classification recompute on the largest fixture < 5 ms (unit assertion, NF-01); bundle delta ≤ 5 KB (`ng build` output vs baseline, NF-03).
  - Manual golden path (design §12) on local/testing deploy with a capacity-sharing result: mixed HLO, incompatible HLO + suggestion click, cross-type save round-trip, locked view.
- **Tests to add/update**: page spec payload assertion; any gap tests discovered during the sweep.
- **Done when**: `npm run lint` + `npm run test` + `npm run test:coverage` green (coverage ≥ floors in `detailed-design.md` §10); manual golden path passes; spec statuses updated.

---

## 5. Testing expectations (global rules)

Per `general-setup/task.md` §5: Jest via `jest-preset-angular` (`npm run test` from `research-indicators/`), co-located specs, shared fixtures under `src/app/testing/`, assert both enabled and disabled/read-only renderings.

## 6. Execution conventions

- Suggested bundling: T-01+T-02 as one PR (pure prep, no UI); T-03, T-04+T-05, T-06 individually or as the repo's single-branch flow dictates. Record deviations in `design.md` §11.
- PR title: `feat(bilateral): indicator-type guidance in ToC mapping cascade` (+ task refs).
- Commit prefix convention in this repo: `[SPEC:bilateral-module/toc-indicator-type-guidance]`.

## 7. Rollout & feature flags

No flag: additive, non-blocking UI over an unreleased-to-production module; neutral degradation is the built-in kill-switch (an upstream `type_value` drift disables guidance rather than breaking the cascade). Rollout dev → testing deploy (manual golden path) → prod with the module.

## 8. Rollback plan

Each task reverts cleanly with `git revert` (no schema, contract, or storage changes). Worst-case rollback = revert T-03..05 commits; the cascade returns to today's unfiltered behavior byte-for-byte.

## 9. Open items

- OQ-1 (BA matrix sign-off) — if strings change post-ship, one-line matrix edit + fixture update (design R-4).
- OQ-2 — verify production-lambda `type_value` completeness before release copy-tuning.
- Phase 2 (AI suggestion) — separate proposal, gated on observed cross-type mapping frequency (proposal §4/OQ-A).

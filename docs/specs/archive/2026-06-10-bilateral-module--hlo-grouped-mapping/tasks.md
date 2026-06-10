# Tasks — Bilateral Module / HLO-Grouped Mapping

> Execution units for [`./requirements.md`](./requirements.md) + [`./design.md`](./design.md). Follows [`../../general-setup/task.md`](../../general-setup/task.md). Consumed by `/sdd-execute`.

---

## 1. Goal

When this list completes: the HLO selection modal renders indicators **grouped under collapsible HLO section headers** (HLO title + Outcome/Output badge), the sidebar/header show SP/AOW **names** + SP icons + a Code column + a "Save selection" footer, and each HLO with no indicators shows "This HLO has no associated indicators". **Mapping stays indicator-level only** — HLO headers carry no selection control. This is a **FE-only** refinement with **no backend dependency and no gating open questions**.

---

## 2. Pre-flight checklist

- [x] [`./requirements.md`](./requirements.md) + [`./design.md`](./design.md) reviewed (revised 2026-05-28 to indicator-only per PRMS-team clarification).
- [x] Parent spec read-side modal shipped ([`../indicator-mapping/`](../indicator-mapping/), commits `112dc10a`…`e373f8d9`); `HloSelectionModalComponent`, `BilateralService` HLO state, `bilateral.fixtures.ts` in place.
- [x] PRD personas + C-1…C-6 current.
- [x] **No gating open questions.** HLO-level mapping is explicitly out (PRMS clarification). Grouping data already exists in `GET .../hlos-indicators`.
- [ ] **OQ-HGM-1 (AOW name)** / **OQ-HGM-2 (indicator Code field)** — non-gating; FE falls back to code / `indicator_id`, swap when backend confirms.
- [ ] **OQ-HGM-3 (Outcome/Output UX)** / **OQ-HGM-5 ("Save selection" label)** — settle during T-03/T-04 design QA; defaults defined in design §11.

---

## 3. Dependency graph

```
T-BIL-HGM-01 (interfaces: HloGroup) — no deps
    └─▶ T-BIL-HGM-02 (BilateralService: hloGroups computed)
            └─▶ T-BIL-HGM-03 (modal: grouped HLO section headers + Code/badge/empty)
                    └─▶ T-BIL-HGM-04 (modal: SP/AOW names + icons + header + "Save selection")

T-BIL-HGM-05 (capture Image #6/#7 mockups into figma-mockups) — no deps, docs
```

**Buildable chain**: T-01 → T-02 → T-03 → T-04 (all unblocked). T-05 is independent docs. T-03 + T-04 may bundle (same component).

---

## 4. Tasks

---

### T-BIL-HGM-01 — Interfaces: `HloGroup` display view-model

- **Status**: `pending`
- **Depends on**: none
- **Discharges ACs**: enables REQ-BIL-HGM-01/-02 (typing only).
- **Touches**: `src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts`.
- **Summary**: Add the `HloGroup` interface (design §2.1): `{ program, area_of_work, toc_result_id, title, category: IndicatorType, indicators: IndicatorRow[] }`. Additive only. **No `HloMapping` change** (no HLO-level mapping).
- **Implementation notes**: `HloGroup.indicators` reuses the existing `IndicatorRow`. Do not add a `granularity` field or `toc_result_id` to `HloMapping` — mapping is indicator-level only.
- **Tests**: none (interface-only); covered transitively by T-02.
- **Done when**: `npm run lint` + `npm run build` clean.
- **Relevant skills**: `angular-developer`.

### T-BIL-HGM-02 — `BilateralService`: `hloGroups` grouped display computed

- **Status**: `pending`
- **Depends on**: T-BIL-HGM-01
- **Discharges ACs**: AC-01.6, AC-01.1/-01.2/-01.3 (data), AC-02.3 (ordering), and the data half of REQ-BIL-HGM-02/-05.
- **Touches**: `src/app/shared/services/bilateral.service.ts` (+ `.spec.ts`).
- **Summary**: Add `hloGroups = computed<HloGroup[]>()` via a private `materializeHloGroups(hlos, persisted)` — mirrors `materializeRows` but groups one level up: one `HloGroup` per `PrmsTocResult` across `pairs[].outcomes[]` ∪ `outputs[]`, attaching `title` (`result_title`) + `category` (via the existing category-based `deriveIndicatorType`), with `indicators` materialized as today (so the `is_mapped` join still works); outcomes before outputs; null-guard the optional arrays.
- **Implementation notes**: Keep `indicatorRows`/`materializeRows` intact (search still uses the flat view). **Do not touch the selection API** (`hloModalSelection`, `loadModalSelection`, `commitModalSelection`, `materializeMappings`) — indicator-level only, unchanged. No new signals.
- **Tests**: `materializeHloGroups` — grouping correctness (one group per toc_result); outcomes-before-outputs; per-HLO empty group (`indicators: []`); `no_aow_mappings` `area_of_work:''`; child-row `is_mapped` join against `persistedMappings`. Extend `bilateral.fixtures.ts` with a multi-HLO + empty-HLO fixture. Service ≥ 90%.
- **Done when**: `npm run lint`, `npm run test -- bilateral.service`, `npm run build` clean; existing bilateral tests still pass.
- **Relevant skills**: `angular-developer`.

### T-BIL-HGM-03 — Modal: grouped HLO section headers + Code column + Outcome/Output badge + per-HLO empty

- **Status**: `pending`
- **Depends on**: T-BIL-HGM-02
- **Discharges ACs**: REQ-BIL-HGM-01 (AC-01.1..05), REQ-BIL-HGM-02 (AC-02.1..04), REQ-BIL-HGM-03 (AC-03.1..05), REQ-BIL-HGM-05.
- **Touches**: `.../hlo-selection-modal/hlo-selection-modal.component.{ts,html,scss,spec.ts}`.
- **Summary**: Replace the flat main-pane table with **collapsible HLO sections** consuming `bilateralService.hloGroups()` filtered to the active pair. Each header: HLO `title`, an **Outcome/Output category badge** (text + token, not color-only), and a collapse chevron — **no selection control on the header** (REQ-BIL-HGM-03). Sub-table columns: Select / **Code** / Indicator name / Type / Expected target. Outcomes before outputs. Per-HLO "This HLO has no associated indicators" empty state (header retained, no selection control). Search filters indicators within sections. Indicator checkbox/Add selection unchanged.
- **Implementation notes**: Reuse the existing disabled-row primitive, checkbox/commit, search debounce, `aow_status` states, Cancel-confirm — do not rewrite them, and do NOT add any HLO-level selection. Code column falls back to `indicator_id` until OQ-HGM-2. Settle OQ-HGM-3 (badge vs band) with design QA; default = header badge + outcomes-first. Add `data-testid`s per design §4.2.1. Tokens only; `npm run s-lint`.
- **Tests**: grouped sections render one per HLO; outcomes-before-outputs; **no** "Select this HLO" / header selection control exists; category badge present + text-labeled; per-HLO empty note; search filters within sections; indicator selection still toggles `hloModalSelection`; disabled rows still inert. Update the existing T-05/T-06/T-07 modal specs affected by the flat→grouped change. Component ≥ 70%.
- **Done when**: ACs pass; `npm run lint` + `s-lint` + `npm run test -- hlo-selection-modal` + `npm run build` clean; manual smoke at 1440px vs Image #6 (both themes).
- **Relevant skills**: `angular-developer`, `frontend-design`, `ui-ux-pro-max`.

### T-BIL-HGM-04 — Modal: SP/AOW names + SP icons + main-pane header + "Save selection"

- **Status**: `pending`
- **Depends on**: T-BIL-HGM-03
- **Discharges ACs**: REQ-BIL-HGM-04 (AC-04.1..05).
- **Touches**: `.../hlo-selection-modal.component.{ts,html,scss,spec.ts}`.
- **Summary**: Sidebar SP rows show the SP icon + `"<code> - <name>"`; AOW rows show `"<code> - <name>"`. Main-pane header shows `"Science Program NN - <Name>"` + sub-line `"AREA OF WORK NN - <NAME>"`. Footer primary button relabeled **"Save selection"** (behavior unchanged). Resolve SP name + icon by joining `bilateralService.sciencePrograms()` (per-result SP picker data) on SP code; AOW name falls back to code (OQ-HGM-1).
- **Implementation notes**: Reuse the SP icon path resolved in the SP-picker remediation (OQ-HGM-4). Labels/bindings only — no structural change to T-03's grouping. Locked-copy test for "Save selection" + "High Level Outputs".
- **Tests**: SP row shows icon + name (fallback to code when absent); AOW shows name/code; header literals; footer label "Save selection". Component ≥ 70%.
- **Done when**: ACs pass; lint/s-lint/test/build clean; manual smoke vs Image #6.
- **Relevant skills**: `angular-developer`, `frontend-design`.

### T-BIL-HGM-05 — Capture Image #6 / Image #7 mockups into `figma-mockups/`

- **Status**: `pending`
- **Depends on**: none
- **Discharges**: OQ-HGM-6 (canonical-reference permanence).
- **Touches**: `docs/specs/bilateral-module/figma-mockups/` (new `.md` + `_assets/` images, with node IDs).
- **Summary**: Export Image #6 (grouped modal) + Image #7 (filled form) as mockup notes with Figma node IDs, and note that they supersede the flat `32471-131617` layout (resolving OQ-FIG-6). Cross-link from this spec's §1.
- **Done when**: both mockup notes exist with screenshots + node IDs; this spec's "canonical visual references" updated to point at them.
- **Relevant skills**: `frontend-design`.

---

## 5. Testing expectations (global rules)

Per the parent spec + [`../../general-setup/task.md`](../../general-setup/task.md): Jest co-located specs; mocked services per the file's established pattern; locked-literal copy tests; dark + light parity assertion on changed visual states; coverage floors (services ≥ 90%, components ≥ 70%; project floors must not regress). `npm run build` is the authoritative strict-template gate.

## 6. Execution conventions

One task per PR by default; T-03 + T-04 may bundle (same component, reviewable together) — record in the PR. PR title `<type>(bilateral): <desc>`; description references this spec + discharged ACs + the Image #6/#7 references. `[SPEC:bilateral-module/hlo-grouped-mapping]` commit prefix.

## 7. Rollout & feature flags

No client flag. The grouped modal replaces the flat pane directly. Backend label gaps (AOW name, indicator Code) degrade gracefully (fallbacks) rather than gating rollout.

## 8. Rollback plan

Per task `git revert`. T-03 revert restores the flat table; T-02's `hloGroups` remains but unused. No backend coordination needed (no contract change).

## 9. Open items

- **OI-HGM-1 — AOW name + indicator Code in the `hlos-indicators` DTO (OQ-HGM-1/-2).** Optional backend enrichment so the FE can drop the code fallbacks. Non-gating — coordinate with the backend session if convenient.
- **OI-HGM-2 — HLO-level mapping is explicitly OUT** (PRMS-team clarification, 2026-05-28). Recorded so future readers don't re-introduce it; the user is aligning the backend to indicator-only.

---

## 10. Task ID index

| ID | Title | Size | Depends on | Gating | Status |
| --- | --- | --- | --- | --- | --- |
| T-BIL-HGM-01 | Interfaces: `HloGroup` display view-model | S | — | — | pending |
| T-BIL-HGM-02 | `BilateralService` `hloGroups` grouped display computed | M | T-01 | — | pending |
| T-BIL-HGM-03 | Modal grouped HLO section headers + Code/badge/empty | L | T-02 | — | pending |
| T-BIL-HGM-04 | Modal SP/AOW names + icons + header + "Save selection" | S | T-03 | — | pending |
| T-BIL-HGM-05 | Capture Image #6/#7 mockups into `figma-mockups/` | S | — | — | pending |

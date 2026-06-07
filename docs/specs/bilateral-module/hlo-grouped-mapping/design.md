# Design — Bilateral Module / HLO-Grouped Mapping

> How we'll implement [`./requirements.md`](./requirements.md). Follows [`../../general-setup/design.md`](../../general-setup/design.md). Pairs with [`./tasks.md`](./tasks.md).
>
> A **FE-only** refinement of the shipped `HloSelectionModalComponent`. Canonical visuals: **Image #6** (grouped modal), **Image #7** (filled form, unchanged from parent spec). **Mapping stays indicator-level only** — the HLO is a read-only grouping header. Reuses the parent spec's modal shell, sidebar, search, `aow_status` states, disabled-row primitive, Cancel-confirm, and the indicator-level selection model verbatim.

---

## 1. Architectural overview

No new routes, services, or modals — and **no backend dependency**. Two touched surfaces:

```
GET .../hlos-indicators ──▶ BilateralService
  (pairs[].outcomes[]/outputs[]    + hloGroups()  ← NEW grouped DISPLAY view-model (HLO → indicators)
   each PrmsTocResult = one HLO)    (existing, unchanged: hlosIndicators, indicatorRows,
        │                            hloModalSelection [indicator-level], commitModalSelection)
        ▼
HloSelectionModalComponent (main pane: flat table ─▶ collapsible HLO section headers + indicator sub-tables)
        │ confirm → pendingMappings (indicator-level HloMapping[], unchanged)
        ▼
PoolFundingAlignmentComponent ─▶ HloCardComponent (UNCHANGED — parent spec, gated on OQ-IM-1)
```

The grouping data is **already in the response** (`pairs[].outcomes[]` / `pairs[].outputs[]`), so this is purely a render change plus label polish. **No selection-model change** (indicator-level only), **no new contribution shape**, **no backend coordination**.

---

## 2. Data model

### 2.1 New FE DISPLAY view-model — grouped HLO structure

Add to `@interfaces/bilateral/pool-funding-alignment.interface.ts`:

```ts
// A High-Level Output (PRMS toc_result) with its child indicator rows — a read-only
// grouping/display shape for the modal main pane. NOT a selection or mapping target.
export interface HloGroup {
  program: string;                 // SP code (from the pair)
  area_of_work: string;            // AOW code (from the pair; '' under no_aow_mappings)
  toc_result_id: string | number;  // PrmsTocResult.toc_result_id — the HLO identity (for trackBy/keys)
  title: string;                   // PrmsTocResult.result_title — the HLO name (header)
  category: IndicatorType;         // 'outcome' | 'output' (from PrmsTocResult.category)
  indicators: IndicatorRow[];      // child rows (existing IndicatorRow shape, reused)
}
```

`IndicatorRow` is unchanged (it already carries `toc_result_id`, `program`, `area_of_work`, `indicator_type`). **No `HloMapping` change** — there is no HLO-level mapping, so no `granularity` discriminant and no `toc_result_id` on the mapping.

### 2.2 Selection model — UNCHANGED

The indicator-level `hloModalSelection: Set<HloKeyString>` (key `${program}|${area_of_work}|${indicator_id}`) and all its commit/cancel/snapshot logic ship as-is. **No `hloLevelSelection` signal.** The footer counter still reads `hloModalSelection().size`.

---

## 3. API contracts

| Method | URL | Service method | Notes |
| --- | --- | --- | --- |
| GET | `results/:resultCode/pool-funding-alignment/hlos-indicators` | `GET_PoolFundingHlosIndicators` *(existing)* | Already returns the HLO grouping. **No change.** |
| GET | `results/:resultCode/pool-funding-alignment/science-programs` | `GET_PoolFundingSciencePrograms` *(existing)* | Reused to resolve SP **name + icon** for the sidebar (join by SP code). |

**Backend label gaps tracked as non-gating open questions** (do not block this spec): AOW **name** (OQ-HGM-1) and indicator **Code** field (OQ-HGM-2) are not in the current response — FE falls back to code / `indicator_id`. No contribution endpoints are touched.

---

## 4. Frontend architecture

### 4.1 Routes
None.

### 4.2 Components

#### 4.2.1 EXTENDED — `HloSelectionModalComponent`
- **Main pane** changes from a flat `visibleRows()` table to **collapsible HLO sections**. For the active `(program, area_of_work)`:
  - Build `HloGroup[]` (via the new service computed) and render one collapsible section per HLO.
  - **Section header (read-only context, NO selection control)**: HLO `title`, a **category badge** (`Outcome` / `Output` — text + token, not color-only), and the collapse chevron. There is deliberately **no "Select this HLO"** affordance (REQ-BIL-HGM-03).
  - Sub-table per HLO: columns **Select** (indicator checkbox/Add), **Code**, **Indicator name**, **Type**, **Expected target**, with the existing per-row commit (unchanged).
  - Outcomes ordered before Outputs (REQ-BIL-HGM-02 AC-02.3).
  - Per-HLO empty state: header (title + category + collapse) remains; sub-table replaced by "This HLO has no associated indicators" (REQ-BIL-HGM-05). No selection control either way.
- **Sidebar**: SP rows render icon + `"<code> - <name>"`; AOW rows render `"<code> - <name>"` (name via OQ-HGM-1 fallback to code). Reuse `bilateralService.sciencePrograms()` for SP name/icon.
- **Main-pane header**: `"Science Program NN - <Name>"` + sub-line `"AREA OF WORK NN - <NAME>"`.
- **Footer**: primary button relabeled **"Save selection"** (behavior = existing confirm: commit the indicator-level selection → close).
- Search, `aow_status` states, disabled rows, Cancel-confirm, focus-trap, **indicator selection** — **reused unchanged**; search now filters indicators within each HLO section.
- **`data-testid`**: add `hlo-modal-hlo-{program}-{area_of_work}-{toc_result_id}`, `hlo-modal-hlo-empty-{...}`, `hlo-modal-hlo-category-{...}`; indicator-row testids unchanged. (No HLO-select testid — there's no such control.)

#### 4.2.2 UNCHANGED — `HloCardComponent` / `PoolFundingAlignmentComponent`
The filled-form indicator cards (quantitative contribution + reason) are the parent spec's REQ-BIL-IM-08/-10/-11, gated on OQ-IM-1 there. **This spec does not touch them** — there is no HLO-level card.

### 4.3 State boundaries
- `hloGroups` (computed) lives on `BilateralService` alongside the existing HLO state. No new signals, no `localStorage`.

### 4.4 Services — `BilateralService` (extend)
- `hloGroups = computed<HloGroup[]>(...)` — built from `hlosIndicators()` + `persistedMappings()` (for the indicator rows' `is_mapped` join, reusing `materializeRows`/the existing derivation). A private `materializeHloGroups(hlos, persisted)` mirrors `materializeRows` but groups one level up and attaches `title` / `category`; outcomes before outputs; null-guards optional arrays. Reuse the existing category-based `deriveIndicatorType` for `HloGroup.category`.
- **No selection-API change.** `loadModalSelection` / `commitModalSelection` / `cancelModalSelection` / `materializeMappings` are untouched (indicator-level only).

### 4.5 Forms
Unchanged — indicator card reason/quantitative flow through the parent spec's gated path.

### 4.6 Theming
Tokens only. Category badge reuses an existing token (e.g. greys/blues); active-HLO header + selected-row reuse `--ac-light-blue-100`. No hex. `npm run s-lint` on touched SCSS.

---

## 5. Security & authorization
Unchanged. `BilateralService.editable` gates indicator selection + the gated card edits. HLO headers carry no action, so no permission surface. Server authoritative.

## 6. Error handling
Unchanged from parent spec. Grouping adds no new error path. Per-HLO empty state is informational, not an error.

## 7. Real-time considerations
No new socket. Reuses `result.pool-funding-alignment.changed`.

## 8. Performance
Grouping is a pure pivot over already-fetched `pairs[]` — no extra fetch (REQ-BIL-HGM-NF-02). Active-AOW switch stays a client-side recompute. No new dependency (REQ-BIL-HGM-NF-03).

## 9. Accessibility
HLO sections are disclosure widgets (`aria-expanded`, button-triggered collapse). Category badge is text (+ optional icon), not color-only (REQ-BIL-HGM-02 AC-02.4). Existing focus-trap + `aria-live` counter preserved. Per-HLO empty note is in the DOM. HLO headers have no interactive selection control to label.

## 10. Telemetry
No new events.

## 11. Design decisions (decision record)

- **2026-05-28 — Group by HLO from `pairs[].outcomes[]/outputs[]`; don't add a fetch.** The response already nests indicators under their `toc_result`. Decision: add a `hloGroups` computed that pivots the existing tree; keep `indicatorRows`/`materializeRows` for the search + `is_mapped` join. Alternatives: ask backend for a pre-grouped shape (rejected — data already grouped); add `result_title`/`category` onto `IndicatorRow` and group in the template (rejected — pushes grouping into the view). Rationale: one seam in the service, flat templates.

- **2026-05-28 — Mapping is indicator-level only; the HLO header is read-only context (PRMS-team clarification).** Decision: render HLO section headers for visibility/grouping with **no** selection control; all selection stays at the indicator row (existing `hloModalSelection`). Supersedes the earlier same-day exploration of HLO-level / dual-granularity mapping, which the PRMS team retracted (the backend is being aligned to indicator-only). Rationale: matches the confirmed product model; keeps the shipped selection model, contribution body, and backend untouched — zero new persistence, zero backend dependency.

- **2026-05-28 — Outcome/Output distinction = category badge on the HLO header + Outcomes-before-Outputs ordering (default).** Alternatives: a banded "Outcomes / Outputs" layout, or a filter/toggle — deferred to OQ-HGM-3 as enhancements. Rationale: badge + ordering is the lowest-risk default that satisfies "make it perceivable" without a heavier IA change.

- **2026-05-28 — Relabel footer "Confirm" → "Save selection"; behavior unchanged.** Matches Image #6 copy. Pure label change; commit-draft-then-save-on-form semantics (REQ-BIL-IM-06/-07) untouched.

> No deviation from the global system-design/detailed-design blueprints beyond component-inventory additions, which land via the parent spec's T-BIL-IM-15 docs task.

## 12. Testing strategy
- `BilateralService`: `materializeHloGroups` (grouping correctness, outcomes-before-outputs, per-HLO empty group, `no_aow_mappings` `area_of_work:''`, `is_mapped` join on the child rows). ≥ 90%.
- `HloSelectionModalComponent`: grouped sections render one per HLO; outcomes-before-outputs; **no** HLO-level selection control present; category badge (Outcome/Output, not color-only); per-HLO empty note; search filters within sections; indicator selection unchanged; SP/AOW name + icon (fallback to code); "Save selection" label. Update the existing T-05/T-06/T-07 modal specs affected by flat→grouped. ≥ 70%.
- Reuse `bilateral.fixtures.ts`; add a multi-HLO + per-HLO-empty fixture.

## 13. Risks & mitigations
- **R-1 — Existing modal tests churn** when the flat table becomes grouped. *Mitigation*: update the affected modal specs in the same task; the service-level flat `indicatorRows` stays for search so most assertions migrate cleanly.
- **R-2 — AOW name / indicator Code not available** (OQ-HGM-1/-2). *Mitigation*: render code/`indicator_id` fallback now; swap to real fields when backend confirms — isolated to label bindings.
- **R-3 — Regression risk on the shipped selection flow.** *Mitigation*: the selection model is explicitly untouched; tests assert indicator selection still toggles `hloModalSelection` from inside the grouped layout.

## 14. References
- [`./requirements.md`](./requirements.md) (REQ-BIL-HGM-01..05).
- Parent: [`../indicator-mapping/design.md`](../indicator-mapping/design.md) §2.1, §4.2.2, §4.4.1 (shell + `materializeRows` seam being extended).
- [`../ari-backend-context/frontend-data-model.md`](../ari-backend-context/frontend-data-model.md) (`hlos-indicators` shape).
- PRD C-1/C-3/C-4/C-5/C-6.

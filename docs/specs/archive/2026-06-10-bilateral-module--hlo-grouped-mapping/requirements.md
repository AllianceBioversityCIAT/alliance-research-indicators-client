# Requirements — Bilateral Module / HLO-Grouped Mapping

> Feature folder under [`../`](../). A **refinement** of the shipped HLO selection modal ([`../indicator-mapping/`](../indicator-mapping/)) to align it with the newer Figma design: **group indicators under their parent High-Level Output** for visibility, and distinguish Outcome- vs Output-level data. Follows the template at [`../../general-setup/requirements.md`](../../general-setup/requirements.md).
>
> **Mapping stays indicator-level only** (clarified by the PRMS team, 2026-05-28). The HLO is a **read-only grouping header** — there is no HLO-level mapping. This spec **supersedes/refines** the modal-display requirements of the parent spec (REQ-BIL-IM-02/-03); it does not change the contribution model, which remains indicator-level (REQ-BIL-IM-08/-10/-11, gated on OQ-IM-1).

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/hlo-grouped-mapping/` |
| Domain abbreviation | `BIL-HGM` |
| Parent / predecessor spec | [`../indicator-mapping/`](../indicator-mapping/) — US3/US4; read-side modal shipped 2026-05-28 (commits `112dc10a`…`e373f8d9`) |
| Status | **DRAFT — Phase 1 (`/sdd-specify`), 2026-05-28** (revised same day to indicator-only after PRMS-team clarification) |
| Canonical visual references | **Image #6** — HLO-grouped selection modal (newer than the captured `figma-mockups/32471-131617`, which left grouping open as OQ-FIG-6). **Image #7** — filled alignment form (indicator cards). *(Both provided by the user 2026-05-28; not yet exported to `../figma-mockups/`.)* |
| Constitutional anchors | [`docs/prd.md`](../../../prd.md) §3–§5, §8.3 (C-1…C-6) · [`docs/system-design/design.md`](../../../system-design/design.md) · [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) |
| Backend context | [`../ari-backend-context/frontend-data-model.md`](../ari-backend-context/frontend-data-model.md) (`GET .../hlos-indicators` shape) · backend repo `AC-1594-bilateral-module-v2` |

---

## 2. Executive summary

The shipped HLO selection modal (`HloSelectionModalComponent`) renders the active Area of Work's indicators as a **flat table**. That drops the parent **High-Level Output**: each indicator belongs to an HLO (a PRMS ToC `OUTCOME` or `OUTPUT`), so a user "can't see which HLO each indicator belongs to." The catalog already carries the grouping — `GET .../hlos-indicators` returns `pairs[].outcomes[]` and `pairs[].outputs[]`, where **each `PrmsTocResult` *is* an HLO** and carries its own `indicators[]`. The modal must render indicators **grouped under collapsible HLO section headers**, each showing the HLO title.

The HLO is **read-only context** — a grouping/section header, not a selectable target. **Mapping and contribution remain strictly indicator-level** (the PRMS team clarified there is no HLO-level mapping; the backend is being aligned to enforce this). An indicator-level mapping carries a quantitative contribution + a reason, exactly as the parent spec already specifies — this spec does **not** change the contribution model.

Two secondary alignments fall out of the same review:
- **Outcome vs Output is not perceivable.** The data has both (`category: 'OUTCOME' | 'OUTPUT'` on each HLO), but neither the build nor the older mockup lets a user tell HLOs/indicators apart by ToC level. The user explicitly asked for a way to distinguish them.
- **Label/column polish to match the mockup:** SP/AOW shown with **names** (and SP icons) not just codes, an indicator **Code** column, the full "Science Program NN – Name / AREA OF WORK NN – NAME" main-pane header, a per-HLO "This HLO has no associated indicators" empty state, and a **"Save selection"** footer button.

This also corrects a modelling error in the parent spec, whose glossary treats "HLO" and "indicator" as "roughly synonymous." They are a **hierarchy**: HLO is the parent `toc_result`; indicators are its children.

**Scope.** This is a **FE-only** refinement (modal display + labels). It has **no backend dependency** — the grouping data already exists in the response, and mapping stays indicator-level. The contribution *cards* on the alignment form are unchanged from the parent spec and remain gated on OQ-IM-1 there; this spec does not touch them.

---

## 3. Glossary

- **HLO (High-Level Output)** — a PRMS ToC result; one `PrmsTocResult` with `category: 'OUTCOME' | 'OUTPUT'`, a `result_title` (the HLO name), and an `indicators[]` array. Surfaced via `pairs[].outcomes[]` / `pairs[].outputs[]`. **A read-only grouping level — the parent of indicators, NOT a synonym for indicator and NOT a mapping target** (corrects the `indicator-mapping` glossary).
- **Indicator** — a PRMS ToC leaf under an HLO (`PrmsTocIndicator`): `indicator_id`, `indicator_description`, `unit_messurament`, `target_value_sum`, etc. **The only mappable unit.**
- **Outcome / Output** — the two ToC levels an HLO can be (`category`). Outcomes sit above outputs in the ToC; the FE must let users distinguish them.
- **AOW / SP / `aow_status`** — inherited from [`../indicator-mapping/`](../indicator-mapping/) and the backend data model. Unchanged here.

---

## 4. System context & scope

### 4.1 In scope

- **REQ-BIL-HGM-01** — Modal main pane groups indicators under collapsible HLO section headers.
- **REQ-BIL-HGM-02** — Outcome-level vs Output-level HLOs are visually distinguishable.
- **REQ-BIL-HGM-03** — Mapping is indicator-level only; HLO headers are non-selectable context.
- **REQ-BIL-HGM-04** — Mockup label/column alignment (SP/AOW names + SP icons, Code column, main-pane header, "Save selection").
- **REQ-BIL-HGM-05** — Per-HLO "no associated indicators" empty state.
- **NF-01..05** — accessibility, performance, bundle, theming, coverage.

### 4.2 Out of scope

- **HLO-level mapping / contribution** of any kind — explicitly excluded per the PRMS-team clarification. No "Select this HLO", no HLO-level selection or persistence.
- The **contribution cards** on the alignment form (REQ-BIL-IM-08/-10/-11) — unchanged; remain indicator-level and gated on OQ-IM-1 in the parent spec.
- Re-specifying the modal shell, sidebar tree, search, `aow_status` empty states, disabled-row primitive, or Cancel-confirm — all shipped under `indicator-mapping` and reused as-is.
- The AI-card entry point and read-only/409 behavior (REQ-BIL-IM-01/-15/-16) — unchanged.
- i18n — strings English-only; new strings extractable.

### 4.3 Architectural fit

- Extends the existing standalone `HloSelectionModalComponent`; no new route, service, or modal; no NgModule (C-1, C-6).
- Data continues to come from `bilateralService.hlosIndicators()`. A view-model seam (`materializeRows` in `BilateralService`) is extended to a **grouped** display shape (HLO → indicators); the **selection model is unchanged** (indicator-level `hloModalSelection`).
- Controlled vocabularies (SP/AOW) remain CLARISA-sourced (C-3); SP names/icons reuse the existing per-result science-programs data — no parallel taxonomy.

---

## 5. Stakeholders / personas

> PRD §3. Identical to [`../indicator-mapping/` §5](../indicator-mapping/requirements.md). Primary actor: **Researcher (PI / contributor)**; editors are Center/System Admin; MEL + Cross-Platform Consumer are read-only.

---

## 6. Functional requirements

### REQ-BIL-HGM-01 — *Modal main pane groups indicators under their HLO*

- **Statement**: In the HLO selection modal, the active AOW's indicators SHALL be rendered grouped under their parent HLO. Each HLO renders as a collapsible section whose header shows the HLO title; its indicators render in a sub-table beneath it. The modal SHALL NOT show a flat, ungrouped indicator list.
- **Refines**: REQ-BIL-IM-03 (which described a flat per-AOW table). **Resolves OQ-FIG-6.**
- **Visual reference**: Image #6.
- **Acceptance criteria**:
  - AC-01.1 — For the active `(program, area_of_work)` pair, the pane lists one collapsible section per HLO drawn from `outcomes[]` ∪ `outputs[]`, outcomes first (REQ-BIL-HGM-02).
  - AC-01.2 — Each HLO section header shows the HLO title (`PrmsTocResult.result_title`).
  - AC-01.3 — Each HLO section contains a sub-table of its `indicators[]` with columns: **Select**, **Code**, **Indicator name**, **Type**, **Expected target** (per REQ-BIL-HGM-04).
  - AC-01.4 — HLO sections are collapsible (expand/collapse), default expanded.
  - AC-01.5 — Search (REQ-BIL-IM-05, reused) filters indicators within the active AOW across all its HLO sections; an HLO whose indicators all filter out shows its zero-match/empty state.
  - AC-01.6 — The template consumes a grouped view-model from `BilateralService` (HLO → indicators); it does not traverse `pairs[].outcomes[].indicators[]` directly.

#### Scenario: A user opens an AOW with two HLOs

- GIVEN a result whose active AOW returns two HLOs (one OUTCOME with 5 indicators, one OUTPUT with 3 indicators)
- WHEN the modal main pane renders
- THEN two collapsible HLO sections appear, each titled with its `result_title`
- AND each section lists its own indicators in a Code / Indicator / Type / Expected target sub-table
- AND no indicator appears outside its HLO section

### REQ-BIL-HGM-02 — *Outcome-level vs Output-level HLOs are distinguishable*

- **Statement**: The modal SHALL make it perceivable whether each HLO (and therefore its indicators) is an **Outcome** or an **Output**.
- **Visual reference**: Image #6 (Type column) + design exploration (OQ-HGM-3).
- **Acceptance criteria**:
  - AC-02.1 — Each HLO section indicates its `category` (Outcome / Output) on or adjacent to its header (exact treatment — badge, grouping band, or filter — decided in design per OQ-HGM-3).
  - AC-02.2 — The per-indicator **Type** column continues to show Outcome / Output (derived from the parent HLO's `category`, not `result_level_id`).
  - AC-02.3 — Outcomes are ordered before Outputs within an AOW (stable, predictable grouping).
  - AC-02.4 — The distinction meets WCAG 2.1 AA — not conveyed by color alone (text label or icon + text).

### REQ-BIL-HGM-03 — *Mapping is indicator-level only; HLO headers are non-selectable context*

- **Statement**: Selection and mapping SHALL occur **only** at the indicator level (per-row checkbox/Add, existing behavior). The HLO section header SHALL be **read-only context** — it provides grouping, title, collapse, and the Outcome/Output indication, but offers **no** "select/map this HLO" affordance.
- **Origin**: PRMS-team clarification, 2026-05-28 — there is no HLO-level mapping; the backend is being aligned to enforce indicator-only mapping.
- **Acceptance criteria**:
  - AC-03.1 — Each indicator row carries the existing selection checkbox/Add toggling its entry in `hloModalSelection` (indicator-level) — unchanged from the shipped modal.
  - AC-03.2 — The HLO section header has **no** selection control (no "Select this HLO" button, no header checkbox).
  - AC-03.3 — The footer counter (REQ-BIL-IM-06) continues to count indicator-level selections only.
  - AC-03.4 — Disabled indicators (REQ-BIL-IM-04 reuse) remain non-selectable.
  - AC-03.5 — No new selection signal, no `granularity` discriminant, no HLO-level persistence is introduced anywhere (FE or backend) by this spec.

### REQ-BIL-HGM-04 — *Mockup label/column alignment*

- **Statement**: The modal SHALL present SP/AOW with human names (and SP icons), an indicator Code column, a full main-pane header, and a "Save selection" footer action, matching the canonical design.
- **Visual reference**: Image #6.
- **Acceptance criteria**:
  - AC-04.1 — Sidebar SP rows show the SP icon + `"<SP code> - <SP name>"` (e.g. `SP01 - Breeding for Tomorrow`); AOW rows show `"<AOW code> - <AOW name>"` (e.g. `AOW01 - Market Intelligence`).
  - AC-04.2 — Main-pane header shows `"Science Program NN - <Name>"` and a sub-line `"AREA OF WORK NN - <NAME>"`.
  - AC-04.3 — The indicator sub-table includes a **Code** column (e.g. `CR-HL01-001`).
  - AC-04.4 — Footer primary action is labeled **"Save selection"** (supersedes the current "Confirm" label; behavior unchanged — commit selection + close).
  - AC-04.5 — **Data availability is an open question** — the `hlos-indicators` response carries SP/AOW **codes** but not names, and the indicator Code field source is unconfirmed (OQ-HGM-4, OQ-HGM-5). Where a name/code isn't available, the FE falls back to the code/`indicator_id` and the gap is tracked, not hidden.

### REQ-BIL-HGM-05 — *Per-HLO "no associated indicators" empty state*

- **Statement**: An HLO that has zero indicators SHALL still render its section header (title + Outcome/Output indication) with an inline note "This HLO has no associated indicators". Since mapping is indicator-level only, such an HLO is simply non-mappable — it is shown for completeness/context.
- **Visual reference**: Image #6 (the *Improved Systems…* HLO).
- **Acceptance criteria**:
  - AC-05.1 — The HLO header (title + collapse + category) renders; there is **no** selection control on it (consistent with REQ-BIL-HGM-03).
  - AC-05.2 — In place of the indicator sub-table, the note "This HLO has no associated indicators" renders.
  - AC-05.3 — This is distinct from the AOW-level and `pairs:[]` empty states already handled in `indicator-mapping`.

---

## 7. Non-functional requirements

- **REQ-BIL-HGM-NF-01 — Accessibility (C-4).** HLO sections are keyboard-operable disclosure widgets (`aria-expanded`); the Outcome/Output distinction is not color-only (REQ-BIL-HGM-02 AC-02.4); the existing focus-trap / counter `aria-live` are preserved.
- **REQ-BIL-HGM-NF-02 — Performance.** Grouped render of the active AOW (≤ ~10 HLOs × ~10 indicators) completes within the existing modal budget (active-AOW switch ≤ 0.3 s); grouping is a pure pivot over already-fetched data (no extra fetch).
- **REQ-BIL-HGM-NF-03 — Bundle budget (C-5).** Net addition stays within the existing lazy budget; no new heavy dependency (reuse PrimeNG primitives already imported).
- **REQ-BIL-HGM-NF-04 — Theming.** Dark + light parity; tokens only (`var(--ac-*)` / utility classes) — no hex literals.
- **REQ-BIL-HGM-NF-05 — Coverage.** Changed service methods ≥ 90% statements; changed components ≥ 70%. Project-wide floors must not regress.

---

## 8. Data inputs & outputs

### 8.1 Inputs

- `GET .../hlos-indicators` (existing) — already returns the HLO grouping in `pairs[].outcomes[]` / `pairs[].outputs[]`. **No new endpoint, no backend change needed for grouping.** Label gaps tracked in §12.
- SP names/icons — reuse the per-result `GET .../science-programs` data already consumed by the SP picker (join client-side by SP code).
- No contribution write path is touched by this spec (it's display-only; cards stay in the parent spec).

### 8.2 Outputs (UI)

- Grouped HLO section headers in the modal main pane; Outcome/Output indication; indicator selection unchanged.
- Telemetry: no new events required. (The existing `bilateral.hlo.modal.*` events are unchanged.)

### 8.3 Persisted state

No new client persistence. Indicator selection draft lives in `hloModalSelection` until confirm (unchanged).

---

## 9. Controlled vocabularies

SP / AOW / HLO / indicator all originate upstream (CLARISA SP+AOW, PRMS ToC) via the existing endpoint (C-3). This spec introduces **no** parallel taxonomy. SP names/icons come from the existing CLARISA-sourced science-programs data.

---

## 10. Role & permission matrix

Identical to [`../indicator-mapping/` §10](../indicator-mapping/requirements.md) — editability gated by `BilateralService.editable`; no new permission logic. Indicator selection is available to the same editors; read-only for non-editors. HLO headers are read-only for everyone (no action attached).

---

## 11. Telemetry & observability

No new telemetry. Error surfaces unchanged (inline disabled reasons, field-level 400s on the gated cards, 409 warning toast — all in the parent spec).

---

## 12. Assumptions & open questions

### Assumptions

- **A-1** — Image #6 (modal) and Image #7 (filled form) are the current canonical design and supersede the captured `figma-mockups/32471-131617` flat-table layout. *(Should be exported to `../figma-mockups/` — see OQ-HGM-6.)*
- **A-2** — The existing `materializeRows` seam can be extended/duplicated into a grouped (HLO → indicators) display view-model without disturbing the flat consumers (search + `is_mapped` join) in tests.
- **A-3** — Mapping is indicator-level only (PRMS-team clarification, 2026-05-28); no HLO-level concept is added on FE or backend.

### Open questions — all NON-GATING (FE buildable now; fallbacks defined)

- **OQ-HGM-1 — AOW name source.** `hlos-indicators` returns `area_of_work` as a **code** (`"AOW06"`), not a name. The mockup shows `"AOW01 - Market Intelligence"`. Backend can add the AOW name to the DTO (it has it in the CLARISA mapping), or the FE shows the code only until then. *(Fallback: code.)*
- **OQ-HGM-2 — Indicator "Code" source.** The mockup Code column shows `CR-HL01-001`-style codes. Confirm which `PrmsTocIndicator` field maps to that (it isn't obviously `indicator_id`, which is numeric like `"5871"`). *(Fallback: `indicator_id`.)*
- **OQ-HGM-3 — Outcome/Output distinction UX.** Badge on the HLO header, a grouped "Outcomes / Outputs" band, or a filter/toggle? Designer call (REQ-BIL-HGM-02). *(Default: header badge + outcomes-first ordering.)*
- **OQ-HGM-4 — SP icon source.** Confirm the SP icon asset path for the sidebar (the SP-picker work resolved an icon path for the chips — reuse it).
- **OQ-HGM-5 — "Save selection" vs existing "Confirm".** Confirm the label change is desired (Image #6 shows "Save selection"). *(Default: relabel to "Save selection".)*
- **OQ-HGM-6 — Mockup export.** Export Image #6 / Image #7 to `../figma-mockups/` with node IDs so the canonical references are permanent.

> **No gating open questions.** The HLO-level mapping question (and its backend dependency) is closed by the PRMS-team clarification: indicator-level only.

---

## 13. References

- Parent spec: [`../indicator-mapping/requirements.md`](../indicator-mapping/requirements.md) — REQ-BIL-IM-02/-03 (modal display, refined here), -08/-10/-11 (indicator cards, unchanged), §12 OQ-IM-1.
- Backend data model: [`../ari-backend-context/frontend-data-model.md`](../ari-backend-context/frontend-data-model.md) — `hlos-indicators` shape + `aow_status` matrix.
- Older captured mockups (flat design, superseded by Image #6): [`../figma-mockups/32471-131617-hlo-modal-empty.md`](../figma-mockups/32471-131617-hlo-modal-empty.md) (note OQ-FIG-6), [`../figma-mockups/33563-137770-hlo-modal-3-items-selected.md`](../figma-mockups/33563-137770-hlo-modal-3-items-selected.md).
- PRD: [`docs/prd.md`](../../../prd.md) §3, §8.3 (C-1…C-6).

---

## 14. Requirement ID index

| ID | Title | Type |
| --- | --- | --- |
| REQ-BIL-HGM-01 | Modal main pane groups indicators under their HLO | Functional |
| REQ-BIL-HGM-02 | Outcome vs Output HLOs distinguishable | Functional |
| REQ-BIL-HGM-03 | Mapping is indicator-level only; HLO headers non-selectable | Functional |
| REQ-BIL-HGM-04 | Mockup label/column alignment (SP/AOW names + icons, Code column, header, Save selection) | Functional |
| REQ-BIL-HGM-05 | Per-HLO "no associated indicators" empty state | Functional |
| REQ-BIL-HGM-NF-01 | Accessibility WCAG 2.1 AA | Non-functional |
| REQ-BIL-HGM-NF-02 | Performance — grouping is a pure pivot, no extra fetch | Non-functional |
| REQ-BIL-HGM-NF-03 | Bundle budget | Non-functional |
| REQ-BIL-HGM-NF-04 | Dark + light theming parity | Non-functional |
| REQ-BIL-HGM-NF-05 | Coverage floors | Non-functional |

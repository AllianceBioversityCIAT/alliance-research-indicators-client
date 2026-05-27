# Requirements — Bilateral Module / Indicator Mapping

> Feature folder under [`../`](../). Scoped to **US3 (AC-1439)** + **US4 (AC-1440)** — let the user open the **HLO selection modal** from the Pool Funding Alignment section, pick High-Level Outputs grouped by **SP → Area of Work**, see them render as **inline HLO cards** on the main form with Expected target / Quantitative contribution / Reason, and persist the mapping. Follows the template at [`../../general-setup/requirements.md`](../../general-setup/requirements.md).
>
> **Source-of-truth note (2026-05-23 rewrite)**: this spec is now **mockup-first** — the Figma nodes under [`../figma-mockups/`](../figma-mockups/) are authoritative for UX shape and field set. Where they conflict with the ARI backend handoff [`../ari-backend-context/frontend-handoff.md`](../ari-backend-context/frontend-handoff.md), the conflict is logged as a **gating open question** (§12) that must be resolved before `/sdd-execute` runs.

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/indicator-mapping/` |
| Proposal | [`../proposal.md`](../proposal.md) — approved 2026-05-19 |
| Sibling spec (predecessor) | [`../tag-visibility/`](../tag-visibility/) — shipped 2026-05-20 (commit `2779b5fd`) |
| Sibling spec (predecessor) | [`../alignment-section/`](../alignment-section/) — shipped 2026-05-23 (commit `17417fdd`) |
| Status | **DRAFT — Phase 1 (`/sdd-specify`) — REWRITE 2026-05-23, ENDPOINT SWITCH 2026-05-27**. Initial draft was backend-handoff-first and diverged from the approved Figma mockups; the 2026-05-23 revision is mockup-first. The 2026-05-27 update wires the spec to the already-shipped backend `GET /api/v1/results/:resultCode/pool-funding-alignment/hlos-indicators` endpoint (T-15.12 / commit `907993e7`) per the ToC backend audit ([`./open-questions-for-ba.md` §8](./open-questions-for-ba.md#8-toc-backend-audit--2026-05-27-received)) — **OQ-IM-2 RESOLVED**, OQ-IM-1 + OQ-IM-3 remain gating, new non-gating OQ-IM-10 raised. |
| Domain abbreviation | `BIL-IM` |
| Primary visual reference | [`../figma-mockups/README.md`](../figma-mockups/README.md) + per-screen files |
| Backend handoff | [`../ari-backend-context/frontend-handoff.md`](../ari-backend-context/frontend-handoff.md) — referenced where it agrees with the mockups |
| Jira | [`../jira-us/AC-1439-us3-display-toc-indicators.md`](../jira-us/AC-1439-us3-display-toc-indicators.md) · [`../jira-us/AC-1440-us4-map-results-indicators.md`](../jira-us/AC-1440-us4-map-results-indicators.md) |
| Constitutional anchors | [`docs/prd.md`](../../../prd.md) §3–§5, §8.3 (C-1..C-6) · [`docs/system-design/design.md`](../../../system-design/design.md) · [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) |

---

## 2. Executive summary

The Pool Funding Alignment section ([`../alignment-section/`](../alignment-section/)) lets a PI declare which Science Programs / Accelerators (levers) their bilateral result contributes to. It does **not** let them say *how* the result contributes — which specific High-Level Outputs (HLOs) under those SPs, what the contribution shape is, and why the result counts toward each HLO.

Per the Figma mockup set:

1. After SPs are saved, an **"AI card"** appears under the SP picker: a 1036×103 prompt with the title **"VIEW HIGH LEVEL OUTPUTS"** + body text + a green CTA button. Clicking it opens the **HLO selection modal**.
2. The **HLO modal** (`32471:131617`, `33563:138613`, `33563:137770`) is a **tree picker**:
   - Left sidebar: SPs expanded into **Areas of Work** (`AOW01 - Market Intelligence`, `AOW02 - …`).
   - Right pane: indicator table for the active AOW with search, per-row checkboxes + commit button, **disabled-indicator reason tooltips** (`33563:138613`) for rules violations.
   - Footer: "Selected → N items" counter + Confirm / Cancel.
3. On confirm, the modal closes and the selected indicators render as **inline HLO cards** on the main form (`33356:11075`, `32472:129409`), grouped **SP → AOW → HLO**. Each card carries:
   - Indicator code + name (e.g., `CR-HL01-001 - Number of climate adaptation knowledge products developed`).
   - Status tag, progress bar.
   - **Expected target** — read-only from the catalog (e.g., `20 - NUMBER OF KNOWLEDGE PRODUCTS`).
   - **Quantitative contribution** — conditional dropdown when the indicator's `is_quantitative` flag is true.
   - **Why is this being reported?** — required dropdown / reason field.
   - × button to remove the mapping.

**This shape does not match the 5 polymorphic contribution payloads in [handoff §7](../ari-backend-context/frontend-handoff.md#7-type-specific-contribution-payloads-d12)** (capacity_sharing, knowledge_product, policy_change, innovation_development, NOOP). That conflict is the headline open question (**OQ-IM-1**) — production cannot ship until it is reconciled. Options range from "mockups supersede; backend changes its body shape" to "the mockup card maps onto one of the 5 types (likely NOOP)" — see §12.

**Catalog read (2026-05-27 update).** The backend already exposes the SP → AOW → outcome/output → indicator tree via a result-scoped `GET /api/v1/results/:resultCode/pool-funding-alignment/hlos-indicators` endpoint (T-15.12 / commit `907993e7`), sourced live from CLARISA + PRMS with a 5-min cache. The FE consumes this single endpoint instead of the originally planned `GET .../indicators`. AOW is not modeled as an ARI entity — it comes through transitively from the CLARISA project mapped to the result. See [`./open-questions-for-ba.md` §8](./open-questions-for-ba.md#8-toc-backend-audit--2026-05-27-received).

The work is intentionally bounded to US3 + US4: the HLO modal + the inline HLO cards + the read/write endpoints. PRMS push (`33356:11736` shows the synchronized state, deferred to US5) ships in a future spec.

---

## 3. Glossary

- **HLO** — High-Level Output. The unit a user picks in the modal and maps to the result. The mockups treat "HLO" and "indicator" as roughly synonymous; downstream this aligns with the backend's `indicator_code`.
- **AOW** — Area of Work. The intermediate grouping in the SP/AOW/HLO tree. Example: `AOW01 - Market Intelligence` under `SP01 - Breeding for Tomorrow`. **Resolved 2026-05-27**: AOW is a real CGIAR ToC level-2 entity sourced live from CLARISA (`cgiar_entity_type_object.name === "Key Area of Work"`, level=2 under SP), not persisted in ARI. Surfaced via the result-scoped `GET .../hlos-indicators` endpoint as `pairs[].area_of_work`. Cardinality is 1:1 indicator → AOW (each PRMS ToC result lives inside one `(SP, AOW)` pair). See [`./open-questions-for-ba.md` §8](./open-questions-for-ba.md#8-toc-backend-audit--2026-05-27-received).
- **AI card** — the "VIEW HIGH LEVEL OUTPUTS" prompt block introduced by `32471:129636`. Single-purpose: open the HLO modal. The button label "Upload file" in the mockup is a known typo (OQ-FIG-5).
- **HLO card** — the dataview-style card that renders an HLO once mapped (`33356:11075` Frame 1171276358). One card per `(indicator_code, lever_code)` pair, grouped under its SP → AOW heading.
- **Expected target** — catalog-sourced read-only field on each HLO card (e.g., `20 - NUMBER OF KNOWLEDGE PRODUCTS`).
- **Quantitative contribution** — conditional per-HLO numeric dropdown, present only when the indicator's `is_quantitative` flag is true. Source list per indicator (OQ-IM-5).
- **Why is this being reported?** — required reason dropdown per HLO card (mockup `33356:11075` Frame 1171276358 Footer). Source list per indicator or fixed taxonomy (OQ-IM-4).
- **Disabled-indicator reason** — inline callout in the HLO modal explaining why an indicator cannot be mapped to this result. Surfaced via `aria-describedby` for keyboard users (`33563:138613`).
- **`is_stale`** — server-driven flag preserving existing mappings when the upstream catalog retires an indicator. New mappings to stale indicators rejected by the server.
- **AR.1 / AR.2 / AR.3** — alignment rules inherited from [`../alignment-section/`](../alignment-section/). Edit regardless of `result_status` / read-only after PRMS sync / not part of submission validator. They apply to indicator mappings identically.

---

## 4. System context & scope

### 4.1 In scope

- **REQ-BIL-IM-01** — AI card "View High Level Outputs" entry point.
- **REQ-BIL-IM-02..07** — HLO selection modal: tree sidebar, indicator table, search, per-row commit, disabled-indicator reason, footer counter + Confirm/Cancel.
- **REQ-BIL-IM-08..12** — Inline HLO cards: render grouped SP → AOW → HLO; Expected target (read-only); Quantitative contribution (conditional); Reason dropdown; remove via ×.
- **REQ-BIL-IM-13** — Persist mappings via POST/PATCH/DELETE.
- **REQ-BIL-IM-14** — `aow_status: 'unmapped'` + `pairs: []` empty / unavailable catalog states (updated 2026-05-27 — no longer driven by a missing T-31 sync; backend reads CLARISA + PRMS live).
- **REQ-BIL-IM-15..18** — Read-only states inherited, 409 handling, lever-cascade refresh, stale-mapping behavior.
- **REQ-BIL-IM-19** — `aow_status: 'no_aow_mappings'` flat-per-SP UX (new 2026-05-27; covers OQ-IM-10).
- **NF-01..06** — performance, accessibility, bundle, theming, i18n-ready, coverage.

### 4.2 Out of scope

- **PRMS-synchronized sidebar block** (mockup `33356:11736`) — that's US5, separate spec.
- **W3 Registry sync UI** (US6; backend PENDING).
- **SP ToC sync UI** (US7; backend PENDING). *(Note 2026-05-27: the originally planned ToC-sync job is no longer the canonical default. The backend's T-15.12 endpoint reads CLARISA + PRMS live; the "ToC not yet synced" empty state is now driven by `aow_status: 'unmapped'` or `pairs: []` per REQ-BIL-IM-14, not by a missing sync job.)*
- **Bulk indicator mapping** — one-by-one via the modal only.
- **CGSpace / MQAP integration for knowledge products** — D9 partial Phase 2.
- **`innovation_use` indicator type** — deferred per D5=C.
- **Innovation Package** (PRMS type 10) — deferred per D13.
- **Cross-result validation rules** (OQ-1440-B). Server is authoritative.
- **i18n** — strings English-only; new strings extractable.

### 4.3 Architectural fit

- **Stack**: Angular 19 + PrimeNG 19 (PRD C-1). HLO modal + HLO cards are lazy-loaded standalone components (C-6).
- **Auth**: Existing Cognito JWT + `jWtInterceptor` (C-2). Editability inherits from [`../alignment-section/`](../alignment-section/)'s `BilateralService.editable` computed.
- **Controlled vocabularies**: CLARISA for any taxonomy that's CLARISA-owned (C-3). The ToC catalog (SP / AOW / HLO) is sourced live from CLARISA + PRMS via the backend's T-15.12 endpoint — not a new client taxonomy and not via a separate sync job. Reason / Quantitative-contribution option lists are OQs (§12).
- **Modals**: HLO modal routes through the existing `all-modals` host + `modal` wrapper. New `ModalName = 'hloSelection'`.
- **State**: signals; extends `BilateralService` with HLO-modal selection state + mapping state.
- **API**: extends `ApiService` with `GET_PoolFundingHlosIndicators` (result-scoped tree GET, live on `AC-1594-bilateral-module-v2`) + per-mapping POST/PATCH/DELETE (and an edit-mode pre-fill GET, gated by **OQ-IM-3**). No catalog-wide indicators GET — see §8 ToC backend audit.

---

## 5. Stakeholders / personas

> PRD §3.

| Persona | Interest | Role here |
| --- | --- | --- |
| **Researcher (PI / Contributor)** | Map their bilateral result to specific HLOs and capture the contribution + reason. | Primary editor when they are the result's Creator / PI / contact. Read-only otherwise. |
| **Center Admin** | Audit + correct mappings. | Editor on any eligible result (ownership bypass). |
| **System Admin** | Same as Center Admin, system-wide. | Editor on any eligible result. |
| **MEL Regional Expert** | Validate mappings across centers. | Read-only consumer. |
| **Cross-Platform Consumer** | Inherit mappings downstream (PRMS push). | Read-only via the GET. |

---

## 6. Functional requirements

### REQ-BIL-IM-01 — *"View High Level Outputs" AI card appears after SPs are saved*

- **Statement**: After the user saves alignment with `has_contribution=true` and one or more selected levers, an AI card titled "VIEW HIGH LEVEL OUTPUTS" appears below the SP picker on the alignment form.
- **Visual reference**: [`../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md`](../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md).
- **Acceptance criteria**:
  - AC-01.1 — Card hidden when `formData().has_contribution !== true` OR `currentAlignment().selected_levers.length === 0`.
  - AC-01.2 — Card renders with illustration (left), uppercase title `VIEW HIGH LEVEL OUTPUTS`, body copy (per mockup, verbatim), green CTA button. **CTA button label resolved per OQ-FIG-5** — proposed copy: `View HLOs` (NOT the mockup's `Upload file` placeholder).
  - AC-01.3 — Clicking the CTA opens the HLO selection modal (REQ-BIL-IM-02).
  - AC-01.4 — When at least one HLO is already mapped (`persistedMappings` is non-empty after joining against the result-scoped `hlosIndicators` tree), the card collapses to a thin "Manage HLO mappings" link/button to save vertical space. *(Confirm with design QA — see OQ-IM-7.)*
  - AC-01.5 — When the backend returns `aow_status: 'unmapped'` (no `bilateral_project_mapping` for the result), the card body switches to: `"This result isn't linked to a CLARISA project yet. Contact the bilateral operations team to register the project mapping before mapping HLOs."` CTA disabled. *(Added 2026-05-27.)*
  - AC-01.6 — When the backend returns `aow_status: 'no_aow_mappings'`, the card body switches to: `"The CLARISA project has Science Program mappings but no Area of Work breakdown. You can still pick HLOs — they'll be grouped by Science Program only."` CTA enabled. *(Added 2026-05-27 — see REQ-BIL-IM-19.)*

### REQ-BIL-IM-02 — *HLO selection modal opens with the SP/AOW tree sidebar*

- **Statement**: The HLO modal renders a left sidebar listing the user's selected SPs, each expandable into its **Areas of Work**.
- **Visual reference**: [`../figma-mockups/32471-131617-hlo-modal-empty.md`](../figma-mockups/32471-131617-hlo-modal-empty.md).
- **Acceptance criteria**:
  - AC-02.1 — Modal title: `High Level Outputs`. Close button (×) top-right.
  - AC-02.2 — Sidebar lists every SP returned in `hlosIndicators().pairs[].program` (de-duplicated). This is automatically scoped to the result's CLARISA project mappings — no cross-reference with `currentAlignment().selected_levers` needed. Each SP node is expandable; expanded state shows its AOWs (each pair's `area_of_work`).
  - AC-02.3 — One AOW is "active" at a time (highlighted with `Light Blue-100` per design tokens). Clicking another AOW switches the right pane's contents.
  - AC-02.4 — Each AOW carries a small numeric badge showing the count of items already selected in that AOW within this modal session (e.g., `3` on `AOW01`). See `33563:137770`.
  - AC-02.5 — **AOW data source RESOLVED 2026-05-27**: backend provides AOW pre-grouped via `pairs[].area_of_work` from the `GET .../hlos-indicators` endpoint (T-15.12). The sidebar consumes `pairs[]` directly — no client-side regrouping. See §8 ToC backend audit.

### REQ-BIL-IM-03 — *HLO modal main pane shows the indicator table for the active AOW*

- **Statement**: The right pane lists indicators belonging to the active AOW, with a search input, header row, and per-indicator rows with a selection checkbox + per-row commit button.
- **Visual reference**: `32471:131617`, `33563:137770`.
- **Acceptance criteria**:
  - AC-03.1 — Header breadcrumb shows `<SP name> > <AOW name>` (e.g., `Science Program 01 - Breeding for Tomorrow > AREA OF WORK 01 - MARKET INTELLIGENCE`).
  - AC-03.2 — Search input (debounced 300 ms) filters indicators within the active AOW. **Client-side filter** over the materialized `indicatorRows()` view — the `GET .../hlos-indicators` endpoint returns the full live tree and does not currently accept a `search` query param. If backend later adds server-side search, re-evaluate.
  - AC-03.3 — Each row shows: indicator code + name, target description (truncated to 2 lines + tooltip), status / metadata as the catalog provides. Final column set per design QA.
  - AC-03.4 — **Per-row commit button** (mockup label: `Button`, proposed final copy: `Add` / `Remove`) toggles the indicator in/out of the modal-session selection (parallel to checking the checkbox; both must be wired).
  - AC-03.5 — Row selected state uses a `Light Blue-100` background (per `33563:137770`).

### REQ-BIL-IM-04 — *Disabled indicator with reason callout*

- **Statement**: Indicators that cannot be mapped to the current result (per server-side rules) render disabled with an inline reason callout.
- **Visual reference**: [`../figma-mockups/33563-138613-hlo-modal-disabled-reason.md`](../figma-mockups/33563-138613-hlo-modal-disabled-reason.md).
- **Acceptance criteria**:
  - AC-04.1 — Disabled rows are greyed out, checkbox and commit button non-interactive.
  - AC-04.2 — A small callout (mockup: 259×26 floating callout) shows the reason: `This indicator cannot be mapped to this result because <reason>`. Reason text comes from the indicator catalog (server-provided; do not hardcode rules client-side).
  - AC-04.3 — Reason accessible via keyboard: `aria-describedby` always present in the DOM (not hover-only) per WCAG 2.1 AA.
  - AC-04.4 — Stale indicators (`is_stale=true && !is_mapped`) follow this same disabled pattern with the stale-specific reason: "This indicator was retired in the upstream catalog. Existing mappings are preserved; new mappings are not accepted."

### REQ-BIL-IM-05 — *HLO modal search + AOW navigation*

- **Statement**: Modal-internal search and AOW switching.
- **Acceptance criteria**:
  - AC-05.1 — Search input debounced 300 ms.
  - AC-05.2 — AOW selection in the sidebar updates the right pane from the already-materialized `indicatorRows()` view (one fetch per modal open — switching AOWs is a pure pivot over cached data).
  - AC-05.3 — Empty AOW (active pair has no outcomes + outputs) shows "No indicators in this Area of Work" inline.
  - AC-05.4 — Empty search result shows "No indicators match \"<query>\" in this Area of Work".
  - AC-05.5 — A "Clear filters" link resets the search (no refetch — search is client-side per AC-03.2).

### REQ-BIL-IM-06 — *HLO modal footer: selection counter + Confirm / Cancel*

- **Statement**: Footer shows `Selected → N items` and Confirm / Cancel buttons.
- **Acceptance criteria**:
  - AC-06.1 — Counter binds to the in-modal selection set (combination of pre-existing mapped indicators + newly added in this session, minus de-selected ones).
  - AC-06.2 — Confirm button writes the new selection back to the form and closes the modal. The actual server mutations fire on Save of the alignment form (see REQ-BIL-IM-13).
  - AC-06.3 — Cancel discards all unsaved selection changes; the inline HLO cards revert to the server state.
  - AC-06.4 — Closing via × is equivalent to Cancel (must be confirmed if pending changes are non-empty — confirm dialog: "Discard your selection changes?").

### REQ-BIL-IM-07 — *Modal session-state vs persisted-state contract*

- **Statement**: Selection changes inside the modal are **draft** until Confirm. The server is hit only on alignment-form Save (REQ-BIL-IM-13).
- **Acceptance criteria**:
  - AC-07.1 — Opening the modal seeds its working selection from the current `mappedIndicators` snapshot (the inline HLO cards' state).
  - AC-07.2 — Confirm sets the parent form's `pendingMappings` signal; modal closes.
  - AC-07.3 — Until the user clicks Save on the alignment form, the mapping changes are NOT persisted server-side. Navigating away triggers the unsaved-changes guard (existing pattern).

### REQ-BIL-IM-08 — *Inline HLO cards render grouped SP → AOW → HLO*

- **Statement**: Once mapped, HLOs render as cards on the alignment form, grouped first by SP, then by AOW.
- **Visual reference**: [`../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md`](../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md).
- **Acceptance criteria**:
  - AC-08.1 — Each SP renders a section header with the SP icon (24×24 favicon) + name.
  - AC-08.2 — Each AOW within the SP renders an uppercase subheader (e.g., `AREA OF WORK 01 - MARKET INTELLIGENCE`).
  - AC-08.3 — Each HLO renders as a card with: indicator code + name, status tag (e.g., `IN PROGRESS`), progress bar, the three field rows (Expected target / Quantitative contribution / Reason — see REQ-BIL-IM-09..11), and a `times-circle` × button top-right.
  - AC-08.4 — Card removal (× button) opens a confirm dialog (REQ-BIL-IM-12).
  - AC-08.5 — Cards are read-only when `editable === false` OR `is_read_only === true` (parallel to alignment-section behavior).

### REQ-BIL-IM-09 — *HLO card: Expected target (read-only)*

- **Statement**: Each HLO card shows an Expected target row: `Expected target → <value>`, sourced from the indicator catalog.
- **Visual reference**: `33356:11075` Frame 1171276358.
- **Acceptance criteria**:
  - AC-09.1 — Label `Expected target` left-aligned, `→` arrow icon (decorative; `aria-hidden`), value right of arrow.
  - AC-09.2 — Value formatted as `<number> - <unit>` (e.g., `20 - NUMBER OF KNOWLEDGE PRODUCTS`).
  - AC-09.3 — Read-only; user cannot edit.
  - AC-09.4 — When the catalog doesn't expose an expected target, the row is hidden (not "—").

### REQ-BIL-IM-10 — *HLO card: Quantitative contribution (conditional)*

- **Statement**: A small numeric/select dropdown appears on the HLO card **only** when the indicator's `is_quantitative` flag is true.
- **Visual reference**: [`../figma-mockups/32472-129409-pool-funding-alignment-filled-with-quantitative.md`](../figma-mockups/32472-129409-pool-funding-alignment-filled-with-quantitative.md).
- **Acceptance criteria**:
  - AC-10.1 — Label `Quantitative contribution` + `→` + 79×33 compact dropdown.
  - AC-10.2 — Option list source resolved per **OQ-IM-5** (per-indicator catalog data, or fixed list).
  - AC-10.3 — Touch target adjusted to 44×44 via padding (a11y).
  - AC-10.4 — Empty by default; required ONLY if `is_quantitative=true` AND the backend marks the field as required (OQ-IM-6).
  - AC-10.5 — When `is_quantitative=false`, the row is **absent** from the DOM (not just hidden).

### REQ-BIL-IM-11 — *HLO card: Why is this being reported? reason dropdown*

- **Statement**: Each HLO card has a required dropdown labeled `Why is this being reported?`.
- **Acceptance criteria**:
  - AC-11.1 — Label + searchable dropdown; full-width (988×119 panel per mockup).
  - AC-11.2 — Option list source resolved per **OQ-IM-4** (per-indicator catalog data vs fixed CLARISA taxonomy).
  - AC-11.3 — Required when `editable && !is_read_only`. Inline error renders if Save is attempted without selection.
  - AC-11.4 — Helper text region (hidden by default) available for validation errors.

### REQ-BIL-IM-12 — *Remove an HLO mapping via × on the card*

- **Statement**: × button on each card opens a confirm dialog; on confirm, the HLO is removed from the pending mappings.
- **Acceptance criteria**:
  - AC-12.1 — Confirm copy: "Remove this mapping? The contribution to `<indicator_name>` under `<SP_name> / <AOW_name>` will be removed on Save."
  - AC-12.2 — Removal is **draft** until alignment-form Save (mirrors REQ-BIL-IM-07).
  - AC-12.3 — Removed-but-not-yet-saved HLOs disappear from the inline list immediately; saved mappings persist until Save fires.
  - AC-12.4 — × button hidden when `!editable || is_read_only`.

### REQ-BIL-IM-13 — *Persist mappings on alignment-form Save*

- **Statement**: On alignment-form Save, the FE diffs the persisted-state vs the pending-state and issues POST / PATCH / DELETE per `(indicator_code, lever_code)` pair.
- **Acceptance criteria**:
  - AC-13.1 — Diff:
    - **Added**: indicators newly in `pendingMappings` not in `persistedMappings` → `POST .../contribution?lever-code=...`.
    - **Updated**: indicators in both, where Reason / Quantitative changed → `PATCH .../contribution?lever-code=...`.
    - **Removed**: indicators only in `persistedMappings` → `DELETE .../contribution?lever-code=...`.
  - AC-13.2 — Mutations run **sequentially** to give the server consistent state (one PATCH may invalidate others if rules change). Stop on first 409 (synced) — see REQ-BIL-IM-16.
  - AC-13.3 — Success toast: "Pool Funding Alignment + Mappings saved" (single toast for the whole batch).
  - AC-13.4 — On any 400, the offending HLO card surfaces the field-level error; saved mappings before the failure stay saved; pending mappings after the failure remain pending. The user can fix and re-Save.
  - AC-13.5 — **Body shape per mutation is OQ-IM-1** (gating).
  - AC-13.6 — Stale-but-mapped HLOs allow Reason/Quantitative edits (PATCH accepted by server). New mappings to stale indicators rejected client-side (REQ-BIL-IM-04 covers the UI).

### REQ-BIL-IM-14 — *Empty / unavailable catalog states*

- **Statement**: When the `GET .../hlos-indicators` response carries `aow_status: 'unmapped'`, or `pairs: []` (PRMS cache miss / upstream error), the HLO modal renders an explicit message instead of the tree. *(Revised 2026-05-27 — the "catalog not yet synced" framing predates the live CLARISA + PRMS data path. The new endpoint returns real upstream data; emptiness is now driven by `aow_status` + PRMS availability, not by a missing ToC sync job.)*
- **Acceptance criteria**:
  - AC-14.1 — `aow_status: 'unmapped'` → Modal main pane shows: "This result isn't linked to a CLARISA project yet. Contact the bilateral operations team to register the project mapping before mapping HLOs." Sidebar empty; Confirm disabled.
  - AC-14.2 — `pairs: []` (response succeeded but PRMS returned nothing — usually transient upstream issue) → Modal main pane shows: "The Theory of Change catalog is temporarily unavailable. Try again in a few minutes." Sidebar empty; Confirm disabled. Telemetry event fires for monitoring.
  - AC-14.3 — Footer Confirm button disabled in both states; only Cancel available.
  - AC-14.4 — On the inline form, the AI card body reflects the same condition (AC-01.5 / AC-01.6 cover the `aow_status` variants).
  - AC-14.5 — `aow_status: 'no_aow_mappings'` is **not** an empty state — it's a structural variant handled by REQ-BIL-IM-19 (flat list per SP, not the SP → AOW tree).

### REQ-BIL-IM-15 — *Read-only states inherited from alignment-section*

- **Statement**: When `editable === false` OR `is_read_only === true`, the AI card hides, the HLO modal cannot be opened, and HLO cards become read-only.
- **Acceptance criteria**:
  - AC-15.1 — AI card absent from DOM.
  - AC-15.2 — × buttons on HLO cards absent.
  - AC-15.3 — Reason + Quantitative dropdowns disabled.
  - AC-15.4 — Expected target unchanged (already read-only).

### REQ-BIL-IM-16 — *409 Conflict handled gracefully*

- **Statement**: When any mapping mutation returns 409, the form transitions to read-only consistently with the alignment-section.
- **Acceptance criteria**:
  - AC-16.1 — Refetch alignment (`bilateralService.getAlignment(resultCode)`).
  - AC-16.2 — Refetch HLO mappings.
  - AC-16.3 — Show a one-time warning toast: "This result was synced to PRMS. Your unsaved mapping changes were not applied."
  - AC-16.4 — Stop any remaining mutations in the batch (AC-13.2).

### REQ-BIL-IM-17 — *Lever-cascade refresh*

- **Statement**: When `selected_levers` changes (the user removes a lever in the alignment section + saves), HLO cards belonging to that lever must be removed from the form on the next render.
- **Acceptance criteria**:
  - AC-17.1 — On next mappings GET, cards for removed levers disappear. Server is authoritative on cascade.
  - AC-17.2 — The HLO modal reopened after the cascade only shows the still-selected SPs in its sidebar.
  - AC-17.3 — Adding a lever creates a new (empty) SP group in the sidebar.

### REQ-BIL-IM-18 — *Stale indicators: existing mappings editable; new mappings blocked*

- Mirrors [handoff §5](../ari-backend-context/frontend-handoff.md#5-business--ux-rules-the-fe-must-honour).
- **Acceptance criteria**:
  - AC-18.1 — `is_stale=true && is_mapped=true` → HLO card editable; Reason / Quantitative edits PATCH normally.
  - AC-18.2 — `is_stale=true && !is_mapped` → row in modal disabled with the stale reason (REQ-BIL-IM-04 path).
  - AC-18.3 — *(2026-05-27 update)* `is_stale` is sourced from the persisted `HloMapping.is_stale` column on `ResultPoolFundingIndicatorMapping` (already shipped per [`./open-questions-for-ba.md` §7.1](./open-questions-for-ba.md#71-backends-verdict-per-oq)). The catalog rows returned by `GET .../hlos-indicators` (raw `PrmsTocIndicator` shape) do NOT carry per-row staleness. The FE joins the catalog rows with `persistedMappings` to compute the disabled-with-stale-reason state for already-mapped indicators that have been retired upstream.

### REQ-BIL-IM-19 — *`aow_status: 'no_aow_mappings'` empty-AOW UX (new — added 2026-05-27)*

- **Statement**: When the backend returns `aow_status: 'no_aow_mappings'` (the result's CLARISA project has SP-level mappings but no Area of Work breakdown), the modal renders the available indicators as a flat list per SP without an AOW intermediate level. The §8 ToC backend audit observed this on 28 of 31 TEST bilateral projects, so this may be the dominant flow in production — not a corner case.
- **Tracked under**: OQ-IM-10 (non-gating) — see §12.
- **Acceptance criteria**:
  - AC-19.1 — Sidebar lists each SP from `pairs[].program` (de-duplicated). SPs are **not** expandable (no AOW level to expand into); clicking an SP activates it as the right-pane scope.
  - AC-19.2 — Right pane lists all indicators returned for the active SP (union of `outcomes[].indicators[]` and `outputs[].indicators[]` across all `pairs[]` matching that SP, regardless of `area_of_work` value).
  - AC-19.3 — Selection keys use empty string `''` as the AOW token: `(program, '', indicator_id)`. Persisted alongside `HloMapping` rows with `aow_code: ''`.
  - AC-19.4 — Footer counter and Confirm/Cancel behavior unchanged.
  - AC-19.5 — Inline HLO cards on the alignment form (REQ-BIL-IM-08) render without the AOW subheader when `aow_code === ''` — group by SP only.
  - AC-19.6 — **Default UX** described above is option (a) of OQ-IM-10. If BA + designer pick (b) or (c) instead, T-BIL-IM-16 refines this requirement.

---

## 7. Non-functional requirements

- **REQ-BIL-IM-NF-01 — Performance.** HLO modal opens in ≤ 0.6 s; switching active AOW in ≤ 0.3 s; inline HLO cards render in ≤ 1.5 s on a result with 5 SPs × 3 AOWs × 5 HLOs.
- **REQ-BIL-IM-NF-02 — Accessibility (C-4).** Modal focus trap; SP/AOW sidebar keyboard-navigable; disabled-indicator reason via `aria-describedby` (not hover-only); selection-counter `aria-live`; Confirm button announces "Confirm N items selected".
- **REQ-BIL-IM-NF-03 — Bundle budget (C-5).** Modal + HLO cards lazy-loaded; total gzip cost ≤ 60 KB. Initial chunk addition ≤ 5 KB (`BilateralService` extension).
- **REQ-BIL-IM-NF-04 — Theming.** Dark + light parity. Reuses existing `--ac-*` tokens. Three minor token gaps flagged by mockup README §5 (info icon, input icon semantic alias, surface 900) — propose system-design §7 additions.
- **REQ-BIL-IM-NF-05 — i18n-ready.** New strings as static template literals; the deliberate D12 typos (if they survive OQ-IM-1) are JS-side only.
- **REQ-BIL-IM-NF-06 — Coverage.** New service methods ≥ 90% statements; new components ≥ 70%. Project-wide floors must not regress.

---

## 8. Data inputs & outputs

### 8.1 Inputs (REST) — current backend shape (updated 2026-05-27)

| Endpoint | Service method | Used by | Notes |
| --- | --- | --- | --- |
| `GET /results/:resultCode/pool-funding-alignment/hlos-indicators` | `ApiService.GET_PoolFundingHlosIndicators(resultCode)` | `BilateralService.getHlosIndicators` | **T-15.12 — already shipped on `AC-1594-bilateral-module-v2` (commit `907993e7`).** Returns `MainResponse<BilateralHlosIndicatorsResponse>` — a result-scoped tree with `pairs[].program / .area_of_work / .outcomes[] / .outputs[] / .indicators[]`, plus `aow_status` and `clarisa_project`. Sourced live from CLARISA + PRMS, 5-min backend cache. No query params today. Replaces the previously planned catalog-wide `GET .../indicators`. |
| `POST/PATCH/DELETE .../indicators/:indicatorCode/contribution?lever-code=...` | `ApiService.{POST,PATCH,DELETE}_PoolFundingContribution(...)` | `BilateralService.{create,update,delete}Contribution` | **OQ-IM-1** — body shape conflict between mockup ("Expected target / Quantitative / Why") and handoff (5 polymorphic types). |
| `GET .../indicators/:indicatorCode/contribution?lever-code=...` (gated by OQ-IM-3) | `ApiService.GET_PoolFundingContribution(...)` | `BilateralService.getContribution` (edit pre-fill) | **Backend ACCEPTED** ([§7.1](./open-questions-for-ba.md#71-backends-verdict-per-oq)) — ships ~½ day, bundled in the safe-bundle PR. |
| (existing — depending on OQ-IM-4 / OQ-IM-5) | CLARISA lookups for Reason / Quantitative options | Form dropdowns | If catalog-driven, the catalog GET returns the option lists per indicator. |

### 8.2 Inputs (Socket.IO)

Reuses the `result.pool-funding-alignment.changed` event already subscribed by alignment-section. No new subscription.

### 8.3 Outputs (UI)

- AI card on the alignment form ("VIEW HIGH LEVEL OUTPUTS").
- HLO selection modal (tree picker).
- Inline HLO cards on the alignment form (SP → AOW grouped).
- Confirm dialog for HLO removal.
- Single batched success toast on alignment-form Save.
- Telemetry events:
  - `bilateral.hlo.modal.opened` (per result per session).
  - `bilateral.hlo.selection.confirmed` (with `{ added_count, removed_count, total_count }`).
  - `bilateral.hlo.mapping.saved` (per successful mutation in the batch).

### 8.4 Persisted state

No new client-side persistence. Pending mappings live in the parent component until Save.

---

## 9. Controlled vocabularies

- **ToC catalog (SP / AOW / HLO)** — surfaced live from CLARISA + PRMS via the backend's T-15.12 endpoint (see §8.1). Not duplicated in ARI. AOW is a CLARISA level-2 entity (`prefix=AOW`, parent SP); HLOs are PRMS ToC results (OUTCOMEs + OUTPUTs). The originally referenced "T-31 ToC sync" is no longer needed — the backend reads the upstream directly.
- Reason and Quantitative-contribution option lists — sources TBD (**OQ-IM-4**, **OQ-IM-5**). Both should ultimately live in the catalog response so the FE doesn't duplicate state.

---

## 10. Role & permission matrix

> Mirrors server enforcement; identical to the alignment-section matrix.

| Action | Researcher (owner) | Researcher (non-owner) | Center Admin | MEL Regional Expert | System Admin |
| --- | --- | --- | --- | --- | --- |
| See AI card + open HLO modal | ✅ | ❌ (no AI card; modal can be opened for read-only view only — TBD per design QA) | ✅ | ❌ | ✅ |
| Confirm mapping changes | ✅ | ❌ | ✅ | ❌ | ✅ |
| Edit HLO card Reason / Quantitative | ✅ | ❌ | ✅ | ❌ | ✅ |
| Remove HLO mapping (×) | ✅ | ❌ | ✅ | ❌ | ✅ |
| See mapped HLO cards as read-only | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit while result is synced | ❌ (server 409) | ❌ | ❌ | ❌ | ❌ |

Guard composition reuses `BilateralService.editable` — no new permission logic.

---

## 11. Telemetry & observability

- **Clarity events** via `ClarityService.trackEvent`:
  - `bilateral.hlo.modal.opened` — once per result per session.
  - `bilateral.hlo.selection.confirmed` — payload `{ result_code, added_count, removed_count, total_count }`.
  - `bilateral.hlo.mapping.saved` — payload `{ result_code, indicator_code, lever_code, operation: 'create'|'update'|'delete' }`.
- **Error surfaces**:
  - Inline within the modal for disabled-indicator reasons (server-provided).
  - Field-level inline errors on HLO cards for 400 responses.
  - Warning toast for 409 (synced).
  - Global toast via `httpErrorInterceptor` for 5xx.

---

## 12. Assumptions & open questions

### Assumptions

- **A-1** — `bilateralService.editable` from [`../alignment-section/`](../alignment-section/) is the single source of truth for editability.
- **A-2** — *(revised 2026-05-27)* The backend reads CLARISA + PRMS live via the T-15.12 endpoint, so production renders **real** ToC data when the result's CLARISA project carries level-1/level-2 mappings. Empty states are now driven by `aow_status` and `pairs[]` (see REQ-BIL-IM-14) — not by a missing ToC sync job. Sparse-AOW coverage is observed in TEST today (28 of 31 projects → `no_aow_mappings`); REQ-BIL-IM-19 covers the resulting UX.
- **A-3** — The existing `all-modals` + `modal` wrappers can host a heavier modal layout (1277×1113 from the mockup). *(Verify during design — see OQ-IM-8.)*
- **A-4** — `ModalName` can be extended; the modal-context pattern (`CreateResultManagementService`-style) is reusable.

### **Open questions — GATING (must resolve before `/sdd-execute`)**

> **2026-05-26 status update (early)**: a direct FE-side audit of the ARI backend repo (`alliance-research-indicators-main/server/researchindicators/src/domain/entities/bilateral/`, branch `AC-1594-bilateral-module`) grounded all three gating OQs in actual code. Findings + FE-recommended paths are captured in [`./open-questions-for-ba.md` §6](./open-questions-for-ba.md#6-backend-code-findings--2026-05-26-fe-side-audit--recommendations). **FE leans Path A on all three**.
>
> **2026-05-26 status update (late) — backend reply received**: full reply snapshotted at [`../ari-backend-context/backend-response-to-fe.md`](../ari-backend-context/backend-response-to-fe.md) and summarized at [`./open-questions-for-ba.md` §7](./open-questions-for-ba.md#7-backend-reply--2026-05-26-received). Net result:
> - **OQ-IM-3 ACCEPTED** by backend; ships in ~½ day bundled with bonuses. Body shape couples to OQ-IM-1's outcome — backend can ship now with the current polymorphic shape OR wait for OQ-IM-1 to simplify.
> - **Bonus `is_stale` already shipped** on the panel response DTO — FE can consume immediately. The audit was stale on this one.
> - **Bonus `is_quantitative` + `disabled_reason` ACCEPTED** by backend, gated on BA seed list + reason taxonomy alignment.
> - **OQ-IM-1 escalated to PO** — backend won't act without PO retiring R-BIL-031 + D5 + D12 (the per-type-payload requirement + its supporting decisions).
> - **OQ-IM-2 escalated to BA** — overtaken by the 2026-05-27 ToC backend audit (see next bullet).
> - **OQ-IM-4 reclassified as gating-once-OQ-IM-1-Path-A-approved** by backend (validation needs a finite enum). Provisional default `direct_contribution | aligned_with | reference_only | other`; FE's UX position recorded in [`./open-questions-for-ba.md` §7.4](./open-questions-for-ba.md#74-stars-open-follow-ups-where-the-fe-has-input).
>
> **2026-05-27 status update — ToC backend audit ([`./open-questions-for-ba.md` §8](./open-questions-for-ba.md#8-toc-backend-audit--2026-05-27-received))**:
> - **OQ-IM-2 RESOLVED**: backend already ships `GET .../hlos-indicators` (T-15.12 / commit `907993e7`) returning the SP → AOW → outcome/output → indicator tree pre-grouped via `pairs[]`, sourced live from CLARISA + PRMS. AOW is not a first-class ARI entity (no migration planned) — comes through transitively from each result's CLARISA project mappings. 1:1 indicator → AOW cardinality. FE switches consumer to the new endpoint; planned `IndicatorGroupResponse` / `AreaOfWorkGroup` types are withdrawn.
> - **New non-gating OQ-IM-10** raised for the `no_aow_mappings` empty-state UX (28 of 31 TEST projects today). Covered by **REQ-BIL-IM-19**; FE ships a graceful default (flat list per SP) without sign-off; designer + BA confirm later.
> - **Safe-bundle coordination needed**: bonus fields (`is_quantitative`, `disabled_reason`) target the now-unused `IndicatorPanelIndicatorResponse`. Backend needs to mirror them onto `PrmsTocIndicator` (or a sibling enrichment DTO) before T-BIL-IM-09 starts.
>
> Remaining gates: OQ-IM-1 (PO) + OQ-IM-3 (already accepted, awaiting ship). Fallback per backend §6 paragraph 4: if PO stalls on OQ-IM-1 beyond ~1 week, FE can ship US3/US4 against the **current polymorphic shape** as a Phase-1 compromise and revisit simplification in Phase 2.

- **OQ-IM-1 — Contribution body shape (HEADLINE).** Mockup card has 3 user-editable fields: **Expected target** (read-only), **Quantitative contribution** (conditional dropdown), **Why is this being reported?** (required dropdown). Backend handoff §7 specifies **5 polymorphic types** with completely different fields (`capacity_sharing.women/men/non_binary/has_unkown_using/...`, `knowledge_product.handle/licence/...`, etc.). These do not overlap. **Resolution paths**:
  - (a) Mockups supersede; backend re-issues a simplified contribution body (`{ quantitative_contribution?: number; reason_code: string }`). Treats the 5 polymorphic types as deferred / dead code.
  - (b) Mockup card is a wrapper; clicking a deeper "Details" CTA opens a type-specific sub-form. Mockups don't show this — would need new design.
  - (c) The mockup's three fields map onto **one** of the 5 types (most likely `NOOP` with `narrative` = "Reason"). The other 4 types are deferred.
  - (d) Hybrid: send the mockup's three fields as a flat body alongside `indicator_type` discriminator; backend handlers accept-and-store but the contract is documented.
  - **Action required**: BA / backend team picks one path. Spec cannot finalize the form, the service shape, or the tests without this answer.

- ~~OQ-IM-2 — AOW data source.~~ → **RESOLVED 2026-05-27 via §8 ToC backend audit.** Backend already ships the SP → AOW → outcome/output → indicator tree pre-grouped via `pairs[]` on the result-scoped `GET /api/v1/results/:resultCode/pool-funding-alignment/hlos-indicators` endpoint (T-15.12 / commit `907993e7`). AOW is a CLARISA level-2 entity (`prefix=AOW`, parent SP), not persisted in ARI — sourced live from CLARISA per result's `bilateral_project_mapping`. 1:1 indicator → AOW cardinality. No FE fallback needed; no backend AOW migration required. None of resolution paths (a)–(c) above apply; the answer is "the endpoint already exists." See [`./open-questions-for-ba.md` §8](./open-questions-for-ba.md#8-toc-backend-audit--2026-05-27-received).

- **OQ-IM-3 — Edit-mode pre-fill source for existing mappings.** Does `GET .../contribution?lever-code=...` exist? Or does the panel GET embed the existing contribution body inline (`indicator.contribution?: ...`)? Carried forward from prior spec — **still gating**.

### Non-gating open questions

- **OQ-IM-4 — Reason ("Why is this being reported?") option-list source.** Per-indicator catalog data, fixed CLARISA taxonomy, or free text? *(Resolve in `design.md` once OQ-IM-1 is settled.)*
- **OQ-IM-5 — Quantitative contribution option-list source.** Per indicator (likely — units differ), and option shape: numeric input vs categorical dropdown? *(Resolve in `design.md`.)*
- **OQ-IM-6 — `is_quantitative` flag source.** Mockup §5 implies it's on the indicator catalog. Confirm field name and visibility. *(Resolve in `design.md`.)*
- **OQ-IM-7 — AI card behavior when mappings exist.** Collapse to a thin link/button, or keep full card? Confirm with design QA.
- **OQ-IM-8 — Modal max-width.** 1277 px from the mockup is wider than typical `all-modals` content; confirm the wrapper supports it without shell changes.
- **OQ-IM-9 — Disabled-indicator reason source.** Mockup `33563:138613` says reason is dynamic. Backend ACCEPTED a `disabled_reason: string | null` field in §7.1, but it targets the (now-unused) `IndicatorPanelIndicatorResponse`. **2026-05-27 follow-up**: backend needs to mirror the field onto `PrmsTocIndicator` (or a sibling enrichment DTO) for it to surface through the new `GET .../hlos-indicators` endpoint. Until then, `IndicatorRow.disabled_reason` is `null` for all rows from the new endpoint and the disabled-row UX (REQ-BIL-IM-04) won't trigger in production data.
- **OQ-IM-10 *(new — 2026-05-27)* — `aow_status: 'no_aow_mappings'` empty-AOW UX.** Backend's T-15.12 endpoint returns three values for `aow_status`: `'unmapped'` (no CLARISA project mapping), `'no_aow_mappings'` (CLARISA project has SP mappings but no AOW breakdown), `'has_aow'` (canonical mockup case). The `no_aow_mappings` state appears on 28 of 31 TEST bilateral projects — potentially dominant in prod. Options:
  - (a) **Flat list per SP** (no AOW intermediate level) — FE default per REQ-BIL-IM-19; ships without sign-off.
  - (b) Surface outcomes/outputs without an AOW header band; selection keys drop `area_of_work`.
  - (c) Block the modal with a "this result's CLARISA project needs AOW mappings…" CTA.
  - **Action**: BA + designer pick a variant when convenient; T-BIL-IM-16 refines if ≠ (a). *(Non-gating: FE can ship (a) as default.)*
- **OQ-FIG-5 — AI card CTA copy.** Mockup says `Upload file` — almost certainly a typo. Propose `View HLOs`. Confirm with designer.
- **OQ-FIG-10 — Tab position in result sidebar.** Mockup `33356:11736` shows Pool Funding alignment positioned between "Contributions to indicators" and the submit area. The alignment-section spec already shipped with our chosen position — confirm whether to re-order.
- Carried forward: D9 (partial KP support), D5 (`innovation_use` deferred), D13 (Innovation Package deferred), `ActionsService` action-toast extension (OI-AS-3 from alignment-section).

---

## 13. References

- PRD: [`docs/prd.md`](../../../prd.md) §3 (personas), §4 (goals/KPIs), §8.3 (constraints C-1..C-6).
- System Design: [`docs/system-design/design.md`](../../../system-design/design.md) §7 (tokens), §8 (components), §11 (dark mode), §12 (decisions log).
- Detailed Design: [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §2 (modules), §4.3 (endpoints), §6 (state).
- Visual references (mockup files):
  - [`../figma-mockups/README.md`](../figma-mockups/README.md) — index, token mapping, component coverage.
  - [`../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md`](../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md) — AI card.
  - [`../figma-mockups/32471-131617-hlo-modal-empty.md`](../figma-mockups/32471-131617-hlo-modal-empty.md) — modal layout, sidebar, table.
  - [`../figma-mockups/33563-137770-hlo-modal-3-items-selected.md`](../figma-mockups/33563-137770-hlo-modal-3-items-selected.md) — selection state.
  - [`../figma-mockups/33563-138613-hlo-modal-disabled-reason.md`](../figma-mockups/33563-138613-hlo-modal-disabled-reason.md) — disabled row.
  - [`../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md`](../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md) — HLO cards.
  - [`../figma-mockups/32472-129409-pool-funding-alignment-filled-with-quantitative.md`](../figma-mockups/32472-129409-pool-funding-alignment-filled-with-quantitative.md) — quantitative variant.
- Sibling specs:
  - [`../tag-visibility/`](../tag-visibility/) — `BilateralService` facade origin.
  - [`../alignment-section/`](../alignment-section/) — `editable` computed + `currentAlignment` signal + 409-handling. **Foundations reused.**
- Backend handoff: [`../ari-backend-context/frontend-handoff.md`](../ari-backend-context/frontend-handoff.md) §4.4, §4.5, §5, §6, §7 — **referenced where it agrees; conflicts with mockups documented under OQ-IM-1** (OQ-IM-2 was resolved by the 2026-05-27 ToC backend audit — see [`./open-questions-for-ba.md` §8](./open-questions-for-ba.md#8-toc-backend-audit--2026-05-27-received)).
- Backend response to FE: [`../ari-backend-context/backend-response-to-fe.md`](../ari-backend-context/backend-response-to-fe.md) — 2026-05-26 reply.
- **Open questions audit**: [`./open-questions-for-ba.md`](./open-questions-for-ba.md) — §8 ToC backend audit is the authoritative source for the 2026-05-27 endpoint switch.
- Jira: [`../jira-us/AC-1439-us3-display-toc-indicators.md`](../jira-us/AC-1439-us3-display-toc-indicators.md), [`../jira-us/AC-1440-us4-map-results-indicators.md`](../jira-us/AC-1440-us4-map-results-indicators.md).

---

## 14. Requirement ID index

| ID | Title | Persona(s) | Type |
| --- | --- | --- | --- |
| REQ-BIL-IM-01 | AI card "View High Level Outputs" entry point | All authenticated; editor-only for actions | Functional |
| REQ-BIL-IM-02 | HLO modal opens with SP/AOW tree sidebar | Editors | Functional |
| REQ-BIL-IM-03 | HLO modal main pane (indicator table for active AOW) | Editors | Functional |
| REQ-BIL-IM-04 | Disabled indicator with reason callout | All viewing | Functional |
| REQ-BIL-IM-05 | HLO modal search + AOW navigation | Editors | Functional |
| REQ-BIL-IM-06 | HLO modal footer (counter + Confirm / Cancel) | Editors | Functional |
| REQ-BIL-IM-07 | Modal session-state vs persisted-state | Editors | Functional |
| REQ-BIL-IM-08 | Inline HLO cards grouped SP → AOW → HLO | All authenticated | Functional |
| REQ-BIL-IM-09 | HLO card: Expected target (read-only) | All | Functional |
| REQ-BIL-IM-10 | HLO card: Quantitative contribution (conditional) | Editors | Functional |
| REQ-BIL-IM-11 | HLO card: Why is this being reported? reason dropdown | Editors | Functional |
| REQ-BIL-IM-12 | Remove HLO mapping via × | Editors | Functional |
| REQ-BIL-IM-13 | Persist mappings on alignment-form Save | Editors | Functional |
| REQ-BIL-IM-14 | Empty / unavailable catalog states (`aow_status: 'unmapped'` / `pairs: []`) | All | Functional |
| REQ-BIL-IM-15 | Read-only states inherited | All | Functional |
| REQ-BIL-IM-16 | 409 Conflict handled gracefully | Editors | Functional |
| REQ-BIL-IM-17 | Lever-cascade refresh | All | Functional |
| REQ-BIL-IM-18 | Stale indicators behavior | All | Functional |
| REQ-BIL-IM-19 | `aow_status: 'no_aow_mappings'` empty-AOW UX *(new 2026-05-27)* | All | Functional |
| REQ-BIL-IM-NF-01 | Performance — modal ≤ 0.6 s; cards ≤ 1.5 s | All | Non-functional |
| REQ-BIL-IM-NF-02 | Accessibility WCAG 2.1 AA (C-4) | All | Non-functional |
| REQ-BIL-IM-NF-03 | Bundle budget — ≤ 60 KB lazy / ≤ 5 KB initial | All | Non-functional |
| REQ-BIL-IM-NF-04 | Dark + light theming parity | All | Non-functional |
| REQ-BIL-IM-NF-05 | i18n-ready | All | Non-functional |
| REQ-BIL-IM-NF-06 | Coverage floors | All | Non-functional |

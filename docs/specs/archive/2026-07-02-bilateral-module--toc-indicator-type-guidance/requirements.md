# Requirements — ToC Mapping: Indicator-Type Guidance

> Spec: `docs/specs/bilateral-module/toc-indicator-type-guidance/` · Depth: **Standard** · Approved intent: [`./proposal.md`](./proposal.md) (APPROVED 2026-07-02)
>
> Parent spec: [`../../archive/2026-06-17-bilateral-module--toc-mapping-v2/`](../../archive/2026-06-17-bilateral-module--toc-mapping-v2/requirements.md) — this spec **resolves OQ-1/OQ-2 (A-4, D-5)**: the deliberately-unfiltered indicator dropdown.

---

## 1. Summary

Result submitters aligning a result with a Science Program's Theory of Change often face indicator lists where **no indicator matches their result type** (e.g. a Capacity Sharing for Development result on an HLO whose indicators are all "Number of innovations"). Live-lambda analysis (2026-07-02) shows a hard filter is not viable — for Capacity Sharing, only 1/22 HLOs in SP01 and 1/30 in SP04 carry a compatible indicator. This spec adds **deterministic, non-blocking guidance** to the existing per-SP cascade: recommended-vs-other grouping in the indicator dropdown, per-option type badges, compatibility hints on HLO options, a guidance note when the chosen HLO has no type-matching indicator, and a soft warning when a cross-type indicator is selected. FE-only; no contract, payload, or save-gating changes.

## 2. Motivation & PRD Linkage

- **Persona(s)**: Researcher / Result Reporter (primary), Center Admin, MEL Regional Expert (PRD §3.1–3.3).
- **PRD goal(s) addressed**: §4.1 G-1 (one canonical, *correctly structured* result record), G-2 (trust the taxonomy — mappings reflect real type semantics).
- **KPIs moved**: M1 (time-to-submit — fewer dead-ends hunting for a valid indicator), M2 (structured correctness of reported alignments).
- **User stories addressed**: R-2/R-5 flow quality (submission without silent data-quality errors).
- **Non-goals from PRD §5.2 invoked**: no new backend capabilities; no PRMS-side changes.
- **Constraints**: C-1 (Angular 19 + PrimeNG 19), C-4 (WCAG 2.1 AA), C-5 (bundle budgets), C-6 (standalone components).

## 3. Scope

### In scope

- Classification of each ToC catalog indicator relative to the result's `result_type` using a reviewed FE compatibility matrix over `type_value`.
- Indicator dropdown grouping ("Recommended…" / "Other indicators") + per-option type badge, inside `sp-toc-alignment-block`.
- HLO dropdown compatibility hint (per-option tag when the HLO contains ≥1 type-matching indicator).
- Non-blocking inline guidance note when the selected HLO has zero type-matching indicators (listing the SP/level's compatible HLOs).
- Non-blocking inline warning when a cross-type indicator is selected (also on re-open of a saved cross-type alignment).
- Graceful neutral degradation when typing data is absent or the result type has no matrix row.
- Unit tests over the shared ToC catalog fixture.

### Out of scope

- Any backend/contract change (catalog payload already carries `type_value`; `result_type` already on the envelope).
- Blocking validation, mandatory justification text, or any change to the PATCH write payload / save gating.
- AI-based suggestion (Phase 2 of the proposal — evidence-gated, separate spec).
- Changes to `allowed_levels` semantics (backend-owned; `knowledge_product`, `innovation_use`, `oicr`, `unknown` currently get `[]` ⇒ cascade hidden — those result types never reach this UI today).
- Fixing upstream taxonomy gaps (missing `type_value`, free-text `_n_*` types) — reported upstream, not patched client-side.
- The saved-alignments summary/read-back rendering (`SavedTocAlignment`) — unchanged.

## 4. Functional Requirements

> Result-type display labels used in copy: `capacity_sharing` → "Capacity Sharing for Development", `innovation_dev` → "Innovation Development", `policy_change` → "Policy Change", `knowledge_product` → "Knowledge Product", `innovation_use` → "Innovation Use".

- **REQ-BIL-ITG-01** — *Indicator compatibility classification.*
  - Statement: The system SHALL classify every indicator offered in the cascade, relative to the catalog envelope's `result_type`, into exactly one of: `type-match`, `wildcard` (`type_value === 'custom'`), `other` (a recognized canonical `type_value` that maps to a different result type), or `unclassified` (null, `_n_*`-prefixed, or unrecognized `type_value`).
  - **Persona(s)**: all editors.
  - **Compatibility matrix** (FE constant, exact-string on `type_value`; BA-confirmable, see OQ-1):

    | `result_type` | type-match `type_value` |
    |---|---|
    | `capacity_sharing` | `Number of people trained (capacity sharing for development)` |
    | `innovation_dev` | `Number of innovations (innovation development)` |
    | `knowledge_product` | `Number of knowledge products` |
    | `policy_change` | `Number of Policy (Policy Change)` |
    | `innovation_use` | `Innovation Use` |
    | `oicr`, `unknown`, any other key | — (no row ⇒ guidance disabled, REQ-BIL-ITG-05) |

  - **Acceptance criteria**:
    - AC-01.1 — Classification is a pure function of (`result_type`, `type_value`); given the matrix above it returns `type-match` / `wildcard` / `other` / `unclassified` per the definitions.
    - AC-01.2 — `type_value === 'custom'` classifies as `wildcard` for **every** result type with a matrix row.
    - AC-01.3 — `type_value` of `null`, empty, `_n_`-prefixed, or any string not in the canonical set classifies as `unclassified` and is NEVER treated as mismatched (`other`).
    - AC-01.4 — Matching is exact-string after `trim()`; casing differences do NOT match (guards silent upstream renames — surfaced by tests, not fuzzy logic).

- **REQ-BIL-ITG-02** — *Grouped, badged indicator dropdown.*
  - Statement: The indicator dropdown SHALL present options grouped as "Recommended for *\<result type label\>*" (`type-match` + `wildcard`, type-matches first) followed by "Other indicators" (`other` + `unclassified`), with a per-option type badge; all indicators remain selectable.
  - **Acceptance criteria**:
    - AC-02.1 — When ≥1 recommended option exists, two labeled groups render in the stated order; group labels are not selectable options.
    - AC-02.2 — Options with a canonical `type_value` show a short badge ("Trained people", "Innovations", "Knowledge products", "Policy", "Innovation use", "Custom"); `unclassified` options show no badge.
    - AC-02.3 — When zero recommended options exist for the selected HLO, the dropdown renders the flat, ungrouped list (today's behavior) — no empty "Recommended" header.
    - AC-02.4 — The existing client-side search filters across both groups; a group header disappears when the search empties it.
    - AC-02.5 — Every indicator of the selected HLO remains present and selectable (count parity with today's unfiltered list).
  - Scenario: *Capacity Sharing result on a mixed HLO*
    - GIVEN a `capacity_sharing` result and a selected HLO with indicators typed "Number of people trained (capacity sharing for development)", "custom", and "Number of innovations (innovation development)"
    - WHEN the indicator dropdown opens
    - THEN "Recommended for Capacity Sharing for Development" lists the trained-people indicator then the custom one
    - AND "Other indicators" lists the innovations indicator with an "Innovations" badge.

- **REQ-BIL-ITG-03** — *Cross-type selection warning (non-blocking).*
  - Statement: When the selected indicator classifies as `other`, the system SHALL show a non-blocking inline warning naming both types; selection, contribution entry, and save remain enabled.
  - **Acceptance criteria**:
    - AC-03.1 — Warning appears below the indicator field on selecting an `other` indicator, worded: "This indicator is typed *\<indicator type label\>*; this result is *\<result type label\>*. Confirm the contribution belongs here." (exact copy in design §copy).
    - AC-03.2 — No warning for `type-match`, `wildcard`, or `unclassified` selections.
    - AC-03.3 — The warning never disables the contribution panel, the Save action, or existing section validation (payload unchanged: `indicator_id` only).
    - AC-03.4 — Re-opening a result whose saved alignment resolves (via the live catalog) to an `other` indicator shows the same warning without any draft mutation; if the saved indicator no longer resolves in the catalog, no warning renders (existing staleness handling untouched).
  - Scenario: *Conscious cross-type mapping*
    - GIVEN a `capacity_sharing` result and an HLO with no trained-people indicators
    - WHEN the user selects an indicator typed "Number of innovations (innovation development)"
    - THEN the inline warning names both types
    - AND the quantitative-contribution panel opens normally and the section saves exactly as today.

- **REQ-BIL-ITG-04** — *HLO compatibility hints and no-match guidance.*
  - Statement: HLO options SHALL indicate when they contain ≥1 `type-match` indicator, and when the selected HLO contains none, a non-blocking note SHALL list the compatible HLOs available at the same SP and level.
  - **Acceptance criteria**:
    - AC-04.1 — In the HLO dropdown, each option containing ≥1 `type-match` indicator shows a subtle tag (e.g. "has *\<short type label\>*"); `wildcard`-only HLOs get no tag.
    - AC-04.2 — When a selected HLO has zero `type-match` indicators, a note renders between the HLO and indicator fields: it names the result type and lists up to 5 same-SP-same-level HLOs (AOW code + title) that have ≥1 `type-match` indicator.
    - AC-04.3 — Each listed HLO is actionable: activating it selects that HLO (equivalent to picking it in the dropdown, including the existing downstream reset of indicator + contribution).
    - AC-04.4 — When NO HLO at that SP+level has a `type-match` indicator, the note states that none of this Program's *\<level label\>* results carry *\<result type label\>* indicators and that the closest indicator may be used (it will show the type notice) — no HLO list, no dead end.
    - AC-04.5 — The note is informational (`role="status"`), never blocks selection or save, and disappears once the selected HLO has a `type-match` indicator.
  - Scenario: *Discovery instead of dead-end*
    - GIVEN a `capacity_sharing` result on SP06 with level "High Level Output" and a selected HLO whose indicators are all innovation-typed
    - WHEN the HLO's indicators resolve
    - THEN the note lists the SP06 OUTPUT HLOs that do carry trained-people indicators
    - AND activating one switches the HLO selection and clears indicator + contribution per the existing cascade-reset rules.

- **REQ-BIL-ITG-05** — *Neutral degradation when typing data is unusable.*
  - Statement: When the result's `result_type` has no matrix row, or guidance inputs are absent, the cascade SHALL render exactly as it does today — no groups, badges, tags, notes, or warnings.
  - **Acceptance criteria**:
    - AC-05.1 — `result_type` ∈ {`oicr`, `unknown`, unrecognized/missing} ⇒ all guidance UI suppressed; dropdown output is byte-identical to the current flat list.
    - AC-05.2 — A catalog where every indicator is `unclassified`/`wildcard` at the selected HLO ⇒ no cross-type warnings anywhere (nothing classifies as `other` without a matrix row match).
    - AC-05.3 — Guidance failures are impossible-by-construction states, not runtime errors: classification helpers are total functions (no throw on unexpected strings).

- **REQ-BIL-ITG-06** — *No behavioral regression.*
  - Statement: All existing cascade behavior SHALL be preserved: option counts, cascade resets, empty/loading/error states, disabled/read-only handling, save payload (`TocAlignmentWriteDto`), and saved-alignment read-back.
  - **Acceptance criteria**:
    - AC-06.1 — `TocAlignmentWriteDto` and PATCH behavior are unchanged (no new fields, no value changes).
    - AC-06.2 — Existing `sp-toc-alignment-block` and `pool-funding-alignment` unit tests pass unmodified except where they assert the literal option-list shape (updates limited to accommodating groups).
    - AC-06.3 — `disabled` / `version_locked` / read-only states render guidance passively (badges/tags may show; interactive HLO-switch links are disabled).

## 5. Non-Functional Requirements

- **REQ-BIL-ITG-NF-01** — Performance: all classification/grouping is computed from the already-loaded catalog via pure `computed()` signals; **zero additional HTTP requests**; grouping computation for the largest observed catalog (≤ ~90 indicators/SP) adds no perceptible delay (< 5 ms per recompute, verifiable by unit test on the fixture).
- **REQ-BIL-ITG-NF-02** — Accessibility (PRD C-4): warnings/notes use `role="status"`/`aria-live="polite"`; badges and tags carry text (not color-only meaning); actionable HLO links are keyboard-operable with visible focus; group headers are announced by screen readers via PrimeNG's group semantics.
- **REQ-BIL-ITG-NF-03** — Bundle: no new dependencies; net JS added ≤ 5 KB gzipped (constants + template additions).
- **REQ-BIL-ITG-NF-04** — Theming: badges, tags, and notes use existing color tokens/utility classes with dark/light parity, following the section's existing notice styles.
- **REQ-BIL-ITG-NF-05** — Copy: all user-facing strings are component constants in English (platform language), colocated like the block's existing copy constants.

## 6. Data Inputs & Outputs

- **Inputs**: `GET v1/results/{code}/pool-funding-alignment/hlos-indicators` via `ApiService.GET_PoolFundingHlosIndicators` (already consumed) — fields used *anew*: `result_type` (envelope), `TocCatalogIndicator.type_value`. No new endpoints, params, or fields.
- **Outputs**: unchanged — `PATCH …/pool-funding-alignment` with `toc_alignments: TocAlignmentWriteDto[]`.
- **Persisted state**: none added; guidance is derived state (`computed`) off the existing `tocCatalog` signal in `bilateral.service.ts` and the block's inputs.

## 7. Controlled Vocabularies

- `type_value` strings originate upstream in the ToC/CLARISA lambda (`type_name`/`type_value`), proxied by the ARI backend (PRD C-3 respected — no parallel taxonomy; the FE matrix *references* upstream values, it does not invent categories).
- `result_type` keys are backend-owned (`toc-level-rules.util.ts` in `alliance-research-indicators-main`): `capacity_sharing`, `innovation_dev`, `knowledge_product`, `policy_change`, `oicr`, `innovation_use`, `unknown`.

## 8. Role & Permission Matrix

No new actions. Guidance renders wherever the cascade renders today:

| Action | Researcher | Center Admin | MEL Regional Expert | Cross-Platform Consumer | Anonymous |
|--------|------------|--------------|---------------------|-------------------------|-----------|
| See guidance (badges/tags/notes/warnings) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Select cross-type indicator & save | ✅ (as today) | ✅ (as today) | ✅ (as today) | ❌ | ❌ |
| Read-only/locked view | passive guidance only | passive guidance only | passive guidance only | ❌ | ❌ |

## 9. Telemetry & Observability

- No new telemetry events in this spec (Phase-2 gate is measured server/report-side by joining saved `indicator_id` to catalog types — proposal OQ-A).
- Error surfacing unchanged (catalog loading/error states untouched).

## 10. Assumptions & Open Questions

- A-1: `type_value` reaches the client verbatim from the lambda (verified against test lambda 2026-07-02); `type_name` is not needed (identical values in sample).
- A-2: Only `capacity_sharing` and `innovation_dev` (OUTPUT) and `policy_change` (OUTCOME/EOI) currently reach the cascade (`allowed_levels` rule table); the matrix still defines all 5 typed rows so a backend `allowed_levels` change needs no FE guidance work.
- OQ-1: BA sign-off on the exact matrix strings (esp. "Number of Policy (Policy Change)" and `Innovation Use`) — proposal R-1. Until ruled otherwise, the matrix above is authoritative.
- OQ-2: Production-lambda typing completeness at OUTCOME/EOI (test lambda: ~1/3 untyped) — affects copy tuning only, not behavior (neutral degradation covers it).
- OQ-3: Cross-level suggestions ("compatible indicators exist at *Intermediate Outcome*") — deferred (proposal OQ-B); only meaningful for `policy_change` (2 allowed levels).

## 11. References

- [`./proposal.md`](./proposal.md) — approved intent, live data analysis, Phase-2 (AI) gate.
- [`../../archive/2026-06-17-bilateral-module--toc-mapping-v2/requirements.md`](../../archive/2026-06-17-bilateral-module--toc-mapping-v2/requirements.md) — parent cascade requirements (REQ-BIL-TM2-*), D-5/OQ-1/OQ-2/A-4.
- [`../../archive/2026-06-17-bilateral-module--toc-mapping-v2/backend-handoff.md`](../../archive/2026-06-17-bilateral-module--toc-mapping-v2/backend-handoff.md) §4 — frozen wire contract (`result_type`, `type_value`).
- [`../../../prd.md`](../../../prd.md) §3, §4, §8.3 (C-1, C-4, C-5, C-6).
- Backend rule source: `alliance-research-indicators-main` → `src/domain/entities/bilateral/utils/toc-level-rules.util.ts`.

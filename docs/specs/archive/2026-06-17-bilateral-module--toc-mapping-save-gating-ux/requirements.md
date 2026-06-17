# Requirements — Pool Funding Alignment: ToC-mapping save/sequencing UX

> Converts [`./proposal.md`](./proposal.md) (approved intent) into testable requirements. Follows [`../../general-setup/requirements.md`](../../general-setup/requirements.md). Follow-up to the shipped [`../toc-mapping-v2/`](../toc-mapping-v2/).

## 1. Document control

| Field | Value |
| --- | --- |
| Spec path | `docs/specs/bilateral-module/toc-mapping-save-gating-ux/` |
| Module | bilateral-module — Pool Funding Alignment tab |
| Depth | Standard (lite-leaning) — bounded bugfix + UX clarity |
| Requirement band | REQ-BIL-SGU-01 … 05, NFR-BIL-SGU-01 … 02 |
| Status | Draft — awaiting approval |
| Created | 2026-06-17 |
| Source | [`./proposal.md`](./proposal.md) (OQ-UX-1 resolved: confirmed re-entrant-signal bug, Option A) |

## 2. Executive summary

On the Pool Funding Alignment tab, answering **"Yes — this result aligns with the Program's ToC indicators"** for a selected Science Program currently does nothing visible until the user saves and reloads. The cause is a client bug: selecting SPs via the multiselect never populates the per-SP draft array (a re-entrant signal update clobbers it), so the "Yes" answer cannot be recorded and the cascade never reveals. This spec requires that **"Yes" reveals the cascade immediately, with no prior save**, that the **select → map → save flow is legible**, and that **no block ever appears inert**. No backend or wire-contract change.

## 3. Glossary

- **SP** — Science Program (e.g. SP02). Selected via the multiselect picker.
- **ToC cascade** — the per-SP Level → High-Level Output (HLO) → Indicator → quantitative-contribution flow.
- **Draft** — the component-local `SpAlignmentDraft` view-model holding one SP's in-progress answer.
- **Single save** — one `PATCH` carrying `has_contribution` + `sp_codes` + `toc_alignments[]` together.

## 4. System context & scope

**In scope:** the Pool Funding Alignment page component + the per-SP ToC block — specifically the draft population on SP selection, the reveal-on-"Yes" behavior, sequencing affordances, and block state feedback. Within the already-shipped `toc-mapping-v2` UI.

**Out of scope:** the frozen wire contract (catalog read / PATCH write / read-back — already verified), per-SP independence model, level rules, the 2026 version gate, cascade reset semantics, the SP picker chip rendering, and the separate catalog-503 robustness follow-up. No backend change.

## 5. Stakeholders / personas

- **STAR result contributor** (primary) — maps bilateral results to ToC indicators; needs a flow that responds and explains itself.
- **Center Admin / Sys Admin** — same flow under their roles.

## 6. Functional requirements

### REQ-BIL-SGU-01 — "Yes" immediately reveals the SP's cascade (no prior save)

The system SHALL reveal a Science Program's ToC cascade as soon as the contributor answers "Yes" on that SP's alignment question, without requiring any prior save.

#### Scenario: Answer Yes on a freshly-selected SP

- GIVEN an eligible result with `has_contribution = Yes` and a Science Program selected in the same session (not yet saved)
- AND the ToC catalog has loaded (`allowed_levels` is non-empty)
- WHEN the contributor clicks "Yes" on that SP's "Does this result align with the Program's ToC indicators?" question
- THEN that SP's Level select appears immediately
- AND no save or reload is required for it to appear

#### Scenario: Answer persists across change detection

- GIVEN the contributor answered "Yes" on a selected SP
- WHEN the page re-renders (e.g. another field changes)
- THEN the "Yes" answer and the revealed cascade remain (the answer is recorded in the SP's draft)

### REQ-BIL-SGU-02 — SP selection populates a per-SP draft

The system SHALL maintain exactly one in-progress draft per selected Science Program, in selection order, created when an SP is selected and removed when it is deselected — so that answering and validation operate on a stable per-SP record.

#### Scenario: Selecting SPs creates their drafts

- GIVEN `has_contribution = Yes`
- WHEN the contributor selects N Science Programs
- THEN N per-SP blocks render, each backed by its own draft
- AND answering or editing one SP's block records onto that SP's draft only (per-SP independence preserved)

#### Scenario: Recording an answer for an SP with no pre-existing draft

- GIVEN a selected SP whose draft is not yet present in the draft array
- WHEN the contributor answers "Yes"/"No" or edits any cascade field for that SP
- THEN the system SHALL create (upsert) that SP's draft and record the change — it SHALL NOT silently drop the change

### REQ-BIL-SGU-03 — Single-pass select → map → save

The system SHALL let the contributor select SPs, map ToC for each, and persist everything in one save, with no intermediate save required before mapping.

#### Scenario: One save persists SPs and alignments

- GIVEN `has_contribution = Yes`, SPs selected, and at least one SP mapped (Level + HLO + Indicator + contribution)
- WHEN the contributor clicks Save once
- THEN the request carries `sp_codes` and `toc_alignments[]` together
- AND on reload the saved SPs and their alignments pre-fill

### REQ-BIL-SGU-04 — No inert block; determinate state always

The system SHALL ensure each rendered per-SP block always presents a determinate state on "Yes": the cascade, a loading indicator, a per-(SP, level) empty state, or a catalog error with retry — never a blank, non-responsive area.

#### Scenario: Catalog unavailable for a Program

- GIVEN "Yes" is selected for an SP and the catalog could not be loaded / has no results for the chosen level
- WHEN the cascade would otherwise be empty
- THEN the block shows an explicit loading / empty / error+retry state (not a blank)

### REQ-BIL-SGU-05 — Sequence legibility & Save-disabled clarity

The system SHOULD make the select → map → save sequence legible and SHALL communicate why Save is disabled when it is.

#### Scenario: Disabled Save explains itself

- GIVEN a rendered SP block is answered "Yes" but its cascade is incomplete (missing Level/HLO/Indicator/contribution per the existing D-9 rule)
- WHEN Save is therefore disabled
- THEN the UI conveys that an in-progress alignment must be completed (or cleared) before saving — rather than leaving the contributor to guess

## 7. Non-functional requirements

### NFR-BIL-SGU-01 — No contract or backend change

The change SHALL be client-only; the catalog read, PATCH write (incl. same-request `sp_codes` + `toc_alignments`), and read-back contracts SHALL be unchanged.

### NFR-BIL-SGU-02 — Accessibility & tokens preserved

Changed screen SHALL keep WCAG 2.1 AA (labels, `aria-required`, `aria-live` on async/reveal, `role="alert"` on errors) and use design tokens only (no hex), per the shipped `toc-mapping-v2` baseline (C-4).

## 8. Requirement ID index

| ID | Title |
| --- | --- |
| REQ-BIL-SGU-01 | "Yes" immediately reveals the SP's cascade (no prior save) |
| REQ-BIL-SGU-02 | SP selection populates a per-SP draft (upsert on edit) |
| REQ-BIL-SGU-03 | Single-pass select → map → save |
| REQ-BIL-SGU-04 | No inert block; determinate state always |
| REQ-BIL-SGU-05 | Sequence legibility & Save-disabled clarity |
| NFR-BIL-SGU-01 | No contract or backend change |
| NFR-BIL-SGU-02 | Accessibility & tokens preserved |

## 9. Assumptions, dependencies, open questions

- **Assumption:** the backend continues to accept `sp_codes` + `toc_alignments` in one PATCH (verified 2026-06-10).
- **Dependency:** the shipped `toc-mapping-v2` UI (block component, page, service helpers).
- **OQ-UX-2 (open):** confirm single-save is the desired product flow (default: yes — REQ-BIL-SGU-03). If the team instead wants an explicit save-then-map gate, REQ-BIL-SGU-01/03 change materially — flag before design sign-off.
- **OQ-UX-3 (non-gating):** keep the D-9 "Yes requires complete cascade to save" rule as-is (default yes).

# Requirements — Bilateral Module / ToC Mapping v2

> Feature folder under [`../`](../). Replaces the modal-based US3/US4 mapping UX ([`../indicator-mapping/`](../../archive/2026-06-10-bilateral-module--indicator-mapping/), slated for archive) with the inline per-SP cascading flow (Level → High-Level Output → Indicator → Contribution) sourced from the **lambda-toc** integration. Follows [`../../general-setup/requirements.md`](../../general-setup/requirements.md).
>
> **Source-of-truth note:** the four 2026-06-09 mockups under [`../figma-mockups/_assets/`](../figma-mockups/_assets/) (`Pool funding alignment.png` … `Pool funding alignment3.png`) are authoritative for UX shape and field set, together with the updated "Science Program and TOC mapping rules" US text. The backend wire contract is frozen in [`./backend-handoff.md`](./backend-handoff.md) §4.

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/toc-mapping-v2/` |
| Proposal | [`./proposal.md`](./proposal.md) — approved 2026-06-09 |
| Backend handoff | [`./backend-handoff.md`](./backend-handoff.md) — relayed to `alliance-research-indicators-main` 2026-06-09; `ARI_TOC_INTEGRATION_HOST` set |
| Supersedes | [`../indicator-mapping/`](../../archive/2026-06-10-bilateral-module--indicator-mapping/) (REQ-BIL-IM-\*) · [`../hlo-grouped-mapping/`](../../archive/2026-06-10-bilateral-module--hlo-grouped-mapping/) (REQ-BIL-HGM-\*, never implemented) — both to be archived via `/sdd-archive` |
| Status | **DRAFT — Phase 1 (`/sdd-specify`), 2026-06-09** |
| Depth | Standard (write-side + endpoint switch; rollout/risk detail lives in `design.md`) |
| Domain abbreviation | `BIL-TM2` |
| Visual references | `../figma-mockups/_assets/Pool funding alignment.png` (Level dropdown open, single option) · `…1.png` (HLO dropdown open) · `…2.png` (Indicator dropdown open) · `…3.png` (filled form + Contribution panel) |
| Jira | [`../jira-us/AC-1594-us2-pool-funding-alignment.md`](../jira-us/AC-1594-us2-pool-funding-alignment.md) · AC-1439 / AC-1440 (US3/US4, updated comments 2026-06-09) |
| Constitutional anchors | [`docs/prd.md`](../../../prd.md) §3–§5, §8.3 (C-1…C-6) · [`docs/system-design/design.md`](../../../system-design/design.md) · [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) |

---

## 2. Executive summary

A PI reporting a **W3/Bilateral result** declares contribution to CGIAR Pool Funding by selecting **one or more Science Programs** (inherited from the result's primary reporting project) and, **per selected SP**, aligning the result to the SP's Theory of Change: a **Level** constrained by the STAR result type, a **High-Level Output / Outcome** at that level, one **Indicator** under it, and a **quantitative contribution** against the indicator's unit of measure and active-year target. The HLO/indicator catalog comes from the new lambda-toc service (proxied by the ARI backend); the previous Area-of-Work-based lookup and the HLO selection modal are retired. Each SP's alignment is stored and managed independently. Mapping is only available for results on **live version 2026**.

## 3. Glossary

- **SP** — Science Program (CLARISA level-1 entity, e.g. `SP01 – Biodiversity for Food and Agriculture`). Options come from the primary reporting project's mapping.
- **ToC Level** — one of three catalog categories: **High-Level Output** (`OUTPUT`), **Intermediate Outcome** (`OUTCOME`), **2030 Outcome** (`EOI`).
- **HLO (generalized)** — a ToC result at the selected level. At `OUTPUT` level these are literal High-Level Outputs (`HLO1.AOW1.IO1 …`); at `OUTCOME` level Intermediate Outcomes (`IOC1 …`); at `EOI` level 2030 Outcomes (`2030-OC1 …`). The mockups label the field "High Level Output" — see OQ-3 for the label at outcome levels.
- **Indicator** — a child of an HLO; carries `unit_of_measurement`, per-year target, and a `type_value` (e.g. "Number of people trained (capacity sharing for development)").
- **AOW** — Area of Work. **Display metadata only** in v2 (the bold prefix on HLO options, e.g. `AOW01 — HLO1.AOW1.IO1 Steer to impact`); no longer a selection or lookup dimension. `EOI` results have no AOW.
- **Alignment (per SP)** — the tuple `{level, hlo, indicator, quantitative_contribution}` plus the per-SP "aligns with ToC?" answer.
- **Version gate** — ToC mapping applies only to results whose live version is **2026** (hardcoded this cycle).

## 4. System context & scope

### In scope

- The **Science Program Contribution** flow inside the Pool Funding Alignment section of the result detail page (route `/result/:id/pool-funding-alignment`), per the four mockups.
- Multi-select SP field (kept from the shipped alignment section) now driving **one independent alignment block per selected SP**.
- Cascading Level → HLO → Indicator dropdowns fed by the reshaped `GET …/pool-funding-alignment/hlos-indicators` (frozen contract, [`./backend-handoff.md`](./backend-handoff.md) §4).
- Contribution panel (read-only unit + target, editable quantitative contribution) and persistence via the extended `PATCH …/pool-funding-alignment`.
- Version gate UI (2026-only), preserved read-only/synced/PRMS-sourced gates, error/empty/loading states.
- Removal of the HLO selection modal, the AI "VIEW HIGH LEVEL OUTPUTS" card, and all `(SP, AOW)` pair DTOs/states from the client.

### Out of scope

- Backend implementation (owned by the mirror spec in `alliance-research-indicators-main`; this spec consumes the frozen contract).
- Contributing-project SP inheritance (pending Nicolette), registry/ToC versioning beyond the 2026 hardcode (pending Enrico), PRMS push (US5), W3 sync (US6), SP-ToC catalog sync (US7).
- Changes to the AGRESSO tag, SP eligibility chain, or section eligibility rules.
- Indicator-type filtering **enforcement** (OQ-2): v2 ships pass-through; the filter is a follow-up toggle.

## 5. Stakeholders / personas

- **Researcher / PI** (PRD §3) — fills the alignment; primary actor in all scenarios.
- **Center Admin / MEL Regional Expert** — same surface, same permissions as the shipped alignment section (§9).
- **PRMS / Alliance reporting consumers** — downstream readers of stored alignments (out-of-scope sync, US5).

PRD linkage: goals §4.1 (traceable bilateral→pool-funding contribution), user stories US2–US4 (AC-1594/AC-1439/AC-1440), constraints C-1…C-6.

## 6. Functional requirements

- **REQ-BIL-TM2-01** — *Section flow and gating.*
  - The Pool Funding Alignment section SHALL render the Science Program Contribution flow exactly when the existing eligibility gates pass (bilateral-eligible result, section enabled), preserving the shipped behaviors: "Does this result contribute to a Science Program or Accelerator?" Yes/No, `mapping_status` empty states, `unknown_sp_codes` rejection, and read-only when `is_synced_to_prms` / `is_read_only` / PRMS-sourced.
  - **Acceptance criteria**:
    - AC-01.1 — With "No" selected, no SP picker or alignment blocks render (unchanged).
    - AC-01.2 — All gates listed above behave exactly as in the shipped alignment section (regression-covered).
  - **Notes**: carried forward from `../alignment-section/` (archived) — restated so v2 tests own them.

- **REQ-BIL-TM2-02** — *Multi-select principal Science Program.*
  - The user CAN select **one or more** Science Programs in "Select the principal Science Program this is related to"; options SHALL be exactly the SPs mapped to the result's **primary reporting project**.
  - **Acceptance criteria**:
    - AC-02.1 — Options match `GET …/science-programs` for the result; nothing else is selectable.
    - AC-02.2 — Selecting N SPs renders N independent alignment blocks (REQ-BIL-TM2-03), one per SP, in selection order.
    - AC-02.3 — Deselecting an SP removes its block; if that block held a saved or in-progress alignment, the user SHALL be warned before removal is applied (see OQ-5 for copy).
  - #### Scenario: project mapped to two SPs
    - GIVEN a result whose primary project maps SP01 and SP03
    - WHEN the user opens the SP dropdown
    - THEN exactly SP01 and SP03 are offered
    - AND selecting both renders two alignment blocks

- **REQ-BIL-TM2-03** — *Independent per-SP alignment block.*
  - For each selected SP the system SHALL render an independent block containing: "Does this result align with the Program's TOC indicators?" (Yes/No, required), and — when Yes — the Level/HLO/Indicator cascade (REQ-BIL-TM2-04…06) and the contribution panel (REQ-BIL-TM2-07). State in one block SHALL never read from or write to another block.
  - **Acceptance criteria**:
    - AC-03.1 — Editing SP01's level/HLO/indicator/contribution leaves SP03's values untouched (and vice versa), both in UI state and in the persisted record.
    - AC-03.2 — "No" on the per-SP question hides that SP's cascade and clears its draft values; the SP itself remains selected.
  - #### Scenario: rules-text example
    - GIVEN SP01 and SP03 are selected
    - WHEN the user configures SP01 → HLO A → Indicator X → contribution 10 and SP03 → HLO B → Indicator Y → contribution 25
    - THEN saving persists both tuples independently
    - AND re-opening the section shows each SP's own values

- **REQ-BIL-TM2-04** — *Level options derive from the STAR result type.*
  - The Level dropdown SHALL offer only the levels allowed for the result's type, as provided by the backend (`allowed_levels`): Capacity Sharing → High Level Output; Innovation Development → High Level Output; Policy Change → Intermediate Outcome + 2030 Outcome. The client SHALL NOT hardcode the rule.
  - **Acceptance criteria**:
    - AC-04.1 — Capacity Sharing result: Level dropdown contains exactly "High Level Output" (mockup `Pool funding alignment.png`).
    - AC-04.2 — Policy Change result: Level dropdown contains exactly "Intermediate Outcome" and "2030 Outcome".
    - AC-04.3 — `allowed_levels: []` (other result types, OQ-4): the per-SP ToC question and cascade do not render; the SP selection itself still saves.
    - AC-04.4 — Changing Level clears the dependent HLO and Indicator selections of that block only.
  - **Notes**: preselection when exactly one level is allowed is a design decision (D-pending); the mockup shows the user opening the single-option dropdown.

- **REQ-BIL-TM2-05** — *High-Level Output dropdown.*
  - After a Level is chosen, the HLO dropdown SHALL offer the ToC results for `(SP, level)` from the catalog, searchable by text, each option showing the AOW code (bold) above/with the result title (e.g. `AOW01` / `HLO1.AOW1.IO1 Steer to impact`); options without an AOW (`EOI`) show the title alone.
  - **Acceptance criteria**:
    - AC-05.1 — For SP01 + High Level Output, options correspond 1:1 to the catalog's `toc_results` for `(SP01, OUTPUT)` (22 on the verified snapshot), labeled per mockup `…1.png`.
    - AC-05.2 — Typing in the search box filters options client-side by AOW code + title (case-insensitive).
    - AC-05.3 — Changing the HLO clears the Indicator selection of that block only.
    - AC-05.4 — Empty catalog for the pair `(SP, level)` renders an inline empty state, not a broken dropdown (copy in design).

- **REQ-BIL-TM2-06** — *Indicator dropdown.*
  - After an HLO is chosen, the Indicator dropdown SHALL offer that HLO's indicators (searchable), displaying `indicator_description`. The indicator `type_value` SHALL be retained in state for the future type filter (OQ-2) but SHALL NOT filter options in v2.
  - **Acceptance criteria**:
    - AC-06.1 — Options correspond 1:1 to the selected HLO's `indicators[]` (mockup `…2.png`: 5 options for `HLO1.AOW1.IO1 Steer to impact`).
    - AC-06.2 — Selecting an indicator reveals the contribution panel (REQ-BIL-TM2-07).

- **REQ-BIL-TM2-07** — *Contribution to indicator target.*
  - The contribution panel SHALL show the explanatory callout (copy per mockup `…3.png`), read-only **Unit of measurement** and **Target** (the backend-resolved `target_value`/`target_year`), and an editable **Quantitative contribution** numeric input.
  - **Acceptance criteria**:
    - AC-07.1 — Unit and Target render from the selected indicator's catalog data; they are never editable.
    - AC-07.2 — Quantitative contribution accepts only numbers ≥ 0 (integer/decimal per unit; validation detail in design); empty is invalid when the per-SP question is "Yes" (required-field treatment, see OQ-6).
    - AC-07.3 — The callout's target-year wording uses the active reporting year (2026), not hardcoded "2025" (mockup copy is outdated — A-3).
  - #### Scenario: capacity-sharing example (mockup `…3.png`)
    - GIVEN SP01 → High Level Output → `AOW01 – HLO1.AOW1.IO1 Steer to impact` → "Number of events where Market Intelligence…"
    - WHEN the panel renders
    - THEN Unit of measurement shows `NUMBER` and Target shows the 2026 target value
    - AND the user can enter `3` as the quantitative contribution

- **REQ-BIL-TM2-08** — *Persistence and pre-fill.*
  - Saving the section SHALL persist `has_contribution`, the selected `sp_codes`, and each SP's alignment tuple via the extended PATCH (frozen contract). Re-entering the section SHALL pre-fill everything from the GET response.
  - **Acceptance criteria**:
    - AC-08.1 — Save → reload → all per-SP values (Yes/No, level, HLO, indicator, contribution) round-trip intact.
    - AC-08.2 — 400 with per-alignment validation errors surfaces inline on the offending block (sp_code-scoped), not as a global toast only.
    - AC-08.3 — 409 responses keep today's behavior for sync/PRMS locks; `toc_mapping_version_locked` renders the version-gate state (REQ-BIL-TM2-09).
    - AC-08.4 — A saved alignment whose catalog item no longer exists upstream still displays from its persisted snapshot fields, flagged as stale (display-only; copy in design).

- **REQ-BIL-TM2-09** — *Live-version gate (2026 only).*
  - ToC alignment SHALL be editable only when the result's live version is **2026**. For other live versions the section renders read-only with an explanatory notice; the client SHALL also honor the backend's `version_locked` flag and `toc_mapping_version_locked` 409.
  - **Acceptance criteria**:
    - AC-09.1 — `version_locked: true` → cascade and contribution inputs disabled + notice shown; Save does not submit `toc_alignments`.
    - AC-09.2 — Viewing a non-live (2024/2025) version of the result keeps the section read-only (existing versioned-view behavior).

- **REQ-BIL-TM2-10** — *Retire the modal flow.*
  - The system SHALL no longer present the HLO selection modal or the "VIEW HIGH LEVEL OUTPUTS" AI card, and the client SHALL contain no code path consuming the old `(SP, AOW)` pair envelope (`pairs[]`, `aow_status`, `no_aow_mappings`).
  - **Acceptance criteria**:
    - AC-10.1 — `HloSelectionModalComponent` and its modal registration/session-state are deleted (or the spec records an explicit quarantine decision); suite green.
    - AC-10.2 — Grep gates: no references to `aow_status`, `no_aow_mappings`, `BilateralHlosPair`, or `areaOfWork` query usage remain in `research-indicators/src/`.

- **REQ-BIL-TM2-11** — *Catalog load resilience.*
  - The user CAN distinguish "catalog loading", "catalog empty", and "catalog unavailable" states per SP block.
  - **Acceptance criteria**:
    - AC-11.1 — While the catalog request is in flight, dropdowns show a loading state (not empty options).
    - AC-11.2 — Catalog 5xx → inline retry affordance on the block; the rest of the form stays usable and savable (alignment fields excluded from the payload until loaded — detail in design).

## 7. Non-functional requirements

- **REQ-BIL-TM2-NF-01** — Accessibility: changed surfaces meet **WCAG 2.1 AA** (C-4): labeled selects, keyboard-operable cascade, focus management on block add/remove, `aria-live` for async states.
- **REQ-BIL-TM2-NF-02** — Bundle: net JS added to the initial chunk ≈ ≤ 0 (feature stays in the lazy result-page chunk; deleting the modal should offset additions). `angular.json` budgets respected (C-5).
- **REQ-BIL-TM2-NF-03** — Performance: with the catalog response cached by the backend, opening a per-SP block renders options without an extra round-trip per dropdown (single catalog read per section load; p95 section-ready ≤ 1.5 s on testing env).
- **REQ-BIL-TM2-NF-04** — Theming: light/dark parity via existing tokens (`abc-*`, `atc-*`, `rs-*`, `fs-*`); no hardcoded hex.
- **REQ-BIL-TM2-NF-05** — Testing: co-located Jest specs; project coverage floors in `jest.config.ts` not reduced.

## 8. Data inputs & outputs

- **Inputs**:
  - `GET v1/results/{code}/pool-funding-alignment` — unchanged envelope + per-SP alignments for pre-fill.
  - `GET v1/results/{code}/pool-funding-alignment/science-programs` — unchanged (SP options).
  - `GET v1/results/{code}/pool-funding-alignment/hlos-indicators` — **reshaped** per [`./backend-handoff.md`](./backend-handoff.md) §4 (`result_type`, `allowed_levels`, `version_locked`, `catalogs[]`).
- **Outputs**: `PATCH v1/results/{code}/pool-funding-alignment` extended with `toc_alignments[]` (handoff §4 write envelope).
- **Persisted client state**: per-SP draft alignments in `BilateralService` signals; no new global cache entries. DTOs in `shared/interfaces/bilateral/` replace the `BilateralHlosPair` family.
- **Fixtures**: Jest fixtures mirror the frozen contract verbatim (SP01 snapshot from the live probe) so FE work proceeds before the proxy lands in testing.

## 9. Controlled vocabularies

Science Programs originate from CLARISA via the primary project mapping (C-3, unchanged). ToC results/indicators originate from the lambda-toc service (CLARISA-operated ToC integration) — no parallel taxonomy is created; the client stores ids + display snapshots only.

## 10. Role & permission matrix

Unchanged from the shipped alignment section: editing requires result-edit permission (owner/contributor with edit rights); Center Admin / MEL follow existing server-enforced rules; read-only users see the filled state. No new roles. (Mirrors server enforcement; no client-only rules.)

## 11. Telemetry & observability

- Surface errors per house pattern: inline block errors for per-SP 400s, toast for transport failures, retry affordance for catalog 5xx (REQ-BIL-TM2-11).
- No new analytics events required this cycle (none exist for the old modal either); BugHerd/Clarity coverage continues passively.

## 12. Assumptions & open questions

- **A-1** — Exactly **one** (level, HLO, indicator) tuple per SP (rules text + mockups). The state model keeps N-per-SP reachable if BA flips it (= proposal OQ-V2-3).
- **A-2** — `OUTPUT`/`OUTCOME`/`EOI` are the canonical level keys (verified empirically; = OQ-V2-1).
- **A-3** — Target year = live-version year (2026); the mockup's "2025 target" copy is outdated (= OQ-V2-6).
- **A-4** — Indicators are **unfiltered** by type in v2; `type_value` is passed through for a later filter toggle (= OQ-V2-2, BA pending).
- **OQ-1** *(gating for final behavior, not for build)* — BA ruling on the indicator-type filter (strict / include `custom` / none).
- **OQ-2** — Cardinality confirmation (A-1) from BA.
- **OQ-3** — Field label at outcome levels: mockups only show "High Level Output\*"; for Policy results should the label read "Intermediate Outcome" / "2030 Outcome" (or a neutral "ToC Result")? Default: relabel dynamically by selected level.
- **OQ-4** — Result types beyond CapSharing/InnovDev/Policy: assumed hidden via `allowed_levels: []` (= OQ-V2-5).
- **OQ-5** — Copy/UX for deselecting an SP that holds a saved alignment (silent cascade vs confirm dialog). Default: confirm dialog, consistent with existing destructive-action patterns.
- **OQ-6** — Is quantitative contribution **required** when the per-SP ToC question is "Yes", or may a user save level/HLO/indicator without a value? Default: required (mockup marks the cascade fields with \*; the contribution input is unmarked — needs BA confirm).

## 13. References

- [`./proposal.md`](./proposal.md) · [`./backend-handoff.md`](./backend-handoff.md)
- Mockups: `../figma-mockups/_assets/Pool funding alignment.png` · `…1.png` · `…2.png` · `…3.png`
- [`../indicator-mapping/requirements.md`](../../archive/2026-06-10-bilateral-module--indicator-mapping/requirements.md) (superseded) · [`../hlo-grouped-mapping/requirements.md`](../../archive/2026-06-10-bilateral-module--hlo-grouped-mapping/requirements.md) (superseded)
- [`docs/prd.md`](../../../prd.md) §3–§5, §8.3 · [`docs/system-design/design.md`](../../../system-design/design.md) §7 · [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §2, §6

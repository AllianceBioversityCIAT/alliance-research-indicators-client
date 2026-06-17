# US4 — Map Results to Indicators Including Rules / Contributions (Jira AC-1440)

> **DRAFT — PO synthesis.** This story has only a title in Jira ([AC-1440](https://cgiarmel.atlassian.net/browse/AC-1440)). The Story / AC / Notes below are derived from the title plus the AC-1385 epic context ([PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)), [US2](./AC-1594-us2-pool-funding-alignment.md), [US3](./AC-1439-us3-display-toc-indicators.md), and the PRMS-side context in [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md). **Pending BA confirmation** before the SDD spec consumes them.

> **Status**: Open
> **Issue type**: User Story
> **Epic**: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385)
> **Discovery idea**: [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
> **Source maturity**: **DRAFT** (PO synthesis; pending BA confirmation)
> **Figma**: TBD

---

## 1. Story

**As a** Researcher working in the Pool Funding Alignment section,
**I can** map my result to **one or more ToC indicators** (displayed by [US3 / AC-1439](./AC-1439-us3-display-toc-indicators.md)) and declare the nature of the contribution, subject to validation rules,
**so that** the result is explicitly recognized as a contribution to those SP/Accelerator indicators for downstream PRMS push ([US5](./AC-1441-us5-push-results-prms.md)) and aggregate reporting.

---

## 2. Background / Context

PARI-194 is explicit about the desired outcome: *"the PI to map the result to a specific Theory of Change and corresponding indicator."* This story is the mapping itself — the act of selecting indicators (from those displayed by US3) and declaring contribution. The Jira title says **"including rules"**, implying validation logic that constrains which mappings are valid; the rules themselves are open (see OQ-G).

The PRMS-side equivalent of this mapping is the ToC tree edit inside the bilateral review drawer (see [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §6.5). STAR's version is simpler because the user is the PI declaring contribution, not a downstream reviewer adjusting metadata.

---

## 3. Acceptance criteria (DRAFT)

- **AC-1 (DRAFT)**: From the indicator list rendered by US3, the user can **select one or more indicators** to which the result contributes.
- **AC-2 (DRAFT)**: An indicator can be selected only if it belongs to a Science Program currently selected in US2 (the alignment section). Removing an SP in US2 removes any indicator mappings tied to it. *(Cascade rule pending BA.)*
- **AC-3 (DRAFT)**: For each selected indicator, the user can record contribution metadata as required by the BA's rule set — at minimum a yes/no contribution flag; potentially a numeric contribution value, narrative, or target year. *(Field set pending BA — placeholder per OQ-G.)*
- **AC-4 (DRAFT)**: The system validates the mapping against the BA's rules and blocks save when a rule is violated. Each violated rule produces a clear, field-level error message. *(Specific rules pending BA — see OQ-G.)*
- **AC-5 (DRAFT)**: Selected indicator mappings are stored **persistently** in the STAR database, attached to the result.
- **AC-6 (DRAFT)**: Mappings respect the same edit-permission set as US2 (Creator, PI, contact, admins).
- **AC-7 (DRAFT)**: A result can be saved with **zero** indicator mappings; it can also be submitted without indicator mappings (consistent with US2's "not part of the submission validator" rule). *(Confirm with BA — the value of the section is reduced if mapping is optional, but the parent story explicitly says the alignment fields are not submission-blocking.)*

---

## 4. Other information / Notes

- The Jira title says "including rules (Contributions)" — the parenthetical suggests this is where the **contribution rule set** is enforced. The rules themselves are not yet documented. Candidate rule families to confirm with the BA:
  - Cardinality: minimum/maximum number of indicators per SP, per result.
  - Mutual exclusivity: e.g., a result cannot contribute to two indicators in the same SP that represent conflicting outcomes.
  - Scope: only indicators within the SPs selected in US2.
  - Time window: only indicators active in the result's reporting phase / year.
- Mapping changes after the result is pushed to PRMS (US5) must respect US2's "read-only after synchronization" rule.

---

## 5. STAR fit notes

### Persona mapping
- **Researcher** (PRD §3.1).

### PRD constraints touched
- **C-3 (CLARISA)**: indicator entities sourced via US7 / upstream catalog. Treat as canonical.
- **C-4 (WCAG 2.1 AA)**: indicator selection controls (checkboxes / multi-select) keyboard reachable; validation errors must be associated with their fields via `aria-describedby`.

### Components & services to reuse
- **Selection controls**: PrimeNG `p-multiselect` wrapped via STAR's `custom-fields.scss`, or checkboxes inside the indicator-list rendered by US3.
- **Validation**: Angular Reactive Forms; per-rule custom validators. STAR's existing form patterns from [`shared-result-form`](../../../../research-indicators/src/app/shared/components/shared-result-form) apply.
- **Error surfacing**: rules violation displays use [`actions.service.ts`](../../../../research-indicators/src/app/shared/services/actions.service.ts) and the [`global-toast`](../../../../research-indicators/src/app/shared/components/global-toast) / [`global-alert`](../../../../research-indicators/src/app/shared/components/global-alert) / [`alert-tag`](../../../../research-indicators/src/app/shared/components/alert-tag) suite. Inline errors hook into the form.

### Backend / API implication
- Endpoint: `PATCH /api/results/:id/pool-funding-alignment` (shared with US2) is extended to carry indicator mappings — or a dedicated `PATCH /api/results/:id/pool-funding-alignment/indicators`. Pick one for contract simplicity.
- Server enforces the rule set authoritatively (per [`detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §8.2). Client mirrors for UX.
- New entity / table: `result_pool_funding_indicator` joining `result` to indicator IDs with contribution metadata.

### Open questions
- **OQ-G** ([README.md §6](./README.md)): What are the **contribution rules**? Cardinality? Mutual exclusivity? Time window? Pending BA — this is the core unknown of the story.
- **OQ-1440-A**: When the W3 Registry contributions are reverse-synced (US6), do indicator mappings travel with them or only the SP-level declaration?
- **OQ-1440-B**: Are there cross-result rules (e.g., the same indicator cannot be claimed by more than N results in the same project)?
- **OQ-1440-C**: Does mapping require a numeric contribution amount (e.g., "people trained: 50") or only a presence flag?

---

## Pending BA confirmation

The BA must validate or revise the following before the SDD spec consumes this story:

1. The full **rule set** (OQ-G) — the headline unknown.
2. Selection cardinality (one indicator vs many).
3. Per-mapping fields (presence flag only vs numeric / narrative / target year).
4. Whether mappings are optional at submit time (DRAFT AC-7).
5. Cascade behavior when an SP is removed in US2 (DRAFT AC-2).
6. Endpoint shape: shared with US2 vs dedicated.

---

## 6. References

- Jira: [AC-1440](https://cgiarmel.atlassian.net/browse/AC-1440)
- Epic: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385) / [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
- Depends on: [US2 / AC-1594](./AC-1594-us2-pool-funding-alignment.md), [US3 / AC-1439](./AC-1439-us3-display-toc-indicators.md), [US7 / AC-1595](./AC-1595-us7-sync-sp-toc.md)
- Feeds: [US5 / AC-1441](./AC-1441-us5-push-results-prms.md), [US6 / AC-1593](./AC-1593-us6-sync-bilateral-w3-registry.md)
- Sibling: [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §6.5 (ToC editing — PRMS counterpart), §9 (validation rules — pattern parallel).
- STAR PRD: [`../../../prd.md`](../../../prd.md) §3, §8.3.
- STAR detailed design: [`../../../detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §3 (data model), §4 (API), §9 (error handling).
- SDD methodology: [`../../general-setup/requirements.md`](../../general-setup/requirements.md).

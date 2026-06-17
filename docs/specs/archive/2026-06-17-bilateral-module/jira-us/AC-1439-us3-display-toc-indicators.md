# US3 — Display ToC Indicators as per selected Science Program (Jira AC-1439)

> **DRAFT — PO synthesis.** This story has only a title in Jira ([AC-1439](https://cgiarmel.atlassian.net/browse/AC-1439)). The Story / AC / Notes below are derived from the title plus the AC-1385 epic context ([PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)), [US2](./AC-1594-us2-pool-funding-alignment.md), and the PRMS-side context in [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md). **Pending BA confirmation** before the SDD spec consumes them.

> **Status**: Open
> **Issue type**: User Story
> **Epic**: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385)
> **Discovery idea**: [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
> **Source maturity**: **DRAFT** (PO synthesis; pending BA confirmation)
> **Figma**: TBD — likely in the same Figma file as [US2](https://www.figma.com/design/5a9xZJdb2rZAQm2wdk1CNT/STAR?node-id=32471-129337&t=75DyZixpTfjtK6tu-0)

---

## 1. Story

**As a** Researcher working in the Pool Funding Alignment section of a result (delivered by [US2](./AC-1594-us2-pool-funding-alignment.md)),
**I can** see the Theory of Change (ToC) **indicators** that belong to the Science Program(s) or Accelerator(s) I selected,
**so that** I can subsequently map my result to a specific indicator in [US4 / AC-1440](./AC-1440-us4-map-results-indicators.md) without having to leave STAR or look up the SP's ToC manually.

---

## 2. Background / Context

The Pool Funding Alignment section (US2) lets a PI confirm contribution to a Science Program and select one or more SPs. To make the next step (indicator mapping) possible, STAR must display the ToC indicators belonging to the selected SP(s). The ToC structure itself is owned upstream — by PRMS / CLARISA / a dedicated ToC service (see [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §13). [US7 / AC-1595](./AC-1595-us7-sync-sp-toc.md) handles the sync that brings the catalog into STAR; this story consumes that catalog at runtime.

---

## 3. Acceptance criteria (DRAFT)

- **AC-1 (DRAFT)**: When the user selects one Science Program in the Pool Funding Alignment section, the section displays the ToC indicators associated with that SP.
- **AC-2 (DRAFT)**: When the user selects multiple SPs, the section displays the **union** of their ToC indicators, grouped by SP. *(Behavior pending BA — could also be intersection, or a tab-per-SP layout.)*
- **AC-3 (DRAFT)**: When no SP is selected (Pool Funding contribution = No, or no SPs picked yet), no ToC indicator list is displayed.
- **AC-4 (DRAFT)**: Each displayed indicator shows at minimum: indicator name, owning SP, indicator code or ID, indicator description (when available), and indicator type if applicable. *(Field set pending BA / Figma.)*
- **AC-5 (DRAFT)**: The displayed indicators must come from STAR's local cache of the SP ToC catalog (synced via US7). If the cache is stale beyond a configured freshness window, the UI surfaces an info banner. *(Freshness rule pending BA.)*
- **AC-6 (DRAFT)**: If a previously selected SP has been removed in the upstream catalog (US7 sync), the indicator list shows an explicit "no longer available" state for that SP. *(Lifecycle pending BA.)*

---

## 4. Other information / Notes

- This story is **display-only**; it does not record any contribution. The recording happens in US4.
- Visual layout is implied by the Figma mockups already produced under US0; confirm whether the indicators are rendered as a tree, a flat list, or a tabular layout. PRMS uses a tree view (`app-cp-multiple-wps` per [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §6.5); STAR may simplify.
- This story depends on **US7** delivering the SP ToC catalog data and on **US2** delivering the section that hosts the display.

---

## 5. STAR fit notes

### Persona mapping
- **Researcher** (PRD §3.1) — the PI working inside the section.

### PRD constraints touched
- **C-3 (CLARISA)**: ToC indicators are likely CLARISA-managed or at least canonically owned upstream. Do not re-implement a local taxonomy. Reuse STAR's existing [`control-list-cache.service.ts`](../../../../research-indicators/src/app/shared/services/control-list-cache.service.ts) pattern for caching.
- **C-4 (WCAG 2.1 AA)**: indicator rendering must support keyboard navigation; if rendered as a tree, expand/collapse must be keyboard-reachable; selection state (US4) must be announced.

### Components & services to reuse
- **List / tree display**: STAR does not currently ship a generic tree component. Two options: (a) reuse PrimeNG `p-tree` wrapped per STAR's [`custom-prime-force-styles.scss`](../../../../research-indicators/README.md) conventions; (b) port the PRMS `app-cp-multiple-wps` pattern (see [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §6.5 OQ-2). The same decision logged there applies — defer the choice to the SDD design.
- **Caching**: parallel to [`dropdowns-cache.service.ts`](../../../../research-indicators/src/app/shared/services/cache/dropdowns-cache.service.ts) — add `sp-toc-cache.service.ts` (or similar) when US7 lands.
- **Loading state**: PrimeNG skeleton matched to STAR's `--ac-*` tokens.

### Backend / API implication
- Endpoint shape (proposed): `GET /api/sp-toc?scienceProgramIds=<csv>` returning a `MainResponse<TocCatalog[]>`. Owner: the same backend system that does US7 sync.
- Frontend reads via [`api.service.ts`](../../../../research-indicators/src/app/shared/services/api.service.ts), wraps in a domain service.

### Open questions
- **OQ-F** ([README.md §6](./README.md)): Which system is the **authoritative source** of the SP ToC catalog (PRMS, CLARISA, a ToC service, or other)?
- **OQ-1439-A**: When multiple SPs are selected (US2 AC-4 allows multi-select), should the indicator display be a **union**, **intersection**, **tab per SP**, or **grouped by SP**?
- **OQ-1439-B**: Is there a maximum number of indicators per SP that STAR must paginate or virtualize for, or is the list always short enough to render in full?
- **OQ-1439-C**: Does the indicator display need to show ToC **levels** (output / outcome / impact) the way PRMS does ([`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §6.5), or only the indicator leaves?

---

## Pending BA confirmation

The BA must validate or revise the following assumptions in this DRAFT before the SDD spec consumes them:

1. The Story actor (Researcher / PI / Creator) and outcome statement.
2. Multi-SP behavior (AC-2): union / intersection / tab-per-SP / grouped.
3. Field set per indicator (AC-4).
4. Cache freshness rule (AC-5) and the lifecycle for removed SPs (AC-6).
5. Display style: tree vs flat vs table.
6. The source-of-truth system (OQ-F).
7. Whether ToC levels are surfaced or only the indicator leaves (OQ-1439-C).

---

## 6. References

- Jira: [AC-1439](https://cgiarmel.atlassian.net/browse/AC-1439)
- Epic: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385) / [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
- Depends on: [US2 / AC-1594](./AC-1594-us2-pool-funding-alignment.md), [US7 / AC-1595](./AC-1595-us7-sync-sp-toc.md)
- Feeds: [US4 / AC-1440](./AC-1440-us4-map-results-indicators.md), [US5 / AC-1441](./AC-1441-us5-push-results-prms.md)
- Sibling: [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §6.5 (ToC editing — PRMS counterpart), §13 (federation).
- STAR PRD: [`../../../prd.md`](../../../prd.md) §3, §8.3.
- SDD methodology: [`../../general-setup/requirements.md`](../../general-setup/requirements.md).

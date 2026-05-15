# US7 — Sync the Science Program ToC Catalog (Jira AC-1595)

> **DRAFT — PO synthesis.** This story has only a title in Jira ([AC-1595](https://cgiarmel.atlassian.net/browse/AC-1595)). The Story / AC / Notes below are derived from the title plus the AC-1385 epic context ([PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)) and the role of the SP ToC catalog in [US3 / AC-1439](./AC-1439-us3-display-toc-indicators.md). **Pending BA confirmation** before the SDD spec consumes them.

> **Status**: Open
> **Issue type**: User Story
> **Epic**: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385)
> **Discovery idea**: [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
> **Source maturity**: **DRAFT** (PO synthesis; pending BA confirmation)
> **Original Jira title (Spanish)**: *Sincronizar el TOC de los SPs*
> **Figma**: TBD (likely no UI surface — system behavior with an optional admin status view)

---

## 1. Story

**As a** STAR system (and an Admin overseeing data freshness),
**I can** keep STAR's local cache of every **Science Program / Accelerator ToC catalog** in sync with its authoritative upstream source,
**so that** [US3 / AC-1439](./AC-1439-us3-display-toc-indicators.md) has the right indicators to display when a Researcher selects an SP in the Pool Funding Alignment section, and [US4 / AC-1440](./AC-1440-us4-map-results-indicators.md) maps results against current — not stale — indicator definitions.

---

## 2. Background / Context

The Pool Funding Alignment flow requires STAR to know each SP's ToC structure: ToC results, indicators, and (potentially) levels and targets. The authoritative owner of that catalog is not STAR — it is PRMS / CLARISA / a dedicated ToC service (the exact source is still open — see [README.md §6 OQ-F](./README.md)). This story brings the catalog into STAR on a defined cadence so the UI does not depend on a live cross-system call every time a user opens the Pool Funding Alignment section.

The PRMS-side analogue is documented in [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §6.5 (PRMS embeds `app-cp-multiple-wps` which reads ToC levels 1/2/3 per initiative) and §13 (federation table — ToC service is one of the external dependencies).

The original Spanish title is preserved for traceability. The doc body uses English consistent with the SDD constitution.

---

## 3. Acceptance criteria (DRAFT)

- **AC-1 (DRAFT)**: STAR has a local cache of the SP ToC catalog that can be queried by [US3](./AC-1439-us3-display-toc-indicators.md) and [US4](./AC-1440-us4-map-results-indicators.md) without a live upstream call per user interaction.
- **AC-2 (DRAFT)**: The cache is refreshed automatically on a defined cadence (schedule, webhook, or both). On-demand admin refresh is also supported.
- **AC-3 (DRAFT)**: A refresh updates indicator records: new indicators appear, removed indicators are marked inactive, modified indicators reflect the new values (name, description, etc.). Records referenced by existing US4 mappings are **not silently deleted** — they are marked inactive and the affected results are flagged for review.
- **AC-4 (DRAFT)**: The refresh status is observable to admins (last-refreshed timestamp, success / failure, per-SP counts).
- **AC-5 (DRAFT)**: Refresh failures do not break US2/US3/US4 — the UI continues to serve the last good cache, with an admin-visible alert about staleness.
- **AC-6 (DRAFT)**: SP and indicator identifiers in the cache use the **CLARISA-canonical IDs** so they line up with what the W3 Registry and PRMS use (consistent with [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §12.2 contract stability rule).

---

## 4. Other information / Notes

- **Direction of flow**: this is upstream → STAR, the same direction as US1 (project list from System Office). The two upstream syncs together set up STAR's read-side context for the alignment work.
- **No primary frontend surface**: this story is mostly backend / scheduled job. The frontend slice is at most an admin-facing "last synced at" badge or a maintenance page.
- **The exact source** is the headline open question. If PRMS owns the ToC catalog, STAR could read PRMS endpoints (similar to those referenced in [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §6.5 — `tocResultId` lookups, levels 1/2/3 per initiative). If CLARISA or a dedicated ToC service owns it, the read paths differ.

---

## 5. STAR fit notes

### Persona mapping
- **Primary actor**: STAR system. No Researcher-facing surface.
- **Secondary**: Admin (role_id 1) — sees status and can trigger manual refresh.

### PRD constraints touched
- **C-2 (AWS Cognito + JWT)**: STAR client never calls the upstream catalog directly; STAR backend mediates with integration credentials.
- **C-3 (CLARISA)**: catalog uses CLARISA-canonical IDs. Do not invent STAR-local indicator IDs.
- **C-4 (WCAG 2.1 AA)**: any admin-facing status surface must meet the same accessibility floor as the rest of STAR.

### Components & services to reuse
- **Caching infrastructure**: STAR already caches CLARISA control lists via [`control-list-cache.service.ts`](../../../../research-indicators/src/app/shared/services/control-list-cache.service.ts) and dropdown options via [`dropdowns-cache.service.ts`](../../../../research-indicators/src/app/shared/services/cache/dropdowns-cache.service.ts). Add a parallel `sp-toc-cache.service.ts` (frontend reader) backed by a new backend table.
- **Admin status display** (if scoped): [`metadata-panel`](../../../../research-indicators/src/app/shared/components/metadata-panel), [`alert-tag`](../../../../research-indicators/src/app/shared/components/alert-tag).
- **Manual refresh trigger** (if scoped): an admin endpoint + UI button reusing STAR's standard button patterns from [`shared-result-form`](../../../../research-indicators/src/app/shared/components/shared-result-form) styling.

### Backend / API implication
- New scheduled job: `sync-sp-toc-catalog` running on a configured cadence.
- New entity / tables: `sp_toc_catalog`, `sp_toc_indicator` (plus relations to STAR's existing initiative / indicator model where applicable).
- Read endpoints for the frontend: `GET /api/sp-toc?scienceProgramIds=<csv>` (consumed by US3).
- Admin endpoints: `POST /api/admin/sp-toc/refresh`, `GET /api/admin/sp-toc/status`.

### Open questions
- **OQ-F** ([README.md §6](./README.md)): What is the **authoritative source** of the SP ToC catalog? PRMS? CLARISA? A dedicated ToC service? Others?
- **OQ-1595-A**: Cadence — daily? hourly? on demand only? push from upstream?
- **OQ-1595-B**: When an indicator already mapped to a STAR result (via US4) is removed upstream, what is the policy? Mark the mapping orphaned and notify the Researcher? Migrate to a successor indicator? Hard-fail the result?
- **OQ-1595-C**: Does the cache include the full ToC tree (levels 1/2/3) like PRMS, or only the indicator leaves that US3 displays?
- **OQ-1595-D**: Are translations / multilingual indicator labels in scope? STAR currently has no i18n flow ([`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §14.3); if upstream provides multilingual labels, STAR caches English.

---

## Pending BA confirmation

The BA must validate or revise the following before the SDD spec consumes this story:

1. The **authoritative source** of the SP ToC catalog (OQ-F) — the headline unknown.
2. Sync cadence (OQ-1595-A).
3. Lifecycle policy for indicators that disappear upstream (OQ-1595-B) — affects DRAFT AC-3.
4. Cache shape: full ToC tree vs indicator leaves only (OQ-1595-C).
5. Whether an admin status surface is in scope or this remains purely behind-the-scenes.

---

## 6. References

- Jira: [AC-1595](https://cgiarmel.atlassian.net/browse/AC-1595)
- Epic: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385) / [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
- Feeds: [US3 / AC-1439](./AC-1439-us3-display-toc-indicators.md), [US4 / AC-1440](./AC-1440-us4-map-results-indicators.md)
- Sibling: [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §6.5 (PRMS ToC tree), §13 (federation table).
- STAR PRD: [`../../../prd.md`](../../../prd.md) §8.3 (C-2, C-3).
- STAR detailed design: [`../../../detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §7 (integration points), §6 (state / caching), §11 (constraints).
- SDD methodology: [`../../general-setup/requirements.md`](../../general-setup/requirements.md).

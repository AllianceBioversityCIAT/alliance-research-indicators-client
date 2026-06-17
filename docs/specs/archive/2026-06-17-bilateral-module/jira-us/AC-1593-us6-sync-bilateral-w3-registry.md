# US6 — Sync Bilateral Contributions with the W3 Registry (Jira AC-1593)

> **DRAFT — PO synthesis.** This story has only a title in Jira ([AC-1593](https://cgiarmel.atlassian.net/browse/AC-1593)). The Story / AC / Notes below are derived from the title plus the AC-1385 epic context ([PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)) and the role of the W3/Bilateral Registry as the System Office's source of truth. **Pending BA confirmation** before the SDD spec consumes them.

> **Status**: Open
> **Issue type**: User Story
> **Epic**: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385)
> **Discovery idea**: [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
> **Source maturity**: **DRAFT** (PO synthesis; pending BA confirmation)
> **Original Jira title (Spanish)**: *Sincronizar las contribuciones de bilaterales con W3 registy*
> **Figma**: TBD

---

## 1. Story

**As a** System Office / W3 Registry administrator (and the STAR system on its behalf),
**I can** see the Pool Funding **contributions** declared in STAR (from US2 SP/Accelerator selections, and US4 indicator mappings) reflected back into the **W3/Bilateral Registry** in a structured, periodic, audited way,
**so that** the registry's central view of who-contributes-to-what stays consistent with what STAR Researchers actually declared on individual results, closing the loop opened by US1 (where STAR consumed the registry's project list).

---

## 2. Background / Context

PARI-194 frames the relationship between STAR and the W3/Bilateral Registry as: *"centers report project-level contributions to Science Programs and Accelerators in the W3/Bilateral Registry, [but] there is a gap in linking individual results to these frameworks."* US1 closes part of that gap by **pulling** the project list from the registry into STAR. US6 closes the other half by **pushing** the result-level declarations back so the registry's project-level summary stays evidence-backed.

In other words: US1 is registry → STAR; US6 is STAR → registry. Together they keep the two systems in sync on the bilateral contribution narrative. This is a separate flow from US5 (STAR → PRMS); these two downstream syncs likely fire on different cadences and against different APIs.

The original Spanish title is preserved here for traceability. The doc body uses English consistent with the SDD constitution.

---

## 3. Acceptance criteria (DRAFT)

- **AC-1 (DRAFT)**: When a STAR result declares Pool Funding contribution (US2 = Yes) and selects one or more SPs, that contribution is exposed to the W3/Bilateral Registry in a structured form.
- **AC-2 (DRAFT)**: The exposed contribution payload includes at minimum: project ID, result ID, result title, SP(s) selected, contributing center, declared-by user, declared-at timestamp. *(Field set pending BA.)*
- **AC-3 (DRAFT)**: The sync runs on a defined cadence (push, pull, schedule, or webhook) and is audited (last-sync timestamp, success / failure, count of records exchanged).
- **AC-4 (DRAFT)**: Updates to a STAR result's alignment (US2 / US4 edits) are eventually reflected — the registry is **not** allowed to silently drift from STAR's truth.
- **AC-5 (DRAFT)**: Withdrawals (a Researcher flips US2 from Yes to No, or removes an SP) are propagated as removals, not orphaned positive declarations.
- **AC-6 (DRAFT)**: A sync failure surfaces to an admin (toast / alert / monitoring channel) and does not silently drop. Recoverable retry is supported.
- **AC-7 (DRAFT)**: STAR client does not embed any W3 Registry credentials; all sync traffic is mediated server-side (parallel to US5 AC-8).

---

## 4. Other information / Notes

- **Direction of flow**: this is the reverse of US1. US1 reads the System Office's project list into STAR. US6 writes STAR's result-level declarations back into the W3 Registry's project-level summary.
- **Relationship to US5**: US5 is the STAR → PRMS push for results-management; US6 is the STAR → W3 Registry push for funding-narrative reconciliation. The two may share infrastructure (a job runner, a queue) but they target different systems and have different contracts.
- **Ownership**: the W3/Bilateral Registry is owned by the System Office. STAR sends; W3 ingests. Specific endpoint(s) and auth model are not yet documented in either STAR or the PRMS-context corner of this triangle.

---

## 5. STAR fit notes

### Persona mapping
- **Primary actor**: STAR system (job runner / scheduler). User personas only show up as the **trigger** (when a Researcher saves US2/US4) or the **recipient of failure alerts** (Admin).
- No direct frontend UI surface for the typical Researcher — perhaps a status indicator on a result that "this contribution has been synced with W3 Registry at <timestamp>".

### PRD constraints touched
- **C-2 (AWS Cognito + JWT)**: STAR client must not call the W3 Registry directly. STAR backend mediates with the appropriate integration credential.
- **C-3 (CLARISA)**: SP/Accelerator references use CLARISA-canonical identifiers, not STAR-local IDs.
- **C-4 (WCAG 2.1 AA)**: if a status indicator is visible to the Researcher, it must convey state by more than color (icon + text), and any retry control must be keyboard reachable.

### Components & services to reuse
- **Status display** (if surfaced on the result UI): [`alert-tag`](../../../../research-indicators/src/app/shared/components/alert-tag), [`custom-tag`](../../../../research-indicators/src/app/shared/components/custom-tag), [`metadata-panel`](../../../../research-indicators/src/app/shared/components/metadata-panel).
- **API plumbing**: STAR backend service. The frontend probably consumes a small read-only endpoint for the "last sync at" badge.
- **Error surfacing**: [`global-toast`](../../../../research-indicators/src/app/shared/components/global-toast), [`global-alert`](../../../../research-indicators/src/app/shared/components/global-alert) for admin-facing failure notifications.

### Backend / API implication
- STAR backend service builds the W3 payload per the BA's contract, runs on a schedule or on edit events, and records the outcome.
- New entity / table: `w3_registry_sync_log` capturing per-result sync history.
- Read-side endpoint for the frontend (if a UI badge is in scope): `GET /api/results/:id/w3-sync-status` → `MainResponse<{ lastSyncedAt, status, message? }>`.

### Open questions
- **OQ-I** ([README.md §6](./README.md)): Is the W3 Registry write **part of the same channel as US5 (one combined push)** or a **separate channel**? Who owns the integration?
- **OQ-1593-A**: Sync **direction and trigger**: push from STAR? pull from W3? schedule? on-event? webhook?
- **OQ-1593-B**: What is the **payload contract** with the W3/Bilateral Registry? Is it documented anywhere, or must we discover it with the System Office?
- **OQ-1593-C**: Does the registry expose **read endpoints** STAR also relies on (e.g., to validate that a declared SP is still a valid contribution target for the project)? If yes, this story may also include the read path.
- **OQ-1593-D**: When a STAR result is deleted or its project loses its Pool Funding Contributor tag, how is the registry informed?

---

## Pending BA confirmation

The BA must validate or revise the following before the SDD spec consumes this story:

1. The **payload contract** with the W3/Bilateral Registry (OQ-1593-B) — the headline unknown.
2. Trigger and cadence (OQ-1593-A).
3. Whether US6 shares the integration plumbing with US5 (OQ-I).
4. Whether STAR also reads from the registry beyond the initial US1 project-list pull (OQ-1593-C).
5. Deletion / withdrawal flow (OQ-1593-D and DRAFT AC-5).

---

## 6. References

- Jira: [AC-1593](https://cgiarmel.atlassian.net/browse/AC-1593)
- Epic: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385) / [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
- Depends on: [US2 / AC-1594](./AC-1594-us2-pool-funding-alignment.md), [US4 / AC-1440](./AC-1440-us4-map-results-indicators.md)
- Related: [US1 / AC-1438](./AC-1438-us1-tag-bilateral-projects.md) (opposite-direction sync), [US5 / AC-1441](./AC-1441-us5-push-results-prms.md) (parallel downstream push)
- Sibling: [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §13 (federation & external data sources — the W3 Registry is the most upstream).
- STAR PRD: [`../../../prd.md`](../../../prd.md) §8.3 (C-2, C-3).
- STAR detailed design: [`../../../detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §7 (integration points), §8 (security), §9 (errors).
- SDD methodology: [`../../general-setup/requirements.md`](../../general-setup/requirements.md).

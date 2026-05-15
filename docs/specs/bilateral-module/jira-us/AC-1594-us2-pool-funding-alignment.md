# US2 — Configure Pool Funding Alignment Contribution for STAR Results (Jira AC-1594)

> **Status**: Open
> **Issue type**: User Story
> **Epic**: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385) — Module to map W3/Bilateral results to CGIAR Pool Funding (SP/A)
> **Discovery idea**: [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
> **Source maturity**: **Faithful synthesis** (Jira description is complete)
> **Figma**: [STAR / node-id=32471-129337](https://www.figma.com/design/5a9xZJdb2rZAQm2wdk1CNT/STAR?node-id=32471-129337&t=75DyZixpTfjtK6tu-0)
> **Subtask in Jira**: [AC-1606](https://cgiarmel.atlassian.net/browse/AC-1606) — Frontend – Implement Pool Funding Alignment section UI
> **Currently on**: branch `AC-1594-bilateral-module`

---

## 1. Story

**As a** Researcher (PI / Creator / Contact) on a result that belongs to a project tagged as a Pool Funding Contributor (see [US1 / AC-1438](./AC-1438-us1-tag-bilateral-projects.md)),
**I can** open a new **Pool Funding Alignment** section on that result, declare whether the result contributes to Pool Funding, and — when it does — select one or multiple Science Programs or Accelerators previously reported for the project,
**so that** the individual result is explicitly linked to CGIAR Pool Funding frameworks for downstream reporting and PRMS push ([US5 / AC-1441](./AC-1441-us5-push-results-prms.md)).

---

## 2. Background / Context

Verbatim from the Jira description:

> Configure the Pool Funding Alignment Contribution section for STAR results. This allows users to indicate if a STAR result contributes to a Science Program or Accelerator.
>
> Once a bilateral project is tagged as a Pool Funding Contributor, STAR results must include a section called "Pool Funding Alignment." This section is for indicating contributions to Science Programs or Accelerators.

This story introduces the user-facing surface for everything downstream: US3 (the SP-specific ToC indicators that appear inside this section), US4 (the indicator-to-result mapping that uses those indicators), US5 (the push of the completed mapping to PRMS), US6 (the reverse W3-Registry sync of the declared contributions), and US7 (the SP ToC catalog that feeds US3). All of those depend on this section existing on the result.

---

## 3. Acceptance criteria

Faithful to Jira AC-1594:

- **AC-1**: For STAR results in a **Pool Funding Contributor project**, the **Pool Funding Alignment** section is displayed.
- **AC-2**: For STAR results **not** in a Pool Funding Contributor project, the section is **not** displayed.
- **AC-3**: If **No** is selected for contribution, **no Science Program selection** is displayed.
- **AC-4**: If **Yes** is selected, users can select **one or multiple Science Programs / Accelerators**.
- **AC-5**: Only Science Programs / Accelerators **associated with the bilateral project** are displayed when enabled (i.e., the options come from the SPs / Accelerators previously reported for that project in the W3/Bilateral Registry).
- **AC-6**: Selected values are stored **persistently** in the STAR database.
- **AC-7**: Only users with permissions to the result can edit this section — Creator, PI, contact, and admins.

---

## 4. Other information / Notes

Verbatim from Jira, with the open question retained in Spanish for faithfulness:

- The section is **editable regardless of result status, including Approved results**. *(como afecta esto las versiones — pending BA — see OQ-C in [`README.md`](./README.md) §6.)*
- It becomes **read-only after synchronization**.
- Pool Funding Alignment fields are **not part of the result submission validator**. Users can submit results without completing these fields.

---

## 5. STAR fit notes

### Persona mapping
- **Primary actor**: **Researcher** (PRD §3.1) — the Jira PI / Creator / Contact all map here. The result-detail editing surface is the existing tabbed result editor.
- **Admin** (role_id 1): always allowed to edit (catch-all administrator).
- **Center Admin** / **MEL Regional Expert**: not explicitly named in this story; confirm whether they should also be allowed to edit results they oversee.

### PRD constraints touched
- **C-3 (CLARISA)**: the SP/Accelerator options come from the W3/Bilateral Registry contributions for the project, not from a generic CLARISA list. Document the source clearly. The Science Programs themselves may be CLARISA-managed; the *selection set* is a project-scoped subset. Frontend should respect both: SP option labels canonical, selection scoped to project.
- **C-4 (WCAG 2.1 AA)**: the Yes/No control must be a real radio (keyboard reachable); the multi-select must support keyboard, screen reader announcements of "selected" / "deselected", and visible focus rings.
- **C-6 (lazy-loaded standalone)**: the new section is structurally a **new tab in the result detail** alongside `general-information`, `alliance-alignment`, `partners`, `evidence`, `capacity-sharing`, `policy-change`, `innovation-details`, `oicr-details`, `ip-rights`, `geographic-scope`, `links-to-result` — see [`research-indicators/src/app/app.routes.ts`](../../../../research-indicators/src/app/app.routes.ts). It must be lazy-loaded via `loadComponent` and registered under the result tab system.

### Components & services to reuse
- **Tab placement**: extend the result-detail route children in [`app.routes.ts`](../../../../research-indicators/src/app/app.routes.ts) with a new `pool-funding-alignment` child route. Reuse [`result-sidebar`](../../../../research-indicators/src/app/shared/components/result-sidebar) so the tab appears in the existing left-nav.
- **Form host**: reuse [`shared-result-form`](../../../../research-indicators/src/app/shared/components/shared-result-form) as the container.
- **Yes/No control**: reuse the radio / toggle pattern from STAR's [`custom-fields`](../../../../research-indicators/src/app/shared/components/custom-fields). Do **not** introduce a new PrimeNG radio without going through the wrapped style.
- **SP/Accelerator multi-select**: reuse [`dropdowns`](../../../../research-indicators/src/app/shared/components/dropdowns) (multi-select variant). Source data list per AC-5 must be filtered by project.
- **State**: a new domain service (`pool-funding-alignment.service.ts`) holding the section signal state; reuse the signals + `MainResponse<T>` pattern from [`detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §6.
- **Permissions** for AC-7 (Creator / PI / contact / admins): reuse [`cache/roles.service.ts`](../../../../research-indicators/src/app/shared/services/cache/roles.service.ts) and the existing edit-permission pattern already in result-detail tabs; do **not** flip a global read-only flag (the PRMS-side anti-pattern called out in [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §7 and §15 R3).
- **Backend authoritative**: per [`detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §8.2, frontend permission checks are UX-only; the backend enforces.

### Backend / API implication
- New endpoints (likely):
  - `GET /api/results/:id/pool-funding-alignment` — returns current selection + the project-scoped SP/A options.
  - `PATCH /api/results/:id/pool-funding-alignment` — persists the Yes/No + selected SPs.
- New entity / table: `result_pool_funding_alignment` (or column set on `result`). Stores `contributes_to_pool_funding: boolean | null` and `science_programs: SP[]` (FK to CLARISA initiatives or to the project's W3 Registry contributions list).
- Backend gates AC-1 (display only when project is tagged via US1) and AC-7 (edit permission). Frontend mirrors.
- AC-7 ("Only users with permissions to the result can edit") — confirm the existing result-edit permission set already covers Creator/PI/contact/admin. The Jira terms "PI" and "contact" may not be first-class roles today.

### Federation with PRMS
- The selected SPs/Accelerators are what gets pushed to PRMS in [US5](./AC-1441-us5-push-results-prms.md). The shape PRMS expects for its bilateral ingest is documented in [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §12 (endpoint catalog) and §4.3 (`toc_mapping.science_program_id`) — confirm STAR's payload aligns when authoring US5.

### Read-only after synchronization
- "Becomes read-only after synchronization" (Jira note) — *which* synchronization is implied? Two candidates: (a) US5 push to PRMS, (b) US6 W3 Registry reverse sync. Surface as OQ-E in [`README.md`](./README.md) §6.

### Open questions
- **OQ-C** ([README.md §6](./README.md)): How does "editable regardless of result status, including Approved" interact with STAR's existing result versioning ([`detailed-design.md`](../../../detailed-design/detailed-design.md) §3.2)? The Spanish parenthetical *"como afecta esto las versiones"* is the BA's own open question.
- **OQ-D** ([README.md §6](./README.md)): "Creator, PI, contact, admins" — are PI and contact first-class STAR roles, or should they be folded into Researcher / new result-level relationships?
- **OQ-E** ([README.md §6](./README.md)): "Read-only after synchronization" — synchronization with what (US5? US6? both)?
- **OQ-1594-A**: Should the section be available in the **result creation** flow ([US1 AC-3.4 / AC-3.5](./AC-1438-us1-tag-bilateral-projects.md)), or only in result editing? Jira does not specify; mockup may show.
- **OQ-1594-B**: When the project's Pool Funding Contributor tag is removed (US1 lifecycle), what happens to an already-saved alignment selection? Cascade hide, freeze, or warn?

---

## 6. References

- Jira: [AC-1594](https://cgiarmel.atlassian.net/browse/AC-1594) (with subtask [AC-1606](https://cgiarmel.atlassian.net/browse/AC-1606))
- Figma: [node-id=32471-129337](https://www.figma.com/design/5a9xZJdb2rZAQm2wdk1CNT/STAR?node-id=32471-129337&t=75DyZixpTfjtK6tu-0)
- Epic: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385) / [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
- Depends on: [US1 / AC-1438](./AC-1438-us1-tag-bilateral-projects.md) (project tagging)
- Feeds: [US3 / AC-1439](./AC-1439-us3-display-toc-indicators.md), [US4 / AC-1440](./AC-1440-us4-map-results-indicators.md), [US5 / AC-1441](./AC-1441-us5-push-results-prms.md), [US6 / AC-1593](./AC-1593-us6-sync-bilateral-w3-registry.md)
- Sibling corner: [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §12 (endpoint catalog), §6 (review drawer = PRMS-side counterpart)
- STAR PRD: [`../../../prd.md`](../../../prd.md) §3 personas, §8.3 constraints.
- STAR detailed design: [`../../../detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §2 (modules — adding a result tab), §3 (data model), §4 (API contracts), §6 (state), §8 (security).
- STAR system design: [`../../../system-design/design.md`](../../../system-design/design.md) §4 (screen inventory — the new tab), §6 (layout patterns), §8 (component inventory).
- SDD methodology: [`../../general-setup/requirements.md`](../../general-setup/requirements.md).

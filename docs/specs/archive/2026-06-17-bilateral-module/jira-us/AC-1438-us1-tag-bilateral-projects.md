# US1 — Tag Bilateral Projects Contributing to Pool Funding (Jira AC-1438)

> **Status**: Open
> **Issue type**: User Story
> **Epic**: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385) — Module to map W3/Bilateral results to CGIAR Pool Funding (SP/A)
> **Discovery idea**: [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
> **Source maturity**: **Faithful synthesis** (Jira description is complete)
> **Figma**: [STAR / node-id=33486-133230](https://www.figma.com/design/5a9xZJdb2rZAQm2wdk1CNT/STAR?node-id=33486-133230&t=75DyZixpTfjtK6tu-0)

---

## 1. Story

**As a** Center Admin (and any STAR user viewing projects),
**I can** see which bilateral projects in STAR are tagged as **Pool Funding Contributors** based on the System Office's validated list,
**so that** results inside those projects can be associated with CGIAR Pool Funding (Science Programs and Accelerators) for downstream alignment and reporting.

> The Jira ticket frames this as a system behavior more than a user action — the tag itself is driven by the System Office's official internal list, not by a user inside STAR. The user-facing slice is **visibility and filtering** of the tag. The "tagging" operation is automatic.

---

## 2. Background / Context

Verbatim from the Jira description:

> The task is to tag bilateral projects that contribute to CGIAR Pool Funding in the STAR system. This will help identify these projects and map results to Pool Funding frameworks.
>
> The System Office collects a list of bilateral projects contributing to Pool Funding. This validated list is shared with each center and needs to be reflected in STAR at the project level.

STAR project records already come from **Agresso**. This story adds a new attribute — *Pool Funding Contributor* — to those project records, sourced from the System Office's official internal list. Once the tag is in place, every downstream story in the epic (US2 alignment section, US3 indicator display, US4 contribution mapping, US5 push to PRMS) gates on it.

---

## 3. Acceptance criteria

Faithful to Jira AC-1438:

- **AC-1**: A bilateral project listed in the bilateral mapping list is tagged as **Pool Funding Contributor**.
- **AC-2**: A bilateral project not included in the list is **not tagged** in STAR.
- **AC-3**: The Pool Funding tag is visible:
  - **AC-3.1**: In the **projects listing table**.
  - **AC-3.2**: As a **filter** in the projects and results tables.
  - **AC-3.3**: In **exported Excel files**.
  - **AC-3.4**: In **result creation** screens (project selectors).
  - **AC-3.5**: In **project selectors in the result** (any place a result references a project).
- **AC-4**: The tag is stored **persistently** in the STAR database.
- **AC-5**: Filtering by the tag supports both **Pool Funding Contributor = Yes** and **Pool Funding Contributor = No**.
- **AC-6**: The tag is **displayed in the project detail header** when accessing a tagged project.

---

## 4. Other information / Notes

Verbatim from Jira:

- A new **Pool Funding Contributor** tag must be added to STAR project records.
- Only **bilateral projects from Agresso** can be tagged.
- The tagging will use the **official internal list** from the System Office.
- The tag must be stored at the **database level**, visible in the Projects Table, available as a filter, included in Excel exports, and shown in the project detail header.

---

## 5. STAR fit notes

### Persona mapping
- **Primary actor**: not a user action — the tag is system-driven (System Office list → Agresso → STAR). All STAR personas in [`docs/prd.md`](../../../prd.md) §3 are **viewers** of the tag.
- **Filtering / exporting** consumers: Researcher (R-6 — search by project), Center Admin (CA-2 — view in-flight results in their center), MEL Regional Expert (MEL-3 — export structured metadata), Cross-Platform Consumer (CP-1 — search across platforms).

### PRD constraints touched
- **C-3 (CLARISA controlled vocabularies)**: the Pool Funding Contributor tag is **not** a CLARISA list — it is an internal System Office attribute on project records. Document the data ownership clearly so it is not mistaken for a CLARISA controlled list.
- **C-4 (WCAG 2.1 AA)**: the tag must be communicated by more than color alone (text label or icon) — relevant especially in the project listing table and project header.

### Components & services to reuse
- **Projects listing table** — STAR has [`my-projects.service.ts`](../../../../research-indicators/src/app/shared/services/my-projects.service.ts) and shared components [`project-results-table`](../../../../research-indicators/src/app/shared/components/project-results-table), [`project-item`](../../../../research-indicators/src/app/shared/components/project-item). Add the tag column there.
- **Filters**: extend [`filters-action-buttons`](../../../../research-indicators/src/app/shared/components/filters-action-buttons) with a Yes/No filter for Pool Funding Contributor.
- **Exports**: STAR already uses ExcelJS for metadata exports — extend the result/project export schema to include the new field.
- **Project selectors**: any dropdown/autocomplete component used in result creation that picks a project must surface the tag (e.g., as a badge or suffix on the option label). Reuse [`dropdowns`](../../../../research-indicators/src/app/shared/components/dropdowns) / [`dropdown`](../../../../research-indicators/src/app/shared/components/dropdown).
- **Tag display**: reuse [`custom-tag`](../../../../research-indicators/src/app/shared/components/custom-tag) for consistent styling.

### Backend / API implication
- New attribute on the Project entity: `is_pool_funding_contributor: boolean` (or similar). Source-of-truth ingestion job that consumes the System Office list and updates the flag.
- The STAR backend (NestJS) needs a list-import job or admin endpoint. Frontend probably has nothing to write — it only reads. Confirm with backend lead.
- Filter API: the existing project/result list endpoints need to accept a `?poolFundingContributor=Yes|No` query (or an equivalent JSON body filter).

### Open questions
- **OQ-A**: Is the tag stored on the project only, or also denormalized onto each result for fast filtering of result lists?
- **OQ-B**: Who is authorized to flip the tag? The Jira ticket implies the System Office list is authoritative and the tag is not user-editable. Confirm with the BA.
- **OQ-1438-A**: How often does the System Office's list refresh? Manual upload, scheduled sync, or push? Affects backend job design.
- **OQ-1438-B**: When a project loses its Pool Funding Contributor status, what happens to existing results that have already declared a Pool Funding Alignment under US2? Cascade, freeze, or warn?

---

## 6. References

- Jira: [AC-1438](https://cgiarmel.atlassian.net/browse/AC-1438)
- Figma: [node-id=33486-133230](https://www.figma.com/design/5a9xZJdb2rZAQm2wdk1CNT/STAR?node-id=33486-133230&t=75DyZixpTfjtK6tu-0)
- Epic: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385) / [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
- Sibling: [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) — see §13 (federation & external data sources) for the broader project / institution catalog landscape.
- STAR PRD: [`../../../prd.md`](../../../prd.md) §3 personas, §8.3 constraints.
- STAR detailed design: [`../../../detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §3 (data model — adding a project-level boolean), §4 (API contracts), §6 (state).
- STAR system design: [`../../../system-design/design.md`](../../../system-design/design.md) §8 (component inventory).
- SDD methodology: [`../../general-setup/requirements.md`](../../general-setup/requirements.md).

# Bilateral Module — Jira User Stories (PO Synthesis)

> **Audience**: STAR product, design, and engineering preparing to implement the bilateral module.
> **Source**: Jira epic [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385) (implements Polaris idea [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)) and its 9 child user stories.
> **Status**: Product-Owner synthesis. Not a spec. Inputs to the eventual SDD spec at [`docs/specs/bilateral-module/{requirements,design,task}.md`](../../general-setup/).

---

## 1. Epic at a glance

**Title**: Module to map W3/Bilateral results to CGIAR Pool Funding (SP/A)
**Jira**: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385) (Epic, Open) implementing [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194) (Polaris Idea, Delivery — 4. 2026 Roadmap, Q2 2026, S — 2 to 4 Sprints).
**Owner**: Hector Tobon (reporter & creator). Epic assignee: Daniela Zuñiga Pino.

**Mission** (paraphrased from PARI-194):

A new section in STAR that lets a Principal Investigator confirm whether a research result contributes to **CGIAR Pool Funding** (Science Programs and Accelerators) and, if so, map that result to a specific **Theory of Change (ToC)** and corresponding **indicator** — backed by the contributions previously reported in the **W3/Bilateral Registry**.

**Problem** (verbatim from PARI-194):

> Currently, there is no structured mechanism within STAR to explicitly associate results from bilateral projects with CGIAR Pool Funding contributions. Although centers report project-level contributions to Science Programs and Accelerators in the W3/Bilateral Registry, there is a gap in linking individual results to these frameworks. This limits the ability to track and validate how specific outputs contribute to pooled efforts.

**Impact** (verbatim from PARI-194):

> By introducing this section, STAR will allow Principal Investigators to confirm whether a result contributes to Pool Funding. If so, the system will display pre-reported SPs/Accelerators from the W3/Bilateral Registry, enabling the PI to map the result to a specific Theory of Change and corresponding indicator. This strengthens traceability and accountability of bilateral project outcomes, improves the quality of aggregated reporting, and ensures alignment with CGIAR strategic priorities.

**Mockups overview** (Figma): [`STAR / node-id=26203-90593`](https://www.figma.com/design/5a9xZJdb2rZAQm2wdk1CNT/STAR?node-id=26203-90593&t=ZCMPChzPg5fQEVo3-4)

---

## 2. Architectural orientation — STAR is the producer

Read this before opening any story file. It corrects a directionality assumption that may have leaked from the sibling [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md).

```
Agresso (System Office)                W3 / Bilateral Registry
        │                                       ▲
        │ official bilateral project list       │  US6 reverse sync
        ▼                                       │
┌─────────────────────────────────────────────────────────────┐
│                            STAR                             │
│  US1 tag projects as Pool Funding Contributor               │
│  US2 add "Pool Funding Alignment" section on results        │
│  US3 display SP ToC indicators when an SP is picked         │
│  US4 map result → indicator (with contribution rules)       │
│  US7 pull SP ToC catalog                ◄────────┐          │
└──────────────────────────────┬──────────────────│──────────┘
                               │ US5 push results │
                               ▼                  │
                       ┌──────────────────────────┴───────────┐
                       │              PRMS                    │
                       │  bilateral ingestion + review        │
                       │  (Science Program / Accelerator lead │
                       │   reviews and approves / rejects)    │
                       └──────────────────────────────────────┘
```

STAR is the **upstream producer** in this flow. It captures the user-facing Pool Funding alignment and pushes structured results to PRMS, which then exposes the **review workspace** described in [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md). The two corners of this context triangle describe the two ends of the same pipeline; reading them together gives the full picture.

External dependencies surfaced by the stories:

- **Agresso** — source of the official bilateral project list (US1).
- **W3/Bilateral Registry** — authoritative system for which centers contribute to which SPs/Accelerators (US6).
- **PRMS** — downstream review surface; STAR pushes results here (US5).
- **Science Program ToC catalog** — synced into STAR so SP-aligned indicators can be displayed and mapped (US7, US3).
- **CLARISA** — already in use for institutions, countries, regions, SDGs (PRD constraint C-3).

---

## 3. Story index

All 9 stories under the AC-1385 epic.

| Jira | US# | Title | Status | Source maturity | Figma | Per-story file |
|---|---|---|---|---|---|---|
| [AC-1386](https://cgiarmel.atlassian.net/browse/AC-1386) | US0 | Create Mockups for W3/Bilateral Mapping with PRMS ToC Tool | Closed | Discovery (mockup creation) | [Figma](https://www.figma.com/design/5a9xZJdb2rZAQm2wdk1CNT/STAR?node-id=30222-112062&t=FYy3O44veesdGCKI-4) | inline below |
| [AC-1413](https://cgiarmel.atlassian.net/browse/AC-1413) | US0 | Validate and refine mockups on how STAR Results will be pushed to PRMS | Done | Discovery (mockup validation) | [Figma](https://www.figma.com/design/5a9xZJdb2rZAQm2wdk1CNT/STAR?node-id=32470-3149&t=jann4Va7PNDV3drp-4) | inline below |
| [AC-1438](https://cgiarmel.atlassian.net/browse/AC-1438) | **US1** | Tag Bilateral Projects Contributing to Pool Funding | Open | **Faithful** (Jira has full content) | [Figma](https://www.figma.com/design/5a9xZJdb2rZAQm2wdk1CNT/STAR?node-id=33486-133230&t=75DyZixpTfjtK6tu-0) | [AC-1438-us1-tag-bilateral-projects.md](./AC-1438-us1-tag-bilateral-projects.md) |
| [AC-1594](https://cgiarmel.atlassian.net/browse/AC-1594) | **US2** | Configure Pool Funding Alignment Contribution for STAR Results | Open | **Faithful** (Jira has full content) | [Figma](https://www.figma.com/design/5a9xZJdb2rZAQm2wdk1CNT/STAR?node-id=32471-129337&t=75DyZixpTfjtK6tu-0) | [AC-1594-us2-pool-funding-alignment.md](./AC-1594-us2-pool-funding-alignment.md) |
| [AC-1439](https://cgiarmel.atlassian.net/browse/AC-1439) | US3 | Display ToC Indicators as per selected Science Program | Open | **DRAFT** (PO synthesis) | — | [AC-1439-us3-display-toc-indicators.md](./AC-1439-us3-display-toc-indicators.md) |
| [AC-1440](https://cgiarmel.atlassian.net/browse/AC-1440) | US4 | Map results to indicators including rules (Contributions) | Open | **DRAFT** | — | [AC-1440-us4-map-results-indicators.md](./AC-1440-us4-map-results-indicators.md) |
| [AC-1441](https://cgiarmel.atlassian.net/browse/AC-1441) | US5 | Push Results into the PRMS | Open | **DRAFT** | — | [AC-1441-us5-push-results-prms.md](./AC-1441-us5-push-results-prms.md) |
| [AC-1593](https://cgiarmel.atlassian.net/browse/AC-1593) | US6 | Sincronizar las contribuciones de bilaterales con W3 registry | Open | **DRAFT** (Spanish title) | — | [AC-1593-us6-sync-bilateral-w3-registry.md](./AC-1593-us6-sync-bilateral-w3-registry.md) |
| [AC-1595](https://cgiarmel.atlassian.net/browse/AC-1595) | US7 | Sincronizar el ToC de los SPs | Open | **DRAFT** (Spanish title) | — | [AC-1595-us7-sync-sp-toc.md](./AC-1595-us7-sync-sp-toc.md) |

### Discovery US0 stories — inline summary

Both US0 entries are closed/done. They captured the mockup-creation and mockup-validation activities that produced the visual reference for everything downstream. No per-story file is needed; future readers can follow the Figma links above.

- **US0 / AC-1386** — Mockups for W3/Bilateral mapping using the PRMS ToC tool. Note in the Jira ticket: *"Mockups finalized. User stories are pending to be designed."* The user stories listed in §3 are the result of that "pending" work.
- **US0 / AC-1413** — Validation pass on how STAR results will be pushed to PRMS. Closed by Juan Pablo Bueno.

---

## 4. Recommended reading order

The dependency graph is roughly:

```
US1 (tag projects as Pool Funding Contributors, Agresso → STAR)
  └── US2 (Pool Funding Alignment section appears on results in tagged projects)
        ├── US7 (sync SP ToC catalog into STAR)
        │     └── US3 (display ToC indicators per selected SP)
        │           └── US4 (map result to indicators with contribution rules)
        │                 └── US5 (push completed results to PRMS)
        └── US6 (sync bilateral contributions back to W3 Registry, parallel concern)
```

Recommended reading sequence for someone new to the work:

1. **US1** — see how a project gets identified as in-scope for Pool Funding.
2. **US2** — see where the user-facing alignment work happens.
3. **US7** — see how STAR obtains the SP ToC catalog needed to populate the UI.
4. **US3** — see the ToC display logic that runs inside the section.
5. **US4** — see the indicator-mapping rules.
6. **US5** — see how a completed result reaches PRMS.
7. **US6** — see the reverse sync that keeps the W3 Registry honest.

---

## 5. STAR persona mapping

Jira and the BA's domain language do not match STAR's PRD persona list 1-to-1. This table is the reconciliation; per-story files should use the STAR persona name and reference this table.

| Jira / domain term | STAR PRD persona ([prd.md §3](../../../prd.md)) | Notes |
|---|---|---|
| Principal Investigator (PI) | **Researcher / Result reporter** (§3.1) | Owns and submits the result. Default actor for US2, US3, US4. |
| Creator | **Researcher** (§3.1) | Same person who created the result record. Used in US2 edit-permission rule. |
| Contact | **Researcher** or designate | Project contact; treat as Researcher unless future stories diverge. |
| Center user / Center admin | **Center Admin** (§3.2, role_id 9) | Surfaces in US1 (tagging visibility) and Excel exports. |
| Admin / System Admin | **Admin** (role_id 1) | Always allowed to edit. |
| (None named) | **MEL Regional Expert** (§3.3) | Not currently used by the BA stories; flagged as open question OQ-M1 in §6. |
| (None named) | **Cross-Platform Consumer** (§3.4) | Sees Pool Funding tag in exports and federated views (US1). |

---

## 6. Open questions roll-up

Aggregated across all 7 SDD-relevant stories. Each is also restated in the per-story file where it was first raised.

- **OQ-A** (US1) — Is the "Pool Funding Contributor" tag stored at the project level only, or also propagated onto each result for filtering? US1 implies project level; downstream filtering implies a denormalized result-level flag is needed.
- **OQ-B** (US1) — Who is authorized to flip the tag? US1 implies it is driven by the Agresso list / System Office and not user-editable inside STAR. Confirm.
- **OQ-C** (US2) — "Editable regardless of result status, including Approved" — how does that interact with STAR's existing result versioning (see [`detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §3.2)? Jira description literally asks: *"(como afecta esto las versiones)"* — pending BA.
- **OQ-D** (US2) — Edit-permission rule names "Creator, PI, contact, admins". The "PI" and "contact" roles are not first-class in STAR's PRD persona list. Promote to result-level roles or fold into Researcher?
- **OQ-E** (US2) — "Becomes read-only after synchronization" — synchronization with what? US5 push to PRMS, or US6 W3 Registry sync, or both?
- **OQ-F** (US3 / US7) — Which system is the authoritative source of the SP ToC catalog: PRMS, CLARISA, a dedicated ToC service, or another? US7 says "sync" without naming the upstream.
- **OQ-G** (US4) — What are the "contribution rules"? Mutual exclusivity across SPs? Cardinality constraints on indicators per result? Pending BA.
- **OQ-H** (US5) — Push triggered when? On result submission, on review acceptance, on manual button, on schedule? PRD constraint C-2 (Cognito + JWT) shapes the auth path. See [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §12 for the PRMS-side endpoint catalog and §16 for the auth divergence.
- **OQ-I** (US6) — Reverse direction: is the W3 Registry write part of the same push or a separate channel? Who owns the integration?
- **OQ-M1** (cross-cutting) — MEL Regional Expert has no current responsibility in any story. Is this intentional, or is there a missing review step on the STAR side?
- **OQ-M2** (cross-cutting) — None of these stories declares a non-functional requirement (performance, a11y, dark mode). The SDD spec will inherit STAR's PRD constraints (C-4 WCAG 2.1 AA, etc.); confirm no story-specific NFR is missing.

---

## 7. How this feeds the SDD spec

These user stories inform — but do not replace — the canonical SDD docs that will live at:

- `docs/specs/bilateral-module/requirements.md`
- `docs/specs/bilateral-module/design.md`
- `docs/specs/bilateral-module/task.md`

Conventions for the SDD spec:

- **Requirement IDs** will use `REQ-BILATERAL-NN` per the [methodology template](../../general-setup/requirements.md).
- Every requirement should cite the Jira story it discharges, e.g., `REQ-BILATERAL-02 (discharges AC-1594 / US2)`.
- DRAFT stories (US3, US4, US5, US6, US7) **must** be confirmed by the BA before their content is consumed by a `REQ-BILATERAL-NN` requirement.
- Cross-link the figma-mockups corner (when populated) using the Figma URLs already listed per story.
- Cross-link the [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) corner — especially §12 (endpoint catalog) for US5 and §6 (review drawer) for the downstream PRMS view of what STAR pushes.

---

## 8. Sources

- [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) — the PRMS-side frontend context (review surface).
- [`../figma-mockups/`](../figma-mockups/) — TBD (visual references; per-story Figma URLs are linked in §3).
- [`../../../prd.md`](../../../prd.md) — STAR product baseline.
- [`../../../system-design/design.md`](../../../system-design/design.md) — STAR UI/UX blueprint.
- [`../../../detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) — STAR technical blueprint.
- [`../../general-setup/`](../../general-setup/) — SDD methodology templates.
- Jira parent: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385) implements [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194).

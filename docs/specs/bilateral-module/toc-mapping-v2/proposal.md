# Proposal — Bilateral Module / ToC Mapping v2 (Level + SP via lambda-toc)

> Created by `/sdd-propose`. Replaces the AOW-based ToC lookup and the HLO-selection-modal UX with the new **lambda-toc** `category/{LEVEL}/initiative/{SP}` integration and the inline per-SP cascading form (Level → High-Level Output → Indicator → Contribution) shown in the 2026-06-09 mockups.

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec path | `docs/specs/bilateral-module/toc-mapping-v2/` |
| Proposal path | `docs/specs/bilateral-module/toc-mapping-v2/proposal.md` |
| Author | Juanca + Claude (`AC-1594-bilateral-module`) |
| Status | DRAFT — awaiting approval |
| Created | 2026-06-09 |
| Supersedes | [`../indicator-mapping/`](../indicator-mapping/) (US3/US4 modal-based mapping) · [`../hlo-grouped-mapping/`](../hlo-grouped-mapping/) (modal refinement, never implemented) |
| Inputs | 2026-06-09 team meeting notes · "Science Program and TOC mapping rules" (updated US text) · 3 new mockup screens (Result 5238, Capacity Sharing, live version) — **not yet exported to [`../figma-mockups/`](../figma-mockups/)** |
| Backend repo | `alliance-research-indicators-main`, branch `AC-1594-bilateral-module-v2` (mirror proposal needed there) |
| Backend handoff | [`./backend-handoff.md`](./backend-handoff.md) — upstream contract + frozen FE wire contract + proxy design (2026-06-09) |
| Jira | [`../jira-us/AC-1594-us2-pool-funding-alignment.md`](../jira-us/AC-1594-us2-pool-funding-alignment.md) · AC-1439 / AC-1440 (US3/US4) — user story has new comments with these changes |
| Constitutional anchors | [`docs/prd.md`](../../../prd.md) §8.3 (C-1…C-6) · [`docs/system-design/design.md`](../../../system-design/design.md) · [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) |

---

## 2. Intent

Let a PI align a bilateral result to **one or more Science Programs** inherited from the result's **primary reporting project**, and for **each selected SP independently** configure a ToC alignment — **TOC Level** (constrained by the STAR result type), **High-Level Output / Outcome**, **Indicator**, and **Quantitative contribution** against the indicator's unit of measure and target — sourcing the HLO/indicator catalog from the new **lambda-toc** service instead of the AOW-based PRMS public-results-framework endpoint.

---

## 3. Problem / current behavior

### 3.1 Data source (backend, `alliance-research-indicators-main`)

Today `BilateralService.getHlosIndicatorsForResult()` builds the catalog by:

1. Resolving result → AGRESSO contract → `bilateral_project_mapping` → CLARISA project → SP codes.
2. Enumerating **all AOWs per SP** from the CLARISA cgiar-entities catalog (`ClarisaCgiarEntitiesService.getAreasOfWorkBySp`).
3. Fanning out one PRMS call **per (SP, AOW) pair**: `GET {ARI_PRMS_TOC_HOST}/api/public-results-framework/toc-results?program=<SP>&areaOfWork=<AOW>` (`prms-toc.service.ts`), caching 404s for empty pairs.

This AOW-driven contract is **deprecated**. The replacement is:

```
GET https://lambda-toc.clarisa.cgiar.org/api/toc-integration/toc/results/category/{LEVEL}/initiative/{SP}
```

**Verified live 2026-06-09** (no auth required; host did not resolve on local DNS, resolves via 8.8.8.8 → CloudFront/AWS):

| `{LEVEL}` value | Returns | Sample (SP01) |
| --- | --- | --- |
| `OUTPUT` | High-Level Outputs (`HLOn.AOWn.IOn …`) | 22 results, each with `indicators[]` |
| `OUTCOME` | Intermediate Outcomes (`IOCn …`) | 10 results |
| `EOI` | 2030 Outcomes (`2030-OCn. …`) | 2 results, `wp_short_name: null` (no AOW) |

Response shape (`{ response: TocResult[] }`):

- **TocResult**: `toc_result_id`, `toc_internal_id`, `title`, `description`, `official_code` (SP), `work_package_id`, `wp_short_name` (AOW code, `null` for EOI), `phase`, `version_id`, `indicators[]`.
- **Indicator**: `indicator_id`, `toc_result_indicator_id`, `related_node_id`, `indicator_description`, `unit_messurament`, `type_value` / `type_name` (e.g. `"Number of people trained (capacity sharing for development)"`, `"Number of innovations (innovation development)"`, `"Number of knowledge products"`, `"custom"`), `location`, `targets[]` (per-year `target_value` for 2020–2030 — covers the mockup's "Target → 5" for the active reporting year).

One call per (SP, level) replaces the N×AOW fan-out; the AOW enumeration step disappears entirely (AOW context survives as `wp_short_name` on each result).

### 3.2 UX (client, this repo)

The shipped read-side (commits `112dc10a` → `e373f8d9`) implements the **old mockups**: an AI card opening `HloSelectionModalComponent` — a SP → AOW → indicator **tree/checkbox picker** — with selections materialized as inline HLO cards. The write-side was held at the OQ-IM-1 gate (contribution body shape) and was never built.

The new mockups (Result 5238) show a **different interaction model**, with no modal:

1. "Does this result contribute to a Science Program or Accelerator?" — Yes/No.
2. "Select the principal Science Program this is related to" — **must support multiple selection**; options limited to SPs mapped to the **primary reporting project**.
3. Per selected SP, an independent block: "Does this result align with the Program's TOC indicators?" Yes/No → **Level** dropdown → **High Level Output** dropdown (options like `AOW01 — HLO1.AOW1.IO1 Steer to impact`) → **Indicator** dropdown → "Contribution to indicator target" panel showing read-only **Unit of measurement** + **Target** and an editable **Quantitative contribution** input.

### 3.3 New business rules (from the updated US + 2026-06-09 meeting)

- **TOC Level depends on STAR result type**: Capacity Sharing → only *High-Level Output* (`OUTPUT`); Innovation Development → only *High-Level Output* (`OUTPUT`); Policy Change → only *Intermediate Outcome* (`OUTCOME`) and *2030 Outcome* (`EOI`).
- **Indicator type filter**: only show indicators whose type matches the reported result type (meeting: "solo mostrar indicadores del mismo tipo que el resultado reportado") — see OQ-V2-2.
- Each selected SP keeps an **independent** alignment (level, HLO, indicator, contribution); editing one must never touch another.
- ToC mapping applies **only to results with live version 2026**; 2026 is hardcoded for now and mapping is blocked for 2027+ versions (versioning conversation with Enrico pending).
- Contributing projects do **not** yet supply SPs (awaiting Nicolette's confirmation) — primary project only.

---

## 4. Proposed outcome

When this ships:

1. The Pool Funding Alignment section renders the new inline flow: multi-select SP (scoped to the primary project's mapping) → one alignment block per selected SP with Level / HLO / Indicator cascading dropdowns and the contribution panel.
2. The Level dropdown offers only the levels allowed by the result's STAR result type; when only one level is allowed it is preselected.
3. HLO and Indicator options come from the new lambda-toc endpoint (proxied through the ARI backend), called with `(level, SP)`; selecting an indicator reveals its unit of measure and the active-year (2026) target, and the user enters a quantitative contribution.
4. Each SP's alignment persists independently (e.g. SP01 → HLO A → Indicator X → 10; SP03 → HLO B → Indicator Y → 25).
5. The HLO selection modal, the AI "VIEW HIGH LEVEL OUTPUTS" card, and the AOW-pair backend pipeline are retired.
6. Results whose live version ≠ 2026 cannot create/edit ToC mappings (read-only or hidden per design phase decision).

---

## 5. Scope

**Client (this repo):**

- Rework `pool-funding-alignment` page: keep Yes/No + multi-select SP picker (already multi-capable); add per-SP alignment blocks with the cascading dropdowns and contribution panel.
- New/changed DTOs for the lambda-toc-shaped catalog; result-type → allowed-levels rule; indicator-type filter; per-SP independent state in `BilateralService`.
- Write-side: persist per-SP alignment `{ sp_code, level, toc_result_id, indicator_id, quantitative_contribution }` (final body owned by the backend spec).
- Retire `HloSelectionModalComponent` + modal session-state machinery (delete or quarantine; tests updated).
- Version gate: enable mapping only for live version 2026.

**Backend (`alliance-research-indicators-main` — mirror spec there):**

- New `TocIntegrationService` (or refit of `prms-toc.service.ts`): `GET {host}/api/toc-integration/toc/results/category/{level}/initiative/{sp}`, cache keyed `(sp, level)`; env var `ARI_TOC_INTEGRATION_HOST` (**already set in backend `.env` 2026-06-09** → `https://lambda-toc.clarisa.cgiar.org`). Full design in [`./backend-handoff.md`](./backend-handoff.md).
- Replace the (SP, AOW) pair pipeline in `getHlosIndicatorsForResult()` with (SP, allowed-levels) lookups driven by the result type; drop the `ClarisaCgiarEntitiesService.getAreasOfWorkBySp` dependency from this flow.
- Persistence + endpoints for per-SP independent alignments; 2026 hardcode + 2027+ block.

---

## 6. Non-goals

- **Contributing-project SP inheritance** — blocked on Nicolette's answer; no project-selection step is built.
- **Bilateral registry / ToC versioning** — Enrico conversation pending; only the 2026 hardcode + 2027+ block ship here.
- PRMS push (US5), W3 registry sync (US6), SP-ToC catalog sync (US7).
- Moving env vars to the parameters table / DB-driven configuration.
- Any change to the AGRESSO tag, SP picker eligibility chain (`bilateral_project_mapping`), or the alignment GET/PATCH envelope beyond what the per-SP model requires.

---

## 7. Affected users, systems, and specs

| Area | Impact |
| --- | --- |
| PIs / contributors | New inline alignment flow; no modal; per-SP blocks |
| FE: `pool-funding-alignment.component.ts`, `bilateral.service.ts`, `api.service.ts`, `pool-funding-alignment.interface.ts` | Major rework (see §5) |
| FE: `hlo-selection-modal/` | **Retired** |
| BE: `bilateral.service.ts` (pair derivation), `prms-toc.service.ts`, `env.utils.ts` | Replaced / refit |
| BE: `clarisa-cgiar-entities` AOW lookup | No longer used by this flow |
| Spec `../indicator-mapping/` | **Archive** (see §8 disposition) |
| Spec `../hlo-grouped-mapping/` | **Archive** (never implemented; refines a modal that is being retired) |
| Spec `../ari-backend-context/` | Stale for the ToC read path; supersede with a new handoff snapshot |
| `../figma-mockups/` | Old pool-funding/HLO-modal nodes superseded; new mockups must be exported |

### Archive disposition (requested decision)

**Recommendation: archive both active specs and start `toc-mapping-v2` as a new implementation, not an enhancement.**

- `indicator-mapping`: its core UX premise (modal tree picker over SP→AOW pairs, multi-indicator checkbox selection, HLO cards with reason dropdown) and its data contract (AOW-pair `hlos-indicators`) are both invalidated. Its gating question **OQ-IM-1** (polymorphic contribution body) is mooted — the new mockups show a plain quantitative contribution against the indicator target, no reason field, no 5-type polymorphism. Archive to `docs/specs/archive/` with a pointer here; salvage list in §10.
- `hlo-grouped-mapping`: FE-only refinement of the modal being deleted; zero code shipped. Archive as designed-but-superseded.
- **Shipped code is not thrown away wholesale**: the alignment GET/PATCH flow, multi-select SP picker, `mapping_status`/`unknown_sp_codes` handling, read-only/synced gates, and the `materializeRows` wire→view seam pattern all carry forward. The modal component and AOW-pair DTOs are removed.
- Same disposition applies in the backend repo (its `indicator-mapping/` + `pending-items/` ToC-read sections) — relay this proposal there per the two-repo workflow.

---

## 8. Requirement delta preview

### ADDED

- Multi-select "principal Science Program" field, options = primary project's SP mapping (today's picker is already multi-capable; the rule that options come only from the primary project's mapping is restated and kept).
- Per-SP "Does this result align with the Program's TOC indicators?" Yes/No.
- Result-type → allowed-TOC-levels rule (CapSharing/InnovDev → `OUTPUT`; Policy → `OUTCOME` + `EOI`).
- Cascading Level → HLO → Indicator dropdowns per SP, sourced from lambda-toc via the ARI backend.
- Contribution panel per SP: read-only unit of measure + active-year target, editable quantitative contribution.
- Indicator-type filter (indicator `type_value` must match the result type) — pending OQ-V2-2.
- Live-version gate: mapping only for 2026; blocked for 2027+.

### MODIFIED

- ToC catalog source: PRMS public-results-framework `(program, areaOfWork)` → lambda-toc `(category, initiative)`.
- HLO/indicator presentation: modal tree picker + cards → inline dropdowns per SP block.
- Contribution body: polymorphic 5-type / `{reason_code, quantitative_contribution_value}` (OQ-IM-1) → per-SP `{ sp, level, hlo, indicator, quantitative_contribution }`.
- AOW: from grouping/selection dimension → display metadata only (`wp_short_name` prefix on HLO options, e.g. "AOW01 — HLO1…").

### REMOVED

- HLO selection modal (REQ-BIL-IM-02/-03 family) and AI "VIEW HIGH LEVEL OUTPUTS" card.
- AOW enumeration via CLARISA cgiar-entities for this flow; `(SP, AOW)` pair fan-out + `aow_status`/`no_aow_mappings` empty states.
- Reason / "Why is this being reported?" dropdown (absent from new mockups — confirm in OQ-V2-4).
- Multi-indicator checkbox selection per AOW (replaced by one indicator per SP block — see OQ-V2-3).

---

## 9. Approach options

**A. Enhance the existing `indicator-mapping` spec in place.**
Keep the spec lineage and patch requirements. ✗ Rejected: nearly every requirement, mockup reference, and the gating OQ would be rewritten; traceability becomes archaeology.

**B. Archive both active specs; new spec `toc-mapping-v2`; backend proxies lambda-toc. (Recommended)**
Clean REQ/T ID space wired to the new mockups and endpoint; FE keeps talking only to the ARI backend (consistent with `detailed-design.md` HTTP rules, keeps caching/resilience server-side, avoids a second external origin + CORS in the SPA); salvages the shipped alignment plumbing.

**C. Archive specs; FE calls lambda-toc directly.**
One less backend change. ✗ Rejected: breaks the "all HTTP through `ApiService` → ARI backend" pattern, duplicates the result-type/level rule in two places, loses server-side caching, and couples the SPA to an external host that (as observed today) has DNS quirks.

---

## 10. Recommended approach

Option **B**, with this salvage list from the shipped code:

| Keep | Retire |
| --- | --- |
| Alignment GET/PATCH + `has_contribution` + multi-select SP picker + `unknown_sp_codes` / 409 handling | `HloSelectionModalComponent`, modal session state, Cancel-confirm dialog |
| `mapping_status` / PRMS-sourced / read-only gates | `(SP, AOW)` pair DTOs (`BilateralHlosPair`, `aow_status`), `no_aow_mappings` states |
| `materializeRows`-style wire→view seam (reshaped for the new DTO) | AOW sidebar grouping, flat indicator table, disabled-row primitive (re-evaluate under new UX) |
| BE: result → contract → `bilateral_project_mapping` → CLARISA project → SP chain | BE: AOW enumeration + PRMS toc-results client (AOW form) |

Sequencing (each its own `/sdd-specify` task group): backend catalog proxy + new DTO → FE read flow (dropdown cascade) → write flow (per-SP persistence) → version gate + cleanup/archive.

---

## 11. Risks, dependencies, and open questions

| ID | Item | Type |
| --- | --- | --- |
| OQ-V2-1 | **Level enum confirmation**: `OUTPUT` / `OUTCOME` / `EOI` verified empirically for SP01; confirm with CLARISA/ToC team these are the canonical category values and stable across SPs. | OQ |
| OQ-V2-2 | **Indicator type filter vs mockups**: meeting says filter indicators to the result's type, but the mockups list indicators of mixed types (e.g. a Capacity Sharing result showing knowledge-product indicators), and SP01/OUTPUT has only **1** capacity-sharing-type indicator — a strict filter often yields near-empty dropdowns. Needs BA ruling (filter strictly / include `custom` / no filter). | OQ — gating |
| OQ-V2-3 | **Cardinality per SP**: rules text and mockups show **one** (Level, HLO, Indicator) tuple per SP. Confirm a user never needs N indicators per SP (old model allowed many). | OQ — gating |
| OQ-V2-4 | **Reason field**: absent from new mockups. Confirm OQ-IM-1's reason/justification requirement is formally dropped. | OQ |
| OQ-V2-5 | **Result types beyond the three named** (knowledge product, OICR, …): is ToC mapping hidden for them, or do they have level rules too? | OQ |
| OQ-V2-6 | **Target year**: mockup copy says "2025 target"; meeting says hardcode 2026. Assume target = live-version year (2026) from `targets[]`; confirm. | OQ |
| OQ-V2-7 | `EOI` results carry `wp_short_name: null` — HLO dropdown label needs a no-AOW variant. | Design note |
| OQ-V2-8 | lambda-toc has **no auth** and answered from CloudFront; confirm SLA/stability and whether ARI backend needs a fallback/cached snapshot. Local DNS failed to resolve the host today (resolved via 8.8.8.8) — worth flagging to infra. | Risk |
| OQ-V2-9 | Persistence model for per-SP alignments (new table vs reshaping existing mapping rows) — backend-repo decision; FE only needs the envelope. | Dependency |
| OQ-V2-10 | Contributing-project SPs (Nicolette) and registry/ToC versioning (Enrico) may reshape this flow later — keep the per-SP block component project-agnostic. | Risk |
| DEP-1 | Wednesday demo for Fabio expects something working in testing — favor shipping the read flow (dropdown cascade) first. | Dependency |
| DEP-2 | New mockups must be exported into `../figma-mockups/` before `/sdd-specify` (they are the UX source of truth). | Dependency |

---

## 12. Success criteria

1. For a Capacity Sharing result on a project mapped to SP01+SP03, the user can select both SPs and configure SP01 → HLO A → Indicator X → 10 and SP03 → HLO B → Indicator Y → 25; saving one never alters the other.
2. Level dropdown options follow the result-type rules exactly (CapSharing/InnovDev: HLO only; Policy: Intermediate Outcome + 2030 Outcome only).
3. HLO/indicator options for (SP01, OUTPUT) match the lambda-toc response (22 HLOs, AOW-prefixed labels), with unit of measure and 2026 target rendered from `unit_messurament`/`targets[]`.
4. No client or backend code path calls `public-results-framework/toc-results` or enumerates AOWs for this flow.
5. Results with live version ≠ 2026 cannot create or edit ToC mappings.
6. Old specs archived under `docs/specs/archive/` with pointers; suite green; C-1…C-6 respected (lazy standalone, tokens, WCAG AA on changed screens).

---

## 13. Next step

```text
/sdd-specify bilateral-module/toc-mapping-v2
```

(After approval: export the three new mockups into `../figma-mockups/`, archive `indicator-mapping` + `hlo-grouped-mapping` via `/sdd-archive`, and relay this proposal to the backend-repo session for its mirror spec.)

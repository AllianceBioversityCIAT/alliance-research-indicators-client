# Open Questions for BA / Backend — Bilateral Module / Indicator Mapping

> **Audience**: BA, backend dev, designer (if available).
> **Purpose**: surface three product / technical decisions that block ~75% of the indicator-mapping (US3 + US4) implementation. Until these are answered, no further code can land beyond the four small pieces already shipped.
> **Read time**: 5–10 minutes (or 15 if you also read §6 backend audit).
> **Status**: requested 2026-05-24 · **updated 2026-05-26** with §6 backend code audit + FE recommended paths (all three → Path A). Awaiting BA + backend decisions.

---

## TL;DR

Three open questions block the indicator-mapping work. The **mockups under `docs/specs/bilateral-module/figma-mockups/` and the backend handoff `docs/specs/bilateral-module/ari-backend-context/frontend-handoff.md` disagree on three points**. The FE is built mockup-first per the project rule that the Figma file is canonical for UX — but each disagreement maps to a concrete backend decision the BA + backend team need to make together. Picking either side per question is fine; what we need is a decision.

| OQ | What needs to be decided | Who decides | Unblocks | FE recommendation (post §6 audit) |
|---|---|---|---|---|
| **OQ-IM-1** | Contribution body shape on the `POST/PATCH /contribution` endpoint | BA + backend | 5 FE tasks | **Path A** — simplify to `{ reason_code, quantitative_contribution_value? }`; deprecate 5 polymorphic handlers |
| **OQ-IM-2** | Where does the **Area of Work (AOW)** grouping come from? | Backend | 3 FE tasks | **Path A** — backend adds `area_of_work` entity + nest in `IndicatorGroupResponse` |
| **OQ-IM-3** | Does `GET .../contribution?lever-code=` exist for edit-mode pre-fill? | Backend | 2 FE tasks | **Path A** — backend adds the GET endpoint |

The proposal that produced this work is [`../proposal.md`](../proposal.md). The mockup-first FE design that ran into these gates is [`./design.md`](./design.md). The full requirements list is [`./requirements.md`](./requirements.md). Visual references live under [`../figma-mockups/`](../figma-mockups/).

---

## 0. Context — what we're building

A Researcher / PI working on a bilateral (W3/CGIAR-funded) result needs to:

1. Declare whether the result contributes to Pool Funding (Yes/No) and pick the Science Programs / Accelerators it contributes to → **already shipped** in the Pool Funding Alignment section (US2).
2. **Map the result to specific High-Level Outputs (HLOs) under those Science Programs**, and record the contribution detail (this spec — US3 + US4).

The mockup-driven flow:

1. User picks SPs → an "AI card" appears with **"VIEW HIGH LEVEL OUTPUTS"** + CTA → opens the **HLO selection modal**.
2. Modal is a **tree picker**: left sidebar lists SPs expanded into **Areas of Work**; right pane shows indicators per active AOW with checkboxes; footer counter + Confirm/Cancel.
3. On confirm, the modal closes and the selected indicators render as **inline cards** on the main alignment form, grouped **SP → AOW → HLO**.
4. Each card has: indicator name + code, status tag, progress bar, **Expected target** (read-only), **Quantitative contribution** (conditional dropdown), **Why is this being reported?** (required dropdown), × removal.
5. On the alignment form's existing **Save** button, the FE diffs persisted vs pending mappings and fires sequential `DELETE → POST → PATCH` per `(indicator_code, lever_code)` pair.

That's the canonical mockup flow. The questions below are about how it should hit the backend.

---

## 1. OQ-IM-1 — Contribution body shape (headline question)

### The conflict

**Mockup card** ([`figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md`](../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md), [`figma-mockups/32472-129409-pool-funding-alignment-filled-with-quantitative.md`](../figma-mockups/32472-129409-pool-funding-alignment-filled-with-quantitative.md)) shows three user-editable fields per HLO mapping:

| Field | Behavior |
|---|---|
| **Expected target** | Read-only. Comes from the catalog (e.g., `20 - NUMBER OF KNOWLEDGE PRODUCTS`). |
| **Quantitative contribution** | Conditional dropdown. Only renders when the indicator's `is_quantitative` flag is true. |
| **Why is this being reported?** | Required dropdown. Free taxonomy (TBD per OQ-IM-4). |

**Backend handoff** ([`ari-backend-context/frontend-handoff.md` §7](../ari-backend-context/frontend-handoff.md#7-type-specific-contribution-payloads-d12)) specifies **5 polymorphic payloads** keyed by `indicator_type`, each with totally different fields:

| `indicator_type` | Fields (verbatim — D12 typos intentional) |
|---|---|
| `capacity_sharing` | `women`, `men`, `non_binary`, `has_unkown_using`, `capdev_term_id`, `capdev_delivery_method_id` |
| `knowledge_product` | `handle`, `knowledge_product_type`, `licence`, `peer_reviewed`, `is_isi`, `accessibility` |
| `policy_change` | `policy_type_id`, `policy_stage_id`, `implementing_organizations[]`, `amount?` |
| `innovation_development` | `innovation_typology: { code }`, `innovation_developers`, `readinness_level_id` |
| `NOOP` | `narrative` (free text) |

**These two specifications don't overlap.** The mockup shows 3 fields; the handoff shows 5 different per-type structures with up to 6 fields each. They describe two different products.

### Why this question matters

It determines:
- What the FE sends in the body of `POST/PATCH /pool-funding-alignment/indicators/:indicatorCode/contribution`.
- Whether the FE needs **5 polymorphic form variants** or **1 unified form**.
- Whether the existing backend handler code under `entities/bilateral/handlers/` (referenced by the handoff) gets used as-is, modified, or deprecated.

### Resolution options

| Path | What it means | FE impact | Backend impact |
|---|---|---|---|
| **(A) Mockups supersede; backend simplifies the body** | The POST/PATCH body becomes the mockup's 3 fields: `{ quantitative_contribution?: number, reason_code: string }` (Expected target is catalog-sourced, not in the body). The 5 polymorphic handlers become dead code or get deferred. | 1 unified form. Less FE complexity. | New simplified body schema; old handlers retired or repurposed. |
| **(B) Mockup card is a wrapper; clicking "Details" opens a polymorphic sub-form** | The mockup's 3 fields are the "summary" view; a deeper button (not in current mockups) opens the 5-type form. | 1 unified summary form + 5 polymorphic sub-forms (more work). | No backend changes; existing handlers stay. |
| **(C) The mockup card IS one of the 5 types — probably `NOOP`** | Reason maps to `narrative`. Quantitative contribution goes into a custom field. The other 4 types are deferred. | 1 form variant (NOOP only) for now; deferred work for the other 4. | No backend changes; only NOOP handler is exercised in v1. |
| **(D) Hybrid: keep the polymorphic body BUT extend it with the mockup's 3 fields** | Body is `{ indicator_type, ...polymorphic-fields, quantitative_contribution?, reason_code }`. Both shapes coexist. | 5 form variants + the 3 mockup fields rendered on every one. | Backend handlers extended to accept + store the new fields. |

### Frontend recommendation

**Option (A)** is the cleanest match to what the mockups actually depict and what reviewers will see in production. The 5 polymorphic types in the handoff predate the mockup set (mockups dated 2026-05-15); they may have been an early backend design that no longer reflects the product intent. **If (A) is wrong**, we need the BA to confirm where the deeper per-type form fits in the user journey — the mockups currently don't show one.

### Impact on the FE if undecided

Five tasks (T-BIL-IM-01, -04, -08, -09, -11) remain `pending — GATED on OQ-IM-1`. The `bodyOf(mapping)` mapper in `BilateralService.saveMappings`, the HLO card's editable fields, and the form-validation logic all depend on this decision.

---

## 2. OQ-IM-2 — AOW (Area of Work) data source

### The conflict

**Mockup** ([`figma-mockups/32471-131617-hlo-modal-empty.md`](../figma-mockups/32471-131617-hlo-modal-empty.md), [`figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md`](../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md)) groups indicators in a **3-level hierarchy**: SP → **AOW** → HLO. AOW examples from the mockup:

- `SP01 - Breeding for Tomorrow`
  - `AOW01 - Market Intelligence`
  - `AOW02 - …`
- `SP02 - Sustainable Farming`
  - `AOW03 - Resilient Soils`
  - …

**Backend handoff** ([`ari-backend-context/frontend-handoff.md` §4.4](../ari-backend-context/frontend-handoff.md#44-get-indicators-panel)) returns `IndicatorGroupResponse[]` grouped **by `lever_code` (SP) only** — no AOW layer:

```ts
{
  lever_code: string;
  lever_name: string;
  indicators: { indicator_code, indicator_name, indicator_type, ... }[];
}[]
```

The mockup README ([`figma-mockups/README.md` §7](../figma-mockups/README.md) OQ-FIG-3) also raises this and asks for BA confirmation on whether AOW is a real taxonomy level.

### Why this question matters

The mockup's modal sidebar IS the SP/AOW tree — that's the primary navigation inside the picker. Without AOW data, the sidebar can't render the mockup's design.

### Resolution options

| Path | What it means | FE impact | Backend impact |
|---|---|---|---|
| **(A) Backend extends the response to include AOW nesting** | `IndicatorGroupResponse` becomes `{ lever_code, lever_name, areas_of_work: { aow_code, aow_name, indicators: [] }[] }`. | FE renders the tree directly. | One-time response-shape extension on `GET .../indicators`. |
| **(B) FE infers AOW from `indicator_code` prefix convention** | E.g., `CR-HL01-001` → `HL01`. Fragile (depends on stable code conventions). | FE does client-side regrouping. | No change. |
| **(C) Separate `GET .../areas-of-work` endpoint** | FE fetches AOW catalog separately + joins client-side via a foreign key on `IndicatorRow`. | More requests, more state. | New endpoint. |
| **(D) Drop AOW from v1 — flatten to SP → HLO only** | Mockup tree simplifies to 2 levels. AOWs absent until catalog stabilizes. | Mockup divergence. Requires designer sign-off. | No change. |

### Frontend recommendation

**Option (A)** — backend extends the response. AOW is a stable taxonomy concept in CGIAR ToC (well-known to PRMS / CLARISA), so adding it to the response is a small, durable backend change. (B) is fragile; (C) doubles request count; (D) creates a visible mockup mismatch.

### Impact on the FE if undecided

Three tasks (T-BIL-IM-01 type, T-BIL-IM-05 modal sidebar, T-BIL-IM-10 inline-card grouping) are gated.

---

## 3. OQ-IM-3 — Edit-mode pre-fill (GET contribution endpoint)

### The conflict

When the user opens an already-mapped HLO card to edit (Reason / Quantitative), the FE needs the existing contribution body to pre-fill the form. Two ways to source it:

**Primary path** (assumed in the FE design): `GET /pool-funding-alignment/indicators/:indicatorCode/contribution?lever-code=…` returns the existing body. This endpoint is **not currently documented** in the handoff.

**Fallback**: extend the panel `GET .../indicators` to include each indicator's existing contribution body inline (`indicator.contribution?: ContributionBody`).

### Why this question matters

Without one of these, edit-mode pre-fill is impossible. The FE could fall back to "always create new" (DELETE + POST instead of PATCH), but that loses the audit trail and is server-incompatible.

### Resolution options

| Path | What it means | FE impact | Backend impact |
|---|---|---|---|
| **(A) Backend adds `GET .../contribution`** | Modal opens → fetch per-indicator body → seed form. Smaller responses on the panel GET. | One extra GET per Edit click. | One new endpoint. |
| **(B) Backend embeds contribution body in the panel GET** | `IndicatorRow.contribution?: ContributionBody`. No extra GET. | Larger panel responses; FE seeds from row data. | One-line response extension. |
| **(C) FE only supports create / delete; no edit** | Every modification is "remove + re-add". | Loses Reason history; awkward UX. | No change. Worst option. |

### Frontend recommendation

**Either (A) or (B)** — both work. (A) is cleaner (panel GET stays light); (B) is faster (fewer requests). Pick whichever the backend team prefers. (C) is not acceptable.

### Impact on the FE if undecided

Two tasks (T-BIL-IM-04 `getContribution` service method, T-BIL-IM-08 HLO card edit-mode pre-fill) are gated.

---

## 4. Non-gating open questions (decide during design, not blocking)

These don't block tasks but the BA should weigh in eventually.

- **OQ-IM-4** — Source of the "Why is this being reported?" dropdown option list. Per-indicator from the catalog, or a fixed CLARISA taxonomy?
- **OQ-IM-5** — Source of the "Quantitative contribution" dropdown option list. Per-indicator from the catalog (likely — since units differ per indicator).
- **OQ-IM-6** — Where does the `is_quantitative` flag live on the indicator? (Mockup `32472:129409` implies it's a per-indicator field; we need the field name.)
- **OQ-IM-7** — When mappings already exist, does the AI card collapse to a thin "Manage HLO mappings" link, or stay as a full card? *(Design intent.)*
- **OQ-IM-9** — Where does the **disabled-indicator reason text** come from? Per the mockup `33563:138613`, each disabled row has a different reason; that means the backend needs to expose a per-row `disabled_reason: string | null`.
- **OQ-FIG-5** — The mockup CTA button says `Upload file` (likely a copy-paste artifact). We're using `View HLOs` in code. Confirm the final copy.

---

## 5. How to respond

For each of OQ-IM-1, -2, -3, the BA + backend dev together should pick one of the labeled options (A/B/C/D) and write a one-sentence rationale. Capture the decision by editing [`./requirements.md` §12 "Open questions"](./requirements.md#12-assumptions--open-questions) directly, OR replying in whatever channel the team uses (Slack / Jira AC-1594 thread / etc.) and we'll fold the answer into the spec.

Once all three are answered, the FE can start T-BIL-IM-01 (backend verification + interfaces + 5 ApiService methods) which unblocks the rest of the chain. ETA from "OQs answered" to "indicator-mapping shipped end-to-end" is roughly **10–14 working days** of FE work (11 sequential tasks; some can parallelize) plus whatever backend changes the chosen options require.

---

## 6. Backend code findings — 2026-05-26 (FE-side audit + recommendations)

> **Update — 2026-05-26.** Two days after sending this brief, the FE team ran a direct audit of the **ARI backend repo** (`alliance-research-indicators-main/server/researchindicators/src/domain/entities/bilateral/`, branch `AC-1594-bilateral-module`) to ground the three Open Questions in actual code rather than the snapshot frontend-handoff (which is dated 2026-05-19, ~1 week old). The findings sharpen the conflict and reveal **three real backend modeling gaps** beyond what's described in the snapshot. Posted here so the BA + backend team can react with full context.

### 6.0 Method

Read-only audit of the bilateral entity tree on `AC-1594-bilateral-module`. No code modified. Specific files inspected:

- `bilateral.controller.ts` — route registration
- `bilateral.service.ts` — service-layer logic, handler dispatch, `listIndicators`
- `dto/upsert-indicator-mapping.dto.ts` — request/response DTOs
- `dto/list-indicators-query.dto.ts` — panel-GET response shape
- `handlers/{capacity-sharing,knowledge-product,policy-change,innovation-development,noop}.handler.ts` — per-type handlers
- `handlers/bilateral-indicator-type-handler.interface.ts` — handler contract
- `entities/result-pool-funding-indicator-mapping.entity.ts` — TypeORM entity for stored mappings
- `entities/indicator.entity.ts` — indicator catalog row shape
- `src/domain/tools/socket/server.gateway.ts` — socket event emitter

### 6.1 OQ-IM-1 — Contribution body shape — findings

**What the backend actually says today:**

| Surface | Today | Evidence |
|---|---|---|
| `POST/PATCH /pool-funding-alignment/indicators/:indicatorCode/contribution` accepts | `ContributionDto = { indicator_type, type, [key: string]: unknown }` — **fully open polymorphic** | `bilateral.controller.ts:171-244` + `dto/upsert-indicator-mapping.dto.ts:3-11` |
| Dispatch by `indicator_type` | Yes — 5 handlers registered in `bilateral.service.ts:76-80` and dispatched in `getContributionHandler()` | `bilateral.service.ts` |
| `capacity_sharing` required fields | `women, men, non_binary, has_unkown_using, capdev_term_id, capdev_delivery_method_id` | `handlers/capacity-sharing.handler.ts:25-33` |
| `knowledge_product` required fields | `handle, knowledge_product_type, licence, peer_reviewed, is_isi, accessibility` | `handlers/knowledge-product.handler.ts:24-32` |
| `policy_change` required fields | `policy_type_id, policy_stage_id, implementing_organizations[]` (`amount?` optional) | `handlers/policy-change.handler.ts:24-36` |
| `innovation_development` required fields | `innovation_typology.code, innovation_developers, readinness_level_id` | `handlers/innovation-development.handler.ts:24-38` |
| `NOOP` required fields | `narrative` (free text) | `handlers/noop.handler.ts:14-17` |
| Stored mapping entity columns | type-specific FKs (`result_capacity_sharing_id`, `result_knowledge_product_id`, `result_policy_change_id`, `result_innovation_dev_id`) + `other_contribution_narrative` (NOOP) | `entities/result-pool-funding-indicator-mapping.entity.ts:17-135` |
| `reason_code` column on the mapping entity | **NOT present** | (absence) |
| `quantitative_contribution` column on the mapping entity | **NOT present** | (absence) |

**Bottom line**: the snapshot handoff §7 is current. The 5 polymorphic handlers are alive and the entity stores type-specific FK relations. The mockup's 3-field shape (`Expected target` read-only / `Quantitative contribution` / `Why is this being reported?`) **maps to nothing in the current backend** — it's not a simplification of the current shape, it's a different model. No NOOP-only shortcut: NOOP's only field is `narrative`, which doesn't carry a `quantitative_contribution` value.

**FE recommendation — Path (A) "Mockups supersede; backend simplifies"**

- Add columns to `ResultPoolFundingIndicatorMapping`: `reason_code: string` (NOT NULL) and `quantitative_contribution_value: number | null` (NULL allowed; only set when `is_quantitative=true` on the indicator).
- Reshape POST/PATCH body to `{ reason_code: string, quantitative_contribution_value?: number }`. `indicator_type` becomes a discriminator the backend already infers from the indicator catalog (not user input).
- The 5 polymorphic handlers + their per-type tables (`result_capacity_sharing`, `result_knowledge_product`, etc.) are **deferred or deprecated** in v1. They can stay in code as dead branches and be removed later, OR be repurposed for a future "Details" sub-form (which isn't in the mockups today).
- Rationale: the mockups went through the design QA cycle and represent the current product intent. The 5-type model predates them (it's an early backend design from before the mockup set was approved on 2026-05-15). One unified form per HLO card is what users will see and what reviewers will approve. The per-type richness can come back later as a deeper drill-down if the business reverses, but it doesn't need to ship in US3/US4.

**Backend implications (Path A)**

- ~1 migration: `ALTER TABLE result_pool_funding_indicator_mapping ADD COLUMN reason_code VARCHAR(50) NOT NULL DEFAULT 'unspecified'`; `ADD COLUMN quantitative_contribution_value NUMERIC NULL`.
- `ContributionDto` simplifies to `{ reason_code, quantitative_contribution_value? }`.
- The 5 handlers can be replaced by one method that writes the two new columns directly. **OR** keep the handlers + treat them as inert (the controller stops invoking the per-type ones).
- Validation moves from "type-specific required fields" to "`reason_code` must be in the reason taxonomy"; the taxonomy itself is OQ-IM-4 (still non-gating but needs the BA to pick a source).
- No data migration required if v1 ships before any production data exists. If production already has rows, the new `reason_code` column needs a backfill — defer the decision to the migration PR.

### 6.2 OQ-IM-2 — AOW (Area of Work) data source — findings

**What the backend actually says today:**

| Surface | Today | Evidence |
|---|---|---|
| `GET /pool-funding-alignment/indicators` response shape | `IndicatorGroupResponse[] = { lever_code, lever_name, indicators[] }` — **no AOW layer** | `bilateral.service.ts:369-404` + `dto/list-indicators-query.dto.ts:32-36` |
| Any `area_of_work` / `aow` / `AreaOfWork` entity, table, or column | **Zero references** anywhere under `src/domain/` | `grep -r "area.of.work\|area_of_work\|aow\|AreaOfWork" src/domain` returned no matches |
| Any FK on indicator → AOW | **Not present** | `entities/indicator.entity.ts` has no AOW reference |
| Separate `GET /areas-of-work` endpoint | **Does not exist** | controller search |
| `indicator_code` prefix convention | Not enforced as a parsable identifier in code | (inspected the entity; codes are opaque strings) |

**Bottom line**: AOW is **genuinely unmodeled** in the backend. There is no field to read, no convention to parse, no FK to join on. The mockup's three-level tree (SP → AOW → HLO) cannot render today regardless of FE work.

**FE recommendation — Path (A) "Backend extends the response to include AOW nesting"**

- Add an `area_of_work` entity + `area_of_work` table with at minimum: `aow_code: string PK, aow_name: string, lever_code: string FK → levers`.
- Add `aow_code: string FK NOT NULL` on the `indicator` entity (or a junction `indicator_area_of_work` if an indicator can span AOWs — the BA needs to confirm whether this is many-to-one or many-to-many).
- Extend `IndicatorGroupResponse` to nest: `{ lever_code, lever_name, areas_of_work: { aow_code, aow_name, indicators: [] }[] }`.
- AOW is a stable CGIAR ToC concept (PRMS / CLARISA already model it), so the entity should align with whatever upstream source it comes from — confirm during the backend implementation PR. PRD C-3 (CLARISA-owned vocabularies) likely applies.
- Rationale: AOW is the modal's primary navigation. Without it, the SP → AOW → HLO sidebar can't render; flattening to SP → HLO (Path D) would require designer sign-off and would diverge visibly from the approved mockup. (B) — code-prefix inference — is fragile (the FE would silently break on any indicator code that doesn't match the convention, including legacy data). (C) — separate AOW endpoint — doubles request count without benefit.

**Backend implications (Path A)**

- 1 migration for the new entity + FK on `indicator`.
- 1 service change: `listIndicators` groups by `(lever_code, aow_code)` instead of just `lever_code`.
- 1 DTO change: `IndicatorGroupResponse` response shape.
- 1 ingestion question (NOT this PR's concern): where do the AOW rows themselves come from? CLARISA sync? Manual seed? PRMS pull? — surface for the BA to answer when scheduling the migration.

### 6.3 OQ-IM-3 — Edit-mode pre-fill (GET contribution endpoint) — findings

**What the backend actually says today:**

| Surface | Today | Evidence |
|---|---|---|
| `GET /pool-funding-alignment/indicators/:indicatorCode/contribution?lever-code=` route | **Does not exist** | `bilateral.controller.ts` — no `@Get('indicators/:indicatorCode/contribution')` |
| Panel-GET `IndicatorPanelIndicatorResponse` shape | `{ indicator_code, indicator_name, indicator_type, target_description, is_active, is_mapped, is_stale }` — no `contribution` field | `dto/list-indicators-query.dto.ts:22-30` |
| `MappingResponse` returned on POST/PATCH | `{ result_code, lever_code, lever_name, indicator_code, indicator_type, is_stale }` — no contribution body | `dto/upsert-indicator-mapping.dto.ts:13-20` |
| Any service method returning a single contribution | **Not present** | searched `bilateral.service.ts` |

**Bottom line**: no GET endpoint, no embedded body. Edit-mode pre-fill is impossible today.

**FE recommendation — Path (A) "Backend adds GET .../contribution"**

- Add a `GET /pool-funding-alignment/indicators/:indicatorCode/contribution?lever-code=...` route returning the stored contribution body in the same shape the POST/PATCH body uses (post §7.1 simplification: `{ reason_code, quantitative_contribution_value? }`).
- Cheapest backend work of all three OQs — a single repository `findOne` + a thin DTO denormalize + a controller route. No new migration.
- Rationale: keeps the panel-GET response light (it stays the catalog-listing endpoint). The contribution body only needs to be fetched when the user clicks edit on an HLO card — lazy is good.

**Backend implications (Path A)**

- 1 new route + 1 new service method + 1 new DTO (`ContributionResponse`, identical to the simplified `ContributionDto`).
- No migration. No data change. Lowest-risk of the three.

### 6.4 Bonus discoveries (related backend gaps)

While auditing the entities, the FE found three additional fields the mockup relies on that don't exist in the backend today. Flagging here for the BA + backend team to incorporate into the same backend PR as OQ-IM-1's simplification:

| Mockup field | Backend status | Recommended action |
|---|---|---|
| `is_quantitative: boolean` on indicator (drives conditional rendering of the Quantitative dropdown — OQ-IM-6) | **Not on `indicator.entity.ts`** | Add `is_quantitative: boolean NOT NULL DEFAULT false` to the `indicator` table. Source of truth: the indicator catalog (when it ships via the ToC sync — currently empty). |
| `disabled_reason: string \| null` on `IndicatorPanelIndicatorResponse` (drives the inline "this indicator cannot be mapped because…" callout — OQ-IM-9) | **Not on the response DTO** | Add a per-row `disabled_reason: string \| null` to `IndicatorPanelIndicatorResponse`. Server-side validation computes it (e.g., "already mapped to a sibling result", "stale"). Client renders verbatim. |
| `is_stale: boolean` on indicator | ✅ Present on `ResultPoolFundingIndicatorMapping:93-99` but NOT on `IndicatorPanelIndicatorResponse` | Surface `is_stale` on the panel response DTO too, so the modal can show the stale-disabled treatment without needing a second fetch. |

The socket event `result.pool-funding-alignment.changed` was confirmed live in `src/domain/tools/socket/server.gateway.ts:11-12`. No gap there.

### 6.5 Summary table — what we're asking from the backend team

| OQ | FE recommended path | Backend work required | Effort estimate (rough) |
|---|---|---|---|
| **OQ-IM-1** | (A) Simplify contribution body to `{ reason_code, quantitative_contribution_value? }`; deprecate per-type handlers | 1 migration (2 columns on `result_pool_funding_indicator_mapping`) + DTO + service + controller updates; tests | M (2–3 days) |
| **OQ-IM-2** | (A) Add `area_of_work` entity + nest in `IndicatorGroupResponse` | 1 migration (new table + FK on indicator) + service grouping + DTO; ingestion source TBD | M–L (3–5 days; depends on AOW seed source) |
| **OQ-IM-3** | (A) Add `GET .../contribution?lever-code=` route | 1 service method + 1 controller route + 1 DTO; no migration | S (½ day) |
| **Bonus** | Add `is_quantitative` + `disabled_reason` + `is_stale` on panel response | 1 migration (`is_quantitative` on indicator) + DTO updates + computed-property logic for `disabled_reason` | S (½–1 day) |

Total: ~6–10 backend-dev days. FE work resumes the day OQ-IM-1's reason_code shape is locked (T-BIL-IM-01 backend-verification + interfaces can land that same day in parallel with the migration).

### 6.6 How the BA / backend should respond

Two equivalent paths to capture the decision — either is fine:

1. **In-spec**: edit [`./requirements.md` §12 "Open questions"](./requirements.md#12-assumptions--open-questions) directly. Replace each `OQ-IM-1/2/3` block with `RESOLVED — Path X — <one-sentence rationale>`.
2. **Out-of-spec**: reply via the AC-1594 Jira thread / Slack channel with the per-OQ decision. The FE folds the answer into `./requirements.md` §12 in the same PR that picks up the work.

Once **OQ-IM-1 is locked**, the FE can start T-BIL-IM-01 (backend verification + interfaces + 5 ApiService methods) on the day the backend migration PR opens — they don't need to wait for the migration to merge. Lock OQ-IM-2 and -3 together with -1 ideally; if -1 is decided first, the FE will start and pause again at T-BIL-IM-05 (modal sidebar) which depends on -2.

---

## 7. References

- Proposal: [`../proposal.md`](../proposal.md)
- Spec docs: [`./requirements.md`](./requirements.md) · [`./design.md`](./design.md) · [`./tasks.md`](./tasks.md)
- Execution log so far: [`./execution.md`](./execution.md)
- **Figma mockups (authoritative for UX shape — read these BEFORE answering)**:
  - [`../figma-mockups/README.md`](../figma-mockups/README.md) — index + token alignment + roll-up of OQ-FIG-*
  - [`../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md`](../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md) — AI card
  - [`../figma-mockups/32471-131617-hlo-modal-empty.md`](../figma-mockups/32471-131617-hlo-modal-empty.md) — HLO modal tree (most relevant to OQ-IM-2)
  - [`../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md`](../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md) — filled state with HLO cards (most relevant to OQ-IM-1)
  - [`../figma-mockups/32472-129409-pool-funding-alignment-filled-with-quantitative.md`](../figma-mockups/32472-129409-pool-funding-alignment-filled-with-quantitative.md) — quantitative variant (also OQ-IM-1)
  - [`../figma-mockups/33563-138613-hlo-modal-disabled-reason.md`](../figma-mockups/33563-138613-hlo-modal-disabled-reason.md) — disabled indicator reason (OQ-IM-9)
- Backend handoff: [`../ari-backend-context/frontend-handoff.md`](../ari-backend-context/frontend-handoff.md) — §4.4 panel GET (relevant to OQ-IM-2), §4.5 contribution endpoints (relevant to OQ-IM-1 + OQ-IM-3), §7 type-specific payloads (the conflict source for OQ-IM-1)
- Jira: [AC-1594 (US2)](https://cgiarmel.atlassian.net/browse/AC-1594), [AC-1439 (US3)](https://cgiarmel.atlassian.net/browse/AC-1439), [AC-1440 (US4)](https://cgiarmel.atlassian.net/browse/AC-1440)

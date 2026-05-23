# Open Questions for BA / Backend — Bilateral Module / Indicator Mapping

> **Audience**: BA, backend dev, designer (if available).
> **Purpose**: surface three product / technical decisions that block ~75% of the indicator-mapping (US3 + US4) implementation. Until these are answered, no further code can land beyond the four small pieces already shipped.
> **Read time**: 5–10 minutes.
> **Status**: requested 2026-05-24.

---

## TL;DR

Three open questions block the indicator-mapping work. The **mockups under `docs/specs/bilateral-module/figma-mockups/` and the backend handoff `docs/specs/bilateral-module/ari-backend-context/frontend-handoff.md` disagree on three points**. The FE is built mockup-first per the project rule that the Figma file is canonical for UX — but each disagreement maps to a concrete backend decision the BA + backend team need to make together. Picking either side per question is fine; what we need is a decision.

| OQ | What needs to be decided | Who decides | Unblocks |
|---|---|---|---|
| **OQ-IM-1** | Contribution body shape on the `POST/PATCH /contribution` endpoint | BA + backend | 5 FE tasks |
| **OQ-IM-2** | Where does the **Area of Work (AOW)** grouping come from? | Backend | 3 FE tasks |
| **OQ-IM-3** | Does `GET .../contribution?lever-code=` exist for edit-mode pre-fill? | Backend | 2 FE tasks |

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

## 6. References

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

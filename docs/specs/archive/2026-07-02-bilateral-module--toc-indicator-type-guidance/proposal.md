# Proposal — ToC Mapping: Indicator-Type Guidance (result type ↔ indicator type)

> Lightweight `/sdd-propose` proposal. The reviewable intent layer before `/sdd-specify` produces requirements/design/tasks.

---

## 1. Document Control

| Field | Value |
| --- | --- |
| Spec path | `bilateral-module/toc-indicator-type-guidance` |
| Proposal path | `docs/specs/bilateral-module/toc-indicator-type-guidance/proposal.md` |
| Author | STAR (`AC-1594-bilateral-module`) |
| Status | APPROVED (2026-07-02) |
| Created | 2026-07-02 |
| Frontend repo | `alliance-research-indicators-client` (Angular STAR client) — **primary work (Phase 1 is FE-only)** |
| Backend repo | `alliance-research-indicators-main` (NestJS) — no changes in Phase 1; Phase 2 (AI) would need a new suggestion endpoint |
| Parent spec | `docs/specs/archive/2026-06-17-bilateral-module--toc-mapping-v2/` — this proposal **resolves OQ-1/OQ-2 (A-4, D-5)**: the deliberately-unfiltered indicator dropdown |
| Data source analyzed | `https://clarisatest-lambda.ciat.cgiar.org/api/toc-integration/toc/results/category/{LEVEL}/initiative/{SP}` (2026-07-02 sample, 8 SPs OUTPUT + 3 SPs OUTCOME/EOI) |

---

## 2. Intent

When a user aligns a result with a Program's ToC (Pool Funding Alignment section), help them pick an **indicator whose type matches their result type** (e.g. a Capacity Sharing for Development result → a "Number of people trained (capacity sharing for development)" indicator) — and when no matching indicator exists in the chosen HLO, **guide them to where compatible indicators live or make the cross-type choice a conscious, flagged decision** instead of a silent one.

Business rule agreed with product (2026-07-02): **guide, don't block.** Cross-type mappings remain saveable.

---

## 3. Problem / Current Behavior

- The indicator dropdown in `sp-toc-alignment-block.component.ts:155` (`indicatorOptions`) lists **every** indicator of the selected HLO, labeled only by `indicator_description`. This was a deliberate v2 decision (D-5) pending a business rule (OQ-1/OQ-2).
- Every `TocCatalogIndicator` already carries `type_value` (proxied from lambda-toc `type_value`/`type_name`, which are identical in the sample), but the client never reads it.
- Users reporting e.g. a **Capacity Sharing** result routinely land on HLOs whose indicators are all of other types ("Number of innovations…", "Number of knowledge products") and either pick a wrong-type indicator silently or get stuck.

**Live data (2026-07-02, test lambda) — why a hard filter is not viable:**

| Level | Sample | Distribution of `type_value` |
| --- | --- | --- |
| OUTPUT (8 SPs) | 324 indicators | 119 knowledge products · 110 innovations · **49 capacity sharing** · 44 `custom` · 2 missing |
| OUTCOME (3 SPs) | 79 indicators | **25 missing** · 25 Innovation Use · 14 `custom` · 10 Policy Change · 5 free-text (`_n_…`) |
| EOI (3 SPs) | 40 indicators | **21 missing** · 14 Innovation Use · 5 other |

Per-HLO coverage for a Capacity Sharing result at OUTPUT: SP01 → 1/22 HLOs have a compatible indicator, SP04 → 1/30, SP06 → ~3/25 (SP05 is the outlier at 18/22). A strict type filter would leave **most HLOs with zero options** and block saves. At OUTCOME/EOI the taxonomy is too incomplete (1/3 untyped, free-text `_n_*` types) to filter on at all.

---

## 4. Proposed Outcome

### Phase 1 — Deterministic guidance (FE-only, this spec's deliverable)

Using the `type_value` data the client already receives:

1. **Grouped indicator dropdown.** Options grouped as **"Recommended for \<result type\>"** (type match + `custom` wildcard) and **"Other indicators"**, each option showing a small type badge. Nothing is removed; ordering and grouping do the guiding.
2. **HLO compatibility hints.** In the HLO dropdown, mark HLOs that contain at least one compatible indicator (subtle tag/dot). The whole catalog is already loaded client-side (D-8a), so this is a pure computed.
3. **No-match guidance panel.** If the selected HLO has no compatible indicator, show a non-blocking inline note: "None of this High Level Output's indicators are typed for *Capacity Sharing*. HLOs with compatible indicators in SP06: AOW02 – …, AOW05 – …" (clickable to switch, with the existing reset-confirmation rules).
4. **Conscious cross-type selection.** Selecting a non-matching indicator shows a soft inline warning stating both types ("This indicator is typed *Number of innovations*; your result is *Capacity Sharing for Development*"). Save remains enabled; the saved payload is unchanged (`indicator_id`).
5. **Compatibility matrix as a reviewed constant.** One FE map `result_type → compatible type_value[]`, BA-confirmed, with rules: `custom` = wildcard (compatible with every result type); missing/`_n_*` types = "unclassified" (never recommended, never warned against — shown neutrally). At OUTCOME/EOI, where typing is sparse, guidance degrades gracefully to "unclassified" neutrality instead of false warnings.

### Phase 2 — AI suggestion (optional, evidence-gated, separate spec)

**Assessment on "is AI necessary": No — not for this problem's core.** The mismatch is *structural* (compatible indicators simply don't exist in most HLOs) and the compatibility rule is *deterministic* (a 5-row type matrix). AI cannot create missing indicators, and a lookup table needs no model. Where AI *would* add value is narrower: semantically ranking candidates when the type signal is absent (the 46 untyped + 44 `custom` + free-text indicators) by comparing the result's title/description against `indicator_description`, and phrasing a rationale for a suggested cross-type mapping. That requires a new AI/backend endpoint (the existing text-mining service is scoped to document→result extraction), adds latency/cost, and a wrong suggestion in official reporting has real cost.

**Gate:** ship Phase 1, observe. Build Phase 2 only if cross-type mappings or "no compatible indicator" dead-ends remain frequent (measure via saved alignments joined with catalog types, or user feedback). Phase 2 sketch kept in §9 Option C so the door stays open without committing now.

---

## 5. Scope

**In scope (Phase 1, frontend only):**

- `sp-toc-alignment-block.component.ts` — grouped `indicatorOptions` (PrimeNG `p-select` option groups), type badges, mismatch warning, no-match guidance panel, HLO compatibility hint.
- A compatibility-matrix constant + pure helper (result type string ↔ `type_value` classes), unit-tested against fixture catalogs.
- `bilateral.service.ts` / interfaces — no wire changes; possibly a small computed helper exposing "compatible HLOs per SP".
- The result's own type is read from data already on the page (result envelope `result_type` on the catalog response — backend-owned enum key, per toc-mapping-v2 design).
- Copy in EN (platform language), following existing alert/hint styles of the section.

**Out of scope for Phase 1 (explicitly):**

- Any backend/contract change (the catalog payload already suffices).
- The AI suggestion endpoint and its UI (Phase 2, separate proposal/spec if the gate is met).
- Blocking validation or mandatory justification text for cross-type mappings (rejected for now; revisit with M&E if data shows abuse).
- Fixing the upstream taxonomy (missing `type_value` at OUTCOME/EOI, `_n_*` free-text types) — that's a CLARISA/ToC data-quality issue to **report upstream**, not patch in the client.

---

## 6. Non-Goals

- Not changing which levels a result type may use (`allowed_levels` stays backend-owned).
- Not re-filtering HLOs away — every HLO stays selectable.
- Not persisting any new field on save (no `is_cross_type` flag in Phase 1; derivable later by joining `indicator_id` → catalog type).
- Not touching the center-admin bilateral mapping page (different feature, same module name).

---

## 7. Affected Users, Systems, And Specs

- **Users:** result submitters filling Pool Funding Alignment (all result types; Capacity Sharing is the worst-served today).
- **Code:** `pool-funding-alignment/` page + `sp-toc-alignment-block` (main), shared constants, fixtures in `toc-catalog.fixture.ts`.
- **Specs:** resolves OQ-1/OQ-2 (A-4/D-5) of archived `toc-mapping-v2`; no impact on `center-admin-project-mapping`.
- **External:** none in Phase 1 (lambda/backend contracts untouched).

---

## 8. Requirement Delta Preview

### ADDED Requirements

- Indicator dropdown groups options into "Recommended for \<result type\>" / "Other indicators" using a BA-confirmed compatibility matrix; `custom` is wildcard-recommended; untyped/`_n_*` indicators render neutrally ("unclassified"), never warned against.
- Each indicator option displays its type as a badge (or "—" when untyped).
- HLO options indicate whether they contain ≥1 compatible indicator.
- Selecting a type-mismatched indicator shows a non-blocking inline warning naming both types.
- An HLO with zero compatible indicators shows a guidance note listing the SP's compatible HLOs (navigable, respecting existing reset confirmations).

### MODIFIED Requirements

- toc-mapping-v2 line "indicator dropdown shows `indicator_description` only, unfiltered (D-5)" → still unfiltered, now **grouped and badged**; `type_value` moves from "retained, unused" to "consumed by guidance logic".

### REMOVED Requirements

- None. Save gating, payload, and contracts unchanged.

---

## 9. Approach Options

**A — Hard filter by type.** Only compatible indicators listed. *Rejected:* live data shows most HLOs would be empty (SP01: 21/22; SP04: 29/30) and OUTCOME/EOI typing is too incomplete; users get blocked, not guided.

**B — Deterministic guidance UI (recommended).** Group/badge/warn/hint as in §4 Phase 1. FE-only, ships immediately, zero contract risk, honest about taxonomy gaps (neutral "unclassified" class). Smallest safe path that changes user behavior at the moment of choice.

**C — AI suggestion service now.** New endpoint (AI-services or ARI backend): input result title/description/type + candidate indicators → ranked suggestions + rationale; UI "Suggest with AI" button in the block. *Deferred:* solves the narrower ambiguity problem, not the structural coverage gap; needs cross-team contract work, latency/cost, and hallucination review for an official reporting tool. Kept as evidence-gated Phase 2.

---

## 10. Recommended Approach

**Option B now; Option C behind the usage-evidence gate.** Rationale: the binding constraint is catalog coverage and a deterministic rule, both fully solvable with data already in the client; AI adds value only at the ambiguous margins and carries integration cost that isn't justified until Phase 1 telemetry says so.

---

## 11. Risks, Dependencies, And Open Questions

| # | Item | Type |
| --- | --- | --- |
| R-1 | Compatibility matrix needs BA sign-off (proposed: CapSharing→"Number of people trained (capacity sharing for development)"; InnovationDev→"Number of innovations (innovation development)"; KnowledgeProduct→"Number of knowledge products"; InnovationUse→"Innovation Use"; PolicyChange→"Number of Policy (Policy Change)"; `custom`→wildcard) | Dependency |
| R-2 | Exact `result_type` enum keys on the catalog envelope must be confirmed against the 5 display names used in `result-ai.constants.ts` (no unified TS enum exists today) | Risk |
| R-3 | OUTCOME/EOI typing is ~1/3 missing on the test lambda — verify production lambda before tuning copy; report taxonomy gaps upstream to the ToC/CLARISA team | Risk / upstream |
| R-4 | `type_value` string matching is exact-string; upstream renames would silently degrade guidance (mitigate: unit tests + neutral fallback, never a crash) | Risk |
| OQ-A | Does M&E want cross-type mappings *measured* (needs a report/query, not a FE change) to feed the Phase 2 gate? | Open question |
| OQ-B | Should the no-match panel offer switching **SP level** too (e.g. "compatible indicators exist at Intermediate Outcome")? Only relevant where `allowed_levels` has >1 entry | Open question |

---

## 12. Success Criteria

- A Capacity Sharing submitter on any SP can, within the section, either find a recommended indicator or see exactly which HLOs have compatible ones — no dead ends, no blocked saves.
- Every cross-type selection is made with the mismatch visibly stated at selection time.
- Zero contract/back-end changes; existing save/read-back behavior and tests keep passing; new guidance logic covered by unit tests over the fixture catalog.
- The team can later quantify cross-type mapping frequency (via indicator_id↔type join) to decide on Phase 2 (AI).

---

## 13. Next Step

```text
/sdd-specify bilateral-module/toc-indicator-type-guidance
```

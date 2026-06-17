> **Snapshot — do not edit in place.**
>
> | Field | Value |
> | --- | --- |
> | Source repo | `alliance-research-indicators-main` (ARI backend) |
> | Source path | `docs/specs/bilateral-module/frontend-data-model.md` |
> | Source branch | `AC-1594-bilateral-module-v2` |
> | Source commit | `48cc3e8c` — *docs(bilateral-module): frontend-data-model + sibling doc syncs* (per the doc's own §7 References) |
> | Source date | 2026-05-27 |
> | Snapshot taken | 2026-05-27 (by STAR / `AC-1594-bilateral-module`) |
> | Purpose | Backend's model explainer for the new per-result SP picker (T-15.11) + AOW-derived HLO panel (T-15.12). Authoritative reference for the FE immediate-wins remediation arc. |
>
> **How to read this file.**
> The body below is a verbatim copy of the backend-authored data-model brief. Relative links inside (`./frontend-handoff.md`, `./pending-items/...`) resolve **inside the ARI backend repo**, not from this location. To follow them, open the source at `alliance-research-indicators-main/docs/specs/bilateral-module/frontend-data-model.md`.
>
> **Why the FE keeps a copy.** The three immediate-wins fixes (SP picker endpoint switch, `is_read_only` union, `unknown_sp_codes` 400 handler) build directly against the contracts described in §4 (view-by-view migration table) here. Mirrored locally so FE execution doesn't round-trip to the backend checkout.

---

# Bilateral module — data model brief for the STAR frontend

> **Audience:** STAR frontend engineers updating the Pool Funding Alignment + HLO/indicator views.
> **Date:** 2026-05-27 (after T-15.11 + T-15.12 landed on `AC-1594-bilateral-module-v2`, commits `92e2fd52` + `907993e7`).
> **Why this doc exists:** the bilateral backend changed the picker contract in three ways the FE needs to know before updating views — picker source is now per-result, AOW is a new concept that lives inside CLARISA, and PRMS owns the HLO/indicator tree. This is the **model explainer**. For the endpoint-level reference, see [`./frontend-handoff.md`](./frontend-handoff.md) §4.6 / §4.7 / §4.8. For the canonical spec, see [`./pending-items/requirements.md`](./pending-items/requirements.md).

---

## 0. TL;DR

The FE currently calls one static endpoint (`/api/tools/clarisa/science-programs`) that returns the same 13 SPs for every result. **That endpoint is no longer the picker source.** Two new per-result endpoints replace it:

| Concern | OLD (still live, but display-only) | NEW (use this for the picker / panel) |
|---|---|---|
| SP picker on Pool Funding Alignment | `GET /api/tools/clarisa/science-programs` (always 13) | `GET /api/v1/results/{numericResultCode}/pool-funding-alignment/science-programs` (0–N, scoped to the result's mapped CLARISA project) |
| HLO / indicator panel | not implemented | `GET /api/v1/results/{numericResultCode}/pool-funding-alignment/hlos-indicators` (PRMS ToC, fanned out per `(SP, AOW)` pair) |

Both new endpoints take **no query parameters** — all the scoping happens server-side from the result's mapped bilateral project. The numeric `resultCode` gotcha: strip the `STAR-` prefix from URLs like `STAR-19793` → pass `19793`.

---

## 1. The mental model

```
                                 ┌────────────────────────────────────┐
                                 │           STAR Result              │
                                 │   result_code: 19793 (STAR-19793)  │
                                 │   platform_code: 'STAR'            │
                                 └──────────────┬─────────────────────┘
                                                │  result_contracts (is_active=1, is_primary=1)
                                                ▼
                                 ┌────────────────────────────────────┐
                                 │       AGRESSO contract             │
                                 │   agreement_id: 'D527'             │
                                 │   funding_type: 'BLR'              │
                                 │   is_pool_funding_contributor: 1   │ ← admin-tagged via /admin/agresso-contracts
                                 └──────────────┬─────────────────────┘
                                                │  bilateral_project_mapping
                                                │  (is_active=1, ONE active row per agreement)
                                                ▼
                                 ┌────────────────────────────────────┐
                                 │     bilateral_project_mapping      │
                                 │   agresso_agreement_id: 'D527'     │ ← admin-created via /admin/bilateral-project-mappings
                                 │   clarisa_project_id: 1            │
                                 └──────────────┬─────────────────────┘
                                                │  CLARISA /api/projects (live read, 5-min cache)
                                                ▼
              ┌─────────────────────────────────────────────────────────────────────────┐
              │                       CLARISA project (id=1)                           │
              │   short_name: 'T-PJ-003262-An innovative approach...'                  │
              │   source_of_funding: 'Bilateral'                                       │
              │   project_mappings_array: [                                            │
              │     ┌────────────────────────────────────────┐                         │
              │     │ Level-1 SP entry  (prefix: "SP")        │ ← the SP picker shows  │
              │     │   smo_code: "SP09",  id: 275           │   ONLY these            │
              │     │   parent_id: null, level: 1            │                         │
              │     │   allocation: 25, status: "Confirmed"   │                         │
              │     └────────────────────────────────────────┘                         │
              │     ┌────────────────────────────────────────┐                         │
              │     │ Level-2 AOW entry (prefix: "AOW")       │ ← the HLO panel uses    │
              │     │   smo_code: "AOW06", id: 412           │   these (PRMS ToC       │
              │     │   parent_id: 267 (→ a parent SP entry) │   keyed by SP × AOW)    │
              │     │   level: 2, status: "Confirmed"        │                         │
              │     └────────────────────────────────────────┘                         │
              │   ]                                                                    │
              └─────────────────────────────────────────────────────────────────────────┘
                                                │  PRMS /api/public-results-framework/toc-results
                                                │  ?program={SP_smo_code}&areaOfWork={AOW_smo_code}
                                                ▼
              ┌─────────────────────────────────────────────────────────────────────────┐
              │                  PRMS ToC payload (per SP × AOW pair)                  │
              │   compositeCode: "SP09-AOW06"                                          │
              │   tocResultsOutcomes: [ { toc_result_id, result_title, indicators } ]  │
              │   tocResultsOutputs:  [ { toc_result_id, result_title, indicators } ]  │
              │   metadata: { total, outcomes, outputs }                               │
              └─────────────────────────────────────────────────────────────────────────┘
```

**Three things make this model different from before:**

1. **The SP picker is per-result, not global.** A result tagged to D527 should see only the SPs that CLARISA actually links to D527's bilateral project — not all 13. If you see all 13, the FE is on the wrong endpoint.
2. **AOW (Area of Work) is a new level of granularity** — it's a CGIAR ToC level-2 entity under each SP. AOW data lives inside CLARISA's `project_mappings_array` (same array as the SPs, just at `level: 2`), keyed back to its parent SP via `parent_id`. The backend derives `(SP, AOW)` pairs from this; the FE doesn't have to.
3. **HLOs/indicators come from PRMS ToC**, not from ARI's local catalog. They're not persisted on our side; the backend fans out one HTTP call per `(SP, AOW)` pair, caches each for 5 min, and returns the grouped result.

---

## 2. Vocabulary glossary

| Term | Definition | Where it lives |
|---|---|---|
| **AGRESSO contract** | The funding contract record. Identified by `agreement_id` (e.g. `D527`). Carries `funding_type` ('BLR' = bilateral) and `is_pool_funding_contributor` (admin-set flag — what powers the POOL FUNDING badge on the Projects page). | `agresso_contracts` table in ARI |
| **bilateral_project_mapping** | The operator-maintained join: which CLARISA bilateral project does this AGRESSO contract correspond to? **Required for the SP picker to scope correctly.** | `bilateral_project_mapping` table in ARI; admin SSR page at `/api/admin/bilateral-project-mappings` |
| **CLARISA project** | A CGIAR portfolio project record. Identified by `id` (integer). Carries `project_mappings_array[]` with both SP-level and AOW-level entries. | CLARISA `/api/projects` — live read, NOT persisted in ARI |
| **Science Program (SP)** | CGIAR top-level program (`SP01..SP13`). On a CLARISA project mapping entry: `level: 1`, `cgiar_entity_type_object.prefix: "SP"`, `parent_id: null`. Twelve possibilities + Genebank = 13 total. | CLARISA upstream + local mirror `clarisa_science_programs` (display-only fallback) |
| **Area of Work (AOW)** | CGIAR level-2 entity under an SP. On a CLARISA project mapping entry: `level: 2`, `cgiar_entity_type_object.prefix: "AOW"`, `parent_id: <SP entry's id>`. Example: `AOW06` with `parent_id: 267` is under SP01 (id 267). | CLARISA upstream only — NO local table, NO admin UI, NOT persisted on the ARI side |
| **HLO (High-Level Output / Outcome)** | PRMS ToC top-level result for a given `(SP, AOW)` pair. PRMS returns these in two buckets: `tocResultsOutcomes` (HLOs in our domain language) + `tocResultsOutputs`. Each carries `indicators[]`. | PRMS `/api/public-results-framework/toc-results?program=&areaOfWork=` |
| **Indicator** | PRMS ToC leaf — what the result actually contributes to. Carries `indicator_id`, `indicator_description`, `target_value_sum`, `progress_percentage`, etc. | Inside each `tocResultsOutcomes[]` / `tocResultsOutputs[]` entry's `indicators[]` |
| **`mapping_status`** | Discriminator on the SP picker response. `"mapped"` = active `bilateral_project_mapping` row exists; `"unmapped"` = it doesn't (and the picker should be empty). | Response field on the new SP picker endpoint |
| **`aow_status`** | Discriminator on the HLO panel response. `"unmapped"` = no mapping row; `"no_aow_mappings"` = mapped but the CLARISA project has no AOW-level entries; `"has_aow"` = pairs derived + PRMS data returned. | Response field on the new HLO panel endpoint |

---

## 3. Concrete walkthrough — D527 → STAR-19793

You're on the Pool Funding Alignment screen for result `STAR-19793` under Project D527. Here's what the FE should call and render, step by step.

### 3.1 Verify the prerequisites (operator side)

| Layer | Where set | Without it |
|---|---|---|
| AGRESSO contract D527 has `is_pool_funding_contributor=1` | Pool Funding admin UI (visible as the POOL FUNDING badge on the Projects page — already done if the badge shows) | The bilateral section won't be eligible — `GET /pool-funding-alignment` returns `eligible: false`. |
| An active `bilateral_project_mapping` row exists for D527 | Admin SSR page at `/api/admin/bilateral-project-mappings` (operators create this manually; one active row per agreement_id, partial-unique enforced server-side) | SP picker returns `mapping_status: "unmapped"` + empty list; HLO panel returns `aow_status: "unmapped"` + empty pairs. |
| The linked CLARISA project has SPs (and optionally AOWs) in its `project_mappings_array[]` | CLARISA team (we don't edit this) | SP picker returns `mapping_status: "mapped"` but empty list; HLO panel returns `aow_status: "no_aow_mappings"` if SPs exist but no AOWs. |

### 3.2 Then call the endpoints

```bash
# SP picker — replaces the call to /api/tools/clarisa/science-programs
GET /api/v1/results/19793/pool-funding-alignment/science-programs

# HLO/indicator panel — new endpoint
GET /api/v1/results/19793/pool-funding-alignment/hlos-indicators
```

⚠️ **Numeric resultCode**: the URL path on the FE is `/result/STAR-19793/pool-funding-alignment`. The backend path param is `19793` (strip the `STAR-` prefix). If you pass `STAR-19793` the backend 404s.

### 3.3 Expected SP picker response (mapped + 2 SPs)

```jsonc
{
  "data": {
    "result_code": "19793",
    "mapping_status": "mapped",
    "clarisa_project": { "id": 1, "short_name": "T-PJ-003262-..." },
    "science_programs": [
      {
        "code": "SP09",            // ← this is what you send back on PATCH sp_codes
        "name": "Scaling for Impact",
        "category": "Scaling programs",
        "color": "#ec4899",
        "icon_key": "SP09",        // → /assets/result-framework-reporting/SPs-Icons/SP09.png
        "allocation": 25            // % chip: "SP09 — 25%"
      },
      {
        "code": "SP10",
        "name": "Gender Equality and Inclusion",
        "category": "Accelerators",
        "color": "#8b5cf6",
        "icon_key": "SP10",
        "allocation": 75
      }
    ]
  },
  "status": 200,
  "description": "Bilateral science programs found"
}
```

### 3.4 Expected HLO panel response (mapped, no AOW = most common today)

```jsonc
{
  "data": {
    "result_code": "19793",
    "mapping_status": "mapped",
    "aow_status": "no_aow_mappings",        // ← the CLARISA project has SPs but no AOW-level entries
    "clarisa_project": { "id": 1, "short_name": "T-PJ-003262-..." },
    "pairs": []                              // empty by design
  }
}
```

> Per the live audit (2026-05-27), **only 3 of 31 Bilateral projects in TEST currently have AOW-level mappings in CLARISA**. The other 28 will land in `aow_status: "no_aow_mappings"`. This is **not an error** — render a distinct empty state explaining that AOW data isn't defined yet in CLARISA for this project.

### 3.5 Expected HLO panel response (when AOWs exist)

```jsonc
{
  "data": {
    "result_code": "19793",
    "mapping_status": "mapped",
    "aow_status": "has_aow",
    "clarisa_project": { "id": 6, "short_name": "L-LTG001-..." },
    "pairs": [
      {
        "program": "SP01",
        "area_of_work": "AOW06",
        "composite_code": "SP01-AOW06",      // use as React key
        "outcomes": [
          {
            "toc_result_id": 6313,
            "category": "OUTCOME",
            "result_title": "3.2. Implementation of science-based soil health practice",
            "result_level_id": 3,
            "indicators": [
              {
                "indicator_id": "5871",
                "indicator_description": "Number of farmers implementing two or more...",
                "unit_messurament": "Number",
                "type_name": "Innovation Use",
                "target_value_sum": "0",
                "actual_achieved_value_sum": 0,
                "target_date": "2025",
                "progress_percentage": "0%"
                // ...more upstream PRMS fields
              }
            ]
          }
        ],
        "outputs": [ /* same shape, category: "OUTPUT" */ ],
        "metadata": { "total": 8, "outcomes": 4, "outputs": 4 }
      }
    ]
  }
}
```

---

## 4. View-by-view migration table

| FE view | Currently calls | Should call | Empty state(s) |
|---|---|---|---|
| **Pool Funding Alignment → SP picker** | `GET /api/tools/clarisa/science-programs` (returns 13) | `GET /api/v1/results/{numericResultCode}/pool-funding-alignment/science-programs` | `mapping_status: "unmapped"` → "Contact admin to link this contract to a CLARISA project." Don't fall back to 13. |
| **Pool Funding Alignment → PATCH submit** | `PATCH /api/v1/results/{numericResultCode}/pool-funding-alignment` with `sp_codes` | same endpoint, but now surface the new 400 error: `errors.unknown_sp_codes: string[]` returned when a code isn't in the per-result list. | Highlight the rejected codes inline. |
| **Pool Funding Alignment → read-only badge** | reads `is_synced_to_prms` | reads `is_read_only` (now a UNION of `platform_code === 'PRMS'` OR `is_synced_to_prms`) | When `is_read_only=true` and the 409 description matches `"Result is PRMS-sourced; bilateral alignment is read-only in STAR"` → show a different message than the "synced" badge ("Owned by PRMS — not editable here"). |
| **Map HLOs / indicators panel** | not built yet | `GET /api/v1/results/{numericResultCode}/pool-funding-alignment/hlos-indicators` | See `aow_status` matrix below. |
| **SP icons / colors / labels in non-picker contexts** (badges, lists, summary cards) | `GET /api/tools/clarisa/science-programs` | **keep using this** — it's the display-only fallback. Just don't drive the picker from it. | Same as today. |

### `aow_status` rendering matrix (HLO panel)

| `aow_status` | What it means | FE rendering |
|---|---|---|
| `"unmapped"` | No active `bilateral_project_mapping` for this result's contract (or no AGRESSO contract). `pairs[]` empty, `clarisa_project` may be null. | Same affordance as the SP picker's "unmapped" — "Contact admin to link this contract." Hide the panel or show the empty state. |
| `"no_aow_mappings"` | Mapped, but the CLARISA project carries only SP-level entries (no AOWs). PRMS cannot answer without an AOW. `pairs[]` empty, `clarisa_project` populated. | Distinct empty state: "This project's HLO/indicator data isn't yet defined at the AOW level in CLARISA." Don't ask the operator to fix anything — it's a CLARISA-side data state. |
| `"has_aow"` | Mapped + ≥ 1 `(SP, AOW)` pair derived. `pairs[]` populated. | Render the tree: `pair → outcomes[]` + `outputs[]` → `indicators[]`. Group by `composite_code` (e.g. "SP01 - AOW06"). |

### Read-only states (Pool Funding Alignment)

| `is_read_only` | `is_synced_to_prms` | Cause | UX |
|---|---|---|---|
| `false` | `false` | Editable — STAR-owned, not pushed yet | Normal edit form |
| `true` | `true` | STAR-owned, already pushed to PRMS | "Synced to PRMS" badge — current behavior |
| `true` | `false` | **PRMS-sourced result** (new gate from R-BIL-071) | NEW: "Owned by PRMS — read-only in STAR" badge. Same disabled inputs as synced. PATCH will 409 with the locked description `"Result is PRMS-sourced; bilateral alignment is read-only in STAR"`. |

---

## 5. Common pitfalls

1. **Falling back to the catalog when "unmapped".** Don't. The whole point of the per-result picker is to prevent users from picking SPs the project doesn't participate in — falling back to 13 reintroduces the bug. If `mapping_status === "unmapped"`, show the "contact admin" affordance.

2. **Passing `STAR-19793` instead of `19793` as the path param.** The backend path token is `(\d+)` — it expects numeric. The FE URL prefix is cosmetic.

3. **Treating `aow_status: "no_aow_mappings"` as an error.** It's a valid 200 state. Today it's the majority case (28 of 31 projects in TEST). The panel just renders an empty state.

4. **Assuming the new picker will be empty if the operator hasn't tagged the contract as Pool Funding yet.** It won't get that far — `GET /pool-funding-alignment` returns `eligible: false` first. The picker endpoint is only reachable on eligible results.

5. **Forgetting `is_read_only` is now a union.** PRMS-sourced results were leaking writes before R-BIL-071. The single boolean is enough for the FE to disable inputs; reading both flags separately is fine if you want different copy per cause (synced vs PRMS-sourced).

6. **Calling `?sp_codes=SP09,SP10` on the HLO endpoint.** That was the 2026-05-26 stub contract — it's no longer valid. The new endpoint takes **no query params**; AOW is derived server-side from CLARISA. Sending `sp_codes` is ignored, but if you're seeing the old behavior in the wild, you're hitting a cached/old build.

7. **Trying to find an "AOW" entity in our DB.** There isn't one. AOWs live inside CLARISA's `project_mappings_array[]` and flow through at request time. No migration, no table, no admin UI — by design (decision D-PI-13 in `pending-items/execution.md` T-15.12 entry).

---

## 6. Quick verification recipe

Drop these into a terminal (skip `Authorization` if `ARI_LOCAL_AUTH_BYPASS=true`):

```bash
BASE="http://localhost:3001"
RESULT=19793   # numeric — strip STAR- prefix

# A. Confirm the OLD endpoint still returns all 13 (display-only fallback, untouched)
curl -s "$BASE/api/tools/clarisa/science-programs" | jq '.data | length'
# Expected: 13

# B. The NEW SP picker — scoped to the result's mapped CLARISA project
curl -s "$BASE/api/v1/results/$RESULT/pool-funding-alignment/science-programs" \
  | jq '.data.mapping_status, .data.clarisa_project, [.data.science_programs[].code]'
# Expected (D527 fixture, if mapping row exists):
#   "mapped"
#   { "id": 1, "short_name": "T-PJ-003262-..." }
#   ["SP09", "SP10"]
# Expected (no mapping row yet):
#   "unmapped"
#   null
#   []

# C. The NEW HLO panel
curl -s "$BASE/api/v1/results/$RESULT/pool-funding-alignment/hlos-indicators" \
  | jq '.data.mapping_status, .data.aow_status, (.data.pairs | length)'
# Expected most-common today:
#   "mapped"
#   "no_aow_mappings"
#   0
# Expected if the project has AOWs:
#   "mapped"
#   "has_aow"
#   <number of (SP, AOW) pairs>
```

If (B) returns `mapping_status: "mapped"` but `science_programs[]` contains all 13 codes, **that's a backend bug** — please open an issue with the result code + the mapping row contents and ping the ARI backend team.

---

## 7. References

- **Canonical API contract:** [`./frontend-handoff.md`](./frontend-handoff.md) §4.6 (SP picker) + §4.7 (HLO panel) + §4.8 (admin mapping module).
- **Spec sub-folder (full requirements + design + tasks + execution log):** [`./pending-items/`](./pending-items/).
- **Specific requirements** (the "why" behind each rule): `pending-items/requirements.md` R-BIL-070 (PATCH validation), R-BIL-071 (PRMS-sourced read-only), R-BIL-076 (per-result SP picker), R-BIL-077 (HLO panel), R-BIL-078 (mapping lookup), R-BIL-079 (mapping table), R-BIL-080 (admin REST + SSR).
- **AOW decision rationale:** `pending-items/execution.md` T-15.12 entry, decision D-PI-13.
- **Implementation commits:** `92e2fd52` (T-15.11 SP picker), `907993e7` (T-15.12 HLO panel + AOW derivation), `48cc3e8c` (this doc + sibling doc syncs).

---

## 8. Change log

| Date | Change | Author |
|---|---|---|
| 2026-05-27 | Initial document. Created in response to a STAR FE observation that the SP picker on `result/STAR-19793/pool-funding-alignment` was showing all 13 SPs from `/api/tools/clarisa/science-programs` — root cause: the FE hadn't switched to the new per-result endpoint yet. Written as a self-contained brief covering the new model + view-by-view migration so the FE can update without round-tripping to the backend team. | ARI backend team |

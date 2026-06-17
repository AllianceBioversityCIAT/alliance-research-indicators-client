# Backend Handoff — ToC Mapping v2 (lambda-toc integration)

> Relay document for the backend session in `alliance-research-indicators-main` (branch `AC-1594-bilateral-module-v2`). Companion to [`./proposal.md`](./proposal.md). Defines the upstream lambda-toc contract (verified live 2026-06-09), the proposed ARI proxy design, the **frozen FE wire contract** the client will build fixtures against, and the relayed open questions. The backend session should turn this into its mirror spec under its own `docs/specs/bilateral-module/`.

---

## 1. Document control

| Field | Value |
| --- | --- |
| Created | 2026-06-09 |
| Source proposal | [`./proposal.md`](./proposal.md) (client repo) |
| Backend branch | `AC-1594-bilateral-module-v2` |
| Env var | `ARI_TOC_INTEGRATION_HOST=https://lambda-toc.clarisa.cgiar.org` — **already set in backend `.env` (2026-06-09)** |
| Status of FE | Client builds the read flow against §5's contract using Jest fixtures; integration happens when the proxy lands in testing. Target: working demo in testing for Fabio by **Wednesday 2026-06-11** |

---

## 2. Upstream endpoint (lambda-toc) — verified contract

```
GET {ARI_TOC_INTEGRATION_HOST}/api/toc-integration/toc/results/category/{LEVEL}/initiative/{SP}
```

- **No auth** observed (CloudFront-fronted). Note: the hostname failed to resolve on a local resolver on 2026-06-09 and needed 8.8.8.8 — flag to infra if the server environment has a custom resolver.
- `{SP}` = Science Program official code (`SP01`, `SP02`, …) — same codes already produced by the `bilateral_project_mapping` → CLARISA project chain.
- `{LEVEL}` values (empirically verified on SP01; OQ-V2-1 asks CLARISA to confirm canon):

| `{LEVEL}` | Business name | SP01 sample | Notes |
| --- | --- | --- | --- |
| `OUTPUT` | High-Level Output (HLO) | 22 results | titles like `HLO1.AOW1.IO1 Steer to impact`, `wp_short_name` = AOW code |
| `OUTCOME` | Intermediate Outcome | 10 results | titles like `IOC1 Prioritization of products` |
| `EOI` | 2030 Outcome | 2 results | titles like `2030-OC1. Widespread use…`; **`wp_short_name: null`** |

- Unknown `{LEVEL}` values do **not** 404 — they return `{"response":[]}` (HTTP 200). An empty array is therefore ambiguous between "bad level" and "no data"; don't infer level validity from it.

### Response shape

```jsonc
{
  "response": [
    {
      "toc_result_id": 5187,                       // numeric — stable id for persistence
      "toc_internal_id": "3ca9f07b-…",             // uuid
      "title": "HLO1.AOW1.IO1 Steer to impact",
      "description": "Market intelligence is packaged into…",
      "toc_type_id": null,
      "toc_level_id": null,
      "official_code": "SP01",                     // echoes the SP
      "work_package_id": "d65e4401-…",
      "wp_short_name": "AOW01",                    // AOW code; null for EOI
      "phase": "99134294-…",
      "version_id": "7e94b127-…",
      "indicators": [
        {
          "indicator_id": 5972,                    // numeric — stable id for persistence
          "toc_result_indicator_id": "76f57e62-…",
          "related_node_id": "70f1200f-…",
          "indicator_description": "Number of new market intelligence briefs",
          "unit_messurament": "Number",            // (sic — upstream typo, mirror verbatim)
          "type_value": "Number of knowledge products",
          "type_name": "Number of knowledge products",
          "location": "global",
          "targets": [                             // per-year, 2020–2030
            { "target_value": "10", "target_date": "2026" }
          ]
        }
      ]
    }
  ]
}
```

Observed `type_value` distribution (SP01, OUTPUT): `Number of knowledge products` ×14, `custom` ×10, `Number of innovations (innovation development)` ×7, `Number of people trained (capacity sharing for development)` ×1. These strings feed the indicator-type filter rule (OQ-V2-2, gating, BA pending).

---

## 3. Proposed backend changes

### 3.1 `TocIntegrationService` (replaces the AOW-form `PrmsTocService` for this flow)

- `getTocResults(sp: string, level: TocLevel): Promise<TocResult[]>` — GET as in §2.
- Cache: in-memory, TTL 5 min, keyed `${sp}:${level}` (same pattern as the current `prms-toc.service.ts`).
- Error policy: mirror the existing one — serve warm cache on upstream failure with a warn log; cold cache → 503. Treat `{"response":[]}` as a valid empty catalog, cacheable.
- Fan-out helper: `getTocResultsForSps(sps: string[], levels: TocLevel[])` — parallel, at most `sps × levels` calls (typically ≤ 2 SPs × ≤ 2 levels).
- Keep `ARI_PRMS_TOC_HOST` / the old service untouched until cutover is verified, then delete in the cleanup task.

### 3.2 Result-type → allowed-levels rule (server-side, single source of truth)

| STAR result type | Allowed levels |
| --- | --- |
| Capacity Sharing for Development | `OUTPUT` |
| Innovation Development | `OUTPUT` |
| Policy Change | `OUTCOME`, `EOI` |
| anything else | **OQ-V2-5** — pending BA; propose returning `allowed_levels: []` + the FE hides the ToC block |

The backend computes `allowed_levels` from the result's indicator/result type and embeds it in the read response (§4) so the FE never re-derives the rule.

### 3.3 Read endpoint — reshape in place

Reshape **`GET /api/v1/results/:resultCode/pool-funding-alignment/hlos-indicators`** to the §4 envelope rather than adding a parallel endpoint: the STAR client is its only consumer, the module has not shipped to production, and the old `(SP, AOW)` pair shape is being retired wholesale. Drop: AOW enumeration (`ClarisaCgiarEntitiesService.getAreasOfWorkBySp`), the `pairs[]`/`aow_status`/`no_aow_mappings` machinery.

Resolution chain stays: result → AGRESSO contract → `bilateral_project_mapping` (active) → CLARISA project → SP codes (portfolio filter `ARI_BILATERAL_ACTIVE_PORTFOLIO`, default `P25`).

### 3.4 Write side — per-SP independent alignments

Persistence model is the backend's decision (OQ-V2-9: new table vs reshaping existing mapping rows), but the invariants are fixed:

- One alignment row per `(result, sp_code)` (cardinality 1 per SP per OQ-V2-3; design the table so N-per-SP is a column away if BA flips it).
- Row payload: `sp_code`, `level`, `toc_result_id`, `indicator_id`, `quantitative_contribution` (numeric, nullable until OQ-V2-2/3 settle edge cases), plus denormalized display snapshots (`toc_result_title`, `indicator_description`, `unit_messurament`, `target_value`, `target_year`) so saved alignments survive upstream catalog drift — this is also the 2027-versioning hedge from the 2026-06-09 meeting.
- Saving SP01's alignment must never mutate SP03's (independent upsert per `sp_code`; removing an SP from `sp_codes` cascades its alignment row to inactive).

### 3.5 Version gate

- Hardcode the mappable live version to **2026**; reject create/edit for results whose live version ≠ 2026 with a 409 + explicit error code (e.g. `toc_mapping_version_locked`) so the FE can render the locked state.
- (Versioning proper is the pending Enrico conversation — out of scope.)

---

## 4. Frozen FE wire contract — read

`GET /api/v1/results/:resultCode/pool-funding-alignment/hlos-indicators` (reshaped):

```jsonc
{
  "result_code": "STAR-5238",
  "mapping_status": "mapped",            // 'mapped' | 'unmapped'  (unchanged semantics)
  "clarisa_project": { "id": 123, "short_name": "EMBRAPA - …" },  // unchanged
  "result_type": "capacity_sharing",     // canonical key, backend-owned enum
  "allowed_levels": ["OUTPUT"],          // [] => FE hides the ToC alignment block (OQ-V2-5)
  "version_locked": false,               // true for live version ≠ 2026
  "catalogs": [
    {
      "sp_code": "SP01",
      "levels": [
        {
          "level": "OUTPUT",             // 'OUTPUT' | 'OUTCOME' | 'EOI'
          "toc_results": [
            {
              "toc_result_id": 5187,
              "title": "HLO1.AOW1.IO1 Steer to impact",
              "description": "Market intelligence is packaged…",
              "aow_code": "AOW01",       // from wp_short_name; null for EOI
              "indicators": [
                {
                  "indicator_id": 5972,
                  "indicator_description": "Number of new market intelligence briefs",
                  "unit_of_measurement": "Number",        // renamed from unit_messurament
                  "type_value": "Number of knowledge products",
                  "target_value": "10",                   // resolved for target_year
                  "target_year": 2026
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

Notes:

- `catalogs[]` carries one entry per SP **selected on the alignment** (or per SP available on the project — backend's call; FE handles both, it filters by selected SPs anyway). One `levels[]` entry per allowed level.
- Backend resolves `targets[]` → single `(target_value, target_year)` for the hardcoded 2026 year; FE never sees the 11-year array.
- Indicator-type filtering (OQ-V2-2) — until BA rules, **do not filter**; ship `type_value` through so the FE can flip the filter on without a backend change.

### Write (envelope proposal — final shape owned by backend spec)

```jsonc
// PATCH /api/v1/results/:resultCode/pool-funding-alignment   (extends existing body)
{
  "has_contribution": true,
  "sp_codes": ["SP01", "SP03"],
  "toc_alignments": [
    {
      "sp_code": "SP01",
      "aligns_with_toc": true,           // the per-SP Yes/No question
      "level": "OUTPUT",
      "toc_result_id": 5187,
      "indicator_id": 5972,
      "quantitative_contribution": 3
    },
    { "sp_code": "SP03", "aligns_with_toc": false }
  ]
}
```

- 400 keeps the `unknown_sp_codes` contract; add per-alignment validation errors (`sp_code` + field) for unknown `toc_result_id`/`indicator_id` or disallowed `level`.
- 409 keeps the synced/PRMS-sourced lock; add `toc_mapping_version_locked` (§3.5).

### Read-back of saved alignments (added 2026-06-09, FE design D-3 — confirm)

Saved alignments ride the existing **`GET /api/v1/results/:resultCode/pool-funding-alignment`** envelope (one pre-fill request, atomic with `has_contribution`/`sp_codes` — no separate endpoint):

```jsonc
// AlignmentResponse gains:
"toc_alignments": [
  {
    "sp_code": "SP01",
    "aligns_with_toc": true,
    "level": "OUTPUT",
    "toc_result_id": 5187,
    "indicator_id": 5973,
    "quantitative_contribution": 3,
    "snapshot": {                       // denormalized at save time (§3.4) — render-safe under catalog drift
      "toc_result_title": "HLO1.AOW1.IO1 Steer to impact",
      "aow_code": "AOW01",              // null for EOI
      "indicator_description": "Number of events where Market Intelligence…",
      "unit_of_measurement": "Number",
      "target_value": "5",
      "target_year": 2026
    },
    "is_stale": false                   // true when the catalog item no longer resolves upstream
  },
  { "sp_code": "SP03", "aligns_with_toc": false }
]
```

The FE renders stale rows from `snapshot` with a warning tag (no auto-clear). This block is the only §4 surface added after the 2026-06-09 relay — please confirm or counter-propose before the FE live-verify task.

---

## 5. Relayed open questions (answers route back through Juanca)

| ID | Question | Blocking? |
| --- | --- | --- |
| OQ-V2-1 | Confirm `OUTPUT`/`OUTCOME`/`EOI` are the canonical, stable category values across SPs | No (verified empirically) |
| OQ-V2-2 | Indicator-type filter: strict / include `custom` / none — mockups show unfiltered; strict yields near-empty lists | **Yes** for final behavior; not for build (ship unfiltered + `type_value`) |
| OQ-V2-3 | Exactly one (level, HLO, indicator) per SP? | **Yes** for table design margin |
| OQ-V2-5 | Level rules / visibility for result types beyond CapSharing, InnovDev, Policy | Yes for those types only |
| OQ-V2-6 | Target year = live-version year (2026)? Mockup copy says 2025 | No (assume 2026) |
| OQ-V2-9 | Persistence: new table vs reshaping existing mapping rows | Backend decision |

## 6. Archive disposition (mirror in backend repo)

Per [`./proposal.md` §7](./proposal.md): archive the backend repo's `indicator-mapping/` ToC-read material and the AOW-pair sections of `pending-items/`; the (SP, AOW) fan-out, `getAreasOfWorkBySp` usage in this flow, and the old `hlos-indicators` pair envelope are retired. The contract/project/SP resolution chain, portfolio filter, and alignment GET/PATCH survive.

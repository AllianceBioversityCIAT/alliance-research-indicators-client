# Backend Handoff — OQ-POOL: make a bilateral mapping drive the "Contributing to Pool Funding" tag

> For the **backend session** (`alliance-research-indicators-main`, branch `AC-1594-bilateral-module-v2`). This is NOT frontend work. The STAR client admin CRUD for `bilateral_project_mapping` is complete (spec `docs/specs/bilateral-module/center-admin-project-mapping/`, 8 tasks done). This brief captures the one product-intent gap that the client feature surfaced.

---

## 1. Product intent (from the PO/user, 2026-07-01)

> "When I map a project to a bilateral project, the project should show the **Contributing to Pool Funding** tag. That is the point of the mapping."

So: **an active `bilateral_project_mapping` for an AGRESSO agreement SHOULD make that project appear as a Pool Funding contributor** in the Projects surfaces (the STAR "Projects" table badge, and anywhere the flag is consumed).

## 2. Current behavior (verified in backend source, 2026-07-01)

The two concepts are **decoupled**:

- **The tag** is a stored boolean column: `agresso_contracts.is_pool_funding_contributor` (migration `1779190000001-addPoolFundingContributorTagToAgressoContract`, default `0`).
- It is set **only** via `AgressoContractService.setPoolFundingTag(contractCode, value)` (the "AGRESSO Pool Funding Tag" admin page → `PATCH agresso/contracts/:code/pool-funding-tag`).
- The Projects/results reads use the column verbatim:
  - `agresso-contract/repositories/agresso-contract.repository.ts` (find-contracts select + `POOL_FUNDING_CONTRIBUTOR` order + `is_pool_funding_contributor` filter).
  - `results/repositories/result.repository.ts` → `COALESCE(ac.is_pool_funding_contributor, FALSE) AS is_pool_funding_contributor`.
- **Nothing** in find-contracts or results derives the flag from `bilateral_project_mapping`. Creating a mapping never touches `is_pool_funding_contributor`.

**Observed:** D504 has an active mapping (`bilateral_project_mapping` id 11 → CLARISA project 22) and shows in the Bilateral Mapping admin page, but the Projects table shows **no** "Contributing to Pool Funding" badge (its contract was never tagged). A511 and D527 show the badge only because they were manually `PATCH`ed to `is_pool_funding_contributor = true`.

## 3. What needs to change (backend)

Pick one approach (PO to confirm — see §4):

### Option A — Auto-set the flag on mapping write (write-time coupling)
- On `create` (and on `deactivate`) in `BilateralProjectMappingService`, also update the owning `agresso_contracts.is_pool_funding_contributor`:
  - create/activate mapping for agreement X → set `is_pool_funding_contributor = true` for X.
  - deactivate the **last active** mapping for X → set it back to `false` (only if no other active mapping remains for X).
- Do it in the same transaction as the mapping write (the service already uses transactions for the uniqueness conflict).
- ➕ Projects/results read queries stay unchanged. ➖ Two sources can now write the same column → must reconcile with the manual override (see §4); risk of drift if a mapping is created/removed outside the service.

### Option B — Derive the badge at read time (read-time coupling)
- Change the flag the Projects/results queries expose to:
  `is_pool_funding_contributor OR EXISTS(active bilateral_project_mapping for this agreement)`.
  - Touch `agresso-contract.repository.ts` (find-contracts) and `result.repository.ts` (the `COALESCE(...)` expression) with a `LEFT JOIN`/`EXISTS` on `bilateral_project_mapping` (`is_active = 1`, matched by `agresso_agreement_id`).
- ➕ Single source of truth per read; no write coupling; deactivation naturally drops the badge. ➖ Two read sites to change; the manual column becomes an *additional* signal, not the only one.

**Recommendation:** Option B (derive at read) — it makes the mapping authoritative for the badge without write-time coupling or reversal edge-cases, and it degrades correctly when a mapping is deactivated. But confirm §4 first.

## 4. PO decisions required
1. **Manual override interaction:** the "AGRESSO Pool Funding Tag" page can currently set the flag true/false by hand. If a contract has an active mapping, may an admin still manually *untag* it? (Under Option B, a manual `false` would be overridden by the mapping-derived `true`.) Decide precedence: mapping-derived vs manual override.
2. **Scope of "shows the badge":** just the STAR Projects table, or also results-level `is_pool_funding_contributor` consumers (result.repository)? (Recommend: both, for consistency.)
3. **Retroactivity:** should existing mappings (e.g. D504) light up the badge immediately on deploy? (Option B: yes automatically. Option A: needs a one-time backfill `UPDATE`.)

## 5. Verification once implemented
- D504 (has active mapping) → Projects table shows "Contributing to Pool Funding".
- Deactivate D504's only active mapping → badge disappears.
- A contract with the manual tag but no mapping → badge still shows (behavior preserved).
- STAR client needs **no change** — it already reads `is_pool_funding_contributor` from the contract/result payload.

## 6. References
- FE spec: `docs/specs/bilateral-module/center-admin-project-mapping/` (requirements OQ-POOL, design R-7).
- Backend files: `domain/entities/agresso-contract/repositories/agresso-contract.repository.ts`, `domain/entities/results/repositories/result.repository.ts`, `domain/entities/agresso-contract/agresso-contract.service.ts` (`setPoolFundingTag`), `domain/entities/bilateral-project-mapping/bilateral-project-mapping.service.ts`, migration `1779190000001-addPoolFundingContributorTagToAgressoContract`.

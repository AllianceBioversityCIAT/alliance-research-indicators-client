# Backend Handoff — Green check for the "Pool funding alignment" section

> For the **backend session** (`alliance-research-indicators-main`, branch `AC-1594-bilateral-module-v2`). NOT frontend work. The STAR client already reads the key; the backend green-checks service just doesn't emit it yet.

---

## 1. Problem

In the result detail page, the left-sidebar section **"Pool funding alignment"** never shows its completion tick (green check), even after the user fills and saves the section (e.g. "Yes" + a Science Program selected). All other sections tick correctly.

## 2. Root cause (verified in source)

The green-checks feature is **backend-computed** and returned as `FindGreenChecksDto`. That DTO — `server/researchindicators/src/domain/entities/green-checks/dto/find-green-checks.dto.ts` — currently emits:

```ts
general_information, alignment, geo_location, partners, evidences,
cap_sharing?, policy_change?, completness?
```

It does **not** include `pool_funding_alignment`, and `green-checks.service.ts` never computes it. So the client receives no value for that key.

**Frontend is already correct** — `result-sidebar.component.ts` maps the section with `greenCheckKey: 'pool_funding_alignment'` and reads `Boolean(cache.greenChecks()['pool_funding_alignment'])`. With no value emitted, it's `undefined → false → never green`. (The FE `GreenChecks` interface has been updated to include `pool_funding_alignment?: number` so it's ready; no further FE change is needed once the backend emits it.)

## 3. Change required (backend)

Handle it exactly like the other sections:

1. **DTO** — `green-checks/dto/find-green-checks.dto.ts`: add
   ```ts
   public pool_funding_alignment?: boolean;
   ```
2. **Service** — `green-checks/green-checks.service.ts`: compute `pool_funding_alignment` alongside the other section checks, from the persisted pool-funding-alignment state of the result.

### Completion rule (mirror the FE `canSave`, `pool-funding-alignment.component.ts:203`)

`pool_funding_alignment = true` when the section is answered AND complete:
- the result is **not eligible / answered "No"** to "Does this result contribute to a Science Program or Accelerator?" → complete (nothing more to fill), OR
- answered **"Yes"** and **every rendered Science-Program block is answered and complete** — each selected SP has its ToC question (`aligns_with_toc`) answered, and, where required, its indicators / quantitative contribution filled.

`false` while any selected SP block is unanswered or a "Yes" is incomplete.

**Important:** Pool Funding Alignment is **optional for submission** (the FE excludes it from the progress counter / submit gate). This green check is a **visual completion indicator only** — it must NOT block result submission.

3. **Recompute on save** — ensure the green-checks recompute is triggered when the pool-funding-alignment section is saved (same as the other sections), so the tick updates without a full reload.

## 4. Verification

- Fill "Pool funding alignment" (answer Yes + complete the SP/ToC blocks, or answer No), save → the sidebar tick turns green.
- Leave a selected SP block unanswered → tick stays empty.
- Submitting a result with the section incomplete is still allowed (optional section).
- No STAR client change needed — it already reads `pool_funding_alignment` and refreshes green checks on save.

## 5. References

- Backend: `green-checks/dto/find-green-checks.dto.ts`, `green-checks/green-checks.service.ts`.
- Frontend (for the completion rule + key): `result-sidebar.component.ts` (`greenCheckKey: 'pool_funding_alignment'`), `pool-funding-alignment.component.ts` (`canSave` computed), `interfaces/get-green-checks.interface.ts`.

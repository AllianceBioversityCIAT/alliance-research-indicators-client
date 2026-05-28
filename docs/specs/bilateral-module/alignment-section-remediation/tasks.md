# Tasks — Bilateral Module / Alignment-Section Remediation

> Execution units for [`./requirements.md`](./requirements.md). Three independent, path-agnostic fixes — none gated on OQ-IM-1. Design notes live inline (no separate `design.md` — proportionate for three ~½-day fixes). Consumed by `/sdd-execute`.

---

## 1. Goal

Bring the shipped Pool Funding Alignment section in line with the new per-result backend contracts: SP picker scoped to the result's CLARISA project, PRMS-sourced read-only differentiated from synced, and `unknown_sp_codes` validation surfaced inline. Authoritative contract reference: [`../ari-backend-context/frontend-data-model.md`](../ari-backend-context/frontend-data-model.md) §4.

---

## 2. Dependency graph

```
T-BIL-ASR-01 (per-result SP picker)        — independent
T-BIL-ASR-02 (PRMS-sourced read-only)      — independent
T-BIL-ASR-03 (unknown_sp_codes handler)    — independent; lightly couples to -01 (shares the SP-chip render)
```

All three can be done in parallel or bundled into one PR (they touch overlapping files — `bilateral.service.ts`, `pool-funding-alignment.component.{ts,html}`). Recommended: **one PR**, since they share the alignment component and reviewing together is cheaper. Record the bundling in the PR description.

---

## 3. Tasks

### T-BIL-ASR-01 — Per-result SP picker

- **Status**: `complete` ✅ (PASS attempt 2, 2026-05-27 — see `execution.md`)
- **Size**: S (~½ day)
- **Discharges**: REQ-BIL-ASR-01.
- **Touches**:
  - `src/app/shared/services/api.service.ts` — add `GET_PoolFundingSciencePrograms(numericResultCode)` returning `MainResponse<PoolFundingSciencePrograms>`.
  - `src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts` — add response types (`PoolFundingSciencePrograms`, `PoolFundingScienceProgram`, `mapping_status`, `clarisa_project`).
  - `src/app/shared/services/bilateral.service.ts` — add `sciencePrograms` signal + `mappingStatus` signal + `getSciencePrograms(resultCode)` method.
  - `pool-funding-alignment.component.{ts,html}` — switch the picker `[options]` from the `sciencePrograms` control-list service to `bilateralService.sciencePrograms()`; add the `unmapped` / mapped-empty states.
  - `.spec.ts` for the above.
- **Implementation notes**:
  - Endpoint: `results/${numericResultCode}/pool-funding-alignment/science-programs` (no query params). Reuse the `STAR-` strip helper already used for the alignment GET/PATCH (the alignment-section work added it — grep for where `GET_PoolFundingAlignment` strips the prefix).
  - Response shape per [`frontend-data-model.md` §3.3](../ari-backend-context/frontend-data-model.md): `{ result_code, mapping_status: 'mapped'|'unmapped', clarisa_project: {id,short_name}|null, science_programs: [{code,name,category,color,icon_key,allocation}] }`.
  - **Do NOT remove** `GET_SciencePrograms` (catalog-wide) — AC-01.5 keeps it for display-only contexts.
  - Empty states: `unmapped` → "contact ops" message; `mapped` + `[]` → "no SPs defined" message. Both disable/hide the picker.
  - Load trigger: fetch on the same effect/lifecycle that loads `currentAlignment` (the picker only matters when the alignment loads). Avoid a separate round-trip if the alignment GET already gates eligibility.
- **Tests**: per-result endpoint called with numeric code; `unmapped` renders contact-ops + no 13-SP fallback; `mapped`+empty renders no-SPs state; `mapped`+SPs renders chips with allocation%; catalog `GET_SciencePrograms` untouched.
- **Done when**: `npm run lint` + `npm run test -- pool-funding-alignment bilateral.service api.service` + `npm run build` clean. Manual smoke on a result whose CLARISA project has < 13 SPs → picker shows only those.
- **Relevant skills**: `angular-developer`.

---

### T-BIL-ASR-02 — PRMS-sourced read-only differentiation

- **Status**: `complete` ✅ (PASS attempt 1, 2026-05-27 — see `execution.md`)
- **Size**: S (~½ day)
- **Discharges**: REQ-BIL-ASR-02.
- **Touches**:
  - `pool-funding-alignment.component.ts` — add `PRMS_SOURCED_BADGE_LABEL` + `PRMS_SOURCED_BANNER` constants; add a `readOnlyCause` computed (`'synced' | 'prms-sourced' | 'permission' | null`).
  - `pool-funding-alignment.component.html` — branch the badge + banner on `readOnlyCause()`.
  - `.spec.ts` — the three-way matrix.
- **Implementation notes**:
  - `readOnlyCause` derivation (grounded in the existing flags):
    - `is_read_only && is_synced_to_prms` → `'synced'`
    - `is_read_only && !is_synced_to_prms` → `'prms-sourced'`
    - `!is_read_only && !editable` (role/ownership) → `'permission'`
    - else `null`
  - Copy: badge `'Owned by PRMS'`; banner `'This result is owned by PRMS. Bilateral alignment is read-only in STAR.'` (align with the backend's 409 description semantics — see [`frontend-data-model.md` §4 read-only table](../ari-backend-context/frontend-data-model.md)).
  - On PATCH 409 with description `"Result is PRMS-sourced; bilateral alignment is read-only in STAR"` → after the existing refetch, `readOnlyCause` will naturally resolve to `'prms-sourced'` from the refreshed flags. Verify the refetched payload sets `is_synced_to_prms=false`.
  - Reuse the existing `pf-synced` STATUS_COLOR_MAP entry or add a sibling only if the design needs a different color (check with design; default: reuse).
- **Tests**: each `readOnlyCause` branch renders the right badge + banner; inputs disabled in all read-only causes; 409 PRMS-sourced description → prms-sourced banner after refetch.
- **Done when**: lint + tests + build clean; manual smoke on a PRMS-sourced result (if a fixture exists) or a mocked `is_read_only=true, is_synced_to_prms=false` payload. **A11y (NF-ASR-02)**: the new "Owned by PRMS" badge + banner carry `role`/`aria-label` parity with the existing synced badge/banner (dark + light per NF-ASR-04).
- **Relevant skills**: `angular-developer`, `frontend-design`.

---

### T-BIL-ASR-03 — `unknown_sp_codes` 400 handler

- **Status**: `pending`
- **Size**: S (~½ day)
- **Discharges**: REQ-BIL-ASR-03.
- **Touches**:
  - `bilateral.service.ts` — **extend the field-error extraction** so `errorDetail.errors.unknown_sp_codes: string[]` reaches the caller. The existing `extractFieldErrors` (`:117-131`) keeps only **string-valued** entries from a **stringified-JSON** `errors`, so it drops the array as-is. Either special-case `unknown_sp_codes` (join the array into a message string) or add a dedicated `unknownSpCodes?: string[]` on `PatchAlignmentResult`. This is NOT a no-op key-wire (see requirements REQ-BIL-ASR-03 "Current state").
  - `shared/interfaces/responses.interface.ts` — **possibly** widen `ErrorResponse.errors` (currently typed `string`) if the live envelope returns `errors` as an object rather than a stringified JSON string. Decide after the live-shape check.
  - `pool-funding-alignment.component.{ts,html}` — surface the rejected codes inline + highlight the offending SP chips.
  - `.spec.ts`.
- **Implementation notes**:
  - The URL-scoped 400 toast suppression for `/pool-funding-alignment` already exists (detailed-design §6.3) — so the generic toast won't fire; we own the inline message.
  - Message copy (AC-03.3): `"These Science Programs are no longer valid for this result: {codes}. Remove them and save again."`
  - Chip highlight: add an error class on chips whose `code` is in `unknown_sp_codes`. Clear on selection change (AC-03.4).
  - **Confirm the exact error envelope FIRST** against Swagger / a live 400 on `AC-1594-bilateral-module-v2`: (a) is `errors` a stringified JSON string or an object? (b) is the field `errors.unknown_sp_codes` vs `errors[].unknown_sp_codes`? (c) is the value `string[]`? The backend doc says `errors.unknown_sp_codes: string[]`. The answer determines whether `ErrorResponse.errors` needs widening and how `extractFieldErrors` is extended.
- **Tests**: 400 with `unknown_sp_codes` (array value) → inline error + highlighted chips; message names the codes; selection change clears the error; non-`unknown_sp_codes` 400 still handled by the existing path; existing string-valued `fieldErrors` path still works (no regression on the parser change).
- **Done when**: lint + tests + build clean; manual smoke by submitting a stale SP code (or mocked 400). **A11y (NF-ASR-02)**: the inline SP-error container uses `role="alert"` so the rejection is announced.
- **Relevant skills**: `angular-developer`, `error-handling-patterns`.

---

## 4. Execution conventions

- **Bundle into one PR** by default (shared files). PR title: `fix(bilateral-module/alignment-section): consume per-result SP picker + PRMS-sourced read-only + unknown_sp_codes validation`.
- PR references: this spec folder, the three task IDs, the AC IDs, and [`../ari-backend-context/frontend-data-model.md`](../ari-backend-context/frontend-data-model.md) §4 as the contract source.
- Pre-merge: CI green, `ng build` clean, manual smoke of all three on a real bilateral result in both themes.
- **Verify before coding** (per task notes): confirm the exact response shape of the per-result SP endpoint and the `unknown_sp_codes` error envelope against Swagger / a live call on `AC-1594-bilateral-module-v2`. The backend doc is the reference but the live shape is authoritative.

---

## 5. Task ID index

| ID | Title | Size | Gating | Status |
| --- | --- | --- | --- | --- |
| T-BIL-ASR-01 | Per-result SP picker | S | none | complete ✅ |
| T-BIL-ASR-02 | PRMS-sourced read-only differentiation | S | none | complete ✅ |
| T-BIL-ASR-03 | `unknown_sp_codes` 400 handler | S | none | pending |

---

## 6. Notes

- This arc is **independent of OQ-IM-1**. It can ship before, during, or after the PO decision on the contribution body shape.
- It does **not** touch the indicator-mapping spec (the HLO contribution write flow). The HLO panel read view (`GET .../hlos-indicators`) is deferred to indicator-mapping per the 2026-05-27 endpoint-switch rewrite.
- The `HLO_CARD_CTA_LABEL = 'Select'` vs `View HLOs` discrepancy (OQ-FIG-5) is **not** in this arc — it belongs to indicator-mapping's AI-card work. Flagged here only so it isn't lost.

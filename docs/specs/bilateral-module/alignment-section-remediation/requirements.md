# Requirements — Bilateral Module / Alignment-Section Remediation

> Post-ship remediation arc for the **already-shipped** Pool Funding Alignment section ([archived spec](../../archive/2026-05-26-bilateral-module--alignment-section/)). Three path-independent fixes that bring the shipped FE in line with the new per-result backend contracts (T-15.11 SP picker + R-BIL-070 PATCH validation + R-BIL-071 read-only union). **None depend on the OQ-IM-1 PO decision** — they ship in parallel with that escalation.
>
> Domain abbreviation: `BIL-ASR`. Follows the template at [`../../general-setup/requirements.md`](../../general-setup/requirements.md).

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/alignment-section-remediation/` |
| Parent (shipped) | [`../../archive/2026-05-26-bilateral-module--alignment-section/`](../../archive/2026-05-26-bilateral-module--alignment-section/) — the alignment-section spec this remediates |
| Trigger | Backend landed per-result endpoints (T-15.11 / commit `92e2fd52`) + read-only union (R-BIL-071) + PATCH validation (R-BIL-070) on `AC-1594-bilateral-module-v2`. The shipped FE is still on the old catalog-wide SP endpoint. |
| Authoritative backend reference | [`../ari-backend-context/frontend-data-model.md`](../ari-backend-context/frontend-data-model.md) §4 (view-by-view migration table) — the snapshot is the contract these fixes build against |
| Status | **DRAFT — ready for `/sdd-execute`.** All three tasks grounded in the shipped code (see §6 audit). |
| Relationship to indicator-mapping | Independent. Indicator-mapping (the HLO contribution write flow) is gated on OQ-IM-1. This arc is NOT — it consumes already-shipped read/validation contracts. |

---

## 2. Executive summary

The Pool Funding Alignment section shipped (commits through `fc56e0b1`). Since then the backend changed three contracts the FE hasn't caught up to:

1. **SP picker source** — the FE calls the catalog-wide `GET tools/clarisa/science-programs` (always 13 SPs). The backend now exposes a **per-result** endpoint scoped to the result's mapped CLARISA project. Users on a bilateral result see all 13 SPs today; they should see only the SPs their project participates in. This is a real, user-visible bug — it's the exact observation that prompted the backend's `frontend-data-model.md`.
2. **Read-only cause** — the backend made `is_read_only` a union of "synced to PRMS" OR "PRMS-sourced result" (R-BIL-071). The FE already *gates* on `is_read_only` (so no write leaks), but it doesn't *distinguish* the PRMS-sourced cause in its UX copy.
3. **PATCH validation** — the backend now returns `400` with `errors.unknown_sp_codes: string[]` when a submitted SP code isn't in the per-result list. The FE has the inline-error infrastructure but doesn't yet parse this specific key.

---

## 3. Scope

### 3.1 In scope

- **REQ-BIL-ASR-01** — SP picker sources from the per-result endpoint.
- **REQ-BIL-ASR-02** — PRMS-sourced read-only differentiation (new badge/banner).
- **REQ-BIL-ASR-03** — `unknown_sp_codes` 400 handler.

### 3.2 Out of scope

- The HLO/indicator contribution write flow (that's `indicator-mapping/`, gated on OQ-IM-1).
- The HLO panel read view (`GET .../hlos-indicators`) — that's part of indicator-mapping, deferred.
- Any backend change — all three consume already-shipped contracts.
- The admin bilateral-project-mapping SSR page (backend-owned, not a STAR FE surface).

---

## 4. Functional requirements

### REQ-BIL-ASR-01 — Per-result SP picker

- **Statement**: The Pool Funding Alignment SP picker sources its options from `GET /api/v1/results/:numericResultCode/pool-funding-alignment/science-programs` (scoped to the result's mapped CLARISA project), not the catalog-wide `GET tools/clarisa/science-programs`.
- **Backend reference**: [`../ari-backend-context/frontend-data-model.md`](../ari-backend-context/frontend-data-model.md) §3.3 (response shape) + §4 (migration row) + §5 pitfall 1.
- **Acceptance criteria**:
  - AC-01.1 — Picker options come from the per-result endpoint. Response shape: `{ result_code, mapping_status, clarisa_project, science_programs[] }` where each SP carries `code`, `name`, `category`, `color`, `icon_key`, `allocation`.
  - AC-01.2 — `mapping_status: "unmapped"` → picker is empty + shows "This result isn't linked to a CLARISA project yet. Contact the bilateral operations team to register the project mapping." **Do NOT fall back to the 13-SP catalog** (pitfall 1).
  - AC-01.3 — `mapping_status: "mapped"` with an empty `science_programs[]` → "The linked CLARISA project has no Science Programs defined." (distinct from unmapped).
  - AC-01.4 — Numeric `resultCode`: strip the `STAR-` prefix before calling (the route param is `(\d+)`). Reuse the existing strip helper from the alignment-section work.
  - AC-01.5 — The catalog-wide `GET_SciencePrograms` stays available for **display-only** contexts (badges, summary lists). This requirement only changes the **picker** source.
  - AC-01.6 — SP chips render `code — allocation%` (e.g. `SP09 — 25%`) and the icon from `icon_key` (`/assets/result-framework-reporting/SPs-Icons/{icon_key}.png`).
  - AC-01.7 — On PATCH, `sp_codes` continues to send the selected `code[]` (unchanged write contract).

### REQ-BIL-ASR-02 — PRMS-sourced read-only differentiation

- **Statement**: When a result is read-only because it is **PRMS-sourced** (`is_read_only=true` AND `is_synced_to_prms=false`), the UX shows a distinct badge + banner ("Owned by PRMS — read-only in STAR"), separate from the existing "synced to PRMS" and "no permission" states.
- **Backend reference**: [`../ari-backend-context/frontend-data-model.md`](../ari-backend-context/frontend-data-model.md) §4 "Read-only states" table + pitfall 5.
- **Current state** (per §6 audit): the FE already gates editing on `is_read_only` (bilateral.service.ts:37) and has a synced banner + a permission banner. Only the PRMS-sourced variant is missing.
- **Acceptance criteria**:
  - AC-02.1 — `is_read_only && is_synced_to_prms` → existing "Synced — read only" badge + synced banner (unchanged).
  - AC-02.2 — `is_read_only && !is_synced_to_prms` AND the user would otherwise have edit rights (role/owner OK) → NEW badge "Owned by PRMS" + banner "This result is owned by PRMS. Bilateral alignment is read-only in STAR." Same disabled inputs as synced.
  - AC-02.3 — Read-only purely because of permission (`!editable` for role/ownership reasons, not `is_read_only`) → existing permission banner (unchanged).
  - AC-02.4 — A PATCH that returns `409` with description `"Result is PRMS-sourced; bilateral alignment is read-only in STAR"` → refetch alignment + render the PRMS-sourced banner (AC-02.2), not the synced one.
  - AC-02.5 — Inputs are disabled identically across all three read-only causes; only the badge + banner copy differ.

### REQ-BIL-ASR-03 — `unknown_sp_codes` 400 handler

- **Statement**: When a PATCH alignment returns `400` with `errors.unknown_sp_codes: string[]`, the FE surfaces the rejected SP codes as a field-level error on the picker and highlights the offending chips, rather than a generic toast.
- **Backend reference**: [`../ari-backend-context/frontend-data-model.md`](../ari-backend-context/frontend-data-model.md) §4 "PATCH submit" row.
- **Current state** (per §6 audit): `PatchAlignmentResult` already carries `fieldErrors?: Record<string, string>`; the component has an `inlineErrors` signal. Infrastructure exists — this wires the specific key.
- **Acceptance criteria**:
  - AC-03.1 — PATCH alignment `400` with `errorDetail.errors.unknown_sp_codes: ["SPxx", ...]` → mapped into the picker's inline error (not a generic toast; the URL-scoped 400 exception already suppresses the toast for `/pool-funding-alignment`).
  - AC-03.2 — The rejected SP chips are visually highlighted (error styling) in the picker.
  - AC-03.3 — The inline message names the rejected codes, e.g. "These Science Programs are no longer valid for this result: SP04, SP07. Remove them and save again."
  - AC-03.4 — Changing the selection (removing a rejected code) clears the inline error for the next save attempt.

---

## 5. Non-functional requirements

- **NF-ASR-01 — No new backend dependency.** All three consume contracts already live on `AC-1594-bilateral-module-v2`.
- **NF-ASR-02 — Accessibility (C-4).** New badge/banner gets `role`/`aria-label` parity with the existing synced badge. Inline SP errors use `role="alert"`.
- **NF-ASR-03 — No coverage regression.** New service method + component branches covered; project floors unchanged.
- **NF-ASR-04 — Dark + light parity** on the new PRMS-sourced badge/banner.

---

## 6. Current-code audit (grounding — 2026-05-27)

Read-only audit of the shipped alignment-section before drafting tasks:

| Surface | Today | Evidence |
|---|---|---|
| SP picker source | `ApiService.GET_SciencePrograms()` → `tools/clarisa/science-programs` (catalog-wide, 13) | `api.service.ts:144-145` |
| SP control-list service | `GetScienceProgramsService.list` signal, loaded via service-locator key `sciencePrograms` | `control-list/get-science-programs.service.ts`, `service-locator.service.ts:248` |
| Read-only gate | `editable` computed returns false when `alignment.is_read_only` | `bilateral.service.ts:34-40` |
| Read-only flags on interface | both `is_synced_to_prms` + `is_read_only` present | `pool-funding-alignment.interface.ts:21-22` |
| Existing banners | `SYNCED_BANNER`, `READ_ONLY_BANNER` (permission), `SYNCED_BADGE_LABEL` | `pool-funding-alignment.component.ts:77-80`; template `pf-alignment-synced-banner` + `pf-alignment-readonly-banner` |
| PATCH error infra | `PatchAlignmentResult.fieldErrors`; component `inlineErrors` signal | `bilateral.service.ts:16-18`, `pool-funding-alignment.component.ts:75` |
| CTA copy | `HLO_CARD_CTA_LABEL = 'Select'` (note: differs from the `View HLOs` proposed in indicator-mapping OQ-FIG-5 — out of scope here) | `pool-funding-alignment.component.ts:88` |

**Conclusion**: REQ-01 is a real change (wrong endpoint). REQ-02 is a *differentiation* (gating already works). REQ-03 is *wiring a key* (infra exists). All three are small and well-scoped.

---

## 7. Requirement ID index

| ID | Title | Type | Est. |
| --- | --- | --- | --- |
| REQ-BIL-ASR-01 | Per-result SP picker | Functional | ~½ day |
| REQ-BIL-ASR-02 | PRMS-sourced read-only differentiation | Functional | ~½ day |
| REQ-BIL-ASR-03 | `unknown_sp_codes` 400 handler | Functional | ~½ day |
| NF-ASR-01..04 | No backend dep / a11y / coverage / theming | Non-functional | — |

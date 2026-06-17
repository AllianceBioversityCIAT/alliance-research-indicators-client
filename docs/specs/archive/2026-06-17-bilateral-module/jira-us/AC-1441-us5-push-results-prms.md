# US5 — Push Results into the PRMS (Jira AC-1441)

> **DRAFT — PO synthesis.** This story has only a title in Jira ([AC-1441](https://cgiarmel.atlassian.net/browse/AC-1441)). The Story / AC / Notes below are derived from the title plus the AC-1385 epic context ([PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)) and — critically — the detailed PRMS-side ingestion contract documented in [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §12 and §16. **Pending BA confirmation** before the SDD spec consumes them.

> **Status**: Open
> **Issue type**: User Story
> **Epic**: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385)
> **Discovery idea**: [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
> **Source maturity**: **DRAFT** (PO synthesis; pending BA confirmation)
> **Figma**: TBD (push is largely a system behavior; UI surface is likely a status indicator)

---

## 1. Story

**As a** Researcher (and the STAR system on the user's behalf),
**I can** push a completed Pool-Funding-aligned result from STAR to **PRMS** so it can be ingested and reviewed by Science Program / Accelerator leads downstream,
**so that** the Pool Funding contribution declared in STAR (US2 + US3 + US4) is recognized in the central CGIAR results-management system without duplicate data entry.

---

## 2. Background / Context

This is the **federation boundary** between STAR and PRMS. PARI-194 explicitly says STAR will "allow Principal Investigators to confirm whether a result contributes to Pool Funding" and then map it; once that mapping exists, the result must reach PRMS. PRMS has a documented ingestion API at `POST /api/bilateral/create` ([`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §12 and §4.3) that accepts structured payloads from external systems — STAR is one of those external systems for this flow.

There is a **structural divergence** to address: PRMS excludes `/api/bilateral/*` from JWT middleware and uses a custom `auth:` header on its review endpoints ([`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §16). STAR is locked to AWS Cognito + JWT (PRD C-2). Two paths:

1. STAR's backend mediates: STAR's NestJS server (which is already on Cognito) calls PRMS's bilateral endpoint with the agreed integration credential (API key, mTLS, or similar). The STAR client never talks to PRMS directly.
2. STAR's client pushes directly through a backend-for-frontend that adds the right auth. Same effect.

In both cases the **STAR client** does not embed any PRMS credential. This story's frontend slice is mostly **trigger + status surface**.

---

## 3. Acceptance criteria (DRAFT)

- **AC-1 (DRAFT)**: A STAR result that belongs to a Pool Funding Contributor project (US1) and has a non-empty Pool Funding Alignment (US2 + US4) can be pushed to PRMS.
- **AC-2 (DRAFT)**: Push is triggered by **a defined event** — pending BA: candidate events include result submission, review acceptance, manual "Push to PRMS" button, scheduled sync. The choice has UX implications (manual button needs a visible control; submission-triggered does not).
- **AC-3 (DRAFT)**: The STAR backend constructs the PRMS ingestion payload following the contract documented in [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §4.3 (common `data` fields including `toc_mapping.science_program_id`, `lead_center`, `submitted_by`, `geo_focus`, `evidence`, `contributing_bilateral_projects`, and the type-specific block matching the STAR result's type — KP / Capacity Sharing / Innovation Dev / Innovation Use / Policy Change).
- **AC-4 (DRAFT)**: A successful push records the PRMS-returned identifiers (e.g., PRMS `result_code`, `result_id`) on the STAR result so the link is durable and the result becomes "synchronized" in the sense referenced by [US2 AC ("becomes read-only after synchronization")](./AC-1594-us2-pool-funding-alignment.md).
- **AC-5 (DRAFT)**: A failed push (4xx / 5xx, 409 conflict, network timeout) does not silently drop. The user — or an admin — sees a clear, recoverable error state, and the push can be retried. STAR uses [`http-error.interceptor.ts`](../../../../research-indicators/src/app/shared/interceptors/http-error.interceptor.ts) and [`global-toast`](../../../../research-indicators/src/app/shared/components/global-toast) / [`global-alert`](../../../../research-indicators/src/app/shared/components/global-alert) for surfacing.
- **AC-6 (DRAFT)**: A push attempt is **audited** with timestamp, actor (or "system"), and outcome. Mirrors PRMS's own audit posture in its review history.
- **AC-7 (DRAFT)**: Duplicate detection: pushing a result that already exists on the PRMS side (same `platform_code` + `official_code`) is handled per the PRMS 409 contract ([`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §5) — STAR offers a "link to existing" path rather than silently producing a duplicate.
- **AC-8 (DRAFT)**: No PRMS credential is exposed to the STAR client; all push traffic is mediated by STAR's backend.

---

## 4. Other information / Notes

- The **PRMS ingestion payload contract** is the most stable starting point — quoted in [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §4.3 with the type-specific blocks documented at §6.4 (data-standard update) and PRMS §4.3 of `integration-contracts.md` (External Ingestion Contract). STAR's payload should match these shapes.
- **Auth model**: STAR's client uses `Authorization: Bearer` via [`jwt.interceptor.ts`](../../../../research-indicators/src/app/shared/interceptors/jwt.interceptor.ts). STAR's backend must translate to PRMS's expected auth on the way out (custom header `auth:` for review endpoints, perimeter-mediated for `/api/bilateral/*` ingestion).
- **Versioning**: STAR results are versioned ([`detailed-design.md`](../../../detailed-design/detailed-design.md) §3.2); the push must capture which version was pushed, and re-pushes (after subsequent edits) must be handled deterministically — pending BA.

---

## 5. STAR fit notes

### Persona mapping
- **Primary actor**: depends on AC-2 trigger choice:
  - Manual button → **Researcher** initiates; UI control belongs in the result detail.
  - Submission-triggered → STAR system acts on behalf of the **Researcher**.
  - Scheduled job → STAR system, no user action.
- **Admin** is always allowed to retry / unstick stuck pushes.

### PRD constraints touched
- **C-2 (AWS Cognito + JWT)**: critical. STAR client must not call PRMS directly with PRMS credentials. STAR backend mediates. See [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §16 for the auth divergence narrative.
- **C-3 (CLARISA)**: payload uses CLARISA-facing IDs for institutions, geography, indicators (consistent with PRMS contract stability rule, [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §12.2).
- **C-4 (WCAG 2.1 AA)**: if a manual "Push to PRMS" button exists, it must be keyboard reachable, with an accessible name and a live-region announcement on success / failure.

### Components & services to reuse
- **Status surface**: [`alert-tag`](../../../../research-indicators/src/app/shared/components/alert-tag), [`custom-tag`](../../../../research-indicators/src/app/shared/components/custom-tag), [`global-toast`](../../../../research-indicators/src/app/shared/components/global-toast).
- **API plumbing**: [`api.service.ts`](../../../../research-indicators/src/app/shared/services/api.service.ts) + a domain service `bilateral-push.service.ts`.
- **Error path**: [`http-error.interceptor.ts`](../../../../research-indicators/src/app/shared/interceptors/http-error.interceptor.ts), [`actions.service.ts`](../../../../research-indicators/src/app/shared/services/actions.service.ts). The PRMS 409 duplicate flow follows the pattern already used elsewhere in STAR (see [`detailed-design.md`](../../../detailed-design/detailed-design.md) §4.4).
- **Submission integration**: [`submission.service.ts`](../../../../research-indicators/src/app/shared/services/submission.service.ts) is the natural touchpoint if the trigger is submission-on-result.

### Backend / API implication
- STAR backend endpoint: `POST /api/results/:id/push-to-prms` (or similar) — returns `MainResponse<{ prmsResultCode, prmsResultId, pushedAt }>`.
- Internally STAR backend calls PRMS `POST /api/bilateral/create` with the contract from [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §4.3 and handles the PRMS envelope per §12.2.
- **Idempotency**: STAR should set an idempotency key on each push (matches PRMS's `idempotencyKey` field example in [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §4.3 — `"idempotencyKey": "external-key"`).

### Open questions
- **OQ-H** ([README.md §6](./README.md)): Push trigger event — submission? review acceptance? manual? scheduled?
- **OQ-1441-A**: Who owns the STAR↔PRMS integration credential management — the STAR backend team, PRMS team, or a central CGIAR ops team?
- **OQ-1441-B**: What happens when a STAR result is edited *after* a successful push (and US2's "read-only after synchronization" rule is in place)? Is re-push automatic, blocked, or a separate admin action?
- **OQ-1441-C**: Are non-Pool-Funding-aligned results also pushed (e.g., for federated discovery), or only those with Pool Funding Alignment?
- **OQ-1441-D**: KP results in PRMS source title/description/evidence from CGSpace/MQAP rather than the payload (see [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §2 KP special case). Should STAR omit those fields for KPs, or send them and let PRMS override?

---

## Pending BA confirmation

The BA must validate or revise the following before the SDD spec consumes this story:

1. The **trigger** for push (OQ-H) — the headline unknown.
2. The set of result types in scope. STAR's existing result-detail tabs cover Capacity Sharing, Innovation Details, Policy Change, OICR/KP — confirm each maps to a PRMS `result_type_id` per [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §2.
3. Re-push behavior after edits (OQ-1441-B).
4. Whether non-aligned results are also in scope (OQ-1441-C).
5. KP override behavior (OQ-1441-D).

---

## 6. References

- Jira: [AC-1441](https://cgiarmel.atlassian.net/browse/AC-1441)
- Epic: [AC-1385](https://cgiarmel.atlassian.net/browse/AC-1385) / [PARI-194](https://cgiarmel.atlassian.net/browse/PARI-194)
- Depends on: [US2 / AC-1594](./AC-1594-us2-pool-funding-alignment.md), [US4 / AC-1440](./AC-1440-us4-map-results-indicators.md), [US7 / AC-1595](./AC-1595-us7-sync-sp-toc.md)
- Sibling (**critical**): [`../prms-context/frontend-context.md`](../prms-context/frontend-context.md) §4.3 (payload), §6.4 (data-standard shape), §12 (endpoint catalog), §16 (auth divergence — most important), §15 R11 (risk).
- STAR PRD: [`../../../prd.md`](../../../prd.md) §8.3 (C-2 critical for this story).
- STAR detailed design: [`../../../detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §4 (API envelope), §7 (integration points), §8 (security), §9 (errors).
- SDD methodology: [`../../general-setup/requirements.md`](../../general-setup/requirements.md).

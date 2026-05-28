# Validation Report — Bilateral Module / Alignment-Section Remediation

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/alignment-section-remediation/` |
| Validated against | `requirements.md` + `tasks.md` (no `design.md` — inline by design; no `execution.md` — not started) |
| Validation date | 2026-05-27 |
| Branch (FE) | `AC-1594-bilateral-module` @ `f93553b5` |
| Backend contract source | [`../ari-backend-context/frontend-data-model.md`](../ari-backend-context/frontend-data-model.md) (snapshot, source commit `48cc3e8c`) |
| Validator | `/sdd-validate` (Claude) |
| Overall result | **SPEC-VALID, PRE-IMPLEMENTATION** — coherent, grounded, execution-ready; 0/3 tasks built |
| Archive readiness | **NOT READY** — implementation has not started. Run `/sdd-execute` first. |

---

## 2. Summary

This spec is a **pre-implementation** remediation arc: three independent, path-agnostic fixes to the already-shipped Pool Funding Alignment section. All three tasks are `pending`; no code has been written, so there is no implementation to conform-check. What *can* be validated at this stage is **(a)** spec internal coherence and requirement↔task coverage, and **(b)** whether the §6 current-code audit — on which the entire task-sizing rests — is accurate against today's code.

**Result:** the §6 audit is **accurate** on every claim checked. REQ-01 (per-result SP picker) and REQ-02 (PRMS-sourced read-only) are correctly scoped. **REQ-03 is mildly under-scoped**: the spec frames it as "infra exists — just wire the key," but the existing field-error parser cannot capture an array-valued field like `unknown_sp_codes` without modification (see §7). One accessibility AC is not threaded into the task acceptance criteria (§6). Neither blocks execution; both are recorded as remediation for the implementer.

| Dimension | Result |
| --- | --- |
| Task completion | 0/3 — **PENDING** (expected; spec not yet executed) |
| File existence (spec + touch-targets) | **PASS** (one documented omission: `design.md`) |
| Build integrity | **DEFERRED** — belongs to `/sdd-execute` (nothing built) |
| Requirement coverage (mapping) | **PASS** — 3/3 functional REQs mapped to tasks |
| §6 audit accuracy | **PASS** — all claims verified against current code |
| Spec quality / scoping | **WARN ×2** — REQ-03 parser gap, NF-ASR-02 a11y not in task ACs |
| Design conformance (C-1…C-6) | **PASS** |

---

## 3. Task completion

No task has been started. This is the expected state for a spec that is "DRAFT — ready for `/sdd-execute`." Not marked FAIL because the spec never claimed completion.

| Task | Status | Note |
| --- | --- | --- |
| T-BIL-ASR-01 — Per-result SP picker | `pending` | Genuine work — per-result method does not exist (`GET_PoolFundingSciencePrograms` absent from `api.service.ts`). |
| T-BIL-ASR-02 — PRMS-sourced read-only differentiation | `pending` | Genuine work — no `PRMS_SOURCED_*` constants or `readOnlyCause` computed exist yet. |
| T-BIL-ASR-03 — `unknown_sp_codes` 400 handler | `pending` | Genuine work — see §7 WARN-1; larger than "wire a key." |

---

## 4. File existence

### 4.1 Spec documents

| File | Expected | Present | Result |
| --- | --- | --- | --- |
| `requirements.md` | yes | yes | PASS |
| `tasks.md` | yes | yes | PASS |
| `design.md` | conditionally | **no** | WARN — intentionally omitted; `tasks.md` §3 documents "no separate design.md — proportionate for three ~½-day fixes" with design notes inline. Acceptable per methodology for a small arc; recorded so it is not mistaken for drift. |
| `execution.md` | after execution | no | N/A — not executed yet |
| `validation-report.md` | this file | yes | PASS |

### 4.2 Code files the tasks will touch (must exist to modify)

| File | Present | Evidence |
| --- | --- | --- |
| `shared/services/api.service.ts` | yes | `GET_SciencePrograms` @ :144; alignment URL builder + `STAR-` strip @ :663-667; `GET_PoolFundingAlignment` @ :670 |
| `shared/services/bilateral.service.ts` | yes | `PatchAlignmentResult.fieldErrors` @ :18; `editable` gate @ :34-40; `extractFieldErrors` @ :117-131 |
| `shared/interfaces/bilateral/pool-funding-alignment.interface.ts` | yes | `is_synced_to_prms` + `is_read_only` @ :21-22 |
| `.../result/pages/pool-funding-alignment/pool-funding-alignment.component.ts` | yes | `inlineErrors` @ :75; banners/badge @ :77-79; `HLO_CARD_CTA_LABEL` @ :88 |
| `pool-funding-alignment.component.spec.ts` | yes | existing 400/inlineErrors + label assertions present (good regression baseline) |

### 4.3 New files/symbols the tasks will create (correctly absent today)

- `GET_PoolFundingSciencePrograms(...)` in `api.service.ts` — **absent** ✓ (REQ-01)
- `PoolFundingSciencePrograms` / `PoolFundingScienceProgram` types — **absent** ✓ (REQ-01)
- `sciencePrograms` / `mappingStatus` signals on `bilateral.service.ts` — **absent** ✓ (REQ-01)
- `PRMS_SOURCED_BADGE_LABEL` / `PRMS_SOURCED_BANNER` / `readOnlyCause` — **absent** ✓ (REQ-02)

### 4.4 Referenced artifacts

| Reference | Resolves | Result |
| --- | --- | --- |
| `../ari-backend-context/frontend-data-model.md` | exists | PASS |
| `../../archive/2026-05-26-bilateral-module--alignment-section/` | exists | PASS |

---

## 5. Build integrity

**DEFERRED.** No implementation exists, so a build/type-check/lint run would only re-validate the current `main`/branch baseline — it would say nothing about this spec. Build verification (`npm run lint` + `npm run test -- pool-funding-alignment bilateral.service api.service` + `npm run build`) is part of each task's **Done when** and belongs to the `/sdd-execute` phase. The existing `pool-funding-alignment.component.spec.ts` already covers the 400→`inlineErrors`→no-toast path and the label constants, giving the implementer a regression baseline.

---

## 6. Requirement coverage

All functional requirements map to a task; coverage is structural (mapping), not behavioral (no code yet).

| Requirement | Mapped task | Mapping | Behavioral |
| --- | --- | --- | --- |
| REQ-BIL-ASR-01 — Per-result SP picker | T-BIL-ASR-01 | PASS | not implemented |
| REQ-BIL-ASR-02 — PRMS-sourced read-only | T-BIL-ASR-02 | PASS | not implemented |
| REQ-BIL-ASR-03 — `unknown_sp_codes` 400 | T-BIL-ASR-03 | PASS | not implemented — see §7 WARN-1 |
| NF-ASR-01 — No new backend dep | implicit (all consume live contracts) | PASS | — |
| NF-ASR-02 — Accessibility (role/aria parity; `role="alert"` on inline SP errors) | not explicitly threaded into T-02/T-03 ACs | **WARN-2** | — |
| NF-ASR-03 — No coverage regression | task `Done when` (tests required) | PASS | — |
| NF-ASR-04 — Dark + light parity | T-BIL-ASR-02 notes (badge/banner) | PASS | — |

**WARN-2:** NF-ASR-02 (WCAG 2.1 AA — C-4) is stated in requirements but the corresponding tasks (T-BIL-ASR-02 badge/banner, T-BIL-ASR-03 inline SP error) do not carry an explicit a11y acceptance line. Risk: the `role`/`aria-label` parity and `role="alert"` get dropped at implementation. Remediation in §10.

---

## 7. Linting & code quality (spec-grounding audit)

No code to lint. Instead, the §6 audit claims were verified against current code, and the task scoping was sanity-checked.

### §6 audit — verified accurate

| §6 claim | Verified | Evidence |
| --- | --- | --- |
| SP picker uses catalog-wide `GET_SciencePrograms` → `tools/clarisa/science-programs` | ✓ | `api.service.ts:144` |
| `editable` returns false when `is_read_only` | ✓ | `bilateral.service.ts:34-40` (`:37`) |
| Both `is_synced_to_prms` + `is_read_only` on interface | ✓ | `pool-funding-alignment.interface.ts:21-22` |
| Existing `SYNCED_BANNER` / `READ_ONLY_BANNER` (permission) / `SYNCED_BADGE_LABEL` | ✓ | `pool-funding-alignment.component.ts:77-79` |
| `PatchAlignmentResult.fieldErrors` + `inlineErrors` signal exist | ✓ | `bilateral.service.ts:18`; `component.ts:75` |
| `STAR-` strip helper exists to reuse (REQ-01 AC-01.4) | ✓ | `api.service.ts:663-667` (`resultCode.replace(/^STAR-/i, '')`) |
| URL-scoped 400 toast suppression for `/pool-funding-alignment` | ✓ (behavior) | covered by existing test `component.spec.ts:430` ("400 with fieldErrors … does NOT fire toast") |

### WARN-1 — REQ-03 is under-scoped: the existing parser cannot capture `unknown_sp_codes`

The spec frames REQ-03 as "infra exists — this wires the specific key" (requirements §4 REQ-BIL-ASR-03 "Current state"; tasks T-BIL-ASR-03). The infra (`PatchAlignmentResult.fieldErrors`, `inlineErrors`, toast suppression) does exist — but the **parser that populates `fieldErrors` will silently drop `unknown_sp_codes`** as written:

- `bilateral.service.ts:117-131` `extractFieldErrors` requires `errorDetail.errors` to be a **JSON string** (`typeof raw !== 'string' … return undefined`; then `JSON.parse`).
- It then keeps **only string-valued** entries: `if (typeof v === 'string') result[k] = v`.
- The backend contract is `errors.unknown_sp_codes: string[]` — an **array**. `typeof [] !== 'string'`, so even if `errors` arrives as stringified JSON, the array is filtered out and `fieldErrors` comes back empty.
- Compounding it: `ErrorResponse.errors` is typed `string` (`responses.interface.ts:17`). If the backend returns `errors` as an **object** (`errors.unknown_sp_codes`) rather than a stringified JSON string, the `typeof raw !== 'string'` guard short-circuits to `undefined` immediately, and the `ErrorResponse` type itself would need widening.

**Net:** T-BIL-ASR-03 is not "wire a key" — it must **extend `extractFieldErrors`** (special-case `unknown_sp_codes`, e.g. join the array into a message, or carry a dedicated `unknownSpCodes: string[]` on `PatchAlignmentResult`) **and** likely confirm/adjust the `ErrorResponse.errors` shape. Still S-sized, but the framing should be corrected so the implementer doesn't assume a no-op extraction. The task's existing "confirm the exact error envelope against Swagger / a live 400" note partly covers this, but it does not flag the **string-only filter** or the **`errors: string` type** constraint. Remediation in §10.

---

## 8. Design conformance

| Constraint | Result | Note |
| --- | --- | --- |
| C-1 (Angular 19 + PrimeNG 19) | PASS | Modifies existing standalone component + service; no new framework surface. |
| C-3 (CLARISA controlled vocab) | PASS | Per-result SP list is backend-derived from the result's CLARISA project; AC-01.5 keeps the catalog endpoint only for display-only contexts — no parallel taxonomy. |
| C-4 (WCAG 2.1 AA) | WARN | Stated as NF-ASR-02 but not threaded into task ACs — see WARN-2. |
| C-6 (lazy standalone) | N/A | No new route/component. |
| Backend contract alignment | PASS | Endpoint, response shape, read-only union (R-BIL-071), and 400 envelope all trace to `frontend-data-model.md` §3.3/§4; tasks build in a live-shape confirmation gate against `AC-1594-bilateral-module-v2`. |
| Independence from OQ-IM-1 | PASS | Spec consistently scopes this arc away from the PO-blocked contribution write flow (requirements §3.2, tasks §6). |
| Inline design (no `design.md`) | WARN-info | Documented and proportionate; acceptable. |

---

## 9. Test evidence summary

- **New tests:** none yet (pre-implementation). Each task specifies its own test set in `Done when`; NF-ASR-03 forbids coverage regression.
- **Existing baseline (good):** `pool-funding-alignment.component.spec.ts` already asserts the 400→`inlineErrors` mapping, the no-toast behavior, and the banner/badge/CTA label constants. The implementer should **extend** these (not replace) for the three new branches: `mapping_status` empty states (T-01), `readOnlyCause` three-way matrix (T-02), and `unknown_sp_codes` parse + chip highlight + clear-on-change (T-03).

---

## 10. Remediation

| # | Severity | Finding | Recommended action | Status |
| --- | --- | --- | --- | --- |
| R-1 | WARN | REQ-03 framed as "wire a key," but `extractFieldErrors` (string-only filter, expects stringified `errors`) cannot capture `unknown_sp_codes: string[]`; `ErrorResponse.errors` is typed `string`. | Update T-BIL-ASR-03 notes + requirements §4 REQ-BIL-ASR-03 "Current state" to call out the parser/type change. Implement either (a) special-case array→message in `extractFieldErrors`, or (b) a dedicated `unknownSpCodes: string[]` on `PatchAlignmentResult`. Confirm live envelope on `AC-1594-bilateral-module-v2`. | **RESOLVED 2026-05-27** — applied to `requirements.md` REQ-BIL-ASR-03 + `tasks.md` T-BIL-ASR-03 (Touches/notes/tests/Done-when). |
| R-2 | WARN | NF-ASR-02 (a11y) not present in T-02/T-03 acceptance criteria. | Add an a11y `Done when` line to both tasks: new badge/banner gets `role`/`aria-label` parity with the synced badge; inline SP error container uses `role="alert"`. | **RESOLVED 2026-05-27** — a11y `Done when` lines added to T-BIL-ASR-02 + T-BIL-ASR-03. |
| R-3 | INFO | AC-01.6 SP icon path `/assets/result-framework-reporting/SPs-Icons/{icon_key}.png` is unverified. | At execution, confirm the asset directory + filename casing exist before relying on `icon_key`. | Open — executor (execution-time). |
| R-4 | INFO | No `design.md` (inline by choice). | None required — keep documented in `tasks.md` §3. Re-evaluate only if scope grows. | Accepted. |

R-1 and R-2 were applied in the same change as this report, so the spec now carries the corrected REQ-03 scope and explicit a11y ACs. R-3 is an execution-time check; R-4 is accepted.

---

## 11. Archive readiness recommendation

**NOT READY for `/sdd-archive`.** This is correct and expected — the spec is pre-implementation (0/3 tasks built). Archiving applies only after implementation + test + a clean validation pass.

**Recommended path:**

1. ~~Apply R-1 and R-2 spec edits~~ — **done in this change** (REQ-03 rescoped; a11y ACs added to T-02/T-03).
2. Run `/sdd-execute docs/specs/bilateral-module/alignment-section-remediation` (bundle the three tasks into one PR per `tasks.md` §4; verify live contract shapes on `AC-1594-bilateral-module-v2` first — especially the `unknown_sp_codes` envelope per R-1).
3. Re-run `/sdd-validate` against the implemented code (build integrity + behavioral coverage will then be checkable).
4. When tasks are `[x]`, no FAIL remains, and WARNs are resolved/accepted → `/sdd-archive`.

This arc remains **independent of OQ-IM-1** and can ship while the PO decision is pending.

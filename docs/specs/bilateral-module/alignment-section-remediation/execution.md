# Execution Log — Bilateral Module / Alignment-Section Remediation

> Canonical audit trail of the JCSPECS Leader → Implementer → Reviewer loop for this spec. Appended on every loop iteration. Triad personas: [`/.agents/`](../../../../.agents/).

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/alignment-section-remediation/` |
| Branch | `AC-1594-bilateral-module` |
| Constitution scaffolded | `.agents/` triad created 2026-05-27 (commit `14925dbf`) |
| Tasks | T-BIL-ASR-01 (SP picker) · T-BIL-ASR-02 (PRMS read-only) · T-BIL-ASR-03 (unknown_sp_codes) — bundle into one PR per `tasks.md` §4 |
| Live-backend caveat | The Leader cannot reach a running `AC-1594-bilateral-module-v2`; implementation builds against the documented contract in `../ari-backend-context/frontend-data-model.md`. Live-shape verification remains a pre-merge step. |

---

## 2. Task execution history

### T-BIL-ASR-01 — Per-result SP picker

**Status:** `complete` ✅ — PASS on attempt 2 (2026-05-27).
**Requirements covered:** REQ-BIL-ASR-01 (AC-01.1 … AC-01.7).

#### Attempt 1 — Implementer (general-purpose `impl-asr-01`)

- **Files changed:** `pool-funding-alignment.component.{ts,html,spec.ts}`; `shared/interfaces/bilateral/pool-funding-alignment.interface.ts`; `shared/interfaces/services.interface.ts`; `shared/services/api.service.{ts,spec.ts}`; `shared/services/bilateral.service.{ts,spec.ts}`; `shared/services/service-locator.service.ts`; NEW `shared/services/control-list/get-bilateral-science-programs.service.{ts,spec.ts}`. (+574 / −47)
- **Approach:** Added `GET_PoolFundingSciencePrograms` (reuses the `bilateralPath()` STAR-strip helper, `/science-programs` suffix); `sciencePrograms`/`mappingStatus`/`loadingSciencePrograms` signals + `getSciencePrograms()` on `BilateralService` (no catalog fallback on failure). Because the shared `MultiselectComponent` sources options via `serviceName` → `ServiceLocatorService` (no `[options]` input), bridged through a new control-list service `GetBilateralScienceProgramsService` (key `bilateralSciencePrograms`) that mirrors the BilateralService signals and maps `code → official_code` to preserve the form's PATCH contract (AC-01.7).
- **Verification:** `npm run test -- pool-funding-alignment bilateral.service api.service get-bilateral-science-programs` → 4 suites / 273 tests pass; `npm run lint` clean; `npm run build` clean. (Reviewer independently confirmed test + lint.)
- **Reviewer verdict (code-reviewer `rev-asr-01`): `STATUS: FAIL` — 4 issues:**
  1. **SPEC DEFECT (regression):** AC-01.6 specified `/assets/result-framework-reporting/SPs-Icons/{icon_key}.png`; that directory does not exist (`public/sps/` holds the 13 PNGs). Following the AC verbatim changed a working `/sps/{official_code}.png` `<img src>` into a 404. → Leader corrected the spec (see Pivot Record below); Implementer to revert the path.
  2. **Dead code:** `showSpPicker` computed declared but unused in the template (template uses an inline `@if/@else if/@else` chain). Divergence is a maintenance trap.
  3. **Empty-picker flash:** when `mappingStatus` is `null` (pre-resolution) AND `has_contribution===true`, the `@else` branch renders the multiselect with an empty list briefly. Guard the picker on `mappingStatus() !== null`.
  4. **Minor / non-blocking (pre-existing):** `selectedItemsSurfaceColor="#FFFFFF"` hex literal carried over from the old picker — not introduced by this diff. Follow-up only.

#### Pivot Record: T-BIL-ASR-01 (spec correction — AC-01.6 icon path)

- **Blocker:** AC-01.6 transcribed the backend `frontend-data-model.md` §3.3 aspirational icon path verbatim. That asset directory is not provisioned in the STAR repo, so the AC as written produces broken images.
- **Decision:** Reality wins (per root `CLAUDE.md` "fix one or the other — never let them drift"). Corrected AC-01.6 to use the existing `/sps/{icon_key}.png` assets (resolves validation-report R-3). Forward note retained: if the `/assets/result-framework-reporting/SPs-Icons/` assets are ever provisioned, switch back and re-confirm with the backend team.
- **Scope:** Minor asset-path correction, not a structural pivot of the task's approach. Rework continues (Issues 2 + 3 require fixes regardless).

#### Attempt 2 — Implementer (resumed `impl-asr-01`)

- **Fixes applied:**
  1. Issue 1 — both `<img [src]>` bindings reverted to `'/sps/' + row.icon_key + '.png'` (matches corrected AC-01.6); kept `[alt]="row.code + ' icon'"` + the `code — allocation%` label.
  2. Issue 2 — template `@if` chain restructured to `@if (isUnmapped()) … @else if (hasNoSciencePrograms()) … @else if (showSpPicker())`; `showSpPicker` is now the sole template gate (no dead code).
  3. Issue 3 — `showSpPicker = mappingStatus() !== null && !isUnmapped() && !hasNoSciencePrograms()`; when `mappingStatus` is null (loading/initial) none of the three branches render (no empty-picker flash). Exposed `loadingSciencePrograms` for completeness.
  4. Issue 4 — intentionally left untouched (pre-existing `selectedItemsSurfaceColor="#FFFFFF"`).
- **Tests:** icon assertion now expects `/sps/SP09.png`; added spec at `pool-funding-alignment.component.spec.ts:383` ("null mappingStatus renders neither empty-state nor the picker"); existing `showSpPicker()` assertions hold under the null-guarded logic.
- **Verification:** `npm run test -- pool-funding-alignment bilateral.service api.service get-bilateral-science-programs` → **4 suites / 274 tests pass**; `npm run lint` clean; `npm run build` exit 0 (pre-existing warnings only).
- **Reviewer verdict (`rev-asr-01`): `STATUS: PASS`.** Confirmed: no surviving `/assets/result-framework-reporting/SPs-Icons/` runtime reference; the null-mappingStatus test exists + passes; AC-01.1…AC-01.7 satisfied; PATCH body untouched; Issue 4 the only remaining item, correctly non-blocking.

#### Leader post-PASS cleanup (comment-only, no re-review needed)

- Aligned the JSDoc on `PoolFundingScienceProgram` (`pool-funding-alignment.interface.ts`) — it still cited the old aspirational `/assets/result-framework-reporting/SPs-Icons/` path (Reviewer's minor note). Updated to `/sps/{icon_key}.png` + a "See spec AC-01.6" pointer so it doesn't become a future "fix this path" trap. Zero runtime effect.

#### Decisions / notes

- **Scope expansion accepted:** the new control-list service `GetBilateralScienceProgramsService` (+ `bilateralSciencePrograms` service-locator key + `services.interface.ts` union entry) is beyond the files `tasks.md` literally listed, but is the minimal correct adaptation to the shared `MultiselectComponent` (which sources options via `serviceName` → `ServiceLocatorService`, not an `[options]` input). `BilateralService` remains the single source of truth. Reviewer judged it appropriate.
- **LIVE-VERIFY (carried to PR):** built against the documented `frontend-data-model.md` §3.3 contract; the live response shape on `AC-1594-bilateral-module-v2` should be confirmed pre-merge. On a non-200 the service sets `[]` + `mappingStatus=null` (picker empty, no catalog fallback) — confirm the live error envelope matches.
- **Follow-up (non-blocking):** pre-existing `selectedItemsSurfaceColor="#FFFFFF"` hex literal (Issue 4) — token-map in a later pass when the `MultiselectComponent` API allows.

---

### T-BIL-ASR-02 — PRMS-sourced read-only differentiation

**Status:** `complete` ✅ — PASS on attempt 1 (2026-05-27).
**Requirements covered:** REQ-BIL-ASR-02 (AC-02.1 … AC-02.5).

#### Attempt 1 — Implementer (resumed `impl-asr-01`)

- **Files changed:** `pool-funding-alignment.component.{ts,html,spec.ts}`. (+213 / −12)
- **Approach:** Added `isSyncedToPrms` + `readOnlyCause` computeds (`'synced' | 'prms-sourced' | 'permission' | null`; `is_read_only` short-circuits before `editable()`, per `tasks.md` derivation). New constants `PRMS_SOURCED_BADGE_LABEL='Owned by PRMS'`, `PRMS_SOURCED_BANNER`, `PRMS_SOURCED_BADGE_ARIA_LABEL`, `PRMS_SOURCED_409_DESCRIPTION`. Template branches badge + banner on `readOnlyCause()` (synced / prms-sourced / permission). The 409 refetch pre-existed (from T-01's commit); only the toast COPY was branched on the locked PRMS-sourced description — generic 409s keep the verbatim "Synced to PRMS" toast.
- **`is_synced_to_prms`:** read off the alignment signal; `AlignmentResponse.is_synced_to_prms` already existed (no interface change).
- **AC-02.5:** existing `[disabled]="!editable() || isReadOnly()"` + `[showSave]="editable() && !isReadOnly()"` bindings already disable inputs identically for all three causes — unchanged, verified.
- **Tests:** added a full REQ-BIL-ASR-02 suite (readOnlyCause four-state derivation; AC-02.1/02.2/02.3/02.5/02.4 DOM + 409-refetch; non-PRMS 409 regression). Disambiguated two pre-existing "synced" DOM tests by adding `is_synced_to_prms: true` (baseAlignment had it false → would now resolve to 'prms-sourced'); strengthened them with prms-sourced-absent assertions.
- **Verification:** `npm run test -- pool-funding-alignment bilateral.service` → **2 suites / 93 tests pass**; `npm run lint` clean; `npm run build` exit 0.
- **Reviewer verdict (`rev-asr-01`): `STATUS: PASS`.** Claim-by-claim verified: derivation matches tasks.md; refetch pre-existed (only toast branched); AC-02.5 disabling structurally identical; the two modified tests are legitimate disambiguation (coverage increase); a11y parity (aria-label + role="status", `pf-synced` token, no new hex); T-01 picker chain untouched.

#### A11y / tokens

- New badge reuses `statusId="pf-synced"` (token color, dark+light parity per NF-ASR-04) + `[attr.aria-label]`; banner `role="status" aria-live="polite"` — parity with the synced badge/banner (NF-ASR-02). No new hex.

---

*(Summary section will be added when all tasks reach a terminal state.)*

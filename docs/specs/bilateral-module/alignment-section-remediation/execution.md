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

### T-BIL-ASR-03 — `unknown_sp_codes` 400 handler

**Status:** `complete` ✅ — PASS on attempt 1 (2026-05-27).
**Requirements covered:** REQ-BIL-ASR-03 (AC-03.1 … AC-03.4).

#### Attempt 1 — Implementer (resumed `impl-asr-01`)

- **Files changed:** `bilateral.service.{ts,spec.ts}`, `pool-funding-alignment.component.{ts,html,scss,spec.ts}`. (+338 / −4)
- **Approach:** Added a SEPARATE, envelope-tolerant `extractUnknownSpCodes` (the shipped `extractFieldErrors` keeps only string-valued entries from stringified-JSON, so it drops the array — R-1). It accepts `errorDetail.errors` as a stringified-JSON string OR an already-parsed object, reads `unknown_sp_codes`, keeps non-empty strings. New `unknownSpCodes?: string[]` on the `PatchAlignmentResult` ok:false variant (spread only when present). `extractFieldErrors` left **byte-for-byte unchanged**.
- **Component:** `rejectedSpCodes` signal + `isRejectedSp()` + `buildRejectedSpMessage()`; 400 handler takes the `unknownSpCodes` branch (merges any `fieldErrors`, sets `inlineErrors['sp_codes']` to the AC-03.3 message) only when the array is non-empty, else falls through to the unchanged `fieldErrors` path. Chip highlight via `[class.pf-sp-chip-rejected]` in the picker's `#rows` slot (shared `MultiselectComponent` untouched). `(selectEvent)="onSpSelectionChange()"` + contribution-flip-to-No clear `rejectedSpCodes` + the `sp_codes` inline error surgically (AC-03.4); `onSave()` resets up front.
- **SCSS:** `.pf-sp-chip-rejected` uses `var(--ac-red-1)` (light `#cf0808` / dark `#ff4d4d` in `colors.scss`) — no hex literal, dark/light parity (NF-ASR-04).
- **A11y (NF-ASR-02):** the inline `sp_codes` error keeps `role="alert" aria-live="polite"`; it renders inside the T-01 `@else if (showSpPicker())` block — visible in exactly the state where a rejected-code 400 can occur.
- **Verification:** `npm run test -- pool-funding-alignment bilateral.service` → **2 suites / 105 tests pass**; `npm run lint` clean; `npm run build` exit 0.
- **Reviewer verdict (`rev-asr-01`): `STATUS: PASS`.** Verified: `extractFieldErrors` unchanged; tolerant separate extractor; no regression on the existing 400 path (combined + non-unknown tests); highlight scoped to `#rows` with the token (no hex); surgical clear-on-change; `role="alert"` parity; T-01 + T-02 untouched.

#### Follow-up notes (non-blocking)

- `ErrorResponse.errors` is still typed `string` (`responses.interface.ts:17`); the parser reads it as `unknown` so it works at runtime for either shape. If the live envelope is confirmed to be an object, widen to `string | Record<string, unknown>` for type honesty — pre-existing structural gap, not introduced here.
- Project-wide `s-lint` reports 358 pre-existing SCSS failures; the new `.pf-sp-chip-rejected` rule adds **zero** new violations.

---

## 3. Summary — all tasks complete

| Task | Status | Attempts | Commit |
| --- | --- | --- | --- |
| T-BIL-ASR-01 — Per-result SP picker | ✅ complete | 2 (FAIL→PASS) | `f0c05711` |
| T-BIL-ASR-02 — PRMS-sourced read-only | ✅ complete | 1 (PASS) | `194d7e02` |
| T-BIL-ASR-03 — `unknown_sp_codes` 400 handler | ✅ complete | 1 (PASS) | *(this commit)* |

**Requirements delivered:** REQ-BIL-ASR-01, -02, -03 (all ACs) + NF-ASR-01…04.

**Spec corrections during execution:** AC-01.6 icon path → `/sps/{icon_key}.png` (Pivot Record under T-01; resolved validation R-3).

**Outstanding (carry to PR / follow-up — none blocking):**
- **R-6 / LIVE-VERIFY:** confirm the live response shapes on `AC-1594-bilateral-module-v2` (per-result SP endpoint envelope + the `unknown_sp_codes` 400 envelope: stringified-JSON vs object). The implementation tolerates both; the backend session should confirm which.
- **R-5:** pre-existing `selectedItemsSurfaceColor="#FFFFFF"` hex literal (token-map later).
- **R-7:** confirm full-suite coverage floors in CI (scoped runs can't).
- **Type honesty:** optionally widen `ErrorResponse.errors` if the live envelope is an object.
- **Icon assets:** if the backend later provisions `/assets/result-framework-reporting/SPs-Icons/`, revisit AC-01.6.

**PR:** bundle all three commits (`f0c05711`, `194d7e02`, + T-03) into one PR per `tasks.md` §4. Title: `fix(bilateral-module/alignment-section): consume per-result SP picker + PRMS-sourced read-only + unknown_sp_codes validation`.

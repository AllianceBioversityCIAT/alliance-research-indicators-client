# Execution Log — Bilateral Module / ToC Mapping v2

> Canonical audit trail of the JCSPECS Leader → Implementer → Reviewer loop for [`./tasks.md`](./tasks.md). Appended per task attempt.

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/toc-mapping-v2/` |
| Branch | `AC-1594-bilateral-module` |
| Started | 2026-06-09 |
| Triad personas | [`.agents/leader.md`](../../../../.agents/leader.md) · [`implementer.md`](../../../../.agents/implementer.md) · [`reviewer.md`](../../../../.agents/reviewer.md) |

---

## 2. Task execution history

### T-BIL-TM2-01 — Wire DTOs + shared fixtures — ✅ PASS (attempt 1) — 2026-06-09

- **Attempts:** 1
- **Files changed:**
  - `research-indicators/src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts` (+88/−0 — new v2 wire-type block; `AlignmentResponse.toc_alignments?` + `UpdatePoolFundingAlignmentDto.toc_alignments?`; modal-era types untouched per T-05 deferral)
  - `research-indicators/src/app/testing/toc-catalog.fixture.ts` (new, ~980 lines — frozen-envelope fixtures from the SP01 live snapshot: 22 OUTPUT / 10 OUTCOME / 2 EOI (`aow_code: null`), `unit_of_measurement` rename, 2026-resolved `target_value`/`target_year`; exports CAPSHARING / POLICY / TWO_SP (SP03 ids +900000) / VERSION_LOCKED / EMPTY_LEVELS / SAVED_TOC_ALIGNMENTS)
- **Implementer verification:** `npm run lint` → "All files pass linting."; `npm run build` → success (only pre-existing SCSS-budget + pdfjs CJS warnings); extra `npx tsc -p tsconfig.spec.json --noEmit` → only 3 pre-existing errors elsewhere (stash-compared), 0 in changed/new files.
- **Reviewer verdict:** **PASS** — "interface diff mirrors design §2.1–§2.3 field-for-field with zero deletions; fixture file faithfully encodes the frozen §4 FE envelope … all required, strictly-typed exports and an internally consistent saved-alignments read-back. Lint re-verified clean." Counts independently verified (22/10/2; HLO 5187 carries indicators 5972–5976).
- **Requirements covered:** foundation task (no ACs discharged directly; feeds T-02/T-03/T-04).
- **Decisions made:**
  - Fixture resolves the handoff §4 read-back example's id/snapshot mismatch by using `indicator_id: 5973` (the indicator the snapshot text/target actually describe). Leader fixed `backend-handoff.md` §4 to match (5972 → 5973) in the same change — **relay note:** the handoff copy sent to the backend session earlier today predates this one-line fix.
  - `TOC_CATALOG_EMPTY_LEVELS_FIXTURE` ships `catalogs: []` + `result_type: 'oicr'` (unpinned by spec; matches "backend ships nothing when the cascade is hidden").
- **Issues encountered:** one live OUTCOME indicator (6719) has empty upstream `targets[]` → `target_value: null` (contract-legal; useful edge case for T-03). No `is_stale: true` fixture variant (not mandated; T-04 can derive).
- **Final verification:** lint + build clean (see above).

### T-BIL-TM2-02 — BilateralService / ApiService refit — ✅ PASS (attempt 1) — 2026-06-09

- **Attempts:** 1
- **Files changed:**
  - `research-indicators/src/app/shared/services/api.service.ts` (+12/−x — `GET_PoolFundingHlosIndicators` re-typed to `MainResponse<BilateralTocCatalogResponse>`, same path via `bilateralPath`)
  - `research-indicators/src/app/shared/services/bilateral.service.ts` (+149 — `tocCatalog`/`loadingTocCatalog`/`tocCatalogError` signals; `getTocCatalog` with keep-prior-value-on-error; pure `catalogForSp`/`draftsFromSaved`/`writeDtoFromDrafts` (D-9 exact); tolerant `extractTocAlignmentErrors` wired into `patchAlignment`; new exported `TocAlignmentError` + `PatchAlignmentResult.tocAlignmentErrors?`)
  - `research-indicators/src/app/shared/services/bilateral.service.spec.ts` (+267 — 18 new tests on the T-01 fixtures)
- **Implementer verification:** `npm run test -- bilateral.service` → 71/71 pass; per-file coverage 98.38% stmts / 84.73% branches / 100% funcs+lines; `npm run lint` clean; `tsc --noEmit` only pre-existing errors; collateral suites (api.service, hlo-selection-modal, modal-context) 232 tests green.
- **Reviewer verdict:** **PASS** — design §3/§4.4 + AC-08.2/AC-11.1/AC-11.2 groundwork faithful; D-9-exact DTO semantics; extractor regression-safe alongside `unknown_sp_codes`; re-ran tests + lint.
- **Requirements covered:** AC-08.2 (extractor), AC-11.1/AC-11.2 (state machine groundwork); foundations for AC-04.x/AC-08.x (T-04).
- **Decisions made:**
  - `TocAlignmentError` exported from `bilateral.service.ts` (companion to `PatchAlignmentResult`, not a wire DTO) — Reviewer endorsed.
  - Transition seam: modal-era `getHlosIndicators` now casts `res.data as unknown as BilateralHlosIndicatorsResponse` ("dead-but-compiling until T-BIL-TM2-05") — unavoidable consequence of the mandated re-type; behavior unchanged, old tests green. **T-05 must remove it.**
  - Spec-file mocking convention (jest-mocked `ApiService` + ok/err envelope builders) kept over the template's `HttpTestingController` line, per task instruction.
- **Issues encountered:** stale test name in `api.service.spec.ts` (~L276) still says `BilateralHlosIndicatorsResponse` — rename in T-05 with the type deletion.
- **Final verification:** tests + lint clean (Reviewer re-ran).

### T-BIL-TM2-03 — `SpTocAlignmentBlockComponent` (pure per-SP block) — ✅ PASS (attempt 1) — 2026-06-10

- **Attempts:** 1 (Implementer → Reviewer PASS, no rework)
- **Files created:**
  - `research-indicators/src/app/pages/platform/pages/result/pages/pool-funding-alignment/components/sp-toc-alignment-block/sp-toc-alignment-block.component.ts` (205 lines — standalone OnPush `app-sp-toc-alignment-block`; signal inputs `sp`/`catalog`/`allowedLevels`/`draft`/`disabled`/`inlineErrors`/`catalogState`; outputs `draftChange`/`retryCatalog`; computeds `levelOptions`/`hloOptions`/`indicatorOptions`/`selectedIndicator`; pure `emit()` with cascade resets; exports `SpTocBlockScienceProgram`)
  - `…/sp-toc-alignment-block.component.html` (236 lines — Yes/No `p-radioButton`, Level/HLO/Indicator raw `p-select` (D-8a), `p-inputNumber` contribution; SP-scoped `data-testid`s; a11y per §9)
  - `…/sp-toc-alignment-block.component.scss` (110 lines — `var(--ac-*)` tokens only, no hex)
  - `…/sp-toc-alignment-block.component.spec.ts` (344 lines — 28 tests on the canonical `toc-catalog.fixture.ts`)
- **Implementer verification:** `npm run test -- sp-toc-alignment-block` → 28/28 pass (new file 100% lines / 97.4% stmts); `npm run lint` → "All files pass linting." (fixed one template `eqeqeq`); `npm run s-lint` → clean for the new SCSS (pre-existing errors elsewhere untouched); `npm run build` → success (only pre-existing budget/CJS warnings).
- **Reviewer verdict:** **PASS** — "honors the approved D-8a raw-PrimeNG deviation (signals + FormsModule, no FormGroup, `var(--ac-*)`, no hex), never mutates its `draft` input (dedicated purity test asserts new-reference emission + unchanged input), applies all cascade resets (No/level/HLO), respects D-4 (no single-option preselect), D-5 (unfiltered indicators), §4.7 labels, AC-05.4 EOI title-only, AC-07.x 2026 callout + read-only unit/target + ≥0 clamp, loading/error/ready with wired Retry; a11y + constitution hold; lint + 28/28 re-verified." Independently re-ran lint + scoped tests.
- **Requirements covered:** AC-03.2, AC-04.1/04.2/04.4, AC-05.1–05.4, AC-06.1/06.2, AC-07.1–07.3, block-level parts of AC-09.1, AC-11.1/11.2.
- **Decisions made:**
  - **D-8a (design pivot, spec-owner approved 2026-06-10):** cascade uses raw `p-select`/`p-radioButton`/`p-inputNumber`, NOT the wrapped `custom-fields/*` — the wrapped fields source options only from a registered `ControlListServices` (`ServiceLocatorService` → `[options]="optionsSig()"`) and structurally cannot take the in-memory, cascade-dependent catalog options. Styled to match via `custom-prime-force-styles` patterns + tokens; precedent: `innovation-details/components/{actor-item,organization-item}`. Recorded in `design.md` §11 (D-8a) before implementation.
  - Block input SP type `SpTocBlockScienceProgram` defined+exported in the block (mirrors the page's local `SelectedScienceProgram`) to avoid importing from the page (scope boundary).
  - Contribution callout (`CONTRIBUTION_CALLOUT`) hardcodes 2026 wording (AC-07.3); negatives clamped to 0 at the emit boundary in addition to `p-inputNumber [min]="0"`.
- **Issues encountered:** none blocking. `@testing` is not a declared path alias, so the spec imports the fixture via `src/app/...` (codebase convention) — not a violation.
- **Final verification:** lint clean, 28/28 scoped tests, build green; Reviewer re-ran lint + tests independently.

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

### T-BIL-TM2-04 — Page rework: blocks, drafts, save, pre-fill, gates — ✅ PASS (attempt 1) — 2026-06-10

- **Attempts:** 1 (Implementer → Reviewer PASS, no rework)
- **Files changed** (all under `research-indicators/src/app/pages/platform/pages/result/pages/pool-funding-alignment/`):
  - `pool-funding-alignment.component.ts` (+340 — `toc_drafts` in `AlignmentFormData` seeded via `draftsFromSaved`; catalog as 3rd section GET; `allowedLevels`/`showTocBlocks`/`catalogState`/`versionLocked`/`blocksDisabled` computeds; immutable `onDraftChange`; SP add/remove reconciliation with D-6a destructive-confirm; extended `isDirty`/`canSave`/`onSave`; per-SP 400 routing into `blockErrors`; `toc_mapping_version_locked` 409 branch; `staleSnapshots`; telemetry `toc_alignment_count`; removed AI-card/modal injects + copy + import)
  - `pool-funding-alignment.component.html` (±63 — `@for` of `app-sp-toc-alignment-block` replacing the action-card section; version-locked banner; per-SP stale-snapshot read-only sub-views)
  - `pool-funding-alignment.component.scss` (+16 — token-only `.pf-stale-snapshot`/`.pf-stale-tag`)
  - `pool-funding-alignment.component.spec.ts` (rewritten, ±1222 — 87 page tests)
- **Implementer verification:** `npm run lint` clean; `npm run test -- pool-funding-alignment` 2 suites / 87 pass (page 89.05% stmts / 94% lines); full `npm run test` 262 suites / 5316 pass, coverage floors hold; `npx tsc -p tsconfig.app.json --noEmit` 0 errors (AOT templates compile). `npm run build` fails only at Google-Fonts inlining (network-isolated sandbox — environmental, not a code error; build is not a T-04 gate).
- **Reviewer verdict:** **PASS** — "fully implements the per-SP ToC page rework against all discharged ACs with correct immutable draft independence (10/25 two-SP test asserts SP03 untouched in state + body), additive 409 version-lock handling (synced/PRMS branches byte-for-byte preserved), D-6a house-confirm deselect, complete removal of the modal-era page surface; lint, the 87-test suite, and AOT typecheck all green." Independently re-ran lint + scoped tests + tsc.
- **Requirements covered:** AC-01.1/01.2, AC-02.1/02.2/02.3, AC-03.1, AC-04.3, AC-08.1/08.2/08.3/08.4, AC-09.1/09.2.
- **Decisions made:**
  - **D-6a (design clarification, recorded in design.md §11):** destructive SP-deselect uses the actual house pattern `ActionsService.showGlobalAlert({ severity:'delete', confirmCallback, cancelCallback })` (rendered by `global-alert`) — the repo has NO `ConfirmationService`/`p-confirmdialog`. Confirm drops SP+draft; Cancel re-keeps (chip restored first). Only touched-draft / server-saved SPs trigger the confirm.
  - **Stale snapshots** render at the PAGE level (read-only sub-view from `snapshot`) because the T-03 block intentionally takes no snapshot input; `isStaleSaved` = `is_stale` OR `toc_result_id` unresolved in the live catalog.
  - `versionLockedFrom409` latches the gate before the catalog refetch resolves `version_locked` (version-lock is a stable property, so latching is safe).
- **Issues encountered:** none blocking. The "coverage threshold not met" line on the scoped 1-file run is the standard single-file-subset artifact (global thresholds vs whole tree) — full-suite coverage holds.
- **Final verification:** lint clean, 87 page tests + full suite 5316 green, AOT tsc clean; Reviewer re-ran independently.

### T-BIL-TM2-05 — Retire the modal flow (deletions + grep gates) — ✅ PASS (attempt 1) — 2026-06-10

- **Attempts:** 1 (Implementer → Reviewer PASS, no rework)
- **Deleted (git rm):** `shared/components/all-modals/modals-content/hlo-selection-modal/` (dir), `shared/components/bilateral-action-card/` (dir), `shared/services/cache/hlo-selection-modal-context.service.ts` + `.spec.ts`, `testing/fixtures/bilateral.fixtures.ts` — 11 files, −677 lines net.
- **Edited:** `shared/types/modal.types.ts` (drop `'hloSelection'`), `all-modals.component.ts`+`.html` (drop `HloSelectionModalComponent` import + host `<app-modal>` entry), `cache/all-modals.service.ts` (drop `hloSelection` config + close-all entry), `interfaces/bilateral/pool-funding-alignment.interface.ts` (delete the §2.4 modal-era type block only), `services/bilateral.service.ts` (remove modal-era signals `hlosIndicators`/`persistedMappings`/`pendingMappings`/`hloModalSelection`/`savingMappings`/`indicatorSearch`/`indicatorRows` + methods `getHlosIndicators` incl. dead cast/`keyOf`/modal-session/`materializeRows`/`deriveIndicatorType`/`composeTarget`/`inferQuantitative`/`materializeMappings`), `services/bilateral.service.spec.ts` (drop modal-era suites + deleted-fixture imports), `services/api.service.spec.ts` (~L276 stale `BilateralHlosIndicatorsResponse` test migrated to v2 `BilateralTocCatalogResponse`).
- **Implementer verification:** AC-10.2 grep gate `rg 'aow_status|no_aow_mappings|BilateralHlosPair|HloSelectionModal|hloSelection|areaOfWork' src` → **zero matches**; `npx tsc -p tsconfig.app.json --noEmit` 0 errors; `npm run lint` clean; `npm run test:coverage` 259 suites / 5238 tests pass, coverage 99.55/98.75/99.74/99.58 (floors 40/20/45/30 hold); `npm run build` succeeded (initial 1.10 MB raw / 255.68 kB transfer, well under C-5; net bundle reduction; no font-network error this run).
- **Reviewer verdict:** **PASS** — "cleanly retires the entire modal-era surface as a compiler-driven deletion exactly per design §2.4 / D-1, no over-deletion, no dangling references." Independently re-ran the grep gate (zero), lint, full suite + coverage, and tsc; confirmed the 3-distinct-`IndicatorType` scope guard (project-utils + get-all-indicators untouched) and the intact v2 ToC surface.
- **Requirements covered:** AC-10.1, AC-10.2.
- **Decisions made:** scope guard enforced — only the modal-era `IndicatorType`/`IndicatorRow`/`HloMapping`/`MappingResponse` defined in `pool-funding-alignment.interface.ts` were removed; the same-named independent types in `project-utils.service.ts` and `get-all-indicators.interface.ts` were left untouched (that's also why AC-10.2's grep gate intentionally excludes those generic names). `bilateral.fixtures.ts` deleted wholesale (all 3 mocks modal-era; only consumers were the service spec's modal tests + the deleted modal spec).
- **Issues encountered:** none — tsc was 0 on the first run after the edits (no stragglers). The line-516 `hlosIndicators()?.result_code` fallback lived inside `materializeMappings`, deleted wholesale, so no fix was needed.
- **Final verification:** grep gate zero, lint clean, full suite 5238 green with floors holding, tsc + build clean; Reviewer re-ran independently.

### T-BIL-TM2-06 (partial) — Static cross-repo contract verification + flat read-back reconciliation (D-10) — ✅ PASS (attempt 1) — 2026-06-10

> T-06 stays **in-progress**: the static contract half is done; the live smoke test on testing env is still gated on the backend proxy deploy.

- **Trigger:** user asked whether the backend had implemented its side. Checked `alliance-research-indicators-main` (branch `AC-1594-bilateral-module-v2`): backend `toc-mapping-v2` is implemented **T-01…T-08** (all Reviewer-PASS) — `T-03` read reshape (`b590cee4`), `T-06` write path (`9a6a3449`), `T-07` read-back (`44c42f69`), `T-08` test matrix (`539e27bc`). Only backend T-09 (doc sync) / T-10 (gated cleanup) remain; neither touches the wire.
- **Static contract check (client frozen types vs backend implemented DTOs):**
  - **Catalog read** `BilateralTocCatalogResponse` ↔ backend `BilateralHlosIndicatorsResponse` — **MATCH** (backend emits non-null `string` where client tolerates `string|null`; compatible).
  - **PATCH write** `TocAlignmentWriteDto` ↔ backend `TocAlignmentInputDto` — **MATCH** (field-for-field).
  - **Read-back** `SavedTocAlignment` ↔ backend `TocAlignmentReadbackResponse` — **DIVERGED**: client modeled a NESTED `snapshot` + `aow_code` + `is_stale`; backend froze the display fields **flat** on the row (no wrapper/`aow_code`/`is_stale`). This was the one surface §2.2 flagged as unconfirmed.
- **Resolution (D-10, spec owner approved):** adopt the backend flat shape on the FE. Files changed: `pool-funding-alignment.interface.ts` (flatten `SavedTocAlignment`, delete `TocAlignmentSnapshot`), `testing/toc-catalog.fixture.ts` (flatten `SAVED_TOC_ALIGNMENTS_FIXTURE`, SP03 explicit nulls), `pool-funding-alignment.component.ts` (`staleSnapshots` drops `!!a.snapshot`; `isStaleSaved` drops the `is_stale` check — staleness now purely catalog-derived), `.html` (stale sub-view reads flat fields, no `aow_code` prefix), `.spec.ts` (flat stale test). Design `§2.2` + `D-10` recorded.
- **Impact:** narrow — `draftsFromSaved` reads only top-level fields, so pre-fill + the entire core flow (catalog → cascade → save → version-lock → 400/409 → two-SP independence) were already contract-clean; only the AC-08.4 stale read-only sub-view needed the reshape.
- **Implementer verification:** `npm run lint` clean; `npm run test -- pool-funding-alignment` 87/87; `npm run test -- bilateral.service` 51/51; full `npm run test` 259 suites / 5238 tests green (coverage 99.6/98.8/99.78/99.65, floors hold); `npx tsc -p tsconfig.app.json --noEmit` 0 errors; `rg 'TocAlignmentSnapshot|is_stale' src` → comment-only.
- **Reviewer verdict:** **PASS** — "`SavedTocAlignment` field-for-field identical to backend `TocAlignmentReadbackResponse`; catalog-read + write contracts untouched; staleness purely catalog-derived; a11y + tokens preserved; full suite 5238 green." Re-ran lint + suites + tsc + grep independently.
- **Remaining for T-06 (still open):** point a local/preview build at the **deployed testing env** and run the §12 manual plan (CapSharing single-level, Policy two-level, two-SP independence 10/25, non-2026 lock, PRMS-synced read-only) against live data; log results here. Gated on the backend session deploying `AC-1594-bilateral-module-v2` to testing.

### T-BIL-TM2-06 (partial 2) — Local live golden-path against running stack (FE :4200 / backend :3001) — 2026-06-10

- **Setup:** user ran FE on :4200 (dev env → `mainApiUrl: http://localhost:3001/api/`) + backend on :3001. Both up (`/swagger` 200, FE 200).
- **Live contract via served Swagger (`:3001/swagger-json`):** catalog read `BilateralHlosIndicatorsResponse` (top-level keys + `BilateralTocCatalogResult` `aow_code`/`description`/`indicators`/`title`/`toc_result_id` + `BilateralTocCatalogIndicator` `indicator_id`/`indicator_description`/`unit_of_measurement`/`type_value`/`target_value`/`target_year`) and PATCH `TocAlignmentInputDto` (`sp_code`/`aligns_with_toc` required + optional level/toc_result_id/indicator_id/quantitative_contribution) **match the FE types exactly**. (`AlignmentResponse` is interface-typed so Swagger omits it; flat read-back confirmed from source earlier — D-10.)
- **RB-1 hit + diagnosed:** result 19794's `hlos-indicators` → **503**. Root cause = lambda-toc DNS: LAN resolver `192.168.20.45` returns NXDOMAIN for `lambda-toc.clarisa.cgiar.org`; public DNS (8.8.8.8 / 1.1.1.1) resolve it to `3.90.182.187` (host up). Pure local-resolver gap; backend `ARI_TOC_INTEGRATION_HOST` correctly set. **Resolved by the user** (DNS) — catalog reads then succeeded.
- **Live golden-path PASS (real lambda-toc data):** SP02 "Sustainable Farming" block rendered — Yes/No, Level "High Level Output" (single OUTPUT), HLO "**AOW01** — 1.1.1: Climate hazards…", Indicator selected, contribution callout worded for **2026**, read-only Unit "Number" + Target (2026) "3". Confirms R-BIL-090 (catalog read), R-BIL-091 (OUTPUT rule), the full cascade, §4.7 labels, AC-05.4 AOW-prefixed HLO, AC-07.1/07.3 — against live data, not fixtures.
- **Findings logged (UI polish, pre-existing SP-picker, not spec tasks):** (a) selected SP chip `/sps/undefined.png` 404 + "— %" — the form's selected value carries only `official_code`/`name`/`color`; fixed by resolving code/allocation/icon from the loaded science-programs list (`findScienceProgram`) → chip shows "SP02 — 30%" + icon. (b) Contribution `p-inputNumber` constrained to a short numeric width (9rem). (c) **Robustness gap (open, recommended follow-up):** a top-level catalog 503 leaves `allowed_levels` unknown → `showTocBlocks` false → the ToC section + its block-level retry silently vanish; no page-level catalog-error banner. Worth a small page-level error+retry given lambda-toc flakiness.
- **Remaining for T-06 sign-off:** two-SP independence (10/25) + save→reload round-trip + non-2026 lock + PRMS-synced read-only, against the deployed testing env.

### T-BIL-TM2-07 — Archive superseded specs + docs sync — ✅ DONE — 2026-06-10

- **Archived (git mv, history preserved):**
  - `docs/specs/bilateral-module/indicator-mapping/` → `docs/specs/archive/2026-06-10-bilateral-module--indicator-mapping/` (+ `archive-summary.md`: superseded; read-side partially shipped then held at OQ-IM-1, write-side never built, shipped code removed in T-05; validation 12 PASS/3 WARN/0 FAIL).
  - `docs/specs/bilateral-module/hlo-grouped-mapping/` → `docs/specs/archive/2026-06-10-bilateral-module--hlo-grouped-mapping/` (+ `archive-summary.md`: designed, never implemented).
- **Docs sync:**
  - Repointed the active `toc-mapping-v2` `requirements.md` + `proposal.md` supersession links to the new archive paths (no stale `](../indicator-mapping…` / `](../hlo-grouped-mapping…` remain).
  - `docs/detailed-design/detailed-design.md`: rewrote the `hlos-indicators` API note (AOW-pair `pairs[]`/`aow_status` model → level-based `allowed_levels`+`catalogs[]` lambda-toc catalog; link → toc-mapping-v2 + archived indicator-mapping) and the caching assumption (modal-open-per-fetch → once-per-section-load + 503 keep-prior/retry).
  - `docs/specs/bilateral-module/figma-mockups/README.md`: added a CURRENT-CANON banner registering the four `Pool funding alignment*.png` as canon + marking the HLO-modal / action-card / AOW-pair node-id screens as superseded.
- **Done check:** archive folders exist with forward pointers to toc-mapping-v2; no active doc presents the AOW model as current; active links resolve.
- **CodeGraph:** `.codegraph/` present — a re-index is advisable after the doc moves (low impact: codegraph indexes code, not markdown).
- **Note:** the parent `bilateral-module/proposal.md` (historical planning doc) and the `ari-backend-context/*` copies still mention the old `indicator-mapping` path in narrative/text — left as-is (historical record; the backend-context copies explicitly resolve against the backend repo).

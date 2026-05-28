# Execution Log — Bilateral Module / Indicator Mapping

> Append-only log of `/sdd-execute` runs against [`./tasks.md`](./tasks.md). Created on first run; appended on subsequent runs. Pairs with [`./requirements.md`](./requirements.md) and [`./design.md`](./design.md).

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/indicator-mapping/` |
| Sibling executions | [`../tag-visibility/execution.md`](../tag-visibility/execution.md) (US1) — alignment-section did not produce a separate `execution.md`; its history is in the git log from `17417fdd` onward. |
| Methodology | [`/sdd-execute`](../../general-setup/task.md) per the SDD template under [`../../general-setup/`](../../general-setup/). |
| Branch | `AC-1594-bilateral-module` |

---

## 2. Task execution history

> Append newest entries at the bottom.

---

### Entry 1 — T-BIL-IM-RR-01 — Alignment-section mockup remediation (RR-A..I)

| Field | Value |
| --- | --- |
| Status | ✅ completed |
| Dates | 2026-05-23 → 2026-05-24 |
| Method | Direct execution (not via `/sdd-execute`) — landed before the indicator-mapping spec set was finalized. Recorded retroactively here because [`./tasks.md`](./tasks.md) §4 / §10 lists this remediation as the prerequisite host work for T-BIL-IM-10 (AI card + HLO card mount). |
| Shipped via commits | `01a0cd57` (RR-A..F + G + I copy / radio / heading / info-banner / justification removal / `*` marker), `352299ab` (sidebar tab loads via parent — chicken-and-egg fix), `86252209` (URL pattern: `v1/` + `STAR-` strip), `3df3deff` (defensive `WebsocketService` / `ClarityService` injection — NG0200 fix), `05fa2913` (layout: `app-page-wrapper` + `.section-title` + single `<app-navigation-buttons>` footer), `e07ec9fb` (form-label colors: `.label` / `.option-label`; system-design §7.4.1 doc), `e16ec195` (`CONTRIBUTING TO POOL FUNDING` inline label on project-detail), `974e83c6` (`pool-funding-contributor` allowlist in `buildFindContractsParams` + sidebar filter label color), `0ac331b8` (`custom-tag` default `whitespace-nowrap`), `9b946f9f` (info-banner pattern match to IP Rights). |
| Files changed | The shipped alignment-section component (`pool-funding-alignment.component.{ts,html,scss,spec.ts}`), the parent `result.component.ts`, `bilateral.service.{ts,spec.ts}`, `api.service.{ts,spec.ts}`, `result-sidebar.component.{ts,spec.ts}`, `project-detail.component.{ts,html,spec.ts}`, `project-item.component.{html,scss}`, `my-projects.component.html`, `custom-tag.component.html`, plus `system-design/design.md` §7.4.1 + §12 decisions row. |
| Mockups consulted | `32470-3149` (default), `33528-138394` (required marker), `33528-138106` (No branch), `32471-129337` (SP picker), `33356-11736` (sync + tab position). |
| Decisions | Recorded in [`./design.md` §4.7](./design.md#47-alignment-section-mockup-remediation-rolls-divergences-af--g--i-into-this-spec) and [`docs/system-design/design.md` §12 2026-05-24 row](../../../system-design/design.md). |
| Verification | All component + service specs green at each commit. `ng build` clean across the chain. Manual smoke verified by the user against the mockups. |

---

### Entry 2 — T-BIL-IM-03 — `BilateralActionCardComponent`

| Field | Value |
| --- | --- |
| Status | ✅ completed |
| Date | 2026-05-24 |
| Method | `/sdd-execute bilateral-module/indicator-mapping T-BIL-IM-03` |
| Files changed | `research-indicators/src/app/shared/components/bilateral-action-card/bilateral-action-card.component.{ts,html,scss,spec.ts}` (all new). |
| Mockups consulted | [`../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md`](../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md) — 1036×103 card, 73×73 illustration on the left, uppercase title `VIEW HIGH LEVEL OUTPUTS`, body copy verbatim, green CTA button (114×36) on the right. |
| Decisions | <ul><li>**Reusable shared component**, not bilateral-specific. The "promo card" visual is generic; placing it under `shared/components/bilateral-action-card/` keeps the door open for other surfaces to reuse it. (Design decision recorded in [`./design.md` §11](./design.md#11-design-decisions-decision-record) row "BilateralActionCardComponent as a reusable shared component, not bilateral-specific".)</li><li>**Default CTA label = `'View HLOs'`** (resolves OQ-FIG-5). The mockup's literal `Upload file` is a known copy-paste artifact per [`../figma-mockups/README.md` §7](../figma-mockups/README.md). Spec test locks the default.</li><li>**Default illustration**: when no `illustration` input is provided, render `<i class="pi pi-sparkles">` in `--ac-primary-blue-400` as a placeholder. The real bilateral illustration `Seo-3--Streamline-Brooklyn` lives in Figma and hasn't been exported to `src/assets/` yet; consumer passes the asset path when it ships. Default keeps the component usable today.</li><li>**Title typography**: `.bilateral-action-card__title` mirrors the canonical `.label` class (Space Grotesk 14px / 600 / `--ac-primary-blue-400`) so the heading reads consistent with the rest of the form labels per [`docs/system-design/design.md` §7.4.1](../../../system-design/design.md#741-canonical-form-label-classes-binding-contract).</li><li>**Body typography**: Barlow 14px / 17px line-height / `--ac-grey-700` — the canonical body-text spec from [`./design.md` §4.6](./design.md#46-theming).</li><li>**Unique `titleId`** per instance via a static counter, so the `aria-labelledby` wiring doesn't collide when the card is rendered multiple times on a page.</li></ul> |
| Issues encountered | None during implementation. Lint, all 12 unit tests, and `ng build` (strict-template) all passed on first run. |
| Verification | • ESLint: clean on all 3 changed files. <br>• `npx jest src/app/shared/components/bilateral-action-card/` → **12 / 12 tests pass**. <br>• `npx jest --coverage --collectCoverageFrom=...component.ts` → **100% statements / 100% branches / 100% functions / 100% lines**. <br>• `npx ng build --configuration development` → clean (only the two pre-existing repo warnings unrelated to this branch). |
| ACs discharged | REQ-BIL-IM-01 (the AI card itself). The mount into `PoolFundingAlignmentComponent` lands in T-BIL-IM-10. |
| Coverage on the spec |  Inputs render verbatim (title + body); default CTA label is `'View HLOs'` (OQ-FIG-5 locked); default CTA icon is `pi pi-folder`; illustration input branches (img vs fallback PrimeIcon); `(ctaClick)` emits on enabled state, suppressed when disabled; ARIA: `role="region"`, `aria-labelledby` wired to a stable per-instance `titleId`, illustration `aria-hidden="true"`, CTA `aria-label` describes the action; multiple instances get unique title ids; the canonical bilateral body copy is rendered without character drift (locked-literal regression). |

---

---

### Entry 3 — T-BIL-IM-02 — `ModalName 'hloSelection'` + `HloSelectionModalContextService`

| Field | Value |
| --- | --- |
| Status | ✅ completed |
| Date | 2026-05-24 |
| Method | `/sdd-execute bilateral-module/indicator-mapping T-BIL-IM-02` |
| Files changed | <ul><li>`research-indicators/src/app/shared/types/modal.types.ts` — added `'hloSelection'` to the `ModalName` union.</li><li>`research-indicators/src/app/shared/services/cache/all-modals.service.ts` — added the `hloSelection` config entry to the initial `modalConfig` signal AND to the second `modalConfig.set({...})` call inside `closeAllModals()` (both required because `Record<ModalName, ModalConfig>` is exhaustive — the strict-template compiler in `ng build` caught the second site as a regression risk).</li><li>`research-indicators/src/app/shared/services/cache/hlo-selection-modal-context.service.{ts,spec.ts}` — new singleton (`providedIn: 'root'`) holding the modal-session payload (`{ resultCode }`) via a `context` signal with `setContext` / `clear` helpers.</li></ul> |
| Mockups consulted | [`../figma-mockups/32471-131617-hlo-modal-empty.md`](../figma-mockups/32471-131617-hlo-modal-empty.md) — the modal shell this enables. Title `High Level Outputs` taken verbatim from the mockup header; `isWide: true` set in the modal config to match the 1277×1113 canvas. |
| Decisions | <ul><li>**Minimal context payload** — `HloSelectionModalContext = { resultCode: string }` only. Everything else the modal needs (selected_levers, indicatorGroups, pendingMappings) is already in `BilateralService`. Expand the context shape only when a real consumer needs to pass more.</li><li>**Pattern matches `CreateResultManagementService`** — singleton, signal-based, minimal API surface (`context` + `setContext` + `clear`). Same shape so future contributors see a consistent modal-context idiom.</li><li>**Modal config: `isWide: true`** so the existing modal-host renders the wider canvas the HLO selector needs.</li></ul> |
| Issues encountered | First `ng build` failed with `TS2345` — `Record<ModalName, ModalConfig>` is exhaustive AND `all-modals.service.ts` has TWO sites that construct the record: the initial `modalConfig` signal value AND the `closeAllModals()` reset. Missing the new key in the reset call broke strict-template compile. Fix was one extra line; spec coverage on `closeAllModals` (existing tests in `all-modals.service.spec.ts`) caught it implicitly via the type system. Logged as a reminder: when extending `ModalName`, grep for ALL `modalConfig.set` / `modalConfig =` sites, not just the declaration. |
| Verification | • ESLint: clean on all 4 changed files. <br>• `npx jest src/app/shared/services/cache/` → **137 / 137 tests pass** across 6 suites (new spec + all existing cache-service specs, no regression in `all-modals.service.spec.ts`). <br>• `npx jest --coverage --collectCoverageFrom=hlo-selection-modal-context.service.ts` → **100% statements / 100% branches / 100% functions / 100% lines**. <br>• `npx ng build --configuration development` → clean. |
| ACs discharged | Enables AC-01.3 / AC-06.x modal-open flow (the modal itself + its open trigger land in T-BIL-IM-05 + T-BIL-IM-10). |
| Coverage on the spec | Default context is `null`; `setContext` updates the signal; `setContext` is idempotent on repeated calls (latest payload wins); `clear()` resets to null; `providedIn: 'root'` semantics — `TestBed.inject` returns the same instance across calls. |

---

---

### Entry 4 — T-BIL-IM-14 — AR.3 regression test (HLO mappings don't block submission)

| Field | Value |
| --- | --- |
| Status | ✅ completed |
| Date | 2026-05-24 |
| Method | `/sdd-execute bilateral-module/indicator-mapping T-BIL-IM-14` |
| Files changed | `research-indicators/src/app/shared/services/submission.service.spec.ts` — appended a new `describe('AR.3 — HLO indicator mappings are decoupled from submission completion (T-BIL-IM-14)')` block with 2 cases. |
| Mockups consulted | None — pure regression test. Conceptually mirrors the alignment-section AR.3 lock (T-BIL-AS-13) per [`./tasks.md` T-BIL-IM-14](./tasks.md#t-bil-im-14--ar3-regression-test-mappings-do-not-block-result-submission). |
| Decisions | <ul><li>**Two cases mirror the alignment-section pattern**: (a) `canSubmitResult` returns true with the canonical 11-key fixture + assert no HLO-mapping concept name appears in the keys (`hlo_mappings`, `indicator_mappings`, `pool_funding_indicators`, `pool_funding_alignment_indicators`); (b) the canonical key set is exactly the 11 known keys, sorted-equal.</li><li>**Separate `describe` block** (not folded into the existing AR.3 alignment block) so each rule has its own self-contained fixture + comment block. Localizes future churn — if the alignment-section AR.3 needs a tweak, it doesn't accidentally touch the indicator-mapping lock.</li><li>**Sidebar-side equivalent is intentionally skipped** — the indicator-mapping spec does NOT add a new `SidebarOption` (mappings render inside the alignment tab), so there's no sidebar-completion regression risk. T-BIL-IM-14 description confirms this.</li><li>**The fixture is duplicated, not shared.** Sharing via a top-level const would re-use one source of truth — but if a future contributor extends the alignment AR.3 fixture, the indicator-mapping AR.3 should fail INDEPENDENTLY for the right reasons. Duplication is deliberate.</li></ul> |
| Issues encountered | None. Pure test addition; no production code changed; `submission.service.ts` itself is untouched. |
| Verification | • ESLint: clean. <br>• `npx jest src/app/shared/services/submission.service.spec.ts` → **50 / 50 tests pass** (48 existing + 2 new). <br>• `npx ng build --configuration development` → clean. <br>• No coverage delta needed on the production code (none changed); the spec's own statements are exercised by their own cases. |
| ACs discharged | REQ-BIL-IM (AR.3 holds — mappings don't block submission), mirroring alignment-section REQ-BIL-AS-09 AC-09.1 + AC-09.2. |
| Coverage on the spec | 2 cases: `canSubmitResult` returns true with HLO concepts absent from greenChecks; canonical `GreenChecks` key set is the exact 11 known keys. |

---

### Entry 5 — Specification update (NOT a `/sdd-execute` run) — endpoint switch to T-15.12 hlos-indicators

| Field | Value |
| --- | --- |
| Status | ✅ docs-only — no production code touched |
| Dates | 2026-05-27 |
| Method | Manual spec rewiring across the four spec files, triggered by a backend audit run from a sibling Claude Code session in the ARI backend repo (`alliance-research-indicators-main`, branch `AC-1594-bilateral-module-v2`). |
| Commits | `49544273` (`open-questions-for-ba.md` §8 ToC backend audit + OQ-IM-10), `5fa5c4a4` (`design.md` + `tasks.md` rewire for the new endpoint), `ec658325` (`requirements.md` alignment + new REQ-BIL-IM-19). |
| Files changed | `docs/specs/bilateral-module/indicator-mapping/open-questions-for-ba.md`, `design.md`, `tasks.md`, `requirements.md`. No code under `research-indicators/src/`. |
| Why this entry exists | `/sdd-execute` consumers reading this log need to know that **the spec interpretation of OQ-IM-2 + the catalog GET endpoint shifted between Entry 4 and the next code execution**. Without this entry, the next contributor would read tasks T-BIL-IM-01 / -04 / -05 and not understand why the wire shape, signal names, and gating differ from earlier drafts. |
| Decisions | <ul><li>**OQ-IM-2 RESOLVED** via existing backend ship (T-15.12 / commit `907993e7`). The backend already exposes a result-scoped `GET /api/v1/results/:resultCode/pool-funding-alignment/hlos-indicators` endpoint that returns the SP → AOW → outcome/output → indicator tree pre-grouped via `pairs[]`, sourced live from CLARISA + PRMS (5-min cache, not persisted). No backend AOW entity will be added; AOW is a CLARISA level-2 entity (`prefix=AOW`, parent SP) read transitively from each result's `bilateral_project_mapping`.</li><li>**Catalog wire shape**: planned `IndicatorGroupResponse` / `AreaOfWorkGroup` / wire-`IndicatorRow` types **withdrawn**. New types mirror the backend DTO (`BilateralHlosIndicatorsResponse`, `BilateralHlosPair`, `PrmsTocResult`, `PrmsTocIndicator`, `BilateralHlosAowStatus`). `IndicatorRow` reframed as a derived FE view-model computed via a private `materializeRows` helper on `BilateralService`.</li><li>**T-BIL-IM-05 ungated** (was previously chained on OQ-IM-2). T-BIL-IM-01 + T-BIL-IM-04 gating reduced to OQ-IM-1 + OQ-IM-3 (no OQ-IM-2 in the gate set).</li><li>**New non-gating OQ-IM-10** for the `no_aow_mappings` empty-state UX (28 of 31 TEST bilateral projects today carry this status — potentially the dominant flow). FE ships a graceful default (flat list per SP — see REQ-BIL-IM-19). Tracked as **T-BIL-IM-16** (new task).</li><li>**Per-row enrichment gap**: the bonus backend fields from §7.1 (`is_quantitative`, `disabled_reason`) target the now-unused `IndicatorPanelIndicatorResponse`, not `PrmsTocIndicator`. Backend needs to mirror them onto `PrmsTocIndicator` (or a sibling enrichment DTO) before T-BIL-IM-09 (Quantitative row) starts. Until then, FE derives `is_quantitative` from PRMS `type_name` inside `materializeRows`; `disabled_reason` stays `null`; `is_stale` is sourced from persisted `HloMapping.is_stale` only.</li><li>**Endpoint is result-scoped**, not catalog-wide — first modal open per result pays the upstream cache-miss cost. Preload pattern: trigger `getHlosIndicators` on alignment-form mount (added to T-BIL-IM-10).</li></ul> |
| Issues encountered | One inconsistency self-introduced and self-fixed mid-pass: the §8.5 follow-up note initially said "T-BIL-IM-12, to be created" but T-BIL-IM-12 was already taken (lever-cascade refresh effect). Renamed to T-BIL-IM-16 in both `open-questions-for-ba.md` §8.5 and in the new task definition in `tasks.md` §4 / §10. |
| Verification | No code, no tests, no `ng build`. Verified via `grep` sweeps across the four files for stale references to `IndicatorGroupResponse`, `GET_PoolFundingIndicators`, `OQ-IM-2`, `T-31`, "ToC catalog not yet synced" — each lingering reference either updated or explicitly preserved with a `2026-05-27` note explaining the change. |
| What this unblocks for `/sdd-execute` | T-BIL-IM-05 can now start in parallel with OQ-IM-1 resolution (it was previously blocked behind OQ-IM-2). T-BIL-IM-01's interface work is also no longer blocked by OQ-IM-2; only OQ-IM-1 + OQ-IM-3 remain. Group A (T-BIL-IM-02 / -03 / -14 — done) is unaffected. T-BIL-IM-16 enters Group D as a non-gating sibling of T-BIL-IM-06 / -07. |

---

### Entry 6 — T-BIL-IM-01 (READ SLICE) — interfaces + `GET_PoolFundingHlosIndicators`

| Field | Value |
| --- | --- |
| Status | `[~]` read slice ✅ PASS (attempt 1) — contribution methods + `ContributionBody` deferred (OQ-IM-1 gate) |
| Date | 2026-05-28 |
| Method | `/sdd-execute bilateral-module/indicator-mapping` — JCSPECS Leader → Implementer → Reviewer triad. Reduced to the **read-side** slice deliberately: the write-side (4 contribution endpoints + `ContributionBody` + `bodyOf`) stays gated on OQ-IM-1 (PO decision, recommended 2026-06-03). |
| Implementer attempts | 1 |
| Files changed | `research-indicators/src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts` (+131 — PRMS/HLOs wire types + derived `IndicatorRow` / `HloMapping` / selection-key types), `research-indicators/src/app/shared/services/api.service.ts` (+8 — `GET_PoolFundingHlosIndicators` via `bilateralPath`), `research-indicators/src/app/shared/services/api.service.spec.ts` (+39 — 3 cases). |
| Pre-flight reconciliation (key finding) | The live backend DTO **differs from the `design.md` §2.1 paraphrase**. Verified against the live files on `AC-1594-bilateral-module-v2` (`dto/bilateral-hlos-indicators.response.dto.ts` + `tools/prms-toc/dto/prms-toc.types.ts`). Honored the live shape over the paraphrase (design §2.1's own stated intent is "copy the DTO verbatim"): `PrmsTocResult` carries a `category: 'OUTCOME'\|'OUTPUT'` discriminator (the design planned to derive type from `result_level_id`, which is actually optional+nullable — `category` is the correct seam for `deriveIndicatorType` in T-BIL-IM-04); `PrmsTocResult.indicators?` is OPTIONAL (→ `materializeRows` must null-guard); `PrmsTocIndicator.indicator_id` is `string`; `target_value_sum?: string\|number\|null` and `progress_percentage?: string\|null` (→ `composeTarget` must coerce). Misspelling `unit_messurament` preserved verbatim. Backend-internal `PrmsTocMetadata`/`PrmsTocPayload`/`PrmsTocEnvelope` correctly excluded (not on the response DTO surface). |
| Decisions | <ul><li>**Read/write split** — the full T-BIL-IM-01 lists 5 ApiService methods; only the read-only `GET_PoolFundingHlosIndicators` landed. The 4 contribution methods + `ContributionBody` are intentionally absent (OQ-IM-1 gate), documented by a comment near `HloMapping`. This split is the one §7.5 sequencing already anticipated ("FE picks up T-BIL-IM-01 partial").</li><li>**Reused `bilateralPath()`** (STAR- strip + `v1/` prefix) instead of the raw `results/${...}` URL in design §3.1 — that snippet predates the helper consolidation from the alignment-section remediation. Matches the sibling `GET_PoolFundingSciencePrograms`.</li><li>**Test convention** — matched the file's established `mockToPromiseService.get` jest-mock pattern rather than `HttpTestingController` (tasks §5 names the latter, but the whole `api.service.spec.ts` uses the mock). Consistency with the file wins.</li></ul> |
| Verification | • `npm run lint` → All files pass linting. <br>• `npm run test -- api.service` → 186/186 pass (incl. 3 new: suffix URL, STAR- strip, `MainResponse<BilateralHlosIndicatorsResponse>` envelope). <br>• `npm run build` → clean (Initial 1.10 MB, within C-5 budget; only pre-existing unrelated `.scss` budget warnings). |
| Reviewer verdict | **PASS** (attempt 1). Wire-shape exact (all 17 `PrmsTocIndicator` fields, all 6 `PrmsTocResult` fields, full `BilateralHlosPair` / `BilateralHlosIndicatorsResponse`); correct `bilateralPath()` reuse; additive-only; deferral of contribution surface correctly documented; 3 substantive (non-vacuous) tests. |
| ACs discharged | Enables every downstream functional REQ that consumes the HLOs tree (typing only). The contribution-mutation REQs stay gated. |

---

### Entry 7 — T-BIL-IM-04 (READ SLICE) — `BilateralService` HLO read + modal-selection surface

| Field | Value |
| --- | --- |
| Status | `[~]` read slice ✅ PASS (attempt 2) — write surface deferred (OQ-IM-1/-3 gate) |
| Date | 2026-05-28 |
| Method | `/sdd-execute` triad. Read-side slice of T-BIL-IM-04. |
| Implementer attempts | 2 (attempt 1 FAIL on one finding → attempt 2 PASS) |
| Files changed | `research-indicators/src/app/shared/services/bilateral.service.ts` (+200, additive), `bilateral.service.spec.ts` (+331, 20 new cases), `research-indicators/src/app/testing/fixtures/bilateral.fixtures.ts` (NEW — `bilateralHlosIndicatorsResponseMock` / `bilateralHlosNoAowResponseMock` / `persistedMappingMock`). |
| Implemented | Signals `hlosIndicators` / `persistedMappings` / `pendingMappings` / `hloModalSelection` / `loadingHlos` / `savingMappings` / `indicatorSearch`; `indicatorRows` computed; `getHlosIndicators`; modal lifecycle `loadModalSelection` / `commitModalSelection` / `cancelModalSelection`; per-card `updateMappingField` / `removeMapping`; private seam `materializeRows` / `deriveIndicatorType` / `composeTarget` / `inferQuantitative` / `materializeMappings` / `keyOf`. |
| Deferred (gated) | `saveMappings`, `bodyOf`, `getContribution`, `getMappings`, `diff()`, `SaveMappingsResult` — depend on OQ-IM-1 (contribution body shape) + OQ-IM-3 (edit-mode GET). Documented with an inline gate comment. |
| Key decisions / live-shape honoring | <ul><li>`deriveIndicatorType` keys off the live `PrmsTocResult.category` ('OUTCOME'→'outcome', 'OUTPUT'→'output', default 'outcome'), NOT the design §4.4.1 draft's `result_level_id` (which is optional+nullable on the live DTO).</li><li>`getHlosIndicators` reads `res.data` (the real `MainResponse<T>` envelope field), not the §4.4.1 pseudocode's `res.response`. Gated on `res?.successfulRequest`; try/finally resets `loadingHlos`; **no catalog fallback** on failure (prior signal left intact).</li><li>`materializeRows` null-guards `pair.outcomes`/`pair.outputs`/`toc.indicators` (all optional/absent on the live wire shape).</li><li>`composeTarget` coerces both string and number `target_value_sum`; `inferQuantitative` is a temporary unit-of-measure heuristic until the backend safe bundle ships a wire `is_quantitative` (R-10 / OQ-IM-6).</li><li>`materializeMappings` preserves `reason_code`/`quantitative_contribution`/`is_stale` on surviving keys, defaults new keys to null/false, drops keys that don't resolve to a known catalog row; `lever_name` resolves from `currentAlignment().selected_levers` (code fallback); `aow_name` falls back to `aow_code` (PRMS ships no AOW name).</li></ul> |
| Attempt 1 — Reviewer FAIL | One finding: `savingMappings` signal absent. The design §4.3 state-boundary table + tasks §T-BIL-IM-04 Summary both list it; downstream T-BIL-IM-08/-10 read `bilateralService.savingMappings` and declare T-BIL-IM-04 as their state dependency. (Leader had scoped it out as "only used by the gated `saveMappings`" — Reviewer correctly held it to the declared state contract.) |
| Attempt 2 — fix + Reviewer PASS | Added `readonly savingMappings = signal(false);` (one line, no logic — reserved for the gated write surface) + one extra spec case asserting `getHlosIndicators` preserves `aow_status` onto the signal (non-`has_aow` passthrough). Delta confirmed to be exactly the prescribed fix with zero collateral; the rest of the diff was already PASS byte-for-byte in attempt 1. |
| Verification (final) | • `npm run lint` → All files pass linting. <br>• `npm run test -- bilateral.service` → 52/52 pass; `bilateral.service.ts` 97.32% statements / 100% functions / 98.75% lines (≥90% floor; no regression on the 32 prior alignment-section / science-program / tag cases). <br>• `npm run build` → clean (within C-5 budget). |
| ACs enabled | The read + modal-selection half of AC-12/-13/-14/-17. The mutation half (AC-16 Save/409) stays gated. |

---

### Entry 8 — T-BIL-IM-05 — `HloSelectionModalComponent` shell + sidebar + table

| Field | Value |
| --- | --- |
| Status | ✅ completed (PASS attempt 1 + a Leader-requested polish pass) |
| Date | 2026-05-28 |
| Method | `/sdd-execute` triad. The read-side ToC/HLO picker — fully ungated (OQ-IM-2 resolved 2026-05-27). |
| Files changed | NEW `research-indicators/src/app/shared/components/all-modals/modals-content/hlo-selection-modal/hlo-selection-modal.component.{ts,html,scss,spec.ts}`; `all-modals.component.{ts,html}` (host wiring — import + `imports[]` + `<app-modal modalName="hloSelection">`, matching the `selectLinkedResults` sibling pattern). |
| Implemented | Three-zone modal: header (`High Level Outputs` + ×), 256px SP→AOW sidebar (programs deduped, per-AOW `<p-badge>` selection counts), main pane (breadcrumb + 300ms-debounced client-side search over `indicator_name` synced to `indicatorSearch` + indicator table scoped to the active `(program, area_of_work)` pair via `indicatorRows()`), footer (`Selected → N items` counter `aria-live=polite` + Cancel/Confirm). Selection toggles `HloKeyString` in `hloModalSelection` immutably. Confirm → `commitModalSelection()` + close; Cancel → close (seed + discard-confirm deferred to T-BIL-IM-07). Consumes the service's derived `indicatorRows()` — never traverses `pairs[].outcomes[].indicators[]` in the template. On open, fetches via the context's `resultCode` guarded by `!hlosIndicators()` (5-min-cache respect). |
| `aow_status` branches | `'unmapped'` → blocking copy + empty sidebar + Confirm disabled (`hlo-modal-empty-unmapped`); `'no_aow_mappings'` → **default (a)** flat-per-SP with `area_of_work===''` key token (`hlo-modal-empty-no-aow`) — **this delivers T-BIL-IM-16's default**; `'has_aow'` → canonical tree; `pairs:[]` → catalog-unavailable + Confirm disabled (`hlo-modal-empty-pairs`); plus active-AOW-empty + search-empty inline messages. |
| Tokens / a11y | Active/selected highlight uses `var(--ac-light-blue-100)` (real token: light `#79d9ff` / dark `#4a708b`). Zero hex literals, no `isDarkMode()` color branching. Counter `aria-live`, AOW badge + close-button `aria-label`s, SP/AOW as native focusable `<button>`s (Tab/Enter — satisfies WCAG 2.1 AA keyboard operability). |
| Reviewer verdict | **PASS** (attempt 1). No critical issues. Two "should-fix" warnings raised → fixed in the polish pass: (1) a `$any($event.target)` strict-template escape on the search input → replaced with `(input)="onSearchInput($event)"` + `(event.target as HTMLInputElement)` cast in the component; (2) the spec-required "5-min cache / second-open spy" test was missing → added (the guard itself already existed). |
| Accepted divergences / hand-offs | <ul><li>**Arrow-key sidebar nav** (`design.md §9`) is NOT in T-BIL-IM-05's task criteria and is NOT a WCAG 2.1 AA requirement (native `<button>`s are Tab/Enter operable). Treated as an enhancement; not implemented. Spec inconsistency noted — track as a future polish if design insists.</li><li>**`aria-describedby="reason-{id}"`** on disabled-row checkboxes is intentional forward-wiring for **T-BIL-IM-06** (which adds the matching `id` reason callout). Harmless until then — `disabled_reason` is always `null` on the live endpoint (R-10). Handed off to T-BIL-IM-06.</li></ul> |
| Verification (final) | • `npm run lint` → clean. • `npm run s-lint` → clean on new SCSS. • `npm run test -- hlo-selection-modal` → 25/25 pass; component coverage ≥ 70% floor met (80.5% stmts after fixups). • `npm run build` → clean (component `.scss` 4.86 kB, under the 8 kB error budget). |
| ACs discharged | REQ-BIL-IM-02, REQ-BIL-IM-03, REQ-BIL-IM-05. Plus T-BIL-IM-16's `no_aow_mappings` default (a). |

---

### Entry 9 — T-BIL-IM-07 — Modal session-state + Cancel-confirm dialog

| Field | Value |
| --- | --- |
| Status | ✅ completed (PASS attempt 1) |
| Date | 2026-05-28 |
| Method | `/sdd-execute` triad. Extends `HloSelectionModalComponent`. |
| Files changed | `hlo-selection-modal.component.{ts,spec.ts}` (extend). |
| Implemented | On open: `loadModalSelection()` seeds `hloModalSelection` from `pendingMappings`, then `snapshotOnOpen = new Set(hloModalSelection())` captured post-seed. Cancel/×: `selectionDiffersFromSnapshot()` (equal iff same size + every current key in snapshot) → no diff closes immediately; diff shows an `ActionsService.showGlobalAlert` confirm ("Discard your selection changes?") whose Discard callback `close()`s **without** committing and whose "Keep editing" callback leaves the modal open. Confirm unchanged (`commitModalSelection()` + close). Copy stored as `private readonly DISCARD_CONFIRM_*` constants. |
| Reuse | `ActionsService.showGlobalAlert(GlobalAlert)` — the same shared API `result-sidebar.component.ts` uses; shape (severity/summary/detail/confirmCallback.{label,event}/cancelCallback.label) verified against `global-alert.interface.ts`. No ad-hoc dialog. |
| Reviewer verdict | **PASS** (attempt 1). Diff comparator correct (no false-equal/false-differ edge), modal not closed before user confirms, Discard does not commit. Two cosmetic warnings **accepted as non-blocking**: (1) `DISCARD_CONFIRM_TITLE`/`_MESSAGE` hold the same string (both required because `GlobalAlert` needs `summary` + `detail`); (2) suggestion to add `T-BIL-IM-07` to the component's `@sdd-spec` comment. Neither affects correctness/tests/contract. |
| Verification | • `npm run lint` → clean. • `npm run test -- hlo-selection-modal` → 30/30 pass (5 new: seed+snapshot, cancel-no-change closes, cancel-with-change shows alert + modal not closed, Discard closes without commit, Confirm commits+closes). • `npm run build` → clean. |
| ACs discharged | REQ-BIL-IM-06, REQ-BIL-IM-07. |

---

### Entry 10 — T-BIL-IM-06 — Disabled-indicator row + inline reason callout

| Field | Value |
| --- | --- |
| Status | ✅ completed (PASS attempt 1) — rendering primitive (inert on live data; see caveat) |
| Date | 2026-05-28 |
| Method | `/sdd-execute` triad. Extends `HloSelectionModalComponent`. |
| Files changed | `hlo-selection-modal.component.{ts,html,scss,spec.ts}` (extend). |
| Implemented | `isRowDisabled(row)` = `disabled_reason !== null \|\| (is_stale && !is_mapped)`; `rowReasonText(row)` = server `disabled_reason` verbatim → else canonical stale copy (`STALE_DISABLED_REASON` constant, char-for-char per §7.4) → else null. `toggleRowSelection` early-returns on disabled; checkbox + commit button both `[disabled]="isRowDisabled(row)"`; row greys via `.hlo-modal__row--disabled` (opacity + `pointer-events:none`, token-based). Reason callout is in-DOM (`role="note"`, `id="reason-{indicator_id}"`, sibling to the row so `pointer-events:none` doesn't suppress it) with `data-testid="hlo-modal-row-reason-{…}"`; the disabled row exposes `hlo-modal-row-disabled-{…}` via a separate `data-testid-disabled` attribute (so it doesn't clobber the primary row `data-testid`). |
| Resolves T-05 hand-off | The checkbox `aria-describedby` was broadened from T-05's `disabled_reason`-only gate to `rowReasonText(row) ? 'reason-'+id : null`, so it now references the callout for BOTH server-reason and stale-but-unmapped rows — the previously dangling reference is fully resolved. |
| Caveat (per tasks §T-BIL-IM-06) | The live `GET .../hlos-indicators` endpoint carries neither per-row `disabled_reason` nor `is_stale` — both are always null/false in production today. This task ships the primitive only; it won't trigger on live data until the backend mirrors the safe-bundle field onto `PrmsTocIndicator` (R-10). Tests exercise it with hand-crafted fixture rows. |
| Tokens | Callout uses `var(--ac-grey-100/200/700)` + `var(--ac-orange-1)` (all real, light+dark). Zero hex literals; no `isDarkMode()` branching. |
| Reviewer verdict | **PASS** (attempt 1). No critical/warnings. Stale copy literal char-for-char; stale-but-mapped correctly NOT disabled (preserved for the T-08 card flow); selection blocked at three barriers; callout in-DOM + aria wired. Two non-blocking suggestions (document `data-testid-disabled` in tasks.md — done; optional future DOM-attribute assertion on the PrimeNG-rendered input). |
| Verification | • `npm run lint` → clean. • `npm run s-lint` → clean. • `npm run test -- hlo-selection-modal` → 46/46 pass (13 new `it` blocks across the 4 spec cases). • `npm run build` → clean (component `.scss` 5.27 kB, under the 8 kB error budget). |
| ACs discharged | REQ-BIL-IM-04. |

---

## 3. Summary

> Filled in once every task in [`./tasks.md`](./tasks.md) is `completed`.

**Status (as of 2026-05-28)**: 4 of 17 tasks complete + T-BIL-IM-01 read slice landed (write-side gated). The read-side ToC/HLO integration arc (T-BIL-IM-01 read → -04 read → -05 → -07 / -06 / -16) is in active execution; the contribution write-side (T-BIL-IM-08/-09/-11) remains gated on OQ-IM-1.

**Remaining gates** (down from three to two on 2026-05-27 — see Entry 5):
- **OQ-IM-1 — Contribution body shape** — escalated to PO. Gates T-BIL-IM-01, -04, -08, -09, -11.
- **OQ-IM-3 — Edit-mode pre-fill GET** — accepted by backend, awaiting ship as part of the safe-bundle PR. Functionally gates T-BIL-IM-04, -08 until live.
- ~~OQ-IM-2 — AOW data source~~ → RESOLVED 2026-05-27 via the existing T-15.12 endpoint.

**Independent work still parked**:
- T-BIL-IM-05 (HLO modal shell) is now ungated and can start as soon as T-BIL-IM-01 + T-BIL-IM-04 land (chained on the interface + service work, not on any OQ).
- T-BIL-IM-16 (empty-AOW UX) is non-gating and can ship its default with T-BIL-IM-05; refinement waits on OQ-IM-10 from BA + designer.

See [`./tasks.md` §9 OI-IM-1](./tasks.md#9-open-items) and [`./requirements.md` §12](./requirements.md#12-assumptions--open-questions) for full context.

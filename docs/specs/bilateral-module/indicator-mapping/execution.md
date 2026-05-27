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

## 3. Summary

> Filled in once every task in [`./tasks.md`](./tasks.md) is `completed`.

**Status (as of 2026-05-27)**: 4 of 17 tasks complete (T-BIL-IM-RR-01, T-BIL-IM-02, T-BIL-IM-03, T-BIL-IM-14). Task count grew from 16 → 17 with the addition of T-BIL-IM-16 (non-gating empty-AOW UX refinement).

**Remaining gates** (down from three to two on 2026-05-27 — see Entry 5):
- **OQ-IM-1 — Contribution body shape** — escalated to PO. Gates T-BIL-IM-01, -04, -08, -09, -11.
- **OQ-IM-3 — Edit-mode pre-fill GET** — accepted by backend, awaiting ship as part of the safe-bundle PR. Functionally gates T-BIL-IM-04, -08 until live.
- ~~OQ-IM-2 — AOW data source~~ → RESOLVED 2026-05-27 via the existing T-15.12 endpoint.

**Independent work still parked**:
- T-BIL-IM-05 (HLO modal shell) is now ungated and can start as soon as T-BIL-IM-01 + T-BIL-IM-04 land (chained on the interface + service work, not on any OQ).
- T-BIL-IM-16 (empty-AOW UX) is non-gating and can ship its default with T-BIL-IM-05; refinement waits on OQ-IM-10 from BA + designer.

See [`./tasks.md` §9 OI-IM-1](./tasks.md#9-open-items) and [`./requirements.md` §12](./requirements.md#12-assumptions--open-questions) for full context.

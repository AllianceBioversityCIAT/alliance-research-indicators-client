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

## 3. Summary

> Filled in once every task in [`./tasks.md`](./tasks.md) is `completed`.

**Status**: 3 of 16 tasks complete (T-BIL-IM-RR-01, T-BIL-IM-02, T-BIL-IM-03). One more (T-BIL-IM-14) is unblocked and can run without BA / backend resolution. The remaining 11 tasks chain off OQ-IM-1 / OQ-IM-2 / OQ-IM-3 — see [`./tasks.md` §9 OI-IM-1](./tasks.md#9-open-items) and [`./requirements.md` §12 Gating open questions](./requirements.md#12-assumptions--open-questions).

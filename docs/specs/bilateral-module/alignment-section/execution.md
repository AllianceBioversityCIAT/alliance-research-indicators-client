# Execution Log — Bilateral Module / Alignment Section

> Retroactive log of how the 14 tasks in [`./tasks.md`](./tasks.md) actually shipped. Created 2026-05-24 — **after** the work landed — as part of an `/sdd-execute` verification pass against the spec folder. The original execution did not produce an `execution.md`; this file is the catch-up record.

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/alignment-section/` |
| Branch | `AC-1594-bilateral-module` |
| Status | ✅ all 14 tasks shipped + remediated against the Figma mockups |
| Methodology footnote | The 14 tasks were bundled into a single feature commit (`17417fdd`) rather than landing per-PR. This was a deviation from [`./tasks.md` §6 "One task per PR by default"](./tasks.md#6-execution-conventions). It worked because tasks were tightly coupled and reviewed together, but per-task PRs would have been the canonical SDD path. Sibling spec `indicator-mapping/` runs per-task via `/sdd-execute`. |

---

## 2. Verification audit (2026-05-24)

A `/sdd-execute` retroactive audit confirmed every task's artifact is present in the codebase and every test passes. Method: grep the canonical symbols / file paths from [`./tasks.md` §4](./tasks.md#4-tasks) against the current repo state.

| Task | Spec status (tasks.md §10) | Artifact verified | Verification |
| --- | --- | --- | --- |
| T-BIL-AS-01 | completed | `pool-funding-alignment.interface.ts` exists; `GET_PoolFundingAlignment` + `PATCH_PoolFundingAlignment` in `api.service.ts` | grep ✓ |
| T-BIL-AS-02 | completed | `currentAlignment`, `loadingAlignment`, `savingAlignment`, `editable`, `getAlignment`, `patchAlignment`, `extractFieldErrors` on `BilateralService` (8 matches) | grep ✓ |
| T-BIL-AS-03 | completed | `isCurrentUserOwner` computed on `CurrentResultService` | grep ✓ |
| T-BIL-AS-04 | completed | `/pool-funding-alignment` URL-scoped 400 exception in `httpErrorInterceptor` (3 references — declaration + check + comment) | grep ✓ |
| T-BIL-AS-05 | completed | `'pf-synced'` entry in `STATUS_COLOR_MAP` | grep ✓ |
| T-BIL-AS-06 | completed | `pool-funding-alignment` `SidebarOption` + `shouldHidePoolFundingTab` filter (5 matches in `result-sidebar.component.ts`) | grep ✓ |
| T-BIL-AS-07 | completed | `pool-funding-alignment.component.ts` exists | grep ✓ |
| T-BIL-AS-08 | completed | `onSave`, `inlineErrors`, `fieldErrors` (4 matches) | grep ✓ |
| T-BIL-AS-09 | completed | `synced-banner`, `readonly-banner`, `synced-badge`, `isReadOnly` (9 matches in template) | grep ✓ |
| T-BIL-AS-10 | completed | `pool-funding-alignment` registered as a child route in `app.routes.ts` (2 references — path + loadComponent) | grep ✓ |
| T-BIL-AS-11 | completed | `result.pool-funding-alignment.changed` socket subscription + `websocketService` (3 matches) | grep ✓ |
| T-BIL-AS-12 | completed | `bilateral.alignment.viewed`, `bilateral.alignment.saved`, `clarityService` (3 matches) | grep ✓ |
| T-BIL-AS-13 | completed | AR.3 lock + `pool_funding_alignment` assertions in `submission.service.spec.ts` (13 matches across the describe block) | grep ✓ |
| T-BIL-AS-14 | completed | `Pool Funding Alignment` references in `docs/system-design/design.md` + `docs/detailed-design/detailed-design.md` (3 + 3 matches — §7.4.1 form-label contract, §12 decisions row, §2 modules, §4.3 endpoints, §6 services) | grep ✓ |

All 14 tasks verified. No drift between `tasks.md` and the code.

---

## 3. Task execution history

> Reconstructed from `git log` + spec content. Entries are grouped by the commit that shipped each phase.

---

### Entry 1 — Initial bundle: T-BIL-AS-01 through T-BIL-AS-14

| Field | Value |
| --- | --- |
| Status | ✅ all 14 tasks completed |
| Date | 2026-05-22 |
| Method | Direct execution (pre-`/sdd-execute`) — bundled |
| Commit | `17417fdd` "✨ feat(bilateral-module/alignment-section): ship Pool Funding Alignment section (US2 / AC-1594)" — pushed 2026-05-22 |
| Files added | <ul><li>`src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts` (T-BIL-AS-01)</li><li>`src/app/pages/platform/pages/result/pages/pool-funding-alignment/{component.ts,component.html,component.scss,component.spec.ts}` (T-BIL-AS-07, -08, -09, -11, -12)</li></ul> |
| Files modified | <ul><li>`src/app/shared/services/api.service.ts` + `.spec.ts` — `GET/PATCH_PoolFundingAlignment` methods (T-BIL-AS-01)</li><li>`src/app/shared/services/bilateral.service.ts` + `.spec.ts` — alignment state + 4 new methods + `editable` computed (T-BIL-AS-02)</li><li>`src/app/shared/services/cache/current-result.service.ts` + `.spec.ts` — `isCurrentUserOwner` computed (T-BIL-AS-03)</li><li>`src/app/shared/interceptors/http-error.interceptor.ts` + `.spec.ts` — `/pool-funding-alignment` URL exception (T-BIL-AS-04)</li><li>`src/app/shared/constants/status-colors.ts` — `'pf-synced'` entry (T-BIL-AS-05)</li><li>`src/app/shared/components/result-sidebar/result-sidebar.component.ts` + `.spec.ts` — `SidebarOption` + visibility filter (T-BIL-AS-06)</li><li>`src/app/app.routes.ts` — lazy child route (T-BIL-AS-10)</li><li>`src/app/shared/services/submission.service.spec.ts` — AR.3 lock (T-BIL-AS-13)</li><li>`docs/system-design/design.md` + `docs/detailed-design/detailed-design.md` — constitutional docs (T-BIL-AS-14)</li></ul> |
| Mockups consulted | The visual layer in this commit followed the requirements + backend handoff but did NOT cite the mockup files directly. That gap is what produced the remediation arc in Entries 2–10 below — the mockup audit on 2026-05-23 found six visual / copy / placement divergences that this initial bundle missed (RR-A..F + G + I, documented in [`./design.md` §4.7](./design.md#47-alignment-section-mockup-remediation-rolls-divergences-af--g--i-into-this-spec) and [`docs/specs/bilateral-module/indicator-mapping/design.md` §4.7](../indicator-mapping/design.md#47-alignment-section-mockup-remediation-rolls-divergences-af--g--i-into-this-spec)). |
| Decisions | Recorded in [`./design.md` §11](./design.md#11-design-decisions-decision-record) at commit time: <ul><li>Extend `BilateralService` rather than introduce an `AlignmentService` (cross-feature consumers will share state).</li><li>Component-level ineligibility redirect instead of a route guard (avoid GET serialization).</li><li>No `useResultInterceptor` on the alignment endpoints (the version-query mutation that interceptor does isn't needed; alignment is always-current).</li><li>Sidebar position: between Alliance Alignment and Partners (resolves OQ-AS-1 — **later overridden by mockup RR-E**; see Entry 2).</li><li>`'pf-synced'` token reuses `--ac-grey-700` (resolves OQ-AS-2).</li><li>Synced banner placement: top-of-section, persistent (resolves OQ-AS-3).</li><li>No socket-down polling fallback in v1 (resolves OQ-AS-4).</li><li>Justification char counter inline below textarea — **later overridden by mockup RR-G** (mockup has no justification textarea; reason lives per-HLO card in indicator-mapping).</li><li>Owner derivation lives on `CurrentResultService.isCurrentUserOwner()`, not on `BilateralService`.</li></ul> |
| Methodology notes | <ul><li>Tasks 01–14 were bundled into one commit rather than landing per-PR — a deviation from [`./tasks.md` §6](./tasks.md#6-execution-conventions). Worked because the 14 tasks were tightly coupled and reviewed together, but the sibling `indicator-mapping/` spec landed per-task via `/sdd-execute` for cleaner audit trail.</li><li>The `editable` computed used `RolesService.canAccessCenterAdmin()` instead of `canEditAnyResult()` because the requirements role matrix marks `MEL_REGIONAL_EXPERT` as read-only and `canEditAnyResult` would have included them. Tasks-as-designed didn't catch this; the implementation corrected it during T-BIL-AS-02 execution and the design doc rationalized after the fact.</li></ul> |
| Verification | Tests for each touched file passed at commit time. `ng build` (development) clean. Backend integration verified against the AC-1594 backend branch in dev. |

---

### Entry 2 — Mockup remediation (RR-A..F + G + I)

| Field | Value |
| --- | --- |
| Status | ✅ completed |
| Date | 2026-05-23 |
| Method | Direct fix-up commit after a mockup audit caught six divergences |
| Commit | `01a0cd57` "🐛 fix(bilateral-module/alignment-section): reconcile UI with approved Figma mockups" |
| Triggered by | User question "for the implementation you are taking in consideration the mockups ?". Honest answer: no, the initial bundle referenced the mockup folder but didn't read the files. Audit produced 6 RR (Re-mediation Request) findings. |
| Mockups consulted | [`../figma-mockups/32470-3149-pool-funding-alignment-default.md`](../figma-mockups/32470-3149-pool-funding-alignment-default.md), [`../figma-mockups/33528-138394-pool-funding-alignment-default-required.md`](../figma-mockups/33528-138394-pool-funding-alignment-default-required.md), [`../figma-mockups/33528-138106-pool-funding-alignment-no-branch.md`](../figma-mockups/33528-138106-pool-funding-alignment-no-branch.md), [`../figma-mockups/32471-129337-pool-funding-alignment-sp-dropdown-open.md`](../figma-mockups/32471-129337-pool-funding-alignment-sp-dropdown-open.md), [`../figma-mockups/33356-11736-pool-funding-alignment-synchronized.md`](../figma-mockups/33356-11736-pool-funding-alignment-synchronized.md) |
| Divergences fixed | <ul><li>**RR-A**: Yes/No control swapped from `<p-selectButton>` to `<p-radioButton>` group.</li><li>**RR-B**: Added `SCIENCE PROGRAM CONTRIBUTION` section heading.</li><li>**RR-C**: Question copy: `Pool Funding` → `a Science Program or Accelerator`.</li><li>**RR-D**: Added the `Select the High-Level Outputs (HLO) and related indicators…` info banner.</li><li>**RR-E**: Sidebar tab moved from "between Alliance Alignment and Partners" to **bottom of sidebar** per mockup `33356:11736`.</li><li>**RR-F**: Tab label `Pool Funding alignment` → `Pool funding alignment` (lowercase "f").</li><li>**RR-G**: Section-level justification textarea removed; backend column kept; PATCH body no longer sends `justification`.</li><li>**RR-I**: Required marker `*` next to the Yes/No question + `aria-required="true"` on the radio group.</li></ul> |
| Files modified | `pool-funding-alignment.component.html`, `pool-funding-alignment.component.ts`, `pool-funding-alignment.component.spec.ts`, `result-sidebar.component.ts`, `result-sidebar.component.spec.ts` |
| Verification | All component + service specs green; `ng build` clean. |

---

### Entry 3 — Parent-page-load fix (sidebar tab visibility)

| Field | Value |
| --- | --- |
| Status | ✅ completed |
| Date | 2026-05-23 |
| Method | Bug fix |
| Commit | `352299ab` "🐛 fix(bilateral-module/alignment-section): load alignment from result page parent so sidebar tab appears" |
| Issue | Chicken-and-egg: the sidebar's tab-visibility filter required `BilateralService.currentAlignment` to be non-null + `eligible: true`. But the only call to `getAlignment` was inside `PoolFundingAlignmentComponent.constructor` — which runs only AFTER the user navigates to the tab. The tab was hidden until alignment loaded → user never saw it → alignment never loaded. Reported by the user after navigating to a Pool-Funding-eligible result and seeing no tab. |
| Fix | `ResultComponent` (the parent of every `/result/:id/*` tab) now calls `bilateralService.getAlignment(resultCode)` in its route-params effect. The sidebar's reactive computed picks up the loaded state. A small `lastAlignmentResultCode` guard prevents duplicate fetches. |
| Files modified | `result.component.ts` (+ 14 lines) |
| Verification | 17/17 `result.component.spec.ts` tests pass; `ng build` clean. Manual smoke: sidebar tab appears on Pool-Funding-eligible results. |

---

### Entry 4 — URL pattern (v1/ prefix + STAR- strip)

| Field | Value |
| --- | --- |
| Status | ✅ completed |
| Date | 2026-05-23 |
| Method | Bug fix from backend dev feedback |
| Commit | `86252209` "🐛 fix(bilateral-module/alignment-section): URL pattern — add v1/ prefix and strip STAR- from resultCode" |
| Issue | Backend dev reported two issues: (1) bilateral routes are URI-versioned (`/api/v1/results/...`), but the FE was hitting `/api/results/...` because `environment.mainApiUrl` ends with `/api/` (no `/v1/`). (2) The backend route regex on `:resultCode` accepts only digits, but the FE was passing the full `STAR-19792` form from the browser route param. |
| Fix | New `bilateralPath(resultCode, suffix)` private helper on `ApiService` that prepends `v1/results/` and strips a leading `STAR-` (case-insensitive). Reused by both `GET_PoolFundingAlignment` and `PATCH_PoolFundingAlignment` (and by the upcoming indicator-mapping endpoints when they land). |
| Files modified | `api.service.ts`, `api.service.spec.ts` (+ 3 regression cases locking the URL shape) |
| Verification | All `api.service.spec.ts` cases pass with the new URL shape locked. `ng build` clean. |

---

### Entry 5 — Defensive WebsocketService / ClarityService injection (NG0200 fix)

| Field | Value |
| --- | --- |
| Status | ✅ completed |
| Date | 2026-05-23 |
| Method | Bug fix from a production NG0200 error |
| Commit | `3df3deff` "🐛 fix(bilateral-module/alignment-section): defensive WebsocketService/ClarityService injection" |
| Issue | User reported `NG0200: Circular dependency in DI detected for _WebsocketService` when navigating to the Pool funding alignment tab. Root cause: `app.config.ts` does NOT register `SocketIoModule.forRoot(...)` anywhere. The two existing consumers (`metadata-panel`, `room.component`) are never reached in production paths, so this was the first navigation-reachable component to actually trigger `WebsocketService` construction — and Angular's DI cycle detector tripped during the broken construction. |
| Fix | Wrap `inject(WebsocketService)` and `inject(ClarityService)` in try/catch IIFE field initializers. If construction throws, the field is `null` and the component degrades gracefully (real-time reconcile no-ops; telemetry events no-op). Optional chaining (`?.`) added at the two call sites. |
| Files modified | `pool-funding-alignment.component.ts` (+ 13 / -5 lines) |
| Verification | 44/44 component spec tests still pass; `ng build` clean. Manual smoke: the tab opens without the NG0200 error. |
| Follow-up | When backend / infra adds `SocketIoModule.forRoot(...)` to `app.config.ts`, the subscription comes back online without any code change here. |

---

### Entry 6 — Layout alignment with the result-detail shell

| Field | Value |
| --- | --- |
| Status | ✅ completed |
| Date | 2026-05-23 |
| Method | Visual cleanup after side-by-side comparison with General Information |
| Commit | `05fa2913` "🎨 style(bilateral-module/alignment-section): align layout with the result-detail shell (page-wrapper + section-title + single navigation footer)" |
| Issue | User reported three layout mismatches between Pool funding alignment and the other tabs (General Information, IP Rights): no `.app-page-wrapper` outer wrapper, bold `<h2>` section heading instead of the canonical `.section-title` class, and a duplicate Save affordance (the tab shipped its own `<app-navigation-buttons>` + standalone `<p-button>` Save alongside the shell's footer Back/Next/Save bar). |
| Fix | Wrapped the content in `<div class="app-page-wrapper">`, used `.section-title` class for the SCIENCE PROGRAM CONTRIBUTION heading, removed the standalone `<p-button>` (and `ButtonModule` import), reduced to a single `<app-navigation-buttons>` with `[showSave]` / `[disableSave]` / `(save)` wiring matching the General Information pattern. |
| Files modified | `pool-funding-alignment.component.ts`, `pool-funding-alignment.component.html`, `pool-funding-alignment.component.spec.ts` (- 3 obsolete `pf-alignment-save` data-testid assertions) |
| Verification | 44/44 component spec tests pass; `ng build` clean. Manual smoke: layout matches General Information / IP Rights tabs. |

---

### Entry 7 — Canonical `.label` / `.option-label` colors + system-design contract

| Field | Value |
| --- | --- |
| Status | ✅ completed |
| Date | 2026-05-23 → 2026-05-24 |
| Method | Visual cleanup after side-by-side comparison with IP Rights |
| Commit | `e07ec9fb` "🎨 style(bilateral-module/alignment-section): use canonical .label / .option-label classes; document form-label contract in system-design" |
| Issue | User reported the question text and Yes/No labels rendered in body grey/black instead of the canonical primary-blue-400 used by every other tab. Initial template used raw Tailwind (`text-sm font-medium`, `text-sm`) which falls back to body color. |
| Fix | Swapped to `.label` (question) and `.option-label ml-2` (Yes/No labels). Required marker switched to `text-red-500` to match the shared `app-radio-button` pattern. |
| Documentation | Added `docs/system-design/design.md` §7.4.1 "Canonical form-label classes (binding contract)" — a binding table covering `.label` / `.description` / `.option-label` / `.section-title` with their resolved styles, an explicit "Tailwind utilities are not a substitute" rule, and a pointer to `app-radio-button` as the preferred shared primitive. Also added the §12 decisions log row dated 2026-05-24 capturing the full remediation arc. |
| Files modified | `pool-funding-alignment.component.html`, `docs/system-design/design.md` |
| Verification | 44/44 tests pass; `ng build` clean. |

---

### Entry 8 — Info-banner pattern match (IP Rights left-accent)

| Field | Value |
| --- | --- |
| Status | ✅ completed |
| Date | 2026-05-24 |
| Method | Visual cleanup |
| Commit | `9b946f9f` "🎨 style(bilateral-module/alignment-section): match IP Rights info-banner pattern (left-accent, no full border)" |
| Issue | User compared the alignment-section info banner to IP Rights and found mine had a full grey border on all sides + `--ac-grey-100` bg, while the canonical pattern uses a 5px `#074B86` left stripe with no other borders. |
| Fix | Reused the IP Rights markup verbatim: `bg-[#F4F7F9] border-l-[5px] border-l-[#074B86]` + `material-symbols-rounded` info icon in `#074b86` (rotated 180°) + body text in `#777C83` Barlow 14px / 17px. `INFO_BANNER` constant binding + `role="note"` + `data-testid` preserved. |
| Files modified | `pool-funding-alignment.component.html` (+ 5 / -3) |
| Verification | 44/44 tests pass; `ng build` clean. |
| Follow-up | This pattern is now duplicated across IP Rights, Pool funding alignment, etc. Logged as a follow-up suggestion: promote to a shared `app-info-banner` component. Tracked as OI-IM-2 in [`../indicator-mapping/tasks.md` §9](../indicator-mapping/tasks.md#9-open-items). |

---

### Entry 9 — Backend handoff conflict resolution (out of scope here)

Three later commits touched tag-visibility / project-detail / my-projects but are NOT part of the alignment-section spec's remediation arc:

- `e16ec195` — `CONTRIBUTING TO POOL FUNDING` inline label on project-detail header (tag-visibility surface).
- `974e83c6` — `pool-funding-contributor` allowlist in `buildFindContractsParams` + sidebar filter label color (tag-visibility surface).
- `0ac331b8` — `custom-tag` default `whitespace-nowrap` (shared component fix).

These are logged in the tag-visibility execution log (which doesn't exist yet — would be a parallel catch-up exercise if needed).

---

### Entry 10 — Second mockup audit pass (AD-1, AD-2, AD-3)

| Field | Value |
| --- | --- |
| Status | ✅ completed |
| Date | 2026-05-24 |
| Method | User-requested second-pass audit via `/sdd-execute` — "please check and try to identify the differences vs the mockups and try to align the activities". After the first remediation arc (Entries 2–8) closed RR-A..F + G + I, this pass walked every alignment-section mockup file again line-by-line and found three residual divergences. |
| Mockups consulted | [`../figma-mockups/32471-129337-pool-funding-alignment-sp-dropdown-open.md`](../figma-mockups/32471-129337-pool-funding-alignment-sp-dropdown-open.md) §3 + §7, [`../figma-mockups/33528-138106-pool-funding-alignment-no-branch.md`](../figma-mockups/33528-138106-pool-funding-alignment-no-branch.md) §2 + §6, [`../figma-mockups/33528-138394-pool-funding-alignment-default-required.md`](../figma-mockups/33528-138394-pool-funding-alignment-default-required.md), [`../figma-mockups/32470-3149-pool-funding-alignment-default.md`](../figma-mockups/32470-3149-pool-funding-alignment-default.md). |
| Divergences fixed | <ul><li>**AD-1**: `32471:129337` §3 + §7 show the section heading paired with an **info-circle icon** (`SCIENCE PROGRAM CONTRIBUTION ⓘ`). Implementation had heading text only. Fixed by adding `<i class="pi pi-info-circle">` in `--ac-grey-500` next to the title in a small left-flex container; preserves the existing `justify-between` layout that places the synced badge on the right.</li><li>**AD-2**: `32471:129337` §7 explicitly shows the SP picker label `Select the Science Program(s) this is related to*` with a required marker. Implementation was missing the `*`. Fixed by routing the label through a new `SP_PICKER_LABEL` constant + binding `[isRequired]="true"` on the existing shared `<app-multiselect>` (which renders the marker via its own template).</li><li>**AD-3**: `33528:138106` §2 visual + §6 STAR fit notes ("SP and HLO sub-sections are removed from the DOM") show NO message below the Yes/No question when "No" is selected. Implementation had an invented `"No Pool Funding contribution recorded."` line that isn't in any mockup. Removed the entire `@else if (formData().has_contribution === false)` branch.</li></ul> |
| Deferrals recorded | **AD-4** (non-blocking): the mockup §10 OQ-32471-129337-B proposes the SP picker placeholder copy `Select one or more Science Programs…` — currently the placeholder is `Select Science Programs`. This is a non-gating Open Question in the mockup; leaving as-is until design QA confirms the final copy. Recorded here so it's findable. |
| Files modified | `pool-funding-alignment.component.html`, `pool-funding-alignment.component.ts` (added `SP_PICKER_LABEL` constant alongside the existing `INFO_BANNER` / `CONTRIBUTION_QUESTION`). |
| Verification | 44/44 component tests pass; ESLint clean; `ng build --configuration development` clean. No spec assertions broke when removing the `"No Pool Funding contribution recorded."` message — none of the existing tests had locked that copy (it wasn't referenced anywhere in the spec, which itself suggests it was never canonical). |
| What's NOT a divergence | <ul><li>The `<app-multiselect serviceName="levers">` source. Mockup §9 STAR-fit-note 2 of `32471:129337` raises that SP options should be **scoped to the bilateral project's W3 Registry contributions** rather than the full CLARISA catalog. This is a **backend filtering concern** (the `GET /levers` endpoint either filters server-side or the FE passes a `?contract-code=` filter). Out of scope for the FE template; tracked separately if needed.</li><li>The "Synchronized with PRMS" sidebar panel in `33356:11736`. That's the US5 surface (deferred — out of scope per the proposal `§5`). My existing in-tab synced badge + banner are correct.</li><li>Star icons on SP options (`32471:129337` §3 mentions hidden star icons for "favorite SP" semantics — OQ-FIG-2). Non-gating, no design intent yet.</li></ul> |
| Coverage on the audit | Mockups `32470-3149`, `33528-138394`, `33528-138106`, `32471-129337` all walked. Mockups `32471-129636` (AI card) and `32471-131617`, `33563-138613`, `33563-137770`, `33356-11075`, `32472-129409`, `33356-12370` belong to the indicator-mapping spec, not this one — covered separately in [`../indicator-mapping/execution.md`](../indicator-mapping/execution.md). Mockup `33356-11736` (US5 sync) is deferred. |

---

## 4. Summary

**Status**: ✅ all 14 alignment-section tasks shipped and verified in code as of 2026-05-24. Initial bundle (`17417fdd`) + 6 remediation commits (`01a0cd57`, `352299ab`, `86252209`, `3df3deff`, `05fa2913`, `e07ec9fb`, `9b946f9f`) all live on `origin/AC-1594-bilateral-module`.

**Key lesson, logged for the indicator-mapping spec**: read the Figma mockups **before** writing the design, not after. The initial alignment-section bundle was backend-handoff-first and missed 6 mockup divergences (RR-A..F + G + I) that needed a follow-up cycle. The indicator-mapping spec rewrite (mockup-first) and its `/sdd-execute` runs (per-task, not bundled) reflect this lesson. The mockup-first contract now lives in [`docs/system-design/design.md` §7.4.1](../../../system-design/design.md#741-canonical-form-label-classes-binding-contract) and the system-design §12 decisions log entry dated 2026-05-24.

**Open items carried forward** (now tracked in [`../indicator-mapping/tasks.md` §9](../indicator-mapping/tasks.md#9-open-items)):

- OI-IM-2 — `app-info-banner` shared component (duplicated pattern; promote when convenient).
- OI-IM-3 — Backend sort dispatcher doesn't honor `order-field=pool-funding-contributor` on `current-user=false` (backend ticket).
- OI-AS-3 — `ActionsService` doesn't accept toast action buttons (cross-tab Refresh UX uses plain info toast; reopen if telemetry shows confusion).
- OI-AS-4 — Backend `errorDetail.errors` shape needs confirmation (`extractFieldErrors` falls back gracefully today).
- OI-AS-7 — Lever code/id mismatch with backend handoff (string vs number); resolved at save-time via `.map(String)`.

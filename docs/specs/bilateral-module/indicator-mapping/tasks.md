# Tasks — Bilateral Module / Indicator Mapping

> Execution units for [`./requirements.md`](./requirements.md) and [`./design.md`](./design.md). Follows the template at [`../../general-setup/task.md`](../../general-setup/task.md). Consumed by `/sdd-execute`.
>
> **Mockup-first tasks.** Every task cites the Figma node(s) it implements. Where a task depends on one of the three gating Open Questions (OQ-IM-1 / OQ-IM-2 / OQ-IM-3 from [`./requirements.md` §12](./requirements.md#12-assumptions--open-questions)), the gate is called out explicitly — those tasks cannot start until the BA / backend team answers.

---

## 1. Goal

When this task list completes: a Pool-Funding-eligible result with at least one saved lever shows the **AI card** "VIEW HIGH LEVEL OUTPUTS" inside its alignment tab. Clicking it opens the **HLO selection modal** — a tree picker with the user's selected SPs in the sidebar (expandable into Areas of Work), an indicator table per active AOW with search, per-row checkboxes + commit buttons, disabled rows with reason callouts, a "Selected → N items" footer counter, and Confirm / Cancel actions. After Confirm, the selected HLOs render as **inline cards on the alignment form**, grouped **SP → AOW → HLO**, each carrying indicator code + name, status tag, progress bar, **Expected target** (read-only), **Quantitative contribution** (conditional dropdown), **Why is this being reported?** dropdown (required), and × removal. On alignment-form **Save**, a diff between pending and persisted mappings fires sequential `DELETE → POST → PATCH` requests per `(indicator_code, lever_code)` pair, stopping on the first 409 and refetching alignment + mappings to transition the form to read-only when synced. Lever changes in the alignment section trigger a panel re-fetch. AR.3 still holds — mappings do NOT block result submission. Foundations from [`../tag-visibility/`](../tag-visibility/) and [`../alignment-section/`](../alignment-section/) are reused exhaustively; no new socket subscription, no new auth flow, no new interceptor edit.

---

## 2. Pre-flight checklist

- [x] [`./requirements.md`](./requirements.md) and [`./design.md`](./design.md) exist and are reviewed (mockup-first rewrite — 2026-05-23).
- [x] PRD personas (PRD §3) and constraints C-1..C-6 (PRD §8.3) still current.
- [x] Sibling specs `tag-visibility/` and `alignment-section/` have shipped (`2779b5fd`, `17417fdd`).
- [x] Alignment-section UX remediated against the mockups (T-BIL-IM-RR-01 below — completed).
- [x] Path aliases (`@platform`, `@services`, `@interfaces`, `@shared`, `@sockets`) declared in [`tsconfig.json`](../../../../research-indicators/tsconfig.json) + [`jest.config.ts`](../../../../research-indicators/jest.config.ts).
- [ ] **OQ-IM-1 — Contribution body shape** answered by BA/backend team. *(Gates T-BIL-IM-01, T-BIL-IM-04, T-BIL-IM-08, T-BIL-IM-09, T-BIL-IM-11.)*
- [ ] **OQ-IM-2 — AOW data source** answered by backend team. *(Gates T-BIL-IM-01, T-BIL-IM-05, T-BIL-IM-10.)*
- [ ] **OQ-IM-3 — Edit-mode pre-fill source** confirmed by backend team. *(Gates T-BIL-IM-04, T-BIL-IM-08.)*

---

## 3. Dependency graph

```
T-BIL-IM-RR-01 (alignment-section mockup remediation) — ✅ COMPLETED out-of-band

T-BIL-IM-01 (backend verification + interfaces + ApiService methods) — 🔒 GATED on OQ-IM-1/2/3
    └─▶ T-BIL-IM-04 (BilateralService extension) — 🔒 OQ-IM-1/3
            ├─▶ T-BIL-IM-05 (HloSelectionModalComponent — shell + sidebar + table) — 🔒 OQ-IM-2
            │       └─▶ T-BIL-IM-06 (disabled indicator + reason callout)
            │       └─▶ T-BIL-IM-07 (modal session-state + Cancel-confirm)
            ├─▶ T-BIL-IM-08 (HloCardComponent — header / target / reason / ×) — 🔒 OQ-IM-1/3
            │       └─▶ T-BIL-IM-09 (Quantitative contribution row) — 🔒 OQ-IM-1
            └─▶ T-BIL-IM-11 (diff-and-batch Save) — 🔒 OQ-IM-1

T-BIL-IM-02 (ModalName 'hloSelection' + HloSelectionModalContextService) — independent
    └─▶ T-BIL-IM-05

T-BIL-IM-03 (BilateralActionCardComponent) — independent (mockup-driven visual only)
    └─▶ T-BIL-IM-10 (mount AI card + HLO cards into alignment tab)

T-BIL-IM-10 (mount into alignment tab) — needs T-BIL-IM-03, T-BIL-IM-05, T-BIL-IM-08
T-BIL-IM-11 (Save diff + 409) — needs T-BIL-IM-04, T-BIL-IM-08, T-BIL-IM-10
T-BIL-IM-12 (lever-cascade refresh effect) — needs T-BIL-IM-04, T-BIL-IM-10
T-BIL-IM-13 (telemetry) — needs T-BIL-IM-05, T-BIL-IM-10, T-BIL-IM-11
T-BIL-IM-14 (AR.3 regression test) — independent (pure test)
T-BIL-IM-15 (constitutional docs update) — last
```

**Parallel-safe groups**:

- **Group A (no backend deps; can start immediately)**: T-BIL-IM-02, T-BIL-IM-03, T-BIL-IM-14.
- **Group B (after OQ-IM-1/2/3 resolve)**: T-BIL-IM-01.
- **Group C (after T-BIL-IM-01)**: T-BIL-IM-04.
- **Group D (after T-BIL-IM-04 + T-BIL-IM-02)**: T-BIL-IM-05, then -06, -07 in parallel.
- **Group E (after T-BIL-IM-04)**: T-BIL-IM-08, then -09 layered on the card.
- **Group F (after C + D + E)**: T-BIL-IM-10, T-BIL-IM-11, T-BIL-IM-12.
- **Group G (last)**: T-BIL-IM-13, T-BIL-IM-15.

---

## 4. Tasks

---

### T-BIL-IM-RR-01 — Alignment-section mockup remediation (RR-A..I)

- **Status**: `completed` (2026-05-23 → 2026-05-24)
- **Size**: M
- **Depends on**: none
- **Discharges**: alignment-section divergences A..I from the mockup audit; rolled into [`./design.md` §4.7](./design.md#47-alignment-section-mockup-remediation-rolls-divergences-af--g--i-into-this-spec).
- **Visual references**:
  - [`../figma-mockups/32470-3149-pool-funding-alignment-default.md`](../figma-mockups/32470-3149-pool-funding-alignment-default.md) (default state + RR-B/C section heading + question copy)
  - [`../figma-mockups/33528-138394-pool-funding-alignment-default-required.md`](../figma-mockups/33528-138394-pool-funding-alignment-default-required.md) (RR-I required marker)
  - [`../figma-mockups/33528-138106-pool-funding-alignment-no-branch.md`](../figma-mockups/33528-138106-pool-funding-alignment-no-branch.md) (No-branch state)
  - [`../figma-mockups/33356-11736-pool-funding-alignment-synchronized.md`](../figma-mockups/33356-11736-pool-funding-alignment-synchronized.md) (RR-E tab position + RR-F label casing)
- **Shipped via**: commits `01a0cd57` (RR-A..F + G + I), `352299ab` (sidebar tab loads via parent), `86252209` (URL `v1/` + STAR- strip), `3df3deff` (defensive `WebsocketService`/`ClarityService` injection), `05fa2913` (layout: `app-page-wrapper` + `.section-title` + single nav-buttons footer), `e07ec9fb` (`.label` / `.option-label` colors + system-design §7.4.1 doc), `e16ec195` (inline `CONTRIBUTING TO POOL FUNDING` on project-detail), `974e83c6` (`pool-funding-contributor` allowlist + sidebar label color), `0ac331b8` (custom-tag `whitespace-nowrap`), `9b946f9f` (info-banner pattern match to IP Rights).
- **Why this is listed**: indicator-mapping mounts the AI card + HLO cards inside the alignment tab; the visual host had to match the mockups first. Done.

---

### T-BIL-IM-01 — Backend verification + interfaces + 5 ApiService methods

- **Status**: `pending — GATED on OQ-IM-1 + OQ-IM-2 + OQ-IM-3`
- **Size**: M
- **Depends on**: none (other than the three gating OQs answered)
- **Discharges ACs**: enables every functional REQ (typing only).
- **Touches**:
  - `src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts` *(extend)*
  - `src/app/shared/services/api.service.ts` *(add 5 methods)*
  - `src/app/shared/services/api.service.spec.ts` *(extend)*
- **Visual references**: shape only — no UI yet.
- **Summary**: Add `IndicatorType`, `IndicatorRow`, `AreaOfWorkGroup`, `IndicatorGroupResponse`, `HloMapping`, `ContributionBody` (shape per OQ-IM-1 resolution), `MappingResponse`, `HloModalSelectionKey`, `HloKeyString` to the shared interface file. Add five new methods on `ApiService`: `GET_PoolFundingIndicators(resultCode, opts)`, `GET_PoolFundingContribution(resultCode, indicatorCode, leverCode)`, `POST_PoolFundingContribution`, `PATCH_PoolFundingContribution`, `DELETE_PoolFundingContribution`. All use the existing `bilateralPath()` helper (so `v1/` prefix + STAR- strip are inherited).
- **Implementation notes**:
  - Bodies + URL helpers verbatim per [`./design.md` §3.1](./design.md#31-apiservice-additions). Reuses the bilateralPath helper from tag-visibility/alignment-section work.
  - **Pre-flight verification (do this FIRST)**:
    - Open Swagger UI per [`../ari-backend-context/frontend-handoff.md` §10](../ari-backend-context/frontend-handoff.md#10-local-development-tips).
    - Confirm OQ-IM-1 answer reflected in the actual contribution-endpoint payload schema.
    - Confirm OQ-IM-2 answer — does `IndicatorGroupResponse` include `areas_of_work: AreaOfWorkGroup[]`, or only `indicators: IndicatorRow[]`? If only the flat list, document the code-prefix inference fallback in `tasks.md` §9 Open Items.
    - Confirm OQ-IM-3 — does `GET .../contribution?lever-code=` exist? If not, escalate before continuing.
    - **None of these can be assumed**; if any disagrees with the spec, **pause and reconcile** with the BA before writing code.
- **Tests to add/update**: `api.service.spec.ts` — 5+ cases: URL shape, query-param serialization for `GET_PoolFundingIndicators`, `?lever-code=...` encoding, body shape for POST/PATCH, no-body DELETE.
- **Done when**: `npm run lint`, `npm run test -- api.service`, `npm run build` all clean. Backend verification findings recorded in PR description.
- **Relevant skills**: `angular-developer`, `api-design-principles`, `systematic-debugging` (for the Swagger audit).

---

### T-BIL-IM-02 — `ModalName = 'hloSelection'` + `HloSelectionModalContextService`

- **Status**: `completed` (2026-05-24) — see [`./execution.md`](./execution.md) for implementation notes.
- **Size**: S
- **Depends on**: none
- **Discharges ACs**: enables the modal-open flow (REQ-BIL-IM-01 click action, REQ-BIL-IM-06 close behavior).
- **Touches**:
  - `src/app/shared/types/modal.types.ts` *(extend `ModalName`)*
  - `src/app/shared/services/cache/hlo-selection-modal-context.service.ts` *(new)*
  - `src/app/shared/services/cache/hlo-selection-modal-context.service.spec.ts` *(new)*
- **Visual references**: [`../figma-mockups/32471-131617-hlo-modal-empty.md`](../figma-mockups/32471-131617-hlo-modal-empty.md) (the modal shell this enables).
- **Summary**: Add `'hloSelection'` to the `ModalName` literal union. Create a singleton (`providedIn: 'root'`) service that holds the active modal payload — `{ resultCode, leverCodes, leverNames }` plus open/close helpers. Mirrors the `CreateResultManagementService` pattern.
- **Implementation notes**:
  - Service exposes `context = signal<HloSelectionModalContext | null>(null)`, `setContext()`, `clear()`.
  - Modal-host registration: confirm during implementation whether `AllModalsService` needs explicit `ModalName` registration (it auto-discovers in the existing patterns — check `all-modals.component.ts`).
- **Tests**: 3 cases — default null, setContext updates the signal, clear() resets to null.
- **Done when**: union compiles across consumers; `npm run test -- hlo-selection-modal-context` green.
- **Relevant skills**: `angular-developer`.

---

### T-BIL-IM-03 — `BilateralActionCardComponent` (the "VIEW HIGH LEVEL OUTPUTS" AI card)

- **Status**: `completed` (2026-05-24) — see [`./execution.md`](./execution.md) for implementation notes.
- **Size**: S
- **Depends on**: none
- **Discharges ACs**: REQ-BIL-IM-01.
- **Touches**:
  - `src/app/shared/components/bilateral-action-card/bilateral-action-card.component.{ts,html,scss,spec.ts}` *(new)*
- **Visual references**: [`../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md`](../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md) — 1036×103 card, 73×73 illustration on the left, uppercase title "VIEW HIGH LEVEL OUTPUTS", body copy verbatim, green CTA button on the right.
- **Summary**: Reusable shared component. Inputs: `illustration` (img src), `title`, `body`, `ctaLabel` (default `'View HLOs'` — resolves OQ-FIG-5; "Upload file" in the mockup was a known copy-paste artifact per the mockup README §7), `ctaIcon` (default `'pi pi-folder'`), `disabled`. Output: `(ctaClick)`.
- **Implementation notes**:
  - Layout per the mockup: `<div class="flex bg-[#fcfcfc] border rounded-[10px] p-[20px] gap-4 items-center">`. Use existing `--ac-green-300` token for the CTA button background.
  - Body text: Barlow 14px / 17px line-height / `--ac-grey-700` per the canonical body-text class.
  - **A11y**: `role="region"`, `aria-labelledby` pointing at the title `<h3>`. Illustration `aria-hidden="true"`. The CTA button has a descriptive `aria-label` ("Open High Level Outputs selector").
  - **`data-testid`**: `bilateral-action-card`, `bilateral-action-card-title`, `bilateral-action-card-body`, `bilateral-action-card-cta`.
- **Tests**: 5–6 cases — renders inputs, emits `(ctaClick)`, disabled state blocks the click, a11y attributes present, default CTA label is `'View HLOs'`.
- **Done when**: visual matches the mockup at 1440px width (manual smoke); coverage ≥ 70% on the component; `npm run build` clean.
- **Relevant skills**: `angular-developer`, `frontend-design`, `ui-ux-pro-max`.

---

### T-BIL-IM-04 — Extend `BilateralService` with indicator + mapping state (5 mutation methods + `editable` reuse)

- **Status**: `pending — GATED on OQ-IM-1 + OQ-IM-3`
- **Size**: M
- **Depends on**: T-BIL-IM-01
- **Discharges ACs**: enables AC-12 / AC-13 / AC-14 / AC-16 / AC-17 — every mutation-bearing requirement.
- **Touches**:
  - `src/app/shared/services/bilateral.service.ts` *(extend)*
  - `src/app/shared/services/bilateral.service.spec.ts` *(extend)*
- **Visual references**: none (service layer); but the data flow it powers is rendered by `32471:131617`, `33356:11075`, `33563:138613`, `33563:137770`, `32472:129409`.
- **Summary**: Add `indicatorGroups`, `persistedMappings`, `pendingMappings`, `hloModalSelection`, `loadingIndicators`, `savingMappings`, `indicatorSearch`, `indicatorTypeFilter` signals; `getIndicators`, `getMappings`, `loadModalSelection`, `commitModalSelection`, `cancelModalSelection`, `updateMappingField`, `removeMapping`, `saveMappings` methods. Reuses `editable` computed from alignment-section.
- **Implementation notes**:
  - Implementation body verbatim per [`./design.md` §4.4.1](./design.md#441-extended--bilateralservice).
  - `saveMappings` order: **DELETE → POST → PATCH**, stops on first 409, returns `SaveMappingsResult` discriminated union with `failedKey` so the calling component can pin the inline error to the right HLO card.
  - `bodyOf()` mapper depends on OQ-IM-1 resolution. The provisional shape in design §2.1 is the placeholder.
  - `getContribution` depends on OQ-IM-3 — the FE shouldn't call it if the backend doesn't expose it (fall back to embedding contribution body in the panel GET).
- **Tests**: ~12 cases covering signal toggles, query-param composition, diff correctness (added/updated/removed buckets), stop-on-409, `failedKey` propagation on 400/5xx.
- **Done when**: service ≥ 90% statements; existing alignment-section + tag-visibility tests still pass.
- **Relevant skills**: `angular-developer`, `error-handling-patterns`.

---

### T-BIL-IM-05 — `HloSelectionModalComponent` shell + sidebar + table

- **Status**: `pending — GATED on OQ-IM-2`
- **Size**: L
- **Depends on**: T-BIL-IM-02, T-BIL-IM-04
- **Discharges ACs**: REQ-BIL-IM-02, REQ-BIL-IM-03, REQ-BIL-IM-05.
- **Touches**:
  - `src/app/shared/components/all-modals/modals-content/hlo-selection-modal/hlo-selection-modal.component.{ts,html,scss,spec.ts}` *(new)*
- **Visual references**:
  - [`../figma-mockups/32471-131617-hlo-modal-empty.md`](../figma-mockups/32471-131617-hlo-modal-empty.md) — canonical empty state. Three-zone layout: 256×743 sidebar + 974×886 main pane + footer.
  - [`../figma-mockups/33563-137770-hlo-modal-3-items-selected.md`](../figma-mockups/33563-137770-hlo-modal-3-items-selected.md) — 3 items selected; per-AOW selection-count badge; per-row commit button.
- **Summary**: Wide modal (1277×1113 per mockup) with:
  1. **Header**: title "High Level Outputs" + close (×).
  2. **Left sidebar** (256 wide): selected SPs → expandable AOWs; active AOW highlighted (`Light Blue-100`); per-AOW selection-count badge bound to `hloModalSelection.size`.
  3. **Main pane**: breadcrumb (`SP > AOW`), search input (debounced 300 ms), indicator table per active AOW with checkbox + per-row commit button + selection state (background `Light Blue-100`).
  4. **Footer**: `Selected → N items` counter (left) + Cancel + Confirm (right).
- **Implementation notes**:
  - Imports: `CommonModule`, `FormsModule`, `InputTextModule`, `CheckboxModule`, `ButtonModule`, `BadgeModule`, `TooltipModule`, `SkeletonModule`.
  - Empty states (one-liner per AC-14 / AC-05.3 / AC-05.4): catalog not synced; active AOW empty; search empty in active AOW.
  - Search input syncs to `BilateralService.indicatorSearch` via a 300 ms debounced effect.
  - **`data-testid`**: `hlo-modal-root`, `hlo-modal-sidebar`, `hlo-modal-aow-{leverCode}-{aowCode}`, `hlo-modal-aow-badge-{...}`, `hlo-modal-row-{leverCode}-{aowCode}-{indicatorCode}`, `hlo-modal-row-checkbox-{...}`, `hlo-modal-row-commit-{...}`, `hlo-modal-counter`, `hlo-modal-confirm`, `hlo-modal-cancel`.
- **Tests**: ~10 cases — sidebar lists selected_levers; AOW expand toggles; active-AOW switch updates main pane; per-row commit toggles selection + counter + AOW badge; empty states; search debounce → fetch.
- **Done when**: Coverage ≥ 70% on the component; manual smoke matches `32471:131617` at 1440px; `ng build` clean.
- **Relevant skills**: `angular-developer`, `frontend-design`, `ui-ux-pro-max`.

---

### T-BIL-IM-06 — Disabled-indicator row with inline reason callout

- **Status**: `pending` *(no extra backend deps once T-BIL-IM-01 lands — the `disabled_reason` field is part of the spec'd `IndicatorRow` shape)*
- **Size**: S
- **Depends on**: T-BIL-IM-05
- **Discharges ACs**: REQ-BIL-IM-04.
- **Touches**:
  - `hlo-selection-modal.component.{html,scss,spec.ts}` *(extend)*
- **Visual references**: [`../figma-mockups/33563-138613-hlo-modal-disabled-reason.md`](../figma-mockups/33563-138613-hlo-modal-disabled-reason.md) — disabled row state with 259×26 callout `This indicator cannot be mapped to this result because <reason>`.
- **Summary**: When `IndicatorRow.disabled_reason !== null` OR (`is_stale=true && !is_mapped`), render the row greyed-out and non-interactive. Place the reason callout inline near the row.
- **Implementation notes**:
  - Reason text MUST be in the DOM (not hover-only) so screen readers announce it — bind via `aria-describedby="reason-{indicator_code}"`.
  - Stale-but-unmapped uses the canonical stale copy: `"This indicator was retired in the upstream catalog. Existing mappings are preserved; new mappings are not accepted."` Otherwise the server-provided `disabled_reason` is used verbatim.
  - **`data-testid`**: `hlo-modal-row-disabled-{...}`, `hlo-modal-row-reason-{...}`.
- **Tests**: 4 cases — disabled row not clickable, checkbox/commit non-interactive, reason in DOM with `aria-describedby`, stale-but-unmapped uses the canonical stale copy.
- **Done when**: coverage ≥ 70% on the disabled-row branch; manual a11y check (keyboard focus reveals reason).
- **Relevant skills**: `angular-developer`, `frontend-design`.

---

### T-BIL-IM-07 — Modal session-state + Cancel-confirm dialog

- **Status**: `pending`
- **Size**: S
- **Depends on**: T-BIL-IM-05
- **Discharges ACs**: REQ-BIL-IM-06, REQ-BIL-IM-07.
- **Touches**:
  - `hlo-selection-modal.component.{ts,html,spec.ts}` *(extend)*
- **Visual references**: implied by `33563:137770` (selection state) + `33563:138613` (canonical pattern). No specific mockup for the cancel-confirm dialog; reuse the existing `ActionsService.showGlobalAlert` pattern from `result-sidebar`.
- **Summary**: Opening the modal calls `bilateralService.loadModalSelection()` to seed `hloModalSelection` from `pendingMappings`. Confirm calls `commitModalSelection()` then closes the modal. Cancel/× checks whether the in-modal selection differs from the seeded state; if it differs, show a confirm dialog "Discard your selection changes?" — Yes discards, No re-opens the modal as-is.
- **Implementation notes**:
  - Differ comparator: compare two `Set<HloKeyString>` snapshots via size + every-key check.
  - Cancel-confirm copy is shared and stable — store as `private readonly DISCARD_CONFIRM_*` constants on the component (i18n-extractable).
- **Tests**: 5 cases — modal opens with seeded selection; Confirm commits; Cancel with no draft changes closes immediately; Cancel with draft changes opens confirm dialog; Discard click in the confirm dialog closes the modal.
- **Done when**: coverage ≥ 70% on the modal's lifecycle handlers.
- **Relevant skills**: `angular-developer`.

---

### T-BIL-IM-08 — `HloCardComponent` — header + status tag + Expected target + Reason dropdown + ×

- **Status**: `pending — GATED on OQ-IM-1 + OQ-IM-3`
- **Size**: L
- **Depends on**: T-BIL-IM-04
- **Discharges ACs**: REQ-BIL-IM-08, REQ-BIL-IM-09, REQ-BIL-IM-11, REQ-BIL-IM-12 (partially — × event wiring; the confirm dialog lands here too).
- **Touches**:
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/components/hlo-card/hlo-card.component.{ts,html,scss,spec.ts}` *(new)*
- **Visual references**:
  - [`../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md`](../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md) — primary reference. Frame 1171276358 = the canonical HLO card layout (1036×290 with Quantitative; 1036×269 without).
  - [`../figma-mockups/33356-12370-pool-funding-alignment-filled-reason.md`](../figma-mockups/33356-12370-pool-funding-alignment-filled-reason.md) — viewport-fit reference.
- **Summary**: Standalone, OnPush. Input: `mapping: HloMapping`. Outputs: `(reasonChange)`, `(remove)`. Layout: header row (indicator code + name + status tag + `times-circle` × top-right when editable), optional progress bar, **Expected target** row (label + `→` icon + read-only value from `mapping.target_description`), **Why is this being reported?** dropdown (full-width 988×119 panel, searchable, required), inline error region for the reason field. Stale indicators get a "Stale" `<p-tag severity="warning">` next to the indicator name.
- **Implementation notes**:
  - Reason dropdown option-list source resolved per OQ-IM-4 (per-indicator catalog data or fixed CLARISA taxonomy). Pass as `[options]` input or fetch internally.
  - Confirm dialog before remove: reuse `ActionsService.showGlobalAlert` (existing pattern from `result-sidebar`). Copy: `"Remove this mapping? The contribution to <indicator_name> under <SP> / <AOW> will be removed on Save."`
  - **`data-testid`**: `hlo-card-{leverCode}-{aowCode}-{indicatorCode}`, `hlo-card-target-{...}`, `hlo-card-reason-{...}`, `hlo-card-remove-{...}`, `hlo-card-stale-badge-{...}`.
- **Tests**: ~10 cases — header renders all sub-elements; Expected target hides when `target_description=null`; reason dropdown required + inline error on Save-when-empty; stale badge present when `is_stale=true`; × hidden when `!editable || is_read_only`; `(reasonChange)` / `(remove)` events fire with the right key; remove triggers confirm dialog.
- **Done when**: coverage ≥ 70% on the component; manual smoke matches `33356:11075` at 1440px.
- **Relevant skills**: `angular-developer`, `frontend-design`, `ui-ux-pro-max`.

---

### T-BIL-IM-09 — Quantitative contribution row (conditional)

- **Status**: `pending — GATED on OQ-IM-1`
- **Size**: S
- **Depends on**: T-BIL-IM-08
- **Discharges ACs**: REQ-BIL-IM-10.
- **Touches**:
  - `hlo-card.component.{ts,html,spec.ts}` *(extend)*
- **Visual references**: [`../figma-mockups/32472-129409-pool-funding-alignment-filled-with-quantitative.md`](../figma-mockups/32472-129409-pool-funding-alignment-filled-with-quantitative.md) — first card shows the row (height 247px), subsequent cards without it (229px). Compact 79×33 dropdown.
- **Summary**: Render the Quantitative contribution row ONLY when `mapping.is_quantitative === true`. Label + `→` icon + 79×33 dropdown (touch target adjusted to 44×44 via padding for a11y). Option list source per OQ-IM-5.
- **Implementation notes**:
  - When `is_quantitative=false`, the row is **absent** from the DOM (not just hidden) — keeps focus order stable across cards of different heights.
  - Validation: required only if backend marks the field required (OQ-IM-6).
- **Tests**: 5 cases — present when `is_quantitative=true`; absent when false; emits change event; required-error rendering; touch target meets 44×44.
- **Done when**: coverage ≥ 70%; visual matches the mockup.
- **Relevant skills**: `angular-developer`.

---

### T-BIL-IM-10 — Mount AI card + HLO cards (grouped SP → AOW) into `PoolFundingAlignmentComponent`

- **Status**: `pending`
- **Size**: M
- **Depends on**: T-BIL-IM-03, T-BIL-IM-05, T-BIL-IM-08
- **Discharges ACs**: REQ-BIL-IM-01 (gate AC-01.1/2), REQ-BIL-IM-08 (grouping), REQ-BIL-IM-14 (empty-state ATC card copy when catalog isn't synced), REQ-BIL-IM-15 (inherits read-only behavior).
- **Touches**:
  - `pool-funding-alignment.component.{ts,html,spec.ts}` *(extend)*
- **Visual references**:
  - [`../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md`](../figma-mockups/32471-129636-pool-funding-alignment-sp-selected-hlo-prompt.md) — AI card placeholder.
  - [`../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md`](../figma-mockups/33356-11075-pool-funding-alignment-filled-empty-reason.md) — filled cards grouped SP → AOW.
- **Summary**: Inside the existing alignment tab (below the SP picker / above the existing footer), render:
  1. `<app-bilateral-action-card>` when `has_contribution=true && selected_levers.length >= 1 && pendingMappings.length === 0`.
  2. A "Manage HLO mappings" collapsed link when `pendingMappings.length > 0` (OQ-IM-7 — `tasks.md` §9 follow-up if design QA prefers the full card always).
  3. The HLO cards container — iterates `pendingMappings` grouped by `lever_code → aow_code` with the SP icon header + AOW uppercase subheader pattern.
  4. Catalog-empty fallback: when `indicatorGroups` is fetched but every group's `indicators` is empty, the AI card body switches to "The Theory of Change catalog has not been synced yet…" (REQ-BIL-IM-14).
- **Implementation notes**:
  - Hook AI card `(ctaClick)` to `hloSelectionModalContextService.setContext({...})` then `allModalsService.openModal('hloSelection')`.
  - Grouping helper: pure function over `pendingMappings` that returns `{ lever, aows: { aow, mappings }[] }[]`. Add unit test for the grouping logic.
- **Tests**: 6 cases — AI card visible only when has_contribution=true + levers exist + no mappings yet; collapsed link visible when mappings exist; CTA click opens modal with the right context; HLO cards rendered grouped SP → AOW; catalog-empty copy substitution; read-only hides the AI card + × buttons.
- **Done when**: coverage ≥ 70% on the new template branches; manual smoke from a Pool-Funding-eligible result.
- **Relevant skills**: `angular-developer`, `frontend-design`, `ui-ux-pro-max`.

---

### T-BIL-IM-11 — Diff-and-batch Save (DELETE → POST → PATCH) + 409 handling

- **Status**: `pending — GATED on OQ-IM-1`
- **Size**: M
- **Depends on**: T-BIL-IM-04, T-BIL-IM-08, T-BIL-IM-10
- **Discharges ACs**: REQ-BIL-IM-13, REQ-BIL-IM-16.
- **Touches**:
  - `pool-funding-alignment.component.{ts,spec.ts}` *(extend)*
- **Visual references**: same as T-BIL-IM-10 (no new visual; behavior change on existing Save button).
- **Summary**: On alignment-form Save, after the alignment PATCH succeeds (existing behavior), call `bilateralService.saveMappings(resultCode)`. The service does the diff and runs the batch. On 409, refetch alignment + mappings (form transitions to read-only via existing alignment-section path) and surface the warning toast. On 400, surface the inline error on the offending HLO card via `result.failedKey`. On 5xx, the global interceptor toasts; pending state preserved.
- **Implementation notes**:
  - Order matters (per `./design.md` §4.4.1): DELETE → POST → PATCH. DELETE first to free server-side constraints; POST next to establish new mappings; PATCH last to update existing.
  - Stop on first 409. Don't catch 5xx — let it bubble to the interceptor.
- **Tests**: 8 cases — happy path (batch all 3 types); 409 stops batch + refetches + warning toast; 400 sets inlineError on the right card; 5xx propagates; pending state preserved on failure; empty diff is a no-op; partial batch (e.g., only deletions) works.
- **Done when**: coverage ≥ 70% on `saveMappings` integration; manual smoke through a full mapping flow.
- **Relevant skills**: `angular-developer`, `error-handling-patterns`.

---

### T-BIL-IM-12 — Lever-cascade refresh effect

- **Status**: `pending`
- **Size**: S
- **Depends on**: T-BIL-IM-04, T-BIL-IM-10
- **Discharges ACs**: REQ-BIL-IM-17.
- **Touches**:
  - `pool-funding-alignment.component.{ts,spec.ts}` *(extend)*
- **Visual references**: implicit (no new UI — reactive behavior).
- **Summary**: An `effect` on `bilateralService.currentAlignment()?.selected_levers` triggers `bilateralService.getIndicators` + `getMappings` when the lever set changes. Reuses the existing `result.pool-funding-alignment.changed` socket subscription wired by alignment-section — when a socket event refetches alignment, this effect picks up the change.
- **Implementation notes**:
  - Memoize via a sorted-joined string key to avoid spurious refetches on object-reference changes (per design §4.2.5 in earlier note).
  - Wrap in `takeUntilDestroyed(this.destroyRef)` for cleanup.
- **Tests**: 4 cases — initial load fires fetch; lever set change refires; same lever set (different object reference) does NOT refire; component destroy cleans up.
- **Done when**: manual smoke — change levers on the alignment form, Save, indicators panel refetches.
- **Relevant skills**: `angular-developer`.

---

### T-BIL-IM-13 — Telemetry events (Clarity)

- **Status**: `pending`
- **Size**: S
- **Depends on**: T-BIL-IM-05, T-BIL-IM-10, T-BIL-IM-11
- **Discharges ACs**: telemetry per [`./design.md` §10](./design.md#10-telemetry).
- **Touches**:
  - `hlo-selection-modal.component.ts` *(modal-open event)*
  - `pool-funding-alignment.component.ts` *(selection-confirmed + mapping-saved events)*
- **Visual references**: none.
- **Summary**: Fire three Clarity events via `ClarityService.trackEvent`:
  - `bilateral.hlo.modal.opened` — once per result per session (reuse the per-session Set guard from `bilateral.alignment.viewed`).
  - `bilateral.hlo.selection.confirmed` — payload `{ result_code, added_count, removed_count, total_count }`.
  - `bilateral.hlo.mapping.saved` — per successful POST/PATCH/DELETE in the batch, payload `{ result_code, indicator_code, lever_code, operation }`.
- **Implementation notes**:
  - Use the existing defensive `clarityService?.trackEvent(...)` pattern (from alignment-section) so missing-provider scenarios degrade gracefully.
  - No PII; result_codes / indicator_codes / lever_codes are not PII per current PRD guidance.
- **Tests**: 4 cases — events fire with the right payload; modal-opened is dedup'd within a session.
- **Done when**: manual verification in Clarity custom-events log.
- **Relevant skills**: `angular-developer`.

---

### T-BIL-IM-14 — AR.3 regression test: mappings do NOT block result submission

- **Status**: `pending` *(no backend deps — pure test)*
- **Size**: S
- **Depends on**: none (can run today against current code)
- **Discharges ACs**: REQ-BIL-IM (AR.3 holds for indicator mappings, same as alignment-section AC-09).
- **Touches**:
  - `src/app/shared/services/submission.service.spec.ts` *(extend)*
  - `src/app/shared/components/result-sidebar/result-sidebar.component.spec.ts` *(extend)*
- **Visual references**: implied — submission flow.
- **Summary**: Mirrors the existing alignment-section AR.3 lock. Locks that the `GreenChecks` interface does NOT add a new key for HLO mappings — and that `canSubmitResult` returns true regardless of `pendingMappings`. Adds a `describe('AR.3 — HLO mappings are decoupled from submission completion')` block.
- **Implementation notes**:
  - Same test shape as the existing AR.3 alignment-section regression test landed in T-BIL-AS-13.
  - Inline comment refers to REQ-BIL-IM-09 (the requirements analog) so future contributors hit the spec.
- **Tests**: 2 cases (the structural ones from T-BIL-AS-13).
- **Done when**: tests green.
- **Relevant skills**: `angular-developer`.

---

### T-BIL-IM-15 — Constitutional docs update

- **Status**: `pending`
- **Size**: S
- **Depends on**: T-BIL-IM-10, T-BIL-IM-11, T-BIL-IM-13 (final shape known)
- **Discharges**: documentation drift policy (root [`CLAUDE.md`](../../../../CLAUDE.md)).
- **Touches**:
  - `docs/system-design/design.md` *(append §12 decisions log row + §8 component inventory entries for `bilateral-action-card`, `hlo-selection-modal`, `hlo-card`)*
  - `docs/detailed-design/detailed-design.md` *(append §2 Results module mention; §4.3 endpoints for indicators + contribution; §6 BilateralService extensions; §6.4 reuses existing socket — no new event)*
- **Visual references**: none (docs-only).
- **Summary**: Append-only entries reflecting the indicator-mapping shipped surface. Single decision row in system-design §12; terse catalog entries in detailed-design.
- **Done when**: diffs are append-only; no reformatting of prior content.
- **Relevant skills**: `frontend-design`.

---

## 5. Testing expectations (global rules)

- Jest via `jest-preset-angular`. `npm run test` / `npm run test:watch` / `npm run test:coverage` from `research-indicators/`.
- Co-locate `.spec.ts` next to subject. Use shared fixtures (add new ones to `src/app/testing/fixtures/bilateral.fixtures.ts` per the alignment-section precedent).
- Service tests use `HttpTestingController` + assert on `MainResponse<T>` envelope.
- Component tests cover role-conditional rendering, mockup-quoted copy literals (regression), and read-only state matrix.
- Dark-mode parity — at least one visual-state assertion per new component variant in both themes (manual record in PR description).
- **Mockup-quoted copy as locked literals**: every component spec MUST include a test that asserts the mockup-quoted copy verbatim. Drift fails CI.
- Coverage floors from [`jest.config.ts`](../../../../research-indicators/jest.config.ts) must not regress. Local: services ≥ 90%, new components ≥ 70%.
- **`ng build` is the authoritative pre-merge gate** — strict-template errors land here, not in bare `tsc --noEmit` (lesson from alignment-section T-BIL-AS-07 + the subsequent template-readonly array fix).

---

## 6. Execution conventions

- **One task per PR by default.** Tightly coupled small tasks (e.g., T-BIL-IM-08 + T-BIL-IM-09) may bundle if reviewable together — record the bundling decision in PR description.
- **PR title**: `<type>(bilateral): <short description>` — match repo convention.
- **PR description** references:
  - This spec folder.
  - The task ID(s) discharged.
  - The AC IDs covered.
  - The Figma node(s) the task implemented.
  - Manual smoke results from [`./design.md` §12.4](./design.md#124-manual-smoke-pr-review).
  - Backend verification findings for T-BIL-IM-01 only.
- **Pre-merge gates**:
  - CI green: `unit-tests.yml`, `sonarcloud-analysis.yml`.
  - `ng build` clean.
  - Bundle budget respected (PRD C-5; total lazy chunk addition ≤ 60 KB per REQ-BIL-IM-NF-03).
  - Manual smoke of every affected surface in both light and dark themes at 1440px.
- **Post-merge**: mark task `completed` in this file. If all tasks complete, update [`./requirements.md`](./requirements.md) §1 Document control with the merge date.

---

## 7. Rollout & feature flags

- **No client-side feature flag.** Backend env vars (`ARI_BILATERAL_MODULE_ENABLED`, `ARI_TOC_SYNC_ENABLED` once ToC sync ships) gate the API; when off, panel GET returns 404 → empty state.
- **Rollout**: dev → staging → production. Coordinate with backend before T-BIL-IM-01 lands; specifically, OQ-IM-1/2/3 resolutions must be deployed to staging first.

---

## 8. Rollback plan

- **Per task**: standard `git revert`.
- **For T-BIL-IM-10 (mount)**: reverting hides the AI card + HLO cards; the underlying service / modal / card code remains and is unreachable until re-mounted.
- **For T-BIL-IM-11 (Save diff)**: reverting drops mapping persistence; alignment-section Save still works as before this spec.
- **No backend contract changes initiated by this spec.** Backend rollbacks are independent.

---

## 9. Open items

- **OI-IM-1 — Gating OQs unresolved**. OQ-IM-1 (body shape), OQ-IM-2 (AOW source), OQ-IM-3 (edit-mode GET) all need BA/backend answers before Group B+ can start. Tracked in [`./requirements.md` §12](./requirements.md#12-assumptions--open-questions).
- **OI-IM-2 — `app-info-banner` shared component**. The IP Rights / Pool funding alignment info-banner pattern is now duplicated; promoting it to `src/app/shared/components/info-banner/` is a worthwhile small follow-up. Not gated by anything — could be done as a parallel cleanup any time. (Flagged after the mockup audit on 2026-05-24.)
- **OI-IM-3 — Backend sort on `pool-funding-contributor`**. The FE sends the right URL (`order-field=pool-funding-contributor`) but the backend doesn't visibly reorder rows on the `current-user=false` path. Backend team to verify the sort dispatcher includes this column. Not blocking; filter works.
- **OI-IM-4 — CGSpace / MQAP for `knowledge_product`** (D9 partial Phase 2). Out of scope for the mockup-first design; reopen if the OQ-IM-1 resolution requires per-type forms.
- **OI-IM-5 — Cross-result rules** (OQ-1440-B from the Jira US). Server-authoritative; FE mirrors via inline-error if/when the rules are documented.

---

## 10. Task ID index

| ID | Title | Size | Depends on | Gating OQ | Status |
| --- | --- | --- | --- | --- | --- |
| T-BIL-IM-RR-01 | Alignment-section mockup remediation (RR-A..I) | M | — | — | **completed** (2026-05-23 → 2026-05-24) |
| T-BIL-IM-01 | Backend verification + interfaces + 5 ApiService methods | M | — | OQ-IM-1/2/3 | pending — GATED |
| T-BIL-IM-02 | `ModalName 'hloSelection'` + `HloSelectionModalContextService` | S | — | — | **completed** (2026-05-24) |
| T-BIL-IM-03 | `BilateralActionCardComponent` | S | — | — | **completed** (2026-05-24) |
| T-BIL-IM-04 | Extend `BilateralService` with indicator + mapping state | M | T-BIL-IM-01 | OQ-IM-1/3 | pending — GATED |
| T-BIL-IM-05 | `HloSelectionModalComponent` shell + sidebar + table | L | T-BIL-IM-02, T-BIL-IM-04 | OQ-IM-2 | pending — GATED |
| T-BIL-IM-06 | Disabled-indicator row with reason callout | S | T-BIL-IM-05 | — | pending |
| T-BIL-IM-07 | Modal session-state + Cancel-confirm dialog | S | T-BIL-IM-05 | — | pending |
| T-BIL-IM-08 | `HloCardComponent` — header + target + reason + × | L | T-BIL-IM-04 | OQ-IM-1/3 | pending — GATED |
| T-BIL-IM-09 | Quantitative contribution row (conditional) | S | T-BIL-IM-08 | OQ-IM-1 | pending — GATED |
| T-BIL-IM-10 | Mount AI card + HLO cards into alignment tab | M | T-BIL-IM-03, T-BIL-IM-05, T-BIL-IM-08 | — | pending |
| T-BIL-IM-11 | Diff-and-batch Save (DELETE → POST → PATCH) + 409 | M | T-BIL-IM-04, T-BIL-IM-08, T-BIL-IM-10 | OQ-IM-1 | pending — GATED |
| T-BIL-IM-12 | Lever-cascade refresh effect | S | T-BIL-IM-04, T-BIL-IM-10 | — | pending |
| T-BIL-IM-13 | Telemetry events (Clarity) | S | T-BIL-IM-05, T-BIL-IM-10, T-BIL-IM-11 | — | pending |
| T-BIL-IM-14 | AR.3 regression test (mappings don't block submission) | S | — | — | pending |
| T-BIL-IM-15 | Constitutional docs update | S | T-BIL-IM-10, T-BIL-IM-11, T-BIL-IM-13 | — | pending |

# Tasks — Bilateral Module / Indicator Mapping

> Execution units for [`./requirements.md`](./requirements.md) and [`./design.md`](./design.md). Follows the template at [`../../general-setup/task.md`](../../general-setup/task.md). Consumed by `/sdd-execute`.
>
> **Mockup-first tasks.** Every task cites the Figma node(s) it implements. The original three gating Open Questions (OQ-IM-1 / OQ-IM-2 / OQ-IM-3 from [`./requirements.md` §12](./requirements.md#12-assumptions--open-questions)) have been narrowed to **two**: OQ-IM-2 was **RESOLVED on 2026-05-27** via the ToC backend audit ([`./open-questions-for-ba.md` §8](./open-questions-for-ba.md#8-toc-backend-audit--2026-05-27-received)). Each task's gating annotation has been updated accordingly. A new non-gating **OQ-IM-10** (empty-AOW UX) is tracked as T-BIL-IM-16.

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
- [ ] **OQ-IM-1 — Contribution body shape** — **ESCALATED TO PO** (2026-05-26 backend reply; decision brief drafted 2026-05-27). Backend won't simplify the body without PO retiring **R-BIL-031** (D5 + D12 become moot under Path A — single decision, not three; per [`../ari-backend-context/po-decision-brief-OQ-IM-1.md` §8](../ari-backend-context/po-decision-brief-OQ-IM-1.md)). *(Gates T-BIL-IM-01, T-BIL-IM-04, T-BIL-IM-08, T-BIL-IM-09, T-BIL-IM-11.)* FE leans Path A per [`./open-questions-for-ba.md` §6.1](./open-questions-for-ba.md#61-oq-im-1--contribution-body-shape--findings); backend response at [`./open-questions-for-ba.md` §7.1](./open-questions-for-ba.md#71-backends-verdict-per-oq). **Decision brief ready to send to PO** ([snapshot](../ari-backend-context/po-decision-brief-OQ-IM-1.md)); recommended decision-by 2026-06-03.
- [x] **OQ-IM-2 — AOW data source** — **RESOLVED 2026-05-27** via ToC backend audit ([`./open-questions-for-ba.md` §8](./open-questions-for-ba.md#8-toc-backend-audit--2026-05-27-received)). Backend already ships `GET .../hlos-indicators` (T-15.12 / commit `907993e7`) returning the SP → AOW → outcome/output → indicator tree pre-grouped. No backend AOW entity will be added; AOW comes live from CLARISA (1:1 cardinality, not persisted in ARI). The FE switches its modal data source to the new endpoint — **no longer gates** T-BIL-IM-01, T-BIL-IM-05, or T-BIL-IM-10. **Replaces** prior `IndicatorGroupResponse` typing with `BilateralHlosIndicatorsResponse` in T-BIL-IM-01.
- [x] **OQ-IM-3 — Edit-mode pre-fill source** — **ACCEPTED by backend** (2026-05-26). Ships GET .../contribution route in ~½ day. *(Still functionally gates T-BIL-IM-04 + T-BIL-IM-08 until the route is live on `AC-1594-bilateral-module-v2`.)* FE leans Path A per [`./open-questions-for-ba.md` §6.3](./open-questions-for-ba.md#63-oq-im-3--edit-mode-pre-fill-get-contribution-endpoint--findings); backend response at [`./open-questions-for-ba.md` §7.1](./open-questions-for-ba.md#71-backends-verdict-per-oq).
- [ ] **OQ-IM-4 — Reason taxonomy** — **NEWLY GATING** (2026-05-26 backend reply) once OQ-IM-1 Path A is approved. Backend reclassified OQ-IM-4 from non-gating → gating-once-Path-A-chosen because `reason_code` validation needs a finite enum. STAR's UX position recorded at [`./open-questions-for-ba.md` §7.4](./open-questions-for-ba.md#74-stars-open-follow-ups-where-the-fe-has-input). *(Gates T-BIL-IM-08 reason-dropdown options.)*
- [ ] **OQ-IM-10 — `no_aow_mappings` empty-state UX** *(new, raised by §8 audit)* — non-gating. Tracked as T-BIL-IM-16. FE can ship a graceful default (flat list per SP) without sign-off; designer + BA confirm later.
- [ ] **Backend safe bundle** (OQ-IM-3 + `is_quantitative` + `disabled_reason`) shipped on `AC-1594-bilateral-module-v2` — needs BA seed list for `is_quantitative` + taxonomy alignment for `disabled_reason`. **Note 2026-05-27**: the safe bundle targets the (now-deprecated) `IndicatorPanelIndicatorResponse`, not the new `PrmsTocIndicator` returned by `GET .../hlos-indicators`. Coordinate with backend so the bonus fields mirror onto `PrmsTocIndicator` (or a sibling enrichment DTO) before T-BIL-IM-09 starts — otherwise FE keeps deriving them client-side per `materializeRows` in `BilateralService`.

---

## 3. Dependency graph

```
T-BIL-IM-RR-01 (alignment-section mockup remediation) — ✅ COMPLETED out-of-band

T-BIL-IM-01 (backend verification + interfaces + ApiService methods) — 🔒 GATED on OQ-IM-1 + OQ-IM-3
    └─▶ T-BIL-IM-04 (BilateralService extension) — 🔒 OQ-IM-1/3
            ├─▶ T-BIL-IM-05 (HloSelectionModalComponent — shell + sidebar + table) — ✅ UNGATED (2026-05-27)
            │       ├─▶ T-BIL-IM-06 (disabled indicator + reason callout)
            │       ├─▶ T-BIL-IM-07 (modal session-state + Cancel-confirm)
            │       └─▶ T-BIL-IM-16 (no_aow_mappings empty-state UX) — non-gating, can ship default
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
T-BIL-IM-16 (no_aow_mappings empty-state UX) — needs T-BIL-IM-05; non-gating
```

**Parallel-safe groups**:

- **Group A (no backend deps; can start immediately)**: T-BIL-IM-02, T-BIL-IM-03, T-BIL-IM-14.
- **Group B (after OQ-IM-1 + OQ-IM-3 resolve)**: T-BIL-IM-01. *(OQ-IM-2 no longer in the gate set per §8 audit.)*
- **Group C (after T-BIL-IM-01)**: T-BIL-IM-04.
- **Group D (after T-BIL-IM-04 + T-BIL-IM-02)**: T-BIL-IM-05, then -06, -07, -16 in parallel.
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

- **Status**: `[~] read slice complete (2026-05-28)` — the `BilateralHlosIndicatorsResponse` family + derived `IndicatorRow` / `HloMapping` types + `GET_PoolFundingHlosIndicators` landed (mirrored verbatim from the live backend DTO). The **4 contribution methods + `ContributionBody`** remain **GATED on OQ-IM-1** (and edit-mode `GET .../contribution` on OQ-IM-3).
- **Size**: M
- **Depends on**: none (other than the two remaining gating OQs answered)
- **Discharges ACs**: enables every functional REQ (typing only).
- **Touches**:
  - `src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts` *(extend)*
  - `src/app/shared/services/api.service.ts` *(add 5 methods)*
  - `src/app/shared/services/api.service.spec.ts` *(extend)*
- **Visual references**: shape only — no UI yet.
- **Summary**: Add `BilateralHlosAowStatus`, `PrmsTocIndicator`, `PrmsTocResult`, `BilateralHlosPair`, `BilateralHlosIndicatorsResponse` (mirrors backend DTO at `src/domain/entities/bilateral/dto/bilateral-hlos-indicators.response.dto.ts`), plus `IndicatorType`, `IndicatorRow` (derived view-model — see design.md §2.1), `HloMapping`, `ContributionBody` (shape per OQ-IM-1 resolution), `MappingResponse`, `HloModalSelectionKey`, `HloKeyString`. Add five new methods on `ApiService`: `GET_PoolFundingHlosIndicators(resultCode)`, `GET_PoolFundingContribution(resultCode, indicatorCode, leverCode)`, `POST_PoolFundingContribution`, `PATCH_PoolFundingContribution`, `DELETE_PoolFundingContribution`. All use the existing `bilateralPath()` helper (so `v1/` prefix + STAR- strip are inherited).
- **Implementation notes**:
  - Bodies + URL helpers verbatim per [`./design.md` §3.1](./design.md#31-apiservice-additions). Reuses the bilateralPath helper from tag-visibility/alignment-section work.
  - **The `IndicatorGroupResponse` / `AreaOfWorkGroup` types from earlier drafts are NOT to be added** — per [`./open-questions-for-ba.md` §8](./open-questions-for-ba.md#8-toc-backend-audit--2026-05-27-received), the backend does not expose that catalog endpoint. Use `BilateralHlosIndicatorsResponse` exclusively.
  - **Pre-flight verification (do this FIRST)**:
    - Open Swagger UI per [`../ari-backend-context/frontend-handoff.md` §10](../ari-backend-context/frontend-handoff.md#10-local-development-tips).
    - Confirm OQ-IM-1 answer reflected in the actual contribution-endpoint payload schema.
    - Confirm the `GET .../hlos-indicators` shape against the live backend DTO file `bilateral-hlos-indicators.response.dto.ts` on `AC-1594-bilateral-module-v2` (commit `907993e7` or later). Copy the DTO verbatim into our interface file; do NOT paraphrase field names (especially `unit_messurament` — the backend mirrors the upstream PRMS spelling).
    - Confirm OQ-IM-3 — does `GET .../contribution?lever-code=` exist on `AC-1594-bilateral-module-v2`? Backend accepted in §7.1 and committed to ~½ day; verify the route is live before T-BIL-IM-04 starts.
    - **None of these can be assumed**; if any disagrees with the spec, **pause and reconcile** with the BA before writing code.
- **Tests to add/update**: `api.service.spec.ts` — 5+ cases: URL shape for `GET_PoolFundingHlosIndicators` (result-scoped, no query params), `?lever-code=...` encoding on contribution routes, body shape for POST/PATCH, no-body DELETE, `MainResponse<BilateralHlosIndicatorsResponse>` envelope shape.
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
- **Status**: `[~] read slice complete (2026-05-28)` — HLO read state + modal-selection surface landed (`hlosIndicators`/`persistedMappings`/`pendingMappings`/`hloModalSelection`/`loadingHlos`/`savingMappings`/`indicatorSearch` signals, `indicatorRows` computed, `getHlosIndicators`, `loadModalSelection`/`commit`/`cancel`, `updateMappingField`/`removeMapping`, `materializeRows`/`deriveIndicatorType`/`composeTarget`/`inferQuantitative`/`materializeMappings`). The write surface (`saveMappings`/`bodyOf`/`getContribution`/`getMappings`/`diff`/`SaveMappingsResult`) remains **GATED on OQ-IM-1/-3**.
- **Discharges ACs**: enables AC-12 / AC-13 / AC-14 / AC-16 / AC-17 — every mutation-bearing requirement.
- **Touches**:
  - `src/app/shared/services/bilateral.service.ts` *(extend)*
  - `src/app/shared/services/bilateral.service.spec.ts` *(extend)*
- **Visual references**: none (service layer); but the data flow it powers is rendered by `32471:131617`, `33356:11075`, `33563:138613`, `33563:137770`, `32472:129409`.
- **Summary**: Add `hlosIndicators` (signal), `indicatorRows` (computed view-model via `materializeRows`), `persistedMappings`, `pendingMappings`, `hloModalSelection`, `loadingHlos`, `savingMappings`, `indicatorSearch` signals; `getHlosIndicators`, `getMappings`, `loadModalSelection`, `commitModalSelection`, `cancelModalSelection`, `updateMappingField`, `removeMapping`, `saveMappings`, and the private `materializeRows` / `deriveIndicatorType` / `composeTarget` / `inferQuantitative` helpers. Reuses `editable` computed from alignment-section.
- **Implementation notes**:
  - Implementation body verbatim per [`./design.md` §4.4.1](./design.md#441-extended--bilateralservice).
  - `saveMappings` order: **DELETE → POST → PATCH**, stops on first 409, returns `SaveMappingsResult` discriminated union with `failedKey` so the calling component can pin the inline error to the right HLO card.
  - `bodyOf()` mapper depends on OQ-IM-1 resolution. The provisional shape in design §2.1 is the placeholder.
  - `getContribution` depends on OQ-IM-3 — the FE shouldn't call it if the backend doesn't expose it (fall back to omitting edit-mode pre-fill until the route is live).
  - `materializeRows` is the single seam translating the wire shape (`BilateralHlosIndicatorsResponse`) into the FE view model (`IndicatorRow[]`). If backend later adds per-row `is_quantitative` / `disabled_reason` on `PrmsTocIndicator`, replace the derivation with direct reads — no other component touches the nested shape.
- **Tests**: ~14 cases covering signal toggles, `materializeRows` correctness (flat-list output from nested input; `is_mapped` join against persisted), `aow_status` propagation, diff correctness (added/updated/removed buckets), stop-on-409, `failedKey` propagation on 400/5xx, empty `pairs[]` → empty rows, `no_aow_mappings` row keys use empty `area_of_work`.
- **Done when**: service ≥ 90% statements; existing alignment-section + tag-visibility tests still pass.
- **Relevant skills**: `angular-developer`, `error-handling-patterns`.

---

### T-BIL-IM-05 — `HloSelectionModalComponent` shell + sidebar + table

- **Status**: `pending` *(UNGATED 2026-05-27 — was previously gated on OQ-IM-2; resolved via §8 ToC backend audit)*
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
  2. **Left sidebar** (256 wide): SPs derived from `hlosIndicators().pairs[].program` (already scoped to the result's CLARISA project mappings) → expandable AOWs from each pair's `area_of_work`. Active AOW highlighted (`Light Blue-100`); per-AOW selection-count badge bound to `hloModalSelection.size`.
  3. **Main pane**: breadcrumb (`SP > AOW`), search input (debounced 300 ms, client-side filter over `indicatorRows()`), indicator table per active pair built from `outcomes[] ∪ outputs[]` via `materializeRows` + active-pair filter; selection state (background `Light Blue-100`) reflects `hloModalSelection`.
  4. **Footer**: `Selected → N items` counter (left) + Cancel + Confirm (right).
- **Implementation notes**:
  - Imports: `CommonModule`, `FormsModule`, `InputTextModule`, `CheckboxModule`, `ButtonModule`, `BadgeModule`, `TooltipModule`, `SkeletonModule`.
  - **Data source**: the modal consumes `bilateralService.hlosIndicators()` (raw response) for the sidebar tree and `bilateralService.indicatorRows()` (derived flat view) for the main table. Never traverse `pairs[].outcomes[].indicators[]` directly in the template — go through the service.
  - **`aow_status` handling** (per design.md §4.2.2):
    - `'unmapped'` → blocking message in main pane; sidebar empty; Confirm disabled.
    - `'no_aow_mappings'` → ship the **default (a)** UX from OQ-IM-10: flat list per SP with no AOW intermediate level. Use `area_of_work === ''` as the empty-AOW token for keys. Wire it explicitly even though OQ-IM-10 is non-gating — leaves nothing to redo if BA picks (a). Track in **T-BIL-IM-16** for any refinement once BA + designer confirm.
    - `'has_aow'` → canonical SP → AOW → indicators tree.
  - Other empty states (one-liner per AC-14 / AC-05.3 / AC-05.4): pairs `[]` (cache miss); active AOW has no indicators; search returns empty in active AOW.
  - Search input syncs to `BilateralService.indicatorSearch` via a 300 ms debounced effect. Note: search is client-side (filters `indicatorRows()`); the backend endpoint doesn't accept a `search` param today.
  - **`data-testid`**: `hlo-modal-root`, `hlo-modal-sidebar`, `hlo-modal-aow-{program}-{area_of_work}`, `hlo-modal-aow-badge-{...}`, `hlo-modal-row-{program}-{area_of_work}-{indicator_id}`, `hlo-modal-row-checkbox-{...}`, `hlo-modal-row-commit-{...}`, `hlo-modal-counter`, `hlo-modal-confirm`, `hlo-modal-cancel`, `hlo-modal-empty-unmapped`, `hlo-modal-empty-no-aow`, `hlo-modal-empty-pairs`.
- **Tests**: ~12 cases — sidebar lists pairs[].program once each; AOW expand toggles; active-AOW switch updates main pane; per-row commit toggles selection + counter + AOW badge; `aow_status='unmapped'` blocks Confirm; `aow_status='no_aow_mappings'` renders flat-per-SP list with empty `area_of_work`; `pairs:[]` empty-state; search filters client-side (no fetch); 5-min cache means second-open within window shouldn't re-fetch (assert spy count = 1 unless explicit refresh).
- **Done when**: Coverage ≥ 70% on the component; manual smoke matches `32471:131617` at 1440px; `ng build` clean.
- **Relevant skills**: `angular-developer`, `frontend-design`, `ui-ux-pro-max`.

---

### T-BIL-IM-06 — Disabled-indicator row with inline reason callout

- **Status**: `pending` *(partially blocked — see below)*
- **Size**: S
- **Depends on**: T-BIL-IM-05
- **Discharges ACs**: REQ-BIL-IM-04.
- **Touches**:
  - `hlo-selection-modal.component.{html,scss,spec.ts}` *(extend)*
- **Visual references**: [`../figma-mockups/33563-138613-hlo-modal-disabled-reason.md`](../figma-mockups/33563-138613-hlo-modal-disabled-reason.md) — disabled row state with 259×26 callout `This indicator cannot be mapped to this result because <reason>`.
- **Summary**: When `IndicatorRow.disabled_reason !== null` OR (`is_stale=true && !is_mapped`), render the row greyed-out and non-interactive. Place the reason callout inline near the row.
- **Implementation notes**:
  - **2026-05-27 caveat**: per [`./open-questions-for-ba.md` §8.3 #5–6](./open-questions-for-ba.md#83-cascading-impact-on-the-fe-design), the new `GET .../hlos-indicators` endpoint returns `PrmsTocIndicator` (raw PRMS shape) — it does NOT carry `disabled_reason` or `is_stale` per row. `IndicatorRow.disabled_reason` is therefore `null` for all rows until backend mirrors the safe-bundle `disabled_reason` field onto `PrmsTocIndicator` (or a sibling enrichment wrapper). `IndicatorRow.is_stale` is computed only on persisted `HloMapping` rows (the catalog row stays `false`). **Until the bonus fields land on the HLOs endpoint, this task can ship the rendering primitive but won't trigger in production data.** Coordinate with backend before merging — confirm the planned shape.
  - Reason text MUST be in the DOM (not hover-only) so screen readers announce it — bind via `aria-describedby="reason-{indicator_id}"`.
  - Stale-but-unmapped uses the canonical stale copy: `"This indicator was retired in the upstream catalog. Existing mappings are preserved; new mappings are not accepted."` Otherwise the server-provided `disabled_reason` is used verbatim.
  - **`data-testid`**: `hlo-modal-row-disabled-{...}`, `hlo-modal-row-reason-{...}`.
- **Tests**: 4 cases — disabled row not clickable, checkbox/commit non-interactive, reason in DOM with `aria-describedby`, stale-but-unmapped uses the canonical stale copy. Use fixture rows with hand-crafted `disabled_reason` / `is_stale` values (since the live endpoint won't yet populate them).
- **Done when**: coverage ≥ 70% on the disabled-row branch; manual a11y check (keyboard focus reveals reason). Document the backend-side gap in the PR description.
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
  4. **`aow_status`-aware copy on the AI card** (per design.md §4.2.2):
     - `aow_status === 'unmapped'` → AI card body: `"This result isn't linked to a CLARISA project yet. Contact the bilateral operations team to register the project mapping before mapping HLOs."` CTA disabled.
     - `aow_status === 'no_aow_mappings'` → AI card body: `"The CLARISA project has Science Program mappings but no Area of Work breakdown. You can still pick HLOs — they'll be grouped by Science Program only."` CTA enabled.
     - `pairs.length === 0` (cache miss / upstream error) → AI card body: `"The Theory of Change catalog is temporarily unavailable. Try again in a few minutes."` CTA disabled (REQ-BIL-IM-14 spirit, adapted to the new endpoint shape).
     - `aow_status === 'has_aow'` → canonical mockup copy.
- **Implementation notes**:
  - Hook AI card `(ctaClick)` to `hloSelectionModalContextService.setContext({...})` then `allModalsService.openModal('hloSelection')`.
  - **Preload pattern**: trigger `bilateralService.getHlosIndicators(resultCode)` on alignment-form mount (not just on CTA click), so the user's first modal open avoids the upstream cache-miss latency (R-11). Reactive — fires once per resultCode, gated by an internal flag.
  - Grouping helper: pure function over `pendingMappings` that returns `{ lever, aows: { aow, mappings }[] }[]`. Add unit test for the grouping logic.
- **Tests**: 8 cases — AI card visible only when has_contribution=true + levers exist + no mappings yet; collapsed link visible when mappings exist; CTA click opens modal with the right context; HLO cards rendered grouped SP → AOW; each `aow_status` branch surfaces the right copy + CTA enabled/disabled state; preload triggers `getHlosIndicators` on mount; read-only hides the AI card + × buttons.
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

- **Status**: `completed` (2026-05-24) — see [`./execution.md`](./execution.md) for implementation notes.
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

### T-BIL-IM-16 — `no_aow_mappings` empty-state UX

- **Status**: `pending` *(non-gating — created 2026-05-27 to track OQ-IM-10)*
- **Size**: S
- **Depends on**: T-BIL-IM-05 (foundation), T-BIL-IM-10 (AI card copy)
- **Discharges ACs**: OQ-IM-10 (new — design refinement once BA + designer answer).
- **Touches**:
  - `hlo-selection-modal.component.{html,scss,spec.ts}` *(refine)*
  - `pool-funding-alignment.component.{html,spec.ts}` *(refine AI card copy if BA picks option ≠ (a))*
- **Visual references**: none yet — pending designer pass.
- **Summary**: Refine the empty-AOW UX once BA + designer answer OQ-IM-10 ([`./open-questions-for-ba.md` §4](./open-questions-for-ba.md#4-non-gating-open-questions-decide-during-design-not-blocking)). The §8 audit shows 28 of 31 TEST bilateral projects today carry `aow_status: 'no_aow_mappings'` — so this is potentially the dominant flow, not a corner case. T-BIL-IM-05 ships the **default (a)** (flat indicator list per SP with no AOW intermediate level). T-BIL-IM-16 picks up whichever variant BA picks:
  - **(a) FE default — flat list per SP**: nothing to do; close as resolved-via-default.
  - **(b) Show outcomes/outputs without AOW intermediate**: refactor the main pane to render `outcomes[] ∪ outputs[]` directly without the AOW header band; adjust selection key shape to drop `area_of_work`.
  - **(c) Block the modal with a CTA**: replace the main pane with a centered "this result's CLARISA project needs AOW mappings…" message + a link/CTA to the bilateral operations team's intake (out of FE scope to wire the CTA target — escalate).
- **Implementation notes**:
  - When BA answers, capture the canonical copy in `tasks.md` §9 and update REQ-BIL-IM (likely a new -19 acceptance criterion) before refactoring.
  - Add a telemetry dimension `aow_status` on `bilateral.hlo.modal.opened` so post-launch we can measure the production prevalence of each status value (data needed to validate the default was the right call).
- **Tests**: ~4 cases — covers the chosen variant's render + interaction.
- **Done when**: BA + designer sign-off; canonical copy in spec; visual matches the refined mockup (if (c)).
- **Relevant skills**: `angular-developer`, `frontend-design`, `ui-ux-pro-max`.

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

- **OI-IM-1 — Gating OQs (updated 2026-05-27)**. OQ-IM-1 (body shape) + OQ-IM-3 (edit-mode GET) are the remaining gates. Tracked in [`./requirements.md` §12](./requirements.md#12-assumptions--open-questions). History:
  - **2026-05-26 (early)** — FE-side audit of the backend repo grounded all three in actual code, recommended Path A for each ([`./open-questions-for-ba.md` §6](./open-questions-for-ba.md#6-backend-code-findings--2026-05-26-fe-side-audit--recommendations)).
  - **2026-05-26 (late)** — backend reply ([`../ari-backend-context/backend-response-to-fe.md`](../ari-backend-context/backend-response-to-fe.md), summary [`./open-questions-for-ba.md` §7](./open-questions-for-ba.md#7-backend-reply--2026-05-26-received)):
    - **OQ-IM-3 ACCEPTED** by backend; ~½ day to ship as part of a "safe bundle" alongside `is_quantitative` + `disabled_reason`.
    - **Bonus `is_stale` already shipped** on `IndicatorPanelIndicatorResponse:29` — but **note** (per §8 audit) this lives on a now-unused endpoint; staleness for the new flow comes from persisted `HloMapping.is_stale`.
    - **OQ-IM-1 ESCALATED TO PO** — backend won't act without PO retiring **R-BIL-031** (D5 + D12 follow automatically — single decision per the [2026-05-27 decision brief §8](../ari-backend-context/po-decision-brief-OQ-IM-1.md)). Brief ready to send; recommended decision-by 2026-06-03.
    - **OQ-IM-2 escalated to BA** at that point — overtaken by the 2026-05-27 audit (see next bullet).
    - **OQ-IM-4 reclassified as gating-once-Path-A-approved** by backend.
  - **2026-05-27 — ToC backend audit** ([`./open-questions-for-ba.md` §8](./open-questions-for-ba.md#8-toc-backend-audit--2026-05-27-received)) **RESOLVES OQ-IM-2** by switching to the already-shipped `GET .../hlos-indicators` endpoint. New non-gating **OQ-IM-10** (`no_aow_mappings` UX) tracked as T-BIL-IM-16. Backend safe-bundle fields (`is_quantitative`, `disabled_reason`) need to mirror onto `PrmsTocIndicator` — coordinate before T-BIL-IM-09 starts.
  - **Fallback**: if PO stalls on OQ-IM-1 beyond ~1 week, FE ships US3/US4 against the current polymorphic shape (Phase 1) and revisits simplification in Phase 2.
- **OI-IM-2 — `app-info-banner` shared component**. The IP Rights / Pool funding alignment info-banner pattern is now duplicated; promoting it to `src/app/shared/components/info-banner/` is a worthwhile small follow-up. Not gated by anything — could be done as a parallel cleanup any time. (Flagged after the mockup audit on 2026-05-24.)
- **OI-IM-3 — Backend sort on `pool-funding-contributor`**. The FE sends the right URL (`order-field=pool-funding-contributor`) but the backend doesn't visibly reorder rows on the `current-user=false` path. Backend team to verify the sort dispatcher includes this column. Not blocking; filter works.
- **OI-IM-4 — CGSpace / MQAP for `knowledge_product`** (D9 partial Phase 2). Out of scope for the mockup-first design; reopen if the OQ-IM-1 resolution requires per-type forms.
- **OI-IM-5 — Cross-result rules** (OQ-1440-B from the Jira US). Server-authoritative; FE mirrors via inline-error if/when the rules are documented.

---

## 10. Task ID index

| ID | Title | Size | Depends on | Gating OQ | Status |
| --- | --- | --- | --- | --- | --- |
| T-BIL-IM-RR-01 | Alignment-section mockup remediation (RR-A..I) | M | — | — | **completed** (2026-05-23 → 2026-05-24) |
| T-BIL-IM-01 | Backend verification + interfaces + 5 ApiService methods | M | — | OQ-IM-1 + OQ-IM-3 | `[~]` read slice done (2026-05-28); contribution methods still gated |
| T-BIL-IM-02 | `ModalName 'hloSelection'` + `HloSelectionModalContextService` | S | — | — | **completed** (2026-05-24) |
| T-BIL-IM-03 | `BilateralActionCardComponent` | S | — | — | **completed** (2026-05-24) |
| T-BIL-IM-04 | Extend `BilateralService` with indicator + mapping state | M | T-BIL-IM-01 | OQ-IM-1/3 | `[~]` read slice done (2026-05-28); write surface gated |
| T-BIL-IM-05 | `HloSelectionModalComponent` shell + sidebar + table | L | T-BIL-IM-02, T-BIL-IM-04 | ~~OQ-IM-2~~ ungated 2026-05-27 | pending |
| T-BIL-IM-06 | Disabled-indicator row with reason callout | S | T-BIL-IM-05 | — | pending *(partially blocked — `disabled_reason` not on new endpoint)* |
| T-BIL-IM-07 | Modal session-state + Cancel-confirm dialog | S | T-BIL-IM-05 | — | pending |
| T-BIL-IM-08 | `HloCardComponent` — header + target + reason + × | L | T-BIL-IM-04 | OQ-IM-1/3 | pending — GATED |
| T-BIL-IM-09 | Quantitative contribution row (conditional) | S | T-BIL-IM-08 | OQ-IM-1 | pending — GATED |
| T-BIL-IM-10 | Mount AI card + HLO cards into alignment tab | M | T-BIL-IM-03, T-BIL-IM-05, T-BIL-IM-08 | — | pending |
| T-BIL-IM-11 | Diff-and-batch Save (DELETE → POST → PATCH) + 409 | M | T-BIL-IM-04, T-BIL-IM-08, T-BIL-IM-10 | OQ-IM-1 | pending — GATED |
| T-BIL-IM-12 | Lever-cascade refresh effect | S | T-BIL-IM-04, T-BIL-IM-10 | — | pending |
| T-BIL-IM-13 | Telemetry events (Clarity) | S | T-BIL-IM-05, T-BIL-IM-10, T-BIL-IM-11 | — | pending |
| T-BIL-IM-14 | AR.3 regression test (mappings don't block submission) | S | — | — | **completed** (2026-05-24) |
| T-BIL-IM-15 | Constitutional docs update | S | T-BIL-IM-10, T-BIL-IM-11, T-BIL-IM-13 | — | pending |
| T-BIL-IM-16 | `no_aow_mappings` empty-state UX *(non-gating)* | S | T-BIL-IM-05, T-BIL-IM-10 | OQ-IM-10 | pending *(new — created 2026-05-27)* |

# Design — Bilateral Module / ToC Mapping v2

> Pairs with [`./requirements.md`](./requirements.md) (REQ-BIL-TM2-\*). Implements the inline per-SP ToC alignment flow against the frozen wire contract in [`./backend-handoff.md`](./backend-handoff.md) §4. Follows [`../../general-setup/design.md`](../../general-setup/design.md).

---

## 1. Architectural overview

The feature lives entirely inside the existing lazy result-detail tab `pool-funding-alignment` (no new routes). The shipped page component keeps its alignment load/save skeleton (Yes/No question, multi-select SP picker, read-only gates, websocket reconcile) and gains a list of **per-SP alignment blocks** rendered by a new child component. `BilateralService` swaps its modal/mapping state for a **ToC catalog** signal (one GET per section load) and per-SP draft helpers. The HLO selection modal, its context service, and the AI action card are deleted.

```
PoolFundingAlignmentComponent (page, OnPush)
  ├── MultiselectComponent (SP picker — unchanged)
  └── SpTocAlignmentBlockComponent ×N (one per selected SP)
        ├── RadioButton  "aligns with ToC?"          (custom-fields/radio-button)
        ├── Select       Level                        (custom-fields/select)
        ├── Select       HLO  (searchable)            (custom-fields/select)
        ├── Select       Indicator (searchable)       (custom-fields/select)
        └── Contribution panel (read-only unit/target + custom-fields/input number)

BilateralService ──ApiService──▶ ARI backend ──TocIntegrationService──▶ lambda-toc
   (signals: currentAlignment, sciencePrograms, tocCatalog)
```

Position in [`detailed-design.md`](../../../detailed-design/detailed-design.md) §2: result-detail page module + `shared/services` domain service; HTTP stays `ApiService`-only (§4).

## 2. Data model

All in [`@interfaces/bilateral/pool-funding-alignment.interface.ts`](../../../../research-indicators/src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts) unless noted. Wire shapes mirror [`./backend-handoff.md`](./backend-handoff.md) §4 **field-for-field** (same parity discipline as the previous spec).

### 2.1 New wire types (catalog read — reshaped `hlos-indicators`)

```ts
export type TocLevel = 'OUTPUT' | 'OUTCOME' | 'EOI';

export interface TocCatalogIndicator {
  indicator_id: number;
  indicator_description: string;
  unit_of_measurement: string | null;   // backend renames upstream `unit_messurament`
  type_value: string | null;            // retained for the future type filter (A-4/OQ-1)
  target_value: string | null;          // backend-resolved for target_year
  target_year: number;                  // 2026 this cycle
}

export interface TocCatalogResult {
  toc_result_id: number;
  title: string;
  description: string | null;
  aow_code: string | null;              // null for EOI (REQ-BIL-TM2-05)
  indicators: TocCatalogIndicator[];
}

export interface TocCatalogLevelGroup { level: TocLevel; toc_results: TocCatalogResult[]; }
export interface TocCatalogSp { sp_code: string; levels: TocCatalogLevelGroup[]; }

export interface BilateralTocCatalogResponse {
  result_code: string;
  mapping_status: PoolFundingMappingStatus;
  clarisa_project: PoolFundingClarisaProject | null;
  result_type: string;                  // backend-owned enum key
  allowed_levels: TocLevel[];           // [] ⇒ hide cascade (REQ-BIL-TM2-04 AC-04.3)
  version_locked: boolean;              // REQ-BIL-TM2-09
  catalogs: TocCatalogSp[];
}
```

### 2.2 Saved alignments (pre-fill read + write body)

```ts
export interface TocAlignmentSnapshot {                 // survives upstream catalog drift (AC-08.4)
  toc_result_title: string;
  aow_code: string | null;
  indicator_description: string;
  unit_of_measurement: string | null;
  target_value: string | null;
  target_year: number;
}

export interface SavedTocAlignment {
  sp_code: string;
  aligns_with_toc: boolean;
  level?: TocLevel;
  toc_result_id?: number;
  indicator_id?: number;
  quantitative_contribution?: number | null;
  snapshot?: TocAlignmentSnapshot;
  is_stale?: boolean;                                   // catalog item no longer resolvable
}

// AlignmentResponse gains:   toc_alignments?: SavedTocAlignment[]
// UpdatePoolFundingAlignmentDto gains:   toc_alignments?: TocAlignmentWriteDto[]
export interface TocAlignmentWriteDto {
  sp_code: string;
  aligns_with_toc: boolean;
  level?: TocLevel;
  toc_result_id?: number;
  indicator_id?: number;
  quantitative_contribution?: number;
}
```

> **Contract note (relay to backend):** the handoff §4 froze the catalog read + PATCH write; the `toc_alignments` **read** array on `GET …/pool-funding-alignment` (shape above, snapshot included) is the one surface added by this design — append it to `backend-handoff.md` §4 and confirm with the backend session before live-verify (T-08).

### 2.3 FE view-model (not wire)

```ts
export interface SpAlignmentDraft {
  sp_code: string;
  aligns_with_toc: boolean | null;       // per-SP Yes/No (null until answered)
  level: TocLevel | null;
  toc_result_id: number | null;
  indicator_id: number | null;
  quantitative_contribution: number | null;
}
```

`AlignmentFormData` (component-local) gains `toc_drafts: SpAlignmentDraft[]`, keyed by `sp_code`, order = SP selection order.

### 2.4 Removals

Deleted with the modal flow (REQ-BIL-TM2-10): `PrmsTocCenter`, `PrmsTocIndicatorTarget`, `PrmsTocTargetsByCenter`, `PrmsTocIndicator`, `PrmsTocResult(Category)`, `BilateralHlosAowStatus`, `BilateralHlosPair`, `BilateralHlosIndicatorsResponse`, `IndicatorType`, `IndicatorRow`, `HloMapping`, `MappingResponse`, `HloModalSelectionKey`, `HloKeyString`. No renames — old types are removed, new types added (compiler finds every consumer).

## 3. API contracts

| Method | URL | Service / Method | Request | Response | Notes |
|--------|-----|------------------|---------|----------|-------|
| GET | `v1/results/{n}/pool-funding-alignment` | `ApiService.GET_PoolFundingAlignment` | — | `MainResponse<AlignmentResponse>` (+`toc_alignments`) | pre-fill source (REQ-BIL-TM2-08) |
| GET | `v1/results/{n}/pool-funding-alignment/science-programs` | `GET_PoolFundingSciencePrograms` | — | `MainResponse<PoolFundingSciencePrograms>` | unchanged |
| GET | `v1/results/{n}/pool-funding-alignment/hlos-indicators` | `GET_PoolFundingHlosIndicators` | — | `MainResponse<BilateralTocCatalogResponse>` | **reshaped**; same path, new generic |
| PATCH | `v1/results/{n}/pool-funding-alignment` | `PATCH_PoolFundingAlignment` | `UpdatePoolFundingAlignmentDto` (+`toc_alignments`) | `MainResponse<AlignmentResponse>` | save (REQ-BIL-TM2-08) |

Error handling:

- **400** — existing `unknown_sp_codes` extractor kept; new tolerant extractor for `errors.toc_alignments: [{ sp_code, field, message }]` → routed to the matching block (AC-08.2). Non-array fallback → existing `fieldErrors` path.
- **409** — existing synced/PRMS-sourced branches kept (matched by description); new branch matched by error code/description `toc_mapping_version_locked` → refetch alignment, render version-gate notice (AC-09.1). Never retried blindly (house 409 rule).
- **5xx on catalog GET** — block-level retry affordance (REQ-BIL-TM2-11); global toast for `/pool-funding-alignment` stays suppressed as today.

## 4. Frontend architecture

### 4.1 Routes

None added/changed. The tab stays a lazy standalone child of `/result/:id` (C-6).

### 4.2 Components & directory structure

```
pages/platform/pages/result/pages/pool-funding-alignment/
├── pool-funding-alignment.component.{ts,html,scss,spec.ts}     # reworked
└── components/sp-toc-alignment-block/
    └── sp-toc-alignment-block.component.{ts,html,scss,spec.ts} # NEW

shared/components/all-modals/modals-content/hlo-selection-modal/  # DELETED
shared/components/bilateral-action-card/                          # DELETED (after grep confirms single consumer)
shared/services/cache/hlo-selection-modal-context.service.ts      # DELETED
```

**`SpTocAlignmentBlockComponent`** (standalone, OnPush, selector `app-sp-toc-alignment-block`):

- **Inputs (signal inputs):** `sp: SelectedScienceProgram`, `catalog: TocCatalogSp | null`, `allowedLevels: TocLevel[]`, `draft: SpAlignmentDraft`, `disabled: boolean`, `inlineErrors: Record<string, string> | null`, `catalogState: 'loading' | 'ready' | 'error'`.
- **Outputs:** `draftChange = output<SpAlignmentDraft>()`, `retryCatalog = output<void>()`.
- **Internal computeds:** `levelOptions` (from `allowedLevels`, labels per §4.7), `hloOptions` (from `catalog` for `draft.level`, label = `aow_code` bold prefix + title; title-only when `aow_code === null`), `indicatorOptions` (children of `draft.toc_result_id`), `selectedIndicator` (drives the contribution panel).
- Cascade resets live here: emitting a level change nulls `toc_result_id`/`indicator_id`/`quantitative_contribution`; an HLO change nulls the indicator + contribution (AC-04.4, AC-05.3). The block never mutates inputs — pure `draftChange` emissions (REQ-BIL-TM2-03 independence is structural).

**Page component changes:** render `@for (sp of formData().selected_sps; track sp.official_code)` blocks; own `toc_drafts` reconciliation on SP add/remove (add → empty draft; remove with saved/in-progress alignment → `p-confirmdialog` per D-6); extend `isDirty`/`canSave`/`onSave` to cover drafts; remove `onOpenHloSelector`, modal context, AI-card copy constants; render version-gate notice when `version_locked`.

### 4.3 State boundaries

- **Component-local (page):** `formData` incl. `toc_drafts` (form state, discarded on navigation — same as today).
- **`BilateralService` (root):** `currentAlignment`, `sciencePrograms`, new `tocCatalog: signal<BilateralTocCatalogResponse | null>`, `loadingTocCatalog`, `tocCatalogError`. Removed: `persistedMappings`, `pendingMappings`, `hloModalSelection`, `indicatorSearch`, `indicatorRows`, `savingMappings`, `materializeRows`/`materializeMappings`/`deriveIndicatorType`/`composeTarget`/`inferQuantitative`/`keyOf` and the modal session methods.
- **No new `localStorage`** persistence.

### 4.4 Services

- **`ApiService`** — paths unchanged (`bilateralPath` helper kept); `GET_PoolFundingHlosIndicators` re-typed to `BilateralTocCatalogResponse`.
- **`BilateralService`** — new `getTocCatalog(resultCode)` (mirrors `getAlignment` loading/error pattern; on non-2xx sets `tocCatalogError`, keeps prior value); pure helpers `catalogForSp(sp_code)`, `draftsFromSaved(toc_alignments)` (pre-fill seam), `writeDtoFromDrafts(drafts)` (drops incomplete drafts when `aligns_with_toc !== true`); new tolerant extractor `extractTocAlignmentErrors` beside `extractUnknownSpCodes`.
- **`AllModalsService`** — `hloSelection` modal registration removed.

### 4.5 Forms

Follow the **shipped section's pattern**: signals + `FormsModule` with wrapped custom fields (`custom-fields/select`, `custom-fields/input`, `custom-fields/radio-button`) — not raw PrimeNG, not a new `FormGroup` (D-8). Validation: per-draft completeness computed (`aligns_with_toc === true` ⇒ level + HLO + indicator + contribution ≥ 0 required, D-9/OQ-6); `canSave` requires every rendered draft valid OR untouched-No; server 400s cross-check client rules (AC-08.2).

### 4.6 Theming

Token utility classes + `var(--ac-*)` only; callout reuses the existing info-banner pattern of the page; dark/light parity inherited from tokens (REQ-BIL-TM2-NF-04). No new tokens expected.

### 4.7 Level labels (OQ-3 default)

`OUTPUT` → "High Level Output", `OUTCOME` → "Intermediate Outcome", `EOI` → "2030 Outcome". The HLO field label follows the selected level ("High Level Output\*" / "Intermediate Outcome\*" / "2030 Outcome\*"); single map in the block component, trivially revisable when BA answers OQ-3.

## 5. Security & authorization

Unchanged: `editable` computed (roles + ownership), `is_read_only`/`is_synced_to_prms` gates, `jWtInterceptor`. The backend stays authoritative for `allowed_levels`, `version_locked`, and alignment validation — the client renders, never decides (REQ-BIL-TM2-04). No token/PII changes.

## 6. Error handling

Summarized in §3; additions: per-block inline error map keyed `sp_code` (rendered inside the owning block, mirroring the `rejectedSpCodes` chip pattern); catalog `'error'` state renders an inline message + Retry button wired to `retryCatalog` → `getTocCatalog()`; stale saved alignment (`is_stale`) renders from `snapshot` with a subtle warning tag (AC-08.4) — display only, no auto-clear.

## 7. Real-time considerations

`result.pool-funding-alignment.changed` reconcile kept as-is; `isDirty` now also covers `toc_drafts`, so a remote change while editing keeps today's "refresh to see latest" toast instead of clobbering drafts. Socket-down degradation unchanged (defensive inject already in place).

## 8. Performance

- **Network:** section load = 3 GETs (alignment, science-programs, catalog) — same count as the shipped build (catalog replaces hlos-indicators 1:1). No per-dropdown requests (REQ-BIL-TM2-NF-03); search filters client-side.
- **Bundle:** net ≈ ≤ 0 — the deleted modal (+ context service + action card) offsets the new block component; everything stays in the lazy result chunk (C-5/C-6).

## 9. Accessibility (WCAG 2.1 AA, C-4)

Labeled selects (visible `label` + `for`), required-field `aria-required`, cascade selects keyboard-operable via the wrapped components, focus moves to a new block's heading on SP add, `aria-live="polite"` on catalog loading/error and on the contribution panel reveal, confirm dialog focus-trapped (PrimeNG), color never the sole stale/error signal.

## 10. Telemetry

Clarity events: keep `bilateral.alignment.viewed` / `bilateral.alignment.saved` (extend `saved` payload with `toc_alignment_count`); remove `bilateral.alignment.hlo_selector_opened` with the modal. Defensive-inject pattern unchanged. No GA/Hotjar additions.

## 11. Design decisions (decision record)

- **2026-06-09 — D-1 Inline cascade replaces the modal; modal code is deleted, not quarantined.** Alternatives: keep modal behind a flag; quarantine directory. Rationale: mockups are authoritative; git history preserves the code; a dead flag-path would rot and drag `BilateralHlosPair` types along (REQ-BIL-TM2-10).
- **2026-06-09 — D-2 Catalog stays proxied by the ARI backend** (proposal Option B). Alternatives: FE → lambda-toc direct. Rationale: house HTTP rule, server cache, single owner of the level rule, observed DNS flakiness on the lambda host.
- **2026-06-09 — D-3 Saved alignments ride the existing `GET …/pool-funding-alignment` envelope** (`toc_alignments[]` + display `snapshot`). Alternatives: separate `GET …/toc-alignments`. Rationale: one pre-fill request, atomic with `has_contribution`/`sp_codes`; snapshot makes saved data render-safe under catalog drift and is the 2027-versioning hedge. **Action: append to backend-handoff §4.**
- **2026-06-09 — D-4 Single-option Level dropdown is NOT preselected** (mockup-faithful: user opens and picks "High Level Output"). Alternatives: auto-preselect when exactly one. Rationale: matches `Pool funding alignment.png` exactly; preselect is a one-line change if UX asks later.
- **2026-06-09 — D-5 Indicators unfiltered by type in v2; `type_value` kept in the wire + state** so OQ-1's BA ruling becomes a computed-level toggle, not a contract change.
- **2026-06-09 — D-6 Deselecting an SP with a saved/in-progress alignment asks confirmation** via PrimeNG `confirmdialog` (house destructive-action pattern); silent cascade rejected (data loss without warning).
- **2026-06-09 — D-7 Fixtures-first build.** Jest fixtures in `app/testing/` mirror the frozen contract (SP01 live snapshot); a LIVE-VERIFY task gates merge on the real proxy in testing env (same discipline as the previous arc).
- **2026-06-09 — D-8 Signals + FormsModule custom fields, not a reactive `FormGroup`.** Deviates from the global "reactive forms" preference to stay consistent with the shipped page component it extends; recorded here per template rule (global doc untouched — page-level consistency wins for an in-place rework).
- **2026-06-09 — D-9 Quantitative contribution required when the per-SP answer is Yes** (OQ-6 default; flips to optional via one validator constant if BA disagrees).

## 12. Testing strategy

- **Service specs** (`bilateral.service.spec.ts`): `getTocCatalog` envelope handling (`HttpTestingController`), `draftsFromSaved` / `writeDtoFromDrafts` round-trip, `extractTocAlignmentErrors` tolerant parsing, removal of mapping-era members compiles clean.
- **Component specs:** block — cascade reset rules, level-label map, EOI label without AOW, option search, contribution validation, disabled/version-locked rendering, a11y attributes; page — N-blocks-per-N-SPs, independence (edit block A, assert block B draft unchanged), deselect-confirm flow, save body composition, per-block 400 routing, 409 version-locked, pre-fill round-trip, stale snapshot rendering.
- **Fixtures:** `app/testing/` gets `toc-catalog.fixture.ts` (SP01 OUTPUT/OUTCOME/EOI snapshot) + saved-alignment fixtures; old hlos-indicators fixtures deleted with their types.
- **Coverage:** floors in `jest.config.ts` not regressed (REQ-BIL-TM2-NF-05); deleted specs (modal) reduce both numerator and denominator — verify floors still pass.
- **Manual plan:** golden path on testing env post-integration — CapSharing result (single level), Policy result (two levels), two-SP project (independence + example values 10/25), non-2026 live version (locked), PRMS-synced result (read-only).

## 13. Risks & mitigations

- **R-1 Backend contract drift vs frozen §4.** Mitigation: DTOs mirrored field-for-field + LIVE-VERIFY task before merge; D-3 addition explicitly relayed.
- **R-2 lambda-toc instability/DNS.** Mitigation: server-side cache + warm-cache-on-failure (backend); FE block-level retry (REQ-BIL-TM2-11).
- **R-3 BA flips OQ-1/OQ-6/A-1 late.** Mitigation: D-5 toggle, D-9 single validator constant, draft model keeps N-per-SP reachable (array, not map-of-one).
- **R-4 Large deletion regressions** (modal, types, action card). Mitigation: AC-10.2 grep gates + full suite + compiler-driven removal (no renames).
- **R-5 Wednesday demo slips if backend proxy lands late.** Mitigation: fixtures-first (D-7) keeps FE progress independent; demo can fall back to fixture-backed local run.

## 14. References

[`./requirements.md`](./requirements.md) · [`./backend-handoff.md`](./backend-handoff.md) · [`./proposal.md`](./proposal.md) · mockups `../figma-mockups/_assets/Pool funding alignment*.png` · [`docs/system-design/design.md`](../../../system-design/design.md) §7–§8 · [`docs/detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §2, §4, §6 · [`research-indicators/src/CLAUDE.md`](../../../../research-indicators/src/CLAUDE.md)

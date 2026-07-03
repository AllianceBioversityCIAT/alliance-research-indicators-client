# Design — ToC Mapping: Indicator-Type Guidance

> Spec: `docs/specs/bilateral-module/toc-indicator-type-guidance/` · Pairs with [`./requirements.md`](./requirements.md) (REQ-BIL-ITG-01..06) · Depth: **Standard**
>
> Implements the approved [`./proposal.md`](./proposal.md) Phase 1 (deterministic guidance, FE-only). Parent design: [`../../archive/2026-06-17-bilateral-module--toc-mapping-v2/design.md`](../../archive/2026-06-17-bilateral-module--toc-mapping-v2/design.md) (D-5 is superseded by this spec: `type_value` moves from "retained, unused" to "consumed by guidance").

---

## 1. Architectural Overview

Everything lands inside the existing Pool Funding Alignment feature; no routes, services, or wire contracts change. A new **pure classification util** (compatibility matrix + total functions) feeds new `computed()` signals in the existing pure block component, which renders four guidance surfaces: grouped indicator options, per-option badges, HLO hint tags, and two inline notices.

```
[pool-funding-alignment.component]                       (page — owns catalog/drafts)
    │  NEW input: [resultType]="resultType()"            (from tocCatalog().result_type)
    ▼
[sp-toc-alignment-block.component]                       (pure block — all guidance UI)
    │  computeds: indicatorGroups / hloOptions(+hasTypeMatch)
    │             selectedIndicatorClassification / compatibleHloSuggestions
    ▼
[indicator-type-guidance.util.ts]                        (NEW — pure constants + functions)
      classifyIndicator(resultType, typeValue) → 'type-match'|'wildcard'|'other'|'unclassified'
      matrix / label maps (result-type labels, badge labels)
```

Data flow stays unidirectional: catalog (already loaded by `bilateral.service.ts`) → page → block inputs → pure computeds → template. The block still emits `SpAlignmentDraft` unchanged.

## 2. Data Model

- **New (FE-only, colocated with the feature — not wire types):** in `indicator-type-guidance.util.ts`:
  - `type IndicatorTypeClassification = 'type-match' | 'wildcard' | 'other' | 'unclassified'`
  - `TOC_TYPE_MATRIX: Record<string, string>` — `result_type` key → canonical `type_value` (5 rows per requirements §4 REQ-BIL-ITG-01).
  - `RESULT_TYPE_LABELS: Record<string, string>` and `TYPE_BADGE_LABELS: Record<string, string>` (canonical `type_value` → short badge label; `custom` → "Custom").
  - `classifyIndicator(resultType: string | null, typeValue: string | null): IndicatorTypeClassification` — total function, exact-string after `trim()` (AC-01.4), `_n_*`/unknown → `'unclassified'` (AC-01.3), no matrix row for `resultType` → everything `'unclassified'` (AC-05.1 path).
- **Modified (component-local view models, `sp-toc-alignment-block.component.ts`):**
  - `HloSelectOption` + `hasTypeMatch: boolean` (AC-04.1).
  - Indicator options become `IndicatorSelectOption { label; value; badge: string | null; classification: IndicatorTypeClassification }`; grouped shape `{ label: string; items: IndicatorSelectOption[] }[]` when grouping is active.
- **Wire shapes**: untouched. `TocCatalogIndicator.type_value` and `BilateralTocCatalogResponse.result_type` are already in [`pool-funding-alignment.interface.ts`](../../../../research-indicators/src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts); update their comments to point at this spec instead of "future type filter".

## 3. API Contracts

No endpoint added or modified. Fields newly *consumed*:

| Method | URL | Service / Method | Change |
|--------|-----|------------------|--------|
| GET | `v1/results/{code}/pool-funding-alignment/hlos-indicators` | `ApiService.GET_PoolFundingHlosIndicators` | none — FE starts reading `result_type` (envelope) and `type_value` (per indicator), both already delivered |
| PATCH | `v1/results/{code}/pool-funding-alignment` | existing save path | none — `TocAlignmentWriteDto` unchanged (AC-06.1) |

4xx/5xx, 409 version-lock, and retry flows are untouched.

## 4. Frontend Architecture

### 4.1 Routes — none.

### 4.2 Components

Only `sp-toc-alignment-block` changes (plus one binding in the page template):

- **Page** (`pool-funding-alignment.component.ts/.html`): add `readonly resultType = computed(() => this.tocCatalog()?.result_type ?? null)` and bind `[resultType]="resultType()"` on the block (template line ~241).
- **Block** (`sp-toc-alignment-block.component.ts/.html/.scss`), new input `resultType = input<string | null>(null)`; the block stays pure/presentational.

New derived state (all `computed()`):

| Computed | Feeds | Rule |
|---|---|---|
| `guidanceEnabled` | everything | `resultType()` has a matrix row (AC-05.1) |
| `classifiedIndicators` | groups/badges/warning | map of selected HLO's indicators → classification + badge |
| `indicatorGroupsEnabled` | `p-select [group]` | `guidanceEnabled` && ≥1 recommended (AC-02.3) |
| `indicatorSelectOptions` | dropdown | grouped `[{label: RECOMMENDED_GROUP_LABEL(type), items}, {label: 'Other indicators', items}]` (recommended = type-match then wildcard) or flat list |
| `hloOptions` | HLO dropdown | existing + `hasTypeMatch` per HLO (AC-04.1) |
| `selectedIndicatorClassification` | cross-type warning | classification of `selectedIndicator()`; warning iff `'other'` (AC-03.1/2/4 — derives from draft + catalog, so saved read-backs get it free) |
| `compatibleHloSuggestions` | no-match notice | same-level HLOs with `hasTypeMatch`, excluding selected, capped at 5 (AC-04.2) |
| `showNoTypeMatchNotice` | no-match notice | HLO selected && `guidanceEnabled` && selected HLO has 0 type-matches (AC-04.2/4/5) |

Template changes (`sp-toc-alignment-block.component.html`):

1. **HLO select**: item template appends a tag when `option.hasTypeMatch`: `<span class="sp-toc-block__type-tag">has {{ typeMatchBadgeLabel() }}</span>` (text, not color-only — NF-02).
2. **No-match notice** (between HLO and indicator fields): reuses `.sp-toc-block__notice` styling, `role="status"`, `data-testid="sp-toc-typematch-empty-{sp}"`. Body per AC-04.2/AC-04.4; each suggestion is a `<button type="button">` calling `onHloChange(suggestion.value)` (inherits cascade reset AC-04.3), disabled when `disabled()` (AC-06.3).
3. **Indicator select**: `[group]="indicatorGroupsEnabled()"`, `optionGroupLabel="label"`, `optionGroupChildren="items"`, keep `[filter]="true" filterBy="label"`; add a `pTemplate="group"` header template and extend the item template with the badge chip `@if (option.badge) { <span class="sp-toc-block__type-badge">{{ option.badge }}</span> }`.
4. **Cross-type warning** (below indicator select): `.sp-toc-block__notice--warning` variant, `role="status"`, `aria-live="polite"`, `data-testid="sp-toc-crosstype-warning-{sp}"`.

Copy constants (colocated with existing copy, NF-05):

- `RECOMMENDED_GROUP_LABEL(typeLabel)` → `Recommended for ${typeLabel}`
- `OTHER_GROUP_LABEL` → `Other indicators`
- `CROSS_TYPE_WARNING(indTypeLabel, resTypeLabel)` → `This indicator is typed “${indTypeLabel}”; this result is “${resTypeLabel}”. Confirm the contribution belongs here.`
- `NO_TYPE_MATCH_INTRO(resTypeLabel, levelLabel)` → `None of this result’s indicators are typed for ${resTypeLabel}. ${levelLabel}s with matching indicators:`
- `NO_TYPE_MATCH_ANYWHERE(resTypeLabel, levelLabel)` → `No ${levelLabel} in this Science Program has indicators typed for ${resTypeLabel}. You can select the closest indicator — it will be marked with a type notice.`

### 4.3 State boundaries

All new state is component-local `computed()` off existing inputs/signals. Nothing enters `cache.service.ts`, `localStorage`, or the URL. `bilateral.service.ts` is untouched (the page already exposes the catalog envelope).

### 4.4 Services — none new; `ApiService` untouched.

### 4.5 Forms

No reactive-form change. Raw `p-select` usage is retained per parent decision D-8a (in-memory cascade options can't use the wrapped `custom-fields/*`); grouping/badges are select templates, not new controls.

### 4.6 Theming

- `.sp-toc-block__type-badge` (indicator options) and `.sp-toc-block__type-tag` (HLO options): small neutral chips using existing color tokens (`--ac-*`) / utility text classes; verify dark-mode parity alongside the existing `.sp-toc-select-panel` styles.
- `.sp-toc-block__notice--warning`: amber-toned variant of the existing notice, icon + text (color never the sole signal, matching the scss's stated rule).

## 5. Security & Authorization

No role changes. Guidance renders wherever the cascade renders; `disabled`/`version_locked` keep their existing gating, and suggestion buttons respect `disabled()` (AC-06.3). Backend remains authoritative — guidance is advisory UX only.

## 6. Error Handling

No new error paths. Classification helpers are total functions (AC-05.3) — malformed/unknown `type_value` degrades to `'unclassified'`, never throws, never surfaces an error UI. Catalog loading/error/retry states are untouched and short-circuit all guidance (it derives from the same catalog signal).

## 7. Real-Time Considerations — none (no WebSocket involvement).

## 8. Performance

- Zero additional HTTP requests (NF-01); all guidance derives from the already-cached catalog.
- Classification runs inside `computed()` chains; worst observed catalog ≈ 90 indicators/SP ⇒ trivially < 5 ms per recompute (unit-asserted on the fixture).
- Bundle: constants + template additions only, no new dependencies; ≤ 5 KB gzipped (NF-03).

## 9. Accessibility

- Group headers: PrimeNG's grouped-select semantics announce group labels; header template is text-only.
- Badges/tags are visible text inside the option label span (screen readers read them naturally; no color-only meaning).
- Both notices: `role="status"` + `aria-live="polite"`; the warning is polite (non-modal, non-blocking).
- HLO suggestion buttons: native `<button>`, keyboard-operable, visible focus (inherit platform focus styles).

## 10. Telemetry

None added (requirements §9). The Phase-2 AI gate is measured offline by joining saved `indicator_id` against catalog `type_value` (proposal OQ-A — backend/reporting concern).

## 11. Design Decisions (Decision Record)

- **2026-07-02 — D-ITG-1: Native PrimeNG select grouping.** Decision: use `p-select` `[group]` + group/item templates. Alternatives: custom overlay list; two stacked selects. Rationale: keeps D-8a raw-select approach, search + keyboard + a11y for free; verify group+filter interplay in tests (see R-2 below).
- **2026-07-02 — D-ITG-2: Classification lives in a colocated pure util, not a service.** Alternatives: method on `bilateral.service.ts`; shared `utils/`. Rationale: feature-scoped like the block itself, pure functions are trivially unit-testable, no DI needed; promote to shared only when a second consumer exists.
- **2026-07-02 — D-ITG-3: `resultType` enters the block as an input.** Alternative: block injects `BilateralService`. Rationale: preserves the parent's T-BIL-TM2-03 pure-block boundary (page owns service access).
- **2026-07-02 — D-ITG-4: HLO hint/no-match logic counts exact `type-match` only; `wildcard` (custom) counts for the Recommended group but not for hints.** Rationale: custom indicators exist on most HLOs — counting them would light every option and dilute the discovery signal (approved in Phase-1 requirements review).
- **2026-07-02 — D-ITG-5: Flat-list fallback when no recommended options exist** (AC-02.3) instead of an empty "Recommended" header or an "Other"-only group. Rationale: identical to today's baseline ⇒ zero regression risk for unmatched HLOs; the no-match notice already explains why.
- **2026-07-02 — D-ITG-6: Exact-string matrix matching (trim only, case-sensitive).** Alternative: normalized/fuzzy matching. Rationale: upstream values are machine-written enum-ish strings; fuzziness hides upstream renames — fixture tests act as the canary instead (AC-01.4).
- **Supersedes parent D-5** (toc-mapping-v2 design §11): indicator dropdown is now grouped/badged though still unfiltered; recorded here, parent spec is archived (no edit needed there).

## 12. Testing Strategy

- **Unit (new)**: `indicator-type-guidance.util.spec.ts` — full matrix table test (5 result types × {match, custom, other-canonical, null, `_n_*`, unknown string, cased variant}), totality (never throws), `oicr`/`unknown`/missing result type ⇒ all `'unclassified'`.
- **Component (extend `sp-toc-alignment-block.component.spec.ts`)**: grouped vs flat rendering (AC-02.1/02.3), option-count parity (AC-02.5), badge presence/absence (AC-02.2), cross-type warning on select + on saved-draft re-open + absence for wildcard/unclassified (AC-03.x), HLO tag (AC-04.1), no-match notice with suggestions / anywhere-empty variant / suggestion click resets downstream (AC-04.2–4.5), guidance fully suppressed for `resultType: 'oicr'|'unknown'|null` (AC-05.1), disabled state (AC-06.3).
- **Fixture**: extend `src/app/testing/toc-catalog.fixture.ts` with a trained-people-typed indicator and an `_n_*`/null-typed indicator so every classification is representable (it already has knowledge-product / custom / innovation types).
- **Coverage**: net-positive (new pure util ~100%); must not regress floors in [`../../../detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §10.
- **Manual golden path**: capacity-sharing result on the testing deploy — mixed HLO (groups + badges), incompatible HLO (notice + suggestion click), cross-type save (warning, save succeeds), locked/read-only render.

## 13. Risks & Mitigations

- **R-1 Upstream `type_value` renames silently demote guidance.** Mitigation: exact-match by design + matrix unit tests as canary + neutral degradation (never an error); OQ-2 check against production lambda before release.
- **R-2 PrimeNG `p-select` group+filter quirks** (group headers of emptied groups, keyboard nav across groups). Mitigation: dedicated component tests; if native filter mishandles groups, provide a custom filter callback in the same task (contained in the block).
- **R-3 Long labels + badge crowding in the overlay** (labels already wrap via `whitespace-normal break-words`). Mitigation: badge as block-level chip below the label on narrow widths; reuse the parent spec's capped overlay width work.
- **R-4 BA overrules matrix strings after ship (OQ-1).** Mitigation: matrix is one constant file; a string change is a one-line diff + fixture update.

## 14. References

- [`./requirements.md`](./requirements.md) · [`./proposal.md`](./proposal.md)
- Parent: [`../../archive/2026-06-17-bilateral-module--toc-mapping-v2/design.md`](../../archive/2026-06-17-bilateral-module--toc-mapping-v2/design.md) (D-2, D-5, D-8a, D-10), [`…/backend-handoff.md`](../../archive/2026-06-17-bilateral-module--toc-mapping-v2/backend-handoff.md) §4.
- Code: `sp-toc-alignment-block.component.{ts,html,scss}`, `pool-funding-alignment.component.{ts,html}`, `interfaces/bilateral/pool-funding-alignment.interface.ts`, `testing/toc-catalog.fixture.ts`.
- Backend rule source (read-only): `alliance-research-indicators-main` → `bilateral/utils/toc-level-rules.util.ts`.
- [`../../../prd.md`](../../../prd.md) §8.3; [`../../../system-design/design.md`](../../../system-design/design.md); [`../../../detailed-design/detailed-design.md`](../../../detailed-design/detailed-design.md) §10.

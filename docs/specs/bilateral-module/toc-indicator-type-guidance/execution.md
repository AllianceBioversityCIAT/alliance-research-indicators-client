# Execution Log — ToC Mapping: Indicator-Type Guidance

## 1. Document Control

| Field | Value |
| --- | --- |
| Spec path | `bilateral-module/toc-indicator-type-guidance` |
| Branch | `AC-1594-bilateral-module` |
| Triad | JCSPECS Leader → Implementer → Reviewer (`.agents/`) |
| Started | 2026-07-02 |
| Spec docs commit | `5b1f5dd0` |

## 2. Task Execution History

### T-BIL-ITG-01 — Classification util: matrix, labels, `classifyIndicator()` — ✅ PASS (attempt 1) — 2026-07-02

- **Attempts**: 1 Implementer run, 1 Reviewer run.
- **Files changed** (2 new, nothing else touched):
  - `research-indicators/src/app/pages/platform/pages/result/pages/pool-funding-alignment/utils/indicator-type-guidance.util.ts`
  - `…/utils/indicator-type-guidance.util.spec.ts`
- **Implementer verification**: `npm run test -- indicator-type-guidance` → PASS, 141/141 tests, util coverage 100/100/100/100; `npm run lint` → clean. (Scoped run prints repo-wide coverage-threshold warnings — expected artifact of single-suite filtering.)
- **Reviewer verdict**: `STATUS: PASS` — matrix/label/badge strings match requirements §4 character-for-character; classification satisfies AC-01.1–01.4 + AC-05.3 (total, never-throws; `_n_*`/cased/unknown never `other`; unmatrixed result types always `unclassified`); table-driven spec pins exact strings as the D-ITG-6 canary; Reviewer independently re-ran tests + scoped lint; no scope creep, no Angular imports.
- **Requirements covered**: REQ-BIL-ITG-01 (AC-01.1, AC-01.2, AC-01.3, AC-01.4), AC-05.3.
- **Decisions made**:
  - Param types widened to `string | null | undefined` (safe superset of design §2's `string | null`, serves totality).
  - `custom` is trimmed before the wildcard check and gated behind matrix-row existence (unmatrixed result types get `unclassified` even for `custom`).
  - Matrix-row lookup via `Object.hasOwn` so prototype-chain keys (`toString`, `__proto__`) can't false-positive — dedicated test.
  - Canonical value set derived from `TOC_TYPE_MATRIX` (single source of truth) so `other` is only reachable for genuine canonical values.
- **Issues encountered**: none.
- **Final verification**: tests + lint green (Implementer) and independently reproduced by Reviewer.

### T-BIL-ITG-02 — Fixture: full classification coverage — ✅ PASS (attempt 1) — 2026-07-02

- **Attempts**: 1 Implementer run, 1 Reviewer run.
- **Files changed** (1, append-only: 106 insertions / 0 deletions):
  - `research-indicators/src/app/testing/toc-catalog.fixture.ts`
- **What was added**: `SP01_OUTPUT_GUIDANCE_TOC_RESULTS_FIXTURE` — HLO **7201** "Grow shared skills" (mixed: 7301 trained-people type-match + 7302 knowledge-products other + 7303 custom wildcard) and HLO **7202** "Track partner engagement" (unclassified-only: 7304 `type_value: null` + 7305 `_n_*` free text); `TOC_CATALOG_CAPSHARING_GUIDANCE_FIXTURE` (`result_type: 'capacity_sharing'`, `allowed_levels: ['OUTPUT']`) composing frozen arrays via spread — SP01 OUTPUT = 22 existing + 2 new HLOs (24 total), SP03 OUTPUT = existing array (zero trained-people anywhere ⇒ AC-04.4 "anywhere-empty" state).
- **Implementer verification**: full `npm run test` → 5890/5891 pass; single failure `multiselect.component.spec.ts:426` proven PRE-EXISTING via stash control on clean HEAD `d04802f9` (does not consume the fixture); `npm run lint` clean.
- **Reviewer verdict**: `STATUS: PASS` — append-only confirmed (all existing constants byte-identical), ids collision-free, matrix string byte-exact vs `TOC_TYPE_MATRIX.capacity_sharing`, states (a)/(b)/(c) genuinely representable, full `TocCatalogIndicator`/`BilateralTocCatalogResponse` conformance; Reviewer independently reproduced the pre-existing multiselect failure on clean HEAD and re-ran fixture-consumer suites (4 suites / 305 tests green).
- **Requirements covered**: enabler for AC-02.*, AC-03.*, AC-04.* (component-test states for T-03..05).
- **Decisions made**: did NOT append into `SP01_OUTPUT_TOC_RESULTS_FIXTURE` / `TOC_CATALOG_CAPSHARING_FIXTURE` (consumers hard-assert counts/identity); new composed catalog instead. **T-03..05 must use `TOC_CATALOG_CAPSHARING_GUIDANCE_FIXTURE`** (its SP01 OUTPUT has 24 HLOs, not 22).
- **Issues encountered**: pre-existing, unrelated `multiselect.component.spec.ts:426` failure on the branch (also fails on clean HEAD) — out of scope; flagged for the T-06 sweep.
- **Final verification**: fixture-consumer suites 305/305 green; lint clean.

### T-BIL-ITG-03 — Grouped + badged indicator dropdown, `resultType` wiring — ✅ PASS (attempt 1) — 2026-07-02

- **Attempts**: 1 Implementer run, 1 Reviewer run.
- **Files changed** (8): block `.ts/.html/.scss/.spec.ts`, page `.ts/.html/.spec.ts`, `pool-funding-alignment.interface.ts` (comment-only).
- **What was added**: `resultType` signal input (D-ITG-3, block stays pure); `IndicatorSelectOption {label, value, badge, classification}` view-model; computeds `guidanceEnabled` (`Object.hasOwn(TOC_TYPE_MATRIX, …)`), `classifiedIndicators`, `indicatorGroupsEnabled`, `indicatorSelectOptions` (Recommended = type-matches then wildcards; Other = other + unclassified in catalog order; empty Other dropped; flat fallback otherwise); `recommendedGroupLabel` computed + `OTHER_GROUP_LABEL`; template `[group]` + `pTemplate="group"` text header + badge chip in item template; scss `__type-badge`/`__group-label` token-only (`--ac-grey-*`, defined for light+dark in `src/styles/colors.scss`); page `resultType` computed + binding.
- **Implementer verification**: `npm run test -- sp-toc-alignment-block pool-funding-alignment indicator-type-guidance` → 3 suites / 264 tests pass; `npm run lint` clean; scoped stylelint clean (repo-wide `s-lint` has 350 pre-existing errors in untouched files, reproduced on clean HEAD via stash control).
- **Reviewer verdict**: `STATUS: PASS` — AC-02.1..02.5 + AC-05.1/05.2 each discharged by non-vacuous tests; independently reproduced 264/264 + lint + scoped stylelint; no T-04/T-05 scope leak (grep); interface diff comment-only; strict TS held.
- **Requirements covered**: REQ-BIL-ITG-02 (AC-02.1..02.5), AC-05.1, AC-05.2.
- **Decisions made**:
  - **R-2 resolved: native PrimeNG 19 group+filter works — no custom filter fallback.** Verified in PrimeNG source (`visibleOptions()` filters group children and drops emptied groups) and via overlay-DOM tests through the template-bound `onFilterInputChange` handler (3 states: Recommended-only, Other-only, no-match ⇒ zero orphaned headers).
  - Old `indicatorOptions` kept as documented back-compat alias of `classifiedIndicators` (same objects; `{label, value}` preserved) ⇒ AC-06.2 with **zero** existing assertions modified.
  - Badges render whenever guidance is enabled, including flat-fallback lists (AC-02.2 not conditioned on grouping); suppressed wholesale for unmatrixed result types.
  - jsdom harness notes (documented inline in spec): describe-scoped `window.matchMedia` stub (PrimeNG Overlay probes it); filter tests invoke `onFilterInputChange` directly (synthetic `input` doesn't reach the zone-bound listener) and avoid `flush()` between filter and assert (ngModel's deferred `writeValue(null)` → `resetFilter()` artifact).
- **Issues encountered**: none blocking. Reviewer minor note for T-06: add `afterAll` restore for the `matchMedia` stub (harmless in jsdom today). Manual overlay-width/wrapping check with badges deferred to the T-06 live golden path (as planned).
- **Final verification**: 264/264 scoped tests, lint clean, scoped stylelint clean (independently reproduced by Reviewer).

### T-BIL-ITG-04 — Cross-type selection warning — ✅ PASS (attempt 1) — 2026-07-02

- **Attempts**: 1 Implementer run, 1 Reviewer run.
- **Files changed** (4, additive 175+/0−): block `.ts/.html/.scss/.spec.ts`.
- **What was added**: `CROSS_TYPE_WARNING(indTypeLabel, resTypeLabel)` copy (design §4.2 exact wording); computeds `selectedIndicatorClassification` (null when unselected or saved id unresolvable ⇒ AC-03.4 stale path) and `crossTypeWarningMessage` (non-null iff `guidanceEnabled()` && `'other'`); notice below the indicator select with `role="status"`, `aria-live="polite"`, icon `aria-hidden`, `data-testid="sp-toc-crosstype-warning-<sp>"`; scss `__notice--warning`.
- **Implementer verification**: `npm run test -- sp-toc-alignment-block indicator-type-guidance` → 191/191 (+8 nuevos); lint clean; scoped stylelint clean.
- **Reviewer verdict**: `STATUS: PASS` — AC-03.1..03.4 discharged; copy character-identical to design; provably non-blocking (panel + emit tested under the warning); purely additive diff; no T-05 scope leak; evidence independently reproduced.
- **Requirements covered**: REQ-BIL-ITG-03 (AC-03.1..03.4).
- **Decisions made**:
  - Indicator-side label in the copy = canonical `type_value` (trimmed, unambiguous upstream name); result side = `RESULT_TYPE_LABELS` (Leader decision, documented in code).
  - **Warning token: `--ac-orange-1`** (only amber token; defined light `#f58220` / dark `#ff9d56`). Contrast decision: amber tints border + icon only; body text stays `--ac-grey-800` because amber-on-white ≈ 2.5:1 fails AA for text (NF-02) — commented in scss.
  - `guidanceEnabled()` checked explicitly in the warning computed (belt-and-braces; `'other'` is unreachable for unmatrixed types anyway).
- **Issues encountered**: none.
- **Final verification**: 191/191 scoped tests, lint + scoped stylelint clean (independently reproduced by Reviewer).

### T-BIL-ITG-05 — HLO hints + no-match guidance notice — ✅ PASS (attempt 1) — 2026-07-02

- **Attempts**: 1 Implementer run, 1 Reviewer run.
- **Files changed** (4, 452+/4−): block `.ts/.html/.scss/.spec.ts`.
- **What was added**: `HloSelectOption.hasTypeMatch` (exact `'type-match'` only, D-ITG-4 — wildcards never count; false-everywhere when guidance disabled); `typeMatchTagLabel`, `compatibleHloSuggestions` (same-level, catalog order, selected excluded, cap 5), `showNoTypeMatchNotice`, `noTypeMatchNoticeMessage`; copy `NO_TYPE_MATCH_INTRO`/`NO_TYPE_MATCH_ANYWHERE` (byte-exact vs design §4.2 incl. ’/—); tag "has Trained people" in the HLO item template (selectedItem clean); notice between HLO and indicator fields (`role="status"`, `data-testid="sp-toc-typematch-empty-<sp>"`) with native suggestion `<button type="button">` (`AOW — title`) routed through the existing `onHloChange` (cascade reset AC-04.3), `[disabled]="disabled()"` (AC-06.3); scss `__type-tag` + `__suggestion` (token-only, `:focus-visible` sin suprimir el outline).
- **Implementer verification**: `npm run test -- sp-toc-alignment-block indicator-type-guidance pool-funding-alignment` → 285/285 (13 nuevos); lint clean; scoped stylelint clean.
- **Reviewer verdict**: `STATUS: PASS` — AC-04.1..04.5 + AC-06.3 slice discharged; copy byte-for-byte vs design; D-ITG-4 verified against real custom-only fixture HLOs; single existing-assertion change is the sanctioned AC-06.2 literal-shape carve-out; evidence independently reproduced.
- **Requirements covered**: REQ-BIL-ITG-04 (AC-04.1..04.5), AC-06.3 (suggestion buttons).
- **Decisions made**:
  - Cap-of-5 test uses a minimal inline catalog (HLOs 8100–8107) — the shared fixture yields only 2 type-match HLOs at SP01 OUTPUT (5186, 7201).
  - Zero-indicator selected HLOs also trigger the notice (zero type-matches trivially) — no special-casing.
  - Unresolvable saved `toc_result_id` ⇒ no notice (consistent with T-04 stale path; tested).
  - Computed named `typeMatchTagLabel` (design's `typeMatchBadgeLabel` was illustrative).
- **Issues encountered**: none. T-06 note extended: the `matchMedia` beforeAll stub is now duplicated in two describes — add `afterAll` restores in the sweep.
- **Final verification**: 285/285 scoped tests, lint + scoped stylelint clean (independently reproduced by Reviewer).

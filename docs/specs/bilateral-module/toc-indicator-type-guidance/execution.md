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

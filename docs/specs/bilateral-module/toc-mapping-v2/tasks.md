# Tasks — Bilateral Module / ToC Mapping v2

> Execution units for [`./requirements.md`](./requirements.md) (REQ-BIL-TM2-\*) + [`./design.md`](./design.md). Follows [`../../general-setup/task.md`](../../general-setup/task.md). Executed via `/sdd-execute` with the [`.agents/`](../../../../.agents/) triad.

---

## 1. Goal

Ship the inline per-SP ToC alignment flow (Level → HLO → Indicator → contribution) against the frozen lambda-toc proxy contract, delete the modal-era surface, and live-verify on testing env in time for the Wednesday (2026-06-11) demo.

## 2. Pre-flight checklist

- [ ] `requirements.md` + `design.md` approved (done 2026-06-09).
- [ ] [`./backend-handoff.md`](./backend-handoff.md) §4 includes the `toc_alignments[]` **read** shape (design D-3) and has been relayed to the backend session.
- [ ] Backend proxy status checked: which of the §4 surfaces are already deployable to testing (drives whether T-06 can start).
- [ ] No conflicting in-flight spec under `docs/specs/bilateral-module/` (the superseded `indicator-mapping/` + `hlo-grouped-mapping/` are awaiting archive — T-07).
- [ ] Path aliases unchanged (`@interfaces`, `@services`, `@shared` already declared).

## 3. Dependency graph

```
T-BIL-TM2-01 (wire DTOs + fixtures, no deps)
    ├─▶ T-BIL-TM2-02 (BilateralService / ApiService refit)
    │        └─▶ T-BIL-TM2-04 (page rework: blocks, save, pre-fill, gates)
    └─▶ T-BIL-TM2-03 (SpTocAlignmentBlockComponent)
             └─▶ T-BIL-TM2-04
T-BIL-TM2-04 ──▶ T-BIL-TM2-05 (retire modal flow + old types)
T-BIL-TM2-04 ──▶ T-BIL-TM2-06 (LIVE-VERIFY on testing + demo prep)   [also gated on backend deploy]
T-BIL-TM2-05 ──▶ T-BIL-TM2-07 (archive superseded specs + docs sync)
```

Critical path for Wednesday: T-01 → T-02/T-03 → T-04 → T-06. T-05/T-07 can land after the demo.

## 4. Tasks

---

### T-BIL-TM2-01 — *Wire DTOs + shared fixtures*

- **Status**: `completed` — PASS attempt 1, 2026-06-09 (see [`./execution.md`](./execution.md))
- **Size**: S
- **Depends on**: none
- **Discharges ACs**: none directly (foundation for all)
- **Design refs**: design §2.1–§2.3
- **Touches**:
  - `src/app/shared/interfaces/bilateral/pool-funding-alignment.interface.ts`
  - `src/app/testing/toc-catalog.fixture.ts` (new)
- **Summary**: Add the new wire types (`TocLevel`, `TocCatalogIndicator/Result/LevelGroup/Sp`, `BilateralTocCatalogResponse`, `TocAlignmentSnapshot`, `SavedTocAlignment`, `TocAlignmentWriteDto`, `SpAlignmentDraft`) and extend `AlignmentResponse` (`toc_alignments?`) + `UpdatePoolFundingAlignmentDto` (`toc_alignments?`). Old modal-era types stay for now (deleted in T-05). Build fixtures from the SP01 live snapshot: OUTPUT (22 results incl. the 5-indicator `HLO1.AOW1.IO1`), OUTCOME, EOI (`aow_code: null`), plus saved-alignment and version-locked variants.
- **Implementation notes**: mirror [`./backend-handoff.md`](./backend-handoff.md) §4 field-for-field — no invented optionality; fixtures are the single source for T-02/T-03/T-04 specs (no per-file re-mocks).
- **Tests to add/update**: none (types + fixtures compile under `strict`).
- **Done when**: `npm run lint` + `npm run build` clean; fixtures exported from `src/app/testing/`.
- **Skills**: `angular-developer`

---

### T-BIL-TM2-02 — *BilateralService / ApiService refit (catalog read + draft seams + error extractor)*

- **Status**: `completed` — PASS attempt 1, 2026-06-09 (see [`./execution.md`](./execution.md))
- **Size**: M
- **Depends on**: T-BIL-TM2-01
- **Discharges ACs**: AC-08.2 (extractor), AC-11.1/AC-11.2 (state machine), groundwork for AC-04.x/AC-08.x
- **Design refs**: design §3, §4.4
- **Touches**:
  - `src/app/shared/services/api.service.ts` (re-type `GET_PoolFundingHlosIndicators` → `BilateralTocCatalogResponse`)
  - `src/app/shared/services/bilateral.service.ts` (+ spec)
- **Summary**: Add `tocCatalog`/`loadingTocCatalog`/`tocCatalogError` signals + `getTocCatalog(resultCode)` (keep-prior-value-on-error, mirrors `getAlignment` pattern); pure helpers `catalogForSp`, `draftsFromSaved`, `writeDtoFromDrafts` (drops cascade fields when `aligns_with_toc !== true`, omits incomplete drafts per D-9); tolerant `extractTocAlignmentErrors` beside `extractUnknownSpCodes`. Do **not** remove modal-era members yet (T-05) — the service must compile with both surfaces during the transition.
- **Tests to add/update**: `bilateral.service.spec.ts` — catalog happy path + 5xx (`HttpTestingController`, `MainResponse<T>` envelope), `draftsFromSaved`/`writeDtoFromDrafts` round-trip incl. `aligns_with_toc: false` and incomplete drafts, extractor with array / stringified / malformed payloads.
- **Done when**: listed ACs' service-side behavior covered; `npm run lint` + `npm run test` green; coverage floors hold.
- **Skills**: `angular-developer` · `error-handling-patterns`

---

### T-BIL-TM2-03 — *`SpTocAlignmentBlockComponent` (pure per-SP block)*

- **Status**: `completed` — PASS attempt 1, 2026-06-10 (see [`./execution.md`](./execution.md))
- **Size**: L
- **Depends on**: T-BIL-TM2-01
- **Discharges ACs**: AC-03.2, AC-04.1/04.2/04.4, AC-05.1–05.4, AC-06.1/06.2, AC-07.1–07.3, block-level parts of AC-09.1 + AC-11.1/11.2
- **Design refs**: design §4.2 (inputs/outputs/computeds), §4.5–§4.7, §9
- **Touches**:
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/components/sp-toc-alignment-block/` (new: ts/html/scss/spec)
- **Summary**: Standalone OnPush block: per-SP Yes/No radio, Level select (options from `allowedLevels`, label map §4.7, **no preselect** per D-4), searchable HLO select (AOW-prefixed labels; title-only when `aow_code === null`; per-pair empty state), searchable Indicator select (unfiltered, D-5), contribution panel (callout with 2026 wording per AC-07.3, read-only unit/target, numeric ≥ 0 input). Pure `draftChange` emissions with internal cascade resets; `disabled`/`catalogState` rendering incl. retry emit.
- **Implementation notes**: wrapped fields only (`custom-fields/select`, `/input`, `/radio-button`); tokens only (no hex); a11y per design §9 (labels, `aria-required`, `aria-live` on async states).
- **Tests to add/update**: `sp-toc-alignment-block.component.spec.ts` — every discharged AC, cascade resets, single-option Level not preselected, EOI labels, search filtering, validation states, disabled/version-locked, retry output.
- **Done when**: all listed ACs pass in spec; lint + test green; both light/dark render via tokens (no mode branching in code).
- **Skills**: `angular-developer` · `ui-ux-pro-max` (fallback `frontend-design`)

---

### T-BIL-TM2-04 — *Page rework: blocks, drafts, save, pre-fill, gates*

- **Status**: `completed` — PASS attempt 1, 2026-06-10 (see [`./execution.md`](./execution.md))
- **Size**: L
- **Depends on**: T-BIL-TM2-02, T-BIL-TM2-03
- **Discharges ACs**: AC-01.1/01.2, AC-02.1–02.3, AC-03.1, AC-04.3, AC-08.1–08.4, AC-09.1/09.2
- **Design refs**: design §4.2 (page changes), §3 (errors), §6, §7
- **Touches**:
  - `src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.{ts,html,scss,spec.ts}`
- **Summary**: Extend `AlignmentFormData` with `toc_drafts`; render one block per selected SP (`track official_code`); reconcile drafts on SP add/remove with `p-confirmdialog` on destructive deselect (D-6); fetch catalog after eligible alignment load; seed drafts via `draftsFromSaved` (pre-fill); extend `isDirty`/`canSave`/`onSave` (body via `writeDtoFromDrafts`); route per-block 400s by `sp_code`; add `toc_mapping_version_locked` 409 branch + `version_locked` notice; render stale snapshots; remove the AI-card section + `onOpenHloSelector` usage from the template/page (component deletion itself is T-05); extend Clarity `saved` payload with `toc_alignment_count`.
- **Tests to add/update**: `pool-funding-alignment.component.spec.ts` — N SPs ⇒ N blocks, independence (edit A, assert B untouched — the SP01/SP03 10/25 scenario), deselect-confirm, save body shape, pre-fill round-trip, per-block 400 routing, version-locked 409 + flag, regression of carried gates (synced/PRMS-sourced/permission, `unknown_sp_codes`).
- **Done when**: all listed ACs pass; lint + full `npm run test` green; manual smoke with fixtures (CapSharing single-level + two-SP independence).
- **Skills**: `angular-developer` · `ui-ux-pro-max`

---

### T-BIL-TM2-05 — *Retire the modal flow (deletions + grep gates)*

- **Status**: `completed` — PASS attempt 1, 2026-06-10 (see [`./execution.md`](./execution.md))
- **Size**: M
- **Depends on**: T-BIL-TM2-04
- **Discharges ACs**: AC-10.1, AC-10.2
- **Design refs**: design §2.4, §4.2–§4.4, D-1
- **Touches** (deletions):
  - `src/app/shared/components/all-modals/modals-content/hlo-selection-modal/`
  - `src/app/shared/services/cache/hlo-selection-modal-context.service.ts`
  - `src/app/shared/components/bilateral-action-card/` (only after grep confirms the alignment page was its sole consumer)
  - `all-modals` host registration + `AllModalsService` `hloSelection` entry
  - modal-era types in `pool-funding-alignment.interface.ts` (§2.4 list) + modal-era members/helpers in `bilateral.service.ts` + obsolete fixtures/specs
- **Summary**: Compiler-driven removal of the entire modal-era surface. No quarantine (D-1).
- **Done when**: AC-10.2 grep gates pass — `grep -rE "aow_status|no_aow_mappings|BilateralHlosPair|HloSelectionModal|hloSelection|areaOfWork" research-indicators/src/` returns nothing; full suite green; coverage floors still pass after spec deletions; `npm run build` budgets clean (expect net bundle reduction).
- **Skills**: `angular-developer`

---

### T-BIL-TM2-06 — *LIVE-VERIFY on testing env + demo prep*

- **Status**: `pending`
- **Size**: S
- **Depends on**: T-BIL-TM2-04 · backend proxy deployed to testing
- **Discharges ACs**: re-runs AC-04.1/04.2, AC-05.1, AC-07.1, AC-08.1, AC-09.1 against live data
- **Design refs**: design §12 (manual plan), §13 R-1/R-5, D-7
- **Touches**: no production code expected; fixture/DTO corrections if the live envelope deviates
- **Summary**: Point the local build at testing env and verify the frozen contract end-to-end: catalog shape (incl. D-3 `toc_alignments` read), CapSharing single-level, Policy two-level, two-SP independence (10/25), non-2026 lock, PRMS-synced read-only. Any deviation → fix DTO/fixture + log the delta in `design.md` §11 and relay to backend.
- **Done when**: manual plan executed and logged in `execution.md`; deviations resolved or ticketed; demo script for Fabio noted (fixture-backed fallback if backend slips — R-5).
- **Skills**: `systematic-debugging` · `verify` (project run skill)

---

### T-BIL-TM2-07 — *Archive superseded specs + docs sync*

- **Status**: `pending`
- **Size**: S
- **Depends on**: T-BIL-TM2-05
- **Discharges ACs**: none (constitutional hygiene)
- **Design refs**: proposal §7 (archive disposition)
- **Touches**:
  - `docs/specs/bilateral-module/indicator-mapping/` + `hlo-grouped-mapping/` → `docs/specs/archive/` (via `/sdd-archive`, with pointers to this spec)
  - `docs/specs/bilateral-module/figma-mockups/README.md` (register the four `Pool funding alignment*.png` assets as the current canon; mark superseded nodes)
  - `docs/detailed-design/detailed-design.md` (ToC catalog source note, if the AOW flow is mentioned)
- **Summary**: Close the loop: archive the superseded specs, make the new mockups the documented canon, sync the detailed design.
- **Done when**: archive folders exist with pointers; no active spec references the AOW model as current; links resolve.
- **Skills**: `sdd-archive`

---

## 5. Testing expectations (global rules)

Template defaults apply (Jest, co-located specs, shared fixtures in `src/app/testing/`, `HttpTestingController` + `MainResponse<T>` for services, authorized/unauthorized renderings, mirror server validation client-side). This spec's additions: the SP01 fixture set is canonical — no per-file re-mocks; independence tests must assert on **both** UI state and composed PATCH body.

## 6. Execution conventions

Per template. Suggested bundling (record in design §11 if changed): T-01+T-02 one PR (`feat(bilateral): toc catalog read surface`), T-03+T-04 one PR (`feat(bilateral): per-SP toc alignment flow`), T-05 own PR (`refactor(bilateral): retire HLO modal flow`), T-06 no-code, T-07 docs PR.

## 7. Rollout & feature flags

No client flag: the section already exists, the backend controls exposure (`allowed_levels`, `version_locked`, and the reshaped endpoint itself). Rollout = testing (T-06, pre-Wednesday) → staging → prod alongside the backend proxy; the client must not merge to a branch that deploys ahead of the backend reshape (the old envelope would break the new DTO — coordinate the bundled PR, see meeting note on splitting the big PR).

## 8. Rollback plan

- T-01–T-04: `git revert` (additive until T-05).
- T-05: revert restores the modal flow only together with reverting T-04 (template references) — revert as a pair, or roll forward.
- Contract rollback (backend reverts to AOW envelope): client must revert T-01–T-05 jointly; fixtures pin the expected shape so the mismatch is caught in T-06, not prod.

## 9. Open items

- OQ-1 indicator-type filter (BA) → follow-up toggle task once ruled (design D-5 keeps it computed-level).
- OQ-3 outcome-level field label, OQ-6 contribution required-ness — one-line flips if BA disagrees with defaults (D-4/D-9 noted).
- Contributing-project SPs (Nicolette) + registry/ToC versioning (Enrico) → future spec(s) under `bilateral-module/`.
- Indicator-mapping write-side remnants in the backend (old contribution endpoints) — backend repo's archive decision, out of FE scope.

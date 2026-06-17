# Tasks — Pool Funding Alignment: ToC-mapping save/sequencing UX

> Execution units for [`./requirements.md`](./requirements.md) (REQ-BIL-SGU-*) + [`./design.md`](./design.md). Follows [`../../general-setup/task.md`](../../general-setup/task.md). Run via `/sdd-execute` with the [`.agents/`](../../../../.agents/) triad.

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/toc-mapping-save-gating-ux/` |
| Status | Draft — awaiting approval |
| Branch | `AC-1594-bilateral-module` (or a child UX branch) |
| Commands (cwd `research-indicators/`) | `npm run lint` · `npm run test` · `npm run s-lint` · `npm run build` |

## 2. Dependency graph

```
T-BIL-SGU-01 (draft lifecycle fix: upsert + non-re-entrant reconcile)
    └─▶ T-BIL-SGU-02 (UX clarity: Save-disabled hint + sequence copy)
            └─▶ T-BIL-SGU-03 (tests: reveal / upsert / independence / single-save / hint / regression)
```

Critical path: T-01 (the bug fix) is the demo-relevant one; T-02 is small; T-03 locks it in.

## 3. Tasks

### T-BIL-SGU-01 — Draft lifecycle fix (reveal-on-Yes, no save first)

- **Status**: `[x]` completed — PASS attempt 1, 2026-06-17 (see [`./execution.md`](./execution.md))
- **Size**: S
- **Depends on**: none
- **Requirements**: REQ-BIL-SGU-01, REQ-BIL-SGU-02, REQ-BIL-SGU-03
- **Design refs**: §8.1, D-SGU-1, D-SGU-2, D-SGU-4
- **Touches**: `pages/.../pool-funding-alignment/pool-funding-alignment.component.ts`
- **Scope**:
  - Make `onDraftChange` an **upsert**: if no `toc_drafts` entry matches `next.sp_code`, append it (preserve selection order); else replace. Keep the per-SP block-error clearing.
  - Make draft reconciliation **non-re-entrant**: invoke `reconcileDrafts()` after the current signal update settles (e.g. `queueMicrotask` from `onSpSelectionChange`) so its `toc_drafts` write is not clobbered by the multiselect's outer `formData.update` `return { ...current }`. Preserve the D-6a destructive-deselect confirm.
  - Do **not** modify the shared `MultiselectComponent` (D-SGU-1) or the `SpTocAlignmentBlockComponent` (D-SGU-4).
- **Done when**:
  - [ ] Selecting SPs populates `toc_drafts` (one per selected SP, in order); deselecting removes (with confirm when meaningful).
  - [ ] Clicking "Yes" on a freshly-selected, unsaved SP reveals its Level select immediately (manual smoke + spec in T-03).
  - [ ] `npm run lint` + `npm run build` clean.
- **Skills**: `angular-developer`

### T-BIL-SGU-02 — Save-disabled hint + sequence legibility

- **Status**: `pending`
- **Size**: S
- **Depends on**: T-BIL-SGU-01
- **Requirements**: REQ-BIL-SGU-04 (verify), REQ-BIL-SGU-05
- **Design refs**: §8.2, §8.3
- **Touches**: `pool-funding-alignment.component.{ts,html,scss}`
- **Scope**:
  - Add a concise, token-styled inline hint (reuse the page's note pattern, `role="status"`/`aria-live`) that appears when Save is disabled because a rendered "Yes" block is incomplete — e.g. "Complete or clear the in-progress Theory of Change alignment(s) to save."
  - Optional light intro copy clarifying select → map → save is one pass.
  - Verify no block renders inert on "Yes" (loading / empty / error+retry / cascade always present); no block change expected.
- **Done when**:
  - [ ] Disabled Save shows an explanatory hint tied to the incomplete-"Yes" condition (REQ-BIL-SGU-05).
  - [ ] No inert-block path observed for a selected SP answered "Yes" (REQ-BIL-SGU-04).
  - [ ] Tokens only (no hex); `npm run s-lint` clean for changed SCSS; `npm run lint` clean.
- **Skills**: `angular-developer` · `ui-ux-pro-max`

### T-BIL-SGU-03 — Tests

- **Status**: `pending`
- **Size**: S
- **Depends on**: T-BIL-SGU-01, T-BIL-SGU-02
- **Requirements**: REQ-BIL-SGU-01…05, NFR-BIL-SGU-02
- **Design refs**: §11
- **Touches**: `pool-funding-alignment.component.spec.ts`
- **Scope**: extend the page spec (reuse `toc-catalog.fixture.ts`):
  - selecting SPs populates `toc_drafts` (count + order); "Yes" on a freshly-selected SP reveals the cascade with no save (REQ-01); `onDraftChange` upserts a missing draft and records the answer (REQ-02); per-SP independence (edit SP02 → SP06 draft untouched in state + composed PATCH body); single save carries `sp_codes`+`toc_alignments` + pre-fill round-trip (REQ-03); Save-disabled hint visible for an incomplete "Yes" (REQ-05); determinate block state on "Yes" (REQ-04); destructive-deselect confirm still fires (regression).
- **Done when**:
  - [ ] Every REQ-BIL-SGU-* AC has a passing test; `npm run test` green; coverage floors (`jest.config.ts`) hold.
- **Skills**: `angular-developer`

## 4. Requirements coverage matrix

| Requirement | Tasks |
| --- | --- |
| REQ-BIL-SGU-01 | T-01, T-03 |
| REQ-BIL-SGU-02 | T-01, T-03 |
| REQ-BIL-SGU-03 | T-01, T-03 |
| REQ-BIL-SGU-04 | T-02, T-03 |
| REQ-BIL-SGU-05 | T-02, T-03 |
| NFR-BIL-SGU-01 | T-01 (no contract change) |
| NFR-BIL-SGU-02 | T-02, T-03 |

## 5. Execution conventions

Per template. Branch `AC-1594-bilateral-module`; commit tag `[SPEC:bilateral-module/toc-mapping-save-gating-ux]`. No `--no-verify`. Standalone/OnPush/signals only; tokens only; strict TS unchanged.

## 6. Open items

- **OQ-UX-2** (gating for direction): confirm single-save is desired (default yes — D-SGU-3). If an explicit save-gate is wanted instead, T-01 scope changes.
- **OQ-UX-3** (non-gating): keep D-9 ("Yes" requires complete cascade to save) — default yes.
- Out of scope (separate follow-up): the top-level catalog-503 robustness gap (page-level error+retry).

# Design — Pool Funding Alignment: ToC-mapping save/sequencing UX

> Implements [`./requirements.md`](./requirements.md) (REQ-BIL-SGU-*). Follows [`../../general-setup/design.md`](../../general-setup/design.md). Client-only follow-up to [`../toc-mapping-v2/`](../toc-mapping-v2/).

## 1. Document control

| Field | Value |
| --- | --- |
| Spec path | `docs/specs/bilateral-module/toc-mapping-save-gating-ux/` |
| Status | Draft — awaiting approval |
| Created | 2026-06-17 |
| Scope | FE only — `pool-funding-alignment` page + `sp-toc-alignment-block` |

## 2. Executive summary

Root cause (confirmed): selecting SPs never populates `toc_drafts`, because the multiselect emits `selectEvent` *inside* its own `formData.update()` and the page's nested `formData.update` (draft reconciliation) is clobbered by the outer update's `return { ...current }`. With no draft entry, `onDraftChange`'s replace-only `.map` drops the "Yes", so the cascade never reveals until a save rebuilds `toc_drafts` cleanly. The fix is two small, low-risk client changes — **upsert on `onDraftChange`** (a change is never dropped) and a **non-re-entrant draft reconciliation** (selection actually populates `toc_drafts`) — plus light UX clarity (Save-disabled hint). No contract change.

## 3. Architecture overview

Unchanged from `toc-mapping-v2`: the page (`PoolFundingAlignmentComponent`, signals + `FormsModule`, OnPush) owns `formData` (`has_contribution`, `selected_sps`, `toc_drafts`) and renders one `SpTocAlignmentBlockComponent` per selected SP. The block is pure (emits `draftChange`, never mutates inputs). `BilateralService` provides catalog + draft helpers. This spec touches only the page's draft lifecycle + a small UX affordance; the block stays as-is (its reveal logic is already correct given a correct draft).

## 4. Extended directory structure

```
pages/platform/pages/result/pages/pool-funding-alignment/
├── pool-funding-alignment.component.{ts,html,spec.ts}   # reworked (draft lifecycle + Save-hint)
└── components/sp-toc-alignment-block/                    # unchanged (reveal already correct)
shared/components/custom-fields/multiselect/             # NOT modified (see D-SGU-1 rejected option)
```

## 5. Data model

No new types. `SpAlignmentDraft` (view-model) and the wire types are unchanged.

## 6. API design

None. Save continues to use the single `PATCH …/pool-funding-alignment` with `has_contribution` + `sp_codes` + `toc_alignments[]` (REQ-BIL-SGU-03, NFR-BIL-SGU-01).

## 7. Backend module design

N/A — no backend change.

## 8. Frontend / UX component architecture

### 8.1 Draft lifecycle fix (REQ-BIL-SGU-01/02)

Two changes in `PoolFundingAlignmentComponent`:

1. **`onDraftChange` becomes an upsert.** Replace the replace-only `.map` with insert-or-replace: if no `toc_drafts` entry matches `next.sp_code`, append it (preserving selection order where practical). This guarantees a "Yes"/edit is recorded even when the SP's draft is momentarily absent — directly fixing REQ-BIL-SGU-01 and REQ-BIL-SGU-02 (upsert scenario).

2. **Non-re-entrant reconciliation.** Decouple `reconcileDrafts()` from the multiselect's synchronous `selectEvent` so its `formData.update` is not clobbered by the multiselect's outer `return { ...current }`. Run the reconcile **after the current update settles** (e.g. `queueMicrotask(() => this.reconcileDrafts())` from `onSpSelectionChange`). The destructive-deselect confirm (D-6a, `showGlobalAlert`) stays inside `reconcileDrafts` and continues to fire on removal of an SP with a meaningful alignment. This makes `toc_drafts` correctly mirror `selected_sps` on selection (empty drafts for new SPs, dropped for removed), so `canSave`/independence/validation operate on a stable set.

Together: (1) is the critical-path symptom fix; (2) restores the model invariant. Both are confined to the page component.

### 8.2 No inert block (REQ-BIL-SGU-04)

The block already renders loading / empty-(SP,level) / error+retry / cascade states on "Yes" (shipped in `toc-mapping-v2` T-03). Once the draft fix lands, "Yes" reaches those states. Verify no path yields a blank; no block change expected. (The separate top-level catalog-503 robustness gap is tracked elsewhere and is out of scope here.)

### 8.3 Sequence legibility & Save-disabled clarity (REQ-BIL-SGU-05)

Add a concise, token-styled hint near Save (or under the HLO section) that surfaces when Save is disabled due to an incomplete "Yes" block — e.g. "Complete or clear the in-progress Theory of Change alignment(s) to save." Reuse the page's existing inline-note pattern (`role="status"`/`aria-live`). Optional light intro copy clarifying that selecting, mapping, and saving happen in one pass. No new component.

## 9. Shared contracts or package extensions

None. The wrapped `MultiselectComponent` is intentionally **not** modified (D-SGU-1).

## 10. Design decisions

- **D-SGU-1 — Fix the consumer, not the shared multiselect.** The clobber originates in `MultiselectComponent.setValue` emitting inside its own `formData.update`. Rejected: changing the multiselect's emit timing — it's a shared component used app-wide; altering its update/emit ordering risks regressions across every consumer. Instead the page is made resilient (deferred reconcile + upsert), which is the smaller, safer blast radius and also hardens against any future re-entrancy.
- **D-SGU-2 — Upsert + deferred reconcile, not an `effect`.** Rejected: reconciling `toc_drafts` in an `effect()` watching `selected_sps` — an effect that writes the same form signal it reads risks loops and would awkwardly host the destructive-deselect confirm dialog. Deferring the existing `reconcileDrafts` (post-settle) keeps the confirm flow intact with minimal change. Upsert in `onDraftChange` is the defensive guarantee that no answer is ever dropped.
- **D-SGU-3 — Single-save flow retained (no save-gate).** Per OQ-UX-2 default and the verified same-request `sp_codes`+`toc_alignments` contract: select → map → save in one pass. Rejected: an explicit save-then-map gate (adds a trip the platform doesn't need). Revisit only if the team rules otherwise.
- **D-SGU-4 — Block component untouched.** Its reveal/state logic is already correct; the bug is upstream in the page's draft lifecycle. Keeping the block frozen preserves the `toc-mapping-v2` test surface.

## 11. Testing strategy

Co-located Jest specs (extend `pool-funding-alignment.component.spec.ts`): selecting SPs populates `toc_drafts`; "Yes" on a freshly-selected SP reveals the cascade with no save (REQ-01); `onDraftChange` upserts a missing draft (REQ-02); per-SP independence still holds (edit SP02, SP06 untouched); single save carries `sp_codes`+`toc_alignments` and pre-fills on reload (REQ-03); Save-disabled hint shows for an incomplete "Yes" block (REQ-05); destructive-deselect confirm still fires (regression). Reuse the canonical `toc-catalog.fixture.ts`. Lint + full suite green; coverage floors hold; WCAG attributes preserved (NFR-02).

## 12. Risks & mitigations

- **R-1 Re-entrancy hidden elsewhere.** The upsert (D-SGU-2) makes the reveal robust regardless of reconcile timing; mitigates residual re-entrancy.
- **R-2 Deferred reconcile timing visible to user.** The microtask gap is sub-frame; the upsert covers any interaction within it. Mitigation: tests assert post-selection `toc_drafts` state.
- **R-3 Multiselect behavior shared.** Mitigated by D-SGU-1 (fix the consumer, leave the shared component).

## 13. References

- [`./requirements.md`](./requirements.md) · [`./proposal.md`](./proposal.md) (OQ-UX-1 root-cause analysis)
- [`../toc-mapping-v2/design.md`](../toc-mapping-v2/design.md) (D-4/D-6a/D-9, block + page architecture)

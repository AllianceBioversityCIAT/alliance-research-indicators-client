# Archive Summary — Pool Funding Alignment: ToC-mapping save/sequencing UX

## 1. Document control

| Field | Value |
| --- | --- |
| Original spec path | `docs/specs/bilateral-module/toc-mapping-save-gating-ux/` |
| Archive date | 2026-06-17 |
| Archived by | `/sdd-archive` |
| Final status | **Complete** — all tasks `[x]`, Reviewer PASS each (attempt 1) |
| Module | bilateral-module — Pool Funding Alignment tab |
| Branch | `AC-1594-bilateral-module` |
| Relates to | [`../../bilateral-module/toc-mapping-v2/`](../../bilateral-module/toc-mapping-v2/) (the shipped inline per-SP ToC cascade this UX fix corrects) |

## 2. Original spec path

`docs/specs/bilateral-module/toc-mapping-save-gating-ux/` — a bounded client bugfix + UX-clarity follow-up to `toc-mapping-v2`.

## 3. Archive date

2026-06-17.

## 4. Final status

**Complete.** All three tasks delivered and Reviewer-PASS on attempt 1, no rework:

| Task | Commit |
| --- | --- |
| T-BIL-SGU-01 — draft lifecycle fix (reveal-on-Yes, no save first) | `2782c649` |
| T-BIL-SGU-02 — Save-disabled hint + sequence legibility | `dbfa8228` |
| T-BIL-SGU-03 — tests (+14) + spec completion | `538f8eba` |

## 5. Requirements delivered

All discharged: **REQ-BIL-SGU-01** ("Yes" reveals the cascade immediately, no prior save), **-02** (SP selection populates a per-SP draft; `onDraftChange` upserts), **-03** (single-pass select → map → save), **-04** (no inert block — determinate state on "Yes"; verified, no block change), **-05** (Save-disabled hint + sequence legibility); **NFR-BIL-SGU-01** (no contract/backend change), **NFR-BIL-SGU-02** (WCAG AA + tokens preserved).

## 6. Files changed summary

Per `execution.md` — client (page component) only:
- `pages/.../pool-funding-alignment/pool-funding-alignment.component.ts` — `onDraftChange` → order-preserving upsert; `onSpSelectionChange` → `queueMicrotask`-deferred `reconcileDrafts`; new `SAVE_BLOCKED_HINT` + `saveBlockedByIncompleteToc` computed.
- `pages/.../pool-funding-alignment.component.html` — token-styled, a11y Save-disabled hint above the navigation buttons.
- `pages/.../pool-funding-alignment.component.spec.ts` — microtask-flush adaptations (T-01, assertions preserved) + a new 14-test `save-gating-ux` describe (T-03).
- The shared `MultiselectComponent`, `SpTocAlignmentBlockComponent`, and `bilateral.service.ts` were intentionally **not** modified (D-SGU-1 / D-SGU-4).

## 7. Test evidence summary

No standalone `test-report.md` — **absence explicitly accepted**; evidence is in `execution.md`: scoped `pool-funding-alignment` spec **101/101** (87 prior + 14 new), full suite **266 suites / 5363 tests** green, coverage 99.62 / 98.88 / 99.66 / 99.79 (above `jest.config.ts` floors 40/20/45/30), lint + AOT tsc clean. Tests assert genuine behavior (PATCH call args carry both `sp_codes` + `toc_alignments`, SP-draft reference identity for independence, hint DOM presence across 4 cases, etc.).

## 8. Validation summary

No standalone `validation-report.md` — **absence explicitly accepted**: this is a bounded client bugfix executed via the JCSPECS Implementer→Reviewer triad with a Reviewer PASS per task (the Reviewer independently re-ran lint/tsc/tests and audited spec conformance each time). No unresolved FAIL findings.

## 9. Accepted warnings or follow-ups

- **Open follow-up (separate, not part of this spec):** the top-level catalog-503 robustness gap — when `hlos-indicators` cold-cache-503s, `allowed_levels` is unknown so the whole ToC section (and its block-level retry) silently disappears; recommended a small page-level catalog-error banner + Retry. Tracked outside this spec.
- **OQ-UX-2 / OQ-UX-3:** resolved to defaults — single-save flow (no save-gate), D-9 "Yes requires complete cascade to save" retained.

## 10. Historical notes

- **Root cause (OQ-UX-1, confirmed):** `MultiselectComponent.setValue` emits `selectEvent` *inside* its own `formData.update()`; the page's nested draft-reconcile write was clobbered by the outer `return { ...current }`, so `toc_drafts` never populated on SP selection → `onDraftChange`'s replace-only `.map` couldn't record "Yes" → the cascade never revealed until a save rebuilt drafts via `snapshotFromServer`. Hence the user-observed "must save first."
- **Fix shape:** defer the reconcile (`queueMicrotask`) + make `onDraftChange` an upsert; fix the consumer, not the shared multiselect (D-SGU-1).
- **Reusable caution recorded:** the wrapped `custom-fields/select` + `multiselect` emit their `selectEvent` inside their own `signal.update`, so any consumer doing a nested `update` on the same signal will be clobbered — defer it.

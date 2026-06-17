# Execution Log — Pool Funding Alignment: ToC-mapping save/sequencing UX

> Canonical audit trail of the JCSPECS Leader → Implementer → Reviewer loop for [`./tasks.md`](./tasks.md). Appended per task attempt.

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/toc-mapping-save-gating-ux/` |
| Branch | `AC-1594-bilateral-module` |
| Started | 2026-06-17 |
| Personas | `.agents/leader.md` / `.agents/implementer.md` / `.agents/reviewer.md` |

---

## 2. Task execution history

### T-BIL-SGU-01 — Draft lifecycle fix (reveal-on-Yes, no save first) — ✅ PASS (attempt 1) — 2026-06-17

- **Attempts:** 1 (Implementer → Reviewer PASS, no rework)
- **Requirements covered:** REQ-BIL-SGU-01, REQ-BIL-SGU-02, REQ-BIL-SGU-03; NFR-BIL-SGU-01.
- **Files changed:**
  - `research-indicators/src/app/pages/platform/pages/result/pages/pool-funding-alignment/pool-funding-alignment.component.ts` (+23/−21 region): `onDraftChange` → order-preserving **upsert** (replace-in-place when the SP's draft exists, append `[...toc_drafts, next]` when absent; block-error clearing unchanged); `onSpSelectionChange` → **deferred reconcile** `queueMicrotask(() => this.reconcileDrafts())` (clearRejectedSpError stays synchronous; reconcile/sync/D-6a confirm internals untouched). `@sdd-spec` comments on both methods.
  - `…/pool-funding-alignment.component.spec.ts` (timing-only): 2 helpers + 5 existing tests made `async` with `await Promise.resolve()` flushes after `onSpSelectionChange()` to accommodate the microtask deferral; **all original assertions preserved verbatim** (no assertion added/removed — confirmed by the Reviewer's expect-line grep).
- **Implementer verification (cwd `research-indicators/`):** `npm run lint` clean; `npx tsc -p tsconfig.app.json --noEmit` 0 errors; `npm run test -- pool-funding-alignment` 2 suites / 87 tests pass. (Build not run — sandbox Google-Fonts network error; tsc is the agreed gate.)
- **Reviewer verdict:** **PASS** — "`onDraftChange` is an order-preserving upsert; `onSpSelectionChange` defers `reconcileDrafts` via `queueMicrotask` with `clearRejectedSpError` synchronous; reconcile/sync/D-6a internals byte-identical; blast radius = the two named files only (MultiselectComponent, SpTocAlignmentBlockComponent, bilateral.service untouched); no contract/canSave/version/stale/independence change; test edits timing-only with assertions preserved; lint + tsc + 87/87 green." Re-ran lint + tsc + scoped spec independently.
- **Root cause fixed (OQ-UX-1):** the multiselect emits `selectEvent` inside its own `formData.update()`; the page's nested reconcile write was clobbered by the outer `return { ...current }`, so `toc_drafts` never populated on selection → "Yes" couldn't be recorded (replace-only `.map`) → cascade never revealed until a save rebuilt drafts. The deferral fixes the clobber; the upsert guarantees the answer is never dropped.
- **Decisions:** D-SGU-1 (fix the consumer, not the shared multiselect), D-SGU-2 (upsert + deferred reconcile, not an `effect`), D-SGU-4 (block untouched) all honored. Implementer judgment call (Leader-accepted): the spec file was edited for microtask timing despite "ONLY this file" for production — scoped strictly to flush timing, assertions preserved; new behavior tests remain T-BIL-SGU-03's scope.
- **Final verification:** lint clean, tsc 0, 87/87 page spec green; Reviewer re-ran independently.

### T-BIL-SGU-02 — Save-disabled hint + sequence legibility — ✅ PASS (attempt 1) — 2026-06-17

- **Attempts:** 1 (Implementer → Reviewer PASS, no rework)
- **Requirements covered:** REQ-BIL-SGU-05; REQ-BIL-SGU-04 (verified, no change); NFR-BIL-SGU-02, NFR-BIL-SGU-01.
- **Files changed:** `pool-funding-alignment.component.ts` (new `SAVE_BLOCKED_HINT` constant + `saveBlockedByIncompleteToc` computed, `@sdd-spec` comment) + `…component.html` (token-styled inline hint above `<app-navigation-buttons>`). No SCSS (reused existing note utility classes).
- **What it does:** `saveBlockedByIncompleteToc` mirrors `canSave`'s preconditions (`editable && !isReadOnly && isDirty && minimal-selection`) + render gate (`showHloSection && showTocBlocks && !versionLocked`), then narrows to a selected SP whose draft is `aligns_with_toc === true` AND `!isDraftSaveable` (D-9 incomplete "Yes"). Purely additive/read-only — does NOT touch `canSave`/`onSave`/`isDraftSaveable`. The hint (`role="status"`, `aria-live="polite"`, `data-testid="pf-alignment-save-hint"`, `var(--ac-*)` tokens) renders only when that computed is true. Optional sequence-intro copy skipped (existing INFO_BANNER already covers it).
- **REQ-BIL-SGU-04:** re-verified by reading the unmodified block — on "Yes" it always renders loading / error+retry / empty-(SP,level) / cascade; no inert path. No block change.
- **Implementer verification:** `npm run lint` clean; `npx tsc -p tsconfig.app.json --noEmit` 0; `npm run test -- pool-funding-alignment` 87/87.
- **Reviewer verdict:** **PASS** — "purely-additive; computed mirrors canSave then narrows to incomplete-Yes; `canSave`/`onSave`/`isDraftSaveable` byte-identical to baseline; hint a11y + tokens (no hex) per the file's note pattern; blast radius = the two page files; REQ-04 re-verified; lint + tsc + 87/87 green." Re-ran independently.
- **Final verification:** lint clean, tsc 0, 87/87 page spec green.

### T-BIL-SGU-03 — Tests — ✅ PASS (attempt 1) — 2026-06-17

- **Attempts:** 1 (Implementer → Reviewer PASS, no rework)
- **Requirements covered:** REQ-BIL-SGU-01…05, NFR-BIL-SGU-02.
- **Files changed:** `pool-funding-alignment.component.spec.ts` only (+217, a new `describe('save-gating-ux (REQ-BIL-SGU-*)')` of 14 tests). No production code.
- **Coverage added (by REQ):** SGU-02 draft populate (count+order, post-flush) + `onDraftChange` upsert-appends-absent; SGU-01 "Yes" sets `aligns_with_toc===true` with `patchAlignment` not called + persists across CD; SGU-03 one PATCH carrying both `sp_codes`+`toc_alignments` + pre-fill round-trip; per-SP independence (SP02/SP06 10/25 — SP06 ref+value unchanged in state and PATCH body); SGU-05 `saveBlockedByIncompleteToc()` true + `pf-alignment-save-hint` present for incomplete "Yes", false for complete/"No"/unanswered; SGU-04 `catalogState()` ready/loading/error; regression D-6a destructive-deselect confirm (`showGlobalAlert` severity 'delete', chip restored).
- **Implementer verification:** `npm run lint` clean; scoped `pool-funding-alignment` 101/101 (87+14); full `npm run test` 266 suites / 5363 tests green; coverage 99.62/98.88/99.66/99.79 (floors 40/20/45/30 held).
- **Reviewer verdict:** **PASS** — "additive, test-only; genuine non-vacuous assertions (e.g. `patchAlignment` call args include both keys; SP06 ref identity preserved; hint DOM present/absent across 4 cases); deterministic microtask flush; canonical fixtures; 87 prior tests intact; lint + 5363-suite green with floors held." Re-ran lint + scoped + full suite independently.
- **Final verification:** lint clean, 101 scoped / 5363 full suite green, coverage floors held.

---

## 3. Summary — spec complete (2026-06-17)

All three tasks PASS (attempt 1, no rework): **T-BIL-SGU-01** (draft lifecycle fix — the root-cause bug) `2782c649`, **T-BIL-SGU-02** (Save-disabled hint) `dbfa8228`, **T-BIL-SGU-03** (tests) pending commit. REQ-BIL-SGU-01…05 + both NFRs discharged. Net effect: answering "Yes" to align an SP now reveals the cascade immediately (no save-first), drafts populate on selection, Save explains itself when blocked by an incomplete "Yes", and the behavior is locked by 14 new tests. Client-only; no contract/backend change. Suggested follow-up still open (separate): the top-level catalog-503 page-level error+retry robustness gap.

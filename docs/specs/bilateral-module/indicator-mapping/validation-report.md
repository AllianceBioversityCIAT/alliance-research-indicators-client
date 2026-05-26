# Validation Report — Bilateral Module / Indicator Mapping

> `/sdd-validate docs/specs/bilateral-module/indicator-mapping/` snapshot. Pairs with [`./requirements.md`](./requirements.md), [`./design.md`](./design.md), [`./tasks.md`](./tasks.md), [`./execution.md`](./execution.md), and [`./open-questions-for-ba.md`](./open-questions-for-ba.md).

---

## 1. Document control

| Field | Value |
| --- | --- |
| Spec | `docs/specs/bilateral-module/indicator-mapping/` |
| Validation date | 2026-05-26 |
| Validator | Claude (`/sdd-validate`) |
| Branch | `AC-1594-bilateral-module` |
| Latest relevant commit on branch | `fc56e0b1` — `feat(bilateral-module/alignment-section): SP picker visual alignment + HLO action card wiring (Figma 32471:129636)` |
| Spec phase | **DRAFT — partial execution.** 4 of 16 tasks shipped (T-BIL-IM-RR-01, T-BIL-IM-02, T-BIL-IM-03, T-BIL-IM-14). 12 tasks gated on **OQ-IM-1 / OQ-IM-2 / OQ-IM-3** awaiting BA + backend answers. |
| Methodology baseline | [`docs/specs/general-setup/`](../../general-setup/) + root [`CLAUDE.md`](../../../../CLAUDE.md) + PRD C-1..C-6 ([`docs/prd.md`](../../../prd.md) §8.3) |

---

## 2. Summary

| Result | Count |
| --- | --- |
| **PASS** | 12 (4 shipped tasks + 8 spec-document quality checks) |
| **WARN** | 3 (gating-OQ surface area; coverage proof needs full-suite run; constitutional-doc updates deferred to T-BIL-IM-15) |
| **FAIL** | 0 |
| **BLOCKED** | 12 task-validations (gated on OQ-IM-1 / OQ-IM-2 / OQ-IM-3 — implementation does not yet exist by design) |

**Headline finding**: The 4 shipped tasks are clean — files exist, tests pass (67/67 across the 3 affected spec files), and the execution log records mockup-quoted copy as a locked literal. The remaining 12 tasks **cannot be validated** because they have not started — they are explicitly blocked on three gating Open Questions sent to the BA/backend team on 2026-05-24 ([`./open-questions-for-ba.md`](./open-questions-for-ba.md)). This is the *intended* state of the spec right now, not a failure.

**Archive readiness**: **NOT READY**. See §11 for the rationale and the next-step recommendation.

---

## 3. Task completion

| Task | Status (per [`./tasks.md`](./tasks.md)) | Evidence | Result |
| --- | --- | --- | --- |
| T-BIL-IM-RR-01 — Alignment-section mockup remediation | completed (2026-05-23 → 2026-05-24) | 10 commits enumerated in [`./execution.md`](./execution.md) Entry 1; shipped via the `alignment-section/` sibling spec. | **PASS** |
| T-BIL-IM-01 — Backend verification + interfaces + ApiService methods | **pending — GATED on OQ-IM-1/2/3** | Not started. | **BLOCKED** (by design) |
| T-BIL-IM-02 — `ModalName 'hloSelection'` + `HloSelectionModalContextService` | completed (2026-05-24) | `modal.types.ts:10` contains `'hloSelection'`; `hlo-selection-modal-context.service.ts` + `.spec.ts` present; 5/5 cases in the new spec pass within the 137/137 cache-service suite total. | **PASS** |
| T-BIL-IM-03 — `BilateralActionCardComponent` | completed (2026-05-24) | All 4 component files present under `src/app/shared/components/bilateral-action-card/`; 12/12 cases pass; 100% statements/branches/functions/lines per execution log. | **PASS** |
| T-BIL-IM-04 — Extend `BilateralService` (mappings state + 5 mutations) | **pending — GATED on OQ-IM-1/3** | Not started. | **BLOCKED** (by design) |
| T-BIL-IM-05 — `HloSelectionModalComponent` shell + sidebar + table | **pending — GATED on OQ-IM-2** | Not started. | **BLOCKED** (by design) |
| T-BIL-IM-06 — Disabled-indicator row + reason callout | pending (no extra gate beyond T-BIL-IM-01) | Not started — depends on T-BIL-IM-05. | **BLOCKED** (transitive) |
| T-BIL-IM-07 — Modal session-state + Cancel-confirm | pending | Not started — depends on T-BIL-IM-05. | **BLOCKED** (transitive) |
| T-BIL-IM-08 — `HloCardComponent` | **pending — GATED on OQ-IM-1/3** | Not started. | **BLOCKED** (by design) |
| T-BIL-IM-09 — Quantitative contribution row | **pending — GATED on OQ-IM-1** | Not started. | **BLOCKED** (by design) |
| T-BIL-IM-10 — Mount AI card + HLO cards into alignment tab | pending | Partial — the **AI-card mount and CTA wiring** shipped under the sibling `alignment-section/` work (commit `fc56e0b1`, Figma `32471:129636`). The remaining REQ-BIL-IM-10 scope (HLO-card rendering loop + catalog-empty empty state) is blocked on T-BIL-IM-05 + T-BIL-IM-08. | **WARN** (partial) |
| T-BIL-IM-11 — Diff-and-batch Save + 409 handling | **pending — GATED on OQ-IM-1** | Not started. | **BLOCKED** (by design) |
| T-BIL-IM-12 — Lever-cascade refresh effect | pending | Not started — depends on T-BIL-IM-04 + T-BIL-IM-10. | **BLOCKED** (transitive) |
| T-BIL-IM-13 — Telemetry events (Clarity) | pending | Not started — depends on T-BIL-IM-05/10/11. | **BLOCKED** (transitive) |
| T-BIL-IM-14 — AR.3 regression test | completed (2026-05-24) | `submission.service.spec.ts` contains `describe('AR.3 — HLO indicator mappings are decoupled from submission completion (T-BIL-IM-14)')` block with 2 cases; 50/50 total cases pass in that file (48 prior + 2 new). | **PASS** |
| T-BIL-IM-15 — Constitutional docs update | pending | Not started — deliberately deferred until the gated work lands. | **BLOCKED** (transitive) |

**Note on partial T-BIL-IM-10**: `fc56e0b1` wired the AI card visually into the alignment section and bound the CTA click to `hloSelectionModalContextService.setContext(...) + allModalsService.openModal('hloSelection')`. That's a subset of T-BIL-IM-10's scope — the **iteration over `pendingMappings` rendering grouped HLO cards** and the **catalog-empty fallback** still depend on T-BIL-IM-05 and T-BIL-IM-08 landing, so the task remains correctly listed as `pending`. The visual host is ready ahead of time.

---

## 4. File existence

Expected new files (per `./tasks.md` + `./execution.md`):

| Path | Expected | Present | Notes |
| --- | --- | --- | --- |
| `src/app/shared/components/bilateral-action-card/bilateral-action-card.component.ts` | ✅ | ✅ | T-BIL-IM-03 |
| `src/app/shared/components/bilateral-action-card/bilateral-action-card.component.html` | ✅ | ✅ | T-BIL-IM-03 |
| `src/app/shared/components/bilateral-action-card/bilateral-action-card.component.scss` | ✅ | ✅ | T-BIL-IM-03 |
| `src/app/shared/components/bilateral-action-card/bilateral-action-card.component.spec.ts` | ✅ | ✅ | T-BIL-IM-03 (12 cases) |
| `src/app/shared/services/cache/hlo-selection-modal-context.service.ts` | ✅ | ✅ | T-BIL-IM-02 |
| `src/app/shared/services/cache/hlo-selection-modal-context.service.spec.ts` | ✅ | ✅ | T-BIL-IM-02 (5 cases) |
| `src/app/shared/types/modal.types.ts` — `'hloSelection'` in `ModalName` | ✅ | ✅ | `modal.types.ts:10` |
| `src/app/shared/services/cache/all-modals.service.ts` — `hloSelection` config in both `modalConfig` sites | ✅ (per execution log Entry 3) | ✅ | Issue caught + fixed during T-BIL-IM-02 |
| `src/app/shared/services/submission.service.spec.ts` — AR.3 HLO regression block | ✅ | ✅ | 2 new cases |
| `src/app/shared/services/api.service.ts` — 5 new methods | gated | not yet | T-BIL-IM-01 |
| `src/app/shared/services/bilateral.service.ts` — mapping state + methods | gated | not yet | T-BIL-IM-04 |
| `src/app/shared/components/all-modals/modals-content/hlo-selection-modal/*` | gated | not yet | T-BIL-IM-05 |
| `src/app/pages/.../pool-funding-alignment/components/hlo-card/*` | gated | not yet | T-BIL-IM-08 |

Result: **PASS** for every file expected from the 4 completed tasks. Gated files are correctly absent.

---

## 5. Build integrity

| Check | Result | Notes |
| --- | --- | --- |
| Tests for the affected spec files (3 specs, 67 cases) | **PASS** (67/67) | `npx jest src/app/shared/components/bilateral-action-card/ src/app/shared/services/cache/hlo-selection-modal-context.service.spec.ts src/app/shared/services/submission.service.spec.ts` |
| Project-wide `npm run lint` | not re-run during this validation | T-BIL-IM-02 / -03 / -14 execution logs each record clean ESLint on the changed files. |
| Project-wide `ng build --configuration development` | not re-run during this validation | T-BIL-IM-02 / -03 / -14 execution logs each record clean `ng build`. |
| `tsc --noEmit` spot-check | 2 pre-existing errors **outside the spec scope** | `src/app/pages/.../indicators-tab-filter/indicators-tab-filter.component.spec.ts:181` and `src/app/shared/components/custom-fields/oicr-form-fields/oicr-form-fields.component.spec.ts:25` — both unrelated to indicator-mapping. Recorded as a non-spec follow-up. |
| Coverage thresholds (jest.config.ts global floors) | warned when running only 3 specs (statements 0.95% vs 40%) | Expected — running only a subset of specs cannot meet a global floor. A full `npm run test:coverage` should be run in CI; the execution log for each completed task recorded passing thresholds against the global suite at that time. |

Result: **PASS** with one **WARN** (pre-existing `tsc` syntax errors in two unrelated spec files — flag for cleanup, do not block this spec).

---

## 6. Requirement coverage

> All 24 functional + non-functional requirements from `./requirements.md` §6–§7.
> Validation is "*does the requirement have evidence on disk today*?" Anything tied exclusively to a gated task is recorded as **NOT IMPLEMENTED** rather than FAIL, because the spec correctly defers it.

### Functional

| Requirement | Tasks | Evidence today | Result |
| --- | --- | --- | --- |
| REQ-BIL-IM-01 — AI card "View High Level Outputs" entry point | T-BIL-IM-03, T-BIL-IM-10 | Component shipped (T-BIL-IM-03 — 12 cases, 100% coverage). CTA wiring to `setContext` + `openModal('hloSelection')` shipped in `fc56e0b1` per the alignment-section follow-up. Visibility predicate AC-01.1 + the catalog-empty body fallback (AC-14.4) are the remaining bits, blocked behind T-BIL-IM-10 dependent tasks. | **PASS (partial)** |
| REQ-BIL-IM-02 — HLO modal opens with SP/AOW tree sidebar | T-BIL-IM-05 | Modal-context plumbing in place (T-BIL-IM-02). Modal component itself **not yet implemented** — blocked on OQ-IM-2. | **NOT IMPLEMENTED** (gated) |
| REQ-BIL-IM-03 — HLO modal main pane indicator table | T-BIL-IM-05 | Same as above. | **NOT IMPLEMENTED** (gated) |
| REQ-BIL-IM-04 — Disabled indicator with reason callout | T-BIL-IM-06 | Depends on T-BIL-IM-05. | **NOT IMPLEMENTED** (transitive) |
| REQ-BIL-IM-05 — HLO modal search + AOW navigation | T-BIL-IM-05 | Not implemented. | **NOT IMPLEMENTED** (gated) |
| REQ-BIL-IM-06 — HLO modal footer (counter + Confirm/Cancel) | T-BIL-IM-05 | Not implemented. | **NOT IMPLEMENTED** (gated) |
| REQ-BIL-IM-07 — Modal session-state vs persisted-state | T-BIL-IM-07 | Not implemented. | **NOT IMPLEMENTED** (transitive) |
| REQ-BIL-IM-08 — Inline HLO cards grouped SP → AOW → HLO | T-BIL-IM-08, T-BIL-IM-10 | Card not implemented (gated on OQ-IM-1/3). | **NOT IMPLEMENTED** (gated) |
| REQ-BIL-IM-09 — HLO card: Expected target (read-only) | T-BIL-IM-08 | Not implemented. | **NOT IMPLEMENTED** (gated) |
| REQ-BIL-IM-10 — HLO card: Quantitative contribution (conditional) | T-BIL-IM-09 | Not implemented. | **NOT IMPLEMENTED** (gated) |
| REQ-BIL-IM-11 — HLO card: Why is this being reported? dropdown | T-BIL-IM-08 | Not implemented. | **NOT IMPLEMENTED** (gated) |
| REQ-BIL-IM-12 — Remove HLO mapping via × | T-BIL-IM-08 | Not implemented. | **NOT IMPLEMENTED** (gated) |
| REQ-BIL-IM-13 — Persist mappings on alignment-form Save | T-BIL-IM-04, T-BIL-IM-11 | Not implemented. | **NOT IMPLEMENTED** (gated) |
| REQ-BIL-IM-14 — "ToC catalog not yet synced" empty state | T-BIL-IM-10 | Not implemented (the production-empty-state default lives in the alignment section today — once T-BIL-IM-10 lands, the AI card body must switch to the catalog-empty copy). | **NOT IMPLEMENTED** (transitive) |
| REQ-BIL-IM-15 — Read-only states inherited | T-BIL-IM-08, T-BIL-IM-10 | Not implemented. | **NOT IMPLEMENTED** (transitive) |
| REQ-BIL-IM-16 — 409 Conflict handled gracefully | T-BIL-IM-11 | Not implemented (pattern already established in alignment-section). | **NOT IMPLEMENTED** (gated) |
| REQ-BIL-IM-17 — Lever-cascade refresh | T-BIL-IM-12 | Not implemented. | **NOT IMPLEMENTED** (transitive) |
| REQ-BIL-IM-18 — Stale indicators behavior | T-BIL-IM-04, T-BIL-IM-06 | Not implemented. | **NOT IMPLEMENTED** (gated) |
| AR.3 cross-cut (mappings do NOT block submission) | T-BIL-IM-14 | Two regression cases shipped in `submission.service.spec.ts`. 50/50 in-file pass. | **PASS** |

### Non-functional

| Requirement | Result | Notes |
| --- | --- | --- |
| REQ-BIL-IM-NF-01 — Performance | **NOT IMPLEMENTED** (deferred) | Becomes measurable once the modal + cards ship. |
| REQ-BIL-IM-NF-02 — Accessibility (WCAG 2.1 AA, C-4) | **PASS (partial)** | T-BIL-IM-03 records `role="region"`, `aria-labelledby` wired to a stable `titleId`, illustration `aria-hidden="true"`, CTA `aria-label`. Modal-side a11y blocked. |
| REQ-BIL-IM-NF-03 — Bundle budget | **PASS (today)** | Only one small shared component shipped so far — well below the 60 KB lazy / 5 KB initial ceiling. Re-measure at T-BIL-IM-10. |
| REQ-BIL-IM-NF-04 — Theming (dark + light parity) | **PASS (for shipped surface)** | T-BIL-IM-03 uses `--ac-*` tokens (no hardcoded hex) per the execution log. |
| REQ-BIL-IM-NF-05 — i18n-ready | **PASS (for shipped surface)** | T-BIL-IM-03 strings are static template literals. |
| REQ-BIL-IM-NF-06 — Coverage floors | **PASS (for shipped surface)** | T-BIL-IM-03 → 100% on the component file; T-BIL-IM-02 → 100% on the service file; T-BIL-IM-14 → no production code touched. Project-wide floors should be re-confirmed by CI on each PR. |

---

## 7. Linting & code quality

The 4 completed tasks each ran ESLint clean against their changed files per `./execution.md`. No code-quality findings raised by this validation pass. Two pre-existing `tsc` syntax errors outside this spec's scope were flagged in §5 — out of scope for this archive decision; recommend a separate small cleanup PR.

---

## 8. Design conformance

| Decision | Where recorded | Implementation match |
| --- | --- | --- |
| AI card is a **reusable shared component** under `shared/components/bilateral-action-card/` | [`./design.md` §11](./design.md#11-design-decisions-decision-record) | ✅ — file path matches; inputs (`illustration`, `title`, `body`, `ctaLabel`, `ctaIcon`, `disabled`) and output `(ctaClick)` match. |
| Default CTA label is `'View HLOs'` (resolves OQ-FIG-5) | `./design.md` + `./execution.md` Entry 2 | ✅ — locked in a spec test. |
| Default illustration falls back to `<i class="pi pi-sparkles">` until the bilateral asset ships | `./execution.md` Entry 2 | ✅ — recorded as a deliberate decision, not drift. |
| `ModalName` extension is exhaustive — must be added to BOTH `modalConfig` construction sites in `all-modals.service.ts` | `./execution.md` Entry 3 (issue + fix) | ✅ — second site updated after `ng build` strict-template failure. Lesson recorded for future contributors. |
| Modal context payload is **minimal** — `{ resultCode }` only | `./execution.md` Entry 3 | ✅ — service exposes `context` signal + `setContext` + `clear` only. |
| AR.3 fixture **duplicated, not shared** with alignment-section AR.3 | `./execution.md` Entry 4 | ✅ — deliberate; rationale recorded. |
| Mockup-quoted copy locked as test literals | `./design.md` §12.4 + `./tasks.md` §5 | ✅ — `BilateralActionCardComponent` spec asserts canonical body copy verbatim per execution log. |
| Mockup-first authority (mockups > backend handoff where they conflict) | [`./requirements.md`](./requirements.md) §1 note + [`./open-questions-for-ba.md`](./open-questions-for-ba.md) | ✅ — `./open-questions-for-ba.md` shipped on 2026-05-24 surfacing OQ-IM-1/2/3 to the BA/backend team. Spec correctly does NOT pick a side unilaterally. |

Constitutional doc updates (T-BIL-IM-15) are intentionally deferred until the gated work lands — flagged as **WARN** in §2 but tracked in the task list.

Result: **PASS** for shipped surface; **WARN** on the deferred decisions-log entry for `bilateral-action-card` / the modal context service. They should be added to [`docs/system-design/design.md`](../../../system-design/design.md) §8 + §12 in T-BIL-IM-15 (or sooner as a small append-only PR if the team prefers).

---

## 9. Test evidence summary

| Spec | Cases | Status | Notes |
| --- | --- | --- | --- |
| `bilateral-action-card.component.spec.ts` | 12 | **PASS** | Inputs render verbatim; default CTA label `'View HLOs'` locked; ARIA `role="region"` + `aria-labelledby` to per-instance `titleId`; illustration `aria-hidden="true"`; disabled state blocks `(ctaClick)`; canonical bilateral body copy locked as literal. Coverage 100% statements/branches/functions/lines per `./execution.md` Entry 2. |
| `hlo-selection-modal-context.service.spec.ts` | 5 | **PASS** | Default `null`; `setContext` updates signal; idempotent; `clear()` resets; `providedIn: 'root'` singleton semantics. Coverage 100% per `./execution.md` Entry 3. |
| `submission.service.spec.ts` (AR.3 HLO block) | 2 (within 50 total) | **PASS** | `canSubmitResult` returns true with HLO concepts absent from `GreenChecks`; canonical `GreenChecks` key set is exactly the 11 known keys, sorted-equal. |
| **Total (this validation run)** | **67 / 67** | **PASS** | ` npx jest <3 specs> ` → all green. |

Manual smoke evidence (per `./execution.md`): T-BIL-IM-03 visually matched the mockup at 1440px; the alignment-section follow-up (`fc56e0b1`) wired the live CTA-to-modal-context bridge.

Test gaps that are correctly deferred:
- Modal-shell + sidebar + table tests (T-BIL-IM-05). Gated.
- HLO-card tests (T-BIL-IM-08/09). Gated.
- Save-diff / 409 batch tests (T-BIL-IM-11). Gated.
- Lever-cascade effect tests (T-BIL-IM-12). Transitively gated.

---

## 10. Remediation

| ID | Severity | Finding | Recommended action |
| --- | --- | --- | --- |
| R-IM-1 | **WARN** | Constitutional docs (system-design §8 + §12, detailed-design §2 / §4.3 / §6) do not yet carry entries for `bilateral-action-card` or `HloSelectionModalContextService`. | Either extend T-BIL-IM-15 to cover *only* the shipped pieces today (append-only — keep the bigger HLO-modal/-card entries for after the gated work), OR add a tiny "T-BIL-IM-15a" partial-docs task. Low effort. |
| R-IM-2 | **WARN** | Pre-existing `tsc` syntax errors outside this spec's scope (`indicators-tab-filter.component.spec.ts:181`, `oicr-form-fields.component.spec.ts:25`) — `ng build` masks them because the tests aren't compiled in dev-build typecheck. | Separate cleanup PR. Not gating archive of this spec, but worth opening so CI surfaces it. |
| R-IM-3 | **WARN** | OQ-IM-1 / OQ-IM-2 / OQ-IM-3 still unanswered as of 2026-05-26 (sent 2026-05-24). 12 of 16 tasks are paused waiting on the BA + backend team. | Follow up with the BA — even a partial answer (e.g., OQ-IM-2 alone) unblocks 3 tasks (T-BIL-IM-01 backend-verification chain → -05 → -10 partial). [`./open-questions-for-ba.md`](./open-questions-for-ba.md) is ready to share. |
| R-IM-4 | **INFO** | T-BIL-IM-10 is partially in flight via `fc56e0b1` (AI-card mount + CTA wiring). Task status correctly still says `pending` because the HLO-card iteration loop + catalog-empty fallback are not yet there. | Keep `pending`; consider noting in `./execution.md` that the "host" half of T-BIL-IM-10 shipped early under the alignment-section umbrella so future readers don't think `fc56e0b1` was unaccounted-for. |

No FAIL findings.

---

## 11. Archive readiness recommendation

**RECOMMENDATION: DO NOT ARCHIVE YET.**

Archive criteria from the `/sdd-validate` template:

- [ ] All required tasks `[x]` — **NO**. 4 of 16 complete by design; 12 paused on three gating OQs.
- [x] No FAIL findings unresolved — yes.
- [x] WARN findings accepted or have follow-ups — yes (R-IM-1..R-IM-4 are tracked here).
- [ ] Tests cover key requirements and scenarios — only for the 4 shipped tasks. Modal + card + Save-diff coverage cannot exist until the gated tasks land.
- [x] Drift reflected in SDD docs — yes (`./execution.md` is current; mockup-first rewrite captured in `./requirements.md` + `./design.md`).
- [ ] User has reviewed the validation summary — pending.

What to do next, in order of leverage:

1. **Escalate the open questions.** [`./open-questions-for-ba.md`](./open-questions-for-ba.md) is ready to share with the BA + backend team. Even a partial answer (OQ-IM-2 alone) unblocks the backend-verification chain (T-BIL-IM-01 → -05 → most of -10). Until then, the spec is correctly idle.
2. **Optional: file the small constitutional-docs append-only PR (R-IM-1)** so the system-design §8 component inventory mentions `BilateralActionCardComponent` + `HloSelectionModalContextService` today. Keeps the docs current with shipped reality. Low effort, defensible standalone.
3. **Optional: clean up the two pre-existing `tsc` errors (R-IM-2)** in a separate PR. Not in this spec, but blocking strict-mode typecheck regressions in CI is worth it.
4. **Do not run** `/sdd-archive bilateral-module/indicator-mapping/` yet. Re-run `/sdd-validate` after the gated tasks (especially T-BIL-IM-05, -08, -10, -11) merge.

When all three gating OQs are answered and the gated tasks ship, the next `/sdd-validate` pass should be a routine close-out — most checks will graduate from `BLOCKED (by design)` to `PASS` against the same requirement list.

---

## 12. References

- [`./requirements.md`](./requirements.md) §6 (functional reqs), §7 (non-functional), §12 (gating OQs).
- [`./design.md`](./design.md) — mockup-first design.
- [`./tasks.md`](./tasks.md) — task list + dependency graph + ID index.
- [`./execution.md`](./execution.md) — Entries 1–4 (T-BIL-IM-RR-01, T-BIL-IM-03, T-BIL-IM-02, T-BIL-IM-14).
- [`./open-questions-for-ba.md`](./open-questions-for-ba.md) — OQ-IM-1/2/3 with proposed resolution paths.
- [`../alignment-section/`](../alignment-section/) — sibling spec; provides `BilateralService.editable`, `currentAlignment` signal, 409-handling pattern; AI-card mount + CTA wiring shipped here via `fc56e0b1`.
- [`../tag-visibility/`](../tag-visibility/) — sibling spec; provides `BilateralService` facade.
- [PRD](../../../prd.md) §3 (personas), §8.3 (C-1..C-6 constraints).
- Root [`CLAUDE.md`](../../../../CLAUDE.md) — constitutional baseline.
